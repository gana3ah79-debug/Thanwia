(function(){'use strict';
function activeScreen(){return document.querySelector('.screen.active');}
function authVisible(){var g=document.getElementById('authGate');if(g){var st=getComputedStyle(g);if(st.display!=='none'&&st.visibility!=='hidden'&&g.getAttribute('aria-hidden')!=='true')return true;}return false;}
function addExit(){var old=document.getElementById('rihlaExitFinal2027');if(authVisible()){if(old)old.remove();return;}var s=activeScreen()||document.getElementById('home');if(!s)return;var host=s.querySelector('.content')||s;if(!host)return;var ex=old;if(!ex){ex=document.createElement('button');ex.type='button';ex.id='rihlaExitFinal2027';ex.className='rihla-exit-final-2027';ex.setAttribute('aria-label','تسجيل الخروج من الحساب');ex.textContent='تسجيل الخروج 🚪';ex.onclick=function(){if(typeof window.rihlaLogout==='function'){if(confirm('هل تريد تسجيل الخروج من حسابك؟'))window.rihlaLogout();}else alert('جاري تجهيز تسجيل الخروج، حاول مرة أخرى.');};}if(ex.parentNode!==host)host.appendChild(ex);document.querySelectorAll('.rihla-exit-final-2027').forEach(function(x){if(x!==ex)x.remove();});}
var queued=false;function run(){if(queued)return;queued=true;setTimeout(function(){queued=false;addExit();},100)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
if(typeof window.show==='function'&&!window.__final2027ShowWrapped){var oldShow=window.show;window.__final2027ShowWrapped=true;window.show=function(id){var r=oldShow.apply(this,arguments);run();return r;};}
if(document.body)new MutationObserver(run).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class','aria-hidden']});
window.__rihlaFinalExit2027=run;
})();
