"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LedgerForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/ledger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        direction: fd.get("direction"),
        amountPounds: Number(fd.get("amountPounds")),
        reason: fd.get("reason"),
        description: fd.get("description"),
      }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? "Could not add entry");
      return;
    }
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-3 p-5">
      <h3 className="font-semibold text-slate-900">Add a movement</h3>
      <p className="text-xs text-slate-500">Every entry appears publicly on the transparency feed with its reason.</p>
      {error && <p className="field-error">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Direction</label>
          <select name="direction" className="input">
            <option value="credit">Credit (money in)</option>
            <option value="debit">Debit (money out)</option>
          </select>
        </div>
        <div>
          <label className="label">Amount (£)</label>
          <input name="amountPounds" type="number" step="0.01" min="0" className="input" />
        </div>
      </div>
      <div>
        <label className="label">Reason</label>
        <input name="reason" className="input" placeholder="e.g. Stock purchase" />
      </div>
      <div>
        <label className="label">Description (optional)</label>
        <input name="description" className="input" placeholder="Explanation for donors" />
      </div>
      <button className="btn-primary" disabled={loading}>{loading ? "Adding…" : "Add entry"}</button>
    </form>
  );
}
