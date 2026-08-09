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

## Pipeline (Sessione 1: ingest → segment → coordinata)

```bash
# dalla root di verbum-lucis
python3 corpus/pipeline/ingest.py            # 1. export → corpus/raw/fragments.jsonl
python3 corpus/pipeline/segment.py           # 2. frammenti → corpus/pagine.jsonl (le Pagine)
node --import tsx corpus/pipeline/enrich.mjs # 3. + coordinata liturgica → pagine.enriched.jsonl
python3 corpus/pipeline/report.py            # 4. → CRONISTORIA.md + INVENTARIO.md
```

### Cosa produce
| File | Contenuto |
|---|---|
| `raw/fragments.jsonl` | Ogni blocco di testo con provenienza (fonte, thread, data, ruolo). |
| `pagine.jsonl` | Le **Pagine** segmentate (unità-giornata): data, vangelo, tipo, titolo, testo. |
| `pagine.enriched.jsonl` | Le Pagine + `coord` (coordinata liturgica dalla spina). **La node table.** |
| `CRONISTORIA.md` | La linea del cammino, giorno per giorno, con coordinata e Pagine trovate. |
| `INVENTARIO.md` | Copertura per Vangelo / tempo / ciclo A·B·C / tipo; Top Pagine; gap. |

### Fonti (in `~/Work/_archive/` e `~/Note/`)
- **ChatGPT** (`DatiGPT_exported/conversations-*.json`): miniera per-giorno; l'oro è nei thread lunghi.
- **Obsidian** (`~/Note/`): struttura della spina (Cammino Pasquale, Domeniche/Centri, Ottava, Idrogeni).
- **Gemini** (`Dati_GEMINI_exported/`): pochi documenti Canvas UTF-8. `.wav`/zip/immagini **esclusi**.

## Schema `tipo` delle Pagine
`pagina-sacra` (Vangelo + applicazione del giorno) · `lectio` · `preghiera` · `cammino`
(orbite/settimane/ottava) · `dottrina` (idrogeni/Quarta Via/Tetramorfo) · `diario` · `nota`.

## Piano multi-sessione
- **S1 — questa** ✅ ingest + segment + coordinata → node table + cronistoria + inventario + schema grafo.
- **S2** — grafo di conoscenza: popola `graph.sqlite` (nodi/archi da `GRAFO-SCHEMA.md`) + vista timeline/grafo.
- **S3** — curatela: deduplica semantica (`evolve_da`), selezione qualità, **semina `pagineSacre` D1**
  (mapping campo→campo), e colmatura dei buchi centro/lavoro della spina (Quaresima, Natale, TO I)
  dai contenuti curati.

## Stato Sessione 1 (ultima esecuzione)
- **10.962 frammenti** (ChatGPT 10.797 · Obsidian 150 · Gemini 15).
- **1.085 Pagine** (pagina-sacra 190 · cammino 304 · preghiera 215 · dottrina 223 · diario 60 · lectio 6 · nota 87).
- **1.082 con coordinata liturgica**; **242 giornate a data esplicita**; arco **ago 2024 → lug 2026**.
- Sanity: `2025-04-21` (Lunedì dell'Angelo) → Tempo di Pasqua, sett. 1, bianco, _La Presenza che cammina accanto_. ✓
