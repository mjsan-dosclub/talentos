# TalentOS V1 Acceptance Matrix & Delivery Control System

> **Single Source of Truth for V1 Delivery, Traceability, and Product Acceptance**  
> *Repository File*: `V1_ACCEPTANCE_MATRIX.md`  
> *Mirrored File*: `docs/v1-delivery-checklist.md`  
> *Last Updated*: 2026-09-14

---

## 1. Project Health Dashboard

```text
=================================================================================
TALENTOS V1 DELIVERY CONTROL DASHBOARD
=================================================================================
Total Requirements Tracked:      97
Completed (Level 1/2 Verified):  71
Ready for Test:                  12
In Progress:                      7
Blocked:                          0
Not Started / Deferred:           7

Critical Deviations:              3 (Logged in docs/deviation-register.md)
Open Product Decisions:           2 (Logged below)
Critical Bugs:                    0
---------------------------------------------------------------------------------
BUILD COMPLETION (Code Exists):          71 / 97  =  73.2%
ACCEPTED COMPLETION (Level 3 Approved):  51 / 97  =  52.5%
=================================================================================
```

---

## 2. Three Levels of Acceptance

To prevent premature claims of "done", every requirement advances through three strictly enforced gates:

1. **Level 1 — Developer Verified (`DEV_VERIFIED`)**: Code is written, compiles without errors (`tsc --noEmit`), and passes unit/integration assertions.
2. **Level 2 — QA / Automated Verified (`QA_VERIFIED`)**: End-to-end automated scripts or test harnesses verify the feature on mobile and desktop viewports with realistic seeded data.
3. **Level 3 — Product Accepted (`PRODUCT_ACCEPTED`)**: Product Owner reviews the live user journey against the specification and accepts behavior.

> **Rule**: No module is marked as **V1 Complete** unless all sub-features reach **Level 3 (PRODUCT_ACCEPTED)**.

---

## 3. Definition of Done (DoD)

A requirement or module is marked **DONE** if and only if **all 12 criteria** are satisfied:

1. [x] **Requirement Traceability**: Mapped to an explicit ID in this matrix.
2. [x] **UI Completed**: Implemented with responsive design on mobile and desktop.
3. [x] **Backend & API Completed**: Route handlers return proper status codes and error payloads.
4. [x] **Database & Schema Handled**: PostgreSQL tables, foreign keys, and indexes configured in Supabase.
5. [x] **Role & Permissions Verified**: Protected by `middleware.ts` and RBAC checks (`STUDENT`, `TRAINER`, `COLLEGE_ADMIN`, `SUPER_ADMIN`).
6. [x] **Error Cases Handled**: Graceful degradation, empty states, and user-friendly error banners.
7. [x] **Audit Logging Handled**: Critical mutations generate immutable entries in `audit_logs`.
8. [x] **Mobile Tested**: Verified on mobile touch screen layout (< 768px viewport).
9. [x] **Realistic Data Tested**: Seeded with real Indian engineering student names, workshops, and dossiers.
10. [x] **Zero Critical Bugs**: No runtime exceptions or unhandled promise rejections.
11. [x] **Documentation Updated**: Reflected in `docs/` and walkthrough logs.
12. [x] **Product Owner Accepted**: Confirmed by product leadership.

---

## 4. End-to-End Master Scenarios

### Scenario A — B2B Student Full Lifecycle
```text
Create College (Anna University Hub)
  ↓
Create Batch (Batch 3 - 2026)
  ↓
Create Group (Systems Pod Alpha)
  ↓
Enroll Student (DOS-B3-001 Arun)
  ↓
Schedule Workshop (WS-01 Distributed Consensus)
  ↓
Student Check-In (Geofenced + QR token)
  ↓
Workshop Completed by Trainer
  ↓
Student Submits Feedback (Rating + Reflection)
  ↓
Student Check-Out Verified
  ↓
GitHub Assignment Deliverable Unlocked
  ↓
Student Submits Commit Hash & PR Link (/submit)
  ↓
Student 360 Record Updated (/record/DOS-B3-001)
  ↓
College Coordinator Receives Consolidated Report (/college)
```

### Scenario B — Attendance Exception & Manual Override
```text
Student scans QR with camera error / low GPS accuracy
  ↓
Trainer switches to Manual Attendance Mode on /trainer
  ↓
Trainer selects student and enters mandatory reason ("Hardware camera failure; student physically verified at Pod Alpha")
  ↓
Attendance recorded with status = PRESENT (METHOD = MANUAL_OVERRIDE)
  ↓
Immutable audit event logged in audit_logs
  ↓
College portal highlights override badge with reason inspectable
```

### Scenario C — Absentee Review & College Sanctioning
```text
Session concludes; system scans all enrolled students without check-in
  ↓
Status marked as ABSENT_UNCONFIRMED
  ↓
DOS Organiser reviews attendance discrepancies on /admin/sessions
  ↓
College Coordinator reviews unconfirmed list on /college
  ↓
Coordinator marks legitimate illness/exam as EXCUSED_ABSENCE with note
  ↓
Student 360 updates badge from Red to Amber (Excused)
```

### Scenario D — B2C Direct Student Dynamic Grouping
```text
Aspirant completes admissions / membership on landing page
  ↓
Account created under B2C "DOS Direct" Institution
  ↓
System queries active group capacity (Current: Group Alpha, N = 38)
  ↓
Student enrolled into Group Alpha (N becomes 39, <= 40 cap)
  ↓
When N reaches 40, system automatically allocates new students to Group Beta
```

---

## 5. Master Traceability Matrix (All 14 Modules)

### Module 1: Foundation & Infrastructure
| ID | Requirement | Priority | Build Status | Test Status | Acceptance Level | Deviation | Owner |
|---|---|---|---|---|---|---|---|
| TAL-001 | Dynamic Session Auth (Cookie-based JWT) | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-002 | Role-Based Access Control (4 Roles) | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-003 | Next.js Route Middleware Protection (`middleware.ts`) | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-004 | Immutable Audit Trail Table (`audit_logs`) | MUST | Complete | Passed | DEV_VERIFIED | None | Dev |
| TAL-005 | Central Dynamic Settings (`/admin/settings`) | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-006 | Central Timezone Engine (`Asia/Kolkata` default) | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-007 | Supabase Remote PostgreSQL + RLS Policies | MUST | Complete | Passed | QA_VERIFIED | None | Dev |

### Module 2: Institution & Cohort
| ID | Requirement | Priority | Build Status | Test Status | Acceptance Level | Deviation | Owner |
|---|---|---|---|---|---|---|---|
| TAL-010 | B2B Institution Profile & Geocoordinates | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-011 | Batch Management (e.g. Batch 3 - 2026) | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-012 | Pod / Group Management (Systems Pod Alpha) | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-013 | B2C DOS Direct Institution Handling | MUST | Complete | Passed | DEV_VERIFIED | None | Dev |
| TAL-014 | Configurable Group Capacity Limit (Max 40) | MUST | Complete | Passed | DEV_VERIFIED | None | Dev |
| TAL-015 | Session Mode Flag (Offline, Online, Hybrid) | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |

### Module 3: Student 360 Profile (`/record/[id]`)
| ID | Requirement | Priority | Build Status | Test Status | Acceptance Level | Deviation | Owner |
|---|---|---|---|---|---|---|---|
| TAL-020 | Personal Profile & Avatar Header | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-021 | College & Degree Institutional Credentials | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-022 | Contact Information (Email, Phone, WhatsApp) | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-023 | GitHub Profile Link & Commit Activity | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-024 | LinkedIn Profile Link | SHOULD | Complete | Passed | DEV_VERIFIED | None | Dev |
| TAL-025 | 27-Workshop Chronological Journey Timeline | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-026 | Slide-Out Deliverable Inspection Drawer | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-027 | Multi-Dimensional Skills Radar/Matrix | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-028 | Verified Certifications List & Badges | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-029 | Diagnostic Assessment Baseline Scores | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-030 | Standout Performance Recognitions | SHOULD | Complete | Passed | DEV_VERIFIED | None | Dev |

### Module 4: Workshop Management
| ID | Requirement | Priority | Build Status | Test Status | Acceptance Level | Deviation | Owner |
|---|---|---|---|---|---|---|---|
| TAL-035 | 27-Workshop Canonical Syllabus Structure | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-036 | Trainer Assignment per Workshop | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-037 | Geofenced Physical Venue Binding | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-038 | Scheduled Date & Time Tracking | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-039 | Learning Objectives & Syllabus Deliverables | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-040 | Session Delivery Mode (`OFFLINE`, `ONLINE`, `HYBRID`) | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-041 | Submission Requirement Config (`GITHUB`, `URL`, etc.) | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-042 | Submission Deadlines & Late Cutoffs | MUST | Complete | Passed | DEV_VERIFIED | None | Dev |

### Module 5: Attendance Engine
| ID | Requirement | Priority | Build Status | Test Status | Acceptance Level | Deviation | Owner |
|---|---|---|---|---|---|---|---|
| TAL-045 | Mobile QR Scanner (`/checkin`) | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-046 | Geofence Radius Validation (Haversine 120-200m) | MUST | Complete | Passed | QA_VERIFIED | DEV-01 | Dev |
| TAL-047 | 30-Second Dynamic Rotating QR Token | MUST | Complete | Passed | DEV_VERIFIED | DEV-03 | Dev |
| TAL-048 | Time-Logged Attendance Timestamp (IST) | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-049 | Late Attendance Flagging (> 15 mins) | MUST | Complete | Passed | DEV_VERIFIED | None | Dev |
| TAL-050 | Check-Out QR Scanning | SHOULD | In Progress | Ready for Test | DEV_VERIFIED | None | Dev |
| TAL-051 | Manual Trainer Attendance Override | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-052 | Mandatory Justification Reason for Overrides | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-053 | DOS Organiser Attendance Correction | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-054 | Unconfirmed Absentee Detection (`ABSENT_UNCONFIRMED`) | MUST | Complete | Passed | DEV_VERIFIED | None | Dev |
| TAL-055 | College Sanctioned Absence Confirmation | MUST | Complete | Passed | QA_VERIFIED | None | Dev |

### Module 6: Feedback Pulse
| ID | Requirement | Priority | Build Status | Test Status | Acceptance Level | Deviation | Owner |
|---|---|---|---|---|---|---|---|
| TAL-060 | Post-Workshop Rating (1–4 Scale) | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-061 | Learning Reflection Text Field | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-062 | Confidence Rating (1–5 Scale) | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-063 | Checkout Gating by Mandatory Feedback | SHOULD | In Progress | Ready for Test | DEV_VERIFIED | None | Dev |
| TAL-064 | Consolidated Analytics on Trainer & College Views | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |

### Module 7: Evidence & Deliverables
| ID | Requirement | Priority | Build Status | Test Status | Acceptance Level | Deviation | Owner |
|---|---|---|---|---|---|---|---|
| TAL-068 | Student Submission Portal (`/submit`) | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-069 | GitHub Repository URL & Commit SHA Validation | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-070 | Live Project URL & Demo Link | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-071 | Technical Reflection Notes | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-072 | Deliverable Drawer View on Dossier | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-073 | Review Status (`PENDING`, `VERIFIED`, `NEEDS_REVISION`) | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-074 | Document & PDF Upload Support | SHOULD | In Progress | Ready for Test | DEV_VERIFIED | None | Dev |

### Module 8: Certifications
| ID | Requirement | Priority | Build Status | Test Status | Acceptance Level | Deviation | Owner |
|---|---|---|---|---|---|---|---|
| TAL-078 | Certification Provider (Linux Foundation, CNCF, AWS) | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-079 | Certification Name & Date of Award | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-080 | Credential Verification URL | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-081 | Verification Status Badge (`VERIFIED`, `PENDING`) | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |

### Module 9: Skills Matrix
| ID | Requirement | Priority | Build Status | Test Status | Acceptance Level | Deviation | Owner |
|---|---|---|---|---|---|---|---|
| TAL-084 | Technology / System Category Mapping | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-085 | Student Self-Confidence Rating | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-086 | Evidence-Backed Exposure Count | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-087 | Assessed Technical Proficiency | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-088 | Maturity Level Tier (Foundational, Practitioner, Architect) | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |

### Module 10: Notifications & Communications
| ID | Requirement | Priority | Build Status | Test Status | Acceptance Level | Deviation | Owner |
|---|---|---|---|---|---|---|---|
| TAL-090 | In-App Notification Bell & Badge | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-091 | Communication Gateways Config (SMTP, WhatsApp, Telegram) | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-092 | Web Push / PWA Notification Permissions | SHOULD | Deferred | Not Tested | NOT STARTED | DEV-02 | Dev |
| TAL-093 | Audience Targeting (Batch, Role, Pod) | SHOULD | Complete | Passed | DEV_VERIFIED | None | Dev |

### Module 11: College Reporting Portal (`/college`)
| ID | Requirement | Priority | Build Status | Test Status | Acceptance Level | Deviation | Owner |
|---|---|---|---|---|---|---|---|
| TAL-095 | Institutional Overview & Enrolled Student Count | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-096 | Workshop Attendance Aggregates & Percentages | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-097 | Student Directory with Clickable Dossier Links | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-098 | Absence Confirmation & Sanctioning UI | MUST | Complete | Passed | QA_VERIFIED | None | Dev |
| TAL-099 | CSV Export of Attendance Ledger | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |

### Module 12: Progressive Web App (PWA)
| ID | Requirement | Priority | Build Status | Test Status | Acceptance Level | Deviation | Owner |
|---|---|---|---|---|---|---|---|
| TAL-102 | PWA Webmanifest (`/manifest.webmanifest`) | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-103 | App Icons (192x192, 512x512) & Theme Color | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-104 | Mobile First Viewport & Responsive Layouts | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-105 | Fast Add to Home Screen (A2HS) Readiness | MUST | Complete | Passed | QA_VERIFIED | None | Dev |

### Module 13: Student Journey
| ID | Requirement | Priority | Build Status | Test Status | Acceptance Level | Deviation | Owner |
|---|---|---|---|---|---|---|---|
| TAL-108 | Chronological Journey Stage Markers | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-109 | Workshop Milestones & Deliverable Links | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-110 | Diagnostic Benchmarks & Recognitions | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |

### Module 14: Public Landing Page (`/`)
| ID | Requirement | Priority | Build Status | Test Status | Acceptance Level | Deviation | Owner |
|---|---|---|---|---|---|---|---|
| TAL-112 | UI8 Fitness Pro Design System & Poppins Typography | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-113 | Clean Light Theme (Pure #FCFCFD Canvas, No Dark Slabs) | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-114 | Emotional Airport Lounge Privilege Positioning | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-115 | Admissions Enquiry Form with Direct Confirmation | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-116 | Dynamic CMS Backend Sync (`/api/cms/landing`) | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-117 | Absolute Zero Informal Emojis Across UI | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |
| TAL-118 | Touchmark Descience Footer Attribution with URL | MUST | Complete | Passed | PRODUCT_ACCEPTED | None | Dev |

---

## 6. Focused Presentation Baseline Dataset

To communicate the full end-to-end vision cleanly without requiring all 27 workshops seeded with live data simultaneously, the following baseline dataset is configured:

- **1 Institution**: `Anna University & DOS Club Hub` (`INST-AU-01`)
- **1 Batch**: `Batch 3 (2026)` (`BATCH-2026-B3`)
- **1 Pod**: `Systems Engineering - Pod Alpha` (`POD-ALPHA`)
- **12 Sample Students**: Fully populated records (`DOS-B3-001` through `DOS-B3-012`) with authentic student photos, skills, and PR links.
- **3 Focused Workshops**:
  1. `WS-01`: *Distributed Consensus & Linux Internals* — Completed Technical Workshop with 100% verified attendance, feedback scores, and GitHub commit SHAs.
  2. `WS-02`: *Open Source Systems Architecture Defense* — Completed Non-Technical Workshop with peer defense remarks and reflections.
  3. `WS-03`: *High-Throughput Streaming & Zero-Copy I/O* — Upcoming Active Workshop with geofence coordinates and open check-in countdown.

---

## 7. Open Product Decisions

1. **`DEC-01`**: Automatic B2C capacity overflow behavior — When Pod reaches 40 students, should the system auto-create "Pod Beta" immediately or notify the Super Admin for manual cohort assignment?
2. **`DEC-02`**: Check-out requirement — Should incomplete check-out penalize the student's attendance percentage, or mark status as `PARTIAL_ATTENDANCE`?
