# Environments & Deployment Guide — DOS Club TalentOS

This document defines the configuration, environment variables, and deployment procedures for DOS Club TalentOS across development, staging, and production tiers.

---

## 1. Environment Tiers

| Environment | Database Target | Next.js Server URL | Intended Audience |
|---|---|---|---|
| **Local Development** | Remote Supabase Dev / Local Postgres | `http://localhost:3000` | Engineers & Contributors |
| **Staging** | Remote Supabase Staging Project | `https://staging-talentos.dosclub.org` | Institutional Leads & Trainers |
| **Production** | Remote Supabase Production Cluster | `https://talentos.dosclub.org` | Active Batches & Members |

---

## 2. Environment Variables Specification

All tiers require the following configuration defined in `.env.local` (or platform secrets):

```env
# 1. Remote Supabase URL
NEXT_PUBLIC_SUPABASE_URL=https://mwpqlmptznykdjvnaqcd.supabase.co

# 2. Public Anon Key (Client-safe)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 3. Service Role Secret Key (Server-only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 4. Canonical Base URL
NEXT_PUBLIC_APP_URL=https://talentos.dosclub.org
```

---

## 3. Deployment Procedure (Vercel / Node.js)

1. Ensure build command is set to:
   ```bash
   next build --webpack
   ```
2. Configure environment variables in the host control panel.
3. Run database migrations:
   ```bash
   node scripts/seed-supabase.js
   ```
