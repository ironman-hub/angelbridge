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
} from "@/lib/constants";

const WHATSAPP_NUMBER = "447377129015";

function nowLocalInput() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

type YN = boolean | null;

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
    needsOther: "",
    have: [] as string[],
    isSafe: null as YN,
    unsafeReason: "",
    isInjured: null as YN,
    hasOthers: null as YN,
    othersWith: [] as string[],
    contactedHelp: null as YN,
    contactedWho: [] as string[],
    waitingFor: "",
    estimatedWait: "",
    canBuyFood: null as YN,
    safeTonight: null as YN,
    previousHelp: null as YN,
    shareIdentity: true,
    carReg: "",
    surroundings: "",
    wearing: "",
    declarationTrue: false,
    consent: false,
    consentEmergency: false,
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

  const whatsappHref = () => {
    const parts = [
      "Hello Angel Bridge Foundation, I am requesting help and would like to share my location.",
      coords ? `My coordinates are ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}.` : "",
      "I will now attach my live location using the WhatsApp attachment button.",
    ].filter(Boolean);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(parts.join(" "))}`;
  };

  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!f.situationType) e.situationType = "Please choose what you are waiting for";
    if (f.description.trim().length < 10) e.description = "Please describe what happened (at least 10 characters)";
    if (f.situationType === "Other" && f.description.trim().length < 20)
      e.description = "Because you chose Other, please explain your situation in a little more detail";
    if (f.currentAddress.trim().length < 3) e.currentAddress = "Please tell us where you are";
    if (f.currentPostcode.trim().length < 3) e.currentPostcode = "Please enter your postcode";
    if (f.destinationAddress.trim().length < 2) e.destinationAddress = "Please tell us where you are heading";
    if (f.needs.includes("Other") && f.needsOther.trim().length < 3)
      e.needsOther = "Please explain what other help you need";
    if (f.isSafe === null) e.isSafe = "Please answer";
    if (f.isSafe === false && f.unsafeReason.trim().length < 3) e.unsafeReason = "Please tell us why";
    if (f.isInjured === null) e.isInjured = "Please answer";
    if (f.hasOthers === null) e.hasOthers = "Please answer";
    if (f.contactedHelp === null) e.contactedHelp = "Please answer";
    if (f.canBuyFood === null) e.canBuyFood = "Please answer";
    if (f.safeTonight === null) e.safeTonight = "Please answer";
    if (f.previousHelp === null) e.previousHelp = "Please answer";
    if (!f.declarationTrue) e.declarationTrue = "Please confirm the declaration";
    if (!f.consent) e.consent = "Consent is required to process your request";
    if (!f.consentEmergency) e.consentEmergency = "Please acknowledge the emergency-services statement";
    return e;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clientErrors = validate();
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
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
        <p className="mt-1 text-sm text-slate-500">
          Angel Bridge Foundation helps while you wait for the main service you have already called.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label className="label">What are you waiting for?</label>
            <select className="input" value={f.situationType} onChange={(e) => set("situationType", e.target.value)}>
              <option value="">Select…</option>
              {SITUATION_TYPES.map((s) => <option key={s}>{s}</option>)}
            </select>
            {errors.situationType && <p className="field-error">{errors.situationType}</p>}
          </div>
          <div>
            <label className="label">
              {f.situationType === "Other" ? "Please explain your situation" : "Describe what happened"}
            </label>
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
                Location captured ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}), helps Angel Bridge Foundation reach you faster.
              </p>
            )}
            {errors.location && <p className="field-error">{errors.location}</p>}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">Prefer to share your location on WhatsApp?</p>
            <p className="mt-1 text-xs text-slate-500">
              This opens a WhatsApp chat with us. Tap the attachment (📎) button in WhatsApp and choose
              <strong> Location → Share live location</strong> so we can find you.
            </p>
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              💬 Share my location on WhatsApp
            </a>
            <p className="mt-2 text-[11px] text-slate-400">WhatsApp: +44 7377 129015</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Current address / location</label>
              <input className="input" value={f.currentAddress} onChange={(e) => set("currentAddress", e.target.value)} placeholder="e.g. M60 hard shoulder near J25, or Manchester Piccadilly" />
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
        {f.needs.includes("Other") && (
          <div className="mt-3">
            <label className="label">You chose “Other”, please explain what you need</label>
            <textarea className="input min-h-[70px]" value={f.needsOther} onChange={(e) => set("needsOther", e.target.value)} />
            {errors.needsOther && <p className="field-error">{errors.needsOther}</p>}
          </div>
        )}

        <label className="label mt-6">So we bring the right things, do you already have any of these? (optional)</label>
        <p className="mb-2 text-xs text-slate-500">This just helps us pack. You can skip it if you’d rather not say.</p>
        <CheckboxGroup options={HAVE_OPTIONS} value={f.have} onChange={(v) => set("have", v)} />
      </section>

      {/* Safety */}
      <section className="card p-5">
        <h2 className="text-lg font-bold text-slate-900">Safety</h2>
        <div className="mt-4 space-y-4">
          <YesNo label="Are you currently safe?" value={f.isSafe} onChange={(v) => set("isSafe", v)} error={errors.isSafe} />
          {f.isSafe === false && (
            <div>
              <label className="label">Tell us why you are unsafe</label>
              <textarea className="input" value={f.unsafeReason} onChange={(e) => set("unsafeReason", e.target.value)} />
              {errors.unsafeReason && <p className="field-error">{errors.unsafeReason}</p>}
            </div>
          )}
          <YesNo label="Are you injured?" value={f.isInjured} onChange={(v) => set("isInjured", v)} error={errors.isInjured} />
          <YesNo label="Is anyone with you?" value={f.hasOthers} onChange={(v) => set("hasOthers", v)} error={errors.hasOthers} />
          {f.hasOthers === true && (
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
          <YesNo label="Have you contacted anyone for help?" value={f.contactedHelp} onChange={(v) => set("contactedHelp", v)} error={errors.contactedHelp} />
          {f.contactedHelp === false && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Angel Bridge Foundation supports people who have <strong>already requested primary help</strong>
              {" "}(for example 999, the NHS, the police, or a breakdown company) and are facing a long wait that
              may put their safety, condition or situation at risk. If you have not yet contacted a primary
              service, please do that first. In a life-threatening emergency, always call <strong>999</strong>.
            </div>
          )}
          {f.contactedHelp === true && (
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
        <h2 className="text-lg font-bold text-slate-900">Your current situation</h2>
        <div className="mt-4 space-y-4">
          <YesNo label="Can you buy food yourself right now?" value={f.canBuyFood} onChange={(v) => set("canBuyFood", v)} error={errors.canBuyFood} />
          <YesNo label="Do you have somewhere safe to stay tonight?" value={f.safeTonight} onChange={(v) => set("safeTonight", v)} error={errors.safeTonight} />
          <YesNo label="Have you received help from Angel Bridge Foundation before?" value={f.previousHelp} onChange={(v) => set("previousHelp", v)} error={errors.previousHelp} />
        </div>
      </section>

      {/* How to identify you */}
      <section className="card p-5">
        <h2 className="text-lg font-bold text-slate-900">How to easily identify you</h2>
        <p className="mt-1 text-sm text-slate-500">
          This helps our team find you quickly when they arrive. Sharing is optional.
        </p>
        <div className="mt-4 space-y-4">
          <Check
            label="I’d prefer not to share identifying details right now."
            checked={!f.shareIdentity}
            onChange={(v) => set("shareIdentity", !v)}
          />
          {f.shareIdentity && (
            <div className="space-y-4">
              <div>
                <label className="label">Car registration (if in a vehicle)</label>
                <input className="input" value={f.carReg} onChange={(e) => set("carReg", e.target.value)} placeholder="e.g. AB12 CDE" />
              </div>
              <div>
                <label className="label">Description of the place or your surroundings</label>
                <textarea className="input min-h-[70px]" value={f.surroundings} onChange={(e) => set("surroundings", e.target.value)} placeholder="e.g. by the blue recovery sign, near the second lamppost after the bridge" />
              </div>
              <div>
                <label className="label">What are you wearing?</label>
                <input className="input" value={f.wearing} onChange={(e) => set("wearing", e.target.value)} placeholder="e.g. grey hoodie, dark jeans" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Declaration */}
      <section className="card p-5">
        <h2 className="text-lg font-bold text-slate-900">Declaration &amp; consent</h2>
        <div className="mt-4 space-y-3">
          <Check label="I confirm the information I have provided is true to the best of my knowledge, and I understand Angel Bridge Foundation provides temporary emergency support, not a replacement for long-term services." checked={f.declarationTrue} onChange={(v) => set("declarationTrue", v)} />
          {errors.declarationTrue && <p className="field-error">{errors.declarationTrue}</p>}
          <Check label="I consent to my information being processed to assess and provide assistance, in accordance with applicable data protection laws." checked={f.consent} onChange={(v) => set("consent", v)} />
          {errors.consent && <p className="field-error">{errors.consent}</p>}
          <Check label="I understand that if my case is not something Angel Bridge Foundation can help with immediately and it is an emergency, Angel Bridge Foundation will ring the emergency services (fire, police or ambulance) for me." checked={f.consentEmergency} onChange={(v) => set("consentEmergency", v)} />
          {errors.consentEmergency && <p className="field-error">{errors.consentEmergency}</p>}
        </div>
      </section>

      <button className="btn-accent w-full py-3 text-base" disabled={loading}>
        {loading ? "Submitting your request…" : "Submit request for help"}
      </button>
    </form>
  );
}

function YesNo({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
  error?: string;
}) {
  return (
    <div>
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
      {error && <p className="field-error mt-1">{error}</p>}
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
