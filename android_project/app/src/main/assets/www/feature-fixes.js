(function(){
'use strict';
function notifyDialog(title,msg,ok){
 let old=document.getElementById('rihlaNotifyDialog');if(old)old.remove();
 const d=document.createElement('div');d.id='rihlaNotifyDialog';
 d.innerHTML='<div class="rihla-notify-sheet"><button type="button" class="rihla-notify-close" aria-label="إغلاق">×</button><div class="rihla-notify-icon">'+(ok?'🔔':'🔕')+'</div><h3>'+title+'</h3><p>'+msg+'</p><button type="button" class="rihla-notify-ok">حسنًا</button></div>';
 document.body.appendChild(d);const close=()=>d.remove();
 d.querySelector('.rihla-notify-close').onclick=close;d.querySelector('.rihla-notify-ok').onclick=close;d.addEventListener('click',e=>{if(e.target===d)close()});
}
function notifyButton(){
 const b=document.getElementById('requestNotifyBtn');if(!b)return;
 try{let text='🔔 تفعيل التنبيهات',cls='mini-btn';
  if(!('Notification' in window))text='🔔 التنبيهات غير مدعومة';
  else if(Notification.permission==='granted'){text='🔔 التنبيهات مفعلة';cls='mini-btn done'}
  else if(Notification.permission==='denied')text='🔕 التنبيهات محظورة';
  if(b.textContent!==text)b.textContent=text;if(b.className!==cls)b.className=cls;
 }catch(e){}
}
async function enableNotifications(e){
 if(e){e.preventDefault();e.stopImmediatePropagation()}
 try{
  if(!('Notification' in window)){notifyDialog('التنبيهات غير مدعومة','هذا الإصدار من التطبيق لا يدعم إشعارات النظام من داخل WebView. مؤقتات المهام تعمل داخل التطبيق بشكل طبيعي.',false);notifyButton();return}
  if(Notification.permission==='granted'){notifyDialog('التنبيهات مفعلة','تم تفعيل التنبيهات بالفعل على هذا الجهاز.',true);notifyButton();return}
  if(Notification.permission==='denied'){notifyDialog('التنبيهات محظورة','افتح إعدادات التطبيق في الهاتف واسمح للتنبيهات، ثم عد إلى التطبيق.',false);notifyButton();return}
  const r=await Notification.requestPermission();
  if(r==='granted')notifyDialog('تم التفعيل','تم تفعيل التنبيهات بنجاح ✅',true);else notifyDialog('لم يتم التفعيل','لم يتم منح إذن التنبيهات. يمكنك المحاولة مرة أخرى من نفس الزر.',false);
 }catch(e){notifyDialog('تعذر التفعيل','حدث خطأ أثناء محاولة تفعيل التنبيهات. جرّب مرة أخرى.',false)}
 notifyButton();
}
function fixNotifications(){const b=document.getElementById('requestNotifyBtn');if(b&&!b.dataset.notifyFix){b.dataset.notifyFix='1';b.type='button';b.onclick=enableNotifications}notifyButton()}
function fixSubscription(){
 const b=document.getElementById('subOpen');if(!b||b.dataset.subFix)return;b.dataset.subFix='1';b.type='button';
 b.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();try{if(typeof b.onclick==='function')b.onclick.call(b,e);else if(typeof window.rihlaOpenSubscription==='function')window.rihlaOpenSubscription();else notifyDialog('إدارة الاشتراك','تعذر فتح إدارة الاشتراك. أعد فتح الصفحة وحاول مرة أخرى.',false)}catch(x){notifyDialog('إدارة الاشتراك','تعذر فتح إدارة الاشتراك. أعد فتح الصفحة وحاول مرة أخرى.',false)}},true)
}
function style(){if(document.getElementById('rihlaFeatureFixStyle'))return;const s=document.createElement('style');s.id='rihlaFeatureFixStyle';s.textContent=`#rihlaNotifyDialog{position:fixed;inset:0;background:rgba(3,16,35,.42);z-index:30000;display:flex;align-items:center;justify-content:center;padding:20px;direction:rtl}.rihla-notify-sheet{position:relative;width:min(430px,100%);background:#fff;border-radius:24px;padding:26px 20px 20px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.25)}.rihla-notify-close{position:absolute;top:10px;left:10px;width:38px;height:38px;border-radius:12px;background:#eef2f7;color:#193253;font-size:26px;line-height:1}.rihla-notify-icon{font-size:42px;margin:4px 0 8px}.rihla-notify-sheet h3{margin:4px 0 8px;color:#102a4b}.rihla-notify-sheet p{margin:0 0 18px;color:#66758a;line-height:1.8;font-size:14px}.rihla-notify-ok{width:100%;padding:12px;border:0;border-radius:14px;background:#246bff;color:#fff;font-weight:800}`;document.head.appendChild(s)}
function tick(){style();fixNotifications();fixSubscription()}
new MutationObserver(()=>setTimeout(tick,50)).observe(document.documentElement,{childList:true,subtree:true});setInterval(tick,1000);setTimeout(tick,300)
})();
