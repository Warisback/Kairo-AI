// lib/engine.ts — the reasoning engine.
//
// HARD RULE #1: drug-agnostic. Nothing in this file names a drug, condition,
// threshold, or patient. It takes ANY patient object + ANY rule pack and asks
// the model to reconcile them. "Cover all prescriptions" later = add a rule
// pack, never edit this file.
//
// HARD RULE #3: never crash. This module PARSES and VALIDATES; callers wrap the
// model call in try/catch and fall back to fixtures on any failure.

import type {
  ChecklistSection,
  Finding,
  Patient,
  ReconcileResponse,
  Rule,
} from "./types";

export const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

// ---------------------------------------------------------------------------
// Prompt construction
// ---------------------------------------------------------------------------

export const SYSTEM_PROMPT = `You are a drug-agnostic medication-reconciliation engine.

Given a patient's medications, conditions, and labs, and a set of CURRENT guidelines (each with a last-updated date), find any situation now DISCORDANT with current guidance: the patient is on an outdated regimen, OR is eligible for a newer recommended therapy they are not currently on.

The output is a PRESCRIBING PACK a registered prescriber will verify and sign — not review from scratch — so complete the whole prescribing decision, don't just flag the gap.

For EACH finding, output an object with exactly these fields:
- current_drug_context: what the patient is currently on that is relevant.
- drift: the specific discordance between the patient's regimen and current guidance.
- guideline_id: the id of the guideline that drives this finding.
- guideline_changed: the last-updated date of that guideline.
- eligibility: { meets_criteria: boolean, reasoning: string } — check the patient's ACTUAL values against the guideline's criteria and state them explicitly (patient value vs threshold).
- contraindication_check: { clear: boolean, notes: string } — screen for contraindications and state what was checked and cleared.
- prescribing_checklist: an array of sections, each { key, title, items:[{ label, detail, status }] }, where status is one of "clear" | "caution" | "flag" | "info". Complete the FULL prescribing decision the prescriber must otherwise do by hand. Include sections covering, as applicable to the drug and record: eligibility (values vs thresholds, diagnosis codes), any therapy-specific caveat, cautions (e.g. volume status / interacting comorbidity / frailty / a condition that contraindicates), interactions (with current medications, and any dose change needed), counselling (what to warn/advise the patient), and monitoring/anti-inertia (state where an expected but benign change is NOT a reason to stop, and where routine monitoring is NOT required — over-monitoring is a barrier, not a safeguard). Base every item on the patient's actual data.
- recommended_action: the concrete clinical action.
- patient_explanation: a calm, plain-English explanation for the patient of what changed and why it matters. Reassuring, not alarming. Say it is common and not an emergency where true. No jargon.
- patient_offer: the offer framing shown to the patient AFTER the prescriber has adjudicated — make clear a clinician has already reviewed their record and is offering this, and invite a shared decision. Plain English, no pressure.
- structured_questions: an array of 1-3 narrow, low-alarm questions the record genuinely cannot supply, to ask at consent (e.g. a symptom or preference). Not "do you want a drug".
- clinician_summary: one dense line for the prescriber.
- draft_prescription: a draft prescription line the prescriber can sign.

RULES:
- Only flag GENUINE discordance. If the patient is fully concordant with current guidance, return an empty findings array.
- Base every claim on the patient's actual data. Do not invent labs or history.
- Output STRICTLY valid JSON matching this schema and nothing else. No prose, no markdown code fences.

Schema:
{"findings":[{"current_drug_context":"","drift":"","guideline_id":"","guideline_changed":"","eligibility":{"meets_criteria":true,"reasoning":""},"contraindication_check":{"clear":true,"notes":""},"prescribing_checklist":[{"key":"","title":"","items":[{"label":"","detail":"","status":"clear"}]}],"recommended_action":"","patient_explanation":"","patient_offer":"","structured_questions":[""],"clinician_summary":"","draft_prescription":""}]}`;

export function buildUserPrompt(patient: Patient, rules: Rule[]): string {
  return [
    "PATIENT:",
    JSON.stringify(patient, null, 2),
    "",
    "CURRENT GUIDELINES:",
    JSON.stringify(rules, null, 2),
    "",
    "Return only the JSON object described in the system prompt.",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Parse + validate
// ---------------------------------------------------------------------------

/** Remove ```json ... ``` fences and any leading/trailing prose noise. */
export function stripCodeFences(raw: string): string {
  let s = raw.trim();
  // Strip a leading fence line (```json / ```)
  s = s.replace(/^```[a-zA-Z]*\s*/, "");
  // Strip a trailing fence
  s = s.replace(/\s*```$/, "");
  // If the model wrapped prose around the object, grab the outermost braces.
  const first = s.indexOf("{");
  const last = s.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    s = s.slice(first, last + 1);
  }
  return s.trim();
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

const CHECKLIST_STATUSES = new Set(["clear", "caution", "flag", "info"]);

/** Lenient: returns a clean checklist, or undefined if anything is off. Never throws. */
function parseChecklist(v: unknown): ChecklistSection[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const sections: ChecklistSection[] = [];
  for (const s of v) {
    if (!s || typeof s !== "object") return undefined;
    const sec = s as Record<string, unknown>;
    if (!isString(sec.key) || !isString(sec.title) || !Array.isArray(sec.items))
      return undefined;
    const items = [];
    for (const it of sec.items) {
      if (!it || typeof it !== "object") return undefined;
      const item = it as Record<string, unknown>;
      if (
        !isString(item.label) ||
        !isString(item.detail) ||
        !isString(item.status) ||
        !CHECKLIST_STATUSES.has(item.status)
      )
        return undefined;
      items.push({
        label: item.label,
        detail: item.detail,
        status: item.status as ChecklistSection["items"][number]["status"],
      });
    }
    sections.push({ key: sec.key, title: sec.title, items });
  }
  return sections;
}

function parseStringArray(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v.every(isString) ? (v as string[]) : undefined;
}

function validateFinding(v: unknown): Finding | null {
  if (typeof v !== "object" || v === null) return null;
  const f = v as Record<string, unknown>;
  const elig = f.eligibility as Record<string, unknown> | undefined;
  const contra = f.contraindication_check as Record<string, unknown> | undefined;

  if (
    !isString(f.current_drug_context) ||
    !isString(f.drift) ||
    !isString(f.guideline_id) ||
    !isString(f.guideline_changed) ||
    !elig ||
    typeof elig.meets_criteria !== "boolean" ||
    !isString(elig.reasoning) ||
    !contra ||
    typeof contra.clear !== "boolean" ||
    !isString(contra.notes) ||
    !isString(f.recommended_action) ||
    !isString(f.patient_explanation) ||
    !isString(f.clinician_summary) ||
    !isString(f.draft_prescription)
  ) {
    return null;
  }

  return {
    current_drug_context: f.current_drug_context as string,
    drift: f.drift as string,
    guideline_id: f.guideline_id as string,
    guideline_changed: f.guideline_changed as string,
    eligibility: {
      meets_criteria: elig.meets_criteria as boolean,
      reasoning: elig.reasoning as string,
    },
    contraindication_check: {
      clear: contra.clear as boolean,
      notes: contra.notes as string,
    },
    recommended_action: f.recommended_action as string,
    patient_explanation: f.patient_explanation as string,
    clinician_summary: f.clinician_summary as string,
    draft_prescription: f.draft_prescription as string,
    // Optional extras — omitted (not fatal) if the model didn't return clean shapes.
    prescribing_checklist: parseChecklist(f.prescribing_checklist),
    patient_offer: isString(f.patient_offer) ? f.patient_offer : undefined,
    structured_questions: parseStringArray(f.structured_questions),
  };
}

/**
 * Parse raw model text into a validated ReconcileResponse.
 * Throws on any shape mismatch — the caller catches and falls back.
 */
export function parseAndValidate(raw: string): ReconcileResponse {
  const cleaned = stripCodeFences(raw);
  const parsed = JSON.parse(cleaned) as unknown;

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Engine output is not an object");
  }
  const obj = parsed as Record<string, unknown>;
  if (!Array.isArray(obj.findings)) {
    throw new Error("Engine output missing findings array");
  }

  const findings: Finding[] = [];
  for (const item of obj.findings) {
    const f = validateFinding(item);
    if (!f) throw new Error("Engine output has a malformed finding");
    findings.push(f);
  }

  return { findings };
}
