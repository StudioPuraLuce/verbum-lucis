# ☩ La Lavorazione del Corpus

> **Governance 2026-08-28:** il corpus è ora parte di **Theosis privato**. Il precedente prossimo
> passo `RAG → generatore pubblico` è superato da ADR-009…014. La pipeline resta preziosa per
> ricostruzione, ricerca e memoria, ma non alimenta automaticamente Verbum Lucis pubblico.

Estrazione, ricostruzione e curatela del **corpus spirituale reale** (≈2 anni di scrittura
dell'utente negli export ChatGPT/Gemini + vault Obsidian) per costruire la memoria privata di
Theosis.

**Principio:** il corpus storico **non si riscrive con AI** — esiste già. La pipeline estrae,
ordina, collega e indicizza; l'AI può anche comporre **nuove bozze private** in Theosis, ma queste
restano oggetti nuovi con provenance distinta e non diventano retroattivamente testimonianza.
Ogni Pagina storica viene ancorata alla **coordinata liturgica** calcolata dalla spina
(`src/lib/liturgical-spiral.ts`).

## ⚠️ Privacy
Il contenuto estratto è **testimonianza privata**. Tutto ciò che contiene testo del corpus è
**gitignorato** (`raw/`, `*.jsonl`, `*.sqlite`, `CRONISTORIA.md`, `INVENTARIO.md`). Nel repo
entrano solo il **codice della pipeline** e i **documenti di schema/report aggregati**.

È vietata una pipeline automatica `corpus → RAG → pagina pubblica → publish`.

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

# Sessione 4: semina DB locale — indice privato delle Pagine reali intere
npm run corpus:seed:gen                       # 9. pagine.curate.jsonl → drizzle/seed-corpus.sql (privato)
npm run db:corpus:schema:local                # 10. crea la tabella pagine_corpus (D1 locale)
npm run db:corpus:seed:local                  # 11. carica le 923 Pagine (D1 locale)
# Nessuna semina remota finché architettura privata e firewall non sono definiti e approvati.

# Sessione 5: Corpo di Conoscenza — scomposizione AI in atomi verbatim
node --env-file=.dev.vars corpus/pipeline/extract_atoms.mjs --limit 8
node --env-file=.dev.vars corpus/pipeline/extract_atoms.mjs --min-quality 8 --concurrency 6
# → corpus/atomi.jsonl (+ atoms-cache/ per-pagina, idempotente)
python3 corpus/pipeline/report_atomi.py
python3 corpus/pipeline/build_atomi_view.py
npm run atomi:seed:gen
npm run db:atomi:schema:local && npm run db:atomi:seed:local
```

### Cosa produce
| File | Contenuto |
|---|---|
| `raw/fragments.jsonl` | Ogni blocco di testo con provenienza (fonte, thread, data, ruolo). |
| `pagine.jsonl` | Le **Pagine** segmentate (unità-giornata): data, vangelo, tipo, titolo, testo. |
| `pagine.enriched.jsonl` | Le Pagine + `coord` (coordinata liturgica dalla spina). |
| `CRONISTORIA.md` | La linea del cammino, giorno per giorno, con coordinata e Pagine trovate. |
| `INVENTARIO.md` | Copertura per Vangelo / tempo / ciclo A·B·C / tipo; Top Pagine; gap. |
| `graph.sqlite` | Il grafo di conoscenza: tabelle `nodi`/`archi`. |
| `nodi.jsonl` / `archi.jsonl` | Export portabile del grafo. |
| `graph.html` | Vista self-contained: cronistoria filtrabile + statistiche del grafo. |
| `pagine.curate.jsonl` | Insieme curato: 1 Pagina migliore per cluster + `qualita` + `varianti`. |
| `curato.html` | Vista leggibile: ogni Pagina apribile a testo integrale. |

### Fonti (private, fuori git)

- **ChatGPT** (`DatiGPT_exported/conversations-*.json`): miniera per-giorno; l'oro è nei thread lunghi.
- **Obsidian** (`~/Note/`): struttura della spina e materiali del cammino.
- **Gemini** (`Dati_GEMINI_exported/`): documenti/Canvas ed export pertinenti.
- **Drive**: materiale di appoggio e Pagine/approfondimenti dove presente.

I path qui sono documentazione storica del setup locale, non promessa che ogni macchina li abbia
ancora: R1 deve verificarli sul filesystem reale.

## Schema `tipo` delle Pagine

`pagina-sacra` · `lectio` · `preghiera` · `cammino` · `dottrina` · `diario` · `nota`.

## Stato storico della pipeline

- **S1** ✅ ingest + segment + coordinata → node table + cronistoria + inventario.
- **S2** ✅ grafo di conoscenza: `graph.sqlite` (1485 nodi, 5315 archi) + vista.
- **S3** ✅ curatela: `curate.py` (dedup 1085→923, qualità alta 509/media 251/bassa 163).
- **S4** ✅ tabella `pagine_corpus` locale con Pagine reali intere + coordinata.
- **S5** ✅ scomposizione in atomi verbatim; successivamente ampliata fino ai conteggi riportati in
  `STATUS.md`/`CHANGELOG.md`.
- **S6 precedente** ❌ **SUPERATA** — il RAG pubblico non è più il prossimo passo.

## Prossimo lavoro canonico — R1 Origin System

Vedi `NEXT.md`.

Priorità:

1. verificare le sorgenti reali ancora disponibili;
2. ricostruire la cronologia completa delle `pagina-sacra`;
3. estrarre verbatim `Oggi cammino come chi…` in dataset autonomo;
4. aggiungere provenance (`generated`, `adopted`, `carried`, ecc.) senza inferire ciò che non è
   verificato;
5. usare i B5 come testimonianza materiale/controllo campione;
6. usare i quadernini per verificare quali memento furono realmente **portati**.

## Gerarchia di fedeltà

1. sorgente originale;
2. Pagina integrale;
3. versione assunta/trascritta;
4. `Oggi cammino` realmente portato;
5. atomi;
6. embedding/ranking/sintesi.

Gli ultimi livelli sono indici ricostruibili; i primi sono memoria.
