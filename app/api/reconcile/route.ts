// app/api/reconcile/route.ts — the ONLY server code.
//
// POST { patient, rulepackVersion: "old" | "new" } -> { findings }
//
// HARD RULE #3: the demo can never crash. Any failure — no key, network down,
// non-JSON, schema mismatch, timeout — is caught and we silently return the
// known-good fallback. There is no visible error state.
//
// HARD RULE #7: ANTHROPIC_API_KEY is read only here, server-side, never
// NEXT_PUBLIC_, never sent to the client.

import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

import fallback from "@/fixtures/fallback.json";
import rulepack from "@/data/rulepack.json";
import {
  DEFAULT_MODEL,
  SYSTEM_PROMPT,
  buildUserPrompt,
  parseAndValidate,
} from "@/lib/engine";
import type { Patient, ReconcileResponse, RulepackVersion } from "@/lib/types";

export const runtime = "nodejs";
// Never cache — every stage run is fresh.
export const dynamic = "force-dynamic";

// Cap the drama: if the model hasn't answered in this long, fall back.
const MODEL_TIMEOUT_MS = 9000;

function selectRules(version: RulepackVersion) {
  return version === "old" ? rulepack.old : rulepack.new;
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("engine timeout")), ms);
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

export async function POST(req: NextRequest) {
  // The fallback is ALWAYS a valid response — start there and only replace it
  // if the live engine succeeds end to end.
  let response: ReconcileResponse = fallback as ReconcileResponse;

  try {
    const body = (await req.json()) as {
      patient?: Patient;
      rulepackVersion?: RulepackVersion;
    };

    const patient = body.patient;
    const version: RulepackVersion =
      body.rulepackVersion === "old" ? "old" : "new";

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // No patient or no key -> nothing to run live; serve fallback.
    if (patient && apiKey) {
      const client = new Anthropic({ apiKey });
      const rules = selectRules(version);

      const msg = await withTimeout(
        client.messages.create({
          model: DEFAULT_MODEL,
          max_tokens: 1500,
          temperature: 0,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: buildUserPrompt(patient, rules) }],
        }),
        MODEL_TIMEOUT_MS
      );

      const text = msg.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");

      // Throws on any shape mismatch -> caught below -> fallback.
      response = parseAndValidate(text);
    }
  } catch (err) {
    // Swallow everything. The demo must not show an error. Log for the dev only.
    console.error("[reconcile] falling back:", err);
    response = fallback as ReconcileResponse;
  }

  return NextResponse.json(response, { status: 200 });
}
