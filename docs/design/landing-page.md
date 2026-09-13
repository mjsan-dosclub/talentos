# Landing Page Architecture — DOS Club TalentOS

This document specifies the UX architecture and user journey of the public home page ([`app/page.tsx`](file:///Users/bharathirajathangappalam/talentos/app/page.tsx)).

---

## 1. Curiosity-Driven Gatekeeper Concept

The TalentOS home page is not an open registration portal or marketing brochure. It functions as an **audit gatekeeper** and proof terminal:
- Signals exclusivity, confidentiality, and rigor.
- Directs curious visitors to inspect factual student records using valid member identifiers or credentials.

---

## 2. Core Page Sections

### 1. Status Navigation Bar
- Top-anchored bar displaying live system indicators:
  - System status pulse (`DOS CLUB // TALENT_OS`)
  - Batch indicator (`BATCH: ACTIVE`)
  - Integrity check status (`INTEGRITY_CHECK: STRICT`)
  - Direct links to **Trainer Portal** (`/trainer`), **College Portal** (`/college`), **Admin Console** (`/admin`), and **Sign In** (`/login`).

### 2. Editorial Hero Narrative
- **Headline**: *"Potential is difficult to see in a résumé. TalentOS makes the 27-workshop journey visible."*
- **Subhead**: A longitudinal student development and talent intelligence system documenting real engineering output, behavioral consistency, and production evidence.

### 3. The Three Foundational Principles
Three minimalist bordered panels highlighting operational rigor:
1. **`01 / OBSERVE`**: Dynamic geofencing and zero-grace session windows. Presence and timely execution recorded without excuses.
2. **`02 / EVIDENCE`**: No participation certificates. Repositories, artifacts, and practical deliverables undergo systematic audit.
3. **`03 / EVOLVE`**: Longitudinal consistency over months. Potential proven through sustained output.

### 4. Gatekeeper Record Lookup Engine
- Monospaced terminal input: `ENTER DOS_ID (E.G. DOS-B3-001) OR EMAIL`.
- Instant client-side sanitization routing to `/record/[id]` on Enter or Verify click.
- Explicit feedback notices for invalid keys or missing parameters.
