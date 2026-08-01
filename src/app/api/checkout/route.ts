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

/**
 * Creates a Stripe Checkout Session for a donation. Stripe-hosted Checkout
 * supports cards, Apple Pay and Google Pay automatically (no extra setup).
 *
 * If STRIPE_SECRET_KEY is not configured yet, we fall back to simply recording
 * the donation, so the donate flow still works before Stripe is connected.
 */
export const POST = handler(async (req: NextRequest) => {
  const data = schema.parse(await req.json());
  const amountPence = Math.round(data.amountPounds * 100);
  const user = await getCurrentUser();
  const key = process.env.STRIPE_SECRET_KEY;
  const appUrl = process.env.APP_URL || new URL(req.url).origin;

  if (!key) {
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
    return ok({ ok: true, mode: "recorded" });
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(key);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: data.donorEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "gbp",
          unit_amount: amountPence,
          product_data: {
            name: `Donation to Angel Bridge Foundation${data.tier ? ` — ${data.tier}` : ""}`,
          },
        },
      },
    ],
    metadata: {
      donorName: data.donorName,
      tier: data.tier ?? "",
      message: data.message ?? "",
      userId: user?.id ?? "",
    },
    success_url: `${appUrl}/donate?status=success`,
    cancel_url: `${appUrl}/donate?status=cancelled`,
  });

  await audit(data.donorEmail, "checkout_created", session.id, `£${data.amountPounds}`);
  return ok({ ok: true, mode: "stripe", url: session.url });
});
