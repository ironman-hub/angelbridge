"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Inline sign-in / create-account panel shown at the point a visitor asks for
 * help. On successful login it refreshes the page so the request form appears;
 * on registration it shows the (dev) email-verification link.
 */
export function AuthPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const form = new FormData(e.currentTarget);

    if (mode === "login") {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const json = await res.json();
      setLoading(false);
      if (!res.ok) return setErrors({ form: json.error ?? "Could not log in" });
      router.refresh(); // request form now renders in place
      return;
    }

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
    if (!res.ok) return setErrors(json.fieldErrors ?? { form: json.error ?? "Could not register" });
    setVerifyUrl(json.verifyUrl ?? "");
  }

  if (verifyUrl !== null) {
    return (
      <div className="card p-6 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-100 text-2xl">✉️</div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Verify your email to continue</h2>
        <p className="mt-2 text-sm text-slate-600">
          For everyone&apos;s safety we verify your email before a request is submitted.
        </p>
        {verifyUrl && (
          <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
            <p className="font-semibold">Demo / developer mode</p>
            <p className="mt-1">No email service is configured yet — use this link to verify:</p>
            <a href={verifyUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block font-semibold text-brand-700 underline break-all">
              Verify my email now →
            </a>
          </div>
        )}
        <button onClick={() => router.refresh()} className="btn-primary mt-6 w-full">
          I&apos;ve verified — continue
        </button>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="mb-5 flex gap-2 rounded-xl bg-slate-100 p-1">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setErrors({}); }}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${mode === m ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"}`}
          >
            {m === "login" ? "Log in" : "Create account"}
          </button>
        ))}
      </div>

      <p className="mb-4 text-sm text-slate-600">
        {mode === "login"
          ? "Log in to submit your request — it keeps your information private and lets us keep you updated."
          : "It takes under a minute. You'll need a verified account so we can confirm your identity and keep you updated."}
      </p>

      {errors.form && <p className="field-error mb-3">{errors.form}</p>}

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "register" && (
          <>
            <div>
              <label className="label" htmlFor="fullName">Full name</label>
              <input id="fullName" name="fullName" className="input" autoComplete="name" />
              {errors.fullName && <p className="field-error">{errors.fullName}</p>}
            </div>
            <div>
              <label className="label" htmlFor="phone">UK mobile number</label>
              <input id="phone" name="phone" className="input" placeholder="07123 456789" autoComplete="tel" />
              {errors.phone && <p className="field-error">{errors.phone}</p>}
            </div>
          </>
        )}
        <div>
          <label className="label" htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" className="input" autoComplete="email" />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" className="input" autoComplete={mode === "login" ? "current-password" : "new-password"} />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Please wait…" : mode === "login" ? "Log in & continue" : "Create account & continue"}
        </button>
      </form>
    </div>
  );
}
