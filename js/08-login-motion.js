let shopLoginCleanup = null;
function animateShopLogin() {
  shopLoginCleanup?.();
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const logo = document.querySelector("#app .topbar .ultra-wordmark");
  if (!logo || !logo.getClientRects().length) return;
  const rect = logo.getBoundingClientRect();
  const scene = document.createElement("div");
  scene.className = "shop-login-motion shop-login-success";
  scene.setAttribute("aria-hidden", "true");
  scene.innerHTML =
    '<span class="shop-login-shade"></span><span class="shop-login-halo"></span><span class="shop-login-glint"></span><span class="shop-login-mark"></span><span class="shop-login-caption"><i></i> ACCESO CONCEDIDO</span><span class="shop-login-track"><i></i></span>';
  const flying = scene.querySelector(".shop-login-mark");
  flying.append(logo.cloneNode(true));
  Object.assign(flying.style, {
    left: rect.left + "px",
    top: rect.top + "px",
    width: rect.width + "px",
    height: rect.height + "px",
  });
  document.body.append(scene);
  const x = innerWidth * 0.5 - (rect.left + rect.width * 0.5);
  const y = innerHeight * 0.41 - (rect.top + rect.height * 0.5);
  const scale = Math.min(2.35, Math.max(1.4, Math.min(340, innerWidth - 56) / Math.max(rect.width, 1)));
  const duration = 1150;
  const motions = [];
  if (flying.animate) {
    motions.push(
      flying.animate(
        [
          {
            transform: `translate(${x}px,${y}px) scale(${scale * 0.78})`,
            opacity: 0,
            offset: 0,
            easing: "cubic-bezier(.22,1,.36,1)",
          },
          {
            transform: `translate(${x}px,${y}px) scale(${scale})`,
            opacity: 1,
            offset: 0.2,
            easing: "linear",
          },
          {
            transform: `translate(${x}px,${y}px) scale(${scale})`,
            opacity: 1,
            offset: 0.5,
            easing: "cubic-bezier(.22,1,.36,1)",
          },
          { transform: "translate(0,0) scale(1)", opacity: 1, offset: 0.86, easing: "ease-out" },
          { transform: "translate(0,0) scale(1)", opacity: 0, offset: 1 },
        ],
        { duration, easing: "linear", fill: "both" },
      ),
    );
    motions.push(
      scene.querySelector(".shop-login-shade").animate(
        [
          { opacity: 1, offset: 0 },
          { opacity: 1, offset: 0.4 },
          { opacity: 0, offset: 0.89 },
          { opacity: 0, offset: 1 },
        ],
        { duration, easing: "ease-in-out", fill: "both" },
      ),
    );
    document
      .querySelectorAll("#app .topbar,#app .management-head,#app .tabs-wrap,#app .toolbar,#app .table-scroll")
      .forEach((el, i) => {
        motions.push(
          el.animate(
            [
              { opacity: 0, transform: "translateY(14px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 430, delay: 550 + i * 75, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" },
          ),
        );
      });
  }
  let timer;
  const cleanup = () => {
    clearTimeout(timer);
    motions.forEach((animation) => animation.cancel());
    scene.remove();
    if (shopLoginCleanup === cleanup) shopLoginCleanup = null;
  };
  shopLoginCleanup = cleanup;
  timer = setTimeout(cleanup, 1250);
}
window.UltraShopMotion = { login: animateShopLogin, cancelLogin: () => shopLoginCleanup?.() };
function staffCredentialAction(action, id, field, button) {
  if (!isAdmin() || !["username", "password"].includes(field)) return;
  const user = staffUsers.find((person) => person.id === id);
  if (!user) return;
  if (action === "reveal" && field === "password") {
    const visible = button.getAttribute("aria-pressed") !== "true",
      value = button.closest(".staff-credential-row").querySelector("[data-staff-password]");
    value.textContent = visible ? user.password || "No disponible" : "••••••••";
    value.classList.toggle("is-visible", visible);
    button.setAttribute("aria-pressed", String(visible));
    button.setAttribute("aria-label", visible ? "Ocultar contraseña" : "Mostrar contraseña");
    return;
  }
  if (field === "password" && !user.password) {
    toast("La contraseña no está disponible en este panel. Restablécala desde el servidor.");
    return;
  }
  if (action === "copy")
    copyText(field === "username" ? user.username : user.password).then((ok) => {
      if (!ok) {
        toast("No se pudo copiar");
        return;
      }
      const label = button._baseCopyLabel || (button._baseCopyLabel = button.getAttribute("aria-label"));
      button.setAttribute("aria-label", field === "username" ? "Usuario copiado" : "Contraseña copiada");
      button.classList.add("credential-copied");
      clearTimeout(button._copiedTimer);
      button._copiedTimer = setTimeout(() => {
        button.classList.remove("credential-copied");
        button.setAttribute("aria-label", label);
      }, 1400);
    });
}
document.querySelector("#staffRows").addEventListener("click", (event) => {
  const button = event.target.closest("[data-staff-credential-action]");
  if (button)
    staffCredentialAction(
      button.dataset.staffCredentialAction,
      button.dataset.id,
      button.dataset.field,
      button,
    );
});
