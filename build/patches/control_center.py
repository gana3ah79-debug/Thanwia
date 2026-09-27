from pathlib import Path
import re

ROOT=Path('app')
ADMIN=ROOT/'admin.tsx'

def write_payment():
    p=ROOT/'app/payment.tsx'
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(r'''import React,{useEffect,useState}from'react';
import{Alert,SafeAreaView,ScrollView,StyleSheet,Text,TextInput,TouchableOpacity,View}from'react-native';
import{router}from'expo-router';
import{supabase}from'../src/lib/wanasSupabase';

export default function PaymentScreen(){
 const[methods,setMethods]=useState<any[]>([]),[method,setMethod]=useState<any>(null),[product,setProduct]=useState('premium'),[amount,setAmount]=useState(''),[ref,setRef]=useState(''),[orders,setOrders]=useState<any[]>([]),[loading,setLoading]=useState(true);
 const load=async()=>{setLoading(true);const{data:s}=await supabase.auth.getSession();const u=s.session?.user?.id;if(!u){setLoading(false);return}const[m,o]=await Promise.all([supabase.from('payment_methods').select('*').eq('enabled',true).order('display_name'),supabase.from('payment_orders').select('*').eq('user_id',u).order('created_at',{ascending:false}).limit(20)]);setMethods(m.data||[]);setOrders(o.data||[]);if(!method&&m.data?.length)setMethod(m.data[0]);setLoading(false)};
 useEffect(()=>{load()},[]);
 const submit=async()=>{const{data:s}=await supabase.auth.getSession(),u=s.session?.user?.id;if(!u||!method)return Alert.alert('الدفع','سجل الدخول واختر طريقة الدفع.');const n=Number(amount);if(!n||n<=0)return Alert.alert('الدفع','أدخل المبلغ.');const{error}=await supabase.from('payment_orders').insert({user_id:u,method_key:method.method_key,product_key:product,amount:n,transaction_ref:ref.trim(),status:'pending'});if(error)Alert.alert('خطأ',error.message);else{Alert.alert('تم','تم إرسال طلب الدفع للإدارة للمراجعة.');setRef('');load()}};
 return <SafeAreaView style={s.root}><ScrollView contentContainerStyle={s.c}><TouchableOpacity style={s.back}onPress={()=>router.back()}><Text style={s.w}>رجوع</Text></TouchableOpacity><View style={s.hero}><Text style={s.title}>💳 الدفع والتفعيل</Text><Text style={s.m}>اختر الطريقة التي فعّلتها الإدارة ثم أرسل رقم العملية.</Text></View><Text style={s.h2}>طريقة الدفع</Text>{methods.map(x=><TouchableOpacity key={x.id}style={[s.card,method?.id===x.id&&s.sel]}onPress={()=>setMethod(x)}><Text style={s.w}>{x.display_name}</Text><Text style={s.blue}>{x.account_value||'تواصل مع الإدارة'}</Text><Text style={s.m}>{x.instructions}</Text></TouchableOpacity>)}<Text style={s.h2}>الخدمة</Text><TextInput value={product}onChangeText={setProduct}style={s.input}placeholder="اسم الخدمة"placeholderTextColor="#71809c"/><TextInput value={amount}onChangeText={setAmount}style={s.input}placeholder="المبلغ بالجنيه"keyboardType="numeric"placeholderTextColor="#71809c"/><TextInput value={ref}onChangeText={setRef}style={s.input}placeholder="رقم العملية / المرجع"placeholderTextColor="#71809c"/><TouchableOpacity style={s.btn}onPress={submit}><Text style={s.w}>إرسال طلب الدفع</Text></TouchableOpacity><Text style={s.h2}>طلباتي</Text>{orders.map(o=><View style={s.order}key={o.id}><Text style={s.w}>{o.product_key} • {o.amount} جنيه</Text><Text style={s.m}>{o.method_key} • {o.status}</Text></View>)}{loading&&<Text style={s.m}>جاري التحميل...</Text>}</ScrollView></SafeAreaView>}
const s=StyleSheet.create({root:{flex:1,backgroundColor:'#070b14'},c:{padding:16,paddingBottom:40},back:{alignSelf:'flex-start',backgroundColor:'#17233b',padding:10,borderRadius:10},w:{color:'#fff',fontWeight:'800'},blue:{color:'#7ea4ff',fontWeight:'900',marginTop:5},m:{color:'#aab6cb',fontSize:13,textAlign:'right',marginTop:6},hero:{backgroundColor:'#101a30',padding:18,borderRadius:20,marginVertical:12},title:{color:'#fff',fontSize:25,fontWeight:'900',textAlign:'right'},h2:{color:'#fff',fontSize:18,fontWeight:'900',textAlign:'right',marginTop:15,marginBottom:8},card:{backgroundColor:'#111b30',padding:14,borderRadius:14,marginVertical:4,borderWidth:1,borderColor:'#263653'},sel:{borderColor:'#4f7cff',backgroundColor:'#17284c'},input:{backgroundColor:'#0c1424',color:'#fff',padding:13,borderRadius:10,marginVertical:5,textAlign:'right'},btn:{backgroundColor:'#4f7cff',padding:14,borderRadius:12,alignItems:'center',marginTop:8},order:{backgroundColor:'#101a2d',padding:12,borderRadius:10,marginVertical:3}});
''')

def write_room_tools():
    p=ROOT/'app/room-tools.tsx'
    p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(r'''import React,{useEffect,useState}from'react';
import{Alert,SafeAreaView,ScrollView,StyleSheet,Switch,Text,TextInput,TouchableOpacity,View}from'react-native';
import{router}from'expo-router';
import{supabase}from'../src/lib/wanasSupabase';
export default function RoomTools(){
 const[roomId,setRoomId]=useState(''),[cfg,setCfg]=useState<any>({music_enabled:true,voice_enabled:true,text_enabled:true,reactions_enabled:true,recording_enabled:false,max_participants:50,slow_mode_seconds:0});
 const load=async()=>{if(!roomId)return;const{data}=await supabase.from('room_settings').select('*').eq('room_id',roomId.trim()).maybeSingle();if(data)setCfg(data)};
 const save=async()=>{if(!roomId.trim())return;const{data:s}=await supabase.auth.getSession();if(!s.session?.user)return;const{error}=await supabase.from('room_settings').upsert({...cfg,room_id:roomId.trim(),updated_at:new Date().toISOString()},{onConflict:'room_id'});if(error)Alert.alert('الغرفة',error.message);else Alert.alert('تم','تم حفظ إعدادات الغرفة')};
 useEffect(()=>{load()},[roomId]);
 return <SafeAreaView style={s.r}><ScrollView contentContainerStyle={s.c}><TouchableOpacity style={s.back}onPress={()=>router.back()}><Text style={s.w}>رجوع</Text></TouchableOpacity><Text style={s.h}>أدوات الغرفة</Text><TextInput value={roomId}onChangeText={setRoomId}placeholder="Room ID / PIN"placeholderTextColor="#71809c"style={s.input}/>{[['music_enabled','الموسيقى'],['voice_enabled','الصوت'],['text_enabled','الشات الكتابي'],['reactions_enabled','التفاعلات'],['recording_enabled','التسجيل']].map(([k,t])=><View style={s.row}key={k}><Text style={s.w}>{t}</Text><Switch value={!!cfg[k]}onValueChange={v=>setCfg((x:any)=>({...x,[k]:v}))}/></View>)}<TextInput value={String(cfg.max_participants)}onChangeText={v=>setCfg((x:any)=>({...x,max_participants:Math.max(2,Math.min(200,Number(v)||50))}))}keyboardType="numeric"placeholder="أقصى عدد"placeholderTextColor="#71809c"style={s.input}/><TextInput value={String(cfg.slow_mode_seconds)}onChangeText={v=>setCfg((x:any)=>({...x,slow_mode_seconds:Math.max(0,Math.min(60,Number(v)||0))}))}keyboardType="numeric"placeholder="Slow mode بالثواني"placeholderTextColor="#71809c"style={s.input}/><TouchableOpacity style={s.btn}onPress={save}><Text style={s.w}>حفظ إعدادات الغرفة</Text></TouchableOpacity></ScrollView></SafeAreaView>}
const s=StyleSheet.create({r:{flex:1,backgroundColor:'#070b14'},c:{padding:16},back:{alignSelf:'flex-start',backgroundColor:'#17233b',padding:10,borderRadius:10},h:{color:'#fff',fontSize:25,fontWeight:'900',textAlign:'right',marginVertical:15},w:{color:'#fff',fontWeight:'800'},input:{backgroundColor:'#0c1424',color:'#fff',padding:13,borderRadius:10,marginVertical:6,textAlign:'right'},row:{backgroundColor:'#111b30',padding:14,borderRadius:12,marginVertical:4,flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center'},btn:{backgroundColor:'#4f7cff',padding:14,borderRadius:12,alignItems:'center',marginTop:10}});
''')

def patch_admin():
    if not ADMIN.exists(): print('admin.tsx missing; routes still added'); return
    s=ADMIN.read_text()
    marker="{key:'settings',title:'إعدادات التطبيق',subtitle:'الخصوصية والخدمات والتحكم العام',icon:'settings-outline'},"
    additions="""\n            {key:'paymentControl',title:'الدفع والتحصيل',subtitle:'كاش وInstaPay وطلبات التفعيل',icon:'card-outline'},\n            {key:'roomControl',title:'تحكم الغرف',subtitle:'الصوت والموسيقى والتسجيل والتفاعلات',icon:'radio-outline'},\n            {key:'featureControl',title:'مفاتيح الميزات',subtitle:'تشغيل وإيقاف الخدمات بدون إصدار جديد',icon:'toggle-outline'},\n            {key:'moderationControl',title:'مركز الأمان',subtitle:'حدود الرسائل والغرف ومكافحة الإساءة',icon:'shield-outline'},"""
    if marker in s and "key:'paymentControl'" not in s: s=s.replace(marker,marker+additions,1)

    # Add state after notice
    st="const [notice,setNotice]=useState('');"
    state="""const [notice,setNotice]=useState('');
            const [paymentMethods,setPaymentMethods]=useState<any[]>([]);
            const [paymentOrders,setPaymentOrders]=useState<any[]>([]);
            const [roomSettings,setRoomSettings]=useState<any[]>([]);
            const [featureFlags,setFeatureFlags]=useState<any[]>([]);"""
    if st in s and "paymentMethods" not in s: s=s.replace(st,state,1)

    # Add queries after admin_settings query if present
    q="supabase.from('admin_settings').select('*'),"
    q2="""supabase.from('admin_settings').select('*'),
                supabase.from('payment_methods').select('*').order('display_name'),
                supabase.from('payment_orders').select('*').order('created_at',{ascending:false}).limit(100),
                supabase.from('room_settings').select('*').order('updated_at',{ascending:false}).limit(100),
                supabase.from('admin_feature_flags').select('*').order('key'),"""
    if q in s and "supabase.from('payment_methods')" not in s: s=s.replace(q,q2,1)

    # Detect common results tuple and inject state assignments
    m=re.search(r'const \[([^\]]+)\]=results;',s)
    if m and "paymentMethods" not in s[m.end():m.end()+2500]:
        names=[x.strip() for x in m.group(1).split(',')]
        if len(names)>=1:
            old=m.group(0); new=old+"\n              const _pc=results.slice("+str(len(names))+"); setPaymentMethods(_pc[0]?.data||[]); setPaymentOrders(_pc[1]?.data||[]); setRoomSettings(_pc[2]?.data||[]); setFeatureFlags(_pc[3]?.data||[]);"
            s=s.replace(old,new,1)

    # Insert branches before first tab branch after roles
    if "if(tab==='paymentControl')" not in s:
        pos=s.find("if(tab==='roles')")
        if pos<0: pos=s.find("if(tab===")
        branch=r'''if(tab==='paymentControl')return <><Back/><SectionHeader title="الدفع والتحصيل" icon="card-outline"/>
<View style={styles.card}><Text style={styles.h2}>طرق الدفع</Text>{paymentMethods.map((m:any)=><View style={styles.card} key={m.id}><Text style={styles.user}>{m.display_name}</Text><Text style={styles.muted}>{m.method_key} • {m.account_value}</Text></View>)}</View>
<View style={styles.card}><Text style={styles.h2}>طلبات الدفع</Text>{paymentOrders.slice(0,30).map((o:any)=><View style={styles.card} key={o.id}><Text style={styles.user}>{o.product_key} • {o.amount} جنيه</Text><Text style={styles.muted}>{o.method_key} • {o.status}</Text><TouchableOpacity style={styles.primary} onPress={async()=>{const{error}=await supabase.from('payment_orders').update({status:'approved',reviewed_by:(await supabase.auth.getSession()).data.session?.user?.id,reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',o.id);if(error)Alert.alert('خطأ',error.message);else{Alert.alert('تم','تم اعتماد الطلب');loadData();}}}><Text style={styles.primaryText}>اعتماد</Text></TouchableOpacity><TouchableOpacity style={styles.secondary} onPress={async()=>{const{error}=await supabase.from('payment_orders').update({status:'rejected',reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',o.id);if(error)Alert.alert('خطأ',error.message);else loadData();}}><Text style={styles.secondaryText}>رفض</Text></TouchableOpacity></View>)}</View></>;
if(tab==='roomControl')return <><Back/><SectionHeader title="تحكم الغرف" icon="radio-outline"/><View style={styles.card}><Text style={styles.h2}>الإعدادات المحفوظة</Text>{roomSettings.slice(0,50).map((r:any)=><View style={styles.card} key={r.room_id}><Text style={styles.user}>{r.room_id}</Text><Text style={styles.muted}>موسيقى: {r.music_enabled?'تشغيل':'إيقاف'} • صوت: {r.voice_enabled?'تشغيل':'إيقاف'} • شات: {r.text_enabled?'تشغيل':'إيقاف'} • تفاعلات: {r.reactions_enabled?'تشغيل':'إيقاف'}</Text></View>)}</View><TouchableOpacity style={styles.primary} onPress={()=>router.push('/room-tools')}><Text style={styles.primaryText}>فتح أدوات الغرفة</Text></TouchableOpacity></>;
if(tab==='featureControl')return <><Back/><SectionHeader title="مفاتيح الميزات" icon="toggle-outline"/><View style={styles.card}>{featureFlags.map((f:any)=><View style={styles.settingRow} key={f.key}><Text style={styles.label}>{f.key}</Text><Switch value={!!f.enabled} onValueChange={async(v:boolean)=>{const{error}=await supabase.from('admin_feature_flags').update({enabled:v,updated_at:new Date().toISOString()}).eq('key',f.key);if(error)Alert.alert('خطأ',error.message);else setFeatureFlags(x=>x.map(y=>y.key===f.key?{...y,enabled:v}:y))}}/></View>)}</View></>;
if(tab==='moderationControl')return <><Back/><SectionHeader title="مركز الأمان" icon="shield-outline"/><View style={styles.card}><Text style={styles.h2}>أدوات الحماية المفعلة</Text><Text style={styles.muted}>حدود الرسائل • Slow mode • التحكم في الصوت • إيقاف الميزات • مراجعة الدفع • إدارة الأدمن.</Text></View></>;'''
        if pos>=0: s=s[:pos]+branch+s[pos:]

    ADMIN.write_text(s)

write_payment()
write_room_tools()
patch_admin()
print('Wanas control center patch applied')
