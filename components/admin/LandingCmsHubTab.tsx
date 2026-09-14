"use client";

import React, { useState, useEffect } from "react";
import CaseStudiesCmsTab from "./CaseStudiesCmsTab";
import EnquiriesTab from "./EnquiriesTab";
import PassLedgerTab from "./PassLedgerTab";
import {
  SparklesIcon,
  UsersIcon,
  IdCardIcon,
} from "@/components/Icons";

interface LandingCmsHubTabProps {
  initialSubTab?: "casestudies" | "enquiries" | "passes";
  onToast: (msg: string) => void;
  onAuditLog?: (
    category: "Students" | "Experts" | "Attendance" | "Certifications" | "System",
    subcategory: string,
    action: "Create" | "Update" | "Perform" | "Archive",
    sourceText: string
  ) => void;
}

export default function LandingCmsHubTab({
  initialSubTab = "casestudies",
  onToast,
  onAuditLog,
}: LandingCmsHubTabProps) {
  const [subTab, setSubTab] = useState<"casestudies" | "enquiries" | "passes">(
    initialSubTab
  );

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  return (
    <div className="flex flex-col gap-6">
      {/* CMS Sub-navigation bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSubTab("casestudies")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subTab === "casestudies"
                ? "bg-[#E25C38] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>Case Studies (5 Dossiers)</span>
          </button>

          <button
            onClick={() => setSubTab("enquiries")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subTab === "enquiries"
                ? "bg-[#E25C38] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <UsersIcon className="w-3.5 h-3.5" />
            <span>Partner Inquiries</span>
          </button>

          <button
            onClick={() => setSubTab("passes")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subTab === "passes"
                ? "bg-[#E25C38] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <IdCardIcon className="w-3.5 h-3.5" />
            <span>Access Pass Ledger</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 px-2 sm:text-right">
          LANDING_PORTAL_CONTROLS
        </div>
      </div>

      {/* RENDER SUB-TAB */}
      {subTab === "casestudies" && (
        <CaseStudiesCmsTab onAuditLog={onAuditLog} />
      )}

      {subTab === "enquiries" && (
        <EnquiriesTab onToast={onToast} onAuditLog={onAuditLog} />
      )}

      {subTab === "passes" && (
        <PassLedgerTab onToast={onToast} onAuditLog={onAuditLog} />
      )}
    </div>
  );
}
