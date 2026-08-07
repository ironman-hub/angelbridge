import { DonateForm } from "@/components/DonateForm";
import { DONATION_TIERS } from "@/lib/constants";

export default function DonatePage({ searchParams }: { searchParams: { amount?: string; status?: string } }) {
  const initial = searchParams.amount ? Number(searchParams.amount) : undefined;
  return (
    <div className="section max-w-4xl py-10">
      <h1 className="text-3xl font-bold text-slate-900">Donate</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Angel Bridge Foundation does not replace existing services, it connects people to them while providing immediate
        practical support during the waiting period. Here&apos;s exactly what your gift does:
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          {DONATION_TIERS.map((t) => (
            <div key={t.amount} className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4">
              <span className="text-lg font-extrabold text-brand-700">{t.label}</span>
              <span className="text-sm text-slate-600">{t.blurb}</span>
            </div>
          ))}
        </div>
        <DonateForm initialAmount={initial} status={searchParams.status} />
      </div>
    </div>
  );
}
