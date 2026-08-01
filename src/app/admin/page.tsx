import { prisma } from "@/lib/db";
import { InventoryControls } from "@/components/admin/InventoryControls";

export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const items = await prisma.inventoryItem.findMany({ orderBy: [{ zone: "asc" }, { name: "asc" }] });
  const zones = Array.from(new Set(items.map((i) => i.zone)));

  return (
    <div className="space-y-8">
      {zones.map((zone) => (
        <div key={zone}>
          <h2 className="text-sm font-semibold uppercase text-slate-500">{zone}</h2>
          <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {items.filter((i) => i.zone === zone).map((i) => {
                  const low = i.quantity <= i.reorderLevel;
                  return (
                    <tr key={i.id} className={low ? "bg-amber-50" : ""}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{i.name}</p>
                        <p className="text-xs text-slate-500">{i.sku} · reorder at {i.reorderLevel} {low && <span className="font-semibold text-red-600">· LOW</span>}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end"><InventoryControls sku={i.sku} quantity={i.quantity} /></div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
