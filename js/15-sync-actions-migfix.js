/* Shared synchronization: remote data is authoritative; local data is a cache. */
window.panelSync = (() => {
  let revision = null, readPromise = null, busy = false, lastRead = 0, lastSnapshot = null;
  let mode="unknown", connection=sbConnectionKey();
  const targets = new Map();
  const localCatalogImport=Object.entries(licenseCatalog.entries).map(([name,v])=>({product:v.product,name,color:licenseColors[name]||"#4285f4",position:Object.keys(datasets).indexOf(name)}));
  const localCatalogRemoved=[...licenseCatalog.removed];
  const connected = () => window.sbConfigured?.() === true;
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const openModal = () => !!document.querySelector('.modal-backdrop:not([hidden])');
  const scopeKey = () => 'ultrashop-pending-' + SUPABASE_API;
  const notifyError = (error) => toast(error?.message || 'No se pudo sincronizar. Intenta actualizar.', 'error');
  function remember(name, user) { targets.set(name, user ? clone(user) : null); }
  function client(name, fallback) {
    const u = targets.get(name) || fallback;
    if (!u?._clientId) throw new Error('Actualiza la lista antes de modificar este cliente.');
    return { clientId:u._clientId, product:u._product };
  }
  function apply(snapshot) {
    if (!snapshot || snapshot.version !== 1 || !snapshot.state || !Array.isArray(snapshot.clients)) throw new Error('Actualiza la función admin e instala el SQL de sincronización incluido en el ZIP.');
    if (revision !== null && Number(snapshot.state.revision)<revision) return;
    const st=snapshot.state, oldCurrent=current?licenseProductKey(current):null, oldMaster=masterLicense?licenseProductKey(masterLicense):null;
    const catalog={...st.catalog};
    snapshot.products.forEach(p=>{catalog[String(p.nombre).toLowerCase()] ||= {name:PRODUCT_DISPLAY[String(p.nombre).toLowerCase()]||p.nombre,position:p.id};});
    const entries=Object.entries(catalog).filter(([,v])=>!v.hidden).sort((a,b)=>(a[1].position||0)-(b[1].position||0));
    const names=new Map(entries.map(([p,v])=>[p,v.name]));
    const productIds=new Map(snapshot.products.map(p=>[String(p.id),String(p.nombre).toLowerCase()]));
    const nextData={}, nextMasters={}, masterById=new Map();
    licenseCatalog.entries={};licenseCatalog.removed=Object.entries(catalog).filter(([,v])=>v.hidden).map(([p])=>p);
    for(const [p,v] of entries){nextData[v.name]=[];nextMasters[v.name]=[];licenseCatalog.entries[v.name]={product:p};licenseColors[v.name]=v.color||PRODUCT_COLOR[PRODUCT_DISPLAY[p]]||'#4285f4';}
    for(const m of snapshot.accounts){
      const p=productIds.get(String(m.producto_id)), name=names.get(p);if(!name)continue;
      const meta=st.master_meta[String(m.id)]||{},start=meta.startDate||(m.fecha_alta?String(m.fecha_alta).slice(0,10):dateLocal(new Date()));
      const master={id:'master-'+m.id,_id:m.id,_product:p,_email:m.email||'',number:nextMasters[name].length+1,email:m.email||'',password:m.password||'',seed:m.totp_seed||'',note:m.notas||'',enabled:['activa','disponible'].includes(String(m.estado).toLowerCase()),startDate:start,endDate:meta.endDate||dateLocal(addDays(new Date(start+'T12:00:00'),30)),duration:meta.duration||'month1'};
      nextMasters[name].push(master);masterById.set(String(m.id),master);
    }
    const subs=new Map();
    for(const s of snapshot.subscriptions){
      const key=String(s.cliente_id)+':'+String(s.producto).toLowerCase();
      if(!subs.has(key)) subs.set(key,s);
    }
    for(const c of snapshot.clients) for(const [product,name] of names){
      const s=subs.get(String(c.id)+':'+product);if(!s)continue;
      const meta=st.client_meta[String(s.id)]||{},master=masterById.get(String(s.cuenta_asignada_id||s.cuenta_maestra_id));
      const end=meta.endDate||(s.fecha_vencimiento?String(s.fecha_vencimiento).slice(0,10)+'T23:59:59':null);
      const active=!['cancelada','vencida'].includes(s.estado)&&(!meta.startDate||new Date(meta.startDate)<=new Date())&&(!end||new Date(end)>new Date());

      // ✅ FIX: Detectar el dispositivo según el producto
      const productKey = String(product).toLowerCase();
      let deviceLabel = 'Pendiente';
      if (productKey === 'gemini') {
        deviceLabel = c.device_label_gemini || 'Pendiente';
      } else if (productKey === 'chatgpt') {
        deviceLabel = c.device_label_gpt || 'Pendiente';
      } else {
        // Para otros productos (capcut, claude, etc.) usar el genérico o el que esté disponible
        deviceLabel = c.device_label || c.device_label_gpt || c.device_label_gemini || 'Pendiente';
      }

      nextData[name].push({
        id:String(c.id),_clientId:c.id,_product:product,_subscriptionId:s.id,_masterId:master?._id||null,
        email:c.usuario||c.email||'',
        password: c.password_text || "",
        phone:c.telefono||'',
        device: deviceLabel,
        status:['suspendido','cancelado'].includes(c.estado)?'Suspendido':active?'Activo':'Inactivo',
        account:master?.number||0,total:s.dias_totales||30,left:end?Math.max(0,Math.ceil((Date.parse(end)-Date.now())/86400000)):0,
        creator:meta.creator||'admin',startDate:meta.startDate||null,endDate:end,isTrial:!!meta.isTrial,expiresAt:meta.isTrial?Date.parse(end):null,
        sessionClosed:c.estado==='suspendido',codexEnabled:!!c.codex_enabled
      });
    }
    datasets=nextData;masterAccounts=nextMasters;
    const owner=staffUsers.find(u=>u.id==='victor1234');
    if(sessionUserId==='victor1234'&&owner){const match=snapshot.staff.find(u=>u.rol==='admin'&&String(u.username).toLowerCase().replace(/\s/g,'')===owner.username.toLowerCase().replace(/\s/g,''));if(match){sessionUserId=String(match.id);sessionStorage.setItem(SESSION_USER_KEY,sessionUserId);}}
    staffUsers=snapshot.staff.map(u=>{const m=st.staff_meta[String(u.id)]||{};return {id:String(u.id),_id:u.id,username:u.username,displayName:u.nombre_completo,role:u.rol==='admin'?'admin':'seller',active:m.active!==false,licenses:(m.licenses||[]).map(p=>names.get(p)).filter(Boolean),lastAccess:m.lastAccess||null};});
    if(sessionUserId==='victor1234' && owner && !window.sbConfigured?.())staffUsers.unshift(owner);
    current=names.get(oldCurrent)||Object.keys(datasets)[0];masterLicense=names.get(oldMaster)||current;
    adminName=st.settings.adminName||adminName;
    const theme=st.settings['theme:'+sessionUserId];if(theme)window.novaSetTheme?.(theme);
    const jobs=st.jobs.map(j=>({...j,license:names.get(j.product)||j.product,destination:masterById.get(String(j.masterId))?.number||0,pendingIds:j.pendingIds.map(String)}));
    revision=Number(st.revision);lastSnapshot=snapshot;
    try{persist();persistMasters();persistStaff();localStorage.setItem(LICENSE_CATALOG_KEY,JSON.stringify(licenseCatalog));saveBulkJobs(jobs);}catch{}
    const rail=document.querySelector('#tabs');
    for(const tab of rail.querySelectorAll('[data-license]'))if(!(tab.dataset.license in datasets))tab.remove();
    for(const name of Object.keys(datasets))if(![...rail.querySelectorAll('[data-license]')].some(t=>t.dataset.license===name)){
      const t=document.createElement('button');t.className='tab';t.dataset.license=name;t.innerHTML=esc(name)+' <span class="tab-count">00</span>';bindLicenseTab(t);rail.append(t);
    }
    if(sessionUserId!=='victor1234'&&!currentStaff()){confirmLogout();toast('Tu acceso cambió. Vuelve a iniciar sesión.');return;}
    render();applyRole();
    if(activeView==='masters')renderMasters();if(activeView==='staff')renderStaff();if(activeView==='stats')renderStatistics();
    if(typeof renderBulkJobPanel==='function')renderBulkJobPanel();
  }
  function applyLegacy(snapshot) {
    const available=snapshot.products.map(disp);
    const names=[...Object.keys(datasets).filter(n=>available.includes(n)),...available.filter(n=>!(n in datasets))];
    datasets=Object.fromEntries(names.map(n=>[n,[]]));
    masterAccounts=Object.fromEntries(names.map(n=>[n,[]]));
    sbApplyLicenses(snapshot);sbApplyMasters(snapshot);sbApplyClients(snapshot.clients);
    const clientsById=new Map(snapshot.clients.map(c=>[String(c.id),c]));
    Object.entries(datasets).forEach(([name,clients])=>clients.forEach(u=>{
      const assignedEmail=clientsById.get(String(u._clientId))?.cuenta_maestra_email;
      const master=assignedEmail?(masterAccounts[name]||[]).find(m=>m.email===assignedEmail):null;
      u.id=String(u._clientId);u._masterId=master?._id||null;u.account=master?.number||0;
    }));
    try{persist();persistMasters();}catch{}
    render();if(isAdmin()&&activeView==='masters')renderMasters();if(isAdmin()&&activeView==='staff')renderStaff();if(activeView==='stats')renderStatistics();
  }
  async function refresh(force=false, probe=false) {
    if(!connected())return;
    if(connection!==sbConnectionKey()){connection=sbConnectionKey();mode="unknown";revision=null;}
    if(probe && mode==='legacy')mode='unknown';
    if(busy&&!force)return;
    if(!force&&openModal())return;
    if(!readPromise){
      updateSbBadge('loading');
      readPromise=(async()=>{
        if(mode==='legacy')return {legacy:true,data:await sbReadCurrent(sbDownloadSnapshot)};
        try{return await sbApi('panel_sync');}
        catch(error){
          if(!/^Acci[oó]n no implementada:\s*panel_sync\s*$/i.test(String(error.message).trim()))throw error;
          mode='legacy';revision=null;
          return {legacy:true,data:await sbReadCurrent(sbDownloadSnapshot)};
        }
      })().then(async r=>{
        if(r.legacy)return r;
        mode='full';
        if(!r.snapshot)throw new Error('Falta instalar la actualización del servidor incluida en el ZIP.');
        if(Number(r.snapshot.state?.revision)===0 && (localCatalogImport.length||localCatalogRemoved.length)){
          const entries=localCatalogImport;
          try{await sbApi('panel_action','POST',{operation_id:crypto.randomUUID(),expected_revision:0,command:'catalog.import',payload:{entries,removed:localCatalogRemoved}});return (await sbApi('panel_sync')).snapshot;}
          catch(e){if(e.status===409)return (await sbApi('panel_sync')).snapshot;throw e;}
        }
        return r.snapshot;
      }).finally(()=>{readPromise=null;});
    }
    try{const snapshot=await readPromise;if(force||!openModal()){if(snapshot.legacy)applyLegacy(snapshot.data);else apply(snapshot);}lastRead=Date.now();updateSbBadge('ok');return snapshot;}
    catch(e){updateSbBadge('error');throw e;}
  }
  async function signature(command,payload){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([command,payload.relativePeriod?Object.fromEntries(Object.entries(payload).filter(([k])=>!['startDate','endDate'].includes(k))):payload])));return [...new Uint8Array(bytes)].map(n=>n.toString(16).padStart(2,'0')).join('');}

  async function run(command,payload,{close=[],success='Cambios guardados',after}={}) {
    if(busy){toast('Espera a que termine el guardado.');return false;}
    if(!connected())return false;
    busy=true;let committed=false,result;
    const feedback=window.PanelModalFeedback?.begin(command,close);
    updateSbBadge('loading');
    try {
      if(mode==='unknown'||(mode==='full'&&revision===null))await refresh(true);
      if(mode==='legacy')return await panelLegacyRun(command,payload,{close,success,after});
      const hash=await signature(command,payload);
      let pending;try{pending=JSON.parse(sessionStorage.getItem(scopeKey())||'null');}catch{}
      if(pending&&pending.hash!==hash){
        let alreadyCommitted = false;
        try {
          const status=await sbApi('panel_operation','GET',null,{id:pending.id});
          if(status.result){ alreadyCommitted = true; }
        } catch(_) { alreadyCommitted = false; }
        sessionStorage.removeItem(scopeKey());
        await refresh(true).catch(()=>{});
        if(alreadyCommitted){
          throw new Error('El guardado anterior se confirmó. Revisa los datos antes de continuar.');
        }
      }
      const op=pending||{id:crypto.randomUUID(),hash,revision};
      sessionStorage.setItem(scopeKey(),JSON.stringify(op));
      const request={operation_id:op.id,expected_revision:op.revision,command,payload};

      let lastNetError;
      for(let attempt=0;attempt<2;attempt++){
        try{result=await sbApi('panel_action','POST',request);break;}
        catch(error){
          lastNetError=error;
          if(error.status && error.status<500 && error.status!==408){sessionStorage.removeItem(scopeKey());throw error;}

          try {
            const status=await sbApi('panel_operation','GET',null,{id:op.id});
            if(status.result){
              result = status.result;
              console.log('[panelSync] Write confirmado tras timeout, evitando duplicado.');
              break;
            }
          } catch(_) {}

          if(attempt===1){
            const detail=error?.message?` (${error.message})`:'';
            const e=new Error('No se pudo confirmar el guardado. Reintenta la misma acción; no se duplicará.'+detail);
            e.status=error?.status;throw e;
          }
          await new Promise(r=>setTimeout(r,1500));
        }
      }
      committed=true;revision=Math.max(revision,Number(result.revision));sessionStorage.removeItem(scopeKey());
      close.forEach(closeDialog);
      if(after)after(result);

      toast(success);
      window.dispatchEvent(new CustomEvent('panel-synced',{detail:{command,result}}));
      feedback?.finish();

      setTimeout(() => {
        if (busy) return;
        refresh(true).catch((error) => {
          console.warn('[panelSync] Background refresh failed:', error);
          updateSbBadge('error');
        });
      }, 3000);

      return true;
    }catch(error){
      updateSbBadge(error.unsupported?'ok':'error');
      if(error.status===409)await refresh(true).catch(()=>{});
      const message = command==='master.delete' && /Acción desconocida|Acción no implementada/i.test(error.message || '')
        ? 'Falta activar la eliminación de cuentas en el servidor. Consulta ELIMINAR_CUENTAS.txt incluido en el ZIP.' : error.message;
      console.error('[Panel]', command, '→', message, error);
      toast(committed?'Guardado en la base de datos. No se pudo actualizar la pantalla; pulsa Actualizar.':message,'error');
      clearTimeout(window.toastTimer);
      window.toastTimer=setTimeout(()=>document.querySelector('#toast')?.classList.remove('show'),6000);
      return false;
    }finally{
      busy=false;
      feedback?.finish();
    }
  }

  function background(){if(connected()&&!busy&&!document.hidden&&!document.querySelector('#app').hidden&&Date.now()-lastRead>1000)refresh().catch(()=>{});}
  window.addEventListener('online',background);window.addEventListener('focus',background);
  document.addEventListener('visibilitychange',background);
  setInterval(background,15000);

  function clearPending(){
    try{sessionStorage.removeItem(scopeKey());}catch{}
    const btn=document.getElementById('clearPendingBtn');if(btn)btn.style.display='none';
    toast('Bloqueo eliminado. Puedes reintentar.');
    refresh(true).catch(()=>{});
  }
  window.clearPanelPendingOp=clearPending;

  return {connected,refresh,run,apply,remember,client,targets,notifyError,background,clearPending,get mode(){return mode;},get busy(){return busy;},get revision(){return revision;}};
})();

const legacyLoadAll=sbLoadAll, legacyLoadClients=sbLoadClients, legacyLoadMasters=sbLoadMasters;
sbLoadAll=()=>panelSync.connected()?panelSync.refresh(true):legacyLoadAll();
sbLoadClients=()=>panelSync.connected()?panelSync.refresh(true):legacyLoadClients();
sbLoadMasters=()=>panelSync.connected()?panelSync.refresh(true):legacyLoadMasters();
window.sbLoadAll=sbLoadAll;window.sbLoadClients=sbLoadClients;window.sbLoadMasters=sbLoadMasters;

async function panelRemote(action, data={}) {
  try {
    const run=(command,payload,options)=>panelSync.run(command,payload,options);
    const ref=(slot,u)=>panelSync.client(slot,u);
    if(action==='create') {
      const {u,copy}=data,license=current,product=licenseProductKey(license);
      const password=u.password||crypto.randomUUID().slice(0,12);
      const ok=await run('client.create',{username:u.email,password,phone:u.phone,product,masterId:u._masterId,startDate:u.startDate,endDate:u.endDate,total:u.total,isTrial:u.isTrial,relativePeriod:u.isTrial||durationChoice!=='custom',creator:profileName(currentStaff())},{close:['#createBackdrop'],success:'Cliente creado en Cuenta '+u.account,after:result=>{rememberClientPassword(result.clientId,password);filterMode='all';document.querySelector('#search').value='';}});
      if(ok&&copy)await copyText(invitationText(u,license));
      return ok;
    }
    if(action==='edit') {
      const {field,value}=data,u=panelSync.targets.get('edit')||data.u,payload=ref('edit',u);
      if(field==='duration'){
        const n=Number(value);if(!Number.isFinite(n)||n<0)throw new Error('Duración inválida');
        payload.endDate=new Date(Date.now()+n*(u.isTrial?60000:86400000)).toISOString();payload.total=Math.max(u.total||0,n);payload.isTrial=!!u.isTrial;payload.relativePeriod=true;
      }else payload[field==='email'?'username':'phone']=value;
      return run('client.edit',payload,{close:['#editBackdrop']});
    }
    if(action==='clientEditor'){
      const {email,phone,days,range,codexEnabled}=data,u=panelSync.targets.get('clientEditor')||data.u,payload={...ref('clientEditor',u),username:email,phone,codexEnabled};
      if(range)Object.assign(payload,{startDate:range.start.toISOString(),endDate:range.end.toISOString(),total:range.total,isTrial:false});
      else {
        const previous=u.isTrial?Math.ceil((getTimeLeft(u)||0)/60000):getDaysLeft(u);
        if(days!==previous)Object.assign(payload,{endDate:new Date(Date.now()+days*(u.isTrial?60000:86400000)).toISOString(),total:Math.max(Number(u.total)||0,days),isTrial:!!u.isTrial,relativePeriod:true});
      }
      return run('client.edit',payload,{close:['#clientEditBackdrop']});
    }
    if(action==='renew')return run('client.renew',{...ref('renew',data.u),startDate:data.start.toISOString(),endDate:data.end.toISOString(),total:data.total,isTrial:false,relativePeriod:renewChoice!=='custom'},{close:['#renewBackdrop'],success:'Renovación guardada'});
    if(action==='suspend')return run('client.status',{...ref('suspend',data.u),active:(panelSync.targets.get('suspend')||data.u).status==='Suspendido'},{close:['#suspendBackdrop']});
    if(action==='delete')return run('client.delete',ref('delete',datasets[current]?.[deleteIndex]),{close:['#deleteBackdrop'],success:'Cliente retirado de esta licencia'});
    if(action==='migrate'){
      const master=masterItems(current).find(m=>m.number===migrateSelection);if(!master?._id)throw new Error('Elige una cuenta guardada en la base');
      return run('client.assign',{...ref('migrate',data.u),masterId:master._id},{close:['#migrateBackdrop'],success:'Cuenta actualizada'});
    }
    if(action==='masterSave')return run('master.save',{product:licenseProductKey(masterLicense),masterId:data.old?._id||null,email:data.email,password:data.password,seed:data.seed,note:data.note,startDate:data.start,endDate:data.end,duration:masterDuration},{close:['#masterEditBackdrop'],success:'Cuenta guardada'});
    if(action==='masterToggle'){
      const active=data.input.checked;data.input.checked=data.master.enabled;
      return run('master.status',{masterId:data.master._id,active});
    }
    if(action==='masterDelete')
      return run('master.delete',
        {product:licenseProductKey(masterLicense),masterId:data.master._id},
        {close:['#deleteMasterBackdrop'],success:'Cuenta eliminada'}
      );
    if(action==='licenseSave')return run('license.save',{product:editingLicense?licenseProductKey(editingLicense):data.name.toLowerCase(),name:data.name,color:data.color},{close:['#licenseBackdrop'],success:'Licencia guardada'});
    if(action==='licenseDelete')return run('license.delete',{product:licenseProductKey(editingLicense)},{close:['#deleteLicenseBackdrop','#licenseBackdrop'],success:'Licencia retirada del panel'});
    if(action==='order'){
      const names=Object.keys(datasets).filter(n=>n!==data.name);names.splice(data.position,0,data.name);
      return run('license.order',{products:names.map(licenseProductKey)},{success:'Orden guardado'});
    }
    if(action==='staffSave'){
      const {old,username,password,role,licenses,copy}=data;
      return run('staff.save',{staffId:old?._id||null,username,password,role,licenses:licenses.map(licenseProductKey)},{close:['#staffCreateBackdrop'],success:'Usuario guardado',after:result=>{if(old?.id===sessionUserId){sessionUserId=String(result.staffId);sessionStorage.setItem(SESSION_USER_KEY,sessionUserId);}if(copy)copyText(staffCopyText({username,password,role,licenses},true));}});
    }
    if(action==='staffAction'){
      const u=staffUsers.find(x=>x.id===staffPending?.id);if(!u?._id)throw new Error('Este usuario no está guardado en la base de datos');
      return run(staffPending.action==='delete'?'staff.delete':'staff.status',{staffId:u._id,active:!u.active,actorId:sessionUserId},{close:['#staffConfirmBackdrop']});
    }
    if(action==='profile')return run('profile.save',{staffId:data.person._id||null,username:data.username,password:data.password,displayName:data.name,role:data.person.role,licenses:data.person.licenses.map(licenseProductKey)},{success:'Perfil guardado',after:result=>{sessionUserId=String(result.staffId);sessionStorage.setItem(SESSION_USER_KEY,sessionUserId);document.querySelector('#myProfilePassword').value='';myProfileOwnerId=sessionUserId;profileMessage('Cambios guardados',true);}});
    if(action==='settings')return run('settings.save',{adminName:document.querySelector('#adminNameInput').value.trim()||'Víctor'},{close:['#settingsBackdrop']});
    if(action==='bulkStart'){
      const job=data.job,master=masterItems(job.license).find(m=>m.number===job.destination);
      if(!master?._id)throw new Error('La cuenta de destino no está guardada');
      const ok=await run('bulk.create',{id:job.id,product:licenseProductKey(job.license),masterId:master._id,mode:job.mode,ownerId:sessionUserId,clientIds:job.pendingIds},{success:'Cola guardada'});
      if(ok)return panelRemote('bulkRun',{id:job.id,showStage:true});return false;
    }
    if(action==='bulkRun')return run('bulk.run',{id:data.id},{close:data.showStage?['#bulkMigrateBackdrop']:[],success:'Tanda sincronizada'});
    if(action==='bulkControl')return run('bulk.'+data.action,{id:data.id},{success:'Cola actualizada'});
  }catch(e){panelSync.notifyError(e);return false;}
}
