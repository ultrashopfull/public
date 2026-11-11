document.addEventListener('DOMContentLoaded', () => {
  const usernameInput = document.getElementById('usernameInput');
  const passwordInput = document.getElementById('passwordInput');
  const submitBtn = document.getElementById('submitBtn');
  const statusAlert = document.getElementById('statusAlert');
  const noticeBanner = document.getElementById('noticeBanner');
  const noticeBannerText = document.getElementById('noticeBannerText');
  const loadingCredentialBox = document.getElementById('loadingCredentialBox');
  const loadingTitleText = document.getElementById('loadingTitleText');
  const loadingSubtitleText = document.getElementById('loadingSubtitleText');

  const API_URL = "https://usrvoxlyyqrhrpnwobuq.supabase.co/functions/v1";
  const PRODUCTO = "gemini";

  function showLoadingCredential(title = "Cargando credencial...", subtitle = "Verificando con Supabase") {
    if (loadingCredentialBox) {
      if (loadingTitleText) loadingTitleText.textContent = title;
      if (loadingSubtitleText) loadingSubtitleText.textContent = subtitle;
      loadingCredentialBox.classList.remove('hidden');
    }
    if (submitBtn) submitBtn.disabled = true;
    if (usernameInput) usernameInput.disabled = true;
    if (passwordInput) passwordInput.disabled = true;
    if (statusAlert) statusAlert.textContent = "";
  }

  function hideLoadingCredential() {
    if (loadingCredentialBox) loadingCredentialBox.classList.add('hidden');
    if (submitBtn) submitBtn.disabled = false;
    if (usernameInput) usernameInput.disabled = false;
    if (passwordInput) passwordInput.disabled = false;
  }

  // 🛡️ ANTI-DEVTOOLS
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
      (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  });

  function showAlert(msg, type = 'error') {
    if (noticeBanner && !noticeBanner.classList.contains('hidden') && type === 'error') return;
    statusAlert.textContent = msg;
    statusAlert.className = `status-alert ${type}`;
  }

  function showNotice(msg) {
    if (noticeBanner && noticeBannerText) {
      noticeBannerText.innerText = msg;
      noticeBanner.classList.remove('hidden');
      noticeBanner.style.display = 'flex';
      if (statusAlert) {
        statusAlert.textContent = "";
        statusAlert.className = 'status-alert';
      }
    } else if (statusAlert) {
      statusAlert.textContent = msg;
      statusAlert.className = 'status-alert error';
    }
  }

  // AUTO-LOGIN SI EXISTE SESIÓN ACTIVA
  let autoLoginActive = true;

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
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async function checkAndAutoLoginFromWebSession() {
    if (!autoLoginActive) return false;
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const { pending_reactivation_warning, reactivation_warning_text, unlinked_lock, unlinked_notice } = await chrome.storage.local.get(['pending_reactivation_warning', 'reactivation_warning_text', 'unlinked_lock', 'unlinked_notice']);
        if (unlinked_lock || unlinked_notice) {
          autoLoginActive = false;
          showNotice(unlinked_notice || "Tu dispositivo ha sido liberado. Ingresa tus credenciales manualmente.");
          return false;
        }
        if (pending_reactivation_warning) {
          autoLoginActive = false;
          if (reactivation_warning_text) showNotice(reactivation_warning_text);
          return false;
        }
      }

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const { platformUser, sessionLoggedIn, flow_device_mac } = await chrome.storage.local.get(['platformUser', 'sessionLoggedIn', 'flow_device_mac']);
        if (sessionLoggedIn && platformUser && platformUser.username) {
          const verification = await validateSessionWithCloud(platformUser.username, platformUser.password, flow_device_mac || platformUser.device_mac);
          
          if (verification && verification.success && verification.suscripcion && verification.suscripcion.dias_restantes > 0) {
            showAlert(`¡Sesión activa verificada para '${platformUser.username}'! Conectando...`, "success");

            // Guardar también las credenciales maestras nuevas que devuelve
            // /login. Sin esto, una migración recién hecha seguiría usando la
            // cuenta anterior hasta que el watchdog actualizara platformUser.
            const cred = verification.credenciales || {};
            const migratedUser = {
              ...platformUser,
              assigned_email: cred.email || platformUser.assigned_email || "",
              assigned_password: cred.password || platformUser.assigned_password || "",
              totp_seed: cred.totp_seed || platformUser.totp_seed || "",
              account_type: cred.account_type || platformUser.account_type || PRODUCTO,
              days_remaining: verification.suscripcion.dias_restantes,
              status: "ACTIVE"
            };

            // ⏱️ GUARDAR TIMESTAMPS PARA EL WATCHDOG (Evita falsos positivos)
            await chrome.storage.local.set({
              extension_state: 'ACTIVE',
              sessionLoggedIn: true,
              platformUser: migratedUser,
              pending_reactivation_warning: false,
              reactivation_warning_text: null,
              flow_revoke_nonce: verification.revoke_nonce || null,
              flow_migration_nonce: verification.migration_nonce || null,
              flow_migration_pending_nonce: null,
              flow_migrating: false,
              flow_migration_started_at: null,
              flowLoginTime: Date.now(),
              flowLastServerCheck: Date.now()
            });

            setTimeout(() => {
              window.location.replace("https://flow.google.com");
            }, 300);
            return true;
          } else if (verification && verification.success === false) {
            autoLoginActive = false;
            await chrome.storage.local.set({
              sessionLoggedIn: false,
              platformUser: null,
              pending_reactivation_warning: true,
              reactivation_warning_text: verification.mensaje || "Tu suscripción ha finalizado."
            });
            showNotice(verification.mensaje || "Tu suscripción ha finalizado.");
            return false;
          }
        }
      }
    } catch(e) {}
    return false;
  }

  checkAndAutoLoginFromWebSession();
  const autoLoginTimer = setInterval(() => {
    if (autoLoginActive) {
      checkAndAutoLoginFromWebSession();
    } else {
      clearInterval(autoLoginTimer);
    }
  }, 1200);
  setTimeout(() => clearInterval(autoLoginTimer), 10000);

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['pending_reactivation_warning', 'reactivation_warning_text', 'unlinked_notice', 'unlinked_lock'], (res) => {
      if (res && (res.unlinked_lock || res.unlinked_notice)) {
        autoLoginActive = false;
        showNotice(res.unlinked_notice || "Tu dispositivo ha sido liberado. Ingresa tus credenciales manualmente.");
      } else if (res && res.pending_reactivation_warning && res.reactivation_warning_text) {
        autoLoginActive = false;
        showNotice(res.reactivation_warning_text);
      }
    });
  }

  async function getOrCreateDeviceMac() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
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
      }
    } catch (e) {}

    let storedMac = localStorage.getItem('flow_device_mac');
    if (!storedMac || storedMac.length < 10) {
      const hex = () => Math.floor((1 + Math.random()) * 0x100).toString(16).substring(1).toUpperCase();
      storedMac = `${hex()}:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`;
      try { localStorage.setItem('flow_device_mac', storedMac); } catch (e) {}
    }
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ flow_device_mac: storedMac });
      }
    } catch (e) {}
    return storedMac;
  }

  async function handleLogin() {
    const userVal = usernameInput.value.trim();
    const passVal = passwordInput.value.trim();

    if (!userVal || !passVal) {
      showNotice("Por favor escribe tu usuario y contraseña de plataforma");
      return;
    }

    if (noticeBanner) {
      noticeBanner.classList.add('hidden');
      noticeBanner.style.display = 'none';
    }
    await chrome.storage.local.set({
      extension_state: 'IDLE',
      pending_reactivation_warning: false,
      reactivation_warning_text: null,
      unlinked_lock: false,
      unlinked_notice: null
    });
    autoLoginActive = true;
    showLoadingCredential("Cargando credencial...", "Verificando con Supabase...");

    const deviceMac = await getOrCreateDeviceMac();

    let loginSuccess = false;
    let userData = null;
    let cloudMessage = "";

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: userVal,
          password: passVal,
          device_id: deviceMac,
          producto: PRODUCTO
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      let data = null;
      try {
        data = await res.json();
      } catch (err) {
        if (res.status === 429) {
          cloudMessage = "Protección Anti-DDoS activa: espera unos momentos.";
        }
      }

      if (data && data.success) {
        loginSuccess = true;
        userData = data;
      } else if (data && data.mensaje) {
        cloudMessage = data.mensaje;
      }
    } catch (e) {
      if (e.name === 'AbortError') {
        cloudMessage = "Tiempo de espera agotado al conectar.";
      } else {
        cloudMessage = "Error de conexión. Verifica tu conexión.";
      }
    }

    if (loginSuccess && userData) {
      const sub = userData.suscripcion || {};
      const cred = userData.credenciales || {};
      const cli = userData.cliente || {};
      const days = sub.dias_restantes !== undefined ? sub.dias_restantes : 30;

      if (days <= 0) {
        await chrome.storage.local.set({
          extension_state: 'SUSPENDED',
          sessionLoggedIn: false,
          platformUser: null,
          pending_reactivation_warning: true,
          reactivation_warning_text: "Tu suscripción ha finalizado. Contacta al administrador."
        });
        hideLoadingCredential();
        showNotice("Tu suscripción ha finalizado. Contacta al administrador.");
        return;
      }

      const effectiveData = {
        username: cli.usuario || userVal,
        password: passVal,
        role: cli.rol || "Cliente",
        account_type: cred.account_type || PRODUCTO,
        assigned_email: cred.email || "",
        assigned_password: cred.password || "",
        totp_seed: cred.totp_seed || "",
        status: "ACTIVE",
        days_remaining: days,
        days_total: sub.dias_totales || 30,
        device_mac: deviceMac
      };

      // ⏱️ AQUÍ SE GUARDAN LOS TIMESTAMPS PARA EL WATCHDOG
      await chrome.storage.local.set({
        extension_state: 'ACTIVE',
        sessionLoggedIn: true,
        platformUser: effectiveData,
        pending_reactivation_warning: false,
        reactivation_warning_text: null,
        flow_revoke_nonce: userData.revoke_nonce || null,
        flow_migration_nonce: userData.migration_nonce || null,
        flow_migration_pending_nonce: null,
        flow_migrating: false,
        flow_migration_started_at: null,
        flowLoginTime: Date.now(),       // <--- NUEVO
        flowLastServerCheck: Date.now()  // <--- NUEVO
      });

      showLoadingCredential("¡Credenciales verificadas!", "Conectando con Google Flow...");

      try {
        chrome.runtime.sendMessage({
          action: "SYNC_WEB_SESSION",
          platformUser: effectiveData
        });
      } catch (e) {}

      setTimeout(() => {
        window.location.replace("https://flow.google.com");
      }, 500);

    } else {
      hideLoadingCredential();
      const finalMsg = cloudMessage || "Usuario o contraseña incorrectos.";
      const isPermanentBlock = cloudMessage.includes('finalizado') || cloudMessage.includes('anulada') || 
                               cloudMessage.includes('no autorizado') || cloudMessage.includes('bloqueado');

      if (isPermanentBlock) {
        await chrome.storage.local.set({
          extension_state: 'SUSPENDED',
          sessionLoggedIn: false,
          platformUser: null,
          pending_reactivation_warning: true,
          reactivation_warning_text: finalMsg
        });
      } else {
        await chrome.storage.local.set({
          extension_state: 'IDLE',
          sessionLoggedIn: false,
          platformUser: null,
          pending_reactivation_warning: false,
          reactivation_warning_text: null
        });
      }
      showNotice(finalMsg);
    }
  }

  submitBtn.addEventListener('click', handleLogin);
  submitBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleLogin();
  });
  window.handleLogin = handleLogin;

  [usernameInput, passwordInput].forEach(inp => {
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleLogin();
    });
  });
});