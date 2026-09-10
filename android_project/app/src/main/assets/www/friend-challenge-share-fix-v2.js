(function(){
'use strict';
if(window.__friendChallengeShareFixV2)return;
window.__friendChallengeShareFixV2=true;

function normalizeDigits(v){
  return String(v||'').replace(/[٠-٩]/g,function(d){return String('٠١٢٣٤٥٦٧٨٩'.indexOf(d));});
}
function extractCode(v){
  var s=normalizeDigits(v).toUpperCase();
  var m=s.match(/(?:كود(?:ي)?\s*[:：]?\s*)?([A-Z0-9]{6})\b/);
  return m?m[1]:'';
}
function getCode(){
  var el=document.querySelector('#fc2Overlay .fc2code');
  return extractCode(el&&el.textContent);
}
function toast(msg){
  if(window.toast){try{window.toast(msg);return}catch(e){}}
  try{alert(msg)}catch(e){}
}
async function copyText(text){
  if(!text)return false;
  try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(text);return true;}}catch(e){}
  try{
    var ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();var ok=document.execCommand('copy');ta.remove();return ok;
  }catch(e){return false;}
}
function inviteText(code){
  return 'تعالى نتحدى بعض في «رحلة الثانوية» ⚔️\nكودي: '+code+'\nافتح التطبيق وسجل دخولك ثم اكتب الكود في قسم «أصدقاء أونلاين» وابدأ التحدي معي.\n'+location.href.split('#')[0];
}
async function doCopy(){
  var code=getCode();
  if(!code){toast('لم يتم العثور على كود التحدي');return;}
  var ok=await copyText(code);
  toast(ok?'تم نسخ الكود: '+code:'تعذر النسخ تلقائيًا، الكود هو: '+code);
}
async function doShare(){
  var code=getCode();
  if(!code){toast('لم يتم العثور على كود التحدي');return;}
  var text=inviteText(code);
  try{
    if(navigator.share){await navigator.share({title:'تحدي رحلة الثانوية',text:text});return;}
  }catch(e){if(e&&e.name==='AbortError')return;}
  var ok=await copyText(text);
  toast(ok?'تم نسخ رسالة الدعوة ومشاركتها يدويًا. الكود: '+code:'الكود: '+code);
}
function addShareButtons(){
  var o=document.getElementById('fc2Overlay');
  if(!o)return;
  var card=o.querySelector('.fc2code');
  if(!card||card.dataset.shareFixBound)return;
  card.dataset.shareFixBound='1';
  card.setAttribute('dir','ltr');
  card.setAttribute('aria-label','كود التحدي');
  var row=document.createElement('div');
  row.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;direction:rtl';
  var copy=document.createElement('button');copy.type='button';copy.className='fc2btn alt';copy.textContent='📋 نسخ الكود';
  var share=document.createElement('button');share.type='button';share.className='fc2btn';share.textContent='📤 مشاركة الدعوة';
  copy.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();doCopy();},true);
  share.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();doShare();},true);
  row.appendChild(copy);row.appendChild(share);
  card.parentNode.insertBefore(row,card.nextSibling);
}
function wrapJoin(){
  if(!window.RIHLA_FC2||typeof window.RIHLA_FC2.joinRoom!=='function'||window.RIHLA_FC2.joinRoom.__shareFix)return;
  var original=window.RIHLA_FC2.joinRoom;
  function fixedJoin(){
    var input=document.getElementById('fc2Code');
    if(input){
      var code=extractCode(input.value);
      if(code){input.value=code;}
    }
    return original.apply(this,arguments);
  }
  fixedJoin.__shareFix=true;
  window.RIHLA_FC2.joinRoom=fixedJoin;
}
function bind(){
  wrapJoin();
  addShareButtons();
}
function start(){
  bind();
  try{new MutationObserver(bind).observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
  [100,300,700,1500,3000].forEach(function(t){setTimeout(bind,t);});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
