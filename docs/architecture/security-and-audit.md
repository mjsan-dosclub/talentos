# Security & Audit Architecture — DOS Club TalentOS

This document details the security protocols, privilege separation, cryptographic hashing, and immutable auditing policies implemented across DOS Club TalentOS.

---

## 1. Privilege Isolation & Service Role Protection

- **Client Environment (`NEXT_PUBLIC_*`)**: Web clients have access only to `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. These keys are strictly governed by PostgreSQL Row Level Security (RLS).
- **Server Environment (`SUPABASE_SERVICE_ROLE_KEY`)**: The service role secret is restricted entirely to Node.js server route handlers ([`lib/supabase-admin.ts`](file:///Users/bharathirajathangappalam/talentos/lib/supabase-admin.ts)). It is never bundled into client JavaScript.
- **Direct Database Access Prohibited**: All write operations (attendance check-ins, deliverable submissions, feedback pulses) flow through verified Next.js server route handlers.

---

## 2. Cryptographic Proof Digest (SHA-256)

To guarantee the tamper-resistance of longitudinal student records:
- Each workshop record computes a SHA-256 digest over the canonical string representation of:
  ```text
  SHA256(student_id + workshop_id + lifecycle_state + check_in_timestamp + commit_sha + test_outcome)
  ```
- The cumulative Student 360 record displays a top-level **Cryptographic Audit Record Stamp** (e.g. `SHA-256: 4a8b79e1c2d0f3a6e8b7c9a2d1f4e5a8b7c9a2d1f4e5a8b7c9a2d1f4e5a8b7c9`).
- Modifying any past record in PostgreSQL invalidates the cryptographic verification chain.

---

## 3. Immutable Lifecycle Audit Trail (`audit_logs`)

All administrative overrides, absence approvals, certification reviews, and roster mutations create append-only records in `audit_logs`:
- `actor_id`: User ID initiating the mutation.
- `actor_role`: Official role (`TRAINER`, `COLLEGE_ADMIN`, `SUPER_ADMIN`).
- `entity_name`: Target table (`attendance_records`, `certifications`, `students`).
- `entity_id`: Primary key of the affected record.
- `action`: State transition name (e.g. `MANUAL_ATTENDANCE_OVERRIDE`, `EXCUSED_ABSENCE_CONFIRMATION`).
- `old_state` & `new_state`: JSONB snapshots capturing exact pre- and post-mutation values.
- `reason`: Mandatory text rationale explaining the change.
- `created_at`: Server timestamp.

`audit_logs` has no `UPDATE` or `DELETE` permissions granted to any role.
