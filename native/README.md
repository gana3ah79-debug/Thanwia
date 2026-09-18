# رحلة الثانوية العامة — Native 2.1.2

هذا مجلد Native React Native/Expo مستقل. لا يستخدم WebView ولا يحمل index.html.

- package: com.thanwia.app
- version: 2.1.2
- versionCode: 23
- branch: native-v2.1.2-full

الشاشات: onboarding, setup, home, plan, session, quizzes, quiz, analysis, achievements, notifications, friends, friendChallenge، مع بوابة تسجيل الدخول.

المتكامل داخل التطبيق: Supabase Auth، الخطة الأسبوعية، مؤقت 25/5، بنك اختبار محلي قابل للتوسع، اختبار AI عبر Edge Function، تصحيح المقالي عبر Edge Function، تحليل الأخطاء والمراجعة المتباعدة، الإنجازات، الإشعارات داخل التطبيق، الأصدقاء وPresence/Realtime، تحدي الأصدقاء V2 عبر RPC.

قبل البناء الإنتاجي يجب تشغيل migration الخاص بتحدي الأصدقاء على مشروع Supabase والتحقق من سياسات RLS ووجود ai-quiz-v2.
