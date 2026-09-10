package com.rihla.thanaweya;

import android.app.*;
import android.os.*;
import android.webkit.*;
import android.view.*;

public class MainActivity extends Activity{
 WebView web;
 private static final String AIUX="javascript:(function(){try{if(document.getElementById('rihlaAIUX'))return;var s=document.createElement('script');s.id='rihlaAIUX';s.src='file:///android_asset/www/aiux.js';document.head.appendChild(s)}catch(e){console.log('aiux',e)}})();";
 private static final String SUB="javascript:(function(){try{if(document.getElementById('rihlaSubscriptionV2'))return;var s=document.createElement('script');s.id='rihlaSubscriptionV2';s.src='file:///android_asset/www/subscription-v2.js';document.body.appendChild(s)}catch(e){console.log('subscription',e)}})();";
 private static final String ADMIN="javascript:(function(){try{if(document.getElementById('rihlaAdminAccess'))return;var s=document.createElement('script');s.id='rihlaAdminAccess';s.src='file:///android_asset/www/admin-access-v2.js';document.body.appendChild(s)}catch(e){console.log('admin-access',e)}})();";
 private static final String FINALUI="javascript:(function(){try{if(document.getElementById('rihlaFinalUI2027'))return;var s=document.createElement('script');s.id='rihlaFinalUI2027';s.src='file:///android_asset/www/ui-final-2027.js';document.head.appendChild(s)}catch(e){console.log('final-ui',e)}})();";
 private static final String AUTHFIX="javascript:(function(){try{if(document.getElementById('rihlaAuthFixV2'))return;var s=document.createElement('script');s.id='rihlaAuthFixV2';s.src='file:///android_asset/www/auth-fix-v2.js';document.body.appendChild(s)}catch(e){console.log('auth-fix',e)}})();";
 private static final String STABILITY="javascript:(function(){try{if(document.getElementById('rihlaAppStabilityV4'))return;var s=document.createElement('script');s.id='rihlaAppStabilityV4';s.src='file:///android_asset/www/app-stability-v4.js';document.body.appendChild(s)}catch(e){console.log('stability-v4',e)}})();";
 private static final String NAVFIX="javascript:(function(){try{if(document.getElementById('rihlaNavFixV5'))return;var s=document.createElement('script');s.id='rihlaNavFixV5';s.src='file:///android_asset/www/app-nav-fix-v5.js';document.body.appendChild(s)}catch(e){console.log('nav-fix-v5',e)}})();";
 private static final String NAV="javascript:(function(){try{if(window.__rihlaStabilityV4)return;var original=window.showScreen;if(!original)return;var st=['home'];function current(){var a=document.querySelector('.screen.active');return a&&a.id?a.id:'home'}window.showScreen=function(id){if(id&&id!==st[st.length-1]){if(id==='home')st=['home'];else st.push(id)}return original.apply(this,arguments)};window.rihlaBack=function(){var id=current();if(id!=='home'&&st.length>1){st.pop();var p=st[st.length-1]||'home';original(p);return 'page'}return 'exit'}}catch(e){}})();";
 private static final String BACK="javascript:(function(){try{var r=window.rihlaBack?window.rihlaBack():'exit';if(window.Android&&Android.backResult)Android.backResult(r)}catch(e){if(window.Android&&Android.backResult)Android.backResult('exit')}})();";
 @Override public void onCreate(Bundle b){super.onCreate(b);web=new WebView(this);web.setLayoutParams(new ViewGroup.LayoutParams(-1,-1));WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setDatabaseEnabled(true);s.setAllowFileAccess(true);s.setAllowContentAccess(true);s.setMediaPlaybackRequiresUserGesture(false);web.addJavascriptInterface(new AppBridge(this),"Android");web.setWebViewClient(new WebViewClient(){@Override public void onPageFinished(WebView v,String u){super.onPageFinished(v,u);v.evaluateJavascript("javascript:(function(){try{if(!document.getElementById('rihlaModern2027')){var l=document.createElement('link');l.id='rihlaModern2027';l.rel='stylesheet';l.href='file:///android_asset/www/modern-buttons-2027.css';document.head.appendChild(l)}document.documentElement.classList.remove('rihla-light');localStorage.removeItem('rihlaTheme')}catch(e){}})();",null);v.evaluateJavascript(AUTHFIX,null);v.evaluateJavascript(STABILITY,null);v.evaluateJavascript(NAVFIX,null);v.evaluateJavascript(AIUX,null);v.evaluateJavascript(NAV,null);v.evaluateJavascript(FINALUI,null);v.evaluateJavascript(SUB,null);v.evaluateJavascript(ADMIN,null);}});setContentView(web);web.loadUrl("file:///android_asset/www/index.html");}
 @Override public void onBackPressed(){web.evaluateJavascript(BACK,null);}
 public static class AppBridge{
  private final Activity a;
  AppBridge(Activity a){this.a=a;}
  @JavascriptInterface public void backResult(String r){if("exit".equals(r))a.finishAndRemoveTask();}
  @JavascriptInterface public void exitApp(){a.runOnUiThread(new Runnable(){public void run(){a.finishAndRemoveTask();}});}
 }
}
