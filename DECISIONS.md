# DECISIONS — Verbum Lucis (ADR)

> Decisioni architetturali/di prodotto, numerate e immutabili. Si aggiungono, non si riscrivono
> (una decisione superata si marca "superata da ADR-N").

## ADR-001 — Portale rifondato sulla liturgia a spirale (2026-08-08)
Il modello del tempo è la **coordinata liturgica** (tempo, colore, ciclo A/B/C, feriale I/II,
settimana, Vangelo-tonalità, centro), non il calendario gregoriano. Motore deterministico offline
`src/lib/liturgical-spiral.ts`, unica autorità. *Perché*: dà una spina coerente e un'identità
propria; la data resta un mapping.

## ADR-002 — L'AI è lo strumento per scomporre E comporre (2026-08-09)
La vecchia regola "il corpus non si genera con l'AI" è **morta** (superata su indicazione esplicita
dell'utente). L'AI scompone (atomi, dottrina) e compone (pagine, libri, preghiere, post, cammini).
Unici argini: ortodossia nel mainstream + fedeltà verbatim in scomposizione. *Superata la regola in
`hermes-context`.*

## ADR-003 — Il corpus reale resta privato (2026-08-09)
Il cammino personale non si pubblica tale e quale. Alimenta il sito come carburante (atomi, RAG,
composizione) e — in futuro — una stanza privata. *Perché*: richiesta esplicita dell'utente.

## ADR-004 — Scomposizione = AI estrattiva verbatim (2026-08-09)
Gli atomi sono **citazioni testuali** tipizzate (non parafrasi), con guardia anti-allucinazione
(l'atomo dev'essere sottostringa normalizzata della fonte). Ontologia: insegnamento · preghiera ·
gesto · simbolo · meditazione · testimonianza · frase · concetto.

## ADR-005 — Strato fedele `pagine_corpus` distinto dai riquadri `pagine_sacre` (2026-08-09)
Le Pagine reali intere vivono in `pagine_corpus` (testo integrale + coordinata); `pagine_sacre`
resta per le pagine generate a riquadri. *Perché*: non-lossy, rispetta la fedeltà del corpus.

## ADR-006 — Lancio incrementale presto (2026-08-09)
Online al più presto la base pronta con affiliazione/ads attivi, si perfeziona dal vivo. *Perché*:
il collo di bottiglia è il traffico; il flywheel organico deve partire subito.

## ADR-007 — Primo prodotto proprio = eBook KDP (2026-08-09)
Il primo prodotto a margine alto è un eBook composto dagli atomi, su KDP + PDF. *Perché*: estende il
brand IG "Fedele Messaggero" già esistente; barriera di produzione bassa.

## ADR-008 — Modello per il lavoro giusto: Haiku per il meccanico, Sonnet per la voce (2026-08-09)
L'estrazione batch verbatim gira su **Haiku** (via Gateway, ~3× più economico); la generazione
customer-facing ("voce del Re") resta su **Sonnet**. Le pagine già estratte con Sonnet restano in
cache (non si ripagano). Pagine di qualità < 5 escluse dall'estrazione (rumore). *Perché*: costo —
il lavoro meccanico non richiede Sonnet; Gemini/Vertex scartati per attrito (chiave + fatturazione
separata + parser diverso) su un lavoro una-tantum.

---

## ADR-009 — Tre sistemi: Theosis privato, Verbum Lucis pubblico, Fedele Messaggero distribuzione (2026-08-28)

**Decisione.** L'opera viene separata concettualmente in tre sistemi con responsabilità diverse:

- **Theosis**: sistema personale e privato del cammino;
- **Verbum Lucis**: servizio editoriale cattolico pubblico, fonte-based e hands-off;
- **Fedele Messaggero**: motore di distribuzione dei soli artefatti pubblici.

L'unico nucleo condiviso è il **giorno liturgico ricevuto** (coordinate, letture, celebrazioni,
santi, fonti). La complessità privata non è un livello premium del sito pubblico.

*Perché*: la struttura originaria serviva il cammino dell'autore; trasformarla automaticamente in
insegnamento per altri imporrebbe un ruolo che l'autore non intende assumere.

**Supera** la parte di ADR-003 secondo cui il corpus privato alimenta automaticamente il sito come
carburante e supera l'idea dei "due corpi" pubblico/premium della Stella Polare precedente.

## ADR-010 — La Pagina Sacra torna a essere un artefatto privato di Theosis (2026-08-28)

**Decisione.** La Pagina Sacra non è un articolo customer-facing generato quotidianamente.

La sua funzione canonica è quella storica:

`Liturgia → Pagina Sacra → trascrizione/assunzione → Oggi cammino → giornata → ritorno alla Presenza`.

La Pagina Sacra privata può essere assistita dall'AI, ma la Liturgia resta l'autorità e l'AI non
impersona Cristo come nuova fonte di rivelazione.

«Oggi cammino come chi…» è un **Presence Memento**: la versione canonica del giorno è ciò che
l'autore sceglie/modifica/assume, non semplicemente l'output del modello.

**Supera** l'uso customer-facing della Pagina Sacra implicito in ADR-002, ADR-005 e ADR-008. Gli
oggetti/schema esistenti possono essere riutilizzati tecnicamente, ma il loro ruolo di prodotto va
riesaminato.

## ADR-011 — Firewall assoluto: nessuna pipeline automatica Theosis → pubblico (2026-08-28)

**Decisione.** È vietata la pipeline:

`corpus privato → RAG → generatore pubblico → publish`.

Il pubblico deve poter essere generato dal solo **Nucleo Liturgico + fonti pubbliche/attribuibili**.

Se l'autore sceglie di pubblicare materiale personale, crea deliberatamente un **nuovo artefatto
editoriale pubblico** sottoposto a revisione e gate. Il record privato non diventa mai direttamente
una pagina pubblica.

*Perché*: privacy, responsabilità spirituale, provenienza e sostenibilità del progetto richiedono un
confine strutturale e non soltanto editoriale.

**Supera** il RAG pubblico previsto da ADR-003 e dalla roadmap precedente.

## ADR-012 — «Sei stato qui» è memoria privata rigorosa, non similarità poetizzata (2026-08-28)

**Decisione.** `Sei stato qui` appartiene soltanto a Theosis.

Gerarchia dei ritorni:

1. **ritorno liturgico esatto** → può dire `Sei stato qui`;
2. **stessa Parola/pericope** → `Questa Parola è già passata nel tuo cammino`;
3. **stesso mistero/festa/nodo** → `Questo mistero è già tornato`;
4. **similarità semantica** → `C'è un'eco nel corpus`.

Il primo elemento mostrato è la traccia originale, in particolare il `Presence Memento` realmente
assunto/portato, non una valutazione AI della crescita.

*Perché*: la memoria deve restare fedele e verificabile. Un embedding non è un ricordo.

## ADR-013 — Provenienza personale e gerarchia delle fonti del cammino (2026-08-28)

**Decisione.** Gli atomi restano utili come indice, ma non sono il livello canonico della memoria.

Gerarchia di fedeltà:

1. sorgente digitale/originale;
2. Pagina Sacra integrale;
3. versione assunta/trascritta;
4. `Oggi cammino` effettivamente portato nel quadernino;
5. estrazioni/atomi;
6. embedding, ranking e sintesi AI.

I tre B5 sono principalmente **trascrizioni manoscritte delle Pagine Sacre**, quindi sono evidenza
materiale dell'assunzione e non una sorgente testuale mancante da ridigitalizzare integralmente.

Ogni unità importante deve poter distinguere almeno: `received`, `user-original`, `ai-generated`,
`user-adopted`, `carried`, `life-observation`, `personal-interpretation`, `historical-stage`,
`superseded`.

*Perché*: il sistema deve distinguere ciò che fu ricevuto, generato, scelto, portato e realmente
vissuto senza riscrivere il passato.

## ADR-014 — Il business pubblico monetizza utilità e traffico, non direzione spirituale (2026-08-28)

**Decisione.** Il modello pubblico privilegia una crescita più lenta ma hands-off:

- SEO e utility cattoliche fonte-based;
- affiliazione contestuale;
- advertising dove editorialmente appropriato;
- prodotti strumentali/editoriali semplici con gate umano;
- donazioni/sostegno discreto.

Non fanno parte del modello di base: Maestro Interiore pubblico a pagamento, coaching, corsi di
psicologia sacra, preghiere personalizzate a pagamento, community ad alta manutenzione.

La distribuzione deriva da un `Public Daily Pack` fonte-based su Web/social/video/WhatsApp/email e
deve tendere a funzionare senza intervento editoriale quotidiano.

**Supera** ADR-006 come priorità di lancio immediato prima della rifondazione e **supera ADR-007**:
l'eBook KDP non è più il primo prodotto obbligatorio. Eventuali prodotti editoriali saranno scelti
solo dopo verifica del traffico e con gate umano.
