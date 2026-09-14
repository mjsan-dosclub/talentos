"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getClientSession, TalentosUser } from "@/lib/session";

export default function Home() {
  const router = useRouter();
  const [recordKey, setRecordKey] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [user, setUser] = useState<TalentosUser | null>(null);

  useEffect(() => {
    setUser(getClientSession());
  }, []);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordKey.trim()) {
      setFeedback("Please enter a Student ID (e.g. DOS-B3-001) or registered email address");
      return;
    }
    const cleanKey = recordKey.trim().toUpperCase();
    router.push(`/record/${encodeURIComponent(cleanKey)}`);
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "SUPER_ADMIN") return "/admin";
    if (user.role === "COLLEGE_ADMIN") return "/college";
    if (user.role === "TRAINER") return "/trainer";
    return `/record/${encodeURIComponent(user.dos_id || "DOS-B3-001")}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col justify-between">
      {/* 1. Top Navigation Bar (Clean SaaS Banner - NO Portal Tabs) */}
      <header className="bg-[#0f172a] text-white border-b border-slate-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/dos-club-logo.png"
              alt="DeScience Open Source Club"
              className="h-9 w-9 rounded-full object-cover ring-2 ring-emerald-500/40 shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/dos-club-logo.png";
              }}
            />
            <div className="flex flex-col">
              <span className="font-semibold text-base tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                DOS Club TalentOS
              </span>
              <span className="text-[11px] text-slate-400 font-normal tracking-wide hidden sm:inline">
                DeScience Open Source Club • Batch 3 Operating Ledger
              </span>
            </div>
          </Link>

          {/* Right: Auth Action CTA */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href={getDashboardLink()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center gap-2"
              >
                <span>Go to Dashboard</span>
                <span>&rarr;</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 text-xs font-semibold rounded-lg transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Sign In</span>
                <span>&rarr;</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex flex-col justify-center gap-12 sm:gap-16">
        {/* 2. Hero Section */}
        <section aria-label="Overview" className="flex flex-col items-start gap-5 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            27-Workshop Engineering Journey & Evidence OS
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
            Potential is difficult to see in a résumé.{" "}
            <span className="block text-emerald-700 mt-1 font-semibold">
              TalentOS makes the 27-workshop journey visible.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            A longitudinal student development and talent intelligence system documenting real engineering output,
            zero-grace attendance, behavioral consistency, and production evidence. Built for elite cohorts across Tamil Nadu and global partner institutions.
          </p>
        </section>

        {/* 3. Gatekeeper Search Input */}
        <section aria-label="Inspect Student Dossier" className="w-full max-w-2xl">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Direct Student 360 Verification
            </h2>
            <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm select-none">
                  🔍
                </span>
                <input
                  type="text"
                  value={recordKey}
                  onChange={(e) => {
                    setRecordKey(e.target.value);
                    if (feedback) setFeedback(null);
                  }}
                  placeholder="Enter Student ID (e.g. DOS-B3-001) or email"
                  spellCheck={false}
                  autoComplete="off"
                  className="w-full bg-white pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-2xs font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs shrink-0 cursor-pointer"
              >
                Inspect Dossier &rarr;
              </button>
            </form>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Try sample ID: <button type="button" onClick={() => setRecordKey("DOS-B3-001")} className="font-mono text-emerald-700 font-semibold underline cursor-pointer">DOS-B3-001</button></span>
              <span className="text-[11px] text-slate-400">Anna University Campus Partner</span>
            </div>

            {feedback && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-md font-medium">
                ⚠️ {feedback}
              </p>
            )}
          </div>
        </section>

        {/* 4. The Three Pillars */}
        <section aria-label="System Pillars" className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Observe & Geofence</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dynamic physical geofencing and zero-grace session windows. Presence and timely execution are immutably logged with coordinate timestamps.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Verifiable Evidence</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No hollow participation certificates. Repositories, git commits, and hermetic container test outcomes undergo systematic automated audits.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Talent Intelligence</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Surfaces longitudinal consistency across 27 rigorous curriculum phases, technical standout recognition, and production engineering maturity.
            </p>
          </div>
        </section>
      </main>

      {/* 5. Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/dos-club-logo.png" alt="DOS Club" className="h-6 w-6 rounded-full" />
            <span className="font-semibold text-slate-700">DeScience Open Source Club</span>
            <span className="text-slate-300">•</span>
            <span>TalentOS Platform V1</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-slate-900 transition-colors font-medium">
              Sign In
            </Link>
            <span className="text-slate-300">•</span>
            <span>Tamil Nadu & Global Partner Network</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
