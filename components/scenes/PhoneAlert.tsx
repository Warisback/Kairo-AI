"use client";

// Scene 4a — Margaret's phone lock screen. A calm notification arrives. Tapping
// it opens the plain-English explanation. Notification copy is derived from the
// engine's patient_explanation, never hardcoded here.

import { KairoMark } from "@/components/ui";

export function PhoneAlert({
  preview,
  onOpen,
  title = "A quick update about your medicines",
}: {
  preview: string;
  onOpen: () => void;
  title?: string;
}) {
  return (
    <div className="flex h-full flex-col px-6 pb-10 pt-24 text-white">
      {/* Big lock-screen clock */}
      <div className="mt-6 text-center">
        <div className="text-[17px] font-medium text-white/80">
          Tuesday, 18 July
        </div>
        <div className="text-[76px] font-semibold leading-none tracking-tight drop-shadow">
          9:41
        </div>
      </div>

      <div className="flex-1" />

      {/* Notification */}
      <button
        onClick={onOpen}
        className="w-full animate-fade-up rounded-3xl bg-white/85 p-4 text-left shadow-xl backdrop-blur-xl transition active:scale-[0.98]"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
            <KairoMark size={22} />
          </span>
          <span className="text-[14px] font-semibold text-ink">Kairo</span>
          <span className="ml-auto text-[13px] text-slate-500">now</span>
        </div>
        <div className="mt-2">
          <div className="text-[16px] font-semibold text-ink">{title}</div>
          <p className="mt-1 line-clamp-2 text-[14px] leading-snug text-slate-600">
            {preview}
          </p>
        </div>
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 text-[13px] text-white/70">
        <span className="h-1 w-1 rounded-full bg-white/70" />
        Tap the notification to open
      </div>
    </div>
  );
}
