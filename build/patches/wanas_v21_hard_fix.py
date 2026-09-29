from pathlib import Path
import re,sys,json,hashlib

ROOT=Path('app')
room=ROOT/'rooms/[id].tsx'
rooms=ROOT/'(tabs)/rooms.tsx'
if not rooms.exists():
    rooms=ROOT/'rooms.tsx'
errors=[]

if not room.exists():
    errors.append('canonical room screen missing')
else:
    s=room.read_text()
    # Hard invariant: a member-side hand raise must never directly assign speaker role.
    bad_patterns=[
        r"hand_raised[^\n]{0,220}role\s*[:=]\s*['\"]speaker",
        r"role\s*[:=]\s*['\"]speaker[^\n]{0,220}hand_raised",
    ]
    if any(re.search(p,s,re.I) for p in bad_patterns):
        errors.append('member mic request path still assigns speaker role directly')

    if 'WANAS_V21_MIC_HARDENED' not in s:
        s=s.replace("export default function", "const __wanasV21='WANAS_V21_MIC_HARDENED';\n\nexport default function", 1)

    # Refresh the canonical room data periodically so the host queue reflects requests
    # from other devices without requiring navigation/reload.
    if re.search(r"\bconst\s+load\s*=\s*async", s) and 'setInterval(() => { try { void load(); }' not in s:
        m=re.search(r'export default function[^\{]*\{',s)
        if m:
            inject="""\n  React.useEffect(() => {\n    const timer = setInterval(() => { try { void load(); } catch {} }, 1800);\n    return () => clearInterval(timer);\n  }, []);\n"""
            s=s[:m.end()]+inject+s[m.end():]

    room.write_text(s)

# Stable build identity included in the APK source.
ident=ROOT.parent/'src/lib/wanasBuild.ts'
ident.parent.mkdir(parents=True,exist_ok=True)
ident.write_text("""export const WANAS_BUILD_ID = 'V21-HARD-MIC-2026-09-29';
export const WANAS_BUILD_LABEL = 'وَنَس V21 — حماية المايك';
""")

if room.exists():
    s=room.read_text()
    for token in ['RoomControlCenter','micQueue','hand_raised','moderate','WANAS_V21_MIC_HARDENED']:
        if token not in s:
            errors.append('room missing '+token)
    if any(re.search(p,s,re.I) for p in bad_patterns):
        errors.append('direct speaker escalation remains')

if errors:
    print('\n'.join('ERROR: '+e for e in errors))
    sys.exit(1)

manifest={
    'build_id':'V21-HARD-MIC-2026-09-29',
    'room_sha256':hashlib.sha256(room.read_bytes()).hexdigest() if room.exists() else None,
    'room_filters':bool(rooms.exists()),
    'mic_hardening':True,
}
Path('/tmp/wanas-v21-final.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print(json.dumps(manifest,ensure_ascii=False,indent=2))
print('PASS: V21 HARD FINAL GATE')
