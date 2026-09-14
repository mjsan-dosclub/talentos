"use client";

import React from "react";
import { SearchIcon, XIcon } from "@/components/Icons";

export interface FilterOption {
  value: string;
  label: string;
}

interface GlobalTableFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  status?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: FilterOption[];
  secondary?: string;
  onSecondaryChange?: (value: string) => void;
  secondaryLabel?: string;
  secondaryOptions?: FilterOption[];
  totalCount: number;
  filteredCount: number;
  onClear: () => void;
  className?: string;
}

export default function GlobalTableFilter({
  search,
  onSearchChange,
  searchPlaceholder = "Search by keyword, code, or title...",
  status,
  onStatusChange,
  statusOptions,
  secondary,
  onSecondaryChange,
  secondaryLabel = "All Categories",
  secondaryOptions,
  totalCount,
  filteredCount,
  onClear,
  className = "",
}: GlobalTableFilterProps) {
  const isFiltered = Boolean(
    search.trim() ||
      (status && status !== "ALL") ||
      (secondary && secondary !== "ALL")
  );

  return (
    <div
      className={`bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${className}`}
    >
      {/* Search Input */}
      <div className="relative flex-1">
        <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-800"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            aria-label="Clear search"
          >
            <XIcon className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Select Filters & Clear Button */}
      <div className="flex items-center gap-2 flex-wrap">
        {statusOptions && onStatusChange && (
          <select
            value={status || "ALL"}
            onChange={(e) => onStatusChange(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-800 cursor-pointer"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {secondaryOptions && onSecondaryChange && (
          <select
            value={secondary || "ALL"}
            onChange={(e) => onSecondaryChange(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-800 cursor-pointer"
          >
            <option value="ALL">{secondaryLabel}</option>
            {secondaryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {/* Clear Filters button */}
        {isFiltered && (
          <button
            onClick={onClear}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer flex items-center gap-1"
          >
            <XIcon className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}

        {/* Results Counter */}
        <div className="text-[11px] font-mono text-slate-500 pl-1">
          {filteredCount} / {totalCount} records
        </div>
      </div>
    </div>
  );
}
