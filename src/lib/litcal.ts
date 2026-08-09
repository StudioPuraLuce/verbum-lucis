/**
 * Integrazione LitCal API (endpoint dev, l'unico attivo — l'`/api/v4/` dava 404).
 * Docs: https://litcal.johnromanodorazio.com
 *
 * Fornisce: calendario nazionale/diocesano con celebrazione, colore, grado, ciclo,
 * stagione e — solo per domeniche/solennità — i RIFERIMENTI delle letture.
 * ⚠️ Non fornisce il TESTO delle letture (il CEI 2008 è copyright): mostriamo il
 * riferimento e rimandiamo alla fonte ufficiale.
 */

const BASE_URL = 'https://litcal.johnromanodorazio.com/api/dev';

/** Fonte ufficiale per il testo pieno delle letture (rimando, niente ripubblicazione). */
export const FONTE_LETTURE_UFFICIALE = 'https://www.bibbiaedu.it/';

// ─── TYPES (forma reale della risposta /api/dev) ───────────────────────
/** Blocco letture: piatto per la Messa unica, o annidato (night/dawn/day) per Natale ecc. */
type LitCalReadingSet = {
  first_reading?: string;
  responsorial_psalm?: string;
  second_reading?: string;
  gospel_acclamation?: string;
  gospel?: string;
};
type LitCalReadings = LitCalReadingSet & { night?: LitCalReadingSet; dawn?: LitCalReadingSet; day?: LitCalReadingSet };

export interface LitCalEvent {
  event_key: string;
  name: string;
  color: string[];                  // ['green'] …
  color_lcl: string[];              // ['verde'] … (localizzato it)
  grade: number;                    // più alto = più importante
  grade_lcl?: string;
  type?: string;                    // 'fixed' | 'mobile'
  date: string;                     // ISO con orario: 2025-12-25T00:00:00+00:00
  liturgical_year?: string | null;  // ciclo domenicale, quando definito
  liturgical_season?: string;
  liturgical_season_lcl?: string;
  psalter_week?: number;
  is_vigil_mass?: boolean;
  readings?: LitCalReadings;
}

interface LitCalResponse {
  litcal: LitCalEvent[];
  settings?: unknown;
  metadata?: unknown;
}

// ─── COLOR MAP ──────────────────────────────────────────
const colorMap: Record<string, string> = {
  green:  'verde',
  red:    'rosso',
  white:  'bianco',
  violet: 'viola',
  purple: 'viola',
  rose:   'rosa',
};

export function mapColor(litcalColor: string): string {
  return colorMap[litcalColor?.toLowerCase()] || 'verde';
}

/** Normalizza il blocco letture: se annidato (night/dawn/day) sceglie il primo popolato. */
function flatReadings(r?: LitCalReadings): LitCalReadingSet {
  if (!r) return {};
  if (r.first_reading !== undefined || r.gospel !== undefined) return r;
  return r.day || r.dawn || r.night || {};
}

const nonVuoto = (s?: string) => (s && s.trim() ? s.trim() : null);

// ─── MAIN FUNCTIONS ────────────────────────────────────

/**
 * Fetch calendario nazionale italiano per un anno (endpoint dev).
 */
export async function fetchNationalCalendar(year: number, nation = 'IT'): Promise<LitCalResponse> {
  const url = `${BASE_URL}/calendar/nation/${nation}/${year}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });

  if (!res.ok) throw new Error(`LitCal national error: ${res.status} ${res.statusText}`);
  return res.json();
}

/**
 * Fetch calendario diocesano per un anno.
 * @param diocesiCode — id LitCal della diocesi (es. "romamo_it", "milano_it")
 */
export async function fetchDiocesanCalendar(diocesiCode: string, year: number): Promise<LitCalResponse> {
  const url = `${BASE_URL}/calendar/diocese/${diocesiCode}/${year}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });

  if (!res.ok) throw new Error(`LitCal diocese ${diocesiCode} error: ${res.status}`);
  return res.json();
}

/** Sceglie la celebrazione principale del giorno da una lista di eventi (stessa data). */
function pickPrincipal(events: LitCalEvent[]): LitCalEvent | null {
  if (!events.length) return null;
  const nonVigil = events.filter((e) => !e.is_vigil_mass);
  const pool = nonVigil.length ? nonVigil : events;
  return pool.reduce((best, e) => (e.grade > best.grade ? e : best), pool[0]);
}

/**
 * Fetch la celebrazione principale di una data (YYYY-MM-DD) dal calendario nazionale.
 */
export async function fetchDayLiturgy(date: string): Promise<LitCalEvent | null> {
  const year = new Date(date).getFullYear();
  const calendar = await fetchNationalCalendar(year);
  const sameDay = (calendar.litcal || []).filter((e) => e.date?.startsWith(date));
  return pickPrincipal(sameDay);
}

/**
 * Fetch la celebrazione principale di una data dal calendario diocesano.
 */
export async function fetchDiocesanDay(diocesiCode: string, date: string): Promise<LitCalEvent | null> {
  const year = new Date(date).getFullYear();
  const calendar = await fetchDiocesanCalendar(diocesiCode, year);
  const sameDay = (calendar.litcal || []).filter((e) => e.date?.startsWith(date));
  return pickPrincipal(sameDay);
}

// ─── MAPPERS ───────────────────────────────────────────

/**
 * Mappa un evento LitCal al formato della tabella `liturgy`.
 * I `testo` delle letture restano VUOTI (il CEI 2008 è copyright: si rimanda alla fonte ufficiale);
 * `linkUfficiale` porta al testo pieno su bibbiaedu.it.
 */
export function mapCelebrationToLiturgy(cel: LitCalEvent, diocesiId: number | null = null) {
  const r = flatReadings(cel.readings);
  const dataISO = (cel.date || '').slice(0, 10);

  return {
    data: dataISO,
    anno: new Date(cel.date).getFullYear(),
    diocesiId,
    tempoLiturgico: cel.liturgical_season_lcl || cel.liturgical_season || 'Tempo Ordinario',
    domenicaSettimana: cel.name || null,
    coloreLiturgico: cel.color_lcl?.[0] || mapColor(cel.color?.[0] || ''),
    linkUfficiale: FONTE_LETTURE_UFFICIALE,
    primaLettura: { riferimento: nonVuoto(r.first_reading) || 'Non disponibile', testo: '' },
    salmoResponsoriale: { riferimento: nonVuoto(r.responsorial_psalm) || 'Salmo', ritornello: '', testo: '' },
    secondaLettura: nonVuoto(r.second_reading) ? { riferimento: r.second_reading!.trim(), testo: '' } : null,
    vangelo: { riferimento: nonVuoto(r.gospel) || 'Vangelo', testo: '' },
    santiDelGiorno: [] as number[],
  };
}

// ─── UTILITY ───────────────────────────────────────────

/**
 * Determina il ciclo liturgico (A, B, C) per un anno civile
 * L'anno liturgico inizia con l'Avvento (~27 Nov)
 */
export function getLiturgicalCycle(year: number): { cycle: string; numero: number } {
  // Anno A inizia Avvento 2024 → ciclo per 2025
  const cycleMap: Record<number, { cycle: string; numero: number }> = {
    0: { cycle: 'C', numero: 3 },
    1: { cycle: 'A', numero: 1 },
    2: { cycle: 'B', numero: 2 },
  };

  return cycleMap[year % 3];
}

/**
 * Lista colori liturgici per tempo
 */
export const liturgicalSeasons: Record<string, { colore: string; periodo: string }> = {
  'Avvento':        { colore: 'viola',  periodo: '4 domeniche prima di Natale' },
  'Natale':         { colore: 'bianco', periodo: '25 dic – 5 gen' },
  'Tempo dopo Epifania': { colore: 'verde',  periodo: '6 gen – Mercoledì delle Ceneri' },
  'Quaresima':      { colore: 'viola',  periodo: 'Mercoledì Ceneri – Sabato Santo' },
  'Pasqua':         { colore: 'bianco', periodo: 'Domenica di Pasqua – Pentecoste' },
  'Pentecoste':     { colore: 'rosso',  periodo: 'Domenica di Pentecoste' },
  'Tempo Ordinario':{ colore: 'verde',  periodo: 'Dopo Pentecoste – Avvento' },
};
