"use client";

import { useEffect, useState } from "react";

interface StoreRow {
  id: string;
  store_name: string;
  username: string;
  created_at: string;
}

export default function StoresPage() {
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetId, setResetId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadStores() {
    const response = await fetch("/api/admin/stores");
    const data = await response.json();
    if (response.ok) {
      setStores(data.stores ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadStores();
  }, []);

  async function resetPassword(store: StoreRow) {
    if (!newPassword.trim() || newPassword.length < 4) {
      setError("הסיסמה חייבת להכיל לפחות 4 תווים");
      return;
    }

    setError("");
    const response = await fetch("/api/admin/stores", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: store.id, password: newPassword }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "שגיאה");
      return;
    }

    setMessage(`סיסמה עודכנה עבור ${store.store_name} / ${store.username}`);
    setResetId(null);
    setNewPassword("");
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">חנויות שנרשמו</h2>
      <p className="mt-2 text-sm text-gray-600">
        אפשר לאפס סיסמה ללקוח ששכח — הזן סיסמה חדשה ולחץ &quot;אפס&quot;.
      </p>

      {message && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-6">טוען...</p>
      ) : stores.length === 0 ? (
        <p className="mt-6 text-gray-600">עדיין אין חנויות רשומות.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-right text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="px-3 py-2">שם חנות</th>
                <th className="px-3 py-2">משתמש</th>
                <th className="px-3 py-2">תאריך</th>
                <th className="px-3 py-2">סיסמה</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id} className="border-b border-gray-100">
                  <td className="px-3 py-3 font-medium">{store.store_name}</td>
                  <td className="px-3 py-3">{store.username}</td>
                  <td className="px-3 py-3">
                    {new Date(store.created_at).toLocaleString("he-IL")}
                  </td>
                  <td className="px-3 py-3">
                    {resetId === store.id ? (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="סיסמה חדשה"
                          className="rounded-lg border border-gray-300 px-3 py-2"
                        />
                        <button
                          type="button"
                          onClick={() => resetPassword(store)}
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-white"
                        >
                          שמור
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setResetId(null);
                            setNewPassword("");
                          }}
                          className="text-gray-500"
                        >
                          ביטול
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setResetId(store.id);
                          setNewPassword("");
                          setMessage("");
                          setError("");
                        }}
                        className="rounded-lg border border-gray-300 px-3 py-2"
                      >
                        אפס סיסמה
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
