/**
 * Import dati da CSV
 * Esegui: npm run import:csv -- ./data/file.csv
 *
 * TODO: Personalizza per i tuoi specifici CSV e tabelle
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import * as schema from '../db/schema.ts';

const connStr = process.env.DATABASE_URL
  || 'postgresql://verbum_user:changeme123@localhost:5432/verbum_lucis';
const client = postgres(connStr);
const db = drizzle(client, { schema });

/**
 * Legge e parsa un CSV file
 */
function readCSV(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });
    return records;
  } catch (error) {
    console.error(`❌ Errore lettura CSV "${filePath}":`, error.message);
    throw error;
  }
}

/**
 * Import generico da CSV
 *
 * TODO: Customizza per i tuoi specifici CSV e tabelle
 *
 * Esempio per importare preghiere da CSV:
 * - File: data/prayers.csv
 * - Colonne: titolo,slug,testo,categoria
 * - Target DB: prayers table
 */
async function importFromCSV(filePath) {
  console.log(`📄 Import da CSV: ${filePath}\n`);

  try {
    const records = readCSV(filePath);

    if (records.length === 0) {
      console.log('⚠️  Nessun dato trovato nel CSV');
      return { inserted: 0, skipped: 0, errors: 0 };
    }

    // Mostra struttura
    console.log(`✅ Letti ${records.length} record da CSV`);
    console.log('📋 Colonne trovate:', Object.keys(records[0]));
    console.log('📋 Primo record:');
    console.log(JSON.stringify(records[0], null, 2));

    // TODO: Aggiungi qui la logica di import nel database
    // Esempio generico:
    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    for (const record of records) {
      try {
        // TODO: Customizza questa logica per i tuoi dati
        // Esempio per preghiere:
        // const exists = await db.query.prayers.findFirst({
        //   where: (t, { eq }) => eq(t.slug, record.slug),
        // });
        // if (!exists) {
        //   await db.insert(schema.prayers).values({
        //     titolo: record.titolo,
        //     slug: record.slug,
        //     testo: record.testo,
        //     categoria: record.categoria || 'preghiera',
        //   });
        //   inserted++;
        //   console.log(`  ✅ ${record.titolo}`);
        // } else {
        //   skipped++;
        // }

        console.log(`  ℹ️  Record processato: ${JSON.stringify(record).substring(0, 50)}...`);
        inserted++;

      } catch (error) {
        console.error(`  ❌ Errore processing record:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Statistiche import:');
    console.log(`  Inserite: ${inserted}`);
    console.log(`  Saltate: ${skipped}`);
    console.log(`  Errori: ${errors}`);

    return { inserted, skipped, errors };

  } catch (error) {
    console.error('❌ Errore import:', error.message);
    throw error;
  }
}

/**
 * Main
 */
async function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('❌ Specifica il path del file CSV');
    console.error('   npm run import:csv -- ./data/file.csv');
    process.exit(1);
  }

  console.log('🔌 Connessione al database...');
  console.log(`   Database: ${connStr.split('@')[1] || 'local'}`);
  console.log('');

  try {
    const result = await importFromCSV(filePath);
    console.log('\n✨ Import completato!\n');
    console.log('💡 Personalizza il file per i tuoi dati specifici');
  } catch (error) {
    console.error('❌ Errore fatale:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
