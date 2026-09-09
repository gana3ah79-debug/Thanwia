(function(){'use strict';
const API='https://eclnddvupggxyythtpkv.supabase.co',KEY='sb_publishable_FqI5heK77syr-3QHh2LPHg_E82vbq-0';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toast=t=>{try{if(typeof window.toast==='function')window.toast(t);else alert(t)}catch(e){alert(t)}};
async function openForm(planId){
 const modal=document.getElementById('rihlaSubModal');if(!modal||!planId)return;
 const c=window.supabaseClient;if(!c?.auth?.getUser){toast('تعذر الاتصال بالحساب. أعد فتح التطبيق.');return}
 const u=(await c.auth.getUser()).data?.user;if(!u){toast('يجب تسجيل الدخول أولًا.');return}
 const {data:plans,error:pe}=await c.from('subscription_plans').select('id,name,price,duration_days').eq('id',planId).eq('is_active',true).limit(1);if(pe||!plans?.[0]){toast('الخطة غير متاحة حاليًا.');return}
 const {data:methods,error:me}=await c.from('payment_methods').select('id,name,account_label,account_value,instructions').eq('is_active',true).order('id');if(me){toast('تعذر تحميل طرق الدفع.');return}
 if(!methods?.length){toast('لا توجد وسيلة دفع مفعلة حاليًا.');return}
 const {data:pending}=await c.from('payment_requests').select('id').eq('user_id',u.id).eq('plan_id',planId).eq('status','pending').limit(1);
 if(pending?.length){toast('لديك طلب دفع قيد المراجعة لهذه الخطة بالفعل.');return}
 modal.querySelector('.rihla-sub-sheet').innerHTML='<button class="rihla-sub-close" type="button">×</button><h2>💳 تأكيد الاشتراك</h2><div class="rihla-sub-status"><b>'+esc(plans[0].name)+'</b><br>'+esc(plans[0].price)+' جنيه · '+esc(plans[0].duration_days)+' يوم</div><h3>اختر وسيلة الدفع</h3><div id="payChoices">'+methods.map((x,i)=>'<label class="pay-choice" style="display:block;border:1px solid #e2e8f0;border-radius:15px;padding:12px;margin:8px 0;cursor:pointer"><input type="radio" name="rihlaPayMethod" value="'+esc(x.id)+'" '+(i===0?'checked':'')+'> <b>'+esc(x.name)+'</b><div class="muted">'+esc(x.account_label)+': '+esc(x.account_value)+'</div><div class="muted">'+esc(x.instructions||'')+'</div></label>').join('')+'</div><input id="paymentReference" class="rihla-pay-input" placeholder="رقم عملية التحويل / مرجع الدفع" autocomplete="off"><label style="display:block;margin:10px 0;font-weight:700">صورة الإيصال (اختياري)<input id="paymentReceipt" type="file" accept="image/*" style="display:block;width:100%;margin-top:8px"></label><button id="submitRealPayment" class="btn" type="button">✅ إرسال طلب الدفع</button><p id="paymentStatus" class="muted" style="text-align:center"></p>';
 const close=()=>modal.remove();modal.querySelector('.rihla-sub-close').onclick=close;
 modal.querySelector('#submitRealPayment').onclick=async()=>{
  const btn=modal.querySelector('#submitRealPayment'),status=modal.querySelector('#paymentStatus'),ref=modal.querySelector('#paymentReference').value.trim(),mid=modal.querySelector('input[name="rihlaPayMethod"]:checked')?.value,file=modal.querySelector('#paymentReceipt').files?.[0];
  if(!ref){toast('اكتب رقم عملية التحويل أو مرجع الدفع.');return} if(!mid){toast('اختر وسيلة الدفع.');return}
  btn.disabled=true;btn.textContent='⏳ جارٍ إرسال الطلب...';status.textContent='جارٍ التحقق ورفع البيانات...';
  try{
   let receiptPath=null;
   if(file){if(file.size>5*1024*1024)throw new Error('حجم الإيصال أكبر من 5 ميجابايت');const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';receiptPath=u.id+'/'+Date.now()+'-'+Math.random().toString(36).slice(2)+'.'+ext;const up=await c.storage.from('payment-receipts').upload(receiptPath,file,{contentType:file.type||'image/jpeg',upsert:false});if(up.error)throw up.error}
   const p=plans[0];const ins=await c.from('payment_requests').insert({user_id:u.id,plan_id:p.id,amount_egp:p.price,method:methods.find(x=>String(x.id)===String(mid))?.name||'',reference:ref,receipt_url:receiptPath,status:'pending'}).select('id').single();
   if(ins.error)throw ins.error;status.textContent='تم إرسال الطلب بنجاح ✅';toast('تم إرسال طلب الدفع للإدارة بنجاح ✅');setTimeout(close,700);
  }catch(e){console.error(e);status.textContent='';toast('تعذر إرسال طلب الدفع: '+(e?.message||'حدث خطأ'));btn.disabled=false;btn.textContent='✅ إرسال طلب الدفع'}
 };
};
function bind(){const modal=document.getElementById('rihlaSubModal');if(!modal||modal.dataset.realPayBound==='1')return;modal.dataset.realPayBound='1';modal.addEventListener('click',e=>{const b=e.target.closest?.('.rihla-plan-btn');if(!b)return;const id=Number(b.dataset.plan||0);if(!id)return;e.preventDefault();e.stopImmediatePropagation();openForm(id)},true)}
new MutationObserver(bind).observe(document.documentElement,{childList:true,subtree:true});bind();})();