import { prisma } from "@/lib/db";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr><th className="px-4 py-3">When</th><th className="px-4 py-3">Actor</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Detail</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {logs.map((l) => (
            <tr key={l.id}>
              <td className="px-4 py-3 text-slate-500">{timeAgo(l.createdAt)}</td>
              <td className="px-4 py-3 text-slate-700">{l.actorEmail}</td>
              <td className="px-4 py-3"><span className="chip bg-slate-100 text-slate-700">{l.action}</span></td>
              <td className="px-4 py-3 text-slate-500">{l.target} {l.detail}</td>
            </tr>
          ))}
          {logs.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No activity yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
