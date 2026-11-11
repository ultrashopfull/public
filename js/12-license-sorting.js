/* Ordering is available only on client license tabs. */
(() => {
  function enableLicenseSort(rail, selector, key, manager) {
    let hold = null,
      ghost = null,
      scrollFrame = 0,
      suppressed = null,
      suppressUntil = 0;
    const tabs = () => [...rail.querySelectorAll(selector)];
    function clearHold() {
      if (hold?.timer) clearTimeout(hold.timer);
      hold?.tab.classList.remove("license-holding");
    }
    function clearDrag() {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
      ghost?.remove();
      ghost = null;
      hold?.tab.classList.remove("license-dragging");
      document.body.classList.remove("license-sorting");
    }
    function moveGhost(x, y) {
      if (!ghost) return;
      ghost.style.left =
        Math.max(8, Math.min(innerWidth - ghost.offsetWidth - 8, x - ghost.offsetWidth / 2)) + "px";
      ghost.style.top =
        Math.max(8, Math.min(innerHeight - ghost.offsetHeight - 8, y - ghost.offsetHeight - 12)) + "px";
    }
    function positionTab(x) {
      if (!hold?.dragging) return;
      const peers = tabs().filter((tab) => tab !== hold.tab),
        before =
          peers.find((tab) => x < tab.getBoundingClientRect().left + tab.getBoundingClientRect().width / 2) ||
          manager;
      if (hold.tab.nextElementSibling === before) return;
      const old = new Map(peers.map((tab) => [tab, tab.getBoundingClientRect().left]));
      rail.insertBefore(hold.tab, before);
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
        for (const tab of peers) {
          const dx = old.get(tab) - tab.getBoundingClientRect().left;
          if (Math.abs(dx) > 1)
            tab.animate([{ transform: `translateX(${dx}px)` }, { transform: "none" }], {
              duration: 260,
              easing: "cubic-bezier(.22,1,.36,1)",
            });
        }
    }
    function scrollNearEdge() {
      if (!hold?.dragging) return;
      const rect = rail.getBoundingClientRect(),
        delta = hold.x < rect.left + 38 ? -11 : hold.x > rect.right - 38 ? 11 : 0;
      if (delta) {
        rail.scrollLeft += delta;
        positionTab(hold.x);
      }
      scrollFrame = requestAnimationFrame(scrollNearEdge);
    }
    function beginDrag(candidate) {
      if (hold !== candidate || !isAdmin() || rowActionBusy || migrationBusy) return;
      candidate.dragging = true;
      candidate.tab.classList.remove("license-holding");
      candidate.tab.classList.add("license-dragging");
      document.body.classList.add("license-sorting");
      ghost = candidate.tab.cloneNode(true);
      ghost.removeAttribute("id");
      ghost.classList.remove("license-dragging", "license-holding", "motion-selected");
      ghost.classList.add("tab", "license-drag-ghost");
      ghost.style.setProperty("--tab-color", licenseColors[candidate.tab.dataset[key]] || "#10a37f");
      ghost.style.setProperty(
        "--tab-ink",
        novaContrastInk(licenseColors[candidate.tab.dataset[key]] || "#10a37f"),
      );
      ghost.setAttribute("aria-hidden", "true");
      ghost.inert = true;
      document.body.append(ghost);
      moveGhost(candidate.x, candidate.y);
      navigator.vibrate?.(25);
      scrollFrame = requestAnimationFrame(scrollNearEdge);
    }
    rail.addEventListener("pointerdown", (event) => {
      const tab = event.target.closest(selector);
      if (
        !tab ||
        hold ||
        !isAdmin() ||
        rowActionBusy ||
        migrationBusy ||
        (event.pointerType === "mouse" && event.button !== 0)
      )
        return;
      hold = {
        tab,
        id: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        x: event.clientX,
        y: event.clientY,
        scrollLeft: rail.scrollLeft,
        dragging: false,
        scrolling: false,
        timer: 0,
        original: tabs().indexOf(tab),
      };
      const candidate = hold;
      tab.classList.add("license-holding");
      candidate.timer = setTimeout(() => beginDrag(candidate), 2000);
    });
    document.addEventListener(
      "pointermove",
      (event) => {
        if (!hold || event.pointerId !== hold.id) return;
        hold.x = event.clientX;
        hold.y = event.clientY;
        if (hold.dragging) {
          event.preventDefault();
          moveGhost(hold.x, hold.y);
          positionTab(hold.x);
          return;
        }
        const dx = hold.x - hold.startX,
          dy = hold.y - hold.startY;
        if (Math.abs(dx) > 9 || Math.abs(dy) > 9) {
          clearHold();
          if (
            (event.pointerType === "touch" || event.pointerType === "pen") &&
            Math.abs(dx) >= Math.abs(dy)
          ) {
            hold.scrolling = true;
            rail.scrollLeft = hold.scrollLeft - dx;
            event.preventDefault();
          }
        }
      },
      { passive: false },
    );
    function finish(event, cancel = false) {
      if (!hold || event.pointerId !== hold.id) return;
      const candidate = hold;
      clearHold();
      if (candidate.dragging) {
        if (!cancel) {
          positionTab(candidate.x);
          const position = tabs().indexOf(candidate.tab);
          if (position !== candidate.original) {
            reorderLicense(candidate.tab.dataset[key], position);
            persist();
          }
        }
        suppressed = candidate.tab.dataset[key];
        suppressUntil = performance.now() + 700;
        clearDrag();
        hold = null;
        syncTabs();
        if (activeView === "masters") renderMasters();
        return;
      }
      if (candidate.scrolling) {
        suppressed = candidate.tab.dataset[key];
        suppressUntil = performance.now() + 700;
      }
      clearDrag();
      hold = null;
    }
    document.addEventListener("pointerup", (event) => finish(event));
    document.addEventListener("pointercancel", (event) => finish(event, true));
    rail.addEventListener("keydown", (event) => {
      const tab = event.target.closest(selector);
      if (!tab || !isAdmin() || !event.altKey || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const name = tab.dataset[key],
        position = tabs().indexOf(tab),
        next = Math.max(0, Math.min(tabs().length - 1, position + (event.key === "ArrowRight" ? 1 : -1)));
      if (next === position) return;
      reorderLicense(name, next);
      persist();
      syncTabs();
      if (activeView === "masters") renderMasters();
      [...rail.querySelectorAll(selector)]
        .find((item) => item.dataset[key] === name)
        ?.focus({ preventScroll: true });
    });
    document.addEventListener(
      "click",
      (event) => {
        const tab = event.target.closest(selector);
        if (
          tab &&
          rail.contains(tab) &&
          tab.dataset[key] === suppressed &&
          performance.now() < suppressUntil
        ) {
          event.preventDefault();
          event.stopImmediatePropagation();
          suppressed = null;
        }
      },
      true,
    );
    rail.addEventListener("contextmenu", (event) => {
      if (event.target.closest(selector)) event.preventDefault();
    });
    window.addEventListener("blur", () => {
      if (hold) finish({ pointerId: hold.id }, true);
    });
  }
  enableLicenseSort(
    document.querySelector("#tabs"),
    ".tab[data-license]",
    "license",
    null,
  );
})();
