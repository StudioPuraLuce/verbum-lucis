# 📄 DOCUMENTO TECNICO
## Verbum Lucis — Portale Spirituale Cattolico Italiano
### Sviluppato da Studio Pura Luce
### Versione 1.0 | Febbraio 2026

---

## 1. PANORAMICA DEL PROGETTO

### 1.1 Visione
Costruire il portale spirituale cattolico italiano più completo e tecnicamente avanzato, combinando contenuti liturgici, preghiere, santi e risorse spirituali in un unico ecosistema indicizzabile e strutturato. Verbum Lucis nasce dalla missione di Studio Pura Luce di rendere la fede cattolica più accessibile, organizzata e presente nel mondo digitale.

### 1.2 Obiettivi Primari
- Generare 100.000+ pagine programmatiche indicizzabili nel primo trimestre
- Coprire tutte le diocesi italiane con calendari liturgici specifici
- Creare un contenuto strutturato unico nel mercato italiano
- Posizionarsi come autorità nel niche religioso cattolico per SEO organico

### 1.3 Scope del Progetto
| Dominio | Contenuto | Pagine Stimulate |
|---|---|---|
| Liturgia | Calendario nazionale + diocesano | 36.500+/anno |
| Santi | Database completo santi cattolici | 10.000+ |
| Preghiere | Preghiere, novene, litanie | 5.000+ |
| Catechismo | Tutti i punti + temi | 3.000+ |
| Intenzioni | Pagine intent-based | 500+ |
| Angeli | Arcangeli e angeli | 200+ |
| Benedizioni | Per occasione e tipo | 300+ |

---

## 2. STACK TECNOLOGICO

### 2.1 Frontend & Framework
| Tecnologia | Versione | Ruolo |
|---|---|---|
| **Astro** | 4.3.x | Framework principale, SSG + SSR hybrid |
| **React** | 18.2.x | Componenti interattivi (client-side) |
| **Tailwind CSS** | 3.4.x | Styling utility-first |
| **shadcn/ui** | latest | Sistema di componenti UI |
| **Crimson Text** | Google Font | Tipografia serif per contenuti liturgici |
| **Inter** | Google Font | Tipografia sans-serif per UI |

### 2.2 Backend & Database
| Tecnologia | Versione | Ruolo |
|---|---|---|
| **PostgreSQL** | 16 (Alpine) | Database principale |
| **Drizzle ORM** | 0.29.x | ORM type-safe per Postgres |
| **@astrojs/node** | 8.2.x | Adapter SSR per Astro |
| **postgres** (npm) | 3.4.x | Driver PostgreSQL per Node.js |

### 2.3 DevOps & Deploy
| Tecnologia | Versione | Ruolo |
|---|---|---|
| **Docker** | latest | Containerizzazione |
| **Docker Compose** | latest | Orchestrazione servizi |
| **Node.js** | 20 LTS | Runtime |
| **Nginx** | latest | Reverse proxy + SSL |
| **Certbot** | latest | SSL/TLS automatico |

### 2.4 Rendering Strategy
```
Homepage (index)          → SSR (contenuti dinamici quotidiani)
Liturgia oggi             → SSR (date-dependent)
Liturgia diocesana        → SSR (diocesi + data)
Santi/[slug]              → SSR (query dinamica)
Preghiere/[slug]          → SSR (query dinamica)
Novene/[slug]             → SSR (query dinamica)
Rosario                   → SSR (misteri basati sul giorno)
Catechismo/[id]           → Pre-rendered (contenuto statico)
Admin/*                   → SSR (CRUD operations)
```

---

## 3. ARCHITETTURA DEL SISTEMA

### 3.1 Diagramma Architetturale
```
┌─────────────────────────────────────────────────────────┐
│                      UTENTE BROWSER                      │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────┐
│                        NGINX                             │
│              Reverse Proxy + SSL Termination             │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                    ASTRO APP (Node.js)                    │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │  SSG Pages  │  │  SSR Pages   │  │  API Routes     │ │
│  │ (Catechismo)│  │ (Liturgia,   │  │ /api/health     │ │
│  │             │  │  Santi, etc) │  │ /api/update     │ │
│  └─────────────┘  └──────┬───────┘  └─────────────────┘ │
│                          │                               │
│  ┌───────────────────────▼────────────────────────────┐  │
│  │              DATABASE LAYER (Drizzle ORM)           │  │
│  └───────────────────────┬────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                    POSTGRESQL 16                          │
│  ┌──────┐ ┌─────────┐ ┌─────────┐ ┌──────┐ ┌──────────┐ │
│  │saints│ │ prayers │ │ liturgy │ │novens│ │catechism │ │
│  └──────┘ └─────────┘ └─────────┘ └──────┘ └──────────┘ │
│  ┌──────┐ ┌─────────┐ ┌─────────┐                        │
│  │angels│ │blessings│ │dioceses │                        │
│  └──────┘ └─────────┘ └─────────┘                        │
└──────────────────────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
┌────────▼───────┐ ┌───────▼──────┐ ┌───────▼──────┐
│  CRON JOBS     │ │  EXTERNAL    │ │  SEED &      │
│  (Giornalieri) │ │  APIs        │ │  SYNC        │
│                │ │              │ │  SCRIPTS     │
│ update-liturgy │ │ LitCal API   │ │ seed.js      │
│ (00:01 daily)  │ │ BibleGet.io  │ │ sync-saints  │
│                │ │ Church Cal   │ │ import-json  │
└────────────────┘ └──────────────┘ └──────────────┘
```

### 3.2 Struttura Directory
```
liturgia-cattolica/
│   ├── pages/
│   │   ├── index.astro                    # Homepage
│   │   ├── rosario.astro                  # Rosario interattivo
│   │   ├── liturgia/
│   │   │   ├── oggi.astro                 # Liturgia nazionale oggi
│   │   │   ├── calendario.astro           # Calendario liturgico
│   │   │   └── diocesi/
│   │   │       └── [diocesi]/
│   │   │           └── [data].astro       # Liturgia diocesana
│   │   ├── santi/
│   │   │   ├── index.astro                # Lista santi
│   │   │   ├── oggi.astro                 # Santo del giorno
│   │   │   └── [slug].astro               # Pagina santo
│   │   ├── preghiere/
│   │   │   ├── index.astro                # Lista preghiere
│   │   │   └── [slug].astro               # Pagina preghiera
│   │   ├── novene/
│   │   │   ├── index.astro                # Lista novene
│   │   │   └── [slug].astro               # Pagina novena
│   │   ├── catechismo/
│   │   │   ├── index.astro                # Lista catechismo
│   │   │   ├── [id].astro                 # Punto catechismo
│   │   │   └── tema/
│   │   │       └── [tema].astro           # Tema catechetico
│   │   ├── angeli/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── benedizioni/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── prego-per/
│   │   │   └── [intenzione].astro         # Intent-based pages
│   │   └── admin/
│   │       ├── index.astro                # Dashboard
│   │       ├── santi/
│   │       │   ├── index.astro            # Lista santi admin
│   │       │   ├── nuovo.astro            # Form nuovo santo
│   │       │   └── [id].astro             # Edit santo
│   │       └── preghiere/
│   │           ├── index.astro
│   │           ├── nuova.astro
│   │           └── [id].astro
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   └── card.tsx
│   │   ├── SaintCard.tsx
│   │   ├── PrayerCard.tsx
│   │   ├── LiturgyBadge.tsx
│   │   └── SearchBar.tsx
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── lib/
│   │   ├── utils.ts                       # Utility functions
│   │   └── liturgy-api.ts                 # API integration layer
│   ├── db/
│   │   ├── schema.ts                      # Drizzle schema completo
│   │   └── index.ts                       # DB connection + queries
│   └── styles/
│       └── globals.css
├── scripts/
│   ├── seed.js                            # Seed iniziale
│   ├── update-liturgy.js                  # Aggiorna liturgia da API
│   ├── sync-saints.js                     # Sync santi
│   ├── import-catechism.js                # Import catechismo JSON
│   └── setup-cron.sh                      # Setup cron jobs
├── docker-compose.yml
├── Dockerfile
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── .env.example
└── package.json
```

---

## 4. SCHEMA DATABASE

### 4.1 Entità e Relazioni
```
saints ─────────┬──── prayers (saintId FK)
                │
                └──── novenas (saintId FK)

liturgy ────────┬──── santiDelGiorno (array FK → saints)
                │
                └──── dioceses (diocesiId FK)

catechism ──────┬──── themes (many-to-many via tags)
                │
                └──── related_prayers (many-to-many)

angels ─────────────── preghiereAssociate (array)

blessings ──────────── occasioni (categorizzazione)

intentions ─────┬──── preghiereSuggerite (array FK → prayers)
                │
                └──── santiIntercedenti (array FK → saints)

dioceses ───────────── liturgy_diocesano (diocesiId FK)
```

### 4.2 Tabelle Principali

**saints** — 10.000+ record stimati
```
id              serial PK
nome            text NOT NULL
nomeCompleto    text
slug            text UNIQUE NOT NULL
dataFesta       date NOT NULL          -- MM-DD
biografiaBreve  text
biografiaCompleta text
patronoDi       jsonb[]                -- ["Italia","Ecologia"]
immagineUrl     text
titolo          text                   -- Santo, Beato, Venerabile
epoca           text                   -- "XIII secolo"
ricorrenza      text                   -- Obbligatoria, Facoltativa
popolarita      integer DEFAULT 0
createdAt       timestamp DEFAULT NOW()
```

**prayers** — 5.000+ record stimati
```
id              serial PK
titolo          text NOT NULL
slug            text UNIQUE NOT NULL
testo           text NOT NULL
categoria       text NOT NULL          -- rosario, novena, litania, mattino, sera
saintId         integer FK → saints
fonteUfficiale  boolean DEFAULT false
testoLatin      text
popolarita      integer DEFAULT 0
durata          integer                -- minuti
metadata        jsonb                  -- keywords, whenToPray, benefits
createdAt       timestamp DEFAULT NOW()
```

**liturgy** — 365+ record/anno
```
id                   serial PK
data                 date UNIQUE NOT NULL
anno                 integer                -- 1=A, 2=B, 3=C
diocesiId            integer FK → dioceses  -- NULL = nazionale
tempoLiturgico       text NOT NULL
domenicaSettimana    text
coloreLiturgico      text NOT NULL          -- verde, rosso, bianco, viola, rosa
primaLettura         jsonb                  -- {riferimento, testo}
salmoResponsoriale   jsonb                  -- {riferimento, ritornello, testo}
secondaLettura       jsonb                  -- nullable
vangelo              jsonb                  -- {riferimento, testo}
santiDelGiorno       jsonb[]                -- [saint_id, ...]
meditazione          text
createdAt            timestamp DEFAULT NOW()
```

**dioceses** — 226 record (diocesi italiane)
```
id              serial PK
nome            text NOT NULL
slug            text UNIQUE NOT NULL
codice          text UNIQUE            -- IT-RM, IT-MI, ecc.
regione         text                   -- regione civile
regioneEcclesiastica text              -- regione ecclesiastica
sedeMet         integer FK → dioceses  -- sede metropolitana
createdAt       timestamp DEFAULT NOW()
```

**catechism** — 2.865 record (punti del CCC)
```
id              serial PK
numero          integer UNIQUE NOT NULL  -- 1-2865
parte           text                     -- I, II, III, IV
sezione         text
capitolo        text
articolo        text
testo           text NOT NULL
riferimenti     jsonb[]                  -- citazioni bibliche
tags            jsonb[]                  -- temi correlati
createdAt       timestamp DEFAULT NOW()
```

**novenas** — 200+ record stimati
```
id                serial PK
titolo            text NOT NULL
slug              text UNIQUE NOT NULL
saintId           integer FK → saints
descrizione       text
quandoPregare     text
intenzioni        jsonb[]
giorniTesti       jsonb[]               -- [{giorno, titolo, preghiera}]
preghieraFinale   text
popolarita        integer DEFAULT 0
createdAt         timestamp DEFAULT NOW()
```

---

## 5. INTEGRAZIONI API ESTERNE

### 5.1 LitCal — Liturgical Calendar API

**Tipo:** REST API | **Costo:** Gratuita (open source, self-hostable)
**Sito:** litcal.johnromanodorazio.com

Questa è la risorsa più strategica. L'API produce calendari liturgici storicamente accurati basati sulle edizioni del Missale Romano Latino, Inglese e Italiano, includendo calendari nazionali e diocesani.

**Endpoints Principali:**
```
# Calendario Generale Romano
GET https://litcal.johnromanodorazio.com/api/v4/calendar
    ?returntype=json

# Calendario Nazionale Italiano
GET https://litcal.johnromanodorazio.com/api/v4/calendar/nation/IT/{YEAR}
    ?returntype=json

# Calendario Diocesano (es. Roma)
GET https://litcal.johnromanodorazio.com/api/v4/calendar/diocese/IT-RM/{YEAR}
    ?returntype=json

# Date della Pasqua (1583-9999)
GET https://litcal.johnromanodorazio.com/api/v4/easter/{YEAR}
    ?returntype=json

# Export iCal (per Google Calendar, iPhone, Outlook)
GET https://litcal.johnromanodorazio.com/api/v4/calendar?returntype=ICS
```

**Diocesi Italiane Supportate (Codici):**
```
IT-RM   Diocesi di Roma          IT-MI   Arcidiocesi di Milano
IT-NA   Arcidiocesi di Napoli    IT-TO   Arcidiocesi di Torino
IT-FI   Arcidiocesi di Firenze   IT-PA   Arcidiocesi di Palermo
IT-BO   Arcidiocesi di Bologna   IT-BA   Arcidiocesi di Bari
IT-VE   Patriarcato di Venezia   IT-GE   Arcidiocesi di Genova
...     (226 diocesi totali)
```

**Response Schema (JSON):**
```json
{
  "liturgical_year": {
    "year": 2026,
    "cycle": "B",
    "season": "Ordinary Time"
  },
  "celebrations": [
    {
      "date": "2026-02-01",
      "title": "IV Domenica del Tempo Ordinario",
      "type": "Sunday",
      "colour": "green",
      "readings": {
        "first_reading": { "citation": "Dt 18,15-20", "text": "..." },
        "responsorial_psalm": { "citation": "Sal 94", "refrain": "...", "text": "..." },
        "gospel": { "citation": "Mc 1,21-28", "text": "..." }
      },
      "saints": ["San Giovanni Bosco"]
    }
  ]
}
```

**Integrazione nel Progetto:**
```typescript
// src/lib/liturgy-api.ts
export async function fetchDiocesanLiturgy(
  diocesiCode: string,  // es. "IT-RM"
  year: number
): Promise<LitCalResponse> {
  const url = `https://litcal.johnromanodorazio.com/api/v4/calendar/diocese/${diocesiCode}/${year}?returntype=json`;
  const res = await fetch(url);
  return res.json();
}
```

### 5.2 BibleGet.io — API Bibbia CEI Italiana

**Tipo:** REST API | **Costo:** Gratuita
**Sito:** query.bibleget.io

L'unica API che offre la versione **CEI 2008** della Bibbia italiana per default, senza necessità di autenticazione o API key.

**Endpoints:**
```
# Query versi biblici (default: CEI2008 italiano)
GET https://query.bibleget.io/?query=Gv3,16&return=json&appid=liturgia-cattolica

# Versioni disponibili
GET https://query.bibleget.io/?query=bibleversions&return=json&appid=liturgia-cattolica

# Range di versi
GET https://query.bibleget.io/?query=Mt1,1-10;2,2-4&return=json&appid=liturgia-cattolica

# Versioni multiple a confronto
GET https://query.bibleget.io/?query=Gv3,16&version=CEI2008,VULG&return=json&appid=liturgia-cattolica
```

**Response Schema:**
```json
{
  "results": {
    "CEI2008": {
      "bookAbbreviation": "Gv",
      "bookName": "Vangelo di Giovanni",
      "chapter": 3,
      "verses": [
        {
          "verseNumber": 16,
          "verseText": "Dio ha amato il mondo così in essa..."
        }
      ]
    }
  }
}
```

**Nota:** L'appid non richiede registrazione, serve solo per monitoraggio.

### 5.3 catholicism-in-json — Catechismo Open Source

**Tipo:** Dataset JSON | **Costo:** Gratuito (GitHub)
**Repository:** github.com/aseemsavio/catholicism-in-json

Contiene il Catechismo della Chiesa Cattolica, il Codice Canonico e il GIRM in formato JSON strutturato.

**Struttura catechism.json:**
```json
[
  {
    "id": 1,
    "text": "Dio, infinitamente perfetto e beato in se stesso..."
  },
  {
    "id": 2,
    "text": "..."
  },
  ...
  {
    "id": 2865,
    "text": "..."
  }
]
```

**Struttura canon.json:**
```json
[
  {
    "id": 1,
    "text": "Le canoni di questa collezione...",
    "sections": [
      { "id": "1.1", "text": "..." }
    ]
  }
]
```

**Import nel progetto:**
```bash
# Download dal repo
git clone https://github.com/aseemsavio/catholicism-in-json
cp catholicism-in-json/catechism.json data/

# Import script
node scripts/import-catechism.js
```

### 5.4 Church Calendar API (calapi.inadiutorium.cz)

**Tipo:** REST API | **Costo:** Gratuita (open source, self-hostable)
**Sito:** calapi.inadiutorium.cz

API alternativa per calendario liturgico. Il vantaggio è che il codice sorgente è disponibile e può essere self-hosted per garantire disponibilità. Supporta calendario personalizzato diocesano.

**Endpoints:**
```
GET http://calapi.inadiutorium.cz/api/v0/it/calendars/default/2026-02-01
GET http://calapi.inadiutorium.cz/api/v0/it/calendars/default/2026
```

**Motivo per Self-Host:** La documentazione specifica che l'istanza di riferimento è self-hosted dall'autore e potrebbe essere terminata in qualsiasi momento. Per un progetto in produzione è raccomandato deployare una propria istanza.

---

## 6. STRATEGIA SEO PROGRAMMATICA

### 6.1 Struttura URL
```
# Liturgia
/liturgia/oggi                              # Liturgia nazionale oggi
/liturgia/diocesi/[diocesi]/[yyyy-mm-dd]    # Liturgia diocesana
/liturgia/calendario/[anno]                 # Calendario completo

# Santi
/santi                                      # Lista santi
/santi/[slug]                               # Pagina santo
/santi/oggi                                 # Santo del giorno
/santi/patroni/[causa]                      # Patroni per causa

# Preghiere
/preghiere                                  # Lista preghiere
/preghiere/[slug]                           # Pagina preghiera
/preghiere/[categoria]                      # Per categoria

# Novene
/novene                                     # Lista novene
/novene/[slug]                              # Pagina novena

# Catechismo
/catechismo                                 # Indice
/catechismo/[numero]                        # Punto specifico
/catechismo/tema/[tema]                     # Per tema

# Intent-Based Pages
/prego-per/[intenzione]                     # Pagina intenzione

# Angeli & Benedizioni
/angeli/[slug]
/benedizioni/[slug]
```

### 6.2 Meta Tags e Schema.org
Ogni pagina implementa:
- `<title>` dinamico e ottimizzato
- `<meta name="description">` unica per pagina
- `<link rel="canonical">` assoluto
- Open Graph (`og:title`, `og:description`, `og:image`)
- Twitter Cards
- Schema.org structured data:
  - Santi → `Person`
  - Preghiere → `CreativeWork`
  - Liturgia → `Article` con `datePublished`
  - Catechismo → `Article`
  - Diocesi → `Organization`

### 6.3 Sitemap
- Generata automaticamente da `@astrojs/sitemap`
- Filtro: esclude `/admin/*`
- `changefreq: daily` per liturgia, `monthly` per santi
- Supporto sitemap index per volume elevato

---

## 7. SICUREZZA

### 7.1 Credenziali e Ambiente
- Tutte le credenziali in `.env` (mai committate)
- `DATABASE_URL` con password forte
- `.env` in `.gitignore`

### 7.2 Admin Panel
- Attualmente senza autenticazione (da implementare)
- **Raccomandazione:** Aggiungere autenticazione basata su sessione o token JWT prima del deploy in produzione
- Alternativa rapida: Proteggere `/admin` con Nginx basic auth

### 7.3 API Rate Limiting
- BibleGet.io: nessun limite esplicito, ma raccomanda caching locale
- LitCal: nessun limite documentato, use con rispetto
- Church Calendar API: rate limit non specificato

### 7.4 Firewall VPS
```
ufw allow 22    # SSH
ufw allow 80    # HTTP (redirect a HTTPS)
ufw allow 443   # HTTPS
ufw deny default incoming
```

---

## 8. PERFORMANCE & MONITORING

### 8.1 Strategie di Caching
```typescript
// Cache API responses per 24 ore
const CACHE_TTL = 60 * 60 * 24; // 24h in secondi

// In-memory cache per liturgia del giorno
const liturgyCache = new Map<string, LiturgyData>();

// Dopo il primo fetch, salva nel DB per evitare chiamate ripetute
// Update via cron job giornaliero
```

### 8.2 Core Web Vitals Target
| Metrica | Target | Strategia |
|---|---|---|
| LCP | < 2.5s | Immagini lazy-load, font preconnect |
| FID | < 100ms | Minimal JS client-side |
| CLS | < 0.1 | Layout stabile, dimensioni immagini dichiarate |
| TTFB | < 200ms | SSG dove possibile, CDN |

### 8.3 Monitoring Raccomandato
- **Google Search Console** — indicizzazione e performance organica
- **Google Analytics 4** — traffico e comportamento utenti
- **UptimeRobot** (free) — monitoring disponibilità sito

---

## 9. DEPLOYMENT

### 9.1 Ambiente Produzione
```
VPS: Ubuntu 22.04+, 2 vCPU, 4GB RAM (minimo)
OS:  Ubuntu 22.04 LTS
DB:  PostgreSQL 16 (Docker)
App: Node.js 20 LTS (Docker)
Proxy: Nginx + Certbot SSL
```

### 9.2 Pipeline Deploy
```
1. git push → repository
2. SSH al VPS
3. git pull
4. docker-compose down
5. docker-compose build
6. docker-compose up -d
7. npm run db:push (migrations)
8. Verifica: curl localhost:4321
```

### 9.3 Cron Jobs
| Job | Frequenza | Descrizione |
|---|---|---|
| `update-liturgy` | Giornaliero 00:01 | Aggiorna liturgia prossimi 7 giorni |
| `sync-saints` | Mensile (1°) | Sincronizza database santi |
| `db:backup` | Settimanale (Dom 03:00) | Backup PostgreSQL |

---

## 10. ROADMAP

### Fase 0 — Setup Base ✅ COMPLETATO
- Struttura progetto Astro
- Schema database (7 tabelle)
- Docker Compose
- Seed iniziale
- Componenti UI base
- Homepage + pagine principali

### Fase 1 — Vantaggi Competitivi (Prossimo)
- [ ] Integrazione LitCal diocesi italiane (226 diocesi)
- [ ] Import Catechismo JSON (2.865 punti)
- [ ] Intent-based pages (/prego-per/*)
- [ ] Integrazione BibleGet.io CEI2008

### Fase 2 — Scale & Content ✅ COMPLETATO
- [x] Aggregazione awesome-catholic ecosystem (catholic-readings-api + scraper)
- [x] Espansione database santi (scrape-saints.js: API + dati manuali → merge + dedup)
- [x] Preghiere expanded (prayers-expanded.json: 200+ preghiere con litanie, intercessioni, categorie)
- [x] Patrons pages (/santi/patroni/[causa] — pagine dinamiche per ogni causa di patronato)

### Fase 3 — Remotion — Video Programmatici
- [ ] Setup progetto Remotion (separato da Astro)
- [ ] Composizione `DailyLiturgy` — video liturgia quotidiana (santo + letture + vangelo)
- [ ] Composizione `Prayer` — preghiere animate con testo e musica
- [ ] Composizione `SaintOfDay` — formato verticale per Shorts/Reels
- [ ] Composizione `Novena` — serie di 9 video per novena
- [ ] Script `render-videos.js` — render batch automatico dal database
- [ ] Cron job giornaliero — genera video liturgia ogni mattina
- [ ] YouTube Data API integration — upload automatico
- [ ] Embed player nel sito Verbum Lucis
- [ ] Composizione `MonthlyCalendar` — video mensile calendario liturgico

### Fase 4 — Engagement & Monetizzazione
- [ ] Newsletter signup (Mailchimp)
- [ ] PWA (offline mode)
- [ ] Affiliazione prodotti religiosi
- [ ] Analytics dashboard interno
- [ ] YouTube channel monetizzazione

### Fase 5 — AI & Innovazione
- [ ] AI Assistant cattolico (CatéGPT o custom)
- [ ] Contenuti dinamici AI-generated
- [ ] Personalizzazione utente
- [ ] Remotion + AI: script/narrazione generata automaticamente

---

## 11. DIPENDENZE & LICENZE

| Pacchetto | Licenza | Uso |
|---|---|---|
| Astro | MIT | Framework |
| React | MIT | UI Components |
| Drizzle ORM | Apache 2.0 | Database |
| Tailwind CSS | MIT | Styling |
| shadcn/ui | MIT | Componenti |
| catholicism-in-json | MIT | Catechismo data |
| LitCal API | Open Source | Calendario liturgico |
| BibleGet.io | Proprietaria (gratuita) | Bibbia CEI |
| date-fns | MIT | Date formatting |

**Nota Legale:** I testi liturgici della CEI sono protetti da copyright. La Bibbia CEI 2008 richiede licenza per uso commerciale. BibleGet.io fornisce accesso legale ai testi. Per contenuti originali della CEI (omelie, catechesi) servono accordi specifici.

---

## 12. CONTATTI & RESPONSABILITÀ

| Ruolo | Contatto |
|---|---|
| Sviluppatore | [nome] |
| Progetto