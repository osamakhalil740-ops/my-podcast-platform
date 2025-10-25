# ⚡ إعداد سريع - Supabase

## 🎯 الهدف: الحلقات تفضل موجودة للجميع من أي مكان

### 📋 **خطوات سريعة (15 دقيقة):**

#### **1. إنشاء حساب Supabase (3 دقائق)**
- اذهب إلى: https://supabase.com
- اضغط "Start your project"
- اختر "Continue with GitHub"
- سجل دخول بحساب GitHub

#### **2. إنشاء مشروع جديد (5 دقائق)**
- اضغط "New Project"
- اسم المشروع: `my-podcast-platform`
- كلمة المرور: اختر كلمة قوية
- Region: اختر الأقرب لك
- اضغط "Create new project"

#### **3. الحصول على المفاتيح (2 دقيقة)**
- اذهب إلى **Settings** → **API**
- انسخ **Project URL** و **anon public key**

#### **4. إنشاء جدول الحلقات (3 دقائق)**
- اذهب إلى **Table Editor**
- اضغط "Create a new table"
- اسم الجدول: `episodes`
- اضغط "Save"

#### **5. إضافة الأعمدة (2 دقيقة)**
- في جدول `episodes`، أضف الأعمدة:
  - `title` - Text
  - `description` - Text
  - `audio_data` - Text
  - `audio_type` - Text
  - `audio_name` - Text
  - `file_size` - Integer
  - `created_at` - Timestamp

#### **6. تحديث الكود (2 دقيقة)**
- افتح `services/supabaseStorage.ts`
- استبدل المفاتيح بالقيم الحقيقية

### ✅ **النتيجة:**
- **الحلقات محفوظة** على Supabase
- **متاحة للجميع** من أي مكان
- **سريع جداً** - CDN عالمي
- **مجاني 100%**

### 🚀 **بعد الإعداد:**
```bash
npm run dev
```

**ستعمل الحلقات على كل الأجهزة وستكون متاحة للجميع!** 🎵✨

### 🔧 **إذا لم يعمل:**
1. تحقق من المفاتيح في `supabaseStorage.ts`
2. تأكد من إنشاء جدول `episodes`
3. تحقق من Console في المتصفح

---

**بعد الإعداد، ستكون الحلقات متاحة للجميع من أي مكان!** 🎉
