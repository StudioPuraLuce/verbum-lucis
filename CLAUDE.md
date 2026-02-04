# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Verbum Lucis (formerly Liturgia Cattolica) is an Italian Catholic spiritual portal built with Astro, React, PostgreSQL, and Drizzle ORM. The project aims to generate 100,000+ SEO-optimized programmatic pages covering daily liturgy for all Italian dioceses, saints, prayers, novenas, catechism, and intent-based spiritual content.

**Key Features:**
- National and diocesan liturgical calendars (226 Italian dioceses)
- Dynamic daily liturgy pages
- Saints database with patron saint searches
- Prayers, novenas, and blessings
- Catechism of the Catholic Church (CCC) indexed by paragraph
- Intent-based pages (e.g., "prego per mia madre", "trovare lavoro")
- Automated cron jobs for daily liturgy updates

## Technology Stack

- **Framework:** Astro 4.3.x (hybrid SSR/SSG mode)
- **UI Components:** React 18.2.x + shadcn/ui + Tailwind CSS 3.4.x
- **Database:** PostgreSQL 16 (Alpine) with Drizzle ORM 0.29.x
- **Runtime:** Node.js 20 LTS
- **Deployment:** Docker + Docker Compose
- **External APIs:** LitCal API (litcal.johnromanodorazio.com), calapi.inadiutorium.cz

## Common Development Commands

### Development
```bash
npm run dev                    # Start dev server (http://localhost:4321)
npm run build                  # Build for production
npm run preview                # Preview production build
```

### Database Operations
```bash
npm run db:generate            # Generate Drizzle migrations from schema
npm run db:push                # Push schema changes to PostgreSQL
npm run db:seed                # Seed initial database data
npm run db:backup              # Manual database backup (requires DATABASE_URL)
```

### Data Import Scripts
```bash
npm run import:dioceses        # Import Italian dioceses
npm run import:catechism       # Import Catechism of Catholic Church
npm run import:intentions      # Import intent-based categories
npm run import:prayers         # Import prayers from JSON
npm run scrape:saints          # Scrape saints data
npm run import:all             # Run all imports sequentially
```

### External Data Aggregation (Airtable, Google Sheets, CSV)
**Configuration:** Environment variables in `.env` (see [.env.example](.env.example))

```bash
npm run import:airtable        # Import from Airtable tables
npm run import:sheets          # Import from Google Sheets
npm run import:csv -- ./data/file.csv  # Import from CSV file
npm run import:external        # Run all external imports (orchestrator)
```

**Setup Required:**
1. **Airtable:** Set `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` in `.env`
2. **Google Sheets:** Set `GOOGLE_SHEETS_CREDENTIALS` (JSON service account) and `GOOGLE_SHEET_ID` in `.env`
3. **CSV Files:** Place files in `data/` directory with headers

**Script Templates:**
- [scripts/import-airtable.js](scripts/import-airtable.js) - Customizable Airtable mapper
- [scripts/import-sheets.js](scripts/import-sheets.js) - Google Sheets API v4 integration
- [scripts/import-csv.js](scripts/import-csv.js) - Generic CSV parser with column mapping
- [scripts/import-external.js](scripts/import-external.js) - Orchestrator (runs all imports)

### Liturgy Updates
```bash
npm run update-liturgy         # Update today's liturgy
npm run update-liturgy:all     # Update liturgy for next 7 days
npm run sync-saints            # Sync saints with liturgy calendar
```

### MCP Integration (Model Context Protocol)
**MCP Server:** Liturgical Calendar via [CatholicOS/liturgical-calendar-mcp](https://github.com/CatholicOS/liturgical-calendar-mcp)

**Configuration:** `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`

```bash
npm run populate:dioceses      # Populate liturgy for all 226 Italian dioceses (requires MCP)
```

**Available MCP Tools:**
- `list_available_calendars()` - Enumera tutte le diocesi disponibili (226 diocesi italiane)
- `get_national_calendar(year)` - Calendario nazionale cattolico
- `get_diocesan_calendar(code, year)` - Calendario diocesano specifico
- `get_liturgy_of_the_day(date, calendar)` - Celebrazioni per data specifica
- `get_announcement_easter_and_moveable_feasts(year)` - Epiphany announcement with moveable feasts

**Benefits:**
- Direct API access without manual HTTP requests
- Built-in caching (24h metadata, 168h calendar data)
- Automatic detection of particular celebrations (diocesan patrons, saints)
- Type-safe liturgical data structures

**Usage in Scripts:**
```javascript
// When MCP is available in VS Code, you can use:
const result = await mcp.get_diocesan_calendar({
  calendar: 'IT-RM',  // Diocese code
  year: 2026
});

// Returns: { date: { celebrations: [...], color: 'white', ... }, ... }
```

### Catechism Themes (Temi Catechismo)
**Feature Status:** ✅ Implemented & Ready for Migration
**Routes:** `/catechismo/temi` (index), `/catechismo/tema/[tema]` (dynamic)
**SEO Impact:** +2,500 pages, +15K monthly searches

```bash
npm run migrate:theme-tags    # Populate theme tags in catechism table
npm run verify:theme-tags     # Verify migration success
```

**Documentation:** See [THEMES.md](THEMES.md) for complete feature guide

**What it does:**
- Groups 2,865 CCC paragraphs into 25 thematic clusters
- Creates high-value SEO pages targeting specific theological topics
- Adds JSONB tags to catechism table for theme filtering
- Generates pages like `/catechismo/tema/trinita`, `/catechismo/tema/eucarestia`, etc.

### Cron Setup
```bash
npm run setup-cron             # Configure automated daily updates
```

## Database Architecture

**Schema Location:** [db/schema.ts](db/schema.ts)
**Database Config:** [db/db-config.ts](db/db-config.ts)

### Core Tables

- **saints** - Saints, beati, venerabili with `patronoDi` (JSON array), feast dates (MM-DD format), and slugs
- **prayers** - Prayers with categories, optional saint association, Latin text, metadata (keywords, whenToPray, benefits)
- **liturgy** - Daily liturgical readings with `diocesiId` (NULL = national calendar). Includes first reading, responsorial psalm, second reading (optional), gospel, liturgical color, season
- **dioceses** - 226 Italian dioceses with codes (e.g., "IT-RM", "IT-MI"), ecclesiastical regions
- **novenas** - Nine-day prayers linked to saints with `giorniTesti` (JSON array of daily texts)
- **catechism** - Catechism paragraphs 1-2865 with hierarchical structure (parte, sezione, capitolo, articolo). JSONB `tags` field contains theme slugs (e.g., ["trinita", "chiesa-cattolica"]) after theme migration
- **intentions** - Intent-based categories linking to suggested prayers, interceding saints, and catechism points
- **angels** - Archangels and angels with feast dates and biblical references
- **blessings** - Liturgical blessings by category and occasion

### Key Patterns

- **Slug-based routing:** All main entities use unique slugs for URLs
- **Date format:** Saint feast dates stored as "MM-DD" strings
- **Diocese-specific liturgy:** Unique constraint on (data, diocesiId) in liturgy table
- **JSONB fields:** Used for arrays (patronoDi, santiDelGiorno, intenzioni) and structured data (readings, novena texts)

## Architecture & Routing

**Rendering Strategy:** Astro hybrid mode (SSG + SSR)
**Output:** standalone (configured in [astro-config.js](astro-config.js))

### Page Types

- **SSR (Server-Side Rendered):** Most dynamic pages requiring database queries
  - [src/pages/index.astro](src/pages/index.astro) - Homepage with today's content
  - [src/pages/santi/\[slug\].astro](src/pages/santi/[slug].astro) - Individual saint pages
  - [src/pages/santi/patroni/\[causa\].astro](src/pages/santi/patroni/[causa].astro) - Patron saint searches
  - [src/pages/liturgia/diocesi/\[diocesi\]/\[data\].astro](src/pages/liturgia/diocesi/[diocesi]/[data].astro) - Diocese-specific liturgy
  - [src/pages/preghiere/\[slug\].astro](src/pages/preghiere/[slug].astro) - Prayer pages
  - [src/pages/novene/\[slug\].astro](src/pages/novene/[slug].astro) - Novena pages
  - [src/pages/rosario.astro](src/pages/rosario.astro) - Rosary with day-based mysteries
  - [src/pages/prego-per/\[intenzione\].astro](src/pages/prego-per/[intenzione].astro) - Intent-based pages

- **Pre-rendered:** Static content like catechism paragraphs
  - [src/pages/catechismo/\[numero\].astro](src/pages/catechismo/[numero].astro) - Catechism paragraphs
  - [src/pages/catechismo/temi.astro](src/pages/catechismo/temi.astro) - Catechism themes index (NEW)
  - [src/pages/catechismo/tema/\[tema\].astro](src/pages/catechismo/tema/[tema].astro) - Dynamic theme pages (NEW)

### External API Integration

**LitCal API Integration:** [src/lib/litcal.ts](src/lib/litcal.ts)
- Fetches national and diocesan liturgical calendars
- Supports all 226 Italian dioceses via diocese codes (e.g., "IT-RM")
- Maps liturgical colors: green/verde, red/rosso, white/bianco, violet/viola, rose/rosa
- Functions: `fetchNationalCalendar(year)`, `fetchDiocesanCalendar(diocesiCode, year)`, `fetchDayLiturgy(date)`, `fetchEaster(year)`

**Alternative API:** [src/lib/liturgy-api.ts](src/lib/liturgy-api.ts)
- Fallback integration with calapi.inadiutorium.cz
- Used by [scripts/update-liturgy.js](scripts/update-liturgy.js) for automated updates

### Cron Jobs & Automation

The [scripts/setup-cron.sh](scripts/setup-cron.sh) configures automated tasks:
- Daily liturgy updates at 00:01
- Weekly database backups on Sundays at 03:00
- Daily Pagina Sacra generation at 06:00

**Manual cron entry format:**
```bash
1 0 * * * cd /path/to/verbum-lucis && docker-compose exec app npm run update-liturgy
0 3 * * 0 cd /path/to/verbum-lucis && npm run db:backup
```

## Docker Development

**Docker Compose services:**
- `postgres` - PostgreSQL 16 Alpine on port 5432 (container: `verbum-lucis-db`)
- `app` - Node.js Astro app on port 4321 (container: `verbum-lucis-app`)

**Environment variables** (see [.env.example](.env.example)):
```bash
DATABASE_URL=postgresql://verbum_user:password@postgres:5432/verbum_lucis
DB_PASSWORD=changeme123
SITE_URL=https://verbumlucis.it
```

**Common Docker commands:**
```bash
docker-compose up -d              # Start services in background
docker-compose logs -f app        # Follow app logs
docker-compose exec app npm run db:push   # Run migrations inside container
docker-compose exec app npm run db:seed   # Seed data inside container
docker-compose down               # Stop all services
docker-compose restart app        # Restart app only
```

## Data Sources & Scripts

### Saints Data
- **Source:** Web scraping via [scripts/scrape-saints.js](scripts/scrape-saints.js)
- **Sync:** [scripts/sync-saints.js](scripts/sync-saints.js) matches saints with liturgical calendar

### Liturgy Data
- **Update script:** [scripts/update-liturgy.js](scripts/update-liturgy.js)
- Fetches from LitCal API and stores in `liturgy` table
- Accepts `--all` flag to update multiple days and `--days N` to specify range

### Static Data Files
- [data/diocesi.json](data/diocesi.json) - Italian dioceses
- [data/prayers-expanded.json](data/prayers-expanded.json) - Prayer database
- [data/saints-aggregated.json](data/saints-aggregated.json) - Aggregated saints
- [data/intenzioni.json](data/intenzioni.json) - Intent categories

## Component Structure

**React Components:** [src/components/](src/components/)
- `SaintCard.tsx` - Saint display card
- `PrayerCard.tsx` - Prayer display card
- `LiturgyBadge.tsx` - Liturgical color badge
- `SearchBar.tsx` - Global search component
- `ui/` - shadcn/ui components (button, card, etc.)

**Layout:** [src/layouts/BaseLayout.astro](src/layouts/BaseLayout.astro)

## Admin Interface

Admin pages for content management (basic CRUD):
- [src/pages/admin/index.astro](src/pages/admin/index.astro) - Admin dashboard
- [src/pages/admin/santi/nuovo.astro](src/pages/admin/santi/nuovo.astro) - Add new saints

Note: Admin panel is excluded from sitemap (see [astro-config.js](astro-config.js:19))

## SEO & Performance

- **Sitemap:** Auto-generated via `@astrojs/sitemap` (changefreq: daily, excludes /admin)
- **Site URL:** https://verbumlucis.it
- **Meta tags:** Handled in BaseLayout.astro
- **Schema.org:** Structured data for saints (Person), prayers (CreativeWork), liturgical events (Event)

## Testing Locally

1. Start PostgreSQL: `docker-compose up -d postgres`
2. Wait for health check: `docker-compose ps` (should show "healthy")
3. Run migrations: `docker-compose exec app npm run db:push` (or locally: `npm run db:push`)
4. Seed database: `docker-compose exec app npm run db:seed`
5. Start dev server: `npm run dev`
6. Visit: http://localhost:4321

## Key Files Reference

- Database schema: [db/schema.ts](db/schema.ts)
- Database utilities: [db/db-config.ts](db/db-config.ts)
- Astro config: [astro-config.js](astro-config.js)
- Docker setup: [docker-compose.yml](docker-compose.yml)
- Tailwind config: [tailwind.config.mjs](tailwind.config.mjs)
- LitCal integration: [src/lib/litcal.ts](src/lib/litcal.ts)
- Liturgy API: [src/lib/liturgy-api.ts](src/lib/liturgy-api.ts)
- Seed script: [scripts/seed.js](scripts/seed.js)
- Deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- Technical documentation: [TECHNICAL DOC.md](TECHNICAL DOC.md)
