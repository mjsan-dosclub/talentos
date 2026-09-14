"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getClientSession, TalentosUser } from "@/lib/session";
import {
  ArrowRightIcon,
  CheckIcon,
  SearchIcon,
  ShieldCheckIcon,
  BoltIcon,
  AwardIcon,
  GlobeIcon,
  ClockIcon,
  AcademicCapIcon,
  UsersIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
} from "@/components/Icons";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<TalentosUser | null>(null);

  // Minimal Enquiry Form State (as requested)
  const [enquiry, setEnquiry] = useState({
    name: "",
    contact: "",
    category: "Student",
    message: "",
  });
  const [enquiryStatus, setEnquiryStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [enquiryRef, setEnquiryRef] = useState<string | null>(null);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

  // Subtle Dossier Verification popover/input
  const [verifyKey, setVerifyKey] = useState("");
  const [showVerify, setShowVerify] = useState(false);

  useEffect(() => {
    setUser(getClientSession());
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

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#0A0A0A] font-sans selection:bg-[#1B7A55]/15 selection:text-[#1B7A55] flex flex-col justify-between antialiased">
      {/* 1. Header Navigation (Equals style: minimal, airy, refined) */}
      <header className="sticky top-0 z-50 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[rgba(0,0,0,0.06)] transition-all">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-18 flex items-center justify-between gap-6">
          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/dos-club-logo.png"
              alt="DeScience Open Source Club"
              className="h-9 w-9 rounded-full object-cover ring-1 ring-black/10 group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/dos-club-logo.png";
              }}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base tracking-tight text-[#0A0A0A] group-hover:text-[#1B7A55] transition-colors">
                  TalentOS
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/5 text-neutral-600 border border-black/5 hidden sm:inline">
                  DOS Club
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 font-normal hidden md:inline">
                Your Passport to the AI World
              </span>
            </div>
          </Link>

          {/* Minimal Editorial Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-neutral-600">
            <a href="#evidence" className="hover:text-black transition-colors">
              Evidence
            </a>
            <a href="#lounge" className="hover:text-black transition-colors">
              The Lounge
            </a>
            <a href="#passport" className="hover:text-black transition-colors">
              Passport
            </a>
            <a href="#recognition" className="hover:text-black transition-colors">
              Recognition
            </a>
            <a href="#enquire" className="hover:text-black transition-colors">
              Enquire
            </a>
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            {/* Verify Dossier Quick Trigger */}
            <button
              type="button"
              onClick={() => setShowVerify(!showVerify)}
              className="text-xs font-medium text-neutral-600 hover:text-black px-2.5 py-1.5 rounded-lg hover:bg-black/5 transition-colors hidden sm:inline-flex items-center gap-1.5 cursor-pointer"
            >
              <SearchIcon className="w-3.5 h-3.5" />
              <span>Verify</span>
            </button>

            {/* Primary CTA: Become a Member */}
            <a
              href="https://membership.descienceosclub.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-[#0A0A0A] hover:bg-[#1B7A55] text-white text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center gap-1.5 group cursor-pointer"
            >
              <span>Become a Member</span>
              <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* Portal Member Sign In */}
            {user ? (
              <Link
                href={getDashboardLink()}
                className="px-3 py-2 bg-black/5 hover:bg-black/10 text-neutral-800 text-xs font-medium rounded-lg transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-xs font-medium text-neutral-600 hover:text-black px-2 py-1.5 transition-colors hidden lg:inline"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Expandable Verification Bar */}
        {showVerify && (
          <div className="bg-white border-b border-[rgba(0,0,0,0.08)] py-3 px-5 animate-in slide-in-from-top-2 duration-150">
            <form onSubmit={handleVerifySubmit} className="max-w-xl mx-auto flex items-center gap-2">
              <span className="text-xs text-neutral-500 font-mono shrink-0">Student ID:</span>
              <input
                type="text"
                value={verifyKey}
                onChange={(e) => setVerifyKey(e.target.value)}
                placeholder="e.g. DOS-B3-009 or DOS-B3-001"
                className="flex-1 px-3 py-1.5 text-xs bg-[#FAF9F5] border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1B7A55] font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#0A0A0A] hover:bg-[#1B7A55] text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                Inspect &rarr;
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Main Editorial Canvas */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-16 sm:py-24 flex flex-col gap-28 sm:gap-40">
        {/* =========================================================================
            SECTION 1: HERO SECTION - Editorial, Large Typography
            "DOS Club TalentOS. Your Passport to the AI World."
            ========================================================================= */}
        <section aria-label="Hero" className="flex flex-col items-start text-left gap-8 pt-4 sm:pt-10 max-w-4xl">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF7F2] border border-[#1B7A55]/20 text-[#1B7A55] text-xs font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B7A55]" />
            <span>DOS Club TalentOS</span>
          </div>

          {/* Main Title with Equals-style Editorial Serif & Grotesque Pairing */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-normal tracking-tight text-[#0A0A0A] leading-[1.08]">
              Your Passport to the AI World.
            </h1>
            <p className="text-xl sm:text-2xl text-neutral-600 font-light leading-snug">
              Not another course. Not another certificate.{" "}
              <span className="text-[#0A0A0A] font-normal block sm:inline">
                A journey that makes your capability visible.
              </span>
            </p>
          </div>

          <p className="text-base sm:text-lg text-neutral-600 max-w-2xl leading-relaxed font-light">
            There is a world behind this door. An ecosystem where students build, break, and master 27 real-world systems,
            graduating with authentic evidence that speaks before their résumé does.
          </p>

          {/* Minimal CTAs (As requested: only two major CTAs) */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="https://membership.descienceosclub.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 rounded-xl bg-[#0A0A0A] hover:bg-[#1B7A55] text-white text-sm font-semibold tracking-wide transition-all shadow-sm flex items-center gap-2 group cursor-pointer"
            >
              <span>Become a Member</span>
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="#enquire"
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300/80 text-sm font-medium transition-all cursor-pointer"
            >
              <span>Enquire</span>
            </a>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: CURIOSITY - "Behind every opportunity is evidence"
            Poetic, staggered literary cadence. No operational UI screenshots.
            ========================================================================= */}
        <section id="evidence" aria-label="Curiosity and Evidence" className="flex flex-col gap-10 border-t border-[rgba(0,0,0,0.08)] pt-16 scroll-mt-24">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-[#1B7A55] font-semibold block mb-3">
              The Invisible Engine
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#0A0A0A] leading-tight">
              Behind every opportunity is evidence.
            </h2>
          </div>

          {/* Literary Cadence Flow */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            <div className="bg-white p-7 rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[160px] group hover:border-[#1B7A55]/40 transition-colors">
              <span className="text-xs font-mono text-neutral-400">01</span>
              <p className="text-lg font-serif text-[#0A0A0A] group-hover:text-[#1B7A55] transition-colors">
                A workshop attended.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[160px] group hover:border-[#1B7A55]/40 transition-colors">
              <span className="text-xs font-mono text-neutral-400">02</span>
              <p className="text-lg font-serif text-[#0A0A0A] group-hover:text-[#1B7A55] transition-colors">
                A problem solved.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[160px] group hover:border-[#1B7A55]/40 transition-colors">
              <span className="text-xs font-mono text-neutral-400">03</span>
              <p className="text-lg font-serif text-[#0A0A0A] group-hover:text-[#1B7A55] transition-colors">
                A project built.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[160px] group hover:border-[#1B7A55]/40 transition-colors">
              <span className="text-xs font-mono text-neutral-400">04</span>
              <p className="text-lg font-serif text-[#0A0A0A] group-hover:text-[#1B7A55] transition-colors">
                A skill demonstrated.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[160px] group hover:border-[#1B7A55]/40 transition-colors">
              <span className="text-xs font-mono text-neutral-400">05</span>
              <p className="text-lg font-serif text-[#0A0A0A] group-hover:text-[#1B7A55] transition-colors">
                A mentor who noticed.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[160px] group hover:border-[#1B7A55]/40 transition-colors">
              <span className="text-xs font-mono text-neutral-400">06</span>
              <p className="text-lg font-serif text-[#0A0A0A] group-hover:text-[#1B7A55] transition-colors">
                A credential earned.
              </p>
            </div>
          </div>

          <div className="max-w-2xl pt-4">
            <p className="text-base sm:text-xl text-neutral-700 font-light leading-relaxed">
              TalentOS quietly connects them. When industry meets you, your work speaks before your résumé does.
            </p>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: THE "AIRPORT LOUNGE" EMOTIONAL SECTION
            "Some students wait for opportunity. DOS Club members prepare before it arrives."
            Avoid literal VIP language. Focus on access and preparation.
            ========================================================================= */}
        <section id="lounge" aria-label="Access and Preparation" className="flex flex-col gap-12 border-t border-[rgba(0,0,0,0.08)] pt-16 scroll-mt-24">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#1B7A55] font-semibold block">
              The Lounge Principle
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#0A0A0A] leading-tight">
              Some students wait for opportunity.{" "}
              <span className="text-[#1B7A55] block sm:inline">
                DOS Club members prepare before it arrives.
              </span>
            </h2>
            <p className="text-base sm:text-lg text-neutral-600 font-light leading-relaxed">
              Not superiority. But access, preparation, privilege, and recognition. The feeling of stepping into the lounge while the general public waits at the gate.
            </p>
          </div>

          {/* Subtle Visual Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-2xl border border-[rgba(0,0,0,0.07)] flex flex-col justify-between min-h-[220px]">
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">01 // Access</span>
                <h3 className="text-xl font-serif text-[#0A0A0A]">Priority Access</h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Direct pathways into engineering conversations without getting lost in unverified applicant tracking black holes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[rgba(0,0,0,0.07)] flex flex-col justify-between min-h-[220px]">
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">02 // Depth</span>
                <h3 className="text-xl font-serif text-[#0A0A0A]">Curated Learning</h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                A 27-workshop systems curriculum exploring POSIX syscalls, Raft consensus, and AI infrastructure from first principles.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[rgba(0,0,0,0.07)] flex flex-col justify-between min-h-[220px]">
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">03 // Network</span>
                <h3 className="text-xl font-serif text-[#0A0A0A]">Industry Exposure</h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Direct interactions with staff engineers, technical fellows, and architects who evaluate code through production lenses.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[rgba(0,0,0,0.07)] flex flex-col justify-between min-h-[220px]">
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">04 // Merit</span>
                <h3 className="text-xl font-serif text-[#0A0A0A]">Recognition</h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Students who consistently show up, build, and submit receive durable, visible honour rather than end-of-year participation certificates.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[rgba(0,0,0,0.07)] flex flex-col justify-between min-h-[220px] sm:col-span-2 lg:col-span-2">
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">05 // Horizons</span>
                <h3 className="text-xl font-serif text-[#0A0A0A]">International Opportunities</h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed max-w-xl">
                Connecting promising engineering minds across Tamil Nadu with global technology hubs in Singapore and beyond, expanding where your capabilities can take you.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: STUDENT PASSPORT CONCEPT
            Passport-style stamps / milestones in a refined, modern editorial style
            ========================================================================= */}
        <section id="passport" aria-label="Student Passport" className="flex flex-col gap-12 border-t border-[rgba(0,0,0,0.08)] pt-16 scroll-mt-24">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#1B7A55] font-semibold block">
              The Digital Passport
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#0A0A0A] leading-tight">
              Your Passport to the AI World.
            </h2>
            <p className="text-base sm:text-lg text-neutral-600 font-light leading-relaxed">
              Every student gradually collects six dimensions of real capability. Not gamified tokens, but permanent stamps of authentic engineering accomplishment.
            </p>
          </div>

          {/* Passport Stamps Grid (Refined, Modern, Architectural) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stamp 1: Learning */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 relative overflow-hidden flex flex-col justify-between min-h-[200px] shadow-sm">
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">STAMP 01 // LEARNING</span>
                <span className="w-2 h-2 rounded-full bg-[#1B7A55]" />
              </div>
              <div className="space-y-1 my-3">
                <p className="text-base font-serif font-medium text-[#0A0A0A]">27 Systems Workshops</p>
                <p className="text-xs text-neutral-500 font-light">
                  POSIX internals, memory allocators, Raft log replication, eBPF & GPU shaders.
                </p>
              </div>
              <div className="pt-3 border-t border-dashed border-neutral-200 text-[10px] font-mono text-neutral-400">
                AUDITED CURRICULUM // VERIFIED
              </div>
            </div>

            {/* Stamp 2: Projects */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 relative overflow-hidden flex flex-col justify-between min-h-[200px] shadow-sm">
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">STAMP 02 // PROJECTS</span>
                <span className="w-2 h-2 rounded-full bg-[#1B7A55]" />
              </div>
              <div className="space-y-1 my-3">
                <p className="text-base font-serif font-medium text-[#0A0A0A]">Production Code Repositories</p>
                <p className="text-xs text-neutral-500 font-light">
                  Hermetic container builds, clean concurrency, and working distributed primitives.
                </p>
              </div>
              <div className="pt-3 border-t border-dashed border-neutral-200 text-[10px] font-mono text-neutral-400">
                COMMITS STAMPED & ARCHIVED
              </div>
            </div>

            {/* Stamp 3: Credentials */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 relative overflow-hidden flex flex-col justify-between min-h-[200px] shadow-sm">
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">STAMP 03 // CREDENTIALS</span>
                <span className="w-2 h-2 rounded-full bg-[#1B7A55]" />
              </div>
              <div className="space-y-1 my-3">
                <p className="text-base font-serif font-medium text-[#0A0A0A]">Verified Industry Certifications</p>
                <p className="text-xs text-neutral-500 font-light">
                  Integrated validation from Linux Foundation, AWS, and accredited registries.
                </p>
              </div>
              <div className="pt-3 border-t border-dashed border-neutral-200 text-[10px] font-mono text-neutral-400">
                REGISTRY ATTESTED
              </div>
            </div>

            {/* Stamp 4: Recognition */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 relative overflow-hidden flex flex-col justify-between min-h-[200px] shadow-sm">
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">STAMP 04 // RECOGNITION</span>
                <span className="w-2 h-2 rounded-full bg-[#1B7A55]" />
              </div>
              <div className="space-y-1 my-3">
                <p className="text-base font-serif font-medium text-[#0A0A0A]">Staff Engineer Standouts</p>
                <p className="text-xs text-neutral-500 font-light">
                  Independent citations honoring architectural clarity, grit, and peer mentorship.
                </p>
              </div>
              <div className="pt-3 border-t border-dashed border-neutral-200 text-[10px] font-mono text-neutral-400">
                MERIT ENDORSEMENT
              </div>
            </div>

            {/* Stamp 5: Evidence */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 relative overflow-hidden flex flex-col justify-between min-h-[200px] shadow-sm">
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">STAMP 05 // EVIDENCE</span>
                <span className="w-2 h-2 rounded-full bg-[#1B7A55]" />
              </div>
              <div className="space-y-1 my-3">
                <p className="text-base font-serif font-medium text-[#0A0A0A]">Zero-Grace Attendance Logs</p>
                <p className="text-xs text-neutral-500 font-light">
                  Geofenced physical presence proving punctuality, discipline, and stamina.
                </p>
              </div>
              <div className="pt-3 border-t border-dashed border-neutral-200 text-[10px] font-mono text-neutral-400">
                IMMUTABLE TIMESTAMPS
              </div>
            </div>

            {/* Stamp 6: Exposure */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 relative overflow-hidden flex flex-col justify-between min-h-[200px] shadow-sm">
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">STAMP 06 // EXPOSURE</span>
                <span className="w-2 h-2 rounded-full bg-[#1B7A55]" />
              </div>
              <div className="space-y-1 my-3">
                <p className="text-base font-serif font-medium text-[#0A0A0A]">Industry Fellow Defenses</p>
                <p className="text-xs text-neutral-500 font-light">
                  Defending systems architectures directly in front of engineering leadership.
                </p>
              </div>
              <div className="pt-3 border-t border-dashed border-neutral-200 text-[10px] font-mono text-neutral-400">
                PEER VALIDATED
              </div>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-lg font-serif text-[#1B7A55]">
              &ldquo;Graduate with evidence, not just eligibility.&rdquo;
            </p>
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: INDUSTRY SECTION - Small, punchy, proof over resume
            "Industry doesn't need another résumé. It needs proof."
            ========================================================================= */}
        <section aria-label="Industry Perspective" className="flex flex-col gap-6 border-t border-[rgba(0,0,0,0.08)] pt-16">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#1B7A55] font-semibold block">
              The Industry Shift
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-[#0A0A0A]">
              Industry doesn&apos;t need another résumé. It needs proof.
            </h2>
            <p className="text-base text-neutral-600 font-light leading-relaxed">
              TalentOS helps DOS Club students build that proof over time.
            </p>
          </div>

          {/* Minimalist Fragment Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="px-4 py-2 rounded-full bg-white border border-neutral-200 text-xs font-medium text-neutral-800 shadow-2xs">
              27 Workshops
            </span>
            <span className="px-4 py-2 rounded-full bg-white border border-neutral-200 text-xs font-medium text-neutral-800 shadow-2xs">
              Projects
            </span>
            <span className="px-4 py-2 rounded-full bg-white border border-neutral-200 text-xs font-medium text-neutral-800 shadow-2xs">
              Credentials
            </span>
            <span className="px-4 py-2 rounded-full bg-white border border-neutral-200 text-xs font-medium text-neutral-800 shadow-2xs">
              Mentor Observations
            </span>
            <span className="px-4 py-2 rounded-full bg-white border border-neutral-200 text-xs font-medium text-neutral-800 shadow-2xs">
              Learning Evidence
            </span>
          </div>
        </section>

        {/* =========================================================================
            SECTION 6: COMMITMENT AND HONOUR
            "Commitment should be visible."
            Growth, not grading.
            ========================================================================= */}
        <section id="recognition" aria-label="Commitment and Honour" className="flex flex-col gap-10 border-t border-[rgba(0,0,0,0.08)] pt-16 scroll-mt-24">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#1B7A55] font-semibold block">
              Growth, Not Grading
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#0A0A0A] leading-tight">
              Commitment should be visible.
            </h2>
            <p className="text-base sm:text-lg text-neutral-600 font-light leading-relaxed">
              Students who consistently attend, build, learn, submit, improve, and contribute deserve visible recognition. Not just a certificate at the end.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[rgba(0,0,0,0.06)] flex flex-col gap-2">
              <span className="text-xs font-mono text-[#1B7A55] font-semibold">01</span>
              <span className="font-serif text-sm text-[#0A0A0A]">Consistency</span>
              <p className="text-[11px] text-neutral-500 font-light">Punctual presence across every milestone.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[rgba(0,0,0,0.06)] flex flex-col gap-2">
              <span className="text-xs font-mono text-[#1B7A55] font-semibold">02</span>
              <span className="font-serif text-sm text-[#0A0A0A]">Contribution</span>
              <p className="text-[11px] text-neutral-500 font-light">Writing code that strengthens the commons.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[rgba(0,0,0,0.06)] flex flex-col gap-2">
              <span className="text-xs font-mono text-[#1B7A55] font-semibold">03</span>
              <span className="font-serif text-sm text-[#0A0A0A]">Improvement</span>
              <p className="text-[11px] text-neutral-500 font-light">Closing gaps through relentless iteration.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[rgba(0,0,0,0.06)] flex flex-col gap-2">
              <span className="text-xs font-mono text-[#1B7A55] font-semibold">04</span>
              <span className="font-serif text-sm text-[#0A0A0A]">Initiative</span>
              <p className="text-[11px] text-neutral-500 font-light">Tackling hard bugs beyond assignments.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[rgba(0,0,0,0.06)] flex flex-col gap-2">
              <span className="text-xs font-mono text-[#1B7A55] font-semibold">05</span>
              <span className="font-serif text-sm text-[#0A0A0A]">Completion</span>
              <p className="text-[11px] text-neutral-500 font-light">Delivering working systems to the finish line.</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[rgba(0,0,0,0.06)] flex flex-col gap-2">
              <span className="text-xs font-mono text-[#1B7A55] font-semibold">06</span>
              <span className="font-serif text-sm text-[#0A0A0A]">Execution</span>
              <p className="text-[11px] text-neutral-500 font-light">Real code performing in real environments.</p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 7: MINIMALIST ENQUIRY & CALL TO ACTION
            Only two major CTAs: Become a Member & Enquire
            Enquiry asks only: Name, Email/Mobile, I am a (Student/Parent/College/Industry), Message.
            ========================================================================= */}
        <section id="enquire" aria-label="Admissions and Enquiry" className="border-t border-[rgba(0,0,0,0.08)] pt-16 scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Primary CTA Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase tracking-widest text-[#1B7A55] font-semibold block">
                  Next Step
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#0A0A0A] leading-tight">
                  Enter the journey.
                </h2>
                <p className="text-sm text-neutral-600 font-light leading-relaxed">
                  Join the cohort directly through the membership portal, or send us a brief enquiry if you are exploring for yourself, your institution, or your company.
                </p>
              </div>

              {/* Become a Member Primary Action Block */}
              <div className="bg-white p-7 rounded-2xl border border-neutral-200/90 shadow-sm space-y-4">
                <span className="text-xs font-semibold text-neutral-900 block">
                  Immediate Member Enrollment
                </span>
                <p className="text-xs text-neutral-500 leading-relaxed font-light">
                  Access the complete 27-workshop curriculum, passport credentialing, and live engineering hub sessions.
                </p>
                <a
                  href="https://membership.descienceosclub.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-[#0A0A0A] hover:bg-[#1B7A55] text-white text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Become a Member</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            {/* Right: Short Enquiry Form */}
            <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-2xl border border-neutral-200/90 shadow-sm">
              {enquiryStatus === "success" ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[#EBF7F2] text-[#1B7A55] flex items-center justify-center mx-auto">
                    <CheckIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-serif text-[#0A0A0A]">Enquiry Received</h3>
                  <p className="text-xs text-neutral-600 font-mono">Reference: {enquiryRef}</p>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto font-light">
                    Thank you. A member of our team will review your message and reach out shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-serif text-[#0A0A0A]">Enquire</h3>
                    <p className="text-xs text-neutral-500 font-light">
                      For students, parents, colleges, and industry partners.
                    </p>
                  </div>

                  {enquiryError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                      {enquiryError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-neutral-700 block">Name</label>
                      <input
                        type="text"
                        required
                        value={enquiry.name}
                        onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })}
                        placeholder="Your full name"
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-neutral-300 rounded-xl text-xs text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#1B7A55]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-neutral-700 block">Email or Mobile</label>
                      <input
                        type="text"
                        required
                        value={enquiry.contact}
                        onChange={(e) => setEnquiry({ ...enquiry, contact: e.target.value })}
                        placeholder="name@domain.com or +91..."
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-neutral-300 rounded-xl text-xs text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#1B7A55]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-700 block">I am a</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {["Student", "Parent", "College", "Industry"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setEnquiry({ ...enquiry, category: cat })}
                          className={`py-2 px-3 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                            enquiry.category === cat
                              ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
                              : "bg-[#FAF9F5] text-neutral-700 border-neutral-200 hover:border-neutral-300"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-700 block">Message</label>
                    <textarea
                      rows={3}
                      value={enquiry.message}
                      onChange={(e) => setEnquiry({ ...enquiry, message: e.target.value })}
                      placeholder="Your question or ambition..."
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-neutral-300 rounded-xl text-xs text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#1B7A55] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={enquiryStatus === "loading"}
                    className="w-full py-3 rounded-xl bg-[#0A0A0A] hover:bg-[#1B7A55] disabled:opacity-50 text-white text-xs font-semibold tracking-wide transition-all shadow-sm cursor-pointer"
                  >
                    {enquiryStatus === "loading" ? "Submitting..." : "Send Enquiry →"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* 8. Footer (Equals-inspired light footer with Touchmark Descience initiative) */}
      <footer className="border-t border-[rgba(0,0,0,0.08)] bg-white py-14 px-5 sm:px-8 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col gap-10">
          {/* Main Footer Row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {/* Left: Club Logo & Touchmark Descience Initiative */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/dos-club-logo.png"
                  alt="DeScience Open Source Club"
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-black/10"
                />
                <span className="font-serif text-lg text-[#0A0A0A]">
                  TalentOS by DeScience Open Source Club
                </span>
              </div>

              {/* An initiative of Touchmark Descience */}
              <div className="flex items-center gap-2.5 pt-1">
                <span className="text-xs text-neutral-500 font-light">An initiative of</span>
                <a
                  href="https://touchmarkdes.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center hover:opacity-80 transition-opacity"
                  title="Touchmark Descience"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/touchmark-descience-logo.png"
                    alt="Touchmark Descience"
                    className="h-6 w-auto object-contain"
                  />
                </a>
              </div>
            </div>

            {/* Right: Quick Links */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-neutral-600">
              <a
                href="https://membership.descienceosclub.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#1B7A55] hover:underline"
              >
                Become a Member
              </a>
              <a href="#enquire" className="hover:text-black transition-colors">
                Enquire
              </a>
              <Link href="/login" className="hover:text-black transition-colors">
                Portal Sign In
              </Link>
              <a
                href="https://touchmarkdes.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black transition-colors"
              >
                touchmarkdes.com &rarr;
              </a>
            </div>
          </div>

          {/* Bottom Copyright Row */}
          <div className="pt-6 border-t border-[rgba(0,0,0,0.06)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-neutral-400 font-light">
            <span>
              &copy; {new Date().getFullYear()} DeScience Open Source Club. An initiative of Touchmark Descience. All rights reserved.
            </span>
            <span>Tamil Nadu & Global Partner Network • Chennai & Singapore</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
