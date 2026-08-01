import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handler, ok } from "@/lib/api";
import { audit } from "@/lib/audit";

const schema = z.object({
  type: z.enum(["van", "family", "foodpack", "hygiene", "team"]),
  sponsorName: z.string().min(2, "Please enter a name"),
  email: z.string().email("Enter a valid email"),
  company: z.string().optional(),
  amountPounds: z.number().optional(),
  message: z.string().optional().default(""),
});

export const POST = handler(async (req: NextRequest) => {
  const data = schema.parse(await req.json());
  await prisma.sponsorship.create({
    data: {
      type: data.type,
      sponsorName: data.sponsorName.trim(),
      email: data.email.trim(),
      company: data.company,
      amountPence: data.amountPounds ? Math.round(data.amountPounds * 100) : null,
      message: data.message,
    },
  });
  await audit(data.email, "sponsorship_enquiry", data.type);
  return ok({ ok: true });
});
