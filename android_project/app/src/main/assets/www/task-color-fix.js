(function(){'use strict';
// Compatibility for Android WebView/file:// where crypto.randomUUID may be unavailable.
try{if(window.crypto&&!window.crypto.randomUUID)window.crypto.randomUUID=function(){return'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var r=Math.random()*16|0,v=c==='x'?r:(r&3|8);return v.toString(16)})}}catch(e){}
const themes={blue:'#246bff',green:'#19a974',purple:'#7b4dff',orange:'#e78a00',cyan:'#008fb8',rose:'#d34b76'};
function apply(n){n=n||'blue';const c=themes[n]||themes.blue;document.body.dataset.rihlaTheme=n;document.documentElement.style.setProperty('--ui-main',c);document.documentElement.style.setProperty('--blue',c);localStorage.setItem('rihlaThemeV1',n);document.querySelectorAll('[data-theme]').forEach(b=>b.classList.toggle('active',b.dataset.theme===n));}
function init(){
 const saved=localStorage.getItem('rihlaThemeV1')||'blue';apply(saved);
 document.querySelectorAll('[data-theme]').forEach(b=>{if(b.dataset.rihlaBound)return;b.dataset.rihlaBound='1';b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();apply(this.dataset.theme)},true)});
 const add=document.getElementById('ftAdd');if(add)add.style.pointerEvents='auto';
 document.querySelectorAll('#finalTasksBox [data-act="toggle"]').forEach(b=>{b.style.pointerEvents='auto';b.style.zIndex='10'});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,400));else setTimeout(init,400);
new MutationObserver(()=>setTimeout(init,0)).observe(document.documentElement,{childList:true,subtree:true});
setInterval(init,1000);
})();
