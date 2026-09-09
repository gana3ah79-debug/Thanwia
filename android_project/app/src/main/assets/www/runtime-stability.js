(function(){
'use strict';

/* Runtime stability layer for Android WebView: keep the core app alive even when
   optional browser APIs or a previously-saved state are incomplete. */
(function ensureUUID(){
  try{
    if(window.crypto && typeof window.crypto.randomUUID==='function')return;
    var c=window.crypto||{};
    c.randomUUID=function(){
      var d=Date.now(),r='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
      return r.replace(/[xy]/g,function(ch){var n=(d+Math.random()*16)%16|0;d=Math.floor(d/16);return (ch==='x'?n:(n&3)|8).toString(16);});
    };
    if(!window.crypto)window.crypto=c;
  }catch(e){
    try{window.rihlaUUID=function(){return 'rihla-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);};}catch(x){}
  }
})();

function normalizeState(){
  try{
    var raw=localStorage.getItem('rihlaState');
    if(!raw)return;
    var s=JSON.parse(raw);
    if(!s||typeof s!=='object')return;
    if(!s.progress||typeof s.progress!=='object'||Array.isArray(s.progress))s.progress={};
    if(!Array.isArray(s.selected))s.selected=['الرياضيات','الفيزياء','الكيمياء','اللغة العربية','اللغة الإنجليزية'];
    if(!Array.isArray(s.plan))s.plan=[];
    if(!Array.isArray(s.errorLog))s.errorLog=[];
    if(typeof s.errorReviewed!=='number')s.errorReviewed=0;
    if(typeof s.quizAttempts!=='number')s.quizAttempts=0;
    if(typeof s.quizScore!=='number')s.quizScore=0;
    if(typeof s.progressTotal!=='number')s.progressTotal=0;
    if(typeof s.studied!=='number')s.studied=0;
    if(typeof s.sessions!=='number')s.sessions=0;
    if(typeof s.streak!=='number')s.streak=0;
    if(typeof s.hours!=='number'||!isFinite(s.hours))s.hours=6;
    if(typeof s.track!=='string'||!s.track)s.track='رياضة';
    localStorage.setItem('rihlaState',JSON.stringify(s));
  }catch(e){
    try{localStorage.removeItem('rihlaState')}catch(x){}
  }
}
normalizeState();

/* Minimal offline-safe Supabase shape. The real CDN client replaces this object
   when it loads successfully. This prevents a CDN/network failure from blanking
   the whole WebView before the local UI can render. */
if(!window.supabase || typeof window.supabase.createClient!=='function'){
  var offlineQuery=function(){
    var q={data:[],error:null};
    var chain={select:function(){return chain},eq:function(){return chain},neq:function(){return chain},in:function(){return chain},order:function(){return chain},limit:function(){return chain},maybeSingle:function(){return Promise.resolve({data:null,error:null})},single:function(){return Promise.resolve({data:null,error:null})},insert:function(){return chain},update:function(){return chain},upsert:function(){return chain},delete:function(){return chain}};
    chain.then=function(resolve){return Promise.resolve(q).then(resolve)};
    return chain;
  };
  var offlineAuth={getUser:function(){return Promise.resolve({data:{user:null},error:null})},onAuthStateChange:function(){return {data:{subscription:{unsubscribe:function(){}}}}},signInWithPassword:function(){return Promise.resolve({data:{user:null},error:new Error('خدمة تسجيل الدخول غير متاحة الآن')})},signUp:function(){return Promise.resolve({data:{user:null,session:null},error:new Error('خدمة التسجيل غير متاحة الآن')})}};
  window.supabase={createClient:function(){return {auth:offlineAuth,from:offlineQuery,functions:{invoke:function(){return Promise.resolve({data:null,error:new Error('الخدمة غير متاحة الآن')})}},storage:{from:function(){return {upload:function(){return Promise.resolve({data:null,error:new Error('التخزين غير متاح الآن')})}}}},channel:function(){var ch={on:function(){return ch},subscribe:function(){return Promise.resolve('SUBSCRIBED')},track:function(){return Promise.resolve()},send:function(){return Promise.resolve()}};return ch},removeChannel:function(){}}}};
}

function ensureCoreVisibility(){
  try{
    var gate=document.getElementById('authGate');
    var active=document.querySelector('.screen.active');
    var hasName=false;
    try{var s=JSON.parse(localStorage.getItem('rihlaState')||'null');hasName=!!(s&&s.name);}catch(e){}
    if(gate && getComputedStyle(gate).display==='none' && !active && hasName){
      var home=document.getElementById('home');
      if(home){
        document.querySelectorAll('.screen').forEach(function(x){x.classList.remove('active')});
        home.classList.add('active');
      }
    }
    if(active){
      active.style.setProperty('display','block','important');
      active.style.setProperty('visibility','visible','important');
      active.style.setProperty('opacity','1','important');
    }
  }catch(e){}
}

function addSafetyStyle(){
  if(document.getElementById('rihlaRuntimeSafetyStyle'))return;
  var s=document.createElement('style');
  s.id='rihlaRuntimeSafetyStyle';
  s.textContent='.screen.active{display:block!important;visibility:visible!important;opacity:1!important}.screen.active>.content{display:block!important;visibility:visible!important;opacity:1!important}';
  (document.head||document.documentElement).appendChild(s);
}

function boot(){
  addSafetyStyle();normalizeState();ensureCoreVisibility();
  setTimeout(ensureCoreVisibility,100);setTimeout(ensureCoreVisibility,400);setTimeout(ensureCoreVisibility,1000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.addEventListener('error',function(){setTimeout(ensureCoreVisibility,0)},false);
window.addEventListener('unhandledrejection',function(){setTimeout(ensureCoreVisibility,0)},false);
})();
