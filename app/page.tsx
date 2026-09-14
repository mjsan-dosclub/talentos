"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getClientSession, TalentosUser } from "@/lib/session";
import {
  ArrowRightIcon,
  CheckIcon,
  TerminalIcon,
  ExternalLinkIcon,
  ShieldCheckIcon,
} from "@/components/Icons";
import WelcomePopupModal from "@/components/WelcomePopupModal";
import BackToTopButton from "@/components/BackToTopButton";

// Lightweight performant on-scroll reveal wrapper
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -50px 0px", threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } transition-all duration-700 ease-out ${className}`}
    >
      {children}
    </div>
  );
}

const DEFAULT_CASE_STUDIES = [
  {
    id: "cs-001",
    slug: "siddharth-raft-consensus-engine",
    tag: "GLOBAL IMMERSION",
    title: "The 36-Hour Hackathon & Singapore Immersion",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    summary: "How longitudinal telemetry filtered 200+ builders to select the top squad for international cross-border deployment.",
  },
  {
    id: "cs-002",
    slug: "ananya-paged-kv-cache-runtime",
    tag: "PRODUCTION DEPLOYMENT",
    title: "From Campus Theory to High-Velocity Production",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
    summary: "How an auditable repository ledger replaced the conventional resume for overseas SME engineering teams.",
  },
  {
    id: "cs-003",
    slug: "karthik-lsm-tree-storage-engine",
    tag: "SYSTEMS ARCHITECTURE",
    title: "Autonomous AI Systems Delivery",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
    summary: "Pre-final year students delivering live microservice APIs under production constraints and industry scrutiny.",
  },
  {
    id: "cs-004",
    slug: "meera-zerotrust-ephemeral-mtls",
    tag: "CAREER ACCELERATION",
    title: "Cross-Border Engineering Placement",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
    summary: "How verifiable Git commits helped candidate secure an international role without a single standard campus interview.",
  },
  {
    id: "cs-005",
    slug: "vikram-linux-ebpf-telemetry",
    tag: "OPEN SOURCE LEADERSHIP",
    title: "Open Source Core Contributor Track",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
    summary: "Transforming undergraduate developers into recognized maintainers of production open source tooling.",
  },
];

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<TalentosUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic Case Studies State (synchronized with Admin CMS)
  const [caseStudies, setCaseStudies] = useState(DEFAULT_CASE_STUDIES);

  // Terminal Access Input State
  const [accessPass, setAccessPass] = useState("");

  // Case Studies Horizontal Slider Ref
  const caseStudyScrollRef = useRef<HTMLDivElement>(null);

  const scrollCaseStudies = (direction: "left" | "right") => {
    if (caseStudyScrollRef.current) {
      const offset = direction === "left" ? -390 : 390;
      caseStudyScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  // Request Access Form State
  const [requestForm, setRequestForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    role: "Engineering Student (Year 3-4)",
    referralSource: "LinkedIn / Social Media",
  });
  const [requestStatus, setRequestStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [requestRef, setRequestRef] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    setUser(getClientSession());

    // Fetch site settings to keep SEO title live
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.config?.seo?.metaTitle) {
            document.title = data.config.seo.metaTitle;
          }
        }
      } catch {
        // fallback
      }
    }
    loadSettings();

    // Fetch active published case studies from Admin CMS API
    async function loadDynamicCaseStudies() {
      try {
        const res = await fetch("/api/casestudies");
        if (res.ok) {
          const data = await res.json();
          if (data.casestudies && Array.isArray(data.casestudies) && data.casestudies.length > 0) {
            const published = data.casestudies
              .filter((s: any) => s.status !== "DRAFT")
              .map((s: any) => ({
                id: s.id,
                slug: s.slug,
                tag: s.tag || s.badge || s.category || "CASE STUDY",
                title: s.title,
                image: s.coverImage || s.bannerImage || s.image || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
                summary: s.summary || s.subtitle || s.shortDescription || "",
              }));
            if (published.length > 0) {
              setCaseStudies(published);
            }
          }
        }
      } catch {
        // Fallback to default published case studies
      }
    }
    loadDynamicCaseStudies();
  }, []);

  const getDashboardHref = () => {
    if (!user) return "/login";
    if (user.role === "SUPER_ADMIN") return "/admin";
    if (user.role === "TRAINER") return "/trainer";
    if (user.role === "COLLEGE_ADMIN") return "/college";
    if (user.role === "STUDENT") return `/record/${encodeURIComponent(user.dos_id || "DOS-B3-001")}`;
    return "/admin";
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessPass.trim()) return;
    const cleanKey = accessPass.trim().toUpperCase();
    router.push(`/ledger/${encodeURIComponent(cleanKey)}`);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestStatus("submitting");
    setRequestError(null);

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: requestForm.fullName,
          email: requestForm.email,
          phone: requestForm.phone.trim() || "N/A",
          current_role: `${requestForm.role} • ${requestForm.organization}`,
          referral_source: requestForm.referralSource,
          message: `Cohort Access Request from ${requestForm.organization}`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRequestStatus("success");
        setRequestRef(data.enquiryId || "REQ-CLEARANCE-LOGGED");
      } else {
        setRequestStatus("error");
        setRequestError(data.error || "Unable to submit request. Please apply via the membership portal.");
      }
    } catch {
      setRequestStatus("error");
      setRequestError("Network communication error. Please try again or apply directly.");
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#14171A] font-sans selection:bg-[#E25C38]/20 selection:text-[#E25C38] overflow-x-clip w-full">
      {/* =========================================================================
          MODULE 1: STICKY NAVIGATION BAR
          ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left: Brand with Emerald Status Pulse */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <div className="flex items-baseline gap-1.5 font-mono tracking-tight">
              <span className="font-bold text-[#14171A] text-sm tracking-wider">DOS CLUB</span>
              <span className="text-neutral-300 text-xs">//</span>
              <span className="font-medium text-neutral-500 text-xs tracking-widest">TALENT_OS</span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#privileges"
              className="text-xs font-semibold text-neutral-600 hover:text-[#14171A] tracking-wider uppercase transition-colors"
            >
              Access Privileges
            </Link>
            <Link
              href="#case-studies"
              className="text-xs font-semibold text-neutral-600 hover:text-[#14171A] tracking-wider uppercase transition-colors"
            >
              Case Studies
            </Link>
            <Link
              href="#request-access"
              className="text-xs font-semibold text-neutral-600 hover:text-[#14171A] tracking-wider uppercase transition-colors"
            >
              Request Access
            </Link>
            <Link
              href={getDashboardHref()}
              className="text-xs font-semibold text-neutral-600 hover:text-[#14171A] tracking-wider uppercase transition-colors"
            >
              {user ? "Dashboard" : "Portal Access"}
            </Link>
            <a
              href="https://membership.descienceosclub.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#E25C38] text-white px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-[#CC4F2E] transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
            >
              <span>Become a Member</span>
              <ExternalLinkIcon className="w-3.5 h-3.5" />
            </a>
          </nav>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-neutral-200 text-neutral-700 hover:text-[#14171A] hover:bg-neutral-50 transition-colors"
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
              href="#privileges"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider"
            >
              Access Privileges
            </Link>
            <Link
              href="#case-studies"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider"
            >
              Case Studies
            </Link>
            <Link
              href="#request-access"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider"
            >
              Request Access
            </Link>
            <Link
              href={getDashboardHref()}
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
          MODULE 2: HERO SECTION WITH FLOATING TELEMETRY
          ========================================================================= */}
      <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-28 lg:pb-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left Copy & Action Bar */}
            <Reveal className="lg:col-span-7">
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAFAF9] border border-neutral-200 mb-6 font-mono text-[11px] font-semibold text-neutral-700 tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#E25C38]" />
                <span>PRIORITY CLEARANCE // COHORT INTAKE ACTIVE</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#14171A] leading-[1.08]">
                The placement queue is broken. <br />
                <span className="text-[#E25C38]">Step into the talent lounge.</span>
              </h1>

              {/* Subhead */}
              <p className="mt-6 text-base sm:text-lg text-neutral-600 leading-relaxed max-w-2xl">
                While your peers wait in crowded campus placement lines trading boilerplate resumes, DOS Club members bypass the line entirely. TalentOS is your verified flight recorder: translating months of private engineering rigor into unarguable production telemetry. Stop applying. Get cleared.
              </p>

              {/* Action Bar */}
              <div className="mt-8 pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <a
                  href="https://membership.descienceosclub.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#E25C38] hover:bg-[#CC4F2E] text-white px-8 py-4 rounded-full text-sm font-semibold tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 group text-center shrink-0 active:scale-98"
                >
                  <span>Become a Member</span>
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>

                {/* Terminal Input */}
                <form
                  onSubmit={handleVerify}
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
                    className="w-full bg-transparent text-xs font-mono text-[#14171A] placeholder:text-neutral-400 focus:outline-none uppercase"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-full bg-[#14171A] text-white hover:bg-neutral-800 text-xs font-semibold tracking-wider uppercase transition-colors shrink-0 cursor-pointer"
                  >
                    Verify
                  </button>
                </form>
              </div>

              {/* Micro Guarantees */}
              <div className="mt-7 flex flex-wrap items-center gap-6 text-xs text-neutral-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4 text-emerald-600" />
                  <span>Zero whiteboard trivia</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4 text-emerald-600" />
                  <span>Audited commit telemetry</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckIcon className="w-4 h-4 text-emerald-600" />
                  <span>Direct global engineering clearance</span>
                </div>
              </div>
            </Reveal>

            {/* Right: Hero Visual Composition with 4 Floating Telemetry Badges */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden border border-neutral-200 shadow-xl aspect-4/5 sm:aspect-square lg:aspect-4/5 bg-[#FAFAF9]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80"
                  alt="Authentic Indian engineering students in collaborative workspace"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Badge 1: Top-Right (Git Commit Ledger) */}
              <div className="hidden sm:flex absolute -top-4 -right-4 lg:-right-8 bg-white/95 backdrop-blur-sm border border-neutral-200/80 shadow-lg rounded-2xl p-3 animate-float-slow z-20 items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E25C38]/10 flex items-center justify-center text-[#E25C38] shrink-0">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M11.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122V6A2.5 2.5 0 0110 8.5H6a1 1 0 00-1 1v1.128a2.251 2.251 0 11-1.5 0V5.372a2.25 2.25 0 111.5 0v1.836A2.492 2.492 0 016 7h4a1 1 0 001-1v-.628A2.25 2.25 0 019.5 3.25zM4.25 12a.75.75 0 100 1.5.75.75 0 000-1.5zM3.5 3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#14171A]">Audited Repository Ledger</div>
                  <div className="text-[10px] text-neutral-500 flex items-center gap-1.5 mt-0.5">
                    <span>Production Commits</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-mono font-bold text-[9px] border border-emerald-200">
                      CLEARED
                    </span>
                  </div>
                </div>
              </div>

              {/* Badge 2: Bottom-Right (Consistency Curve Sparkline) */}
              <div className="absolute -bottom-6 right-2 sm:-right-6 bg-white/95 backdrop-blur-sm border border-neutral-200/80 shadow-xl rounded-2xl p-3.5 sm:p-4 animate-float-delayed z-20 max-w-[210px] sm:max-w-[240px]">
                <div className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">
                  Longitudinal Velocity
                </div>
                <div className="text-xs font-bold text-[#14171A] mt-0.5">
                  Top 2% Output Gradient
                </div>
                <div className="mt-2 h-10 w-full">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 120 40">
                    <defs>
                      <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E25C38" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#E25C38" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 35 Q 25 32 45 22 T 85 14 T 120 4 L 120 40 L 0 40 Z"
                      fill="url(#curveGradient)"
                    />
                    <path
                      d="M 0 35 Q 25 32 45 22 T 85 14 T 120 4"
                      fill="none"
                      stroke="#E25C38"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="120" cy="4" r="3" fill="#E25C38" />
                  </svg>
                </div>
              </div>

              {/* Badge 3: Top-Left (Lounge Status Tag) */}
              <div className="absolute top-3 left-3 sm:-top-4 sm:-left-6 bg-white/95 backdrop-blur-sm border border-neutral-200/80 shadow-md rounded-xl px-3 py-2 animate-float-subtle z-20">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono font-bold text-[#14171A] tracking-wider">
                    STATUS: ACTIVE COHORT
                  </span>
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5 font-medium">
                  Direct Clearance Granted
                </div>
              </div>

              {/* Badge 4: Bottom-Left (QR Lounge Pass) */}
              <div className="hidden md:flex absolute -bottom-4 -left-8 bg-white/95 backdrop-blur-sm border border-neutral-200/80 shadow-lg rounded-2xl p-3 animate-float-slow z-20 items-center gap-3">
                <a
                  href="https://membership.descienceosclub.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 p-1 bg-white rounded-lg border border-neutral-200 shrink-0 hover:scale-105 transition-transform"
                >
                  <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="#14171A" strokeWidth="1.5">
                    <rect x="3" y="3" width="6" height="6" rx="1" fill="#14171A" />
                    <rect x="15" y="3" width="6" height="6" rx="1" fill="#14171A" />
                    <rect x="3" y="15" width="6" height="6" rx="1" fill="#14171A" />
                    <path d="M15 15h2v2h-2zM19 15h2v2h-2zM15 19h2v2h-2zM19 19h2v2h-2z" fill="#14171A" />
                  </svg>
                </a>
                <div>
                  <div className="text-[11px] font-bold text-[#14171A]">Scan for Lounge Pass</div>
                  <div className="text-[10px] text-neutral-500 font-mono">Direct Intake Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MODULE 3: TELEMETRY METRIC STRIP
          ========================================================================= */}
      <section className="bg-[#FAFAF9] border-y border-neutral-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <Reveal delay={0}>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#14171A] tracking-tight">100%</div>
            <div className="text-xs font-semibold text-neutral-600 mt-1 uppercase tracking-wider">
              Code-Backed Telemetry
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#14171A] tracking-tight">0%</div>
            <div className="text-xs font-semibold text-neutral-600 mt-1 uppercase tracking-wider">
              Proxy Tolerance (Geofenced + Rolling Verification)
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#E25C38] tracking-tight">Micro-Groups</div>
            <div className="text-xs font-semibold text-neutral-600 mt-1 uppercase tracking-wider">
              Focused Cohort Mentoring
            </div>
          </Reveal>
          <Reveal delay={300}>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#14171A] tracking-tight">8+</div>
            <div className="text-xs font-semibold text-neutral-600 mt-1 uppercase tracking-wider">
              Global Access Hubs
            </div>
          </Reveal>
        </div>
      </section>

      {/* =========================================================================
          MODULE 4: THE ACCESS DIVIDE (PEER COMPARISON)
          ========================================================================= */}
      <section id="privileges" className="py-24 sm:py-32 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-3xl mb-16">
            <span className="font-mono text-xs font-bold text-[#E25C38] uppercase tracking-widest">
              THE COST OF WAITING OUTSIDE
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#14171A] mt-2">
              Two entirely different paths to industry.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed">
              Look around your campus. Most students are trapped in a system that hasn&apos;t changed in 20 years.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Column 1: Outside the Lounge */}
            <Reveal delay={100} className="bg-[#FAFAF9] p-8 sm:p-10 rounded-3xl border border-neutral-200 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-200/70 text-neutral-700 font-mono text-xs font-semibold mb-6">
                  <span>OUTSIDE THE LOUNGE</span>
                </div>
                <h3 className="text-2xl font-bold text-[#14171A] mb-4">
                  The Standard Campus Experience
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                  High-stress, standardized pipelines designed for mass compliance rather than engineering mastery.
                </p>

                <ul className="space-y-4 text-sm text-neutral-600">
                  <li className="flex items-start gap-3">
                    <span className="text-neutral-400 font-bold shrink-0 mt-0.5">✕</span>
                    <span>Trapped in 1,000-candidate campus placement drives.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-neutral-400 font-bold shrink-0 mt-0.5">✕</span>
                    <span>Padded 1-page PDF resumes filled with identical buzzwords.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-neutral-400 font-bold shrink-0 mt-0.5">✕</span>
                    <span>Solving theoretical LeetCode puzzles while never shipping live software.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-neutral-400 font-bold shrink-0 mt-0.5">✕</span>
                    <span>Attendance marked for physical presence, never for actual output.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-neutral-400 font-bold shrink-0 mt-0.5">✕</span>
                    <span>Betting an entire degree on a single 30-minute high-stress interview.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-200 text-xs font-mono text-neutral-400">
                REALITY: 94% CANDIDATE ATTRITION IN MASS SCREENING
              </div>
            </Reveal>

            {/* Column 2: Inside the TalentOS Lounge */}
            <Reveal delay={200} className="bg-white p-8 sm:p-10 rounded-3xl border-2 border-[#14171A] shadow-md flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#E25C38]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E25C38]/10 text-[#E25C38] font-mono text-xs font-semibold mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E25C38]" />
                  <span>INSIDE THE TALENTOS LOUNGE</span>
                </div>
                <h3 className="text-2xl font-bold text-[#14171A] mb-4">
                  DOS Club Members
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed mb-6">
                  Unrestricted access to specialized industry clearance backed by months of recorded production telemetry.
                </p>

                <ul className="space-y-4 text-sm text-neutral-800 font-medium">
                  <li className="flex items-start gap-3">
                    <CheckIcon className="w-4 h-4 text-[#E25C38] shrink-0 mt-0.5" />
                    <span>Direct priority clearance into specialized global engineering and AI teams.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="w-4 h-4 text-[#E25C38] shrink-0 mt-0.5" />
                    <span>An immutable dossier of verified code repositories and live deployments.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="w-4 h-4 text-[#E25C38] shrink-0 mt-0.5" />
                    <span>Proven under real-world engineering friction, debugging, and team delivery.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="w-4 h-4 text-[#E25C38] shrink-0 mt-0.5" />
                    <span>Telemetry logs consistency, execution speed, and behavioral resilience.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckIcon className="w-4 h-4 text-[#E25C38] shrink-0 mt-0.5" />
                    <span>Arriving with unarguable longitudinal proof before the conversation begins.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-xs font-mono font-bold text-[#E25C38]">
                  OUTCOME: IMMEDIATE TECHNICAL RESPECT
                </span>
                <a
                  href="https://membership.descienceosclub.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#14171A] hover:text-[#E25C38] transition-colors"
                >
                  <span>Skip the queue. Enter the Talent Lounge</span>
                  <span>&rarr;</span>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MODULE 5: DIRECT STUDENT INTAKE
          ========================================================================= */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="bg-[#FAFAF9] border-2 border-[#E25C38]/30 p-8 sm:p-10 rounded-3xl relative overflow-hidden">
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-200 text-xs font-mono font-semibold text-neutral-700 uppercase tracking-wider">
                <span>DIRECT CANDIDATE PIPELINE</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#14171A] tracking-tight leading-tight">
                Independent Student Builder? Take the Direct Route.
              </h2>

              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
                You do not need to wait for your college to partner with DOS Club. Individual student builders are admitted directly into active cohorts organized into focused micro-teams. Gain priority clearance to private build sprints, global exposure, and verified talent dossiers.
              </p>

              <div className="pt-3 flex flex-col sm:flex-row sm:items-center gap-4">
                <a
                  href="https://membership.descienceosclub.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 bg-[#E25C38] hover:bg-[#CC4F2E] text-white px-7 py-3.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all shadow-sm active:scale-95 text-center justify-center"
                >
                  <span>Apply for Student Pass &rarr;</span>
                </a>
                <span className="text-xs text-neutral-500 font-medium">
                  Intake open for upcoming cohort calibration.
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =========================================================================
          MODULE 6: CALIBRATION UNDER PRESSURE
          ========================================================================= */}
      <section className="py-24 bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-3xl mb-16">
            <span className="font-mono text-xs font-bold text-[#E25C38] uppercase tracking-widest">
              HOW WE CALIBRATE
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#14171A] mt-2">
              What happens behind closed doors.
            </h2>
            <p className="mt-3 text-base sm:text-lg text-neutral-600 leading-relaxed">
              We don&apos;t teach syntax. We build engineering stamina.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Reveal delay={0} className="p-8 rounded-3xl border border-neutral-200 bg-[#FAFAF9] flex flex-col justify-between">
              <div>
                <div className="font-mono text-2xl font-bold text-[#E25C38] mb-4">01</div>
                <h3 className="text-xl font-bold text-[#14171A] mb-3">Production Resilience</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Shipping software under tight deadlines, handling complex merge conflicts, and delivering working systems instead of slide decks.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-neutral-200 text-xs font-mono text-neutral-500">
                PROVEN EXECUTION
              </div>
            </Reveal>

            <Reveal delay={150} className="p-8 rounded-3xl border border-neutral-200 bg-[#FAFAF9] flex flex-col justify-between">
              <div>
                <div className="font-mono text-2xl font-bold text-[#E25C38] mb-4">02</div>
                <h3 className="text-xl font-bold text-[#14171A] mb-3">Behavioral Profiling</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Tracking team dynamics, communication velocity, and how candidates solve problems when systems break minutes before release.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-neutral-200 text-xs font-mono text-neutral-500">
                STRESS TESTED
              </div>
            </Reveal>

            <Reveal delay={300} className="p-8 rounded-3xl border border-neutral-200 bg-[#FAFAF9] flex flex-col justify-between">
              <div>
                <div className="font-mono text-2xl font-bold text-[#E25C38] mb-4">03</div>
                <h3 className="text-xl font-bold text-[#14171A] mb-3">Immutable Dossier</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Every commit, peer review, and mentor standout flag is permanently recorded. Proof that cannot be exaggerated.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-neutral-200 text-xs font-mono text-neutral-500">
                LONGITUDINAL TELEMETRY
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MODULE 7: THE EVIDENCE ENGINE (WHAT PARTNERS INSPECT)
          ========================================================================= */}
      <section className="py-24 bg-[#FAFAF9] border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-3xl mb-16">
            <span className="font-mono text-xs font-bold text-[#E25C38] uppercase tracking-widest">
              FACTUAL AUDIT ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#14171A] mt-2">
              Resumes claim. Telemetry proves.
            </h2>
            <p className="mt-3 text-base sm:text-lg text-neutral-600 leading-relaxed">
              When international engineering teams evaluate DOS Club talent, they do not read personal summaries. They inspect audit records.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Reveal delay={0} className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-[#E25C38]/10 text-[#E25C38] flex items-center justify-center font-bold text-lg mb-6">
                <TerminalIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#14171A] mb-3">
                Real-time Git Commit Audits
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Verifying active code contributions during build sessions, not copied templates. Cryptographic hashes tie work directly to the author.
              </p>
            </Reveal>

            <Reveal delay={150} className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-6">
                <ShieldCheckIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#14171A] mb-3">
                Zero-Grace Verification
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Geofenced, time-sensitive access verification that eliminates attendance proxies. Physical presence is audited at the millisecond level.
              </p>
            </Reveal>

            <Reveal delay={300} className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-[#14171A] flex items-center justify-center font-bold text-lg mb-6">
                <CheckIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#14171A] mb-3">
                Mentor Observation Dossiers
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Direct qualitative notes from industry practitioners documenting behavioral reliability, speed under pressure, and intellectual honesty.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MODULE 8: MEMBER CLEARANCE & PRIVILEGES
          ========================================================================= */}
      <section className="py-24 bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-3xl mb-16">
            <span className="font-mono text-xs font-bold text-[#E25C38] uppercase tracking-widest">
              UNLOCKED TIERS
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#14171A] mt-2">
              The Privileges of Membership
            </h2>
            <p className="mt-3 text-base sm:text-lg text-neutral-600 leading-relaxed">
              What opens up once you hold a verified DOS Club Pass.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Reveal delay={0} className="p-6 rounded-3xl border border-neutral-200 bg-[#FAFAF9] hover:border-neutral-900 transition-colors flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E25C38]">Tier 01</span>
                <h3 className="text-lg font-bold text-[#14171A] mt-2 mb-2">Private Build Arena</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Access to closed engineering workspaces and hackathons shielded from the general public.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-neutral-200 text-[10px] font-mono text-neutral-500">
                RESTRICTED INTAKE
              </div>
            </Reveal>

            <Reveal delay={100} className="p-6 rounded-3xl border border-neutral-200 bg-[#FAFAF9] hover:border-neutral-900 transition-colors flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E25C38]">Tier 02</span>
                <h3 className="text-lg font-bold text-[#14171A] mt-2 mb-2">Direct Dossier Ledger</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Your continuous repository telemetry shared directly with specialized engineering recruiters.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-neutral-200 text-[10px] font-mono text-neutral-500">
                AUDITED PROFILE
              </div>
            </Reveal>

            <Reveal delay={200} className="p-6 rounded-3xl border border-neutral-200 bg-[#FAFAF9] hover:border-neutral-900 transition-colors flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E25C38]">Tier 03</span>
                <h3 className="text-lg font-bold text-[#14171A] mt-2 mb-2">Global Immersion Gateway</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Priority qualification for international immersion cohorts and cross-border hackathons.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-neutral-200 text-[10px] font-mono text-neutral-500">
                GLOBAL ACCESS
              </div>
            </Reveal>

            <Reveal delay={300} className="p-6 rounded-3xl border border-neutral-200 bg-[#FAFAF9] hover:border-neutral-900 transition-colors flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E25C38]">Tier 04</span>
                <h3 className="text-lg font-bold text-[#14171A] mt-2 mb-2">Executive Fast-Track</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Bypassing mass-recruitment screening straight to technical leads and founding teams.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-neutral-200 text-[10px] font-mono text-neutral-500">
                DAY-ZERO STANDING
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MODULE 9: CASE STUDIES SLIDER (HORIZONTAL SINGLE-LINE CAROUSEL)
          ========================================================================= */}
      <section id="case-studies" className="py-24 bg-[#FAFAF9] border-y border-neutral-200 scroll-mt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Navigation Controls */}
          <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <span className="font-mono text-xs font-bold text-[#E25C38] uppercase tracking-widest">
                VERIFIED COHORT OUTCOMES
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#14171A] mt-2">
                Case Studies
              </h2>
              <p className="mt-3 text-base text-neutral-600 leading-relaxed">
                Real candidate trajectories, verified deployments, and global hackathon selections.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => scrollCaseStudies("left")}
                aria-label="Previous Case Study"
                className="w-11 h-11 rounded-full border border-neutral-300 bg-white hover:border-[#14171A] text-[#14171A] flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-95"
              >
                &larr;
              </button>
              <button
                type="button"
                onClick={() => scrollCaseStudies("right")}
                aria-label="Next Case Study"
                className="w-11 h-11 rounded-full border border-neutral-300 bg-white hover:border-[#14171A] text-[#14171A] flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-95"
              >
                &rarr;
              </button>
            </div>
          </Reveal>

          {/* Single-Line Horizontal Carousel Track */}
          <div
            ref={caseStudyScrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4"
          >
            {caseStudies.map((study) => (
              <Link
                key={study.id}
                href={`/casestudies/${study.slug}`}
                className="w-[330px] sm:w-[380px] shrink-0 snap-start bg-white rounded-3xl border border-neutral-200 p-5 shadow-2xs hover:shadow-lg hover:border-[#14171A] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="aspect-16/10 rounded-2xl overflow-hidden relative mb-4 bg-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={study.image}
                      alt={study.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#14171A] text-[10px] font-mono font-bold tracking-wider border border-neutral-200">
                      {study.tag}
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#14171A] group-hover:text-[#E25C38] transition-colors leading-snug line-clamp-2">
                    {study.title}
                  </h3>
                  <p className="mt-2 text-xs text-neutral-600 leading-relaxed line-clamp-3">
                    {study.summary}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-[#E25C38]">
                  <span>Read Full Case Study</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a
              href="https://membership.descienceosclub.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#E25C38] hover:text-[#CC4F2E] transition-colors uppercase tracking-wider"
            >
              <span>Become a Member to Enter the Talent Pool</span>
              <ArrowRightIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MODULE 10: EDITORIAL PHILOSOPHY
          ========================================================================= */}
      <section className="bg-[#FAFAF9] border-y border-neutral-200 py-20 px-4 sm:px-6 lg:px-8 text-center">
        <Reveal className="max-w-4xl mx-auto">
          <blockquote className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#14171A] tracking-tight leading-[1.2]">
            &ldquo;Potential cannot be measured in a 45-minute interview or a paper resume. It reveals itself through months of consistent execution.&rdquo;
          </blockquote>
          <p className="mt-6 text-xs sm:text-sm font-mono uppercase tracking-widest text-neutral-500">
            TalentOS Operating Framework : Descience Open Source Club
          </p>
        </Reveal>
      </section>

      {/* =========================================================================
          MODULE 11: REQUEST ACCESS INTAKE FORM
          ========================================================================= */}
      <section id="request-access" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="bg-white p-8 sm:p-12 rounded-3xl border border-neutral-200 shadow-sm">
            <div className="mb-8">
              <span className="font-mono text-xs font-bold text-[#E25C38] uppercase tracking-widest">
                INSTITUTIONAL &amp; ENTERPRISE CLEARANCE
              </span>
              <h2 className="text-3xl font-extrabold text-[#14171A] mt-2">
                Request Access
              </h2>
              <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
                For engineering colleges, placement cells, and hiring partners seeking dedicated institutional programs.
              </p>
            </div>

            {requestStatus === "success" ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <CheckIcon className="w-5 h-5 text-emerald-600" />
                  <span>Access Request Registered</span>
                </div>
                <p className="text-xs leading-relaxed">
                  Thank you. Your request ID is <strong className="font-mono">{requestRef}</strong>. Our partnerships committee will contact you within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setRequestStatus("idle")}
                  className="mt-3 text-xs font-bold text-emerald-700 underline"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={requestForm.fullName}
                    onChange={(e) => setRequestForm({ ...requestForm, fullName: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4F5F6] border border-[#E6E8EC] text-sm text-[#23262F] focus:outline-none focus:border-[#23262F]"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={requestForm.email}
                    onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4F5F6] border border-[#E6E8EC] text-sm text-[#23262F] focus:outline-none focus:border-[#23262F]"
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    required
                    placeholder="Mobile / WhatsApp Number (e.g. +91 98401 23456)"
                    value={requestForm.phone}
                    onChange={(e) => setRequestForm({ ...requestForm, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4F5F6] border border-[#E6E8EC] text-sm text-[#23262F] focus:outline-none focus:border-[#23262F]"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    required
                    placeholder="College / Organization Name"
                    value={requestForm.organization}
                    onChange={(e) => setRequestForm({ ...requestForm, organization: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4F5F6] border border-[#E6E8EC] text-sm text-[#23262F] focus:outline-none focus:border-[#23262F]"
                  />
                </div>

                <div>
                  <select
                    value={requestForm.role}
                    onChange={(e) => setRequestForm({ ...requestForm, role: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#F4F5F6] border border-[#E6E8EC] text-sm text-[#23262F] focus:outline-none focus:border-[#23262F]"
                  >
                    <option value="Engineering Student (Year 1-2)">Engineering Student (Year 1-2)</option>
                    <option value="Engineering Student (Year 3-4)">Engineering Student (Year 3-4)</option>
                    <option value="Recent Engineering Graduate">Recent Engineering Graduate</option>
                    <option value="Early Professional (0-2 YOE)">Early Professional / Junior Dev (0-2 YOE)</option>
                    <option value="Senior Engineer (2+ YOE)">Senior Engineer / Lead (2+ YOE)</option>
                    <option value="Self-Taught Builder">Self-Taught Builder / Open Source</option>
                    <option value="Other">Other / Non-Traditional</option>
                  </select>
                </div>

                <div>
                  <select
                    value={requestForm.referralSource}
                    onChange={(e) => setRequestForm({ ...requestForm, referralSource: e.target.value })}
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

                {requestError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    {requestError}
                  </div>
                )}

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={requestStatus === "submitting"}
                    className="w-full bg-[#E25C38] text-white py-3.5 px-8 rounded-full font-semibold hover:bg-[#CC4F2E] transition-all shadow-sm active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    {requestStatus === "submitting" ? "Processing..." : "Submit Access Request ->"}
                  </button>
                </div>

                <p className="text-xs text-neutral-500 pt-3 text-center">
                  Individual student builder?{" "}
                  <a
                    href="https://membership.descienceosclub.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E25C38] hover:underline font-semibold"
                  >
                    Apply for Student Pass &rarr;
                  </a>
                </p>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      {/* =========================================================================
          MODULE 12: ENTERPRISE FOOTER & GLOBAL REACH
          ========================================================================= */}
      <footer className="py-16 bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Operating Hubs */}
          <div className="text-center">
            <div className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-500 mb-5">
              OPERATING HUBS &amp; GLOBAL COHORT REACH
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-mono text-neutral-600">
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
                <span key={idx} className="flex items-center gap-2 sm:gap-3">
                  <span className="px-3.5 py-1.5 rounded-full bg-[#FAFAF9] border border-neutral-200 text-xs font-medium text-neutral-700 shadow-2xs">
                    {country}
                  </span>
                  {idx < 7 && <span className="text-neutral-400 font-bold select-none">.</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Social Media Channels (All 7 Channels) */}
          <div className="pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="font-mono text-xs font-bold text-neutral-900 tracking-wider">
                COMMUNITY CHANNELS
              </span>
              <p className="text-xs text-neutral-500 mt-0.5">
                Connect with 1,200+ verified builders and alumni worldwide.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-center">
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/descience-open-source-club"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#FAFAF9] border border-neutral-200 hover:border-[#14171A] hover:bg-[#14171A] hover:text-white text-neutral-700 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/channel/UCvF5jATxekeLcFvjLrMGjpA"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#FAFAF9] border border-neutral-200 hover:border-[#FF0000] hover:bg-[#FF0000] hover:text-white text-neutral-700 flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* X (Twitter) */}
              <a
                href="https://x.com/descienceosclub"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#FAFAF9] border border-neutral-200 hover:border-[#14171A] hover:bg-[#14171A] hover:text-white text-neutral-700 flex items-center justify-center transition-colors"
                aria-label="X (Twitter)"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/descienceopensourceclub/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#FAFAF9] border border-neutral-200 hover:border-[#E1306C] hover:bg-[#E1306C] hover:text-white text-neutral-700 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/descienceosclub"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#FAFAF9] border border-neutral-200 hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white text-neutral-700 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* Threads */}
              <a
                href="https://www.threads.net/@descienceosclub"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#FAFAF9] border border-neutral-200 hover:border-[#14171A] hover:bg-[#14171A] hover:text-white text-neutral-700 flex items-center justify-center transition-colors"
                aria-label="Threads"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.001 2c-5.522 0-10 4.477-10 10 0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12c0-5.523-4.478-10-10-10z" />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/descienceosclub"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#FAFAF9] border border-neutral-200 hover:border-[#14171A] hover:bg-[#14171A] hover:text-white text-neutral-700 flex items-center justify-center transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Mandatory Parent Attribution & Legal Notice */}
          <div className="pt-8 border-t border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <div className="font-mono text-xs font-bold tracking-wider text-[#14171A]">
                TALENT_OS // OPERATED BY DESCIENCE OPEN SOURCE CLUB
              </div>
              <p className="mt-1 text-xs text-neutral-500 max-w-xl">
                Proprietary talent intelligence framework. Internal evaluation models and access protocols are confidential assets of DOS Club.
              </p>
              <p className="mt-2 text-xs text-neutral-600">
                <a
                  href="http://touchmarkdes.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-900 font-semibold hover:underline"
                >
                  An initiative of Touchmark Descience
                </a>
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
              <Link href="/login" className="hover:text-[#14171A] transition-colors">
                Portal Sign In
              </Link>
            </div>
          </div>

          {/* Copyright */}
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
