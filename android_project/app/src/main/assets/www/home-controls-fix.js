(function(){
'use strict';
const URL='https://eclnddvupggxyythtpkv.supabase.co';
const KEY='sb_publishable_FqI5heK77syr-3QHh2LPHg_E82vbq-0';
const ADMIN_EMAIL='hamadanagy1979@gmail.com';
const ADMIN_URL='file:///android_asset/www/admin.html';
function client(){
 try{if(window.supabaseClient?.auth?.getUser)return window.supabaseClient}catch(e){}
 try{if(window.supabase?.createClient)return window.supabase.createClient(URL,KEY)}catch(e){}
 return null;
}
async function currentUser(){try{const c=client();if(c?.auth?.getUser)return (await c.auth.getUser())?.data?.user||null}catch(e){}return null}
function ensureAdmin(){
 document.getElementById('adminEntry')?.remove();
 const gate=document.getElementById('authGate');
 if(gate&&getComputedStyle(gate).display!=='none'){document.getElementById('adminHomeEntry')?.remove();return;}
 const host=document.querySelector('#home .content');if(!host)return;
 let box=document.getElementById('adminHomeEntry');
 if(!box){
  box=document.createElement('div');box.id='adminHomeEntry';box.className='final-panel';
  box.innerHTML='<div class="row"><div><b>🛠️ لوحة الإدارة</b><div class="muted">إدارة الاشتراكات وطلبات الدفع وحساب المدير</div></div><button type="button" class="mini-btn" id="openAdminPanel">فتح اللوحة</button></div>';
  host.insertBefore(box,host.firstChild);
  box.querySelector('#openAdminPanel').onclick=()=>{location.href=ADMIN_URL};
 }
 box.style.cssText='margin:0 0 14px;background:#fff;border:1px solid #dbe5f2;display:block';
}
function modal(html){
 document.getElementById('rihlaSubModal')?.remove();
 const m=document.createElement('div');m.id='rihlaSubModal';m.className='rihla-sub-modal';m.innerHTML='<div class="rihla-sub-sheet"><button class="rihla-sub-close" type="button">×</button>'+html+'</div>';
 document.body.appendChild(m);m.querySelector('.rihla-sub-close').onclick=()=>m.remove();m.addEventListener('click',e=>{if(e.target===m)m.remove()});return m;
}
async function openSubscription(){
 const c=client();
 if(!c){modal('<h2>💳 إدارة الاشتراك</h2><p>تعذر الاتصال بخدمة الاشتراك. أعد فتح التطبيق وحاول مرة أخرى.</p>');return;}
 let user=null;try{user=(await c.auth.getUser())?.data?.user||null}catch(e){}
 if(!user){modal('<h2>💳 إدارة الاشتراك</h2><p>يجب تسجيل الدخول أولًا لإدارة الاشتراك.</p>');return;}
 const m=modal('<h2>💳 إدارة الاشتراك</h2><p class="rihla-sub-loading">جارٍ تحميل الخطط وطرق الدفع...</p>');
 try{
  const [pr,mr,sr]=await Promise.all([
   c.from('subscription_plans').select('*').eq('is_active',true).order('price'),
   c.from('payment_methods').select('*').eq('is_active',true),
   c.from('student_subscriptions').select('*').eq('user_id',user.id).order('created_at',{ascending:false}).limit(1).maybeSingle()
  ]);
  if(pr.error||mr.error||sr.error)throw new Error('subscription read failed');
  const plans=pr.data||[], methods=mr.data||[], sub=sr.data||null;
  const exp=sub?.expires_at?new Date(sub.expires_at):null;
  const days=exp?Math.max(0,Math.ceil((exp.getTime()-Date.now())/86400000)):7;
  const status=sub?.status==='active'&&days>0?'مدفوع':days>0?'تجربة مجانية':'منتهية';
  m.querySelector('.rihla-sub-sheet').innerHTML='<button class="rihla-sub-close" type="button">×</button><h2>💳 إدارة الاشتراك</h2><div class="rihla-sub-status">حالة الحساب: <b>'+status+'</b> · '+days+' يوم</div><h3>الخطط المتاحة</h3>'+(plans.length?plans.map(p=>'<div class="rihla-plan"><div><b>'+esc(p.name)+'</b><div class="muted">'+esc(p.price)+' جنيه / '+esc(p.duration_days)+' يوم</div></div><button type="button" class="btn rihla-plan-btn" data-plan="'+esc(p.id)+'">اختيار الخطة</button></div>').join(''):'<p class="muted">لا توجد خطة منشورة حاليًا.</p>')+'<h3 style="margin-top:18px">طرق الدفع</h3>'+(methods.length?methods.map(x=>'<div class="rihla-pay"><b>'+esc(x.name)+'</b><div>'+esc(x.account_label)+': <strong>'+esc(x.account_value)+'</strong></div><div class="muted">'+esc(x.instructions||'ادفع ثم أرسل رقم العملية.')+'</div></div>').join(''):'<p class="muted">لا توجد طرق دفع منشورة حاليًا.</p>');
  m.querySelector('.rihla-sub-close').onclick=()=>m.remove();
  m.querySelectorAll('.rihla-plan-btn').forEach(b=>b.onclick=()=>requestPayment(c,user,b.dataset.plan,plans,methods));
 }catch(e){m.querySelector('.rihla-sub-sheet').innerHTML='<button class="rihla-sub-close" type="button">×</button><h2>💳 إدارة الاشتراك</h2><p>تعذر تحميل بيانات الاشتراك الآن. تأكد من اتصال الإنترنت ثم حاول مرة أخرى.</p>';m.querySelector('.rihla-sub-close').onclick=()=>m.remove()}
}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function requestPayment(c,user,id,plans,methods){
 const p=plans.find(x=>String(x.id)===String(id));if(!p)return;
 if(!methods.length){alert('لا توجد طريقة دفع مفعلة حاليًا.');return}
 let method=methods[0];
 if(methods.length>1){const choices=methods.map((x,i)=>(i+1)+': '+x.name).join('\n');const n=Number(prompt('اختر طريقة الدفع بكتابة رقمها:\n'+choices,'1'));if(!Number.isInteger(n)||!methods[n-1])return;method=methods[n-1]}
 const ref=prompt('اكتب رقم عملية التحويل أو مرجع الدفع:');if(!ref)return;
 try{
  const {error}=await c.from('payment_requests').insert({user_id:user.id,amount_egp:p.price,method:method.name,reference:ref,status:'pending'});
  alert(error?'تعذر إرسال طلب الدفع. حاول مرة أخرى.':'تم إرسال طلب الدفع للإدارة بنجاح ✅');
 }catch(e){alert('تعذر إرسال طلب الدفع. حاول مرة أخرى.')}
}
function style(){if(document.getElementById('rihlaHomeControlsStyle'))return;const s=document.createElement('style');s.id='rihlaHomeControlsStyle';s.textContent=`
#adminHomeEntry{order:-9999}.rihla-sub-modal{position:fixed;inset:0;background:rgba(3,16,35,.62);z-index:29999;display:flex;align-items:flex-end;justify-content:center;direction:rtl}.rihla-sub-sheet{width:min(520px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:26px 26px 0 0;padding:22px 18px 28px;position:relative;box-shadow:0 -10px 40px rgba(0,0,0,.18)}.rihla-sub-close{position:absolute;top:12px;left:12px;width:40px;height:40px;border:0;border-radius:13px;background:#eef2f7;color:#193253;font-size:28px}.rihla-sub-status{background:#eef4ff;color:#193f76;border-radius:15px;padding:12px;margin:12px 0 16px}.rihla-plan,.rihla-pay{border:1px solid #e2e8f0;border-radius:16px;padding:12px;margin:8px 0}.rihla-plan{display:flex;justify-content:space-between;align-items:center;gap:10px}.rihla-plan-btn{width:auto;min-width:110px;padding:10px 12px}.rihla-sub-loading{text-align:center;padding:28px 0}
`;document.head.appendChild(s)}
async function tick(){style();document.getElementById('adminEntry')?.remove();const u=await currentUser();if(String(u?.email||'').toLowerCase()===ADMIN_EMAIL)ensureAdmin();else document.getElementById('adminHomeEntry')?.remove();const b=document.getElementById('subOpen');if(b){b.onclick=openSubscription;b.dataset.homeControlsFix='1'}}
window.rihlaOpenSubscription=openSubscription;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(tick,900));else setTimeout(tick,900);
setInterval(tick,1800);
})();
