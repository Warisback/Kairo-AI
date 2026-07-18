"use client";

// The pharmacist-IP decision drawer — the "show its working" surface and the
// heart of the product. The prescribing checklist is machine-completed from the
// record; the prescriber VERIFIES and signs, rather than reviewing from scratch
// (hard rule #5: human owns the decision, nothing auto-prescribes). The offer
// to the patient only goes out AFTER approve-in-principle.

import type {
  ChecklistSection,
  ChecklistStatus,
  Finding,
  Patient,
} from "@/lib/types";
import type { Phase } from "@/lib/phases";
import { Pill } from "@/components/ui";

function prettyLab(key: string): string {
  return key
    .replace(/_mmol_mol$/, " (mmol/mol)")
    .replace(/_mIU_L$/, " (mIU/L)")
    .replace(/_/g, " ");
}

export function DecisionPanel({
  open,
  phase,
  finding,
  patient,
  onAdvance,
  onClose,
}: {
  open: boolean;
  phase: Phase;
  finding: Finding;
  patient: Patient;
  onAdvance: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  const checklist = finding.prescribing_checklist;

  return (
    <div className="absolute inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative flex h-full w-[500px] animate-slide-in flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">
                Prescribing pack · Pharmacist IP review
              </div>
              <div className="text-[19px] font-bold text-ink">
                {patient.name}, {patient.age}
              </div>
            </div>
            {phase === "reviewing" ? (
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            ) : null}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Pill tone="kairo">Machine-completed · verify &amp; sign</Pill>
            <Pill tone="neutral">Exception → refer to GP</Pill>
          </div>
        </div>

        {/* Body */}
        <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-6 py-5">
          {/* Evidence on file */}
          <div className="flex flex-wrap gap-1.5">
            {patient.conditions.map((c) => (
              <Pill key={c} tone="neutral">
                {c}
              </Pill>
            ))}
            {Object.entries(patient.labs).map(([k, v]) => (
              <Pill key={k} tone="neutral">
                {prettyLab(k)} {v}
              </Pill>
            ))}
          </div>

          {/* Drift */}
          <div className="rounded-2xl border border-flag-200 bg-flag-50/60 p-4">
            <div className="mb-1 text-[12px] font-semibold uppercase tracking-wide text-flag-700">
              Drift detected · guidance {finding.guideline_changed}
            </div>
            <p className="text-[14px] leading-relaxed text-slate-700">
              {finding.drift}
            </p>
          </div>

          {/* Prescribing checklist (or graceful fallback) */}
          {checklist && checklist.length > 0 ? (
            checklist.map((section) => (
              <ChecklistSectionView key={section.key} section={section} />
            ))
          ) : (
            <FallbackChecks finding={finding} />
          )}

          {/* Draft prescription */}
          <div className="rounded-2xl border border-kairo-200 bg-kairo-50/50 p-4">
            <div className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-kairo-700">
              Draft prescription
            </div>
            <p className="font-mono text-[13px] leading-relaxed text-ink">
              {finding.draft_prescription}
            </p>
          </div>
        </div>

        {/* Footer — phase-driven */}
        <div className="border-t border-slate-100 px-6 py-4">
          <Footer phase={phase} onAdvance={onAdvance} />
        </div>
      </div>
    </div>
  );
}

function Footer({ phase, onAdvance }: { phase: Phase; onAdvance: () => void }) {
  if (phase === "reviewing") {
    return (
      <>
        <button
          onClick={onAdvance}
          className="w-full rounded-2xl bg-clear-500 px-6 py-4 text-[16px] font-semibold text-white shadow-lg shadow-clear-500/30 transition hover:bg-clear-600 active:scale-[0.98]"
        >
          Approve in principle &amp; offer to patient
        </button>
        <div className="mt-2 flex gap-2">
          <button disabled className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-[14px] font-semibold text-slate-400">
            Decline
          </button>
          <button disabled className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-[14px] font-semibold text-slate-400">
            Refer to GP
          </button>
        </div>
      </>
    );
  }

  if (phase === "offered" || phase === "offerOpened") {
    return (
      <div className="flex items-center justify-center gap-3 rounded-2xl bg-slate-50 px-6 py-4 text-[15px] font-medium text-slate-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-kairo-500" />
        Offer sent — awaiting Margaret’s consent
      </div>
    );
  }

  if (phase === "consented") {
    return (
      <div className="animate-fade-up">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-clear-50 px-4 py-3">
          <SuccessDot />
          <div className="text-[14px] font-semibold text-clear-700">
            Patient consented — shared decision recorded
          </div>
        </div>
        <button
          onClick={onAdvance}
          className="w-full rounded-2xl bg-kairo-500 px-6 py-4 text-[16px] font-semibold text-white shadow-lg shadow-kairo-500/25 transition hover:bg-kairo-600 active:scale-[0.98]"
        >
          Sign &amp; dispatch via EPS
        </button>
      </div>
    );
  }

  // prescribed
  return (
    <div className="animate-fade-up">
      <div className="mb-3 flex items-center gap-3 rounded-xl bg-clear-50 px-4 py-3">
        <SuccessDot />
        <div className="text-[14px] font-semibold text-clear-700">
          Signed via EPS · sent to pharmacy
        </div>
      </div>
      <button
        onClick={onAdvance}
        className="w-full rounded-2xl bg-white px-6 py-3 text-[15px] font-semibold text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50"
      >
        Done
      </button>
    </div>
  );
}

function SuccessDot() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-clear-500 text-white">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function ChecklistSectionView({ section }: { section: ChecklistSection }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-2.5 text-[12px] font-semibold uppercase tracking-wide text-slate-500">
        {section.title}
      </div>
      <div className="space-y-2.5">
        {section.items.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <StatusMark status={item.status} />
            <div className="min-w-0">
              <div className="text-[14px] font-semibold leading-snug text-ink">
                {item.label}
              </div>
              <div className="text-[13px] leading-snug text-slate-500">
                {item.detail}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusMark({ status }: { status: ChecklistStatus }) {
  const map = {
    clear: { bg: "bg-clear-100 text-clear-700", glyph: "✓" },
    caution: { bg: "bg-flag-100 text-flag-700", glyph: "!" },
    flag: { bg: "bg-red-100 text-red-600", glyph: "✕" },
    info: { bg: "bg-kairo-100 text-kairo-700", glyph: "i" },
  } as const;
  const m = map[status];
  return (
    <span
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${m.bg}`}
    >
      {m.glyph}
    </span>
  );
}

// Graceful fallback if the engine didn't return a structured checklist.
function FallbackChecks({ finding }: { finding: Finding }) {
  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-ink">Eligibility</span>
          {finding.eligibility.meets_criteria ? (
            <Pill tone="clear">✓ Meets criteria</Pill>
          ) : (
            <Pill tone="flag">Does not meet</Pill>
          )}
        </div>
        <p className="text-[14px] leading-relaxed text-slate-600">
          {finding.eligibility.reasoning}
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-ink">
            Contraindication screen
          </span>
          {finding.contraindication_check.clear ? (
            <Pill tone="clear">✓ Cleared</Pill>
          ) : (
            <Pill tone="flag">Review</Pill>
          )}
        </div>
        <p className="text-[14px] leading-relaxed text-slate-600">
          {finding.contraindication_check.notes}
        </p>
      </div>
    </>
  );
}
