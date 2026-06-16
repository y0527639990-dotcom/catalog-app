export type WhatsAppChannel = "default" | "b";

export function getWhatsAppNumber(channel?: WhatsAppChannel | null): string {
  if (channel === "b") {
    return (
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER_2 ?? "972527188812"
    );
  }
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "972555662240";
}

export function buildWhatsAppOrderUrl(
  phone: string,
  storeName: string,
  items: { sku: string; quantity: number }[],
  notes?: string,
) {
  const lines = [
    `הזמנה מ: ${storeName}`,
    "─────────────────",
    ...items.map((item) => `• מק"ט: ${item.sku} × ${item.quantity}`),
    "─────────────────",
  ];

  if (notes?.trim()) {
    lines.push(`הערות: ${notes.trim()}`);
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}
