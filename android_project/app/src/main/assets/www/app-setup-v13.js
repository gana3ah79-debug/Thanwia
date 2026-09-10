(function(){
'use strict';
if(window.__rihlaSetupV13)return;
window.__rihlaSetupV13=true;
function stateObj(){try{return window.state||null}catch(e){return null}}
function saveState(){try{if(typeof window.save==='function')window.save();else{var s=stateObj();if(s)localStorage.setItem('rihlaState',JSON.stringify(s))}}catch(e){}}
function fillSetup(){
  var s=stateObj();
  if(!s)return;
  var name=document.getElementById('name');
  var track=document.getElementById('track');
  var date=document.getElementById('examDate');
  var hours=document.getElementById('hours');
  if(name)name.value=s.name||'';
  if(track)track.value=s.track||'رياضة';
  if(date)date.value=s.examDate||'';
  if(hours)hours.value=s.hours||6;
  try{if(typeof window.renderSubjects==='function')window.renderSubjects()}catch(e){}
}
function needsSetup(){
  var s=stateObj();
  return !!(window.__rihlaAuthUser&&s&&!s.setupComplete);
}
function openSetup(){
  if(!needsSetup())return;
  fillSetup();
  setTimeout(function(){
    if(!needsSetup())return;
    try{
      if(typeof window.rihlaNavigateV12==='function')window.rihlaNavigateV12('setup');
      else if(typeof window.show==='function')window.show('setup');
    }catch(e){}
  },80);
}
function wrapFinishSetup(){
  if(typeof window.finishSetup!=='function'||window.finishSetup.__v13)return;
  var original=window.finishSetup;
  function wrapped(){
    original.apply(this,arguments);
    setTimeout(function(){
      var s=stateObj();
      if(s&&document.getElementById('home')?.classList.contains('active')){
        s.setupComplete=true;
        saveState();
      }
    },50);
  }
  wrapped.__v13=true;
  window.finishSetup=wrapped;
}
function boot(){
  wrapFinishSetup();
  if(needsSetup())openSetup();
  setTimeout(function(){wrapFinishSetup();if(needsSetup())openSetup()},250);
  setTimeout(function(){wrapFinishSetup();if(needsSetup())openSetup()},1000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
