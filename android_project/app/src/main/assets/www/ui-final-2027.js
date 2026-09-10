(function(){'use strict';
function textOf(e){return ((e&&e.textContent)||'').replace(/\s+/g,' ').trim();}
function isStartHelp(e){if(!e||!e.matches)return false;var t=textOf(e);return /مش\s*قادر/.test(t)&&/ابدأ/.test(t);}
function removeOldExit(){
 document.querySelectorAll('#rihlaExitApp,#rihlaExitV3,.rihla-exit-button,.rihla-exit-overlay,[data-exit-app="true"]').forEach(function(e){e.remove();});
 document.querySelectorAll('button,a,[role="button"]').forEach(function(e){var t=textOf(e);if(/^خروج(?:\s|$)/.test(t)||t.indexOf('خروج 🚪')===0||(/خروج/.test(t)&&t.length<35)){if(!isStartHelp(e)&&e.id!=='rihlaExitFinal2027')e.remove();}});
}
function addExit(){
 removeOldExit();
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
var obs=new MutationObserver(run);obs.observe(document.body,{childList:true,subtree:true});
window.__rihlaFinalExit2027=run;
})();
