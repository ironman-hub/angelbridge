import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { handler, ok } from "@/lib/api";
import { audit } from "@/lib/audit";

const schema = z.object({
  donorName: z.string().min(2, "Please enter your name"),
  donorEmail: z.string().email("Enter a valid email"),
  amountPounds: z.number().positive("Enter an amount greater than zero"),
  tier: z.string().optional(),
  message: z.string().optional(),
});

export const POST = handler(async (req: NextRequest) => {
  const user = await getCurrentUser();
  const data = schema.parse(await req.json());
  const amountPence = Math.round(data.amountPounds * 100);

  // NOTE: Payment is stubbed for the MVP. In production, integrate Stripe/GoCardless
  // here and only record the donation once payment succeeds (webhook).
  const donation = await prisma.donation.create({
    data: {
      donorName: data.donorName.trim(),
      donorEmail: data.donorEmail.trim(),
      amountPence,
      tier: data.tier,
      message: data.message,
      userId: user?.id ?? null,
      status: "recorded",
    },
  });

  await audit(data.donorEmail, "donation_recorded", donation.id, `£${data.amountPounds}`);
  return ok({ ok: true });
});
