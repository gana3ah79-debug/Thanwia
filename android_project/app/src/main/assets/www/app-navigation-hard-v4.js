(function(){
'use strict';
if(window.__rihlaHardNavV4)return;
window.__rihlaHardNavV4=true;
window.__rihlaFinalNavigationReserved=true;
var userIntentUntil=0;
var ids=['onboarding','setup','auth','home','plan','session','quizzes','analysis','achievements','notifications','friends','friendChallenge','quiz'];
function hasUser(){return !!window.__rihlaAuthUser||!!window.authUser}
function current(){return window.__rihlaCurrentScreen||document.querySelector('.screen.active')?.id||''}
function valid(id){return ids.indexOf(id)>=0&&!!document.getElementById(id)}
function hideAll(){document.querySelectorAll('.screen').forEach(function(x){x.classList.remove('active');x.style.setProperty('display','none','important');x.style.removeProperty('visibility');x.style.removeProperty('opacity')})}
function render(id){try{
 if(id==='home'&&window.renderHome)window.renderHome();
 else if(id==='plan'&&window.renderPlan)window.renderPlan();
 else if(id==='session'&&window.updateTimer)window.updateTimer();
 else if(id==='quizzes'){window.initAIQuizUI&&window.initAIQuizUI();window.renderAIQuiz&&window.renderAIQuiz();window.renderQuizzes&&window.renderQuizzes()}
 else if(id==='analysis'&&window.renderAnalysis)window.renderAnalysis();
 else if(id==='achievements'&&window.renderAchievements)window.renderAchievements();
 else if(id==='notifications'&&window.renderNotifications)window.renderNotifications();
 else if(id==='friends'){window.initRealtime&&window.initRealtime();window.renderRealtimeFriends&&window.renderRealtimeFriends()}
}catch(e){console.warn('hard navigation render',e)}}
function go(id,source){
 if(!valid(id))return false;
 if(!hasUser()&&!['auth','onboarding','setup'].includes(id))return false;
 if(source==='user')userIntentUntil=Date.now()+5000;
 if(source!=='user'&&id==='home'){
   var c=current();
   if(Date.now()<userIntentUntil&&!['auth','onboarding','setup'].includes(c))return false;
   if(!['auth','onboarding','setup',''].includes(c))return false;
 }
 var el=document.getElementById(id);hideAll();el.classList.add('active');el.style.setProperty('display','block','important');el.setAttribute('aria-hidden','false');window.__rihlaCurrentScreen=id;
 var nav=document.getElementById('nav');if(nav)nav.style.setProperty('display',(hasUser()&&!['auth','onboarding','setup'].includes(id))?'flex':'none','important');
 document.querySelectorAll('#nav button[data-screen]').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-screen')===id)});
 render(id);return true;
}
function userNavigate(id){return go(id,'user')}
function show(id){return go(id,id==='home'?'system':'code')}
window.rihlaNavigateFinal=userNavigate;
window.rihlaNavigateV12=userNavigate;
window.show=show;window.showScreen=show;
window.rihlaRouteAfterAuth=function(){
 if(!hasUser())return go('auth','system');
 var c=current();
 if(['auth',''].includes(c))return go('home','system');
 if(c==='onboarding'||c==='setup')return true;
 return true;
};
window.rihlaBack=function(){var c=current();if(hasUser()&&!['home','auth','onboarding','setup'].includes(c)){go('home','system');return'handled'}if(hasUser()&&['onboarding','setup'].includes(c))return'handled';return'exit'};
function bind(){
 var nav=document.getElementById('nav');if(!nav)return;
 nav.__rihlaV10=true;nav.__v12=true;nav.__rihlaFinalNav=true;
 nav.querySelectorAll('button[data-screen],button.plus').forEach(function(b){
   b.removeAttribute('onclick');
   b.onclick=function(e){if(e){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}var id=b.getAttribute('data-screen')||(b.classList.contains('plus')?'session':'');if(id)userNavigate(id);return false};
 });
 if(!window.__rihlaHardNavBound){
   window.__rihlaHardNavBound=true;
   nav.addEventListener('click',function(e){var b=e.target.closest('button[data-screen],button.plus');if(!b)return;e.preventDefault();e.stopImmediatePropagation();var id=b.getAttribute('data-screen')||(b.classList.contains('plus')?'session':'');if(id)userNavigate(id)},true);
 }
}
function guard(){bind();window.show=show;window.showScreen=show;window.rihlaNavigateFinal=userNavigate;window.rihlaNavigateV12=userNavigate}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',guard);else guard();
[50,150,300,600,1000,1800,3000,5000,8000].forEach(function(t){setTimeout(guard,t)});
try{new MutationObserver(function(){bind()}).observe(document.body,{childList:true,subtree:true})}catch(e){}
})();