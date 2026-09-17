"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ExpertMentor } from "@/lib/admin-data";
import { WORKSHOP_TOPICS_27 } from "@/lib/db";
import GlobalTableFilter from "./GlobalTableFilter";
import TablePagination from "./TablePagination";
import {
  AcademicCapIcon,
  TrashIcon,
  EditIcon,
  ExternalLinkIcon,
  MoreVerticalIcon,
  XIcon,
} from "@/components/Icons";

interface MentorsTabProps {
  experts: ExpertMentor[];
  setExperts: React.Dispatch<React.SetStateAction<ExpertMentor[]>>;
  onToast: (msg: string) => void;
  onAuditLog?: (
    category: "Students" | "Experts" | "Attendance" | "Certifications" | "System",
    subcategory: string,
    action: "Create" | "Update" | "Perform" | "Archive",
    sourceText: string
  ) => void;
}

// Master workshop options with codes and titles for autosuggest
const ALL_WORKSHOP_OPTIONS = WORKSHOP_TOPICS_27.map((topic, idx) => {
  const code = `WS-${String(idx + 1).padStart(2, "0")}`;
  return { code, label: `${code} - ${topic}` };
});

export default function MentorsTab({
  experts,
  setExperts,
  onToast,
  onAuditLog,
}: MentorsTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [domainFilter, setDomainFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"CARD" | "TABLE">("CARD");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openKebabId, setOpenKebabId] = useState<string | null>(null);

  // Upload states
  const [uploadingAddAvatar, setUploadingAddAvatar] = useState(false);
  const [uploadingEditAvatar, setUploadingEditAvatar] = useState(false);
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Workshop Autosuggest state
  const [addWorkshopInput, setAddWorkshopInput] = useState("");
  const [addWorkshopTags, setAddWorkshopTags] = useState<string[]>(["WS-14"]);
  const [addWorkshopShowSuggestions, setAddWorkshopShowSuggestions] = useState(false);

  const [editWorkshopInput, setEditWorkshopInput] = useState("");
  const [editWorkshopTags, setEditWorkshopTags] = useState<string[]>([]);
  const [editWorkshopShowSuggestions, setEditWorkshopShowSuggestions] = useState(false);

  // Domain Specialties tag state
  const [addDomainInput, setAddDomainInput] = useState("");
  const [addDomainTags, setAddDomainTags] = useState<string[]>(["Distributed Systems", "Fault Tolerance"]);
  const [editDomainInput, setEditDomainInput] = useState("");

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExpert, setEditingExpert] = useState<ExpertMentor | null>(null);

  // New Mentor Form State (All synchronized fields)
  const initialFormState = {
    fullName: "",
    email: "",
    organization: "",
    designation: "",
    bio: "",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    linkedinUrl: "",
    githubUrl: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  // Unique domains for filter
  const allDomains = Array.from(
    new Set(experts.flatMap((e) => e.domainSpecialties))
  );

  // Filter logic
  const filtered = experts.filter((exp) => {
    const matchesSearch =
      exp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      exp.email.toLowerCase().includes(search.toLowerCase()) ||
      exp.organization.toLowerCase().includes(search.toLowerCase()) ||
      exp.designation.toLowerCase().includes(search.toLowerCase()) ||
      exp.domainSpecialties.some((d) => d.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || exp.status === statusFilter;
    const matchesDomain =
      domainFilter === "ALL" || exp.domainSpecialties.includes(domainFilter);

    return matchesSearch && matchesStatus && matchesDomain;
  });

  const paginatedExperts = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Bulk actions
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
      setSelectedIds(new Set(filtered.map((e) => e.id)));
    }
  };

  const handleBulkStatus = (status: ExpertMentor["status"]) => {
    const count = selectedIds.size;
    if (count === 0) return;
    setExperts((prev) =>
      prev.map((e) => (selectedIds.has(e.id) ? { ...e, status } : e))
    );
    onAuditLog?.(
      "Experts",
      "Status Management",
      "Update",
      `Bulk updated ${count} expert mentor(s) to ${status}`
    );
    setSelectedIds(new Set());
    onToast(`Updated ${count} mentor(s) to ${status}`);
  };

  // Single actions
  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete mentor profile for "${name}"?`)) return;
    setExperts((prev) => prev.filter((e) => e.id !== id));
    onAuditLog?.(
      "Experts",
      "Mentor Deletion",
      "Archive",
      `Deleted expert mentor ${name}`
    );
    onToast(`Deleted expert mentor: ${name}`);
  };

  const handleToggleStatus = (
    id: string,
    status: ExpertMentor["status"],
    name: string
  ) => {
    setExperts((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
    onAuditLog?.(
      "Experts",
      "Status Update",
      "Update",
      `Changed status of ${name} to ${status}`
    );
    onToast(`${name} is now ${status}`);
  };

  // File upload handler for Avatar
  const handleAvatarFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "ADD" | "EDIT"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (target === "ADD") setUploadingAddAvatar(true);
    else setUploadingEditAvatar(true);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("type", "avatar");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const json = await res.json();
      if (res.ok && json.url) {
        if (target === "ADD") {
          setFormData((prev) => ({ ...prev, avatar: json.url }));
        } else if (editingExpert) {
          setEditingExpert((prev) => (prev ? { ...prev, avatar: json.url } : null));
        }
        onToast("Profile picture uploaded successfully!");
      } else {
        onToast(`Upload failed: ${json.error || "Unknown error"}`);
      }
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      onToast("Failed to upload profile picture.");
    } finally {
      if (target === "ADD") setUploadingAddAvatar(false);
      else setUploadingEditAvatar(false);
    }
  };

  const handleOpenEditModal = (exp: ExpertMentor) => {
    setEditingExpert(exp);
    setEditWorkshopTags(exp.assignedWorkshops || []);
    setEditWorkshopInput("");
    setOpenKebabId(null);
  };

  const handleCreateMentor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) return;

    const created: ExpertMentor = {
      id: `exp-${String(experts.length + 1).padStart(3, "0")}`,
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      organization: formData.organization.trim() || "Independent Industry Expert",
      designation: formData.designation.trim() || "Systems Mentor",
      bio: formData.bio.trim() || "Experienced systems engineer mentoring in DOS Club.",
      avatar:
        formData.avatar.trim() ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      linkedinUrl: formData.linkedinUrl.trim(),
      githubUrl: formData.githubUrl.trim(),
      domainSpecialties: addDomainTags.length > 0
        ? addDomainTags
        : ["Distributed Systems", "Fault Tolerance"],
      assignedWorkshops: addWorkshopTags,
      status: "ACTIVE",
    };

    setExperts([created, ...experts]);
    setIsAddOpen(false);
    setFormData(initialFormState);
    setAddWorkshopTags(["WS-14"]);
    setAddDomainTags(["Distributed Systems", "Fault Tolerance"]);
    onAuditLog?.(
      "Experts",
      "Mentor Registration",
      "Create",
      `Registered Expert Mentor ${created.fullName} (${created.organization})`
    );
    onToast(`Registered ${created.fullName} • Profile & calendar ready!`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpert) return;

    const updated: ExpertMentor = {
      ...editingExpert,
      assignedWorkshops: editWorkshopTags,
    };

    setExperts((prev) =>
      prev.map((exp) => (exp.id === updated.id ? updated : exp))
    );
    onAuditLog?.(
      "Experts",
      "Mentor Update",
      "Update",
      `Updated expert profile for ${updated.fullName}`
    );
    onToast(`Saved changes for ${updated.fullName}`);
    setEditingExpert(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider mb-1.5 font-mono">
            <AcademicCapIcon className="w-3 h-3" />
            <span>Technical Expert Faculty</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Expert Mentors Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Systems faculty, kernel researchers, and industry specialists leading cohort workshops.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode("CARD")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === "CARD"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Card View
            </button>
            <button
              onClick={() => setViewMode("TABLE")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === "TABLE"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Table View
            </button>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>+ Add Mentor</span>
          </button>
        </div>
      </div>

      {/* Reusable Global Filter Bar */}
      <GlobalTableFilter
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by mentor name, company, designation, or domain tags..."
        status={statusFilter}
        onStatusChange={(val) => {
          setStatusFilter(val);
          setCurrentPage(1);
        }}
        statusOptions={[
          { value: "ALL", label: "All Statuses" },
          { value: "ACTIVE", label: "Active" },
          { value: "STANDBY", label: "Standby" },
          { value: "INACTIVE", label: "Inactive" },
        ]}
        secondary={domainFilter}
        onSecondaryChange={(val) => {
          setDomainFilter(val);
          setCurrentPage(1);
        }}
        secondaryLabel="All Domains"
        secondaryOptions={allDomains.map((d) => ({ value: d, label: d }))}
        totalCount={experts.length}
        filteredCount={filtered.length}
        onClear={() => {
          setSearch("");
          setStatusFilter("ALL");
          setDomainFilter("ALL");
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
              Mentor(s) Selected
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <button
              onClick={() => handleBulkStatus("ACTIVE")}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 rounded font-semibold cursor-pointer"
            >
              Set Active
            </button>
            <button
              onClick={() => handleBulkStatus("STANDBY")}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 rounded font-semibold cursor-pointer"
            >
              Set Standby
            </button>
            <button
              onClick={() => handleBulkStatus("INACTIVE")}
              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded font-semibold cursor-pointer"
            >
              Set Inactive
            </button>
          </div>
        </div>
      )}

      {/* RENDER VIEW 1: CARD / GRID VIEW */}
      {viewMode === "CARD" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-2 p-8 text-center text-slate-400 font-mono text-xs bg-white border border-slate-200 rounded-xl">
              NO_MENTORS_MATCHING_FILTER
            </div>
          ) : (
            paginatedExperts.map((exp) => {
              const isSelected = selectedIds.has(exp.id);
              return (
                <div
                  key={exp.id}
                  className={`bg-white border rounded-2xl p-5 shadow-2xs flex flex-col justify-between gap-4 transition-all ${
                    isSelected
                      ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50/10"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* Card Header with Photo & Meta */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(exp.id)}
                        className="w-4 h-4 rounded text-blue-600 cursor-pointer mt-1"
                        aria-label={`Select ${exp.fullName}`}
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={exp.avatar}
                        alt={exp.fullName}
                        className="h-12 w-12 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                      />
                      <div className="flex flex-col">
                        <h3 className="font-bold text-sm text-slate-900">
                          {exp.fullName}
                        </h3>
                        <span className="text-xs font-medium text-slate-700">
                          {exp.designation || "Systems Mentor"}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {exp.organization}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {exp.email}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        exp.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : exp.status === "STANDBY"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-slate-100 text-slate-600 border border-slate-300"
                      }`}
                    >
                      {exp.status}
                    </span>
                  </div>

                  {/* Bio Paragraph */}
                  {exp.bio && (
                    <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                      &ldquo;{exp.bio}&rdquo;
                    </p>
                  )}

                  {/* Domain Specialties */}
                  <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Domain Specialties:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {exp.domainSpecialties.map((spec, i) => (
                        <span
                          key={i}
                          className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer with Assigned Workshops & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="font-semibold text-slate-800">Assigned:</span>
                      <span className="font-mono text-xs font-bold text-[#E25C38]">
                        {exp.assignedWorkshops.join(", ") || "Standby"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {exp.linkedinUrl && (
                        <a
                          href={exp.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-600 hover:underline font-semibold"
                        >
                          LinkedIn &rarr;
                        </a>
                      )}
                      <button
                        onClick={() => handleOpenEditModal(exp)}
                        className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Edit mentor"
                      >
                        <EditIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id, exp.fullName)}
                        className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                        title="Delete mentor"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        href="/trainer"
                        className="text-xs font-semibold text-slate-800 hover:text-blue-600 transition-colors ml-1"
                      >
                        Cockpit &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* RENDER VIEW 2: HIGH-DENSITY TABLE VIEW */}
      {viewMode === "TABLE" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="overflow-visible rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filtered.length && filtered.length > 0}
                      onChange={handleSelectAll}
                      className="w-3.5 h-3.5 rounded text-blue-600 cursor-pointer"
                    />
                  </th>
                  <th className="p-3">Mentor / Faculty</th>
                  <th className="p-3">Organization &amp; Role</th>
                  <th className="p-3">Specialized Domains</th>
                  <th className="p-3">Assigned Workshops</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-mono text-xs">
                      NO_MENTORS_MATCHING_FILTER
                    </td>
                  </tr>
                ) : (
                  paginatedExperts.map((exp, idx, arr) => {
                    const isNearBottom = idx >= arr.length - 2;
                    return (
                      <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(exp.id)}
                            onChange={() => handleToggleSelect(exp.id)}
                            className="w-3.5 h-3.5 rounded text-blue-600 cursor-pointer"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={exp.avatar}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{exp.fullName}</span>
                              <span className="text-[11px] text-slate-400">{exp.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-800">{exp.designation || "Systems Mentor"}</span>
                            <span className="text-[11px] text-slate-500">{exp.organization}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {exp.domainSpecialties.map((s, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-medium text-slate-700"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 font-mono text-xs font-bold text-[#E25C38]">
                          {exp.assignedWorkshops.join(", ")}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              exp.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : exp.status === "STANDBY"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-slate-100 text-slate-600 border border-slate-300"
                            }`}
                          >
                            {exp.status}
                          </span>
                        </td>
                        {/* Minimalist 3-dot Kebab Menu */}
                        <td className="p-3 text-right relative">
                          <button
                            onClick={() => setOpenKebabId(openKebabId === exp.id ? null : exp.id)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                            aria-label="Actions"
                          >
                            <MoreVerticalIcon className="w-4 h-4" />
                          </button>

                          {openKebabId === exp.id && (
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
                                <button
                                  onClick={() => handleOpenEditModal(exp)}
                                  className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <span>Edit Expert Profile</span>
                                </button>
                                <Link
                                  href="/trainer"
                                  target="_blank"
                                  className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer font-medium"
                                  onClick={() => setOpenKebabId(null)}
                                >
                                  <span>View Trainer Cockpit</span>
                                  <ExternalLinkIcon className="w-3 h-3 text-slate-400" />
                                </Link>
                                {exp.linkedinUrl && (
                                  <a
                                    href={exp.linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer font-medium"
                                    onClick={() => setOpenKebabId(null)}
                                  >
                                    <span>LinkedIn Profile</span>
                                    <ExternalLinkIcon className="w-3 h-3 text-slate-400" />
                                  </a>
                                )}
                                <div className="border-t border-slate-100 my-1" />
                                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Set Status
                                </div>
                                {(["ACTIVE", "STANDBY", "INACTIVE"] as const).map((st) => (
                                  <button
                                    key={st}
                                    onClick={() => {
                                      handleToggleStatus(exp.id, st, exp.fullName);
                                      setOpenKebabId(null);
                                    }}
                                    className={`w-full px-3 py-1 text-left flex items-center justify-between cursor-pointer ${
                                      exp.status === st
                                        ? "text-[#E25C38] font-bold bg-orange-50/50"
                                        : "text-slate-600 hover:bg-slate-50"
                                    }`}
                                  >
                                    <span>{st}</span>
                                    {exp.status === st && <span className="text-xs">&bull;</span>}
                                  </button>
                                ))}
                                <div className="border-t border-slate-100 my-1" />
                                <button
                                  onClick={() => {
                                    setOpenKebabId(null);
                                    handleDelete(exp.id, exp.fullName);
                                  }}
                                  className="w-full px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-semibold"
                                >
                                  <span>Delete Expert</span>
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
        </div>
      )}

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

      {/* SYNCHRONIZED ADD MENTOR MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Register Technical Expert Mentor
                </h2>
                <p className="text-xs text-slate-500">
                  Add systems faculty with complete background, credentials, and domain tags.
                </p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMentor} className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Full Name:</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Ramesh Chandran"
                    className="border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Email Address:</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ramesh@systems.org"
                    className="border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Company / Organization:</label>
                  <input
                    type="text"
                    required
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="e.g. Cloudflare / DeScience Labs"
                    className="border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Designation / Title:</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Staff Systems Architect"
                    className="border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-800"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Short Professional Bio:</label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Summary of engineering background, research focus, or industry leadership..."
                  className="border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">LinkedIn Profile URL:</label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">GitHub Profile URL:</label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/username"
                    className="border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Domain Specialties Tag Input */}
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Domain Specialties:</label>
                  <div className="border border-slate-300 rounded-lg p-1.5 focus-within:ring-1 focus-within:ring-slate-800 bg-white min-h-[38px] flex flex-wrap items-center gap-1.5">
                    {addDomainTags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-medium rounded-md">
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => setAddDomainTags(addDomainTags.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={addDomainInput}
                      onChange={(e) => setAddDomainInput(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.key === "Enter" || e.key === ",") && addDomainInput.trim()) {
                          e.preventDefault();
                          const val = addDomainInput.replace(/,/g, "").trim();
                          if (val && !addDomainTags.includes(val)) {
                            setAddDomainTags([...addDomainTags, val]);
                          }
                          setAddDomainInput("");
                        }
                      }}
                      placeholder={addDomainTags.length === 0 ? "Type specialty & hit Enter..." : "Add..."}
                      className="flex-1 min-w-[80px] bg-transparent outline-none text-xs"
                    />
                  </div>
                </div>

                {/* Assigned Workshops Tag Input with Autosuggest */}
                <div className="flex flex-col gap-1 relative">
                  <label className="font-semibold text-slate-700 flex items-center justify-between">
                    <span>Assigned Workshops:</span>
                    <span className="text-[10px] text-slate-400 font-normal">Select or type code</span>
                  </label>
                  <div className="border border-slate-300 rounded-lg p-1.5 focus-within:ring-1 focus-within:ring-slate-800 bg-white min-h-[38px] flex flex-wrap items-center gap-1.5">
                    {addWorkshopTags.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 border border-orange-200 text-[#E25C38] text-[11px] font-mono font-bold rounded-md">
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => setAddWorkshopTags(addWorkshopTags.filter((_, i) => i !== idx))}
                          className="text-orange-400 hover:text-orange-700"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={addWorkshopInput}
                      onFocus={() => setAddWorkshopShowSuggestions(true)}
                      onChange={(e) => {
                        setAddWorkshopInput(e.target.value);
                        setAddWorkshopShowSuggestions(true);
                      }}
                      onKeyDown={(e) => {
                        if ((e.key === "Enter" || e.key === ",") && addWorkshopInput.trim()) {
                          e.preventDefault();
                          const val = addWorkshopInput.replace(/,/g, "").trim().toUpperCase();
                          if (val && !addWorkshopTags.includes(val)) {
                            setAddWorkshopTags([...addWorkshopTags, val]);
                          }
                          setAddWorkshopInput("");
                          setAddWorkshopShowSuggestions(false);
                        }
                      }}
                      placeholder={addWorkshopTags.length === 0 ? "Search workshop..." : "+ Add"}
                      className="flex-1 min-w-[70px] bg-transparent outline-none text-xs font-mono"
                    />
                  </div>

                  {/* Autosuggest Dropdown */}
                  {addWorkshopShowSuggestions && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setAddWorkshopShowSuggestions(false)} />
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-44 overflow-y-auto p-1">
                        {ALL_WORKSHOP_OPTIONS.filter(
                          (w) =>
                            w.code.toLowerCase().includes(addWorkshopInput.toLowerCase()) ||
                            w.label.toLowerCase().includes(addWorkshopInput.toLowerCase())
                        ).slice(0, 8).map((w) => {
                          const isSelected = addWorkshopTags.includes(w.code);
                          return (
                            <button
                              key={w.code}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setAddWorkshopTags(addWorkshopTags.filter((t) => t !== w.code));
                                } else {
                                  setAddWorkshopTags([...addWorkshopTags, w.code]);
                                }
                                setAddWorkshopInput("");
                                setAddWorkshopShowSuggestions(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                                isSelected ? "bg-orange-50 text-[#E25C38] font-bold" : "hover:bg-slate-50 text-slate-700"
                              }`}
                            >
                              <span className="truncate pr-2">{w.label}</span>
                              <span className="font-mono text-[10px]">{isSelected ? "✓ Added" : "+ Add"}</span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Profile Picture Upload & Preview */}
              <div className="flex flex-col gap-1.5 pt-1">
                <label className="font-semibold text-slate-700">Faculty Profile Picture:</label>
                <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.avatar}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover border border-slate-300 shadow-2xs shrink-0"
                  />
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <input
                        ref={addFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleAvatarFileUpload(e, "ADD")}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => addFileInputRef.current?.click()}
                        disabled={uploadingAddAvatar}
                        className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                      >
                        {uploadingAddAvatar ? "Uploading..." : "📷 Upload Profile Picture"}
                      </button>
                    </div>
                    <input
                      type="url"
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      placeholder="Or paste image URL (https://...)"
                      className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-[11px] text-slate-600 outline-none"
                    />
                  </div>
                </div>
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
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Register Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MENTOR MODAL */}
      {editingExpert && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Edit Faculty: {editingExpert.fullName}
                </h2>
                <p className="text-xs text-slate-500">
                  Update credentials and assigned workshops.
                </p>
              </div>
              <button
                onClick={() => setEditingExpert(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Full Name:</label>
                  <input
                    type="text"
                    required
                    value={editingExpert.fullName}
                    onChange={(e) =>
                      setEditingExpert({ ...editingExpert, fullName: e.target.value })
                    }
                    className="border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Email Address:</label>
                  <input
                    type="email"
                    required
                    value={editingExpert.email}
                    onChange={(e) =>
                      setEditingExpert({ ...editingExpert, email: e.target.value })
                    }
                    className="border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Designation / Title:</label>
                <input
                  type="text"
                  required
                  value={editingExpert.designation || ""}
                  onChange={(e) =>
                    setEditingExpert({ ...editingExpert, designation: e.target.value })
                  }
                  className="border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Bio:</label>
                <textarea
                  rows={2}
                  value={editingExpert.bio || ""}
                  onChange={(e) =>
                    setEditingExpert({ ...editingExpert, bio: e.target.value })
                  }
                  className="border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Company / Org:</label>
                  <input
                    type="text"
                    required
                    value={editingExpert.organization}
                    onChange={(e) =>
                      setEditingExpert({ ...editingExpert, organization: e.target.value })
                    }
                    className="border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Status:</label>
                  <select
                    value={editingExpert.status}
                    onChange={(e) =>
                      setEditingExpert({
                        ...editingExpert,
                        status: e.target.value as ExpertMentor["status"],
                      })
                    }
                    className="border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="STANDBY">STANDBY</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              {/* Assigned Workshops Tag Input with Autosuggest */}
              <div className="flex flex-col gap-1 relative">
                <label className="font-semibold text-slate-700 flex items-center justify-between">
                  <span>Assigned Workshops:</span>
                  <span className="text-[10px] text-slate-400 font-normal">Select or type code</span>
                </label>
                <div className="border border-slate-300 rounded-lg p-1.5 focus-within:ring-1 focus-within:ring-slate-800 bg-white min-h-[38px] flex flex-wrap items-center gap-1.5">
                  {editWorkshopTags.map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 border border-orange-200 text-[#E25C38] text-[11px] font-mono font-bold rounded-md">
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => setEditWorkshopTags(editWorkshopTags.filter((_, i) => i !== idx))}
                        className="text-orange-400 hover:text-orange-700"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={editWorkshopInput}
                    onFocus={() => setEditWorkshopShowSuggestions(true)}
                    onChange={(e) => {
                      setEditWorkshopInput(e.target.value);
                      setEditWorkshopShowSuggestions(true);
                    }}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === ",") && editWorkshopInput.trim()) {
                        e.preventDefault();
                        const val = editWorkshopInput.replace(/,/g, "").trim().toUpperCase();
                        if (val && !editWorkshopTags.includes(val)) {
                          setEditWorkshopTags([...editWorkshopTags, val]);
                        }
                        setEditWorkshopInput("");
                        setEditWorkshopShowSuggestions(false);
                      }
                    }}
                    placeholder={editWorkshopTags.length === 0 ? "Search workshop..." : "+ Add"}
                    className="flex-1 min-w-[70px] bg-transparent outline-none text-xs font-mono"
                  />
                </div>

                {/* Autosuggest Dropdown */}
                {editWorkshopShowSuggestions && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setEditWorkshopShowSuggestions(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-44 overflow-y-auto p-1">
                      {ALL_WORKSHOP_OPTIONS.filter(
                        (w) =>
                          w.code.toLowerCase().includes(editWorkshopInput.toLowerCase()) ||
                          w.label.toLowerCase().includes(editWorkshopInput.toLowerCase())
                      ).slice(0, 8).map((w) => {
                        const isSelected = editWorkshopTags.includes(w.code);
                        return (
                          <button
                            key={w.code}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setEditWorkshopTags(editWorkshopTags.filter((t) => t !== w.code));
                              } else {
                                setEditWorkshopTags([...editWorkshopTags, w.code]);
                              }
                              setEditWorkshopInput("");
                              setEditWorkshopShowSuggestions(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                              isSelected ? "bg-orange-50 text-[#E25C38] font-bold" : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <span className="truncate pr-2">{w.label}</span>
                            <span className="font-mono text-[10px]">{isSelected ? "✓ Added" : "+ Add"}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Profile Picture Upload & Preview */}
              <div className="flex flex-col gap-1.5 pt-1">
                <label className="font-semibold text-slate-700">Faculty Profile Picture:</label>
                <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={editingExpert.avatar}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover border border-slate-300 shadow-2xs shrink-0"
                  />
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleAvatarFileUpload(e, "EDIT")}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        disabled={uploadingEditAvatar}
                        className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                      >
                        {uploadingEditAvatar ? "Uploading..." : "📷 Upload Profile Picture"}
                      </button>
                    </div>
                    <input
                      type="url"
                      value={editingExpert.avatar}
                      onChange={(e) => setEditingExpert({ ...editingExpert, avatar: e.target.value })}
                      placeholder="Or paste image URL (https://...)"
                      className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-[11px] text-slate-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingExpert(null)}
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
