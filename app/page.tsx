"use client";

// app/page.tsx — the whole product on one page. Left: the clinician console.
// Right: Margaret's patient phone. Both derive from a single phase timeline, so
// the audience watches the entire loop — guideline change → flag → patient →
// clinician → delivery — happen live. Only Margaret's one run touches the
// network, and it falls back, so this works with WiFi off.

import { useCallback, useEffect, useMemo, useState } from "react";

import patientsData from "@/data/patients.json";
import rulepackData from "@/data/rulepack.json";
import precomputedData from "@/fixtures/precomputed.json";
import fallbackData from "@/fixtures/fallback.json";

import type {
  Finding,
  Patient,
  ReconcileResponse,
  RulePack,
  RulepackVersion,
} from "@/lib/types";
import { PHASES, type Phase, phaseIndex, scanRound } from "@/lib/phases";

import { Console } from "@/components/console/Console";
import { PatientPhone } from "@/components/patient/PatientPhone";
import type { GridRow } from "@/components/console/PopulationGrid";
import type { WorkItem, WorkStatus } from "@/components/console/Worklist";

const patients = patientsData as unknown as Patient[];
const rulepack = rulepackData as RulePack;
const precomputed = precomputedData as Record<string, ReconcileResponse>;
const fallback = fallbackData as ReconcileResponse;

const hero = patients.find((p) => p.hero)!;
const oldRule = rulepack.old[0];
const newRule = rulepack.new.find((r) => r.id === "t2d-sglt2-cardiorenal")!;

function isFlagged(p: Patient): boolean {
  return Boolean(p.hero) || (precomputed[p.id]?.findings.length ?? 0) > 0;
}

export default function Page() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [version, setVersion] = useState<RulepackVersion>("old");
  const [finding, setFinding] = useState<Finding | null>(null);
  const [firing, setFiring] = useState(false);

  const round = scanRound(phase);
  const activeFinding = finding ?? fallback.findings[0];

  // The single live run. Any failure -> fallback. Never throws to the UI.
  const fireReconcile = useCallback(async () => {
    if (firing || finding) return;
    setFiring(true);
    let findings: Finding[] = [];
    try {
      const res = await fetch("/api/reconcile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ patient: hero, rulepackVersion: "new" }),
      });
      const data = (await res.json()) as ReconcileResponse;
      findings = data.findings ?? [];
    } catch {
      findings = fallback.findings;
    }
    if (findings.length === 0) findings = fallback.findings;
    setFinding(findings[0]);
    setFiring(false);
  }, [firing, finding]);

  const advance = useCallback(() => {
    setPhase((cur) => {
      const nextI = Math.min(PHASES.length - 1, phaseIndex(cur) + 1);
      const target = PHASES[nextI];
      if (target === "applied") setVersion("new"); // apply the 2023 update
      if (target === "flagged") void fireReconcile(); // the single live run
      return target;
    });
  }, [fireReconcile]);

  const back = useCallback(() => {
    setPhase((cur) => PHASES[Math.max(0, phaseIndex(cur) - 1)]);
  }, []);

  const restart = useCallback(() => {
    setFinding(null);
    setFiring(false);
    setVersion("old");
    setPhase("intro");
  }, []);

  // Keyboard: arrows to move through the story, R to restart.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        advance();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        back();
      } else if (e.key.toLowerCase() === "r") {
        restart();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, back, restart]);

  const rows = useMemo<GridRow[]>(
    () =>
      patients.map((p) => ({
        id: p.id,
        name: p.name,
        hero: p.hero,
        flagged: round === 2 && isFlagged(p),
      })),
    [round]
  );

  const worklist = useMemo<WorkItem[]>(() => {
    const flagged = patients.filter(isFlagged);
    // Hero first, then the other discordant patients.
    flagged.sort((a, b) => Number(Boolean(b.hero)) - Number(Boolean(a.hero)));
    const i = phaseIndex(phase);

    return flagged.map((p) => {
      const summary = p.hero
        ? activeFinding.clinician_summary
        : (precomputed[p.id]?.findings[0]?.clinician_summary ?? "");
      let status: WorkStatus = "awaiting";
      let clickable = false;
      if (p.hero) {
        if (i >= phaseIndex("prescribed")) status = "prescribed";
        else if (phase === "consented") status = "consented";
        else if (phase === "offered" || phase === "offerOpened")
          status = "offer-sent";
        else if (phase === "reviewing") status = "in-review";
        else status = "pack-ready"; // flagged
        clickable = phase === "flagged";
      }
      return { id: p.id, name: p.name, summary, status, clickable, hero: p.hero };
    });
  }, [phase, activeFinding]);

  // Console interactions map onto the timeline.
  const onOpenWorkItem = useCallback(
    (id: string) => {
      if (id === hero.id && phase === "flagged") advance();
    },
    [phase, advance]
  );
  const onCloseDecision = useCallback(() => {
    setPhase((cur) => (cur === "reviewing" ? "flagged" : cur));
  }, []);

  return (
    <main className="relative flex h-screen w-screen items-center gap-6 overflow-hidden bg-gradient-to-br from-[#0b1220] via-[#111a2e] to-[#0b1220] px-6 py-6">
      {/* Clinician console */}
      <div className="h-full min-w-0 flex-1">
        <Console
          phase={phase}
          version={version}
          finding={activeFinding}
          patient={hero}
          oldRule={oldRule}
          newRule={newRule}
          rows={rows}
          round={round}
          worklist={worklist}
          onAdvance={advance}
          onOpenWorkItem={onOpenWorkItem}
          onCloseDecision={onCloseDecision}
          onRestart={restart}
        />
      </div>

      {/* Patient phone */}
      <div className="flex h-full shrink-0 flex-col items-center justify-center">
        <div className="origin-center scale-[0.8] 2xl:scale-90">
          <PatientPhone
            phase={phase}
            finding={activeFinding}
            onOpen={advance}
            onConsent={advance}
            onRestart={restart}
          />
        </div>
        <div className="mt-1 flex items-center gap-2 text-[13px] font-medium text-white/50">
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          Margaret’s phone · patient app
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[12px] text-white/30">
        ← → to move through the story · R to restart · {phaseIndex(phase) + 1}/
        {PHASES.length}
      </div>
    </main>
  );
}
