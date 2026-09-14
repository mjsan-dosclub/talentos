"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { CaseStudy } from "@/lib/casestudies";
import { CheckIcon, ExternalLinkIcon, ShieldCheckIcon, TerminalIcon } from "@/components/Icons";

interface CaseStudyModalProps {
  study: CaseStudy | null;
  onClose: () => void;
}

export default function CaseStudyModal({ study, onClose }: CaseStudyModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (study) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [study, onClose]);

  if (!study) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl border border-[#E6E8EC] shadow-2xl flex flex-col overflow-hidden z-10 animate-scaleUp">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-[#E6E8EC] flex items-center justify-between bg-[#FCFCFD]">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#FF592C]/10 text-[#FF592C] text-[10px] font-bold uppercase tracking-wider">
              {study.category}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#45B26B]/10 text-[#45B26B] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <CheckIcon className="w-3 h-3" />
              {study.defenseStatus === "PASSED_WITH_DISTINCTION" ? "Distinction" : "Peer Verified"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F5F6] hover:bg-[#E6E8EC] text-[#777E90] hover:text-[#23262F] flex items-center justify-center transition-colors text-lg font-bold"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Main Title & Subtitle */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#777E90] mb-1.5 flex items-center gap-2">
              <TerminalIcon className="w-3.5 h-3.5 text-[#FF592C]" />
              <span>{study.systemAudited}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#23262F] leading-tight">
              {study.title}
            </h2>
            <p className="mt-2 text-base text-[#777E90] leading-relaxed">
              {study.subtitle}
            </p>
          </div>

          {/* Student Profile Card */}
          <div className="p-4 rounded-2xl bg-[#F4F5F6] border border-[#E6E8EC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

            <Link
              href={`/record/${encodeURIComponent(study.student.dos_id)}`}
              className="px-4 py-2 rounded-full bg-white hover:bg-[#23262F] text-[#23262F] hover:text-white border border-[#E6E8EC] text-xs font-bold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            >
              <span>View Talent Dossier</span>
              <ExternalLinkIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 3 Metric Badges (Zenler-Inspired Stats) */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {study.metrics.map((m, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E6E8EC] shadow-xs text-center"
              >
                <div className="text-xs font-semibold text-[#777E90] uppercase tracking-wider">
                  {m.label}
                </div>
                <div className="text-lg sm:text-2xl font-bold text-[#23262F] mt-1">
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          {/* Full Technical Story */}
          <div className="space-y-4 text-sm sm:text-base text-[#23262F] leading-relaxed">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#777E90] pt-2">
              Architecture & Peer Defense Deep-Dive
            </h3>
            {study.fullStory.map((paragraph, idx) => (
              <p key={idx} className="text-[#353945]">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Technical Commit & Verification Ledger */}
          <div className="p-4 rounded-2xl bg-[#FCFCFD] border border-[#E6E8EC] space-y-2 text-xs">
            <div className="font-bold text-[#23262F] flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-[#45B26B]" />
              <span>Cryptographic Proof & Defense Ledger</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[#777E90] font-mono">
              <span>Commit: <strong className="text-[#23262F]">{study.commitHash}</strong></span>
              <span>&bull;</span>
              <span>Published: {study.publishedAt}</span>
              <span>&bull;</span>
              <span>Auditor: Zero-Grace Evaluation Council</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {study.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-[#F4F5F6] border border-[#E6E8EC] text-[10px] font-semibold text-[#777E90]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Social Sharing Bar */}
          <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E6E8EC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[#23262F]">Share this Student Architecture</div>
              <div className="text-[11px] text-[#777E90]">Amplify peer-verified open source systems</div>
            </div>
            <div className="flex items-center gap-2">
              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `🔥 Read "${study.title}" authored by ${study.student.name} at DeScience OS Club: https://talentos.descienceosclub.com/#case-studies`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 px-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Share on WhatsApp"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
                </svg>
                <span>WhatsApp</span>
              </a>

              {/* LinkedIn */}
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  `https://talentos.descienceosclub.com/#case-studies`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 px-3 rounded-full bg-[#0A66C2] hover:bg-[#084e96] text-white text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Share on LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
                <span>LinkedIn</span>
              </a>

              {/* Twitter / X */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Check out how ${study.student.name} engineered "${study.title}" via @descience_club: https://talentos.descienceosclub.com/#case-studies`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 px-3 rounded-full bg-[#000000] hover:bg-slate-800 text-white text-[11px] font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Share on X"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>X / Twitter</span>
              </a>
            </div>
          </div>

          {/* Discord Discussion Section (Zero-Maintenance Community Comments) */}
          <div className="p-5 rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/25 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#5865F2] text-white flex items-center justify-center shadow-xs">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#23262F] flex items-center gap-2">
                    <span>Discuss on Discord</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#5865F2]/20 text-[#5865F2] text-[10px] font-bold">
                      #case-studies
                    </span>
                  </div>
                  <div className="text-xs text-[#777E90]">
                    Peer review, concurrency questions & benchmark critique
                  </div>
                </div>
              </div>

              <a
                href="https://discord.gg/descience-osclub"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                <span>Join Discord Thread</span>
                <span>↗</span>
              </a>
            </div>

            <p className="text-xs text-[#5865F2]/80 leading-relaxed pt-1">
              Comments and engineering feedback are hosted directly on our official Discord server. No separate registration required &mdash; jump straight into the thread with your existing Discord account.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:px-8 sm:py-4 border-t border-[#E6E8EC] bg-[#FCFCFD] flex items-center justify-between gap-4">
          <div className="text-xs text-[#777E90]">
            Shared via <span className="font-semibold text-[#23262F]">TalentOS API</span> &bull; <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-[#E6E8EC]">/api/casestudies?slug={study.slug}</code>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#23262F] hover:bg-[#FF592C] text-white text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
          >
            Close Case Study
          </button>
        </div>
      </div>
    </div>
  );
}
