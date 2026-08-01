import { prisma } from "@/lib/db";
import { currentBalancePence } from "@/lib/ledger";
import { gbp, timeAgo } from "@/lib/format";
import { LedgerForm } from "@/components/admin/LedgerForm";

export const dynamic = "force-dynamic";

export default async function AdminLedgerPage() {
  const [balance, entries] = await Promise.all([
    currentBalancePence(),
    prisma.ledgerEntry.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="rounded-2xl bg-brand-700 p-5 text-white">
          <p className="text-sm text-brand-100">Current balance</p>
          <p className="text-3xl font-extrabold">{gbp(balance)}</p>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3">When</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3">By</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3 text-right">Balance</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 text-slate-500">{timeAgo(e.createdAt)}</td>
                  <td className="px-4 py-3"><p className="font-medium text-slate-800">{e.reason}</p><p className="text-xs text-slate-500">{e.description}</p></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{e.createdBy}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${e.direction === "credit" ? "text-green-600" : "text-red-600"}`}>{e.direction === "credit" ? "+" : "−"}{gbp(e.amountPence)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{gbp(e.balanceAfterPence)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <LedgerForm />
    </div>
  );
}
