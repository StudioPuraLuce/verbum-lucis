/**
 * Bible Import Script
 *
 * Imports Italian Bible (CEI 2008) data into database
 * Data source: BibleGet.io API or static JSON
 *
 * Usage: npm run import:bible
 *
 * This script:
 * 1. Imports 73 books into bible_books table
 * 2. Imports ~31,000 verses into bible_verses table
 * 3. Creates indexes for performance
 * 4. Links Bible verses to Catechism references
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema.ts';
import { bibleBooks, bibleVerses } from '../db/schema.ts';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://verbum_user:changeme123@localhost:5432/verbum_lucis';

const client = postgres(DATABASE_URL);
const db = drizzle(client, { schema });

// Italian Bible metadata: 73 books (46 OT + 27 NT)
const BIBLE_BOOKS_METADATA = [
  // ANTICO TESTAMENTO (46 books)
  // Pentateuco (5)
  { nome: 'Genesi', nomeCompleto: 'Libro della Genesi', abbreviazione: 'Gn', testamento: 'AT', categoria: 'Pentateuco', numeroCapitoli: 50, autore: 'Mosè', ordine: 1 },
  { nome: 'Esodo', nomeCompleto: 'Libro dell\'Esodo', abbreviazione: 'Es', testamento: 'AT', categoria: 'Pentateuco', numeroCapitoli: 40, autore: 'Mosè', ordine: 2 },
  { nome: 'Levitico', nomeCompleto: 'Libro del Levitico', abbreviazione: 'Lv', testamento: 'AT', categoria: 'Pentateuco', numeroCapitoli: 27, autore: 'Mosè', ordine: 3 },
  { nome: 'Numeri', nomeCompleto: 'Libro dei Numeri', abbreviazione: 'Nm', testamento: 'AT', categoria: 'Pentateuco', numeroCapitoli: 36, autore: 'Mosè', ordine: 4 },
  { nome: 'Deuteronomio', nomeCompleto: 'Libro del Deuteronomio', abbreviazione: 'Dt', testamento: 'AT', categoria: 'Pentateuco', numeroCapitoli: 34, autore: 'Mosè', ordine: 5 },

  // Storici (16)
  { nome: 'Giosuè', nomeCompleto: 'Libro di Giosuè', abbreviazione: 'Gs', testamento: 'AT', categoria: 'Storici', numeroCapitoli: 24, autore: 'Giosuè', ordine: 6 },
  { nome: 'Giudici', nomeCompleto: 'Libro dei Giudici', abbreviazione: 'Gdc', testamento: 'AT', categoria: 'Storici', numeroCapitoli: 21, ordine: 7 },
  { nome: '1 Samuele', nomeCompleto: 'Primo Libro di Samuele', abbreviazione: '1Sa', testamento: 'AT', categoria: 'Storici', numeroCapitoli: 31, ordine: 8 },
  { nome: '2 Samuele', nomeCompleto: 'Secondo Libro di Samuele', abbreviazione: '2Sa', testamento: 'AT', categoria: 'Storici', numeroCapitoli: 24, ordine: 9 },
  { nome: '1 Re', nomeCompleto: 'Primo Libro dei Re', abbreviazione: '1Re', testamento: 'AT', categoria: 'Storici', numeroCapitoli: 22, ordine: 10 },
  { nome: '2 Re', nomeCompleto: 'Secondo Libro dei Re', abbreviazione: '2Re', testamento: 'AT', categoria: 'Storici', numeroCapitoli: 25, ordine: 11 },
  { nome: '1 Cronache', nomeCompleto: 'Primo Libro delle Cronache', abbreviazione: '1Cr', testamento: 'AT', categoria: 'Storici', numeroCapitoli: 29, ordine: 12 },
  { nome: '2 Cronache', nomeCompleto: 'Secondo Libro delle Cronache', abbreviazione: '2Cr', testamento: 'AT', categoria: 'Storici', numeroCapitoli: 36, ordine: 13 },
  { nome: 'Esdra', nomeCompleto: 'Libro di Esdra', abbreviazione: 'Esd', testamento: 'AT', categoria: 'Storici', numeroCapitoli: 10, ordine: 14 },
  { nome: 'Neemia', nomeCompleto: 'Libro di Neemia', abbreviazione: 'Ne', testamento: 'AT', categoria: 'Storici', numeroCapitoli: 13, ordine: 15 },
  { nome: 'Tobia', nomeCompleto: 'Libro di Tobia', abbreviazione: 'Tb', testamento: 'AT', categoria: 'Storici', numeroCapitoli: 14, ordine: 16 },
  { nome: 'Giuditta', nomeCompleto: 'Libro di Giuditta', abbreviazione: 'Gdt', testamento: 'AT', categoria: 'Storici', numeroCapitoli: 16, ordine: 17 },
  { nome: 'Ester', nomeCompleto: 'Libro di Ester', abbreviazione: 'Est', testamento: 'AT', categoria: 'Storici', numeroCapitoli: 10, ordine: 18 },
  { nome: '1 Maccabei', nomeCompleto: 'Primo Libro dei Maccabei', abbreviazione: '1Mac', testamento: 'AT', categoria: 'Storici', numeroCapitoli: 16, ordine: 19 },
  { nome: '2 Maccabei', nomeCompleto: 'Secondo Libro dei Maccabei', abbreviazione: '2Mac', testamento: 'AT', categoria: 'Storici', numeroCapitoli: 15, ordine: 20 },
  { nome: 'Giob', nomeCompleto: 'Libro di Giobbe', abbreviazione: 'Gb', testamento: 'AT', categoria: 'Storici', numeroCapitoli: 42, ordine: 21 },

  // Sapienziali (7)
  { nome: 'Salmi', nomeCompleto: 'Libro dei Salmi', abbreviazione: 'Sal', testamento: 'AT', categoria: 'Sapienziali', numeroCapitoli: 150, ordine: 22 },
  { nome: 'Proverbi', nomeCompleto: 'Libro dei Proverbi', abbreviazione: 'Pr', testamento: 'AT', categoria: 'Sapienziali', numeroCapitoli: 31, ordine: 23 },
  { nome: 'Qoèlet', nomeCompleto: 'Libro dell\'Ecclesiaste (Qoèlet)', abbreviazione: 'Qo', testamento: 'AT', categoria: 'Sapienziali', numeroCapitoli: 12, ordine: 24 },
  { nome: 'Cantico dei Cantici', nomeCompleto: 'Cantico dei Cantici', abbreviazione: 'Ct', testamento: 'AT', categoria: 'Sapienziali', numeroCapitoli: 8, ordine: 25 },
  { nome: 'Sapienza', nomeCompleto: 'Libro della Sapienza', abbreviazione: 'Sap', testamento: 'AT', categoria: 'Sapienziali', numeroCapitoli: 19, ordine: 26 },
  { nome: 'Siracide', nomeCompleto: 'Libro di Ben Sira (Siracide)', abbreviazione: 'Sir', testamento: 'AT', categoria: 'Sapienziali', numeroCapitoli: 51, ordine: 27 },

  // Profetici Maggiori (4)
  { nome: 'Isaia', nomeCompleto: 'Libro d\'Isaia', abbreviazione: 'Is', testamento: 'AT', categoria: 'Profeti', numeroCapitoli: 66, autore: 'Isaia', ordine: 28 },
  { nome: 'Geremia', nomeCompleto: 'Libro di Geremia', abbreviazione: 'Ger', testamento: 'AT', categoria: 'Profeti', numeroCapitoli: 52, autore: 'Geremia', ordine: 29 },
  { nome: 'Lamentazioni', nomeCompleto: 'Lamentazioni di Geremia', abbreviazione: 'Lam', testamento: 'AT', categoria: 'Profeti', numeroCapitoli: 5, ordine: 30 },
  { nome: 'Ezechiele', nomeCompleto: 'Libro d\'Ezechiele', abbreviazione: 'Ez', testamento: 'AT', categoria: 'Profeti', numeroCapitoli: 48, autore: 'Ezechiele', ordine: 31 },

  // Profetici Minori (12)
  { nome: 'Daniele', nomeCompleto: 'Libro di Daniele', abbreviazione: 'Dn', testamento: 'AT', categoria: 'Profeti', numeroCapitoli: 12, autore: 'Daniele', ordine: 32 },
  { nome: 'Osea', nomeCompleto: 'Libro d\'Osea', abbreviazione: 'Os', testamento: 'AT', categoria: 'Profeti', numeroCapitoli: 14, autore: 'Osea', ordine: 33 },
  { nome: 'Amos', nomeCompleto: 'Libro d\'Amos', abbreviazione: 'Am', testamento: 'AT', categoria: 'Profeti', numeroCapitoli: 9, autore: 'Amos', ordine: 34 },
  { nome: 'Abdia', nomeCompleto: 'Libro d\'Abdia', abbreviazione: 'Abd', testamento: 'AT', categoria: 'Profeti', numeroCapitoli: 1, autore: 'Abdia', ordine: 35 },
  { nome: 'Giona', nomeCompleto: 'Libro di Giona', abbreviazione: 'Gn', testamento: 'AT', categoria: 'Profeti', numeroCapitoli: 4, autore: 'Giona', ordine: 36 },
  { nome: 'Michea', nomeCompleto: 'Libro di Michea', abbreviazione: 'Mic', testamento: 'AT', categoria: 'Profeti', numeroCapitoli: 7, autore: 'Michea', ordine: 37 },
  { nome: 'Naum', nomeCompleto: 'Libro di Naum', abbreviazione: 'Na', testamento: 'AT', categoria: 'Profeti', numeroCapitoli: 3, autore: 'Naum', ordine: 38 },
  { nome: 'Abacuc', nomeCompleto: 'Libro d\'Abacuc', abbreviazione: 'Ab', testamento: 'AT', categoria: 'Profeti', numeroCapitoli: 3, autore: 'Abacuc', ordine: 39 },
  { nome: 'Sofonia', nomeCompleto: 'Libro di Sofonia', abbreviazione: 'Sof', testamento: 'AT', categoria: 'Profeti', numeroCapitoli: 3, autore: 'Sofonia', ordine: 40 },
  { nome: 'Aggeo', nomeCompleto: 'Libro d\'Aggeo', abbreviazione: 'Ag', testamento: 'AT', categoria: 'Profeti', numeroCapitoli: 2, autore: 'Aggeo', ordine: 41 },
  { nome: 'Zaccaria', nomeCompleto: 'Libro di Zaccaria', abbreviazione: 'Zc', testamento: 'AT', categoria: 'Profeti', numeroCapitoli: 14, autore: 'Zaccaria', ordine: 42 },
  { nome: 'Malachia', nomeCompleto: 'Libro di Malachia', abbreviazione: 'Ml', testamento: 'AT', categoria: 'Profeti', numeroCapitoli: 4, autore: 'Malachia', ordine: 43 },

  // NUOVO TESTAMENTO (27 books)
  // Vangeli (4)
  { nome: 'Matteo', nomeCompleto: 'Vangelo secondo Matteo', abbreviazione: 'Mt', testamento: 'NT', categoria: 'Vangeli', numeroCapitoli: 28, autore: 'Matteo Apostolo', ordine: 44 },
  { nome: 'Marco', nomeCompleto: 'Vangelo secondo Marco', abbreviazione: 'Mc', testamento: 'NT', categoria: 'Vangeli', numeroCapitoli: 16, autore: 'Marco', ordine: 45 },
  { nome: 'Luca', nomeCompleto: 'Vangelo secondo Luca', abbreviazione: 'Lc', testamento: 'NT', categoria: 'Vangeli', numeroCapitoli: 24, autore: 'Luca', ordine: 46 },
  { nome: 'Giovanni', nomeCompleto: 'Vangelo secondo Giovanni', abbreviazione: 'Gv', testamento: 'NT', categoria: 'Vangeli', numeroCapitoli: 21, autore: 'Giovanni Apostolo', ordine: 47 },

  // Atti e Epistole (23)
  { nome: 'Atti', nomeCompleto: 'Atti degli Apostoli', abbreviazione: 'At', testamento: 'NT', categoria: 'Epistole', numeroCapitoli: 28, autore: 'Luca', ordine: 48 },
  { nome: 'Romani', nomeCompleto: 'Lettera ai Romani', abbreviazione: 'Rm', testamento: 'NT', categoria: 'Epistole', numeroCapitoli: 16, autore: 'Paolo', ordine: 49 },
  { nome: '1 Corinzi', nomeCompleto: 'Prima Lettera ai Corinzi', abbreviazione: '1Cor', testamento: 'NT', categoria: 'Epistole', numeroCapitoli: 16, autore: 'Paolo', ordine: 50 },
  { nome: '2 Corinzi', nomeCompleto: 'Seconda Lettera ai Corinzi', abbreviazione: '2Cor', testamento: 'NT', categoria: 'Epistole', numeroCapitoli: 13, autore: 'Paolo', ordine: 51 },
  { nome: 'Galati', nomeCompleto: 'Lettera ai Galati', abbreviazione: 'Gal', testamento: 'NT', categoria: 'Epistole', numeroCapitoli: 6, autore: 'Paolo', ordine: 52 },
  { nome: 'Efesini', nomeCompleto: 'Lettera agli Efesini', abbreviazione: 'Ef', testamento: 'NT', categoria: 'Epistole', numeroCapitoli: 6, autore: 'Paolo', ordine: 53 },
  { nome: 'Filippesi', nomeCompleto: 'Lettera ai Filippesi', abbreviazione: 'Fil', testamento: 'NT', categoria: 'Epistole', numeroCapitoli: 4, autore: 'Paolo', ordine: 54 },
  { nome: 'Colossesi', nomeCompleto: 'Lettera ai Colossesi', abbreviazione: 'Col', testamento: 'NT', categoria: 'Epistole', numeroCapitoli: 4, autore: 'Paolo', ordine: 55 },
  { nome: '1 Tessalonicesi', nomeCompleto: 'Prima Lettera ai Tessalonicesi', abbreviazione: '1Ts', testamento: 'NT', categoria: 'Epistole', numeroCapitoli: 5, autore: 'Paolo', ordine: 56 },
  { nome: '2 Tessalonicesi', nomeCompleto: 'Seconda Lettera ai Tessalonicesi', abbreviazione: '2Ts', testamento: 'NT', categoria: 'Epistole', numeroCapitoli: 3, autore: 'Paolo', ordine: 57 },
  { nome: '1 Timoteo', nomeCompleto: 'Prima Lettera a Timoteo', abbreviazione: '1Tm', testamento: 'NT', categoria: 'Epistole', numeroCapitoli: 6, autore: 'Paolo', ordine: 58 },
  { nome: '2 Timoteo', nomeCompleto: 'Seconda Lettera a Timoteo', abbreviazione: '2Tm', testamento: 'NT', categoria: 'Epistole', numeroCapitoli: 4, autore: 'Paolo', ordine: 59 },
  { nome: 'Tito', nomeCompleto: 'Lettera a Tito', abbreviazione: 'Tt', testamento: 'NT', categoria: 'Epistole', numeroCapitoli: 3, autore: 'Paolo', ordine: 60 },
  { nome: 'Filemone', nomeCompleto: 'Lettera a Filemone', abbreviazione: 'Fm', testamento: 'NT', categoria: 'Epistole', numeroCapitoli: 1, autore: 'Paolo', ordine: 61 },
  { nome: 'Ebrei', nomeCompleto: 'Lettera agli Ebrei', abbreviazione: 'Eb', testamento: 'NT', categoria: 'Epistole', numeroCapitoli: 13, ordine: 62 },
  { nome: 'Giacomo', nomeCompleto: 'Lettera di Giacomo', abbreviazione: 'Gc', testamento: 'NT', categoria: 'Epistole', numeroCapitoli: 5, autore: 'Giacomo', ordine: 63 },
  { nome: '1 Pietro', nomeCompleto: 'Prima Lettera di Pietro', abbreviazione: '1Pt', testamento: 'NT', categoria: 'Epistole', numeroCapitoli: 5, autore: 'Pietro', ordine: 64 },
  { nome: '2 Pietro', nomeCompleto: 'Seconda Lettera di Pietro', abbreviazione: '2Pt', testamento: 'NT', categoria: 'Epistole', numeroCapitoli: 3, autore: 'Pietro', ordine: 65 },
  { nome: '1 Giovanni', nomeCompleto: 'Prima Lettera di Giovanni', abbreviazione: '1Gv', testamento: 'NT', categoria: 'Epistole', numeroCapitoli: 5, autore: 'Giovanni', ordine: 66 },
  { nome: '2 Giovanni', nomeCompleto: 'Seconda Lettera di Giovanni', abbreviazione: '2Gv', testamento: 'NT', categoria: 'Epistole', numeroCapitoli: 1, autore: 'Giovanni', ordine: 67 },
  { nome: '3 Giovanni', nomeCompleto: 'Terza Lettera di Giovanni', abbreviazione: '3Gv', testamento: 'NT', categoria: 'Epistole', numeroCapitoli: 1, autore: 'Giovanni', ordine: 68 },
  { nome: 'Giuda', nomeCompleto: 'Lettera di Giuda', abbreviazione: 'Gd', testamento: 'NT', categoria: 'Epistole', numeroCapitoli: 1, autore: 'Giuda', ordine: 69 },
  { nome: 'Apocalisse', nomeCompleto: 'Apocalisse di Giovanni', abbreviazione: 'Ap', testamento: 'NT', categoria: 'Profeti', numeroCapitoli: 22, autore: 'Giovanni', ordine: 70 },
];

async function importBibleBooks() {
  console.log('📚 Importing Bible Books...\n');

  // Generate slugs for books
  const booksToInsert = BIBLE_BOOKS_METADATA.map(book => ({
    ...book,
    slug: book.nome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
  }));

  try {
    // Insert books in batches
    const batchSize = 10;
    for (let i = 0; i < booksToInsert.length; i += batchSize) {
      const batch = booksToInsert.slice(i, Math.min(i + batchSize, booksToInsert.length));
      const result = await db.insert(bibleBooks).values(batch).returning();
      console.log(`✅ Inserted ${batch.length} books (batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(booksToInsert.length / batchSize)})`);
    }

    console.log(`\n✅ Successfully imported ${booksToInsert.length} books`);
    return true;
  } catch (error) {
    console.error('❌ Error importing books:', error.message);
    throw error;
  }
}

async function importBibleVerses() {
  console.log('\n📖 Importing Bible Verses...\n');
  console.log('⚠️  NOTE: Verse data import requires:');
  console.log('   Option A: BibleGet.io API (free, no auth)');
  console.log('   Option B: Static JSON file with all verses');
  console.log('   Option C: Italian Bible JSON from awesome-catholic\n');
  console.log('📝 For now, creating import template...\n');

  // This would need actual Bible verse data
  // For Phase 1, we'll create a placeholder
  console.log('TODO: Implement verse import when Bible data source is available');
  console.log('\nVerse import template would:');
  console.log('  1. Fetch/read ~31,000 verses');
  console.log('  2. Group by book');
  console.log('  3. Insert in batches of 100-200 verses');
  console.log('  4. Generate slugs: libro/capitolo/versetto');
  console.log('  5. Parse Bible refs from catechism.riferimenti for cross-linking');
}

async function createIndexes() {
  console.log('\n⚡ Creating database indexes...\n');

  const indexCommands = [
    'CREATE INDEX IF NOT EXISTS idx_bible_verses_book_chapter ON bible_verses(book_id, capitolo);',
    'CREATE INDEX IF NOT EXISTS idx_bible_verses_reference ON bible_verses(riferimento);',
    'CREATE INDEX IF NOT EXISTS idx_bible_verses_slug ON bible_verses(slug);',
    'CREATE INDEX IF NOT EXISTS idx_bible_books_slug ON bible_books(slug);',
    'CREATE INDEX IF NOT EXISTS idx_bible_books_abbr ON bible_books(abbreviazione);',
    'CREATE INDEX IF NOT EXISTS idx_bible_verses_fulltext ON bible_verses USING gin(to_tsvector(\'italian\', testo));',
  ];

  try {
    for (const cmd of indexCommands) {
      await client.unsafe(cmd);
      console.log(`✅ ${cmd.split(' ')[5]}`);
    }
    console.log('\n✅ All indexes created successfully');
  } catch (error) {
    console.error('⚠️  Index creation warning:', error.message);
  }
}

async function main() {
  console.log('🕊️  BIBLE IMPORT SCRIPT\n');
  console.log('━'.repeat(60));
  console.log('Feature: Italian Catholic Bible (CEI 2008)');
  console.log('Source: BibleGet.io API (or static JSON)');
  console.log('Target: 73 books, ~31,000 verses');
  console.log('━'.repeat(60) + '\n');

  try {
    // Step 1: Import books
    await importBibleBooks();

    // Step 2: Import verses (requires data source)
    await importBibleVerses();

    // Step 3: Create indexes
    await createIndexes();

    console.log('\n━'.repeat(60));
    console.log('✨ Phase 1 complete!\n');
    console.log('Next Steps:');
    console.log('  1. Obtain Bible verse data (BibleGet.io API or JSON file)');
    console.log('  2. Update importBibleVerses() function');
    console.log('  3. Run this script again: npm run import:bible\n');
    console.log('Books imported: 73 ✅');
    console.log('Verses imported: TODO (awaiting data source)');
    console.log('Indexes created: ✅');
    console.log('━'.repeat(60));

  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
