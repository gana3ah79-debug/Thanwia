(function(){
'use strict';

/* Final runtime guard: prevent the authenticated home screen from ever becoming blank. */
var timer=null;
var wrapped=false;

function visible(el){
  if(!el)return false;
  var cs=getComputedStyle(el);
  return cs.display!=='none' && cs.visibility!=='hidden' && cs.opacity!=='0';
}

function forceHomeDisplay(){
  var home=document.getElementById('home');
  if(!home)return false;
  if(home.classList.contains('active')){
    home.style.setProperty('display','block','important');
    home.style.setProperty('visibility','visible','important');
    home.style.setProperty('opacity','1','important');
    home.style.setProperty('min-height','calc(100vh - 72px)','important');
    var content=home.querySelector('.content');
    if(content){
      content.style.setProperty('display','block','important');
      content.style.setProperty('visibility','visible','important');
      content.style.setProperty('opacity','1','important');
    }
    return true;
  }
  return false;
}

function recover(){
  try{
    var gate=document.getElementById('authGate');
    var nav=document.getElementById('nav');
    var active=document.querySelector('.screen.active');
    if(gate && getComputedStyle(gate).display==='none'){
      if(!active){
        var home=document.getElementById('home');
        if(home){
          document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active')});
          home.classList.add('active');
          if(nav)nav.style.display='flex';
        }
      }
    }
    if(active && active.id==='home'){
      forceHomeDisplay();
      try{if(typeof window.renderHome==='function')window.renderHome()}catch(e){
        /* Keep the static home HTML visible even if an optional renderer fails. */
      }
    }
  }catch(e){}
}

function wrapRenderHome(){
  if(wrapped || typeof window.renderHome!=='function')return;
  var original=window.renderHome;
  function safeRenderHome(){
    try{return original.apply(this,arguments)}catch(e){
      forceHomeDisplay();
      setTimeout(forceHomeDisplay,0);
      return false;
    }
  }
  safeRenderHome.__rihlaRuntimeGuard=true;
  window.renderHome=safeRenderHome;
  wrapped=true;
}

function boot(){
  if(document.getElementById('rihlaHomeRuntimeGuardStyle'))return;
  var style=document.createElement('style');
  style.id='rihlaHomeRuntimeGuardStyle';
  style.textContent='.screen.active{display:block!important;visibility:visible!important;opacity:1!important}.screen.active .content{visibility:visible!important;opacity:1!important}#home.active{min-height:calc(100vh - 72px)!important}';
  document.head.appendChild(style);
  wrapRenderHome();
  recover();
  setTimeout(function(){wrapRenderHome();recover()},250);
  setTimeout(function(){wrapRenderHome();recover()},800);
  setTimeout(function(){wrapRenderHome();recover()},1500);
  timer=setInterval(function(){wrapRenderHome();recover()},2500);
  window.addEventListener('error',function(){setTimeout(recover,0)},false);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
