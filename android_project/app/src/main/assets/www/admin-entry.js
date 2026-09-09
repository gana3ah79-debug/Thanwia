(function(){'use strict';
const ADMIN_EMAIL='hamadanagy1979@gmail.com';
const SUPABASE_URL='https://eclnddvupggxyythtpkv.supabase.co';
const SUPABASE_KEY='sb_publishable_FqI5heK77syr-3QHh2LPHg_E82vbq-0';
const ADMIN_URL='file:///android_asset/www/admin.html';
function hide(){const x=document.getElementById('adminEntry');if(x)x.remove();}
async function isAdmin(){
 try{
  if(window.supabase&&window.supabase.createClient){
   const c=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
   const {data:{user}}=await c.auth.getUser();
   return !!user&&String(user.email||'').toLowerCase()===ADMIN_EMAIL;
  }
 }catch(e){}
 try{
  for(let i=0;i<localStorage.length;i++){
   const k=localStorage.key(i)||'';
   if(!/auth-token$/i.test(k))continue;
   const raw=localStorage.getItem(k);if(!raw)continue;
   const s=JSON.parse(raw);const token=s?.access_token;
   if(!token)continue;
   const r=await fetch(SUPABASE_URL+'/auth/v1/user',{headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+token}});
   if(!r.ok)continue;
   const u=await r.json();
   return String(u.email||'').toLowerCase()===ADMIN_EMAIL;
  }
 }catch(e){}
 return false;
}
function add(){
 hide();
 const box=document.createElement('div');box.id='adminEntry';box.style.cssText='position:fixed;top:10px;left:10px;z-index:9999;background:#fff;border:1px solid #dbe5f2;border-radius:14px;padding:7px 10px;box-shadow:0 6px 18px rgba(0,0,0,.12);font-size:12px';
 box.innerHTML='<button type="button" style="background:#246bff;color:#fff;border:0;border-radius:10px;padding:8px 11px;font-weight:700">⚙️ لوحة الإدارة</button>';
 box.querySelector('button').onclick=function(){window.location.href=ADMIN_URL};document.body.appendChild(box);
}
async function check(){hide();if(await isAdmin())add();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(check,700));else setTimeout(check,700);
setInterval(check,5000);
})();
