# TalentOS V1 &mdash; Vercel Production Deployment Guide

This guide details how to deploy **TalentOS** to **Vercel** with full CI/CD, custom domains, database connectivity, and security headers.

---

## 1. Quick Prerequisites

Before deploying to Vercel, ensure you have:
1. Access to the Git repository on GitHub / GitLab / Bitbucket.
2. A free or pro account on [Vercel](https://vercel.com).
3. The live Supabase credentials (URL, Anon Key, Service Role Key).
4. A random 32+ character string for `QR_SIGNING_SECRET`.

---

## 2. Deploying via Vercel Dashboard (Recommended)

### Step 1: Import the Project
1. Go to [vercel.com/new](https://vercel.com/new).
2. Select your Git provider and import the `talentos` repository.
3. In **Project Name**, enter `talentos` (or your preferred name).
4. Framework Preset will automatically be detected as **Next.js**.
5. Root Directory: `./` (default).

### Step 2: Configure Build and Output Settings
Vercel automatically picks up settings from `vercel.json` and `package.json`:
- **Build Command**: `npm run build` (runs `next build --webpack`)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### Step 3: Add Environment Variables
In the **Environment Variables** section, copy the values from `.env.example`:

| Variable Name | Required | Description / Value |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | `https://<project-id>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Client-safe anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Server-only administrative key |
| `QR_SIGNING_SECRET` | **Yes** | Random 32+ character signing key |
| `NEXT_PUBLIC_APP_URL` | **Yes** | `https://talentos.descienceosclub.com` (or your `.vercel.app` URL) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | *Optional* | Firebase Web API key for push alerts |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | *Optional* | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | *Optional* | Firebase sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | *Optional* | Firebase Web App ID |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | *Optional* | Web push public VAPID key |

> **Security Note**: Never check `SUPABASE_SERVICE_ROLE_KEY` or `QR_SIGNING_SECRET` into git. They are injected securely by Vercel at runtime.

### Step 4: Click "Deploy"
Vercel will clone the repo, install dependencies, run `npm run build`, and deploy the application to a global edge CDN.

---

## 3. Deploying via Vercel CLI

If you prefer deploying from your terminal:

```bash
# 1. Install Vercel CLI (if not already installed)
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Link and Deploy Preview
vercel

# 4. Deploy to Production
vercel --prod
```

During CLI setup, accept the default Next.js settings and add your environment variables using `vercel env add <KEY> production`.

---

## 4. Custom Domain Setup (`talentos.descienceosclub.com`)

1. In the Vercel Dashboard, navigate to **Project Settings &rarr; Domains**.
2. Enter `talentos.descienceosclub.com` (or your domain) and click **Add**.
3. In your DNS provider (Cloudflare, GoDaddy, Namecheap, etc.), add the recommended CNAME record:
   - **Type**: `CNAME`
   - **Name**: `talentos`
   - **Target**: `cname.vercel-dns.com`
4. Vercel automatically provisions and renews SSL/TLS certificates through Let's Encrypt within 1&ndash;2 minutes.

---

## 5. Post-Deployment Verification Checklist

Once deployed, verify the following core flows on the live URL:

1. **Landing Page**: Check that all images load, pastel stat cards render, and the single-line case studies carousel functions smoothly.
2. **Public Dossier Access**: Open `https://your-domain/record/DOS-B3-001` in an incognito window. Confirm it loads without redirecting to `/login`.
3. **Public Ledger Access**: Open `https://your-domain/ledger/CERT-DOS-B3-001`. Confirm cryptographic verification ledger renders.
4. **Member & Admin Login**: Log in with demo accounts (e.g. `admin@talentos.dosclub.internal` or `trainer@talentos.dosclub.internal`).
5. **PWA Manifest**: Open DevTools &rarr; Application &rarr; Manifest to verify `manifest.webmanifest` and Service Worker registration.
6. **Case Studies API**: Test `curl https://your-domain/api/casestudies` to verify JSON syndication payload for `descienceosclub.com`.

---

## 6. Continuous Deployment (CI/CD)

Any commit pushed to the `main` branch on GitHub will automatically trigger an atomic, zero-downtime production deployment on Vercel. Pull requests will receive unique preview URLs for stakeholder review.
