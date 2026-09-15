"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getClientSession, TalentosUser } from "@/lib/session";
import SessionBar from "@/components/SessionBar";
import { getSystemConfig } from "@/lib/config";

export default function AppHeader() {
  const pathname = usePathname();
  const [user, setUser] = useState<TalentosUser | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const config = getSystemConfig();

  useEffect(() => {
    setUser(getClientSession());

    const updateClock = () => {
      try {
        const timeStr = new Intl.DateTimeFormat(config.locale || "en-IN", {
          timeZone: config.timezone || "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZoneName: "short",
        }).format(new Date());
        setCurrentTime(timeStr);
      } catch {
        setCurrentTime(new Date().toLocaleTimeString());
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [config.locale, config.timezone]);


  return (
    <header className="bg-[#0f172a] text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <a href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.branding.logoUrl || "/dos-club-logo.png"}
              alt="DeScience Open Source Club"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover ring-2 ring-emerald-500/40 shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/dos-club-logo.png";
              }}
            />
            <div className="flex flex-col min-w-0">
              <span className="font-gellix font-semibold text-xs sm:text-sm tracking-tight text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1.5 sm:gap-2">
                {/* Short name on mobile, full name on sm+ */}
                <span className="sm:hidden font-bold tracking-tight">TalentOS</span>
                <span className="hidden sm:inline truncate">
                  {config.branding.siteTitle || "TalentOS by DeScience Open Source Club"}
                </span>
                <span className="hidden md:inline-block text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1 sm:px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  {user ? user.role.replace("_", " ") : "B3 LEDGER"}
                </span>
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-normal tracking-wide hidden lg:inline truncate">
                {pathname.startsWith("/admin")
                  ? "Administration & Governance Console"
                  : pathname.startsWith("/college")
                  ? "Partner Institution & Student Analytics"
                  : pathname.startsWith("/trainer")
                  ? "Technical Experts Cockpit & Live Operations"
                  : pathname.startsWith("/record")
                  ? "Student 360 & Learning Evidence Ledger"
                  : pathname.startsWith("/checkin")
                  ? "Zero-Grace Mobile Attendance Check-In"
                  : pathname.startsWith("/submit")
                  ? "Engineering Deliverable Submission"
                  : "Student Growth & Talent Intelligence Platform"}
              </span>
            </div>
          </a>
        </div>

        {/* Right: Navigation & Session */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Quick Home & Dashboard Navigation */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {pathname !== "/" && !pathname.startsWith("/admin") && (
              <a
                href="/"
                className="px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                title="Return to Public Homepage"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="hidden md:inline">Home</span>
              </a>
            )}

            {user ? (
              <a
                href={
                  user.role === "SUPER_ADMIN"
                    ? "/admin"
                    : user.role === "TRAINER"
                    ? "/trainer"
                    : user.role === "COLLEGE_ADMIN"
                    ? "/college"
                    : `/record/${encodeURIComponent(user.dos_id || "DOS-B3-001")}`
                }
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 sm:gap-1.5 ${
                  (user.role === "SUPER_ADMIN" && pathname.startsWith("/admin")) ||
                  (user.role === "TRAINER" && pathname.startsWith("/trainer")) ||
                  (user.role === "COLLEGE_ADMIN" && pathname.startsWith("/college")) ||
                  (user.role === "STUDENT" && pathname.startsWith("/record"))
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
                title={`Go to ${user.role.replace("_", " ")} Dashboard`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="hidden sm:inline">Dashboard</span>
              </a>
            ) : (
              <a
                href="/login"
                className="px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Sign in to TalentOS Portal"
              >
                Portal Sign In
              </a>
            )}
          </div>

          {/* Live IST Clock — desktop only */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-800/90 px-2.5 py-1 rounded-md border border-slate-700 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 font-mono text-[10px] uppercase">
              {config.timezone === "Asia/Kolkata" ? "IST" : config.timezone}:
            </span>
            <span className="font-mono text-emerald-300 text-xs font-medium">
              {currentTime || "09:30 AM IST"}
            </span>
          </div>

          {/* SessionBar Profile Badge & Sign Out */}
          <SessionBar />
        </div>
      </div>
    </header>
  );
}
