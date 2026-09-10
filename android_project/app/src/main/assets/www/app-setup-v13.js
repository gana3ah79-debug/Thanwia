(function(){
'use strict';
if(window.__rihlaSetupV13)return;
window.__rihlaSetupV13=true;
function stateObj(){try{return window.state||null}catch(e){return null}}
function saveState(){try{if(typeof window.save==='function')window.save();else{var s=stateObj();if(s)localStorage.setItem('rihlaState',JSON.stringify(s))}}catch(e){}}
function authenticated(){return !!window.__rihlaAuthUser}
function needsOnboarding(){var s=stateObj();return !!(authenticated()&&s&&!s.onboardingComplete)}
function needsSetup(){var s=stateObj();return !!(authenticated()&&s&&s.onboardingComplete&&!s.setupComplete)}
function fillSetup(){
 var s=stateObj();if(!s)return;
 var name=document.getElementById('name'),track=document.getElementById('track'),date=document.getElementById('examDate'),hours=document.getElementById('hours');
 if(name)name.value=s.name||'';if(track)track.value=s.track||'رياضة';if(date)date.value=s.examDate||'';if(hours)hours.value=s.hours||6;
 try{if(typeof window.renderSubjects==='function')window.renderSubjects()}catch(e){}
}
function go(id){try{if(typeof window.rihlaNavigateV12==='function')return window.rihlaNavigateV12(id);if(typeof window.show==='function')return window.show(id)}catch(e){}return false}
function openOnboarding(){if(!needsOnboarding())return;go('onboarding')}
function openSetup(){if(!needsSetup())return;fillSetup();setTimeout(function(){if(needsSetup())go('setup')},60)}
function markOnboardingDone(){var s=stateObj();if(!s)return false;s.onboardingComplete=true;saveState();return true}
function bindStart(){
 document.addEventListener('click',function(e){
  var b=e.target.closest('button,a,[role="button"]');if(!b)return;
  var t=(b.textContent||'').replace(/\s+/g,' ').trim();
  if(t.indexOf('ابدأ الآن')===-1)return;
  if(!needsOnboarding())return;
  e.preventDefault();e.stopImmediatePropagation();
  markOnboardingDone();openSetup();
 },true);
}
function wrapFinishSetup(){
 if(typeof window.finishSetup!=='function'||window.finishSetup.__v13)return;
 var original=window.finishSetup;
 function wrapped(){
  var before=stateObj();
  var result=original.apply(this,arguments);
  var s=stateObj();
  if(s){
   var valid=!!(s.name&&s.track&&s.selected&&s.selected.length);
   if(valid){s.setupComplete=true;saveState()}
  }
  setTimeout(function(){if(needsSetup())openSetup();else if(s&&s.setupComplete)go('home')},120);
  return result;
 }
 wrapped.__v13=true;window.finishSetup=wrapped;
}
function guardNavigation(){
 if(typeof window.rihlaNavigateV12==='function'&&!window.rihlaNavigateV12.__v13){
  var nav=window.rihlaNavigateV12;
  function guarded(id){
   if(id==='home'){
    if(needsOnboarding()){openOnboarding();return true}
    if(needsSetup()){openSetup();return true}
   }
   return nav.apply(this,arguments);
  }
  guarded.__v13=true;window.rihlaNavigateV12=guarded;
 }
 if(typeof window.show==='function'&&!window.show.__v13){
  var sh=window.show;
  function gs(id){
   if(id==='home'){
    if(needsOnboarding()){openOnboarding();return true}
    if(needsSetup()){openSetup();return true}
   }
   return sh.apply(this,arguments);
  }
  gs.__v13=true;window.show=gs;window.showScreen=gs;
 }
}
function boot(){
 bindStart();guardNavigation();wrapFinishSetup();
 setTimeout(function(){guardNavigation();wrapFinishSetup();if(needsOnboarding())openOnboarding();else if(needsSetup())openSetup()},100);
 setTimeout(function(){guardNavigation();wrapFinishSetup();if(needsOnboarding())openOnboarding();else if(needsSetup())openSetup()},500);
 setTimeout(function(){guardNavigation();wrapFinishSetup();if(needsOnboarding())openOnboarding();else if(needsSetup())openSetup()},1200);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
