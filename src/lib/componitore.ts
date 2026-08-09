// IL COMPONITORE GIORNALIERO — keystone della Fase 1.
//
// Data una data → coordinata liturgica (deterministica, offline) → seleziona dagli atomi del
// Corpo di Conoscenza (`atomi_corpus`) quelli pertinenti al giorno, li ranka per aderenza alla
// coordinata + qualità, e li compone per tipo. Alimenta: web (Pagina Sacra), Storie IG, WhatsApp.
//
// Vincolo brand (Stella Polare): gli atomi `concetto` (strato dottrinale/esoterico) NON entrano
// nel flusso mainstream. Qui sono esclusi a monte.
import type { Db } from '../db';
import { atomiCorpus } from '../db';
import { liturgicalCoordinate, type LiturgicalCoordinate } from './liturgical-spiral';

export interface AtomoScelto {
  atomId: string;
  tipo: string;
  testo: string;
  titolo: string | null;
  tags: string[];
  data: string | null;
  vangelo: string | null;
  qualita: number | null;
}

export interface GiornataComposta {
  data: string;
  coordinata: LiturgicalCoordinate;
  meditazioni: AtomoScelto[];
  preghiere: AtomoScelto[];
  gesti: AtomoScelto[];
  frasi: AtomoScelto[];
  simboli: AtomoScelto[];
  insegnamenti: AtomoScelto[];
  /** Quanti atomi-candidato ha visto il selettore (per debug/telemetria). */
  nCandidati: number;
}

// Sigla del Vangelo per ciclo domenicale (Legge del Tre: A/B/C = Mt/Mc/Lc; Gv trasversale).
const SIGLA_EVANGELISTA: Record<string, string> = {
  Matteo: 'Mt', Marco: 'Mc', Luca: 'Lc', Giovanni: 'Gv',
};

// Quanti atomi per tipo nella composizione del giorno.
const QUOTE: Record<string, number> = {
  meditazione: 3, preghiera: 2, gesto: 2, frase: 3, simbolo: 1, insegnamento: 2,
};

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

/** Punteggio di aderenza dell'atomo alla coordinata del giorno (più alto = più pertinente). */
function scoreAderenza(atom: AtomoScelto & { centro: string | null; tempo: string | null }, coord: LiturgicalCoordinate): number {
  let s = 0;
  if (coord.centro && atom.centro && norm(atom.centro) === norm(coord.centro)) s += 4; // stesso tema/centro del giorno
  if (atom.tempo && atom.tempo === coord.tempo) s += 2;                                  // stesso tempo liturgico
  const sigla = SIGLA_EVANGELISTA[coord.vangeloTonalita.evangelista];
  if (sigla && atom.vangelo && atom.vangelo.startsWith(sigla)) s += 1;                  // stessa tonalità evangelica
  return s;
}

/**
 * Compone la giornata per una data ISO (yyyy-MM-dd). Offline e deterministico nella selezione.
 * `pool` limita gli atomi-candidato caricati (default 500, ordinati per qualità).
 */
export async function componiGiornata(
  db: Db,
  dataISO: string,
  opts: { pool?: number } = {},
): Promise<GiornataComposta> {
  const coord = liturgicalCoordinate(dataISO);
  const poolSize = opts.pool ?? 500;

  // Candidati: stesso tempo liturgico, mai `concetto`, i migliori per qualità.
  let candidati = await db.query.atomiCorpus.findMany({
    where: (a, { and, ne, eq }) => and(ne(a.tipo, 'concetto'), eq(a.tempo, coord.tempo)),
    orderBy: (a, { desc }) => [desc(a.qualita)],
    limit: poolSize,
  });

  // Fallback: se il tempo non ha atomi (raro), allarga a tutto il corpus devozionale.
  if (candidati.length === 0) {
    candidati = await db.query.atomiCorpus.findMany({
      where: (a, { ne }) => ne(a.tipo, 'concetto'),
      orderBy: (a, { desc }) => [desc(a.qualita)],
      limit: poolSize,
    });
  }

  // Ranka per aderenza alla coordinata, poi per qualità, poi per id (stabile/deterministico).
  const ranked = candidati
    .map((a) => ({ atom: a, score: scoreAderenza(a as any, coord) }))
    .sort((x, y) =>
      y.score - x.score ||
      (y.atom.qualita ?? 0) - (x.atom.qualita ?? 0) ||
      x.atom.atomId.localeCompare(y.atom.atomId),
    );

  // Bucket per tipo, con dedup sul testo normalizzato e quote per tipo.
  const buckets: Record<string, AtomoScelto[]> = {
    meditazione: [], preghiera: [], gesto: [], frase: [], simbolo: [], insegnamento: [],
  };
  const visti = new Set<string>();
  for (const { atom } of ranked) {
    const b = buckets[atom.tipo];
    if (!b || b.length >= (QUOTE[atom.tipo] ?? 0)) continue;
    const key = norm(atom.testo).slice(0, 120);
    if (visti.has(key)) continue;
    visti.add(key);
    b.push({
      atomId: atom.atomId, tipo: atom.tipo, testo: atom.testo, titolo: atom.titolo,
      tags: (atom.tags as string[]) ?? [], data: atom.data, vangelo: atom.vangelo, qualita: atom.qualita,
    });
  }

  return {
    data: dataISO,
    coordinata: coord,
    meditazioni: buckets.meditazione,
    preghiere: buckets.preghiera,
    gesti: buckets.gesto,
    frasi: buckets.frase,
    simboli: buckets.simbolo,
    insegnamenti: buckets.insegnamento,
    nCandidati: candidati.length,
  };
}
