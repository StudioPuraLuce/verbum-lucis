/**
 * Script per aggiornare automaticamente la liturgia quotidiana
 * Usa LitCal API (litcal.johnromanodorazio.com)
 *
 * Esegui con: npm run update-liturgy
 * O con cron: 1 0 * * * npm run update-liturgy
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from '../db/schema.ts';

const connectionString = process.env.DATABASE_URL || 'postgresql://verbum_user:changeme123@localhost:5432/verbum_lucis';
const client = postgres(connectionString);
const db = drizzle(client, { schema });

// LitCal API Base URL
const LITCAL_BASE_URL = 'https://litcal.johnromanodorazio.com/api/v4';

// Color mapping
const colorMap = {
  green: 'verde',
  red: 'rosso',
  white: 'bianco',
  violet: 'viola',
  purple: 'viola',
  rose: 'rosa',
};

/**
 * Fetch calendario nazionale italiano per un anno
 */
async function fetchNationalCalendar(year) {
  const url = `${LITCAL_BASE_URL}/calendar/nation/IT/${year}?returntype=json`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      console.error(`❌ LitCal API error: ${res.status} ${res.statusText}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('❌ Errore chiamata LitCal API:', error.message);
    return null;
  }
}

/**
 * Trova la celebrazione per una data specifica
 */
function findCelebrationForDate(calendar, targetDate) {
  if (!calendar || !calendar.LitCal) return null;

  // LitCal restituisce un oggetto con eventi, non un array
  for (const [key, event] of Object.entries(calendar.LitCal)) {
    if (event.date) {
      const eventDate = new Date(event.date * 1000).toISOString().split('T')[0];
      if (eventDate === targetDate) {
        return event;
      }
    }
  }

  return null;
}

/**
 * Mappa risposta LitCal al nostro schema
 */
function mapLitCalToSchema(event, date, calendar) {
  const year = new Date(date).getFullYear();
  const liturgicalYear = (year % 3) || 3;

  // Determina il colore liturgico
  const color = event.color?.[0]?.toLowerCase() || 'green';

  return {
    data: date,
    anno: liturgicalYear,
    tempoLiturgico: calendar?.Settings?.Locale || 'Ordinario',
    domenicaSettimana: event.name || null,
    coloreLiturgico: colorMap[color] || 'verde',
    primaLettura: {
      riferimento: 'Consultare il Lezionario',
      testo: 'Testo disponibile nel Lezionario diocesano.',
    },
    salmoResponsoriale: {
      riferimento: 'Salmo',
      ritornello: '',
      testo: 'Testo disponibile nel Lezionario diocesano.',
    },
    secondaLettura: null,
    vangelo: {
      riferimento: 'Vangelo del giorno',
      testo: 'Testo disponibile nel Lezionario diocesano.',
    },
    santiDelGiorno: [],
  };
}

/**
 * Fallback: genera liturgia placeholder per date senza dati API
 */
function generatePlaceholderLiturgy(date) {
  const dayOfWeek = new Date(date).getDay();
  const year = new Date(date).getFullYear();
  const liturgicalYear = (year % 3) || 3;

  const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

  return {
    data: date,
    anno: liturgicalYear,
    tempoLiturgico: 'Tempo Ordinario',
    domenicaSettimana: dayOfWeek === 0 ? 'Domenica del Tempo Ordinario' : `${days[dayOfWeek]} del Tempo Ordinario`,
    coloreLiturgico: 'verde',
    primaLettura: {
      riferimento: 'Consultare il Lezionario',
      testo: 'Testo disponibile nel Lezionario diocesano.',
    },
    salmoResponsoriale: {
      riferimento: 'Salmo',
      ritornello: '',
      testo: 'Testo disponibile nel Lezionario diocesano.',
    },
    secondaLettura: null,
    vangelo: {
      riferimento: 'Vangelo del giorno',
      testo: 'Testo disponibile nel Lezionario diocesano.',
    },
    santiDelGiorno: [],
  };
}

/**
 * Aggiorna o inserisci liturgia nel database
 */
async function upsertLiturgy(liturgyData) {
  try {
    const existing = await db.query.liturgy.findFirst({
      where: (liturgy, { eq }) => eq(liturgy.data, liturgyData.data),
    });

    if (existing) {
      await db.update(schema.liturgy)
        .set(liturgyData)
        .where(eq(schema.liturgy.data, liturgyData.data));
      console.log(`✅ Aggiornata liturgia per ${liturgyData.data}`);
    } else {
      await db.insert(schema.liturgy).values(liturgyData);
      console.log(`✅ Inserita liturgia per ${liturgyData.data}`);
    }
  } catch (error) {
    console.error(`❌ Errore database per ${liturgyData.data}:`, error.message);
  }
}

/**
 * Main function
 */
async function updateLiturgy() {
  console.log('🔄 Inizio aggiornamento liturgia (LitCal API)...\n');

  const today = new Date();
  const year = today.getFullYear();
  const dates = [];

  // Aggiorna oggi + prossimi 7 giorni
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  console.log(`📅 Date da aggiornare: ${dates.join(', ')}\n`);

  // Fetch calendario nazionale
  console.log(`🌐 Recupero calendario nazionale italiano ${year}...`);
  const calendar = await fetchNationalCalendar(year);

  if (calendar) {
    console.log('✅ Calendario recuperato con successo!\n');
  } else {
    console.log('⚠️  Calendario non disponibile, uso dati placeholder.\n');
  }

  for (const date of dates) {
    console.log(`🔍 Elaborazione ${date}...`);

    let liturgyData;

    if (calendar) {
      const event = findCelebrationForDate(calendar, date);
      if (event) {
        liturgyData = mapLitCalToSchema(event, date, calendar);
      } else {
        liturgyData = generatePlaceholderLiturgy(date);
      }
    } else {
      liturgyData = generatePlaceholderLiturgy(date);
    }

    await upsertLiturgy(liturgyData);

    // Breve pausa
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n✨ Aggiornamento completato!');
}

// Esegui
updateLiturgy()
  .catch(console.error)
  .finally(() => client.end());
