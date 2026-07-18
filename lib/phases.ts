// The demo is a deterministic timeline of beats. CLINICIAN-FIRST ordering: the
// machine builds a prescribing pack from the record, a pharmacist independent
// prescriber adjudicates it, and ONLY THEN is the patient engaged for the
// shared-decision + consent conversation — because offering a preventive drug
// is itself a clinical act and must not precede sign-off. Nothing auto-
// prescribes; a registered prescriber always signs.
//
// Both panels (clinician console + patient phone) derive from the current
// phase. Clicks on the active control advance the phase; ArrowRight/Left also
// advance, so the story runs hands-free or click-by-click and never depends on
// the network except Margaret's single live run.

export const PHASES = [
  "intro", // 0 — 2019 guidance active, population not yet re-checked
  "clear", // 1 — re-checked: all up to date; new guidance becomes available
  "applied", // 2 — the 2023 update is applied (rulepack -> "new")
  "flagged", // 3 — re-checked: 3 flagged; Kairo builds each prescribing pack. Phone stays dark.
  "reviewing", // 4 — pharmacist-IP opens Margaret's prescribing checklist
  "offered", // 5 — approved-in-principle; the offer is sent to the patient (phone notifies)
  "offerOpened", // 6 — Margaret opens the offer + shared-decision screen
  "consented", // 7 — Margaret consents; it returns to the prescriber to sign
  "prescribed", // 8 — prescriber signs via EPS; dispatch begins
  "delivered", // 9 — delivery closes the loop: Arriving Tuesday
] as const;

export type Phase = (typeof PHASES)[number];

export function phaseIndex(p: Phase): number {
  return PHASES.indexOf(p);
}

/** Which scan round the population grid is showing at a given phase. */
export function scanRound(p: Phase): 0 | 1 | 2 {
  const i = phaseIndex(p);
  if (i >= phaseIndex("flagged")) return 2; // 3 flagged
  if (i >= phaseIndex("clear")) return 1; // all clear
  return 0; // not yet checked
}

/** The clinician's decision drawer is open (pharmacist working the pack). */
export function decisionOpen(p: Phase): boolean {
  const i = phaseIndex(p);
  return i >= phaseIndex("reviewing") && i <= phaseIndex("prescribed");
}
