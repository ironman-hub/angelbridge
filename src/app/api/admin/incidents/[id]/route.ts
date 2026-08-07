import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handler, ok, fail } from "@/lib/api";
import { audit } from "@/lib/audit";
import { randomToken } from "@/lib/auth";

// `id` here is the CASE id. There is one incident report per case.
const schema = z.object({
  completedByName: z.string().optional().default(""),
  completedByEmail: z.string().optional().default(""),
  arrivedAt: z.string().optional().nullable(),
  completedAt: z.string().optional().nullable(),
  summary: z.string().optional().default(""),
  helpProvided: z.array(z.string()).optional().default([]),
  suppliesGiven: z.string().optional().default(""),
  outcome: z.string().optional().default(""),
  memberNotes: z.string().optional().default(""),
  emergencyServicesCalled: z.boolean().optional().default(false),
  emergencyServicesDetail: z.string().optional().default(""),
  status: z.enum(["draft", "completed"]).optional().default("draft"),
});

function toDate(v?: string | null): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export const POST = handler(async (req: NextRequest, ctx: { params: { id: string } }) => {
  const admin = await requireAdmin();
  const caseId = ctx.params.id;

  const theCase = await prisma.case.findUnique({ where: { id: caseId } });
  if (!theCase) return fail("Case not found", 404);

  const data = schema.parse(await req.json());

  const common = {
    completedByName: data.completedByName,
    completedByEmail: data.completedByEmail || admin.email,
    arrivedAt: toDate(data.arrivedAt),
    completedAt: data.status === "completed" ? toDate(data.completedAt) ?? new Date() : toDate(data.completedAt),
    summary: data.summary,
    helpProvided: JSON.stringify(data.helpProvided),
    suppliesGiven: data.suppliesGiven,
    outcome: data.outcome,
    memberNotes: data.memberNotes,
    emergencyServicesCalled: data.emergencyServicesCalled,
    emergencyServicesDetail: data.emergencyServicesDetail,
    status: data.status,
  };

  const report = await prisma.incidentReport.upsert({
    where: { caseId },
    create: { caseId, feedbackToken: randomToken(16), ...common },
    update: common,
  });

  await audit(admin.email, "incident_report_saved", caseId, data.status);

  return ok({ ok: true, id: report.id, feedbackToken: report.feedbackToken, status: report.status });
});
