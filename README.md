# Kairo

**Guidelines change constantly; nobody goes back to move the patients already on the old treatment.** Kairo re-checks every patient against current guidance, catches the stranded ones, and closes the loop — plain-English to the patient, decision-ready approval to the clinician, delivery simulated.

Built for the eMed "Reimagine Health" hackathon. This repo is one crash-proof 90-second stage demo. See [CLAUDE.md](CLAUDE.md) for the hard rules and definition of done.

## Run it

```bash
npm install
cp .env.example .env.local      # add your ANTHROPIC_API_KEY (server-side only)
npm run dev                     # http://localhost:3000
```

The demo runs **without** a key or WiFi — every live call falls back to `fixtures/fallback.json`. The key only makes Margaret's one live run genuinely hit Claude.

## Drive the demo

One page, one linear state machine. **→ / Space** advance · **←** back · **R** restart. On-screen buttons advance too. The progress dots are clickable.

| # | Scene | What happens |
|---|-------|--------------|
| 1 | Guidelines | The 2019 rule everyone was last checked against. **Run check** |
| 2 | Scan (clear) | Sweep → "12 checked · all up to date" |
| 3 | Live edit | Presenter toggles ON the 2023 cardiorenal update — a **real** change to the engine's input |
| 4 | Scan (flagged) | "12 checked · 3 need review" → tap **Margaret** → the single live API call |
| 5 | Phone alert | Margaret's lock-screen notification → open |
| 6 | Explanation | Plain-English: what changed, why it matters, "common, not an emergency" → **Send to my GP** |
| 7 | Doctor card | Drift · eligibility (values vs thresholds) · contraindications cleared · draft script → **Approve** |
| 8 | Delivery | Approved → Dispensed → Dispatched → **Arriving Tuesday** |

## The reasoning engine

`lib/engine.ts` is **drug-agnostic** — it takes any patient + any rule pack and returns findings. All clinical specificity lives in `/data/*.json`. "Cover all prescriptions" later = add a rule pack, never rewrite the engine.

**Acceptance test #1** (the reveal): Margaret + `old` pack → `findings: []`; Margaret + `new` pack → exactly one finding, `meets_criteria: true`, `clear: true`.

## Scripts

```bash
npm run typecheck        # tsc --noEmit
npm run build            # next production build
npm run precompute       # run the 11 non-hero patients through the engine once
                         #   -> fixtures/precomputed.json (needs ANTHROPIC_API_KEY)
npm run check:confirmed  # HARD GATE: fails until every clinical string is
                         #   pharmacist-approved (confirmed: true). Must pass by Sat 12:00.
```

## Where the clinical content lives

- `data/patients.json` — 12 patients, hero = `p07` Margaret. Flagged under the new pack: Margaret, Tomasz (p05), Sofia (p09).
- `data/rulepack.json` — `old` (2019 baseline) and `new` (adds 2023 cardiorenal + 2026 first-line).
- `fixtures/precomputed.json` — findings for the 11 non-hero patients (scan reads these; never 12 live calls).
- `fixtures/fallback.json` — Margaret's known-good finding, the demo lifeline.

Every clinical string carries `"confirmed": false` until P3 (pharmacist) flips it. Building against placeholders is fine; demoing them is not.
