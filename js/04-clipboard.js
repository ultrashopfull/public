const clientClipboardTimers = new WeakMap();
const clientPasteVersions = new WeakMap();
function clientClipboardNotice(message) {
  const live = document.querySelector("#clientClipboardStatus");
  live.textContent = "";
  requestAnimationFrame(() => (live.textContent = message));
}
async function pasteIntoClientField(button) {
  const input = document.getElementById(button.dataset.pasteTarget),
    hint = document.querySelector('[data-paste-hint="' + button.dataset.pasteTarget + '"]');
  if (!input || button.disabled) return;
  const phone = input.id === "createPhone",
    original = button.querySelector("span");
  const version = (clientPasteVersions.get(button) || 0) + 1;
  clientPasteVersions.set(button, version);
  clearTimeout(clientClipboardTimers.get(button));
  hint.hidden = true;
  button.disabled = true;
  button.classList.remove("is-pasted");
  original.textContent = "…";
  try {
    if (!window.isSecureContext || !navigator.clipboard?.readText) throw new Error("Clipboard unavailable");
    let value = (await navigator.clipboard.readText()).trim();
    if (clientPasteVersions.get(button) !== version || document.querySelector("#createBackdrop").hidden)
      return;
    if (!value) {
      hint.textContent = "El portapapeles está vacío.";
      hint.hidden = false;
      clientClipboardNotice(hint.textContent);
      return;
    }
    if (phone && /^[+\d\s().-]+$/.test(value)) value = value.replace(/[\s().-]/g, "");
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.focus({ preventScroll: true });
    input.setSelectionRange?.(value.length, value.length);
    button.classList.add("is-pasted");
    original.textContent = "Pegado";
    clientClipboardNotice(phone ? "Celular pegado" : "Usuario pegado");
    window.NovaMotion?.play(
      input,
      [{ boxShadow: "0 0 0 3px var(--accent-soft)" }, { boxShadow: "0 0 0 0 transparent" }],
      { duration: 650 },
    );
    clientClipboardTimers.set(
      button,
      setTimeout(() => {
        button.classList.remove("is-pasted");
        original.textContent = "Pegar";
      }, 1300),
    );
  } catch {
    if (clientPasteVersions.get(button) !== version || document.querySelector("#createBackdrop").hidden)
      return;
    input.focus({ preventScroll: true });
    hint.textContent = "Mantén pulsado el campo para pegar o usa Ctrl/⌘ + V.";
    hint.hidden = false;
    clientClipboardNotice(hint.textContent);
  } finally {
    if (clientPasteVersions.get(button) === version) {
      button.disabled = false;
      if (!button.classList.contains("is-pasted")) original.textContent = "Pegar";
    }
  }
}
async function copyClientField(index, field, trigger) {
  if (!canSell(current) || !["email", "phone"].includes(field)) return;
  const value = String(datasets[current]?.[index]?.[field] || "");
  if (!value) {
    toast(field === "phone" ? "No hay celular para copiar" : "No hay usuario para copiar");
    return;
  }
  const copied = await copyText(value);
  if (!copied) {
    toast("No se pudo copiar el dato");
    return;
  }
  const message = field === "phone" ? "CELULAR COPIADO" : "USUARIO COPIADO";
  clientClipboardNotice(message);
  clearTimeout(clientClipboardTimers.get(trigger));
  trigger.classList.add("is-copied");
  clientClipboardTimers.set(
    trigger,
    setTimeout(() => trigger.classList.remove("is-copied"), 1100),
  );
  window.NovaMotion?.row(index, "copy", { label: message });
}
document.querySelector("#createForm").addEventListener("click", (event) => {
  const button = event.target.closest("[data-paste-target]");
  if (button) {
    event.preventDefault();
    pasteIntoClientField(button);
  }
});
document.querySelector("#createForm").addEventListener("reset", () => {
  document.querySelectorAll("[data-paste-target]").forEach((button) => {
    clientPasteVersions.set(button, (clientPasteVersions.get(button) || 0) + 1);
    clearTimeout(clientClipboardTimers.get(button));
    button.disabled = false;
    button.classList.remove("is-pasted");
    button.querySelector("span").textContent = "Pegar";
  });
  document.querySelectorAll("[data-paste-hint]").forEach((hint) => (hint.hidden = true));
});
document.querySelector("#userRows").addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-copy-field]");
  if (trigger) copyClientField(Number(trigger.dataset.index), trigger.dataset.copyField, trigger);
});
