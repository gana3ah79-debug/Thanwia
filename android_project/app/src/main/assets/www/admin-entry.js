(function(){'use strict';
const SUPABASE_URL='https://eclnddvupggxyythtpkv.supabase.co';
const KEY='sb_publishable_FqI5heK77syr-3QHh2LPHg_E82vbq-0';
const ADMIN_EMAIL='hamadanagy1979@gmail.com';
const ADMIN_URL='https://gana3ah79-debug.github.io/Thanwia/admin/';
function ready(){
  if(!window.supabase||!window.supabase.createClient)return setTimeout(ready,500);
  const client=window.supabase.createClient(SUPABASE_URL,KEY);
  client.auth.getUser().then(async ({data})=>{
    const user=data&&data.user;
    if(!user)return;
    const email=(user.email||'').toLowerCase();
    let isAdmin=false;
    try{const r=await client.rpc('is_admin');isAdmin=!!r.data&&!r.error}catch(e){}
    if(!isAdmin && email!==ADMIN_EMAIL)return;
    const home=document.querySelector('#home .content')||document.querySelector('.content');
    if(!home||document.getElementById('adminEntry'))return;
    const box=document.createElement('div');box.id='adminEntry';box.className='final-panel';
    box.innerHTML='<div class="row"><div><h3>⚙️ لوحة الإدارة</h3><div class="muted">إدارة الطلاب والاشتراكات وطلبات الدفع.</div></div><button class="mini-btn" id="openAdmin">دخول</button></div>';
    home.insertBefore(box,home.firstChild);
    box.querySelector('#openAdmin').onclick=()=>{window.location.href=ADMIN_URL};
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
