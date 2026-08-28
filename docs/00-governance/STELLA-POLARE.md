# ✦ Stella Polare — Verbum Lucis / Theosis

> Documento d'identità del progetto. Sta **sopra** ogni decisione tecnica.
> Una scelta tecnica non cambia identità, offerta o promesse. In conflitto: **fermarsi e descrivere**, non reinterpretare.

## Identità

L'opera ha **due spazi distinti** e un motore di distribuzione.

### Theosis — il cuore privato

**Theosis è il sistema personale con cui l'autore attraversa, conserva e riconosce il proprio cammino nel tempo liturgico.**

La Liturgia dà il tempo oggettivo. Le Pagine Sacre organizzano il lavoro del giorno. «Oggi cammino come chi…» comprime la Pagina Sacra in un memento portatile usato per tornare alla Presenza durante la vita ordinaria. Quando la stessa coordinata ritorna, `Sei stato qui` restituisce la traccia precedente.

Formula operativa:

> **Ricevi → Porta → Ritorna → Ricorda.**

Theosis contiene corpus, Pagine Sacre, quaderni/quadernini, Praxis, memoria longitudinale, laboratorio Messa/Eucaristia e interpretazioni personali. È **privato per definizione**.

### Verbum Lucis — il servizio pubblico

**Verbum Lucis è un servizio editoriale cattolico italiano semplice, affidabile, fonte-based e hands-off.**

Rende accessibili con ordine e bellezza:

- Liturgia del giorno;
- anno e calendario liturgico;
- letture e riferimenti;
- santi;
- preghiere e novene;
- Rosario;
- Catechismo;
- diocesi, feste e guide fattuali.

Non richiede all'autore di assumere il ruolo di maestro spirituale. Non usa automaticamente il suo cammino personale come insegnamento.

### Fedele Messaggero — la distribuzione

**Fedele Messaggero è il motore che trasforma i soli dati/artefatti pubblici del giorno in formati di distribuzione.**

Web, ricerca, social, video, WhatsApp ed email sono derivazioni di un unico `Public Daily Pack`, non canali che inventano una nuova voce spirituale.

---

## La radice condivisa

L'unica radice dati condivisa tra privato e pubblico è il **Nucleo Liturgico**:

- data e coordinata ecclesiale;
- tempo, colore, settimana, ciclo;
- celebrazione;
- letture;
- santi;
- fonti e provenienza.

La Liturgia è a monte di entrambi i sistemi.

> **L'autorità è nella Liturgia. Non nell'AI.**

---

## Non negoziabili

### 1. Firewall privato/pubblico

Il cammino personale non alimenta automaticamente il pubblico.

È vietata una pipeline:

`corpus privato → RAG → generazione customer-facing → publish`.

Qualunque materiale personale eventualmente pubblicato richiede selezione umana esplicita, nuovo artefatto editoriale, revisione e gate.

### 2. La Pagina Sacra è privata

La Pagina Sacra appartiene a Theosis: è uno strumento quotidiano del cammino, non un articolo pubblico generato in serie.

La sua sezione «Oggi cammino come chi…» ha una funzione operativa di Presenza e resta parte della memoria privata.

### 3. Provenienza prima della sintesi

Il sistema distingue almeno tra fonte ricevuta, testo originale dell'autore, generazione AI, materiale adottato, materiale realmente portato nel quadernino, osservazione di vita e interpretazione personale.

La storia non viene riscritta per renderla coerente retroattivamente.

### 4. AI come strumento, mai autorità

L'AI può cercare, estrarre, collegare, confrontare, comporre bozze private e proporre semi.

Non deve:

- dichiarare la volontà di Dio;
- impersonare Cristo come nuova fonte di rivelazione;
- trasformare interpretazioni personali in dottrina;
- inventare testimonianze;
- confondere similarità semantica con memoria esatta.

Formula permanente:

> **La Liturgia parla. Il corpus testimonia. L'AI collega. L'autore discerne.**

### 5. Pubblico fonte-based e umile

Il pubblico privilegia ciò che è ricevuto e verificabile. Niente `Dio oggi ti dice`, coaching spirituale AI, engagement bait religioso o cosmologia personale presentata come cattolicesimo ufficiale.

### 6. Semplicità fuori, complessità dentro

La sofisticazione del corpus, della Spirale, del grafo e della memoria deve ridurre il carico sull'utente pubblico, non trasferirglielo.

### 7. Qualità tecnica e editoriale

UI leggibile, accessibile e calma. Fonti tracciabili. Core Web Vitals, log puliti, privacy fail-closed, nessun segreto o corpus privato in repository pubblico/artefatti pubblicabili.

---

## «Sei stato qui»

È una funzione **privata**.

Un ritorno liturgico esatto può dire `Sei stato qui`.

Una stessa pericope, uno stesso mistero o una similarità semantica devono essere etichettati diversamente. L'AI non poeticizza un'approssimazione del retrieval.

Il primo elemento mostrato è la traccia originale — soprattutto il memento «Oggi cammino come chi…» — non una valutazione automatica della crescita.

---

## Bussola di monetizzazione

Verbum Lucis può monetizzare più lentamente in cambio di un funzionamento semplice e sostenibile.

Ordine preferito:

1. traffico organico da utility e biblioteca;
2. affiliazione contestuale (Bibbie, messalini, libri/oggetti pertinenti);
3. display ads dove editorialmente adatti;
4. prodotti **strumentali/editoriali** semplici (planner, quaderni, materiali di consultazione) solo con gate umano;
5. sostegno/donazioni discrete.

Non fanno parte del modello di base:

- Maestro Interiore pubblico a pagamento;
- corsi o coaching spirituale;
- preghiere personalizzate a pagamento;
- community ad alta manutenzione;
- monetizzazione della psicologia sacra privata.

Più una pagina è vicina al centro contemplativo/sacramentale, meno rumore commerciale contiene.

---

## Bussola di distribuzione

Il motore pubblico è:

`Daily Liturgical Object → Public Daily Pack → Web / SEO / IG / Stories / video / WhatsApp / email`.

I formati pubblici derivano da dati/fonti verificabili. La distribuzione ideale funziona senza intervento editoriale quotidiano.

Gate umani restano per prima attivazione dei canali, comunicazioni esterne e pubblicazioni secondo `AGENTS.md`.

---

## Documenti di approfondimento

- `docs/00-governance/ORIGIN-SYSTEM.md` — il circuito reale Pagina Sacra → quadernino → Presenza → memoria.
- `docs/00-governance/PRIVATE-PUBLIC-BOUNDARY.md` — firewall e responsabilità dei tre sistemi.
- `DECISIONS.md` — ADR e decisioni superate.
- `ROADMAP.md` — sequenza di lavoro e criteri di uscita.
- `NEXT.md` — un solo risultato attivo.
