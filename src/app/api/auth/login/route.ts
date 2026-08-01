import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { handler, ok, fail } from "@/lib/api";
import { audit } from "@/lib/audit";

export const POST = handler(async (req: NextRequest) => {
  const data = loginSchema.parse(await req.json());
  const email = data.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
    return fail("Incorrect email or password", 401);
  }

  await createSession(user.id);
  await audit(email, "login", user.id);
  return ok({ ok: true, role: user.role, emailVerified: user.emailVerified });
});
