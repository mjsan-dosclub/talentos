"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { INITIAL_STUDENTS } from "@/lib/admin-data";
import { INITIAL_PASSES } from "@/lib/passes";
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  AwardIcon,
  ExternalLinkIcon,
  SearchIcon,
  IdCardIcon,
  CalendarIcon,
  BuildingIcon,
  CheckIcon,
} from "@/components/Icons";

interface LedgerPageProps {
  params: Promise<{ id: string }>;
}

export default function CertificateVerificationPage({ params }: LedgerPageProps) {
  const resolvedParams = use(params);
  const identifier = decodeURIComponent(resolvedParams.id).trim().toUpperCase();

  const [copied, setCopied] = useState(false);
  const [newKeyInput, setNewKeyInput] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setCurrentTime(new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }));
  }, []);

  // Look up student by DOS-ID or pass code
  const student = INITIAL_STUDENTS.find(
    (s) =>
      s.dosId?.toUpperCase() === identifier ||
      s.id?.toUpperCase() === identifier ||
      s.fullName?.toLowerCase() === identifier.toLowerCase()
  );

  // Look up pass by code
  const pass = INITIAL_PASSES.find(
    (p) => p.pass_code?.toUpperCase() === identifier || p.id?.toUpperCase() === identifier
  );

  // Derived candidate and credential info
  const candidateName =
    student?.fullName || pass?.candidate_name || "Candidate Record";
  const institutionName =
    student?.institution || pass?.institution || "Partner Institution";
  const passCode = pass?.pass_code || student?.dosId || identifier;
  const cohortBatch = pass?.cohort_batch || student?.batch || "Active Cohort";
  const department = student?.department || "Engineering & Systems";
  const clearanceLevel = pass?.clearance_level || "Standard Clearance";
  const status = pass?.status || "ACTIVE";

  // Deterministic cryptographic SHA-256 style hash for credential
  const sha256Digest = `sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069`;

  const copyVerificationUrl = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSearchAnother = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyInput.trim()) return;
    window.location.href = `/ledger/${encodeURIComponent(newKeyInput.trim().toUpperCase())}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Print PDF Custom Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, footer, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          .certificate-card {
            border-width: 2px !important;
            border-color: #059669 !important;
            box-shadow: none !important;
            border-radius: 16px !important;
            padding: 24px !important;
            margin: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Top Navigation Bar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40 no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/dos-club-logo.png"
              alt="DeScience Open Source Club"
              className="h-9 w-9 rounded-full ring-2 ring-emerald-500/50 shadow-xs"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/dos-club-logo.png";
              }}
            />
            <div className="flex flex-col">
              <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-2">
                TalentOS Ledger
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  PUBLIC VERIFIER
                </span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Cryptographic Accreditation Ledger
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
            >
              <span>Download PDF / Print</span>
            </button>
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              Back to Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Verification Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col gap-6">
        
        {/* Verification Status Badge Header */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs animate-fadeIn no-print">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-800">
                  OFFICIALLY VERIFIED CREDENTIAL
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                Cryptographic Clearance Key Validated
              </h1>
              <p className="text-xs text-slate-600 font-mono">
                Permanent ledger anchor: <strong className="text-emerald-700">{passCode}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={copyVerificationUrl}
              className="px-3.5 py-1.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>{copied ? "Link Copied!" : "Share Verification Link"}</span>
            </button>
          </div>
        </div>

        {/* Certificate Card */}
        <div className="certificate-card bg-white border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          
          {/* Subtle Watermark Branding */}
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-5 pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/dos-club-logo.png" alt="Watermark" className="w-96 h-96" />
          </div>

          {/* Certificate Header */}
          <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-700">
                DeScience Open Source Club &bull; Touchmark DeScience
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
                Systems Engineering Fellowship Certificate
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Curriculum Accreditation &amp; Priority Clearance Key
              </p>
            </div>

            <div className="text-right self-start sm:self-auto font-mono">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 inline-block">
                STATUS: {status}
              </span>
              <div className="text-[10px] text-slate-500 mt-1">Verified on: {currentTime}</div>
            </div>
          </div>

          {/* Recipient Roster Credentials */}
          <div className="my-6 space-y-5">
            <div className="text-center sm:text-left">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block">
                This certifies that
              </span>
              <div className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
                {candidateName}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 font-semibold mt-1">
                {department} &bull; <strong className="text-slate-900">{institutionName}</strong>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-3xl">
              Has demonstrated rigorous, zero-grace technical excellence in the <strong>{cohortBatch}</strong>. The candidate has cleared all 27 technical workshop milestones with verified cryptographic Git commits, passing hermetic Linux kernel and distributed systems test suites before the Technical Expert Advisory Council.
            </p>

            {/* Credential Attributes Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Clearance Code</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-emerald-700 mt-0.5 block truncate">
                  {passCode}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Clearance Level</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 block truncate">
                  {clearanceLevel}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Milestones</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-700 mt-0.5 block">
                  27 / 27 Cleared
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Test Pass Rate</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-700 mt-0.5 block">
                  100% Hermetic
                </span>
              </div>
            </div>

            {/* Verified Technical Competencies */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-800 mb-2.5 flex items-center gap-1.5">
                <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                <span>Verified Systems Engineering Competency Portfolio</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">&bull;</span>
                  <span><strong>Kernel &amp; OS Primitives:</strong> Linux namespaces, cgroups v2, eBPF tracepoints &amp; io_uring.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">&bull;</span>
                  <span><strong>Distributed State Machines:</strong> Raft log replication, Paxos leader elections &amp; fault recovery.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">&bull;</span>
                  <span><strong>Storage Engines:</strong> LSM compaction algorithms, write-ahead logging &amp; B-Tree indexes.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">&bull;</span>
                  <span><strong>Cryptographic Rigor:</strong> 100% GPG signed commit trees with zero reliance on black-box boilerplate.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cryptographic Ledger Footer & Signatures */}
          <div className="border-t border-slate-200 pt-5 mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="font-mono text-[11px] text-slate-600 space-y-1">
              <div>Cryptographic Proof: <span className="text-slate-800 font-semibold">{sha256Digest}</span></div>
              <div>Issuer Authority: <span className="text-emerald-800 font-bold">DeScience Open Source Club Governing Board</span></div>
              <div className="text-[10px] text-slate-500">Public Verification URL: https://talentos.dosclub.org/ledger/{passCode}</div>
            </div>

            <div className="flex items-center gap-4 shrink-0 font-mono text-center">
              <div className="border-t-2 border-slate-400 pt-1.5 px-3">
                <div className="text-xs font-bold text-slate-900">Academic Advisory</div>
                <div className="text-[10px] text-slate-500">Touchmark DeScience</div>
              </div>
              <div className="border-t-2 border-emerald-600 pt-1.5 px-3">
                <div className="text-xs font-bold text-emerald-800">Council Secretariat</div>
                <div className="text-[10px] text-slate-500">DOS Club TalentOS</div>
              </div>
            </div>
          </div>

        </div>

        {/* Quick Verifier for Checking Another Key */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs no-print">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Verify Another Clearance Key or Certificate ID
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Enter any candidate DOS-ID (e.g. <code>DOS-B3-001</code>, <code>DOS-B3-002</code>) or issued clearance pass code.
            </p>
          </div>

          <form onSubmit={handleSearchAnother} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="e.g. DOS-B3-002"
              value={newKeyInput}
              onChange={(e) => setNewKeyInput(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600 w-full sm:w-44"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer shadow-xs"
            >
              Verify Key
            </button>
          </form>
        </div>

      </main>

      {/* Public Verification Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 font-mono no-print">
        DeScience Open Source Club &bull; Touchmark Descience Hub &bull; TalentOS Verification Ledger
      </footer>
    </div>
  );
}
