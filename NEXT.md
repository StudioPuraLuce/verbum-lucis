# NEXT — il prossimo risultato unico

> Un solo risultato alla volta, con criteri d'accettazione e gate. Quando è fatto e verificato, si
> aggiorna `STATUS.md` + `CHANGELOG.md` e si sceglie il prossimo da `ROADMAP.md`.

## Ora: Fase 1 — RAG nel generatore (la "voce dell'autore")

Il Componitore c'è (`src/lib/componitore.ts`, verificato su `/admin/componitore`). Il prossimo
risultato è usarlo per **nutrire il generatore Pagina Sacra** con gli atomi reali dell'autore.

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
