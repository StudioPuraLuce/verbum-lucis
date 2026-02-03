/**
 * Import dati da Airtable
 * Esegui: npm run import:airtable
 *
 * Variabili richieste:
 * - AIRTABLE_API_KEY
 * - AIRTABLE_BASE_ID
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import Airtable from 'airtable';
import * as schema from '../db/schema.ts';

const connStr = process.env.DATABASE_URL
  || 'postgresql://verbum_user:changeme123@localhost:5432/verbum_lucis';
const client = postgres(connStr);
const db = drizzle(client, { schema });

// Configurazione Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('❌ Mancano le credenziali Airtable!');
  console.error('   Configura AIRTABLE_API_KEY e AIRTABLE_BASE_ID in .env');
  process.exit(1);
}

const airtable = new Airtable({ apiKey: AIRTABLE_API_KEY });
const base = airtable.base(AIRTABLE_BASE_ID);

/**
 * Import preghiere da Airtable
 */
async function importPrayers() {
  console.log('\n📿 Import preghiere da Airtable...');

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  try {
    const records = await base('Preghiere').select({
      view: 'Grid view' // Cambia con il nome della tua view
    }).all();

    for (const record of records) {
      const fields = record.fields;

      // Validazione dati obbligatori
      if (!fields.Titolo || !fields.Testo) {
        console.log(`  ⚠️  Saltato: record senza titolo o testo`);
        skipped++;
        continue;
      }

      const slug = fields.Slug || fields.Titolo
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Verifica se esiste già
      const existing = await db.query.prayers.findFirst({
        where: (t, { eq }) => eq(t.slug, slug),
      });

      const data = {
        titolo: fields.Titolo,
        slug: slug,
        testo: fields.Testo,
        categoria: fields.Categoria || 'preghiera',
        testoLatin: fields.TestoLatino || null,
        fonteUfficiale: fields.FonteUfficiale || false,
        popolarita: fields.Popolarita || 50,
        durata: fields.Durata || null,
        metadata: fields.Metadata ? JSON.parse(fields.Metadata) : null,
      };

      if (existing) {
        // Aggiorna se diverso
        await db.update(schema.prayers)
          .set(data)
          .where((t, { eq }) => eq(t.id, existing.id));
        updated++;
        console.log(`  🔄 ${fields.Titolo} (aggiornato)`);
      } else {
        // Inserisci nuovo
        await db.insert(schema.prayers).values(data);
        inserted++;
        console.log(`  ✅ ${fields.Titolo} (nuovo)`);
      }
    }

    console.log(`\n📊 Inserite: ${inserted} | Aggiornate: ${updated} | Saltate: ${skipped}`);
  } catch (error) {
    console.error('❌ Errore import preghiere:', error.message);
    throw error;
  }
}

/**
 * Import contenuti editoriali da Airtable
 */
async function importEditorial() {
  console.log('\n📝 Import contenuti editoriali da Airtable...');

  // TODO: Implementa secondo la struttura della tua tabella Airtable
  // e il target nel database (es. nuova tabella "articoli" o "contenuti")

  console.log('  ℹ️  Implementazione pendente - personalizza secondo le tue esigenze');
}

/**
 * Main
 */
async function main() {
  console.log('🔌 Connessione ad Airtable...');
  console.log(`   Base ID: ${AIRTABLE_BASE_ID.substring(0, 8)}...`);

  await importPrayers();
  await importEditorial();

  console.log('\n✨ Import Airtable completato!\n');
  await client.end();
}

main().catch((error) => {
  console.error('❌ Errore fatale:', error);
  process.exit(1);
});
