# Dokploy Quick Start Guide

Fast-track deployment of Verbum Lucis to Dokploy in 5 minutes.

---

## Prerequisites Check

```bash
# Verify you have:
docker --version      # Should be 20.10+
docker-compose --version  # Should be 1.29+
curl --version        # For API calls
jq --version         # For JSON parsing (optional but helpful)
```

---

## Option 1: Using Dokploy Web Panel (Recommended for First Deploy)

### Step 1: Access Dokploy Panel
```
http://your-vps-ip:3000
```

### Step 2: Create Project
1. Click **"Create Project"**
2. Name: `Verbum Lucis`
3. Description: `Italian Catholic spiritual portal`
4. Click **"Create"**

### Step 3: Add Docker Compose
1. Inside Verbum Lucis project, click **"Add Service"**
2. Select **"Docker Compose"**
3. Choose **"Use File Upload"** or **"Paste YAML"**

### Step 4: Paste docker-compose.yml

Copy the entire content from `/home/chris/Scrivania/verbum-lucis/docker-compose.yml`

### Step 5: Set Environment Variables

In the **"Environment"** section, add:

| Key | Value |
|-----|-------|
| `DB_PASSWORD` | `your_secure_password_here` |
| `SITE_URL` | `https://verbumlucis.it` |
| `NODE_ENV` | `production` |

### Step 6: Deploy

1. Click **"Deploy"** button
2. Watch logs in real-time
3. Wait for both services to show "healthy"

### Step 7: Initialize Database

Once deployed, run these commands from VPS terminal:

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Run initialization script
cd /path/to/verbum-lucis
bash scripts/dokploy-init.sh
```

This will:
- Run database migrations
- Seed initial data
- Import dioceses, prayers, catechism
- Setup cron jobs
- Verify deployment

---

## Option 2: Using Automated Deployment Script

### Step 1: Generate API Credentials (if needed)

In Dokploy panel: **Settings > API Keys > Create**

### Step 2: Set Environment Variables

```bash
export DOKPLOY_API_KEY="your-api-key-here"
export DOKPLOY_HOST="localhost"
export DOKPLOY_PORT="3000"
export DB_PASSWORD="secure_password_here"
export SITE_URL="https://verbumlucis.it"
```

### Step 3: Run Deployment Script

```bash
cd /home/chris/Scrivania/verbum-lucis
chmod +x scripts/dokploy-deploy.sh
bash scripts/dokploy-deploy.sh
```

This script will:
- Create project in Dokploy
- Add Docker Compose service
- Set environment variables
- Trigger deployment

### Step 4: Monitor in Dokploy Panel

- Visit `http://your-dokploy-instance:3000`
- Go to Verbum Lucis project
- Watch deployment progress

### Step 5: Initialize Database

```bash
bash scripts/dokploy-init.sh
```

---

## Verification Checklist

After deployment, verify:

```bash
# 1. App is running
curl http://localhost:4321

# 2. Database is healthy
docker exec verbum-lucis-db psql -U verbum_user -d verbum_lucis -c "SELECT 1"

# 3. Check data count
docker exec verbum-lucis-db psql -U verbum_user -d verbum_lucis \
  -c "SELECT COUNT(*) FROM dioceses; SELECT COUNT(*) FROM saints;"

# 4. View app logs
docker logs -f verbum-lucis-app

# 5. Check HTTPS certificate
curl -I https://verbumlucis.it
```

---

## Common Tasks

### View Logs

```bash
# App logs
docker logs -f verbum-lucis-app

# Database logs
docker logs -f verbum-lucis-db

# All services
docker-compose logs -f
```

### Restart Services

```bash
# Restart app only
docker restart verbum-lucis-app

# Restart database
docker restart verbum-lucis-db

# Restart all
docker-compose restart
```

### Update Application

```bash
# Pull latest from GitHub
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Run migrations if needed
docker exec verbum-lucis-app npm run db:push
```

### Database Backup

```bash
# Manual backup
docker exec verbum-lucis-db pg_dump -U verbum_user verbum_lucis > backup-$(date +%Y%m%d).sql

# In Dokploy panel: Service > Backups > Create Backup
```

### Restore from Backup

```bash
docker exec -i verbum-lucis-db psql -U verbum_user verbum_lucis < backup-20260207.sql
```

### Manual Data Import

```bash
# Import dioceses
docker exec verbum-lucis-app npm run import:dioceses

# Import all data
docker exec verbum-lucis-app npm run import:all

# Scrape saints
docker exec verbum-lucis-app npm run scrape:saints

# Update liturgy
docker exec verbum-lucis-app npm run update-liturgy:all
```

### SSH into Container

```bash
# App shell
docker exec -it verbum-lucis-app sh

# Database CLI
docker exec -it verbum-lucis-db psql -U verbum_user -d verbum_lucis
```

---

## Troubleshooting

### App Won't Start

```bash
# Check logs
docker logs verbum-lucis-app

# Check database connection
docker exec verbum-lucis-app env | grep DATABASE_URL

# Test database
docker exec verbum-lucis-db psql -U verbum_user -d verbum_lucis -c "SELECT 1"

# Restart
docker restart verbum-lucis-app
```

### Database Connection Failed

```bash
# Verify database is running
docker ps | grep postgres

# Check database health
docker exec verbum-lucis-db pg_isready -U verbum_user

# View database logs
docker logs verbum-lucis-db

# Verify password
docker-compose config | grep DB_PASSWORD
```

### HTTPS Not Working

```bash
# Check Traefik logs
docker logs traefik

# Check certificate
docker exec verbum-lucis-app certbot certificates

# Verify domain DNS
nslookup verbumlucis.it

# Manually renew certificate
docker exec verbum-lucis-app certbot renew --force-renewal
```

### Port Already in Use

```bash
# Find process using port
sudo lsof -i :4321

# Kill process
sudo kill -9 <PID>

# Or change port in docker-compose.yml
```

---

## Performance Tips

### Enable Caching

Add Redis to docker-compose.yml:

```yaml
redis:
  image: redis:7-alpine
  container_name: verbum-lucis-cache
  restart: unless-stopped
  networks:
    - internal
```

Then set `REDIS_URL: redis://redis:6379` in app environment.

### Optimize Database

```bash
# Run VACUUM
docker exec verbum-lucis-db psql -U verbum_user -d verbum_lucis -c "VACUUM ANALYZE"

# Check slow queries
docker exec verbum-lucis-db psql -U verbum_user -d verbum_lucis \
  -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

### Monitor Resources

```bash
# CPU and memory usage
docker stats

# Disk usage
docker system df

# Container processes
docker top verbum-lucis-app
```

---

## Security Quick Checklist

- [ ] Change `DB_PASSWORD` to strong value (25+ chars)
- [ ] Set `SITE_URL` to correct domain
- [ ] Enable automatic backups in Dokploy
- [ ] Setup firewall (ufw) to allow only 22, 80, 443
- [ ] Enable SSH key auth (disable password auth)
- [ ] Keep Docker images updated
- [ ] Monitor logs regularly
- [ ] Setup uptime monitoring (UptimeRobot, etc.)

---

## Support & Help

- **Full Documentation:** See `DOKPLOY-SETUP.md`
- **Dokploy Docs:** https://docs.dokploy.com
- **Astro Docs:** https://docs.astro.build
- **Docker Docs:** https://docs.docker.com
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

## Quick Command Reference

```bash
# Deployment
bash scripts/dokploy-deploy.sh          # Auto-deploy via API
bash scripts/dokploy-init.sh            # Initialize database

# Logs
docker logs -f verbum-lucis-app         # App logs
docker logs -f verbum-lucis-db          # Database logs
docker-compose logs -f                  # All logs

# Status
docker ps                               # Container status
docker-compose ps                       # All services
docker exec verbum-lucis-db psql -U verbum_user -d verbum_lucis -c "SELECT 1"

# Data Management
docker exec verbum-lucis-app npm run db:push        # Migrations
docker exec verbum-lucis-app npm run db:seed        # Seed data
docker exec verbum-lucis-app npm run import:all     # Import all data

# Maintenance
docker restart verbum-lucis-app                     # Restart app
docker-compose down && docker-compose up -d         # Restart all
docker system prune -a --volumes                    # Clean up
```

---

**That's it! Your Verbum Lucis should be live on Dokploy now.**

For detailed troubleshooting and advanced configurations, see `DOKPLOY-SETUP.md`.

Good luck! 🚀
