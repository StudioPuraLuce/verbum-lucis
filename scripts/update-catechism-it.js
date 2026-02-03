/**
 * Aggiorna il catechismo nel database con il testo italiano
 * scraped dal sito del Vaticano
 *
 * Esegui: npx tsx scripts/update-catechism-it.js
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import { readFileSync } from 'fs';
import * as schema from '../db/schema.ts';

const connStr = process.env.DATABASE_URL
  || 'postgresql://verbum_user:changeme123@localhost:5432/verbum_lucis';
const client = postgres(connStr);
const db = drizzle(client, { schema });

async function updateCatechism() {
  console.log('📖 Aggiornamento catechismo con testo italiano...\n');

  const json = readFileSync('./data/catechismo-it.json', 'utf-8');
  const paragrafi = JSON.parse(json);

  console.log(`📄 Paragrafi italiani trovati: ${paragrafi.length}\n`);

  let updated = 0;
  let notFound = 0;

  // Aggiorna in batch
  for (const paragrafo of paragrafi) {
    try {
      const result = await db.update(schema.catechism)
        .set({ testo: paragrafo.text })
        .where(eq(schema.catechism.numero, paragrafo.id));

      updated++;

      if (updated % 100 === 0) {
        console.log(`  ✅ Aggiornati ${updated} paragrafi...`);
      }
    } catch (e) {
      notFound++;
    }
  }

  console.log(`\n📊 Riepilogo:`);
  console.log(`   Aggiornati:    ${updated}`);
  console.log(`   Non trovati:   ${notFound}`);
  console.log('✨ Aggiornamento completato!\n');

  await client.end();
}

updateCatechism().catch(console.error);
