"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getStudentByIdOrEmail } from "@/lib/db";
import {
  setClientSession,
  DEMO_ACCOUNTS,
  TalentosUser,
  UserRole,
} from "@/lib/session";
import {
  UserIcon,
  BoltIcon,
  BuildingIcon,
  ShieldCheckIcon,
  MailIcon,
  LockIcon,
  AlertTriangleIcon,
} from "@/components/Icons";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || null;
  const errorCode = searchParams.get("error") || null;

  const [role, setRole] = useState<"student" | "trainer" | "college" | "admin">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (errorCode) {
      if (errorCode === "ERR_ACCESS_DENIED_ADMIN_ONLY") {
        setStatusMessage("Administrator clearance required. Please sign in with an authorized administrator account.");
      } else if (errorCode === "ERR_ACCESS_DENIED_TRAINER_ONLY") {
        setStatusMessage("Technical Expert clearance required. Please sign in with a trainer account.");
      } else if (errorCode === "ERR_ACCESS_DENIED_COLLEGE_ONLY") {
        setStatusMessage("College Coordinator clearance required. Please sign in with a coordinator account.");
      } else {
        setStatusMessage("Please sign in to access your portal.");
      }
    } else if (redirectUrl) {
      setStatusMessage(`Please sign in to access ${redirectUrl}.`);
    }
  }, [errorCode, redirectUrl]);

  // Fast-Auth 1-Click Login for development testing & Acceptance Matrix
  const handleFastLogin = async (demoKey: keyof typeof DEMO_ACCOUNTS) => {
    setIsAuthenticating(true);
    setStatusMessage("Signing in...");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoKey }),
      });

      const data = await res.json();
      if (data.user) {
        setClientSession(data.user);
        const destination = data.user.role === "CUSTOM_ADMIN" ? "/admin?tab=students" : redirectUrl || data.redirect;
        window.location.href = destination;
      } else {
        setStatusMessage("Could not sign in with demo credentials. Please try again.");
        setIsAuthenticating(false);
      }
    } catch (err: any) {
      console.warn("Fast login error:", err);
      setStatusMessage("Authentication service is unavailable. Please try again.");
      setIsAuthenticating(false);
    }
  };

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!email.trim() || !email.includes("@")) {
      setStatusMessage("Please enter a valid registered institutional email address.");
      return;
    }

    if (!password.trim()) {
      setStatusMessage("Please enter your account password.");
      return;
    }

    setIsAuthenticating(true);
    setStatusMessage("Checking credentials...");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim(), role }),
      });

      const data = await res.json();
      if (data.user) {
        setClientSession(data.user);
        const destination = data.user.role === "CUSTOM_ADMIN" ? "/admin?tab=students" : redirectUrl || data.redirect;
        window.location.href = destination;
      } else {
        setStatusMessage(data.error || "Invalid email or password. Please verify your credentials.");
        setIsAuthenticating(false);
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      setStatusMessage("Failed to reach authentication server. Please try again.");
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-[#0f172a] text-white border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-slate-200 hover:text-white transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/dos-club-logo.png"
              alt="DeScience Open Source Club"
              className="h-8 w-8 rounded-full object-cover ring-2 ring-emerald-500/40"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-white">
                DOS Club TalentOS
              </span>
              <span className="text-[10px] text-slate-400 font-normal tracking-wide hidden sm:inline">
                DeScience Open Source Club
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-300 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Role-Based Access Control Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center gap-6">
        {/* Standard Form Login */}
        <div className="border border-slate-200 bg-white rounded-xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
          {/* Header Tag */}
          <div className="flex flex-col items-center text-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/dos-club-logo.png"
              alt="DOS Club Logo"
              className="h-16 w-16 rounded-full object-cover shadow-md ring-4 ring-slate-100"
            />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Sign In to TalentOS
            </h1>
            <p className="text-xs text-slate-500 max-w-sm">
              Enter your registered credentials to access your portal:
            </p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-4 bg-slate-100 p-1 rounded-lg gap-1 text-xs relative z-10 select-none">
            {(
              [
                { id: "student", label: "Student" },
                { id: "trainer", label: "Expert" },
                { id: "college", label: "College" },
                { id: "admin", label: "Admin" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setRole(item.id);
                  setStatusMessage(null);
                  setEmail("");
                  setPassword("");
                }}
                className={`py-2 px-1 text-center font-medium rounded-md transition-all cursor-pointer relative z-10 ${
                  role === item.id
                    ? "bg-white text-slate-900 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleAuthenticate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-slate-700"
              >
                Institutional Email Address
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 select-none">
                  <MailIcon className="w-3.5 h-3.5" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    role === "student"
                      ? "arun@student.dosclub.org"
                      : role === "trainer"
                      ? "faculty@dosclub.org"
                      : role === "college"
                      ? "coordinator@annauniv.edu"
                      : "admin@dosclub.org"
                  }
                  spellCheck={false}
                  autoComplete="email"
                  className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-2xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-slate-700"
              >
                Account Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 select-none">
                  <LockIcon className="w-3.5 h-3.5" />
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  autoComplete="current-password"
                  className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all shadow-2xs"
                />
              </div>
            </div>

            {statusMessage && (
              <div className="p-3 border border-amber-200 bg-amber-50 rounded-lg text-amber-800 text-xs flex items-center gap-2">
                <AlertTriangleIcon className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="mt-2 w-full py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-semibold text-xs rounded-lg transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
            >
              {isAuthenticating
                ? "Verifying Credentials..."
                : `Sign In as ${
                    role === "trainer"
                      ? "Technical Expert"
                      : role === "college"
                      ? "College Coordinator"
                      : role === "admin"
                      ? "Super Admin"
                      : "Student"
                  }`}
            </button>
          </form>

          {/* Institutional disclaimer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>DeScience Open Source Club</span>
            <span>Secure Role-Based Session</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center text-xs text-slate-500">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/dos-club-logo.png" alt="DOS Club" className="h-4 w-4 rounded-full" />
            <span>DeScience Open Source Club • Operating Platform</span>
          </div>
          <span>Tamil Nadu Partner Campuses & Global Network</span>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center font-mono text-xs">LOADING_TERMINAL...</div>}>
      <LoginContent />
    </Suspense>
  );
}
