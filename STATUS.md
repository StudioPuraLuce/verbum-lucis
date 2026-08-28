# STATUS — Theosis / Verbum Lucis

> Stato **verificato**, non aspirazionale. Data: 2026-08-28.
> Branch di rifondazione documentale: `docs/theosis-private-refoundation`.
> Base tecnica: `claude/cloudflare-migration` @ `46d9a7b4b5db3dde933e00bebfb2af3598911cf7`.

## Stato strategico

La direzione di prodotto è stata **rifondata** dopo la rilettura del corpus, dei prompt storici, di
Fedele Messaggero e del funzionamento reale dei quaderni.

Decisioni ora canoniche su questa branch:

- **Theosis** = sistema personale e privato del cammino;
- **Verbum Lucis** = servizio pubblico cattolico semplice, fonte-based e hands-off;
- **Fedele Messaggero** = distribuzione dei soli artefatti pubblici;
- la **Pagina Sacra è privata**;
- `Oggi cammino come chi…` è un **Presence Memento** portato nel quadernino per ritornare alla
  Presenza durante il giorno;
- `Sei stato qui` è memoria privata con matching rigoroso;
- nessuna pipeline automatica `corpus privato → RAG → pubblico`;
- monetizzazione pubblica = utilità/traffico (affiliate, ads dove adatti, prodotti strumentali
  eventuali, sostegno), non direzione spirituale.

Il codice non è stato ancora modificato per questa rifondazione.

## Chiarimento storico verificato dall'autore

- I tre quaderni B5 erano principalmente **trascrizioni integrali delle Pagine Sacre**.
- Le Pagine Sacre digitali esistono dalla prima all'ultima usata nel cammino; non è quindi
  necessario ridigitalizzare integralmente i B5 per ricostruire il contenuto.
- I quadernini `Oggi cammino` prendevano la sezione omonima della Pagina Sacra e venivano portati
  con sé durante la giornata per ritornare ripetutamente alla Presenza.

Questo rende la catena originaria:

`Liturgia → Pagina Sacra → B5/assunzione → Oggi cammino → quadernino → Presenza`.

## Stato tecnico ereditato dalla branch Claude

### Infrastruttura

- Astro 5 SSR + Cloudflare adapter + D1 + KV.
- Build/dev locale già verificati nella sessione precedente.
- Nessun deploy produzione effettuato.

### Spina liturgica

- `src/lib/liturgical-spiral.ts` presente e funzionante come coordinata offline.
- viste Spirale già implementate.
- restano gap storici di mappatura in alcuni periodi, da trattare più avanti.

### Liturgia del giorno

- Evangelizo fornisce riferimenti;
- BibleGet fornisce testo CEI con rate-limit gestito;
- LitCal fornisce calendario/celebrazioni;
- `scripts/seed-liturgia.mjs` e `/liturgia/oggi` già funzionanti su finestra locale verificata.

Questo lavoro resta utile perché costituisce il futuro **Nucleo Liturgico condiviso**.

### Corpus privato

Pipeline in `corpus/pipeline/` già costruita:

- ingest export ChatGPT/Gemini + Obsidian;
- segmentazione in Pagine;
- coordinata liturgica;
- cronistoria/inventario;
- grafo;
- curatela;
- semina `pagine_corpus` in D1 locale;
- estrazione atomi verbatim;
- Corpo della Dottrina.

Ultimi conteggi documentati dalla branch precedente:

- 10.962 frammenti nella Sessione 1;
- 1.085 Pagine prima della curatela;
- 923 Pagine curate;
- 7.423 atomi nella successiva estrazione ampliata;
- 2.716 concetti nel Corpo della Dottrina.

Questi numeri restano **stato storico verificato della pipeline precedente**, ma R1 dovrà produrre
conteggi specifici e verificati delle sole Pagine Sacre / `Oggi cammino`.

### Componitore e generatore

- `src/lib/componitore.ts` è già capace di selezionare atomi pertinenti per coordinata;
- esiste un generatore/renderer di Pagina Sacra orientato al pubblico sulla branch Claude.

**Cambio di ruolo:**

- il Componitore è candidato a diventare retriever privato di Theosis;
- il generatore pubblico di Pagina Sacra **non va collegato al RAG** come previsto dal vecchio
  `NEXT.md`;
- schema e codice esistenti non si cancellano finché non viene completato R1 e deciso il riuso.

## Governance aggiornata

Creati/aggiornati su questa branch:

- `docs/00-governance/STELLA-POLARE.md`;
- `docs/00-governance/ORIGIN-SYSTEM.md`;
- `docs/00-governance/PRIVATE-PUBLIC-BOUNDARY.md`;
- `DECISIONS.md` con ADR-009…014;
- `ROADMAP.md`;
- `NEXT.md`;
- `AGENTS.md`.

## Fase corrente

**R0 — Rifondazione e governance**: quasi chiusa.

Il prossimo risultato unico è **R1-first-slice — Origin System audit**: verificare le sorgenti
private reali, costruire la cronologia delle Pagine Sacre e il dataset verbatim `Oggi cammino` con
provenance.

Vedi `NEXT.md`.

## Cose esplicitamente ferme

Finché R1 non è verificata:

- niente RAG nel generatore pubblico;
- niente semina corpus remota;
- niente deploy pubblico motivato dalla vecchia roadmap;
- niente `Sei stato qui` costruito su embedding senza cronologia;
- niente KDP come obiettivo obbligatorio;
- niente attivazione social/WhatsApp;
- nessuna cancellazione del lavoro già fatto sulla branch Claude.
