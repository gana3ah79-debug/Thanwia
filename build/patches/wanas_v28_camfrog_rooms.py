from pathlib import Path
import re

ROOT=Path('app')
room=ROOT/'rooms/[id].tsx'
admin=ROOT/'admin-center.tsx'

# Camfrog-style room stage: seats, speaker state, member count, host toolbar.
stage=ROOT.parent/'src/components/WanasCamfrogStage.tsx'
stage.parent.mkdir(parents=True,exist_ok=True)
stage.write_text(r'''import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../lib/theme';

type P=any;
export function WanasCamfrogStage({people=[],room,isHost,onModerate,onGift,onOpenMembers,onRequestMic}:{people:P[];room:any;isHost:boolean;onModerate:(uid:string,action:string)=>void;onGift:()=>void;onOpenMembers:()=>void;onRequestMic:()=>void}){
 const host=people.find(p=>p.role==='host');
 const speakers=people.filter(p=>p.role==='speaker'||p.role==='host'||p.role==='cohost');
 const listeners=people.filter(p=>!['speaker','host','cohost'].includes(p.role));
 const max=Math.max(Number(room?.max_speakers||8),1);
 const seats=Array.from({length:max},(_,i)=>speakers[i]||null);
 return <View style={{marginTop:spacing.md,borderRadius:radius.xl,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,overflow:'hidden'}}>
  <View style={{padding:14,backgroundColor:colors.tint}}>
   <View style={{flexDirection:'row-reverse',alignItems:'center',justifyContent:'space-between'}}>
    <View style={{flexDirection:'row-reverse',alignItems:'center',gap:8}}><Text style={{fontSize:20}}>🎙️</Text><View><Text style={{color:colors.text,fontFamily:fonts.h2.fontFamily,fontSize:16,textAlign:'right'}}>{room?.name||'غرفة وَنَس'}</Text><Text style={{color:colors.textDim,fontFamily:fonts.bodyLight,fontSize:10,textAlign:'right'}}>{people.length} عضو • {speakers.length}/{max} مقعد</Text></View></View>
    <View style={{backgroundColor:colors.dangerSoft,borderRadius:999,paddingHorizontal:9,paddingVertical:5}}><Text style={{color:colors.danger,fontFamily:fonts.bodyBold,fontSize:10}}>● LIVE</Text></View>
   </View>
  </View>
  <View style={{padding:12}}>
   <View style={{alignItems:'center',paddingVertical:10}}><View style={{width:70,height:70,borderRadius:35,backgroundColor:colors.primarySoft,borderWidth:2,borderColor:colors.primary,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:30}}>👑</Text></View><Text style={{marginTop:6,color:colors.text,fontFamily:fonts.bodyBold}}>{host?.profile?.display_name||'مالك الغرفة'}</Text><Text style={{color:colors.gold,fontSize:10}}>HOST</Text></View>
   <View style={{flexDirection:'row-reverse',flexWrap:'wrap',justifyContent:'center',gap:9}}>
    {seats.map((p,i)=><Seat key={p?.id||String(i)} p={p} index={i} onModerate={onModerate} isHost={isHost}/>)}
   </View>
   <View style={{marginTop:12,paddingTop:10,borderTopWidth:1,borderTopColor:colors.border,flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center'}}>
    <Pressable onPress={onOpenMembers}><Text style={{color:colors.primary,fontFamily:fonts.bodyBold,fontSize:11}}>👥 كل الأعضاء ({listeners.length})</Text></Pressable>
    <View style={{flexDirection:'row-reverse',gap:7}}>
      <Pressable onPress={onRequestMic} style={{backgroundColor:colors.primary,paddingHorizontal:12,paddingVertical:8,borderRadius:10}}><Text style={{color:colors.onBrand,fontFamily:fonts.bodyBold,fontSize:11}}>✋ طلب المايك</Text></Pressable>
      <Pressable onPress={onGift} style={{backgroundColor:colors.gold,paddingHorizontal:12,paddingVertical:8,borderRadius:10}}><Text style={{color:'#111',fontFamily:fonts.bodyBold,fontSize:11}}>🎁 هدية</Text></Pressable>
    </View>
   </View>
  </View>
 </View>;
}
function Seat({p,index,onModerate,isHost}:{p:P;index:number;onModerate:(uid:string,a:string)=>void;isHost:boolean}){
 if(!p)return <View style={{width:72,height:72,borderRadius:36,borderWidth:1,borderStyle:'dashed',borderColor:colors.border,alignItems:'center',justifyContent:'center'}}><Text style={{color:colors.textFaint,fontSize:20}}>＋</Text><Text style={{color:colors.textFaint,fontSize:8}}>مقعد {index+1}</Text></View>;
 return <Pressable disabled={!isHost} onLongPress={()=>isHost&&onModerate(p.user_id,'mute')} style={{width:76,alignItems:'center'}}>
   <View style={{width:58,height:58,borderRadius:29,backgroundColor:p.is_muted?colors.dangerSoft:colors.primarySoft,borderWidth:2,borderColor:p.is_muted?colors.danger:colors.primary,alignItems:'center',justifyContent:'center'}}><Text style={{fontSize:24}}>🧑</Text>{p.is_muted&&<Text style={{position:'absolute',bottom:-3,right:-3,fontSize:12}}>🔇</Text>}</View>
   <Text numberOfLines={1} style={{color:colors.text,fontFamily:fonts.bodyBold,fontSize:9.5,marginTop:4,textAlign:'center'}}>{p.profile?.display_name||'متحدث'}</Text>
 </Pressable>
}
''')

# Add stage once. The existing room implementation exposes people, room, isHost and moderate().
if room.exists():
 s=room.read_text()
 if 'WanasCamfrogStage' not in s:
  marker="import { GiftSheet } from '../../src/components/GiftSheet';"
  if marker in s:s=s.replace(marker,marker+"\nimport { WanasCamfrogStage } from '../../src/components/WanasCamfrogStage';",1)
  aud="  const audience = people.filter((p) => p.role === 'listener');"
  if aud in s:
   s=s.replace(aud,aud+"\n  const requestMic = () => void moderate(profile?.id || '', 'raise_hand');",1)
  # insert immediately after first ScrollView/content container marker, avoiding hook-order issues
  render_marker="{isHost ? <RoomControlCenter"
  if render_marker in s:
   s=s.replace(render_marker,"<WanasCamfrogStage people={people} room={room} isHost={isHost} onModerate={(uid,a)=>void moderate(uid,a)} onGift={()=>{}} onOpenMembers={()=>{}} onRequestMic={requestMic}/>\n        "+render_marker,1)
  else:
   # fallback: insert before GiftSheet usage
   gift_marker="<GiftSheet"
   if gift_marker in s:s=s.replace(gift_marker,"<WanasCamfrogStage people={people} room={room} isHost={isHost} onModerate={(uid,a)=>void moderate(uid,a)} onGift={()=>{}} onOpenMembers={()=>{}} onRequestMic={requestMic}/>\n        "+gift_marker,1)
  room.write_text(s)

# Strengthen admin center with real room moderation screen.
if admin.exists():
 s=admin.read_text()
 if 'WANAS • ROOM CONTROL' not in s:
  s=s.replace("const[tab,setTab]=useState('home')","const[tab,setTab]=useState('home')")
  old="  {tab==='rooms'&&<View style={s.card}><Text style={s.h}>تحكم الغرف</Text>{d.rooms.map((r:any)=><View key={r.room_id} style={s.item}><Text style={s.user}>{r.room_id}</Text><Text style={s.log}>Voice {r.voice_enabled?'ON':'OFF'} • Music {r.music_enabled?'ON':'OFF'} • Chat {r.text_enabled?'ON':'OFF'} • Max {r.max_participants}</Text></View>)}</View>}"
  new="""  {tab==='rooms'&&<><View style={s.card}><Text style={s.h}>🎙️ WANAS • ROOM CONTROL</Text><Text style={s.log}>تحكم مباشر في المقاعد والمتحدثين والكتم والطرد والحظر وطلبات المايك.</Text></View>
  {d.rooms.map((r:any)=><AdminRoom key={r.room_id} r={r}/>)}</>}"""
  if old in s:s=s.replace(old,new,1)
  # Insert component before styles
  marker="const s=StyleSheet.create("
  comp=r"""function AdminRoom({r}:{r:any}){
 const[ps,setPs]=useState<any[]>([]); const[busy,setBusy]=useState(false);
 const load=async()=>{const q=await supabase.from('room_participants').select('id,user_id,role,is_muted,hand_raised,joined_at,profiles_public:profiles_public(*)').eq('room_id',r.room_id).order('joined_at',{ascending:true});setPs(q.data||[])};
 useEffect(()=>{load()},[]);
 const act=async(uid:string,action:string)=>{setBusy(true);let res=await supabase.rpc('rpc_room_moderate',{p_room_id:r.room_id,p_target_user_id:uid,p_action:action});if(res.error){const patch:any=action==='mute'?{is_muted:true}:action==='unmute'?{is_muted:false}:action==='approve_hand'||action==='promote'?{role:'speaker',hand_raised:false}:action==='demote'?{role:'listener'}:action==='lower_hand'?{hand_raised:false}:action==='remove'?{role:'removed'}:action==='ban'?{role:'banned'}:{};if(Object.keys(patch).length)res=await supabase.from('room_participants').update(patch).eq('room_id',r.room_id).eq('user_id',uid)}setBusy(false);if(res.error)Alert.alert('خطأ',res.error.message);else load()};
 return <View style={s.card}><Text style={s.user}>غرفة: {r.room_id}</Text><Text style={s.log}>الأعضاء: {ps.length} • المتحدثون: {ps.filter(p=>['speaker','host','cohost'].includes(p.role)).length} • طلبات المايك: {ps.filter(p=>p.hand_raised).length}</Text>{ps.map(p=><View key={p.id} style={s.item}><Text style={s.user}>{p.profiles_public?.display_name||p.user_id}</Text><Text style={s.log}>{p.role} {p.hand_raised?'• ✋ طالب مايك':''}</Text><View style={s.row}><TouchableOpacity disabled={busy} style={s.quick} onPress={()=>act(p.user_id,p.hand_raised?'approve_hand':'mute')}><Text style={s.w}>{p.hand_raised?'🎙️ قبول':'🔇 كتم'}</Text></TouchableOpacity><TouchableOpacity disabled={busy} style={s.quick} onPress={()=>act(p.user_id,'demote')}><Text style={s.w}>⬇️ تنزيل</Text></TouchableOpacity><TouchableOpacity disabled={busy} style={s.quick} onPress={()=>act(p.user_id,'remove')}><Text style={s.w}>🚫 طرد</Text></TouchableOpacity><TouchableOpacity disabled={busy} style={s.quick} onPress={()=>act(p.user_id,'ban')}><Text style={s.w}>⛔ حظر</Text></TouchableOpacity></View></View>)}</View>
}
"""
  if marker in s:s=s.replace(marker,comp+marker,1)
  admin.write_text(s)

print('V28 Camfrog rooms + admin room controls applied')
