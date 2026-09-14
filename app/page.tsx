"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getClientSession, TalentosUser } from "@/lib/session";
import {
  ArrowRightIcon,
  CheckIcon,
  SearchIcon,
  ExternalLinkIcon,
  TerminalIcon,
  CpuIcon,
  LayersIcon,
  ActivityIcon,
  UsersIcon,
  UserIcon,
  ShieldCheckIcon,
  AwardIcon,
  SparklesIcon,
  PlayIcon,
  SendIcon,
} from "@/components/Icons";
import WelcomePopupModal from "@/components/WelcomePopupModal";
import BackToTopButton from "@/components/BackToTopButton";
import { DEFAULT_LANDING_CMS, LandingCmsData } from "@/lib/cms-defaults";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<TalentosUser | null>(null);
  const [cms, setCms] = useState<LandingCmsData>(DEFAULT_LANDING_CMS);

  // Active Cohort / Team Filter Tabs
  const [activeTab, setActiveTab] = useState<"all" | "systems" | "ai" | "commons">("all");

  // Enquiry Form State
  const [enquiry, setEnquiry] = useState({
    name: "",
    phone: "",
    email: "",
    current_role: "Engineering Student (Year 3-4)",
    referral_source: "LinkedIn / Social Media",
    message: "",
  });
  const [enquiryStatus, setEnquiryStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [enquiryRef, setEnquiryRef] = useState<string | null>(null);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

  // Dossier Key Quick Lookup
  const [verifyKey, setVerifyKey] = useState("");

  useEffect(() => {
    setUser(getClientSession());

    // Load dynamic CMS data from backend
    async function loadCms() {
      try {
        const res = await fetch("/api/cms/landing");
        if (res.ok) {
          const data = await res.json();
          if (data.cms) {
            setCms(data.cms);
          }
        }
      } catch (err) {
        console.warn("Using default landing CMS configuration:", err);
      }
    }
    loadCms();
  }, []);

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquiryStatus("loading");
    setEnquiryError(null);

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enquiry),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setEnquiryStatus("success");
        setEnquiryRef(data.enquiryId || "ENQ-CONFIRMED");
      } else {
        setEnquiryStatus("error");
        setEnquiryError(data.error || "Failed to submit enquiry. Please join directly via the membership portal.");
      }
    } catch {
      setEnquiryStatus("error");
      setEnquiryError("Network connection error. Please try again or join via the membership portal.");
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyKey.trim()) return;
    const cleanKey = verifyKey.trim().toUpperCase();
    router.push(`/record/${encodeURIComponent(cleanKey)}`);
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "SUPER_ADMIN") return "/admin";
    if (user.role === "COLLEGE_ADMIN") return "/college";
    if (user.role === "TRAINER") return "/trainer";
    return `/record/${encodeURIComponent(user.dos_id || "DOS-B3-001")}`;
  };

  // Student Cohort Mock Data for UI8 Team section
  const cohortMembers = [
    {
      name: "Siddharth Raman",
      track: "systems",
      role: "Systems Pod Alpha • Kernel Auditor",
      tag: "DISTRIBUTED RAFT",
      image: "/images/students/student-1.jpg",
      status: "VERIFIED 27/27",
    },
    {
      name: "Ananya Krishnan",
      track: "ai",
      role: "AI Inference Pod • Vector Compute",
      tag: "KV-CACHE RUNTIME",
      image: "/images/students/student-2.jpg",
      status: "VERIFIED 27/27",
    },
    {
      name: "Karthik Subramanian",
      track: "commons",
      role: "Distributed Storage • Log Compaction",
      tag: "LSM-TREE ENGINE",
      image: "/images/students/student-3.jpg",
      status: "VERIFIED 26/27",
    },
    {
      name: "Meera Soundararajan",
      track: "systems",
      role: "Zero-Trust Identity • Cryptographic Proofs",
      tag: "EPHEMERAL MTLS",
      image: "/images/students/student-4.jpg",
      status: "VERIFIED 27/27",
    },
    {
      name: "Vigneshwaran M.",
      track: "ai",
      role: "Compiler Optimization • AST JIT",
      tag: "BYTECODE EMITTER",
      image: "/images/students/student-5.jpg",
      status: "VERIFIED 27/27",
    },
    {
      name: "Deepika Balaji",
      track: "commons",
      role: "Peer Defense Lead • Concurrency Locks",
      tag: "MUTUAL REVIEWER",
      image: "/images/students/student-laptop-focus.jpg",
      status: "VERIFIED 27/27",
    },
  ];

  const filteredMembers =
    activeTab === "all"
      ? cohortMembers
      : cohortMembers.filter((m) => m.track === activeTab);

  return (
    <div className="min-h-screen bg-[#FCFCFD] text-[#23262F] font-['Poppins',sans-serif] selection:bg-[#FF592C] selection:text-white">
      {/* Dynamic Welcome / Announcement Popup Modal */}
      <WelcomePopupModal />

      {/* =========================================================================
          UI8 HEADER — STRICT SINGLE LINE, BALANCED & ALIGNED
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#FCFCFD]/95 backdrop-blur-md border-b border-[#E6E8EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/dos-club-logo.png"
              alt="DeScience Open Source Club"
              className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-gellix font-bold text-lg text-[#23262F] tracking-tight leading-tight group-hover:text-[#FF592C] transition-colors whitespace-nowrap">
                TalentOS
              </span>
              <span className="font-gellix text-[11px] font-medium text-[#777E90] -mt-0.5 whitespace-nowrap">
                by DeScience Open Source Club
              </span>
            </div>
          </Link>

          {/* Navigation Links — Strict Single Line */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-[#777E90] whitespace-nowrap">
            <a href="#how-it-works" className="hover:text-[#23262F] transition-colors py-1">
              How It Works
            </a>
            <a href="#evidence" className="hover:text-[#23262F] transition-colors py-1">
              The Evidence
            </a>
            <a href="#lounge" className="hover:text-[#23262F] transition-colors py-1">
              Lounge Access
            </a>
            <a href="#roster" className="hover:text-[#23262F] transition-colors py-1">
              Student Roster
            </a>
            <a href="#enquire" className="hover:text-[#23262F] transition-colors py-1">
              Admissions
            </a>
          </nav>

          {/* Header Action CTAs — Strict Single Line */}
          <div className="flex items-center gap-3 shrink-0 whitespace-nowrap">
            {user ? (
              <Link
                href={getDashboardLink()}
                className="h-10 px-4.5 rounded-full border border-[#E6E8EC] hover:border-[#23262F] bg-white text-xs sm:text-sm font-bold text-[#23262F] flex items-center gap-2 transition-all whitespace-nowrap shadow-2xs hover:shadow-sm"
                title={`Go to ${user.role.replace("_", " ")} Dashboard`}
              >
                <span>Dashboard</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {user.role === "SUPER_ADMIN"
                    ? "Admin"
                    : user.role === "TRAINER"
                    ? "Expert"
                    : user.role === "COLLEGE_ADMIN"
                    ? "College"
                    : "Student"}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="h-10 px-5 rounded-full border border-[#E6E8EC] hover:border-[#23262F] bg-white text-xs sm:text-sm font-semibold text-[#23262F] hover:text-[#FF592C] flex items-center justify-center transition-all whitespace-nowrap shadow-2xs hover:shadow-sm"
                title="Member & Admin Portal Sign In"
              >
                Portal Sign In
              </Link>
            )}

            <a
              href="https://membership.descienceosclub.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-5 sm:px-6 rounded-full bg-[#FF592C] hover:bg-[#E04F26] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all whitespace-nowrap"
            >
              <span>Become a Member</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* =========================================================================
          SECTION 1: UI8 2-COLUMN HERO (.main) WITH FLOATING GLASS CARDS
          ========================================================================= */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden bg-gradient-to-b from-[#FCFCFD] via-white to-[#FCFCFD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Eyebrow, H1, Subtitle, Single-Line CTAs, Social Proof */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-7">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E6E8EC] shadow-2xs text-[#23262F] text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-[#45B26B] animate-pulse" />
                <span className="uppercase text-[#23262F] font-semibold">Train Smarter. Master Systems.</span>
              </div>

              {/* H1 Main Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-[#23262F] leading-[1.12]">
                The Engineering Passport to the AI-Native World.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#777E90] max-w-xl leading-relaxed font-normal">
                Where student builders master 27 production systems through peer architecture defense, collaborative codebases, and open-source rigor. Not competition. Collective capability.
              </p>

              {/* Buttons: Strictly Single Line, No Wrapping */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="https://membership.descienceosclub.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 px-7 rounded-full bg-[#FF592C] hover:bg-[#E04F26] text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md transition-all whitespace-nowrap"
                >
                  <span>Become a Member</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </a>
                <a
                  href="#enquire"
                  className="h-12 px-7 rounded-full border-2 border-[#E6E8EC] hover:border-[#23262F] bg-white text-sm sm:text-base font-semibold text-[#23262F] flex items-center justify-center transition-all whitespace-nowrap hover:bg-[#F4F5F6]"
                >
                  <span>Enquire for Batch 3</span>
                </a>
              </div>

              {/* Verified Student Social Proof Stack */}
              <div className="pt-4 flex items-center gap-4 border-t border-[#E6E8EC]/80 max-w-md">
                <div className="flex -space-x-2.5 overflow-hidden">
                  <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover" src="/images/students/student-1.jpg" alt="Student 1" />
                  <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover" src="/images/students/student-2.jpg" alt="Student 2" />
                  <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover" src="/images/students/student-3.jpg" alt="Student 3" />
                  <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover" src="/images/students/student-4.jpg" alt="Student 4" />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-[#23262F]">42 Systems Builders</div>
                  <div className="text-[#777E90] flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#45B26B]" />
                    <span>In Active Peer Architecture Defense</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Portrait Image with 3 Elevated Floating Glassmorphism Cards */}
            <div className="lg:col-span-6 relative flex justify-center lg:justify-end pt-4 lg:pt-0">
              <div className="relative w-full max-w-[480px] lg:max-w-[500px]">
                {/* Subtle Ambient Radial Glow */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-[#FF592C]/15 via-[#3772FF]/10 to-[#9757D7]/15 rounded-[40px] blur-2xl -z-10 opacity-70 pointer-events-none" />

                {/* Main Portrait Frame matching user's reference image */}
                <div className="relative rounded-[32px] overflow-hidden border border-[#E6E8EC] shadow-[0_20px_50px_rgba(0,0,0,0.08)] bg-white aspect-[4/5] sm:aspect-[4/4.8]">
                  <img
                    src="/images/hero-portrait-clean.jpg"
                    alt="Systems Engineer collaborating on laptop with headset"
                    className="w-full h-full object-cover object-center scale-101 hover:scale-103 transition-transform duration-700"
                  />
                </div>

                {/* Floating Glassmorphic Card 1: Top Right (Zero-Grace Cohort) */}
                <div className="absolute -top-4 -right-2 sm:-right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-[#E6E8EC] shadow-[0_12px_32px_rgba(0,0,0,0.1)] animate-float z-20 max-w-[210px] sm:max-w-[230px]">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-[#9757D7]/15 text-[#9757D7] flex items-center justify-center shrink-0">
                      <ShieldCheckIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#9757D7]">Defense Pod</div>
                      <div className="text-xs font-bold text-[#23262F]">Zero-Grace Cohort</div>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between pt-1 border-t border-[#F4F5F6]">
                    <span className="text-[11px] text-[#777E90]">Curriculum:</span>
                    <span className="text-xs font-bold text-[#23262F]">27 / 27 Systems</span>
                  </div>
                </div>

                {/* Floating Glassmorphic Card 2: Bottom Right (Verified Milestones + SVG Sparkline) */}
                <div className="absolute -bottom-6 -right-2 sm:-right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#E6E8EC] shadow-[0_16px_36px_rgba(0,0,0,0.12)] animate-float-slow z-20 min-w-[200px] sm:min-w-[220px]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-medium text-[#777E90]">Verified Milestones</span>
                    <span className="text-[10px] font-bold text-[#45B26B] bg-[#45B26B]/10 px-1.5 py-0.5 rounded-full">+18.4%</span>
                  </div>
                  <div className="text-2xl font-bold text-[#23262F] tracking-tight">1,134</div>
                  {/* SVG Sparkline Curve matching reference image */}
                  <div className="mt-2 h-10 w-full">
                    <svg viewBox="0 0 160 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="heroSparklineGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF592C" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#FF592C" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,32 C25,28 40,35 65,20 C90,8 115,22 135,12 C145,7 155,9 160,5 L160,40 L0,40 Z"
                        fill="url(#heroSparklineGrad)"
                      />
                      <path
                        d="M0,32 C25,28 40,35 65,20 C90,8 115,22 135,12 C145,7 155,9 160,5"
                        fill="none"
                        stroke="#FF592C"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <circle cx="160" cy="5" r="3.5" fill="#FF592C" className="animate-ping" />
                      <circle cx="160" cy="5" r="3" fill="#FF592C" />
                    </svg>
                  </div>
                </div>

                {/* Floating Glassmorphic Card 3: Middle/Bottom Left (Live Check-in Pill) */}
                <div className="absolute top-1/2 -left-3 sm:-left-8 -translate-y-1/2 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 border border-[#E6E8EC] shadow-[0_12px_32px_rgba(0,0,0,0.1)] animate-float-delay z-20 flex items-center gap-3">
                  <div className="relative">
                    <img
                      src="/images/students/student-1.jpg"
                      alt="Active Builder"
                      className="w-10 h-10 rounded-full object-cover border border-[#E6E8EC]"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#45B26B] ring-2 ring-white" />
                  </div>
                  <div className="pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#23262F]">Siddharth R.</span>
                      <span className="text-[10px] font-bold text-[#45B26B] uppercase">LOCKED</span>
                    </div>
                    <div className="text-[11px] text-[#777E90]">Verified LSM-Tree Storage</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: UI8 CLIENTS / ENGINEERING DISCIPLINES BAR (.clients)
          ========================================================================= */}
      <section className="bg-[#F4F5F6] py-12 border-y border-[#E6E8EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-xs font-bold uppercase tracking-widest text-[#777E90] mb-8">
            Core Engineering Disciplines Mastered Across 27 Systems
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Distributed Consensus", badge: "RAFT / PAXOS" },
              { label: "Kernel Internals", badge: "MEMORY SAFETY" },
              { label: "Compiler ASTs", badge: "JIT RUNTIMES" },
              { label: "Streaming Engines", badge: "HIGH-THROUGHPUT" },
              { label: "Cryptographic Auth", badge: "ZERO-TRUST" },
              { label: "Vector Compute", badge: "LLM SERVING" },
            ].map((disc, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-2xl border border-[#E6E8EC] shadow-2xs hover:border-[#FF592C] transition-colors text-center flex flex-col items-center justify-center gap-1"
              >
                <span className="text-xs font-bold text-[#23262F]">
                  {disc.label}
                </span>
                <span className="text-[10px] font-bold text-[#FF592C]">
                  {disc.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: UI8 STEPS (.steps) — THE 4 DIMENSIONS OF RIGOR
          ========================================================================= */}
      <section id="how-it-works" className="py-24 border-b border-[#E6E8EC] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="max-w-2xl mb-16">
            <span className="ui8-stage">The 4 Dimensions of Rigor</span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#23262F]">
              How it works
            </h2>
            <p className="mt-3 text-base sm:text-lg text-[#777E90] leading-relaxed">
              From novice explorer to proven systems engineer verified by collective codebases.
            </p>
          </div>

          {/* 4 Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1: Blue */}
            <div className="bg-white p-6 rounded-3xl border border-[#E6E8EC] shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="w-14 h-14 rounded-2xl bg-[#3772FF] flex items-center justify-center text-white mb-6">
                <TerminalIcon className="w-7 h-7" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#3772FF] mb-1">
                Step 1
              </div>
              <h3 className="text-xl font-bold text-[#23262F] mb-2">
                Architecture Immersion
              </h3>
              <p className="text-sm text-[#777E90] leading-relaxed">
                Deconstruct production primitives: kernel memory allocation, cache coherence, and network socket protocols.
              </p>
            </div>

            {/* Step 2: Purple */}
            <div className="bg-white p-6 rounded-3xl border border-[#E6E8EC] shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="w-14 h-14 rounded-2xl bg-[#9757D7] flex items-center justify-center text-white mb-6">
                <UsersIcon className="w-7 h-7" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#9757D7] mb-1">
                Step 2
              </div>
              <h3 className="text-xl font-bold text-[#23262F] mb-2">
                Collaborative Pod Build
              </h3>
              <p className="text-sm text-[#777E90] leading-relaxed">
                Build systems in pods of 3-4 peers. Zero solo silos. Shared repositories, pair programming, and mutual code reviews.
              </p>
            </div>

            {/* Step 3: Pink */}
            <div className="bg-white p-6 rounded-3xl border border-[#E6E8EC] shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="w-14 h-14 rounded-2xl bg-[#EF466F] flex items-center justify-center text-white mb-6">
                <ShieldCheckIcon className="w-7 h-7" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#EF466F] mb-1">
                Step 3
              </div>
              <h3 className="text-xl font-bold text-[#23262F] mb-2">
                Zero-Grace Peer Defense
              </h3>
              <p className="text-sm text-[#777E90] leading-relaxed">
                Defend every commit before the batch. Answer live failure injections, concurrency bottlenecks, and edge invariants.
              </p>
            </div>

            {/* Step 4: Green */}
            <div className="bg-white p-6 rounded-3xl border border-[#E6E8EC] shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="w-14 h-14 rounded-2xl bg-[#45B26B] flex items-center justify-center text-white mb-6">
                <AwardIcon className="w-7 h-7" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#45B26B] mb-1">
                Step 4
              </div>
              <h3 className="text-xl font-bold text-[#23262F] mb-2">
                Verified Talent Dossier
              </h3>
              <p className="text-sm text-[#777E90] leading-relaxed">
                Graduate with an immutable record of PRs, test suites, and verified telemetry that speaks louder than any resume.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: UI8 INTRO (.intro) — EDITORIAL MINDSET
          ========================================================================= */}
      <section className="bg-white py-20 border-b border-[#E6E8EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Imagery Showcase */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-3xl overflow-hidden border border-[#E6E8EC] shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/students/student-group-collab.jpg"
                  alt="Students building software"
                  className="w-full h-80 sm:h-96 object-cover"
                />
              </div>
              {/* Floating Highlight Card */}
              <div className="absolute -bottom-6 -right-4 sm:right-6 bg-white p-4 rounded-2xl border border-[#E6E8EC] shadow-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#45B26B] flex items-center justify-center text-white">
                  <CheckIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#23262F]">100% Peer Verified</div>
                  <div className="text-[11px] text-[#777E90]">Zero resume inflation</div>
                </div>
              </div>
            </div>

            {/* Right Editorial Copy */}
            <div className="lg:col-span-6 space-y-6">
              <span className="ui8-stage">Aspirational Engineering</span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#23262F] leading-tight">
                Build deeper, defend together.
              </h2>
              <p className="text-base sm:text-lg text-[#777E90] leading-relaxed">
                When an engineer walks into an industry evaluation backed by a DOS Club dossier, there is no guesswork. Hiring leaders see authentic pull requests, distributed systems benchmarks, and peer review logs.
              </p>
              <p className="text-base text-[#777E90] leading-relaxed">
                Our members are not treated like freshers who need retraining. They are welcomed as proven builders who already understand how software actually works in production.
              </p>
              <div className="pt-2">
                <a
                  href="https://membership.descienceosclub.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ui8-btn-primary"
                >
                  <span>Become a Member</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: UI8 BOOK (.book) — THE AIRPORT LOUNGE PRIVILEGE
          ========================================================================= */}
      <section id="lounge" className="bg-[#F4F5F6] py-24 border-b border-[#E6E8EC] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Photo Card */}
            <div className="lg:col-span-5 relative rounded-3xl overflow-hidden border border-[#E6E8EC] shadow-md bg-white">
              <div className="aspect-4/3 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/students/student-laptop-focus.jpg"
                  alt="Student Engineer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 bg-white border-t border-[#E6E8EC] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#777E90]">
                    DOS Club Member Status
                  </div>
                  <div className="text-base font-bold text-[#23262F]">
                    Priority Industry Access
                  </div>
                </div>
                <span className="px-3 py-1 rounded bg-[#23262F] text-white text-xs font-bold uppercase tracking-wider">
                  MEMBER PASS
                </span>
              </div>
            </div>

            {/* Right Lounge Privilege Breakdown */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="ui8-stage">The Airport Lounge Experience</span>
                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#23262F]">
                  Members don&apos;t wait in the general line.
                </h2>
                <p className="mt-3 text-base sm:text-lg text-[#777E90] leading-relaxed">
                  While general applicants queue in resume applicant tracking filters, DOS Club members enter with verified capability and immediate technical standing.
                </p>
              </div>

              {/* 3 Tier List Items */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#E6E8EC] shadow-2xs">
                  <div className="w-12 h-12 rounded-full bg-[#45B26B] flex items-center justify-center text-white shrink-0">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#23262F]">
                      For Ambitious Aspirants
                    </h3>
                    <p className="text-sm text-[#777E90] mt-0.5">
                      Structured mentorship and foundations in Linux internals, memory safety, and systems programming.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#E6E8EC] shadow-2xs">
                  <div className="w-12 h-12 rounded-full bg-[#9757D7] flex items-center justify-center text-white shrink-0">
                    <AwardIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#23262F]">
                      Collaborative Systems Pods
                    </h3>
                    <p className="text-sm text-[#777E90] mt-0.5">
                      Master 27 production systems through peer defense, live failure injections, and shared code repositories.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#E6E8EC] shadow-2xs">
                  <div className="w-12 h-12 rounded-full bg-[#3772FF] flex items-center justify-center text-white shrink-0">
                    <SparklesIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#23262F]">
                      The Airport Lounge Privilege
                    </h3>
                    <p className="text-sm text-[#777E90] mt-0.5">
                      Fast-tracked industry introductions, zero-whiteboard skepticism, and direct engineering respect.
                    </p>
                  </div>
                </div>
              </div>

              {/* Callout Note */}
              <div className="p-4 rounded-2xl bg-white border border-[#E6E8EC] text-sm text-[#23262F]">
                <strong className="text-[#45B26B]">Direct Industry Recognition</strong>:
                DOS Club dossiers bypass standard junior applicant filters because every commit is cryptographically audited.
              </div>

              {/* Action Button */}
              <div>
                <a
                  href="https://membership.descienceosclub.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ui8-btn-primary"
                >
                  <span>Claim Your Lounge Access</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: UI8 DETAILS (.details) — THE INVISIBLE ENGINE
          ========================================================================= */}
      <section id="evidence" className="py-24 border-b border-[#E6E8EC] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <span className="ui8-stage">Telemetry & Evidence</span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#23262F]">
              Behind every opportunity is evidence.
            </h2>
            <p className="mt-3 text-base sm:text-lg text-[#777E90] leading-relaxed">
              No inflated claims. Every capability is anchored in genuine code execution, peer verification, and real mentor observations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl border border-[#E6E8EC] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#F4F5F6] flex items-center justify-center text-[#23262F] mb-6">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#23262F] mb-3">
                Tamper-Proof Git Proof
              </h3>
              <p className="text-sm text-[#777E90] leading-relaxed">
                Every workshop check-in is geofenced. Every commit is cryptographically hashed and tied to live peer audit approvals.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl border border-[#E6E8EC] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#F4F5F6] flex items-center justify-center text-[#23262F] mb-6">
                <UsersIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#23262F] mb-3">
                Collaborative Code Commons
              </h3>
              <p className="text-sm text-[#777E90] leading-relaxed">
                No solo hoarding. Systems are authored in public team pods with strict branch protections, mandatory PR reviews, and shared ownership.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl border border-[#E6E8EC] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#F4F5F6] flex items-center justify-center text-[#23262F] mb-6">
                <CpuIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#23262F] mb-3">
                Production Latency Telemetry
              </h3>
              <p className="text-sm text-[#777E90] leading-relaxed">
                Services undergo automated chaos simulation and benchmark testing to verify throughput, p99 latency, and graceful degradation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: UI8 ABOUT (.about) — SIMPLICITY & RIGOR
          ========================================================================= */}
      <section className="bg-[#F4F5F6] py-24 border-b border-[#E6E8EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left 3 Numbers */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="ui8-stage">Core Methodology</span>
                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#23262F]">
                  Rigorous, open, collective.
                </h2>
                <p className="mt-3 text-base text-[#777E90] leading-relaxed">
                  How DeScience Open Source Club creates a culture where every engineer lifts the whole pod.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {/* 01 Purple */}
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-[#E6E8EC] shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-[#9757D7] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    01
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#23262F]">
                      Authentic Open Source Mastery
                    </h3>
                    <p className="text-sm text-[#777E90] mt-0.5">
                      Not toy tutorials. Building software people actually run in production with real edge case handling.
                    </p>
                  </div>
                </div>

                {/* 02 Pink */}
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-[#E6E8EC] shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-[#EF466F] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    02
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#23262F]">
                      Peer Defense Over Paper Exams
                    </h3>
                    <p className="text-sm text-[#777E90] mt-0.5">
                      Explain your concurrency locks and memory invariants before your peers under live failure conditions.
                    </p>
                  </div>
                </div>

                {/* 03 Green */}
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-[#E6E8EC] shadow-2xs">
                  <div className="w-10 h-10 rounded-xl bg-[#45B26B] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    03
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#23262F]">
                      Mutual Elevation Culture
                    </h3>
                    <p className="text-sm text-[#777E90] mt-0.5">
                      No zero-sum ranking. When one pod solves a distributed consensus problem, the knowledge belongs to the batch.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Media Card with Play Button */}
            <div className="lg:col-span-6 relative rounded-3xl overflow-hidden border border-[#E6E8EC] shadow-lg group">
              <div className="aspect-4/3 sm:aspect-16/10 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/students/student-group-collab.jpg"
                  alt="Live technical evaluation"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                />
              </div>
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                <button
                  type="button"
                  aria-label="Play workshop overview"
                  className="w-20 h-20 rounded-full bg-[#FCFCFD] flex items-center justify-center text-[#777E90] hover:text-[#FF592C] hover:scale-110 shadow-xl transition-all"
                >
                  <PlayIcon className="w-8 h-8 ml-1" />
                </button>
              </div>
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-white/90 backdrop-blur-md border border-[#E6E8EC] text-xs font-semibold text-[#23262F] flex items-center justify-between">
                <span>Live Technical Evaluation in Session</span>
                <span className="text-[#45B26B] font-bold uppercase">RECORDED POD DEFENSE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: UI8 TEAM (.team) — STUDENT COHORT ROSTER
          ========================================================================= */}
      <section id="roster" className="py-24 border-b border-[#E6E8EC] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header & Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="ui8-stage">Active Cohort // Batch 3</span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#23262F]">
                Meet the systems builders
              </h2>
              <p className="mt-2 text-base text-[#777E90]">
                Engineers actively executing the 27 systems across peer defense pods.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 p-1.5 rounded-full bg-[#F4F5F6] border border-[#E6E8EC] overflow-x-auto">
              {[
                { id: "all", label: "All Pods" },
                { id: "systems", label: "Systems Track" },
                { id: "ai", label: "AI Architecture" },
                { id: "commons", label: "Core Commons" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-[#23262F] text-white shadow-sm"
                      : "text-[#777E90] hover:text-[#23262F]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Roster Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-[#E6E8EC] shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-[#E6E8EC]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-[#23262F]">
                  {member.name}
                </h3>
                <div className="text-xs text-[#777E90] mt-1 mb-3">
                  {member.role}
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  <span className="px-2.5 py-1 rounded bg-[#F4F5F6] text-[10px] font-bold uppercase text-[#777E90] border border-[#E6E8EC]">
                    {member.tag}
                  </span>
                  <span className="px-2.5 py-1 rounded border border-[#45B26B] text-[10px] font-bold uppercase text-[#45B26B]">
                    {member.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: UI8 REVIEW (.review) — INDUSTRY VOICE
          ========================================================================= */}
      <section className="bg-[#F4F5F6] py-24 border-b border-[#E6E8EC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-14 h-14 rounded-full bg-white border border-[#E6E8EC] shadow-sm mx-auto flex items-center justify-center text-[#FF592C] mb-6">
            <SparklesIcon className="w-7 h-7" />
          </div>
          <blockquote className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#23262F] leading-snug">
            &ldquo;When an engineer walks into an evaluation with a DOS Club dossier, the conversation fundamentally changes. We don&apos;t ask them to reverse linked lists on a whiteboard. We inspect their 27-system commit history and discuss why they chose Raft over Paxos. They are ready on day zero.&rdquo;
          </blockquote>
          <div className="mt-8">
            <div className="font-bold text-base text-[#23262F]">
              Senior Systems Architect & Evaluation Lead
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#777E90] mt-1">
              Cloud Infrastructure Council
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 10: UI8 QUALITY COUNTERS (.quality)
          ========================================================================= */}
      <section className="py-20 border-b border-[#E6E8EC] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {/* Stat 1 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-[#45B26B]/15 text-[#45B26B] flex items-center justify-center mb-4">
                <TerminalIcon className="w-6 h-6" />
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-[#23262F]">
                27
              </div>
              <div className="text-sm font-bold text-[#23262F] mt-2">
                Production Systems
              </div>
              <div className="text-xs text-[#777E90] mt-1 max-w-[200px]">
                Built from scratch with zero high-level shortcuts
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-[#3772FF]/15 text-[#3772FF] flex items-center justify-center mb-4">
                <LayersIcon className="w-6 h-6" />
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-[#23262F]">
                1,420+
              </div>
              <div className="text-sm font-bold text-[#23262F] mt-2">
                Merged Pull Requests
              </div>
              <div className="text-xs text-[#777E90] mt-1 max-w-[200px]">
                Peer reviewed across the shared code commons
              </div>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-[#EF466F]/15 text-[#EF466F] flex items-center justify-center mb-4">
                <UsersIcon className="w-6 h-6" />
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-[#23262F]">
                42
              </div>
              <div className="text-sm font-bold text-[#23262F] mt-2">
                Engineers in Batch 3
              </div>
              <div className="text-xs text-[#777E90] mt-1 max-w-[200px]">
                Actively in collaborative defense sessions
              </div>
            </div>

            {/* Stat 4 */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-[#9757D7]/15 text-[#9757D7] flex items-center justify-center mb-4">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <div className="text-4xl sm:text-5xl font-bold text-[#23262F]">
                100%
              </div>
              <div className="text-sm font-bold text-[#23262F] mt-2">
                Peer Code Audited
              </div>
              <div className="text-xs text-[#777E90] mt-1 max-w-[200px]">
                Zero unverified commits merged into main
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 11: UI8 WORKOUTS (.workouts) — TALENTOS DOSSIER
          ========================================================================= */}
      <section className="bg-[#F4F5F6] py-24 border-b border-[#E6E8EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Dossier Preview Card */}
            <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#E6E8EC] shadow-md">
              <div className="flex items-center justify-between pb-6 border-b border-[#E6E8EC]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#23262F] text-white flex items-center justify-center font-bold text-base">
                    D3
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#23262F]">
                      DOS-B3-009 // AUDIT DOSSIER
                    </div>
                    <div className="text-xs text-[#777E90]">
                      Systems Engineering Cohort Alpha
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded bg-[#45B26B] text-white text-[11px] font-bold uppercase tracking-wider">
                  VERIFIED
                </span>
              </div>

              {/* Dossier Matrix */}
              <div className="py-6 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#777E90] font-medium">Workshop Attendance</span>
                  <span className="font-bold text-[#23262F]">27 of 27 (100% Physical)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F4F5F6] overflow-hidden">
                  <div className="w-full h-full bg-[#45B26B] rounded-full" />
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-[#777E90] font-medium">Peer Reviews Completed</span>
                  <span className="font-bold text-[#23262F]">54 Code Audits</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F4F5F6] overflow-hidden">
                  <div className="w-[96%] h-full bg-[#3772FF] rounded-full" />
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-[#777E90] font-medium">Architecture Defense Score</span>
                  <span className="font-bold text-[#23262F]">98.4 / 100</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F4F5F6] overflow-hidden">
                  <div className="w-[98%] h-full bg-[#9757D7] rounded-full" />
                </div>
              </div>

              {/* Lookup form */}
              <form onSubmit={handleVerifySubmit} className="pt-4 border-t border-[#E6E8EC] flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Dossier ID e.g. DOS-B3-009"
                  value={verifyKey}
                  onChange={(e) => setVerifyKey(e.target.value)}
                  className="flex-1 bg-[#F4F5F6] border border-[#E6E8EC] rounded-full px-4 py-2.5 text-xs text-[#23262F] placeholder-[#777E90] focus:outline-none focus:border-[#23262F]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#23262F] hover:bg-[#FF592C] text-white text-xs font-bold transition-colors"
                >
                  Verify
                </button>
              </form>
            </div>

            {/* Right Copy & Checklist */}
            <div className="lg:col-span-6 space-y-6">
              <span className="ui8-stage">Immutable Talent Ledger</span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#23262F] leading-tight">
                All your verified evidence, in your pocket.
              </h2>
              <p className="text-base sm:text-lg text-[#777E90] leading-relaxed">
                TalentOS compiles every single commit, peer review remark, and benchmark record into an immutable digital dossier.
              </p>

              <ul className="space-y-3 font-semibold text-sm text-[#23262F]">
                {[
                  "Geofenced physical workshop attendance telemetry",
                  "Cryptographic commit signatures tied to student keypairs",
                  "Peer code review approvals with recorded defense remarks",
                  "Automated benchmark telemetry and chaos tests",
                  "Instant shareable passport link for verified technical recruiters",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#45B26B] text-white flex items-center justify-center shrink-0">
                      <CheckIcon className="w-3.5 h-3.5" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href="/record/DOS-B3-009"
                  className="ui8-btn-stroke"
                >
                  <span>Explore Sample Dossier</span>
                  <ExternalLinkIcon className="w-4 h-4" />
                </Link>
                <a
                  href="#enquire"
                  className="ui8-btn-primary"
                >
                  <span>Enquire for Batch 3</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 12: UI8 OFFERS (.offers) — GRAND INVITATION
          ========================================================================= */}
      <section className="bg-white py-24 text-center border-b border-[#E6E8EC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="ui8-stage">STEP BEHIND THE DOOR</span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#23262F] leading-tight">
            Anywhere you want to go. Backed by authentic proof.
          </h2>
          <p className="text-base sm:text-lg text-[#777E90] max-w-2xl mx-auto leading-relaxed">
            Join an open-source movement where commitment is honored, systems are built together, and your engineering capabilities speak before your resume does.
          </p>
          <div className="pt-4">
            <a
              href="https://membership.descienceosclub.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="ui8-btn-primary text-base sm:text-lg py-4 px-9"
            >
              <span>Become a Member</span>
              <ArrowRightIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 13: ADMISSIONS & ENQUIRY FORM (#enquire)
          ========================================================================= */}
      <section id="enquire" className="bg-[#F4F5F6] py-24 scroll-mt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E6E8EC] shadow-sm">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="ui8-stage">Aspirant Admissions</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#23262F]">
                Enquire for Batch 3
              </h2>
              <p className="mt-2 text-sm text-[#777E90]">
                Have questions about cohort eligibility, syllabus depth, or the admissions process? Reach out to our community team.
              </p>
            </div>

            {enquiryStatus === "success" ? (
              <div className="p-8 rounded-2xl bg-[#45B26B]/10 border border-[#45B26B]/30 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#45B26B] text-white mx-auto flex items-center justify-center">
                  <CheckIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#23262F]">
                  Enquiry Received
                </h3>
                <p className="text-sm text-[#777E90]">
                  Reference ID: <span className="font-mono font-bold text-[#23262F]">{enquiryRef}</span>. Our admissions pod will get in touch with you via WhatsApp or Email.
                </p>
                <div className="pt-2">
                  <a
                    href="https://membership.descienceosclub.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ui8-btn-primary text-xs py-3 px-6"
                  >
                    <span>Proceed to Direct Membership</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-6">
                {enquiryError && (
                  <div className="p-4 rounded-xl bg-[#EF466F]/10 border border-[#EF466F]/30 text-xs text-[#EF466F] font-semibold">
                    {enquiryError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#777E90] mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Siddharth Raman"
                      value={enquiry.name}
                      onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#F4F5F6] border border-[#E6E8EC] text-sm text-[#23262F] focus:outline-none focus:border-[#23262F]"
                    />
                  </div>

                  {/* Mobile [WhatsApp] */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#777E90] mb-2">
                      Mobile [WhatsApp] *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98401 23456"
                      value={enquiry.phone}
                      onChange={(e) => setEnquiry({ ...enquiry, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#F4F5F6] border border-[#E6E8EC] text-sm text-[#23262F] focus:outline-none focus:border-[#23262F]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#777E90] mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. siddharth@example.com"
                      value={enquiry.email}
                      onChange={(e) => setEnquiry({ ...enquiry, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#F4F5F6] border border-[#E6E8EC] text-sm text-[#23262F] focus:outline-none focus:border-[#23262F]"
                    />
                  </div>

                  {/* Current Role */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#777E90] mb-2">
                      Current Role *
                    </label>
                    <select
                      value={enquiry.current_role}
                      onChange={(e) => setEnquiry({ ...enquiry, current_role: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#F4F5F6] border border-[#E6E8EC] text-sm text-[#23262F] focus:outline-none focus:border-[#23262F]"
                    >
                      <option value="Engineering Student (Year 1-2)">Engineering Student (Year 1–2)</option>
                      <option value="Engineering Student (Year 3-4)">Engineering Student (Year 3–4)</option>
                      <option value="Recent Engineering Graduate">Recent Engineering Graduate</option>
                      <option value="Early Professional (0-2 YOE)">Early Professional / Junior Dev (0–2 YOE)</option>
                      <option value="Senior Engineer (2+ YOE)">Senior Engineer / Lead (2+ YOE)</option>
                      <option value="Self-Taught Builder">Self-Taught Builder / Open Source</option>
                      <option value="Other">Other / Non-Traditional</option>
                    </select>
                  </div>
                </div>

                {/* How did you know us? */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#777E90] mb-2">
                    How did you know us? *
                  </label>
                  <select
                    value={enquiry.referral_source}
                    onChange={(e) => setEnquiry({ ...enquiry, referral_source: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4F5F6] border border-[#E6E8EC] text-sm text-[#23262F] focus:outline-none focus:border-[#23262F]"
                  >
                    <option value="LinkedIn / Social Media">LinkedIn / Social Media</option>
                    <option value="Campus Workshop / College Event">Campus Workshop / College Event</option>
                    <option value="DOS Club Member / Alumni Referral">DOS Club Member / Alumni Referral</option>
                    <option value="WhatsApp Group / Tech Community">WhatsApp Group / Tech Community</option>
                    <option value="GitHub / Open Source Repository">GitHub / Open Source Repository</option>
                    <option value="Friend / Peer Recommendation">Friend / Peer Recommendation</option>
                    <option value="Web Search / Direct Visit">Web Search / Direct Visit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Message / Aspirations */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#777E90] mb-2">
                    Technical Aspirations & Questions (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about the distributed systems, AI, or open source projects you are excited to build..."
                    value={enquiry.message}
                    onChange={(e) => setEnquiry({ ...enquiry, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4F5F6] border border-[#E6E8EC] text-sm text-[#23262F] focus:outline-none focus:border-[#23262F]"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={enquiryStatus === "loading"}
                    className="w-full sm:w-auto ui8-btn-primary"
                  >
                    {enquiryStatus === "loading" ? (
                      <span>Sending Enquiry...</span>
                    ) : (
                      <>
                        <span>Submit Admissions Enquiry</span>
                        <SendIcon className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <a
                    href="https://membership.descienceosclub.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#FF592C] hover:underline"
                  >
                    Or join directly via Membership Portal &rarr;
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 14: UI8 3-COLUMN FOOTER (.footer)
          ========================================================================= */}
      <footer className="bg-[#FCFCFD] pt-20 pb-12 border-t border-[#E6E8EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16">
            {/* Column 1: Brand & Attribution */}
            <div className="md:col-span-5 space-y-4">
              <Link href="/" className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/dos-club-logo.png"
                  alt="DeScience Open Source Club"
                  className="w-9 h-9 object-contain"
                />
                <div className="flex flex-col">
                  <span className="font-gellix font-bold text-base text-[#23262F] tracking-tight">
                    TalentOS
                  </span>
                  <span className="font-gellix text-[11px] text-[#777E90] -mt-0.5">
                    by DeScience Open Source Club
                  </span>
                </div>
              </Link>
              <p className="text-sm text-[#777E90] max-w-sm leading-relaxed">
                A world-class engineering ecosystem where student builders author 27 production systems with tamper-proof evidence.
              </p>
              {/* Mandatory Touchmark Descience Attribution */}
              <div className="pt-2 flex items-center gap-2 text-xs text-[#777E90]">
                <span>An initiative of</span>
                <a
                  href="https://touchmarkdes.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-[#23262F] hover:text-[#FF592C] transition-colors inline-flex items-center gap-1"
                >
                  <span>Touchmark Descience</span>
                  <ExternalLinkIcon className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Column 2: Navigation Links */}
            <div className="md:col-span-3 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#23262F]">
                Portals & Ecosystem
              </div>
              <ul className="space-y-2 text-sm text-[#777E90]">
                <li>
                  <Link href="/login" className="hover:text-[#23262F] font-semibold text-[#3772FF] transition-colors">
                    Member Portal Sign In &rarr;
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-[#23262F] transition-colors">
                    Admin Governance Console
                  </Link>
                </li>
                <li>
                  <Link href="/trainer" className="hover:text-[#23262F] transition-colors">
                    Technical Expert Cockpit
                  </Link>
                </li>
                <li>
                  <Link href="/college" className="hover:text-[#23262F] transition-colors">
                    Partner College Portal
                  </Link>
                </li>
                <li>
                  <Link href="/checkin" className="hover:text-[#23262F] transition-colors">
                    Campus Zero-Grace Check-In
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Membership CTA & Quick Contacts */}
            <div className="md:col-span-4 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[#23262F]">
                Admissions & Membership
              </div>
              <p className="text-sm text-[#777E90] leading-relaxed">
                Ready to build systems that matter? Apply for Batch 3 or become a full club member.
              </p>
              <div className="pt-1">
                <a
                  href="https://membership.descienceosclub.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ui8-btn-primary text-xs py-3 px-6"
                >
                  <span>Join DOS Club</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Row */}
          <div className="pt-8 border-t border-[#E6E8EC] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#777E90]">
            <span>
              &copy; {new Date().getFullYear()} DeScience Open Source Club. An initiative of Touchmark Descience. All rights reserved.
            </span>
            <span>DeScience Open Source Club • Chennai, Tamil Nadu</span>
          </div>
        </div>
      </footer>

      {/* Floating Smooth Back To Top Action Button */}
      <BackToTopButton />
    </div>
  );
}
