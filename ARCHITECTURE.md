# DOS Club TalentOS Architecture & Engineering Manual

> **CONFIDENTIAL AUDIT RECORD SYSTEM**  
> *Singapore // Chennai • Active Batches*

---

## 1. System Philosophy: Evidence Over Certificates

Traditional tech talent pipelines rely on résumés and attendance certificates—signals that are easily embellished and lack technical verifiability.

**TalentOS** is designed on three uncompromising institutional principles:
1. **01 / OBSERVE**: Dynamic geofencing and zero-grace session windows. We record real-time presence and timely execution, not excuses.
2. **02 / EVIDENCE**: No participation certificates. Repositories, commits, artifacts, and production deliverables undergo systematic audit.
3. **03 / EVOLVE**: Designed to surface longitudinal consistency. Real engineering talent is proven through sustained output across 27 workshops over months.

---

## 2. Core Constraints & Invariants

As enforced in `PROJECT_RULES.md`:

### A. The 9 Approved Lifecycle States
Every workshop session or deliverable must strictly resolve to one of the 9 invariant states:
- `REGISTERED`: Student is enrolled in the session record; execution has not started.
- `CHECKED_IN`: Verified presence inside the geofenced window before cutoff.
- `LATE`: Presence recorded past the zero-grace window.
- `INCOMPLETE`: Session attended but practical deliverable was missing or rejected by audit.
- `COMPLETED`: Full session presence and production deliverable verified.
- `ABSENT_UNCONFIRMED`: Absence recorded without prior notice.
- `ABSENT_CONFIRMED`: Absence logged prior to session start.
- `EXCUSED`: Absence approved by institutional faculty.
- `MANUALLY_CONFIRMED`: Status verified through faculty/admin manual audit.

### B. Zero Composite or Algorithmic Scoring
- **No "Talent Scores", "Engagement Percentages", or weighted averages.**
- All records are displayed as factual evidence: timestamps, commit hashes, pull requests, and verified state transitions. Recruiters and faculty evaluate actual longitudinal consistency rather than artificial scores.

### C. Database & Role Integrity
- Authenticate all roles (Members and Recruiters/Auditors) using standard institutional Email ID and Password credentials.
- Never invent unauthorized database tables, unvetted roles, or speculative fields. All schema extensions require formal product decisions.

---

## 3. Project Directory Architecture

The repository follows Next.js App Router conventions with Tailwind CSS v4:

```
talentos/
├── app/
│   ├── globals.css          # Tailwind CSS v4 inline themes & Inter typography
│   ├── layout.tsx           # Root institutional layout with Inter & JetBrains Mono
│   ├── page.tsx             # Public landing page with gatekeeper access terminal
│   ├── login/
│   │   └── page.tsx         # Email & password authentication for Members and Recruiters
│   ├── submit/
│   │   └── page.tsx         # Student deliverable submission & hermetic verification
│   ├── talent/
│   │   └── page.tsx         # Institutional recruiter explorer & factual audit dossiers
│   ├── admin/
│   │   ├── page.tsx         # Administration console: manual form & CSV batch import
│   │   └── sessions/
│   │       └── page.tsx     # Live workshop session auditor & geofence controller
│   └── record/
│       └── [id]/
│           └── page.tsx     # Student longitudinal 27-workshop audit record & drawer
├── PROJECT_RULES.md         # Invariant system rules and approved states
├── ARCHITECTURE.md          # System architecture and engineering manual
├── README.md                # Project overview and team getting-started guide
├── package.json             # Dependencies and scripts
└── tsconfig.json            # Strict TypeScript configuration
```

---

## 4. UI & Visual Tone

- **Color Palette**: Crisp, light editorial enterprise tone (inspired by Stripe Press and Linear light mode: background `bg-[#FBFBFB]`, borders `border-neutral-200`, text `text-neutral-900` / `text-neutral-600`).
- **Typography**: Humanist Enterprise (Option A): `Inter` for headlines and narrative; crisp `JetBrains Mono` for record keys, hashes, states, and system metadata.
- **Anti-Patterns**:
  - No purple/cyan glowing SaaS gradients.
  - No floating 3D spheres, cartoon graphics, or generic "AI" badges.
  - No card clutter: Use thin dividing grid borders (`divide-y sm:divide-y-0 sm:divide-x`).

---

## 5. Student Learning Guide: How to Track Progress

Students following this repository learn:
1. **Atomic Git Commits**: Every feature, bugfix, and architecture change is documented with conventional commit messages (`feat:`, `fix:`, `docs:`, `refactor:`).
2. **Strict Invariant Modeling**: How to build software around immutable business rules (e.g. 9 finite lifecycle states) rather than loose string states.
3. **Audit-Grade UI**: How to build high-trust enterprise and institutional interfaces without relying on trendy templates.
