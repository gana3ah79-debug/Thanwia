package com.rihla.thanaweya;

import android.app.*;
import android.os.*;
import android.content.*;
import android.graphics.*;
import android.graphics.drawable.GradientDrawable;
import android.view.*;
import android.view.inputmethod.InputMethodManager;
import android.widget.*;
import java.util.*;

public class NativeMainActivity extends Activity {
    static final int NAVY=Color.rgb(9,31,60), BLUE=Color.rgb(39,105,232), CYAN=Color.rgb(38,170,255), BG=Color.rgb(245,247,251), TEXT=Color.rgb(20,35,60), MUTED=Color.rgb(104,119,142), WHITE=Color.WHITE, GREEN=Color.rgb(30,177,125), RED=Color.rgb(225,70,88), GOLD=Color.rgb(245,174,55);
    LinearLayout root, body; SharedPreferences pref; int page=0, score=0, qIndex=0, selected=-1; String currentSubject="اللغة العربية";
    final String[] subjects={"اللغة العربية","اللغة الإنجليزية","الكيمياء","الفيزياء","الأحياء"};
    final String[] icons={"📘","🇬🇧","🧪","⚡","🧬"};
    final String[][] questions={
        {"ما هو العنصر الذي رمزه O؟","الذهب","الأكسجين","الحديد","الهيدروجين","الأكسجين عنصر لا فلزي ورمزه الكيميائي O."},
        {"كم عدد أيام الأسبوع؟","5","6","7","8","الأسبوع يتكون من سبعة أيام."},
        {"ما عاصمة مصر؟","القاهرة","الإسكندرية","الأقصر","أسوان","القاهرة هي عاصمة جمهورية مصر العربية."},
        {"أي كلمة تعبر عن فعل؟","كتاب","جميل","يكتب","مدرسة","يكتب فعل مضارع يدل على حدوث الفعل في الزمن الحاضر."},
        {"ما ناتج 2 + 3؟","4","5","6","7","جمع 2 و3 يساوي 5."}
    };

    public void onCreate(Bundle b){super.onCreate(b); pref=getSharedPreferences("thanwia",0); getWindow().setStatusBarColor(NAVY); showHome();}
    int dp(int n){return (int)(n*getResources().getDisplayMetrics().density+.5f);}
    GradientDrawable bg(int color,int radius){GradientDrawable g=new GradientDrawable();g.setColor(color);g.setCornerRadius(dp(radius));return g;}
    GradientDrawable stroke(int color,int border,int radius){GradientDrawable g=bg(color,radius);g.setStroke(dp(1),border);return g;}
    TextView text(String s,float size,int color){TextView v=new TextView(this);v.setText(s);v.setTextSize(size);v.setTextColor(color);v.setGravity(Gravity.RIGHT|Gravity.CENTER_VERTICAL);v.setPadding(dp(12),dp(8),dp(12),dp(8));return v;}
    Button button(String s,int fg,int color){Button b=new Button(this);b.setText(s);b.setTextColor(fg);b.setTextSize(14);b.setAllCaps(false);b.setMinHeight(dp(48));b.setPadding(dp(12),dp(5),dp(12),dp(5));b.setBackground(bg(color,15));return b;}
    LinearLayout card(){LinearLayout c=new LinearLayout(this);c.setOrientation(LinearLayout.VERTICAL);c.setPadding(dp(16),dp(14),dp(16),dp(14));c.setBackground(bg(WHITE,18));LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2);p.setMargins(0,0,0,dp(12));c.setLayoutParams(p);return c;}
    void clear(){body.removeAllViews();}
    void shell(String title,boolean back){
        root=new LinearLayout(this);root.setOrientation(LinearLayout.VERTICAL);root.setBackgroundColor(BG);
        LinearLayout bar=new LinearLayout(this);bar.setGravity(Gravity.CENTER_VERTICAL);bar.setPadding(dp(5),0,dp(5),0);bar.setBackground(bg(NAVY,0));
        Button bk=button(back?"‹":"×",WHITE,NAVY);bk.setOnClickListener(v->{if(back)goBack();else finishAndRemoveTask();});bar.addView(bk,new LinearLayout.LayoutParams(dp(52),dp(62)));
        TextView titleView=text(title,20,WHITE);titleView.setGravity(Gravity.CENTER);bar.addView(titleView,new LinearLayout.LayoutParams(0,dp(62),1));
        Button close=button("×",WHITE,NAVY);close.setOnClickListener(v->finishAndRemoveTask());bar.addView(close,new LinearLayout.LayoutParams(dp(52),dp(62)));
        root.addView(bar);
        ScrollView scroll=new ScrollView(this);scroll.setFillViewport(true);body=new LinearLayout(this);body.setOrientation(LinearLayout.VERTICAL);body.setPadding(dp(16),dp(16),dp(16),dp(18));scroll.addView(body);root.addView(scroll,new LinearLayout.LayoutParams(-1,0,1));setContentView(root);
    }
    void addNav(){
        LinearLayout n=new LinearLayout(this);n.setGravity(Gravity.CENTER);n.setPadding(dp(3),dp(3),dp(3),dp(3));n.setBackgroundColor(WHITE);
        String[] labels={"الرئيسية","اختبارات","تحدي","تقدمي","حسابي"};
        for(int i=0;i<labels.length;i++){final int k=i;Button b=button(labels[i],k==page?BLUE:MUTED,WHITE);b.setTextSize(11);b.setOnClickListener(v->{if(k==0)showHome();else if(k==1)showExams();else if(k==2)showChallenge();else if(k==3)showProgress();else showProfile();});n.addView(b,new LinearLayout.LayoutParams(0,dp(62),1));}
        root.addView(n);
    }
    TextView heading(String s){TextView h=text(s,22,TEXT);h.setPadding(dp(4),dp(5),dp(4),dp(12));return h;}
    void showHome(){page=0;shell("رحلة الثانوية",false);clear();
        String name=pref.getString("name","");
        body.addView(text(name.length()>0?"أهلاً يا "+name+" 👋":"أهلاً بك في رحلة الثانوية 👋",25,TEXT));
        body.addView(text("رحلتك التعليمية تبدأ بخطوة… وكل اختبار يقربك من هدفك 🎓",14,MUTED));
        LinearLayout hero=card();hero.setBackground(bg(BLUE,22));hero.addView(text("جاهز لاختبار جديد؟",23,WHITE));hero.addView(text("اختبر نفسك الآن، واعرف مستواك فوراً مع شرح الإجابات.",14,WHITE));
        Button start=button("ابدأ الاختبار  ←",BLUE,WHITE);start.setOnClickListener(v->showExams());hero.addView(start);body.addView(hero);
        LinearLayout stats=card();stats.setOrientation(LinearLayout.HORIZONTAL);stats.setGravity(Gravity.CENTER);
        stat(stats,"🏆",String.valueOf(pref.getInt("tests",0)),"اختبار");stat(stats,"⭐",String.valueOf(pref.getInt("points",0)),"نقطة");stat(stats,"🔥",String.valueOf(pref.getInt("streak",0)),"يوم");body.addView(stats);
        body.addView(heading("الوصول السريع"));quick("📝 الاختبارات","اختر المادة وابدأ اختباراً",v->showExams());quick("⚔️ تحدي الأصدقاء","أنشئ تحدياً أو أدخل بكود",v->showChallenge());quick("📊 تقدمي","راجع نتائجك ونسبة إنجازك",v->showProgress());quick("👤 حسابي","الملف الشخصي والإعدادات",v->showProfile());addNav();
    }
    void stat(LinearLayout parent,String icon,String value,String label){LinearLayout c=new LinearLayout(this);c.setOrientation(LinearLayout.VERTICAL);c.setGravity(Gravity.CENTER);c.addView(text(icon,22,TEXT));TextView v=text(value,19,BLUE);v.setGravity(Gravity.CENTER);c.addView(v);TextView l=text(label,11,MUTED);l.setGravity(Gravity.CENTER);c.addView(l);parent.addView(c,new LinearLayout.LayoutParams(0,-2,1));}
    void quick(String title,String sub,View.OnClickListener l){LinearLayout c=card();c.setOrientation(LinearLayout.HORIZONTAL);LinearLayout tx=new LinearLayout(this);tx.setOrientation(LinearLayout.VERTICAL);tx.addView(text(title,16,TEXT));tx.addView(text(sub,12,MUTED));c.addView(tx,new LinearLayout.LayoutParams(0,-2,1));Button b=button("فتح",WHITE,BLUE);b.setOnClickListener(l);c.addView(b,new LinearLayout.LayoutParams(dp(80),dp(48)));body.addView(c);}

    void showExams(){page=1;shell("الاختبارات",true);clear();body.addView(heading("اختر المادة"));body.addView(text("اختبارات قصيرة مصممة للمراجعة السريعة وقياس مستواك.",13,MUTED));
        for(int i=0;i<subjects.length;i++){final String subject=subjects[i];LinearLayout c=card();LinearLayout row=new LinearLayout(this);row.setGravity(Gravity.CENTER_VERTICAL);TextView ico=text(icons[i],28,TEXT);ico.setGravity(Gravity.CENTER);row.addView(ico,new LinearLayout.LayoutParams(dp(54),dp(58)));LinearLayout tx=new LinearLayout(this);tx.setOrientation(LinearLayout.VERTICAL);tx.addView(text(subject,17,TEXT));tx.addView(text("اختيار من متعدد • 5 أسئلة",12,MUTED));row.addView(tx,new LinearLayout.LayoutParams(0,-2,1));c.addView(row);Button b=button("ابدأ الاختبار",WHITE,BLUE);b.setOnClickListener(v->{currentSubject=subject;startQuiz();});c.addView(b);body.addView(c);}addNav();
    }
    void startQuiz(){page=2;score=0;qIndex=0;selected=-1;showQuestion();}
    void showQuestion(){shell(currentSubject+"  •  "+(qIndex+1)+" / "+questions.length,true);clear();
        LinearLayout progress=card();TextView p=text("التقدم  "+qIndex+" / "+questions.length,12,MUTED);progress.addView(p);ProgressBar pb=new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);pb.setMax(questions.length);pb.setProgress(qIndex);progress.addView(pb,new LinearLayout.LayoutParams(-1,dp(8)));body.addView(progress);
        body.addView(text(questions[qIndex][0],22,TEXT));body.addView(text("اختر إجابة واحدة فقط",12,MUTED));
        for(int i=1;i<=4;i++){final int k=i;Button a=button(questions[qIndex][i],TEXT,WHITE);a.setGravity(Gravity.RIGHT|Gravity.CENTER_VERTICAL);a.setPadding(dp(18),0,dp(18),0);a.setOnClickListener(v->{selected=k;checkAnswer(k);});body.addView(a,new LinearLayout.LayoutParams(-1,dp(58)));}
        TextView tip=text("💡 ركّز في السؤال قبل الاختيار.",13,MUTED);tip.setPadding(dp(5),dp(16),dp(5),dp(5));body.addView(tip);
    }
    void checkAnswer(int k){boolean correct=isCorrect(qIndex,k);if(correct)score++;pref.edit().putInt("points",pref.getInt("points",0)+(correct?10:2)).apply();
        String title=correct?"إجابة صحيحة 🎉":"إجابة غير صحيحة";String msg=(correct?"أحسنت! حافظ على هذا التركيز.\n\n":"لا مشكلة، الخطأ فرصة للتعلم.\n\n")+"الشرح:\n"+questions[qIndex][5];
        new AlertDialog.Builder(this).setTitle(title).setMessage(msg).setPositiveButton(qIndex+1<questions.length?"التالي":"عرض النتيجة",(d,w)->{if(qIndex+1<questions.length){qIndex++;showQuestion();}else finishQuiz();}).setCancelable(false).show();
    }
    boolean isCorrect(int q,int k){return (q==0&&k==2)||(q==1&&k==3)||(q==2&&k==1)||(q==3&&k==3)||(q==4&&k==2);}
    void finishQuiz(){pref.edit().putInt("tests",pref.getInt("tests",0)+1).putInt("lastScore",score).putInt("lastTotal",questions.length).apply();showResult();}
    void showResult(){page=2;shell("نتيجة الاختبار",true);clear();LinearLayout result=card();result.setGravity(Gravity.CENTER);TextView big=text(score+" / "+questions.length,46,score>=3?GREEN:BLUE);big.setGravity(Gravity.CENTER);result.addView(big);TextView percent=text((score*100/questions.length)+"%",18,MUTED);percent.setGravity(Gravity.CENTER);result.addView(percent);
        String msg=score>=4?"ممتاز جداً! أنت متقدم 👏":score>=3?"أداء رائع! استمر وراجع النقاط الصغيرة ⭐":"راجع الإجابات الخاطئة ثم أعد الاختبار 💪";TextView m=text(msg,17,TEXT);m.setGravity(Gravity.CENTER);result.addView(m);body.addView(result);
        body.addView(text("ماذا بعد؟",19,TEXT));Button retry=button("🔄 إعادة الاختبار",WHITE,BLUE);retry.setOnClickListener(v->startQuiz());body.addView(retry);Button review=button("📚 راجع تقدمي",BLUE,WHITE);review.setOnClickListener(v->showProgress());body.addView(review);Button more=button("اختبار مادة أخرى",TEXT,WHITE);more.setOnClickListener(v->showExams());body.addView(more);addNav();
    }

    void showChallenge(){page=2;shell("تحدي الأصدقاء",true);clear();body.addView(heading("⚔️ العب مع أصحابك"));body.addView(text("أنشئ تحدياً وشارك الكود مع أصدقائك، أو أدخل كود تحدٍ وصلك.",14,MUTED));
        LinearLayout create=card();create.addView(text("إنشاء تحدي جديد",19,TEXT));create.addView(text("سيتم إنشاء كود فريد لك.",12,MUTED));Button c=button("🎯 إنشاء التحدي",WHITE,BLUE);c.setOnClickListener(v->createChallenge());create.addView(c);body.addView(create);
        LinearLayout join=card();join.addView(text("الدخول إلى تحدٍ",19,TEXT));EditText code=new EditText(this);code.setHint("اكتب كود التحدي");code.setGravity(Gravity.RIGHT);code.setSingleLine(true);join.addView(code);Button j=button("دخول التحدي",WHITE,GREEN);j.setOnClickListener(v->{if(code.getText().toString().trim().length()<4)toast("اكتب كود التحدي أولاً");else{toast("تم قبول الكود ✅");startQuiz();}});join.addView(j);body.addView(join);body.addView(text("💡 يمكنك مشاركة الكود مع أصدقائك من شاشة التحدي.",12,MUTED));addNav();
    }
    void createChallenge(){String code="TH-"+(100000+new Random().nextInt(900000));new AlertDialog.Builder(this).setTitle("تم إنشاء التحدي 🎯").setMessage("كود التحدي:\n\n"+code+"\n\nشاركه مع أصدقائك وابدأ المنافسة!").setNegativeButton("إغلاق",null).setPositiveButton("ابدأ",(d,w)->startQuiz()).show();}

    void showProgress(){page=3;shell("تقدمي",true);clear();body.addView(heading("📊 لوحة تقدمك"));int tests=pref.getInt("tests",0),last=pref.getInt("lastScore",0),total=pref.getInt("lastTotal",questions.length);int pct=total==0?0:last*100/total;
        LinearLayout hero=card();hero.setGravity(Gravity.CENTER);hero.addView(text(pct+"%",42,BLUE));TextView h=text("آخر نتيجة",14,MUTED);h.setGravity(Gravity.CENTER);hero.addView(h);body.addView(hero);
        LinearLayout stats=card();stat(stats,"📝",String.valueOf(tests),"اختبارات");stat(stats,"🎯",last+" / "+total,"آخر نتيجة");stat(stats,"⭐",String.valueOf(pref.getInt("points",0)),"نقاط");body.addView(stats);
        LinearLayout advice=card();advice.addView(text("نصيحة للمراجعة 💡",17,TEXT));advice.addView(text(last>=3?"مستواك جيد. جرّب مادة جديدة وحافظ على الاستمرارية.":"ارجع لشرح الأسئلة التي أخطأت فيها، ثم أعد الاختبار لتثبيت المعلومة.",14,MUTED));body.addView(advice);Button b=button("📝 ابدأ اختباراً الآن",WHITE,BLUE);b.setOnClickListener(v->showExams());body.addView(b);addNav();
    }

    void showProfile(){page=4;shell("حسابي",true);clear();body.addView(heading("👤 الملف الشخصي"));
        LinearLayout c=card();c.addView(text("اسم الطالب",14,MUTED));EditText name=new EditText(this);name.setHint("اكتب اسمك");name.setText(pref.getString("name",""));name.setGravity(Gravity.RIGHT);c.addView(name);Button save=button("حفظ البيانات",WHITE,BLUE);save.setOnClickListener(v->{pref.edit().putString("name",name.getText().toString().trim()).apply();toast("تم حفظ البيانات ✅");});c.addView(save);body.addView(c);
        LinearLayout account=card();account.addView(text("الحساب",18,TEXT));Button login=button("🔐 تسجيل الدخول / إنشاء حساب",BLUE,WHITE);login.setOnClickListener(v->showAuth());account.addView(login);Button settings=button("⚙️ الإعدادات",TEXT,WHITE);settings.setOnClickListener(v->showSettings());account.addView(settings);body.addView(account);
        Button out=button("تسجيل الخروج",WHITE,RED);out.setOnClickListener(v->{pref.edit().remove("logged").apply();toast("تم تسجيل الخروج");showHome();});body.addView(out);addNav();
    }
    void showAuth(){page=4;shell("تسجيل الدخول",true);clear();body.addView(heading("مرحباً بك من جديد 👋"));body.addView(text("سجّل الدخول أو أنشئ حساباً محلياً للبدء. يمكنك ربط الحساب السحابي لاحقاً.",13,MUTED));LinearLayout c=card();EditText email=new EditText(this);email.setHint("البريد الإلكتروني");email.setInputType(33);c.addView(email);EditText pass=new EditText(this);pass.setHint("كلمة المرور");pass.setInputType(129);c.addView(pass);Button sign=button("تسجيل الدخول",WHITE,BLUE);sign.setOnClickListener(v->{if(email.getText().toString().trim().length()<3||pass.getText().toString().length()<4)toast("أدخل البريد وكلمة مرور من 4 أحرف على الأقل");else{pref.edit().putBoolean("logged",true).apply();toast("تم تسجيل الدخول ✅");showProfile();}});c.addView(sign);Button reg=button("إنشاء حساب جديد",BLUE,WHITE);reg.setOnClickListener(v->showRegister());c.addView(reg);body.addView(c);}
    void showRegister(){page=4;shell("إنشاء حساب",true);clear();body.addView(heading("ابدأ رحلتك 🎓"));LinearLayout c=card();EditText name=new EditText(this);name.setHint("اسم الطالب");c.addView(name);EditText email=new EditText(this);email.setHint("البريد الإلكتروني");email.setInputType(33);c.addView(email);EditText pass=new EditText(this);pass.setHint("كلمة المرور");pass.setInputType(129);c.addView(pass);EditText confirm=new EditText(this);confirm.setHint("تأكيد كلمة المرور");confirm.setInputType(129);c.addView(confirm);Button r=button("إنشاء الحساب",WHITE,GREEN);r.setOnClickListener(v->{if(name.getText().toString().trim().isEmpty()||email.getText().toString().trim().length()<3||pass.getText().length()<4)toast("أكمل البيانات بشكل صحيح");else if(!pass.getText().toString().equals(confirm.getText().toString()))toast("كلمتا المرور غير متطابقتين");else{pref.edit().putString("name",name.getText().toString().trim()).putBoolean("logged",true).apply();toast("تم إنشاء الحساب ✅");showProfile();}});c.addView(r);body.addView(c);}
    void showSettings(){page=4;shell("الإعدادات",true);clear();body.addView(heading("⚙️ إعدادات التطبيق"));Button pass=button("🔑 تغيير كلمة السر",TEXT,WHITE);pass.setOnClickListener(v->showChangePassword());body.addView(pass);Button about=button("ℹ️ عن رحلة الثانوية",TEXT,WHITE);about.setOnClickListener(v->new AlertDialog.Builder(this).setTitle("رحلة الثانوية").setMessage("نسخة Native Android سريعة بدون WebView.\n\nالتعلم • الاختبارات • الشرح • التقدم • تحدي الأصدقاء").setPositiveButton("حسناً",null).show());body.addView(about);Button exit=button("🚪 خروج من التطبيق",WHITE,RED);exit.setOnClickListener(v->finishAndRemoveTask());body.addView(exit);}
    void showChangePassword(){page=4;shell("تغيير كلمة السر",true);clear();body.addView(heading("🔑 تغيير كلمة السر"));LinearLayout c=card();EditText oldp=new EditText(this);oldp.setHint("كلمة السر الحالية");oldp.setInputType(129);c.addView(oldp);EditText np=new EditText(this);np.setHint("كلمة السر الجديدة");np.setInputType(129);c.addView(np);EditText cp=new EditText(this);cp.setHint("تأكيد كلمة السر الجديدة");cp.setInputType(129);c.addView(cp);Button save=button("حفظ كلمة السر",WHITE,BLUE);save.setOnClickListener(v->{if(np.getText().length()<4)toast("كلمة السر الجديدة قصيرة جداً");else if(!np.getText().toString().equals(cp.getText().toString()))toast("التأكيد غير مطابق");else toast("تم تحديث كلمة السر محلياً ✅");});c.addView(save);body.addView(c);}
    void goBack(){if(page==0)finishAndRemoveTask();else showHome();}
    void toast(String s){Toast.makeText(this,s,Toast.LENGTH_SHORT).show();}
    @Override public void onBackPressed(){goBack();}
}