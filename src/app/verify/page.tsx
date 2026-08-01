import Link from "next/link";

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status;
  const success = status === "success";
  return (
    <div className="section max-w-md py-16">
      <div className="card p-6 text-center">
        {success ? (
          <>
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-green-100 text-2xl">✓</div>
            <h1 className="mt-4 text-xl font-bold text-slate-900">Email verified</h1>
            <p className="mt-2 text-sm text-slate-600">
              Thank you. Your account is verified and you can now request help.
            </p>
            <Link href="/request-help" className="btn-primary mt-6 w-full">Request help</Link>
            <Link href="/dashboard" className="btn-ghost mt-2 w-full">Go to my account</Link>
          </>
        ) : (
          <>
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-100 text-2xl">!</div>
            <h1 className="mt-4 text-xl font-bold text-slate-900">Link invalid or expired</h1>
            <p className="mt-2 text-sm text-slate-600">
              This verification link is no longer valid. Log in and request a new one.
            </p>
            <Link href="/login" className="btn-primary mt-6 w-full">Log in</Link>
          </>
        )}
      </div>
    </div>
  );
}
