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

  const navLinks = [
    { href: "/admin", label: "Admin Console", roles: ["SUPER_ADMIN"] },
    { href: "/college", label: "College Portal", roles: ["COLLEGE_ADMIN", "SUPER_ADMIN"] },
    { href: "/trainer", label: "Experts Cockpit", roles: ["TRAINER", "SUPER_ADMIN"] },
    { href: "/record/DOS-B3-001", label: "Student 360", roles: ["STUDENT", "SUPER_ADMIN", "TRAINER", "COLLEGE_ADMIN"] },
    { href: "/checkin", label: "Mobile Check-In", roles: ["STUDENT", "TRAINER", "SUPER_ADMIN"] },
  ];

  return (
    <header className="bg-[#0f172a] text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            {config.branding.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={config.branding.logoUrl}
                alt={config.branding.siteTitle}
                className="h-7 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : null}
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
              <div className="flex flex-col">
                <span className="font-semibold text-sm tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  {config.branding.siteTitle}
                </span>
                <span className="text-[10px] text-slate-400 font-normal tracking-wide hidden sm:inline">
                  Talent Intelligence & Evidence OS
                </span>
              </div>
            </div>
          </Link>

          {/* Main Top Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    isActive
                      ? "bg-slate-800 text-white font-semibold shadow-inner"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Timezone Clock & User Session */}
        <div className="flex items-center gap-4">
          {/* Live Indian Standard Time Clock */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 font-mono text-[11px] uppercase">
              {config.timezone === "Asia/Kolkata" ? "IST" : config.timezone}:
            </span>
            <span className="font-mono text-emerald-300 text-xs font-medium">
              {currentTime || "08:30 AM IST"}
            </span>
          </div>

          {/* SessionBar Profile Badge & Sign Out */}
          <SessionBar />
        </div>
      </div>
    </header>
  );
}
