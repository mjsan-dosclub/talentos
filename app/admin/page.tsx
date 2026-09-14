"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import SidebarNav, { SidebarGroup } from "@/components/SidebarNav";
import {
  UsersIcon,
  AcademicCapIcon,
  BuildingIcon,
  BoltIcon,
  ClipboardListIcon,
  SettingsIcon,
  XIcon,
  RadioIcon,
  FileTextIcon,
  BellIcon,
  CalendarIcon,
  SparklesIcon,
} from "@/components/Icons";
import PopupsTab from "@/components/admin/PopupsTab";
import LandingCmsTab from "@/components/admin/LandingCmsTab";
import EnquiriesTab from "@/components/admin/EnquiriesTab";
import PushNotificationsTab from "@/components/admin/PushNotificationsTab";
import NotificationEngineTab from "@/components/admin/NotificationEngineTab";
import WorkshopScheduleTab from "@/components/admin/WorkshopScheduleTab";
import CaseStudiesCmsTab from "@/components/admin/CaseStudiesCmsTab";

import { WORKSHOP_TOPICS_27 } from "@/lib/db";
import { formatConfigDateTime } from "@/lib/datetime";

// Types
interface StudentMember {
  id: string;
  dosId: string;
  fullName: string;
  email: string;
  institution: string;
  department: string;
  batch: string;
  completedWorkshops: number;
  status: "ACTIVE" | "ON_LEAVE" | "DEFENSE_READY";
}

interface ExpertMentor {
  id: string;
  fullName: string;
  email: string;
  organization: string;
  domainSpecialties: string[];
  assignedWorkshops: string[];
  status: "ACTIVE" | "STANDBY";
  avatar: string;
}

interface PartnerInstitution {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  geofenceRadiusMeters: number;
  studentCount: number;
  status: "ACTIVE" | "ONBOARDING";
}

interface WorkshopItem {
  code: string;
  title: string;
  focusArea: string;
  expertName: string;
  mode: "IN_PERSON" | "HYBRID" | "VIRTUAL";
  testPassThreshold: number;
  status: "COMPLETED" | "ACTIVE_IN_SESSION" | "SCHEDULED";
  date: string;
}

interface AuditLogEntry {
  id: string;
  category: "Students" | "Experts" | "Attendance" | "Certifications" | "System";
  subcategory: string;
  action: "Create" | "Update" | "Perform" | "Archive";
  modifiedBy: {
    name: string;
    email: string;
    avatar: string;
  };
  dateOfChange: string;
  sourceText: string;
  sourceUrl?: string;
}

// Initial Mock Seed Data
const INITIAL_STUDENTS: StudentMember[] = [
  {
    id: "a0000001",
    dosId: "DOS-B3-001",
    fullName: "Arunachalam Sundaram",
    email: "arun@student.dosclub.org",
    institution: "Anna University Campus Hub",
    department: "Computer Technology",
    batch: "Batch 3 - 2026",
    completedWorkshops: 14,
    status: "ACTIVE",
  },
  {
    id: "a0000002",
    dosId: "DOS-B3-002",
    fullName: "Kavitha Raman",
    email: "kavitha@student.dosclub.org",
    institution: "PSG Tech Innovation Hub",
    department: "Information Technology",
    batch: "Batch 3 - 2026",
    completedWorkshops: 14,
    status: "ACTIVE",
  },
  {
    id: "a0000003",
    dosId: "DOS-B3-003",
    fullName: "Dinesh Kumar V.",
    email: "dinesh@student.dosclub.org",
    institution: "NIT Trichy Center",
    department: "ECE Systems",
    batch: "Batch 3 - 2026",
    completedWorkshops: 13,
    status: "ACTIVE",
  },
  {
    id: "a0000004",
    dosId: "DOS-B3-004",
    fullName: "Meera Subramanian",
    email: "meera@student.dosclub.org",
    institution: "IIT Madras Research Park",
    department: "Distributed Systems",
    batch: "Batch 3 - 2026",
    completedWorkshops: 14,
    status: "DEFENSE_READY",
  },
  {
    id: "a0000005",
    dosId: "DOS-B3-005",
    fullName: "Siddharth Rajan",
    email: "siddharth@student.dosclub.org",
    institution: "Anna University Campus Hub",
    department: "Computer Applications",
    batch: "Batch 3 - 2026",
    completedWorkshops: 12,
    status: "ACTIVE",
  },
];

const INITIAL_EXPERTS: ExpertMentor[] = [
  {
    id: "exp-001",
    fullName: "Priya Sundaram",
    email: "priya.lead@descience.org",
    organization: "DeScience Systems Lab Singapore",
    domainSpecialties: ["Distributed Systems", "Fault Tolerance", "Microservices"],
    assignedWorkshops: ["WS-14", "WS-15", "WS-16"],
    status: "ACTIVE",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "exp-002",
    fullName: "Dr. Vikram Sethupathi",
    email: "vikram@kernelresearch.in",
    organization: "Indian Institute of Science (IISc)",
    domainSpecialties: ["Linux Kernel", "Memory Management", "eBPF Tracing"],
    assignedWorkshops: ["WS-01", "WS-02", "WS-03", "WS-20"],
    status: "ACTIVE",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "exp-003",
    fullName: "Anandhakrishnan R.",
    email: "anand@openprotocols.sg",
    organization: "Open Protocols Foundation",
    domainSpecialties: ["Database Internals", "LSM-Trees", "Raft Consensus"],
    assignedWorkshops: ["WS-08", "WS-09", "WS-11"],
    status: "ACTIVE",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
  },
  {
    id: "exp-004",
    fullName: "Shalini Murugan",
    email: "shalini@appliedcrypto.org",
    organization: "Applied Cryptography Labs",
    domainSpecialties: ["Zero-Knowledge Proofs", "Elliptic Curves", "Security"],
    assignedWorkshops: ["WS-18", "WS-19"],
    status: "STANDBY",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
  },
];

const INITIAL_INSTITUTIONS: PartnerInstitution[] = [
  {
    id: "inst-001",
    code: "AU-DOS-01",
    name: "Anna University & DOS Club Hub",
    city: "Chennai",
    state: "Tamil Nadu",
    lat: 13.011,
    lng: 80.2354,
    geofenceRadiusMeters: 200,
    studentCount: 42,
    status: "ACTIVE",
  },
  {
    id: "inst-002",
    code: "PSG-DOS-02",
    name: "PSG College of Technology Hub",
    city: "Coimbatore",
    state: "Tamil Nadu",
    lat: 11.0247,
    lng: 77.0028,
    geofenceRadiusMeters: 250,
    studentCount: 35,
    status: "ACTIVE",
  },
  {
    id: "inst-003",
    code: "NITT-DOS-03",
    name: "NIT Trichy Engineering Hub",
    city: "Tiruchirappalli",
    state: "Tamil Nadu",
    lat: 10.7589,
    lng: 78.8132,
    geofenceRadiusMeters: 300,
    studentCount: 28,
    status: "ACTIVE",
  },
];

const INITIAL_WORKSHOPS: WorkshopItem[] = WORKSHOP_TOPICS_27.map((topic, i) => {
  const num = i + 1;
  const code = `WS-${String(num).padStart(2, "0")}`;
  const status: "COMPLETED" | "ACTIVE_IN_SESSION" | "SCHEDULED" =
    num < 14 ? "COMPLETED" : num === 14 ? "ACTIVE_IN_SESSION" : "SCHEDULED";
  const expertName = num >= 14 && num <= 16 ? "Priya Sundaram" : num <= 3 ? "Dr. Vikram Sethupathi" : "Anandhakrishnan R.";

  return {
    code,
    title: topic,
    focusArea: num <= 6 ? "Core Systems & I/O" : num <= 13 ? "Databases & Storage" : num <= 17 ? "Distributed Systems" : "Specialized War Room",
    expertName,
    mode: num % 2 === 0 ? "HYBRID" : "IN_PERSON",
    testPassThreshold: 20,
    status,
    date: `2026-${String(Math.floor(i / 4) + 3).padStart(2, "0")}-${String((i % 4) * 7 + 10).padStart(2, "0")}`,
  };
});

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "aud-001",
    category: "Attendance",
    subcategory: "Geofence Check-In",
    action: "Perform",
    modifiedBy: {
      name: "Arunachalam Sundaram",
      email: "arun@student.dosclub.org",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    },
    dateOfChange: "14 Sep 2026 08:25 AM IST",
    sourceText: "WS-14 Beacon Check-in (AU-DOS-01)",
    sourceUrl: "/checkin",
  },
  {
    id: "aud-002",
    category: "Experts",
    subcategory: "Workshop Assignment",
    action: "Update",
    modifiedBy: {
      name: "Karthikeyan P.",
      email: "admin@dosclub.org",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
    },
    dateOfChange: "14 Sep 2026 07:15 AM IST",
    sourceText: "Assigned Priya Sundaram to WS-14",
    sourceUrl: "/trainer",
  },
  {
    id: "aud-003",
    category: "Certifications",
    subcategory: "SHA-256 Ledger Stamp",
    action: "Create",
    modifiedBy: {
      name: "System Worker Daemon",
      email: "daemon@dosclub.org",
      avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    },
    dateOfChange: "13 Sep 2026 09:40 PM IST",
    sourceText: "Cert Hash 62c81542f5c668acd536e379182",
    sourceUrl: "/ledger/DOS-CERT-2026-001",
  },
  {
    id: "aud-004",
    category: "Students",
    subcategory: "Profile Creation",
    action: "Create",
    modifiedBy: {
      name: "Dr. K. Ramanathan",
      email: "coordinator@annauniv.edu",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    },
    dateOfChange: "12 Sep 2026 11:20 AM IST",
    sourceText: "Enrolled DOS-B3-005 into Anna Univ Hub",
    sourceUrl: "/college",
  },
];

function AdminHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "students";

  // State
  const [students, setStudents] = useState<StudentMember[]>(INITIAL_STUDENTS);
  const [experts, setExperts] = useState<ExpertMentor[]>(INITIAL_EXPERTS);
  const [institutions, setInstitutions] = useState<PartnerInstitution[]>(INITIAL_INSTITUTIONS);
  const [workshops, setWorkshops] = useState<WorkshopItem[]>(INITIAL_WORKSHOPS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [auditCategoryFilter, setAuditCategoryFilter] = useState("All");

  // Modals
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddExpertOpen, setIsAddExpertOpen] = useState(false);
  const [isAddInstitutionOpen, setIsAddInstitutionOpen] = useState(false);
  const [isAddWorkshopOpen, setIsAddWorkshopOpen] = useState(false);

  // New Student Form State
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentDept, setNewStudentDept] = useState("Computer Science & Engineering");
  const [newStudentInst, setNewStudentInst] = useState("Anna University Campus Hub");

  // New Expert Form State
  const [newExpertName, setNewExpertName] = useState("");
  const [newExpertEmail, setNewExpertEmail] = useState("");
  const [newExpertOrg, setNewExpertOrg] = useState("");
  const [newExpertSpecialty, setNewExpertSpecialty] = useState("");

  // New Institution Form State
  const [newInstCode, setNewInstCode] = useState("");
  const [newInstName, setNewInstName] = useState("");
  const [newInstCity, setNewInstCity] = useState("");
  const [newInstRadius, setNewInstRadius] = useState(200);

  // New Workshop Form State
  const [newWsCode, setNewWsCode] = useState("");
  const [newWsTitle, setNewWsTitle] = useState("");
  const [newWsFocus, setNewWsFocus] = useState("");
  const [newWsExpert, setNewWsExpert] = useState("Priya Sundaram");

  // Welcome Email Sequence Toggles
  const [sendWelcomeEmailStudent, setSendWelcomeEmailStudent] = useState(true);
  const [sendWelcomeEmailExpert, setSendWelcomeEmailExpert] = useState(true);
  const [sendWelcomeEmailInstitution, setSendWelcomeEmailInstitution] = useState(true);

  // Notification Toast
  const [toast, setToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Handlers
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentEmail.trim()) return;

    const nextNumber = String(students.length + 1).padStart(3, "0");
    const created: StudentMember = {
      id: `a00000${nextNumber}`,
      dosId: `DOS-B3-${nextNumber}`,
      fullName: newStudentName.trim(),
      email: newStudentEmail.trim(),
      institution: newStudentInst,
      department: newStudentDept,
      batch: "Batch 3 - 2026",
      completedWorkshops: 0,
      status: "ACTIVE",
    };

    setStudents([created, ...students]);
    setIsAddStudentOpen(false);
    setNewStudentName("");
    setNewStudentEmail("");
    if (sendWelcomeEmailStudent) {
      console.log(`[TalentOS Notification] 2-Step Welcome & Verification Email dispatched to ${created.email}`);
      triggerToast(`Enrolled ${created.fullName} (${created.dosId}) • Welcome & Verification email sent!`);
    } else {
      triggerToast(`Enrolled ${created.fullName} (${created.dosId})`);
    }
  };

  const handleCreateExpert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpertName.trim() || !newExpertEmail.trim()) return;

    const created: ExpertMentor = {
      id: `exp-${String(experts.length + 1).padStart(3, "0")}`,
      fullName: newExpertName.trim(),
      email: newExpertEmail.trim(),
      organization: newExpertOrg.trim() || "Independent Industry Expert",
      domainSpecialties: newExpertSpecialty.split(",").map((s) => s.trim()).filter(Boolean),
      assignedWorkshops: ["WS-14"],
      status: "ACTIVE",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    };

    setExperts([created, ...experts]);
    setIsAddExpertOpen(false);
    setNewExpertName("");
    setNewExpertEmail("");
    setNewExpertOrg("");
    setNewExpertSpecialty("");
    if (sendWelcomeEmailExpert) {
      console.log(`[TalentOS Notification] Expert Welcome & Cockpit Credentials dispatched to ${created.email}`);
      triggerToast(`Registered ${created.fullName} • Cockpit pass & calendar sync emailed!`);
    } else {
      triggerToast(`Registered Expert Mentor: ${created.fullName}`);
    }
  };

  const handleCreateInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstName.trim() || !newInstCode.trim()) return;

    const created: PartnerInstitution = {
      id: `inst-${String(institutions.length + 1).padStart(3, "0")}`,
      code: newInstCode.trim().toUpperCase(),
      name: newInstName.trim(),
      city: newInstCity.trim() || "Tamil Nadu",
      state: "Tamil Nadu",
      lat: 13.011,
      lng: 80.2354,
      geofenceRadiusMeters: Number(newInstRadius) || 200,
      studentCount: 0,
      status: "ACTIVE",
    };

    setInstitutions([...institutions, created]);
    setIsAddInstitutionOpen(false);
    setNewInstCode("");
    setNewInstName("");
    setNewInstCity("");
    if (sendWelcomeEmailInstitution) {
      console.log(`[TalentOS Notification] Partner Institution Onboarding Email dispatched for ${created.name}`);
      triggerToast(`Added ${created.name} • Campus coordinator onboarding emailed!`);
    } else {
      triggerToast(`Added Partner Institution: ${created.name}`);
    }
  };

  const handleCreateWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsTitle.trim()) return;

    const code = newWsCode.trim().toUpperCase() || `WS-${String(workshops.length + 1).padStart(2, "0")}`;
    const created: WorkshopItem = {
      code,
      title: newWsTitle.trim(),
      focusArea: newWsFocus.trim() || "Applied Systems",
      expertName: newWsExpert,
      mode: "IN_PERSON",
      testPassThreshold: 20,
      status: "SCHEDULED",
      date: new Date().toISOString().slice(0, 10),
    };

    setWorkshops([...workshops, created]);
    setIsAddWorkshopOpen(false);
    setNewWsCode("");
    setNewWsTitle("");
    setNewWsFocus("");
    triggerToast(`Curriculum updated: Added ${created.code} (${created.title})`);
  };

  // Sidebar Menu Groups (HubSpot reference navigation)
  const sidebarGroups: SidebarGroup[] = [
    {
      title: "Data Management",
      items: [
        { id: "students", label: "Students", icon: <UsersIcon className="w-4 h-4" />, count: students.length },
        { id: "experts", label: "Experts", icon: <AcademicCapIcon className="w-4 h-4" />, count: experts.length, badge: "NEW" },
        { id: "institutions", label: "Institutions", icon: <BuildingIcon className="w-4 h-4" />, count: institutions.length },
        { id: "enquiries", label: "Admissions Enquiries", icon: <UsersIcon className="w-4 h-4" />, badge: "NEW" },
      ],
    },
    {
      title: "Curriculum & Execution",
      items: [
        { id: "workshops", label: "Workshops (27)", icon: <BoltIcon className="w-4 h-4" />, count: workshops.length },
        { id: "schedule", label: "Workshop Schedule & Calendar", icon: <CalendarIcon className="w-4 h-4" />, badge: "LIVE CALENDAR" },
      ],
    },
    {
      title: "Content & Broadcast",
      items: [
        { id: "casestudies", label: "Case Studies Blog CMS", icon: <SparklesIcon className="w-4 h-4" />, badge: "BLOG" },
        { id: "notifications", label: "Notification Engine", icon: <BellIcon className="w-4 h-4" />, badge: "3-WAY" },
        { id: "popups", label: "Flash News & Popups", icon: <RadioIcon className="w-4 h-4" />, badge: "LIVE" },
        { id: "cms", label: "Landing Page CMS", icon: <FileTextIcon className="w-4 h-4" /> },
        { id: "push", label: "Push Notifications", icon: <RadioIcon className="w-4 h-4" />, badge: "FCM" },
      ],
    },
    {
      title: "Governance & Tools",
      items: [
        { id: "audit", label: "Audit Logs", icon: <ClipboardListIcon className="w-4 h-4" />, count: auditLogs.length },
        { id: "settings", label: "Settings", icon: <SettingsIcon className="w-4 h-4" /> },
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
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium rounded-lg shadow-sm flex items-center justify-between">
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

          {/* ========================================================================= */}
          {/* TAB 1: MANAGE STUDENTS                                                    */}
          {/* ========================================================================= */}
          {activeTab === "students" && (
            <div className="flex flex-col gap-6">
              {/* Header & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Student Roster Management
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage enrolled student members, inspect longitudinal growth records, and monitor progress across Batch 3.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsAddStudentOpen(true)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <span>+ Enroll Student</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by student name, email, or DOS ID..."
                  className="flex-1 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800"
                />
                <select className="border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-700 bg-white">
                  <option>Batch 3 - 2026 (Active)</option>
                  <option>All Cohorts</option>
                </select>
              </div>

              {/* Students Table */}
              <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Member Name</th>
                        <th className="py-3 px-4">DOS ID</th>
                        <th className="py-3 px-4">Institution / Department</th>
                        <th className="py-3 px-4 text-center">Workshops Completed</th>
                        <th className="py-3 px-4 text-center">Lifecycle Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students
                        .filter(
                          (s) =>
                            s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.dosId.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((student) => (
                          <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                                  {student.fullName.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-slate-900">{student.fullName}</span>
                                  <span className="text-[11px] text-slate-400">{student.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono font-medium text-slate-700">
                              {student.dosId}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col">
                                <span className="text-slate-800 font-medium">{student.institution}</span>
                                <span className="text-[11px] text-slate-400">{student.department}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {student.completedWorkshops} / 27
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  student.status === "DEFENSE_READY"
                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                {student.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Link
                                href={`/record/${encodeURIComponent(student.dosId)}`}
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                              >
                                View 360 &rarr;
                              </Link>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: MANAGE EXPERTS (Renamed from Trainers)                             */}
          {/* ========================================================================= */}
          {activeTab === "experts" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-medium text-[10px] uppercase tracking-wider mb-1.5">
                    TECHNICAL MENTORS & LEAD FACULTY
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Technical Experts Management
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage expert mentors who lead live workshops, verify student evidence, and conduct production code defenses.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddExpertOpen(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <span>+ Add New Expert</span>
                </button>
              </div>

              {/* Experts Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {experts.map((exp) => (
                  <div key={exp.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={exp.avatar}
                          alt={exp.fullName}
                          className="h-12 w-12 rounded-full object-cover border border-slate-200 shadow-xs"
                        />
                        <div className="flex flex-col">
                          <h3 className="font-bold text-sm text-slate-900">{exp.fullName}</h3>
                          <span className="text-xs text-slate-500">{exp.organization}</span>
                          <span className="text-[11px] text-slate-400 font-mono mt-0.5">{exp.email}</span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {exp.status}
                      </span>
                    </div>

                    {/* Domain Specialties */}
                    <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Domain Specialties:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {exp.domainSpecialties.map((spec, i) => (
                          <span
                            key={i}
                            className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Assigned Workshops */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <span className="font-semibold text-slate-800">Assigned:</span>
                        <span className="font-mono text-xs font-bold text-blue-600">
                          {exp.assignedWorkshops.join(", ")}
                        </span>
                      </div>

                      <Link
                        href="/trainer"
                        className="text-xs font-semibold text-slate-800 hover:text-blue-600 transition-colors"
                      >
                        Launch Cockpit &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: MANAGE INSTITUTIONS                                                */}
          {/* ========================================================================= */}
          {activeTab === "institutions" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Partner Institutions & Campus Hubs
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage college campuses, configure venue GPS coordinates for geofence verification, and monitor cohort enrollment.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddInstitutionOpen(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <span>+ Add Partner Campus</span>
                </button>
              </div>

              {/* Institutions List Table */}
              <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Institution Name</th>
                      <th className="py-3 px-4">Region / City</th>
                      <th className="py-3 px-4">GPS Geofence (Radius)</th>
                      <th className="py-3 px-4 text-center">Enrolled Members</th>
                      <th className="py-3 px-4 text-right">Hub Portal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {institutions.map((inst) => (
                      <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {inst.code}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900">{inst.name}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {inst.city}, {inst.state}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                          {inst.lat}° N, {inst.lng}° E ({inst.geofenceRadiusMeters}m limit)
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {inst.studentCount} Students
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href="/college"
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            Coordinator View &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: MANAGE WORKSHOPS (Curriculum 27)                                    */}
          {/* ========================================================================= */}
          {activeTab === "workshops" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    27-Workshop Curriculum Registry
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage session definitions, scheduled execution dates, test pass requirements, and assigned expert mentors.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddWorkshopOpen(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <span>+ Schedule Workshop</span>
                </button>
              </div>

              {/* Workshops Table */}
              <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Code</th>
                        <th className="py-3 px-4">Technical Curriculum Title</th>
                        <th className="py-3 px-4">Focus Domain</th>
                        <th className="py-3 px-4">Assigned Expert</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Scheduled Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {workshops.map((ws) => (
                        <tr key={ws.code} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">
                            {ws.code}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {ws.title}
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                              {ws.focusArea}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-medium">
                            {ws.expertName}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                ws.status === "ACTIVE_IN_SESSION"
                                  ? "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                                  : ws.status === "COMPLETED"
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {ws.status === "ACTIVE_IN_SESSION" ? (
                                <span className="inline-flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
                                  <span>LIVE IN SESSION</span>
                                </span>
                              ) : ws.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-500">
                            {ws.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: AUDIT LOGS (HubSpot Reference Style)                                 */}
          {/* ========================================================================= */}
          {activeTab === "audit" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Audit Logs
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Get an immutable report showing administrative actions, student check-ins, and cryptographic ledger activities.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => triggerToast("Audit log CSV report exported successfully.")}
                    className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md transition-colors shadow-2xs"
                  >
                    Export Report
                  </button>
                </div>
              </div>

              {/* Filters (Modeled on HubSpot image media_1789356488472.png) */}
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Category:</span>
                  <select
                    value={auditCategoryFilter}
                    onChange={(e) => setAuditCategoryFilter(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white"
                  >
                    <option value="All">All Categories</option>
                    <option value="Attendance">Attendance</option>
                    <option value="Experts">Experts</option>
                    <option value="Students">Students</option>
                    <option value="Certifications">Certifications</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Action:</span>
                  <select className="border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white">
                    <option>All Actions</option>
                    <option>Create</option>
                    <option>Update</option>
                    <option>Perform</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Modified by:</span>
                  <select className="border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white">
                    <option>Anyone</option>
                    <option>Karthikeyan P.</option>
                    <option>Priya Sundaram</option>
                    <option>Dr. K. Ramanathan</option>
                  </select>
                </div>
              </div>

              {/* Audit Table */}
              <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Subcategory</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Modified By</th>
                      <th className="py-3 px-4">Date of Change</th>
                      <th className="py-3 px-4 text-right">Source Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs
                      .filter((log) => auditCategoryFilter === "All" || log.category === auditCategoryFilter)
                      .map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800">{log.category}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{log.subcategory}</td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-slate-800">{log.action}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={log.modifiedBy.avatar}
                                alt={log.modifiedBy.name}
                                className="h-6 w-6 rounded-full object-cover border border-slate-200"
                              />
                              <div className="flex flex-col">
                                <span className="font-medium text-slate-900">{log.modifiedBy.name}</span>
                                <span className="text-[10px] text-slate-400">{log.modifiedBy.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                            {log.dateOfChange}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {log.sourceUrl ? (
                              <Link
                                href={log.sourceUrl}
                                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                              >
                                <span>{log.sourceText}</span>
                                <span className="text-[10px]">↗</span>
                              </Link>
                            ) : (
                              <span className="text-slate-400">{log.sourceText}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: FLASH NEWS & WELCOME POPUPS                                       */}
          {/* ========================================================================= */}
          {activeTab === "popups" && (
            <PopupsTab onToast={triggerToast} />
          )}

          {/* ========================================================================= */}
          {/* TAB 7: LANDING PAGE CMS                                                   */}
          {/* ========================================================================= */}
          {activeTab === "cms" && (
            <LandingCmsTab onToast={triggerToast} />
          )}

          {/* ========================================================================= */}
          {/* TAB 8: ADMISSIONS ENQUIRIES                                               */}
          {/* ========================================================================= */}
          {activeTab === "enquiries" && (
            <EnquiriesTab onToast={triggerToast} />
          )}

          {/* ========================================================================= */}
          {/* TAB 9: TARGETED NOTIFICATION ENGINE (EMAIL | WHATSAPP | PUSH)             */}
          {/* ========================================================================= */}
          {activeTab === "notifications" && (
            <NotificationEngineTab onToast={triggerToast} />
          )}

          {/* ========================================================================= */}
          {/* TAB 10: PUSH NOTIFICATIONS (FIREBASE & PWA)                               */}
          {/* ========================================================================= */}
          {activeTab === "push" && (
            <PushNotificationsTab onToast={triggerToast} />
          )}

          {/* ========================================================================= */}
          {/* TAB 11: MULTI-COLLEGE WORKSHOP SCHEDULE & CALENDAR                        */}
          {/* ========================================================================= */}
          {activeTab === "schedule" && (
            <WorkshopScheduleTab />
          )}

          {/* ========================================================================= */}
          {/* TAB 12: CASE STUDIES BLOG CMS                                             */}
          {/* ========================================================================= */}
          {activeTab === "casestudies" && (
            <CaseStudiesCmsTab />
          )}
        </main>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ENROLL STUDENT                                                   */}
      {/* ========================================================================= */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Enroll New Student Member</h2>
              <button
                onClick={() => setIsAddStudentOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                aria-label="Close"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Full Name:</label>
                <input
                  type="text"
                  required
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g. Anandhi Natarajan"
                  className="border border-slate-300 rounded p-2 focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Institutional Email:</label>
                <input
                  type="email"
                  required
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="anandhi@student.dosclub.org"
                  className="border border-slate-300 rounded p-2 focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Department:</label>
                <input
                  type="text"
                  value={newStudentDept}
                  onChange={(e) => setNewStudentDept(e.target.value)}
                  className="border border-slate-300 rounded p-2 focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Institution Hub:</label>
                <select
                  value={newStudentInst}
                  onChange={(e) => setNewStudentInst(e.target.value)}
                  className="border border-slate-300 rounded p-2 bg-white"
                >
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.name}>
                      {inst.name} ({inst.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50/50 border border-emerald-200">
                <input
                  type="checkbox"
                  id="sendWelcomeStudent"
                  checked={sendWelcomeEmailStudent}
                  onChange={(e) => setSendWelcomeEmailStudent(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 cursor-pointer mt-0.5"
                />
                <label htmlFor="sendWelcomeStudent" className="text-xs text-slate-700 cursor-pointer leading-snug">
                  <span className="font-bold text-slate-900">Send 2-Step Welcome & Verification Email</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Requests email whitelisting, confirms student inbox, and delivers curriculum pass & DOS ID.
                  </p>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded"
                >
                  Complete Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD EXPERT                                                       */}
      {/* ========================================================================= */}
      {isAddExpertOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Add Technical Expert Mentor</h2>
              <button
                onClick={() => setIsAddExpertOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                aria-label="Close"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpert} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Expert Name:</label>
                <input
                  type="text"
                  required
                  value={newExpertName}
                  onChange={(e) => setNewExpertName(e.target.value)}
                  placeholder="e.g. Ramesh Chandran"
                  className="border border-slate-300 rounded p-2 focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Email Address:</label>
                <input
                  type="email"
                  required
                  value={newExpertEmail}
                  onChange={(e) => setNewExpertEmail(e.target.value)}
                  placeholder="ramesh@systems.org"
                  className="border border-slate-300 rounded p-2 focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Organization / Company:</label>
                <input
                  type="text"
                  value={newExpertOrg}
                  onChange={(e) => setNewExpertOrg(e.target.value)}
                  placeholder="e.g. Red Hat Kernel Team / Singapore"
                  className="border border-slate-300 rounded p-2 focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Domain Specialties (Comma separated):</label>
                <input
                  type="text"
                  value={newExpertSpecialty}
                  onChange={(e) => setNewExpertSpecialty(e.target.value)}
                  placeholder="e.g. Linux Kernel, Concurrency, eBPF"
                  className="border border-slate-300 rounded p-2 focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50/50 border border-emerald-200">
                <input
                  type="checkbox"
                  id="sendWelcomeExpert"
                  checked={sendWelcomeEmailExpert}
                  onChange={(e) => setSendWelcomeEmailExpert(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 cursor-pointer mt-0.5"
                />
                <label htmlFor="sendWelcomeExpert" className="text-xs text-slate-700 cursor-pointer leading-snug">
                  <span className="font-bold text-slate-900">Send Cockpit Pass & 1-Click Calendar Sync</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Dispatches expert cockpit credentials and free Google/Apple Calendar integration links.
                  </p>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddExpertOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded"
                >
                  Register Expert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD INSTITUTION                                                  */}
      {/* ========================================================================= */}
      {isAddInstitutionOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Add Partner Institution</h2>
              <button
                onClick={() => setIsAddInstitutionOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                aria-label="Close"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInstitution} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Institution Code:</label>
                <input
                  type="text"
                  required
                  value={newInstCode}
                  onChange={(e) => setNewInstCode(e.target.value)}
                  placeholder="e.g. TCE-DOS-04"
                  className="border border-slate-300 rounded p-2 uppercase font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Campus Name:</label>
                <input
                  type="text"
                  required
                  value={newInstName}
                  onChange={(e) => setNewInstName(e.target.value)}
                  placeholder="e.g. Thiagarajar College of Engineering Hub"
                  className="border border-slate-300 rounded p-2"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">City / District:</label>
                <input
                  type="text"
                  value={newInstCity}
                  onChange={(e) => setNewInstCity(e.target.value)}
                  placeholder="e.g. Madurai"
                  className="border border-slate-300 rounded p-2"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Geofence Radius (Meters):</label>
                <input
                  type="number"
                  value={newInstRadius}
                  onChange={(e) => setNewInstRadius(Number(e.target.value))}
                  className="border border-slate-300 rounded p-2 font-mono"
                />
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50/50 border border-emerald-200">
                <input
                  type="checkbox"
                  id="sendWelcomeInstitution"
                  checked={sendWelcomeEmailInstitution}
                  onChange={(e) => setSendWelcomeEmailInstitution(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 cursor-pointer mt-0.5"
                />
                <label htmlFor="sendWelcomeInstitution" className="text-xs text-slate-700 cursor-pointer leading-snug">
                  <span className="font-bold text-slate-900">Send Coordinator Portal Onboarding Email</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Emails coordinator login pass, student tracking instructions, and campus IT whitelisting notice.
                  </p>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddInstitutionOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded"
                >
                  Onboard Campus Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADD WORKSHOP                                                     */}
      {/* ========================================================================= */}
      {isAddWorkshopOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Schedule Curriculum Workshop</h2>
              <button
                onClick={() => setIsAddWorkshopOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                aria-label="Close"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkshop} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Workshop Code:</label>
                <input
                  type="text"
                  value={newWsCode}
                  onChange={(e) => setNewWsCode(e.target.value)}
                  placeholder="e.g. WS-28"
                  className="border border-slate-300 rounded p-2 uppercase font-mono"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Workshop Title:</label>
                <input
                  type="text"
                  required
                  value={newWsTitle}
                  onChange={(e) => setNewWsTitle(e.target.value)}
                  placeholder="e.g. Advanced eBPF Observability & XDP Topologies"
                  className="border border-slate-300 rounded p-2"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Focus Domain:</label>
                <input
                  type="text"
                  value={newWsFocus}
                  onChange={(e) => setNewWsFocus(e.target.value)}
                  placeholder="e.g. Kernel Networking"
                  className="border border-slate-300 rounded p-2"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Assigned Expert Mentor:</label>
                <select
                  value={newWsExpert}
                  onChange={(e) => setNewWsExpert(e.target.value)}
                  className="border border-slate-300 rounded p-2 bg-white"
                >
                  {experts.map((exp) => (
                    <option key={exp.id} value={exp.fullName}>
                      {exp.fullName} ({exp.organization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddWorkshopOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-700 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded"
                >
                  Add to Curriculum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono">LOADING_ADMIN_HUB...</div>}>
      <AdminHubContent />
    </Suspense>
  );
}
