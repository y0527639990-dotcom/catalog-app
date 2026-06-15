"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "catalog_store_login";

export default function StoreLoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [storeName, setStoreName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          storeName?: string;
          username?: string;
        };
        if (parsed.storeName) setStoreName(parsed.storeName);
        if (parsed.username) setUsername(parsed.username);
      }
    } catch {
      // ignore
    }
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const endpoint =
      mode === "login"
        ? "/api/auth/store/login"
        : "/api/auth/store/register";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName, username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "שגיאה");
        return;
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          storeName: storeName.trim(),
          username: username.trim(),
        }),
      );

      router.push("/catalog");
      router.refresh();
    } catch {
      setError("שגיאת רשת. נסה שוב.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
      <h1 className="mb-2 text-center text-2xl font-bold text-emerald-800">
        {mode === "login" ? "כניסת לקוח" : "הרשמת חנות חדשה"}
      </h1>
      <p className="mb-6 text-center text-sm text-gray-600">
        {mode === "login"
          ? "הזן שם חנות, שם משתמש וסיסמה"
          : "פעם ראשונה? צור חשבון חדש"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">שם החנות</label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base"
            placeholder="למשל: מינימרק השכונה"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">שם משתמש</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base"
            placeholder="למשל: דוד"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">סיסמה</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base"
            placeholder="בחר סיסמה"
            required
          />
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-600 py-3 text-base font-semibold text-white disabled:opacity-60"
        >
          {loading ? "ממתין..." : mode === "login" ? "התחבר" : "הירשם"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-gray-500">
        המכשיר יזכור את שם החנות והמשתמש לכניסה הבאה
      </p>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setError("");
        }}
        className="mt-2 w-full text-sm text-emerald-700 underline"
      >
        {mode === "login"
          ? "פעם ראשונה? לחץ כאן להרשמה"
          : "כבר רשום? לחץ כאן להתחברות"}
      </button>
    </div>
  );
}
