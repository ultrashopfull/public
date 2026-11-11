/* Dashboard de estadísticas: cálculos directos a partir de datasets existentes. */
const statsFormatNumber = new Intl.NumberFormat("es-BO");
const statsPalette = { active: "#10a37f", expired: "#e46c79", suspended: "#9174d9" };
const statsLabels = { active: "Activos", expired: "Vencidos / inactivos", suspended: "Suspendidos" };
function statsProductColor(name) {
  const original = licenseColors[name],
    color = /^#[\da-fA-F]{6}$/.test(original || "") ? original : "#909096";
  const rgb = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
  const lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
  const dark = document.documentElement.dataset.theme === "dark";
  if ((dark && lum < 0.38) || (!dark && lum > 0.83)) {
    const target = dark ? 255 : 0,
      weight = dark ? 0.55 : 0.32;
    return (
      "#" +
      rgb
        .map((v) =>
          Math.round(v * (1 - weight) + target * weight)
            .toString(16)
            .padStart(2, "0"),
        )
        .join("")
    );
  }
  return color;
}
function statsPercent(a, b) {
  return b ? Math.round((a / b) * 100) : 0;
}
function statsDays(u) {
  if (u.isTrial && u.expiresAt) {
    const ms = getTimeLeft(u);
    return ms === null ? 0 : Math.max(0, Math.ceil(ms / 86400000));
  }
  return Math.max(0, getDaysLeft(u));
}
function statsCategory(u) {
  const state = String(u.status || "").toLowerCase();
  if (state === "suspendido") return "suspended";
  if (state === "activo" && statsDays(u) > 0) return "active";
  return "expired";
}
function statsSelectedRows() {
  const names = Object.keys(datasets).filter((name) => isAdmin() && canSell(name));
  const chosen = document.querySelector("#statsLicenseFilter").value;
  const activeNames = chosen === "all" ? names : names.filter((name) => name === chosen);
  return {
    names: activeNames,
    rows: activeNames.flatMap((license) =>
      (datasets[license] || []).map((u) => ({ license, u, state: statsCategory(u), days: statsDays(u) })),
    ),
  };
}
function statsCsvSafe(value) {
  let s = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
}
async function statsExportCsv() {
  if(window.panelSync?.connected()){if(panelSync.busy){toast("Espera a que termine el guardado");return;}try{await panelSync.refresh(true);}catch(e){toast(e.message);return;}}
  if (!isAdmin()) return;
  const { rows } = statsSelectedRows();
  const headers = [
    "Licencia",
    "Cliente",
    "Celular",
    "Dispositivo",
    "Estado",
    "Días restantes",
    "Cuenta",
    "Prueba",
    "Inicio de vigencia",
    "Fin de vigencia",
    "Registrado por",
  ];
  const lines = [
    headers,
    ...rows.map((r) => [
      r.license,
      r.u.email,
      r.u.phone,
      r.u.device,
      r.u.status,
      r.days,
      r.u.account,
      r.u.isTrial ? "Sí" : "No",
      r.u.startDate || "",
      r.u.endDate || (r.u.expiresAt ? new Date(r.u.expiresAt).toISOString() : ""),
      r.u.creator || "",
    ]),
  ];
  const content = "\ufeff" + lines.map((line) => line.map(statsCsvSafe).join(",")).join("\r\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = "ultrashop-estadisticas-" + dateLocal(new Date()) + ".csv";
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 600);
  toast("Estadísticas exportadas a CSV");
}
function statsEmptyHtml(message) {
  return `<div class="statistics-empty-block">${esc(message)}</div>`;
}
/* Dashboard v2: colores por licencia y transiciones respetuosas de los datos */
const statsCircleLength = 2 * Math.PI * 69;
let statsLastRender = 0;
let statsTweenFrame = 0;
let statsLegendNames = [];
function statsMotionOK() {
  return (
    typeof window.matchMedia !== "function" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
function statsRichTip(parts) {
  return `<div class="statistics-floating-tip"><b>${esc(parts.label)}</b>${parts.lines.map((r) => `<span><i style="background:${statsProductColor(r.name)}"></i><span>${esc(r.name)}</span><strong>${statsFormatNumber.format(r.n)}</strong></span>`).join("")}</div>`;
}
function statsRenderColumns(grouped, labels, kind) {
  const totals = grouped.map((group) => group.reduce((sum, part) => sum + part.n, 0)),
    max = Math.max(1, ...totals);
  return grouped
    .map((group, i) => {
      const n = totals[i],
        visible = group.filter((s) => s.n > 0).sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));
      const tooltip = statsRichTip({
        label: labels[i] + " · " + n + " acceso" + (n === 1 ? "" : "s"),
        lines: visible,
      });
      const bar = visible
        .map(
          (item) =>
            `<span class="statistics-column-slice" style="--stats-license-color:${statsProductColor(item.name)};height:${((item.n / n) * 100).toFixed(4)}%" title="${esc(item.name)}: ${item.n}"></span>`,
        )
        .join("");
      return `<div class="statistics-chart-column" style="--stats-delay:${Math.min(i * 65, 460)}ms" tabindex="0" aria-label="${esc(labels[i])}: ${n}. ${esc(visible.map((v) => v.name + " " + v.n).join(", "))}"><strong>${statsFormatNumber.format(n)}</strong><div class="statistics-chart-bar-area"><div class="statistics-chart-stack ${kind === "forecast" ? "is-forecast" : ""}" style="--bar-height:${n ? Math.max(5, (n / max) * 100).toFixed(2) : 0}%">${bar}</div></div><small>${esc(labels[i])}</small>${tooltip}</div>`;
    })
    .join("");
}
function statsSyncFilter() {
  const control = document.querySelector("#statsLicenseFilter");
  const allowed = Object.keys(datasets).filter((name) => isAdmin() && canSell(name));
  const old = control.value;
  control.replaceChildren(
    new Option("Todas las licencias", "all"),
    ...allowed.map((name) => new Option(name, name)),
  );
  control.value = old === "all" || allowed.includes(old) ? old : "all";
  statsRenderLicenseTabs(allowed);
}
function statsAnimateCounters(values, animate) {
  if (statsTweenFrame && typeof cancelAnimationFrame === "function") cancelAnimationFrame(statsTweenFrame);
  const targets = Object.entries(values).map(([id, n]) => {
    const element = document.getElementById(id);
    const start = Number(element.dataset.statsCount ?? 0);
    element.dataset.statsCount = String(n);
    return { element, n, start };
  });
  if (!animate || !statsMotionOK() || typeof requestAnimationFrame !== "function") {
    targets.forEach((o) => (o.element.textContent = statsFormatNumber.format(o.n)));
    return;
  }
  const time = performance.now();
  function update(t) {
    const q = Math.min(1, (t - time) / 650),
      ease = 1 - Math.pow(1 - q, 4);
    targets.forEach(
      (o) => (o.element.textContent = statsFormatNumber.format(Math.round(o.start + (o.n - o.start) * ease))),
    );
    if (q < 1) statsTweenFrame = requestAnimationFrame(update);
    else {
      statsTweenFrame = 0;
      targets.forEach((o) => (o.element.textContent = statsFormatNumber.format(o.n)));
    }
  }
  statsTweenFrame = requestAnimationFrame(update);
}
function statsAnimateDonut() {
  const donut = document.querySelector("#statsDonut");
  if (!donut) return;
  donut.classList.remove("statistics-reveal");
  if (!statsMotionOK()) return;
  void donut.offsetWidth;
  donut.classList.add("statistics-reveal");
}
function statsChooseLicense(index) {
  const name = statsLegendNames[Number(index)];
  if (!name) return;
  const control = document.querySelector("#statsLicenseFilter");
  control.value = control.value === name ? "all" : name;
  renderStatistics();
}
function statsHighlights(products, soon, total) {
  const biggest = products.find((p) => p.count > 0),
    soonByLicense = products
      .map((p) => ({ name: p.name, n: soon.filter((r) => r.license === p.name).length }))
      .sort((a, b) => b.n - a.n);
  const nearest = soon[0],
    healthy = products.filter((p) => p.count > 0 && p.active === p.count).length;
  const highlighted = [
    {
      k: "Licencia con más clientes",
      value: biggest ? biggest.name : "—",
      sub: biggest
        ? biggest.count + " accesos · " + statsPercent(biggest.count, total) + "% del total"
        : "Aún no hay accesos",
      color: biggest ? statsProductColor(biggest.name) : "var(--muted)",
      ico: "◈",
    },
    {
      k: "Vencimiento más cercano",
      value: nearest ? nearest.days + " " + (nearest.days === 1 ? "día" : "días") : "Sin vencimientos",
      sub: nearest
        ? nearest.license + " · " + (nearest.u.email || "Cliente")
        : "No hay alertas en el período",
      color: nearest ? statsProductColor(nearest.license) : "var(--muted)",
      ico: "↗",
    },
    {
      k: "Licencias 100% activas",
      value: String(healthy),
      sub:
        products.length +
        " licencias visibles · " +
        (soonByLicense[0]?.n
          ? soonByLicense[0].n + " próximo(s) en " + soonByLicense[0].name
          : "sin avisos pendientes"),
      color: "var(--stats-positive)",
      ico: "✓",
    },
  ];
  return highlighted
    .map(
      (x, i) =>
        `<div class="statistics-highlight" style="--stats-highlight-color:${x.color};--stats-delay:${i * 85}ms"><div class="statistics-highlight-top"><span>${esc(x.k)}</span><i>${x.ico}</i></div><strong title="${esc(x.value)}">${esc(x.value)}</strong><small title="${esc(x.sub)}">${esc(x.sub)}</small></div>`,
    )
    .join("");
}
function renderStatistics() {
  const view = document.querySelector("#statisticsView");
  if (!view || view.hidden || !isAdmin()) return;
  statsSyncFilter();
  const { rows, names } = statsSelectedRows(),
    total = rows.length,
    daysWindow = Number(document.querySelector("#statsWindowFilter").value),
    horizon = daysWindow === 0 ? Infinity : daysWindow || 30;
  const chosen = document.querySelector("#statsLicenseFilter").value;
  view.style.setProperty(
    "--stats-current-color",
    chosen === "all" ? "var(--accent)" : statsProductColor(chosen),
  );
  view.classList.toggle("statistics-single-license", chosen !== "all");
  const tally = { active: 0, expired: 0, suspended: 0 };
  const map = new Map(names.map((name) => [name, { name, count: 0, active: 0, expired: 0, suspended: 0 }]));
  for (const r of rows) {
    tally[r.state]++;
    const p = map.get(r.license);
    p.count++;
    p[r.state]++;
  }
  const products = [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const soon = rows
    .filter((r) => r.state === "active" && r.days > 0 && r.days <= horizon)
    .sort((a, b) => a.days - b.days || a.license.localeCompare(b.license));
  // Vista ligera: no reconstruir los gráficos antiguos ni las tablas ocultas.
  statsRenderSimple(rows, names, tally, soon, products, horizon, total);
  return;
  const trialRows = rows.filter((r) => r.u.isTrial);
  statsRenderMasterAlerts(names, horizon);
  statsRenderExtras(rows, names, tally, soon, products, horizon, total);
  statsAnimateCounters(
    {
      statsTotal: total,
      statsActive: tally.active,
      statsExpiring: soon.length,
      statsExpired: tally.expired,
      statsSuspended: tally.suspended,
      statsTrials: trialRows.length,
      statsDonutCount: total,
      statsUnique: statsUniqueNumber,
      statsWeek: statsWeekNumber,
    },
    true,
  );
  document.querySelector("#statsTotalDetail").textContent =
    names.length +
    " licencia" +
    (names.length === 1 ? "" : "s") +
    " seleccionada" +
    (names.length === 1 ? "" : "s");
  document.querySelector("#statsActiveDetail").textContent =
    statsPercent(tally.active, total) + "% del total";
  document.querySelector("#statsExpiringDetail").textContent = "Próximos " + horizon + " días";
  document.querySelector("#statsTrialsDetail").textContent =
    trialRows.filter((r) => r.state === "active").length + " pruebas activas";
  document.querySelector("#statsTimestamp").textContent =
    "Actualizado: " +
    new Intl.DateTimeFormat("es-BO", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
  const maxProduct = Math.max(1, ...products.map((p) => p.count));
  document.querySelector("#statsProductCount").textContent =
    products.length + " licencia" + (products.length === 1 ? "" : "s");
  statsLegendNames = products.map((p) => p.name);

  document.querySelector("#statsLicenseChart").innerHTML = products.length
    ? products
        .map((p, i) => {
          const color = statsProductColor(p.name);
          const segments = [
            ["active", p.active],
            ["expired", p.expired],
            ["suspended", p.suspended],
          ]
            .filter(([, n]) => n > 0)
            .map(
              ([state, n]) =>
                `<span class="statistics-license-segment is-${state}" style="width:${((n / p.count) * 100).toFixed(3)}%" title="${statsLabels[state]}: ${n}"></span>`,
            )
            .join("");
          return `<div class="statistics-license-row" style="--stats-license-color:${color};--stats-delay:${Math.min(i * 65, 600)}ms"><button class="statistics-license-label" type="button" data-stats-pick="${i}" title="Filtrar por ${esc(p.name)}"><span class="statistics-license-dot"></span><span>${esc(p.name)}</span></button><div class="statistics-license-track" role="img" aria-label="${esc(p.name)}: ${p.active} activos, ${p.expired} vencidos, ${p.suspended} suspendidos"><div class="statistics-license-fill" style="width:${((p.count / maxProduct) * 100).toFixed(3)}%">${segments}</div></div><strong class="statistics-license-total">${p.count}</strong></div>`;
        })
        .join("")
    : statsEmptyHtml("No hay licencias para mostrar.");
  // SVG circular animado; cada segmento usa exclusivamente el color de su licencia.
  let arc = 0;
  const svg =
    `<circle class="statistics-donut-track" cx="90" cy="90" r="69"></circle>` +
    (total
      ? products
          .filter((p) => p.count > 0)
          .map((p, i) => {
            const start = arc;
            const span = (p.count / total) * statsCircleLength;
            arc += span;
            return `<circle class="statistics-donut-arc" cx="90" cy="90" r="69" transform="rotate(-90 90 90)" stroke="${statsProductColor(p.name)}" stroke-dasharray="${Math.max(0, span - 2.8).toFixed(3)} ${statsCircleLength.toFixed(3)}" stroke-dashoffset="${(-start).toFixed(3)}" style="--arc-length:${Math.max(0, span - 2.8).toFixed(3)};--stats-delay:${i * 75}ms" aria-label="${esc(p.name)}: ${p.count}"><title>${esc(p.name)}: ${p.count} (${statsPercent(p.count, total)}%)</title></circle>`;
          })
          .join("")
      : "");
  document.querySelector("#statsDonutSvg").innerHTML = svg;
  document
    .querySelector("#statsDonut")
    .setAttribute("aria-label", products.map((p) => p.name + ": " + p.count + " accesos").join("; "));
  document.querySelector("#statsStatusList").innerHTML = products.length
    ? products
        .map(
          (p, i) =>
            `<button class="statistics-status-entry" type="button" data-stats-pick="${i}" title="Filtrar por ${esc(p.name)}"><i style="background:${statsProductColor(p.name)}"></i><span>${esc(p.name)}</span><strong>${p.count}</strong><small>${statsPercent(p.count, total)}%</small></button>`,
        )
        .join("")
    : statsEmptyHtml("Sin licencias");
  statsAnimateDonut();
  // Gráficos apilados por producto; solo hay valores donde existen fechas o días reales.
  const now = new Date(),
    months = Array.from({ length: 6 }, (_, i) => new Date(now.getFullYear(), now.getMonth() - 5 + i, 1));
  const monthKeys = months.map((d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"));
  const monthNames = months.map((d) =>
    new Intl.DateTimeFormat("es-BO", { month: "short" }).format(d).replace(".", ""),
  );
  const history = months.map(() => new Map(names.map((n) => [n, 0])));
  let withoutStart = 0,
    datedCount = 0;
  for (const r of rows) {
    if (!r.u.startDate) {
      withoutStart++;
      continue;
    }
    const date = new Date(r.u.startDate);
    if (!Number.isFinite(date.getTime())) {
      withoutStart++;
      continue;
    }
    datedCount++;
    const idx = monthKeys.indexOf(date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0"));
    if (idx >= 0) history[idx].set(r.license, history[idx].get(r.license) + 1);
  }
  const historyGroups = history.map((group) => [...group].map(([name, n]) => ({ name, n })));
  document.querySelector("#statsHistoryChart").innerHTML = statsRenderColumns(
    historyGroups,
    monthNames,
    "history",
  );
  document
    .querySelector("#statsHistoryChart")
    .setAttribute(
      "aria-label",
      monthNames.map((m, i) => m + ": " + historyGroups[i].reduce((acc, x) => acc + x.n, 0)).join("; "),
    );
  document.querySelector("#statsHistoryNote").textContent =
    datedCount +
    " acceso" +
    (datedCount === 1 ? "" : "s") +
    " con fecha de inicio registrada · " +
    withoutStart +
    " sin fecha. Las renovaciones pueden modificar este dato.";
  const binCount = horizon <= 14 ? 7 : 10,
    size = Math.ceil(horizon / binCount),
    binLabels = [],
    bins = [];
  for (let i = 0; i < binCount; i++) {
    const from = i * size + 1,
      to = Math.min(horizon, (i + 1) * size);
    if (from > horizon) break;
    binLabels.push(from === to ? String(from) : `${from}–${to}`);
    bins.push(new Map(names.map((n) => [n, 0])));
  }
  soon.forEach((r) => {
    const idx = Math.floor((r.days - 1) / size);
    if (bins[idx]) bins[idx].set(r.license, bins[idx].get(r.license) + 1);
  });
  const expiryGroups = bins.map((group) => [...group].map(([name, n]) => ({ name, n })));
  document.querySelector("#statsExpiryChart").innerHTML = statsRenderColumns(
    expiryGroups,
    binLabels,
    "forecast",
  );
  document
    .querySelector("#statsExpiryChart")
    .setAttribute(
      "aria-label",
      binLabels.map((m, i) => m + " días: " + expiryGroups[i].reduce((a, x) => a + x.n, 0)).join("; "),
    );
  document.querySelector("#statsExpirySubtitle").textContent =
    "Próximos " + horizon + " días · segmentos en color por licencia";
  document.querySelector("#statsForecastCount").textContent =
    soon.length + " previsto" + (soon.length === 1 ? "" : "s");
  statsRenderProducts(products, soon);
  const deviceCount = new Map();
  for (const r of rows) {
    const device = String(r.u.device || "Sin especificar");
    if (!deviceCount.has(device)) deviceCount.set(device, new Map());
    const d = deviceCount.get(device);
    d.set(r.license, (d.get(r.license) || 0) + 1);
  }
  const devices = [...deviceCount].sort(
    (a, b) =>
      [...b[1].values()].reduce((x, y) => x + y, 0) - [...a[1].values()].reduce((x, y) => x + y, 0) ||
      a[0].localeCompare(b[0]),
  );
  document.querySelector("#statsDevicesChart").innerHTML = devices.length
    ? devices
        .map(([device, values], i) => {
          const count = [...values.values()].reduce((a, b) => a + b, 0),
            segments = [...values].sort((a, b) => b[1] - a[1]);
          return `<div class="statistics-device" style="--stats-delay:${i * 60}ms"><div class="statistics-device-head"><span>${esc(device)}</span><strong>${count} <small>(${statsPercent(count, total)}%)</small></strong></div><div class="statistics-device-track" role="img" aria-label="${esc(device)}: ${esc(segments.map(([n, c]) => n + " " + c).join(", "))}"><div class="statistics-device-fill" style="width:${((count / Math.max(1, ...devices.map(([, v]) => [...v.values()].reduce((a, b) => a + b, 0)))) * 100).toFixed(3)}%">${segments.map(([name, n]) => `<span style="width:${((n / count) * 100).toFixed(3)}%;background:${statsProductColor(name)}" title="${esc(name)}: ${n}"></span>`).join("")}</div></div></div>`;
        })
        .join("")
    : statsEmptyHtml("Todavía no hay dispositivos registrados.");
  statsUpcomingCache = soon;
  statsRenderUpcoming();
  statsRenderSimple(rows, names, tally, soon, products, horizon, total);
}
// La leyenda y las etiquetas funcionan como filtros en un clic, sin añadir dependencias.
function statsHandlePick(event) {
  const button = event.target.closest("[data-stats-pick]");
  if (button) statsChooseLicense(button.dataset.statsPick);
}

document.querySelector("#statsLicenseChart").addEventListener("click", statsHandlePick);
document.querySelector("#statsStatusList").addEventListener("click", statsHandlePick);
new MutationObserver(() => {
  if (activeView === "stats") renderStatistics();
}).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

/* Estadísticas v3: cálculos de una fuente única, sin historial fabricado. */
let statsUpcomingCache = [];
let statsProductCache = [];
let statsUniqueNumber = 0,
  statsWeekNumber = 0;
let statsMoreLimit = 10;
let statsUpcomingRange = null;
const statsNumber = (n) => statsFormatNumber.format(n);
function statsRenderExtras(rows, names, tally, soon, products, horizon, total) {
  const unique = new Set(),
    noEmail = [];
  rows.forEach((r, i) => {
    let email = String(r.u.email || "")
      .trim()
      .toLowerCase();
    if (email) unique.add(email);
    else noEmail.push(i);
  });
  const uniqueCount = unique.size + noEmail.length;
  statsUniqueNumber = uniqueCount;
  document.querySelector("#statsUniqueDetail").textContent = noEmail.length
    ? noEmail.length + " registros sin correo, contados aparte"
    : "Contados por correo electrónico";
  statsWeekNumber = rows.filter((r) => r.state === "active" && r.days > 0 && r.days <= 7).length;
  const rate = statsPercent(tally.active, total);
  const rateNode = document.querySelector("#statsHealthPercent");
  rateNode.textContent = rate + "%";
  const healthTrack = document.querySelector("#statsHealthTrack");
  const states = [
    { key: "active", label: "Activos", n: tally.active, color: "var(--stats-positive)" },
    { key: "expired", label: "Vencidos", n: tally.expired, color: "var(--stats-negative)" },
    { key: "suspended", label: "Suspendidos", n: tally.suspended, color: "var(--stats-purple)" },
  ];
  healthTrack.innerHTML = states
    .filter((v) => v.n > 0)
    .map(
      (s) =>
        `<span class="stats-v3-health-piece ${s.key}" style="width:${((s.n / Math.max(1, total)) * 100).toFixed(3)}%;background:${s.color}" title="${esc(s.label)}: ${s.n}"></span>`,
    )
    .join("");
  healthTrack.setAttribute("aria-label", states.map((s) => s.label + " " + s.n).join(", "));
  document.querySelector("#statsHealthKey").innerHTML = states
    .map(
      (s) =>
        `<div><i style="background:${s.color}"></i><span>${s.label}</span><strong>${statsNumber(s.n)} <small>(${statsPercent(s.n, total)}%)</small></strong></div>`,
    )
    .join("");
  document.querySelector("#statsHealthMessage").textContent = total
    ? `${statsNumber(tally.active)} de ${statsNumber(total)} accesos tienen una vigencia activa. Hay ${statsNumber(tally.expired + tally.suspended)} sin acceso vigente.`
    : "Añade accesos a tus licencias para empezar a ver resultados.";
  const urgent = soon.filter((r) => r.days <= 3).length;
  const thisWeek = soon.filter((r) => r.days >= 4 && r.days <= 7).length;
  const afterWeek = soon.filter((r) => r.days >= 8).length;
  const alerts = [
    { label: "Urgentes", desc: "Vencen en 1–3 días", n: urgent, icon: "!", tone: "urgent", range: "3" },
    { label: "Esta semana", desc: "Vencen en 4–7 días", n: thisWeek, icon: "↗", tone: "week", range: "7" },
    {
      label: "Más adelante",
      desc: horizon >= 8 ? `Del día 8 al ${horizon}` : "Consultar desde el día 8",
      n: afterWeek,
      icon: "◷",
      tone: "later",
      range: horizon >= 8 ? "later" : "expand",
    },
    {
      label: "Ya vencidos",
      desc: "Accesos no vigentes",
      n: tally.expired,
      icon: "×",
      tone: "expired",
      range: null,
    },
  ];
  document.querySelector("#statsAlerts").innerHTML = alerts
    .map(
      (a, i) =>
        `<${a.range ? 'button type="button"' : "div"} class="stats-v3-alert stats-v3-tone-${a.tone}" ${a.range ? `data-stats-alert="${a.range}" title="Ver detalles"` : ""} style="--stats-delay:${i * 60}ms"><span class="stats-v3-alert-top"><span class="stats-v3-alert-ico">${a.icon}</span><small>${a.range ? "Ver clientes ↗" : "Estado actual"}</small></span><strong>${statsNumber(a.n)}</strong><span class="stats-v3-alert-title">${esc(a.label)}</span><small class="stats-v3-alert-desc">${esc(a.desc)}</small></${a.range ? "button" : "div"}>`,
    )
    .join("");
  // Registro de usuarios vigentes agrupado por distancia a la fecha de vencimiento.
  const brackets = [
    ["1–3 días", 1, 3],
    ["4–7 días", 4, 7],
    ["8–30 días", 8, 30],
    ["31–90 días", 31, 90],
    ["Más de 90 días", 91, Infinity],
  ];
  const activeRows = rows.filter((r) => r.state === "active"),
    totalActive = activeRows.length;
  document.querySelector("#statsRemainingBuckets").innerHTML = brackets
    .map(([label, min, max], i) => {
      const byLicense = new Map();
      for (const r of activeRows)
        if (r.days >= min && r.days <= max) byLicense.set(r.license, (byLicense.get(r.license) || 0) + 1);
      const count = [...byLicense.values()].reduce((a, b) => a + b, 0);
      const children = [...byLicense]
        .sort((a, b) => b[1] - a[1])
        .map(
          ([name, n]) =>
            `<span style="width:${(n / count) * 100}%;background:${statsProductColor(name)}" title="${esc(name)}: ${n}"></span>`,
        )
        .join("");
      return `<div class="stats-v3-bucket" style="--stats-delay:${i * 75}ms"><div class="stats-v3-bucket-top"><span>${label}</span><strong>${statsNumber(count)} <small>· ${statsPercent(count, totalActive)}%</small></strong></div><div class="stats-v3-bucket-track"><div class="stats-v3-bucket-fill" style="width:${statsPercent(count, Math.max(1, totalActive))}%">${children}</div></div></div>`;
    })
    .join("");
  // Las fechas se validan; no se rellenan fechas de alta inexistentes.
  const goodDate = (v) => {
    if (!v) return false;
    const date = new Date(v);
    return Number.isFinite(date.getTime());
  };
  const start = rows.filter((r) => goodDate(r.u.startDate)).length;
  const end = rows.filter((r) => goodDate(r.u.endDate) || (r.u.isTrial && goodDate(r.u.expiresAt))).length;
  const device = rows.filter(
    (r) =>
      String(r.u.device || "").trim() && !/^(sin especificar|—|ninguno)$/i.test(String(r.u.device).trim()),
  ).length;
  const email = rows.filter((r) => String(r.u.email || "").trim()).length;
  const metrics = [
    ["Correo de cliente", email],
    ["Tipo de dispositivo", device],
    ["Fecha de inicio", start],
    ["Fecha de fin o prueba", end],
  ];
  const grade = total ? Math.round(((start + end + device + email) / (total * 4)) * 100) : 0;
  document.querySelector("#statsQualityGrade").textContent = grade + "% completos";
  document.querySelector("#statsQuality").innerHTML = metrics
    .map(
      ([label, n], i) =>
        `<div class="stats-v3-quality-row" style="--stats-delay:${i * 65}ms"><div><span>${label}</span><strong>${statsNumber(n)} de ${statsNumber(total)} <small>· ${statsPercent(n, total)}%</small></strong></div><div class="stats-v3-quality-track"><i style="--stats-width:${statsPercent(n, total)}%"></i></div></div>`,
    )
    .join("");
  statsProductCache = products.map((p) => ({ ...p, soon: soon.filter((r) => r.license === p.name).length }));
}
function statsRenderProducts(products, soon) {
  const sort = document.querySelector("#statsProductSort").value;
  const productsView = statsProductCache.slice();
  const ranking = {
    volume: (a, b) => b.count - a.count,
    active: (a, b) => b.active - a.active,
    risk: (a, b) => b.soon - a.soon,
    rate: (a, b) => b.active / Math.max(1, b.count) - a.active / Math.max(1, a.count),
    name: (a, b) => a.name.localeCompare(b.name),
  };
  productsView.sort(ranking[sort] || ranking.volume);
  const body = document.querySelector("#statsProductsBody");
  body.innerHTML = productsView.length
    ? productsView
        .map((p, i) => {
          const rate = statsPercent(p.active, p.count),
            color = statsProductColor(p.name);
          return `<tr style="--stats-delay:${Math.min(i * 55, 400)}ms;--stats-license-color:${color}"><td><span class="statistics-product-name"><i></i><strong>${esc(p.name)}</strong></span></td><td>${p.count}</td><td>${p.active}</td><td>${p.expired}</td><td>${p.suspended}</td><td>${p.soon}</td><td><span class="statistics-percentage"><i style="--rate:${rate}%"></i><strong>${rate}%</strong></span></td></tr>`;
        })
        .join("")
    : '<tr><td colspan="7" class="statistics-empty">Todavía no hay accesos registrados.</td></tr>';
}
function statsRenderUpcoming() {
  const box = document.querySelector("#statsUpcomingBody"),
    more = document.querySelector("#statsUpcomingMore");
  const q = String(document.querySelector("#statsUpcomingSearch").value || "")
    .toLocaleLowerCase()
    .trim();
  const range = statsUpcomingRange;
  const items = statsUpcomingCache.filter(
    (r) =>
      (!range || (r.days >= range.min && r.days <= range.max)) &&
      (!q ||
        [r.u.email, r.u.device, r.license, r.u.account].some((v) =>
          String(v ?? "")
            .toLocaleLowerCase()
            .includes(q),
        )),
  );
  const visible = items.slice(0, statsMoreLimit);
  document.querySelector("#statsUpcomingCount").textContent =
    statsNumber(items.length) + " acceso" + (items.length === 1 ? "" : "s");
  document.querySelector("#statsUpcomingVisible").textContent =
    `Mostrando ${visible.length} de ${items.length}`;
  box.innerHTML = visible.length
    ? visible
        .map((r, i) => {
          const exact = r.u.endDate
            ? new Date(r.u.endDate)
            : r.u.isTrial && r.u.expiresAt
              ? new Date(r.u.expiresAt)
              : null;
          const dateValid = exact && Number.isFinite(exact.getTime());
          const dateLabel = dateValid
            ? new Intl.DateTimeFormat("es-BO", { day: "2-digit", month: "short", year: "numeric" }).format(
                exact,
              )
            : "Fecha no registrada";
          const daysText =
            r.u.isTrial && r.u.expiresAt && getTimeLeft(r.u) < 86400000
              ? "Menos de 1 día"
              : r.days === 1
                ? "1 día"
                : r.days + " días";
          const urgent = r.days <= 3;
          return `<tr style="--stats-license-color:${statsProductColor(r.license)};--stats-delay:${Math.min(i * 28, 320)}ms"><td><strong>${esc(r.u.email || "Sin correo")}</strong><div><small>${esc(r.u.device || "Sin dispositivo")}</small></div></td><td><span class="statistics-product-name"><i></i>${esc(r.license)}</span></td><td>${esc(r.u.account || "—")}</td><td>${esc(dateLabel)}${!dateValid ? "<div><small>Según días restantes</small></div>" : ""}</td><td><span class="statistics-days-pill" style="--stats-soft:${urgent ? "var(--warning-soft)" : "var(--surface)"};--stats-ink:${urgent ? "var(--warning)" : "var(--ink)"}">${esc(daysText)}</span></td></tr>`;
        })
        .join("")
    : `<tr><td colspan="5" class="statistics-empty">${q ? "No hay coincidencias para tu búsqueda." : "No hay accesos por vencer con estos filtros."}</td></tr>`;
  more.hidden = visible.length >= items.length;
  more.textContent = "Ver más (" + (items.length - visible.length) + " restantes) ↓";
}
function statsGoUpcoming(range) {
  if (range === "expand") {
    document.querySelector("#statsWindowFilter").value = "14";
    statsUpcomingRange = { min: 8, max: 14 };
    renderStatistics();
    range = "later";
  }
  if (range === "3") statsUpcomingRange = { min: 1, max: 3 };
  else if (range === "7") statsUpcomingRange = { min: 4, max: 7 };
  else if (range === "later")
    statsUpcomingRange = {
      min: 8,
      max: Math.max(8, Number(document.querySelector("#statsWindowFilter").value)),
    };
  else statsUpcomingRange = null;
  statsMoreLimit = 10;
  document
    .querySelectorAll("[data-stats-alert]")
    .forEach((b) => b.classList.toggle("is-chosen", b.dataset.statsAlert === range));
  statsRenderUpcoming();
  document
    .getElementById("statsUpcomingPanel")
    .scrollIntoView({ behavior: statsMotionOK() ? "smooth" : "auto", block: "start" });
}
document.querySelector("#statsAlerts").addEventListener("click", (e) => {
  const button = e.target.closest("[data-stats-alert]");
  if (button) statsGoUpcoming(button.dataset.statsAlert);
});
document.getElementById("statsJumpUpcoming").addEventListener("click", () => statsGoUpcoming(null));
document.getElementById("statsUpcomingSearch").addEventListener("input", () => {
  statsMoreLimit = 10;
  statsRenderUpcoming();
});
document.getElementById("statsUpcomingMore").addEventListener("click", () => {
  statsMoreLimit += 15;
  statsRenderUpcoming();
});
document.getElementById("statsProductSort").addEventListener("change", () => statsRenderProducts());
document.getElementById("statsWindowFilter").addEventListener("change", () => {
  statsUpcomingRange = null;
  statsMoreLimit = 10;
  document.querySelectorAll("[data-stats-alert]").forEach((x) => x.classList.remove("is-chosen"));
});
document.getElementById("statsLicenseFilter").addEventListener("change", () => {
  statsUpcomingRange = null;
  statsMoreLimit = 10;
  document.querySelectorAll("[data-stats-alert]").forEach((x) => x.classList.remove("is-chosen"));
});

/* Estadísticas v4: selector idéntico al resto del panel y control de renovaciones maestras. */
function statsRenderLicenseTabs(names) {
  const rail = document.getElementById("statsLicenseTabs");
  if (!rail) return;
  const control = document.getElementById("statsLicenseFilter"),
    chosen = control.value;
  const previous = rail.querySelector(".selected")?.dataset.statsLicense || "all";
  const scroll = rail.scrollLeft;
  const tabs = [
    {
      name: "all",
      label: "Todas",
      count: names.reduce((sum, name) => sum + (datasets[name]?.length || 0), 0),
    },
    ...names.map((name) => ({ name, label: name, count: datasets[name]?.length || 0 })),
  ];
  rail.innerHTML = tabs
    .map(({ name, label, count }) => {
      const single = name !== "all";
      const color = single ? statsProductColor(name) : "var(--ink)";
      return `<button type="button" data-stats-license="${esc(name)}" class="${chosen === name ? "selected" : ""} ${single ? "" : "stats-all-tab"}" aria-pressed="${chosen === name}" style="--chip:${color};--chip-ink:${single ? novaContrastInk(statsProductColor(name)) : "var(--on-strong)"}"><i aria-hidden="true"></i><span>${esc(label)}</span><small>${statsFormatNumber.format(count)}</small></button>`;
    })
    .join("");
  rail.scrollLeft = scroll;
  const active = rail.querySelector(".selected");
  if (active && previous !== chosen && statsMotionOK()) {
    active.classList.add("stats-tab-enter");
    active.addEventListener("animationend", () => active.classList.remove("stats-tab-enter"), { once: true });
  }
  if (active && previous !== chosen) {
    const a = active.offsetLeft,
      b = a.offsetLeft + active.offsetWidth;
    if (a < rail.scrollLeft + 8)
      rail.scrollTo({ left: Math.max(0, a - 12), behavior: statsMotionOK() ? "smooth" : "auto" });
    else if (b > rail.scrollLeft + rail.clientWidth - 8)
      rail.scrollTo({ left: b - rail.clientWidth + 12, behavior: statsMotionOK() ? "smooth" : "auto" });
  }
}
function statsSelectTab(name) {
  const control = document.getElementById("statsLicenseFilter");
  if (control.value === name) return;
  control.value = name;
  statsUpcomingRange = null;
  statsMoreLimit = 10;
  document.getElementById("statsUpcomingSearch").value = "";
  document.querySelectorAll("[data-stats-alert]").forEach((x) => x.classList.remove("is-chosen"));
  renderStatistics();
}
document.getElementById("statsLicenseTabs").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-stats-license]");
  if (!button) return;
  statsSelectTab(button.dataset.statsLicense);
});
const statsMasterDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return null;
  const [y, m, d] = value.split("-").map(Number),
    day = new Date(y, m - 1, d);
  if (day.getFullYear() !== y || day.getMonth() !== m - 1 || day.getDate() !== d) return null;
  return day;
};
function statsRenderMasterAlerts(names, horizon) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const all = names.flatMap((license) =>
    masterItems(license).map((account) => {
      const end = statsMasterDate(account.endDate);
      const days = end ? Math.round((end.getTime() - today.getTime()) / 86400000) : null;
      return { license, account, days, end };
    }),
  );
  const outdated = all.filter((x) => x.days !== null && x.days < 0);
  const urgent = all.filter((x) => x.days !== null && x.days >= 0 && x.days <= 7);
  const forecast = all.filter((x) => x.days !== null && x.days > 7 && x.days <= horizon);
  const withoutDate = all.filter((x) => x.days === null);
  const good = all.filter((x) => x.days !== null && x.days > horizon);
  const cards = [
    {
      label: "Cuentas maestras",
      count: all.length,
      note: "Registradas en esta selección",
      state: "total",
      icon: "▣",
    },
    {
      label: "Por renovar",
      count: urgent.length + forecast.length,
      note: "Vencen en los próximos " + horizon + " días",
      state: "warning",
      icon: "◷",
    },
    { label: "Urgentes", count: urgent.length, note: "Vencen hoy o en 7 días", state: "urgent", icon: "!" },
    {
      label: "Ya vencidas",
      count: outdated.length,
      note: "Necesitan revisar su renovación",
      state: "expired",
      icon: "×",
    },
  ];
  document.getElementById("statsMasterSummary").innerHTML = cards
    .map(
      (c, i) =>
        `<div class="stats-master-kpi stats-master-${c.state}" style="--stats-delay:${i * 65}ms"><div><span>${esc(c.label)}</span><i aria-hidden="true">${c.icon}</i></div><strong>${statsFormatNumber.format(c.count)}</strong><small>${esc(c.note)}</small></div>`,
    )
    .join("");
  const actionable = [...outdated, ...urgent, ...forecast].sort(
    (a, b) =>
      a.days - b.days ||
      a.license.localeCompare(b.license) ||
      Number(a.account.number) - Number(b.account.number),
  );
  document.getElementById("statsMasterAlertsCount").textContent =
    actionable.length + " cuenta" + (actionable.length === 1 ? "" : "s");
  const remaining = all.length - actionable.length;
  document.getElementById("statsMasterExplanation").textContent =
    outdated.length +
    " vencidas · " +
    (urgent.length + forecast.length) +
    " próximas a vencer" +
    (withoutDate.length ? " · " + withoutDate.length + " sin fecha" : "");
  const empty =
    actionable.length === 0
      ? `<div class="stats-master-empty"><span aria-hidden="true">✓</span><strong>Sin renovaciones pendientes</strong><p>${withoutDate.length ? "Hay " + withoutDate.length + " cuenta(s) sin fecha de vencimiento válida; revisa sus datos." : "No hay cuentas maestras vencidas ni próximas a vencer en este período."}</p></div>`
      : "";
  document.getElementById("statsMasterList").innerHTML = actionable.length
    ? actionable
        .map((m, i) => {
          const days = m.days;
          const status =
            days < 0
              ? "Vencida hace " + Math.abs(days) + " día" + (Math.abs(days) === 1 ? "" : "s")
              : days === 0
                ? "Vence hoy"
                : days === 1
                  ? "Vence mañana"
                  : "Vence en " + days + " días";
          const kind = days < 0 ? "expired" : days <= 3 ? "urgent" : days <= 7 ? "warning" : "soon";
          const endLabel = new Intl.DateTimeFormat("es-BO", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }).format(m.end);
          return `<div class="stats-master-item stats-master-item-${kind}" style="--stats-delay:${Math.min(50 * i, 420)}ms;--stats-license-color:${statsProductColor(m.license)}"><span class="stats-master-color" aria-hidden="true"></span><div class="stats-master-main"><div class="stats-master-name"><strong>${esc(m.license)}</strong><span>Cuenta ${esc(m.account.number)}</span>${m.account.enabled === false ? '<span class="stats-master-paused">Pausada</span>' : ""}</div><div class="stats-master-email" title="${esc(m.account.email || "")}">${esc(m.account.email || "Sin usuario")}</div><div class="stats-master-date">Finaliza el ${esc(endLabel)}</div></div><div class="stats-master-action"><span class="stats-master-time stats-master-time-${kind}">${esc(status)}</span><button type="button" class="stats-master-renew" data-stats-renew-master="${esc(m.account.id)}" data-stats-renew-license="${esc(m.license)}">Renovar ↗</button></div></div>`;
        })
        .join("")
    : empty;
  document.getElementById("statsMasterFooter").innerHTML =
    `<span>${good.length} fuera del plazo · ${withoutDate.length} sin fecha válida${remaining - good.length - withoutDate.length > 0 ? " · " + (remaining - good.length - withoutDate.length) + " por revisar" : ""}</span>`;
}
function statsOpenMasterRenewal(name, id) {
  if (!isAdmin() || !masterItems(name).some((m) => String(m.id) === String(id))) return;
  masterLicense = name;
  showView("masters");
  openMasterEditor(id);
  // Preparar propuesta editable de treinta días; no renueva hasta guardar.
  const today = new Date(),
    start = dateLocal(today),
    end = dateLocal(addDays(today, 29));
  rangeState.master = { month: new Date(today.getFullYear(), today.getMonth(), 1), start, end };
  setMasterDuration("custom");
  updateRangeSummary("master");
  document.getElementById("masterSave").textContent = "Guardar renovación ↗";
  document.getElementById("masterEditTitle").textContent =
    "Renovar Cuenta " + (masterItems(name).find((m) => String(m.id) === String(id))?.number || "");
}
document.getElementById("statsMasterList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-stats-renew-master]");
  if (button) statsOpenMasterRenewal(button.dataset.statsRenewLicense, button.dataset.statsRenewMaster);
});
document.getElementById("statsGoMasterAccounts").addEventListener("click", () => {
  const current = document.getElementById("statsLicenseFilter").value;
  if (current !== "all") masterLicense = current;
  showView("masters");
});

/* Estadísticas simplificadas: resumen general separado de la ficha de cada licencia. */
const statsSimpleCount = (n) => statsFormatNumber.format(n);
const statsSimpleMonths = { Infinity: "Total", 30: "1 mes", 60: "2 meses", 90: "3 meses", 180: "6 meses" };
function statsSimpleMetrics(total, tally, soon, horizon) {
  const items = [
    ["Accesos", total, "total"],
    ["Activos", tally.active, "active"],
    ["Por vencer", soon.length, "soon"],
    ["Vencidos", tally.expired, "expired"],
  ];
  return items
    .map(
      ([name, number, tone], i) =>
        `<div class="stats-v5-metric" style="--v5-delay:${i * 45}ms"><span>${name}</span><strong data-v5-number="${number}">${statsSimpleCount(number)}</strong><small>${tone === "soon" ? (horizon === Infinity ? "Sin límite de fechas" : horizon === 30 ? "En el próximo mes" : "En los próximos " + statsSimpleMonths[String(horizon)]) : tone === "active" ? "Vigentes" : "&nbsp;"}</small></div>`,
    )
    .join("");
}
function statsSimpleShowNumberAnimation(host) {
  if (!statsMotionOK() || !host) return;
  host.querySelectorAll("[data-v5-number]").forEach((el) => {
    const value = Number(el.dataset.v5Number);
    if (!value) return;
    if (el.animate)
      el.animate(
        [
          { opacity: 0.2, transform: "translateY(6px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 370, easing: "cubic-bezier(.22,1,.36,1)" },
      );
  });
}
function statsSimpleMasterRecords(names, horizon) {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  return names
    .flatMap((license) =>
      masterItems(license).map((account) => {
        const end = statsMasterDate(account.endDate);
        const days = end ? Math.round((end.getTime() - base.getTime()) / 86400000) : null;
        return { license, account, days };
      }),
    )
    .filter((x) => x.days !== null && x.days <= horizon)
    .sort(
      (a, b) =>
        a.days - b.days ||
        a.license.localeCompare(b.license) ||
        Number(a.account.number) - Number(b.account.number),
    );
}
function statsSimpleMasters(hostId, labelId, items, all) {
  const host = document.getElementById(hostId),
    label = document.getElementById(labelId);
  label.textContent = items.length + " por revisar";
  if (!items.length) {
    host.innerHTML = '<p class="stats-v5-empty">No hay cuentas maestras vencidas ni próximas a vencer.</p>';
    return;
  }
  host.innerHTML =
    items
      .slice(0, 5)
      .map((r, i) => {
        const text =
          r.days < 0
            ? `Venció hace ${Math.abs(r.days)} d`
            : r.days === 0
              ? "Vence hoy"
              : `En ${r.days} día${r.days === 1 ? "" : "s"}`;
        const color = statsProductColor(r.license);
        return `<div class="stats-v5-notice" style="--v5-color:${color};--v5-delay:${i * 55}ms"><i class="stats-v5-marker"></i><div><strong>${all ? '<span class="stats-v5-license-name">' + esc(r.license) + "</span> · " : ""}Cuenta ${esc(r.account.number ?? "—")}</strong><small title="${esc(r.account.email || "")}">${esc(r.account.email || "Sin correo")}</small></div><div class="stats-v5-notice-end"><span class="${r.days < 0 ? "stats-v5-overdue" : r.days <= 7 ? "stats-v5-urgent" : ""}">${text}</span><button type="button" data-stats-renew-master="${esc(r.account.id)}" data-stats-renew-license="${esc(r.license)}">Renovar</button></div></div>`;
      })
      .join("") +
    (items.length > 5
      ? `<p class="stats-v5-overflow">Y ${items.length - 5} cuentas más que requieren revisión.</p>`
      : "");
}
function statsSimpleClients(hostId, labelId, items, all) {
  const host = document.getElementById(hostId),
    label = document.getElementById(labelId);
  label.textContent = items.length + " por vencer";
  if (!items.length) {
    host.innerHTML = '<p class="stats-v5-empty">No hay clientes próximos a vencer en este plazo.</p>';
    return;
  }
  host.innerHTML =
    items
      .slice(0, 6)
      .map(
        (r, i) =>
          `<div class="stats-v5-client" style="--v5-color:${statsProductColor(r.license)};--v5-delay:${i * 40}ms"><span class="stats-v5-dot"></span><div><strong title="${esc(r.u.email || "Sin correo")}">${esc(r.u.email || "Sin correo")}</strong><small>${all ? esc(r.license) + " · " : ""}Cuenta ${esc(r.u.account ?? "—")}</small></div><span class="stats-v5-client-days ${r.days <= 7 ? "is-urgent" : ""}">${r.days === 1 ? "1 día" : r.days + " días"}</span></div>`,
      )
      .join("") +
    (items.length > 6 ? `<p class="stats-v5-overflow">Y ${items.length - 6} clientes más.</p>` : "");
}

/* SVG nativos: gráficos ligeros sin librerías externas. Valores reales de los registros. */
function statsV6Ring(containerId, parts, centerValue, centerLabel, interactive) {
  const host = document.getElementById(containerId);
  if (!host) return;
  const sum = parts.reduce((n, p) => n + Math.max(0, Number(p.value) || 0), 0);
  const circumference = 2 * Math.PI * 75;
  let offset = 0;
  const slices = parts
    .filter((p) => p.value > 0)
    .map((p, i) => {
      const len = Math.max(0, (p.value / sum) * circumference),
        start = (offset / circumference) * 360 - 90;
      offset += len;
      const data = interactive
        ? ` data-stats-choose="${esc(p.name)}" tabindex="0" role="button" aria-label="Ver ${esc(p.name)}: ${p.value} accesos"`
        : "";
      return `<circle class="stats-v6-arc${interactive ? " is-interactive" : ""}" cx="110" cy="110" r="75" fill="none" stroke="${esc(p.color)}" stroke-width="20" stroke-dasharray="${Math.max(0, len - 0.7)} ${circumference}" transform="rotate(${start} 110 110)" style="--v6-delay:${i * 90}ms"${data}><title>${esc(p.name)}: ${statsSimpleCount(p.value)} (${Math.round((p.value / sum) * 100)}%)</title></circle>`;
    })
    .join("");
  host.innerHTML = `<svg class="stats-v6-ring-svg" viewBox="0 0 220 220" aria-hidden="${interactive ? "false" : "true"}"><circle cx="110" cy="110" r="75" fill="none" stroke="var(--surface)" stroke-width="20"/>${slices}<text class="stats-v6-center-number" x="110" y="108" text-anchor="middle">${statsSimpleCount(centerValue)}</text><text class="stats-v6-center-caption" x="110" y="129" text-anchor="middle">${esc(centerLabel)}</text></svg>`;
}
function statsV6Tint(color, level) {
  const r = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
  const light = document.documentElement.dataset.theme === "dark";
  const weight = level === 100 ? 0 : level === 65 ? 0.26 : 0.52;
  return (
    "#" +
    r
      .map((v) =>
        Math.round(v * (1 - weight) + (light ? 255 : 0) * weight)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
function statsV6ExpiryGraph(rows, horizon, color) {
  const box = document.getElementById("statsV6ExpiryBars"),
    label = document.getElementById("statsV6ExpiryCount");
  const active = rows.filter((r) => r.state === "active" && r.days > 0 && r.days <= horizon);
  label.textContent = active.length + " accesos";
  const limits =
    horizon === Infinity
      ? [7, 30, 90, Infinity]
      : [7, 30, 90, 180]
          .filter((v) => v < horizon)
          .concat([horizon])
          .filter((v, i, a) => v > 0 && a.indexOf(v) === i);
  const bins = limits.map((max, i) => {
    const min = i === 0 ? 1 : limits[i - 1] + 1;
    return { min, max, value: active.filter((r) => r.days >= min && r.days <= max).length };
  });
  const biggest = Math.max(1, ...bins.map((b) => b.value));
  box.innerHTML =
    bins
      .map((b, i) => {
        const interval =
          b.max === Infinity ? "91+ días" : b.min === 1 ? `1–${b.max} días` : `${b.min}–${b.max} días`;
        const pct = (b.value / biggest) * 100;
        return `<div class="stats-v6-expiry-item" style="--v5-color:${color};--v6-delay:${i * 95}ms"><div class="stats-v6-expiry-meta"><span>${interval}</span><strong>${statsSimpleCount(b.value)}</strong></div><div class="stats-v6-expiry-track"><i style="width:${pct}%"></i></div></div>`;
      })
      .join("") || '<p class="stats-v5-empty">No hay vencimientos próximos.</p>';
}

function statsRenderSimple(rows, names, tally, soon, products, horizon, total) {
  const choice = document.getElementById("statsLicenseFilter").value,
    all = choice === "all";
  const a = document.getElementById("statsSimpleOverview"),
    b = document.getElementById("statsSimpleDetail");
  a.hidden = !all;
  b.hidden = all;
  const months = statsSimpleMonths[String(horizon)] || statsSimpleMonths["30"];
  document.getElementById("statsMonthsCaption").textContent = months;
  document
    .getElementById("statsMonthsTrigger")
    .setAttribute(
      "aria-label",
      horizon === Infinity ? "Ver todos los vencimientos" : "Vencimientos en los próximos " + months,
    );
  document
    .querySelectorAll("[data-stats-month]")
    .forEach((el) =>
      el.setAttribute(
        "aria-selected",
        String(el.dataset.statsMonth === (horizon === Infinity ? "0" : String(horizon))),
      ),
    );
  const masters = statsSimpleMasterRecords(names, horizon);
  if (all) {
    document.getElementById("statsOverviewMetrics").innerHTML = statsSimpleMetrics(
      total,
      tally,
      soon,
      horizon,
    );
    const top = Math.max(1, ...products.map((p) => p.count));
    document.getElementById("statsOverviewLicenses").innerHTML =
      products
        .filter((p) => p.count > 0)
        .map(
          (p, i) =>
            `<button type="button" data-stats-choose="${esc(p.name)}" style="--v5-color:${statsProductColor(p.name)};--v5-delay:${i * 48}ms" class="stats-v5-product"><span class="stats-v5-product-name"><i></i><strong>${esc(p.name)}</strong><span>${p.count}<em> · ${total ? Math.round((p.count / total) * 100) : 0}%</em></span></span><span class="stats-v5-product-track"><i style="width:${(p.count / top) * 100}%"></i></span></button>`,
        )
        .join("") || '<p class="stats-v5-empty">Todavía no hay accesos registrados.</p>';
    statsV6Ring(
      "statsOverviewDonut",
      products.map((p) => ({ name: p.name, value: p.count, color: statsProductColor(p.name) })),
      total,
      "accesos",
      true,
    );
    statsSimpleMasters("statsOverviewMasters", "statsOverviewMasterLabel", masters, true);
    statsSimpleClients("statsOverviewClients", "statsOverviewClientsLabel", soon, true);
    statsSimpleShowNumberAnimation(a);
  } else {
    const color = statsProductColor(choice);
    document.getElementById("statsDetailTitle").innerHTML =
      `<span class="stats-v5-dot" style="--v5-color:${color}"></span>${esc(choice)}`;

    document.getElementById("statsDetailMetrics").innerHTML = statsSimpleMetrics(total, tally, soon, horizon);
    const statuses = [
      ["Activos", tally.active, 100, "active"],
      ["Vencidos", tally.expired, 38, "expired"],
      ["Suspendidos", tally.suspended, 65, "paused"],
    ].filter((x) => x[1] > 0);
    document.getElementById("statsDetailStatusInfo").textContent = total
      ? Math.round((tally.active / total) * 100) + "% activo"
      : "Sin accesos";
    document.getElementById("statsDetailStatusTrack").innerHTML = total
      ? statuses
          .map(
            ([name, n, level, kind]) =>
              `<span class="is-${kind}" style="width:${(n / total) * 100}%;--v5-color:${color};--v5-opacity:${level}%;" title="${name}: ${n}"></span>`,
          )
          .join("")
      : "";
    document.getElementById("statsDetailStatusKey").innerHTML = statuses
      .map(
        ([name, n, level, kind]) =>
          `<span><i class="is-${kind}" style="--v5-color:${color}"></i>${name}: <b>${n}</b></span>`,
      )
      .join("");
    statsV6Ring(
      "statsDetailDonut",
      statuses.map(([name, n, level]) => ({ name, value: n, color: statsV6Tint(color, level) })),
      total,
      "accesos",
      false,
    );
    statsV6ExpiryGraph(rows, horizon, color);
    statsSimpleMasters("statsDetailMasters", "statsDetailMasterLabel", masters, false);
    statsSimpleClients("statsDetailClients", "statsDetailClientsLabel", soon, false);
    statsSimpleShowNumberAnimation(b);
  }
}
function statsSimpleSetMonth(days) {
  const control = document.getElementById("statsWindowFilter");
  if (control.value === days) {
    statsSimpleCloseMonths();
    return;
  }
  control.value = days;
  control.dispatchEvent(new Event("change", { bubbles: true }));
  statsSimpleCloseMonths();
  renderStatistics();
}
function statsSimpleCloseMonths() {
  document.getElementById("statsMonthsMenu").hidden = true;
  document.getElementById("statsMonthsTrigger").setAttribute("aria-expanded", "false");
}
document.getElementById("statsMonthsTrigger").addEventListener("click", () => {
  const menu = document.getElementById("statsMonthsMenu"),
    open = menu.hidden;
  menu.hidden = !open;
  document.getElementById("statsMonthsTrigger").setAttribute("aria-expanded", String(open));
});
document.getElementById("statsMonthsMenu").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-stats-month]");
  if (btn) statsSimpleSetMonth(btn.dataset.statsMonth);
});
document.addEventListener("pointerdown", (e) => {
  if (!e.target.closest("#statsMonthsWrap")) statsSimpleCloseMonths();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") statsSimpleCloseMonths();
});
document.getElementById("statsSimpleRoot").addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    const target = e.target.closest("circle[data-stats-choose]");
    if (target) {
      e.preventDefault();
      statsSelectTab(target.dataset.statsChoose);
    }
  }
});
document.getElementById("statsSimpleRoot").addEventListener("click", (e) => {
  const choose = e.target.closest("[data-stats-choose]");
  if (choose) {
    statsSelectTab(choose.dataset.statsChoose);
    return;
  }
  const renew = e.target.closest("[data-stats-renew-master]");
  if (renew) {
    statsOpenMasterRenewal(renew.dataset.statsRenewLicense, renew.dataset.statsRenewMaster);
  }
});

function showStatistics() {
  if (!isAdmin()) return;
  closeProfileMenu();
  showView("stats");
}

document.querySelector("#menuStats").addEventListener("click", showStatistics);
document.querySelector("#statsLicenseFilter").addEventListener("change", renderStatistics);
document.querySelector("#statsWindowFilter").addEventListener("change", renderStatistics);
document.querySelector("#statsExport").addEventListener("click", statsExportCsv);
document.querySelector("#statsReload").addEventListener("click", async function () {
  if (this.disabled) return;
  this.disabled = true;
  try {
    await refreshPanelData();
    renderStatistics();
  } finally {
    this.disabled = false;
  }
});
window.addEventListener("storage", (e) => {
  if ([STORE_KEY, STAFF_KEY].includes(e.key) && activeView === "stats") renderStatistics();
});
window.addEventListener("focus", () => {
  if (activeView === "stats") renderStatistics();
});
