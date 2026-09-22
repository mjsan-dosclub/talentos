# TalentOS QA Progress

Last reviewed: 2026-09-22
Scope: `qa` branch and QA Supabase project only. Production and `main` were not modified.

## Verified

- QA branch is at commit `ccf288d`.
- Production build passes with TypeScript compilation.
- Live QA Supabase contract checks pass: 5/5.
- Migrations `013_role_credentials.sql` and `015_attendance_qr_tokens.sql` are applied in QA.
- Scheduler writes are Super Admin-only; trainer, college, and student schedule reads are role-filtered.
- Scheduler status rules are enforced: Scheduled/Postponed are manual; Active in Session/Completed are calculated from date and time.
- Attendance and checkout require a signed session. Student QR operations require a server-issued, expiring token bound to a scheduled session and active master workshop.
- Checkout requires prior check-in and a 1–5 feedback rating; failed requests do not create a local receipt.
- Core CSV exports and student bulk CSV upload are implemented.
- Workshop scheduler list/selected CSV export is implemented.
- Remaining admin mutation routes identified in the role audit are protected server-side.
- Student assessments, skills, certifications, and feedback reads require authentication and student ownership checks.
- Super Admin credentials are no longer hard-coded; they are read from deployment secrets.

## Remaining blockers

- The QA Vercel domain was still serving an older build at the last remote check: `GET /api/enquiry` returned `200` instead of the expected unauthenticated `403`. Redeploy the deployment sourced from `qa` commit `7f10e1c`.
- Existing expert and college records need initial passwords set after migration `013`; this is a QA data-setup task, not a code defect.
- Actual external schedule emails to college POCs, experts, and students are not enabled. The scheduler records an in-app notification dispatch; explicit authorization is still required before sending database-derived recipients email automatically.
- Master admin users are not implemented. The permission model must be chosen before granting custom admins access to Super Admin capabilities.
- Full browser regression of the complete QR check-in and feedback checkout needs one real assigned student, one assigned expert, and a currently active scheduled session.
- QA Vercel environment must define `SESSION_SECRET`, `SUPER_ADMIN_EMAIL`, and `SUPER_ADMIN_PASSWORD_HASH`.

## Release decision

**NO-GO until the QA deployment is refreshed and the remaining blockers above are closed or explicitly accepted.**
