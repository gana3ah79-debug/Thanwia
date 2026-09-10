(function(){'use strict';
/* RIHLA UI CONTROLS V4 — stable navigation helpers only.
   Theme/color pickers and floating exit controls are intentionally removed. */
function css(){
  if(document.getElementById('uiControlsV4Css'))return;
  var s=document.createElement('style');s.id='uiControlsV4Css';s.textContent=`
    #rihlaThemeToggle,#rihla-theme-entry,#rihla-theme-picker,#rihla-theme-toast,
    .theme-options,.theme-title,.theme-sub,.color-picker,.color-options{display:none!important}
    .rihla-exit-button,.rihla-exit-overlay{display:none!important}
    #rihlaExitApp{position:static!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;transform:none!important;float:none!important;width:calc(100% - 32px)!important;min-height:50px!important;margin:26px 16px 34px!important;padding:12px 16px!important;display:flex!important;align-items:center!important;justify-content:center!important;border:1px solid #e5a0a6!important;border-radius:16px!important;background:linear-gradient(145deg,#ea7b83,#d45d68)!important;color:#fff!important;font-size:14px!important;font-weight:900!important;box-shadow:0 6px 15px rgba(213,92,103,.14)!important;z-index:1!important}
  `;document.head.appendChild(s)
}
function closeButton(){
  var x=document.getElementById('rihlaPageClose');
  if(!x){x=document.createElement('button');x.id='rihlaPageClose';x.textContent='×';x.title='إغلاق الصفحة';x.onclick=function(){if(window.rihlaBack)window.rihlaBack();else if(typeof show==='function')show('home')};document.body.appendChild(x)}
  else{x.onclick=function(){if(window.rihlaBack)window.rihlaBack()}}
}
function adminPlace(){
  var b=document.getElementById('rihlaAdminEntry');if(!b)return;
  b.style.display='block';
  var badge=document.getElementById('subBadge');
  if(badge&&badge.parentNode){if(b.previousElementSibling!==badge)badge.parentNode.insertBefore(b,badge);return}
  var home=document.getElementById('home'),c=home&&home.querySelector('.content');
  if(c&&b.parentNode!==c)c.insertBefore(b,c.firstChild)
}
function cleanLegacyUi(){
  try{
    ['rihlaThemeToggle','rihla-theme-entry','rihla-theme-picker','rihla-theme-toast','rihlaExitV3','rihlaExitOverlay'].forEach(function(id){var e=document.getElementById(id);if(e)e.remove()});
    document.querySelectorAll('.theme-options,.theme-title,.theme-sub,.color-picker,.color-options,.rihla-exit-button,.rihla-exit-overlay').forEach(function(e){e.remove()});
    document.querySelectorAll('.card,.box,.section,section,div').forEach(function(e){
      var t=(e.innerText||'').replace(/\s+/g,' ').trim();
      if(t==='لون التطبيق 🎨'||t==='لون التطبيق'||t.indexOf('لون التطبيق 🎨')===0||t==='ترتيب الواجهة'||t.indexOf('ترتيب الواجهة')===0){e.style.display='none'}
    });
  }catch(e){}
}
function boot(){css();closeButton();adminPlace();cleanLegacyUi()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
