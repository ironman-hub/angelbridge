import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/cases", label: "Cases" },
  { href: "/admin/incidents", label: "Incidents" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/testimonials", label: "Stories" },
  { href: "/admin/logs", label: "Audit log" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  return (
    <div className="section max-w-6xl py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
        <span className="chip bg-brand-100 text-brand-800">{user.email}</span>
      </div>
      <nav className="mt-4 flex flex-wrap gap-1 border-b border-slate-200 pb-2">
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
