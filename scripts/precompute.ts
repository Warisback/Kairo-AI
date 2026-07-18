// scripts/precompute.ts — run the 11 non-hero patients through the engine ONCE
// and write fixtures/precomputed.json. HARD RULE #4: on stage we only ever run
// Margaret live; everyone else is served from this file.
//
// Usage: npm run precompute   (requires ANTHROPIC_API_KEY in .env.local)

import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import Anthropic from "@anthropic-ai/sdk";

import {
  DEFAULT_MODEL,
  SYSTEM_PROMPT,
  buildUserPrompt,
  parseAndValidate,
} from "../lib/engine";
import type { Patient, ReconcileResponse, RulePack } from "../lib/types";

// Next.js reads .env.local; load it here too so the script sees the key.
loadEnv({ path: resolve(process.cwd(), ".env.local") });

const ROOT = process.cwd();
const patients = JSON.parse(
  readFileSync(resolve(ROOT, "data/patients.json"), "utf8")
) as Patient[];
const rulepack = JSON.parse(
  readFileSync(resolve(ROOT, "data/rulepack.json"), "utf8")
) as RulePack;

async function run() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Missing ANTHROPIC_API_KEY. Add it to .env.local.");
    process.exit(1);
  }
  const client = new Anthropic({ apiKey });

  const nonHero = patients.filter((p) => !p.hero);
  const out: Record<string, ReconcileResponse> = {};

  // Precompute against the NEW pack — that is the flagged state the scan shows.
  const rules = rulepack.new;

  for (const patient of nonHero) {
    process.stdout.write(`Reconciling ${patient.id} ${patient.name}... `);
    try {
      const msg = await client.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: 1500,
        temperature: 0,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserPrompt(patient, rules) }],
      });
      const text = msg.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
      out[patient.id] = parseAndValidate(text);
      console.log(`${out[patient.id].findings.length} finding(s)`);
    } catch (err) {
      console.log(`FAILED (${(err as Error).message}) — writing empty findings`);
      out[patient.id] = { findings: [] };
    }
  }

  const dest = resolve(ROOT, "fixtures/precomputed.json");
  writeFileSync(dest, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`\nWrote ${dest}`);
}

run();
