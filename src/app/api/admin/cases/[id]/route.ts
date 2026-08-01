import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handler, ok, fail } from "@/lib/api";
import { audit } from "@/lib/audit";
import { CASE_STATUSES } from "@/lib/constants";

const schema = z.object({
  status: z.enum(CASE_STATUSES).optional(),
  caseNotes: z.string().optional(),
  assignedVolunteerId: z.string().nullable().optional(),
  etaMinutes: z.number().nullable().optional(),
  outcome: z.string().optional(),
});

export const PATCH = handler(async (req: NextRequest, ctx: { params: { id: string } }) => {
  const admin = await requireAdmin();
  const data = schema.parse(await req.json());

  const existing = await prisma.case.findUnique({ where: { id: ctx.params.id } });
  if (!existing) return fail("Case not found", 404);

  const updated = await prisma.case.update({
    where: { id: ctx.params.id },
    data: {
      ...(data.status ? { status: data.status } : {}),
      ...(data.caseNotes !== undefined ? { caseNotes: data.caseNotes } : {}),
      ...(data.assignedVolunteerId !== undefined ? { assignedVolunteerId: data.assignedVolunteerId } : {}),
      ...(data.etaMinutes !== undefined ? { etaMinutes: data.etaMinutes } : {}),
      ...(data.outcome !== undefined ? { outcome: data.outcome } : {}),
    },
  });

  // Reflect status changes in the applicant-facing timeline.
  if (data.status && data.status !== existing.status) {
    const messages: Record<string, string> = {
      Approved: "Approved by our team, help is being arranged",
      Declined: "After review, we're unable to dispatch to this request",
      Escalated: "Escalated to a caseworker for review",
      Closed: "Case closed, thank you",
      Pending: "Returned to pending review",
    };
    await prisma.caseEvent.create({
      data: { caseId: updated.id, type: "note", message: messages[data.status] ?? `Status: ${data.status}` },
    });
  }
  if (data.caseNotes && data.caseNotes !== existing.caseNotes) {
    await audit(admin.email, "case_note", updated.id);
  }

  await audit(admin.email, "case_updated", updated.id, data.status ?? "");
  return ok({ ok: true, status: updated.status });
});
