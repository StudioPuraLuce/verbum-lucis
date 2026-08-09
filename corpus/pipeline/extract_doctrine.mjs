// IL CORPO DELLA DOTTRINA — estrae dai testi di sistema una MAPPA di concetti collegati
// (non atomi sparsi): idrogeni, centri, ottava, athanor, tetramorfo, leggi. Livello premium.
//
// node --env-file=.dev.vars corpus/pipeline/extract_doctrine.mjs [--ids a,b,c] [--limit N]
//        [--min-quality Q] [--all] [--concurrency C] [--retry-empty]
// Modello via GEN_MODEL (default claude-haiku-4-5). Cache per-pagina in corpus/doctrine-cache/.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORPUS = dirname(HERE);
const INP = join(CORPUS, 'pagine.curate.jsonl');
const OUT = join(CORPUS, 'dottrina.jsonl');
const CACHE = join(CORPUS, 'doctrine-cache');

const ACCOUNT = process.env.CF_ACCOUNT_ID || '60496826f56a093a72602bfae074fdcf';
const GATEWAY = process.env.AI_GATEWAY_NAME || 'verbum-lucis';
const MODEL = process.env.GEN_MODEL || 'claude-haiku-4-5';
const URL = `https://gateway.ai.cloudflare.com/v1/${ACCOUNT}/${GATEWAY}/anthropic/v1/messages`;
const TOKEN = process.env.CF_AIG_TOKEN;
const CATEGORIE = new Set(['idrogeno', 'centro', 'legge', 'processo', 'simbolo', 'organo', 'scala', 'pratica']);

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

// ── args ──
const args = process.argv.slice(2);
const getArg = (name, def) => { const i = args.indexOf(name); return i >= 0 && args[i + 1] ? args[i + 1] : def; };
const idsArg = args.includes('--ids') ? getArg('--ids', '').split(',').filter(Boolean) : null;
const LIMIT = Number(getArg('--limit', 0)) || 0;
const MIN_Q = args.includes('--all') ? -Infinity : Number(getArg('--min-quality', 5));
const CONC = Number(getArg('--concurrency', 6)) || 6;
const RETRY_EMPTY = args.includes('--retry-empty');

if (!TOKEN) { console.error('Manca CF_AIG_TOKEN (usa: node --env-file=.dev.vars …)'); process.exit(1); }
if (!existsSync(CACHE)) mkdirSync(CACHE, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Parsing robusto: gestisce fence, JSON completo e salvataggio da array "concetti" TRONCATO.
function parseJsonLoose(text) {
  let t = (text || '').trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a !== -1 && b > a) {
    try { return JSON.parse(t.slice(a, b + 1)); } catch { /* prova il salvataggio */ }
  }
  const arrStart = t.indexOf('[', t.indexOf('"concetti"') >= 0 ? t.indexOf('"concetti"') : 0);
  if (arrStart === -1) throw new Error('no json');
  const concetti = [];
  let depth = 0, inStr = false, esc = false, objStart = -1;
  for (let i = arrStart + 1; i < t.length; i++) {
    const ch = t[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') { inStr = true; continue; }
    if (ch === '{') { if (depth === 0) objStart = i; depth++; }
    else if (ch === '}') {
      depth--;
      if (depth === 0 && objStart !== -1) {
        try { concetti.push(JSON.parse(t.slice(objStart, i + 1))); } catch { /* salta */ }
        objStart = -1;
      }
    } else if (ch === ']' && depth === 0) break;
  }
  return { concetti };
}

async function callModel(prompt, tries = 4) {
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const r = await fetch(URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'anthropic-version': '2023-06-01', 'cf-aig-authorization': `Bearer ${TOKEN}` },
        body: JSON.stringify({ model: MODEL, max_tokens: 8192, system: SYSTEM, messages: [{ role: 'user', content: prompt }] }),
      });
      if (r.status === 429 || r.status >= 500) throw new Error('retryable ' + r.status);
      const j = await r.json();
      if (j.error) throw new Error(j.error.message || 'api error');
      const text = Array.isArray(j.content) ? j.content.map((b) => b.text || '').join('') : '';
      return { text, usage: j.usage || {} };
    } catch (e) {
      if (attempt === tries) throw e;
      await sleep(800 * attempt * attempt);
    }
  }
}

async function extractPage(page) {
  const cachePath = join(CACHE, page.id + '.json');
  if (existsSync(cachePath)) {
    const hit = JSON.parse(readFileSync(cachePath, 'utf-8'));
    if (!(RETRY_EMPTY && (!hit.concetti || hit.concetti.length === 0))) return { cached: true, ...hit };
  }
  const { text, usage } = await callModel(`TESTO:\n"""\n${page.testo}\n"""\n\nEstrai la mappa dei concetti (JSON).`);
  let parsed;
  try { parsed = parseJsonLoose(text); } catch { parsed = { concetti: [] }; }
  const rec = { concetti: Array.isArray(parsed.concetti) ? parsed.concetti : [], usage };
  writeFileSync(cachePath, JSON.stringify(rec, null, 0));
  return { cached: false, ...rec };
}

async function main() {
  let pages = readFileSync(INP, 'utf-8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  if (idsArg) pages = pages.filter((p) => idsArg.includes(p.id));
  else {
    pages = pages.filter((p) => p.tipo === 'dottrina' && (p.qualita ?? 0) >= MIN_Q)
                 .sort((a, b) => (b.qualita ?? 0) - (a.qualita ?? 0));
    if (LIMIT) pages = pages.slice(0, LIMIT);
  }

  console.log(`Corpo della Dottrina — ${pages.length} Pagine (min-quality ${MIN_Q}, modello ${MODEL}, concorrenza ${CONC})`);
  const concetti = [];
  let inTok = 0, outTok = 0, done = 0, apiCalls = 0, parseErr = 0;

  let idx = 0;
  async function worker() {
    while (idx < pages.length) {
      const p = pages[idx++];
      try {
        const res = await extractPage(p);
        if (!res.cached) { apiCalls++; inTok += res.usage.input_tokens || 0; outTok += res.usage.output_tokens || 0; }
        if (!res.concetti.length) parseErr++;
        for (const c of res.concetti) {
          if (!c || typeof c.nome !== 'string') continue;
          concetti.push({
            nome: c.nome.slice(0, 120),
            categoria: CATEGORIE.has(c.categoria) ? c.categoria : null,
            definizione: (c.definizione || '').toString(),
            scala: c.scala ?? null,
            collegamenti: Array.isArray(c.collegamenti) ? c.collegamenti.slice(0, 20).map(String) : [],
            citazione: (c.citazione || '').toString(),
            fonte: p.thread || null, corpusId: p.id,
            tempo: p.coord?.tempo || null, data: p.dataRiferimento || null,
          });
        }
      } catch (e) { console.error(`  ! ${p.id}: ${e.message}`); }
      done++;
      if (done % 20 === 0 || done === pages.length) {
        process.stdout.write(`\r  ${done}/${pages.length} · concetti ${concetti.length} · call ${apiCalls} · ~${((inTok/1e6)*3 + (outTok/1e6)*15).toFixed(2)}$   `);
      }
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker));
  process.stdout.write('\n');

  writeFileSync(OUT, concetti.map((c) => JSON.stringify(c)).join('\n') + '\n');
  const byCat = {};
  for (const c of concetti) byCat[c.categoria || '—'] = (byCat[c.categoria || '—'] || 0) + 1;
  console.log('DOTTRINA →', OUT);
  console.log(`  Concetti: ${concetti.length} · pagine senza concetti: ${parseErr}`);
  console.log('  per categoria:', byCat);
  console.log(`  API: ${apiCalls} chiamate · token in ${inTok} / out ${outTok} · costo (prezzi Sonnet) ~${((inTok/1e6)*3 + (outTok/1e6)*15).toFixed(2)}$`);
}

main().catch((e) => { console.error(e); process.exit(1); });
