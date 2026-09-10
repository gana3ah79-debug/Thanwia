(function(){'use strict';
/* RIHLA UI CONTROLS V4 — one light visual system, stable navigation helpers. */
function css(){
  if(document.getElementById('uiControlsV4Css'))return;
  var s=document.createElement('style');s.id='uiControlsV4Css';s.textContent=`
    :root{--r27-text:#304254;--r27-blue-bg:#edf4fa;--r27-line:#dce5ed}
    #rihlaThemeToggle,#rihla-theme-entry,#rihla-theme-picker,#rihla-theme-toast,.theme-options,.theme-title,.theme-sub,.color-picker,.color-options{display:none!important}
    .rihla-exit-button,.rihla-exit-overlay{display:none!important}
    .btn,.rihla-light .btn{min-height:50px!important;width:100%!important;border:1px solid #d5e1eb!important;border-radius:16px!important;background:linear-gradient(145deg,#fafdff,#eaf2f8)!important;color:var(--r27-text)!important;font-weight:800!important;box-shadow:0 5px 14px rgba(55,82,108,.08)!important;transition:transform .14s ease,box-shadow .14s ease!important}
    .btn.secondary,.rihla-light .btn.secondary{background:var(--r27-blue-bg)!important;color:#50789d!important;border-color:#d8e5ef!important;box-shadow:none!important}
    .btn.green,.rihla-light .btn.green{background:linear-gradient(145deg,#79cbb4,#5fb096)!important;color:#fff!important;border-color:#78c9b3!important}
    .btn.danger,.rihla-light .btn.danger{background:linear-gradient(145deg,#ea7b83,#d45d68)!important;color:#fff!important;border-color:#e47b83!important}
    .subject{border-radius:18px!important;border:1px solid var(--r27-line)!important;background:linear-gradient(145deg,#fff,#f2f6f9)!important;color:var(--r27-text)!important;box-shadow:0 5px 15px rgba(55,82,108,.07)!important;min-height:82px!important}.subject.selected{border-color:#8eb2ce!important;background:var(--r27-blue-bg)!important}.subject b{color:var(--r27-text)!important}
    .tab{border:1px solid #dbe5ed!important;background:#f0f4f7!important;color:#687889!important;box-shadow:none!important}.tab.active{background:#dfeaf3!important;color:#476d8e!important;border-color:#c8d9e7!important}.pill{background:#edf4f8!important;color:#5a7892!important;border:1px solid #d8e5ee!important}
    .nav{background:rgba(250,252,254,.98)!important;border-top:1px solid #dce5ed!important;box-shadow:0 -5px 18px rgba(55,82,108,.06)!important}.nav button{color:#7a8998!important}.nav button.active{color:#527a9d!important;background:#edf4f9!important;border-radius:13px!important}.nav .plus{background:linear-gradient(145deg,#789fc0,#5f86aa)!important;color:#fff!important;box-shadow:0 7px 16px rgba(72,105,137,.20)!important}
    .card,.auth-box,.auth-box-v2{color:var(--r27-text)!important}.auth-box,.auth-box-v2{background:linear-gradient(145deg,#ffffff,#f3f7fa)!important;border:1px solid #dce5ed!important}.auth-box h1,.auth-box h2,.auth-box h3,.auth-box p,.auth-box label,.auth-box span,.auth-box-v2 h1,.auth-box-v2 h2,.auth-box-v2 h3,.auth-box-v2 p,.auth-box-v2 label,.auth-box-v2 span{color:var(--r27-text)!important}.auth-input,.auth-box input,.auth-box-v2 input{background:#fff!important;color:var(--r27-text)!important;border:1px solid #cfdce6!important}.auth-primary{background:linear-gradient(145deg,#789fc0,#5f86aa)!important;color:#fff!important}.auth-link{color:#527a9d!important}
    #rihlaExitApp{position:static!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;transform:none!important;float:none!important;width:calc(100% - 32px)!important;min-height:50px!important;margin:28px 16px 34px!important;padding:12px 16px!important;display:flex!important;align-items:center!important;justify-content:center!important;border:1px solid #e5a0a6!important;border-radius:16px!important;background:linear-gradient(145deg,#ea7b83,#d45d68)!important;color:#fff!important;font-size:14px!important;font-weight:900!important;box-shadow:0 6px 15px rgba(213,92,103,.14)!important;z-index:1!important}
    .review-due{background:#fff7e9!important;border:1px solid #efd39a!important;color:#735b2f!important;border-radius:15px!important}.review-done{background:#eef9f4!important;border:1px solid #b9dfd0!important;color:#3d705f!important;border-radius:15px!important}
    #rihlaPageClose{z-index:10003!important}
  `;document.head.appendChild(s)
}
function closeButton(){var x=document.getElementById('rihlaPageClose');if(!x){x=document.createElement('button');x.id='rihlaPageClose';x.textContent='×';x.title='إغلاق الصفحة';x.onclick=function(){if(window.rihlaBack)window.rihlaBack();else if(typeof show==='function')show('home')};document.body.appendChild(x)}else{x.onclick=function(){if(window.rihlaBack)window.rihlaBack()}}}
function adminPlace(){var b=document.getElementById('rihlaAdminEntry');if(!b)return;b.style.display='block';var badge=document.getElementById('subBadge');if(badge&&badge.parentNode){if(b.previousElementSibling!==badge)badge.parentNode.insertBefore(b,badge);return}var home=document.getElementById('home'),c=home&&home.querySelector('.content');if(c&&b.parentNode!==c)c.insertBefore(b,c.firstChild)}
function cleanLegacyUi(){try{
  ['rihlaThemeToggle','rihla-theme-entry','rihla-theme-picker','rihla-theme-toast','rihlaExitV3','rihlaExitOverlay'].forEach(function(id){var e=document.getElementById(id);if(e)e.remove()});
  document.querySelectorAll('.theme-options,.theme-title,.theme-sub,.color-picker,.color-options,.rihla-exit-button,.rihla-exit-overlay').forEach(function(e){e.remove()});
  document.querySelectorAll('.card,.box,.section,section,div').forEach(function(e){var t=(e.innerText||'').replace(/\s+/g,' ').trim();if(t==='لون التطبيق 🎨'||t==='لون التطبيق'||t.indexOf('لون التطبيق 🎨')===0||t==='ترتيب الواجهة'||t.indexOf('ترتيب الواجهة')===0){e.style.display='none'}});
  var ex=document.getElementById('rihlaExitApp');if(ex){var home=document.getElementById('home'),c=home&&home.querySelector('.content');if(c&&ex.parentNode!==c)c.appendChild(ex)}
}catch(e){}}
function boot(){css();closeButton();adminPlace();cleanLegacyUi()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
var queued=false;new MutationObserver(function(){if(queued)return;queued=true;setTimeout(function(){queued=false;cleanLegacyUi()},120)}).observe(document.body,{childList:true,subtree:true});
})();
