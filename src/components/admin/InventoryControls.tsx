"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function InventoryControls({ sku, quantity }: { sku: string; quantity: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function adjust(delta: number) {
    const reason = delta > 0 ? "Restock" : "Manual adjustment";
    setBusy(true);
    const res = await fetch("/api/admin/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sku, delta, reason }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex items-center gap-1">
      <button className="h-8 w-8 rounded-lg bg-slate-100 font-bold text-slate-700 disabled:opacity-50" disabled={busy || quantity <= 0} onClick={() => adjust(-1)}>−</button>
      <span className="w-10 text-center font-bold text-slate-900">{quantity}</span>
      <button className="h-8 w-8 rounded-lg bg-slate-100 font-bold text-slate-700 disabled:opacity-50" disabled={busy} onClick={() => adjust(1)}>+</button>
      <button className="ml-1 rounded-lg bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700 disabled:opacity-50" disabled={busy} onClick={() => adjust(10)}>+10</button>
    </div>
  );
}
