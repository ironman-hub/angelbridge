import Link from "next/link";
import { prisma } from "@/lib/db";
import { computeImpact } from "@/lib/metrics";
import { DONATION_TIERS } from "@/lib/constants";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

const HOW_STEPS = [
  ["Request in minutes", "A short, private assessment captures your exact location and immediate needs."],
  ["We assess fairly", "Our system checks eligibility and prioritises by need, built to reach genuine crises, not exclude people."],
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
      <section className="relative overflow-hidden text-white">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero.jpg')" }}
          aria-hidden="true"
        />
        {/* Blue overlay keeps white text readable */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-brand-900/95 via-brand-800/85 to-brand-700/60"
          aria-hidden="true"
        />
        <div className="section relative grid gap-8 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="chip hero-item bg-white/15 text-white" style={{ animationDelay: "0ms" }}>
              Piloting in Manchester
            </span>
            <h1
              className="hero-item mt-4 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl"
              style={{ animationDelay: "90ms" }}
            >
              Help that arrives while you wait, for anyone left “stranded”.
            </h1>
            <p className="hero-item mt-4 max-w-xl text-lg text-brand-50" style={{ animationDelay: "190ms" }}>
              Angel Bridge Foundation bridges the gap between a crisis and the help that&apos;s coming: food,
              water, warmth, phone charging and safe transport for people stranded, delivered by our mobile
              response unit while longer-term services are on their way.
            </p>
            <div className="hero-item mt-8 flex flex-wrap gap-3" style={{ animationDelay: "290ms" }}>
              <Link href="/request-help" className="btn-green px-6 py-3 text-base">Get help now</Link>
              <Link href="/donate" className="btn px-6 py-3 text-base bg-white text-brand-700 hover:bg-brand-50">Donate</Link>
              <Link href="/get-involved" className="btn px-6 py-3 text-base bg-transparent text-white ring-1 ring-white/40 hover:bg-white/10">Volunteer</Link>
            </div>
            <p className="hero-item mt-4" style={{ animationDelay: "380ms" }}>
              <span className="inline-block rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-lg">
                In a life-threatening emergency, always call 999.
              </span>
            </p>
          </div>
          <div className="hero-item grid grid-cols-2 gap-4 self-center" style={{ animationDelay: "240ms" }}>
            <Stat label="People helped" value={impact.peopleHelped} />
            <Stat label="Avg response" value={impact.averageResponseMins != null ? `${impact.averageResponseMins} min` : "—"} />
            <Stat label="Children assisted" value={impact.childrenAssisted} />
            <Stat label="Areas covered" value={impact.geographicCoverage} />
          </div>
        </div>
      </section>

      {/* Mission / about */}
      <section className="section py-16">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Who we are</h2>
              <p className="mt-4 text-slate-600">
                Angel Bridge Foundation is a non-profit community response service. Emergencies happen to
                anyone, anywhere, at any time, a breakdown, a cancelled last train, a lost wallet, a housing
                crisis. The right services often exist, but there&apos;s a gap between when help is needed and
                when it arrives that could be detrimental.
              </p>
              <p className="mt-3 text-slate-600">
                We live and breathe to fill that gap. We provide immediate, practical support during the
                waiting period and connect people to the longer-term help they need, starting in Manchester,
                one community at a time, and going beyond.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/our-story" className="btn-primary">Read our story</Link>
                <Link href="/how-it-works" className="btn-ghost">How it works</Link>
                <Link href="/impact" className="btn-ghost">Our impact</Link>
              </div>
            </div>
            <div className="card hover-lift p-6">
              <h3 className="text-lg font-semibold text-slate-900">We don&apos;t replace existing services!</h3>
              <p className="mt-2 text-slate-600">
                Food banks, roadside recovery, councils and emergency services all do vital work. Angel Bridge
                Foundation connects people to them while providing immediate support during the wait, that&apos;s
                our role, and our promise to the people and partners we work with.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>✓ Immediate, practical help on scene</li>
                <li>✓ A fair, private eligibility assessment</li>
                <li>✓ Referrals to specialist partners where needed</li>
                <li>✓ Every action recorded to safeguard and improve services</li>
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      {/* How it works */}
      <section className="bg-white">
        <div className="section py-16">
          <Reveal>
            <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">How it works</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">
              From request to resolution, you&apos;re supported and kept informed the whole way.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {HOW_STEPS.map(([title, body], i) => (
              <Reveal key={title} delay={i * 90}>
                <div className="card hover-lift h-full p-6">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 font-bold text-white">{i + 1}</span>
                  <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* What we provide */}
      <section className="section py-16">
        <Reveal>
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">What our response unit provides</h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Our mobile response unit is a mini support centre on wheels, stocked to meet immediate needs on the spot.
          </p>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {PROVIDE.map(([icon, label], i) => (
            <Reveal key={label} delay={i * 60}>
              <div className="card hover-lift group flex h-full flex-col items-center gap-2 p-5 text-center">
                <span className="text-3xl transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-125">{icon}</span>
                <span className="text-sm font-medium text-slate-700">{label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Impact band */}
      <section className="bg-brand-700 text-white">
        <div className="section py-14">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-2xl font-bold sm:text-3xl">Proving the model with evidence</h2>
              <Link href="/impact" className="link-underline text-sm font-semibold text-white">See all our metrics →</Link>
            </div>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              ["Food packs distributed", impact.foodPacksDistributed],
              ["Blankets provided", impact.blanketsProvided],
              ["Safe transport arranged", impact.safeTransportArranged],
              ["Volunteer hours", impact.volunteerHours],
            ].map(([label, value], i) => (
              <Reveal key={label as string} delay={i * 90}>
                <div className="rounded-2xl bg-white/10 p-5 transition-colors duration-300 hover:bg-white/20">
                  <p className="text-3xl font-extrabold">{value}</p>
                  <p className="mt-1 text-sm text-brand-100">{label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stories */}
      {stories.length > 0 && (
        <section className="section py-16">
          <Reveal>
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Stories from people we&apos;ve helped</h2>
              <Link href="/testimonials" className="link-underline hidden text-sm font-semibold text-brand-700 sm:block">Read more →</Link>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {stories.map((t, i) => (
              <Reveal key={t.id} delay={i * 120}>
                <figure className="card hover-lift h-full p-6">
                  <div className="text-accent-500">{"★".repeat(t.rating)}</div>
                  <blockquote className="mt-3 text-slate-700">“{t.story}”</blockquote>
                  <figcaption className="mt-4 text-sm font-semibold text-slate-900">
                    {t.authorName} <span className="font-normal text-slate-500">· {t.location}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Donation tiers */}
      <section className="bg-white">
        <div className="section py-16">
          <Reveal>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Your donation, made tangible</h2>
            <p className="mt-2 text-slate-600">Give a set amount, or choose your own. Secure payment by card, Apple Pay or Google Pay.</p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DONATION_TIERS.map((t, i) => (
              <Reveal key={t.amount} delay={i * 70}>
                <div className="card hover-lift flex h-full flex-col p-5">
                  <p className="text-2xl font-extrabold text-brand-700">{t.label}</p>
                  <p className="mt-2 flex-1 text-sm text-slate-600">{t.blurb}</p>
                  <Link href={`/donate?amount=${t.amount}`} className="btn-primary mt-4">Give {t.label}</Link>
                </div>
              </Reveal>
            ))}
            <Reveal delay={DONATION_TIERS.length * 70}>
              <div className="card hover-lift flex h-full flex-col border-2 border-brand-200 p-5">
                <p className="text-2xl font-extrabold text-brand-700">Any amount</p>
                <p className="mt-2 flex-1 text-sm text-slate-600">Enter exactly how much you&apos;d like to give, every pound helps.</p>
                <Link href="/donate" className="btn-accent mt-4">Give a custom amount</Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Get involved CTA */}
      <section className="section py-16">
        <Reveal>
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
        </Reveal>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/10 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-white/20">
      <p className="text-3xl font-extrabold">{value}</p>
      <p className="mt-1 text-sm text-brand-100">{label}</p>
    </div>
  );
}
