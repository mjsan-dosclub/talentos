"use client";

import React, { useState, useRef, useEffect } from "react";
import { WorkshopItem, ExpertMentor } from "@/lib/admin-data";
import { WORKSHOP_TOPICS_27 } from "@/lib/db";
import GlobalTableFilter from "./GlobalTableFilter";
import WorkshopScheduleTab from "./WorkshopScheduleTab";
import TablePagination from "./TablePagination";
import {
  BoltIcon,
  SearchIcon,
  TrashIcon,
  EditIcon,
  CalendarIcon,
  MoreVerticalIcon,
  XIcon,
  CheckIcon,
} from "@/components/Icons";

interface WorkshopsTabProps {
  workshops: WorkshopItem[];
  setWorkshops: React.Dispatch<React.SetStateAction<WorkshopItem[]>>;
  institutions?: Array<{ id: string; name: string; city: string }>;
  experts?: ExpertMentor[];
  onToast: (msg: string) => void;
  onAuditLog?: (
    category: "Students" | "Experts" | "Attendance" | "Certifications" | "System" | "Curriculum",
    subcategory: string,
    action: "Create" | "Update" | "Perform" | "Archive",
    sourceText: string
  ) => void;
}

// Master curriculum reference items for autocomplete
const CURRICULUM_CATALOG_REF = WORKSHOP_TOPICS_27.map((topic, idx) => {
  const code = `WS-${String(idx + 1).padStart(2, "0")}`;
  const focus =
    idx <= 5
      ? "Core Systems & Hermetic I/O"
      : idx <= 13
      ? "Storage Engines & Databases"
      : idx <= 17
      ? "Distributed Systems & Protocols"
      : "War Room & Defense";
  return {
    code,
    title: topic,
    focusArea: focus,
    defaultExpert: idx >= 13 ? "Priya Sundaram" : "Dr. Vikram Sethupathi",
  };
});

export default function WorkshopsTab({
  workshops,
  setWorkshops,
  institutions = [],
  experts = [],
  onToast,
  onAuditLog,
}: WorkshopsTabProps) {
  const [subView, setSubView] = useState<"CATALOG" | "SCHEDULE">("CATALOG");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modeFilter, setModeFilter] = useState("ALL");
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<WorkshopItem | null>(null);
  const [openKebabId, setOpenKebabId] = useState<string | null>(null);

  // Autosuggest State for Add Workshop Form
  const [autosuggestQuery, setAutosuggestQuery] = useState("");
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initialFormState = {
    code: "",
    title: "",
    focusArea: "",
    expertName: experts.length > 0 ? experts[0].fullName : "",
    mode: "IN_PERSON" as WorkshopItem["mode"],
    date: new Date().toISOString().slice(0, 10),
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (experts.length > 0 && !formData.expertName) {
      setFormData((prev) => ({ ...prev, expertName: experts[0].fullName }));
    }
  }, [experts]);

  // Filter suggestions based on dual-field fuzzy search (Code + Title)
  const suggestions = CURRICULUM_CATALOG_REF.filter((item) => {
    const q = autosuggestQuery.toLowerCase().trim();
    if (!q) return false;
    return (
      item.code.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q)
    );
  });

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Autocomplete selection handler with relational binding
  const handleSelectSuggestion = (item: (typeof CURRICULUM_CATALOG_REF)[0]) => {
    setFormData((prev) => ({
      ...prev,
      code: item.code,
      title: item.title,
      focusArea: item.focusArea,
      expertName: item.defaultExpert,
    }));
    setAutosuggestQuery(`${item.code} - ${item.title}`);
    setIsSuggestionsOpen(false);
    onToast(`Auto-populated metadata for ${item.code}`);
  };

  // Filter logic
  const filtered = workshops.filter((ws) => {
    const matchesSearch =
      ws.code.toLowerCase().includes(search.toLowerCase()) ||
      ws.title.toLowerCase().includes(search.toLowerCase()) ||
      ws.expertName.toLowerCase().includes(search.toLowerCase()) ||
      ws.focusArea.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || ws.status === statusFilter;
    const matchesMode = modeFilter === "ALL" || ws.mode === modeFilter;
    return matchesSearch && matchesStatus && matchesMode;
  });

  // Bulk actions
  const handleToggleSelect = (code: string) => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedCodes.size === filtered.length && filtered.length > 0) {
      setSelectedCodes(new Set());
    } else {
      setSelectedCodes(new Set(filtered.map((w) => w.code)));
    }
  };

  const handleBulkStatus = (status: WorkshopItem["status"]) => {
    const count = selectedCodes.size;
    if (count === 0) return;
    setWorkshops((prev) =>
      prev.map((w) => (selectedCodes.has(w.code) ? { ...w, status } : w))
    );
    onAuditLog?.(
      "Curriculum",
      "Status Management",
      "Update",
      `Bulk updated ${count} workshop(s) to status ${status}`
    );
    setSelectedCodes(new Set());
    onToast(`Updated ${count} workshop(s) to ${status}`);
  };

  // Single actions
  const handleStatusChange = async (code: string, status: WorkshopItem["status"], title: string) => {
    const workshop = workshops.find((w) => w.code === code);
    const response = await fetch("/api/workshops", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      id: workshop?.id, session_number: Number(code.replace(/\D/g, "")), is_active: status === "ACTIVE"
    }) });
    const result = await response.json();
    if (!response.ok || !result.success) { onToast(`Failed to update workshop status: ${result.error || "Server error"}`); return; }
    setWorkshops((prev) =>
      prev.map((w) => (w.code === code ? { ...w, status } : w))
    );
    onAuditLog?.(
      "Curriculum",
      "Status Management",
      "Update",
      `Changed status of ${code}: ${title} to ${status}`
    );
    onToast(`Workshop ${code} is now ${status}`);
  };

  const handleDelete = (code: string, title: string) => {
    if (!confirm(`Delete workshop "${code}: ${title}"?`)) return;
    setWorkshops((prev) => prev.filter((w) => w.code !== code));
    onAuditLog?.(
      "Curriculum",
      "Curriculum Deletion",
      "Archive",
      `Deleted workshop ${code}: ${title}`
    );
    onToast(`Deleted workshop: ${code}`);
  };

  const handleCreateWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const code =
      formData.code.trim().toUpperCase() ||
      `WS-${String(workshops.length + 1).padStart(2, "0")}`;

    const created: WorkshopItem = {
      code,
      title: formData.title.trim(),
      focusArea: formData.focusArea.trim() || "Applied Systems",
      expertName: formData.expertName,
      mode: formData.mode,
      status: "ACTIVE",
      date: formData.date,
    };

    const response = await fetch("/api/workshops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: created.code,
        title: created.title,
        session_number: Number(created.code.replace(/\D/g, "")) || workshops.length + 1,
        description: created.focusArea,
        trainer_name: created.expertName,
        session_mode: created.mode === "IN_PERSON" ? "OFFLINE" : created.mode === "VIRTUAL" ? "ONLINE" : "HYBRID",
        scheduled_at: `${created.date}T09:00:00.000Z`,
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      onToast(`Failed to create workshop: ${result.error || "Server error"}`);
      return;
    }
    setWorkshops([...workshops, created]);
    setIsAddOpen(false);
    setFormData(initialFormState);
    setAutosuggestQuery("");
    onAuditLog?.(
      "Curriculum",
      "Session Schedule",
      "Create",
      `Added Workshop ${created.code}: ${created.title}`
    );
    onToast(`Curriculum updated: Added ${created.code} (${created.title})`);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkshop) return;
    const response = await fetch("/api/workshops", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      id: editingWorkshop.id,
      session_number: Number(editingWorkshop.code.replace(/\D/g, "")),
      title: editingWorkshop.title,
      description: editingWorkshop.focusArea,
      code: editingWorkshop.code,
      session_mode: editingWorkshop.mode === "IN_PERSON" ? "OFFLINE" : editingWorkshop.mode === "VIRTUAL" ? "ONLINE" : "HYBRID"
    }) });
    const result = await response.json();
    if (!response.ok || !result.success) { onToast(`Failed to save workshop: ${result.error || "Server error"}`); return; }
    setWorkshops((prev) => prev.map((w) => (w.code === editingWorkshop.code ? editingWorkshop : w)));
    onAuditLog?.(
      "Curriculum",
      "Session Update",
      "Update",
      `Updated workshop ${editingWorkshop.code}: ${editingWorkshop.title}`
    );
    onToast(`Saved changes for ${editingWorkshop.code}`);
    setEditingWorkshop(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Sub-view Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider mb-1.5 font-mono">
            <BoltIcon className="w-3 h-3" />
            <span>Curriculum Architecture & Execution</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Workshops &amp; Curriculum
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {workshops.length > 0
              ? `${workshops.length} core engineering disciplines and live session delivery across campus hubs.`
              : "Core engineering disciplines and live session delivery across campus hubs."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sub-view switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setSubView("CATALOG")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                subView === "CATALOG"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Master Catalog ({workshops.length})
            </button>
            <button
              onClick={() => setSubView("SCHEDULE")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                subView === "SCHEDULE"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Campus Scheduler</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>+ Create Workshop</span>
          </button>
        </div>
      </div>

      {/* RENDER VIEW 1: MASTER CATALOG */}
      {subView === "CATALOG" && (
        <>
          {/* Reusable Global Filter Bar */}
          <GlobalTableFilter
            search={search}
            onSearchChange={(val) => {
              setSearch(val);
              setCurrentPage(1);
            }}
            searchPlaceholder="Search by workshop code, title, expert or focus area..."
            status={statusFilter}
            onStatusChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
            statusOptions={[
              { value: "ALL", label: "All Statuses" },
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
            ]}
            secondary={modeFilter}
            onSecondaryChange={(val) => {
              setModeFilter(val);
              setCurrentPage(1);
            }}
            secondaryLabel="All Delivery Modes"
            secondaryOptions={[
              { value: "IN_PERSON", label: "In-Person Lab" },
              { value: "HYBRID", label: "Hybrid" },
              { value: "VIRTUAL", label: "Virtual War Room" },
            ]}
            totalCount={workshops.length}
            filteredCount={filtered.length}
            onClear={() => {
              setSearch("");
              setStatusFilter("ALL");
              setModeFilter("ALL");
              setCurrentPage(1);
            }}
          />

          {/* Floating Bulk Action Bar */}
          {selectedCodes.size > 0 && (
            <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 text-white font-mono text-xs font-bold px-2 py-0.5 rounded">
                  {selectedCodes.size}
                </span>
                <span className="text-xs font-medium text-slate-200">
                  Workshop(s) Selected
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs">
                <button
                  onClick={() => handleBulkStatus("INACTIVE")}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 rounded font-semibold cursor-pointer"
                >
                  Mark Inactive
                </button>
                <button
                  onClick={() => handleBulkStatus("ACTIVE")}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 rounded font-semibold cursor-pointer"
                >
                  Mark Active
                </button>
                <button
                  onClick={() => handleBulkStatus("ACTIVE")}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 rounded font-semibold cursor-pointer"
                >
                  Mark Active
                </button>
              </div>
            </div>
          )}

          {/* Master Catalog Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div className="overflow-visible rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedCodes.size === filtered.length && filtered.length > 0}
                        onChange={handleSelectAll}
                        className="w-3.5 h-3.5 rounded text-blue-600 cursor-pointer"
                      />
                    </th>
                    <th className="p-3">Code &amp; Topic</th>
                    <th className="p-3">Focus Domain</th>
                    <th className="p-3">Mode</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-mono text-xs">
                        NO_WORKSHOPS_MATCHING_FILTER
                      </td>
                    </tr>
                  ) : (
                    (() => {
                      const paginatedWorkshops = filtered.slice(
                        (currentPage - 1) * pageSize,
                        currentPage * pageSize
                      );
                      return paginatedWorkshops.map((ws, idx) => {
                        const isSelected = selectedCodes.has(ws.code);
                        const isNearBottom = idx >= paginatedWorkshops.length - 2;
                        return (
                          <tr
                            key={ws.code}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              isSelected ? "bg-blue-50/30" : ""
                            }`}
                          >
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelect(ws.code)}
                                className="w-3.5 h-3.5 rounded text-blue-600 cursor-pointer"
                              />
                            </td>
                            <td className="p-3">
                              <div className="flex flex-col">
                                <span className="font-mono text-xs font-bold text-slate-900">
                                  {ws.code}
                                </span>
                                <span className="text-slate-800 font-medium mt-0.5">
                                  {ws.title}
                                </span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="text-slate-600 font-medium">{ws.focusArea}</span>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-600">
                                {ws.mode}
                              </span>
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  ws.status === "ACTIVE"
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    : "bg-slate-100 text-slate-600 border border-slate-300"
                                }`}
                              >
                                {ws.status}
                              </span>
                            </td>
                            {/* Minimalist 3-dot Kebab Menu */}
                            <td className="p-3 text-right relative">
                              <button
                                onClick={() => setOpenKebabId(openKebabId === ws.code ? null : ws.code)}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                                aria-label="Actions"
                              >
                                <MoreVerticalIcon className="w-4 h-4" />
                              </button>

                              {openKebabId === ws.code && (
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
                                      onClick={() => {
                                        setEditingWorkshop(ws);
                                        setOpenKebabId(null);
                                      }}
                                      className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                                    >
                                      <span>Edit Topic</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSubView("SCHEDULE");
                                        setOpenKebabId(null);
                                      }}
                                      className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer font-medium"
                                    >
                                      <span>Schedule Deliveries</span>
                                      <CalendarIcon className="w-3 h-3 text-slate-400" />
                                    </button>
                                    <div className="border-t border-slate-100 my-1" />
                                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                      Set Status
                                    </div>
                                    {(["ACTIVE", "INACTIVE"] as const).map((st) => (
                                      <button
                                        key={st}
                                        onClick={() => {
                                          handleStatusChange(ws.code, st, ws.title);
                                          setOpenKebabId(null);
                                        }}
                                        className={`w-full px-3 py-1 text-left flex items-center justify-between cursor-pointer ${
                                          ws.status === st
                                            ? "text-[#E25C38] font-bold bg-orange-50/50"
                                            : "text-slate-600 hover:bg-slate-50"
                                        }`}
                                      >
                                        <span>{st.replace(/_/g, " ")}</span>
                                        {ws.status === st && <span className="text-xs">&bull;</span>}
                                      </button>
                                    ))}
                                    <div className="border-t border-slate-100 my-1" />
                                    <button
                                      onClick={() => {
                                        setOpenKebabId(null);
                                        handleDelete(ws.code, ws.title);
                                      }}
                                      className="w-full px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-semibold"
                                    >
                                      <span>Delete Workshop</span>
                                    </button>
                                  </div>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      });
                    })()
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
        </>
      )}

      {/* RENDER VIEW 2: LIVE CAMPUS SCHEDULER */}
      {subView === "SCHEDULE" && (
        <WorkshopScheduleTab institutions={institutions} workshops={workshops} experts={experts} onAuditLog={onAuditLog} />
      )}

      {/* SCHEDULE WORKSHOP MODAL WITH DUAL-FIELD AUTOSUGGEST */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Create New Workshop
                </h2>
                <p className="text-xs text-slate-500">
                  Create a durable master workshop record. Scheduling for colleges is handled separately.
                </p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkshop} className="flex flex-col gap-4 text-xs">
              {/* Master records are created directly; scheduling is handled separately. */}
              <div className="hidden">
                <label className="block font-semibold text-slate-700 mb-1">
                  Search &amp; Select Workshop (Code or Title):
                </label>
                <div className="relative">
                  <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={autosuggestQuery}
                    onChange={(e) => {
                      setAutosuggestQuery(e.target.value);
                      setIsSuggestionsOpen(true);
                    }}
                    onFocus={() => setIsSuggestionsOpen(true)}
                    placeholder="Type code (e.g., WS-01) or keyword (e.g., Raft, Kernel)..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                {/* Inline Autocomplete Dropdown */}
                {isSuggestionsOpen && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto z-50 divide-y divide-slate-100 animate-in fade-in duration-100">
                    {suggestions.map((sug) => (
                      <div
                        key={sug.code}
                        onClick={() => handleSelectSuggestion(sug)}
                        className="p-2.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {sug.code} - {sug.title}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Focus: {sug.focusArea}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] shrink-0 font-semibold">
                          Auto-fill
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bound Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Workshop Code:</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="WS-01"
                    className="border border-slate-300 rounded-lg p-2 font-mono uppercase focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="hidden">
                  <label className="font-semibold text-slate-700">Assigned Faculty:</label>
                  <select
                    value={formData.expertName}
                    onChange={(e) => setFormData({ ...formData, expertName: e.target.value })}
                    className="border border-slate-300 rounded-lg p-2 bg-white text-xs"
                  >
                    {experts.length > 0 ? (
                      experts.map((exp) => (
                        <option key={exp.id} value={exp.fullName}>
                          {exp.fullName} ({exp.organization || exp.designation || "Faculty"})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No Faculty Available — Register mentor first
                      </option>
                    )}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Workshop Title:</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Distributed Consensus State Machines"
                  className="border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Focus Domain:</label>
                  <input
                    type="text"
                    required
                    value={formData.focusArea}
                    onChange={(e) => setFormData({ ...formData, focusArea: e.target.value })}
                    placeholder="e.g. Core Systems & Hermetic I/O"
                    className="border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Delivery Mode:</label>
                  <select
                    value={formData.mode}
                    onChange={(e) =>
                      setFormData({ ...formData, mode: e.target.value as WorkshopItem["mode"] })
                    }
                    className="border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="IN_PERSON">In-Person Campus Lab</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="VIRTUAL">Virtual War Room</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="hidden">
                  <label className="font-semibold text-slate-700">Scheduled Date:</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-900"
                  />
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
                  Save Workshop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT WORKSHOP MODAL */}
      {editingWorkshop && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Edit Workshop: {editingWorkshop.code}
                </h2>
                <p className="text-xs text-slate-500">
                  Update the master workshop title and focus area. Scheduling status is managed separately.
                </p>
              </div>
              <button
                onClick={() => setEditingWorkshop(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Workshop Code:</label>
                <input type="text" required value={editingWorkshop.code}
                  onChange={(e) => setEditingWorkshop({ ...editingWorkshop, code: e.target.value.toUpperCase() })}
                  className="border border-slate-300 rounded-lg p-2 font-mono uppercase" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Workshop Title:</label>
                <input
                  type="text"
                  required
                  value={editingWorkshop.title}
                  onChange={(e) =>
                    setEditingWorkshop({ ...editingWorkshop, title: e.target.value })
                  }
                  className="border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Focus Domain:</label>
                <input type="text" value={editingWorkshop.focusArea}
                  onChange={(e) => setEditingWorkshop({ ...editingWorkshop, focusArea: e.target.value })}
                  className="border border-slate-300 rounded-lg p-2" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Delivery Mode:</label>
                  <select value={editingWorkshop.mode}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, mode: e.target.value as WorkshopItem["mode"] })}
                    className="border border-slate-300 rounded-lg p-2 bg-white">
                    <option value="IN_PERSON">In-Person Campus Lab</option><option value="HYBRID">Hybrid</option><option value="VIRTUAL">Virtual War Room</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingWorkshop(null)}
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
