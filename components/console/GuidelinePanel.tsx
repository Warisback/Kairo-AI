"use client";

// Shows the guidance the population is being checked against. When a newer
// guideline becomes available it appears as a pending update; applying it is a
// REAL change to rulepackVersion (the reveal depends on this being real).

import type { Rule, RulepackVersion } from "@/lib/types";
import { Pill } from "@/components/ui";

function RuleCard({
  rule,
  tone,
}: {
  rule: Rule;
  tone: "active" | "dimmed" | "pending";
}) {
  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        tone === "active"
          ? "border-kairo-300 bg-kairo-50/60 ring-1 ring-kairo-100"
          : tone === "pending"
            ? "animate-fade-up border-kairo-300 bg-white ring-2 ring-kairo-200"
            : "border-slate-200 bg-white opacity-50"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill tone={tone === "dimmed" ? "neutral" : "kairo"}>
            Updated {rule.updated}
          </Pill>
          {tone === "active" && (
            <span className="flex items-center gap-1 text-[12px] font-semibold text-clear-600">
              <span className="h-1.5 w-1.5 rounded-full bg-clear-500" /> Active
            </span>
          )}
          {tone === "pending" && (
            <span className="flex items-center gap-1 text-[12px] font-semibold text-kairo-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-kairo-500" />{" "}
              New
            </span>
          )}
        </div>
        <span className="font-mono text-[11px] text-slate-400">{rule.id}</span>
      </div>
      <p className="text-[14px] leading-relaxed text-slate-700">{rule.text}</p>
    </div>
  );
}

export function GuidelinePanel({
  version,
  oldRule,
  newRule,
  updateAvailable,
}: {
  version: RulepackVersion;
  oldRule: Rule;
  newRule: Rule;
  updateAvailable: boolean;
}) {
  const applied = version === "new";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-ink">
          Current guidance · Cardiorenal
        </h3>
        {updateAvailable && (
          <Pill tone="flag">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-flag-500" />
            Update available
          </Pill>
        )}
      </div>

      <div className="space-y-2.5">
        <RuleCard rule={oldRule} tone={applied ? "dimmed" : "active"} />
        {updateAvailable && !applied && (
          <RuleCard rule={newRule} tone="pending" />
        )}
        {applied && <RuleCard rule={newRule} tone="active" />}
      </div>
    </div>
  );
}
