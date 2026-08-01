import { computeImpact } from "@/lib/metrics";

export const dynamic = "force-dynamic";

export default async function ImpactPage() {
  const m = await computeImpact();

  const tiles: Array<{ label: string; value: string | number }> = [
    { label: "People helped", value: m.peopleHelped },
    { label: "Children assisted", value: m.childrenAssisted },
    { label: "Older people supported", value: m.olderPeopleSupported },
    { label: "Average response time", value: m.averageResponseMins != null ? `${m.averageResponseMins} min` : "—" },
    { label: "Food packs distributed", value: m.foodPacksDistributed },
    { label: "Blankets provided", value: m.blanketsProvided },
    { label: "Phone charging sessions", value: m.chargingSessions },
    { label: "Safe transport arranged", value: m.safeTransportArranged },
    { label: "Referrals to partner agencies", value: m.referralsToPartners },
    { label: "Volunteer hours", value: m.volunteerHours },
    { label: "Areas covered (postcodes)", value: m.geographicCoverage },
    { label: "Total requests received", value: m.totalRequests },
  ];

  return (
    <div className="section max-w-5xl py-10">
      <h1 className="text-3xl font-bold text-slate-900">Our impact</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Every metric here is captured automatically from real requests, dispatches and inventory movements —
        the same evidence we include in funding applications and annual reports.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.label} className="card p-5">
            <p className="text-3xl font-extrabold text-brand-700">{t.value}</p>
            <p className="mt-1 text-sm text-slate-600">{t.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-brand-50 p-6 text-sm text-brand-900">
        <strong>First-year goal:</strong> help 100 people in Manchester safely and consistently, and measure
        the difference we make — proof of the model before we scale across Greater Manchester and the UK.
      </div>
    </div>
  );
}
