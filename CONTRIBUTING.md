# Contributing to DOS Club TalentOS

Thank you for contributing to **DOS Club TalentOS** — the student development and talent intelligence platform for the Descience Open Source Club ecosystem.

TalentOS captures a student's journey across 27 deep-dive workshops, baseline assessments, attendance logs, verified learning evidence, industry certifications, and trainer observations.

---

## 1. Core Architectural Invariants

Every contribution must strictly adhere to the project invariants defined in the Product Requirements Document (PRD) and `PROJECT_RULES.md`:

1. **Strict 9 Lifecycle States Only**:
   - `REGISTERED`, `CHECKED_IN`, `LATE`, `INCOMPLETE`, `COMPLETED`, `ABSENT_UNCONFIRMED`, `ABSENT_CONFIRMED`, `EXCUSED`, `MANUALLY_CONFIRMED`.
   - Never invent ad-hoc lifecycle states.

2. **Zero Composite or Algorithmic Scoring (PRD Section 1)**:
   - Strictly **NO** composite "Talent Scores", weighted averages, percentages, or AI ratings.
   - All candidate representations must consist of raw, verifiable factual counts (e.g. `14 / 27 Completed`, `10 Tools in Inventory`, `3 Verified Certifications`) and cryptographic commit hashes.

3. **Developmental Growth Language**:
   - Use developmental progression terms: `Developing`, `Progressing`, `Consistent`, `Demonstrated`, `Growth Opportunity`.
   - Never use punitive evaluative terms (`Fail`, `Weak`, `Poor`).

4. **Three Distinct Skill Dimensions (PRD Section 19 & 20)**:
   - Never merge technical skills into a single number. Always maintain three separate dimensions:
     - *Dimension 1: Self-Reported Confidence (1 to 5)*
     - *Dimension 2: Audited Exposure Count (deliverables & verified commits)*
     - *Dimension 3: Evidence-Backed Developmental Maturity* (`Introduced` $\rightarrow$ `Explored` $\rightarrow$ `Applied` $\rightarrow$ `Demonstrated` $\rightarrow$ `Consistently Demonstrated`)

5. **Recruiter Portal Excluded from V1 (PRD Section 27)**:
   - Recruiter access is deferred to V2. V1 focuses on Students, Trainers, College Coordinators, and Institutional Administrators.

6. **Editorial Humanist Aesthetic**:
   - Light theme only (`bg-[#FBFBFB]`, `border-neutral-200`, `text-neutral-900`) using Inter and JetBrains Mono typography. No dark mode overrides.

---

## 2. Development Workflow

### Development Order (PRD Section 40)
Work should proceed in sequence:
```text
01 Repository + Documentation -> 02 Authentication -> 03 Roles & Permissions -> 
04 Institution / B2C Structure -> 05 Batch + Group -> 06 Student Profile -> 
07 Workshop Management -> 08 Attendance -> 09 Feedback -> 10 Evidence / Submission -> 
11 Certifications + Skills -> 12 Notifications -> 13 Reporting -> 14 PWA -> 15 Talent Journey
```

### Git Branching & Commit Conventions
- Use conventional commit messages:
  - `feat(...)`: New features
  - `fix(...)`: Bug fixes
  - `docs(...)`: Documentation updates
  - `refactor(...)`: Code refactoring without behavior changes
  - `test(...)`: Adding or updating test suites
  - `chore(...)`: Tooling, build, or dependency updates

### Verification Prior to PR
Before submitting code, ensure:
```bash
# 1. Type check
./node_modules/.bin/tsc --project tsconfig.json --noEmit

# 2. Webpack production build
./node_modules/.bin/next build --webpack

# 3. Contract tests
node tests/e2e-contract.test.js
```
