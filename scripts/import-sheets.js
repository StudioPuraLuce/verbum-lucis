/**
 * Import dati da Google Sheets
 * Esegui: npm run import:sheets
 *
 * Variabili richieste:
 * - GOOGLE_SHEETS_CREDENTIALS (JSON service account)
 * - GOOGLE_SHEET_ID
 *
 * TODO: Personalizza per le tue specifiche sheet e colonne
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { google } from 'googleapis';
import * as schema from '../db/schema.ts';

const connStr = process.env.DATABASE_URL
  || 'postgresql://verbum_user:changeme123@localhost:5432/verbum_lucis';
const client = postgres(connStr);
const db = drizzle(client, { schema });

// Configurazione Google Sheets
const GOOGLE_SHEETS_CREDENTIALS = process.env.GOOGLE_SHEETS_CREDENTIALS;
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

if (!GOOGLE_SHEETS_CREDENTIALS || !GOOGLE_SHEET_ID) {
  console.error('❌ Mancano le credenziali Google Sheets!');
  console.error('   Configura GOOGLE_SHEETS_CREDENTIALS e GOOGLE_SHEET_ID in .env');
  process.exit(1);
}

// Inizializza Google Sheets API
let sheets;
try {
  const credentials = JSON.parse(GOOGLE_SHEETS_CREDENTIALS);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  sheets = google.sheets({ version: 'v4', auth });
} catch (error) {
  console.error('❌ Errore parsing credenziali Google:', error.message);
  process.exit(1);
}

/**
 * Legge un range da Google Sheets
 */
async function readSheet(range) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range,
    });
    return response.data.values || [];
  } catch (error) {
    console.error(`❌ Errore lettura sheet "${range}":`, error.message);
    throw error;
  }
}

/**
 * Converte array di righe in oggetti usando la prima riga come header
 */
function rowsToObjects(rows) {
  if (rows.length === 0) return [];

  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || null;
    });
    return obj;
  });
}

/**
 * Import dati personalizzato da Google Sheets
 *
 * TODO: Implementa per le tue specifiche sheet e tabelle
 *
 * Esempio per importare preghiere:
 * - Sheet: "Preghiere"
 * - Colonne: Titolo, Testo, Categoria, Durata
 * - Target DB: prayers table
 */
async function importFromSheets() {
  console.log('📊 Import da Google Sheets...\n');

  try {
    // TODO: Modifica il range e il nome dello sheet
    const sheetName = 'Foglio1'; // Cambia con il nome del tuo sheet
    const range = `${sheetName}!A1:Z1000`; // Aumenta se necessario

    console.log(`📖 Leggendo sheet: ${range}`);
    const rows = await readSheet(range);

    if (rows.length === 0) {
      console.log('⚠️  Nessun dato trovato nel sheet');
      return;
    }

    const data = rowsToObjects(rows);

    // TODO: Customizza la logica di import per i tuoi dati
    // Esempio generico:
    console.log(`✅ Letti ${data.length} righe da Google Sheets`);
    console.log('📋 Struttura dati (primo record):');
    console.log(JSON.stringify(data[0], null, 2));

    // TODO: Aggiungi qui la logica di import nel database
    // Esempio:
    // for (const item of data) {
    //   await db.insert(schema.prayers).values({
    //     titolo: item.Titolo,
    //     testo: item.Testo,
    //     categoria: item.Categoria,
    //     durata: item.Durata ? parseInt(item.Durata) : null,
    //   });
    // }

    console.log('\n⚠️  TODO: Implementare la logica di insert nel database');
    console.log('💡 Vedi i commenti nel file per sapere come customizzare');

  } catch (error) {
    console.error('❌ Errore import:', error.message);
    throw error;
  }
}

/**
 * Main
 */
async function main() {
  console.log('🔌 Connessione a Google Sheets...');
  console.log(`   Sheet ID: ${GOOGLE_SHEET_ID.substring(0, 12)}...`);
  console.log(`   Credentials: ${GOOGLE_SHEETS_CREDENTIALS ? 'OK' : 'MANCANTI'}`);
  console.log('');

  await importFromSheets();

  console.log('\n✨ Processo completato!\n');
  await client.end();
}

main().catch((error) => {
  console.error('❌ Errore fatale:', error);
  process.exit(1);
});
