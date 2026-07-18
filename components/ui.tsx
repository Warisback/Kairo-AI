"use client";

// Shared, drug-agnostic presentational primitives. No clinical copy here.

import { ButtonHTMLAttributes, ReactNode } from "react";

/** Kairo mark — a re-check loop. Calm, single-colour. */
export function KairoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="15" className="fill-kairo-500" />
      <path
        d="M22.5 12.2A8 8 0 108.2 18.5"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M22.9 8.4l.5 4.2-4.2.5"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function BrandRow({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <KairoMark size={26} />
      <div className="leading-none">
        <div className="text-[19px] font-bold tracking-tight text-ink">Kairo</div>
        {subtitle && (
          <div className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

export function PrimaryButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full rounded-2xl bg-kairo-500 px-6 py-4 text-[17px] font-semibold text-white shadow-lg shadow-kairo-500/30 transition active:scale-[0.98] hover:bg-kairo-600 disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="w-full rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-[16px] font-semibold text-slate-500 transition active:scale-[0.98] disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "clear" | "flag" | "kairo";
}) {
  const tones = {
    neutral: "bg-slate-100 text-slate-600",
    clear: "bg-clear-50 text-clear-700",
    flag: "bg-flag-50 text-flag-700",
    kairo: "bg-kairo-50 text-kairo-700",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function CheckRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-clear-100 text-clear-700">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.5 6.2l2.3 2.3 4.7-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div className="text-[15px] leading-snug text-slate-700">
        <span className="font-semibold text-ink">{label}</span> {value}
      </div>
    </div>
  );
}
