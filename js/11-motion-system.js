/* One motion language: immediate data changes, interruptible animation, reduced-motion support. */
window.NovaMotion = (() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const ease = "cubic-bezier(.22,1,.36,1)",
    settle = "cubic-bezier(.2,.8,.2,1)";
  const running = new WeakMap(),
    identities = new WeakMap(),
    lastLists = new WeakMap(),
    ghosts = new Set(),
    feedbacks = new Map(),
    pendingDeletes = new Set();
  let serial = 0,
    lastTrigger = null,
    themeTimer;
  const visible = (el) => !!el && !!el.getClientRects().length;
  function play(el, frames, options = {}) {
    if (!el || reduced.matches || !el.animate) return;
    const channel = options.channel || "motion";
    delete options.channel;
    let channels = running.get(el);
    if (!channels) {
      channels = new Map();
      running.set(el, channels);
    }
    channels.get(channel)?.cancel();
    const a = el.animate(frames, { duration: 440, easing: ease, ...options });
    channels.set(channel, a);
    a.finished.then(
      () => {
        if (channels.get(channel) === a) channels.delete(channel);
      },
      () => {},
    );
    return a;
  }
  function entrance(el, index = 0, distance = 16) {
    if (!visible(el)) return;
    const opacity = getComputedStyle(el).opacity;
    play(
      el,
      [
        { opacity: 0, transform: `translate3d(0,${distance}px,0) scale(.985)` },
        { opacity, transform: "none" },
      ],
      { duration: 480, delay: Math.min(index, 6) * 32, fill: "backwards" },
    );
  }
  function list(host = document.querySelector("#userRows")) {
    if (!visible(host) || reduced.matches) return;
    if (performance.now() - (lastLists.get(host) || 0) < 160) return;
    lastLists.set(host, performance.now());
    [...host.children].slice(0, 24).forEach((el, i) => entrance(el, i));
    host
      .querySelectorAll(".progress i,.master-meter i")
      .forEach((bar, i) =>
        play(bar, [{ transform: "scaleX(.08)" }, { transform: "scaleX(1)" }], {
          duration: 760,
          delay: 80 + Math.min(i, 6) * 32,
          channel: "bar",
        }),
      );
  }
  function sanitize(clone) {
    clone.removeAttribute("id");
    clone.querySelectorAll(".client-password-value:not(.is-unavailable)").forEach(el => {el.textContent="••••••••"; el.classList.add("is-masked");});
    clone.querySelectorAll(".client-password-toggle").forEach(el => {el.setAttribute("aria-pressed","false");el.innerHTML=uiIcons.eye;});
    clone.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
    clone.setAttribute("aria-hidden", "true");
    clone.inert = true;
    clone.style.pointerEvents = "none";
    clone.querySelectorAll("button,input,select,textarea,a").forEach((el) => (el.tabIndex = -1));
    return clone;
  }
  function retire(el, a, timeout = 650) {
    ghosts.add(el);
    let fallback;
    const remove = () => {
      clearTimeout(fallback);
      el.remove();
      ghosts.delete(el);
    };
    if (a) {
      fallback = setTimeout(remove, timeout);
      a.finished.then(remove, remove);
    } else remove();
  }
  function ghostItem(snapshot, kind) {
    if (
      reduced.matches ||
      !snapshot.rect.width ||
      snapshot.rect.bottom < 0 ||
      snapshot.rect.top > innerHeight
    )
      return;
    const shell = document.createElement("div");
    shell.className = "motion-exit" + (kind === "delete" ? " motion-exit-delete" : "");
    shell.setAttribute("aria-hidden", "true");
    shell.inert = true;
    const r = snapshot.rect;
    Object.assign(shell.style, {
      left: r.left + "px",
      top: r.top + "px",
      width: r.width + "px",
      height: r.height + "px",
    });
    const copy = sanitize(snapshot.clone);
    if (copy.tagName === "TR") {
      const table = document.createElement("table");
      table.className = snapshot.tableClass;
      const body = document.createElement("tbody");
      snapshot.widths.forEach((w, i) => {
        if (copy.children[i]) copy.children[i].style.width = w + "px";
      });
      body.append(copy);
      table.append(body);
      shell.append(table);
    } else shell.append(copy);
    if (kind === "delete") {
      const stamp = document.createElement("span");
      stamp.className = "motion-delete-stamp";
      stamp.textContent = "ELIMINADO";
      shell.append(stamp);
    }
    document.body.append(shell);
    const frames =
      kind === "delete"
        ? [
            { opacity: 1, transform: "translate3d(0,0,0) scale(1)" },
            { opacity: 1, transform: "translate3d(0,0,0) scale(1)", offset: 0.25 },
            { opacity: 0, transform: "translate3d(72px,0,0) scale(.9,.72)" },
          ]
        : [
            { opacity: 0.8, transform: "none" },
            { opacity: 0, transform: "translate3d(18px,0,0) scale(.97)" },
          ];
    retire(
      shell,
      play(shell, frames, { duration: kind === "delete" ? 780 : 220, easing: "cubic-bezier(.4,0,1,1)" }),
      kind === "delete" ? 1000 : 650,
    );
  }
  function keyRows(host) {
    for (const el of host?.children || []) {
      let key = el.dataset.staffId || el.dataset.masterId;
      if (el.hasAttribute("data-index")) {
        const item = datasets[current]?.[Number(el.dataset.index)];
        if (item) {
          if (item.id) key = "client-" + item.id;
          else {
            if (!identities.has(item)) identities.set(item, "client-" + ++serial);
            key = identities.get(item);
          }
        }
      }
      el.dataset.motionKey = key || el.id || "empty";
    }
  }
  function snapshot(host) {
    const map = new Map();
    if (!visible(host) || reduced.matches) return map;
    [...host.children].forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight + 80) return;
      map.set(el.dataset.motionKey, {
        rect,
        opacity: getComputedStyle(el).opacity,
        clone: el.cloneNode(true),
        widths: [...el.children].map((c) => c.getBoundingClientRect().width),
        tableClass: el.closest("table")?.className || "",
        state: el.className,
        cells: [...el.children].map(cell => cell.classList.contains("client-password-cell") ? null : cell.textContent),
        bar: el.querySelector(".progress i,.master-meter i")?.style.width,
      });
    });
    return map;
  }
  function reconcile(host, before, changedSection) {
    keyRows(host);
    if (!visible(host) || reduced.matches) return;
    lastLists.set(host, performance.now());
    if (changedSection || !before.size) {
      lastLists.delete(host);
      list(host);
      return;
    }
    let added = 0;
    for (const el of host.children) {
      const old = before.get(el.dataset.motionKey);
      before.delete(el.dataset.motionKey);
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight + 80) continue;
      if (!old) {
        entrance(el, added++, -14);
        continue;
      }
      const dx = old.rect.left - rect.left,
        dy = old.rect.top - rect.top;
      if (Math.abs(dx) + Math.abs(dy) > 1)
        play(el, [{ transform: `translate3d(${dx}px,${dy}px,0)` }, { transform: "none" }], { duration: 460 });
      if (host.id === "userRows") [...el.children].forEach((cell, index) => {
        if (old.cells?.[index] != null && old.cells[index] !== cell.textContent)
          cell.classList.add("client-cell-changed");
      });
      const opacity = getComputedStyle(el).opacity;
      if (old.opacity !== opacity)
        play(el, [{ opacity: old.opacity }, { opacity }], { duration: 500, channel: "state" });
      if (old.state !== el.className) {
        const badge = el.querySelector(".status,.staff-state,.master-card-state");
        entrance(badge, 0, 4);
      }
      const bar = el.querySelector(".progress i,.master-meter i");
      if (bar && old.bar !== bar.style.width)
        play(bar, [{ width: old.bar || "0%" }, { width: bar.style.width }], {
          duration: 850,
          channel: "bar",
        });
    }
    // Removed/filter-matched rows dissolve while surviving rows settle into place.
    [...before.entries()].slice(0, 10).forEach(([key, item]) => {
      ghostItem(item, pendingDeletes.has(key) ? "delete" : null);
      pendingDeletes.delete(key);
    });
  }
  function hookRender(name, selector, section) {
    const original = window[name];
    let previous = section();
    keyRows(document.querySelector(selector));
    window[name] = function (...args) {
      const host = document.querySelector(selector),
        before = snapshot(host),
        next = section();
      const result = original.apply(this, args);
      reconcile(host, before, next !== previous);
      previous = next;
      return result;
    };
  }
  function accentPulse(el, color = "var(--accent-soft)") {
    if (!el) return;
    play(
      el,
      [
        { boxShadow: `inset 3px 0 0 var(--accent)`, backgroundColor: color },
        { boxShadow: "inset 0px 0 0 transparent", backgroundColor: getComputedStyle(el).backgroundColor },
      ],
      { duration: 900, channel: "feedback" },
    );
  }
  const feedbackLabels = {
    renew: "ACCESO RENOVADO",
    suspend: "ACCESO SUSPENDIDO",
    reactivate: "ACCESO REACTIVADO",
    copy: "ACCESO COPIADO",
    migrate: "LISTO",
    edit: "CAMBIOS GUARDADOS",
    signout: "SESIÓN CERRADA",
    whatsapp: "ABRIENDO WHATSAPP",
    create: "ACCESO CREADO",
    delete: "CLIENTE ELIMINADO",
  };
  function rowFeedback(target, effect, detail) {
    if (reduced.matches || !visible(target)) return;
    const rect = target.getBoundingClientRect(),
      key = target.dataset.motionKey || "row-" + target.dataset.index;
    const prior = feedbacks.get(key);
    if (prior) {
      prior.remove();
      ghosts.delete(prior);
    }
    const layer = document.createElement("div");
    layer.className = "motion-row-feedback effect-" + effect;
    layer.setAttribute("aria-hidden", "true");
    layer.inert = true;
    Object.assign(layer.style, {
      left: rect.left + "px",
      top: rect.top + "px",
      width: rect.width + "px",
      height: rect.height + "px",
    });
    layer.style.setProperty("--fx", licenseColors[current] || "#10a37f");
    const beam = document.createElement("span");
    beam.className = "motion-row-beam";
    const hud = document.createElement("span");
    hud.className = "motion-row-hud";
    const art = document.createElement("span");
    art.className = "motion-row-art";
    art.innerHTML = `<svg viewBox="0 0 24 24">${effect === "migrate" ? effects.check : effects[effect] || effects.check}</svg>`;
    const content = document.createElement("span");
    content.className = "motion-row-content";
    const label = document.createElement("strong");
    label.textContent = detail?.label || feedbackLabels[effect] || "LISTO";
    content.append(label);
    if (effect === "migrate" && detail) {
      const flow = document.createElement("span");
      flow.className = "motion-account-flow";
      for (const [className, value] of [
        ["motion-account-from", "Cuenta " + detail.from],
        ["motion-account-arrow", "→"],
        ["motion-account-to", "Cuenta " + detail.to],
      ]) {
        const part = document.createElement("span");
        part.className = className;
        part.textContent = value;
        flow.append(part);
      }
      content.append(flow);
    }
    hud.append(art, content);
    layer.append(beam, hud);
    document.body.append(layer);
    feedbacks.set(key, layer);
    ghosts.add(layer);
    const remove = () => {
      if (feedbacks.get(key) === layer) feedbacks.delete(key);
      layer.remove();
      ghosts.delete(layer);
    };
    const duration = effect === "migrate" ? 1050 : 1750;
    const animation = play(
      layer,
      [
        { opacity: 1, clipPath: "inset(0 100% 0 0)" },
        { opacity: 1, clipPath: "inset(0 0 0 0)", offset: 0.18 },
        { opacity: 1, clipPath: "inset(0 0 0 0)", offset: 0.82 },
        { opacity: 0, clipPath: "inset(0 0 0 0)" },
      ],
      { duration, easing: "cubic-bezier(.22,1,.36,1)" },
    );
    animation?.finished.then(remove, remove);
    setTimeout(remove, duration + 200);
  }
  function row(index, effect, detail) {
    if (reduced.matches) return;
    if (effect === "delete") {
      const target = document.querySelector(`#userRows tr[data-index="${index}"]`);
      if (target) {
        rowFeedback(target, effect);
        if (target.dataset.motionKey) pendingDeletes.add(target.dataset.motionKey);
      }
      return;
    }
    requestAnimationFrame(() => {
      const target = document.querySelector(`#userRows tr[data-index="${index}"]`);
      if (!visible(target)) return;
      accentPulse(target, effect === "suspend" ? "var(--warning-soft)" : "var(--accent-soft)");
      const selectors = {
        renew: ".progress i",
        suspend: ".status",
        reactivate: ".status",
        copy: ".copy svg",
        migrate: ".account-cell",
        edit: ".email-wrap",
        signout: ".session-badge",
        whatsapp: ".whatsapp svg",
        create: ".status",
      };
      const el = target.querySelector(selectors[effect] || ".status");
      if (effect === "renew")
        play(el, [{ transform: "scaleX(.12)" }, { transform: "scaleX(1)" }], {
          duration: 900,
          channel: "bar",
        });
      else if (effect === "migrate")
        play(
          el,
          [
            { opacity: 0, transform: "translateX(-14px)" },
            { opacity: 1, transform: "translateX(0)" },
          ],
          { duration: 580 },
        );
      else
        play(
          el,
          [
            { transform: "scale(.85)", opacity: 0.45 },
            { transform: "scale(1.07)", opacity: 1, offset: 0.65 },
            { transform: "scale(1)", opacity: 1 },
          ],
          { duration: 480 },
        );
      rowFeedback(target, effect, detail);
    });
  }
  const effects = {
    check: '<path class="draw" d="m5 12 4 4 10-10"/>',
    renew:
      '<g class="turn"><path d="M20 7v5h-5M4 17v-5h5M5.5 9a7 7 0 0 1 12-2L20 12M4 12l2.5 5a7 7 0 0 0 12-2"/></g>',
    copy: '<path class="copy-back" d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/><rect class="copy-front" x="8" y="8" width="11" height="12" rx="2"/>',
    delete:
      '<path class="bin-lid" d="M4 7h16M9 7V4h6v3"/><path class="bin-body" d="m6 7 1 13h10l1-13M10 11v5M14 11v5"/>',
    suspend: '<path class="pause-left" d="M9 6v12"/><path class="pause-right" d="M15 6v12"/>',
    migrate: '<path class="arrow-out" d="M4 8h15l-4-4"/><path class="arrow-in" d="M20 16H5l4 4"/>',
    error: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 17h.01"/>',
    create: '<path class="plus-draw" d="M12 5v14M5 12h14"/>',
    edit: '<path class="pen" d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15Z"/>',
    reactivate: '<path class="play-mark" d="m9 5 10 7-10 7Z"/>',
    signout: '<path d="M10 4H5v16h5"/><path class="arrow-out" d="m14 8 4 4-4 4M9 12h12"/>',
  };
  function notice(message, kind = "info") {
    const text = String(message);
    const el = document.querySelector("#toast");
    clearTimeout(window.toastTimer);
    el.className = "toast";
    el.textContent = text;
    el.setAttribute("role", kind === "error" ? "alert" : "status");
    // Every outcome is visible. Message wording must never suppress an error.
    el.classList.add("show");
    window.toastTimer = setTimeout(() => el.classList.remove("show"), kind === "error" ? 6500 : 3500);
  }
  function closeGhost(target) {
    if (reduced.matches) return;
    const clone = sanitize(target.cloneNode(true));
    clone.hidden = false;
    clone.classList.add("motion-closing");
    document.body.append(clone);
    play(
      clone.querySelector(".dialog"),
      [
        { opacity: 1, transform: "none" },
        { opacity: 0, transform: "translateY(10px) scale(.98)" },
      ],
      { duration: 180, easing: settle },
    );
    retire(clone, play(clone, [{ opacity: 1 }, { opacity: 0 }], { duration: 190, easing: settle }));
  }
  const states = new WeakMap(),
    focusReturns = new WeakMap(),
    menuRects = new WeakMap();
  const observer = new MutationObserver((changes) => {
    const targets = new Set(changes.map((c) => c.target));
    for (const target of targets) {
      const wasHidden = states.get(target);
      states.set(target, target.hidden);
      if (wasHidden === target.hidden) continue;
      if (target.hidden) {
        if (target.classList.contains("modal-backdrop") && !wasHidden) {
          closeGhost(target);
          const trigger = focusReturns.get(target);
          if (
            trigger?.isConnected &&
            !document.querySelector(".modal-backdrop:not([hidden]):not(.motion-closing)")
          )
            trigger.focus({ preventScroll: true });
        }
        if (target.matches(".profile-menu,.filter-menu,.license-manager") && !reduced.matches) {
          const r = menuRects.get(target);
          if (r) {
            const clone = sanitize(target.cloneNode(true));
            clone.hidden = false;
            clone.classList.add("motion-menu-exit");
            Object.assign(clone.style, {
              position: "fixed",
              left: r.left + "px",
              top: r.top + "px",
              right: "auto",
              bottom: "auto",
              width: r.width + "px",
              height: r.height + "px",
              zIndex: "60",
            });
            document.body.append(clone);
            retire(
              clone,
              play(
                clone,
                [
                  { opacity: 1, transform: "none" },
                  { opacity: 0, transform: "translateY(-5px) scale(.98)" },
                ],
                { duration: 150, easing: settle },
              ),
            );
          }
        }
        continue;
      }
      if (target.classList.contains("modal-backdrop")) {
        // Discard the outgoing copy when reopening the same surface quickly.
        for (const ghost of ghosts)
          if (ghost.classList.contains("modal-backdrop")) {
            ghost.remove();
            ghosts.delete(ghost);
          }
        focusReturns.set(target, lastTrigger);
        play(target, [{ opacity: 0 }, { opacity: 1 }], { duration: 240 });
        play(
          target.querySelector(".dialog"),
          [
            { opacity: 0, transform: "translate3d(0,24px,0) scale(.95)" },
            { opacity: 1, transform: "translate3d(0,-2px,0) scale(1)", offset: 0.8 },
            { opacity: 1, transform: "none" },
          ],
          { duration: 480 },
        );
        const parts = target.querySelector(".dialog")?.children || [];
        [...parts].slice(0, 5).forEach((el, i) => entrance(el, i, 7));
      } else if (target.matches("#app,.workspace,.management-view,#loginScreen")) {
        entrance(target, 0, 8);
        list(target.querySelector("#masterCardGrid,#staffRows,#userRows"));
      } else {
        menuRects.set(target, target.getBoundingClientRect());
        play(
          target,
          [
            { opacity: 0, transform: "translateY(-8px) scale(.97)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 300 },
        );
        [...target.children].slice(0, 8).forEach((el, i) => entrance(el, i, 5));
      }
    }
  });
  document
    .querySelectorAll(
      ".modal-backdrop,.workspace,.management-view,#app,#loginScreen,.profile-menu,.filter-menu,.license-manager",
    )
    .forEach((el) => {
      states.set(el, el.hidden);
      observer.observe(el, { attributes: true, attributeFilter: ["hidden"] });
    });
  hookRender("render", "#userRows", () => current);
  hookRender("renderStaff", "#staffRows", () => "staff");
  hookRender("renderMasters", "#masterCardGrid", () => masterLicense);
  // Content replacements use short local transitions instead of replaying an entire page.
  for (const [name, selector] of [
    ["renderCalendar", ".custom-calendar"],
    ["renderStaffPicks", "#staffLicensePicks"],
    ["renderMigrateAccounts", "#migrateAccounts"],
  ]) {
    const original = window[name];
    window[name] = function (...args) {
      const result = original.apply(this, args);
      document.querySelectorAll(selector).forEach((el) => {
        if (visible(el))
          play(
            el,
            [
              { opacity: 0.4, transform: "translateY(5px)" },
              { opacity: 1, transform: "none" },
            ],
            { duration: 260 },
          );
      });
      return result;
    };
  }
  const revealOriginal = window.masterCardAction;
  window.masterCardAction = function (action, id, field, target) {
    const result = revealOriginal.apply(this, arguments);
    if (action === "reveal")
      entrance(target?.closest(".master-card")?.querySelector(`[data-secret="${field}"]`), 0, 3);
    return result;
  };
  // Keep one moving color pill in each rail; commit the final background atomically.
  const railFlights = new WeakMap(),
    railPending = new WeakMap();
  function slideLicenseTab(button) {
    const rail = button.parentElement,
      key = button.dataset.license || button.dataset.masterLicense || button.dataset.statsLicense;
    const previous = rail.querySelector(".tab.active,button.selected"),
      flight = railFlights.get(rail),
      pending = railPending.get(rail);
    if (!previous || (!flight && !pending && previous === button)) return;
    const origin = flight?.pill.isConnected ? flight.pill : previous,
      rect = origin.getBoundingClientRect(),
      bounds = rail.getBoundingClientRect();
    const start =
      !flight && pending
        ? pending.start
        : {
            x: rect.left - bounds.left + rail.scrollLeft - rail.clientLeft,
            y: rect.top - bounds.top + rail.scrollTop - rail.clientTop,
            width: rect.width,
            height: rect.height,
            color: getComputedStyle(origin).backgroundColor,
          };
    if (pending) cancelAnimationFrame(pending.frame);
    flight?.cleanup();
    // Browser capture listeners run a microtask checkpoint before target handlers.
    // Wait for the frame so selection and master-rail replacement have completed.
    const frame = requestAnimationFrame(() => {
      railPending.delete(rail);
      const target = [...rail.querySelectorAll("button")].find(
        (el) => (el.dataset.license || el.dataset.masterLicense || el.dataset.statsLicense) === key,
      );
      if (!target?.matches(".active,.selected") || !target.isConnected || reduced.matches) return;
      const dest = target.getBoundingClientRect(),
        base = rail.getBoundingClientRect(),
        color = getComputedStyle(target).backgroundColor;
      const x = dest.left - base.left + rail.scrollLeft - rail.clientLeft,
        y = dest.top - base.top + rail.scrollTop - rail.clientTop;
      const pill = document.createElement("span");
      pill.className = "license-slide-pill";
      pill.setAttribute("aria-hidden", "true");
      Object.assign(pill.style, {
        left: start.x + "px",
        top: start.y + "px",
        width: start.width + "px",
        height: start.height + "px",
        backgroundColor: start.color,
      });
      rail.classList.add("rail-sliding");
      rail.append(pill);
      let timer,
        animation,
        finished = false;
      const cleanup = () => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        animation?.cancel();
        pill.remove();
        if (railFlights.get(rail)?.pill === pill) {
          rail.classList.remove("rail-sliding");
          railFlights.delete(rail);
        }
      };
      railFlights.set(rail, { pill, cleanup });
      if (!pill.animate) {
        cleanup();
        return;
      }
      animation = pill.animate(
        [
          {
            transform: "translate(0,0)",
            width: start.width + "px",
            height: start.height + "px",
            backgroundColor: start.color,
          },
          {
            transform: `translate(${x - start.x}px,${y - start.y}px)`,
            width: dest.width + "px",
            height: dest.height + "px",
            backgroundColor: licenseColors[key] || color,
          },
        ],
        { duration: 460, easing: ease, fill: "forwards" },
      );
      animation.finished.then(cleanup, cleanup);
      timer = setTimeout(cleanup, 560);
    });
    railPending.set(rail, { frame, start });
  }
  document.addEventListener(
    "click",
    (event) => {
      const button = event.target.closest("button,a.action");
      if (!button || button.disabled) return;
      lastTrigger = button;
      if (reduced.matches) return;
      if (button.matches(".tab[data-license],[data-master-license],[data-stats-license]")) {
        slideLicenseTab(button);
      }
      if (button.matches(".cal-nav")) {
        const host = button.closest(".custom-calendar");
        queueMicrotask(() =>
          play(
            host,
            [
              { opacity: 0.45, transform: `translateX(${button.dataset.month === "-1" ? -12 : 12}px)` },
              { opacity: 1, transform: "none" },
            ],
            { duration: 320 },
          ),
        );
      }
      if (
        button.matches(".duration-option,.staff-license-pick,.cal-day,[data-master-duration],.color-swatch")
      )
        play(
          button,
          [
            { transform: "scale(.94)" },
            { transform: "scale(1.025)", offset: 0.65 },
            { transform: "scale(1)" },
          ],
          { duration: 340 },
        );
      else if (
        !button.matches(
          ".profile-button,.tab,.inline-trigger,.theme-toggle,.refresh-button,[data-master-license],[data-stats-license],[data-theme-choice]",
        )
      )
        play(button, [{ transform: "scale(.94)" }, { transform: "scale(1)" }], { duration: 320 });
    },
    true,
  );
  document.addEventListener("pointerdown", (event) => {
    const button = event.target.closest("button,a.action");
    if (
      !button ||
      button.disabled ||
      reduced.matches ||
      button.matches(
        ".profile-button,.inline-trigger,.tab,.theme-toggle,.refresh-button,[data-master-license],[data-stats-license],.cal-day,.color-swatch",
      )
    )
      return;
    const rect = button.getBoundingClientRect();
    if (rect.width > 400) return;
    const wave = document.createElement("span");
    wave.className = "motion-wave";
    wave.setAttribute("aria-hidden", "true");
    wave.style.left = event.clientX - rect.left + "px";
    wave.style.top = event.clientY - rect.top + "px";
    wave.style.setProperty("--wave-size", Math.max(rect.width, rect.height) * 2 + "px");
    button.classList.add("motion-clip");
    button.append(wave);
    setTimeout(() => {
      wave.remove();
      if (!button.querySelector(".motion-wave")) button.classList.remove("motion-clip");
    }, 620);
  });
  document.addEventListener("change", (event) => {
    if (event.target.matches(".trial-row input"))
      play(
        event.target.nextElementSibling,
        [{ transform: "scale(.9)" }, { transform: "scale(1.04)", offset: 0.65 }, { transform: "scale(1)" }],
        { duration: 340 },
      );
  });
  for (const id of ["customDates", "renewCustom", "masterEndField"]) {
    const el = document.getElementById(id);
    if (!el) continue;
    new MutationObserver(() => {
      if (!el.hidden) {
        const height = el.offsetHeight;
        play(
          el,
          [
            { height: "0px", opacity: 0, overflow: "hidden" },
            { height: height + "px", opacity: 1, overflow: "hidden" },
          ],
          { duration: 350 },
        );
      }
    }).observe(el, { attributes: true, attributeFilter: ["hidden"] });
  }
  if (!document.querySelector("#app").hidden) list();
  else {
    entrance(document.querySelector(".login-art"));
    [...document.querySelector(".login-panel").children].forEach((el, i) => entrance(el, i, 14));
  }
  reduced.addEventListener("change", () => {
    if (reduced.matches) {
      document.getAnimations().forEach((a) => a.cancel());
      ghosts.forEach((el) => el.remove());
      ghosts.clear();
    }
  });
  // Mark only the exit animation; confirmation and data remain owned by the sync layer.
  function pendingRemoval(clientId) {
    const index = (datasets[current] || []).findIndex(user => String(user._clientId ?? user.id) === String(clientId));
    const target = document.querySelector(`#userRows tr[data-index="${index}"]`);
    const key = target?.dataset.motionKey;
    if (key) pendingDeletes.add(key);
    return () => { if (key) pendingDeletes.delete(key); };
  }
  return { list, row, notice, play, pendingRemoval };
})();
