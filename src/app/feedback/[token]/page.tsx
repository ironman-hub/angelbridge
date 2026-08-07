import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { FeedbackForm } from "@/components/FeedbackForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your feedback — Angel Bridge Foundation",
};

export default async function FeedbackPage({ params }: { params: { token: string } }) {
  const report = await prisma.incidentReport.findUnique({
    where: { feedbackToken: params.token },
    include: { case: { include: { user: true } } },
  });
  if (!report) notFound();

  const alreadyDone = !!report.feedbackSubmittedAt;

  return (
    <div className="section max-w-xl py-12">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Angel Bridge Foundation</p>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900">Share your feedback</h1>
        <p className="mt-2 text-sm text-slate-500">
          Incident No. {report.case.caseNumber}. Thank you for letting us know how we did.
        </p>
      </div>

      <div className="card mt-8 p-6">
        {alreadyDone ? (
          <div className="rounded-2xl bg-green-50 p-6 text-center">
            <div className="text-4xl">💚</div>
            <h2 className="mt-2 text-lg font-bold text-slate-900">Feedback already received</h2>
            <p className="mt-1 text-sm text-slate-600">Thank you, we’ve recorded your response for this incident.</p>
          </div>
        ) : (
          <FeedbackForm token={params.token} />
        )}
      </div>
    </div>
  );
}
