"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// Set this once your film is ready. Accepts:
//   • an MP4 placed in /public, e.g. "/story.mp4"
//   • a YouTube link,  e.g. "https://youtu.be/XXXXXXXXXXX"
//   • a Vimeo link,    e.g. "https://vimeo.com/123456789"
// Leave it as "" to show a friendly "coming soon" placeholder.
// ---------------------------------------------------------------------------
const STORY_VIDEO_URL = "";

function tabClass(active: boolean) {
  return `flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${
    active ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
  }`;
}

function VideoBlock() {
  if (!STORY_VIDEO_URL) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-100 text-2xl">🎬</div>
        <h3 className="mt-4 text-lg font-bold text-slate-900">Our story film is coming soon</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          We&apos;re producing a short film of this story. In the meantime, tap <strong>Read</strong> to read it.
        </p>
      </div>
    );
  }

  const yt = STORY_VIDEO_URL.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/);
  const vimeo = STORY_VIDEO_URL.match(/vimeo\.com\/(\d+)/);

  if (yt || vimeo) {
    const src = yt
      ? `https://www.youtube.com/embed/${yt[1]}`
      : `https://player.vimeo.com/video/${vimeo ? vimeo[1] : ""}`;
    return (
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-black shadow-lg">
        <div className="aspect-video">
          <iframe
            src={src}
            title="Our story"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-black shadow-lg">
      <video controls playsInline poster="/hero.jpg" className="w-full">
        <source src={STORY_VIDEO_URL} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

export function StoryTabs({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<"watch" | "read">(STORY_VIDEO_URL ? "watch" : "read");
  return (
    <div className="mt-8">
      <div className="mx-auto flex max-w-xs rounded-xl bg-slate-100 p-1">
        <button type="button" onClick={() => setTab("watch")} className={tabClass(tab === "watch")}>
          ▶ Watch
        </button>
        <button type="button" onClick={() => setTab("read")} className={tabClass(tab === "read")}>
          Read
        </button>
      </div>
      <div className="mt-8">{tab === "watch" ? <VideoBlock /> : children}</div>
    </div>
  );
}
