/**
 * Integrazione con API Liturgiche esterne
 * Fonti: calapi.inadiutorium.cz, evangelizo.org
 */

interface LiturgyReading {
  riferimento: string;
  testo: string;
}

interface PsalmReading {
  riferimento: string;
  ritornello: string;
  testo: string;
}

export interface DailyLiturgy {
  data: string;
  anno: number;
  tempoLiturgico: string;
  domenicaSettimana?: string;
  coloreLiturgico: string;
  primaLettura: LiturgyReading;
  salmoResponsoriale: PsalmReading;
  secondaLettura?: LiturgyReading;
  vangelo: LiturgyReading;
  santiDelGiorno?: number[];
}

/**
 * Fetch liturgia dal calendario romano API
 */
export async function fetchLiturgyFromAPI(date: string): Promise<DailyLiturgy | null> {
  try {
    // Esempio con calapi.inadiutorium.cz
    const response = await fetch(
      `https://calapi.inadiutorium.cz/api/v0/it/calendars/default/${date}`
    );

    if (!response.ok) {
      console.error('Errore fetch liturgia:', response.statusText);
      return null;
    }

    const data = await response.json();
    
    // Mappa la risposta al nostro schema
    return mapAPIResponseToLiturgy(data, date);
  } catch (error) {
    console.error('Errore chiamata API liturgia:', error);
    return null;
  }
}

/**
 * Mappa risposta API al nostro formato
 */
function mapAPIResponseToLiturgy(apiData: any, date: string): DailyLiturgy {
  // Questa è una mappatura di esempio - adatta in base all'API reale
  const year = new Date(date).getFullYear();
  const liturgicalYear = getLiturgicalYear(date);

  return {
    data: date,
    anno: liturgicalYear,
    tempoLiturgico: apiData.season?.name || 'Ordinario',
    domenicaSettimana: apiData.celebrations?.[0]?.title,
    coloreLiturgico: mapColor(apiData.celebrations?.[0]?.colour),
    primaLettura: {
      riferimento: apiData.readings?.first_reading?.citation || '',
      testo: apiData.readings?.first_reading?.text || 'Testo non disponibile'
    },
    salmoResponsoriale: {
      riferimento: apiData.readings?.responsorial_psalm?.citation || '',
      ritornello: apiData.readings?.responsorial_psalm?.refrain || '',
      testo: apiData.readings?.responsorial_psalm?.text || ''
    },
    secondaLettura: apiData.readings?.second_reading ? {
      riferimento: apiData.readings.second_reading.citation,
      testo: apiData.readings.second_reading.text
    } : undefined,
    vangelo: {
      riferimento: apiData.readings?.gospel?.citation || '',
      testo: apiData.readings?.gospel?.text || 'Testo non disponibile'
    }
  };
}

/**
 * Mappa colori liturgici dall'API al nostro formato
 */
function mapColor(apiColor: string): string {
  const colorMap: Record<string, string> = {
    'green': 'verde',
    'red': 'rosso',
    'white': 'bianco',
    'violet': 'viola',
    'purple': 'viola',
    'rose': 'rosa'
  };
  
  return colorMap[apiColor?.toLowerCase()] || 'verde';
}

/**
 * Determina l'anno liturgico (A, B, C)
 */
function getLiturgicalYear(date: string): number {
  const d = new Date(date);
  const year = d.getFullYear();
  
  // L'anno liturgico inizia con l'Avvento (4 domeniche prima di Natale)
  // Calcolo semplificato: Anno A = 1, Anno B = 2, Anno C = 3
  const cycle = year % 3;
  return cycle === 0 ? 3 : cycle;
}

/**
 * Fetch letture da Evangelizo.org (alternativa)
 */
export async function fetchFromEvangelizo(date: string): Promise<Partial<DailyLiturgy> | null> {
  try {
    // Evangelizo potrebbe richiedere scraping o hanno un feed RSS
    // Esempio placeholder
    const response = await fetch(
      `https://evangelizo.org/feed/gospel/L/${date.replace(/-/g, '')}`
    );

    if (!response.ok) return null;

    // Parsing RSS/XML qui
    // const xml = await response.text();
    // return parseEvangelizoXML(xml);
    
    return null; // Implementa il parser XML
  } catch (error) {
    console.error('Errore Evangelizo:', error);
    return null;
  }
}

/**
 * Utility: Ottieni range di date per pre-fetch
 */
export function getDateRange(startDate: string, days: number): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  
  for (let i = 0; i < days; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    dates.push(current.toISOString().split('T')[0]);
  }
  
  return dates;
}
