import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handler, ok } from "@/lib/api";
import { ukPhone } from "@/lib/validation";
import { audit } from "@/lib/audit";

const schema = z.object({
  orgName: z.string().min(2, "Organisation name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  email: z.string().email("Enter a valid email"),
  phone: ukPhone,
  partnerType: z.string().min(2, "Please describe the partnership"),
  message: z.string().optional().default(""),
});

export const POST = handler(async (req: NextRequest) => {
  const data = schema.parse(await req.json());
  await prisma.partner.create({ data });
  await audit(data.email, "partner_enquiry", data.orgName);
  return ok({ ok: true });
});
