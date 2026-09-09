(function(){'use strict';
function clean(){
  document.querySelectorAll('.login-theme-area,#authPalette,.auth-palette,.auth-palette-title,.auth-theme-btn').forEach(e=>e.remove());
  document.querySelectorAll('button,a,div').forEach(e=>{const t=(e.textContent||'').trim();if(t==='اختار لونك المفضل'||t==='🎨 اختار لون التطبيق')e.remove()});
}
function ready(){clean();new MutationObserver(clean).observe(document.documentElement,{childList:true,subtree:true});setInterval(clean,1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
