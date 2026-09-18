import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, FlatList,
  Modal, Dimensions, Alert, Platform, StatusBar, I18nManager, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';

const { width, height } = Dimensions.get('window');

// COLORS
const COLORS = {
  primary: '#0A3D8F',
  primaryDark: '#082A6B',
  primaryLight: '#EBF0FF',
  gold: '#FFB800',
  goldDark: '#E6A600',
  goldLight: '#FFF7D6',
  teal: '#00C9A7',
  tealDark: '#00A88A',
  bg: '#F4F6FB',
  card: '#FFFFFF',
  text: '#111B3A',
  textSec: '#6B7A99',
  textLight: '#9CA3AF',
  border: '#E6EAF2',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  pink: '#FF6B9D',
  purple: '#8B5CF6',
};

// MOCK DATA
const TRACKS = [
  { id: 'science', name: 'علمي علوم', icon: 'leaf', color: '#10B981', subjects: ['اللغة العربية', 'اللغة الإنجليزية', 'الأحياء', 'الكيمياء', 'الفيزياء', 'الجيولوجيا وعلوم البيئة', 'اللغة الفرنسية'] },
  { id: 'math', name: 'علمي رياضة', icon: 'calculator', color: '#3B82F6', subjects: ['اللغة العربية', 'اللغة الإنجليزية', 'الفيزياء', 'الكيمياء', 'الرياضيات البحتة', 'الرياضيات التطبيقية', 'اللغة الفرنسية'] },
  { id: 'literary', name: 'أدبي', icon: 'book', color: '#F59E0B', subjects: ['اللغة العربية', 'اللغة الإنجليزية', 'التاريخ', 'الجغرافيا', 'علم النفس والاجتماع', 'الفلسفة والمنطق', 'الإحصاء', 'اللغة الفرنسية'] },
];

const ALL_SUBJECTS = ['اللغة العربية', 'اللغة الإنجليزية', 'الأحياء', 'الكيمياء', 'الفيزياء', 'الرياضيات', 'التاريخ', 'الجغرافيا', 'الإحصاء', 'الجيولوجيا', 'الفلسفة', 'علم النفس'];

const SUBJECT_ICONS: any = {
  'اللغة العربية': 'language',
  'اللغة الإنجليزية': 'globe',
  'الأحياء': 'leaf',
  'الكيمياء': 'flask',
  'الفيزياء': 'magnet',
  'الرياضيات': 'calculator',
  'التاريخ': 'time',
  'الجغرافيا': 'map',
  'الإحصاء': 'stats-chart',
  'الجيولوجيا': 'earth',
};

const QUESTION_BANK: any = {
  'الفيزياء': [
    { q: 'ما وحدة قياس القوة الدافعة الكهربية؟', opts: ['الأوم', 'الفولت', 'الأمبير', 'الجول'], ans: 1 },
    { q: 'قانون أوم ينص على أن التيار يتناسب...', opts: ['عكسياً مع الجهد', 'طردياً مع المقاومة', 'طردياً مع الجهد', 'لا يتأثر'], ans: 2 },
    { q: 'أي مما يلي يمثل قانون نيوتن الثاني؟', opts: ['F=ma', 'E=mc²', 'V=IR', 'P=VI'], ans: 0 },
  ],
  'الكيمياء': [
    { q: 'العدد الذري للكربون هو:', opts: ['4', '6', '8', '12'], ans: 1 },
    { q: 'ما هو الحمض الموجود في المعدة؟', opts: ['H2SO4', 'HCl', 'HNO3', 'CH3COOH'], ans: 1 },
  ],
  'الأحياء': [
    { q: 'أين يحدث التنفس الخلوي؟', opts: ['النواة', 'الميتوكندريا', 'الريبوسوم', 'السيتوبلازم'], ans: 1 },
    { q: 'عدد الكروموسومات في الإنسان:', opts: ['44', '46', '48', '23'], ans: 1 },
  ],
  'التاريخ': [
    { q: 'متى قامت ثورة 1919؟', opts: ['1918', '1919', '1920', '1952'], ans: 1 },
    { q: 'معاهدة 1936 كانت بين مصر و:', opts: ['فرنسا', 'بريطانيا', 'إيطاليا', 'تركيا'], ans: 1 },
  ],
  'اللغة العربية': [
    { q: 'ما إعراب كلمة "الطالب" في "جاء الطالب مجتهداً"؟', opts: ['فاعل مرفوع', 'مفعول به', 'خبر', 'نعت'], ans: 0 },
  ],
};

type User = {
  name: string;
  email: string;
  track: string;
  examDate: string;
  dailyHours: number;
  subjects: string[];
  demoDaysLeft: number;
  isSubscribed: boolean;
  plan: string | null;
};

type Stats = {
  totalHours: number;
  sessions: number;
  streak: number;
  progress: number;
  subjectProgress: Record<string, number>;
  diligence: number;
  errors: any[];
  achievements: string[];
  challengePoints: number;
  wins: number;
  losses: number;
};

const AppContext = createContext<any>(null);
const useApp = () => useContext(AppContext);

// Stack & Tabs
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Helper: Progress Ring simulated
function ProgressCircle({ percent, size = 90, color = COLORS.primary }: any) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#E5EAF5', justifyContent: 'center', alignItems: 'center', borderWidth: 6, borderColor: color, borderLeftColor: percent < 100 ? '#E5EAF5' : color, borderTopColor: percent < 75 ? '#E5EAF5' : color }}>
      <View style={{ backgroundColor: 'white', width: size - 20, height: size - 20, borderRadius: (size - 20) / 2, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontWeight: '900', fontSize: 18, color: COLORS.text }}>{percent}%</Text>
        <Text style={{ fontSize: 10, color: COLORS.textSec }}>الإنجاز</Text>
      </View>
    </View>
  );
}

// AUTH SCREENS
function LoginScreen({ navigation }: any) {
  const { setUser, setIsLoggedIn } = useApp();
  const [email, setEmail] = useState('ahmed@thanaweya.com');
  const [pass, setPass] = useState('123456');
  const [showPass, setShowPass] = useState(false);
  return (
    <LinearGradient colors={[COLORS.primary, '#1E5BCA', '#4A8DFF']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 30 }}>
            <View style={{ width: 84, height: 84, borderRadius: 28, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.15, elevation: 8 }}>
              <Ionicons name="school" size={44} color={COLORS.primary} />
            </View>
            <Text style={{ color: 'white', fontSize: 28, fontWeight: '900', marginTop: 14, textAlign: 'center' }}>أبطال الثانوية العامة</Text>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 6, textAlign: 'center' }}>طريقك للتفوق.. منصة متكاملة للثانوية المصرية 🇪🇬</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <View style={{ backgroundColor: COLORS.gold, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}><Text style={{ fontSize: 11, fontWeight: '800', color: COLORS.text }}>نظام جديد 2026</Text></View>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}><Text style={{ fontSize: 11, color: 'white', fontWeight: '700' }}>علمي / أدبي</Text></View>
            </View>
          </View>

          <View style={{ backgroundColor: 'white', borderRadius: 28, padding: 22, shadowColor: '#000', shadowOpacity: 0.08, elevation: 6 }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: COLORS.text, textAlign: 'right' }}>تسجيل الدخول</Text>
            <Text style={{ fontSize: 12, color: COLORS.textSec, textAlign: 'right', marginTop: 4 }}>مرحباً بعودتك يا بطل! واصل رحلة التفوق</Text>

            <View style={{ marginTop: 18 }}>
              <Text style={styles.label}>البريد الإلكتروني</Text>
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={18} color={COLORS.textLight} />
                <TextInput value={email} onChangeText={setEmail} placeholder="example@mail.com" placeholderTextColor="#9CA3AF" style={styles.input} keyboardType="email-address" autoCapitalize="none" />
              </View>
              <Text style={styles.label}>كلمة المرور</Text>
              <View style={styles.inputRow}>
                <TouchableOpacity onPress={() => setShowPass(!showPass)}><Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={18} color={COLORS.textLight} /></TouchableOpacity>
                <TextInput value={pass} onChangeText={setPass} placeholder="••••••••" secureTextEntry={!showPass} placeholderTextColor="#9CA3AF" style={styles.input} />
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textLight} />
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Forgot')} style={{ alignSelf: 'flex-end', marginTop: 8 }}><Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: '700' }}>نسيت كلمة المرور؟</Text></TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setUser((p: any) => ({ ...p, email, name: p.name || 'أحمد محمد' }));
                  setIsLoggedIn(true);
                }}
                style={{ backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginTop: 18, flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                <Ionicons name="arrow-back" size={18} color="white" />
                <Text style={{ color: 'white', fontWeight: '900', fontSize: 15 }}>دخول</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 12 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
                <Text style={{ color: COLORS.textLight, fontSize: 12 }}>أو</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border }} />
              </View>

              <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 16, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                <Ionicons name="person-add-outline" size={18} color={COLORS.primary} />
                <Text style={{ color: COLORS.primary, fontWeight: '900' }}>إنشاء حساب جديد</Text>
              </TouchableOpacity>

              <View style={{ backgroundColor: COLORS.goldLight, borderRadius: 14, padding: 12, marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: COLORS.gold, justifyContent: 'center', alignItems: 'center' }}><Ionicons name="gift" size={18} color="white" /></View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={{ fontWeight: '900', fontSize: 12, color: COLORS.text, textAlign: 'right' }}>جرّب مجاناً لمدة 7 أيام</Text>
                  <Text style={{ fontSize: 11, color: COLORS.textSec, textAlign: 'right' }}>بعدها اشترك شهري/ربع سنوي/سنوي</Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 16 }}>بالدخول أنت توافق على الشروط وسياسة الخصوصية</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function RegisterScreen({ navigation }: any) {
  const { setUser, setIsLoggedIn, setOnboardingNeeded } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  return (
    <LinearGradient colors={[COLORS.primary, '#1E5BCA']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end' }}>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 26, fontWeight: '900', textAlign: 'right', marginTop: 12 }}>إنشاء حساب جديد</Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, textAlign: 'right', marginTop: 6 }}>انضم لأكثر من 50,000 بطل ثانوية عامة</Text>

          <View style={{ backgroundColor: 'white', borderRadius: 28, padding: 22, marginTop: 20 }}>
            <Text style={styles.label}>الاسم الكامل</Text>
            <View style={styles.inputRow}><Ionicons name="person-outline" size={18} color={COLORS.textLight} /><TextInput value={name} onChangeText={setName} placeholder="اكتب اسمك الثلاثي" placeholderTextColor="#9CA3AF" style={styles.input} /></View>
            <Text style={styles.label}>البريد الإلكتروني</Text>
            <View style={styles.inputRow}><Ionicons name="mail-outline" size={18} color={COLORS.textLight} /><TextInput value={email} onChangeText={setEmail} placeholder="example@mail.com" placeholderTextColor="#9CA3AF" style={styles.input} autoCapitalize="none" keyboardType="email-address" /></View>
            <Text style={styles.label}>كلمة المرور</Text>
            <View style={styles.inputRow}><Ionicons name="lock-closed-outline" size={18} color={COLORS.textLight} /><TextInput value={pass} onChangeText={setPass} placeholder="8 أحرف على الأقل" placeholderTextColor="#9CA3AF" style={styles.input} secureTextEntry /></View>

            <View style={{ backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12, marginTop: 12, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Ionicons name="shield-checkmark" size={18} color={COLORS.primary} />
              <Text style={{ fontSize: 11, color: COLORS.primary, flex: 1, textAlign: 'right', lineHeight: 16 }}>سنبدأ بإعداد ملفك الدراسي: الشعبة والمواد وموعد الامتحان</Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                if (!name || !email || !pass) { Alert.alert('تنبيه', 'أكمل البيانات'); return; }
                setUser({ name, email, track: '', examDate: '2026-06-15', dailyHours: 6, subjects: [], demoDaysLeft: 7, isSubscribed: false, plan: null });
                setOnboardingNeeded(true);
                setIsLoggedIn(true);
              }}
              style={{ backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 15, alignItems: 'center', marginTop: 18 }}>
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 15 }}>متابعة لإعداد الملف →</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignItems: 'center', marginTop: 14 }}><Text style={{ color: COLORS.textSec, fontSize: 13 }}>لديك حساب؟ <Text style={{ color: COLORS.primary, fontWeight: '800' }}>سجل دخول</Text></Text></TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function ForgotScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg, padding: 24, paddingTop: 60 }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end', borderWidth: 1, borderColor: COLORS.border }}><Ionicons name="arrow-forward" size={20} color={COLORS.text} /></TouchableOpacity>
      <Text style={{ fontSize: 22, fontWeight: '900', color: COLORS.text, textAlign: 'right', marginTop: 16 }}>نسيت كلمة المرور؟</Text>
      <Text style={{ fontSize: 13, color: COLORS.textSec, textAlign: 'right', marginTop: 6, lineHeight: 20 }}>أدخل بريدك وسنرسل لك رابط إعادة التعيين</Text>
      <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 18, marginTop: 18 }}>
        <Text style={styles.label}>البريد الإلكتروني</Text>
        <View style={styles.inputRow}><Ionicons name="mail-outline" size={18} color={COLORS.textLight} /><TextInput value={email} onChangeText={setEmail} placeholder="example@mail.com" style={styles.input} /></View>
        <TouchableOpacity onPress={() => setSent(true)} style={{ backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 16 }}><Text style={{ color: 'white', fontWeight: '800' }}>إرسال رابط التعيين</Text></TouchableOpacity>
        {sent && <View style={{ backgroundColor: '#ECFDF5', padding: 12, borderRadius: 12, marginTop: 12, flexDirection: 'row', gap: 8, alignItems: 'center' }}><Ionicons name="checkmark-circle" size={20} color={COLORS.success} /><Text style={{ color: COLORS.success, fontSize: 12, flex: 1, textAlign: 'right' }}>تم الإرسال! تحقق من بريدك الإلكتروني</Text></View>}
      </View>
    </View>
  );
}

function OnboardingScreen({ navigation }: any) {
  const { user, setUser, setOnboardingNeeded } = useApp();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(user?.name || '');
  const [track, setTrack] = useState('science');
  const [hours, setHours] = useState(6);
  const [date, setDate] = useState('2026-06-15');
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const t = TRACKS.find(x => x.id === track);
    if (t) setSelected(t.subjects);
  }, [track]);

  const toggleSub = (s: string) => setSelected(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  return (
    <LinearGradient colors={['#0A3D8F', '#1A56C4']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ padding: 20, flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[1, 2, 3].map(i => <View key={i} style={{ width: 28, height: 6, borderRadius: 6, backgroundColor: i <= step ? COLORS.gold : 'rgba(255,255,255,0.3)' }} />)}
            </View>
            <Text style={{ color: 'white', fontWeight: '800' }}>{step}/3</Text>
          </View>

          {step === 1 && (
            <View style={{ flex: 1, marginTop: 20 }}>
              <Text style={{ color: 'white', fontSize: 24, fontWeight: '900', textAlign: 'right' }}>أهلاً يا بطل! 👋</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, textAlign: 'right', marginTop: 8, lineHeight: 20 }}>خلّينا نجهز ملفك الدراسي عشان نبني خطتك الذكية</Text>
              <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 20, marginTop: 20 }}>
                <Text style={styles.label}>اسمك</Text>
                <View style={styles.inputRow}><Ionicons name="person" size={18} color={COLORS.primary} /><TextInput value={name} onChangeText={setName} placeholder="مثلاً: أحمد محمد" style={styles.input} /></View>
                <Text style={styles.label}>اختر شعبتك</Text>
                {TRACKS.map(t => (
                  <TouchableOpacity key={t.id} onPress={() => setTrack(t.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 2, borderColor: track === t.id ? COLORS.primary : COLORS.border, backgroundColor: track === t.id ? COLORS.primaryLight : 'white', marginBottom: 10 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: track === t.id ? COLORS.primary : t.color, justifyContent: 'center', alignItems: 'center' }}><Ionicons name={t.icon as any} size={20} color="white" /></View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={{ fontWeight: '900', color: COLORS.text, textAlign: 'right' }}>{t.name}</Text>
                      <Text style={{ fontSize: 11, color: COLORS.textSec, textAlign: 'right' }}>{t.subjects.slice(0, 3).join(' • ')}</Text>
                    </View>
                    <Ionicons name={track === t.id ? "radio-button-on" : "radio-button-off"} size={20} color={track === t.id ? COLORS.primary : COLORS.border} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={{ flex: 1, marginTop: 20 }}>
              <Text style={{ color: 'white', fontSize: 22, fontWeight: '900', textAlign: 'right' }}>كم ساعة تذاكر يومياً؟ ⏰</Text>
              <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 20, marginTop: 20 }}>
                <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                  <Text style={{ fontSize: 52, fontWeight: '900', color: COLORS.primary }}>{hours}</Text>
                  <Text style={{ color: COLORS.textSec, fontSize: 13 }}>ساعات يومياً</Text>
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                    <TouchableOpacity onPress={() => setHours(Math.max(2, hours - 1))} style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border }}><Ionicons name="remove" size={22} color={COLORS.text} /></TouchableOpacity>
                    <TouchableOpacity onPress={() => setHours(Math.min(12, hours + 1))} style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' }}><Ionicons name="add" size={22} color="white" /></TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.label}>تاريخ الامتحان المتوقع</Text>
                <View style={styles.inputRow}><Ionicons name="calendar-outline" size={18} color={COLORS.textLight} /><TextInput value={date} onChangeText={setDate} placeholder="2026-06-15" style={styles.input} /></View>
                <View style={{ backgroundColor: '#FFF7ED', padding: 12, borderRadius: 12, marginTop: 10, borderWidth: 1, borderColor: '#FDBA74' }}>
                  <Text style={{ fontSize: 12, color: '#9A3412', textAlign: 'right', fontWeight: '700' }}>⏳ متبقي {Math.ceil((new Date(date).getTime() - new Date().getTime()) / 86400000)} يوم على الامتحان - سنوزع الخطة بذكاء</Text>
                </View>
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={{ flex: 1, marginTop: 20 }}>
              <Text style={{ color: 'white', fontSize: 22, fontWeight: '900', textAlign: 'right' }}>اختر موادك 📚</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, textAlign: 'right', marginTop: 6 }}>اخترناها تلقائياً حسب شعبتك، يمكنك التعديل</Text>
              <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 16, marginTop: 16, flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' }}>
                    {TRACKS.find(t => t.id === track)?.subjects.map(s => (
                      <TouchableOpacity key={s} onPress={() => toggleSub(s)} style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1.5, borderColor: selected.includes(s) ? COLORS.primary : COLORS.border, backgroundColor: selected.includes(s) ? COLORS.primary : 'white', flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                        <Text style={{ color: selected.includes(s) ? 'white' : COLORS.text, fontWeight: '800', fontSize: 12 }}>{s}</Text>
                        <Ionicons name={selected.includes(s) ? "checkmark-circle" : "add-circle-outline"} size={16} color={selected.includes(s) ? 'white' : COLORS.textLight} />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={{ marginTop: 16, padding: 12, backgroundColor: COLORS.bg, borderRadius: 12 }}>
                    <Text style={{ fontSize: 12, color: COLORS.textSec, textAlign: 'right' }}>مواد إضافية (مشتركة):</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
                      {['اقتصاد', 'تربية وطنية', 'تربية دينية'].map(s => (
                        <TouchableOpacity key={s} onPress={() => toggleSub(s)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: selected.includes(s) ? COLORS.gold : 'white', borderWidth: 1, borderColor: COLORS.border }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: selected.includes(s) ? COLORS.text : COLORS.textSec }}>{s}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            {step > 1 && <TouchableOpacity onPress={() => setStep(step - 1)} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}><Text style={{ color: 'white', fontWeight: '800' }}>رجوع</Text></TouchableOpacity>}
            <TouchableOpacity
              onPress={() => {
                if (step < 3) setStep(step + 1);
                else {
                  setUser({ ...user, name, track, dailyHours: hours, examDate: date, subjects: selected });
                  setOnboardingNeeded(false);
                }
              }}
              style={{ flex: 2, backgroundColor: COLORS.gold, borderRadius: 16, paddingVertical: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
              <Text style={{ color: COLORS.text, fontWeight: '900' }}>{step === 3 ? 'ابدأ رحلة التفوق 🚀' : 'التالي'}</Text>
              <Ionicons name="arrow-back" size={18} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// SUBSCRIPTION
function SubscriptionScreen({ navigation }: any) {
  const { user, setUser, adminPrices, setAdminPrices } = useApp();
  const [selectedPlan, setSelectedPlan] = useState('quarter');
  const [method, setMethod] = useState('vodafone');
  const [phone, setPhone] = useState('');
  const [trx, setTrx] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);

  const plans = [
    { id: 'monthly', name: 'شهري', price: adminPrices.monthly, per: 'شهر', save: '', popular: false },
    { id: 'quarter', name: 'ربع سنوي', price: adminPrices.quarter, per: '3 شهور', save: 'وفر 15%', popular: true },
    { id: 'half', name: 'نصف سنوي', price: adminPrices.half, per: '6 شهور', save: 'وفر 25%', popular: false },
    { id: 'year', name: 'سنوي', price: adminPrices.year, per: '12 شهر', save: 'وفر 40% 🔥', popular: false },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setShowAdmin(!showAdmin)} style={{ backgroundColor: COLORS.text, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <Ionicons name="settings" size={14} color="white" /><Text style={{ color: 'white', fontSize: 11, fontWeight: '800' }}>لوحة الأدمن</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}><Ionicons name="close" size={20} color={COLORS.text} /></TouchableOpacity>
        </View>

        <LinearGradient colors={[COLORS.primary, '#2E6BFF']} style={{ borderRadius: 24, padding: 20, marginTop: 16, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ backgroundColor: COLORS.gold, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}><Text style={{ fontWeight: '900', fontSize: 12 }}>7 أيام مجاناً</Text></View>
            <Ionicons name="diamond" size={28} color={COLORS.gold} />
          </View>
          <Text style={{ color: 'white', fontSize: 22, fontWeight: '900', textAlign: 'right', marginTop: 12 }}>اشترك واستمر كبطل!</Text>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, textAlign: 'right', marginTop: 6, lineHeight: 18 }}>متبقي {user.demoDaysLeft} أيام في الفترة التجريبية. كل المميزات مفتوحة: اختبارات AI، الخطة الذكية، التحديات</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }}><Text style={{ color: 'white', fontSize: 11, fontWeight: '700' }}>✓ بدون إعلانات</Text></View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }}><Text style={{ color: 'white', fontSize: 11, fontWeight: '700' }}>✓ بنك AI لا نهائي</Text></View>
          </View>
        </LinearGradient>

        {showAdmin && (
          <View style={{ backgroundColor: '#1F2937', borderRadius: 16, padding: 16, marginTop: 12 }}>
            <Text style={{ color: 'white', fontWeight: '900', textAlign: 'right', marginBottom: 10 }}>لوحة تحكم الأدمن - تعديل الأسعار</Text>
            {Object.keys(adminPrices).map(k => (
              <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <TextInput value={String(adminPrices[k])} onChangeText={v => setAdminPrices((p: any) => ({ ...p, [k]: Number(v) || 0 }))} keyboardType="numeric" style={{ flex: 1, backgroundColor: 'white', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, textAlign: 'center', fontWeight: '800' }} />
                <Text style={{ color: 'white', fontSize: 12, width: 70, textAlign: 'right' }}>{k === 'monthly' ? 'شهري' : k === 'quarter' ? 'ربع سنوي' : k === 'half' ? 'نصف سنوي' : 'سنوي'}</Text>
              </View>
            ))}
            <Text style={{ color: '#9CA3AF', fontSize: 11, textAlign: 'right', marginTop: 6 }}>الأسعار بالجنيه المصري - تطبق فوراً</Text>
          </View>
        )}

        <Text style={{ fontWeight: '900', color: COLORS.text, textAlign: 'right', marginTop: 16, fontSize: 15 }}>اختر باقتك</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
          {plans.map(p => (
            <TouchableOpacity key={p.id} onPress={() => setSelectedPlan(p.id)} style={{ width: (width - 42) / 2, backgroundColor: 'white', borderRadius: 18, padding: 14, borderWidth: 2, borderColor: selectedPlan === p.id ? COLORS.primary : COLORS.border, position: 'relative', overflow: 'hidden' }}>
              {p.popular && <View style={{ position: 'absolute', top: 0, right: 0, backgroundColor: COLORS.gold, paddingHorizontal: 8, paddingVertical: 3, borderBottomLeftRadius: 10 }}><Text style={{ fontSize: 10, fontWeight: '900' }}>الأكثر طلباً ⭐</Text></View>}
              <Text style={{ fontWeight: '900', color: COLORS.text, textAlign: 'right', marginTop: p.popular ? 12 : 0 }}>{p.name}</Text>
              <Text style={{ fontSize: 11, color: COLORS.textSec, textAlign: 'right' }}>{p.per}</Text>
              <Text style={{ fontSize: 22, fontWeight: '900', color: COLORS.primary, textAlign: 'right', marginTop: 6 }}>{p.price} ج.م</Text>
              {p.save ? <View style={{ backgroundColor: '#ECFDF5', alignSelf: 'flex-end', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 6 }}><Text style={{ fontSize: 10, color: COLORS.success, fontWeight: '800' }}>{p.save}</Text></View> : null}
              <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: selectedPlan === p.id ? COLORS.primary : COLORS.border, justifyContent: 'center', alignItems: 'center', marginTop: 8, alignSelf: 'flex-end', backgroundColor: selectedPlan === p.id ? COLORS.primary : 'white' }}>
                {selectedPlan === p.id && <Ionicons name="checkmark" size={12} color="white" />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ fontWeight: '900', color: COLORS.text, textAlign: 'right', marginTop: 16 }}>طريقة التحويل</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          {[
            { id: 'vodafone', name: 'فودافون كاش', color: '#E60000', num: '01012345678' },
            { id: 'etisalat', name: 'اتصالات كاش', color: '#00A651', num: '01112345678' },
            { id: 'instapay', name: 'انستا باي', color: '#6A1B9A', num: 'abtal@instapay' },
          ].map(m => (
            <TouchableOpacity key={m.id} onPress={() => setMethod(m.id)} style={{ flex: 1, backgroundColor: method === m.id ? m.color : 'white', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: method === m.id ? m.color : COLORS.border }}>
              <Ionicons name="phone-portrait" size={20} color={method === m.id ? 'white' : m.color} />
              <Text style={{ fontSize: 11, fontWeight: '800', color: method === m.id ? 'white' : COLORS.text, marginTop: 6, textAlign: 'center' }}>{m.name}</Text>
              <Text style={{ fontSize: 10, color: method === m.id ? 'rgba(255,255,255,0.8)' : COLORS.textSec, marginTop: 2 }}>{m.num}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 18, padding: 16, marginTop: 14 }}>
          <Text style={{ fontWeight: '900', color: COLORS.text, textAlign: 'right' }}>تأكيد التحويل</Text>
          <Text style={{ fontSize: 11, color: COLORS.textSec, textAlign: 'right', marginTop: 4 }}>بعد التحويل أدخل بيانات التأكيد ليتم التفعيل خلال دقائق</Text>
          <Text style={styles.label}>رقم الموبايل المحوّل منه</Text>
          <View style={styles.inputRow}><Ionicons name="call-outline" size={18} color={COLORS.textLight} /><TextInput value={phone} onChangeText={setPhone} placeholder="01xxxxxxxxx" keyboardType="phone-pad" style={styles.input} /></View>
          <Text style={styles.label}>رقم المعاملة / العملية</Text>
          <View style={styles.inputRow}><Ionicons name="receipt-outline" size={18} color={COLORS.textLight} /><TextInput value={trx} onChangeText={setTrx} placeholder="مثال: Trx123456789" style={styles.input} /></View>
          <TouchableOpacity
            onPress={() => {
              if (!phone || !trx) { Alert.alert('تنبيه', 'أدخل رقم الموبايل ورقم المعاملة'); return; }
              Alert.alert('تم الاستلام ✅', 'سيتم مراجعة المعاملة وتفعيل اشتراكك خلال دقائق. ستصلك إشعار فور التفعيل.');
              setUser({ ...user, isSubscribed: true, plan: selectedPlan, demoDaysLeft: 30 });
              navigation.goBack();
            }}
            style={{ backgroundColor: COLORS.success, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 14, flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
            <Ionicons name="send" size={16} color="white" />
            <Text style={{ color: 'white', fontWeight: '900' }}>إرسال للتأكيد والتفعيل</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 11, color: COLORS.textLight, textAlign: 'center', marginTop: 8 }}>الأدمن يراجع ويفعّل يدوياً لضمان الدقة</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// HOME
function HomeScreen({ navigation }: any) {
  const { user, stats, setStats, adminPrices } = useApp();
  const diligenceLevel = stats.diligence >= 85 ? 'بطل الثانوية 🏆' : stats.diligence >= 70 ? 'متقدم 🚀' : stats.diligence >= 50 ? 'مجتهد 💪' : 'مبتدئ 🌱';
  const daysLeft = Math.max(0, Math.ceil((new Date(user.examDate).getTime() - new Date().getTime()) / 86400000));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* HEADER */}
        <LinearGradient colors={[COLORS.primary, '#1E5BCA']} style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="notifications" size={20} color="white" />
                <View style={{ position: 'absolute', top: 6, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.gold, borderWidth: 1, borderColor: 'white' }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Subscription')} style={{ backgroundColor: user.isSubscribed ? COLORS.success : COLORS.gold, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }}>
                <Text style={{ fontSize: 11, fontWeight: '900', color: user.isSubscribed ? 'white' : COLORS.text }}>{user.isSubscribed ? 'مفعل ✓' : `تجريبي ${user.demoDaysLeft} أيام`}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: 'white', fontWeight: '900', fontSize: 14, textAlign: 'right' }}>أهلاً، {user.name.split(' ')[0]} 👋</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, textAlign: 'right' }}>{TRACKS.find(t => t.id === user.track)?.name || 'ثانوية عامة'} • {daysLeft} يوم للامتحان</Text>
              </View>
              <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontWeight: '900', color: COLORS.primary }}>{user.name.charAt(0)}</Text>
              </View>
            </View>
          </View>

          {/* DILIGENCE CARD */}
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 16, marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <ProgressCircle percent={stats.progress} size={86} color={COLORS.primary} />
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.goldLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: '900', color: COLORS.text }}>{diligenceLevel}</Text>
                <Ionicons name="trophy" size={14} color={COLORS.goldDark} />
              </View>
              <Text style={{ fontWeight: '900', color: COLORS.text, fontSize: 14, marginTop: 6, textAlign: 'right' }}>مؤشر الطالب المجتهد</Text>
              <Text style={{ fontSize: 11, color: COLORS.textSec, textAlign: 'right' }}>درجتك {stats.diligence}/100 بناءً على الالتزام والاختبارات وعلاج الأخطاء</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, justifyContent: 'flex-end' }}>
                <View style={{ alignItems: 'center', backgroundColor: COLORS.bg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }}>
                  <Text style={{ fontWeight: '900', color: COLORS.primary, fontSize: 12 }}>{stats.streak} 🔥</Text>
                  <Text style={{ fontSize: 9, color: COLORS.textSec }}>Streak</Text>
                </View>
                <View style={{ alignItems: 'center', backgroundColor: COLORS.bg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }}>
                  <Text style={{ fontWeight: '900', color: COLORS.text, fontSize: 12 }}>{stats.sessions}</Text>
                  <Text style={{ fontSize: 9, color: COLORS.textSec }}>جلسات</Text>
                </View>
                <View style={{ alignItems: 'center', backgroundColor: COLORS.bg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }}>
                  <Text style={{ fontWeight: '900', color: COLORS.text, fontSize: 12 }}>{stats.totalHours}h</Text>
                  <Text style={{ fontSize: 9, color: COLORS.textSec }}>ساعات</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* SKILLS */}
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.navigate('Analysis')}><Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: '800' }}>عرض التحليل →</Text></TouchableOpacity>
            <Text style={{ fontWeight: '900', color: COLORS.text, textAlign: 'right' }}>تحليل مهاراتك</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            {[
              { k: 'الالتزام', v: 78, c: COLORS.primary },
              { k: 'المذاكرة', v: 65, c: COLORS.teal },
              { k: 'الاختبارات', v: 58, c: COLORS.warning },
              { k: 'علاج الأخطاء', v: 42, c: COLORS.error },
            ].map(s => (
              <View key={s.k} style={{ flex: 1, backgroundColor: 'white', borderRadius: 14, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: COLORS.text, textAlign: 'center' }}>{s.k}</Text>
                <View style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 3, borderColor: s.c, justifyContent: 'center', alignItems: 'center', marginTop: 6 }}>
                  <Text style={{ fontWeight: '900', fontSize: 11, color: s.c }}>{s.v}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* WEAKNESS */}
        <View style={{ marginHorizontal: 16, marginTop: 14, backgroundColor: '#FFF1F2', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#FECDD3', flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={{ fontWeight: '900', color: '#9F1239', fontSize: 13, textAlign: 'right' }}>نقطة ضعف مكتشفة ⚠️</Text>
            <Text style={{ fontSize: 12, color: '#881337', textAlign: 'right', marginTop: 4 }}>الفيزياء - الفصل الثاني (الديناميكا) • تكررت 4 أخطاء</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Mistakes')} style={{ backgroundColor: '#E11D48', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginTop: 8, alignSelf: 'flex-end' }}><Text style={{ color: 'white', fontSize: 11, fontWeight: '800' }}>ابدأ علاج الأخطاء →</Text></TouchableOpacity>
          </View>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#E11D48', justifyContent: 'center', alignItems: 'center' }}><Ionicons name="alert-circle" size={22} color="white" /></View>
        </View>

        {/* SUBJECT PROGRESS */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: COLORS.textSec, fontSize: 11 }}>{user.subjects.length} مواد</Text>
            <Text style={{ fontWeight: '900', color: COLORS.text }}>تقدم المواد</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 10, paddingRight: 4 }}>
            {user.subjects.slice(0, 6).map(sub => {
              const prog = stats.subjectProgress[sub] ?? Math.floor(Math.random() * 60) + 20;
              return (
                <View key={sub} style={{ width: 140, backgroundColor: 'white', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: COLORS.border }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end' }}>
                    <Ionicons name={(SUBJECT_ICONS[sub] || 'book') as any} size={18} color={COLORS.primary} />
                  </View>
                  <Text style={{ fontWeight: '800', fontSize: 12, color: COLORS.text, textAlign: 'right', marginTop: 8, height: 32 }}>{sub}</Text>
                  <View style={{ height: 6, backgroundColor: COLORS.bg, borderRadius: 6, marginTop: 8, overflow: 'hidden' }}>
                    <View style={{ width: `${prog}%`, height: 6, backgroundColor: prog > 70 ? COLORS.success : prog > 40 ? COLORS.warning : COLORS.primary, borderRadius: 6 }} />
                  </View>
                  <Text style={{ fontSize: 11, color: COLORS.textSec, textAlign: 'right', marginTop: 4 }}>{prog}% مكتمل</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* QUICK ACTIONS */}
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 16 }}>
          <TouchableOpacity onPress={() => navigation.navigate('StudyTab')} style={{ flex: 1, backgroundColor: COLORS.primary, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}><Ionicons name="play" size={20} color="white" /></View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 13, textAlign: 'right' }}>ابدأ مذاكرة</Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, textAlign: 'right' }}>25 دقيقة تركيز</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ExamsTab')} style={{ flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: COLORS.border }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.goldLight, justifyContent: 'center', alignItems: 'center' }}><Ionicons name="create" size={20} color={COLORS.goldDark} /></View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={{ color: COLORS.text, fontWeight: '900', fontSize: 13, textAlign: 'right' }}>اختبر نفسك</Text>
              <Text style={{ color: COLORS.textSec, fontSize: 11, textAlign: 'right' }}>AI بأسئلة وزارية</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* RECENT TESTS + ERRORS */}
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 12 }}>
          <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: COLORS.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Ionicons name="bug" size={16} color={COLORS.error} />
              <Text style={{ fontWeight: '800', fontSize: 12, color: COLORS.text }}>أخطاء للمراجعة</Text>
            </View>
            <Text style={{ fontSize: 22, fontWeight: '900', color: COLORS.error, textAlign: 'right', marginTop: 6 }}>{stats.errors.length}</Text>
            <Text style={{ fontSize: 11, color: COLORS.textSec, textAlign: 'right' }}>سؤال يحتاج مراجعة</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Mistakes')} style={{ backgroundColor: '#FEF2F2', borderRadius: 10, paddingVertical: 8, alignItems: 'center', marginTop: 10 }}><Text style={{ color: COLORS.error, fontWeight: '800', fontSize: 12 }}>راجع الآن</Text></TouchableOpacity>
          </View>
          <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: COLORS.border }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Ionicons name="analytics" size={16} color={COLORS.success} />
              <Text style={{ fontWeight: '800', fontSize: 12, color: COLORS.text }}>آخر اختبار</Text>
            </View>
            <Text style={{ fontSize: 22, fontWeight: '900', color: COLORS.success, textAlign: 'right', marginTop: 6 }}>82%</Text>
            <Text style={{ fontSize: 11, color: COLORS.textSec, textAlign: 'right' }}>فيزياء - الفصل الأول</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ExamsTab')} style={{ backgroundColor: '#ECFDF5', borderRadius: 10, paddingVertical: 8, alignItems: 'center', marginTop: 10 }}><Text style={{ color: COLORS.success, fontWeight: '800', fontSize: 12 }}>تحليل النتيجة</Text></TouchableOpacity>
          </View>
        </View>

        {/* ACHIEVEMENTS PREVIEW */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity><Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: '800' }}>كل الإنجازات →</Text></TouchableOpacity>
            <Text style={{ fontWeight: '900', color: COLORS.text }}>الإنجازات 🏅</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 10 }}>
            {[
              { title: 'أول جلسة', icon: 'flame', done: true, color: COLORS.warning },
              { title: '5 أيام متتالية', icon: 'calendar', done: true, color: COLORS.success },
              { title: 'بطل الفيزياء', icon: 'trophy', done: false, color: COLORS.primary },
              { title: '100 سؤال', icon: 'bulb', done: false, color: COLORS.purple },
            ].map(a => (
              <View key={a.title} style={{ width: 100, backgroundColor: 'white', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: a.done ? COLORS.gold : COLORS.border, opacity: a.done ? 1 : 0.6 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: a.done ? COLORS.goldLight : COLORS.bg, justifyContent: 'center', alignItems: 'center' }}><Ionicons name={a.icon as any} size={20} color={a.done ? COLORS.goldDark : COLORS.textLight} /></View>
                <Text style={{ fontSize: 11, fontWeight: '800', color: COLORS.text, marginTop: 6, textAlign: 'center' }}>{a.title}</Text>
                <Text style={{ fontSize: 10, color: a.done ? COLORS.success : COLORS.textLight }}>{a.done ? 'تم ✓' : 'قيد التقدم'}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TimerScreen() {
  const { stats, setStats } = useApp();
  const [mode, setMode] = useState<'pomodoro' | 'quick'>('pomodoro');
  const [seconds, setSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef<any>(null);
  const [sessionsToday, setSessionsToday] = useState(2);

  useEffect(() => {
    if (mode === 'pomodoro') setSeconds(isBreak ? 5 * 60 : 25 * 60);
    else setSeconds(10 * 60);
  }, [mode, isBreak]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            // finished
            if (!isBreak) {
              // pomodoro session done
              setStats((prev: any) => ({
                ...prev,
                totalHours: +(prev.totalHours + (mode === 'quick' ? 0.17 : 0.42)).toFixed(2),
                sessions: prev.sessions + 1,
                streak: prev.streak,
                progress: Math.min(100, prev.progress + 1),
                diligence: Math.min(100, prev.diligence + 2),
                subjectProgress: { ...prev.subjectProgress },
              }));
              setSessionsToday(p => p + 1);
              setTimeout(() => Alert.alert('أحسنت يا بطل! 🎉', mode === 'quick' ? 'أنهيت تحدي الـ10 دقائق بنجاح' : 'أنهيت 25 دقيقة تركيز! استحققت 5 دقائق راحة.'), 300);
              if (mode === 'pomodoro') { setIsBreak(true); setSeconds(5 * 60); }
            } else {
              setIsBreak(false);
              setSeconds(25 * 60);
              Alert.alert('انتهت الراحة ☕', 'جاهز لجلسة جديدة؟');
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  const progress = mode === 'quick' ? (600 - seconds) / 600 : isBreak ? (300 - seconds) / 300 : (1500 - seconds) / 1500;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: COLORS.text, textAlign: 'right' }}>جلسة المذاكرة ⏱️</Text>
        <Text style={{ fontSize: 12, color: COLORS.textSec, textAlign: 'right', marginTop: 4 }}>ركز.. كل دقيقة تقربك من حلمك</Text>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, backgroundColor: 'white', borderRadius: 14, padding: 4, borderWidth: 1, borderColor: COLORS.border, alignSelf: 'flex-end' }}>
          <TouchableOpacity onPress={() => { setMode('quick'); setIsRunning(false); setIsBreak(false); }} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: mode === 'quick' ? COLORS.primary : 'transparent' }}>
            <Text style={{ fontWeight: '800', fontSize: 12, color: mode === 'quick' ? 'white' : COLORS.textSec }}>تحدي 10 دقائق ⚡</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setMode('pomodoro'); setIsRunning(false); }} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: mode === 'pomodoro' ? COLORS.primary : 'transparent' }}>
            <Text style={{ fontWeight: '800', fontSize: 12, color: mode === 'pomodoro' ? 'white' : COLORS.textSec }}>25/5 بومودورو</Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 28, padding: 20, marginTop: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOpacity: 0.06, elevation: 4 }}>
          <View style={{ backgroundColor: isBreak ? '#ECFDF5' : COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: isBreak ? COLORS.success : COLORS.primary }}>{isBreak ? '☕ وقت الراحة - 5 دقائق' : mode === 'quick' ? '⚡ تحدي سريع - 10 دقائق' : '📚 تركيز عميق - 25 دقيقة'}</Text>
          </View>

          <View style={{ width: 220, height: 220, borderRadius: 110, borderWidth: 8, borderColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', marginTop: 16, position: 'relative', overflow: 'hidden' }}>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isBreak ? '#ECFDF5' : COLORS.primaryLight, opacity: 0.5 }} />
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${progress * 100}%`, backgroundColor: isBreak ? COLORS.success + '30' : COLORS.primary + '18' }} />
            <Text style={{ fontSize: 52, fontWeight: '900', color: isBreak ? COLORS.success : COLORS.primary, letterSpacing: 2 }}>{mins}:{secs}</Text>
            <Text style={{ fontSize: 12, color: COLORS.textSec, marginTop: 4 }}>{isRunning ? 'جاري العد...' : 'متوقف'}</Text>
            <View style={{ flexDirection: 'row', gap: 4, marginTop: 8 }}>
              {[...Array(4)].map((_, i) => <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: progress > (i + 1) * 0.25 ? (isBreak ? COLORS.success : COLORS.primary) : COLORS.border }} />)}
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
            <TouchableOpacity onPress={() => { setIsRunning(false); setSeconds(mode === 'quick' ? 600 : isBreak ? 300 : 1500); }} style={{ width: 54, height: 54, borderRadius: 16, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border }}>
              <Ionicons name="refresh" size={20} color={COLORS.textSec} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsRunning(!isRunning)} style={{ flex: 1, backgroundColor: isRunning ? COLORS.error : COLORS.primary, borderRadius: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, shadowColor: isRunning ? COLORS.error : COLORS.primary, shadowOpacity: 0.3, elevation: 4 }}>
              <Ionicons name={isRunning ? "pause" : "play"} size={22} color="white" />
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 15 }}>{isRunning ? 'إيقاف مؤقت' : 'ابدأ الآن'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setIsRunning(false);
                setSeconds(mode === 'quick' ? 600 : isBreak ? 300 : 1500);
                if (!isBreak) {
                  setStats((p: any) => ({ ...p, totalHours: +(p.totalHours + 0.42).toFixed(2), sessions: p.sessions + 1, diligence: Math.min(100, p.diligence + 1) }));
                  setSessionsToday(v => v + 1);
                  Alert.alert('تم التسجيل ✅', 'تم احتساب الجلسة يدوياً + رسالة تشجيعية: ممتاز! استمرارك هو سر التفوق 💪');
                }
              }}
              style={{ paddingHorizontal: 14, borderRadius: 16, backgroundColor: COLORS.success, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 6 }}>
              <Ionicons name="checkmark-done" size={18} color="white" />
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>خلصت</Text>
            </TouchableOpacity>
          </View>

          <View style={{ backgroundColor: '#FFF7ED', borderRadius: 12, padding: 12, marginTop: 16, width: '100%', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Ionicons name="bulb" size={18} color={COLORS.warning} />
            <Text style={{ fontSize: 11, color: '#9A3412', flex: 1, textAlign: 'right', lineHeight: 16 }}>"الاستمرارية أهم من الكمال. 25 دقيقة يومياً تصنع بطلاً!"</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
          <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border }}>
            <Text style={{ fontSize: 11, color: COLORS.textSec }}>جلسات اليوم</Text>
            <Text style={{ fontSize: 22, fontWeight: '900', color: COLORS.primary, marginTop: 4 }}>{sessionsToday}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border }}>
            <Text style={{ fontSize: 11, color: COLORS.textSec }}>إجمالي الساعات</Text>
            <Text style={{ fontSize: 22, fontWeight: '900', color: COLORS.text, marginTop: 4 }}>{stats.totalHours}h</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border }}>
            <Text style={{ fontSize: 11, color: COLORS.textSec }}>الـ Streak</Text>
            <Text style={{ fontSize: 22, fontWeight: '900', color: COLORS.warning, marginTop: 4 }}>{stats.streak} 🔥</Text>
          </View>
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 14, marginTop: 14, borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ fontWeight: '900', color: COLORS.text, textAlign: 'right', fontSize: 13 }}>جلسات اليوم</Text>
          {[
            { time: '09:30', sub: 'الفيزياء - الفصل الأول', dur: '25د', done: true },
            { time: '11:00', sub: 'الكيمياء - الباب الثاني', dur: '25د', done: true },
            { time: '16:00', sub: 'الأحياء - مراجعة', dur: '25د', done: false },
          ].map((s, i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: i < 2 ? 1 : 0, borderColor: COLORS.border }}>
              <View style={{ backgroundColor: s.done ? '#ECFDF5' : COLORS.goldLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}><Text style={{ fontSize: 11, fontWeight: '800', color: s.done ? COLORS.success : COLORS.warning }}>{s.done ? 'مكتمل ✓' : 'قادم'}</Text></View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontWeight: '700', fontSize: 12, color: COLORS.text, textAlign: 'right' }}>{s.sub}</Text>
                <Text style={{ fontSize: 11, color: COLORS.textSec }}>{s.time} • {s.dur}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PlanScreen() {
  const { user, stats } = useApp();
  const [smart, setSmart] = useState(false);
  const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  const generatePlan = () => {
    // simple distribution
    return days.map(d => ({
      day: d,
      subjects: user.subjects.slice(0, 3).map((s, i) => ({ name: s, hours: i === 0 ? 2 : 1.5 })),
      total: 5,
    }));
  };
  const [plan, setPlan] = useState(generatePlan());

  useEffect(() => { if (smart) setPlan(generatePlan()); }, [smart]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: COLORS.text, textAlign: 'right' }}>خطة المذاكرة 📅</Text>
        <Text style={{ fontSize: 12, color: COLORS.textSec, textAlign: 'right', marginTop: 4 }}>خطة أسبوعية موزعة بذكاء حسب وقتك وموادك</Text>

        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 14, marginTop: 14, flexDirection: 'row', gap: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border }}>
          <TouchableOpacity onPress={() => setSmart(!smart)} style={{ backgroundColor: smart ? COLORS.primary : COLORS.bg, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: smart ? COLORS.primary : COLORS.border }}>
            <Text style={{ fontWeight: '800', fontSize: 12, color: smart ? 'white' : COLORS.textSec }}>{smart ? '✓ خطة ذكية مفعلة' : 'تفعيل الذكاء'}</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={{ fontWeight: '900', fontSize: 13, color: COLORS.text, textAlign: 'right' }}>{smart ? 'خطة ذكية حسب مستواك وموعد الامتحان' : 'الخطة الحالية بسيطة'}</Text>
            <Text style={{ fontSize: 11, color: COLORS.textSec, textAlign: 'right' }}>{user.dailyHours} ساعات يومياً • {user.subjects.length} مواد</Text>
          </View>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: smart ? COLORS.success : COLORS.warning, justifyContent: 'center', alignItems: 'center' }}><Ionicons name={smart ? "sparkles" : "warning"} size={20} color="white" /></View>
        </View>

        {smart && <View style={{ backgroundColor: '#ECFDF5', borderRadius: 12, padding: 12, marginTop: 10, borderWidth: 1, borderColor: '#A7F3D0' }}><Text style={{ fontSize: 11, color: '#065F46', textAlign: 'right', lineHeight: 16 }}>✨ تم توليد خطة ذكية تراعي: مستواك الحالي، الأجزاء المتبقية، نقاط ضعفك (فيزياء ضعيفة → ساعات أكثر)، وقرب الامتحان ({Math.ceil((new Date(user.examDate).getTime() - Date.now()) / 86400000)} يوم)</Text></View>}

        <View style={{ marginTop: 12, gap: 10 }}>
          {plan.map((d, idx) => (
            <View key={d.day} style={{ backgroundColor: 'white', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: idx === new Date().getDay() ? COLORS.primary : COLORS.border, borderLeftWidth: idx === new Date().getDay() ? 4 : 1, borderLeftColor: COLORS.primary }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ backgroundColor: idx === new Date().getDay() ? COLORS.primary : COLORS.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}><Text style={{ fontSize: 11, fontWeight: '800', color: idx === new Date().getDay() ? 'white' : COLORS.textSec }}>{d.total} ساعات</Text></View>
                <Text style={{ fontWeight: '900', color: COLORS.text }}>{d.day} {idx === new Date().getDay() ? '• اليوم' : ''}</Text>
              </View>
              <View style={{ gap: 8, marginTop: 10 }}>
                {d.subjects.map(s => (
                  <View key={s.name} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.bg, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.primary }}>{s.hours} س</Text>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.text }}>{s.name}</Text>
                      <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}><Ionicons name={(SUBJECT_ICONS[s.name] || 'book') as any} size={14} color={COLORS.primary} /></View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={() => Alert.alert('تم التحديث', 'تم إعادة توزيع الخطة بذكاء بناءً على تقدمك الحالي')} style={{ backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 14, flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
          <Ionicons name="refresh" size={18} color="white" />
          <Text style={{ color: 'white', fontWeight: '900' }}>إعادة توليد الخطة الذكية</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ExamsScreen({ navigation }: any) {
  const { user, stats, setStats } = useApp();
  const [tab, setTab] = useState<'regular' | 'ai'>('regular');
  const [aiForm, setAiForm] = useState({ subject: user.subjects[0] || 'الفيزياء', scope: 'الفصل الأول', count: '10', diff: 'متوسط', type: 'بابل شيت' });
  const [showAIForm, setShowAIForm] = useState(false);

  const regularExams = user.subjects.slice(0, 4).map(s => ({ subject: s, title: `اختبار ${s} - شامل`, qs: 15, time: 20, done: Math.random() > 0.5 }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: COLORS.text, textAlign: 'right' }}>الاختبارات 📝</Text>
        <Text style={{ fontSize: 12, color: COLORS.textSec, textAlign: 'right', marginTop: 4 }}>بنك أسئلة وزاري + توليد AI لا نهائي</Text>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, backgroundColor: 'white', borderRadius: 14, padding: 4, alignSelf: 'flex-end', borderWidth: 1, borderColor: COLORS.border }}>
          <TouchableOpacity onPress={() => setTab('ai')} style={{ paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10, backgroundColor: tab === 'ai' ? COLORS.purple : 'transparent', flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <Ionicons name="sparkles" size={14} color={tab === 'ai' ? 'white' : COLORS.textSec} />
            <Text style={{ fontWeight: '800', fontSize: 12, color: tab === 'ai' ? 'white' : COLORS.textSec }}>ذكاء اصطناعي</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('regular')} style={{ paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10, backgroundColor: tab === 'regular' ? COLORS.primary : 'transparent' }}>
            <Text style={{ fontWeight: '800', fontSize: 12, color: tab === 'regular' ? 'white' : COLORS.textSec }}>تقليدي</Text>
          </TouchableOpacity>
        </View>

        {tab === 'regular' ? (
          <View style={{ marginTop: 14, gap: 10 }}>
            {regularExams.map((ex, i) => (
              <View key={i} style={{ backgroundColor: 'white', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ExamTake', { subject: ex.subject, mode: 'regular' })}
                  style={{ backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 }}>
                  <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>ابدأ</Text>
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={{ fontWeight: '900', fontSize: 13, color: COLORS.text, textAlign: 'right' }}>{ex.title}</Text>
                  <Text style={{ fontSize: 11, color: COLORS.textSec, textAlign: 'right', marginTop: 2 }}>{ex.qs} سؤال • {ex.time} دقيقة • {ex.done ? 'تم حله 82%' : 'لم يبدأ'}</Text>
                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: COLORS.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}><Text style={{ fontSize: 10, color: COLORS.textSec }}>صحح تلقائياً</Text></View>
                    <View style={{ backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}><Text style={{ fontSize: 10, color: COLORS.error }}>تسجيل أخطاء</Text></View>
                  </View>
                </View>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' }}><Ionicons name={(SUBJECT_ICONS[ex.subject] || 'document') as any} size={20} color={COLORS.primary} /></View>
              </View>
            ))}
            <View style={{ backgroundColor: '#FFF7ED', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#FDBA74', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Ionicons name="information-circle" size={18} color="#C2410C" />
              <Text style={{ fontSize: 11, color: '#9A3412', flex: 1, textAlign: 'right' }}>قاعدة الأسئلة الحالية محدودة (تجريبية). فعّل الـ AI للحصول على بنك لا نهائي متجدد</Text>
            </View>
          </View>
        ) : (
          <View style={{ marginTop: 14 }}>
            <LinearGradient colors={['#7C3AED', '#A78BFA']} style={{ borderRadius: 20, padding: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}><Text style={{ color: 'white', fontSize: 11, fontWeight: '800' }}>GPT-4 • متجدد</Text></View>
                <Ionicons name="sparkles" size={24} color="white" />
              </View>
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 16, textAlign: 'right', marginTop: 8 }}>اختبارات بالذكاء الاصطناعي 🤖</Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, textAlign: 'right', marginTop: 4, lineHeight: 16 }}>أنشئ اختبار في ثوانٍ: حسب المادة/الدرس/الفصل/المنهج كاملاً • بابل شيت أو مقالي أو خليط • مستوى متوسط وعالي من كتب الوزارة والنماذج الاسترشادية</Text>
              <TouchableOpacity onPress={() => setShowAIForm(true)} style={{ backgroundColor: 'white', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 12, flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                <Ionicons name="add-circle" size={18} color={COLORS.purple} />
                <Text style={{ color: COLORS.purple, fontWeight: '900' }}>إنشاء اختبار AI جديد</Text>
              </TouchableOpacity>
            </LinearGradient>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: COLORS.border }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end' }}><Ionicons name="list" size={18} color={COLORS.purple} /></View>
                <Text style={{ fontWeight: '800', fontSize: 12, color: COLORS.text, textAlign: 'right', marginTop: 8 }}>اختيار من متعدد AI</Text>
                <Text style={{ fontSize: 11, color: COLORS.textSec, textAlign: 'right' }}>تصحيح فوري + تسجيل الأخطاء</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: COLORS.border }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', alignSelf: 'flex-end' }}><Ionicons name="create" size={18} color={COLORS.warning} /></View>
                <Text style={{ fontWeight: '800', fontSize: 12, color: COLORS.text, textAlign: 'right', marginTop: 8 }}>مقالي AI</Text>
                <Text style={{ fontSize: 11, color: COLORS.textSec, textAlign: 'right' }}>تكتب إجابتك و AI يصحح /100</Text>
              </View>
            </View>

            <Text style={{ fontWeight: '900', color: COLORS.text, textAlign: 'right', marginTop: 16 }}>اختبارات AI جاهزة</Text>
            {[
              { s: 'الفيزياء', scope: 'الفصل الأول كامل', n: 15, diff: 'عالي', type: 'بابل شيت' },
              { s: 'الكيمياء', scope: 'الباب الثاني', n: 10, diff: 'متوسط', type: 'مقالي' },
            ].map((x, i) => (
              <View key={i} style={{ backgroundColor: 'white', borderRadius: 14, padding: 12, marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: COLORS.border }}>
                <TouchableOpacity onPress={() => navigation.navigate('ExamTake', { subject: x.s, mode: 'ai', type: x.type })} style={{ backgroundColor: COLORS.purple, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}><Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>ابدأ</Text></TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={{ fontWeight: '800', fontSize: 12, color: COLORS.text, textAlign: 'right' }}>{x.s} - {x.scope}</Text>
                  <Text style={{ fontSize: 11, color: COLORS.textSec }}>{x.n} أسئلة • {x.diff} • {x.type}</Text>
                </View>
                <Ionicons name="sparkles" size={18} color={COLORS.purple} />
              </View>
            ))}
          </View>
        )}

        <Modal visible={showAIForm} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: height * 0.85 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setShowAIForm(false)}><Ionicons name="close" size={22} color={COLORS.text} /></TouchableOpacity>
                <Text style={{ fontWeight: '900', fontSize: 16, color: COLORS.text }}>إنشاء اختبار AI</Text>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
                <Text style={styles.label}>المادة</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                  {user.subjects.map(s => (
                    <TouchableOpacity key={s} onPress={() => setAiForm({ ...aiForm, subject: s })} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: aiForm.subject === s ? COLORS.purple : COLORS.bg, borderWidth: 1, borderColor: aiForm.subject === s ? COLORS.purple : COLORS.border }}>
                      <Text style={{ fontWeight: '700', fontSize: 12, color: aiForm.subject === s ? 'white' : COLORS.text }}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.label}>النطاق</Text>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {['درس واحد', 'الفصل الأول', 'الفصل كامل', 'المنهج بالكامل'].map(v => (
                    <TouchableOpacity key={v} onPress={() => setAiForm({ ...aiForm, scope: v })} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: aiForm.scope === v ? COLORS.primary : 'white', borderWidth: 1, borderColor: aiForm.scope === v ? COLORS.primary : COLORS.border }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: aiForm.scope === v ? 'white' : COLORS.text }}>{v}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>عدد الأسئلة</Text>
                    <View style={styles.inputRow}><TextInput value={aiForm.count} onChangeText={v => setAiForm({ ...aiForm, count: v })} keyboardType="numeric" style={styles.input} /><Ionicons name="help-circle-outline" size={16} color={COLORS.textLight} /></View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>الصعوبة</Text>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {['متوسط', 'عالي'].map(d => (
                        <TouchableOpacity key={d} onPress={() => setAiForm({ ...aiForm, diff: d })} style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: aiForm.diff === d ? COLORS.warning : COLORS.bg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border }}>
                          <Text style={{ fontSize: 12, fontWeight: '800', color: aiForm.diff === d ? 'white' : COLORS.text }}>{d}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <Text style={styles.label}>نوع الأسئلة</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {['بابل شيت', 'مقالي', 'خليط'].map(t => (
                    <TouchableOpacity key={t} onPress={() => setAiForm({ ...aiForm, type: t })} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: aiForm.type === t ? COLORS.success : 'white', borderWidth: 1, borderColor: aiForm.type === t ? COLORS.success : COLORS.border, alignItems: 'center' }}>
                      <Text style={{ fontWeight: '800', fontSize: 12, color: aiForm.type === t ? 'white' : COLORS.text }}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setShowAIForm(false);
                    navigation.navigate('ExamTake', { subject: aiForm.subject, mode: 'ai', type: aiForm.type, count: aiForm.count });
                  }}
                  style={{ backgroundColor: COLORS.purple, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 16, flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                  <Ionicons name="sparkles" size={18} color="white" />
                  <Text style={{ color: 'white', fontWeight: '900' }}>توليد الأسئلة الآن ✨</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 11, color: COLORS.textLight, textAlign: 'center', marginTop: 8 }}>أسئلة متغيرة غير متكررة من كتب الوزارة والنماذج الاسترشادية</Text>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

function ExamTakeScreen({ route, navigation }: any) {
  const { subject, mode, type } = route.params || {};
  const { stats, setStats } = useApp();
  const bank = QUESTION_BANK[subject] || QUESTION_BANK['الفيزياء'];
  const questions = mode === 'ai' ? [...bank, ...bank].slice(0, 5) : bank.slice(0, 3);
  const isEssay = type === 'مقالي';
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAns, setShowAns] = useState(false);
  const [essayAns, setEssayAns] = useState('');
  const [essayScore, setEssayScore] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const q = questions[idx];

  const handleNext = () => {
    if (!showAns && !isEssay) return;
    if (idx < questions.length - 1) {
      setIdx(idx + 1);
      setSelected(null);
      setShowAns(false);
      setEssayAns('');
      setEssayScore(null);
    } else {
      // finish
      const finalScore = Math.round((score / questions.length) * 100);
      setFinished(true);
      // record errors
      if (score < questions.length) {
        setStats((p: any) => ({ ...p, errors: [...p.errors, { subject, q: q.q, correct: q.opts[q.ans], date: new Date().toLocaleDateString('ar-EG') }], diligence: Math.min(100, p.diligence + 1) }));
      } else setStats((p: any) => ({ ...p, diligence: Math.min(100, p.diligence + 2) }));
    }
  };

  if (finished) {
    const perc = Math.round((score / questions.length) * 100);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', padding: 20 }}>
        <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: perc >= 60 ? '#ECFDF5' : '#FEF2F2', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name={perc >= 60 ? "trophy" : "refresh"} size={36} color={perc >= 60 ? COLORS.success : COLORS.error} />
          </View>
          <Text style={{ fontWeight: '900', fontSize: 22, color: COLORS.text, marginTop: 12 }}>{perc >= 60 ? 'أحسنت يا بطل! 🎉' : 'تحتاج مراجعة 💪'}</Text>
          <Text style={{ fontSize: 42, fontWeight: '900', color: perc >= 60 ? COLORS.success : COLORS.error, marginTop: 6 }}>{perc}%</Text>
          <Text style={{ fontSize: 13, color: COLORS.textSec }}>{score} / {questions.length} إجابة صحيحة</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16, width: '100%' }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ flex: 1, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}><Text style={{ color: 'white', fontWeight: '800' }}>العودة</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { setFinished(false); setIdx(0); setScore(0); setSelected(null); setShowAns(false); }} style={{ flex: 1, backgroundColor: COLORS.bg, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border }}><Text style={{ color: COLORS.text, fontWeight: '800' }}>إعادة</Text></TouchableOpacity>
          </View>
          {perc < 60 && <TouchableOpacity onPress={() => navigation.navigate('Mistakes')} style={{ marginTop: 12 }}><Text style={{ color: COLORS.error, fontWeight: '700', fontSize: 12 }}>راجع أخطائك الآن →</Text></TouchableOpacity>}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={{ padding: 16, flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border }}><Ionicons name="close" size={18} color={COLORS.text} /></TouchableOpacity>
          <Text style={{ fontWeight: '900', color: COLORS.text }}>{subject} • {type || 'بابل شيت'}</Text>
          <View style={{ backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}><Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>{idx + 1}/{questions.length}</Text></View>
        </View>

        <View style={{ height: 6, backgroundColor: '#E5EAF5', borderRadius: 6, marginTop: 12, overflow: 'hidden' }}>
          <View style={{ width: `${((idx + 1) / questions.length) * 100}%`, height: 6, backgroundColor: COLORS.primary }} />
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 16, marginTop: 14, borderWidth: 1, borderColor: COLORS.border, flex: 1 }}>
          <Text style={{ fontWeight: '800', color: COLORS.textSec, fontSize: 11, textAlign: 'right' }}>السؤال {idx + 1}</Text>
          <Text style={{ fontWeight: '900', color: COLORS.text, fontSize: 16, textAlign: 'right', marginTop: 6, lineHeight: 24 }}>{q.q}</Text>

          {isEssay ? (
            <View style={{ marginTop: 16, flex: 1 }}>
              <Text style={{ fontSize: 12, color: COLORS.textSec, textAlign: 'right' }}>اكتب إجابتك وسيقوم الذكاء الاصطناعي بالتصحيح</Text>
              <TextInput value={essayAns} onChangeText={setEssayAns} placeholder="اكتب إجابتك هنا..." placeholderTextColor="#9CA3AF" multiline style={{ backgroundColor: COLORS.bg, borderRadius: 14, padding: 14, textAlign: 'right', textAlignVertical: 'top', minHeight: 120, marginTop: 10, borderWidth: 1, borderColor: COLORS.border }} />
              {essayScore === null ? (
                <TouchableOpacity
                  onPress={() => {
                    if (!essayAns.trim()) { Alert.alert('تنبيه', 'اكتب إجابتك أولاً'); return; }
                    const s = Math.floor(Math.random() * 30) + 65; // mock AI scoring 65-95
                    setEssayScore(s);
                    if (s >= 60) setScore(sc => sc + 1);
                  }}
                  style={{ backgroundColor: COLORS.purple, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 12, flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                  <Ionicons name="sparkles" size={16} color="white" />
                  <Text style={{ color: 'white', fontWeight: '800' }}>صحح بالذكاء الاصطناعي</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ backgroundColor: essayScore >= 60 ? '#ECFDF5' : '#FEF2F2', borderRadius: 14, padding: 14, marginTop: 12, borderWidth: 1, borderColor: essayScore >= 60 ? '#A7F3D0' : '#FECACA' }}>
                  <Text style={{ fontWeight: '900', fontSize: 22, color: essayScore >= 60 ? COLORS.success : COLORS.error, textAlign: 'center' }}>{essayScore}/100</Text>
                  <Text style={{ fontSize: 12, color: COLORS.textSec, textAlign: 'center', marginTop: 4 }}>{essayScore >= 60 ? 'إجابة جيدة! التزام بالنموذج' : 'تحتاج تحسين - راجع نموذج الإجابة'}</Text>
                  <Text style={{ fontSize: 11, color: COLORS.textSec, textAlign: 'right', marginTop: 8, lineHeight: 16 }}>نموذج الإجابة: يحدث التنفس الخلوي في الميتوكندريا لإنتاج الطاقة ATP...</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={{ marginTop: 16, gap: 10 }}>
              {q.opts.map((opt: string, i: number) => {
                const isCorrect = i === q.ans;
                const isSelected = selected === i;
                let bg = 'white', border = COLORS.border, txt = COLORS.text;
                if (showAns) {
                  if (isCorrect) { bg = '#ECFDF5'; border = COLORS.success; txt = COLORS.success; }
                  else if (isSelected && !isCorrect) { bg = '#FEF2F2'; border = COLORS.error; txt = COLORS.error; }
                } else if (isSelected) { bg = COLORS.primaryLight; border = COLORS.primary; txt = COLORS.primary; }
                return (
                  <TouchableOpacity key={i} onPress={() => !showAns && setSelected(i)} style={{ padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: border, backgroundColor: bg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: isSelected || (showAns && isCorrect) ? border : COLORS.border, backgroundColor: isSelected || (showAns && isCorrect) ? border : 'white', justifyContent: 'center', alignItems: 'center' }}>
                      {(isSelected || (showAns && isCorrect)) && <Ionicons name="checkmark" size={12} color="white" />}
                    </View>
                    <Text style={{ fontWeight: '700', fontSize: 13, color: txt, flex: 1, textAlign: 'right', marginRight: 10 }}>{opt}</Text>
                    <Text style={{ fontWeight: '900', color: COLORS.textLight, fontSize: 12, marginLeft: 6 }}>{['أ', 'ب', 'ج', 'د'][i]}</Text>
                  </TouchableOpacity>
                );
              })}
              {!showAns ? (
                <TouchableOpacity
                  onPress={() => {
                    if (selected === null) { Alert.alert('اختر إجابة'); return; }
                    setShowAns(true);
                    if (selected === q.ans) setScore(s => s + 1);
                  }}
                  style={{ backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 8 }}>
                  <Text style={{ color: 'white', fontWeight: '900' }}>تأكيد الإجابة</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ backgroundColor: selected === q.ans ? '#ECFDF5' : '#FEF2F2', borderRadius: 12, padding: 12, marginTop: 8, borderWidth: 1, borderColor: selected === q.ans ? '#A7F3D0' : '#FECACA' }}>
                  <Text style={{ fontWeight: '800', color: selected === q.ans ? COLORS.success : COLORS.error, textAlign: 'right' }}>{selected === q.ans ? '✓ إجابة صحيحة!' : `✗ خطأ - الإجابة الصحيحة: ${q.opts[q.ans]}`}</Text>
                </View>
              )}
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <TouchableOpacity onPress={handleNext} style={{ flex: 1, backgroundColor: (isEssay ? essayScore !== null : showAns) ? COLORS.text : COLORS.border, borderRadius: 12, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
              <Ionicons name="arrow-back" size={16} color="white" />
              <Text style={{ color: 'white', fontWeight: '800' }}>{idx === questions.length - 1 ? 'إنهاء' : 'التالي'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function ChallengeScreen({ navigation }: any) {
  const { user, stats } = useApp();
  const [friendCode, setFriendCode] = useState('ABT-' + Math.floor(1000 + Math.random() * 9000));
  const [enteredCode, setEnteredCode] = useState('');
  const [friends, setFriends] = useState([
    { name: 'سارة أحمد', code: 'ABT-4821', online: true, points: 1240 },
    { name: 'محمد علي', code: 'ABT-7732', online: false, points: 980 },
  ]);
  const [inChallenge, setInChallenge] = useState(false);
  const [challengeSec, setChallengeSec] = useState(25 * 60);
  const [leaderTab, setLeaderTab] = useState<'friends' | 'global'>('global');

  useEffect(() => {
    if (!inChallenge) return;
    const it = setInterval(() => setChallengeSec(s => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(it);
  }, [inChallenge]);

  const leaderboard = [
    { rank: 1, name: 'يوسف محمود', points: 2450, wins: 42, losses: 5, mins: 3420 },
    { rank: 2, name: 'نورا سامي', points: 2310, wins: 38, losses: 7, mins: 3180 },
    { rank: 3, name: user.name, points: stats.challengePoints || 1850, wins: stats.wins, losses: stats.losses, mins: stats.totalHours * 60 },
    { rank: 4, name: 'أحمد حسام', points: 1720, wins: 29, losses: 10, mins: 2890 },
    { rank: 5, name: 'مريم خالد', points: 1680, wins: 27, losses: 12, mins: 2740 },
  ];

  if (inChallenge) {
    const m = Math.floor(challengeSec / 60).toString().padStart(2, '0');
    const s = (challengeSec % 60).toString().padStart(2, '0');
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg, padding: 16 }}>
        <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 20, alignItems: 'center', marginTop: 20, borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ fontWeight: '900', fontSize: 18, color: COLORS.text }}>تحدي مباشر ⚔️</Text>
          <Text style={{ fontSize: 12, color: COLORS.textSec, marginTop: 4 }}>أنت vs {friends[0].name}</Text>
          <Text style={{ fontSize: 52, fontWeight: '900', color: COLORS.primary, marginTop: 16 }}>{m}:{s}</Text>
          <Text style={{ fontSize: 12, color: COLORS.textSec }}>أول من يضغط "خلصت" يفوز +10 نقاط</Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16, width: '100%' }}>
            <View style={{ flex: 1, backgroundColor: COLORS.bg, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border }}>
              <Text style={{ fontWeight: '800', color: COLORS.text }}>{friends[0].name}</Text>
              <Text style={{ fontSize: 11, color: COLORS.textSec }}>ينتظر...</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: COLORS.primaryLight, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.primary }}>
              <Text style={{ fontWeight: '800', color: COLORS.primary }}>{user.name}</Text>
              <Text style={{ fontSize: 11, color: COLORS.primary }}>أنت</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              setInChallenge(false);
              setChallengeSec(1500);
              Alert.alert('مبروك الفوز! 🎉', '+10 نقاط • تم تسجيل 25 دقيقة مذاكرة');
            }}
            style={{ backgroundColor: COLORS.success, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 30, marginTop: 16, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text style={{ color: 'white', fontWeight: '900' }}>✅ خلصت</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setInChallenge(false); setChallengeSec(1500); }} style={{ marginTop: 12 }}><Text style={{ color: COLORS.textLight, fontSize: 12 }}>انسحاب</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: COLORS.text, textAlign: 'right' }}>تحدي الأصدقاء 👥</Text>

        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 14, marginTop: 14, borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ fontWeight: '800', color: COLORS.text, textAlign: 'right', fontSize: 13 }}>كودك الخاص</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => Alert.alert('تم النسخ', friendCode)} style={{ backgroundColor: COLORS.primary, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <Ionicons name="copy" size={14} color="white" />
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>نسخ</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, backgroundColor: COLORS.bg, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.border }}>
              <Text style={{ fontWeight: '900', letterSpacing: 2, color: COLORS.primary }}>{friendCode}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <TouchableOpacity style={{ flex: 1, backgroundColor: '#25D366', borderRadius: 10, paddingVertical: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}><Ionicons name="logo-whatsapp" size={16} color="white" /><Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>واتساب</Text></TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, backgroundColor: '#1877F2', borderRadius: 10, paddingVertical: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}><Ionicons name="logo-facebook" size={16} color="white" /><Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>فيسبوك</Text></TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, backgroundColor: COLORS.text, borderRadius: 10, paddingVertical: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}><Ionicons name="share-social" size={16} color="white" /><Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>مشاركة</Text></TouchableOpacity>
          </View>
        </View>

        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 14, marginTop: 12, borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ fontWeight: '800', color: COLORS.text, textAlign: 'right' }}>إدخال كود صديق</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <TouchableOpacity onPress={() => {
              if (!enteredCode) { Alert.alert('أدخل كود'); return; }
              setFriends(p => [...p, { name: 'صديق جديد', code: enteredCode, online: true, points: 0 }]);
              setEnteredCode('');
              Alert.alert('تم ✓', 'تم إرسال الدعوة');
            }} style={{ backgroundColor: COLORS.success, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 }}><Text style={{ color: 'white', fontWeight: '800' }}>إضافة</Text></TouchableOpacity>
            <View style={styles.inputRow}><TextInput value={enteredCode} onChangeText={setEnteredCode} placeholder="ABT-xxxx" style={styles.input} /></View>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
          <TouchableOpacity onPress={() => setLeaderTab('global')} style={{ flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: leaderTab === 'global' ? COLORS.primary : 'white', borderWidth: 1, borderColor: leaderTab === 'global' ? COLORS.primary : COLORS.border, alignItems: 'center' }}><Text style={{ fontWeight: '800', fontSize: 12, color: leaderTab === 'global' ? 'white' : COLORS.text }}>المتصدرون 🏆</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setLeaderTab('friends')} style={{ flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: leaderTab === 'friends' ? COLORS.primary : 'white', borderWidth: 1, borderColor: leaderTab === 'friends' ? COLORS.primary : COLORS.border, alignItems: 'center' }}><Text style={{ fontWeight: '800', fontSize: 12, color: leaderTab === 'friends' ? 'white' : COLORS.text }}>الأصدقاء المتصلون</Text></TouchableOpacity>
        </View>

        {leaderTab === 'friends' ? (
          <View style={{ marginTop: 12, gap: 8 }}>
            {friends.map((f, i) => (
              <View key={i} style={{ backgroundColor: 'white', borderRadius: 14, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border }}>
                <TouchableOpacity onPress={() => setInChallenge(true)} style={{ backgroundColor: f.online ? COLORS.success : COLORS.textLight, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}><Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>{f.online ? 'تحدي ⚔️' : 'غير متصل'}</Text></TouchableOpacity>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontWeight: '800', color: COLORS.text }}>{f.name}</Text>
                    <Text style={{ fontSize: 11, color: COLORS.textSec }}>{f.code} • {f.points} نقطة</Text>
                  </View>
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontWeight: '900', color: COLORS.primary }}>{f.name[0]}</Text></View>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: f.online ? COLORS.success : COLORS.textLight }} />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 14, marginTop: 12, borderWidth: 1, borderColor: COLORS.border }}>
            <Text style={{ fontWeight: '900', color: COLORS.text, textAlign: 'right' }}>المتصدرون - أفضل 10</Text>
            {leaderboard.map(p => (
              <View key={p.rank} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: p.rank < 5 ? 1 : 0, borderColor: COLORS.border, backgroundColor: p.name === user.name ? COLORS.goldLight : 'transparent', marginHorizontal: -8, paddingHorizontal: 8, borderRadius: 10 }}>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: p.rank === 1 ? COLORS.gold : p.rank === 2 ? '#9CA3AF' : p.rank === 3 ? '#D97706' : COLORS.bg, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontWeight: '900', fontSize: 11, color: p.rank <= 3 ? 'white' : COLORS.text }}>{p.rank}</Text></View>
                  <Text style={{ fontSize: 11, color: COLORS.textSec }}>{p.wins}W/{p.losses}L • {p.mins}د</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontWeight: '800', fontSize: 12, color: COLORS.text }}>{p.name} {p.name === user.name ? '(أنت)' : ''}</Text>
                    <Text style={{ fontSize: 11, color: COLORS.primary, fontWeight: '800' }}>{p.points} نقطة</Text>
                  </View>
                  <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' }}><Ionicons name="person" size={14} color={COLORS.primary} /></View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function AnalysisScreen() {
  const { stats } = useApp();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: COLORS.text, textAlign: 'right' }}>تحليل مستواك 📊</Text>
        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginTop: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border }}>
          <ProgressCircle percent={65} size={110} color={COLORS.success} />
          <Text style={{ fontWeight: '900', fontSize: 16, color: COLORS.text, marginTop: 10 }}>نسبة إنجاز المنهج 65%</Text>
          <Text style={{ fontSize: 12, color: COLORS.textSec, textAlign: 'center', marginTop: 4 }}>مستوى جيد! تحتاج تركيز أكثر على علاج الأخطاء</Text>
        </View>
        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 14, marginTop: 12, borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ fontWeight: '900', color: COLORS.text, textAlign: 'right' }}>مؤشر الطالب المجتهد</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            {['مبتدئ', 'مجتهد', 'متقدم', 'بطل'].map((l, i) => (
              <View key={l} style={{ alignItems: 'center', flex: 1 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: i === 1 ? COLORS.primary : COLORS.bg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: i === 1 ? COLORS.primary : COLORS.border }}>
                  <Ionicons name={i === 3 ? "trophy" : "star"} size={16} color={i === 1 ? 'white' : COLORS.textLight} />
                </View>
                <Text style={{ fontSize: 10, fontWeight: '800', color: i === 1 ? COLORS.primary : COLORS.textLight, marginTop: 4 }}>{l}</Text>
              </View>
            ))}
          </View>
          <View style={{ height: 8, backgroundColor: COLORS.bg, borderRadius: 6, marginTop: 10, overflow: 'hidden' }}>
            <View style={{ width: `${stats.diligence}%`, height: 8, backgroundColor: COLORS.primary }} />
          </View>
          <Text style={{ fontSize: 11, color: COLORS.textSec, textAlign: 'center', marginTop: 6 }}>{stats.diligence}/100</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MistakesScreen() {
  const { stats, setStats } = useApp();
  const mockErrors = stats.errors.length ? stats.errors : [
    { subject: 'الفيزياء', q: 'قانون أوم ينص على أن التيار يتناسب...', correct: 'طردياً مع الجهد', date: 'منذ يوم' },
    { subject: 'الكيمياء', q: 'العدد الذري للكربون هو:', correct: '6', date: 'منذ 3 أيام' },
  ];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: COLORS.text, textAlign: 'right' }}>مراجعة الأخطاء 🔁</Text>
        <Text style={{ fontSize: 12, color: COLORS.textSec, textAlign: 'right', marginTop: 4 }}>نظام علاج الأخطاء - كل خطأ مرتبط بالمادة وسبب الخطأ</Text>
        <View style={{ backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: '#FECACA', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Ionicons name="alert-circle" size={18} color={COLORS.error} />
          <Text style={{ fontSize: 12, color: '#9F1239', flex: 1, textAlign: 'right' }}>لديك {mockErrors.length} أخطاء تحتاج تدريب مقترح</Text>
        </View>
        <View style={{ gap: 10, marginTop: 12 }}>
          {mockErrors.map((e: any, i: number) => (
            <View key={i} style={{ backgroundColor: 'white', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 11, color: COLORS.textSec }}>{e.date}</Text>
                <View style={{ backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}><Text style={{ fontSize: 11, fontWeight: '800', color: COLORS.primary }}>{e.subject}</Text></View>
              </View>
              <Text style={{ fontWeight: '700', color: COLORS.text, textAlign: 'right', marginTop: 8, lineHeight: 18 }}>{e.q}</Text>
              <View style={{ backgroundColor: '#ECFDF5', borderRadius: 10, padding: 10, marginTop: 8 }}>
                <Text style={{ fontSize: 12, color: COLORS.success, textAlign: 'right', fontWeight: '700' }}>الإجابة الصحيحة: {e.correct}</Text>
                <Text style={{ fontSize: 11, color: COLORS.textSec, textAlign: 'right', marginTop: 4 }}>سبب الخطأ المحتمل: خلط مفاهيم - ننصح باختبار تركيز على نفس الدرس</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                <TouchableOpacity onPress={() => { const ne = [...mockErrors]; ne.splice(i, 1); setStats((p: any) => ({ ...p, errors: ne })); }} style={{ flex: 1, backgroundColor: COLORS.success, borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}><Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>تمت المراجعة ✓</Text></TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, backgroundColor: COLORS.bg, borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border }}><Text style={{ color: COLORS.text, fontWeight: '800', fontSize: 12 }}>تدريب مقترح</Text></TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        <TouchableOpacity onPress={() => setStats((p: any) => ({ ...p, errors: [] }))} style={{ backgroundColor: COLORS.text, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 14 }}>
          <Text style={{ color: 'white', fontWeight: '800' }}>مسح كل الأخطاء بعد المراجعة</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function NotificationsScreen() {
  const notifs = [
    { title: 'عندك جلسة مذاكرة اليوم 📚', body: 'الفيزياء 2 ساعة - لا تؤجل!', time: 'الآن', unread: true },
    { title: 'اقترب موعد الامتحان ⏰', body: 'متبقي 45 يوم - شد حيلك!', time: 'منذ ساعة', unread: true },
    { title: 'تحتاج تركيز أكثر في الكيمياء ⚠️', body: 'نسبة أخطائك 38% في الباب الثاني', time: 'أمس', unread: false },
    { title: 'أحسنت! 🔥', body: 'أنهيت 5 أيام streak متتالية', time: 'أمس', unread: false },
  ];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: COLORS.text, textAlign: 'right' }}>الإشعارات 🔔</Text>
        <Text style={{ fontSize: 11, color: COLORS.textSec, textAlign: 'right', marginTop: 4 }}>تذكير ذكي + تنبيهات داخلية (Push قريباً)</Text>
        <View style={{ gap: 10, marginTop: 14 }}>
          {notifs.map((n, i) => (
            <View key={i} style={{ backgroundColor: 'white', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: n.unread ? COLORS.primary : COLORS.border, borderLeftWidth: n.unread ? 4 : 1, borderLeftColor: n.unread ? COLORS.primary : COLORS.border, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: n.unread ? COLORS.primaryLight : COLORS.bg, justifyContent: 'center', alignItems: 'center' }}><Ionicons name="notifications" size={18} color={n.unread ? COLORS.primary : COLORS.textLight} /></View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={{ fontWeight: '800', fontSize: 13, color: COLORS.text, textAlign: 'right' }}>{n.title}</Text>
                <Text style={{ fontSize: 11, color: COLORS.textSec, textAlign: 'right', marginTop: 2 }}>{n.body}</Text>
                <Text style={{ fontSize: 10, color: COLORS.textLight, marginTop: 4 }}>{n.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// TABS
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: { backgroundColor: 'white', borderTopWidth: 1, borderColor: COLORS.border, height: 62, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '800' },
        tabBarIcon: ({ color, size, focused }) => {
          let icon: any = 'home';
          if (route.name === 'HomeTab') icon = focused ? 'home' : 'home-outline';
          else if (route.name === 'StudyTab') icon = focused ? 'timer' : 'timer-outline';
          else if (route.name === 'PlanTab') icon = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'ExamsTab') icon = focused ? 'document-text' : 'document-text-outline';
          else if (route.name === 'ChallengeTab') icon = focused ? 'trophy' : 'trophy-outline';
          return <Ionicons name={icon} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'الرئيسية' }} />
      <Tab.Screen name="StudyTab" component={TimerScreen} options={{ tabBarLabel: 'المذاكرة' }} />
      <Tab.Screen name="PlanTab" component={PlanScreen} options={{ tabBarLabel: 'الخطة' }} />
      <Tab.Screen name="ExamsTab" component={ExamsScreen} options={{ tabBarLabel: 'الاختبارات' }} />
      <Tab.Screen name="ChallengeTab" component={ChallengeScreen} options={{ tabBarLabel: 'التحدي' }} />
    </Tab.Navigator>
  );
}

// ROOT
export default function App() {
  const [fontsLoaded] = useFonts({ ...Ionicons.font });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [onboardingNeeded, setOnboardingNeeded] = useState(false);
  const [user, setUser] = useState<User>({ name: 'أحمد محمد', email: 'ahmed@thanaweya.com', track: 'science', examDate: '2026-06-15', dailyHours: 6, subjects: TRACKS[0].subjects, demoDaysLeft: 7, isSubscribed: false, plan: null });
  const [stats, setStats] = useState<Stats>({ totalHours: 42.5, sessions: 38, streak: 7, progress: 38, subjectProgress: { 'الفيزياء': 45, 'الكيمياء': 62, 'الأحياء': 30, 'اللغة العربية': 70 }, diligence: 68, errors: [], achievements: [], challengePoints: 1850, wins: 12, losses: 4 });
  const [adminPrices, setAdminPrices] = useState({ monthly: 149, quarter: 399, half: 699, year: 1199 });

  if (!fontsLoaded) return null;

  const contextValue = { user, setUser, stats, setStats, isLoggedIn, setIsLoggedIn, onboardingNeeded, setOnboardingNeeded, adminPrices, setAdminPrices };

  return (
    <AppContext.Provider value={contextValue}>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isLoggedIn ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Forgot" component={ForgotScreen} />
            </>
          ) : onboardingNeeded ? (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          ) : (
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen name="Subscription" component={SubscriptionScreen} />
              <Stack.Screen name="ExamTake" component={ExamTakeScreen} />
              <Stack.Screen name="Analysis" component={AnalysisScreen} />
              <Stack.Screen name="Mistakes" component={MistakesScreen} />
              <Stack.Screen name="Notifications" component={NotificationsScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '800', color: COLORS.text, textAlign: 'right', marginTop: 12, marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.bg, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: COLORS.border, flex: 1 },
  input: { flex: 1, paddingVertical: Platform.OS === 'ios' ? 12 : 8, fontSize: 13, color: COLORS.text, textAlign: 'right' },
});
