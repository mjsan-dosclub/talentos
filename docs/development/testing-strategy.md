# Testing Strategy — DOS Club TalentOS

This document specifies the automated verification protocols, API contract testing, and schema validation procedures for DOS Club TalentOS.

---

## 1. Testing Pyramid

TalentOS enforces a three-tier verification harness:

1. **Static Type Checking (TypeScript)**:
   - Command: `./node_modules/.bin/tsc --project tsconfig.json --noEmit`
   - Enforces strict null checks, full interface definitions, and proper route typing across all components.

2. **Hermetic Build Verification (Next.js Webpack)**:
   - Command: `./node_modules/.bin/next build --webpack`
   - Compiles all 21 dynamic and static routes, validating server-side route handlers, CSS module resolution, and PWA manifest generation.

3. **API & Database Contract Testing**:
   - Command: `node tests/e2e-contract.test.js`
   - Executes live integration tests asserting schema conformity against remote Supabase for:
     - Student retrieval (`GET /api/students`)
     - Workshop listing (`GET /api/workshops`)
     - Multi-dimensional skills inventory (`GET /api/skills`)
     - Certifications retrieval (`GET /api/certifications`)
     - Session feedback recording (`POST /api/feedback`)

---

## 2. Invariant Validation Checks

Every test harness run verifies that:
- Attendance records transition only through the 9 approved lifecycle states.
- No composite scoring or percentages are returned by student profile endpoints.
- Skill inventories preserve separate values for confidence, exposure, and maturity.
