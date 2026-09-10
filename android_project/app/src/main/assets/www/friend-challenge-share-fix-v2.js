(function(){
'use strict';
if(window.__friendChallengeShareFixV3)return;
window.__friendChallengeShareFixV3=true;

function normalizeDigits(v){return String(v||'').replace(/[٠-٩]/g,function(d){return String('٠١٢٣٤٥٦٧٨٩'.indexOf(d));});}
function extractCode(v){
  var s=normalizeDigits(v).toUpperCase().trim();
  var m=s.match(/(?:كود(?:ي)?\s*[:：]?\s*)?([A-Z0-9]{6})(?![A-Z0-9])/);
  return m?m[1]:'';
}
function toast(msg){if(window.toast){try{window.toast(msg);return}catch(e){}}try{alert(msg)}catch(e){}}
async function copyText(text){
  try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(text);return true;}}catch(e){}
  try{var ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.left='-9999px';document.body.appendChild(ta);ta.select();var ok=document.execCommand('copy');ta.remove();return ok;}catch(e){return false;}
}
function getChallengeCode(){
  var o=document.getElementById('fc2Overlay');if(!o)return '';
  var nodes=o.querySelectorAll('.fc2code');
  for(var i=0;i<nodes.length;i++){var c=extractCode(nodes[i].textContent);if(c)return c;}
  return '';
}
function inviteText(code){return 'تعالى نتحدى بعض في «رحلة الثانوية» ⚔️\nكودي: '+code+'\nافتح التطبيق وسجل دخولك ثم اكتب الكود في قسم «أصدقاء أونلاين» وابدأ التحدي معي.\n'+location.href.split('#')[0];}
async function doCopy(){var code=getChallengeCode();if(!code){toast('لم يتم العثور على كود التحدي');return;}toast(await copyText(code)?'تم نسخ الكود: '+code:'تعذر النسخ، الكود هو: '+code);}
async function doShare(){var code=getChallengeCode();if(!code){toast('لم يتم العثور على كود التحدي');return;}var text=inviteText(code);try{if(navigator.share){await navigator.share({title:'تحدي رحلة الثانوية',text:text});return;}}catch(e){if(e&&e.name==='AbortError')return;}toast(await copyText(text)?'تم نسخ رسالة الدعوة. أرسلها لصديقك.':'الكود: '+code);}
function styleCodeInput(){
  var input=document.getElementById('fc2Code');if(!input)return;
  input.setAttribute('dir','ltr');input.style.direction='ltr';input.style.unicodeBidi='plaintext';input.style.textAlign='center';input.style.fontFamily='monospace';input.style.fontSize='30px';input.style.fontWeight='900';input.style.letterSpacing='4px';input.style.padding='12px 8px';input.style.overflow='visible';
  if(!input.dataset.fc2InputFix){input.dataset.fc2InputFix='1';input.addEventListener('input',function(){var raw=normalizeDigits(input.value).toUpperCase().replace(/[^A-Z0-9]/g,'');input.value=raw.slice(0,6);});}
}
function addShareButtons(){
  var o=document.getElementById('fc2Overlay');if(!o)return;
  var codeCard=o.querySelector('.fc2code');
  if(!codeCard)return;
  styleCodeInput();
  var text=String(codeCard.textContent||'').trim();
  var isJoinInput=codeCard.id==='fc2Code' || !!o.querySelector('#fc2Code');
  if(isJoinInput){var old=o.querySelector('[data-fc2-share-row]');if(old)old.remove();return;}
  if(!extractCode(text))return;
  if(codeCard.dataset.shareFixBound)return;
  codeCard.dataset.shareFixBound='1';codeCard.setAttribute('dir','ltr');
  var row=document.createElement('div');row.setAttribute('data-fc2-share-row','1');row.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;direction:rtl';
  var copy=document.createElement('button');copy.type='button';copy.className='fc2btn alt';copy.textContent='📋 نسخ الكود';
  var share=document.createElement('button');share.type='button';share.className='fc2btn';share.textContent='📤 مشاركة الدعوة';
  copy.onclick=function(e){e.preventDefault();e.stopPropagation();doCopy();};share.onclick=function(e){e.preventDefault();e.stopPropagation();doShare();};
  row.appendChild(copy);row.appendChild(share);codeCard.parentNode.insertBefore(row,codeCard.nextSibling);
}
function wrapJoin(){
  if(!window.RIHLA_FC2||typeof window.RIHLA_FC2.joinRoom!=='function'||window.RIHLA_FC2.joinRoom.__shareFixV3)return;
  var original=window.RIHLA_FC2.joinRoom;
  function fixedJoin(){var input=document.getElementById('fc2Code');if(input){var raw=normalizeDigits(input.value).toUpperCase().replace(/[^A-Z0-9]/g,'');input.value=raw.slice(0,6);}return original.apply(this,arguments);}
  fixedJoin.__shareFixV3=true;window.RIHLA_FC2.joinRoom=fixedJoin;
}
function bind(){styleCodeInput();wrapJoin();addShareButtons();}
function start(){bind();try{new MutationObserver(bind).observe(document.documentElement,{childList:true,subtree:true});}catch(e){}[100,300,700,1500,3000].forEach(function(t){setTimeout(bind,t);});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
