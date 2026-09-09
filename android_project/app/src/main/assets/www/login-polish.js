(function(){'use strict';
function ready(){
 const gate=document.getElementById('authGate'); if(!gate)return;
 const box=gate.querySelector('.auth-box'); if(!box)return;
 // Remove/hide any floating theme/mode controls that are outside the login card while auth is open.
 function hideFloatingControls(){
   document.querySelectorAll('body *').forEach(el=>{
     if(!el || el===gate || gate.contains(el)) return;
     const t=(el.textContent||'').trim();
     if((t.includes('ذكي')||t.includes('مريح')) && el.children.length<4){
       const r=el.getBoundingClientRect();
       if(r.left<window.innerWidth*.55 && r.top>window.innerHeight*.35 && r.top<window.innerHeight*.9){el.style.setProperty('display','none','important');}
     }
   });
 }
 function polish(){
   gate.classList.add('login-polished');
   hideFloatingControls();
   const old=box.querySelector('.login-theme-area');
   if(old)return;
   const title=box.querySelector('h2');
   const area=document.createElement('div'); area.className='login-theme-area';
   area.innerHTML='<div class="login-theme-title">اختار لونك المفضل</div><div class="login-theme-row">'+[
    ['blue','أزرق','#246bff'],['green','أخضر','#19a974'],['purple','بنفسجي','#7b4dff'],['orange','برتقالي','#e78a00'],['cyan','سماوي','#009fd0'],['rose','وردي','#d34b76']
   ].map(x=>'<button type="button" class="login-theme-dot" data-theme="'+x[0]+'" aria-label="'+x[1]+'" title="'+x[1]+'"><span style="background:'+x[2]+'"></span></button>').join('')+'</div>';
   if(title) title.insertAdjacentElement('afterend',area); else box.insertBefore(area,box.firstChild);
   area.querySelectorAll('.login-theme-dot').forEach(b=>b.addEventListener('click',function(e){
     e.preventDefault(); e.stopPropagation();
     const theme=b.dataset.theme;
     if(typeof window.applyTheme==='function') window.applyTheme(theme);
     else {document.documentElement.style.setProperty('--ui-main',b.querySelector('span').style.background);localStorage.setItem('rihlaThemeV1',theme);}
     area.querySelectorAll('.login-theme-dot').forEach(x=>x.classList.toggle('active',x===b));
   }));
   const current=localStorage.getItem('rihlaThemeV1')||'blue';
   area.querySelectorAll('.login-theme-dot').forEach(x=>x.classList.toggle('active',x.dataset.theme===current));
 }
 polish();
 const mo=new MutationObserver(polish); mo.observe(gate,{attributes:true,childList:true,subtree:true});
 setInterval(hideFloatingControls,800);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
