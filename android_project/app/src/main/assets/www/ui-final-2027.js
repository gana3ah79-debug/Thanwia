(function(){'use strict';
function activeScreen(){return document.querySelector('.screen.active');}
function authVisible(){
 var g=document.getElementById('authGate');
 if(g){var st=getComputedStyle(g);if(st.display!=='none'&&st.visibility!=='hidden'&&g.getAttribute('aria-hidden')!=='true')return true;}
 var s=activeScreen();
 if(!s)return false;
 var id=(s.id||'').toLowerCase();
 if(/auth|login|register|signup|signin|onboard|welcome|landing|start|guest/i.test(id))return true;
 var txt=(s.innerText||'').slice(0,2500).toLowerCase();
 return /تسجيل الدخول|إنشاء حساب|تسجيل حساب|نسيت كلمة السر|كلمة المرور|البريد الإلكتروني/.test(txt);
}
function removeLegacyExit(){
 var selectors=['[id*="rihlaExit"]','[id*="exitApp"]','[class*="rihla-exit"]','[class*="exit-button"]','[data-exit-app="true"]'];
 for(var i=0;i<selectors.length;i++)document.querySelectorAll(selectors[i]).forEach(function(e){if(e.id!=='rihlaExitFinal2027')e.remove();});
}
function addExit(){
 var old=document.getElementById('rihlaExitFinal2027');
 if(authVisible()){
  if(old)old.remove();
  removeLegacyExit();
  return;
 }
 var s=activeScreen()||document.getElementById('home');
 if(!s)return;
 var host=s.querySelector('.content')||s;
 if(!host)return;
 var ex=old;
 if(!ex){
  ex=document.createElement('button');ex.type='button';ex.id='rihlaExitFinal2027';ex.className='rihla-exit-final-2027';
  ex.setAttribute('aria-label','خروج من التطبيق');ex.textContent='خروج 🚪';
  ex.onclick=function(){try{if(window.Android&&Android.exitApp)Android.exitApp();}catch(e){}};
 }
 if(ex.parentNode!==host)host.appendChild(ex);
 var all=document.querySelectorAll('.rihla-exit-final-2027');
 for(var i=0;i<all.length;i++){if(all[i]!==ex)all[i].remove();}
 removeLegacyExit();
}
var queued=false;
function run(){if(queued)return;queued=true;setTimeout(function(){queued=false;addExit();},120);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
var oldShow=window.showScreen;
if(typeof oldShow==='function'&&!window.__final2027ShowWrapped){window.__final2027ShowWrapped=true;window.showScreen=function(id){var r=oldShow.apply(this,arguments);run();return r;};}
if(document.body)new MutationObserver(run).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class','aria-hidden']});
window.__rihlaFinalExit2027=run;
})();
