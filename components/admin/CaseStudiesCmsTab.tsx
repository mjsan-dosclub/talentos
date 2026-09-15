"use client";

import React, { useState, useEffect } from "react";
import { CaseStudy } from "@/lib/casestudies";
import TablePagination from "./TablePagination";
import {
  SparklesIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  UserIcon,
  BuildingIcon,
  ShieldCheckIcon,
  TrashIcon,
  EditIcon,
  MoreVerticalIcon,
} from "@/components/Icons";

interface CaseStudiesCmsTabProps {
  onCountChange?: (count: number) => void;
  onAuditLog?: (
    category: "Students" | "Experts" | "Attendance" | "Certifications" | "System",
    subcategory: string,
    action: "Create" | "Update" | "Perform" | "Archive",
    sourceText: string
  ) => void;
}

export default function CaseStudiesCmsTab({ onCountChange, onAuditLog }: CaseStudiesCmsTabProps = {}) {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [notification, setNotification] = useState<string | null>(null);
  const [selectedStudyIds, setSelectedStudyIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(9);
  const [openKebabId, setOpenKebabId] = useState<string | null>(null);

  // Form State
  const initialFormState = {
    title: "",
    slug: "",
    subtitle: "",
    shortDescription: "",
    category: "Distributed Systems" as CaseStudy["category"],
    badge: "SYSTEMS POD ALPHA",
    summary: "",
    fullStoryText: "",
    systemAudited: "SYS-04: Distributed Consensus State Machine",
    defenseStatus: "PASSED_WITH_DISTINCTION" as CaseStudy["defenseStatus"],
    studentName: "",
    studentDosId: "DOS-B3-001",
    studentRole: "Systems Pod Alpha • Kernel Auditor",
    studentCollege: "Anna University Chennai",
    studentTrack: "Systems Engineering",
    studentAvatar: "/images/students/student-1.jpg",
    readTime: "5 min read",
    coverImage: "/images/students/student-workshop-build.jpg",
    bannerImage: "/images/students/student-workshop-build.jpg",
    socialShareImage: "/images/students/student-workshop-build.jpg",
    metaTitle: "",
    metaKeywords: "rust, distributed systems, posix, talentos, descience",
    tagsText: "Rust, Raft, Distributed Systems",
    metricsList: [
      { label: "Throughput", value: "10,240 RPS" },
      { label: "Defense Score", value: "98.4 / 100" },
    ],
    status: "PUBLISHED" as "PUBLISHED" | "DRAFT",
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchStudies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/casestudies");
      const data = await res.json();
      if (data.success) {
        const list = data.casestudies || [];
        setCaseStudies(list);
        if (onCountChange) {
          onCountChange(list.length);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudies();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (study: CaseStudy) => {
    setEditingId(study.id);
    setFormData({
      title: study.title,
      slug: study.slug,
      subtitle: study.subtitle || "",
      shortDescription: study.shortDescription || study.summary || "",
      category: study.category,
      badge: study.badge || "SYSTEMS POD ALPHA",
      summary: study.summary,
      fullStoryText: Array.isArray(study.fullStory) ? study.fullStory.join("\n\n") : "",
      systemAudited: study.systemAudited,
      defenseStatus: study.defenseStatus,
      studentName: study.student.name,
      studentDosId: study.student.dos_id,
      studentRole: study.student.role,
      studentCollege: study.student.college,
      studentTrack: study.student.track,
      studentAvatar: study.student.avatar,
      readTime: study.readTime,
      coverImage: study.coverImage,
      bannerImage: study.bannerImage || study.coverImage,
      socialShareImage: study.socialShareImage || study.coverImage,
      metaTitle: study.metaTitle || study.title,
      metaKeywords: study.metaKeywords || (study.tags ? study.tags.join(", ") : ""),
      tagsText: study.tags ? study.tags.join(", ") : "",
      metricsList: study.metrics && study.metrics.length > 0 ? study.metrics : [
        { label: "Throughput", value: "10,240 RPS" },
      ],
      status: study.status || "PUBLISHED",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete case study "${title}"?`)) return;
    try {
      const res = await fetch(`/api/casestudies?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setNotification(`Deleted case study: "${title}"`);
        onAuditLog?.(
          "Students",
          "Case Studies CMS",
          "Archive",
          `Deleted student case study: ${title} (${id})`
        );
        const next = new Set(selectedStudyIds);
        next.delete(id);
        setSelectedStudyIds(next);
        fetchStudies();
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleToggleStatus = async (study: CaseStudy) => {
    const newStatus = study.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch("/api/casestudies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: study.id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification(`Updated "${study.title}" status to ${newStatus}`);
        onAuditLog?.(
          "Students",
          "Case Studies CMS",
          "Update",
          `Toggled status of "${study.title}" to ${newStatus}`
        );
        fetchStudies();
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Selection Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedStudyIds(new Set(filteredStudies.map((s) => s.id)));
    } else {
      setSelectedStudyIds(new Set());
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedStudyIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedStudyIds(next);
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (selectedStudyIds.size === 0) return;
    if (!confirm(`Delete ${selectedStudyIds.size} case studies?`)) return;

    setBulkProcessing(true);
    try {
      for (const id of Array.from(selectedStudyIds)) {
        await fetch(`/api/casestudies?id=${id}`, { method: "DELETE" });
      }
      setNotification(`Successfully deleted ${selectedStudyIds.size} case studies.`);
      onAuditLog?.(
        "Students",
        "Case Studies CMS",
        "Archive",
        `Bulk deleted ${selectedStudyIds.size} student case studies`
      );
      setSelectedStudyIds(new Set());
      fetchStudies();
      setTimeout(() => setNotification(null), 3500);
    } catch (err: any) {
      alert("Bulk delete error: " + err.message);
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkStatus = async (status: "PUBLISHED" | "DRAFT") => {
    if (selectedStudyIds.size === 0) return;

    setBulkProcessing(true);
    try {
      for (const id of Array.from(selectedStudyIds)) {
        await fetch("/api/casestudies", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status }),
        });
      }
      setNotification(`Updated ${selectedStudyIds.size} case studies to ${status}.`);
      onAuditLog?.(
        "Students",
        "Case Studies CMS",
        "Update",
        `Bulk updated ${selectedStudyIds.size} case studies to ${status}`
      );
      setSelectedStudyIds(new Set());
      fetchStudies();
      setTimeout(() => setNotification(null), 3500);
    } catch (err: any) {
      alert("Bulk status error: " + err.message);
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      slug:
        formData.slug ||
        formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      subtitle: formData.subtitle || formData.title,
      shortDescription: formData.shortDescription,
      category: formData.category,
      badge: formData.badge,
      summary: formData.summary,
      fullStory: formData.fullStoryText.split("\n\n").filter((p) => p.trim().length > 0),
      systemAudited: formData.systemAudited,
      defenseStatus: formData.defenseStatus,
      metrics: formData.metricsList,
      student: {
        name: formData.studentName,
        dos_id: formData.studentDosId,
        role: formData.studentRole,
        college: formData.studentCollege,
        track: formData.studentTrack,
        avatar: formData.studentAvatar,
      },
      publishedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      readTime: formData.readTime,
      coverImage: formData.coverImage,
      bannerImage: formData.bannerImage,
      socialShareImage: formData.socialShareImage,
      metaTitle: formData.metaTitle || formData.title,
      metaKeywords: formData.metaKeywords,
      tags: formData.tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      commitHash: `b3-${Math.random().toString(36).substring(2, 7)}`,
      status: formData.status,
    };

    try {
      let res;
      if (editingId) {
        res = await fetch("/api/casestudies", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...payload }),
        });
      } else {
        res = await fetch("/api/casestudies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (data.success) {
        setNotification(editingId ? "Case study updated successfully!" : "New case study created and published!");
        onAuditLog?.(
          "Students",
          "Case Studies CMS",
          editingId ? "Update" : "Create",
          `${editingId ? "Updated" : "Authored"} case study: "${formData.title}" (${formData.status})`
        );
        setIsModalOpen(false);
        fetchStudies();
        setTimeout(() => setNotification(null), 3000);
      } else {
        alert(data.error || "Failed to save case study");
      }
    } catch (err: any) {
      alert("Error saving case study: " + err.message);
    }
  };

  const filteredStudies = caseStudies.filter((cs) => {
    if (filterStatus === "PUBLISHED") return cs.status === "PUBLISHED" || !cs.status;
    if (filterStatus === "DRAFT") return cs.status === "DRAFT";
    return true;
  });

  const isAllSelected =
    filteredStudies.length > 0 &&
    filteredStudies.every((cs) => selectedStudyIds.has(cs.id));

  return (
    <div className="space-y-6 font-['Poppins',sans-serif]">
      {/* Top Banner Alert */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header and Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#FF715B]/10 text-[#FF715B] text-[10px] font-bold uppercase tracking-wider mb-2">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>Editorial &amp; Student Achievements Engine</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Case Studies &amp; Technical Blog CMS
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Empower students to write and publish in-depth architectural breakthroughs, zero-grace peer defense logs, and system audits. Synchronizes to main DOS website and triggers social media sharing.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleSelectAll}
              className="rounded border-slate-300 text-[#3772FF] focus:ring-[#3772FF]"
            />
            <span>Select All</span>
          </label>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => {
                setFilterStatus("ALL");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterStatus === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
              }`}
            >
              All ({caseStudies.length})
            </button>
            <button
              onClick={() => {
                setFilterStatus("PUBLISHED");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterStatus === "PUBLISHED" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
              }`}
            >
              Published
            </button>
            <button
              onClick={() => {
                setFilterStatus("DRAFT");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filterStatus === "DRAFT" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
              }`}
            >
              Drafts
            </button>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#3772FF] hover:bg-[#285cdb] text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>Write New Case Study</span>
          </button>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedStudyIds.size > 0 && (
        <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg border border-slate-800 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-2 py-0.5 rounded-full bg-[#3772FF] text-white text-[11px] font-bold font-mono">
              {selectedStudyIds.size}
            </span>
            <span>Case Studies Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatus("PUBLISHED")}
              disabled={bulkProcessing}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Bulk Publish
            </button>
            <button
              onClick={() => handleBulkStatus("DRAFT")}
              disabled={bulkProcessing}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold rounded-xl transition-all"
            >
              Bulk Move to Draft
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkProcessing}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1"
            >
              <TrashIcon className="w-3.5 h-3.5" />
              <span>Bulk Delete</span>
            </button>
            <button
              onClick={() => setSelectedStudyIds(new Set())}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Case Studies Grid / Cards */}
      {filteredStudies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 font-mono text-xs">
          NO_CASE_STUDIES_FOUND
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(() => {
            const paginatedStudies = filteredStudies.slice(
              (currentPage - 1) * pageSize,
              currentPage * pageSize
            );
            return paginatedStudies.map((study, idx) => {
              const isNearBottom = idx >= paginatedStudies.length - 3;
              return (
                <div
                  key={study.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative"
                >
                  <div>
                    {/* Header Image / Badge */}
                    <div className="relative h-40 bg-slate-900 overflow-hidden">
                      <img
                        src={study.bannerImage || study.coverImage || "/images/students/student-workshop-build.jpg"}
                        alt={study.title}
                        className="w-full h-full object-cover opacity-60"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-[#181A20]/80 backdrop-blur-xs text-white font-mono text-[9px] font-bold border border-white/10">
                          {study.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            study.status === "DRAFT"
                              ? "bg-amber-400 text-slate-900"
                              : "bg-emerald-500 text-white"
                          }`}
                        >
                          {study.status || "PUBLISHED"}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <input
                          type="checkbox"
                          checked={selectedStudyIds.has(study.id)}
                          onChange={() => handleToggleSelect(study.id)}
                          className="w-4 h-4 rounded border-white/40 bg-white/20 text-[#3772FF] focus:ring-[#3772FF] cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="text-[10px] font-mono text-[#3772FF] font-semibold mb-1">
                        {study.systemAudited}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                        {study.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                        {study.shortDescription || study.summary}
                      </p>

                      {/* Author Info */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2.5">
                        <img
                          src={study.student.avatar || "/images/students/student-1.jpg"}
                          alt={study.student.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            {study.student.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {study.student.college} &bull; {study.publishedAt}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs relative">
                    <button
                      onClick={() => handleToggleStatus(study)}
                      className={`font-semibold text-[11px] cursor-pointer ${
                        study.status === "DRAFT"
                          ? "text-emerald-600 hover:text-emerald-700"
                          : "text-amber-600 hover:text-amber-700"
                      }`}
                    >
                      {study.status === "DRAFT" ? "Publish to Web" : "Move to Draft"}
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => setOpenKebabId(openKebabId === study.id ? null : study.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
                        aria-label="Actions"
                      >
                        <MoreVerticalIcon className="w-4 h-4" />
                      </button>

                      {openKebabId === study.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenKebabId(null)}
                          />
                          <div
                            className={`absolute right-0 ${
                              isNearBottom ? "bottom-full mb-1" : "top-8"
                            } w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-left text-xs animate-in fade-in zoom-in-95 duration-100`}
                          >
                            <button
                              onClick={() => {
                                handleOpenEdit(study);
                                setOpenKebabId(null);
                              }}
                              className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer font-medium"
                            >
                              <span>Edit Case Study</span>
                              <EditIcon className="w-3.5 h-3.5 text-slate-400" />
                            </button>

                            <a
                              href={`/casestudies/${study.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer font-medium"
                              onClick={() => setOpenKebabId(null)}
                            >
                              <span>View Live Article</span>
                              <ExternalLinkIcon className="w-3.5 h-3.5 text-slate-400" />
                            </a>

                            <div className="border-t border-slate-100 my-1" />

                            <button
                              onClick={() => {
                                handleToggleStatus(study);
                                setOpenKebabId(null);
                              }}
                              className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer font-medium"
                            >
                              <span>{study.status === "DRAFT" ? "Publish to Web" : "Move to Draft"}</span>
                              <span className="text-xs">&bull;</span>
                            </button>

                            <div className="border-t border-slate-100 my-1" />

                            <button
                              onClick={() => {
                                handleDelete(study.id, study.title);
                                setOpenKebabId(null);
                              }}
                              className="w-full px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-semibold"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                              <span>Delete Case Study</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* Table Pagination */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredStudies.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[6, 9, 18, 36]}
        />
      </div>

      {/* Create / Edit Case Study Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl border border-slate-200 shadow-2xl p-6 relative animate-fadeIn my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FF715B]/10 text-[#FF715B] flex items-center justify-center">
                  <SparklesIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingId ? "Edit Case Study" : "Author New Student Case Study & Blog"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Publish architectural breakdowns, peer defense scores, and social metadata.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Case Study Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. How Siddharth Built a 10,000 RPS Distributed Raft Engine in Rust"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Slug / URL Path
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="siddharth-raft-consensus-engine"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Subtitle & Short Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subtitle / Catchphrase
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Zero-grace peer defense under live chaos failure injections"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Short Description (Social Previews &amp; Carousel)
                  </label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="One-line breakdown of the breakthrough"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Category, Status & Read Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category Track
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                  >
                    <option value="Distributed Systems">Distributed Systems</option>
                    <option value="AI & Runtimes">AI &amp; Runtimes</option>
                    <option value="Storage & Compaction">Storage &amp; Compaction</option>
                    <option value="Security & Protocols">Security &amp; Protocols</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                  >
                    <option value="PUBLISHED">Published (Visible to All)</option>
                    <option value="DRAFT">Draft (Internal Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Read Time
                  </label>
                  <input
                    type="text"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    placeholder="5 min read"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Student Author */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-[#3772FF]" />
                  <span>Student Author Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Student Name *
                    </label>
                    <input
                      type="text"
                      value={formData.studentName}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      placeholder="e.g. Enter your name"
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-1 focus:ring-[#3772FF] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      DOS Student ID
                    </label>
                    <input
                      type="text"
                      value={formData.studentDosId}
                      onChange={(e) => setFormData({ ...formData, studentDosId: e.target.value })}
                      placeholder="e.g. Enter DOS ID"
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-mono focus:ring-1 focus:ring-[#3772FF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      College / Institution
                    </label>
                    <input
                      type="text"
                      value={formData.studentCollege}
                      onChange={(e) => setFormData({ ...formData, studentCollege: e.target.value })}
                      placeholder="e.g. Enter institution name"
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:ring-1 focus:ring-[#3772FF] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Executive Summary *
                </label>
                <textarea
                  rows={2}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="e.g. Deconstructed systems algorithm from specification to production code..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                  required
                />
              </div>

              {/* Full Story Paragraphs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Story Article Body (Separate paragraphs with blank lines) *
                </label>
                <textarea
                  rows={5}
                  value={formData.fullStoryText}
                  onChange={(e) => setFormData({ ...formData, fullStoryText: e.target.value })}
                  placeholder="Enter detailed architectural breakdown here...&#10;&#10;Describe system evaluation, peer defense, and test benchmarks..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none leading-relaxed font-mono"
                  required
                />
              </div>

              {/* SEO & Social Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Meta Title (SEO)
                  </label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    placeholder="e.g. Enter meta title for SEO"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.metaKeywords}
                    onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                    placeholder="rust, raft, distributed systems, consensus, talentos"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Banner & Social Image URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Banner Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.bannerImage}
                    onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                    placeholder="/images/students/student-workshop-build.jpg"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Social Share Image URL (OpenGraph / WhatsApp / Twitter)
                  </label>
                  <input
                    type="text"
                    value={formData.socialShareImage}
                    onChange={(e) => setFormData({ ...formData, socialShareImage: e.target.value })}
                    placeholder="/images/students/student-workshop-build.jpg"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#3772FF] hover:bg-[#285cdb] text-white rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <SparklesIcon className="w-3.5 h-3.5" />
                  <span>{editingId ? "Update Case Study" : "Publish Case Study"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
