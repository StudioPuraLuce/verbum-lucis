# 🎥 ANALISI — Remotion in Verbum Lucis
## Studio Pura Luce | Febbraio 2026

---

## 1. COSA È REMOTION (BREVE)

Remotion è un framework React che genera video MP4 programmaticamente. Ogni frame è un componente React. Instead of editing timelines visually, scrivi codice. Output: video reali (.mp4, .webm, .gif).

Under the hood: React → Puppeteer (screenshot frame per frame) → FFmpeg (stitching + audio) → MP4.

---

## 2. LICENZA & COSTI

| Scenario | Costo |
|---|---|
| Individuo o piccola azienda | **Gratuito** (anche uso commerciale) |
| Azienda con team 4+ persone | Company License richiesta |
| Company License | ~$25/mese per developer, min $100/mese |
| Remotion Lambda (AWS) | Costo AWS variabile (~$0.01-0.05 per minuto di video) |

**Per Studio Pura Luce:** Se siete ancora un team piccolo (< 4 persone), Remotion è **completamente gratuito**, anche per uso commerciale e cloud rendering.

---

## 3. DOVE SI INSERISCE NEL PROGETTO

Qui è dove diventa interessante. Verbum Lucis ha una struttura che si presta perfettamente a contenuti video programmatici. Analizziamo i use case concreti, ordinati per impatto strategico.

---

### 🔴 USE CASE 1: Video Liturgici Quotidiani (Alto Impatto SEO)

**Idea:** Genera automaticamente un video giornaliero con le letture della liturgia, il santo del giorno, il colore liturgico.

**Perché funziona per Verbum Lucis:**
- Ogni giorno hai già i dati nel database (liturgia, santi, letture)
- Un video giornaliero genera contenuto unico per YouTube/Social
- YouTube è il secondo motore di ricerca del mondo
- Nessun altro portale cattolico italiano lo fa automaticamente

**Come funziona tecnicamente:**
```
Database Verbum Lucis
        │
        ▼
  Script giornaliero (cron 00:05)
        │
        ▼
  Remotion Component
  ┌─────────────────────────┐
  │  Frame 0-90:            │
  │    Logo Verbum Lucis    │
  │                         │
  │  Frame 90-300:          │
  │    Santo del Giorno     │
  │    Nome + Immagine      │
  │    Festa: dd/mm         │
  │                         │
  │  Frame 300-600:         │
  │    Prima Lettura        │
  │    Riferimento + testo  │
  │                         │
  │  Frame 600-900:         │
  │    Vangelo              │
  │    Riferimento + testo  │
  │                         │
  │  Frame 900-1050:        │
  │    Outro + Logo         │
  └─────────────────────────┘
        │
        ▼
  Render → liturgia-2026-02-01.mp4
        │
        ▼
  Upload automatico YouTube API
        │
        ▼
  Embed nel sito /liturgia/oggi
```

**Risultato:** Un video unico ogni giorno, indicizzato su YouTube, embedda nel sito.

---

### 🔴 USE CASE 2: Preghiere Animate (Contenuto Social)

**Idea:** Genera video animati delle preghiere con testo che scorre, musica di sfondo, animazioni tipografiche.

**Perché funziona:**
- Le preghiere sono già nel database
- Il formato "preghiera con testo animato" performa molto bene su Instagram/Facebook/YouTube Shorts
- Contenuto infinito: ogni preghiera = un video
- Alto engagement: persone guardano e condividono

**Esempio output:**
```
┌─────────────────────┐
│                     │  ← Sfondo gradiente (colore liturgico)
│   ✝ Ave Maria       │  ← Titolo con fade-in
│                     │
│  "Ave, o Maria,     │  ← Testo che appare
│   piena di grazia,  │     parola per parola
│   il Signore è      │     con musica piano
│   con te..."        │     cattolica di sfondo
│                     │
│  [Verbum Lucis]     │  ← Watermark/branding
└─────────────────────┘
```

**Scale:** Con 5.000 preghiere nel database = 5.000 video generabili automaticamente.

---

### 🟠 USE CASE 3: Novene — Serie di 9 Video

**Idea:** Ogni novena diventa una serie di 9 video (1 per giorno), generati tutti in batch.

**Perché funziona:**
- Serie di contenuti = alto engagement su YouTube (playlist)
- SEO: "Novena a Santa Rita giorno 1", "giorno 2" ecc. = long-tail keywords
- Le persone cercano esattamente questo tipo di contenuto
- Autocontained: ogni novena è un contenuto completo

---

### 🟠 USE CASE 4: Santo del Giorno — Shorts/Reels

**Idea:** Video corti (30-60 secondi) sul santo del giorno. formato verticale per Shorts/Reels.

**Output:**
```
Formato: 1080x1920 (vertical)
Durata: 30-45 secondi
Contenuto:
  - Nome santo (animato)
  - Immagine santo
  - 3 facts sulla sua vita
  - Data festa
  - Branding Verbum Lucis
```

**Why:** YouTube Shorts e Instagram Reels hanno algoritmi che amplificano contenuti nuovi. Un nuovo video ogni giorno = reach organico costante.

---

### 🟡 USE CASE 5: Calendario Liturgico — Video Mensili

**Idea:** Video mensili che mostrano il calendario liturgico, i santi principali, i tempi liturgici.

**Audience:** Famiglie cattoliche che cercano un overview mensile.

---

## 4. ARCHITETTURA TECNICA — COME INTEGRARE

### 4.1 Struttura nel Progetto
```
verbum-lucis/
├── src/                          # App principale (Astro)
├── remotion/                     # ← NUOVO: Remotion separato
│   ├── src/
│   │   ├── Root.tsx              # Registra le composizioni
│   │   ├── compositions/
│   │   │   ├── DailyLiturgy.tsx  # Video liturgia quotidiana
│   │   │   ├── Prayer.tsx        # Video preghiera animata
│   │   │   ├── Novena.tsx        # Video novena (giorno X)
│   │   │   └── SaintOfDay.tsx    # Santo del giorno (Shorts)
│   │   └── components/
│   │       ├── TextReveal.tsx    # Animazione testo
│   │       ├── FadeIn.tsx        # Fade in/out
│   │       └── BrandingOverlay.tsx
│   ├── package.json
│   └── remotion.config.ts
├── scripts/
│   └── render-videos.js          # ← Script per render batch
└── ...
```

### 4.2 Pipeline di Generazione
```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│  Cron Job    │────▶│  render-     │────▶│  Remotion        │
│  (giornaliero│     │  videos.js   │     │  renderMedia()   │
│   o on-demand│     │              │     │                  │
│  )           │     │  Legge DB    │     │  Genera MP4      │
└──────────────┘     │  Prepara     │     └────────┬─────────┘
                     │  props       │              │
                     └──────────────┘              ▼
                                          ┌──────────────────┐
                                          │  Output          │
                                          │  /videos/*.mp4   │
                                          │                  │
                                          │  → YouTube API   │
                                          │  → Embed nel sito│
                                          └──────────────────┘
```

### 4.3 Codice Esempio — DailyLiturgy.tsx
```tsx
import { useCurrentFrame, interpolate, Sequence } from 'remotion';

interface DailyLiturgyProps {
  santo: { nome: string; immagineUrl: string };
  liturgia: {
    domenicaSettimana: string;
    coloreLiturgico: string;
    primaLettura: { riferimento: string };
    vangelo: { riferimento: string };
  };
  data: string;
}

export const DailyLiturgy = ({ santo, liturgia, data }: DailyLiturgyProps) => {
  const frame = useCurrentFrame();

  const bgColors = {
    verde: '#2d5016',
    rosso: '#8b0000',
    bianco: '#1a1a2e',  // dark mode per video
    viola: '#5d3a8f',
    rosa: '#c2185b',
  };

  const bg = bgColors[liturgia.coloreLiturgico] || bgColors.verde;

  return (
    <div style={{
      flex: 1,
      backgroundColor: bg,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 60,
      fontFamily: 'serif',
    }}>
      {/* Logo/Branding */}
      <Sequence from={0} to={90}>
        <BrandingIntro />
      </Sequence>

      {/* Santo del Giorno */}
      <Sequence from={90} to={300}>
        <SaintSection santo={santo} />
      </Sequence>

      {/* Prima Lettura */}
      <Sequence from={300} to={600}>
        <ReadingSection lettura={liturgia.primaLettura} tipo="Prima Lettura" />
      </Sequence>

      {/* Vangelo */}
      <Sequence from={600} to={900}>
        <ReadingSection lettura={liturgia.vangelo} tipo="Santo Vangelo" />
      </Sequence>

      {/* Outro */}
      <Sequence from={900} to={1050}>
        <OutroSection />
      </Sequence>
    </div>
  );
};
```

### 4.4 Script Render
```javascript
// scripts/render-videos.js
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { db } from '../src/db/index.js';

async function renderDailyVideo(date) {
  // 1. Fetch data dal database
  const liturgia = await db.query.liturgy.findFirst({
    where: (l, { eq }) => eq(l.data, date),
  });

  const santo = await db.query.saints.findFirst({
    where: (s, { eq }) => eq(s.id, liturgia.santiDelGiorno[0]),
  });

  // 2. Bundle Remotion
  const bundleLocation = await bundle({
    entrypoint: './remotion/src/index.ts',
  });

  // 3. Seleziona composizione
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'DailyLiturgy',
  });

  // 4. Render video
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    outputLocation: `./public/videos/liturgia-${date}.mp4`,
    inputProps: {
      santo,
      liturgia,
      data: date,
    },
  });

  console.log(`✅ Video generato: liturgia-${date}.mp4`);
}

// Esegui per oggi
const today = new Date().toISOString().split('T')[0];
renderDailyVideo(today);
```

---

## 5. COSTI & RISORSE

### 5.1 Rendering Locale (VPS)
| Risorsa | Requisito |
|---|---|
| CPU | 2+ core (rendering è CPU-intensive) |
| RAM | 4GB+ |
| Tempo render | ~30-60 sec per video di 30 sec |
| Storage | ~50MB per video |

**Con il VPS attuale (2 vCPU, 4GB):** puoi renderare 1-2 video al giorno senza problemi. Per batch enormi serve più potenza.

### 5.2 Rendering Cloud (Remotion Lambda)
Se il volume cresce, Remotion Lambda usa AWS Lambda per renderare in parallelo.
- Costo stimato: ~$0.01-0.05 per minuto di video
- 1 video da 1 minuto = ~$0.05
- 365 video/anno = ~$18/anno

### 5.3 Licenza Remotion
Per Studio Pura Luce (team piccolo): **gratuito**.
Se il team cresce a 4+ persone: Company License da ~$100/mese.

---

## 6. VANTAGGI COMPETITIVI CHE GENERA

| Vantaggio | Come |
|---|---|
| **YouTube SEO** | Video unici giornalieri indicizzati dal secondo motore di ricerca |
| **Social Media automatizzato** | Shorts/Reels generati automaticamente dal DB |
| **Differenziazione** | Nessun altro portale cattolico italiano genera video programmatici |
| **Contenuto infinito** | 5.000 preghiere + 365 liturgie + novene = migliaia di video |
| **Brand awareness** | Ogni video ha branding Verbum Lucis / Studio Pura Luce |
| **Engagement** | Video performa sempre meglio di testo per engagement |

---

## 7. QUANDO IMPLEMENTARE

| Fase | Cosa | Quando |
|---|---|---|
| **Fase 0** | Setup base Verbum Lucis | ✅ Completato |
| **Fase 1** | Vantaggi competitivi (LitCal, Catechismo, Intent pages) | Prossimo |
| **Fase 2** | Remotion — DailyLiturgy video | Dopo Fase 1 (contenuti nel DB) |
| **Fase 3** | Remotion — Prayer videos + YouTube upload | Dopo Fase 2 |
| **Fase 4** | Remotion — Shorts/Reels automation | Scale |

**Raccomandazione:** Remotion ha più senso **dopo** che il database è popolato con contenuti (Fase 1 completata). Altrimenti generi video vuoti. Il momento migliore è quando hai almeno:
- 30 giorni di liturgia nel DB
- 100+ preghiere
- 10+ santi completi

---

## 8. CONCLUSIONE

Remotion si inserisce come **livello di output aggiuntivo** del progetto. Verbum Lucis genera già contenuti programmatici per il web (pagine). Remotion aggiunge la dimensione **video** usando gli stessi dati.

Il fit è naturale perché:
1. **Stessa tecnologia:** React. Remotion usa React, Verbum Lucis usa React.
2. **Stesso dato:** Il database è già la single source of truth.
3. **Stesso obiettivo:** Contenuto programmatico a scale.
4. **Costo quasi zero:** Gratuito per team piccoli, rendering economico.

Non è una necessità immediata, ma è una delle poche opportunità nel mercato cattolico italiano dove nessun concorrente è ancora presente.