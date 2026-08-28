# PRIVATE / PUBLIC BOUNDARY

> Vincolo architetturale tra **Theosis privato**, **Verbum Lucis pubblico** e **Fedele Messaggero**.
> La separazione non è una preferenza editoriale: è un requisito di prodotto e di sicurezza.

## 1. Tre sistemi, una sola radice condivisa

### Theosis — privato

Sistema personale di cammino.

Contiene:

- corpus integrale;
- Pagine Sacre private;
- quaderni e quadernini;
- «Oggi cammino come chi…»;
- `Sei stato qui`;
- Praxis;
- laboratorio Messa/Eucaristia;
- mappe e interpretazioni personali;
- psicologia sacra;
- cronologia del cammino;
- AI come archivista, retriever, compositore e specchio con provenance.

### Verbum Lucis — pubblico

Servizio editoriale cattolico semplice, fonte-based e hands-off.

Contiene principalmente:

- Liturgia del giorno;
- calendario e anno liturgico;
- riferimenti e testi pubblicabili/licenziati delle letture;
- santi;
- preghiere e novene da fonti attribuibili;
- Rosario;
- Catechismo;
- diocesi e feste;
- guide fattuali e source-based;
- navigazione della Spirale liturgica senza cosmologia privata.

Non assume il ruolo di maestro spirituale e non usa automaticamente la storia personale dell'autore come insegnamento.

### Fedele Messaggero — distribuzione

Motore di distribuzione dei soli artefatti pubblici.

Riceve dal Nucleo Liturgico / Verbum Lucis un `Public Daily Pack` e lo trasforma in formati di canale.

Esempi:

- pagina Web;
- card o carousel social;
- stories;
- short/reel fonte-based;
- messaggio WhatsApp opt-in;
- eventuale digest email.

Fedele Messaggero **non legge Theosis** per generare contenuti pubblici.

---

## 2. Nucleo condiviso: Daily Liturgical Object

L'unico asse dati condiviso è il giorno liturgico ricevuto.

Un oggetto giornaliero canonico può includere:

```text
data civile
coordinate ecclesiali
tempo liturgico
settimana
colore
ciclo A/B/C
ciclo feriale I/II
celebrazione/memoria
letture e riferimenti
salmo
Vangelo
santi del giorno
fonti e licenze/provenienza
```

Questo oggetto è **neutro rispetto al cammino personale**.

Da qui si biforca:

```text
                     DAILY LITURGICAL OBJECT
                              │
                 ┌────────────┴────────────┐
                 │                         │
                 ▼                         ▼
             THEOSIS                  VERBUM LUCIS
             PRIVATO                    PUBBLICO
```

---

## 3. Firewall non negoziabile

È vietata una pipeline automatica del tipo:

```text
corpus privato
→ RAG
→ generatore customer-facing
→ publish
```

Il confine corretto è:

```text
PRIVATE MATERIAL
      │
      X  nessun attraversamento automatico
      │
PUBLIC MATERIAL
```

Se un giorno l'autore decide deliberatamente di pubblicare qualcosa nato nel proprio cammino:

```text
materiale privato
→ selezione umana esplicita
→ nuovo artefatto editoriale pubblico
→ controllo fonti / tono / privacy / teologia
→ gate di pubblicazione
```

L'artefatto pubblico non è una vista diretta del record privato.

---

## 4. Dati vietati nel pubblico automatico

Non possono essere inseriti automaticamente in prompt/output pubblici:

- testimonianze autobiografiche;
- nomi, relazioni e circostanze private;
- `Oggi cammino` personali;
- note del quaderno;
- `Sei stato qui`;
- analisi longitudinali dell'autore;
- interpretazioni della psicologia sacra;
- atomi `testimonianza` o `concetto` privati;
- sintesi AI prodotte sul corpus privato;
- materiale classificato `user-original`, `user-adopted`, `carried`, `life-observation` salvo export editoriale esplicito.

---

## 5. Voce pubblica

Il pubblico deve percepire Verbum Lucis come:

- sobrio;
- utile;
- bello;
- silenzioso;
- trasparente sulle fonti;
- liturgicamente ordinato;
- non manipolativo;
- non personalistico.

Da evitare nel generatore pubblico:

- «Dio oggi ti dice…»;
- «Gesù vuole che tu…»;
- impersonazione di Cristo;
- diagnosi spirituali personalizzate;
- preghiere personalizzate a pagamento;
- coaching spirituale AI;
- cosmologia personale presentata come dottrina;
- engagement bait religioso (`scrivi Amen se...`).

Il pubblico può offrire strumenti e fonti senza pretendere di dirigere la vita spirituale dell'utente.

---

## 6. Spirale: due profondità

La stessa struttura temporale può avere due usi.

### Pubblico

La Spirale è navigazione dell'anno liturgico:

- dove siamo;
- cosa precede;
- cosa segue;
- tempi, colori e cicli;
- ritorno annuale delle celebrazioni e delle letture.

### Privato

La coordinata apre:

- precedenti Pagine Sacre;
- memento portati;
- Praxis;
- ritorni;
- cronologia personale;
- mappe e letture interpretative.

La complessità privata non deve trapelare nella UX pubblica.

---

## 7. Monetizzazione pubblica

Il modello economico deve essere compatibile con un progetto hands-off e con il rifiuto di assumere un ruolo di insegnamento spirituale.

### Ammesso

- advertising su pagine informative/utility adatte;
- affiliazione contestuale su Bibbie, messalini, libri e oggetti pertinenti;
- prodotti editoriali/strumentali semplici (planner, quaderni, materiali di consultazione) con gate umano;
- donazioni/sostegno discreto;
- eventuali partnership editoriali coerenti.

### Non parte del modello

- Maestro Interiore pubblico in abbonamento;
- spiritual coaching;
- community ad alta manutenzione;
- corsi sulla psicologia sacra dell'autore;
- preghiere personalizzate a pagamento;
- paywall sulla direzione spirituale;
- monetizzazione della paura, colpa o scrupolo religioso.

### Geografia commerciale

Più una pagina è vicina al centro contemplativo/sacramentale, meno rumore commerciale deve contenere.

Le pagine di utility e discovery possono sostenere il progetto. La pagina quotidiana centrale può restare molto più pulita.

---

## 8. Distribuzione hands-off

Il `Public Daily Pack` deve derivare da dati e fonti verificabili, non da una riflessione privata.

Esempio:

```text
Daily Liturgical Object
        ↓
Public Daily Pack
        ├── web page
        ├── social card
        ├── story frames
        ├── video/short
        ├── WhatsApp message
        └── email digest
```

Obiettivo operativo: **30 giorni consecutivi di distribuzione senza intervento editoriale quotidiano** prima di aggiungere complessità.

Gate umani restano per la prima attivazione dei canali e per comunicazioni esterne secondo `AGENTS.md`.

---

## 9. Criterio di accettazione del firewall

Prima di ogni deploy pubblico deve essere dimostrabile che:

1. nessun record privato è necessario per generare una pagina pubblica;
2. il generatore pubblico può funzionare con il solo Nucleo Liturgico + fonti pubbliche;
3. nessun endpoint pubblico espone tabelle/route private;
4. nessuna indicizzazione, sitemap o log pubblicabile include contenuto privato;
5. un eventuale export privato→pubblico richiede un'azione umana distinta e tracciabile;
6. i test falliscono se una pipeline automatica tenta di attraversare il confine.

---

## 10. Formula di governo

> **Theosis custodisce il cammino.**  
> **Verbum Lucis rende accessibile ciò che è ricevuto.**  
> **Fedele Messaggero distribuisce senza mettersi in mezzo.**
