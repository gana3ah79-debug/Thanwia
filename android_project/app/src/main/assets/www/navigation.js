(function(){
'use strict';

var HOME_IDS=['home','welcome','login','auth'];
var lastScreen=null;
var suppress=false;
var initialized=false;

function activeScreen(){ return document.querySelector('.screen.active'); }
function activeId(){ var el=activeScreen(); return el ? (el.id||'home') : null; }
function isHome(id){ return !id || HOME_IDS.indexOf(id)>=0; }

function goBack(){
  if(history.length>1 && history.state && history.state.__rihlaScreen){ history.back(); return true; }
  var id=activeId();
  if(id && !isHome(id)){
    var home=document.getElementById('home');
    if(home){
      if(typeof window.show==='function') window.show('home');
      else { document.querySelectorAll('.screen').forEach(function(x){x.classList.remove('active')}); home.classList.add('active'); }
    }
    return true;
  }
  return false;
}
window.__rihlaHandleBack=goBack;
window.__rihlaExit=function(){
  try{ if(window.AndroidApp && AndroidApp.exitApp){ AndroidApp.exitApp(); return; } }catch(e){}
  try{ window.close(); }catch(e){}
};

function controls(){
  var old=document.getElementById('rihlaNavControls');
  if(old) old.remove();

  // No top X and no duplicate red exit buttons.
  // Keep exactly one exit button at the very bottom of the home screen.
  var id=activeId();
  if(!id || !isHome(id)) return;

  var box=document.createElement('div');
  box.id='rihlaNavControls';
  var exit=document.createElement('button');
  exit.type='button';
  exit.className='rihla-exit-single';
  exit.textContent='خروج';
  exit.setAttribute('aria-label','خروج من التطبيق');
  exit.onclick=function(){ if(confirm('هل تريد الخروج من التطبيق؟')) window.__rihlaExit(); };
  box.appendChild(exit);
  var home=document.getElementById('home');
  if(home){
    home.appendChild(box);
  }else{
    document.body.appendChild(box);
  }
}

function watch(){
  var id=activeId();
  if(!id || id===lastScreen){ controls(); return; }
  if(initialized && !suppress){ history.pushState({__rihlaScreen:id},'', '#'+id); }
  lastScreen=id;
  controls();
}

function wrapShow(){
  if(typeof window.show!=='function' || window.show.__rihlaWrapped) return;
  var original=window.show;
  function wrapped(id){
    suppress=false;
    var result=original.apply(this,arguments);
    setTimeout(watch,0);
    return result;
  }
  wrapped.__rihlaWrapped=true;
  window.show=wrapped;
  lastScreen=activeId();
  if(lastScreen) history.replaceState({__rihlaScreen:lastScreen},'', '#'+lastScreen);
  initialized=true;
  controls();
}

window.addEventListener('popstate',function(e){
  var id=e.state && e.state.__rihlaScreen;
  if(id){
    suppress=true;
    try{
      if(typeof window.show==='function') window.show(id);
      else { document.querySelectorAll('.screen').forEach(function(x){x.classList.remove('active')}); var el=document.getElementById(id); if(el) el.classList.add('active'); }
    }catch(err){}
    lastScreen=id;
    controls();
    suppress=false;
  }
});

function boot(){
  var style=document.createElement('style');
  style.textContent='#rihlaNavControls{width:100%;box-sizing:border-box;display:flex;justify-content:center;padding:18px 16px 28px;margin:0;position:static;z-index:20}#rihlaNavControls .rihla-exit-single{width:min(360px,100%);height:48px;border:0;border-radius:16px;background:#ef5261;color:#fff;font-family:Tahoma,Arial,sans-serif;font-size:15px;font-weight:800;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.14)}.screen.active{overflow-x:hidden}';
  document.head.appendChild(style);
  var tries=0, timer=setInterval(function(){ wrapShow(); watch(); if(++tries>40) clearInterval(timer); },250);
  new MutationObserver(function(){ setTimeout(watch,0); }).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
