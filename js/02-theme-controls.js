(function () {
  const root = document.documentElement;
  const toggles = document.querySelectorAll(".theme-toggle");
  function applyTheme(theme, save) {
    if(save && window.panelSync?.connected() && !document.querySelector("#app").hidden){window.panelSync.run("preference.save",{userId:sessionUserId,theme},{success:"Tema guardado"});return;}
    root.dataset.theme = theme === "dark" ? "dark" : "light";
    const next = root.dataset.theme === "dark" ? "claro" : "oscuro";
    toggles.forEach((button) => {
      button.setAttribute("aria-label", "Cambiar a modo " + next);
      button.title = "Cambiar a modo " + next;
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = root.dataset.theme === "dark" ? "#0b0b0c" : "#f2f2f3";
    if (save) {
      try {
        localStorage.setItem("nova-theme", root.dataset.theme);
      } catch {}
    }
  }
  toggles.forEach((button) =>
    button.addEventListener("click", () => {
      const theme = (window.novaThemeTarget || root.dataset.theme) === "dark" ? "light" : "dark";
      if (window.novaThemeMotion) window.novaThemeMotion(button, () => applyTheme(theme, true), theme);
      else applyTheme(theme, true);
    }),
  );
  window.novaSetTheme=(theme)=>applyTheme(theme,false);
  applyTheme(root.dataset.theme, false);
  const system = window.matchMedia("(prefers-color-scheme: dark)");
  system.addEventListener("change", (event) => {
    let stored;
    try {
      stored = localStorage.getItem("nova-theme");
    } catch {}
    if (!stored) applyTheme(event.matches ? "dark" : "light", false);
  });
  window.addEventListener("storage", (event) => {
    if (event.key === "nova-theme") applyTheme(event.newValue || (system.matches ? "dark" : "light"), false);
  });
})();
