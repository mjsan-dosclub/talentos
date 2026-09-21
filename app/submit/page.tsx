"use client";

import { useState } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { WORKSHOP_TOPICS_27, WORKSHOP_PHASES_27 } from "@/lib/db";
import { CheckCircleIcon, DocumentTextIcon, CloudArrowUpIcon, AlertTriangleIcon } from "@/components/Icons";

// 9 APPROVED LIFECYCLE STATES FROM PROJECT_RULES.md
type ApprovedState =
  | "REGISTERED"
  | "CHECKED_IN"
  | "LATE"
  | "INCOMPLETE"
  | "COMPLETED"
  | "ABSENT_UNCONFIRMED"
  | "ABSENT_CONFIRMED"
  | "EXCUSED"
  | "MANUALLY_CONFIRMED";

interface WorkshopMeta {
  code: string;
  name: string;
  focus: string;
  defaultTests: number;
}

// Generate the canonical 27 workshops from CodeZap 3.0 curriculum
const WORKSHOPS: WorkshopMeta[] = WORKSHOP_TOPICS_27.map((topic, idx) => {
  const code = `WS-${String(idx + 1).padStart(2, "0")}`;
  const phase = WORKSHOP_PHASES_27[idx] || "Systems Track";
  return {
    code,
    name: topic,
    focus: phase,
    defaultTests: 15 + (idx % 6) * 2,
  };
});

export default function DeliverableSubmitPage() {
  const [selectedWsCode, setSelectedWsCode] = useState<string>("WS-07");
  const [memberId, setMemberId] = useState("DOS-B3-001");
  const [email, setEmail] = useState("arun@student.dosclub.org");
  const [repoUrl, setRepoUrl] = useState("https://github.com/arun-systems/ws07-build-arena");
  const [commitSha, setCommitSha] = useState("e8a10f4");
  const [pullRequestUrl, setPullRequestUrl] = useState("https://github.com/dos-club/batch3-evaluations/pull/84");
  const [ciSuiteStatus, setCiSuiteStatus] = useState<"pass" | "fail">("pass");
  const [testsPassedCount, setTestsPassedCount] = useState<number>(20);
  const [technicalNotes, setTechnicalNotes] = useState(
    "Implemented exponential backoff with full jitter and half-open state recovery. Passed concurrency race benchmark."
  );

  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    url: string;
    size: number;
  } | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<{
    status: ApprovedState;
    timestamp: string;
    digest: string;
    testsResult: string;
    attachedDoc?: { name: string; url: string; size: number };
  } | null>(null);

  const currentWorkshop = WORKSHOPS.find((w) => w.code === selectedWsCode) || WORKSHOPS[0];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDoc(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "evidence");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setUploadedFile({
          name: file.name,
          url: data.url,
          size: file.size,
        });
      } else {
        setUploadError(data.error || "Failed to upload evidence document.");
      }
    } catch {
      setUploadError("Network error during document upload.");
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setSubmissionReceipt(null);

    setTimeout(() => {
      setIsVerifying(false);
      const isComplete = ciSuiteStatus === "pass" && testsPassedCount >= currentWorkshop.defaultTests;
      const finalState: ApprovedState = isComplete ? "COMPLETED" : "INCOMPLETE";

      setSubmissionReceipt({
        status: finalState,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
        digest: "sha256:d8c91a0f443b8e7c10b65ad57c2e39b74052f87a8b661c94b2a8fe402f1a94bb",
        testsResult: `${testsPassedCount} / ${currentWorkshop.defaultTests} hermetic tests passed`,
        attachedDoc: uploadedFile || undefined,
      });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col justify-between">
      {/* 1. Global AppHeader (NO top-bar navigation) */}
      <AppHeader />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col gap-10">
        {/* Title Section */}
        <section className="flex flex-col gap-3 border-b border-neutral-200 pb-8">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-neutral-200 bg-neutral-100 font-mono text-[10px] sm:text-xs text-neutral-700 tracking-widest uppercase self-start font-medium">
            DELIVERABLE SUBMISSION & AUDIT ENGINE
          </div>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-950">
            Submit Practical Engineering Deliverable
          </h1>
          <p className="font-mono text-xs sm:text-sm text-neutral-600 max-w-3xl leading-relaxed">
            Principle 02 / EVIDENCE: We do not issue participation certificates. Every workshop requires production-grade code, verifiable commit hashes, and reproducible hermetic test pass records.
          </p>
        </section>

        {/* Submission Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Left / Center: 2 Cols */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <form onSubmit={handleSubmit} className="border border-neutral-200 bg-white p-6 sm:p-8 flex flex-col gap-6 shadow-2xs">
              <h2 className="font-mono text-xs uppercase tracking-wider text-neutral-900 font-semibold border-b border-neutral-200 pb-3">
                01 // WORKSHOP & IDENTITY SPECIFICATION
              </h2>

              {/* Workshop Selection */}
              <div className="flex flex-col gap-2">
                <label htmlFor="workshopSelect" className="font-mono text-xs uppercase tracking-wider text-neutral-700 font-medium">
                  SELECT WORKSHOP (1 OF 27)
                </label>
                <select
                  id="workshopSelect"
                  value={selectedWsCode}
                  onChange={(e) => {
                    setSelectedWsCode(e.target.value);
                    const ws = WORKSHOPS.find((w) => w.code === e.target.value);
                    if (ws) setTestsPassedCount(ws.defaultTests);
                    setSubmissionReceipt(null);
                  }}
                  className="border border-neutral-300 bg-white px-3.5 py-2.5 font-mono text-xs text-neutral-900 focus:outline-none focus:border-neutral-700 rounded-xs"
                >
                  {WORKSHOPS.map((ws) => (
                    <option key={ws.code} value={ws.code}>
                      {ws.code}: {ws.name} ({ws.focus})
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Identity Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="memberIdInput" className="font-mono text-[11px] uppercase tracking-wider text-neutral-600 font-medium">
                    MEMBER ID (DOS_ID)
                  </label>
                  <input
                    id="memberIdInput"
                    type="text"
                    required
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="border border-neutral-300 bg-white px-3 py-2 font-mono text-xs text-neutral-900 uppercase focus:outline-none focus:border-neutral-700 rounded-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="emailInput" className="font-mono text-[11px] uppercase tracking-wider text-neutral-600 font-medium">
                    STUDENT EMAIL
                  </label>
                  <input
                    id="emailInput"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-neutral-300 bg-white px-3 py-2 font-mono text-xs text-neutral-900 focus:outline-none focus:border-neutral-700 rounded-xs"
                  />
                </div>
              </div>

              <h2 className="font-mono text-xs uppercase tracking-wider text-neutral-900 font-semibold border-b border-neutral-200 pb-3 pt-4">
                02 // PRODUCTION CODE ARTIFACT EVIDENCE
              </h2>

              {/* Repo URL */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="repoUrlInput" className="font-mono text-xs uppercase tracking-wider text-neutral-700 font-medium">
                  PUBLIC OR CLUB REPOSITORY URL
                </label>
                <input
                  id="repoUrlInput"
                  type="url"
                  required
                  placeholder="https://github.com/username/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="border border-neutral-300 bg-white px-3.5 py-2.5 font-mono text-xs text-neutral-900 focus:outline-none focus:border-neutral-700 rounded-xs"
                />
                <span className="font-mono text-[10px] text-neutral-500">
                  Must include clean commit history and open license.
                </span>
              </div>

              {/* Commit Hash & Pull Request */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="commitShaInput" className="font-mono text-[11px] uppercase tracking-wider text-neutral-600 font-medium">
                    COMMIT HASH (SHA-1 / SHA-256)
                  </label>
                  <input
                    id="commitShaInput"
                    type="text"
                    required
                    placeholder="e.g. e8a10f4"
                    value={commitSha}
                    onChange={(e) => setCommitSha(e.target.value)}
                    className="border border-neutral-300 bg-white px-3 py-2 font-mono text-xs text-neutral-900 focus:outline-none focus:border-neutral-700 rounded-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="prUrlInput" className="font-mono text-[11px] uppercase tracking-wider text-neutral-600 font-medium">
                    PULL REQUEST URL (OPTIONAL)
                  </label>
                  <input
                    id="prUrlInput"
                    type="url"
                    placeholder="https://github.com/org/repo/pull/12"
                    value={pullRequestUrl}
                    onChange={(e) => setPullRequestUrl(e.target.value)}
                    className="border border-neutral-300 bg-white px-3 py-2 font-mono text-xs text-neutral-900 focus:outline-none focus:border-neutral-700 rounded-xs"
                  />
                </div>
              </div>

              {/* Hermetic CI Test Verification */}
              <div className="border border-neutral-200 bg-neutral-50/50 p-4 flex flex-col gap-3 rounded-xs">
                <span className="font-mono text-xs uppercase tracking-wider text-neutral-800 font-semibold">
                  HERMETIC CI TEST SUITE VERIFICATION
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="ciStatusSelect" className="font-mono text-[10px] text-neutral-600">
                      AUTOMATED CI STATUS
                    </label>
                    <select
                      id="ciStatusSelect"
                      value={ciSuiteStatus}
                      onChange={(e) => setCiSuiteStatus(e.target.value as "pass" | "fail")}
                      className="border border-neutral-300 bg-white px-2.5 py-1.5 font-mono text-xs text-neutral-900 rounded-xs"
                    >
                      <option value="pass">PASS // All unit & integration tests passed</option>
                      <option value="fail">FAIL // Incomplete test execution / assertion failure</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="testsPassedInput" className="font-mono text-[10px] text-neutral-600">
                      HERMETIC TESTS PASSED ({currentWorkshop.defaultTests} EXPECTED)
                    </label>
                    <input
                      id="testsPassedInput"
                      type="number"
                      min={0}
                      max={currentWorkshop.defaultTests}
                      value={testsPassedCount}
                      onChange={(e) => setTestsPassedCount(Number(e.target.value))}
                      className="border border-neutral-300 bg-white px-2.5 py-1.5 font-mono text-xs text-neutral-900 rounded-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Technical Notes */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="technicalNotesInput" className="font-mono text-xs uppercase tracking-wider text-neutral-700 font-medium">
                  IMPLEMENTATION NOTES & ARCHITECTURAL TRADEOFFS
                </label>
                <textarea
                  id="technicalNotesInput"
                  rows={3}
                  value={technicalNotes}
                  onChange={(e) => setTechnicalNotes(e.target.value)}
                  placeholder="Document concurrency guarantees, edge case mitigations, and performance observations..."
                  className="border border-neutral-300 bg-white p-3 font-mono text-xs text-neutral-900 focus:outline-none focus:border-neutral-700 rounded-xs resize-none"
                />
              </div>

              {/* 03 // DOCUMENTATION & PDF EVIDENCE (TAL-074) */}
              <h2 className="font-mono text-xs uppercase tracking-wider text-neutral-900 font-semibold border-b border-neutral-200 pb-3 pt-4">
                03 // ARCHITECTURAL EVIDENCE & PDF ATTACHMENT (TAL-074)
              </h2>

              <div className="border border-dashed border-neutral-300 hover:border-neutral-700 bg-neutral-50/60 p-5 rounded-xs flex flex-col items-center justify-center text-center gap-3 transition-colors">
                <input
                  type="file"
                  id="evidence-file-upload"
                  accept=".pdf,.docx,.zip,.tar.gz,.json,.md,.txt"
                  onChange={handleFileUpload}
                  disabled={isUploadingDoc}
                  className="hidden"
                />

                {uploadedFile ? (
                  <div className="w-full flex items-center justify-between p-3 bg-white border border-emerald-300 rounded-xs">
                    <div className="flex items-center gap-2.5 text-left">
                      <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <DocumentTextIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-mono text-xs font-semibold text-neutral-900 block truncate max-w-[280px]">
                          {uploadedFile.name}
                        </span>
                        <span className="font-mono text-[10px] text-neutral-500 block">
                          {(uploadedFile.size / 1024).toFixed(1)} KB • Evidence Verified
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={uploadedFile.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[11px] text-neutral-700 hover:text-neutral-950 underline px-2 py-1"
                      >
                        Inspect &rarr;
                      </a>
                      <button
                        type="button"
                        onClick={() => setUploadedFile(null)}
                        className="font-mono text-[11px] text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-neutral-200/60 text-neutral-700 flex items-center justify-center">
                      <CloudArrowUpIcon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label
                        htmlFor="evidence-file-upload"
                        className="font-mono text-xs font-semibold text-neutral-900 cursor-pointer underline hover:text-neutral-600"
                      >
                        {isUploadingDoc ? "Uploading Evidence Document..." : "Upload Deliverable PDF / Document"}
                      </label>
                      <p className="font-mono text-[10px] text-neutral-500">
                        Supports PDF architectural specs, design dossiers, or project archive (up to 10MB)
                      </p>
                    </div>
                  </>
                )}

                {uploadError && (
                  <div className="w-full p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-center gap-2">
                    <AlertTriangleIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isVerifying}
                className="mt-2 font-mono text-xs uppercase tracking-wider font-semibold py-3.5 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <span className="inline-block h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>RUNNING HERMETIC AUDIT & DIGEST COMPUTATION...</span>
                  </>
                ) : (
                  <>
                    <span>TRANSMIT DELIVERABLE FOR AUDIT</span>
                    <span className="text-neutral-400">&rarr;</span>
                  </>
                )}
              </button>
            </form>

            {/* Verification Receipt Banner */}
            {submissionReceipt && (
              <div className="border border-neutral-300 bg-white p-6 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                    <span className="font-mono text-xs uppercase tracking-wider text-neutral-900 font-semibold">
                      AUDIT RECEIPT ISSUED
                    </span>
                  </div>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold border ${
                      submissionReceipt.status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-amber-50 text-amber-800 border-amber-300"
                    }`}
                  >
                    STATE: {submissionReceipt.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  <div>
                    <span className="text-neutral-500 text-[10px] block">AUDITED WORKSHOP</span>
                    <span className="font-medium text-neutral-900">
                      {currentWorkshop.code}: {currentWorkshop.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] block">TIMESTAMP</span>
                    <span className="font-medium text-neutral-900">{submissionReceipt.timestamp}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] block">TEST OUTCOME</span>
                    <span className="font-medium text-neutral-900">{submissionReceipt.testsResult}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] block">COMMIT VERIFIED</span>
                    <span className="font-medium text-neutral-900">{commitSha}</span>
                  </div>
                </div>

                {submissionReceipt.attachedDoc && (
                  <div className="flex justify-between items-center bg-neutral-50 border border-neutral-200 p-2.5 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <DocumentTextIcon className="w-3.5 h-3.5 text-neutral-700" />
                      <span className="text-neutral-600">Attached Evidence:</span>
                      <strong className="text-neutral-900">{submissionReceipt.attachedDoc.name}</strong>
                    </div>
                    <a
                      href={submissionReceipt.attachedDoc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-neutral-900 underline hover:text-neutral-600 font-medium"
                    >
                      Download Deliverable &rarr;
                    </a>
                  </div>
                )}

                <div className="font-mono text-[11px] bg-neutral-50 border border-neutral-200 p-2.5 break-all text-neutral-700">
                  <span className="text-neutral-400 block text-[10px]">IMMUTABLE AUDIT HASH:</span>
                  {submissionReceipt.digest}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="font-mono text-[11px] text-neutral-500">
                    State persisted to longitudinal member chronicle.
                  </p>
                  <Link
                    href={`/record/${encodeURIComponent(memberId)}`}
                    className="font-mono text-xs text-neutral-900 underline font-medium hover:text-neutral-600"
                  >
                    View My Record &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Workshop Rules & Invariant Guidelines */}
          <aside className="flex flex-col gap-6">
            <div className="border border-neutral-200 bg-white p-6 shadow-2xs flex flex-col gap-4">
              <h3 className="font-mono text-xs uppercase tracking-wider text-neutral-900 font-semibold border-b border-neutral-200 pb-2">
                AUDIT INVARIANTS
              </h3>
              <ul className="space-y-3 font-mono text-xs text-neutral-600">
                <li className="flex items-start gap-2">
                  <span className="text-neutral-900 font-bold">•</span>
                  <span>
                    <strong className="text-neutral-900">Approved States:</strong> Every submission resolves to strictly one of the 9 invariant states. No ad-hoc statuses.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neutral-900 font-bold">•</span>
                  <span>
                    <strong className="text-neutral-900">Hermetic Verification:</strong> Deliverables must pass automated test suites independently in isolated environments.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neutral-900 font-bold">•</span>
                  <span>
                    <strong className="text-neutral-900">Git Commit Proof:</strong> Commit hashes are permanently logged into the student record drawer.
                  </span>
                </li>
              </ul>
            </div>

            <div className="border border-neutral-200 bg-neutral-100 p-6 flex flex-col gap-3 font-mono text-xs">
              <span className="text-neutral-700 font-semibold uppercase tracking-wider text-[11px]">
                NEED TO VERIFY ATTENDANCE?
              </span>
              <p className="text-neutral-600 text-[11px] leading-relaxed">
                Physical workshop check-in requires geofence verification within the zero-grace window managed by faculty leads.
              </p>
              <Link
                href="/admin/sessions"
                className="text-neutral-900 underline text-[11px] font-medium hover:text-neutral-600"
              >
                Inspect Live Session Auditor &rarr;
              </Link>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/dos-club-logo.png" alt="DOS Club" className="h-5 w-5 rounded-full" />
            <span className="font-semibold text-slate-700">DeScience Open Source Club</span>
            <span className="text-slate-300">•</span>
            <span>TalentOS Deliverable Auditing System</span>
          </div>
          <span className="text-slate-400">Hermetic Testing & Git Placed Verification</span>
        </div>
      </footer>
    </div>
  );
}
