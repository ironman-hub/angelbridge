import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const statusChip: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  Approved: "bg-green-100 text-green-800",
  Declined: "bg-slate-200 text-slate-700",
  Escalated: "bg-purple-100 text-purple-800",
  Closed: "bg-slate-200 text-slate-700",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const cases = await prisma.case.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="section max-w-3xl py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hello, {user.fullName.split(" ")[0]}</h1>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
        <Link href="/request-help" className="btn-accent">Request help</Link>
      </div>

      {!user.emailVerified && (
        <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          Your email isn&apos;t verified yet. Check your inbox (or the developer console link) to verify before requesting help.
        </div>
      )}

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Your requests</h2>
      {cases.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">You haven&apos;t made any requests yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {cases.map((c) => (
            <li key={c.id}>
              <Link href={`/cases/${c.id}`} className="card flex items-center justify-between p-4 hover:border-brand-300">
                <div>
                  <p className="font-semibold text-slate-900">{c.caseNumber} · {c.situationType}</p>
                  <p className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleString("en-GB")}</p>
                </div>
                <span className={`chip ${statusChip[c.status] ?? "bg-slate-100"}`}>{c.status}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
