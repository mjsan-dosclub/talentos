"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [ledgerKey, setLedgerKey] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ledgerKey.trim()) {
      setFeedback("ACCESS_RESTRICTED // KEY OR EMAIL REQUIRED FOR LEDGER VERIFICATION");
      return;
    }
    const cleanKey = ledgerKey.trim().toUpperCase();
    router.push(`/ledger/${encodeURIComponent(cleanKey)}`);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-neutral-900 font-sans selection:bg-neutral-200 selection:text-neutral-900 flex flex-col justify-between">
      {/* 1. Top Navigation / Ledger Bar */}
      <header className="border-b border-neutral-200/90 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          {/* Left: Status Indicator & Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span
              className="h-2 w-2 rounded-full bg-emerald-600 shrink-0"
              aria-hidden="true"
            />
            <span className="font-mono text-xs tracking-wider text-neutral-900 uppercase font-medium">
              DOS CLUB // TALENT_OS
            </span>
          </div>

          {/* Right: System Metadata & Sign In Link */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-neutral-500 tracking-wider">
              <span>BATCH: 03</span>
              <span className="text-neutral-300">•</span>
              <span>INTEGRITY_CHECK: STRICT</span>
              <span className="text-neutral-300">•</span>
              <span>ACCESS: RESTRICTED</span>
            </div>

            <Link
              href="/login"
              className="font-mono text-xs text-neutral-900 hover:text-black px-3.5 py-1.5 border border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50 rounded transition-colors tracking-wide font-medium shadow-2xs"
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-neutral-200 bg-neutral-100 font-mono text-[10px] sm:text-xs text-neutral-700 tracking-widest uppercase font-medium">
            CONFIDENTIAL LEDGER // NOT AN OPEN PORTAL
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-neutral-950 leading-[1.12]">
            Potential is difficult to see in a résumé.{" "}
            <span className="block text-neutral-500 mt-2 font-normal">
              TalentOS makes the 27-workshop journey visible.
            </span>
          </h1>

          {/* Subhead */}
          <p className="text-sm sm:text-base md:text-lg text-neutral-600 max-w-3xl leading-relaxed">
            A longitudinal student development and talent intelligence system documenting
            real engineering output, behavioral consistency, and production evidence. Built
            for Batch 3 across Tamil Nadu and global partners.
          </p>
        </section>

        {/* 3. The Three Principles (Minimal Bordered Grid - No Cards) */}
        <section aria-label="System Principles">
          <div className="border border-neutral-200 bg-white divide-y sm:divide-y-0 sm:divide-x divide-neutral-200 grid grid-cols-1 sm:grid-cols-3 shadow-2xs">
            {/* 01 / OBSERVE */}
            <div className="p-6 sm:p-8 flex flex-col space-y-3">
              <div className="font-mono text-xs tracking-wider text-neutral-900 uppercase font-semibold">
                01 / OBSERVE
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Dynamic geofencing and zero-grace session windows. We record presence and
                timely execution, not excuses.
              </p>
            </div>

            {/* 02 / EVIDENCE */}
            <div className="p-6 sm:p-8 flex flex-col space-y-3">
              <div className="font-mono text-xs tracking-wider text-neutral-900 uppercase font-semibold">
                02 / EVIDENCE
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                No participation certificates. Repositories, artifacts, and practical deliverables
                undergo systematic audit.
              </p>
            </div>

            {/* 03 / EVOLVE */}
            <div className="p-6 sm:p-8 flex flex-col space-y-3">
              <div className="font-mono text-xs tracking-wider text-neutral-900 uppercase font-semibold">
                03 / EVOLVE
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Designed to surface longitudinal consistency. Potential is proven through
                sustained output over months.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Gatekeeper Access Input (Curiosity Engine) */}
        <section aria-label="Gatekeeper Access" className="w-full max-w-2xl">
          <form onSubmit={handleVerify} className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center border border-neutral-300 bg-white focus-within:border-neutral-600 transition-colors shadow-2xs">
              <div className="hidden sm:flex items-center pl-3.5 text-neutral-400 font-mono text-xs select-none">
                &gt;
              </div>
              <input
                type="text"
                value={ledgerKey}
                onChange={(e) => {
                  setLedgerKey(e.target.value);
                  if (feedback) setFeedback(null);
                }}
                placeholder="ENTER DOS_ID, EMAIL, OR RECRUITER LEDGER KEY"
                spellCheck={false}
                autoComplete="off"
                className="w-full bg-transparent px-3.5 py-3 font-mono text-xs text-neutral-900 placeholder:text-neutral-400 uppercase tracking-wider focus:outline-none"
              />
              <button
                type="submit"
                className="font-mono text-xs tracking-wider uppercase px-5 py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors duration-150 shrink-0 font-medium border-t sm:border-t-0 sm:border-l border-neutral-200"
              >
                Verify Ledger
              </button>
            </div>

            <p className="font-mono text-[11px] sm:text-xs text-neutral-500 tracking-wide leading-normal">
              Authorized institutional leads, recruiters, and registered Members only.
              Public registration is closed.
            </p>

            {feedback && (
              <p className="font-mono text-[11px] text-amber-700 tracking-wider font-medium">
                {feedback}
              </p>
            )}
          </form>
        </section>
      </main>

      {/* 5. Footer */}
      <footer className="border-t border-neutral-200 bg-white py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center font-mono text-[11px] sm:text-xs text-neutral-500 tracking-wider">
          DESCIENCE OPEN SOURCE CLUB • SINGAPORE // CHENNAI • TALENT_OS V1
        </div>
      </footer>
    </div>
  );
}
