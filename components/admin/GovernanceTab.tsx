"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuditLogEntry } from "@/lib/admin-data";
import GlobalTableFilter from "./GlobalTableFilter";
import {
  ClipboardListIcon,
  SettingsIcon,
  ShieldCheckIcon,
  ExternalLinkIcon,
  TrashIcon,
} from "@/components/Icons";

interface GovernanceTabProps {
  auditLogs: AuditLogEntry[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLogEntry[]>>;
  onToast: (msg: string) => void;
}

export default function GovernanceTab({
  auditLogs,
  setAuditLogs,
  onToast,
}: GovernanceTabProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set());

  const categories: AuditLogEntry["category"][] = [
    "Students",
    "Experts",
    "Attendance",
    "Certifications",
    "System",
    "Curriculum",
    "Institutions",
    "Enquiries",
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesCategory =
      categoryFilter === "ALL" || log.category === categoryFilter;
    const matchesSearch =
      search === "" ||
      log.sourceText.toLowerCase().includes(search.toLowerCase()) ||
      log.subcategory.toLowerCase().includes(search.toLowerCase()) ||
      log.modifiedBy.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggleSelect = (id: string) => {
    setSelectedLogIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedLogIds.size === filteredLogs.length && filteredLogs.length > 0) {
      setSelectedLogIds(new Set());
    } else {
      setSelectedLogIds(new Set(filteredLogs.map((l) => l.id)));
    }
  };

  const handleBulkDelete = () => {
    const count = selectedLogIds.size;
    if (count === 0) return;
    if (!confirm(`Delete ${count} audit log entry/entries?`)) return;
    setAuditLogs((prev) => prev.filter((l) => !selectedLogIds.has(l.id)));
    setSelectedLogIds(new Set());
    onToast(`Removed ${count} audit log(s)`);
  };

  const handleExportLogs = () => {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `talentos-audit-logs-${Date.now()}.json`;
    a.click();
    onToast("Audit logs exported to JSON");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider mb-1.5 font-mono">
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            <span>Platform Governance &amp; Security</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Governance &amp; Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic ledger tracking administrator mutations, campus onboarding, and student defense passes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/settings"
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>System Settings</span>
          </Link>
          <button
            onClick={handleExportLogs}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Export JSON
          </button>
        </div>
      </div>

      {/* Reusable Filter */}
      <GlobalTableFilter
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search audit events by keyword, administrator, or subcategory..."
        status={categoryFilter}
        onStatusChange={setCategoryFilter}
        statusOptions={[
          { value: "ALL", label: "All Event Categories" },
          ...categories.map((c) => ({ value: c, label: c })),
        ]}
        totalCount={auditLogs.length}
        filteredCount={filteredLogs.length}
        onClear={() => {
          setSearch("");
          setCategoryFilter("ALL");
        }}
      />

      {/* Floating Bulk Action */}
      {selectedLogIds.size > 0 && (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 border border-slate-700 animate-in fade-in">
          <span className="text-xs font-medium">
            {selectedLogIds.size} Audit Entry/Entries Selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 rounded text-xs font-semibold cursor-pointer flex items-center gap-1"
          >
            <TrashIcon className="w-3 h-3" />
            <span>Delete Selected</span>
          </button>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedLogIds.size === filteredLogs.length &&
                      filteredLogs.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded text-blue-600 cursor-pointer"
                  />
                </th>
                <th className="p-3">Category</th>
                <th className="p-3">Action</th>
                <th className="p-3">Operation Details</th>
                <th className="p-3">Admin Identity</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3 text-right">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-mono text-xs">
                    NO_AUDIT_EVENTS_RECORDED
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedLogIds.has(log.id)}
                        onChange={() => handleToggleSelect(log.id)}
                        className="w-3.5 h-3.5 rounded text-blue-600 cursor-pointer"
                      />
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-[10px] text-slate-700">
                        {log.category}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-900">
                      {log.action}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800">{log.sourceText}</span>
                        <span className="text-[10px] text-slate-400">{log.subcategory}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={log.modifiedBy.avatar}
                          alt=""
                          className="w-6 h-6 rounded-full border border-slate-200"
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-[11px]">
                            {log.modifiedBy.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {log.modifiedBy.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">
                      {log.dateOfChange}
                    </td>
                    <td className="p-3 text-right">
                      {log.sourceUrl ? (
                        <Link
                          href={log.sourceUrl}
                          className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                        >
                          <span>View</span>
                          <ExternalLinkIcon className="w-2.5 h-2.5" />
                        </Link>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
