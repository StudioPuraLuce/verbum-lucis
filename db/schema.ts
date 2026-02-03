import {
  pgTable, serial, text, date, timestamp,
  integer, boolean, jsonb, unique
} from 'drizzle-orm/pg-core';

// ─── SANTI ────────────────────────────────────────────
export const saints = pgTable('saints', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  nomeCompleto: text('nome_completo'),
  slug: text('slug').notNull().unique(),
  dataFesta: text('data_festa').notNull(),       // MM-DD
  biografia: text('geografia'),
  biografiaBreve: text('geografia_breve'),
  patronoDi: jsonb('patrono_di').$type<string[]>().default([]),
  immagineUrl: text('immagine_url'),
  titolo: text('titolo'),
  epoca: text('epoca'),
  ricorrenza: text('ricorrenza'),
  popolarita: integer('popolarita').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── PREGHIERE ────────────────────────────────────────
export const prayers = pgTable('prayers', {
  id: serial('id').primaryKey(),
  titolo: text('titolo').notNull(),
  slug: text('slug').notNull().unique(),
  testo: text('testo').notNull(),
  categoria: text('categoria').notNull(),
  occasione: text('occasione'),
  saintId: integer('saint_id').references(() => saints.id),
  fonteUfficiale: boolean('fonte_ufficiale').default(false),
  testoLatin: text('testo_latin'),
  popolarita: integer('popolarita').default(0),
  durata: integer('durata'),
  metadata: jsonb('metadata').$type<{
    keywords?: string[];
    whenToPray?: string;
    benefits?: string[];
  }>(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── DIOCESI ──────────────────────────────────────────
export const dioceses = pgTable('dioceses', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  slug: text('slug').notNull().unique(),
  codice: text('codice').notNull().unique(),       // IT-RM, IT-MI ...
  regione: text('regione'),
  regioneEcclesiastica: text('regione_ecclesiastica'),
  tipo: text('tipo'),                              // Arcidiocesi, Diocesi, Patriarcato
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── LITURGIA (nazionale) ─────────────────────────────
export const liturgy = pgTable('liturgy', {
  id: serial('id').primaryKey(),
  data: date('data').notNull(),
  anno: integer('anno').notNull(),
  diocesiId: integer('diocesi_id').references(() => dioceses.id), // NULL = nazionale
  tempoLiturgico: text('tempo_liturgico').notNull(),
  domenicaSettimana: text('domenica_settimana'),
  coloreLiturgico: text('colore_liturgico').notNull(),
  primaLettura: jsonb('prima_lettura').$type<{ riferimento: string; testo: string }>().notNull(),
  salmoResponsoriale: jsonb('salmo_responsoriale').$type<{ riferimento: string; ritornello: string; testo: string }>().notNull(),
  secondaLettura: jsonb('seconda_lettura').$type<{ riferimento: string; testo: string }>(),
  vangelo: jsonb('vangelo').$type<{ riferimento: string; testo: string }>().notNull(),
  santiDelGiorno: jsonb('santi_del_giorno').$type<number[]>().default([]),
  meditazione: text('meditazione'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Vincolo unico: una sola liturgia per data + diocesi
// diocesiId NULL = nazionale
pgTable('liturgy_unique', {
  data: date('data').notNull(),
  diocesiId: integer('diocesi_id'),
}, (table) => ({
  uniqueDataDiocesi: unique().on(table.data, table.diocesiId),
}));

// ─── NOVENE ───────────────────────────────────────────
export const novenas = pgTable('novenas', {
  id: serial('id').primaryKey(),
  titolo: text('titolo').notNull(),
  slug: text('slug').notNull().unique(),
  saintId: integer('saint_id').references(() => saints.id),
  descrizione: text('descrizione'),
  quandoPregare: text('quando_pregare'),
  intenzioni: jsonb('intenzioni').$type<string[]>().default([]),
  giorniTesti: jsonb('giorni_testi').$type<{
    giorno: number;
    titolo: string;
    preghiera: string;
  }[]>().notNull(),
  preghieraFinale: text('preghiera_finale'),
  popolarita: integer('popolarita').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── ANGELI ───────────────────────────────────────────
export const angels = pgTable('angels', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  slug: text('slug').notNull().unique(),
  nomeCompleto: text('nome_completo'),
  categoria: text('categoria').notNull(),
  dataFesta: date('data_festa'),
  descrizione: text('descrizione').notNull(),
  ruolo: text('ruolo'),
  scritture: jsonb('scritture').$type<string[]>().default([]),
  immagineUrl: text('immagine_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── BENEDIZIONI ──────────────────────────────────────
export const blessings = pgTable('blessings', {
  id: serial('id').primaryKey(),
  titolo: text('titolo').notNull(),
  slug: text('slug').notNull().unique(),
  categoria: text('categoria').notNull(),
  occasione: text('occasione'),
  testo: text('testo').notNull(),
  ministro: text('ministro'),
  rituale: text('rituale'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── CATECHISMO (CCC) ─────────────────────────────────
export const catechism = pgTable('catechism', {
  id: serial('id').primaryKey(),
  numero: integer('numero').notNull().unique(),   // 1-2865
  parte: text('parte'),                           // I, II, III, IV
  sezione: text('sezione'),
  capitolo: text('capitolo'),
  articolo: text('articolo'),
  testo: text('testo').notNull(),
  riferimenti: jsonb('riferimenti').$type<string[]>().default([]),  // citazioni bibliche
  tags: jsonb('tags').$type<string[]>().default([]),                 // temi (es. "preghiera", "sacramento")
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── INTENZIONI (Intent-Based Pages) ──────────────────
export const intentions = pgTable('intentions', {
  id: serial('id').primaryKey(),
  titolo: text('titolo').notNull(),               // "mia madre", "trovare lavoro"
  slug: text('slug').notNull().unique(),           // "mia-madre", "trovare-lavoro"
  categoria: text('categoria').notNull(),          // salute, famiglia, lavoro, fede
  descrizione: text('descrizione'),
  preghiereSuggerite: jsonb('preghiere_suggerite').$type<number[]>().default([]),  // FK → prayers
  santiIntercedenti: jsonb('santi_intercedenti').$type<number[]>().default([]),    // FK → saints
  catechismoPunti: jsonb('catechismo_punti').$type<number[]>().default([]),        // FK → catechism
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── PAGINE SACRE (Pagina Sacra Daily) ───────────────
export const pagineSacre = pgTable('pagine_sacre', {
  id: serial('id').primaryKey(),
  data: date('data').notNull().unique(),
  liturgyId: integer('liturgy_id').references(() => liturgy.id),
  reOggi: text('re_oggi').notNull(),
  fuocoNelCorpo: text('fuoco_nel_corpo').notNull(),
  presenzaNelGiorno: text('presenza_nel_giorno').notNull(),
  regnoNellaCarne: text('regno_nella_carne').notNull(),
  rosarioInteriore: text('rosario_interiore').notNull(),
  gestoReale: text('gesto_reale').notNull(),
  avversario: text('avversario').notNull(),
  camminoIdentita: text('cammino_identita').notNull(),
  fraseDiario: text('frase_diario').notNull(),
  views: integer('views').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});
