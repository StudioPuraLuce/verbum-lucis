# STATUS — Verbum Lucis

> Stato **verificato** (non aspirazionale). Aggiornato a ogni fetta di lavoro. Data: 2026-08-09.
> Fase corrente: **Fase 0 — Governance + Corpo completo** (vedi `ROADMAP.md`).

## Fatto e verificato

**Infrastruttura**
- Astro 5 SSR + `@astrojs/cloudflare` + D1 (Drizzle sqlite-core, `getDb(Astro.locals)`) + KV.
  Build ok; dev locale serve tutte le pagine 200 da D1. `wrangler login` fatto.
- **Non ancora lanciato** in produzione (D1 remoto/deploy = gate umano, Fase 1.5).

**La spina (ADR-001)**
- `src/lib/liturgical-spiral.ts` — coordinata deterministica offline (Pasqua/Avvento validati;
  8 ago 2026 = TO XVIII, Anno A/Matteo, "Centro del cuore"). Vista `src/pages/spirale.astro`,
  `SpiraleMini.astro` in home. Mappe centri: Pentecoste→Cristo Re, Avvento, Pasqua. **Buchi**:
  Quaresima, Natale, TO I (1–9).

**Generatore Pagina Sacra**
- `pagina-sacra-generator.ts` + `pagina-sacra-prompt.ts` (voce "Fedele Messaggero", contratto JSON,
  upsert in `pagine_sacre`). Endpoint `api/genera-pagina-sacra.ts`. Coordinata offline-first nel
  prompt; centro esoterico escluso dal mainstream. Modello Sonnet via Gateway.

**Il corpus (privato, ADR-003/004/005)**
- Pipeline S1–S5 in `corpus/pipeline/` (gitignorata quanto a output). 923 Pagine curate
  (`pagine.curate.jsonl`, qualità alta 509/media 251/bassa 163). Tabella fedele `pagine_corpus`
  (923 righe) in D1 locale. Grafo `graph.sqlite` (1485 nodi / 5315 archi).
- **Corpo di Conoscenza**: **7.423 atomi** verbatim in `atomi_corpus` (D1 locale, verificato).
  Estratti su qualità ≥ 5 (Haiku, ADR-008); le pagine di qualità alta restano quelle già estratte
  con Sonnet (cache). Costo reale ~2$.
- **Corpo della Dottrina**: **2.716 concetti** (1.842 distinti) da 162 Pagine `dottrina`, mappa
  dei collegamenti (hub: Presenza, Ricordo di sé, Silenzio, Fuoco; scala idrogeni H768→H6 completa).
  `extract_doctrine.mjs` reso robusto (cache + salvataggio JSON troncato); `report_dottrina.py`.
  Output `dottrina.jsonl` (privato). Non ancora in D1 (è artefatto di lavorazione).

**Governance (ADR + questo pacchetto)**
- `docs/00-governance/STELLA-POLARE.md`, `AGENTS.md`, `ROADMAP.md`, `DECISIONS.md`, `STATUS.md`,
  `NEXT.md`, `CHANGELOG.md` — istituiti in questa sessione.

## In corso
- Fase 0 chiusa. Si apre la **Fase 1**: il Componitore Giornaliero (vedi `NEXT.md`).

## Prossimo
Vedi `NEXT.md`.
