# Catechism Themes Feature - Deployment Guide

**Feature:** Temi Catechismo (Catechism Themes)
**Date:** 2026-02-04
**Status:** ✅ Ready for Production Deployment

---

## Quick Start (5 minutes)

### Step 1: Run the Migration

```bash
# Populate theme tags in the database
npm run migrate:theme-tags

# Expected output:
# 🔄 Starting theme tag migration...
# 📌 Theme: trinita (34 paragraphs)
#    ✅ trinita: completed
# ... (25 themes total)
# ✨ Migration complete!
#    ✅ Successfully updated: 1,523 paragraphs
#    ⚠️  Errors: 0
```

### Step 2: Verify the Migration

```bash
npm run verify:theme-tags

# Expected output:
# 🔍 Verifying theme tag population...
# 📊 Total CCC paragraphs: 2865
# ...
# ✅ Theme migration appears successful!
```

### Step 3: Test Locally

```bash
npm run dev

# Then visit in browser:
# http://localhost:4321/catechismo/temi          (theme index)
# http://localhost:4321/catechismo/tema/trinita  (example theme)
```

### Step 4: Build & Deploy

```bash
# Build for production
npm run build

# Commit and push to GitHub
git add .
git commit -m "Populate Catechism Themes - migration complete"
git push origin main

# GitHub Actions will automatically build and deploy to VPS
```

---

## Detailed Walkthrough

### Prerequisites

- ✅ PostgreSQL running and accessible
- ✅ `DATABASE_URL` set in `.env`
- ✅ npm/Node.js 20+ installed
- ✅ Project dependencies installed: `npm install`

### Environment Setup

```bash
# Verify environment variables are set
echo $DATABASE_URL

# Should output: postgresql://verbum_user:PASSWORD@localhost:5432/verbum_lucis
```

### Migration Process

#### 1. Backup Database (Optional but Recommended)

```bash
# Create a backup before running migration
npm run db:backup

# Check backup was created
ls -lh backups/
```

#### 2. Run Theme Tag Migration

```bash
npm run migrate:theme-tags
```

**What the script does:**
- Reads 25 theme-to-CCC mappings
- Queries the database for each CCC paragraph
- Adds theme slug to the paragraph's `tags` JSONB field
- Tracks success and error counts

**Expected results:**
- **Successfully updated:** ~1,500+ paragraphs
- **Without tags:** ~1,300 paragraphs (not covered by any theme)
- **Errors:** 0 (unless there are database issues)

#### 3. Verify Theme Coverage

```bash
npm run verify:theme-tags
```

**Output explains:**
- Total paragraphs per theme
- Which themes have coverage
- Which themes are missing (if any)
- Overall percentage of paragraphs with theme tags

**Acceptable results:**
- ✅ 25/25 themes present
- ✅ 1,200-1,600 paragraphs with tags (50-60% coverage)
- ✅ 0 errors

**If verification fails:**
- Re-run migration: `npm run migrate:theme-tags`
- Check database: `docker logs verbum-lucis-db`
- See Troubleshooting section below

### Local Testing

#### 1. Start Dev Server

```bash
npm run dev

# Output:
# ★ http://localhost:4321/ ready in 1234ms
```

#### 2. Test Theme Index

Open browser: http://localhost:4321/catechismo/temi

**Should see:**
- ✅ Page title: "Temi Catechismo"
- ✅ 4 tabs: Parte I, II, III, IV
- ✅ 25 theme cards displayed
- ✅ Theme descriptions and links
- ✅ Search box for CCC numbers

#### 3. Test Individual Theme Pages

Click any theme card or navigate directly:

```
http://localhost:4321/catechismo/tema/trinita
http://localhost:4321/catechismo/tema/eucarestia
http://localhost:4321/catechismo/tema/preghiera
http://localhost:4321/catechismo/tema/maria-santissima
```

**Each page should show:**
- ✅ Theme title and description
- ✅ Related CCC paragraphs listed in order
- ✅ Sidebar with related content
- ✅ Print and share buttons
- ✅ Breadcrumb navigation
- ✅ No 404 errors

#### 4. Performance Testing

```bash
# Check page load time in dev tools
# Target: < 1 second

# Open Lighthouse audit
# In Chrome DevTools: F12 → Lighthouse → Generate report
```

### Production Build

#### 1. Build for Production

```bash
npm run build

# Expected output:
# ✓ Completed in 45s
#
# dist/
#   └── server/
#       └── entry.mjs
```

**Check build artifacts:**
```bash
ls -la dist/server/entry.mjs
# Should exist and be > 500KB
```

#### 2. Preview Production Build

```bash
npm run preview

# Visit: http://localhost:4321/catechismo/temi
# Should work exactly like dev mode
```

#### 3. Commit & Push to GitHub

```bash
# Stage changes
git add scripts/migrate-theme-tags.js scripts/verify-theme-tags.js THEMES.md THEMES-DEPLOYMENT.md

# Commit
git commit -m "Add Catechism Themes feature - migration and verification scripts"

# Push to origin
git push origin main
```

### Automated Deployment (GitHub Actions)

Once pushed to `main` branch:

1. GitHub Actions workflow triggers automatically
2. Builds and tests in CI environment
3. If successful, deploys to VPS automatically
4. Health check verifies deployment

**Monitor deployment:**
```bash
# On VPS
ssh debian@158.69.219.187
docker logs -f verbum-lucis-app | grep "ready\|error"

# Ctrl+C to exit
```

**Verify on VPS:**
```bash
curl -s https://verbumlucis.it/catechismo/temi | grep "Temi Catechismo"
# Should return HTML containing "Temi Catechismo"

curl -s https://verbumlucis.it/catechismo/tema/trinita | head -20
# Should return HTML for Trinity theme
```

---

## Verification Checklist

### Local Environment
- [ ] `npm install` completed without errors
- [ ] `npm run migrate:theme-tags` completed successfully (0 errors)
- [ ] `npm run verify:theme-tags` shows 25 themes with coverage
- [ ] `npm run dev` starts without errors
- [ ] http://localhost:4321/catechismo/temi loads correctly
- [ ] 25 theme cards visible in 4 tabs
- [ ] Sample theme page loads (e.g., /tema/trinita)
- [ ] CCC paragraphs display under each theme
- [ ] `npm run build` completes without errors

### GitHub Repository
- [ ] Code committed and pushed to `main` branch
- [ ] GitHub Actions build workflow triggered
- [ ] Build completed successfully (green checkmark)
- [ ] Deploy workflow triggered (if configured)

### Production VPS
- [ ] SSH access working: `ssh debian@158.69.219.187`
- [ ] Docker containers running: `docker ps` shows `verbum-lucis-app` and `verbum-lucis-db`
- [ ] Website responsive: `curl https://verbumlucis.it/catechismo/temi`
- [ ] Theme pages accessible: `https://verbumlucis.it/catechismo/tema/trinita`
- [ ] No 500 errors in logs: `docker logs verbum-lucis-app`
- [ ] Sitemap includes theme pages: check `/sitemap.xml`

### SEO & Analytics
- [ ] Verify theme pages in Google Search Console
- [ ] Monitor Core Web Vitals for new pages
- [ ] Check structured data: https://schema.org/validate with theme page URL
- [ ] Setup Google Analytics for `/catechismo/tema/*` routes

---

## Troubleshooting

### Migration Fails with Database Error

**Error:** `ECONNREFUSED 127.0.0.1:5432`

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# If not running, start it
docker-compose up -d postgres

# Wait for health check (30 seconds)
docker-compose ps
# Column "health" should show "(healthy)"

# Retry migration
npm run migrate:theme-tags
```

### Theme Pages Return 404

**Problem:** Theme pages not found (404 error)

```bash
# Check 1: Verify migration completed
npm run verify:theme-tags

# Check 2: Verify database has data
docker exec -it verbum-lucis-db psql -U verbum_user -d verbum_lucis -c \
  "SELECT COUNT(*) as count FROM catechism WHERE tags != '[]'::jsonb;"
# Should return > 1,000

# Check 3: Rebuild Astro routes
npm run build

# Check 4: Restart dev server
# Kill current: Ctrl+C
npm run dev
```

### Migration Slow or Hangs

**Problem:** Migration script running very slowly

```bash
# Check 1: Database performance
docker exec -it verbum-lucis-db psql -U verbum_user -d verbum_lucis -c \
  "SELECT version();"
# Should return PostgreSQL 16.x

# Check 2: Check for locks
docker exec -it verbum-lucis-db psql -U verbum_user -d verbum_lucis -c \
  "SELECT pid, usename, application_name FROM pg_stat_activity WHERE query NOT LIKE '%pg_stat_activity%';"

# Check 3: Increase timeout
# Edit scripts/migrate-theme-tags.js, increase database timeout
```

### Build Fails with TypeScript Errors

**Error:** `Type 'string' is not assignable to type 'number'`

```bash
# Usually a Drizzle ORM issue
# Solution 1: Verify schema.ts is correct
cat db/schema.ts | grep -A 3 "numero:"
# Should show: numero: integer('numero')...

# Solution 2: Regenerate migrations
npm run db:generate

# Solution 3: Clean and rebuild
rm -rf node_modules
npm install
npm run build
```

---

## Rollback Instructions

If something goes wrong in production:

### Option 1: Revert to Previous Git Tag

```bash
# List git tags
git tag

# Checkout previous tag (before theme feature)
git checkout v1.0.0

# Push to revert on VPS
git push origin v1.0.0:main --force

# Warning: Only use if absolutely necessary!
```

### Option 2: Restore Database from Backup

```bash
# On VPS
ssh debian@158.69.219.187

# List available backups
ls -lh /opt/verbum-lucis/backups/

# Restore from backup (choose one)
docker exec -i verbum-lucis-db psql -U verbum_user -d verbum_lucis < \
  /opt/verbum-lucis/backups/restore-point-v1.0.0.sql

# Restart app
docker restart verbum-lucis-app

# Verify
curl https://verbumlucis.it/catechismo/1
```

### Option 3: Remove Theme Tags from Database

```bash
# Reset all tags to empty array
docker exec -it verbum-lucis-db psql -U verbum_user -d verbum_lucis -c \
  "UPDATE catechism SET tags = '[]'::jsonb;"

# Or remove theme pages (keep CCC pages)
# Edit src/pages/catechismo/temi.astro - delete file
# Edit src/pages/catechismo/tema/[tema].astro - delete file

# Rebuild and redeploy
npm run build
git commit -m "Rollback: Remove theme pages"
git push origin main
```

---

## Next Steps

### After Successful Deployment

1. **Monitor Performance**
   - Check Google Search Console for indexing
   - Monitor Core Web Vitals
   - Watch analytics for new page traffic

2. **SEO Optimization**
   - Add internal links from related pages
   - Create breadcrumb navigation
   - Update XML sitemap (automatic)

3. **Content Enhancement** (Phase 2)
   - Link themes to related prayers
   - Link themes to related saints
   - Add AI-generated summaries per theme

4. **Future Content** (Phase 3)
   - Bible integration (+31,000 pages)
   - Feast days calendar (+365 pages)
   - Expand saints database (15 → 100+ entries)

---

## Support & Questions

### Debugging Commands

```bash
# Check app logs
docker logs -f verbum-lucis-app

# Check database logs
docker logs -f verbum-lucis-db

# Connect to database directly
docker exec -it verbum-lucis-db psql -U verbum_user -d verbum_lucis

# Check theme tags in specific CCC paragraph
docker exec -it verbum-lucis-db psql -U verbum_user -d verbum_lucis -c \
  "SELECT numero, tags FROM catechism WHERE numero = 254;"

# Count paragraphs per theme
docker exec -it verbum-lucis-db psql -U verbum_user -d verbum_lucis -c \
  "SELECT jsonb_array_elements(tags)::text as theme, COUNT(*)
   FROM catechism WHERE tags != '[]'::jsonb
   GROUP BY theme ORDER BY COUNT(*) DESC;"
```

### Related Documentation

- **Main Feature Doc:** [THEMES.md](THEMES.md)
- **Project Guide:** [CLAUDE.md](CLAUDE.md)
- **Deployment Guide:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **SEO Strategy:** [KEYWORD-STRATEGY.md](KEYWORD-STRATEGY.md)

---

**Created:** 2026-02-04
**Status:** Ready for Production
**Maintainer:** Claude Code
