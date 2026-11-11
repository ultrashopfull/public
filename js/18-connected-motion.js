/* Reuse the reference motion system for confirmed connected operations.
 * Presentation only: no requests, payload changes, storage writes or artificial delays.
 */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const visible = el => el && !el.hidden && el.getClientRects().length;
  const safe = action => { try { return action(); } catch { return undefined; } };
  const identity = user => String(user._clientId ?? user.id ?? '');
  const clientState = license => new Map((datasets[license] || []).map(user =>
    [identity(user), { account: user.account, status: user.status }]));

  function migrationLoading(command, payload, options, license, before) {
    if (reduced.matches) return () => {};
    let backdrop, stage, className;
    if (command === 'client.assign') {
      backdrop = document.querySelector('#migrateBackdrop');
      stage = document.querySelector('#migrationStage');
      if (!visible(backdrop)) return () => {};
      const user = (datasets[license] || []).find(u => identity(u) === String(payload.clientId));
      const master = masterItems(license).find(m => String(m._id) === String(payload.masterId));
      stage.querySelector('[data-migration-from]').textContent = accountCaption(license, user?.account);
      stage.querySelector('[data-migration-to]').textContent = accountCaption(license, master?.number);
      stage.querySelector('[data-migration-person]').textContent = user?.email || 'Sin usuario';
      stage.querySelector('.migration-title').textContent = 'Moviendo acceso';
      stage.querySelector('[data-migration-caption]').textContent = 'Transfiriendo el acceso…';
      backdrop.style.setProperty('--migration-color', licenseColors[license] || '#10a37f');
      className = 'is-migrating';
    } else if (command === 'bulk.run' && options?.close?.includes('#bulkMigrateBackdrop')) {
      backdrop = document.querySelector('#bulkMigrateBackdrop');
      stage = document.querySelector('#bulkRunStage');
      if (!visible(backdrop)) return () => {};
      const job = readBulkJobs().find(item => item.id === payload.id);
      if (!job) return () => {};
      const size = Math.min(job.mode === 'timer' ? 5 : job.pendingIds.length, job.pendingIds.length);
      backdrop.style.setProperty('--accent', licenseColors[job.license] || '#10a37f');
      document.querySelector('#bulkRunTitle').textContent = 'Migrando accesos';
      document.querySelector('#bulkRunCaption').textContent = size + ' clientes → ' + accountCaption(job.license, job.destination);
      document.querySelector('#bulkRunCounter').textContent = '0 de ' + size;
      document.querySelector('#bulkRunPhase').textContent = 'Transfiriendo accesos…';
      className = 'is-bulk-running';
    } else return () => {};
    stage.classList.remove('is-complete', 'is-error');
    stage.hidden = false;
    backdrop.classList.add(className);
    return () => {
      backdrop.classList.remove(className);
      stage.hidden = true;
      stage.classList.remove('is-complete', 'is-error');
    };
  }

  function confirmed(command, payload, license, before) {
    if (reduced.matches || current !== license || activeView !== 'clients') return;
    const users = datasets[license] || [];
    if (command === 'bulk.run') {
      users.forEach((user, index) => {
        const old = before.get(identity(user));
        if (old && old.account !== user.account)
          window.NovaMotion?.row(index, 'migrate', {from: old.account, to: user.account});
      });
      return;
    }
    const index = command === 'client.create'
      ? users.findIndex(user => !before.has(identity(user)))
      : users.findIndex(user => identity(user) === String(payload.clientId));
    if (index < 0) return;
    const user = users[index];
    const effect = {
      'client.create': 'create', 'client.edit': 'edit', 'client.renew': 'renew',
      'client.status': payload.active ? 'reactivate' : 'suspend',
      'client.assign': 'migrate', 'client.close_session': 'signout'
    }[command];
    if (effect) window.NovaMotion?.row(index, effect, effect === 'migrate'
      ? {from: before.get(identity(user))?.account, to: user.account} : undefined);
  }

  const original = window.panelSync?.run;
  if (original) window.panelSync.run = async function(command, payload, options) {
    // Do not start a second presentation for a rejected concurrent operation.
    if (panelSync.busy || !panelSync.connected()) return original.apply(this, arguments);
    const args = arguments, license = current;
    const before = safe(() => clientState(license)) || new Map();
    const stop = safe(() => migrationLoading(command, payload, options, license, before));
    const unmark = command === 'client.delete'
      ? safe(() => window.NovaMotion?.pendingRemoval(payload.clientId)) : null;
    try {
      const ok = await original.apply(this, args);
      if (ok === true) safe(() => confirmed(command, payload, license, before));
      return ok;
    } finally {
      safe(() => stop?.());
      safe(() => unmark?.());
    }
  };
})();
