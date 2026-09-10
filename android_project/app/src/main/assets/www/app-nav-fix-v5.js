(function(){'use strict';
if(window.__rihlaNavFixV5)return;window.__rihlaNavFixV5=true;
function loggedIn(){return !!window.__rihlaAuthUser || (document.getElementById('authGate')&&getComputedStyle(document.getElementById('authGate')).display==='none');}
function forceNav(){try{const nav=document.getElementById('nav');if(!nav)return;if(loggedIn()){nav.style.display='flex';nav.style.visibility='visible';nav.style.opacity='1';nav.removeAttribute('hidden');}else{nav.style.display='none';}}catch(e){}}
function patchShow(){try{if(typeof window.show==='function'&&!window.__rihlaNavShowV5){const original=window.show;window.show=function(){const r=original.apply(this,arguments);setTimeout(forceNav,0);setTimeout(forceNav,80);return r};window.__rihlaNavShowV5=true;}}catch(e){}}
function boot(){patchShow();forceNav();[100,300,600,1000,1500,2500].forEach(function(ms){setTimeout(function(){patchShow();forceNav()},ms)});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.addEventListener('rihla-auth-ready',forceNav);window.addEventListener('storage',function(e){if(e.key&&(/auth|rihlaState/i.test(e.key)))setTimeout(forceNav,20)});
setInterval(forceNav,1200);
})();
