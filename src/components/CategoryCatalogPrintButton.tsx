"use client";

export default function CategoryCatalogPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
    >
      הדפס / שמור כ־PDF
    </button>
  );
}
