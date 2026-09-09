(function(){
'use strict';
function notifyButton(){
 const b=document.getElementById('requestNotifyBtn'); if(!b)return;
 try{
  if(!('Notification' in window)){b.textContent='🔔 التنبيهات غير مدعومة';b.className='mini-btn';return}
  if(Notification.permission==='granted'){b.textContent='🔔 التنبيهات مفعلة';b.className='mini-btn done';return}
  if(Notification.permission==='denied'){b.textContent='🔕 التنبيهات محظورة';b.className='mini-btn';return}
  b.textContent='🔔 تفعيل التنبيهات';b.className='mini-btn';
 }catch(e){}
}
async function enableNotifications(){
 try{
  if(!('Notification' in window)){toast('التنبيهات غير مدعومة على هذا الجهاز داخل التطبيق.');notifyButton();return}
  if(Notification.permission==='granted'){toast('التنبيهات مفعلة بالفعل ✅');notifyButton();return}
  if(Notification.permission==='denied'){toast('التنبيهات محظورة. فعّل إذن التنبيهات من إعدادات التطبيق ثم أعد المحاولة.');notifyButton();return}
  const r=await Notification.requestPermission();
  if(r==='granted')toast('تم تفعيل التنبيهات بنجاح ✅'); else toast('لم يتم تفعيل التنبيهات.');
 }catch(e){toast('تعذر تفعيل التنبيهات من داخل التطبيق.')}
 notifyButton();
}
function fixNotifications(){const b=document.getElementById('requestNotifyBtn');if(b&&!b.dataset.notifyFix){b.dataset.notifyFix='1';b.type='button';b.onclick=enableNotifications}notifyButton()}
function fixSubscription(){const b=document.getElementById('subOpen');if(b&&!b.dataset.subFix){b.dataset.subFix='1';b.type='button';b.style.pointerEvents='auto';b.style.cursor='pointer';b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();try{if(typeof window.rihlaFinalFeatures?.openSubscription==='function')window.rihlaFinalFeatures.openSubscription();else if(typeof openSubscription==='function')openSubscription();else toast('تعذر فتح إدارة الاشتراك، أعد فتح الصفحة.')}catch(x){toast('تعذر فتح إدارة الاشتراك.')}},true)}}
function tick(){fixNotifications();fixSubscription()}
new MutationObserver(tick).observe(document.documentElement,{childList:true,subtree:true});setInterval(tick,500);setTimeout(tick,300)
})();