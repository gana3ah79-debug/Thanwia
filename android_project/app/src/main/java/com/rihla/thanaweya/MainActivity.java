package com.rihla.thanaweya;

import android.app.*;
import android.os.*;
import android.webkit.*;
import android.view.*;

public class MainActivity extends Activity {
  WebView web;

  private static final String STOPWATCH_SOUND_JS = "javascript:(function(){if(window.__rihlaStopwatchSound)return;window.__rihlaStopwatchSound=1;let c=null,last=null,busy=false;function unlock(){try{if(!c){const A=window.AudioContext||window.webkitAudioContext;if(!A)return;c=new A()}if(c.state==='suspended')c.resume()}catch(e){}}function tone(f,t,d,v){if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.03)}function done(){if(busy)return;busy=true;try{unlock();if(c){const t=c.currentTime+.03;tone(659.25,t,.24,.16);tone(783.99,t+.22,.24,.17);tone(987.77,t+.44,.28,.18);tone(1318.51,t+.70,.48,.20)}if(navigator.vibrate)navigator.vibrate([80,60,120]);if(typeof toast==='function')toast('🎉 أحسنت! انتهت جلسة المذاكرة')}catch(e){}setTimeout(function(){busy=false},1800)}document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('touchstart',unlock,{passive:true});function read(){const e=document.querySelector('.timer-in strong')||document.querySelector('.timer strong');if(!e)return null;const m=String(e.textContent||'').trim().match(/^(\\d{1,3}):(\\d{2})$/);return m?Number(m[1])*60+Number(m[2]):null}setInterval(function(){const n=read();if(n===null){last=null;return}if(last!==null&&last>0&&n===0)done();last=n},200)})()";

  public class AppBridge {
    @JavascriptInterface
    public void exitApp(){
      runOnUiThread(new Runnable(){
        @Override public void run(){ finishAndRemoveTask(); }
      });
    }
  }

  @Override public void onCreate(Bundle b){
    super.onCreate(b);
    web=new WebView(this);
    web.setLayoutParams(new ViewGroup.LayoutParams(-1,-1));
    WebSettings s=web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setDatabaseEnabled(true);
    s.setAllowFileAccess(true);
    s.setAllowContentAccess(true);
    s.setMediaPlaybackRequiresUserGesture(false);
    web.addJavascriptInterface(new AppBridge(),"AndroidApp");
    web.setWebViewClient(new WebViewClient(){
      @Override public void onPageFinished(WebView view,String url){
        super.onPageFinished(view,url);
        view.evaluateJavascript(STOPWATCH_SOUND_JS,null);
      }
    });
    setContentView(web);
    web.loadUrl("file:///android_asset/www/index.html");
  }

  @Override public void onBackPressed(){
    if(web==null){ super.onBackPressed(); return; }
    web.evaluateJavascript("(window.__rihlaHandleBack ? window.__rihlaHandleBack() : false)", value -> {
      if(value==null || "false".equals(value) || "null".equals(value)){
        if(web.canGoBack()) web.goBack(); else finish();
      }
    });
  }
}
