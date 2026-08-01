import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TransparencyPage() {
  const inventory = await prisma.inventoryItem.findMany({ orderBy: { zone: "asc" } });
  const zones = Array.from(new Set(inventory.map((i) => i.zone)));

  return (
    <div className="section max-w-5xl py-10">
      <h1 className="text-3xl font-bold text-slate-900">Transparency</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        We believe supporters deserve to see what&apos;s in the van. Stock levels update as supplies are used
        and restocked, so you can see exactly what your support provides.
      </p>

      {/* Inventory */}
      <h2 className="mt-8 text-lg font-semibold text-slate-900">Inventory (our stock)</h2>
      <div className="mt-3 space-y-6">
        {zones.map((zone) => (
          <div key={zone}>
            <h3 className="text-sm font-semibold text-slate-500">{zone}</h3>
            <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {inventory.filter((i) => i.zone === zone).map((i) => {
                const low = i.quantity <= i.reorderLevel;
                return (
                  <div key={i.id} className="card flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-slate-800">{i.name}</p>
                      <p className="text-xs text-slate-500">{i.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${low ? "text-red-600" : "text-slate-800"}`}>{i.quantity}</p>
                      {low && <p className="text-[11px] font-semibold text-red-600">Low stock</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
