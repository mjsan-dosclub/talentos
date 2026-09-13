# DOS Club TalentOS

> **A Longitudinal Student Development & Talent Intelligence System**  
> *DeScience Open Source Club • Singapore // Chennai • Cohort B3_2026*

---

## Overview

**TalentOS** is an institutional talent intelligence platform designed to make a student's real engineering output visible over a 27-workshop curriculum. 

Instead of relying on résumés, inflated credentials, or participation certificates, TalentOS maintains an immutable audit ledger of real code commits, production deliverables, and timely session execution.

---

## The Three Core Principles

1. **01 / OBSERVE**: Dynamic geofencing and zero-grace session windows. We record real-time presence and timely execution, not excuses.
2. **02 / EVIDENCE**: No participation certificates. Repositories, artifacts, and practical deliverables undergo systematic audit.
3. **03 / EVOLVE**: Designed to surface longitudinal consistency. Potential is proven through sustained output over months across 27 workshops.

---

## Architectural Rules & Invariants

As enforced in [`PROJECT_RULES.md`](./PROJECT_RULES.md):

1. **Strict Adherence to 9 Lifecycle States Only**:
   - `REGISTERED`: Enrolled in session ledger.
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
│   ├── globals.css              # Tailwind CSS v4 styling & light institutional theme
│   ├── layout.tsx               # Root layout with Geist Sans & Geist Mono fonts
│   ├── page.tsx                 # Public landing page with gatekeeper access terminal
│   ├── login/
│   │   └── page.tsx             # Email & password authentication for Members and Recruiters
│   └── ledger/
│       └── [id]/
│           └── page.tsx         # Longitudinal 27-workshop student audit ledger
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

- **`/`**: Public landing page featuring the institutional ledger bar, core principles, and gatekeeper lookup terminal.
- **`/login`**: Secure authentication portal for **Members** and **Recruiters / Auditors** using Email ID and Password.
- **`/ledger/[id]`**: Student audit ledger displaying the 27-workshop chronological timeline, commit evidence, geofence status, and factual completion counts.

---

## License & Attribution

Developed by **DeScience Open Source Club** (Singapore // Chennai). All rights reserved.
