# TalentOS QA Progress

Last reviewed: 2026-09-16
Scope: `qa` branch and QA Supabase project only.

## Verified

- QA deployment loads successfully.
- Admin credential login works.
- Enquiry submission is persisted in Supabase and visible in the admin enquiry roster after refresh.
- Resend gateway dispatch works and includes the configured global CC.
- Production build passes.
- Repository contract checks pass: 5/5.

## Corrected assessment

Seeded records are QA fixtures created by `scripts/seed-supabase.js`; they are not proof that the corresponding UI create workflows work. The seeded set currently includes 5 students, 27 workshops, and 1 college.

The following acceptance basics require direct UI verification or implementation:

- Workshop create workflow is not yet verified.
- Student create workflow does not currently collect a mobile number.
- Landing enquiry form does not clearly collect an applicant name; it is currently institution/contact oriented.
- Full create/edit/delete persistence has not been verified for every module.
- CSV export is implemented for enquiries; exports for the remaining modules are pending.

## Security blockers

- Session authorization is not cryptographically signed.
- Demo/admin credentials remain in application code.
- Current RLS policies include unrestricted public write policies.
- Email test endpoint requires access control hardening.

## Release decision

**NO-GO for production.** Functional smoke tests are encouraging, but the acceptance-matrix basics and security blockers must be resolved and retested.
