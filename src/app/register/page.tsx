"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ verifyUrl?: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const form = new FormData(e.currentTarget);
    const deviceFingerprint =
      typeof navigator !== "undefined"
        ? btoa(`${navigator.userAgent}|${screen.width}x${screen.height}`).slice(0, 32)
        : undefined;
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: form.get("fullName"),
        email: form.get("email"),
        phone: form.get("phone"),
        password: form.get("password"),
        deviceFingerprint,
      }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErrors(json.fieldErrors ?? { form: json.error ?? "Could not register" });
      return;
    }
    setDone({ verifyUrl: json.verifyUrl });
  }

  if (done) {
    return (
      <div className="section max-w-md py-16">
        <div className="card p-6">
          <h1 className="text-xl font-bold text-slate-900">Check your email</h1>
          <p className="mt-2 text-sm text-slate-600">
            We&apos;ve sent a verification link to confirm your account. You must verify your email before requesting help.
          </p>
          {done.verifyUrl && (
            <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
              <p className="font-semibold">Developer / demo mode</p>
              <p className="mt-1 break-all">
                No email service is configured in this MVP. Use this link to verify:
              </p>
              <a href={done.verifyUrl} className="mt-2 inline-block font-semibold text-brand-700 underline">
                Verify my email now →
              </a>
            </div>
          )}
          <Link href="/dashboard" className="btn-primary mt-6 w-full">Go to my account</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section max-w-md py-12">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">
          You need a verified account to request help. It only takes a minute.
        </p>
        {errors.form && <p className="field-error mt-3">{errors.form}</p>}
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="fullName">Full name</label>
            <input id="fullName" name="fullName" className="input" autoComplete="name" />
            {errors.fullName && <p className="field-error">{errors.fullName}</p>}
          </div>
          <div>
            <label className="label" htmlFor="email">Email address</label>
            <input id="email" name="email" type="email" className="input" autoComplete="email" />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>
          <div>
            <label className="label" htmlFor="phone">UK mobile number</label>
            <input id="phone" name="phone" className="input" placeholder="07123 456789" autoComplete="tel" />
            {errors.phone && <p className="field-error">{errors.phone}</p>}
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="input" autoComplete="new-password" />
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account? <Link href="/login" className="font-semibold text-brand-700">Log in</Link>
        </p>
      </div>
    </div>
  );
}
