# Bait — פרויקט עצמאי

**לא קשור ל-catalog-app.**

| | catalog-app | Bait |
|---|---|---|
| GitHub | `y0527639990-dotcom/catalog-app` | `y0527639990-dotcom/bait` |
| Supabase | פרויקט נפרד (קטלוג) | `lzjkirlwcakugdiylzzo` |
| תיקייה | `/` (שורש) | ריפו משלו |

## פתיחה ב-Cursor כפרויקט חדש

1. **New Agent** (⌘N)
2. בחר ריפו: **`y0527639990-dotcom/bait`** (לא catalog-app!)
3. Bait ייפתח בדף/חלון נפרד

## דחיפת קוד לריפו bait (פעם אחת)

אם ריפו `bait` ב-GitHub עדיין ריק, הרץ בטרמינל:

```bash
git clone --branch standalone-bait-source --single-branch \
  https://github.com/y0527639990-dotcom/catalog-app.git bait-temp
cd bait-temp
git remote set-url origin https://github.com/y0527639990-dotcom/bait.git
git push -u origin standalone-bait-source:main
cd .. && rm -rf bait-temp
```

## הרצה מקומית

```bash
git clone https://github.com/y0527639990-dotcom/bait.git
cd bait
cp .env.example .env.local
# מלא מפתחות Supabase
npm install
npm run dev
```

http://localhost:3001

## Supabase

- Project ID: `lzjkirlwcakugdiylzzo`
- URL: `https://lzjkirlwcakugdiylzzo.supabase.co`
- schema: `supabase/schema.sql` (כבר הורץ ✅)
