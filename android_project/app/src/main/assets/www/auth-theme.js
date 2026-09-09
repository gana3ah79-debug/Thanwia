(function(){
'use strict';

const THEMES={
  blue:{name:'أزرق',icon:'🔵',main:'#246bff',soft:'#eef4ff',bg:'#f4f7fb',dark:'#071d3a'},
  green:{name:'أخضر',icon:'🟢',main:'#19a974',soft:'#e7f8f1',bg:'#f3faf7',dark:'#073b2a'},
  purple:{name:'بنفسجي',icon:'🟣',main:'#7b4dff',soft:'#f0ebff',bg:'#f7f4ff',dark:'#24124f'},
  orange:{name:'برتقالي',icon:'🟠',main:'#e78a00',soft:'#fff2df',bg:'#fff9f0',dark:'#4a2a00'},
  cyan:{name:'سماوي',icon:'🔷',main:'#008fb8',soft:'#e4f8fd',bg:'#f1fbfe',dark:'#063846'},
  rose:{name:'وردي',icon:'🌸',main:'#d34b76',soft:'#ffedf3',bg:'#fff5f8',dark:'#4d172c'}
};

function applyTheme(name){
  const t=THEMES[name]||THEMES.blue;
  document.documentElement.style.setProperty('--ui-main',t.main);
  document.documentElement.style.setProperty('--ui-accent',t.soft);
  document.documentElement.style.setProperty('--ui-bg',t.bg);
  document.documentElement.style.setProperty('--ui-dark',t.dark);
  document.body.dataset.rihlaTheme=name;
  try{localStorage.setItem('rihlaThemeV1',name)}catch(e){}
  document.querySelectorAll('.auth-theme-btn').forEach(b=>{
    const on=b.dataset.theme===name;
    b.classList.toggle('selected',on);
    b.setAttribute('aria-pressed',on?'true':'false');
  });
}

function ensureStyle(){
  if(document.getElementById('authThemeStyle'))return;
  const s=document.createElement('style');
  s.id='authThemeStyle';
  s.textContent=`
    :root{--ui-main:#246bff;--ui-accent:#eef4ff;--ui-bg:#f4f7fb;--ui-dark:#071d3a}
    .auth-gate{background:linear-gradient(145deg,rgba(3,18,40,.82),rgba(7,29,58,.68));backdrop-filter:blur(5px);padding:14px}
    .auth-box{width:min(470px,100%);max-height:94vh;overflow:auto;background:rgba(255,255,255,.98);border:1px solid rgba(255,255,255,.75);border-radius:30px;padding:22px;box-shadow:0 24px 80px rgba(0,0,0,.30);position:relative}
    .auth-box h2{font-size:32px;color:var(--ui-dark);margin:4px 0 7px;text-align:center;font-weight:900}
    .auth-box>p.muted{text-align:center;font-size:13px;line-height:1.8;margin:0 0 14px}
    .auth-palette-title{text-align:center;font-weight:900;color:var(--ui-dark);font-size:14px;margin:8px 0 9px}
    .auth-palette{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 14px}
    .auth-theme-btn{min-height:48px;border-radius:15px;border:2px solid #e2e8f0;background:#fff;color:#26364d;font-size:12px;font-weight:900;padding:8px 5px;display:flex;align-items:center;justify-content:center;gap:5px;box-shadow:0 5px 13px rgba(10,30,60,.07);transition:.18s ease;cursor:pointer}
    .auth-theme-btn:active{transform:scale(.97)}
    .auth-theme-btn.selected{border-color:var(--ui-main);background:var(--ui-accent);color:var(--ui-main);box-shadow:0 7px 18px color-mix(in srgb,var(--ui-main) 20%,transparent)}
    .auth-theme-dot{width:11px;height:11px;border-radius:50%;display:inline-block;box-shadow:inset 0 0 0 1px rgba(0,0,0,.08)}
    .auth-box .input{height:54px;border:1.5px solid #dce4ef;border-radius:17px;background:#fff;margin:7px 0 10px;padding:13px 15px;font-size:16px;outline:none;transition:.18s}
    .auth-box .input:focus{border-color:var(--ui-main);box-shadow:0 0 0 4px var(--ui-accent)}
    .auth-box .btn{min-height:54px;border-radius:17px;background:linear-gradient(100deg,var(--ui-main),color-mix(in srgb,var(--ui-main) 70%,#56b7ff));box-shadow:0 9px 20px color-mix(in srgb,var(--ui-main) 22%,transparent);font-size:17px}
    .auth-box .btn.secondary{background:var(--ui-accent);color:var(--ui-main);box-shadow:none}
    .auth-msg{min-height:20px;text-align:center;color:#d33;font-weight:700}
    @media(max-width:380px){.auth-box{padding:17px;border-radius:24px}.auth-box h2{font-size:27px}.auth-palette{gap:6px}.auth-theme-btn{font-size:11px}}
    body[data-rihla-theme="green"] .btn{background:linear-gradient(100deg,#19a974,#39c995)}
    body[data-rihla-theme="purple"] .btn{background:linear-gradient(100deg,#7b4dff,#a47dff)}
    body[data-rihla-theme="orange"] .btn{background:linear-gradient(100deg,#e78a00,#ffb43d)}
    body[data-rihla-theme="cyan"] .btn{background:linear-gradient(100deg,#008fb8,#31bfdc)}
    body[data-rihla-theme="rose"] .btn{background:linear-gradient(100deg,#d34b76,#ee7fa2)}
  `;
  document.head.appendChild(s);
}

function buildPalette(){
  const box=document.querySelector('#authGate .auth-box');
  if(!box||document.getElementById('authPalette'))return;
  const title=document.createElement('div');
  title.className='auth-palette-title';
  title.textContent='🎨 اختار لون التطبيق';
  const palette=document.createElement('div');
  palette.id='authPalette';
  palette.className='auth-palette';
  Object.entries(THEMES).forEach(([key,t])=>{
    const b=document.createElement('button');
    b.type='button';
    b.className='auth-theme-btn';
    b.dataset.theme=key;
    b.innerHTML='<span class="auth-theme-dot" style="background:'+t.main+'"></span>'+t.name;
    b.onclick=function(e){e.preventDefault();e.stopPropagation();applyTheme(key);};
    palette.appendChild(b);
  });
  const login=Array.from(box.querySelectorAll('button')).find(b=>/تسجيل الدخول/.test(b.textContent));
  if(login){box.insertBefore(title,login);box.insertBefore(palette,login)}else{box.appendChild(title);box.appendChild(palette)}
  const msg=document.getElementById('authMsg');if(msg)msg.classList.add('auth-msg');
}

function init(){
  ensureStyle();
  buildPalette();
  let saved='blue';try{saved=localStorage.getItem('rihlaThemeV1')||'blue'}catch(e){}
  applyTheme(THEMES[saved]?saved:'blue');
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
new MutationObserver(function(){buildPalette()}).observe(document.documentElement,{childList:true,subtree:true});
window.rihlaApplyTheme=applyTheme;
})();
