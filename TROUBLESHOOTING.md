# حل مشاكل الـ Upload 🔧

## المشاكل الشائعة والحلول:

### 1. مشكلة الـ Upload بيفضل في Loading و 0%

**الأسباب المحتملة:**
- مشاكل في Firebase Security Rules
- مشاكل في الاتصال بالإنترنت
- حجم الملف كبير جداً
- مشاكل في إعدادات Firebase

**الحلول:**

#### أ) تحقق من Firebase Security Rules:

**لـ Firestore:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /episodes/{document} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

**لـ Storage:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /audio/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

#### ب) تحقق من إعدادات Firebase:
1. اذهب إلى Firebase Console
2. تأكد من أن المشروع نشط
3. تحقق من Storage و Firestore مفعلين

#### ج) تحقق من حجم الملف:
- الحد الأقصى: 50MB
- جرب ملف أصغر أولاً

### 2. رسائل الخطأ الشائعة:

**"Unauthorized: Check Firebase Storage rules"**
- حل: حدث Firebase Security Rules

**"Upload timed out"**
- حل: جرب ملف أصغر أو تحقق من الإنترنت

**"Network error"**
- حل: تحقق من الاتصال بالإنترنت

### 3. خطوات التشخيص:

1. **افتح Developer Console (F12)**
2. **تحقق من رسائل الخطأ في Console**
3. **تحقق من Network tab في Developer Tools**
4. **تأكد من أن Firebase يعمل**

### 4. اختبار سريع:

```javascript
// افتح Console في المتصفح وجرب:
console.log("Testing Firebase...");
// يجب أن ترى رسائل في Console
```

### 5. إذا لم تحل المشكلة:

1. تأكد من أن Firebase project نشط
2. تحقق من أن Storage و Firestore مفعلين
3. جرب ملف أصغر (أقل من 10MB)
4. تحقق من إعدادات الشبكة

## ملاحظات مهمة:
- تأكد من أن الملف صوتي (audio/*)
- الحد الأقصى للملف: 50MB
- يجب أن يكون الاتصال بالإنترنت مستقر
