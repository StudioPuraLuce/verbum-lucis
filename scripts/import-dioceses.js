/**
 * Import diocesi italiane nel database
 * Esegui: node scripts/import-dioceses.js
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { readFileSync } from 'fs';
import * as schema from '../db/schema.ts';

const connStr = process.env.DATABASE_URL
  || 'postgresql://verbum_user:changeme123@localhost:5432/verbum_lucis';
const client = postgres(connStr);
const db = drizzle(client, { schema });

async function importDioceses() {
  console.log('🏛️  Import diocesi italiane...\n');

  const json = readFileSync('./data/diocesi.json', 'utf-8');
  const diocesi = JSON.parse(json);

  let inserted = 0;
  let skipped = 0;

  for (const d of diocesi) {
    const exists = await db.query.dioceses.findFirst({
      where: (t, { eq }) => eq(t.codice, d.codice),
    });

    if (exists) {
      skipped++;
      continue;
    }

    await db.insert(schema.dioceses).values({
      nome: d.nome,
      slug: d.slug,
      codice: d.codice,
      regione: d.regione,
      regioneEcclesiastica: d.regioneEcclesiastica,
      tipo: d.tipo,
    });

    inserted++;
    console.log(`  ✅ ${d.nome} (${d.codice})`);
  }

  console.log(`\n📊 Inserite: ${inserted} | Già presenti: ${skipped}`);
  console.log('✨ Import diocesi completato!\n');

  await client.end();
}

importDioceses().catch(console.error);
