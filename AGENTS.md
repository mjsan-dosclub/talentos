<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# TalentOS V1 Delivery Control & AI Audit Instructions

## 1. Traceability & Acceptance Enforcement
Before claiming any module or requirement is complete, compare the implementation directly against `V1_ACCEPTANCE_MATRIX.md` (and `docs/v1-delivery-checklist.md`).
- Report every missing requirement, deviation, test failure, and `NEEDS_PRODUCT_DECISION`.
- Never mark a module complete based solely on the existence of UI or source code.
- Enforce the 12 criteria of the **Definition of Done (DoD)** before marking any item as `PASSED` or `PRODUCT_ACCEPTED`.

## 2. Mandatory V1 Gap Report
At the end of every development cycle or major change, produce a `V1 GAP REPORT` containing:
- **Completed Requirements**: Verified against acceptance criteria.
- **Incomplete Requirements**: Explicit gaps remaining.
- **Deviations**: Any architectural or technical compromise logged in `docs/deviation-register.md`.
- **Failed / Untested Items**: Areas requiring test execution.
- **Unresolved Product Decisions**: Flagged for product owner review.
- **Security & Integrity Risks**: Vulnerabilities or unauthenticated leakages.
- **Technical Debt Introduced**: Cleanup tasks to schedule.

