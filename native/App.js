import React,{useEffect,useRef,useState} from 'react';
import {Alert,BackHandler,Pressable,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import {supabase,AI_URL,SUPABASE_KEY} from './src/lib/supabase';

const C={bg:'#f4f7fb',ink:'#17204a',main:'#4b46b8',main2:'#7067e8',soft:'#f1f0ff',muted:'#6e7c91',green:'#20b983',red:'#ef5261',card:'#fff',line:'#e5e9f0'};
const SUBJECTS={
  علوم:['العربية','الإنجليزية','الأحياء','الكيمياء','الفيزياء'],
  رياضة:['العربية','الإنجليزية','الرياضيات','الكيمياء','الفيزياء'],
  أدبي:['العربية','الإنجليزية','التاريخ','الجغرافيا','الإحصاء']
};
const COMMON=['التربية الدينية','اللغة الأجنبية الثانية','التربية الوطنية'];
const LOCAL_Q=[
 {subject:'الفيزياء',q:'ما وحدة قياس شدة التيار الكهربائي؟',o:['الفولت','الأمبير','الأوم','الوات'],a:1},
 {subject:'الفيزياء',q:'إذا كانت السرعة ثابتة فإن العجلة تساوي:',o:['صفر','1','السرعة','الزمن'],a:0},
 {subject:'الكيمياء',q:'أي مما يلي يمثل تفاعل احتراق؟',o:['اتحاد مادة مع الأكسجين','تفكك الماء','تعادل حمض وقاعدة','ترسيب ملح'],a:0},
 {subject:'الأحياء',q:'أين يحدث معظم إنتاج ATP في الخلية؟',o:['النواة','الميتوكوندريا','الريبوسوم','الغشاء'],a:1},
 {subject:'العربية',q:'المفعول به يكون غالبًا:',o:['مرفوعًا','منصوبًا','مجرورًا','مجزومًا'],a:1},
 {subject:'الإنجليزية',q:'Choose the correct form: He ___ to school every day.',o:['go','goes','going','gone'],a:1},
 {subject:'الرياضيات',q:'مشتقة x² تساوي:',o:['x','2x','x²','2'],a:1},
 {subject:'التاريخ',q:'تُعد الثورة العرابية من أحداث:',o:['العصر الحديث المصري','العصر البطلمي','العصر الفرعوني','العصر الروماني'],a:0},
 {subject:'الجغرافيا',q:'أطول نهر في مصر هو:',o:['النيل','دجلة','الفرات','الأمازون'],a:0},
 {subject:'الإحصاء',q:'الوسيط هو القيمة التي:',o:['تتكرر أكثر','تقع في منتصف البيانات المرتبة','تساوي أكبر قيمة','تساوي أصغر قيمة'],a:1}
];

const defaultState={name:'',track:'علوم',examDate:'',hours:3,selected:[],studied:0,sessions:0,streak:0,progress:0,progressTotal:0,quizScore:0,quizAttempts:0,diligenceScore:0,errorLog:[],errorReviewed:0};

function Btn({children,onPress,secondary=false,danger=false,disabled=false}){return <Pressable disabled={disabled} onPress={onPress} style={[s.btn,secondary&&s.btnSecondary,danger&&s.btnDanger,disabled&&s.disabled]}><Text style={[s.btnText,secondary&&{color:C.main}]}>{children}</Text></Pressable>}
function Card({children}){return <View style={s.card}>{children}</View>}
function Title({title,sub}){return <View style={s.top}><Text style={s.topTitle}>{title}</Text>{sub?<Text style={s.topSub}>{sub}</Text>:null}</View>}
function Stat({value,label}){return <View style={s.stat}><Text style={s.statValue}>{value}</Text><Text style={s.muted}>{label}</Text></View>}
function Field({value,onChangeText,placeholder,keyboardType}){return <TextInput value={String(value??'')} onChangeText={onChangeText} placeholder={placeholder} keyboardType={keyboardType} style={s.input} placeholderTextColor="#9aa6b7"/>}

class AppErrorBoundary extends React.Component{constructor(p){super(p);this.state={error:null}}static getDerivedStateFromError(error){return {error}}componentDidCatch(error,info){console.log('Rihla runtime error',error,info)}render(){if(this.state.error)return <View style={s.centerPage}><Text style={s.h1}>حدث خطأ أثناء تشغيل التطبيق</Text><Text style={s.muted}>{String(this.state.error?.message||this.state.error)}</Text><Btn onPress={()=>this.setState({error:null})}>إعادة المحاولة</Btn></View>;return this.props.children}}

export default function App(){
 const [screen,setScreen]=useState('onboarding');
 const [state,setState]=useState(defaultState);
 const [session,setSession]=useState(null);
 const [profile,setProfile]=useState(null);
 const [boot,setBoot]=useState(true);
 const [authMode,setAuthMode]=useState('login');
 const [toast,setToast]=useState('');
 const [challengeId,setChallengeId]=useState(null);

 const patch=(p)=>setState(x=>({...x,...p}));
 const notify=(m)=>{setToast(m);setTimeout(()=>setToast(''),2200)};
 useEffect(()=>{let alive=true;(async()=>{try{const {data}=await supabase.auth.getSession();if(!alive)return;setSession(data.session||null);if(data.session){await loadProfile(data.session.user.id)}}catch(e){console.log('bootstrap error',e)}finally{if(alive)setBoot(false)}})();const {data}=supabase.auth.onAuthStateChange((_e,sess)=>{setSession(sess);if(sess)setTimeout(()=>{if(alive)loadProfile(sess.user.id).catch(e=>console.log('profile load error',e))},0)});return()=>{alive=false;data.subscription.unsubscribe()}},[]);
 async function loadProfile(uid){
   try{
    const r=await supabase.from('profiles').select('*').eq('id',uid).maybeSingle();
    if(r.data)setProfile(r.data);
    const p=await supabase.from('study_profiles').select('*').eq('user_id',uid).maybeSingle();
    if(p.data){setState(x=>({...x,name:p.data.display_name||p.data.name||x.name,track:p.data.track||x.track,examDate:p.data.exam_date||x.examDate,hours:Number(p.data.daily_hours||x.hours),progress:Number(p.data.progress||x.progress),diligenceScore:Number(p.data.diligence_score||x.diligenceScore)}))}
    if(r.data||p.data)setScreen('home');
   }catch(e){console.log(e)}
 }
 async function saveStudy(extra={}){
   if(!session)return;
   const payload={user_id:session.user.id,display_name:state.name,track:state.track,exam_date:state.examDate||null,daily_hours:Number(state.hours||0),progress:Number(state.progress||0),diligence_score:Number(calcDiligence())};
   try{await supabase.from('study_profiles').upsert(payload,{onConflict:'user_id'}); if(extra) await supabase.from('study_profiles').update(extra).eq('user_id',session.user.id)}catch(e){console.log(e)}
 }
 function calcDiligence(){
   const commitment=Math.min(100,(state.sessions/7)*100);
   const study=Math.min(100,(state.studied/Math.max(1,Number(state.hours)*7))*100);
   const quiz=Math.min(100,state.quizAttempts?state.quizScore:0);
   const errors=Math.min(100,state.errorReviewed*10);
   const progress=Number(state.progressTotal||state.progress||0);
   return Math.round(commitment*.25+study*.20+quiz*.20+errors*.10+Math.min(100,progress)*.25);
 }
 useEffect(()=>{if(session)saveStudy()},[state.sessions,state.studied,state.progress,state.progressTotal,state.quizScore,state.quizAttempts,state.errorReviewed]);

 useEffect(()=>{
   const sub=BackHandler.addEventListener('hardwareBackPress',()=>{if(['home','onboarding','setup','auth'].includes(screen))return false;setScreen('home');return true});
   return()=>sub.remove();
 },[screen]);

 if(boot)return <View style={s.centerPage}><Text style={s.big}>🎓</Text><Text style={s.h1}>رحلة الثانوية العامة</Text><Text style={s.muted}>جاري تجهيز رحلتك...</Text></View>;
 if(screen==='auth')return <Auth mode={authMode} setMode={setAuthMode} onDone={async(sess)=>{setSession(sess);await loadProfile(sess.user.id);}} notify={notify}/>;
 if(screen==='onboarding')return <Onboarding onStart={()=>session?setScreen(state.name?'home':'setup'):setScreen('auth')}/>;
 if(screen==='setup')return <Setup state={state} patch={patch} onDone={async()=>{patch({progressTotal:0});await saveStudy();setScreen('home');notify('تم إنشاء خطتك الذكية') }}/>;
 const common={state,patch,session,profile,setScreen,notify,saveStudy};
 return <AppErrorBoundary><View style={s.app}>{screen==='home'&&<Home {...common}/>} {screen==='plan'&&<Plan {...common}/>} {screen==='session'&&<FocusSession {...common}/>} {screen==='quizzes'&&<Quizzes {...common}/>} {screen==='quiz'&&<Quiz {...common}/>} {screen==='analysis'&&<Analysis {...common}/>} {screen==='achievements'&&<Achievements {...common}/>} {screen==='notifications'&&<Notifications {...common}/>} {screen==='friends'&&<Friends {...common} challengeId={challengeId} setChallengeId={setChallengeId}/>} {screen==='friendChallenge'&&<FriendChallenge {...common} challengeId={challengeId} setChallengeId={setChallengeId}/>}<Nav screen={screen} setScreen={setScreen}/>{toast?<View style={s.toast}><Text style={{color:'#fff'}}>{toast}</Text></View>:null}</View>
}

function Onboarding({onStart}){return <View style={s.onboard}><Text style={s.art}>🎓</Text><Text style={s.onboardTitle}>رحلة الثانوية</Text><Text style={s.onboardText}>مساعدك الذكي لتنظيم المذاكرة، متابعة التقدم، والتدرب على الاختبارات.</Text><Btn onPress={onStart}>ابدأ رحلتك</Btn><Text style={s.onboardHint}>خطة + جلسات تركيز + اختبارات + تحليل أخطاء + تحديات</Text></View>}

function Auth({mode,setMode,onDone,notify}){
 const [email,setEmail]=useState(''),[pass,setPass]=useState(''),[busy,setBusy]=useState(false);
 async function go(){if(!email||!pass)return notify('اكتب البريد وكلمة المرور');setBusy(true);try{let r=mode==='login'?await supabase.auth.signInWithPassword({email,password:pass}):await supabase.auth.signUp({email,password:pass});if(r.error)throw r.error;if(r.data.session){await onDone(r.data.session)}else notify('تم إنشاء الحساب. راجع البريد إذا طُلب منك التأكيد.')}catch(e){notify(e.message||'حدث خطأ')}finally{setBusy(false)}}
 return <View style={s.auth}><Card><Text style={s.h1}>تسجيل الدخول</Text><Text style={s.muted}>رحلة الثانوية العامة</Text><Field value={email} onChangeText={setEmail} placeholder="البريد الإلكتروني"/><Field value={pass} onChangeText={setPass} placeholder="كلمة المرور"/><Btn disabled={busy} onPress={go}>{busy?'جاري التنفيذ...':mode==='login'?'دخول':'إنشاء حساب'}</Btn><Pressable onPress={()=>setMode(mode==='login'?'signup':'login')}><Text style={s.link}>{mode==='login'?'إنشاء حساب جديد':'لدي حساب بالفعل'}</Text></Pressable></Card></View>
}

function Setup({state,patch,onDone}){
 const subjects=[...(SUBJECTS[state.track]||SUBJECTS.علوم),...COMMON];
 const toggle=(x)=>patch({selected:state.selected.includes(x)?state.selected.filter(y=>y!==x):[...state.selected,x]});
 return <ScrollView style={s.scroll}><Title title="نجهز رحلتك 🎯" sub="اختر المسار والمواد ووقتك اليومي"/><View style={s.pad}><Card><Text style={s.section}>الاسم</Text><Field value={state.name} onChangeText={v=>patch({name:v})} placeholder="اكتب اسمك"/><Text style={s.section}>الشعبة</Text><View style={s.row}>{['علوم','رياضة','أدبي'].map(t=><Pressable key={t} onPress={()=>patch({track:t,selected:[]})} style={[s.choice,state.track===t&&s.choiceActive]}><Text>{t}</Text></Pressable>)}</View><Text style={s.section}>تاريخ الامتحان</Text><Field value={state.examDate} onChangeText={v=>patch({examDate:v})} placeholder="YYYY-MM-DD"/><Text style={s.section}>ساعات المذاكرة يوميًا</Text><Field value={state.hours} onChangeText={v=>patch({hours:Number(v.replace(/\D/g,''))||0})} keyboardType="numeric" placeholder="3"/><Text style={s.section}>المواد</Text>{subjects.map(x=><Pressable key={x} onPress={()=>toggle(x)} style={[s.subject,state.selected.includes(x)&&s.subjectActive]}><Text style={{fontSize:16}}>{state.selected.includes(x)?'✓ ':'＋'}{x}</Text></Pressable>)}<Btn onPress={onDone}>إنشاء خطتي الذكية</Btn></Card></View></ScrollView>
}

function Home({state,setScreen,profile,session,patch,notify}){
 const diligence=Math.round(calcLocal(state));
 const selected=state.selected.length?state.selected:['العربية','الإنجليزية','الفيزياء'];
 return <ScrollView style={s.scroll}><Title title="أهلاً بك 👋" sub={state.name||'طالب الثانوية'}/><View style={s.pad}><Card><Text style={s.heroTitle}>خطوة صغيرة = فرق كبير</Text><Text style={s.muted}>ابدأ بجلسة تركيز قصيرة ثم راجع أخطاءك.</Text><View style={s.stats}><Stat value={state.studied+'س'} label="مذاكرة"/><Stat value={state.streak} label="أيام متتالية"/><Stat value={diligence+'%'} label="الاجتهاد"/></View></Card><Card><View style={s.row}><Text style={s.h2}>خطة اليوم 📅</Text><Pressable onPress={()=>setScreen('plan')}><Text style={s.link}>كل الخطة</Text></Pressable></View>{selected.slice(0,4).map((x,i)=><View key={x} style={s.list}><Text>{i+1}. {x}</Text><Text style={s.muted}>{Math.max(20,Math.round(Number(state.hours)*60/Math.max(1,selected.length)))} دقيقة</Text></View>)}</Card><Card><Text style={s.h2}>جلسة مذاكرة ⏱️</Text><Text style={s.muted}>25 دقيقة تركيز + 5 دقائق راحة</Text><Btn onPress={()=>setScreen('session')}>ابدأ جلسة التركيز</Btn></Card><Card><Text style={s.h2}>اختبار سريع 📝</Text><Text style={s.muted}>10 أسئلة محلية قابلة للتوسعة + اختبارات AI</Text><Btn secondary onPress={()=>setScreen('quizzes')}>اذهب للاختبارات</Btn></Card><Card><Text style={s.h2}>اقتراح ذكي</Text><Text style={s.muted}>راجع المادة الأقل نشاطًا لديك ثم اختبر نفسك.</Text><Btn secondary onPress={()=>setScreen('analysis')}>تحليل مستواي</Btn></Card><Card><Btn secondary onPress={()=>setScreen('friends')}>الأصدقاء والتحديات 👥</Btn></Card><Pressable onPress={async()=>{await supabase.auth.signOut();setScreen('auth')}}><Text style={[s.link,{textAlign:'center',margin:18}]}>تسجيل الخروج</Text></Pressable></View></ScrollView>
}
function calcLocal(st){const commitment=Math.min(100,st.sessions/7*100),study=Math.min(100,st.studied/Math.max(1,st.hours*7)*100),quiz=st.quizAttempts?st.quizScore:0,errors=Math.min(100,st.errorReviewed*10),progress=Math.min(100,st.progressTotal||st.progress||0);return commitment*.25+study*.2+quiz*.2+errors*.1+progress*.25}

function Plan({state,setScreen}){const subs=state.selected.length?state.selected:['العربية','الإنجليزية','الفيزياء'];return <ScrollView style={s.scroll}><Title title="خطتك الأسبوعية 📅" sub="توزيع وقتك على المواد"/><View style={s.pad}>{Array.from({length:7},(_,d)=><Card key={d}><Text style={s.h2}>{['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'][d]}</Text>{subs.slice(0,Math.max(1,Math.min(4,subs.length))).map((x,i)=><View key={x} style={s.list}><Text>{x}</Text><Text style={s.muted}>{Math.round(Number(state.hours||3)*60/Math.max(1,subs.length))} دقيقة</Text></View>)}</Card>)}<Btn secondary onPress={()=>setScreen('session')}>ابدأ مذاكرة الآن</Btn></View></ScrollView>}

function FocusSession({state,patch,setScreen,notify}){
 const [sec,setSec]=useState(25*60);
 const [run,setRun]=useState(false);
 const [breakMode,setBreakMode]=useState(false);
 const ref=useRef(null);
 useEffect(()=>{
   if(!run)return undefined;
   ref.current=setInterval(()=>{
     setSec(prev=>{
       if(prev>1)return prev-1;
       clearInterval(ref.current);
       setRun(false);
       if(!breakMode){
         patch({
           sessions:state.sessions+1,
           studied:state.studied+25/60,
           streak:Math.max(1,state.streak+1),
           progressTotal:Math.min(100,(state.progressTotal||0)+1)
         });
         notify('أحسنت! اكتملت جلسة 25 دقيقة');
         setBreakMode(true);
         return 5*60;
       }
       return 25*60;
     });
   },1000);
   return()=>clearInterval(ref.current);
 },[run,breakMode]);
 const mm=String(Math.floor(sec/60)).padStart(2,'0');
 const ss=String(sec%60).padStart(2,'0');
 return <ScrollView style={s.scroll}>
   <Title title="جلسة مذاكرة ⏱️" sub={breakMode?'وقت الراحة':'وقت التركيز'}/>
   <View style={s.pad}>
     <Card>
       <View style={s.timer}>
         <Text style={s.timerText}>{mm}:{ss}</Text>
         <Text style={s.muted}>{breakMode?'راحة':'تركيز'}</Text>
       </View>
       <Btn onPress={()=>setRun(x=>!x)}>{run?'إيقاف مؤقت':'ابدأ'}</Btn>
       <Btn secondary onPress={()=>{setRun(false);setSec(breakMode?300:1500)}}>إعادة ضبط</Btn>
       <Btn secondary onPress={()=>setScreen('home')}>إنهاء الجلسة</Btn>
     </Card>
   </View>
 </ScrollView>;
}

function Quizzes({setScreen}){const [type,setType]=useState('mcq');return <ScrollView style={s.scroll}><Title title="الاختبارات 📝" sub="تدريب محلي وذكاء اصطناعي"/><View style={s.pad}><Card><Text style={s.h2}>اختبار سريع</Text><Text style={s.muted}>10 أسئلة من بنك مبدئي موزع على المواد.</Text><Btn onPress={()=>setScreen('quiz')}>ابدأ الاختبار</Btn></Card><Card><Text style={s.h2}>اختبار AI</Text><Text style={s.muted}>اختر المادة والنطاق والصعوبة وعدد الأسئلة.</Text><AIQuizLauncher type={type} setType={setType}/></Card></View></ScrollView>}

function AIQuizLauncher({type,setType}){const [subject,setSubject]=useState('الفيزياء'),[count,setCount]=useState(10),[difficulty,setDifficulty]=useState('mixed'),[busy,setBusy]=useState(false),[qs,setQs]=useState(null),[idx,setIdx]=useState(0),[score,setScore]=useState(0),[answer,setAnswer]=useState(null),[essay,setEssay]=useState(''),[feedback,setFeedback]=useState('');async function gen(){const {data}=await supabase.auth.getSession();if(!data.session)return Alert.alert('تسجيل الدخول مطلوب');setBusy(true);try{const r=await fetch(AI_URL,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+data.session.access_token,'apikey':SUPABASE_KEY},body:JSON.stringify({action:'generate',questionType:type,subject,scopeType:'full',scopeName:'المنهج بالكامل',count,difficulty,curriculum:'الثانوية العامة المصرية 2025-2026'})});const d=await r.json();if(!r.ok||d.error)throw Error(d.error||'تعذر توليد الأسئلة');setQs(d.questions||[]);setIdx(0);setScore(0);setAnswer(null);setFeedback('')}catch(e){Alert.alert('خطأ',e.message)}finally{setBusy(false)}}async function essayGrade(q){const {data}=await supabase.auth.getSession();if(!data.session)return;try{const r=await fetch(AI_URL,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+data.session.access_token,'apikey':SUPABASE_KEY},body:JSON.stringify({action:'grade',question:q.question,answer:essay,rubric:q.rubric||'',modelAnswer:q.modelAnswer||''})});const d=await r.json();setFeedback('الدرجة: '+(d.score??0)+' — '+(d.feedback||''));}catch(e){setFeedback(e.message)}}if(qs){if(idx>=qs.length)return <View><Text style={s.h2}>انتهى الاختبار</Text><Text style={s.big}>{score}/{qs.length}</Text><Btn secondary onPress={()=>setQs(null)}>اختبار جديد</Btn></View>;const q=qs[idx],isEssay=q.type==='essay'||type==='essay';return <View><Text style={s.pill}>{idx+1}/{qs.length}</Text><Text style={s.quizQ}>{q.question||q.stem}</Text>{isEssay?<><Field value={essay} onChangeText={setEssay} placeholder="اكتب إجابتك"/><Btn onPress={async()=>{await essayGrade(q);setIdx(i=>i+1);setEssay('')}}>إرسال الإجابة</Btn></>: (q.options||[]).map((o,i)=><Pressable key={i} disabled={answer!==null} onPress={()=>{setAnswer(i);if(Number(q.correct)===i)setScore(x=>x+1);setTimeout(()=>{setAnswer(null);setIdx(x=>x+1)},450)}} style={[s.answer,answer===i&&(Number(q.correct)===i?s.correct:s.wrong)]}><Text>{o}</Text></Pressable>)}{feedback?<Text style={s.muted}>{feedback}</Text>:null}</View>}return <View><Text style={s.section}>نوع السؤال</Text><View style={s.row}>{['mcq','essay','mixed'].map(x=><Pressable key={x} onPress={()=>setType(x)} style={[s.choice,type===x&&s.choiceActive]}><Text>{x==='mcq'?'اختياري':x==='essay'?'مقالي':'مختلط'}</Text></Pressable>)}</View><Field value={subject} onChangeText={setSubject} placeholder="المادة"/><Field value={count} onChangeText={v=>setCount(Number(v.replace(/\D/g,''))||10)} keyboardType="numeric" placeholder="عدد الأسئلة"/><Field value={difficulty} onChangeText={setDifficulty} placeholder="mixed / easy / medium / hard"/><Btn disabled={busy} onPress={gen}>{busy?'جاري توليد الأسئلة...':'توليد اختبار AI'}</Btn></View>}

function Quiz({state,patch,setScreen,notify}){const [i,setI]=useState(0),[score,setScore]=useState(0),[picked,setPicked]=useState(null),[done,setDone]=useState(false);const qs=LOCAL_Q;if(done)return <ScrollView style={s.scroll}><Title title="نتيجة الاختبار" sub="تم تسجيل المحاولة"/><View style={s.pad}><Card><Text style={s.big}>{score}/{qs.length}</Text><Text style={s.muted}>نسبة الإجابة الصحيحة: {Math.round(score/qs.length*100)}%</Text><Btn onPress={()=>setScreen('analysis')}>عرض التحليل</Btn><Btn secondary onPress={()=>{setI(0);setScore(0);setDone(false)}}>إعادة الاختبار</Btn></Card></View></ScrollView>;const q=qs[i];function answer(n){setPicked(n);const ok=n===q.a;setTimeout(()=>{if(ok)setScore(x=>x+1);patch({quizAttempts:state.quizAttempts+1,quizScore:Math.round(((state.quizScore*state.quizAttempts)+(ok?100:0))/(state.quizAttempts+1)),progressTotal:Math.min(100,(state.progressTotal||0)+(ok?1:0))});if(!ok)patch({errorLog:[...state.errorLog.slice(-49),{question:q.q,subject:q.subject,date:new Date().toISOString(),reviewLevel:0}]});if(i===qs.length-1){setDone(true);notify('اكتمل الاختبار')}else{setI(x=>x+1);setPicked(null)}},450)}return <ScrollView style={s.scroll}><Title title="اختبار سريع" sub={'السؤال '+(i+1)+' من '+qs.length}/><View style={s.pad}><Card><Text style={s.pill}>{q.subject}</Text><Text style={s.quizQ}>{q.q}</Text>{q.o.map((x,n)=><Pressable key={n} disabled={picked!==null} onPress={()=>answer(n)} style={[s.answer,picked===n&&(n===q.a?s.correct:s.wrong)]}><Text>{x}</Text></Pressable>)}</Card></View></ScrollView>}

function Analysis({state,setScreen,patch}){const d=Math.round(calcLocal(state));return <ScrollView style={s.scroll}><Title title="تحليل مستواك 📊" sub="مؤشرات مبنية على نشاطك المسجل"/><View style={s.pad}><Card><Text style={s.diligence}>{d}%</Text><Text style={s.h2}>درجة الاجتهاد</Text><View style={s.barRow}><Text>الالتزام</Text><View style={s.bar}><View style={[s.fill,{width:Math.min(100,state.sessions/7*100)+'%'}]}/></View></View><View style={s.barRow}><Text>الاختبارات</Text><View style={s.bar}><View style={[s.fill,{width:state.quizScore+'%'}]}/></View></View><View style={s.barRow}><Text>التقدم</Text><View style={s.bar}><View style={[s.fill,{width:Math.min(100,state.progressTotal||state.progress)+'%'}]}/></View></View></Card><Card><Text style={s.h2}>تحليل الأخطاء</Text>{state.errorLog.length?state.errorLog.slice(-8).reverse().map((e,n)=><View style={s.list} key={n}><Text>{e.subject||'مادة'}</Text><Text style={s.muted}>{e.question}</Text></View>):<Text style={s.muted}>لا توجد أخطاء مسجلة بعد.</Text>}<Btn secondary onPress={()=>patch({errorReviewed:state.errorReviewed+state.errorLog.length,errorLog:state.errorLog.map(e=>({...e,reviewLevel:Math.min(4,(e.reviewLevel||0)+1)}))})}>تسجيل مراجعة الأخطاء</Btn></Card><Card><Text style={s.h2}>المراجعة المتباعدة</Text><Text style={s.muted}>مستويات المراجعة: 1، 3، 7، 14 يومًا.</Text></Card></View></ScrollView>}

function Achievements({state}){const a=[['🌱','بداية قوية!','أول نشاط'],['🔥','7 أيام','سلسلة مذاكرة'],['⏱️','50 ساعة','إجمالي المذاكرة'],['📝','10 اختبارات','محاولات الاختبار'],['🏆','تحدي أسبوعي','20 ساعة أسبوعيًا']];return <ScrollView style={s.scroll}><Title title="الإنجازات 🏆" sub="تقدمك داخل الرحلة"/><View style={s.pad}><View style={s.achGrid}>{a.map(([i,t,d],n)=><Card key={t}><Text style={s.achIcon}>{i}</Text><Text style={s.h2}>{t}</Text><Text style={s.muted}>{d}</Text></Card>)}</View><Card><Text>جلسات: {state.sessions} • مذاكرة: {Number(state.studied).toFixed(1)} ساعة • اختبارات: {state.quizAttempts}</Text></Card></View></ScrollView>}

function Notifications(){return <ScrollView style={s.scroll}><Title title="الإشعارات 🔔" sub="تذكيرات داخل التطبيق"/><View style={s.pad}><Card><Text style={s.h2}>تذكير المذاكرة</Text><Text style={s.muted}>خصص وقتًا ثابتًا لجلسة تركيز يومية.</Text></Card><Card><Text style={s.h2}>مراجعة الأخطاء</Text><Text style={s.muted}>ارجع للأخطاء القديمة قبل الانتقال لموضوع جديد.</Text></Card></View></ScrollView>}

function Friends({session,setScreen,setChallengeId,notify}){const [online,setOnline]=useState([]),[code,setCode]=useState(''),[join,setJoin]=useState(''),channel=useRef(null);useEffect(()=>{if(!session)return;channel.current=supabase.channel('rihla-lobby',{config:{presence:{key:session.user.id}}}).on('presence',{event:'sync'},()=>{const p=channel.current.presenceState();setOnline(Object.values(p).flat())}).subscribe(async status=>{if(status==='SUBSCRIBED')await channel.current.track({user_id:session.user.id,name:session.user.email?.split('@')[0]||'طالب'})});return()=>{if(channel.current)supabase.removeChannel(channel.current)}},[session]);async function create(){try{const r=await supabase.rpc('fc2_create_challenge',{p_subject:'الفيزياء',p_scope_type:'full',p_scope_name:'المنهج بالكامل',p_question_mode:'mcq',p_rounds:5,p_turn_seconds:20});if(r.error)throw r.error;setChallengeId(r.data.id);setCode(r.data.code);setScreen('friendChallenge')}catch(e){notify(e.message||'تعذر إنشاء التحدي')}}async function joinRoom(){try{const r=await supabase.rpc('fc2_join_challenge',{p_code:join});if(r.error)throw r.error;setChallengeId(r.data.id);setScreen('friendChallenge')}catch(e){notify(e.message||'الكود غير صحيح')}}return <ScrollView style={s.scroll}><Title title="أصدقائي أونلاين 👥" sub="Presence و تحديات مباشرة"/><View style={s.pad}><Card><Text style={s.h2}>المتصلون الآن</Text>{online.length?online.map((p,n)=><View key={n} style={s.list}><Text>🟢 {p.name||'طالب'}</Text></View>):<Text style={s.muted}>لا يوجد أصدقاء ظاهرون الآن.</Text>}</Card><Card><Text style={s.h2}>إنشاء تحدي مباشر ⚔️</Text><Text style={s.muted}>5 جولات، 20 ثانية للدور.</Text><Btn onPress={create}>إنشاء غرفة</Btn>{code?<Text style={s.code}>الكود: {code}</Text>:null}</Card><Card><Text style={s.h2}>الانضمام بكود</Text><Field value={join} onChangeText={setJoin} placeholder="مثال: A1B2C3"/><Btn secondary onPress={joinRoom}>انضمام</Btn></Card></View></ScrollView>}

function FriendChallenge({session,challengeId,setChallengeId,notify,setScreen}){const [data,setData]=useState(null),[busy,setBusy]=useState(false),timer=useRef(null);async function refresh(){if(!challengeId)return;const r=await supabase.rpc('fc2_state',{p_challenge_id:challengeId});if(r.error){notify(r.error.message);return}setData(r.data)}useEffect(()=>{refresh();timer.current=setInterval(refresh,1500);const ch=supabase.channel('fc2-'+challengeId).on('broadcast',{event:'refresh'},refresh).subscribe();return()=>{clearInterval(timer.current);supabase.removeChannel(ch)}},[challengeId]);async function start(){if(!data)return;setBusy(true);try{const c=data.challenge;const r=await supabase.auth.getSession();const q=await fetch(AI_URL,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+r.data.session.access_token,'apikey':SUPABASE_KEY},body:JSON.stringify({action:'generate',subject:c.subject,scopeType:c.scope_type,scopeName:c.scope_name,questionType:c.question_mode,count:Number(c.rounds)*Math.max(2,data.players.length),difficulty:'mixed'})});const jd=await q.json();if(!q.ok||jd.error)throw Error(jd.error||'تعذر توليد الأسئلة');const x=await supabase.rpc('fc2_start_challenge',{p_challenge_id:challengeId,p_questions:jd.questions||[]});if(x.error)throw x.error;await refresh()}catch(e){notify(e.message)}finally{setBusy(false)}}async function answer(v){try{const r=await supabase.rpc('fc2_answer',{p_challenge_id:challengeId,p_answer_text:String(v),p_is_correct:false,p_score:0});if(r.error)throw r.error;await refresh()}catch(e){notify(e.message)}}if(!data)return <View style={s.centerPage}><Text>جاري تحميل التحدي...</Text></View>;const c=data.challenge;return <ScrollView style={s.scroll}><Title title="تحدي مباشر ⚔️" sub={c.code}/><View style={s.pad}><Card><Text style={s.h2}>اللاعبون</Text>{data.players.map((p,i)=><View key={i} style={s.list}><Text>{p.name}</Text><Text>{p.score} نقطة</Text></View>)}</Card>{c.status==='waiting'?<Card><Text style={s.h2}>الغرفة جاهزة</Text><Text style={s.muted}>يجب وجود لاعبين على الأقل ثم يبدأ المضيف.</Text>{data.players.some(p=>p.user_id===session?.user?.id&&p.slot===0)?<Btn disabled={busy} onPress={start}>{busy?'جاري تجهيز الأسئلة...':'ابدأ التحدي'}</Btn>:null}<Btn secondary onPress={()=>setScreen('friends')}>العودة للأصدقاء</Btn></Card>:null}{c.status==='active'?<Card><Text style={s.pill}>السؤال {Number(c.current_index)+1} / {c.question_count}</Text><Text style={s.quizQ}>{c.question?.question||c.question?.stem||'جاري تجهيز السؤال...'}</Text>{c.active_player_id===session?.user?.id?(c.question?.options||[]).map((o,i)=><Pressable key={i} onPress={()=>answer(i)} style={s.answer}><Text>{o}</Text></Pressable>):<Text style={s.muted}>الدور الحالي للاعب الآخر. انتظر انتقال الدور.</Text>}</Card>:null}{c.status==='finished'?<Card><Text style={s.big}>🏆</Text><Text style={s.h2}>انتهت المنافسة</Text>{data.players.sort((a,b)=>b.score-a.score).map((p,i)=><View key={i} style={s.list}><Text>#{i+1} {p.name}</Text><Text>{p.score}</Text></View>)}<Btn onPress={()=>{setChallengeId(null);setScreen('friends')}}>إغلاق</Btn></Card>:null}</View></ScrollView>}

function Nav({screen,setScreen}){const items=[['home','الرئيسية','⌂'],['plan','الخطة','▦'],['session','جلسة','◷'],['quizzes','اختبارات','✓'],['analysis','تحليل','◈'],['friends','أصدقاء','♟']];return <View style={s.nav}>{items.map(([id,t,ic])=><Pressable key={id} onPress={()=>setScreen(id)} style={s.navItem}><Text style={[s.navIcon,screen===id&&{color:C.main}]}>{ic}</Text><Text style={[s.navText,screen===id&&{color:C.main,fontWeight:'800'}]}>{t}</Text></Pressable>)}</View>}

const s=StyleSheet.create({
 app:{flex:1,backgroundColor:C.bg},scroll:{flex:1},pad:{padding:16,paddingBottom:105},top:{backgroundColor:C.main,padding:22,paddingTop:34,borderBottomLeftRadius:28,borderBottomRightRadius:28},topTitle:{color:'#fff',fontSize:25,fontWeight:'900'},topSub:{color:'#e4e3ff',marginTop:5},card:{backgroundColor:C.card,borderRadius:20,padding:16,marginBottom:14,shadowColor:'#17204a',shadowOpacity:.08,shadowRadius:14,elevation:2},h1:{fontSize:26,fontWeight:'900',color:C.ink,marginBottom:5},h2:{fontSize:17,fontWeight:'900',color:C.ink,marginBottom:7},section:{fontSize:13,fontWeight:'800',color:C.ink,marginTop:10,marginBottom:4},muted:{fontSize:12,color:C.muted,lineHeight:19},btn:{backgroundColor:C.main,borderRadius:15,padding:14,alignItems:'center',marginTop:11},btnSecondary:{backgroundColor:C.soft},btnDanger:{backgroundColor:C.red},btnText:{color:'#fff',fontWeight:'900'},disabled:{opacity:.5},input:{backgroundColor:'#fff',borderWidth:1,borderColor:C.line,borderRadius:14,padding:13,marginVertical:7,color:C.ink},row:{flexDirection:'row',gap:8,alignItems:'center',flexWrap:'wrap'},choice:{paddingVertical:10,paddingHorizontal:15,borderRadius:20,backgroundColor:'#edf1f7'},choiceActive:{backgroundColor:'#ddd9ff',borderWidth:1,borderColor:C.main},subject:{padding:13,borderRadius:15,backgroundColor:'#f7f8fb',marginVertical:5},subjectActive:{backgroundColor:C.soft,borderWidth:1,borderColor:C.main},stats:{flexDirection:'row',gap:8,marginTop:15},stat:{flex:1,backgroundColor:'#f7f8fb',borderRadius:15,padding:11,alignItems:'center'},statValue:{fontSize:21,fontWeight:'900',color:C.main},heroTitle:{fontSize:23,fontWeight:'900',color:C.ink},list:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:11,borderBottomWidth:1,borderBottomColor:'#edf0f5'},pill:{alignSelf:'flex-start',paddingHorizontal:10,paddingVertical:6,borderRadius:20,backgroundColor:C.soft,color:C.main,fontSize:11,fontWeight:'800'},timer:{width:220,height:220,borderRadius:110,backgroundColor:C.main,alignSelf:'center',alignItems:'center',justifyContent:'center',marginVertical:18},timerText:{fontSize:39,fontWeight:'900',color:'#fff'},quizQ:{fontSize:20,fontWeight:'900',color:C.ink,lineHeight:31,marginVertical:15},answer:{backgroundColor:'#f5f7fa',borderRadius:14,padding:14,marginVertical:5},correct:{backgroundColor:'#dff8ed',borderWidth:1,borderColor:C.green},wrong:{backgroundColor:'#ffe5e8',borderWidth:1,borderColor:C.red},diligence:{fontSize:48,fontWeight:'900',color:C.main},barRow:{marginTop:13},bar:{height:9,backgroundColor:'#e7ebf2',borderRadius:10,overflow:'hidden',marginTop:6},fill:{height:'100%',backgroundColor:C.main2,borderRadius:10},achGrid:{},achIcon:{fontSize:42},code:{fontSize:24,fontWeight:'900',textAlign:'center',color:C.main,marginTop:12},big:{fontSize:50,fontWeight:'900',color:C.main,textAlign:'center',marginVertical:15},nav:{position:'absolute',left:0,right:0,bottom:0,height:78,backgroundColor:'#fff',borderTopWidth:1,borderTopColor:C.line,flexDirection:'row',justifyContent:'space-around',alignItems:'center'},navItem:{alignItems:'center',minWidth:45},navIcon:{fontSize:21,color:'#7f8ca0'},navText:{fontSize:10,color:'#7f8ca0',marginTop:3},onboard:{flex:1,backgroundColor:'#071d3a',padding:25,justifyContent:'center'},art:{fontSize:110,textAlign:'center',marginBottom:15},onboardTitle:{fontSize:35,fontWeight:'900',color:'#fff'},onboardText:{fontSize:15,color:'#dcecff',lineHeight:25,marginVertical:10},onboardHint:{textAlign:'center',color:'#a9c9ec',fontSize:11,marginTop:18},auth:{flex:1,backgroundColor:C.bg,justifyContent:'center',padding:18},link:{color:C.main,fontWeight:'800',textAlign:'center',marginTop:14},centerPage:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:C.bg},toast:{position:'absolute',top:45,left:25,right:25,backgroundColor:'#17204a',padding:12,borderRadius:18,alignItems:'center',zIndex:50}
});
