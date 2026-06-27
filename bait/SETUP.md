# Bait — פרויקט חדש

אפליקציה חדשה לגמרי, נפרדת מ-catalog-app, עם Supabase משלה.

## שלב 1: צור פרויקט Supabase חדש

1. היכנס ל-https://supabase.com
2. לחץ **New project**
3. שם הפרויקט: **bait**
4. בחר סיסמת DB ואזור — המתן לסיום ההקמה

## שלב 2: הרץ SQL

1. ב-Supabase: **SQL Editor** → **New query**
2. פתח את `bait/supabase/schema.sql`
3. העתק הכל → הדבק → **Run**

## שלב 3: משתני סביבה

```bash
cd bait
cp .env.example .env.local
```

מלא ב-`.env.local`:

| משתנה | מאיפה |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role (Secret) |
| `NEXT_PUBLIC_APP_NAME` | `Bait` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3001` (מקומי) |

## שלב 4: הרצה מקומית

```bash
cd bait
npm install
npm run dev
```

פתח: http://localhost:3001

בדיקת DB: http://localhost:3001/api/health/db

> **הערה:** Bait רץ על פורט **3001** כדי שלא יתנגש עם catalog-app (3000).

## שלב 5: פרסום ב-Vercel

1. https://vercel.com → **Add New → Project**
2. בחר את אותו ריפו GitHub
3. **Root Directory:** `bait`
4. הוסף את משתני הסביבה מ-.env.local
5. **Deploy**

## מבנה

```
bait/
├── src/app/          # דפים ו-API
├── src/lib/supabase/ # חיבור Supabase
├── supabase/         # schema.sql
└── SETUP.md          # המדריך הזה
```

## catalog-app

הפרויקט המקורי נשאר בתיקיית השורש (`/`) ולא נגע בו.
שני הפרויקטים יכולים לחיות באותו ריפו GitHub.
