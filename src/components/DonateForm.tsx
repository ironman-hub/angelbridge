"use client";

import { useState } from "react";
import { DONATION_TIERS } from "@/lib/constants";

export function DonateForm({ initialAmount }: { initialAmount?: number }) {
  const [amount, setAmount] = useState<number>(initialAmount ?? 25);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const form = new FormData(e.currentTarget);
    const tier = DONATION_TIERS.find((t) => t.amount === amount)?.label;
    const res = await fetch("/api/donations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        donorName: form.get("donorName"),
        donorEmail: form.get("donorEmail"),
        amountPounds: amount,
        tier,
        message: form.get("message"),
      }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErrors(json.fieldErrors ?? { form: json.error ?? "Could not process donation" });
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="card p-6 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-green-100 text-2xl">💙</div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Thank you!</h2>
        <p className="mt-2 text-sm text-slate-600">
          Your donation of £{amount} has been recorded. Thank you for keeping the response on the road.
        </p>
        <a href="/impact" className="btn-primary mt-6 w-full">See our impact</a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-6">
      {errors.form && <p className="field-error">{errors.form}</p>}
      <div>
        <label className="label">Choose an amount</label>
        <div className="grid grid-cols-3 gap-2">
          {DONATION_TIERS.map((t) => (
            <button
              type="button"
              key={t.amount}
              onClick={() => setAmount(t.amount)}
              className={`rounded-xl px-3 py-3 text-sm font-semibold ring-1 ${amount === t.amount ? "bg-brand-600 text-white ring-brand-600" : "bg-white text-slate-700 ring-slate-200"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <label className="label">Or enter your own (£)</label>
          <input
            type="number"
            min={1}
            className="input"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Your name</label>
          <input name="donorName" className="input" />
          {errors.donorName && <p className="field-error">{errors.donorName}</p>}
        </div>
        <div>
          <label className="label">Email (for your receipt)</label>
          <input name="donorEmail" type="email" className="input" />
          {errors.donorEmail && <p className="field-error">{errors.donorEmail}</p>}
        </div>
      </div>
      <div>
        <label className="label">Message (optional)</label>
        <input name="message" className="input" placeholder="A note of support" />
      </div>
      <button className="btn-accent w-full py-3" disabled={loading}>
        {loading ? "Processing…" : `Donate £${amount || 0}`}
      </button>
      <p className="text-center text-xs text-slate-400">
        Demo mode — no real payment is taken. In production this connects to a secure payment provider.
      </p>
    </form>
  );
}
