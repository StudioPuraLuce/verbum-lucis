# ✠ Verbum Lucis — Architettura a Spirale

> La spina del portale non è il calendario gregoriano. È la **spirale liturgica**.
> La data è solo la coordinata di dove ti trovi sulla spirale.

Documento di architettura fondativa. Nasce dai documenti-sorgente dell'autore
(«E perché ci sono 4 vangeli», «Le Domeniche e i Centri Interiori»,
«Il Lavoro dell'Avvento», «Dammi i Dodici», «LITURGICA / Cronistoria Diario»).

---

## 0. Principio guida

Il tempo liturgico è un **Meccanismo Cosmico** (Legge del Tre + Legge del Sette/Ottava)
progettato per nutrire e risvegliare tutte le parti dell'essere umano.
Il portale non lo *descrive*: lo **incarna** come spina strutturale.

Tre leggi di progetto:

1. **La spirale è l'identità, la data è la proiezione.** Ogni contenuto vive su una
   *coordinata liturgica*; la data gregoriana è solo il modo in cui l'utente vi entra.
2. **Superficie e profondità sullo stesso nodo.** Ogni punto ha uno strato mainstream
   (ortodosso, per la crescita di massa) e uno strato di profondità (iniziatico, opt-in).
3. **Integrabile man mano.** La spina si costruisce prima; gli strati di profondità
   (organi/Ottagono, Athanor, Dodici) si innestano progressivamente, senza rifattorizzare.

---

## 1. Il sistema-sorgente (cosa incarna il portale)

### 1.1 I 4 Vangeli = 4 Centri = Tetramorfo
| Vangelo | Vivente | Centro | Nutre |
|---|---|---|---|
| Matteo | Uomo/Angelo | Intellettuale | la mente |
| Marco | Leone | Motore | il corpo |
| Luca | Toro | Emotivo | il cuore |
| Giovanni | Aquila | Magnetico / «Io» reale | lo spirito |

La rotazione liturgica **equilibra i centri**: nessuno resta affamato o addormentato.

### 1.2 La spirale del tempo
- **Ciclo domenicale A / B / C** — Legge del Tre. Anno A (Mt) = Re Maestro/Legislatore;
  Anno B (Mc) = Re Guerriero/Servo; Anno C (Lc) = Re Medico/Salvatore.
  Giovanni è il «sale»: entra in tutti i cicli (Pasqua, Natale) come ingrediente unificante.
- **Ciclo feriale I / II (pari/dispari)** — il respiro binario (Jachin e Boaz):
  la prima lettura ruota su due anni per percorrere tutta la Storia della Salvezza.
- **L'ottava che sale** — ogni giro ricomincia, ma su un piano più alto. Negli anni la
  spirale «comprende i giorni veri e propri»: la stessa coordinata ritorna su un giro superiore.

### 1.3 Le Domeniche e i Centri Interiori (Pentecoste → Cristo Re)
Sequenza guidata di risveglio dei centri, in quattro fasi:
1. **Dalla Mente al Cuore** (sett. 1–8)
2. **Dalla Pancia all'Offerta** (sett. 9–16)
3. **Il Regno lavora in silenzio** (sett. 17–21)
4. **Il Giudizio Dolce** (sett. 22–24) → **Cristo Re**: «svuotarsi per lasciar regnare».

Pratica-madre: *ogni sabato sera, leggi la domenica in arrivo e chiedi «quale centro sarà
toccato?»* → **Ricevi ciò che scende · Riconosci ciò che vibra · Rispondi con il gesto.**

### 1.4 Il Lavoro dell'Avvento (Costruzione del Regno)
Quattro settimane, framework **[G] Guardiano → [R] Riabilitazione → [C] Cristo Re**:
Vigilanza → Preparazione → Gaudete/Costruzione → Novena/Incarnazione → **Natale**
(il Logos si fa carne nell'Athanor, la vita quotidiana).

### 1.5 I Dodici (organi della psiche)
4 Centri × 3 Forze (Attiva/Passiva/Neutralizzante) = 12 funzioni costitutive da portare
sotto l'autorità del Re (non represse: la Lavanda dei Piedi le purifica servendole).

### 1.6 L'Ottagono (gli organi da edificare)
**Non è una mappa: sono organi.** Otto funzioni attive incarnate in figure — organi veri che
si **risvegliano e si costruiscono** per vivere nel mondo. Ottavo Giorno / Resurrezione.
- Cardinali (Arcangeli / influenze superiori): **Est** Raffaele (mente/risveglio) ·
  **Ovest** Michele (difesa/motore) · **Nord** Gabriele (subconscio/emozione) ·
  **Sud** Uriele (coscienza solare/azione).
- Intercardinali (figure umane / tamponi coscienti): **NE** Giovanni (visione) ·
  **SE** Maria (grembo/incubazione) · **NO** Giuseppe (silenzio/custode) ·
  **SO** Sansone (forza bruta consacrata).
- Assi: **Incarnazione** (Giuseppe–Maria) · **Sacrificio** (Giovanni–Sansone).
- Il Sé al centro = il Trono. Se esci dal centro, le mura non proteggono più.

### 1.7 L'Athanor
Il vaso / corpo / «Otre Nuovo»: la vita quotidiana in cui il Re nasce e regna.
**Si forgia con il fuoco sacro.** I *cammini* sono il lavoro sull'Athanor; i «quadernini oggi
cammino» dell'autore ne sono la traccia.

### 1.8 La Cronistoria (il perché)
`LITURGICA` è il diario personale dell'autore: dai 267 giorni di invocazione kabbalistica
(Elubatel, «libri di Mosè») fino all'ostia bianca e al «calice vuoto dopo la consacrazione».
È la testimonianza-radice: *non cercare una vita — diventa uno che può riceverla.*

---

## 2. Il modello del tempo (spina tecnica)

**Coordinata liturgica** come identità del contenuto (non la data):

| Dimensione | Valori |
|---|---|
| `tempo` | avvento · natale · ordinario · quaresima · triduo · pasqua |
| `cicloDomenicale` | A / B / C |
| `cicloFeriale` | I / II |
| `settimana` + `giorno` | posizione nell'arco |
| `centro` | centro interiore risvegliato |
| `vangeloTonalita` | Mt / Mc / Lc / Gv dominante dell'anno |
| `colore` | viola / bianco-oro / verde / rosso / rosa |

Un motore risolve `data → coordinata` (LitCal o calcolo interno). Il sito è organizzato
**per coordinata**: pagine, link ieri/domani, cammini vivono sulla spirale.

---

## 3. Data model

- `liturgical_positions` — le coordinate della spirale. **Cicliche e riusabili ogni anno**;
  la data gregoriana è un mapping, non la chiave.
- `pagine_sacre` — *(esistente)* da arricchire con `positionId`. Struttura editoriale già
  allineata a Ricevi/Riconosci/Rispondi (`reOggi`, `rosarioInteriore`, `gestoReale`).
- `centri` — centri interiori (nome, livello meccanico/medio/superiore, fase, domenica/vangelo).
- `cammini` — archi guidati (Avvento, Domeniche/Centri, Quaresima) → nodi ordinati.
- `organi` — le 8 figure dell'Ottagono come organi da risvegliare/costruire *(strato profondità)*.
- `dodici` — le 12 funzioni della psiche *(strato profondità)*.

Gli ultimi tre nascono come tabelle di riferimento e si attivano **man mano**.

---

## 4. Information Architecture (le viste)

Superficie → profondità, sullo **stesso nodo**:

- **Oggi** — la Pagina Sacra del punto corrente, ancorata alla coordinata: tempo/colore,
  centro toccato, il lavoro, struttura Ricevi/Riconosci/Rispondi.
- **La Spirale** — l'anno intero navigabile; «sei qui»; ogni punto → la Pagina Sacra.
- **I Cammini** — gli archi come percorsi **serializzati** (motore di ritenzione/monetizzazione).
- **La Mappa Interiore** — biblioteca di profondità: i centri, i Dodici, l'Ottagono/organi, l'Athanor.
- **Corte esterna** (mainstream utility): liturgia del giorno, santi, preghiere, rosario, novene.

### Vincolo di brand (non negoziabile)
Lo strato di profondità **non deve mai spacciarsi per dottrina della Chiesa**. Va incorniciato
come *psicologia sacra / lettura interiore* (come dicono gli stessi documenti: «non è teologia
dogmatica»). È un layer separato e opt-in: il mainstream cresce, la profondità resta nicchia premium.

---

## 5. Roadmap (integrabile man mano)

**Fase 1 — La Spina**
- Data model `liturgical_positions` + motore `data → coordinata`.
- Pagina Sacra ancorata alla coordinata.
- Vista **Spirale** navigabile (dal prototipo SVG già validato).
- Scaffold **Cammini** (Avvento, Domeniche/Centri) come sequenze.
- Design system regale (già impiantato: tema caldo + oro, tipografia display).

**Fase 2 — I Cammini vivi**
- Serializzazione completa degli archi; stato di avanzamento del pellegrino sull'Athanor.
- Pratica Ricevi/Riconosci/Rispondi come rituale guidato (sabato sera).

**Fase 3 — La Profondità (opt-in)**
- `centri` attivi sui nodi; `organi`/Ottagono come progressione da edificare; `dodici`.
- Lectio Alchemica / Maestro Interiore [G][R][C] come strato premium.

**Fase 4 — Crescita**
- Produzione automatica Storie IG dai nodi della spirale; motore organico (Fedele Messaggero, WhatsApp opt-in).

---

*Corpus da non generare con AI dove è testimonianza (Cronistoria); le Pagine Sacre invece
si possono generare. Il fuoco conta più del rituale: «conta chi sei tu mentre lo compi».*
