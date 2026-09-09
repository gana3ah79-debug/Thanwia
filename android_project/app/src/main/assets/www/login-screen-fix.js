(function(){'use strict';
const ADMIN_EMAIL='hamadanagy1979@gmail.com';
function findLogin(){
  const nodes=[...document.querySelectorAll('.modal,.sheet,[role="dialog"],div')];
  return nodes.find(el=>{const t=(el.innerText||'').trim();return t.includes('تسجيل الدخول')&&t.includes('كلمة المرور')&&t.includes('البريد الإلكتروني')});
}
function isLogin(){return !!findLogin();}
function hideSide(){
  if(!isLogin()) return;
  document.querySelectorAll('button,a,div').forEach(el=>{
    const t=(el.textContent||'').trim();
    if(/^لوحة الإدارة(?:\s*⚙️)?$/.test(t)||/^🧠 ذكي$/.test(t)||/^🌿 مريح$/.test(t)||/^⚡ مضغوط$/.test(t)){
      el.style.setProperty('display','none','important');
      let p=el.parentElement;
      for(let i=0;i<2&&p;i++,p=p.parentElement){
        const cs=getComputedStyle(p);
        const r=p.getBoundingClientRect();
        if((cs.position==='fixed'||cs.position==='absolute') && r.width<300 && r.height<180) p.style.setProperty('display','none','important');
      }
    }
  });
}
function center(){
  const m=findLogin(); if(!m)return;
  document.body.classList.add('rihla-login-mode');
  let st=document.getElementById('rihlaLoginFullFix');
  if(!st){
    st=document.createElement('style');st.id='rihlaLoginFullFix';
    st.textContent=`
      body.rihla-login-mode .modal{position:fixed!important;inset:0!important;display:flex!important;align-items:center!important;justify-content:center!important;padding:14px!important;background:rgba(3,16,35,.70)!important;z-index:10000!important;overflow:auto!important}
      body.rihla-login-mode .modal .sheet{width:min(460px,calc(100vw - 28px))!important;max-width:460px!important;max-height:calc(100vh - 28px)!important;min-height:0!important;margin:0 auto!important;border-radius:30px!important;padding:22px 18px!important;overflow-y:auto!important;position:relative!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;transform:none!important;box-shadow:0 20px 60px rgba(0,0,0,.28)!important}
      body.rihla-login-mode .modal .sheet>*{max-width:100%!important}
      body.rihla-login-mode #adminEntry,body.rihla-login-mode .density-controls,body.rihla-login-mode [class*="density"]{display:none!important}
      body.rihla-login-mode #loginColors{display:block!important;margin-top:14px!important}
    `;
    document.head.appendChild(st);
  }
  const sheet=m.querySelector('.sheet')||m;
  sheet.style.setProperty('margin','0 auto','important');
  sheet.style.setProperty('width','min(460px,calc(100vw - 28px))','important');
  sheet.style.setProperty('left','auto','important');sheet.style.setProperty('right','auto','important');
  sheet.style.setProperty('transform','none','important');
}
function admin(){
  let email='';
  try{
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i)||''; if(!/auth-token$/i.test(k))continue;
      const o=JSON.parse(localStorage.getItem(k)||'{}'); const tok=o.access_token||''; const p=tok.split('.')[1];
      if(p){const s=p.replace(/-/g,'+').replace(/_/g,'/');email=(JSON.parse(atob(s.padEnd(s.length+(4-s.length%4))%4))||{}).email||'';}
    }
  }catch(e){}
  const allowed=email.toLowerCase()===ADMIN_EMAIL;
  document.querySelectorAll('button,a,div').forEach(el=>{const t=(el.textContent||'').trim();if(t.includes('لوحة الإدارة')&&!allowed)el.style.setProperty('display','none','important')});
}
function tick(){if(isLogin())center();else document.body.classList.remove('rihla-login-mode');hideSide();admin();}
new MutationObserver(()=>setTimeout(tick,0)).observe(document.documentElement,{childList:true,subtree:true,attributes:true});
setInterval(tick,400);setTimeout(tick,50);
})();
