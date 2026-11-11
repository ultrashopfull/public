let refreshingPanel = false;
function beginRefreshMotion() {
  return beginPanelRefresh();
}
async function refreshPanelData() {
  if (refreshingPanel) return;
  if (
    window.panelSync?.busy ||
    rowActionBusy ||
    migrationBusy ||
    activeInline ||
    document.querySelector(".modal-backdrop:not([hidden])")
  ) {
    toast("Espera a que termine la acción o cierra el formulario");
    return;
  }
  const button = document.querySelector("#refreshDataBtn"),
    status = document.querySelector("#refreshStatus");
  const scene = beginRefreshMotion();
  refreshingPanel = true;
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  button.classList.remove("is-refreshed");
  button.classList.add("is-refreshing");
  try {
    if (window.sbConfigured?.()) {
      if(window.panelSync)await panelSync.refresh(true,true);else await window.sbLoadAll();
      await updateMasterCodes();
      window.NovaBulk?.refresh();
      status.textContent = "Datos actualizados";
      scene.complete(true);
      return;
    }
    const state = JSON.parse(localStorage.getItem(STORE_KEY) || "null"),
      team = JSON.parse(localStorage.getItem(STAFF_KEY) || "null"),
      masters = JSON.parse(localStorage.getItem(MASTER_KEY) || "null");
    if (
      state &&
      (!state.datasets ||
        Array.isArray(state.datasets) ||
        typeof state.datasets !== "object" ||
        !Object.values(state.datasets).every(Array.isArray))
    )
      throw new Error("Invalid clients");
    if (team && !Array.isArray(team)) throw new Error("Invalid staff");
    if (
      masters &&
      (Array.isArray(masters) || typeof masters !== "object" || !Object.values(masters).every(Array.isArray))
    )
      throw new Error("Invalid licenses");
    if (state) {
      datasets = state.datasets;
      licenseColors = { ...defaultColors, ...(state.licenseColors || {}) };
      adminName = state.adminName || "Víctor";
    }
    if (team) staffUsers = team;
    if (masters) masterAccounts = masters;
    if (!currentStaff()) {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_USER_KEY);
      document.querySelector("#app").hidden = true;
      document.querySelector("#loginScreen").hidden = false;
      document.querySelector("#loginUser").focus();
      scene.complete(false);
      toast("Ingresa nuevamente para continuar");
      return;
    }
    const rail = document.querySelector("#tabs"),
      manager = null;
    for (const tab of rail.querySelectorAll("[data-license]"))
      if (!(tab.dataset.license in datasets)) tab.remove();
    for (const name of Object.keys(datasets)) {
      if ([...rail.querySelectorAll("[data-license]")].some((tab) => tab.dataset.license === name)) continue;
      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = "tab";
      tab.dataset.license = name;
      tab.textContent = name + " ";
      const count = document.createElement("span");
      count.className = "tab-count";
      tab.append(count);
      bindLicenseTab(tab);
      rail.insertBefore(tab, manager);
    }
    if (!(current in datasets)) current = allowedLicenses()[0] || Object.keys(datasets)[0] || "";
    if (!(masterLicense in datasets)) masterLicense = current;
    expireSubscriptions();
    applyRole();
    if (isAdmin()) {
      renderStaff();
      renderMasters();
    }
    await updateMasterCodes();
    window.NovaBulk?.refresh();
    status.textContent = "Datos actualizados";
    scene.complete(true);
  } catch {
    status.textContent = "No se pudo actualizar";
    scene.complete(false);
    toast("No se pudo actualizar los datos");
  } finally {
    await scene.finished;
    refreshingPanel = false;
    button.disabled = false;
    button.removeAttribute("aria-busy");
    button.classList.remove("is-refreshing", "is-refreshed");
  }
}
document.querySelector("#refreshDataBtn").addEventListener("click", refreshPanelData);
