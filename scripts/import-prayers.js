/**
 * Import preghiere espanse nel database
 * Esegui: node scripts/import-prayers.js
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { readFileSync } from 'fs';
import * as schema from '../db/schema.ts';

const connStr = process.env.DATABASE_URL
  || 'postgresql://verbum_user:changeme123@localhost:5432/verbum_lucis';
const client = postgres(connStr);
const db = drizzle(client, { schema });

async function importPrayers() {
  console.log('🙏 Import preghiere espanse...\n');

  const json = readFileSync('./data/prayers-expanded.json', 'utf-8');
  const prayers = JSON.parse(json);

  let inserted = 0;
  let skipped = 0;

  for (const p of prayers) {
    const exists = await db.query.prayers.findFirst({
      where: (t, { eq }) => eq(t.slug, p.slug),
    });

    if (exists) {
      skipped++;
      continue;
    }

    await db.insert(schema.prayers).values({
      titolo: p.titolo,
      slug: p.slug,
      testo: p.testo,
      categoria: p.categoria,
      fonteUfficiale: p.fonteUfficiale || false,
      popolarita: p.popolarita || 50,
      durata: p.durata || null,
    });

    inserted++;
    console.log(`  ✅ ${p.titolo}`);
  }

  console.log(`\n📊 Inserite: ${inserted} | Già presenti: ${skipped}`);
  console.log('✨ Import preghiere completato!\n');

  await client.end();
}

importPrayers().catch(console.error);
