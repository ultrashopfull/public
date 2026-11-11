import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

const HEARTBEAT_WRITE_THRESHOLD_MS = 5 * 60 * 1000;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { usuario, device_id, client_migration_nonce, producto } = await req.json();
    const prod = (producto || "chatgpt").toLowerCase().trim();

    const COL = prod === "gemini" ? {
      device_id: "device_id_gemini",
      device_last_seen: "device_last_seen_gemini",
      device_label: "device_label_gemini",
      revoke_nonce: "revoke_nonce_gemini",
      migration_nonce: "migration_nonce_gemini",
    } : {
      device_id: "device_id_gpt",
      device_last_seen: "device_last_seen_gpt",
      device_label: "device_label_gpt",
      revoke_nonce: "revoke_nonce_gpt",
      migration_nonce: "migration_nonce_gpt",
    };

    if (!usuario) {
      return new Response(
        JSON.stringify({ activo: false, motivo: "FALTA_USUARIO" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: cliente } = await supabase
      .from("clientes").select("*").eq("usuario", usuario).maybeSingle();

    if (!cliente) {
      return new Response(
        JSON.stringify({ activo: false, motivo: "NO_EXISTE" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const revoke_nonce = cliente[COL.revoke_nonce] || null;
    const migration_nonce = cliente[COL.migration_nonce] || null;
    const migracionPendiente = !!(migration_nonce && client_migration_nonce !== migration_nonce);
    let assignedEmail: string | null = null;
    let assignedPassword: string | null = null;
    let assignedSeed: string | null = null;

    if (cliente.estado === "suspendido" || cliente.estado === "cancelado") {
      return new Response(
        JSON.stringify({
          activo: false, motivo: "SUSPENDIDO", mensaje: "Cuenta suspendida.",
          revoke_nonce,
          migration_nonce: migracionPendiente ? migration_nonce : null,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const deviceAnterior = cliente[COL.device_id];
    if (device_id && deviceAnterior && deviceAnterior !== device_id) {
      return new Response(
        JSON.stringify({
          activo: false, motivo: "OTRO_DISPOSITIVO",
          mensaje: "Tu cuenta se inició en otro dispositivo.",
          device_label: cliente[COL.device_label] || null,
          revoke_nonce,
          migration_nonce: migracionPendiente ? migration_nonce : null,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (device_id) {
      const lastSeen = cliente[COL.device_last_seen] ? new Date(cliente[COL.device_last_seen]).getTime() : 0;
      if (Date.now() - lastSeen > HEARTBEAT_WRITE_THRESHOLD_MS) {
        const upd: Record<string, unknown> = {};
        upd[COL.device_last_seen] = new Date().toISOString();
        await supabase.from("clientes").update(upd).eq("id", cliente.id);
      }
    }

    // ⚠️ FIX CRÍTICO: .ilike en vez de .eq + .maybeSingle en vez de .single
    const { data: suscripcion, error: errSub } = await supabase
      .from("suscripciones")
      .select("*")
      .eq("cliente_id", cliente.id)
      .ilike("producto", prod)                     // ← case-insensitive
      .in("estado", ["activa", "vencida"])
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();                              // ← no lanza si 0 filas

    if (errSub) {
      console.error("[verificar-estado] Error suscripción:", errSub);
      return new Response(
        JSON.stringify({ activo: false, motivo: "ERROR_SERVIDOR", mensaje: errSub.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!suscripcion) {
      return new Response(
        JSON.stringify({
          activo: false, motivo: "SIN_SUSCRIPCION",
          mensaje: `No tienes suscripción activa de ${prod}.`,
          revoke_nonce,
          migration_nonce: migracionPendiente ? migration_nonce : null,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Credenciales de la cuenta maestra asignada. Solo se entregan cuando hay
    // una migración pendiente, para no exponerlas en cada heartbeat.
    if (migracionPendiente) {
      const masterId = suscripcion.cuenta_maestra_id || suscripcion.cuenta_asignada_id;
      if (masterId) {
        const { data: master } = await supabase
          .from("cuentas_maestras")
          .select("email,password,totp_seed")
          .eq("id", masterId)
          .maybeSingle();
        if (master) {
          assignedEmail = master.email || null;
          assignedPassword = master.password || null;
          assignedSeed = master.totp_seed || null;
        }
      }
    }

    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const venc = new Date(suscripcion.fecha_vencimiento + "T00:00:00");
    const diasRestantes = Math.ceil((venc.getTime() - hoy.getTime()) / 86400000);

    if (diasRestantes <= 0) {
      return new Response(
        JSON.stringify({
          activo: false, motivo: "VENCIDO", dias_restantes: 0,
          mensaje: "Tu licencia ha vencido.",
          revoke_nonce,
          migration_nonce: migracionPendiente ? migration_nonce : null,
          assigned_email: assignedEmail,
          assigned_password: assignedPassword,
          totp_seed: assignedSeed,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SECURITY: this endpoint is unauthenticated. Master account credentials
    // are returned ONLY when a migration is pending (migracionPendiente), so the
    // extension can move the client to the new account. On normal heartbeats
    // assigned_email/password/totp_seed are null.
    return new Response(
      JSON.stringify({
        activo: true,
        dias_restantes: diasRestantes,
        estado: cliente.estado,
        fecha_vencimiento: suscripcion.fecha_vencimiento,
        producto: suscripcion.producto,
        revoke_nonce,
        migration_nonce: migracionPendiente ? migration_nonce : null,
        assigned_email: assignedEmail,
        assigned_password: assignedPassword,
        totp_seed: assignedSeed,
        codex_enabled: !!cliente.codex_enabled,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[verificar-estado] catch:", err);
    return new Response(
      JSON.stringify({ activo: false, motivo: "ERROR_SERVIDOR", mensaje: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});