import Link from "next/link";

const steps = [
  ["Request help", "Create a verified account and complete a short, private assessment — your exact location and immediate needs, in 2–3 minutes."],
  ["Fair assessment", "Our engine checks eligibility against seven criteria and scores vulnerability, priority and misuse risk — designed to reach genuine need, not to exclude."],
  ["Dispatch", "For approved requests, the nearest response van is notified and a pick list is generated from the onboard inventory."],
  ["Help is coming", "You watch help arrive in real time, with an ETA and live updates — just like waiting for a taxi."],
  ["On scene", "A trained volunteer provides practical support: food, water, warmth, charging, hygiene, transport to safety."],
  ["Bridge to more support", "Where useful, we refer you to housing, welfare, health or outreach partners — every action recorded to improve services and prove impact."],
];

export default function HowItWorksPage() {
  return (
    <div className="section max-w-3xl py-10">
      <h1 className="text-3xl font-bold text-slate-900">How Angel Bridge works</h1>
      <p className="mt-2 text-slate-600">
        We bridge the gap between a crisis and the help that&apos;s already on its way. Here&apos;s the journey
        from request to resolution.
      </p>
      <ol className="mt-8 space-y-5">
        {steps.map(([title, body], i) => (
          <li key={title} className="card flex gap-4 p-5">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-brand-600 font-bold text-white">{i + 1}</span>
            <div>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex gap-3">
        <Link href="/request-help" className="btn-accent">Request help</Link>
        <Link href="/get-involved" className="btn-ghost">Volunteer</Link>
      </div>
    </div>
  );
}
