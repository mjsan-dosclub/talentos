"use client";

import React, { useState, useEffect } from "react";
import { EnquiryRecord } from "@/app/api/enquiry/route";
import {
  UsersIcon,
  CheckIcon,
  ExternalLinkIcon,
  SearchIcon,
  SparklesIcon,
} from "@/components/Icons";

interface EnquiriesTabProps {
  onToast: (message: string) => void;
}

export default function EnquiriesTab({ onToast }: EnquiriesTabProps) {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

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

    return matchesSearch && matchesRole;
  });

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            WhatsApp Verified
          </span>
          <div className="text-2xl font-bold text-[#25D366] mt-1">
            {enquiries.filter((e) => e.phone).length}
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            Direct 1-click messaging enabled
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Top Referral Channel
          </span>
          <div className="text-sm font-bold text-slate-900 mt-2 truncate">
            Campus Workshops & LinkedIn
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            High organic peer conversion
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, role, source..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-500 shrink-0">Role Filter:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="Student">Engineering Students</option>
            <option value="Graduate">Recent Graduates</option>
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
                  <th className="py-3.5 px-4">Applicant & Ref</th>
                  <th className="py-3.5 px-4">WhatsApp & Email</th>
                  <th className="py-3.5 px-4">Current Role</th>
                  <th className="py-3.5 px-4">Referral Channel</th>
                  <th className="py-3.5 px-4">Aspirations / Notes</th>
                  <th className="py-3.5 px-4 text-right">Connect Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{enq.full_name}</div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">{enq.enquiry_ref}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-900 font-semibold">{enq.phone}</div>
                      <div className="text-slate-500 text-[11px] truncate max-w-[180px]">{enq.email}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 inline-block">
                        {enq.current_role}
                      </span>
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
                      <div className="flex items-center justify-end gap-1.5">
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
