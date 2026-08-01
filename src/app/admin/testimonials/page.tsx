import { prisma } from "@/lib/db";
import { TestimonialModeration } from "@/components/admin/TestimonialModeration";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: [{ approved: "asc" }, { createdAt: "desc" }] });

  return (
    <div className="space-y-4">
      {testimonials.map((t) => (
        <div key={t.id} className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">{t.authorName}</span>
                <span className="text-sm text-slate-500">· {t.location}</span>
                <span className={`chip ${t.approved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>{t.approved ? "Published" : "Pending"}</span>
              </div>
              <p className="mt-2 max-w-2xl text-sm text-slate-700">“{t.story}”</p>
            </div>
            <TestimonialModeration id={t.id} approved={t.approved} />
          </div>
        </div>
      ))}
      {testimonials.length === 0 && <p className="text-sm text-slate-500">No stories submitted yet.</p>}
    </div>
  );
}
