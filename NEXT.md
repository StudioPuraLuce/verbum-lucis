# NEXT — il prossimo risultato unico

> Un solo risultato alla volta, con criteri d'accettazione e gate. Quando è fatto e verificato, si aggiorna `STATUS.md` + `CHANGELOG.md` e si sceglie il prossimo da `ROADMAP.md`.

# Ora: R1 — ricostruire l'Origin System dalla prima all'ultima Pagina Sacra

## Perché questo viene prima del codice

Il codice attuale ha già costruito molto valore: spina liturgica, letture, D1, corpus, atomi, grafo,
Componitore e generatore.

Ma la direzione di prodotto è cambiata:

- la **Pagina Sacra è privata**;
- «Oggi cammino come chi…» è un **Presence Memento**, non una chiusa editoriale;
- `Sei stato qui` è memoria privata;
- il corpus non deve più alimentare automaticamente pagine pubbliche;
- Verbum Lucis pubblico deve poter vivere soltanto di Nucleo Liturgico + fonti pubbliche.

Prima di riusare il codice dobbiamo conoscere esattamente il sistema che stiamo continuando.

---

## Risultato unico

Produrre una **cronologia verificabile delle Pagine Sacre** e il primo dataset canonico degli
`Oggi cammino`, con provenance.

Il lavoro parte dalle sorgenti digitali già esistenti — export ChatGPT/Gemini, Obsidian e output
della pipeline del corpus — non dalla ridigitalizzazione integrale dei B5, che sono principalmente
trascrizioni manoscritte delle Pagine Sacre.

---

## Passo 1 — verificare le sorgenti reali

La pipeline corrente dichiara sorgenti locali in:

- export ChatGPT;
- vault Obsidian;
- export Gemini;
- output privati `corpus/*.jsonl`, cronistoria/curato/diario;
- D1 locale `pagine_corpus`.

Verificare sul filesystem reale quali sono ancora presenti e produrre un manifest **senza copiare
contenuto privato in git**.

Campi manifest:

```text
source_id
kind
local_path_or_private_ref
date_range
record_count
complete/partial/unknown
original/derived
notes
```

In git entra soltanto il manifest **senza testo privato né path/segreti sensibili**, oppure uno
schema/report aggregato se i path stessi sono da trattare come privati.

---

## Passo 2 — costruire la cronologia Pagina Sacra

Dagli output privati esistenti ricostruire ogni `pagina-sacra` con:

```text
pagina_id
data
coord_liturgica
letture/vangelo
source_ref
testo_integrale
sezioni_presenti
gesto_reale
oggi_cammino_verbatim
sintesi
provenance
```

Regole:

- nessun testo inventato per riempire buchi;
- nessuna parafrasi al posto della sezione originale;
- se data/letture sono ambigue, marcare `unknown/ambiguous`;
- preservare varianti quando la stessa giornata ha più versioni;
- distinguere la Pagina completa dagli atomi derivati.

Output privato suggerito:

`corpus/origin/pagine-sacre-origin.jsonl`

(gitignored).

---

## Passo 3 — estrarre il corpus «Oggi cammino»

Estrarre **verbatim** la formula da ogni Pagina Sacra che la contiene.

Schema minimo:

```text
memento_id
pagina_id
data
coord_liturgica
testo_verbatim
source_ref
provenance_origin
adoption_state
carried_state
quadernino_ref
```

Stati iniziali consentiti:

- `adoption_state`: `unknown | generated | adopted | modified`;
- `carried_state`: `unknown | yes | no`.

Non inferire `carried=yes` dal semplice fatto che la Pagina esista. Verrà verificato più avanti
contro i quadernini tascabili.

Output privato suggerito:

`corpus/origin/oggi-cammino.jsonl`

(gitignored).

---

## Passo 4 — ricostruire l'evoluzione del formato

Produrre un report aggregato, senza testo privato completo, che mostri:

- prima/ultima data disponibile;
- numero di Pagine Sacre;
- copertura per periodo liturgico;
- frequenza delle sezioni;
- quando compaiono/scompaiono `Il Re Oggi`, `Fuoco`, `Presenza`, `Regno`, `Rosario`, `Gesto`,
  `Avversario`, `Oggi cammino`, `Sintesi`;
- fonti/modelli/prompt quando ricostruibili;
- gap e ambiguità.

Questo report può entrare in git perché contiene struttura e conteggi, non il corpus privato.

Output suggerito:

`docs/research/ORIGIN-SYSTEM-AUDIT.md`

---

## Criteri d'accettazione

R1-first-slice è completata solo quando:

1. **una data campione** può essere seguita dalla sorgente originale alla Pagina integrale e al suo
   `Oggi cammino`;
2. l'estrazione `Oggi cammino` è verbatim e linkata alla Pagina sorgente;
3. ogni record ha provenance e stato di adozione/trasporto esplicito o `unknown`;
4. gli atomi non vengono usati come sostituto della Pagina integrale;
5. nessun buco viene riempito da generazione AI;
6. i B5 non vengono trattati come sorgente mancante se il testo digitale esiste già;
7. i quadernini vengono riservati alla fase di verifica `carried`, non usati come prerequisito;
8. nessun contenuto privato nuovo viene committato accidentalmente;
9. viene aggiornato `STATUS.md` con conteggi **verificati**, non stimati;
10. viene scelto il prossimo slice: completare R1 sull'intero corpus oppure passare al prototipo
    R2 solo se la copertura è già sufficiente.

---

## Cosa NON fare ora

- non integrare RAG nel generatore pubblico;
- non deployare `pagine_sacre` generate;
- non seminare il corpus su D1 remoto;
- non costruire `Sei stato qui` prima della cronologia;
- non ridisegnare ancora il sito pubblico;
- non attivare social/WhatsApp;
- non creare prodotti KDP;
- non fotografare migliaia di pagine B5;
- non modificare la branch di Claude con reset/rebase/merge mentre l'audit concettuale è in corso.

## Gate

Nessun gate esterno per l'audit locale.

Qualunque scrittura in produzione, invio esterno o pubblicazione resta gate umano secondo
`AGENTS.md`.
