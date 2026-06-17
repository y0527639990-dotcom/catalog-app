import type { StoreOrder, StoreOrderItem, WhatsAppChannel } from "./types";

export const STORE_ORDERS_LIST_LIMIT = 200;
export const STORE_ORDERS_PER_STORE_LIMIT = 100;

export function formatOrderPrice(price: number) {
  return `₪${price.toLocaleString("he-IL", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function parseStoreOrderRow(row: Record<string, unknown>): StoreOrder {
  const items = Array.isArray(row.items) ? (row.items as StoreOrderItem[]) : [];

  return {
    id: String(row.id),
    store_id: String(row.store_id),
    store_name: String(row.store_name),
    username: String(row.username),
    items,
    total_amount: Number(row.total_amount ?? 0),
    notes: row.notes ? String(row.notes) : null,
    whatsapp_channel: (row.whatsapp_channel === "b" ? "b" : "default") as WhatsAppChannel,
    created_at: String(row.created_at),
  };
}
