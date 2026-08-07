"use client";

import { useState } from "react";

export function FeedbackForm({ token }: { token: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError("Please choose a star rating");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/feedback/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? "Could not send your feedback");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-green-50 p-6 text-center">
        <div className="text-4xl">💚</div>
        <h2 className="mt-2 text-lg font-bold text-slate-900">Thank you</h2>
        <p className="mt-1 text-sm text-slate-600">
          Your feedback has been received. It helps Angel Bridge Foundation support more people.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>}
      <div>
        <label className="label">How would you rate the help you received?</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              className={`text-3xl transition ${(hover || rating) >= n ? "text-amber-400" : "text-slate-300"}`}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label">Your comments (optional)</label>
        <textarea
          className="input min-h-[110px]"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience…"
        />
      </div>
      <button className="btn-accent w-full py-3" disabled={loading}>
        {loading ? "Sending…" : "Send feedback"}
      </button>
    </form>
  );
}
