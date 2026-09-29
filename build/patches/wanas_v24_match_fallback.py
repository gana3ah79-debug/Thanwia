from pathlib import Path
import runpy

p=Path("src/lib/supabaseApi.ts")
s=p.read_text()
old="""    async pollMatch() {
      return unwrap(await sb().rpc('rpc_poll_match')) as unknown as QueueState;
    },
"""
new="""    async pollMatch() {
      const rpc=await sb().rpc('rpc_poll_match');
      if(!rpc.error) return (rpc.data ?? {state:'idle'}) as QueueState;
      const {data:session}=await sb().auth.getSession();
      const uid=session.session?.user?.id;
      if(!uid) throw rpc.error;
      const {data:row,error}=await sb().from('match_queue')
        .select('id,state,created_at,expires_at,session_id,partner_id,role')
        .eq('user_id',uid).in('state',['waiting','matched'])
        .order('created_at',{ascending:false}).limit(1).maybeSingle();
      if(error) throw rpc.error;
      if(!row) return {state:'idle'};
      if(row.state==='waiting') return {
        state:'waiting',queue_id:row.id,
        waited_seconds:Math.max(0,Math.round((Date.now()-new Date(row.created_at).getTime())/1000)),
        expires_at:row.expires_at??undefined
      } as QueueState;
      let partner=null;
      if(row.partner_id){
        const {data}=await sb().from('profiles_public').select('*').eq('id',row.partner_id).maybeSingle();
        partner=data??null;
      }
      return {state:'matched',session_id:row.session_id??undefined,partner,i_am:row.role==='talk'?'talker':'listener'} as QueueState;
    },
"""
if old not in s: raise SystemExit("pollMatch block not found")
p.write_text(s.replace(old,new,1))

helper=Path("src/lib/api.ts")
if helper.exists():
    s=helper.read_text()
    marker="  if (/banned/i.test(m)) return 'الحساب محظور 🚫';"
    line="  if (/rpc_poll_match|schema cache|could not find the function/i.test(m)) return 'خدمة المطابقة قيد التحديث، جرّب المطابقة مرة أخرى بعد لحظات.';"
    if marker in s and line not in s: helper.write_text(s.replace(marker,marker+"\n"+line,1))

auth=Path("app/auth.tsx")
if auth.exists():
    s=auth.read_text()
    if "resendConfirmation" not in s:
        s=s.replace("import { Image, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';","import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';")
        s=s.replace("import { isDemo } from '../src/lib/api';","import { isDemo } from '../src/lib/api';\nimport { supabase } from '../src/lib/wanasSupabase';")
        fn="""
  async function resendConfirmation() {
    const target=email.trim();
    if(!target){Alert.alert('البريد الإلكتروني','اكتب البريد الإلكتروني أولًا.');return;}
    const {error}=await supabase.auth.resend({type:'signup',email:target});
    if(error){Alert.alert('تعذر الإرسال',error.message);return;}
    Alert.alert('تم الإرسال','تم إرسال رسالة تأكيد جديدة إلى بريدك الإلكتروني.');
  }

"""
        s=s.replace("\n  return (","\n"+fn+"  return (",1)
        needle='{error ? <View style={{ marginBottom: spacing.md }}><Toast text={error} tone="error" /></View> : null}'
        repl="""{error ? <View style={{ marginBottom: spacing.md }}>
              <Toast text={error} tone="error" />
              {tab === 'in' && /غير مؤكد|confirm/i.test(error) ? <Pressable onPress={() => void resendConfirmation()} style={{marginTop:10,alignItems:'center'}}><Text style={{fontFamily:fonts.bodyBold,fontSize:13,color:colors.primary}}>إعادة إرسال رسالة تأكيد البريد</Text></Pressable> : null}
            </View> : null}"""
        if needle in s: s=s.replace(needle,repl,1)
        auth.write_text(s)
print("V24 matchmaking/auth patch applied")

neo=Path('../build/patches/wanas_neo_redesign.py')
if neo.exists():
    runpy.run_path(str(neo),run_name='__wanas_neo__')
    print('Wanas NEO redesign applied in V24')
