# ⚡ إعداد سريع - Supabase

## 🎯 الهدف: الحلقات تفضل موجودة على كل الأجهزة

### 📋 خطوات سريعة:

#### 1. إنشاء حساب Supabase (5 دقائق):
- اذهب إلى: https://supabase.com
- اضغط "Start your project"
- سجل بحساب GitHub

#### 2. إنشاء مشروع (3 دقائق):
- اسم المشروع: `my-podcast-platform`
- Region: `Asia Pacific (Singapore)`
- كلمة المرور: اختر كلمة قوية

#### 3. الحصول على المفاتيح (2 دقيقة):
- اذهب إلى **Settings** → **API**
- انسخ **Project URL** و **anon public key**

#### 4. إنشاء جدول (1 دقيقة):
- اذهب إلى **SQL Editor**
- انسخ والصق:
```sql
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

#### 5. تحديث الكود (1 دقيقة):
- افتح `services/supabaseService.ts`
- استبدل:
  ```typescript
  const supabaseUrl = 'https://your-project.supabase.co';
  const supabaseKey = 'your-anon-key';
  ```
- بالقيم الحقيقية

### ✅ النتيجة:
- **الحلقات محفوظة على السيرفر**
- **متاحة على كل الأجهزة**
- **مجاني 100%**
- **لا حاجة للدفع**

### 🚀 بعد الإعداد:
```bash
npm run dev
```

**ستعمل الحلقات على كل الأجهزة!** 🎵✨
