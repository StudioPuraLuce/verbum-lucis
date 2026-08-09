// IL CORPO DI CONOSCENZA — estrazione degli atomi (AI estrattiva, verbatim).
//
// Legge corpus/pagine.curate.jsonl, chiama il modello via l'endpoint HTTP del Gateway AI
// (unified billing, cf-aig-authorization da .dev.vars), scompone ogni Pagina in atomi
// tipizzati VERBATIM, con cache per-pagina, e scrive corpus/atomi.jsonl.
//
// Esegui:  node --env-file=.dev.vars corpus/pipeline/extract_atoms.mjs [--limit N] [--min-quality Q] [--all] [--concurrency C]
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import { ATOM_SYSTEM, buildAtomPrompt } from './atom-prompt.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORPUS = dirname(HERE);
const INP = join(CORPUS, 'pagine.curate.jsonl');
const OUT = join(CORPUS, 'atomi.jsonl');
const CACHE = join(CORPUS, 'atoms-cache');

const ACCOUNT = process.env.CF_ACCOUNT_ID || '60496826f56a093a72602bfae074fdcf';
const GATEWAY = process.env.AI_GATEWAY_NAME || 'verbum-lucis';
const MODEL = process.env.GEN_MODEL || 'claude-sonnet-4-6';
const URL = `https://gateway.ai.cloudflare.com/v1/${ACCOUNT}/${GATEWAY}/anthropic/v1/messages`;
const TOKEN = process.env.CF_AIG_TOKEN;
const TIPI = new Set(['insegnamento', 'preghiera', 'gesto', 'simbolo', 'meditazione', 'testimonianza', 'frase', 'concetto']);

// ── args ──
const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const LIMIT = Number(getArg('--limit', 0)) || 0;
const MIN_Q = args.includes('--all') ? -Infinity : Number(getArg('--min-quality', 8));
const CONC = Number(getArg('--concurrency', 4)) || 4;

if (!TOKEN) { console.error('Manca CF_AIG_TOKEN (usa: node --env-file=.dev.vars …)'); process.exit(1); }
if (!existsSync(CACHE)) mkdirSync(CACHE, { recursive: true });

const sha = (s) => createHash('sha1').update(s).digest('hex').slice(0, 16);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseJsonLoose(text) {
  let t = (text || '').trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a !== -1 && b > a) {
    try { return JSON.parse(t.slice(a, b + 1)); } catch { /* prova il salvataggio */ }
  }
  // Salvataggio da risposta TRONCATA (max_tokens): estrae gli oggetti-atomo completi
  // dall'array "atomi", scartando l'ultimo oggetto se incompleto.
  const arrStart = t.indexOf('[', t.indexOf('"atomi"') >= 0 ? t.indexOf('"atomi"') : 0);
  if (arrStart === -1) throw new Error('no json');
  const atomi = [];
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
        try { atomi.push(JSON.parse(t.slice(objStart, i + 1))); } catch { /* salta */ }
        objStart = -1;
      }
    } else if (ch === ']' && depth === 0) break;
  }
  return { atomi };
}

// verifica "verbatim": il testo dell'atomo deve comparire (normalizzato) nella Pagina
const norm = (s) => (s || '').toLowerCase().replace(/\s+/g, ' ').replace(/[^\p{L}\p{N} ]/gu, '').trim();
function isVerbatim(atomText, pageNorm) {
  const a = norm(atomText);
  if (a.length < 8) return false;
  if (pageNorm.includes(a)) return true;
  // tollera piccoli tagli: almeno l'80% dei bigrammi di parole dell'atomo è nella pagina
  const w = a.split(' ');
  if (w.length < 4) return pageNorm.includes(a);
  let hit = 0, tot = 0;
  for (let i = 0; i < w.length - 1; i++) { tot++; if (pageNorm.includes(w[i] + ' ' + w[i + 1])) hit++; }
  return tot > 0 && hit / tot >= 0.8;
}

async function callModel(prompt, tries = 4) {
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const r = await fetch(URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'anthropic-version': '2023-06-01',
          'cf-aig-authorization': `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
          model: MODEL, max_tokens: 8192, system: ATOM_SYSTEM,
          messages: [{ role: 'user', content: prompt }],
        }),
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

const RETRY_EMPTY = args.includes('--retry-empty');

async function extractPage(page) {
  const cachePath = join(CACHE, page.id + '.json');
  if (existsSync(cachePath)) {
    const hit = JSON.parse(readFileSync(cachePath, 'utf-8'));
    // Con --retry-empty non ci fidiamo delle cache vuote (spesso JSON troncato): rigenera.
    if (!(RETRY_EMPTY && (!hit.atomi || hit.atomi.length === 0))) {
      return { cached: true, ...hit };
    }
  }
  const { text, usage } = await callModel(buildAtomPrompt(page));
  let parsed;
  try { parsed = parseJsonLoose(text); } catch { parsed = { atomi: [] }; }
  const rec = { atomi: Array.isArray(parsed.atomi) ? parsed.atomi : [], usage };
  writeFileSync(cachePath, JSON.stringify(rec, null, 0));
  return { cached: false, ...rec };
}

async function main() {
  let pages = readFileSync(INP, 'utf-8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  pages = pages.filter((p) => (p.qualita ?? 0) >= MIN_Q).sort((a, b) => (b.qualita ?? 0) - (a.qualita ?? 0));
  if (LIMIT) pages = pages.slice(0, LIMIT);

  console.log(`Estrazione atomi da ${pages.length} Pagine (min-quality ${MIN_Q}, concorrenza ${CONC})`);
  const atoms = [];
  let inTok = 0, outTok = 0, done = 0, dropped = 0, apiCalls = 0;

  let idx = 0;
  async function worker() {
    while (idx < pages.length) {
      const page = pages[idx++];
      try {
        const res = await extractPage(page);
        if (!res.cached) { apiCalls++; inTok += res.usage.input_tokens || 0; outTok += res.usage.output_tokens || 0; }
        const pageNorm = norm(page.testo);
        const c = page.coord || {};
        res.atomi.forEach((a, i) => {
          if (!a || !TIPI.has(a.tipo) || typeof a.testo !== 'string') return;
          if (!isVerbatim(a.testo, pageNorm)) { dropped++; return; }  // scarta non-verbatim (anti-allucinazione)
          atoms.push({
            id: sha(page.id + '|' + i + '|' + a.testo.slice(0, 60)),
            tipo: a.tipo,
            testo: a.testo.trim(),
            titolo: (a.titolo || '').toString().slice(0, 80),
            tags: Array.isArray(a.tags) ? a.tags.slice(0, 8).map(String) : [],
            corpusId: page.id, data: page.dataRiferimento || null,
            tempo: c.tempo || null, colore: c.colore || null,
            ciclo: c.cicloDomenicale || null, centro: c.centro || null,
            vangelo: page.vangelo || null, qualita: page.qualita ?? null,
          });
        });
      } catch (e) {
        console.error(`  ! Pagina ${page.id}: ${e.message}`);
      }
      done++;
      if (done % 20 === 0 || done === pages.length) {
        process.stdout.write(`\r  ${done}/${pages.length} · atomi ${atoms.length} · call ${apiCalls} · ~${((inTok/1e6)*3 + (outTok/1e6)*15).toFixed(2)}$   `);
      }
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker));
  process.stdout.write('\n');

  writeFileSync(OUT, atoms.map((a) => JSON.stringify(a)).join('\n') + '\n');
  const byTipo = {};
  for (const a of atoms) byTipo[a.tipo] = (byTipo[a.tipo] || 0) + 1;
  console.log('ESTRAZIONE completata →', OUT);
  console.log(`  Atomi: ${atoms.length}  (scartati non-verbatim: ${dropped})`);
  console.log('  per tipo:', byTipo);
  console.log(`  API: ${apiCalls} chiamate · token in ${inTok} / out ${outTok} · costo stimato ~${((inTok/1e6)*3 + (outTok/1e6)*15).toFixed(2)}$`);
}

main().catch((e) => { console.error(e); process.exit(1); });
