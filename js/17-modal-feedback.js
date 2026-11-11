// Visible modal outcomes and pending state, without replacing the action handlers.
window.PanelModalFeedback = (() => {
  let operation=null;
  const isVisible=modal=>modal&&!modal.hidden&&!modal.classList.contains('motion-closing');
  function current(preferred=[]) {
    return preferred.map(selector=>document.querySelector(selector)).find(isVisible)
      || (isVisible(document.activeElement?.closest('.modal-backdrop'))?document.activeElement.closest('.modal-backdrop'):null)
      || [...document.querySelectorAll('.modal-backdrop:not([hidden]):not(.motion-closing)')].at(-1);
  }
  function region(modal) {
    let label=modal.querySelector('[data-modal-feedback]');
    if(!label){
      label=document.createElement('p');label.className='modal-feedback';label.dataset.modalFeedback='';label.hidden=true;
      label.setAttribute('aria-live','polite');label.setAttribute('aria-atomic','true');
      const actions=modal.querySelector('.dialog-actions,.form-actions,.modal-actions');
      if(actions)actions.before(label);else (modal.querySelector('.dialog')||modal).append(label);
    }
    return label;
  }
  function show(modal,text,kind='info'){
    if(!isVisible(modal))return;
    const label=region(modal);label.textContent=String(text);label.dataset.kind=kind;label.hidden=false;
    label.setAttribute('role',kind==='error'?'alert':'status');
    label.setAttribute('aria-live',kind==='error'?'assertive':'polite');
    label.scrollIntoView({block:'nearest',behavior:'instant'});
  }
  function message(text,kind='info'){
    const modal=isVisible(operation?.modal)?operation.modal:current();
    if(modal)show(modal,text,kind);
  }
  function begin(command,preferred=[]){
    const modal=current(preferred);if(!modal)return {finish(){}};
    const label=command.endsWith('.delete')?'Eliminando…':command==='client.renew'?'Renovando…':command==='client.assign'?'Cambiando cuenta…':'Guardando…';
    const dialog=modal.querySelector('.dialog')||modal;
    const controls=[...modal.querySelectorAll('button[type="submit"],button.primary-btn,button.danger-btn,#staffCopyCreate,#createCopyBtn')]
      .filter(button=>!button.hasAttribute('data-close'));
    const saved=controls.map(button=>({button,disabled:button.disabled,html:button.innerHTML,busy:button.getAttribute('aria-busy')}));
    const previousBusy=dialog.getAttribute('aria-busy');
    for(const {button} of saved){button.disabled=true;button.setAttribute('aria-busy','true');button.dataset.modalPending='';button.textContent=label;}
    dialog.setAttribute('aria-busy','true');
    const token={modal};operation=token;show(modal,label,'pending');
    return {finish(){
      for(const {button,disabled,html,busy} of saved){button.disabled=disabled;button.innerHTML=html;delete button.dataset.modalPending;if(busy===null)button.removeAttribute('aria-busy');else button.setAttribute('aria-busy',busy);}
      if(previousBusy===null)dialog.removeAttribute('aria-busy');else dialog.setAttribute('aria-busy',previousBusy);
      const status=modal.querySelector('[data-modal-feedback]');if(status?.dataset.kind==='pending')status.hidden=true;
      if(operation===token)operation=null;
    }};
  }
  const observer=new MutationObserver(changes=>{
    for(const {target,oldValue} of changes)if(oldValue!==null&&!target.hidden){
      const label=target.querySelector('[data-modal-feedback]');if(label)label.hidden=true;
    }
  });
  document.querySelectorAll('.modal-backdrop').forEach(modal=>observer.observe(modal,{attributes:true,attributeFilter:['hidden'],attributeOldValue:true}));
  return {begin,message};
})();
