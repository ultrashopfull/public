try {
  document.documentElement.dataset.theme = localStorage.getItem("nova-theme") || "dark";
} catch {
  document.documentElement.dataset.theme = "dark";
}
