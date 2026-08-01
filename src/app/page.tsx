import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { RequestHelpForm } from "@/components/RequestHelpForm";
import { AuthPanel } from "@/components/AuthPanel";

export const dynamic = "force-dynamic";

export default async function RequestHelpPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="section max-w-md py-12">
        <h1 className="text-2xl font-bold text-slate-900">Request help</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500">
          First, sign in or create an account. Your information stays private and confidential.
        </p>
        <AuthPanel />
      </div>
    );
  }

  if (!user.emailVerified) {
    return (
      <Gate
        title="Verify your email to continue"
        body="For everyone's safety we ask you to verify your email address before submitting a request."
      >
        <Link href="/dashboard" className="btn-primary w-full">Go to my account</Link>
      </Gate>
    );
  }

  return (
    <div className="section max-w-2xl py-8">
      <h1 className="text-2xl font-bold text-slate-900">Request help</h1>
      <p className="mt-1 text-sm text-slate-500">
        This takes 2–3 minutes. Answer honestly — it helps us reach the people who need us most.
      </p>
      <div className="mt-6">
        <RequestHelpForm />
      </div>
    </div>
  );
}

function Gate({ title, body, children }: { title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="section max-w-md py-16">
      <div className="card p-6 text-center">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{body}</p>
        <div className="mt-6 space-y-2">{children}</div>
      </div>
    </div>
  );
}
