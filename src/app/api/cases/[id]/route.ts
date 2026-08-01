import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { handler, ok, fail } from "@/lib/api";

export const GET = handler(async (req: NextRequest, ctx: { params: { id: string } }) => {
  const user = await requireUser();
  const c = await prisma.case.findUnique({
    where: { id: ctx.params.id },
    include: { events: { orderBy: { createdAt: "asc" } } },
  });
  if (!c) return fail("Case not found", 404);
  if (c.userId !== user.id && user.role !== "admin") return fail("Not allowed", 403);
  return ok({
    id: c.id,
    caseNumber: c.caseNumber,
    status: c.status,
    riskBand: c.riskBand,
    etaMinutes: c.etaMinutes,
    events: c.events,
  });
});
