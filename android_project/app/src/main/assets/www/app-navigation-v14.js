(function(){
'use strict';
if(window.__rihlaNavV14)return;window.__rihlaNavV14=true;
var current=window.__rihlaCurrentScreen||document.querySelector('.screen.active')?.id||'auth';
var explicitUntil=0, explicitTarget='';
var ids=['onboarding','setup','auth','home','plan','session','quizzes','analysis','achievements','notifications','friends','friendChallenge','quiz'];
function hasUser(){return !!window.__rihlaAuthUser}
function valid(id){return ids.indexOf(id)>=0&&!!document.getElementById(id)}
function setOnly(id){if(!valid(id))return false;document.querySelectorAll('.screen').forEach(function(x){x.classList.remove('active');x.style.setProperty('display','none','important');x.style.removeProperty('visibility');x.style.removeProperty('opacity')});var e=document.getElementById(id);e.classList.add('active');e.style.setProperty('display','block','important');current=id;window.__rihlaCurrentScreen=id;var n=document.getElementById('nav');if(n)n.style.setProperty('display',hasUser()&&!['auth','onboarding','setup'].includes(id)?'flex':'none','important');document.querySelectorAll('#nav button[data-screen]').forEach(function(b){b.classList.toggle('active',b.dataset.screen===id)});return true}
function render(id){try{if(id==='home'&&window.renderHome)window.renderHome();else if(id==='plan'&&window.renderPlan)window.renderPlan();else if(id==='session'&&window.updateTimer)window.updateTimer();else if(id==='quizzes'){window.initAIQuizUI&&window.initAIQuizUI();window.renderAIQuiz&&window.renderAIQuiz();window.renderQuizzes&&window.renderQuizzes()}else if(id==='analysis'&&window.renderAnalysis)window.renderAnalysis();else if(id==='achievements'&&window.renderAchievements)window.renderAchievements();else if(id==='notifications'&&window.renderNotifications)window.renderNotifications();else if(id==='friends'){window.initRealtime&&window.initRealtime();window.renderRealtimeFriends&&window.renderRealtimeFriends()}}catch(e){console.warn('V14 render',e)}return true}
function go(id,explicit){if(!valid(id))return false;if(!hasUser()&&!['auth','onboarding','setup'].includes(id))return false;if(id==='home'&&!explicit&&hasUser()&&current!=='auth'&&current!=='onboarding'&&current!=='setup')return true;if(setOnly(id)){render(id);return true}return false}
function show(id){return go(id,id==='home'&&Date.now()<explicitUntil&&explicitTarget==='home')}
window.rihlaNavigateV14=function(id){return go(id,true)};
window.show=show;window.showScreen=show;
function navClick(e){var b=e.target.closest('#nav button[data-screen],#nav button.plus');if(!b)return;var id=b.dataset.screen||(b.classList.contains('plus')?'session':'');if(!id)return;e.preventDefault();e.stopImmediatePropagation();explicitTarget=id;explicitUntil=Date.now()+1000;go(id,true);setTimeout(function(){explicitTarget='';explicitUntil=0},1100)}
document.addEventListener('click',navClick,true);
function reconcile(){var active=document.querySelector('.screen.active');if(active&&active.id&&active.id!==current){current=active.id;window.__rihlaCurrentScreen=current}}
setInterval(reconcile,250);
setTimeout(function(){reconcile()},100);
})();
