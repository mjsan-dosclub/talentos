# V1 Scope Specification — DOS Club TalentOS

This document specifies the exact boundaries of the V1 production release of DOS Club TalentOS, distinguishing included features from deferred roadmap items.

---

## 1. Features Included in V1

The V1 release implements all core capabilities required for longitudinal student development, attendance auditing, and institutional reporting:

1. **Student 360 Profile (`/record/[id]`)**:
   - Identity & institutional metadata (Batch, Group, College, Degree).
   - 27-workshop chronological audit timeline with status badges.
   - Slide-out deliverable inspection drawer with geofence logs, commit hashes, and test outcomes.
   - Multi-dimensional skills inventory (Confidence, Exposure Count, Maturity).
   - Structured industry certifications with verification status.
   - External baseline and diagnostic benchmark reports.
   - Trainer standout performance recognitions.

2. **Attendance Engine & Geofencing**:
   - Geofence radius calculation (120m–200m boundaries around institutional venues).
   - Rotating 30-second dynamic QR tokens (`active_session_tokens`) preventing proxy check-ins.
   - Zero-grace countdown timers.
   - Trainer manual exception resolution with mandatory documented reasons.
   - College coordinator absence confirmation for sanctioned leaves.

3. **Workshop Management**:
   - 27 deep-dive systems engineering workshops (`WS-01` through `WS-27`).
   - Support for multiple session modes (`OFFLINE`, `ONLINE`, `HYBRID`).
   - Flexible submission requirements (`GITHUB_REPO`, `PROJECT_URL`, `DOCUMENT`, `IMAGE`, `NONE`).

4. **Evidence & Feedback Pulse**:
   - Student deliverable submission engine (`/submit`) capturing repository URLs, commit SHAs, and reflection notes.
   - Post-workshop feedback modal recording comprehension rating (1–4), confidence score (1–5), and key technical learning reflections.

5. **Operational Role Portals**:
   - **Student Portal**: Access to own Student 360 record, feedback modal, and submission engine.
   - **Trainer Portal (`/trainer`)**: Session roster, live QR token display, manual overrides, and standout participant tagging.
   - **College Coordinator Portal (`/college`)**: Institutional aggregate attendance, provisional absence verification, and student directory.
   - **Super Admin Console (`/admin`)**: Roster management, manual single-student enrollment, bulk CSV/text roster ingestion, and session auditing.

6. **Infrastructure & PWA**:
   - Remote Supabase PostgreSQL database with Row Level Security (RLS).
   - Next.js 16 App Router with server-side route handlers.
   - Progressive Web App (PWA) manifest (`app/manifest.ts`) for mobile attendance scanning.

---

## 2. Features Explicitly Excluded from V1 (PRD Section 27)

Per PRD Section 27, the following capabilities are explicitly deferred to future versions:

- **Recruiter Portal**: Public or third-party recruiter search, candidate filtering, and talent acquisition tools are excluded from V1. All recruiter access is restricted until V2.
- **Biometric Check-In**: Hardware fingerprint or facial recognition hardware scanners.
- **Automated Plagiarism Scanners**: AST-level code similarity analysis across student repositories.
- **Payment & Fee Processing**: Tuition or club fee collection mechanisms.
