# Design Principles — DOS Club TalentOS

This document defines the visual design philosophy, layout constraints, typography, and color palette for DOS Club TalentOS.

---

## 1. Humanist Editorial Engineering Aesthetic

TalentOS intentionally rejects the flashy gradients, neon glows, and game-like dark themes common in consumer edtech. Instead, it adopts an **editorial, humanist engineering design system** inspired by high-reliability systems, technical journals, and architectural blueprints:
- **Calm, High-Contrast Light Theme**: Warm white canvas (`bg-[#FBFBFB]`), crisp neutral borders (`border-neutral-200`), and deep neutral typography (`text-neutral-900`).
- **Strict Ban on Dark Mode Overrides**: To maintain consistent printable auditing and institutional clarity, no dark mode toggles or high-saturation neon colors are used.
- **Dense Data Presentation**: Information density is valued over whitespace inflation. Data tables, monospaced metadata labels, and state badges are compact and easily scannable.

---

## 2. Typography Rules

TalentOS pairs two standard typefaces:
- **Body & Headings**: `Inter` (sans-serif) for natural, human-readable hierarchy, high legibility, and calm aesthetic.
- **Technical & Audit Metadata**: `JetBrains Mono` (monospaced) for:
  - System codes (`WS-01`, `DOS-B3-001`, `AU-DOS-01`)
  - Commit hashes and cryptographic SHA-256 strings
  - State badges (`COMPLETED`, `CHECKED_IN`, `GEO_VERIFIED`)
  - Timestamps and coordinate logs

---

## 3. Semantic Color Palette

Color is used strictly for state communication, never decoration:
- **Emerald** (`text-emerald-700`, `bg-emerald-50`, `border-emerald-300`): Approved, verified, passing test outcome, geofence verified.
- **Sky / Blue** (`text-sky-700`, `bg-sky-50`, `border-sky-300`): Active session, checked-in, in progress, applied maturity.
- **Amber** (`text-amber-800`, `bg-amber-50`, `border-amber-300`): Late check-in, pending verification, developing state.
- **Orange** (`text-orange-800`, `bg-orange-50`, `border-orange-300`): Incomplete submission, growth opportunity.
- **Purple / Violet** (`text-purple-800`, `bg-purple-50`, `border-purple-300`): Sanctioned excused absence, institutional Olympiad leave.
- **Red** (`text-red-800`, `bg-red-50`, `border-red-300`): Absent confirmed, unexcused absence, audit rejected.
- **Neutral** (`text-neutral-500`, `bg-neutral-100`, `border-neutral-200`): Registered, upcoming, not required.
