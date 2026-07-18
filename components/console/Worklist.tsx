"use client";

// The clinician worklist — patients whose packs are ready, as an inbox. The
// hero (Margaret) escalates: pack ready -> in review -> offer sent -> consented
// -> prescribed. Only her row is actionable; the others sit awaiting the
// prescriber (human-in-the-loop, no batch action — hard rule #5).

import { Pill } from "@/components/ui";

export type WorkStatus =
  | "pack-ready"
  | "in-review"
  | "offer-sent"
  | "consented"
  | "prescribed"
  | "awaiting";

export interface WorkItem {
  id: string;
  name: string;
  summary: string;
  status: WorkStatus;
  clickable: boolean;
  hero?: boolean;
}

const STATUS_META: Record<
  WorkStatus,
  { label: string; tone: "neutral" | "flag" | "clear" | "kairo" }
> = {
  "pack-ready": { label: "Pack ready · awaiting prescriber", tone: "flag" },
  "in-review": { label: "In review", tone: "kairo" },
  "offer-sent": { label: "Offer sent · awaiting patient", tone: "kairo" },
  consented: { label: "Consented · ready to sign", tone: "flag" },
  prescribed: { label: "Prescribed", tone: "clear" },
  awaiting: { label: "Awaiting prescriber", tone: "neutral" },
};

export function Worklist({
  items,
  onOpen,
}: {
  items: WorkItem[];
  onOpen: (id: string) => void;
}) {
  const actionable = items.filter((i) => i.clickable).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-ink">Worklist</h3>
        {actionable > 0 && (
          <Pill tone="flag">
            <span className="h-1.5 w-1.5 rounded-full bg-flag-500" />
            {actionable} need action
          </Pill>
        )}
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const meta = STATUS_META[item.status];
          const clickable = item.clickable;
          return (
            <button
              key={item.id}
              disabled={!clickable}
              onClick={clickable ? () => onOpen(item.id) : undefined}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                clickable
                  ? "animate-pulse-soft border-flag-300 bg-flag-50 shadow-sm ring-1 ring-flag-200 hover:bg-flag-100 active:scale-[0.99]"
                  : item.status === "prescribed"
                    ? "border-clear-200 bg-clear-50/50"
                    : "border-slate-100 bg-white"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${
                  item.status === "prescribed"
                    ? "bg-clear-100 text-clear-700"
                    : clickable
                      ? "bg-flag-100 text-flag-700"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                {item.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-ink">
                  {item.name}
                </div>
                <div className="truncate text-[12.5px] text-slate-500">
                  {item.summary}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Pill tone={meta.tone}>{meta.label}</Pill>
                {clickable && (
                  <span className="text-[13px] font-semibold text-flag-600">
                    Open →
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
