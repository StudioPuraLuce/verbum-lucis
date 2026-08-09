// SEED LITURGIA — popola la tabella `liturgy` per una finestra di date.
//
//   node --import tsx scripts/seed-liturgia.mjs [--start YYYY-MM-DD] [--days N] [--lang IT]
//
// Catena: evangelizo (riferimenti del giorno) → BibleGet (testo CEI, cache) → coordinata dalla
// spirale (colore/tempo). Genera drizzle/seed-liturgia.sql (idempotente: DELETE del range + INSERT).
// Cache in .liturgia-cache/ (gitignorata) per non ri-chiamare le API. Applica con:
//   npm run db:liturgia:seed:local
//
// ⚠️ Il testo CEI 2008 è copyright della Fondazione: la SQL generata (in drizzle/, gitignorata) e
// il DB locale lo contengono per lo sviluppo; la messa in produzione è una scelta/gate dell'utente.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import { lettureDelGiorno, ruoliLetture } from '../src/lib/evangelizo.ts';
import { fetchTestoRiferimento } from '../src/lib/bibleget.ts';
import { liturgicalCoordinate } from '../src/lib/liturgical-spiral.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(HERE);
const OUT = join(ROOT, 'drizzle', 'seed-liturgia.sql');
const CACHE = join(ROOT, '.liturgia-cache');
if (!existsSync(CACHE)) mkdirSync(CACHE, { recursive: true });

const args = process.argv.slice(2);
const getArg = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const START = getArg('--start', new Date().toISOString().slice(0, 10));
const DAYS = Number(getArg('--days', 8)) || 8;
const LANG = getArg('--lang', 'IT');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha = (s) => createHash('sha1').update(s).digest('hex').slice(0, 16);
const q = (v) => (v == null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);
const jsonCol = (o) => q(JSON.stringify(o));

function dateRange(startISO, n) {
  const out = [];
  const d = new Date(startISO + 'T00:00:00Z');
  for (let i = 0; i < n; i++) { out.push(d.toISOString().slice(0, 10)); d.setUTCDate(d.getUTCDate() + 1); }
  return out;
}

// Testo CEI con cache per-riferimento (idempotente, gentile con l'API BibleGet).
async function testoCached(rif) {
  if (!rif) return '';
  const p = join(CACHE, `bg-${sha(rif)}.json`);
  if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf-8')).testo || '';
  const testo = await fetchTestoRiferimento(rif);
  if (testo) writeFileSync(p, JSON.stringify({ rif, testo })); // non cachare i vuoti (500 transitori → ritenta)
  await sleep(350); // rate-limit cortese
  return testo;
}

async function evangelizoCached(dataISO) {
  const p = join(CACHE, `ev-${dataISO}.json`);
  if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf-8'));
  const g = await lettureDelGiorno(dataISO, LANG);
  writeFileSync(p, JSON.stringify(g));
  return g;
}

async function main() {
  const dates = dateRange(START, DAYS);
  console.log(`Seed liturgia: ${dates[0]} … ${dates[dates.length - 1]} (${DAYS} giorni, ${LANG})`);
  const rows = [];

  for (const data of dates) {
    const g = await evangelizoCached(data);
    if (!g || !g.letture?.length) { console.log(`  ${data}: — nessuna lettura`); continue; }
    const { primaLettura, salmo, secondaLettura, vangelo } = ruoliLetture(g);
    const coord = liturgicalCoordinate(data);

    const [t1, tS, t2, tV] = await Promise.all([
      testoCached(primaLettura?.riferimento), testoCached(salmo?.riferimento),
      testoCached(secondaLettura?.riferimento), testoCached(vangelo?.riferimento),
    ]);

    rows.push({
      data,
      anno: Number(data.slice(0, 4)),
      tempoLiturgico: coord.tempoLabel,
      domenicaSettimana: g.titolo || null,
      coloreLiturgico: coord.colore,
      primaLettura: { riferimento: primaLettura?.displayed ? `${primaLettura.libro} ${primaLettura.displayed}`.trim() : (primaLettura?.riferimento || 'Non disponibile'), testo: t1 },
      salmoResponsoriale: { riferimento: salmo ? `Salmo ${salmo.displayed}`.trim() : 'Salmo', ritornello: '', testo: tS },
      secondaLettura: secondaLettura ? { riferimento: `${secondaLettura.libro} ${secondaLettura.displayed}`.trim(), testo: t2 } : null,
      vangelo: { riferimento: vangelo?.displayed ? `${vangelo.libro} ${vangelo.displayed}`.trim() : (vangelo?.riferimento || 'Vangelo'), testo: tV },
    });
    console.log(`  ${data}: ${g.titolo} · V:${vangelo?.riferimento || '—'} ${tV ? '✓testo' : ''}`);
  }

  // SQL idempotente: cancella il range nazionale e reinserisce.
  const lines = ['-- seed liturgia (evangelizo + BibleGet CEI) — PRIVATO/locale, non committare', 'BEGIN TRANSACTION;'];
  lines.push(`DELETE FROM liturgy WHERE diocesi_id IS NULL AND data IN (${dates.map(q).join(', ')});`);
  const COLS = 'data, anno, diocesi_id, tempo_liturgico, domenica_settimana, colore_liturgico, prima_lettura, salmo_responsoriale, seconda_lettura, vangelo, santi_del_giorno';
  for (const r of rows) {
    lines.push(
      `INSERT INTO liturgy (${COLS}) VALUES (` +
      [q(r.data), r.anno, 'NULL', q(r.tempoLiturgico), q(r.domenicaSettimana), q(r.coloreLiturgico),
       jsonCol(r.primaLettura), jsonCol(r.salmoResponsoriale),
       r.secondaLettura ? jsonCol(r.secondaLettura) : 'NULL', jsonCol(r.vangelo), q('[]')].join(', ') + ');',
    );
  }
  lines.push('COMMIT;');
  writeFileSync(OUT, lines.join('\n') + '\n');
  console.log(`\nSEED liturgia → ${OUT} · ${rows.length} giorni · applica: npm run db:liturgia:seed:local`);
}

main().catch((e) => { console.error(e); process.exit(1); });
