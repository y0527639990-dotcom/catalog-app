"use client";

import { useState } from "react";
import AnnouncementManager from "@/components/AnnouncementManager";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "שגיאה");
        return;
      }

      setMessage("הסיסמה עודכנה בהצלחה");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setError("שגיאת רשת");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <AnnouncementManager />

      <div className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">שינוי סיסמת מנהל</h2>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm">סיסמה נוכחית</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">סיסמה חדשה</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3"
            required
          />
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-700 py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "שומר..." : "עדכן סיסמה"}
        </button>
      </form>
    </div>
    </div>
  );
}
