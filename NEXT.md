# NEXT — il prossimo risultato unico

> Un solo risultato alla volta, con criteri d'accettazione e gate. Quando è fatto e verificato, si
> aggiorna `STATUS.md` + `CHANGELOG.md` e si sceglie il prossimo da `ROADMAP.md`.

## Ora: Fase 1 — Il LEZIONARIO (la radice del motore)

La Pagina Sacra è **derivata dalle letture del giorno** → le letture sono a monte di tutto. Stato
verificato delle fonti (2026-08-09):
- **BibleGet** ✅ FUNZIONA — endpoint `/v3/index.php` (NON `/v3/quote`, non ancora deployato) →
  testo **CEI 2008** da riferimento. Vedi `src/lib/bibleget.ts` (`fetchTestoRiferimento`).
- **LitCal** ✅ endpoint `/api/dev/` → calendario per ogni giorno (celebrazione/colore/ciclo), **ma
  letture solo per ~80 solennità/feste, ZERO domeniche ordinarie / ferie**. Vedi `src/lib/litcal.ts`.
- **BUCO** ❌ — manca la mappa **giorno → riferimenti letture** per domeniche A/B/C e ferie I/II
  (il *lezionario*). LitCal non ha endpoint letture (`/readings` 404).

**Risultato da ottenere:** una fonte del lezionario (riferimenti; i riferimenti sono fatti, non
copyright) → cache in D1 → BibleGet risolve il testo CEI (cache) → `liturgy` si popola →
`/liturgia/oggi` si accende e il generatore ottiene `vangeloRif`. Candidati fonte: evangelizo.org
(API multilingua con calendario, refs usabili) · dataset lezionario open · scraping ufficiale
(solo refs). **Decisione fonte = gate utente.**

## Poi: RAG nel generatore (la "voce dell'autore")

Il Componitore c'è (`src/lib/componitore.ts`, verificato su `/admin/componitore`). Usarlo per
**nutrire il generatore Pagina Sacra** con gli atomi reali dell'autore.

**Risultato:** in `resolveLiturgyContext`/`buildUserPrompt` (`pagina-sacra-generator.ts` /
`pagina-sacra-prompt.ts`) iniettare gli atomi selezionati dal Componitore come contesto "voce
dell'autore", così la Pagina Sacra generata suona come lui e attinge al suo cammino.

**Criteri d'accettazione:**
- Il prompt include un blocco di atomi pertinenti (meditazione/preghiera/gesto/frase) per la
  coordinata del giorno; **nessun atomo `concetto`** esoterico entra nel prompt mainstream.
- Una Pagina Sacra generata per una data nota riflette temi/gesti degli atomi reali.
- Nessuna regressione: `/pagina-sacra/oggi`, `/spirale`, `/admin/componitore` restano 200, log puliti.

**Gate:** nessuno (locale). Riattivare `[ai]` in `wrangler.toml` + `wrangler dev` per generare.
Il primo gate umano è la **Fase 1.5** (semina D1 remota + deploy prod).

## Poi (coerenza del sito)
Striscia-coordinata + cross-link "oggi nella spirale" su santi/preghiere/novene/rosario (non più
silos). Design-language unico propagato.
