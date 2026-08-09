# 🕸️ Grafo di Conoscenza del Corpus — schema

> Schema dei nodi e degli archi. **Definito in S1, popolato in S2** da
> `pipeline/build_graph.py`. Persistenza: `corpus/graph.sqlite` (tabelle `nodi`, `archi`)
> + export `nodi.jsonl` / `archi.jsonl`.
>
> **Stato (ultima build):** 1485 nodi (pagina 1085 · vangelo 214 · giorno 136 · centro 21 ·
> concetto 15 · tempo 6 · cammino 4 · festa 4) · 5315 archi (appartiene_a 1956 · letta_il 1082 ·
> risveglia 800 · cita 441 · tonalità 441 · sottende 327 · parte_di 134 · evolve_da 134).

Il grafo ricostruisce il **cammino** e la sua **dottrina**: non un elenco di testi, ma una
rete in cui ogni Pagina è legata al giorno liturgico che l'ha generata, al Vangelo che medita,
al centro interiore che risveglia, e al cammino di cui è tappa.

## Nodi

| Tipo nodo | Chiave | Attributi | Fonte |
|---|---|---|---|
| **Pagina** | `id` (hash) | fonte, thread, dataRiferimento, dataConfidence, tipo, titolo, vangelo, nChar, coord{…} | `pagine.enriched.jsonl` |
| **Giorno** | `dataISO` | coordinata liturgica completa (tempo, colore, ciclo, settimana, centro, lavoro, festa) | motore-spina |
| **Vangelo** | ref canonico (`Gv 6,35-40`) | libro, capitolo, versetti, evangelista, tonalità(Tetramorfo) | `liturgical-spiral` + testo |
| **Centro** | nome (`Centro del cuore`) | fase, tempo di appartenenza, lavoro | `CENTRI_*` nel motore |
| **Cammino** | nome (`Cammino Pasquale Vivente`) | tempo, n. tappe | Obsidian |
| **Tempo/Festa** | slug (`pasqua`, `pentecoste`) | colore, arco spirale | motore-spina |
| **Concetto** | slug (`idrogeno-h96`, `legge-del-sette`, `tetramorfo`) | descrizione, strato (profondità) | dottrina |

## Archi (relazioni orientate)

| Da | Relazione | A | Derivazione |
|---|---|---|---|
| Pagina | `letta_il` | Giorno | `dataRiferimento` |
| Pagina | `cita` | Vangelo | regex rif. biblico nel testo |
| Pagina | `risveglia` | Centro | `coord.centro` del giorno |
| Pagina | `parte_di` | Cammino | tipo=cammino + tempo |
| Pagina | `nel_tempo` | Tempo/Festa | `coord.tempo` / `coord.festa` |
| Pagina | `evolve_da` | Pagina | stesso giorno/tema, versione precedente (lineage dedup) |
| Giorno | `appartiene_a` | Tempo/Festa | motore-spina |
| Vangelo | `tonalità` | Concetto(Tetramorfo) | ciclo A/B/C → Mt/Mc/Lc + Gv |
| Centro | `appartiene_a` | Cammino | mappe `CENTRI_*` |
| Concetto | `sottende` | Pagina | dottrina (idrogeni/leggi) citata |

## Query che il grafo deve saper rispondere (Sessione 2+)
- *«Tutte le Pagine di un dato giorno liturgico»* → Giorno ⟵ letta_il.
- *«Come ho meditato Gv 6 nei tre anni A/B/C»* → Vangelo ⟵ cita, raggruppa per `coord.annoLiturgico`.
- *«La progressione di un centro lungo il cammino»* → Centro ⟵ risveglia, ordina per `fractionOfYear`.
- *«La cronistoria di un cammino»* → Cammino ⟵ parte_di, ordina per data.
- *«Versioni successive della stessa Pagina»* → catena `evolve_da` (per la curatela/dedup).

## Note di costruzione
- Il **Giorno** è il perno: la coordinata liturgica (la spina) è ciò che dà senso e ordine a
  tutto il resto. Nessun nodo Giorno è inventato: deriva sempre da `liturgicalCoordinate()`.
- `evolve_da` è la spina dorsale della **deduplica**: quando la stessa Pagina è stata riscritta
  più volte (tipico nei thread lunghi), si tiene la migliore e si linkano le altre come storia.
