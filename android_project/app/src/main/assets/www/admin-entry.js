(function(){'use strict';
const ADMIN_URL='file:///android_asset/www/admin.html';
function add(){
 if(document.getElementById('adminEntry'))return;
 const style=document.createElement('style');style.textContent='#adminEntry{position:fixed;top:10px;left:10px;z-index:9999;background:#fff;border:1px solid #dbe5f2;border-radius:14px;padding:7px 10px;box-shadow:0 6px 18px rgba(0,0,0,.12);font-size:12px}#adminEntry button{background:#246bff;color:#fff;border:0;border-radius:10px;padding:8px 11px;font-weight:700}';document.head.appendChild(style);
 const box=document.createElement('div');box.id='adminEntry';box.innerHTML='<button type="button">⚙️ لوحة الإدارة</button>';box.querySelector('button').onclick=function(){window.location.href=ADMIN_URL};document.body.appendChild(box);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(add,300)});else setTimeout(add,300);
})();
