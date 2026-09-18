#!/usr/bin/env python3
from pathlib import Path
root=Path(__file__).resolve().parent
bad=[]
for p in root.rglob('*'):
    if p.is_file() and p.suffix.lower() in {'.js','.jsx','.java','.kt','.json','.xml','.gradle','.txt','.md'}:
        try:t=p.read_text(errors='ignore').lower()
        except:continue
        for needle in ['android.webkit.webview','file:///android_asset','react-native-webview','webviewclient','android_asset/www/index.html']:
            if needle in t: bad.append((str(p.relative_to(root)),needle))
print('Native source:',root)
print('package.json:',(root/'package.json').exists())
print('app.json:',(root/'app.json').exists())
print('App.js:',(root/'App.js').exists())
print('WebView indicators:',len(bad))
for x in bad: print('  BAD',x)
raise SystemExit(1 if bad else 0)
