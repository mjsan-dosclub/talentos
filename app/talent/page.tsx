"use client";

import Link from "next/link";

export default function TalentPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFB] text-neutral-900 font-sans selection:bg-neutral-200 selection:text-neutral-900 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-neutral-200/90 bg-white/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-mono text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <span className="text-neutral-400">&larr;</span>
            <span className="h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
            <span className="tracking-wider uppercase font-medium">DOS CLUB // TALENT_OS</span>
          </Link>

          <div className="flex items-center gap-4 font-mono text-xs">
            <Link href="/trainer" className="text-neutral-600 hover:text-neutral-900">
              Trainer Portal
            </Link>
            <Link href="/college" className="text-neutral-600 hover:text-neutral-900">
              College Portal
            </Link>
            <Link href="/admin" className="text-neutral-600 hover:text-neutral-900">
              Admin Console
            </Link>
          </div>
        </div>
      </header>

      {/* Main Notice */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-16 sm:py-24 flex flex-col justify-center gap-8">
        <div className="border border-neutral-200 bg-white p-8 sm:p-10 shadow-2xs flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-amber-300 bg-amber-50 font-mono text-[11px] text-amber-800 tracking-wider uppercase font-medium self-start">
            SCOPE SPECIFICATION // PRD SECTION 27
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950">
              Recruiter Portal Excluded From V1
            </h1>
            <p className="font-mono text-xs text-neutral-500">
              STATUS: SCHEDULED FOR V2 RELEASE // ACCESS DEFERRED
            </p>
          </div>

          <div className="font-mono text-xs text-neutral-600 leading-relaxed flex flex-col gap-3 pt-3 border-t border-neutral-100">
            <p>
              In strict compliance with the DOS Club TalentOS Product Requirements Document (PRD Section 5 & Section 27),
              <strong> Recruiter access is explicitly excluded from the V1 production release</strong>.
            </p>
            <p>
              TalentOS V1 is solely dedicated to student development, longitudinal execution tracking, zero-grace attendance,
              deliverable auditing, and institutional reporting.
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row gap-3">
            <Link
              href="/record/DOS-B3-001"
              className="py-2.5 px-4 bg-neutral-900 text-white hover:bg-neutral-800 font-mono text-xs uppercase tracking-wider font-semibold text-center transition-colors shadow-2xs"
            >
              Inspect Student 360 Record &rarr;
            </Link>
            <Link
              href="/"
              className="py-2.5 px-4 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 font-mono text-xs uppercase tracking-wider text-center transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center font-mono text-[11px] text-neutral-500 tracking-wider">
          DESCIENCE OPEN SOURCE CLUB • SINGAPORE // CHENNAI • TALENT_OS V1
        </div>
      </footer>
    </div>
  );
}
