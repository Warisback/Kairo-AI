"use client";

// The patient offer + shared-decision + consent screen. Shown ONLY after a
// prescriber has adjudicated the pack (clinician-first). The offer framing and
// the narrow structured questions come from the engine finding — never
// hardcoded clinical copy. Consent is a real choice; nothing is pre-decided.

import { useState } from "react";
import type { Finding } from "@/lib/types";
import { BrandRow, PrimaryButton, Pill } from "@/components/ui";

export function PatientOffer({
  finding,
  onConsent,
}: {
  finding: Finding;
  onConsent: () => void;
}) {
  const offer = finding.patient_offer ?? finding.patient_explanation;
  const questions = finding.structured_questions ?? [];
  const [answers, setAnswers] = useState<Record<number, "yes" | "no">>({});

  return (
    <div className="flex h-full flex-col px-6 pb-8 pt-16">
      <BrandRow subtitle="From your prescriber" />

      <div className="mt-6">
        <div className="mb-2 flex flex-wrap gap-2">
          <Pill tone="clear">✓ Reviewed by a clinician</Pill>
          <Pill tone="kairo">Your choice</Pill>
        </div>
        <h1 className="text-[26px] font-bold leading-tight tracking-tight text-ink">
          An option for you
        </h1>
      </div>

      <div className="mt-4 flex-1 space-y-4 overflow-y-auto no-scrollbar">
        <p className="text-[18px] leading-relaxed text-slate-700">{offer}</p>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-400">
            What it does
          </div>
          <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600">
            {finding.recommended_action}
          </p>
        </div>

        {questions.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-slate-400">
              A couple of quick questions
            </div>
            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={i}>
                  <p className="text-[14px] leading-snug text-slate-700">{q}</p>
                  <div className="mt-1.5 flex gap-2">
                    {(["yes", "no"] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() =>
                          setAnswers((a) => ({ ...a, [i]: opt }))
                        }
                        className={`rounded-full px-4 py-1.5 text-[13px] font-semibold capitalize transition ${
                          answers[i] === opt
                            ? "bg-kairo-500 text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-4">
        <PrimaryButton onClick={onConsent}>Yes — I’d like to go ahead</PrimaryButton>
        <button className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-6 py-3 text-[15px] font-semibold text-slate-500">
          I’d like to talk it through first
        </button>
      </div>
    </div>
  );
}
