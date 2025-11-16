# Deployment Guide 🚀

This guide will help you deploy your House Swipe app to free hosting platforms.

## Free Hosting Options

### 1. **Vercel** (Recommended) ⭐
**Best for:** React/Vite apps, automatic deployments, great performance

**Pros:**
- ✅ Free tier with generous limits
- ✅ Automatic deployments from GitHub
- ✅ Built-in CI/CD
- ✅ Custom domains
- ✅ Environment variables management
- ✅ Fast global CDN
- ✅ Preview deployments for PRs

**Steps:**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your `renter` repository
5. Configure:
   - Framework Preset: **Vite**
   - Root Directory: `./` (or leave default)
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Click "Deploy"
8. Your app will be live in ~2 minutes!

**URL Format:** `https://your-app-name.vercel.app`

---

### 2. **Netlify**
**Best for:** Static sites, form handling, serverless functions

**Pros:**
- ✅ Free tier available
- ✅ Automatic deployments from GitHub
- ✅ Easy environment variables
- ✅ Custom domains
- ✅ Form handling
- ✅ Split testing

**Steps:**
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select your `renter` repository
5. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Go to Site settings → Environment variables
7. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
8. Deploy!

**URL Format:** `https://your-app-name.netlify.app`

---

### 3. **GitHub Pages**
**Best for:** Simple static hosting, free with GitHub

**Pros:**
- ✅ Completely free
- ✅ Integrated with GitHub
- ✅ Custom domains
- ⚠️ Requires build step setup

**Steps:**
1. Install GitHub Actions for deployment
2. Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```
3. Go to repo Settings → Pages
4. Select source: "GitHub Actions"
5. Add environment variables via GitHub Secrets (repo Settings → Secrets)

**URL Format:** `https://batmanxx0.github.io/renter`

---

### 4. **Render**
**Best for:** Full-stack apps, databases, background workers

**Pros:**
- ✅ Free tier for static sites
- ✅ Automatic SSL
- ✅ Custom domains
- ✅ Environment variables

**Steps:**
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Static Site"
4. Connect your `renter` repository
5. Configure:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
6. Add environment variables
7. Deploy!

**URL Format:** `https://your-app-name.onrender.com`

---

### 5. **Cloudflare Pages**
**Best for:** Fast global CDN, great performance

**Pros:**
- ✅ Free tier
- ✅ Fast global CDN
- ✅ Automatic deployments
- ✅ Custom domains
- ✅ Environment variables

**Steps:**
1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Sign up with GitHub
3. Create a project → Connect `renter` repo
4. Configure:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Add environment variables
6. Deploy!

**URL Format:** `https://your-app-name.pages.dev`

---

## Environment Variables Setup

For all platforms, you need to add these environment variables:

1. **VITE_SUPABASE_URL**
   - Get from: Supabase Dashboard → Settings → API → Project URL
   - Example: `https://abcdefghijklmnop.supabase.co`

2. **VITE_SUPABASE_ANON_KEY**
   - Get from: Supabase Dashboard → Settings → API → anon/public key
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Important:** 
- These are **public** variables (safe to expose)
- They start with `VITE_` so Vite includes them in the build
- Never commit `.env` file to GitHub (it's in `.gitignore`)

---

## Post-Deployment Checklist

After deploying:

1. ✅ Test the live URL
2. ✅ Verify authentication works
3. ✅ Check that Supabase connection works
4. ✅ Test on mobile device
5. ✅ Share with testers!

---

## Recommended: Vercel

For this React/Vite app, **Vercel is the best choice** because:
- Optimized for Vite/React
- Fastest deployment process
- Best developer experience
- Automatic preview deployments
- Great free tier

---

## Troubleshooting

### Build fails
- Check that all dependencies are in `package.json`
- Verify build command is correct
- Check environment variables are set

### Environment variables not working
- Make sure they start with `VITE_`
- Redeploy after adding variables
- Check variable names match exactly

### Supabase connection issues
- Verify URL and key are correct
- Check Supabase project is active
- Ensure RLS policies are set correctly

---

## Next Steps

1. Choose a hosting platform (we recommend Vercel)
2. Push your code to GitHub (already done!)
3. Connect repository to hosting platform
4. Add environment variables
5. Deploy!
6. Share your live URL with testers 🎉

