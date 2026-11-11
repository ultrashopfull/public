let myProfileOwnerId = null,
  myProfileSaving = false;
function profileName(person) {
  return person?.displayName || (person?.id === "victor1234" ? adminName : person?.username) || "Usuario";
}
function profileMessage(text, ok = false) {
  const label = document.querySelector("#myProfileMessage");
  label.textContent = text;
  label.hidden = !text;
  label.classList.toggle("is-success", ok);
}
function openMyProfile() {
  if(window.panelSync?.busy){toast("Espera a que termine el guardado");return;}
  const person = currentStaff();
  if (!person) return;
  closeProfileMenu();
  myProfileOwnerId = person.id;
  document.querySelector("#myProfileForm").reset();
  document.querySelector("#myProfileName").value = profileName(person);
  document.querySelector("#myProfileUsername").value = person.username || "";
  const password = document.querySelector("#myProfilePassword"),
    eye = document.querySelector("#myProfilePasswordEye");
  password.value = "";
  password.type = "password";
  eye.setAttribute("aria-pressed", "false");
  eye.setAttribute("aria-label", "Mostrar contraseña");
  document.querySelector("#myProfileRole").textContent =
    (person.role === "admin" ? "Administrador" : "Vendedor") +
    " · " +
    (person.active ? "Activo" : "Inactivo");
  profileMessage("");
  document.querySelector("#myProfileBackdrop").hidden = false;
  document.querySelector("#myProfileName").focus({ preventScroll: true });
}
function saveMyProfile(event) {
  event.preventDefault();
  if (myProfileSaving) return;
  const person = currentStaff();
  if (!person || person.id !== myProfileOwnerId) {
    profileMessage("Tu sesión cambió. Vuelve a abrir Mi perfil.");
    return;
  }
  const nameInput = document.querySelector("#myProfileName"),
    userInput = document.querySelector("#myProfileUsername"),
    passwordInput = document.querySelector("#myProfilePassword"),
    name = nameInput.value.trim(),
    username = userInput.value.trim(),
    password = passwordInput.value;
  const normalize = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");
  if (!name) {
    profileMessage("Escribe tu nombre.");
    nameInput.focus();
    return;
  }
  if (!username) {
    profileMessage("Escribe tu usuario de acceso.");
    userInput.focus();
    return;
  }
  if (staffUsers.some((user) => user.id !== person.id && normalize(user.username) === normalize(username))) {
    profileMessage("Ese usuario de acceso ya está en uso.");
    userInput.focus();
    return;
  }
  if (password && password.length < 4) {
    profileMessage("La contraseña debe tener al menos 4 caracteres.");
    passwordInput.focus();
    return;
  }
  if(window.panelSync?.connected())return panelRemote("profile",{person,name,username,password});
  const backup = { ...person };
  myProfileSaving = true;
  const saveButton = document.querySelector("#myProfileSave");
  saveButton.disabled = true;
  try {
    person.displayName = name;
    person.username = username;
    if (password) person.password = password;
    persistStaff();
  } catch {
    Object.assign(person, backup);
    for (const field of ["displayName", "password"]) if (!Object.hasOwn(backup, field)) delete person[field];
    profileMessage("No se pudo guardar. Inténtalo de nuevo.");
    return;
  } finally {
    myProfileSaving = false;
    saveButton.disabled = false;
  }
  passwordInput.value = "";
  passwordInput.type = "password";
  const eye = document.querySelector("#myProfilePasswordEye");
  eye.setAttribute("aria-pressed", "false");
  eye.setAttribute("aria-label", "Mostrar contraseña");
  applyRole();
  if (activeView === "staff" && isAdmin()) renderStaff();
  profileMessage("Cambios guardados", true);
  window.NovaMotion?.play(saveButton, [{ opacity: 0.65 }, { opacity: 1 }], { duration: 300 });
}
document.querySelector("#menuMyProfile")?.addEventListener("click", openMyProfile);
document.querySelector("#myProfileForm").addEventListener("submit", saveMyProfile);
document.querySelector("#myProfilePasswordEye").addEventListener("click", () => {
  const password = document.querySelector("#myProfilePassword"),
    eye = document.querySelector("#myProfilePasswordEye"),
    visible = password.type === "password";
  password.type = visible ? "text" : "password";
  eye.setAttribute("aria-pressed", String(visible));
  eye.setAttribute("aria-label", visible ? "Ocultar contraseña" : "Mostrar contraseña");
});
document.querySelector("#myProfileForm").addEventListener("input", () => profileMessage(""));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !document.querySelector("#myProfileBackdrop").hidden)
    closeDialog("#myProfileBackdrop");
});
new MutationObserver(() => {
  if (document.querySelector("#myProfileBackdrop").hidden) {
    document.querySelector("#myProfilePassword").value = "";
    myProfileOwnerId = null;
  }
}).observe(document.querySelector("#myProfileBackdrop"), { attributes: true, attributeFilter: ["hidden"] });
new MutationObserver(() => {
  if (document.querySelector("#app").hidden) closeDialog("#myProfileBackdrop");
}).observe(document.querySelector("#app"), { attributes: true, attributeFilter: ["hidden"] });
