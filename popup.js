document.addEventListener('DOMContentLoaded', async () => {
  const profileCard = document.getElementById('profileCard');
  const loginPromptCard = document.getElementById('loginPromptCard');
  const profileUserDisplay = document.getElementById('profileUserDisplay');
  const profileRoleDisplay = document.getElementById('profileRoleDisplay');
  const logoutPlatformBtn = document.getElementById('logoutPlatformBtn');
  const openLoginTabBtn = document.getElementById('openLoginTabBtn');
  const daysCount = document.getElementById('daysCount');
  const daysUnitText = document.getElementById('daysUnitText');
  const expiredSection = document.getElementById('expiredSection');
  const popupWarningBanner = document.getElementById('popupWarningBanner');

  const API_URL = "https://usrvoxlyyqrhrpnwobuq.supabase.co/functions/v1";
  const PRODUCTO = "gemini";

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

  let storageData = await chrome.storage.local.get([
    'platformUser', 'sessionLoggedIn', 'pending_reactivation_warning',
    'reactivation_warning_text', 'flow_device_mac', 'extension_state',
    'flow_migration_nonce'
  ]);
  const cloudStatusText = document.getElementById('cloudStatusText');

  if (popupWarningBanner) {
    if (storageData.pending_reactivation_warning && storageData.reactivation_warning_text) {
      popupWarningBanner.style.display = 'flex';
      const wText = popupWarningBanner.querySelector('.warning-text');
      if (wText) wText.innerHTML = `<strong>Aviso:</strong> ${storageData.reactivation_warning_text}`;
    } else {
      popupWarningBanner.style.display = 'none';
    }
  }

  function renderSessionState(user, isExpired = false, errorMsg = '') {
    const isSuspended = storageData.extension_state === 'SUSPENDED';
    if (user && user.username && !isExpired && storageData.sessionLoggedIn !== false && !isSuspended) {
      if (profileCard) profileCard.style.display = 'flex';
      if (loginPromptCard) loginPromptCard.style.display = 'none';
      if (expiredSection) expiredSection.style.display = 'none';
      if (loggedSection) loggedSection.style.display = 'block';
      if (daysCardContainer) daysCardContainer.style.display = 'flex';

      if (profileUserDisplay) profileUserDisplay.textContent = user.username;
      if (profileRoleDisplay) profileRoleDisplay.textContent = user.role ? `Rol: ${user.role}` : "Rol: Cliente";
      if (daysCount) daysCount.textContent = user.days_remaining !== undefined ? user.days_remaining : 30;
      if (daysUnitText) daysUnitText.textContent = "días";

      if (cloudStatusText) {
        cloudStatusText.innerHTML = '<span class="status-dot"></span> Conectado a la Nube';
      }
    } else {
      if (profileCard) profileCard.style.display = 'none';
      if (loginPromptCard) loginPromptCard.style.display = 'flex';
      if (loggedSection) loggedSection.style.display = 'none';

      if (isExpired) {
        if (expiredSection) expiredSection.style.display = 'block';
        if (daysCardContainer) daysCardContainer.style.display = 'none';
      } else {
        if (expiredSection) expiredSection.style.display = 'none';
        if (daysCardContainer) daysCardContainer.style.display = 'none';
      }

      if (cloudStatusText) {
        cloudStatusText.innerHTML = '<span class="status-dot" style="background:#ef4444;box-shadow:0 0 6px rgba(239,68,68,0.7);"></span> ' + (errorMsg || 'Estado: Suspendido');
      }
    }
  }

  renderSessionState(storageData.platformUser);

  async function verifyLicenseStatus() {
    if (!storageData.platformUser || !storageData.platformUser.username) return;

    const username = storageData.platformUser.username;
    const deviceMac = storageData.flow_device_mac || '';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${API_URL}/verificar-estado`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: username,
          device_id: deviceMac,
          client_migration_nonce: storageData.flow_migration_nonce || null,
          producto: PRODUCTO
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json();

      // Si el administrador acaba de migrar la cuenta, avisa al background
      // para que cierre la sesión anterior y abra el login con la cuenta nueva.
      if (data && data.migration_nonce && data.migration_nonce !== (storageData.flow_migration_nonce || null)) {
        try {
          chrome.runtime.sendMessage({ action: 'APPLY_MIGRATION', migration: data });
        } catch (e) {}
      }

      if (data && data.activo === true) {
        const days = data.dias_restantes !== undefined ? data.dias_restantes : (storageData.platformUser.days_remaining || 30);
        if (daysCount) daysCount.textContent = days;
        renderSessionState({ ...storageData.platformUser, days_remaining: days }, false);
        return true;
      } else if (data && data.activo === false) {
        const motivo = data.motivo || "";
        const isBloqueante = ['SUSPENDIDO', 'VENCIDO', 'SIN_SUSCRIPCION', 'NO_EXISTE', 'OTRO_DISPOSITIVO'].includes(motivo);
        if (isBloqueante) {
          const errMsg = data.mensaje || "Tu cuenta ha sido suspendida.";
          await chrome.storage.local.set({
            sessionLoggedIn: false,
            platformUser: null,
            extension_state: 'SUSPENDED',
            pending_reactivation_warning: true,
            reactivation_warning_text: errMsg
          });
          storageData.sessionLoggedIn = false;
          renderSessionState(null, true, errMsg);
          if (popupWarningBanner) {
            popupWarningBanner.style.display = 'flex';
            const wText = popupWarningBanner.querySelector('.warning-text');
            if (wText) wText.innerHTML = `<strong>Aviso:</strong> ${errMsg}`;
          }
          chrome.runtime.sendMessage({ action: "FORCE_DEEP_CLEAN" });
          return false;
        }
      }
    } catch (e) {}
  }

  verifyLicenseStatus();

  function openLoginTab() {
    const loginUrl = chrome.runtime.getURL("login.html");
    chrome.tabs.query({}, (tabs) => {
      const existing = tabs && tabs.find(t => {
        const u = (t.url || t.pendingUrl || '').toLowerCase();
        return u.includes(loginUrl.toLowerCase()) || (u.includes(chrome.runtime.id) && u.includes("login.html"));
      });
      if (existing && existing.id) {
        chrome.tabs.update(existing.id, { active: true });
        if (existing.windowId) chrome.windows.update(existing.windowId, { focused: true });
      } else {
        chrome.tabs.create({ url: loginUrl });
      }
      window.close();
    });
  }

  if (openLoginTabBtn) {
    openLoginTabBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openLoginTab();
    });
  }

  if (loginPromptCard) {
    loginPromptCard.addEventListener('click', () => openLoginTab());
  }

  const toolButtons = document.querySelectorAll('.tool-btn');
  toolButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetUrl = btn.getAttribute('data-url');
      if (targetUrl) {
        chrome.tabs.create({ url: targetUrl });
        window.close();
      }
    });
  });

  if (logoutPlatformBtn) {
    logoutPlatformBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        await chrome.storage.local.remove(['platformUser', 'sessionLoggedIn']);
        if (chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ action: "FORCE_DEEP_CLEAN" }, () => {
            openLoginTab();
          });
          return;
        }
      } catch (e) {}
      openLoginTab();
    });
  }

  // ==========================================
  // 🚀 ACTUALIZACIÓN OTA (GitHub Releases)
  // ==========================================
  const manifest = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) ? chrome.runtime.getManifest() : null;
  const currentVersion = manifest ? manifest.version : "1.2.8";
  const GITHUB_REPO_RELEASES = "https://api.github.com/repos/vcontenedor-source/descargas-extensiones/releases";
  const FALLBACK_DOWNLOAD_URL = "https://veoultraflow.duckdns.org/Flow_Extension.zip";

  const updateVersionLabel = document.getElementById('updateVersionLabel');
  const updateSubtext = document.getElementById('updateSubtext');
  const updateDotStatus = document.getElementById('updateDotStatus');
  const btnCheckUpdate = document.getElementById('btnCheckUpdate');
  const updateAvailableBanner = document.getElementById('updateAvailableBanner');
  const updateTargetVersion = document.getElementById('updateTargetVersion');
  const updateNoticeSub = document.getElementById('updateNoticeSub');
  const btnApplyUpdate = document.getElementById('btnApplyUpdate');
  const btnApplyUpdateText = document.getElementById('btnApplyUpdateText');

  let activeDownloadUrl = FALLBACK_DOWNLOAD_URL;

  if (updateVersionLabel) updateVersionLabel.textContent = `Ultra v${currentVersion}`;
  if (updateSubtext) updateSubtext.textContent = "Versión más reciente";

  function compareVersions(v1, v2) {
    const parts1 = String(v1).replace(/^v/i, '').split('.').map(n => parseInt(n, 10) || 0);
    const parts2 = String(v2).replace(/^v/i, '').split('.').map(n => parseInt(n, 10) || 0);
    const maxLen = Math.max(parts1.length, parts2.length);
    for (let i = 0; i < maxLen; i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    return 0;
  }

  async function checkForUpdatesOnline(isManual = false) {
    if (btnCheckUpdate) btnCheckUpdate.classList.add('spinning');
    if (updateDotStatus) updateDotStatus.className = 'update-dot-status updating';
    if (updateSubtext) updateSubtext.textContent = 'Buscando actualizaciones...';

    try {
      let foundUpdate = false;
      let remoteVersion = null;
      let downloadUrl = null;

      try {
        const ghRes = await fetch(GITHUB_REPO_RELEASES, {
          headers: { 'Accept': 'application/vnd.github.v3+json' },
          cache: 'no-cache'
        });
        if (ghRes.ok) {
          const releases = await ghRes.json();
          if (Array.isArray(releases) && releases.length > 0) {
            for (const rel of releases) {
              const tagVer = (rel.tag_name || '').replace(/^v/i, '');
              if (compareVersions(tagVer, currentVersion) > 0) {
                remoteVersion = tagVer;
                foundUpdate = true;
                if (Array.isArray(rel.assets) && rel.assets.length > 0) {
                  const ultraAsset = rel.assets.find(a => (a.name || '').toLowerCase().includes('ultra')) ||
                                     rel.assets.find(a => (a.name || '').toLowerCase().endsWith('.zip')) ||
                                     rel.assets[0];
                  if (ultraAsset && ultraAsset.browser_download_url) {
                    downloadUrl = ultraAsset.browser_download_url;
                  }
                }
                if (!downloadUrl) downloadUrl = rel.html_url || FALLBACK_DOWNLOAD_URL;
                break;
              }
            }
          }
        }
      } catch (errGh) {}

      if (foundUpdate && remoteVersion) {
        activeDownloadUrl = downloadUrl || FALLBACK_DOWNLOAD_URL;
        if (updateDotStatus) {
          updateDotStatus.className = 'update-dot-status';
          updateDotStatus.style.background = '#60a5fa';
          updateDotStatus.style.boxShadow = '0 0 8px rgba(96, 165, 250, 0.8)';
        }
        if (updateSubtext) updateSubtext.textContent = `v${remoteVersion} disponible`;
        if (updateTargetVersion) updateTargetVersion.textContent = `Ultra v${remoteVersion} disponible`;
        if (updateAvailableBanner) updateAvailableBanner.style.display = 'flex';
      } else {
        if (updateDotStatus) {
          updateDotStatus.className = 'update-dot-status';
          updateDotStatus.style.background = '';
          updateDotStatus.style.boxShadow = '';
        }
        if (updateSubtext) updateSubtext.textContent = 'Versión más reciente';
        if (updateAvailableBanner) updateAvailableBanner.style.display = 'none';
      }
    } catch (e) {
      if (updateSubtext) updateSubtext.textContent = 'Versión más reciente';
    } finally {
      if (btnCheckUpdate) btnCheckUpdate.classList.remove('spinning');
    }
  }

  if (btnCheckUpdate) {
    btnCheckUpdate.addEventListener('click', (e) => {
      e.stopPropagation();
      checkForUpdatesOnline(true);
    });
  }

  if (btnApplyUpdate) {
    btnApplyUpdate.addEventListener('click', async (e) => {
      e.stopPropagation();
      btnApplyUpdate.disabled = true;
      if (btnApplyUpdateText) btnApplyUpdateText.textContent = "Asegurando sesión...";

      try {
        const fullStorage = await chrome.storage.local.get(null);
        if (fullStorage && fullStorage.platformUser) {
          await chrome.storage.local.set({
            ultra_session_backup: {
              platformUser: fullStorage.platformUser,
              sessionLoggedIn: true,
              flow_device_mac: fullStorage.flow_device_mac,
              extension_state: 'ACTIVE',
              backup_timestamp: Date.now()
            },
            preserve_session_after_update: true
          });
        }

        if (chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({
            action: "TRIGGER_SEAMLESS_UPDATE",
            downloadUrl: activeDownloadUrl
          });
        }

        if (chrome.runtime && chrome.runtime.requestUpdateCheck) {
          chrome.runtime.requestUpdateCheck((status) => {
            if (status === 'update_available' && chrome.runtime.reload) {
              chrome.runtime.reload();
              return;
            }
          });
        }

        if (btnApplyUpdateText) btnApplyUpdateText.textContent = "Descarga iniciada...";
        chrome.tabs.create({ url: activeDownloadUrl });

        try {
          setTimeout(() => {
            chrome.tabs.create({ url: chrome.runtime.getURL("update_guide.html") });
          }, 400);
        } catch (e) {}

        if (updateNoticeSub) {
          updateNoticeSub.innerHTML = "<span style='color:#38bdf8;font-size:10px;line-height:1.3;display:block;'>⬇️ Paquete descargado. Consulta la guía abierta.</span>";
        }

        setTimeout(() => {
          if (btnApplyUpdateText) btnApplyUpdateText.textContent = "Recargar Extensión";
          btnApplyUpdate.disabled = false;
          btnApplyUpdate.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
          btnApplyUpdate.onclick = () => {
            if (chrome.runtime && chrome.runtime.reload) {
              chrome.runtime.reload();
            } else {
              window.location.reload();
            }
          };
        }, 1500);
      } catch (err) {
        if (btnApplyUpdateText) btnApplyUpdateText.textContent = "Error al actualizar";
        btnApplyUpdate.disabled = false;
      }
    });
  }

  setTimeout(() => {
    checkForUpdatesOnline(false);
  }, 400);
});