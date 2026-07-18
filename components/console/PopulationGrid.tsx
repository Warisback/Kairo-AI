"use client";

// The population panel — 12 patients re-checked against current guidance. Same
// component renders "all up to date" and the flagged state; status is data, not
// hardcoded copy (hard rule #2).

import { useEffect, useRef, useState } from "react";

export interface GridRow {
  id: string;
  name: string;
  flagged: boolean;
  hero?: boolean;
}

export function PopulationGrid({
  rows,
  round,
}: {
  rows: GridRow[];
  round: 0 | 1 | 2;
}) {
  const [scanning, setScanning] = useState(false);
  const [revealed, setRevealed] = useState(rows.length);
  const prevRound = useRef(round);

  useEffect(() => {
    if (round === 0) {
      setRevealed(rows.length);
      return;
    }
    // Animate only when the round actually changes (a re-check was triggered).
    if (prevRound.current === round) return;
    prevRound.current = round;

    setScanning(true);
    setRevealed(0);
    const per = 70;
    const timers = rows.map((_, i) =>
      setTimeout(() => setRevealed(i + 1), 200 + i * per)
    );
    timers.push(
      setTimeout(() => setScanning(false), 200 + rows.length * per + 250)
    );
    return () => timers.forEach(clearTimeout);
  }, [round, rows]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-ink">Patient population</h3>
          <p className="text-[13px] text-slate-400">
            {round === 0
              ? "Not yet re-checked against current guidance"
              : scanning
                ? "Re-checking against current guidance…"
                : round === 2
                  ? "Re-checked · 3 need review"
                  : "Re-checked · all up to date"}
          </p>
        </div>
        {scanning && (
          <span className="h-5 w-5 animate-spin rounded-full border-[3px] border-slate-200 border-t-kairo-500" />
        )}
      </div>

      {scanning && (
        <div className="pointer-events-none absolute inset-x-0 top-16 z-10 h-28 animate-sweep bg-gradient-to-b from-transparent via-kairo-400/20 to-transparent" />
      )}

      <div className="grid grid-cols-3 gap-2.5">
        {rows.map((r, i) => {
          const shown = i < revealed;
          const state: "pending" | "clear" | "flag" =
            round === 0 || !shown
              ? "pending"
              : r.flagged && round === 2
                ? "flag"
                : "clear";
          return (
            <div
              key={r.id}
              className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all ${
                state === "flag"
                  ? "border-flag-200 bg-flag-50"
                  : state === "clear"
                    ? "border-slate-100 bg-slate-50/50"
                    : "border-slate-100 bg-white"
              } ${shown || round === 0 ? "opacity-100" : "opacity-30"}`}
            >
              <Avatar name={r.name} tone={state} />
              <div className="min-w-0 flex-1">
                <div
                  className={`truncate text-[13px] font-semibold ${
                    r.hero && state === "flag" ? "text-flag-700" : "text-ink"
                  }`}
                >
                  {r.name}
                </div>
              </div>
              <StatusDot state={state} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Avatar({
  name,
  tone,
}: {
  name: string;
  tone: "pending" | "clear" | "flag";
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  const bg =
    tone === "flag"
      ? "bg-flag-100 text-flag-700"
      : tone === "clear"
        ? "bg-clear-100 text-clear-700"
        : "bg-slate-100 text-slate-400";
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${bg}`}
    >
      {initials}
    </span>
  );
}

function StatusDot({ state }: { state: "pending" | "clear" | "flag" }) {
  if (state === "pending")
    return <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />;
  if (state === "flag")
    return <span className="h-2.5 w-2.5 rounded-full bg-flag-500" />;
  return <span className="h-2.5 w-2.5 rounded-full bg-clear-500" />;
}
