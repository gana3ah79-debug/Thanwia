from pathlib import Path
import json, re, sys

root=Path('.')
appjson=root/'app.json'
room= root/'app/rooms/[id].tsx'
errors=[]

if not appjson.exists():
    errors.append('app.json missing')
else:
    data=json.loads(appjson.read_text())
    expo=data.setdefault('expo',{})
    expo['version']='1.0.22'
    android=expo.setdefault('android',{})
    android['versionCode']=22
    extra=expo.setdefault('extra',{})
    extra['wanasBuildId']='V22-RUNTIME-BACKEND-2026-09-29'
    appjson.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')

if not room.exists():
    errors.append('canonical room screen missing')
else:
    s=room.read_text()
    if "WANAS_BUILD_LABEL" not in s:
        marker="import ar from '../../src/lib/i18n';"
        if marker not in s:
            errors.append('room import marker missing')
        else:
            s=s.replace(marker, marker+"\nimport { WANAS_BUILD_LABEL } from '../../src/lib/wanasBuild';",1)
    badge="""<Text style={{fontFamily: fonts.bodyBold, fontSize: 9, color: colors.textFaint, textAlign: 'right', marginTop: 4}}>
            {WANAS_BUILD_LABEL}
          </Text>"""
    if 'WANAS_BUILD_LABEL}' not in s:
        anchor="{room.topic ? ("
        if anchor in s:
            s=s.replace(anchor, badge+"\n\n        "+anchor,1)
    room.write_text(s)

if errors:
    print('\n'.join('ERROR: '+e for e in errors))
    sys.exit(1)

print('PASS: Wanas V22 runtime release identity applied')
print('version=1.0.22 versionCode=22 build_id=V22-RUNTIME-BACKEND-2026-09-29')
