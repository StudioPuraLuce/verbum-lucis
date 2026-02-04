#!/usr/bin/env node

/**
 * Import Bible Verses from BibleGet.io API
 *
 * Usage:
 *   npm run import:bible-verses              # Import all 73 books (~45 min)
 *   npm run import:bible-verses -- --test    # Test with first 2 books (~2 min)
 *   npm run import:bible-verses -- --dry-run # Test without database insert
 *
 * Imports 31,000+ verses from Italian Bible via BibleGet.io API
 * Using LUZZI translation (Italian traditional)
 * Note: CEI 2008 not available via BibleGet.io API currently
 * Stores in bible_verses table with:
 * - Book ID, chapter, verse number
 * - Italian text, optional Latin text
 * - Reference (e.g., "Giovanni 3:16")
 * - URL slug (e.g., "giovanni/3/16")
 */

import { db } from '../db/db-config.ts';
import * as schema from '../db/schema.ts';
import { sql } from 'drizzle-orm';

// Configuration
const API_BASE = 'https://query.bibleget.io/';
const APP_ID = 'verbum-lucis';
const BIBLE_VERSION = 'LUZZI'; // Italian traditional translation
const BATCH_SIZE = 500;
const DELAY_MS = 1500; // Rate limiting: 1.5 sec between API calls
const TEST_MODE = process.argv.includes('--test');
const DRY_RUN = process.argv.includes('--dry-run');

// Book metadata mapping (abbreviation -> book info)
const BOOKS_TO_IMPORT = {
  // Old Testament
  'Gen': { id: 1, name: 'Genesi', chapters: 50, testament: 'AT' },
  'Es': { id: 2, name: 'Esodo', chapters: 40, testament: 'AT' },
  'Lv': { id: 3, name: 'Levitico', chapters: 27, testament: 'AT' },
  'Nm': { id: 4, name: 'Numeri', chapters: 36, testament: 'AT' },
  'Dt': { id: 5, name: 'Deuteronomio', chapters: 34, testament: 'AT' },
  'Gs': { id: 6, name: 'Giosuè', chapters: 24, testament: 'AT' },
  'Gdc': { id: 7, name: 'Giudici', chapters: 21, testament: 'AT' },
  'Rt': { id: 8, name: 'Rut', chapters: 4, testament: 'AT' },
  '1Sam': { id: 9, name: '1 Samuele', chapters: 31, testament: 'AT' },
  '2Sam': { id: 10, name: '2 Samuele', chapters: 24, testament: 'AT' },
  '1Re': { id: 11, name: '1 Re', chapters: 22, testament: 'AT' },
  '2Re': { id: 12, name: '2 Re', chapters: 25, testament: 'AT' },
  '1Cr': { id: 13, name: '1 Cronache', chapters: 29, testament: 'AT' },
  '2Cr': { id: 14, name: '2 Cronache', chapters: 36, testament: 'AT' },
  'Esd': { id: 15, name: 'Esdra', chapters: 10, testament: 'AT' },
  'Ne': { id: 16, name: 'Neemia', chapters: 13, testament: 'AT' },
  'Tb': { id: 17, name: 'Tobia', chapters: 14, testament: 'AT' },
  'Gdt': { id: 18, name: 'Giuditta', chapters: 16, testament: 'AT' },
  'Est': { id: 19, name: 'Ester', chapters: 10, testament: 'AT' },
  '1Mac': { id: 20, name: '1 Maccabei', chapters: 16, testament: 'AT' },
  '2Mac': { id: 21, name: '2 Maccabei', chapters: 15, testament: 'AT' },
  'Gb': { id: 22, name: 'Giobbe', chapters: 42, testament: 'AT' },
  'Sal': { id: 23, name: 'Salmi', chapters: 150, testament: 'AT' },
  'Prv': { id: 24, name: 'Proverbi', chapters: 31, testament: 'AT' },
  'Qo': { id: 25, name: 'Qoelet', chapters: 12, testament: 'AT' },
  'Ct': { id: 26, name: 'Cantico dei Cantici', chapters: 8, testament: 'AT' },
  'Sap': { id: 27, name: 'Sapienza', chapters: 19, testament: 'AT' },
  'Sir': { id: 28, name: 'Siracide', chapters: 51, testament: 'AT' },
  'Is': { id: 29, name: 'Isaia', chapters: 66, testament: 'AT' },
  'Ger': { id: 30, name: 'Geremia', chapters: 52, testament: 'AT' },
  'Lam': { id: 31, name: 'Lamentazioni', chapters: 5, testament: 'AT' },
  'Bar': { id: 32, name: 'Baruc', chapters: 6, testament: 'AT' },
  'Ez': { id: 33, name: 'Ezechiele', chapters: 48, testament: 'AT' },
  'Dn': { id: 34, name: 'Daniele', chapters: 14, testament: 'AT' },
  'Os': { id: 35, name: 'Osea', chapters: 14, testament: 'AT' },
  'Gl': { id: 36, name: 'Gioele', chapters: 4, testament: 'AT' },
  'Am': { id: 37, name: 'Amos', chapters: 9, testament: 'AT' },
  'Abd': { id: 38, name: 'Abdia', chapters: 1, testament: 'AT' },
  'Gna': { id: 39, name: 'Giona', chapters: 4, testament: 'AT' },
  'Mic': { id: 40, name: 'Michea', chapters: 7, testament: 'AT' },
  'Nah': { id: 41, name: 'Naum', chapters: 3, testament: 'AT' },
  'Ab': { id: 42, name: 'Abacuc', chapters: 3, testament: 'AT' },
  'Sof': { id: 43, name: 'Sofonia', chapters: 3, testament: 'AT' },
  'Ag': { id: 44, name: 'Aggeo', chapters: 2, testament: 'AT' },
  'Zc': { id: 45, name: 'Zaccaria', chapters: 14, testament: 'AT' },
  'Ml': { id: 46, name: 'Malachia', chapters: 4, testament: 'AT' },

  // New Testament
  'Mt': { id: 47, name: 'Matteo', chapters: 28, testament: 'NT' },
  'Mc': { id: 48, name: 'Marco', chapters: 16, testament: 'NT' },
  'Lc': { id: 49, name: 'Luca', chapters: 24, testament: 'NT' },
  'Gv': { id: 50, name: 'Giovanni', chapters: 21, testament: 'NT' },
  'At': { id: 51, name: 'Atti', chapters: 28, testament: 'NT' },
  'Rm': { id: 52, name: 'Romani', chapters: 16, testament: 'NT' },
  '1Cor': { id: 53, name: '1 Corinzi', chapters: 16, testament: 'NT' },
  '2Cor': { id: 54, name: '2 Corinzi', chapters: 13, testament: 'NT' },
  'Gal': { id: 55, name: 'Galati', chapters: 6, testament: 'NT' },
  'Ef': { id: 56, name: 'Efesini', chapters: 6, testament: 'NT' },
  'Fil': { id: 57, name: 'Filippesi', chapters: 4, testament: 'NT' },
  'Col': { id: 58, name: 'Colossesi', chapters: 4, testament: 'NT' },
  '1Ts': { id: 59, name: '1 Tessalonicesi', chapters: 5, testament: 'NT' },
  '2Ts': { id: 60, name: '2 Tessalonicesi', chapters: 3, testament: 'NT' },
  '1Tm': { id: 61, name: '1 Timoteo', chapters: 6, testament: 'NT' },
  '2Tm': { id: 62, name: '2 Timoteo', chapters: 4, testament: 'NT' },
  'Tt': { id: 63, name: 'Tito', chapters: 3, testament: 'NT' },
  'Fm': { id: 64, name: 'Filemone', chapters: 1, testament: 'NT' },
  'Eb': { id: 65, name: 'Ebrei', chapters: 13, testament: 'NT' },
  'Gc': { id: 66, name: 'Giacomo', chapters: 5, testament: 'NT' },
  '1Pt': { id: 67, name: '1 Pietro', chapters: 5, testament: 'NT' },
  '2Pt': { id: 68, name: '2 Pietro', chapters: 3, testament: 'NT' },
  '1Gv': { id: 69, name: '1 Giovanni', chapters: 5, testament: 'NT' },
  '2Gv': { id: 70, name: '2 Giovanni', chapters: 1, testament: 'NT' },
  '3Gv': { id: 71, name: '3 Giovanni', chapters: 1, testament: 'NT' },
  'Gd': { id: 72, name: 'Giuda', chapters: 1, testament: 'NT' },
  'Ap': { id: 73, name: 'Apocalisse', chapters: 22, testament: 'NT' },
};

/**
 * Delay helper for rate limiting
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format book name for slug
 */
function formatSlug(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Fetch verses from BibleGet.io API
 */
async function fetchChapter(abbrev, chapter) {
  try {
    const url = `${API_BASE}?query=${abbrev}${chapter}&return=json&appid=${APP_ID}&version=${BIBLE_VERSION}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`❌ API error for ${abbrev} ${chapter}: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      // BibleGet.io uses "results" not "passages"
      return null;
    }

    return data.results;
  } catch (error) {
    console.error(`❌ Fetch error for ${abbrev} ${chapter}:`, error.message);
    return null;
  }
}

/**
 * Parse verse reference (e.g., "Giovanni 1:1" -> {chapter: 1, verse: 1})
 */
function parseReference(reference) {
  const match = reference.match(/(\d+):(\d+)$/);
  if (!match) {
    console.warn(`⚠️  Could not parse reference: ${reference}`);
    return null;
  }
  return { chapter: parseInt(match[1]), verse: parseInt(match[2]) };
}

/**
 * Main import function
 */
async function importBibleVerses() {
  console.log('\n📖 Bible Verse Importer (LUZZI Italian)\n');

  const startTime = Date.now();
  let totalVerses = 0;
  let booksProcessed = 0;
  const errors = [];

  // Determine which books to import
  const booksToProcess = TEST_MODE
    ? Object.entries(BOOKS_TO_IMPORT).slice(0, 2) // First 2 books for testing
    : Object.entries(BOOKS_TO_IMPORT); // All 73 books

  console.log(`🚀 Starting import: ${booksToProcess.length} books`);
  if (DRY_RUN) console.log('   (DRY RUN - no database changes)\n');

  // Process each book
  for (const [abbrev, bookInfo] of booksToProcess) {
    const bookSlug = formatSlug(bookInfo.name);
    const versesForBook = [];

    console.log(`📕 ${bookInfo.name} (${bookInfo.chapters} cap.)...`);

    // Process each chapter in the book
    for (let chapter = 1; chapter <= bookInfo.chapters; chapter++) {
      // Fetch chapter from API
      const passages = await fetchChapter(abbrev, chapter);

      if (!passages) {
        errors.push(`${abbrev} ${chapter}: Failed to fetch`);
        continue;
      }

      // Parse verses (BibleGet.io returns chapter/verse as separate fields)
      for (const verse of passages) {
        if (!verse.verse || !verse.text) continue;

        const verseNum = parseInt(verse.verse);
        const verseSlug = `${bookSlug}/${chapter}/${verseNum}`;
        const reference = `${bookInfo.name} ${chapter}:${verseNum}`;

        versesForBook.push({
          bookId: bookInfo.id,
          capitolo: chapter,
          versetto: verseNum,
          testo: verse.text || '',
          testoLatin: null, // BibleGet.io doesn't provide Latin
          riferimento: reference,
          slug: verseSlug,
          tags: [],
          catechismRefs: [],
          liturgyDates: [],
          views: 0,
          createdAt: new Date(),
        });
      }

      // Rate limiting
      await sleep(DELAY_MS);

      // Progress indicator
      if (chapter % 5 === 0 || chapter === bookInfo.chapters) {
        process.stdout.write(`  ${chapter}/${bookInfo.chapters} ✓\r`);
      }
    }

    console.log(`  ${bookInfo.chapters}/${bookInfo.chapters} ✓ (${versesForBook.length} verses)`);

    // Batch insert verses for this book
    if (versesForBook.length > 0 && !DRY_RUN) {
      try {
        // Insert in batches
        for (let i = 0; i < versesForBook.length; i += BATCH_SIZE) {
          const batch = versesForBook.slice(i, i + BATCH_SIZE);
          await db.insert(schema.bibleVerses).values(batch);
          totalVerses += batch.length;
        }
        console.log(`   ✅ Inserted ${versesForBook.length} verses\n`);
      } catch (error) {
        const errorMsg = error?.message || JSON.stringify(error);
        errors.push(`${bookInfo.name}: Database insert failed - ${errorMsg}`);
        console.error(`   ❌ Insert failed: ${errorMsg}\n`);
        console.error('   Full error:', error);
      }
    } else if (DRY_RUN) {
      totalVerses += versesForBook.length;
      console.log(`   (DRY RUN: Would insert ${versesForBook.length} verses)\n`);
    }

    booksProcessed++;
  }

  // Summary
  const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
  const elapsedMinutes = Math.round(elapsedSeconds / 60);

  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Books processed: ${booksProcessed}/${booksToProcess.length}`);
  console.log(`✅ Total verses: ${totalVerses.toLocaleString()}`);
  console.log(`⏱️  Time elapsed: ${elapsedMinutes}m ${elapsedSeconds % 60}s`);

  if (errors.length > 0) {
    console.log(`⚠️  Errors encountered: ${errors.length}`);
    errors.slice(0, 5).forEach((err) => console.log(`   - ${err}`));
    if (errors.length > 5) {
      console.log(`   ... and ${errors.length - 5} more`);
    }
  }

  // Verify database count
  if (!DRY_RUN) {
    try {
      const result = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(schema.bibleVerses);
      const dbCount = result[0]?.count || 0;
      console.log(`\n📈 Database verification: ${dbCount.toLocaleString()} verses in database`);
    } catch (error) {
      console.error('⚠️  Could not verify database count:', error.message);
    }
  }

  console.log('='.repeat(60) + '\n');

  // Exit codes
  if (errors.length > 0 && errors.length > BOOKS_TO_IMPORT.length * 0.1) {
    // More than 10% errors
    console.error('❌ Too many errors - import may be incomplete');
    process.exit(1);
  }

  console.log('✨ Import complete!\n');
  process.exit(0);
}

// Run import
importBibleVerses().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
