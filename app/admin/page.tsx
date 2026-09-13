"use client";

import { useState } from "react";
import Link from "next/link";

interface Member {
  id: string;
  fullName: string;
  email: string;
  institution: string;
  githubHandle: string;
  batch: string;
  region: string;
  completedWorkshops: number;
}

// Initial Batch Roster (Production Mock)
const INITIAL_MEMBERS: Member[] = [
  {
    id: "DOS-B3-001",
    fullName: "Arunachalam Sundaram",
    email: "arun@student.dosclub.org",
    institution: "Anna University, Chennai",
    githubHandle: "arun-systems",
    batch: "Batch 3",
    region: "Chennai / Tamil Nadu",
    completedWorkshops: 14,
  },
  {
    id: "DOS-B3-002",
    fullName: "Kavitha Raman",
    email: "kavitha@student.dosclub.org",
    institution: "PSG College of Technology, Coimbatore",
    githubHandle: "kavitha-k",
    batch: "Batch 3",
    region: "Coimbatore / Tamil Nadu",
    completedWorkshops: 14,
  },
  {
    id: "DOS-B3-003",
    fullName: "Dinesh Kumar V.",
    email: "dinesh@student.dosclub.org",
    institution: "NIT Trichy",
    githubHandle: "dinesh-v",
    batch: "Batch 3",
    region: "Trichy / Tamil Nadu",
    completedWorkshops: 13,
  },
  {
    id: "DOS-B3-004",
    fullName: "Meera Subramanian",
    email: "meera@student.dosclub.org",
    institution: "IIT Madras Research Park",
    githubHandle: "meera-sub",
    batch: "Batch 3",
    region: "Chennai / Tamil Nadu",
    completedWorkshops: 14,
  },
  {
    id: "DOS-B3-005",
    fullName: "Siddharth Rajan",
    email: "siddharth@student.dosclub.org",
    institution: "Thiagarajar College of Engineering, Madurai",
    githubHandle: "sid-rajan",
    batch: "Batch 3",
    region: "Madurai / Tamil Nadu",
    completedWorkshops: 12,
  },
];

type IngestionTab = "form" | "csv";

export default function AdminPage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [activeTab, setActiveTab] = useState<IngestionTab>("form");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>("ALL");

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dosId, setDosId] = useState("");
  const [institution, setInstitution] = useState("");
  const [githubHandle, setGithubHandle] = useState("");
  const [batch, setBatch] = useState("Batch 3");
  const [region, setRegion] = useState("Chennai / Tamil Nadu");
  const [formFeedback, setFormFeedback] = useState<string | null>(null);

  // CSV State
  const [csvText, setCsvText] = useState("");
  const [csvFeedback, setCsvFeedback] = useState<string | null>(null);

  // Handle Form Submission
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    if (!fullName.trim() || !email.trim() || !institution.trim()) {
      setFormFeedback("ERR_MISSING_REQUIRED_FIELDS // FULL NAME, EMAIL, AND INSTITUTION REQUIRED");
      return;
    }

    const generatedId = dosId.trim() || `DOS-B3-${String(members.length + 1).padStart(3, "0")}`;

    const newMember: Member = {
      id: generatedId.toUpperCase(),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      institution: institution.trim(),
      githubHandle: githubHandle.trim() || "N/A",
      batch: batch.trim() || "Batch 3",
      region: region.trim() || "Tamil Nadu",
      completedWorkshops: 0,
    };

    setMembers([newMember, ...members]);
    setFormFeedback(`SUCCESS // MEMBER ${newMember.id} ENROLLED IN BATCH`);
    setFullName("");
    setEmail("");
    setDosId("");
    setInstitution("");
    setGithubHandle("");
  };

  // Handle CSV Ingestion
  const handleCsvImport = () => {
    setCsvFeedback(null);
    if (!csvText.trim()) {
      setCsvFeedback("ERR_EMPTY_PAYLOAD // PASTE CSV OR JSON DATA FIRST");
      return;
    }

    try {
      const lines = csvText.trim().split("\n");
      const parsedMembers: Member[] = [];

      lines.forEach((line, index) => {
        // Skip header line if detected
        if (index === 0 && line.toLowerCase().includes("fullname")) return;

        const parts = line.split(",").map((p) => p.trim());
        if (parts.length >= 3) {
          const [name, memberEmail, inst, git, bch] = parts;
          parsedMembers.push({
            id: `DOS-B3-${String(members.length + parsedMembers.length + 1).padStart(3, "0")}`,
            fullName: name,
            email: memberEmail,
            institution: inst || "Unspecified Institution",
            githubHandle: git || "N/A",
            batch: bch || "Batch 3",
            region: "Tamil Nadu",
            completedWorkshops: 0,
          });
        }
      });

      if (parsedMembers.length === 0) {
        setCsvFeedback("ERR_PARSE_FAILED // NO VALID ROWS FOUND IN CSV FORMAT");
        return;
      }

      setMembers([...parsedMembers, ...members]);
      setCsvFeedback(`SUCCESS // BATCH INGESTED: ${parsedMembers.length} MEMBERS ENROLLED`);
      setCsvText("");
    } catch {
      setCsvFeedback("ERR_SYNTAX // INVALID CSV / TEXT FORMAT");
    }
  };

  // Filter Members
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.institution.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBatch = selectedBatch === "ALL" || m.batch === selectedBatch;
    return matchesSearch && matchesBatch;
  });

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-neutral-900 font-sans selection:bg-neutral-200 selection:text-neutral-900 flex flex-col justify-between">
      {/* Top Header */}
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
              CLEARANCE: ROOT_ADMIN • BATCH: ACTIVE
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

      {/* Main Admin Console */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col gap-10">
        {/* Console Header */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-neutral-200 pb-8">
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-neutral-200 bg-neutral-100 font-mono text-[10px] sm:text-xs text-neutral-700 tracking-widest uppercase self-start font-medium">
              LEADERSHIP AUDIT INTERFACE // ROOT ACCESS
            </div>
            <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-neutral-950">
              Admin & Batch Console
            </h1>
            <p className="font-mono text-xs sm:text-sm text-neutral-600">
              Manage enrolled members, perform batch roster ingestion, and audit individual student records across all 27 workshops.
            </p>
          </div>

          {/* Quick Metrics (Strictly factual counts, NO composite scoring) */}
          <div className="grid grid-cols-3 gap-3 border border-neutral-200 bg-white p-4 font-mono text-xs w-full md:w-auto shadow-2xs">
            <div className="flex flex-col">
              <span className="text-neutral-500 text-[10px]">TOTAL MEMBERS</span>
              <span className="text-base font-semibold text-neutral-900">{members.length}</span>
            </div>
            <div className="flex flex-col border-l border-neutral-200 pl-3">
              <span className="text-neutral-500 text-[10px]">WORKSHOPS</span>
              <span className="text-base font-semibold text-neutral-900">27</span>
            </div>
            <div className="flex flex-col border-l border-neutral-200 pl-3">
              <span className="text-neutral-500 text-[10px]">BATCH</span>
              <span className="text-base font-semibold text-emerald-700">ACTIVE</span>
            </div>
          </div>
        </section>

        {/* Ingestion Panel: Form & CSV Tabs */}
        <section className="border border-neutral-200 bg-white p-6 sm:p-8 shadow-2xs">
          <div className="flex justify-between items-center border-b border-neutral-200 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="font-mono text-xs uppercase tracking-wider text-neutral-900 font-semibold">
                ENROLL NEW MEMBERS
              </h2>
              <span className="text-neutral-300">|</span>
              <div className="flex gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("form")}
                  className={`px-3 py-1 rounded transition-colors ${
                    activeTab === "form"
                      ? "bg-neutral-900 text-white font-medium"
                      : "text-neutral-500 hover:text-neutral-900 bg-neutral-100"
                  }`}
                >
                  INTERACTIVE FORM
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("csv")}
                  className={`px-3 py-1 rounded transition-colors ${
                    activeTab === "csv"
                      ? "bg-neutral-900 text-white font-medium"
                      : "text-neutral-500 hover:text-neutral-900 bg-neutral-100"
                  }`}
                >
                  CSV / TEXT IMPORT
                </button>
              </div>
            </div>
          </div>

          {/* Form Mode */}
          {activeTab === "form" ? (
            <form onSubmit={handleAddMember} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] text-neutral-700 uppercase font-medium">
                    FULL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Anandha Krishnan"
                    className="border border-neutral-300 bg-white px-3 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-700 shadow-2xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] text-neutral-700 uppercase font-medium">
                    STUDENT EMAIL *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@dosclub.org"
                    className="border border-neutral-300 bg-white px-3 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-700 shadow-2xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] text-neutral-700 uppercase font-medium">
                    COLLEGE / INSTITUTION *
                  </label>
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Anna University, Chennai"
                    className="border border-neutral-300 bg-white px-3 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-700 shadow-2xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] text-neutral-700 uppercase font-medium">
                    MEMBER ID (DOS_ID)
                  </label>
                  <input
                    type="text"
                    value={dosId}
                    onChange={(e) => setDosId(e.target.value)}
                    placeholder="e.g. DOS-B3-050 (Auto if blank)"
                    className="border border-neutral-300 bg-white px-3 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-700 shadow-2xs uppercase"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] text-neutral-700 uppercase font-medium">
                    GITHUB HANDLE
                  </label>
                  <input
                    type="text"
                    value={githubHandle}
                    onChange={(e) => setGithubHandle(e.target.value)}
                    placeholder="e.g. anand-dev"
                    className="border border-neutral-300 bg-white px-3 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-700 shadow-2xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] text-neutral-700 uppercase font-medium">
                    BATCH
                  </label>
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    placeholder="Batch 3"
                    className="border border-neutral-300 bg-white px-3 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-700 shadow-2xs"
                  />
                </div>
              </div>

              {formFeedback && (
                <p
                  className={`font-mono text-xs tracking-wider ${
                    formFeedback.startsWith("SUCCESS") ? "text-emerald-700" : "text-amber-800"
                  }`}
                >
                  {formFeedback}
                </p>
              )}

              <button
                type="submit"
                className="self-start px-5 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 font-mono text-xs uppercase tracking-wider font-medium transition-colors shadow-2xs"
              >
                + ENROLL MEMBER
              </button>
            </form>
          ) : (
            /* CSV Mode */
            <div className="flex flex-col gap-4">
              <p className="text-xs text-neutral-600 font-mono">
                Paste comma-separated rows below. Format: <code className="bg-neutral-100 px-1 py-0.5 text-neutral-800 font-semibold">FullName, Email, Institution, GitHubHandle, Batch</code>
              </p>
              <textarea
                rows={5}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Naveen Raj, naveen@student.dosclub.org, SSN College, naveen-raj, Batch 3&#10;Priya Dharshini, priya@student.dosclub.org, CIT Coimbatore, priya-d, Batch 3"
                className="w-full border border-neutral-300 bg-white p-3 font-mono text-xs text-neutral-900 focus:outline-none focus:border-neutral-700 shadow-2xs"
              />

              {csvFeedback && (
                <p
                  className={`font-mono text-xs tracking-wider ${
                    csvFeedback.startsWith("SUCCESS") ? "text-emerald-700" : "text-amber-800"
                  }`}
                >
                  {csvFeedback}
                </p>
              )}

              <button
                type="button"
                onClick={handleCsvImport}
                className="self-start px-5 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 font-mono text-xs uppercase tracking-wider font-medium transition-colors shadow-2xs"
              >
                PARSE & IMPORT ROSTER
              </button>
            </div>
          )}
        </section>

        {/* Member Directory & Search */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-xs uppercase tracking-wider text-neutral-700 font-semibold">
                ACTIVE BATCH ROSTER ({filteredMembers.length} MEMBERS)
              </h2>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, DOS_ID..."
                className="border border-neutral-300 bg-white px-3 py-1.5 text-xs font-mono text-neutral-900 focus:outline-none focus:border-neutral-600 shadow-2xs w-full sm:w-64"
              />
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="border border-neutral-300 bg-white px-3 py-1.5 text-xs font-mono text-neutral-700 focus:outline-none shadow-2xs"
              >
                <option value="ALL">ALL BATCHES</option>
                <option value="Batch 3">Batch 3</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className="border border-neutral-200 bg-white divide-y divide-neutral-200 shadow-2xs overflow-x-auto">
            <div className="p-3 bg-neutral-50/70 grid grid-cols-12 gap-2 font-mono text-[11px] text-neutral-500 font-medium">
              <div className="col-span-3">MEMBER</div>
              <div className="col-span-2">ID</div>
              <div className="col-span-3">INSTITUTION</div>
              <div className="col-span-2">GITHUB</div>
              <div className="col-span-1 text-center">WORKSHOPS</div>
              <div className="col-span-1 text-right">ACTION</div>
            </div>

            {filteredMembers.map((m) => (
              <div
                key={m.id}
                className="p-3.5 grid grid-cols-12 gap-2 items-center text-xs hover:bg-neutral-50/80 transition-colors font-mono"
              >
                <div className="col-span-3 flex flex-col">
                  <span className="font-medium text-neutral-950 font-sans">{m.fullName}</span>
                  <span className="text-[11px] text-neutral-500">{m.email}</span>
                </div>
                <div className="col-span-2 text-neutral-700 font-medium">{m.id}</div>
                <div className="col-span-3 text-neutral-600 text-[11px] truncate">{m.institution}</div>
                <div className="col-span-2 text-neutral-600 text-[11px]">{m.githubHandle}</div>
                <div className="col-span-1 text-center font-semibold text-emerald-700">
                  {m.completedWorkshops} / 27
                </div>
                <div className="col-span-1 text-right">
                  <Link
                    href={`/record/${encodeURIComponent(m.id)}`}
                    className="text-neutral-900 hover:text-black font-semibold text-[11px] underline"
                  >
                    Record &rarr;
                  </Link>
                </div>
              </div>
            ))}

            {filteredMembers.length === 0 && (
              <div className="p-8 text-center text-neutral-500 font-mono text-xs">
                NO MEMBERS MATCHED YOUR SEARCH QUERY
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center font-mono text-[11px] sm:text-xs text-neutral-500 tracking-wider">
          DESCIENCE OPEN SOURCE CLUB • SINGAPORE // CHENNAI • TALENT_OS V1
        </div>
      </footer>
    </div>
  );
}
