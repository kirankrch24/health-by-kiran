# Health by Kiran Kumar — Next.js Setup Guide

## What's inside
- Next.js 14 app (TypeScript, App Router)
- All 5 pages: Login, Dashboard, 75 Hard, Food Log, Body Metrics
- Google Sheets integration preserved (all 3 script URLs intact)
- GitHub Pages auto-deploy via GitHub Actions

---

## Step 1 — Push this folder to your GitHub repo

1. Open Terminal and navigate to this folder:
   ```
   cd "~/Desktop/Monk Health/health-by-kiran/health-by-kiran-next"
   ```

2. Initialise git and push:
   ```bash
   git init
   git remote add origin https://github.com/kirankrch24/health-by-kiran.git
   git add .
   git commit -m "feat: rebuild in Next.js with mobile-first design"
   git push -u origin main --force
   ```

   > ⚠️ The `--force` will replace the existing repo content. Your Google Sheets data is safe — only the code changes.

---

## Step 2 — Enable GitHub Pages

1. Go to your repo on GitHub: https://github.com/kirankrch24/health-by-kiran
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, select **GitHub Actions**
4. Save. That's it!

GitHub Actions will now auto-build and deploy every time you push to `main`.

Your live URL will be:
👉 **https://kirankrch24.github.io/health-by-kiran/**

---

## Step 3 — Run locally (optional)

```bash
npm install
npm run dev
```
Open http://localhost:3000/health-by-kiran/

---

## Google Sheets URLs (already wired in)
All 3 Google Apps Script URLs from your original site are preserved in:
`lib/config.ts` — do not change these unless you update your Apps Scripts.

