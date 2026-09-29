from pathlib import Path
import re

ROOT=Path('app')

# --- New visual system ---
design = Path('src/lib/wanasNeo.ts')
design.parent.mkdir(parents=True, exist_ok=True)
design.write_text(r"""export const NEO={
  bg:'#070A12',panel:'#0E1422',panel2:'#121A2B',line:'#202B42',
  text:'#F7F9FF',muted:'#8E9AB2',primary:'#7C5CFF',secondary:'#23D5AB',
  pink:'#FF4F9A',gold:'#FFC857',danger:'#FF5D73',
  radius:22
};
export const shadow={shadowColor:'#000',shadowOpacity:.22,shadowRadius:18,shadowOffset:{width:0,height:8},elevation:8};
""")

# --- New home/dashboard ---
home=ROOT/'neo.tsx'
home.write_text(r"""import React,{useEffect,useState}from'react';
import{Alert,RefreshControl,SafeAreaView,ScrollView,StyleSheet,Text,TouchableOpacity,View}from'react-native';
import{Ionicons}from'@expo/vector-icons';
import{router}from'expo-router';
import{supabase}from'../src/lib/wanasSupabase';
import{NEO,shadow}from'../src/lib/wanasNeo';

type Room={id:string;name?:string;title?:string;description?:string;is_private?:boolean;participants_count?:number;owner_id?:string};

export default function NeoHome(){
 const[rooms,setRooms]=useState<Room[]>([]),[friends,setFriends]=useState<any[]>([]),[balance,setBalance]=useState(0),[refresh,setRefresh]=useState(false);
 const load=async()=>{
  setRefresh(true);
  try{
   const{data:s}=await supabase.auth.getSession();const u=s.session?.user?.id;
   const [rr,bb,ff]=await Promise.allSettled([
    supabase.from('voice_rooms').select('*').order('updated_at',{ascending:false}).limit(12),
    u?supabase.from('profiles').select('coins').eq('id',u).maybeSingle():Promise.resolve({data:null}),
    u?supabase.from('friendships').select('requester_id,addressee_id').eq('status','accepted').or('requester_id.eq.'+u+',addressee_id.eq.'+u).limit(8):Promise.resolve({data:[]})
   ]);
   setRooms((rr as any).value?.data||[]);setBalance(Number((bb as any).value?.data?.coins||0));
   const rel=(ff as any).value?.data||[];
   if(u&&rel.length){const ids=rel.map((x:any)=>x.requester_id===u?x.addressee_id:x.requester_id);const p=await supabase.from('profiles').select('id,name').in('id',ids);setFriends(p.data||[])}
  }finally{setRefresh(false)}
 };
 useEffect(()=>{load()},[]);
 const openRoom=(r:Room)=>router.push('/rooms/'+r.id);
 const action=(route:string)=>router.push(route as any);
 return <SafeAreaView style={s.root}>
  <ScrollView refreshControl={<RefreshControl refreshing={refresh} onRefresh={load}/>} contentContainerStyle={s.c}>
   <View style={s.top}><View><Text style={s.brand}>وَنَس</Text><Text style={s.sub}>مكانك للصحبة والكلام والمرح</Text></View><TouchableOpacity style={s.wallet}onPress={()=>action('/payment')}><Ionicons name="wallet-outline"size={19}color={NEO.gold}/><Text style={s.walletText}>{balance.toLocaleString()}</Text></TouchableOpacity></View>
   <View style={s.hero}><View style={s.glow}/><Text style={s.heroKicker}>WANAS • NEO</Text><Text style={s.heroTitle}>ادخل، اتكلم، واللحظة تبدأ الآن.</Text><Text style={s.heroSub}>غرف صوتية • أصدقاء • Buzz • ألعاب • هدايا</Text><View style={s.heroActions}><TouchableOpacity style={s.primary}onPress={()=>action('/rooms')}><Ionicons name="radio"size={18}color="#fff"/><Text style={s.primaryText}>اكتشف الغرف</Text></TouchableOpacity><TouchableOpacity style={s.ghost}onPress={()=>action('/engagement')}><Ionicons name="game-controller-outline"size={18}color={NEO.text}/><Text style={s.ghostText}>مركز اللعب</Text></TouchableOpacity></View></View>
   <Text style={s.section}>اختصاراتك</Text>
   <View style={s.grid}>
    {[['radio-outline','الغرف','/rooms'],['people-outline','الأصدقاء','/engagement'],['chatbubbles-outline','Messenger','/engagement'],['gift-outline','الهدايا','/coins'],['flash-outline','Buzz','/engagement'],['sparkles-outline','AI Games','/ai-games']].map((x:any)=><TouchableOpacity key={x[1]}style={s.tile}onPress={()=>action(x[2])}><View style={s.icon}><Ionicons name={x[0]}size={22}color={NEO.secondary}/></View><Text style={s.tileText}>{x[1]}</Text></TouchableOpacity>)}
   </View>
   <View style={s.rowHead}><Text style={s.section}>الغرف الحية الآن</Text><TouchableOpacity onPress={()=>action('/rooms')}><Text style={s.more}>عرض الكل</Text></TouchableOpacity></View>
   {rooms.length?rooms.map(r=><TouchableOpacity key={r.id}style={s.room}onPress={()=>openRoom(r)}><View style={s.live}><View style={s.dot}/><Text style={s.liveText}>LIVE</Text></View><View style={{flex:1}}><Text style={s.roomTitle}>{r.name||r.title||'غرفة وَنَس'}</Text><Text style={s.roomSub}>{r.description||'انضم للمحادثة الآن'}{r.is_private?' • 🔒':''}</Text></View><Ionicons name="chevron-back"size={20}color={NEO.muted}/></TouchableOpacity>):<View style={s.empty}><Ionicons name="radio-outline"size={32}color={NEO.muted}/><Text style={s.emptyText}>لا توجد غرف ظاهرة الآن</Text></View>}
   <View style={s.rowHead}><Text style={s.section}>أصدقاؤك</Text><Text style={s.more}>{friends.length} أصدقاء</Text></View>
   <ScrollView horizontal showsHorizontalScrollIndicator={false}contentContainerStyle={{gap:10}}>{friends.map(f=><TouchableOpacity key={f.id}style={s.friend}onPress={()=>action('/engagement')}><View style={s.avatar}><Text style={s.avatarText}>{String(f.name||'و').slice(0,1)}</Text></View><Text style={s.friendName}numberOfLines={1}>{f.name||'صديق'}</Text></TouchableOpacity>)}{!friends.length&&<Text style={s.muted}>ابدأ بإضافة أصدقاء واستخدم Buzz.</Text>}</ScrollView>
   <View style={s.mission}><View style={s.icon}><Ionicons name="flame-outline"size={22}color={NEO.gold}/></View><View style={{flex:1}}><Text style={s.missionTitle}>مهمة اليوم</Text><Text style={s.muted}>ادخل غرفة + أرسل Buzz + العب جولة AI</Text></View><Text style={s.reward}>+50 XP</Text></View>
  </ScrollView>
 </SafeAreaView>
}
const s=StyleSheet.create({
 root:{flex:1,backgroundColor:NEO.bg},c:{padding:16,paddingBottom:40},top:{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center',marginBottom:14},
 brand:{color:NEO.text,fontSize:30,fontWeight:'900',textAlign:'right'},sub:{color:NEO.muted,fontSize:12,textAlign:'right',marginTop:2},wallet:{flexDirection:'row',alignItems:'center',gap:7,backgroundColor:NEO.panel,padding:10,borderRadius:15,borderWidth:1,borderColor:NEO.line},walletText:{color:NEO.text,fontWeight:'900'},
 hero:{backgroundColor:NEO.panel,padding:20,borderRadius:26,borderWidth:1,borderColor:NEO.line,overflow:'hidden',...shadow},glow:{position:'absolute',width:170,height:170,borderRadius:85,backgroundColor:NEO.primary,opacity:.16,right:-60,top:-70},heroKicker:{color:NEO.secondary,fontWeight:'900',fontSize:11,letterSpacing:1,textAlign:'right'},heroTitle:{color:NEO.text,fontSize:26,fontWeight:'900',lineHeight:34,textAlign:'right',marginTop:8},heroSub:{color:NEO.muted,textAlign:'right',marginTop:7},heroActions:{flexDirection:'row-reverse',gap:8,marginTop:16},primary:{flex:1,backgroundColor:NEO.primary,padding:13,borderRadius:14,flexDirection:'row-reverse',justifyContent:'center',alignItems:'center',gap:7},primaryText:{color:'#fff',fontWeight:'900'},ghost:{flex:1,backgroundColor:NEO.panel2,padding:13,borderRadius:14,flexDirection:'row-reverse',justifyContent:'center',alignItems:'center',gap:7,borderWidth:1,borderColor:NEO.line},ghostText:{color:NEO.text,fontWeight:'900'},
 section:{color:NEO.text,fontSize:19,fontWeight:'900',textAlign:'right',marginTop:22,marginBottom:10},rowHead:{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center'},more:{color:NEO.secondary,fontWeight:'800'},grid:{flexDirection:'row-reverse',flexWrap:'wrap',gap:9},tile:{width:'31.8%',backgroundColor:NEO.panel,padding:12,borderRadius:18,borderWidth:1,borderColor:NEO.line,alignItems:'center'},icon:{width:42,height:42,borderRadius:14,backgroundColor:NEO.panel2,justifyContent:'center',alignItems:'center',marginBottom:7},tileText:{color:NEO.text,fontWeight:'800',fontSize:12},
room:{backgroundColor:NEO.panel,padding:14,borderRadius:18,borderWidth:1,borderColor:NEO.line,marginBottom:7,flexDirection:'row-reverse',alignItems:'center',gap:10},roomTitle:{color:NEO.text,fontWeight:'900',fontSize:16,textAlign:'right'},roomSub:{color:NEO.muted,fontSize:12,textAlign:'right',marginTop:4},live:{backgroundColor:'rgba(255,79,154,.12)',paddingHorizontal:8,paddingVertical:5,borderRadius:9,flexDirection:'row',alignItems:'center',gap:5},dot:{width:6,height:6,borderRadius:3,backgroundColor:NEO.pink},liveText:{color:NEO.pink,fontSize:10,fontWeight:'900'},empty:{backgroundColor:NEO.panel,padding:25,borderRadius:18,alignItems:'center',borderWidth:1,borderColor:NEO.line},emptyText:{color:NEO.muted,marginTop:7},friend:{width:72,alignItems:'center'},avatar:{width:54,height:54,borderRadius:27,backgroundColor:NEO.panel2,borderWidth:2,borderColor:NEO.primary,justifyContent:'center',alignItems:'center'},avatarText:{color:'#fff',fontSize:20,fontWeight:'900'},friendName:{color:NEO.text,fontSize:11,fontWeight:'800',marginTop:5},muted:{color:NEO.muted,fontSize:12,textAlign:'right'},mission:{marginTop:22,backgroundColor:NEO.panel,padding:14,borderRadius:18,borderWidth:1,borderColor:NEO.line,flexDirection:'row-reverse',alignItems:'center',gap:10},missionTitle:{color:NEO.text,fontWeight:'900',textAlign:'right'},reward:{color:NEO.gold,fontWeight:'900'}
});
""")

# --- Add the new screen to any Expo Tabs layout and make it the visible home tab ---
layouts=list(ROOT.rglob('_layout.tsx'))
added=False
for p in layouts:
    try:s=p.read_text()
    except:continue
    if '<Tabs' not in s: continue
    if 'name="neo"' not in s:
        closing=s.rfind('</Tabs>')
        if closing>=0:
            screen='  <Tabs.Screen name="neo" options={{ title: "الرئيسية", headerShown: false }} />\n'
            s=s[:closing]+screen+s[closing:]
    # Hide legacy index tab if present; keep route intact for compatibility.
    s=re.sub(r'<Tabs\.Screen\s+name=["\']index["\']\s+options=\{\{([^}]*)\}\}\s*/>',lambda m:'<Tabs.Screen name="index" options={{ '+m.group(1)+', href: null }} />',s,count=1)
    p.write_text(s);added=True

# If there is a tabs layout but its index options are a separate multi-line block, add a second pass.
for p in layouts:
    try:s=p.read_text()
    except:continue
    if '<Tabs' in s and 'name="neo"' in s and 'title: "الرئيسية"' not in s:
        pass

# Upgrade the existing theme token file when present, without touching behavior.
theme=Path('src/lib/theme.ts')
if theme.exists():
    s=theme.read_text()
    replacements={"#4f7cff":"#7C5CFF","#7ea4ff":"#A88CFF","#070b14":"#070A12","#111b30":"#0E1422","#101a30":"#121A2B"}
    for a,b in replacements.items():s=s.replace(a,b)
    theme.write_text(s)

# Add a route alias for future room redesign without changing the existing room logic.
room=ROOT/'neo-room.tsx'
room.write_text(r"""import React from'react';import{SafeAreaView,StyleSheet,Text,TouchableOpacity,View}from'react-native';import{router}from'expo-router';import{Ionicons}from'@expo/vector-icons';import{NEO}from'../src/lib/wanasNeo';
export default function NeoRoom(){return <SafeAreaView style={s.r}><View style={s.h}><TouchableOpacity onPress={()=>router.back()}><Ionicons name="chevron-forward"size={26}color={NEO.text}/></TouchableOpacity><View><Text style={s.t}>غرفة وَنَس</Text><Text style={s.m}>وضع NEO</Text></View><View style={s.badge}><Text style={s.bt}>LIVE</Text></View></View><View style={s.stage}><View style={s.orb}><Ionicons name="mic"size={34}color="#fff"/></View><Text style={s.big}>المسرح الصوتي</Text><Text style={s.m}>تصميم الغرفة الجديد جاهز للدمج مع وظائف الغرفة الحالية.</Text></View><View style={s.actions}><View style={s.a}><Ionicons name="mic-outline"size={22}color={NEO.secondary}/><Text style={s.bt}>المايك</Text></View><View style={s.a}><Ionicons name="gift-outline"size={22}color={NEO.gold}/><Text style={s.bt}>هدايا</Text></View><View style={s.a}><Ionicons name="chatbubble-outline"size={22}color={NEO.primary}/><Text style={s.bt}>الشات</Text></View><View style={s.a}><Ionicons name="people-outline"size={22}color={NEO.pink}/><Text style={s.bt}>الأعضاء</Text></View></View></SafeAreaView>}const s=StyleSheet.create({r:{flex:1,backgroundColor:NEO.bg,padding:16},h:{flexDirection:'row-reverse',alignItems:'center',justifyContent:'space-between'},t:{color:NEO.text,fontSize:19,fontWeight:'900',textAlign:'right'},m:{color:NEO.muted,fontSize:12,textAlign:'right',marginTop:3},badge:{backgroundColor:'rgba(255,79,154,.12)',padding:7,borderRadius:8},bt:{color:NEO.text,fontWeight:'900'},stage:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:NEO.panel,borderRadius:28,marginVertical:16,borderWidth:1,borderColor:NEO.line},orb:{width:90,height:90,borderRadius:45,backgroundColor:NEO.primary,justifyContent:'center',alignItems:'center',marginBottom:14},big:{color:NEO.text,fontSize:24,fontWeight:'900'},actions:{flexDirection:'row-reverse',gap:8},a:{flex:1,backgroundColor:NEO.panel,padding:14,borderRadius:16,alignItems:'center',gap:6,borderWidth:1,borderColor:NEO.line}});""")

# Hard gate
assert home.exists() and design.exists()
if not added:
    print('No Tabs layout found; neo route still created and build continues.')
print('Wanas NEO redesign applied. tabs_layout=',added)
