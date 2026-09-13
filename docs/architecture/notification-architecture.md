# Notification Architecture — DOS Club TalentOS

This document specifies the notification dispatch system handling announcements, session reminders, attendance alerts, and deliverable deadlines.

---

## 1. Notification Channels

TalentOS supports multi-channel dispatches:
1. **In-App Alerts**: Displayed prominently in the Student 360 profile and Trainer portal.
2. **Email (Transactional)**: Session agendas, absence notices, and cryptographic audit receipts.
3. **SMS / WhatsApp Direct Push**: Time-sensitive session check-in announcements and critical schedule shifts.

---

## 2. Dispatch Data Model (`notification_dispatches`)

All batch dispatches are tracked in `notification_dispatches`:
- `id` (UUID, Primary Key)
- `target_filter` (JSONB): e.g. `{"batch_id": "...", "institution_id": "...", "status": "ABSENT_UNCONFIRMED"}`
- `channel` (TEXT: `IN_APP`, `EMAIL`, `SMS_WHATSAPP`)
- `title` (TEXT)
- `content` (TEXT)
- `dispatched_by` (TEXT / UUID)
- `sent_count` (INTEGER)
- `created_at` (TIMESTAMPTZ)

---

## 3. Dispatch API (`POST /api/notifications`)

Administrative and trainer portals trigger batch dispatches via `POST /api/notifications`:
```json
{
  "target_filter": { "batch": "Batch 3", "session": "WS-14" },
  "channel": "IN_APP",
  "title": "WS-14 Deliverable Due in 24 Hours",
  "content": "Ensure your GitHub repository link and passing test commit SHA are submitted via the portal.",
  "dispatched_by": "SUPER_ADMIN"
}
```
The endpoint executes server-side with service-role permissions, logging the event into `audit_logs`.
