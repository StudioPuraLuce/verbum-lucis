#!/usr/bin/env node

/**
 * Demo Bible Verse Import - Sample Data Only
 *
 * This script inserts sample Bible verses to verify the system works.
 * Use this to test the page structure before running the full import.
 *
 * Usage:
 *   npm run import:bible-demo            # Insert ~50 sample verses
 *   npm run import:bible-demo -- --clean # Clear and delete demo data
 */

import { db } from '../db/db-config.ts';
import * as schema from '../db/schema.ts';
import { eq, sql } from 'drizzle-orm';

const CLEAN_MODE = process.argv.includes('--clean');

// Sample verses from famous Bible passages
const SAMPLE_VERSES = [
  // Giovanni (John) Chapter 3
  {
    bookId: 50, capitolo: 3, versetto: 1,
    testo: 'Ora c\'era fra i farisei un uomo di nome Nicodemo, un capo dei giudei.',
    reference: 'Giovanni 3:1',
    slug: 'giovanni/3/1'
  },
  {
    bookId: 50, capitolo: 3, versetto: 16,
    testo: 'Infatti, Dio ha tanto amato il mondo che ha dato il suo Figlio unigenito, affinché chiunque crede in lui non perisca, ma abbia vita eterna.',
    reference: 'Giovanni 3:16',
    slug: 'giovanni/3/16'
  },
  {
    bookId: 50, capitolo: 1, versetto: 1,
    testo: 'Nel principio era la Parola, e la Parola era con Dio, e la Parola era Dio.',
    reference: 'Giovanni 1:1',
    slug: 'giovanni/1/1'
  },
  // Matteo (Matthew) Chapter 6
  {
    bookId: 47, capitolo: 6, versetto: 9,
    testo: 'Voi dunque pregate così: Padre nostro che sei nei cieli, sia santificato il tuo nome.',
    reference: 'Matteo 6:9',
    slug: 'matteo/6/9'
  },
  {
    bookId: 47, capitolo: 6, versetto: 11,
    testo: 'Dacci oggi il nostro pane quotidiano;',
    reference: 'Matteo 6:11',
    slug: 'matteo/6/11'
  },
  {
    bookId: 47, capitolo: 1, versetto: 1,
    testo: 'Genealogia di Gesù Cristo, figlio di Davide, figlio di Abraamo.',
    reference: 'Matteo 1:1',
    slug: 'matteo/1/1'
  },
  // Genesi (Genesis) Chapter 1
  {
    bookId: 1, capitolo: 1, versetto: 1,
    testo: 'Nel principio Dio creò i cieli e la terra.',
    reference: 'Genesi 1:1',
    slug: 'genesi/1/1'
  },
  {
    bookId: 1, capitolo: 1, versetto: 27,
    testo: 'E Dio creò l\'uomo a sua immagine; lo creò a immagine di Dio; li creò maschio e femmina.',
    reference: 'Genesi 1:27',
    slug: 'genesi/1/27'
  },
  // Luca (Luke) Chapter 1
  {
    bookId: 49, capitolo: 1, versetto: 28,
    testo: 'E l\'angelo, entrato da lei, disse: Ti saluto, o favorita della grazia! Il Signore è con te.',
    reference: 'Luca 1:28',
    slug: 'luca/1/28'
  },
  {
    bookId: 49, capitolo: 1, versetto: 1,
    testo: 'Poiché molti hanno intrapreso a esporre in ordine i fatti che si son compiuti fra noi,',
    reference: 'Luca 1:1',
    slug: 'luca/1/1'
  },
  // Marco (Mark) Chapter 1
  {
    bookId: 48, capitolo: 1, versetto: 1,
    testo: 'Principio del vangelo di Gesù Cristo, Figlio di Dio.',
    reference: 'Marco 1:1',
    slug: 'marco/1/1'
  },
];

async function importDemo() {
  console.log('\n📖 Bible Demo Importer\n');

  if (CLEAN_MODE) {
    console.log('🗑️  Cleaning up demo verses...\n');
    try {
      // Delete all demo verses (those in our sample list)
      const slugs = SAMPLE_VERSES.map(v => v.slug);
      for (const slug of slugs) {
        await db.delete(schema.bibleVerses).where(eq(schema.bibleVerses.slug, slug));
      }
      console.log(`✅ Deleted ${slugs.length} demo verses\n`);
    } catch (error) {
      console.error('❌ Error deleting verses:', error.message);
      process.exit(1);
    }
  } else {
    console.log('📝 Inserting sample Bible verses...\n');
    try {
      // Try to insert all verses - on duplicate key, update (no-op)
      let inserted = 0;
      let skipped = 0;

      for (const v of SAMPLE_VERSES) {
        const verseData = {
          bookId: v.bookId,
          capitolo: v.capitolo,
          versetto: v.versetto,
          testo: v.testo,
          testoLatin: null,
          riferimento: v.reference,
          slug: v.slug,
          tags: [],
          catechismRefs: [],
          liturgyDates: [],
          views: 0,
          createdAt: new Date(),
        };

        try {
          await db.insert(schema.bibleVerses).values(verseData);
          inserted++;
        } catch (err) {
          // Skip if duplicate key error
          if (err.code === '23505') {
            skipped++;
          } else {
            throw err;
          }
        }
      }

      if (inserted > 0) {
        console.log(`✅ Inserted ${inserted} new demo verses\n`);
        console.log('📍 Verses added:');
        SAMPLE_VERSES.slice(0, inserted).forEach(v => {
          console.log(`   • ${v.reference}`);
        });
      }

      if (skipped > 0) {
        console.log(`\n⏭️  Skipped ${skipped} verses that already exist\n`);
      }

      if (inserted === 0 && skipped > 0) {
        console.log('✅ All demo verses already exist in database\n');
      }

      console.log('✨ Demo complete!\n');
      console.log('You can now test:');
      console.log('  • http://localhost:4321/bibbia/giovanni/3/16 - Giovanni 3:16');
      console.log('  • http://localhost:4321/bibbia/matteo/6/9 - Matteo 6:9 (Padre Nostro)');
      console.log('  • http://localhost:4321/bibbia/genesi/1/1 - Genesi 1:1\n');
      console.log('Once BibleGet.io API rate limit resets, run:');
      console.log('  npm run import:bible-verses\n');
    } catch (error) {
      console.error('❌ Error inserting verses:', error.message);
      console.error('Full error:', error);
      process.exit(1);
    }
  }

  process.exit(0);
}

importDemo();
