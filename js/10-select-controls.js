function syncNovaSelect(id) {
  const select = document.getElementById(id),
    wrapper = select.closest(".nova-select");
  if (!wrapper) return;
  const trigger = wrapper.querySelector(".nova-select-trigger"),
    list = wrapper.querySelector(".nova-select-options");
  trigger.querySelector("[data-select-value]").textContent =
    select.selectedOptions[0]?.textContent || "Seleccionar";
  list.innerHTML = [...select.options]
    .filter((option) => !option.hidden)
    .map(
      (option) =>
        `<button type="button" role="option" data-value="${esc(option.value)}" aria-selected="${option.selected}">${esc(option.textContent)}</button>`,
    )
    .join("");
}
function closeNovaSelect(wrapper) {
  if (!wrapper) return;
  wrapper.querySelector(".nova-select-options").hidden = true;
  wrapper.querySelector(".nova-select-trigger").setAttribute("aria-expanded", "false");
}
document.querySelectorAll(".nova-select").forEach((wrapper) => {
  const select = wrapper.querySelector("select"),
    trigger = wrapper.querySelector(".nova-select-trigger"),
    list = wrapper.querySelector(".nova-select-options");
  syncNovaSelect(select.id);
  trigger.addEventListener("click", () => {
    const open = list.hidden;
    document.querySelectorAll(".nova-select").forEach(closeNovaSelect);
    list.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
    if (open) list.querySelector('[aria-selected="true"]')?.focus({ preventScroll: true });
  });
  list.addEventListener("click", (event) => {
    const option = event.target.closest("[data-value]");
    if (!option) return;
    select.value = option.dataset.value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    syncNovaSelect(select.id);
    closeNovaSelect(wrapper);
    trigger.focus({ preventScroll: true });
  });
  wrapper.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNovaSelect(wrapper);
      trigger.focus({ preventScroll: true });
      return;
    }
    if (list.hidden) return;
    const options = [...list.querySelectorAll("button")],
      i = options.indexOf(document.activeElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      options[(i + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length]?.focus({
        preventScroll: true,
      });
    }
  });
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".nova-select"))
    document.querySelectorAll(".nova-select").forEach(closeNovaSelect);
});

function staffRowFeedback(id, label, kind = "normal") {
  const row = document.querySelector(`[data-staff-id="${CSS.escape(id)}"]`);
  if (!row || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const rect = row.getBoundingClientRect(),
    overlay = document.createElement("div");
  overlay.className = "staff-action-feedback";
  overlay.setAttribute("aria-hidden", "true");
  overlay.inert = true;
  Object.assign(overlay.style, {
    left: rect.left + "px",
    top: rect.top + "px",
    width: rect.width + "px",
    height: rect.height + "px",
  });
  overlay.style.setProperty(
    "--staff-feedback",
    kind === "delete" ? "#d24558" : kind === "active" ? "#319b79" : "#6759cf",
  );
  overlay.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12.5 9 17l11-11"/></svg><strong></strong>';
  overlay.querySelector("strong").textContent = label;
  document.body.append(overlay);
  setTimeout(() => overlay.remove(), 1580);
}
document.querySelector("#staffConfirmAction").addEventListener(
  "click",
  () => {
    if (!staffPending || window.panelSync?.connected()) return;
    const { action, id } = staffPending,
      u = staffUsers.find((item) => item.id === id);
    if (!u) return;
    staffRowFeedback(
      id,
      action === "delete" ? "USUARIO ELIMINADO" : u.active ? "ACCESO SUSPENDIDO" : "ACCESO REACTIVADO",
      action === "delete" ? "delete" : u.active ? "normal" : "active",
    );
  },
  true,
);
