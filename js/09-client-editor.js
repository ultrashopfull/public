let clientEditDuration = "days";
function setClientEditDuration(mode) {
  clientEditDuration = mode === "custom" ? "custom" : "days";
  const custom = clientEditDuration === "custom",
    input = document.querySelector("#clientEditForm").elements.clientDays;
  document.querySelector("#clientDaysField").hidden = custom;
  input.required = !custom;
  input.disabled = custom;
  document.querySelector("#editCustom").hidden = !custom;
  document.querySelectorAll("[data-client-edit-duration]").forEach((button) => {
    const selected = button.dataset.clientEditDuration === clientEditDuration;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  if (custom) renderCalendar("edit");
}
function openClientEditor(index) {
  if(window.panelSync?.busy){toast("Espera a que termine el guardado");return;}
  if (!isAdmin() || rowActionBusy || migrationBusy) return;
  const u = datasets[current]?.[index];
  if (!u) return;
  window.panelSync?.remember("clientEditor",u);
  const form = document.querySelector("#clientEditForm");
  form.dataset.index = index;
  form.dataset.license = current;
  form.elements.clientEmail.value = u.email || "";
  form.elements.clientPhone.value = u.phone || "";
  if (form.elements.clientCodex) form.elements.clientCodex.checked = !!u.codexEnabled;
  form.elements.clientDays.value = u.isTrial ? Math.ceil((getTimeLeft(u) || 0) / 60000) : getDaysLeft(u);
  document.querySelector("#clientDaysLabel").textContent = u.isTrial ? "Minutos de prueba" : "Días restantes";
  document.querySelector('[data-client-edit-duration="days"]').textContent = u.isTrial
    ? "Por minutos"
    : "Por días";
  const start = u.startDate && !isNaN(new Date(u.startDate)) ? dateLocal(new Date(u.startDate)) : null,
    end = u.endDate && !isNaN(new Date(u.endDate)) ? dateLocal(new Date(u.endDate)) : null;
  rangeState.edit = {
    month: start
      ? new Date(start.slice(0, 7) + "-01T12:00:00")
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    start,
    end,
  };
  setClientEditDuration("days");
  document.querySelector("#clientEditBackdrop").hidden = false;
  form.elements.clientEmail.focus();
}
async function saveClientEditor(event) {
  event.preventDefault();
  if (!isAdmin() || rowActionBusy || migrationBusy) return;
  const form = event.currentTarget,
    index = Number(form.dataset.index),
    license = form.dataset.license,
    u = window.panelSync?.connected() ? panelSync.targets.get("clientEditor") : datasets[license]?.[index];
  if (!u || license !== current) return;
  const email = form.elements.clientEmail.value.trim(),
    phone = form.elements.clientPhone.value.trim(),
    codexEnabled = !!(form.elements.clientCodex && form.elements.clientCodex.checked),
    rawDays = form.elements.clientDays.value,
    days = Number(rawDays);
  if (!email || (clientEditDuration === "days" && (rawDays === "" || !Number.isInteger(days) || days < 0))) {
    form.reportValidity();
    return;
  }
  const range = clientEditDuration === "custom" ? getRange("edit") : null;
  if (clientEditDuration === "custom" && !range) return;
  if(window.panelSync?.connected())return panelRemote("clientEditor",{u,email,phone,days,range,codexEnabled});
  if (typeof window.sbConfigured === "function" && window.sbConfigured() && u._clientId && !u.isTrial) {
    rowActionBusy = true;
    try {
      const productKey = (u._product || license).toLowerCase();
      const payload = {
        cliente_id: u._clientId,
        usuario: email,
        telefono: phone,
        producto: productKey,
      };
      if (range) {
        payload.dias = Math.max(0, Math.ceil((range.end - Date.now()) / 86400000));
        payload.fecha_vencimiento = dateLocal(range.end);
        payload.dias_totales = range.total;
      } else {
        payload.dias = days;
        payload.dias_totales = Math.max(Number(u.total) || 0, days);
      }
      await window.sbApi("editar_cliente", "POST", payload);
      if (typeof window.sbLoadClients === "function") await window.sbLoadClients();
      closeDialog("#clientEditBackdrop");
      render();
      toast("Cliente actualizado");
    } catch (e) {
      if (typeof toast === "function") toast("Error Supabase: " + e.message, "error");
    } finally {
      rowActionBusy = false;
    }
    return;
  }
  rowActionBusy = true;
  u.email = email;
  u.phone = phone;
  const previous = u.isTrial ? Math.ceil((getTimeLeft(u) || 0) / 60000) : getDaysLeft(u);
  if (range) {
    Object.assign(u, {
      isTrial: false,
      expiresAt: null,
      startDate: range.start.toISOString(),
      endDate: range.end.toISOString(),
      total: range.total,
      left: Math.max(0, Math.ceil((range.end - Date.now()) / 86400000)),
    });
    if (u.status !== "Suspendido") u.status = range.end > Date.now() ? "Activo" : "Inactivo";
  } else if (days !== previous) {
    u.left = days;
    if (u.isTrial) {
      u.expiresAt = Date.now() + days * 60000;
      u.endDate = new Date(u.expiresAt).toISOString();
    } else {
      u.endDate = addDays(new Date(), days).toISOString();
      u.total = Math.max(Number(u.total) || 0, days);
    }
    if (u.status !== "Suspendido") u.status = days > 0 ? "Activo" : "Inactivo";
  }
  persist();
  closeDialog("#clientEditBackdrop");
  render();
  window.NovaMotion?.row(index, "edit");
  toast("Cliente actualizado");
  rowActionBusy = false;
}
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector("#resetClientPasswordBtn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    const form = document.querySelector("#clientEditForm");
    if (!form) return;
    const index = Number(form.dataset.index);
    const u = datasets[current]?.[index];
    if (!u || !u._clientId) {
      toast("Guarda el cliente primero para poder restablecer la contraseña", "error");
      return;
    }
    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = "Restableciendo...";
    try {
      const result = await window.sbApi("resetear_password_cliente", "POST", { cliente_id: u._clientId });
      if (result && result.success && result.password) {
        rememberClientPassword(u._clientId, result.password);
        const hint = document.querySelector("#resetClientPasswordHint");
        if (hint) hint.textContent = "Nueva contraseña: " + result.password;
        toast("Contraseña restablecida. Nueva: " + result.password);
      } else {
        toast("No se pudo restablecer la contraseña", "error");
      }
    } catch (e) {
      toast("Error: " + (e.message || e), "error");
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  });
});

document.querySelector("#clientEditForm").addEventListener("submit", saveClientEditor);
document
  .querySelectorAll("[data-client-edit-duration]")
  .forEach((button) =>
    button.addEventListener("click", () => setClientEditDuration(button.dataset.clientEditDuration)),
  );
