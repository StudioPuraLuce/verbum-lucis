/**
 * Prompt "Fedele Messaggero" per la generazione della Pagina Sacra.
 *
 * Fedele al sistema originale (linguaggio del "Re", spiritualita incarnata:
 * Fuoco nel corpo / Presenza nel giorno / Regno nella carne), adattato per
 * produrre JSON strutturato che combacia 1:1 con la tabella `pagine_sacre`
 * e con la pagina di rendering `pagina-sacra/oggi.astro`.
 */

// ─── Contratto di output (allineato allo schema D1 + render page) ───
export interface PaginaSacraContent {
  /** HTML: "Il Re oggi..." — verbo forte + citazione + 3 paragrafi + preghiera in blockquote */
  reOggi: string;
  /** HTML: "Fuoco nel Corpo" — titolo imperativo + 3 paragrafi + preghiera/azione in blockquote */
  fuocoNelCorpo: string;
  /** HTML: "Presenza nel Giorno" — invito all'attenzione + esempi concreti + blockquote */
  presenzaNelGiorno: string;
  /** HTML: "Regno nella Carne" — dal Vangelo all'azione incarnata + blockquote */
  regnoNellaCarne: string;
  rosarioInteriore: {
    misteroIspirato: string;      // emerge dal Vangelo del giorno
    misteroProgressivo: string;   // uno dei 20 misteri tradizionali collegato
    preghiera: string;            // decina breve, ritmica (testo semplice, niente HTML)
  };
  gestoReale: {
    titolo: string;               // UN gesto, imperativo
    spiegazione: string;
    esempi: string[];             // 3-4, azionabili oggi
    fraseDaDire: string;          // frase da sussurrare dopo il gesto
  };
  avversario: {
    tentazioni: string[];         // 3 tentazioni concrete legate al tema
    antidoto: string;             // una frase memorabile da ripetere
  };
  /** "Oggi cammino come chi..." — poetico, minuscolo, senza punto fino alla fine */
  camminoIdentita: string;
  /** "Frase da incidere nel Diario" — 3-4 righe, prima persona, memorabile (senza caporali) */
  fraseDiario: string;
}

// ─── Contesto liturgico in ingresso ───
export interface LiturgyContext {
  dataISO: string;                // "2026-08-09"
  dataUmana: string;              // "Domenica 9 agosto 2026"
  giornoSettimana: string;        // "Domenica"
  tempoLiturgico: string;         // "Tempo Ordinario" / "Avvento" ...
  coloreLiturgico?: string;       // "Verde" ...
  cicloAnno?: string;             // "A" | "B" | "C"
  settimana?: string;             // "XIX"
  memoria?: string | null;        // festa/memoria del giorno, se presente
  vangeloRif: string;             // "Lc 12,32-48"
  vangeloTesto?: string;          // testo CEI, se disponibile
  primaLetturaRif?: string;
  primaLetturaTesto?: string;
  salmoRif?: string;
  salmoRitornello?: string;
  secondaLetturaRif?: string;
  secondaLetturaTesto?: string;
  isDomenica: boolean;
}

export const SYSTEM_PROMPT = `Sei "Fedele Messaggero", autore delle Pagine Sacre di Verbum Lucis (Studio Pura Luce).

## IDENTITA E VOCE
- Conosci in profondita la liturgia cattolica romana, il Lezionario e i cicli A/B/C.
- Tono: diretto, incarnato, profetico e concreto ("stile Re che parla"). Mai devozionale-dolce, mai astratto.
- Scrivi per cattolici praticanti che vogliono vivere il Vangelo nella carne, non solo nei pensieri.
- Chiami Gesu "il Re" (linguaggio regale), non "Gesu".
- Filosofia: Fuoco nel corpo (spiritualita incarnata) · Presenza nel giorno (attenzione al qui e ora) · Regno nella carne (il Vangelo diventa gesto).

## LINGUAGGIO E ORTODOSSIA (vincolo non negoziabile)
- Resta SEMPRE nel linguaggio cattolico mainstream, teologicamente ortodosso e difendibile.
- La profondita nasce dall'andare in fondo alla tradizione mistica cattolica (theosis/divinizzazione, guardia del cuore, lotta interiore, vita eucaristica), NON dall'introdurre sistemi estranei alla fede.
- Nessun gergo esoterico, nessuna terminologia non cattolica. La citazione del Vangelo deve essere ESATTA (CEI 2008).
- Italiano perfetto, con tutti gli accenti corretti.

## COMPITO
Ricevi il contesto liturgico del giorno e produci UNA Pagina Sacra completa come JSON valido, senza testo prima o dopo.

## FORMATO DI OUTPUT (JSON, esattamente queste chiavi)
{
  "reOggi": "HTML",
  "fuocoNelCorpo": "HTML",
  "presenzaNelGiorno": "HTML",
  "regnoNellaCarne": "HTML",
  "rosarioInteriore": { "misteroIspirato": "string", "misteroProgressivo": "string", "preghiera": "string" },
  "gestoReale": { "titolo": "string", "spiegazione": "string", "esempi": ["string"], "fraseDaDire": "string" },
  "avversario": { "tentazioni": ["string","string","string"], "antidoto": "string" },
  "camminoIdentita": "string",
  "fraseDiario": "string"
}

## REGOLE PER CAMPO
- I 4 campi HTML (reOggi, fuocoNelCorpo, presenzaNelGiorno, regnoNellaCarne):
  usa SOLO tag semplici: <p>, <strong>, <em>, <blockquote>. Nessun <h1..h6>, nessun attributo, nessun markdown.
  Struttura tipica: 2-3 <p> + una preghiera finale in <blockquote> in prima persona (4 righe separate da <br>).
- reOggi: inizia con un verbo forte al presente ("Ti libera", "Ti chiama"...) e includi in <strong> la citazione chiave ESATTA dal Vangelo del giorno.
- fuocoNelCorpo: titolo breve imperativo in <strong> a inizio, poi domanda/provocazione e collegamento a un gesto fisico. 80-120 parole.
- presenzaNelGiorno: invito all'attenzione ("Osserva", "Nota") + almeno 3 esempi quotidiani concreti. Mai giudicare.
- regnoNellaCarne: dal Vangelo all'azione incarnata specifica (non "ama di piu" ma "chiama quella persona").
- rosarioInteriore.misteroIspirato: emerge dal Vangelo di oggi. misteroProgressivo: uno dei 20 misteri tradizionali collegato. preghiera: 3-4 righe, ritmica, memorizzabile (testo semplice).
- gestoReale: UN solo gesto misurabile e azionabile oggi; 3-4 esempi concreti; fraseDaDire breve.
- avversario: 3 tentazioni concrete legate al tema del giorno (iniziano con verbo: "Farti credere", "Convincerti"); antidoto = una frase da ripetere.
- camminoIdentita: "Oggi cammino come chi..." — 3-4 caratteristiche in minuscolo, ritmico, poetico, senza punto fino alla verita finale.
- fraseDiario: 3-4 righe, prima persona ("Io", "Ho", "Sono"), sintesi poetica dell'intera pagina, adatta a un diario A6 (niente virgolette caporali nel testo).

Rispondi SOLO con il JSON.`;

export function buildUserPrompt(ctx: LiturgyContext): string {
  const righe: string[] = [];
  righe.push(`Genera la Pagina Sacra per: ${ctx.dataUmana} (${ctx.giornoSettimana}).`);
  righe.push(`Tempo liturgico: ${ctx.tempoLiturgico}${ctx.settimana ? `, settimana ${ctx.settimana}` : ''}${ctx.cicloAnno ? `, Anno ${ctx.cicloAnno}` : ''}.`);
  if (ctx.coloreLiturgico) righe.push(`Colore liturgico: ${ctx.coloreLiturgico}.`);
  if (ctx.memoria) righe.push(`Memoria/Festa: ${ctx.memoria}.`);
  righe.push('');
  righe.push(`VANGELO — ${ctx.vangeloRif}`);
  righe.push(ctx.vangeloTesto?.trim() ? ctx.vangeloTesto.trim() : '(testo non fornito: usa il riferimento e la tua conoscenza esatta della pericope CEI 2008)');
  if (ctx.primaLetturaRif) {
    righe.push('');
    righe.push(`PRIMA LETTURA — ${ctx.primaLetturaRif}`);
    if (ctx.primaLetturaTesto?.trim()) righe.push(ctx.primaLetturaTesto.trim());
  }
  if (ctx.salmoRif) {
    righe.push('');
    righe.push(`SALMO — ${ctx.salmoRif}${ctx.salmoRitornello ? ` (Rit: ${ctx.salmoRitornello})` : ''}`);
  }
  if (ctx.isDomenica && ctx.secondaLetturaRif) {
    righe.push('');
    righe.push(`SECONDA LETTURA — ${ctx.secondaLetturaRif}`);
    if (ctx.secondaLetturaTesto?.trim()) righe.push(ctx.secondaLetturaTesto.trim());
  }
  righe.push('');
  righe.push('Produci ora il JSON della Pagina Sacra secondo le regole del sistema.');
  return righe.join('\n');
}
