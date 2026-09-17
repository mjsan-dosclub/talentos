import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { StudentMember, PartnerInstitution, INITIAL_INSTITUTIONS } from "@/lib/admin-data";
import { getClientSession } from "@/lib/session";
import GlobalTableFilter from "./GlobalTableFilter";
import TablePagination from "./TablePagination";
import {
  UsersIcon,
  TrashIcon,
  EditIcon,
  ExternalLinkIcon,
  MoreVerticalIcon,
  XIcon,
} from "@/components/Icons";

interface StudentsTabProps {
  students: StudentMember[];
  setStudents: React.Dispatch<React.SetStateAction<StudentMember[]>>;
  institutions?: PartnerInstitution[];
  onToast: (msg: string) => void;
  onAuditLog?: (
    category: "Students" | "Experts" | "Attendance" | "Certifications" | "System",
    subcategory: string,
    action: "Create" | "Update" | "Perform" | "Archive",
    sourceText: string
  ) => void;
}

export default function StudentsTab({
  students,
  setStudents,
  institutions = [],
  onToast,
  onAuditLog,
}: StudentsTabProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const session = getClientSession();
    setIsAdmin(session?.role === "SUPER_ADMIN");
  }, []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [batchFilter, setBatchFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentMember | null>(null);
  const [openKebabId, setOpenKebabId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bulkFileRef = useRef<HTMLInputElement>(null);

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const lines = (await file.text()).split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) { onToast("CSV must include a header row and at least one student."); return; }
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const required = ["full_name", "email", "phone", "institution"];
    const missing = required.filter((h) => !headers.includes(h));
    if (missing.length) { onToast(`CSV missing required columns: ${missing.join(", ")}`); return; }
    let imported = 0; const errors: string[] = [];
    for (let index = 1; index < lines.length; index++) {
      const values = lines[index].split(","); const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = (values[i] || "").trim(); });
      if (!row.full_name || !row.email || !row.phone || !row.institution) { errors.push(`row ${index + 1}: missing required value`); continue; }
      const response = await fetch("/api/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dosId: row.dos_id || `DOS-B3-${String(students.length + imported + 1).padStart(3, "0")}`, fullName: row.full_name, email: row.email, phone: row.phone, institution: row.institution, department: row.department || "", batch: row.batch || "Batch 3 - 2026" }) });
      const result = await response.json();
      if (response.ok && result.success) { imported++; } else errors.push(`row ${index + 1}: ${result.error || "rejected"}`);
    }
    onToast(`Imported ${imported} student(s)${errors.length ? `; ${errors.length} row(s) rejected` : ""}.`);
    if (imported) window.location.reload();
  };

  const downloadStudentTemplate = () => {
    const blob = new Blob(["dos_id,full_name,email,phone,institution,department,batch\n,Doe Student,name@company.com,9000000000,College Name,Computer Science,Batch 3 - 2026\n"], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "student-import-template.csv"; link.click(); URL.revokeObjectURL(url);
  };

  // New Student Form State
  const [newStudent, setNewStudent] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "Computer Science & Engineering",
    institution: institutions.length > 0 ? institutions[0].name : "",
    batch: "Batch 3 - 2026",
  });

  useEffect(() => {
    if (institutions.length > 0 && !newStudent.institution) {
      setNewStudent((prev) => ({ ...prev, institution: institutions[0].name }));
    }
  }, [institutions]);

  // Filter logic
  const filtered = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.dosId.toLowerCase().includes(search.toLowerCase()) ||
      s.institution.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    const matchesBatch = batchFilter === "ALL" || s.batch === batchFilter;
    return matchesSearch && matchesStatus && matchesBatch;
  });

  // Paginated records
  const paginatedStudents = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filtered.length && filtered.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((s) => s.id)));
    }
  };

  // Bulk actions
  const handleBulkStatusUpdate = async (status: StudentMember["status"]) => {
    const count = selectedIds.size;
    if (count === 0) return;

    for (const id of Array.from(selectedIds)) {
      try {
        await fetch("/api/students", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status }),
        });
      } catch (e) {
        // Continue best-effort
      }
    }

    setStudents((prev) =>
      prev.map((s) => (selectedIds.has(s.id) ? { ...s, status } : s))
    );
    onAuditLog?.(
      "Students",
      "Status Management",
      "Update",
      `Bulk updated ${count} student(s) to status ${status}`
    );
    setSelectedIds(new Set());
    onToast(`Updated ${count} candidate(s) to ${status}`);
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (count === 0) return;
    if (!confirm(`Archive ${count} selected student record(s)?`)) return;

    for (const id of Array.from(selectedIds)) {
      try {
        await fetch(`/api/students?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      } catch (e) {
        // Continue best-effort
      }
    }

    setStudents((prev) => prev.filter((s) => !selectedIds.has(s.id)));
    onAuditLog?.(
      "Students",
      "Student Deletion",
      "Archive",
      `Bulk archived ${count} student record(s)`
    );
    setSelectedIds(new Set());
    onToast(`Archived ${count} student(s)`);
  };

  // Single actions
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete record for "${name}"? This candidate will be archived.`)) return;
    try {
      const res = await fetch(`/api/students?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s.id !== id && s.dosId !== id));
        onAuditLog?.(
          "Students",
          "Student Deletion",
          "Archive",
          `Archived student record for ${name} (${id})`
        );
        onToast(`Candidate ${name} archived successfully`);
      } else {
        const data = await res.json();
        onToast(`Failed to archive candidate: ${data.error || "Server error"}`);
      }
    } catch (e: any) {
      onToast(`Error archiving student: ${e.message}`);
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: StudentMember["status"],
    name: string
  ) => {
    try {
      const res = await fetch("/api/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setStudents((prev) =>
          prev.map((s) => (s.id === id || s.dosId === id ? { ...s, status: newStatus } : s))
        );
        onAuditLog?.(
          "Students",
          "Status Update",
          "Update",
          `Updated clearance status of ${name} to ${newStatus}`
        );
        onToast(`Updated status of ${name} to ${newStatus}`);
      } else {
        onToast(`Failed to update status: ${data.error || "Server error"}`);
      }
    } catch (e: any) {
      onToast(`Error updating status: ${e.message}`);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.fullName.trim() || !newStudent.email.trim() || !newStudent.phone.trim()) return;

    setIsSubmitting(true);
    const nextNum = String(students.length + 1).padStart(3, "0");
    const payload = {
      dosId: `DOS-B3-${nextNum}`,
      fullName: newStudent.fullName.trim(),
      email: newStudent.email.trim(),
      phone: newStudent.phone.trim(),
      department: newStudent.department,
      institution: newStudent.institution,
      batch: newStudent.batch,
      completedWorkshops: 0,
      status: "ACTIVE" as const,
    };

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.student) {
        setStudents([data.student, ...students]);
        setIsAddOpen(false);
        setNewStudent({
          fullName: "",
          email: "",
          phone: "",
          department: "Computer Science & Engineering",
          institution: institutions.length > 0 ? institutions[0].name : "",
          batch: "Batch 3 - 2026",
        });
        onAuditLog?.(
          "Students",
          "Profile Creation",
          "Create",
          `Enrolled candidate ${data.student.fullName} (${data.student.dosId})`
        );
        onToast(`CONFIRMED // Enrolled ${data.student.fullName} (${data.student.dosId}) in DB`);
      } else {
        onToast(`ERROR // Failed to enroll: ${data.error || "Unknown error"}`);
      }
    } catch (e: any) {
      onToast(`ERROR // ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      const res = await fetch("/api/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingStudent),
      });
      if (res.ok) {
        setStudents((prev) =>
          prev.map((s) => (s.id === editingStudent.id ? editingStudent : s))
        );
        onAuditLog?.(
          "Students",
          "Profile Update",
          "Update",
          `Updated profile for ${editingStudent.fullName} (${editingStudent.dosId})`
        );
        onToast(`Saved changes for ${editingStudent.fullName}`);
        setEditingStudent(null);
      } else {
        const data = await res.json();
        onToast(`Failed to update: ${data.error || "Server error"}`);
      }
    } catch (e: any) {
      onToast(`Error saving candidate: ${e.message}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider mb-1.5 font-mono">
            <UsersIcon className="w-3 h-3" />
            <span>Candidate Verification & Roster</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Student Roster Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active candidate roster, clearance verification telemetry, and defense tracking across cohorts.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>+ Enroll Student</span>
            </button>
            <button onClick={downloadStudentTemplate} className="px-3 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg">Download CSV Template</button>
            <button onClick={() => bulkFileRef.current?.click()} className="px-3 py-2 border border-blue-300 text-blue-700 text-xs font-semibold rounded-lg">Bulk Upload CSV</button>
            <input ref={bulkFileRef} type="file" accept=".csv,text/csv" onChange={handleBulkUpload} className="hidden" />
          </div>
        )}
      </div>

      {/* Reusable Global Datatable Filter */}
      <GlobalTableFilter
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by name, email, DOS_ID or campus hub..."
        status={statusFilter}
        onStatusChange={(val) => {
          setStatusFilter(val);
          setCurrentPage(1);
        }}
        statusOptions={[
          { value: "ALL", label: "All Statuses" },
          { value: "ACTIVE", label: "Active" },
          { value: "DEFENSE_READY", label: "Defense Ready" },
          { value: "ON_LEAVE", label: "On Leave" },
          { value: "ARCHIVED", label: "Archived Candidates" },
          { value: "INACTIVE", label: "Inactive" },
        ]}
        secondary={batchFilter}
        onSecondaryChange={(val) => {
          setBatchFilter(val);
          setCurrentPage(1);
        }}
        secondaryLabel="All Batches"
        secondaryOptions={[
          { value: "Batch 3 - 2026", label: "Batch 3 - 2026" },
          { value: "Batch 2 - 2025", label: "Batch 2 - 2025" },
        ]}
        totalCount={students.length}
        filteredCount={filtered.length}
        onClear={() => {
          setSearch("");
          setStatusFilter("ALL");
          setBatchFilter("ALL");
          setCurrentPage(1);
        }}
      />

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white font-mono text-xs font-bold px-2 py-0.5 rounded">
              {selectedIds.size}
            </span>
            <span className="text-xs font-medium text-slate-200">
              Candidate(s) Selected
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleBulkStatusUpdate("ACTIVE")}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded cursor-pointer"
            >
              Mark Active
            </button>
            <button
              onClick={() => handleBulkStatusUpdate("DEFENSE_READY")}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded cursor-pointer"
            >
              Mark Defense Ready
            </button>
            <button
              onClick={() => handleBulkStatusUpdate("ON_LEAVE")}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded cursor-pointer"
            >
              Mark On Leave
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded cursor-pointer flex items-center gap-1"
            >
              <TrashIcon className="w-3 h-3" />
              <span>Archive</span>
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-2 py-1 text-slate-400 hover:text-white text-xs cursor-pointer ml-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Candidate Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="overflow-visible rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filtered.length && filtered.length > 0}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded text-blue-600 cursor-pointer"
                    aria-label="Select all students"
                  />
                </th>
                <th className="p-3">Candidate / Dossier</th>
                <th className="p-3">Institution & Dept</th>
                <th className="p-3">Batch</th>
                <th className="p-3">Progress</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-mono text-xs">
                    NO_STUDENTS_MATCHING_FILTER
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s, idx) => {
                  const isSelected = selectedIds.has(s.id);
                  const isNearBottom = idx >= paginatedStudents.length - 2;
                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(s.id)}
                          className="w-3.5 h-3.5 rounded text-blue-600 cursor-pointer"
                          aria-label={`Select ${s.fullName}`}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-xs">{s.fullName}</span>
                          <span className="text-[11px] text-slate-400">{s.email}</span>
                          <Link
                            href={`/record/${s.dosId}`}
                            className="text-[10px] font-mono text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1 mt-0.5"
                          >
                            <span>{s.dosId}</span>
                            <ExternalLinkIcon className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">{s.institution}</span>
                          <span className="text-[11px] text-slate-400">{s.department}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-600">
                        {s.batch}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${Math.min(100, (s.completedWorkshops / 27) * 100)}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-slate-600 font-bold">
                            {s.completedWorkshops}/27
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            s.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : s.status === "DEFENSE_READY"
                              ? "bg-blue-50 text-blue-800 border border-blue-200"
                              : s.status === "ON_LEAVE"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : s.status === "ARCHIVED"
                              ? "bg-rose-50 text-rose-800 border border-rose-200"
                              : "bg-slate-100 text-slate-600 border border-slate-300"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      {/* Minimalist 3-dot Kebab Menu */}
                      <td className="p-3 text-right relative">
                        <button
                          onClick={() => setOpenKebabId(openKebabId === s.id ? null : s.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                          aria-label="Actions"
                        >
                          <MoreVerticalIcon className="w-4 h-4" />
                        </button>

                        {openKebabId === s.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenKebabId(null)}
                            />
                            <div
                              className={`absolute right-3 ${
                                isNearBottom ? "bottom-full mb-1" : "top-10"
                              } w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-left text-xs animate-in fade-in zoom-in-95 duration-100`}
                            >
                              <Link
                                href={`/record/${s.dosId}`}
                                target="_blank"
                                className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer font-medium"
                                onClick={() => setOpenKebabId(null)}
                              >
                                <span>View Verified Dossier</span>
                                <ExternalLinkIcon className="w-3 h-3 text-slate-400" />
                              </Link>
                              <button
                                onClick={() => {
                                  setEditingStudent(s);
                                  setOpenKebabId(null);
                                }}
                                className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                              >
                                <span>Edit Candidate</span>
                              </button>
                              <div className="border-t border-slate-100 my-1" />
                              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Set Status
                              </div>
                              {(["ACTIVE", "DEFENSE_READY", "ON_LEAVE", "INACTIVE"] as const).map((st) => (
                                <button
                                  key={st}
                                  onClick={() => {
                                    handleStatusChange(s.id, st, s.fullName);
                                    setOpenKebabId(null);
                                  }}
                                  className={`w-full px-3 py-1 text-left flex items-center justify-between cursor-pointer ${
                                    s.status === st
                                      ? "text-[#E25C38] font-bold bg-orange-50/50"
                                      : "text-slate-600 hover:bg-slate-50"
                                  }`}
                                >
                                  <span>{st.replace("_", " ")}</span>
                                  {s.status === st && <span className="text-xs">&bull;</span>}
                                </button>
                              ))}
                              <div className="border-t border-slate-100 my-1" />
                              {s.status === "ARCHIVED" ? (
                                <button
                                  onClick={() => {
                                    setOpenKebabId(null);
                                    handleStatusChange(s.id, "ACTIVE", s.fullName);
                                  }}
                                  className="w-full px-3 py-1.5 text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer font-semibold"
                                >
                                  <span>Restore Candidate</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setOpenKebabId(null);
                                    handleDelete(s.id, s.fullName);
                                  }}
                                  className="w-full px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-semibold"
                                >
                                  <span>Archive Candidate</span>
                                </button>
                              )}
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
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* ADD STUDENT MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Enroll New Candidate</h2>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Full Name:</label>
                <input
                  type="text"
                  required
                  value={newStudent.fullName}
                  onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                  placeholder="e.g. Anand Ranganathan"
                  className="border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Email Address:</label>
                <input
                  type="email"
                  required
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  placeholder="anand@student.dosclub.org"
                  className="border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Student WhatsApp / Mobile Number:</label>
                <input type="tel" required value={newStudent.phone} onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })} placeholder="e.g. +91 9876543210" className="border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-slate-900" />
                <span className="text-[10px] text-slate-400">Used for workshop information and WhatsApp communication.</span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Campus Hub:</label>
                <select
                  required
                  value={newStudent.institution}
                  onChange={(e) => setNewStudent({ ...newStudent, institution: e.target.value })}
                  className="border border-slate-300 rounded-lg p-2 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {institutions.length > 0 ? (
                    institutions.map((inst) => (
                      <option key={inst.id} value={inst.name}>
                        {inst.name} ({inst.city})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No Campus Hubs Available — Add standard college first
                    </option>
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Department:</label>
                <select
                  required
                  value={newStudent.department}
                  onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                  className="border border-slate-300 rounded-lg p-2 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                  <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                  <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                  <option value="Mechanical & Systems Engineering">Mechanical & Systems Engineering</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Cohort Batch:</label>
                <select
                  required
                  value={newStudent.batch}
                  onChange={(e) => setNewStudent({ ...newStudent, batch: e.target.value })}
                  className="border border-slate-300 rounded-lg p-2 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="Batch 3 - 2026">Batch 3 - 2026</option>
                  <option value="Batch 2 - 2025">Batch 2 - 2025</option>
                  <option value="Batch 1 - 2024">Batch 1 - 2024</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-75 text-white font-semibold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Enrolling...</span>
                    </>
                  ) : (
                    <span>Enroll Candidate</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                Edit Candidate: {editingStudent.dosId}
              </h2>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Full Name:</label>
                <input
                  type="text"
                  required
                  value={editingStudent.fullName}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, fullName: e.target.value })
                  }
                  className="border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Email Address:</label>
                <input
                  type="email"
                  required
                  value={editingStudent.email}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, email: e.target.value })
                  }
                  className="border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Student WhatsApp / Mobile Number:</label>
                <input type="tel" required value={editingStudent.phone || ""} onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })} placeholder="e.g. +91 9876543210" className="border border-slate-300 rounded-lg p-2" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Campus Hub:</label>
                <select
                  required
                  value={editingStudent.institution}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, institution: e.target.value })
                  }
                  className="border border-slate-300 rounded-lg p-2 bg-white"
                >
                  {institutions.length > 0 ? (
                    institutions.map((inst) => (
                      <option key={inst.id} value={inst.name}>
                        {inst.name} ({inst.city})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No Campus Hubs Available — Add standard college first
                    </option>
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Department:</label>
                <select
                  required
                  value={editingStudent.department || "Computer Science & Engineering"}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, department: e.target.value })
                  }
                  className="border border-slate-300 rounded-lg p-2 bg-white"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                  <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
                  <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                  <option value="Mechanical & Systems Engineering">Mechanical & Systems Engineering</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Cohort Batch:</label>
                <select
                  required
                  value={editingStudent.batch || "Batch 3 - 2026"}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, batch: e.target.value })
                  }
                  className="border border-slate-300 rounded-lg p-2 bg-white"
                >
                  <option value="Batch 3 - 2026">Batch 3 - 2026</option>
                  <option value="Batch 2 - 2025">Batch 2 - 2025</option>
                  <option value="Batch 1 - 2024">Batch 1 - 2024</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Clearance Status:</label>
                <select
                  value={editingStudent.status}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      status: e.target.value as StudentMember["status"],
                    })
                  }
                  className="border border-slate-300 rounded-lg p-2 bg-white font-semibold text-slate-800"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DEFENSE_READY">DEFENSE_READY</option>
                  <option value="ON_LEAVE">ON_LEAVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
