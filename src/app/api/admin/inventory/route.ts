import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handler, ok, fail } from "@/lib/api";
import { audit } from "@/lib/audit";

const schema = z.object({
  sku: z.string().min(1),
  delta: z.number().int().refine((n) => n !== 0, "Change cannot be zero"),
  reason: z.string().min(2, "A reason is required"),
});

export const POST = handler(async (req: NextRequest) => {
  const admin = await requireAdmin();
  const data = schema.parse(await req.json());

  const item = await prisma.inventoryItem.findUnique({ where: { sku: data.sku } });
  if (!item) return fail("Item not found", 404);
  const newQty = item.quantity + data.delta;
  if (newQty < 0) return fail("Change would take stock below zero", 400);

  await prisma.inventoryItem.update({ where: { sku: data.sku }, data: { quantity: newQty } });
  await prisma.inventoryMovement.create({
    data: { itemId: item.id, delta: data.delta, reason: data.reason },
  });
  await audit(admin.email, "inventory_adjust", data.sku, `${data.delta > 0 ? "+" : ""}${data.delta}`);
  return ok({ ok: true, quantity: newQty });
});
