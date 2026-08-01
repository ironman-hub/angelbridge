"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? "Could not log in");
      return;
    }
    router.push(json.role === "admin" ? "/admin" : "/dashboard");
    router.refresh();
  }

  return (
    <div className="section max-w-md py-12">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-slate-900">Log in</h1>
        <p className="mt-1 text-sm text-slate-500">Welcome back to Angel Bridge.</p>
        {error && <p className="field-error mt-3">{error}</p>}
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">Email address</label>
            <input id="email" name="email" type="email" className="input" autoComplete="email" />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="input" autoComplete="current-password" />
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          New here? <Link href="/register" className="font-semibold text-brand-700">Create an account</Link>
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">
          Demo: admin@angelbridge.org / password123
        </p>
      </div>
    </div>
  );
}
