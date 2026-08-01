import Link from "next/link";
import { prisma } from "@/lib/db";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

const bandChip: Record<string, string> = {
  Green: "bg-green-100 text-green-800",
  Amber: "bg-amber-100 text-amber-800",
  Red: "bg-red-100 text-red-800",
};
const statusChip: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-800",
  Approved: "bg-green-100 text-green-800",
  Declined: "bg-slate-200 text-slate-700",
  Escalated: "bg-purple-100 text-purple-800",
  Closed: "bg-slate-200 text-slate-700",
};

export default async function AdminCasesPage({ searchParams }: { searchParams: { status?: string } }) {
  const status = searchParams.status;
  const cases = await prisma.case.findMany({
    where: status ? { status } : {},
    orderBy: [{ status: "asc" }, { priorityScore: "desc" }],
    include: { user: true },
    take: 100,
  });

  const filters = ["All", "Pending", "Escalated", "Approved", "Declined", "Closed"];

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = (f === "All" && !status) || status === f;
          return (
            <Link
              key={f}
              href={f === "All" ? "/admin/cases" : `/admin/cases?status=${f}`}
              className={`chip ${active ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"}`}
            >
              {f}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Case</th>
              <th className="px-4 py-3">Situation</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Vuln.</th>
              <th className="px-4 py-3">Fraud</th>
              <th className="px-4 py-3">Band</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cases.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/cases/${c.id}`} className="font-semibold text-brand-700">{c.caseNumber}</Link>
                  <p className="text-xs text-slate-500">{c.user.fullName}</p>
                </td>
                <td className="px-4 py-3 text-slate-700">{c.situationType}</td>
                <td className="px-4 py-3 font-bold text-slate-900">{c.priorityScore}</td>
                <td className="px-4 py-3 text-slate-600">{c.vulnerabilityScore}</td>
                <td className="px-4 py-3 text-slate-600">{c.fraudRiskScore}</td>
                <td className="px-4 py-3"><span className={`chip ${bandChip[c.riskBand]}`}>{c.riskBand}</span></td>
                <td className="px-4 py-3"><span className={`chip ${statusChip[c.status]}`}>{c.status}</span></td>
                <td className="px-4 py-3 text-slate-500">{timeAgo(c.createdAt)}</td>
              </tr>
            ))}
            {cases.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-500">No cases found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
