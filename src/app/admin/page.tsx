import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const [pending, escalated, lowStock, pendingStories, volunteers, partners, sponsorships] =
    await Promise.all([
      prisma.case.count({ where: { status: "Pending" } }),
      prisma.case.count({ where: { status: "Escalated" } }),
      prisma.inventoryItem.findMany(),
      prisma.testimonial.count({ where: { approved: false } }),
      prisma.volunteer.count(),
      prisma.partner.count(),
      prisma.sponsorship.count(),
    ]);

  const low = lowStock.filter((i) => i.quantity <= i.reorderLevel);

  const cards: Array<{ label: string; value: string | number; href?: string; alert?: boolean }> = [
    { label: "Cases awaiting review", value: pending, href: "/admin/cases", alert: pending > 0 },
    { label: "Escalated cases", value: escalated, href: "/admin/cases", alert: escalated > 0 },
    { label: "Low-stock items", value: low.length, href: "/admin/inventory", alert: low.length > 0 },
    { label: "Stories to moderate", value: pendingStories, href: "/admin/testimonials", alert: pendingStories > 0 },
    { label: "Volunteers", value: volunteers },
    { label: "Partners", value: partners },
    { label: "Sponsorship enquiries", value: sponsorships },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const inner = (
            <div className={`card p-5 ${c.alert ? "ring-2 ring-accent-500/40" : ""}`}>
              <p className="text-3xl font-extrabold text-slate-900">{c.value}</p>
              <p className="mt-1 text-sm text-slate-600">{c.label}</p>
            </div>
          );
          return c.href ? (
            <Link key={c.label} href={c.href}>{inner}</Link>
          ) : (
            <div key={c.label}>{inner}</div>
          );
        })}
      </div>

      {low.length > 0 && (
        <div className="mt-8 rounded-2xl bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-900">Restock needed</h2>
          <ul className="mt-2 grid gap-1 text-sm text-amber-800 sm:grid-cols-2">
            {low.map((i) => (
              <li key={i.id}>{i.name} — {i.quantity} left (reorder at {i.reorderLevel})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
