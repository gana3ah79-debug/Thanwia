from pathlib import Path
import re,sys
ROOT=Path('.')

room=ROOT/'rooms/[id].tsx'
if room.exists():
    s=room.read_text()
    if "RoomControlCenter" not in s:
        s=s.replace("import { GiftSheet } from '../../src/components/GiftSheet';","import { GiftSheet } from '../../src/components/GiftSheet';\nimport { RoomControlCenter } from '../../src/components/RoomControlCenter';")
    if "const micQueue =" not in s:
        s=s.replace("  const audience = people.filter((p) => p.role === 'listener');","  const audience = people.filter((p) => p.role === 'listener');\n  const micQueue = people.filter((p) => p.role === 'listener' && p.hand_raised).sort((a,b) => new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime());")
    old=re.search(r"        \{isHost \? \(\s*<Card style=\{\{ marginTop: spacing\.lg, borderColor: colors\.gold \+ '44' \}\}>.*?        \) : null\}",s,re.S)
    if old:
        repl="""        {isHost ? <RoomControlCenter
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
        s=s[:old.start()]+repl+s[old.end():]
    room.write_text(s)

comp=ROOT.parent/'src/components/RoomControlCenter.tsx'
comp.parent.mkdir(parents=True,exist_ok=True)
comp.write_text(r'''import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card } from './ui';
import { colors, fonts, radius, spacing } from '../lib/theme';
import type { RoomParticipant } from '../lib/types';
export function RoomControlCenter({queue,stage,maxSpeakers,onApprove,onReject,onMute,onDemote,onRemove,onBan}:{queue:RoomParticipant[];stage:RoomParticipant[];maxSpeakers:number;onApprove:(id:string)=>void;onReject:(id:string)=>void;onMute:(id:string)=>void;onDemote:(id:string)=>void;onRemove:(id:string)=>void;onBan:(id:string)=>void;}){
 return <Card style={{marginTop:spacing.lg,borderColor:colors.primary+'55'}}>
  <View style={{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center'}}><Text style={{fontFamily:fonts.displayBold,fontSize:15,color:colors.text}}>👑 مركز تحكم الغرفة</Text><Text style={{fontFamily:fonts.bodyBold,fontSize:11,color:colors.primary}}>المسرح {stage.length}/{maxSpeakers}</Text></View>
  <View style={{marginTop:spacing.md,padding:spacing.md,borderRadius:radius.md,backgroundColor:colors.primarySoft,borderWidth:1,borderColor:colors.primary+'33'}}>
   <View style={{flexDirection:'row-reverse',justifyContent:'space-between'}}><Text style={{fontFamily:fonts.bodyBold,color:colors.text,fontSize:13}}>🎙️ طلبات المايك</Text><Text style={{color:colors.gold,fontFamily:fonts.bodyBold}}>{queue.length}</Text></View>
   {queue.length===0?<Text style={{color:colors.textFaint,fontFamily:fonts.bodyLight,fontSize:11,textAlign:'right',marginTop:8}}>لا توجد طلبات معلقة.</Text>:queue.map((p,i)=><View key={p.id} style={{marginTop:8,padding:10,borderRadius:radius.md,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border}}><View style={{flexDirection:'row-reverse',alignItems:'center',gap:8}}><Text style={{color:colors.primary,fontFamily:fonts.bodyBold}}>{i+1}</Text><Text numberOfLines={1} style={{flex:1,color:colors.text,fontFamily:fonts.bodyBold,textAlign:'right'}}>{p.profile?.display_name??'عضو'} ✋</Text></View><View style={{flexDirection:'row-reverse',gap:6,marginTop:8}}><Btn label="🎙️ قبول" onPress={()=>onApprove(p.user_id)} primary/><Btn label="✕ رفض" onPress={()=>onReject(p.user_id)}/></View></View>)}
  </View>
  {stage.filter(p=>p.role!=='host').length>0&&<View style={{marginTop:spacing.md}}><Text style={{fontFamily:fonts.bodyBold,fontSize:12.5,color:colors.text,textAlign:'right',marginBottom:6}}>المتحدثون الحاليون</Text>{stage.filter(p=>p.role!=='host').map(p=><View key={p.id} style={{flexDirection:'row-reverse',alignItems:'center',gap:6,paddingVertical:6}}><Text numberOfLines={1} style={{flex:1,color:colors.textDim,fontFamily:fonts.body,fontSize:12,textAlign:'right'}}>{p.profile?.display_name??'متحدث'}</Text><Small icon={p.is_muted?'🔊':'🔇'} onPress={()=>onMute(p.user_id)}/><Small icon="⬇️" onPress={()=>onDemote(p.user_id)}/><Small icon="🚫" danger onPress={()=>onRemove(p.user_id)}/><Small icon="⛔" danger onPress={()=>onBan(p.user_id)}/></View>)}</View>}
 </Card>;
}
function Btn({label,onPress,primary}:{label:string;onPress:()=>void;primary?:boolean}){return <Pressable onPress={onPress} style={{flex:1,alignItems:'center',paddingVertical:8,borderRadius:10,backgroundColor:primary?colors.primary:colors.tint,borderWidth:1,borderColor:primary?colors.primary:colors.border}}><Text style={{color:primary?colors.onBrand:colors.textDim,fontFamily:fonts.bodyBold,fontSize:11}}>{label}</Text></Pressable>}
function Small({icon,onPress,danger}:{icon:string;onPress:()=>void;danger?:boolean}){return <Pressable onPress={onPress} style={{width:32,height:32,borderRadius:16,alignItems:'center',justifyContent:'center',backgroundColor:danger?colors.dangerSoft:colors.tint,borderWidth:1,borderColor:danger?colors.danger:colors.border}}><Text>{icon}</Text></Pressable>}
''')

admin=ROOT/'admin.tsx'
if admin.exists():
    s=admin.read_text()
    old="const [pr,pm,sp,lg,se,ar,as,aq,ag,cr]=results;\n              const _pc=results.slice(10); setPaymentMethods(_pc[0]?.data||[]); setPaymentOrders(_pc[1]?.data||[]); setRoomSettings(_pc[2]?.data||[]); setFeatureFlags(_pc[3]?.data||[]);"
    new="""const [pr,pm,sp,lg,se,ar,as,pmt,orders,rooms,flags,acs,grants,aq,ag,cr]=results;
    setPaymentMethods(pmt.data||[]);
    setPaymentOrders(orders.data||[]);
    setRoomSettings(rooms.data||[]);
    setFeatureFlags(flags.data||[]);"""
    s=s.replace(old,new)
    s=re.sub(r"const \[pr,pm,sp,lg,se,ar,as,aq,ag,cr\]=results;\s*const _pc=results\.slice\(10\);[^\n]*",new,s)
    s=s.replace("loadData();","load();")
    admin.write_text(s)

api=ROOT.parent/'src/lib/supabaseApi.ts'
if api.exists():
    s=api.read_text()
    old="""    async listGiftFeed(roomId, limit = 30) {
      let q = sb().from('gift_transactions').select('*, gift:gifts(*)').order('created_at', { ascending: false }).limit(limit);
      if (roomId) q = q.eq('room_id', roomId);
      const { data } = await q;
      return (data as GiftTransaction[]) ?? [];
    },"""
    new="""    async listGiftFeed(roomId, limit = 30) {
      let q = sb().from('gift_transactions').select('*, gift:gifts(*)').order('created_at', { ascending: false }).limit(limit);
      if (roomId) q = q.eq('room_id', roomId);
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      const rows = (data as GiftTransaction[]) ?? [];
      const ids = [...new Set(rows.flatMap((r:any) => [r.sender_id, r.receiver_id]).filter(Boolean))];
      if (!ids.length) return rows;
      const { data: profs } = await sb().from('profiles_public').select('*').in('id', ids);
      const byId = new Map(((profs as any[]) ?? []).map((p:any)=>[p.id,p]));
      return rows.map((r:any)=>({...r, sender: byId.get(r.sender_id) ?? null, receiver: byId.get(r.receiver_id) ?? null}));
    },"""
    if old in s: s=s.replace(old,new)
    needle=".on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gift_transactions', filter: 'room_id=eq.' + arg }, () => notify(key));"
    repl=".on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gift_transactions', filter: 'room_id=eq.' + arg }, () => notify(key))\n            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'gift_transactions', filter: 'room_id=eq.' + arg }, () => notify(key));"
    # Also handle source using template syntax without embedding backticks.
    s=s.replace(needle,repl)
    api.write_text(s)

audit=Path('../build/wanas_deep_audit.py')
audit.parent.mkdir(parents=True,exist_ok=True)
audit.write_text(r'''from pathlib import Path
import re,sys
files=[p for base in (Path('app'),Path('src')) if base.exists() for p in base.rglob('*') if p.suffix in {'.ts','.tsx','.js','.jsx'} and 'node_modules' not in p.parts and 'android' not in p.parts]
errors=[]
for p in files:
    s=p.read_text(errors='ignore')
    if 'loadData();' in s: errors.append(f'{p}: unresolved loadData()')
room=Path('rooms/[id].tsx')
if room.exists():
    s=room.read_text()
    for token in ['moderateRoom','hand_raised','RoomControlCenter']:
        if token not in s: errors.append(f'room screen missing {token}')
api=Path('src/lib/supabaseApi.ts')
if api.exists():
    s=api.read_text()
    for token in ['rpc_send_gift','gift_transactions','postgres_changes']:
        if token not in s: errors.append(f'gift pipeline missing {token}')
bad=re.compile(r"\.from\(['\"]profiles['\"]\)\.update\([^\n]*(?:coins|coin)",re.I)
for p in files:
    if bad.search(p.read_text(errors='ignore')): errors.append(f'{p}: direct profile coin update')
print('Wanas deep audit files:',len(files))
if errors:
    print('\n'.join('ERROR: '+x for x in errors)); sys.exit(1)
print('PASS: static deep audit gates')
''')
print('V19 deep audit patch ready')
