# ☩ La Lavorazione del Corpus

Estrazione, ricostruzione e curatela del **corpus spirituale reale** (≈2 anni di scrittura
dell'utente negli export ChatGPT/Gemini + vault Obsidian) per seminare il portale Verbum Lucis.

**Principio:** il corpus **non si genera con AI** — esiste già, scritto a mano. La pipeline
*estrae* e *ordina*, non inventa. Ogni Pagina viene ancorata alla **coordinata liturgica**
calcolata dalla spina (`src/lib/liturgical-spiral.ts`), unica fonte di verità.

## ⚠️ Privacy
Il contenuto estratto è **testimonianza privata**. Tutto ciò che contiene testo del corpus è
**gitignorato** (`raw/`, `*.jsonl`, `*.sqlite`, `CRONISTORIA.md`, `INVENTARIO.md`). Nel repo
entrano solo il **codice della pipeline** e i **documenti di schema** (questo README,
`GRAFO-SCHEMA.md`). Il seed curato entrerà nel DB solo deliberatamente, in Sessione 3.

## Pipeline

```bash
# dalla root di verbum-lucis — Sessione 1: ingest → segment → coordinata
python3 corpus/pipeline/ingest.py            # 1. export → corpus/raw/fragments.jsonl
python3 corpus/pipeline/segment.py           # 2. frammenti → corpus/pagine.jsonl (le Pagine)
node --import tsx corpus/pipeline/enrich.mjs # 3. + coordinata liturgica → pagine.enriched.jsonl
python3 corpus/pipeline/report.py            # 4. → CRONISTORIA.md + INVENTARIO.md

# Sessione 2: grafo di conoscenza + vista
python3 corpus/pipeline/build_graph.py       # 5. → graph.sqlite + nodi.jsonl + archi.jsonl
python3 corpus/pipeline/build_view.py        # 6. → graph.html (cronistoria+grafo navigabile)

# Sessione 3: curatela (dedup + qualità) + viste leggibili
python3 corpus/pipeline/curate.py            # 7. → pagine.curate.jsonl (dedup + punteggio qualità)
python3 corpus/pipeline/build_curato_view.py # 8. → curato.html (Pagine apribili a testo integrale)
python3 corpus/pipeline/build_diario.py      # 8b. → DIARIO-RICOSTRUITO.md (leggibile in Markdown)

# Sessione 4: semina DB — le Pagine reali intere in pagine_corpus (Strada 1)
npm run corpus:seed:gen                       # 9. pagine.curate.jsonl → drizzle/seed-corpus.sql (privato)
npm run db:corpus:schema:local                # 10. crea la tabella pagine_corpus (D1 locale)
npm run db:corpus:seed:local                  # 11. carica le 923 Pagine (D1 locale)
# in produzione (gate utente): db:corpus:schema:remote + db:corpus:seed:remote

# Sessione 5: IL CORPO DI CONOSCENZA — scomposizione AI in atomi verbatim
node --env-file=.dev.vars corpus/pipeline/extract_atoms.mjs --limit 8   # validazione (8 pagine)
node --env-file=.dev.vars corpus/pipeline/extract_atoms.mjs --min-quality 8 --concurrency 6
#   → corpus/atomi.jsonl (+ atoms-cache/ per-pagina, idempotente). Se restano pagine "vuote"
#     (JSON troncato): riesegui con --retry-empty. Modello: claude-sonnet-4-6 via Gateway.
python3 corpus/pipeline/report_atomi.py       # conteggi per tipo/tempo/tag
python3 corpus/pipeline/build_atomi_view.py   # → corpus/atomi.html (privata, filtrabile+ricerca)
npm run atomi:seed:gen                         # atomi.jsonl → drizzle/seed-atomi.sql (privato)
npm run db:atomi:schema:local && npm run db:atomi:seed:local   # tabella + carico (D1 locale)
```

### Cosa produce
| File | Contenuto |
|---|---|
| `raw/fragments.jsonl` | Ogni blocco di testo con provenienza (fonte, thread, data, ruolo). |
| `pagine.jsonl` | Le **Pagine** segmentate (unità-giornata): data, vangelo, tipo, titolo, testo. |
| `pagine.enriched.jsonl` | Le Pagine + `coord` (coordinata liturgica dalla spina). **La node table.** |
| `CRONISTORIA.md` | La linea del cammino, giorno per giorno, con coordinata e Pagine trovate. |
| `INVENTARIO.md` | Copertura per Vangelo / tempo / ciclo A·B·C / tipo; Top Pagine; gap. |
| `graph.sqlite` | Il **grafo di conoscenza**: tabelle `nodi`/`archi` (schema in `GRAFO-SCHEMA.md`). |
| `nodi.jsonl` / `archi.jsonl` | Export portabile del grafo. |
| `graph.html` | Vista self-contained: cronistoria filtrabile + statistiche del grafo. |
| `pagine.curate.jsonl` | L'insieme **curato**: 1 Pagina migliore per cluster + `qualita` + `varianti`. |
| `curato.html` | Vista leggibile: ogni Pagina apribile a **testo integrale**, filtri qualità/tipo. |

### Fonti (in `~/Work/_archive/` e `~/Note/`)
- **ChatGPT** (`DatiGPT_exported/conversations-*.json`): miniera per-giorno; l'oro è nei thread lunghi.
- **Obsidian** (`~/Note/`): struttura della spina (Cammino Pasquale, Domeniche/Centri, Ottava, Idrogeni).
- **Gemini** (`Dati_GEMINI_exported/`): pochi documenti Canvas UTF-8. `.wav`/zip/immagini **esclusi**.

## Schema `tipo` delle Pagine
`pagina-sacra` (Vangelo + applicazione del giorno) · `lectio` · `preghiera` · `cammino`
(orbite/settimane/ottava) · `dottrina` (idrogeni/Quarta Via/Tetramorfo) · `diario` · `nota`.

## Piano multi-sessione
- **S1** ✅ ingest + segment + coordinata → node table + cronistoria + inventario + schema grafo.
- **S2** ✅ grafo di conoscenza: `graph.sqlite` (1485 nodi, 5315 archi) + `graph.html` (vista).
- **S3** ✅ curatela: `curate.py` (dedup 1085→923, qualità alta 509/media 251/bassa 163) + `curato.html`.
- **S4** ✅ **Strada 1**: tabella `pagine_corpus` (le Pagine reali INTERE + coordinata) seminata in D1
  locale (923 righe). `pagine_sacre` a riquadri resta per le pagine generate. Migrazione in
  `drizzle/0001_pagine_corpus.sql` (locale, come `0000_init.sql`: `drizzle/` è gitignorato per
  convenzione — `db/schema.ts` è la fonte di verità). Seed `drizzle/seed-corpus.sql` gitignorato (privato).
- **S5** ✅ **Il Corpo di Conoscenza**: scomposizione AI estrattiva (verbatim) delle Pagine in
  **atomi** tipizzati. `atom-prompt.mjs` + `extract_atoms.mjs` (via Gateway, cache, guardia
  anti-allucinazione + salvataggio JSON troncato) → **4.164 atomi** da 402 Pagine
  (insegnamento 1383 · frase 762 · gesto 639 · preghiera 450 · meditazione 446 · simbolo 360 ·
  concetto 68 · testimonianza 56). Tabella `atomi_corpus` (D1 locale). Vista `atomi.html`.
- **S6 — prossima** — sopra gli atomi: (A) RAG nel generatore (voce dell'autore; `concetto`
  esoterici fuori dal mainstream), (B) stanza privata, (C) composizione (libri/preghiere/stampe/
  post/cammini/la sua storia). Poi semina remota (gate utente).

## Stato Sessione 1 (ultima esecuzione)
- **10.962 frammenti** (ChatGPT 10.797 · Obsidian 150 · Gemini 15).
- **1.085 Pagine** (pagina-sacra 190 · cammino 304 · preghiera 215 · dottrina 223 · diario 60 · lectio 6 · nota 87).
- **1.082 con coordinata liturgica**; **242 giornate a data esplicita**; arco **ago 2024 → lug 2026**.
- Sanity: `2025-04-21` (Lunedì dell'Angelo) → Tempo di Pasqua, sett. 1, bianco, _La Presenza che cammina accanto_. ✓
