import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), {
    status: s,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { usuario, password, device_id, device_mac, producto } = await req.json();
    const prodInput = (producto || "").toLowerCase().trim();

    if (!usuario || !password) {
      return json({ success: false, motivo: "FALTAN_DATOS", mensaje: "Usuario y contraseña requeridos." }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Hash ficticio: se verifica tambien cuando el usuario no existe para que el
    // tiempo de respuesta no delate si una cuenta existe o no.
    const DUMMY_HASH = "$2a$10$m4d90zFDefzGpJt1bkewhOoV9GzNFT8r1W2Mowli/DV8c.XMLhEf2";

    const { data: cliente, error: errCliente } = await supabase
      .from("clientes").select("*")
      .eq("usuario", usuario)
      .maybeSingle();                       // ← maybeSingle

    if (errCliente) {
      console.error("[login] errCliente:", errCliente);
      return json({ success: false, motivo: "ERROR_SERVIDOR", mensaje: errCliente.message }, 500);
    }

    const { data: passwordOk, error: errPassword } = await supabase.rpc("verify_password", {
      p_password: password,
      p_hash: cliente?.password_hash || DUMMY_HASH,
    });

    if (errPassword) {
      console.error("[login] errPassword:", errPassword);
      return json({ success: false, motivo: "ERROR_SERVIDOR", mensaje: "No se pudo verificar la contraseña." }, 500);
    }

    if (!cliente || passwordOk !== true) {
      await supabase.from("logs_acceso").insert({
        accion: "login", resultado: "fallido",
        device_mac: device_mac || device_id || null,
        user_agent: req.headers.get("user-agent") || null,
      });
      return json({ success: false, motivo: "CREDENCIALES", mensaje: "Usuario o contraseña incorrectos." });
    }

    if (cliente.estado === "suspendido" || cliente.estado === "cancelado") {
      return json({ success: false, motivo: "SUSPENDIDO", mensaje: "Tu cuenta está suspendida." });
    }

    let susQuery = supabase
      .from("suscripciones").select("*")
      .eq("cliente_id", cliente.id)
      .in("estado", ["activa", "vencida"])
      .order("id", { ascending: false })
      .limit(1);
    if (prodInput) susQuery = susQuery.ilike("producto", prodInput);
    const { data: suscripcion, error: errSub } = await susQuery.maybeSingle();

    if (errSub) {
      console.error("[login] errSub:", errSub);
      return json({ success: false, motivo: "ERROR_SERVIDOR", mensaje: errSub.message }, 500);
    }

    if (!suscripcion) {
      return json({
        success: false, motivo: "SIN_SUSCRIPCION",
        mensaje: prodInput
          ? `No tienes una suscripción activa de ${prodInput}.`
          : "No tienes una suscripción activa.",
      });
    }

    const prod = (suscripcion.producto || prodInput || "chatgpt").toLowerCase().trim();

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

    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const venc = new Date(suscripcion.fecha_vencimiento + "T00:00:00");
    const diasRestantes = Math.ceil((venc.getTime() - hoy.getTime()) / 86400000);

    if (diasRestantes <= 0) {
      await supabase.from("suscripciones").update({ estado: "vencida" }).eq("id", suscripcion.id);
      await supabase.from("clientes").update({ estado: "vencido" }).eq("id", cliente.id);
      await supabase.from("logs_acceso").insert({
        cliente_id: cliente.id, accion: "login", resultado: "bloqueado",
        device_mac: device_mac || device_id || null,
      });
      return json({
        success: false, motivo: "VENCIDO",
        mensaje: "Tu licencia ha vencido.", dias_restantes: 0,
      });
    }

    const { data: productoRow } = await supabase
      .from("productos").select("id").ilike("nombre", prod).maybeSingle();
    const productoId = productoRow?.id || null;

    if (!productoId) {
      return json({
        success: false, motivo: "SIN_PRODUCTO",
        mensaje: `El producto "${prod}" no existe en la tabla productos.`,
      });
    }

    let cuentaMaestra = null;

    if (suscripcion.cuenta_asignada_id) {
      const { data } = await supabase
        .from("cuentas_maestras").select("*")
        .eq("id", suscripcion.cuenta_asignada_id)
        .eq("producto_id", productoId)
        .in("estado", ["activa", "Disponible"])
        .maybeSingle();
      cuentaMaestra = data;
    }

    if (!cuentaMaestra) {
      const { data } = await supabase
        .from("cuentas_maestras").select("*")
        .eq("producto_id", productoId)
        .in("estado", ["activa", "Disponible"])
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();
      cuentaMaestra = data;

      if (cuentaMaestra) {
        await supabase.from("suscripciones").update({
          cuenta_asignada_id: cuentaMaestra.id,
          cuenta_maestra_id: cuentaMaestra.id,
        }).eq("id", suscripcion.id);
      }
    }

    if (!cuentaMaestra) {
      return json({
        success: false, motivo: "SIN_CUENTA",
        mensaje: `No hay cuentas de ${prod} disponibles.`,
      });
    }

    const deviceIdent = device_id || device_mac || null;
    const dispositivoAnterior = cliente[COL.device_id];
    const userAgent = req.headers.get("user-agent") || null;

    let etiqueta = "Desconocido";
    if (userAgent) {
      const ua = userAgent.toLowerCase();
      if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("android")) etiqueta = "Móvil";
      else if (ua.includes("macintosh") || ua.includes("mac os")) etiqueta = "Mac";
      else if (ua.includes("windows")) etiqueta = "Windows";
      else if (ua.includes("linux")) etiqueta = "Linux";
    }

    if (deviceIdent && dispositivoAnterior && dispositivoAnterior !== deviceIdent) {
      await supabase.from("logs_acceso").insert({
        cliente_id: cliente.id, accion: "desplazamiento",
        resultado: "otro_dispositivo",
        device_mac: deviceIdent, user_agent: userAgent,
      });
    }

    if (deviceIdent) {
      const upd: Record<string, unknown> = {};
      upd[COL.device_id] = deviceIdent;
      upd[COL.device_last_seen] = new Date().toISOString();
      upd[COL.device_label] = etiqueta;
      await supabase.from("clientes").update(upd).eq("id", cliente.id);
    }

    await supabase.from("logs_acceso").insert({
      cliente_id: cliente.id, accion: "login", resultado: "exitoso",
      device_mac: deviceIdent, user_agent: userAgent,
    });

    return json({
      success: true,
      cliente: {
        id: cliente.id, usuario: cliente.usuario,
        rol: cliente.rol, estado: cliente.estado,
      },
      suscripcion: {
        id: suscripcion.id, producto: suscripcion.producto,
        fecha_vencimiento: suscripcion.fecha_vencimiento,
        dias_restantes: diasRestantes,
        dias_totales: suscripcion.dias_totales,
      },
      credenciales: {
        email: cuentaMaestra.email,
        password: cuentaMaestra.password,
        totp_seed: cuentaMaestra.totp_seed || null,
        account_type: prod,
      },
      revoke_nonce: cliente[COL.revoke_nonce] || null,
      migration_nonce: cliente[COL.migration_nonce] || null,
    });
  } catch (err) {
    console.error("[login] catch:", err);
    return json({ success: false, motivo: "ERROR_SERVIDOR", mensaje: String(err) }, 500);
  }
});