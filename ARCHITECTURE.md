# DOS Club TalentOS Architecture & Engineering Manual

> **CONFIDENTIAL AUDIT LEDGER SYSTEM**  
> *Singapore // Chennai • Cohort B3_2026*

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
- `REGISTERED`: Student is enrolled in the session ledger; execution has not started.
- `CHECKED_IN`: Verified presence inside the geofenced window before cutoff.
- `LATE`: Presence recorded past the zero-grace window.
- `INCOMPLETE`: Session attended but practical deliverable was missing or rejected by audit.
- `COMPLETED`: Full session presence and production deliverable verified.
- `ABSENT_UNCONFIRMED`: Absence recorded without prior notice.
- `ABSENT_CONFIRMED`: Absence logged prior to session start.
- `EXCUSED`: Absence approved by institutional faculty.
- `MANUALLY_CONFIRMED`: Status verified through faculty/admin manual ledger audit.

### B. Zero Composite or Algorithmic Scoring
- **No "Talent Scores", "Engagement Percentages", or weighted averages.**
- All records are displayed as factual evidence: timestamps, commit hashes, pull requests, and verified state transitions. Recruiters and faculty evaluate actual longitudinal consistency rather than artificial scores.

### C. Database & Role Integrity
- Never invent unauthorized database tables, unvetted roles, or speculative fields. All schema extensions require formal product decisions.

---

## 3. Project Directory Architecture

The repository follows Next.js App Router conventions with Tailwind CSS v4:

```
talentos/
├── app/
│   ├── globals.css          # Tailwind CSS v4 inline themes and dark palette
│   ├── layout.tsx           # Root institutional layout with Geist Sans & Mono
│   ├── page.tsx             # Public unauthenticated landing page & ledger portal
│   ├── login/
│   │   └── page.tsx         # Institutional gatekeeper authentication portal
│   └── ledger/
│       └── [id]/
│           └── page.tsx     # Student longitudinal 27-workshop audit ledger
├── PROJECT_RULES.md         # Invariant system rules and approved states
├── ARCHITECTURE.md          # System architecture and engineering manual
├── package.json             # Dependencies and scripts
└── tsconfig.json            # Strict TypeScript configuration
```

---

## 4. UI & Visual Tone

- **Color Palette**: Ultra-dark institutional tone (`bg-[#0A0D12]`, borders `border-neutral-800`, text `text-neutral-200` / `text-neutral-400`).
- **Typography**: Clean sans-serif (`Geist`) for headlines and narrative; crisp monospace (`Geist Mono`) for ledger keys, hashes, states, and system metadata.
- **Anti-Patterns**:
  - No purple/cyan glowing SaaS gradients.
  - No floating 3D spheres, cartoon graphics, or generic "AI" badges.
  - No card clutter: Use thin dividing grid borders (`divide-y sm:divide-y-0 sm:divide-x`).

---

## 5. Student Learning Guide: How to Track Progress

Students following this repository learn:
1. **Atomic Git Commits**: Every feature, bugfix, and architecture change is documented with conventional commit messages (`feat:`, `fix:`, `docs:`).
2. **Strict Invariant Modeling**: How to build software around immutable business rules (e.g. 9 finite lifecycle states) rather than loose string states.
3. **Audit-Grade UI**: How to build high-trust enterprise and institutional interfaces (comparable to Linear or Stripe Press) without relying on trendy templates.
