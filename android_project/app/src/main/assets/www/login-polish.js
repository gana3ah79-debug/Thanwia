(function(){
  'use strict';

  function isAuthContainer(el){
    if(!el) return false;
    return !!el.closest('#authGate,.auth-box,[role="dialog"]');
  }

  function clean(){
    // احذف أي عناصر ألوان موجودة داخل تسجيل الدخول/إنشاء الحساب فقط.
    document.querySelectorAll('#authGate .login-theme-area,#authGate #authPalette,#authGate .auth-palette,#authGate .auth-palette-title,#authGate .auth-theme-btn,#authGate .auth-theme-dot,#authGate #rihla-theme-entry,#authGate .theme-options,#authGate .theme-option,#authGate .theme-title,#authGate .theme-sub').forEach(e=>e.remove());

    // بطاقة "🎨 لون التطبيق" يتم إنشاؤها ديناميكيًا بواسطة كود المظهر،
    // وكانت تدخل داخل auth-box لأن زر "إنشاء حساب" يحتوي كلمة "حساب".
    document.querySelectorAll('#authGate button,#authGate a,#authGate div,#authGate span,#authGate section').forEach(e=>{
      const t=(e.textContent||'').replace(/\s+/g,' ').trim();
      if(!t) return;
      const looksLikeTheme = /لون التطبيق/.test(t) || /اختار اللون المناسب لك/.test(t) || /اختار اللون اللي يريحك/.test(t) || /مريح للعين/.test(t);
      if(looksLikeTheme && isAuthContainer(e)) e.remove();
    });

    // احتياط إضافي: لو البطاقة خرجت من authGate أثناء إعادة بناء الـDOM،
    // احذفها فقط إذا كانت موجودة داخل نافذة تسجيل الدخول فعليًا.
    document.querySelectorAll('#rihla-theme-entry').forEach(e=>{
      if(isAuthContainer(e)) e.remove();
    });

    // لا نعرض أي بقايا لعنوان/وصف اختيار اللون داخل نموذج الدخول.
    document.querySelectorAll('#authGate .theme-title,#authGate .theme-sub').forEach(e=>e.remove());
  }

  function ready(){
    clean();
    new MutationObserver(clean).observe(document.documentElement,{childList:true,subtree:true});
    setInterval(clean,300);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',ready); else ready();
})();
