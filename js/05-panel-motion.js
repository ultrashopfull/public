let panelMotionCleanup = null;
function beginPanelRefresh() {
  panelMotionCleanup?.();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches,
    button = document.querySelector("#refreshDataBtn");
  let finished = false,
    settled = false,
    timer = 0,
    frame = 0,
    resolve;
  const animations = [],
    done = new Promise((complete) => (resolve = complete));
  function cleanup() {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    animations.forEach((animation) => animation.cancel());
    button.classList.remove("is-refreshed");
    if (panelMotionCleanup === cleanup) panelMotionCleanup = null;
    resolve();
  }
  panelMotionCleanup = cleanup;
  return {
    finished: done,
    complete(success) {
      if (finished || settled) return;
      settled = true;
      if (reduced || !success) {
        cleanup();
        return;
      }
      frame = requestAnimationFrame(() => {
        if (finished) return;
        const selector =
          ".topbar,.workspace:not([hidden]) .management-head,.workspace:not([hidden]) .tabs-wrap,.workspace:not([hidden]) .toolbar,.workspace:not([hidden]) #userRows>tr,#staffView:not([hidden]) .management-head,#staffView:not([hidden]) #staffRows>tr,#mastersView:not([hidden]) .management-head,#mastersView:not([hidden]) #masterTabs,#mastersView:not([hidden]) #masterCardGrid>article,#mastersView:not([hidden]) .master-add-card";
        const elements = [...document.querySelectorAll(selector)].filter((element) => {
          const rect = element.getBoundingClientRect();
          return element.getClientRects().length && rect.bottom > -30 && rect.top < innerHeight + 60;
        });
        elements.slice(0, 30).forEach((element, index) => {
          const animation = window.NovaMotion?.play(
            element,
            [
              { opacity: 0, transform: "translateY(8px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            {
              duration: 780,
              delay: Math.min(index, 14) * 30,
              easing: "cubic-bezier(.22,1,.36,1)",
              fill: "backwards",
            },
          );
          if (animation) animations.push(animation);
        });
        timer = setTimeout(
          () => {
            button.classList.add("is-refreshed");
            timer = setTimeout(cleanup, 200);
          },
          780 + Math.min(Math.max(0, elements.length - 1), 14) * 30,
        );
      });
    },
  };
}
let themeMotionCleanup = null,
  themeMotionSerial = 0;
window.novaThemeMotion = (button, commit, target) => {
  themeMotionCleanup?.();
  const root = document.documentElement,
    reduced = matchMedia("(prefers-reduced-motion: reduce)").matches,
    id = ++themeMotionSerial;
  window.novaThemeTarget = target || null;
  let transition = null,
    timer = 0,
    frame = 0,
    applied = false,
    finished = false;
  function apply() {
    if (id !== themeMotionSerial || applied) return;
    applied = true;
    commit();
  }
  function cleanup() {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    transition?.skipTransition();
    if (id === themeMotionSerial) {
      root.classList.remove("theme-changing", "theme-native", "theme-feathered");
      window.novaThemeTarget = null;
    }
    if (themeMotionCleanup === cleanup) themeMotionCleanup = null;
  }
  function fallback() {
    if (id !== themeMotionSerial) return;
    root.classList.remove("theme-native", "theme-feathered");
    root.classList.add("theme-changing");
    apply();
    frame = requestAnimationFrame(() => {
      if (id !== themeMotionSerial) return;
      window.NovaMotion?.play(
        button.querySelector(root.dataset.theme === "dark" ? ".theme-moon" : ".theme-sun"),
        [
          { opacity: 0.2, transform: "translateY(3px) rotate(-12deg)" },
          { opacity: 1, transform: "translateY(0) rotate(0)" },
        ],
        { duration: 500, channel: "theme-icon" },
      );
    });
    timer = setTimeout(cleanup, 640);
  }
  themeMotionCleanup = cleanup;
  if (reduced) {
    apply();
    cleanup();
    return;
  }
  if (typeof document.startViewTransition !== "function") {
    fallback();
    return;
  }
  const rect = button.getBoundingClientRect(),
    x = rect.left + rect.width / 2,
    y = rect.top + rect.height / 2,
    radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 4;
  root.style.setProperty("--theme-origin-x", x + "px");
  root.style.setProperty("--theme-origin-y", y + "px");
  root.style.setProperty("--theme-radius", radius + "px");
  root.classList.add("theme-native");
  root.classList.toggle("theme-feathered", typeof globalThis.CSS?.registerProperty === "function");
  try {
    transition = document.startViewTransition(apply);
    transition.ready.catch(() => {});
    transition.updateCallbackDone.catch(() => {
      if (id === themeMotionSerial && !finished) fallback();
    });
    transition.finished.then(cleanup, cleanup);
    timer = setTimeout(() => {
      apply();
      cleanup();
    }, 1700);
  } catch {
    fallback();
  }
};

const masterToggleEffects = new WeakMap();
async function toggleMasterAnimated(master, input) {
  if(window.panelSync?.connected())return panelRemote("masterToggle",{master,input});
  const previous = master.enabled,
    enabled = input.checked,
    card = input.closest(".master-card");
  master.enabled = enabled;
  if (typeof window.sbConfigured === "function" && window.sbConfigured() && master._id) {
    try {
      await window.sbApi("cambiar_estado_cuenta", "POST", {
        cuenta_id: master._id,
        nuevo_estado: enabled ? "activa" : "baneada",
      });
    } catch (e) {
      master.enabled = previous;
      input.checked = previous;
      if (typeof toast === "function") toast("Error Supabase: " + e.message, "error");
      return;
    }
  }
  try {
    persistMasters();
  } catch {
    master.enabled = previous;
    input.checked = previous;
    toast("No se pudo guardar el estado");
    return;
  }
  const days = masterDays(master),
    active = enabled && !days.expired && !days.future,
    badge = card.querySelector(".master-card-state");
  card.classList.toggle("master-inactive", !active);
  badge.className = "master-card-state " + (active ? "active" : "inactive");
  badge.textContent = active ? "Activo" : "Inactivo";
  masterToggleEffects.get(card)?.();
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const veil = document.createElement("span");
  veil.className = "master-state-motion " + (active ? "is-on" : "is-off");
  veil.setAttribute("aria-hidden", "true");
  veil.innerHTML = "<i></i><span></span>";
  card.append(veil);
  let timer;
  const cleanup = () => {
    clearTimeout(timer);
    veil.remove();
    if (masterToggleEffects.get(card) === cleanup) masterToggleEffects.delete(card);
  };
  masterToggleEffects.set(card, cleanup);
  timer = setTimeout(cleanup, 680);
}

function accountEmail(license, number) {
  return (
    masterItems(license)
      .find((master) => Number(master.number) === Number(number))
      ?.email?.trim() || "Correo no registrado"
  );
}
function accountCaption(license, number) {
  return "Cuenta " + number + " · " + accountEmail(license, number);
}
function masterLongDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return "—";
  const [year, month, day] = value.split("-").map(Number),
    date = new Date(year, month - 1, day, 12);
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${day} de ${meses[month - 1]} de ${year}`;
}
