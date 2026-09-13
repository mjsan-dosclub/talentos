"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [ledgerKey, setLedgerKey] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ledgerKey.trim()) {
      setFeedback("ACCESS_RESTRICTED // KEY REQUIRED FOR LEDGER VERIFICATION");
      return;
    }
    setFeedback("VERIFICATION_FAILED // IDENTIFIER NOT FOUND IN COHORT B3_2026 INDEX");
  };

  return (
    <div className="min-h-screen bg-[#0A0D12] text-neutral-200 font-sans selection:bg-neutral-800 selection:text-neutral-100 flex flex-col justify-between">
      {/* 1. Top Navigation / Ledger Bar */}
      <header className="border-b border-neutral-800/80 bg-[#0A0D12]/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          {/* Left: Status Indicator & Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span
              className="h-2 w-2 rounded-full bg-emerald-500 shrink-0"
              aria-hidden="true"
            />
            <span className="font-mono text-xs tracking-wider text-neutral-300 uppercase font-medium">
              DOS CLUB // TALENT_OS
            </span>
          </div>

          {/* Right: System Metadata & Sign In Link */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-neutral-500 tracking-wider">
              <span>COHORT: B3_2026</span>
              <span className="text-neutral-700">•</span>
              <span>INTEGRITY_CHECK: STRICT</span>
              <span className="text-neutral-700">•</span>
              <span>ACCESS: RESTRICTED</span>
            </div>

            <Link
              href="/login"
              className="font-mono text-xs text-neutral-300 hover:text-white px-3 py-1.5 border border-neutral-800 hover:border-neutral-700 bg-neutral-900/60 hover:bg-neutral-800/80 rounded transition-colors tracking-wide"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex flex-col justify-center gap-14 sm:gap-20">
        {/* 2. Hero Section (Curiosity-Driven) */}
        <section aria-label="Overview" className="flex flex-col items-start gap-6 max-w-4xl">
          {/* Small bordered badge */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-neutral-800 bg-neutral-900/60 font-mono text-[10px] sm:text-xs text-neutral-400 tracking-widest uppercase">
            CONFIDENTIAL LEDGER // NOT AN OPEN PORTAL
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-neutral-100 leading-[1.12]">
            Potential is difficult to see in a résumé.{" "}
            <span className="block text-neutral-400 mt-2 font-normal">
              TalentOS makes the 27-workshop journey visible.
            </span>
          </h1>

          {/* Subhead */}
          <p className="text-sm sm:text-base md:text-lg text-neutral-400 max-w-3xl leading-relaxed">
            A longitudinal student development and talent intelligence system documenting
            real engineering output, behavioral consistency, and production evidence. Built
            for elite cohorts across Tamil Nadu and global partners.
          </p>
        </section>

        {/* 3. The Three Principles (Minimal Bordered Grid - No Cards) */}
        <section aria-label="System Principles">
          <div className="border border-neutral-800 bg-[#0C1017]/40 divide-y sm:divide-y-0 sm:divide-x divide-neutral-800 grid grid-cols-1 sm:grid-cols-3">
            {/* 01 / OBSERVE */}
            <div className="p-6 sm:p-8 flex flex-col space-y-3">
              <div className="font-mono text-xs tracking-wider text-neutral-300 uppercase font-medium">
                01 / OBSERVE
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Dynamic geofencing and zero-grace session windows. We record presence and
                timely execution, not excuses.
              </p>
            </div>

            {/* 02 / EVIDENCE */}
            <div className="p-6 sm:p-8 flex flex-col space-y-3">
              <div className="font-mono text-xs tracking-wider text-neutral-300 uppercase font-medium">
                02 / EVIDENCE
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                No participation certificates. Repositories, artifacts, and practical deliverables
                undergo systematic audit.
              </p>
            </div>

            {/* 03 / EVOLVE */}
            <div className="p-6 sm:p-8 flex flex-col space-y-3">
              <div className="font-mono text-xs tracking-wider text-neutral-300 uppercase font-medium">
                03 / EVOLVE
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Designed to surface longitudinal consistency. Potential is proven through
                sustained output over months.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Gatekeeper Access Input (Curiosity Engine) */}
        <section aria-label="Gatekeeper Access" className="w-full max-w-2xl">
          <form onSubmit={handleVerify} className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center border border-neutral-800 bg-[#0C1017]/70 focus-within:border-neutral-600 transition-colors">
              <div className="hidden sm:flex items-center pl-3.5 text-neutral-600 font-mono text-xs select-none">
                &gt;
              </div>
              <input
                type="text"
                value={ledgerKey}
                onChange={(e) => {
                  setLedgerKey(e.target.value);
                  if (feedback) setFeedback(null);
                }}
                placeholder="ENTER DOS_ID OR RECRUITER LEDGER KEY"
                spellCheck={false}
                autoComplete="off"
                className="w-full bg-transparent px-3.5 py-3 font-mono text-xs text-neutral-200 placeholder:text-neutral-600 uppercase tracking-wider focus:outline-none"
              />
              <button
                type="submit"
                className="font-mono text-xs tracking-wider uppercase px-5 py-3 bg-neutral-800 text-neutral-300 hover:bg-neutral-200 hover:text-neutral-950 transition-colors duration-150 shrink-0 font-medium border-t sm:border-t-0 sm:border-l border-neutral-800"
              >
                Verify Ledger
              </button>
            </div>

            <p className="font-mono text-[11px] sm:text-xs text-neutral-500 tracking-wide leading-normal">
              Authorized institutional leads, recruiters, and registered cohort members only.
              Public registration is closed.
            </p>

            {feedback && (
              <p className="font-mono text-[11px] text-amber-500/90 tracking-wider">
                {feedback}
              </p>
            )}
          </form>
        </section>
      </main>

      {/* 5. Footer */}
      <footer className="border-t border-neutral-800/80 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center font-mono text-[11px] sm:text-xs text-neutral-500 tracking-wider">
          DESCIENCE OPEN SOURCE CLUB • SINGAPORE // CHENNAI • TALENT_OS V1
        </div>
      </footer>
    </div>
  );
}
