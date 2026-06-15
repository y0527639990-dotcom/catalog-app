"use client";

import { useEffect, useState } from "react";

export default function AnnouncementManager() {
  const [message, setMessage] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/admin/announcement");
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "שגיאה בטעינה");
          return;
        }
        setMessage(data.message ?? "");
        setIsActive(data.isActive ?? false);
      } catch {
        setError("שגיאת רשת");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function save(active: boolean) {
    setFeedback("");
    setError("");
    setSaving(true);

    try {
      const response = await fetch("/api/admin/announcement", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, isActive: active }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "שגיאה בשמירה");
        return;
      }

      setMessage(data.message);
      setIsActive(data.isActive);
      setFeedback(
        data.isActive
          ? "המודעה פעילה — הלקוחות יראו אותה בכניסה לאתר"
          : "המודעה בוטלה — לא תוצג ללקוחות",
      );
    } catch {
      setError("שגיאת רשת");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">טוען מודעות...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">מודעה ללקוחות</h2>
      <p className="mt-1 text-sm text-gray-600">
        צור מודעה (למשל מבצע) — תופיע כפופאפ ללקוחות בכניסה לקטלוג. ניתן לסגור
        עם X.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">תוכן המודעה</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="לדוגמה: מבצע השבוע! 10% הנחה על כל המוצרים עד יום חמישי"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
          />
        </div>

        {isActive && (
          <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
            המודעה פעילה כרגע
          </p>
        )}

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {feedback && (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {feedback}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={saving || !message.trim()}
            onClick={() => save(true)}
            className="flex-1 rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "שומר..." : "הפעל מודעה"}
          </button>
          <button
            type="button"
            disabled={saving || !isActive}
            onClick={() => save(false)}
            className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 disabled:opacity-60"
          >
            בטל מודעה
          </button>
        </div>
      </div>
    </div>
  );
}
