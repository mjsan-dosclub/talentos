# Permissions & RBAC Matrix — DOS Club TalentOS

This document specifies the Role-Based Access Control (RBAC) rules enforced across DOS Club TalentOS in accordance with **PRD Section 5**.

---

## 1. Official V1 User Roles

TalentOS defines exactly 5 user tiers:
1. `STUDENT`: Enrolled club participant tracking personal progress and submitting deliverables.
2. `TRAINER`: Workshop instructor conducting sessions, managing live QR check-ins, and logging standout observations.
3. `COLLEGE_ADMIN`: College placement and faculty coordinator auditing institutional attendance and sanctioning official leaves.
4. `COMMITTEE`: DOS Club organizing committee monitoring multi-institutional operations.
5. `SUPER_ADMIN`: Root technical leads managing system configuration, schema migrations, and batch provisioning.

*Note: Recruiter access is explicitly excluded from V1 (PRD Section 27).*

---

## 2. Permissions Matrix

| Resource / Capability | `STUDENT` | `TRAINER` | `COLLEGE_ADMIN` | `COMMITTEE` | `SUPER_ADMIN` |
|---|:---:|:---:|:---:|:---:|:---:|
| **View Own Student 360 Record** | Read | Read | Read | Read | Read |
| **View Any Student Record** | - | Cohort | Institution | All | All |
| **Self-Check-In via QR & Geofence** | Execute | - | - | - | - |
| **Manual Attendance Override** | - | Execute (with reason) | - | Execute | Execute |
| **Confirm Excused Absence** | - | - | Execute (with proof) | Execute | Execute |
| **Submit Workshop Deliverable** | Write | - | - | - | - |
| **Submit Session Feedback Pulse** | Write | - | - | - | - |
| **Update Skill Self-Confidence** | Write | - | - | - | - |
| **Assess Skill Maturity Level** | - | Write | - | Write | Write |
| **Tag Standout Participant** | - | Write (max 3/session) | - | - | Write |
| **Submit Certification for Audit**| Write | - | - | - | - |
| **Verify / Reject Certification** | - | - | - | Write | Write |
| **Enroll Single Student** | - | - | - | Write | Write |
| **Bulk CSV Roster Ingestion** | - | - | - | - | Write |
| **Dispatch Batch Notifications** | - | - | - | Write | Write |
| **View Audit Logs** | - | - | - | Read | Read |
