from pathlib import Path
import re

ROOT = Path('app')
HOME = ROOT / '(tabs)' / 'home.tsx'
HOME.parent.mkdir(parents=True, exist_ok=True)

HOME.write_text(r'''import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/hooks/useAuth';
import { usePolling } from '../../src/hooks/useRealtime';
import { api } from '../../src/lib/api';
import { Screen, Card } from '../../src/components/ui';
import { ThemeToggle } from '../../src/components/ui/ThemeToggle';
import { colors, fonts, gradients, radius, spacing } from '../../src/lib/theme';
import type { VoiceRoom, PublicProfile } from '../../src/lib/types';

const quick = [
  ['mic', 'الغرف', '/(tabs)/rooms', colors.primary],
  ['people', 'الأصدقاء', '/(tabs)/friends', colors.mint],
  ['chatbubbles', 'Messenger', '/engagement', colors.blue],
  ['gift', 'الهدايا', '/coins', colors.gold],
  ['flash', 'Buzz', '/match', colors.pink],
  ['sparkles', 'AI Games', '/ai-games', colors.violet],
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const { profile, isPremium } = useAuth();
  const [rooms, setRooms] = useState<VoiceRoom[]>([]);
  const [online, setOnline] = useState<PublicProfile[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [r, o] = await Promise.all([api.listRooms(), api.listOnline(10)]);
      setRooms(r);
      setOnline(o);
    } catch {}
  }, []);

  useEffect(() => { void load(); }, [load]);
  usePolling(load, 15000);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const go = (route: string) => router.push(route as never);

  return (
    <Screen>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl * 2 }}
      >
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md }}>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 29, color: colors.text }}>وَنَس</Text>
            <Text style={{ fontFamily: fonts.bodyLight, fontSize: 12, color: colors.textDim, marginTop: 2 }}>
              {profile?.display_name ? 'أهلًا ' + profile.display_name + ' 👋' : 'مكانك للصحبة والكلام والمرح'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 7 }}>
            <Pressable onPress={() => go('/coins')}>
              <View style={{ backgroundColor: colors.goldSoft, borderColor: colors.gold + '55', borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 8, flexDirection: 'row-reverse', gap: 5 }}>
                <Text>🪙</Text>
                <Text style={{ color: colors.gold, fontFamily: fonts.displayBold }}>{profile?.coins ?? 0}</Text>
              </View>
            </Pressable>
            <ThemeToggle />
          </View>
        </View>

        <LinearGradient colors={gradients.brand} start={{x:0,y:0}} end={{x:1,y:1}} style={{ marginTop: spacing.lg, borderRadius: radius.xl, padding: spacing.lg, overflow: 'hidden' }}>
          <View style={{ position:'absolute', right:-45, top:-55, width:170, height:170, borderRadius:85, backgroundColor:'#fff', opacity:.08 }} />
          <Text style={{ color: colors.onImage, fontFamily: fonts.bodyBold, fontSize: 11, textAlign:'right' }}>WANAS • NEO</Text>
          <Text style={{ color: colors.onImage, fontFamily: fonts.display, fontSize: 24, lineHeight: 32, textAlign:'right', marginTop: 7 }}>
            ادخل، اتكلم، واللحظة تبدأ الآن.
          </Text>
          <Text style={{ color: colors.onImageDim, fontFamily: fonts.bodyLight, fontSize: 12, textAlign:'right', marginTop: 6 }}>
            غرف صوتية • أصدقاء • Buzz • ألعاب • هدايا
          </Text>
          <View style={{ flexDirection:'row-reverse', gap:8, marginTop:15 }}>
            <Pressable onPress={() => go('/(tabs)/rooms')} style={{ flex:1, backgroundColor:'rgba(0,0,0,.18)', borderRadius:14, padding:12, alignItems:'center' }}>
              <Text style={{ color:'#fff', fontFamily:fonts.bodyBold }}>🎙️ اكتشف الغرف</Text>
            </Pressable>
            <Pressable onPress={() => go('/match')} style={{ flex:1, backgroundColor:'rgba(255,255,255,.14)', borderRadius:14, padding:12, alignItems:'center' }}>
              <Text style={{ color:'#fff', fontFamily:fonts.bodyBold }}>⚡ Buzz</Text>
            </Pressable>
          </View>
        </LinearGradient>

        <Text style={{ color: colors.text, fontFamily: fonts.h2.fontFamily, fontSize: 18, textAlign:'right', marginTop: spacing.xl, marginBottom: 10 }}>اختصاراتك</Text>
        <View style={{ flexDirection:'row-reverse', flexWrap:'wrap', gap:8 }}>
          {quick.map(([icon,label,route,accent]) => (
            <Pressable key={label} onPress={() => go(route)} style={{ width:'31.8%', minHeight:82, backgroundColor:colors.surface, borderColor:colors.border, borderWidth:1, borderRadius:18, padding:10, alignItems:'center' }}>
              <View style={{ width:40, height:40, borderRadius:13, backgroundColor:accent+'18', alignItems:'center', justifyContent:'center' }}>
                <Ionicons name={icon as any} size={21} color={accent} />
              </View>
              <Text style={{ color:colors.text, fontFamily:fonts.bodyBold, fontSize:11, marginTop:7 }}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ flexDirection:'row-reverse', justifyContent:'space-between', alignItems:'center', marginTop:spacing.xl, marginBottom:10 }}>
          <Text style={{ color:colors.text, fontFamily:fonts.h2.fontFamily, fontSize:18 }}>الغرف الحية</Text>
          <Pressable onPress={() => go('/(tabs)/rooms')}><Text style={{ color:colors.primary, fontFamily:fonts.bodyBold }}>عرض الكل</Text></Pressable>
        </View>

        {rooms.slice(0,5).map((r) => (
          <Pressable key={r.id} onPress={() => go('/rooms/' + r.id)}>
            <Card style={{ marginBottom:8, padding:14 }}>
              <View style={{ flexDirection:'row-reverse', alignItems:'center', gap:10 }}>
                <View style={{ width:46, height:46, borderRadius:15, backgroundColor:colors.tint, alignItems:'center', justifyContent:'center' }}>
                  <Text style={{ fontSize:24 }}>{r.emoji || '🎙️'}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text numberOfLines={1} style={{ color:colors.text, fontFamily:fonts.bodyBold, fontSize:14, textAlign:'right' }}>{r.name}</Text>
                  <Text numberOfLines={1} style={{ color:colors.textDim, fontFamily:fonts.bodyLight, fontSize:11, textAlign:'right', marginTop:3 }}>
                    {(r.topic || 'محادثة مفتوحة') + ' • ' + (r.live_count ?? 0) + ' موجودين'}
                  </Text>
                </View>
                <View style={{ backgroundColor:colors.dangerSoft, borderRadius:9, paddingHorizontal:7, paddingVertical:5 }}>
                  <Text style={{ color:colors.danger, fontFamily:fonts.bodyBold, fontSize:10 }}>LIVE</Text>
                </View>
              </View>
            </Card>
          </Pressable>
        ))}

        {!rooms.length && (
          <Card style={{ padding:24, alignItems:'center' }}>
            <Text style={{ fontSize:30 }}>🎙️</Text>
            <Text style={{ color:colors.text, fontFamily:fonts.bodyBold, marginTop:7 }}>لا توجد غرف ظاهرة الآن</Text>
            <Pressable onPress={() => go('/(tabs)/rooms')} style={{ marginTop:10, backgroundColor:colors.primary, borderRadius:12, paddingHorizontal:16, paddingVertical:10 }}>
              <Text style={{ color:colors.onBrand, fontFamily:fonts.bodyBold }}>أنشئ أول غرفة</Text>
            </Pressable>
          </Card>
        )}

        <View style={{ flexDirection:'row-reverse', justifyContent:'space-between', alignItems:'center', marginTop:spacing.xl, marginBottom:10 }}>
          <Text style={{ color:colors.text, fontFamily:fonts.h2.fontFamily, fontSize:18 }}>متصلون الآن</Text>
          <Text style={{ color:colors.mint, fontFamily:fonts.bodyBold }}>{online.length} متصل</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:10, flexDirection:'row-reverse' }}>
          {online.map((u) => (
            <Pressable key={u.id} onPress={() => go('/(tabs)/friends')} style={{ width:68, alignItems:'center' }}>
              <View style={{ width:52, height:52, borderRadius:26, backgroundColor:colors.tint, borderWidth:2, borderColor:colors.mint, alignItems:'center', justifyContent:'center' }}>
                <Text style={{ color:colors.text, fontFamily:fonts.displayBold, fontSize:20 }}>{(u.display_name || 'و').slice(0,1)}</Text>
              </View>
              <Text numberOfLines={1} style={{ color:colors.text, fontFamily:fonts.bodyBold, fontSize:10.5, marginTop:5 }}>{u.display_name || 'عضو'}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Card style={{ marginTop:spacing.xl, padding:15, borderColor:colors.gold+'44' }}>
          <View style={{ flexDirection:'row-reverse', alignItems:'center', gap:10 }}>
            <View style={{ width:42, height:42, borderRadius:14, backgroundColor:colors.goldSoft, alignItems:'center', justifyContent:'center' }}>
              <Text style={{ fontSize:21 }}>🔥</Text>
            </View>
            <View style={{ flex:1 }}>
              <Text style={{ color:colors.text, fontFamily:fonts.bodyBold, textAlign:'right' }}>مهمة اليوم</Text>
              <Text style={{ color:colors.textDim, fontFamily:fonts.bodyLight, fontSize:11, textAlign:'right', marginTop:3 }}>
                ادخل غرفة + استخدم Buzz + العب جولة AI
              </Text>
            </View>
            <Text style={{ color:colors.gold, fontFamily:fonts.displayBold }}>+50 XP</Text>
          </View>
        </Card>

        <Pressable onPress={() => go(isPremium ? '/settings' : '/premium')} style={{ marginTop:10 }}>
          <Card style={{ padding:14 }}>
            <Text style={{ color:colors.text, fontFamily:fonts.bodyBold, textAlign:'right' }}>
              {isPremium ? '💎 عضوية Premium مفعلة' : '💎 اكتشف مزايا Premium'}
            </Text>
          </Card>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}
''')

tabs = ROOT / '(tabs)' / '_layout.tsx'
if tabs.exists():
    s = tabs.read_text()
    s = re.sub(r'\s*<Tabs\.Screen name="neo"[^\n]*/>', '', s)
    tabs.write_text(s)

theme = Path('src/lib/theme.ts')
if theme.exists():
    s = theme.read_text()
    for a,b in {
        '#4f7cff':'#7C5CFF',
        '#7ea4ff':'#A88CFF',
        '#070b14':'#070A12',
        '#101a30':'#0E1422',
        '#111b30':'#121A2B',
    }.items():
        s=s.replace(a,b)
    theme.write_text(s)

print('V25 full-app visual/navigation upgrade applied: home + shared theme + duplicate NEO tab cleanup')
