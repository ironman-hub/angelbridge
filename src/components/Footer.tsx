import Link from "next/link";
import { Logo } from "./Logo";

// Update these with your real profile links when ready.
const SOCIALS = [
  { name: "X", href: "https://x.com/", icon: XIcon },
  { name: "Facebook", href: "https://facebook.com/", icon: FacebookIcon },
  { name: "Instagram", href: "https://instagram.com/", icon: InstagramIcon },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="section grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-stretch gap-2.5">
            <Logo size={38} className="shrink-0" />
            <span className="flex h-[38px] flex-col justify-center leading-none">
              <span className="text-base font-extrabold text-brand-700">Angel Bridge</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-900">Foundation</span>
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Bridging the gap between a crisis and the help that&apos;s coming. Piloting in Manchester.
          </p>

          {/* Social */}
          <div className="mt-8 flex items-center gap-3">
            {SOCIALS.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.name}
                  className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-600 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-slate-900">Get help</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link href="/request-help" className="hover:text-brand-700">Request help</Link></li>
            <li><Link href="/how-it-works" className="hover:text-brand-700">How it works</Link></li>
            <li><Link href="/our-story" className="hover:text-brand-700">Our story</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Support us</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link href="/donate" className="hover:text-brand-700">Donate</Link></li>
            <li><Link href="/get-involved" className="hover:text-brand-700">Volunteer</Link></li>
            <li><Link href="/get-involved" className="hover:text-brand-700">Sponsor a van</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Trust &amp; safety</h4>
          <p className="mt-3 text-sm text-slate-500">
            Your information is private and confidential and processed in line with UK data protection law.
            Angel Bridge Foundation does not replace emergency services, always call 999 in an emergency.
          </p>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Angel Bridge Foundation (pilot). A proposed non-profit community response platform.
      </div>
    </footer>
  );
}

function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}
