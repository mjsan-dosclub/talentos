"use client";

import { useState } from "react";
import Link from "next/link";

interface CandidateAuditSummary {
  id: string;
  fullName: string;
  email: string;
  institution: string;
  region: string;
  batch: string;
  githubHandle: string;
  completedCount: number;
  totalWorkshops: number;
  verifiedCompetencies: string[];
  recentCommitSha: string;
  auditHash: string;
}

const CANDIDATES: CandidateAuditSummary[] = [
  {
    id: "DOS-B3-001",
    fullName: "Arunachalam Sundaram",
    email: "arun@student.dosclub.org",
    institution: "Anna University, Chennai",
    region: "Chennai / Tamil Nadu",
    batch: "Batch 3",
    githubHandle: "arun-systems",
    completedCount: 14,
    totalWorkshops: 27,
    verifiedCompetencies: [
      "WS-01: Linux Syscalls",
      "WS-08: LSM-Tree Engines",
      "WS-11: Raft Consensus",
      "WS-14: Circuit Breakers",
    ],
    recentCommitSha: "e8a10f4",
    auditHash: "sha256:d8c91a0f443b8e7c10b65ad57c2e39b74052f87a8b661c94b2a8fe402f1a94bb",
  },
  {
    id: "DOS-B3-002",
    fullName: "Kavitha Raman",
    email: "kavitha@student.dosclub.org",
    institution: "PSG College of Technology, Coimbatore",
    region: "Coimbatore / Tamil Nadu",
    batch: "Batch 3",
    githubHandle: "kavitha-k",
    completedCount: 14,
    totalWorkshops: 27,
    verifiedCompetencies: [
      "WS-02: POSIX Race Conditions",
      "WS-09: B-Tree Indexing & WAL",
      "WS-12: Vector Clocks",
      "WS-14: Resiliency Suite",
    ],
    recentCommitSha: "90b4d11",
    auditHash: "sha256:2fa8d7120e3bc481a8b199cd680a71168ef9798031e479a0bcf423c108db3ef0",
  },
  {
    id: "DOS-B3-003",
    fullName: "Dinesh Kumar V.",
    email: "dinesh@student.dosclub.org",
    institution: "NIT Trichy",
    region: "Trichy / Tamil Nadu",
    batch: "Batch 3",
    githubHandle: "dinesh-v",
    completedCount: 13,
    totalWorkshops: 27,
    verifiedCompetencies: [
      "WS-04: Network epoll Loops",
      "WS-07: gRPC Streaming",
      "WS-10: Query Planners",
      "WS-14: Breaker Patterns",
    ],
    recentCommitSha: "5f3a802",
    auditHash: "sha256:56b82cf74911d94f27d42ea952ca718b57703554160a2b535d57b01d36d4ab37",
  },
  {
    id: "DOS-B3-004",
    fullName: "Meera Subramanian",
    email: "meera@student.dosclub.org",
    institution: "IIT Madras Research Park",
    region: "Chennai / Tamil Nadu",
    batch: "Batch 3",
    githubHandle: "meera-sub",
    completedCount: 14,
    totalWorkshops: 27,
    verifiedCompetencies: [
      "WS-03: Virtual Memory & Pages",
      "WS-08: LSM-Tree Engines",
      "WS-11: Raft Consensus",
      "WS-14: Circuit Breakers",
    ],
    recentCommitSha: "7b4c9e3",
    auditHash: "sha256:94dfb119a008c2a8bb54407880e64c3c3a9f1430030113886f4a86b7617b01dd",
  },
  {
    id: "DOS-B3-005",
    fullName: "Siddharth Rajan",
    email: "siddharth@student.dosclub.org",
    institution: "Thiagarajar College of Engineering, Madurai",
    region: "Madurai / Tamil Nadu",
    batch: "Batch 3",
    githubHandle: "sid-rajan",
    completedCount: 12,
    totalWorkshops: 27,
    verifiedCompetencies: [
      "WS-01: Linux Syscalls",
      "WS-04: Network epoll Loops",
      "WS-09: B-Tree Indexing",
      "WS-13: Paxos Quorums",
    ],
    recentCommitSha: "2c890ab",
    auditHash: "sha256:12e75cb799bc9067b84aa4012ceefb65bfa780d6b527ce3334237937da9170e9",
  },
];

const COMPETENCY_FILTERS = [
  "ALL COMPETENCIES",
  "WS-01: Linux Syscalls",
  "WS-08: LSM-Tree Engines",
  "WS-09: B-Tree Indexing",
  "WS-11: Raft Consensus",
  "WS-14: Circuit Breakers",
];

export default function RecruiterTalentPage() {
  const [candidates] = useState<CandidateAuditSummary[]>(CANDIDATES);
  const [selectedBatch, setSelectedBatch] = useState<string>("ALL");
  const [selectedCompetency, setSelectedCompetency] = useState<string>("ALL COMPETENCIES");
  const [searchQuery, setSearchQuery] = useState("");
  const [minCompleted, setMinCompleted] = useState<number>(0);
  const [copiedDossierId, setCopiedDossierId] = useState<string | null>(null);

  const filteredCandidates = candidates.filter((c) => {
    const matchesBatch = selectedBatch === "ALL" || c.batch === selectedBatch;
    const matchesCompetency =
      selectedCompetency === "ALL COMPETENCIES" ||
      c.verifiedCompetencies.some((comp) => comp.includes(selectedCompetency.split(":")[0]));
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.githubHandle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCompleted = c.completedCount >= minCompleted;

    return matchesBatch && matchesCompetency && matchesSearch && matchesCompleted;
  });

  const handleCopyDossier = (c: CandidateAuditSummary) => {
    const dossierText = `DOS CLUB TALENT_OS FACTUAL AUDIT DOSSIER
=========================================
MEMBER_ID: ${c.id}
NAME: ${c.fullName}
INSTITUTION: ${c.institution}
REGION: ${c.region}
BATCH: ${c.batch}
GITHUB: https://github.com/${c.githubHandle}
COMPLETED_WORKSHOPS: ${c.completedCount} / ${c.totalWorkshops}
VERIFIED_COMPETENCIES:
${c.verifiedCompetencies.map((comp) => `  - ${comp}`).join("\n")}
LATEST_COMMIT: ${c.recentCommitSha}
AUDIT_DIGEST: ${c.auditHash}
LONGITUDINAL_RECORD_URL: https://talentos.dosclub.org/record/${c.id}
ZERO_COMPOSITE_SCORES_POLICY: VERIFIED EVIDENCE ONLY
=========================================`;

    navigator.clipboard.writeText(dossierText);
    setCopiedDossierId(c.id);
    setTimeout(() => setCopiedDossierId(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-neutral-900 font-sans selection:bg-neutral-200 selection:text-neutral-900 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-neutral-200/90 bg-white/95 backdrop-blur-sm sticky top-0 z-40">
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
            <span className="font-mono text-[11px] text-neutral-700 border border-neutral-300 bg-neutral-100 px-2.5 py-1 rounded hidden sm:inline-block">
              CLEARANCE: RECRUITER / AUDIT • ZERO COMPOSITE SCORES
            </span>
            <Link
              href="/login"
              className="font-mono text-xs text-neutral-500 hover:text-neutral-900 font-medium"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col gap-10">
        {/* Title & Institutional Mandate */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-neutral-200 pb-8">
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-neutral-200 bg-neutral-100 font-mono text-[10px] sm:text-xs text-neutral-700 tracking-widest uppercase self-start font-medium">
              INSTITUTIONAL PARTNER & RECRUITER EXPLORER
            </div>
            <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-950">
              Longitudinal Talent Intelligence
            </h1>
            <p className="font-mono text-xs sm:text-sm text-neutral-600 max-w-3xl leading-relaxed">
              Principle 03 / EVOLVE: Inspect genuine engineering capability evidenced over 27 intensive workshops. We do not use arbitrary rating scores, AI badges, or weighted percentages.
            </p>
          </div>

          {/* Quick Factual Counts */}
          <div className="grid grid-cols-3 gap-3 border border-neutral-200 bg-white p-4 font-mono text-xs w-full md:w-auto shadow-2xs">
            <div className="flex flex-col">
              <span className="text-neutral-500 text-[10px]">CANDIDATES</span>
              <span className="text-base font-semibold text-neutral-900">{candidates.length}</span>
            </div>
            <div className="flex flex-col border-l border-neutral-200 pl-3">
              <span className="text-neutral-500 text-[10px]">WORKSHOPS</span>
              <span className="text-base font-semibold text-neutral-900">27</span>
            </div>
            <div className="flex flex-col border-l border-neutral-200 pl-3">
              <span className="text-neutral-500 text-[10px]">POLICY</span>
              <span className="text-base font-semibold text-emerald-700">AUDITED</span>
            </div>
          </div>
        </section>

        {/* Filter Toolbar */}
        <section className="border border-neutral-200 bg-white p-5 shadow-2xs flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
            {/* Search */}
            <div className="md:col-span-2 flex items-center border border-neutral-300 bg-white px-3 focus-within:border-neutral-700 transition-colors">
              <span className="text-neutral-400 select-none mr-2">&gt;</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH BY NAME, COLLEGE, OR DOS_ID..."
                className="w-full py-2.5 bg-transparent uppercase tracking-wider text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
              />
            </div>

            {/* Competency Filter */}
            <div>
              <select
                value={selectedCompetency}
                onChange={(e) => setSelectedCompetency(e.target.value)}
                className="w-full border border-neutral-300 bg-white py-2.5 px-3 uppercase tracking-wider text-neutral-900 focus:outline-none focus:border-neutral-700 rounded-xs"
              >
                {COMPETENCY_FILTERS.map((comp) => (
                  <option key={comp} value={comp}>
                    {comp}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Filter */}
            <div>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full border border-neutral-300 bg-white py-2.5 px-3 uppercase tracking-wider text-neutral-900 focus:outline-none focus:border-neutral-700 rounded-xs"
              >
                <option value="ALL">ALL BATCHES</option>
                <option value="Batch 3">BATCH 3 (ACTIVE)</option>
              </select>
            </div>
          </div>

          {/* Min Completed Workshops Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-neutral-200 pt-3 gap-2 font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="text-neutral-500 uppercase tracking-wider text-[11px]">
                MINIMUM COMPLETED WORKSHOPS:
              </span>
              <div className="flex items-center gap-1.5">
                {[0, 10, 12, 14].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setMinCompleted(cnt)}
                    className={`px-2.5 py-1 border text-[11px] rounded-xs transition-colors ${
                      minCompleted === cnt
                        ? "bg-neutral-900 text-white border-neutral-900 font-semibold"
                        : "bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-100"
                    }`}
                  >
                    {cnt === 0 ? "ANY" : `${cnt}+`}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-neutral-500 text-[11px]">
              MATCHING AUDITED CANDIDATES:{" "}
              <span className="font-semibold text-neutral-900">{filteredCandidates.length}</span>
            </div>
          </div>
        </section>

        {/* Candidates Roster Grid */}
        <section className="flex flex-col gap-6">
          {filteredCandidates.length === 0 ? (
            <div className="border border-neutral-200 bg-white p-12 text-center font-mono text-xs text-neutral-500">
              NO CANDIDATES MATCH THE SPECIFIED AUDIT CRITERIA.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="border border-neutral-200 bg-white p-6 shadow-2xs flex flex-col justify-between gap-5 hover:border-neutral-400 transition-colors"
                >
                  {/* Top: Name, ID, Institution */}
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="font-mono text-[10px] text-neutral-500 tracking-wider block">
                          {candidate.id} • {candidate.batch}
                        </span>
                        <h3 className="text-lg font-semibold text-neutral-950 mt-0.5">
                          {candidate.fullName}
                        </h3>
                      </div>
                      <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-neutral-100 border border-neutral-200 text-neutral-800 rounded-xs shrink-0">
                        {candidate.completedCount} / {candidate.totalWorkshops} Completed
                      </span>
                    </div>

                    <div className="font-mono text-xs text-neutral-600 flex flex-col gap-0.5">
                      <span>{candidate.institution}</span>
                      <span className="text-[11px] text-neutral-500">{candidate.region}</span>
                    </div>
                  </div>

                  {/* Middle: Audited Technical Competencies */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-neutral-200">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                      VERIFIED CURRICULUM ARTIFACTS
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {candidate.verifiedCompetencies.map((comp) => (
                        <span
                          key={comp}
                          className="font-mono text-[11px] px-2 py-0.5 bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-2xs"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom: Evidence & Deep Links */}
                  <div className="flex flex-col gap-3 pt-3 border-t border-neutral-200 font-mono text-xs">
                    <div className="flex items-center justify-between text-[11px] text-neutral-500">
                      <span>LATEST COMMIT: {candidate.recentCommitSha}</span>
                      <a
                        href={`https://github.com/${candidate.githubHandle}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-neutral-800 underline hover:text-neutral-500"
                      >
                        github/{candidate.githubHandle}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href={`/record/${encodeURIComponent(candidate.id)}`}
                        className="flex-1 text-center py-2.5 bg-neutral-900 text-white font-mono text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-neutral-800 transition-colors"
                      >
                        Inspect Full Audit Record &rarr;
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleCopyDossier(candidate)}
                        className="px-3 py-2.5 border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 font-mono text-xs uppercase tracking-wider text-neutral-700 rounded-xs transition-colors shrink-0"
                        title="Copy cryptographic candidate dossier"
                      >
                        {copiedDossierId === candidate.id ? "COPIED ✓" : "EXPORT DOSSIER"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
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
