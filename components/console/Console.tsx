"use client";

// The clinician console — the desktop half of the product. A real workbench:
// guidance, population, worklist, the pharmacist-IP decision drawer, and a
// single contextual action bar so the presenter always has one obvious next
// step. Clinician-first: the worklist and pack come BEFORE the patient is
// engaged.

import type { Finding, Patient, Rule, RulepackVersion } from "@/lib/types";
import type { Phase } from "@/lib/phases";
import { phaseIndex, decisionOpen } from "@/lib/phases";
import { KairoMark } from "@/components/ui";
import { GuidelinePanel } from "./GuidelinePanel";
import { PopulationGrid, type GridRow } from "./PopulationGrid";
import { Worklist, type WorkItem } from "./Worklist";
import { DecisionPanel } from "./DecisionPanel";

export function Console({
  phase,
  version,
  finding,
  patient,
  oldRule,
  newRule,
  rows,
  round,
  worklist,
  onAdvance,
  onOpenWorkItem,
  onCloseDecision,
  onRestart,
}: {
  phase: Phase;
  version: RulepackVersion;
  finding: Finding;
  patient: Patient;
  oldRule: Rule;
  newRule: Rule;
  rows: GridRow[];
  round: 0 | 1 | 2;
  worklist: WorkItem[];
  onAdvance: () => void;
  onOpenWorkItem: (id: string) => void;
  onCloseDecision: () => void;
  onRestart: () => void;
}) {
  const i = phaseIndex(phase);
  const total = rows.length;
  const flaggedCount = rows.filter((r) => r.flagged).length;
  const checked = round >= 1 ? total : 0;
  const upToDate = round === 1 ? total : round === 2 ? total - flaggedCount : 0;
  const needReview = round === 2 ? flaggedCount : 0;

  const showWorklist = i >= phaseIndex("flagged");

  const activeArea: "guidance" | "population" | "worklist" =
    phase === "clear" || phase === "applied"
      ? "guidance"
      : showWorklist
        ? "worklist"
        : "population";

  return (
    <section className="relative flex h-full overflow-hidden rounded-[1.75rem] bg-white shadow-[0_30px_80px_-20px_rgba(15,23,42,0.5)]">
      {/* Sidebar */}
      <aside className="flex w-[210px] shrink-0 flex-col border-r border-slate-100 bg-slate-50/70 px-4 py-5">
        <div className="flex items-center gap-2.5 px-2">
          <KairoMark size={26} />
          <div>
            <div className="text-[16px] font-bold tracking-tight text-ink">
              Kairo
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Clinician console
            </div>
          </div>
        </div>

        <nav className="mt-8 space-y-1">
          <NavItem label="Guidance" active={activeArea === "guidance"} />
          <NavItem label="Population" active={activeArea === "population"} />
          <NavItem
            label="Worklist"
            active={activeArea === "worklist"}
            badge={needReview || undefined}
          />
        </nav>

        <div className="mt-auto space-y-2">
          <div className="rounded-xl bg-kairo-50 px-3 py-2 text-[11px] font-medium leading-snug text-kairo-700">
            Async approve-and-prescribe · pharmacist IP signs via EPS
          </div>
          <div className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 shadow-sm ring-1 ring-slate-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-kairo-100 text-[12px] font-bold text-kairo-700">
              PO
            </span>
            <div className="leading-tight">
              <div className="text-[13px] font-semibold text-ink">
                P. Okafor
              </div>
              <div className="text-[11px] text-slate-400">Pharmacist IP</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-100 px-7 py-5">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-ink">
              Cardiorenal medication review
            </h1>
            <p className="text-[13px] text-slate-400">
              Re-checking every patient against current guidance
            </p>
          </div>
          <div className="flex gap-2.5">
            <Stat label="Checked" value={checked} tone="neutral" />
            <Stat label="Up to date" value={upToDate} tone="clear" />
            <Stat label="Need review" value={needReview} tone="flag" />
          </div>
        </header>

        {/* Body */}
        <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-7 py-6">
          <GuidelinePanel
            version={version}
            oldRule={oldRule}
            newRule={newRule}
            updateAvailable={phase === "clear"}
          />
          <PopulationGrid rows={rows} round={round} />
          {showWorklist && <Worklist items={worklist} onOpen={onOpenWorkItem} />}
        </div>

        {/* Action bar */}
        <ActionBar phase={phase} onAdvance={onAdvance} onRestart={onRestart} />
      </div>

      {/* Decision drawer overlay */}
      <DecisionPanel
        open={decisionOpen(phase)}
        phase={phase}
        finding={finding}
        patient={patient}
        onAdvance={onAdvance}
        onClose={onCloseDecision}
      />
    </section>
  );
}

function NavItem({
  label,
  active,
  badge,
}: {
  label: string;
  active: boolean;
  badge?: number;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-[14px] font-semibold transition ${
        active
          ? "bg-white text-kairo-700 shadow-sm ring-1 ring-slate-100"
          : "text-slate-400"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            active ? "bg-kairo-500" : "bg-slate-300"
          }`}
        />
        {label}
      </span>
      {badge ? (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-flag-500 px-1.5 text-[11px] font-bold text-white">
          {badge}
        </span>
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "neutral" | "clear" | "flag";
}) {
  const tones = {
    neutral: "text-ink",
    clear: "text-clear-600",
    flag: "text-flag-600",
  } as const;
  return (
    <div className="min-w-[86px] rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-2 text-center">
      <div className={`text-[26px] font-bold leading-none ${tones[tone]}`}>
        {value}
      </div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </div>
    </div>
  );
}

function ActionBar({
  phase,
  onAdvance,
  onRestart,
}: {
  phase: Phase;
  onAdvance: () => void;
  onRestart: () => void;
}) {
  const config: {
    kind: "button" | "status";
    label: string;
    onClick?: () => void;
  } = (() => {
    switch (phase) {
      case "intro":
        return { kind: "button", label: "Re-check all patients", onClick: onAdvance };
      case "clear":
        return {
          kind: "button",
          label: "Review & apply 2023 update",
          onClick: onAdvance,
        };
      case "applied":
        return { kind: "button", label: "Re-check all patients", onClick: onAdvance };
      case "flagged":
        return { kind: "button", label: "Open Margaret’s pack", onClick: onAdvance };
      case "reviewing":
        return { kind: "status", label: "Reviewing prescribing pack…" };
      case "offered":
        return { kind: "status", label: "Offer sent — waiting for Margaret" };
      case "offerOpened":
        return { kind: "status", label: "Margaret is reviewing the offer…" };
      case "consented":
        return { kind: "status", label: "Consented — sign to prescribe" };
      case "prescribed":
        return { kind: "status", label: "Signed — dispatching to pharmacy" };
      case "delivered":
        return { kind: "button", label: "↺ Run the demo again", onClick: onRestart };
    }
  })();

  return (
    <div className="border-t border-slate-100 bg-white/80 px-7 py-4 backdrop-blur">
      {config.kind === "button" ? (
        <button
          onClick={config.onClick}
          className="w-full rounded-2xl bg-kairo-500 px-6 py-3.5 text-[16px] font-semibold text-white shadow-lg shadow-kairo-500/25 transition hover:bg-kairo-600 active:scale-[0.98]"
        >
          {config.label}
        </button>
      ) : (
        <div className="flex items-center justify-center gap-3 rounded-2xl bg-slate-50 px-6 py-3.5 text-[15px] font-medium text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-kairo-500" />
          {config.label}
        </div>
      )}
    </div>
  );
}
