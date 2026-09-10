package com.rihla.thanaweya;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.*;
import java.util.*;

/**
 * Native Android implementation of رحلة الثانوية.
 * No WebView, JavaScript, HTML or local web assets are required for the UI.
 */
public class MainActivity extends Activity {
    private static final int NAVY = Color.rgb(7,29,58);
    private static final int BLUE = Color.rgb(36,107,255);
    private static final int BG = Color.rgb(244,247,251);
    private static final int TEXT = Color.rgb(18,35,63);
    private static final int MUTED = Color.rgb(105,120,143);
    private static final int GREEN = Color.rgb(32,185,131);
    private static final int RED = Color.rgb(239,82,97);
    private static final int WHITE = Color.WHITE;

    private LinearLayout root, content;
    private SharedPreferences prefs;
    private TextView title;
    private int currentTab = 0;
    private final ArrayList<Question> questions = new ArrayList<>();
    private int quizIndex = 0, quizScore = 0;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        prefs = getSharedPreferences("thanwia", MODE_PRIVATE);
        getWindow().setStatusBarColor(NAVY);
        getWindow().setNavigationBarColor(WHITE);
        seedQuestions();
        showHome();
    }

    private void base(String screenTitle) {
        root = new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL); root.setBackgroundColor(BG);
        ScrollView scroll = new ScrollView(this); scroll.setFillViewport(true);
        content = new LinearLayout(this); content.setOrientation(LinearLayout.VERTICAL); content.setPadding(dp(16),dp(16),dp(16),dp(92));
        scroll.addView(content); root.addView(scroll, new LinearLayout.LayoutParams(-1,0,1));
        title = tv(screenTitle,22,WHITE); title.setTypeface(Typeface.DEFAULT,Typeface.BOLD);
        LinearLayout top = new LinearLayout(this); top.setGravity(Gravity.CENTER_VERTICAL); top.setPadding(dp(18),dp(18),dp(18),dp(18));
        top.setBackground(round(NAVY,0,0,dp(24),dp(24)));
        TextView back = tv("‹",34,WHITE); back.setGravity(Gravity.CENTER); back.setOnClickListener(v -> onBackPressed());
        top.addView(back,new LinearLayout.LayoutParams(dp(46),dp(46)));
        top.addView(title,new LinearLayout.LayoutParams(0,dp(46),1));
        TextView exit = tv("×",30,WHITE); exit.setGravity(Gravity.CENTER); exit.setOnClickListener(v -> finishAndRemoveTask());
        top.addView(exit,new LinearLayout.LayoutParams(dp(46),dp(46)));
        root.addView(top,new LinearLayout.LayoutParams(-1,dp(82)));
        setContentView(root);
    }

    private void showHome() {
        base("رحلة الثانوية");
        TextView hello=tv("أهلاً بك في رحلتك 🎓",27,TEXT); hello.setTypeface(null,Typeface.BOLD); content.addView(hello);
        content.addView(tv("تعلّم، اختبر نفسك، وتابع تقدمك خطوة بخطوة.",14,MUTED));
        content.addView(space(12));
        LinearLayout hero=card(); hero.setPadding(dp(20),dp(20),dp(20),dp(20));
        TextView h=tv("جاهز تكمل؟",24,WHITE); h.setTypeface(null,Typeface.BOLD); hero.setBackground(round(BLUE,20,20,20,20)); hero.addView(h);
        hero.addView(tv("ابدأ اختباراً قصيراً واحصل على نتيجة فورية مع نصائح للمراجعة.",14,Color.WHITE));
        Button start=button("ابدأ اختبار الآن",WHITE,BLUE); start.setOnClickListener(v -> startQuiz()); hero.addView(start);
        content.addView(hero);
        content.addView(space(14));
        LinearLayout stats=row(); stats.addView(stat("0","اختبارات"),lp(1)); stats.addView(stat("0%","متوسطك"),lp(1)); stats.addView(stat("0","إنجازات"),lp(1)); content.addView(stats);
        content.addView(space(14));
        content.addView(section("الوصول السريع"));
        gridButton("📝  الاختبارات","اختبر مستواك في المواد",v->showExams());
        gridButton("👥  تحدي الأصدقاء","أنشئ تحدياً وشارك الكود",v->showFriends());
        gridButton("📊  تقدمي","راجع درجاتك وأخطاءك",v->showProgress());
        gridButton("👤  الملف الشخصي","بياناتك وإعدادات الحساب",v->showProfile());
        addBottomNav();
    }

    private void showExams() {
        base("الاختبارات");
        content.addView(section("اختر المادة"));
        String[][] subs={{"📘","اللغة العربية"},{"🇬🇧","اللغة الإنجليزية"},{"🧪","الكيمياء"},{"⚡","الفيزياء"},{"🧬","الأحياء"}};
        for(String[] s:subs) { LinearLayout c=card(); TextView a=tv(s[0]+"  "+s[1],18,TEXT); a.setTypeface(null,Typeface.BOLD); c.addView(a); c.addView(tv("اختبار قصير • اختيار من متعدد",12,MUTED)); Button b=button("ابدأ",WHITE,BLUE); b.setOnClickListener(v->startQuiz()); c.addView(b); content.addView(c); }
        addBottomNav();
    }

    private void startQuiz() {
        quizIndex=0; quizScore=0; showQuestion();
    }

    private void showQuestion() {
        base("اختبار قصير  •  "+(quizIndex+1)+" / "+questions.size());
        Question q=questions.get(quizIndex);
        TextView qv=tv(q.text,20,TEXT); qv.setTypeface(null,Typeface.BOLD); content.addView(qv); content.addView(space(12));
        for(int i=0;i<q.answers.length;i++) {
            final int pick=i; Button a=button(q.answers[i],TEXT,Color.WHITE); a.setGravity(Gravity.RIGHT|Gravity.CENTER_VERTICAL); a.setOnClickListener(v->answer(q,pick)); content.addView(a);
        }
        TextView hint=tv("اختر إجابة واحدة فقط. ستظهر لك نتيجة ومراجعة بعد انتهاء الاختبار.",12,MUTED); hint.setPadding(0,dp(16),0,0); content.addView(hint);
    }

    private void answer(Question q,int pick) {
        boolean correct=pick==q.correct; if(correct) quizScore++;
        String msg=correct?"إجابة صحيحة 🎉":"الإجابة غير صحيحة";
        String detail=correct?"ممتاز! استمر بنفس التركيز.":"لا بأس. راجع الشرح وحاول مرة أخرى.";
        new AlertDialog.Builder(this).setTitle(msg).setMessage(detail+"\n\nالإجابة الصحيحة: "+q.answers[q.correct]).setPositiveButton(quizIndex+1<questions.size()?"التالي":"النتيجة",(d,w)->{quizIndex++; if(quizIndex<questions.size())showQuestion(); else showResult();}).show();
    }

    private void showResult() {
        base("نتيجة الاختبار");
        LinearLayout c=card(); c.setGravity(Gravity.CENTER); c.setPadding(dp(20),dp(28),dp(20),dp(28));
        TextView score=tv(quizScore+" / "+questions.size(),46,BLUE); score.setTypeface(null,Typeface.BOLD); score.setGravity(Gravity.CENTER); c.addView(score);
        String text=quizScore>=questions.size()*0.8?"ممتاز! أنت على الطريق الصحيح 👏":"راجع الأخطاء وحاول مرة أخرى، وستتحسن نتيجتك 💪";
        TextView m=tv(text,17,TEXT); m.setGravity(Gravity.CENTER); c.addView(m);
        Button retry=button("إعادة الاختبار",WHITE,BLUE); retry.setOnClickListener(v->startQuiz()); c.addView(retry);
        Button review=button("مراجعة تقدمي",BLUE,Color.WHITE); review.setOnClickListener(v->showProgress()); c.addView(review); content.addView(c);
    }

    private void showFriends() {
        base("تحدي الأصدقاء");
        content.addView(section("ابدأ تحدياً جديداً"));
        LinearLayout c=card(); c.addView(tv("تحدّى أصدقاءك في اختبار قصير.",18,TEXT)); c.addView(tv("أنشئ كوداً ثم شاركه معهم. يمكن لاحقاً ربط النتائج بالحساب السحابي.",13,MUTED));
        Button create=button("ابدأ تحدي مع أصدقائي",WHITE,BLUE); create.setOnClickListener(v->{String code="TH"+(100000+new Random().nextInt(900000)); showCode(code);}); c.addView(create); content.addView(c);
        content.addView(space(10));
        LinearLayout join=card(); join.addView(tv("لديك كود تحدي؟",18,TEXT)); EditText input=edit("اكتب كود التحدي"); join.addView(input); Button b=button("دخول التحدي",WHITE,GREEN); b.setOnClickListener(v->{if(input.getText().toString().trim().length()<4) toast("اكتب كوداً صحيحاً"); else {toast("تم قبول الكود");startQuiz();}}); join.addView(b); content.addView(join); addBottomNav();
    }

    private void showCode(String code) { new AlertDialog.Builder(this).setTitle("تم إنشاء التحدي 🎯").setMessage("كود التحدي:\n\n"+code+"\n\nشارك الكود مع أصدقائك.").setPositiveButton("ابدأ",(d,w)->startQuiz()).setNegativeButton("إغلاق",null).show(); }

    private void showProgress() {
        base("تقدمي");
        LinearLayout s=card(); s.addView(tv("ملخص الأداء",19,TEXT)); s.addView(tv("لا توجد نتائج محفوظة بعد.",14,MUTED));
        s.addView(bar("اللغة العربية",0)); s.addView(bar("اللغة الإنجليزية",0)); s.addView(bar("العلوم",0)); content.addView(s);
        content.addView(section("المراجعة")); LinearLayout r=card(); r.addView(tv("الأخطاء تحتاج مراجعة",17,TEXT)); r.addView(tv("بعد كل اختبار ستجد الإجابات الخاطئة هنا لتعود إليها بسهولة.",13,MUTED)); content.addView(r); addBottomNav();
    }

    private void showProfile() {
        base("الملف الشخصي");
        LinearLayout c=card(); TextView avatar=tv("👤",52,BLUE); avatar.setGravity(Gravity.CENTER); c.addView(avatar); String name=prefs.getString("name","طالب الثانوية"); TextView n=tv(name,21,TEXT); n.setGravity(Gravity.CENTER); n.setTypeface(null,Typeface.BOLD); c.addView(n); c.addView(tv("حساب محلي جاهز للربط مع Supabase.",12,MUTED)); content.addView(c);
        Button edit=button("تعديل الاسم",WHITE,BLUE); edit.setOnClickListener(v->editName()); content.addView(edit);
        Button settings=button("الإعدادات",TEXT,Color.WHITE); settings.setOnClickListener(v->showSettings()); content.addView(settings);
        Button logout=button("تسجيل الخروج",WHITE,RED); logout.setOnClickListener(v->{prefs.edit().clear().apply(); showHome();}); content.addView(logout); addBottomNav();
    }

    private void editName(){ EditText e=edit("الاسم"); e.setText(prefs.getString("name","")); new AlertDialog.Builder(this).setTitle("اسمك").setView(e).setPositiveButton("حفظ",(d,w)->{prefs.edit().putString("name",e.getText().toString().trim()).apply();showProfile();}).setNegativeButton("إلغاء",null).show(); }

    private void showSettings() {
        base("الإعدادات");
        LinearLayout c=card(); c.addView(tv("الحساب",18,TEXT)); c.addView(setting("🔐","تغيير كلمة السر","سيتم فتح نموذج آمن عند تفعيل الحساب السحابي",v->toast("سيتم ربط تغيير كلمة السر مع Supabase Auth"))); c.addView(setting("🔔","الإشعارات","تذكير بالمراجعة والتحديات",v->toast("الإشعارات جاهزة للإضافة"))); c.addView(setting("ℹ️","عن التطبيق","رحلة الثانوية — إصدار Native",v->about())); content.addView(c);
    }

    private void about(){new AlertDialog.Builder(this).setTitle("رحلة الثانوية").setMessage("تطبيق تعليمي عربي مبني كتطبيق Android أصلي بدون WebView.\n\nالإصدار Native 1.0").setPositiveButton("حسناً",null).show();}

    private void addBottomNav(){
        LinearLayout nav=new LinearLayout(this); nav.setGravity(Gravity.CENTER); nav.setBackgroundColor(WHITE); String[] labels={"⌂\nالرئيسية","📝\nاختبارات","➕\nتحدي","📊\nتقدمي","👤\nحسابي"}; View.OnClickListener[] actions={v->showHome(),v->showExams(),v->showFriends(),v->showProgress(),v->showProfile()};
        for(int i=0;i<labels.length;i++){Button b=button(labels[i],i==currentTab?BLUE:MUTED,Color.TRANSPARENT); b.setTextSize(11); b.setGravity(Gravity.CENTER); b.setOnClickListener(actions[i]); nav.addView(b,lp(1));} root.addView(nav,new LinearLayout.LayoutParams(-1,dp(72)));
    }

    private void gridButton(String text,String sub,View.OnClickListener click){LinearLayout c=card(); TextView a=tv(text,18,TEXT);a.setTypeface(null,Typeface.BOLD);c.addView(a);c.addView(tv(sub,12,MUTED));Button b=button("فتح",WHITE,BLUE);b.setOnClickListener(click);c.addView(b);content.addView(c);}
    private View setting(String icon,String name,String sub,View.OnClickListener l){LinearLayout r=row(); TextView i=tv(icon,26,TEXT);r.addView(i,new LinearLayout.LayoutParams(dp(42),dp(56))); LinearLayout t=new LinearLayout(this);t.setOrientation(LinearLayout.VERTICAL);t.addView(tv(name,16,TEXT));t.addView(tv(sub,11,MUTED));r.addView(t,lp(1));r.setOnClickListener(l);return r;}
    private View bar(String label,int value){LinearLayout b=new LinearLayout(this);b.setOrientation(LinearLayout.VERTICAL);TextView l=tv(label+"  "+value+"%",13,TEXT);b.addView(l);ProgressBar p=new ProgressBar(this,null,android.R.attr.progressBarStyleHorizontal);p.setProgress(value);b.addView(p,new LinearLayout.LayoutParams(-1,dp(9)));return b;}
    private View stat(String value,String label){LinearLayout c=card();c.setGravity(Gravity.CENTER);TextView v=tv(value,21,BLUE);v.setTypeface(null,Typeface.BOLD);c.addView(v);c.addView(tv(label,10,MUTED));return c;}
    private TextView section(String s){TextView t=tv(s,18,TEXT);t.setTypeface(null,Typeface.BOLD);t.setPadding(0,dp(6),0,dp(10));content.addView(t);return t;}
    private LinearLayout card(){LinearLayout c=new LinearLayout(this);c.setOrientation(LinearLayout.VERTICAL);c.setPadding(dp(16),dp(16),dp(16),dp(16));c.setBackground(round(WHITE,20,20,20,20));LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,-2);p.setMargins(0,0,0,dp(12));c.setLayoutParams(p);return c;}
    private LinearLayout row(){LinearLayout l=new LinearLayout(this);l.setOrientation(LinearLayout.HORIZONTAL);l.setGravity(Gravity.CENTER_VERTICAL);return l;}
    private Button button(String s,int textColor,int bg){Button b=new Button(this);b.setText(s);b.setTextColor(textColor);b.setTextSize(14);b.setAllCaps(false);b.setTypeface(null,Typeface.BOLD);b.setBackground(round(bg,15,15,15,15));LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,dp(52));p.setMargins(0,dp(7),0,dp(3));b.setLayoutParams(p);return b;}
    private EditText edit(String hint){EditText e=new EditText(this);e.setHint(hint);e.setTextSize(15);e.setSingleLine(true);e.setPadding(dp(14),0,dp(14),0);e.setBackground(round(WHITE,14,14,14,14));e.setLayoutParams(new LinearLayout.LayoutParams(-1,dp(52)));return e;}
    private TextView tv(String s,float size,int color){TextView t=new TextView(this);t.setText(s);t.setTextSize(size);t.setTextColor(color);t.setGravity(Gravity.CENTER_VERTICAL);t.setFontFeatureSettings("kern");return t;}
    private View space(int h){Space s=new Space(this);s.setLayoutParams(new LinearLayout.LayoutParams(1,dp(h)));return s;}
    private LinearLayout.LayoutParams lp(float w){return new LinearLayout.LayoutParams(0,-2,w);}
    private GradientDrawable round(int color,int a,int b,int c,int d){GradientDrawable g=new GradientDrawable();g.setColor(color);g.setCornerRadii(new float[]{dp(a),dp(a),dp(b),dp(b),dp(c),dp(c),dp(d),dp(d)});return g;}
    private int dp(int n){return Math.round(n*getResources().getDisplayMetrics().density);}
    private void toast(String s){Toast.makeText(this,s,Toast.LENGTH_SHORT).show();}

    @Override public void onBackPressed(){showHome();}

    private void seedQuestions(){questions.clear();questions.add(new Question("ما جمع كلمة كتاب؟",new String[]{"كتب","كتابات","كتابان","كاتب"},0));questions.add(new Question("ما ناتج 5 × 6؟",new String[]{"11","25","30","35"},2));questions.add(new Question("أي من الآتي كوكب؟",new String[]{"القمر","المريخ","الشمس","المجرة"},1));questions.add(new Question("ما وحدة قياس شدة التيار الكهربائي؟",new String[]{"فولت","أوم","أمبير","وات"},2));}
    private static class Question{String text;String[] answers;int correct;Question(String t,String[] a,int c){text=t;answers=a;correct=c;}}
}
