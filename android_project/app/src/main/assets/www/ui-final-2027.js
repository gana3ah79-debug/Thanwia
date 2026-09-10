(function(){'use strict';
function textOf(e){return ((e&&e.textContent)||'').replace(/\s+/g,' ').trim();}
function authVisible(){
 var g=document.getElementById('authGate');
 if(!g)return false;
 var st=getComputedStyle(g);
 return st.display!=='none' && st.visibility!=='hidden' && g.getAttribute('aria-hidden')!=='true';
}
function isStartHelp(e){if(!e||!e.matches)return false;var t=textOf(e);return /مش\s*قادر/.test(t)&&/ابدأ/.test(t);}
function removeAllExit(){
 document.querySelectorAll('#rihlaExitApp,#rihlaExitV3,#rihlaExitFinal2027,.rihla-exit-button,.rihla-exit-overlay,[data-exit-app="true"],.rihla-exit-final-2027').forEach(function(e){e.remove();});
 document.querySelectorAll('button,a,[role="button"]').forEach(function(e){var t=textOf(e);if(/^خروج(?:\s|$)/.test(t)||t.indexOf('خروج 🚪')===0||(/خروج/.test(t)&&t.length<35)){if(!isStartHelp(e))e.remove();}});
}
function removeLoginExit(){
 document.querySelectorAll('#rihlaExitApp,#rihlaExitV3,#rihlaExitFinal2027,.rihla-exit-button,.rihla-exit-overlay,[data-exit-app="true"],.rihla-exit-final-2027').forEach(function(e){e.remove();});
 document.querySelectorAll('button,a,[role="button"]').forEach(function(e){var t=textOf(e);if(/^خروج(?:\s|$)/.test(t)||t.indexOf('خروج 🚪')===0||(/خروج/.test(t)&&t.length<35))e.remove();});
}
function addExit(){
 if(authVisible()){removeLoginExit();return;}
 removeAllExit();
 var target=null;
 document.querySelectorAll('button,a,[role="button"]').forEach(function(e){if(!target&&isStartHelp(e))target=e;});
 if(!target)return;
 var old=document.getElementById('rihlaExitFinal2027');
 if(old)old.remove();
 var ex=document.createElement('button');ex.type='button';ex.id='rihlaExitFinal2027';ex.className='rihla-exit-final-2027';ex.setAttribute('aria-label','خروج من التطبيق');ex.textContent='خروج 🚪';
 ex.onclick=function(){try{if(window.Android&&Android.exitApp)Android.exitApp();else window.close();}catch(err){}};
 target.parentNode.insertBefore(ex,target.nextSibling);
}
var queued=false;function run(){if(queued)return;queued=true;setTimeout(function(){queued=false;addExit();},60);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
var oldShow=window.showScreen;if(typeof oldShow==='function'&&!window.__final2027ShowWrapped){window.__final2027ShowWrapped=true;window.showScreen=function(id){var r=oldShow.apply(this,arguments);run();return r;};}
var obs=new MutationObserver(run);obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class','aria-hidden']});
window.__rihlaFinalExit2027=run;
})();
