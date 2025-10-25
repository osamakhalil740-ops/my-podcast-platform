# 🔥 حل مشكلة Firebase Storage - خطوات سريعة

## المشكلة: الـ Upload بيوصل لـ 91% ويقف

### الحل السريع:

#### 1. اذهب إلى Firebase Console:
- افتح: https://console.firebase.google.com/
- اختر مشروع: `my-podcast-v2`

#### 2. إصلاح Storage Rules:
- اذهب إلى **Storage** في القائمة الجانبية
- اضغط على **Rules** tab
- استبدل الكود بالكود التالي:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

#### 3. إصلاح Firestore Rules:
- اذهب إلى **Firestore Database**
- اضغط على **Rules** tab
- استبدل الكود بالكود التالي:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

#### 4. اضغط **Publish** في كلا المكانين

### ✅ بعد التطبيق:
1. ارجع للموقع
2. جرب الـ upload مرة أخرى
3. يجب أن يعمل بدون مشاكل

### 🔍 إذا لم يعمل:
- تحقق من Console في المتصفح (F12)
- تأكد من أن المشروع نشط في Firebase
- جرب ملف أصغر (أقل من 5MB)

---
**ملاحظة:** هذه القواعد للاختبار فقط. في الإنتاج، استخدم authentication مناسب.
