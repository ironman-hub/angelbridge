import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseArr } from "@/lib/format";
import { IncidentReportForm, type IncidentInitial } from "@/components/admin/IncidentReportForm";

export const dynamic = "force-dynamic";

function toLocalInput(d: Date | null): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function AdminIncidentPage({ params }: { params: { id: string } }) {
  const c = await prisma.case.findUnique({
    where: { id: params.id },
    include: { user: true, incidentReport: true },
  });
  if (!c) notFound();

  const r = c.incidentReport;
  const initial: IncidentInitial = {
    completedByName: r?.completedByName ?? "",
    completedByEmail: r?.completedByEmail ?? "",
    arrivedAt: toLocalInput(r?.arrivedAt ?? null),
    completedAt: toLocalInput(r?.completedAt ?? null),
    summary: r?.summary ?? "",
    helpProvided: r ? parseArr(r.helpProvided) : [],
    suppliesGiven: r?.suppliesGiven ?? "",
    outcome: r?.outcome ?? "",
    memberNotes: r?.memberNotes ?? "",
    emergencyServicesCalled: r?.emergencyServicesCalled ?? false,
    emergencyServicesDetail: r?.emergencyServicesDetail ?? "",
    status: r?.status ?? "draft",
    feedbackToken: r?.feedbackToken ?? null,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={`/admin/cases/${c.id}`} className="text-sm text-brand-700">← Back to case</Link>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Incident report</h2>
          <p className="text-sm text-slate-500">
            Incident No. <span className="font-semibold text-slate-700">{c.caseNumber}</span> ·{" "}
            {c.user.fullName} · {new Date(c.incidentAt).toLocaleString("en-GB")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`chip ${r?.status === "completed" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
            {r?.status === "completed" ? "Completed" : r ? "Draft" : "Not started"}
          </span>
          <Link href={`/admin/incidents/${c.id}/print`} className="btn-primary text-sm" target="_blank">
            View / print PDF
          </Link>
        </div>
      </div>

      {/* Snapshot of the request */}
      <div className="card p-5 text-sm">
        <h3 className="mb-2 font-semibold text-slate-900">Request snapshot</h3>
        <p className="text-slate-600"><strong>Situation:</strong> {c.situationType}</p>
        <p className="text-slate-600"><strong>Location:</strong> {c.currentAddress}, {c.currentPostcode}</p>
        <p className="text-slate-600"><strong>Needs:</strong> {parseArr(c.needs).join(", ") || "—"}{c.needsOther ? ` (Other: ${c.needsOther})` : ""}</p>
        {c.shareIdentity && (
          <p className="text-slate-600">
            <strong>Identify by:</strong> {[c.carReg, c.surroundings, c.wearing].filter(Boolean).join(" · ") || "—"}
          </p>
        )}
      </div>

      {/* Feedback received */}
      {r?.feedbackSubmittedAt && (
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900">Feedback from the assisted person</h3>
          <p className="mt-1 text-sm text-slate-500">
            Rating: <span className="font-semibold text-slate-800">{r.feedbackRating}/5</span> ·{" "}
            {new Date(r.feedbackSubmittedAt).toLocaleString("en-GB")}
          </p>
          {r.feedbackComment && <p className="mt-2 text-sm text-slate-700">“{r.feedbackComment}”</p>}
        </div>
      )}

      <IncidentReportForm caseId={c.id} initial={initial} />
    </div>
  );
}
