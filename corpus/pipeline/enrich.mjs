// LAVORAZIONE DEL CORPUS — Sessione 1, passo 3: ENRICH (coordinata liturgica).
//
// Per ogni Pagina con una data, aggancia la COORDINATA LITURGICA calcolata dal
// motore-spina (src/lib/liturgical-spiral.ts) — l'unica fonte di verità. Nessuna
// duplicazione della logica: importiamo direttamente `liturgicalCoordinate`.
//
// Esegui:  node --import tsx corpus/pipeline/enrich.mjs
// Input:   corpus/pagine.jsonl        Output: corpus/pagine.enriched.jsonl
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { liturgicalCoordinate } from '../../src/lib/liturgical-spiral.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORPUS = dirname(HERE);
const INP = join(CORPUS, 'pagine.jsonl');
const OUT = join(CORPUS, 'pagine.enriched.jsonl');

const ISO = /^\d{4}-\d{2}-\d{2}$/;

const lines = readFileSync(INP, 'utf-8').split('\n').filter(Boolean);
let enriched = 0;
const out = [];
for (const line of lines) {
  const p = JSON.parse(line);
  const iso = p.dataRiferimento;
  if (iso && ISO.test(iso)) {
    const c = liturgicalCoordinate(iso);
    p.coord = {
      tempo: c.tempo,
      tempoLabel: c.tempoLabel,
      colore: c.colore,
      cicloDomenicale: c.cicloDomenicale,
      cicloFeriale: c.cicloFeriale,
      settimana: c.settimana,
      settimanaRomana: c.settimanaRomana,
      giornoSettimana: c.giornoSettimana,
      isDomenica: c.isDomenica,
      centro: c.centro,
      lavoro: c.lavoro,
      festa: c.festa,
      vangeloTonalita: c.vangeloTonalita,
      annoLiturgico: c.annoLiturgico,
      fractionOfYear: Number(c.fractionOfYear.toFixed(4)),
    };
    enriched++;
  } else {
    p.coord = null;
  }
  out.push(JSON.stringify(p));
}
writeFileSync(OUT, out.join('\n') + '\n');
console.log('ENRICH completato →', OUT);
console.log(`  Pagine: ${lines.length}   con coordinata: ${enriched}   senza data: ${lines.length - enriched}`);

// Sanity: una Pagina pasquale nota
const sample = out.map((l) => JSON.parse(l)).find(
  (p) => p.dataRiferimento === '2025-04-21' && p.coord,
);
if (sample) {
  const c = sample.coord;
  console.log(`  SANITY 2025-04-21 → ${c.tempoLabel} sett.${c.settimana} colore:${c.colore} ` +
    `centro:${c.centro ?? '—'}  [atteso: Tempo di Pasqua, bianco]`);
}
