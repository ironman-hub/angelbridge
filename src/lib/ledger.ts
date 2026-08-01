import { prisma } from "./db";

/** Current balance in pence, derived from the latest ledger entry. */
export async function currentBalancePence(): Promise<number> {
  const last = await prisma.ledgerEntry.findFirst({
    orderBy: { createdAt: "desc" },
  });
  return last?.balanceAfterPence ?? 0;
}

/**
 * Post a transparent ledger movement. Every change to the money balance goes
 * through here so the public live feed always shows a reason and a running total.
 */
export async function postLedger(params: {
  direction: "credit" | "debit";
  amountPence: number;
  reason: string;
  description?: string;
  createdBy?: string;
}) {
  const prev = await currentBalancePence();
  const signed =
    params.direction === "credit" ? params.amountPence : -params.amountPence;
  const balanceAfterPence = prev + signed;
  return prisma.ledgerEntry.create({
    data: {
      direction: params.direction,
      amountPence: params.amountPence,
      reason: params.reason,
      description: params.description ?? "",
      balanceAfterPence,
      createdBy: params.createdBy ?? "system",
    },
  });
}
