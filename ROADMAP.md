# ROADMAP — Theosis / Verbum Lucis

> Le fasi e i loro **criteri d'uscita**. Lo stato verificato è in `STATUS.md`; il prossimo risultato unico in `NEXT.md`.
>
> Principio: **prima ricostruiamo e rendiamo utile il sistema privato reale; in parallelo preserviamo il nucleo tecnico già costruito; solo dopo semplifichiamo e lanciamo il pubblico.**

## Sequenza

```text
R0 Governance
→ R1 Origin System / corpus canonico
→ R2 Theosis Oggi
→ R3 Sei stato qui
→ R4 Messa + Praxis
→ P1 Verbum Lucis pubblico
→ P2 Fedele Messaggero / distribuzione
→ P3 SEO / biblioteca
→ M Monetizzazione
```

Le fasi `R*` riguardano il **cuore privato**. Le fasi `P*` riguardano il **servizio pubblico**. `M` monetizza soltanto ciò che ha già dimostrato utilità e traffico.

---

# R0 — Rifondazione e governance  ◐ in corso

## Scopo

Bloccare la nuova identità prima di modificare codice o dati.

## Deliverable

- Stella Polare aggiornata;
- ADR che separano Theosis / Verbum Lucis / Fedele Messaggero;
- `ORIGIN-SYSTEM.md`;
- `PRIVATE-PUBLIC-BOUNDARY.md`;
- roadmap e `NEXT.md` riallineati;
- istruzioni AI/AGENTS riallineate;
- nessun codice applicativo modificato in questa fase.

## Uscita

- nessun documento canonico continua a prescrivere `corpus privato → RAG → pagina pubblica`;
- Pagina Sacra classificata come artefatto privato;
- `Sei stato qui` classificato come privato;
- monetizzazione spirituale/premium rimossa dal percorso di base;
- il prossimo risultato è una ricostruzione verificabile del sistema originario.

---

# R1 — Origin System: ricostruzione canonica del cammino

## Scopo

Ricostruire **dalla prima all'ultima** la catena realmente usata:

`Liturgia → Pagina Sacra → Oggi cammino → quadernino → ritorno alla Presenza`.

Il corpus esistente contiene già una pipeline non-lossy per ricostruire Pagine integrali da export ChatGPT/Gemini + Obsidian. I B5 sono principalmente trascrizioni manoscritte e non vanno ridigitalizzati integralmente come prerequisito.

## R1.1 — Inventario sorgenti

Verificare e censire:

- export ChatGPT usati dalla pipeline;
- export Gemini;
- vault Obsidian;
- Google Drive pertinente;
- output privati della pipeline (`pagine*.jsonl`, cronistoria, curato, D1 locale);
- prompt storici Theosis / Pagina Sacra;
- quadernini «Oggi cammino» come evidenza `carried`.

Produrre un manifest che dica per ogni sorgente:

- path/id;
- arco temporale;
- numero di record noto;
- tipo di contenuto;
- livello di autorità/provenienza;
- se è originale o derivato;
- se è completo o parziale.

## R1.2 — Cronologia Pagine Sacre

Per ogni Pagina Sacra recuperabile:

```text
id stabile
data civile
coordinata liturgica
letture / Vangelo
sorgente e thread/documento
versione integrale
tipo di prompt/modello se ricostruibile
sezioni presenti
Gesto Reale
Oggi cammino verbatim
Sintesi / frase finale
provenienza
```

Non si generano nuove Pagine per riempire buchi.

## R1.3 — Corpus «Oggi cammino»

Estrarre **verbatim** tutte le occorrenze della formula dalle Pagine Sacre.

Costruire un dataset autonomo collegato alle Pagine originali.

Campi minimi:

```text
memento_id
pagina_id
data
coord_liturgica
testo_verbatim
sorgente
stato_provenienza
carried: unknown/yes/no
quadernino_ref: opzionale
variante_assunta: opzionale
```

## R1.4 — Evoluzione del formato

Ricostruire quando sono apparse/scomparse le sezioni della Pagina Sacra e quali varianti di prompt hanno prodotto quali forme.

Obiettivo: distinguere **struttura essenziale** da stratificazioni successive.

## R1.5 — Campione carta

Solo dopo il dataset digitale:

- confrontare un piccolo campione B5 con la sorgente digitale per capire trasformazioni dovute alla trascrizione;
- censire i quadernini tascabili per capire quali memento furono davvero `carried`, modificati o ripetuti.

Non serve fotografare tutto prima di poter procedere.

## Uscita R1

Una data storica campione è ricostruibile end-to-end:

`fonte liturgica → Pagina Sacra digitale → trascrizione/assunzione nota → Oggi cammino → eventuale quadernino`.

Inoltre:

- nessun numero inventato;
- ogni record ha provenance;
- gli atomi sono trattati come indice, non come memoria primaria;
- i gap sono dichiarati, non riempiti dall'AI.

---

# R2 — Theosis Oggi: il ciclo privato quotidiano

## Scopo

Costruire una versione digitale minima che **continui il comportamento reale**, non una dashboard spirituale.

Formula UX:

> **Ricevi → Porta → Ritorna.**

## R2.1 — Daily Liturgical Object

Consolidare l'oggetto giornaliero neutro:

- data;
- coordinate;
- tempo/colore/ciclo;
- celebrazione;
- letture;
- Vangelo;
- fonti/licenze.

Riutilizzare ciò che è già funzionante in `liturgical-spiral.ts`, Evangelizo/LitCal/BibleGet e tabella `liturgy`, correggendo eventuali gap senza cambiare ancora il pubblico.

## R2.2 — Recupero memoria pertinente

Prima della composizione:

- ritorno liturgico esatto;
- stessa Parola;
- stesso mistero;
- echi semantici qualificati.

Ogni risultato mostra la sorgente.

## R2.3 — Pagina Sacra privata

La Pagina Sacra futura può essere:

- recuperata quando esiste già;
- composta come **bozza privata** quando è un giorno nuovo;
- informata da Liturgia + memoria pertinente;
- mai pubblicata automaticamente.

Il prompt non impersona Cristo come autorità. Le sezioni storiche possono restare (`Il Re Oggi`, Fuoco, Presenza, Regno, Gesto...) ma la voce deve dichiarare la propria natura interpretativa.

## R2.4 — Presence Memento

Il sistema produce o propone `Oggi cammino come chi…`.

La frase canonica viene salvata soltanto dopo scelta/modifica dell'autore.

La modalità primaria può continuare a essere:

> **Trascrivilo nel quadernino.**

Opzionale: vista mobile/widget minimale, senza feed e senza gamification.

## R2.5 — Registro del giorno

Salvare soltanto ciò che serve alla memoria futura:

- Pagina usata;
- memento adottato;
- eventuale gesto;
- eventuale nota breve/episodio se l'autore decide di registrarlo.

## Uscita R2

Theosis viene **usato realmente per 14 giorni** senza richiedere modifiche strutturali quotidiane.

Success metric primaria:

> il sistema aiuta a portare una frase nella giornata e a tornarvi; non produce semplicemente output belli.

---

# R3 — «Sei stato qui»: memoria longitudinale

## Scopo

Rendere computabile la Spirale personale senza trasformarla in psicologia automatica.

## R3.1 — Matching rigoroso

Implementare i quattro livelli definiti in ADR-012:

1. ritorno liturgico esatto;
2. stessa Parola;
3. stesso mistero;
4. eco semantica.

## R3.2 — Presentazione

Ordine di default:

1. memento precedente;
2. data/coordinata;
3. Pagina Sacra originale;
4. eventuale nota/gesto;
5. solo dopo, confronto/sintesi AI opzionale con fonti.

Nessuna frase del tipo «sei cresciuto» senza una richiesta esplicita e senza evidenza.

## R3.3 — Test storico

Costruire un set di date note e verificare:

- zero falsi `Sei stato qui`;
- nessuna collisione A/B/C;
- nessuna similarità semantica promossa a ritorno esatto;
- link sempre risolvibili alla sorgente.

## Uscita R3

Almeno 20 casi storici verificati manualmente con classificazione corretta dei ritorni.

---

# R4 — Messa + Praxis del Cammino

## Scopo

Estrarre **traiettorie**, non consigli pubblici.

## R4.1 — Laboratorio Messa/Eucaristia

Ricostruire longitudinalmente:

- preparazione;
- ingresso;
- atto penitenziale;
- Liturgia della Parola;
- offertorio;
- Preghiera Eucaristica;
- Comunione;
- silenzio;
- congedo;
- giornata successiva alla Messa.

Per ogni punto distinguere:

- fonte cattolica ricevuta;
- interpretazione personale;
- pratica sperimentata;
- evoluzione nel tempo;
- correzioni/superamenti.

## R4.2 — Praxis

Far emergere dal corpus le pratiche ricorrenti:

- presenza/distrazione;
- silenzio;
- autoinganno;
- sofferenza/prova;
- conflitto;
- lavoro e denaro;
- servizio invisibile;
- caduta/ritorno;
- altri cluster realmente presenti.

Ogni Praxis conserva la traiettoria completa: problema → tentativi → frizione → pratica → evoluzione.

## Uscita R4

12 dossier privati longitudinali completi, ciascuno con sorgenti e stato attuale, senza universalizzare l'esperienza.

---

# P1 — Verbum Lucis pubblico: servizio semplice

## Scopo

Rendere il sito pubblico indipendente dal corpus privato.

## P1.1 — Firewall tecnico

Dimostrare che:

- nessuna pagina pubblica richiede `pagine_corpus`/`atomi_corpus`/Theosis;
- route e storage privati non sono esposti;
- sitemap/log/cache pubblicabili non contengono testo privato;
- non esiste job automatico private→publish.

## P1.2 — Superficie pubblica

Priorità:

- `/oggi` / liturgia del giorno;
- calendario/Spirale liturgica pubblica;
- santi;
- preghiere/novene;
- Rosario;
- Catechismo;
- diocesi;
- guide fattuali source-based.

La UX deve essere calma, leggibile e senza voce da maestro.

## P1.3 — Fonti e diritti

Per ogni famiglia di pagine:

- fonte canonica;
- licenza/diritto di ripubblicazione;
- aggiornamento;
- fallback;
- provenance visibile dove opportuno.

## Uscita P1

Il sito pubblico può essere deployato e funzionare **senza alcun accesso al corpus privato**.

Deploy produzione resta gate umano.

---

# P2 — Fedele Messaggero: distribuzione hands-off

## Scopo

Una sola realtà liturgica quotidiana, molti formati, nessun insegnamento personale automatico.

## Public Daily Pack

Produrre automaticamente:

- web;
- 1 asset social principale;
- stories;
- short/reel opzionale;
- WhatsApp opt-in;
- digest email opzionale.

Tutto deve derivare da dati/fonti pubbliche.

No engagement bait religioso. No preghiera AI personalizzata. No voce «Dio ti dice».

## Uscita P2

**30 giorni consecutivi** di pack corretti generati senza intervento editoriale quotidiano.

L'attivazione effettiva dei canali resta gate umano.

---

# P3 — Biblioteca + SEO organico

## Scopo

Crescita lenta e cumulativa tramite utilità.

Priorità da validare con dati reali:

- pagine liturgiche;
- santi e patronati;
- preghiere/novene;
- Catechismo;
- calendario e diocesi;
- guide fattuali;
- internal linking basato sul giorno liturgico.

Non creare migliaia di pagine solo perché la combinatoria lo permette.

## Uscita P3

- sitemap stabile;
- Search Console collegata;
- pagine indicizzate e query reali osservabili;
- primi cluster con impression/click organici;
- nessun aumento del carico editoriale quotidiano.

---

# M — Monetizzazione

## Principio

Monetizzare **utilità e traffico**, non direzione spirituale.

## Ordine

1. affiliazione contestuale dove naturale;
2. advertising sulle pagine informative adatte;
3. prodotti strumentali/editoriali semplici solo se richiesti dai dati;
4. sostegno/donazioni discrete.

KDP non è un obbligo né il primo prodotto per definizione.

## Uscita iniziale

Primo euro generato senza introdurre:

- coaching;
- community manuale;
- pubblicazione automatica del corpus;
- contenuti spirituali personali a pagamento;
- lavoro operativo giornaliero aggiuntivo.

---

# Regola contro l'overbuilding

Ogni fase ha un solo test:

> **Questa cosa serve il ciclo privato reale oppure riduce il lavoro del servizio pubblico?**

Se non fa nessuna delle due cose, non entra nel critical path.
