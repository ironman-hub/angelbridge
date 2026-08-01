import Link from "next/link";
import { prisma } from "@/lib/db";
import { computeImpact } from "@/lib/metrics";
import { DONATION_TIERS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const HOW_STEPS = [
  ["Request in minutes", "A short, private assessment captures your exact location and immediate needs."],
  ["We assess fairly", "Our system checks eligibility and prioritises by need — built to reach genuine crises, not exclude people."],
  ["Help is dispatched", "Like watching for a taxi, you see our response unit coming with a live ETA."],
  ["Bridge to more support", "We meet the immediate need and, where useful, refer you to housing, health or outreach partners."],
];

const PROVIDE = [
  ["🥪", "Food & water"],
  ["🧥", "Warm clothing & blankets"],
  ["🔌", "Phone charging"],
  ["🚗", "Safe transport"],
  ["⛽", "Fuel & vehicle help"],
  ["🧼", "Hygiene kits"],
  ["🍼", "Baby & family supplies"],
  ["➕", "Basic first aid"],
];

export default async function HomePage() {
  const [impact, stories] = await Promise.all([
    computeImpact(),
    prisma.testimonial.findMany({ where: { approved: true }, orderBy: { createdAt: "desc" }, take: 2 }),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-700 to-brand-600 text-white">
        <div className="section grid gap-8 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="chip bg-white/15 text-white">Piloting in Manchester</span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
              Help that arrives while you wait.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-brand-50">
              Angel Bridge Foundation bridges the gap between a crisis and the help that&apos;s coming — food,
              water, warmth, phone charging and safe transport for people stranded, delivered by our mobile
              response unit while longer-term services are on their way.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/request-help" className="btn-accent px-6 py-3 text-base">Get help now</Link>
              <Link href="/donate" className="btn px-6 py-3 text-base bg-white text-brand-700 hover:bg-brand-50">Donate</Link>
              <Link href="/get-involved" className="btn px-6 py-3 text-base bg-transparent text-white ring-1 ring-white/40 hover:bg-white/10">Volunteer</Link>
            </div>
            <p className="mt-4 text-sm text-brand-100">
              In a life-threatening emergency, always call <strong>999</strong>.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 self-center">
            <Stat label="People helped" value={impact.peopleHelped} />
            <Stat label="Avg response" value={impact.averageResponseMins != null ? `${impact.averageResponseMins} min` : "—"} />
            <Stat label="Children assisted" value={impact.childrenAssisted} />
            <Stat label="Areas covered" value={impact.geographicCoverage} />
          </div>
        </div>
      </section>

      {/* Mission / about */}
      <section className="section py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Who we are</h2>
            <p className="mt-4 text-slate-600">
              Angel Bridge Foundation is a non-profit community response service. Emergencies happen to anyone,
              at any time — a breakdown, a cancelled last train, a lost wallet, a housing crisis. The right
              services often exist, but there&apos;s a gap between when help is needed and when it arrives.
            </p>
            <p className="mt-3 text-slate-600">
              We fill that gap. We provide immediate, practical support during the waiting period and connect
              people to the longer-term help they need — starting in Manchester, one community at a time.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/how-it-works" className="btn-primary">How it works</Link>
              <Link href="/impact" className="btn-ghost">Our impact</Link>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">We don&apos;t replace existing services</h3>
            <p className="mt-2 text-slate-600">
              Food banks, roadside recovery, councils and emergency services all do vital work. Angel Bridge
              connects people to them while providing immediate support during the wait — that&apos;s our role,
              and our promise to the people and partners we work with.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>✓ Immediate, practical help on scene</li>
              <li>✓ A fair, private eligibility assessment</li>
              <li>✓ Referrals to specialist partners where needed</li>
              <li>✓ Every action recorded to safeguard and improve</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white">
        <div className="section py-16">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">How it works</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
            From request to resolution, you&apos;re supported and kept informed the whole way.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {HOW_STEPS.map(([title, body], i) => (
              <div key={title} className="card p-6">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 font-bold text-white">{i + 1}</span>
                <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we provide */}
      <section className="section py-16">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">What our response unit provides</h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          Our mobile response unit is a mini support centre on wheels, stocked to meet immediate needs on the spot.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {PROVIDE.map(([icon, label]) => (
            <div key={label} className="card flex flex-col items-center gap-2 p-5 text-center">
              <span className="text-3xl">{icon}</span>
              <span className="text-sm font-medium text-slate-700">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Impact band */}
      <section className="bg-brand-700 text-white">
        <div className="section py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-bold sm:text-3xl">Proving the model with evidence</h2>
            <Link href="/impact" className="text-sm font-semibold text-white underline">See all our metrics →</Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <BandStat label="Food packs distributed" value={impact.foodPacksDistributed} />
            <BandStat label="Blankets provided" value={impact.blanketsProvided} />
            <BandStat label="Safe transport arranged" value={impact.safeTransportArranged} />
            <BandStat label="Volunteer hours" value={impact.volunteerHours} />
          </div>
        </div>
      </section>

      {/* Stories */}
      {stories.length > 0 && (
        <section className="section py-16">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Stories from people we&apos;ve helped</h2>
            <Link href="/testimonials" className="hidden text-sm font-semibold text-brand-700 sm:block">Read more →</Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {stories.map((t) => (
              <figure key={t.id} className="card p-6">
                <div className="text-accent-500">{"★".repeat(t.rating)}</div>
                <blockquote className="mt-3 text-slate-700">“{t.story}”</blockquote>
                <figcaption className="mt-4 text-sm font-semibold text-slate-900">
                  {t.authorName} <span className="font-normal text-slate-500">· {t.location}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Donation tiers */}
      <section className="bg-white">
        <div className="section py-16">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Your donation, made tangible</h2>
            <Link href="/transparency" className="hidden text-sm font-semibold text-brand-700 sm:block">Our transparency →</Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {DONATION_TIERS.map((t) => (
              <div key={t.amount} className="card flex flex-col p-5">
                <p className="text-2xl font-extrabold text-brand-700">{t.label}</p>
                <p className="mt-2 flex-1 text-sm text-slate-600">{t.blurb}</p>
                <Link href={`/donate?amount=${t.amount}`} className="btn-primary mt-4">Give {t.label}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get involved CTA */}
      <section className="section py-16">
        <div className="card grid items-center gap-6 p-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Be part of the response</h2>
            <p className="mt-2 text-slate-600">
              Volunteer your time, become a referral partner, or sponsor a van or a family. Every contribution
              keeps a response unit on the road.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link href="/get-involved" className="btn-primary">Get involved</Link>
            <Link href="/get-involved?tab=partner" className="btn-ghost">Become a partner</Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
      <p className="text-3xl font-extrabold">{value}</p>
      <p className="mt-1 text-sm text-brand-100">{label}</p>
    </div>
  );
}

function BandStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/10 p-5">
      <p className="text-3xl font-extrabold">{value}</p>
      <p className="mt-1 text-sm text-brand-100">{label}</p>
    </div>
  );
}
