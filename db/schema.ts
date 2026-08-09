import { sqliteTable, text, integer, real, unique } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Schema portato da Postgres (pg-core) a SQLite/D1 (sqlite-core).
// Mappe: serial→integer autoincrement · jsonb→text json mode · date/timestamp→text · boolean→integer boolean.
// Nomi tabella/colonna invariati per compatibilità con le query e i dati.

// ─── SANTI ────────────────────────────────────────────
export const saints = sqliteTable('saints', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
  nomeCompleto: text('nome_completo'),
  slug: text('slug').notNull().unique(),
  dataFesta: text('data_festa').notNull(),       // MM-DD
  biografia: text('geografia'),
  biografiaBreve: text('geografia_breve'),
  patronoDi: text('patrono_di', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  immagineUrl: text('immagine_url'),
  titolo: text('titolo'),
  epoca: text('epoca'),
  ricorrenza: text('ricorrenza'),
  popolarita: integer('popolarita').default(0),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
});

// ─── PREGHIERE ────────────────────────────────────────
export const prayers = sqliteTable('prayers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  titolo: text('titolo').notNull(),
  slug: text('slug').notNull().unique(),
  testo: text('testo').notNull(),
  categoria: text('categoria').notNull(),
  occasione: text('occasione'),
  saintId: integer('saint_id').references(() => saints.id),
  fonteUfficiale: integer('fonte_ufficiale', { mode: 'boolean' }).default(false),
  testoLatin: text('testo_latin'),
  popolarita: integer('popolarita').default(0),
  durata: integer('durata'),
  metadata: text('metadata', { mode: 'json' }).$type<{
    keywords?: string[];
    whenToPray?: string;
    benefits?: string[];
  }>(),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
});

// ─── DIOCESI ──────────────────────────────────────────
export const dioceses = sqliteTable('dioceses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
  slug: text('slug').notNull().unique(),
  codice: text('codice').notNull().unique(),       // IT-RM, IT-MI ...
  regione: text('regione'),
  regioneEcclesiastica: text('regione_ecclesiastica'),
  tipo: text('tipo'),                              // Arcidiocesi, Diocesi, Patriarcato
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
});

// ─── LITURGIA (nazionale + diocesana) ─────────────────
export const liturgy = sqliteTable('liturgy', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  data: text('data').notNull(),                    // ISO date YYYY-MM-DD
  anno: integer('anno').notNull(),
  diocesiId: integer('diocesi_id').references(() => dioceses.id), // NULL = nazionale
  tempoLiturgico: text('tempo_liturgico').notNull(),
  domenicaSettimana: text('domenica_settimana'),
  coloreLiturgico: text('colore_liturgico').notNull(),
  primaLettura: text('prima_lettura', { mode: 'json' }).$type<{ riferimento: string; testo: string }>().notNull(),
  salmoResponsoriale: text('salmo_responsoriale', { mode: 'json' }).$type<{ riferimento: string; ritornello: string; testo: string }>().notNull(),
  secondaLettura: text('seconda_lettura', { mode: 'json' }).$type<{ riferimento: string; testo: string }>(),
  vangelo: text('vangelo', { mode: 'json' }).$type<{ riferimento: string; testo: string }>().notNull(),
  santiDelGiorno: text('santi_del_giorno', { mode: 'json' }).$type<number[]>().default(sql`'[]'`),
  meditazione: text('meditazione'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
}, (t) => ({
  // una sola liturgia per data + diocesi (diocesiId NULL = nazionale)
  uniqueDataDiocesi: unique().on(t.data, t.diocesiId),
}));

// ─── NOVENE ───────────────────────────────────────────
export const novenas = sqliteTable('novenas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  titolo: text('titolo').notNull(),
  slug: text('slug').notNull().unique(),
  saintId: integer('saint_id').references(() => saints.id),
  descrizione: text('descrizione'),
  quandoPregare: text('quando_pregare'),
  intenzioni: text('intenzioni', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  giorniTesti: text('giorni_testi', { mode: 'json' }).$type<{
    giorno: number;
    titolo: string;
    preghiera: string;
  }[]>().notNull(),
  preghieraFinale: text('preghiera_finale'),
  popolarita: integer('popolarita').default(0),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
});

// ─── ANGELI ───────────────────────────────────────────
export const angels = sqliteTable('angels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),
  slug: text('slug').notNull().unique(),
  nomeCompleto: text('nome_completo'),
  categoria: text('categoria').notNull(),
  dataFesta: text('data_festa'),
  descrizione: text('descrizione').notNull(),
  ruolo: text('ruolo'),
  scritture: text('scritture', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  immagineUrl: text('immagine_url'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
});

// ─── BENEDIZIONI ──────────────────────────────────────
export const blessings = sqliteTable('blessings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  titolo: text('titolo').notNull(),
  slug: text('slug').notNull().unique(),
  categoria: text('categoria').notNull(),
  occasione: text('occasione'),
  testo: text('testo').notNull(),
  ministro: text('ministro'),
  rituale: text('rituale'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
});

// ─── CATECHISMO (CCC) ─────────────────────────────────
export const catechism = sqliteTable('catechism', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  numero: integer('numero').notNull().unique(),   // 1-2865
  parte: text('parte'),                           // I, II, III, IV
  sezione: text('sezione'),
  capitolo: text('capitolo'),
  articolo: text('articolo'),
  testo: text('testo').notNull(),
  riferimenti: text('riferimenti', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),  // citazioni bibliche
  tags: text('tags', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),                 // temi
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
});

// ─── INTENZIONI (Intent-Based Pages) ──────────────────
export const intentions = sqliteTable('intentions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  titolo: text('titolo').notNull(),               // "mia madre", "trovare lavoro"
  slug: text('slug').notNull().unique(),           // "mia-madre", "trovare-lavoro"
  categoria: text('categoria').notNull(),          // salute, famiglia, lavoro, fede
  descrizione: text('descrizione'),
  preghiereSuggerite: text('preghiere_suggerite', { mode: 'json' }).$type<number[]>().default(sql`'[]'`),  // FK → prayers
  santiIntercedenti: text('santi_intercedenti', { mode: 'json' }).$type<number[]>().default(sql`'[]'`),    // FK → saints
  catechismoPunti: text('catechismo_punti', { mode: 'json' }).$type<number[]>().default(sql`'[]'`),        // FK → catechism
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
});

// ─── PAGINE SACRE (Pagina Sacra Daily) ───────────────
export const pagineSacre = sqliteTable('pagine_sacre', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  data: text('data').notNull().unique(),           // ISO date
  liturgyId: integer('liturgy_id').references(() => liturgy.id),
  reOggi: text('re_oggi').notNull(),
  fuocoNelCorpo: text('fuoco_nel_corpo').notNull(),
  presenzaNelGiorno: text('presenza_nel_giorno').notNull(),
  regnoNellaCarne: text('regno_nella_carne').notNull(),
  rosarioInteriore: text('rosario_interiore', { mode: 'json' }).notNull()
    .$type<{ misteroIspirato: string; misteroProgressivo: string; preghiera: string }>(),
  gestoReale: text('gesto_reale', { mode: 'json' }).notNull()
    .$type<{ titolo: string; spiegazione: string; esempi: string[]; fraseDaDire: string }>(),
  avversario: text('avversario', { mode: 'json' }).notNull()
    .$type<{ tentazioni: string[]; antidoto: string }>(),
  camminoIdentita: text('cammino_identita').notNull(),
  fraseDiario: text('frase_diario').notNull(),
  views: integer('views').default(0),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
});

// ─── CORPUS — le Pagine REALI dell'utente (testimonianza) ───────────
// Strato fedele: il testo integrale delle pagine scritte a mano negli anni, estratte
// dagli export e ancorate alla coordinata liturgica (spina). NON generate con AI, NON
// spezzettate: si conservano intatte. Alimentano il portale (mostrate nel loro giorno) e
// fanno da contesto al generatore. Distinte da `pagine_sacre` (le pagine generate a riquadri).
export const pagineCorpus = sqliteTable('pagine_corpus', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  corpusId: text('corpus_id').notNull().unique(),   // hash stabile dalla pipeline di lavorazione
  data: text('data'),                                // ISO date del giorno liturgico (può mancare)
  dataConfidence: text('data_confidence'),           // alta | media | bassa
  tempo: text('tempo'),                              // avvento · natale · ordinario · quaresima · triduo · pasqua
  colore: text('colore'),                            // viola · bianco · verde · rosso · rosa
  cicloDomenicale: text('ciclo_domenicale'),         // A | B | C
  settimana: text('settimana'),                      // romana (es. "XVIII")
  centro: text('centro'),                            // centro interiore risvegliato (se mappato)
  festa: text('festa'),                              // Pentecoste, Cristo Re, …
  fractionOfYear: real('fraction_of_year'),          // 0..1 posizione sulla spirale
  vangelo: text('vangelo'),                          // riferimento (es. "Lc 24,13-35")
  tipo: text('tipo').notNull(),                      // pagina-sacra · cammino · preghiera · dottrina · diario · lectio · nota
  titolo: text('titolo'),
  testo: text('testo').notNull(),                    // TESTO INTEGRALE, intatto
  fonte: text('fonte'),                              // chatgpt · obsidian · gemini-doc
  thread: text('thread'),                            // conversazione/documento d'origine
  qualita: real('qualita'),                          // punteggio di curatela
  nVarianti: integer('n_varianti').default(0),       // versioni dedotte collassate
  nChar: integer('n_char'),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
});

// ─── BIBBIA (Bible) ───────────────────────────────────
export const bibleBooks = sqliteTable('bible_books', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nome: text('nome').notNull(),                    // "Giovanni"
  nomeCompleto: text('nome_completo'),             // "Vangelo secondo Giovanni"
  slug: text('slug').notNull().unique(),           // "giovanni"
  abbreviazione: text('abbreviazione').notNull(),  // "Gv"
  testamento: text('testamento').notNull(),        // "NT" or "AT"
  categoria: text('categoria'),                    // "Vangeli", "Pentateuco", "Profeti"
  numeroCapitoli: integer('numero_capitoli').notNull(),
  autore: text('autore'),                          // "Giovanni Apostolo"
  contestoStorico: text('contesto_storico'),
  temiPrincipali: text('temi_principali', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  ordine: integer('ordine').notNull(),             // Display order (1-73)
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
});

export const bibleVerses = sqliteTable('bible_verses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookId: integer('book_id').notNull().references(() => bibleBooks.id),
  capitolo: integer('capitolo').notNull(),
  versetto: integer('versetto').notNull(),
  testo: text('testo').notNull(),                  // Italian CEI text
  testoLatin: text('testo_latin'),                 // Latin Vulgate (optional)
  riferimento: text('riferimento').notNull(),      // "Giovanni 3:16"
  slug: text('slug').notNull().unique(),           // "giovanni/3/16"
  tags: text('tags', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  catechismRefs: text('catechism_refs', { mode: 'json' }).$type<number[]>().default(sql`'[]'`),
  liturgyDates: text('liturgy_dates', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  views: integer('views').default(0),
  createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`),
}, (t) => ({
  // un versetto per libro-capitolo-versetto
  uniqueVerse: unique().on(t.bookId, t.capitolo, t.versetto),
}));
