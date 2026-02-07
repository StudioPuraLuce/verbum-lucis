# Dokploy Deployment Checklist for Verbum Lucis

Use this checklist to ensure all deployment steps are completed successfully.

---

## Pre-Deployment

- [ ] **Verify Dokploy Installation**
  - [ ] Dokploy is running on VPS
  - [ ] Can access http://your-vps-ip:3000
  - [ ] Logged into Dokploy panel

- [ ] **Verify Domain**
  - [ ] Domain verbumlucis.it points to VPS IP
  - [ ] DNS resolution working: `nslookup verbumlucis.it`
  - [ ] Ports 80, 443 are accessible

- [ ] **Verify Environment**
  - [ ] Docker installed: `docker --version`
  - [ ] Docker Compose installed: `docker-compose --version`
  - [ ] Git installed: `git --version`
  - [ ] API key available: IZrOXWFMbypiYRCQYImeFZFAfLWCjevvVpIdymbmZPsLDWqofeoPyCTcdzBVUObW

- [ ] **Prepare Configuration**
  - [ ] Generate strong DB_PASSWORD (25+ chars)
  - [ ] Confirm SITE_URL: https://verbumlucis.it
  - [ ] NODE_ENV set to: production
  - [ ] docker-compose.yml reviewed and ready

---

## Deployment - Option A: Web Panel

- [ ] **Step 1: Create Project**
  - [ ] Navigate to Dokploy panel
  - [ ] Click "Create Project"
  - [ ] Name: Verbum Lucis
  - [ ] Description: Italian Catholic spiritual portal
  - [ ] Click "Create"
  - [ ] Note project ID

- [ ] **Step 2: Add Docker Compose Service**
  - [ ] Inside Verbum Lucis project, click "Add Service"
  - [ ] Select "Docker Compose"
  - [ ] Choose upload or paste method
  - [ ] Copy content from docker-compose.yml
  - [ ] Paste into form
  - [ ] Click "Next"

- [ ] **Step 3: Configure Environment**
  - [ ] Add environment variables:
    - [ ] `DB_PASSWORD`: your_secure_password
    - [ ] `SITE_URL`: https://verbumlucis.it
    - [ ] `NODE_ENV`: production
  - [ ] Click "Next"

- [ ] **Step 4: Review and Deploy**
  - [ ] Review configuration
  - [ ] Check docker-compose syntax
  - [ ] Confirm environment variables
  - [ ] Click "Deploy Now"
  - [ ] Monitor deployment in logs

---

## Deployment - Option B: Automation Script

- [ ] **Step 1: Set Environment Variables**
  - [ ] `export DOKPLOY_API_KEY="IZrOXWFMbypiYRCQYImeFZFAfLWCjevvVpIdymbmZPsLDWqofeoPyCTcdzBVUObW"`
  - [ ] `export DB_PASSWORD="your_secure_password"`
  - [ ] `export SITE_URL="https://verbumlucis.it"`

- [ ] **Step 2: Run Deployment Script**
  - [ ] Navigate to project directory
  - [ ] Run: `bash scripts/dokploy-deploy.sh`
  - [ ] Script creates project
  - [ ] Script adds Docker Compose service
  - [ ] Script initiates deployment
  - [ ] Review output and note project ID

- [ ] **Step 3: Monitor Deployment**
  - [ ] Access Dokploy panel
  - [ ] Go to Verbum Lucis project
  - [ ] Watch deployment progress
  - [ ] Wait for services to show "healthy"

---

## Post-Deployment - Database Initialization

- [ ] **Step 1: Verify Containers Running**
  - [ ] Check: `docker ps`
  - [ ] Both `verbum-lucis-app` and `verbum-lucis-db` are running
  - [ ] Database shows healthy status
  - [ ] App shows healthy status

- [ ] **Step 2: Run Initialization Script**
  - [ ] SSH into VPS
  - [ ] Navigate to project directory
  - [ ] Run: `bash scripts/dokploy-init.sh`
  - [ ] Script runs database migrations
  - [ ] Script seeds initial data
  - [ ] Script imports dioceses
  - [ ] Script imports prayers
  - [ ] Script imports catechism
  - [ ] Script configures cron jobs

- [ ] **Step 3: Verify Data Import**
  - [ ] Check dioceses: `docker exec verbum-lucis-db psql -U verbum_user -d verbum_lucis -c "SELECT COUNT(*) FROM dioceses;"`
  - [ ] Check saints: `docker exec verbum-lucis-db psql -U verbum_user -d verbum_lucis -c "SELECT COUNT(*) FROM saints;"`
  - [ ] Check prayers: `docker exec verbum-lucis-db psql -U verbum_user -d verbum_lucis -c "SELECT COUNT(*) FROM prayers;"`
  - [ ] Check catechism: `docker exec verbum-lucis-db psql -U verbum_user -d verbum_lucis -c "SELECT COUNT(*) FROM catechism;"`

---

## Verification & Testing

- [ ] **Step 1: Application Access**
  - [ ] Application accessible at https://verbumlucis.it
  - [ ] Homepage loads without errors
  - [ ] Page shows content (dioceses, saints, etc.)
  - [ ] HTTPS certificate is valid (green lock in browser)

- [ ] **Step 2: Application Logs**
  - [ ] Check app logs: `docker logs -f verbum-lucis-app`
  - [ ] No error messages
  - [ ] No connection failures
  - [ ] Server listening on port 4321

- [ ] **Step 3: Database Connectivity**
  - [ ] Database accepts connections
  - [ ] Test query succeeds: `docker exec verbum-lucis-db psql -U verbum_user -d verbum_lucis -c "SELECT 1"`
  - [ ] Password is correct
  - [ ] Database name is correct

- [ ] **Step 4: API Endpoints (Optional)**
  - [ ] Test homepage: `curl https://verbumlucis.it`
  - [ ] Test health check (if implemented): `curl https://verbumlucis.it/api/health`
  - [ ] Check response time: `curl -w "Time: %{time_total}s\n" https://verbumlucis.it`

---

## Monitoring Setup

- [ ] **Step 1: Dokploy Dashboard**
  - [ ] Access: http://your-vps-ip:3000
  - [ ] Go to Verbum Lucis project
  - [ ] Dashboard shows CPU/Memory usage
  - [ ] No alerts or warnings

- [ ] **Step 2: Backup Configuration**
  - [ ] In Dokploy: Service > Backups
  - [ ] Create backup
  - [ ] Set backup frequency (daily recommended)
  - [ ] Verify backup completes

- [ ] **Step 3: Log Monitoring**
  - [ ] Setup log aggregation (optional)
  - [ ] Enable alerts for errors
  - [ ] Configure log retention

- [ ] **Step 4: External Monitoring (Optional)**
  - [ ] Setup UptimeRobot or similar
  - [ ] Add URL: https://verbumlucis.it
  - [ ] Set check frequency: 5 minutes
  - [ ] Configure alerts

---

## Security Hardening

- [ ] **Step 1: Database Security**
  - [ ] DB_PASSWORD is strong (25+ chars with special chars)
  - [ ] PostgreSQL not exposed publicly
  - [ ] Only accessible via Docker network
  - [ ] Regular backups are scheduled

- [ ] **Step 2: Application Security**
  - [ ] HTTPS enabled and certificate valid
  - [ ] NODE_ENV is production
  - [ ] Debug mode disabled
  - [ ] Admin panel restricted (if applicable)

- [ ] **Step 3: Infrastructure Security**
  - [ ] Firewall configured (ufw)
    - [ ] Allow SSH (port 22)
    - [ ] Allow HTTP (port 80)
    - [ ] Allow HTTPS (port 443)
    - [ ] Deny all others
  - [ ] SSH key authentication enabled
  - [ ] Password authentication disabled
  - [ ] Fail2ban installed and running

- [ ] **Step 4: Secrets Management**
  - [ ] No secrets in docker-compose.yml
  - [ ] Secrets stored in Dokploy environment
  - [ ] API key not in version control
  - [ ] Backup password separate from deploy password

---

## Performance Optimization (Post-Launch)

- [ ] **Step 1: Monitor Performance**
  - [ ] Check response time: `curl -w "Time: %{time_total}s\n" https://verbumlucis.it`
  - [ ] Monitor CPU usage: `docker stats verbum-lucis-app`
  - [ ] Monitor memory usage: `docker stats verbum-lucis-db`
  - [ ] Check disk usage: `docker system df`

- [ ] **Step 2: Optimize if Needed**
  - [ ] If CPU high: Consider Redis caching
  - [ ] If memory high: Increase container limits
  - [ ] If disk full: Setup log rotation
  - [ ] If slow queries: Add database indexes

- [ ] **Step 3: Scaling (If Needed)**
  - [ ] Add app replicas in docker-compose.yml
  - [ ] Configure load balancing (Traefik)
  - [ ] Monitor with multiple instances

---

## Ongoing Maintenance Schedule

### Daily
- [ ] Monitor Dokploy dashboard for alerts
- [ ] Check application availability
- [ ] Review error logs

### Weekly
- [ ] Verify backups completed successfully
- [ ] Check resource usage trends
- [ ] Test backup restoration

### Monthly
- [ ] Review security logs
- [ ] Update Docker images
- [ ] Verify disaster recovery plan
- [ ] Check SSL certificate expiration

### Quarterly
- [ ] Major security updates
- [ ] Performance tuning
- [ ] Capacity planning

---

## Rollback Procedure (If Needed)

- [ ] **Step 1: Access Dokploy**
  - [ ] Go to Service history
  - [ ] Find previous deployment
  - [ ] Note deployment ID

- [ ] **Step 2: Restore Database (If Needed)**
  - [ ] Go to Backups
  - [ ] Select backup before issue
  - [ ] Click "Restore"
  - [ ] Wait for restore to complete

- [ ] **Step 3: Redeploy Previous Version**
  - [ ] Go to deployment history
  - [ ] Click "Redeploy" on previous good deployment
  - [ ] Wait for deployment to complete
  - [ ] Verify application works

---

## Troubleshooting Quick Reference

| Problem | Check | Solution |
|---------|-------|----------|
| App won't start | `docker logs verbum-lucis-app` | Check DATABASE_URL, restart app |
| DB connection fails | `docker exec postgres pg_isready` | Check password, restart postgres |
| HTTPS not working | `docker logs traefik` | Check domain, DNS, ports 80/443 |
| Port in use | `sudo lsof -i :4321` | Kill process or change port |
| Out of disk | `docker system df` | Run `docker system prune -a` |
| Slow performance | `docker stats` | Add caching, optimize queries |
| Backup failed | Dokploy backup logs | Check disk space, retry |
| Can't access domain | `nslookup verbumlucis.it` | Check DNS, wait for propagation |

---

## Success Criteria

Your deployment is successful when:

- [x] Application accessible at https://verbumlucis.it
- [x] HTTPS certificate valid and auto-renewed
- [x] Database connected and healthy
- [x] Data properly imported (dioceses, saints, prayers)
- [x] Daily liturgy updates scheduled (cron jobs)
- [x] Automatic backups configured and working
- [x] Monitoring active in Dokploy dashboard
- [x] Security hardened (firewall, SSH keys, strong passwords)
- [x] Application logs clean (no errors)
- [x] Page load time acceptable (<2 seconds)

---

## Documentation References

| Need | File |
|------|------|
| Quick start | DOKPLOY-QUICK-START.md |
| Detailed guide | DOKPLOY-SETUP.md |
| API documentation | DOKPLOY-API-REFERENCE.md |
| Automation scripts | scripts/dokploy-deploy.sh, scripts/dokploy-init.sh |
| This checklist | DOKPLOY-CHECKLIST.md |

---

## Sign-Off

```
Deployment Date: _______________
Deployed By: _______________
Verified By: _______________

All items checked: YES / NO
Date Completed: _______________
```

---

**Congratulations!** Your Verbum Lucis is now live on Dokploy! 🎉

If you need help, refer to the documentation files or visit:
- https://docs.dokploy.com
- https://github.com/Dokploy/dokploy

---

**Last Updated:** 2026-02-07
**Version:** 1.0
