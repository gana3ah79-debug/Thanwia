(function(){
  'use strict';
  // Keep the authentication screen clean: no theme/layout controls or settings cards.
  function cleanAuthUI(){
    const auth=document.getElementById('authGate');
    if(!auth) return;
    const selectors=[
      '#rihla-theme-entry',
      '#rihla-layout-picker',
      '#themePanel',
      '#loginColors',
      '#rihla-theme-picker',
      '.theme-card',
      '.rihla-layout-bar'
    ];
    selectors.forEach(sel=>auth.querySelectorAll(sel).forEach(el=>el.remove()));
    auth.querySelectorAll('[data-theme]').forEach(el=>{
      if(el.closest('#authGate')) el.remove();
    });
    auth.querySelectorAll('button,a').forEach(el=>{
      const t=(el.textContent||'').trim();
      if(/لون التطبيق|ألوان التطبيق|اختار اللون|ترتيب الواجهة|مريح|مضغوط|أزرق|أخضر|بنفسجي|برتقالي|سماوي|وردي/.test(t)){
        const parent=el.closest('.theme-card,.rihla-layout-bar,#loginColors,#themePanel')||el;
        if(parent.closest('#authGate')) parent.remove();
      }
    });
  }
  const style=document.createElement('style');
  style.id='registration-cleanup-style';
  style.textContent='#authGate #rihla-theme-entry,#authGate #rihla-layout-picker,#authGate #themePanel,#authGate #loginColors,#authGate #rihla-theme-picker,#authGate .theme-card,#authGate .rihla-layout-bar{display:none!important}';
  (document.head||document.documentElement).appendChild(style);
  cleanAuthUI();
  document.addEventListener('DOMContentLoaded',cleanAuthUI);
  const mo=new MutationObserver(cleanAuthUI);
  mo.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(cleanAuthUI,50);
  setTimeout(cleanAuthUI,500);
  setTimeout(cleanAuthUI,1500);
})();
