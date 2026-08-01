"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TestimonialModeration({ id, approved }: { id: string; approved: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setApproved(next: boolean) {
    setBusy(true);
    const res = await fetch(`/api/admin/testimonials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: next }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  async function remove() {
    setBusy(true);
    const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex gap-2">
      {approved ? (
        <button className="btn-ghost" disabled={busy} onClick={() => setApproved(false)}>Hide</button>
      ) : (
        <button className="btn-primary" disabled={busy} onClick={() => setApproved(true)}>Approve</button>
      )}
      <button className="btn-ghost text-red-600" disabled={busy} onClick={remove}>Delete</button>
    </div>
  );
}
