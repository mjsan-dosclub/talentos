"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PartnerInstitution } from "@/lib/admin-data";
import GlobalTableFilter from "./GlobalTableFilter";
import TablePagination from "./TablePagination";
import {
  BuildingIcon,
  MoreVerticalIcon,
  ExternalLinkIcon,
  XIcon,
  CheckIcon,
} from "@/components/Icons";

interface InstitutionsTabProps {
  institutions: PartnerInstitution[];
  setInstitutions: React.Dispatch<React.SetStateAction<PartnerInstitution[]>>;
  onToast: (msg: string) => void;
  onAuditLog?: (
    category: "Students" | "Experts" | "Attendance" | "Certifications" | "System" | "Institutions",
    subcategory: string,
    action: "Create" | "Update" | "Perform" | "Archive",
    sourceText: string
  ) => void;
}

export default function InstitutionsTab({
  institutions,
  setInstitutions,
  onToast,
  onAuditLog,
}: InstitutionsTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [regionFilter, setRegionFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Kebab menu state
  const [openKebabId, setOpenKebabId] = useState<string | null>(null);

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingInst, setEditingInst] = useState<PartnerInstitution | null>(null);

  // New Partner Form State
  const initialFormState = {
    name: "",
    code: "",
    city: "",
    state: "Tamil Nadu",
    tier: "Autonomous",
    region: "Tamil Nadu, India",
    pocName: "",
    pocRole: "",
    pocEmail: "",
    pocPhone: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  // Filter logic
  const filtered = institutions.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.code.toLowerCase().includes(search.toLowerCase()) ||
      inst.city.toLowerCase().includes(search.toLowerCase()) ||
      (inst.pocName && inst.pocName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || inst.status === statusFilter;
    const matchesRegion =
      regionFilter === "ALL" ||
      (inst.region && inst.region.toLowerCase().includes(regionFilter.toLowerCase()));
    return matchesSearch && matchesStatus && matchesRegion;
  });

  // Paginated records
  const paginatedInstitutions = filtered.slice(
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
      setSelectedIds(new Set(filtered.map((i) => i.id)));
    }
  };

  const handleBulkStatus = (status: PartnerInstitution["status"]) => {
    const count = selectedIds.size;
    if (count === 0) return;
    setInstitutions((prev) =>
      prev.map((i) => (selectedIds.has(i.id) ? { ...i, status } : i))
    );
    onAuditLog?.(
      "Institutions",
      "Status Management",
      "Update",
      `Bulk updated ${count} campus hub(s) to ${status}`
    );
    setSelectedIds(new Set());
    onToast(`Updated ${count} institution(s) to ${status}`);
  };

  // Single actions
  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete partner campus hub "${name}"?`)) return;
    setInstitutions((prev) => prev.filter((i) => i.id !== id));
    setOpenKebabId(null);
    onAuditLog?.(
      "Institutions",
      "Campus Deletion",
      "Archive",
      `Deleted campus hub ${name}`
    );
    onToast(`Deleted campus hub: ${name}`);
  };

  const handleToggleStatus = (
    id: string,
    status: PartnerInstitution["status"],
    name: string
  ) => {
    setInstitutions((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    );
    setOpenKebabId(null);
    onAuditLog?.(
      "Institutions",
      "Status Update",
      "Update",
      `Changed status of ${name} to ${status}`
    );
    onToast(`${name} is now ${status}`);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    setIsSubmitting(true);
    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      contact_person: formData.pocName.trim(),
      contact_email: formData.pocEmail.trim(),
      contact_phone: formData.pocPhone.trim(),
      city: formData.city.trim() || "Chennai",
      state: formData.state.trim() || "Tamil Nadu",
      tier: formData.tier,
      region: formData.region,
    };

    try {
      const res = await fetch("/api/institutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const created: PartnerInstitution = {
          id: data.institution?.id || `inst-${Date.now()}`,
          code: formData.code.trim().toUpperCase(),
          name: formData.name.trim(),
          city: formData.city.trim() || "Chennai",
          state: formData.state.trim() || "Tamil Nadu",
          tier: formData.tier,
          region: formData.region,
          lat: 13.011,
          lng: 80.2354,
          geofenceRadiusMeters: 250,
          studentCount: 0,
          status: "ACTIVE",
          pocName: formData.pocName.trim(),
          pocRole: formData.pocRole.trim(),
          pocEmail: formData.pocEmail.trim(),
          pocPhone: formData.pocPhone.trim(),
        };

        setInstitutions([created, ...institutions]);
        setIsAddOpen(false);
        setFormData(initialFormState);
        onAuditLog?.(
          "Institutions",
          "Campus Onboarding",
          "Create",
          `Added Partner Campus ${created.name} (${created.code})`
        );
        onToast(`CONFIRMED // Onboarded ${created.name} (${created.code}) in DB`);
      } else {
        onToast(`ERROR // ${data.error || "Failed to add institution"}`);
      }
    } catch (err: any) {
      onToast(`ERROR // ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInst) return;
    const response = await fetch("/api/institutions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingInst) });
    const result = await response.json();
    if (!response.ok || !result.success) { onToast(`Failed to save college: ${result.error || "Server error"}`); return; }
    setInstitutions((prev) =>
      prev.map((i) => (i.id === editingInst.id ? editingInst : i))
    );
    onAuditLog?.(
      "Institutions",
      "Campus Update",
      "Update",
      `Updated partner campus ${editingInst.name} (${editingInst.code})`
    );
    onToast(`Saved changes for ${editingInst.name}`);
    setEditingInst(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider mb-1.5 font-mono">
            <BuildingIcon className="w-3 h-3" />
            <span>Colleges & Campus Hubs</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Partner Institutions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage partner colleges, campus hubs, institutional coordinators, and dedicated delivery pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>+ Add Partner Campus</span>
          </button>
        </div>
      </div>

      {/* Reusable Global Filter Bar */}
      <GlobalTableFilter
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by campus name, code, city, or PoC coordinator..."
        status={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { value: "ALL", label: "All Statuses" },
          { value: "ACTIVE", label: "Active" },
          { value: "ONBOARDING", label: "Onboarding" },
          { value: "INACTIVE", label: "Inactive" },
        ]}
        secondary={regionFilter}
        onSecondaryChange={setRegionFilter}
        secondaryLabel="All Regions"
        secondaryOptions={[
          { value: "Tamil Nadu", label: "Tamil Nadu, India" },
          { value: "Singapore", label: "Singapore" },
          { value: "Karnataka", label: "Karnataka, India" },
        ]}
        totalCount={institutions.length}
        filteredCount={filtered.length}
        onClear={() => {
          setSearch("");
          setStatusFilter("ALL");
          setRegionFilter("ALL");
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
              Campus Hub(s) Selected
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
              onClick={() => handleBulkStatus("ONBOARDING")}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 rounded font-semibold cursor-pointer"
            >
              Set Onboarding
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

      {/* Minimalist Institutions Table */}
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
                    aria-label="Select all institutions"
                  />
                </th>
                <th className="p-3">Institution Code</th>
                <th className="p-3">Campus Hub &amp; Tier</th>
                <th className="p-3">Location / Region</th>
                <th className="p-3">Point of Contact (PoC)</th>
                <th className="p-3">Enrolled</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-mono text-xs">
                    NO_PARTNER_CAMPUSES_MATCHING_FILTER
                  </td>
                </tr>
              ) : (
                paginatedInstitutions.map((inst) => {
                  const isSelected = selectedIds.has(inst.id);
                  const isKebabOpen = openKebabId === inst.id;

                  return (
                    <tr
                      key={inst.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(inst.id)}
                          className="w-3.5 h-3.5 rounded text-blue-600 cursor-pointer"
                          aria-label={`Select ${inst.name}`}
                        />
                      </td>

                      {/* Clickable Institution Code */}
                      <td className="p-3">
                        <Link
                          href={`/college?hub=${inst.code}`}
                          className="font-mono text-xs font-bold text-[#E25C38] hover:text-[#CC4F2E] hover:underline inline-flex items-center gap-1"
                          title="Open campus hub portal"
                        >
                          <span>{inst.code}</span>
                          <ExternalLinkIcon className="w-2.5 h-2.5 opacity-70" />
                        </Link>
                      </td>

                      {/* Name & Tier */}
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{inst.name}</span>
                          <span className="text-[11px] text-slate-500">{inst.tier}</span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">{inst.city}</span>
                          <span className="text-[11px] text-slate-400">{inst.region}</span>
                        </div>
                      </td>

                      {/* PoC Details */}
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{inst.pocName || "Unassigned"}</span>
                          <span className="text-[11px] text-slate-500">{inst.pocRole}</span>
                          {inst.pocEmail && (
                            <span className="text-[10px] text-slate-400 font-mono">{inst.pocEmail}</span>
                          )}
                        </div>
                      </td>

                      {/* Student Count */}
                      <td className="p-3 font-mono text-[11px] font-bold text-slate-700">
                        {inst.studentCount} Students
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            inst.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : inst.status === "ONBOARDING"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-600 border border-slate-300"
                          }`}
                        >
                          {inst.status}
                        </span>
                      </td>

                      {/* Minimalist 3-dot Kebab Menu */}
                      <td className="p-3 text-right relative">
                        <button
                          onClick={() => setOpenKebabId(isKebabOpen ? null : inst.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                          aria-label="Actions"
                        >
                          <MoreVerticalIcon className="w-4 h-4" />
                        </button>

                        {isKebabOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenKebabId(null)}
                            />
                            <div className="absolute right-3 top-10 w-44 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-left text-xs animate-in fade-in zoom-in-95 duration-100">
                              <button
                                onClick={() => {
                                  setEditingInst(inst);
                                  setOpenKebabId(null);
                                }}
                                className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                              >
                                <span>Edit Campus Hub</span>
                              </button>
                              <Link
                                href={`/college?hub=${inst.code}`}
                                className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer font-medium"
                              >
                                <span>View Portal</span>
                                <ExternalLinkIcon className="w-3 h-3 text-slate-400" />
                              </Link>
                              <div className="border-t border-slate-100 my-1" />
                              <button
                                onClick={() =>
                                  handleToggleStatus(
                                    inst.id,
                                    inst.status === "ACTIVE" ? "ONBOARDING" : "ACTIVE",
                                    inst.name
                                  )
                                }
                                className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <span>
                                  Set {inst.status === "ACTIVE" ? "Onboarding" : "Active"}
                                </span>
                              </button>
                              <button
                                onClick={() =>
                                  handleToggleStatus(inst.id, "INACTIVE", inst.name)
                                }
                                className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <span>Archive Campus</span>
                              </button>
                              <div className="border-t border-slate-100 my-1" />
                              <button
                                onClick={() => handleDelete(inst.id, inst.name)}
                                className="w-full px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-semibold"
                              >
                                <span>Delete Campus</span>
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
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* EXPANDED ADD PARTNER MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Onboard Partner Institution &amp; Campus Hub
                </h2>
                <p className="text-xs text-slate-500">
                  Establish a new university center and assign primary academic coordinator.
                </p>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="flex flex-col gap-4 text-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                1. Institution Information
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Institution Name:</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. SRM Institute of Science & Tech"
                    className="border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Institution Code:</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SRM-DOS-04"
                    className="border border-slate-300 rounded-lg p-2 font-mono uppercase focus:ring-1 focus:ring-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Campus Hub / City:</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Kattankulathur"
                    className="border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Tier / Type:</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    className="border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Affiliated">Affiliated</option>
                    <option value="Autonomous">Autonomous</option>
                    <option value="University">University</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Region:</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="Tamil Nadu, India"
                    className="border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-800"
                  />
                </div>
              </div>

              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2 border-t border-slate-100">
                2. Point of Contact (PoC) Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">PoC Full Name:</label>
                  <input
                    type="text"
                    required
                    value={formData.pocName}
                    onChange={(e) => setFormData({ ...formData, pocName: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    className="border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Position / Designation:</label>
                  <input
                    type="text"
                    required
                    value={formData.pocRole}
                    onChange={(e) => setFormData({ ...formData, pocRole: e.target.value })}
                    placeholder="Dean of Computing & Systems"
                    className="border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Direct Email:</label>
                  <input
                    type="email"
                    required
                    value={formData.pocEmail}
                    onChange={(e) => setFormData({ ...formData, pocEmail: e.target.value })}
                    placeholder="rajesh@srmist.edu.in"
                    className="border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-800"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Direct Phone / WhatsApp:</label>
                  <input
                    type="text"
                    required
                    value={formData.pocPhone}
                    onChange={(e) => setFormData({ ...formData, pocPhone: e.target.value })}
                    placeholder="+91 98400 54321"
                    className="border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-slate-800"
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
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-[#E25C38] hover:bg-[#CC4F2E] disabled:opacity-75 text-white font-semibold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Onboarding...</span>
                    </>
                  ) : (
                    <span>Add Partner Campus</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PARTNER MODAL */}
      {editingInst && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Edit Campus Hub: {editingInst.code}
                </h2>
                <p className="text-xs text-slate-500">
                  Update institution and coordinator details.
                </p>
              </div>
              <button
                onClick={() => setEditingInst(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Institution Name:</label>
                  <input
                    type="text"
                    required
                    value={editingInst.name}
                    onChange={(e) => setEditingInst({ ...editingInst, name: e.target.value })}
                    className="border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Campus Hub / City:</label>
                  <input
                    type="text"
                    required
                    value={editingInst.city}
                    onChange={(e) => setEditingInst({ ...editingInst, city: e.target.value })}
                    className="border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Tier / Type:</label>
                  <select
                    value={editingInst.tier || "Autonomous"}
                    onChange={(e) => setEditingInst({ ...editingInst, tier: e.target.value })}
                    className="border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Affiliated">Affiliated</option>
                    <option value="Autonomous">Autonomous</option>
                    <option value="University">University</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">PoC Full Name:</label>
                  <input
                    type="text"
                    required
                    value={editingInst.pocName || ""}
                    onChange={(e) => setEditingInst({ ...editingInst, pocName: e.target.value })}
                    className="border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Position / Designation:</label>
                  <input
                    type="text"
                    required
                    value={editingInst.pocRole || ""}
                    onChange={(e) => setEditingInst({ ...editingInst, pocRole: e.target.value })}
                    className="border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Region:</label>
                  <input
                    type="text"
                    value={editingInst.region || "Tamil Nadu, India"}
                    onChange={(e) => setEditingInst({ ...editingInst, region: e.target.value })}
                    className="border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Status:</label>
                  <select
                    value={editingInst.status}
                    onChange={(e) =>
                      setEditingInst({
                        ...editingInst,
                        status: e.target.value as PartnerInstitution["status"],
                      })
                    }
                    className="border border-slate-300 rounded-lg p-2 bg-white font-semibold text-slate-800"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="ONBOARDING">ONBOARDING</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Direct Email:</label>
                  <input
                    type="email"
                    required
                    value={editingInst.pocEmail || ""}
                    onChange={(e) => setEditingInst({ ...editingInst, pocEmail: e.target.value })}
                    className="border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Direct Phone:</label>
                  <input
                    type="text"
                    required
                    value={editingInst.pocPhone || ""}
                    onChange={(e) => setEditingInst({ ...editingInst, pocPhone: e.target.value })}
                    className="border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingInst(null)}
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
