import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handler, ok } from "@/lib/api";
import { audit } from "@/lib/audit";

const schema = z.object({ approved: z.boolean() });

export const PATCH = handler(async (req: NextRequest, ctx: { params: { id: string } }) => {
  const admin = await requireAdmin();
  const { approved } = schema.parse(await req.json());
  await prisma.testimonial.update({ where: { id: ctx.params.id }, data: { approved } });
  await audit(admin.email, approved ? "testimonial_approved" : "testimonial_hidden", ctx.params.id);
  return ok({ ok: true });
});

export const DELETE = handler(async (_req: NextRequest, ctx: { params: { id: string } }) => {
  const admin = await requireAdmin();
  await prisma.testimonial.delete({ where: { id: ctx.params.id } });
  await audit(admin.email, "testimonial_deleted", ctx.params.id);
  return ok({ ok: true });
});
