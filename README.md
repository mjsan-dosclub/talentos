# DOS Club TalentOS

> **A Longitudinal Student Development & Talent Intelligence System**  
> *DeScience Open Source Club • Singapore // Chennai*

---

## Overview

**TalentOS** is an institutional talent intelligence platform designed to make a student's real engineering output visible over a 27-workshop curriculum. 

Instead of relying on résumés, inflated credentials, or participation certificates, TalentOS maintains an immutable audit record of real code commits, production deliverables, and timely session execution across active Batches.

---

## The Three Core Principles

1. **01 / OBSERVE**: Dynamic geofencing and zero-grace session windows. We record real-time presence and timely execution, not excuses.
2. **02 / EVIDENCE**: No participation certificates. Repositories, artifacts, and practical deliverables undergo systematic audit.
3. **03 / EVOLVE**: Designed to surface longitudinal consistency. Potential is proven through sustained output over months across 27 workshops.

---

## Architectural Rules & Invariants

As enforced in [`PROJECT_RULES.md`](./PROJECT_RULES.md):

1. **Strict Adherence to 9 Lifecycle States Only**:
   - `REGISTERED`: Enrolled in session record.
   - `CHECKED_IN`: Verified presence inside geofenced window.
   - `LATE`: Presence recorded past zero-grace cutoff.
   - `INCOMPLETE`: Session attended but practical deliverable missing or failed audit.
   - `COMPLETED`: Full session presence and production deliverable verified.
   - `ABSENT_UNCONFIRMED`: Unannounced absence.
   - `ABSENT_CONFIRMED`: Pre-notified absence.
   - `EXCUSED`: Faculty-approved absence.
   - `MANUALLY_CONFIRMED`: Faculty-audited verification.

2. **Zero Composite or Algorithmic Scoring**:
   - No "Talent Scores", weighted averages, or artificial percentage grades.
   - All evaluation is grounded in factual counts, commit hashes, pull requests, and verifiable milestones.

3. **Schema & Role Integrity**:
   - Never invent unauthorized database tables, speculative roles, or unapproved fields.

---

## Project Structure

```
talentos/
├── app/
│   ├── globals.css              # Tailwind CSS v4 styling & Inter humanist enterprise theme
│   ├── layout.tsx               # Root layout with Inter & JetBrains Mono typography
│   ├── page.tsx                 # Public landing page with gatekeeper access terminal
│   ├── login/
│   │   └── page.tsx             # Email & password authentication for Members and Recruiters
│   ├── submit/
│   │   └── page.tsx             # Student deliverable submission & hermetic verification
│   ├── talent/
│   │   └── page.tsx             # Institutional recruiter explorer & factual audit dossiers
│   ├── admin/
│   │   ├── page.tsx             # Leadership console: interactive enrollment & CSV roster import
│   │   └── sessions/
│   │       └── page.tsx         # Live workshop session auditor & geofence controller
│   └── record/
│       └── [id]/
│           └── page.tsx         # Longitudinal 27-workshop student audit record & verification drawer
├── PROJECT_RULES.md             # Invariant system rules
├── ARCHITECTURE.md              # Engineering and pedagogy manual
├── package.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites
- **Node.js**: `>= 20.9.0`
- **npm**: `>= 10`

### Installation & Development

```bash
# Clone repository
git clone https://github.com/descienceosclub/talentos.git
cd talentos

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Routes

- **`/`**: Public landing page featuring the institutional status bar, core principles, and gatekeeper lookup terminal.
- **`/login`**: Secure authentication portal for **Members** and **Recruiters / Auditors** using Email ID and Password.
- **`/submit`**: Student deliverable submission & hermetic CI verification portal for the 27 workshops.
- **`/talent`**: Institutional recruiter talent intelligence explorer with factual workshop evidence (zero composite scores).
- **`/admin`**: Root administration console to enroll new members manually or bulk-import via CSV/text, manage batches, and audit records.
- **`/admin/sessions`**: Live workshop session auditor with real-time geofence attendance countdown and state transition controls across the 9 approved lifecycle states.
- **`/record/[id]`**: Student audit record displaying the 27-workshop chronological timeline, commit evidence, geofence status, and interactive verification drawer.

---

## License & Attribution

Developed by **DeScience Open Source Club** (Singapore // Chennai). All rights reserved.
