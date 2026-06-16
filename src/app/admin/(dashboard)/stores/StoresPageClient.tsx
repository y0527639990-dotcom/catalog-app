"use client";

import { useEffect, useState } from "react";
import type { WhatsAppChannel } from "@/lib/types";

interface StoreRow {
  id: string;
  store_name: string;
  username: string;
  created_at: string;
  signup_channel?: WhatsAppChannel;
  last_login_channel?: WhatsAppChannel;
}

function ChannelBadge({ channel }: { channel: WhatsAppChannel | undefined }) {
  const value = channel ?? "default";

  if (value === "b") {
    return (
      <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-800">
        קישור 2
      </span>
    );
  }

  if (value === "default") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
        קישור 1
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
      לא ידוע
    </span>
  );
}

export default function StoresPageClient() {
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editStoreName, setEditStoreName] = useState("");
  const [editUsername, setEditUsername] = useState("");
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

  async function saveStore(store: StoreRow) {
    setError("");
    setMessage("");

    const body: Record<string, string> = { id: store.id };
    if (editStoreName.trim() !== store.store_name) {
      body.storeName = editStoreName.trim();
    }
    if (editUsername.trim() !== store.username) {
      body.username = editUsername.trim();
    }
    if (newPassword.trim()) {
      body.password = newPassword.trim();
    }

    if (Object.keys(body).length === 1) {
      setError("לא בוצע שינוי");
      return;
    }

    const response = await fetch("/api/admin/stores", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "שגיאה");
      return;
    }

    setMessage(`עודכן: ${data.store.store_name} / ${data.store.username}`);
    setEditId(null);
    setNewPassword("");
    await loadStores();
  }

  function startEdit(store: StoreRow) {
    setEditId(store.id);
    setEditStoreName(store.store_name);
    setEditUsername(store.username);
    setNewPassword("");
    setMessage("");
    setError("");
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">חנויות שנרשמו</h2>
      <p className="mt-2 text-sm text-gray-600">
        עריכת שם חנות, שם משתמש ואיפוס סיסמה ללקוחות.
      </p>
      <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <span>קישור כניסה:</span>
        <ChannelBadge channel="default" />
        <span>WhatsApp ראשי</span>
        <ChannelBadge channel="b" />
        <span>WhatsApp שני</span>
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
                <th className="px-3 py-2">קישור</th>
                <th className="px-3 py-2">תאריך</th>
                <th className="px-3 py-2">ניהול</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id} className="border-b border-gray-100">
                  {editId === store.id ? (
                    <td colSpan={5} className="px-3 py-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs">שם חנות</label>
                          <input
                            value={editStoreName}
                            onChange={(e) => setEditStoreName(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs">שם משתמש</label>
                          <input
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="mb-1 block text-xs">
                            סיסמה חדשה (אופציונלי)
                          </label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="השאר ריק אם לא משנים"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                          />
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveStore(store)}
                          className="rounded-lg bg-emerald-600 px-4 py-2 text-white"
                        >
                          שמור
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditId(null)}
                          className="text-gray-500"
                        >
                          ביטול
                        </button>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="px-3 py-3 font-medium">{store.store_name}</td>
                      <td className="px-3 py-3">{store.username}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <ChannelBadge channel={store.last_login_channel} />
                          {store.signup_channel &&
                            store.signup_channel !== store.last_login_channel && (
                              <span className="text-xs text-gray-500">
                                נרשם בקישור {store.signup_channel === "b" ? "2" : "1"}
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {new Date(store.created_at).toLocaleString("he-IL")}
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => startEdit(store)}
                          className="rounded-lg border border-gray-300 px-3 py-2"
                        >
                          ערוך
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
