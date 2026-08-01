import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { handler, ok } from "@/lib/api";
import { audit } from "@/lib/audit";

const schema = z.object({
  authorName: z.string().min(2, "Please add your name or initials"),
  location: z.string().min(2, "Where were you helped?"),
  story: z.string().min(20, "Please share a little more (at least 20 characters)"),
  rating: z.number().min(1).max(5).default(5),
});

export const POST = handler(async (req: NextRequest) => {
  const user = await getCurrentUser();
  const data = schema.parse(await req.json());
  await prisma.testimonial.create({
    data: {
      authorName: data.authorName.trim(),
      location: data.location.trim(),
      story: data.story.trim(),
      rating: data.rating,
      approved: false, // published after a quick moderation check
      userId: user?.id ?? null,
    },
  });
  await audit(user?.email ?? "guest", "testimonial_submitted");
  return ok({ ok: true });
});
