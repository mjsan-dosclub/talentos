# TalentOS V1 Deviation Register

> **Official Log of Architectural Deviations, Compromises, and Temporary Workarounds**  
> *Repository File*: `docs/deviation-register.md`  
> *Associated Tracking Matrix*: [`V1_ACCEPTANCE_MATRIX.md`](../V1_ACCEPTANCE_MATRIX.md)  
> *Last Updated*: 2026-09-14

---

## 1. Deviation Summary

This register logs every instance where the current implementation varies from the canonical target specification, ensuring total transparency during client presentations, QA audits, and product acceptance.

```text
Total Deviations Logged:    4
Approved for V1 Demo:       3
Pending Product Review:     1
```

---

## 2. Active Deviations

| DEV ID | Target Requirement | Expected Behaviour | Current Behaviour | Technical Reason | User Impact | Approved for V1 Demo? | Target Resolution |
|---|---|---|---|---|---|---|---|
| **DEV-01** | Geofence Hardware Hardening (`TAL-046`) | Multi-sensor validation (GPS + Wi-Fi BSSID + IP triangulation) within 150m. | Browser HTML5 Geolocation API with Haversine distance calculation against venue coordinates. | Native hardware Wi-Fi BSSID scanning is restricted by web browser security sandboxes. | Low (Students must still grant location permission; spoofing requires active developer mode mock GPS). | **YES (Approved for V1)** | V2 Native App wrapper or PWA Web Bluetooth beacon pairing. |
| **DEV-02** | Firebase Cloud Push Notifications (`TAL-092`) | OS-level lock screen push notifications via Firebase Cloud Messaging (FCM). | Real-time In-App Notification Bell & Badge + Admin Communication Gateway Config (SMTP Email, WhatsApp API, Telegram). | Production Firebase service account credentials and APNs / VAPID certificates pending live domain SSL. | Medium (Users receive alerts while inside the web app; external alerts require configured email/SMS gateway). | **YES (Temporary for V1 Demo)** | V1.1 when custom production domain and FCM project keys are provisioned. |
| **DEV-03** | Rotating Dynamic QR Token (`TAL-047`) | QR rotates every 30 seconds via WebSocket / Server-Sent Events (SSE). | QR regenerates on session start and validates timestamp window (< 2 hours); trainer can click Refresh to generate new token. | Preventing connection drops in campus network environments with aggressive firewall timeouts. | Low (Sufficient for in-person workshop verification where trainer displays screen live). | **YES (Approved for V1)** | V1.1 WebSocket channel with automatic 30s token rotation ticker. |
| **DEV-04** | Check-Out Mandatory Feedback Gating (`TAL-063`) | Student cannot scan Check-Out QR until Post-Workshop Feedback is submitted. | Feedback form is prompted immediately upon check-in and available on dossier, but check-out scanner can be accessed in parallel. | Prevents students from being stranded if their mobile device encounters network errors during feedback submission. | Low (Trainer can audit feedback submission status on `/trainer` roster). | **UNDER REVIEW** | Add a soft warning modal on Check-Out if feedback rating is empty. |

---

## 3. Deviation Lifecycle & Rules

1. **No Silent Workarounds**: Any deviation from the functional requirements must be logged here before marking a task as complete.
2. **Impact Assessment**: Every deviation must declare whether it impacts student grading, institutional trust, or security integrity.
3. **Demo Transparency**: During demonstrations, team leads must reference this register so expectations are aligned.
