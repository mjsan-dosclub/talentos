"use client";

import Link from "next/link";
import AppHeader from "@/components/AppHeader";

export default function TalentPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col justify-between">
      {/* 1. Global AppHeader (NO top-bar navigation) */}
      <AppHeader />

      {/* Main Notice */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-16 sm:py-24 flex flex-col justify-center gap-8">
        <div className="border border-slate-200 bg-white p-8 sm:p-10 rounded-2xl shadow-sm flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-200 bg-amber-50 text-xs font-semibold text-amber-800 self-start">
            <span>📋</span>
            <span>V1 Release Scope Specification</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Recruiter Portal Excluded From V1
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              STATUS: SCHEDULED FOR V2 RELEASE • ACCESS DEFERRED
            </p>
          </div>

          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed flex flex-col gap-3 pt-3 border-t border-slate-100">
            <p>
              In accordance with the DOS Club TalentOS Product Architecture,
              <strong> Recruiter access is explicitly excluded from the V1 release</strong>.
            </p>
            <p>
              TalentOS V1 is dedicated solely to student growth, longitudinal engineering evidence,
              zero-grace attendance, deliverable verification, and institutional governance.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <Link
              href="/record/DOS-B3-001"
              className="py-2.5 px-4 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-lg text-center transition-colors shadow-xs"
            >
              Inspect Student 360 Record &rarr;
            </Link>
            <Link
              href="/"
              className="py-2.5 px-4 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg text-center transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/dos-club-logo.png" alt="DOS Club" className="h-5 w-5 rounded-full" />
            <span className="font-semibold text-slate-700">DeScience Open Source Club</span>
            <span className="text-slate-300">•</span>
            <span>TalentOS Platform V1</span>
          </div>
          <span className="text-slate-400">Singapore // Chennai • Tamil Nadu Campus Hubs</span>
        </div>
      </footer>
    </div>
  );
}
