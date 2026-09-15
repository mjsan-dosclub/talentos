"use client";

import React, { useState, useEffect } from "react";
import type { WelcomePopup, PopupContentType } from "@/lib/popups-types";
import TablePagination from "./TablePagination";

import {
  VideoIcon,
  RadioIcon,
  XIcon,
  ExternalLinkIcon,
  ArrowRightIcon,
  CheckIcon,
  AlertTriangleIcon,
  ClockIcon,
  MoreVerticalIcon,
} from "@/components/Icons";

function getYouTubeEmbedUrl(rawUrl: string): string | null {
  if (!rawUrl) return null;
  try {
    if (rawUrl.includes("youtube.com/embed/")) return rawUrl;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = rawUrl.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=0&rel=0`;
    }
  } catch {
    // Return null on failure
  }
  return null;
}

interface PopupsTabProps {
  onToast: (message: string) => void;
}

export default function PopupsTab({ onToast }: PopupsTabProps) {
  const [popups, setPopups] = useState<WelcomePopup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<WelcomePopup | null>(null);
  const [openKebabId, setOpenKebabId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formContentType, setFormContentType] = useState<PopupContentType>("FLYER");
  const [formBadge, setFormBadge] = useState("FLASH ANNOUNCEMENT // CODEZAP 2026");
  const [formMediaUrl, setFormMediaUrl] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formActionLabel, setFormActionLabel] = useState("Learn More");
  const [formActionUrl, setFormActionUrl] = useState("https://membership.descienceosclub.com/");
  const [formStartsAt, setFormStartsAt] = useState("");
  const [formEndsAt, setFormEndsAt] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  // Preview Modal State
  const [previewPopup, setPreviewPopup] = useState<WelcomePopup | null>(null);

  const fetchPopups = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/popups");
      if (res.ok) {
        const data = await res.json();
        if (data.popups) {
          setPopups(data.popups);
        }
      }
    } catch {
      onToast("Failed to load popups from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopups();
  }, []);

  const openCreateModal = () => {
    setEditingPopup(null);
    setFormTitle("");
    setFormContentType("FLYER");
    setFormBadge("FLASH ANNOUNCEMENT // CODEZAP 2026");
    setFormMediaUrl("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80");
    setFormDescription("Join the 48-hour systems challenge building distributed inference engines.");
    setFormActionLabel("Register for CodeZap");
    setFormActionUrl("https://membership.descienceosclub.com/");
    const now = new Date();
    // format as YYYY-MM-DDTHH:mm
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setFormStartsAt(localIso);
    setFormEndsAt("");
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (p: WelcomePopup) => {
    setEditingPopup(p);
    setFormTitle(p.title);
    setFormContentType(p.contentType);
    setFormBadge(p.badge || "");
    setFormMediaUrl(p.mediaUrl || "");
    setFormDescription(p.description || "");
    setFormActionLabel(p.actionLabel || "");
    setFormActionUrl(p.actionUrl || "");
    const toLocalIso = (isoStr?: string | null) => {
      if (!isoStr) return "";
      try {
        const d = new Date(isoStr);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      } catch {
        return "";
      }
    };
    setFormStartsAt(toLocalIso(p.startsAt));
    setFormEndsAt(toLocalIso(p.endsAt));
    setFormIsActive(p.isActive);
    setIsModalOpen(true);
  };

  const handleSavePopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      onToast("Title is required.");
      return;
    }

    const payload = {
      title: formTitle.trim(),
      contentType: formContentType,
      badge: formBadge.trim() || "BROADCAST // FLASH NEWS",
      mediaUrl: formMediaUrl.trim(),
      description: formDescription.trim(),
      actionLabel: formActionLabel.trim(),
      actionUrl: formActionUrl.trim(),
      startsAt: formStartsAt ? new Date(formStartsAt).toISOString() : new Date().toISOString(),
      endsAt: formEndsAt ? new Date(formEndsAt).toISOString() : null,
      isActive: formIsActive,
    };

    try {
      if (editingPopup) {
        const res = await fetch("/api/popups", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingPopup.id, ...payload }),
        });
        if (res.ok) {
          onToast(`Updated announcement: ${payload.title}`);
          setIsModalOpen(false);
          fetchPopups();
        } else {
          onToast("Failed to update announcement.");
        }
      } else {
        const res = await fetch("/api/popups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          onToast(`Scheduled announcement: ${payload.title}`);
          setIsModalOpen(false);
          fetchPopups();
        } else {
          onToast("Failed to create announcement.");
        }
      }
    } catch {
      onToast("Network error while saving announcement.");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete announcement "${title}"?`)) return;
    try {
      const res = await fetch(`/api/popups?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onToast(`Deleted announcement: ${title}`);
        fetchPopups();
      } else {
        onToast("Failed to delete announcement.");
      }
    } catch {
      onToast("Network error while deleting.");
    }
  };

  const handleToggleActive = async (p: WelcomePopup) => {
    try {
      const res = await fetch("/api/popups", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, isActive: !p.isActive }),
      });
      if (res.ok) {
        onToast(`${!p.isActive ? "Activated" : "Deactivated"} announcement: ${p.title}`);
        fetchPopups();
      }
    } catch {
      onToast("Network error while toggling status.");
    }
  };

  const computeStatus = (p: WelcomePopup) => {
    if (!p.isActive) {
      return { label: "Disabled", color: "bg-slate-100 text-slate-600 border-slate-200" };
    }
    if (p.isSuperseded) {
      return { label: "Superseded", color: "bg-slate-200 text-slate-700 border-slate-300" };
    }
    const now = Date.now();
    const start = new Date(p.startsAt).getTime();
    if (start > now) {
      return { label: "Scheduled", color: "bg-blue-50 text-blue-700 border-blue-200" };
    }
    if (p.endsAt) {
      const end = new Date(p.endsAt).getTime();
      if (end <= now) {
        return { label: "Expired", color: "bg-amber-50 text-amber-700 border-amber-200" };
      }
    }
    return { label: "Active Now", color: "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold", isLive: true };
  };

  const embedPreviewUrl = formContentType === "YOUTUBE" ? getYouTubeEmbedUrl(formMediaUrl) : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome Popups & Flash News
            </h1>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-semibold border border-emerald-200">
              BROADCAST ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Display timed announcements, YouTube rectangular video streams, CodeZap flyers, or achiever spotlights on the landing page.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#0c3346] hover:bg-[#10222b] text-white text-xs font-semibold rounded-md transition-colors shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <RadioIcon className="w-4 h-4 text-[#4caf50]" />
          <span>+ Schedule Announcement</span>
        </button>
      </div>

      {/* Precedence Scheduling Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-200 rounded-xl text-xs text-slate-700 space-y-1">
        <div className="flex items-center gap-2 font-semibold text-blue-900">
          <ClockIcon className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Automated Scheduling & Precedence Rule</span>
        </div>
        <p className="text-slate-600 leading-relaxed pl-6">
          When an announcement is scheduled (e.g. at 8:00 AM) and another is scheduled later (e.g. at 10:00 AM), the earlier announcement automatically turns inactive once the 10:00 AM announcement goes live if no explicit end time was specified.
        </p>
      </div>

      {/* Popups Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            All Broadcast Announcements ({popups.length})
          </div>
          <button
            onClick={fetchPopups}
            className="text-xs text-slate-500 hover:text-slate-800 font-mono underline"
          >
            Refresh List
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500">
            FETCHING_BROADCAST_SCHEDULE...
          </div>
        ) : popups.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No announcements configured. Click &ldquo;+ Schedule Announcement&rdquo; to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">Title & Badge</th>
                  <th className="py-3 px-4">Scheduled Window</th>
                  <th className="py-3 px-4">Primary CTA</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {popups.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((p, idx, arr) => {
                  const status = computeStatus(p);
                  const isNearBottom = idx >= arr.length - 2;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono font-medium ${status.color}`}
                        >
                          {status.isLive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          )}
                          <span>{status.label}</span>
                        </span>
                      </td>

                      {/* Format */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-semibold">
                          {p.contentType}
                        </span>
                      </td>

                      {/* Title & Badge */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-mono text-[#1593c3] font-semibold">
                            {p.badge}
                          </span>
                          <span className="font-semibold text-slate-900 leading-snug">
                            {p.title}
                          </span>
                          <span className="text-[11px] text-slate-500 line-clamp-1">
                            {p.description}
                          </span>
                        </div>
                      </td>

                      {/* Scheduled Window */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                        <div className="flex flex-col gap-0.5">
                          <span>
                            From: {new Date(p.startsAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span className="text-slate-400">
                            {p.endsAt
                              ? `To: ${new Date(p.endsAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`
                              : "Until superseded"}
                          </span>
                        </div>
                      </td>

                      {/* CTA */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        {p.actionLabel ? (
                          <a
                            href={p.actionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1 font-medium"
                          >
                            <span>{p.actionLabel}</span>
                            <ExternalLinkIcon className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>

                      {/* 3-Dot Kebab Menu Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap relative">
                        <button
                          type="button"
                          onClick={() => setOpenKebabId(openKebabId === p.id ? null : p.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                          aria-label="Actions"
                        >
                          <MoreVerticalIcon className="w-4 h-4" />
                        </button>

                        {openKebabId === p.id && (
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
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewPopup(p);
                                  setOpenKebabId(null);
                                }}
                                className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                              >
                                <span>Preview Popup</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  openEditModal(p);
                                  setOpenKebabId(null);
                                }}
                                className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                              >
                                <span>Edit Announcement</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleToggleActive(p);
                                  setOpenKebabId(null);
                                }}
                                className={`w-full px-3 py-1.5 flex items-center gap-2 cursor-pointer font-medium ${
                                  p.isActive ? "text-amber-700 hover:bg-amber-50" : "text-emerald-700 hover:bg-emerald-50"
                                }`}
                              >
                                <span>{p.isActive ? "Deactivate" : "Activate"}</span>
                              </button>
                              <div className="border-t border-slate-100 my-1" />
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenKebabId(null);
                                  handleDelete(p.id, p.title);
                                }}
                                className="w-full px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-semibold"
                              >
                                <span>Delete Announcement</span>
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalItems={popups.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT POPUP                                                */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 flex flex-col gap-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <RadioIcon className="w-5 h-5 text-[#4caf50]" />
                <h2 className="text-base font-bold text-slate-900">
                  {editingPopup ? "Edit Announcement" : "Schedule Flash News Announcement"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Close"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePopup} className="flex flex-col gap-4 text-xs">
              {/* Content Type Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-700">Display Format:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "FLYER", label: "Flyer Poster", desc: "CodeZap / Event Flyer" },
                    { id: "YOUTUBE", label: "YouTube 16:9", desc: "Keynote / Stream Video" },
                    { id: "ACHIEVER", label: "Achiever", desc: "Hall of Achievers Card" },
                    { id: "ANNOUNCEMENT", label: "Notice", desc: "Direct Text Advisory" },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setFormContentType(fmt.id as PopupContentType)}
                      className={`p-2.5 rounded-lg border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                        formContentType === fmt.id
                          ? "bg-[#0c3346] text-white border-[#0c3346] shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span className="font-bold">{fmt.label}</span>
                      <span className={`text-[10px] ${formContentType === fmt.id ? "text-slate-300" : "text-slate-400"}`}>
                        {fmt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Announcement Title:</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. CodeZap 2026: National Systems Hackathon"
                    className="border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#4caf50]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Header Tag / Badge:</label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="e.g. FLASH ANNOUNCEMENT"
                    className="border border-slate-300 rounded-lg p-2.5 text-xs font-mono uppercase text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#4caf50]"
                  />
                </div>
              </div>

              {/* Media URL with live preview */}
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-700">
                  {formContentType === "YOUTUBE"
                    ? "YouTube Video URL (watch, youtu.be, or embed link):"
                    : formContentType === "ACHIEVER"
                    ? "Achiever Portrait Photo URL:"
                    : "Flyer Poster Image URL:"}
                </label>
                <input
                  type="text"
                  value={formMediaUrl}
                  onChange={(e) => setFormMediaUrl(e.target.value)}
                  placeholder={
                    formContentType === "YOUTUBE"
                      ? "https://www.youtube.com/watch?v=..."
                      : "https://images.unsplash.com/..."
                  }
                  className="border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#4caf50]"
                />

                {/* Live Preview within form */}
                {formContentType === "YOUTUBE" && embedPreviewUrl && (
                  <div className="mt-2 w-full aspect-video rounded-lg overflow-hidden border border-slate-300 bg-black">
                    <iframe
                      src={embedPreviewUrl}
                      title="YouTube Preview"
                      className="w-full h-full"
                    />
                  </div>
                )}
                {formContentType === "FLYER" && formMediaUrl && (
                  <div className="mt-2 max-h-48 rounded-lg overflow-hidden border border-slate-300 bg-slate-900">
                    <img
                      src={formMediaUrl}
                      alt="Flyer Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {formContentType === "ACHIEVER" && formMediaUrl && (
                  <div className="mt-2 flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <img
                      src={formMediaUrl}
                      alt="Achiever Preview"
                      className="w-16 h-16 rounded-lg object-cover border border-slate-300"
                    />
                    <div className="text-xs text-slate-600">
                      Achiever spotlight thumbnail preview
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Announcement Description / Details:</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Explain the opportunity, registration criteria, or background..."
                  className="border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#4caf50] resize-none"
                />
              </div>

              {/* Action Button Label & URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Action Button Text:</label>
                  <input
                    type="text"
                    value={formActionLabel}
                    onChange={(e) => setFormActionLabel(e.target.value)}
                    placeholder="e.g. Register for CodeZap"
                    className="border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#4caf50]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Action Target URL:</label>
                  <input
                    type="text"
                    value={formActionUrl}
                    onChange={(e) => setFormActionUrl(e.target.value)}
                    placeholder="https://..."
                    className="border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#4caf50]"
                  />
                </div>
              </div>

              {/* Timing Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-800">
                    Broadcast Start Time (IST):
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formStartsAt}
                    onChange={(e) => setFormStartsAt(e.target.value)}
                    className="border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">
                    When this announcement starts appearing
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-800">
                    End Time (Optional):
                  </label>
                  <input
                    type="datetime-local"
                    value={formEndsAt}
                    onChange={(e) => setFormEndsAt(e.target.value)}
                    className="border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">
                    Leave blank to keep active until superseded by next scheduled item
                  </span>
                </div>
              </div>

              {/* Active Switch */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formActiveCheck"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#4caf50] rounded focus:ring-0"
                />
                <label htmlFor="formActiveCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Enable Broadcast (Active on schedule)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#4caf50] to-[#2f8a36] hover:brightness-110 text-white font-semibold rounded-lg shadow-sm cursor-pointer"
                >
                  {editingPopup ? "Save Changes" : "Save & Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PREVIEW MODAL                                                             */}
      {/* ========================================================================= */}
      {previewPopup && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setPreviewPopup(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white text-[#10222b] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4caf50] animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-widest text-[#2f8a36] font-bold">
                  PREVIEW // {previewPopup.badge}
                </span>
              </div>
              <button
                onClick={() => setPreviewPopup(null)}
                className="text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
                aria-label="Close"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {previewPopup.contentType === "YOUTUBE" && (
              <div className="w-full aspect-video bg-black border-b border-slate-200">
                <iframe
                  src={getYouTubeEmbedUrl(previewPopup.mediaUrl) || ""}
                  title="YouTube Preview"
                  className="w-full h-full border-0"
                />
              </div>
            )}

            {previewPopup.contentType === "FLYER" && previewPopup.mediaUrl && (
              <div className="max-h-72 w-full overflow-hidden bg-slate-100 border-b border-slate-200">
                <img
                  src={previewPopup.mediaUrl}
                  alt={previewPopup.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {previewPopup.contentType === "ACHIEVER" && previewPopup.mediaUrl && (
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center gap-5">
                <img
                  src={previewPopup.mediaUrl}
                  alt={previewPopup.title}
                  className="w-24 h-24 rounded-xl object-cover border-2 border-[#4caf50]/60 shadow-md bg-white"
                />
                <div>
                  <span className="font-mono text-xs text-[#0d6b90] uppercase tracking-wider font-bold block mb-1">
                    HALL OF ACHIEVERS
                  </span>
                  <h3 className="text-xl font-bold text-[#10222b] leading-snug">
                    {previewPopup.title}
                  </h3>
                </div>
              </div>
            )}

            <div className="p-6 space-y-4">
              {previewPopup.contentType !== "ACHIEVER" && (
                <h3 className="text-2xl font-bold text-[#10222b] font-['Space_Grotesk']">
                  {previewPopup.title}
                </h3>
              )}
              <p className="text-slate-600 text-sm leading-relaxed">
                {previewPopup.description}
              </p>
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => setPreviewPopup(null)}
                  className="text-xs font-mono text-slate-500 hover:text-slate-800 uppercase font-medium"
                >
                  Close Preview
                </button>
                {previewPopup.actionUrl && previewPopup.actionLabel && (
                  <span className="px-4 py-2 bg-gradient-to-r from-[#4caf50] to-[#2f8a36] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 shadow-sm">
                    <span>{previewPopup.actionLabel}</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
