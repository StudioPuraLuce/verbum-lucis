# PHASE 3: VPS Infrastructure Rebuild Plan

**Date:** 2026-02-07
**Status:** Planning Phase
**Target:** Permanent, resilient infrastructure for pSEO programmatic generation
**VPS:** vps.eternalservices.ca

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Verbum Lucis Stack (VPS)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐         ┌──────────────────┐             │
│  │   PostgreSQL 16  │◄──────►  │  ClickHouse 24   │             │
│  │  (OLTP/Primary)  │         │ (OLAP/Analytics) │             │
│  └──────────────────┘         └──────────────────┘             │
│         ▲                                                       │
│         │ SQL Sync                                             │
│         │                                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      n8n Workflows                        │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────┐  │  │
│  │  │ Daily Theosis  │  │  Weekly Maestro│  │   Backup   │  │  │
│  │  │  Page Gen      │  │   Content      │  │ Automation │  │  │
│  │  └────────────────┘  └────────────────┘  └────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│         ▲              ▲               ▲                        │
│         │              │               │                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │  Directus    │ │  Claude API  │ │  Astro Build │            │
│  │  (CMS/Data)  │ │  (AI Content)│ │ (Site Gen)   │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│         ▲                                                       │
│         └─────────────────┬─────────────────────────────────┐  │
│                           │                                 │  │
│            ┌──────────────┴──────────────┐                  │  │
│            │                             │                  │  │
│     ┌──────────────┐             ┌──────────────┐           │  │
│     │  Postiz      │             │ Chatwoot     │           │  │
│     │ (Social Dist)│             │ (Lead Capture)           │  │
│     └──────────────┘             └──────────────┘           │  │
│            ▲                             ▲                  │  │
│            └─────────────┬───────────────┘                  │  │
│                          │                                  │  │
│     ┌────────────────────────────────────────────────────┐  │  │
│     │        Monitoring & Analytics                      │  │  │
│     │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │  │  │
│     │  │Metabase  │  │Prometheus│  │Uptime Kuma          │  │  │
│     │  │(BI)      │  │(Metrics) │  │(Health) │           │  │  │
│     │  └──────────┘  └──────────┘  └──────────┘          │  │  │
│     └────────────────────────────────────────────────────┘  │  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Data Flow: PostgreSQL (Source) → n8n (Orchestration) → Claude API (Generation)
                                              ↓
                                  Astro Build (Site Generation)
                                              ↓
                            Published to verbumlucis.it (Cloudflare)
```

---

## 🛠️ Component Specifications

### Core Databases

#### 1. PostgreSQL 16 (OLTP/Operational)
**Purpose:** Primary database for application data (transactional)
**Configuration:**
```yaml
Image: postgres:16-alpine
Port: 5432
Database: verbum_lucis
User: verbum_user
Password: ${DB_PASSWORD}
Resources:
  Memory: 2GB
  CPU: 1 core
  Storage: 50GB
Health Check: Every 30s
```
**Persistence:** Docker volume `postgres-data` (mapped to `/var/lib/postgresql/data`)

#### 2. ClickHouse 24 (OLAP/Analytics)
**Purpose:** Analytics data warehouse for SEO metrics, traffic patterns, user behavior
**Configuration:**
```yaml
Image: clickhouse/clickhouse-server:24-alpine
Port: 8123 (HTTP), 9000 (Native)
Database: verbum_lucis_analytics
Resources:
  Memory: 1GB
  CPU: 1 core
  Storage: 20GB
Health Check: HTTP GET /ping on port 8123
```
**Data Sync:** Nightly snapshot from PostgreSQL to ClickHouse

---

### Workflow Orchestration

#### 3. n8n (Automation & Content Generation)
**Purpose:** Orchestrate daily workflows for content generation, social distribution, backups
**Configuration:**
```yaml
Image: n8nio/n8n:latest
Port: 5678
Database: PostgreSQL (built-in n8n database)
Resources:
  Memory: 512MB
  CPU: 0.5 core
Workflows:
  1. Daily Theosis "Pagina Sacra" generation (06:00 UTC)
  2. Weekly Maestro Interiore coaching pages (Monday 09:00 UTC)
  3. Automated social distribution (10:00 UTC)
  4. Weekly database backup to Cloudflare R2 (Sunday 03:00 UTC)
  5. Daily liturgy update (00:01 UTC)
```

**Key Workflows to Create:**

**Workflow A: Daily Theosis Generator**
```
Trigger: Cron - Daily 06:00 UTC
├─ Load Today's Liturgical Data
├─ Call Claude API with Theosis prompt
│  ├─ Input: Lectionary + Saints data
│  ├─ System Prompt: Theosis framework (from old_material/AI Custom Prompts.md)
│  └─ Output: JSON with Pagina Sacra + Analisi Strategica
├─ Parse Response
├─ Store in PostgreSQL liturgy table
├─ Generate Astro route
└─ Trigger Website Rebuild
Result: +1 new page daily = +365 pages/year
```

**Workflow B: Weekly Maestro Interiore Coach**
```
Trigger: Cron - Weekly Monday 09:00 UTC
├─ Select Weekly Theme (from catechism themes)
├─ Call Claude API with Maestro Interiore prompt
│  ├─ Input: Spiritual challenge/theme
│  ├─ System Prompt: Maestro Interiore framework
│  └─ Output: JSON with 5-part response
├─ Create "Coaching Guide" page
├─ Store metadata
└─ Schedule Social Distribution
Result: +4 pages/month = +52 pages/year
```

**Workflow C: Social Distribution (Postiz)**
```
Trigger: Daily 10:00 UTC after content generation
├─ Fetch newly published content
├─ Generate social media snippets
├─ Create image cards (if applicable)
├─ Post to:
│  ├─ Instagram Stories
│  ├─ TikTok
│  ├─ Facebook Feed
│  ├─ LinkedIn
│  └─ Twitter/X
├─ Track engagement metrics
└─ Log to Chatwoot (for lead capture)
```

**Workflow D: Backup to Cloudflare R2**
```
Trigger: Cron - Weekly Sunday 03:00 UTC
├─ Execute pg_dump (full backup)
├─ Compress with gzip
├─ Create S3 metadata
├─ Upload to Cloudflare R2
│  ├─ Bucket: verbum-lucis-backups
│  ├─ Path: backups/full/verbum-lucis-{date}.sql.gz
│  └─ Retention: 30 days
├─ Verify upload integrity
└─ Log to Uptime Kuma
Result: Automated weekly backups, no manual intervention
```

---

### Content Management & CMS

#### 4. Directus (Headless CMS)
**Purpose:** Content management interface for saints, prayers, intentions data
**Configuration:**
```yaml
Image: directus/directus:latest
Port: 8055
Database: PostgreSQL (separate schema)
Authentication: JWT tokens
Admin Panel: https://vps.eternalservices.ca/admin
Resources:
  Memory: 512MB
  CPU: 0.5 core
```

**Collections to Manage:**
- Saints (add/edit descriptions, patron categories)
- Prayers (add new prayers, metadata)
- Intentions (define spiritual intention categories)
- Novenas (create 9-day prayer sequences)
- Themes (manage catechism themes)

---

### Distribution & Marketing

#### 5. Postiz (Social Media Distribution)
**Purpose:** Automated posting to social networks
**Configuration:**
```yaml
Image: postiz/postiz:latest (self-hosted option)
Port: 3000
Database: PostgreSQL
Connected Platforms:
  - Instagram (accounts)
  - TikTok (accounts)
  - Facebook (pages)
  - LinkedIn (profile)
  - Twitter/X (accounts)
Scheduling: Managed by n8n workflows
Queue: Posts every 2-6 hours (configurable)
```

#### 6. Chatwoot (Lead Capture & CRM)
**Purpose:** Capture leads from website, manage conversation with visitors
**Configuration:**
```yaml
Image: chatwoot/chatwoot:latest
Port: 3000
Database: PostgreSQL
Website Widget: Embedded on verbumlucis.it
Lead Fields:
  - Name
  - Email
  - Phone
  - Spiritual Interest (dropdown)
  - Diocese
Automation:
  - Auto-respond with welcome message
  - Qualify leads by intent
  - Route to human agent (if enabled)
```

---

### Analytics & Monitoring

#### 7. Metabase (Business Intelligence)
**Purpose:** Analytics dashboards for SEO performance, traffic patterns, engagement
**Configuration:**
```yaml
Image: metabase/metabase:latest
Port: 3000
Database: PostgreSQL (queries) + ClickHouse (analytics)
Dashboards to Create:
  1. SEO Dashboard
     - Rankings by keyword
     - Traffic by source
     - Conversion rate by intention
  2. Content Performance
     - Most viewed pages
     - Most shared on social
     - Engagement metrics
  3. User Behavior
     - Time on site
     - Bounce rate
     - Prayer/saint search patterns
  4. Business Metrics
     - Lead generation
     - Ad spend vs ROI (if monetized)
     - Email subscriber growth
```

#### 8. Prometheus (Metrics Collection)
**Purpose:** Collect system and application metrics
**Configuration:**
```yaml
Image: prom/prometheus:latest
Port: 9090
Scrape Targets:
  - Docker Daemon
  - n8n
  - Directus
  - PostgreSQL (exporter)
  - ClickHouse (exporter)
  - Postiz
  - Chatwoot
Retention: 15 days
```

#### 9. Uptime Kuma (Health Monitoring)
**Purpose:** Monitor service availability and alert on downtime
**Configuration:**
```yaml
Image: louislam/uptime-kuma:latest
Port: 3001
Monitors:
  - PostgreSQL (health check)
  - n8n (API endpoint)
  - Directus (admin panel)
  - Website (homepage)
  - Cloudflare R2 (backup upload verification)
Alerts:
  - Email notification on failure
  - Slack webhook (if configured)
  - Status page: https://vps.eternalservices.ca/status
```

---

### Reverse Proxy & SSL

#### 10. Traefik (Reverse Proxy)
**Purpose:** Route traffic to services, manage SSL/TLS, handle subdomains
**Configuration:**
```yaml
Image: traefik:latest
Port: 80, 443
SSL: Let's Encrypt (auto-renewal)
Routes:
  https://vps.eternalservices.ca/admin       → Directus
  https://vps.eternalservices.ca/n8n         → n8n
  https://vps.eternalservices.ca/metabase    → Metabase
  https://vps.eternalservices.ca/chatwoot    → Chatwoot
  https://vps.eternalservices.ca/uptime      → Uptime Kuma
  https://vps.eternalservices.ca/prom        → Prometheus
  https://verbumlucis.it                      → Astro App (Cloudflare)
```

---

## 📋 Deployment Checklist

### Phase 3A: Database Setup (Week 1)
- [ ] Create PostgreSQL 16 container with proper backup configuration
- [ ] Create ClickHouse 24 container
- [ ] Setup volume mounts for data persistence
- [ ] Configure PostgreSQL replication for backup (optional)
- [ ] Setup ClickHouse → PostgreSQL sync job

### Phase 3B: Core Services (Week 1-2)
- [ ] Deploy n8n with OAuth2 security
- [ ] Deploy Directus connected to PostgreSQL
- [ ] Deploy Traefik for reverse proxy + SSL
- [ ] Setup DNS records for subdomains
- [ ] Test all service connectivity

### Phase 3C: Distribution & Marketing (Week 2)
- [ ] Deploy Postiz with social accounts configured
- [ ] Deploy Chatwoot with website widget
- [ ] Configure n8n workflows for social distribution
- [ ] Setup lead capture webhooks

### Phase 3D: Analytics & Monitoring (Week 2-3)
- [ ] Deploy Metabase
- [ ] Deploy Prometheus
- [ ] Deploy Uptime Kuma
- [ ] Create initial dashboards
- [ ] Setup alerting rules

### Phase 3E: Automation (Week 3)
- [ ] Create n8n workflows:
  - [ ] Daily Theosis generator
  - [ ] Weekly Maestro Interiore coach
  - [ ] Social distribution pipeline
  - [ ] Backup automation
- [ ] Test each workflow end-to-end
- [ ] Setup failure alerts

### Phase 3F: Backup Strategy (Week 3)
- [ ] Configure PostgreSQL backups
- [ ] Setup Cloudflare R2 integration
- [ ] Create backup verification workflow
- [ ] Document restore procedures
- [ ] Test backup restore (dry run)

---

## 🐳 Docker Compose Configuration

**Location:** `docker-compose.yml` (updated)

**Services:**
```yaml
version: '3.9'
services:
  # Databases
  postgres:
    image: postgres:16-alpine
    # ... configuration
  clickhouse:
    image: clickhouse/clickhouse-server:24-alpine
    # ... configuration

  # Core Services
  traefik:
    image: traefik:latest
    # ... configuration
  n8n:
    image: n8nio/n8n:latest
    # ... configuration
  directus:
    image: directus/directus:latest
    # ... configuration

  # Distribution
  postiz:
    image: postiz/postiz:latest
    # ... configuration
  chatwoot:
    image: chatwoot/chatwoot:latest
    # ... configuration

  # Analytics
  metabase:
    image: metabase/metabase:latest
    # ... configuration
  prometheus:
    image: prom/prometheus:latest
    # ... configuration
  uptime-kuma:
    image: louislam/uptime-kuma:latest
    # ... configuration

networks:
  dokploy-network:
    external: true

volumes:
  postgres-data:
  clickhouse-data:
  n8n-data:
  directus-data:
```

---

## 🔐 Security Considerations

1. **Database Passwords:**
   - Generated and stored in `.env` (not in repo)
   - Rotated quarterly
   - Never exposed in logs

2. **API Keys:**
   - Claude API key (env variable)
   - Cloudflare R2 credentials (env variable)
   - Social media tokens (managed by Postiz)

3. **SSL/TLS:**
   - Let's Encrypt certificates (auto-renewal via Traefik)
   - HSTS enabled
   - Certificate pinning optional

4. **Network Security:**
   - Services on internal Docker network (not exposed to host)
   - Only Traefik on ports 80/443
   - Firewall rules on VPS host

5. **Backup Security:**
   - Backups encrypted during transit (HTTPS to R2)
   - Optional: Encrypt backups with GPG before upload
   - Separate access key for R2 (read-only for restore)

---

## 📊 Capacity Planning

### Current Estimated Usage
```
PostgreSQL:
  Data Size: ~5-10 MB (grows 1-2 MB/month)
  Connections: 5-10 concurrent
  Backup Size: ~2.5 MB (compressed)

ClickHouse:
  Data Size: ~20-50 MB (grows 5-10 MB/month)
  Metrics/Events: ~1M/month

n8n:
  Executions: ~1,500/month (50/day)
  Disk Usage: ~1 GB (execution logs)
  Memory Peak: 512 MB

Metabase:
  Queries: ~100/month
  Reports: ~5 active dashboards
```

### Growth Projections (12 months)
```
PostgreSQL: 15-25 MB (manageable)
ClickHouse: 80-200 MB (manageable)
Disk Total: 100 GB allocated (plenty of headroom)
Memory: 4 GB allocated (sufficient)
CPU: 2-4 cores (good for burst)
```

---

## ⏱️ Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| 3A: Database Setup | 3-4 days | PostgreSQL + ClickHouse running |
| 3B: Core Services | 4-5 days | n8n + Directus + Traefik live |
| 3C: Distribution | 2-3 days | Postiz + Chatwoot configured |
| 3D: Analytics | 3-4 days | Dashboards operational |
| 3E: Automation | 5-7 days | All workflows tested & running |
| 3F: Backup & Verification | 2-3 days | Backup pipeline active |
| **Total** | **3-4 weeks** | **Full stack operational** |

---

## 💰 Cost Analysis

**VPS Hosting:** vps.eternalservices.ca (assumed $20-30/month)
**Cloudflare R2:** ~$0.015/GB/month (backups minimal cost)
**Claude API:** Usage-based (~$50-100/month at current scale)
**Total Monthly:** ~$70-150 (depending on content generation volume)

---

## ✅ Success Criteria

- [ ] All 10 services running and healthy
- [ ] Database replication working (PostgreSQL → ClickHouse)
- [ ] n8n workflows executing on schedule
- [ ] Automated backups completing successfully
- [ ] Metabase dashboards showing real-time data
- [ ] Zero manual intervention required for daily operations
- [ ] 99.5% uptime for critical services

---

**Next Step:** Await approval to proceed with Phase 3A deployment
**Estimated Start:** 2026-02-08
**Expected Completion:** 2026-03-08
