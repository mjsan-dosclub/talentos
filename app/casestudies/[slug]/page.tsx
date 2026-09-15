"use client";

import { use, useState } from "react";
import Link from "next/link";
import { getCaseStudyBySlug, INITIAL_CASE_STUDIES } from "@/lib/casestudies";
import {
  CheckIcon,
  ShieldCheckIcon,
  TerminalIcon,
  ShareIcon,
  ArrowRightIcon,
} from "@/components/Icons";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CaseStudyDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = decodeURIComponent(resolvedParams.slug);
  const study = getCaseStudyBySlug(slug) || INITIAL_CASE_STUDIES[0];

  const [copied, setCopied] = useState(false);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Read "${study.title}" by ${study.student.name} on TalentOS // DOS Club`);
    const url = encodeURIComponent(typeof window !== "undefined" ? window.location.href : "");
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(typeof window !== "undefined" ? window.location.href : "");
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#FCFCFD] text-[#23262F] flex flex-col selection:bg-[#FF592C]/20 selection:text-[#FF592C]">
      {/* Top Brand Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E6E8EC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/#case-studies"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#777E90] hover:text-[#23262F] transition-colors group"
            >
              <span className="w-7 h-7 rounded-full border border-[#E6E8EC] flex items-center justify-center group-hover:border-[#23262F] transition-colors">
                ←
              </span>
              <span>Back to Case Studies</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-bold text-[#777E90] hover:text-[#23262F] transition-colors"
            >
              Home
            </Link>
            <span className="text-[#E6E8EC]">&bull;</span>
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-full bg-[#23262F] hover:bg-[#FF592C] text-white text-xs font-bold transition-colors"
            >
              Member Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Article Content Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16">
        {/* Category & Status Pill Bar */}
        <div className="flex flex-wrap items-center gap-2.5 mb-6">
          <span className="px-3 py-1 rounded-full bg-[#FF592C]/10 text-[#FF592C] text-xs font-bold uppercase tracking-wider">
            {study.category}
          </span>
          <span className="px-3 py-1 rounded-full bg-[#45B26B]/10 text-[#45B26B] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <CheckIcon className="w-3.5 h-3.5" />
            {study.defenseStatus === "PASSED_WITH_DISTINCTION" ? "Passed With Distinction" : "Peer Verified"}
          </span>
          <span className="text-xs text-[#777E90] font-medium ml-auto">
            {study.readTime} &bull; Published {study.publishedAt}
          </span>
        </div>

        {/* System Audited Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#F4F5F6] border border-[#E6E8EC] text-xs font-mono font-bold text-[#777E90] mb-4">
          <TerminalIcon className="w-3.5 h-3.5 text-[#FF592C]" />
          <span>{study.systemAudited}</span>
        </div>

        {/* Headline & Subtitle */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#23262F] leading-[1.15]">
          {study.title}
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-[#777E90] leading-relaxed">
          {study.subtitle}
        </p>

        {/* Author Metadata Bar */}
        <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-[#F4F5F6] border border-[#E6E8EC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={study.student.avatar}
              alt={study.student.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
            />
            <div>
              <div className="font-bold text-sm text-[#23262F] flex items-center gap-2">
                <span>{study.student.name}</span>
                <span className="font-mono text-[11px] font-semibold text-[#777E90]">
                  {study.student.dos_id}
                </span>
              </div>
              <div className="text-xs text-[#777E90]">
                {study.student.role} &bull; {study.student.college}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="px-3 py-1 rounded-full bg-white border border-[#E6E8EC] text-[11px] font-bold text-[#23262F] shadow-2xs">
              {study.student.track}
            </span>
          </div>
        </div>

        {/* Cover Photo */}
        <div className="mt-8 rounded-3xl overflow-hidden border border-[#E6E8EC] shadow-md aspect-16/9 bg-[#F4F5F6]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={study.coverImage}
            alt={study.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Key Metrics Highlight Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-10">
          {study.metrics.map((m, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-[#E6E8EC] shadow-xs text-center flex flex-col items-center justify-center"
            >
              <div className="text-xs font-semibold text-[#777E90] uppercase tracking-wider">
                {m.label}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#23262F] mt-1.5 tracking-tight">
                {m.value}
              </div>
            </div>
          ))}
        </div>

        {/* Full Article Text */}
        <article className="prose max-w-none space-y-6 text-[#353945] text-base sm:text-lg leading-relaxed">
          <div className="p-5 rounded-2xl bg-[#FF592C]/5 border border-[#FF592C]/20 text-[#23262F] text-sm sm:text-base font-medium leading-relaxed mb-6">
            <strong className="text-[#FF592C] font-bold block mb-1 uppercase tracking-wider text-xs">
              Executive Architectural Abstract
            </strong>
            {study.summary}
          </div>

          {study.fullStory.map((paragraph, idx) => (
            <p key={idx} className="text-[#23262F]">
              {paragraph}
            </p>
          ))}

          {/* Embedded Media Section */}
          {study.mediaEmbeds && (study.mediaEmbeds.videoUrl || study.mediaEmbeds.spotifyUrl) && (
            <div className="my-8 space-y-6">
              {study.mediaEmbeds.videoUrl && (
                <div className="rounded-2xl overflow-hidden border border-[#E6E8EC] shadow-sm bg-black">
                  <div className="p-3 bg-[#181A20] text-white text-xs font-bold font-mono flex items-center justify-between">
                    <span>📺 DEMO & ARCHITECTURAL PRESENTATION</span>
                  </div>
                  {study.mediaEmbeds.videoUrl.includes("youtube.com") || study.mediaEmbeds.videoUrl.includes("youtu.be") ? (
                    <div className="relative aspect-video w-full">
                      <iframe
                        src={study.mediaEmbeds.videoUrl.replace("watch?v=", "embed/")}
                        title="Video Demo"
                        className="absolute inset-0 w-full h-full border-0"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <video
                      src={study.mediaEmbeds.videoUrl}
                      controls
                      className="w-full max-h-[450px] object-contain"
                    />
                  )}
                </div>
              )}

              {study.mediaEmbeds.spotifyUrl && (
                <div className="rounded-2xl overflow-hidden border border-[#E6E8EC] shadow-sm bg-[#121212]">
                  <div className="p-3 bg-[#1DB954]/10 text-[#1DB954] text-xs font-bold font-mono flex items-center gap-2">
                    <span>🎙️ SPOTIFY DEEP DIVE PODCAST</span>
                  </div>
                  <iframe
                    src={study.mediaEmbeds.spotifyUrl.includes("/embed") ? study.mediaEmbeds.spotifyUrl : study.mediaEmbeds.spotifyUrl.replace("spotify.com/", "spotify.com/embed/")}
                    width="100%"
                    height="152"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="border-0 rounded-b-2xl"
                  />
                </div>
              )}
            </div>
          )}
        </article>

        {/* Cryptographic Proof & Defense Ledger */}
        <div className="mt-12 p-6 rounded-3xl bg-white border border-[#E6E8EC] shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-[#23262F]">
            <ShieldCheckIcon className="w-5 h-5 text-[#45B26B]" />
            <span>Cryptographic Proof &amp; Defense Ledger</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono text-[#777E90] pt-2 border-t border-[#E6E8EC]">
            <div>
              <span className="block text-[10px] uppercase text-[#777E90]">Commit Hash</span>
              <span className="font-bold text-[#23262F]">{study.commitHash}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-[#777E90]">Auditor</span>
              <span className="font-bold text-[#23262F]">Zero-Grace Council</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-[#777E90]">Ledger Status</span>
              <span className="font-bold text-[#45B26B]">CRYPTOGRAPHICALLY ANCHORED</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {study.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-md bg-[#F4F5F6] border border-[#E6E8EC] text-xs font-semibold text-[#777E90]"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Share This Case Study */}
        <div className="mt-8 p-6 rounded-3xl bg-[#F4F5F6] border border-[#E6E8EC] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-[#23262F]">Share this case study</h4>
            <p className="text-xs text-[#777E90]">Celebrate peer engineering rigor across your network.</p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={shareOnTwitter}
              className="h-10 px-4 rounded-full bg-white hover:bg-[#23262F] text-[#23262F] hover:text-white border border-[#E6E8EC] text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-2"
            >
              <span>Share on X</span>
            </button>
            <button
              type="button"
              onClick={shareOnLinkedIn}
              className="h-10 px-4 rounded-full bg-white hover:bg-[#0077B5] text-[#23262F] hover:text-white border border-[#E6E8EC] text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-2"
            >
              <span>LinkedIn</span>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="h-10 px-4 rounded-full bg-[#23262F] hover:bg-[#FF592C] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-2"
            >
              <ShareIcon className="w-3.5 h-3.5" />
              <span>{copied ? "Copied!" : "Copy Link"}</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            DISCORD COMMUNITY DISCUSSION INTEGRATION
            ========================================================================= */}
        <div className="mt-12 rounded-3xl border-2 border-[#5865F2]/20 bg-[#5865F2]/5 p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5865F2] text-white text-[11px] font-bold uppercase tracking-wider">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                <span>Discord Community Discussion</span>
              </div>
              <h3 className="text-xl font-bold text-[#23262F]">
                Debate this architecture in #case-studies on Discord
              </h3>
              <p className="text-xs sm:text-sm text-[#777E90] leading-relaxed">
                All technical comments and peer architecture Q&amp;A are hosted natively in the DOS Club Discord server. Ask {study.student.name} questions about their implementation trade-offs, explore edge cases, and share benchmarks with 1,200+ engineers.
              </p>
            </div>

            <a
              href="https://discord.gg/descience"
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 px-6 rounded-full bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 whitespace-nowrap shrink-0 hover:scale-102"
            >
              <span>Join Discussion Thread</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Quick Reaction Pills */}
          <div className="mt-6 pt-5 border-t border-[#5865F2]/15 flex items-center gap-2 text-xs">
            <span className="text-[#777E90] font-medium mr-2">Quick Reaction:</span>
            {[
              { id: "mindblown", emoji: "🤯", label: "Brilliant Architecture" },
              { id: "fire", emoji: "🔥", label: "Zero-Grace Passed" },
              { id: "rocket", emoji: "🚀", label: "Production Ready" },
            ].map((reaction) => (
              <button
                key={reaction.id}
                type="button"
                onClick={() => setActiveReaction(reaction.id)}
                className={`px-3 py-1 rounded-full border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeReaction === reaction.id
                    ? "bg-[#5865F2] text-white border-[#5865F2] shadow-xs scale-105"
                    : "bg-white text-[#23262F] border-[#E6E8EC] hover:border-[#5865F2]"
                }`}
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Read Next Case Studies Carousel / List */}
        <div className="mt-16 pt-12 border-t border-[#E6E8EC]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#23262F]">
              More Systems Case Studies
            </h3>
            <Link
              href="/#case-studies"
              className="text-xs font-bold text-[#FF592C] hover:underline"
            >
              View all &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {INITIAL_CASE_STUDIES.filter((cs) => cs.id !== study.id)
              .slice(0, 2)
              .map((other) => (
                <Link
                  key={other.id}
                  href={`/casestudies/${other.slug}`}
                  className="p-5 rounded-3xl bg-white border border-[#E6E8EC] shadow-xs hover:shadow-md hover:border-[#FF592C] transition-all group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#FF592C] uppercase tracking-wider">
                      {other.category}
                    </span>
                    <h4 className="text-sm font-bold text-[#23262F] group-hover:text-[#FF592C] transition-colors mt-1 line-clamp-2">
                      {other.title}
                    </h4>
                    <p className="text-xs text-[#777E90] mt-2 line-clamp-2">
                      {other.summary}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#E6E8EC] flex items-center justify-between text-xs text-[#777E90]">
                    <span>By {other.student.name}</span>
                    <span className="font-bold text-[#23262F] group-hover:translate-x-0.5 transition-transform">
                      Read &rarr;
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}
