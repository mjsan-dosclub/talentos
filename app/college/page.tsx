"use client";

import { useState } from "react";
import Link from "next/link";

interface AbsenceCase {
  dosId: string;
  studentName: string;
  department: string;
  provisionalStatus: "ABSENT_UNCONFIRMED" | "EXCUSED" | "ABSENT_CONFIRMED";
  confirmationNote?: string;
}

const INITIAL_ABSENCES: AbsenceCase[] = [
  {
    dosId: "DOS-B3-006",
    studentName: "Naveen Raj",
    department: "Computer Science & Engineering",
    provisionalStatus: "ABSENT_UNCONFIRMED",
  },
  {
    dosId: "DOS-B3-007",
    studentName: "Ananya Swaminathan",
    department: "Information Technology",
    provisionalStatus: "ABSENT_UNCONFIRMED",
  },
  {
    dosId: "DOS-B3-008",
    studentName: "Karthik Sundar",
    department: "Electronics & Communication",
    provisionalStatus: "ABSENT_UNCONFIRMED",
  },
];

export default function CollegeCoordinatorPage() {
  const [absences, setAbsences] = useState<AbsenceCase[]>(INITIAL_ABSENCES);
  const [notification, setNotification] = useState<string | null>(null);

  const handleConfirmException = (dosId: string, status: "EXCUSED" | "ABSENT_CONFIRMED", note: string) => {
    setAbsences((prev) =>
      prev.map((a) => {
        if (a.dosId === dosId) {
          return {
            ...a,
            provisionalStatus: status,
            confirmationNote: note,
          };
        }
        return a;
      })
    );

    setNotification(`COLLEGE_AUDIT // Status for ${dosId} confirmed as ${status} (${note})`);
    setTimeout(() => setNotification(null), 3500);
  };

  const excusedCount = absences.filter((a) => a.provisionalStatus === "EXCUSED").length;
  const unconfirmedCount = absences.filter((a) => a.provisionalStatus === "ABSENT_UNCONFIRMED").length;

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-neutral-900 font-sans selection:bg-neutral-200 selection:text-neutral-900 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-neutral-200/90 bg-white/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-mono text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <span className="text-neutral-400">&larr;</span>
            <span className="h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
            <span className="tracking-wider uppercase font-medium">DOS CLUB // TALENT_OS</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-neutral-700 border border-neutral-300 bg-neutral-100 px-2.5 py-1 rounded hidden sm:inline-block">
              INSTITUTION: ANNA UNIVERSITY (AU-DOS-01)
            </span>
            <Link
              href="/login"
              className="font-mono text-xs text-neutral-500 hover:text-neutral-900 font-medium"
            >
              Sign Out
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col gap-8">
        {/* Title */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-neutral-200 pb-6">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-neutral-200 bg-neutral-100 font-mono text-[10px] sm:text-xs text-neutral-700 tracking-widest uppercase self-start font-medium">
              COLLEGE COORDINATOR PORTAL // SECTIONS 5 & 13
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-950">
              Institutional Attendance & Exception Review
            </h1>
            <p className="font-mono text-xs text-neutral-600">
              Zero routine administration: review session attendance summaries and confirm excused absences in one click.
            </p>
          </div>

          {/* Institutional Stats */}
          <div className="grid grid-cols-3 gap-3 border border-neutral-200 bg-white p-3 font-mono text-xs shadow-2xs">
            <div className="flex flex-col">
              <span className="text-neutral-500 text-[10px]">REGISTERED</span>
              <span className="text-base font-semibold text-neutral-900">40</span>
            </div>
            <div className="flex flex-col border-l border-neutral-200 pl-3">
              <span className="text-neutral-500 text-[10px]">PRESENT</span>
              <span className="text-base font-semibold text-emerald-700">37</span>
            </div>
            <div className="flex flex-col border-l border-neutral-200 pl-3">
              <span className="text-neutral-500 text-[10px]">UNCONFIRMED</span>
              <span className="text-base font-semibold text-amber-700">{unconfirmedCount}</span>
            </div>
          </div>
        </section>

        {/* Notification Banner */}
        {notification && (
          <div className="p-3 border border-neutral-300 bg-neutral-900 text-white font-mono text-xs tracking-wider flex items-center gap-2 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Workshop Summary Card */}
        <section className="border border-neutral-200 bg-white p-6 shadow-2xs flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-neutral-200 pb-3">
            <div>
              <span className="font-mono text-[10px] uppercase text-neutral-500 block">
                LATEST COMPLETED WORKSHOP
              </span>
              <h2 className="text-lg font-semibold text-neutral-950">
                WS-14: Resilient Microservices & Circuit Breakers
              </h2>
            </div>
            <span className="font-mono text-xs bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded font-medium text-neutral-700">
              Batch 3 • Group Alpha
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs py-2">
            <div>
              <span className="text-neutral-500 text-[10px] block">DATE & TIME</span>
              <span className="text-neutral-900 font-medium">Sunday, 09:00 - 12:00 UTC</span>
            </div>
            <div>
              <span className="text-neutral-500 text-[10px] block">VENUE</span>
              <span className="text-neutral-900 font-medium">AU Campus / Chennai Hub</span>
            </div>
            <div>
              <span className="text-neutral-500 text-[10px] block">TRAINER</span>
              <span className="text-neutral-900 font-medium">DeScience Faculty Lead</span>
            </div>
            <div>
              <span className="text-neutral-500 text-[10px] block">ATTENDANCE SOURCE</span>
              <span className="text-neutral-900 font-medium">QR (35) + Trainer Manual (2)</span>
            </div>
          </div>
        </section>

        {/* Exception Confirmation Table (PRD Section 13) */}
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-neutral-900 font-semibold">
                ABSENCE CONFIRMATION QUEUE ({unconfirmedCount} PENDING)
              </h3>
              <p className="font-mono text-[11px] text-neutral-500 mt-0.5">
                Confirm institutional justification (e.g. lab examination, university event) so records reflect accurately.
              </p>
            </div>

            {excusedCount > 0 && (
              <span className="font-mono text-xs text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded font-medium">
                {excusedCount} Excused by College
              </span>
            )}
          </div>

          <div className="border border-neutral-200 bg-white divide-y divide-neutral-200 shadow-2xs">
            {absences.map((a) => (
              <div
                key={a.dosId}
                className="p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-neutral-50/50 transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-neutral-950">
                      {a.studentName}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-500 border border-neutral-200 px-1.5 py-0.5 rounded-2xs bg-neutral-50">
                      {a.dosId}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-neutral-500">
                    {a.department}
                    {a.confirmationNote && (
                      <span className="text-purple-700 ml-2 font-medium">
                        • Confirmed: {a.confirmationNote}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 font-mono text-xs self-end md:self-center">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-semibold border rounded-2xs ${
                      a.provisionalStatus === "EXCUSED"
                        ? "bg-purple-50 text-purple-800 border-purple-300"
                        : a.provisionalStatus === "ABSENT_CONFIRMED"
                        ? "bg-neutral-200 text-neutral-800 border-neutral-300"
                        : "bg-amber-50 text-amber-800 border-amber-300"
                    }`}
                  >
                    {a.provisionalStatus}
                  </span>

                  {a.provisionalStatus === "ABSENT_UNCONFIRMED" ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          handleConfirmException(a.dosId, "EXCUSED", "Department Lab Examination")
                        }
                        className="px-2.5 py-1 text-[11px] border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 rounded-2xs transition-colors"
                      >
                        EXCUSE: LAB EXAM
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleConfirmException(a.dosId, "EXCUSED", "University Symposium Duty")
                        }
                        className="px-2.5 py-1 text-[11px] border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-800 rounded-2xs transition-colors"
                      >
                        EXCUSE: SYMPOSIUM
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleConfirmException(a.dosId, "ABSENT_CONFIRMED", "Unexcused Absence Confirmed")
                        }
                        className="px-2.5 py-1 text-[11px] border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded-2xs transition-colors"
                      >
                        CONFIRM ABSENT
                      </button>
                    </>
                  ) : (
                    <span className="text-[11px] text-neutral-400">AUDIT VERIFIED ✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center font-mono text-[11px] text-neutral-500 tracking-wider">
          DESCIENCE OPEN SOURCE CLUB • SINGAPORE // CHENNAI • TALENT_OS V1
        </div>
      </footer>
    </div>
  );
}
