"use client";

import { useEffect, useState } from "react";

type CaseEvent = { id: string; type: string; message: string; createdAt: string };
type CaseData = {
  caseNumber: string;
  status: string;
  riskBand: string;
  etaMinutes: number | null;
  events: CaseEvent[];
};

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  Approved: "bg-green-100 text-green-800",
  Declined: "bg-slate-200 text-slate-700",
  Escalated: "bg-purple-100 text-purple-800",
  Closed: "bg-slate-200 text-slate-700",
};

const STAGES = ["Submitted", "Assessed", "Help on the way", "Arrived"];

function stageIndex(status: string, events: CaseEvent[]) {
  if (events.some((e) => e.type === "arrived" || e.type === "closed")) return 3;
  if (status === "Approved" || events.some((e) => e.type === "dispatched")) return 2;
  if (events.some((e) => e.type === "assessed")) return 1;
  return 0;
}

export function CaseTracker({ initial }: { initial: CaseData & { id: string } }) {
  const [data, setData] = useState<CaseData>(initial);

  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/cases/${initial.id}`, { cache: "no-store" });
        if (res.ok) setData(await res.json());
      } catch {
        /* ignore transient errors */
      }
    }, 8000);
    return () => clearInterval(t);
  }, [initial.id]);

  const active = stageIndex(data.status, data.events);
  const approved = data.status === "Approved" || data.status === "Closed";
  const declined = data.status === "Declined";
  const escalated = data.status === "Escalated";

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div className={`p-5 ${approved ? "bg-green-600" : escalated ? "bg-purple-600" : declined ? "bg-slate-600" : "bg-amber-500"} text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm/none opacity-80">Case {data.caseNumber}</p>
              <p className="mt-1 text-2xl font-bold">
                {approved && "Help is on the way"}
                {escalated && "Your case is being reviewed"}
                {declined && "We couldn't dispatch this time"}
                {!approved && !escalated && !declined && "We're assessing your request"}
              </p>
            </div>
            {approved && data.etaMinutes != null && (
              <div className="text-right">
                <p className="text-3xl font-extrabold leading-none">{data.etaMinutes}</p>
                <p className="text-xs opacity-80">min ETA</p>
              </div>
            )}
          </div>
        </div>

        {!declined && (
          <div className="p-5">
            <div className="flex items-center">
              {STAGES.map((s, i) => (
                <div key={s} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${i <= active ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                      {i < active ? "✓" : i + 1}
                    </div>
                    <span className="mt-1 w-16 text-center text-[11px] font-medium text-slate-500">{s}</span>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div className={`mx-1 h-1 flex-1 rounded ${i < active ? "bg-brand-600" : "bg-slate-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {(declined || escalated) && (
        <div className={`rounded-2xl p-4 text-sm ${declined ? "bg-slate-100 text-slate-700" : "bg-purple-50 text-purple-900"}`}>
          {declined
            ? "Based on your answers, this request falls outside what Angel Bridge can dispatch right now (for example, outside our current Manchester service area, or better suited to a specialist service). We've suggested alternatives on your dashboard, and if your situation changes you can submit again."
            : "A caseworker is reviewing your request to make sure we support you in the best way, this can include a referral to a partner agency. You'll be updated here shortly."}
        </div>
      )}

      <div className="card p-5">
        <h3 className="font-semibold text-slate-900">Updates</h3>
        <ol className="mt-3 space-y-3">
          {[...data.events].reverse().map((e) => (
            <li key={e.id} className="flex gap-3">
              <span className="mt-1 h-2 w-2 flex-none rounded-full bg-brand-500" />
              <div>
                <p className="text-sm text-slate-700">{e.message}</p>
                <p className="text-xs text-slate-400">{new Date(e.createdAt).toLocaleString("en-GB")}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="text-center text-xs text-slate-400">
        This page updates automatically. In a life-threatening emergency, always call 999.
      </p>
    </div>
  );
}
