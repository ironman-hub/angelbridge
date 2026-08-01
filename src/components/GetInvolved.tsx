"use client";

import { useState } from "react";

type Tab = "volunteer" | "partner" | "sponsor";

export function GetInvolved({ initialTab = "volunteer" }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  return (
    <div>
      <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
        {(["volunteer", "partner", "sponsor"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold capitalize ${tab === t ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"}`}
          >
            {t === "sponsor" ? "Sponsor" : t}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === "volunteer" && <VolunteerForm />}
        {tab === "partner" && <PartnerForm />}
        {tab === "sponsor" && <SponsorForm />}
      </div>
    </div>
  );
}

function useSubmit(endpoint: string) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  async function submit(payload: unknown) {
    setLoading(true);
    setErrors({});
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErrors(json.fieldErrors ?? { form: json.error ?? "Could not submit" });
      return false;
    }
    setDone(true);
    return true;
  }
  return { errors, loading, done, submit };
}

function Success({ text }: { text: string }) {
  return (
    <div className="card p-6 text-center">
      <p className="text-lg font-semibold text-slate-900">Thank you!</p>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
    </div>
  );
}

function VolunteerForm() {
  const { errors, loading, done, submit } = useSubmit("/api/volunteers");
  if (done) return <Success text="Thanks for offering your time — our volunteer team will be in touch." />;
  return (
    <form
      className="card space-y-4 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        submit(Object.fromEntries(fd.entries()));
      }}
    >
      <h3 className="text-lg font-bold text-slate-900">Volunteer with us</h3>
      {errors.form && <p className="field-error">{errors.form}</p>}
      <Grid>
        <Field name="fullName" label="Full name" error={errors.fullName} />
        <Field name="email" label="Email" type="email" error={errors.email} />
        <Field name="phone" label="UK phone" placeholder="07123 456789" error={errors.phone} />
        <Field name="postcode" label="Postcode" placeholder="M1 2QF" error={errors.postcode} />
      </Grid>
      <Field name="availability" label="Availability" placeholder="e.g. Weekend evenings" error={errors.availability} />
      <Field name="skills" label="Relevant skills (optional)" placeholder="First aid, driving, safeguarding…" />
      <button className="btn-primary" disabled={loading}>{loading ? "Sending…" : "Apply to volunteer"}</button>
    </form>
  );
}

function PartnerForm() {
  const { errors, loading, done, submit } = useSubmit("/api/partners");
  if (done) return <Success text="Thanks — we'll be in touch about referral pathways and working together." />;
  return (
    <form
      className="card space-y-4 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        submit(Object.fromEntries(fd.entries()));
      }}
    >
      <h3 className="text-lg font-bold text-slate-900">Become a partner</h3>
      {errors.form && <p className="field-error">{errors.form}</p>}
      <Grid>
        <Field name="orgName" label="Organisation" error={errors.orgName} />
        <Field name="contactName" label="Contact name" error={errors.contactName} />
        <Field name="email" label="Email" type="email" error={errors.email} />
        <Field name="phone" label="UK phone" placeholder="0161 200 0000" error={errors.phone} />
      </Grid>
      <Field name="partnerType" label="Type of partnership" placeholder="Referral partner, donated stock, funding…" error={errors.partnerType} />
      <Field name="message" label="Message (optional)" />
      <button className="btn-primary" disabled={loading}>{loading ? "Sending…" : "Send enquiry"}</button>
    </form>
  );
}

function SponsorForm() {
  const { errors, loading, done, submit } = useSubmit("/api/sponsorships");
  const [type, setType] = useState("van");
  if (done) return <Success text="Thank you for supporting the response — our team will contact you about your sponsorship." />;
  return (
    <form
      className="card space-y-4 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const raw = Object.fromEntries(fd.entries()) as Record<string, string>;
        submit({
          ...raw,
          type,
          amountPounds: raw.amountPounds ? Number(raw.amountPounds) : undefined,
        });
      }}
    >
      <h3 className="text-lg font-bold text-slate-900">Sponsor a van, a family or supplies</h3>
      {errors.form && <p className="field-error">{errors.form}</p>}
      <div>
        <label className="label">What would you like to sponsor?</label>
        <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="van">A response van</option>
          <option value="family">A family emergency pack</option>
          <option value="foodpack">Emergency food packs</option>
          <option value="hygiene">Hygiene kits</option>
          <option value="team">A volunteer team</option>
        </select>
      </div>
      <Grid>
        <Field name="sponsorName" label="Your name" error={errors.sponsorName} />
        <Field name="email" label="Email" type="email" error={errors.email} />
        <Field name="company" label="Company (optional)" />
        <Field name="amountPounds" label="Amount £ (optional)" type="number" />
      </Grid>
      <Field name="message" label="Message (optional)" />
      <button className="btn-primary" disabled={loading}>{loading ? "Sending…" : "Register interest"}</button>
    </form>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  error,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input name={name} type={type} className="input" placeholder={placeholder} />
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
