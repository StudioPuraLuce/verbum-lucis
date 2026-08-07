/**
 * Integrazione LitCal API
 * Docs: https://litcal.johnromanodorazio.com
 *
 * Supporta:
 *   - Calendario nazionale italiano
 *   - Calendari diocesani (226 diocesi)
 *   - Calcolo Pasqua (1583-9999)
 */

const BASE_URL = 'https://litcal.johnromanodorazio.com/api/v4';

// ─── TYPES ──────────────────────────────────────────────
interface LitCalReading {
  citation: string;
  text?: string;
}

interface LitCalCelebration {
  date: string;
  title: string;
  type: string;                     // Sunday, Feast, Memorial, etc.
  colour: string;                   // green, red, white, violet, rose
  readings?: {
    first_reading?: LitCalReading;
    responsorial_psalm?: LitCalReading & { refrain?: string };
    second_reading?: LitCalReading;
    gospel?: LitCalReading;
  };
  saints?: string[];
}

interface LitCalResponse {
  liturgical_year?: {
    year: number;
    cycle: string;                  // A, B, C
    season: string;
  };
  celebrations: LitCalCelebration[];
}

interface EasterDate {
  year: number;
  month: number;
  day: number;
  date: string;                     // YYYY-MM-DD
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

// ─── MAIN FUNCTIONS ────────────────────────────────────

/**
 * Fetch calendario nazionale italiano per un anno
 */
export async function fetchNationalCalendar(year: number): Promise<LitCalResponse> {
  const url = `${BASE_URL}/calendar/nation/IT/${year}?returntype=json`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`LitCal national error: ${res.status} ${res.statusText}`);
  return res.json();
}

/**
 * Fetch calendario diocesano per un anno
 * @param diocesiCode — es. "IT-RM", "IT-MI"
 */
export async function fetchDiocesanCalendar(diocesiCode: string, year: number): Promise<LitCalResponse> {
  const url = `${BASE_URL}/calendar/diocese/${diocesiCode}/${year}?returntype=json`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`LitCal diocese ${diocesiCode} error: ${res.status}`);
  return res.json();
}

/**
 * Fetch una singola data dal calendario nazionale
 */
export async function fetchDayLiturgy(date: string): Promise<LitCalCelebration | null> {
  const year = new Date(date).getFullYear();
  const calendar = await fetchNationalCalendar(year);

  return calendar.celebrations.find(c => c.date === date) || null;
}

/**
 * Fetch una singola data diocesana
 */
export async function fetchDiocesanDay(diocesiCode: string, date: string): Promise<LitCalCelebration | null> {
  const year = new Date(date).getFullYear();
  const calendar = await fetchDiocesanCalendar(diocesiCode, year);

  return calendar.celebrations.find(c => c.date === date) || null;
}

/**
 * Calcola la data della Pasqua per un anno dato
 */
export async function fetchEaster(year: number): Promise<EasterDate> {
  const url = `${BASE_URL}/easter/${year}?returntype=json`;
  const res = await fetch(url);

  if (!res.ok) throw new Error(`LitCal easter error: ${res.status}`);
  return res.json();
}

// ─── MAPPERS ───────────────────────────────────────────

/**
 * Mappa una celebration LitCal al formato del nostro database
 */
export function mapCelebrationToLiturgy(cel: LitCalCelebration, diocesiId: number | null = null) {
  const anno = cel.readings ? 1 : 0; // placeholder, LitCal dovrebbe restituire il ciclo

  return {
    data: cel.date,
    anno,
    diocesiId,
    tempoLiturgico: cel.type || 'Ordinario',
    domenicaSettimana: cel.title || null,
    coloreLiturgico: mapColor(cel.colour),
    primaLettura: {
      riferimento: cel.readings?.first_reading?.citation || 'Non disponibile',
      testo: cel.readings?.first_reading?.text || 'Consultare il messale diocesano.',
    },
    salmoResponsoriale: {
      riferimento: cel.readings?.responsorial_psalm?.citation || 'Salmo',
      ritornello: cel.readings?.responsorial_psalm?.refrain || '',
      testo: cel.readings?.responsorial_psalm?.text || '',
    },
    secondaLettura: cel.readings?.second_reading ? {
      riferimento: cel.readings.second_reading.citation,
      testo: cel.readings.second_reading.text || '',
    } : null,
    vangelo: {
      riferimento: cel.readings?.gospel?.citation || 'Vangelo',
      testo: cel.readings?.gospel?.text || 'Consultare il messale diocesano.',
    },
    santiDelGiorno: [],  // Da risolvere separatamente linkando ai santi nel DB
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
