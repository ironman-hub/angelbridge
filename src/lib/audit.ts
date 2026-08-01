import { prisma } from "./db";

export async function audit(
  actorEmail: string,
  action: string,
  target = "",
  detail = ""
) {
  try {
    await prisma.auditLog.create({
      data: { actorEmail, action, target, detail },
    });
  } catch {
    // Auditing must never break the primary operation.
  }
}
