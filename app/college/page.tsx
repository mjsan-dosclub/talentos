"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import SidebarNav, { SidebarGroup } from "@/components/SidebarNav";
import { getClientSession } from "@/lib/session";
import {
  UsersIcon,
  ChartBarIcon,
  ScaleIcon,
  DownloadIcon,
  AcademicCapIcon,
  XIcon,
  CheckIcon,
  CalendarIcon,
} from "@/components/Icons";
import WorkshopCalendar from "@/components/WorkshopCalendar";
import TablePagination from "@/components/admin/TablePagination";
import { WORKSHOP_TOPICS_27 } from "@/lib/db";

interface CollegeStudent {
  dosId: string;
  fullName: string;
  email: string;
  department: string;
  year: number;
  completedWorkshops: number;
  attendanceRate: number;
  lastAttended: string;
  status: "ACTIVE" | "DEFENSE_READY";
}

interface AbsenceCase {
  dosId: string;
  studentName: string;
  department: string;
  sessionCode: string;
  sessionTitle: string;
  date: string;
  provisionalStatus: "ABSENT_UNCONFIRMED" | "EXCUSED" | "ABSENT_CONFIRMED";
  confirmationNote?: string;
}

const INITIAL_COLLEGE_STUDENTS: CollegeStudent[] = [
  {
    dosId: "DOS-B3-001",
    fullName: "Arunachalam Sundaram",
    email: "arun@student.dosclub.org",
    department: "Computer Technology",
    year: 3,
    completedWorkshops: 14,
    attendanceRate: 94.2,
    lastAttended: "WS-14: Resilient Microservices",
    status: "ACTIVE",
  },
  {
    dosId: "DOS-B3-005",
    fullName: "Siddharth Rajan",
    email: "siddharth@student.dosclub.org",
    department: "Computer Applications",
    year: 4,
    completedWorkshops: 12,
    attendanceRate: 85.7,
    lastAttended: "WS-13: Paxos Algorithm",
    status: "ACTIVE",
  },
  {
    dosId: "DOS-B3-006",
    fullName: "Naveen Raj S.",
    email: "naveen@student.dosclub.org",
    department: "Computer Science & Engineering",
    year: 3,
    completedWorkshops: 13,
    attendanceRate: 88.5,
    lastAttended: "WS-13: Paxos Algorithm",
    status: "ACTIVE",
  },
  {
    dosId: "DOS-B3-007",
    fullName: "Ananya Swaminathan",
    email: "ananya@student.dosclub.org",
    department: "Information Technology",
    year: 4,
    completedWorkshops: 14,
    attendanceRate: 96.0,
    lastAttended: "WS-14: Resilient Microservices",
    status: "DEFENSE_READY",
  },
  {
    dosId: "DOS-B3-008",
    fullName: "Karthik Sundar",
    email: "karthik.s@student.dosclub.org",
    department: "Electronics & Communication",
    year: 3,
    completedWorkshops: 11,
    attendanceRate: 78.5,
    lastAttended: "WS-12: Vector Clocks",
    status: "ACTIVE",
  },
  {
    dosId: "DOS-B3-009",
    fullName: "Janani Balaji",
    email: "janani@student.dosclub.org",
    department: "Computer Technology",
    year: 3,
    completedWorkshops: 14,
    attendanceRate: 92.5,
    lastAttended: "WS-14: Resilient Microservices",
    status: "ACTIVE",
  },
];

const INITIAL_ABSENCES: AbsenceCase[] = [
  {
    dosId: "DOS-B3-006",
    studentName: "Naveen Raj S.",
    department: "Computer Science & Engineering",
    sessionCode: "WS-14",
    sessionTitle: "Resilient Microservices & Circuit Breakers",
    date: "14 Sep 2026",
    provisionalStatus: "ABSENT_UNCONFIRMED",
  },
  {
    dosId: "DOS-B3-008",
    studentName: "Karthik Sundar",
    department: "Electronics & Communication",
    sessionCode: "WS-13",
    sessionTitle: "Paxos Algorithm & Quorum Lease",
    date: "07 Sep 2026",
    provisionalStatus: "ABSENT_UNCONFIRMED",
  },
  {
    dosId: "DOS-B3-008",
    studentName: "Karthik Sundar",
    department: "Electronics & Communication",
    sessionCode: "WS-14",
    sessionTitle: "Resilient Microservices & Circuit Breakers",
    date: "14 Sep 2026",
    provisionalStatus: "ABSENT_UNCONFIRMED",
  },
];

export default function CollegeCoordinatorPage() {
  const [activeTab, setActiveTab] = useState<"students" | "workshops" | "exceptions" | "calendar">("students");
  const [students, setStudents] = useState<CollegeStudent[]>([]);
  const [absences, setAbsences] = useState<AbsenceCase[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [toast, setToast] = useState<string | null>(null);
  const [institutionName, setInstitutionName] = useState<string>("Your college");
  const [institutionId, setInstitutionId] = useState<string>("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Read authenticated college affiliation from session
  useEffect(() => {
    const session = getClientSession();
    if (!session || session.role !== "COLLEGE_ADMIN") return;
    setInstitutionName(session.name || "Your college");
    setInstitutionId(session.institution_id || session.id || "");
    fetch("/api/students", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        const expected = String(session.name || "").toLowerCase();
        const mapped = (data.students || []).filter((student: any) => {
          const value = String(student.institution || "").toLowerCase();
          return value === expected || value.includes(expected) || expected.includes(value);
        }).map((student: any) => ({
          dosId: student.dosId,
          fullName: student.fullName,
          email: student.email,
          department: student.department || "—",
          year: 0,
          completedWorkshops: 0,
          attendanceRate: 0,
          lastAttended: "—",
          status: student.status === "ACTIVE" ? "ACTIVE" : "ACTIVE",
        }));
        setStudents(mapped);
      })
      .catch(() => setStudents([]));
  }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleConfirmException = (dosId: string, sessionCode: string, status: "EXCUSED" | "ABSENT_CONFIRMED", note: string) => {
    setAbsences((prev) =>
      prev.map((a) => {
        if (a.dosId === dosId && a.sessionCode === sessionCode) {
          return {
            ...a,
            provisionalStatus: status,
            confirmationNote: note,
          };
        }
        return a;
      })
    );

    triggerToast(`${dosId} marked as ${status.replace("_", " ")} for ${sessionCode} (${note})`);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.dosId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === "All" || s.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const pendingExceptionsCount = absences.filter(
    (a) => a.provisionalStatus === "ABSENT_UNCONFIRMED"
  ).length;

  const sidebarGroups: SidebarGroup[] = [
    {
      title: "Campus Operations",
      items: [
        { id: "students", label: "Campus Students", icon: <UsersIcon className="w-4 h-4" />, count: students.length },
        { id: "calendar", label: "Workshop Calendar", icon: <CalendarIcon className="w-4 h-4" />, badge: "CALENDAR" },
        { id: "workshops", label: "Workshop Matrix", icon: <ChartBarIcon className="w-4 h-4" /> },
        { id: "exceptions", label: "Absence Exceptions", icon: <ScaleIcon className="w-4 h-4" />, count: pendingExceptionsCount },
      ],
    },
    {
      title: "Governance & Reports",
      items: [
        { id: "export_csv", label: "Export Roster (CSV)", icon: <DownloadIcon className="w-4 h-4" /> },
        { id: "defense", label: "Capstone Defense Sign-Off", icon: <AcademicCapIcon className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      {/* 1. Global AppHeader (NO top-bar navigation) */}
      <AppHeader />

      {/* 2. Main Workspace Layout with Left Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto">
        <SidebarNav
          groups={sidebarGroups}
          activeId={activeTab}
          onSelect={(id) => {
            if (id === "export_csv") {
              triggerToast("Student attendance roster downloaded as CSV.");
            } else if (id === "defense") {
              triggerToast("Capstone defense verification records loaded.");
            } else {
              setActiveTab(id as any);
            }
          }}
        />

        <main className="flex-1 p-6 sm:p-8 flex flex-col gap-6 max-w-5xl">
        {/* Toast Alert */}
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

        {/* Campus Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
              <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
                {institutionId || "CAMPUS"} • CAMPUS HUB
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {institutionName}
            </h1>
            <p className="text-xs text-slate-500">
              Coordinator: <strong className="text-slate-700">{getClientSession()?.name || "College coordinator"}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => triggerToast("Student attendance roster downloaded as CSV.")}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors shadow-2xs"
            >
              Export Campus Roster (CSV)
            </button>
          </div>
        </div>

        {/* Metric Cards (HubSpot Style) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-1">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              Enrolled Campus Students
            </span>
            <span className="text-2xl font-bold text-slate-900">{students.length}</span>
            <span className="text-[11px] text-emerald-600 font-medium">Students registered to this college</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-1">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              Average Cohort Attendance
            </span>
            <span className="text-2xl font-bold text-emerald-600">—</span>
            <span className="text-[11px] text-slate-500 font-medium">Attendance appears after sessions are recorded</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-1">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              Workshops Executed
            </span>
            <span className="text-2xl font-bold text-slate-900">14 / 27</span>
            <span className="text-[11px] text-blue-600 font-medium">Next: WS-15 Distributed Tracing</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-1">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              Absence Exceptions
            </span>
            <span className="text-2xl font-bold text-amber-600">{pendingExceptionsCount} Pending</span>
            <span className="text-[11px] text-slate-500 font-medium">Requires coordinator sign-off</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 gap-2 sm:gap-4 text-xs font-semibold overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { id: "students", label: `Campus Roster (${students.length})`, icon: <UsersIcon className="w-4 h-4" /> },
            { id: "calendar", label: "Workshop Schedule", icon: <CalendarIcon className="w-4 h-4" /> },
            { id: "workshops", label: "27-Session Attendance", icon: <ChartBarIcon className="w-4 h-4" /> },
            { id: "exceptions", label: `Absence Exceptions (${pendingExceptionsCount})`, icon: <ScaleIcon className="w-4 h-4" /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`pb-3 px-1 flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === t.id
                  ? "border-slate-900 text-slate-900 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span className="text-slate-400 shrink-0">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>


        {/* ========================================================================= */}
        {/* TAB 1: CAMPUS STUDENTS ROSTER                                             */}
        {/* ========================================================================= */}
        {activeTab === "students" && (
          <div className="flex flex-col gap-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campus students by name, DOS ID, or department..."
                className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800"
              />

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700 bg-white"
              >
                <option value="All">All Departments</option>
                <option value="Computer Technology">Computer Technology</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Computer Applications">Computer Applications</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              </select>
            </div>

            {/* Students Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[640px]">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Student Member</th>
                    <th className="py-3.5 px-4">DOS ID</th>
                    <th className="py-3.5 px-4">Department & Year</th>
                    <th className="py-3.5 px-4 text-center">Completed Sessions</th>
                    <th className="py-3.5 px-4 text-center">Attendance %</th>
                    <th className="py-3.5 px-4">Last Attended Workshop</th>
                    <th className="py-3.5 px-4 text-right">Student 360</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedStudents.map((s) => (
                    <tr key={s.dosId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                            {s.fullName.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-900">{s.fullName}</span>
                            <span className="text-[11px] text-slate-400">{s.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {s.dosId}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-800">{s.department}</span>
                        <span className="text-[11px] text-slate-400 block">Year {s.year}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {s.completedWorkshops} / 27
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-mono font-bold text-xs ${
                            s.attendanceRate >= 90
                              ? "text-emerald-700"
                              : s.attendanceRate >= 80
                              ? "text-blue-700"
                              : "text-amber-700"
                          }`}
                        >
                          {s.attendanceRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {s.lastAttended}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/record/${encodeURIComponent(s.dosId)}`}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold whitespace-nowrap"
                        >
                          Inspect 360 &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Table Pagination */}
              <TablePagination
                currentPage={currentPage}
                totalItems={filteredStudents.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        )}


        {/* ========================================================================= */}
        {/* TAB 2: MULTI-WORKSHOP ATTENDANCE BREAKDOWN                                 */}
        {/* ========================================================================= */}
        {activeTab === "workshops" && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Workshop</th>
                  <th className="py-3.5 px-4">Curriculum Title</th>
                  <th className="py-3.5 px-4 text-center">Attended / Total</th>
                  <th className="py-3.5 px-4 text-center">Campus Rate</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Venue Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {WORKSHOP_TOPICS_27.map((topic, i) => {
                  const num = i + 1;
                  const code = `WS-${String(num).padStart(2, "0")}`;
                  const isCompleted = num < 14;
                  const isLive = num === 14;
                  const attendedCount = isCompleted ? 39 + (num % 4) : isLive ? 38 : 0;
                  const rate = isCompleted ? (attendedCount / 42) * 100 : isLive ? 90.5 : 0;

                  return (
                    <tr key={code} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{code}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{topic}</td>
                      <td className="py-3 px-4 text-center font-mono">
                        {isCompleted || isLive ? `${attendedCount} / 42` : "—"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {rate > 0 ? (
                          <span className="font-mono font-bold text-emerald-700">
                            {rate.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isLive
                              ? "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                              : isCompleted
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {isLive ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
                              <span>LIVE IN SESSION</span>
                            </span>
                          ) : isCompleted ? "COMPLETED" : "UPCOMING"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500 font-medium">
                        {num % 2 === 0 ? "Hybrid Hub" : "In-Person Lab"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ABSENCE EXCEPTIONS                                                 */}
        {/* ========================================================================= */}
        {activeTab === "exceptions" && (
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">DOS ID</th>
                    <th className="py-3.5 px-4">Missed Workshop</th>
                    <th className="py-3.5 px-4">Session Date</th>
                    <th className="py-3.5 px-4 text-center">Provisional State</th>
                    <th className="py-3.5 px-4 text-right">Dean Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {absences.map((caseItem, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{caseItem.studentName}</span>
                          <span className="text-[11px] text-slate-400">{caseItem.department}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {caseItem.dosId}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-800">{caseItem.sessionCode}:</span>{" "}
                        <span className="text-slate-700">{caseItem.sessionTitle}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {caseItem.date}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            caseItem.provisionalStatus === "EXCUSED"
                              ? "bg-blue-50 text-blue-800 border border-blue-200"
                              : caseItem.provisionalStatus === "ABSENT_CONFIRMED"
                              ? "bg-red-50 text-red-800 border border-red-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {caseItem.provisionalStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {caseItem.provisionalStatus === "ABSENT_UNCONFIRMED" ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleConfirmException(
                                  caseItem.dosId,
                                  caseItem.sessionCode,
                                  "EXCUSED",
                                  "Medical / Institutional Exam Clearance"
                                )
                              }
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-xs shadow-2xs"
                            >
                              Approve Excuse
                            </button>
                            <button
                              onClick={() =>
                                handleConfirmException(
                                  caseItem.dosId,
                                  caseItem.sessionCode,
                                  "ABSENT_CONFIRMED",
                                  "Unexcused absence confirmed by coordinator"
                                )
                              }
                              className="px-2.5 py-1 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded font-medium text-xs"
                            >
                              Confirm Absent
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono inline-flex items-center gap-1">
                            <CheckIcon className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{caseItem.confirmationNote || "Resolved"}</span>
                          </span>
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
        {/* TAB 4: WORKSHOP CALENDAR & SCHEDULE                                       */}
        {/* ========================================================================= */}
        {activeTab === "calendar" && (
          <WorkshopCalendar
            role="COLLEGE_ADMIN"
            institutionName={institutionName}
            title={`${institutionName} Workshop Itinerary & Calendar`}
            subtitle={`Upcoming and completed technical workshop sessions for ${institutionName}. Direct sync with Google and Apple Calendar.`}
          />
        )}
      </main>
    </div>

      <footer className="border-t border-slate-200 bg-white py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/dos-club-logo.png" alt="DOS Club" className="h-5 w-5 rounded-full" />
            <span className="font-semibold text-slate-700">DeScience Open Source Club</span>
            <span className="text-slate-300">•</span>
            <span>Anna University Campus Hub</span>
          </div>
          <span className="text-slate-400">Longitudinal Student Development & Attendance Matrix</span>
        </div>
      </footer>
    </div>
  );
}
