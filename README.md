# ✨ Verbum Lucis

**Il portale spirituale cattolico italiano con 100.000+ pagine programmatiche SEO-ottimizzate.**

Un ecosistema completo per liturgia quotidiana, santi, preghiere, novene, catechismo e contenuti spirituali. Costruito con **Astro 5**, **PostgreSQL 16**, **React 18** e **Tailwind CSS**.

## 🎯 Obiettivo

Generare il portale spirituale cattolico italiano più completo e tecnicamente avanzato, coprendo:
- ✅ **Liturgia diocesana** per tutte le 226 diocesi italiane (36.500+ pagine/anno)
- ✅ **Catechismo della Chiesa Cattolica** (2.865 punti searchable)
- ✅ **Santi e patronati** (10.000+ pagine)
- ✅ **Preghiere, novene, benedizioni** (5.000+ pagine)
- ✅ **Intent-based pages** (/prego-per/...) per ricerche naturali
- ✅ **Struttura SEO programmatica** con schema.org completo

## 🚀 Quick Start

### Con Docker (CONSIGLIATO)

```bash
# Clone e setup
git clone https://github.com/soliwalker/verbum-lucis.git
cd verbum-lucis
cp .env.example .env

# Start
docker-compose up -d

# Init database
docker-compose exec app npm run db:push
docker-compose exec app npm run db:seed

# Visita http://localhost:4321
```

### Locale (Senza Docker)

```bash
npm install

# Configura PostgreSQL e DATABASE_URL in .env
npm run db:push
npm run db:seed

npm run dev
```

## 📊 Stack Tecnologico

| Layer | Tecnologia | Versione |
|-------|-----------|----------|
| **Frontend** | Astro | 5.17.1 |
| **UI** | React + shadcn/ui | 18.2 |
| **Styling** | Tailwind CSS | 3.4 |
| **Database** | PostgreSQL + Drizzle ORM | 16 + 0.29.3 |
| **Runtime** | Node.js Alpine | 20 LTS |
| **Deployment** | Docker Compose + Traefik | latest |
| **SSL** | Let's Encrypt | Automatic |

## 🏗️ Architettura

```
┌─────────────────────────────────────┐
│     Browser (HTTPS)                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Traefik (Reverse Proxy + SSL)       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Astro SSR (Node.js)                │
│   - Programmatic pages               │
│   - Dynamic routes                   │
│   - API routes                       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   PostgreSQL 16                      │
│   - saints, prayers, liturgy         │
│   - dioceses, catechism              │
│   - intentions, angels, blessings    │
└─────────────────────────────────────┘
```

## 📁 Struttura Progetto

```
verbum-lucis/
├── src/
│   ├── pages/              # Route Astro (SSR/SSG)
│   │   ├── index.astro     # Homepage
│   │   ├── santi/          # Saint pages
│   │   ├── liturgia/       # Liturgy pages (national + diocesan)
│   │   ├── preghiere/      # Prayer pages
│   │   ├── catechismo/     # Catechism pages
│   │   ├── prego-per/      # Intent-based pages
│   │   └── admin/          # Admin panel
│   ├── components/         # React components
│   ├── layouts/            # Astro layouts
│   ├── lib/                # Utilities & API integrations
│   └── db.ts              # Database config
├── db/
│   └── schema.ts          # Drizzle ORM schema
├── scripts/
│   ├── import-*.js        # Data import scripts
│   ├── update-liturgy.js  # Daily cron job
│   └── seed.js            # Initial data
├── data/
│   ├── diocesi.json       # 226 Italian dioceses
│   ├── catechismo-it.json # 2865 catechism paragraphs
│   └── prayers-*.json     # Prayer collections
├── .github/workflows/     # GitHub Actions
│   ├── build-test.yml     # Build & test
│   ├── deploy.yml         # Auto-deploy to VPS
│   └── backup.yml         # Weekly DB backup
├── docker-compose.yml     # Production stack
└── Dockerfile             # Multi-stage build
```

## 📦 Database Schema

### Tabelle Principali

- **saints** - Santi, beati, venerabili (10.000+)
- **prayers** - Preghiere categorizzate (5.000+)
- **liturgy** - Letture giornaliere per diocesi (365+ giorni)
- **dioceses** - 226 diocesi italiane con codici LitCal
- **catechism** - 2.865 punti del Catechismo della Chiesa
- **novenas** - Novene ai santi (200+)
- **intentions** - Categorie di intenzioni di preghiera (15+)
- **angels** - Arcangeli e angeli
- **blessings** - Benedizioni per occasione

## 🔄 CI/CD Pipeline

GitHub Actions automatizza build, test e deploy:

### Build & Test (on push)
```
Push → GitHub Actions → npm ci → npm build → ✅
```

### Deploy (on main)
```
Merge → Build succeeds → SSH to VPS → docker-compose up → Health check → ✅
```

### Backup (weekly)
```
Sunday 03:00 → pg_dump → compress → rotate → ✅
```

### Restore da Backup
```bash
# Download from Release
wget https://github.com/soliwalker/verbum-lucis/releases/download/v1.0.0/restore-point-v1.0.0.sql.gz

# Restore
gunzip restore-point-v1.0.0.sql.gz
docker exec -i verbum-lucis-db psql -U verbum_user -d verbum_lucis < restore-point-v1.0.0.sql
```

## 📊 Data Aggregation

Importa dati da multiple fonti:

```bash
# From Google Sheets
npm run import:sheets

# From CSV files
npm run import:csv -- ./data/prayers.csv

# From Airtable
npm run import:airtable

# All at once
npm run import:external
```

Vedi [scripts/import-*.js](scripts/) per i template generici e istruzioni di customizzazione.

## 🛠️ Development

### Comandi Disponibili

```bash
# Development
npm run dev                 # Start dev server (http://localhost:4321)

# Building
npm run build              # Production build
npm run preview            # Preview build locally

# Database
npm run db:generate        # Generate migrations from schema
npm run db:push            # Apply migrations to DB
npm run db:seed            # Populate sample data

# Data Import
npm run import:dioceses    # Import dioceses
npm run import:saints      # Import saints
npm run import:prayers     # Import prayers
npm run import:catechism   # Import catechism
npm run import:intentions  # Import intentions
npm run import:all         # All imports

# Automation
npm run update-liturgy     # Update today's liturgy
npm run update-liturgy:all # Update next 7 days
npm run sync-saints        # Sync saints with calendar

# MCP (Model Context Protocol) - Popola 82,490 diocesan pages
npm run populate:dioceses  # Populate liturgy for all 226 dioceses (requires MCP enabled)
```

### MCP Liturgical Calendar Integration

Abilita il **Model Context Protocol** per accesso diretto ai dati liturgici:

- 📖 **Direct API access:** No HTTP requests, built-in caching
- 🎯 **226 diocesi:** Genera automaticamente 82,490 pagine/anno
- ⚡ **Cached:** 24h metadata, 168h calendar data
- 🏛️ **Particular celebrations:** Auto-detects diocesan patrons, local saints

**Setup:**
1. Il MCP server è configurato in VS Code: `~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
2. Importa diocesi: `npm run import:dioceses`
3. Popola: `npm run populate:dioceses`

Vedi [CLAUDE.md](CLAUDE.md) per dettagli tecnici e tool MCP disponibili.

## 🌐 Deployment

### Production (VPS)

**VPS Details:**
- Host: `158.69.219.187` (Debian 13, 6 CPU, 11GB RAM)
- Domain: `https://verbumlucis.it`
- SSL: Let's Encrypt via Traefik

**Manual Deploy:**
```bash
git push origin main       # Triggers GitHub Actions
                           # → Builds → Deploys to VPS → Health check
```

**Manual SSH Deploy (if needed):**
```bash
ssh debian@158.69.219.187
cd /opt/verbum-lucis
git pull origin main
docker-compose build
docker-compose up -d
docker-compose exec app npm run db:push
```

**Cron Jobs (on VPS):**
- Daily: `00:01` - Update liturgy (`npm run update-liturgy`)
- Weekly: `Sunday 03:00` - Database backup

## 📈 SEO & Performance

### Programmatic Pages
- National + diocesan liturgy: **82,490/year**
- Catechism points + themes: **3,065**
- Intent-based pages: **200+**
- Saints + patrons: **10,000+**
- **Total target: 100,000+ pages**

### SEO Features
- ✅ Auto-generated sitemap (`@astrojs/sitemap`)
- ✅ Schema.org structured data (Person, Article, Event)
- ✅ Meta tags & Open Graph on all pages
- ✅ Canonical URLs
- ✅ Mobile-first responsive design
- ✅ Core Web Vitals optimized

### Performance
- Server-side rendering (SSR) where needed
- Static generation (SSG) for catechism
- Lazy loading for images
- Font preconnect optimization
- **Target: LCP < 2.5s, FID < 100ms, CLS < 0.1**

## 🔐 Security

- ✅ Environment variables in `.env` (never committed)
- ✅ Secure database password (generated + rotated)
- ✅ Let's Encrypt HTTPS with auto-renewal
- ✅ Docker container isolation
- ✅ GitHub Actions secrets for deployment
- ✅ SSH key-based VPS access

**Admin Panel:** Currently without auth (TODO: add before public launch)

## 📚 Documentazione Completa

- **[CLAUDE.md](CLAUDE.md)** - Guida per Claude Code e sviluppatori AI
- **[TECHNICAL DOC.md](TECHNICAL%20DOC.md)** - Architettura dettagliata + API
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guida deploy passo-passo
- **[competitive-strategy.md](competitive-strategy.md)** - Strategia SEO + vantaggi competitivi

## 🤝 Contribuire

1. Fork il repository
2. Crea un feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Open una Pull Request

## 📞 Supporto

- 🐛 Bug reports: GitHub Issues
- 💬 Discussioni: GitHub Discussions
- 📧 Email: info@verbumlucis.it

## 📜 Licenza

Questo progetto è costruito per rispettare i diritti d'autore dei testi liturgici ufficiali della CEI.

La Bibbia CEI 2008 usata via [BibleGet.io](https://bibleget.io) è fornita con licenza appropriata per uso non-commerciale.

---

**Costruito con ❤️ per la comunità cattolica italiana**

🌐 **[https://verbumlucis.it](https://verbumlucis.it)**
📊 **[GitHub Repository](https://github.com/soliwalker/verbum-lucis)**
🚀 **[Latest Release](https://github.com/soliwalker/verbum-lucis/releases)**
