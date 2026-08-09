// EVANGELIZO — fonte dei RIFERIMENTI delle letture del giorno (lezionario romano).
//
// publication.evangelizo.ws/{LANG}/days/{YYYY-MM-DD} → JSON con data.liturgic_title +
// data.readings[] (type reading/psalm/gospel, reading_code es. "Mt 15,21-28" con `#` tra segmenti).
// Copre domeniche ORDINARIE e ferie (dove LitCal non arriva). I RIFERIMENTI sono fatti (non
// copyright); il TESTO CEI si risolve a valle con BibleGet (src/lib/bibleget.ts). Il commento
// di evangelizo è copyright: NON si usa.

export type TipoLettura = 'reading' | 'psalm' | 'gospel' | string;

export interface LetturaRif {
  tipo: TipoLettura;
  riferimento: string;   // normalizzato per BibleGet, es. "Is56,1-1;Is56,6-7"
  displayed: string;     // etichetta leggibile di evangelizo, es. "56,1.6-7."
  libro: string;         // es. "Libro di Isaia"
}

export interface LiturgiaGiorno {
  data: string;          // YYYY-MM-DD
  titolo: string;        // liturgic_title, es. "XX Domenica del Tempo Ordinario"
  letture: LetturaRif[];
}

const BASE = 'https://publication.evangelizo.ws';

// Libri numerati: evangelizo usa "1_R", "1_Co"… (underscore) che BibleGet rifiuta.
// Mappa sulle sigle accettate da BibleGet (CEI). Le altre sigle (Is, Ps, Rm, Mt, Sir, Sap…)
// BibleGet le accetta già.
const EVANGELIZO_BOOK: Record<string, string> = {
  '1_S': '1Sam', '2_S': '2Sam', '1_R': '1Re', '2_R': '2Re', '1_Ch': '1Cr', '2_Ch': '2Cr',
  '1_M': '1Mac', '2_M': '2Mac', '1_Co': '1Cor', '2_Co': '2Cor', '1_Th': '1Ts', '2_Th': '2Ts',
  '1_Tm': '1Tm', '2_Tm': '2Tm', '1_P': '1Pt', '2_P': '2Pt', '1_Jn': '1Gv', '2_Jn': '2Gv', '3_Jn': '3Gv',
};

/** Mappa la sigla-libro iniziale di un segmento sulla forma accettata da BibleGet e ripulisce i
 *  suffissi di versetto (es. "9a", "13ab"): BibleGet lavora a versetto intero. */
function mapBook(seg: string): string {
  const m = seg.match(/^([0-9]?_?[A-Za-z]+)(.*)$/);
  if (!m) return seg;
  const [, book, rest] = m;
  const mapped = EVANGELIZO_BOOK[book] ?? book.replace('_', '');
  const cleanRest = rest.replace(/(\d)[a-z]+/g, '$1'); // "19,9a-9a" → "19,9-9"
  return mapped + cleanRest;
}

/** Normalizza un `reading_code` di evangelizo in una query BibleGet.
 *  "Is 56,1-1#Is 56,6-7" → "Is56,1-1;Is56,6-7" (segmenti `#` → `;`, spazi rimossi, sigle mappate). */
export function normalizeReadingCode(code: string): string {
  return (code || '')
    .split('#')
    .map((seg) => mapBook(seg.replace(/\s+/g, '').trim()))
    .filter(Boolean)
    .join(';');
}

/** Scarica i riferimenti delle letture del giorno da evangelizo. Ritorna null se non disponibile. */
export async function lettureDelGiorno(dataISO: string, lang = 'IT'): Promise<LiturgiaGiorno | null> {
  const url = `${BASE}/${lang}/days/${dataISO}`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const json: any = await res.json();
    const data = json?.data;
    if (!data || !Array.isArray(data.readings)) return null;

    const letture: LetturaRif[] = data.readings
      .filter((r: any) => r && r.reading_code)
      .map((r: any) => ({
        tipo: r.type || r.book_type || 'reading',
        riferimento: normalizeReadingCode(r.reading_code),
        displayed: (r.reference_displayed || '').toString(),
        libro: (r.title || '').toString(),
      }))
      .filter((l: LetturaRif) => l.riferimento);

    return { data: dataISO, titolo: (data.liturgic_title || '').toString(), letture };
  } catch {
    return null;
  }
}

/** Ripartisce le letture nei ruoli liturgici (1ª, salmo, 2ª, Vangelo). La 2ª esiste solo se
 *  ci sono due letture di tipo `reading` (tipico delle domeniche/solennità). */
export function ruoliLetture(g: LiturgiaGiorno): {
  primaLettura: LetturaRif | null;
  salmo: LetturaRif | null;
  secondaLettura: LetturaRif | null;
  vangelo: LetturaRif | null;
} {
  const readings = g.letture.filter((l) => l.tipo === 'reading');
  const salmo = g.letture.find((l) => l.tipo === 'psalm') || null;
  const vangelo = g.letture.find((l) => l.tipo === 'gospel') || null;
  return {
    primaLettura: readings[0] || null,
    salmo,
    secondaLettura: readings[1] || null,
    vangelo,
  };
}
