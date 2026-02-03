/**
 * Import intenzioni di preghiera nel database
 * Crea le pagine /prego-per/* nel sito
 *
 * Esegui: node scripts/import-intentions.js
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { readFileSync } from 'fs';
import * as schema from '../db/schema.ts';

const connStr = process.env.DATABASE_URL
  || 'postgresql://verbum_user:changeme123@localhost:5432/verbum_lucis';
const client = postgres(connStr);
const db = drizzle(client, { schema });

async function resolveRelations(intenzione) {
  // Risolvi preghiere suggerite (slug → id)
  const preghiereIds = [];
  if (intenzione.preghiereSuggerite) {
    for (const slug of intenzione.preghiereSuggerite) {
      const prayer = await db.query.prayers.findFirst({
        where: (t, { eq }) => eq(t.slug, slug),
      });
      if (prayer) preghiereIds.push(prayer.id);
    }
  }

  // Risolvi santi intercedenti (slug → id)
  const santiIds = [];
  if (intenzione.santiIntercedenti) {
    for (const slug of intenzione.santiIntercedenti) {
      const saint = await db.query.saints.findFirst({
        where: (t, { eq }) => eq(t.slug, slug),
      });
      if (saint) santiIds.push(saint.id);
    }
  }

  // Risolvi punti catechismo per tema (tema → punto più rilevante)
  const catechismoIds = [];
  if (intenzione.catechismoTemi) {
    for (const tema of intenzione.catechismoTemi) {
      // Use SQL-level JSONB containment since Drizzle 0.29 lacks arrayContains
      const results = await client`
        SELECT numero FROM catechism WHERE tags @> ${JSON.stringify([tema])}::jsonb LIMIT 1
      `;
      if (results.length > 0) catechismoIds.push(results[0].numero);
    }
  }

  return { preghiereIds, santiIds, catechismoIds };
}

async function importIntentions() {
  console.log('🎯 Import intenzioni di preghiera...\n');

  const json = readFileSync('./data/intenzioni.json', 'utf-8');
  const intenzioni = JSON.parse(json);

  let inserted = 0;
  let skipped = 0;

  for (const intenzione of intenzioni) {
    const exists = await db.query.intentions.findFirst({
      where: (t, { eq }) => eq(t.slug, intenzione.slug),
    });

    if (exists) {
      skipped++;
      continue;
    }

    // Risolvi relazioni con preghiere, santi, catechismo
    const { preghiereIds, santiIds, catechismoIds } = await resolveRelations(intenzione);

    await db.insert(schema.intentions).values({
      titolo: intenzione.titolo,
      slug: intenzione.slug,
      categoria: intenzione.categoria,
      descrizione: intenzione.descrizione,
      preghiereSuggerite: preghiereIds,
      santiIntercedenti: santiIds,
      catechismoPunti: catechismoIds,
    });

    inserted++;
    console.log(`  ✅ /prego-per/${intenzione.slug}`);
    console.log(`     Preghiere: ${preghiereIds.length} | Santi: ${santiIds.length} | Catechismo: ${catechismoIds.length}`);
  }

  console.log(`\n📊 Inserite: ${inserted} | Già presenti: ${skipped}`);
  console.log('✨ Import intenzioni completato!\n');

  await client.end();
}

importIntentions().catch(console.error);
