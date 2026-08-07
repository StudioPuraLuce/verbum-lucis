/**
 * Generatore Pagina Sacra.
 *
 * Flusso: risolve il contesto liturgico del giorno (DB -> LitCal -> override) ->
 * chiama il modello Anthropic via binding Workers AI sul gateway "verbum-lucis"
 * (prompt caching sul system) -> valida -> upsert in `pagine_sacre`.
 *
 * Indipendente dal front-end: qualsiasi skin legge la tabella.
 */
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { eq } from 'drizzle-orm';
import type { Db } from '../../db/db-config';
import { schema } from '../../db/db-config';
import { fetchDayLiturgy, mapCelebrationToLiturgy, getLiturgicalCycle } from './litcal';
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  type LiturgyContext,
  type PaginaSacraContent,
} from './pagina-sacra-prompt';

const DEFAULT_MODEL = 'anthropic/claude-sonnet-4.6';
const DEFAULT_GATEWAY = 'verbum-lucis';

const COLOR_LABEL: Record<string, string> = {
  green: 'Verde', verde: 'Verde',
  violet: 'Viola', purple: 'Viola', viola: 'Viola',
  white: 'Bianco', bianco: 'Bianco',
  red: 'Rosso', rosso: 'Rosso',
  rose: 'Rosa', rosa: 'Rosa',
  gold: 'Oro', oro: 'Oro',
};

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** Override parziale passabile dall'endpoint per testare con letture reali. */
export type LiturgyOverride = Partial<LiturgyContext>;

/**
 * Costruisce il contesto liturgico per una data. Prova DB, poi LitCal.
 * Ritorna anche l'eventuale liturgyId per il collegamento.
 */
export async function resolveLiturgyContext(
  db: Db,
  dataISO: string,
  override?: LiturgyOverride,
): Promise<{ ctx: LiturgyContext; liturgyId: number | null }> {
  const d = new Date(dataISO + 'T00:00:00');
  const base: LiturgyContext = {
    dataISO,
    dataUmana: cap(format(d, 'EEEE d MMMM yyyy', { locale: it })),
    giornoSettimana: cap(format(d, 'EEEE', { locale: it })),
    tempoLiturgico: 'Tempo Ordinario',
    cicloAnno: getLiturgicalCycle(d.getFullYear()).cycle,
    vangeloRif: '',
    isDomenica: d.getDay() === 0,
  };
  let liturgyId: number | null = null;

  // 1) DB
  try {
    const row = await db.query.liturgy.findFirst({
      where: (t, { eq }) => eq(t.data, dataISO),
    });
    if (row) {
      liturgyId = row.id;
      base.tempoLiturgico = row.tempoLiturgico || base.tempoLiturgico;
      base.coloreLiturgico = COLOR_LABEL[(row.coloreLiturgico || '').toLowerCase()] || row.coloreLiturgico || undefined;
      base.memoria = row.domenicaSettimana || null;
      base.vangeloRif = row.vangelo?.riferimento || base.vangeloRif;
      base.vangeloTesto = row.vangelo?.testo;
      base.primaLetturaRif = row.primaLettura?.riferimento;
      base.primaLetturaTesto = row.primaLettura?.testo;
      base.salmoRif = row.salmoResponsoriale?.riferimento;
      base.salmoRitornello = row.salmoResponsoriale?.ritornello;
      base.secondaLetturaRif = row.secondaLettura?.riferimento;
      base.secondaLetturaTesto = row.secondaLettura?.testo;
    }
  } catch { /* tabella/binding non pronti: si prosegue */ }

  // 2) LitCal (se il DB non ha il Vangelo)
  if (!base.vangeloRif) {
    try {
      const cel = await fetchDayLiturgy(dataISO);
      if (cel) {
        const m = mapCelebrationToLiturgy(cel);
        base.tempoLiturgico = m.tempoLiturgico || base.tempoLiturgico;
        base.coloreLiturgico = COLOR_LABEL[(m.coloreLiturgico || '').toLowerCase()] || base.coloreLiturgico;
        base.memoria = m.domenicaSettimana || base.memoria || null;
        base.vangeloRif = m.vangelo.riferimento;
        if (m.vangelo.testo && !/messale diocesano/i.test(m.vangelo.testo)) base.vangeloTesto = m.vangelo.testo;
        base.primaLetturaRif = m.primaLettura.riferimento;
        if (m.primaLettura.testo && !/messale diocesano/i.test(m.primaLettura.testo)) base.primaLetturaTesto = m.primaLettura.testo;
        base.salmoRif = m.salmoResponsoriale.riferimento;
        base.salmoRitornello = m.salmoResponsoriale.ritornello;
        base.secondaLetturaRif = m.secondaLettura?.riferimento;
        base.secondaLetturaTesto = m.secondaLettura?.testo;
      }
    } catch { /* rete non disponibile in dev: si prosegue con l'override */ }
  }

  // 3) Override esplicito (vince su tutto)
  const ctx: LiturgyContext = { ...base, ...(override || {}) };
  return { ctx, liturgyId };
}

/** Estrae il primo oggetto JSON dal testo del modello, tollerante a fence/prosa. */
function parseJsonLoose(text: string): any {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Risposta del modello priva di JSON: ' + text.slice(0, 200));
  }
  return JSON.parse(t.slice(start, end + 1));
}

function assertContent(c: any): asserts c is PaginaSacraContent {
  const stringFields = ['reOggi', 'fuocoNelCorpo', 'presenzaNelGiorno', 'regnoNellaCarne', 'camminoIdentita', 'fraseDiario'];
  for (const f of stringFields) {
    if (typeof c?.[f] !== 'string' || !c[f].trim()) throw new Error(`Campo mancante o non valido: ${f}`);
  }
  if (!c.rosarioInteriore?.misteroIspirato || !c.rosarioInteriore?.preghiera) throw new Error('rosarioInteriore incompleto');
  if (!c.gestoReale?.titolo || !Array.isArray(c.gestoReale?.esempi)) throw new Error('gestoReale incompleto');
  if (!Array.isArray(c.avversario?.tentazioni) || !c.avversario?.antidoto) throw new Error('avversario incompleto');
}

/** Chiama il modello sul gateway autenticato e ritorna il contenuto validato. */
async function callModel(env: Env, ctx: LiturgyContext): Promise<PaginaSacraContent> {
  const model = env.GEN_MODEL || DEFAULT_MODEL;
  const gatewayId = env.AI_GATEWAY_NAME || DEFAULT_GATEWAY;

  const gateway: Record<string, unknown> = { id: gatewayId };
  // In dev locale il gateway autenticato richiede il token esplicito.
  if (env.CF_AIG_TOKEN) gateway.authorization = `Bearer ${env.CF_AIG_TOKEN}`;

  const resp: any = await env.AI.run(
    model as any,
    {
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(ctx) }],
    } as any,
    { gateway } as any,
  );

  const text: string =
    typeof resp === 'string' ? resp
    : Array.isArray(resp?.content) ? resp.content.map((b: any) => b?.text ?? '').join('')
    : resp?.response ?? '';
  if (!text) throw new Error('Risposta vuota dal modello');

  const content = parseJsonLoose(text);
  assertContent(content);
  return content;
}

export interface GeneraOptions {
  env: Env;
  db: Db;
  dataISO: string;
  override?: LiturgyOverride;
  /** Se false (default) e la Pagina esiste gia, non rigenera. */
  force?: boolean;
}

export interface GeneraResult {
  status: 'created' | 'updated' | 'skipped';
  dataISO: string;
  vangeloRif: string;
  id?: number;
}

/** Genera (o rigenera) la Pagina Sacra per una data e la salva in D1. */
export async function generaPaginaSacra(opts: GeneraOptions): Promise<GeneraResult> {
  const { env, db, dataISO, override, force = false } = opts;

  const existing = await db.query.pagineSacre.findFirst({
    where: (t, { eq }) => eq(t.data, dataISO),
  });
  if (existing && !force) {
    return { status: 'skipped', dataISO, vangeloRif: '', id: existing.id };
  }

  const { ctx, liturgyId } = await resolveLiturgyContext(db, dataISO, override);
  if (!ctx.vangeloRif) {
    throw new Error(
      `Nessun Vangelo per ${dataISO}: DB e LitCal non hanno dati. ` +
      `Fornisci un override { vangeloRif, vangeloTesto } nella richiesta.`,
    );
  }

  const content = await callModel(env, ctx);

  const values = {
    data: dataISO,
    liturgyId,
    reOggi: content.reOggi,
    fuocoNelCorpo: content.fuocoNelCorpo,
    presenzaNelGiorno: content.presenzaNelGiorno,
    regnoNellaCarne: content.regnoNellaCarne,
    rosarioInteriore: content.rosarioInteriore,
    gestoReale: content.gestoReale,
    avversario: content.avversario,
    camminoIdentita: content.camminoIdentita,
    fraseDiario: content.fraseDiario,
  };

  if (existing) {
    await db.update(schema.pagineSacre).set(values).where(eq(schema.pagineSacre.id, existing.id));
    return { status: 'updated', dataISO, vangeloRif: ctx.vangeloRif, id: existing.id };
  }
  const inserted = await db.insert(schema.pagineSacre).values(values).returning({ id: schema.pagineSacre.id });
  return { status: 'created', dataISO, vangeloRif: ctx.vangeloRif, id: inserted[0]?.id };
}
