from pathlib import Path
import re, hashlib, json, sys

ROOT=Path('app')
rooms=ROOT/'(tabs)'/'rooms.tsx'
if not rooms.exists(): rooms=ROOT/'rooms.tsx'
if rooms.exists():
    s=rooms.read_text()
    if 'ROOM_FILTERS_V20' not in s:
        marker="  const myRooms = rooms.filter((r) => r.host_id === profile?.id || r.kind === 'private');"
        if marker in s:
            ins=marker+'''
  const [roomFilter, setRoomFilter] = useState<'all'|'active'|'mine'|'private'>('all');
  const ROOM_FILTERS_V20 = [
    { key: 'all', label: 'الكل' }, { key: 'active', label: 'نشطة الآن' },
    { key: 'mine', label: 'غرفي' }, { key: 'private', label: 'خاصة' },
  ] as const;
  const filteredRooms = rooms.filter((r) => {
    if (roomFilter === 'active') return (r.live_count ?? 0) > 0;
    if (roomFilter === 'mine') return r.host_id === profile?.id;
    if (roomFilter === 'private') return r.kind === 'private';
    return true;
  });
'''
            s=s.replace(marker,ins,1)
            old="{publicRooms.map((r) => <RoomCard key={r.id} r={r} />)}"
            new="""<View style={{flexDirection:'row-reverse',flexWrap:'wrap',gap:6,marginBottom:spacing.md}}>{ROOM_FILTERS_V20.map((f)=><Pressable key={f.key} onPress={()=>setRoomFilter(f.key)} style={{paddingHorizontal:12,paddingVertical:8,borderRadius:999,backgroundColor:roomFilter===f.key?colors.primary:colors.tint,borderWidth:1,borderColor:roomFilter===f.key?colors.primary:colors.border}}><Text style={{fontFamily:fonts.bodyBold,fontSize:11,color:roomFilter===f.key?colors.onBrand:colors.textDim}}>{f.label}</Text></Pressable>)}</View><View style={{flexDirection:'row-reverse',flexWrap:'wrap',gap:spacing.md}}>{filteredRooms.map((r) => <RoomCard key={r.id} r={r} />)}</View>"""
            if old in s: s=s.replace(old,new,1)
            rooms.write_text(s)

api=ROOT.parent/'src/lib/supabaseApi.ts'
if api.exists():
    s=api.read_text()
    old="""            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gift_transactions', filter: `room_id=eq.${arg}` }, () => notify(key));"""
    new="""            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gift_transactions', filter: `room_id=eq.${arg}` }, () => notify(key))
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'gift_transactions', filter: `room_id=eq.${arg}` }, () => notify(key))
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'gift_transactions', filter: `room_id=eq.${arg}` }, () => notify(key));"""
    if old in s: s=s.replace(old,new,1)
    api.write_text(s)

room=ROOT/'rooms/[id].tsx'
if room.exists():
    s=room.read_text()
    needle="""        {isHost ? <RoomControlCenter
          queue={micQueue}"""
    if needle in s and 'طلبك للمايك' not in s:
        block="""        {!isHost && me?.role === 'listener' && me?.hand_raised ? (
          <View style={{marginTop:spacing.md,padding:spacing.md,borderRadius:radius.md,backgroundColor:colors.primarySoft,borderWidth:1,borderColor:colors.primary+'44'}}>
            <Text style={{fontFamily:fonts.bodyBold,color:colors.text,textAlign:'right',fontSize:12.5}}>✋ طلبك للمايك في قائمة الانتظار</Text>
            <Text style={{fontFamily:fonts.bodyLight,color:colors.textDim,textAlign:'right',fontSize:11,marginTop:4}}>سيتم تفعيل المايك فقط بعد موافقة إدارة الغرفة.</Text>
          </View>
        ) : null}

"""
        s=s.replace(needle,block+needle,1)
    room.write_text(s)

checks={str(room):['RoomControlCenter','micQueue','moderateRoom'],str(api):['rpc_send_gift','gift_transactions','postgres_changes']}
errors=[]; manifest={'version':'V20-final','features':{},'sha256':{}}
for path,tokens in checks.items():
    p=Path(path); text=p.read_text() if p.exists() else ''
    for token in tokens:
        ok=token in text; manifest['features'][token]=ok
        if not ok: errors.append(f'{path}: missing {token}')
    if p.exists(): manifest['sha256'][path]=hashlib.sha256(text.encode()).hexdigest()
admin=ROOT/'admin.tsx'
if admin.exists():
    a=admin.read_text(); ok=('acs.data' in a and 'grants.data' in a and 'const _pc=results.slice(10)' not in a)
    manifest['features']['admin_mapping']=ok
    if not ok: errors.append('admin runtime mapping is stale')
manifest['features']['room_filters']=rooms.exists() and 'ROOM_FILTERS_V20' in rooms.read_text()
if not manifest['features']['room_filters']: errors.append('room filters were not applied to final source')
Path('/tmp/wanas-final-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print(json.dumps(manifest,ensure_ascii=False,indent=2))
if errors: print('\n'.join('ERROR: '+e for e in errors)); sys.exit(1)
print('PASS: V20 FINAL SOURCE GATE')