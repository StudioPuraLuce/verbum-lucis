// Genera drizzle/seed.sql dai data/*.json per D1.
// Uso: node scripts/gen-seed-sql.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => JSON.parse(readFileSync(join(ROOT, 'data', f), 'utf8'));

const q = (v) => {
  if (v === null || v === undefined || v === '') return 'NULL';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? '1' : '0';
  if (Array.isArray(v) || typeof v === 'object') v = JSON.stringify(v);
  return `'${String(v).replace(/'/g, "''")}'`;
};
const row = (table, cols, vals) =>
  `INSERT OR IGNORE INTO ${table} (${cols.join(', ')}) VALUES (${vals.map(q).join(', ')});`;

const out = ['-- Seed D1 generato da data/*.json', 'PRAGMA foreign_keys=OFF;', ''];

// ─── SANTI ───
const saints = read('saints-aggregated.json');
out.push(`-- saints (${saints.length})`);
for (const s of saints) {
  out.push(row('saints',
    ['nome', 'nome_completo', 'slug', 'data_festa', 'geografia_breve', 'patrono_di', 'titolo', 'epoca', 'popolarita'],
    [s.nome, s.nomeCompleto, s.slug, s.dataFesta, s.biografiaBreve, s.patronoDi ?? [], s.titolo, s.epoca, s.popolarita ?? 0]));
}
out.push('');

// ─── PREGHIERE ───
const prayers = read('prayers-expanded.json');
out.push(`-- prayers (${prayers.length})`);
for (const p of prayers) {
  out.push(row('prayers',
    ['titolo', 'slug', 'testo', 'categoria', 'occasione', 'fonte_ufficiale', 'testo_latin', 'popolarita', 'durata'],
    [p.titolo, p.slug, p.testo, p.categoria, p.occasione, p.fonteUfficiale ?? false, p.testoLatin, p.popolarita ?? 0, p.durata]));
}
out.push('');

// ─── DIOCESI ───
const dioceses = read('diocesi.json');
out.push(`-- dioceses (${dioceses.length})`);
for (const d of dioceses) {
  out.push(row('dioceses',
    ['nome', 'slug', 'codice', 'regione', 'regione_ecclesiastica', 'tipo'],
    [d.nome, d.slug, d.codice, d.regione, d.regioneEcclesiastica, d.tipo]));
}
out.push('');

// ─── INTENZIONI ───
const intentions = read('intenzioni.json');
out.push(`-- intentions (${intentions.length})`);
for (const i of intentions) {
  out.push(row('intentions',
    ['titolo', 'slug', 'categoria', 'descrizione'],
    [i.titolo, i.slug, i.categoria, i.descrizione]));
}
out.push('');

// ─── CATECHISMO ───  (shape: { id, text })
const catechism = read('catechismo-it.json');
out.push(`-- catechism (${catechism.length})`);
for (const c of catechism) {
  const numero = c.numero ?? c.id;
  const testo = c.testo ?? c.text;
  if (numero == null || testo == null) continue;
  out.push(row('catechism', ['numero', 'testo'], [numero, testo]));
}
out.push('');
out.push('PRAGMA foreign_keys=ON;');

writeFileSync(join(ROOT, 'drizzle', 'seed.sql'), out.join('\n'));
console.log(`✓ drizzle/seed.sql: ${saints.length} santi, ${prayers.length} preghiere, ${dioceses.length} diocesi, ${intentions.length} intenzioni, ${catechism.length} CCC`);
