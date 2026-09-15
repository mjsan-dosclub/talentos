"use client";

import React, { useState, useEffect } from "react";
import CaseStudiesCmsTab from "./CaseStudiesCmsTab";
import EnquiriesTab from "./EnquiriesTab";
import PassLedgerTab from "./PassLedgerTab";
import LandingCmsTab from "./LandingCmsTab";
import {
  SparklesIcon,
  UsersIcon,
  IdCardIcon,
  FileTextIcon,
} from "@/components/Icons";

interface LandingCmsHubTabProps {
  initialSubTab?: "landing" | "casestudies" | "enquiries" | "passes";
  onToast: (msg: string) => void;
  onAuditLog?: (
    category: "Students" | "Experts" | "Attendance" | "Certifications" | "System",
    subcategory: string,
    action: "Create" | "Update" | "Perform" | "Archive",
    sourceText: string
  ) => void;
}

export default function LandingCmsHubTab({
  initialSubTab = "landing",
  onToast,
  onAuditLog,
}: LandingCmsHubTabProps) {
  const [subTab, setSubTab] = useState<"landing" | "casestudies" | "enquiries" | "passes">(
    initialSubTab
  );
  const [newEnquiriesCount, setNewEnquiriesCount] = useState<number>(0);
  const [caseStudiesCount, setCaseStudiesCount] = useState<number | null>(null);

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [enqRes, csRes] = await Promise.all([
          fetch("/api/enquiry"),
          fetch("/api/casestudies"),
        ]);
        const enqData = await enqRes.json();
        if (enqData.enquiries && Array.isArray(enqData.enquiries)) {
          const newCount = enqData.enquiries.filter(
            (e: { status?: string }) => e.status === "NEW" || !e.status
          ).length;
          setNewEnquiriesCount(newCount);
        }
        const csData = await csRes.json();
        if (csData.success && Array.isArray(csData.casestudies)) {
          setCaseStudiesCount(csData.casestudies.length);
        }
      } catch (err) {
        console.error("Error fetching CMS counts:", err);
      }
    }
    fetchCounts();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* CMS Sub-navigation bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSubTab("landing")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subTab === "landing"
                ? "bg-[#E25C38] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileTextIcon className="w-3.5 h-3.5" />
            <span>Landing Page CMS</span>
          </button>

          <button
            onClick={() => setSubTab("casestudies")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              subTab === "casestudies"
                ? "bg-[#E25C38] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>
              Case Studies {caseStudiesCount !== null ? `(${caseStudiesCount} ${caseStudiesCount === 1 ? 'Dossier' : 'Dossiers'})` : ""}
            </span>
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
            {newEnquiriesCount > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  subTab === "enquiries"
                    ? "bg-white text-[#E25C38]"
                    : "bg-[#E25C38] text-white"
                }`}
              >
                {newEnquiriesCount} NEW
              </span>
            )}
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
      {subTab === "landing" && (
        <LandingCmsTab onToast={onToast} />
      )}

      {subTab === "casestudies" && (
        <CaseStudiesCmsTab onCountChange={setCaseStudiesCount} onAuditLog={onAuditLog} />
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
