"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { INITIAL_CASE_STUDIES } from "@/lib/casestudies";
import { DEFAULT_LANDING_CMS, LandingCmsData } from "@/lib/cms-defaults";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<TalentosUser | null>(null);
  const [cms, setCms] = useState<LandingCmsData>(DEFAULT_LANDING_CMS);

  // Compact Navigation Dropdown State
  const [exploreDropdownOpen, setExploreDropdownOpen] = useState(false);

  // Student Case Studies & Articles (Single Line Horizontal Scroll)
  const caseStudyScrollRef = useRef<HTMLDivElement>(null);

  const scrollCaseStudies = (direction: "left" | "right") => {
    if (caseStudyScrollRef.current) {
      const offset = direction === "left" ? -390 : 390;
      caseStudyScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

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

          {/* Navigation Links — Strict Single Line & Compact (3 Menus Max) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#777E90] whitespace-nowrap">
            {/* 1. Explore Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setExploreDropdownOpen(true)}
              onMouseLeave={() => setExploreDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setExploreDropdownOpen(!exploreDropdownOpen)}
                className="hover:text-[#23262F] transition-colors py-1 flex items-center gap-1.5 cursor-pointer font-semibold"
              >
                <span>Explore</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    exploreDropdownOpen ? "rotate-180 text-[#FF592C]" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {exploreDropdownOpen && (
                <div className="absolute top-full left-0 pt-2 w-64 z-50 animate-fadeIn">
                  <div className="p-2.5 bg-white rounded-2xl border border-[#E6E8EC] shadow-xl space-y-1">
                    <a
                      href="#how-it-works"
                      onClick={() => setExploreDropdownOpen(false)}
                      className="block p-2.5 rounded-xl hover:bg-[#F4F5F6] transition-colors"
                    >
                      <div className="text-xs font-bold text-[#23262F]">How It Works</div>
                      <div className="text-[11px] text-[#777E90]">The 4 dimensions of engineering rigor</div>
                    </a>
                    <a
                      href="#evidence"
                      onClick={() => setExploreDropdownOpen(false)}
                      className="block p-2.5 rounded-xl hover:bg-[#F4F5F6] transition-colors"
                    >
                      <div className="text-xs font-bold text-[#23262F]">The Evidence</div>
                      <div className="text-[11px] text-[#777E90]">Cryptographic git proofs & telemetry</div>
                    </a>
                    <a
                      href="#lounge"
                      onClick={() => setExploreDropdownOpen(false)}
                      className="block p-2.5 rounded-xl hover:bg-[#F4F5F6] transition-colors"
                    >
                      <div className="text-xs font-bold text-[#23262F]">Lounge Access</div>
                      <div className="text-[11px] text-[#777E90]">Priority industry standing</div>
                    </a>
                    <a
                      href="#roster"
                      onClick={() => setExploreDropdownOpen(false)}
                      className="block p-2.5 rounded-xl hover:bg-[#F4F5F6] transition-colors"
                    >
                      <div className="text-xs font-bold text-[#23262F]">Student Roster</div>
                      <div className="text-[11px] text-[#777E90]">Active Batch 3 systems builders</div>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Case Studies (Direct Link) */}
            <a href="#case-studies" className="hover:text-[#23262F] transition-colors py-1">
              Case Studies
            </a>

            {/* 3. Admissions (Direct Link) */}
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
              className="h-10 px-5 sm:px-6 rounded-full bg-[#FF592C] hover:bg-[#E04F26] text-white text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-sm transition-all whitespace-nowrap group"
            >
              <span>Become a Member</span>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRightIcon className="w-3 h-3" />
              </span>
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

              {/* Buttons: Strictly Single Line, No Wrapping (Zenler-Inspired CTA with icon circles) */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="https://membership.descienceosclub.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 px-7 rounded-full bg-[#FF592C] hover:bg-[#E04F26] text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all whitespace-nowrap group"
                >
                  <span>Become a Member</span>
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </span>
                </a>
                <a
                  href="#case-studies"
                  className="h-12 px-7 rounded-full border-2 border-[#E6E8EC] hover:border-[#23262F] bg-white text-sm sm:text-base font-semibold text-[#23262F] flex items-center justify-center gap-2.5 transition-all whitespace-nowrap hover:bg-[#F4F5F6]"
                >
                  <span>Explore Case Studies</span>
                  <span className="text-[10px] font-bold text-[#FF592C] bg-[#FF592C]/10 px-2 py-0.5 rounded-full uppercase">API</span>
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
          SECTION 2: THE RUNWAY // 27 SESSIONS TO CODEZAP 3.0
          ========================================================================= */}
      <section id="runway" className="bg-[#F4F5F6] py-20 border-y border-[#E6E8EC] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="ui8-stage">THE 27-DAY SPRINT // THE RUNWAY</span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#23262F]">
              The Runway: 27 Days to CodeZap 3.0
            </h2>
            <p className="mt-3 text-base sm:text-lg text-[#777E90] leading-relaxed">
              Ten tactical phases designed to forge autonomous engineering pods. A high-velocity crucible preparing builders for the national 36-hour hackathon.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { phase: "Phase 01", days: "6 Days", title: "The Problem Vault", focus: "Statement Decoding & Council Defense", color: "#3772FF" },
              { phase: "Phase 02", days: "10 Days", title: "Build Arena", focus: "High-Density Execution & Deep Iteration", color: "#FF592C" },
              { phase: "Phase 03", days: "1 Day", title: "Stage Craft", focus: "Executive Presentation & Defense Mastery", color: "#9757D7" },
              { phase: "Phase 04", days: "1 Day", title: "The Panel Round", focus: "Live Cross-Examination & Architecture Audits", color: "#EF466F" },
              { phase: "Phase 05", days: "1 Day", title: "AI Lab", focus: "Cognitive Amplification & Generative Runtimes", color: "#45B26B" },
              { phase: "Phase 06", days: "1 Day", title: "Vibe Coding Sprint", focus: "Flow-State Velocity Under Simulated Pressure", color: "#FF592C" },
              { phase: "Phase 07", days: "1 Day", title: "Startup Launchpad", focus: "Venture Dynamics, Ecosystem & Capital", color: "#3772FF" },
              { phase: "Phase 08", days: "3 Days", title: "Team Rhythm", focus: "Pod Velocity, Workflow & Delivery Cadence", color: "#9757D7" },
              { phase: "Phase 09", days: "1 Day", title: "Career Gateway", focus: "Industry Credentialing & Zero-Filter Vetting", color: "#45B26B" },
              { phase: "Phase 10", days: "2 Days", title: "The Arena Pre-Finals", focus: "Demo Day & Selection for 36-Hr Hackathon", color: "#EF466F" },
            ].map((p, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-[#E6E8EC] shadow-2xs hover:shadow-md hover:border-[#23262F] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#777E90]">
                      {p.phase}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                      style={{ backgroundColor: `${p.color}15`, color: p.color }}
                    >
                      {p.days}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#23262F] group-hover:text-[#FF592C] transition-colors leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#777E90] mt-2 leading-relaxed">
                    {p.focus}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F4F5F6] flex items-center justify-between text-[11px] font-semibold text-[#777E90]">
                  <span>Offline Immersion</span>
                  <span className="text-[#23262F] font-bold">Cycle {idx + 1}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Runway Summary Metric Strip */}
          <div className="mt-8 p-4 sm:p-6 rounded-2xl bg-white border border-[#E6E8EC] flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#45B26B] animate-pulse" />
              <span className="font-bold text-[#23262F]">27 Total Days of In-Person Immersion</span>
              <span className="text-[#777E90]">&bull;</span>
              <span className="text-[#777E90]">Zero Theoretical Filler</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#777E90]">
              <span>Qualifies for:</span>
              <strong className="text-[#23262F] px-2 py-0.5 rounded bg-[#F4F5F6] border border-[#E6E8EC]">CodeZap 3.0 // 36-Hour Hackathon</strong>
            </div>
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
                Verified Engineering Record
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
                When an engineer walks into an industry evaluation backed by a verified DOS Club record, there is no guesswork. Hiring leaders see authentic pull requests, distributed systems benchmarks, and peer review logs.
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
                Verified DOS Club records bypass standard junior applicant filters because every commit is cryptographically audited.
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
          SECTION: STUDENT CASE STUDIES & ARTICLES (SINGLE-LINE HORIZONTAL SCROLL)
          ========================================================================= */}
      <section id="case-studies" className="py-24 border-b border-[#E6E8EC] scroll-mt-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Block Header with Carousel Navigation */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="max-w-2xl">
              <span className="ui8-stage">STUDENT BLOG &amp; CASE STUDIES</span>
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#23262F]">
                Real builders, real systems.
              </h2>
              <p className="mt-3 text-base sm:text-lg text-[#777E90] leading-relaxed">
                Technical articles and architecture breakdowns authored by student engineers in Batch 3. Peer-audited before publication and shared across the engineering commons.
              </p>
            </div>

            {/* Scroll Navigation Arrows */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => scrollCaseStudies("left")}
                aria-label="Scroll previous articles"
                className="w-11 h-11 rounded-full border border-[#E6E8EC] hover:border-[#23262F] bg-[#FCFCFD] hover:bg-white text-[#23262F] flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scrollCaseStudies("right")}
                aria-label="Scroll next articles"
                className="w-11 h-11 rounded-full border border-[#E6E8EC] hover:border-[#23262F] bg-[#FCFCFD] hover:bg-white text-[#23262F] flex items-center justify-center transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Single-Line Horizontal Scroll Track (Scrolls from Right to Left / Left to Right) */}
          <div
            ref={caseStudyScrollRef}
            className="flex gap-6 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
          >
            {INITIAL_CASE_STUDIES.map((study) => (
              <Link
                key={study.id}
                href={`/casestudies/${study.slug}`}
                className="w-[340px] sm:w-[390px] shrink-0 snap-start bg-white rounded-3xl border border-[#E6E8EC] p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  {/* Article Cover Image with Category & Read Time Pill */}
                  <div className="aspect-16/10 rounded-2xl overflow-hidden relative mb-4 bg-[#F4F5F6]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={study.coverImage}
                      alt={study.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#23262F] text-[10px] font-bold uppercase tracking-wider border border-[#E6E8EC] shadow-xs">
                      {study.category}
                    </div>
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-[#23262F]/80 backdrop-blur-md text-white text-[10px] font-medium shadow-xs">
                      {study.readTime} &bull; {study.publishedAt}
                    </div>
                  </div>

                  {/* Metrics highlight snippet */}
                  <div className="flex items-center gap-1.5 mb-2.5">
                    {study.metrics.slice(0, 2).map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#F4F5F6] border border-[#E6E8EC] text-[10px] font-bold text-[#23262F]"
                      >
                        <strong className="text-[#FF592C]">{m.value}</strong> {m.label}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-[#23262F] group-hover:text-[#FF592C] transition-colors leading-snug line-clamp-2">
                    {study.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="mt-2 text-xs text-[#777E90] leading-relaxed line-clamp-3">
                    {study.summary}
                  </p>
                </div>

                {/* Author Row & Share Action */}
                <div className="pt-4 mt-4 border-t border-[#E6E8EC] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={study.student.avatar}
                      alt={study.student.name}
                      className="w-9 h-9 rounded-full object-cover border border-[#E6E8EC]"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#23262F]">
                        {study.student.name}
                      </div>
                      <div className="text-[10px] text-[#777E90]">
                        {study.student.college}
                      </div>
                    </div>
                  </div>

                  {/* Read story pill */}
                  <span className="text-xs font-bold text-[#FF592C] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    <span>Read Article</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Student Author Engagement Banner (Student Article Publishing Vision) */}
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-[#F4F5F6] border border-[#E6E8EC] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF592C]">
                <span>Student Publisher Program</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#23262F]">
                Are you a builder in Batch 3? Publish your engineering breakdown.
              </h3>
              <p className="text-xs sm:text-sm text-[#777E90] max-w-xl">
                Defend your architecture, pass zero-grace review, and submit your case study. Published articles are showcased on the DeScience OS Club website and shared with tech recruiters.
              </p>
            </div>
            <a
              href="#enquire"
              className="h-11 px-6 rounded-full bg-[#23262F] hover:bg-[#FF592C] text-white text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-2 shrink-0"
            >
              <span>Submit Your Article</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: UI8 TEAM (.team) — STUDENT COHORT ROSTER
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
            &ldquo;When an engineer walks into an evaluation with a verified DOS Club engineering record, the conversation fundamentally changes. We don&apos;t ask them to reverse linked lists on a whiteboard. We inspect their verified commit history and architecture defenses. They are ready on day zero.&rdquo;
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
      {/* =========================================================================
          SECTION 10: ZENLER-INSPIRED QUALITY COUNTERS (.quality)
          ========================================================================= */}
      <section className="py-20 border-b border-[#E6E8EC] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stat 1 - Green Pastel */}
            <div className="bg-[#E8F8EE] border border-[#45B26B]/25 rounded-3xl p-6 sm:p-8 flex flex-col items-start text-left shadow-2xs transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center justify-between w-full mb-6">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#45B26B]/20 text-[#2B8A4A]">
                  CURRICULUM DEPTH
                </span>
                <div className="w-10 h-10 rounded-xl bg-white/80 text-[#45B26B] flex items-center justify-center shadow-xs">
                  <TerminalIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold text-[#23262F] tracking-tight">
                27
              </div>
              <div className="text-base font-bold text-[#23262F] mt-2">
                Production Systems
              </div>
              <div className="text-xs text-[#777E90] mt-1.5 leading-relaxed">
                Built from scratch with zero high-level shortcuts
              </div>
            </div>

            {/* Stat 2 - Purple Pastel */}
            <div className="bg-[#F3EEFC] border border-[#9757D7]/25 rounded-3xl p-6 sm:p-8 flex flex-col items-start text-left shadow-2xs transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center justify-between w-full mb-6">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#9757D7]/20 text-[#6E2BB1]">
                  COMMONS COMMITS
                </span>
                <div className="w-10 h-10 rounded-xl bg-white/80 text-[#9757D7] flex items-center justify-center shadow-xs">
                  <LayersIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold text-[#23262F] tracking-tight">
                1,420+
              </div>
              <div className="text-base font-bold text-[#23262F] mt-2">
                Merged Pull Requests
              </div>
              <div className="text-xs text-[#777E90] mt-1.5 leading-relaxed">
                Peer reviewed across the shared code commons
              </div>
            </div>

            {/* Stat 3 - Amber Pastel */}
            <div className="bg-[#FFF9E6] border border-[#FFB800]/25 rounded-3xl p-6 sm:p-8 flex flex-col items-start text-left shadow-2xs transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center justify-between w-full mb-6">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#FFB800]/20 text-[#B87B00]">
                  BATCH 3 BUILDERS
                </span>
                <div className="w-10 h-10 rounded-xl bg-white/80 text-[#FFB800] flex items-center justify-center shadow-xs">
                  <UsersIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold text-[#23262F] tracking-tight">
                42
              </div>
              <div className="text-base font-bold text-[#23262F] mt-2">
                Engineers in Batch 3
              </div>
              <div className="text-xs text-[#777E90] mt-1.5 leading-relaxed">
                Actively in collaborative defense sessions
              </div>
            </div>

            {/* Stat 4 - Cyan Pastel */}
            <div className="bg-[#E6F8FA] border border-[#00B2FE]/25 rounded-3xl p-6 sm:p-8 flex flex-col items-start text-left shadow-2xs transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex items-center justify-between w-full mb-6">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#00B2FE]/20 text-[#007EA7]">
                  DEFENSE RIGOR
                </span>
                <div className="w-10 h-10 rounded-xl bg-white/80 text-[#00B2FE] flex items-center justify-center shadow-xs">
                  <ShieldCheckIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold text-[#23262F] tracking-tight">
                100%
              </div>
              <div className="text-base font-bold text-[#23262F] mt-2">
                Peer Code Audited
              </div>
              <div className="text-xs text-[#777E90] mt-1.5 leading-relaxed">
                Zero unverified commits merged into main
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 11: UI8 WORKOUTS (.workouts) — VERIFIED ENGINEERING RECORD
          ========================================================================= */}
      <section className="bg-[#F4F5F6] py-24 border-b border-[#E6E8EC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Record Preview Card */}
            <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#E6E8EC] shadow-md">
              <div className="flex items-center justify-between pb-6 border-b border-[#E6E8EC]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#23262F] text-white flex items-center justify-center font-bold text-base">
                    D3
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#23262F]">
                      DOS-B3-009 // VERIFIED RECORD
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

              {/* Record Matrix */}
              <div className="py-6 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#777E90] font-medium">Immersion Attendance</span>
                  <span className="font-bold text-[#23262F]">27 of 27 (100% In-Person)</span>
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
                  placeholder="Enter Student ID e.g. DOS-B3-009"
                  value={verifyKey}
                  onChange={(e) => setVerifyKey(e.target.value)}
                  className="flex-1 bg-[#F4F5F6] border border-[#E6E8EC] rounded-full px-4 py-2.5 text-xs text-[#23262F] placeholder-[#777E90] focus:outline-none focus:border-[#23262F]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#23262F] hover:bg-[#FF592C] text-white text-xs font-bold transition-colors cursor-pointer"
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
                TalentOS compiles every single commit, peer review remark, and benchmark record into an immutable verified engineering record.
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
                  href="/login?redirect=/record/DOS-B3-001"
                  className="ui8-btn-stroke"
                >
                  <span>Access Engineering Records</span>
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

              {/* Official Social & Community Channels */}
              <div className="pt-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#777E90] mb-2.5">
                  Official Channels & Community
                </div>
                <div className="flex items-center gap-2.5">
                  {/* WhatsApp Channel */}
                  <a
                    href="https://whatsapp.com/channel/0029VaDeScienceOSClub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[#E6E8EC]/60 hover:bg-[#25D366] text-[#23262F] hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105"
                    title="Join our WhatsApp Channel"
                    aria-label="WhatsApp"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
                    </svg>
                  </a>

                  {/* Discord Server */}
                  <a
                    href="https://discord.gg/descience-osclub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[#E6E8EC]/60 hover:bg-[#5865F2] text-[#23262F] hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105"
                    title="Join our Discord Builders Community"
                    aria-label="Discord"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="https://www.linkedin.com/company/touchmark-descience/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[#E6E8EC]/60 hover:bg-[#0A66C2] text-[#23262F] hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105"
                    title="Follow on LinkedIn"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                  </a>

                  {/* GitHub */}
                  <a
                    href="https://github.com/descience-osclub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[#E6E8EC]/60 hover:bg-[#24292e] text-[#23262F] hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105"
                    title="Explore our GitHub Commons"
                    aria-label="GitHub"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  </a>

                  {/* Twitter / X */}
                  <a
                    href="https://x.com/descience_club"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[#E6E8EC]/60 hover:bg-black text-[#23262F] hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105"
                    title="Follow on X"
                    aria-label="X (Twitter)"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>

                  {/* YouTube */}
                  <a
                    href="https://youtube.com/@descienceosclub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-[#E6E8EC]/60 hover:bg-[#FF0000] text-[#23262F] hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105"
                    title="Subscribe on YouTube"
                    aria-label="YouTube"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                </div>
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
