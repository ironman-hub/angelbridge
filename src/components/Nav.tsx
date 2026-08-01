"use client";

import Link from "next/link";
import { useState } from "react";
import type { SessionUser } from "@/lib/auth";
import { Logo } from "./Logo";

const links = [
  { href: "/our-story", label: "Our Story" },
  { href: "/request-help", label: "Request Help" },
  { href: "/donate", label: "Donate" },
  { href: "/get-involved", label: "Get Involved" },
  { href: "/impact", label: "Impact" },
  { href: "/testimonials", label: "Stories" },
];

export function Nav({ user }: { user: SessionUser | null }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="section flex h-16 items-center justify-between">
        <Link href="/" className="flex items-stretch gap-2.5">
          <Logo size={40} className="shrink-0" />
          <span className="flex h-10 flex-col justify-center leading-none">
            <span className="text-lg font-extrabold text-brand-700">Angel Bridge</span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Foundation</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              {user.role === "admin" && (
                <Link href="/admin" className="btn-ghost">Admin</Link>
              )}
              <Link href="/dashboard" className="btn-ghost">My account</Link>
              <form action="/api/auth/logout" method="post">
                <button className="btn-ghost" type="submit">Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">Log in</Link>
              <Link href="/request-help" className="btn-green">Get help now</Link>
            </>
          )}
        </div>

        <button
          className="btn-ghost lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="section flex flex-col gap-1 py-3">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
              {user ? (
                <>
                  {user.role === "admin" && <Link href="/admin" className="btn-ghost" onClick={() => setOpen(false)}>Admin</Link>}
                  <Link href="/dashboard" className="btn-ghost" onClick={() => setOpen(false)}>My account</Link>
                  <form action="/api/auth/logout" method="post"><button className="btn-ghost w-full" type="submit">Log out</button></form>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-ghost" onClick={() => setOpen(false)}>Log in</Link>
                  <Link href="/request-help" className="btn-green" onClick={() => setOpen(false)}>Get help now</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
