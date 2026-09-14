"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getClientSession, TalentosUser } from "@/lib/session";
import {
  ArrowRightIcon,
  CheckIcon,
  ShieldCheckIcon,
  TerminalIcon,
  ExternalLinkIcon,
} from "@/components/Icons";
import WelcomePopupModal from "@/components/WelcomePopupModal";
import BackToTopButton from "@/components/BackToTopButton";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<TalentosUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Terminal Access Pass / DOS_ID Quick Lookup State
  const [accessPass, setAccessPass] = useState("");

  // Institutional Request Invitation State
  const [invitationForm, setInvitationForm] = useState({
    institution: "",
    contactName: "",
    email: "",
    phone: "",
    type: "Engineering College / University",
    message: "",
  });
  const [invitationStatus, setInvitationStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [invitationRef, setInvitationRef] = useState<string | null>(null);
  const [invitationError, setInvitationError] = useState<string | null>(null);

  useEffect(() => {
    setUser(getClientSession());
  }, []);

  const handleVerifyAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessPass.trim()) return;
    const cleanKey = accessPass.trim().toUpperCase();
    router.push(`/record/${encodeURIComponent(cleanKey)}`);
  };

  const handleInvitationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvitationStatus("submitting");
    setInvitationError(null);

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: invitationForm.contactName,
          email: invitationForm.email,
          phone: invitationForm.phone,
          current_role: `${invitationForm.type} - ${invitationForm.institution}`,
          referral_source: "Institutional Partner Invitation",
          message: invitationForm.message || "Requesting cohort allocation and institutional partnership.",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setInvitationStatus("success");
        setInvitationRef(data.enquiryId || "REQ-INTAKE-ACCEPTED");
      } else {
        setInvitationStatus("error");
        setInvitationError(data.error || "Unable to register invitation request. Please try again.");
      }
    } catch {
      setInvitationStatus("error");
      setInvitationError("Network communication error. Please check your connectivity.");
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-[#E25C38]/20 selection:text-[#E25C38]">
      {/* =========================================================================
          1. NAVIGATION BAR
          ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left Brand with Live Indicator Dot */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <div className="flex items-baseline gap-1.5 font-mono tracking-tight">
              <span className="font-bold text-neutral-900 text-sm tracking-wider">DOS CLUB</span>
              <span className="text-neutral-400 text-xs">//</span>
              <span className="font-medium text-neutral-600 text-xs tracking-widest">TALENT_OS</span>
            </div>
          </Link>

          {/* Desktop Navigation Items */}
          <nav className="hidden md:flex items-center gap-7">
            <Link
              href="#case-studies"
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 tracking-wider uppercase transition-colors"
            >
              Case Studies
            </Link>
            <Link
              href="#request-invitation"
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 tracking-wider uppercase transition-colors"
            >
              Request Invitation
            </Link>
            <Link
              href="/login"
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 tracking-wider uppercase transition-colors"
            >
              {user ? "Dashboard" : "Portal Access"}
            </Link>
            <a
              href="https://membership.descienceosclub.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#E25C38] text-white px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#CC4F2E] transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
            >
              <span>Become a Member</span>
              <ExternalLinkIcon className="w-3.5 h-3.5" />
            </a>
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-neutral-200 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 transition-colors"
            aria-label="Toggle Navigation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-4 animate-fadeIn">
            <Link
              href="#case-studies"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider"
            >
              Case Studies
            </Link>
            <Link
              href="#request-invitation"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider"
            >
              Request Invitation
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider"
            >
              {user ? "Dashboard" : "Portal Access"}
            </Link>
            <div className="pt-2">
              <a
                href="https://membership.descienceosclub.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#E25C38] text-white px-5 py-3 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#CC4F2E] transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Become a Member</span>
                <ExternalLinkIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          2. HERO SECTION (THE TALENT LOUNGE GATE)
          ========================================================================= */}
      <section className="py-20 sm:py-28 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            {/* Status Tag */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#FAFAF9] border border-neutral-200 mb-8 font-mono text-[11px] font-semibold text-neutral-700 tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#E25C38]" />
              <span>B2C COHORT INTAKE // 40-SEAT BATCHES</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-900 leading-[1.08]">
              Skip the placement queue. <br className="hidden sm:inline" />
              <span className="text-[#E25C38]">Enter the talent lounge.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-8 text-lg sm:text-xl text-neutral-600 leading-relaxed max-w-3xl">
              TalentOS tracks longitudinal engineering capability, behavioral grit, and verifiable production evidence over months of real-world pressure. No generic certificates. Real evidence only.
            </p>

            {/* Dual Action Row */}
            <div className="mt-10 pt-4 flex flex-col lg:flex-row items-stretch lg:items-center gap-5">
              {/* Primary B2C Funnel CTA */}
              <a
                href="https://membership.descienceosclub.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#E25C38] hover:bg-[#CC4F2E] text-white px-8 py-4 rounded-full text-sm font-semibold tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 group text-center shrink-0 active:scale-98"
              >
                <span>Become a Member</span>
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              {/* Secondary Gatekeeper Terminal Input */}
              <form
                onSubmit={handleVerifyAccess}
                className="flex-1 max-w-md flex items-center rounded-full border border-neutral-300 bg-[#FAFAF9] p-1.5 focus-within:border-neutral-900 focus-within:bg-white transition-all shadow-2xs"
              >
                <div className="pl-3.5 pr-2 text-neutral-400">
                  <TerminalIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Enter Access Pass or DOS_ID"
                  value={accessPass}
                  onChange={(e) => setAccessPass(e.target.value)}
                  className="w-full bg-transparent text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:outline-none uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold tracking-wider uppercase transition-colors shrink-0 cursor-pointer"
                >
                  Verify Access
                </button>
              </form>
            </div>

            {/* Micro Guarantees */}
            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-neutral-500 font-medium">
              <div className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-emerald-600" />
                <span>Zero whiteboard trivia</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-emerald-600" />
                <span>Audited commit telemetry</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon className="w-4 h-4 text-emerald-600" />
                <span>Direct global engineering clearance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. LIVE SESSION VISUAL BANNER
          ========================================================================= */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24">
        <div className="relative rounded-3xl overflow-hidden border border-neutral-200 shadow-md aspect-16/9 sm:aspect-21/9 bg-[#FAFAF9]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1400&q=80"
            alt="Indian engineering students collaborating in active tech workspace"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Monospace Corner Tag */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
            <span className="px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/20 text-white font-mono text-[10px] sm:text-xs tracking-wider uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE COHORT TELEMETRY // ACTIVE WORKSPACE</span>
            </span>
          </div>

          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-4 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2 text-white">
            <div>
              <p className="text-xs sm:text-sm font-semibold tracking-wide text-neutral-200">
                Peer pod architecture defense in progress
              </p>
              <h2 className="text-lg sm:text-2xl font-bold">
                Real engineering happens under production friction.
              </h2>
            </div>
            <span className="text-[11px] font-mono text-neutral-300">
              TAMPER-PROOF EXECUTION
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. THE CONTRAST MATRIX (THE QUEUE VS. THE LOUNGE)
          ========================================================================= */}
      <section className="py-24 bg-[#FAFAF9] border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <span className="font-mono text-xs font-bold text-[#E25C38] uppercase tracking-widest">
              THE STRUCTURAL DICHOTOMY
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 mt-2">
              The Queue vs. The Lounge
            </h2>
            <p className="mt-3 text-base sm:text-lg text-neutral-600 leading-relaxed">
              Standard recruitment filters evaluate test preparation. TalentOS identifies authentic systems capability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1: The General Terminal */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 font-mono text-xs font-semibold mb-6">
                  <span>TRADITIONAL PIPELINE</span>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                  The General Terminal
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                  Mass campus placement drives where 1,000 students compete with identical, unverifiable PDF resumes.
                </p>

                <ul className="space-y-3.5 text-sm text-neutral-600">
                  <li className="flex items-start gap-3">
                    <span className="text-neutral-400 font-bold">✕</span>
                    <span>1,000-student generic placement queues</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-neutral-400 font-bold">✕</span>
                    <span>Unverifiable PDF claims and inflated bullet points</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-neutral-400 font-bold">✕</span>
                    <span>Memorized LeetCode puzzles disconnected from production</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-neutral-400 font-bold">✕</span>
                    <span>Zero telemetry on behavioral grit or team collaboration</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-100 text-xs font-mono text-neutral-400">
                OUTCOME: HIGH REJECT AMPLITUDE & UNCERTAINTY
              </div>
            </div>

            {/* Card 2: The TalentOS Lounge */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-neutral-900 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E25C38]/10 rounded-full blur-2xl -mr-10 -mt-10" />

              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E25C38]/10 text-[#E25C38] font-mono text-xs font-semibold mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E25C38]" />
                  <span>TALENTOS COHORT ACCESS</span>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-4">
                  The TalentOS Lounge
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                  Priority entrance into elite engineering roles verified through longitudinal telemetry and live peer defenses.
                </p>

                <ul className="space-y-3.5 text-sm text-neutral-800 font-medium">
                  <li className="flex items-start gap-3">
                    <CheckIcon className="w-4 h-4 text-[#E25C38] shrink-0 mt-0.5" />
                    <span>Priority clearance into global engineering roles</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="w-4 h-4 text-[#E25C38] shrink-0 mt-0.5" />
                    <span>Auditable Git dossiers with signed cryptographic commits</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="w-4 h-4 text-[#E25C38] shrink-0 mt-0.5" />
                    <span>Longitudinal tracking of behavioral grit and adaptability</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="w-4 h-4 text-[#E25C38] shrink-0 mt-0.5" />
                    <span>Direct engineering introductions with zero junior skepticism</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#E25C38]">
                  OUTCOME: DAY-ZERO PRODUCTION READINESS
                </span>
                <a
                  href="https://membership.descienceosclub.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-neutral-900 hover:text-[#E25C38] transition-colors flex items-center gap-1"
                >
                  <span>Apply Now</span>
                  <span>&rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. B2C DIRECT MEMBERSHIP CALLOUT (INDEPENDENT BUILDERS)
          ========================================================================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FAFAF9] border border-neutral-200 p-8 sm:p-12 lg:p-14 rounded-3xl relative overflow-hidden">
            <div className="max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-200 text-xs font-mono font-semibold text-neutral-700 uppercase tracking-wider">
                <span>DIRECT COHORT ADMISSION</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                Independent Student Builder? Take the Direct Route.
              </h2>

              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
                You do not need to wait for your college to partner with DOS Club. Individual student builders are admitted directly into closed cohorts of maximum 40 seats. Membership gives you priority access to live sessions, build sprints, and verified talent dossiers.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <a
                  href="https://membership.descienceosclub.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#E25C38] hover:bg-[#CC4F2E] text-white px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2.5 active:scale-95"
                >
                  <span>Apply for DOS Club Membership at membership.descienceosclub.com</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </a>
                <span className="text-xs text-neutral-500 font-mono">
                  Strict 40-Seat Cohort Limits
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. HIGH-LEVEL CALIBRATION PILLARS (NO SYLLABUS LEAKS)
          ========================================================================= */}
      <section className="py-24 bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <span className="font-mono text-xs font-bold text-[#E25C38] uppercase tracking-widest">
              LONGITUDINAL TELEMETRY
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 mt-2">
              High-Level Calibration Pillars
            </h2>
            <p className="mt-3 text-base sm:text-lg text-neutral-600 leading-relaxed">
              How talent is forged and objectively calibrated across weeks of sustained collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 01 */}
            <div className="p-8 rounded-3xl border border-neutral-200 bg-white hover:border-neutral-400 transition-colors flex flex-col justify-between">
              <div>
                <div className="font-mono text-2xl font-bold text-[#E25C38] mb-4">
                  01
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  Production Grit
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Shipping real systems under friction, not sitting through slide decks. Engineers build and defend production codebases through live peer review.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-neutral-100 text-xs font-mono text-neutral-500">
                FOCUS // EXECUTION OVER THEORY
              </div>
            </div>

            {/* Pillar 02 */}
            <div className="p-8 rounded-3xl border border-neutral-200 bg-white hover:border-neutral-400 transition-colors flex flex-col justify-between">
              <div>
                <div className="font-mono text-2xl font-bold text-[#E25C38] mb-4">
                  02
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  Behavioral Profiling
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Longitudinal tracking of adaptability, execution speed, and team collaboration. We observe how engineers handle ambiguous technical requirements.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-neutral-100 text-xs font-mono text-neutral-500">
                FOCUS // SOFT SKILLS & ADAPTABILITY
              </div>
            </div>

            {/* Pillar 03 */}
            <div className="p-8 rounded-3xl border border-neutral-200 bg-white hover:border-neutral-400 transition-colors flex flex-col justify-between">
              <div>
                <div className="font-mono text-2xl font-bold text-[#E25C38] mb-4">
                  03
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  Immutable Dossier
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Live repository commits, architecture designs, and mentor reviews logged in real time. Backed by tamper-proof physical workshop telemetry.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-neutral-100 text-xs font-mono text-neutral-500">
                FOCUS // TAMPER-PROOF EVIDENCE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. OUTCOME-DRIVEN CASE STUDIES
          ========================================================================= */}
      <section id="case-studies" className="py-24 bg-[#FAFAF9] border-y border-neutral-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <span className="font-mono text-xs font-bold text-[#E25C38] uppercase tracking-widest">
              PROOF OF CAPABILITY
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 mt-2">
              Longitudinal Evidence in Practice
            </h2>
            <p className="mt-3 text-base sm:text-lg text-neutral-600 leading-relaxed">
              Verifiable student transformations across global cohorts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Case Study Card 1 */}
            <Link
              href="/casestudies/siddharth-raft-consensus-engine"
              className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-neutral-900 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="aspect-16/10 overflow-hidden bg-neutral-100 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
                    alt="The 36-Hour Hackathon & Singapore Immersion"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-neutral-900 text-[10px] font-mono font-bold tracking-wider">
                    GLOBAL DEPLOYMENT
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-neutral-900 group-hover:text-[#E25C38] transition-colors leading-snug">
                    The 36-Hour Hackathon &amp; Singapore Immersion
                  </h3>
                  <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                    How longitudinal telemetry identified high-velocity Indian engineering builders for cross-border international deployment.
                  </p>
                </div>
              </div>

              <div className="px-8 pb-8 pt-2 flex items-center justify-between text-xs font-semibold text-[#E25C38] border-t border-neutral-100 mx-8">
                <span>Read Full Case Study</span>
                <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Case Study Card 2 */}
            <Link
              href="/casestudies/ananya-paged-kv-cache-runtime"
              className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-2xs hover:shadow-md hover:border-neutral-900 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="aspect-16/10 overflow-hidden bg-neutral-100 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80"
                    alt="From Campus Theory to High-Velocity Production"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-neutral-900 text-[10px] font-mono font-bold tracking-wider">
                    PRODUCTION CLEARANCE
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-neutral-900 group-hover:text-[#E25C38] transition-colors leading-snug">
                    From Campus Theory to High-Velocity Production
                  </h3>
                  <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                    How an auditable repository dossier replaced the conventional resume for overseas SME engineering teams.
                  </p>
                </div>
              </div>

              <div className="px-8 pb-8 pt-2 flex items-center justify-between text-xs font-semibold text-[#E25C38] border-t border-neutral-100 mx-8">
                <span>Read Full Case Study</span>
                <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. PHILOSOPHY CALLOUT
          ========================================================================= */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#FAFAF9] border border-neutral-200 mx-auto flex items-center justify-center text-[#E25C38] mb-6">
            <ShieldCheckIcon className="w-6 h-6" />
          </div>
          <blockquote className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 tracking-tight leading-[1.2]">
            &ldquo;Potential cannot be measured in a 45-minute interview or a paper resume. It proves itself through months of consistent execution.&rdquo;
          </blockquote>
          <p className="mt-6 text-sm font-mono uppercase tracking-widest text-neutral-500">
            DOS CLUB // CORE EVALUATION PRINCIPLE
          </p>
        </div>
      </section>

      {/* =========================================================================
          INSTITUTIONAL REQUEST INVITATION SECTION
          ========================================================================= */}
      <section id="request-invitation" className="py-24 bg-[#FAFAF9] border-t border-neutral-200 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-neutral-200 shadow-sm">
            <div className="max-w-2xl mb-8">
              <span className="font-mono text-xs font-bold text-[#E25C38] uppercase tracking-widest">
                PARTNER INTAKE
              </span>
              <h2 className="text-3xl font-bold text-neutral-900 mt-1">
                Request Cohort Invitation
              </h2>
              <p className="text-sm text-neutral-600 mt-2">
                For engineering colleges, university departments, and technical institutions looking to allocate closed cohort batches for their students.
              </p>
            </div>

            {invitationStatus === "success" ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <CheckIcon className="w-5 h-5 text-emerald-600" />
                  <span>Invitation Request Received</span>
                </div>
                <p className="text-xs leading-relaxed">
                  Thank you. Your request reference is <strong className="font-mono">{invitationRef}</strong>. Our academic partnerships team will contact you within 24 hours to review cohort requirements.
                </p>
                <button
                  type="button"
                  onClick={() => setInvitationStatus("idle")}
                  className="mt-3 text-xs font-bold text-emerald-700 underline"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleInvitationSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Institution / College Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CEG Chennai, Anna University"
                      value={invitationForm.institution}
                      onChange={(e) => setInvitationForm({ ...invitationForm, institution: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Contact Person &amp; Role *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Rajesh K., Placement Head"
                      value={invitationForm.contactName}
                      onChange={(e) => setInvitationForm({ ...invitationForm, contactName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Institutional Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. placements@univ.edu"
                      value={invitationForm.email}
                      onChange={(e) => setInvitationForm({ ...invitationForm, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={invitationForm.phone}
                      onChange={(e) => setInvitationForm({ ...invitationForm, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Institution Type
                  </label>
                  <select
                    value={invitationForm.type}
                    onChange={(e) => setInvitationForm({ ...invitationForm, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 bg-white"
                  >
                    <option value="Engineering College / University">Engineering College / University</option>
                    <option value="Autonomous Tech Institute">Autonomous Tech Institute</option>
                    <option value="Corporate / Global SME Sponsor">Corporate / Global SME Sponsor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Cohort Scope or Specific Requirements
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide department details, target batch size, or preferred timelines..."
                    value={invitationForm.message}
                    onChange={(e) => setInvitationForm({ ...invitationForm, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900 resize-none"
                  />
                </div>

                {invitationError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    {invitationError}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-500 font-mono">
                    Official Institutional Inquiries Only
                  </span>
                  <button
                    type="submit"
                    disabled={invitationStatus === "submitting"}
                    className="bg-neutral-900 hover:bg-[#E25C38] text-white px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {invitationStatus === "submitting" ? "Registering..." : "Submit Invitation Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. GLOBAL FOOTPRINT FOOTER
          ========================================================================= */}
      <footer className="py-16 bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Operating Hubs Bar */}
          <div>
            <div className="text-center font-mono text-xs font-bold uppercase tracking-widest text-neutral-500 mb-6">
              OPERATING HUBS &amp; GLOBAL COHORT REACH
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {[
                "Singapore",
                "Japan",
                "Dubai",
                "Qatar",
                "Malaysia",
                "India",
                "UK",
                "US",
              ].map((country, idx) => (
                <span
                  key={idx}
                  className="px-4 py-1.5 rounded-full bg-[#FAFAF9] border border-neutral-200 text-xs font-medium text-neutral-700 shadow-2xs"
                >
                  {country}
                </span>
              ))}
            </div>
          </div>

          {/* Brand & Legal Row */}
          <div className="pt-8 border-t border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <div className="font-mono text-xs font-bold tracking-wider text-neutral-900">
                TALENT_OS // OPERATED BY DESCIENCE OPEN SOURCE CLUB
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                Proprietary talent intelligence framework. Public registration is restricted to authorized intake windows.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-neutral-600">
              <a
                href="https://membership.descienceosclub.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E25C38] hover:underline"
              >
                Membership Portal
              </a>
              <span>&bull;</span>
              <Link href="/login" className="hover:text-neutral-900 transition-colors">
                Portal Sign In
              </Link>
            </div>
          </div>

          {/* Final Copyright */}
          <div className="text-center text-[11px] text-neutral-400 font-mono">
            &copy; {new Date().getFullYear()} DeScience Open Source Club. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Persistent Components */}
      <WelcomePopupModal />
      <BackToTopButton />
    </div>
  );
}
