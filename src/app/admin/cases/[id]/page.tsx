import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseArr } from "@/lib/format";
import { NEED_TO_SKU } from "@/lib/constants";
import { CaseControls } from "@/components/admin/CaseControls";
import type { Assessment } from "@/lib/eligibility";

export const dynamic = "force-dynamic";

export default async function AdminCaseDetail({ params }: { params: { id: string } }) {
  const c = await prisma.case.findUnique({
    where: { id: params.id },
    include: { user: true, events: { orderBy: { createdAt: "asc" } }, assignedVolunteer: true, incidentReport: true },
  });
  if (!c) notFound();

  let assessment: Assessment | null = null;
  try {
    assessment = JSON.parse(c.eligibilityResult) as Assessment;
  } catch {
    assessment = null;
  }

  const needs = parseArr(c.needs);
  const pickList = Array.from(new Set(needs.flatMap((n) => NEED_TO_SKU[n] ?? [])));

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div>
          <Link href="/admin/cases" className="text-sm text-brand-700">← All cases</Link>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">{c.caseNumber}</h2>
          <p className="text-sm text-slate-500">{c.user.fullName} · {c.user.email} · {c.user.phone}</p>
        </div>

        <Section title="Situation">
          <Row k="Type" v={c.situationType} />
          <Row k="Description" v={c.description} />
          <Row k="When" v={new Date(c.incidentAt).toLocaleString("en-GB")} />
          <Row k="Location" v={`${c.currentAddress}, ${c.currentPostcode}`} />
          <Row k="GPS" v={c.currentLat != null ? `${c.currentLat.toFixed(4)}, ${c.currentLng?.toFixed(4)} ${c.gpsVerified ? "(verified)" : ""}` : "Not captured"} />
          <Row k="In pilot area" v={c.inPilotArea ? "Yes" : "No"} />
          <Row k="Destination" v={c.destinationAddress} />
        </Section>

        <Section title="Needs & resources">
          <Row k="Needs" v={needs.join(", ") || "—"} />
          {c.needsOther && <Row k="Other need" v={c.needsOther} />}
          <Row k="Already has" v={parseArr(c.have).join(", ") || "—"} />
          <Row k="Can buy food" v={c.canBuyFood ? "Yes" : "No"} />
          <Row k="Safe tonight" v={c.safeTonight ? "Yes" : "No"} />
        </Section>

        <Section title="Safety">
          <Row k="Currently safe" v={c.isSafe ? "Yes" : `No, ${c.unsafeReason || ""}`} />
          <Row k="Injured" v={c.isInjured ? "Yes" : "No"} />
          <Row k="Others present" v={c.hasOthers ? parseArr(c.othersWith).join(", ") : "No"} />
        </Section>

        <Section title="How to identify them on scene">
          {c.shareIdentity ? (
            <>
              <Row k="Car reg" v={c.carReg || "—"} />
              <Row k="Surroundings" v={c.surroundings || "—"} />
              <Row k="Wearing" v={c.wearing || "—"} />
            </>
          ) : (
            <Row k="Sharing" v="The person chose not to share identifying details" />
          )}
        </Section>

        <Section title="Existing help">
          <Row k="Contacted" v={c.contactedHelp ? parseArr(c.contactedWho).join(", ") : "No"} />
          <Row k="Waiting for" v={c.waitingFor || "—"} />
          <Row k="Estimated wait" v={c.estimatedWait || "—"} />
        </Section>

        {assessment && (
          <Section title="Eligibility assessment (7 criteria)">
            <ul className="space-y-2">
              {assessment.criteria.map((cr) => (
                <li key={cr.key} className="flex items-start gap-2 text-sm">
                  <span className={cr.passed ? "text-green-600" : "text-red-600"}>{cr.passed ? "✓" : "✗"}</span>
                  <span>
                    <span className="font-medium text-slate-800">{cr.question}</span>
                    {cr.essential && <span className="ml-1 text-xs text-slate-400">(essential)</span>}
                    <span className="block text-xs text-slate-500">{cr.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              {assessment.reasons.map((r, i) => <p key={i}>• {r}</p>)}
            </div>
          </Section>
        )}

        {pickList.length > 0 && (
          <Section title="Suggested pick list">
            <ul className="grid gap-1 text-sm text-slate-700 sm:grid-cols-2">
              {pickList.map((sku) => <li key={sku}>✔ {sku}</li>)}
            </ul>
          </Section>
        )}
      </div>

      {/* Sidebar: scores + controls */}
      <div className="space-y-6">
        <div className="card p-5">
          <h3 className="font-semibold text-slate-900">Scores</h3>
          <Score label="Priority" value={c.priorityScore} tone="brand" />
          <Score label="Vulnerability" value={c.vulnerabilityScore} tone="amber" />
          <Score label="Fraud risk" value={c.fraudRiskScore} tone="red" />
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">Risk band</span>
            <span className="font-semibold">{c.riskBand}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Pathway</span>
            <span className="font-semibold capitalize">{c.pathway}</span>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 font-semibold text-slate-900">Manage case</h3>
          <CaseControls caseId={c.id} status={c.status} notes={c.caseNotes} eta={c.etaMinutes} />
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-900">Incident report</h3>
          <p className="mt-1 text-xs text-slate-500">
            Incident No. <span className="font-semibold text-slate-700">{c.caseNumber}</span>
          </p>
          <Link
            href={`/admin/incidents/${c.id}`}
            className="btn-primary mt-3 inline-block w-full text-center text-sm"
          >
            {c.incidentReport ? "Open incident report" : "Complete incident report"}
          </Link>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-slate-900">Timeline</h3>
          <ol className="mt-3 space-y-2 text-sm">
            {c.events.map((e) => (
              <li key={e.id} className="text-slate-600">
                <span className="text-slate-400">{new Date(e.createdAt).toLocaleTimeString("en-GB")}</span>, {e.message}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h3 className="mb-3 font-semibold text-slate-900">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-sm">
      <span className="text-slate-500">{k}</span>
      <span className="col-span-2 text-slate-800">{v}</span>
    </div>
  );
}
function Score({ label, value, tone }: { label: string; value: number; tone: "brand" | "amber" | "red" }) {
  const bar = tone === "brand" ? "bg-brand-600" : tone === "amber" ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="mt-3">
      <div className="flex justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-bold text-slate-900">{value}</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-slate-100">
        <div className={`h-2 rounded-full ${bar}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
