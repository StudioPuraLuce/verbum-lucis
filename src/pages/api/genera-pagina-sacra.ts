/**
 * POST /api/genera-pagina-sacra
 *
 * Genera la Pagina Sacra per una data e la salva in D1.
 * Protetto da bearer `GEN_SECRET` (evita che chiunque bruci crediti AI).
 *
 * Body JSON (tutti opzionali):
 *   { "date": "YYYY-MM-DD",            // default: oggi
 *     "force": true,                    // rigenera se esiste gia
 *     "override": {                     // letture reali per il test / dati mancanti
 *       "vangeloRif": "Lc 12,32-48",
 *       "vangeloTesto": "...",
 *       "tempoLiturgico": "Tempo Ordinario"
 *     } }
 *
 * Esempio:
 *   curl -X POST http://localhost:4321/api/genera-pagina-sacra \
 *     -H "Authorization: Bearer $GEN_SECRET" -H "Content-Type: application/json" \
 *     -d '{"date":"2026-08-09"}'
 */
import type { APIRoute } from 'astro';
import { getDb } from '../../db';
import { generaPaginaSacra, type LiturgyOverride } from '../../lib/pagina-sacra-generator';

export const prerender = false;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any)?.runtime?.env as Env | undefined;
  if (!env?.AI) return json({ error: 'Binding AI mancante. Aggiungi [ai] binding="AI" al wrangler.toml.' }, 500);

  // ─── Auth ───
  const secret = env.GEN_SECRET;
  if (!secret) return json({ error: 'GEN_SECRET non configurato (vedi .dev.vars).' }, 500);
  const auth = request.headers.get('authorization') || '';
  if (auth !== `Bearer ${secret}`) return json({ error: 'Non autorizzato.' }, 401);

  // ─── Input ───
  let body: { date?: string; force?: boolean; override?: LiturgyOverride } = {};
  try {
    if (request.headers.get('content-type')?.includes('application/json')) body = await request.json();
  } catch { /* body vuoto ammesso */ }

  const dataISO = body.date || new Date().toISOString().split('T')[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataISO)) return json({ error: `Data non valida: ${dataISO}` }, 400);

  // ─── Genera ───
  try {
    const result = await generaPaginaSacra({
      env,
      db: getDb(locals as any),
      dataISO,
      force: body.force === true,
      override: body.override,
    });
    return json({ ok: true, ...result });
  } catch (err: any) {
    return json({ ok: false, error: err?.message || String(err) }, 500);
  }
};
