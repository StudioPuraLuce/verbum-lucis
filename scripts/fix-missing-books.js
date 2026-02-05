#!/usr/bin/env node

import * as dotenv from 'dotenv';
dotenv.config();

import sqlite3 from 'sqlite3';
import { db, client } from '../db/db-config.ts';

const SQLITE_PATH = '/home/chris/Scrivania/CEI.SQLite3';

function formatSlug(text) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

async function fixBooks() {
  const sqlite = new sqlite3.Database(SQLITE_PATH, sqlite3.OPEN_READONLY);

  try {
    const books = await new Promise((resolve, reject) => {
      sqlite.all('SELECT * FROM books ORDER BY book_number', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log(`\n📚 Inserting ${books.length} books from SQLite into PostgreSQL...\n`);

    let inserted = 0;
    for (let i = 0; i < books.length; i++) {
      const book = books[i];
      const sequentialId = i + 1;  // Map to IDs 1-73
      const slug = formatSlug(book.long_name);

      try {
        // Use raw SQL to insert with explicit ID
        await client.unsafe(`
          INSERT INTO bible_books (id, nome, nome_completo, slug, abbreviazione, testamento, categoria, numero_capitoli, autore, contesto_storico, temi_principali, ordine, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (id) DO UPDATE SET nome = $2, slug = $4
        `, [
          sequentialId,
          book.long_name,
          book.long_name,
          slug,
          book.short_name,
          sequentialId <= 39 ? 'AT' : 'NT',
          '',
          0,
          null,
          null,
          [],
          sequentialId,
          new Date().toISOString()
        ]);
        console.log(`✅ [${sequentialId}] ${book.long_name}`);
        inserted++;
      } catch (err) {
        console.error(`❌ Error inserting book ${book.long_name}:`, err.message);
      }
    }

    console.log(`\n✅ Inserted/updated ${inserted}/${books.length} books\n`);
  } finally {
    sqlite.close();
    await client.end();
  }
}

fixBooks().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
