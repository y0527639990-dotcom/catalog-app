# Bait — פרויקט עצמאי

אפליקציה חדשה לגמרי, **לא קשורה ל-catalog-app**.

## שלב 1: צור פרויקט Supabase חדש

1. היכנס ל-https://supabase.com
2. לחץ **New project**
3. שם הפרויקט: **bait**
4. בחר סיסמת DB ואזור — המתן לסיום ההקמה

## שלב 2: הרץ SQL

1. ב-Supabase: **SQL Editor** → **New query**
2. פתח את `supabase/schema.sql`
3. העתק הכל → הדבק → **Run**

## שלב 3: משתני סביבה

```bash
cp .env.example .env.local
```

מלא ב-`.env.local`:

| משתנה | מאיפה |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → Publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → Secret key |
| `NEXT_PUBLIC_APP_NAME` | `Bait` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3001` (מקומי) |

## שלב 4: הרצה מקומית

```bash
npm install
npm run dev
```

פתח: http://localhost:3001

בדיקת DB: http://localhost:3001/api/health/db

## שלב 5: פרסום ב-Vercel

1. https://vercel.com → **Add New → Project**
2. בחר ריפו **bait** (לא catalog-app)
3. הוסף את משתני הסביבה מ-.env.local
4. **Deploy**

## מבנה

```
src/app/          # דפים ו-API
src/lib/supabase/ # חיבור Supabase
supabase/         # schema.sql
scripts/          # סקריפטי עזר
```
