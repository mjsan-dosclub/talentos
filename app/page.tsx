"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getClientSession, TalentosUser } from "@/lib/session";
import {
  SearchIcon,
  AlertTriangleIcon,
  ShieldCheckIcon,
  BoltIcon,
  CodeIcon,
  CheckCircleIcon,
  ActivityIcon,
  TerminalIcon,
  LayersIcon,
  CpuIcon,
  MapPinIcon,
  AwardIcon,
  ClockIcon,
  UsersIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  CheckIcon,
} from "@/components/Icons";

export default function Home() {
  const router = useRouter();
  const [recordKey, setRecordKey] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [user, setUser] = useState<TalentosUser | null>(null);

  // Interactive Live Engine Telemetry state
  const [engineTab, setEngineTab] = useState<"geofence" | "git" | "curriculum" | "honors">("geofence");

  // Aspirant Enquiry Form state
  const [enquiryForm, setEnquiryForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    institution: "",
    yearAndDept: "3rd Year - B.Tech CSE",
    track: "AI Infrastructure & Agentic Systems",
    statement: "",
  });
  const [enquiryStatus, setEnquiryStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [enquiryRef, setEnquiryRef] = useState<string | null>(null);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

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

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquiryStatus("loading");
    setEnquiryError(null);

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enquiryForm),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setEnquiryStatus("success");
        setEnquiryRef(data.enquiryId || "ENQ-2026-CONFIRMED");
      } else {
        setEnquiryStatus("error");
        setEnquiryError(data.error || "Failed to submit enquiry. Please try again or join directly via the membership portal.");
      }
    } catch {
      setEnquiryStatus("error");
      setEnquiryError("Network connection error. Please try again or use the official membership portal.");
    }
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "SUPER_ADMIN") return "/admin";
    if (user.role === "COLLEGE_ADMIN") return "/college";
    if (user.role === "TRAINER") return "/trainer";
    return `/record/${encodeURIComponent(user.dos_id || "DOS-B3-001")}`;
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 relative overflow-x-hidden flex flex-col justify-between">
      {/* Ambient background glow and grid lines (WorkOS Atlas aesthetic) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.14),transparent_65%)]" />
        <div className="absolute top-[550px] right-[-100px] w-[600px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.08),transparent_60%)]" />
        <div className="absolute bottom-[200px] left-[-150px] w-[700px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.07),transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* 1. Top Navigation Bar (Atlas Style) */}
      <header className="bg-[#070B14]/85 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Left: Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/dos-club-logo.png"
              alt="DeScience Open Source Club"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/30 group-hover:ring-emerald-400 transition-all shadow-lg shadow-emerald-950/40"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/dos-club-logo.png";
              }}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                  TalentOS
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden sm:inline">
                  DeScience OS Club
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium hidden md:inline">
                The Student Passport to the AI World • Cohort 2026
              </span>
            </div>
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-medium text-slate-400">
            <a href="#behind-the-gate" className="hover:text-emerald-300 transition-colors">
              Engine Behind the Gate
            </a>
            <a href="#priority-lounge" className="hover:text-emerald-300 transition-colors">
              The Priority Lounge
            </a>
            <a href="#verify-gate" className="hover:text-emerald-300 transition-colors">
              Verify Dossier
            </a>
            <a href="#enquire" className="hover:text-emerald-300 transition-colors">
              Admissions Enquiry
            </a>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Become a Member CTA (Target URL: https://membership.descienceosclub.com/) */}
            <a
              href="https://membership.descienceosclub.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/25 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Become a Member</span>
              <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* Portal Login */}
            {user ? (
              <Link
                href={getDashboardLink()}
                className="px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 text-xs font-medium rounded-lg transition-all"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-xs font-medium rounded-lg transition-all hidden sm:inline"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Landing Canvas */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col gap-24 sm:gap-32">
        {/* =========================================================================
            SECTION 1: HERO SECTION - The Student Passport to the AI World
            ========================================================================= */}
        <section aria-label="Passport Overview" className="flex flex-col items-center text-center gap-7 pt-4 sm:pt-8 max-w-4xl mx-auto">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-inner shadow-emerald-950/40">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>THE STUDENT PASSPORT TO THE AI WORLD // COHORT 2026 OPERATING LEDGER</span>
          </div>

          {/* Inspiring WorkOS Atlas Style Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            Not seen as freshers anymore.{" "}
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              The engineering passport industry trusts without hesitation.
            </span>
          </h1>

          {/* Subheadline: Curating the Airport Lounge Priority Feeling */}
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl leading-relaxed font-normal">
            While the general public waits in resume black holes with unverified claims, DeScience Open Source Club members hold an immutable digital passport:
            <span className="text-white font-medium"> 27 deep-tech systems workshops</span>,
            <span className="text-white font-medium"> zero-grace physical geofencing</span>, and
            <span className="text-white font-medium"> verified production code</span>.
            Students are honoured for real commitment and hired as day-one engineering colleagues.
          </p>

          {/* Call to Action Group */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-3 w-full sm:w-auto">
            {/* Primary: Become a Member */}
            <a
              href="https://membership.descienceosclub.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Become a Member</span>
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            {/* Secondary: Enquiry Form Jump */}
            <a
              href="#enquire"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Request Cohort Admission</span>
              <span className="text-slate-400">&darr;</span>
            </a>

            {/* Tertiary: Verify Dossier Demo */}
            <a
              href="#verify-gate"
              className="w-full sm:w-auto px-5 py-3.5 text-xs text-slate-400 hover:text-emerald-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <SearchIcon className="w-3.5 h-3.5" />
              <span>Inspect Student 360</span>
            </a>
          </div>

          {/* Proof Badges Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full pt-8 border-t border-slate-800/80 mt-4 text-left">
            <div className="bg-slate-900/40 border border-slate-800/70 rounded-xl p-3.5 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                <BoltIcon className="w-3.5 h-3.5" />
                <span>27 Deep Workshops</span>
              </div>
              <p className="text-[11px] text-slate-400">Low-level Linux, Raft, SIMD, eBPF & AI Infra.</p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/70 rounded-xl p-3.5 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                <MapPinIcon className="w-3.5 h-3.5" />
                <span>Zero-Grace Presence</span>
              </div>
              <p className="text-[11px] text-slate-400">120m physical geofencing with hardware timestamps.</p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/70 rounded-xl p-3.5 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                <ShieldCheckIcon className="w-3.5 h-3.5" />
                <span>Zero Double-Thinking</span>
              </div>
              <p className="text-[11px] text-slate-400">Staff engineers verify commits & test suites directly.</p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/70 rounded-xl p-3.5 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                <AwardIcon className="w-3.5 h-3.5" />
                <span>Not Freshers</span>
              </div>
              <p className="text-[11px] text-slate-400">Treated as experienced engineering colleagues day one.</p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: BEHIND THE GATE - INTERACTIVE LIVE ENGINE TELEMETRY
            Show difference between the public landing page and the verified engine
            ========================================================================= */}
        <section id="behind-the-gate" aria-label="Engine Telemetry" className="flex flex-col gap-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="flex flex-col gap-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <ActivityIcon className="w-4 h-4 text-emerald-400" />
                <span>Under The Hood // Real-Time Telemetry</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
                Something powerful runs behind this landing page.
              </h2>
              <p className="text-sm sm:text-base text-slate-400">
                While public visitors see only a clean interface, the TalentOS engine is actively computing
                physical proximity attestations, code commit integrity, and longitudinal systems maturity.
              </p>
            </div>

            {/* CTA anchor */}
            <div className="shrink-0">
              <a
                href="https://membership.descienceosclub.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span>Unlock Member Engine Access</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Interactive Simulation Frame (Atlas Console Visual) */}
          <div className="rounded-2xl border border-slate-800 bg-[#090E1A]/95 shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Terminal Window Top Bar */}
            <div className="bg-[#0D1527] px-4 py-3 border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
              {/* Window Controls & Title */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <div className="h-4 w-[1px] bg-slate-700/60 hidden sm:block" />
                <span className="text-xs font-mono font-semibold text-slate-300 tracking-wide flex items-center gap-2">
                  <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>talentos-engine-daemon // batch-3-kernel</span>
                </span>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>ENFORCING ZERO-GRACE INVARIANTS</span>
              </div>
            </div>

            {/* Interactive Scenario Tabs */}
            <div className="bg-[#0B1222] border-b border-slate-800/80 px-4 py-2 flex flex-wrap items-center gap-2 text-xs font-medium">
              <button
                type="button"
                onClick={() => setEngineTab("geofence")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  engineTab === "geofence"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <MapPinIcon className="w-3.5 h-3.5" />
                <span>1. Geofenced Presence</span>
              </button>

              <button
                type="button"
                onClick={() => setEngineTab("git")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  engineTab === "git"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <CodeIcon className="w-3.5 h-3.5" />
                <span>2. Production Git Ledger</span>
              </button>

              <button
                type="button"
                onClick={() => setEngineTab("curriculum")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  engineTab === "curriculum"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <LayersIcon className="w-3.5 h-3.5" />
                <span>3. 27-Workshop Mastery</span>
              </button>

              <button
                type="button"
                onClick={() => setEngineTab("honors")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  engineTab === "honors"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <AwardIcon className="w-3.5 h-3.5" />
                <span>4. Industry Endorsement</span>
              </button>
            </div>

            {/* Tab Display Area */}
            <div className="p-5 sm:p-7 min-h-[340px] flex flex-col justify-between font-mono text-xs">
              {engineTab === "geofence" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-emerald-400 font-bold">[RADAR]</span>
                      <span>Micro-Geofence Node: Anna University Campus Hub (13.0110° N, 80.2354° E)</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">Radius: 120m // Max Drift Allowed: 0.00m</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">Hardware Attestation</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        <span>TEE Enclave Verified</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Mock location & VPN spoofing impossible</span>
                    </div>
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">Zero-Grace Window</span>
                      <span className="text-white font-bold">08:30:00 IST Cutoff</span>
                      <span className="text-[10px] text-slate-400">0.0-minute leeway. 100% disciplined rigor</span>
                    </div>
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">Current Verified Batch</span>
                      <span className="text-emerald-400 font-bold">48 / 50 Enrolled Students In Seat</span>
                      <span className="text-[10px] text-slate-400">Audited by DeScience Staff Engineers</span>
                    </div>
                  </div>

                  {/* Telemetry Stream Log */}
                  <div className="bg-black/60 rounded-xl p-4 border border-slate-800/80 text-slate-300 space-y-1.5 text-[11px] overflow-x-auto">
                    <p className="text-slate-400">// Stream of cryptographic presence attestations recorded into Supabase ledger</p>
                    <p>
                      <span className="text-slate-400">[08:14:22 IST]</span> <span className="text-cyan-400">DOS-B3-009</span> checked in: <span className="text-emerald-400">VERIFIED (13.0112 N, 80.2351 E)</span> • Delta: 18.2m • Latency: 42ms
                    </p>
                    <p>
                      <span className="text-slate-400">[08:21:05 IST]</span> <span className="text-cyan-400">DOS-B3-001</span> checked in: <span className="text-emerald-400">VERIFIED (13.0108 N, 80.2356 E)</span> • Delta: 24.1m • Latency: 38ms
                    </p>
                    <p>
                      <span className="text-slate-400">[08:29:48 IST]</span> <span className="text-cyan-400">DOS-B3-004</span> checked in: <span className="text-emerald-400">VERIFIED (13.0114 N, 80.2350 E)</span> • Delta: 32.0m • Latency: 51ms
                    </p>
                    <p className="text-amber-400/90">
                      <span className="text-slate-400">[08:30:01 IST]</span> Zero-grace gate locked. Any late check-in strictly rejected without exception.
                    </p>
                  </div>
                </div>
              )}

              {engineTab === "git" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-cyan-400 font-bold">[CI-AUDIT]</span>
                      <span>Hermetic Container Sandboxing // Zero-Mock Code Standard</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">Docker v26.1 Runtime Engine</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">Commit Attestation</span>
                      <span className="text-emerald-400 font-bold">SHA-256 Verified</span>
                      <span className="text-[10px] text-slate-400">Cryptographically signed GPG commits</span>
                    </div>
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">Concurrency Audit</span>
                      <span className="text-emerald-400 font-bold">0 Race Conditions</span>
                      <span className="text-[10px] text-slate-400">Tested under heavy thread contention (-race)</span>
                    </div>
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-1">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">Test Suite Coverage</span>
                      <span className="text-emerald-400 font-bold">248 / 248 Passing</span>
                      <span className="text-[10px] text-slate-400">Zero skipped assertions or mock mocks</span>
                    </div>
                  </div>

                  <div className="bg-black/60 rounded-xl p-4 border border-slate-800/80 text-slate-300 space-y-1.5 text-[11px] overflow-x-auto">
                    <p className="text-slate-400">// Sample automated build verification pipeline execution output</p>
                    <p className="text-emerald-400">
                      $ docker run --network=none --read-only audit/student-build:DOS-B3-009
                    </p>
                    <p className="text-slate-300">
                      ==&gt; Running Raft consensus log replication stress test (1,000,000 tx/sec)...
                    </p>
                    <p className="text-emerald-300">
                      PASS: Leader election under partitioned network (converged in 142ms)
                    </p>
                    <p className="text-emerald-300">
                      PASS: State machine snapshot restoration (0 corrupted blocks)
                    </p>
                    <p className="text-cyan-400">
                      Audit Hash: 9f82ab300c14... Stamped to Student 360 Ledger.
                    </p>
                  </div>
                </div>
              )}

              {engineTab === "curriculum" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-emerald-400 font-bold">[27-PHASE RADAR]</span>
                      <span>Longitudinal Systems Mastery Curve</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">Batch 3 Current Phase: WS-14 Resilient Microservices</span>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-xs">Phase 1: Operating Systems & POSIX Kernel Internals (WS 01-09)</span>
                        <span className="text-[10px] text-slate-400">Linux syscalls, virtual memory page tables, epoll sockets, LSM storage engine</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold shrink-0 self-start sm:self-auto">
                        100% AUDITED
                      </span>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-xs">Phase 2: Distributed Systems & Consensus (WS 10-18)</span>
                        <span className="text-[10px] text-slate-400">Raft consensus, vector clocks, Paxos quorums, OpenTelemetry, Kafka streaming</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-400 text-[10px] font-bold shrink-0 self-start sm:self-auto">
                        ACTIVE IN PROGRESS
                      </span>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-xs">Phase 3: AI Infrastructure, eBPF & GPU Compute (WS 19-27)</span>
                        <span className="text-[10px] text-slate-400">eBPF tracing, WebAssembly sandboxing, GPU shaders, Multi-region disaster recovery</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold shrink-0 self-start sm:self-auto">
                        SCHEDULED COHORT TRACK
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {engineTab === "honors" && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span className="text-amber-400 font-bold">[HONORS]</span>
                      <span>Staff Engineer Sign-Offs & Capstone Standouts</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">Zero-Doubt Hiring Recommendation</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 font-bold text-xs">Technical Standout Citation</span>
                        <span className="text-[10px] text-slate-400 font-mono">DOS-B3-009 (Janani)</span>
                      </div>
                      <p className="text-[11px] text-slate-300 italic">
                        &quot;Engineered an ultra-low latency lock-free ring buffer in C99 with zero heap allocation under thread contention. Code is cleaner than most mid-level production contributions.&quot;
                      </p>
                      <span className="text-[10px] text-slate-400">— Lead Systems Faculty, DeScience Open Source Club</span>
                    </div>

                    <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 font-bold text-xs">Architectural Reliability</span>
                        <span className="text-[10px] text-slate-400 font-mono">DOS-B3-001 (Arunachalam)</span>
                      </div>
                      <p className="text-[11px] text-slate-300 italic">
                        &quot;Demonstrated 100% zero-grace attendance across 14 workshops. Designed failover Raft log compaction with reproducible chaos injection tests.&quot;
                      </p>
                      <span className="text-[10px] text-slate-400">— Principal Distributed Systems Fellow</span>
                    </div>
                  </div>

                  <div className="bg-emerald-950/30 border border-emerald-500/20 p-3 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-emerald-300 font-medium">
                      Industry Confidence Calibration: <strong className="text-white">100% Zero-Doubt Index</strong>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">Ready for Tier-1 Systems Deployments</span>
                  </div>
                </div>
              )}

              {/* Bottom Telemetry Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400">
                <span className="text-[11px]">
                  Curious about the engine? Members hold verified digital credentials that bypass normal screening queues.
                </span>
                <a
                  href="https://membership.descienceosclub.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-all shrink-0 cursor-pointer"
                >
                  Join as Member &rarr;
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: THE PRIORITY LOUNGE METAPHOR
            Airport Lounge vs. General Public Waiting Line
            ========================================================================= */}
        <section id="priority-lounge" aria-label="Priority Lounge Experience" className="flex flex-col gap-10 scroll-mt-24">
          <div className="flex flex-col items-center text-center gap-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <span>PRIORITY BOARDING FOR THE AI ERA</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              The Airport Lounge Experience for Software Engineers.
            </h2>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              When thousands of general travelers wait in crowded airport terminal lines, club members step into the private lounge and board with priority. TalentOS does the exact same for high-conviction engineering students.
            </p>
          </div>

          {/* Comparison Cards: The Two Worlds */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Card 1: The General Public Line */}
            <div className="bg-slate-900/40 border border-slate-800/90 rounded-2xl p-7 sm:p-9 flex flex-col justify-between gap-6 relative">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                    The General Public Terminal
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">
                    WAITING IN QUEUE
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-300">
                  Waiting at the general terminal gate with thousands of applicants.
                </h3>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Students graduating from traditional programs face an exhausting uphill struggle where hiring managers can rarely distinguish truth from exaggeration.
                </p>

                {/* Point by Point Friction */}
                <div className="space-y-3.5 pt-2">
                  <div className="flex items-start gap-3 text-xs text-slate-400">
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                      &times;
                    </span>
                    <div>
                      <strong className="text-slate-300 block">Resume Black Holes & ATS Screening</strong>
                      Generic PDF résumés with AI-crafted bullet points rejected by automated screening algorithms before a human ever reads them.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs text-slate-400">
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                      &times;
                    </span>
                    <div>
                      <strong className="text-slate-300 block">Classed as &quot;Untested Freshers&quot;</strong>
                      Engineering directors assume a mandatory 6-month probationary ramp-up period to teach basic Linux, Git discipline, and production rigor.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs text-slate-400">
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                      &times;
                    </span>
                    <div>
                      <strong className="text-slate-300 block">Hiring Managers Double-Thinking Decisions</strong>
                      Companies subject candidates to 5 rounds of basic LeetCode trivia because they have zero trustworthy evidence of real coding grit.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs text-slate-400">
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                      &times;
                    </span>
                    <div>
                      <strong className="text-slate-300 block">Unverified Commitment & Disconnected Proof</strong>
                      Zero third-party attestation of punctuality, attendance, or the capacity to grind through difficult low-level bugs.
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
                Standard Outcome: Uncertainty, low conversion rates, and generic entry-level placements.
              </div>
            </div>

            {/* Card 2: DeScience OS Club Member (The Priority Lounge) */}
            <div className="bg-gradient-to-b from-[#0C1527] to-[#070D1A] border-2 border-emerald-500/40 rounded-2xl p-7 sm:p-9 flex flex-col justify-between gap-6 relative shadow-2xl shadow-emerald-950/50">
              {/* Highlight badge */}
              <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                PRIORITY BOARDING // FAST-TRACK
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1.5">
                    <ShieldCheckIcon className="w-4 h-4 text-emerald-400" />
                    <span>DeScience OS Club Member Access</span>
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Priority boarding pass directly into engineering decision rooms.
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  DOS Club members bypass the public gate completely. Every hour of effort, physical attendance, and production commit is cryptographically stamped into their Student 360 Dossier.
                </p>

                {/* Point by Point Advantage */}
                <div className="space-y-3.5 pt-2">
                  <div className="flex items-start gap-3 text-xs text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                      <CheckIcon className="w-3 h-3" />
                    </span>
                    <div>
                      <strong className="text-emerald-300 block">The Unforgeable Student Passport (DOS-B3 ID)</strong>
                      A single authoritative dossier URL containing verified commit histories, physical geofence receipts, and staff engineer sign-offs.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                      <CheckIcon className="w-3 h-3" />
                    </span>
                    <div>
                      <strong className="text-emerald-300 block">Welcomed as Day-One Systems Engineers</strong>
                      Industry leaders do not treat DOS Club members as freshers. They know members build real Raft clusters, Linux syscall modules, and eBPF probes.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                      <CheckIcon className="w-3 h-3" />
                    </span>
                    <div>
                      <strong className="text-emerald-300 block">Zero Double-Thinking by Hiring Partners</strong>
                      No second-guessing capability. The evidence speaks with hermetic container test outcomes and SHA-256 commit attestations.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                      <CheckIcon className="w-3 h-3" />
                    </span>
                    <div>
                      <strong className="text-emerald-300 block">Honoured for Authentic Commitment</strong>
                      Zero-grace physical attendance means students who showed up on time every weekend are celebrated and distinguished from casual tourists.
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Banner inside Lounge Card */}
              <div className="pt-5 border-t border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-emerald-300 font-medium">
                  Ready to step out of the queue?
                </span>
                <a
                  href="https://membership.descienceosclub.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Become a Member</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: STUDENT 360 DOSSIER INSPECTION GATE
            Allows recruiters and institutions to directly inspect any student ledger
            ========================================================================= */}
        <section id="verify-gate" aria-label="Direct Dossier Verification" className="flex flex-col gap-6 scroll-mt-24">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-10 flex flex-col gap-6 backdrop-blur-xl">
            <div className="flex flex-col gap-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <SearchIcon className="w-4 h-4" />
                <span>Verification Gatekeeper // Recruiter & Institution Access</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Inspect a Student 360 Audit Dossier directly.
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Enter any official DOS Club identifier to access their verified longitudinal ledger,
                geofenced attendance timestamps, and production evidence repository.
              </p>
            </div>

            <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 select-none">
                  <SearchIcon className="w-4 h-4" />
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
                  className="w-full bg-slate-950/90 pl-10 pr-4 py-3 rounded-xl border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Inspect Dossier</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>Try sample verified student records:</span>
              <button
                type="button"
                onClick={() => setRecordKey("DOS-B3-009")}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono text-xs border border-slate-700 transition-colors cursor-pointer"
              >
                DOS-B3-009 (Janani Balaji)
              </button>
              <button
                type="button"
                onClick={() => setRecordKey("DOS-B3-001")}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono text-xs border border-slate-700 transition-colors cursor-pointer"
              >
                DOS-B3-001 (Arunachalam)
              </button>
              <button
                type="button"
                onClick={() => setRecordKey("DOS-B3-004")}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-300 font-mono text-xs border border-slate-700 transition-colors cursor-pointer"
              >
                DOS-B3-004 (Meera)
              </button>
            </div>

            {feedback && (
              <p className="text-xs text-amber-400 bg-amber-950/40 border border-amber-500/40 p-3 rounded-lg font-medium flex items-center gap-2 max-w-2xl">
                <AlertTriangleIcon className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{feedback}</span>
              </p>
            )}
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: ASPIRANT ENQUIRY FORM - Request Cohort Admission
            High conversion form capturing applicant curiosity
            ========================================================================= */}
        <section id="enquire" aria-label="Aspirant Enquiry" className="flex flex-col gap-8 scroll-mt-24">
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-[#090F1E] to-[#060A14] p-7 sm:p-12 relative overflow-hidden shadow-2xl">
            {/* Ambient accent inside form */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row gap-10 items-start justify-between relative z-10">
              {/* Left Column: Context & Inspiration */}
              <div className="flex flex-col gap-5 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <span>COHORT 2026 ADMISSIONS // ASPIRANT ENQUIRY</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Ready to step into the Priority Lounge?
                </h2>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  DeScience Open Source Club accepts high-conviction engineering aspirants across Tamil Nadu and global partner universities who are ready to embrace zero-grace standards.
                </p>

                <div className="space-y-3 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>27-workshop in-person systems engineering curriculum</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Staff engineer 1-on-1 code reviews and capstone audits</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Permanent Student 360 Passport recognized by elite engineering teams</span>
                  </div>
                </div>

                {/* Direct Membership Banner */}
                <div className="mt-4 p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col gap-3">
                  <span className="text-xs font-bold text-emerald-300">
                    Want guaranteed, immediate admission without waiting for enquiry triage?
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Join through the official membership engine to secure your seat and receive your DOS Club onboarding credentials right away.
                  </p>
                  <a
                    href="https://membership.descienceosclub.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/25 cursor-pointer"
                  >
                    <span>Become a Member Now</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Right Column: Interactive Enquiry Form */}
              <div className="w-full lg:max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl backdrop-blur-xl">
                {enquiryStatus === "success" ? (
                  <div className="flex flex-col items-center text-center gap-4 py-6">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                      <CheckCircleIcon className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-lg font-bold text-white">Enquiry Received</h3>
                      <p className="text-xs text-slate-300 font-mono">Reference: {enquiryRef}</p>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Your interest has been logged into the TalentOS candidate queue. The DeScience admissions committee reviews submissions every 48 hours.
                    </p>
                    <div className="pt-2 w-full">
                      <a
                        href="https://membership.descienceosclub.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                      >
                        <span>Expedite via Official Membership Portal &rarr;</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleEnquirySubmit} className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                        Aspirant Enquiry Form
                      </h3>
                      <span className="text-[10px] text-emerald-400 font-mono">Admissions 2026</span>
                    </div>

                    {enquiryError && (
                      <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                        <AlertTriangleIcon className="w-4 h-4 shrink-0 text-red-400" />
                        <span>{enquiryError}</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-300">
                        Full Name <span className="text-emerald-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={enquiryForm.fullName}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, fullName: e.target.value })}
                        placeholder="e.g. Anand Sundaram"
                        className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-300">
                          Email Address <span className="text-emerald-400">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={enquiryForm.email}
                          onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                          placeholder="anand@student.univ.edu"
                          className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-300">WhatsApp / Phone</label>
                        <input
                          type="tel"
                          value={enquiryForm.phone}
                          onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                          placeholder="+91 98400 12345"
                          className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-300">College / University</label>
                      <input
                        type="text"
                        value={enquiryForm.institution}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, institution: e.target.value })}
                        placeholder="e.g. Anna University, CEG / MIT / PSG Tech"
                        className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-300">Year & Degree</label>
                        <select
                          value={enquiryForm.yearAndDept}
                          onChange={(e) => setEnquiryForm({ ...enquiryForm, yearAndDept: e.target.value })}
                          className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        >
                          <option value="2nd Year - B.Tech / B.E.">2nd Year - B.Tech / B.E.</option>
                          <option value="3rd Year - B.Tech / B.E.">3rd Year - B.Tech / B.E.</option>
                          <option value="4th Year - B.Tech / B.E.">4th Year - B.Tech / B.E.</option>
                          <option value="Postgraduate / M.Tech / MCA">Postgraduate / M.Tech</option>
                          <option value="Self-Taught / Working Engineer">Working Engineer</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-300">Target Track</label>
                        <select
                          value={enquiryForm.track}
                          onChange={(e) => setEnquiryForm({ ...enquiryForm, track: e.target.value })}
                          className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        >
                          <option value="AI Infrastructure & Agentic Systems">AI Infrastructure & Agents</option>
                          <option value="Distributed Systems & Consensus">Distributed Systems & Raft</option>
                          <option value="Linux Kernel, POSIX & eBPF">Linux Kernel & eBPF</option>
                          <option value="High-Throughput Web Scale">High-Throughput Web Scale</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-300">
                        Why are you prepared for zero-grace commitment?
                      </label>
                      <textarea
                        rows={2}
                        value={enquiryForm.statement}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, statement: e.target.value })}
                        placeholder="Briefly describe your systems ambition or projects you have built..."
                        className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={enquiryStatus === "loading"}
                      className="w-full mt-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                    >
                      {enquiryStatus === "loading" ? (
                        <span>Submitting to Ledger...</span>
                      ) : (
                        <>
                          <span>Submit Aspirant Enquiry</span>
                          <ArrowRightIcon className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Footer */}
      <footer className="border-t border-slate-800/80 bg-[#050810] py-10 px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/dos-club-logo.png" alt="DOS Club" className="h-8 w-8 rounded-full ring-1 ring-slate-700" />
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm">DeScience Open Source Club</span>
              <span className="text-[11px] text-slate-400">
                TalentOS • Longitudinal Engineering Intelligence & Evidence Ledger
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs">
            <a
              href="https://membership.descienceosclub.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              Become a Member &rarr;
            </a>
            <span className="text-slate-700">•</span>
            <Link href="/login" className="hover:text-white transition-colors">
              Portal Sign In
            </Link>
            <span className="text-slate-700">•</span>
            <a href="#verify-gate" className="hover:text-white transition-colors">
              Verify Student 360
            </a>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400">Chennai & Singapore Engineering Hubs</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <span>&copy; {new Date().getFullYear()} DeScience Open Source Club. All rights reserved. Zero-grace integrity verified.</span>
          <span>Curated for high-conviction systems and AI engineers.</span>
        </div>
      </footer>
    </div>
  );
}
