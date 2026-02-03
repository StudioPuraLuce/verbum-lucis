/**
 * Import santi da saints-aggregated.json
 * Esegui: node scripts/import-saints.js
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { readFileSync } from 'fs';
import * as schema from '../db/schema.ts';

const connStr = process.env.DATABASE_URL
  || 'postgresql://verbum_user:changeme123@localhost:5432/verbum_lucis';
const client = postgres(connStr);
const db = drizzle(client, { schema });

async function importSaints() {
  console.log('📿 Import santi da saints-aggregated.json...\n');

  const json = readFileSync('./data/saints-aggregated.json', 'utf-8');
  const saints = JSON.parse(json);

  console.log(`📄 Santi trovati nel JSON: ${saints.length}\n`);

  let inserted = 0;
  let skipped = 0;

  for (const saint of saints) {
    const exists = await db.query.saints.findFirst({
      where: (t, { eq }) => eq(t.slug, saint.slug),
    });

    if (exists) {
      skipped++;
      console.log(`  ⏭️  ${saint.nome} (già presente)`);
      continue;
    }

    await db.insert(schema.saints).values({
      nome: saint.nome,
      nomeCompleto: saint.nomeCompleto || null,
      slug: saint.slug,
      dataFesta: saint.dataFesta,
      biografia: saint.biografia || null,
      biografiaBreve: saint.biografiaBreve || null,
      patronoDi: saint.patronoDi || [],
      titolo: saint.titolo || null,
      epoca: saint.epoca || null,
      ricorrenza: saint.ricorrenza || 'Facoltativa',
      popolarita: saint.popolarita || 50,
    });

    inserted++;
    console.log(`  ✅ ${saint.nome}`);
  }

  console.log(`\n📊 Riepilogo:`);
  console.log(`   Inseriti:     ${inserted}`);
  console.log(`   Già presenti: ${skipped}`);
  console.log('✨ Import santi completato!\n');

  await client.end();
}

importSaints().catch(console.error);
