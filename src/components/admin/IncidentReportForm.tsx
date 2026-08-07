"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckboxGroup } from "@/components/CheckboxGroup";
import { HELP_PROVIDED_OPTIONS } from "@/lib/constants";

export type IncidentInitial = {
  completedByName: string;
  completedByEmail: string;
  arrivedAt: string; // datetime-local value or ""
  completedAt: string;
  summary: string;
  helpProvided: string[];
  suppliesGiven: string;
  outcome: string;
  memberNotes: string;
  emergencyServicesCalled: boolean;
  emergencyServicesDetail: string;
  status: string;
  feedbackToken: string | null;
};

export function IncidentReportForm({
  caseId,
  initial,
}: {
  caseId: string;
  initial: IncidentInitial;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(initial.feedbackToken);
  const [copied, setCopied] = useState(false);
  const [f, setF] = useState(initial);

  function set<K extends keyof IncidentInitial>(key: K, val: IncidentInitial[K]) {
    setF((prev) => ({ ...prev, [key]: val }));
  }

  async function save(status: "draft" | "completed") {
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/admin/incidents/${caseId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        completedByName: f.completedByName,
        completedByEmail: f.completedByEmail,
        arrivedAt: f.arrivedAt || null,
        completedAt: f.completedAt || null,
        summary: f.summary,
        helpProvided: f.helpProvided,
        suppliesGiven: f.suppliesGiven,
        outcome: f.outcome,
        memberNotes: f.memberNotes,
        emergencyServicesCalled: f.emergencyServicesCalled,
        emergencyServicesDetail: f.emergencyServicesDetail,
        status,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMessage(json.error ?? "Could not save the report");
      return;
    }
    setToken(json.feedbackToken);
    set("status", json.status);
    setMessage(status === "completed" ? "Incident report completed and saved." : "Draft saved.");
    router.refresh();
  }

  const feedbackUrl =
    token && typeof window !== "undefined" ? `${window.location.origin}/feedback/${token}` : "";

  function copyLink() {
    if (!feedbackUrl) return;
    navigator.clipboard?.writeText(feedbackUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const whatsappShare = feedbackUrl
    ? `https://wa.me/?text=${encodeURIComponent(
        `Thank you from Angel Bridge Foundation. Please share your feedback on the help you received: ${feedbackUrl}`
      )}`
    : "";

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-xl bg-green-50 p-3 text-sm font-medium text-green-800">{message}</div>
      )}

      <div className="card p-5">
        <h3 className="mb-4 font-semibold text-slate-900">Completed by</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Member name</label>
            <input className="input" value={f.completedByName} onChange={(e) => set("completedByName", e.target.value)} />
          </div>
          <div>
            <label className="label">Member email</label>
            <input className="input" value={f.completedByEmail} onChange={(e) => set("completedByEmail", e.target.value)} />
          </div>
          <div>
            <label className="label">Time arrived on scene</label>
            <input type="datetime-local" className="input" value={f.arrivedAt} onChange={(e) => set("arrivedAt", e.target.value)} />
          </div>
          <div>
            <label className="label">Time completed</label>
            <input type="datetime-local" className="input" value={f.completedAt} onChange={(e) => set("completedAt", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-4 font-semibold text-slate-900">What happened</h3>
        <div className="space-y-4">
          <div>
            <label className="label">What was found on arrival</label>
            <textarea className="input min-h-[80px]" value={f.summary} onChange={(e) => set("summary", e.target.value)} />
          </div>
          <div>
            <label className="label">Help provided</label>
            <CheckboxGroup options={HELP_PROVIDED_OPTIONS} value={f.helpProvided} onChange={(v) => set("helpProvided", v)} />
          </div>
          <div>
            <label className="label">Supplies handed over</label>
            <textarea className="input min-h-[60px]" value={f.suppliesGiven} onChange={(e) => set("suppliesGiven", e.target.value)} placeholder="e.g. 1 blanket, 2 bottles of water, phone charge" />
          </div>
          <div>
            <label className="label">Outcome / how it was resolved</label>
            <textarea className="input min-h-[70px]" value={f.outcome} onChange={(e) => set("outcome", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-4 font-semibold text-slate-900">Emergency services</h3>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-700">Did we call the emergency services (999)?</span>
          <div className="flex gap-2">
            {[{ v: true, t: "Yes" }, { v: false, t: "No" }].map(({ v, t }) => (
              <button
                type="button"
                key={t}
                onClick={() => set("emergencyServicesCalled", v)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ring-1 ${
                  f.emergencyServicesCalled === v ? "bg-brand-600 text-white ring-brand-600" : "bg-white text-slate-600 ring-slate-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        {f.emergencyServicesCalled && (
          <div className="mt-4">
            <label className="label">Which service and what happened</label>
            <textarea className="input min-h-[60px]" value={f.emergencyServicesDetail} onChange={(e) => set("emergencyServicesDetail", e.target.value)} placeholder="e.g. Called ambulance at 21:40, arrived 22:05" />
          </div>
        )}
      </div>

      <div className="card p-5">
        <h3 className="mb-4 font-semibold text-slate-900">Member notes</h3>
        <textarea className="input min-h-[70px]" value={f.memberNotes} onChange={(e) => set("memberNotes", e.target.value)} />
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn-ghost" onClick={() => save("draft")} disabled={saving}>
          {saving ? "Saving…" : "Save draft"}
        </button>
        <button type="button" className="btn-accent" onClick={() => save("completed")} disabled={saving}>
          {saving ? "Saving…" : "Mark as completed"}
        </button>
      </div>

      {/* Feedback link for the assisted person */}
      {token && (
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900">Feedback link for the assisted person</h3>
          <p className="mt-1 text-sm text-slate-500">
            Send this private link so they can leave a comment about the help they received.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input readOnly className="input flex-1 min-w-[220px] text-sm" value={feedbackUrl} />
            <button type="button" className="btn-primary text-sm" onClick={copyLink}>
              {copied ? "Copied!" : "Copy link"}
            </button>
            {whatsappShare && (
              <a href={whatsappShare} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
                Share on WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
