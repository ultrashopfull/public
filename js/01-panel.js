// Visual prototype: local demo data and interactions. Database integration belongs here.
const uiIcons = {
  copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>',
  edit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15Z"/></svg>',
  eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5v14M15 5v14"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z"/></svg>',
  delete:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5"/></svg>',
  clients:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h12M9 12h12M9 18h12M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  users:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 4v2"/></svg>',
  accounts:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  logout: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H5v16h5M14 8l4 4-4 4M9 12h12"/></svg>',
};
const defaultData = {
  ChatGPT: [
    {
      device: "Android",
      email: "camila.rojas@gmail.com",
      phone: "59171234567",
      status: "Activo",
      account: 1,
      total: 30,
      left: 22,
      creator: "Víctor",
    },
    {
      device: "iPhone",
      email: "marco.quiroz@icloud.com",
      phone: "59176543210",
      status: "Activo",
      account: 2,
      total: 30,
      left: 5,
      creator: "Víctor",
    },
    {
      device: "Windows",
      email: "valeria.mendez@outlook.com",
      phone: "59170654321",
      status: "Activo",
      account: 3,
      total: 60,
      left: 41,
      creator: "Víctor",
    },
    {
      device: "Mac",
      email: "diego.fernandez@gmail.com",
      phone: "59172098765",
      status: "Inactivo",
      account: 4,
      total: 30,
      left: 0,
      creator: "Víctor",
    },
    {
      device: "Android",
      email: "sofia.vargas@gmail.com",
      phone: "59177711223",
      status: "Activo",
      account: 1,
      total: 90,
      left: 67,
      creator: "Víctor",
    },
    {
      device: "iPhone",
      email: "lucas.ortiz@yahoo.com",
      phone: "59170123456",
      status: "Activo",
      account: 2,
      total: 30,
      left: 18,
      creator: "Víctor",
    },
  ],
  Gemini: [
    {
      device: "Android",
      email: "andrea.paz@gmail.com",
      phone: "59171110022",
      status: "Activo",
      account: 1,
      total: 30,
      left: 17,
      creator: "Víctor",
    },
    {
      device: "Mac",
      email: "renato.siles@icloud.com",
      phone: "59172220033",
      status: "Activo",
      account: 2,
      total: 30,
      left: 8,
      creator: "Víctor",
    },
    {
      device: "Windows",
      email: "paola.rivera@outlook.com",
      phone: "59173330044",
      status: "Inactivo",
      account: 3,
      total: 60,
      left: 0,
      creator: "Víctor",
    },
    {
      device: "iPhone",
      email: "nicolas.leon@gmail.com",
      phone: "59174440055",
      status: "Activo",
      account: 4,
      total: 30,
      left: 28,
      creator: "Víctor",
    },
  ],
  Perplexity: [
    {
      device: "Mac",
      email: "ines.calle@gmail.com",
      phone: "59175550066",
      status: "Activo",
      account: 1,
      total: 30,
      left: 12,
      creator: "Víctor",
    },
    {
      device: "Windows",
      email: "esteban.arias@outlook.com",
      phone: "59176660077",
      status: "Activo",
      account: 2,
      total: 30,
      left: 3,
      creator: "Víctor",
    },
    {
      device: "Android",
      email: "mariana.soto@gmail.com",
      phone: "59177770088",
      status: "Activo",
      account: 3,
      total: 60,
      left: 47,
      creator: "Víctor",
    },
  ],
  CapCut: [
    {
      device: "iPhone",
      email: "laura.molina@gmail.com",
      phone: "59178881199",
      status: "Activo",
      account: 1,
      total: 30,
      left: 21,
      creator: "Víctor",
    },
    {
      device: "Android",
      email: "pablo.torrez@outlook.com",
      phone: "59179992211",
      status: "Activo",
      account: 2,
      total: 60,
      left: 54,
      creator: "Víctor",
    },
    {
      device: "Windows",
      email: "karla.espinoza@gmail.com",
      phone: "59170001122",
      status: "Activo",
      account: 3,
      total: 30,
      left: 6,
      creator: "Víctor",
    },
    {
      device: "Mac",
      email: "sebastian.lima@icloud.com",
      phone: "59170112233",
      status: "Suspendido",
      account: 4,
      total: 30,
      left: 0,
      creator: "Víctor",
    },
  ],
  Claude: [
    {
      device: "Mac",
      email: "fernanda.rivero@gmail.com",
      phone: "59170223344",
      status: "Activo",
      account: 1,
      total: 30,
      left: 24,
      creator: "Víctor",
    },
    {
      device: "Windows",
      email: "gabriel.condori@outlook.com",
      phone: "59170334455",
      status: "Activo",
      account: 2,
      total: 60,
      left: 39,
      creator: "Víctor",
    },
  ],
  Superprompt: [
    {
      device: "Android",
      email: "daniela.guzman@gmail.com",
      phone: "59170445566",
      status: "Activo",
      account: 1,
      total: 30,
      left: 19,
      creator: "Víctor",
    },
    {
      device: "iPhone",
      email: "raul.camacho@icloud.com",
      phone: "59170556677",
      status: "Activo",
      account: 2,
      total: 30,
      left: 7,
      creator: "Víctor",
    },
    {
      device: "Mac",
      email: "monica.suarez@outlook.com",
      phone: "59170667788",
      status: "Activo",
      account: 3,
      total: 90,
      left: 71,
      creator: "Víctor",
    },
  ],
};
const STORE_KEY = "nova-licencias-v2";
let savedState = {};
try {
  savedState = JSON.parse(localStorage.getItem(STORE_KEY) || "{}") || {};
} catch {}
let datasets =
  savedState.datasets && typeof savedState.datasets === "object" ? savedState.datasets : defaultData;
let current = savedState.current && datasets[savedState.current] ? savedState.current : "ChatGPT";
let filterMode = "all",
  adminName = savedState.adminName || "Víctor";
let durationChoice = "month1",
  renewChoice = "month1",
  renewIndex = -1,
  migrateIndex = -1,
  deleteIndex = -1,
  suspendIndex = -1,
  migrateSelection = 1;
const defaultColors = {
  ChatGPT: "#10a37f",
  Gemini: "#7667df",
  Perplexity: "#1f8291",
  CapCut: "#30343b",
  Claude: "#c7684f",
  Superprompt: "#e09b3c",
};
let licenseColors = { ...defaultColors, ...(savedState.licenseColors || {}) };
const accessUrls = {
  ChatGPT: "https://chatgpt.com",
  Gemini: "https://gemini.google.com",
  Perplexity: "https://www.perplexity.ai",
  CapCut: "https://www.capcut.com",
  Claude: "https://claude.ai",
  Superprompt: "https://superprompt.dvtng.com/",
};
const icons = {
  Android:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9a6 6 0 0 1 12 0M8 4 6.5 2M16 4 17.5 2"/><rect x="5" y="9" width="14" height="9" rx="2"/><path d="M8 18v3m8-3v3M2 11v5m20-5v5"/><circle cx="9" cy="12.5" r=".75" fill="currentColor" stroke="none"/><circle cx="15" cy="12.5" r=".75" fill="currentColor" stroke="none"/></svg>',
  iPhone:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 5h4M10 19h4"/><rect x="9" y="4" width="6" height="2" rx="1" fill="currentColor" stroke="none"/></svg>',
  Mac: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3.5" width="16" height="12" rx="1.5"/><path d="M2 18.5h20l-1.5 2H3.5zM10 18.5h4"/></svg>',
  Windows:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.2 10.5 4v7H3V5.2Zm9.5-1.5L21 2.5V11h-8.5V3.7ZM3 13h7.5v7L3 18.8V13Zm9.5 0H21v8.5l-8.5-1.3V13Z" fill="currentColor" stroke="none"/></svg>',
  Pendiente:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="3" stroke-dasharray="2 2"/><path d="M10 10a2 2 0 1 1 3.5 1.4c-.8.7-1.5 1-1.5 2.6M12 17h.01"/></svg>',
};
const phoneIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.7a9.2 9.2 0 0 0-7.9 13.9L3 21l4.6-1.1A9.2 9.2 0 1 0 12 2.7Z"/><path d="M8.2 7.9c-.5.1-1.1.9-1.1 1.6 0 2.2 2.9 5.2 5 6.2 1.4.7 3.3 1.2 4.1.1.3.6-1.2.3-1.5l-1.8-.9c-.2-.1-.4-.1-.5.1l-.8 1c-.2.2-.3.2-.6.1-1.4-.6-2.5-1.6-3.2-2.9-.2-.3-.1-.4.1-.6l.6-.7c.2-.2.2-.4.1-.6l-.8-1.9c-.1-.3-.3-.3-.5-.3Z"/></svg>';
const editIcon =
  '<svg viewBox="0 0 24 24"><path d="m15 5 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15z"/></svg>';
let activeInline = null,
  clientSessionIndex = -1;
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
const STAFF_KEY = "nova-staff-v1",
  MASTER_KEY = "nova-master-accounts-v1",
  SESSION_USER_KEY = "nova-session-user";
function readStored(key, fallback) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "null");
    return data && typeof data === "object" ? data : fallback;
  } catch {
    return fallback;
  }
}
// Panel catalog preferences are local, like the existing license editor.
// Product keys stay stable so a display-name edit does not break remote accounts.
const LICENSE_CATALOG_KEY = "nova-license-catalog-v1";
const licenseCatalog = readStored(LICENSE_CATALOG_KEY, { entries: {}, removed: [] });
licenseCatalog.entries ||= {};
licenseCatalog.removed ||= [];
function licenseProductKey(name) {
  return licenseCatalog.entries[name]?.product || datasets[name]?.find((client) => client._product)?._product ||
    masterAccounts[name]?.find((account) => account._product)?._product || name.toLowerCase();
}
function saveLicenseCatalog(name, previous) {
  const product = licenseProductKey(previous || name);
  if (previous && previous !== name) delete licenseCatalog.entries[previous];
  licenseCatalog.entries[name] = { product };
  licenseCatalog.removed = licenseCatalog.removed.filter((key) => key !== product);
  localStorage.setItem(LICENSE_CATALOG_KEY, JSON.stringify(licenseCatalog));
}
function removeLicenseCatalog(name) {
  const product = licenseProductKey(name);
  delete licenseCatalog.entries[name];
  if (!licenseCatalog.removed.includes(product)) licenseCatalog.removed.push(product);
  localStorage.setItem(LICENSE_CATALOG_KEY, JSON.stringify(licenseCatalog));
}
window.novaLicenseCatalog = licenseCatalog;
let staffUsers = readStored(STAFF_KEY, [
  {
    id: "victor1234",
    username: "Victor 1234",
    password: "1234",
    role: "admin",
    active: true,
    licenses: [],
    lastAccess: null,
  },
  {
    id: "demo-lucia",
    username: "lucia.ventas",
    role: "seller",
    active: true,
    licenses: ["ChatGPT", "Gemini"],
    lastAccess: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "demo-marco",
    username: "marco.ventas",
    role: "seller",
    active: false,
    licenses: ["CapCut"],
    lastAccess: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
]);
if (!Array.isArray(staffUsers)) staffUsers = [];
if (!staffUsers.some((u) => u.id === "victor1234"))
  staffUsers.unshift({
    id: "victor1234",
    username: "Victor 1234",
    password: "1234",
    role: "admin",
    active: true,
    licenses: [],
    lastAccess: null,
  });
// The documented local demo owner keeps its password only in the fallback
// list above. Remote mode removes it in scrubStoredSecrets() and never uses a
// local password when Supabase is configured.
let masterAccounts = readStored(MASTER_KEY, {
  ChatGPT: [
    {
      id: "demo-master-chatgpt",
      number: 1,
      email: "demo.chatgpt@ejemplo.com",
      password: "DEMO-NO-REAL",
      seed: "JBSWY3DPEHPK3PXP",
      startDate: dateLocal(new Date()),
      endDate: dateLocal(addDays(new Date(), 30)),
      duration: "month1",
      note: "Ejemplo visual con semilla pública. Reemplaza estos datos antes de usarla.",
      enabled: true,
    },
  ],
  Gemini: [
    {
      id: "demo-master-gemini",
      number: 1,
      email: "demo.gemini@ejemplo.com",
      password: "DEMO-NO-REAL",
      seed: "",
      startDate: dateLocal(new Date()),
      endDate: dateLocal(addDays(new Date(), 60)),
      duration: "month2",
      note: "Ejemplo visual editable.",
      enabled: true,
    },
  ],
});
let sessionUserId = sessionStorage.getItem(SESSION_USER_KEY) || "victor1234",
  activeView = "clients",
  masterLicense = current,
  masterEditId = null,
  masterDuration = "month1",
  staffPending = null;
function currentStaff() {
  return staffUsers.find((u) => u.id === sessionUserId && u.active) || null;
}
function isAdmin() {
  return currentStaff()?.role === "admin";
}
function canSell(name) {
  const u = currentStaff();
  return u?.role === "admin" || (u?.active && u?.licenses?.includes(name));
}
function allowedLicenses() {
  return Object.keys(datasets).filter(canSell);
}
function novaRemoteMode() {
  try {
    return !!(localStorage.getItem("nova-supabase-url") ||
      localStorage.getItem("nova-supabase-token") ||
      sessionStorage.getItem("nova-supabase-token"));
  } catch {
    return false;
  }
}
function stripSecrets(list) {
  return (Array.isArray(list) ? list : []).map(({ password, seed, ...rest }) => rest);
}
function stripClientSecrets(list) {
  return (Array.isArray(list) ? list : []).map(({ password, ...rest }) => rest);
}
function persistStaff() {
  // In remote mode the server is the source of truth for staff passwords.
  // A shared browser must never keep them on disk.
  const data = novaRemoteMode() ? stripSecrets(staffUsers) : staffUsers;
  localStorage.setItem(STAFF_KEY, JSON.stringify(data));
}
function persistMasters() {
  // Master credentials must never be written to localStorage. They stay in
  // memory for the current tab and are fetched again on the next load.
  const data = novaRemoteMode()
    ? Object.fromEntries(
        Object.entries(masterAccounts).map(([key, list]) => [key, stripSecrets(list)]),
      )
    : masterAccounts;
  localStorage.setItem(MASTER_KEY, JSON.stringify(data));
}
function scrubStoredSecrets() {
  if (!novaRemoteMode()) return;
  try {
    const storedStaff = readStored(STAFF_KEY, null);
    if (Array.isArray(storedStaff))
      localStorage.setItem(STAFF_KEY, JSON.stringify(stripSecrets(storedStaff)));
    const storedMasters = readStored(MASTER_KEY, null);
    if (storedMasters && typeof storedMasters === "object" && !Array.isArray(storedMasters))
      localStorage.setItem(
        MASTER_KEY,
        JSON.stringify(
          Object.fromEntries(
            Object.entries(storedMasters).map(([key, list]) => [key, stripSecrets(list)]),
          ),
        ),
      );
    // Older versions also persisted the generated client password inside the
    // client list. Remove it from disk and from memory.
    const storedPanel = readStored(STORE_KEY, null);
    if (storedPanel && storedPanel.datasets && typeof storedPanel.datasets === "object")
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify({
          ...storedPanel,
          datasets: Object.fromEntries(
            Object.entries(storedPanel.datasets).map(([key, list]) => [
              key,
              stripClientSecrets(list),
            ]),
          ),
        }),
      );
  } catch {}
  staffUsers.forEach((user) => delete user.password);
  Object.values(datasets)
    .flat()
    .forEach((client) => {
      delete client.password;
    });
  Object.values(masterAccounts)
    .flat()
    .forEach((master) => {
      master.password = "";
      master.seed = "";
    });
}
scrubStoredSecrets();
function persist() {
  try {
    const safeDatasets = novaRemoteMode()
      ? Object.fromEntries(
          Object.entries(datasets).map(([key, list]) => [key, stripClientSecrets(list)]),
        )
      : datasets;
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({ datasets: safeDatasets, current, adminName, licenseColors }),
    );
  } catch {
    toast("No se pudo guardar en este navegador");
  }
}
function getTimeLeft(u) {
  return u.isTrial && u.expiresAt ? Math.max(0, u.expiresAt - Date.now()) : null;
}
function getDaysLeft(u) {
  return u.endDate && !u.isTrial
    ? Math.max(0, Math.ceil((new Date(u.endDate).getTime() - Date.now()) / 86400000))
    : Math.max(0, Number(u.left) || 0);
}
function formatClock(ms) {
  const s = Math.max(0, Math.ceil((ms || 0) / 1000));
  return `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
function dateLocal(d) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function rangeDays(a, b) {
  return Math.round((Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 86400000) + 1;
}
function formatDate(s) {
  return new Intl.DateTimeFormat("es-BO", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    new Date(s),
  );
}
function toast(msg, kind = "info") {
  window.PanelModalFeedback?.message(msg, kind);
  if (window.NovaMotion) {
    window.NovaMotion.notice(msg, kind);
    return;
  }
  const el = document.querySelector("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
}
const SESSION_KEY = "nova-demo-session";
const CREDENTIAL_KEY = "nova-demo-passkey-id";
function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}
function base64ToBytes(text) {
  return Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
}
function canUsePasskey() {
  return !!(
    window.isSecureContext &&
    window.PublicKeyCredential &&
    navigator.credentials &&
    crypto.getRandomValues
  );
}
function localDemoAllowed() {
  return (
    ["localhost", "127.0.0.1", "::1", "[::1]"].includes(location.hostname) ||
    location.protocol === "file:"
  );
}
function enterPanel(showSetup = false, userId = "victor1234", animateLogin = true) {
  const u = staffUsers.find((item) => item.id === userId && item.active);
  if (!u) return;
  sessionUserId = u.id;
  sessionStorage.setItem(SESSION_KEY, "yes");
  sessionStorage.setItem(SESSION_USER_KEY, u.id);
  u.lastAccess = new Date().toISOString();
  persistStaff();
  document.querySelector("#loginScreen").hidden = true;
  document.querySelector("#app").hidden = false;
  document.querySelector("#loginError").hidden = true;
  document.querySelector("#loginUser").blur();
  applyRole();
  showView("clients");
  if (animateLogin) window.UltraShopMotion?.login();
  if (showSetup && isAdmin() && canUsePasskey() && !localStorage.getItem(CREDENTIAL_KEY))
    document.querySelector("#setupBiometricBackdrop").hidden = false;
}
async function loginByUser(e) {
  e.preventDefault();
  const form=document.querySelector("#loginForm");
  if(form.getAttribute("aria-busy")==="true")return;
  const input=document.querySelector("#loginUser"),pass=document.querySelector("#loginPassword"),
    errorBox=document.querySelector("#loginError"),submit=form.querySelector('button[type="submit"]'),
    username=input.value.trim(),password=pass.value;
  const showError=message=>{errorBox.textContent=message;errorBox.hidden=false;};
  errorBox.hidden=true;form.setAttribute("aria-busy","true");if(submit)submit.disabled=true;
  try {
    // Set the staff token from credentials BEFORE checking sbConfigured(),
    // so the first login always connects automatically using the config URL.
    if (typeof window.sbSetStaffToken === "function") window.sbSetStaffToken(username, password);
    if (typeof window.sbConfigured === "function" && window.sbConfigured()) {
      const r=await window.sbApi("staff_login","POST",{username,password});
      if(!r.success||!r.staff)throw new Error("Usuario o contraseña incorrectos.");
      const s=r.staff;
      const previous=staffUsers.find(u=>String(u.username||"").toLowerCase().replace(/\s+/g,"")===String(s.username||"").toLowerCase().replace(/\s+/g,""));
      const role=String(s.role||"").toLowerCase()==="admin"?"admin":"seller";
      const person={id:String(s.id),_id:s.id,username:s.username,displayName:s.full_name,role,active:true,licenses:Array.isArray(s.license_names)?s.license_names:(previous?.licenses||[]),lastAccess:null};
      const index=staffUsers.findIndex(u=>String(u._id||u.id)===String(s.id));
      if(index<0)staffUsers.push(person);else staffUsers[index]=person;
      persistStaff();
      pass.value="";
      // Biometric setup is localStorage-only demo behaviour. A remote login
      // must not offer a local shortcut to the panel.
      enterPanel(false,String(s.id));
      // A data refresh failure is not a rejected login.
      if(window.panelSync)await panelSync.refresh(true).catch(error=>toast(error.message||"No se pudieron actualizar los datos. Pulsa Actualizar."));
      return;
    }
    // Local demo mode is only allowed on this computer. A public deployment
    // must authenticate against Supabase; otherwise the demo owner would be a
    // known backdoor (victor1234 / 1234) for anyone on the internet.
    if (!localDemoAllowed()) {
      showError("Este panel necesita conexión con Supabase. Configura la URL y el token del servidor para entrar.");
      return;
    }
    const name=username.toLowerCase().replace(/\s+/g,"");
    const user=staffUsers.find(u=>String(u.username||"").toLowerCase().replace(/\s+/g,"")===name&&u.active);
    if(user&&user.password&&password===user.password){
      pass.value="";enterPanel(user.role==="admin",user.id);
    }else{
      showError("Usuario o contraseña incorrectos.");
      const target=user?pass:input;target.classList.remove("shake");void target.offsetWidth;target.classList.add("shake");target.focus();
    }
  }catch(error){
    const message=error instanceof TypeError&&/fetch|network/i.test(error.message)
      ? "No se pudo conectar con el servidor. Comprueba tu conexión e intenta nuevamente."
      : error.message||"No se pudo verificar el acceso. Intenta nuevamente.";
    showError(/credenciales inválidas/i.test(message)?"Usuario o contraseña incorrectos.":message);
  }finally{
    form.removeAttribute("aria-busy");if(submit)submit.disabled=false;
  }
}
async function enrollPasskey() {
  if (typeof window.sbConfigured === "function" && window.sbConfigured()) {
    toast("La huella solo está disponible en el modo local de demostración. Con Supabase, entra con usuario y contraseña.");
    return;
  }
  if (!localDemoAllowed()) {
    toast("La huella solo está disponible en el modo local de demostración.");
    return;
  }
  if (!canUsePasskey()) {
    toast("La huella necesita un navegador compatible y un contexto seguro");
    return;
  }
  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rp: { name: "Nova" },
        user: { id: crypto.getRandomValues(new Uint8Array(16)), name: "victor1234", displayName: "Víctor" },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
        timeout: 60000,
        attestation: "none",
      },
    });
    if (!credential) return;
    localStorage.setItem(CREDENTIAL_KEY, bytesToBase64(credential.rawId));
    closeDialog("#setupBiometricBackdrop");
    document.querySelector("#loginHelp").textContent = "Huella configurada en este navegador y dispositivo.";
    toast("Huella configurada para este dispositivo");
  } catch (e) {
    toast(
      e.name === "NotAllowedError"
        ? "No se completó la activación"
        : "No se pudo activar la huella en este dispositivo",
    );
  }
}
async function loginByPasskey() {
  if (typeof window.sbConfigured === "function" && window.sbConfigured()) {
    document.querySelector("#loginHelp").textContent =
      "Con Supabase activo, entra con usuario y contraseña. La huella no sustituye el acceso al servidor.";
    return;
  }
  if (!localDemoAllowed()) {
    document.querySelector("#loginHelp").textContent =
      "La huella solo está disponible en el modo local de demostración.";
    return;
  }
  const id = localStorage.getItem(CREDENTIAL_KEY);
  if (!id) {
    document.querySelector("#loginHelp").textContent =
      "Primero entra con tu usuario y contraseña; después podrás activar la huella.";
    document.querySelector("#loginUser").focus();
    return;
  }
  if (!canUsePasskey()) {
    document.querySelector("#loginHelp").textContent =
      "La huella no está disponible en este navegador o contexto.";
    return;
  }
  try {
    const credential = await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [{ type: "public-key", id: base64ToBytes(id) }],
        userVerification: "required",
        timeout: 60000,
      },
    });
    if (credential && bytesToBase64(credential.rawId) === id) enterPanel();
  } catch (e) {
    document.querySelector("#loginHelp").textContent =
      e.name === "NotAllowedError"
        ? "No se completó la verificación. Puedes usar tu usuario."
        : "No se pudo verificar la huella en este dispositivo.";
  }
}
function closeDialog(id) {
  document.querySelector(id).hidden = true;
}
function novaContrastInk(hex) {
  const rgb = String(hex).replace("#", "");
  const parts = [0, 2, 4]
    .map((i) => parseInt(rgb.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return parts[0] * 0.2126 + parts[1] * 0.7152 + parts[2] * 0.0722 > 0.39 ? "#171719" : "#fff";
}
function reorderLicense(name, position) {
  if(window.panelSync?.connected())return panelRemote("order",{name,position});
  const names = Object.keys(datasets).filter((key) => key !== name);
  names.splice(Math.max(0, Math.min(names.length, Number(position) || 0)), 0, name);
  datasets = Object.fromEntries(names.map((key) => [key, datasets[key]]));
}
function syncTabs() {
  const tabs = document.querySelector("#tabs"),
    manager = null;
  for (const name of Object.keys(datasets)) {
    const tab = [...tabs.querySelectorAll(".tab[data-license]")].find(
      (item) => item.dataset.license === name,
    );
    if (tab) tabs.insertBefore(tab, manager);
  }
  if (!canSell(current)) current = allowedLicenses()[0] || current;
  document.documentElement.style.setProperty("--accent", licenseColors[current] || "#4285f4");
  document.querySelectorAll(".tab[data-license]").forEach((t) => {
    t.hidden = !canSell(t.dataset.license);
    t.title = isAdmin()
      ? "Mantén 2 segundos para arrastrar · Alt + flechas para ordenar"
      : "Abrir " + t.dataset.license;
    const count = t.querySelector(".tab-count");
    if (count) count.textContent = String((datasets[t.dataset.license] || []).length).padStart(2, "0");
    if (!t.querySelector(".tab-dot")) t.insertAdjacentHTML("afterbegin", '<span class="tab-dot"></span>');
    t.style.setProperty("--tab-color", licenseColors[t.dataset.license] || "#4285f4");
    t.style.setProperty("--tab-ink", novaContrastInk(licenseColors[t.dataset.license] || "#4285f4"));
    t.classList.toggle("active", t.dataset.license === current);
  });

}
const filterLabels = {
  all: "Todos",
  activo: "Activos",
  inactivo: "Inactivos",
  suspendido: "Suspendidos",
  trial: "Pruebas",
  expiring: "Por vencer",
};
function updateFilterMenu(baseRows) {
  const counts = {
    all: baseRows.length,
    activo: baseRows.filter((u) => u.status === "Activo").length,
    inactivo: baseRows.filter((u) => u.status === "Inactivo").length,
    suspendido: baseRows.filter((u) => u.status === "Suspendido").length,
    trial: baseRows.filter((u) => u.isTrial).length,
    expiring: baseRows.filter((u) => u.status === "Activo" && !u.isTrial && getDaysLeft(u) <= 1).length,
  };
  for (const key of Object.keys(filterLabels)) if (key.startsWith("account")) delete filterLabels[key];
  const numbers = new Set([
    1,
    2,
    3,
    4,
    ...(datasets[current] || []).map((u) => Number(u.account)),
    ...masterItems(current).map((m) => Number(m.number)),
  ]);
  for (const n of [...numbers].filter(Number.isFinite).sort((a, b) => a - b)) {
    filterLabels["account" + n] = "Cuenta " + n;
    counts["account" + n] = baseRows.filter((u) => u.account === n).length;
  }
  document.querySelector("#filterLabel").textContent = filterLabels[filterMode];
  document.querySelector("#filterMenu").innerHTML = Object.keys(filterLabels)
    .map(
      (k) =>
        `<button type="button" class="filter-option ${filterMode === k ? "selected" : ""}" data-filter="${k}" role="menuitemradio" aria-checked="${filterMode === k}"><span>${filterLabels[k]}${k === "expiring" ? "<small> ≤ 1 día</small>" : ""}</span><b>${counts[k]}</b></button>`,
    )
    .join("");
}
function renewalReminder(u, license) {
  const today = dateLocal(new Date()),
    tomorrow = dateLocal(addDays(new Date(), 1)),
    end = u.endDate ? dateLocal(new Date(u.endDate)) : "";
  const when = !end
    ? "está por vencer"
    : end < today
      ? "venció"
      : end === today
        ? "vence hoy"
        : end === tomorrow
          ? "vence mañana"
          : "vence el " + formatDate(u.endDate);
  return `Hola 👋, te escribimos de UltraShop. Tu licencia de ${license} ${when}. ¿Te gustaría renovarla? Quedamos atentos.`;
}
// Passwords entered during this tab's session only; never persist recoverable remote secrets.
const clientSessionPasswords = new Map();
function rememberClientPassword(id, password) {
  if (id != null && typeof password === "string" && password)
    clientSessionPasswords.set(JSON.stringify([SUPABASE_API, String(id)]), password);
}
function availableClientPassword(user) {
  if (!user || !canSell(current)) return "";

  // 1. Prioridad: contraseña recién generada en esta sesión (más fresca)
  let value = window.sbConfigured?.()
    ? clientSessionPasswords.get(JSON.stringify([SUPABASE_API, String(user._clientId)]))
    : null;

  // 2. Fallback: contraseña que viene del backend (password_text)
  if (!value) {
    value = user.password;
  }

  // Un hash nunca es una contraseña mostrable
  return typeof value === "string" && value && !/^\$(2[aby]\$|argon2|scrypt\$)/.test(value)
    ? value
    : "";
}
const clientEyeOff = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.8 5.2A11 11 0 0 1 12 5c7 0 10 7 10 7a17 17 0 0 1-4 4.8M6.2 6.2C3.4 8.2 2 12 2 12s3 7 10 7a12 12 0 0 0 5-1.2"/></svg>';
function clientPasswordCell(user, index) {
  const available = !!availableClientPassword(user);
  const label = available ? "Mostrar contraseña" : "Contraseña no disponible";
  return `<td class="client-password-cell"><div class="client-password-control"><span class="client-password-value${available ? " is-masked" : " is-unavailable"}">${available ? "••••••••" : "No disponible"}</span><button type="button" class="client-password-toggle" data-password-index="${index}" aria-label="${label}" aria-pressed="false" title="${available ? label : "La contraseña no está disponible en esta sesión"}" ${available ? "" : "disabled"}>${uiIcons.eye}</button></div></td>`;
}
function maskClientPasswords() {
  document.querySelectorAll('.client-password-toggle[aria-pressed="true"]').forEach(button => {
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", "Mostrar contraseña");
    button.title = "Mostrar contraseña";
    button.innerHTML = uiIcons.eye;
    const value = button.previousElementSibling;
    value.textContent = "••••••••";
    value.classList.add("is-masked");
  });
}
document.querySelector("#userRows").addEventListener("click", event => {
  const button = event.target.closest(".client-password-toggle");
  if (!button || button.disabled) return;
  const password = availableClientPassword(datasets[current]?.[Number(button.dataset.passwordIndex)]);
  if (!password) return;
  const reveal = button.getAttribute("aria-pressed") !== "true";
  maskClientPasswords();
  const value = button.previousElementSibling;
  value.textContent = reveal ? password : "••••••••";
  value.classList.toggle("is-masked", !reveal);
  button.setAttribute("aria-pressed", String(reveal));
  button.setAttribute("aria-label", reveal ? "Ocultar contraseña" : "Mostrar contraseña");
  button.title = button.getAttribute("aria-label");
  button.innerHTML = reveal ? clientEyeOff : uiIcons.eye;
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    value.animate?.([{opacity:.3, transform:"translateY(3px)"},{opacity:1, transform:"none"}], {duration:180});
    button.animate?.([{transform:"scale(.85)"},{transform:"scale(1)"}], {duration:180});
  }
});
document.addEventListener("visibilitychange", () => { if (document.hidden) maskClientPasswords(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") maskClientPasswords(); });
window.addEventListener("blur", maskClientPasswords);

function render() {
  activeInline = null;
  syncTabs();
  const q = document.querySelector("#search").value.trim().toLowerCase();
  document.querySelector("#clearSearch").hidden = !q;
  const baseRows = (canSell(current) ? datasets[current] || [] : []).filter((u) =>
    ((u.email || "") + " " + (u.phone || "")).toLowerCase().includes(q),
  );
  updateFilterMenu(baseRows);
  let rows = baseRows;
  if (filterMode === "trial") rows = rows.filter((u) => u.isTrial);
  else if (filterMode === "expiring")
    rows = rows.filter((u) => u.status === "Activo" && !u.isTrial && getDaysLeft(u) <= 1);
  else if (filterMode.startsWith("account"))
    rows = rows.filter((u) => u.account === Number(filterMode.slice(7)));
  else if (filterMode !== "all") rows = rows.filter((u) => u.status.toLowerCase() === filterMode);
  document.querySelector("#userRows").innerHTML = rows.length
    ? rows
        .map((u) => {
          const i = datasets[current].indexOf(u),
            remaining = u.isTrial ? getTimeLeft(u) : null,
            left = getDaysLeft(u),
            pct = u.isTrial
              ? Math.max(0, Math.min(100, Math.ceil(((remaining || 0) / 3600000) * 100)))
              : Math.max(0, Math.min(100, Math.round((left / Math.max(1, u.total)) * 100)));
          const state = u.status.toLowerCase(),
            daysStart = u.isTrial ? "1 h" : u.total,
            daysEnd = u.isTrial ? formatClock(remaining) : left,
            rawDigits = String(u.phone || "").replace(/\D/g, ""),
            digits = rawDigits.length === 8 && /^[67]/.test(rawDigits) ? "591" + rawDigits : rawDigits;
          return `<tr data-index="${i}" style="--row-order:${Math.min(i, 9)}" class="${state === "suspendido" ? "row-suspended" : ""}">
<td class="editable-cell client-user-cell"><div class="email-wrap">${u.isTrial ? '<span class="trial-badge">PRUEBA</span>' : ""}${u.codexEnabled ? '<span class="codex-badge" title="Codex permitido">CX</span>' : ""}<button class="inline-trigger email" type="button" data-copy-field="email" data-index="${i}" title="Toca para copiar usuario" aria-label="Copiar usuario ${esc(u.email || "")}">${esc(u.email || "Sin usuario")}</button></div></td>
${clientPasswordCell(u, i)}
<td class="editable-cell client-phone-cell"><button class="inline-trigger phone" type="button" data-copy-field="phone" data-index="${i}" title="Toca para copiar celular" aria-label="Copiar celular ${esc(u.phone || "")}"><span class="phone-number">${esc(u.phone || "—")}</span></button></td>
<td class="client-device-cell"><div class="device" data-device="${esc(u.device || "Pendiente")}" title="${esc(u.device === "Pendiente" ? "Por detectar" : u.device || "Por detectar")}"><span class="device-mark" aria-hidden="true">${icons[u.device] || icons.Pendiente}</span><span class="device-label">${esc(u.device === "Pendiente" ? "Por detectar" : u.device || "Por detectar")}</span></div></td>
<td><span class="status ${state === "activo" ? "active" : state === "inactivo" ? "inactive" : "suspended"}">${esc(u.status)}</span></td>
<td><div class="account-cell"><span class="account">Cuenta ${esc(u.account)}</span><button class="migrate admin-action" title="Migrar cuenta" aria-label="Migrar Cuenta ${esc(u.account)}" onclick="migrate(${i})"><svg viewBox="0 0 24 24"><path d="M7 7h11l-3-3m3 3-3 3M17 17H6l3 3m-3-3 3-3"/></svg></button></div></td>
<td class="editable-cell"><div class="days-inline" aria-label="Días de vigencia"><span class="days-num">${daysStart}</span><span class="progress ${pct < 20 ? "low" : ""} ${pct === 0 ? "empty" : ""}"><i style="--fill:${pct}%;width:${pct}%"></i></span><span class="days-num remaining">${u.isTrial ? `<span class="days-full">${daysEnd}</span><span class="days-mobile">${Math.ceil((remaining || 0) / 60000)}m</span>` : daysEnd}</span></div></td>
<td><div class="actions"><button class="action edit admin-action" title="Editar cliente" aria-label="Editar cliente" onclick="openClientEditor(${i})"><svg viewBox="0 0 24 24"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15Z"/></svg><span>Editar</span></button><button class="action renew" title="Renovar" onclick="renew(${i})"><svg viewBox="0 0 24 24"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.5 9a7 7 0 0 1 12-2L20 12M4 12l2.5 5a7 7 0 0 0 12-2"/></svg><span>Renovar</span></button><button class="action pause" title="${state === "suspendido" ? "Reactivar acceso" : "Suspender y cerrar sesión"}" aria-label="${state === "suspendido" ? "Reactivar acceso" : "Suspender y cerrar sesión"}" onclick="suspend(${i})">${state === "suspendido" ? uiIcons.play : '<svg class="suspend-power-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v8M6.3 5.8a8 8 0 1 0 11.4 0"/></svg>'}<span>${state === "suspendido" ? "Reactivar" : "Suspender y cerrar sesión"}</span></button><button class="action copy" title="Copiar acceso" onclick="copyAccess(${i})"><svg viewBox="0 0 24 24"><rect x="8" y="8" width="11" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2"/></svg><span>Copiar</span></button><a class="action whatsapp" title="Abrir WhatsApp" href="${digits.length >= 7 ? "https://wa.me/" + digits + "?text=" + encodeURIComponent(renewalReminder(u, current)) : "#"}" ${digits.length >= 7 ? 'target="_blank" rel="noopener"' : ""} onclick="return contactWhatsApp(event,${i})"><svg viewBox="0 0 24 24"><path d="M12 2.7a9.2 9.2 0 0 0-7.9 13.9L3 21l4.6-1.1A9.2 9.2 0 1 0 12 2.7Z"/><path d="M8.2 7.9c-.5.1-1.1.9-1.1 1.6 0 2.2 2.9 5.2 5 6.2 1.4.7 3.3 1.2 4.1.1.3.6-1.2.3-1.5l-1.8-.9c-.2-.1-.4-.1-.5.1l-.8 1c-.2.2-.3.2-.6.1-1.4-.6-2.5-1.6-3.2-2.9-.2-.3-.1-.4.1-.6l.6-.7c.2-.2.2-.4.1-.6l-.8-1.9c-.1-.3-.3-.3-.5-.3Z"/></svg><span>WhatsApp</span></a><button class="action delete admin-action" title="Eliminar" onclick="removeUser(${i})"><svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg><span>Eliminar</span></button></div></td></tr>`;
        })
        .join("")
    : '<tr><td class="empty-state" colspan="8">No encontramos usuarios con esos criterios.</td></tr>';
}
function animateListIn() {
  window.NovaMotion?.list(document.querySelector("#userRows"));
}
function selectLicense(name) {
  if (rowActionBusy || migrationBusy || !canSell(name)) return;
  current = name;
  filterMode = "all";
  closeFilter();
  closeLicenseManager();
  persist();
  render();
  animateListIn();
  const workspace = document.querySelector(".workspace");
  workspace.classList.remove("license-switch");
  void workspace.offsetWidth;
  workspace.classList.add("license-switch");
}
function toggleFilter() {
  const menu = document.querySelector("#filterMenu");
  menu.hidden = !menu.hidden;
  document.querySelector("#filterBtn").setAttribute("aria-expanded", String(!menu.hidden));
}
function closeFilter() {
  document.querySelector("#filterMenu").hidden = true;
  document.querySelector("#filterBtn").setAttribute("aria-expanded", "false");
}
// License editing lives in Licencias; client tabs only select or reorder.
function closeLicenseManager() {}
function setFilter(mode) {
  if (!(mode in filterLabels)) return;
  filterMode = mode;
  closeFilter();
  render();
  animateListIn();
}
const paletteColors = [
  "#10a37f",
  "#20b88f",
  "#20897d",
  "#1f8291",
  "#2384d2",
  "#5375db",
  "#7667df",
  "#9b63ca",
  "#cf65a7",
  "#e06277",
  "#c7684f",
  "#f08048",
  "#e09b3c",
  "#d2ad27",
  "#83a84a",
  "#50745d",
  "#5d6877",
  "#30343b",
];
let editingLicense = null,
  tapLicense = "",
  tapCount = 0,
  tapStart = 0;
function paintPalette(color) {
  const picker = document.querySelector("#licenseColorInput");
  picker.value = color;
  document.querySelector("#licenseColorValue").textContent = color.toUpperCase();
  document.querySelector("#licensePreview").style.setProperty("--preview-color", color);
  document
    .querySelectorAll("#colorPalette .color-swatch")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.color.toLowerCase() === color.toLowerCase())),
    );
}
function renderPalette() {
  document.querySelector("#colorPalette").innerHTML = paletteColors
    .map(
      (c) =>
        `<button type="button" class="color-swatch" data-color="${c}" style="--swatch:${c}" aria-label="Color ${c}" aria-pressed="false"><span>✓</span></button>`,
    )
    .join("");
}
function openLicenseCreate() {
  if(window.panelSync?.busy){toast("Espera a que termine el guardado");return;}
  if (!isAdmin()) return;
  if (rowActionBusy || migrationBusy) {
    toast("Espera a que termine la acción");
    return;
  }
  editingLicense = null;
  document.querySelector("#licenseForm").reset();
  document.querySelector("#licenseKicker").textContent = "NUEVA LICENCIA";
  document.querySelector("#licenseTitle").textContent = "Crear licencia";
  document.querySelector("#licenseSubmit").textContent = "Crear licencia";
  document.querySelector("#licensePreviewText").textContent = "Nueva licencia";
  document.querySelector("#licenseDeleteSection").hidden = true;
  paintPalette("#4285f4");
  document.querySelector("#licenseBackdrop").hidden = false;
  document.querySelector("#licenseNameInput").focus();
}
function openLicenseEdit(name = current) {
  if(window.panelSync?.busy){toast("Espera a que termine el guardado");return;}
  if (!isAdmin()) return;
  if (rowActionBusy || migrationBusy) {
    toast("Espera a que termine la acción");
    return;
  }
  if (!(name in datasets)) return;
  editingLicense = name;
  document.querySelector("#licenseKicker").textContent = "PERSONALIZACIÓN";
  document.querySelector("#licenseTitle").textContent = "Editar licencia";
  document.querySelector("#licenseSubmit").textContent = "Guardar cambios";
  document.querySelector("#licenseNameInput").value = name;
  document.querySelector("#licensePreviewText").textContent = name;
  document.querySelector("#licenseDeleteSection").hidden = false;
  const count = datasets[name].length;
  document.querySelector("#licenseDeleteHint").textContent = count
    ? `${count} cliente${count === 1 ? "" : "s"} en esta licencia`
    : "Sin clientes registrados";
  paintPalette(licenseColors[name] || "#4285f4");
  document.querySelector("#licenseBackdrop").hidden = false;
  document.querySelector("#licenseNameInput").focus();
}
let deletingLicense = false;
function askDeleteLicense() {
  if (!isAdmin() || !editingLicense) return;
  if (Object.keys(datasets).length <= 1) {
    toast("Debe quedar al menos una licencia");
    return;
  }
  document.querySelector("#deleteLicenseName").textContent = editingLicense;
  const count = datasets[editingLicense].length;
  document.querySelector("#deleteLicenseWarning").textContent = count
    ? `Se eliminarán ${count} cliente${count === 1 ? "" : "s"} de esta licencia. Esta acción no se puede deshacer.`
    : "Esta acción no se puede deshacer.";
  if (window.sbConfigured?.()) document.querySelector("#deleteLicenseWarning").textContent =
    "Se retirará esta licencia del panel en todos los dispositivos. Los registros de clientes y cuentas se conservan en la base de datos.";
  document.querySelector("#deleteLicenseBackdrop").hidden = false;
}
async function confirmDeleteLicense() {
  if (!isAdmin() || deletingLicense || !editingLicense || rowActionBusy || migrationBusy) return;
  if(window.panelSync?.connected())return panelRemote("licenseDelete");
  deletingLicense = true;
  const name = editingLicense,
    tab = [...document.querySelectorAll(".tab[data-license]")].find((t) => t.dataset.license === name);
  closeDialog("#deleteLicenseBackdrop");
  closeDialog("#licenseBackdrop");
  removeLicenseCatalog(name);
  delete datasets[name];
  delete licenseColors[name];
  delete accessUrls[name];
  delete masterAccounts[name];
  for (const staff of staffUsers) staff.licenses = staff.licenses.filter((k) => k !== name);
  persistMasters();
  persistStaff();
  tab?.remove();
  if (current === name) current = Object.keys(datasets)[0];
  if (masterLicense === name) masterLicense = current;
  filterMode = "all";
  editingLicense = null;
  tapCount = 0;
  persist();
  render();
  animateListIn();
  if (activeView === "masters") renderMasters();
  deletingLicense = false;
  toast("Licencia eliminada");
}
function bindLicenseTab(tab) {
  tab.addEventListener("click", () => selectLicense(tab.dataset.license));
}
function createLicense(e) {
  e.preventDefault();
  if (!isAdmin()) return;
  const name = document.querySelector("#licenseNameInput").value.trim(),
    color = document.querySelector("#licenseColorInput").value;
  if (!name) return;
  if (Object.keys(datasets).some((k) => k.toLowerCase() === name.toLowerCase() && k !== editingLicense)) {
    toast("Esa licencia ya existe");
    return;
  }
  if(window.panelSync?.connected())return panelRemote("licenseSave",{name,color});
  saveLicenseCatalog(name, editingLicense);
  if (editingLicense) {
    const old = editingLicense;
    if (old !== name) {
      const updated = {};
      for (const key of Object.keys(datasets)) updated[key === old ? name : key] = datasets[key];
      datasets = updated;
      delete licenseColors[old];
      const tab = [...document.querySelectorAll(".tab[data-license]")].find((t) => t.dataset.license === old);
      if (tab) {
        tab.dataset.license = name;
        tab.innerHTML = `${esc(name)} <span class="tab-count">00</span>`;
      }
      if (accessUrls[old] && !accessUrls[name]) accessUrls[name] = accessUrls[old];
      if (current === old) current = name;
      if (masterAccounts[old]) {
        masterAccounts[name] = masterAccounts[old];
        delete masterAccounts[old];
        persistMasters();
      }
      for (const staff of staffUsers) staff.licenses = staff.licenses.map((k) => (k === old ? name : k));
      persistStaff();
      if (masterLicense === old) masterLicense = name;
    }
    licenseColors[name] = color;
    editingLicense = null;
    persist();
    render();
    closeDialog("#licenseBackdrop");
    if (activeView === "masters") renderMasters();
    toast("Licencia actualizada");
    return;
  }
  datasets[name] = [];
  licenseColors[name] = color;
  const tab = document.createElement("button");
  tab.className = "tab";
  tab.dataset.license = name;
  tab.innerHTML = `${esc(name)} <span class="tab-count">00</span>`;
  bindLicenseTab(tab);
  document.querySelector("#tabs").append(tab);
  masterAccounts[name] = [];
  persistMasters();
  masterLicense = name;
  selectLicense(name);
  if (activeView === "masters") renderMasters();
  closeDialog("#licenseBackdrop");
  toast("Licencia creada");
}
const rangeState = {
  create: { month: new Date(), start: null, end: null },
  renew: { month: new Date(), start: null, end: null },
  master: { month: new Date(), start: null, end: null },
  edit: { month: new Date(), start: null, end: null },
};
function initCalendar(kind) {
  rangeState[kind] = {
    month: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    start: null,
    end: null,
  };
  renderCalendar(kind);
}
function updateRangeSummary(kind) {
  const r = rangeState[kind],
    el = document.querySelector("#" + kind + "RangeSummary");
  el.textContent = !r.start
    ? "Toca la fecha de inicio y después la fecha final."
    : !r.end
      ? `Inicio: ${formatDate(r.start + "T12:00:00")} · toca la fecha final.`
      : `${formatDate(r.start + "T12:00:00")} — ${formatDate(r.end + "T12:00:00")} · ${rangeDays(r.start, r.end)} día${rangeDays(r.start, r.end) === 1 ? "" : "s"}`;
}
function renderCalendar(kind) {
  const r = rangeState[kind],
    host = document.querySelector("#" + kind + "Calendar"),
    year = r.month.getFullYear(),
    month = r.month.getMonth(),
    first = (new Date(year, month, 1).getDay() + 6) % 7,
    last = new Date(year, month + 1, 0).getDate();
  const title = new Intl.DateTimeFormat("es-BO", { month: "long", year: "numeric" }).format(r.month),
    week = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
  let cells = week.map((d) => `<div class="cal-week">${d}</div>`).join("");
  for (let j = 0; j < first; j++) cells += '<div class="cal-empty"></div>';
  for (let day = 1; day <= last; day++) {
    const iso = dateLocal(new Date(year, month, day)),
      endpoints = iso === r.start || iso === r.end,
      between = r.start && r.end && iso > r.start && iso < r.end;
    cells += `<button type="button" class="cal-day ${iso === dateLocal(new Date()) ? "today" : ""} ${endpoints ? "picked" : ""} ${between ? "in-range" : ""}" data-date="${iso}" ${iso === dateLocal(new Date()) ? 'aria-label="Hoy, ' + day + " de " + title + '"' : ""}>${day}</button>`;
  }
  host.innerHTML = `<div class="cal-header"><button type="button" class="cal-nav" data-month="-1" aria-label="Mes anterior">‹</button><strong>${esc(title)}</strong><button type="button" class="cal-nav" data-month="1" aria-label="Mes siguiente">›</button></div><div class="cal-grid">${cells}</div>${year === new Date().getFullYear() && month === new Date().getMonth() ? '<div class="cal-today-hint"><i></i> Hoy</div>' : ""}`;
  updateRangeSummary(kind);
}
function selectCalendarDate(kind, iso) {
  const r = rangeState[kind];
  if (!r.start || r.end || iso < r.start) {
    r.start = iso;
    r.end = null;
  } else r.end = iso;
  renderCalendar(kind);
}
function getRange(kind) {
  const r = rangeState[kind];
  if (!r.start || !r.end) {
    toast("Elige el inicio y el final en el calendario");
    return null;
  }
  return {
    start: new Date(r.start + "T00:00:00"),
    end: new Date(r.end + "T23:59:59"),
    total: rangeDays(r.start, r.end),
  };
}
function selectDuration(choice) {
  durationChoice = choice;
  document
    .querySelectorAll("#durationChoices .duration-option")
    .forEach((b) => b.classList.toggle("selected", b.dataset.duration === choice));
  document.querySelector("#customDates").hidden = choice !== "custom";
  document.querySelector("#durationNote").textContent =
    choice === "month1"
      ? "30 días desde hoy"
      : choice === "month2"
        ? "60 días desde hoy"
        : "Elige el rango en el calendario";
  if (choice === "custom") renderCalendar("create");
}
function sellableAccounts(name) {
  const list = masterItems(name);
  return list.length
    ? list.filter((m) => m.enabled && !masterDays(m).expired && !masterDays(m).future).map((m) => m.number)
    : [1, 2, 3, 4];
}

// ═══════════════════════════════════════════════════════════════════════════
// ✅ GENERADOR DE CONTRASEÑA: 3 números + 3 letras mayúsculas (6 caracteres)
// ═══════════════════════════════════════════════════════════════════════════
function generateClientPassword() {
  const numbers = '0123456789';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // Función criptográficamente segura para obtener un entero aleatorio
  function randomInt(max) {
    try {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      // Rechazar valores que introduzcan sesgo (para máxima aleatoriedad)
      const limit = Math.floor(0xFFFFFFFF / max) * max;
      let val = buf[0];
      while (val >= limit) {
        crypto.getRandomValues(buf);
        val = buf[0];
      }
      return val % max;
    } catch (e) {
      return Math.floor(Math.random() * max);
    }
  }

  const chars = [];
  // 3 números
  for (let i = 0; i < 3; i++) {
    chars.push(numbers[randomInt(numbers.length)]);
  }
  // 3 letras mayúsculas
  for (let i = 0; i < 3; i++) {
    chars.push(letters[randomInt(letters.length)]);
  }
  // Mezclar el orden (Fisher-Yates)
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

// Inyecta el botón "regenerar" al lado del campo de contraseña (solo una vez)
function ensurePasswordRegenerateButton() {
  if (document.getElementById('flow-regen-pass-btn')) return;
  const passInput = document.getElementById('createPassword');
  if (!passInput) return;

  // Envolver el input en un contenedor flexible
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'display:flex;gap:8px;align-items:stretch;width:100%;';
  passInput.parentNode.insertBefore(wrapper, passInput);
  wrapper.appendChild(passInput);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'flow-regen-pass-btn';
  btn.title = 'Generar nueva contraseña';
  btn.setAttribute('aria-label', 'Generar nueva contraseña');
  btn.style.cssText = 'flex:none;width:44px;min-width:44px;border-radius:12px;border:1px solid var(--card-border);background:var(--card-bg);color:var(--text-main);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;';
  btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`;
  btn.addEventListener('mouseenter', () => { btn.style.borderColor = 'var(--link-color)'; btn.style.color = 'var(--link-color)'; });
  btn.addEventListener('mouseleave', () => { btn.style.borderColor = 'var(--card-border)'; btn.style.color = 'var(--text-main)'; });
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    passInput.value = generateClientPassword();
    passInput.dispatchEvent(new Event('input', { bubbles: true }));
    // Animación breve
    if (window.NovaMotion?.play) {
      window.NovaMotion.play(passInput, [
        { boxShadow: '0 0 0 3px var(--accent-soft)' },
        { boxShadow: '0 0 0 0 transparent' }
      ], { duration: 600 });
    }
  });

  wrapper.appendChild(btn);
}

// Pre-llena el campo de contraseña si está vacío
function prefillCreatePassword() {
  const passInput = document.getElementById('createPassword');
  if (passInput && !passInput.value) {
    passInput.value = generateClientPassword();
  }
}

function openCreate() {
  if(window.panelSync?.busy){toast("Espera a que termine el guardado");return;}
  if (creatingUser || !canSell(current)) return;
  const connected = window.sbConfigured?.();
  const accounts = sellableAccounts(current).filter((number) =>
    !connected || masterItems(current).some((m) => m.number === number && m._id),
  );
  if (!accounts.length) {
    toast("No hay cuentas maestras activas para esta licencia");
    return;
  }
  document.querySelector("#createTitle").textContent = current;
  document.querySelector("#createAccount").innerHTML = '<option value="" selected hidden>Seleccionar cuenta</option>' + accounts
    .map((n) => {
      const master = masterItems(current).find((m) => m.number === n);
      return `<option value="${n}" data-master-id="${esc(master?._id || "")}">${esc(accountCaption(current, n))}</option>`;
    })
    .join("");

  
  document.querySelector("#createForm").reset();

    // ✅ Pre-llenar contraseña automática (3 números + 3 letras mayúsculas)
  ensurePasswordRegenerateButton();
  prefillCreatePassword();
  closeNovaSelect(document.querySelector('[data-select="createAccount"]'));
  syncNovaSelect("createAccount");
  document.querySelector("#createTrial").checked = false;
  document.querySelector("#durationChoices").classList.remove("disabled");
  document.querySelectorAll("#durationChoices .duration-option").forEach((b) => (b.disabled = false));
  initCalendar("create");
  selectDuration("month1");
  document.querySelector("#createBackdrop").hidden = false;
  document.querySelector("#createEmail").focus();
}
function prepareUser() {
  const email =
      document.querySelector("#createEmail").value.trim() ||
      `Nuevo usuario ${(datasets[current] || []).length + 1}`,
    phone = document.querySelector("#createPhone").value.trim(),
    password = document.querySelector("#createPassword").value.trim(),
    account = Number(document.querySelector("#createAccount").value),
    isTrial = document.querySelector("#createTrial").checked;
  if (!account || !sellableAccounts(current).includes(account)) {
    toast("Selecciona una cuenta para el cliente");
    document.querySelector('[data-select="createAccount"] .nova-select-trigger').focus();
    return null;
  }
  const masterId = document.querySelector("#createAccount").selectedOptions[0]?.dataset.masterId;
  if (window.sbConfigured?.() && !masterItems(current).some((m) =>
    String(m._id) === masterId && m.enabled && !masterDays(m).expired && !masterDays(m).future,
  )) {
    toast("La cuenta elegida ya no está disponible. Actualiza y vuelve a seleccionarla.");
    return null;
  }
  const now = new Date();
  let start = now,
    end,
    total,
    left,
    expiresAt = null;
  if (isTrial) {
    total = 1;
    left = 1;
    expiresAt = Date.now() + 3600000;
    end = new Date(expiresAt);
  } else if (durationChoice === "month1") {
    total = 30;
    left = 30;
    end = addDays(start, 30);
  } else if (durationChoice === "month2") {
    total = 60;
    left = 60;
    end = addDays(start, 60);
  } else {
    const r = getRange("create");
    if (!r) return null;
    ({ start, end, total } = r);
    left = total;
  }
  return {
    device: "Pendiente",
    email,
    phone,
    password,
    status: end.getTime() > Date.now() ? "Activo" : "Inactivo",
    account,
    _masterId: masterId || null,
    total,
    left,
    creator: adminName,
    isTrial,
    expiresAt,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

function invitationText(u, license = current) {
  const now = new Date();
  const left = getDaysLeft(u);
  const total = Math.max(1, Number(u.total) || 30);
  const end = u.endDate
    ? new Date(u.endDate)
    : u.isTrial && u.expiresAt
      ? new Date(u.expiresAt)
      : addDays(now, left);

  // Formato de fecha: DD/MM/YYYY (o fecha+hora si es trial)
  const dateEnd = u.isTrial
    ? new Intl.DateTimeFormat("es-BO", { dateStyle: "short", timeStyle: "short" }).format(end)
    : formatDate(end);

  const days = u.isTrial ? "1 hora" : `${total} días`;

  // Obtener la contraseña (o placeholder si no está disponible)
  let password = "Consultar con soporte";
  try {
    if (typeof availableClientPassword === "function") {
      const pw = availableClientPassword(u);
      if (pw && typeof pw === "string" && pw.trim()) password = pw.trim();
    }
  } catch (e) {}

  // Si el nombre de la licencia ya incluye PRO/ULTRA/PLUS, no duplicar el sufijo
  const licenseUpper = String(license).toUpperCase();
  const licenseTitle = /PRO\b|ULTRA\b|PLUS\b/i.test(licenseUpper)
    ? licenseUpper
    : `${licenseUpper} PRO`;

  const installUrl = "https://ultrashopfull.github.io/web/";
  const whatsappUrl = "https://chat.whatsapp.com/GNfUe0vyrD46DNz6o2Ao1h?s=cl&p=a&iam=2";

  return `💎 LICENCIA ${licenseTitle}

📧 Usuario/correo: ${u.email || "—"}
🔑 Contraseña: ${password}
📅 Finaliza: ${dateEnd}
⏳ Duración: ${days}

📲 *INSTALACIÓN*

1. Ingresa a: ${installUrl}
2. Selecciona tu licencia e ingresa tus datos.
3. Sigue el tutorial de instalación para tu dispositivo.

💬 SOPORTE Y COMUNIDAD
Únete a nuestro grupo de WhatsApp:
${whatsappUrl}

✅ ¡Gracias por tu compra! 🛍️`;
}

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  const el = document.createElement("textarea");
  el.value = text;
  el.style.position = "fixed";
  el.style.opacity = "0";
  document.body.append(el);
  el.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {}
  el.remove();
  return ok;
}
let ocrScriptPromise = null,
  scanToken = 0,
  scanWorker = null,
  scanWorkerPromise = null,
  scanObjectUrl = null;
// The OCR engine and language are ordinary files in vendor/ocr/.
// Use a local HTTP server for this optional feature; the UI also opens as a file.
function loadOCR() {
  if (ocrScriptPromise) return ocrScriptPromise;
  ocrScriptPromise = (async () => {
    if (!window.Tesseract) throw new Error("Motor OCR no disponible");
    if (location.protocol === "file:") {
      throw new Error("Para leer capturas, abre el proyecto con un servidor local.");
    }
    const base = new URL("vendor/ocr/", document.baseURI);
    return {
      OCR: window.Tesseract,
      workerUrl: new URL("ocr-worker.js", base).href,
      langPath: base.href,
    };
  })().catch((error) => {
    ocrScriptPromise = null;
    throw error;
  });
  return ocrScriptPromise;
}
async function getOCRWorker() {
  if (scanWorker) return scanWorker;
  if (scanWorkerPromise) return scanWorkerPromise;
  scanWorkerPromise = (async () => {
    const { OCR, workerUrl, langPath } = await loadOCR();
    const worker = await OCR.createWorker("eng", 1, {
      workerPath: workerUrl,
      workerBlobURL: false,
      langPath,
      logger: (event) => scanLogger(event, scanToken),
    });
    scanWorker = worker;
    return worker;
  })().catch((error) => {
    scanWorkerPromise = null;
    throw error;
  });
  return scanWorkerPromise;
}
function setScanProgress(status, percent) {
  document.querySelector("#scanStatus").textContent = status;
  const n = Math.max(0, Math.min(100, Math.round(percent)));
  document.querySelector("#scanPercent").textContent = n + "%";
  document.querySelector("#scanProgressBar").style.width = n + "%";
}
function scanLogger(event, token) {
  if (token !== scanToken) return;
  const status = event.status || "",
    p = event.progress || 0;
  if (status.includes("recognizing")) setScanProgress("Leyendo el número de la captura…", 50 + p * 45);
  else if (status.includes("language")) setScanProgress("Preparando idioma…", 16 + p * 24);
  else if (status.includes("core") || status.includes("initializing"))
    setScanProgress("Iniciando reconocimiento…", 30 + p * 18);
}
function extractPhoneCandidates(text) {
  const lines = String(text || "")
      .split(/\n/)
      .map((x) => x.trim())
      .filter(Boolean),
    found = new Map();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i],
      combined = /^\+?\d{1,4}$/.test(line) && lines[i + 1] ? line + " " + lines[i + 1] : line;
    for (const match of combined.matchAll(/(?:\+|00)?\d[\d\s().-]{6,22}\d/g)) {
      const raw = match[0].trim(),
        digits = raw.replace(/\D/g, "");
      if (digits.length < 8 || digits.length > 15) continue;
      let score = Math.max(0, 12 - i) * 0.45;
      if (raw.includes("+")) score += 6;
      if (digits.startsWith("591") && digits.length === 11) score += 10;
      if (digits.length === 8 && /^[67]/.test(digits)) score += 8;
      if (digits.length >= 10 && digits.length <= 13) score += 3;
      if (/tel[eé]fono|whatsapp|m[oó]vil|celular|phone|n[uú]mero/i.test(line)) score += 4;
      if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(raw)) score -= 15;
      if (/^(19|20)\d{6}$/.test(digits)) score -= 8;
      if (score < 6) continue;
      const number =
        digits.length === 8 && /^[67]/.test(digits)
          ? "+591" + digits
          : raw.startsWith("00")
            ? "+" + digits.slice(2)
            : (raw.startsWith("+") ? "+" : "") + digits;
      const previous = found.get(number);
      if (!previous || score > previous.score) found.set(number, { number, score });
    }
  }
  return [...found.values()].sort((a, b) => b.score - a.score).slice(0, 4);
}
function stopScan() {
  scanToken++;
  document.querySelector("#scanBackdrop").hidden = true;
  if (scanObjectUrl) {
    URL.revokeObjectURL(scanObjectUrl);
    scanObjectUrl = null;
  }
}
async function useScannedNumber(number) {
  const token = scanToken;
  document.querySelector("#scanViewport").classList.add("found");
  setScanProgress("Número detectado", 100);
  document.querySelector("#scanCandidates").hidden = false;
  document.querySelector("#scanCandidates").innerHTML =
    `<div class="scan-result"><span>✓</span><strong>${esc(number)}</strong></div>`;
  const copied = await copyText(number);
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (token !== scanToken) return;
  stopScan();
  openCreate();
  const phone = document.querySelector("#createPhone");
  phone.value = number;
  phone.classList.remove("auto-filled");
  void phone.offsetWidth;
  phone.classList.add("auto-filled");
  phone.focus();
  toast(copied ? "Número copiado y añadido al nuevo acceso" : "Número añadido al nuevo acceso");
}
async function prepareScanImage(file, topOnly = true) {
  if (!window.createImageBitmap) return file;
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
    const sourceHeight = topOnly ? Math.min(bitmap.height, Math.ceil(bitmap.height * 0.72)) : bitmap.height;
    const scale = Math.min(1, (topOnly ? 1450 : 1600) / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(sourceHeight * scale));
    canvas
      .getContext("2d")
      .drawImage(bitmap, 0, 0, bitmap.width, sourceHeight, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return await new Promise((resolve) => canvas.toBlob((blob) => resolve(blob || file), "image/png"));
  } catch {
    bitmap?.close();
    return file;
  }
}
async function processScreenshot(file) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    toast("Selecciona una imagen o captura");
    return;
  }
  stopScan();
  const token = scanToken,
    backdrop = document.querySelector("#scanBackdrop");
  scanObjectUrl = URL.createObjectURL(file);
  document.querySelector("#scanPreview").src = scanObjectUrl;
  document.querySelector("#scanViewport").classList.remove("found");
  document.querySelector("#scanCandidates").hidden = true;
  document.querySelector("#scanCandidates").innerHTML = "";
  document.querySelector("#scanHint").textContent =
    "Lectura local disponible sin conexión. La primera captura puede tardar unos segundos.";
  backdrop.hidden = false;
  setScanProgress("Preparando captura…", 8);
  try {
    const image = await prepareScanImage(file, true);
    const worker = await getOCRWorker();
    if (token !== scanToken) return;
    setScanProgress("Leyendo contacto…", 48);
    let result = await worker.recognize(image, { rotateAuto: false });
    if (token !== scanToken) return;
    let candidates = extractPhoneCandidates(result.data.text);
    if (!candidates.length && image !== file) {
      setScanProgress("Revisando toda la captura…", 65);
      result = await worker.recognize(await prepareScanImage(file, false), { rotateAuto: false });
      if (token !== scanToken) return;
      candidates = extractPhoneCandidates(result.data.text);
    }
    setScanProgress("Captura analizada", 97);
    if (!candidates.length) {
      document.querySelector("#scanViewport").classList.add("found");
      document.querySelector("#scanHint").textContent =
        "No encontramos un número legible. Puedes elegir otra captura o ingresarlo manualmente.";
      setScanProgress("No se detectó un celular", 100);
      return;
    }
    if (candidates.length > 1 && candidates[0].score - candidates[1].score < 3) {
      document.querySelector("#scanViewport").classList.add("found");
      document.querySelector("#scanHint").textContent =
        "Hay varios números posibles. Toca el del contacto para completar el acceso.";
      document.querySelector("#scanCandidates").hidden = false;
      document.querySelector("#scanCandidates").innerHTML = candidates
        .map(
          (c) =>
            `<button type="button" class="scan-choice" data-scanned-number="${esc(c.number)}">${esc(c.number)} <span>Usar ›</span></button>`,
        )
        .join("");
      setScanProgress("Elige el número correcto", 100);
      return;
    }
    await useScannedNumber(candidates[0].number);
  } catch (error) {
    if (token !== scanToken) return;
    document.querySelector("#scanViewport").classList.add("found");
    setScanProgress("No se pudo leer la captura", 0);
    document.querySelector("#scanHint").textContent =
      "Prueba otra captura más nítida o ingresa el número manualmente.";
  }
}
let creatingUser = false;
function animateNewAccess() {
  document.querySelector("#creationSuccess").hidden = true;
  window.NovaMotion?.play(
    document.querySelector("#userRows tr"),
    [
      { opacity: 0, transform: "translateY(-10px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    { duration: 500 },
  );
  window.NovaMotion?.row(0, "create");
}
async function saveCreated(copy) {
  if (creatingUser || !canSell(current)) return;
  const u = prepareUser();
  if (!u) return;
  const createdLicense = current;
  if(window.panelSync?.connected())return panelRemote("create",{u,copy});
  creatingUser = true;
  if (typeof window.sbConfigured === "function" && window.sbConfigured()) {
    let savedToDatabase = false, assignmentError = false;
    try {
      const password = u.password || Math.random().toString(36).slice(2, 10);
      const productKey = licenseProductKey(createdLicense);
      const selectedMaster = masterItems(createdLicense).find((m) => String(m._id) === u._masterId);
      const created = await window.sbApi("crear_cliente", "POST", {
        usuario: u.email,
        password,
        email: u.email,
        telefono: u.phone || null,
        nombre_completo: u.email,
        dias: u.total,
        productos: [productKey],
      });
      savedToDatabase = true;
      rememberClientPassword(created.cliente_id, password);
      // The insert is confirmed. Close the form so a failed refresh cannot
      // invite the user to submit the same client a second time.
      closeDialog("#createBackdrop");
      // The existing create endpoint picks its own first account. Apply the
      // user's choice by database ID through the existing assignment endpoint.
      try {
        if (!created.cliente_id) throw new Error("No se recibió el identificador del cliente");
        await window.sbApi("migrar_cuenta", "POST", {
          cliente_id: created.cliente_id,
          nueva_cuenta_id: selectedMaster._id,
          producto: productKey,
        });
      } catch {
        assignmentError = true;
      }
      const refreshedClients = await window.sbLoadClients();
      const savedClient = refreshedClients.find((client) => String(client.id) === String(created.cliente_id));
      if (createdLicense in datasets) current = createdLicense;
      filterMode = "all";
      document.querySelector("#search").value = "";
      closeFilter();
      persist();
      render();
      animateNewAccess();
      document.querySelector("#userRows tr")?.scrollIntoView({ block: "nearest" });
      if (assignmentError || !savedClient || savedClient.cuenta_maestra_email !== selectedMaster._email) {
        toast(`Cliente creado, pero no se pudo confirmar Cuenta ${u.account}. Revisa su cuenta antes de usar el acceso.`);
        return;
      }
      toast("Usuario creado (contraseña: " + password + ")");
      return;
    } catch (e) {
      if (typeof toast === "function") toast(savedToDatabase
        ? assignmentError
          ? "Cliente guardado. No se pudo confirmar la cuenta ni actualizar la lista; pulsa Actualizar y revisa su cuenta."
          : "Cliente guardado en la base de datos. No se pudo actualizar la lista; pulsa Actualizar."
        : "Error Supabase: " + e.message, "error");
      return;
    } finally {
      creatingUser = false;
    }
  }
  datasets[current].unshift(u);
  filterMode = "all";
  document.querySelector("#search").value = "";
  closeFilter();
  persist();
  render();
  closeDialog("#createBackdrop");
  animateNewAccess();
  document.querySelector("#userRows tr")?.scrollIntoView({ block: "nearest" });
  if (copy) {
    const copied = await copyText(invitationText(u));
    toast(copied ? "Usuario creado y mensaje copiado" : "Usuario creado; el navegador no permitió copiar");
  } else toast("Usuario creado correctamente");
  creatingUser = false;
}
function openEdit(i, field) {
  if(window.panelSync?.busy){toast("Espera a que termine el guardado");return;}
  if (!isAdmin()) return;
  const u = datasets[current][i];
  window.panelSync?.remember("edit",u);
  document.querySelector("#editIndex").value = i;
  document.querySelector("#editField").value = field;
  document.querySelector("#editTitle").textContent =
    field === "email" ? "Editar usuario" : field === "phone" ? "Editar celular" : "Editar duración";
  const wrap = document.querySelector("#editValueWrap");
  wrap.innerHTML =
    field === "duration"
      ? `<label class="field-label">${u.isTrial ? "Minutos de prueba" : "Días restantes"}</label><input class="input" id="editValue" type="number" min="0" value="${u.isTrial ? Math.ceil((getTimeLeft(u) || 0) / 60000) : getDaysLeft(u)}">`
      : `<label class="field-label">${field === "email" ? "Usuario" : "Celular"}</label><input class="input" id="editValue" value="${esc(u[field])}" type="text">`;
  document.querySelector("#editBackdrop").hidden = false;
  document.querySelector("#editValue").focus();
}
async function saveEdit(ev) {
  ev.preventDefault();
  if (!isAdmin()) return;
  if (rowActionBusy) return;
  const i = Number(document.querySelector("#editIndex").value),
    field = document.querySelector("#editField").value,
    u = datasets[current][i],
    v = document.querySelector("#editValue").value.trim();
  if (!u) return;
  if(window.panelSync?.connected())return panelRemote("edit",{u,field,value:v});
  rowActionBusy = true;
  closeDialog("#editBackdrop");
  await animateRowAction(i, "row-renewing", 620, "edit");
  if (field === "duration") {
    u.left = Math.max(0, Number(v));
    if (u.isTrial) {
      u.expiresAt = Date.now() + u.left * 60000;
      u.endDate = new Date(u.expiresAt).toISOString();
    } else {
      u.endDate = addDays(new Date(), u.left).toISOString();
    }
    u.status = u.left > 0 ? "Activo" : "Inactivo";
  } else u[field] = v;
  persist();
  render();
  document.querySelector(`#userRows tr[data-index="${i}"]`)?.classList.add("row-renewed");
  toast("Cambios guardados");
  rowActionBusy = false;
}

async function copyAccess(index) {
  if (!canSell(current)) return;
  const u = datasets[current]?.[index];
  if (!u) return;
  const copied = await copyText(invitationText(u, current));
  if (copied) {
    animateRowAction(index, "row-renewed", 520, "copy");
    toast("Datos del acceso copiados");
  } else toast("El navegador no permitió copiar");
}
function contactWhatsApp(event, index) {
  if (!canSell(current)) {
    event.preventDefault();
    return false;
  }
  const u = datasets[current]?.[index],
    raw = String(u?.phone || "").replace(/\D/g, ""),
    digits = raw.length === 8 && /^[67]/.test(raw) ? "591" + raw : raw;
  if (digits.length < 7) {
    event.preventDefault();
    toast("Agrega un celular para abrir WhatsApp");
    return false;
  }
  event.currentTarget.href =
    "https://wa.me/" + digits + "?text=" + encodeURIComponent(renewalReminder(u, current));
  animateRowAction(index, "row-renewed", 520, "whatsapp");
  return true;
}

function renew(i) {
  if(window.panelSync?.busy){toast("Espera a que termine el guardado");return;}
  if (!canSell(current)) return;
  renewIndex = i;
  renewChoice = "month1";
  const u = datasets[current][i];
  window.panelSync?.remember("renew",u);
  document.querySelector("#renewLicenseName").textContent = current;
  document.querySelector("#renewUserName").textContent = u.email || "Sin usuario";
  document
    .querySelectorAll("[data-renew-duration]")
    .forEach((b) => b.classList.toggle("selected", b.dataset.renewDuration === "month1"));
  document.querySelector("#renewCustom").hidden = true;
  initCalendar("renew");
  document.querySelector("#renewBackdrop").hidden = false;
}
function selectRenewDuration(choice) {
  renewChoice = choice;
  document
    .querySelectorAll("[data-renew-duration]")
    .forEach((b) => b.classList.toggle("selected", b.dataset.renewDuration === choice));
  document.querySelector("#renewCustom").hidden = choice !== "custom";
  if (choice === "custom") renderCalendar("renew");
}
let rowActionBusy = false;
const effectLabels = {
  renew: ["↻", "Renovando acceso"],
  suspend: ["Ⅱ", "Suspendiendo acceso"],
  reactivate: ["▶", "Reactivando acceso"],
  delete: ["×", "Eliminando cliente"],
  edit: ["✎", "Guardando cambios"],
  migrate: ["⇄", "Cuenta migrada"],
  copy: ["⧉", "Acceso copiado"],
  whatsapp: ["↗", "Abriendo WhatsApp"],
  signout: ["↪", "Cerrando sesión"],
};
function animateRowAction(index, name, ms = 0, effect = "renew") {
  window.NovaMotion?.row(index, effect);
  return Promise.resolve();
}
async function confirmRenew() {
  if (!canSell(current) || rowActionBusy) return;
  const u = datasets[current][renewIndex];
  if (!u) return;
  let start = new Date(),
    end,
    total;
  if (renewChoice === "month1") {
    total = 30;
    end = addDays(start, 30);
  } else if (renewChoice === "month2") {
    total = 60;
    end = addDays(start, 60);
  } else {
    const r = getRange("renew");
    if (!r) return;
    ({ start, end, total } = r);
  }
  if(window.panelSync?.connected())return panelRemote("renew",{u,start,end,total});
  rowActionBusy = true;
  closeDialog("#renewBackdrop");
  await animateRowAction(renewIndex, "row-renewing", 760, "renew");
  Object.assign(u, {
    isTrial: false,
    expiresAt: null,
    total,
    left: total,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    status: end > Date.now() ? "Activo" : "Inactivo",
  });
  if (typeof window.sbConfigured === "function" && window.sbConfigured() && u._clientId) {
    try {
      await window.sbApi("renovar", "POST", {
        cliente_id: u._clientId,
        dias: total,
        monto: 0,
        metodo: "efectivo",
        referencia: null,
        producto: u._product || "chatgpt",
      });
      if (typeof window.sbLoadClients === "function") await window.sbLoadClients();
    } catch (e) {
      if (typeof toast === "function") toast("Error Supabase: " + e.message, "error");
    }
  }
  persist();
  render();
  document.querySelector(`#userRows tr[data-index="${renewIndex}"]`)?.classList.add("row-renewed");
  toast(`Renovación guardada: ${total} día${total === 1 ? "" : "s"}`);
  rowActionBusy = false;
}
function suspend(index) {
  if(window.panelSync?.busy){toast("Espera a que termine el guardado");return;}
  if (!canSell(current) || rowActionBusy || migrationBusy) return;
  const client = datasets[current]?.[index];
  if (!client) return;
  window.panelSync?.remember("suspend",client);
  suspendIndex = index;
  const reactivate = client.status === "Suspendido";
  document.querySelector("#suspendKicker").textContent = reactivate
    ? "REACTIVAR ACCESO"
    : "SUSPENDER Y CERRAR SESIÓN";
  document.querySelector("#suspendTitle").textContent = reactivate
    ? "¿Reactivar el acceso?"
    : "¿Suspender y cerrar la sesión?";
  document.querySelector("#suspendUserName").textContent = client.email || "Sin usuario";
  document.querySelector("#suspendMessage").textContent = reactivate
    ? "El cliente volverá a figurar como activo si su licencia sigue vigente."
    : "El cliente quedará suspendido y la sesión se marcará como cerrada.";
  document.querySelector("#confirmSuspend").textContent = reactivate
    ? "Reactivar acceso"
    : "Suspender y cerrar";
  document.querySelector("#suspendBackdrop").hidden = false;
}
async function confirmSuspend() {
  if (!canSell(current) || suspendIndex < 0 || rowActionBusy || migrationBusy) return;
  const index = suspendIndex,
    client = datasets[current]?.[index];
  if (!client) return;
  const reactivate = client.status === "Suspendido";
  if(window.panelSync?.connected())return panelRemote("suspend",{u:client});
  rowActionBusy = true;
  closeDialog("#suspendBackdrop");
  try {
    const valid = client.isTrial ? getTimeLeft(client) > 0 : !client.endDate || getDaysLeft(client) > 0;
    client.status = reactivate ? (valid ? "Activo" : "Inactivo") : "Suspendido";
    client.sessionClosed = !reactivate;
    client.sessionClosedAt = reactivate ? null : new Date().toISOString();
    client.suspendedAt = reactivate ? null : new Date().toISOString();
    if (typeof window.sbConfigured === "function" && window.sbConfigured() && client._clientId) {
      try {
        await window.sbApi(reactivate ? "reactivar" : "suspender", "POST", { cliente_id: client._clientId });
        if (typeof window.sbLoadClients === "function") await window.sbLoadClients();
      } catch (e) {
        if (typeof toast === "function") toast("Error Supabase: " + e.message, "error");
      }
    }
    persist();
    render();
    window.NovaMotion?.row(index, reactivate ? "reactivate" : "suspend", {
      label: reactivate ? (valid ? "ACCESO REACTIVADO" : "LICENCIA VENCIDA") : "SUSPENDIDO · SESIÓN CERRADA",
    });
  } finally {
    suspendIndex = -1;
    rowActionBusy = false;
  }
}

function removeUser(i) {
  if(window.panelSync?.busy){toast("Espera a que termine el guardado");return;}
  if (!isAdmin()) return;
  window.panelSync?.remember("delete",datasets[current][i]);
  deleteIndex = i;
  document.querySelector("#deleteUserName").textContent = datasets[current][i].email || "Sin usuario";
  document.querySelector("#deleteBackdrop").hidden = false;
}
async function confirmDelete() {
  if (!isAdmin() || deleteIndex < 0 || rowActionBusy) return;
  if(window.panelSync?.connected())return panelRemote("delete");
  rowActionBusy = true;
  const index = deleteIndex,
    license = current;
  closeDialog("#deleteBackdrop");
  await animateRowAction(index, "row-deleting", 700, "delete");
  datasets[license].splice(index, 1);
  deleteIndex = -1;
  persist();
  render();
  toast("Usuario eliminado");
  rowActionBusy = false;
}
function migrate(i) {
  if(window.panelSync?.busy){toast("Espera a que termine el guardado");return;}
  if (!isAdmin()) return;
  migrateIndex = i;
  const u = datasets[current][i];
  window.panelSync?.remember("migrate",u);
  document.querySelector("#migrateLicenseName").textContent = current;
  document.querySelector("#migrateUserName").textContent = u.email || "Sin usuario";
  const available = sellableAccounts(current).filter((n) => n !== u.account);
  if (!available.length) {
    toast("No hay otra cuenta disponible para migrar");
    return;
  }
  migrateSelection = available[0];
  renderMigrateAccounts();
  document.querySelector("#migrateBackdrop").hidden = false;
}
function renderMigrateAccounts() {
  const u = datasets[current]?.[migrateIndex];
  if (!u) return;
  document.querySelector("#migrateAccounts").innerHTML = [
    ...new Set([Number(u.account), ...sellableAccounts(current).map(Number)]),
  ]
    .sort((a, b) => a - b)
    .map((n) => {
      const actual = n === Number(u.account),
        selected = n === Number(migrateSelection);
      return `<button type="button" class="account-option ${actual ? "current" : ""} ${selected ? "selected" : ""}" data-account="${n}" ${actual ? "disabled" : ""} aria-pressed="${selected}"><span class="account-option-head"><span>Cuenta ${n}</span>${actual ? '<b class="account-current-badge">Actual</b>' : selected ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4 10-10"/></svg>' : ""}</span><small class="account-option-email">${esc(accountEmail(current, n))}</small></button>`;
    })
    .join("");
}
let migrationBusy = false;
async function confirmMigrate() {
  if (!isAdmin() || migrationBusy || rowActionBusy) return;
  const index = migrateIndex,
    license = current,
    u = datasets[license]?.[index];
  if (!u || migrateSelection === u.account) return;
  if(window.panelSync?.connected()){
    const backdrop=document.querySelector("#migrateBackdrop");
    try{
      await panelRemote("migrate",{u});
    }finally{
      // Garantiza que el modal se cierre siempre, incluso si panelRemote falla
      if(backdrop){backdrop.hidden=true;backdrop.classList.remove("is-migrating");}
      migrationBusy=false;
    }
    return;
  }
  const from = u.account,
    to = migrateSelection,
    backdrop = document.querySelector("#migrateBackdrop"),
    stage = document.querySelector("#migrationStage");
  migrationBusy = true;
  backdrop.style.setProperty("--migration-color", licenseColors[license] || "#10a37f");
  stage.querySelector("[data-migration-from]").textContent = accountCaption(license, from);
  stage.querySelector("[data-migration-to]").textContent = accountCaption(license, to);
  stage.querySelector("[data-migration-person]").textContent = u.email || "Sin usuario";
  stage.classList.remove("is-complete", "is-error");
  const migrationTitle = stage.querySelector(".migration-title"),
    caption = stage.querySelector("[data-migration-caption]");
  migrationTitle.textContent = "Moviendo acceso";
  caption.textContent = "Preparando transferencia…";
  stage.hidden = false;
  backdrop.classList.add("is-migrating");
  backdrop.querySelector(".dialog").setAttribute("aria-busy", "true");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phaseTimers = [];
  if (!reduced) {
    phaseTimers.push(
      setTimeout(() => {
        caption.textContent = "Transfiriendo el acceso…";
      }, 540),
    );
    phaseTimers.push(
      setTimeout(() => {
        caption.textContent = "Verificando cuenta de destino…";
      }, 1340),
    );
  }
  try {
    if (!reduced) await new Promise((resolve) => setTimeout(resolve, 1820));

    // ✅ FIX 1: u._id → u._clientId (los clientes se identifican con _clientId, no _id)
    if (typeof window.sbConfigured === "function" && window.sbConfigured() && u._clientId) {
      const targetMaster = (masterAccounts[license] || []).find((m) => m.number === to);

      // ✅ FIX 2: quitar la condición redundante u._clientId (ya validado arriba)
      if (targetMaster?._id) {
        try {
          await window.sbApi("migrar_cuenta", "POST", {
            cliente_id: u._clientId,
            nueva_cuenta_id: targetMaster._id,
            producto: u._product || "chatgpt",
          });
          if (typeof window.sbLoadClients === "function") await window.sbLoadClients();
        } catch (e) {
          if (typeof toast === "function") toast("Error Supabase: " + e.message, "error");
        }
      }
    }
    u.account = to;
    // Confirmar el guardado antes de mostrar el estado de éxito.
    persist();
    render();
    stage.classList.add("is-complete");
    migrationTitle.textContent = "Migración completada";
    caption.textContent = "Acceso asignado a " + accountCaption(license, to);
    if (!reduced) await new Promise((resolve) => setTimeout(resolve, 680));
    closeDialog("#migrateBackdrop");
    window.NovaMotion?.row(index, "migrate");
    toast(`Usuario migrado a Cuenta ${to}`);
  } catch (error) {
    u.account = from;
    stage.classList.add("is-error");
    migrationTitle.textContent = "No se pudo migrar";
    caption.textContent = "Los cambios no se han confirmado.";
    if (!reduced) await new Promise((resolve) => setTimeout(resolve, 850));
    toast("No se pudo completar la migración");
  } finally {
    phaseTimers.forEach(clearTimeout);
    backdrop.classList.remove("is-migrating");
    backdrop.querySelector(".dialog").removeAttribute("aria-busy");
    stage.classList.remove("is-complete", "is-error");
    stage.hidden = true;
    migrationBusy = false;
  }
}
function closeProfileMenu() {
  document.querySelector("#profileMenu").hidden = true;
  document.querySelector("#profileMenuBtn").setAttribute("aria-expanded", "false");
}
function toggleProfileMenu() {
  const menu = document.querySelector("#profileMenu");
  menu.hidden = !menu.hidden;
  document.querySelector("#profileMenuBtn").setAttribute("aria-expanded", String(!menu.hidden));
  closeFilter();
}
function openMasterAccounts() {
  if (!isAdmin()) return;
  closeProfileMenu();
  masterLicense = current;
  showView("masters");
}
/* Team users and master account inventory. This local prototype keeps data in this browser. */
function applyRole() {
  const admin = isAdmin(),
    person = currentStaff();
  document.body.classList.toggle("seller-mode", !admin);
  document.querySelector("#menuUsers").hidden = !admin;
  document.querySelector("#menuAccounts").hidden = !admin;
  const disconnectItem = document.querySelector("#menuDisconnect");
  if (disconnectItem)
    disconnectItem.hidden = !(typeof window.sbConfigured === "function" && window.sbConfigured());
  document.querySelector("#menuStats").hidden = !admin;
  document.querySelector("#licenseManagerBtn").hidden = !admin;
  document.querySelector(".profile-name").textContent =
    person?.displayName || (person?.id === "victor1234" ? adminName : person?.username) || "Usuario";
  const profileLogin = document.querySelector("#menuProfileUsername");
  if (profileLogin) profileLogin.textContent = person?.username || "";
  if (!admin && activeView !== "clients") showView("clients");
  render();
  if (activeView === "stats") renderStatistics();
}
function showView(view) {
  maskClientPasswords();
  if (view !== "clients" && !isAdmin()) view = "clients";
  activeView = view;
  for (const [id, section] of [
    ["menuClients", "clients"],
    ["menuStats", "stats"],
    ["menuUsers", "staff"],
    ["menuAccounts", "masters"],
  ]) {
    const item = document.getElementById(id);
    if (view === section) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  }
  document.querySelector(".workspace").hidden = view !== "clients";
  document.querySelector("#staffView").hidden = view !== "staff";
  document.querySelector("#mastersView").hidden = view !== "masters";
  document.querySelector("#statisticsView").hidden = view !== "stats";
  closeLicenseManager();
  if (view === "staff") renderStaff();
  if (view === "masters") renderMasters();
  if (view === "stats") renderStatistics();
  document.querySelector("#app").scrollIntoView({ behavior: "smooth", block: "start" });
  window.panelSync?.background();
}
function userLastAccess(iso) {
  if (!iso) return "Nunca";
  const then = new Date(iso),
    now = new Date(),
    days = Math.floor((now - then) / 86400000);
  if (dateLocal(then) === dateLocal(now))
    return "Hoy, " + new Intl.DateTimeFormat("es-BO", { hour: "2-digit", minute: "2-digit" }).format(then);
  if (days <= 1) return "Ayer";
  return "Hace " + days + " días";
}
function staffLoginUrl() {
  return window.location?.protocol?.startsWith("http")
    ? window.location.href.split("#")[0]
    : "licencias-admin.html";
}
function staffCopyText(u, full = false) {
  return (
    `Usuario: ${u.username}\n` +
    (u.password ? `Contraseña: ${u.password}\n` : "") +
    `Ingreso: ${staffLoginUrl()}` +
    (full
      ? `\nRol: ${u.role === "admin" ? "Administrador" : "Vendedor"}\nLicencias: ${u.role === "admin" ? "Todas" : u.licenses.join(", ")}`
      : "")
  );
}
function renderStaff() {
  if (!isAdmin()) return;
  document.querySelector("#staffRows").innerHTML = staffUsers
    .map((u) => {
      const self = u.id === sessionUserId,
        assigned =
          u.role === "admin"
            ? '<span class="staff-all">Todas las licencias</span>'
            : u.licenses
                .filter((k) => k in datasets)
                .map(
                  (k) =>
                    `<span class="staff-license-tag" style="--chip:${esc(licenseColors[k] || "#7b8d6d")}">${esc(k)}</span>`,
                )
                .join("") || '<span class="staff-none">Sin licencias</span>';
      return `<tr data-staff-id="${esc(u.id)}" class="${u.active ? "" : "staff-disabled"}"><td data-label="Usuario"><div class="staff-person staff-credentials"><div class="staff-credential-row"><strong class="staff-credential-value">${esc(u.username)}</strong><button type="button" data-staff-credential-action="copy" data-field="username" data-id="${esc(u.id)}" aria-label="Copiar usuario" title="Copiar usuario">${uiIcons.copy}</button></div><div class="staff-credential-row"><span class="staff-credential-value staff-password" data-staff-password aria-label="Contraseña">••••••••</span><button type="button" data-staff-credential-action="reveal" data-field="password" data-id="${esc(u.id)}" aria-label="Mostrar contraseña" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button><button type="button" data-staff-credential-action="copy" data-field="password" data-id="${esc(u.id)}" aria-label="Copiar contraseña" title="Copiar contraseña">${uiIcons.copy}</button></div></div></td><td data-label="Rol"><span class="role-badge ${u.role === "admin" ? "admin" : "seller"}">${u.role === "admin" ? "Administrador" : "Vendedor"}</span></td><td data-label="Estado"><span class="staff-state ${u.active ? "is-active" : "is-inactive"}">${u.active ? "Activo" : "Inactivo"}</span></td><td data-label="Último acceso" class="staff-last">${esc(userLastAccess(u.lastAccess))}</td><td data-label="Puede vender"><div class="staff-license-list">${assigned}</div></td><td data-label="Acciones"><div class="staff-actions"><button type="button" data-staff-action="edit" data-id="${esc(u.id)}" title="Editar usuario" aria-label="Editar usuario">${uiIcons.edit}</button><button type="button" data-staff-action="toggle" data-id="${esc(u.id)}" title="${u.active ? "Suspender" : "Reactivar"}" aria-label="${u.active ? "Suspender" : "Reactivar"}" ${self ? "disabled" : ""}>${u.active ? uiIcons.pause : uiIcons.play}</button><button type="button" data-staff-action="copy" data-id="${esc(u.id)}" title="Copiar usuario y enlace" aria-label="Copiar usuario y enlace">${uiIcons.copy}</button><button type="button" class="danger" data-staff-action="delete" data-id="${esc(u.id)}" title="Eliminar" aria-label="Eliminar" ${self ? "disabled" : ""}>${uiIcons.delete}</button></div></td></tr>`;
    })
    .join("");
}

let staffEditId = null,
  staffDraftLicenses = new Set(),
  staffDraftRole = null;
function openStaffCreate() {
  openStaffEditor();
}
function openStaffEditor(id = null) {
  if(window.panelSync?.busy){toast("Espera a que termine el guardado");return;}
  if (!isAdmin()) return;
  const user = id ? staffUsers.find((item) => item.id === id) : null;
  if (id && !user) return;
  staffEditId = user?.id || null;
  staffDraftLicenses = new Set(user?.licenses || []);
  staffDraftRole = null;
  document.querySelector("#staffForm").reset();
  document.querySelector("#staffCreateTitle").textContent = user ? "Editar usuario" : "Nuevo usuario";
  document.querySelector("#staffUsername").value = user?.username || "";
  const password = document.querySelector("#staffPassword");
  password.required = !user;
  password.value = "";
  password.placeholder = user ? "Dejar vacío para conservar" : "";
  const role = document.querySelector("#staffRole"),
    self = user?.id === sessionUserId;
  role.value = user?.role || "seller";
  role.disabled = self;
  const trigger = role.closest(".nova-select").querySelector(".nova-select-trigger");
  trigger.disabled = self;
  syncNovaSelect("staffRole");
  closeNovaSelect(role.closest(".nova-select"));
  document.querySelector("#staffForm .primary-btn").textContent = user ? "Guardar cambios" : "Crear usuario";
  document
    .querySelector("#staffCopyCreate")
    .setAttribute("aria-label", user ? "Guardar y copiar acceso" : "Crear y copiar acceso");
  renderStaffPicks();
  document.querySelector("#staffCreateBackdrop").hidden = false;
  document.querySelector("#staffUsername").focus();
}
function renderStaffPicks() {
  const role = document.querySelector("#staffRole").value,
    admin = role === "admin";
  if (staffDraftRole === "seller")
    staffDraftLicenses = new Set(
      [...document.querySelectorAll(".staff-license-pick.selected")].map(
        (button) => button.dataset.pickLicense,
      ),
    );
  staffDraftRole = role;
  document.querySelector("#staffLicensePicks").innerHTML = Object.keys(datasets)
    .map((name) => {
      const selected = admin || staffDraftLicenses.has(name);
      return `<button class="staff-license-pick ${selected ? "selected" : ""}" type="button" data-pick-license="${esc(name)}" aria-pressed="${selected}" ${admin ? "disabled" : ""} style="--chip:${esc(licenseColors[name] || "#7b8d6d")}"><i></i>${esc(name)}</button>`;
    })
    .join("");
  document.querySelector("#staffPermissionHint").textContent = admin
    ? "El administrador accede a todas las licencias y funciones."
    : "Selecciona las licencias a las que tendrá acceso.";
}
async function createStaff(copy) {
  if (!isAdmin()) return;
  const old = staffEditId ? staffUsers.find((user) => user.id === staffEditId) : null;
  if (staffEditId && !old) {
    toast("No se encontró el usuario");
    return;
  }
  const username = document.querySelector("#staffUsername").value.trim(),
    password = document.querySelector("#staffPassword").value,
    role = old?.id === sessionUserId ? "admin" : document.querySelector("#staffRole").value;
  const licenses =
    role === "admin"
      ? Object.keys(datasets)
      : [...document.querySelectorAll(".staff-license-pick.selected")].map(
          (button) => button.dataset.pickLicense,
        );
  const normalized = (name) => name.trim().toLowerCase().replace(/\s+/g, "");
  if (!username) {
    toast("Ingresa un usuario");
    return;
  }
  if ((!old || password) && password.length < 4) {
    toast("La contraseña debe tener al menos 4 caracteres");
    return;
  }
  if (staffUsers.some((user) => user.id !== old?.id && normalized(user.username) === normalized(username))) {
    toast("Ese usuario ya existe");
    return;
  }
  if (role === "seller" && !licenses.length) {
    toast("Selecciona al menos una licencia");
    return;
  }
  if(window.panelSync?.connected())return panelRemote("staffSave",{old,username,password,role,licenses,copy});
  const backup = old ? { ...old, licenses: [...old.licenses] } : null,
    user = old || {
      id: "staff-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      active: true,
      lastAccess: null,
    };
  Object.assign(user, { username, role, licenses });
  if (password) user.password = password;
  if (!old) staffUsers.push(user);
  try {
    persistStaff();
  } catch {
    if (old) Object.assign(old, backup);
    else staffUsers = staffUsers.filter((item) => item !== user);
    toast("No se pudo guardar el usuario");
    return;
  }
  closeDialog("#staffCreateBackdrop");
  renderStaff();
  staffRowFeedback(user.id, old ? "USUARIO ACTUALIZADO" : "USUARIO CREADO");
  if (old?.id === sessionUserId) applyRole();
  if (copy) {
    const copied = await copyText(staffCopyText(user, true));
    if (!copied) toast("Se guardó el usuario, pero no se pudo copiar");
  }
  staffEditId = null;
}
function askStaffAction(action, id) {
  if (!isAdmin()) return;
  const user = staffUsers.find((item) => item.id === id);
  if (!user) return;
  if (action === "edit") {
    openStaffEditor(id);
    return;
  }
  if (action === "copy") {
    copyText(staffCopyText(user)).then((ok) => {
      if (ok) staffRowFeedback(id, "USUARIO COPIADO");
      else toast("No se pudo copiar");
    });
    return;
  }
  if (user.id === sessionUserId) return;
  staffPending = { action, id };
  document.querySelector("#staffConfirmKicker").textContent =
    action === "delete" ? "ELIMINAR USUARIO" : user.active ? "SUSPENDER USUARIO" : "REACTIVAR USUARIO";
  document.querySelector("#staffConfirmTitle").textContent =
    action === "delete"
      ? "¿Eliminar este usuario?"
      : user.active
        ? "¿Suspender su acceso?"
        : "¿Reactivar su acceso?";
  document.querySelector("#staffConfirmName").textContent = user.username;
  document.querySelector("#staffConfirmAction").textContent =
    action === "delete" ? "Eliminar" : user.active ? "Suspender" : "Reactivar";
  document.querySelector("#staffConfirmBackdrop").hidden = false;
}

async function confirmStaffAction() {
  if (!isAdmin() || !staffPending) return;
  if(window.panelSync?.connected())return panelRemote("staffAction");
  const { action, id } = staffPending,
    u = staffUsers.find((x) => x.id === id);
  staffPending = null;
  closeDialog("#staffConfirmBackdrop");
  if (!u || u.id === sessionUserId) return;
  const row = document.querySelector(`[data-staff-id="${CSS.escape(id)}"]`);
  if (action === "delete") {
    staffUsers = staffUsers.filter((x) => x.id !== id);
  } else {
    u.active = !u.active;
    if (!u.active && sessionStorage.getItem(SESSION_USER_KEY) === id) confirmLogout();
  }
  persistStaff();
  renderStaff();
  toast(action === "delete" ? "Usuario eliminado" : u.active ? "Acceso reactivado" : "Acceso suspendido");
}
const totpCache = new Map();
function base32Bytes(raw) {
  let key = String(raw || "").trim();
  if (key.startsWith("otpauth://")) {
    try {
      key = new URL(key).searchParams.get("secret") || "";
    } catch {
      key = "";
    }
  }
  key = key.toUpperCase().replace(/[\s=-]/g, "");
  if (!key || /[^A-Z2-7]/.test(key)) return null;
  let bits = 0,
    value = 0,
    output = [];
  for (const c of key) {
    value = (value << 5) | "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".indexOf(c);
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      output.push((value >> bits) & 255);
    }
  }
  return output.length ? new Uint8Array(output) : null;
}
async function totpCode(seed, now = Date.now()) {
  if (!window.crypto?.subtle) return null;
  const bytes = base32Bytes(seed);
  if (!bytes) return null;
  const counter = Math.floor(now / 30000),
    id = seed + ":" + counter;
  if (totpCache.has(id)) return totpCache.get(id);
  const key = await crypto.subtle.importKey("raw", bytes, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const data = new ArrayBuffer(8),
    view = new DataView(data);
  view.setUint32(4, counter >>> 0, false);
  view.setUint32(0, Math.floor(counter / 4294967296), false);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, data)),
    offset = signature[signature.length - 1] & 15;
  const n =
      ((signature[offset] & 127) << 24) |
      (signature[offset + 1] << 16) |
      (signature[offset + 2] << 8) |
      signature[offset + 3],
    code = String(n % 1000000).padStart(6, "0");
  if (totpCache.size > 40) totpCache.clear();
  totpCache.set(id, code);
  return code;
}
async function updateMasterCodes() {
  if (activeView !== "masters" || !isAdmin()) return;
  const now = Date.now(),
    period = Math.floor(now / 30000),
    milliseconds = 30000 - (now % 30000),
    seconds = Math.ceil(milliseconds / 1000);
  await Promise.all(
    [...document.querySelectorAll("[data-totp-for]")].map(async (label) => {
      const item = masterItems(masterLicense).find((m) => m.id === label.dataset.totpFor);
      if (!item) return;
      const code = await totpCode(item.seed);
      if (!label.isConnected || Math.floor(Date.now() / 30000) !== period) return;
      const row = label.closest(".master-totp"),
        timer = row.querySelector("[data-totp-seconds]"),
        bar = row.querySelector("[data-totp-progress]");
      label.textContent = code ? code.slice(0, 3) + " " + code.slice(3) : "—";
      if (timer) timer.textContent = code ? seconds + " s" : item.seed ? "Semilla no válida" : "—";
      if (!bar) return;
      bar.parentElement.hidden = !code;
      if (!code) {
        bar.getAnimations().forEach((animation) => animation.cancel());
        delete bar.dataset.period;
        return;
      }
      const remaining = 30000 - (Date.now() % 30000),
        fraction = remaining / 30000;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        bar.style.transform = "scaleX(" + fraction + ")";
        return;
      }
      if (bar.dataset.period !== String(period) || !bar.getAnimations().length) {
        bar.getAnimations().forEach((animation) => animation.cancel());
        bar.style.transform = "scaleX(" + fraction + ")";
        bar.animate([{ transform: "scaleX(" + fraction + ")" }, { transform: "scaleX(0)" }], {
          duration: remaining,
          easing: "linear",
          fill: "forwards",
        });
        bar.dataset.period = String(period);
      }
    }),
  );
}
function masterItems(name) {
  return masterAccounts[name] || [];
}
function masterDays(m) {
  const endTime = Date.parse(String(m.endDate || "") + "T23:59:59"),
    startTime = Date.parse(String(m.startDate || "") + "T00:00:00"),
    total = Math.max(1, (Number.isFinite(endTime) ? endTime : Date.now()) - (Number.isFinite(startTime) ? startTime : Date.now())),
    left = Number.isFinite(endTime) ? Math.max(0, endTime - Date.now()) : 0;
  return {
    percent: Math.max(0, Math.min(100, Math.round((left / total) * 100))),
    days: Math.max(0, Math.ceil(left / 86400000)),
    expired: left <= 0,
    future: Number.isFinite(startTime) ? Date.now() < startTime : false,
  };
}
let masterDeleteTarget = null;
let masterDeleteBusy = false;
function masterDeleteLinks(license, master) {
  const clients = (datasets[license] || []).filter(user =>
    master._id != null && user._masterId != null
      ? String(user._masterId) === String(master._id)
      : Number(user.account) === Number(master.number));
  const jobs = typeof readBulkJobs === "function" ? readBulkJobs().filter(job =>
    job.license === license && !["completed", "cancelled"].includes(job.status) &&
    (master._id != null && job.masterId != null
      ? String(job.masterId) === String(master._id)
      : Number(job.destination) === Number(master.number))) : [];
  return {clients: clients.length, jobs: jobs.length};
}
function showMasterDeleteDetails(master, license) {
  const links = masterDeleteLinks(license, master);
  document.querySelector("#deleteMasterTitle").textContent = "¿Eliminar Cuenta " + master.number + "?";
  document.querySelector("#deleteMasterName").textContent = license + " · " + (master.email || "Sin usuario");
  document.querySelector("#deleteMasterMessage").textContent = links.clients
    ? "Esta cuenta tiene " + links.clients + " cliente(s) vinculados. Migra sus accesos a otra cuenta antes de eliminarla."
    : links.jobs ? "Esta cuenta es el destino de una migración pendiente. Cancela o completa esa migración antes de eliminarla."
    : "Se eliminará esta cuenta del sistema, junto con sus credenciales y configuración. Esta acción no se puede deshacer.";
  document.querySelector("#confirmDeleteMaster").disabled = !!(links.clients || links.jobs);
  return links;
}
function openMasterDelete(id) {
  if (!isAdmin() || masterDeleteBusy || window.panelSync?.busy) return;
  const master = masterItems(masterLicense).find(item => item.id === id);
  if (!master) return;
  masterDeleteTarget = {id: master.id, remoteId: master._id, license: masterLicense};
  showMasterDeleteDetails(master, masterLicense);
  const modal = document.querySelector("#deleteMasterBackdrop");
  const feedback = modal.querySelector("[data-modal-feedback]");
  if (feedback) feedback.hidden = true;
  modal.hidden = false;
  modal.querySelector('[data-close]').focus();
}
async function confirmMasterDelete() {
  if (!isAdmin() || masterDeleteBusy || window.panelSync?.busy || !masterDeleteTarget) return;
  const selected = {...masterDeleteTarget};
  const master = masterItems(selected.license).find(item => item.id === selected.id);
  if (!master) { closeDialog("#deleteMasterBackdrop"); toast("Esta cuenta ya no existe"); return; }
  const links = showMasterDeleteDetails(master, selected.license);
  if (links.clients || links.jobs) return;
  masterDeleteBusy = true;
  try {
    if (window.sbConfigured?.()) {
      if (!window.panelSync || selected.remoteId == null) throw new Error("Actualiza las cuentas antes de eliminarlas.");
      const ok = await panelSync.run("master.delete", {
        product: licenseProductKey(selected.license), masterId: selected.remoteId
      }, {close: ["#deleteMasterBackdrop"], success: "Cuenta eliminada"});
      if (ok) { totpCache.clear(); masterDeleteTarget = null; }
      return;
    }
    // Keep account numbers stable, so existing client assignments never shift.
    const previous = masterAccounts[selected.license];
    masterAccounts[selected.license] = previous.filter(item => item.id !== selected.id);
    try { persistMasters(); } catch (error) { masterAccounts[selected.license] = previous; throw error; }
    totpCache.clear();
    closeDialog("#deleteMasterBackdrop");
    renderMasters();
    masterDeleteTarget = null;
    toast("Cuenta eliminada");
  } catch (error) {
    toast(error.message || "No se pudo eliminar la cuenta", "error");
  } finally {
    masterDeleteBusy = false;
  }
}
function renderMasters() {
  if (!isAdmin()) return;
  document
    .querySelector("#mastersView")
    .style.setProperty("--accent", licenseColors[masterLicense] || "#10a37f");
  if (!(masterLicense in datasets)) masterLicense = Object.keys(datasets)[0];
  const masterRail = document.querySelector("#masterTabs"),
    masterScroll = masterRail.scrollLeft;
  masterRail.innerHTML = Object.keys(datasets)
    .map(
      (name) =>
        `<button type="button" title="Abrir licencia" data-master-license="${esc(name)}" class="${name === masterLicense ? "selected" : ""}" style="--chip:${esc(licenseColors[name] || "#7b8d6d")};--chip-ink:${novaContrastInk(licenseColors[name] || "#7b8d6d")}"><i></i>${esc(name)} <small>${masterItems(name).length}</small></button>`,
    )
    .join("");
  masterRail.scrollLeft = masterScroll;
  const chosen = masterRail.querySelector(".selected");
  if (chosen) {
    const right = chosen.offsetLeft + chosen.offsetWidth;
    masterRail.scrollLeft = Math.max(
      0,
      right - masterRail.clientWidth + 20,
      Math.min(masterRail.scrollLeft, chosen.offsetLeft - 20),
    );
  }
  document.querySelector("#editCurrentLicense").disabled = !masterLicense;
  const list = masterItems(masterLicense),
    cards = list
      .map((m) => {
        const d = masterDays(m),
          active = m.enabled && !d.expired && !d.future,
          masked = "•".repeat(Math.min(9, Math.max(6, String(m.password || "").length)));
        return `<article class="master-card ${active ? "" : "master-inactive"}" data-master-id="${esc(m.id)}"><div class="master-card-top"><div><span class="master-card-eyebrow">${esc(masterLicense)}</span><h3>Cuenta ${m.number}</h3></div><span class="master-card-state ${active ? "active" : "inactive"}">${active ? "Activo" : "Inactivo"}</span></div><div class="master-card-content"><div class="master-detail"><span>USUARIO</span><strong>${esc(m.email)}</strong><button type="button" class="master-field-copy" data-master-action="copy-field" data-field="email" data-id="${esc(m.id)}" title="Copiar usuario" aria-label="Copiar usuario"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2"/></svg></button></div><div class="master-detail"><span>CONTRASEÑA</span><strong data-secret="password">${masked}</strong><button type="button" data-master-action="reveal" data-field="password" data-id="${esc(m.id)}" title="Mostrar contraseña" aria-label="Mostrar contraseña"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button><button type="button" class="master-field-copy" data-master-action="copy-field" data-field="password" data-id="${esc(m.id)}" title="Copiar contraseña" aria-label="Copiar contraseña"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2"/></svg></button></div><div class="master-detail"><span>SEMILLA / TOKEN</span><strong data-secret="seed">${m.seed ? "••••••••" : "Sin semilla"}</strong><button type="button" data-master-action="reveal" data-field="seed" data-id="${esc(m.id)}" title="Mostrar semilla" aria-label="Mostrar semilla"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></button></div><div class="master-detail master-totp"><span>AUTENTICADOR</span><div class="totp-code-block"><strong data-totp-for="${esc(m.id)}">··· ···</strong><span class="totp-meter" aria-hidden="true"><i data-totp-progress></i></span></div><small data-totp-seconds>30 s</small><button type="button" class="master-field-copy" data-master-action="copy-field" data-field="totp" data-id="${esc(m.id)}" title="Copiar autenticador" aria-label="Copiar autenticador" ${m.seed ? "" : "disabled"}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2"/></svg></button></div><div class="master-detail master-date"><span>VIGENCIA</span><strong>${esc(masterLongDate(m.startDate))} al ${esc(masterLongDate(m.endDate))}</strong><small>${d.future ? "Aún no inicia" : d.days + " días restantes"}</small></div><div class="master-meter"><i style="--fill:${d.percent}%;width:${d.percent}%"></i></div>${m.note ? `<p class="master-card-note">${esc(m.note)}</p>` : ""}</div><div class="master-card-footer"><label class="master-switch"><input type="checkbox" data-master-action="toggle" data-id="${esc(m.id)}" ${m.enabled ? "checked" : ""} aria-label="Activar o desactivar cuenta ${m.number}"><i></i></label><button type="button" data-master-action="edit" data-id="${esc(m.id)}" title="Editar cuenta">${uiIcons.edit} Editar</button><button type="button" class="master-delete-btn" data-master-action="delete" data-id="${esc(m.id)}" title="Eliminar cuenta" aria-label="Eliminar Cuenta ${m.number}">${uiIcons.delete}<span>Eliminar cuenta</span></button></div></article>`;
      })
      .join("");
  document.querySelector("#masterCardGrid").innerHTML =
    cards +
    `<button type="button" class="master-add-card" id="masterAddTile"><span>+</span><strong>Cuenta ${list.length ? Math.max(...list.map((m) => m.number)) + 1 : 1}</strong><small>Conectar nueva cuenta</small></button>`;
  updateMasterCodes();
}
function setMasterDuration(value) {
  masterDuration = value === "month1" ? "month1" : "custom";
  document.querySelectorAll("[data-master-duration]").forEach((b) => {
    const selected = b.dataset.masterDuration === masterDuration;
    b.classList.toggle("selected", selected);
    b.setAttribute("aria-pressed", String(selected));
  });
  document.querySelector("#masterCustom").hidden = masterDuration !== "custom";
  if (masterDuration === "custom") renderCalendar("master");
}
function openMasterEditor(id = null) {
  if(window.panelSync?.busy){toast("Espera a que termine el guardado");return;}
  if (!isAdmin()) return;
  masterEditId = id;
  const item = masterItems(masterLicense).find((m) => m.id === id),
    next = masterItems(masterLicense).length
      ? Math.max(...masterItems(masterLicense).map((m) => m.number)) + 1
      : 1;
  document.querySelector("#masterForm").reset();
  document.querySelector("#masterEditTitle").textContent = item
    ? "Editar Cuenta " + item.number
    : "Conectar Cuenta " + next;
  document.querySelector("#masterEditSub").textContent = masterLicense;
  document.querySelector("#masterSave").textContent = item ? "Guardar cuenta ↗" : "Conectar cuenta ↗";
  document.querySelector("#masterEmail").value = item?.email || "";
  document.querySelector("#masterPassword").value = item?.password || "";
  document.querySelector("#masterSeed").value = item?.seed || "";
  document.querySelector("#masterNote").value = item?.note || "";
  for (const field of ["masterPassword", "masterSeed"]) document.querySelector("#" + field).type = "password";
  const start = item?.startDate || null,
    end = item?.endDate || null;
  rangeState.master = {
    month: start
      ? new Date(start.slice(0, 7) + "-01T12:00:00")
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    start,
    end,
  };
  setMasterDuration(item && item.duration !== "month1" ? "custom" : "month1");
  document.querySelector("#masterEditBackdrop").hidden = false;
  document.querySelector("#masterEmail").focus();
}
async function saveMaster(ev) {
  ev.preventDefault();
  if (!isAdmin()) return;
  const email = document.querySelector("#masterEmail").value.trim(),
    password = document.querySelector("#masterPassword").value,
    seed = document.querySelector("#masterSeed").value.trim(),
    note = document.querySelector("#masterNote").value.trim();
  if (!email || !password) {
    toast("Completa el usuario y la contraseña");
    return;
  }
  const list = masterAccounts[masterLicense] || (masterAccounts[masterLicense] = []),
    old = list.find((m) => m.id === masterEditId);
  let start, end;
  if (masterDuration === "custom") {
    const range = getRange("master");
    if (!range) return;
    start = rangeState.master.start;
    end = rangeState.master.end;
  } else {
    start = old?.startDate || dateLocal(new Date());
    end = dateLocal(addDays(new Date(start + "T12:00:00"), 30));
  }
  if(window.panelSync?.connected())return panelRemote("masterSave",{old,email,password,seed,note,start,end});
  if (old)
    Object.assign(old, {
      email,
      password,
      seed,
      startDate: start,
      endDate: end,
      duration: masterDuration,
      note,
    });
  else
    list.push({
      id: "master-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      number: list.length ? Math.max(...list.map((m) => m.number)) + 1 : 1,
      email,
      password,
      seed,
      startDate: start,
      endDate: end,
      duration: masterDuration,
      note,
      enabled: true,
    });
  if (typeof window.sbConfigured === "function" && window.sbConfigured()) {
    try {
      const productKey = licenseProductKey(masterLicense);
      if (!old) {
        const r = await window.sbApi("crear_cuenta", "POST", {
          producto: productKey,
          email,
          password,
          totp_seed: seed || null,
          notas: note || null,
        });
        const created = list[list.length - 1];
        const cid = r.cuenta_id || r.id || r.master_id;
        if (cid) created._id = cid;
      } else if (old._id) {
        await window.sbApi("editar_cuenta", "POST", {
          cuenta_id: old._id,
          producto: productKey,
          email,
          password,
          totp_seed: seed || null,
          notas: note || null,
        });
      }
    } catch (e) {
      if (typeof toast === "function") toast("Error Supabase: " + e.message, "error");
    }
  }
  persistMasters();
  closeDialog("#masterEditBackdrop");
  renderMasters();
  window.NovaMotion?.list(document.querySelector("#masterCardGrid"));
  toast(old ? "Cuenta actualizada" : "Cuenta conectada");
}

function masterCopyText(m) {
  return `LICENCIA ${masterLicense.toUpperCase()} · CUENTA ${m.number}\nUsuario: ${m.email || "—"}\nContraseña: ${m.password || "No disponible"}\nSemilla / token: ${m.seed || "—"}\nInicio: ${m.startDate || "—"}\nFinal: ${m.endDate || "—"}\nEstado: ${m.enabled && !masterDays(m).expired && !masterDays(m).future ? "Activo" : "Inactivo"}${m.note ? "\nNota: " + m.note : ""}`;
}
function masterCardAction(action, id, field, target) {
  if (!isAdmin()) return;
  const m = masterItems(masterLicense).find((x) => x.id === id);
  if (!m) return;
  if (action === "delete") {
    openMasterDelete(id);
    return;
  }
  if (action === "edit") {
    openMasterEditor(id);
    return;
  }
  if (action === "toggle") {
    toggleMasterAnimated(m, target);
    return;
  }
  if (action === "copy") {
    totpCode(m.seed)
      .then((code) => copyText(masterCopyText(m) + (code ? "\nAutenticador: " + code : "")))
      .then((ok) => toast(ok ? "Datos copiados" : "No se pudo copiar"));
    return;
  }
  if (action === "copy-field") {
    const values = {
      email: m.email,
      password: m.password,
      seed: m.seed,
      date: formatDate(m.startDate + "T12:00:00") + " → " + formatDate(m.endDate + "T12:00:00"),
    };
    Promise.resolve(field === "totp" ? totpCode(m.seed) : values[field]).then((value) => {
      if (!value) {
        toast("No hay dato para copiar");
        return;
      }
      copyText(value).then((ok) => {
        if (ok) {
          target.classList.add("copied");
          setTimeout(() => target.classList.remove("copied"), 900);
        }
        toast(ok ? "Dato copiado" : "No se pudo copiar");
      });
    });
    return;
  }
  if (action === "reveal") {
    const card = target.closest(".master-card"),
      label = card.querySelector(`[data-secret="${field}"]`);
    const showing = target.dataset.visible === "yes";
    const stored = field === "seed" ? m.seed : m[field];
    if (!showing && !stored) {
      // Remote mode deliberately keeps master secrets out of the browser.
      label.textContent = "No disponible";
      label.classList.remove("revealed");
      target.dataset.visible = "no";
      target.title = "Mostrar";
      toast("Este dato no está en el navegador. Inicia sesión de nuevo o consúltalo en el servidor.");
      return;
    }
    label.textContent = showing
      ? field === "password"
        ? "••••••••"
        : m.seed
          ? "••••••••"
          : "Sin semilla"
      : stored;
    label.classList.toggle("revealed", !showing);
    target.dataset.visible = showing ? "no" : "yes";
    target.title = showing ? "Mostrar" : "Ocultar";
  }
}
function expireSubscriptions() {
  if(window.panelSync?.connected())return;
  let changed = false,
    hasTrial = false;
  Object.values(datasets)
    .flat()
    .forEach((u) => {
      if (u.isTrial && u.expiresAt && u.status === "Activo") {
        hasTrial = true;
        if (Date.now() >= u.expiresAt) {
          u.status = "Inactivo";
          u.left = 0;
          changed = true;
        }
      } else if (!u.isTrial && u.endDate && u.status === "Activo" && getDaysLeft(u) === 0) {
        u.status = "Inactivo";
        u.left = 0;
        changed = true;
      }
    });
  if (changed) {
    persist();
    if (!activeInline) render();
  } else if (hasTrial && !activeInline) render();
}
function openSettings() {
  if(window.panelSync?.busy){toast("Espera a que termine el guardado");return;}
  if (!isAdmin()) return;
  document.querySelector("#adminNameInput").value = adminName;
  document.querySelector("#settingsBackdrop").hidden = false;
}
function saveSettings(ev) {
  ev.preventDefault();
  if (!isAdmin()) return;
  if(window.panelSync?.connected())return panelRemote("settings");
  adminName = document.querySelector("#adminNameInput").value.trim() || "Víctor";
  document.querySelector(".profile-name").textContent = adminName;
  persist();
  render();
  closeDialog("#settingsBackdrop");
  toast("Ajustes guardados");
}
function logout() {
  document.querySelector("#logoutBackdrop").hidden = false;
}
function confirmLogout() {
  maskClientPasswords();
  clientSessionPasswords.clear();
  window.UltraShopMotion?.cancelLogin?.();
  if (novaRemoteMode()) {
    // Do not leave master credentials in memory for the next person at this
    // computer. They are fetched again after the next successful login.
    Object.values(masterAccounts)
      .flat()
      .forEach((master) => {
        master.password = "";
        master.seed = "";
      });
    staffUsers.forEach((user) => delete user.password);
  }
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_USER_KEY);
  sessionUserId = "victor1234";
  closeDialog("#logoutBackdrop");
  document.querySelector("#app").hidden = true;
  document.querySelector("#loginScreen").hidden = false;
  document.querySelector("#loginUser").value = "";
  document.querySelector("#loginPassword").value = "";
  document.querySelector("#loginHelp").textContent = localStorage.getItem(CREDENTIAL_KEY)
    ? "También puedes ingresar con la huella de este dispositivo."
    : "Puedes activar la huella después de ingresar por primera vez, si tu dispositivo la permite.";
  document.querySelector("#loginUser").focus();
}
function returnPanel() {
  closeDialog("#logoutBackdrop");
}
for (const t of document.querySelectorAll(".tab[data-license]")) bindLicenseTab(t);
document.querySelector("#licenseManagerBtn").addEventListener("click", openLicenseCreate);
document.querySelector("#editCurrentLicense").addEventListener("click", () => openLicenseEdit(masterLicense));
document.querySelector("#brandHome").addEventListener("click", () => {
  closeProfileMenu();
  showView("clients");
});
document.querySelector("#deleteLicenseBtn").addEventListener("click", askDeleteLicense);
document.querySelector("#confirmDeleteLicense").addEventListener("click", confirmDeleteLicense);

document.querySelector("#licenseForm").addEventListener("submit", createLicense);
document
  .querySelector("#licenseNameInput")
  .addEventListener(
    "input",
    (e) =>
      (document.querySelector("#licensePreviewText").textContent = e.target.value.trim() || "Nueva licencia"),
  );
document.querySelector("#colorPalette").addEventListener("click", (e) => {
  const b = e.target.closest("[data-color]");
  if (b) paintPalette(b.dataset.color);
});
document.querySelector("#licenseColorInput").addEventListener("input", (e) => paintPalette(e.target.value));
window.addEventListener("storage", (event) => {
  if (event.key === STAFF_KEY) {
    staffUsers = readStored(STAFF_KEY, []);
    if (sessionStorage.getItem(SESSION_KEY) === "yes") {
      if (!currentStaff()) {
        confirmLogout();
        toast("Tu acceso fue suspendido");
      } else {
        applyRole();
        if (activeView === "staff") renderStaff();
      }
    }
  }
  if (event.key === MASTER_KEY) {
    masterAccounts = readStored(MASTER_KEY, {});
    if (activeView === "masters") renderMasters();
  }
});
document.querySelector("#loginForm").addEventListener("submit", loginByUser);
document.querySelector("#biometricBtn").addEventListener("click", loginByPasskey);
document.querySelector("#enrollBiometric").addEventListener("click", enrollPasskey);
document.querySelector("#confirmLogout").addEventListener("click", confirmLogout);
document.querySelector("#search").addEventListener("input", () => {
  render();
  animateListIn();
});
document.querySelector("#search").addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    e.target.value = "";
    render();
    e.target.blur();
  }
});
document.querySelector("#clearSearch").addEventListener("click", () => {
  const search = document.querySelector("#search");
  search.value = "";
  search.blur();
  document.activeElement?.blur();
  render();
  animateListIn();
});
document.querySelector("#filterBtn").addEventListener("click", toggleFilter);
document.querySelector("#filterMenu").addEventListener("click", (e) => {
  const option = e.target.closest("[data-filter]");
  if (option) setFilter(option.dataset.filter);
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".filter-wrap")) closeFilter();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeFilter();
});
document.querySelector("#createUserBtn").addEventListener("click", openCreate);
document
  .querySelector("#cameraImportBtn")
  .addEventListener("click", () => document.querySelector("#clientScreenshot").click());
document.querySelector("#clientScreenshot").addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  e.target.value = "";
  if (file) processScreenshot(file);
});
document.querySelector("#scanClose").addEventListener("click", stopScan);
document.querySelector("#scanRetry").addEventListener("click", () => {
  stopScan();
  document.querySelector("#clientScreenshot").click();
});
document.querySelector("#scanManual").addEventListener("click", () => {
  stopScan();
  openCreate();
});
document.querySelector("#scanCandidates").addEventListener("click", (e) => {
  const choice = e.target.closest("[data-scanned-number]");
  if (choice) useScannedNumber(choice.dataset.scannedNumber);
});
document
  .querySelectorAll("#durationChoices .duration-option")
  .forEach((b) => b.addEventListener("click", () => selectDuration(b.dataset.duration)));
document
  .querySelectorAll("[data-renew-duration]")
  .forEach((b) => b.addEventListener("click", () => selectRenewDuration(b.dataset.renewDuration)));
for (const kind of ["create", "renew", "master", "edit"]) {
  const host = document.querySelector("#" + kind + "Calendar");
  host.addEventListener("click", (e) => {
    const nav = e.target.closest("[data-month]"),
      day = e.target.closest("[data-date]");
    if (nav) {
      const r = rangeState[kind];
      r.month = new Date(r.month.getFullYear(), r.month.getMonth() + Number(nav.dataset.month), 1);
      renderCalendar(kind);
    } else if (day) selectCalendarDate(kind, day.dataset.date);
  });
}
document.querySelector("#createForm").addEventListener("submit", (e) => {
  e.preventDefault();
  saveCreated(false);
});
document.querySelector("#createCopyBtn").addEventListener("click", () => saveCreated(true));
document.querySelector("#confirmRenew").addEventListener("click", confirmRenew);
document.querySelector("#confirmDelete").addEventListener("click", confirmDelete);
document.querySelector("#confirmSuspend").addEventListener("click", confirmSuspend);
document.querySelector("#confirmMigrate").addEventListener("click", confirmMigrate);
document.querySelector("#migrateAccounts").addEventListener("click", (e) => {
  const b = e.target.closest("[data-account]");
  if (b && !b.disabled) {
    migrateSelection = Number(b.dataset.account);
    renderMigrateAccounts();
  }
});
document.querySelector("#editForm").addEventListener("submit", saveEdit);
document.querySelector("#settingsForm").addEventListener("submit", saveSettings);
document.querySelector("#profileMenuBtn").addEventListener("click", toggleProfileMenu);
document.querySelector("#menuClients").addEventListener("click", () => {
  closeProfileMenu();
  showView("clients");
  setFilter("all");
  document.querySelector("#search").value = "";
  render();
});
document.querySelector("#menuUsers").addEventListener("click", () => {
  if (isAdmin()) {
    closeProfileMenu();
    showView("staff");
  }
});
document.querySelector("#menuAccounts").addEventListener("click", openMasterAccounts);
document.querySelector("#addStaff").addEventListener("click", openStaffCreate);
document.querySelector("#staffRole").addEventListener("change", renderStaffPicks);
document.querySelector("#staffLicensePicks").addEventListener("click", (e) => {
  const b = e.target.closest("[data-pick-license]");
  if (b && !b.disabled) {
    b.classList.toggle("selected");
    b.setAttribute("aria-pressed", String(b.classList.contains("selected")));
  }
});
document.querySelector("#staffForm").addEventListener("submit", (e) => {
  e.preventDefault();
  createStaff(false);
});
document.querySelector("#staffCopyCreate").addEventListener("click", () => createStaff(true));
document.querySelector("#staffRows").addEventListener("click", (e) => {
  const b = e.target.closest("[data-staff-action]");
  if (b && !b.disabled) askStaffAction(b.dataset.staffAction, b.dataset.id);
});
document.querySelector("#staffConfirmAction").addEventListener("click", confirmStaffAction);
document.querySelector("#masterTabs").addEventListener("click", (e) => {
  const b = e.target.closest("[data-master-license]");
  if (b) {
    masterLicense = b.dataset.masterLicense;
    renderMasters();
  }
});
document.querySelector("#masterCardGrid").addEventListener("click", (e) => {
  if (e.target.closest("#masterAddTile")) {
    openMasterEditor();
    return;
  }
  const b = e.target.closest("[data-master-action]");
  if (b && b.type !== "checkbox") masterCardAction(b.dataset.masterAction, b.dataset.id, b.dataset.field, b);
});
document.querySelector("#masterCardGrid").addEventListener("change", (e) => {
  const b = e.target.closest('input[data-master-action="toggle"]');
  if (b) masterCardAction("toggle", b.dataset.id, null, b);
});
document.querySelector("#confirmDeleteMaster").addEventListener("click", confirmMasterDelete);
document.querySelector("#masterForm").addEventListener("submit", saveMaster);
document.querySelector("#masterDurationOptions").addEventListener("click", (e) => {
  const b = e.target.closest("[data-master-duration]");
  if (b) setMasterDuration(b.dataset.masterDuration);
});
document.querySelector("#masterEditBackdrop").addEventListener("click", (e) => {
  const b = e.target.closest("[data-reveal]");
  if (b) {
    const input = document.querySelector("#" + b.dataset.reveal);
    input.type = input.type === "password" ? "text" : "password";
    b.title = input.type === "password" ? "Mostrar" : "Ocultar";
  }
});
document.querySelector("#menuDisconnect")?.addEventListener("click", () => {
  closeProfileMenu();
  if (!window.confirm("Se cerrará la sesión y se borrará el token de administración de esta pestaña. ¿Continuar?")) return;
  window.sbDisconnect?.();
});
document.querySelector("#menuLogout").addEventListener("click", () => {
  closeProfileMenu();
  logout();
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".profile-wrap")) closeProfileMenu();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeProfileMenu();
});
document.querySelectorAll("[data-close]").forEach((b) =>
  b.addEventListener("click", () => {
    if (b.dataset.close === "#migrateBackdrop" && migrationBusy) return;
    closeDialog(b.dataset.close);
  }),
);
document.querySelectorAll(".modal-backdrop").forEach((back) =>
  back.addEventListener("click", (e) => {
    if (e.target === back) {
      if (back.id === "scanBackdrop") stopScan();
      else if (!(back.id === "migrateBackdrop" && migrationBusy)) back.hidden = true;
    }
  }),
);
document.querySelector("#createTrial").addEventListener("change", (e) => {
  document.querySelector("#durationChoices").classList.toggle("disabled", e.target.checked);
  document
    .querySelectorAll("#durationChoices .duration-option")
    .forEach((b) => (b.disabled = e.target.checked));
  document.querySelector("#customDates").hidden = e.target.checked || durationChoice !== "custom";
  document.querySelector("#durationNote").textContent = e.target.checked
    ? "Acceso temporal de una hora"
    : durationChoice === "month1"
      ? "30 días desde hoy"
      : durationChoice === "month2"
        ? "60 días desde hoy"
        : "Elige el rango en el calendario";
});
for (const name of Object.keys(datasets)) {
  if (![...document.querySelectorAll(".tab[data-license]")].some((t) => t.dataset.license === name)) {
    const tab = document.createElement("button");
    tab.className = "tab";
    tab.dataset.license = name;
    tab.innerHTML = `${esc(name)} <span class="tab-count">00</span>`;
    bindLicenseTab(tab);
    document.querySelector("#tabs").append(tab);
  }
}
for (const tab of document.querySelectorAll(".tab[data-license]")) {
  if (!(tab.dataset.license in datasets)) tab.remove();
}
if (adminName !== "Víctor") document.querySelector(".profile-name").textContent = adminName;
renderPalette();
render();
if (sessionStorage.getItem(SESSION_KEY) === "yes") {
  const uid = sessionStorage.getItem(SESSION_USER_KEY) || "victor1234";
  // The local demo owner is never a valid remote identity.
  if (novaRemoteMode() && uid === "victor1234") {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_USER_KEY);
  } else if (staffUsers.some((u) => u.id === uid && u.active)) enterPanel(false, uid, false);
  else {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_USER_KEY);
  }
}
setInterval(expireSubscriptions, 5000);
setInterval(updateMasterCodes, 1000);
