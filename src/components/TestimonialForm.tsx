"use client";

import { useState } from "react";

export function TestimonialForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [rating, setRating] = useState(5);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authorName: form.get("authorName"),
        location: form.get("location"),
        story: form.get("story"),
        rating,
      }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErrors(json.fieldErrors ?? { form: json.error ?? "Could not submit" });
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="card p-6 text-center">
        <p className="text-lg font-semibold text-slate-900">Thank you for sharing 💙</p>
        <p className="mt-2 text-sm text-slate-600">
          Your story will appear here once it&apos;s been briefly checked. It helps others know they&apos;re not alone.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      <h3 className="text-lg font-bold text-slate-900">Share your experience</h3>
      {errors.form && <p className="field-error">{errors.form}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Your name or initials</label>
          <input name="authorName" className="input" placeholder="e.g. Alex R." />
          {errors.authorName && <p className="field-error">{errors.authorName}</p>}
        </div>
        <div>
          <label className="label">Where were you helped?</label>
          <input name="location" className="input" placeholder="e.g. Piccadilly" />
          {errors.location && <p className="field-error">{errors.location}</p>}
        </div>
      </div>
      <div>
        <label className="label">Your story</label>
        <textarea name="story" className="input min-h-[100px]" />
        {errors.story && <p className="field-error">{errors.story}</p>}
      </div>
      <div>
        <label className="label">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} onClick={() => setRating(n)} className={`text-2xl ${n <= rating ? "text-accent-500" : "text-slate-300"}`} aria-label={`${n} stars`}>
              ★
            </button>
          ))}
        </div>
      </div>
      <button className="btn-primary" disabled={loading}>{loading ? "Sending…" : "Submit your story"}</button>
    </form>
  );
}
