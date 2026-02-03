/**
 * Aggiorna liturgia nazionale + diocesana
 * Esegui: node scripts/update-liturgy.js
 *
 * Flags:
 *   --national           Aggiorna solo nazionale
 *   --diocese IT-RM      Aggiorna una diocesi specifica
 *   --all                Aggiorna nazionale + tutte le diocesi
 *   --days 7             Numero di giorni da aggiornare (default: 7)
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema.js';
import {
  fetchNationalCalendar,
  fetchDiocesan Calendar,
  mapCelebrationToLiturgy,
} from '../src/lib/litcal.js';

const connStr = process.env.DATABASE_URL
  || 'postgresql://verbum_user:changeme123@localhost:5432/verbum_lucis';
const client = postgres(connStr);
const db = drizzle(client, { schema });

// ─── PARSE ARGS ─────────────────────────────────────────
const args = process.argv.slice(2);
const mode = args.includes('--all') ? 'all'
  : args.includes('--diocese') ? 'diocese'
  : 'national';

const diocesiFlag = args[args.indexOf('--diocese') + 1] || null;
const daysFlag = parseInt(args[args.indexOf('--days') + 1]) || 7;

// ─── UTILITY ────────────────────────────────────────────
function getDateRange(days) {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

// ─── UPSERT ─────────────────────────────────────────────
async function upsertLiturgy(data) {
  const { eq, and, isNull } = await import('drizzle-orm');

  const whereClause = data.diocesiId
    ? and(eq(schema.liturgy.data, data.data), eq(schema.liturgy.diocesiId, data.diocesiId))
    : and(eq(schema.liturgy.data, data.data), isNull(schema.liturgy.diocesiId));

  const existing = await db.select().from(schema.liturgy).where(whereClause).limit(1);

  if (existing.length > 0) {
    await db.update(schema.liturgy).set(data).where(whereClause);
    return 'updated';
  } else {
    await db.insert(schema.liturgy).values(data);
    return 'inserted';
  }
}

// ─── NAZIONALE ──────────────────────────────────────────
async function updateNational(dates) {
  console.log('🇮🇹  Aggiornamento liturgia nazionale...\n');

  const year = new Date().getFullYear();
  let calendar;

  try {
    calendar = await fetchNationalCalendar(year);
  } catch (e) {
    console.error('❌ Errore fetch nazionale:', e.message);
    return;
  }

  let inserted = 0, updated = 0;

  for (const date of dates) {
    const cel = calendar.celebrations?.find(c => c.date === date);
    if (!cel) {
      console.log(`  ⚠️  Nessun dato per ${date}`);
      continue;
    }

    const liturgyData = mapCelebrationToLiturgy(cel, null);
    const result = await upsertLiturgy(liturgyData);

    if (result === 'inserted') inserted++;
    else updated++;

    console.log(`  ✅ [nazionale] ${date} — ${cel.title || 'Celebrazione'} (${result})`);
  }

  console.log(`\n  📊 Nazionale: inseriti ${inserted}, aggiornati ${updated}\n`);
}

// ─── DIOCESANO ──────────────────────────────────────────
async function updateDiocese(diocesiCode, diocesiId, dates) {
  const year = new Date().getFullYear();
  let calendar;

  try {
    calendar = await fetchDiocesan Calendar(diocesiCode, year);
  } catch (e) {
    console.error(`  ❌ Errore fetch diocesi ${diocesiCode}:`, e.message);
    return { inserted: 0, updated: 0, failed: true };
  }

  let inserted = 0, updated = 0;

  for (const date of dates) {
    const cel = calendar.celebrations?.find(c => c.date === date);
    if (!cel) continue;

    const liturgyData = mapCelebrationToLiturgy(cel, diocesiId);
    const result = await upsertLiturgy(liturgyData);

    if (result === 'inserted') inserted++;
    else updated++;
  }

  console.log(`  ✅ ${diocesiCode} — inseriti ${inserted}, aggiornati ${updated}`);
  return { inserted, updated, failed: false };
}

// ─── TUTTE LE DIOCESI ───────────────────────────────────
async function updateAllDioceses(dates) {
  console.log('🏛️  Aggiornamento tutte le diocesi...\n');

  const diocesi = await db.query.dioceses.findMany();
  console.log(`  Diocesi nel database: ${diocesi.length}\n`);

  let totalInserted = 0, totalUpdated = 0, failed = 0;

  for (const d of diocesi) {
    const result = await updateDiocese(d.codice, d.id, dates);
    totalInserted += result.inserted;
    totalUpdated += result.updated;
    if (result.failed) failed++;

    // Pausa per rispettare l'API
    await new Promise(r => setTimeout(r, 800));
  }

  console.log(`\n  📊 Diocesi: inseriti ${totalInserted}, aggiornati ${totalUpdated}, falliti ${failed}\n`);
}

// ─── SINGOLA DIOCESI ────────────────────────────────────
async function updateSingleDiocese(code, dates) {
  console.log(`🏛️  Aggiornamento diocesi ${code}...\n`);

  const diocesi = await db.query.dioceses.findFirst({
    where: (t, { eq }) => eq(t.codice, code),
  });

  if (!diocesi) {
    console.error(`❌ Diocesi non trovata: ${code}`);
    console.error('   Esegui prima: node scripts/import-dioceses.js');
    return;
  }

  await updateDiocese(diocesi.codice, diocesi.id, dates);
}

// ─── MAIN ───────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  Verbum Lucis — Aggiornamento Liturgia');
  console.log('═══════════════════════════════════════════\n');
  console.log(`  Modo:  ${mode}${diocesiFlag ? ` (${diocesiFlag})` : ''}`);
  console.log(`  Giorni: ${daysFlag}`);
  console.log(`  Date:  ${getDateRange(daysFlag).join(', ')}\n`);

  const dates = getDateRange(daysFlag);

  switch (mode) {
    case 'national':
      await updateNational(dates);
      break;

    case 'diocese':
      if (!diocesiFlag) {
        console.error('❌ Specifica la diocesi: --diocese IT-RM');
        break;
      }
      await updateSingleDiocese(diocesiFlag, dates);
      break;

    case 'all':
      await updateNational(dates);
      await updateAllDioceses(dates);
      break;
  }

  console.log('═══════════════════════════════════════════');
  console.log('  ✨ Aggiornamento completato');
  console.log('═══════════════════════════════════════════\n');

  await client.end();
}

main().catch(console.error);
