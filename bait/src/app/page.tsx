import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 to-white px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-xl">
        <p className="text-sm font-medium text-sky-700">פרויקט חדש</p>
        <h1 className="mt-2 text-4xl font-bold text-sky-950">Bait</h1>
        <p className="mt-3 text-slate-600">
          אפליקציה חדשה עם Supabase חדש — מוכנה לפיתוח
        </p>

        <div className="mt-8 space-y-3">
          <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900">
            <p className="font-semibold">השלבים הבאים</p>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-right text-sky-800">
              <li>צור פרויקט Supabase חדש בשם bait</li>
              <li>הרץ את supabase/schema.sql</li>
              <li>העתק .env.example ל-.env.local</li>
              <li>הרץ npm run dev בתיקיית bait</li>
            </ol>
          </div>

          <Link
            href="/api/health/db"
            className="block rounded-2xl bg-sky-600 py-4 text-lg font-semibold text-white transition hover:bg-sky-700"
          >
            בדיקת חיבור Supabase
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          פורט מקומי: 3001 · catalog-app נשאר על 3000
        </p>
      </div>
    </main>
  );
}
