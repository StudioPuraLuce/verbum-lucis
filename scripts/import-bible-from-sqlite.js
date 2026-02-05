#!/usr/bin/env node

/**
 * Import Bible Verses from Local CEI.SQLite3 Database
 *
 * Usage:
 *   npm run import:bible-sqlite              # Import all verses (35,422)
 *   npm run import:bible-sqlite -- --test    # Test with 2 books only
 *   npm run import:bible-sqlite -- --dry-run # Preview without database changes
 *
 * Imports complete Italian Catholic Bible (CEI 2008) from local SQLite database
 * Source: /Scrivania/CEI.SQLite3 (5.5 MB, offline)
 * No API calls, no rate limiting, instant import
 *
 * Data Structure:
 * - books table: book_number, short_name, long_name, book_color
 * - verses table: book_number, chapter, verse, text
 * Total: 73 books, 35,422 verses
 */

import * as dotenv from 'dotenv';
dotenv.config();

import sqlite3 from 'sqlite3';
import path from 'path';
import { db } from '../db/db-config.ts';
import * as schema from '../db/schema.ts';

const TEST_MODE = process.argv.includes('--test');
const DRY_RUN = process.argv.includes('--dry-run');
// Try both local and container paths
const SQLITE_PATH = process.env.SQLITE_PATH ||
  (require('fs').existsSync('/app/CEI.SQLite3') ? '/app/CEI.SQLite3' : '/home/chris/Scrivania/CEI.SQLite3');
const BATCH_SIZE = 1000;

// Book name mapping from SQLite to our schema
const BOOK_NAME_MAP = {
  'Gen': 'Genesi',
  'Eso': 'Esodo',
  'Lv': 'Levitico',
  'Nm': 'Numeri',
  'Dt': 'Deuteronomio',
  'Gs': 'Giosuè',
  'Gdc': 'Giudici',
  'Rt': 'Rut',
  '1Sam': '1 Samuele',
  '2Sam': '2 Samuele',
  '1Re': '1 Re',
  '2Re': '2 Re',
  '1Cr': '1 Cronache',
  '2Cr': '2 Cronache',
  'Esd': 'Esdra',
  'Ne': 'Neemia',
  'Tb': 'Tobia',
  'Gdt': 'Giuditta',
  'Est': 'Ester',
  '1Mac': '1 Maccabei',
  '2Mac': '2 Maccabei',
  'Gb': 'Giobbe',
  'Sal': 'Salmi',
  'Prv': 'Proverbi',
  'Qo': 'Qoelet',
  'Ct': 'Cantico dei Cantici',
  'Sap': 'Sapienza',
  'Sir': 'Siracide',
  'Is': 'Isaia',
  'Ger': 'Geremia',
  'Lam': 'Lamentazioni',
  'Bar': 'Baruc',
  'Ez': 'Ezechiele',
  'Dn': 'Daniele',
  'Os': 'Osea',
  'Gl': 'Gioele',
  'Am': 'Amos',
  'Abd': 'Abdia',
  'Gna': 'Giona',
  'Mic': 'Michea',
  'Nah': 'Naum',
  'Ab': 'Abacuc',
  'Sof': 'Sofonia',
  'Ag': 'Aggeo',
  'Zc': 'Zaccaria',
  'Ml': 'Malachia',
  'Mt': 'Matteo',
  'Mc': 'Marco',
  'Lc': 'Luca',
  'Gv': 'Giovanni',
  'At': 'Atti',
  'Rm': 'Romani',
  '1Cor': '1 Corinzi',
  '2Cor': '2 Corinzi',
  'Gal': 'Galati',
  'Ef': 'Efesini',
  'Fil': 'Filippesi',
  'Col': 'Colossesi',
  '1Ts': '1 Tessalonicesi',
  '2Ts': '2 Tessalonicesi',
  '1Tm': '1 Timoteo',
  '2Tm': '2 Timoteo',
  'Tt': 'Tito',
  'Fm': 'Filemone',
  'Eb': 'Ebrei',
  'Gc': 'Giacomo',
  '1Pt': '1 Pietro',
  '2Pt': '2 Pietro',
  '1Gv': '1 Giovanni',
  '2Gv': '2 Giovanni',
  '3Gv': '3 Giovanni',
  'Gd': 'Giuda',
  'Ap': 'Apocalisse'
};

function formatSlug(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Read from CEI.SQLite3 and import into PostgreSQL
 */
async function importFromSQLite() {
  console.log('\n📖 Bible Verse Importer from Local SQLite\n');
  console.log(`📚 Source: ${SQLITE_PATH}`);
  console.log('   Format: CEI 2008 (Italian Catholic Bible)\n');

  // Open SQLite database
  const sqlite = new sqlite3.Database(SQLITE_PATH, sqlite3.OPEN_READONLY);

  try {
    // First, read all books from SQLite
    console.log('📕 Loading books from SQLite...');
    const books = await new Promise((resolve, reject) => {
      sqlite.all('SELECT * FROM books ORDER BY book_number', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log(`✅ Loaded ${books.length} books\n`);

    // Create book map from SQLite book_number to sequential IDs 1-73
    // SQLite uses book_number 10, 20, 30, ..., 730 (increments of 10)
    // We map these to our sequential IDs 1, 2, 3, ..., 73
    const bookMap = new Map();
    books.forEach((book, index) => {
      bookMap.set(book.book_number, {
        id: index + 1,  // Sequential ID 1-73
        short_name: book.short_name,
        long_name: book.long_name
      });
    });

    // Import books first if not in dry-run (already done by fix-missing-books.js)
    if (!DRY_RUN) {
      console.log('📚 Books already in database\n');
    }

    // Now read verses
    let query = 'SELECT * FROM verses ORDER BY book_number, chapter, verse';

    if (TEST_MODE) {
      // Test mode: get first 2 books only
      const testBookNumbers = Array.from(bookMap.keys()).slice(0, 2);
      const placeholders = testBookNumbers.map(() => '?').join(',');
      query = `SELECT * FROM verses WHERE book_number IN (${placeholders}) ORDER BY book_number, chapter, verse`;
      console.log(`🧪 TEST MODE: Limiting to ${testBookNumbers.length} books\n`);
    }

    console.log('📖 Loading verses from SQLite...');
    const verses = await new Promise((resolve, reject) => {
      if (TEST_MODE) {
        const testBookNumbers = Array.from(bookMap.keys()).slice(0, 2);
        sqlite.all(query, testBookNumbers, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      } else {
        sqlite.all(query, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      }
    });

    console.log(`✅ Loaded ${verses.length} verses\n`);

    if (DRY_RUN) {
      console.log('🔍 DRY RUN MODE: Preview only\n');
      console.log('Sample verses:');
      verses.slice(0, 5).forEach((v) => {
        const bookInfo = bookMap.get(v.book_number);
        const bookName = bookInfo.long_name;
        console.log(`  ${bookName} ${v.chapter}:${v.verse} - ${v.text.substring(0, 60)}...`);
      });
      console.log(`\n📊 Total verses to import: ${verses.length}`);
      return;
    }

    // Import into PostgreSQL
    console.log('⚙️  Preparing database import...\n');

    let inserted = 0;
    let skipped = 0;
    const startTime = Date.now();

    // Process in batches
    for (let i = 0; i < verses.length; i += BATCH_SIZE) {
      const batch = verses.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(verses.length / BATCH_SIZE);

      process.stdout.write(
        `📦 Batch ${batchNum}/${totalBatches} (${i}-${Math.min(i + BATCH_SIZE, verses.length)})...`
      );

      for (const verse of batch) {
        const bookInfo = bookMap.get(verse.book_number);
        if (!bookInfo) {
          console.error(`\n❌ Book number ${verse.book_number} not found in map`);
          continue;
        }

        const bookName = bookInfo.long_name;
        const slug = `${formatSlug(bookName)}/${verse.chapter}/${verse.verse}`;
        const reference = `${bookName} ${verse.chapter}:${verse.verse}`;

        const verseData = {
          bookId: bookInfo.id,
          capitolo: verse.chapter,
          versetto: verse.verse,
          testo: verse.text,
          testoLatin: null,
          riferimento: reference,
          slug: slug,
          tags: [],
          catechismRefs: [],
          liturgyDates: [],
          views: 0,
          createdAt: new Date()
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

      process.stdout.write(' ✓\n');
    }

    const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
    const elapsedMinutes = Math.round(elapsedSeconds / 60);

    console.log('\n' + '='.repeat(60));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Inserted: ${inserted.toLocaleString()} verses`);
    if (skipped > 0) {
      console.log(`⏭️  Skipped: ${skipped.toLocaleString()} existing verses`);
    }
    console.log(`⏱️  Time elapsed: ${elapsedMinutes}m ${elapsedSeconds % 60}s`);
    console.log('='.repeat(60) + '\n');

    console.log('🎉 Import complete!');
    console.log('   All verses from CEI 2008 Bible are now in database\n');
    console.log('You can now test:');
    console.log('  • http://localhost:4321/bibbia/giovanni/3/16 - Giovanni 3:16');
    console.log('  • http://localhost:4321/bibbia/matteo/6/9 - Matteo 6:9');
    console.log('  • http://localhost:4321/bibbia/genesi/1/1 - Genesi 1:1\n');

  } finally {
    sqlite.close();
  }
}

importFromSQLite().catch((error) => {
  console.error('❌ Import failed:', error.message);
  console.error('Full error:', error);
  process.exit(1);
});
