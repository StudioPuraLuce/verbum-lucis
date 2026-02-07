# Dokploy Deployment for Verbum Lucis

Complete documentation and automation for deploying the Verbum Lucis Astro + PostgreSQL application to Dokploy.

---

## What is Dokploy?

Dokploy is a **free, self-hosted Platform-as-a-Service (PaaS)** that simplifies application and database deployment. It's an open-source alternative to Heroku, Vercel, and Netlify.

**Key Benefits for Verbum Lucis:**
- Single-click Docker Compose deployment
- Automatic HTTPS with Let's Encrypt
- Real-time monitoring and logs
- Database backups and restoration
- Cron job scheduling
- Load balancing via Traefik
- No vendor lock-in (self-hosted on your VPS)

---

## Project Configuration

**Application:** Verbum Lucis
- **Framework:** Astro 4.3 with React 18.2
- **Database:** PostgreSQL 16 Alpine
- **Runtime:** Node.js 20 LTS
- **Port:** 4321
- **Domain:** verbumlucis.it
- **Deployment:** Docker Compose

---

## Documentation Structure

### 1. **DOKPLOY-QUICK-START.md** (Start here!)
Fastest way to get Verbum Lucis running on Dokploy.

**Perfect for:**
- First-time deployment
- Quick reference
- Common commands
- Troubleshooting quick fixes

**Read time:** 10 minutes

### 2. **DOKPLOY-SETUP.md** (Comprehensive guide)
Complete step-by-step deployment guide with all details.

**Covers:**
- Dokploy fundamentals
- Web panel setup (Part 2)
- API-based setup (Part 3)
- Post-deployment configuration
- Monitoring and maintenance
- Security best practices
- Performance optimization
- Scaling strategies

**Read time:** 30-45 minutes

### 3. **DOKPLOY-API-REFERENCE.md** (API documentation)
Complete Dokploy API endpoint reference.

**Contains:**
- Authentication details
- All API endpoints
- Request/response examples
- Common workflows
- Error handling
- Rate limiting information

**For:** Developers using API automation

### 4. **scripts/dokploy-deploy.sh** (Automated deployment)
Bash script that automates the entire deployment process via API.

**Does:**
- Creates Dokploy project
- Adds Docker Compose service
- Sets environment variables
- Initiates deployment
- Saves configuration

**Usage:**
```bash
bash scripts/dokploy-deploy.sh
```

### 5. **scripts/dokploy-init.sh** (Database initialization)
Bash script that initializes the database after deployment.

**Does:**
- Runs database migrations
- Seeds initial data
- Imports dioceses, prayers, catechism
- Configures cron jobs
- Verifies deployment

**Usage:**
```bash
bash scripts/dokploy-init.sh
```

---

## Quick Start (5 Minutes)

### Option A: Using Dokploy Web Panel

1. **Access Dokploy:** `http://your-vps-ip:3000`
2. **Create Project:** Name it "Verbum Lucis"
3. **Add Docker Compose:** Upload `docker-compose.yml`
4. **Set Environment:**
   - `DB_PASSWORD`: secure_password_here
   - `SITE_URL`: https://verbumlucis.it
   - `NODE_ENV`: production
5. **Deploy:** Click "Deploy Now"
6. **Initialize:** Run `bash scripts/dokploy-init.sh`

### Option B: Using Automation Script

```bash
# Set API key
export DOKPLOY_API_KEY="IZrOXWFMbypiYRCQYImeFZFAfLWCjevvVpIdymbmZPsLDWqofeoPyCTcdzBVUObW"

# Deploy
bash scripts/dokploy-deploy.sh

# Initialize database
bash scripts/dokploy-init.sh

# Verify
curl https://verbumlucis.it
```

---

## File Reference

### Documentation
```
DOKPLOY-README.md              ← This file
DOKPLOY-QUICK-START.md         ← Fast track guide
DOKPLOY-SETUP.md               ← Comprehensive guide
DOKPLOY-API-REFERENCE.md       ← API documentation
```

### Scripts
```
scripts/dokploy-deploy.sh      ← Automated deployment
scripts/dokploy-init.sh        ← Database initialization
```

### Configuration
```
docker-compose.yml             ← Docker Compose configuration
Dockerfile                     ← Container build instructions
.env.example                   ← Environment template
```

---

## Key Information

### API Key
```
IZrOXWFMbypiYRCQYImeFZFAfLWCjevvVpIdymbmZPsLDWqofeoPyCTcdzBVUObW
```

### Domain
```
verbumlucis.it
```

### Dokploy Access
```
http://your-vps-ip:3000
```

### App Port
```
4321
```

### Database
```
postgres:16-alpine
User: verbum_user
Database: verbum_lucis
```

---

## Deployment Methods

### Method 1: Web Panel (Recommended for First Deploy)
- **Easiest:** Simple UI-based workflow
- **Best for:** First deployments, quick iteration
- **Steps:** See DOKPLOY-QUICK-START.md Part 1

### Method 2: Automation Script (Recommended for Production)
- **Fastest:** Automated via API
- **Best for:** Production deployments, CI/CD
- **Steps:** See DOKPLOY-QUICK-START.md Part 2

### Method 3: Manual API Calls
- **Most control:** Direct API integration
- **Best for:** Custom integrations, advanced workflows
- **Reference:** DOKPLOY-API-REFERENCE.md

---

## Deployment Workflow

```
┌─────────────────────────────┐
│ 1. Create Project           │ (Web Panel or API)
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 2. Add Docker Compose       │ (Upload docker-compose.yml)
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 3. Set Environment          │ (DB_PASSWORD, SITE_URL, NODE_ENV)
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 4. Deploy                   │ (Click Deploy or API call)
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 5. Initialize Database      │ (Run dokploy-init.sh)
│    - Migrations             │
│    - Seed data              │
│    - Import dioceses/saints │
│    - Setup cron             │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 6. Verify & Monitor         │ (Check logs, test app)
└─────────────────────────────┘
```

---

## Architecture

```
┌──────────────────────────────────────────┐
│         Dokploy Instance (Port 3000)     │
│  ┌────────────────────────────────────┐  │
│  │   Traefik (Reverse Proxy)          │  │
│  │   - SSL/TLS (Let's Encrypt)        │  │
│  │   - Load Balancing                 │  │
│  └────────────┬───────────────────────┘  │
└───────────────┼──────────────────────────┘
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
┌──────────────┐  ┌──────────────┐
│ App Service  │  │ PostgreSQL    │
│ - Node.js    │  │ - Port 5432   │
│ - Astro      │  │ - verbum_lucis│
│ - Port 4321  │  │ - Data volume │
└──────────────┘  └──────────────┘
```

---

## Common Tasks

### View Application Logs
```bash
docker logs -f verbum-lucis-app
```

### Check Database
```bash
docker exec verbum-lucis-db psql -U verbum_user -d verbum_lucis -c "SELECT COUNT(*) FROM dioceses;"
```

### Restart Application
```bash
docker restart verbum-lucis-app
```

### Update Application
```bash
git pull origin main
docker-compose build
docker-compose up -d
```

### Create Database Backup
```bash
docker exec verbum-lucis-db pg_dump -U verbum_user verbum_lucis > backup-$(date +%Y%m%d).sql
```

### Run Data Import
```bash
docker exec verbum-lucis-app npm run import:all
```

For more commands, see **DOKPLOY-QUICK-START.md** section "Common Tasks"

---

## Troubleshooting

### Problem: App Won't Start
**Solution:**
1. Check logs: `docker logs verbum-lucis-app`
2. Verify database: `docker exec verbum-lucis-db psql -U verbum_user -d verbum_lucis -c "SELECT 1"`
3. Restart: `docker restart verbum-lucis-app`

### Problem: Database Connection Failed
**Solution:**
1. Verify PostgreSQL: `docker ps | grep postgres`
2. Check credentials: `docker-compose config | grep DB_PASSWORD`
3. Restart database: `docker restart verbum-lucis-db`

### Problem: HTTPS Not Working
**Solution:**
1. Check Traefik logs: `docker logs traefik`
2. Verify DNS: `nslookup verbumlucis.it`
3. Check domain in docker-compose.yml labels

For more troubleshooting, see **DOKPLOY-QUICK-START.md** section "Troubleshooting"

---

## Performance Tips

1. **Enable Redis caching** - Add Redis service to docker-compose.yml
2. **Optimize database** - Run `VACUUM ANALYZE` periodically
3. **Monitor resources** - Use `docker stats` to check CPU/memory
4. **Setup CDN** - Serve static assets from CDN

---

## Security Checklist

- [ ] Change default `DB_PASSWORD` to strong value (25+ characters)
- [ ] Set `SITE_URL` to correct production domain
- [ ] Enable automatic backups in Dokploy
- [ ] Configure firewall (ufw) to allow only 22, 80, 443
- [ ] Use SSH key authentication
- [ ] Keep Docker images updated
- [ ] Monitor logs regularly
- [ ] Setup uptime monitoring

---

## Support Resources

### Official Documentation
- **Dokploy Docs:** https://docs.dokploy.com
- **Dokploy GitHub:** https://github.com/Dokploy/dokploy
- **Astro Docs:** https://docs.astro.build
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Docker Docs:** https://docs.docker.com

### Community
- **Dokploy Discussions:** https://github.com/Dokploy/dokploy/discussions
- **GitHub Issues:** https://github.com/Dokploy/dokploy/issues

---

## Next Steps

1. **Read DOKPLOY-QUICK-START.md** for immediate deployment
2. **Use scripts/dokploy-deploy.sh** for automated setup
3. **Run scripts/dokploy-init.sh** to initialize database
4. **Monitor in Dokploy panel** at http://your-vps-ip:3000
5. **Access app** at https://verbumlucis.it

---

## Document Versions

| Document | Purpose | Read Time | Audience |
|----------|---------|-----------|----------|
| This README | Overview & navigation | 5 min | Everyone |
| DOKPLOY-QUICK-START.md | Fast deployment | 10 min | First-time deployers |
| DOKPLOY-SETUP.md | Comprehensive guide | 30-45 min | Operators & devops |
| DOKPLOY-API-REFERENCE.md | API endpoints | 20 min | Developers |
| scripts/dokploy-deploy.sh | Automated setup | 2 min | Automation users |
| scripts/dokploy-init.sh | Database init | 5-10 min | Post-deployment |

---

## Deployment Decision Tree

```
START
  │
  ├─ Is this first deployment?
  │  ├─ YES → Read DOKPLOY-QUICK-START.md (Web Panel approach)
  │  └─ NO → Continue
  │
  ├─ Do you want to automate deployment?
  │  ├─ YES → Use scripts/dokploy-deploy.sh
  │  └─ NO → Use Web Panel (DOKPLOY-QUICK-START.md)
  │
  ├─ Need detailed reference?
  │  ├─ YES → Read DOKPLOY-SETUP.md
  │  └─ NO → Continue
  │
  ├─ Need API documentation?
  │  ├─ YES → Read DOKPLOY-API-REFERENCE.md
  │  └─ NO → Continue
  │
  └─ Ready to deploy!
     └─ bash scripts/dokploy-init.sh (after deployment)
```

---

## Summary

You have everything you need to deploy Verbum Lucis to Dokploy:

✅ **Documentation**
- Quick start guide
- Comprehensive setup guide
- API reference

✅ **Automation Scripts**
- Deployment script
- Initialization script

✅ **Configuration**
- docker-compose.yml ready to use
- Environment variables template

✅ **Support**
- Troubleshooting guides
- Performance tips
- Security checklist

---

**Start with DOKPLOY-QUICK-START.md and follow the steps. You'll have Verbum Lucis live in under 15 minutes!**

Good luck with your deployment! 🚀

---

**Last Updated:** 2026-02-07
**For:** Dokploy v0.26+
**Status:** Ready for production deployment
