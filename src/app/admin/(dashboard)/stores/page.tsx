"use client";

import { useEffect, useState } from "react";

interface StoreRow {
  id: string;
  store_name: string;
  created_at: string;
}

export default function StoresPage() {
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStores() {
      const response = await fetch("/api/admin/stores");
      const data = await response.json();
      if (response.ok) {
        setStores(data.stores ?? []);
      }
      setLoading(false);
    }

    loadStores();
  }, []);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">חנויות שנרשמו</h2>
      <p className="mt-2 text-sm text-gray-600">
        הסיסמאות נשמרות מוצפנות ולא ניתן לראות אותן. אם לקוח שכח סיסמה —
        הוא יצטרך להירשם מחדש עם שם חנות חדש, או שתוכל ליצור עבורו חנות
        חדשה.
      </p>

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
                <th className="px-3 py-2">תאריך הרשמה</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id} className="border-b border-gray-100">
                  <td className="px-3 py-3 font-medium">{store.store_name}</td>
                  <td className="px-3 py-3">
                    {new Date(store.created_at).toLocaleString("he-IL")}
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
