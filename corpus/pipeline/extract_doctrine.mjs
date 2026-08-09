// IL CORPO DELLA DOTTRINA — estrae dai testi di sistema una MAPPA di concetti collegati
// (non atomi sparsi): idrogeni, centri, ottava, athanor, tetramorfo, leggi. Livello premium.
//
// node --env-file=.dev.vars corpus/pipeline/extract_doctrine.mjs [--ids a,b,c] [--limit N]
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORPUS = dirname(HERE);
const INP = join(CORPUS, 'pagine.curate.jsonl');
const OUT = join(CORPUS, 'dottrina.jsonl');
const ACCOUNT = '60496826f56a093a72602bfae074fdcf';
const URL = `https://gateway.ai.cloudflare.com/v1/${ACCOUNT}/verbum-lucis/anthropic/v1/messages`;
const TOKEN = process.env.CF_AIG_TOKEN;

const SYSTEM = `Sei il cartografo del sistema interiore di un autore: la sua "psicologia sacra"
(una Quarta Via cristificata — idrogeni eucaristici, centri interiori, Ottava operativa,
Athanor, Tetramorfo, leggi del Tre e del Sette). Dal testo ESTRAI i CONCETTI del sistema.

Per ogni concetto:
- "nome": nome canonico (es. "Idrogeno H96", "Centro emozionale superiore", "Ottava operativa", "Athanor").
- "categoria": una tra idrogeno | centro | legge | processo | simbolo | organo | scala | pratica.
- "definizione": fedele e concisa, nelle parole dell'autore (puoi sintetizzare, ma NON inventare).
- "scala": valore/posizione se applicabile (es. "H96", "DO→SI", "3ª forza"), altrimenti null.
- "collegamenti": nomi di altri concetti del sistema a cui si lega (array, anche vuoto).
- "citazione": UNA frase VERBATIM dal testo che lo esprime meglio.

Non inventare concetti non presenti nel testo. Se il testo non contiene sistema, {"concetti":[]}.
OUTPUT: SOLO JSON { "concetti": [ ... ] }.`;

async function call(prompt) {
  const r = await fetch(URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'anthropic-version': '2023-06-01', 'cf-aig-authorization': `Bearer ${TOKEN}` },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 4096, system: SYSTEM, messages: [{ role: 'user', content: prompt }] }),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  const text = (j.content || []).map((b) => b.text || '').join('');
  const a = text.indexOf('{'), b = text.lastIndexOf('}');
  return { parsed: JSON.parse(text.slice(a, b + 1)), usage: j.usage };
}

const args = process.argv.slice(2);
const idsArg = args.includes('--ids') ? args[args.indexOf('--ids') + 1].split(',') : null;
const limit = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : 0;

let pages = readFileSync(INP, 'utf-8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
if (idsArg) pages = pages.filter((p) => idsArg.includes(p.id));
else { pages = pages.filter((p) => p.tipo === 'dottrina').sort((a, b) => b.nChar - a.nChar); if (limit) pages = pages.slice(0, limit); }

const concetti = [];
let inTok = 0, outTok = 0;
for (const p of pages) {
  try {
    const { parsed, usage } = await call(`TESTO:\n"""\n${p.testo}\n"""\n\nEstrai la mappa dei concetti (JSON).`);
    inTok += usage.input_tokens || 0; outTok += usage.output_tokens || 0;
    for (const c of parsed.concetti || []) concetti.push({ ...c, fonte: p.thread, corpusId: p.id });
    console.log(`  ${p.id}: +${(parsed.concetti || []).length} concetti`);
  } catch (e) { console.error(`  ! ${p.id}: ${e.message}`); }
}
writeFileSync(OUT, concetti.map((c) => JSON.stringify(c)).join('\n') + '\n');
console.log(`\nDOTTRINA → ${OUT} · ${concetti.length} concetti · ~${((inTok/1e6)*3+(outTok/1e6)*15).toFixed(2)}$`);
