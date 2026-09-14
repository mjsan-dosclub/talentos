"use client";

import React, { useState, useEffect } from "react";
import { EnquiryRecord } from "@/app/api/enquiry/route";
import {
  UsersIcon,
  CheckIcon,
  ExternalLinkIcon,
  SearchIcon,
  SparklesIcon,
  TrashIcon,
} from "@/components/Icons";

interface EnquiriesTabProps {
  onToast: (message: string) => void;
  onAuditLog?: (
    category: "Students" | "Experts" | "Attendance" | "Certifications" | "System",
    subcategory: string,
    action: "Create" | "Update" | "Perform" | "Archive",
    sourceText: string
  ) => void;
}

export default function EnquiriesTab({ onToast, onAuditLog }: EnquiriesTabProps) {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/enquiry");
      const data = await res.json();
      if (data.enquiries) {
        setEnquiries(data.enquiries);
      }
    } catch {
      onToast("Failed to fetch enquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const cleanPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/[^0-9]/g, "");
  };

  const filteredEnquiries = enquiries.filter((item) => {
    const matchesSearch =
      item.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      item.email?.toLowerCase().includes(search.toLowerCase()) ||
      item.phone?.includes(search) ||
      item.enquiry_ref?.toLowerCase().includes(search.toLowerCase()) ||
      item.referral_source?.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "ALL" ||
      item.current_role?.toLowerCase().includes(roleFilter.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      item.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = new Set(filteredEnquiries.map((enq) => enq.id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} enquiry record(s)? This action cannot be undone.`)) {
      return;
    }

    setBulkProcessing(true);
    try {
      const idsArray = Array.from(selectedIds);
      const res = await fetch("/api/enquiry", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: idsArray }),
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries((prev) => prev.filter((enq) => !selectedIds.has(enq.id)));
        onToast(`Successfully deleted ${data.deletedCount} enquiry record(s).`);
        onAuditLog?.(
          "Students",
          "Admissions Enquiries",
          "Archive",
          `Bulk purged ${data.deletedCount} candidate enquiry leads`
        );
        setSelectedIds(new Set());
      } else {
        onToast(data.error || "Failed to delete enquiries");
      }
    } catch (err: any) {
      onToast("Error deleting enquiries: " + err.message);
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkStatusUpdate = async (newStatus: EnquiryRecord["status"]) => {
    if (selectedIds.size === 0) return;

    setBulkProcessing(true);
    try {
      const idsArray = Array.from(selectedIds);
      const res = await fetch("/api/enquiry", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: idsArray, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries((prev) =>
          prev.map((enq) =>
            selectedIds.has(enq.id) ? { ...enq, status: newStatus } : enq
          )
        );
        onToast(`Marked ${data.updatedCount} enquiry record(s) as ${newStatus}.`);
        onAuditLog?.(
          "Students",
          "Admissions Enquiries",
          "Update",
          `Bulk updated ${data.updatedCount} candidate leads to status: ${newStatus}`
        );
        setSelectedIds(new Set());
      } else {
        onToast(data.error || "Failed to update enquiries");
      }
    } catch (err: any) {
      onToast("Error updating enquiries: " + err.message);
    } finally {
      setBulkProcessing(false);
    }
  };

  // Single Item Actions
  const handleDeleteSingle = async (id: string, name: string) => {
    if (!confirm(`Delete enquiry for "${name}"?`)) return;

    try {
      const res = await fetch(`/api/enquiry?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setEnquiries((prev) => prev.filter((enq) => enq.id !== id));
        onToast(`Deleted enquiry for ${name}.`);
        onAuditLog?.(
          "Students",
          "Admissions Enquiries",
          "Archive",
          `Deleted candidate enquiry for ${name} (${id})`
        );
        const next = new Set(selectedIds);
        next.delete(id);
        setSelectedIds(next);
      }
    } catch (err: any) {
      onToast("Error: " + err.message);
    }
  };

  const handleStatusChangeSingle = async (id: string, name: string, status: EnquiryRecord["status"]) => {
    try {
      const res = await fetch("/api/enquiry", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries((prev) =>
          prev.map((enq) => (enq.id === id ? { ...enq, status } : enq))
        );
        onToast(`Updated ${name} status to ${status}.`);
        onAuditLog?.(
          "Students",
          "Admissions Enquiries",
          "Update",
          `Updated candidate lead ${name} to status ${status}`
        );
      }
    } catch (err: any) {
      onToast("Error: " + err.message);
    }
  };

  const isAllSelected =
    filteredEnquiries.length > 0 &&
    filteredEnquiries.every((enq) => selectedIds.has(enq.id));

  return (
    <div className="flex flex-col gap-6 font-['Poppins',sans-serif]">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#FF592C]/10 text-[#FF592C] text-[10px] font-bold uppercase tracking-wider mb-1">
            <UsersIcon className="w-3.5 h-3.5" />
            <span>Lead Acquisition & Pipeline</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Admissions Enquiries
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Incoming student and engineer applicants captured from the public landing portal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchEnquiries}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
          >
            Refresh Roster
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Inquiries
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {enquiries.length}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium block mt-1">
            Active admissions campaign
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Accepted / Enrolled
          </span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {enquiries.filter((e) => e.status === "ACCEPTED").length}
          </div>
          <span className="text-[10px] text-slate-500 font-medium block mt-1">
            Onboarded to batch
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Contacted &amp; Follow-up
          </span>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {enquiries.filter((e) => e.status === "CONTACTED").length}
          </div>
          <span className="text-[10px] text-slate-500 font-medium block mt-1">
            WhatsApp / Email outreach sent
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Inactive / Archived
          </span>
          <div className="text-2xl font-bold text-slate-500 mt-1">
            {enquiries.filter((e) => e.status === "INACTIVE").length}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block mt-1">
            Disqualified / Withdrawn
          </span>
        </div>
      </div>

      {/* Floating Bulk Action Bar (when rows are selected) */}
      {selectedIds.size > 0 && (
        <div className="p-3.5 bg-slate-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg border border-slate-800 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-2 py-0.5 rounded-full bg-[#3772FF] text-white text-[11px] font-bold font-mono">
              {selectedIds.size}
            </span>
            <span>Record(s) Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatusUpdate("ACCEPTED")}
              disabled={bulkProcessing}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Bulk Approve / Accept
            </button>
            <button
              onClick={() => handleBulkStatusUpdate("INACTIVE")}
              disabled={bulkProcessing}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-xl transition-all"
            >
              Bulk Mark Inactive
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
              onClick={() => setSelectedIds(new Set())}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs items-center justify-between">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, reference, or referral channel..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#3772FF]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">All Cohort Roles</option>
            <option value="Student">College Students</option>
            <option value="Professional">Working Professionals</option>
            <option value="Self-Taught">Self-Taught</option>
          </select>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading admissions enquiries...</div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No enquiries match your search filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-[#3772FF] focus:ring-[#3772FF] cursor-pointer"
                      title="Select All"
                    />
                  </th>
                  <th className="py-3.5 px-4">Applicant &amp; Ref</th>
                  <th className="py-3.5 px-4">WhatsApp &amp; Email</th>
                  <th className="py-3.5 px-4">Role &amp; Status</th>
                  <th className="py-3.5 px-4">Referral Channel</th>
                  <th className="py-3.5 px-4">Aspirations / Notes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEnquiries.map((enq) => {
                  const isSelected = selectedIds.has(enq.id);
                  return (
                    <tr
                      key={enq.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isSelected ? "bg-blue-50/40" : ""
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(enq.id)}
                          className="rounded border-slate-300 text-[#3772FF] focus:ring-[#3772FF] cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{enq.full_name}</div>
                        <div className="font-mono text-[10px] text-slate-400 mt-0.5">{enq.enquiry_ref}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-900 font-semibold">{enq.phone}</div>
                        <div className="text-slate-500 text-[11px] truncate max-w-[180px]">{enq.email}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 inline-block">
                            {enq.current_role}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              enq.status === "ACCEPTED"
                                ? "bg-emerald-100 text-emerald-800"
                                : enq.status === "CONTACTED"
                                ? "bg-purple-100 text-purple-800"
                                : enq.status === "INACTIVE"
                                ? "bg-slate-200 text-slate-600"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {enq.status || "NEW"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-slate-600 text-[11px] font-medium block truncate max-w-[150px]">
                          {enq.referral_source}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-600 text-[11px] line-clamp-2 max-w-[220px]" title={enq.message}>
                          {enq.message || "No specific statement provided."}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* 1-Click WhatsApp Button */}
                          {enq.phone && (
                            <a
                              href={`https://wa.me/${cleanPhoneForWhatsApp(enq.phone)}?text=${encodeURIComponent(
                                `Hi ${enq.full_name}, thank you for your enquiry regarding TalentOS & CodeZap 3.0 at DeScience Open Source Club!`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[11px] font-bold transition-colors"
                              title="Open WhatsApp Chat"
                            >
                              <span>WhatsApp</span>
                            </a>
                          )}

                          {/* 1-Click Email Button */}
                          {enq.email && (
                            <a
                              href={`mailto:${enq.email}?subject=${encodeURIComponent(
                                "DOS Club Admissions: Your TalentOS Enquiry"
                              )}&body=${encodeURIComponent(
                                `Hi ${enq.full_name},\n\nWe received your enquiry for Batch 3 Systems Engineering at DOS Club.`
                              )}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-[11px] font-bold transition-colors"
                              title="Send Email"
                            >
                              <span>Email</span>
                            </a>
                          )}

                          {/* Quick Status Dropdown */}
                          <select
                            value={enq.status || "NEW"}
                            onChange={(e) =>
                              handleStatusChangeSingle(enq.id, enq.full_name, e.target.value as any)
                            }
                            className="text-[10px] bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700 focus:outline-none"
                          >
                            <option value="NEW">New</option>
                            <option value="CONTACTED">Contacted</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="INACTIVE">Inactive</option>
                          </select>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteSingle(enq.id, enq.full_name)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Enquiry"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
