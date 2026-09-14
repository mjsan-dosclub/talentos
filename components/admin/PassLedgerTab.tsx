import React, { useState, useEffect } from "react";
import { AccessPass } from "@/lib/passes";
import TablePagination from "./TablePagination";
import {
  IdCardIcon,
  CheckIcon,
  SearchIcon,
  ExternalLinkIcon,
  MoreVerticalIcon,
  TrashIcon,
  ShieldCheckIcon,
  XIcon,
} from "@/components/Icons";

interface PassLedgerTabProps {
  onToast: (message: string) => void;
  onAuditLog?: (
    category: "Students" | "Experts" | "Attendance" | "Certifications" | "System",
    subcategory: string,
    action: "Create" | "Update" | "Perform" | "Archive",
    sourceText: string
  ) => void;
}

export default function PassLedgerTab({ onToast, onAuditLog }: PassLedgerTabProps) {
  const [passes, setPasses] = useState<AccessPass[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "REVOKED" | "EXPIRED">("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openKebabId, setOpenKebabId] = useState<string | null>(null);

  // Issue Form State
  const initialFormState = {
    candidate_name: "",
    candidate_email: "",
    cohort_batch: "Batch 3 - 2026",
    institution: "Direct Builder Intake",
    clearance_level: "Tier 1 - Priority Clearance",
    pass_code: "",
    notes: "Issued via Admin Access Pass Ledger",
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchPasses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/passes");
      const data = await res.json();
      if (data.passes) {
        setPasses(data.passes);
      }
    } catch {
      onToast("Failed to fetch access pass ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasses();
  }, []);

  const generatePassCode = () => {
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const time = Date.now().toString().slice(-4);
    return `DOS-PASS-${rand}-${time}`;
  };

  const handleOpenModal = () => {
    setFormData({
      ...initialFormState,
      pass_code: generatePassCode(),
    });
    setIsModalOpen(true);
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.candidate_name || !formData.candidate_email) {
      onToast("Candidate name and email are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onToast(`Issued clearance pass: ${data.pass.pass_code}`);
        onAuditLog?.(
          "System",
          "Access Pass Ledger",
          "Create",
          `Issued clearance pass ${data.pass.pass_code} to ${formData.candidate_name} (${formData.candidate_email})`
        );
        setIsModalOpen(false);
        fetchPasses();
      } else {
        onToast(data.error || "Failed to issue pass.");
      }
    } catch (err: any) {
      onToast("Error issuing pass: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, pass_code: string, newStatus: "ACTIVE" | "REVOKED" | "EXPIRED") => {
    try {
      const res = await fetch("/api/passes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasses((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
        );
        onToast(`Pass ${pass_code} marked as ${newStatus}.`);
        onAuditLog?.(
          "System",
          "Access Pass Ledger",
          "Update",
          `Updated pass ${pass_code} status to ${newStatus}`
        );
      } else {
        onToast(data.error || "Failed to update status.");
      }
    } catch (err: any) {
      onToast("Error updating pass status: " + err.message);
    }
  };

  const handleDeleteSingle = async (id: string, pass_code: string) => {
    if (!confirm(`Permanently delete pass code "${pass_code}"?`)) return;

    try {
      const res = await fetch(`/api/passes?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasses((prev) => prev.filter((p) => p.id !== id));
        onToast(`Deleted pass ${pass_code}.`);
        onAuditLog?.(
          "System",
          "Access Pass Ledger",
          "Archive",
          `Permanently deleted pass code ${pass_code}`
        );
        const next = new Set(selectedIds);
        next.delete(id);
        setSelectedIds(next);
      } else {
        onToast(data.error || "Failed to delete pass.");
      }
    } catch (err: any) {
      onToast("Error: " + err.message);
    }
  };

  const handleBulkStatus = async (newStatus: "ACTIVE" | "REVOKED") => {
    if (selectedIds.size === 0) return;
    for (const id of Array.from(selectedIds)) {
      await fetch("/api/passes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    }
    setPasses((prev) =>
      prev.map((p) => (selectedIds.has(p.id) ? { ...p, status: newStatus } : p))
    );
    onToast(`Bulk marked ${selectedIds.size} pass(es) as ${newStatus}.`);
    onAuditLog?.(
      "System",
      "Access Pass Ledger",
      "Update",
      `Bulk updated ${selectedIds.size} passes to ${newStatus}`
    );
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Permanently delete ${selectedIds.size} pass(es)?`)) return;

    for (const id of Array.from(selectedIds)) {
      await fetch(`/api/passes?id=${id}`, { method: "DELETE" });
    }
    setPasses((prev) => prev.filter((p) => !selectedIds.has(p.id)));
    onToast(`Deleted ${selectedIds.size} pass(es).`);
    setSelectedIds(new Set());
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    onToast(`Copied ${code} to clipboard`);
  };

  const filteredPasses = passes.filter((p) => {
    const matchesSearch =
      p.pass_code.toLowerCase().includes(search.toLowerCase()) ||
      p.candidate_name.toLowerCase().includes(search.toLowerCase()) ||
      p.candidate_email.toLowerCase().includes(search.toLowerCase()) ||
      p.cohort_batch.toLowerCase().includes(search.toLowerCase()) ||
      p.institution.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedPasses = filteredPasses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const isAllSelected =
    filteredPasses.length > 0 &&
    filteredPasses.every((p) => selectedIds.has(p.id));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredPasses.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const activeCount = passes.filter((p) => p.status === "ACTIVE").length;
  const revokedCount = passes.filter((p) => p.status === "REVOKED").length;
  const expiredCount = passes.filter((p) => p.status === "EXPIRED").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider mb-1 border border-emerald-200">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hero Verifier Integration</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Access Pass Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue, audit, and revoke priority clearance codes used by builders and recruiters in the landing page verifier.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchPasses}
            className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Refresh Ledger
          </button>
          <button
            type="button"
            onClick={handleOpenModal}
            className="px-4 py-2 bg-[#E25C38] hover:bg-[#CC4F2E] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>+ Issue New Pass</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Passes
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{passes.length}</div>
          <span className="text-[10px] text-slate-500 font-medium block mt-1">
            Registered clearance keys
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Active Clearance
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</div>
          <span className="text-[10px] text-emerald-700 font-medium block mt-1">
            Hero verifier unlocked
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Revoked Passes
          </span>
          <div className="text-2xl font-bold text-rose-600 mt-1">{revokedCount}</div>
          <span className="text-[10px] text-rose-700 font-medium block mt-1">
            Access barred
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Expired
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{expiredCount}</div>
          <span className="text-[10px] text-amber-700 font-medium block mt-1">
            Past valid duration
          </span>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg border border-slate-800 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-2 py-0.5 rounded-full bg-[#E25C38] text-white text-[11px] font-bold font-mono">
              {selectedIds.size}
            </span>
            <span>Pass(es) Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatus("ACTIVE")}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all"
            >
              Bulk Activate
            </button>
            <button
              onClick={() => handleBulkStatus("REVOKED")}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all"
            >
              Bulk Revoke
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1"
            >
              <TrashIcon className="w-3.5 h-3.5" />
              <span>Bulk Delete</span>
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <SearchIcon className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by pass code, name, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#E25C38]"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            {(["ALL", "ACTIVE", "REVOKED", "EXPIRED"] as const).map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === st ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Passes Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-mono uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-[#E25C38] focus:ring-[#E25C38] cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Pass Code / Clearance Key</th>
                <th className="py-3 px-4">Candidate Details</th>
                <th className="py-3 px-4">Batch &amp; Level</th>
                <th className="py-3 px-4">Issued Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-mono text-xs">
                    LOADING_ACCESS_PASS_LEDGER...
                  </td>
                </tr>
              ) : filteredPasses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No access passes found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedPasses.map((pass, idx) => {
                  const isNearBottom = idx >= paginatedPasses.length - 2;
                  return (
                    <tr key={pass.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(pass.id)}
                          onChange={() => toggleSelect(pass.id)}
                          className="rounded border-slate-300 text-[#E25C38] focus:ring-[#E25C38] cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                            {pass.pass_code}
                          </span>
                          <button
                            onClick={() => copyCode(pass.pass_code)}
                            title="Copy Pass Code"
                            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{pass.notes}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{pass.candidate_name}</div>
                        <div className="text-[11px] text-slate-500">{pass.candidate_email}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{pass.institution}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{pass.cohort_batch}</div>
                        <div className="text-[10px] text-neutral-500 font-medium">{pass.clearance_level}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        {new Date(pass.issued_at).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider ${
                            pass.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : pass.status === "REVOKED"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              pass.status === "ACTIVE"
                                ? "bg-emerald-500"
                                : pass.status === "REVOKED"
                                ? "bg-rose-500"
                                : "bg-amber-500"
                            }`}
                          />
                          <span>{pass.status}</span>
                        </span>
                      </td>

                      {/* Minimalist 3-dot Kebab Menu */}
                      <td className="py-3.5 px-4 text-right relative">
                        <button
                          onClick={() => setOpenKebabId(openKebabId === pass.id ? null : pass.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                          aria-label="Actions"
                        >
                          <MoreVerticalIcon className="w-4 h-4" />
                        </button>

                        {openKebabId === pass.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenKebabId(null)}
                            />
                            <div
                              className={`absolute right-3 ${
                                isNearBottom ? "bottom-full mb-1" : "top-10"
                              } w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-left text-xs animate-in fade-in zoom-in-95 duration-100`}
                            >
                              <a
                                href={`/ledger/${encodeURIComponent(pass.pass_code)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer font-medium"
                                onClick={() => setOpenKebabId(null)}
                              >
                                <span>Verify Certificate</span>
                                <ExternalLinkIcon className="w-3 h-3 text-slate-400" />
                              </a>
                              <button
                                onClick={() => {
                                  copyCode(pass.pass_code);
                                  setOpenKebabId(null);
                                }}
                                className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                              >
                                <span>Copy Pass Code</span>
                              </button>
                              <div className="border-t border-slate-100 my-1" />
                              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Set Status
                              </div>
                              {(["ACTIVE", "REVOKED", "EXPIRED"] as const).map((st) => (
                                <button
                                  key={st}
                                  onClick={() => {
                                    handleStatusChange(pass.id, pass.pass_code, st);
                                    setOpenKebabId(null);
                                  }}
                                  className={`w-full px-3 py-1 text-left flex items-center justify-between cursor-pointer ${
                                    pass.status === st
                                      ? "text-[#E25C38] font-bold bg-orange-50/50"
                                      : "text-slate-600 hover:bg-slate-50"
                                  }`}
                                >
                                  <span>{st}</span>
                                  {pass.status === st && <span className="text-xs">&bull;</span>}
                                </button>
                              ))}
                              <div className="border-t border-slate-100 my-1" />
                              <button
                                onClick={() => {
                                  setOpenKebabId(null);
                                  handleDeleteSingle(pass.id, pass.pass_code);
                                }}
                                className="w-full px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-semibold"
                              >
                                <span>Delete Pass</span>
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredPasses.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Issue Pass Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Issue Priority Access Pass</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate a clearance key that unblocks verified dossiers in the Hero verifier.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Candidate Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anandha Kumar"
                  value={formData.candidate_name}
                  onChange={(e) => setFormData({ ...formData, candidate_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#E25C38]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Candidate Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="candidate@university.edu"
                  value={formData.candidate_email}
                  onChange={(e) => setFormData({ ...formData, candidate_email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#E25C38]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cohort Batch
                  </label>
                  <input
                    type="text"
                    value={formData.cohort_batch}
                    onChange={(e) => setFormData({ ...formData, cohort_batch: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#E25C38]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Clearance Tier
                  </label>
                  <select
                    value={formData.clearance_level}
                    onChange={(e) => setFormData({ ...formData, clearance_level: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#E25C38]"
                  >
                    <option value="Tier 1 - Priority Clearance">Tier 1 - Priority Clearance</option>
                    <option value="Tier 2 - Systems Pod">Tier 2 - Systems Pod</option>
                    <option value="Tier 3 - Standard Builder">Tier 3 - Standard Builder</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Institution / University
                </label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#E25C38]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Pass Code (Clearance Key)
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, pass_code: generatePassCode() })}
                    className="text-[10px] font-semibold text-[#E25C38] hover:underline"
                  >
                    Generate New Code
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={formData.pass_code}
                  onChange={(e) => setFormData({ ...formData, pass_code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 uppercase focus:bg-white focus:outline-none focus:border-[#E25C38]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-[#E25C38]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#E25C38] hover:bg-[#CC4F2E] text-white rounded-xl font-bold shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Issuing..." : "Issue Clearance Pass"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
