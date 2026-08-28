# AGENTS.md — istruzioni permanenti per l'AI su Verbum Lucis / Theosis

> Come si lavora qui. Leggi prima `docs/00-governance/STELLA-POLARE.md` (identità, invarianti) e
> `STATUS.md` (dov'è il progetto ora). Questo file dice **come** operare.

## Missione

Mantenere due obiettivi distinti senza confonderli:

1. **Theosis** — continuare e custodire il sistema personale di cammino, con memoria fedele,
   provenance e AI come strumento;
2. **Verbum Lucis** — costruire un servizio pubblico cattolico semplice, fonte-based, tecnicamente
   eccellente e tendenzialmente hands-off.

**Fedele Messaggero** distribuisce soltanto materiale pubblico.

## Ordine di autorità

1. `docs/00-governance/STELLA-POLARE.md` — identità e non-negoziabili.
2. `docs/00-governance/ORIGIN-SYSTEM.md` — funzione reale del sistema privato.
3. `docs/00-governance/PRIVATE-PUBLIC-BOUNDARY.md` — firewall.
4. Questo `AGENTS.md` — metodo e invarianti tecnici.
5. `DECISIONS.md` — ADR, incluse quelle che superano decisioni precedenti.
6. `ROADMAP.md` → `NEXT.md` — cosa costruire ora.

Una decisione tecnica non cambia identità/offerta/promesse. Se un'implementazione richiede di
violare un livello più alto: **fermarsi e descrivere il conflitto**, non reinterpretare.

---

## Invarianti

### Firewall privato/pubblico

- **Mai** pipeline automatica `corpus privato → RAG → generatore pubblico → publish`.
- Il pubblico deve poter funzionare con **Nucleo Liturgico + fonti pubbliche/attribuibili**.
- Qualunque export privato→pubblico richiede selezione umana esplicita, nuovo artefatto editoriale
  e gate di pubblicazione.
- `Sei stato qui`, `Oggi cammino`, quaderni, Praxis e analisi longitudinali sono private.

### Privacy corpus

Gli artefatti-testimonianza restano gitignorati (`corpus/*.jsonl`, cache, HTML privati, SQLite,
seed privati, export, scansioni). In git entrano codice, schema e report aggregati senza testo
personale.

`.dev.vars`, token, credenziali, export personali e path sensibili **mai** committati.

### Provenienza

Non confondere:

- fonte ricevuta;
- testo originale autore;
- output AI;
- output adottato/modificato;
- memento realmente portato;
- osservazione di vita;
- interpretazione personale;
- comprensione storica poi superata.

Se lo stato non è verificato usare `unknown`, non inferire.

### Fonte di verità

- `db/schema.ts` = verità dello schema applicativo.
- `src/lib/liturgical-spiral.ts` = motore deterministico della coordinata liturgica.
- La **Pagina integrale** è superiore agli atomi come memoria del cammino.
- Gli atomi/embedding/ranking sono indici ricostruibili, non sostituti della sorgente.

---

## AI: ruolo

### Privato / Theosis

L'AI può:

- estrarre e classificare;
- cercare e collegare;
- confrontare ritorni;
- comporre bozze private della Pagina Sacra;
- proporre semi per `Oggi cammino`;
- sintetizzare evoluzioni con citazione delle sorgenti.

Non può:

- dichiarare cosa Dio vuole;
- impersonare Cristo come nuova autorità;
- inventare testimonianze;
- riscrivere il passato;
- trasformare una similarità in `Sei stato qui`.

Formula: **La Liturgia parla. Il corpus testimonia. L'AI collega. L'autore discerne.**

### Pubblico / Verbum Lucis

Preferire trasformazioni deterministiche/source-based. L'AI può aiutare con:

- normalizzazione;
- riassunti fattuali verificabili;
- formattazione;
- metadata/SEO sotto controllo;
- derivazione multiformato dal `Public Daily Pack`.

Da evitare:

- `Dio oggi ti dice...`;
- coaching spirituale AI;
- diagnosi personali;
- preghiere personalizzate a pagamento;
- engagement bait religioso;
- cosmologia privata presentata come dottrina cattolica.

---

## Principi tecnici

- **Offline-first** per ciò che è calcolabile (coordinata liturgica).
- **Fonte esplicita** per ciò che arriva dalla rete (letture, santi, ecc.).
- **Idempotenza** per batch e ingest; cache per-record dove utile.
- **Fail-closed** su privacy e pubblicazione.
- **Costo consapevole**: modello economico per lavoro meccanico; modello forte soltanto dove la
  qualità lo richiede.
- **Zero output privato in log pubblicabili**.
- Lingua operativa: italiano; timezone: `Europe/Rome`.

### Cloudflare / AI Gateway

Lo stack corrente usa Cloudflare Workers/D1/KV e AI Gateway `verbum-lucis`. Le configurazioni
tecniche già funzionanti non vanno cambiate durante la rifondazione documentale se non richiesto dal
`NEXT.md`.

Se si usa Anthropic via Gateway, rispettare nomi modello e configurazione correnti nel codice/env;
non hardcodare segreti nei documenti o nei sorgenti.

---

## Gate umani

Richiedono approvazione esplicita:

- semina D1 remota/prod;
- deploy produzione;
- attivazione/invio su social, WhatsApp o email;
- prezzi;
- KDP/stampe/listing;
- pubblicazioni;
- export di materiale privato verso pubblico;
- operazioni distruttive;
- modifiche che rendano accessibili dati Theosis dall'esterno.

Una richiesta esplicita dell'utente nel turno corrente può costituire il gate per l'azione descritta,
ma non autorizza azioni ulteriori non implicate.

---

## Metodo di lavoro

1. Leggi Stella Polare → Origin System → Boundary → STATUS → ROADMAP → NEXT.
2. Verifica lo stato reale prima di modificare.
3. Dichiara file/risorse toccati e assunzioni.
4. Fai **una minima fetta verticale**.
5. Verifica con dati reali/test, non con intenzioni.
6. Aggiorna `STATUS.md`, `CHANGELOG.md`, `NEXT.md`.
7. Non accelerare verso deploy/monetizzazione saltando i criteri d'uscita.

## Definizione di completato

Un risultato è completato quando:

- sorgenti e provenance sono definite;
- stati/ID sono canonici;
- errori e ambiguità sono rappresentati esplicitamente;
- il processo è riavviabile/idempotente quando pertinente;
- i criteri d'accettazione sono verificati;
- privacy/firewall restano intatti;
- documentazione canonica è aggiornata;
- nessun numero o fatto è inventato.
