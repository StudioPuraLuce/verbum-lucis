# Dokploy Deployment Guide for Verbum Lucis

Complete setup guide for deploying the Verbum Lucis Astro + PostgreSQL application to Dokploy.

**Project:** Verbum Lucis (Italian Catholic spiritual portal)
**Stack:** Astro 4.3, React 18.2, PostgreSQL 16, Node.js 20
**Repository:** https://github.com/soliwalker/verbum-lucis.git
**Deployment Platform:** Dokploy (Self-hosted PaaS alternative to Heroku/Vercel)

---

## Quick Overview

Dokploy is a self-hosted deployment platform that simplifies application and database management. For Verbum Lucis, we have two deployment approaches:

1. **Docker Compose (Recommended)** - Single deployment combining app + database
2. **Separate Services** - App and PostgreSQL managed independently

This guide focuses on the **Docker Compose approach**, which is optimal for this project's architecture.

---

## Prerequisites

- Dokploy instance running on VPS (already installed)
- Dokploy API key: `IZrOXWFMbypiYRCQYImeFZFAfLWCjevvVpIdymbmZPsLDWqofeoPyCTcdzBVUObW`
- VPS with Docker and Docker Compose installed
- Domain: `verbumlucis.it` (configured and pointing to VPS)
- SSH access to VPS

---

## Part 1: Dokploy API Fundamentals

### Authentication

All Dokploy API requests require the API key in the header:

```bash
Authorization: Bearer IZrOXWFMbypiYRCQYImeFZFAfLWCjevvVpIdymbmZPsLDWqofeoPyCTcdzBVUObW
```

### Base URL

```
http://[your-dokploy-instance]:3000/api
```

If Dokploy is on the same VPS, use:
```
http://localhost:3000/api
```

### API Endpoints Reference

#### 1. List Projects
```bash
GET /projects
Authorization: Bearer YOUR_API_KEY
```

#### 2. Create Project
```bash
POST /projects
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "name": "Verbum Lucis",
  "description": "Italian Catholic spiritual portal"
}
```

**Response:**
```json
{
  "projectId": "proj_xxxxxxxxxxxx",
  "name": "Verbum Lucis",
  "description": "Italian Catholic spiritual portal"
}
```

#### 3. Create Docker Compose Deployment
```bash
POST /projects/{projectId}/docker-compose
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "name": "verbum-lucis-production",
  "dockerComposeFile": "< ... docker-compose.yml content ... >",
  "environment": {
    "DB_PASSWORD": "your_secure_password",
    "SITE_URL": "https://verbumlucis.it"
  }
}
```

#### 4. Deploy Application
```bash
POST /docker-compose/{dockerComposeId}/deploy
Authorization: Bearer YOUR_API_KEY
```

#### 5. Get Deployment Status
```bash
GET /docker-compose/{dockerComposeId}
Authorization: Bearer YOUR_API_KEY
```

---

## Part 2: Step-by-Step Setup via Dokploy Panel

### Step 1: Access Dokploy Panel

1. Open `http://your-dokploy-instance:3000`
2. Log in with your credentials
3. Click **"Create Project"** or navigate to Projects

### Step 2: Create Project

**Form:**
- **Name:** Verbum Lucis
- **Description:** Italian Catholic spiritual portal with daily liturgy for 226 dioceses

### Step 3: Add Docker Compose Service

1. Inside Verbum Lucis project, click **"Add Service"**
2. Select **"Docker Compose"** option
3. Choose **"Upload docker-compose.yml"** or paste content directly

### Step 4: Configure Docker Compose

**Paste the following docker-compose.yml:**

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:16-alpine
    container_name: verbum-lucis-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: verbum_lucis
      POSTGRES_USER: verbum_user
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme123}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U verbum_user -d verbum_lucis"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - internal
    expose:
      - "5432"

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: verbum-lucis-app
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://verbum_user:${DB_PASSWORD:-changeme123}@postgres:5432/verbum_lucis
      SITE_URL: https://verbumlucis.it
      NODE_ENV: production
    ports:
      - "4321:4321"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.verbum.rule=Host(`verbumlucis.it`)"
      - "traefik.http.routers.verbum.entrypoints=websecure"
      - "traefik.http.routers.verbum.tls.certresolver=letsencrypt"
      - "traefik.http.services.verbum.loadbalancer.server.port=4321"
    networks:
      - internal

volumes:
  postgres_data:
    driver: local

networks:
  internal:
    driver: bridge
```

### Step 5: Set Environment Variables

In Dokploy panel, go to **Environment Variables**:

| Variable | Value | Notes |
|----------|-------|-------|
| `DB_PASSWORD` | `your_secure_password_here` | Generate a strong password |
| `SITE_URL` | `https://verbumlucis.it` | Production domain |
| `NODE_ENV` | `production` | Production mode |

### Step 6: Connect to GitHub (Optional but Recommended)

1. Click **"Connect Repository"**
2. Authorize GitHub and select `soliwalker/verbum-lucis`
3. Select branch: `main`
4. Enable **"Auto Deploy on Push"** for automatic updates

### Step 7: Deploy

1. Click **"Deploy Now"** button
2. Monitor logs in real-time
3. Wait for both `postgres` and `app` services to be "healthy"

### Step 8: Initialize Database

After deployment succeeds:

1. Go to **Terminal** in Dokploy panel (or SSH into VPS)
2. Run migrations:
   ```bash
   docker exec verbum-lucis-app npm run db:push
   ```
3. Seed initial data:
   ```bash
   docker exec verbum-lucis-app npm run db:seed
   ```

### Step 9: Verify Deployment

- Visit `https://verbumlucis.it` in browser
- Check app logs: `docker logs -f verbum-lucis-app`
- Check database: `docker exec verbum-lucis-db psql -U verbum_user -d verbum_lucis -c "SELECT COUNT(*) FROM dioceses;"`

---

## Part 3: API-Based Setup (Programmatic)

If you prefer setting up via API calls, use this bash script:

### Create `dokploy-setup.sh`

```bash
#!/bin/bash

# Configuration
API_KEY="IZrOXWFMbypiYRCQYImeFZFAfLWCjevvVpIdymbmZPsLDWqofeoPyCTcdzBVUObW"
DOKPLOY_URL="http://localhost:3000/api"
DB_PASSWORD="your_secure_password_here"

echo "Step 1: Creating project..."
PROJECT=$(curl -s -X POST "$DOKPLOY_URL/projects" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Verbum Lucis",
    "description": "Italian Catholic spiritual portal"
  }')

PROJECT_ID=$(echo $PROJECT | jq -r '.projectId')
echo "Project created: $PROJECT_ID"

echo "Step 2: Creating Docker Compose deployment..."

# Read docker-compose.yml
COMPOSE_CONTENT=$(cat docker-compose.yml | jq -R -s '.')

DEPLOYMENT=$(curl -s -X POST "$DOKPLOY_URL/projects/$PROJECT_ID/docker-compose" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"verbum-lucis-production\",
    \"dockerComposeFile\": $COMPOSE_CONTENT,
    \"environment\": {
      \"DB_PASSWORD\": \"$DB_PASSWORD\",
      \"SITE_URL\": \"https://verbumlucis.it\",
      \"NODE_ENV\": \"production\"
    }
  }")

COMPOSE_ID=$(echo $DEPLOYMENT | jq -r '.id')
echo "Docker Compose deployment created: $COMPOSE_ID"

echo "Step 3: Deploying application..."
curl -s -X POST "$DOKPLOY_URL/docker-compose/$COMPOSE_ID/deploy" \
  -H "Authorization: Bearer $API_KEY"

echo "Deployment started!"
echo "Monitor at: http://your-dokploy-instance:3000"
```

### Usage

```bash
chmod +x dokploy-setup.sh
./dokploy-setup.sh
```

---

## Part 4: Post-Deployment Configuration

### Database Initialization

```bash
# SSH into VPS
ssh user@your-vps-ip

# Run migrations
docker exec verbum-lucis-app npm run db:push

# Seed data
docker exec verbum-lucis-app npm run db:seed

# Import dioceses
docker exec verbum-lucis-app npm run import:dioceses

# Import saints
docker exec verbum-lucis-app npm run scrape:saints

# Import prayers
docker exec verbum-lucis-app npm run import:prayers

# Import catechism
docker exec verbum-lucis-app npm run import:catechism
```

### Enable Daily Liturgy Updates

```bash
# SSH into VPS
ssh user@your-vps-ip

# Setup cron jobs
docker exec verbum-lucis-app npm run setup-cron
```

This will configure:
- Daily liturgy updates at 00:01
- Weekly database backups on Sundays at 03:00
- Daily sitemap generation

### Configure SSL Certificate

Dokploy automatically handles HTTPS with Let's Encrypt if you:

1. Point your domain to the VPS IP
2. Add Traefik labels to services (already in docker-compose.yml)
3. Ensure port 80 and 443 are open

Certificate renewal is automatic (no action needed).

### Setup Automated Backups

Dokploy offers built-in backup management:

1. Go to Service > **Backups** in Dokploy panel
2. Click **"Create Backup"**
3. Choose frequency: Daily, Weekly, or Monthly
4. Set retention: 30 days (recommended)

Or use manual command:

```bash
docker exec verbum-lucis-db pg_dump -U verbum_user verbum_lucis > backup-$(date +%Y%m%d).sql
```

---

## Part 5: Monitoring & Maintenance

### Real-time Monitoring

Dokploy provides built-in monitoring:

1. **Dashboard** - CPU, memory, disk, network usage
2. **Logs** - Real-time container logs
3. **Events** - Deployment history and status changes

### Health Checks

Dokploy automatically monitors services via healthcheck. If app fails:

1. Check logs: `docker logs verbum-lucis-app`
2. Verify database: `docker exec verbum-lucis-db psql -U verbum_user -d verbum_lucis -c "SELECT 1"`
3. Restart service:
   ```bash
   docker restart verbum-lucis-app
   ```

### View Logs

```bash
# App logs
docker logs -f verbum-lucis-app

# Database logs
docker logs -f verbum-lucis-db

# All services
docker-compose logs -f
```

### Update Application

For updates from GitHub:

1. **If auto-deploy enabled:** Changes to `main` branch automatically deploy
2. **Manual update:**
   ```bash
   docker-compose down
   docker-compose build
   docker-compose up -d
   docker exec verbum-lucis-app npm run db:push  # Run migrations if needed
   ```

---

## Part 6: Troubleshooting

### Issue: App Won't Start

**Check database connection:**
```bash
docker exec verbum-lucis-app env | grep DATABASE_URL
docker exec verbum-lucis-db psql -U verbum_user -d verbum_lucis -c "SELECT 1"
```

**Check logs:**
```bash
docker logs verbum-lucis-app
```

**Restart services:**
```bash
docker-compose restart postgres
docker-compose restart app
```

### Issue: Database Connection Failed

```bash
# Verify PostgreSQL is running and healthy
docker-compose ps

# Check PostgreSQL logs
docker logs verbum-lucis-db

# Verify credentials
docker exec verbum-lucis-db psql -U verbum_user -d verbum_lucis -c "SELECT 1"

# If password wrong, rebuild with correct DB_PASSWORD
```

### Issue: Port 4321 Already in Use

```bash
# Find process using port
sudo lsof -i :4321

# Kill it
sudo kill -9 <PID>

# Or change port in docker-compose.yml and redeploy
```

### Issue: SSL Certificate Not Renewing

```bash
# Check certificate status
docker exec verbum-lucis-app certbot certificates

# Renew manually
docker exec verbum-lucis-app certbot renew --dry-run

# View Traefik logs
docker logs traefik
```

### Issue: Out of Disk Space

```bash
# Check disk usage
docker system df

# Clean up unused images/containers
docker system prune -a --volumes

# View volume sizes
docker system df
```

---

## Part 7: Performance Optimization

### Caching

Add Redis to docker-compose.yml for session/cache:

```yaml
redis:
  image: redis:7-alpine
  container_name: verbum-lucis-cache
  restart: unless-stopped
  command: redis-server --appendonly yes
  volumes:
    - redis_data:/data
  networks:
    - internal
  expose:
    - "6379"

volumes:
  redis_data:
```

Then add to app environment:
```yaml
REDIS_URL: redis://redis:6379
```

### CDN Integration

For serving static assets:

1. Push `dist/` folder to CDN
2. Update `astro.config.mjs` with CDN base URL
3. Rebuild and redeploy

### Database Optimization

```bash
# Run VACUUM to optimize PostgreSQL
docker exec verbum-lucis-db psql -U verbum_user -d verbum_lucis -c "VACUUM ANALYZE"

# Create indexes (if not auto-created)
docker exec verbum-lucis-db psql -U verbum_user -d verbum_lucis -f scripts/create-indexes.sql
```

---

## Part 8: Security Best Practices

### Environment Variables

Never commit sensitive data. Store in Dokploy environment variables:
- Database passwords
- API keys
- Service credentials

### Database Security

```bash
# Use strong password (25+ characters)
# Disable remote access to PostgreSQL (only accessible via app service)
# Regular backups

# Check who can connect
docker exec verbum-lucis-db psql -U verbum_user -d verbum_lucis -c "SELECT * FROM pg_user"
```

### Firewall Rules

```bash
# Only expose necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# Block PostgreSQL from external access
# (only accessible via Docker network)
```

### Regular Updates

```bash
# Keep base images updated
docker pull postgres:16-alpine
docker pull node:20-alpine

# Rebuild and redeploy
docker-compose build --no-cache
docker-compose up -d
```

---

## Part 9: Scaling & Deployment Patterns

### Multiple Replicas (Load Balancing)

Docker Compose with Dokploy supports service replicas:

```yaml
app:
  # ... existing config ...
  deploy:
    replicas: 3
    update_config:
      parallelism: 1
      delay: 10s
```

Traefik automatically load balances across replicas.

### Staging Environment

Create separate Dokploy project for staging:

```bash
# In staging docker-compose.yml
app:
  environment:
    SITE_URL: https://staging.verbumlucis.it
    NODE_ENV: staging
```

Deploy from `develop` branch to staging, merge to `main` for production.

### Blue-Green Deployment

1. Maintain two production deployments
2. Update "blue" environment, test thoroughly
3. Switch traffic (Traefik) to "blue"
4. Keep "green" as rollback

---

## Checklist: Post-Deployment Verification

- [ ] Application accessible at https://verbumlucis.it
- [ ] HTTPS certificate valid (click lock icon in browser)
- [ ] Database connected and migrations run
- [ ] Initial data seeded (dioceses, saints, prayers)
- [ ] Daily liturgy updates scheduled
- [ ] Automated backups configured
- [ ] Admin panel accessible
- [ ] Sitemap generated
- [ ] Analytics tracking (if configured)
- [ ] Monitoring dashboard working in Dokploy
- [ ] Cron jobs active
- [ ] Email notifications configured (optional)

---

## Quick Reference: Common Commands

```bash
# View status
docker-compose ps

# View logs
docker-compose logs -f app
docker-compose logs -f postgres

# Run migrations
docker exec verbum-lucis-app npm run db:push

# Seed data
docker exec verbum-lucis-app npm run db:seed

# Import data
docker exec verbum-lucis-app npm run import:dioceses
docker exec verbum-lucis-app npm run import:all

# Update deployment
docker-compose down
docker-compose build
docker-compose up -d

# Database backup
docker exec verbum-lucis-db pg_dump -U verbum_user verbum_lucis > backup.sql

# Database restore
docker exec -i verbum-lucis-db psql -U verbum_user verbum_lucis < backup.sql

# Execute shell in container
docker exec -it verbum-lucis-app sh
docker exec -it verbum-lucis-db psql -U verbum_user -d verbum_lucis
```

---

## Support & Resources

- **Dokploy Documentation:** https://docs.dokploy.com
- **Dokploy GitHub:** https://github.com/Dokploy/dokploy
- **Astro Documentation:** https://docs.astro.build
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/
- **Docker Documentation:** https://docs.docker.com

---

## Summary

You now have a complete guide to deploy Verbum Lucis to Dokploy with:

1. **Two approaches:** Panel UI or API-based automation
2. **Complete docker-compose configuration** ready to use
3. **Post-deployment initialization scripts** for data setup
4. **Monitoring and maintenance procedures**
5. **Troubleshooting guides** for common issues
6. **Security and optimization recommendations**
7. **Scaling and backup strategies**

Start with the **Step-by-Step Setup via Dokploy Panel** (Part 2) for the simplest approach, or use the **API-Based Setup** (Part 3) for automation.

Good luck with your deployment! 🚀
