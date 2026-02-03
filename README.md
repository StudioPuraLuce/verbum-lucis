# Liturgia Cattolica - Portale Spirituale

Un portale completo per liturgia quotidiana, preghiere, santi, novene e risorse spirituali cattoliche. Costruito con **Astro**, **PostgreSQL**, **Tailwind CSS** e **shadcn/ui**.

## 🚀 Setup Rapido (VPS)

### Prerequisiti
- Docker e Docker Compose installati
- Node.js 20+ (se esegui senza Docker)
- Git

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd liturgia-cattolica
```

### 2. Configurazione Ambiente
```bash
cp .env.example .env
# Modifica .env con le tue credenziali
```

### 3. Avvio con Docker (CONSIGLIATO)
```bash
# Avvia database e applicazione
docker-compose up -d

# Attendi che il database sia pronto, poi esegui migrations
docker-compose exec app npm run db:push

# Popola database con dati iniziali
docker-compose exec app npm run db:seed

# L'app sarà disponibile su http://localhost:4321
```

### 4. Setup Manuale (Senza Docker)
```bash
# Installa dipendenze
npm install

# Avvia PostgreSQL localmente o usa un database hosted
# Aggiorna DATABASE_URL in .env

# Esegui migrations
npm run db:push

# Popola database
npm run db:seed

# Development
npm run dev

# Production build
npm run build
npm run preview
```

## 📁 Struttura Progetto

```
liturgia-cattolica/
├── src/
│   ├── pages/              # Route Astro
│   │   ├── index.astro     # Homepage
│   │   ├── santi/
│   │   │   └── [slug].astro  # Pagina dinamica santo
│   │   ├── liturgia/
│   │   │   └── oggi.astro    # Liturgia del giorno
│   │   └── preghiere/
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── components/         # Componenti React (shadcn)
│   ├── styles/
│   │   └── globals.css
│   └── db/
│       ├── schema.ts       # Schema database Drizzle
│       └── index.ts        # Config e utilities
├── scripts/
│   └── seed.js            # Popolazione database
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## 🗄️ Database Schema

### Tabelle Principali:
- **saints** - Santi, beati, venerabili
- **prayers** - Preghiere di ogni tipo
- **liturgy** - Liturgia giornaliera
- **novenas** - Novene ai santi
- **angels** - Arcangeli e angeli
- **blessings** - Benedizioni
- **intentions** - Categorie di intenzioni

## 📝 Aggiungere Contenuti

### Aggiungere un Santo
```javascript
// In scripts/seed.js o tramite admin panel
await db.insert(schema.saints).values({
  nome: 'San Giuseppe',
  slug: 'san-giuseppe',
  dataFesta: '03-19',
  biografia: '...',
  patronoDi: ['Lavoratori', 'Padri di famiglia'],
  // ...
});
```

### Aggiungere una Preghiera
```javascript
await db.insert(schema.prayers).values({
  titolo: 'Preghiera del mattino',
  slug: 'preghiera-mattino',
  testo: 'Ti adoro, mio Dio...',
  categoria: 'mattino',
  // ...
});
```

## 🎨 Personalizzazione

### Colori Liturgici
I colori sono definiti in `tailwind.config.mjs`:
- Verde (Tempo Ordinario)
- Rosso (Pentecoste, Martiri)
- Bianco (Natale, Pasqua)
- Viola (Avvento, Quaresima)
- Rosa (III Domenica Avvento, IV Quaresima)

### Fonts
- **Inter** - UI e testo generale
- **Crimson Text** - Titoli e testo liturgico

## 🔌 Integrazioni API

### API Liturgia Consigliata
```javascript
// Aggiungi in src/lib/liturgy-api.ts
export async function fetchDailyLiturgy(date) {
  const response = await fetch(`https://calapi.inadiutorium.cz/api/v0/it/calendars/default/${date}`);
  return response.json();
}
```

### Cron Job per Aggiornamenti Automatici
```bash
# Crontab per aggiornare liturgia ogni giorno alle 00:01
1 0 * * * cd /path/to/app && npm run update-liturgy
```

## 📈 SEO e Performance

### Sitemap Automatica
La sitemap viene generata automaticamente con `@astrojs/sitemap`

### Meta Tags
Ogni pagina ha meta tags ottimizzati per SEO e social sharing

### Schema.org
Markup strutturato per:
- Santi (Person)
- Preghiere (CreativeWork)
- Eventi liturgici (Event)

## 🚀 Deploy

### VPS/Server Dedicato
```bash
# Pull latest
git pull

# Rebuild
docker-compose down
docker-compose up -d --build
```

### Con Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name tuosito.it;
    
    location / {
        proxy_pass http://localhost:4321;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📊 Metriche e Analytics

Aggiungi Google Analytics in `BaseLayout.astro`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
```

## 🛠️ Sviluppo

### Aggiungere Nuove Pagine Programmatiche
```astro
---
// src/pages/benedizioni/[slug].astro
export async function getStaticPaths() {
  const benedizioni = await db.query.blessings.findMany();
  return benedizioni.map(b => ({
    params: { slug: b.slug },
    props: { benedizione: b }
  }));
}
---
```

### Componenti shadcn
```bash
# Aggiungi componenti secondo necessità
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
```

## 📞 Supporto

Per domande o problemi:
- Email: info@liturgiacattolica.it
- GitHub Issues: [link]

## 📜 Licenza

Questo progetto rispetta i diritti d'autore dei testi liturgici ufficiali della CEI. 

---

**Costruito con ❤️ e 🙏 per la comunità cattolica italiana**