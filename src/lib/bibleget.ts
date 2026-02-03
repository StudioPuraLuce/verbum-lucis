/**
 * BibleGet.io API Integration
 * Docs: https://query.bibleget.io
 *
 * Provides access to CEI 2008 Italian Bible (default)
 * No API key required
 */

const BASE_URL = 'https://query.bibleget.io';
const APP_ID = 'verbum-lucis';

// ─── TYPES ──────────────────────────────────────────────
interface BibleGetVerse {
  verseNumber: number;
  verseText: string;
}

interface BibleGetBook {
  bookAbbreviation: string;
  bookName: string;
  chapter: number;
  verses: BibleGetVerse[];
}

interface BibleGetResponse {
  results: {
    [version: string]: BibleGetBook;
  };
}

export interface BibleVerse {
  riferimento: string;
  libro: string;
  capitolo: number;
  versetto: number;
  testo: string;
  versione: string;
}

// ─── MAIN FUNCTIONS ────────────────────────────────────

/**
 * Fetch versetti biblici dalla Bibbia CEI 2008
 * @param query - es. "Gv3,16" o "Mt1,1-10" o "Gen1,1;Gv1,1"
 * @param version - default "CEI2008", altri: "VULG", "KJV"
 */
export async function fetchVerses(
  query: string,
  version: string = 'CEI2008'
): Promise<BibleVerse[]> {
  const url = `${BASE_URL}/?query=${encodeURIComponent(query)}&version=${version}&return=json&appid=${APP_ID}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`BibleGet error: ${res.status} ${res.statusText}`);
    }

    const data: BibleGetResponse = await res.json();
    const verses: BibleVerse[] = [];

    for (const [ver, bookData] of Object.entries(data.results || {})) {
      if (bookData && bookData.verses) {
        for (const verse of bookData.verses) {
          verses.push({
            riferimento: `${bookData.bookAbbreviation} ${bookData.chapter},${verse.verseNumber}`,
            libro: bookData.bookName,
            capitolo: bookData.chapter,
            versetto: verse.verseNumber,
            testo: cleanVerseText(verse.verseText),
            versione: ver,
          });
        }
      }
    }

    return verses;
  } catch (error) {
    console.error('BibleGet fetch error:', error);
    return [];
  }
}

/**
 * Fetch un singolo versetto
 * @param book - abbreviazione libro (es. "Gv", "Mt", "Gen")
 * @param chapter - numero capitolo
 * @param verse - numero versetto
 */
export async function fetchSingleVerse(
  book: string,
  chapter: number,
  verse: number,
  version: string = 'CEI2008'
): Promise<BibleVerse | null> {
  const query = `${book}${chapter},${verse}`;
  const verses = await fetchVerses(query, version);
  return verses[0] || null;
}

/**
 * Fetch un range di versetti
 * @param book - abbreviazione libro
 * @param chapter - numero capitolo
 * @param startVerse - versetto iniziale
 * @param endVerse - versetto finale
 */
export async function fetchVerseRange(
  book: string,
  chapter: number,
  startVerse: number,
  endVerse: number,
  version: string = 'CEI2008'
): Promise<BibleVerse[]> {
  const query = `${book}${chapter},${startVerse}-${endVerse}`;
  return fetchVerses(query, version);
}

/**
 * Fetch versetti da riferimento liturgico
 * @param reference - es. "Mt 5,1-12" o "Gv 1,1-18"
 */
export async function fetchFromLiturgicalReference(
  reference: string,
  version: string = 'CEI2008'
): Promise<BibleVerse[]> {
  // Normalize reference: "Mt 5,1-12" -> "Mt5,1-12"
  const normalized = reference.replace(/\s+/g, '');
  return fetchVerses(normalized, version);
}

// ─── UTILITIES ────────────────────────────────────────

/**
 * Clean verse text from HTML and markdown artifacts
 */
function cleanVerseText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')           // Remove HTML tags
    .replace(/\*\*/g, '')               // Remove markdown bold
    .replace(/\*/g, '')                 // Remove markdown italic
    .replace(/\n+/g, ' ')               // Replace newlines with spaces
    .replace(/\s+/g, ' ')               // Normalize whitespace
    .trim();
}

/**
 * Map abbreviazione libro italiano → inglese (per API)
 */
export const bookAbbreviations: Record<string, string> = {
  // Antico Testamento
  'Gen': 'Gen', 'Es': 'Ex', 'Lv': 'Lev', 'Nm': 'Num', 'Dt': 'Deut',
  'Gs': 'Jos', 'Gdc': 'Jdg', 'Rt': 'Ruth', '1Sam': '1Sam', '2Sam': '2Sam',
  '1Re': '1Kgs', '2Re': '2Kgs', '1Cr': '1Chr', '2Cr': '2Chr',
  'Esd': 'Ezra', 'Ne': 'Neh', 'Tb': 'Tob', 'Gdt': 'Jdt', 'Est': 'Esth',
  '1Mac': '1Macc', '2Mac': '2Macc', 'Gb': 'Job', 'Sal': 'Ps', 'Pr': 'Prov',
  'Qo': 'Eccl', 'Ct': 'Song', 'Sap': 'Wis', 'Sir': 'Sir',
  'Is': 'Isa', 'Ger': 'Jer', 'Lam': 'Lam', 'Bar': 'Bar', 'Ez': 'Ezek',
  'Dn': 'Dan', 'Os': 'Hos', 'Gl': 'Joel', 'Am': 'Amos', 'Abd': 'Obad',
  'Gio': 'Jonah', 'Mi': 'Mic', 'Na': 'Nah', 'Ab': 'Hab', 'Sof': 'Zeph',
  'Ag': 'Hag', 'Zc': 'Zech', 'Ml': 'Mal',
  // Nuovo Testamento
  'Mt': 'Mt', 'Mc': 'Mk', 'Lc': 'Lk', 'Gv': 'Jn',
  'At': 'Acts', 'Rm': 'Rom', '1Cor': '1Cor', '2Cor': '2Cor',
  'Gal': 'Gal', 'Ef': 'Eph', 'Fil': 'Phil', 'Col': 'Col',
  '1Ts': '1Thess', '2Ts': '2Thess', '1Tm': '1Tim', '2Tm': '2Tim',
  'Tt': 'Titus', 'Fm': 'Phlm', 'Eb': 'Heb', 'Gc': 'Jas',
  '1Pt': '1Pet', '2Pt': '2Pet', '1Gv': '1Jn', '2Gv': '2Jn', '3Gv': '3Jn',
  'Gd': 'Jude', 'Ap': 'Rev',
};

/**
 * Get available Bible versions
 */
export async function getAvailableVersions(): Promise<string[]> {
  try {
    const url = `${BASE_URL}/?query=bibleversions&return=json&appid=${APP_ID}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.versions || ['CEI2008', 'VULG'];
  } catch {
    return ['CEI2008', 'VULG'];
  }
}
