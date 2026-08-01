import Link from "next/link";

export default function NotFound() {
  return (
    <div className="section max-w-md py-24 text-center">
      <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-600">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
