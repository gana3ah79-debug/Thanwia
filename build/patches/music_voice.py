from pathlib import Path

p=Path('app/engagement.tsx')
s=p.read_text()

s=s.replace(
"import{Alert,RefreshControl,SafeAreaView,ScrollView,StyleSheet,Text,TextInput,TouchableOpacity,View}from'react-native';",
"import{Alert,RefreshControl,SafeAreaView,ScrollView,StyleSheet,Text,TextInput,TouchableOpacity,View}from'react-native';\nimport{Audio}from'expo-av';\nimport*as DocumentPicker from'expo-document-picker';"
)

s=s.replace(
"const[t,setT]=useState('daily'),",
"const[t,setT]=useState('daily'),"
)

old="[messages,setMessages]=useState<any[]>([]),[message,setMessage]=useState(''),[ann,setAnn]=useState<any[]>([]),"
new="[messages,setMessages]=useState<any[]>([]),[message,setMessage]=useState(''),[voiceMessages,setVoiceMessages]=useState<any[]>([]),[recording,setRecording]=useState<Audio.Recording|null>(null),[recordingBusy,setRecordingBusy]=useState(false),[playingVoice,setPlayingVoice]=useState<string|null>(null),[musicSound,setMusicSound]=useState<Audio.Sound|null>(null),[musicName,setMusicName]=useState(''),[musicVolume,setMusicVolume]=useState(0.7),[chatControls,setChatControls]=useState<any>({enabled:true,text_enabled:true,voice_enabled:true,music_enabled:true,max_voice_seconds:60}),[roomMusicControls,setRoomMusicControls]=useState<any>({enabled:true,max_volume:1,allow_music:true}),[ann,setAnn]=useState<any[]>([]),"
if old not in s: raise SystemExit('state marker missing')
s=s.replace(old,new,1)

old_load="const load=async()=>{setRefresh(true);const{data:s}=await supabase.auth.getSession();const u=s.session?.user?.id;if(!u){setRefresh(false);return}"
new_load="const load=async()=>{setRefresh(true);const{data:s}=await supabase.auth.getSession();const u=s.session?.user?.id;if(!u){setRefresh(false);return}"
# no-op; insert controls into Promise.all
needle="supabase.from('admin_announcements').select('id,title,body,created_at').order('created_at',{ascending:false}).limit(10)])"
repl="supabase.from('admin_announcements').select('id,title,body,created_at').order('created_at',{ascending:false}).limit(10),supabase.from('app_settings').select('key,value').in('key',['chat_controls','room_music_controls'])])"
if needle not in s: raise SystemExit('load query marker missing')
s=s.replace(needle,repl,1)
needle2="const[d,ss,l,a,at,fr,an]=await Promise.all(["
repl2="const[d,ss,l,a,at,fr,an,ctrl]=await Promise.all(["
s=s.replace(needle2,repl2,1)
needle3="setAnn(an.data||[]);const pend="
repl3="setAnn(an.data||[]);(ctrl.data||[]).forEach((x:any)=>{if(x.key==='chat_controls')setChatControls(v=>({...v,...(x.value||{})}));if(x.key==='room_music_controls')setRoomMusicControls(v=>({...v,...(x.value||{})}));});const pend="
s=s.replace(needle3,repl3,1)

# clean up sound on unmount
s=s.replace("useEffect(()=>{load()},[]);","useEffect(()=>{load();return()=>{musicSound?.unloadAsync().catch(()=>{});}},[]);")

# Extend openChat to load voice messages
old_chat="const openChat=async(f:Friend)=>{setSelected(f);const{data:s}=await supabase.auth.getSession(),u=s.session?.user?.id;if(!u)return;const r=await supabase.from('chat_messages').select('*').or('and(sender_id.eq.'+u+',recipient_id.eq.'+f.id+'),and(sender_id.eq.'+f.id+',recipient_id.eq.'+u+')').order('created_at',{ascending:true}).limit(100);setMessages(r.data||[])};"
new_chat="const openChat=async(f:Friend)=>{setSelected(f);const{data:s}=await supabase.auth.getSession(),u=s.session?.user?.id;if(!u)return;const[r,v]=await Promise.all([supabase.from('chat_messages').select('*').or('and(sender_id.eq.'+u+',recipient_id.eq.'+f.id+'),and(sender_id.eq.'+f.id+',recipient_id.eq.'+u+')').order('created_at',{ascending:true}).limit(100),supabase.from('chat_voice_messages').select('*').or('and(sender_id.eq.'+u+',recipient_id.eq.'+f.id+'),and(sender_id.eq.'+f.id+',recipient_id.eq.'+u+')').order('created_at',{ascending:true}).limit(100)]);setMessages(r.data||[]);setVoiceMessages(v.data||[])};"
if old_chat not in s: raise SystemExit('openChat marker missing')
s=s.replace(old_chat,new_chat,1)

# Insert media functions before buzz
marker="const buzz=async()=>{"
functions="""const chooseMusic=async()=>{
  if(!chatControls.enabled||!chatControls.music_enabled||!roomMusicControls.enabled||!roomMusicControls.allow_music)return Alert.alert('الموسيقى','الموسيقى معطلة من لوحة الإدارة.');
  const pick=await DocumentPicker.getDocumentAsync({type:'audio/*',copyToCacheDirectory:true,multiple:false});
  if(pick.canceled||!pick.assets?.[0])return;
  const uri=pick.assets[0].uri; const name=pick.assets[0].name||'موسيقى';
  try{
    if(musicSound)await musicSound.unloadAsync();
    const {sound}=await Audio.Sound.createAsync({uri},{shouldPlay:true,isLooping:true,volume:musicVolume});
    setMusicSound(sound);setMusicName(name);
  }catch(e:any){Alert.alert('الموسيقى','تعذر تشغيل الملف: '+(e?.message||'خطأ غير معروف'))}
};
const setMusicVol=async(v:number)=>{const n=Math.max(0,Math.min(roomMusicControls.max_volume??1,v));setMusicVolume(n);if(musicSound)await musicSound.setVolumeAsync(n)};
const stopMusic=async()=>{if(musicSound){await musicSound.stopAsync().catch(()=>{});await musicSound.unloadAsync().catch(()=>{});}setMusicSound(null);setMusicName('')};
const startVoice=async()=>{
  if(!chatControls.enabled||!chatControls.voice_enabled)return Alert.alert('الصوت','الشات الصوتي معطل من لوحة الإدارة.');
  if(recording||recordingBusy)return;
  try{
    setRecordingBusy(true);
    const perm=await Audio.requestPermissionsAsync();
    if(!perm.granted){setRecordingBusy(false);return Alert.alert('الميكروفون','اسمح بالوصول إلى الميكروفون لإرسال رسالة صوتية.')};
    await Audio.setAudioModeAsync({allowsRecordingIOS:true,playsInSilentModeIOS:true});
    const {recording:r}=await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    setRecording(r);setRecordingBusy(false);
  }catch(e:any){setRecordingBusy(false);Alert.alert('الصوت',e?.message||'تعذر بدء التسجيل')}
};
const stopVoice=async()=>{
  if(!recording||!selected)return;
  try{
    setRecordingBusy(true);const r=recording;setRecording(null);await r.stopAndUnloadAsync();const uri=r.getURI();if(!uri)throw new Error('لم يتم إنشاء ملف صوتي');
    const status=await r.getStatusAsync();const duration=Math.min(Number((status as any).durationMillis||0),Number(chatControls.max_voice_seconds||60)*1000);
    const {data:s}=await supabase.auth.getSession();const u=s.session?.user?.id;if(!u)throw new Error('انتهت الجلسة');
    const path=u+'/'+Date.now()+'.m4a';const blob=await fetch(uri).then(x=>x.arrayBuffer());
    const up=await supabase.storage.from('wanas-chat').upload(path,blob,{contentType:'audio/m4a',upsert:false});
    if(up.error)throw up.error;
    const ins=await supabase.from('chat_voice_messages').insert({sender_id:u,recipient_id:selected.id,storage_path:path,duration_ms:duration}).select('*').single();
    if(ins.error)throw ins.error;
    setVoiceMessages(v=>[...v,ins.data]);setRecordingBusy(false);
    await Audio.setAudioModeAsync({allowsRecordingIOS:false,playsInSilentModeIOS:true});
  }catch(e:any){setRecordingBusy(false);Alert.alert('الصوت',e?.message||'تعذر إرسال الرسالة الصوتية')}
};
const playVoice=async(item:any)=>{
  try{
    if(playingVoice===item.id){setPlayingVoice(null);return}
    const signed=await supabase.storage.from('wanas-chat').createSignedUrl(item.storage_path,300);
    if(signed.error||!signed.data?.signedUrl)throw signed.error||new Error('تعذر فتح الصوت');
    const {sound}=await Audio.Sound.createAsync({uri:signed.data.signedUrl},{shouldPlay:true});
    setPlayingVoice(item.id);sound.setOnPlaybackStatusUpdate((st:any)=>{if(st.didJustFinish){setPlayingVoice(null);sound.unloadAsync().catch(()=>{})}});
  }catch(e:any){Alert.alert('الصوت',e?.message||'تعذر تشغيل الرسالة الصوتية')}
};
"""
if marker not in s: raise SystemExit('buzz marker missing')
s=s.replace(marker,functions+marker,1)

# Replace friend challenge card with music controls
old_fc='<View style={s.card}><Text style={s.h2}>🎮 تحدي AI</Text><TouchableOpacity style={s.ai}onPress={createChallenge}><Text style={s.w}>إنشاء تحدي</Text></TouchableOpacity>'
new_fc='<View style={s.card}><Text style={s.h2}>🎮 تحدي AI</Text><TouchableOpacity style={s.ai}onPress={createChallenge}><Text style={s.w}>إنشاء تحدي</Text></TouchableOpacity><Text style={s.h2}>🎵 موسيقى الغرفة</Text><TouchableOpacity style={s.sec}onPress={chooseMusic}><Text style={s.dark}>{musicName?"تغيير الموسيقى":"إضافة موسيقى من الجهاز"}</Text></TouchableOpacity>{musicName&&<><Text style={s.m}>▶ {musicName}</Text><View style={s.musicRow}><TouchableOpacity onPress={()=>setMusicVol(Math.max(0,musicVolume-0.1))}><Text style={s.blue}>−</Text></TouchableOpacity><Text style={s.w}>الصوت {Math.round(musicVolume*100)}%</Text><TouchableOpacity onPress={()=>setMusicVol(Math.min(roomMusicControls.max_volume??1,musicVolume+0.1))}><Text style={s.blue}>+</Text></TouchableOpacity><TouchableOpacity onPress={stopMusic}><Text style={s.blue}>إيقاف</Text></TouchableOpacity></View></>}'
if old_fc not in s: raise SystemExit('friend card marker missing')
s=s.replace(old_fc,new_fc,1)

# Replace selected chat block
old_chat_ui='<ScrollView style={{maxHeight:250}}>{messages.map(m=><Text key={m.id}style={s.msg}>{m.body}</Text>)}</ScrollView><TextInput value={message}onChangeText={setMessage}placeholder="رسالتك"placeholderTextColor="#71809c"style={s.input}/><TouchableOpacity style={s.ai}onPress={sendChat}><Text style={s.w}>إرسال</Text></TouchableOpacity>'
new_chat_ui='<ScrollView style={{maxHeight:250}}>{messages.map(m=><Text key={m.id}style={s.msg}>{m.body}</Text>)}{voiceMessages.map(v=><TouchableOpacity key={v.id}onPress={()=>playVoice(v)}style={s.voiceMsg}><Text style={s.w}>{playingVoice===v.id?"⏸ إيقاف الصوت":"▶ رسالة صوتية"} • {Math.round((v.duration_ms||0)/1000)}ث</Text></TouchableOpacity>)}</ScrollView>{chatControls.text_enabled&&<><TextInput value={message}onChangeText={setMessage}placeholder="رسالتك"placeholderTextColor="#71809c"style={s.input}/><TouchableOpacity style={s.ai}onPress={sendChat}><Text style={s.w}>إرسال نص</Text></TouchableOpacity></>}{chatControls.voice_enabled&&<TouchableOpacity style={[s.voiceBtn,recording&&s.recording]}onPress={recording?stopVoice:startVoice}disabled={recordingBusy}><Text style={s.w}>{recording?"⏹ إنهاء وإرسال التسجيل":"🎙 اضغط للتسجيل الصوتي"}</Text></TouchableOpacity>}'
if old_chat_ui not in s: raise SystemExit('chat ui marker missing')
s=s.replace(old_chat_ui,new_chat_ui,1)

# Add styles
s=s.replace("msg:{color:'#fff',backgroundColor:'#17233b',padding:10,borderRadius:10,marginVertical:3,textAlign:'right'}});",
"msg:{color:'#fff',backgroundColor:'#17233b',padding:10,borderRadius:10,marginVertical:3,textAlign:'right'},voiceMsg:{backgroundColor:'#213b65',padding:12,borderRadius:12,marginVertical:4,alignItems:'center'},voiceBtn:{backgroundColor:'#7b5cff',padding:13,borderRadius:12,alignItems:'center',marginTop:7},recording:{backgroundColor:'#d64f68'},musicRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:8,padding:10,backgroundColor:'#0c1424',borderRadius:10}});")

p.write_text(s)
print('Patched engagement with device music, volume control, and voice chat messages.')

# Compatibility hardening: do not let optional profile columns break onboarding when PostgREST cache/schema is stale.
from pathlib import Path as _Path
import re as _re
for _root in (_Path('app'), _Path('src')):
    if not _root.exists(): continue
    for _p in _root.rglob('*'):
        if _p.suffix not in {'.ts','.tsx','.js','.jsx'} or 'node_modules' in _p.parts or 'android' in _p.parts: continue
        try: _txt=_p.read_text()
        except: continue
        _new=_txt
        # Remove only profile projection columns known to cause schema-cache failures.
        _new=_re.sub(r"(\\.select\\(\\s*['\"])([^'\"]*?)(['\"])", lambda m: m.group(1)+_re.sub(r'(?<![A-Za-z0-9_])(avatar_url|bio)(?![A-Za-z0-9_])\\s*,?\\s*','',m.group(2)).strip(' ,')+m.group(3), _new)
        if _new!=_txt: _p.write_text(_new)
print('Profile projection compatibility hardening applied for avatar_url and bio')
