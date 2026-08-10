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

**✅ Lezionario TROVATO e catena PROVATA:** `publication.evangelizo.ws/IT/days/{YYYY-MM-DD}` →
`data.readings[]` con `reading_code` (es. "Mt 15,21-28"), copre domeniche ORDINARIE + ferie.
End-to-end verificato: evangelizo(ref) → BibleGet CEI(testo) → versetti reali.

**Risultato da costruire:**
1. `src/lib/evangelizo.ts` — `letturenDelGiorno(dataISO)` → { titolo, letture: [{tipo, riferimento, libro}] }
   (parse di `reading_code`, `#` = segmenti).
2. Pipeline/seed che popola `liturgy` (D1): per una finestra di date → evangelizo(refs) →
   BibleGet(`fetchTestoRiferimento`, testo CEI) → upsert con cache. Rispettare il rate di BibleGet.
3. Accendere `/liturgia/oggi` (già legge da `liturgy`) + sbloccare `vangeloRif` nel generatore.
- **⚠️ Rate-limit BibleGet (errNum 12):** i seed di finestre AMPIE lo superano (90×4 richieste →
  blocco per IP). Perciò: **il testo di massa NON si prende da BibleGet.** BibleGet resta per il
  **giornaliero** (1 giorno = 4 richieste, ok, es. cron). Il **backfill di massa va dai PDF ufficiali**
  dei lezionari (offline, nessun limite) → è la via giusta per lo storico/futuro. `seed-liturgia.mjs`
  ora si ferma con grazia sul rate-limit (tiene i riferimenti, conserva i testi già in cache).
- **Fonte-oro / bulk**: i PDF ufficiali dei lezionari (l'utente li ha) → seed offline robusto.
- Copyright: refs = fatti (ok); testo CEI via BibleGet con cache (scelta informata); commento
  evangelizo NON si ripubblica.

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
