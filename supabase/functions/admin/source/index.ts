import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

const todayStr = () => new Date().toISOString().split("T")[0];

// Hash ficticio para igualar tiempos cuando el usuario no existe.
const DUMMY_HASH = "$2a$10$m4d90zFDefzGpJt1bkewhOoV9GzNFT8r1W2Mowli/DV8c.XMLhEf2";

async function hashPassword(sb: any, password: string): Promise<string> {
  const { data, error } = await sb.rpc("hash_password", { p_password: String(password) });
  if (error || !data) throw new Error(error?.message || "No se pudo generar el hash de la contraseña.");
  return data as string;
}

async function verifyPassword(sb: any, password: string, hash: string | null): Promise<boolean> {
  const { data, error } = await sb.rpc("verify_password", {
    p_password: String(password),
    p_hash: hash || DUMMY_HASH,
  });
  if (error) throw new Error(error.message);
  return data === true;
}
function addDays(date: string, days: number): string {
  const d = new Date(date.substring(0, 10) + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}
function daysBetween(a: string | null, b: string | null): number {
  if (!a || !b) return 0;
  const x = Date.parse(a.substring(0, 10) + "T00:00:00Z");
  const y = Date.parse(b.substring(0, 10) + "T00:00:00Z");
  if (isNaN(x) || isNaN(y)) return 0;
  return Math.round((y - x) / 86400000);
}

async function checkAuth(req: Request, sb: any): Promise<Response | null> {
  const got = (req.headers.get("authorization") || "").trim();
  if (!got) return json({ success: false, mensaje: "No autorizado" }, 401);

  // Option 1: Legacy ADMIN_TOKEN (kept for backward compatibility)
  const adminToken = (Deno.env.get("ADMIN_TOKEN") || "").trim();
  if (adminToken && (got === adminToken || got === `Bearer ${adminToken}`)) return null;

  // Option 2: Staff credentials encoded as Base64 "usuario:contraseña"
  // The panel sends: btoa(username + ':' + password)
  const raw = got.startsWith("Bearer ") ? got.slice(7) : got;
  try {
    const decoded = atob(raw);
    const colon = decoded.indexOf(":");
    if (colon < 1) return json({ success: false, mensaje: "No autorizado" }, 401);
    const username = decoded.slice(0, colon).trim();
    const password = decoded.slice(colon + 1);
    if (!username || !password) return json({ success: false, mensaje: "No autorizado" }, 401);

    // Validate against staff table (table: usuarios, password col: password)
    const { data: staffRow } = await sb
      .from("usuarios")
      .select("id, rol, username, password")
      .ilike("username", username)
      .maybeSingle();
    if (!staffRow) return json({ success: false, mensaje: "No autorizado" }, 401);

    const { data: pwOk } = await sb.rpc("verify_password", {
      p_password: password,
      p_hash: staffRow.password || "$2a$10$m4d90zFDefzGpJt1bkewhOoV9GzNFT8r1W2Mowli/DV8c.XMLhEf2",
    });
    if (pwOk !== true) return json({ success: false, mensaje: "No autorizado" }, 401);
    if (staffRow.rol !== "admin") return json({ success: false, mensaje: "Se requiere rol admin" }, 403);
    return null;
  } catch {
    return json({ success: false, mensaje: "No autorizado" }, 401);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  // Build Supabase client first (needed for auth check)
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const authErr = await checkAuth(req, sb); if (authErr) return authErr;

  try {
    const url = new URL(req.url);
    const accion = url.searchParams.get("accion") || "";
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const ip = req.headers.get("x-forwarded-for") || null;
    const ua = req.headers.get("user-agent") || null;

    // --- panel sync: instantanea coherente para el panel nuevo ---
    if (accion === "panel_sync") {
      const { data, error } = await sb.rpc("ultrashop_panel_snapshot");
      if (error) return json({ success: false, mensaje: error.message, code: error.code }, 500);
      return json({ success: true, snapshot: data });
    }

    // --- panel action: escritura idempotente por operation_id ---
    if (accion === "panel_action") {
      const { operation_id, expected_revision, command } = body || {};
      if (!operation_id || !command) return json({ success: false, mensaje: "Operación inválida" }, 400);
      const payload = body?.payload && typeof body.payload === "object" ? { ...body.payload } : {};
      // The SQL function stores whatever it receives. Hash new client/staff
      // passwords here so full mode never reintroduces plaintext passwords.
      if (
        ["client.create", "staff.save", "profile.save"].includes(command) &&
        typeof payload.password === "string" && payload.password
      ) {
        try {
          payload.password = await hashPassword(sb, payload.password);
        } catch (e) {
          return json({ success: false, mensaje: (e as Error).message }, 500);
        }
      }
      const { data, error } = await sb.rpc("ultrashop_panel_action", {
        operation_id,
        expected_revision: expected_revision ?? 0,
        command,
        payload,
      });
      if (error) {
        const conflict =
          error.code === "P0409" ||
          error.code === "40001" ||
          /Los datos cambiaron en otra sesi[oó]n/i.test(error.message || "");
        return json(
          { success: false, mensaje: error.message, code: error.code },
          conflict ? 409 : 400,
        );
      }
      return json(data);
    }

    // --- panel operation: estado de una operación pendiente ---
    if (accion === "panel_operation") {
      const id = url.searchParams.get("id");
      if (!id) return json({ success: false, mensaje: "id requerido" }, 400);
      const { data, error } = await sb
        .from("ultrashop_panel_operations")
        .select("result")
        .eq("id", id)
        .maybeSingle();
      if (error) return json({ success: false, mensaje: error.message }, 500);
      return json({ success: true, result: data?.result || null });
    }

    // --- staff login ---
    if (accion === "staff_login") {
      const { username, password } = body;
      if (!username || !password) return json({ success: false, mensaje: "Credenciales inválidas" });
      // maybeSingle evita filtrar un error de PostgREST cuando el usuario no existe.
      const { data: staff, error } = await sb.from("usuarios").select("*").eq("username", username).maybeSingle();
      if (error) return json({ success: false, mensaje: "No se pudo verificar el acceso." }, 500);
      const ok = await verifyPassword(sb, password, staff?.password || null);
      if (!staff || !ok) return json({ success: false, mensaje: "Credenciales inválidas" });
      return json({ success: true, staff: { id: staff.id, username: staff.username, full_name: staff.nombre_completo, role: staff.rol, license_ids: [] } });
    }

    // --- dashboard ---
    if (accion === "dashboard" || accion === "stats") {
      const today = todayStr();
      const [{ data: clientes }, { data: sus }, { data: cuentas }] = await Promise.all([
        sb.from("clientes").select("id,estado"),
        sb.from("suscripciones").select("cliente_id,estado,fecha_vencimiento"),
        sb.from("cuentas_maestras").select("id,estado"),
      ]);
      let activos = 0, vencidos = 0, suspendidos = 0;
      const subByClient: Record<number, any[]> = {};
      (sus || []).forEach((s: any) => (subByClient[s.cliente_id] ||= []).push(s));
      (clientes || []).forEach((c: any) => {
        if (c.estado === "suspendido" || c.estado === "cancelado") { suspendidos++; return; }
        const mine = subByClient[c.id] || [];
        const hasActive = mine.some((s: any) => s.estado === "activa" && s.fecha_vencimiento >= today);
        if (hasActive) activos++; else vencidos++;
      });
      const expiring = (sus || []).filter((s: any) => s.estado === "activa" && s.fecha_vencimiento >= today && s.fecha_vencimiento <= addDays(today, 7)).length;
      const masterActive = (cuentas || []).filter((m: any) => m.estado === "activa" || m.estado === "Disponible").length;
      const masterBanned = (cuentas || []).filter((m: any) => m.estado === "baneada" || m.estado === "Baneada").length;
      return json({ success: true, dashboard: {
        clientes_activos: activos, clientes_vencidos: vencidos, clientes_suspendidos: suspendidos,
        vencen_esta_semana: expiring, ingresos_mes_actual: 0,
        cuentas_activas: masterActive, cuentas_baneadas: masterBanned,
      }});
    }

    // --- listar_clientes ---
    if (accion === "listar_clientes") {
      const [{ data: clientes }, { data: sus }, { data: cuentas }, { data: productos }] = await Promise.all([
        sb.from("clientes").select("*").order("id", { ascending: false }),
        sb.from("suscripciones").select("*"),
        sb.from("cuentas_maestras").select("*"),
        sb.from("productos").select("*"),
      ]);
      const prodMap: Record<number, string> = {};
      (productos || []).forEach((p: any) => (prodMap[p.id] = p.nombre));
      const cuentaMap: Record<number, any> = {};
      (cuentas || []).forEach((c: any) => (cuentaMap[c.id] = c));
      const subByClient: Record<number, any[]> = {};
      (sus || []).forEach((s: any) => (subByClient[s.cliente_id] ||= []).push(s));
      const today = todayStr();
      const list = (clientes || []).map((c: any) => {
        const mine = subByClient[c.id] || [];

        // ✅ FIX 2: ordenar por id descendente → la suscripción MÁS RECIENTE primero
        mine.sort((a: any, b: any) => Number(b.id) - Number(a.id));

        const prods = [...new Set(mine.map((s: any) => s.producto).filter(Boolean))];
        const actives = mine.filter((s: any) => s.estado === "activa" && s.fecha_vencimiento >= today);
        const maxD = actives.length ? Math.max(...actives.map((s: any) => daysBetween(today, s.fecha_vencimiento))) : 0;
        const maxFecha = actives.length ? actives.reduce((a: any, s: any) => (a && a > s.fecha_vencimiento ? a : s.fecha_vencimiento), null) : null;
        const cm = mine.length && mine[0].cuenta_asignada_id ? cuentaMap[mine[0].cuenta_asignada_id] : null;
        return {
          id: c.id, usuario: c.usuario, nombre_completo: c.nombre_completo, email: c.email,
          telefono: c.telefono, estado_cliente: c.estado, productos: prods.length ? prods : ["chatgpt"],
          dias_restantes: maxD, fecha_vencimiento: maxFecha,
          dias_totales: mine[0]?.dias_totales || 30,
          cuenta_maestra_email: cm?.email || null,
        };
      });
      return json({ success: true, clientes: list });
    }

    // --- crear_cliente ---
    if (accion === "crear_cliente") {
      const { usuario, password, email, telefono, nombre_completo, dias, productos } = body;
      if (!usuario || !password) return json({ success: false, mensaje: "Usuario y contraseña requeridos" });
      const passwordHash = await hashPassword(sb, password);
      const { data: nc, error: e1 } = await sb.from("clientes").insert({
        usuario: String(usuario).trim(), password_hash: passwordHash,
        email: email || null, telefono: telefono || null,
        nombre_completo: nombre_completo || null, estado: "activo",
      }).select("id").single();
      if (e1) return json({ success: false, mensaje: e1.code === "23505" ? `Usuario "${usuario}" ya existe` : e1.message });
      const daysNum = Math.max(1, Number(dias) || 30);
      const fecha = addDays(todayStr(), daysNum);
      const prods = Array.isArray(productos) && productos.length ? productos : ["chatgpt"];
      for (const prod of prods) {
        // find master
        const { data: prodRow } = await sb.from("productos").select("id").ilike("nombre", prod).single();
        let masterId = null;
        if (prodRow) {
          const { data: masters } = await sb.from("cuentas_maestras").select("id").eq("producto_id", prodRow.id).in("estado", ["activa", "Disponible"]).limit(1);
          masterId = masters?.[0]?.id || null;
        }
        await sb.from("suscripciones").insert({
          cliente_id: nc.id, producto: prod, estado: "activa",
          fecha_vencimiento: fecha, dias_restantes: daysNum, dias_totales: daysNum,
          cuenta_asignada_id: masterId, cuenta_maestra_id: masterId, activo: true,
        });
      }
      return json({ success: true, cliente_id: nc.id });
    }

    // --- editar_cliente ---
    if (accion === "editar_cliente") {
      const { cliente_id, usuario, nombre_completo, email, telefono, password, productos, dias_nuevas_suscripciones, producto, dias, fecha_vencimiento, dias_totales } = body;
      if (!cliente_id) return json({ success: false, mensaje: "cliente_id requerido" });
      const upd: any = {};
      if (usuario !== undefined) upd.usuario = String(usuario).trim();
      if (nombre_completo !== undefined) upd.nombre_completo = nombre_completo;
      if (email !== undefined) upd.email = email;
      if (telefono !== undefined) upd.telefono = telefono;
      if (password) upd.password_hash = await hashPassword(sb, password);
      upd.actualizado_en = new Date().toISOString();
      if (Object.keys(upd).length) {
        const { error } = await sb.from("clientes").update(upd).eq("id", cliente_id);
        if (error) return json({ success: false, mensaje: error.code === "23505" ? "Ese usuario ya existe" : error.message });
      }
      const today = todayStr();
      const { data: actuales } = await sb.from("suscripciones").select("*").eq("cliente_id", cliente_id);
      const porProd: Record<string, any> = {};
      (actuales || []).forEach((s: any) => (porProd[String(s.producto || "").toLowerCase()] = s));

      // Actualizar la suscripcion del producto que se esta editando
      if (producto && (dias !== undefined || fecha_vencimiento !== undefined)) {
        const prod = String(producto).toLowerCase();
        const fecha = fecha_vencimiento || addDays(today, Math.max(0, Number(dias) || 0));
        const restantes = Math.max(0, daysBetween(today, fecha));
        const totales = Math.max(Number(dias_totales) || 0, restantes);
        const estado = restantes > 0 ? "activa" : "vencida";
        if (porProd[prod]) {
          await sb.from("suscripciones").update({
            fecha_vencimiento: fecha, dias_restantes: restantes,
            dias_totales: totales, estado, activo: restantes > 0,
          }).eq("id", porProd[prod].id);
        } else {
          const { data: prodRow } = await sb.from("productos").select("id").ilike("nombre", prod).single();
          let masterId = null;
          if (prodRow) {
            const { data: masters } = await sb.from("cuentas_maestras").select("id").eq("producto_id", prodRow.id).in("estado", ["activa", "Disponible"]).limit(1);
            masterId = masters?.[0]?.id || null;
          }
          await sb.from("suscripciones").insert({
            cliente_id, producto: prod, estado,
            fecha_vencimiento: fecha, dias_restantes: restantes, dias_totales: totales,
            cuenta_asignada_id: masterId, cuenta_maestra_id: masterId, activo: restantes > 0,
          });
        }
      }

      // Agregar nuevos productos (no cancela los existentes)
      const nDays = Math.max(1, Number(dias_nuevas_suscripciones) || 30);
      const nFecha = addDays(today, nDays);
      if (Array.isArray(productos)) {
        for (const prod of productos) {
          if (!porProd[prod]) {
            const { data: prodRow } = await sb.from("productos").select("id").ilike("nombre", prod).single();
            let masterId = null;
            if (prodRow) {
              const { data: masters } = await sb.from("cuentas_maestras").select("id").eq("producto_id", prodRow.id).in("estado", ["activa", "Disponible"]).limit(1);
              masterId = masters?.[0]?.id || null;
            }
            await sb.from("suscripciones").insert({
              cliente_id, producto: prod, estado: "activa",
              fecha_vencimiento: nFecha, dias_restantes: nDays, dias_totales: nDays,
              cuenta_asignada_id: masterId, cuenta_maestra_id: masterId, activo: true,
            });
          }
        }
        for (const s of actuales || []) {
          if (!productos.map((x: any) => String(x).toLowerCase()).includes(String(s.producto || "").toLowerCase())) {
            await sb.from("suscripciones").update({ estado: "cancelada", activo: false }).eq("id", s.id);
          }
        }
      }
      return json({ success: true });
    }

    // --- renovar ---
    if (accion === "renovar") {
      const { cliente_id, dias, monto, metodo, referencia, producto } = body;
      if (!cliente_id) return json({ success: false, mensaje: "cliente_id requerido" });
      const prod = (producto || "chatgpt").toLowerCase();
      const daysNum = Math.max(1, Number(dias) || 30);
      const today = todayStr();
      const { data: subs } = await sb.from("suscripciones").select("*").eq("cliente_id", cliente_id).ilike("producto", prod).order("id", { ascending: false }).limit(1);
      const sub = subs?.[0];
      if (sub) {
        const base = (sub.fecha_vencimiento && sub.fecha_vencimiento > today) ? sub.fecha_vencimiento : today;
        const newFecha = addDays(base, daysNum);
        await sb.from("suscripciones").update({
          estado: "activa", fecha_vencimiento: newFecha,
          dias_restantes: daysBetween(today, newFecha), dias_totales: Number(sub.dias_totales || 0) + daysNum, activo: true,
        }).eq("id", sub.id);
      } else {
        const fecha = addDays(today, daysNum);
        let masterId = null;
        const { data: prodRow } = await sb.from("productos").select("id").ilike("nombre", prod).single();
        if (prodRow) {
          const { data: masters } = await sb.from("cuentas_maestras").select("id").eq("producto_id", prodRow.id).in("estado", ["activa", "Disponible"]).limit(1);
          masterId = masters?.[0]?.id || null;
        }
        await sb.from("suscripciones").insert({
          cliente_id, producto: prod, estado: "activa",
          fecha_vencimiento: fecha, dias_restantes: daysNum, dias_totales: daysNum,
          cuenta_asignada_id: masterId, cuenta_maestra_id: masterId, activo: true,
        });
      }
      await sb.from("clientes").update({ estado: "activo" }).eq("id", cliente_id);
      const m = Number(monto) || 0;
      if (m > 0) {
        await sb.from("pagos").insert({ cliente_id, monto: m, moneda: "BOB", metodo: metodo || "efectivo", referencia: referencia || null });
      }
      return json({ success: true });
    }

    // --- suspender / reactivar ---
    if (accion === "suspender") {
      const { cliente_id } = body;
      if (!cliente_id) return json({ success: false, mensaje: "cliente_id requerido" });
      await sb.from("clientes").update({ estado: "suspendido" }).eq("id", cliente_id);
      return json({ success: true });
    }
    if (accion === "reactivar") {
      const { cliente_id } = body;
      if (!cliente_id) return json({ success: false, mensaje: "cliente_id requerido" });
      await sb.from("clientes").update({ estado: "activo" }).eq("id", cliente_id);
      return json({ success: true });
    }

    // --- revocar_acceso / revocar_todos ---
    if (accion === "revocar_acceso") {
      const { cliente_id, producto } = body;
      if (!cliente_id) return json({ success: false, mensaje: "cliente_id requerido" });
      const nonce = crypto.randomUUID();
      const upd: any = { revoke_nonce: nonce };
      if (String(producto || "").toLowerCase().includes("gemini")) upd.revoke_nonce_gemini = nonce;
      else upd.revoke_nonce_gpt = nonce;
      await sb.from("clientes").update(upd).eq("id", cliente_id);
      return json({ success: true });
    }

    if (accion === "revocar_todos") {
      // ✅ FIX 3: actualizar los 3 campos (genérico + gpt + gemini)
      const nonce = crypto.randomUUID();
      await sb.from("clientes").update({
        revoke_nonce: nonce,
        revoke_nonce_gpt: nonce,
        revoke_nonce_gemini: nonce,
      }).neq("id", 0);
      return json({ success: true, afectados: 0 });
    }

    // --- migrar_cuenta ---
    if (accion === "migrar_cuenta") {
      const { cliente_id, nueva_cuenta_id, producto } = body;
      if (!cliente_id || !nueva_cuenta_id) return json({ success: false, mensaje: "Datos incompletos" });
      const prod = (producto || "chatgpt").toLowerCase();

      // ✅ FIX 1: actualizar TODAS las suscripciones del producto (sin .limit(1))
      const { error: eUpd } = await sb
        .from("suscripciones")
        .update({ cuenta_asignada_id: nueva_cuenta_id, cuenta_maestra_id: nueva_cuenta_id })
        .eq("cliente_id", cliente_id)
        .ilike("producto", prod);

      if (eUpd) {
        console.error("[migrar_cuenta] Error actualizando suscripciones:", eUpd);
        return json({ success: false, mensaje: eUpd.message });
      }

      // Generar nuevo nonce → dispara migración en la extensión
      const nonce = crypto.randomUUID();
      const upd: any = { migration_nonce: nonce };
      if (prod.includes("gemini")) upd.migration_nonce_gemini = nonce;
      else upd.migration_nonce_gpt = nonce;
      await sb.from("clientes").update(upd).eq("id", cliente_id);

      return json({ success: true });
    }

    // --- resetear_password_cliente ---
    if (accion === "resetear_password_cliente") {
      const { cliente_id } = body;
      if (!cliente_id) return json({ success: false, mensaje: "cliente_id requerido" });
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
      let nueva = "";
      for (let i = 0; i < 10; i++) nueva += chars[Math.floor(Math.random() * chars.length)];
      const passwordHash = await hashPassword(sb, nueva);
      const { error } = await sb.from("clientes").update({ password_hash: passwordHash, actualizado_en: new Date().toISOString() }).eq("id", cliente_id);
      if (error) return json({ success: false, mensaje: error.message });
      return json({ success: true, password: nueva });
    }

    // --- listar_cuentas ---
    if (accion === "listar_cuentas") {
      const prod = url.searchParams.get("producto");
      let prodId: number | null = null;
      const { data: productos } = await sb.from("productos").select("*");
      const prodMap: Record<number, string> = {};
      (productos || []).forEach((p: any) => (prodMap[p.id] = p.nombre));
      if (prod) {
        const p = (productos || []).find((x: any) => String(x.nombre).toLowerCase() === prod.toLowerCase());
        prodId = p?.id || null;
        if (!prodId) return json({ success: true, cuentas: [] });
      }
      let q = sb.from("cuentas_maestras").select("*").order("id", { ascending: false });
      if (prodId) q = q.eq("producto_id", prodId);
      const { data, error } = await q;
      if (error) return json({ success: false, mensaje: error.message });
      const ids = (data || []).map((m: any) => m.id);
      const counts: Record<number, number> = {};
      if (ids.length) {
        const { data: subs } = await sb.from("suscripciones").select("cuenta_asignada_id").in("cuenta_asignada_id", ids);
        (subs || []).forEach((s: any) => { if (s.cuenta_asignada_id) counts[s.cuenta_asignada_id] = (counts[s.cuenta_asignada_id] || 0) + 1; });
      }
      return json({ success: true, cuentas: (data || []).map((m: any) => ({
        id: m.id, producto: prodMap[m.producto_id] || prod || null, email: m.email, password: m.password,
        totp_seed: m.totp_seed, estado: m.estado, fecha_alta: m.fecha_alta, notas: m.notas,
        active_subs: counts[m.id] || 0,
      })) });
    }

    // --- crear_cuenta ---
    if (accion === "crear_cuenta") {
      const { producto, email, password, totp_seed, notas } = body;
      if (!email || !password) return json({ success: false, mensaje: "Email y contraseña requeridos" });
      // find or create product
      let prodId: number | null = null;
      const { data: p } = await sb.from("productos").select("id").ilike("nombre", producto || "chatgpt").single();
      if (p) prodId = p.id;
      else {
        const { data: np } = await sb.from("productos").insert({ nombre: producto || "chatgpt" }).select("id").single();
        prodId = np?.id || null;
      }
      if (!prodId) return json({ success: false, mensaje: "Producto no encontrado" });
      const { data, error } = await sb.from("cuentas_maestras").insert({
        producto_id: prodId, email: String(email).trim(), password: String(password),
        totp_seed: totp_seed || null, notas: notas || null, estado: "activa",
      }).select("id").single();
      if (error) return json({ success: false, mensaje: error.message });
      return json({ success: true, cuenta_id: data.id, id: data.id });
    }

    // --- cambiar_estado_cuenta ---
    if (accion === "cambiar_estado_cuenta") {
      const { cuenta_id, nuevo_estado } = body;
      if (!cuenta_id) return json({ success: false, mensaje: "cuenta_id requerido" });
      await sb.from("cuentas_maestras").update({ estado: nuevo_estado }).eq("id", cuenta_id);
      return json({ success: true });
    }

    // --- editar_cuenta ---
    if (accion === "editar_cuenta") {
      const { cuenta_id, email, password, totp_seed, notas, producto } = body;
      if (!cuenta_id) return json({ success: false, mensaje: "cuenta_id requerido" });
      const upd: any = {};
      if (email !== undefined) upd.email = email;
      if (password) upd.password = password;
      if (totp_seed !== undefined) upd.totp_seed = totp_seed;
      if (notas !== undefined) upd.notas = notas;
      if (producto) {
        const { data: p } = await sb.from("productos").select("id").ilike("nombre", producto).single();
        if (p?.id) upd.producto_id = p.id;
      }
      if (Object.keys(upd).length) {
        const { error } = await sb.from("cuentas_maestras").update(upd).eq("id", cuenta_id);
        if (error) return json({ success: false, mensaje: error.message });
      }
      return json({ success: true });
    }

    // --- listar_pagos ---
    if (accion === "listar_pagos") {
      const { data } = await sb.from("pagos").select("*, clientes(usuario)").order("fecha_pago", { ascending: false }).limit(200);
      return json({ success: true, pagos: (data || []).map((p: any) => ({
        id: p.id, cliente_id: p.cliente_id, monto: p.monto, moneda: p.moneda,
        metodo: p.metodo, referencia: p.referencia, fecha_pago: p.fecha_pago, notas: p.notas,
        clientes: p.clientes,
      })) });
    }

    // --- listar_logs ---
    if (accion === "listar_logs") {
      const { data } = await sb.from("logs_acceso").select("*").order("fecha", { ascending: false }).limit(300);
      return json({ success: true, logs: (data || []).map((l: any) => ({
        id: l.id, cliente_id: l.cliente_id, accion: l.accion, resultado: l.resultado,
        ip: l.ip, user_agent: l.user_agent, fecha: l.fecha,
      })) });
    }

    return json({ success: false, mensaje: `Acción no implementada: ${accion}` });
  } catch (err) {
    console.error(err);
    return json({ success: false, mensaje: String((err as Error)?.message || err) }, 500);
  }
});