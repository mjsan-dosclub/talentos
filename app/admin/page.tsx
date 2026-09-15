"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import SidebarNav, { SidebarGroup } from "@/components/SidebarNav";
import {
  UsersIcon,
  BoltIcon,
  BuildingIcon,
  AcademicCapIcon,
  SparklesIcon,
  ClipboardListIcon,
  SettingsIcon,
  BellIcon,
  RadioIcon,
  MailIcon,
  XIcon,
} from "@/components/Icons";

import { getClientSession } from "@/lib/session";
import {
  StudentMember,
  ExpertMentor,
  PartnerInstitution,
  WorkshopItem,
  AuditLogEntry,
  INITIAL_STUDENTS,
  INITIAL_EXPERTS,
  INITIAL_INSTITUTIONS,
  INITIAL_WORKSHOPS,
  INITIAL_AUDIT_LOGS,
} from "@/lib/admin-data";

import StudentsTab from "@/components/admin/StudentsTab";
import WorkshopsTab from "@/components/admin/WorkshopsTab";
import InstitutionsTab from "@/components/admin/InstitutionsTab";
import MentorsTab from "@/components/admin/MentorsTab";
import LandingCmsHubTab from "@/components/admin/LandingCmsHubTab";
import GovernanceTab from "@/components/admin/GovernanceTab";
import PopupsTab from "@/components/admin/PopupsTab";
import PushNotificationsTab from "@/components/admin/PushNotificationsTab";
import NotificationEngineTab from "@/components/admin/NotificationEngineTab";

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawTab = searchParams.get("tab") || "students";

  // Enforce SUPER_ADMIN role clearance client-side
  useEffect(() => {
    const session = getClientSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      router.replace(
        `/login?error=ERR_ACCESS_DENIED_ADMIN_ONLY&redirect=${encodeURIComponent(
          window.location.pathname + window.location.search
        )}`
      );
    }
  }, [router]);

  // Core Data State
  const [students, setStudents] = useState<StudentMember[]>(INITIAL_STUDENTS);
  const [experts, setExperts] = useState<ExpertMentor[]>(INITIAL_EXPERTS);
  const [institutions, setInstitutions] = useState<PartnerInstitution[]>(INITIAL_INSTITUTIONS);
  const [workshops, setWorkshops] = useState<WorkshopItem[]>(INITIAL_WORKSHOPS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  useEffect(() => {
    fetch("/api/students")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.students && Array.isArray(data.students)) {
          setStudents(data.students);
        }
      })
      .catch((err) => console.warn("Failed loading live students:", err));

    fetch("/api/institutions")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.institutions && Array.isArray(data.institutions)) {
          setInstitutions(data.institutions);
        }
      })
      .catch((err) => console.warn("Failed loading live institutions:", err));

    fetch("/api/workshops")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.workshops && Array.isArray(data.workshops) && data.workshops.length > 0) {
          const mapped: WorkshopItem[] = data.workshops.map((w: any) => ({
            id: w.id,
            code: `WS-${String(w.session_number).padStart(2, "0")}`,
            title: w.title,
            focusArea: w.description || "Systems Engineering",
            institution: w.venue_name?.includes("Anna") ? "Anna University & DOS Club Hub" : w.venue_name || "All Campus Hubs",
            date: w.scheduled_at?.split("T")[0] || "2026-09-20",
            time: "09:00 AM - 12:00 PM",
            status: w.is_active ? "UPCOMING" : "COMPLETED",
            registeredCount: 40,
            attendedCount: 38,
            mode: w.session_mode || "OFFLINE",
            leadExpert: w.trainer_name || "Lead Technical Expert",
            deliveryType: "Standard Curriculum",
            institutionCount: 4,
          }));
          setWorkshops(mapped);
        }
      })
      .catch((err) => console.warn("Failed loading live workshops:", err));
  }, []);

  // Toast System
  const [toast, setToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Real-time Audit Logger Helper
  const logAdminAudit = (
    category: AuditLogEntry["category"],
    subcategory: string,
    action: AuditLogEntry["action"],
    sourceText: string,
    sourceUrl?: string
  ) => {
    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      category,
      subcategory,
      action,
      modifiedBy: {
        name: "Platform Administrator (Live)",
        email: "admin@dosclub.org",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
      },
      dateOfChange: new Date().toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + " " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      sourceText,
      sourceUrl: sourceUrl || `/admin?tab=${rawTab}`,
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  // Determine active module with full URL and alias compatibility
  let activeModule:
    | "students"
    | "workshops"
    | "institutions"
    | "mentors"
    | "popups"
    | "push"
    | "notifications"
    | "cms"
    | "governance" = "students";
  let cmsSubTab: "casestudies" | "enquiries" | "passes" = "casestudies";

  if (rawTab === "students") {
    activeModule = "students";
  } else if (rawTab === "workshops" || rawTab === "schedule") {
    activeModule = "workshops";
  } else if (rawTab === "institutions") {
    activeModule = "institutions";
  } else if (rawTab === "mentors" || rawTab === "experts") {
    activeModule = "mentors";
  } else if (rawTab === "popups") {
    activeModule = "popups";
  } else if (rawTab === "push") {
    activeModule = "push";
  } else if (rawTab === "notifications") {
    activeModule = "notifications";
  } else if (
    rawTab === "cms" ||
    rawTab === "casestudies" ||
    rawTab === "enquiries" ||
    rawTab === "passes"
  ) {
    activeModule = "cms";
    if (rawTab === "enquiries" || rawTab === "passes" || rawTab === "casestudies") {
      cmsSubTab = rawTab;
    }
  } else if (rawTab === "governance" || rawTab === "audit" || rawTab === "settings") {
    activeModule = "governance";
  } else {
    activeModule = "students";
  }

  // Sidebar Menu Groups (Core Operations, Content & Broadcast, Platform & Security)
  const sidebarGroups: SidebarGroup[] = [
    {
      title: "Core Operations",
      items: [
        {
          id: "students",
          label: "Students Roster",
          icon: <UsersIcon className="w-4 h-4" />,
          count: students.length,
        },
        {
          id: "workshops",
          label: "Workshops & Curriculum",
          icon: <BoltIcon className="w-4 h-4" />,
          count: workshops.length,
          badge: "27 TOPICS",
        },
        {
          id: "institutions",
          label: "Colleges & Campus Hubs",
          icon: <BuildingIcon className="w-4 h-4" />,
          count: institutions.length,
        },
        {
          id: "mentors",
          label: "Technical Expert Mentors",
          icon: <AcademicCapIcon className="w-4 h-4" />,
          count: experts.length,
        },
      ],
    },
    {
      title: "Content & Broadcast",
      items: [
        {
          id: "popups",
          label: "Welcome Popups & News",
          icon: <RadioIcon className="w-4 h-4" />,
          badge: "LIVE",
        },
        {
          id: "push",
          label: "Push Notifications (FCM)",
          icon: <BellIcon className="w-4 h-4" />,
          badge: "WEB PUSH",
        },
        {
          id: "notifications",
          label: "Notification Engine",
          icon: <MailIcon className="w-4 h-4" />,
          badge: "3-WAY",
        },
        {
          id: "cms",
          label: "Landing & CMS Hub",
          icon: <SparklesIcon className="w-4 h-4" />,
          badge: "3 PORTALS",
        },
      ],
    },
    {
      title: "Platform & Security",
      items: [
        {
          id: "governance",
          label: "Platform Governance",
          icon: <ClipboardListIcon className="w-4 h-4" />,
          count: auditLogs.length,
        },
        {
          id: "settings",
          label: "System Settings",
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
          activeId={activeModule}
          onSelect={(id) => {
            if (id === "settings") {
              router.push("/admin/settings");
            } else {
              router.push(`/admin?tab=${id}`);
            }
          }}
        />

        {/* Right Main Content Area — full width on mobile (sidebar is a drawer) */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col gap-6 overflow-x-hidden">
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


          {/* MODULE 1: STUDENTS */}
          {activeModule === "students" && (
            <StudentsTab
              students={students}
              setStudents={setStudents}
              institutions={institutions}
              onToast={triggerToast}
              onAuditLog={logAdminAudit}
            />
          )}

          {/* MODULE 2: WORKSHOPS & CURRICULUM */}
          {activeModule === "workshops" && (
            <WorkshopsTab
              workshops={workshops}
              setWorkshops={setWorkshops}
              institutions={institutions}
              experts={experts}
              onToast={triggerToast}
              onAuditLog={logAdminAudit}
            />
          )}

          {/* MODULE 3: COLLEGES & CAMPUS HUBS */}
          {activeModule === "institutions" && (
            <InstitutionsTab
              institutions={institutions}
              setInstitutions={setInstitutions}
              onToast={triggerToast}
              onAuditLog={logAdminAudit}
            />
          )}

          {/* MODULE 4: TECHNICAL EXPERT MENTORS */}
          {activeModule === "mentors" && (
            <MentorsTab
              experts={experts}
              setExperts={setExperts}
              onToast={triggerToast}
              onAuditLog={logAdminAudit}
            />
          )}

          {/* MODULE 5: LANDING & CMS */}
          {activeModule === "cms" && (
            <LandingCmsHubTab
              initialSubTab={cmsSubTab}
              onToast={triggerToast}
              onAuditLog={logAdminAudit}
            />
          )}

          {/* MODULE: WELCOME POPUPS & FLASH ANNOUNCEMENTS */}
          {activeModule === "popups" && (
            <PopupsTab onToast={triggerToast} />
          )}

          {/* MODULE: PUSH NOTIFICATIONS (FCM) */}
          {activeModule === "push" && (
            <PushNotificationsTab onToast={triggerToast} />
          )}

          {/* MODULE: 3-WAY NOTIFICATION ENGINE (EMAIL / WA / PUSH) */}
          {activeModule === "notifications" && (
            <NotificationEngineTab onToast={triggerToast} />
          )}

          {/* MODULE 6: PLATFORM & GOVERNANCE */}
          {activeModule === "governance" && (
            <GovernanceTab
              auditLogs={auditLogs}
              setAuditLogs={setAuditLogs}
              onToast={triggerToast}
            />
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
          LOADING_TALENTOS_ADMIN_COCKPIT...
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
