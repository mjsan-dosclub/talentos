# Product Decisions — DOS Club TalentOS

This document records key product and technical decisions, their underlying rationale, and rejected alternatives.

---

## 1. Relational PostgreSQL via Supabase Over Document Stores

- **Decision**: Adopt Supabase PostgreSQL as the primary database with strict ENUM types and foreign key relationships.
- **Rationale**: Student development journeys require strict referential integrity. Attendance records must map unconditionally to valid student IDs and workshop IDs. Relational consistency prevents dangling or orphaned audit records.
- **Rejected Alternative**: MongoDB / NoSQL. Document models permit schema drift and lack strict foreign key constraints at the database level.

---

## 2. 9 Invariant Lifecycle States Only

- **Decision**: Restrict attendance and workshop states to exactly 9 approved states: `REGISTERED`, `CHECKED_IN`, `LATE`, `INCOMPLETE`, `COMPLETED`, `ABSENT_UNCONFIRMED`, `ABSENT_CONFIRMED`, `EXCUSED`, `MANUALLY_CONFIRMED`.
- **Rationale**: Uniform state transitions allow institutional auditors and automated pipelines to evaluate attendance without ambiguous statuses like "PENDING", "UNKNOWN", or "HALFWAY".

---

## 3. Rotating 30-Second Dynamic QR Tokens

- **Decision**: Attendance QR codes rotate every 30 seconds via `active_session_tokens` table.
- **Rationale**: Static QR codes printed on paper or projected on slides are easily photographed and shared via messaging apps, enabling fraudulent proxy attendance. 30-second cryptographic tokens require physical presence inside the venue.

---

## 4. Exclusion of Recruiter Portal from V1

- **Decision**: Restrict recruiter access until V2 release (PRD Section 27).
- **Rationale**: Prioritizing student development, longitudinal execution tracking, and institutional trust must precede commercial recruiter monetization. Launching recruiter access prematurely risks incentivizing vanity metrics over authentic learning.

---

## 5. Decoupled 3-Dimensional Skill Tracking

- **Decision**: Never aggregate skills into a single composite score.
- **Rationale**: Composite scores hide critical qualitative nuances. A student may have low self-reported confidence but extensive verified commits (imposter syndrome), or high confidence with zero commits (overconfidence). Showing both dimensions alongside developmental maturity gives a truthful assessment.
