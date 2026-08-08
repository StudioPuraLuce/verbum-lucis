/**
 * Motore della coordinata liturgica — la SPINA di Verbum Lucis.
 *
 * Calcola, in modo deterministico e OFFLINE (niente API), la posizione di una
 * data sulla "spirale liturgica": tempo, colore, ciclo domenicale A/B/C, ciclo
 * feriale I/II, settimana, tonalità del Vangelo (Mt/Mc/Lc/Gv = i 4 centri) e —
 * quando definito nei documenti-sorgente — il centro interiore risvegliato e il
 * "lavoro" del giorno.
 *
 * La data gregoriana è solo la proiezione: l'identità è la coordinata.
 * Vedi documentation/ARCHITETTURA-SPIRALE.md.
 */

// ─── Utilità di data (UTC, per evitare derive di fuso) ───
function mkDate(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m - 1, d));
}
function addDays(date: Date, n: number): Date {
  return new Date(date.getTime() + n * 86400000);
}
function dow(date: Date): number {
  return date.getUTCDay(); // 0 = domenica
}
function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}
function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
/** Domenica della settimana liturgica che contiene `d` (la settimana inizia di domenica). */
function sundayOf(d: Date): Date {
  return addDays(d, -dow(d));
}

// ─── Pasqua (computus gregoriano, Meeus/Jones/Butcher) ───
export function computus(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return mkDate(year, month, day);
}

/** Prima domenica d'Avvento (inizio dell'anno liturgico) per l'anno civile dato. */
export function firstSundayOfAdvent(year: number): Date {
  const dec24 = mkDate(year, 12, 24);
  const advent4 = addDays(dec24, -dow(dec24)); // 4ª domenica d'Avvento = domenica ≤ 24 dic
  return addDays(advent4, -21);                // 1ª domenica = 4ª − 3 settimane
}

/** Battesimo del Signore: prima domenica dopo l'Epifania (6 gen); chiude il Natale. */
function baptismOfLord(yearAfterAdvent: number): Date {
  const epiphany = mkDate(yearAfterAdvent, 1, 6);
  const wd = dow(epiphany);
  // domenica successiva; se l'Epifania cade di domenica, il Battesimo è il lunedì.
  return wd === 0 ? addDays(epiphany, 1) : addDays(epiphany, 7 - wd);
}

// ─── Tipi ───
export type Tempo = 'avvento' | 'natale' | 'ordinario' | 'quaresima' | 'triduo' | 'pasqua';
export type Colore = 'viola' | 'bianco' | 'verde' | 'rosso' | 'rosa';
export type Ciclo = 'A' | 'B' | 'C';
export type Feriale = 'I' | 'II';

export interface LiturgicalCoordinate {
  dataISO: string;
  /** Anno liturgico = anno civile della 1ª domenica d'Avvento che l'ha aperto. */
  annoLiturgico: number;
  tempo: Tempo;
  tempoLabel: string;
  colore: Colore;
  cicloDomenicale: Ciclo;
  cicloFeriale: Feriale;
  /** Settimana del tempo (per l'Ordinario è la settimana del TO). */
  settimana: number | null;
  /** Settimana in numeri romani, se disponibile. */
  settimanaRomana: string | null;
  giornoSettimana: string;
  isDomenica: boolean;
  /** Vangelo-tonalità dell'anno: uno dei 4 centri (Tetramorfo). */
  vangeloTonalita: { evangelista: string; centro: string };
  /** Posizione 0..1 sulla spirale (0 = inizio Avvento, ~1 = Cristo Re). */
  fractionOfYear: number;
  /** Centro interiore risvegliato (strato profondità), se mappato. */
  centro: string | null;
  /** Il "lavoro" del giorno (strato profondità), se mappato. */
  lavoro: string | null;
  /** Etichetta speciale (Pentecoste, Trinità, Corpus Domini, Cristo Re…). */
  festa: string | null;
}

const GIORNI = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
const ROMANI = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII',
  'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI',
  'XXVII', 'XXVIII', 'XXIX', 'XXX', 'XXXI', 'XXXII', 'XXXIII', 'XXXIV'];

const TEMPO_LABEL: Record<Tempo, string> = {
  avvento: 'Avvento',
  natale: 'Tempo di Natale',
  ordinario: 'Tempo Ordinario',
  quaresima: 'Quaresima',
  triduo: 'Triduo Pasquale',
  pasqua: 'Tempo di Pasqua',
};

const VANGELO_TONALITA: Record<Ciclo, { evangelista: string; centro: string }> = {
  A: { evangelista: 'Matteo', centro: 'mente' },
  B: { evangelista: 'Marco', centro: 'corpo' },
  C: { evangelista: 'Luca', centro: 'cuore' },
};

// ─── Mappa dei centri interiori dell'Ordinario (Pentecoste → Cristo Re) ───
// Fonte: «🔥 LE DOMENICHE E I CENTRI INTERIORI». Chiave = settimana del TO.
export const CENTRI_ORDINARIO: Record<number, { centro: string; lavoro: string }> = {
  12: { centro: 'Emozionale inferiore', lavoro: 'portare la paura in luce' },
  13: { centro: 'Centro istintivo medio', lavoro: 'tagliare con amore' },
  14: { centro: 'Emozionale medio', lavoro: 'umiltà del cuore' },
  15: { centro: 'Centro motorio', lavoro: 'diventare terra viva' },
  16: { centro: 'Intellettuale inferiore', lavoro: 'accettare la coesistenza' },
  17: { centro: 'Istintivo superiore', lavoro: "scegliere l'unica cosa" },
  18: { centro: 'Centro del cuore', lavoro: 'offrire il poco reale' },
  19: { centro: 'Centro motorio superiore', lavoro: 'fiducia incarnata' },
  20: { centro: 'Emozionale profondo', lavoro: 'perseverare nella notte' },
  21: { centro: 'Intellettuale superiore', lavoro: 'accettare la chiamata' },
  22: { centro: 'Volontà centrale', lavoro: 'seguire senza dirigere' },
  23: { centro: 'Gola / voce', lavoro: 'parlare come strumento sacro' },
  24: { centro: 'Centro emozionale superiore', lavoro: 'sciogliere i legami interni' },
  25: { centro: 'Centro del giudizio', lavoro: 'distruggere la misura' },
  26: { centro: 'Centro della coerenza', lavoro: 'incarnare il sì' },
  27: { centro: 'Centro della responsabilità', lavoro: 'riconsegnare la vigna' },
  28: { centro: 'Centro della prontezza', lavoro: 'prepararsi ogni giorno' },
  29: { centro: 'Centro della separazione', lavoro: 'offrire ciò che è sacro' },
  30: { centro: 'Unità cuore-mente', lavoro: 'unificare amore verticale e orizzontale' },
  31: { centro: 'Centro della vanità', lavoro: 'inchinarsi realmente' },
};

// Le prime settimane dopo Pentecoste (feste che sostituiscono le domeniche del TO).
const CENTRI_FESTE: Record<string, { centro: string; lavoro: string }> = {
  pentecoste: { centro: 'Intellettuale superiore', lavoro: 'ricevere la visione' },
  trinità: { centro: 'Intellettuale medio', lavoro: 'accettare il Mistero' },
  corpus: { centro: 'Corpo come tempio', lavoro: 'incorporare la Presenza' },
  cristoRe: { centro: 'Centro del trono interiore', lavoro: 'svuotarsi per lasciar regnare' },
};

// ─── Lavoro dell'Avvento (4 settimane, [G][R][C]) ───
// Fonte: «✠ Il Lavoro dell'Avvento: La Costruzione del Regno».
export const LAVORO_AVVENTO: Record<number, { centro: string; lavoro: string }> = {
  1: { centro: 'La Vigilanza', lavoro: 'proteggere il silenzio' },
  2: { centro: 'La Preparazione', lavoro: "raddrizzare l'Athanor" },
  3: { centro: 'La Costruzione (Gaudete)', lavoro: 'accendere il fuoco / gioia attiva' },
  4: { centro: "L'Incarnazione (Novena)", lavoro: 'resa totale, diventare grembo' },
};

/**
 * Risolve la coordinata liturgica per una data (ISO "YYYY-MM-DD" o Date).
 */
export function liturgicalCoordinate(input: string | Date): LiturgicalCoordinate {
  const d = typeof input === 'string' ? mkDate(
    Number(input.slice(0, 4)), Number(input.slice(5, 7)), Number(input.slice(8, 10)),
  ) : mkDate(input.getUTCFullYear(), input.getUTCMonth() + 1, input.getUTCDate());

  // Anno liturgico: se d ≥ Avvento di quest'anno, l'anno è iniziato ora; altrimenti l'anno scorso.
  const civ = d.getUTCFullYear();
  const adventThis = firstSundayOfAdvent(civ);
  const annoLiturgico = d >= adventThis ? civ : civ - 1;

  const advent1 = firstSundayOfAdvent(annoLiturgico);
  const advent1Next = firstSundayOfAdvent(annoLiturgico + 1);
  const christmas = mkDate(annoLiturgico, 12, 25);
  const baptism = baptismOfLord(annoLiturgico + 1);
  const easter = computus(annoLiturgico + 1);
  const ashWed = addDays(easter, -46);
  const holyThu = addDays(easter, -3);
  const pentecost = addDays(easter, 49);
  const christKing = addDays(advent1Next, -7); // 34ª domenica del TO

  // Ciclo domenicale A/B/C ancorato all'Avvento (annoLiturgico % 3: 0→A, 1→B, 2→C).
  const cicloDomenicale: Ciclo = (['A', 'B', 'C'] as const)[annoLiturgico % 3];
  // Ciclo feriale I/II: parità dell'anno civile in cui cade il grosso dell'anno liturgico.
  const cicloFeriale: Feriale = (annoLiturgico + 1) % 2 === 0 ? 'II' : 'I';

  // Determina il tempo.
  let tempo: Tempo;
  if (d < christmas) tempo = 'avvento';
  else if (d <= baptism) tempo = 'natale';
  else if (d < ashWed) tempo = 'ordinario';
  else if (d < holyThu) tempo = 'quaresima';
  else if (d < easter) tempo = 'triduo';
  else if (d <= pentecost) tempo = 'pasqua';
  else tempo = 'ordinario';

  // Colore.
  const colore: Colore =
    tempo === 'avvento' || tempo === 'quaresima' ? 'viola'
    : tempo === 'natale' || tempo === 'pasqua' ? 'bianco'
    : tempo === 'triduo' ? 'rosso'
    : 'verde';

  // Settimana + centro/lavoro/festa.
  let settimana: number | null = null;
  let festa: string | null = null;
  let centro: string | null = null;
  let lavoro: string | null = null;

  if (tempo === 'avvento') {
    settimana = 1 + Math.floor(daysBetween(advent1, sundayOf(d)) / 7);
    const w = LAVORO_AVVENTO[Math.min(settimana, 4)];
    if (w) { centro = w.centro; lavoro = w.lavoro; }
  } else if (tempo === 'ordinario') {
    const afterEaster = d > pentecost;
    if (!afterEaster) {
      // Ordinario I: dopo il Battesimo, prima delle Ceneri.
      settimana = 1 + Math.floor(daysBetween(sundayOf(baptism), sundayOf(d)) / 7);
    } else {
      // Ordinario II: numerazione all'indietro da Cristo Re (34ª).
      settimana = 34 - Math.floor(daysBetween(sundayOf(d), sundayOf(christKing)) / 7);
      // Feste che sostituiscono le domeniche subito dopo Pentecoste.
      const trinity = addDays(pentecost, 7);
      const corpus = addDays(pentecost, 14); // in Italia trasferito alla domenica
      if (sundayOf(d).getTime() === sundayOf(christKing).getTime()) {
        festa = 'Cristo Re'; ({ centro, lavoro } = CENTRI_FESTE.cristoRe);
      } else if (sundayOf(d).getTime() === sundayOf(trinity).getTime()) {
        festa = 'Santissima Trinità'; ({ centro, lavoro } = CENTRI_FESTE.trinità);
      } else if (sundayOf(d).getTime() === sundayOf(corpus).getTime()) {
        festa = 'Corpus Domini'; ({ centro, lavoro } = CENTRI_FESTE.corpus);
      } else if (settimana != null && CENTRI_ORDINARIO[settimana]) {
        ({ centro, lavoro } = CENTRI_ORDINARIO[settimana]);
      }
    }
  } else if (tempo === 'pasqua') {
    settimana = 1 + Math.floor(daysBetween(easter, sundayOf(d)) / 7);
    if (sundayOf(d).getTime() === sundayOf(pentecost).getTime()) {
      festa = 'Pentecoste'; ({ centro, lavoro } = CENTRI_FESTE.pentecoste);
    }
  } else if (tempo === 'quaresima') {
    settimana = Math.max(1, Math.ceil(daysBetween(ashWed, d) / 7));
  }

  const fractionOfYear = Math.min(1, Math.max(0,
    daysBetween(advent1, d) / daysBetween(advent1, advent1Next)));

  return {
    dataISO: toISO(d),
    annoLiturgico,
    tempo,
    tempoLabel: TEMPO_LABEL[tempo],
    colore,
    cicloDomenicale,
    cicloFeriale,
    settimana,
    settimanaRomana: settimana != null ? (ROMANI[settimana] ?? String(settimana)) : null,
    giornoSettimana: GIORNI[dow(d)],
    isDomenica: dow(d) === 0,
    vangeloTonalita: VANGELO_TONALITA[cicloDomenicale],
    fractionOfYear,
    centro,
    lavoro,
    festa,
  };
}

// ─── Geometria della spirale (coerente col prototipo validato) ───
const SPIRAL = { cx: 300, cy: 300, r0: 30, b: 25 };

/** Punto (x,y) sulla spirale per una frazione 0..1 dell'anno liturgico. */
export function spiralXY(fraction: number): { x: number; y: number } {
  const theta = fraction * 2 * Math.PI;
  const r = SPIRAL.r0 + SPIRAL.b * theta;
  return {
    x: SPIRAL.cx + r * Math.sin(theta),
    y: SPIRAL.cy - r * Math.cos(theta),
  };
}

export interface SpiralNode {
  dataISO: string;
  x: number;
  y: number;
  fraction: number;
  isDomenica: boolean;
  festa: string | null;
  settimanaRomana: string | null;
  tempo: Tempo;
}

/**
 * Archi colorati della spirale (per tempo liturgico), come path SVG continui.
 * Display-agnostico: ritorna il nome del colore, non l'hex.
 */
export function spiralArcs(ref: string | Date = new Date(), samples = 260): { colore: Colore; d: string }[] {
  const coord = liturgicalCoordinate(ref);
  const advent1 = firstSundayOfAdvent(coord.annoLiturgico);
  const advent1Next = firstSundayOfAdvent(coord.annoLiturgico + 1);
  const spanMs = advent1Next.getTime() - advent1.getTime();
  const fracToISO = (frac: number) =>
    new Date(advent1.getTime() + frac * spanMs).toISOString().slice(0, 10);

  const segs: { colore: Colore; pts: string[] }[] = [];
  let prev: { colore: Colore; pts: string[] } | null = null;
  for (let i = 0; i <= samples; i++) {
    const frac = i / samples;
    const colore = liturgicalCoordinate(fracToISO(frac)).colore;
    const { x, y } = spiralXY(frac);
    const p = `${x.toFixed(1)},${y.toFixed(1)}`;
    if (prev && prev.colore === colore) prev.pts.push(p);
    else {
      if (prev) prev.pts.push(p); // chiude il buco col segmento precedente
      prev = { colore, pts: [p] };
      segs.push(prev);
    }
  }
  return segs.map((s) => ({ colore: s.colore, d: `M ${s.pts.join(' L ')}` }));
}

/**
 * Genera i nodi della spirale per l'anno liturgico che contiene `ref`,
 * campionando le domeniche (nodi cliccabili) tra le due Avvento.
 */
export function spiralSundays(ref: string | Date = new Date()): SpiralNode[] {
  const coord = liturgicalCoordinate(ref);
  const advent1 = firstSundayOfAdvent(coord.annoLiturgico);
  const advent1Next = firstSundayOfAdvent(coord.annoLiturgico + 1);
  const total = daysBetween(advent1, advent1Next);

  const nodes: SpiralNode[] = [];
  let cur = sundayOf(advent1).getTime() === advent1.getTime() ? advent1 : addDays(sundayOf(advent1), 7);
  while (cur < advent1Next) {
    const c = liturgicalCoordinate(cur);
    const fraction = Math.min(1, Math.max(0, daysBetween(advent1, cur) / total));
    const { x, y } = spiralXY(fraction);
    nodes.push({
      dataISO: toISO(cur), x, y, fraction,
      isDomenica: true, festa: c.festa, settimanaRomana: c.settimanaRomana, tempo: c.tempo,
    });
    cur = addDays(cur, 7);
  }
  return nodes;
}
