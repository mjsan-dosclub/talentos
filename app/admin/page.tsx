"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import SidebarNav, { SidebarGroup } from "@/components/SidebarNav";
import {
  UsersIcon,
  SparklesIcon,
  IdCardIcon,
  SettingsIcon,
  XIcon,
} from "@/components/Icons";
import CaseStudiesCmsTab from "@/components/admin/CaseStudiesCmsTab";
import EnquiriesTab from "@/components/admin/EnquiriesTab";
import PassLedgerTab from "@/components/admin/PassLedgerTab";

interface AuditLogEntry {
  id: string;
  category: "Students" | "Experts" | "Attendance" | "Certifications" | "System";
  subcategory: string;
  action: "Create" | "Update" | "Perform" | "Archive";
  sourceText: string;
  timestamp: string;
}

function AdminHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawTab = searchParams.get("tab") || "casestudies";
  const activeTab = ["casestudies", "enquiries", "passes"].includes(rawTab)
    ? rawTab
    : "casestudies";

  // Notification Toast
  const [toast, setToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Audit Logger State
  const [, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const logAdminAudit = (
    category: "Students" | "Experts" | "Attendance" | "Certifications" | "System",
    subcategory: string,
    action: "Create" | "Update" | "Perform" | "Archive",
    sourceText: string
  ) => {
    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      category,
      subcategory,
      action,
      sourceText,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  // Sidebar Menu Groups (HubSpot reference navigation)
  const sidebarGroups: SidebarGroup[] = [
    {
      title: "Landing & Intake Operations",
      items: [
        {
          id: "casestudies",
          label: "Case Studies CMS",
          icon: <SparklesIcon className="w-4 h-4" />,
          badge: "5 DOSSIERS",
        },
        {
          id: "enquiries",
          label: "Partner Enquiries",
          icon: <UsersIcon className="w-4 h-4" />,
          badge: "LEADS",
        },
        {
          id: "passes",
          label: "Access Pass Ledger",
          icon: <IdCardIcon className="w-4 h-4" />,
          badge: "HERO VERIFIER",
        },
      ],
    },
    {
      title: "Platform & Governance",
      items: [
        {
          id: "settings",
          label: "Settings & System",
          icon: <SettingsIcon className="w-4 h-4" />,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <AppHeader />

      {/* Main Workspace Layout with HubSpot-style Left Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <SidebarNav
          groups={sidebarGroups}
          activeId={activeTab}
          onSelect={(id) => {
            if (id === "settings") {
              router.push("/admin/settings");
            } else {
              router.push(`/admin?tab=${id}`);
            }
          }}
        />

        {/* Right Main Content Area */}
        <main className="flex-1 p-6 sm:p-8 flex flex-col gap-6 overflow-x-hidden">
          {toast && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium rounded-lg shadow-sm flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-150">
              <span>{toast}</span>
              <button
                onClick={() => setToast(null)}
                className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
                aria-label="Dismiss"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TAB 1: CASE STUDIES CMS */}
          {activeTab === "casestudies" && (
            <CaseStudiesCmsTab onAuditLog={logAdminAudit} />
          )}

          {/* TAB 2: PARTNER ENQUIRIES */}
          {activeTab === "enquiries" && (
            <EnquiriesTab onToast={triggerToast} onAuditLog={logAdminAudit} />
          )}

          {/* TAB 3: ACCESS PASS LEDGER (HERO VERIFIER) */}
          {activeTab === "passes" && (
            <PassLedgerTab onToast={triggerToast} onAuditLog={logAdminAudit} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs font-mono text-slate-500">
          LOADING_TALENTOS_ADMIN...
        </div>
      }
    >
      <AdminHubContent />
    </Suspense>
  );
}
