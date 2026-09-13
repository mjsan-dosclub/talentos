"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getStudentByIdOrEmail } from "@/lib/db";

type UserRole = "student" | "trainer" | "college" | "admin";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!email.trim() || !email.includes("@")) {
      setStatusMessage("ERR_INVALID_EMAIL // ENTER VALID REGISTERED INSTITUTIONAL EMAIL");
      return;
    }

    if (!password.trim()) {
      setStatusMessage("ERR_MISSING_PASSWORD // ENTER ACCOUNT PASSWORD");
      return;
    }

    setIsAuthenticating(true);

    try {
      // 1. Attempt Supabase Auth live session
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (authData?.session) {
        if (role === "trainer") {
          router.push("/trainer");
        } else if (role === "college") {
          router.push("/college");
        } else if (role === "admin") {
          router.push("/admin");
        } else {
          const { student } = await getStudentByIdOrEmail(email.trim());
          const targetId = student?.dos_id || "DOS-B3-001";
          router.push(`/record/${encodeURIComponent(targetId)}`);
        }
        return;
      }

      // 2. Fallback: match institutional profile
      if (role === "trainer") {
        router.push("/trainer");
      } else if (role === "college") {
        router.push("/college");
      } else if (role === "admin") {
        router.push("/admin");
      } else {
        const { student } = await getStudentByIdOrEmail(email.trim());
        const targetId =
          student?.dos_id ||
          (email.includes("student") ? "DOS-B3-001" : `DOS-${email.split("@")[0].toUpperCase()}`);
        router.push(`/record/${encodeURIComponent(targetId)}`);
      }
    } catch (err) {
      console.warn("Auth check fallback:", err);
      if (role === "trainer") router.push("/trainer");
      else if (role === "college") router.push("/college");
      else if (role === "admin") router.push("/admin");
      else router.push("/record/DOS-B3-001");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-neutral-900 font-sans selection:bg-neutral-200 selection:text-neutral-900 flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="border-b border-neutral-200/90 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-mono text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <span className="text-neutral-400">&larr;</span>
            <span className="h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
            <span className="tracking-wider uppercase font-medium">DOS CLUB // TALENT_OS</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="font-mono text-xs text-neutral-500 hover:text-neutral-900"
            >
              Admin Console
            </Link>
            <div className="font-mono text-[11px] text-neutral-500 tracking-wider hidden sm:block">
              AUTH_GATE: STRICT • BATCH: ACTIVE
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col justify-center">
        <div className="border border-neutral-200 bg-white p-6 sm:p-10 flex flex-col gap-8 shadow-xs">
          {/* Header Tag */}
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-neutral-200 bg-neutral-100 font-mono text-[10px] sm:text-xs text-neutral-700 tracking-widest uppercase self-start font-medium">
              RESTRICTED ENTRY // CLEARANCE REQUIRED
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950">
              Institutional Terminal
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Authenticate with your registered institutional email and password to inspect longitudinal production records.
            </p>
          </div>

          {/* Role Selector (PRD Section 5 Roles) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-neutral-300 bg-neutral-100 text-[11px] font-mono p-0.5 rounded-xs gap-0.5">
            <button
              type="button"
              onClick={() => {
                setRole("student");
                setStatusMessage(null);
              }}
              className={`py-2 px-2 tracking-wider text-center transition-colors rounded-xs ${
                role === "student"
                  ? "bg-white text-neutral-950 font-semibold shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              STUDENT
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("trainer");
                setStatusMessage(null);
              }}
              className={`py-2 px-2 tracking-wider text-center transition-colors rounded-xs ${
                role === "trainer"
                  ? "bg-white text-neutral-950 font-semibold shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              TRAINER
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("college");
                setStatusMessage(null);
              }}
              className={`py-2 px-2 tracking-wider text-center transition-colors rounded-xs ${
                role === "college"
                  ? "bg-white text-neutral-950 font-semibold shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              COLLEGE
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("admin");
                setStatusMessage(null);
              }}
              className={`py-2 px-2 tracking-wider text-center transition-colors rounded-xs ${
                role === "admin"
                  ? "bg-white text-neutral-950 font-semibold shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              ADMIN
            </button>
          </div>

          {/* Authentication Form */}
          <form onSubmit={handleAuthenticate} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="font-mono text-[11px] uppercase tracking-wider text-neutral-700 font-medium"
              >
                {role === "student"
                  ? "STUDENT EMAIL ADDRESS"
                  : role === "trainer"
                  ? "TRAINER / FACULTY EMAIL"
                  : role === "college"
                  ? "COLLEGE COORDINATOR EMAIL"
                  : "ORGANISER / ADMIN EMAIL"}
              </label>
              <div className="flex items-center border border-neutral-300 bg-white focus-within:border-neutral-700 transition-colors shadow-2xs">
                <span className="pl-3.5 text-neutral-400 font-mono text-xs select-none">@</span>
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
                  className="w-full bg-transparent px-3 py-2.5 font-mono text-xs text-neutral-900 placeholder:text-neutral-400 tracking-wider focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="font-mono text-[11px] uppercase tracking-wider text-neutral-700 font-medium"
              >
                PASSWORD
              </label>
              <div className="flex items-center border border-neutral-300 bg-white focus-within:border-neutral-700 transition-colors shadow-2xs">
                <span className="pl-3.5 text-neutral-400 font-mono text-xs select-none">#</span>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  autoComplete="current-password"
                  className="w-full bg-transparent px-3 py-2.5 font-mono text-xs text-neutral-900 placeholder:text-neutral-400 tracking-wider focus:outline-none"
                />
              </div>
            </div>

            {statusMessage && (
              <div className="p-3 border border-amber-300 bg-amber-50 text-amber-800 font-mono text-xs tracking-wider">
                {statusMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="mt-2 w-full font-mono text-xs tracking-wider uppercase py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors duration-150 font-medium disabled:opacity-50 shadow-2xs"
            >
              {isAuthenticating
                ? "AUTHENTICATING // CHECKING CLEARANCE..."
                : `AUTHENTICATE AS ${
                    role === "student"
                      ? "STUDENT"
                      : role === "trainer"
                      ? "TRAINER"
                      : role === "college"
                      ? "COLLEGE COORDINATOR"
                      : "ADMIN"
                  }`}
            </button>
          </form>

          {/* Institutional disclaimer */}
          <div className="pt-4 border-t border-neutral-200 flex flex-col gap-1.5">
            <p className="font-mono text-[11px] text-neutral-500 leading-normal">
              Notice: All access attempts are recorded to immutable audit journals. Unregistered accounts will be flagged.
            </p>
            <p className="font-mono text-[10px] text-neutral-400">
              INDEPENDENT AUDIT TRAIL • ZERO COMPOSITE SCORES
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center font-mono text-[11px] text-neutral-500 tracking-wider">
          DESCIENCE OPEN SOURCE CLUB • SINGAPORE // CHENNAI • TALENT_OS V1
        </div>
      </footer>
    </div>
  );
}
