# رحلة الثانوية — Android Native

نسخة Native من تطبيق **رحلة الثانوية** بدون WebView وبدون تشغيل HTML/JavaScript كواجهة للتطبيق.

- Android 6.0+ (API 23)
- موبايل وتابلت
- واجهة Android أصلية بالكامل
- تنقل داخلي + زر رجوع + زر خروج
- اختبارات واختيار إجابات ونتيجة ومراجعة
- تحدي الأصدقاء وإنشاء/إدخال كود
- التقدم والملف الشخصي والإعدادات
- حفظ الاسم محلياً
- Workflow مستقل لبناء APK والتحقق من عدم وجود WebView في نقطة الدخول

## البناء

افتح مجلد `android_project` في Android Studio ثم نفّذ:

`Build > Generate App Bundle / APK > Generate APK`

أو:

`gradle --no-daemon :app:assembleDebug`

## النسخة الجديدة

الفرع المخصص للنسخة Native هو `native-final`.

نقطة الدخول:
`android_project/app/src/main/java/com/rihla/thanaweya/MainActivity.java`

تمت إزالة اعتماد MainActivity على `android.webkit.WebView` و`loadUrl` بالكامل.
