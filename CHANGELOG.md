# Changelog

All notable changes to the **DOS Club TalentOS** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-09-14

### Added
- **Step 01: Repository & Documentation**: Canonical repository structure with 17 exhaustive documentation specifications (`docs/product/*`, `docs/architecture/*`, `docs/design/*`, `docs/development/*`), `.env.example`, and `CONTRIBUTING.md`.
- **Step 02: Authentication**: Institutional authentication pathways in `/login` for Student, Trainer, College Coordinator, and Root Admin roles with magic link and password support.
- **Step 03: Roles & Permissions**: PRD Section 5 alignment for 4 production roles (`STUDENT`, `TRAINER`, `COLLEGE_ADMIN`, `SUPER_ADMIN`). Explicit exclusion of Recruiter portal from V1 per PRD Section 27.
- **Step 04 & 05: Institution & Batch Structure**: Live Supabase models and seeds for `institutions` (`Anna University & DOS Hub`), `batches` (`Batch 3 - 2026`), and `cohort_groups` (`Systems Engineering - Group Alpha`).
- **Step 06: Student 360 Profile**: Complete 4-tab interface on `/record/[id]` featuring 27-workshop audit trail, multi-dimensional technology inventory, structured certifications, and external diagnostics with trainer observations.
- **Step 07: Workshop Management**: 27 deep-dive systems engineering workshops seeded with venues, geofences, and submission requirements.
- **Step 08: Attendance Engine**: Dynamic geofenced verification, rotating 30s QR tokens (`active_session_tokens`), Trainer exception overrides, and College absence resolution.
- **Step 09: Feedback Pulse**: Session feedback modal and `/api/feedback` endpoint capturing comprehension ratings (1–4), confidence scores (1–5), and key technical learning reflections.
- **Step 10: Evidence Submissions**: Deliverable submission engine on `/submit` recording Git repository URLs, commit SHAs, and hermetic CI test statuses.
- **Step 11: Certifications & Skills**: Multi-dimensional skills matrix decoupled across self-confidence, exposure counts, and maturity levels, with verifiable credentials table.
- **Step 12: Notifications**: Dispatch interface and API route handler for In-App, Email, and SMS/WhatsApp notices via `notification_dispatches`.
- **Step 13: Reporting**: Institutional cohort analytics and workshop completion metrics for College Coordinators and Root Admins.
- **Step 14: PWA**: Web App Manifest (`app/manifest.ts`) configured with standalone display and offline attendance scanning metadata.
- **Step 15: Talent Journey**: Longitudinal visualization from baseline diagnostic to production capstone defense.

### Security
- Remote Supabase PostgreSQL integration with Row Level Security (RLS) policies.
- Server-side route handlers running with isolated service role privileges.
- Cryptographic SHA-256 audit digest generation for student records.
