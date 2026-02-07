# Verbum Lucis

Portale spirituale cattolico italiano con contenuti pSEO programmatici.

**Live:** https://verbumlucis.it

## Stack

- **Framework:** Astro 4.3 (SSR/SSG hybrid)
- **UI:** React 18 + Tailwind CSS 3.4
- **Database:** PostgreSQL 16 + Drizzle ORM
- **Deploy:** Docker + Dokploy

## Dev

```bash
npm install
npm run dev          # http://localhost:4321
npm run build
```

## Database

```bash
npm run db:push      # Push schema to PostgreSQL
npm run db:seed      # Seed initial data
npm run import:all   # Import all data (dioceses, saints, prayers, etc.)
```

## Docker

```bash
docker-compose up -d
docker-compose logs -f app
```

## Data

- 35,422 Bible verses (CEI 2008)
- 2,865 Catechism paragraphs + 25 themes
- 226 Italian dioceses
- Saints, prayers, novenas, intentions
