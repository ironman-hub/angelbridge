import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { handler, ok } from "@/lib/api";
import { postLedger } from "@/lib/ledger";
import { audit } from "@/lib/audit";

const schema = z.object({
  direction: z.enum(["credit", "debit"]),
  amountPounds: z.number().positive("Enter an amount greater than zero"),
  reason: z.string().min(2, "A reason is required for transparency"),
  description: z.string().optional().default(""),
});

export const POST = handler(async (req: NextRequest) => {
  const admin = await requireAdmin();
  const data = schema.parse(await req.json());
  await postLedger({
    direction: data.direction,
    amountPence: Math.round(data.amountPounds * 100),
    reason: data.reason,
    description: data.description,
    createdBy: admin.email,
  });
  await audit(admin.email, "ledger_entry", data.direction, `£${data.amountPounds} — ${data.reason}`);
  return ok({ ok: true });
});
