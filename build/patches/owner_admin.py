from pathlib import Path
import re
p=Path('app/admin.tsx'); s=p.read_text()

s=s.replace(
"const [notice,setNotice]=useState('');",
"""const [notice,setNotice]=useState('');
            const [chatControls,setChatControls]=useState<any>({enabled:true,text_enabled:true,voice_enabled:true,music_enabled:true,max_voice_seconds:60});
            const [roomMusicControls,setRoomMusicControls]=useState<any>({enabled:true,max_volume:1,allow_music:true});
            const [ownerId,setOwnerId]=useState<string|null>(null);
            const [grantMap,setGrantMap]=useState<Record<string,any>>({});"""
,1)

s=s.replace(
"supabase.from('admin_settings').select('*'),",
"""supabase.from('admin_settings').select('*'),
                supabase.from('app_settings').select('key,value').in('key',['chat_controls','room_music_controls','app_owner_id']),
                supabase.from('app_admin_grants').select('*'),"""
,1)

s=s.replace(
"const [pr,pm,sp,lg,se,ar,as]=results;",
"const [pr,pm,sp,lg,se,ar,as,acs,grants]=results;"
,1)

s=s.replace(
"const inc=settings.incognito_service;",
"""const inc=settings.incognito_service;
              (acs.data||[]).forEach((x:any)=>{
                if(x.key==='chat_controls')setChatControls((v:any)=>({...v,...(x.value||{})}));
                if(x.key==='room_music_controls')setRoomMusicControls((v:any)=>({...v,...(x.value||{})}));
                if(x.key==='app_owner_id')setOwnerId(String(x.value||'').replace(/^"|"$/g,''));
              });
              const gm:any={};(grants.data||[]).forEach((x:any)=>gm[x.user_id]=x);
              setGrantMap(gm);"""
,1)

anchor="const savePermission=async(userId:string,key:PermissionKey,value:boolean)=>{"
insert="""const saveChatControls=async()=>{
              const {error}=await supabase.from('app_settings').upsert([
                {key:'chat_controls',value:chatControls,updated_at:new Date().toISOString()},
                {key:'room_music_controls',value:roomMusicControls,updated_at:new Date().toISOString()}
              ],{onConflict:'key'});
              if(error)Alert.alert('خطأ',error.message);else{await writeLog('update_chat_music_controls',undefined,{chatControls,roomMusicControls});Alert.alert('تم','تم حفظ تحكم الشات والموسيقى');}
            };
            const setAdminGrant=async(userId:string,enabled:boolean,permissions:any)=>{
              if(adminIdRef.current!==ownerId)return Alert.alert('الصلاحية','هذه العملية متاحة لصاحب التطبيق فقط.');
              const {error}=await supabase.rpc('owner_set_admin',{p_user_id:userId,p_enabled:enabled,p_permissions:permissions});
              if(error)Alert.alert('خطأ',error.message);else{setGrantMap((m:any)=>({...m,[userId]:{user_id:userId,enabled,permissions}}));await writeLog('owner_update_admin_grant',userId,{enabled,permissions});}
            };
            
            """
if anchor not in s: raise SystemExit('savePermission anchor missing')
s=s.replace(anchor,insert+anchor,1)

# Replace roles section with owner + existing granular admin roles
start='if(tab===\'roles\')return <><Back/><SectionHeader title="صلاحيات الأدمن" icon="shield-checkmark-outline"/>'
idx=s.find(start)
if idx<0: raise SystemExit('roles start missing')
m=re.search(r"\n\s*if\(tab==='[^']+'\)",s[idx:])
if not m: raise SystemExit('roles end missing')
end=idx+m.start()
roles="""if(tab==='roles')return <><Back/><SectionHeader title="صلاحيات الأدمن" icon="shield-checkmark-outline"/>
                <View style={styles.card}><Text style={styles.h2}>👑 صاحب التطبيق</Text><Text style={styles.muted}>صاحب التطبيق هو الحساب الذي يملك صلاحية إضافة أدمن وتحديد صلاحياته. الـOwner الحالي محفوظ في الإعدادات الآمنة.</Text><Text style={styles.health}>Owner ID: {ownerId||'غير محدد'}</Text>{adminIdRef.current===ownerId?<Text style={styles.health}>✓ أنت صاحب التطبيق ويمكنك إدارة الأدمن.</Text>:<Text style={styles.muted}>هذه الصفحة للعرض؛ تغيير الأدمن متاح لصاحب التطبيق فقط.</Text>}</View>
                {admins.map(a=><View style={styles.card} key={a.id}><Text style={styles.user}>{a.name||a.email||a.id}</Text>
                <View style={styles.settingRow}><Text style={styles.label}>أدمن مفوض</Text><Switch disabled={a.id===ownerId||adminIdRef.current!==ownerId} value={a.id===ownerId?true:!!grantMap[a.id]?.enabled} onValueChange={v=>setAdminGrant(a.id,v,grantMap[a.id]?.permissions||{dashboard:true})}/></View>
                {(Object.keys(DEFAULT_PERMS) as PermissionKey[]).map(k=><View style={styles.settingRow} key={k}><Text style={styles.label}>{({dashboard:'لوحة التحكم',users:'المستخدمون',comments:'التعليقات',support:'الدعم والشكاوى',security:'الأمان',content:'المحتوى والوسائط',settings:'الإعدادات'} as any)[k]}</Text><Switch disabled={adminIdRef.current!==ownerId||a.id===ownerId} value={grantMap[a.id]?.permissions?.[k]??permissionMap[a.id]?.[k]??DEFAULT_PERMS[k]} onValueChange={v=>setAdminGrant(a.id,!!grantMap[a.id]?.enabled,{...(grantMap[a.id]?.permissions||{}),[k]:v})}/></View>)}</View>)}</>;"""
s=s[:idx]+roles+s[end:]

# Replace settings fallback with chat/music controls plus existing service settings.
settings_anchor='return <><Back/><SectionHeader title="إعدادات التطبيق" icon="settings-outline"/>'
idx=s.find(settings_anchor)
if idx<0: raise SystemExit('settings anchor missing')
# insert card before existing service card
ins="""return <><Back/><SectionHeader title="إعدادات التطبيق" icon="settings-outline"/>
                <View style={styles.card}><Text style={styles.h2}>💬 تحكم الشات والموسيقى</Text>
                <View style={styles.settingRow}><Text style={styles.label}>الشات بالكامل</Text><Switch value={chatControls.enabled!==false} onValueChange={(v:any)=>setChatControls((x:any)=>({...x,enabled:v}))}/></View>
                <View style={styles.settingRow}><Text style={styles.label}>الشات الكتابي</Text><Switch value={chatControls.text_enabled!==false} onValueChange={(v:any)=>setChatControls((x:any)=>({...x,text_enabled:v}))}/></View>
                <View style={styles.settingRow}><Text style={styles.label}>الرسائل الصوتية</Text><Switch value={chatControls.voice_enabled!==false} onValueChange={(v:any)=>setChatControls((x:any)=>({...x,voice_enabled:v}))}/></View>
                <View style={styles.settingRow}><Text style={styles.label}>موسيقى الجهاز داخل الغرف</Text><Switch value={chatControls.music_enabled!==false} onValueChange={(v:any)=>setChatControls((x:any)=>({...x,music_enabled:v}))}/></View>
                <View style={styles.settingRow}><Text style={styles.label}>السماح بالموسيقى في الغرف</Text><Switch value={roomMusicControls.allow_music!==false} onValueChange={(v:any)=>setRoomMusicControls((x:any)=>({...x,allow_music:v}))}/></View>
                <Text style={styles.label}>أقصى مدة للرسالة الصوتية بالثواني</Text><TextInput style={styles.input} value={String(chatControls.max_voice_seconds??60)} onChangeText={(v:string)=>setChatControls((x:any)=>({...x,max_voice_seconds:Math.max(10,Math.min(180,Number(v)||60))}))} keyboardType="numeric"/>
                <TouchableOpacity style={styles.primary} onPress={saveChatControls}><Ionicons name="save-outline" size={18} color="#fff"/><Text style={styles.primaryText}>حفظ تحكم الشات والموسيقى</Text></TouchableOpacity></View>"""
# keep rest after anchor's existing return, replacing first anchor occurrence only
s=s[:idx]+ins+s[idx+len(settings_anchor):]

p.write_text(s)
print('Owner admin + chat/music controls patch applied')
