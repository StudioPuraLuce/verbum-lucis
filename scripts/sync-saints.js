/**
 * Script per sincronizzare database santi da fonti esterne
 * Può essere eseguito manualmente o schedulato mensilmente
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from '../db/schema.ts';

const connectionString = process.env.DATABASE_URL || 'postgresql://verbum_user:changeme123@localhost:5432/verbum_lucis';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

/**
 * Database santi manuale (espandibile)
 * In produzione: fetch da API o file JSON
 */
const santiDatabase = [
  {
    nome: 'San Giovanni Bosco',
    nomeCompleto: 'Giovanni Melchiorre Bosco',
    slug: 'san-giovanni-bosco',
    dataFesta: '01-31',
    biografia: 'San Giovanni Bosco nacque a Castelnuovo d\'Asti nel 1815. Fondò la Congregazione Salesiana dedicata all\'educazione dei giovani, specialmente i più poveri. Sviluppò il "Sistema Preventivo" basato su ragione, religione e amorevolezza. Morì a Torino nel 1888.',
    biografiaBreve: 'Fondatore dei Salesiani, educatore dei giovani',
    patronoDi: ['Giovani', 'Studenti', 'Editori', 'Apprendisti'],
    titolo: 'Santo',
    epoca: 'XIX secolo',
    ricorrenza: 'Obbligatoria',
    popolarita: 94,
  },
  {
    nome: 'Santa Lucia',
    nomeCompleto: 'Lucia di Siracusa',
    slug: 'santa-lucia',
    dataFesta: '12-13',
    biografia: 'Santa Lucia visse a Siracusa nel III secolo. Martire cristiana durante le persecuzioni di Diocleziano, è venerata come protettrice della vista. Secondo la tradizione, si strappò gli occhi per non cedere a un pretendente pagano.',
    biografiaBreve: 'Martire siracusana, protettrice della vista',
    patronoDi: ['Vista', 'Ciechi', 'Siracusa', 'Elettricisti'],
    titolo: 'Santa e Martire',
    epoca: 'III secolo',
    ricorrenza: 'Obbligatoria',
    popolarita: 93,
  },
  {
    nome: 'San Valentino',
    nomeCompleto: 'Valentino di Terni',
    slug: 'san-valentino',
    dataFesta: '02-14',
    biografia: 'San Valentino fu vescovo di Terni nel III secolo. Martirizzato durante le persecuzioni romane, è diventato il patrono degli innamorati per aver celebrato matrimoni cristiani clandestini.',
    biografiaBreve: 'Vescovo e martire, patrono degli innamorati',
    patronoDi: ['Innamorati', 'Fidanzati', 'Sposi'],
    titolo: 'Santo e Martire',
    epoca: 'III secolo',
    ricorrenza: 'Facoltativa',
    popolarita: 91,
  },
  {
    nome: 'Sant\'Agostino',
    nomeCompleto: 'Agostino di Ippona',
    slug: 'santagostino',
    dataFesta: '08-28',
    biografia: 'Sant\'Agostino nacque a Tagaste nel 354. Dopo una giovinezza dissoluta, si convertì al cristianesimo per l\'intercessione di sua madre, Santa Monica. Divenne vescovo di Ippona e uno dei più grandi Padri e Dottori della Chiesa. Scrisse "Le Confessioni" e "La Città di Dio".',
    biografiaBreve: 'Vescovo, Dottore della Chiesa, teologo',
    patronoDi: ['Teologi', 'Agostiniani', 'Birrai'],
    titolo: 'Santo e Dottore della Chiesa',
    epoca: 'IV-V secolo',
    ricorrenza: 'Obbligatoria',
    popolarita: 96,
  },
  {
    nome: 'Santa Chiara d\'Assisi',
    nomeCompleto: 'Chiara Offreduccio',
    slug: 'santa-chiara-assisi',
    dataFesta: '08-11',
    biografia: 'Santa Chiara nacque ad Assisi nel 1194. Seguì l\'esempio di San Francesco, fondando l\'Ordine delle Clarisse. Visse in povertà assoluta dedicando la vita alla preghiera e alla contemplazione.',
    biografiaBreve: 'Fondatrice delle Clarisse, discepola di Francesco',
    patronoDi: ['Televisione', 'Ricamatrici', 'Lavandaie'],
    titolo: 'Santa',
    epoca: 'XIII secolo',
    ricorrenza: 'Obbligatoria',
    popolarita: 89,
  },
];

/**
 * Sincronizza santi nel database
 */
async function syncSaints() {
  console.log('🔄 Inizio sincronizzazione santi...\n');

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const santo of santiDatabase) {
    try {
      // Verifica se esiste
      const existing = await db.query.saints.findFirst({
        where: (saints, { eq }) => eq(saints.slug, santo.slug),
      });

      if (existing) {
        // Update solo se i dati sono cambiati
        const hasChanges = 
          existing.biografia !== santo.biografia ||
          existing.popolarita !== santo.popolarita;

        if (hasChanges) {
          await db.update(schema.saints)
            .set(santo)
            .where(eq(schema.saints.slug, santo.slug));
          console.log(`✅ Aggiornato: ${santo.nome}`);
          updated++;
        } else {
          console.log(`⏭️  Saltato (già aggiornato): ${santo.nome}`);
          skipped++;
        }
      } else {
        // Insert nuovo santo
        await db.insert(schema.saints).values(santo);
        console.log(`✅ Inserito: ${santo.nome}`);
        inserted++;
      }

    } catch (error) {
      console.error(`❌ Errore con ${santo.nome}:`, error.message);
    }
  }

  console.log('\n📊 Riepilogo:');
  console.log(`   Inseriti: ${inserted}`);
  console.log(`   Aggiornati: ${updated}`);
  console.log(`   Saltati: ${skipped}`);
  console.log('\n✨ Sincronizzazione completata!');
}

/**
 * Utility: Importa santi da file JSON
 */
async function importFromJSON(filePath) {
  try {
    const fs = await import('fs/promises');
    const data = await fs.readFile(filePath, 'utf-8');
    const saints = JSON.parse(data);
    
    console.log(`📄 Importo ${saints.length} santi da ${filePath}...\n`);
    
    for (const saint of saints) {
      await db.insert(schema.saints).values(saint).onConflictDoNothing();
    }
    
    console.log('✅ Importazione completata!');
  } catch (error) {
    console.error('❌ Errore importazione JSON:', error);
  }
}

// Esegui
const mode = process.argv[2]; // 'sync' o 'import'

if (mode === 'import' && process.argv[3]) {
  importFromJSON(process.argv[3])
    .catch(console.error)
    .finally(() => client.end());
} else {
  syncSaints()
    .catch(console.error)
    .finally(() => client.end());
}

// Usage:
// npm run sync-saints            -> Sincronizza santi hardcoded
// npm run sync-saints import saints.json  -> Importa da file JSON
