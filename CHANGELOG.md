# CHANGELOG — Verbum Lucis

Formato: voci in ordine cronologico inverso. Le date sono `Europe/Rome`.

## 2026-08-09

### Fase 0 — Governance + Corpo completo
- **Governance istituita**: `docs/00-governance/STELLA-POLARE.md`, `AGENTS.md`, `ROADMAP.md`,
  `STATUS.md`, `NEXT.md`, `DECISIONS.md` (ADR-001…008), questo `CHANGELOG.md`. Metodo estratto dai
  repo `esim`/`trovatemi-os`.
- **Master-plan a quattro assi** approvato (costruzione · design · monetizzazione · distribuzione);
  decisioni bloccate: lancio incrementale (ADR-006), primo prodotto eBook KDP (ADR-007), modello per
  il lavoro giusto Haiku/Sonnet (ADR-008).
- **Corpo di Conoscenza completato**: atomi estratti su tutte le Pagine qualità ≥ 5 con **Haiku**
  (via Gateway), riusando la cache Sonnet. **7.423 atomi** (da 4.164) da 737 Pagine — insegnamento
  3183, gesto 1137, frase 1007, preghiera 696, simbolo 587, meditazione 558, testimonianza 135,
  concetto 120. Costo reale ~2$. `atomi_corpus` riseminata in D1 locale (7.423 righe, verificato).
- **Corpo della Dottrina completato**: `extract_doctrine.mjs` riscritto col pattern robusto di
  `extract_atoms.mjs` (cache per-pagina `doctrine-cache/`, salvataggio JSON troncato, concorrenza,
  modello via env) — chiuso il bug di troncamento. **2.716 concetti** (1.842 distinti) da 162 Pagine
  `dottrina` (Haiku, ~2$ reali); scala idrogeni H768→H6 completa, hub Presenza/Ricordo di sé/
  Silenzio/Fuoco. `report_dottrina.py` aggiunto. `.gitignore`: aggiunta `corpus/doctrine-cache/`.

## Prima del changelog (storico in memoria/commit)
- Migrazione full-Cloudflare (adapter, D1, KV, wrangler). Spina a spirale (`liturgical-spiral.ts`) +
  vista `spirale.astro`. Generatore Pagina Sacra (voce "Fedele Messaggero", via Gateway). Pipeline
  corpus S1–S5 (ingest→segment→enrich→graph→curate→atomi). Tabelle `pagine_corpus`/`atomi_corpus`.
  Dettaglio nella cronologia dei commit e nella memoria di progetto.
