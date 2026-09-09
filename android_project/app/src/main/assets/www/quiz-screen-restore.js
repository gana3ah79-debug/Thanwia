(function(){
'use strict';
const POLICY='الأسئلة للصف الثالث الثانوي فقط — مرجعية: كتب الوزارة، التقييمات الأسبوعية، النماذج الرسمية، والمراجع والمنصات التعليمية الخاصة بالصف الثالث الثانوي، مع الاستفادة من أنماط ومحتوى الامتحانات من 1996 حتى الوقت الحالي. لا أسئلة جامعية ولا مراحل أخرى، ولا نسخ حرفي من مصادر محمية.';
function install(){
  const box=document.querySelector('#quizzes .content .card');
  if(!box)return false;
  if(!document.getElementById('quizSourcePolicy')){
    const p=document.createElement('div');
    p.id='quizSourcePolicy';
    p.style.cssText='margin-top:12px;padding:12px 14px;border-radius:16px;background:#eef5ff;border:1px solid #cfe0ff;color:#24466f;font-size:12px;line-height:1.8;text-align:right';
    p.innerHTML='<b>📚 مصدر ونطاق الأسئلة</b><br>'+POLICY;
    const btn=box.querySelector('button.btn');
    if(btn)btn.insertAdjacentElement('afterend',p);else box.appendChild(p);
  }
  if(window.__rihlaQuizRestoreInstalled)return true;
  if(typeof window.generateAIQuiz!=='function')return false;
  const original=window.generateAIQuiz;
  window.generateAIQuiz=async function(){
    const oldStart=window.startAIQuiz;
    let generated=false;
    window.startAIQuiz=function(){generated=true;};
    try{await original.apply(this,arguments);}
    finally{window.startAIQuiz=oldStart;}
    if(generated && oldStart) toast('تم إنشاء الاختبار بنجاح ✅ — اضغط «ابدأ الاختبار» لبدء الحل.');
  };
  window.__rihlaQuizRestoreInstalled=true;
  return true;
}
function refresh(){if(install())return;setTimeout(install,500);setTimeout(install,1500);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
new MutationObserver(refresh).observe(document.documentElement,{childList:true,subtree:true});
})();
