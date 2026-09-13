# DOS Club TalentOS

**Student Growth. Learning Evidence. Talent Intelligence.**  
*DeScience Open Source Club • Singapore // Chennai*

DOS Club TalentOS is the operating platform for the Descience Open Source Club student-development ecosystem. TalentOS is designed to capture a student's journey over time — from onboarding and baseline assessments through workshops, attendance, learning evidence, certifications, projects, trainer observations, and eventual industry readiness.

TalentOS is **not** designed as a conventional LMS, college portal, or certificate issuer. It is designed as an immutable talent operating system capturing real engineering output, behavioral consistency, and production evidence.

---

## 1. The Three Core Principles

1. **01 / OBSERVE**: Dynamic geofencing and zero-grace session windows. Real-time presence and timely execution are recorded, not excuses.
2. **02 / EVIDENCE**: No participation certificates. Repositories, artifacts, and practical deliverables undergo systematic audit.
3. **03 / EVOLVE**: Surfaces longitudinal consistency. Potential is proven through sustained output over months across 27 workshops.

---

## 2. Invariant Rules & PRD Constraints

- **Strict 9 Lifecycle States Only**: `REGISTERED`, `CHECKED_IN`, `LATE`, `INCOMPLETE`, `COMPLETED`, `ABSENT_UNCONFIRMED`, `ABSENT_CONFIRMED`, `EXCUSED`, `MANUALLY_CONFIRMED`.
- **Zero Composite or Algorithmic Scoring**: Strictly NO "Talent Scores", weighted percentages, or AI ratings. Every candidate is represented by raw, factual counts and verified commit SHAs.
- **Developmental Growth Language**: Uses progression language (`Developing`, `Progressing`, `Consistent`, `Demonstrated`, `Growth Opportunity`) rather than punitive grades (`Fail`, `Weak`).
- **Three Distinct Skill Dimensions**: Maintains three unmerged dimensions for skills: Self-Reported Confidence (1–5), Audited Exposure Count, and Evidence-Backed Maturity (`Introduced` $\rightarrow$ `Consistently Demonstrated`).
- **Recruiter Portal Excluded from V1**: Per PRD Section 27, Recruiter access is deferred to V2.

---

## 3. Canonical Repository Structure

```text
dosclub-talentos/
│
├── README.md                          # Platform documentation & repository overview
├── .gitignore                         # Git exclusion rules
├── .env.example                       # Environment variable configuration template
├── CONTRIBUTING.md                    # Contributor guide & engineering invariants
├── CHANGELOG.md                       # Release journal & milestone changelog
│
├── docs/                              # Canonical system documentation
│   ├── product/
│   │   ├── product-principles.md      # Ground truth, factual output, growth language
│   │   ├── v1-scope.md                # V1 release scope vs deferred features
│   │   ├── product-decisions.md       # Architectural decisions & rejected alternatives
│   │   └── open-decisions.md          # Open questions & V2 roadmap
│   │
│   ├── architecture/
│   │   ├── system-architecture.md     # High-level architecture, topology & data flow
│   │   ├── data-model.md              # Relational schema, ERD & table definitions
│   │   ├── permissions.md             # Role-based access control (RBAC) matrix
│   │   ├── attendance-flow.md         # Geofencing, rotating QR tokens & audit logs
│   │   ├── notification-architecture.md# Multi-channel batch dispatching
│   │   └── security-and-audit.md      # SHA-256 proofs & immutable audit logs
│   │
│   ├── design/
│   │   ├── design-principles.md       # Editorial humanist light design & typography
│   │   ├── landing-page.md            # Curiosity-driven gatekeeper UX
│   │   └── navigation.md              # Route topology & responsive layout
│   │
│   └── development/
│       ├── ai-development-rules.md    # Mandatory rules for human & AI engineers
│       ├── git-workflow.md            # Branching, conventional commits & PR checks
│       ├── environments.md            # Local, Staging, and Production setups
│       └── testing-strategy.md        # Static typing, webpack builds & contract tests
│
├── apps/                              # Applications & Services
│   ├── web/                           # Next.js 16 Web Application & App Router UI
│   └── api/                           # Background worker daemon & job processors
│
├── packages/                          # Modular Shared Packages
│   ├── ui/                            # Design tokens & UI primitive constants
│   ├── database/                      # Supabase client helpers & database types
│   ├── shared/                        # TypeScript types, enums & developmental bands
│   └── config/                        # Base tsconfig & shared lint configurations
│
├── migrations/                        # Supabase PostgreSQL DDL & RLS Policies
│   ├── 001_initial_schema.sql         # Tables, enums, constraints & foreign keys
│   └── 002_rls_and_policies.sql       # Row Level Security policies
│
├── scripts/                           # Administrative & Seeding Scripts
│   └── seed-supabase.js               # 10-table live Supabase seeding script
│
└── tests/                             # Automated Test Harness
    └── e2e-contract.test.js           # Live contract verification against Supabase
```

---

## 4. Quick Start

### 1. Prerequisites
- Node.js 20+
- Remote Supabase project with PostgreSQL enabled

### 2. Setup Environment
```bash
cp .env.example .env.local
# Populate NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY
```

### 3. Run Database Migrations & Seeds
```bash
node scripts/seed-supabase.js
```

### 4. Development Server
```bash
npm run dev
# Server listening on http://localhost:3000
```

### 5. Verification Harness
```bash
# Type check
./node_modules/.bin/tsc --project tsconfig.json --noEmit

# Production build
./node_modules/.bin/next build --webpack

# Contract tests
node tests/e2e-contract.test.js
```
