import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSession, randomToken } from "@/lib/auth";
import { registerSchema, normalisePhone } from "@/lib/validation";
import { handler, ok, fail } from "@/lib/api";
import { audit } from "@/lib/audit";

export const POST = handler(async (req: NextRequest) => {
  const body = await req.json();
  const data = registerSchema.parse(body);

  const email = data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return fail("An account with that email already exists", 409);

  const verifyToken = randomToken(16);
  const user = await prisma.user.create({
    data: {
      email,
      fullName: data.fullName.trim(),
      phone: normalisePhone(data.phone),
      passwordHash: await hashPassword(data.password),
      verifyToken,
      deviceFingerprint: typeof body.deviceFingerprint === "string" ? body.deviceFingerprint : null,
    },
  });

  await createSession(user.id);
  await audit(email, "register", user.id);

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const verifyUrl = `${appUrl}/api/auth/verify?token=${verifyToken}`;
  // No SMTP in the MVP — the link is logged and returned so dev can verify.
  console.log(`\n[email] Verify ${email}: ${verifyUrl}\n`);

  return ok({ ok: true, emailVerified: false, verifyUrl });
});
