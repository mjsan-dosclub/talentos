# AI Development Rules — DOS Club TalentOS

This document specifies mandatory development constraints and invariants that every human engineer and AI coding assistant must follow when modifying DOS Club TalentOS.

---

## 1. Absolute Invariants

1. **Strict 9 Lifecycle States Only**:
   - `REGISTERED`, `CHECKED_IN`, `LATE`, `INCOMPLETE`, `COMPLETED`, `ABSENT_UNCONFIRMED`, `ABSENT_CONFIRMED`, `EXCUSED`, `MANUALLY_CONFIRMED`.
   - Never introduce ad-hoc statuses.

2. **Zero Composite or Algorithmic Scoring**:
   - Never compute weighted percentages, scores out of 100%, or synthetic AI readiness ranks.
   - All candidate metrics must be raw factual counts: workshops completed, tools in inventory, verified credentials, passing test outcomes.

3. **Developmental Growth Language**:
   - Use only: `Developing`, `Progressing`, `Consistent`, `Demonstrated`, `Growth Opportunity`.
   - Never use grading words (`Fail`, `Poor`, `Weak`).

4. **Multi-Dimensional Skills Separation**:
   - Always maintain 3 distinct dimensions: Self-Reported Confidence (1–5), Audited Exposure Count, and Evidence-Backed Maturity (`Introduced` $\rightarrow$ `Consistently Demonstrated`).
   - Never merge these dimensions into a single index.

5. **Recruiter Portal Excluded from V1**:
   - Per PRD Section 27, Recruiter access is excluded from V1. Do not re-add recruiter links to navigation bars.

6. **Next.js 16 Webpack Build Requirement**:
   - In this environment, always verify builds using `./node_modules/.bin/next build --webpack` to avoid Turbopack PostCSS panics.

7. **Humanist Light Aesthetic**:
   - Preserve light theme (`bg-[#FBFBFB]`, `border-neutral-200`, `text-neutral-900`) with Inter and JetBrains Mono. Do not introduce dark mode overrides.
