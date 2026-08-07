import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handler, ok, fail } from "@/lib/api";

// Public endpoint: the assisted person leaves feedback via a unique link.
const schema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional().default(""),
});

export const POST = handler(async (req: NextRequest, ctx: { params: { token: string } }) => {
  const report = await prisma.incidentReport.findUnique({ where: { feedbackToken: ctx.params.token } });
  if (!report) return fail("This feedback link is not valid", 404);
  if (report.feedbackSubmittedAt) return fail("Feedback has already been submitted for this incident", 409);

  const data = schema.parse(await req.json());

  await prisma.incidentReport.update({
    where: { id: report.id },
    data: {
      feedbackRating: data.rating,
      feedbackComment: data.comment,
      feedbackSubmittedAt: new Date(),
    },
  });

  return ok({ ok: true });
});
