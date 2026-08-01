import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { handler, ok } from "@/lib/api";
import { ukPhone, ukPostcode } from "@/lib/validation";
import { audit } from "@/lib/audit";

const schema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: ukPhone,
  postcode: ukPostcode,
  availability: z.string().min(2, "When are you available?"),
  skills: z.string().optional().default(""),
});

export const POST = handler(async (req: NextRequest) => {
  const data = schema.parse(await req.json());
  await prisma.volunteer.create({ data });
  await audit(data.email, "volunteer_applied");
  return ok({ ok: true });
});
