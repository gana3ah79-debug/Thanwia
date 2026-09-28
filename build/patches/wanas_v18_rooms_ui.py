from pathlib import Path

# Wanas V18: modern room discovery + deterministic mic queue + host control center.
p=Path('app/(tabs)/rooms.tsx')
s=p.read_text()
if 'roomFilter' not in s:
    s=s.replace("import { Image, Pressable, Text, View } from 'react-native';","import { Image, Pressable, ScrollView, Text, View } from 'react-native';")
    s=s.replace("  const [err, setErr] = useState<string | null>(null);","  const [err, setErr] = useState<string | null>(null);\n  const [roomFilter, setRoomFilter] = useState<'all'|'active'|'private'|'mine'>('all');")
    s=s.replace("  const myRooms = rooms.filter((r) => r.host_id === profile?.id || r.kind === 'private');","  const myRooms = rooms.filter((r) => r.host_id === profile?.id || r.kind === 'private');\n  const filteredRooms = roomFilter === 'active' ? rooms.filter(r => (r.live_count ?? 0) > 0) : roomFilter === 'private' ? rooms.filter(r => r.kind === 'private') : roomFilter === 'mine' ? rooms.filter(r => r.host_id === profile?.id) : rooms;")
    s=s.replace("""      <Text style={{ fontFamily: fonts.h2.fontFamily, fontSize: 17, color: colors.text, textAlign: 'right', marginTop: spacing.xl, marginBottom: spacing.md }}>
        {ar.rooms.public}
      </Text>""","""      <View style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
        <Text style={{ fontFamily: fonts.h2.fontFamily, fontSize: 17, color: colors.text, textAlign: 'right', marginBottom: spacing.sm }}>اكتشف الغرف</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8,flexDirection:'row-reverse'}}>
          {([['all','✨ الكل'],['active','🔥 نشطة الآن'],['private','🔒 خاصة'],['mine','👑 غرفي']] as const).map(([k,label]) =>
            <Pressable key={k} onPress={()=>setRoomFilter(k)} style={{paddingHorizontal:14,paddingVertical:9,borderRadius:999,backgroundColor:roomFilter===k?colors.primary:colors.tint,borderWidth:1,borderColor:roomFilter===k?colors.primary:colors.border}}>
              <Text style={{color:roomFilter===k?colors.onBrand:colors.textDim,fontFamily:fonts.bodyBold,fontSize:11.5}}>{label}</Text>
            </Pressable>)}
        </ScrollView>
      </View>""")
    s=s.replace("{publicRooms.map((r) => <RoomCard key={r.id} r={r} />)}","{filteredRooms.map((r) => <RoomCard key={r.id} r={r} />)}")
    p.write_text(s)

p=Path('app/rooms/[id].tsx')
s=p.read_text()
if '🎙️ طلبات المايك' not in s:
    s=s.replace("import { GiftSheet } from '../../src/components/GiftSheet';","import { GiftSheet } from '../../src/components/GiftSheet';\nimport { RoomControlCenter } from '../../src/components/RoomControlCenter';")
    s=s.replace("  const audience = people.filter((p) => p.role === 'listener');","  const audience = people.filter((p) => p.role === 'listener');\n  const micQueue = people.filter(p => p.role === 'listener' && p.hand_raised).sort((a,b) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime());")
    start=s.index("        {isHost ? (\n          <Card style={{ marginTop: spacing.lg, borderColor: colors.gold + '44' }}>")
    end=s.index("        ) : null}", start)+len("        ) : null}")
    replacement="""        {isHost ? <RoomControlCenter
          queue={micQueue}
          stage={stage}
          maxSpeakers={room.max_speakers}
          onApprove={(uid)=>void moderate(uid,'approve_hand')}
          onReject={(uid)=>void moderate(uid,'lower_hand')}
          onMute={(uid)=>void moderate(uid,'mute')}
          onDemote={(uid)=>void moderate(uid,'demote')}
          onRemove={(uid)=>void moderate(uid,'remove')}
          onBan={(uid)=>void moderate(uid,'ban')}
        /> : null}"""
    s=s[:start]+replacement+s[end:]
    p.write_text(s)

Path('src/components/RoomControlCenter.tsx').write_text(r'''import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card } from './ui';
import { colors, fonts, radius, spacing } from '../lib/theme';
import type { RoomParticipant } from '../lib/types';

export function RoomControlCenter({queue,stage,maxSpeakers,onApprove,onReject,onMute,onDemote,onRemove,onBan}:{
 queue:RoomParticipant[];stage:RoomParticipant[];maxSpeakers:number;
 onApprove:(id:string)=>void;onReject:(id:string)=>void;onMute:(id:string)=>void;
 onDemote:(id:string)=>void;onRemove:(id:string)=>void;onBan:(id:string)=>void;
}){
 return <Card style={{marginTop:spacing.lg,borderColor:colors.primary+'55'}}>
  <View style={{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center'}}>
   <Text style={{fontFamily:fonts.displayBold,fontSize:15,color:colors.text}}>👑 مركز تحكم الغرفة</Text>
   <Text style={{fontFamily:fonts.bodyBold,fontSize:11,color:colors.primary}}>المسرح {stage.length}/{maxSpeakers}</Text>
  </View>
  <Text style={{fontFamily:fonts.bodyLight,fontSize:11.5,color:colors.textDim,textAlign:'right',marginTop:6}}>إدارة طلبات المايك والمتحدثين من مكان واحد.</Text>
  <View style={{marginTop:spacing.md,padding:spacing.md,borderRadius:radius.md,backgroundColor:colors.primarySoft,borderWidth:1,borderColor:colors.primary+'33'}}>
   <View style={{flexDirection:'row-reverse',justifyContent:'space-between'}}><Text style={{fontFamily:fonts.bodyBold,color:colors.text,fontSize:13}}>🎙️ طلبات المايك</Text><Text style={{color:colors.gold,fontFamily:fonts.bodyBold}}>{queue.length}</Text></View>
   {queue.length===0?<Text style={{color:colors.textFaint,fontFamily:fonts.bodyLight,fontSize:11,textAlign:'right',marginTop:8}}>لا توجد طلبات معلقة.</Text>:queue.map((p,i)=>
    <View key={p.id} style={{marginTop:8,padding:10,borderRadius:radius.md,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border}}>
     <View style={{flexDirection:'row-reverse',alignItems:'center',gap:8}}><Text style={{color:colors.primary,fontFamily:fonts.bodyBold}}>{i+1}</Text><Text numberOfLines={1} style={{flex:1,color:colors.text,fontFamily:fonts.bodyBold,textAlign:'right'}}>{p.profile?.display_name??'عضو'} ✋</Text></View>
     <View style={{flexDirection:'row-reverse',gap:6,marginTop:8}}>
      <Btn label="🎙️ قبول" onPress={()=>onApprove(p.user_id)} primary/><Btn label="✕ رفض" onPress={()=>onReject(p.user_id)}/>
     </View>
    </View>)}
  </View>
  {stage.filter(p=>p.role!=='host').length>0&&<View style={{marginTop:spacing.md}}>
   <Text style={{fontFamily:fonts.bodyBold,fontSize:12.5,color:colors.text,textAlign:'right',marginBottom:6}}>المتحدثون الحاليون</Text>
   {stage.filter(p=>p.role!=='host').map(p=><View key={p.id} style={{flexDirection:'row-reverse',alignItems:'center',gap:6,paddingVertical:6}}>
    <Text numberOfLines={1} style={{flex:1,color:colors.textDim,fontFamily:fonts.body,fontSize:12,textAlign:'right'}}>{p.profile?.display_name??'متحدث'}</Text>
    <Small icon={p.is_muted?'🔊':'🔇'} onPress={()=>onMute(p.user_id)}/><Small icon="⬇️" onPress={()=>onDemote(p.user_id)}/><Small icon="🚫" danger onPress={()=>onRemove(p.user_id)}/><Small icon="⛔" danger onPress={()=>onBan(p.user_id)}/>
   </View>)}
  </View>}
 </Card>;
}
function Btn({label,onPress,primary}:{label:string;onPress:()=>void;primary?:boolean}){return <Pressable onPress={onPress} style={{flex:1,alignItems:'center',paddingVertical:8,borderRadius:10,backgroundColor:primary?colors.primary:colors.tint,borderWidth:1,borderColor:primary?colors.primary:colors.border}}><Text style={{color:primary?colors.onBrand:colors.textDim,fontFamily:fonts.bodyBold,fontSize:11}}>{label}</Text></Pressable>}
function Small({icon,onPress,danger}:{icon:string;onPress:()=>void;danger?:boolean}){return <Pressable onPress={onPress} style={{width:32,height:32,borderRadius:16,alignItems:'center',justifyContent:'center',backgroundColor:danger?colors.dangerSoft:colors.tint,borderWidth:1,borderColor:danger?colors.danger:colors.border}}><Text>{icon}</Text></Pressable>}
''')

p=Path('src/lib/theme.ts');s=p.read_text()
s=s.replace("brand: ['#7C5CFF', '#FF5C9D']","brand: ['#6C63FF', '#00C2FF']")
s=s.replace("brandSoft: ['rgba(124,92,255,0.35)', 'rgba(255,92,157,0.25)']","brandSoft: ['rgba(108,99,255,0.34)', 'rgba(0,194,255,0.20)']")
s=s.replace("brandSoft: ['rgba(124,92,255,0.18)', 'rgba(255,92,157,0.14)']","brandSoft: ['rgba(108,99,255,0.16)', 'rgba(0,194,255,0.12)']")
p.write_text(s)
print('V18 patch complete')
