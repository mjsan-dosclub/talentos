# Attendance Engine & Geofencing Flow — DOS Club TalentOS

This document details the attendance lifecycle, physical presence verification, dynamic QR rotation, and exception resolution workflows.

---

## 1. Zero-Grace Window & Invariant Lifecycle States

Attendance operates on strict zero-grace policies. The session lifecycle transitions through exact states:

```text
[REGISTERED]
     │
     ├─► Arrives within 5 min window + within geofence ──► [CHECKED_IN] ──► [COMPLETED]
     │
     ├─► Arrives 6–15 min past start window ──────────────► [LATE]
     │
     ├─► Fails deliverable / leaves early ────────────────► [INCOMPLETE]
     │
     ├─► No check-in recorded at session close ───────────► [ABSENT_UNCONFIRMED]
     │                                                               │
     │       College Coordinator sanctions leave                     │
     │       ───────────────────────────────────────────────────────► [EXCUSED]
     │                                                               │
     │       Unexcused after review window                           │
     │       ───────────────────────────────────────────────────────► [ABSENT_CONFIRMED]
     │
     └─► Device failure resolved by Trainer ──────────────────────► [MANUALLY_CONFIRMED]
```

---

## 2. Geofence Verification Mechanics

1. **Venue Coordinate Anchoring**: Each workshop defines `venue_lat`, `venue_lng`, and `venue_radius_meters` (typically 120m to 200m depending on campus hall geometry).
2. **Haversine Distance Calculation**: When a student scans the QR code, the client browser transmits device GPS coordinates (`check_in_lat`, `check_in_lng`) to `/api/attendance`.
3. **Boundary Verification**: The distance $d$ between student $(lat_1, lon_1)$ and venue $(lat_2, lon_2)$ is computed:
   $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta lat}{2}\right) + \cos(lat_1)\cos(lat_2)\sin^2\left(\frac{\Delta lon}{2}\right)}\right)$$
   Where $R = 6,371,000\text{ meters}$. If $d \le \text{venue\_radius\_meters}$, the geofence check passes.

---

## 3. Rotating 30-Second Dynamic QR Tokens

- To eliminate proxy check-ins, the Trainer Portal displays a dynamic QR code refreshed every 30 seconds.
- The server generates an HMAC-signed token stored in `active_session_tokens` with an expiration timestamp (`expires_at = now() + 30s`).
- Expired tokens are immediately rejected by `/api/attendance`.

---

## 4. Exception Handling & Audit Logging

When physical conditions prevent normal QR scanning (e.g. dead battery, GPS drift indoors):
1. The **Trainer** opens the participant roster in the Trainer Portal (`/trainer`).
2. Clicks **Manual Override**, selecting `MANUALLY_CONFIRMED` or `CHECKED_IN`.
3. The Trainer **must** provide a written reason (e.g. *"Student physically present in Hall 4; mobile GPS sensor failed to acquire lock"*).
4. An immutable event is written to `audit_logs` capturing `actor_id`, `actor_role: TRAINER`, `old_state`, `new_state`, and `reason`.
