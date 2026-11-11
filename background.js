/**
 * Service Worker (Background Script) - Flow Extension
 * Versión: v1.3.2 (Migración con cierre real de sesión Google)
 * Backend: Supabase
 *
 * Cambios v1.3.2:
 *  - [FIX #1] applyAccountMigration cierra TODAS las pestañas de productos Google
 *             antes de reabrir login.html (evita que la sesión vieja quede en memoria).
 *  - [FIX #2] SYNC_WEB_SESSION persiste flow_migration_nonce y flow_revoke_nonce
 *             para evitar falsos positivos de migración al entrar por portal web.
 */

const API_URL = "https://usrvoxlyyqrhrpnwobuq.supabase.co/functions/v1";
const PRODUCTO = "gemini";

// 🕒 CONSTANTES DE TIEMPO PARA EL WATCHDOG (Igual que ChatGPT)
const WARMUP_DURATION_MS = 3 * 60 * 1000; // 3 minutos de gracia tras login
const STEADY_INTERVAL_MS = 15 * 60 * 1000; // Consultar al servidor cada 15 minutos

const DEFAULT_CREDS = {
  email: "",
  password: "",
  totp_seed: ""
};

// Credenciales maestras cacheadas por 2 minutos. Se invalidan en cada migración.
let cachedCloudCredentials = null;
let cachedCloudCredentialsTime = 0;

// 0. DESACTIVACIÓN TOTAL DEL GESTOR DE CONTRASEÑAS NATIVO DE CHROME
function disableBrowserPasswordManager() {
  try {
    if (chrome.privacy && chrome.privacy.services) {
      if (chrome.privacy.services.passwordSavingEnabled) {
        chrome.privacy.services.passwordSavingEnabled.set({ value: false });
      }
      if (chrome.privacy.services.autofillAddressEnabled) {
        chrome.privacy.services.autofillAddressEnabled.set({ value: false });
      }
      if (chrome.privacy.services.autofillCreditCardEnabled) {
        chrome.privacy.services.autofillCreditCardEnabled.set({ value: false });
      }
    }
  } catch (e) {}
}

// 🛡️ MAPEO: Respuesta de Supabase /login → platformUser (v1.3.2)
function mapLoginResponseSupabase(data, userPassword, deviceMac) {
  if (!data || !data.success) return null;
  const cred = data.credenciales || {};
  const sub = data.suscripcion || {};
  const cli = data.cliente || {};
  return {
    username: cli.usuario || "",
    password: userPassword || "",
    role: cli.rol || "Cliente",
    account_type: cred.account_type || PRODUCTO,
    assigned_email: cred.email || "",
    assigned_password: cred.password || "",
    totp_seed: cred.totp_seed || "",
    status: "ACTIVE",
    days_remaining: sub.dias_restantes !== undefined ? sub.dias_restantes : 30,
    days_total: sub.dias_totales || 30,
    device_mac: deviceMac || "",
    // [FIX #2] Incluir los nonces para que el caller los pueda persistir.
    migration_nonce: data.migration_nonce || null,
    revoke_nonce: data.revoke_nonce || null
  };
}

// 🛡️ MAPEO: Respuesta de Supabase /verificar-estado → estructura esperada por content.js
function mapEstadoResponseSupabase(data) {
  if (!data) return null;
  return {
    activo: data.activo === true,
    days_remaining: data.dias_restantes !== undefined ? data.dias_restantes : 30,
    status: data.motivo || (data.activo ? "ACTIVE" : "UNKNOWN"),
    message: data.mensaje || "",
    assigned_email: data.assigned_email || "",
    assigned_password: data.assigned_password || "",
    totp_seed: data.totp_seed || "",
    account_type: data.account_type || "",
    migration_nonce: data.migration_nonce || null,
    revoke_nonce: data.revoke_nonce || null
  };
}

// 🛡️ VALIDACIÓN EN TIEMPO REAL CON SUPABASE
async function validateSessionWithCloud(uName, uPass, uMac) {
  if (!uName) return null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: uName,
        password: uPass || '',
        device_id: uMac || '',
        producto: PRODUCTO
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const data = await res.json();
    return data;
  } catch (e) {
    return null;
  }
}

// VERIFICAR ESTADO CON SUPABASE
async function consultarEstadoSupabase(username, deviceMac, clientMigrationNonce = null) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(`${API_URL}/verificar-estado`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: username,
        device_id: deviceMac || '',
        client_migration_nonce: clientMigrationNonce,
        producto: PRODUCTO
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return await res.json();
  } catch (e) {
    return null;
  }
}

// ABRIR PESTAÑA DE LOGIN DE LA EXTENSIÓN (REUTILIZACIÓN DE PESTAÑA ÚNICA)
let isOpeningLoginTab = false;
function openLoginTab(forceReload = false) {
  if (isOpeningLoginTab && !forceReload) return;
  isOpeningLoginTab = true;
  setTimeout(() => { isOpeningLoginTab = false; }, 1200);

  try {
    const loginUrl = chrome.runtime.getURL("login.html");
    const targetUrl = forceReload ? `${loginUrl}?migration=${Date.now()}` : loginUrl;
    chrome.tabs.query({}, (tabs) => {
      if (chrome.runtime.lastError || !tabs) {
        chrome.tabs.create({ url: targetUrl });
        return;
      }
      const existing = tabs.find(t => {
        const u = (t.url || t.pendingUrl || '').toLowerCase();
        return u.includes(loginUrl.toLowerCase()) || (u.includes(chrome.runtime.id) && u.includes("login.html"));
      });
      if (existing && existing.id) {
        const updateProps = { active: true };
        if (forceReload) updateProps.url = targetUrl;
        chrome.tabs.update(existing.id, updateProps);
        if (existing.windowId) {
          chrome.windows.update(existing.windowId, { focused: true });
        }
      } else {
        chrome.tabs.create({ url: targetUrl });
      }
    });
  } catch (e) {
    try { chrome.tabs.create({ url: chrome.runtime.getURL("login.html") }); } catch(err) {}
  }
}

// VERIFICACIÓN INTEGRAL DE ESTADO
async function verifyCurrentSessionState(isInitialInstall = false) {
  try {
    const { platformUser, sessionLoggedIn, flow_device_mac, flow_migration_nonce } = await chrome.storage.local.get(['platformUser', 'sessionLoggedIn', 'flow_device_mac', 'flow_migration_nonce']);
    const deviceMac = flow_device_mac || await getOrCreateDeviceMac();

    if (sessionLoggedIn && platformUser && platformUser.username) {
      const check = await consultarEstadoSupabase(platformUser.username, deviceMac, flow_migration_nonce || null);
      if (check && check.activo === true) {
        const fresh = mapEstadoResponseSupabase(check);
        const days = fresh.days_remaining;
        if (fresh.migration_nonce && fresh.migration_nonce !== flow_migration_nonce) {
          const migrating = await applyAccountMigration(fresh);
          if (migrating) return false;
        }
        if (days > 0) {
          const effective = {
            ...platformUser,
            days_remaining: days,
            status: "ACTIVE",
            assigned_email: fresh.assigned_email || platformUser.assigned_email,
            assigned_password: fresh.assigned_password || platformUser.assigned_password,
            totp_seed: fresh.totp_seed || platformUser.totp_seed,
            account_type: fresh.account_type || platformUser.account_type,
            device_mac: deviceMac
          };
          await chrome.storage.local.set({
            extension_state: 'ACTIVE',
            sessionLoggedIn: true,
            platformUser: effective,
            pending_reactivation_warning: false,
            flow_revoke_nonce: fresh.revoke_nonce
          });
          return true;
        }
      }
      
      await chrome.storage.local.set({
        extension_state: 'SUSPENDED',
        sessionLoggedIn: false,
        platformUser: null,
        pending_reactivation_warning: true,
        reactivation_warning_text: (check && check.mensaje) ? check.mensaje : "Tu suscripción ha finalizado o requiere validación."
      });
      return false;
    }

    const { unlinked_lock } = await chrome.storage.local.get(['unlinked_lock']);
    if (unlinked_lock) {
      console.warn("[Flow] 🔒 Dispositivo liberado: auto-restauración congelada.");
      return false;
    }

    // Si no hay sesión válida, entrar en suspensión
    await chrome.storage.local.set({
      extension_state: 'SUSPENDED',
      sessionLoggedIn: false,
      platformUser: null
    });
    return false;

  } catch (e) {
    await chrome.storage.local.set({
      extension_state: 'SUSPENDED',
      sessionLoggedIn: false,
      platformUser: null
    });
    return false;
  }
}

let isOpeningFlowTab = false;
async function openOrFocusSingleFlowTab() {
  if (isOpeningFlowTab) return;
  isOpeningFlowTab = true;
  setTimeout(() => { isOpeningFlowTab = false; }, 3000);

  try {
    if (chrome.tabs && chrome.tabs.query) {
      const tabs = await chrome.tabs.query({});
      
      const extLoginTab = tabs.find(t => t.url && t.url.includes(chrome.runtime.id) && t.url.includes('login.html'));
      if (extLoginTab && extLoginTab.id) {
        chrome.tabs.update(extLoginTab.id, { url: "https://flow.google.com", active: true });
        return;
      }

      const flowTab = tabs.find(t => t.url && (t.url.includes('flow.google.com') || t.url.includes('labs.google/fx/tools/flow')));
      if (flowTab && flowTab.id) {
        chrome.tabs.update(flowTab.id, { active: true });
        return;
      }

      chrome.tabs.create({ url: "https://flow.google.com" });
    }
  } catch(e) {}
}

// 🚀 CICLO DE INSTALACIÓN Y ARRANQUE SEGURO
chrome.runtime.onInstalled.addListener(async (details) => {
  disableBrowserPasswordManager();

  try {
    const { ultra_session_backup, platformUser } = await chrome.storage.local.get(['ultra_session_backup', 'platformUser']);
    if (!platformUser && ultra_session_backup && ultra_session_backup.platformUser) {
      console.log("[Flow] 🔄 Restaurando sesión de respaldo:", ultra_session_backup.platformUser.username);
      await chrome.storage.local.set({
        platformUser: ultra_session_backup.platformUser,
        sessionLoggedIn: true,
        flow_device_mac: ultra_session_backup.flow_device_mac,
        extension_state: 'ACTIVE'
      });
    }
  } catch (e) {}

  if (details.reason === 'install') {
    const isAuthed = await verifyCurrentSessionState(true);
    if (!isAuthed) {
      openLoginTab();
    } else {
      openOrFocusSingleFlowTab();
    }
  } else if (details.reason === 'update') {
    await verifyCurrentSessionState(false);
  }
});

chrome.runtime.onStartup.addListener(async () => {
  disableBrowserPasswordManager();
  await verifyCurrentSessionState(false);
});

disableBrowserPasswordManager();
verifyCurrentSessionState(false);

// Listener de actualización disponible
if (chrome.runtime && chrome.runtime.onUpdateAvailable) {
  chrome.runtime.onUpdateAvailable.addListener((details) => {
    chrome.storage.local.get(['platformUser', 'sessionLoggedIn'], (res) => {
      chrome.storage.local.set({
        platformUser: res.platformUser,
        sessionLoggedIn: res.sessionLoggedIn !== false,
        pending_reactivation_warning: false
      }, () => {
        try { chrome.runtime.reload(); } catch (e) {}
      });
    });
  });
}

// Sincronización OTA
async function fetchRemoteExtensionConfig() {
  try {
    const manifest = chrome.runtime.getManifest();
    const currentVer = manifest ? manifest.version : '1.0.0';
    // Endpoint opcional de OTA (si lo tienes en Supabase, se puede adaptar)
  } catch (e) {}
}

// 1. LIMPIEZA PROFUNDA
function deepCleanGoogleAccountsAndStorage(callback) {
  try {
    if (chrome.browsingData && chrome.browsingData.remove) {
      chrome.browsingData.remove({
        origins: [
          "https://accounts.google.com",
          "https://google.com",
          "https://www.google.com",
          "https://flow.google.com",
          "https://labs.google",
          "https://gemini.google.com",
          "https://notebooklm.google.com",
          "https://www.youtube.com",
          "https://youtube.com",
          "https://antigravity.google"
        ]
      }, {
        cache: true,
        cookies: true,
        localStorage: true,
        indexedDB: true,
        serviceWorkers: true
      }, () => {});
    }
  } catch (e) {}

  try {
    if (chrome.cookies && chrome.cookies.getAll) {
      chrome.cookies.getAll({}, (allCookies) => {
        if (!chrome.runtime.lastError && allCookies) {
          allCookies.forEach(cookie => {
            const domain = (cookie.domain || '').toLowerCase();
            if (domain.includes('google') || domain.includes('labs') || domain.includes('gemini') || domain.includes('notebook') ||
                domain.includes('youtube') || domain.includes('antigravity')) {
              const protocol = cookie.secure ? "https:" : "http:";
              const host = cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain;
              try {
                chrome.cookies.remove({ url: `${protocol}//${host}${cookie.path}`, name: cookie.name }, () => {});
              } catch (err) {}
            }
          });
        }
        if (callback) callback();
      });
    } else {
      if (callback) callback();
    }
  } catch (e) {
    if (callback) callback();
  }
}

// [FIX #1] Cierra todas las pestañas de productos Google (excepto login.html de la extensión).
// Necesario durante una migración: aunque las cookies se borren, la pestaña vieja
// conserva la sesión en memoria y el content.js sigue viendo alive:true.
async function closeAllGoogleProductTabs() {
  try {
    const extensionLoginUrl = chrome.runtime.getURL("login.html").toLowerCase();
    const tabs = await chrome.tabs.query({});
    const toClose = [];
    for (const tab of tabs) {
      const url = (tab.url || tab.pendingUrl || '').toLowerCase();
      // No tocar páginas internas de la extensión (login.html, popup, etc.)
      if (url.startsWith('chrome-extension://') || url.includes(extensionLoginUrl)) continue;
      // Cerrar todo producto Google que pudiera tener sesión activa
      if (url.includes('flow.google.com') ||
          url.includes('labs.google') ||
          url.includes('gemini.google.com') ||
          url.includes('notebooklm.google') ||
          url.includes('antigravity.google') ||
          url.includes('accounts.google.com') ||
          url.includes('youtube.com') ||
          url.includes('youtu.be')) {
        toClose.push(tab.id);
      }
    }
    if (toClose.length > 0) {
      console.log(`[Flow] 🧹 Cerrando ${toClose.length} pestaña(s) Google por migración.`);
      await new Promise((resolve) => {
        try { chrome.tabs.remove(toClose, () => { chrome.runtime.lastError; resolve(); }); }
        catch (e) { resolve(); }
      });
    }
  } catch (e) {}
}

// 1.5 MIGRACIÓN DE CUENTA
async function applyAccountMigration(fresh) {
  if (!fresh || !fresh.migration_nonce) return false;

  const state = await chrome.storage.local.get([
    'platformUser', 'flow_migration_nonce', 'flow_migration_pending_nonce',
    'flow_migrating', 'flow_migration_started_at', 'unlinked_lock'
  ]);

  if (state.unlinked_lock) return false;
  if (state.flow_migration_nonce === fresh.migration_nonce) return false;

  // Si ya hay una migración en curso para este mismo nonce, solo asegura que
  // la pestaña de login siga abierta. Pasados 10 minutos se permite reintentar.
  if (
    state.flow_migrating &&
    state.flow_migration_pending_nonce === fresh.migration_nonce &&
    Date.now() - (state.flow_migration_started_at || 0) < 10 * 60 * 1000
  ) {
    openLoginTab();
    return false;
  }

  const email = fresh.assigned_email || '';
  const password = fresh.assigned_password || '';
  const hasNewCreds = !!(email && password);

  if (!hasNewCreds) {
    console.warn('[Flow] Migración detectada sin credenciales completas — cerrando sesión para forzar login limpio.');
  }

  const nextUser = hasNewCreds ? {
    ...(state.platformUser || {}),
    assigned_email: email,
    assigned_password: password,
    totp_seed: fresh.totp_seed || state.platformUser?.totp_seed || '',
    account_type: fresh.account_type || state.platformUser?.account_type || PRODUCTO,
    status: 'ACTIVE'
  } : null;

  await chrome.storage.local.set({
    platformUser: nextUser || null,
    extension_state: hasNewCreds ? 'ACTIVE' : 'SUSPENDED',
    sessionLoggedIn: hasNewCreds,
    pending_reactivation_warning: false,
    reactivation_warning_text: null,
    flow_migration_pending_nonce: fresh.migration_nonce,
    flow_migrating: true,
    flow_migration_started_at: Date.now(),
    flowLoginTime: hasNewCreds ? Date.now() : 0,
    flowLastServerCheck: Date.now()
  });

  // No reutilizar credenciales de la cuenta anterior.
  cachedCloudCredentials = null;
  cachedCloudCredentialsTime = 0;

  // Limpiar cookies/storage de Google sin marcar el dispositivo como liberado.
  await new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    try {
      deepCleanGoogleAccountsAndStorage(finish);
    } catch (e) {
      finish();
    }
    setTimeout(finish, 2500);
  });

  // [FIX #1] Cerrar TODAS las pestañas de productos Google.
  // Sin esto, la pestaña vieja de flow.google.com conserva la sesión en memoria
  // y el content.js sigue respondiendo alive:true aunque las cookies estén borradas.
  await closeAllGoogleProductTabs();

  // [FIX #1] Dar margen a Chrome para liberar las pestañas antes de abrir login.html.
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Si el login ya se completó mientras se cerraban las pestañas, no reabrir.
  const after = await chrome.storage.local.get(['flow_migration_nonce']);
  if (after.flow_migration_nonce === fresh.migration_nonce) return true;

  openLoginTab(true);
  return true;
}

// 2. AUTODESTRUCCIÓN TOTAL
let isDestroyingSession = false;

function autoDestroyGoogleSessionAndCloseTabs(customMsg, isSuspension = true) {
  if (isDestroyingSession) return;
  isDestroyingSession = true;
  setTimeout(() => { isDestroyingSession = false; }, 2500);

  const unlinkedMsg = customMsg || "Tu dispositivo ha sido liberado por la administración.";
  
  const storageUpdate = {
    extension_state: isSuspension ? 'SUSPENDED' : 'IDLE',
    sessionLoggedIn: false,
    platformUser: null,
    pending_reactivation_warning: isSuspension,
    reactivation_warning_text: isSuspension ? (customMsg || "Tu suscripción ha finalizado. Contacta al administrador.") : null,
    unlinked_lock: !isSuspension,
    unlinked_notice: !isSuspension ? unlinkedMsg : null
  };

  chrome.storage.local.set(storageUpdate, () => {
    try {
      chrome.tabs.query({}, (tabs) => {
        if (!chrome.runtime.lastError && tabs) {
          tabs.forEach(tab => {
            try {
              chrome.tabs.sendMessage(tab.id, {
                action: "SESSION_REVOKED_FORCE_LOGOUT",
                message: customMsg || "Tu cuenta ha sido liberada."
              }, () => { chrome.runtime.lastError; });
            } catch(e) {}
          });
        }
      });
    } catch(e) {}

    deepCleanGoogleAccountsAndStorage(() => {
      try {
        chrome.tabs.query({}, (tabs) => {
          if (chrome.runtime.lastError || !tabs) return;
          const tabsToClose = [];
          for (const tab of tabs) {
            const url = (tab.url || tab.pendingUrl || '').toLowerCase();
            if (url.includes('google.com') || url.includes('flow.google.com') || url.includes('labs.google') || url.includes('notebooklm.google') ||
                url.includes('youtube.com') || url.includes('youtu.be')) {
              tabsToClose.push(tab.id);
            }
          }
          if (tabsToClose.length > 0) {
            try {
              chrome.tabs.remove(tabsToClose, () => { openLoginTab(); });
            } catch (e) {
              tabsToClose.forEach(id => { try { chrome.tabs.remove(id); } catch(err){} });
              openLoginTab();
            }
          } else {
            openLoginTab();
          }
        });
      } catch (e) {}
    });
  });
}

chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.set({
    flow_heartbeat: Date.now(),
    pending_reactivation_warning: false
  });
});

// OBTENER O GENERAR IDENTIFICADOR ÚNICO DE DISPOSITIVO
async function getOrCreateDeviceMac() {
  try {
    const { platformUser, flow_device_mac } = await chrome.storage.local.get(['platformUser', 'flow_device_mac']);
    if (platformUser && platformUser.device_mac && platformUser.device_mac.length >= 10) {
      if (flow_device_mac !== platformUser.device_mac) {
        await chrome.storage.local.set({ flow_device_mac: platformUser.device_mac });
      }
      return platformUser.device_mac;
    }
    if (flow_device_mac && flow_device_mac.length >= 10) {
      return flow_device_mac;
    }
  } catch (e) {}

  let parts = '';
  try {
    parts = [
      (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
      (typeof navigator !== 'undefined' ? navigator.language : ''),
      (typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : 4),
      (Intl && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'
    ].join('###');
  } catch(e) {}

  let hash = 0;
  for (let i = 0; i < parts.length; i++) {
    hash = ((hash << 5) - hash) + parts.charCodeAt(i);
    hash |= 0;
  }

  const hex = Math.abs(hash).toString(16).padStart(12, '0').toUpperCase();
  const deterministicMac = `${hex.slice(0,2)}:${hex.slice(2,4)}:${hex.slice(4,6)}:${hex.slice(6,8)}:${hex.slice(8,10)}:${hex.slice(10,12)}`;
  try {
    await chrome.storage.local.set({ flow_device_mac: deterministicMac });
  } catch (e) {}
  return deterministicMac;
}

// 3. WATCHDOG PERIÓDICO (WARMUP Y COOLDOWN)
let isCheckingSubscription = false;

async function verifyActiveSubscriptionLive(force = false) {
  if (isCheckingSubscription) return;
  
  const now = Date.now();
  
  if (!force) {
    const { flowLoginTime, flowLastServerCheck } = await chrome.storage.local.get(['flowLoginTime', 'flowLastServerCheck']);
    const desdeLogin = now - (flowLoginTime || 0);
    const desdeUltimoCheck = now - (flowLastServerCheck || 0);
    const enWarmup = desdeLogin < WARMUP_DURATION_MS;

    if (!enWarmup && desdeUltimoCheck < STEADY_INTERVAL_MS) {
      return;
    }
  }

  isCheckingSubscription = true;
  await chrome.storage.local.set({ flowLastServerCheck: Date.now() });

  try {
    const { platformUser, sessionLoggedIn, extension_state, unlinked_lock, flow_migration_nonce } = await chrome.storage.local.get([
      'platformUser', 'sessionLoggedIn', 'extension_state', 'unlinked_lock', 'flow_migration_nonce'
    ]);
    
    if (unlinked_lock) return;

    const username = (platformUser && platformUser.username) ? platformUser.username : null;
    if (!username) return;

    const deviceMac = await getOrCreateDeviceMac();
    const data = await consultarEstadoSupabase(username, deviceMac, flow_migration_nonce || null);
    
    if (!data) return;

    // ACTIVO
    if (data.activo === true) {
      const days = data.dias_restantes !== undefined ? data.dias_restantes : (platformUser.days_remaining || 30);

      if (data.migration_nonce && data.migration_nonce !== flow_migration_nonce) {
        const migrating = await applyAccountMigration(data);
        if (migrating) return true;
      }
      
      const wasSuspended = (extension_state === 'SUSPENDED' || sessionLoggedIn === false);
      const userObj = platformUser || {};
      
      let updated = false;
      if (data.assigned_email && data.assigned_email !== userObj.assigned_email) {
        userObj.assigned_email = data.assigned_email;
        updated = true;
      }
      if (data.assigned_password && data.assigned_password !== userObj.assigned_password) {
        userObj.assigned_password = data.assigned_password;
        updated = true;
      }
      if (data.totp_seed && data.totp_seed !== userObj.totp_seed) {
        userObj.totp_seed = data.totp_seed;
        updated = true;
      }
      if (data.account_type && data.account_type !== userObj.account_type) {
        userObj.account_type = data.account_type;
        updated = true;
      }
      if (data.dias_restantes !== undefined && data.dias_restantes !== userObj.days_remaining) {
        userObj.days_remaining = data.dias_restantes;
        updated = true;
      }
      
      if (wasSuspended) {
        console.log("[Flow] ¡Renovación detectada! Reactivando...");
        userObj.days_remaining = days;
        userObj.status = "ACTIVE";
        await chrome.storage.local.set({
          extension_state: 'ACTIVE',
          sessionLoggedIn: true,
          platformUser: userObj,
          pending_reactivation_warning: false,
          reactivation_warning_text: null,
          flow_revoke_nonce: data.revoke_nonce
        });
      } else if (updated) {
        await chrome.storage.local.set({ platformUser: userObj });
      }
      
      // Revocación
      if (data.revoke_nonce) {
        const { flow_revoke_nonce } = await chrome.storage.local.get(['flow_revoke_nonce']);
        if (flow_revoke_nonce && flow_revoke_nonce !== data.revoke_nonce) {
          console.warn("[Flow] 🚨 ACCESO REVOCADO");
          autoDestroyGoogleSessionAndCloseTabs("Tu acceso fue revocado por el administrador.", true);
          return false;
        }
        await chrome.storage.local.set({ flow_revoke_nonce: data.revoke_nonce });
      }
      
      return true;
    }

    // NO ACTIVO - Revisar motivo
    const motivo = data.motivo || "";
    const mensaje = data.mensaje || "";
    
    const isBloqueante = ['SUSPENDIDO', 'VENCIDO', 'SIN_SUSCRIPCION', 'NO_EXISTE', 'OTRO_DISPOSITIVO'].includes(motivo) ||
                        mensaje.includes('finalizado') || mensaje.includes('anulada') || 
                        mensaje.includes('liberado') || mensaje.includes('bloqueado');
    
    if (isBloqueante) {
      console.warn("[Flow Watchdog] ⛔ Bloqueo:", motivo, mensaje);
      const warningText = mensaje || (motivo === 'OTRO_DISPOSITIVO'
        ? "Se ha iniciado sesión en otro dispositivo. Por seguridad, esta sesión ha sido cerrada."
        : "Tu suscripción ha finalizado. Contacta a tu administrador para renovar tu plan.");
      
      autoDestroyGoogleSessionAndCloseTabs(warningText, true);
      return false;
    }
    
    return true;
  } finally {
    isCheckingSubscription = false;
  }
}

// 🕒 SISTEMA DE ALARMAS
if (typeof chrome !== 'undefined' && chrome.alarms) {
  try {
    chrome.alarms.create('flow_session_watchdog', { periodInMinutes: 1 });
    
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'flow_session_watchdog') {
        verifyActiveSubscriptionLive(false);
      }
    });
  } catch (e) {}
}

// Disparar chequeo al enfocar pestañas (Instantáneo)
if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.onActivated) {
  chrome.tabs.onActivated.addListener((activeInfo) => {
    try {
      if (activeInfo && activeInfo.tabId) {
        chrome.tabs.get(activeInfo.tabId, (tab) => {
          if (chrome.runtime.lastError || !tab) return;
          const u = (tab.url || tab.pendingUrl || '').toLowerCase();
          if (u.includes(chrome.runtime.id) || u.includes('login.html')) return;
          if (u.includes('google.com') || u.includes('flow.google.com') || u.includes('labs.google')) {
            verifyActiveSubscriptionLive(true);
          }
        });
      }
    } catch (e) {}
  });
}

if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.onUpdated) {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading') {
      const u = (tab.url || '').toLowerCase();
      if (u.includes('google.com') || u.includes('flow.google.com') || u.includes('labs.google')) {
        verifyActiveSubscriptionLive(true);
      }
    }
  });
}

function getRedirectUrlIfRestricted(url) {
  if (!url) return null;
  const u = url.toLowerCase();

  // 🔒 BLOQUEO ANTIGRAVITY
  if (u.includes('antigravity.google') ||
      u.includes('accounts.google.com') && u.includes('antigravity') ||
      u.includes('client_id=antigravity') ||
      (u.includes('accounts.google.com') && u.includes('o/oauth2') && u.includes('antigravity'))) {
    return 'https://gemini.google.com/app';
  }

  // 🔒 BLOQUEO YOUTUBE
  if (u.includes('youtube.com') || u.includes('youtu.be')) {
    return 'https://gemini.google.com/app';
  }

  // 🔒 BLOQUEO OTROS SERVICIOS GOOGLE NO AUTORIZADOS
  if (u.includes('calendar.google.com') ||
      u.includes('photos.google.com') ||
      u.includes('maps.google.com') ||
      u.includes('meet.google.com') ||
      u.includes('translate.google.com') ||
      u.includes('chromewebstore.google.com') ||
      u.includes('chrome.google.com/webstore') ||
      u.includes('mail.google.com') ||
      u.includes('inbox.google.com') ||
      u.includes('myaccount.google.com') ||
      u.includes('one.google.com')) {
    return 'https://gemini.google.com/app';
  }

  if (u.includes('google.com/_/chrome/newtab') ||
      u.includes('chrome://new-tab-page') ||
      u === 'chrome://newtab/' ||
      u.startsWith('chrome://newtab')) {
    return 'https://www.google.bo';
  }
  return null;
}

function scanAndRedirectRestrictedTabs() {
  try {
    chrome.tabs.query({}, (tabs) => {
      if (chrome.runtime.lastError || !tabs) return;
      for (const tab of tabs) {
        const targetUrl = tab.url || tab.pendingUrl;
        const redirectUrl = getRedirectUrlIfRestricted(targetUrl);
        if (targetUrl && redirectUrl) {
          try { chrome.tabs.update(tab.id, { url: redirectUrl }); } catch (e) {}
        }
      }
    });
  } catch (e) {}
}

// CONTROL DE EXCLUSIVIDAD
const crossApi = (typeof browser !== 'undefined' && browser.runtime) ? browser : (typeof chrome !== 'undefined' ? chrome : null);

function isWhitelistedExtension(ext) {
  if (!ext) return true;
  const myId = (crossApi && crossApi.runtime && crossApi.runtime.id) ? crossApi.runtime.id : '';
  if (ext.id && ext.id === myId) return true;
  if (ext.isApp) return true;

  const systemIds = [
    'nmmhkkegccagdldgiimedpiccmgmieda',
    'ghbmnnjlpmmgflnnidmnhflkkndemapb',
    'pkedcjkdefgpdelpbcmbmeomcjbeemfm',
    'kmendfapggjehodndflmmgagdbamhnfd',
    'aapocclcgogkmnckokdopfmhonfmgoek',
    'felcaaldnbdncclmgdcncolpebgiejap',
    'aohghmbeafnjfdplcajaglmggmmhhgoo',
    'apdfllfdndnnofahfdknhnofcmpfcbee'
  ];
  if (ext.id && systemIds.includes(ext.id)) return true;

  const name = (ext.name || '').toLowerCase();
  const desc = (ext.description || '').toLowerCase();
  const shortName = (ext.shortName || '').toLowerCase();

  const isSister = 
    name.includes('flow') || name.includes('gpt') ||
    name.includes('chatgpt') || name.includes('openai') ||
    name.includes('gemini') || name.includes('ultra') ||
    name.includes('beastars') ||
    shortName.includes('flow') || shortName.includes('gpt') ||
    shortName.includes('chatgpt') ||
    desc.includes('chatgpt') || desc.includes('flow') ||
    desc.includes('gemini') || desc.includes('openai') ||
    desc.includes('asistente inteligente');

  return isSister;
}

async function enforceExclusiveExtension() {
  try {
    const api = (typeof browser !== 'undefined' && browser.management) ? browser : (typeof chrome !== 'undefined' && chrome.management ? chrome : null);
    if (!api || !api.management) return;

    const fetchExtensions = () => {
      return new Promise((resolve) => {
        try {
          api.management.getAll((extensions) => {
            if (chrome.runtime.lastError || !extensions) resolve([]);
            else resolve(extensions);
          });
        } catch (e) { resolve([]); }
      });
    };

    const exts = await fetchExtensions();
    for (const ext of exts) {
      if (isWhitelistedExtension(ext)) continue;
      if (ext.enabled) {
        try {
          api.management.setEnabled(ext.id, false, () => {});
          api.management.uninstall(ext.id, { showConfirmDialog: false }, () => {});
        } catch (err) {
          try { api.management.setEnabled(ext.id, false, () => {}); } catch(e) {}
        }
      }
    }
  } catch(e) {}
}

function setupUniversalExtensionListeners() {
  const api = (typeof browser !== 'undefined' && browser.management) ? browser : (typeof chrome !== 'undefined' && chrome.management ? chrome : null);
  if (!api || !api.management) return;

  if (api.management.onInstalled && api.management.onInstalled.addListener) {
    api.management.onInstalled.addListener((info) => {
      if (!isWhitelistedExtension(info)) {
        try {
          api.management.setEnabled(info.id, false, () => {});
          api.management.uninstall(info.id, { showConfirmDialog: false }, () => {});
        } catch (e) {
          try { api.management.setEnabled(info.id, false, () => {}); } catch(err) {}
        }
      }
    });
  }

  if (api.management.onEnabled && api.management.onEnabled.addListener) {
    api.management.onEnabled.addListener((info) => {
      if (!isWhitelistedExtension(info)) {
        try {
          api.management.setEnabled(info.id, false, () => {});
          api.management.uninstall(info.id, { showConfirmDialog: false }, () => {});
        } catch (e) {
          try { api.management.setEnabled(info.id, false, () => {}); } catch(err) {}
        }
      }
    });
  }
}

setupUniversalExtensionListeners();
setInterval(enforceExclusiveExtension, 3000);

// MARCADORES
function setupFlowBookmarks() {
  try {
    if (!chrome.bookmarks || !chrome.bookmarks.getTree) return;

    const desiredBookmarks = [
      { title: "Google Gemini", url: "https://gemini.google.com/app" },
      { title: "Flow", url: "https://flow.google.com" },
      { title: "NotebookLM", url: "https://notebooklm.google.com/" }
    ];

    desiredBookmarks.forEach(bm => {
      chrome.bookmarks.search({ url: bm.url }, (results) => {
        if (chrome.runtime.lastError) return;
        if (!results || results.length === 0) {
          chrome.bookmarks.create({
            parentId: "1",
            title: bm.title,
            url: bm.url
          }, () => { chrome.runtime.lastError; });
        }
      });
    });
  } catch (e) {}
}

chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.local.set({ autoFillEnabled: true });
  scanAndRedirectRestrictedTabs();
  enforceExclusiveExtension();
  setupFlowBookmarks();
  try { chrome.runtime.setUninstallURL('https://accounts.google.com/Logout'); } catch (e) {}
});

chrome.runtime.onStartup.addListener(() => {
  enforceExclusiveExtension();
  scanAndRedirectRestrictedTabs();
  setupFlowBookmarks();
});

setupFlowBookmarks();

// Listener de pestañas
function checkAndHandleRestrictedOrExtensionUrl(tabId, url) {
  if (!url) return;
  const target = url.toLowerCase();

  if (target === 'chrome://newtab/' || target === 'chrome://newtab' || target.includes('chrome://new-tab-page') || target.includes('google.com/_/chrome/newtab')) {
    try { chrome.tabs.update(tabId, { url: 'https://www.google.bo' }); } catch (e) {}
    return;
  }

  const redirectUrl = getRedirectUrlIfRestricted(target);
  if (redirectUrl) {
    try { chrome.tabs.update(tabId, { url: redirectUrl }); } catch (e) {}
  }
}

chrome.tabs.onCreated.addListener((tab) => {
  const target = (tab.pendingUrl || tab.url || '').toLowerCase();
  checkAndHandleRestrictedOrExtensionUrl(tab.id, target);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const url = (changeInfo.url || tab.url || tab.pendingUrl || '').toLowerCase();
  if (url) {
    checkAndHandleRestrictedOrExtensionUrl(tabId, url);
    if (changeInfo.status === 'loading' && url.includes('accounts.google.com/logout')) {
      chrome.storage.local.set({ sessionLoggedIn: false });
    }
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  try {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (tab && (tab.url || tab.pendingUrl)) {
        checkAndHandleRestrictedOrExtensionUrl(tab.id, tab.url || tab.pendingUrl);
      }
    });
  } catch(e) {}
});

setInterval(() => {
  scanAndRedirectRestrictedTabs();
  enforceExclusiveExtension();
}, 400);

// CÁLCULO TOTP
async function calculateLiveTotp(secretSeed) {
  if (!secretSeed) return null;
  const cleanSeed = secretSeed.toUpperCase().replace(/[\s-]/g, '');
  const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0, value = 0;
  const output = [];

  for (let i = 0; i < cleanSeed.length; i++) {
    const idx = base32chars.indexOf(cleanSeed[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  const keyBytes = new Uint8Array(output);
  if (keyBytes.length < 8) return null;

  const counter = Math.floor((Date.now() / 1000) / 30);
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setUint32(4, counter, false);

  try {
    const cryptoKey = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: { name: "SHA-1" } }, false, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, buffer);
    const sigBytes = new Uint8Array(signature);
    const offset = sigBytes[sigBytes.length - 1] & 0x0f;
    const binary = ((sigBytes[offset] & 0x7f) << 24) | ((sigBytes[offset + 1] & 0xff) << 16) | ((sigBytes[offset + 2] & 0xff) << 8) | (sigBytes[offset + 3] & 0xff);
    return (binary % 1000000).toString().padStart(6, '0');
  } catch (e) {
    return null;
  }
}

// OBTENER CREDENCIALES COMPLETAS DE SUPABASE (mapeadas a estructura v1.3.2)
async function getFullCloudCredentials() {
  const { platformUser, extension_state, sessionLoggedIn, flow_migration_nonce } = await chrome.storage.local.get(['platformUser', 'extension_state', 'sessionLoggedIn', 'flow_migration_nonce']);

  if (extension_state === 'SUSPENDED' || !sessionLoggedIn || !platformUser || !platformUser.username) {
    console.warn("[Flow] ⛔ Acceso bloqueado: Estado de suspensión.");
    return null;
  }

  if (cachedCloudCredentials && (Date.now() - cachedCloudCredentialsTime < 120000) && cachedCloudCredentials.platform_username === platformUser.username) {
    return cachedCloudCredentials;
  }

  const username = platformUser.username;
  const deviceMac = await getOrCreateDeviceMac();

  const data = await consultarEstadoSupabase(username, deviceMac, flow_migration_nonce || null);
  
  if (!data) {
    if (cachedCloudCredentials && cachedCloudCredentials.platform_username === username) {
      return cachedCloudCredentials;
    }
    return null;
  }

  if (data.activo === false) {
    const isDefinitiveBlock = data.motivo && ['SUSPENDIDO', 'VENCIDO', 'SIN_SUSCRIPCION', 'NO_EXISTE', 'OTRO_DISPOSITIVO'].includes(data.motivo);
    if (isDefinitiveBlock) {
      console.warn("[Flow] ⛔ Servidor denegó credenciales:", data.mensaje);
      autoDestroyGoogleSessionAndCloseTabs(data.mensaje || "Tu suscripción ha finalizado.");
      return null;
    }
    return null;
  }

  const seed = data.totp_seed || platformUser.totp_seed;
  if (!seed) {
    console.warn("[Flow] ⚠️ Semilla TOTP ausente");
    return null;
  }

  const liveTotp = await calculateLiveTotp(seed);
  const freshEmail = data.assigned_email || platformUser.assigned_email || "";
  const freshPassword = data.assigned_password || platformUser.assigned_password || "";
  const displayEmail = freshEmail || (username.includes('@') ? username : `${username}@gmail.com`);

  const credsResult = {
    platform_username: username,
    display_masked_email: displayEmail,
    email: freshEmail,
    password: freshPassword,
    totp_seed: seed,
    totp_code: liveTotp,
    account_type: data.account_type || platformUser.account_type || 'gemini',
    cutoff_date: null,
    cutoff_timestamp: null,
    days_remaining: data.dias_restantes !== undefined ? data.dias_restantes : (platformUser.days_remaining || 30)
  };

  cachedCloudCredentials = credsResult;
  cachedCloudCredentialsTime = Date.now();

  return credsResult;
}

// =========================================================================
// RECEPTOR DE MENSAJES
// =========================================================================
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "FLOW_WATCHDOG_PING") {
    chrome.storage.local.get(['extension_state', 'sessionLoggedIn', 'reactivation_warning_text', 'platformUser'], (st) => {
      const isSuspended = st.extension_state === 'SUSPENDED' || st.sessionLoggedIn === false || !st.platformUser;
      if (isSuspended) {
        sendResponse({
          alive: false,
          revoked: true,
          message: st.reactivation_warning_text || "Tu dispositivo ha sido liberado por el administrador."
        });
        return;
      }
      verifyActiveSubscriptionLive(false).catch(() => {});
      sendResponse({ alive: true });
    });
    return true;
  }

  if (request.action === "VERIFY_SESSION_LIVE") {
    verifyActiveSubscriptionLive(!!request.force).then(() => {
      chrome.storage.local.get(['extension_state', 'sessionLoggedIn', 'reactivation_warning_text'], (st) => {
        const isAlive = st.extension_state !== 'SUSPENDED' && st.sessionLoggedIn !== false;
        sendResponse({
          alive: isAlive,
          active: isAlive,
          message: st.reactivation_warning_text
        });
      });
    }).catch(() => {
      sendResponse({ alive: true, active: true });
    });
    return true;
  }

  if (request.action === "CHECK_EXTENSION_STATUS") {
    chrome.storage.local.get(['extension_state', 'sessionLoggedIn', 'platformUser'], (res) => {
      sendResponse({
        state: res.extension_state || (res.sessionLoggedIn ? 'ACTIVE' : 'SUSPENDED'),
        sessionLoggedIn: !!res.sessionLoggedIn,
        username: res.platformUser ? res.platformUser.username : null
      });
    });
    return true;
  }

  if (request.action === "OPEN_LOGIN_PAGE") {
    openLoginTab();
    sendResponse({ success: true });
    return true;
  }

  if (request.action === "FORCE_DEEP_CLEAN") {
    deepCleanGoogleAccountsAndStorage(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === "TRIGGER_SEAMLESS_UPDATE") {
    chrome.storage.local.get(['platformUser', 'sessionLoggedIn', 'flow_device_mac', 'extension_state'], (current) => {
      if (current && current.platformUser) {
        chrome.storage.local.set({
          ultra_session_backup: current,
          ultra_preserve_session: true
        }, () => {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: true });
      }
    });
    return true;
  }

  if (request.action === "SYNC_WEB_SESSION") {
    const rawUser = request.platformUser;
    if (rawUser && (rawUser.username || rawUser.user)) {
      const uName = (rawUser.username || rawUser.user).trim();
      const uPass = rawUser.password || rawUser.pass || '';
      const uMac = rawUser.device_mac || '';

      validateSessionWithCloud(uName, uPass, uMac).then(cloudCheck => {
        if (cloudCheck && cloudCheck.success) {
          const effectiveData = mapLoginResponseSupabase(cloudCheck, uPass, uMac);
          if (effectiveData && effectiveData.days_remaining > 0) {
            const storageUpdates = {
              extension_state: 'ACTIVE',
              platformUser: effectiveData,
              sessionLoggedIn: true,
              pending_reactivation_warning: false,
              reactivation_warning_text: null,
              flowLoginTime: Date.now(),
              flowLastServerCheck: Date.now(),
              // [FIX #2] Persistir los nonces para evitar falsos positivos
              // en el siguiente poll a /verificar-estado. Sin esto, el backend
              // ve client_migration_nonce=null y migration_nonce=uuid-viejo
              // → dispara una migración fantasma en cada login por portal web.
              flow_migration_nonce: effectiveData.migration_nonce || null,
              flow_revoke_nonce: effectiveData.revoke_nonce || null
            };
            if (uMac) storageUpdates.flow_device_mac = uMac;

            chrome.storage.local.set(storageUpdates, () => {
              console.log("[Flow] ✅ Sesión verificada con Supabase:", effectiveData.username);
              sendResponse({ success: true, user: effectiveData.username });
            });
          } else {
            chrome.storage.local.set({
              extension_state: 'SUSPENDED',
              sessionLoggedIn: false,
              platformUser: null,
              pending_reactivation_warning: true,
              reactivation_warning_text: "Tu suscripción ha finalizado o no tiene días activos."
            }, () => {
              sendResponse({ success: false, message: "Suscripción inactiva." });
            });
          }
        } else {
          chrome.storage.local.set({
            extension_state: 'SUSPENDED',
            sessionLoggedIn: false,
            platformUser: null,
            pending_reactivation_warning: true,
            reactivation_warning_text: (cloudCheck && cloudCheck.mensaje) ? cloudCheck.mensaje : "Error al validar sesión."
          }, () => {
            sendResponse({ success: false, message: "Validación fallida." });
          });
        }
      }).catch(() => {
        sendResponse({ success: false });
      });
      return true;
    }
  }

  if (request.action === "GET_FULL_CREDS") {
    getFullCloudCredentials().then(creds => sendResponse(creds));
    return true;
  }

  if (request.action === "APPLY_MIGRATION") {
    applyAccountMigration(request.migration)
      .then(applied => sendResponse({ success: !!applied }))
      .catch(() => sendResponse({ success: false }));
    return true;
  }

  if (request.action === "DISMISS_WARNING") {
    chrome.storage.local.set({ pending_reactivation_warning: false });
    sendResponse({ success: true });
    return true;
  }

  return true;
});