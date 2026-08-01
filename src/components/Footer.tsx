import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="section grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-stretch gap-2.5">
            <Logo size={38} className="shrink-0" />
            <span className="flex h-[38px] flex-col justify-center leading-none">
              <span className="text-base font-extrabold text-brand-700">Angel Bridge</span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-900">Foundation</span>
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Bridging the gap between a crisis and the help that&apos;s coming. Piloting in Manchester.
          </p>
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
            Angel Bridge does not replace emergency services — always call 999 in an emergency.
          </p>
        </div>
      </div>
      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Angel Bridge Foundation (pilot). A proposed non-profit community response platform.
      </div>
    </footer>
  );
}
