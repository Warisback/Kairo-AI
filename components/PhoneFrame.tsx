"use client";

// PhoneFrame — the 390px device shell used by EVERY scene (hard-locked width,
// even on the projector). Renders the bezel, dynamic-island notch, and a status
// bar. Scene content fills the area below the status bar.

import { ReactNode } from "react";

export function PhoneFrame({
  children,
  statusDark = true,
  wallpaper = false,
}: {
  children: ReactNode;
  /** true = dark status-bar glyphs (light screens); false = white (wallpaper) */
  statusDark?: boolean;
  /** full-bleed lockscreen wallpaper behind the content */
  wallpaper?: boolean;
}) {
  const glyph = statusDark ? "text-ink/80" : "text-white/90";

  return (
    <div className="relative w-[390px] shrink-0">
      {/* Device body */}
      <div className="relative h-[844px] w-[390px] rounded-[3.2rem] bg-slate-900 p-[10px] shadow-[0_40px_120px_-20px_rgba(15,23,42,0.55),0_0_0_2px_rgba(255,255,255,0.06)_inset]">
        {/* Screen */}
        <div
          className={`no-scrollbar relative h-full w-full overflow-hidden rounded-[2.6rem] ${
            wallpaper
              ? "bg-gradient-to-b from-[#1b3a5b] via-[#2a5c7e] to-[#4a7fa0]"
              : "bg-mist"
          }`}
        >
          {/* Dynamic island */}
          <div className="pointer-events-none absolute left-1/2 top-[10px] z-30 h-[30px] w-[110px] -translate-x-1/2 rounded-full bg-black" />

          {/* Status bar */}
          <div
            className={`absolute inset-x-0 top-0 z-20 flex h-[50px] items-center justify-between px-7 pt-2 text-[15px] font-semibold ${glyph}`}
          >
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              {/* signal */}
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                <rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor" />
                <rect x="5" y="5" width="3" height="7" rx="1" fill="currentColor" />
                <rect x="10" y="2" width="3" height="10" rx="1" fill="currentColor" />
                <rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor" opacity="0.4" />
              </svg>
              {/* wifi */}
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path d="M8 10.5a1.3 1.3 0 100-2.6 1.3 1.3 0 000 2.6Z" fill="currentColor" />
                <path d="M3.2 5.6a7 7 0 019.6 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M5.2 7.6a4.1 4.1 0 015.6 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              {/* battery */}
              <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
                <rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke="currentColor" opacity="0.5" />
                <rect x="2" y="2" width="17" height="9" rx="2" fill="currentColor" />
                <rect x="24" y="4" width="2" height="5" rx="1" fill="currentColor" opacity="0.5" />
              </svg>
            </div>
          </div>

          {/* Scene content */}
          <div className="no-scrollbar h-full w-full overflow-y-auto">
            {children}
          </div>

          {/* Home indicator */}
          <div
            className={`pointer-events-none absolute bottom-2 left-1/2 z-20 h-[5px] w-[134px] -translate-x-1/2 rounded-full ${
              statusDark ? "bg-ink/25" : "bg-white/60"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
