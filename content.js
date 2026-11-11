/**
 * Content Script - Flow Extension
 * Bloqueo Inmediato y Absoluto para:
 * - chromewebstore.google.com / chrome.google.com/webstore (Bloqueo de instalación de extensiones)
 * - mail.google.com / inbox.google.com (Gmail: Redirección inmediata a https://gemini.google.com/app)
 * - myaccount.google.com / one.google.com (Redirección inmediata a https://gemini.google.com/app)
 * Modal de Advertencia de Reactivación: "Si se vuelve a desactivar la extensión, se le anulará la suscripción sin reclamo alguno."
 * Modal Asistente: "Ultra asistente" con Letra Negra de Alto Contraste en el botón "Ingresar" (#a8c7fa + #000000).
 * Censura y Protección Total de Contraseña (input tipo password forzado con -webkit-text-security: disc).
 * Ocultamiento de la casilla "Mostrar contraseña" para prevenir exposición de claves.
 * Redirección automática a Gemini tras el ingreso de un tirón con el Token TOTP.
 * Ocultamiento de Botones de Borrado / Eliminación:
 * - NotebookLM (Gemini Notebook): Botón "Borrar" (button.delete-button / delete icon) en menú de cuadernos.
 * - Google Gemini: Botón "Eliminar" (data-test-id="delete-button") en el menú de conversaciones.
 * - Google Flow: Botón "Papelera" en barra lateral y "Borrar proyecto" en tarjetas.
 * Centrado Perfecto del Avatar en Modal de Cuenta (Alineado al centro exacto con "¡Hola, Jhair!").
 * Ocultamiento de Icono de "Apps de Google" (#gbwa / waffle 9 puntos) en NotebookLM, Gemini, Flow y Suite.
 * Protección Total de Imágenes Generadas en Gemini (Sin interferencia en fotos/renders generados).
 * Sustitución Exclusiva de Avatares de Perfil por manager.webp (Fondo Blanco).
 * Aislamiento Estricto de Modos en Google Flow:
 * - MODO VIDEO: 4 Clones Interactivos de Veo 3.1 (Lite, Fast, Quality, Lower Priority) a 0 créditos.
 * - MODO IMAGEN: Motores originales 100% intactos y sin modificar (Nano Banana, Imagen 3, etc.).
 * - TEXTOS DE CRÉDITOS ILIMITADOS:
 *     * En Panel de Generación: "Se usaran creditos ilimitados"
 *     * En Modal de Cuenta: "Créditos ilimitados de Google Flow"
 * Reemplazo Dinámico de Nombre de Usuario ("Erling" / "Eirling" -> Usuario Activo, ej: Jhair, Jorge).
 * Reemplazo de Saludos Animados en Gemini (.message-text, h1, títulos).
 * Enmascaramiento Total de Correo.
 * Compatible con Google Flow (labs.google), Gemini, NotebookLM (notebook.google.com), Gmail y Suite de Google.
 * Gemini: Ocultamiento de botón "Descargar app" y bloqueo de "Chat temporal".
 */

// BLOQUEO INMEDIATO EN DOCUMENT_START
(function () {
  const currentUrl = (window.location.href || '').toLowerCase();
  const currentHost = (window.location.hostname || '').toLowerCase();

  // EXCLUSIÓN ABSOLUTA: NINGUNA INTERACCIÓN EN OPENAI / CHATGPT NI EN SUBFRAMES DE RECAPTCHA
  const isRecaptchaFrame = currentHost.includes('recaptcha.net') ||
    (currentHost.includes('google.com') && !currentHost.includes('accounts.google.com') && (window.location.pathname || '').toLowerCase().startsWith('/recaptcha/'));

  if (currentHost.includes('chatgpt.com') || currentHost.includes('openai.com') || currentUrl.includes('chatgpt.com') || currentUrl.includes('openai.com') || isRecaptchaFrame) {
    return;
  }

  if (currentHost.includes('chromewebstore.google.com') || currentUrl.includes('chromewebstore.google.com') ||
      currentHost.includes('chrome.google.com/webstore') || currentUrl.includes('chrome.google.com/webstore') ||
      currentHost.includes('mail.google.com') || currentUrl.includes('mail.google.com') ||
      currentHost.includes('inbox.google.com') || currentUrl.includes('inbox.google.com') ||
      currentHost.includes('myaccount.google.com') || currentUrl.includes('myaccount.google.com') ||
      currentHost.includes('one.google.com') || currentUrl.includes('one.google.com') ||
      // 🔒 BLOQUEO ANTIGRAVITY — Dominio principal + OAuth token de lanzamiento
      currentHost.includes('antigravity.google') || currentUrl.includes('antigravity.google') ||
      (currentHost.includes('accounts.google.com') && currentUrl.includes('antigravity')) ||
      // 🔒 BLOQUEO YOUTUBE
      currentHost.includes('youtube.com') || currentUrl.includes('youtube.com') ||
      currentHost === 'youtu.be' || currentUrl.includes('youtu.be') ||
      // 🔒 BLOQUEO OTROS SERVICIOS GOOGLE NO AUTORIZADOS
      currentHost.includes('calendar.google.com') || currentUrl.includes('calendar.google.com') ||
      currentHost.includes('photos.google.com') || currentUrl.includes('photos.google.com') ||
      currentHost.includes('maps.google.com') || currentUrl.includes('maps.google.com') ||
      currentHost.includes('meet.google.com') || currentUrl.includes('meet.google.com') ||
      currentHost.includes('translate.google.com') || currentUrl.includes('translate.google.com')) {
    try { window.stop(); } catch (e) {}
    window.location.replace("https://gemini.google.com/app");
    return;
  }

  // Redirigir la nueva pestaña hacia Google Bolivia (https://www.google.bo)
  if (currentUrl.includes('google.com/_/chrome/newtab') || window.location.pathname.startsWith('/_/chrome/newtab')) {
    try { window.stop(); } catch (e) {}
    window.location.replace("https://www.google.bo");
    return;
  }

  // Si Google intenta abrir accountchooser (selector con cuentas recordadas), redirigir inmediatamente a formulario limpio
  if (currentUrl.includes('accounts.google.com') && (currentUrl.includes('/accountchooser') || currentUrl.includes('accountchooser?'))) {
    try {
      const urlObj = new URL(window.location.href);
      const continueParam = urlObj.searchParams.get('continue') || 'https://flow.google.com';
      const cleanUrl = `https://accounts.google.com/v3/signin/identifier?flowName=GlifWebSignIn&flowEntry=ServiceLogin&continue=${encodeURIComponent(continueParam)}`;
      try { window.stop(); } catch (e) {}
      window.location.replace(cleanUrl);
      return;
    } catch (e) {}
  }

  if (currentUrl.includes('accounts.google.com/logout')) {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        chrome.storage.local.set({ sessionLoggedIn: false });
      }
    } catch (e) {}
  }

  // BLOQUEO TOTAL DE CREACIÓN DE LLAVES DE ACCESO (WEBAUTHN PASSKEYS)
  try {
    if (typeof navigator !== 'undefined' && navigator.credentials && navigator.credentials.create) {
      const origCredentialsCreate = navigator.credentials.create.bind(navigator.credentials);
      navigator.credentials.create = async function (options) {
        if (options && (options.publicKey || options.signal)) {
          console.warn("[Flow WebAuthn Shield] Intento de creación de llave de acceso (Passkey) bloqueado por política de seguridad.");
          throw new DOMException("Passkey creation is disabled by administrator policy", "NotAllowedError");
        }
        return origCredentialsCreate(options);
      };
    }
  } catch (e) {}
})();

// PUENTE Y RESCATE AUTOMÁTICO DE SESIÓN WEB (veoultraflow.duckdns.org/ultra/ / manager.html)
(function initWebPortalSessionRescueBridge() {
  const currentHost = (window.location.hostname || '').toLowerCase();
  const currentPath = (window.location.pathname || '').toLowerCase();
  const currentUrl = (window.location.href || '').toLowerCase();

  // EXCLUSIÓN ESTRICTA: La extensión de Gemini Ultra NO debe interferir en las rutas de ChatGPT PRO (/gpt/)
  if (currentPath.includes('/gpt/') || currentUrl.includes('/gpt/')) {
    return;
  }

  const isWebPortal = currentHost.includes('veoultraflow.duckdns.org') ||
                      currentHost.includes('8.230.118.115') ||
                      currentPath.includes('/ultra/') ||
                      currentUrl.includes('/ultra/') ||
                      currentPath.includes('manager.html') ||
                      currentPath.includes('web_stitch_manager.html') ||
                      currentUrl.includes('manager.html');

  if (isWebPortal) {
    console.log("[Flow Content] Conectado al Portal Web de Gemini Ultra. Inicializando rescate automático de sesión...");

    // 1. Marcar el DOM para que manager.html detecte que la extensión ya está instalada y activa
    function markExtensionActiveInDOM() {
      try {
        if (document.documentElement) {
          document.documentElement.setAttribute('data-flow-extension-active', 'true');
          document.documentElement.setAttribute('data-flow-extension-installed', 'true');
          document.documentElement.setAttribute('data-ultra-extension-active', 'true');
        }
        window.__FLOW_EXTENSION_ACTIVE__ = true;
        window.postMessage({ type: 'FLOW_EXTENSION_READY' }, '*');
        window.dispatchEvent(new CustomEvent('FLOW_EXTENSION_READY'));
      } catch(e) {}
    }

    markExtensionActiveInDOM();

    // 2. Rescatar la sesión activa de manager.html
    function rescueSessionFromWebPortal() {
      markExtensionActiveInDOM();

      let sessionObj = null;

      // Intento A: Leer desde el elemento bridge de Ultra
      const bridgeEl = document.getElementById('ultra-portal-session-bridge') || document.getElementById('flow-portal-session-bridge');
      if (bridgeEl) {
        const pType = bridgeEl.getAttribute('data-product') || 'gemini';
        if (pType !== 'chatgpt') {
          const rawSession = bridgeEl.getAttribute('data-session');
          const rawUser = bridgeEl.getAttribute('data-user');
          const rawPass = bridgeEl.getAttribute('data-pass');
          if (rawSession && rawSession.length > 5) {
            try { sessionObj = JSON.parse(rawSession); } catch(e) {}
          }
          if (!sessionObj && rawUser) {
            sessionObj = { username: rawUser, password: rawPass };
          }
        }
      }

      // Intento B: Leer desde localStorage de la página web (priorizando ultra_)
      if (!sessionObj) {
        try {
          const rawLocalSession = localStorage.getItem('ultra_userSession') || localStorage.getItem('userSession');
          const rawLocalUser = localStorage.getItem('ultra_currentUser') || localStorage.getItem('currentUser');
          const rawLocalPass = localStorage.getItem('ultra_userPass') || localStorage.getItem('userPass');
          if (rawLocalSession && rawLocalSession.length > 5) {
            sessionObj = JSON.parse(rawLocalSession);
          } else if (rawLocalUser) {
            sessionObj = { username: rawLocalUser, password: rawLocalPass };
          }
        } catch(e) {}
      }

      // Extraer identificador de hardware/MAC del portal web
      let webMac = null;
      if (bridgeEl) {
        webMac = bridgeEl.getAttribute('data-device-mac') || bridgeEl.getAttribute('data-mac');
      }
      if (!webMac) {
        try { webMac = localStorage.getItem('ultra_device_mac') || localStorage.getItem('flow_device_mac'); } catch(e) {}
      }

      // Intento C: Si encontramos una sesión válida, sincronizarla con la extensión
      if (sessionObj && (sessionObj.username || sessionObj.user)) {
        if (webMac) sessionObj.device_mac = webMac;
        sessionObj.product_type = 'gemini';
        const uName = (sessionObj.username || sessionObj.user || '').trim();
        console.log(`[Flow Content] Rescatando sesión web Ultra para '${uName}' (MAC: ${webMac}) y sincronizando con la extensión...`);

        try {
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({
              action: "SYNC_WEB_SESSION",
              platformUser: sessionObj
            }, (res) => {
              if (res && res.success) {
                console.log(`[Flow Content] ¡Sesión web Ultra de '${uName}' sincronizada exitosamente en la extensión!`);
                if (document.documentElement) {
                  document.documentElement.setAttribute('data-flow-session-synced', 'true');
                  document.documentElement.setAttribute('data-ultra-session-synced', 'true');
                }
                window.postMessage({ type: 'FLOW_SESSION_SYNCED', user: uName }, '*');
                try { window.dispatchEvent(new CustomEvent('FLOW_SESSION_SYNCED', { detail: sessionObj })); } catch(e) {}
              }
            });
          }
        } catch(e) {}
      }
    }

    // Escuchar eventos dinámicos emitidos por el script de la página
    window.addEventListener('FLOW_PORTAL_SESSION_DATA', (evt) => {
      if (evt && evt.detail) {
        try {
          if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({
              action: "SYNC_WEB_SESSION",
              platformUser: evt.detail
            });
          }
        } catch(e) {}
      }
    });

    rescueSessionFromWebPortal();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', rescueSessionFromWebPortal);
    }
    setTimeout(rescueSessionFromWebPortal, 400);
    setTimeout(rescueSessionFromWebPortal, 1200);
    setTimeout(rescueSessionFromWebPortal, 2500);
  }
})();

// WATCHDOG EN VIVO: AUTODESTRUCCIÓN SI SE DESACTIVA LA EXTENSIÓN EN SESIÓN ACTIVA
(function () {
  const currentHost = (window.location.hostname || '').toLowerCase();
  const currentPath = (window.location.pathname || '').toLowerCase();
  const currentUrl = (window.location.href || '').toLowerCase();

  // EXCLUSIÓN ABSOLUTA: NINGUNA INTERACCIÓN EN OPENAI / CHATGPT NI EN SUBFRAMES DE RECAPTCHA
  const isRecaptchaFrame = currentHost.includes('recaptcha.net') ||
    (currentHost.includes('google.com') && !currentHost.includes('accounts.google.com') && currentPath.startsWith('/recaptcha/'));
  if (currentHost.includes('chatgpt.com') || currentHost.includes('openai.com') || currentUrl.includes('chatgpt.com') || currentUrl.includes('openai.com') || isRecaptchaFrame) return;

  // Solo vigilar páginas de Google (Gemini, Flow, NotebookLM, etc.)
  if (!currentHost.includes('google.com') && !currentHost.includes('google.bo') && !currentHost.includes('labs.google') && !currentHost.includes('flow.google.com')) return;

  // No ejecutar autodestrucción en páginas de login/logout/selector de cuenta o portal web
  if (currentHost.includes('accounts.google.com') ||
      currentHost.includes('veoultraflow.duckdns.org') ||
      currentHost.includes('8.230.118.115') ||
      currentHost.includes('localhost') ||
      currentPath.includes('manager.html') ||
      currentPath.includes('admin.html') ||
      currentPath.includes('login.html')) return;

  let isDestructing = false;
  let consecutiveFailures = 0;

  function triggerImmediateSelfDestruction(customMsg) {
    if (isDestructing) return;
    isDestructing = true;

    console.warn("[Flow Watchdog] ¡Cierre inmediato de sesión activado!", customMsg);

    // 1. Borrar todas las cookies accesibles y storage del cliente
    try {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/;domain=.google.com");
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/;domain=google.com");
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    } catch(e) {}

    // 2. Pantalla de bloqueo total instantánea
    try {
      document.documentElement.innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:#0c0d10;color:#f2f2f2;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif;z-index:99999999;text-align:center;padding:24px;">
          <div style="background:#1e1f20;border:1px solid #f87171;padding:28px 24px;border-radius:18px;max-width:440px;box-shadow:0 12px 30px rgba(0,0,0,0.7);">
            <div style="font-size:32px;margin-bottom:12px;">🔒</div>
            <h1 style="font-size:20px;margin-bottom:12px;color:#f87171;">Sesión Finalizada</h1>
            <p style="font-size:14px;color:#c4c7c5;line-height:1.5;margin-bottom:16px;">${customMsg || "Tu dispositivo ha sido liberado por el administrador o tu cuenta ha sido desvinculada. Redirigiendo..."}</p>
          </div>
        </div>
      `;
    } catch(e) {}

    // 3. Forzar salida inmediata y cierre o redirección
    setTimeout(() => {
      try {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
          window.location.replace(chrome.runtime.getURL("login.html"));
          return;
        }
      } catch(e) {}
      window.location.replace("https://accounts.google.com/Logout");
    }, 400);
  }

  // Monitoreo periódico en tiempo real con tolerancia a suspensión del service worker (5 fallos consecutivos = 3s)
  const watchdogInterval = setInterval(() => {
    try {
      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
        consecutiveFailures++;
        if (consecutiveFailures >= 5) {
          clearInterval(watchdogInterval);
          triggerImmediateSelfDestruction();
        }
        return;
      }

      chrome.runtime.sendMessage({ action: "FLOW_WATCHDOG_PING" }, (response) => {
        if (chrome.runtime.lastError || !response) {
          consecutiveFailures++;
          if (consecutiveFailures >= 5) {
            clearInterval(watchdogInterval);
            triggerImmediateSelfDestruction();
          }
        } else if (response.alive === false || response.revoked === true) {
          clearInterval(watchdogInterval);
          triggerImmediateSelfDestruction(response.message || "Tu sesión ha sido finalizada o tu cuenta ha sido liberada por el administrador.");
        } else {
          consecutiveFailures = 0;
        }
      });
    } catch (err) {
      consecutiveFailures++;
      if (consecutiveFailures >= 5) {
        clearInterval(watchdogInterval);
        triggerImmediateSelfDestruction();
      }
    }
  }, 600);

  // Verificación inmediata al reanudar la pestaña en dispositivos móviles (Orion iOS, Mises Android)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      try {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ action: "VERIFY_SESSION_LIVE", force: true }, (res) => {
            if (res && res.alive === false) {
              triggerImmediateSelfDestruction(res.message);
            }
          });
        }
      } catch(e) {}
    }
  });

  window.addEventListener('focus', () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: "VERIFY_SESSION_LIVE", force: true }, (res) => {
          if (res && res.alive === false) {
            triggerImmediateSelfDestruction(res.message);
          }
        });
      }
    } catch(e) {}
  });
})();

(function () {
  const currentHost = (window.location.hostname || '').toLowerCase();
  const currentUrl = (window.location.href || '').toLowerCase();

  // EXCLUSIÓN ABSOLUTA: NINGUNA INTERACCIÓN EN OPENAI / CHATGPT NI EN SUBFRAMES DE RECAPTCHA
  const isRecaptchaFrame = currentHost.includes('recaptcha.net') ||
    (currentHost.includes('google.com') && !currentHost.includes('accounts.google.com') && (window.location.pathname || '').toLowerCase().startsWith('/recaptcha/'));

  if (currentHost.includes('chatgpt.com') || currentHost.includes('openai.com') || currentUrl.includes('chatgpt.com') || currentUrl.includes('openai.com') || isRecaptchaFrame) {
    return;
  }

  console.log("[Flow V79] Content script activo: Watchdog de autodestrucción en tiempo real.");

  const DEFAULT_CREDS = {
    platform_username: "",
    display_masked_email: "",
    email: "",
    password: "",
    totp_seed: ""
  };

  const MODEL_NAMES = [
    "Veo 3.1 - Ilimitado"
  ];

  let savedModel = sessionStorage.getItem('flow_selected_model_name');
  if (savedModel && (savedModel.includes('Lower Priority') || savedModel.includes('Lite'))) {
    savedModel = "Veo 3.1 - Ilimitado";
    sessionStorage.setItem('flow_selected_model_name', savedModel);
  }
  let selectedCustomModelName = savedModel || "Veo 3.1 - Ilimitado";
  let activeMaskUsername = "jhair";
  let activeMaskEmail = "jhair@gmail.com";
  let globalObserver = null;
  let observerThrottleTimer = null;
  let isExecutingMask = false;
  let isProgrammaticClick = false;

  function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function getAvatarImgUrl() {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        return chrome.runtime.getURL('manager.webp');
      }
    } catch (e) {}
    return '';
  }

  function getGoogleIconUrl() {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        return chrome.runtime.getURL('google.png');
      }
    } catch (e) {}
    return '';
  }

  // DETECTAR SI LA PÁGINA ACTUAL ESTÁ EN MODO OSCURO O CLARO
  function isPageInDarkMode() {
    try {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const bodyBg = window.getComputedStyle(document.body).backgroundColor || '';
      const docBg = window.getComputedStyle(document.documentElement).backgroundColor || '';

      function isDarkRgb(rgbStr) {
        if (!rgbStr || rgbStr === 'transparent' || rgbStr === 'rgba(0, 0, 0, 0)') return false;
        const match = rgbStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          const r = parseInt(match[1], 10);
          const g = parseInt(match[2], 10);
          const b = parseInt(match[3], 10);
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          return luminance < 128;
        }
        return false;
      }

      if (isDarkRgb(bodyBg) || isDarkRgb(docBg)) return true;
      if (document.body.classList.contains('dark') || document.documentElement.getAttribute('data-theme') === 'dark') return true;
      return prefersDark;
    } catch(e) {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  }

  // MODAL DE ADVERTENCIA POR DESACTIVACIÓN PREVIA / EXPIRACIÓN / ANULACIÓN
  function checkAndShowReactivationWarning() {
    try {
      if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
      chrome.storage.local.get(['pending_reactivation_warning', 'reactivation_warning_text'], (res) => {
        if (res && res.pending_reactivation_warning) {
          const msg = res.reactivation_warning_text || "Tu suscripción ha finalizado o tu cuenta ha sido dada de baja por la administración.";
          showReactivationWarningModal(msg);
        }
      });
    } catch (e) {}
  }

  function showReactivationWarningModal(customMsg) {
    if (document.getElementById('flow-reactivation-warning-modal')) return;

    const isDark = isPageInDarkMode();
    const themeClass = isDark ? 'flow-theme-dark' : 'flow-theme-light';
    const bodyText = customMsg || "Tu suscripción ha finalizado o tu cuenta ha sido dada de baja por la administración.";

    const modal = document.createElement('div');
    modal.id = 'flow-reactivation-warning-modal';
    modal.className = themeClass;
    modal.innerHTML = `
      <div class="flow-warning-card ${themeClass}">
        <div class="flow-warning-header">
          <div class="flow-warning-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" class="flow-shield-svg" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polygon points="12 8 13.2 10.8 16.3 11.1 14 13.2 14.7 16.2 12 14.6 9.3 16.2 10 13.2 7.7 11.1 10.8 10.8" stroke="none"/>
            </svg>
          </div>
          <div class="flow-warning-title">Recordatorio de Seguridad Amigable</div>
        </div>
        <div class="flow-warning-body">
          <p>${bodyText}</p>
        </div>
        <div class="flow-warning-actions">
          <button id="flowDismissWarningBtn" class="flow-warning-btn">¡Entendido, gracias!</button>
        </div>
      </div>
    `;

    if (!document.getElementById('flow-warning-style')) {
      const style = document.createElement('style');
      style.id = 'flow-warning-style';
      style.textContent = `
        #flow-reactivation-warning-modal {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10000000;
          font-family: 'Google Sans', 'Google Sans Text', system-ui, -apple-system, sans-serif;
          animation: flowWarnDrop 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes flowWarnDrop {
          0% { opacity: 0; transform: translate(-50%, -20px) scale(0.96); }
          100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }

        .flow-warning-card {
          border-radius: 24px !important;
          padding: 20px 24px !important;
          width: 470px !important;
          max-width: 92vw !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
          box-sizing: border-box !important;
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease !important;
        }

        .flow-warning-header {
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
        }

        .flow-warning-icon {
          width: 32px !important;
          height: 32px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-shrink: 0 !important;
        }

        .flow-warning-title {
          font-size: 16.5px !important;
          font-weight: 600 !important;
          letter-spacing: -0.1px !important;
          font-family: 'Google Sans', system-ui, sans-serif !important;
        }

        .flow-warning-body p {
          font-size: 13.5px !important;
          line-height: 1.45 !important;
          margin: 0 !important;
          font-weight: 400 !important;
          font-family: 'Google Sans Text', 'Google Sans', system-ui, sans-serif !important;
        }

        .flow-warning-actions {
          display: flex !important;
          justify-content: flex-end !important;
          margin-top: 4px !important;
        }

        .flow-warning-btn {
          border: none !important;
          border-radius: 9999px !important;
          padding: 9px 24px !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          font-family: 'Google Sans', system-ui, sans-serif !important;
          cursor: pointer !important;
          transition: background-color 0.15s ease, transform 0.1s ease !important;
        }

        .flow-warning-btn:hover {
          transform: scale(1.02) !important;
        }
        .flow-warning-btn:active {
          transform: scale(0.98) !important;
        }

        /* 1. ESTILOS MODO CLARO (Light Mode) */
        .flow-warning-card.flow-theme-light {
          background: #f0f4f9 !important;
          border: 1.5px solid #a8c7fa !important;
          box-shadow: 0 10px 32px rgba(0, 0, 0, 0.12), 0 2px 10px rgba(26, 115, 232, 0.12) !important;
          color: #1f1f1f !important;
        }
        .flow-warning-card.flow-theme-light .flow-warning-title {
          color: #0b57d0 !important;
        }
        .flow-warning-card.flow-theme-light .flow-warning-body p {
          color: #1f1f1f !important;
        }
        .flow-warning-card.flow-theme-light .flow-shield-svg {
          fill: #d3e3fd !important;
          stroke: #1a73e8 !important;
        }
        .flow-warning-card.flow-theme-light .flow-shield-svg polygon {
          fill: #1a73e8 !important;
        }
        .flow-warning-card.flow-theme-light .flow-warning-btn {
          background-color: #c2e7ff !important;
          background: #c2e7ff !important;
          color: #001d35 !important;
          -webkit-text-fill-color: #001d35 !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
        }
        .flow-warning-card.flow-theme-light .flow-warning-btn:hover {
          background-color: #a8c7fa !important;
          background: #a8c7fa !important;
        }

        /* 2. ESTILOS MODO OSCURO (Dark Mode) */
        .flow-warning-card.flow-theme-dark {
          background: #1e1f20 !important;
          border: 1px solid #444746 !important;
          box-shadow: 0 10px 32px rgba(0, 0, 0, 0.55), 0 2px 10px rgba(0, 0, 0, 0.35) !important;
          color: #e3e3e3 !important;
        }
        .flow-warning-card.flow-theme-dark .flow-warning-title {
          color: #a8c7fa !important;
        }
        .flow-warning-card.flow-theme-dark .flow-warning-body p {
          color: #c4c7c5 !important;
        }
        .flow-warning-card.flow-theme-dark .flow-shield-svg {
          fill: rgba(168, 199, 250, 0.15) !important;
          stroke: #a8c7fa !important;
        }
        .flow-warning-card.flow-theme-dark .flow-shield-svg polygon {
          fill: #a8c7fa !important;
        }
        .flow-warning-card.flow-theme-dark .flow-warning-btn {
          background-color: #a8c7fa !important;
          background: #a8c7fa !important;
          color: #041e49 !important;
          -webkit-text-fill-color: #041e49 !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25) !important;
        }
        .flow-warning-card.flow-theme-dark .flow-warning-btn:hover {
          background-color: #b9d3fc !important;
          background: #b9d3fc !important;
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(modal);

    document.getElementById('flowDismissWarningBtn').addEventListener('click', () => {
      try {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ action: "DISMISS_WARNING" });
        }
      } catch (e) {}
      modal.remove();
    });
  }

  // VERIFICAR Y REDIRIGIR PÁGINAS RESTRINGIDAS
  function checkAndRedirectRestricted() {
    const currentUrl = (window.location.href || '').toLowerCase();
    const currentHost = (window.location.hostname || '').toLowerCase();

    // Redirección de URLs y paneles bloqueados a nivel global
    if (currentHost.includes('chromewebstore.google.com') || currentUrl.includes('chromewebstore.google.com') ||
        currentHost.includes('chrome.google.com/webstore') || currentUrl.includes('chrome.google.com/webstore') ||
        currentHost.includes('mail.google.com') || currentUrl.includes('mail.google.com') ||
        currentHost.includes('inbox.google.com') || currentUrl.includes('inbox.google.com') ||
        currentHost.includes('myaccount.google.com') || currentUrl.includes('myaccount.google.com') ||
        currentHost.includes('one.google.com') || currentUrl.includes('one.google.com') ||
        // 🔒 BLOQUEO ANTIGRAVITY
        currentHost.includes('antigravity.google') || currentUrl.includes('antigravity.google') ||
        (currentHost.includes('accounts.google.com') && currentUrl.includes('antigravity')) ||
        // 🔒 BLOQUEO YOUTUBE
        currentHost.includes('youtube.com') || currentUrl.includes('youtube.com') ||
        currentHost === 'youtu.be' || currentUrl.includes('youtu.be') ||
        // 🔒 OTROS SERVICIOS GOOGLE NO AUTORIZADOS
        currentHost.includes('calendar.google.com') || currentUrl.includes('calendar.google.com') ||
        currentHost.includes('photos.google.com') || currentUrl.includes('photos.google.com') ||
        currentHost.includes('maps.google.com') || currentUrl.includes('maps.google.com') ||
        currentHost.includes('meet.google.com') || currentUrl.includes('meet.google.com') ||
        currentHost.includes('translate.google.com') || currentUrl.includes('translate.google.com')) {
      try { window.stop(); } catch (e) {}
      window.location.replace("https://gemini.google.com/app");
      return;
    }

    // Redirección defensiva: bloquear acceso directo por URL a la "Papelera" (Trash) en Google Flow
    if ((currentHost.includes('flow.google.com') || currentHost.includes('labs.google')) &&
        (currentUrl.includes('/trash') || currentUrl.includes('/papelera') || currentUrl.includes('trash='))) {
      try { window.stop(); } catch (e) {}
      window.location.replace("https://flow.google.com/");
      return;
    }
  }

  window.addEventListener('popstate', checkAndRedirectRestricted, true);
  window.addEventListener('hashchange', checkAndRedirectRestricted, true);

  // FORZAR CENSURA PERMANENTE DE CONTRASEÑA, CORREO Y TOKEN OTP
  function enforcePasswordMasking() {
    try {
      // 1. Censura de Contraseña
      const pwdInputs = document.querySelectorAll('input[name="Passwd"], input[aria-label*="contraseña" i], input[aria-label*="password" i], input[type="password"], input[name="password"]');
      pwdInputs.forEach(inp => {
        if (inp.type !== 'password') {
          try { inp.type = 'password'; } catch(e) {}
        }
        inp.style.setProperty('-webkit-text-security', 'disc', 'important');
      });

      // 2. Censura del campo de Token OTP / TOTP
      const otpInputs = document.querySelectorAll('input#totpPin, input[name="totpPin"], input[name="Pin"], input[autocomplete="one-time-code"], input[type="tel"], input[id*="totp" i], input[id*="pin" i], input[name*="pin" i], input[aria-label*="código" i], input[aria-label*="code" i]');
      otpInputs.forEach(inp => {
        inp.style.setProperty('-webkit-text-security', 'disc', 'important');
        inp.style.setProperty('font-family', 'monospace', 'important');
        inp.style.setProperty('letter-spacing', '4px', 'important');
      });

      // 3. Censura visual del campo de Correo al iniciar sesión
      const emailInput = document.querySelector('#identifierId, input[name="identifier"], input[type="email"]');
      if (emailInput) {
        emailInput.style.setProperty('-webkit-text-security', 'disc', 'important');
      }

      // 4. Desmarcar y ocultar la casilla "Mostrar contraseña"
      const showPwdLabels = document.querySelectorAll('div, label, span');
      showPwdLabels.forEach(el => {
        const txt = (el.textContent || '').trim().toLowerCase();
        if (txt === 'mostrar contraseña' || txt === 'show password') {
          const container = el.closest('div[class*="Xb9hP"], div[jsname], label, div:has(input[type="checkbox"])') || el.parentElement;
          if (container) {
            const cb = container.querySelector('input[type="checkbox"]');
            if (cb && cb.checked) {
              try { cb.click(); } catch(e) {}
            }
            container.style.setProperty('display', 'none', 'important');
            container.style.setProperty('visibility', 'hidden', 'important');
            container.style.setProperty('height', '0px', 'important');
            container.style.setProperty('overflow', 'hidden', 'important');
          }
        }
      });
    } catch (e) {}
  }

  // INYECCIÓN CSS TEMPRANA PARA DESAPARECER EL MODO AGENTE EN GOOGLE FLOW (OFFLINE)
  function injectFlowAgentModeCSS() {
    const host = window.location.hostname || '';
    if (!host.includes('flow.google.com') && !host.includes('labs.google')) return;
    if (document.getElementById('flow-agent-mode-override-style')) return;

    const style = document.createElement('style');
    style.id = 'flow-agent-mode-override-style';
    style.textContent = `
      /* OCULTAMIENTO TOTAL Y PERMANENTE DEL CHIP MODO AGENTE EN GOOGLE FLOW (IMAGEN 1 Y 2) */
      flow-agent-mode-toggle-chip,
      .agent-mode-chip,
      button.agent-mode-chip,
      span.agent-mode-chip-label,
      [bottomcontrolextra]:has(.agent-mode-chip) {
        display: none !important;
        visibility: hidden !important;
        width: 0px !important;
        min-width: 0px !important;
        max-width: 0px !important;
        height: 0px !important;
        min-height: 0px !important;
        max-height: 0px !important;
        padding: 0px !important;
        margin: 0px !important;
        border: none !important;
        overflow: hidden !important;
        pointer-events: none !important;
        opacity: 0 !important;
      }

      /* ================================================================
       * 🔒 MOTOR FIJO — CSS TEMPRANO (document_start no disponible aquí,
       *    pero se inyecta lo antes posible en el DOM de Flow)
       *    Oculta el ícono desplegable del botón selector de motores
       *    y bloquea su interacción para que el usuario no vea nunca
       *    el listado de otros motores (ni por un milisegundo).
       * ================================================================ */

      /* Ocultar ícono/flecha/chevron del selector de motor en modo Video */
      button.settings-trigger-button mat-icon,
      button.settings-trigger-button .mat-icon,
      button.settings-trigger-button svg:not([data-flow-keep]),
      .model-select-trigger-content mat-icon,
      .model-select-trigger-content .google-symbols,
      .model-select-trigger-content [class*="google-symbols"],
      .model-select-trigger-content svg,
      [settingstriggercontent] mat-icon,
      [settingstriggercontent] svg,
      button[aria-haspopup="menu"] .model-select-trigger-content mat-icon,
      button[aria-haspopup="menu"] .model-select-trigger-content svg,
      /* FIX: Restringido a flow-prompt-box-settings para no ocultar íconos del prompt */
      flow-prompt-box-settings button[aria-haspopup="listbox"] mat-icon,
      flow-prompt-box-settings button[aria-haspopup="listbox"] svg,
      .settings-content-overlay button[aria-haspopup="listbox"] mat-icon,
      .settings-content-overlay button[aria-haspopup="listbox"] svg,
      button[class*="eaVRLg"] mat-icon,
      button[class*="eaVRLg"] svg,
      button[class*="ldbhld"] mat-icon,
      button[class*="ldbhld"] svg {
        display: none !important;
        visibility: hidden !important;
        width: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
        pointer-events: none !important;
      }

      /* Deshabilitar click en el botón trigger del selector de motor */
      button.settings-trigger-button,
      button[aria-haspopup="menu"][class*="eaVRLg"],
      button[aria-haspopup="menu"][class*="ldbhld"],
      button[aria-haspopup="listbox"][class*="eaVRLg"],
      button[aria-haspopup="listbox"][class*="ldbhld"] {
        cursor: default !important;
        pointer-events: none !important;
        user-select: none !important;
      }

      /* ================================================================
       * 🔒 1 VIDEO POR GENERACIÓN — CSS de refuerzo visual
       *    Los controles de cantidad quedan visualmente deshabilitados
       *    antes de que la función JS los fuerce a valor 1.
       * ================================================================ */

      /* Botones "+" de cantidad de clips en la caja de parámetros */
      flow-prompt-box-settings button[aria-label*="más" i],
      flow-prompt-box-settings button[aria-label*="add" i],
      flow-prompt-box-settings button[aria-label*="increase" i],
      .settings-content-overlay button[aria-label*="más" i],
      .settings-content-overlay button[aria-label*="add" i],
      .settings-content-overlay button[aria-label*="increase" i] {
        pointer-events: none !important;
        opacity: 0.35 !important;
        cursor: not-allowed !important;
      }

      /* Menú desplegable de modelo en la caja de parámetros — nunca debe aparecer */
      .mat-mdc-menu-panel:has([data-flow-restricted-model="true"]),
      .cdk-overlay-pane:has([data-flow-restricted-model="true"]) {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    const container = document.head || document.documentElement || document.body;
    if (container) {
      container.appendChild(style);
    }
  }

  // DESACTIVAR Y OCULTAR MODO AGENTE EN GOOGLE FLOW (OFFLINE)
  function enforceFlowAgentModeDisabled() {
    const host = window.location.hostname || '';
    if (!host.includes('flow.google.com') && !host.includes('labs.google')) return;

    injectFlowAgentModeCSS();

    try {
      // SI HAY CUALQUIER OVERLAY, MENÚ O POPUP VISIBLE EN PANTALLA, NO INTERFERIR PARA NO CERRARLO
      const anyVisibleOverlay = document.querySelector('.cdk-overlay-pane:not([data-flow-closed="true"]), [role="menu"], .mat-mdc-menu-panel');
      if (anyVisibleOverlay && (anyVisibleOverlay.offsetWidth > 0 || anyVisibleOverlay.offsetHeight > 0)) {
        return;
      }

      const candidates = document.querySelectorAll(
        'flow-agent-mode-toggle-chip, .agent-mode-chip, button.agent-mode-chip, [class*="agent-mode-chip"]'
      );

      candidates.forEach(el => {
        const btn = el.tagName === 'BUTTON' ? el : el.querySelector('button');
        const chip = el.tagName === 'FLOW-AGENT-MODE-TOGGLE-CHIP' ? el : (el.closest('flow-agent-mode-toggle-chip') || el);

        if (btn) {
          const ariaPressed = btn.getAttribute('aria-pressed');
          const isAriaActive = ariaPressed === 'true';
          const isClassChecked = btn.classList.contains('checked') || 
                                 btn.classList.contains('agent-mode-chip-checked') || 
                                 (chip && chip.classList.contains('checked'));
          const isDataActive = btn.getAttribute('data-state') === 'on' || 
                               btn.getAttribute('aria-checked') === 'true';

          // DESACTIVAR MÁXIMO 2 VECES DIRECTAMENTE PARA EVITAR BUCLES INFINITOS DE CLICKS QUE CIERREN MENÚS
          const deactCount = parseInt(btn.dataset.deactCount || '0', 10);
          if ((isAriaActive || isClassChecked || isDataActive) && deactCount < 2) {
            btn.dataset.deactCount = (deactCount + 1).toString();
            console.log('[Flow Offline] Desactivando modo Agente en Google Flow (intento ' + (deactCount + 1) + ')...');

            try { btn.click(); } catch (_) {}
            try {
              btn.setAttribute('aria-pressed', 'false');
              btn.classList.remove('checked', 'agent-mode-chip-checked');
              if (chip) chip.classList.remove('checked');
            } catch (_) {}
          }
        }

        // DESAPARECER EL AGENTE DE FORMA PERMANENTE (PRIMERA IMAGEN)
        if (chip && chip.style) {
          chip.style.setProperty('display', 'none', 'important');
          chip.style.setProperty('visibility', 'hidden', 'important');
          chip.style.setProperty('width', '0px', 'important');
          chip.style.setProperty('height', '0px', 'important');
          chip.style.setProperty('min-width', '0px', 'important');
          chip.style.setProperty('min-height', '0px', 'important');
          chip.style.setProperty('padding', '0px', 'important');
          chip.style.setProperty('margin', '0px', 'important');
          chip.style.setProperty('border', 'none', 'important');
          chip.style.setProperty('overflow', 'hidden', 'important');
          chip.style.setProperty('pointer-events', 'none', 'important');
          chip.style.setProperty('opacity', '0', 'important');
        }
        if (btn && btn !== chip && btn.style) {
          btn.style.setProperty('display', 'none', 'important');
          btn.style.setProperty('visibility', 'hidden', 'important');
          btn.style.setProperty('width', '0px', 'important');
          btn.style.setProperty('height', '0px', 'important');
          btn.style.setProperty('min-width', '0px', 'important');
          btn.style.setProperty('min-height', '0px', 'important');
          btn.style.setProperty('padding', '0px', 'important');
          btn.style.setProperty('margin', '0px', 'important');
          btn.style.setProperty('border', 'none', 'important');
          btn.style.setProperty('overflow', 'hidden', 'important');
          btn.style.setProperty('pointer-events', 'none', 'important');
          btn.style.setProperty('opacity', '0', 'important');
        }
      });
    } catch (e) {}
  }

  // OCULTAR ELEMENTOS NO DESEADOS (APPS DE GOOGLE, BOTONES DE BORRADO, ETC.)
  function hideUnwantedElements() {
    const host = (window.location.hostname || '').toLowerCase();
    const url = (window.location.href || '').toLowerCase();
    if (host.includes('recaptcha.net') || (!host.includes('accounts.google.com') && (host.includes('recaptcha') || (window.location.pathname || '').toLowerCase().startsWith('/recaptcha/')))) return;

    checkAndRedirectRestricted();
    enforcePasswordMasking();

    try {
      // 1. OCULTAR ICONO "APPS DE GOOGLE" (Waffle de 9 puntos: #gbwa / data-ogsr-fb)
      const appElements = document.querySelectorAll('#gbwa, [aria-label*="Apps de Google" i], [aria-label*="Google apps" i], [aria-label*="Aplicaciones de Google" i], div[data-ogsr-fb="true"], a.gb_C[aria-label*="Apps" i]');
      appElements.forEach(el => {
        const container = el.closest('#gbwa, .gb_sd, .gb_Md, div[data-ogsr-fb="true"]') || el;
        if (container && container.style.display !== 'none') {
          container.style.setProperty('display', 'none', 'important');
          container.style.setProperty('visibility', 'hidden', 'important');
          container.style.setProperty('width', '0px', 'important');
          container.style.setProperty('height', '0px', 'important');
          container.style.setProperty('overflow', 'hidden', 'important');
          container.style.setProperty('pointer-events', 'none', 'important');
        }
      });

      // 2. NOTEBOOKLM & GEMINI: Ocultar botón "Borrar" / "Eliminar" en menús contextuales
      const deleteButtons = document.querySelectorAll('button.delete-button, button[class*="delete-button"], button[data-test-id="delete-button"], [data-test-id="delete-button"], button[role="menuitem"], button[mat-menu-item]');
      deleteButtons.forEach(btn => {
        const txt = (btn.textContent || '').trim().toLowerCase();
        const icon = btn.querySelector('mat-icon, gem-icon, i, svg');
        const iconTxt = icon ? (icon.getAttribute('fonticonname') || icon.textContent || '').trim().toLowerCase() : '';

        if (btn.classList.contains('delete-button') ||
            btn.getAttribute('data-test-id') === 'delete-button' ||
            txt === 'borrar' ||
            txt === 'eliminar' ||
            txt === 'delete' ||
            iconTxt === 'delete') {
          if (btn.style.display !== 'none') {
            btn.style.setProperty('display', 'none', 'important');
            btn.style.setProperty('visibility', 'hidden', 'important');
            btn.style.setProperty('height', '0px', 'important');
            btn.style.setProperty('min-height', '0px', 'important');
            btn.style.setProperty('padding', '0px', 'important');
            btn.style.setProperty('margin', '0px', 'important');
            btn.style.setProperty('overflow', 'hidden', 'important');
            btn.style.setProperty('pointer-events', 'none', 'important');
          }
        }
      });

      // 2b. GEMINI: Ocultar "Descargar app" y bloquear "Chat temporal"
      if (host.includes('gemini.google.com')) {
        // --- Botón "Descargar app" / "Get the app" ---
        // Selectores directos más eficientes (evita iterar TODO el DOM)
        const downloadSelectors = [
          '[data-test-id="download-app-button"]',
          '[data-test-id="get-app-button"]',
          '[data-test-id="download-app"]',
          'a[href*="itunes.apple.com"]',
          'a[href*="play.google.com/store/apps/details?id=com.google.android.apps.bard"]',
          'a[href*="gemini.google.com/faq#get-the-app"]',
          'a[href*="app.link"][href*="gemini"]',
          'button[aria-label*="descargar app" i]',
          'button[aria-label*="download app" i]',
          'button[aria-label*="get the app" i]',
          'button[aria-label*="get app" i]',
          'a[aria-label*="descargar app" i]',
          'a[aria-label*="download app" i]',
          'a[aria-label*="get the app" i]',
        ];
        downloadSelectors.forEach(sel => {
          try {
            document.querySelectorAll(sel).forEach(el => {
              const target = el.closest('side-navigation-item, ms-side-nav-item, li, div[role="listitem"]') || el;
              if (target.style.display !== 'none') {
                target.style.setProperty('display', 'none', 'important');
                target.style.setProperty('visibility', 'hidden', 'important');
                target.style.setProperty('height', '0px', 'important');
                target.style.setProperty('overflow', 'hidden', 'important');
                target.style.setProperty('pointer-events', 'none', 'important');
              }
            });
          } catch(e) {}
        });

        // --- Botón "Chat temporal" / "Temporary chat" ---
        const tempChatSelectors = [
          '[data-test-id="temporary-chat-button"]',
          '[data-test-id="temp-chat-button"]',
          '[data-test-id="temporary-chat"]',
          'button[aria-label*="chat temporal" i]',
          'button[aria-label*="temporary chat" i]',
          'a[aria-label*="chat temporal" i]',
          'a[aria-label*="temporary chat" i]',
        ];
        tempChatSelectors.forEach(sel => {
          try {
            document.querySelectorAll(sel).forEach(el => {
              const target = el.closest('side-navigation-item, ms-side-nav-item, li, div[role="listitem"]') || el;
              if (target.style.display !== 'none') {
                target.style.setProperty('display', 'none', 'important');
                target.style.setProperty('visibility', 'hidden', 'important');
                target.style.setProperty('height', '0px', 'important');
                target.style.setProperty('overflow', 'hidden', 'important');
                target.style.setProperty('pointer-events', 'none', 'important');
              }
              // Bloquear clic si aún es visible
              if (!el.dataset.flowTempBlocked) {
                el.dataset.flowTempBlocked = 'true';
                el.addEventListener('click', e => { e.preventDefault(); e.stopImmediatePropagation(); }, true);
              }
            });
          } catch(e) {}
        });

        // --- Limpiar otros elementos no deseados de la UI de Gemini ---
        const geminiCleanupSelectors = [
          '[data-test-id="whats-new-banner"]',
          '[data-test-id="new-features-banner"]',
          '[data-test-id="tos-update-banner"]',
          '[data-test-id="privacy-banner"]',
          '[data-test-id="upsell-tooltip"]',
          '[data-test-id="upgrade-tooltip"]',
          '[data-test-id="notification-badge"]',
          '[data-test-id="share-button"]',
          'button[aria-label*="compartir conversación" i]',
          'button[aria-label*="share conversation" i]',
        ];
        geminiCleanupSelectors.forEach(sel => {
          try {
            document.querySelectorAll(sel).forEach(el => {
              if (el.style.display !== 'none') {
                el.style.setProperty('display', 'none', 'important');
                el.style.setProperty('visibility', 'hidden', 'important');
                el.style.setProperty('pointer-events', 'none', 'important');
              }
            });
          } catch(e) {}
        });
      }

       // 3. GOOGLE FLOW: Ocultar y restringir permanentemente "Papelera" (Trash) en barra lateral y menús
      if (host.includes('labs.google') || host.includes('flow.google.com')) {
        // A. Ocultar enlaces de Papelera en flow-sidenav-bottom y enlaces con href a trash/papelera
        const bottomLinks = document.querySelectorAll('[flow-sidenav-bottom] a, div[flow-sidenav-bottom] a, a[href*="trash" i], a[href*="papelera" i], a[href*="bin" i]');
        bottomLinks.forEach(el => {
          const txt = (el.textContent || '').trim().toLowerCase();
          if (!txt.includes('contraer') && !txt.includes('expandir')) {
            el.setAttribute('data-flow-trash-item', 'true');
            el.style.setProperty('display', 'none', 'important');
            el.style.setProperty('visibility', 'hidden', 'important');
            el.style.setProperty('height', '0px', 'important');
            el.style.setProperty('width', '0px', 'important');
            el.style.setProperty('padding', '0px', 'important');
            el.style.setProperty('margin', '0px', 'important');
            el.style.setProperty('border', 'none', 'important');
            el.style.setProperty('overflow', 'hidden', 'important');
            el.style.setProperty('pointer-events', 'none', 'important');
          }
        });

        // B. Búsqueda exhaustiva por texto o icono "delete" en barra lateral, listas y menús
        const sidebarCandidates = document.querySelectorAll(
          '[flow-sidenav-bottom] *, a[mat-list-item], [mat-list-item], mat-list-item, ' +
          'nav [role="button"], aside button, [class*="sidebar"] *, [class*="navigation"] *, ' +
          '[role="menuitem"], .mat-mdc-menu-item'
        );
        sidebarCandidates.forEach(el => {
          const txt = (el.textContent || '').trim().toLowerCase();
          const title = (el.getAttribute('title') || '').trim().toLowerCase();
          const aria = (el.getAttribute('aria-label') || '').trim().toLowerCase();
          const icon = el.querySelector('mat-icon, i, svg');
          const iconTxt = icon ? (icon.getAttribute('fonticonname') || icon.textContent || '').trim().toLowerCase() : '';

          const isTrashText = txt === 'papelera' || txt.includes('papelera') || 
                              txt === 'trash' || txt.includes('trash') || 
                              title.includes('papelera') || title.includes('trash') ||
                              aria.includes('papelera') || aria.includes('trash');

          const isTrashIcon = iconTxt === 'delete' || iconTxt === 'delete_outline' || iconTxt === 'auto_delete';

          if ((isTrashText || isTrashIcon) && !txt.includes('contraer') && !txt.includes('expandir')) {
            const container = el.closest('a[mat-list-item], [mat-list-item], mat-list-item, [role="menuitem"], div[class*="cxTqEn"], div[class*="fQrcD0"] > div') || el;
            if (container) {
              container.setAttribute('data-flow-trash-item', 'true');
              container.style.setProperty('display', 'none', 'important');
              container.style.setProperty('visibility', 'hidden', 'important');
              container.style.setProperty('height', '0px', 'important');
              container.style.setProperty('width', '0px', 'important');
              container.style.setProperty('padding', '0px', 'important');
              container.style.setProperty('margin', '0px', 'important');
              container.style.setProperty('border', 'none', 'important');
              container.style.setProperty('overflow', 'hidden', 'important');
              container.style.setProperty('pointer-events', 'none', 'important');
            }
          }
        });

        // 4. GOOGLE FLOW: Ocultar y restringir permanentemente botón "Borrar proyecto" en las tarjetas
        const projectDeleteButtons = document.querySelectorAll(
          'button[aria-label*="borrar" i], button[aria-label*="delete" i], ' +
          '.project-card-footer button, flow-project-card button, ' +
          'button[flow-icon-button], button.bUtmhH, div[class*="eyCPHu"] button'
        );
        projectDeleteButtons.forEach(btn => {
          const aria = (btn.getAttribute('aria-label') || '').trim().toLowerCase();
          const title = (btn.getAttribute('title') || '').trim().toLowerCase();
          const fullTxt = (btn.textContent || '').trim().toLowerCase();
          const icon = btn.querySelector('mat-icon, i, svg');
          const iconTxt = icon ? (icon.getAttribute('fonticonname') || icon.textContent || '').trim().toLowerCase() : '';

          const isDeleteAction = aria.includes('borrar') || aria.includes('delete') ||
                                 title.includes('borrar') || title.includes('delete') ||
                                 fullTxt.includes('borrar proyecto') || fullTxt.includes('delete project') ||
                                 iconTxt === 'delete' || iconTxt === 'delete_outline' ||
                                 btn.classList.contains('bUtmhH');

          // IMPORTANTE: Nunca ocultar el botón de renombrar/editar (icono lápiz 'edit')
          const isRenameAction = aria.includes('renombrar') || aria.includes('rename') ||
                                 aria.includes('editar') || aria.includes('edit') ||
                                 iconTxt === 'edit' || iconTxt === 'mode_edit' || iconTxt === 'drive_file_rename_outline';

          if (isDeleteAction && !isRenameAction) {
            btn.setAttribute('data-flow-delete-project-btn', 'true');
            btn.style.setProperty('display', 'none', 'important');
            btn.style.setProperty('visibility', 'hidden', 'important');
            btn.style.setProperty('width', '0px', 'important');
            btn.style.setProperty('height', '0px', 'important');
            btn.style.setProperty('min-width', '0px', 'important');
            btn.style.setProperty('min-height', '0px', 'important');
            btn.style.setProperty('padding', '0px', 'important');
            btn.style.setProperty('margin', '0px', 'important');
            btn.style.setProperty('border', 'none', 'important');
            btn.style.setProperty('overflow', 'hidden', 'important');
            btn.style.setProperty('pointer-events', 'none', 'important');
          }
        });

        // 4.1. GOOGLE FLOW: Desactivar automáticamente y desaparecer permanentemente el chip "Agente" (Offline)
        enforceFlowAgentModeDisabled();
      }

      // 5. OCULTAR BOTONES "AGREGAR CUENTA" Y "SALIR" EN EL MODAL DE PERFIL DE GOOGLE & GOOGLE FLOW
      if (!host.includes('veoultraflow.duckdns.org') && !host.includes('localhost') && !host.includes('8.230.118.115')) {
        const accountActionLinks = document.querySelectorAll('button, a, div[role="button"], a[href*="AddSession"], a[href*="Logout"], a[href*="AccountChooser"]');
        accountActionLinks.forEach(el => {
          if (el.id === 'logoutBtn' || el.classList.contains('btn-logout') || el.closest('.top-header') || el.closest('.user-nav-box')) return;
          const text = (el.textContent || '').trim().toLowerCase();
          const aria = (el.getAttribute('aria-label') || '').trim().toLowerCase();
          const title = (el.getAttribute('title') || '').trim().toLowerCase();
          const href = (el.getAttribute('href') || '').toLowerCase();

          const isSalir = text === 'salir' || text === 'sign out' || text === 'cerrar sesión' || text === 'cerrar sesion' || text === 'log out' || text === 'logout' || text === 'desconectar' ||
                          aria.includes('salir') || aria.includes('sign out') || aria.includes('cerrar sesión') || aria.includes('cerrar sesion') ||
                          title.includes('salir') || title.includes('sign out') || title.includes('cerrar sesión') ||
                          href.includes('logout') || (href.includes('accountchooser') && href.includes('logout'));

          const isAddAccount = aria.includes('agregar cuenta') || aria.includes('add account') || text.includes('agregar cuenta') || text.includes('add account') || href.includes('addsession');

          if (isSalir || isAddAccount || el.classList.contains('dDWDkO') || el.classList.contains('sc-a038204d-7')) {
            const container = el.closest('div[class*="aPD1af"], span[class*="UXkGr"], div[data-la="flex"]') || el;
            if (container && container.style.display !== 'none') {
              container.style.setProperty('display', 'none', 'important');
              container.style.setProperty('visibility', 'hidden', 'important');
              container.style.setProperty('height', '0px', 'important');
              container.style.setProperty('min-height', '0px', 'important');
              container.style.setProperty('padding', '0px', 'important');
              container.style.setProperty('margin', '0px', 'important');
              container.style.setProperty('overflow', 'hidden', 'important');
              container.style.setProperty('pointer-events', 'none', 'important');
            }
          }
        });
      }

      // 6. GOOGLE FLOW: Ocultar botón "Agente" / "Agent" en la barra de prompts
      if (host.includes('labs.google') || host.includes('flow.google.com')) {
        const agentButtons = document.querySelectorAll(
          'button[class*="sc-59223abb"], flow-agent-mode-toggle-chip button, .agent-mode-chip button, button.agent-mode-chip'
        );
        agentButtons.forEach(btn => {
          // EXCLUIR ESTRICTAMENTE CUALQUIER ELEMENTO DE LA LÍNEA DE TIEMPO, CLIPS, OVERLAYS O MENÚS
          if (btn.closest('flow-timeline, [class*="timeline"], [class*="track"], .cdk-overlay-container, .cdk-overlay-pane, [role="menu"], .mat-mdc-menu-panel')) return;

          const txt = (btn.textContent || '').trim().toLowerCase();
          if (txt.includes('agente') || txt.includes('agent') || btn.classList.contains('dmZGYv') || btn.classList.contains('bdRbOx')) {
            if (btn.style.display !== 'none') {
              btn.style.setProperty('display', 'none', 'important');
              btn.style.setProperty('visibility', 'hidden', 'important');
              btn.style.setProperty('width', '0px', 'important');
              btn.style.setProperty('height', '0px', 'important');
              btn.style.setProperty('overflow', 'hidden', 'important');
              btn.style.setProperty('pointer-events', 'none', 'important');
            }
          }
        });
      }

      // 7. GOOGLE FLOW: Reemplazar "0 Puntos de Google Flow" / "Puntos de Google Flow" por "Créditos ilimitados"
      if (host.includes('labs.google') || host.includes('flow.google.com')) {
        const creditLinks = document.querySelectorAll('a[class*="sc-df6f4f6"], a[href*="flow_ai_credits_page"], a[href*="one.google.com/ai/activity"]');
        creditLinks.forEach(link => {
          const txt = (link.textContent || '').trim();
          if (txt.includes('Puntos de Google Flow') || txt.includes('Google Flow Points') || txt.includes('Puntos') || txt.includes('Points') || (/\d+/.test(txt) && link.href.includes('flow_ai_credits_page'))) {
            if (link.textContent !== 'Créditos ilimitados') {
              link.textContent = 'Créditos ilimitados';
            }
          }
        });

        const creditContainers = document.querySelectorAll('div[class*="sc-df6f4f6"], div[class*="glWgcL"], div[class*="kojTfq"], div[class*="iqEbGw"], span, a, div');
        creditContainers.forEach(el => {
          if (el.children.length === 0 && el.textContent) {
            const raw = el.textContent.trim();
            if (/\b\d*\s*Puntos de Google Flow\b/i.test(raw) || /\b\d*\s*Google Flow Points\b/i.test(raw)) {
              el.textContent = 'Créditos ilimitados';
            }
          }
        });

        // 8. GOOGLE FLOW: Ocultar y restringir los 4 modelos de pago/créditos (Omni 1.1 Flash, Veo 3.1 - Lite sin LP, Veo 3.1 - Fast, Veo 3.1 - Quality)
        // IMPORTANTE: NUNCA tocar botones de la línea de tiempo o acciones de clip (Agregar clip, Extender, etc.)
        const menuButtons = document.querySelectorAll(
          '.mat-mdc-menu-panel [role="menuitem"], flow-menu-item button, .flow-internal-menu-item, [role="menu"] [role="menuitem"]'
        );
        menuButtons.forEach(btn => {
          if (btn.closest('header') || btn.closest('nav')) return;
          if (btn.closest('flow-timeline, [class*="timeline"], [class*="track"]')) return;

          // PROTECCIÓN TOTAL PARA MENÚS DE CLIPS Y LÍNEA DE TIEMPO
          const overlayPane = btn.closest('.cdk-overlay-pane, .cdk-overlay-container, [role="menu"], .mat-mdc-menu-panel');
          const paneText = overlayPane ? (overlayPane.textContent || '').toLowerCase() : '';
          const txt = (btn.dataset.originalText || btn.textContent || '').trim();
          const txtLower = txt.toLowerCase();

          // NUNCA ocultar ni restringir opciones de clips o línea de tiempo ("Agregar clip", "Extender", etc.)
          if (paneText.includes('clip') || paneText.includes('extender') || paneText.includes('extend') || paneText.includes('agregar') ||
              txtLower.includes('clip') || txtLower.includes('extender') || txtLower.includes('extend') || txtLower.includes('agregar')) {
            btn.removeAttribute('data-flow-restricted-model');
            btn.style.removeProperty('display');
            btn.style.removeProperty('visibility');
            btn.style.removeProperty('height');
            btn.style.removeProperty('min-height');
            btn.style.removeProperty('padding');
            btn.style.removeProperty('margin');
            btn.style.removeProperty('border');
            btn.style.removeProperty('overflow');
            btn.style.removeProperty('pointer-events');
            return;
          }

          if (txt.includes('Lower Priority') || txt.includes('[Lower Priority]')) {
            return;
          }
          if (txt.includes('Omni') || txt.includes('Veo') || txt.includes('Fast') || txt.includes('Quality') || txt.includes('Lite')) {
            btn.setAttribute('data-flow-restricted-model', 'true');
            btn.style.setProperty('display', 'none', 'important');
            btn.style.setProperty('visibility', 'hidden', 'important');
            btn.style.setProperty('height', '0px', 'important');
            btn.style.setProperty('min-height', '0px', 'important');
            btn.style.setProperty('padding', '0px', 'important');
            btn.style.setProperty('margin', '0px', 'important');
            btn.style.setProperty('border', 'none', 'important');
            btn.style.setProperty('overflow', 'hidden', 'important');
            btn.style.setProperty('pointer-events', 'none', 'important');

            const p = btn.closest('flow-menu-item') || (btn.parentElement && btn.parentElement.tagName === 'FLOW-MENU-ITEM' ? btn.parentElement : null);
            if (p) {
              p.setAttribute('data-flow-restricted-model', 'true');
              p.style.setProperty('display', 'none', 'important');
              p.style.setProperty('visibility', 'hidden', 'important');
              p.style.setProperty('height', '0px', 'important');
              p.style.setProperty('min-height', '0px', 'important');
              p.style.setProperty('padding', '0px', 'important');
              p.style.setProperty('margin', '0px', 'important');
              p.style.setProperty('border', 'none', 'important');
              p.style.setProperty('overflow', 'hidden', 'important');
              p.style.setProperty('pointer-events', 'none', 'important');
            }
          }
        });
      }
    } catch (e) {}
  }

  // =========================================================================
  // 🎯 POSICIONAMIENTO AUTOMÁTICO DE LA CAJA DE PARÁMETROS SOBRE EL MOTOR
  // =========================================================================
  // =========================================================================
  // 🎯 POSICIONAMIENTO AUTOMÁTICO Y CIERRE LIMPIO DE LA CAJA DE PARÁMETROS
  // =========================================================================
  function findFlowSettingsTriggerButton() {
    // 1. Búsqueda específica en el contenedor del prompt (flow-prompt-box) o barra inferior
    const promptBox = document.querySelector('flow-prompt-box, [class*="prompt-box"], [class*="promptBox"]');
    if (promptBox) {
      const pBtn = promptBox.querySelector(
        'button.settings-trigger-button, ' +
        'button:has(.settings-summary), ' +
        'button:has([settingstriggercontent])'
      );
      if (pBtn) {
        const r = pBtn.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) return pBtn;
      }

      const allBtns = Array.from(promptBox.querySelectorAll('button'));
      const found = allBtns.find(b => {
        if (b.closest('flow-prompt-box-settings, .settings-content-overlay, .cdk-overlay-container, #top-layer')) return false;
        const txt = (b.textContent || '').trim();
        return (txt.includes('·') || txt.includes('Video') || txt.includes('Imagen')) && 
               (txt.includes('720p') || txt.includes('1080p') || txt.includes('s') || txt.includes('x') || txt.includes('Banana') || txt.includes('Veo'));
      });
      if (found) {
        const r = found.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) return found;
      }
    }

    // 2. Búsqueda secundaria en el documento pero estrictamente acotada a la barra inferior
    const bottomCandidates = Array.from(document.querySelectorAll(
      'button.settings-trigger-button, ' +
      'button:has(.settings-summary), ' +
      'button:has([settingstriggercontent])'
    ));
    const validBtn = bottomCandidates.find(b => {
      if (b.closest('flow-prompt-box-settings, .settings-content-overlay, .cdk-overlay-container, #top-layer')) return false;
      const r = b.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.bottom > (window.innerHeight - 250);
    });

    return validBtn || null;
  }

  let isFlowSettingsOpen = false;
  let isClosingFlowSettings = false;
  let lastCloseTimestamp = 0;
  let lastTriggerActionTimestamp = 0;
  let pendingOpenTimer = null;
  let isProgrammaticTriggerClick = false;

  // Supresión global defensiva contra colisiones internas de OverlayRef en Angular CDK
  window.addEventListener('error', (e) => {
    if (e && e.message && e.message.includes('Cannot attach to an overlay')) {
      try {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      } catch (_) {}
      console.warn('[Flow Extension] Supresión defensiva de colisión de overlay en Angular CDK.');
      return true;
    }
  }, true);

  function getActiveFlowSettingsBox() {
    const all = Array.from(document.querySelectorAll('flow-prompt-box-settings, .settings-content-overlay, [class*="settings-content-overlay"]'));
    if (all.length === 0) return null;

    // Buscar de atrás hacia adelante (la más reciente creada por CDK siempre es la última)
    for (let i = all.length - 1; i >= 0; i--) {
      const b = all[i];
      if (!b || !b.isConnected) continue;
      if (b.getAttribute('data-flow-closed') === 'true') continue;
      if (b.style.display === 'none' || b.style.visibility === 'hidden') continue;
      const pane = b.closest('.cdk-overlay-pane');
      if (pane && (pane.getAttribute('data-flow-closed') === 'true' || pane.style.display === 'none' || pane.style.visibility === 'hidden')) continue;
      
      const rect = b.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return b;
      }
    }

    return null;
  }

  function findFlowSettingsBox() {
    if (!isFlowSettingsOpen) return null;
    const box = getActiveFlowSettingsBox();
    if (!box) {
      isFlowSettingsOpen = false;
      return null;
    }
    return box;
  }

  function executeOpenSequence() {
    isFlowSettingsOpen = true;
    lastTriggerActionTimestamp = Date.now();

    // Habilitar la última caja existente si ya está en el DOM
    const allBoxes = Array.from(document.querySelectorAll('flow-prompt-box-settings, .settings-content-overlay, [class*="settings-content-overlay"]'))
      .filter(b => b.isConnected);

    if (allBoxes.length > 0) {
      const newestBox = allBoxes[allBoxes.length - 1];
      newestBox.removeAttribute('data-flow-closed');
      newestBox.style.removeProperty('display');
      const pane = newestBox.closest('.cdk-overlay-pane') || newestBox.parentElement;
      if (pane) {
        pane.removeAttribute('data-flow-closed');
        pane.style.removeProperty('display');
      }
    }

    schedulePositionFlowSettingsOverlay();
    setTimeout(schedulePositionFlowSettingsOverlay, 30);
    setTimeout(schedulePositionFlowSettingsOverlay, 100);
    setTimeout(schedulePositionFlowSettingsOverlay, 250);

    // Auto-selección intuitiva del motor (Veo 3.1 - Ilimitado) solo una vez
    setTimeout(() => {
      if (!userIsTypingInPrompt) autoSelectVeoLiteOnce();
    }, 60);
    setTimeout(() => {
      if (!userIsTypingInPrompt) autoSelectVeoLiteOnce();
    }, 180);
  }

  function triggerSafeOpen() {
    const active = getActiveFlowSettingsBox();
    if (isFlowSettingsOpen && active) return;
    isFlowSettingsOpen = false;

    const trigger = findFlowSettingsTriggerButton();
    if (!trigger) return;

    executeOpenSequence();

    isProgrammaticTriggerClick = true;
    try {
      trigger.click();
    } catch (_) {}
    finally {
      setTimeout(() => { isProgrammaticTriggerClick = false; }, 60);
    }
  }

  // Cierre limpio, compatible con Angular CDK / Popover y con soporte para reapertura infinita
  function closeFlowSettingsOverlay() {
    if (isClosingFlowSettings) return;
    isClosingFlowSettings = true;
    isFlowSettingsOpen = false;
    lastCloseTimestamp = Date.now();
    lastTriggerActionTimestamp = Date.now();

    if (pendingOpenTimer) {
      clearTimeout(pendingOpenTimer);
      pendingOpenTimer = null;
    }

    const activeBox = getActiveFlowSettingsBox();
    if (activeBox) {
      // 1. Notificar a Angular CDK mediante evento Escape focalizado en la caja de ajustes activa
      const escOptions = {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        which: 27,
        bubbles: true,
        cancelable: true,
        view: window
      };
      try { activeBox.dispatchEvent(new KeyboardEvent('keydown', escOptions)); } catch (_) {}
      const pane = activeBox.closest('.cdk-overlay-pane');
      if (pane) {
        try { pane.dispatchEvent(new KeyboardEvent('keydown', escOptions)); } catch (_) {}
      }

      // 2. Si existe un backdrop nativo asociado directamente a este overlay de settings, cerrarlo
      const container = activeBox.closest('.cdk-overlay-container');
      if (container) {
        const paneBox = activeBox.closest('.cdk-overlay-pane, .cdk-overlay-connected-position-bounding-box');
        if (paneBox && paneBox.parentElement) {
          const localBackdrop = paneBox.previousElementSibling;
          if (localBackdrop && localBackdrop.classList && localBackdrop.classList.contains('cdk-overlay-backdrop')) {
            try { localBackdrop.click(); } catch (_) {}
          }
        }
      }
    }

    // 3. Ocultar visualmente de inmediato para respuesta gráfica instantánea sin destruir nodos Angular
    const allBoxes = document.querySelectorAll('flow-prompt-box-settings, .settings-content-overlay, [class*="settings-content-overlay"]');
    allBoxes.forEach(b => {
      try {
        b.setAttribute('data-flow-closed', 'true');
        b.style.setProperty('display', 'none', 'important');
        const pane = b.closest('.cdk-overlay-pane') || b.parentElement;
        if (pane) {
          pane.setAttribute('data-flow-closed', 'true');
          pane.style.setProperty('display', 'none', 'important');
          if (typeof pane.hidePopover === 'function') {
            try { pane.hidePopover(); } catch (_) {}
          }
        }
      } catch (_) {}
    });

    // Neutralizar cualquier backdrop que Angular haya dejado atrás
    clearOrphanCdkBackdrops();
    setTimeout(clearOrphanCdkBackdrops, 200);

    setTimeout(() => {
      isClosingFlowSettings = false;
    }, 150);
  }

  // 🛡️ Un backdrop de Angular CDK huérfano (transparente) tapa toda la página
  // y el usuario no puede hacer clic ni enfocar el prompt. Angular no siempre
  // lo destruye porque la extensión oculta el pane manualmente con display:none.
  function clearOrphanCdkBackdrops() {
    if (!window.location.hostname.includes('flow.google.com') && !window.location.hostname.includes('labs.google')) return;
    try {
      const backdrops = Array.from(document.querySelectorAll('.cdk-overlay-backdrop'));
      if (backdrops.length === 0) return;
      backdrops.forEach(bd => {
        let pane = bd.nextElementSibling;
        while (pane && !(pane.classList && pane.classList.contains('cdk-overlay-pane'))) {
          pane = pane.nextElementSibling;
        }
        const paneVisible = !!(pane && pane.isConnected &&
          pane.style.display !== 'none' &&
          pane.style.visibility !== 'hidden' &&
          !pane.hasAttribute('data-flow-closed') &&
          (pane.offsetWidth > 0 || pane.offsetHeight > 0));
        const isShowing = bd.classList.contains('cdk-overlay-backdrop-showing');
        if (!isShowing || !paneVisible) {
          bd.classList.remove('cdk-overlay-backdrop-showing');
          bd.style.setProperty('pointer-events', 'none', 'important');
          bd.style.setProperty('opacity', '0', 'important');
          bd.style.setProperty('display', 'none', 'important');
        }
      });
    } catch (_) {}
  }

  function positionFlowSettingsOverlay() {
    if (!window.location.hostname.includes('flow.google.com') && !window.location.hostname.includes('labs.google')) return;
    if (!isFlowSettingsOpen) return;

    const allBoxes = Array.from(document.querySelectorAll('flow-prompt-box-settings, .settings-content-overlay, [class*="settings-content-overlay"]'))
      .filter(b => b.isConnected);
    if (allBoxes.length === 0) return;

    // Si existen cajas acumuladas en el DOM por aperturas sucesivas (Angular CDK),
    // ocultar limpiamente las cajas anteriores para que solo la más reciente esté activa
    if (allBoxes.length > 1) {
      for (let i = 0; i < allBoxes.length - 1; i++) {
        const oldBox = allBoxes[i];
        try {
          oldBox.setAttribute('data-flow-closed', 'true');
          oldBox.style.setProperty('display', 'none', 'important');
          const oldPane = oldBox.closest('.cdk-overlay-pane') || oldBox.parentElement;
          if (oldPane) {
            oldPane.setAttribute('data-flow-closed', 'true');
            oldPane.style.setProperty('display', 'none', 'important');
          }
        } catch (_) {}
      }
    }

    // Tomar siempre la caja más reciente (la última en el DOM)
    const box = allBoxes[allBoxes.length - 1];
    if (!box || !box.isConnected) return;

    // Garantizar que la caja activa esté visible
    box.removeAttribute('data-flow-closed');
    box.style.removeProperty('display');
    const activePane = box.closest('.cdk-overlay-pane') || box.parentElement;
    if (activePane) {
      activePane.removeAttribute('data-flow-closed');
      activePane.style.removeProperty('display');
    }

    // Inyectar estilos defensivos de sombra, bordes, transparencias y transición limpia
    if (!document.getElementById('flow-settings-overlay-style')) {
      const style = document.createElement('style');
      style.id = 'flow-settings-overlay-style';
      style.textContent = `
        /* Contenedores CDK Overlay: completamente transparentes para evitar recuadros negros */
        .cdk-overlay-pane:has(flow-prompt-box-settings),
        .cdk-overlay-pane:has(.settings-content-overlay),
        .cdk-overlay-pane:has([class*="settings-content-overlay"]) {
          background: transparent !important;
          background-color: transparent !important;
          box-shadow: none !important;
          border: none !important;
          height: auto !important;
          min-height: 0 !important;
          overflow: visible !important;
        }

        /* La tarjeta real de parámetros con estilo Google Material 3 */
        flow-prompt-box-settings,
        .settings-content-overlay {
          background: #1e1f20 !important;
          background-color: #1e1f20 !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 20px !important;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08) !important;
          overflow: hidden !important;
          pointer-events: auto !important;
        }

        /* Backdrop de CDK: transparente SOLO mientras está realmente visible.
           Un backdrop huérfano con pointer-events:auto queda invisible pero
           bloquea TODA la página (incluido el campo de prompt). */
        .cdk-overlay-backdrop {
          background: transparent !important;
        }
        .cdk-overlay-backdrop.cdk-overlay-backdrop-showing {
          pointer-events: auto !important;
        }
        .cdk-overlay-backdrop:not(.cdk-overlay-backdrop-showing) {
          pointer-events: none !important;
          opacity: 0 !important;
        }

        /* Ocultar y restringir permanentemente los 4 modelos de pago en Google Flow */
        [data-flow-restricted-model="true"],
        flow-menu-item:has([data-flow-restricted-model="true"]),
        flow-menu-item:has([data-original-text*="Omni"]),
        flow-menu-item:has([data-original-text*="Quality"]),
        flow-menu-item:has([data-original-text*="Fast"]),
        .mat-mdc-menu-item[data-flow-restricted-model="true"] {
          display: none !important;
          visibility: hidden !important;
          height: 0px !important;
          min-height: 0px !important;
          max-height: 0px !important;
          padding: 0px !important;
          margin: 0px !important;
          border: none !important;
          overflow: hidden !important;
          pointer-events: none !important;
        }

        /* ============================================================
         * 🔒 MOTOR FIJO: Ocultar ícono desplegable (flecha/chevron)
         *    del botón selector de motores en Google Flow (Modo Video)
         *    El usuario ve el nombre del motor pero NO puede cambiarlo.
         * ============================================================ */
        button.settings-trigger-button mat-icon,
        button.settings-trigger-button .mat-icon,
        button.settings-trigger-button svg,
        button[aria-haspopup="menu"] .model-select-trigger-content mat-icon,
        button[aria-haspopup="menu"] .model-select-trigger-content svg,
        /* FIX: Restringido a settings para no ocultar íconos del campo de prompt */
        flow-prompt-box-settings button[aria-haspopup="listbox"] mat-icon,
        flow-prompt-box-settings button[aria-haspopup="listbox"] svg,
        .settings-content-overlay button[aria-haspopup="listbox"] mat-icon,
        .settings-content-overlay button[aria-haspopup="listbox"] svg,
        button[class*="eaVRLg"] mat-icon,
        button[class*="eaVRLg"] svg,
        button[class*="ldbhld"] mat-icon,
        button[class*="ldbhld"] svg,
        /* Ocultar cualquier ícono de expand/arrow dentro del trigger de modelo */
        .model-select-trigger-content mat-icon,
        .model-select-trigger-content .google-symbols,
        .model-select-trigger-content [class*="google-symbols"],
        [settingstriggercontent] mat-icon,
        [settingstriggercontent] svg {
          display: none !important;
          visibility: hidden !important;
          width: 0px !important;
          height: 0px !important;
          overflow: hidden !important;
        }

        /* Bloquear totalmente el click/interacción del botón trigger de motor */
        /* FIX: Restringido a flow-prompt-box-settings para no afectar botones del prompt */
        button.settings-trigger-button,
        flow-prompt-box-settings button[aria-haspopup="menu"]:not([data-flow-allow-click="true"]),
        flow-prompt-box-settings button[aria-haspopup="listbox"]:not([data-flow-allow-click="true"]),
        .settings-content-overlay button[aria-haspopup="menu"]:not([data-flow-allow-click="true"]),
        .settings-content-overlay button[aria-haspopup="listbox"]:not([data-flow-allow-click="true"]),
        button[class*="eaVRLg"],
        button[class*="ldbhld"] {
          cursor: default !important;
          pointer-events: none !important;
        }

        /* FIX: Garantizar que SOLO el área editable del prompt sea interactiva.
           No usar "flow-prompt-box *": eso reactivaba overlays invisibles
           internos que tapaban el campo de texto. */
        flow-prompt-box,
        flow-prompt-box rich-textarea,
        flow-prompt-box rich-textarea *,
        flow-prompt-box [contenteditable="true"],
        flow-prompt-box [contenteditable="true"] * {
          pointer-events: auto !important;
        }

        /* El botón de ajustes (engranaje/parámetros generales) sí debe ser clickeable */
        button[data-flow-settings-open="true"],
        button.settings-trigger-button[data-flow-settings-open="true"] {
          pointer-events: auto !important;
          cursor: pointer !important;
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    }

    const trigger = findFlowSettingsTriggerButton();
    if (!trigger) {
      box.setAttribute('data-flow-positioned', 'true');
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    if (triggerRect.width === 0 || triggerRect.height === 0 || triggerRect.bottom === 0) {
      box.setAttribute('data-flow-positioned', 'true');
      return;
    }

    // Ancho de la tarjeta
    const boxWidth = box.offsetWidth > 50 ? box.offsetWidth : 296;

    // Distancia vertical: anclar el borde INFERIOR de la tarjeta exactamente 8px ENCIMA del botón del motor
    const bottomOffset = Math.max(8, Math.round(window.innerHeight - triggerRect.top + 8));

    // Posicionamiento horizontal: alineado a la derecha con el botón del motor
    let leftPos = Math.round(triggerRect.right - boxWidth);
    if (leftPos < 12) {
      leftPos = 12;
    }
    if (leftPos + boxWidth > window.innerWidth - 12) {
      leftPos = window.innerWidth - boxWidth - 12;
    }

    // Identificar el pane de CDK o el padre contenedor directo
    const pane = box.closest('.cdk-overlay-pane') || (box.parentElement !== document.body ? box.parentElement : null);
    const targetElement = pane || box;

    // Configurar el contenedor pane para que no cree artefactos ni fondos negros y asegurar visibilidad
    if (pane) {
      pane.style.removeProperty('display');
      pane.style.setProperty('background', 'transparent', 'important');
      pane.style.setProperty('background-color', 'transparent', 'important');
      pane.style.setProperty('box-shadow', 'none', 'important');
      pane.style.setProperty('border', 'none', 'important');
      pane.style.setProperty('height', 'auto', 'important');
      pane.style.setProperty('min-height', '0px', 'important');
      pane.style.setProperty('overflow', 'visible', 'important');
      pane.style.setProperty('padding', '0px', 'important');
    }

    box.style.removeProperty('display');

    // Aplicar anclaje fijo SOLO de posición
    targetElement.style.setProperty('position', 'fixed', 'important');
    targetElement.style.setProperty('bottom', `${bottomOffset}px`, 'important');
    targetElement.style.setProperty('left', `${leftPos}px`, 'important');
    targetElement.style.setProperty('top', 'auto', 'important');
    targetElement.style.setProperty('right', 'auto', 'important');
    targetElement.style.setProperty('transform', 'none', 'important');
    targetElement.style.setProperty('margin', '0', 'important');
    targetElement.style.setProperty('z-index', '99999999', 'important');

    if (pane && box !== pane) {
      box.style.setProperty('position', 'relative', 'important');
      box.style.setProperty('top', 'auto', 'important');
      box.style.setProperty('left', 'auto', 'important');
      box.style.setProperty('bottom', 'auto', 'important');
      box.style.setProperty('right', 'auto', 'important');
      box.style.setProperty('transform', 'none', 'important');
      box.style.setProperty('margin', '0', 'important');
      box.style.setProperty('pointer-events', 'auto', 'important');
      box.style.setProperty('background', '#1e1f20', 'important');
      box.style.border = '1px solid rgba(255, 255, 255, 0.1)';
      box.style.setProperty('border-radius', '20px', 'important');
      box.style.setProperty('overflow', 'hidden', 'important');
    } else {
      box.style.setProperty('pointer-events', 'auto', 'important');
    }

    box.setAttribute('data-flow-positioned', 'true');
  }

  // Listeners reactivos pasivos para posicionamiento
  window.addEventListener('resize', () => {
    if (isFlowSettingsOpen) positionFlowSettingsOverlay();
  }, { passive: true });
  window.addEventListener('scroll', () => {
    if (isFlowSettingsOpen) positionFlowSettingsOverlay();
  }, { passive: true });

  // 🔒 MOTOR FIJO: Bloqueo total del click en el botón selector de motor.
  // El selector queda bloqueado — el usuario VE el nombre pero NO puede cambiarlo.
  let wasBoxOpenOnPointerDown = false;

  document.addEventListener('pointerdown', (e) => {
    if (isProgrammaticTriggerClick) return;
    const trigger = findFlowSettingsTriggerButton();
    if (trigger && (trigger === e.target || trigger.contains(e.target))) {
      // 🔒 SIEMPRE bloquear la interacción con el selector de motor
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return;
    }
  }, true);

  document.addEventListener('click', (e) => {
    if (isProgrammaticTriggerClick) return;
    const trigger = findFlowSettingsTriggerButton();
    if (trigger && (trigger === e.target || trigger.contains(e.target))) {
      // 🔒 SIEMPRE bloquear la apertura del menú de selección de motor
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return;
    }
  }, true);

  // Cerrar suavemente al hacer clic afuera de la caja (NO bloqueante, seguro para Chrome)
  document.addEventListener('pointerdown', (e) => {
    if (isClosingFlowSettings || !isFlowSettingsOpen || isAutoSelectingModel) return;

    const target = e.target;
    if (!target) return;

    // 1. Si la caja no está genuinamente abierta y visible, resetear estado y no hacer nada
    const box = getActiveFlowSettingsBox();
    if (!box) {
      isFlowSettingsOpen = false;
      return;
    }

    // 2. Si el clic fue dentro de la caja de ajustes activa, permitir interacción normal
    if (box === target || box.contains(target)) return;

    // 3. Si el clic fue en el botón del motor, ya lo gestiona el interceptor de toggle del motor
    const trigger = findFlowSettingsTriggerButton();
    if (trigger && (trigger === target || trigger.contains(target))) {
      return;
    }

    // 4. Si el clic fue dentro de cualquier menú desplegable, diálogo, popup CDK, línea de tiempo o controles de clip, permitirlo
    if (target.closest && target.closest(
      '.mat-mdc-select-panel, .mat-mdc-menu-panel, ' +
      '[role="listbox"], [role="menu"], [role="dialog"], [role="option"], mat-option, ' +
      '[data-radix-popper-content-wrapper], [data-radix-menu-content], ' +
      'flow-timeline, [class*="timeline"], [class*="track"], ' +
      '[aria-label*="clip" i], [aria-label*="Add clip" i], button:has(svg), ' +
      '.cdk-overlay-container, .cdk-overlay-pane, .cdk-overlay-backdrop, ' +
      '[class*="clip"], button, [role="button"], svg, path'
    )) {
      return;
    }

    // 5. Clic fuera de la caja -> Cerrar y limpiar
    closeFlowSettingsOverlay();
  }, false);

  // Cerrar si se pulsa la tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isFlowSettingsOpen) {
      closeFlowSettingsOverlay();
    }
  }, { passive: true });

  let positionOverlayRaf = null;
  function schedulePositionFlowSettingsOverlay() {
    if (positionOverlayRaf) return;
    positionOverlayRaf = requestAnimationFrame(() => {
      positionOverlayRaf = null;
      if (isFlowSettingsOpen) {
        positionFlowSettingsOverlay();
      }
    });
  }

  // Reposicionar de inmediato al interactuar dentro de la caja (ej. cambiar entre Imagen y Video)
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (target && target.closest && target.closest('flow-prompt-box-settings, .settings-content-overlay')) {
      schedulePositionFlowSettingsOverlay();
    }
  }, { passive: true });

  try {
    const flowBoxObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === 1) {
            if (node.hasAttribute && (
              node.hasAttribute('flow-sidenav-bottom') ||
              node.tagName === 'FLOW-PROJECT-CARD' ||
              node.tagName === 'FLOW-AGENT-MODE-TOGGLE-CHIP' ||
              (node.querySelector && node.querySelector('[flow-sidenav-bottom], a[mat-list-item], flow-project-card, .project-card-footer, button[aria-label*="borrar" i], flow-agent-mode-toggle-chip, .agent-mode-chip'))
            )) {
              hideUnwantedElements();
              enforceFlowAgentModeDisabled();
            }
            const hasSettingsBox = node.tagName === 'FLOW-PROMPT-BOX-SETTINGS' || 
                (node.matches && node.matches('flow-prompt-box-settings, .settings-content-overlay')) ||
                (node.querySelector && node.querySelector('flow-prompt-box-settings, .settings-content-overlay'));
            if (hasSettingsBox) {
              const box = (node.tagName === 'FLOW-PROMPT-BOX-SETTINGS' || (node.matches && node.matches('flow-prompt-box-settings, .settings-content-overlay'))) ? node : node.querySelector('flow-prompt-box-settings, .settings-content-overlay');
              if (box) {
                isFlowSettingsOpen = true;
                box.removeAttribute('data-flow-closed');
                box.style.removeProperty('display');
                const pane = box.closest('.cdk-overlay-pane') || box.parentElement;
                if (pane) {
                  pane.removeAttribute('data-flow-closed');
                  pane.style.removeProperty('display');
                }
              }
              schedulePositionFlowSettingsOverlay();
              setTimeout(() => {
                if (!userIsTypingInPrompt) autoSelectVeoLiteOnce(box);
              }, 50);
              return;
            }
          }
        }
        for (const node of m.removedNodes) {
          if (node.nodeType === 1) {
            const wasSettingsBox = node.tagName === 'FLOW-PROMPT-BOX-SETTINGS' || 
                (node.matches && node.matches('flow-prompt-box-settings, .settings-content-overlay, .cdk-overlay-pane, .cdk-overlay-container')) ||
                (node.querySelector && node.querySelector('flow-prompt-box-settings, .settings-content-overlay'));
            if (wasSettingsBox) {
              const active = getActiveFlowSettingsBox();
              if (!active) {
                isFlowSettingsOpen = false;
                lastCloseTimestamp = Date.now();
              }
            }
          }
        }
      }
    });
    flowBoxObserver.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  } catch (_) {}

  // ══════════════════════════════════════════════════════════════════
  // OBSERVADOR DEDICADO PARA GEMINI: elimina botones no deseados
  // en cuanto el sidebar / DOM cargue o cambie dinámicamente
  // ══════════════════════════════════════════════════════════════════
  if ((window.location.hostname || '').includes('gemini.google.com')) {
    // Función de limpieza rápida y agresiva solo para Gemini
    function purgeGeminiUnwantedButtons() {
      // ── 1. "Obtener app" / "Get the app" / "Download app" ──────────
      const APP_HREFS = [
        'itunes.apple.com',
        'play.google.com/store/apps/details?id=com.google.android.apps.bard',
        'gemini.google.com/faq#get-the-app',
        'app.link',
        'onelink.me',
      ];
      const APP_TEST_IDS = [
        'download-app-button', 'download-app', 'get-app-button', 'get-app',
        'get-the-app-button', 'get-the-app',
      ];
      const APP_ARIA = ['descargar app', 'download app', 'get the app', 'get app',
                        'obtener app', 'obtener la app', 'install app'];

      // Por href
      APP_HREFS.forEach(fragment => {
        document.querySelectorAll(`a[href*="${fragment}"]`).forEach(el => _hideGeminiEl(el));
      });
      // Por data-test-id
      APP_TEST_IDS.forEach(id => {
        document.querySelectorAll(`[data-test-id="${id}"]`).forEach(el => _hideGeminiEl(el));
      });
      // Por aria-label
      APP_ARIA.forEach(label => {
        document.querySelectorAll(`[aria-label*="${label}" i]`).forEach(el => _hideGeminiEl(el));
      });
      // Por texto visible exacto
      ['descargar app','download app','get the app','get app','obtener app','obtener la app'].forEach(txt => {
        document.querySelectorAll('a, button, side-navigation-item, ms-side-nav-item').forEach(el => {
          if ((el.textContent || '').trim().toLowerCase() === txt) _hideGeminiEl(el);
        });
      });

      // ── 2. "Chat temporal" / "Temporary chat" ──────────────────────
      const TEMP_TEST_IDS = ['temporary-chat-button','temp-chat-button','temporary-chat','temp-chat'];
      const TEMP_ARIA = ['chat temporal','temporary chat','temp chat'];

      TEMP_TEST_IDS.forEach(id => {
        document.querySelectorAll(`[data-test-id="${id}"]`).forEach(el => _hideGeminiEl(el));
      });
      TEMP_ARIA.forEach(label => {
        document.querySelectorAll(`[aria-label*="${label}" i]`).forEach(el => {
          _hideGeminiEl(el);
          if (!el.dataset.flowTempBlocked) {
            el.dataset.flowTempBlocked = 'true';
            el.addEventListener('click', e => { e.preventDefault(); e.stopImmediatePropagation(); }, true);
          }
        });
      });
    }

    function _hideGeminiEl(el) {
      if (!el) return;
      // Buscar contenedor padre en el sidebar
      const target = el.closest(
        'side-navigation-item, ms-side-nav-item, li[role="listitem"], div[role="listitem"], [class*="nav-item"]'
      ) || el;
      if (target.dataset.flowHidden === 'true') return; // ya oculto
      target.dataset.flowHidden = 'true';
      target.style.setProperty('display', 'none', 'important');
      target.style.setProperty('visibility', 'hidden', 'important');
      target.style.setProperty('height', '0px', 'important');
      target.style.setProperty('min-height', '0px', 'important');
      target.style.setProperty('overflow', 'hidden', 'important');
      target.style.setProperty('pointer-events', 'none', 'important');
    }

    // Correr inmediatamente y cada vez que el DOM cambie
    let _geminiPurgeTimer = null;
    const geminiObserver = new MutationObserver(() => {
      if (_geminiPurgeTimer) return;
      _geminiPurgeTimer = setTimeout(() => {
        _geminiPurgeTimer = null;
        try { purgeGeminiUnwantedButtons(); } catch(e) {}
      }, 150); // 150ms debounce — rápido sin spamear
    });

    const _startGeminiObserver = () => {
      try {
        purgeGeminiUnwantedButtons(); // primera pasada inmediata
        geminiObserver.observe(document.documentElement, { childList: true, subtree: true });
      } catch(e) {}
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _startGeminiObserver);
    } else {
      _startGeminiObserver();
    }
    // Segunda pasada tardía para elementos que cargan después del hydration de React/Angular
    setTimeout(() => { try { purgeGeminiUnwantedButtons(); } catch(e) {} }, 1500);
    setTimeout(() => { try { purgeGeminiUnwantedButtons(); } catch(e) {} }, 4000);
  }
  // ══════════════════════════════════════════════════════════════════

  // Bloqueo defensivo en fase de captura de clics dirigidos a la Papelera o Borrar Proyecto
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!target) return;
    const host = window.location.hostname;
    if (!host.includes('flow.google.com') && !host.includes('labs.google')) return;

    // FIX: Nunca interceptar clics dentro del campo de texto del prompt (modo Video o Imagen)
    if (target.closest && target.closest(
      'flow-prompt-box, [class*="prompt-box"], [class*="promptBox"], rich-textarea, [contenteditable="true"]'
    )) return;

    // 1. Bloqueo de Papelera
    const trashEl = target.closest && target.closest(
      '[data-flow-trash-item="true"], [flow-sidenav-bottom] a, a[href*="trash" i], a[href*="papelera" i], a[href*="bin" i]'
    );
    if (trashEl) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }

    const item = target.closest && target.closest('a[mat-list-item], [mat-list-item], mat-list-item, [role="menuitem"]');
    if (item) {
      const txt = (item.textContent || '').trim().toLowerCase();
      const icon = item.querySelector('mat-icon, i, svg');
      const iconTxt = icon ? (icon.getAttribute('fonticonname') || icon.textContent || '').trim().toLowerCase() : '';
      if ((txt === 'papelera' || txt.includes('papelera') || txt === 'trash' || txt.includes('trash') || iconTxt === 'delete') && !txt.includes('contraer') && !txt.includes('expandir')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        item.style.setProperty('display', 'none', 'important');
        return false;
      }
    }

    // 2. Bloqueo de botón "Borrar proyecto" en tarjetas de proyectos de Google Flow
    const deleteProjectBtn = target.closest && target.closest(
      '[data-flow-delete-project-btn="true"], button[aria-label*="borrar proyecto" i], button[aria-label*="delete project" i]'
    );
    if (deleteProjectBtn) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      deleteProjectBtn.style.setProperty('display', 'none', 'important');
      return false;
    }

    const footerBtn = target.closest && target.closest('.project-card-footer button, flow-project-card button');
    if (footerBtn) {
      const aria = (footerBtn.getAttribute('aria-label') || '').toLowerCase();
      const icon = footerBtn.querySelector('mat-icon, i, svg');
      const iconTxt = icon ? (icon.textContent || '').trim().toLowerCase() : '';
      if ((aria.includes('borrar') || aria.includes('delete') || iconTxt === 'delete') && !aria.includes('edit') && !aria.includes('renombrar') && iconTxt !== 'edit') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        footerBtn.style.setProperty('display', 'none', 'important');
        return false;
      }
    }

    // 3. Bloqueo de selección de los 4 modelos de pago en Google Flow
    const restrictedModelItem = target.closest && target.closest('[data-flow-restricted-model="true"]');
    if (restrictedModelItem) {
      const itemTxt = (restrictedModelItem.textContent || '').toLowerCase();
      const isTimeline = itemTxt.includes('clip') || itemTxt.includes('extender') || itemTxt.includes('extend') || 
                         itemTxt.includes('agregar') || itemTxt.includes('add') ||
                         restrictedModelItem.closest('flow-timeline, [class*="timeline"], [class*="track"], [class*="clip"]');
      if (isTimeline) {
        restrictedModelItem.removeAttribute('data-flow-restricted-model');
        return true;
      }
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }
  }, true);

  // DETECTAR SI EL USUARIO ESTÁ EN LA PESTAÑA "VIDEO" O EN "IMAGEN"
  function isVideoModeActive() {
    if (!window.location.hostname.includes('labs.google') && !window.location.hostname.includes('flow.google.com')) return false;

    try {
      // Detección directa en Angular Material de flow.google.com (.settings-summary)
      const summaryEl = document.querySelector('.settings-summary, [settingstriggercontent]');
      if (summaryEl) {
        const sumTxt = (summaryEl.textContent || '').toLowerCase();
        if (sumTxt.includes('video')) return true;
        if (sumTxt.includes('imagen') || sumTxt.includes('image')) return false;
      }

      const allButtons = Array.from(document.querySelectorAll('button, div[role="radio"], div[role="tab"], .mat-button-toggle'));

      const videoBtn = allButtons.find(b => (b.textContent || '').trim() === 'Video');
      const imageBtn = allButtons.find(b => (b.textContent || '').trim() === 'Imagen' || (b.textContent || '').trim() === 'Image');

      if (imageBtn && videoBtn) {
        const imgBg = window.getComputedStyle(imageBtn).backgroundColor || '';
        const vidBg = window.getComputedStyle(videoBtn).backgroundColor || '';

        const isImgActive = imgBg.includes('255, 255, 255') || imgBg.includes('rgb(255, 255, 255)') || imageBtn.getAttribute('aria-pressed') === 'true' || imageBtn.getAttribute('data-state') === 'on' || imageBtn.getAttribute('aria-checked') === 'true' || imageBtn.classList.contains('mat-button-toggle-checked');
        const isVidActive = vidBg.includes('255, 255, 255') || vidBg.includes('rgb(255, 255, 255)') || videoBtn.getAttribute('aria-pressed') === 'true' || videoBtn.getAttribute('data-state') === 'on' || videoBtn.getAttribute('aria-checked') === 'true' || videoBtn.classList.contains('mat-button-toggle-checked');

        if (isImgActive && !isVidActive) return false;
        if (isVidActive && !isImgActive) return true;
      }

      // Duraciones (exclusivas de video en Google Flow: 4s, 6s, 8s, 10s)
      const hasDuration = allButtons.some(b => {
        const txt = (b.textContent || '').trim();
        return txt === '4s' || txt === '4 s' || txt === '6s' || txt === '6 s' || txt === '8s' || txt === '8 s' || txt === '10s' || txt === '10 s';
      });
      if (hasDuration) return true;

      // Aspectos de imagen exclusivos (4:3, 1:1, 3:4)
      const hasImageExclusiveAspects = allButtons.some(b => {
        const txt = (b.textContent || '').trim();
        return txt === '4:3' || txt === '3:4' || txt === '1:1';
      });
      if (hasImageExclusiveAspects && !hasDuration) return false;

    } catch (e) {}

    return true;
  }

  function simulateFullClick(target) {
    if (!target) return;
    const btn = target.querySelector('button') || target;
    try {
      btn.click();
    } catch (_) {
      try {
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      } catch (__) {}
    }
  }

  function findFlowModelTriggerButtons() {
    return Array.from(document.querySelectorAll('button[aria-haspopup="menu"], button[aria-haspopup="listbox"], mat-select, [role="combobox"], button[class*="eaVRLg"], button[class*="ldbhld"]')).filter(btn => {
      if (btn.closest('header') || btn.closest('nav')) return false;
      const rect = btn.getBoundingClientRect();
      return rect.top > 60;
    });
  }

  // APLICACIÓN DEL MOTOR SELECCIONADO (ÚNICAMENTE EN MODO VIDEO) Y MENSAJES DE CRÉDITO ILIMITADOS
  function applyModelNameToTrigger(nameToApply) {
    if (!window.location.hostname.includes('labs.google') && !window.location.hostname.includes('flow.google.com')) return;
    // FIX: No modificar el DOM del botón mientras el usuario está escribiendo (evita que Angular mueva el foco)
    if (userIsTypingInPrompt) return;

    const inVideoMode = isVideoModeActive();
    if (!inVideoMode) return;

    const targetName = nameToApply || selectedCustomModelName || sessionStorage.getItem('flow_selected_model_name') || "Veo 3.1 - Ilimitado";

    try {
      // 1. Modificar el botón selector del panel ÚNICAMENTE SI ESTAMOS EN MODO VIDEO (Imagen 1)
      const triggerButtons = findFlowModelTriggerButtons();
      triggerButtons.forEach(btn => {
        const btnTxt = (btn.textContent || '').trim();
        // Si el botón es de modelos de Imagen (Nano Banana, Imagen 3, etc.), NUNCA TOCARLO
        if (btnTxt.includes('Banana') || btnTxt.includes('Nano') || btnTxt.includes('Imagen')) {
          return;
        }

        // Búsqueda específica en .model-select-trigger-content (Imagen 1)
        const triggerContent = btn.querySelector('.model-select-trigger-content, [class*="model-select-trigger-content"]');
        if (triggerContent) {
          for (let child of Array.from(triggerContent.childNodes)) {
            if (child.nodeType === Node.TEXT_NODE) {
              const val = (child.nodeValue || '').trim();
              if (val && (val.includes('Veo') || val.includes('Omni') || val.includes('Lite') || val.includes('Lower Priority') || val.includes('Ilimitado'))) {
                if (!child.nodeValue.includes(targetName)) {
                  child.nodeValue = ` ${targetName} `;
                }
              }
            }
          }
        }

        // Buscar el elemento específico de texto que contiene el nombre del modelo
        // Excluir iconos, relaciones de aspecto (16:9, 9:16, 1:1, etc.) y duraciones (4s, 6s, 8s)
        const textElements = Array.from(btn.querySelectorAll('div, span')).filter(el => {
          if (el.children.length > 0) return false;
          const t = (el.textContent || '').trim();
          if (!t) return false;
          if (t === '16:9' || t === '9:16' || t === '4:3' || t === '3:4' || t === '1:1' || t === '4s' || t === '6s' || t === '8s' || t === '10s' || t === 'x1' || t === 'x2' || t === 'x3' || t === 'x4') return false;
          if (el.closest('svg, i, mat-icon, [class*="google-symbols"]')) return false;
          return t.includes('Veo') || t.includes('Omni') || t.includes('Fast') || t.includes('Quality') || t.includes('Lite') || t.includes('Ilimitado') || t.includes('Lower Priority');
        });

        if (textElements.length > 0) {
          const modelLabel = textElements[0];
          if (modelLabel.textContent !== targetName) {
            modelLabel.textContent = targetName;
          }
        } else {
          // Si solo hay nodos de texto directos en el botón
          for (let child of Array.from(btn.childNodes)) {
            if (child.nodeType === Node.TEXT_NODE) {
              const val = (child.nodeValue || '').trim();
              if (val && (val.includes('Veo') || val.includes('Omni') || val.includes('Fast') || val.includes('Quality') || val.includes('Lite') || val.includes('Ilimitado') || val.includes('Lower Priority'))) {
                if (child.nodeValue !== targetName) {
                  child.nodeValue = targetName;
                }
                break;
              }
            }
          }
        }
      });

      // 2. Modificar el contenedor de créditos de la tarjeta de generación para "Se usaran creditos ilimitados"
      const creditContainers = document.querySelectorAll('div[class*="dXVSmj"], div:has(> a[href*="googleone?p=g1_ai_credit_menu"])');
      creditContainers.forEach(container => {
        for (let child of Array.from(container.childNodes)) {
          if (child.nodeType === Node.TEXT_NODE) {
            const val = child.nodeValue;
            if (val.includes('generación usará') || val.includes('generation will use') || val.includes('usará') || val.includes('generación')) {
              child.nodeValue = "Se usaran ";
            }
          }
        }
        const link = container.querySelector('a');
        if (link && link.textContent !== 'creditos ilimitados') {
          link.textContent = 'creditos ilimitados';
        }
      });

      // 3. Respaldo para cualquier enlace directo a soporte de créditos
      const creditLinks = document.querySelectorAll('a[href*="googleone?p=g1_ai_credit_menu"], a[class*="gUrXAv"]');
      creditLinks.forEach(link => {
        if (link.textContent !== 'creditos ilimitados') {
          link.textContent = 'creditos ilimitados';
        }
        if (link.parentElement) {
          for (let child of Array.from(link.parentElement.childNodes)) {
            if (child.nodeType === Node.TEXT_NODE && (child.nodeValue.includes('generación') || child.nodeValue.includes('usará'))) {
              child.nodeValue = "Se usaran ";
            }
          }
        }
      });

      // 4. MODAL DE CUENTA Y ADVERTENCIAS: "Créditos ilimitados de Google Flow"
      const modalCreditLinks = document.querySelectorAll('a[href*="one.google.com/ai/activity"], a[href*="one.google.com/ai/credits"], a[class*="bgEUCQ"], [class*="glWgcL"] a, div[class*="iqEbGw"] a');
      modalCreditLinks.forEach(link => {
        if (link.textContent && link.textContent.trim() !== 'Créditos ilimitados de Google Flow') {
          link.textContent = 'Créditos ilimitados de Google Flow';
        }
      });

      const allTextCandidates = document.querySelectorAll('.settings-credit-cost, [class*="credit"], [class*="Credit"], [class*="puntos"], [class*="points"], a[href*="credits"], a[href*="activity"]');
      allTextCandidates.forEach(el => {
        const txt = (el.textContent || '').trim();
        if (/\b\d*\s*Créditos de Google Flow\b/i.test(txt) && txt !== 'Créditos ilimitados de Google Flow') {
          el.textContent = 'Créditos ilimitados de Google Flow';
        }
      });
    } catch (e) {}
  }

  // AUTO-SELECCIÓN OBLIGATORIA DEL MOTOR ILIMITADO (VEO 3.1 - ILIMITADO / LOWER PRIORITY)
  // Secuencia automatizada: 1ra Imagen -> 2da Imagen -> 4ta Imagen -> 5ta Imagen (previene 3ra Imagen)
  let isAutoConfiguringEngine = false;
  let isAutoSelectingModel = false;
  const configuredProjectsInSession = new Set();
  const autoSelectedProjects = new Set();
  const processedProjects = new Set();

  // FIX: Detectar si el usuario está escribiendo activamente en el prompt
  // para NO robarle el foco con operaciones automáticas de selección de motor
  let userIsTypingInPrompt = false;
  let _userTypingTimeout = null;

  function isUserActivelyTyping() {
    const active = document.activeElement;
    if (!active) return false;
    return !!(
      active.tagName === 'TEXTAREA' ||
      active.getAttribute('contenteditable') === 'true' ||
      active.closest('rich-textarea, flow-prompt-box, [class*="prompt-box"], [class*="promptBox"]')
    );
  }

  // keydown: extiende el guard 4 segundos desde la última tecla
  document.addEventListener('keydown', () => {
    if (isUserActivelyTyping()) {
      userIsTypingInPrompt = true;
      clearTimeout(_userTypingTimeout);
      _userTypingTimeout = setTimeout(() => { userIsTypingInPrompt = false; }, 4000);
    }
  }, true);

  // input: también cubre pegar con ratón / autocompletar
  document.addEventListener('input', () => {
    if (isUserActivelyTyping()) {
      userIsTypingInPrompt = true;
      clearTimeout(_userTypingTimeout);
      _userTypingTimeout = setTimeout(() => { userIsTypingInPrompt = false; }, 4000);
    }
  }, true);

  // focusin: activa el guard en cuanto el prompt recibe el foco
  document.addEventListener('focusin', () => {
    if (isUserActivelyTyping()) userIsTypingInPrompt = true;
  }, true);

  // focusout: desactiva el guard 1 segundo después de perder el foco
  document.addEventListener('focusout', () => {
    clearTimeout(_userTypingTimeout);
    _userTypingTimeout = setTimeout(() => { userIsTypingInPrompt = false; }, 1000);
  }, true);

  let lastCheckedUrl = '';

  function getFlowProjectIdFromUrl() {
    try {
      const match = window.location.pathname.match(/\/project\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : null;
    } catch (_) {
      return null;
    }
  }

  function findModelDropdownInSettings(settingsBox) {
    if (!settingsBox) return null;

    // 1. Selector directo por aria o clase Angular Material
    const directBtn = settingsBox.querySelector(
      'button.mat-mdc-menu-trigger, ' +
      'button[aria-haspopup="menu"], ' +
      'button[aria-label*="familia de modelos" i], ' +
      'button[aria-label*="modelo" i], ' +
      'button[aria-label*="model" i], ' +
      'button[flow-button][aria-haspopup="menu"], ' +
      'button:has(.model-select-trigger-content)'
    );
    if (directBtn) return directBtn;

    // 2. Búsqueda por texto dentro de los botones de la tarjeta
    const allBtns = Array.from(settingsBox.querySelectorAll('button'));
    const textMatch = allBtns.find(b => {
      const txt = (b.textContent || '').trim();
      if (txt.includes('360p') || txt.includes('720p') || txt.includes('1080p') || 
          txt.includes('16:9') || txt.includes('9:16') || txt.includes('Fotogramas') || txt.includes('Ingredientes')) {
        return false;
      }
      return txt.includes('Veo') || txt.includes('Omni') || txt.includes('Lite') || txt.includes('Ilimitado') || txt.includes('Priority');
    });

    return textMatch || null;
  }

  // 🎬 PASO 2 (Imagen 2): Detectar y cambiar obligatoriamente al toggle [ Video ] si está en [ Imagen ]
  function ensureVideoModeSelected(settingsBox) {
    const scope = settingsBox || document;
    
    // Buscar todos los botones o toggles con texto "Video"
    const candidates = Array.from(scope.querySelectorAll(
      'mat-button-toggle, .mat-button-toggle, button.mat-button-toggle-button, button[role="radio"], button'
    ));

    const videoElement = candidates.find(el => {
      if (el.closest('.settings-summary, flow-prompt-box')) return false;
      const txt = (el.textContent || '').trim();
      return txt === 'Video' || txt.startsWith('Video') || (txt.includes('Video') && !txt.includes('·') && !txt.includes('720p'));
    });

    if (!videoElement) return false;

    const toggle = videoElement.closest('mat-button-toggle') || videoElement;
    const btn = videoElement.tagName === 'BUTTON' ? videoElement : (videoElement.querySelector('button') || videoElement);

    const isChecked = toggle.classList.contains('mat-button-toggle-checked') ||
                      btn.getAttribute('aria-checked') === 'true' ||
                      btn.getAttribute('aria-pressed') === 'true';

    if (isChecked) {
      console.log('[Flow Engine] ✅ Modo Video ya se encuentra activo.');
      return true;
    }

    console.log('[Flow Engine] 🎬 Haciendo clic en toggle [ Video ] (Paso 2 / Imagen 2)...');
    try {
      btn.focus();
      btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, view: window }));
      btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
      btn.click();
      btn.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, view: window }));
      btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    } catch (_) {}

    return true;
  }

  function clickElementFirmly(el) {
    if (!el) return;
    const btn = el.tagName === 'BUTTON' ? el : (el.querySelector('button') || el);
    try { btn.focus(); } catch (_) {}
    try { btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, view: window })); } catch (_) {}
    try { btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window })); } catch (_) {}
    try { btn.click(); } catch (_) {}
    try { btn.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true, view: window })); } catch (_) {}
    try { btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window })); } catch (_) {}
    try { btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window })); } catch (_) {}
  }

  // 🚀 SECUENCIA AUTOMATIZADA PRINCIPAL (1ra Imagen -> 2da Imagen -> 3ra Imagen y Cierre Completo)
  // Se ejecuta exactamente UNA VEZ por proyecto
  function triggerAutoSelectEngineSequence() {
    if (!window.location.hostname.includes('labs.google') && !window.location.hostname.includes('flow.google.com')) return;
    if (isAutoConfiguringEngine) return;
    // FIX: No interrumpir al usuario mientras escribe en el campo de prompt
    if (userIsTypingInPrompt) return;

    // Solo operar dentro de proyectos de Google Flow (/project/<id>)
    const projectId = getFlowProjectIdFromUrl();
    if (!projectId) return;

    // FIX: Ya NO bloqueamos por "solo una vez". En cambio, verificamos si
    // la caja de ajustes ya tiene el motor Lower Priority activo visualmente.
    // Si lo tiene, no hacemos nada. Si NO lo tiene (o la caja está cerrada),
    // ejecutamos la secuencia para asegurar el motor correcto.
    const settingsBoxOpen = getActiveFlowSettingsBox();
    if (settingsBoxOpen) {
      // La caja está abierta: revisar si el motor Lower Priority ya está marcado
      const allItems = Array.from(document.querySelectorAll(
        '.mat-mdc-menu-panel [role="menuitem"], .cdk-overlay-pane [role="menuitem"], [role="menu"] [role="menuitem"], .mat-mdc-menu-item'
      )).filter(el => !el.closest('header') && !el.closest('nav'));
      const alreadySelected = allItems.some(item => {
        const txt = (item.dataset.originalText || item.textContent || '').trim();
        return (txt.includes('Lower Priority') || txt.includes('Ilimitado')) &&
               (item.getAttribute('aria-checked') === 'true' || item.classList.contains('mat-mdc-menu-item-highlighted'));
      });
      if (alreadySelected) return; // Motor correcto ya activo, nada que hacer
    }

    // PASO 1 (1ra Imagen): Localizar el botón disparador de ajustes en la barra de prompts
    const triggerBtn = findFlowSettingsTriggerButton();
    if (!triggerBtn) return;

    isAutoConfiguringEngine = true;
    console.log('[Flow Engine] 🚀 Iniciando secuencia automatizada para proyecto:', projectId);

    // PASO 1 -> 2: Abrir la tarjeta de ajustes
    let settingsBox = getActiveFlowSettingsBox();
    if (!settingsBox) {
      // FIX: Solo abrir la tarjeta si el usuario NO tiene el prompt enfocado
      if (!isUserActivelyTyping()) {
        try {
          clickElementFirmly(triggerBtn);
        } catch (_) {}
      } else {
        // Si está escribiendo, cancelar y dejar para el próximo ciclo
        isAutoConfiguringEngine = false;
        return;
      }
    }

    let attempts = 0;
    const maxAttempts = 18;

    const proceedWithSettingsOpen = () => {
      attempts++;
      // FIX: Abortar si el usuario tomó el foco mientras esperábamos
      if (isUserActivelyTyping()) {
        isAutoConfiguringEngine = false;
        return;
      }
      settingsBox = getActiveFlowSettingsBox();

      if (!settingsBox && attempts < maxAttempts) {
        setTimeout(proceedWithSettingsOpen, 80);
        return;
      }

      if (!settingsBox) {
        console.warn('[Flow Engine] No se pudo abrir la caja de parámetros.');
        isAutoConfiguringEngine = false;
        return;
      }

      // PASO 2 (2da Imagen): Asegurar que se haga clic en el toggle [ Video ]
      ensureVideoModeSelected(settingsBox);

      // Esperar 250ms para que Angular actualice los controles internos de Video
      setTimeout(() => {
        // PASO 3 (3ra Imagen): Localizar el botón de motor de Video y abrir su menú
        const modelBtn = findModelDropdownInSettings(settingsBox);
        if (!modelBtn) {
          console.warn('[Flow Engine] No se encontró el botón selector de modelos en la tarjeta.');
          finishAndClose();
          return;
        }

        // Abrir el menú de modelos si no está abierto
        if (modelBtn.getAttribute('aria-expanded') !== 'true') {
          clickElementFirmly(modelBtn);
        }

        let menuAttempts = 0;
        const maxMenuAttempts = 18;

        const proceedWithMenuOpen = () => {
          menuAttempts++;
          const allItems = Array.from(document.querySelectorAll(
            '.mat-mdc-menu-panel [role="menuitem"], ' +
            '.cdk-overlay-pane [role="menuitem"], ' +
            '.cdk-overlay-popover [role="menuitem"], ' +
            '[role="menu"] [role="menuitem"], ' +
            'flow-menu-item button, ' +
            '.mat-mdc-menu-item, ' +
            'mat-option, [role="option"]'
          )).filter(el => !el.closest('header') && !el.closest('nav'));

          if (allItems.length === 0 && menuAttempts < maxMenuAttempts) {
            setTimeout(proceedWithMenuOpen, 80);
            return;
          }

          if (allItems.length > 0) {
            // Localizar el motor Veo 3.1 - Ilimitado / Lower Priority (3ra Imagen)
            let targetItem = allItems.find(item => {
              const rawAttr = item.getAttribute('text') || '';
              const txt = (item.dataset.originalText || item.textContent || '').trim();
              return rawAttr.includes('Lower Priority') || rawAttr.includes('Lite') ||
                     txt.includes('Lower Priority') || txt.includes('[Lower Priority]') || 
                     txt.includes('Ilimitado');
            });

            // En Google Flow, el 4to motor (índice 3) es exactamente el de 0 créditos (Lower Priority)
            if (!targetItem && allItems.length >= 4) {
              targetItem = allItems[3];
            }

            if (!targetItem) {
              targetItem = allItems.find(item => {
                const txt = (item.dataset.originalText || item.textContent || '').trim();
                return txt.includes('Lite');
              });
            }

            if (targetItem) {
              console.log('[Flow Engine] ✅ Clic firme en motor Ilimitado (Paso 3 / 3ra Imagen)...');
              clickElementFirmly(targetItem);
            }
          }

          // Cierre limpio de menús y tarjetas para que NO se quede abierto el motor flotando
          setTimeout(finishAndClose, 180);
        };

        setTimeout(proceedWithMenuOpen, 100);
      }, 250);
    };

    function finishAndClose() {
      // Ya NO bloqueamos por "solo una vez" — solo actualizamos el nombre visual
      // Actualizar nombre visual en UI externa
      selectedCustomModelName = "Veo 3.1 - Ilimitado";
      sessionStorage.setItem('flow_selected_model_name', selectedCustomModelName);
      applyModelNameToTrigger(selectedCustomModelName);

      // 1. CERRAR CUALQUIER MENÚ CDK / MAT-MENU DESPLEGADO (Para que no se quede abierto flotando)
      // a) Clic en los backdrops de CDK
      const backdrops = document.querySelectorAll('.cdk-overlay-backdrop');
      backdrops.forEach(b => {
        try { b.click(); } catch (_) {}
      });

      // b) Dispatch Escape global para cerrar menús Angular CDK
      const escOptions = { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true, cancelable: true, view: window };
      document.dispatchEvent(new KeyboardEvent('keydown', escOptions));
      window.dispatchEvent(new KeyboardEvent('keydown', escOptions));
      document.querySelectorAll('.cdk-overlay-pane, [role="menu"]').forEach(p => {
        try { p.dispatchEvent(new KeyboardEvent('keydown', escOptions)); } catch (_) {}
      });

      // c) Forzar ocultamiento inmediato de paneles de menú residuales en el DOM
      document.querySelectorAll('.mat-mdc-menu-panel, [role="menu"], .cdk-overlay-pane:has([role="menu"]), .cdk-overlay-pane:has(.mat-mdc-menu-panel)').forEach(m => {
        try {
          m.style.setProperty('display', 'none', 'important');
          m.style.setProperty('visibility', 'hidden', 'important');
          m.style.setProperty('opacity', '0', 'important');
          m.style.setProperty('pointer-events', 'none', 'important');
          const pane = m.closest('.cdk-overlay-pane');
          if (pane) {
            pane.style.setProperty('display', 'none', 'important');
            pane.style.setProperty('visibility', 'hidden', 'important');
          }
        } catch (_) {}
      });

      // 2. CERRAR LA TARJETA DE AJUSTES
      try {
        closeFlowSettingsOverlay();
      } catch (_) {}
      clearOrphanCdkBackdrops();

      // 3. Si la caja o el botón disparador persisten en estado abierto, forzar cierre
      setTimeout(() => {
        const stillOpen = getActiveFlowSettingsBox();
        if (stillOpen) {
          try {
            const tBtn = findFlowSettingsTriggerButton();
            if (tBtn) clickElementFirmly(tBtn);
          } catch (_) {}
          try {
            stillOpen.dispatchEvent(new KeyboardEvent('keydown', escOptions));
          } catch (_) {}
          try {
            closeFlowSettingsOverlay();
          } catch (_) {}
        }
        clearOrphanCdkBackdrops();
        isAutoConfiguringEngine = false;
        console.log('[Flow Engine] ✅ Secuencia completada: Motor seleccionado, menús cerrados y listo para generar.');
      }, 150);
    }

    setTimeout(proceedWithSettingsOpen, 150);
  }

  // 🛡️ DETECTOR DE RESPALDO PARA IMAGEN 3 (Aviso rojo de créditos insuficientes)
  function autoDismissCreditErrorAndConfigure() {
    if (!window.location.hostname.includes('flow.google.com') && !window.location.hostname.includes('labs.google')) return;
    if (isAutoConfiguringEngine) return;
    // FIX: No interrumpir al usuario mientras escribe
    if (userIsTypingInPrompt) return;

    const creditDialogs = Array.from(document.querySelectorAll('[role="dialog"], [role="alertdialog"], .cdk-overlay-pane, mat-dialog-container, flow-credit-warning-button, [class*="credit"], [class*="warning"]'));
    for (const d of creditDialogs) {
      const txt = (d.textContent || '').toLowerCase();
      if (txt.includes('no tienes suficientes créditos') || txt.includes('suficientes créditos para realizar') || txt.includes('actualiza tu plan para obtener más créditos')) {
        console.log('[Flow Engine] ⚠️ Detectado aviso de créditos insuficientes (Imagen 3). Forzando auto-selección del motor...');
        const configBtn = Array.from(d.querySelectorAll('button')).find(b => (b.textContent || '').toLowerCase().includes('configuración') || (b.textContent || '').toLowerCase().includes('configuracion'));
        if (configBtn) {
          try { configBtn.click(); } catch (_) {}
        }
        const projectId = getFlowProjectIdFromUrl() || 'flow_general';
        sessionStorage.removeItem('flow_auto_engine_configured_' + projectId);
        configuredProjectsInSession.delete(projectId);
        setTimeout(triggerAutoSelectEngineSequence, 150);
        break;
      }
    }
  }

  function autoSelectVeoLiteOnce(box) {
    triggerAutoSelectEngineSequence();
  }

  function autoPreselectClonedModelOnNewProject() {
    triggerAutoSelectEngineSequence();
  }

  // ============================================================
  // 🔒 FORZAR 1 VIDEO POR GENERACIÓN (limitar cantidad de clips)
  // El slider/selector de cantidad queda en 1 y se deshabilita.
  // ============================================================
  function enforceOneVideoPerGeneration() {
    if (!window.location.hostname.includes('flow.google.com') && !window.location.hostname.includes('labs.google')) return;
    if (!isVideoModeActive()) return;

    try {
      // Solo actuar dentro de la caja de parámetros de Flow.
      // Si no hay caja abierta, NO buscar en todo el documento: eso es lo
      // que deshabilitaba el campo de prompt (y otros inputs) por error.
      const box = getActiveFlowSettingsBox() || document.querySelector('flow-prompt-box-settings, .settings-content-overlay');
      if (!box) return;

      // Buscar inputs numéricos o sliders de cantidad de videos/clips
      const searchScope = box;

      // Selector de cantidad de clips (input type number, range, mat-slider, etc.)
      const quantityInputs = searchScope.querySelectorAll(
        'input[type="number"], input[type="range"], mat-slider, [aria-label*="cantidad" i], [aria-label*="quantity" i], ' +
        '[aria-label*="clips" i], [aria-label*="number of" i], ' +
        'input[min="1"][max], [class*="quantity"], [class*="clip-count"], [class*="number-of"]'
      );

      quantityInputs.forEach(input => {
        const tag = input.tagName.toLowerCase();
        const currentVal = parseFloat(input.value || input.getAttribute('aria-valuenow') || '1');

        if (tag === 'input') {
          if (currentVal !== 1) {
            // Forzar valor 1
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
            if (nativeInputValueSetter && nativeInputValueSetter.set) {
              nativeInputValueSetter.set.call(input, '1');
            } else {
              input.value = '1';
            }
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
          // Deshabilitar visualmente
          input.setAttribute('disabled', 'true');
          input.setAttribute('max', '1');
          input.setAttribute('min', '1');
          input.style.setProperty('pointer-events', 'none', 'important');
          input.style.setProperty('opacity', '0.6', 'important');
          input.style.setProperty('cursor', 'not-allowed', 'important');
        }

        if (tag === 'mat-slider' || input.getAttribute('role') === 'slider') {
          const ariaVal = parseFloat(input.getAttribute('aria-valuenow') || '1');
          if (ariaVal !== 1) {
            input.setAttribute('aria-valuenow', '1');
            input.setAttribute('aria-valuetext', '1');
          }
          input.setAttribute('aria-valuemin', '1');
          input.setAttribute('aria-valuemax', '1');
          input.style.setProperty('pointer-events', 'none', 'important');
          input.style.setProperty('cursor', 'not-allowed', 'important');
          input.style.setProperty('opacity', '0.6', 'important');
        }
      });

      // Buscar botones "+" que incrementan la cantidad
      const allBtns = searchScope.querySelectorAll('button');
      allBtns.forEach(btn => {
        const lbl = (btn.getAttribute('aria-label') || btn.textContent || '').trim().toLowerCase();
        const isIncrement = lbl === '+' || lbl === 'add' || lbl.includes('increase') || lbl.includes('incrementar') || lbl.includes('aumentar') ||
                            btn.getAttribute('aria-label')?.includes('más') || btn.getAttribute('aria-label')?.includes('add clip');
        if (isIncrement && btn.closest('flow-prompt-box-settings, .settings-content-overlay, [class*="quantity"], [class*="clip-count"]')) {
          btn.setAttribute('disabled', 'true');
          btn.style.setProperty('pointer-events', 'none', 'important');
          btn.style.setProperty('opacity', '0.4', 'important');
          btn.style.setProperty('cursor', 'not-allowed', 'important');
        }
      });

      // Interceptar eventos de cambio de valor en el contenedor de parámetros
      if (box && !box.getAttribute('data-flow-video-limit')) {
        box.setAttribute('data-flow-video-limit', '1');
        box.addEventListener('change', (e) => {
          const t = e.target;
          if (!t) return;
          const tag2 = (t.tagName || '').toLowerCase();
          if (tag2 === 'input' && (t.type === 'number' || t.type === 'range')) {
            if (parseFloat(t.value) > 1) {
              setTimeout(() => {
                try {
                  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
                  if (setter && setter.set) setter.set.call(t, '1');
                  else t.value = '1';
                  t.dispatchEvent(new Event('input', { bubbles: true }));
                  t.dispatchEvent(new Event('change', { bubbles: true }));
                } catch (_) {}
              }, 10);
            }
          }
        }, true);
      }
    } catch (e) {}
  }

  // Sincronización suave y continua
  // FIX: No ejecutar nada que mueva el foco mientras el usuario está escribiendo en el prompt
  setInterval(() => {
    if (userIsTypingInPrompt) return;
    applyModelNameToTrigger();
    triggerAutoSelectEngineSequence();
    autoDismissCreditErrorAndConfigure();
    enforceOneVideoPerGeneration(); // 🔒 Mantener 1 video por generación
    clearOrphanCdkBackdrops();      // 🛡️ Evitar capa invisible que bloquea el prompt
  }, 800);

  // Inicialización única al cargar proyecto
  setTimeout(triggerAutoSelectEngineSequence, 1000);
  window.addEventListener('popstate', () => {
    setTimeout(triggerAutoSelectEngineSequence, 600);
  });

  // ASIGNACIÓN DE LOS 4 NOMBRES Y REDIRECCIÓN LIMPIA A 0 CRÉDITOS (SOLO PARA MODO VIDEO)
  function cloneVeo31LiteMenuItems() {
    if (!window.location.hostname.includes('labs.google') && !window.location.hostname.includes('flow.google.com')) return;

    try {
      const allItems = Array.from(document.querySelectorAll('[role="menuitem"], [data-radix-collection-item], div[class*="PvrbA"], .mat-mdc-menu-item, mat-option, [role="option"]'));

      // NUNCA TOCAR NI RESTRINGIR MENÚS O ACCIONES DE LA LÍNEA DE TIEMPO / CLIPS ("Agregar clip", "Extender", etc.)
      const isTimelineRelatedItem = (item) => {
        if (!item) return false;
        if (item.closest('flow-timeline, [class*="timeline"], [class*="track"]')) return true;
        const pane = item.closest('.cdk-overlay-pane, .cdk-overlay-container, [role="menu"], .mat-mdc-menu-panel');
        const searchScope = pane || item;
        const txt = (searchScope.textContent || '').toLowerCase();
        const aria = (searchScope.getAttribute && searchScope.getAttribute('aria-label') || '').toLowerCase();
        return txt.includes('clip') || txt.includes('extender') || txt.includes('extend') || txt.includes('agregar') || txt.includes('add clip') || aria.includes('clip');
      };

      // Si existe algún overlay de clips o línea de tiempo abierto, restaurar visibilidad completa de inmediato
      const timelinePanes = Array.from(document.querySelectorAll('.cdk-overlay-pane, [role="menu"], .mat-mdc-menu-panel')).filter(p => {
        const pTxt = (p.textContent || '').toLowerCase();
        return pTxt.includes('clip') || pTxt.includes('extender') || pTxt.includes('extend') || pTxt.includes('agregar');
      });

      if (timelinePanes.length > 0) {
        timelinePanes.forEach(pane => {
          pane.removeAttribute('data-flow-restricted-model');
          pane.removeAttribute('data-flow-closed');
          pane.style.removeProperty('display');
          pane.style.removeProperty('visibility');
          pane.style.removeProperty('height');
          pane.style.removeProperty('opacity');
          pane.style.removeProperty('pointer-events');

          pane.querySelectorAll('*').forEach(child => {
            child.removeAttribute('data-flow-restricted-model');
            child.removeAttribute('data-flow-closed');
            child.style.removeProperty('display');
            child.style.removeProperty('visibility');
            child.style.removeProperty('height');
            child.style.removeProperty('min-height');
            child.style.removeProperty('padding');
            child.style.removeProperty('margin');
            child.style.removeProperty('border');
            child.style.removeProperty('overflow');
            child.style.removeProperty('pointer-events');
            child.style.removeProperty('opacity');
          });
        });
      }

      // Si la llamada detectó items de la línea de tiempo, salir sin modificar modelos
      const hasTimelineItems = allItems.some(item => isTimelineRelatedItem(item));
      if (hasTimelineItems || timelinePanes.length > 0) {
        return;
      }

      const modelItems = allItems.filter(el => {
        if (isTimelineRelatedItem(el)) return false;
        if (el.closest('.cdk-overlay-pane') && timelinePanes.includes(el.closest('.cdk-overlay-pane'))) return false;
        return el.querySelector('button[class*="cQfZel"]') || el.classList.contains('PvrbA') || el.classList.contains('mat-mdc-menu-item') || el.tagName === 'MAT-OPTION' || el.getAttribute('role') === 'option';
      });

      if (modelItems.length === 0) return;

      // Si contiene modelos de Imagen (Nano Banana, Imagen 3, etc.), NUNCA TOCARLOS
      const hasImageModels = modelItems.some(item => {
        const txt = (item.dataset.originalText || item.textContent || '');
        return txt.includes('Banana') || txt.includes('Nano') || txt.includes('Imagen');
      });
      if (hasImageModels) return;

      // Guardar el texto original en cada item antes de que se modifique
      modelItems.forEach(item => {
        if (!item.dataset.originalText) {
          item.dataset.originalText = (item.textContent || '').trim();
        }
      });

      // Verificar si los elementos del menú pertenecen a Video (contienen "Veo" u "Omni" o "Lite" o "Quality" o "Fast")
      const isVideoMenu = modelItems.length >= 2 && modelItems.some(item => {
        const txt = (item.dataset.originalText || item.textContent || '');
        return txt.includes('Veo') || txt.includes('Omni') || txt.includes('Lower Priority') || txt.includes('Lite') || txt.includes('Fast') || txt.includes('Quality');
      });

      // Si no es menú de Video, NO TOCAR NADA
      if (!isVideoMenu) return;

      // Localizar el motor de 0 créditos original (Lite / Lower Priority)
      let originalVeoItem = modelItems.find(item => {
        const txt = (item.dataset.originalText || '').trim();
        return txt.includes('Lower Priority') || txt.includes('[Lower Priority]');
      });
      if (!originalVeoItem) {
        originalVeoItem = modelItems.find(item => {
          const txt = (item.dataset.originalText || '').trim();
          return txt.includes('Lite');
        });
      }
      if (!originalVeoItem && modelItems.length >= 3) {
        originalVeoItem = modelItems[modelItems.length - 1];
      }

      modelItems.forEach((item) => {
        const rawText = (item.dataset.originalText || item.textContent || '').trim();
        const isLowerPriority = rawText.includes('Lower Priority') || rawText.includes('[Lower Priority]');

        // Si NO es el motor de 0 créditos (Lower Priority), RESTRINGIR Y OCULTAR PERMANENTEMENTE (Imágenes 1, 2, 3 y 4)
        if (!isLowerPriority) {
          item.setAttribute('data-flow-restricted-model', 'true');
          item.style.setProperty('display', 'none', 'important');
          item.style.setProperty('visibility', 'hidden', 'important');
          item.style.setProperty('height', '0px', 'important');
          item.style.setProperty('min-height', '0px', 'important');
          item.style.setProperty('padding', '0px', 'important');
          item.style.setProperty('margin', '0px', 'important');
          item.style.setProperty('border', 'none', 'important');
          item.style.setProperty('overflow', 'hidden', 'important');
          item.style.setProperty('pointer-events', 'none', 'important');

          const parentWrapper = item.closest('flow-menu-item') || (item.parentElement && item.parentElement.tagName === 'FLOW-MENU-ITEM' ? item.parentElement : null);
          if (parentWrapper) {
            parentWrapper.setAttribute('data-flow-restricted-model', 'true');
            parentWrapper.style.setProperty('display', 'none', 'important');
            parentWrapper.style.setProperty('visibility', 'hidden', 'important');
            parentWrapper.style.setProperty('height', '0px', 'important');
            parentWrapper.style.setProperty('min-height', '0px', 'important');
            parentWrapper.style.setProperty('padding', '0px', 'important');
            parentWrapper.style.setProperty('margin', '0px', 'important');
            parentWrapper.style.setProperty('border', 'none', 'important');
            parentWrapper.style.setProperty('overflow', 'hidden', 'important');
            parentWrapper.style.setProperty('pointer-events', 'none', 'important');
          }
          return;
        }

        // El motor de 0 créditos (Veo 3.1 - Ilimitado) es el ÚNICO PERMITIDO Y VISIBLE
        const desiredName = "Veo 3.1 - Ilimitado";
        item.removeAttribute('data-flow-restricted-model');
        item.style.removeProperty('display');
        item.style.removeProperty('visibility');
        item.style.removeProperty('height');
        item.style.removeProperty('min-height');
        item.style.removeProperty('padding');
        item.style.removeProperty('margin');
        item.style.removeProperty('border');
        item.style.removeProperty('overflow');
        item.style.removeProperty('pointer-events');

        const parentWrapper = item.closest('flow-menu-item');
        if (parentWrapper) {
          parentWrapper.removeAttribute('data-flow-restricted-model');
          parentWrapper.style.removeProperty('display');
          parentWrapper.style.removeProperty('visibility');
          parentWrapper.style.removeProperty('height');
          parentWrapper.style.removeProperty('min-height');
          parentWrapper.style.removeProperty('padding');
          parentWrapper.style.removeProperty('margin');
          parentWrapper.style.removeProperty('border');
          parentWrapper.style.removeProperty('overflow');
          parentWrapper.style.removeProperty('pointer-events');
        }

        // Resaltar visualmente el motor seleccionado
        item.style.setProperty('background-color', 'rgba(255, 255, 255, 0.1)', 'important');
        item.style.setProperty('border-radius', '12px', 'important');

        // Localizar el contenedor específico del texto (span.label / .item-text de Imagen 2)
        const labelDiv = item.querySelector('.label, [class*="label"], .item-text, [class*="item-text"], [class*="jhWQZA"], button[class*="cQfZel"] > div:not([class*="kiuWmD"]), .mdc-list-item__primary-text, .mdc-button__label');
        if (labelDiv) {
          if (labelDiv.textContent !== desiredName) {
            labelDiv.textContent = desiredName;
          }
          labelDiv.style.setProperty('color', '#f8fafc', 'important');
          labelDiv.style.setProperty('font-size', '0.75rem', 'important');
          labelDiv.style.setProperty('line-height', '1rem', 'important');
          labelDiv.style.setProperty('font-weight', '500', 'important');
        }

        // Reemplazar de forma exhaustiva cualquier nodo de texto interno que contenga el nombre viejo
        item.querySelectorAll('span, div').forEach(s => {
          if (s.children.length === 0 && (s.textContent.includes('Veo 3.1') || s.textContent.includes('Lower Priority') || s.textContent.includes('Lite'))) {
            s.textContent = desiredName;
            s.style.setProperty('color', '#f8fafc', 'important');
          }
        });

        // Asegurar icono de altavoz en blanco si existe
        const icons = item.querySelectorAll('i, svg, mat-icon');
        icons.forEach(ico => {
          ico.style.setProperty('color', '#f8fafc', 'important');
          ico.style.setProperty('font-size', '1.5rem', 'important');
        });

        // Manejo controlado del clic
        if (!item.dataset.flowClonedClick) {
          item.dataset.flowClonedClick = 'true';

          item.addEventListener('click', () => {
            if (isProgrammaticClick) return;

            selectedCustomModelName = desiredName;
            sessionStorage.setItem('flow_selected_model_name', selectedCustomModelName);
            setTimeout(() => {
              applyModelNameToTrigger(desiredName);
            }, 20);

            // Sincronizar el estado del overlay al seleccionar un motor
            setTimeout(() => {
              const active = getActiveFlowSettingsBox();
              if (!active) {
                isFlowSettingsOpen = false;
                lastCloseTimestamp = Date.now();
              }
            }, 100);
            setTimeout(() => {
              const active = getActiveFlowSettingsBox();
              if (!active) {
                isFlowSettingsOpen = false;
                lastCloseTimestamp = Date.now();
              }
            }, 300);
          }, false);
        }
      });
    } catch (e) {}
  }

  // Interacción en eventos de puntero (optimizado: solo cuando se interactúa con menús)
  document.addEventListener('pointerdown', (e) => {
    const host = window.location.hostname;

    if (host.includes('labs.google') || host.includes('flow.google.com')) {
      if (isProgrammaticClick) return;

      const targetMenuItem = e.target.closest && e.target.closest('[role="menuitem"], [data-radix-collection-item], div[class*="PvrbA"], .mat-mdc-menu-item, mat-option, [role="option"]');
      if (!targetMenuItem) return;

      // NUNCA interceptar acciones de clip o línea de tiempo
      const itemTxt = ((targetMenuItem.dataset && targetMenuItem.dataset.originalText) || targetMenuItem.textContent || '').trim().toLowerCase();
      const isTimelineItem = itemTxt.includes('clip') || itemTxt.includes('extender') || itemTxt.includes('extend') || 
                             itemTxt.includes('agregar') || itemTxt.includes('add') ||
                             targetMenuItem.closest('flow-timeline, [class*="timeline"], [class*="track"], [class*="clip"]');
      if (isTimelineItem) {
        return;
      }

      if (targetMenuItem.getAttribute('data-flow-restricted-model') === 'true') {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (!targetMenuItem.closest('header')) {
        const text = (targetMenuItem.dataset && targetMenuItem.dataset.originalText) || (targetMenuItem.textContent || '').trim();
        for (const name of MODEL_NAMES) {
          if (text.includes(name)) {
            selectedCustomModelName = name;
            sessionStorage.setItem('flow_selected_model_name', name);
            break;
          }
        }
        setTimeout(() => {
          cloneVeo31LiteMenuItems();
          applyModelNameToTrigger();
        }, 30);

        setTimeout(() => {
          const active = getActiveFlowSettingsBox();
          if (!active) {
            isFlowSettingsOpen = false;
            lastCloseTimestamp = Date.now();
          }
        }, 150);
      }
    }
  }, { passive: true });

  // INYECCIÓN CSS PRIORITARIA Y SEGURA
  function injectAvatarCSSOverride(targetRoot = document) {
    const host = (window.location.hostname || '').toLowerCase();
    const url = (window.location.href || '').toLowerCase();
    if (host.includes('recaptcha.net') || (!host.includes('accounts.google.com') && (host.includes('recaptcha') || (window.location.pathname || '').toLowerCase().startsWith('/recaptcha/')))) return;

    const imgUrl = getAvatarImgUrl();
    if (!imgUrl || !targetRoot) return;

    const isGemini = window.location.hostname.includes('gemini.google.com');

    const styleContainer = targetRoot.head || targetRoot.body || targetRoot;
    if (!styleContainer || (styleContainer.querySelector && styleContainer.querySelector('#flow-avatar-override-style'))) return;

    const style = document.createElement('style');
    style.id = 'flow-avatar-override-style';
    style.textContent = `
      /* 1. CENSURA PERMANENTE DE CONTRASEÑAS, TOKEN OTP Y CORREO EN TODOS LOS CAMPOS DE GOOGLE */
      input[name="Passwd"],
      input[name="password"],
      input[type="password"],
      input[aria-label*="contraseña" i],
      input[aria-label*="password" i],
      input[placeholder*="contraseña" i],
      input#totpPin,
      input[name="totpPin"],
      input[name="Pin"],
      input[type="tel"],
      input[autocomplete="one-time-code"],
      input[id*="totp" i],
      input[id*="pin" i],
      input[name*="pin" i],
      input[aria-label*="código" i],
      input[aria-label*="code" i],
      #identifierId {
        -webkit-text-security: disc !important;
      }

      /* 2. OCULTAR BOTÓN "BORRAR" EN NOTEBOOKLM Y "ELIMINAR" EN GEMINI */
      button.delete-button,
      button[class*="delete-button"],
      button[class*="hamburger-menu-action"][class*="delete"],
      button[data-test-id="delete-button"],
      [data-test-id="delete-button"],
      button:has(gem-icon[fonticonname="delete"]) {
        display: none !important;
        visibility: hidden !important;
        height: 0px !important;
        min-height: 0px !important;
        padding: 0px !important;
        margin: 0px !important;
        border: none !important;
        overflow: hidden !important;
        pointer-events: none !important;
      }

      /* 3. OCULTAR ICONO DE "APPS DE GOOGLE" (#gbwa / WAFFLE DE 9 PUNTOS) EN NOTEBOOKLM, GEMINI Y GOOGLE */
      #gbwa,
      [aria-label*="Apps de Google" i],
      [aria-label*="Google apps" i],
      [aria-label*="Aplicaciones de Google" i],
      div[data-ogsr-fb="true"],
      a.gb_C[aria-label*="Apps" i],
      a[href*="about/products"] {
        display: none !important;
        visibility: hidden !important;
        width: 0px !important;
        height: 0px !important;
        padding: 0px !important;
        margin: 0px !important;
        border: none !important;
        overflow: hidden !important;
        pointer-events: none !important;
      }

      /* ================================================================
       * 15. GEMINI: OCULTAR BOTÓN "DESCARGAR APP" Y BLOQUEAR "CHAT TEMPORAL"
       * ================================================================ */

      /* ================================================================
       * GEMINI ONLY — selectores aplicados ÚNICAMENTE cuando isGemini === true
       * ================================================================ */
      ${isGemini ? `

      /* ── Botón "Descargar app" / "Get the app" ── */
      a[href*="gemini.google.com/faq#get-the-app"],
      a[href*="itunes.apple.com"],
      a[href*="play.google.com/store/apps/details?id=com.google.android.apps.bard"],
      a[href*="app.link"][href*="gemini"],
      a[href*="app.link"][href*="bard"],
      [data-test-id="download-app-button"],
      [data-test-id="get-app-button"],
      [data-test-id="download-app"],
      button[aria-label*="descargar app" i],
      button[aria-label*="download app" i],
      button[aria-label*="get the app" i],
      button[aria-label*="get app" i],
      a[aria-label*="descargar app" i],
      a[aria-label*="download app" i],
      a[aria-label*="get the app" i],
      div[jsname="download-app"],
      /* Contenedor padre del botón de descarga en el sidebar */
      side-navigation-item:has(a[href*="app.link"]),
      side-navigation-item:has(a[href*="itunes.apple.com"]),
      side-navigation-item:has(a[href*="play.google.com/store/apps"]),
      side-navigation-item:has([data-test-id="download-app-button"]),
      side-navigation-item:has([data-test-id="get-app-button"]) {
        display: none !important;
        visibility: hidden !important;
        height: 0px !important;
        min-height: 0px !important;
        width: 0px !important;
        padding: 0px !important;
        margin: 0px !important;
        overflow: hidden !important;
        pointer-events: none !important;
      }

      /* ── Botón "Chat temporal" / "Temporary chat" ── */
      [data-test-id="temporary-chat-button"],
      [data-test-id="temp-chat-button"],
      [data-test-id="temporary-chat"],
      button[aria-label*="chat temporal" i],
      button[aria-label*="temporary chat" i],
      button[aria-label*="temp chat" i],
      a[aria-label*="chat temporal" i],
      a[aria-label*="temporary chat" i],
      div[jsname="temporary-chat"],
      side-navigation-item:has([data-test-id*="temporary"]),
      side-navigation-item:has([aria-label*="temporary chat" i]),
      side-navigation-item:has([aria-label*="chat temporal" i]),
      bard-side-nav button:has(mat-icon[data-mat-icon-name*="temporary"]),
      bard-side-nav button:has(gem-icon[fonticonname*="temporary"]),
      /* Variante Gemini 2.x con componente propio */
      ms-side-nav-item:has([data-test-id*="temporary"]),
      ms-side-nav-item:has([aria-label*="temporary chat" i]),
      ms-side-nav-item:has([aria-label*="chat temporal" i]) {
        display: none !important;
        visibility: hidden !important;
        height: 0px !important;
        min-height: 0px !important;
        width: 0px !important;
        padding: 0px !important;
        margin: 0px !important;
        overflow: hidden !important;
        pointer-events: none !important;
      }

      /* ── Limpiar UI extra de Gemini: notificaciones, banners, sugerencias no deseadas ── */

      /* Banner "Novedades" / "What's new" */
      [data-test-id="whats-new-banner"],
      [data-test-id="new-features-banner"],
      bard-side-nav [aria-label*="novedades" i],
      bard-side-nav [aria-label*="what's new" i],
      ms-side-nav-item[data-test-id*="whats-new"],
      /* Botón de feedback / pulgar arriba-abajo flotante en respuestas */
      message-actions button[aria-label*="más opciones" i],
      /* Sugerencias de prompts vacíos (chips) — solo si quieres una UI más limpia */
      /* suggestion-chips, .suggestions-container { display: none !important; } */
      /* Banner de actualización de términos */
      [data-test-id="tos-update-banner"],
      [data-test-id="privacy-banner"],
      /* Tooltip "Prueba Gemini Advanced" */
      [data-test-id="upsell-tooltip"],
      [data-test-id="upgrade-tooltip"],
      .upsell-banner,
      /* Botón "Explorar Gems" en el sidebar (si no se usa) — comentado por defecto */
      /* side-navigation-item:has([aria-label*="gems" i]) { display: none !important; } */
      /* Botón de compartir conversación */
      button[aria-label*="compartir conversación" i],
      button[aria-label*="share conversation" i],
      button[data-test-id="share-button"],
      /* Badge de notificación roja (punto rojo) en botones del sidebar */
      .notification-badge,
      [data-test-id="notification-badge"],
      bard-side-nav .badge,
      ms-side-nav-item .badge {
        display: none !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }

      /* ── Mejorar espaciado del sidebar tras ocultar elementos ── */
      bard-side-nav side-navigation-item[style*="display: none"] + side-navigation-item,
      ms-side-nav-item[style*="display: none"] + ms-side-nav-item {
        margin-top: 0 !important;
      }

      ` : ''}

      /* 4. OCULTAR BOTÓN "BORRAR PROYECTO" EN TARJETAS DE GOOGLE FLOW */
      button[aria-label*="borrar proyecto" i],
      button[aria-label*="delete project" i],
      .project-card-footer button[aria-label*="borrar" i],
      .project-card-footer button[aria-label*="delete" i],
      flow-project-card button[aria-label*="borrar" i],
      flow-project-card button[aria-label*="delete" i],
      [flow-icon-button][aria-label*="borrar" i],
      [flow-icon-button][aria-label*="delete" i],
      button.footer-button[aria-label*="borrar" i],
      button.footer-button[aria-label*="delete" i],
      [data-flow-delete-project-btn="true"],
      button.bUtmhH,
      button[class*="bUtmhH"],
      div[class*="eyCPHu"] button:last-child {
        display: none !important;
        visibility: hidden !important;
        width: 0px !important;
        min-width: 0px !important;
        height: 0px !important;
        min-height: 0px !important;
        padding: 0px !important;
        margin: 0px !important;
        border: none !important;
        overflow: hidden !important;
        pointer-events: none !important;
      }

      /* 4.1. RESTRINGIR Y OCULTAR PERMANENTEMENTE "PAPELERA" EN GOOGLE FLOW (BARRA LATERAL Y MENÚS) */
      [flow-sidenav-bottom] a,
      div[flow-sidenav-bottom] a,
      [flow-sidenav-bottom] a[mat-list-item],
      a[mat-list-item][href*="trash" i],
      a[mat-list-item][href*="papelera" i],
      a[mat-list-item][href*="bin" i],
      a[href*="/trash" i],
      a[href*="/papelera" i],
      a[href*="/bin" i],
      [data-flow-trash-item="true"],
      [data-flow-restricted-trash="true"] {
        display: none !important;
        visibility: hidden !important;
        height: 0px !important;
        min-height: 0px !important;
        width: 0px !important;
        min-width: 0px !important;
        padding: 0px !important;
        margin: 0px !important;
        border: none !important;
        overflow: hidden !important;
        pointer-events: none !important;
      }

      /* 4.2. OCULTAR Y DESAPARECER TOTALMENTE EL CHIP DE MODO AGENTE EN GOOGLE FLOW (IMAGEN 1 Y 2) */
      flow-agent-mode-toggle-chip,
      .agent-mode-chip,
      button.agent-mode-chip,
      span.agent-mode-chip-label,
      [bottomcontrolextra]:has(.agent-mode-chip) {
        display: none !important;
        visibility: hidden !important;
        width: 0px !important;
        min-width: 0px !important;
        max-width: 0px !important;
        height: 0px !important;
        min-height: 0px !important;
        max-height: 0px !important;
        padding: 0px !important;
        margin: 0px !important;
        border: none !important;
        overflow: hidden !important;
        pointer-events: none !important;
        opacity: 0 !important;
      }

      /* 5. OCULTAR BOTONES "AGREGAR CUENTA" Y "SALIR" EN EL MODAL DE PERFIL DE GOOGLE & GOOGLE FLOW */
      a[href*="AddSession"],
      a[aria-label*="Agregar cuenta" i],
      a[aria-label*="Add account" i],
      a[href*="accounts.google.com/Logout"],
      a[href*="Logout"],
      a[aria-label*="Salir" i],
      a[aria-label*="Sign out" i],
      a[aria-label*="Cerrar sesión" i],
      button.dDWDkO,
      button[class*="sc-a038204d-7"],
      div.aPD1af,
      div[class*="aPD1af"],
      span.UXkGr,
      span[class*="UXkGr"],
      /* FIX: Restringido al modal de cuenta — antes afectaba contenedores de toda la página */
      div[role="dialog"] div[data-la="flex"],
      div[aria-modal="true"] div[data-la="flex"] {
        display: none !important;
        visibility: hidden !important;
        height: 0px !important;
        min-height: 0px !important;
        padding: 0px !important;
        margin: 0px !important;
        border: none !important;
        overflow: hidden !important;
        pointer-events: none !important;
      }

      /* 6. PRESERVAR FUENTE DE ICONOS DE GOOGLE SYMBOLS Y APLICAR BLANCO NATIVO EN EL MENÚ DE MODELOS */
      div[class*="PvrbA"] i.google-symbols,
      [role="menuitem"]:has(button[class*="cQfZel"]) i.google-symbols {
        font-family: "Google Symbols", "Material Symbols Outlined", "Material Symbols" !important;
        font-size: 1.5rem !important;
        color: #f8fafc !important;
      }

      /* 6. TEXTO BLANCO Y TAMAÑO EXACTO (0.75rem) IDÉNTICO AL MOTOR ORIGINAL */
      div[class*="PvrbA"] [class*="jhWQZA"],
      [role="menuitem"] button[class*="cQfZel"] > div {
        color: #f8fafc !important;
        opacity: 1 !important;
        font-family: "Google Sans Text", "Google Sans", system-ui, -apple-system, sans-serif !important;
        font-size: 0.75rem !important;
        line-height: 1rem !important;
        font-weight: 500 !important;
      }

      /* 7. PROTECCIÓN ESTRICTA: NUNCA MODIFICAR IMÁGENES GENERADAS EN GEMINI NI CONTENIDO MULTIMEDIA (EXCLUIR RECAPTCHA) */
      model-response img,
      message-content img,
      button.image-button img,
      div.image-container img,
      div[class*="image-container"]:not([class*="rc-"]):not([id*="recaptcha"]) img:not([class*="rc-"]),
      .chat-history img.image,
      .chat-history img[class*="image"]:not([class*="rc-"]),
      gemini-content img {
        content: normal !important;
        background: transparent !important;
        border-radius: 12px !important;
        padding: 0px !important;
        border: none !important;
        box-shadow: none !important;
        max-width: 100% !important;
        width: auto !important;
        height: auto !important;
        display: inline-block !important;
      }

      /* 7.1. AISLAMIENTO TOTAL E INTOCABLE PARA RECAPTCHA DE GOOGLE */
      .g-recaptcha,
      .g-recaptcha *,
      [class*="recaptcha"],
      [class*="recaptcha"] *,
      [id*="recaptcha"],
      [id*="recaptcha"] *,
      [class*="rc-"],
      [class*="rc-"] *,
      iframe[src*="recaptcha"],
      div:has(iframe[src*="recaptcha"]) {
        max-width: none !important;
        border-radius: initial !important;
      }
      .rc-imageselect-target,
      .rc-imageselect-target *,
      .rc-imageselect-payload,
      .rc-imageselect-payload *,
      .rc-image-tile-wrapper,
      .rc-image-tile-wrapper *,
      img.rc-image-tile-44,
      img.rc-image-tile-33,
      img[class*="rc-image"],
      table.rc-imageselect-table-44,
      table.rc-imageselect-table-33 {
        border-radius: 0px !important;
        max-width: none !important;
      }

      /* 8. CENTRADO PERFECTO DEL CONTENEDOR Y AVATAR EN MODAL DE CUENTA */
      div[class*="GFYYTb"],
      div[class*="N2ncR"],
      div[class*="GFYYTb"] > span,
      div[class*="GFYYTb"] > span > div {
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        align-items: center !important;
        text-align: center !important;
        margin-left: auto !important;
        margin-right: auto !important;
        width: 100% !important;
      }

      div[class*="XS2qof"],
      div[class*="Q3BXBb"],
      div[class*="GFYYTb"] [class*="XS2qof"],
      div[class*="GFYYTb"] [class*="Q3BXBb"],
      a[aria-label*="Cambiar imagen" i],
      a[aria-label*="Cambiar foto" i],
      button[aria-label*="Cambiar foto" i],
      div[aria-label*="Cambiar imagen" i],
      div[aria-label*="Cambiar foto" i],
      div[jsname="b0t70b"],
      div[jsname="wP41b"] {
        width: 80px !important;
        height: 80px !important;
        min-width: 80px !important;
        min-height: 80px !important;
        max-width: 80px !important;
        max-height: 80px !important;
        border-radius: 50% !important;
        background-color: #ffffff !important;
        background: #ffffff url("${imgUrl}") no-repeat center center !important;
        background-size: 78% 78% !important;
        border: 2px solid #ffffff !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.18) !important;
        display: block !important;
        margin: 0 auto 12px auto !important;
        align-self: center !important;
        position: relative !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
      }

      /* Ocultar elementos internos dentro del círculo grande de 80px */
      div[class*="XS2qof"] svg,
      div[class*="XS2qof"] div[class*="G5bxNb"],
      div[class*="XS2qof"] img,
      div[class*="Q3BXBb"] svg,
      div[class*="Q3BXBb"] div,
      div[class*="GFYYTb"] svg,
      div[class*="GFYYTb"] div[class*="G5bxNb"],
      div[jsname="b0t70b"] *,
      div[jsname="wP41b"] * {
        opacity: 0 !important;
        visibility: hidden !important;
        display: none !important;
      }

      /* 9. REEMPLAZO EXCLUSIVO DE AVATARES DE PERFIL EN BOTONES PEQUEÑOS (HEADER/NAV) */
      header img[src*="googleusercontent.com/a/"]:not(.image):not([class*="image"]),
      nav img[src*="googleusercontent.com/a/"]:not(.image):not([class*="image"]),
      button[aria-label*="Cuenta de Google" i] img,
      button[aria-label*="Google Account" i] img,
      a[href*="SignOutOptions"] img,
      a[aria-label*="Cuenta de Google" i] img,
      a[aria-label*="Google Account" i] img,
      img.dajHYV,
      [class*="dajHYV"] {
        content: url("${imgUrl}") !important;
        background-color: #ffffff !important;
        background: #ffffff !important;
        border-radius: 50% !important;
        object-fit: contain !important;
        object-position: center !important;
        padding: 3px !important;
        box-sizing: border-box !important;
        border: 1.5px solid #ffffff !important;
        box-shadow: 0 1px 4px rgba(0,0,0,0.15) !important;
      }

      /* 10. Regla universal de tamaño compacto para botones de perfil en header/nav */
      .flow-replaced-avatar,
      [data-flow-avatar-replaced="true"]:not([class*="XS2qof"]):not([class*="Q3BXBb"]) {
        width: ${isGemini ? '28px' : '32px'} !important;
        height: ${isGemini ? '28px' : '32px'} !important;
        min-width: ${isGemini ? '28px' : '32px'} !important;
        min-height: ${isGemini ? '28px' : '32px'} !important;
        max-width: ${isGemini ? '28px' : '32px'} !important;
        max-height: ${isGemini ? '28px' : '32px'} !important;
        aspect-ratio: 1 / 1 !important;
        border-radius: 50% !important;
        background-color: #ffffff !important;
        background: #ffffff url("${imgUrl}") no-repeat center center !important;
        background-size: 75% 75% !important;
        border: 1.5px solid #ffffff !important;
        box-shadow: 0 1px 4px rgba(0,0,0,0.15) !important;
        flex-shrink: 0 !important;
        object-fit: contain !important;
        object-position: center !important;
        color: transparent !important;
        display: inline-block !important;
        box-sizing: border-box !important;
      }

      /* 11. REGLA ESTRICTA COMPACTA SOLO PARA GEMINI SIDEBAR */
      ${isGemini ? `
        a[href*="/gems/view"],
        a[href*="/gems/view"] [data-flow-avatar-replaced="true"],
        a[href*="/gems/view"] img,
        button[aria-label*="Cuenta de Google" i],
        a[aria-label*="Cuenta de Google" i],
        div[class*="user-avatar"],
        div[class*="bottom-nav"] [data-flow-avatar-replaced="true"] {
          width: 28px !important;
          height: 28px !important;
          min-width: 28px !important;
          min-height: 28px !important;
          max-width: 28px !important;
          max-height: 28px !important;
          aspect-ratio: 1 / 1 !important;
          border-radius: 50% !important;
          box-sizing: border-box !important;
          flex-shrink: 0 !important;
          margin: 0 !important;
        }
      ` : ''}

      /* 12. Ocultar enlace central duplicado de myaccount debajo de ¡Hola, en el modal */
      a[href*="myaccount.google.com"],
      div[aria-modal="true"] a[href*="myaccount"],
      div[role="dialog"] a[href*="myaccount"],
      [aria-label*="Cambiar imagen" i] ~ a,
      [aria-label*="Change picture" i] ~ a {
        display: none !important;
      }

      /* 13. OCULTAR ALERTA DE CRÉDITOS / ESFERA ROJA EN BARRA DE PROMPT DE FLOW */
      img[src*="flow_alert_sphere"],
      div[class*="FuwbR"],
      div[class*="sc-5c3af813-15"],
      i.eBwIZC,
      div[data-state*="open"]:has(img[src*="flow_alert_sphere"]) {
        display: none !important;
        visibility: hidden !important;
        width: 0px !important;
        height: 0px !important;
        padding: 0px !important;
        margin: 0px !important;
        pointer-events: none !important;
      }

      /* 14. OCULTAR BOTÓN "AGENTE" EN LA BARRA DE PROMPT DE FLOW */
      /* FIX: Selectores restringidos al chip de modo agente — antes eran demasiado amplios
         y ocultaban botones legítimos del campo de prompt en modo Video */
      button[class*="sc-59223abb"],
      flow-agent-mode-toggle-chip button:has(span.content),
      flow-agent-mode-toggle-chip button:has(div > span.content),
      .agent-mode-chip button:has(span.content),
      .agent-mode-chip button:has(div > span.content),
      button.dmZGYv,
      button.bdRbOx {
        display: none !important;
        visibility: hidden !important;
        width: 0px !important;
        height: 0px !important;
        min-width: 0px !important;
        min-height: 0px !important;
        padding: 0px !important;
        margin: 0px !important;
        overflow: hidden !important;
        pointer-events: none !important;
      }

      /* FIX: Protección del área de prompt — solo el campo editable.
         No reactivar todos los descendientes de flow-prompt-box porque los
         overlays invisibles internos volverían a interceptar el clic. */
      flow-prompt-box,
      flow-prompt-box rich-textarea,
      flow-prompt-box rich-textarea *,
      flow-prompt-box [contenteditable="true"],
      flow-prompt-box [contenteditable="true"] *,
      rich-textarea,
      rich-textarea *,
      [contenteditable="true"],
      [contenteditable="true"] * {
        pointer-events: auto !important;
        user-select: text !important;
      }
    `;
    try { styleContainer.appendChild(style); } catch (e) {}
  }

  // APLICAR ESTILO DE AVATAR A UN ELEMENTO
  function applyAvatarToElement(el, size = '32px') {
    const imgUrl = getAvatarImgUrl();
    if (!el || !imgUrl) return;

    // Detectar si el elemento es el avatar grande del modal (80px)
    const isLargeModal = el.closest('div[class*="GFYYTb"], div[class*="XS2qof"], div[class*="Q3BXBb"], div[role="dialog"], div[aria-modal="true"], div[jsname="b0t70b"], div[jsname="wP41b"], [aria-label*="Cambiar" i]') || el.offsetWidth >= 60 || el.offsetHeight >= 60;
    const finalSize = isLargeModal ? '80px' : size;
    const bgScale = isLargeModal ? '78% 78%' : '75% 75%';

    el.dataset.flowAvatarReplaced = 'true';
    el.style.setProperty('width', finalSize, 'important');
    el.style.setProperty('height', finalSize, 'important');
    el.style.setProperty('min-width', finalSize, 'important');
    el.style.setProperty('min-height', finalSize, 'important');
    el.style.setProperty('max-width', finalSize, 'important');
    el.style.setProperty('max-height', finalSize, 'important');
    el.style.setProperty('aspect-ratio', '1 / 1', 'important');
    el.style.setProperty('flex-shrink', '0', 'important');
    el.style.setProperty('box-sizing', 'border-box', 'important');

    el.style.setProperty('background-image', `url("${imgUrl}")`, 'important');
    el.style.setProperty('background-color', '#ffffff', 'important');
    el.style.setProperty('background', `#ffffff url("${imgUrl}") no-repeat center center`, 'important');
    el.style.setProperty('background-size', bgScale, 'important');
    el.style.setProperty('border-radius', '50%', 'important');
    el.style.setProperty('border', isLargeModal ? '2px solid #ffffff' : '1.5px solid #ffffff', 'important');
    el.style.setProperty('color', 'transparent', 'important');
    el.style.setProperty('box-shadow', isLargeModal ? '0 2px 8px rgba(0,0,0,0.18)' : '0 1px 4px rgba(0,0,0,0.15)', 'important');
    el.style.setProperty('overflow', 'hidden', 'important');

    if (isLargeModal) {
      el.style.setProperty('margin-left', 'auto', 'important');
      el.style.setProperty('margin-right', 'auto', 'important');
      el.style.setProperty('align-self', 'center', 'important');
      el.style.setProperty('display', 'block', 'important');
    }

    Array.from(el.children).forEach(child => {
      child.style.setProperty('opacity', '0', 'important');
      child.style.setProperty('visibility', 'hidden', 'important');
      child.style.setProperty('display', 'none', 'important');
    });

    for (let child of Array.from(el.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        child.nodeValue = '';
      }
    }
  }

  // BÚSQUEDA Y SUSTITUCIÓN DIRECTA DE AVATARES (OPTIMIZADA SIN FORCED REFLOW)
  function replaceAvatarBadge() {
    const host = (window.location.hostname || '').toLowerCase();
    const url = (window.location.href || '').toLowerCase();
    if (host.includes('recaptcha.net') || (!host.includes('accounts.google.com') && (host.includes('recaptcha') || (window.location.pathname || '').toLowerCase().startsWith('/recaptcha/')))) return;

    injectAvatarCSSOverride(document);

    const imgUrl = getAvatarImgUrl();
    if (!imgUrl) return;

    const isGemini = window.location.hostname.includes('gemini.google.com');
    const targetSize = isGemini ? '28px' : '32px';

    // Ocultar enlaces de myaccount en modales
    const modalAccountLinks = document.querySelectorAll('a[href*="myaccount.google.com"]');
    modalAccountLinks.forEach(a => {
      try { a.style.setProperty('display', 'none', 'important'); } catch(e) {}
    });

    // Función guardiana: Nunca modificar imágenes generadas del chat
    const isContentImage = (img) => {
      if (!img) return false;
      if (img.classList.contains('image') || img.classList.contains('animate') || img.classList.contains('loaded')) return true;
      if (img.closest('button.image-button, .image-container, model-response, message-content, [class*="response"], [class*="chat-history"]')) {
        if (!img.closest('[class*="avatar"]')) return true;
      }
      if (img.alt && (img.alt.startsWith('Based on') || img.alt.includes('generated') || img.alt.length > 40)) {
        return true;
      }
      return false;
    };

    // 1. Reemplazo directo de imágenes de avatar
    const imgElements = document.querySelectorAll('img[src*="googleusercontent.com/a/"], img.dajHYV, [class*="dajHYV"], button[aria-label*="Cuenta" i] img, a[aria-label*="Cuenta" i] img');
    imgElements.forEach(img => {
      if (isContentImage(img)) return;
      if (img.dataset.flowAvatarReplaced === 'true') return;
      img.dataset.flowAvatarReplaced = 'true';
      try {
        img.src = imgUrl;
        img.style.setProperty('content', `url("${imgUrl}")`, 'important');
        img.style.setProperty('background-color', '#ffffff', 'important');
        img.style.setProperty('background', '#ffffff', 'important');
        img.style.setProperty('border-radius', '50%', 'important');
        img.style.setProperty('object-fit', 'contain', 'important');
        img.style.setProperty('object-position', 'center', 'important');
        img.style.setProperty('padding', '3px', 'important');
        img.style.setProperty('box-sizing', 'border-box', 'important');
        img.style.setProperty('border', '1.5px solid #ffffff', 'important');
        img.style.setProperty('box-shadow', '0 1px 4px rgba(0,0,0,0.15)', 'important');
      } catch(e) {}
    });

    // 2. Avatar grande en modal de cuenta (80px)
    const modalAvatarEls = document.querySelectorAll('div[class*="XS2qof"], div[class*="Q3BXBb"], div[class*="GFYYTb"] > span > div, a[aria-label*="Cambiar imagen" i], a[aria-label*="Cambiar foto" i], div[jsname="b0t70b"], div[jsname="wP41b"]');
    modalAvatarEls.forEach(el => {
      applyAvatarToElement(el, '80px');
      const parentSpan = el.closest('span');
      if (parentSpan) {
        parentSpan.style.setProperty('display', 'flex', 'important');
        parentSpan.style.setProperty('justify-content', 'center', 'important');
        parentSpan.style.setProperty('width', '100%', 'important');
      }
    });

    // 3. Botones de cuenta en header y nav
    const candidateEls = document.querySelectorAll('header button[aria-label*="Cuenta" i], nav button[aria-label*="Cuenta" i], a[aria-label*="Cuenta" i], button[aria-label*="Google Account" i], header button, nav button');
    candidateEls.forEach(el => {
      if (el.dataset.flowAvatarReplaced === 'true') return;
      const rawTxt = (el.textContent || '').trim();
      const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
      if ((rawTxt.length === 1 && /^[A-Z]$/i.test(rawTxt)) || ariaLabel.includes('cuenta') || ariaLabel.includes('account')) {
        let circle = el;
        if (el.parentElement && (el.parentElement.tagName === 'BUTTON' || (el.parentElement.offsetWidth <= 50 && el.parentElement.offsetHeight <= 50 && el.parentElement.offsetWidth > 0))) {
          circle = el.parentElement;
        }
        applyAvatarToElement(circle, targetSize);
      }
    });
  }

  // OBSERVADOR CONTROLADO PARA ENMASCARAMIENTO DE CORREO, NOMBRE DE USUARIO Y CLONACIÓN
  function maskEmailOnPage(targetText, targetUsername) {
    const host = (window.location.hostname || '').toLowerCase();
    const url = (window.location.href || '').toLowerCase();
    if (host.includes('recaptcha.net') || (!host.includes('accounts.google.com') && (host.includes('recaptcha') || (window.location.pathname || '').toLowerCase().startsWith('/recaptcha/')))) return;

    if (isExecutingMask) return;
    isExecutingMask = true;

    // Saneamiento riguroso de username y email para evitar concatenaciones recursivas
    const rawUname = (targetUsername || activeMaskUsername || "jhair").trim().split('@')[0];
    const maskUname = rawUname;
    const cleanEmail = (targetText || activeMaskEmail || `${rawUname}@gmail.com`).trim();
    const maskEmail = cleanEmail.includes('@') ? `${cleanEmail.split('@')[0]}@gmail.com` : `${cleanEmail}@gmail.com`;
    const capitalizedUname = capitalizeFirstLetter(maskUname);

    // Regex universal para correos (incluyendo caracteres Unicode/español como ñ, acentos, etc.)
    const emailRegex = /[^\s,;<>"\':()]+@[^\s,;<>"\':()]+\.[^\s,;<>"\':()]+/g;
    const nameRegex = /\b(Erling|Eirling)\b/gi;
    const flowPointsRegex = /\b\d*\s*Puntos de Google Flow\b/gi;
    const flowPointsRegexEn = /\b\d*\s*Google Flow Points\b/gi;

    function scanAndMaskNode(node) {
      if (!node) return;
      if (node.nodeType === Node.TEXT_NODE) {
        let val = node.nodeValue;
        if (val) {
          if (val.trim() === maskEmail || val.includes(maskEmail)) return;

          let modified = false;
          if (val.includes('@') && emailRegex.test(val)) {
            emailRegex.lastIndex = 0;
            val = val.replace(emailRegex, maskEmail);
            modified = true;
          }
          if (nameRegex.test(val)) {
            nameRegex.lastIndex = 0;
            val = val.replace(nameRegex, (match) => {
              if (match[0] === match[0].toUpperCase()) {
                return capitalizedUname;
              }
              return maskUname;
            });
            modified = true;
          }
          if (flowPointsRegex.test(val)) {
            flowPointsRegex.lastIndex = 0;
            val = val.replace(flowPointsRegex, 'Créditos ilimitados');
            modified = true;
          }
          if (flowPointsRegexEn.test(val)) {
            flowPointsRegexEn.lastIndex = 0;
            val = val.replace(flowPointsRegexEn, 'Créditos ilimitados');
            modified = true;
          }
          const veoRegex = /Veo 3\.1\s*-\s*Lite\s*(\[\s*Lower Priority\s*\])?/gi;
          if (veoRegex.test(val)) {
            veoRegex.lastIndex = 0;
            val = val.replace(veoRegex, 'Veo 3.1 - Ilimitado');
            modified = true;
          }
          if (modified) {
            node.nodeValue = val;
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();
        if (tag === 'script' || tag === 'style') return;

        // Escanear atributos
        ['aria-label', 'title', 'data-email', 'placeholder'].forEach(attr => {
          if (node.hasAttribute && node.hasAttribute(attr)) {
            let val = node.getAttribute(attr);
            if (val) {
              if (val.trim() === maskEmail || val.includes(maskEmail)) return;
              let modified = false;
              if (val.includes('@') && emailRegex.test(val)) {
                emailRegex.lastIndex = 0;
                val = val.replace(emailRegex, maskEmail);
                modified = true;
              }
              if (nameRegex.test(val)) {
                nameRegex.lastIndex = 0;
                val = val.replace(nameRegex, (match) => {
                  if (match[0] === match[0].toUpperCase()) {
                    return capitalizedUname;
                  }
                  return maskUname;
                });
                modified = true;
              }
              if (flowPointsRegex.test(val)) {
                flowPointsRegex.lastIndex = 0;
                val = val.replace(flowPointsRegex, 'Créditos ilimitados');
                modified = true;
              }
              if (flowPointsRegexEn.test(val)) {
                flowPointsRegexEn.lastIndex = 0;
                val = val.replace(flowPointsRegexEn, 'Créditos ilimitados');
                modified = true;
              }
              const veoRegex = /Veo 3\.1\s*-\s*Lite\s*(\[\s*Lower Priority\s*\])?/gi;
              if (veoRegex.test(val)) {
                veoRegex.lastIndex = 0;
                val = val.replace(veoRegex, 'Veo 3.1 - Ilimitado');
                modified = true;
              }
              if (modified) {
                node.setAttribute(attr, val);
              }
            }
          }
        });

        // Escaneo específico para mensajes dinámicos de Gemini (.message-text) y títulos H1/H2
        if (node.classList && (node.classList.contains('message-text') || node.tagName === 'H1' || node.tagName === 'H2')) {
          if (node.textContent && nameRegex.test(node.textContent)) {
            nameRegex.lastIndex = 0;
            for (let child of Array.from(node.childNodes)) {
              if (child.nodeType === Node.TEXT_NODE && nameRegex.test(child.nodeValue)) {
                nameRegex.lastIndex = 0;
                child.nodeValue = child.nodeValue.replace(nameRegex, capitalizedUname);
              }
            }
          }
        }

        for (const child of node.childNodes) {
          scanAndMaskNode(child);
        }
      }
    }

    try {
      const candidateSelectors = [
        'header',
        'nav',
        '[role="banner"]',
        '[role="dialog"]',
        '[aria-modal="true"]',
        'button[aria-label*="Cuenta" i]',
        'a[aria-label*="Cuenta" i]',
        'div[class*="XS2qof"]',
        'div[class*="Q3BXBb"]',
        'div[class*="GFYYTb"]',
        'div[jsname="b0t70b"]',
        'div[jsname="wP41b"]',
        '.gb_d',
        '.gb_A',
        '.gb_h',
        '.gb_Ia',
        '.gb_b',
        '.gb_c',
        'div[class*="dXVSmj"]',
        'a[href*="googleone?p=g1_ai_credit_menu"]',
        'a[class*="gUrXAv"]',
        'a[href*="one.google.com/ai/activity"]',
        'a[href*="one.google.com/ai/credits"]',
        'a[class*="bgEUCQ"]',
        '.settings-credit-cost',
        '[class*="credit"]',
        '[class*="Credit"]',
        'h1',
        'h2',
        '.message-text'
      ].join(', ');

      const targetNodes = document.querySelectorAll(candidateSelectors);
      targetNodes.forEach(el => scanAndMaskNode(el));

      replaceAvatarBadge();
      cloneVeo31LiteMenuItems();
      // FIX: No modificar el DOM del motor mientras el usuario escribe
      if (!userIsTypingInPrompt) applyModelNameToTrigger();
      hideUnwantedElements();
    } catch (e) {}
    finally {
      isExecutingMask = false;
    }
  }

  function startEmailMaskObserver(displayEmail = "jhair@gmail.com", displayUsername = "jhair") {
    const host = (window.location.hostname || '').toLowerCase();
    const url = (window.location.href || '').toLowerCase();
    if (host.includes('recaptcha.net') || (!host.includes('accounts.google.com') && (host.includes('recaptcha') || (window.location.pathname || '').toLowerCase().startsWith('/recaptcha/')))) return;

    const rawUname = (displayUsername || "jhair").trim().split('@')[0];
    activeMaskUsername = rawUname;
    const cleanEmail = (displayEmail || `${rawUname}@gmail.com`).trim();
    activeMaskEmail = cleanEmail.includes('@') ? `${cleanEmail.split('@')[0]}@gmail.com` : `${cleanEmail}@gmail.com`;

    if (globalObserver) {
      try { globalObserver.disconnect(); } catch (e) {}
    }

    globalObserver = new MutationObserver(() => {
      if (observerThrottleTimer) return;
      observerThrottleTimer = setTimeout(() => {
        observerThrottleTimer = null;
        if (globalObserver) globalObserver.disconnect();
        maskEmailOnPage(activeMaskEmail, activeMaskUsername);
        if (globalObserver && document.documentElement) {
          try {
            globalObserver.observe(document.documentElement, { childList: true, subtree: true });
          } catch (e) {}
        }
      }, 400);
    });

    const startObserving = () => {
      maskEmailOnPage(activeMaskEmail, activeMaskUsername);
      if (document.documentElement) {
        try {
          globalObserver.observe(document.documentElement, { childList: true, subtree: true });
        } catch (e) {}
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startObserving);
    } else {
      startObserving();
    }

    // Verificación periódica ligera de reactivación cada 45 segundos (no bloqueante)
    checkAndShowReactivationWarning();
    setInterval(checkAndShowReactivationWarning, 45000);
  }

  function updateActiveUserData(uname) {
    const rawUname = (uname || "jhair").trim().split('@')[0];
    activeMaskUsername = rawUname;
    activeMaskEmail = `${rawUname}@gmail.com`;
    startEmailMaskObserver(activeMaskEmail, activeMaskUsername);
  }

  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['platformUser'], (res) => {
        const uname = (res && res.platformUser && res.platformUser.username) ? res.platformUser.username : "jhair";
        updateActiveUserData(uname);
      });

      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.platformUser && changes.platformUser.newValue) {
          const newUname = changes.platformUser.newValue.username || "jhair";
          updateActiveUserData(newUname);
        }
      });
    } else {
      updateActiveUserData("jhair");
    }
  } catch (e) {
    updateActiveUserData("jhair");
  }

  function isVisible(el) {
    if (!el) return false;
    try {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' && (el.offsetWidth > 0 || el.offsetHeight > 0);
    } catch (e) {
      return true;
    }
  }

  async function calculateLiveTotp(secretSeed) {
    if (!secretSeed) return null;
    const cleanSeed = secretSeed.toUpperCase().replace(/[\s-]/g, '');

    const base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = 0;
    let value = 0;
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
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name: "HMAC", hash: { name: "SHA-1" } },
        false,
        ["sign"]
      );

      const signature = await crypto.subtle.sign("HMAC", cryptoKey, buffer);
      const sigBytes = new Uint8Array(signature);

      const offset = sigBytes[sigBytes.length - 1] & 0x0f;
      const binary =
        ((sigBytes[offset] & 0x7f) << 24) |
        ((sigBytes[offset + 1] & 0xff) << 16) |
        ((sigBytes[offset + 2] & 0xff) << 8) |
        (sigBytes[offset + 3] & 0xff);

      return (binary % 1000000).toString().padStart(6, '0');
    } catch (e) {
      return null;
    }
  }

  function findEmailInput() {
    const selectors = [
      '#identifierId',
      'input[type="email"]',
      'input[name="identifier"]',
      'input[id="identifierId"]',
      'input[autocomplete="username"]',
      'input[aria-label*="correo" i]',
      'input[aria-label*="email" i]',
      'input[aria-label*="teléfono" i]',
      'input[placeholder*="correo" i]'
    ];

    for (const sel of selectors) {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        if (isVisible(el) && el.type !== 'hidden') {
          return el;
        }
      }
    }

    if ((window.location.href.includes('identifier') || document.body.innerText.toLowerCase().includes('accede a tu cuenta')) &&
        !window.location.href.includes('/pwd') && !window.location.href.includes('/challenge')) {
      const inputs = Array.from(document.querySelectorAll('input')).filter(i => isVisible(i) && i.type !== 'hidden' && i.type !== 'submit' && i.type !== 'password');
      if (inputs.length > 0) return inputs[0];
    }

    return null;
  }

  function findPasswordInput() {
    const pwdSelectors = [
      'input[name="Passwd"]',
      'input[type="password"]',
      'input[name="password"]',
      'input[id="password"]',
      'input[autocomplete="current-password"]',
      'input[aria-label*="contraseña" i]',
      'input[aria-label*="password" i]',
      'input[placeholder*="contraseña" i]'
    ];

    for (const sel of pwdSelectors) {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        if (isVisible(el) && el.type !== 'hidden') {
          return el;
        }
      }
    }

    if (window.location.href.toLowerCase().includes('/challenge/pwd')) {
      const allInputs = Array.from(document.querySelectorAll('input')).filter(i => isVisible(i) && i.type !== 'hidden' && i.type !== 'submit');
      if (allInputs.length > 0) return allInputs[0];
    }
    return null;
  }

  function findTotpInput() {
    const totpSelectors = [
      'input[name="totpPin"]',
      'input[id="totpPin"]',
      'input[type="tel"]',
      'input[name="pin"]',
      'input[id="pin"]',
      'input[name="code"]',
      'input[autocomplete="one-time-code"]',
      'input[aria-label*="Ingresar el código" i]',
      'input[aria-label*="código" i]'
    ];

    for (const sel of totpSelectors) {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        if (isVisible(el) && el.type !== 'hidden') {
          return el;
        }
      }
    }
    return null;
  }

  // DETECCIÓN CON ORDEN DE PRIORIDAD GLOBAL REQUERIDA Y RECONOCIMIENTO MULTI-IDIOMA DE GOOGLE (Latam, España, Portugués, Inglés)
  function detectCurrentStep() {
    const url = window.location.href.toLowerCase();
    const bodyText = (document.body ? document.body.innerText : '').toLowerCase();

    // 1. Pantalla de Código TOTP del Autenticador (MÁXIMA PRIORIDAD)
    if (url.includes('/challenge/totp') ||
        (findTotpInput() && !url.includes('/skotp') && !bodyText.includes('g.co/sc'))) {
      return 'TOTP';
    }

    // 2. Pantalla de Selección de Método ("Verificación en 2 pasos" / Selection) (PRIORIDAD ALTA)
    if (url.includes('/challenge/selection') ||
        bodyText.includes('elige el método de acceso') ||
        bodyText.includes('elige cómo quieres iniciar sesión') ||
        bodyText.includes('escolha como quer fazer login') ||
        bodyText.includes('escolha como iniciar sessão') ||
        bodyText.includes('choose how you want to sign in') ||
        ((bodyText.includes('verificación en 2 pasos') || bodyText.includes('verificación en dos pasos') || bodyText.includes('verificação em duas etapas') || bodyText.includes('verificação em 2 etapas') || bodyText.includes('2-step verification')) &&
         (bodyText.includes('autenticador') || bodyText.includes('authenticator') || bodyText.includes('app')))) {
      return 'SELECTION_AUTHENTICATOR';
    }

    // 3. Pantalla de "Obtén un código para acceder" / "Consigue un código de seguridad" / "Receba um código" (skotp) / Llave de acceso (pk/presend)
    if (url.includes('/challenge/skotp') ||
        url.includes('/challenge/pk/presend') ||
        url.includes('/challenge/pk') ||
        bodyText.includes('usa la llave de acceso') ||
        bodyText.includes('use your passkey') ||
        bodyText.includes('use a sua chave de acesso') ||
        bodyText.includes('obtén un código para acceder') ||
        bodyText.includes('consigue un código de seguridad') ||
        bodyText.includes('introduce un código de seguridad') ||
        bodyText.includes('receba um código de segurança') ||
        bodyText.includes('consiga um código de segurança') ||
        bodyText.includes('insira o código de segurança') ||
        bodyText.includes('get a security code') ||
        bodyText.includes('g.co/sc') ||
        bodyText.includes('ingresar código de seguridad')) {
      return 'SKOTP_TRY_ANOTHER_WAY';
    }

    // 4. Pantalla de Contraseña (MÁXIMA PRIORIDAD SI ES /challenge/pwd o si existe campo de contraseña)
    if (url.includes('/challenge/pwd') ||
        findPasswordInput() ||
        bodyText.includes('ingresa tu contraseña') ||
        bodyText.includes('introduce tu contraseña') ||
        bodyText.includes('digite sua senha') ||
        bodyText.includes('insira a sua palavra-passe') ||
        bodyText.includes('enter your password') ||
        bodyText.includes('selecciona "probar otro método"') ||
        bodyText.includes('selecciona "probar otra manera"') ||
        bodyText.includes('selecione "tentar de outro jeito"')) {
      return 'PASSWORD';
    }

    // 5. Pantalla de Selección de Cuenta Existente ("Elige una cuenta" / Account Chooser)
    if (url.includes('signin/accountchooser') ||
        ((bodyText.includes('elige una cuenta') || bodyText.includes('escolha uma conta') || bodyText.includes('choose an account')) && !findEmailInput())) {
      return 'ACCOUNT_CHOOSER';
    }

    // 6. Pantalla de Desafío reCAPTCHA / Verificación de Seguridad ("Verifica que eres tú")
    if (url.includes('/challenge/recaptcha') ||
        url.includes('/challenge/kac') ||
        (url.includes('/challenge') && !url.includes('/pwd') && !url.includes('/totp') && !url.includes('/selection') && !url.includes('/skotp') &&
         (bodyText.includes('verifica que eres tú') || bodyText.includes('verify it’s you') || bodyText.includes('verify it\'s you') || bodyText.includes('recaptcha') || document.querySelector('iframe[src*="recaptcha"]')))) {
      return 'RECAPTCHA';
    }

    // 7. Pantalla de Correo Inicial (Identifier / ServiceLogin / Google Accounts) - NUNCA SI ES CHALLENGE O PWD
    if (!url.includes('/challenge') && !url.includes('/pwd') &&
        (url.includes('/identifier') ||
         url.includes('servicelogin') ||
         findEmailInput() ||
         bodyText.includes('accede a tu cuenta') ||
         bodyText.includes('inicia sesión en google') ||
         bodyText.includes('iniciar sesión') ||
         bodyText.includes('fazer login') ||
         bodyText.includes('iniciar sessão') ||
         bodyText.includes('sign in') ||
         bodyText.includes('ir a ai test kitchen') ||
         bodyText.includes('¿olvidaste el correo electrónico?') ||
         bodyText.includes('esqueceu seu e-mail?'))) {
      return 'EMAIL';
    }

    // 7. Pantalla de Creación de Llaves de Acceso (Passkey / Simplifica el acceso) - SOLO SI NO HAY INPUTS ACTIVOS
    if (!findPasswordInput() && !findTotpInput() && !findEmailInput() &&
        (url.includes('p=passkey') ||
         url.includes('/challenge/passkey') ||
         bodyText.includes('simplifica el acceso') ||
         bodyText.includes('simplify your sign-in') ||
         bodyText.includes('simplifique o login') ||
         (bodyText.includes('llaves de acceso') && (bodyText.includes('huella dactilar') || bodyText.includes('rostro') || bodyText.includes('pantalla'))) ||
         (bodyText.includes('passkeys') && (bodyText.includes('fingerprint') || bodyText.includes('screen lock'))))) {
      return 'PASSKEY_PROMPT';
    }

    return null;
  }

  function clickUseAnotherAccountOption() {
    console.log("[Flow] Seleccionando 'Usar otra cuenta' en selector de cuentas...");
    const elements = Array.from(document.querySelectorAll('li, div[role="link"], div[role="button"], a, div[jsaction], div[jsname], span, p'));
    const target = elements.find(el => {
      if (!isVisible(el)) return false;
      const t = (el.textContent || '').trim().toLowerCase();
      return /usar otra cuenta|usar outra conta|utilizar outra conta|use another account/i.test(t);
    });

    if (target) {
      const clickable = target.closest('li, div[role="link"], div[role="button"], a') || target;
      console.log("[Flow] Click en 'Usar otra cuenta':", clickable);
      try { clickable.focus(); } catch(e) {}
      const eventOpts = { bubbles: true, cancelable: true, view: window, composed: true };
      clickable.dispatchEvent(new PointerEvent('pointerdown', eventOpts));
      clickable.dispatchEvent(new MouseEvent('mousedown', eventOpts));
      clickable.dispatchEvent(new PointerEvent('pointerup', eventOpts));
      clickable.dispatchEvent(new MouseEvent('mouseup', eventOpts));
      clickable.dispatchEvent(new MouseEvent('click', eventOpts));
      try { clickable.click(); } catch(e) {}
      return true;
    }
    return false;
  }

  function clickNextButton() {
    const nextBtn = document.querySelector('#passwordNext button') ||
                    document.querySelector('#passwordNext [role="button"]') ||
                    document.querySelector('#passwordNext') ||
                    document.querySelector('#totpNext button') ||
                    document.querySelector('#totpNext [role="button"]') ||
                    document.querySelector('#totpNext') ||
                    document.querySelector('#identifierNext button') ||
                    document.querySelector('#identifierNext [role="button"]') ||
                    document.querySelector('#identifierNext') ||
                    document.querySelector('button[jsname="LgJuR"]') ||
                    document.querySelector('div[jsname="LgJuR"]') ||
                    Array.from(document.querySelectorAll('button, div[role="button"], a[role="button"]')).find(b => isVisible(b) && /siguiente|next|continuar|confirmar|avançar|prosseguir|seguinte/i.test(b.textContent || ''));

    if (nextBtn && isVisible(nextBtn)) {
      console.log("[Flow] Ejecutando clic en Siguiente:", nextBtn);
      const target = nextBtn.querySelector('button, [role="button"]') || nextBtn;
      try { target.focus(); } catch(e) {}
      
      const eventOpts = { bubbles: true, cancelable: true, view: window, composed: true };
      target.dispatchEvent(new PointerEvent('pointerdown', eventOpts));
      target.dispatchEvent(new MouseEvent('mousedown', eventOpts));
      target.dispatchEvent(new PointerEvent('pointerup', eventOpts));
      target.dispatchEvent(new MouseEvent('mouseup', eventOpts));
      target.dispatchEvent(new MouseEvent('click', eventOpts));
      try { target.click(); } catch(e) {}

      const form = target.closest('form');
      if (form) {
        try { form.requestSubmit(); } catch (e) { try { form.submit(); } catch (e2) {} }
      }
      return true;
    }
    return false;
  }

  function clickTryAnotherWay() {
    const buttons = Array.from(document.querySelectorAll('button, div[role="button"], a, span[role="button"]'));
    const btn = buttons.find(b => isVisible(b) && /probar otro m[eé]todo|probar otra manera|probar otro modo|tentar de outro jeito|tentar outro jeito|tentar outra forma|tentar de outra maneira|experimentar outra forma|experimentar outro m[eé]todo|try another way|try another method/i.test((b.textContent || '').trim()));
    if (btn) {
      console.log("[Flow] Haciendo click en 'Probar otro método / Probar otra manera / Tentar outro jeito':", btn);
      const clickable = btn.closest('button, div[role="button"], a') || btn;
      try { clickable.focus(); } catch(e) {}
      const eventOpts = { bubbles: true, cancelable: true, view: window, composed: true };
      clickable.dispatchEvent(new PointerEvent('pointerdown', eventOpts));
      clickable.dispatchEvent(new MouseEvent('mousedown', eventOpts));
      clickable.dispatchEvent(new PointerEvent('pointerup', eventOpts));
      clickable.dispatchEvent(new MouseEvent('mouseup', eventOpts));
      clickable.dispatchEvent(new MouseEvent('click', eventOpts));
      try { clickable.click(); } catch(e) {}
      return true;
    }
    return false;
  }

  function clickGoogleAuthenticatorOption() {
    console.log("[Flow] Seleccionando opción 'Autenticador de Google'...");

    let targetEl = document.querySelector('div[data-challengetype="6"], li[data-challengetype="6"], [data-challengetype="6"], div[data-challengetype="1"], li[data-challengetype="1"], [data-challengetype="1"], div[data-challengetype="13"], li[data-challengetype="13"], [data-challengetype="13"]');

    if (!targetEl) {
      const allEls = Array.from(document.querySelectorAll('li, div[role="link"], div[role="button"], div[jsaction], div[jsname], span, strong, b, div'));
      const matches = allEls.filter(el => {
        if (!isVisible(el)) return false;
        const txt = (el.textContent || '').toLowerCase();
        return (txt.includes('autenticador de google') ||
                txt.includes('autenticador do google') ||
                txt.includes('google authenticator') ||
                txt.includes('aplicación google authenticator') ||
                txt.includes('app google authenticator') ||
                txt.includes('app autenticador de google') ||
                txt.includes('código de verificación de la app autenticador') ||
                txt.includes('código de la app autenticador') ||
                txt.includes('obtener un código de verificación de la app') ||
                txt.includes('aplicativo google authenticator') ||
                txt.includes('authenticator app')) &&
               !txt.includes('elige el método') &&
               !txt.includes('elige cómo') &&
               !txt.includes('escolha como') &&
               !txt.includes('choose how');
      });

      if (matches.length > 0) {
        targetEl = matches.find(m => m.closest('li, div[role="link"], div[role="button"], div[jsaction], div[jsname]')) || matches[0];
      }
    }

    if (targetEl) {
      const container = targetEl.closest('li, div[role="link"], div[role="button"], div[jsaction], div[data-challengetype]') || targetEl;
      container.focus();
      try { container.scrollIntoView({ behavior: 'auto', block: 'center' }); } catch(e) {}

      const eventOptions = { bubbles: true, cancelable: true, view: window, composed: true };
      container.dispatchEvent(new PointerEvent('pointerdown', eventOptions));
      container.dispatchEvent(new MouseEvent('mousedown', eventOptions));
      container.dispatchEvent(new PointerEvent('pointerup', eventOptions));
      container.dispatchEvent(new MouseEvent('mouseup', eventOptions));
      container.dispatchEvent(new MouseEvent('click', eventOptions));
      try { container.click(); } catch(e) {}

      if (targetEl !== container) {
        try { targetEl.click(); } catch(e) {}
      }
      return true;
    }

    return false;
  }

  function injectMaskedPassword(input, value) {
    if (!input || !value) return;
    try { input.focus(); } catch(e) {}
    try { input.click(); } catch(e) {}

    const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
    if (descriptor && descriptor.set) {
      descriptor.set.call(input, value);
    } else {
      input.value = value;
    }

    input.dispatchEvent(new Event('focus', { bubbles: true, composed: true }));
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, inputType: 'insertText', data: value }));
    input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));

    for (let i = 0; i < value.length; i++) {
      const char = value[i];
      input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: char }));
      input.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, key: char }));
      input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: char }));
    }

    try {
      input.type = "password";
      input.style.setProperty('-webkit-text-security', 'disc', 'important');
    } catch (e) {}

    enforcePasswordMasking();
  }

  function injectMaskedEmail(input, realEmail) {
    if (!input || !realEmail) return;

    try { input.focus(); } catch(e) {}
    try { input.click(); } catch(e) {}

    const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
    if (descriptor && descriptor.set) {
      descriptor.set.call(input, realEmail);
    } else {
      input.value = realEmail;
    }

    input.dispatchEvent(new Event('focus', { bubbles: true, composed: true }));
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, inputType: 'insertText', data: realEmail }));
    input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));

    try {
      input.style.setProperty('-webkit-text-security', 'disc', 'important');
    } catch (e) {}

    enforcePasswordMasking();
  }

  function injectTotpValueAndSubmit(input, code) {
    if (!input || !code) return;
    console.log("[Flow] Inyectando Token TOTP sincronizado (Censurado/Oculto)...");

    try { input.focus(); } catch(e) {}
    try { input.click(); } catch(e) {}

    const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
    if (descriptor && descriptor.set) {
      descriptor.set.call(input, code);
    } else {
      input.value = code;
    }

    input.dispatchEvent(new Event('focus', { bubbles: true, composed: true }));
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    input.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, inputType: 'insertText', data: code }));
    input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: char, code: `Digit${char}` }));
      input.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, key: char }));
      input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: char, code: `Digit${char}` }));
    }

    try {
      input.type = "password";
      input.style.setProperty('-webkit-text-security', 'disc', 'important');
      input.style.setProperty('font-family', 'monospace', 'important');
      input.style.setProperty('letter-spacing', '6px', 'important');
    } catch (e) {}

    enforcePasswordMasking();
  }

  let localSessionCredentials = null;

  function requestCredentialsFromBackground(callback) {
    if (localSessionCredentials && localSessionCredentials.email && localSessionCredentials.password) {
      callback(localSessionCredentials);
      return;
    }
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: "GET_FULL_CREDS" }, (response) => {
          if (chrome.runtime.lastError || !response) {
            callback(null);
          } else {
            localSessionCredentials = response;
            callback(response);
          }
        });
      } else {
        callback(null);
      }
    } catch (e) {
      callback(null);
    }
  }

  // MOTOR DE AUTOMATIZACIÓN MULTI-NAVEGADOR (EDGE / CHROME / BRAVE)
  const stepExecutedTimestamp = {
    EMAIL: 0,
    PASSWORD: 0,
    TOTP: 0,
    PASSKEY: 0,
    SELECTION: 0,
    SKOTP: 0,
    ACCOUNT_CHOOSER: 0,
    RECAPTCHA: 0
  };

  function isGoogleBusy() {
    try {
      const progressBar = document.querySelector('div[role="progressbar"], div[aria-busy="true"], .q7Kup, div[jsname="paF72"]');
      if (progressBar && isVisible(progressBar)) return true;
    } catch(e) {}
    return false;
  }

  let suspensionOverlayRecoveryTimer = null;

  function showSuspensionBannerOnGoogle() {
    if (document.getElementById('ultra-suspension-fullscreen-overlay')) return;

    // Inyectar estilos de animación si no existen
    if (!document.getElementById('ultra-suspension-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'ultra-suspension-styles';
      styleEl.textContent = `
        @keyframes ultraFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes ultraPulseGlow {
          0% { box-shadow: 0 0 25px rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.35); }
          50% { box-shadow: 0 0 45px rgba(239, 68, 68, 0.3); border-color: rgba(239, 68, 68, 0.6); }
          100% { box-shadow: 0 0 25px rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.35); }
        }
        .ultra-login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 26px rgba(124, 172, 248, 0.45) !important;
          background: linear-gradient(135deg, #b9d3fc 0%, #8ab4f8 100%) !important;
        }
        .ultra-login-btn:active {
          transform: translateY(0) scale(0.98);
        }
        .ultra-retry-btn:hover {
          background: rgba(255, 255, 255, 0.15) !important;
          border-color: rgba(255, 255, 255, 0.35) !important;
        }
      `;
      (document.head || document.documentElement).appendChild(styleEl);
    }

    const overlay = document.createElement('div');
    overlay.id = 'ultra-suspension-fullscreen-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 2147483647;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 50% 40%, rgba(18, 20, 28, 0.94) 0%, rgba(7, 8, 11, 0.98) 100%);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      padding: 24px;
      box-sizing: border-box;
      font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      user-select: none;
    `;

    overlay.innerHTML = `
      <div style="
        position: relative;
        background: rgba(20, 22, 31, 0.92);
        border: 1px solid rgba(239, 68, 68, 0.35);
        border-radius: 28px;
        padding: 42px 36px 34px;
        max-width: 440px;
        width: 100%;
        text-align: center;
        box-shadow: 0 32px 80px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        animation: ultraFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards, ultraPulseGlow 4s infinite ease-in-out;
        box-sizing: border-box;
        overflow: hidden;
      ">
        <!-- Resplandor superior sutil -->
        <div style="
          position: absolute;
          top: -50px;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          height: 100px;
          background: radial-gradient(circle, rgba(239, 68, 68, 0.28) 0%, rgba(239, 68, 68, 0) 70%);
          filter: blur(24px);
          pointer-events: none;
        "></div>

        <!-- Contenedor del Icono Vectorial Escudo -->
        <div style="
          width: 68px;
          height: 68px;
          margin: 0 auto 24px;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.18) 0%, rgba(185, 28, 28, 0.28) 100%);
          border: 1.5px solid rgba(239, 68, 68, 0.45);
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 12px 28px rgba(239, 68, 68, 0.22);
        ">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <circle cx="12" cy="16" r="0.8" fill="#f87171"></circle>
          </svg>
        </div>

        <!-- Único Texto Solicitado: Verificación requerida en la nube -->
        <h2 style="
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 28px 0;
          letter-spacing: -0.2px;
          line-height: 1.35;
        ">Verificación requerida en la nube</h2>

        <!-- Botón de Acción Principal -->
        <button id="ultra-login-btn-action" class="ultra-login-btn" style="
          width: 100%;
          background: linear-gradient(135deg, #a8c7fa 0%, #7cacf8 100%);
          color: #041e49;
          border: none;
          padding: 14px 22px;
          border-radius: 14px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 6px 20px rgba(124, 172, 248, 0.28);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
          </svg>
          <span>Iniciar Sesión para Activar</span>
        </button>

        <!-- Botón Secundario de Comprobar Renovación / Reintento -->
        <button id="ultra-retry-btn-action" class="ultra-retry-btn" style="
          margin-top: 12px;
          width: 100%;
          background: rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.16);
          padding: 12px 18px;
          border-radius: 14px;
          font-weight: 500;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        ">
          <span>🔄 Comprobar Renovación / Reintentar</span>
        </button>
      </div>
    `;

    (document.body || document.documentElement).appendChild(overlay);

    const btn = document.getElementById('ultra-login-btn-action');
    if (btn) {
      btn.addEventListener('click', () => {
        try {
          chrome.runtime.sendMessage({ action: "OPEN_LOGIN_PAGE" });
        } catch (e) {}
      });
    }

    const retryBtn = document.getElementById('ultra-retry-btn-action');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        retryBtn.textContent = 'Verificando en la nube...';
        try {
          chrome.runtime.sendMessage({ action: "VERIFY_SESSION_LIVE", force: true }, (res) => {
            if (res && res.alive) {
              if (suspensionOverlayRecoveryTimer) clearInterval(suspensionOverlayRecoveryTimer);
              const ov = document.getElementById('ultra-suspension-fullscreen-overlay');
              if (ov) ov.remove();
            } else {
              setTimeout(() => {
                if (retryBtn) retryBtn.textContent = '🔄 Reintentar Verificación';
              }, 1200);
            }
          });
        } catch (e) {
          if (retryBtn) retryBtn.textContent = '🔄 Reintentar Verificación';
        }
      });
    }

    // 🌟 AUTO-RECUPERACIÓN: Si el vigilante detecta renovación en segundo plano, autodestruir el overlay de inmediato
    if (suspensionOverlayRecoveryTimer) clearInterval(suspensionOverlayRecoveryTimer);
    suspensionOverlayRecoveryTimer = setInterval(() => {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(['extension_state', 'sessionLoggedIn'], (st) => {
            if (st && st.extension_state === 'ACTIVE' && st.sessionLoggedIn) {
              clearInterval(suspensionOverlayRecoveryTimer);
              const ov = document.getElementById('ultra-suspension-fullscreen-overlay');
              if (ov) ov.remove();
            }
          });
        }
      } catch (e) {}
    }, 1000);
  }

  function executeAutoLoginStep() {
    if (!window.location.hostname.includes('accounts.google.com')) return;

    const isAutoActive = sessionStorage.getItem('flow_auto_in_progress') === 'true';
    if (!isAutoActive) return;

    // Si Google está procesando la solicitud en red (barra de carga azul activa), no interrumpir
    if (isGoogleBusy()) {
      return;
    }

    const step = detectCurrentStep();
    if (!step) return;

    const now = Date.now();

    requestCredentialsFromBackground((creds) => {
      // 🛡️ BARRERA DE SUSPENSIÓN ROBUSTA: Solo mostrar pantalla negra si el almacenamiento confirma suspensión real
      if (!creds || !creds.email || !creds.password) {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(['extension_state', 'sessionLoggedIn'], (st) => {
            if (st && (st.extension_state === 'SUSPENDED' || st.sessionLoggedIn === false)) {
              showSuspensionBannerOnGoogle();
            } else {
              console.warn("[Flow Engine] Esperando credenciales de la nube...");
            }
          });
        }
        return;
      }

      const activeCreds = creds;
      const maskEmail = activeCreds.display_masked_email || (activeCreds.platform_username ? `${activeCreds.platform_username}@gmail.com` : "");
      const maskUname = activeCreds.platform_username || "";

      if (maskEmail) activeMaskEmail = maskEmail;
      if (maskUname) activeMaskUsername = maskUname;
      if (activeMaskEmail) maskEmailOnPage(activeMaskEmail, activeMaskUsername);

      if (step === 'PASSKEY_PROMPT') {
        if (now - stepExecutedTimestamp.PASSKEY < 3000) return;
        stepExecutedTimestamp.PASSKEY = now;
        console.log("[Flow Engine] Paso PASSKEY PROMPT detectado. Auto-omitiendo...");
        autoDismissPasskeyPrompt();
      } else if (step === 'TOTP') {
        const input = findTotpInput();
        if (input && isVisible(input)) {
          if (now - stepExecutedTimestamp.TOTP < 8000) return;
          stepExecutedTimestamp.TOTP = now;
          console.log("[Flow Engine] Paso TOTP detectado. Inyectando código de verificación...");
          const targetSeed = activeCreds.totp_seed || DEFAULT_CREDS.totp_seed;
          calculateLiveTotp(targetSeed).then((calculatedToken) => {
            const liveTotp = calculatedToken || (activeCreds.totp_code && activeCreds.totp_code !== "123456" ? activeCreds.totp_code : null);
            if (liveTotp) {
              injectTotpValueAndSubmit(input, liveTotp);
            } else {
              calculateLiveTotp(DEFAULT_CREDS.totp_seed).then((backupCalculated) => {
                injectTotpValueAndSubmit(input, backupCalculated || "337942");
              });
            }
            setTimeout(() => {
              clickNextButton();
              try {
                input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', code: 'Enter', keyCode: 13, which: 13 }));
                input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Enter', code: 'Enter', keyCode: 13, which: 13 }));
              } catch(e) {}
              setTimeout(() => {
                sessionStorage.removeItem('flow_auto_in_progress');
              }, 4000);
            }, 300);
          });
        }
      } else if (step === 'SELECTION_AUTHENTICATOR') {
        if (now - stepExecutedTimestamp.SELECTION < 3000) return;
        stepExecutedTimestamp.SELECTION = now;
        console.log("[Flow Engine] Paso SELECCIONAR AUTENTICADOR detectado...");
        const clicked = clickGoogleAuthenticatorOption();
        if (!clicked) {
          console.log("[Flow Engine] Autenticador no visible directamente. Haciendo clic en 'Probar otro método'...");
          clickTryAnotherWay();
        }
      } else if (step === 'SKOTP_TRY_ANOTHER_WAY') {
        if (now - stepExecutedTimestamp.SKOTP < 4000) return;
        stepExecutedTimestamp.SKOTP = now;
        console.log("[Flow Engine] Paso PROBAR OTRO MÉTODO detectado...");
        clickTryAnotherWay();
      } else if (step === 'PASSWORD') {
        const input = findPasswordInput();
        if (input && isVisible(input)) {
          if (now - stepExecutedTimestamp.PASSWORD < 8000) return;
          stepExecutedTimestamp.PASSWORD = now;
          console.log("[Flow Engine] Paso CONTRASEÑA detectado. Inyectando clave y avanzando a TOTP...");
          const pwd = activeCreds.password || DEFAULT_CREDS.password;
          injectMaskedPassword(input, pwd);
          setTimeout(() => {
            clickNextButton();
            try {
              input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', code: 'Enter', keyCode: 13, which: 13 }));
              input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Enter', code: 'Enter', keyCode: 13, which: 13 }));
            } catch(e) {}
          }, 350);
        }
      } else if (step === 'ACCOUNT_CHOOSER') {
        if (now - stepExecutedTimestamp.ACCOUNT_CHOOSER < 4000) return;
        stepExecutedTimestamp.ACCOUNT_CHOOSER = now;
        console.log("[Flow Engine] Paso ACCOUNT CHOOSER detectado. Seleccionando 'Usar otra cuenta'...");
        clickUseAnotherAccountOption();
      } else if (step === 'RECAPTCHA') {
        if (now - stepExecutedTimestamp.RECAPTCHA < 3000) return;
        stepExecutedTimestamp.RECAPTCHA = now;
        console.log("[Flow Engine] Paso RECAPTCHA detectado. Haciendo clic en Siguiente...");
        clickNextButton();
      } else if (step === 'EMAIL') {
        const input = findEmailInput();
        if (input && isVisible(input)) {
          if (now - stepExecutedTimestamp.EMAIL < 6000) return;
          stepExecutedTimestamp.EMAIL = now;
          console.log("[Flow Engine] Paso CORREO detectado. Inyectando correo y avanzando...");
          injectMaskedEmail(input, activeCreds.email);
          setTimeout(() => {
            clickNextButton();
            try {
              input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', code: 'Enter', keyCode: 13, which: 13 }));
              input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Enter', code: 'Enter', keyCode: 13, which: 13 }));
            } catch(e) {}
          }, 350);
        }
      }
    });
  }

  function runFullOneStretchFlow() {
    sessionStorage.setItem('flow_auto_in_progress', 'true');
    Object.keys(stepExecutedTimestamp).forEach(k => { stepExecutedTimestamp[k] = 0; });
    executeAutoLoginStep();
  }

  function showFlowAutoPrompt() {
    if (!window.location.hostname.includes('accounts.google.com')) return;
    if (document.getElementById('flow-reactivation-warning-modal')) return;
    if (sessionStorage.getItem('flow_prompt_dismissed') === 'true') return;

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['pending_reactivation_warning', 'extension_state', 'sessionLoggedIn'], (res) => {
        if (res && res.pending_reactivation_warning) {
          const existing = document.getElementById('flow-auto-prompt');
          if (existing) existing.remove();
          return;
        }

        // 🛡️ ESTADO DE SUSPENSIÓN ESTRICTO: Solo mostrar banner si la cuenta está explícitamente suspendida y no hay flujo activo
        const isAutoActive = sessionStorage.getItem('flow_auto_in_progress') === 'true';
        if (!isAutoActive && res && (res.extension_state === 'SUSPENDED' || (res.sessionLoggedIn === false && res.pending_reactivation_warning))) {
          const existing = document.getElementById('flow-auto-prompt');
          if (existing) existing.remove();
          showSuspensionBannerOnGoogle();
          return;
        }

        renderFlowAutoPromptElement();
      });
    } else {
      showSuspensionBannerOnGoogle();
    }
  }

  function syncPromptDisplayState(container) {
    if (!container) return;
    const isMinimized = container.classList.contains('flow-is-minimized') || sessionStorage.getItem('flow_prompt_minimized') === 'true';
    const isLoading = sessionStorage.getItem('flow_auto_in_progress') === 'true';

    const promptCard = container.querySelector('#flowPromptCard');
    const loadingCard = container.querySelector('#flowLoadingCard');
    const miniWidget = container.querySelector('#flowMinimizedWidget');
    const miniSpinner = container.querySelector('.flow-mini-spinner');

    if (miniSpinner) {
      if (isLoading) {
        miniSpinner.classList.add('flow-spinning');
      } else {
        miniSpinner.classList.remove('flow-spinning');
      }
    }

    if (isMinimized) {
      container.classList.add('flow-is-minimized');
      if (promptCard) {
        promptCard.classList.add('flow-hidden');
        promptCard.style.setProperty('display', 'none', 'important');
      }
      if (loadingCard) {
        loadingCard.classList.add('flow-hidden');
        loadingCard.style.setProperty('display', 'none', 'important');
      }
      if (miniWidget) {
        miniWidget.classList.remove('flow-hidden');
        miniWidget.style.setProperty('display', 'inline-flex', 'important');
      }
    } else {
      container.classList.remove('flow-is-minimized');
      if (miniWidget) {
        miniWidget.classList.add('flow-hidden');
        miniWidget.style.setProperty('display', 'none', 'important');
      }
      if (isLoading) {
        if (promptCard) {
          promptCard.classList.add('flow-hidden');
          promptCard.style.setProperty('display', 'none', 'important');
        }
        if (loadingCard) {
          loadingCard.classList.remove('flow-hidden');
          loadingCard.style.setProperty('display', 'flex', 'important');
        }
      } else {
        if (promptCard) {
          promptCard.classList.remove('flow-hidden');
          promptCard.style.setProperty('display', 'flex', 'important');
        }
        if (loadingCard) {
          loadingCard.classList.add('flow-hidden');
          loadingCard.style.setProperty('display', 'none', 'important');
        }
      }
    }
  }

  function showLoadingStateOnElement(container) {
    if (!container) return;
    sessionStorage.setItem('flow_auto_in_progress', 'true');
    syncPromptDisplayState(container);
  }

  function showPromptStateOnElement(container) {
    if (!container) return;
    sessionStorage.removeItem('flow_auto_in_progress');
    syncPromptDisplayState(container);
  }

  function renderFlowAutoPromptElement(forceLoading = false) {
    if (!window.location.hostname.includes('accounts.google.com')) return;
    if (sessionStorage.getItem('flow_prompt_dismissed') === 'true') return;

    if (forceLoading) {
      sessionStorage.setItem('flow_auto_in_progress', 'true');
    }
    const isLoadingActive = sessionStorage.getItem('flow_auto_in_progress') === 'true';

    const step = detectCurrentStep();
    if (!step && !isLoadingActive) return;

    let stepText = "Haga click en Ingresar, para acceder al servicio";
    if (step === 'ACCOUNT_CHOOSER') stepText = "Haga click en Ingresar, para continuar";
    else if (step === 'RECAPTCHA') stepText = "Haga click en Ingresar, para continuar";
    else if (step === 'EMAIL') stepText = "Haga click en Ingresar, para colocar el correo";
    else if (step === 'PASSWORD') stepText = "Haga click en Ingresar, para colocar la contraseña";
    else if (step === 'TOTP') stepText = "Haga click en Ingresar, para verificar con TOTP";
    else if (step === 'SKOTP_TRY_ANOTHER_WAY') stepText = "Haga click en Ingresar, para cambiar a código";
    else if (step === 'SELECTION_AUTHENTICATOR') stepText = "Haga click en Ingresar, para elegir Autenticador";

    const existingPrompt = document.getElementById('flow-auto-prompt');
    if (existingPrompt) {
      syncPromptDisplayState(existingPrompt);
      const p = existingPrompt.querySelector('.flow-prompt-info p');
      if (p && p.textContent !== stepText) {
        p.textContent = stepText;
      }
      return;
    }

    const googleIcon = getGoogleIconUrl();
    const isDark = isPageInDarkMode();
    const themeClass = isDark ? 'flow-theme-dark' : 'flow-theme-light';

    const promptDiv = document.createElement('div');
    promptDiv.id = 'flow-auto-prompt';
    promptDiv.className = themeClass;

    const shouldStartMinimized = step === 'RECAPTCHA' || sessionStorage.getItem('flow_prompt_minimized') === 'true';
    if (shouldStartMinimized) {
      promptDiv.classList.add('flow-is-minimized');
    }

    promptDiv.innerHTML = `
      <!-- 1. TARJETA INICIAL (ULTRA ASISTENTE) -->
      <div class="flow-prompt-card ${themeClass} ${isLoadingActive ? 'flow-hidden' : ''}" id="flowPromptCard" style="${isLoadingActive ? 'display: none !important;' : 'display: flex !important;'}">
        <div class="flow-card-top-bar">
          <button id="flowAutoMin" class="flow-btn-icon-min" title="Minimizar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13H5v-2h14v2z"/>
            </svg>
          </button>
        </div>
        <div class="flow-prompt-header">
          <div class="flow-prompt-icon">
            <img src="${googleIcon}" alt="Google" width="24" height="24" style="object-fit: contain; display: block;" />
          </div>
          <div class="flow-prompt-info">
            <h4>Ultra asistente</h4>
            <p>${stepText}</p>
          </div>
        </div>
        <div class="flow-prompt-actions">
          <button id="flowAutoNo" class="flow-btn-no">Minimizar</button>
          <button id="flowAutoYes" class="flow-btn-yes">Ingresar</button>
        </div>
      </div>

      <!-- 2. PANTALLA DE CARGA TIPO GOOGLE (TAPA EL FONDO DURANTE EL LOGIN) -->
      <div class="flow-loading-card ${themeClass} ${isLoadingActive ? '' : 'flow-hidden'}" id="flowLoadingCard" style="${isLoadingActive ? 'display: flex !important;' : 'display: none !important;'}">
        <div class="google-loading-bar">
          <div class="google-loading-bar-inner"></div>
        </div>
        <div class="flow-card-top-bar">
          <button id="flowLoadingMin" class="flow-btn-icon-min" title="Minimizar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13H5v-2h14v2z"/>
            </svg>
          </button>
        </div>
        <div class="flow-loading-body">
          <div class="google-spinner-wrap">
            <svg class="google-spinner" viewBox="0 0 50 50">
              <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4"></circle>
            </svg>
            <div class="google-spinner-logo">
              <img src="${googleIcon}" alt="Google" width="22" height="22" style="object-fit: contain; display: block;" />
            </div>
          </div>
          <div class="flow-loading-info">
            <h4>Cargando...</h4>
            <p>Ultra asistente está iniciando tu sesión segura...</p>
          </div>
        </div>
        <div class="flow-prompt-actions">
          <button id="flowLoadingNo" class="flow-btn-no">Minimizar</button>
        </div>
      </div>

      <!-- 3. WIDGET MINIMIZADO: ÍCONO REDONDO + BOTÓN CUADRADO DE AGRANDAR -->
      <div class="flow-minimized-widget ${themeClass} flow-hidden" id="flowMinimizedWidget" style="display: none !important;">
        <div class="flow-mini-icon-badge" id="flowMiniIconBadge" title="Ultra asistente (Click para expandir)">
          <div class="flow-mini-spinner ${isLoadingActive ? 'flow-spinning' : ''}"></div>
          <img src="${googleIcon}" alt="Google" width="24" height="24" style="object-fit: contain; display: block;" />
        </div>
        <button id="flowAutoMax" class="flow-mini-square-btn" title="Agrandar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
          </svg>
        </button>
      </div>
    `;

    if (!document.getElementById('flow-auto-prompt-style')) {
      const style = document.createElement('style');
      style.id = 'flow-auto-prompt-style';
      style.textContent = `
        #flow-auto-prompt {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          background: rgba(0, 0, 0, 0.78) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          z-index: 999999999 !important;
          font-family: 'Google Sans', 'Segoe UI', system-ui, -apple-system, sans-serif !important;
          animation: flowFadeInOverlay 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
          padding: 20px !important;
          box-sizing: border-box !important;
        }

        #flow-auto-prompt.flow-is-minimized {
          background: transparent !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          pointer-events: none !important;
          width: auto !important;
          height: auto !important;
          top: auto !important;
          left: auto !important;
          bottom: 24px !important;
          right: 24px !important;
          padding: 0 !important;
          display: block !important;
          animation: none !important;
        }

        #flow-auto-prompt.flow-is-minimized .flow-prompt-card,
        #flow-auto-prompt.flow-is-minimized .flow-loading-card {
          display: none !important;
        }

        #flow-auto-prompt:not(.flow-is-minimized) .flow-minimized-widget {
          display: none !important;
        }

        .flow-minimized-widget {
          display: none !important;
        }

        #flow-auto-prompt.flow-is-minimized .flow-minimized-widget {
          display: inline-flex !important;
          align-items: center !important;
          gap: 10px !important;
          pointer-events: auto !important;
          animation: flowMiniPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
        }

        @keyframes flowFadeInOverlay {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        @keyframes flowCardPop {
          0% { opacity: 0; transform: scale(0.92) translateY(12px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes flowMiniPop {
          0% { opacity: 0; transform: scale(0.8) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        .flow-prompt-card,
        .flow-loading-card {
          border-radius: 28px !important;
          padding: 26px 32px 26px 32px !important;
          width: 100% !important;
          max-width: 500px !important;
          flex-direction: column !important;
          gap: 16px !important;
          box-sizing: border-box !important;
          animation: flowCardPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease !important;
          position: relative !important;
          overflow: hidden !important;
        }

        .flow-prompt-card {
          display: flex;
        }

        .flow-loading-card {
          display: flex;
        }

        /* Regla de ocultamiento absoluto que tiene máxima prioridad */
        .flow-prompt-card.flow-hidden,
        .flow-loading-card.flow-hidden,
        .flow-minimized-widget.flow-hidden,
        #flowPromptCard.flow-hidden,
        #flowLoadingCard.flow-hidden,
        #flowMinimizedWidget.flow-hidden,
        #flow-auto-prompt .flow-hidden {
          display: none !important;
        }

        /* Barra de progreso estilo Google */
        .google-loading-bar {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          height: 4px !important;
          background: rgba(66, 133, 244, 0.2) !important;
          overflow: hidden !important;
          border-top-left-radius: 28px !important;
          border-top-right-radius: 28px !important;
        }

        .google-loading-bar-inner {
          width: 100% !important;
          height: 100% !important;
          background: linear-gradient(90deg, #4285F4 0%, #EA4335 25%, #FBBC05 50%, #34A853 75%, #4285F4 100%) !important;
          background-size: 200% 100% !important;
          animation: googleBarAnimation 1.5s infinite linear !important;
        }

        @keyframes googleBarAnimation {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .flow-loading-body {
          display: flex !important;
          align-items: center !important;
          gap: 20px !important;
          padding: 6px 0 !important;
        }

        .google-spinner-wrap {
          position: relative !important;
          width: 52px !important;
          height: 52px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-shrink: 0 !important;
        }

        .google-spinner {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 52px !important;
          height: 52px !important;
          animation: googleSpinnerRotate 2s linear infinite !important;
        }

        .google-spinner .path {
          stroke-dasharray: 1, 150;
          stroke-dashoffset: 0;
          stroke-linecap: round;
          animation: googleSpinnerDash 1.5s ease-in-out infinite, googleSpinnerColors 6s ease-in-out infinite !important;
        }

        @keyframes googleSpinnerRotate {
          100% { transform: rotate(360deg); }
        }

        @keyframes googleSpinnerDash {
          0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
          50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
          100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
        }

        @keyframes googleSpinnerColors {
          0%, 100% { stroke: #4285F4; }
          25% { stroke: #EA4335; }
          50% { stroke: #FBBC05; }
          75% { stroke: #34A853; }
        }

        .google-spinner-logo {
          width: 28px !important;
          height: 28px !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: #ffffff !important;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15) !important;
          z-index: 2 !important;
        }

        .flow-loading-info h4 {
          font-size: 20px !important;
          font-weight: 700 !important;
          margin: 0 !important;
          font-family: 'Google Sans', system-ui, sans-serif !important;
          letter-spacing: -0.2px !important;
        }

        .flow-loading-info p {
          font-size: 14.5px !important;
          margin: 6px 0 0 0 !important;
          line-height: 1.4 !important;
          font-family: 'Google Sans Text', 'Google Sans', system-ui, sans-serif !important;
        }

        .flow-card-top-bar {
          display: flex !important;
          justify-content: flex-end !important;
          margin-bottom: -6px !important;
        }

        .flow-btn-icon-min {
          background: transparent !important;
          border: none !important;
          cursor: pointer !important;
          padding: 6px !important;
          border-radius: 50% !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: background-color 0.15s ease, color 0.15s ease !important;
        }

        .flow-prompt-header {
          display: flex !important;
          align-items: center !important;
          gap: 18px !important;
        }

        .flow-prompt-icon {
          width: 48px !important;
          height: 48px !important;
          background: #ffffff !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
          flex-shrink: 0 !important;
          padding: 8px !important;
          box-sizing: border-box !important;
        }

        .flow-prompt-info h4 {
          font-size: 20px !important;
          font-weight: 700 !important;
          margin: 0 !important;
          font-family: 'Google Sans', system-ui, sans-serif !important;
          letter-spacing: -0.2px !important;
        }

        .flow-prompt-info p {
          font-size: 15px !important;
          margin: 5px 0 0 0 !important;
          line-height: 1.4 !important;
          font-family: 'Google Sans Text', 'Google Sans', system-ui, sans-serif !important;
        }

        .flow-prompt-actions {
          display: flex !important;
          gap: 12px !important;
          justify-content: flex-end !important;
          align-items: center !important;
          margin-top: 8px !important;
        }

        .flow-btn-yes,
        #flowAutoYes {
          border: none !important;
          border-radius: 9999px !important;
          padding: 12px 30px !important;
          font-size: 15px !important;
          font-weight: 700 !important;
          font-family: 'Google Sans', 'Segoe UI', system-ui, sans-serif !important;
          cursor: pointer !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: background-color 0.15s ease, transform 0.1s ease, box-shadow 0.2s ease !important;
        }

        .flow-btn-yes:hover,
        #flowAutoYes:hover {
          transform: scale(1.03) !important;
        }
        .flow-btn-yes:active,
        #flowAutoYes:active {
          transform: scale(0.97) !important;
        }

        .flow-btn-no,
        #flowAutoNo,
        #flowLoadingNo {
          background: transparent !important;
          border: none !important;
          border-radius: 9999px !important;
          padding: 12px 20px !important;
          font-size: 15px !important;
          font-weight: 600 !important;
          font-family: 'Google Sans', 'Segoe UI', system-ui, sans-serif !important;
          cursor: pointer !important;
          transition: background-color 0.15s ease, color 0.15s ease !important;
        }

        /* Elementos del Widget Minimizado */
        .flow-mini-icon-badge {
          position: relative !important;
          width: 44px !important;
          height: 44px !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          box-sizing: border-box !important;
          transition: transform 0.15s ease, box-shadow 0.2s ease !important;
          user-select: none !important;
          flex-shrink: 0 !important;
        }

        .flow-mini-icon-badge:hover {
          transform: scale(1.08) !important;
        }

        .flow-mini-icon-badge:active {
          transform: scale(0.95) !important;
        }

        .flow-mini-icon-badge img {
          width: 24px !important;
          height: 24px !important;
          object-fit: contain !important;
          display: block !important;
          z-index: 2 !important;
          border-radius: 50% !important;
        }

        .flow-mini-spinner {
          display: none !important;
          position: absolute !important;
          top: -3px !important;
          left: -3px !important;
          right: -3px !important;
          bottom: -3px !important;
          border-radius: 50% !important;
          border: 2.5px solid transparent !important;
          border-top-color: #4285F4 !important;
          border-right-color: #EA4335 !important;
          border-bottom-color: #FBBC05 !important;
          border-left-color: #34A853 !important;
          animation: flowMiniSpin 1s linear infinite !important;
          pointer-events: none !important;
        }

        .flow-mini-spinner.flow-spinning {
          display: block !important;
        }

        @keyframes flowMiniSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .flow-mini-square-btn {
          width: 44px !important;
          height: 44px !important;
          border-radius: 12px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          border: none !important;
          box-sizing: border-box !important;
          transition: transform 0.15s ease, background-color 0.2s ease, box-shadow 0.2s ease !important;
          padding: 0 !important;
          flex-shrink: 0 !important;
        }

        .flow-mini-square-btn:hover {
          transform: scale(1.08) !important;
        }

        .flow-mini-square-btn:active {
          transform: scale(0.95) !important;
        }

        .flow-mini-square-btn svg {
          width: 20px !important;
          height: 20px !important;
          display: block !important;
          transition: transform 0.2s ease !important;
        }

        .flow-mini-square-btn:hover svg {
          transform: scale(1.1) !important;
        }

        /* 1. MODO CLARO */
        .flow-prompt-card.flow-theme-light,
        .flow-loading-card.flow-theme-light {
          background: #ffffff !important;
          border: 1px solid #dfe3e7 !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25), 0 0 30px rgba(11, 87, 208, 0.1) !important;
          color: #1f1f1f !important;
        }
        .flow-theme-light .flow-btn-icon-min {
          color: #5f6368 !important;
        }
        .flow-theme-light .flow-btn-icon-min:hover {
          background: rgba(0, 0, 0, 0.06) !important;
          color: #1f1f1f !important;
        }
        .flow-theme-light .flow-prompt-info h4,
        .flow-theme-light .flow-loading-info h4 {
          color: #1f1f1f !important;
        }
        .flow-theme-light .flow-prompt-info p,
        .flow-theme-light .flow-loading-info p {
          color: #444746 !important;
        }
        .flow-theme-light .flow-btn-no,
        .flow-theme-light #flowAutoNo,
        .flow-theme-light #flowLoadingNo {
          color: #0b57d0 !important;
          -webkit-text-fill-color: #0b57d0 !important;
        }
        .flow-theme-light .flow-btn-no:hover,
        .flow-theme-light #flowAutoNo:hover,
        .flow-theme-light #flowLoadingNo:hover {
          background: rgba(11, 87, 208, 0.08) !important;
        }
        .flow-theme-light .flow-btn-yes,
        .flow-theme-light #flowAutoYes {
          background-color: #0b57d0 !important;
          background: #0b57d0 !important;
          color: #ffffff !important;
          -webkit-text-fill-color: #ffffff !important;
          box-shadow: 0 2px 10px rgba(11, 87, 208, 0.35) !important;
        }
        .flow-theme-light .flow-btn-yes:hover,
        .flow-theme-light #flowAutoYes:hover {
          background-color: #0842a0 !important;
          background: #0842a0 !important;
          box-shadow: 0 4px 16px rgba(11, 87, 208, 0.5) !important;
        }

        .flow-theme-light .flow-mini-icon-badge {
          background: #ffffff !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18), 0 0 1px rgba(0, 0, 0, 0.2) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
        }
        .flow-theme-light .flow-mini-square-btn {
          background: #ffffff !important;
          color: #444746 !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18), 0 0 1px rgba(0, 0, 0, 0.2) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
        }
        .flow-theme-light .flow-mini-square-btn:hover {
          background: #f1f3f4 !important;
          color: #0b57d0 !important;
        }

        /* 2. MODO OSCURO */
        .flow-prompt-card.flow-theme-dark,
        .flow-loading-card.flow-theme-dark {
          background: #1e1f20 !important;
          border: 1px solid #444746 !important;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.8), 0 0 40px rgba(168, 199, 250, 0.15) !important;
          color: #e3e3e3 !important;
        }
        .flow-theme-dark .flow-btn-icon-min {
          color: #9aa0a6 !important;
        }
        .flow-theme-dark .flow-btn-icon-min:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          color: #f2f2f2 !important;
        }
        .flow-theme-dark .flow-prompt-info h4,
        .flow-theme-dark .flow-loading-info h4 {
          color: #f2f2f2 !important;
        }
        .flow-theme-dark .flow-prompt-info p,
        .flow-theme-dark .flow-loading-info p {
          color: #c4c7c5 !important;
        }
        .flow-theme-dark .flow-btn-no,
        .flow-theme-dark #flowAutoNo,
        .flow-theme-dark #flowLoadingNo {
          color: #a8c7fa !important;
          -webkit-text-fill-color: #a8c7fa !important;
        }
        .flow-theme-dark .flow-btn-no:hover,
        .flow-theme-dark #flowAutoNo:hover,
        .flow-theme-dark #flowLoadingNo:hover {
          background: rgba(168, 199, 250, 0.08) !important;
        }
        .flow-theme-dark .flow-btn-yes,
        .flow-theme-dark #flowAutoYes {
          background-color: #a8c7fa !important;
          background: #a8c7fa !important;
          color: #041e49 !important;
          -webkit-text-fill-color: #041e49 !important;
          box-shadow: 0 2px 12px rgba(168, 199, 250, 0.3) !important;
        }
        .flow-theme-dark .flow-btn-yes:hover,
        .flow-theme-dark #flowAutoYes:hover {
          background-color: #b9d3fc !important;
          background: #b9d3fc !important;
          box-shadow: 0 4px 20px rgba(168, 199, 250, 0.55) !important;
        }

        .flow-theme-dark .flow-mini-icon-badge {
          background: #202124 !important;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.7) !important;
          border: 1px solid #444746 !important;
        }
        .flow-theme-dark .flow-mini-square-btn {
          background: #202124 !important;
          color: #e3e3e3 !important;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.7) !important;
          border: 1px solid #444746 !important;
        }
        .flow-theme-dark .flow-mini-square-btn:hover {
          background: #303134 !important;
          color: #a8c7fa !important;
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(promptDiv);

    // Sincronizar estado inicial estricto de visibilidad
    syncPromptDisplayState(promptDiv);

    const setMinimizedState = (min) => {
      if (min) {
        promptDiv.classList.add('flow-is-minimized');
        sessionStorage.setItem('flow_prompt_minimized', 'true');
      } else {
        promptDiv.classList.remove('flow-is-minimized');
        sessionStorage.setItem('flow_prompt_minimized', 'false');
      }
      syncPromptDisplayState(promptDiv);
    };

    const triggerLogin = () => {
      sessionStorage.setItem('flow_auto_in_progress', 'true');
      sessionStorage.removeItem('flow_prompt_minimized');
      promptDiv.classList.remove('flow-is-minimized');

      // Ocultar de inmediato Ultra asistente y mostrar la pantalla de carga tipo Google
      syncPromptDisplayState(promptDiv);

      runFullOneStretchFlow();
    };

    const yesBtn = promptDiv.querySelector('#flowAutoYes');
    if (yesBtn) yesBtn.addEventListener('click', triggerLogin);

    const minBtn = promptDiv.querySelector('#flowAutoMin');
    if (minBtn) minBtn.addEventListener('click', () => setMinimizedState(true));

    const noBtn = promptDiv.querySelector('#flowAutoNo');
    if (noBtn) noBtn.addEventListener('click', () => setMinimizedState(true));

    const loadingMinBtn = promptDiv.querySelector('#flowLoadingMin');
    if (loadingMinBtn) loadingMinBtn.addEventListener('click', () => setMinimizedState(true));

    const loadingNoBtn = promptDiv.querySelector('#flowLoadingNo');
    if (loadingNoBtn) loadingNoBtn.addEventListener('click', () => setMinimizedState(true));

    // Botón cuadrado de agrandar al lado de su ícono
    const maxBtn = promptDiv.querySelector('#flowAutoMax');
    if (maxBtn) maxBtn.addEventListener('click', () => setMinimizedState(false));

    // El ícono de Google también expande al hacer click
    const miniBadge = promptDiv.querySelector('#flowMiniIconBadge');
    if (miniBadge) miniBadge.addEventListener('click', () => setMinimizedState(false));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (window.location.hostname.includes('accounts.google.com')) {
        const initialStep = detectCurrentStep();
        if (initialStep === 'RECAPTCHA') {
          sessionStorage.removeItem('flow_auto_in_progress');
        }
        if (sessionStorage.getItem('flow_auto_in_progress') === 'true') {
          renderFlowAutoPromptElement(true);
          setTimeout(runFullOneStretchFlow, 250);
        } else {
          setTimeout(showFlowAutoPrompt, 200);
        }
      }
      setTimeout(checkAndShowReactivationWarning, 600);
    });
  } else {
    if (window.location.hostname.includes('accounts.google.com')) {
      const initialStep = detectCurrentStep();
      if (initialStep === 'RECAPTCHA') {
        sessionStorage.removeItem('flow_auto_in_progress');
      }
      if (sessionStorage.getItem('flow_auto_in_progress') === 'true') {
        renderFlowAutoPromptElement(true);
        setTimeout(runFullOneStretchFlow, 250);
      } else {
        setTimeout(showFlowAutoPrompt, 200);
      }
    }
    setTimeout(checkAndShowReactivationWarning, 600);
  }

  // Auto-omisión inmediata e incondicional de la pantalla de creación de llaves de acceso (Passkeys / Simplifica el acceso)
  function autoDismissPasskeyPrompt() {
    if (!window.location.hostname.includes('accounts.google.com')) return false;
    if (findPasswordInput() || findTotpInput() || findEmailInput()) return false;

    const url = window.location.href.toLowerCase();
    const bodyText = (document.body ? document.body.innerText : '').toLowerCase();

    const isPasskeyScreen = 
      url.includes('p=passkey') ||
      url.includes('/challenge/passkey') ||
      url.includes('webauthn') ||
      bodyText.includes('simplifica el acceso') ||
      bodyText.includes('llave de acceso') ||
      bodyText.includes('llaves de acceso') ||
      bodyText.includes('simplify your sign-in') ||
      bodyText.includes('passkey') ||
      bodyText.includes('passkeys') ||
      bodyText.includes('simplifique o login') ||
      bodyText.includes('chave de acesso') ||
      bodyText.includes('chaves de acesso') ||
      bodyText.includes('huella dactilar, rostro o bloqueo') ||
      bodyText.includes('fingerprint, face or screen lock') ||
      bodyText.includes('impressão digital, rosto ou bloqueio');

    if (!isPasskeyScreen) return false;

    // Buscar y hacer clic inmediatamente en el botón de rechazar/omitir creación de llave ("Ahora no", "Not now", "Agora não", "Omitir", "Skip")
    const buttons = Array.from(document.querySelectorAll('button, div[role="button"], a[role="button"], a, span'));
    for (const btn of buttons) {
      if (!isVisible(btn)) continue;
      const txt = (btn.innerText || btn.textContent || '').trim().toLowerCase();
      if (txt === 'ahora no' || txt === 'not now' || txt === 'agora não' || txt === 'omitir' || txt === 'skip' || txt === 'no gracias' || txt === 'cancelar' || txt === 'descartar') {
        console.warn("[Flow Shield] Pantalla 'Simplifica el acceso' (Passkey) detectada. Haciendo clic automático en '" + txt + "' para impedir creación de llave...");
        const target = btn.closest('button, div[role="button"], a') || btn;
        try { target.focus(); } catch(e) {}
        const eventOpts = { bubbles: true, cancelable: true, view: window, composed: true };
        target.dispatchEvent(new PointerEvent('pointerdown', eventOpts));
        target.dispatchEvent(new MouseEvent('mousedown', eventOpts));
        target.dispatchEvent(new PointerEvent('pointerup', eventOpts));
        target.dispatchEvent(new MouseEvent('mouseup', eventOpts));
        target.dispatchEvent(new MouseEvent('click', eventOpts));
        try { target.click(); } catch(e) {}
        return true;
      }
    }
    return false;
  }

  // Auto-recuperación instantánea si Google muestra el diálogo modal "Se produjo un error" con "Reiniciar"
  function autoRecoverGoogleOAuthError() {
    if (!window.location.hostname.includes('accounts.google.com')) return;
    
    const buttons = Array.from(document.querySelectorAll('button, div[role="button"], a[role="button"]'));
    for (const btn of buttons) {
      const txt = (btn.innerText || btn.textContent || '').trim().toLowerCase();
      if (txt === 'reiniciar' || txt === 'try again' || txt === 'reintentar' || txt === 'reload') {
        console.warn("[Flow Auto-Recovery] Detectado diálogo de error de Google. Haciendo clic automático en Reiniciar...");
        btn.click();
        return;
      }
    }
  }

  // Monitoreo continuo de transiciones dinámicas en Google Login (SPA / Edge / Chrome)
  if (window.location.hostname.includes('accounts.google.com')) {
    setInterval(() => {
      autoDismissPasskeyPrompt();
      const currentStep = detectCurrentStep();
      const isAutoInProgress = sessionStorage.getItem('flow_auto_in_progress') === 'true';

      if (isAutoInProgress) {
        if (currentStep === 'RECAPTCHA') {
          sessionStorage.removeItem('flow_auto_in_progress');
          showFlowAutoPrompt();
        } else {
          renderFlowAutoPromptElement(true);
          executeAutoLoginStep();
        }
      } else {
        showFlowAutoPrompt();
      }
      autoRecoverGoogleOAuthError();
    }, 200);
  }

  // Monitoreo continuo y offline del Modo Agente y Motor en Google Flow (Desactivar si está activo y auto-seleccionar motor)
  if (window.location.hostname.includes('flow.google.com') || window.location.hostname.includes('labs.google')) {
    injectFlowAgentModeCSS();
    enforceFlowAgentModeDisabled();
    setInterval(() => {
      enforceFlowAgentModeDisabled();
      // FIX: No ejecutar si el usuario está escribiendo en el prompt
      if (!userIsTypingInPrompt) {
        triggerAutoSelectEngineSequence();
        autoDismissCreditErrorAndConfigure();
      }
    }, 400);
    window.addEventListener('DOMContentLoaded', () => {
      injectFlowAgentModeCSS();
      enforceFlowAgentModeDisabled();
      setTimeout(triggerAutoSelectEngineSequence, 900);
    });
  }

  // Safe Listener Registration
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        try {
          if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
            return false;
          }

          if (request.action === "FILL_TOKEN" || request.action === "RUN_FULL_AUTO") {
            runFullOneStretchFlow();
            sendResponse({ success: true, mode: "FULL_AUTO" });
            return true;
          }

          if (request.action === "SHOW_DEACTIVATION_WARNING") {
            showReactivationWarningModal(request.message || "¡Hola! Para asegurar que sigas disfrutando de todos los beneficios de tu suscripción sin interrupciones, por favor mantén la extensión activada. ¡Contamos contigo!");
            sendResponse({ success: true });
            return true;
          }

          if (request.action === "SESSION_REVOKED_FORCE_LOGOUT" || request.action === "FORCE_LOGOUT_IMMEDIATE") {
            try {
              localStorage.clear();
              sessionStorage.clear();
              document.documentElement.innerHTML = `
                <div style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:#0c0d10;color:#f2f2f2;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:sans-serif;z-index:99999999;text-align:center;padding:24px;">
                  <div style="background:#1e1f20;border:1px solid #f87171;padding:28px 24px;border-radius:18px;max-width:440px;box-shadow:0 12px 30px rgba(0,0,0,0.7);">
                    <div style="font-size:32px;margin-bottom:12px;">🔒</div>
                    <h1 style="font-size:20px;margin-bottom:12px;color:#f87171;">Sesión Finalizada</h1>
                    <p style="font-size:14px;color:#c4c7c5;line-height:1.5;margin-bottom:16px;">${request.message || "Tu dispositivo ha sido liberado por el administrador. Redirigiendo..."}</p>
                  </div>
                </div>
              `;
              setTimeout(() => {
                try {
                  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
                    window.location.replace(chrome.runtime.getURL("login.html"));
                    return;
                  }
                } catch(e) {}
                window.location.replace("https://accounts.google.com/Logout");
              }, 400);
            } catch(e) {}
            sendResponse({ success: true });
            return true;
          }
        } catch (e) {}
        return true;
      });
    }
  } catch (e) {}
})();
