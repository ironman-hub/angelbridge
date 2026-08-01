"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckboxGroup } from "./CheckboxGroup";
import {
  SITUATION_TYPES,
  NEED_OPTIONS,
  HAVE_OPTIONS,
  OTHERS_WITH_OPTIONS,
  CONTACTED_OPTIONS,
  WAIT_OPTIONS,
  MONEY_OPTIONS,
} from "@/lib/constants";

function nowLocalInput() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function RequestHelpForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [f, setF] = useState({
    situationType: "",
    description: "",
    incidentAt: nowLocalInput(),
    currentAddress: "",
    currentPostcode: "",
    destinationAddress: "",
    needs: [] as string[],
    have: [] as string[],
    isSafe: true,
    unsafeReason: "",
    isInjured: false,
    hasOthers: false,
    othersWith: [] as string[],
    contactedHelp: false,
    contactedWho: [] as string[],
    waitingFor: "",
    estimatedWait: "",
    moneyAvailable: "",
    canBuyFood: false,
    safeTonight: false,
    previousHelp: false,
    declarationTrue: false,
    consent: false,
  });

  function set<K extends keyof typeof f>(key: K, val: (typeof f)[K]) {
    setF((prev) => ({ ...prev, [key]: val }));
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setErrors((e) => ({ ...e, location: "Geolocation is not supported on this device" }));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setErrors((e) => ({ ...e, location: "Could not get your location, please enter your address manually" }));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const res = await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...f,
        currentLat: coords?.lat ?? null,
        currentLng: coords?.lng ?? null,
        gpsVerified: !!coords,
        idVerified: false,
      }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErrors(json.fieldErrors ?? { form: json.error ?? "Could not submit your request" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push(`/cases/${json.id}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-2xl bg-brand-50 p-4 text-sm text-brand-900">
        🔒 Your information is private and confidential. It is processed only to assess and provide
        assistance, in line with UK data protection law. In a life-threatening emergency, always call 999.
      </div>

      {errors.form && (
        <div className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{errors.form}</div>
      )}

      {/* Situation */}
      <section className="card p-5">
        <h2 className="text-lg font-bold text-slate-900">Your situation</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="label">What best describes your situation?</label>
            <select className="input" value={f.situationType} onChange={(e) => set("situationType", e.target.value)}>
              <option value="">Select…</option>
              {SITUATION_TYPES.map((s) => <option key={s}>{s}</option>)}
            </select>
            {errors.situationType && <p className="field-error">{errors.situationType}</p>}
          </div>
          <div>
            <label className="label">Describe what happened</label>
            <textarea className="input min-h-[90px]" value={f.description} onChange={(e) => set("description", e.target.value)} />
            {errors.description && <p className="field-error">{errors.description}</p>}
          </div>
          <div>
            <label className="label">When did this happen?</label>
            <input type="datetime-local" className="input" value={f.incidentAt} onChange={(e) => set("incidentAt", e.target.value)} />
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="card p-5">
        <h2 className="text-lg font-bold text-slate-900">Where you are</h2>
        <div className="mt-4 space-y-4">
          <div>
            <button type="button" className="btn-primary" onClick={useMyLocation} disabled={locating}>
              📍 {locating ? "Locating…" : "Use my current location"}
            </button>
            {coords && (
              <p className="mt-2 text-xs font-medium text-green-700">
                Location captured ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}), helps a van reach you faster.
              </p>
            )}
            {errors.location && <p className="field-error">{errors.location}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Current address / location</label>
              <input className="input" value={f.currentAddress} onChange={(e) => set("currentAddress", e.target.value)} placeholder="e.g. Manchester Piccadilly Station" />
              {errors.currentAddress && <p className="field-error">{errors.currentAddress}</p>}
            </div>
            <div>
              <label className="label">Postcode (UK)</label>
              <input className="input" value={f.currentPostcode} onChange={(e) => set("currentPostcode", e.target.value)} placeholder="M1 2QF" />
              {errors.currentPostcode && <p className="field-error">{errors.currentPostcode}</p>}
            </div>
          </div>
          <div>
            <label className="label">Where are you trying to get to?</label>
            <input className="input" value={f.destinationAddress} onChange={(e) => set("destinationAddress", e.target.value)} />
            {errors.destinationAddress && <p className="field-error">{errors.destinationAddress}</p>}
          </div>
        </div>
      </section>

      {/* Needs */}
      <section className="card p-5">
        <h2 className="text-lg font-bold text-slate-900">What help do you need today?</h2>
        <div className="mt-4">
          <CheckboxGroup options={NEED_OPTIONS} value={f.needs} onChange={(v) => set("needs", v)} />
        </div>
        <label className="label mt-5">Which of these do you currently have?</label>
        <CheckboxGroup options={HAVE_OPTIONS} value={f.have} onChange={(v) => set("have", v)} />
      </section>

      {/* Safety */}
      <section className="card p-5">
        <h2 className="text-lg font-bold text-slate-900">Safety</h2>
        <div className="mt-4 space-y-4">
          <YesNo label="Are you currently safe?" value={f.isSafe} onChange={(v) => set("isSafe", v)} />
          {!f.isSafe && (
            <div>
              <label className="label">Tell us why you are unsafe</label>
              <textarea className="input" value={f.unsafeReason} onChange={(e) => set("unsafeReason", e.target.value)} />
            </div>
          )}
          <YesNo label="Are you injured?" value={f.isInjured} onChange={(v) => set("isInjured", v)} />
          <YesNo label="Is anyone with you?" value={f.hasOthers} onChange={(v) => set("hasOthers", v)} />
          {f.hasOthers && (
            <div>
              <label className="label">Who is with you?</label>
              <CheckboxGroup options={OTHERS_WITH_OPTIONS} value={f.othersWith} onChange={(v) => set("othersWith", v)} columns={3} />
            </div>
          )}
        </div>
      </section>

      {/* Existing help */}
      <section className="card p-5">
        <h2 className="text-lg font-bold text-slate-900">Help already requested</h2>
        <div className="mt-4 space-y-4">
          <YesNo label="Have you contacted anyone for help?" value={f.contactedHelp} onChange={(v) => set("contactedHelp", v)} />
          {f.contactedHelp && (
            <div>
              <label className="label">Who have you contacted?</label>
              <CheckboxGroup options={CONTACTED_OPTIONS} value={f.contactedWho} onChange={(v) => set("contactedWho", v)} />
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Who are you waiting for?</label>
              <input className="input" value={f.waitingFor} onChange={(e) => set("waitingFor", e.target.value)} />
            </div>
            <div>
              <label className="label">Estimated waiting time</label>
              <select className="input" value={f.estimatedWait} onChange={(e) => set("estimatedWait", e.target.value)}>
                <option value="">Select…</option>
                {WAIT_OPTIONS.map((w) => <option key={w}>{w}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="card p-5">
        <h2 className="text-lg font-bold text-slate-900">Your current resources</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="label">How much money do you currently have available?</label>
            <select className="input" value={f.moneyAvailable} onChange={(e) => set("moneyAvailable", e.target.value)}>
              <option value="">Select…</option>
              {MONEY_OPTIONS.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <YesNo label="Can you buy food yourself right now?" value={f.canBuyFood} onChange={(v) => set("canBuyFood", v)} />
          <YesNo label="Do you have somewhere safe to stay tonight?" value={f.safeTonight} onChange={(v) => set("safeTonight", v)} />
          <YesNo label="Have you received help from Angel Bridge before?" value={f.previousHelp} onChange={(v) => set("previousHelp", v)} />
        </div>
      </section>

      {/* Declaration */}
      <section className="card p-5">
        <h2 className="text-lg font-bold text-slate-900">Declaration &amp; consent</h2>
        <div className="mt-4 space-y-3">
          <Check label="I confirm the information I have provided is true to the best of my knowledge, and I understand Angel Bridge provides temporary emergency support, not a replacement for long-term services." checked={f.declarationTrue} onChange={(v) => set("declarationTrue", v)} />
          {errors.declarationTrue && <p className="field-error">{errors.declarationTrue}</p>}
          <Check label="I consent to my information being processed to assess and provide assistance, in accordance with applicable data protection laws." checked={f.consent} onChange={(v) => set("consent", v)} />
          {errors.consent && <p className="field-error">{errors.consent}</p>}
        </div>
      </section>

      <button className="btn-accent w-full py-3 text-base" disabled={loading}>
        {loading ? "Submitting your request…" : "Submit request for help"}
      </button>
    </form>
  );
}

function YesNo({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex gap-2">
        {[{ v: true, t: "Yes" }, { v: false, t: "No" }].map(({ v, t }) => (
          <button
            type="button"
            key={t}
            onClick={() => onChange(v)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ring-1 ${
              value === v ? "bg-brand-600 text-white ring-brand-600" : "bg-white text-slate-600 ring-slate-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-start gap-3 text-left">
      <span className={`mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-md border text-xs ${checked ? "border-brand-500 bg-brand-600 text-white" : "border-slate-300"}`}>
        {checked ? "✓" : ""}
      </span>
      <span className="text-sm text-slate-600">{label}</span>
    </button>
  );
}
