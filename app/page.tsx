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
  ShieldCheckIcon,
} from "@/components/Icons";
import { TiltCard } from "@/components/TiltCard";
import WelcomePopupModal from "@/components/WelcomePopupModal";
import { DEFAULT_LANDING_CMS, LandingCmsData } from "@/lib/cms-defaults";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<TalentosUser | null>(null);
  const [cms, setCms] = useState<LandingCmsData>(DEFAULT_LANDING_CMS);

  // Minimal Enquiry Form State
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

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#10222b] font-sans selection:bg-[#4caf50]/25 selection:text-[#0c3346] flex flex-col justify-between antialiased">
      {/* Welcome Popup / Flash News Broadcast Modal */}
      <WelcomePopupModal />

      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-black/[0.08] transition-all">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-18 flex items-center justify-between gap-6">
          {/* Brand Identity - Font Gellix & Inter */}
          <Link href="/" className="flex items-center gap-3.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/dos-club-logo.png"
              alt="DeScience Open Source Club"
              className="h-9 w-9 rounded-full object-cover ring-2 ring-[#4caf50]/40 group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/dos-club-logo.png";
              }}
            />
            <div className="flex flex-col">
              <span className="font-gellix text-base font-bold tracking-tight text-[#10222b] group-hover:text-[#2f8a36] transition-colors">
                TalentOS by DeScience Open Source Club
              </span>
              <span className="text-[10px] text-slate-500 font-mono tracking-wider">
                OPEN SOURCE SYSTEMS ECOSYSTEM
              </span>
            </div>
          </Link>

          {/* Minimal Navigation & Two Primary CTAs */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Quick Dossier Verify Icon Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowVerify(!showVerify)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-black/5 transition-colors cursor-pointer"
                title="Verify a Student Dossier"
                aria-label="Verify Dossier"
              >
                <SearchIcon className="w-4 h-4" />
              </button>

              {showVerify && (
                <div className="absolute right-0 mt-2 w-72 p-3 bg-white rounded-xl shadow-xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2">
                  <form onSubmit={handleVerifySubmit} className="space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                      Verify Student Dossier
                    </span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="e.g. DOS-B3-009"
                        value={verifyKey}
                        onChange={(e) => setVerifyKey(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4caf50]"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-[#2f8a36] text-white text-xs font-semibold rounded-lg hover:bg-[#256f2b] transition-colors"
                      >
                        Verify
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Become a Member CTA */}
            <a
              href="https://membership.descienceosclub.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#4caf50] to-[#2f8a36] hover:brightness-110 text-white text-xs font-semibold tracking-wide shadow-sm hover:shadow-[#4caf50]/25 transition-all cursor-pointer"
            >
              <span>Become a Member</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </a>

            {/* Portal Dashboard / Sign In */}
            <Link
              href={getDashboardLink()}
              className="inline-flex items-center px-3.5 py-2 rounded-lg border border-slate-300 bg-white/80 hover:bg-slate-50 text-[#10222b] text-xs font-semibold transition-colors"
            >
              {user ? "Console" : "Sign In"}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Narrative Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex flex-col gap-20 sm:gap-28 w-full">
        {/* =========================================================================
            SECTION 1: MINIMALISTIC LIGHT HERO - THE PORTAL / INVITATION
            Clean, light, airy, editorial aesthetic (inspired by Equals.com & WorkOS Atlas).
            Collaborative mindset: peer defense pods, shared commons, collective capability.
            Zero dark colors.
            ========================================================================= */}
        {/* =========================================================================
            SECTION 1: CLEAN MINIMALIST HERO - THE PORTAL
            Minimalist, calm, distraction-free light editorial aesthetic.
            ========================================================================= */}
        <section aria-label="Hero Introduction" className="pt-4 sm:pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-center">
            {/* Left Column: Editorial Manifesto */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              {/* Large Typography Headline */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-6xl font-['Space_Grotesk'] font-bold tracking-tight text-[#10222b] leading-[1.08]">
                  {cms.hero.title}{" "}
                  <span className="text-[#2f8a36] block sm:inline">
                    {cms.hero.highlight}
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl text-slate-600 font-['Space_Grotesk'] font-medium pt-1">
                  {cms.hero.subtitle}
                </p>
              </div>

              {/* Editorial Description */}
              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl">
                {cms.hero.description}
              </p>

              {/* Action Bar */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href={cms.hero.ctaPrimaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#4caf50] to-[#2f8a36] hover:brightness-110 text-white text-sm font-semibold tracking-wide shadow-md hover:shadow-[#4caf50]/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>{cms.hero.ctaPrimaryText}</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => setShowVerify(true)}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-[#10222b] text-sm font-medium shadow-xs transition-colors cursor-pointer"
                >
                  <SearchIcon className="w-4 h-4 text-[#2f8a36]" />
                  <span>Verify Cohort Dossier</span>
                </button>
              </div>
            </div>

            {/* Right Column: Clean Light Photography (No Noise / No Badges) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md">
                <TiltCard
                  maxTilt={4}
                  scale={1.01}
                  className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-md bg-white group cursor-pointer"
                >
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cms.hero.studentPhoto || "/images/students/student-workshop-build.jpg"}
                      alt={cms.hero.studentPhotoCaption || "DeScience Open Source Club"}
                      className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-103 transition-transform duration-700"
                    />
                  </div>

                  <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-['Space_Grotesk'] font-medium text-slate-700">
                      {cms.hero.studentPhotoCaption || "DeScience Open Source Club"}
                    </span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#e8f5e9] text-[#2f8a36] font-mono font-semibold border border-[#4caf50]/20">
                      OPEN SOURCE
                    </span>
                  </div>
                </TiltCard>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: THE INVISIBLE ENGINE - SYSTEMS EXECUTION PIPELINE
            Clean light technical workbench. Zero dark colors.
            ========================================================================= */}
        <section id="evidence" aria-label="Curiosity and Evidence" className="flex flex-col gap-10 border-t border-black/[0.08] pt-16 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f5e9] border border-[#4caf50]/30 text-xs font-mono tracking-widest text-[#2f8a36] font-semibold">
                <TerminalIcon className="w-3.5 h-3.5" />
                <span>{cms.invisibleEngine.eyebrow}</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-['Space_Grotesk'] font-bold tracking-tight text-[#10222b] leading-tight">
                {cms.invisibleEngine.title}
              </h2>
            </div>
            <p className="max-w-md text-sm text-slate-700 leading-relaxed font-mono">
              {cms.invisibleEngine.description}
            </p>
          </div>

          {/* Connected Technical Pipeline Visualizer - Clean Minimalist Light Container */}
          <div className="relative rounded-2xl bg-white border border-slate-200/90 p-6 sm:p-8 text-[#10222b] shadow-sm overflow-hidden">
            {/* Terminal Header */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-200 font-mono text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-[#4caf50]" />
                <span className="ml-2 text-slate-800 font-bold">
                  ~/dos-club $ ./engine_pipeline --mode=production
                </span>
              </div>
              <span className="hidden sm:inline text-[#2f8a36] font-bold">
                ALL 6 TELEMETRY GATES ACTIVE
              </span>
            </div>

            {/* The 6 Sequential Verification Stages - Clean Light Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-6">
              {cms.invisibleEngine.steps.map((step, idx) => (
                <TiltCard
                  key={step.code}
                  maxTilt={4}
                  scale={1.015}
                  glare={false}
                  className="bg-[#FAF9F5] hover:bg-white p-5 rounded-xl border border-slate-200/90 hover:border-[#4caf50] hover:shadow-md transition-all group flex flex-col justify-between min-h-[160px] relative cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#0d6b90] font-bold tracking-wider">
                      {step.code}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#e8f5e9] text-[#2f8a36] text-[10px] font-mono border border-[#4caf50]/30 font-semibold">
                      {step.badge}
                    </span>
                  </div>

                  <div className="my-3 space-y-1">
                    <h3 className="text-base font-['Space_Grotesk'] font-bold text-[#10222b] group-hover:text-[#2f8a36] transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-normal leading-relaxed">
                      {step.telemetry}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>GATE {String(idx + 1).padStart(2, "0")}</span>
                    <span className="text-[#2f8a36] font-semibold group-hover:underline">VERIFIED // PASS</span>
                  </div>
                </TiltCard>
              ))}
            </div>
          </div>

          {/* Photo banner of Indian student collaboration */}
          <TiltCard
            maxTilt={3}
            scale={1.005}
            className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white group cursor-pointer"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-0 items-center">
              <div className="md:col-span-5 p-8 sm:p-10 flex flex-col justify-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#2f8a36] font-semibold">
                    {cms.invisibleEngine.bannerTag}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1593c3]" />
                  <span className="text-[10px] font-mono text-[#0d6b90] px-2.5 py-0.5 rounded bg-[#e1f5fe] border border-[#1593c3]/20 font-semibold">
                    ACCREDITED
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-['Space_Grotesk'] font-bold text-[#10222b] leading-snug">
                  {cms.invisibleEngine.bannerTitle}
                </p>
                <p className="text-xs text-slate-600 font-light leading-relaxed">
                  {cms.invisibleEngine.bannerSubtitle}
                </p>
              </div>
              <div className="md:col-span-7 h-64 sm:h-80 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cms.invisibleEngine.bannerPhoto}
                  alt={cms.invisibleEngine.bannerTitle}
                  className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700"
                />
                {/* Lab Evaluation Chip - Clean Light Pill */}
                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-slate-800 text-[10px] font-mono flex items-center gap-2 border border-slate-200 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#4caf50] animate-pulse" />
                  <span>Verified Technical Evaluation</span>
                </div>
              </div>
            </div>
          </TiltCard>
        </section>

        {/* =========================================================================
            SECTION 3: THE "AIRPORT LOUNGE" EMOTIONAL SECTION
            ========================================================================= */}
        <section id="lounge" aria-label="Access and Preparation" className="flex flex-col gap-12 border-t border-black/[0.08] pt-16 scroll-mt-24">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#1593c3] font-semibold block">
              {cms.lounge.eyebrow}
            </span>
            <h2 className="text-3xl sm:text-5xl font-['Space_Grotesk'] font-bold tracking-tight text-[#10222b] leading-tight">
              {cms.lounge.title}{" "}
              <span className="text-[#4caf50] block sm:inline">
                {cms.lounge.highlight}
              </span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
              {cms.lounge.description}
            </p>
          </div>

          {/* 5 Visual Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cms.lounge.pillars.map((pillar) => (
              <TiltCard
                key={pillar.id}
                maxTilt={4}
                scale={1.01}
                className={`bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col justify-between shadow-sm group hover:border-[#4caf50] transition-colors cursor-pointer ${
                  pillar.id === "lounge-5" ? "sm:col-span-2 lg:col-span-2" : ""
                }`}
              >
                <div className="h-44 overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pillar.image}
                    alt={pillar.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#2f8a36] text-[9px] font-mono tracking-wider font-bold border border-[#4caf50]/40 shadow-2xs">
                    {pillar.tag}
                  </span>
                </div>
                <div className="p-6 space-y-2">
                  <h3 className="text-lg font-['Space_Grotesk'] font-bold text-[#10222b] group-hover:text-[#2f8a36] transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-light">
                    {pillar.desc}
                  </p>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: STUDENT PASSPORT CONCEPT
            ========================================================================= */}
        <section id="passport" aria-label="Student Passport" className="flex flex-col gap-12 border-t border-black/[0.08] pt-16 scroll-mt-24">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#2f8a36] font-semibold block">
              {cms.passport.eyebrow}
            </span>
            <h2 className="text-3xl sm:text-5xl font-['Space_Grotesk'] font-bold tracking-tight text-[#10222b] leading-tight">
              {cms.passport.title}
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
              {cms.passport.description}
            </p>
          </div>

          {/* Passport Stamps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cms.passport.stamps.map((stamp) => (
              <TiltCard
                key={stamp.id}
                maxTilt={5}
                scale={1.02}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 relative overflow-hidden flex flex-col justify-between min-h-[190px] shadow-sm hover:border-[#4caf50] transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    STAMP {stamp.num}
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4caf50]" />
                </div>
                <div className="space-y-1 my-3">
                  <p className="text-base font-['Space_Grotesk'] font-bold text-[#10222b]">
                    {stamp.title}
                  </p>
                  <p className="text-xs text-slate-500 font-light">
                    {stamp.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-dashed border-slate-200 text-[10px] font-mono text-slate-500 flex items-center justify-between">
                  <span>{stamp.footerLeft}</span>
                  <span className="text-[#2f8a36] font-semibold">{stamp.footerRight}</span>
                </div>
              </TiltCard>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-3">
            <span className="w-1.5 h-6 rounded-full bg-[#4caf50]" />
            <p className="text-lg font-['Space_Grotesk'] text-[#10222b] font-medium italic">
              &ldquo;{cms.passport.quote}&rdquo;
            </p>
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: / 04 - INDUSTRY SHIFT - HIGH CONTRAST & VISIBLE TYPOGRAPHY
            ========================================================================= */}
        <section aria-label="Industry Perspective" className="flex flex-col gap-8 border-t border-black/[0.08] pt-16">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e1f5fe] border border-[#1593c3]/40 text-xs font-mono tracking-widest text-[#0d6b90] font-bold">
              <span>{cms.industry.eyebrow}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-['Space_Grotesk'] font-bold tracking-tight text-[#0c3346] leading-tight">
              {cms.industry.title}
            </h2>
            <p className="text-base sm:text-lg text-slate-800 font-normal leading-relaxed">
              {cms.industry.description}
            </p>
          </div>

          {/* High-Contrast Industry Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col gap-1.5">
              <span className="text-4xl font-['Space_Grotesk'] font-bold text-[#2f8a36]">
                27
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-[#0c3346] font-bold">
                Workshops
              </span>
              <p className="text-xs text-slate-700 font-medium pt-1 leading-relaxed">
                Rigorous systems curriculum with direct code execution
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col gap-1.5">
              <span className="text-4xl font-['Space_Grotesk'] font-bold text-[#0d6b90]">
                06
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-[#0c3346] font-bold">
                Verification Gates
              </span>
              <p className="text-xs text-slate-700 font-medium pt-1 leading-relaxed">
                From attendance logs to live staff engineer defenses
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col gap-1.5">
              <span className="text-4xl font-['Space_Grotesk'] font-bold text-[#2f8a36]">
                100%
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-[#0c3346] font-bold">
                Real Execution
              </span>
              <p className="text-xs text-slate-700 font-medium pt-1 leading-relaxed">
                Zero fresh-graduate discount in technical evaluations
              </p>
            </div>
          </div>

          {/* High-Contrast Minimalist Fragment Pills from CMS */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {cms.industry.tags.map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 rounded-full bg-white border-2 border-slate-300 text-xs font-bold text-slate-900 shadow-xs hover:border-[#2f8a36] hover:bg-[#e8f5e9] transition-all cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION 6: / 05 - GROWTH DIMENSIONS (COMMITMENT & HONOUR)
            High contrast, legible text, prominent numbering, and deep ink typography.
            ========================================================================= */}
        <section id="recognition" aria-label="Commitment and Honour" className="flex flex-col gap-10 border-t border-black/[0.08] pt-16 scroll-mt-24">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e8f5e9] border border-[#2f8a36]/40 text-xs font-mono tracking-widest text-[#2f8a36] font-bold">
              <span>{cms.honour.eyebrow}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-['Space_Grotesk'] font-bold tracking-tight text-[#0c3346] leading-tight">
              {cms.honour.title}
            </h2>
            <p className="text-base sm:text-lg text-slate-800 font-normal leading-relaxed">
              {cms.honour.description}
            </p>
          </div>

          {/* 6 High-Contrast Dimension Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cms.honour.dimensions.map((dim) => (
              <TiltCard
                key={dim.num}
                maxTilt={6}
                scale={1.02}
                glare={false}
                className="bg-white p-5 rounded-2xl border-2 border-slate-200 flex flex-col justify-between min-h-[180px] hover:border-[#2f8a36] hover:shadow-md transition-all cursor-pointer shadow-xs"
              >
                <div className="flex flex-col gap-2">
                  <span className="inline-block px-2.5 py-0.5 rounded bg-[#e8f5e9] text-[#2f8a36] border border-[#4caf50]/30 font-mono text-xs font-bold self-start">
                    {dim.num}
                  </span>
                  <span className="font-['Space_Grotesk'] text-base font-bold text-[#0c3346] pt-1">
                    {dim.title}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed pt-2">
                  {dim.desc}
                </p>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION 7: COMMAND CONSOLE ADMISSIONS & ENQUIRY (WORLD-CLASS PORTAL)
            ========================================================================= */}
        <section id="enquire" aria-label="Admissions and Enquiry" className="border-t border-black/[0.08] pt-16 scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: Deep Slate Command Console for Members */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-mono uppercase tracking-widest text-[#2f8a36] font-semibold block">
                  {cms.enquiry.eyebrow}
                </span>
                <h2 className="text-3xl sm:text-4xl font-['Space_Grotesk'] font-bold text-[#10222b] leading-tight">
                  {cms.enquiry.title}
                </h2>
                <p className="text-sm text-slate-600 font-normal leading-relaxed">
                  {cms.enquiry.description}
                </p>
              </div>

              {/* High-End Member Console Block - Clean Minimalist Light Card */}
              <TiltCard
                maxTilt={3}
                scale={1.01}
                className="bg-gradient-to-br from-white via-[#f4faf5] to-[#e8f5e9]/40 text-[#10222b] p-7 rounded-2xl border border-slate-200/90 shadow-sm space-y-5 cursor-pointer relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4caf50] animate-pulse" />
                    <span className="text-xs font-mono font-bold text-slate-800 tracking-wider">
                      MEMBER PRIVILEGE PASS
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#e8f5e9] text-[#2f8a36] font-bold border border-[#4caf50]/40">
                    PRIORITY ONBOARDING
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-[#2f8a36] shrink-0" />
                    <span>27-Workshop Intensive Systems Track</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-[#2f8a36] shrink-0" />
                    <span>Cryptographic Student Passport & Dossier</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-[#2f8a36] shrink-0" />
                    <span>Direct Access to Staff Engineer Defense Panels</span>
                  </div>
                </div>

                <a
                  href="https://membership.descienceosclub.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#4caf50] to-[#2f8a36] hover:brightness-110 text-white text-xs font-semibold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Become a Member</span>
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </TiltCard>
            </div>

            {/* Right: Bespoke Enquiry Form */}
            <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200/90 shadow-sm">
              {enquiryStatus === "success" ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#e8f5e9] text-[#2f8a36] flex items-center justify-center mx-auto border border-[#4caf50]/30">
                    <CheckIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-['Space_Grotesk'] font-bold text-[#10222b]">Enquiry Received</h3>
                  <p className="text-xs text-slate-600 font-mono">Reference: {enquiryRef}</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto font-light leading-relaxed">
                    Thank you. A member of the Touchmark Descience engineering council will review your query and get back within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-['Space_Grotesk'] font-bold text-[#10222b]">Submit Enquiry</h3>
                    <p className="text-xs text-slate-500 font-light">
                      For engineering aspirants, college partners, and industry talent scouts.
                    </p>
                  </div>

                  {enquiryError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                      {enquiryError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 block">Full Name</label>
                      <input
                        type="text"
                        required
                        value={enquiry.name}
                        onChange={(e) => setEnquiry({ ...enquiry, name: e.target.value })}
                        placeholder="e.g. Senthil Kumar"
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-slate-300 rounded-xl text-xs text-[#10222b] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4caf50]/40 focus:border-[#4caf50]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-700 block">Email or Phone</label>
                      <input
                        type="text"
                        required
                        value={enquiry.contact}
                        onChange={(e) => setEnquiry({ ...enquiry, contact: e.target.value })}
                        placeholder="name@college.edu or +91..."
                        className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-slate-300 rounded-xl text-xs text-[#10222b] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4caf50]/40 focus:border-[#4caf50]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 block">I am inquiring as</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {["Student", "Parent", "College", "Industry"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setEnquiry({ ...enquiry, category: cat })}
                          className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                            enquiry.category === cat
                              ? "bg-[#e8f5e9] text-[#2f8a36] border-[#4caf50]/60 font-semibold shadow-xs"
                              : "bg-[#FAF9F5] text-slate-700 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700 block">Your Note or Question</label>
                    <textarea
                      rows={3}
                      value={enquiry.message}
                      onChange={(e) => setEnquiry({ ...enquiry, message: e.target.value })}
                      placeholder="Share your goals, batch preference, or institutional collaboration query..."
                      className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-slate-300 rounded-xl text-xs text-[#10222b] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4caf50]/40 focus:border-[#4caf50] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={enquiryStatus === "loading"}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#4caf50] to-[#2f8a36] hover:brightness-110 disabled:opacity-50 text-white text-xs font-semibold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{enquiryStatus === "loading" ? "Submitting Transmission..." : "Send Enquiry"}</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* 8. Footer - Font Gellix & Inter */}
      <footer className="border-t border-black/[0.08] bg-white py-14 px-5 sm:px-8 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col gap-10">
          {/* Main Footer Row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {/* Left: Club Logo & Touchmark Descience Initiative */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/dos-club-logo.png"
                  alt="DeScience Open Source Club"
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-[#4caf50]/40"
                />
                <span className="font-gellix text-lg font-bold text-[#10222b]">
                  TalentOS by DeScience Open Source Club
                </span>
              </div>

              {/* An initiative of Touchmark Descience */}
              <div className="flex items-center gap-2.5 pt-1">
                <span className="text-xs text-slate-500 font-light">An initiative of</span>
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
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
              <a
                href="https://membership.descienceosclub.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#2f8a36] hover:underline"
              >
                Become a Member
              </a>
              <a href="#enquire" className="hover:text-black transition-colors font-medium">
                Enquire
              </a>
              <Link href="/login" className="hover:text-black transition-colors font-medium">
                Portal Sign In
              </Link>
              <a
                href="https://touchmarkdes.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black transition-colors inline-flex items-center gap-1 font-medium"
              >
                <span>touchmarkdes.com</span>
                <ExternalLinkIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Bottom Copyright Row */}
          <div className="pt-6 border-t border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-slate-500 font-light">
            <span>
              &copy; {new Date().getFullYear()} DeScience Open Source Club. An initiative of Touchmark Descience. All rights reserved.
            </span>
            <span>DeScience Open Source Club • Chennai, Tamil Nadu</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
