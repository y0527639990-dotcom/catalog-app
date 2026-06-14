"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StoreLoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [storeName, setStoreName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify({ storeName, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "שגיאה");
        return;
      }

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
          ? "הזן את שם החנות והסיסמה שלך"
          : "פעם ראשונה? צור שם חנות וסיסמה"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">שם החנות</label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base"
            placeholder="למשל: חנות השכונה"
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

      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setError("");
        }}
        className="mt-4 w-full text-sm text-emerald-700 underline"
      >
        {mode === "login"
          ? "פעם ראשונה? לחץ כאן להרשמה"
          : "כבר רשום? לחץ כאן להתחברות"}
      </button>
    </div>
  );
}
