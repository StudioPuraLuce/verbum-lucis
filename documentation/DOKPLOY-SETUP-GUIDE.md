# Dokploy Setup & Import Guide - Verbum Lucis

## Current Status

✅ **Project is running on VPS:**
- `verbum-lucis-app` (37+ hours uptime)
- `verbum-lucis-db` (PostgreSQL 16, healthy)

❌ **Problem:** The existing API key in `.env` is invalid
  - Dokploy instance is accessible: https://vps.eternalservices.ca
  - API authentication failed (401 Unauthorized)

---

## Solution: Three Options

### **Option 1: Import via Dokploy Web Panel (Recommended - 5 minutes)**

Since your project is already running and working, import it into Dokploy's UI:

#### Step 1: Access Dokploy Web Panel
```
https://vps.eternalservices.ca
```

#### Step 2: Generate Valid API Key
1. Go to **Settings** (bottom left)
2. Click **API Keys** or **Integrations**
3. Click **Create New API Key**
4. Copy the generated key
5. Save it to `.env`:
   ```bash
   echo "DOKPLOY_API_KEY=<paste-the-new-key-here>" >> .env
   ```

#### Step 3: Import Existing Project

**Option A - Add as Git-based Project:**
1. In Dokploy: **Projects** > **Create Project**
2. Name: `Verbum Lucis`
3. Select **Docker Compose** as source
4. **Repository URL:** `https://github.com/soliwalker/verbum-lucis.git`
5. **Branch:** `main`
6. Click **Create**

**Option B - Import Running Containers:**
1. In Dokploy: **Projects** > **Import Existing Containers**
2. Select `verbum-lucis-app` and `verbum-lucis-db`
3. Click **Import**

---

### **Option 2: Verify Dokploy Configuration**

Check if Dokploy is properly set up on your VPS:

```bash
# SSH to VPS
ssh user@vps.eternalservices.ca

# Check if Dokploy container is running
docker ps | grep -i dokploy

# Check Dokploy logs
docker logs dokploy 2>&1 | tail -50

# Check Dokploy web interface
curl -I https://vps.eternalservices.ca
```

If Dokploy is not running, start it:

```bash
cd /path/to/dokploy
docker-compose up -d
```

---

### **Option 3: Deploy with Valid API Key (When Ready)**

Once you have the valid API key from Dokploy:

```bash
# Update .env with new API key
DOKPLOY_API_KEY="<your-valid-key-from-step-2>"

# Run deployment
export DOKPLOY_API_KEY="<key>"
bash scripts/dokploy-auto-deploy.sh
```

---

## Troubleshooting

### Dokploy Web Panel Not Accessible

```bash
# Check if Dokploy is running
docker ps | grep dokploy

# If not running, check docker-compose.yml
docker-compose -f /path/to/dokploy/docker-compose.yml up -d

# View Dokploy logs
docker logs -f dokploy
```

### API Key Issues

**If you get "Unauthorized" error:**

1. **Regenerate API key in Dokploy UI:**
   - Go to Settings > API Keys
   - Delete old key
   - Create new one
   - Copy immediately

2. **Verify key format:**
   - Should be a long alphanumeric string
   - Should not include "Bearer" prefix
   - Update `.env`:
     ```
     DOKPLOY_API_KEY=your_actual_key_here
     ```

3. **Test the new key:**
   ```bash
   curl -H "Authorization: Bearer $DOKPLOY_API_KEY" \
        https://vps.eternalservices.ca/api/projects
   ```

### Containers Already Running

If you get error "containers already in use", you have two options:

**Option A - Keep Current Setup (No Docker conflict):**
- Your project runs outside Dokploy
- Still accessible and working
- Can manage manually via Docker CLI

**Option B - Let Dokploy Manage It:**
1. Stop current containers:
   ```bash
   docker-compose down
   ```

2. Import into Dokploy via web panel
3. Let Dokploy restart and manage them

---

## Manual Container Management (If Dokploy Import Fails)

### View Logs
```bash
docker logs -f verbum-lucis-app
docker logs -f verbum-lucis-db
```

### Restart Services
```bash
docker restart verbum-lucis-app
docker restart verbum-lucis-db
```

### Check Database
```bash
docker exec -it verbum-lucis-db psql -U verbum_user -d verbum_lucis -c "SELECT COUNT(*) FROM dioceses;"
```

### Update Application
```bash
# Pull latest code
git pull origin main

# Rebuild
docker-compose build

# Restart
docker-compose up -d
```

### Backup Database
```bash
docker exec verbum-lucis-db pg_dump -U verbum_user verbum_lucis > backup-$(date +%Y%m%d-%H%M%S).sql
```

---

## Recommended Next Steps

1. **SSH to VPS and verify Dokploy is running**
   ```bash
   ssh user@vps.eternalservices.ca
   docker ps | grep dokploy
   ```

2. **Access Dokploy web panel**
   ```
   https://vps.eternalservices.ca
   ```

3. **Generate valid API key in Dokploy UI**
   - Settings > API Keys > Create New

4. **Update `.env` with valid key:**
   ```bash
   echo "DOKPLOY_API_KEY=<new-key>" >> .env
   ```

5. **Import project into Dokploy:**
   - Option A: Via web panel UI (easiest)
   - Option B: Use updated script with valid key

6. **Verify in Dokploy panel:**
   - Projects should show `Verbum Lucis`
   - Containers should be listed
   - Status should be "healthy"

---

## Useful Commands

```bash
# Test API with valid key
curl -H "Authorization: Bearer $DOKPLOY_API_KEY" \
     https://vps.eternalservices.ca/api/projects | jq

# SSH to VPS
ssh user@vps.eternalservices.ca

# Monitor app logs (real-time)
docker logs -f verbum-lucis-app

# Check container stats
docker stats verbum-lucis-app verbum-lucis-db

# Database shell
docker exec -it verbum-lucis-db psql -U verbum_user -d verbum_lucis

# Restart everything
docker-compose restart
```

---

## Need Help?

- **Dokploy Docs:** https://docs.dokploy.com
- **Docker Docs:** https://docs.docker.com/
- **Project Repo:** https://github.com/soliwalker/verbum-lucis

Check your VPS logs for more details:
```bash
docker logs dokploy | grep -i error
```
