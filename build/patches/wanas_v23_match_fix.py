from pathlib import Path
import json
import runpy

root=Path('.')
match=root/'app'/'match.tsx'
api=root/'src'/'lib'/'supabaseApi.ts'
helper=root/'src'/'lib'/'api.ts'
auth=root/'app'/'auth.tsx'

if not match.exists(): raise SystemExit('match.tsx not found')

s=match.read_text()
s=s.replace("""  useEffect(() => {
    void poll();
    const id = setInterval(() => { void poll(); }, 1500);
    return () => clearInterval(id);
  }, [poll]);
""","""  useEffect(() => {
    const id = setInterval(() => { void poll(); }, 1500);
    return () => clearInterval(id);
  }, [poll]);
""",1)
match.write_text(s)

if api.exists():
    s=api.read_text()
    old="""    async pollMatch() {
      return unwrap(await sb().rpc('rpc_poll_match')) as unknown as QueueState;
    },"""
    new="""    async pollMatch() {
      const client=sb();
      const rpc=await client.rpc('rpc_poll_match');
      if(!rpc.error) return rpc.data as QueueState;
      const msg=String(rpc.error.message||'');
      if(!/rpc_poll_match|schema cache|could not find the function/i.test(msg)) throw rpc.error;
      const {data:session}=await client.auth.getSession();
      const uid=session.session?.user?.id;
      if(!uid) throw new Error('not authenticated');
      const {data:row,error:qerr}=await client.from('match_queue').select('*').eq('user_id',uid).limit(1).maybeSingle();
      if(qerr) throw qerr;
      if(!row) return {state:'idle'} as QueueState;
      const r:any=row;
      const sessionId=r.session_id||r.matched_session_id||r.match_session_id||null;
      if(sessionId){
        const {data:ms}=await client.from('match_sessions').select('*').eq('id',sessionId).maybeSingle();
        if(ms){
          const partnerId=(ms as any).user_a_id===uid?(ms as any).user_b_id:(ms as any).user_a_id;
          let partner:any=null;
          if(partnerId){const {data:p}=await client.from('profiles_public').select('*').eq('id',partnerId).maybeSingle();partner=p;}
          return {state:'matched',session_id:sessionId,partner} as any;
        }
      }
      const started=Date.parse(String(r.created_at||r.joined_at||''));
      const waited_seconds=Number.isFinite(started)?Math.max(0,Math.floor((Date.now()-started)/1000)):0;
      return {state:'waiting',waited_seconds} as QueueState;
    },"""
    if old not in s: raise SystemExit('pollMatch block not found')
    api.write_text(s.replace(old,new,1))

if helper.exists():
    s=helper.read_text()
    marker="  if (/banned/i.test(m)) return 'الحساب محظور 🚫';"
    if marker in s and 'خدمة المطابقة قيد التحديث' not in s:
        s=s.replace(marker,marker+"\n  if (/rpc_poll_match|schema cache|could not find the function/i.test(m)) return 'خدمة المطابقة قيد التحديث، جرّب المطابقة مرة أخرى بعد لحظات.';")
    helper.write_text(s)

if auth.exists():
    s=auth.read_text()
    if 'resendConfirmation' not in s:
        s=s.replace("import { Image, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';","import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';")
        s=s.replace("import { isDemo } from '../src/lib/api';","import { isDemo } from '../src/lib/api';\nimport { supabase } from '../src/lib/wanasSupabase';")
        marker="\n  return ("
        fn="""
  async function resendConfirmation() {
    const target=email.trim();
    if(!target){Alert.alert('البريد الإلكتروني','اكتب البريد الإلكتروني أولًا.');return;}
    const {error}=await supabase.auth.resend({type:'signup',email:target});
    if(error){Alert.alert('تعذر الإرسال',error.message);return;}
    Alert.alert('تم الإرسال','تم إرسال رسالة تأكيد جديدة إلى بريدك الإلكتروني.');
  }

"""
        if marker in s: s=s.replace(marker,fn+marker,1)
        needle='{error ? <View style={{ marginBottom: spacing.md }}><Toast text={error} tone="error" /></View> : null}'
        repl="""{error ? <View style={{ marginBottom: spacing.md }}><Toast text={error} tone="error" />
              {tab === 'in' && /غير مؤكد|confirm/i.test(error) ? <Pressable onPress={() => void resendConfirmation()} style={{marginTop:10,alignItems:'center'}}><Text style={{fontFamily:fonts.bodyBold,fontSize:13,color:colors.primary}}>إعادة إرسال رسالة تأكيد البريد</Text></Pressable> : null}
            </View> : null}"""
        if needle in s: s=s.replace(needle,repl,1)
        auth.write_text(s)

app_json=root/'app.json'
data=json.loads(app_json.read_text())
data.setdefault('expo',{})
data['expo']['version']='1.0.24'
data['expo'].setdefault('android',{})['versionCode']=24
data['expo'].setdefault('extra',{})['wanasBuildId']='V24-MATCH-AUTH-FIX-2026-09-29'
app_json.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')

manifest={'version':'24','build_id':'V24-MATCH-AUTH-FIX-2026-09-29','fixes':['match RPC compatibility fallback','email confirmation resend UI']}
Path('/tmp/wanas-v23-final.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
neo=root.parent/'build'/'patches'/'wanas_neo_redesign.py'
if neo.exists(): runpy.run_path(str(neo),run_name='__wanas_neo__')
print(json.dumps(manifest,ensure_ascii=False))
