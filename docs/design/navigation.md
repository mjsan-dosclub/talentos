# Navigation & Information Architecture — DOS Club TalentOS

This document defines the route topology, user navigation hierarchies, and responsive layout behavior across DOS Club TalentOS.

---

## 1. Route Topology

```text
/                              -> Public Curiosity Landing & Gatekeeper Lookup
├── /login                     -> Role-Based Authentication Gateway (Student, Trainer, College, Admin)
├── /record/[id]               -> Student 360 Profile (4 Tabs: Journey, Skills, Certs, Assessments)
├── /trainer                   -> Trainer Portal (Live QR token generator, session roster, manual override)
├── /college                   -> College Coordinator Portal (Institutional stats, absence justification)
├── /admin                     -> Root Admin Console (Roster management, single enrollment, CSV ingestion)
├── /admin/sessions            -> Live Workshop Session Auditor
├── /submit                    -> Student Deliverable Submission Engine
├── /talent                    -> V1 Exclusion Notice (PRD Section 27)
└── /api/*                     -> Next.js Server Route Handlers
```

---

## 2. Navigation State Persistence

- **Top Bar**: Sticky header with back link, current role badge, and contextual actions.
- **Drawer Panels**: Slide-out dossiers (e.g. workshop evidence drawer) use modal backdrops and respond to the `Escape` key.
- **Tab Switching**: Tabs in the Student 360 profile preserve client state without triggering full-page browser reloads.
- **Mobile Adaptability**: On mobile devices, data grids convert into vertically stacked, readable cards; table headers retain horizontal scroll without truncation.
