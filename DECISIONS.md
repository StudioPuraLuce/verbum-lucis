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
