# 🚀 Guida Deploy Completa - Liturgia Cattolica

Questa guida ti accompagna passo-passo nel deploy dell'applicazione su VPS.

## 📋 Prerequisiti

- VPS con Ubuntu 20.04+ (o altra distro Linux)
- Accesso SSH root o sudo
- Dominio configurato (opzionale ma consigliato)

## 1️⃣ Preparazione VPS

### Aggiorna il sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### Installa Node.js 20+
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Verifica: v20.x.x
```

### Installa Docker & Docker Compose
```bash
# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verifica
docker --version
docker-compose --version
```

### Installa Git
```bash
sudo apt install -y git
```

## 2️⃣ Clone e Setup Progetto

```bash
# Vai nella home
cd ~

# Clone repository (o upload files)
git clone <your-repo-url> liturgia-cattolica
# OPPURE: usa scp/rsync per caricare i file

cd liturgia-cattolica

# Copia env
cp .env.example .env

# Modifica .env con i tuoi valori
nano .env
```

### Configura .env
```bash
DATABASE_URL=postgresql://liturgia_user:CAMBIA_PASSWORD_QUI@postgres:5432/liturgia
SITE_URL=https://tuodominio.it
SITE_NAME="Liturgia Cattolica"
DB_PASSWORD=CAMBIA_PASSWORD_QUI
```

## 3️⃣ Build e Avvio con Docker

```bash
# Build immagine
docker-compose build

# Avvia servizi
docker-compose up -d

# Verifica status
docker-compose ps

# Dovresti vedere:
# liturgia-db    (postgres)  -> healthy
# liturgia-app   (node)      -> Up
```

## 4️⃣ Inizializza Database

```bash
# Aspetta che postgres sia pronto (30 secondi)
sleep 30

# Esegui migrations
docker-compose exec app npm run db:push

# Popola database con dati iniziali
docker-compose exec app npm run db:seed

# Verifica
docker-compose logs app
```

## 5️⃣ Setup Nginx Reverse Proxy

### Installa Nginx
```bash
sudo apt install -y nginx
```

### Configura sito
```bash
sudo nano /etc/nginx/sites-available/liturgia
```

Incolla:
```nginx
server {
    listen 80;
    server_name tuodominio.it www.tuodominio.it;

    location / {
        proxy_pass http://localhost:4321;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Attiva sito
```bash
sudo ln -s /etc/nginx/sites-available/liturgia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 6️⃣ Setup SSL con Certbot (HTTPS)

```bash
# Installa Certbot
sudo apt install -y certbot python3-certbot-nginx

# Ottieni certificato
sudo certbot --nginx -d tuodominio.it -d www.tuodominio.it

# Test rinnovo automatico
sudo certbot renew --dry-run
```

## 7️⃣ Setup Cron Jobs

```bash
# Rendi eseguibile
chmod +x scripts/setup-cron.sh

# Modifica path nel file
nano scripts/setup-cron.sh
# Cambia: PROJECT_PATH="/home/user/liturgia-cattolica"
# Con il tuo path reale (usa pwd per vederlo)

# Esegui setup
bash scripts/setup-cron.sh

# Verifica
crontab -l
```

## 8️⃣ Verifica Installazione

### Test funzionalità base
```bash
# Homepage
curl http://localhost:4321

# API status (se implementata)
curl http://localhost:4321/api/health

# Logs
docker-compose logs -f app
```

### Accedi al sito
```
http://tuodominio.it
```

## 🔧 Manutenzione

### Visualizza logs
```bash
# Logs app
docker-compose logs -f app

# Logs database
docker-compose logs -f postgres

# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Restart servizi
```bash
# Restart tutto
docker-compose restart

# Restart solo app
docker-compose restart app

# Restart Nginx
sudo systemctl restart nginx
```

### Update applicazione
```bash
# Pull nuove modifiche
git pull origin main

# Rebuild
docker-compose down
docker-compose build
docker-compose up -d

# Run migrations se necessario
docker-compose exec app npm run db:push
```

### Backup database
```bash
# Manuale
docker-compose exec postgres pg_dump -U liturgia_user liturgia > backup-$(date +%Y%m%d).sql

# Automatico (già configurato con cron)
# Ogni domenica alle 03:00
```

## 🐛 Troubleshooting

### App non si avvia
```bash
# Verifica logs
docker-compose logs app

# Verifica env
docker-compose exec app env | grep DATABASE

# Verifica connessione DB
docker-compose exec app node -e "const pg = require('postgres'); const sql = pg(process.env.DATABASE_URL); sql\`SELECT 1\`.then(console.log)"
```

### Database non risponde
```bash
# Verifica postgres
docker-compose exec postgres pg_isready -U liturgia_user

# Restart postgres
docker-compose restart postgres

# Verifica password
docker-compose exec postgres psql -U liturgia_user -d liturgia -c "SELECT 1"
```

### Port 4321 già in uso
```bash
# Trova processo
sudo lsof -i :4321

# Killa processo
sudo kill -9 <PID>

# O cambia porta in docker-compose.yml
```

## 📊 Monitoring

### Setup Uptime monitoring (consigliato)
- UptimeRobot: https://uptimerobot.com (free)
- Better Uptime: https://betteruptime.com

### Setup Analytics
Aggiungi Google Analytics in `src/layouts/BaseLayout.astro`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

## 🎯 Popolare Diocesi Italiane con MCP

### Setup Locale (Development)

Per popolare il database con la liturgia di tutte le 226 diocesi italiane usando il MCP server:

```bash
# 1. Assicurati che diocesi siano importate
npm run import:dioceses

# 2. Esegui script MCP (richiede MCP abilitato in VS Code)
npm run populate:dioceses

# 3. Verifica risultati
docker exec verbum-lucis-db psql -U verbum_user -d verbum_lucis \
  -c "SELECT COUNT(*) FROM liturgy;"
```

### Setup VPS (Production)

Su VPS senza MCP server VS Code, usa l'API direttamente:

```bash
# Su VPS, cron job giornaliero (già configurato):
docker compose exec app npm run update-liturgy:all

# Oppure manualmente per sincronizzare tutte le diocesi:
docker compose exec app tsx scripts/sync-all-dioceses.js
```

**Nota:** Il populate via MCP è ottimale durante sviluppo. In production, usa il cron job che sincronizza giornalmente via LitCal API.

## 🔐 Sicurezza

### Firewall
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### Fail2ban
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Updates automatici
```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## ✅ Checklist Post-Deploy

- [ ] App accessibile su dominio
- [ ] HTTPS funzionante
- [ ] Database popolato con dati
- [ ] Cron jobs configurati
- [ ] Backup automatici attivi
- [ ] Monitoring attivo
- [ ] Firewall configurato
- [ ] Logs rotazione configurata
- [ ] Admin panel accessibile
- [ ] Sitemap generata

## 🆘 Supporto

In caso di problemi:
1. Verifica logs: `docker-compose logs -f`
2. Controlla status: `docker-compose ps`
3. Test database: `docker-compose exec postgres psql -U liturgia_user -d liturgia`

---

**Deploy completato! 🎉**

Il tuo portale è ora live su: https://tuodominio.it
