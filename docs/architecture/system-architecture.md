# System Architecture — DOS Club TalentOS

This document details the high-level system architecture, service layers, and data flow of DOS Club TalentOS.

---

## 1. High-Level Architectural Diagram

```text
               +-------------------------------------------------------------+
               |                       CLIENT LAYER                          |
               |                                                             |
               |   +-------------------+  +-------------------------------+  |
               |   |  Student Portal   |  | Trainer & College Dashboards  |  |
               |   |   (/record/[id])  |  |      (/trainer, /college)     |  |
               |   +-------------------+  +-------------------------------+  |
               |   +-------------------+  +-------------------------------+  |
               |   | Admin Console     |  | Deliverable Submission        |  |
               |   |     (/admin)      |  |          (/submit)            |  |
               |   +-------------------+  +-------------------------------+  |
               +-------------------------------------------------------------+
                                              |
                                              | HTTPS / JSON
                                              v
               +-------------------------------------------------------------+
               |                     NEXT.JS 16 APP ROUTER                   |
               |                                                             |
               |   +-----------------------------------------------------+   |
               |   | Server Components & SSR Rendering                   |   |
               |   +-----------------------------------------------------+   |
               |   +-----------------------------------------------------+   |
               |   | Route Handlers (/api/students, /api/workshops,      |   |
               |   |   /api/attendance, /api/skills, /api/certifications,|   |
               |   |   /api/feedback, /api/notifications)                |   |
               |   +-----------------------------------------------------+   |
               |   +-----------------------------------------------------+   |
               |   | Isolated Service Role Client (lib/supabase-admin.ts)|   |
               |   +-----------------------------------------------------+   |
               +-------------------------------------------------------------+
                                              |
                                              | Encrypted Wire Protocol (TLS 1.3)
                                              v
               +-------------------------------------------------------------+
               |                  REMOTE SUPABASE POSTGRESQL                 |
               |                                                             |
               |   +---------------------+   +---------------------------+   |
               |   | Institutions        |   | Batches & Cohort Groups   |   |
               |   +---------------------+   +---------------------------+   |
               |   +---------------------+   +---------------------------+   |
               |   | Students Roster     |   | 27 Curriculum Workshops   |   |
               |   +---------------------+   +---------------------------+   |
               |   +---------------------+   +---------------------------+   |
               |   | Attendance Records  |   | Evidence Submissions      |   |
               |   +---------------------+   +---------------------------+   |
               |   +---------------------+   +---------------------------+   |
               |   | Technology Inventory|   | Certifications Ledger     |   |
               |   +---------------------+   +---------------------------+   |
               |   +---------------------+   +---------------------------+   |
               |   | External Assessments|   | Session Feedback & Audit  |   |
               |   +---------------------+   +---------------------------+   |
               |                                                             |
               |   Row Level Security (RLS) & Triggers                       |
               +-------------------------------------------------------------+
```

---

## 2. Core Architectural Components

### A. Web Frontend (`apps/web` or Root Next.js)
- Built with **Next.js 16** using the App Router.
- Styled using **Tailwind CSS v4** with zero dark mode overrides, preserving humanist editorial light aesthetics.
- Progressive Web App support via [`app/manifest.ts`](file:///Users/bharathirajathangappalam/talentos/app/manifest.ts).

### B. Server-Side Route Handlers (`app/api/*`)
- Secure API endpoints executing on Node.js runtime.
- Interacts with remote Supabase via `SUPABASE_SERVICE_ROLE_KEY` in [`lib/supabase-admin.ts`](file:///Users/bharathirajathangappalam/talentos/lib/supabase-admin.ts) to enforce administrative policies while shielding service keys from client bundles.

### C. Data Persistence Layer (Supabase PostgreSQL)
- Remote PostgreSQL instance configured with UUID extensions and custom ENUM types.
- Enforces relational foreign keys across institutions, batches, cohort groups, students, workshops, and attendance records.
- Client-side fallback resilience provided by [`lib/db.ts`](file:///Users/bharathirajathangappalam/talentos/lib/db.ts).
