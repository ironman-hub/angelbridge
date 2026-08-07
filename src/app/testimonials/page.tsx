import { prisma } from "@/lib/db";
import { TestimonialForm } from "@/components/TestimonialForm";

export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="section max-w-4xl py-10">
      <h1 className="text-3xl font-bold text-slate-900">Stories from people we&apos;ve helped</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Real experiences from people Angel Bridge Foundation supported. If we helped you, we&apos;d love you to share yours.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {testimonials.length === 0 && (
          <p className="text-sm text-slate-500">No stories published yet, yours could be the first.</p>
        )}
        {testimonials.map((t) => (
          <figure key={t.id} className="card p-6">
            <div className="text-accent-500">{"★".repeat(t.rating)}<span className="text-slate-200">{"★".repeat(5 - t.rating)}</span></div>
            <blockquote className="mt-3 text-slate-700">“{t.story}”</blockquote>
            <figcaption className="mt-4 text-sm font-semibold text-slate-900">
              {t.authorName} <span className="font-normal text-slate-500">· {t.location}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-12">
        <TestimonialForm />
      </div>
    </div>
  );
}
