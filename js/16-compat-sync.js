// Compatibility with the original admin API. No retries of legacy writes:
// that server does not implement operation IDs or transactional commands.
// The original local owner (victor1234) is no longer a login path: every
// remote panel must authenticate against the server. Local demo access stays
// restricted to localhost in 01-panel.js.

async function panelLegacyRun(command, p, {close=[], success='Cambios guardados', after}={}) {
  const unsupported=()=>{const error=new Error('Esta acción necesita la actualización del servidor. Los pasos están en ACTIVAR_SINCRONIZACION.txt.');error.unsupported=true;throw error;};
  if(command==='preference.save'){
    window.novaSetTheme?.(p.theme);localStorage.setItem('nova-theme',p.theme);
    updateSbBadge('ok');toast('Tema guardado en este dispositivo');return true;
  }
  const supported=['client.create','client.edit','client.renew','client.status','client.assign','master.save','master.status'];
  if(!supported.includes(command) || p.isTrial)unsupported();
  // The original schema cannot enforce a scheduled start or minute-level trials.
  if(command.startsWith('client.')&&p.startDate&&p.relativePeriod!==true)unsupported();
  if(command==='master.save'){
    const old=Object.values(masterAccounts).flat().find(m=>String(m._id)===String(p.masterId));
    const start=old?.startDate||dateLocal(new Date()),end=old?.endDate||dateLocal(addDays(new Date(),30));
    if(p.duration!=='month1'||p.startDate!==start||p.endDate!==end)unsupported();
  }
  let committed=false, phase='write', result={}, assignmentError=false;
  const committedUI=()=>{if(committed)return;committed=true;close.forEach(closeDialog);if(after)after(result);};
  const body={cliente_id:p.clientId,producto:p.product};
  let check=()=>true;
  try{
    if(command==='client.create'){
      const r=await sbApi('crear_cliente','POST',{usuario:p.username,password:p.password,email:p.username,telefono:p.phone||null,nombre_completo:p.username,dias:p.total,productos:[p.product]});
      result.clientId=r.cliente_id;committedUI();
      // Original create assigns its own first account; apply the chosen real ID.
      phase='assign';
      try{
        if(!result.clientId)throw new Error('No se recibió el identificador del cliente');
        await sbApi('migrar_cuenta','POST',{cliente_id:result.clientId,nueva_cuenta_id:p.masterId,producto:p.product});
      }catch{assignmentError=true;}
      check=()=>Object.values(datasets).flat().some(u=>String(u._clientId)===String(result.clientId)&&u._product===p.product&&String(u._masterId)===String(p.masterId));
    }else if(command==='client.edit'||command==='client.renew'){
      if(p.username!==undefined){body.usuario=p.username;body.email=p.username;}
      if(p.phone!==undefined)body.telefono=p.phone;
      if(p.endDate){body.fecha_vencimiento=dateLocal(new Date(p.endDate));body.dias=Math.max(0,Math.ceil((Date.parse(p.endDate)-Date.now())/86400000));body.dias_totales=p.total;}
      await sbApi('editar_cliente','POST',body);committedUI();
      if(command==='client.renew')await sbApi('reactivar','POST',{cliente_id:p.clientId});
      check=()=>{
        const u=Object.values(datasets).flat().find(u=>String(u._clientId)===String(p.clientId)&&u._product===p.product);
        return !!u&&(p.username===undefined||u.email===p.username)&&(p.phone===undefined||u.phone===p.phone)&&(!body.fecha_vencimiento||String(u.endDate).slice(0,10)===body.fecha_vencimiento);
      };
    }else if(command==='client.status'){
      await sbApi(p.active?'reactivar':'suspender','POST',{cliente_id:p.clientId});committedUI();
      if(!p.active)await sbApi('revocar_acceso','POST',body);
      check=()=>Object.values(datasets).flat().some(u=>String(u._clientId)===String(p.clientId)&&(p.active?u.status!=='Suspendido':u.status==='Suspendido'));
    }else if(command==='client.assign'){
      await sbApi('migrar_cuenta','POST',{...body,nueva_cuenta_id:p.masterId});committedUI();
      check=()=>Object.values(datasets).flat().some(u=>String(u._clientId)===String(p.clientId)&&u._product===p.product&&String(u._masterId)===String(p.masterId));
    }else if(command==='master.save'){
      const r=await sbApi(p.masterId?'editar_cuenta':'crear_cuenta','POST',{cuenta_id:p.masterId,producto:p.product,email:p.email,password:p.password,totp_seed:p.seed||null,notas:p.note||null});
      result.masterId=p.masterId||r.cuenta_id||r.id;committedUI();
      check=()=>Object.values(masterAccounts).flat().some(m=>String(m._id)===String(result.masterId)&&m.email===p.email&&m.note===(p.note||''));
    }else if(command==='master.status'){
      await sbApi('cambiar_estado_cuenta','POST',{cuenta_id:p.masterId,nuevo_estado:p.active?'activa':'baneada'});committedUI();
      check=()=>Object.values(masterAccounts).flat().some(m=>String(m._id)===String(p.masterId)&&m.enabled===p.active);
    }
    phase='refresh';await panelSync.refresh(true);
    if(assignmentError||!check()){
      toast(command==='client.create'?'Cliente creado, pero no se pudo confirmar la cuenta elegida. Revisa su cuenta antes de usar el acceso.':'El servidor respondió, pero el cambio no quedó confirmado. Se muestran los datos descargados.','error');return false;
    }
    toast(success);window.dispatchEvent(new CustomEvent('panel-synced',{detail:{command,result}}));return true;
  }catch(error){
    updateSbBadge('error');
    if(committed){
      if(phase!=='refresh')await panelSync.refresh(true).catch(()=>{});
      toast(phase==='refresh'?'Guardado en la base de datos. No se pudo actualizar la pantalla; pulsa Actualizar.':'Se guardó parte de la acción. Actualiza y revisa el resultado antes de repetirla.','error');
    }else{
      // A lost create response is ambiguous. Never retry or invite immediate resubmission.
      if(['client.create','master.save'].includes(command)&&(!error.status||error.status>=500)){
        close.forEach(closeDialog);toast('No se pudo confirmar el guardado. Actualiza y comprueba si ya aparece antes de volver a crearlo.','error');
      }else toast(error.message||'No se pudo guardar.','error');
    }
    return false;
  }
}
