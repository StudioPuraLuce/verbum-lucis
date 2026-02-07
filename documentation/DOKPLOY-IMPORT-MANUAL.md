# Importare Verbum Lucis in Dokploy - Guida Manuale (5 min)

## Situazione Attuale ✅
- Il progetto è **già in esecuzione** sui container Docker
- `verbum-lucis-app` - Running for 37+ hours
- `verbum-lucis-db` - PostgreSQL healthy

## Come Importarlo in Dokploy

### Opzione 1: Import Existing Containers (CONSIGLIATO)

1. **Accedi a Dokploy**: https://vps.eternalservices.ca

2. **Vai a Projects**:
   - Clicca su "Projects" nel menu principale
   - Oppure icona Projects nella sidebar

3. **Clicca "Import Existing"** o **"Add Existing Container"**:
   - Seleziona `verbum-lucis-app`
   - Seleziona `verbum-lucis-db`
   - Clicca "Import"

4. **Done!** - I tuoi container saranno ora gestiti da Dokploy

---

### Opzione 2: Create from Git Repository

Se l'opzione "Import Existing" non è disponibile:

1. **Accedi a Dokploy**: https://vps.eternalservices.ca

2. **Crea nuovo progetto**:
   - Projects > Create Project
   - Name: `Verbum Lucis`
   - Click "Create"

3. **Aggiungi servizio**:
   - Inside project, click "Add Service" o "New Service"
   - Seleziona **"Docker Compose"** o **"Git Repository"**

4. **Se Git Repository**:
   - Repository: `https://github.com/soliwalker/verbum-lucis.git`
   - Branch: `main`
   - Dockerfile: `./Dockerfile`
   - Docker Compose: `./docker-compose.yml`

5. **Set Environment Variables**:
   ```
   DB_PASSWORD = verbum_pass_123
   SITE_URL = https://verbumlucis.it
   NODE_ENV = production
   ```

6. **Deploy**:
   - Click "Deploy" button
   - Monitora i logs

---

## Verifica Dopo Import

Una volta importato, dovresti vedere:

✓ Project "Verbum Lucis" nella lista
✓ Entrambi i servizi (app + db) listed
✓ Status "healthy" per entrambi
✓ Port 4321 exposed per l'app
✓ PostgreSQL health check passing

---

## Se Nessuna Opzione di Import Funziona

Contatta Dokploy support o controlla:
- Docker daemon is running
- Containers hanno nomi corretti (verbum-lucis-app, verbum-lucis-db)
- Network docker è accessibile

Oppure usa il docker-compose.yml direttamente come volume in Dokploy.

---

## Comandi Utili

```bash
# Verifica che i container girano
docker ps | grep verbum

# Vedi i log
docker logs -f verbum-lucis-app
docker logs -f verbum-lucis-db

# Controlla se sono healthy
docker ps --filter "name=verbum"
```

---

**Allora, qual è la procedura che vedi nello Swagger/UI di Dokploy per importare container esistenti?**
