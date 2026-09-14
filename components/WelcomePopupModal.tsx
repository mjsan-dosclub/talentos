"use client";

import React, { useEffect, useState } from "react";
import type { WelcomePopup } from "@/lib/popups-types";

import { XIcon, VideoIcon, RadioIcon, ExternalLinkIcon, ArrowRightIcon } from "@/components/Icons";

function getYouTubeEmbedUrl(rawUrl: string): string | null {
  if (!rawUrl) return null;
  try {
    // If already embed URL
    if (rawUrl.includes("youtube.com/embed/")) {
      return rawUrl;
    }
    // Match standard watch URL or youtu.be
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = rawUrl.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1&mute=0&rel=0`;
    }
  } catch {
    // Return null on failure
  }
  return null;
}

export default function WelcomePopupModal() {
  const [popup, setPopup] = useState<WelcomePopup | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function checkActivePopup() {
      try {
        const res = await fetch("/api/popups/active");
        if (!res.ok) return;
        const data = await res.json();
        if (data.popup && isMounted) {
          // Check if already dismissed in this session
          const dismissedKey = `dos_popup_dismissed_${data.popup.id}`;
          const isDismissed = sessionStorage.getItem(dismissedKey);
          if (!isDismissed) {
            setPopup(data.popup);
            setIsOpen(true);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch active welcome popup:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkActivePopup();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDismiss = () => {
    if (popup) {
      try {
        sessionStorage.setItem(`dos_popup_dismissed_${popup.id}`, "true");
      } catch {
        // Ignore storage error
      }
    }
    setIsOpen(false);
  };

  if (!isOpen || !popup || loading) {
    return null;
  }

  const embedUrl = popup.contentType === "YOUTUBE" ? getYouTubeEmbedUrl(popup.mediaUrl) : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={popup.title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
    >
      <div className="relative w-full max-w-2xl bg-white text-[#10222b] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4caf50] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#4caf50]"></span>
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-[#2f8a36] font-bold">
              {popup.badge || "BROADCAST // FLASH NEWS"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close Announcement"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Media Section */}
        {popup.contentType === "YOUTUBE" && embedUrl && (
          <div className="relative w-full aspect-video bg-black border-b border-slate-200">
            <iframe
              src={embedUrl}
              title={popup.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
        )}

        {popup.contentType === "FLYER" && popup.mediaUrl && (
          <div className="relative w-full max-h-72 bg-slate-100 overflow-hidden border-b border-slate-200">
            <img
              src={popup.mediaUrl}
              alt={popup.title}
              className="w-full h-full object-cover object-center"
            />
          </div>
        )}

        {popup.contentType === "ACHIEVER" && popup.mediaUrl && (
          <div className="relative w-full bg-slate-50 p-6 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden border-2 border-[#4caf50]/60 shadow-md bg-white">
              <img
                src={popup.mediaUrl}
                alt={popup.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 bg-[#2f8a36] text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                VERIFIED
              </span>
            </div>
            <div className="text-center sm:text-left">
              <div className="font-mono text-xs uppercase tracking-wider text-[#0d6b90] font-bold mb-1">
                HALL OF ACHIEVERS
              </div>
              <h3 className="text-xl font-bold text-[#10222b] tracking-tight leading-snug">
                {popup.title}
              </h3>
            </div>
          </div>
        )}

        {/* Body Copy */}
        <div className="p-6 sm:p-7 space-y-4">
          {popup.contentType !== "ACHIEVER" && (
            <h2 className="text-2xl font-bold tracking-tight text-[#10222b] font-['Space_Grotesk']">
              {popup.title}
            </h2>
          )}

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {popup.description}
          </p>

          {/* Action Row */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs font-mono text-slate-500 hover:text-slate-800 uppercase tracking-wider py-2 font-medium"
            >
              Dismiss Notice
            </button>

            {popup.actionUrl && popup.actionLabel && (
              <a
                href={popup.actionUrl}
                target={popup.actionUrl.startsWith("http") ? "_blank" : "_self"}
                rel={popup.actionUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#4caf50] to-[#2f8a36] text-white font-semibold text-sm shadow-md hover:shadow-[#4caf50]/20 hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <span>{popup.actionLabel}</span>
                {popup.actionUrl.startsWith("http") ? (
                  <ExternalLinkIcon className="w-4 h-4" />
                ) : (
                  <ArrowRightIcon className="w-4 h-4" />
                )}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
