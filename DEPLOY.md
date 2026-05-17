# MassaPro — Deploy to Your Real Domain (massapro.com)

## Overview

Your Next.js app will be deployed to **Vercel** (free) and accessible at:
- **`https://receptionist.massapro.com`** — Main receptionist landing page
- **`https://receptionist.massapro.com/med-spa`** — Med Spa subpage

Your main Framer site stays at **`https://massapro.com`** untouched.

---

## STEP 1: Push Code to GitHub (5 min)

1. Go to [github.com/new](https://github.com/new) and create a new repository:
   - Name: `massapro-receptionist`
   - Set to **Private** (recommended)
   - Do NOT initialize with README

2. On your computer, open a terminal and run:
   ```bash
   cd /path/to/your/project
   git remote add origin https://github.com/YOUR_USERNAME/massapro-receptionist.git
   git branch -M main
   git push -u origin main
   ```

---

## STEP 2: Deploy to Vercel (5 min)

1. Go to [vercel.com/signup](https://vercel.com/signup) and sign up with your **GitHub account**

2. Click **"Add New Project"**

3. Select the `massapro-receptionist` repository from the list

4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `next build` (default)
   - **Output Directory**: Leave default
   - Click **"Deploy"**

5. Wait ~2 minutes for the build to complete

6. Vercel gives you a temporary URL like `massapro-receptionist.vercel.app` — your site is live!

---

## STEP 3: Add Your Custom Domain (3 min)

1. In your Vercel project dashboard, go to **Settings → Domains**

2. Type `receptionist.massapro.com` and click **Add**

3. Vercel will show you DNS records to add. It will look like this:
   ```
   Type:  CNAME
   Name:  receptionist
   Value: cname.vercel-dns.com
   ```

---

## STEP 4: Configure DNS in GoDaddy (3 min)

1. Log into [GoDaddy](https://dcc.godaddy.com/)

2. Go to **My Products → DNS → Manage DNS** for massapro.com

3. Click **"Add New Record"**:
   - **Type**: CNAME
   - **Name**: `receptionist`
   - **Value**: `cname.vercel-dns.com`
   - **TTL**: 600 (or default)

4. Click **Save**

5. Wait 5-30 minutes for DNS propagation

6. Visit `https://receptionist.massapro.com` — your site is live!

---

## STEP 5: Link from Your Framer Site

In your Framer site at massapro.com, add a link or button that says:
- **"AI Receptionist"** → links to `https://receptionist.massapro.com`
- **"Med Spa Solutions"** → links to `https://receptionist.massapro.com/med-spa`

---

## Future Updates — How It Works

Every time you push changes to the GitHub repository, Vercel **automatically rebuilds and deploys** your site. No manual steps needed!

### Option A: Make changes locally and push
```bash
git add .
git commit -m "Update pricing section"
git push
# Vercel auto-deploys in ~1-2 minutes
```

### Option B: Make changes in this AI environment
After making changes here, you can download the project files and push them to GitHub. Or use the Vercel CLI:
```bash
npx vercel --prod
```

---

## URL Structure Summary

| URL | Content |
|-----|---------|
| `massapro.com` | Your Framer main site (unchanged) |
| `receptionist.massapro.com` | AI Receptionist landing page |
| `receptionist.massapro.com/med-spa` | Med Spa dedicated page |

---

## Cost: $0

- Vercel Hobby plan: **Free** (100GB bandwidth, unlimited deployments)
- GoDaddy DNS: Already included with your domain
- No additional hosting costs
