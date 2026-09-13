"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UserRole = "member" | "recruiter";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("member");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAuthenticate = (e: React.FormEvent) => {
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

    // State-based institutional authentication simulation
    setTimeout(() => {
      setIsAuthenticating(false);
      // Derive clean identifier for the record (e.g. username part of email or formatted DOS_ID)
      const sanitizedId = email.split("@")[0].toUpperCase();
      const targetId = role === "member" ? `DOS-${sanitizedId}` : "AUDIT-VIEW";
      router.push(`/record/${encodeURIComponent(targetId)}`);
    }, 400);
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

          {/* Role Selector */}
          <div className="grid grid-cols-2 border border-neutral-300 bg-neutral-100 text-xs font-mono p-0.5 rounded-xs">
            <button
              type="button"
              onClick={() => {
                setRole("member");
                setStatusMessage(null);
              }}
              className={`py-2 px-3 tracking-wider text-center transition-colors rounded-xs ${
                role === "member"
                  ? "bg-white text-neutral-950 font-semibold shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              MEMBER
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("recruiter");
                setStatusMessage(null);
              }}
              className={`py-2 px-3 tracking-wider text-center transition-colors rounded-xs ${
                role === "recruiter"
                  ? "bg-white text-neutral-950 font-semibold shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              RECRUITER / AUDIT
            </button>
          </div>

          {/* Authentication Form */}
          <form onSubmit={handleAuthenticate} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="font-mono text-[11px] uppercase tracking-wider text-neutral-700 font-medium"
              >
                {role === "member" ? "MEMBER EMAIL ADDRESS" : "RECRUITER / AUDIT EMAIL"}
              </label>
              <div className="flex items-center border border-neutral-300 bg-white focus-within:border-neutral-700 transition-colors shadow-2xs">
                <span className="pl-3.5 text-neutral-400 font-mono text-xs select-none">@</span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "member" ? "student@dosclub.org" : "recruiter@enterprise.com"}
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
                ? "AUTHENTICATING // CHECKING RECORD..."
                : `AUTHENTICATE AS ${role === "member" ? "MEMBER" : "RECRUITER"}`}
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
