# Open Decisions & Future Roadmap — DOS Club TalentOS

This document tracks technical and product questions currently open for discussion, planned experiments, and roadmap features under consideration for V2 and beyond.

---

## 1. Recruiter Access Architecture (V2)

- **Context**: Recruiter access is deferred until V2 (PRD Section 27).
- **Open Questions**:
  - Should recruiters search across cohorts anonymously, or require direct student authorization (opt-in disclosure)?
  - How will recruiters verify commit authenticity without granting public access to private institutional GitHub repositories?
  - Will recruiters be allowed to contact students directly, or must communication route through college placement coordinators?

---

## 2. Peer Code Review Integration

- **Context**: In V1, peer reviews are logged as text sign-offs (`peerReviewSignoff: "Faculty Lead + 2 Senior Peer Auditors"`).
- **Open Questions**:
  - Should TalentOS integrate GitHub webhooks to automatically parse pull request comments and approvals?
  - Should peer reviewers receive explicit audit credits on their own Student 360 profile for thorough code reviews conducted?

---

## 3. Offline Mesh Attendance Sync

- **Context**: Venues with poor cellular connectivity may experience delays in transmitting real-time GPS coordinates.
- **Open Questions**:
  - Can Bluetooth Low Energy (BLE) beacons or local Wi-Fi mesh nodes cryptographically sign attendance packets offline and synchronize once connectivity is restored?
  - How do we prevent clock-drift spoofing in offline mode?
