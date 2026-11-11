// Supabase (Edge Functions) integration - OLD tables mode (clientes/cuentas_maestras/productos)
const SB_URL_KEY = "nova-supabase-url";
const SB_TOK_KEY = "nova-supabase-token";
function sbStoreGet(storage, key) {
  try { return storage.getItem(key) || ""; } catch { return ""; }
}
function sbStoreSet(storage, key, value) {
  try { if (value) storage.setItem(key, value); else storage.removeItem(key); } catch {}
}
function sbPageSecure() {
  return location.protocol === "https:" || location.protocol === "file:" ||
    ["localhost", "127.0.0.1", "::1", "[::1]"].includes(location.hostname);
}
function sbValidApiUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol === "https:") return true;
    return url.protocol === "http:" && ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname);
  } catch { return false; }
}
// Token persisted in localStorage so the user does not have to re-enter it on every session.
let SUPABASE_TOKEN = sbStoreGet(localStorage, SB_TOK_KEY) || sbStoreGet(sessionStorage, SB_TOK_KEY);
// URL comes from config file — no manual entry needed.
function sbGetConfigUrl() {
  return (window.PANEL_CONFIG?.supabaseUrl || "").trim();
}
function sbNormalizeApiUrl(value) {
  const raw=String(value||"").trim();
  if(!raw)return "";
  try {
    const url=new URL(raw);
    let path=url.pathname.replace(/\/+$/,"");
    if(!path)path="/functions/v1";
    if(path.endsWith("/functions/v1/admin"))path=path.slice(0,-6);
    return url.origin+path;
  } catch { return raw.replace(/\/$/,""); }
}
// URL: prefer config file, fall back to localStorage (legacy).
let SUPABASE_API = sbNormalizeApiUrl(sbGetConfigUrl() || sbStoreGet(localStorage, SB_URL_KEY));
if (SUPABASE_API && !sbValidApiUrl(SUPABASE_API)) {
  SUPABASE_API = "";
}
// Keep localStorage in sync so legacy paths still work.
if (SUPABASE_API) sbStoreSet(localStorage, SB_URL_KEY, SUPABASE_API);

const KNOWN_PRODUCTS = ["chatgpt", "gemini", "capcut", "claude", "perplexity", "superprompt", "codex"];
const PRODUCT_DISPLAY = {
  chatgpt: "ChatGPT", gemini: "Gemini", capcut: "CapCut", claude: "Claude",
  perplexity: "Perplexity", superprompt: "Superprompt", codex: "Codex",
};
const PRODUCT_COLOR = {
  ChatGPT: "#10a37f", Gemini: "#4285f4", CapCut: "#30343b", Claude: "#c7684f",
  Perplexity: "#1f8291", Superprompt: "#e09b3c", Codex: "#7667df",
};

let PRODUCTS_FOUND = [];

function updateSbBadge(state, text) {
  const badge = document.getElementById("sbStatusBadge");
  if (!badge) return;
  const connecting = state === "loading" || text === "conectando…";
  const connected = state === "ok";
  const error = state === "error" || text === "error";
  const label = connecting ? "Conectando" : connected ? "Conectado" : error ? "Sin conexión" : "Desconectado";
  badge.className = "sb-badge " + (connecting ? "sb-loading" : connected ? "sb-on" : error ? "sb-error" : "sb-off");
  badge.querySelector(".sb-label").textContent = label;
  badge.title = "Supabase: " + label.toLowerCase();
  badge.setAttribute("aria-label", badge.title);
  badge.setAttribute("aria-busy", String(connecting));
  // Show "Desbloquear" button only when there is a pending op AND the badge is in error/loading state
  const unlockBtn = document.getElementById("clearPendingBtn");
  if (unlockBtn) {
    try {
      const scopeKey = 'ultrashop-pending-' + (window.SUPABASE_API || '');
      const hasPending = !!sessionStorage.getItem(scopeKey);
      unlockBtn.style.display = (hasPending && (error || connecting)) ? '' : 'none';
    } catch { unlockBtn.style.display = 'none'; }
  }
}

function sbConfigured() { return !!SUPABASE_API && !!SUPABASE_TOKEN; }

// Share only in-flight reads. Never retain a response across edits or refreshes.
const sbPendingReads = new Map();
let sbDataVersion = 0;
let sbSyncInFlight = null;
function sbConnectionKey() { return JSON.stringify([SUPABASE_API, SUPABASE_TOKEN]); }
function sbInvalidateReads() { sbDataVersion++; sbPendingReads.clear(); }

async function sbApi(accion, method, body, params) {
  method = (method || "GET").toUpperCase();
  if (!sbConfigured()) throw new Error("Supabase no configurado");
  const reading = method === "GET";
  if (!reading) sbInvalidateReads();
  const opts = { method, headers: { Authorization: SUPABASE_TOKEN, "Content-Type": "application/json" } };
  if (body) opts.body = JSON.stringify(body);
  let qs = "accion=" + encodeURIComponent(accion);
  if (params) Object.keys(params).sort().forEach((k) => { if (params[k] != null) qs += "&" + encodeURIComponent(k) + "=" + encodeURIComponent(params[k]); });
  const key = sbConnectionKey() + ":" + sbDataVersion + ":" + qs;
  if (reading && sbPendingReads.has(key)) return sbPendingReads.get(key);
  const request = (async () => {
    const controller = new AbortController();
    // ✅ 90s para escrituras (POST), 30s para lecturas (GET)
const timer = setTimeout(() => controller.abort(), reading ? 30000 : 90000);
    opts.signal = controller.signal;
    try {
      const res = await fetch(SUPABASE_API + "/admin?" + qs, opts);
      const data = await res.json();
      if (res.status === 401) {
        // Never keep a rejected token: force a fresh connection prompt.
        sbStoreSet(sessionStorage, SB_TOK_KEY, "");
        sbStoreSet(localStorage, SB_TOK_KEY, "");
        SUPABASE_TOKEN = "";
      }
      if (!res.ok || data.success === false) { const error = new Error(data.mensaje || "Error de conexión (" + res.status + ")"); error.status = res.ok ? 400 : res.status; error.code = data.code; throw error; }
      return data;
    } catch (error) {
      if (error.name === "AbortError") throw new Error(reading
        ? "La consulta tardó demasiado. Intenta actualizar nuevamente."
        : "No se pudo confirmar el guardado a tiempo. Actualiza y comprueba el resultado antes de repetirlo.");
      throw error;
    } finally {
      clearTimeout(timer);
      if (!reading) sbInvalidateReads();
    }
  })();
  if (reading) sbPendingReads.set(key, request);
  try { return await request; }
  finally { if (sbPendingReads.get(key) === request) sbPendingReads.delete(key); }
}

async function sbMapLimited(items, task) {
  let index = 0;
  const result = new Array(items.length);
  await Promise.all(Array.from({ length: Math.min(4, items.length) }, async () => {
    while (index < items.length) {
      const position = index++;
      result[position] = await task(items[position]);
    }
  }));
  return result;
}

function sbResponseList(response, field) {
  if (!Array.isArray(response[field])) throw new Error("Respuesta incompleta de Supabase: " + field);
  return response[field];
}

async function sbDownloadSnapshot() {
  // The same account responses identify licenses AND populate master accounts.
  // Keep per-product queries so the server's existing per-query limit is unchanged.
  const catalog = window.novaLicenseCatalog || { entries: {}, removed: [] };
  const requested = [...new Set([...KNOWN_PRODUCTS, ...Object.values(catalog.entries).map((entry) => entry.product)])]
    .filter((product) => !catalog.removed.includes(product));
  const responses = await sbMapLimited([null, ...requested], (product) => product === null
    ? sbApi("listar_clientes")
    : sbApi("listar_cuentas", "GET", null, { producto: product }));
  const clients = sbResponseList(responses[0], "clientes");
  const accounts = new Map(requested.map((product, index) => [product, sbResponseList(responses[index + 1], "cuentas")]));
  const products = requested.filter((product) => accounts.get(product).length > 0 ||
    Object.values(catalog.entries).some((entry) => entry.product === product));
  clients.forEach((client) => {
    (client.productos || []).forEach((product) => { if (!catalog.removed.includes(product) && !products.includes(product)) products.push(product); });
  });
  if (!products.length) products.push(...["chatgpt", "gemini"].filter((product) => !catalog.removed.includes(product)));
  const extra = products.filter((product) => !accounts.has(product));
  const extraLists = await sbMapLimited(extra, (product) => sbApi("listar_cuentas", "GET", null, { producto: product }));
  extra.forEach((product, index) => accounts.set(product, sbResponseList(extraLists[index], "cuentas")));
  return { clients, accounts, products };
}

async function sbReadCurrent(read) {
  const connection = sbConnectionKey();
  while (true) {
    const version = sbDataVersion;
    const data = await read();
    if (connection !== sbConnectionKey()) throw new Error("La conexión cambió; actualiza nuevamente.");
    // A write completed while the data was downloading: discard the old snapshot.
    if (version === sbDataVersion) return data;
  }
}

function disp(p) {
  const entry = Object.entries(window.novaLicenseCatalog?.entries || {}).find(([, value]) => value.product === p);
  return entry?.[0] || PRODUCT_DISPLAY[p] || p;
}

function sbMapStatus(s) {
  const v = (s || "").toLowerCase();
  if (v === "activo" || v === "activa") return "Activo";
  if (v === "suspendido") return "Suspendido";
  return "Inactivo";
}

function sbApplyLicenses(snapshot) {
  PRODUCTS_FOUND = snapshot.products;

  PRODUCTS_FOUND.forEach((p) => {
    const key = disp(p);
    if (!datasets[key]) datasets[key] = [];
    if (!masterAccounts[key]) masterAccounts[key] = [];
    if (!licenseColors[key]) licenseColors[key] = PRODUCT_COLOR[key] || "#10a37f";
  });

  PRODUCTS_FOUND.forEach((p) => {
    const key = disp(p);
    if (![...document.querySelectorAll(".tab[data-license]")].some((t) => t.dataset.license === key)) {
      const tab = document.createElement("button");
      tab.className = "tab";
      tab.dataset.license = key;
      tab.innerHTML = `${esc(key)} <span class="tab-count">00</span>`;
      if (typeof bindLicenseTab === "function") bindLicenseTab(tab);
      document.querySelector("#tabs")?.append(tab);
    }
  });
  document.querySelectorAll(".tab[data-license]").forEach((t) => {
    if (!PRODUCTS_FOUND.map(disp).includes(t.dataset.license)) t.remove();
  });
  if (!datasets[current]) current = Object.keys(datasets)[0] || PRODUCTS_FOUND.map(disp)[0];
  if (!masterAccounts[masterLicense]) masterLicense = current;
}

function sbApplyMasters(snapshot) {
  for (const p of snapshot.products || PRODUCTS_FOUND) {
    const key = disp(p);
    const cuentas = snapshot.accounts.get(p).slice();

      
      cuentas.sort((a, b) => Number(a.id) - Number(b.id));

      masterAccounts[key] = cuentas.map((c, idx) => ({
        _id: c.id,
        id: "master-" + c.id,
        number: idx + 1,   // ahora id=1 → Cuenta 1 ✅
        email: c.email || "",
        password: c.password || "",
        seed: c.totp_seed || "",
        startDate: c.fecha_alta ? String(c.fecha_alta).slice(0, 10) : dateLocal(new Date()),
        endDate: c.fecha_alta ? dateLocal(addDays(new Date(c.fecha_alta), 30)) : dateLocal(addDays(new Date(), 30)),
        duration: "month1",
        note: c.notas || "",
        enabled: (c.estado || "").toLowerCase() === "disponible" || (c.estado || "").toLowerCase() === "activa",
        _email: c.email || "",
        _product: p,
      }));
  }
}

function sbApplyClients(clients) {
  const productsToReset = new Set(PRODUCTS_FOUND);
  clients.forEach((client) => {
    (client.productos || (client.producto ? [client.producto] : ["chatgpt"]))
      .forEach((product) => productsToReset.add(product));
  });
  productsToReset.forEach((product) => {
    if (!window.novaLicenseCatalog?.removed.includes(product)) datasets[disp(product)] = [];
  });

  const byEmail = new Map();
  Object.entries(masterAccounts).forEach(([key, list]) => {
    const index = new Map();
    list.forEach((master) => { if (!index.has(master._email)) index.set(master._email, master); });
    byEmail.set(key, index);
  });
  const firstProd = PRODUCTS_FOUND[0];
  for (const c of clients) {
    const prods = c.productos || (c.producto ? [c.producto] : ["chatgpt"]);
    if (!prods.length) {
      const key = disp(firstProd);
      if (!datasets[key]) datasets[key] = [];
      // listar_clientes already orders by descending ID (newest first).
      // Append in that order instead of reversing it with unshift.
      datasets[key].push({
        _clientId: c.id,
        _product: firstProd,
        email: c.usuario || c.email || "",
        phone: c.telefono || "",
        device: c.device_label || "Pendiente",
        status: sbMapStatus(c.estado_cliente),
        account: 1,
        total: c.dias_totales || 30,
        left: c.dias_restantes != null ? c.dias_restantes : 0,
        creator: "admin",
        startDate: null,
        endDate: c.fecha_vencimiento || null,
        expiresAt: c.fecha_vencimiento || null,
        isTrial: false,
        sessionClosed: false,
      });
      continue;
    }
    for (const p of prods) {
      if (window.novaLicenseCatalog?.removed.includes(p)) continue;
      const key = disp(p);
      if (!datasets[key]) datasets[key] = [];
      const master = byEmail.get(key)?.get(c.cuenta_maestra_email);
      datasets[key].push({
        _clientId: c.id,
        _product: p,
        email: c.usuario || c.email || "",
         password: c.password_text || "", // ✅ NUEVO: Mapear la contraseña
        phone: c.telefono || "",
        device: c.device_label || "Pendiente",
        status: sbMapStatus(c.estado_cliente),
        account: master ? master.number : 1,
        total: c.dias_totales || 30,
        left: c.dias_restantes != null ? c.dias_restantes : 0,
        creator: "admin",
        startDate: null,
        endDate: c.fecha_vencimiento || null,
        expiresAt: c.fecha_vencimiento || null,
        isTrial: false,
        sessionClosed: false,
      });
    }
  }
}

async function sbLoadMasters() {
  const snapshot = await sbReadCurrent(async () => {
    const products = PRODUCTS_FOUND.slice();
    const lists = await sbMapLimited(products, (product) => sbApi("listar_cuentas", "GET", null, { producto: product }));
    return { products, accounts: new Map(products.map((product, index) => [product, sbResponseList(lists[index], "cuentas")])) };
  });
  sbApplyMasters(snapshot);
}

async function sbLoadClients() {
  const clients = await sbReadCurrent(async () => sbResponseList(await sbApi("listar_clientes"), "clientes"));
  sbApplyClients(clients);
  return clients;
}

function sbLoadAll() {
  const connection = sbConnectionKey();
  if (sbSyncInFlight?.connection === connection) return sbSyncInFlight.promise;
  const sync = { connection };
  sync.promise = (async () => {
    const snapshot = await sbReadCurrent(sbDownloadSnapshot);
    // Commit only a complete download. A failed request leaves displayed data intact.
    sbApplyLicenses(snapshot);
    sbApplyMasters(snapshot);
    sbApplyClients(snapshot.clients);
    updateSbBadge("ok", "conectado");
    renderPalette?.();
    if (typeof render === "function") render();
    if (typeof renderMasters === "function") renderMasters();
    if (typeof renderStaff === "function") renderStaff();
    if (typeof activeView !== "undefined" && activeView === "stats" && typeof renderStatistics === "function") renderStatistics();
  })().catch((error) => {
    updateSbBadge("error", "error");
    throw error;
  }).finally(() => { if (sbSyncInFlight === sync) sbSyncInFlight = null; });
  sbSyncInFlight = sync;
  return sync.promise;
}

function sbPromptConfig() {
  if (sbConfigured()) return true;
  // URL comes from config file — no prompt needed.
  const configUrl = sbNormalizeApiUrl(sbGetConfigUrl() || sbStoreGet(localStorage, SB_URL_KEY));
  if (!configUrl || !sbValidApiUrl(configUrl)) {
    if (typeof toast === "function") toast("Falta configurar la URL de Supabase en js/00-config.js", "error");
    return false;
  }
  SUPABASE_API = configUrl;
  sbStoreSet(localStorage, SB_URL_KEY, configUrl);
  // Token: use saved value — set after staff login via sbSetStaffToken()
  const tok = (sbStoreGet(localStorage, SB_TOK_KEY) || sbStoreGet(sessionStorage, SB_TOK_KEY)).trim();
  if (!tok) return false; // staff hasn't logged in yet
  SUPABASE_TOKEN = tok;
  sbStoreSet(localStorage, SB_TOK_KEY, tok);
  return true;
}

async function sbInit() {
  // Pre-load URL from config file even before login
  if (!SUPABASE_API) {
    const url = sbNormalizeApiUrl(sbGetConfigUrl());
    if (url && sbValidApiUrl(url)) {
      SUPABASE_API = url;
      sbStoreSet(localStorage, SB_URL_KEY, url);
    }
  }
  // If token not yet set (user hasn't logged in), wait — login will call sbSetStaffToken then sbLoadAll
  if (!SUPABASE_TOKEN) { updateSbBadge("off", "off"); return; }
  updateSbBadge("off", "conectando…");
  try {
    await sbLoadAll();
    updateSbBadge("ok", "conectado");
    if (typeof toast === "function") toast("Datos cargados desde Supabase");
  } catch (e) {
    updateSbBadge("off", "error");
    if (typeof toast === "function") toast("Error Supabase: " + e.message, "error");
  }
}

function sbDisconnect() {
  sbStoreSet(sessionStorage, SB_TOK_KEY, "");
  sbStoreSet(localStorage, SB_TOK_KEY, "");
  sbStoreSet(localStorage, SB_URL_KEY, "");
  SUPABASE_TOKEN = "";
  SUPABASE_API = "";
  sbInvalidateReads();
  try {
    sessionStorage.removeItem("nova-demo-session");
    sessionStorage.removeItem("nova-session-user");
  } catch {}
  location.reload();
}

window.sbApi = sbApi;
window.sbDisconnect = sbDisconnect;
window.sbLoadAll = sbLoadAll;
window.sbInit = sbInit;
window.sbConfigured = sbConfigured;
window.sbLoadClients = sbLoadClients;
window.sbLoadMasters = sbLoadMasters;
window.PRODUCT_DISPLAY = PRODUCT_DISPLAY;
window.PRODUCT_COLOR = PRODUCT_COLOR;

// Called after staff login: encodes username+password as the token for the Edge Function.
// The Edge Function validates these credentials against the staff table.
window.sbSetStaffToken = function(username, password) {
  const tok = btoa(username.trim() + ':' + password);
  sbStoreSet(localStorage, SB_TOK_KEY, tok);
  sbStoreSet(sessionStorage, SB_TOK_KEY, tok);
  SUPABASE_TOKEN = tok;
  // Ensure API URL is set from config
  if (!SUPABASE_API) {
    const url = sbNormalizeApiUrl(sbGetConfigUrl());
    if (url && sbValidApiUrl(url)) { SUPABASE_API = url; sbStoreSet(localStorage, SB_URL_KEY, url); }
  }
};

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => { sbInit(); }, 300);
});

window.addEventListener("offline", () => updateSbBadge("off", "off"));
window.addEventListener("online", () => {
  if (sbConfigured()) sbInit();
});
