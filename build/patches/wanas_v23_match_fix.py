from pathlib import Path
import json

root = Path('.')
match = root / 'app' / 'match.tsx'
if not match.exists():
    raise SystemExit('match.tsx not found')

s = match.read_text()

old = """  // join the queue once, then poll
  useEffect(() => {
    if (joined.current) return;
    joined.current = true;
    void (async () => {
      try {
        await api.joinQueue(role, sessionType);
      } catch (e) {
        setErr(errMessage(e));
        setPhase('error');
      }
    })();
  }, [role, sessionType]);

  useEffect(() => {
    void poll();
    const id = setInterval(() => { void poll(); }, 1500);
    return () => clearInterval(id);
  }, [poll]);
"""

new = """  // Join first, then poll. This prevents a race where pollMatch() runs
  // before the queue row exists and surfaces a misleading backend error.
  useEffect(() => {
    if (joined.current) return;
    joined.current = true;
    let active = true;
    void (async () => {
      try {
        await api.joinQueue(role, sessionType);
        if (active) void poll();
      } catch (e) {
        if (active) {
          setErr(errMessage(e));
          setPhase('error');
        }
      }
    })();
    return () => { active = false; };
  }, [role, sessionType, poll]);

  useEffect(() => {
    const id = setInterval(() => { void poll(); }, 1500);
    return () => clearInterval(id);
  }, [poll]);
"""

if old not in s:
    raise SystemExit('match queue effect block not found')
match.write_text(s.replace(old, new, 1))

app_json = root / 'app.json'
data = json.loads(app_json.read_text())
data.setdefault('expo', {})
data['expo']['version'] = '1.0.23'
data['expo'].setdefault('android', {})
data['expo']['android']['versionCode'] = 23
data['expo'].setdefault('extra', {})
data['expo']['extra']['wanasBuildId'] = 'V23-MATCH-RPC-FIX-2026-09-29'
app_json.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

manifest = {
    'version': '23',
    'build_id': 'V23-MATCH-RPC-FIX-2026-09-29',
    'fixes': ['match queue join-before-poll', 'installable versionCode 23']
}
Path('/tmp/wanas-v23-final.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
print(json.dumps(manifest, ensure_ascii=False))

# Wanas NEO pipeline integration
