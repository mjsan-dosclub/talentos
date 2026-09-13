"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AuthMode = "cohort_member" | "recruiter";

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>("cohort_member");
  const [dosId, setDosId] = useState("");
  const [passkey, setPasskey] = useState("");
  const [recruiterKey, setRecruiterKey] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (authMode === "cohort_member") {
      if (!dosId.trim()) {
        setStatusMessage("ERR_MISSING_ID // ENTER REGISTERED DOS_ID");
        return;
      }
      if (!passkey.trim()) {
        setStatusMessage("ERR_MISSING_KEY // ENTER SESSION OR MEMBER PASSKEY");
        return;
      }
    } else {
      if (!recruiterKey.trim()) {
        setStatusMessage("ERR_MISSING_KEY // ENTER RECRUITER CLEARANCE TOKEN");
        return;
      }
    }

    setIsAuthenticating(true);

    // Institutional terminal delay simulation for state-based auth
    setTimeout(() => {
      setIsAuthenticating(false);
      const targetId = authMode === "cohort_member" ? dosId.trim().toUpperCase() : "AUDIT-VIEW";
      router.push(`/ledger/${encodeURIComponent(targetId)}`);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#0A0D12] text-neutral-200 font-sans selection:bg-neutral-800 selection:text-neutral-100 flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="border-b border-neutral-800/80 bg-[#0A0D12]/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-mono text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <span className="text-neutral-600">&larr;</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="tracking-wider uppercase font-medium">DOS CLUB // TALENT_OS</span>
          </Link>

          <div className="font-mono text-[11px] text-neutral-500 tracking-wider hidden sm:block">
            AUTH_GATE: STRICT • COHORT: B3_2026
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col justify-center">
        <div className="border border-neutral-800 bg-[#0C1017]/70 p-6 sm:p-10 flex flex-col gap-8">
          {/* Header Tag */}
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-neutral-800 bg-neutral-900/60 font-mono text-[10px] sm:text-xs text-neutral-400 tracking-widest uppercase self-start">
              RESTRICTED ENTRY // CLEARANCE REQUIRED
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-100">
              Institutional Terminal
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Authenticate via registered cohort identifier or authorized recruiter audit key to inspect longitudinal production records.
            </p>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-2 border border-neutral-800 bg-[#0A0D12] text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                setAuthMode("cohort_member");
                setStatusMessage(null);
              }}
              className={`py-2.5 px-3 tracking-wider text-center transition-colors ${
                authMode === "cohort_member"
                  ? "bg-neutral-800 text-neutral-100 font-medium"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              COHORT MEMBER
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("recruiter");
                setStatusMessage(null);
              }}
              className={`py-2.5 px-3 tracking-wider text-center transition-colors border-l border-neutral-800 ${
                authMode === "recruiter"
                  ? "bg-neutral-800 text-neutral-100 font-medium"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              RECRUITER / AUDIT
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuthenticate} className="flex flex-col gap-5">
            {authMode === "cohort_member" ? (
              <>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="dos-id"
                    className="font-mono text-[11px] uppercase tracking-wider text-neutral-400"
                  >
                    COHORT IDENTIFIER (DOS_ID)
                  </label>
                  <div className="flex items-center border border-neutral-800 bg-[#0A0D12] focus-within:border-neutral-600 transition-colors">
                    <span className="pl-3.5 text-neutral-600 font-mono text-xs select-none">&gt;</span>
                    <input
                      id="dos-id"
                      type="text"
                      value={dosId}
                      onChange={(e) => setDosId(e.target.value)}
                      placeholder="E.G. DOS-2026-B3-042"
                      spellCheck={false}
                      autoComplete="off"
                      className="w-full bg-transparent px-3 py-2.5 font-mono text-xs text-neutral-100 placeholder:text-neutral-700 uppercase tracking-wider focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="passkey"
                    className="font-mono text-[11px] uppercase tracking-wider text-neutral-400"
                  >
                    SECURITY PASSKEY / TOKEN
                  </label>
                  <div className="flex items-center border border-neutral-800 bg-[#0A0D12] focus-within:border-neutral-600 transition-colors">
                    <span className="pl-3.5 text-neutral-600 font-mono text-xs select-none">#</span>
                    <input
                      id="passkey"
                      type="password"
                      value={passkey}
                      onChange={(e) => setPasskey(e.target.value)}
                      placeholder="••••••••••••••••"
                      autoComplete="current-password"
                      className="w-full bg-transparent px-3 py-2.5 font-mono text-xs text-neutral-100 placeholder:text-neutral-700 tracking-wider focus:outline-none"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="recruiter-key"
                  className="font-mono text-[11px] uppercase tracking-wider text-neutral-400"
                >
                  RECRUITER / INSTITUTIONAL AUDIT KEY
                </label>
                <div className="flex items-center border border-neutral-800 bg-[#0A0D12] focus-within:border-neutral-600 transition-colors">
                  <span className="pl-3.5 text-neutral-600 font-mono text-xs select-none">&gt;</span>
                  <input
                    id="recruiter-key"
                    type="text"
                    value={recruiterKey}
                    onChange={(e) => setRecruiterKey(e.target.value)}
                    placeholder="ENTER INSTITUTIONAL LEDGER KEY"
                    spellCheck={false}
                    autoComplete="off"
                    className="w-full bg-transparent px-3 py-2.5 font-mono text-xs text-neutral-100 placeholder:text-neutral-700 uppercase tracking-wider focus:outline-none"
                  />
                </div>
              </div>
            )}

            {statusMessage && (
              <div className="p-3 border border-amber-900/50 bg-amber-950/20 text-amber-400 font-mono text-xs tracking-wider">
                {statusMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="mt-2 w-full font-mono text-xs tracking-wider uppercase py-3 bg-neutral-200 text-neutral-950 hover:bg-white transition-colors duration-150 font-medium disabled:opacity-50"
            >
              {isAuthenticating ? "AUTHENTICATING // CHECKING LEDGER..." : "AUTHENTICATE & ACCESS LEDGER"}
            </button>
          </form>

          {/* Institutional disclaimer */}
          <div className="pt-4 border-t border-neutral-800/80 flex flex-col gap-1.5">
            <p className="font-mono text-[11px] text-neutral-500 leading-normal">
              Notice: All access attempts are recorded to immutable audit journals. Unregistered keys will be flagged.
            </p>
            <p className="font-mono text-[10px] text-neutral-600">
              INDEPENDENT AUDIT TRAIL • ZERO COMPOSITE SCORES
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center font-mono text-[11px] text-neutral-500 tracking-wider">
          DESCIENCE OPEN SOURCE CLUB • SINGAPORE // CHENNAI • TALENT_OS V1
        </div>
      </footer>
    </div>
  );
}
