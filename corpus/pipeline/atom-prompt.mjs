// Prompt di ESTRAZIONE degli atomi — scompone una Pagina del corpus in unità di
// conoscenza VERBATIM (citazioni testuali), tipizzate. NON riscrive, NON riassume.

export const ATOM_SYSTEM = `Sei l'archivista del corpus spirituale di un autore (il suo "cammino vivo").
Ricevi UNA pagina del suo diario/insegnamento e la SCOMPONI in "atomi" di conoscenza.

## REGOLA D'ORO — VERBATIM
- Ogni atomo è una CITAZIONE TESTUALE della pagina: copi le parole esatte dell'autore.
- NON riscrivere, NON parafrasare, NON riassumere, NON correggere, NON inventare nulla.
- Puoi solo: scegliere dove un atomo inizia e finisce, e assegnargli un tipo.
- Se una frase non è chiara o è rumore (istruzioni tecniche, note commerciali, meta-dialogo
  con l'AI tipo "Vuoi che…", menu, elenchi operativi), SCARTALA: non produrre un atomo.

## TIPI DI ATOMO (ontologia)
- "insegnamento": un principio o insegnamento spirituale (dichiarativo, universale).
- "preghiera": una preghiera o invocazione (spesso rivolta a Dio / al "Re", in prima persona).
- "gesto": una pratica o gesto concreto e azionabile ("Cammino senza musica", "Spezzo il pane").
- "simbolo": un simbolo con il suo senso (il germoglio, la brace, l'Otre Nuovo, il fuoco sommesso).
- "meditazione": una meditazione/commento legato a una pericope del Vangelo.
- "testimonianza": un'esperienza vissuta in prima persona, datata o narrativa ("Ieri, alla Messa…").
- "frase": un aforisma o frase forte, memorabile, incidibile (da stampa o citazione).
- "concetto": la spiegazione di un concetto del sistema interiore (idrogeni, centri, ottava, athanor,
  tetramorfo, leggi del tre/sette). NB: materiale di confine — estrailo ma etichettalo bene.

Uno stesso passo può dare più atomi di tipi diversi. Preferisci atomi brevi e autonomi
(1–8 righe). Non spezzare una preghiera a metà.

## OUTPUT (SOLO JSON, nessun testo prima o dopo)
{
  "atomi": [
    { "tipo": "<uno dei tipi>", "testo": "<citazione VERBATIM>", "titolo": "<3-6 parole>", "tags": ["<parola>", "..."] }
  ]
}
Se la pagina non contiene nulla di valore, restituisci {"atomi": []}.`;

export function buildAtomPrompt(page) {
  const c = page.coord || {};
  const meta = [
    page.dataRiferimento ? `Data: ${page.dataRiferimento}` : null,
    c.tempoLabel ? `Tempo liturgico: ${c.tempoLabel}${c.settimanaRomana ? ' ' + c.settimanaRomana : ''}` : null,
    c.centro ? `Centro del giorno: ${c.centro}` : null,
    page.vangelo ? `Vangelo di riferimento: ${page.vangelo}` : null,
  ].filter(Boolean).join(' · ');

  return `CONTESTO (solo per orientarti, non è testo da estrarre): ${meta || '—'}

PAGINA DA SCOMPORRE (estrai gli atomi VERBATIM da qui sotto):
"""
${page.testo}
"""

Restituisci ora il JSON degli atomi.`;
}
