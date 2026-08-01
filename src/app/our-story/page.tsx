import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story — Why Angel Bridge Foundation Exists",
  description:
    "Angel Bridge Foundation was not born in a boardroom. It began on the hard shoulder of the M60. This is why we exist.",
};

const partOne = [
  "I was driving home towards Romiley after taking the Bredbury exit when my car suddenly lost power. At the same time, I urgently needed to stop, so I pulled safely onto the hard shoulder.",
  "After returning to my car, I realised I had made a simple mistake. In my rush, I had left the headlights on, draining the battery. The engine wouldn't start.",
  "Like most people would, I reached for my phone.",
  "I called my wife, but she was at work and couldn't leave. I called friends and family, but those who answered were either working themselves or too far away to reach me quickly.",
  "Thankfully, I had roadside assistance through my insurance, so I contacted RAC.",
  "The response I received was that help would take approximately four hours.",
];

const partTwo = [
  "Anyone who has stood on the hard shoulder of a motorway knows how frightening it can feel. Vehicles thunder past at motorway speeds only a few metres away. The Highway Code advises people to move behind the safety barrier where possible rather than remain inside the vehicle.",
];

const partThree = [
  "The cold became unbearable.",
  "I wasn't dressed for hours outside in winter conditions, and because I suffer from cold urticaria, my body began reacting to the freezing temperatures.",
  "I became increasingly worried — not only about the cold, but about being alone.",
  "Unsure what else to do, I called the ambulance service, hoping there might be some way to obtain antihistamines or advice for my reaction. They explained that this was not a service they could provide.",
  "Running out of options, I contacted the police to ask if there was any assistance available. Unfortunately, they were unable to help in the way I had hoped.",
  "I called RAC again and explained that I no longer felt safe waiting in those conditions. Thankfully, they managed to reduce my estimated waiting time to around two hours.",
  "During that wait, a traffic police officer stopped to check that I was in a safe position and that traffic was flowing normally before continuing with their duties.",
  "Eventually, the recovery vehicle arrived. The technician connected a jump starter.",
];

const partFour = [
  "After hours of waiting in the cold, the solution itself took less time than making a cup of tea.",
  "As I drove home with the heater finally warming my hands, I couldn't stop thinking. I kept asking myself the same question.",
];

const whatIf = [
  "What if it had been an elderly person?",
  "A young student?",
  "A mother with children?",
  "Someone with a disability?",
  "Someone with a medical condition?",
  "Someone who had nowhere else to turn?",
];

const realisation = [
  "That experience changed the way I saw community. I realised there is often a gap between asking for help and receiving it.",
  "Emergency services have to prioritise life-threatening incidents. Breakdown companies can become overwhelmed. Family and friends may be unavailable.",
  "Yet during that waiting period, people can still be cold, frightened, hungry, isolated, or vulnerable.",
];

const notReplace = [
  "We are not here to replace the emergency services.",
  "We are not here to replace roadside assistance.",
  "We are not here to replace charities or local authorities.",
];

const acts = [
  "To bring a blanket when someone is freezing.",
  "To provide a phone charger when their battery is dead.",
  "To offer food and water while they wait.",
  "To sit with someone who feels alone.",
  "To provide reassurance when fear begins to take over.",
];

function Para({ children }: { children: React.ReactNode }) {
  return <p className="text-lg leading-8 text-slate-700">{children}</p>;
}

function Beat({ children }: { children: React.ReactNode }) {
  return <p className="my-8 text-center text-2xl font-bold text-slate-900">{children}</p>;
}

export default function OurStoryPage() {
  return (
    <article className="section max-w-3xl py-12">
      <header className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Our Story</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
          Why Angel Bridge Foundation Exists
        </h1>
        <p className="mt-3 text-lg italic text-slate-500">One cold afternoon changed everything.</p>
      </header>

      <div className="mt-12 space-y-6">
        <p className="text-xl font-semibold leading-8 text-slate-900">
          Angel Bridge Foundation was not born in a boardroom.
        </p>
        <p className="text-center text-2xl font-extrabold text-brand-700">
          It began on the hard shoulder of the M60.
        </p>

        {partOne.map((t, i) => (
          <Para key={i}>{t}</Para>
        ))}

        <div className="my-10 rounded-2xl bg-slate-900 px-6 py-8 text-center text-white">
          <p className="text-3xl font-extrabold">Four hours.</p>
          <p className="mt-1 text-lg text-slate-300">On a busy motorway.</p>
          <p className="text-lg text-slate-300">In freezing weather.</p>
        </div>

        {partTwo.map((t, i) => (
          <Para key={i}>{t}</Para>
        ))}

        <Beat>So I waited.</Beat>

        {partThree.map((t, i) => (
          <Para key={i}>{t}</Para>
        ))}

        <div className="my-10 text-center">
          <p className="text-lg text-slate-500">Five minutes later…</p>
          <p className="mt-1 text-3xl font-extrabold text-slate-900">My car started.</p>
          <p className="mt-6 text-xl font-bold text-slate-700">That was it. Five minutes.</p>
        </div>

        {partFour.map((t, i) => (
          <Para key={i}>{t}</Para>
        ))}

        <p className="my-10 text-center text-3xl font-extrabold text-slate-900">
          What if it hadn&apos;t been me?
        </p>
        <ul className="mx-auto my-8 max-w-md space-y-2 text-center text-lg italic text-slate-600">
          {whatIf.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>

        {realisation.map((t, i) => (
          <Para key={i}>{t}</Para>
        ))}

        <p className="my-10 text-center text-2xl font-extrabold text-brand-700">
          That gap is where Angel Bridge Foundation was born.
        </p>

        <div className="my-8 space-y-1 border-l-4 border-slate-200 pl-6 text-lg text-slate-700">
          {notReplace.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>

        <p className="text-center text-2xl font-extrabold text-slate-900">We exist to bridge the gap.</p>

        <ul className="my-8 space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
          {acts.map((t) => (
            <li key={t} className="flex items-start gap-3 text-lg text-slate-700">
              <span className="mt-1 text-brand-600">◆</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>

        <Para>
          Sometimes the greatest act of kindness is simply making sure another human being doesn&apos;t have
          to face a difficult moment alone.
        </Para>
        <Para>Every donation to Angel Bridge Foundation helps us become that bridge for someone else.</Para>

        <p className="my-12 text-center text-3xl font-extrabold leading-snug text-brand-700">
          Because no one should have to wait alone.
        </p>
      </div>

      {/* CTA */}
      <div className="mt-8 flex flex-wrap justify-center gap-3 border-t border-slate-200 pt-10">
        <Link href="/donate" className="btn-accent px-6 py-3">Donate</Link>
        <Link href="/get-involved" className="btn-primary px-6 py-3">Get involved</Link>
        <Link href="/request-help" className="btn-ghost px-6 py-3">Request help</Link>
      </div>
    </article>
  );
}
