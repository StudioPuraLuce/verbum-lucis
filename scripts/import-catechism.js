/**
 * Import Catechismo della Chiesa Cattolica (CCC)
 * Sorgente: github.com/aseemsavio/catholicism-in-json
 *
 * Setup:
 *   git clone https://github.com/aseemsavio/catholicism-in-json.git data/catholicism-in-json
 *   node scripts/import-catechism.js
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { readFileSync, existsSync } from 'fs';
import * as schema from '../db/schema.ts';

const connStr = process.env.DATABASE_URL
  || 'postgresql://verbum_user:changeme123@localhost:5432/verbum_lucis';
const client = postgres(connStr);
const db = drizzle(client, { schema });

// Path verso il file JSON del catechismo
const CATECHISM_PATH = './data/catholicism-in-json/catechism.json';

/**
 * Mappa parole-chiave nel testo → tags automatici
 */
function extractTags(testo) {
  const tagMap = [
    { tag: 'preghiera',      keywords: ['preghiera', 'pregare', 'orazione', 'invocazione'] },
    { tag: 'sacramento',     keywords: ['sacramento', 'battesimo', 'eucaristia', 'cresima', 'matrimonio', 'ordine', 'penitenza', 'unzione'] },
    { tag: 'dio',            keywords: ['dio', 'trinità', 'padre, figlio', 'spirito santo'] },
    { tag: 'gesu',           keywords: ['gesù', 'cristo', 'incarnazione', 'pasqua', 'crocifissione', 'risurrezione'] },
    { tag: 'maria',          keywords: ['maria', 'vergine', 'madre di dio', 'immacolata'] },
    { tag: 'chiesa',         keywords: ['chiesa', 'comunità', 'sakramentale', 'apostoli'] },
    { tag: 'morale',         keywords: ['peccato', 'virtù', 'giustizia', 'carità', 'amore'] },
    { tag: 'vita-eterna',    keywords: ['vita eterna', 'paradiso', 'risurrezione dei morti', 'giudizio'] },
    { tag: 'bibbia',         keywords: ['scriptura', 'vangelo', 'lettura', 'antico testamento', 'nuovo testamento'] },
    { tag: 'salvezza',       keywords: ['salvezza', 'redenzione', 'grazia', 'misericordia'] },
  ];

  const testoLower = testo.toLowerCase();
  const tags = [];

  for (const { tag, keywords } of tagMap) {
    if (keywords.some(kw => testoLower.includes(kw))) {
      tags.push(tag);
    }
  }

  return tags;
}

/**
 * Estrai riferimenti biblici dal testo (pattern: "Libro cap,vers")
 */
function extractReferences(testo) {
  const pattern = /([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s(\d+),(\d+(?:-\d+)?)/g;
  const refs = [];
  let match;

  while ((match = pattern.exec(testo)) !== null) {
    refs.push(`${match[1]} ${match[2]},${match[3]}`);
  }

  return [...new Set(refs)]; // rimuovi duplicati
}

/**
 * Determina la parte del catechismo dal numero
 * Parte I: 1-366, Parte II: 367-1064, Parte III: 1065-1794, Parte IV: 1795-2865
 */
function getParte(numero) {
  if (numero <= 366) return 'I';
  if (numero <= 1064) return 'II';
  if (numero <= 1794) return 'III';
  return 'IV';
}

async function importCatechism() {
  console.log('📖 Import Catechismo della Chiesa Cattolica...\n');

  // Verifica che il file esista
  if (!existsSync(CATECHISM_PATH)) {
    console.error('❌ File non trovato:', CATECHISM_PATH);
    console.error('\nEsegui prima:');
    console.error('  git clone https://github.com/aseemsavio/catholicism-in-json.git data/catholicism-in-json');
    await client.end();
    return;
  }

  const json = readFileSync(CATECHISM_PATH, 'utf-8');
  const catechism = JSON.parse(json);

  console.log(`📄 Punti trovati nel JSON: ${catechism.length}\n`);

  let inserted = 0;
  let skipped = 0;
  const batchSize = 50;
  let batch = [];

  for (const punto of catechism) {
    // Verifica se esiste già
    const exists = await db.query.catechism.findFirst({
      where: (t, { eq }) => eq(t.numero, punto.id),
    });

    if (exists) {
      skipped++;
      continue;
    }

    const tags = extractTags(punto.text);
    const refs = extractReferences(punto.text);

    batch.push({
      numero: punto.id,
      parte: getParte(punto.id),
      testo: punto.text,
      riferimenti: refs,
      tags: tags,
    });

    // Insert in batch per performances
    if (batch.length >= batchSize) {
      await db.insert(schema.catechism).values(batch);
      inserted += batch.length;
      console.log(`  ✅ Inseriti punti fino al #${punto.id} (batch ${Math.ceil(inserted / batchSize)})`);
      batch = [];
    }
  }

  // Inserisci ultimo batch
  if (batch.length > 0) {
    await db.insert(schema.catechism).values(batch);
    inserted += batch.length;
  }

  console.log(`\n📊 Riepilogo:`);
  console.log(`   Inseriti:        ${inserted}`);
  console.log(`   Già presenti:    ${skipped}`);
  console.log(`   Totale nel DB:   ${inserted + skipped}`);

  // Statistiche tags
  const allPoints = await db.query.catechism.findMany();
  const tagCount = {};
  for (const p of allPoints) {
    for (const tag of (p.tags || [])) {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    }
  }

  console.log(`\n🏷️  Tags estratti:`);
  for (const [tag, count] of Object.entries(tagCount).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${tag}: ${count} punti`);
  }

  console.log('\n✨ Import catechismo completato!\n');
  await client.end();
}

importCatechism().catch(console.error);
