(function(){
'use strict';
function install(){
  if(window.__rihlaAIQuizAutoStartInstalled)return;
  if(typeof window.generateAIQuiz!=='function')return;
  const original=window.generateAIQuiz;
  window.generateAIQuiz=async function(){
    await original.apply(this,arguments);
    try{
      const toastEl=document.getElementById('toast');
      const msg=(toastEl?.textContent||'').trim();
      if(msg.indexOf('تم إنشاء')===0 && typeof window.startAIQuiz==='function'){
        toastEl?.classList.remove('show');
        window.startAIQuiz();
      }
    }catch(e){console.error('AI quiz auto-start fix',e);}
  };
  window.__rihlaAIQuizAutoStartInstalled=true;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
setTimeout(install,500);
setTimeout(install,1500);
})();
