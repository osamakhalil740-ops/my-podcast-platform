# ⚡ إعداد سريع - GitHub Storage

## 🎯 الهدف: الحلقات تفضل موجودة عند الناس كلها

### 📋 **خطوات سريعة (5 دقائق):**

#### 1. إنشاء GitHub Token (2 دقيقة):
- اذهب إلى: https://github.com/settings/tokens
- اضغط "Generate new token" → "Generate new token (classic)"
- اختر "repo" فقط
- اضغط "Generate token"
- **انسخ التوكن** (مهم!)

#### 2. إنشاء Repository (1 دقيقة):
- اذهب إلى: https://github.com/new
- اسم الـ Repository: `my-podcast-data`
- اختر "Public"
- اضغط "Create repository"

#### 3. تحديث الكود (1 دقيقة):
- افتح `services/githubStorage.ts`
- استبدل:
  ```typescript
  const GITHUB_TOKEN = 'ghp_your_token_here';
  const GITHUB_USERNAME = 'your_username';
  ```
- بالقيم الحقيقية

#### 4. إنشاء مجلد episodes (1 دقيقة):
- في الـ repository الجديد
- اضغط "Create new file"
- المسار: `episodes/.gitkeep`
- اضغط "Commit new file"

### ✅ **النتيجة:**
- **الحلقات محفوظة على GitHub**
- **متاحة للجميع** من أي مكان
- **مجاني 100%**
- **لا حدود للتخزين**

### 🚀 **بعد الإعداد:**
```bash
npm run dev
```

**ستعمل الحلقات على كل الأجهزة وستكون متاحة للجميع!** 🎵✨

### 🔧 **إذا لم يعمل:**
1. تحقق من GitHub Token
2. تأكد من إنشاء Repository
3. تحقق من Console في المتصفح

---

**بعد الإعداد، ستكون الحلقات متاحة للجميع على كل الأجهزة!** 🎉
