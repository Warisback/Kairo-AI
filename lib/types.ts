// Core domain types for Kairo. Kept drug-agnostic: nothing here names a
// specific drug, condition, or threshold. Clinical specificity lives in /data.

export interface Medication {
  drug: string;
  since?: string;
  confirmed: boolean;
}

export interface Patient {
  id: string;
  hero?: boolean;
  name: string;
  age: number;
  conditions: string[];
  medications: Medication[];
  // Labs are an open bag of key -> value so the engine stays drug-agnostic.
  labs: Record<string, number | string>;
  last_medication_review?: string;
  confirmed: boolean;
}

export interface Rule {
  id: string;
  updated: string;
  text: string;
  confirmed: boolean;
}

export type RulepackVersion = "old" | "new";

export interface RulePack {
  old: Rule[];
  new: Rule[];
}

export interface Eligibility {
  meets_criteria: boolean;
  reasoning: string;
}

export interface ContraindicationCheck {
  clear: boolean;
  notes: string;
}

// The prescribing checklist IS the product: a machine-completed prescribing
// decision the human prescriber verifies and signs, rather than reviews from
// scratch. Kept generic (any drug's checks fit categorised items) so the engine
// stays drug-agnostic.
export type ChecklistStatus = "clear" | "caution" | "flag" | "info";

export interface ChecklistItem {
  label: string; // e.g. "eGFR 46 vs initiation threshold"
  detail: string; // value-vs-threshold reasoning / the caution / the counselling point
  status: ChecklistStatus;
}

export interface ChecklistSection {
  key: string; // "eligibility" | "cautions" | "interactions" | "counselling" | "monitoring"
  title: string;
  items: ChecklistItem[];
}

// One discordance between a patient and current guidance. This is the unit the
// engine emits and every downstream scene renders.
export interface Finding {
  current_drug_context: string;
  drift: string;
  guideline_id: string;
  guideline_changed: string;
  eligibility: Eligibility;
  contraindication_check: ContraindicationCheck;
  recommended_action: string;
  patient_explanation: string;
  clinician_summary: string;
  draft_prescription: string;
  // Optional, engine-populated. Rendered when present; absence never breaks the
  // demo (the drawer falls back to eligibility + contraindication).
  prescribing_checklist?: ChecklistSection[];
  // The offer framing shown to the patient AFTER clinical adjudication.
  patient_offer?: string;
  // Narrow, low-alarm questions the record genuinely can't supply, gathered at
  // the consent step only.
  structured_questions?: string[];
}

export interface ReconcileResponse {
  findings: Finding[];
}

export interface ReconcileRequest {
  patient: Patient;
  rulepackVersion: RulepackVersion;
}
