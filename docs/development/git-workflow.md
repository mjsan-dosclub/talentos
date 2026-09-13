# Git Workflow & Commit Guidelines — DOS Club TalentOS

This document specifies the branching strategies, conventional commit standards, and pull request verification rules for DOS Club TalentOS.

---

## 1. Branch Strategy

- **`main`**: Production-ready branch. All commits must build cleanly with zero TypeScript errors and passing webpack bundles.
- **`feat/<feature-name>`**: Development of new features (e.g. `feat/attendance-qr`, `feat/skills-matrix`).
- **`fix/<bug-name>`**: Bug fixes and regression repairs.
- **`docs/<topic>`**: Documentation updates.

---

## 2. Conventional Commit Standards

Every commit message must use the Conventional Commits format:
```text
<type>(<scope>): <short imperative description>
```

### Types
- `feat`: A new user-facing feature or API endpoint.
- `fix`: A bug fix.
- `docs`: Documentation-only changes.
- `refactor`: Code changes that neither fix a bug nor add a feature.
- `test`: Adding or correcting tests.
- `chore`: Build scripts, dependencies, or configuration updates.

### Examples
- `feat(student360): implement multi-dimensional skills inventory and certifications tab`
- `fix(attendance): handle clock drift in rotating QR token validation`
- `docs(architecture): document geofence haversine formula and audit log schema`

---

## 3. Pre-Commit Verification Checklist

Before pushing to remote or opening a PR:
```bash
# 1. Type check
./node_modules/.bin/tsc --project tsconfig.json --noEmit

# 2. Webpack production build
./node_modules/.bin/next build --webpack

# 3. Contract tests
node tests/e2e-contract.test.js
```
