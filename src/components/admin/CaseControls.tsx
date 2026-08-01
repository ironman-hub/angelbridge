"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CASE_STATUSES } from "@/lib/constants";

export function CaseControls({
  caseId,
  status,
  notes,
  eta,
}: {
  caseId: string;
  status: string;
  notes: string;
  eta: number | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState<string>("");
  const [noteText, setNoteText] = useState(notes);
  const [etaText, setEtaText] = useState(eta != null ? String(eta) : "");

  async function patch(body: Record<string, unknown>, label: string) {
    setSaving(label);
    const res = await fetch(`/api/admin/cases/${caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving("");
    if (res.ok) router.refresh();
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="label">Set status</p>
        <div className="flex flex-wrap gap-2">
          {CASE_STATUSES.map((s) => (
            <button
              key={s}
              disabled={saving !== ""}
              onClick={() => patch({ status: s }, s)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ring-1 ${status === s ? "bg-brand-600 text-white ring-brand-600" : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"}`}
            >
              {saving === s ? "…" : s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">ETA (minutes)</label>
        <div className="flex gap-2">
          <input className="input max-w-[120px]" value={etaText} onChange={(e) => setEtaText(e.target.value)} inputMode="numeric" />
          <button className="btn-ghost" disabled={saving !== ""} onClick={() => patch({ etaMinutes: etaText === "" ? null : Number(etaText) }, "eta")}>
            {saving === "eta" ? "Saving…" : "Save ETA"}
          </button>
        </div>
      </div>

      <div>
        <label className="label">Internal case notes</label>
        <textarea className="input min-h-[90px]" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
        <button className="btn-primary mt-2" disabled={saving !== ""} onClick={() => patch({ caseNotes: noteText }, "notes")}>
          {saving === "notes" ? "Saving…" : "Save notes"}
        </button>
      </div>
    </div>
  );
}
