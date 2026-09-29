from pathlib import Path

ADMIN = Path('app/admin.tsx')
ROUTE = Path('app/admin-center.tsx')

ROUTE.parent.mkdir(parents=True, exist_ok=True)
ROUTE.write_text(r'''import React,{useEffect,useMemo,useState}from'react';
import{Alert,RefreshControl,SafeAreaView,ScrollView,StyleSheet,Switch,Text,TextInput,TouchableOpacity,View}from'react-native';
import{router}from'expo-router';
import{supabase}from'../src/lib/wanasSupabase';

const C={bg:'#070A12',panel:'#0E1422',panel2:'#121A2B',line:'#202B42',text:'#F7F9FF',muted:'#8E9AB2',primary:'#7C5CFF',mint:'#23D5AB',pink:'#FF4F9A',gold:'#FFC857'};
const dataOf=(r:any)=>r?.data||[];
export default function AdminCenter(){
 const[d,setD]=useState<any>({users:[],payments:[],tickets:[],flags:[],rooms:[],logs:[],ann:[]});
 const[tab,setTab]=useState('home'),[loading,setLoading]=useState(false),[search,setSearch]=useState(''),[announcement,setAnnouncement]=useState('');
 const load=async()=>{
  setLoading(true);
  const r=await Promise.all([
   supabase.from('profiles').select('id,username,display_name,is_paid,is_banned,created_at').order('created_at',{ascending:false}).limit(80),
   supabase.from('payment_orders').select('*').order('created_at',{ascending:false}).limit(80),
   supabase.from('support_tickets').select('*').order('created_at',{ascending:false}).limit(80),
   supabase.from('admin_feature_flags').select('*').order('key'),
   supabase.from('room_settings').select('*').order('updated_at',{ascending:false}).limit(80),
   supabase.from('admin_audit_logs').select('*').order('created_at',{ascending:false}).limit(100),
   supabase.from('admin_announcements').select('*').order('created_at',{ascending:false}).limit(40)
  ]);
  setD({users:dataOf(r[0]),payments:dataOf(r[1]),tickets:dataOf(r[2]),flags:dataOf(r[3]),rooms:dataOf(r[4]),logs:dataOf(r[5]),ann:dataOf(r[6])});setLoading(false)
 };
 useEffect(()=>{load()},[]);
 const st=useMemo(()=>({users:d.users.length,paid:d.users.filter((x:any)=>x.is_paid).length,banned:d.users.filter((x:any)=>x.is_banned).length,pending:d.payments.filter((x:any)=>x.status==='pending').length,tickets:d.tickets.filter((x:any)=>!['closed','resolved'].includes(x.status)).length,rooms:d.rooms.length}),[d]);
 const audit=async(action:string,meta:any={})=>{const{data:s}=await supabase.auth.getSession();if(s.session?.user?.id)await supabase.from('admin_audit_logs').insert({admin_id:s.session.user.id,action,meta})};
 const announce=async()=>{if(!announcement.trim())return;const{data:s}=await supabase.auth.getSession();const{error}=await supabase.from('admin_announcements').insert({title:'إعلان الإدارة',body:announcement.trim(),created_by:s.session?.user?.id,target:'all',active:true});if(error)Alert.alert('خطأ',error.message);else{await audit('broadcast_announcement',{body:announcement.trim()});setAnnouncement('');Alert.alert('تم','تم نشر الإعلان');load()}};
 const flag=async(f:any,v:boolean)=>{const{error}=await supabase.from('admin_feature_flags').update({enabled:v,updated_at:new Date().toISOString()}).eq('key',f.key);if(error)Alert.alert('خطأ',error.message);else{await audit('feature_flag',{key:f.key,enabled:v});setD((x:any)=>({...x,flags:x.flags.map((q:any)=>q.key===f.key?{...q,enabled:v}:q)}))}};
 const approve=async(o:any)=>{const{data:s}=await supabase.auth.getSession();const{error}=await supabase.from('payment_orders').update({status:'approved',reviewed_by:s.session?.user?.id,reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',o.id);if(error)Alert.alert('خطأ',error.message);else{await audit('approve_payment',{id:o.id,user_id:o.user_id,amount:o.amount});load()}};
 const support=async(t:any,status:string)=>{const{error}=await supabase.from('support_tickets').update({status,updated_at:new Date().toISOString()}).eq('id',t.id);if(error)Alert.alert('خطأ',error.message);else{await audit('ticket_status',{id:t.id,status});load()}};
 const users=d.users.filter((u:any)=>!search||String(u.username||u.display_name||u.id).toLowerCase().includes(search.toLowerCase()));
 const nav=[['home','الرئيسية'],['users','المستخدمون'],['payments','المدفوعات'],['rooms','الغرف'],['flags','الميزات'],['support','الدعم'],['logs','السجل']];
 return <SafeAreaView style={s.root}><ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={load}/>} contentContainerStyle={s.c}>
  <TouchableOpacity style={s.back} onPress={()=>router.back()}><Text style={s.w}>‹ رجوع</Text></TouchableOpacity>
  <View style={s.hero}><Text style={s.badge}>WANAS • ADMIN COMMAND CENTER</Text><Text style={s.title}>لوحة التحكم المركزية</Text><Text style={s.sub}>إدارة المستخدمين والغرف والمدفوعات والدعم والميزات والإعلانات.</Text></View>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.nav}>{nav.map(([k,t])=><TouchableOpacity key={k} onPress={()=>setTab(k)} style={[s.navBtn,tab===k&&s.navOn]}><Text style={[s.navT,tab===k&&s.w]}>{t}</Text></TouchableOpacity>)}</ScrollView>
  {tab==='home'&&<><View style={s.grid}>{[['المستخدمون',st.users],['مدفوعات معلقة',st.pending],['دعم مفتوح',st.tickets],['الغرف',st.rooms],['مدفوع',st.paid],['محظور',st.banned]].map(([t,v])=><View style={s.stat} key={String(t)}><Text style={s.statV}>{String(v)}</Text><Text style={s.statT}>{String(t)}</Text></View>)}</View>
   <View style={s.card}><Text style={s.h}>📣 إعلان عام</Text><TextInput value={announcement} onChangeText={setAnnouncement} placeholder="اكتب الإعلان..." placeholderTextColor={C.muted} multiline style={[s.input,{minHeight:80}]}/><TouchableOpacity style={s.primary} onPress={announce}><Text style={s.w}>نشر الإعلان</Text></TouchableOpacity></View>
   <View style={s.card}><Text style={s.h}>⚡ تحكم سريع</Text><Text style={s.log}>الدفع • الغرف • مفاتيح الميزات • الدعم • سجل الإدارة متاحة من الشريط.</Text></View></>}
  {tab==='users'&&<><View style={s.card}><Text style={s.h}>المستخدمون</Text><TextInput value={search} onChangeText={setSearch} placeholder="بحث بالاسم أو المعرف" placeholderTextColor={C.muted} style={s.input}/></View>{users.slice(0,60).map((u:any)=><View style={s.card} key={u.id}><Text style={s.user}>{u.display_name||u.username||u.id}</Text><Text style={s.log}>{u.id} • {u.is_paid?'مدفوع':'مجاني'} • {u.is_banned?'محظور':'نشط'}</Text></View>)}</>}
  {tab==='payments'&&<>{d.payments.slice(0,60).map((o:any)=><View style={s.card} key={o.id}><Text style={s.user}>{o.product_key||'خدمة'} • {o.amount} جنيه</Text><Text style={s.log}>{o.method_key} • {o.status} • {o.transaction_ref||'بدون مرجع'}</Text>{o.status==='pending'&&<TouchableOpacity style={s.primary} onPress={()=>approve(o)}><Text style={s.w}>اعتماد الدفع</Text></TouchableOpacity>}</View>)}</>}
  {tab==='rooms'&&<View style={s.card}><Text style={s.h}>تحكم الغرف</Text>{d.rooms.map((r:any)=><View key={r.room_id} style={s.item}><Text style={s.user}>{r.room_id}</Text><Text style={s.log}>Voice {r.voice_enabled?'ON':'OFF'} • Music {r.music_enabled?'ON':'OFF'} • Chat {r.text_enabled?'ON':'OFF'} • Max {r.max_participants}</Text></View>)}</View>}
  {tab==='flags'&&<View style={s.card}><Text style={s.h}>مفاتيح الميزات</Text>{d.flags.map((f:any)=><View style={s.switchRow} key={f.key}><Text style={s.user}>{f.key}</Text><Switch value={!!f.enabled} onValueChange={v=>flag(f,v)}/></View>)}</View>}
  {tab==='support'&&<>{d.tickets.slice(0,60).map((t:any)=><View style={s.card} key={t.id}><Text style={s.user}>{t.subject||t.title||'طلب دعم'}</Text><Text style={s.log}>{t.status} • {t.priority||'normal'}</Text><Text style={s.log}>{t.message||t.body||''}</Text><View style={s.row}><TouchableOpacity style={s.quick} onPress={()=>support(t,'in_progress')}><Text style={s.w}>قيد المتابعة</Text></TouchableOpacity><TouchableOpacity style={s.quick} onPress={()=>support(t,'resolved')}><Text style={s.w}>حل الشكوى</Text></TouchableOpacity></View></View>)}</>}
  {tab==='logs'&&<View style={s.card}><Text style={s.h}>سجل الإدارة</Text>{d.logs.map((x:any)=><Text style={s.log} key={x.id}>{x.created_at} • {x.action} • {JSON.stringify(x.meta||{})}</Text>)}</View>}
 </ScrollView></SafeAreaView>
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:C.bg},c:{padding:16,paddingBottom:50},back:{alignSelf:'flex-start',backgroundColor:C.panel2,padding:10,borderRadius:10,marginBottom:10},w:{color:C.text,fontWeight:'900'},hero:{backgroundColor:C.panel,borderWidth:1,borderColor:C.line,borderRadius:22,padding:19,marginBottom:10},badge:{color:C.mint,fontSize:11,fontWeight:'900'},title:{color:C.text,fontSize:27,fontWeight:'900',textAlign:'right',marginTop:8},sub:{color:C.muted,textAlign:'right',marginTop:7,lineHeight:21},nav:{marginBottom:8},navBtn:{backgroundColor:C.panel,padding:11,borderRadius:12,marginRight:6},navOn:{backgroundColor:C.primary},navT:{color:C.muted,fontWeight:'800'},grid:{flexDirection:'row',flexWrap:'wrap',gap:8},stat:{width:'31.5%',backgroundColor:C.panel,padding:13,borderRadius:15,borderWidth:1,borderColor:C.line},statV:{color:C.text,fontSize:23,fontWeight:'900'},statT:{color:C.muted,fontSize:10,marginTop:4},card:{backgroundColor:C.panel,borderWidth:1,borderColor:C.line,borderRadius:16,padding:14,marginVertical:5},h:{color:C.text,fontSize:17,fontWeight:'900',textAlign:'right',marginBottom:8},input:{backgroundColor:'#0A101C',color:C.text,borderWidth:1,borderColor:C.line,borderRadius:10,padding:12,textAlign:'right',marginVertical:5},primary:{backgroundColor:C.primary,padding:13,borderRadius:11,alignItems:'center',marginTop:7},log:{color:C.muted,fontSize:12,lineHeight:20,textAlign:'right',marginTop:4},user:{color:C.text,fontWeight:'900',textAlign:'right'},item:{paddingVertical:9,borderBottomWidth:1,borderBottomColor:C.line},switchRow:{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center',paddingVertical:10,borderBottomWidth:1,borderBottomColor:C.line},row:{flexDirection:'row',justifyContent:'flex-end',gap:6},quick:{backgroundColor:C.panel2,padding:10,borderRadius:9,marginTop:7}});
''')

if ADMIN.exists():
 s=ADMIN.read_text()
 if "router.push('/admin-center')" not in s and 'router.push("/admin-center")' not in s:
  if "expo-router" not in s: s="import { router } from 'expo-router';\n"+s
  anchor="<Back/>"
  btn='<TouchableOpacity style={styles.primary} onPress={()=>router.push("/admin-center")}><Text style={styles.primaryText}>🚀 مركز إدارة وَنَس</Text></TouchableOpacity>'
  if anchor in s:s=s.replace(anchor,anchor+btn,1)
  else:s=s.replace("return <",btn+"<",1)
  ADMIN.write_text(s)
print("V26 admin command center applied")
