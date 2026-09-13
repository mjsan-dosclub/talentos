# Data Model & Schema Specification — DOS Club TalentOS

This document specifies the complete relational schema, ENUM definitions, and entity relationships implemented in Supabase PostgreSQL for DOS Club TalentOS.

---

## 1. PostgreSQL ENUM Types

```sql
CREATE TYPE cohort_type AS ENUM ('B2B', 'B2C');
CREATE TYPE session_mode AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');
CREATE TYPE submission_type AS ENUM (
  'NONE',
  'GITHUB_REPO',
  'PROJECT_URL',
  'DOCUMENT',
  'IMAGE',
  'VIDEO',
  'EXTERNAL_ASSESSMENT',
  'FORM_RESPONSE',
  'OTHER'
);
CREATE TYPE submission_status AS ENUM (
  'NOT_REQUIRED',
  'PENDING',
  'SUBMITTED',
  'SUBMITTED_LATE',
  'REVIEWED',
  'RESUBMISSION_REQUESTED'
);
CREATE TYPE attendance_status AS ENUM (
  'NOT_STARTED',
  'CHECKED_IN',
  'LATE',
  'PARTIAL',
  'COMPLETED',
  'ABSENT_UNCONFIRMED',
  'ABSENT_CONFIRMED',
  'EXCUSED',
  'MANUALLY_CONFIRMED'
);
CREATE TYPE attendance_source AS ENUM (
  'QR_SCAN',
  'TRAINER_MANUAL',
  'ADMIN_OVERRIDE',
  'COLLEGE_CONFIRMED'
);
CREATE TYPE skill_maturity AS ENUM (
  'INTRODUCED',
  'EXPLORED',
  'APPLIED',
  'DEMONSTRATED',
  'CONSISTENTLY_DEMONSTRATED'
);
CREATE TYPE cert_status AS ENUM (
  'PENDING_VERIFICATION',
  'VERIFIED',
  'REJECTED'
);
```

---

## 2. Table Schemas & Foreign Keys

### `institutions`
- `id` (UUID, Primary Key)
- `name` (TEXT)
- `code` (TEXT, Unique)
- `contact_email` (TEXT)
- `contact_person` (TEXT)
- `default_lat` (NUMERIC)
- `default_lng` (NUMERIC)
- `geofence_radius_meters` (INTEGER, Default: 200)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

### `batches`
- `id` (UUID, Primary Key)
- `institution_id` (UUID, FK $\rightarrow$ `institutions.id`)
- `type` (cohort_type)
- `name` (TEXT)
- `year` (INTEGER)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

### `cohort_groups`
- `id` (UUID, Primary Key)
- `batch_id` (UUID, FK $\rightarrow$ `batches.id`)
- `group_name` (TEXT)
- `max_capacity` (INTEGER, Default: 40)
- `is_closed` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

### `students`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Nullable, FK $\rightarrow$ `auth.users.id`)
- `group_id` (UUID, FK $\rightarrow$ `cohort_groups.id`)
- `dos_id` (TEXT, Unique)
- `full_name` (TEXT)
- `email` (TEXT, Unique)
- `phone` (TEXT)
- `course` (TEXT)
- `department` (TEXT)
- `year_of_study` (INTEGER)
- `is_archived` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

### `workshops`
- `id` (UUID, Primary Key)
- `batch_id` (UUID, FK $\rightarrow$ `batches.id`)
- `session_number` (INTEGER, 1 to 27)
- `title` (TEXT)
- `description` (TEXT)
- `trainer_name` (TEXT)
- `session_mode` (session_mode)
- `scheduled_at` (TIMESTAMPTZ)
- `duration_minutes` (INTEGER)
- `venue_name` (TEXT)
- `venue_lat` (NUMERIC)
- `venue_lng` (NUMERIC)
- `venue_radius_meters` (INTEGER, Default: 150)
- `submission_required` (BOOLEAN)
- `submission_type` (submission_type)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

### `attendance_records`
- `id` (UUID, Primary Key)
- `student_id` (UUID, FK $\rightarrow$ `students.id`)
- `workshop_id` (UUID, FK $\rightarrow$ `workshops.id`)
- `status` (attendance_status)
- `source` (attendance_source)
- `check_in_time` (TIMESTAMPTZ)
- `check_in_lat` (NUMERIC)
- `check_in_lng` (NUMERIC)
- `manual_override_by` (UUID, Nullable)
- `override_reason` (TEXT)
- `created_at` (TIMESTAMPTZ)
- Unique: `(student_id, workshop_id)`

### `evidence_submissions`
- `id` (UUID, Primary Key)
- `workshop_id` (UUID, FK $\rightarrow$ `workshops.id`)
- `student_id` (UUID, FK $\rightarrow$ `students.id`)
- `status` (submission_status)
- `artifact_url` (TEXT)
- `notes` (TEXT)
- `submitted_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)
- Unique: `(workshop_id, student_id)`

### `student_technology_inventory`
- `id` (UUID, Primary Key)
- `student_id` (UUID, FK $\rightarrow$ `students.id`)
- `tool_name` (TEXT)
- `self_confidence` (INTEGER, 1 to 5)
- `evidence_backed_maturity` (skill_maturity)
- `assessed_level` (TEXT: `Developing`, `Progressing`, `Consistent`, `Demonstrated`, `Growth Opportunity`)
- `evidence_count` (INTEGER)
- `updated_at` (TIMESTAMPTZ)
- Unique: `(student_id, tool_name)`

### `certifications`
- `id` (UUID, Primary Key)
- `student_id` (UUID, FK $\rightarrow$ `students.id`)
- `title` (TEXT)
- `provider` (TEXT)
- `category` (TEXT)
- `level` (TEXT)
- `completed_date` (DATE)
- `credential_url` (TEXT)
- `status` (cert_status)
- `verified_by` (UUID, Nullable)
- `verified_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)

### `session_feedback`
- `id` (UUID, Primary Key)
- `attendance_id` (UUID, FK $\rightarrow$ `attendance_records.id`, Unique)
- `rating` (INTEGER, 1 to 4)
- `key_learning` (TEXT)
- `confidence_score` (INTEGER, 1 to 5)
- `created_at` (TIMESTAMPTZ)

### `active_session_tokens`
- `id` (UUID, Primary Key)
- `workshop_id` (UUID, FK $\rightarrow$ `workshops.id`)
- `token` (TEXT)
- `expires_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)

### `notification_dispatches`
- `id` (UUID, Primary Key)
- `target_filter` (JSONB)
- `channel` (TEXT)
- `title` (TEXT)
- `content` (TEXT)
- `dispatched_by` (TEXT)
- `sent_count` (INTEGER)
- `created_at` (TIMESTAMPTZ)

### `audit_logs`
- `id` (UUID, Primary Key)
- `actor_id` (UUID)
- `actor_role` (TEXT)
- `entity_name` (TEXT)
- `entity_id` (TEXT)
- `action` (TEXT)
- `old_state` (JSONB)
- `new_state` (JSONB)
- `reason` (TEXT)
- `created_at` (TIMESTAMPTZ)
