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
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:px-8 sm:py-4 border-t border-[#E6E8EC] bg-[#FCFCFD] flex items-center justify-between gap-4">
          <div className="text-xs text-[#777E90]">
            Shared via <span className="font-semibold text-[#23262F]">TalentOS API</span> &bull; <code className="text-[11px] bg-white px-1.5 py-0.5 rounded border border-[#E6E8EC]">/api/casestudies?slug={study.slug}</code>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#23262F] hover:bg-[#FF592C] text-white text-xs font-bold transition-colors whitespace-nowrap"
          >
            Close Case Study
          </button>
        </div>
      </div>
    </div>
  );
}
