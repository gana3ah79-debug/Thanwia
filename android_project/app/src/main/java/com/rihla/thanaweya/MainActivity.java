package com.rihla.thanaweya;
import android.app.*; import android.os.*; import android.webkit.*; import android.view.*;
public class MainActivity extends Activity {
  WebView web;
  @Override public void onCreate(Bundle b){super.onCreate(b); web=new WebView(this); web.setLayoutParams(new ViewGroup.LayoutParams(-1,-1)); WebSettings s=web.getSettings(); s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setDatabaseEnabled(true); s.setAllowFileAccess(true); s.setAllowContentAccess(true); s.setMediaPlaybackRequiresUserGesture(false); web.setWebViewClient(new WebViewClient()); setContentView(web); web.loadUrl("file:///android_asset/www/index.html");}
  @Override public void onBackPressed(){ if(web.canGoBack()) web.goBack(); else super.onBackPressed(); }
}
