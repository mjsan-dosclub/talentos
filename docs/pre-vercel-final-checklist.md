# Final Pre-Vercel Deployment Checklist

This document is your final operational checklist before deploying TalentOS to Vercel for trial, testing, and final domain connection.

---

## 1. Backend Architecture: Vercel vs. Render

| Question | Answer | Details |
|---|---|---|
| **Do we need Render for the backend?** | **NO** | TalentOS is a full-stack Next.js application. All 23 API endpoints (`/api/**`) run natively as Vercel Serverless Functions. |
| **Do we need a Vercel & Render connector?** | **NO** | Frontend and Backend live in the same unified repository and deploy together seamlessly on Vercel. |
| **Are there background daemon processes?** | **NO** | All jobs (attendance geofencing, QR tokens, feedback, admissions enquiries) are event-driven HTTP route handlers. |

---

## 2. Database Decision: Supabase vs. Neon

| Consideration | Recommendation | Reason |
|---|---|---|
| **Current Setup** | **Supabase (PostgreSQL)** | All 23 route handlers and seed scripts are actively integrated with `@supabase/supabase-js`. The remote project is already provisioned and seeded. |
| **Switching to Neon now?** | **Defer to V2 (Post-Demo)** | Switching to Neon would require rewriting all query logic to raw SQL or Drizzle/Prisma, rewriting RLS security policies, and risking regressions right before your demo. |
| **Action** | **Stay with Supabase for the Demo** | Use your existing Supabase credentials on Vercel. Transition to Neon can be evaluated smoothly in V2. |

---

## 3. Optical QR Code Attendance Fix (Verified)

- **Issue Identified**: The previous workshop QR code was rendered using mock CSS `<div>` blocks (a visual placeholder) rather than an optical 2D barcode matrix.
- **Fix Implemented**:
  1. Updated [app/trainer/page.tsx](file:///Users/bharathirajathangappalam/talentos/app/trainer/page.tsx) to generate a genuine, high-contrast optical QR code.
  2. Encodes the dynamic URL: `<origin>/checkin?token=<30s-rotating-token>&workshop=WS-07`.
  3. Updated [app/checkin/page.tsx](file:///Users/bharathirajathangappalam/talentos/app/checkin/page.tsx) to automatically detect and pre-fill `?token=...` from the scanned URL.
- **Mobile Camera Test**: Point any mobile phone camera or scanner app at the Trainer screen &mdash; it now instantly recognizes and opens the check-in URL.

---

## 4. Emailer Status & Roadmap

- **Current Status**:
  - Email templates are defined in `lib/notification-templates.ts` (College digests, Student alerts, Trainer workshop assignments with free Google & Apple calendar links).
  - Admin UI is built in `NotificationEngineTab.tsx` and Settings in `app/admin/settings/page.tsx`.
  - Dispatch is currently simulated/templated in V1.
- **Enabling Live Email Delivery on Vercel**:
  - The recommended provider for Vercel is **Resend** (free tier: 3,000 emails/month) or **SendGrid/Postmark**.
  - No server configuration needed; 1 API key in Vercel environment variables enables live delivery.

---

## 5. One-Click Fast Login Reminder

- **File Location**: [app/login/page.tsx](file:///Users/bharathirajathangappalam/talentos/app/login/page.tsx) (lines 190&ndash;250).
- **Recommendation for Demo/Trial**: **KEEP enabled during your Vercel subdomain trial** so you and your team can test all 4 roles (Student, Trainer, College, Admin) with 1 click without entering passwords.
- **Before Production Domain Launch**:
  - We will remove the 4 quick demo buttons (or toggle them off via `NEXT_PUBLIC_ENABLE_DEMO_LOGIN=false`) so external users must authenticate with real credentials.

---

## 6. Pre-Vercel Step-by-Step Deployment Runbook

### Step A: Push Latest Commits to GitHub
```bash
git push origin main
```

### Step B: Create Project in Vercel
1. Go to [vercel.com/new](https://vercel.com/new).
2. Select your repository.
3. Framework Preset: **Next.js**.
4. Build Command: `npm run build` (auto-detected).
5. Output Directory: `.next` (auto-detected).

### Step C: Enter Environment Variables in Vercel Dashboard
In **Settings &rarr; Environment Variables**, add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://mwpqlmptznykdjvnaqcd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
QR_SIGNING_SECRET=generate_a_random_32_character_secret
NEXT_PUBLIC_APP_URL=https://<your-project>.vercel.app
```

### Step D: Trial & Smoke Testing (on Vercel Subdomain)
1. **Landing Page**: Verify hero, pastel stat cards, and single-line case studies carousel.
2. **Attendance QR Scan**: Open `/trainer` on a desktop or laptop, and scan the QR code using your mobile phone camera.
3. **Check-In Verification**: Verify that the mobile scanner opens, auto-populates the token, acquires GPS location, and successfully logs check-in.
4. **Public Dossier Inspection**: Open `/record/DOS-B3-001` in an incognito window.
5. **Admin Console**: Log in and verify sessions, students, and settings.

### Step E: Main Domain Cutover (`talentos.descienceosclub.com`)
1. Remove/toggle the one-click login buttons.
2. In Vercel Project Settings &rarr; Domains &rarr; Add `talentos.descienceosclub.com`.
3. Add the DNS CNAME record in your DNS provider:
   - **Name**: `talentos`
   - **Target**: `cname.vercel-dns.com`
4. Update `NEXT_PUBLIC_APP_URL` to `https://talentos.descienceosclub.com`.
