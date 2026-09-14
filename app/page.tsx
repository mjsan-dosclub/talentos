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
import { TiltCard } from "@/components/TiltCard";

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
            SECTION 1: HERO SECTION - Editorial, Large Typography + Authentic Indian Student Imagery
            "DOS Club TalentOS. Your Passport to the AI World."
            ========================================================================= */}
        <section aria-label="Hero" className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pt-2 sm:pt-6">
          {/* Left Column: Literary Narrative & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left gap-7">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF7F2] border border-[#1B7A55]/20 text-[#1B7A55] text-xs font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1B7A55]" />
              <span>DOS Club TalentOS</span>
            </div>

            {/* Main Hero Title */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-normal tracking-tight text-[#0A0A0A] leading-[1.06]">
                Your Passport to the AI World.
              </h1>
              <p className="text-xl sm:text-2xl text-neutral-600 font-light leading-snug">
                Not another course. Not another certificate.{" "}
                <span className="text-[#0A0A0A] font-normal block sm:inline">
                  A journey that makes your capability visible.
                </span>
              </p>
            </div>

            <p className="text-base sm:text-lg text-neutral-600 max-w-xl leading-relaxed font-light">
              There is a world behind this door. An ecosystem where Indian engineering students build, break, and master 27 real-world systems,
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

            {/* Minimal Sub-Attribution */}
            <div className="pt-3 text-[11px] text-neutral-400 font-mono flex items-center gap-3">
              <span>Anna University Hub • IIT Madras Research Park • Singapore</span>
            </div>
          </div>

          {/* Right Column: Editorial Lassie & Acadium-style Student Photography with 3D Tilt */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md">
              {/* Primary Focused Student Photo with Tilt.com 3D perspective */}
              <TiltCard
                maxTilt={5}
                scale={1.01}
                className="rounded-2xl overflow-hidden border border-neutral-200/90 shadow-md bg-white group cursor-pointer"
              >
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/students/student-2.jpg"
                    alt="Indian engineering student focused on systems coding"
                    className="w-full h-80 sm:h-96 object-cover object-top group-hover:scale-103 transition-transform duration-700"
                  />

                  {/* Acadium-style Contextual Student Badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[10px] font-mono tracking-wide flex items-center gap-1.5 shadow-sm border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1B7A55] animate-pulse" />
                    <span>Aditya K. • CEG Campus</span>
                  </div>

                  {/* Cohort Track Chip (Warm Ochre Accent) */}
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#9A6C23] border border-[#C28E3A]/30 text-[10px] font-mono font-semibold tracking-wider">
                    BATCH 3 // 2026
                  </div>
                </div>

                <div className="p-4 bg-white/95 backdrop-blur-sm border-t border-neutral-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-serif font-medium text-[#0A0A0A]">
                      Engineering Capability in Motion
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      Cohort 2026 • Real Systems Execution
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EBF7F2] text-[#1B7A55] font-mono font-medium">
                    VERIFIED
                  </span>
                </div>
              </TiltCard>

              {/* Floating Collaboration Card (Lassie style overlap + Tilt.com float physics) */}
              <TiltCard
                maxTilt={8}
                scale={1.03}
                glare={false}
                className="hidden sm:flex absolute -bottom-6 -left-8 w-60 rounded-xl overflow-hidden border border-neutral-200/90 shadow-xl bg-white p-2.5 flex-col gap-2 animate-tilt-float z-30 cursor-pointer"
              >
                <div className="h-28 rounded-lg overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/students/student-4.jpg"
                    alt="Indian students collaborating"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-white text-[9px] font-mono">
                    Zero Grace Defense
                  </div>
                </div>
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-serif text-[#0A0A0A] font-medium">
                    Peer Systems Defense
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#9A6C23] font-mono font-semibold">
                    27 SESSIONS
                  </span>
                </div>
              </TiltCard>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: CURIOSITY - "Behind every opportunity is evidence"
            Poetic, staggered literary cadence with real student study atmosphere.
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

          {/* Literary Cadence Flow with Micro-Tilt */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {[
              { num: "01", text: "A workshop attended." },
              { num: "02", text: "A problem solved." },
              { num: "03", text: "A project built." },
              { num: "04", text: "A skill demonstrated." },
              { num: "05", text: "A mentor who noticed." },
              { num: "06", text: "A credential earned." },
            ].map((item) => (
              <TiltCard
                key={item.num}
                maxTilt={4}
                scale={1.02}
                glare={false}
                className="bg-white p-7 rounded-2xl border border-[rgba(0,0,0,0.06)] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[160px] group hover:border-[#C28E3A]/40 transition-colors cursor-pointer"
              >
                <span className="text-xs font-mono text-neutral-400 group-hover:text-[#C28E3A] transition-colors font-medium">
                  {item.num}
                </span>
                <p className="text-lg font-serif text-[#0A0A0A] group-hover:text-[#1B7A55] transition-colors">
                  {item.text}
                </p>
              </TiltCard>
            ))}
          </div>

          {/* Photo banner of Indian student collaboration with Tilt.com 3D perspective */}
          <TiltCard
            maxTilt={3}
            scale={1.005}
            className="relative rounded-2xl overflow-hidden border border-neutral-200/80 mt-4 shadow-sm bg-white group cursor-pointer"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-0 items-center">
              <div className="md:col-span-5 p-8 sm:p-10 flex flex-col justify-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#1B7A55] font-semibold">
                    Quiet Precision
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#C28E3A]" />
                  <span className="text-[10px] font-mono text-[#9A6C23] px-2 py-0.5 rounded bg-[#FEF3C7]">
                    ACCREDITED
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-serif text-[#0A0A0A] leading-snug">
                  TalentOS quietly connects them. When industry meets you, your work speaks before your résumé does.
                </p>
                <p className="text-xs text-neutral-500 font-light leading-relaxed">
                  No inflated self-assessments. Every capability is anchored in genuine code execution, verified commits, and real mentor observations.
                </p>
              </div>
              <div className="md:col-span-7 h-64 sm:h-80 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/students/student-workshop-build.jpg"
                  alt="Indian university students collaborating on systems projects"
                  className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700"
                />
                {/* Acadium-style Lab Evaluation Chip */}
                <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[10px] font-mono flex items-center gap-2 border border-white/10 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B7A55] animate-pulse" />
                  <span>Live Lab Evaluation • Anna University Hub</span>
                </div>
              </div>
            </div>
          </TiltCard>
        </section>

        {/* =========================================================================
            SECTION 3: THE "AIRPORT LOUNGE" EMOTIONAL SECTION
            "Some students wait for opportunity. DOS Club members prepare before it arrives."
            Real student lifestyle & prep imagery with Tilt.com 3D perspective.
            ========================================================================= */}
        <section id="lounge" aria-label="Access and Preparation" className="flex flex-col gap-12 border-t border-[rgba(0,0,0,0.08)] pt-16 scroll-mt-24">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C28E3A] font-semibold block">
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

          {/* 5 Visual Pillars with authentic student photo accents (Lassie & Acadium style + Tilt.com) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pillar 1: Priority Access */}
            <TiltCard
              maxTilt={4}
              scale={1.01}
              className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] overflow-hidden flex flex-col justify-between shadow-2xs group hover:border-[#C28E3A]/40 transition-colors cursor-pointer"
            >
              <div className="h-44 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/students/student-6.jpg"
                  alt="Indian student working with laptop"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-xs text-[#FEF3C7] text-[9px] font-mono tracking-wider border border-[#C28E3A]/30">
                  01 // ACCESS
                </span>
              </div>
              <div className="p-6 space-y-2">
                <h3 className="text-lg font-serif text-[#0A0A0A] group-hover:text-[#C28E3A] transition-colors">
                  Priority Access
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-light">
                  Direct pathways into engineering conversations without getting lost in unverified applicant tracking black holes.
                </p>
              </div>
            </TiltCard>

            {/* Pillar 2: Curated Learning */}
            <TiltCard
              maxTilt={4}
              scale={1.01}
              className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] overflow-hidden flex flex-col justify-between shadow-2xs group hover:border-[#C28E3A]/40 transition-colors cursor-pointer"
            >
              <div className="h-44 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/students/student-5.jpg"
                  alt="Indian student on campus with tech books"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-xs text-[#FEF3C7] text-[9px] font-mono tracking-wider border border-[#C28E3A]/30">
                  02 // DEPTH
                </span>
              </div>
              <div className="p-6 space-y-2">
                <h3 className="text-lg font-serif text-[#0A0A0A] group-hover:text-[#C28E3A] transition-colors">
                  Curated Learning
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-light">
                  A 27-workshop systems curriculum exploring POSIX syscalls, Raft consensus, and AI infrastructure from first principles.
                </p>
              </div>
            </TiltCard>

            {/* Pillar 3: Industry Exposure */}
            <TiltCard
              maxTilt={4}
              scale={1.01}
              className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] overflow-hidden flex flex-col justify-between shadow-2xs group hover:border-[#C28E3A]/40 transition-colors cursor-pointer"
            >
              <div className="h-44 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/students/student-1.jpg"
                  alt="Indian students discussing with mentor"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-xs text-[#FEF3C7] text-[9px] font-mono tracking-wider border border-[#C28E3A]/30">
                  03 // NETWORK
                </span>
              </div>
              <div className="p-6 space-y-2">
                <h3 className="text-lg font-serif text-[#0A0A0A] group-hover:text-[#C28E3A] transition-colors">
                  Industry Exposure
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-light">
                  Direct interactions with staff engineers, technical fellows, and architects who evaluate code through production lenses.
                </p>
              </div>
            </TiltCard>

            {/* Pillar 4: Recognition */}
            <TiltCard
              maxTilt={4}
              scale={1.01}
              className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] overflow-hidden flex flex-col justify-between shadow-2xs group hover:border-[#C28E3A]/40 transition-colors cursor-pointer"
            >
              <div className="h-44 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/students/student-4.jpg"
                  alt="Indian students solving problems"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-xs text-[#FEF3C7] text-[9px] font-mono tracking-wider border border-[#C28E3A]/30">
                  04 // MERIT
                </span>
              </div>
              <div className="p-6 space-y-2">
                <h3 className="text-lg font-serif text-[#0A0A0A] group-hover:text-[#C28E3A] transition-colors">
                  Recognition
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-light">
                  Students who consistently show up, build, and submit receive durable, visible honour rather than generic participation paper.
                </p>
              </div>
            </TiltCard>

            {/* Pillar 5: International Opportunities (Wider Card) */}
            <TiltCard
              maxTilt={4}
              scale={1.01}
              className="bg-white rounded-2xl border border-[rgba(0,0,0,0.07)] overflow-hidden flex flex-col justify-between shadow-2xs sm:col-span-2 lg:col-span-2 group hover:border-[#C28E3A]/40 transition-colors cursor-pointer"
            >
              <div className="h-44 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/students/student-laptop-focus.jpg"
                  alt="Indian university campus courtyard"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-xs text-[#FEF3C7] text-[9px] font-mono tracking-wider border border-[#C28E3A]/30">
                  05 // HORIZONS
                </span>
              </div>
              <div className="p-6 space-y-2">
                <h3 className="text-lg font-serif text-[#0A0A0A] group-hover:text-[#C28E3A] transition-colors">
                  International Opportunities
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-light max-w-xl">
                  Connecting promising engineering minds across Tamil Nadu with global technology hubs in Singapore and beyond, expanding where your capabilities can take you.
                </p>
              </div>
            </TiltCard>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: STUDENT PASSPORT CONCEPT
            Passport-style stamps / milestones in a refined, modern editorial style
            ========================================================================= */}
        {/* =========================================================================
            SECTION 4: STUDENT PASSPORT CONCEPT
            Passport-style stamps / milestones in a refined, modern editorial style with 3D Tilt
            ========================================================================= */}
        <section id="passport" aria-label="Student Passport" className="flex flex-col gap-12 border-t border-[rgba(0,0,0,0.08)] pt-16 scroll-mt-24">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C28E3A] font-semibold block">
              The Digital Passport
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#0A0A0A] leading-tight">
              Your Passport to the AI World.
            </h2>
            <p className="text-base sm:text-lg text-neutral-600 font-light leading-relaxed">
              Every student gradually collects six dimensions of real capability. Not gamified tokens, but permanent stamps of authentic engineering accomplishment.
            </p>
          </div>

          {/* Passport Stamps Grid with Tilt.com 3D perspective and Dual Palette */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stamp 1: Learning (Forest Green) */}
            <TiltCard
              maxTilt={5}
              scale={1.02}
              className="bg-white p-6 rounded-2xl border border-neutral-200/80 relative overflow-hidden flex flex-col justify-between min-h-[190px] shadow-sm hover:border-[#1B7A55]/50 transition-colors cursor-pointer"
            >
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
              <div className="pt-3 border-t border-dashed border-neutral-200 text-[10px] font-mono text-neutral-400 flex items-center justify-between">
                <span>AUDITED CURRICULUM</span>
                <span className="text-[#1B7A55] font-semibold">VERIFIED</span>
              </div>
            </TiltCard>

            {/* Stamp 2: Projects (Forest Green) */}
            <TiltCard
              maxTilt={5}
              scale={1.02}
              className="bg-white p-6 rounded-2xl border border-neutral-200/80 relative overflow-hidden flex flex-col justify-between min-h-[190px] shadow-sm hover:border-[#1B7A55]/50 transition-colors cursor-pointer"
            >
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
              <div className="pt-3 border-t border-dashed border-neutral-200 text-[10px] font-mono text-neutral-400 flex items-center justify-between">
                <span>COMMITS STAMPED</span>
                <span className="text-[#1B7A55] font-semibold">ARCHIVED</span>
              </div>
            </TiltCard>

            {/* Stamp 3: Credentials (Warm Ochre / Gold Accent) */}
            <TiltCard
              maxTilt={5}
              scale={1.02}
              className="bg-[#FAF8F2] p-6 rounded-2xl border border-[#C28E3A]/30 relative overflow-hidden flex flex-col justify-between min-h-[190px] shadow-sm hover:border-[#C28E3A] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#9A6C23]">STAMP 03 // CREDENTIALS</span>
                <span className="w-2 h-2 rounded-full bg-[#C28E3A]" />
              </div>
              <div className="space-y-1 my-3">
                <p className="text-base font-serif font-medium text-[#0A0A0A]">Verified Industry Certifications</p>
                <p className="text-xs text-neutral-600 font-light">
                  Integrated validation from Linux Foundation, AWS, and accredited registries.
                </p>
              </div>
              <div className="pt-3 border-t border-dashed border-[#C28E3A]/30 text-[10px] font-mono text-[#9A6C23] flex items-center justify-between font-semibold">
                <span>REGISTRY ATTESTED</span>
                <span className="px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#9A6C23]">OFFICIAL</span>
              </div>
            </TiltCard>

            {/* Stamp 4: Recognition (Warm Ochre / Gold Accent) */}
            <TiltCard
              maxTilt={5}
              scale={1.02}
              className="bg-[#FAF8F2] p-6 rounded-2xl border border-[#C28E3A]/30 relative overflow-hidden flex flex-col justify-between min-h-[190px] shadow-sm hover:border-[#C28E3A] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#9A6C23]">STAMP 04 // RECOGNITION</span>
                <span className="w-2 h-2 rounded-full bg-[#C28E3A]" />
              </div>
              <div className="space-y-1 my-3">
                <p className="text-base font-serif font-medium text-[#0A0A0A]">Staff Engineer Standouts</p>
                <p className="text-xs text-neutral-600 font-light">
                  Independent citations honoring architectural clarity, grit, and peer mentorship.
                </p>
              </div>
              <div className="pt-3 border-t border-dashed border-[#C28E3A]/30 text-[10px] font-mono text-[#9A6C23] flex items-center justify-between font-semibold">
                <span>MERIT ENDORSEMENT</span>
                <span className="px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#9A6C23]">HONOUR</span>
              </div>
            </TiltCard>

            {/* Stamp 5: Evidence (Forest Green) */}
            <TiltCard
              maxTilt={5}
              scale={1.02}
              className="bg-white p-6 rounded-2xl border border-neutral-200/80 relative overflow-hidden flex flex-col justify-between min-h-[190px] shadow-sm hover:border-[#1B7A55]/50 transition-colors cursor-pointer"
            >
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
              <div className="pt-3 border-t border-dashed border-neutral-200 text-[10px] font-mono text-neutral-400 flex items-center justify-between">
                <span>IMMUTABLE TIMESTAMPS</span>
                <span className="text-[#1B7A55] font-semibold">AUDITED</span>
              </div>
            </TiltCard>

            {/* Stamp 6: Exposure (Warm Ochre / Gold Accent) */}
            <TiltCard
              maxTilt={5}
              scale={1.02}
              className="bg-[#FAF8F2] p-6 rounded-2xl border border-[#C28E3A]/30 relative overflow-hidden flex flex-col justify-between min-h-[190px] shadow-sm hover:border-[#C28E3A] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#9A6C23]">STAMP 06 // EXPOSURE</span>
                <span className="w-2 h-2 rounded-full bg-[#C28E3A]" />
              </div>
              <div className="space-y-1 my-3">
                <p className="text-base font-serif font-medium text-[#0A0A0A]">Industry Fellow Defenses</p>
                <p className="text-xs text-neutral-600 font-light">
                  Defending systems architectures directly in front of engineering leadership.
                </p>
              </div>
              <div className="pt-3 border-t border-dashed border-[#C28E3A]/30 text-[10px] font-mono text-[#9A6C23] flex items-center justify-between font-semibold">
                <span>PEER VALIDATED</span>
                <span className="px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#9A6C23]">DEFENDED</span>
              </div>
            </TiltCard>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <span className="w-1.5 h-6 rounded-full bg-[#C28E3A]" />
            <p className="text-lg font-serif text-[#0A0A0A] italic">
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
            <span className="px-4 py-2 rounded-full bg-white border border-neutral-200 text-xs font-medium text-neutral-800 shadow-2xs hover:border-[#1B7A55]/40 transition-colors">
              27 Workshops
            </span>
            <span className="px-4 py-2 rounded-full bg-white border border-neutral-200 text-xs font-medium text-neutral-800 shadow-2xs hover:border-[#1B7A55]/40 transition-colors">
              Projects
            </span>
            <span className="px-4 py-2 rounded-full bg-white border border-[#C28E3A]/30 bg-[#FAF8F2] text-xs font-medium text-[#9A6C23] shadow-2xs hover:border-[#C28E3A] transition-colors">
              Credentials
            </span>
            <span className="px-4 py-2 rounded-full bg-white border border-[#C28E3A]/30 bg-[#FAF8F2] text-xs font-medium text-[#9A6C23] shadow-2xs hover:border-[#C28E3A] transition-colors">
              Mentor Observations
            </span>
            <span className="px-4 py-2 rounded-full bg-white border border-neutral-200 text-xs font-medium text-neutral-800 shadow-2xs hover:border-[#1B7A55]/40 transition-colors">
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
            <span className="text-xs font-mono uppercase tracking-widest text-[#C28E3A] font-semibold block">
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
            {[
              { num: "01", title: "Consistency", desc: "Punctual presence across every milestone." },
              { num: "02", title: "Contribution", desc: "Writing code that strengthens the commons." },
              { num: "03", title: "Improvement", desc: "Closing gaps through relentless iteration." },
              { num: "04", title: "Initiative", desc: "Tackling hard bugs beyond assignments." },
              { num: "05", title: "Completion", desc: "Delivering working systems to the finish line." },
              { num: "06", title: "Execution", desc: "Real code performing in real environments." },
            ].map((dim) => (
              <TiltCard
                key={dim.num}
                maxTilt={6}
                scale={1.02}
                glare={false}
                className="bg-white p-5 rounded-xl border border-[rgba(0,0,0,0.06)] flex flex-col gap-2 hover:border-[#C28E3A]/40 transition-colors cursor-pointer shadow-2xs"
              >
                <span className="text-xs font-mono text-[#C28E3A] font-semibold">{dim.num}</span>
                <span className="font-serif text-sm text-[#0A0A0A]">{dim.title}</span>
                <p className="text-[11px] text-neutral-500 font-light">{dim.desc}</p>
              </TiltCard>
            ))}
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

              {/* Become a Member Primary Action Block with 3D Tilt */}
              <TiltCard
                maxTilt={3}
                scale={1.01}
                className="bg-white p-7 rounded-2xl border border-neutral-200/90 shadow-sm space-y-4 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-900 block">
                    Immediate Member Enrollment
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FEF3C7] text-[#9A6C23] font-medium">
                    PRIORITY
                  </span>
                </div>
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
              </TiltCard>
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
