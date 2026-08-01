import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CaseTracker } from "@/components/CaseTracker";

export const dynamic = "force-dynamic";

export default async function CasePage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const c = await prisma.case.findUnique({
    where: { id: params.id },
    include: { events: { orderBy: { createdAt: "asc" } } },
  });
  if (!c) notFound();
  if (c.userId !== user.id && user.role !== "admin") redirect("/dashboard");

  return (
    <div className="section max-w-2xl py-8">
      <CaseTracker
        initial={{
          id: c.id,
          caseNumber: c.caseNumber,
          status: c.status,
          riskBand: c.riskBand,
          etaMinutes: c.etaMinutes,
          events: c.events.map((e) => ({
            id: e.id,
            type: e.type,
            message: e.message,
            createdAt: e.createdAt.toISOString(),
          })),
        }}
      />
    </div>
  );
}
