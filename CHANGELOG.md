# CHANGELOG — Verbum Lucis

Formato: voci in ordine cronologico inverso. Le date sono `Europe/Rome`.

## 2026-08-28

### Rifondazione concettuale — Theosis privato / Verbum Lucis pubblico

- Ricostruito il funzionamento originario del cammino: **Liturgia → Pagina Sacra → trascrizione B5
  → `Oggi cammino come chi…` → quadernino tascabile → ritorni ripetuti alla Presenza**.
- Chiarito dall'autore che i B5 erano principalmente trascrizioni delle Pagine Sacre digitali e
  che i quadernini servivano come memento portatile durante la giornata. Non serve ridigitalizzare
  integralmente i B5 per ricostruire il testo.
- Creata la separazione canonica in tre sistemi:
  - **Theosis** — privato, cammino/memoria/Pagina Sacra/Praxis/`Sei stato qui`;
  - **Verbum Lucis** — pubblico, cattolico, fonte-based, semplice e hands-off;
  - **Fedele Messaggero** — distribuzione dei soli artefatti pubblici.
- Creato `docs/00-governance/ORIGIN-SYSTEM.md`: ciclo `Ricevi → Porta → Ritorna → Ricorda`,
  provenance personale, regole rigorose di `Sei stato qui`, Messa/Praxis private.
- Creato `docs/00-governance/PRIVATE-PUBLIC-BOUNDARY.md`: firewall strutturale; vietata la pipeline
  automatica `corpus privato → RAG → publish`.
- Riscritta la Stella Polare sulla nuova identità.
- Aggiunte ADR-009…014 in `DECISIONS.md`, che superano il RAG pubblico del corpus, la Pagina Sacra
  customer-facing e KDP come primo prodotto obbligatorio.
- Riscritta `ROADMAP.md`: R0 governance → R1 Origin System → R2 Theosis Oggi → R3 `Sei stato qui`
  → R4 Messa/Praxis → P1 pubblico → P2 distribuzione → P3 SEO → M monetizzazione.
- `NEXT.md`: unico prossimo risultato = ricostruzione verificabile delle Pagine Sacre e dataset
  verbatim `Oggi cammino` con provenance.
- `AGENTS.md` riallineato: AI strumento, non autorità; separazione privato/pubblico fail-closed.
- **Nessuna modifica al codice applicativo** in questa rifondazione documentale.

## 2026-08-09

### Fase 1 — La liturgia normale (letture del giorno) ACCESA
- Diagnosi: tabella `liturgy` vuota; BibleGet e LitCal wired su endpoint morti/sbagliati.
- Riparati `src/lib/litcal.ts` (endpoint `/api/dev`) e `src/lib/bibleget.ts` (`/v3/index.php`,
  testo CEI 2008) — commit `1a4a872`.
- **Lezionario**: `src/lib/evangelizo.ts` (`lettureDelGiorno`/`ruoliLetture`) →
  `publication.evangelizo.ws` dà i riferimenti del giorno (domeniche ordinarie + ferie), con
  normalizzazione sigle (libri numerati `1_R`→`1Re`, suffissi versetto `9a`→`9`).
- **Pipeline**: `scripts/seed-liturgia.mjs` → evangelizo(refs) → BibleGet(testo CEI, cache
  `.liturgia-cache/`) → coordinata spirale → popola `liturgy` (D1). Script `liturgia:seed:gen` +
  `db:liturgia:seed:*`. Seminati 8 giorni: `/liturgia/oggi` ora mostra 1ª/salmo/2ª/Vangelo col
  testo CEI (verificato nel browser, log puliti). Copertura 8/8 Vangeli e 1ª letture, 7/8 salmi.
- Privacy/copyright: testo CEI (copyright Fondazione) resta in `drizzle/seed-liturgia.sql` +
  `.liturgia-cache/` **gitignorati**; produzione = scelta/gate utente. Fonte-oro futura: i PDF
  ufficiali dei lezionari (seed offline).

### Fase 1 — Il Componitore Giornaliero (keystone)
- `src/lib/componitore.ts`: data → coordinata (`liturgicalCoordinate`) → selezione atomi da
  `atomi_corpus` con ranking di aderenza (centro +4, tempo +2, tonalità Vangelo +1), `concetto`
  esoterici esclusi, dedup + quote per tipo → `GiornataComposta`. Deterministico e offline.
- Anteprima interna `/admin/componitore` (`?data=`), verificata nel browser: per oggi compone
  meditazioni/preghiere/gesti/frasi/simboli reali e coerenti con la coordinata; log puliti.

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
