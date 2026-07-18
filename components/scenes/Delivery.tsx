"use client";

// Scene 6 — closing the loop. Approved -> Dispensed -> Dispatched -> Arriving.
// Delivery is SIMULATED (hard rule: no real pharmacy integration). Stages
// advance on a timer; ends on the calm arrival screen.

import { useEffect, useState } from "react";
import { KairoMark } from "@/components/ui";

const STAGES = [
  { key: "approved", label: "Approved", sub: "Your GP signed it off" },
  { key: "dispensed", label: "Dispensed", sub: "Prepared at your pharmacy" },
  { key: "dispatched", label: "Dispatched", sub: "On its way to you" },
];

export function Delivery({ onRestart }: { onRestart: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 900),
      setTimeout(() => setStep(2), 1900),
      setTimeout(() => setStep(3), 2900),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const done = step >= 3;

  return (
    <div className="flex h-full flex-col px-6 pb-8 pt-16">
      <div className="flex items-center gap-2.5">
        <KairoMark size={26} />
        <span className="text-[19px] font-bold tracking-tight text-ink">
          Kairo
        </span>
      </div>

      <div className="mt-8">
        <h1 className="text-[26px] font-bold tracking-tight text-ink">
          Closing the loop
        </h1>
        <p className="mt-1.5 text-[15px] text-slate-500">
          From guidance change to medicine at the door.
        </p>
      </div>

      {/* Stepper */}
      <div className="mt-8 flex-1">
        <div className="space-y-1">
          {STAGES.map((s, i) => {
            const active = step > i;
            return (
              <div key={s.key} className="flex gap-4">
                {/* Rail */}
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                      active
                        ? "bg-clear-500 text-white"
                        : "bg-slate-100 text-slate-300"
                    }`}
                  >
                    {active ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M3.5 8.5l3 3 6-7"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <span className="text-[13px] font-bold">{i + 1}</span>
                    )}
                  </span>
                  {i < STAGES.length - 1 && (
                    <span
                      className={`my-1 w-[2px] flex-1 rounded transition-colors ${
                        step > i + 1 ? "bg-clear-400" : "bg-slate-100"
                      }`}
                      style={{ minHeight: 28 }}
                    />
                  )}
                </div>
                {/* Label */}
                <div className={`pb-6 transition-opacity ${active ? "opacity-100" : "opacity-40"}`}>
                  <div className="text-[17px] font-semibold text-ink">
                    {s.label}
                  </div>
                  <div className="text-[14px] text-slate-500">{s.sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Arrival */}
        {done && (
          <div className="mt-2 animate-fade-up rounded-3xl bg-gradient-to-br from-kairo-500 to-kairo-700 p-6 text-white shadow-xl shadow-kairo-500/30">
            <div className="text-[13px] font-medium uppercase tracking-[0.14em] text-white/70">
              Arriving
            </div>
            <div className="mt-1 text-[32px] font-bold leading-tight">
              Tuesday
            </div>
            <p className="mt-2 text-[15px] leading-snug text-white/85">
              A patient the old guideline left behind is now on current therapy —
              reviewed, approved, and on the way.
            </p>
          </div>
        )}
      </div>

      {done && (
        <button
          onClick={onRestart}
          className="mt-4 animate-fade-up text-center text-[14px] font-semibold text-slate-400 transition hover:text-slate-600"
        >
          ↺ Run the demo again
        </button>
      )}
    </div>
  );
}
