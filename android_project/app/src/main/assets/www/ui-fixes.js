(function(){'use strict';
function isLoginVisible(){
  const text=(document.body?.innerText||'');
  const modal=document.querySelector('.modal.show');
  return !!modal || /تسجيل الدخول/.test(text) && !document.querySelector('#home.screen.active');
}
function hideSideControls(){
  if(!isLoginVisible()) return;
  document.querySelectorAll('button,a,div').forEach(el=>{
    const t=(el.textContent||'').trim();
    if(!t || t.length>40) return;
    if(t.includes('لوحة الإدارة') || t.includes('ذكي') || t.includes('مريح') || t.includes('مضغوط')){
      const r=el.getBoundingClientRect();
      if(r.width>0 && r.height>0 && (getComputedStyle(el).position==='fixed' || r.left<180 || r.right<180)){
        el.style.setProperty('display','none','important');
      }
    }
  });
}
function centerLogin(){
  if(!isLoginVisible()) return;
  const s=document.createElement('style');
  s.id='loginCenterFix';
  s.textContent=`
    .modal{align-items:center!important;justify-content:center!important;padding:18px!important;}
    .modal .sheet{width:min(440px,calc(100vw - 36px))!important;max-height:92vh!important;overflow:auto!important;border-radius:28px!important;margin:auto!important;}
    .modal .sheet form,.modal .sheet .card{width:100%!important;}
    .modal .sheet input,.modal .sheet button{min-height:54px;}
    body:has(.modal.show) .nav,body:has(.modal.show) .nav *{display:none!important;}
  `;
  if(!document.getElementById('loginCenterFix')) document.head.appendChild(s);
}
function tick(){hideSideControls();centerLogin();}
new MutationObserver(tick).observe(document.documentElement,{childList:true,subtree:true,attributes:true});
setInterval(tick,500);tick();
})();
