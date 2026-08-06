# Vault Theosis — Piano di unificazione del corpus

*Progetto: unificare tutte le sorgenti del corpus spirituale di Chris in un vault Obsidian locale, indicizzato liturgicamente e cercabile.*

## Perché Obsidian

Quattro ragioni:

1. **Local-first, file system trasparente.** I file sono `.md` sul disco. Niente lock-in, niente database, niente API. Se domani Obsidian sparisce, resta la cartella di markdown. Per un archivio che deve durare 30 anni, è l'unica scelta sana.

2. **Perfetto per il tempo liturgico ciclico.** I link bidirezionali `[[III-Domenica-Avvento]]` o `[[Cristo-Re-Anno-C]]` permettono di costruire la mappa liturgica automaticamente. Una pagina liturgica raccoglie tutte le scritte di tutti gli anni che si riferiscono a essa.

3. **Ponte tra carta e digitale.** Il flusso di Chris è già carta ↔ digitale ↔ carta. Obsidian è il punto di sintesi naturale.

4. **Autorità a casa.** Coerente con il principio *"l'autorità è nella Liturgia, l'AI è strumento"* — il dato vive da Chris, gli AI sono consultabili sull'archivio, non custodi.

## Nome

**Theosis** — coerente col prompt master, è già il nome del sistema.

## Struttura cartelle (top-level)

```
Theosis/
├── 00-Indice/
│   ├── INVENTORY.md            ← mappa fisica di tutte le sorgenti
│   ├── PRINCIPI.md             ← autorità = Liturgia, AI = strumento
│   └── mappe/
├── 01-Liturgia/                ← spina dorsale ciclica
│   ├── Tempo-Avvento/
│   ├── Tempo-Natale/
│   ├── Tempo-Ordinario/
│   ├── Tempo-Quaresima/
│   ├── Triduo/
│   ├── Tempo-Pasqua/
│   ├── Pentecoste/
│   ├── Tempo-Ordinario-II/
│   ├── Cristo-Re/
│   └── Anni/
│       ├── A.md
│       ├── B.md
│       └── C.md
├── 02-Pagine-Sacre/            ← file per data effettiva, link a 01
│   ├── 2024/
│   ├── 2025/
│   │   ├── 2025-11-07.md
│   │   ├── 2025-11-30.md
│   │   └── ...
│   └── 2026/
├── 03-Lectio-Alchemiche/       ← sottocartella o sorella di 02
│   └── ...
├── 04-Quaderni/                ← uno per quaderno fisico
│   ├── Q1-Nero-Grande/
│   │   ├── 0001-0050.md
│   │   └── ...
│   ├── Q2/
│   ├── Q3/
│   └── Quadernini-Oggi-Cammino/
├── 05-Mappe-Strutturali/
│   ├── Ottagono.md
│   ├── Dodici-Apostoli.md
│   ├── Idrogeni.md
│   └── Centri.md
├── 06-Voti-e-Atti/
│   ├── 2025-11-17-Nuovo-Si.md
│   ├── 2025-11-06-Preghiera-Commercio-Devoto.md
│   └── ...
├── 07-Sistemi-AI/
│   ├── Theosis-Prompt-Master.md
│   ├── Pagine-Sacre-Prompt.md
│   ├── Lectio-Alchemica-Prompt.md
│   └── ...
├── 08-Diario-Operativo/
│   ├── Sfida60/
│   ├── Marco/
│   └── Decisioni/
├── 09-Export-Conversazioni/
│   ├── ChatGPT/
│   ├── Gemini/
│   └── Claude/
├── 10-Allegati/
│   ├── foto-quaderni/
│   ├── audio/
│   └── pdf/
└── _Templates/
    ├── Pagina-del-Giorno.md
    ├── Lectio.md
    └── Voto.md
```

## Template — Pagina del Giorno

```yaml
---
data: 2026-01-22
giorno-liturgico: [[II-Settimana-Tempo-Ordinario]]
anno: C
tempo: Ordinario
settimana: II
giorno-numero: 11
santi: [[San-Vincenzo]]
letture: [1Sam-18, Sal-55, Mc-3]
temi: [[Lavoro-del-Non-Lancio]], [[Barca-nel-Caos]]
sorgente: gemini
scanned: true
foto: ../../10-Allegati/foto-quaderni/Q1-p123.jpg
---

# Titolo del Giorno

*"Sei venuto a rovinarci?"*

## Il Re Oggi

...

## Il Vangelo Oggi: Lc 4, 31-37

...

## Fuoco nel Corpo

*"Riconosci l'autorità"*

...

## Presenza nel Giorno

*"Ascolta l'imperativo"*

...

## Regno nella Carne

*"Strumento di liberazione"*

...

## Gesto Reale del Giorno

*"Non discutere con il male. Comandagli nel Nome del Re"*

...

## Oggi cammino come chi...

*sa che la Parola di Cristo ha AUTORITÀ, non discute con le tenebre, ma COMANDA nel Nome del Re, che anche i demoni riconoscono.*

## Sintesi

*La Tua Parola ha autorità.*
*Anche ciò che mi tiene prigioniero sa chi Sei.*
*Io non discuto.*
*IO OBBEDISCO.*
```

Il backlink automatico su `II-Settimana-Tempo-Ordinario.md` mostra tutte le Pagine Sacre di quella settimana in tutti gli anni. **La spirale del tempo liturgico funziona da sola, per costruzione.**

Il template ha **sezioni-base fisse** (quelle che appaiono in ogni doppia pagina) e ammette **sezioni-extra opzionali** — perché lo schema è stabile "più o meno", non identico ogni giorno.

## Fasi ordinate

### Fase A — Bootstrap (1 ora di lavoro di Chris)

Chris crea vault vuoto con struttura cartelle e template. Script fornito che genera tutto.

### Fase B — Digitalizzazione quaderni (cuore del corpus)

**Il corpus principale è cartaceo.** Il digitale è materiale di appoggio. Quindi si parte dai quaderni.

Chris fotografa a blocchi (20-30 doppie pagine per volta). Io OCR + trascrizione strutturata + indicizzazione per giorno liturgico. Ogni doppia pagina diventa un file `.md` in `02-Pagine-Sacre/YYYY/YYYY-MM-DD.md`.

**Prima passata:** 5-10 doppie pagine per fissare il template definitivo. Poi si scala.

### Fase C — Merge Obsidian vault esistente

Chris manda zip del vault attuale. Io normalizzo, risolvo duplicati per data, merge dentro `Theosis`.

### Fase D — Drive harvest

Script Python che:
- Legge ricorsivamente le cartelle Drive del corpus
- Scarica ogni Doc come markdown
- Estrae data dal `createdTime`
- Prova a inferire il riferimento liturgico
- Scrive `.md` in `02-Pagine-Sacre/YYYY/YYYY-MM-DD.md` con YAML header
- Restituisce report di cosa è stato preso e cosa è ambiguo

### Fase E — Export AI (ChatGPT/Gemini/Claude/Facebook)

Ingestione dei JSON export → estrazione delle Pagine Sacre / Lectio prodotte → cross-reference con Drive/quaderni (molte saranno già presenti come Doc).

### Fase F — Sito personale

Solo dopo che A-E sono solidi.

*"Volevo creare un semplice sito per me e per altri, ma per me più che altro."*

Sistema di consultazione: dato un giorno liturgico, restituisce tutto quello che ho scritto in quel giorno in tutti gli anni. Prima il dato, poi l'interfaccia.

## Sync e custodia

- **Git private repo** (GitHub o Gitea sull'Hetzner) per versionamento e backup
- **Obsidian Sync** o **Syncthing** (self-hosted, peer-to-peer) per mobile
- **R2 backup** crittato ogni settimana

Sopra tutto: **un singolo punto di verità** = vault locale sul Mac di Chris. Tutto il resto è copia.

## Il rapporto con AI da quel momento

Quando il vault esiste, il modo di lavorare cambia:

- Chris genera bozze altrove (Gemini, ChatGPT) → le lima a mano → salva in `Theosis`
- Il documento principe è quello nel vault
- Se serve Claude/altro: gli si passa il file `.md` del giorno o del tema
- Non c'è più *"Claude ha il contesto / Claude ha perso il contesto"* — il contesto è il file che passi
- Quando finisce la chat, resta il file

## Plugin Obsidian utili (decidi tu quando)

- **Smart Connections** o **Copilot** — embedding semantico locale per cercare "tutto quello che ho scritto su X"
- **Dataview** — query SQL-like sui frontmatter YAML, per generare "tutte le Pagine Sacre di Avvento" o simili
- **Templater** — template per nuova Pagina Sacra che chiede data e popola YAML
- **Periodic Notes** — note giornaliere con giorno liturgico precompilato

## Regole non negoziabili

1. **Mai generare Pagine Sacre nuove tramite AI.** L'AI ricerca, indicizza, custodisce, formatta. Non genera contenuti liturgici da inserire.
2. **Mai AI commentary sui testi tuoi.** Il ruolo dell'AI nel vault è archivista, non interprete.
3. **YAML frontmatter sempre.** Ogni file ha data, giorno-liturgico, anno, sorgente. Senza queste, non entra.
4. **Foto originali sempre allegate.** Per ogni Pagina Sacra proveniente da quaderno, la foto della doppia pagina è allegata. Il file `.md` è trascrizione + indice; l'atto è la carta.
