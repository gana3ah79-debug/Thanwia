(function(){
'use strict';

// Final guard for the post-login state: never leave the user on a blank screen.
const URL='https://eclnddvupggxyythtpkv.supabase.co';
const KEY='sb_publishable_FqI5heK77syr-3QHh2LPHg_E82vbq-0';
let authListenerBound=false;
let fixing=false;

function client(){
  try{ if(window.supabaseClient?.auth?.getUser) return window.supabaseClient; }catch(e){}
  try{ return window.supabase?.createClient(URL,KEY)||null; }catch(e){ return null; }
}
function saveStateName(name){
  try{
    if(typeof state==='undefined') return;
    const n=String(name||'').trim();
    if(n) state.name=n;
    if(typeof save==='function') save();
  }catch(e){}
}
function hideAuth(){
  const g=document.getElementById('authGate');
  if(g){ g.style.setProperty('display','none','important'); g.setAttribute('aria-hidden','true'); }
}
function showOnly(id){
  const target=document.getElementById(id);
  if(!target)return false;
  document.querySelectorAll('.screen').forEach(s=>{
    const on=s===target;
    if(s.classList.contains('active')!==on)s.classList.toggle('active',on);
  });
  try{scrollTo(0,0)}catch(e){}
  return true;
}
function ensureHome(){
  if(fixing)return;
  fixing=true;
  try{
    hideAuth();
    const home=document.getElementById('home');
    if(!home)return;
    showOnly('home');
    // renderHome can fail because of an optional enhancement; the base home must remain visible.
    try{ if(typeof window.renderHome==='function') window.renderHome(); }catch(e){ console.warn('renderHome recovered:',e); }
    const nav=document.getElementById('nav');
    if(nav)nav.style.display='flex';
    document.querySelectorAll('#rihlaPageClose,#rihlaExitBtn').forEach(x=>x.remove());
  }finally{fixing=false;}
}
function setLoggedInUser(user){
  if(!user)return;
  try{
    const meta=user.user_metadata||{};
    let name=(typeof state!=='undefined'&&state.name)||meta.full_name||meta.name||'';
    if(!name){
      const input=document.getElementById('authName');
      name=input?.value?.trim()||'الطالب';
    }
    saveStateName(name);
    if(typeof authUser!=='undefined') authUser=user;
  }catch(e){}
  ensureHome();
}
async function sync(){
  const c=client();
  if(!c)return;
  try{
    const r=await c.auth.getUser();
    const user=r?.data?.user||null;
    if(user)setLoggedInUser(user);
  }catch(e){}
}
function bindAuth(){
  if(authListenerBound)return;
  const c=client();
  if(!c?.auth?.onAuthStateChange)return;
  authListenerBound=true;
  c.auth.onAuthStateChange((_event,session)=>{
    if(session?.user){
      // Defer UI work so Supabase's auth callback never gets blocked by rendering.
      setTimeout(()=>setLoggedInUser(session.user),0);
    }
  });
}
function patchSignIn(){
  if(typeof window.authSignIn!=='function' || window.authSignIn.__rihlaPostLogin)return;
  const original=window.authSignIn;
  async function wrapped(){
    try{
      const email=document.getElementById('authEmail')?.value?.trim()||'';
      const password=document.getElementById('authPassword')?.value||'';
      if(!email||!password){ if(typeof authMessage==='function')authMessage('اكتب البريد وكلمة المرور.'); return; }
      const c=client();
      if(!c){ if(typeof authMessage==='function')authMessage('تعذر الاتصال بخدمة تسجيل الدخول.'); return; }
      const {data,error}=await c.auth.signInWithPassword({email,password});
      if(error){ if(typeof authMessage==='function')authMessage(error.message); return; }
      if(typeof authMessage==='function')authMessage('تم تسجيل الدخول ✅');
      setLoggedInUser(data?.user||null);
    }catch(e){
      try{ if(typeof authMessage==='function')authMessage('حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.'); }catch(x){}
    }
  }
  wrapped.__rihlaPostLogin=true;
  window.authSignIn=wrapped;
}
function boot(){
  patchSignIn();
  bindAuth();
  sync();
  // Handles an already authenticated session and the first post-login paint.
  setTimeout(()=>{patchSignIn();bindAuth();sync()},300);
  setTimeout(()=>{patchSignIn();bindAuth()},1000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
