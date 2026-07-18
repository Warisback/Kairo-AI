"use client";

// The patient side of the loop — Margaret's phone. CLINICIAN-FIRST: the phone
// stays dark while Kairo builds the pack and the pharmacist adjudicates. It
// only lights up once the prescriber has approved-in-principle and sent the
// offer. Clinical copy always comes from the engine finding (hard rule #2).

import type { Finding } from "@/lib/types";
import type { Phase } from "@/lib/phases";
import { phaseIndex } from "@/lib/phases";
import { PhoneFrame } from "@/components/PhoneFrame";
import { KairoMark } from "@/components/ui";
import { PhoneAlert } from "@/components/scenes/PhoneAlert";
import { PatientOffer } from "@/components/patient/PatientOffer";
import { Delivery } from "@/components/scenes/Delivery";

export function PatientPhone({
  phase,
  finding,
  onOpen,
  onConsent,
  onRestart,
}: {
  phase: Phase;
  finding: Finding;
  onOpen: () => void;
  onConsent: () => void;
  onRestart: () => void;
}) {
  const i = phaseIndex(phase);
  const isDelivery = i >= phaseIndex("prescribed");
  const isOffer = phase === "offerOpened";
  const wallpaper = !isDelivery && !isOffer;

  let screen: React.ReactNode;
  if (i < phaseIndex("offered")) {
    // Dark until the prescriber has adjudicated and sent the offer.
    screen = <LockScreen />;
  } else if (phase === "offered") {
    screen = (
      <PhoneAlert
        title="Your prescriber has an option for you"
        preview={finding.patient_offer ?? finding.patient_explanation}
        onOpen={onOpen}
      />
    );
  } else if (phase === "offerOpened") {
    screen = <PatientOffer finding={finding} onConsent={onConsent} />;
  } else if (phase === "consented") {
    screen = <WaitingScreen />;
  } else {
    screen = <Delivery onRestart={onRestart} />;
  }

  return (
    <PhoneFrame wallpaper={wallpaper} statusDark={!wallpaper}>
      <div key={phase} className="h-full animate-fade-up">
        {screen}
      </div>
    </PhoneFrame>
  );
}

function LockScreen() {
  return (
    <div className="flex h-full flex-col items-center px-6 pb-10 pt-24 text-white">
      <div className="mt-8 text-center">
        <div className="text-[17px] font-medium text-white/80">
          Tuesday, 18 July
        </div>
        <div className="text-[76px] font-semibold leading-none tracking-tight drop-shadow">
          9:41
        </div>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-[13px] font-medium text-white/90 backdrop-blur">
        <KairoMark size={16} />
        Kairo is watching your medicines
      </div>
    </div>
  );
}

function WaitingScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 pb-10 pt-20 text-center text-white">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-white/30" />
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur">
          <KairoMark size={40} />
        </div>
      </div>
      <h1 className="mt-8 text-[24px] font-bold tracking-tight">
        Sent to your prescriber
      </h1>
      <p className="mt-2 max-w-[240px] text-[15px] leading-snug text-white/80">
        Thanks Margaret. Your prescriber will sign this off and your pharmacy
        will take it from there.
      </p>
    </div>
  );
}
