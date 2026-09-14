"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StudentMember } from "@/lib/admin-data";
import GlobalTableFilter from "./GlobalTableFilter";
import {
  UsersIcon,
  TrashIcon,
  EditIcon,
  ExternalLinkIcon,
  XIcon,
} from "@/components/Icons";

interface StudentsTabProps {
  students: StudentMember[];
  setStudents: React.Dispatch<React.SetStateAction<StudentMember[]>>;
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
  onToast,
  onAuditLog,
}: StudentsTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [batchFilter, setBatchFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentMember | null>(null);

  // New Student Form State
  const [newStudent, setNewStudent] = useState({
    fullName: "",
    email: "",
    department: "Computer Science & Engineering",
    institution: "Anna University Campus Hub",
    batch: "Batch 3 - 2026",
  });

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
  const handleBulkStatusUpdate = (status: StudentMember["status"]) => {
    const count = selectedIds.size;
    if (count === 0) return;
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

  const handleBulkDelete = () => {
    const count = selectedIds.size;
    if (count === 0) return;
    if (!confirm(`Delete ${count} selected student record(s)?`)) return;
    setStudents((prev) => prev.filter((s) => !selectedIds.has(s.id)));
    onAuditLog?.(
      "Students",
      "Student Deletion",
      "Archive",
      `Bulk deleted ${count} student record(s)`
    );
    setSelectedIds(new Set());
    onToast(`Deleted ${count} student(s)`);
  };

  // Single actions
  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete record for "${name}"?`)) return;
    setStudents((prev) => prev.filter((s) => s.id !== id));
    onAuditLog?.(
      "Students",
      "Student Deletion",
      "Archive",
      `Deleted student record for ${name}`
    );
    onToast(`Deleted student: ${name}`);
  };

  const handleStatusChange = (
    id: string,
    status: StudentMember["status"],
    name: string
  ) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
    onAuditLog?.(
      "Students",
      "Status Update",
      "Update",
      `Changed status of ${name} to ${status}`
    );
    onToast(`${name} is now ${status}`);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.fullName.trim() || !newStudent.email.trim()) return;

    const nextNum = String(students.length + 1).padStart(3, "0");
    const created: StudentMember = {
      id: `a00000${nextNum}`,
      dosId: `DOS-B3-${nextNum}`,
      fullName: newStudent.fullName.trim(),
      email: newStudent.email.trim(),
      institution: newStudent.institution,
      department: newStudent.department,
      batch: newStudent.batch,
      completedWorkshops: 0,
      status: "ACTIVE",
    };

    setStudents([created, ...students]);
    setIsAddOpen(false);
    setNewStudent({
      fullName: "",
      email: "",
      department: "Computer Science & Engineering",
      institution: "Anna University Campus Hub",
      batch: "Batch 3 - 2026",
    });
    onAuditLog?.(
      "Students",
      "Profile Creation",
      "Create",
      `Enrolled candidate ${created.fullName} (${created.dosId})`
    );
    onToast(`Enrolled ${created.fullName} (${created.dosId})`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
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

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>+ Enroll Student</span>
          </button>
        </div>
      </div>

      {/* Reusable Global Datatable Filter */}
      <GlobalTableFilter
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, DOS_ID or campus hub..."
        status={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: "ALL", label: "All Statuses" },
          { value: "ACTIVE", label: "Active" },
          { value: "DEFENSE_READY", label: "Defense Ready" },
          { value: "ON_LEAVE", label: "On Leave" },
          { value: "INACTIVE", label: "Inactive" },
        ]}
        secondary={batchFilter}
        onSecondaryChange={setBatchFilter}
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

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              onClick={() => handleBulkStatusUpdate("ACTIVE")}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 rounded font-semibold cursor-pointer"
            >
              Set Active
            </button>
            <button
              onClick={() => handleBulkStatusUpdate("DEFENSE_READY")}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 rounded font-semibold cursor-pointer"
            >
              Set Defense Ready
            </button>
            <button
              onClick={() => handleBulkStatusUpdate("INACTIVE")}
              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded font-semibold cursor-pointer"
            >
              Set Inactive
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 rounded font-semibold cursor-pointer flex items-center gap-1"
            >
              <TrashIcon className="w-3 h-3" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Students Datatable */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
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
                filtered.map((s) => {
                  const isSelected = selectedIds.has(s.id);
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
                              : "bg-slate-100 text-slate-600 border border-slate-300"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingStudent(s)}
                            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="Edit student"
                          >
                            <EditIcon className="w-3.5 h-3.5" />
                          </button>
                          <select
                            value={s.status}
                            onChange={(e) =>
                              handleStatusChange(
                                s.id,
                                e.target.value as StudentMember["status"],
                                s.fullName
                              )
                            }
                            className="border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-700 bg-white cursor-pointer"
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="DEFENSE_READY">DEFENSE_READY</option>
                            <option value="ON_LEAVE">ON_LEAVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                          </select>
                          <button
                            onClick={() => handleDelete(s.id, s.fullName)}
                            className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                            title="Delete student"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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
                <label className="font-semibold text-slate-700">Campus Hub:</label>
                <input
                  type="text"
                  required
                  value={newStudent.institution}
                  onChange={(e) => setNewStudent({ ...newStudent, institution: e.target.value })}
                  className="border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Department:</label>
                <input
                  type="text"
                  required
                  value={newStudent.department}
                  onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                  className="border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
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
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Enroll Candidate
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
                <label className="font-semibold text-slate-700">Campus Hub:</label>
                <input
                  type="text"
                  required
                  value={editingStudent.institution}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, institution: e.target.value })
                  }
                  className="border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Completed Workshops:</label>
                <input
                  type="number"
                  min="0"
                  max="27"
                  value={editingStudent.completedWorkshops}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      completedWorkshops: Number(e.target.value),
                    })
                  }
                  className="border border-slate-300 rounded-lg p-2"
                />
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
