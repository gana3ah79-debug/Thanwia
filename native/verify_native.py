#!/usr/bin/env python3
from pathlib import Path

root = Path(__file__).resolve().parent
bad = []
source_ext = {'.js', '.jsx', '.java', '.kt', '.xml', '.gradle'}
skip_names = {'verify_native.py', 'package-lock.json'}
skip_dirs = {'node_modules', '.git', 'android', 'ios', '.expo'}

for p in root.rglob('*'):
    if not p.is_file() or p.name in skip_names or any(part in skip_dirs for part in p.parts):
        continue
    if p.suffix.lower() not in source_ext:
        continue
    try:
        t = p.read_text(errors='ignore').lower()
    except OSError:
        continue
    for needle in (
        'android.webkit.webview',
        'file:///android_asset',
        'react-native-webview',
        'webviewclient',
        'android_asset/www/index.html',
    ):
        if needle in t:
            bad.append((str(p.relative_to(root)), needle))

print('Native source:', root)
print('package.json:', (root / 'package.json').exists())
print('app.json:', (root / 'app.json').exists())
print('App.js:', (root / 'App.js').exists())
print('WebView indicators in authored source:', len(bad))
for item in bad:
    print('  BAD', item)
raise SystemExit(1 if bad else 0)
