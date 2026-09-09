(function(){
'use strict';
const PAYMENT_API='https://eclnddvupggxyythtpkv.supabase.co';
const PAYMENT_KEY='sb_publishable_FqI5heK77syr-3QHh2LPHg_E82vbq-0';

async function getToken(){
  try{
    if(window.supabaseClient){
      const r=await window.supabaseClient.auth.getSession();
      return r?.data?.session?.access_token||PAYMENT_KEY;
    }
  }catch(e){}
  return PAYMENT_KEY;
}

async function bridgeApi(path,opts={}){
  const token=await getToken();
  const headers=Object.assign({
    'apikey':PAYMENT_KEY,
    'Authorization':'Bearer '+token,
    'Accept':'application/json'
  },opts.headers||{});
  const options=Object.assign({},opts,{headers});
  if(options.body&&typeof options.body!=='string'){
    headers['Content-Type']='application/json';
    options.body=JSON.stringify(options.body);
  }
  const response=await fetch(PAYMENT_API+path,options);
  const text=await response.text();
  let data=null;
  try{data=text?JSON.parse(text):null;}catch(e){data=text;}
  if(!response.ok) throw new Error(data?.message||data?.hint||data||('HTTP '+response.status));
  return data;
}

function esc(v){
  const d=document.createElement('div');
  d.textContent=String(v??'');
  return d.innerHTML;
}

async function signedReceipt(path){
  if(!path) return '';
  try{
    const clean=String(path).replace(/^\/+/, '').replace(/^payment-receipts\//,'');
    const data=await bridgeApi('/storage/v1/object/sign/payment-receipts/'+clean,{
      method:'POST',body:{expiresIn:600}
    });
    const signed=data?.signedURL||data?.signedUrl||'';
    if(!signed) return '';
    return signed.startsWith('http')?signed:(PAYMENT_API+'/storage/v1'+signed);
  }catch(e){return '';}
}

async function bridgeRequests(){
  const box=document.getElementById('requests');
  if(!box) return;
  try{
    const [requests,plans]=await Promise.all([
      bridgeApi('/rest/v1/payment_requests?select=id,user_id,plan_id,amount_egp,method,reference,receipt_url,status,admin_note,created_at,reviewed_at&order=created_at.desc'),
      bridgeApi('/rest/v1/subscription_plans?select=id,name,price,duration_days')
    ]);
    const planMap=new Map((plans||[]).map(p=>[String(p.id),p]));
    const list=Array.isArray(requests)?requests:[];
    if(!list.length){
      box.className='';
      box.innerHTML='<div class="muted">لا توجد طلبات دفع.</div>';
      return;
    }
    box.className='';
    box.innerHTML=list.map(item=>{
      const plan=planMap.get(String(item.plan_id));
      const status=item.status==='pending'?'⏳ قيد المراجعة':item.status==='approved'?'✅ مقبول':'❌ مرفوض';
      const receipt=item.receipt_url
        ? '<button class="btn secondary" onclick="window.bridgeViewReceipt('+JSON.stringify(item.receipt_url)+')">📎 عرض الإيصال</button>'
        : '';
      const actions=item.status==='pending'
        ? '<div style="margin-top:8px"><button class="btn" onclick="window.bridgeApprove('+JSON.stringify(item.id)+')">قبول وتفعيل الاشتراك</button> <button class="btn danger" onclick="window.bridgeReject('+JSON.stringify(item.id)+')">رفض</button></div>'
        : '';
      return '<div class="req">'
        +'<div><b>'+esc(item.method||'وسيلة دفع')+'</b> · '+Number(item.amount_egp||0)+' جنيه</div>'
        +'<div>الخطة: <b>'+esc(plan?.name||('خطة #'+(item.plan_id||'—')))+'</b></div>'
        +'<div class="muted">الطالب: '+esc(item.user_id)+'<br>المرجع: '+esc(item.reference||'—')+'<br>الحالة: '+status+'</div>'
        +receipt+actions
        +(item.admin_note?'<div class="muted">ملاحظة الإدارة: '+esc(item.admin_note)+'</div>':'')
        +'</div>';
    }).join('');
  }catch(error){
    if(typeof window.renderError==='function') window.renderError('requests',error);
    else box.innerHTML='<div class="muted">تعذر تحميل طلبات الدفع.</div>';
  }
}

async function bridgeApprove(id){
  try{
    if(!confirm('تأكيد قبول الدفع وتفعيل الاشتراك؟')) return;
    await bridgeApi('/rest/v1/rpc/admin_approve_payment_request',{
      method:'POST',body:{p_request_id:id}
    });
    alert('تم قبول الدفع وتفعيل الاشتراك بنجاح ✅');
    await bridgeRequests();
  }catch(error){alert('تعذر قبول الطلب: '+(error?.message||error));}
}

async function bridgeReject(id){
  try{
    const note=prompt('سبب الرفض (اختياري):','');
    if(note===null) return;
    await bridgeApi('/rest/v1/rpc/admin_reject_payment_request',{
      method:'POST',body:{p_request_id:id,p_note:note}
    });
    alert('تم رفض الطلب.');
    await bridgeRequests();
  }catch(error){alert('تعذر رفض الطلب: '+(error?.message||error));}
}

window.bridgeApprove=bridgeApprove;
window.bridgeReject=bridgeReject;
window.bridgeViewReceipt=async function(path){
  const url=await signedReceipt(path);
  if(url) window.open(url,'_blank');
  else alert('تعذر فتح الإيصال أو انتهت صلاحية الجلسة.');
};

function patch(){
  if(typeof window.loadRequests==='function') window.loadRequests=bridgeRequests;
  bridgeRequests();
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(patch,50);});
else setTimeout(patch,50);
})();
