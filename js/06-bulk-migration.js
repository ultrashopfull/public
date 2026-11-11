const BULK_JOB_KEY = "nova-bulk-migrations-v1",
  BULK_INTERVAL = 20 * 60 * 1000;
let bulkLicense = null,
  bulkMode = "now",
  bulkSelected = new Set(),
  bulkAllMode = true,
  bulkExecutionBusy = false;
function readBulkJobs() {
  try {
    const jobs = JSON.parse(localStorage.getItem(BULK_JOB_KEY) || "[]");
    return Array.isArray(jobs) ? jobs.filter((job) => job && Array.isArray(job.pendingIds)) : [];
  } catch {
    return [];
  }
}
function saveBulkJobs(jobs) {
  const active = jobs.filter((job) => ["running", "paused"].includes(job.status)),
    history = jobs.filter((job) => !["running", "paused"].includes(job.status)).slice(-20);
  localStorage.setItem(BULK_JOB_KEY, JSON.stringify([...history, ...active]));
}
function activeBulkJob(license) {
  return readBulkJobs().find((job) => job.license === license && ["running", "paused"].includes(job.status));
}
function bulkId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    "client-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10)
  );
}
function ensureBulkClientIds(license) {
  const used = new Set();
  let changed = false;
  for (const client of datasets[license] || []) {
    if (!client.id || used.has(client.id)) {
      client.id = bulkId();
      changed = true;
    }
    used.add(client.id);
  }
  if (changed) persist();
}
function bulkEligible() {
  const destination = Number(document.querySelector("#bulkDestination").value);
  return (datasets[bulkLicense] || []).filter((client) => Number(client.account) !== destination);
}
function selectedBulkIds() {
  return bulkEligible()
    .filter((client) => bulkSelected.has(client.id))
    .map((client) => client.id);
}
function openBulkMigrator() {
  if(window.panelSync?.busy){toast("Espera a que termine el guardado");return;}
  if (!isAdmin() || migrationBusy || rowActionBusy) return;
  bulkLicense = current;
  const accounts = sellableAccounts(bulkLicense);
  if (!accounts.length) {
    toast("No hay una cuenta de destino activa");
    return;
  }
  try {
    ensureBulkClientIds(bulkLicense);
  } catch {
    toast("No se pudo guardar la selección");
    return;
  }
  bulkMode = "now";
  bulkAllMode = true;
  document.querySelector("#bulkLicenseName").textContent = bulkLicense;
  document.querySelector("#bulkDestination").innerHTML = accounts
    .map((number) => `<option value="${number}">${esc(accountCaption(bulkLicense, number))}</option>`)
    .join("");
  syncNovaSelect("bulkDestination");
  closeNovaSelect(document.querySelector('[data-select="bulkDestination"]'));
  document.querySelector("#bulkSearch").value = "";
  bulkSelected = new Set(bulkEligible().map((client) => client.id));
  setBulkMode("now");
  renderBulkClients();
  document.querySelector("#bulkMigrateBackdrop").hidden = false;
  renderBulkJobPanel();
}
function setBulkMode(mode) {
  bulkMode = mode === "timer" ? "timer" : "now";
  document.querySelectorAll("[data-bulk-mode]").forEach((button) => {
    const selected = button.dataset.bulkMode === bulkMode;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  document.querySelector("#bulkTimerNote").hidden = bulkMode !== "timer";
  document.querySelector("#bulkModeHint").textContent =
    bulkMode === "timer"
      ? "Cinco al iniciar y cinco cada 20 minutos."
      : "Se migrarán juntos los clientes seleccionados.";
  renderBulkJobPanel();
}
function renderBulkClients() {
  if (!bulkLicense) return;
  const destination = Number(document.querySelector("#bulkDestination").value),
    query = document.querySelector("#bulkSearch").value.trim().toLowerCase(),
    eligible = bulkEligible(),
    selected = selectedBulkIds();
  const rows = (datasets[bulkLicense] || []).filter((client) =>
    ((client.email || "") + " " + (client.phone || "")).toLowerCase().includes(query),
  );
  document.querySelector("#bulkClientList").innerHTML = rows.length
    ? rows
        .map((client) => {
          const same = Number(client.account) === destination;
          return `<label class="bulk-client ${same ? "is-destination" : ""}"><input type="checkbox" data-bulk-client="${esc(client.id)}" ${!same && bulkSelected.has(client.id) ? "checked" : ""} ${same ? "disabled" : ""}><span><strong>${esc(client.email || "Sin usuario")}</strong><small>${esc(client.phone || "Sin celular")}</small></span><em>${esc(accountCaption(bulkLicense, client.account))}${same ? " · Actual en destino" : ""}</em></label>`;
        })
        .join("")
    : '<p class="bulk-empty">No hay clientes con esos datos.</p>';
  const all = document.querySelector("#bulkSelectAll");
  all.checked = eligible.length > 0 && selected.length === eligible.length;
  all.indeterminate = selected.length > 0 && selected.length < eligible.length;
  all.disabled = !eligible.length;
  document.querySelector("#bulkSelectedCount").textContent = selected.length + " de " + eligible.length;
  renderBulkJobPanel();
}
function renderBulkJobPanel() {
  const jobs = readBulkJobs(),
    active = jobs.filter((job) => ["running", "paused"].includes(job.status));
  const backdrop = document.querySelector("#bulkMigrateBackdrop");
  if (backdrop.hidden || !bulkLicense) return;
  const panel = document.querySelector("#bulkJobPanel"),
    job = jobs.filter((item) => item.license === bulkLicense).at(-1),
    running = active.find((item) => item.license === bulkLicense);
  if (!job) {
    panel.hidden = true;
  } else {
    const pending = job.pendingIds.length,
      complete = job.total - pending,
      progress = job.total ? Math.round((complete / job.total) * 100) : 100,
      seconds = Math.max(0, Math.ceil(((job.nextRunAt || Date.now()) - Date.now()) / 1000)),
      clock = String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");
    const state =
      job.status === "running"
        ? "Próxima tanda · " + clock
        : job.status === "paused"
          ? "En pausa"
          : job.status === "completed"
            ? "Completada"
            : "Cancelada";
    panel.hidden = false;
    panel.innerHTML = `<div class="bulk-job-title"><strong>${job.mode === "timer" ? "5 cada 20 min" : "Migración masiva"} · ${esc(accountCaption(job.license, job.destination))}</strong><span>${esc(state)}</span></div><p>${job.migrated || 0} migrados · ${pending} pendientes${job.skipped ? " · " + job.skipped + " omitidos" : ""}${job.reason ? "<br>" + esc(job.reason) : ""}</p><span class="bulk-job-progress"><i style="width:${progress}%"></i></span>${["running", "paused"].includes(job.status) ? `<div class="bulk-job-actions"><button type="button" data-bulk-job-action="${job.status === "paused" ? "resume" : "pause"}" data-job-id="${esc(job.id)}">${job.status === "paused" ? "Continuar" : "Pausar"}</button><button type="button" data-bulk-job-action="cancel" data-job-id="${esc(job.id)}">Cancelar cola</button></div>` : ""}`;
  }
  const submit = document.querySelector("#bulkStartBtn");
  submit.disabled = !!running || !selectedBulkIds().length || bulkExecutionBusy;
  submit.textContent = running
    ? "Hay una cola activa"
    : bulkMode === "timer"
      ? "Iniciar tandas de 5"
      : "Migrar " + selectedBulkIds().length + " clientes";
}
function takeBulkBatch(job, clients, limit) {
  const byId = new Map(clients.map((client) => [client.id, client])),
    changes = [];
  let skipped = 0;
  while (job.pendingIds.length && changes.length < limit) {
    const id = job.pendingIds.shift(),
      client = byId.get(id);
    if (!client || Number(client.account) === Number(job.destination)) {
      skipped++;
      continue;
    }
    changes.push({ client, from: client.account, id });
    client.account = Number(job.destination);
  }
  job.migrated = (job.migrated || 0) + changes.length;
  job.skipped = (job.skipped || 0) + skipped;
  job.status = job.pendingIds.length ? "running" : "completed";
  job.nextRunAt = job.pendingIds.length ? Date.now() + BULK_INTERVAL : null;
  job.lastRunAt = Date.now();
  job.reason = "";
  return changes;
}
function bulkPanelReady() {
  if (
    window.panelSync?.mode === "legacy" ||
    window.panelSync?.busy ||
    document.querySelector("#app").hidden ||
    !isAdmin() ||
    migrationBusy ||
    rowActionBusy ||
    bulkExecutionBusy
  )
    return false;
  return ![...document.querySelectorAll(".modal-backdrop:not([hidden])")].some(
    (modal) => modal.id !== "bulkMigrateBackdrop",
  );
}
function refreshBulkData() {
  const state = readStored(STORE_KEY, null),
    masters = readStored(MASTER_KEY, null),
    team = readStored(STAFF_KEY, null);
  if (
    state?.datasets &&
    typeof state.datasets === "object" &&
    !Array.isArray(state.datasets) &&
    Object.values(state.datasets).every(Array.isArray)
  ) {
    datasets = state.datasets;
    licenseColors = { ...defaultColors, ...(state.licenseColors || {}) };
    adminName = state.adminName || adminName;
  }
  if (masters && typeof masters === "object" && !Array.isArray(masters)) masterAccounts = masters;
  if (Array.isArray(team)) staffUsers = team;
}
async function executeBulkJob(id, showStage = false) {
  if (!bulkPanelReady()) return;
  if(window.panelSync?.connected()){
    const ok=await panelRemote("bulkRun",{id,showStage});
    if(!ok){
      // El servidor rechazó la operación (400/error). Para evitar que el
      // setInterval de 1 s reintente sin parar, pausamos la cola localmente
      // y pedimos un refresh para sincronizar el estado real de la base.
      const jobs=readBulkJobs(),job=jobs.find(j=>j.id===id);
      if(job&&job.status==="running"){
        job.status="paused";
        job.remainingMs=0;
        job.reason="Error al sincronizar. Recarga y reanuda la cola.";
        try{saveBulkJobs(jobs);}catch{}
        renderBulkJobPanel();
        window.panelSync?.refresh(true).catch(()=>{});
      }
    }
    return ok;
  }
  bulkExecutionBusy = true;
  migrationBusy = true;
  const backdrop = document.querySelector("#bulkMigrateBackdrop"),
    stage = document.querySelector("#bulkRunStage");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let changes = [],
    originalData = null,
    dataWritten = false,
    phaseTimer = null;
  try {
    let jobs = readBulkJobs(),
      job = jobs.find((item) => item.id === id);
    if (!job || job.status !== "running") return;
    if (showStage) {
      const batchSize = Math.min(job.mode === "timer" ? 5 : job.pendingIds.length, job.pendingIds.length);
      backdrop.style.setProperty("--accent", licenseColors[job.license] || "#10a37f");
      backdrop.classList.add("is-bulk-running");
      stage.classList.remove("is-complete", "is-error");
      document.querySelector("#bulkRunTitle").textContent = "Migrando accesos";
      document.querySelector("#bulkRunCaption").textContent =
        batchSize + " clientes → " + accountCaption(job.license, job.destination);
      document.querySelector("#bulkRunCounter").textContent = "0 de " + batchSize;
      document.querySelector("#bulkRunPhase").textContent = "Preparando la transferencia…";
      stage.hidden = false;
      if (!reduced) {
        phaseTimer = setTimeout(() => {
          document.querySelector("#bulkRunPhase").textContent = "Transfiriendo accesos…";
        }, 500);
        await new Promise((resolve) => setTimeout(resolve, 1400));
      }
      document.querySelector("#bulkRunPhase").textContent = "Confirmando los cambios…";
    }
    jobs = readBulkJobs();
    job = jobs.find((item) => item.id === id);
    if (!job || job.status !== "running") return;
    refreshBulkData();
    const owner = staffUsers.find((user) => user.id === job.ownerId && user.active && user.role === "admin");
    if (
      !isAdmin() ||
      !owner ||
      !(job.license in datasets) ||
      !sellableAccounts(job.license).includes(Number(job.destination))
    ) {
      job.status = "paused";
      job.remainingMs = 0;
      job.reason = "Revisa el usuario que programó la cola y la cuenta de destino.";
      saveBulkJobs(jobs);
      toast("No se puede continuar la migración; la cola quedó en pausa");
      return;
    }
    originalData = localStorage.getItem(STORE_KEY);
    changes = takeBulkBatch(job, datasets[job.license], job.mode === "timer" ? 5 : Number.POSITIVE_INFINITY);
    persist();
    dataWritten = true;
    saveBulkJobs(jobs);
    render();
    if (activeView === "masters" && isAdmin()) renderMasters();
    if (job.license === current)
      for (const change of changes) {
        const index = datasets[current].findIndex((client) => client.id === change.id);
        if (index >= 0) window.NovaMotion?.row(index, "migrate");
      }
    if (showStage) {
      stage.classList.add("is-complete");
      document.querySelector("#bulkRunTitle").textContent = job.pendingIds.length
        ? "Tanda completada"
        : "Migración completada";
      document.querySelector("#bulkRunCounter").textContent = changes.length + " migrados";
      document.querySelector("#bulkRunPhase").textContent = job.pendingIds.length
        ? job.pendingIds.length + " pendientes para la siguiente tanda"
        : "Todos los cambios guardados";
      document.querySelector("#bulkRunCaption").textContent =
        changes.length + " accesos migrados a " + accountCaption(job.license, job.destination);
      if (!reduced) await new Promise((resolve) => setTimeout(resolve, 850));
      closeDialog("#bulkMigrateBackdrop");
    }
  } catch {
    for (const change of changes) change.client.account = change.from;
    if (dataWritten && originalData !== null)
      try {
        localStorage.setItem(STORE_KEY, originalData);
      } catch {}
    if (showStage) {
      stage.classList.add("is-error");
      document.querySelector("#bulkRunTitle").textContent = "No se pudo completar";
      document.querySelector("#bulkRunPhase").textContent = "La cola se conserva para reintentar";
      if (!reduced) await new Promise((resolve) => setTimeout(resolve, 900));
    }
    toast("No se pudo guardar la migración; la cola se conserva");
  } finally {
    clearTimeout(phaseTimer);
    backdrop.classList.remove("is-bulk-running");
    stage.classList.remove("is-complete", "is-error");
    stage.hidden = true;
    bulkExecutionBusy = false;
    migrationBusy = false;
    renderBulkJobPanel();
  }
}
async function runBulkJob(id, showStage = false) {
  if (navigator.locks?.request) {
    let entered = false;
    try {
      return await navigator.locks.request("nova-bulk-migration", { ifAvailable: true }, (lock) => {
        if (!lock) return;
        entered = true;
        return executeBulkJob(id, showStage);
      });
    } catch (error) {
      if (entered) throw error;
    }
  }
  return executeBulkJob(id, showStage);
}
async function runDueBulkJobs() {
  if (!bulkPanelReady()) return;
  const job = readBulkJobs().find(
    (item) => item.status === "running" && Number(item.nextRunAt) <= Date.now(),
  );
  if (job) await runBulkJob(job.id, !document.querySelector("#bulkMigrateBackdrop").hidden);
}
async function startBulkMigration(event) {
  event.preventDefault();
  if (!isAdmin() || migrationBusy || rowActionBusy || bulkExecutionBusy) return;
  if (activeBulkJob(bulkLicense)) {
    toast("Espera: hay una cola activa para esta licencia");
    return;
  }
  const destination = Number(document.querySelector("#bulkDestination").value),
    ids = selectedBulkIds();
  if (!ids.length) {
    toast("Selecciona al menos un cliente");
    return;
  }
  if (!sellableAccounts(bulkLicense).includes(destination)) {
    toast("Selecciona una cuenta de destino activa");
    return;
  }
  const job = {
    id: bulkId(),
    license: bulkLicense,
    destination,
    mode: bulkMode,
    ownerId: sessionUserId,
    pendingIds: [...ids],
    total: ids.length,
    migrated: 0,
    skipped: 0,
    status: "running",
    nextRunAt: Date.now(),
    createdAt: Date.now(),
  };
  if(window.panelSync?.connected())return panelRemote("bulkStart",{job});
  try {
    saveBulkJobs([...readBulkJobs(), job]);
  } catch {
    toast("No se pudo guardar la cola");
    return;
  }
  await runBulkJob(job.id, true);
  renderBulkJobPanel();
}
function controlBulkJob(action, id) {
  if (!isAdmin() || bulkExecutionBusy) return;
  if(window.panelSync?.connected())return panelRemote("bulkControl",{action,id});
  const jobs = readBulkJobs(),
    job = jobs.find((item) => item.id === id);
  if (!job || !["running", "paused"].includes(job.status)) return;
  if (action === "cancel") {
    job.status = "cancelled";
    job.nextRunAt = null;
    job.reason = "";
  } else if (action === "pause") {
    job.remainingMs = Math.max(0, (job.nextRunAt || Date.now()) - Date.now());
    job.status = "paused";
    job.reason = "";
  } else if (action === "resume") {
    if (!sellableAccounts(job.license).includes(Number(job.destination))) {
      toast("No hay una cuenta de destino activa");
      return;
    }
    job.status = "running";
    job.nextRunAt = Date.now() + (job.remainingMs || 0);
    job.reason = "";
  }
  try {
    saveBulkJobs(jobs);
  } catch {
    toast("No se pudo guardar la cola");
    return;
  }
  renderBulkJobPanel();
  if (action === "resume") runDueBulkJobs();
}
document.querySelector("#bulkMigrateBtn").addEventListener("click", openBulkMigrator);
// This modal is inserted after the original dialogs were bound.
const bulkBackdrop = document.querySelector("#bulkMigrateBackdrop");
bulkBackdrop
  .querySelector("[data-close]")
  .addEventListener("click", () => closeDialog("#bulkMigrateBackdrop"));
bulkBackdrop.addEventListener("click", (event) => {
  if (event.target === bulkBackdrop) closeDialog("#bulkMigrateBackdrop");
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !bulkBackdrop.hidden) {
    const options = bulkBackdrop.querySelector(".nova-select-options");
    if (options && !options.hidden) return;
    closeDialog("#bulkMigrateBackdrop");
  }
});
document.querySelector("#bulkMigrateForm").addEventListener("submit", startBulkMigration);
document.querySelector("#bulkDestination").addEventListener("change", () => {
  if (bulkAllMode) bulkSelected = new Set(bulkEligible().map((client) => client.id));
  renderBulkClients();
});
document.querySelector("#bulkSearch").addEventListener("input", renderBulkClients);
document.querySelector("#bulkSelectAll").addEventListener("change", (event) => {
  bulkAllMode = event.target.checked;
  bulkSelected = new Set(event.target.checked ? bulkEligible().map((client) => client.id) : []);
  renderBulkClients();
});
document.querySelector("#bulkClientList").addEventListener("change", (event) => {
  const input = event.target.closest("[data-bulk-client]");
  if (!input) return;
  bulkAllMode = false;
  if (input.checked) bulkSelected.add(input.dataset.bulkClient);
  else bulkSelected.delete(input.dataset.bulkClient);
  renderBulkClients();
});
document
  .querySelectorAll("[data-bulk-mode]")
  .forEach((button) => button.addEventListener("click", () => setBulkMode(button.dataset.bulkMode)));
document.querySelector("#bulkJobPanel").addEventListener("click", (event) => {
  const button = event.target.closest("[data-bulk-job-action]");
  if (button) controlBulkJob(button.dataset.bulkJobAction, button.dataset.jobId);
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) runDueBulkJobs();
});
window.addEventListener("storage", (event) => {
  if (event.key === BULK_JOB_KEY) renderBulkJobPanel();
});
setInterval(() => {
  renderBulkJobPanel();
  runDueBulkJobs();
}, 1000);
window.NovaBulk = { refresh: renderBulkJobPanel, runDue: runDueBulkJobs };
