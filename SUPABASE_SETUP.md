# 🚀 إعداد Supabase - بديل مجاني لـ Firebase

## لماذا Supabase؟
- **مجاني 100%** - لا حاجة للدفع
- **تخزين دائم** - البيانات محفوظة على السيرفر
- **متاح على كل الأجهزة** - يعمل من أي مكان
- **أفضل من Firebase** - ميزات أكثر وأسعار أقل

## 📋 خطوات الإعداد:

### 1. إنشاء حساب Supabase:
- اذهب إلى: https://supabase.com
- اضغط "Start your project"
- سجل بحساب GitHub أو Google

### 2. إنشاء مشروع جديد:
- اضغط "New Project"
- اختر اسم: `my-podcast-platform`
- اختر Region: `Asia Pacific (Singapore)` أو الأقرب لك
- كلمة المرور: اختر كلمة مرور قوية

### 3. الحصول على المفاتيح:
- بعد إنشاء المشروع، اذهب إلى **Settings** → **API**
- انسخ:
  - **Project URL**: `https://your-project.supabase.co`
  - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 4. إنشاء جدول الحلقات:
- اذهب إلى **Table Editor**
- اضغط "Create a new table"
- اسم الجدول: `episodes`
- اضغط "Save"

### 5. إضافة الأعمدة:
```sql
-- انسخ والصق هذا الكود في SQL Editor
CREATE TABLE episodes (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  audio_data TEXT NOT NULL,
  audio_type TEXT NOT NULL,
  audio_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. تحديث الملفات:
- افتح `services/supabaseService.ts`
- استبدل:
  ```typescript
  const supabaseUrl = 'https://your-project.supabase.co';
  const supabaseKey = 'your-anon-key';
  ```
- بالقيم الحقيقية من Supabase

### 7. تحديث التطبيق:
- افتح `App.tsx`
- غير السطر:
  ```typescript
  import { getAllEpisodes, addEpisode, deleteEpisode } from './services/supabaseService';
  ```

## ✅ المميزات:

### 🆓 **مجاني تماماً:**
- 500MB تخزين
- 2GB bandwidth شهرياً
- قاعدة بيانات PostgreSQL
- API مجاني

### 🌐 **يعمل على كل الأجهزة:**
- الكمبيوتر
- الموبايل
- التابلت
- أي متصفح

### 🔒 **أمان عالي:**
- تشفير البيانات
- Row Level Security
- Authentication مدمج

## 🚀 بعد الإعداد:

1. **شغل التطبيق:**
   ```bash
   npm run dev
   ```

2. **جرب رفع حلقة:**
   - ستحفظ على السيرفر
   - ستظهر على كل الأجهزة
   - ستكون متاحة دائماً

## 🔧 استكشاف الأخطاء:

### إذا لم يعمل:
1. تحقق من المفاتيح في `supabaseService.ts`
2. تأكد من إنشاء جدول `episodes`
3. تحقق من Console في المتصفح

### رسائل الخطأ الشائعة:
- `Invalid API key` → تحقق من المفتاح
- `Table doesn't exist` → أنشئ جدول `episodes`
- `Network error` → تحقق من الاتصال

---

**بعد الإعداد، ستكون الحلقات محفوظة على السيرفر ومتاحة على كل الأجهزة!** 🎵✨
