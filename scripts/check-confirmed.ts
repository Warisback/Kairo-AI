// scripts/check-confirmed.ts — HARD RULE #6 gate.
//
// Every clinical string (drug name, dose, threshold, guideline sentence,
// patient-facing explanation) lives in a data object carrying "confirmed":
// false until the pharmacist (P3) flips it to true. This script recursively
// walks the clinical data files and FAILS if any "confirmed" flag is still
// false. Must pass before demo lock (Sat 12:00).
//
// Usage: npm run check:confirmed

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Files whose clinical strings are gated by "confirmed" flags.
const FILES = ["data/patients.json", "data/rulepack.json"];

interface Unconfirmed {
  file: string;
  path: string;
  label: string;
}

function labelFor(node: Record<string, unknown>): string {
  if (typeof node.name === "string") return node.name;
  if (typeof node.drug === "string") return node.drug;
  if (typeof node.id === "string") return node.id;
  if (typeof node.text === "string") return String(node.text).slice(0, 48) + "…";
  return "(object)";
}

function walk(
  node: unknown,
  file: string,
  path: string,
  out: Unconfirmed[]
): void {
  if (Array.isArray(node)) {
    node.forEach((child, i) => walk(child, file, `${path}[${i}]`, out));
    return;
  }
  if (node && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    if (obj.confirmed === false) {
      out.push({ file, path, label: labelFor(obj) });
    }
    for (const [key, value] of Object.entries(obj)) {
      if (key === "confirmed") continue;
      walk(value, file, `${path}.${key}`, out);
    }
  }
}

function main() {
  const root = process.cwd();
  const unconfirmed: Unconfirmed[] = [];

  for (const file of FILES) {
    const raw = readFileSync(resolve(root, file), "utf8");
    walk(JSON.parse(raw), file, "$", unconfirmed);
  }

  if (unconfirmed.length === 0) {
    console.log("✓ check:confirmed — all clinical strings confirmed.");
    process.exit(0);
  }

  console.error(
    `✗ check:confirmed — ${unconfirmed.length} clinical string(s) NOT confirmed:\n`
  );
  for (const u of unconfirmed) {
    console.error(`  ${u.file}  ${u.path}  →  ${u.label}`);
  }
  console.error(
    "\nP3 must flip each `confirmed` flag to true before demo lock (Sat 12:00)."
  );
  process.exit(1);
}

main();
