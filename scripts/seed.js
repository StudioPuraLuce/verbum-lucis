import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema.ts';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
  console.log('🌱 Inizio seeding database...');

  try {
    // Seed Santi
    console.log('📿 Inserimento santi...');
    const santi = await db.insert(schema.saints).values([
      {
        nome: 'San Francesco d\'Assisi',
        nomeCompleto: 'Francesco di Pietro di Bernardone',
        slug: 'san-francesco-assisi',
        dataFesta: '10-04',
        biografia: 'San Francesco nacque ad Assisi nel 1182. Dopo una gioventù spensierata, ebbe una profonda conversione che lo portò a rinunciare a tutti i suoi beni per vivere in povertà assoluta. Fondò l\'Ordine dei Frati Minori e compose il Cantico delle Creature. Morì il 3 ottobre 1226.',
        biografiaBreve: 'Fondatore dei Frati Minori, amante della povertà e della natura',
        patronoDi: ['Italia', 'Ecologia', 'Animali', 'Commercianti'],
        titolo: 'Santo',
        epoca: 'XIII secolo',
        ricorrenza: 'Obbligatoria',
        popolarita: 100,
      },
      {
        nome: 'Santa Rita da Cascia',
        nomeCompleto: 'Margherita Lotti',
        slug: 'santa-rita-cascia',
        dataFesta: '05-22',
        biografia: 'Santa Rita nacque a Roccaporena nel 1381. Dopo essere stata moglie e madre, divenne vedova e si ritirò nel monastero agostiniano di Cascia. È conosciuta come la santa dei casi impossibili per i numerosi miracoli attribuiti alla sua intercessione.',
        biografiaBreve: 'Santa dei casi impossibili, monaca agostiniana',
        patronoDi: ['Casi impossibili', 'Situazioni disperate', 'Matrimoni difficili'],
        titolo: 'Santa',
        epoca: 'XV secolo',
        ricorrenza: 'Obbligatoria',
        popolarita: 95,
      },
      {
        nome: 'Sant\'Antonio da Padova',
        nomeCompleto: 'Fernando Martins de Bulhões',
        slug: 'santantonio-padova',
        dataFesta: '06-13',
        biografia: 'Sant\'Antonio nacque a Lisbona nel 1195. Entrò nell\'ordine francescano e divenne un grande predicatore. È venerato come taumaturgo e dottore della Chiesa. Morì a Padova nel 1231.',
        biografiaBreve: 'Dottore della Chiesa, patrono delle cose perdute',
        patronoDi: ['Cose smarrite', 'Poveri', 'Viaggiatori', 'Padova'],
        titolo: 'Santo e Dottore della Chiesa',
        epoca: 'XIII secolo',
        ricorrenza: 'Obbligatoria',
        popolarita: 98,
      },
      {
        nome: 'San Padre Pio',
        nomeCompleto: 'Francesco Forgione',
        slug: 'san-padre-pio',
        dataFesta: '09-23',
        biografia: 'Padre Pio nacque a Pietrelcina nel 1887. Frate cappuccino, ricevette le stimmate e dedicò la sua vita alla confessione e alla preghiera. Fondò la Casa Sollievo della Sofferenza. Morì nel 1968.',
        biografiaBreve: 'Frate cappuccino stigmatizzato, confessore',
        patronoDi: ['Adolescenti', 'Gruppi di preghiera'],
        titolo: 'Santo',
        epoca: 'XX secolo',
        ricorrenza: 'Obbligatoria',
        popolarita: 97,
      },
      {
        nome: 'Santa Teresa di Calcutta',
        nomeCompleto: 'Anjezë Gonxhe Bojaxhiu',
        slug: 'santa-teresa-calcutta',
        dataFesta: '09-05',
        biografia: 'Madre Teresa nacque a Skopje nel 1910. Fondò le Missionarie della Carità dedicando la sua vita ai più poveri tra i poveri. Ricevette il Premio Nobel per la Pace nel 1979. Morì nel 1997.',
        biografiaBreve: 'Fondatrice delle Missionarie della Carità, madre dei poveri',
        patronoDi: ['Volontari', 'Poveri', 'India'],
        titolo: 'Santa',
        epoca: 'XX secolo',
        ricorrenza: 'Obbligatoria',
        popolarita: 96,
      },
    ]).returning();

    console.log(`✅ Inseriti ${santi.length} santi`);

    // Seed Preghiere
    console.log('🙏 Inserimento preghiere...');
    const preghiere = await db.insert(schema.prayers).values([
      {
        titolo: 'Ave Maria',
        slug: 'ave-maria',
        testo: 'Ave, o Maria, piena di grazia, il Signore è con te. Tu sei benedetta fra le donne e benedetto è il frutto del tuo seno, Gesù. Santa Maria, Madre di Dio, prega per noi peccatori, adesso e nell\'ora della nostra morte. Amen.',
        categoria: 'mariana',
        fonteUfficiale: true,
        popolarita: 100,
        durata: 1,
      },
      {
        titolo: 'Padre Nostro',
        slug: 'padre-nostro',
        testo: 'Padre nostro, che sei nei cieli, sia santificato il tuo nome, venga il tuo regno, sia fatta la tua volontà, come in cielo così in terra. Dacci oggi il nostro pane quotidiano, e rimetti a noi i nostri debiti come anche noi li rimettiamo ai nostri debitori, e non abbandonarci alla tentazione, ma liberaci dal male. Amen.',
        categoria: 'fondamentale',
        fonteUfficiale: true,
        popolarita: 100,
        durata: 1,
      },
      {
        titolo: 'Gloria al Padre',
        slug: 'gloria-al-padre',
        testo: 'Gloria al Padre e al Figlio e allo Spirito Santo. Come era nel principio, e ora e sempre nei secoli dei secoli. Amen.',
        categoria: 'fondamentale',
        fonteUfficiale: true,
        popolarita: 95,
        durata: 1,
      },
      {
        titolo: 'Angelo di Dio',
        slug: 'angelo-di-dio',
        testo: 'Angelo di Dio, che sei il mio custode, illumina, custodisci, reggi e governa me, che ti fui affidato dalla Pietà Celeste. Amen.',
        categoria: 'angelo custode',
        fonteUfficiale: true,
        popolarita: 90,
        durata: 1,
      },
      {
        titolo: 'Preghiera a San Michele Arcangelo',
        slug: 'preghiera-san-michele',
        testo: 'San Michele Arcangelo, difendici nella battaglia: sii il nostro aiuto contro la malvagità e le insidie del demonio. Supplichevoli preghiamo che Dio lo domini e Tu, Principe della Milizia Celeste, con il potere che ti viene da Dio, ricaccia nell\'inferno satana e gli altri spiriti maligni che si aggirano per il mondo per la perdizione delle anime. Amen.',
        categoria: 'protezione',
        fonteUfficiale: true,
        popolarita: 92,
        durata: 2,
      },
    ]).returning();

    console.log(`✅ Inserite ${preghiere.length} preghiere`);

    // Seed Angeli
    console.log('👼 Inserimento angeli...');
    const angeli = await db.insert(schema.angels).values([
      {
        nome: 'San Michele Arcangelo',
        slug: 'san-michele-arcangelo',
        nomeCompleto: 'Michele, che è come Dio',
        categoria: 'Arcangelo',
        dataFesta: '09-29',
        descrizione: 'San Michele Arcangelo è il principe della milizia celeste, difensore della Chiesa e protettore contro le forze del male. È rappresentato mentre sconfigge Satana.',
        ruolo: 'Protettore, guerriero celeste',
        scritture: ['Apocalisse 12:7-9', 'Daniele 10:13', 'Giuda 1:9'],
      },
      {
        nome: 'San Gabriele Arcangelo',
        slug: 'san-gabriele-arcangelo',
        nomeCompleto: 'Gabriele, fortezza di Dio',
        categoria: 'Arcangelo',
        dataFesta: '09-29',
        descrizione: 'San Gabriele Arcangelo è il messaggero di Dio, annunciò a Maria la nascita di Gesù. È il patrono delle comunicazioni.',
        ruolo: 'Messaggero divino',
        scritture: ['Luca 1:26-38', 'Daniele 8:16'],
      },
      {
        nome: 'San Raffaele Arcangelo',
        slug: 'san-raffaele-arcangelo',
        nomeCompleto: 'Raffaele, medicina di Dio',
        categoria: 'Arcangelo',
        dataFesta: '09-29',
        descrizione: 'San Raffaele Arcangelo è l\'angelo guaritore, accompagnò Tobiolo nel suo viaggio. È il patrono dei viandanti e dei malati.',
        ruolo: 'Guaritore, guida dei viandanti',
        scritture: ['Tobia 12:15'],
      },
    ]).returning();

    console.log(`✅ Inseriti ${angeli.length} angeli`);

    // Seed Liturgia (esempio per oggi)
    console.log('📖 Inserimento liturgia esempio...');
    const liturgia = await db.insert(schema.liturgy).values([
      {
        data: '2026-01-31',
        anno: 2, // Anno B
        tempoLiturgico: 'Ordinario',
        domenicaSettimana: 'IV Domenica del Tempo Ordinario',
        coloreLiturgico: 'verde',
        primaLettura: {
          riferimento: 'Dt 18,15-20',
          testo: 'Lettura del libro del Deuteronomio...'
        },
        salmoResponsoriale: {
          riferimento: 'Sal 94',
          ritornello: 'Ascoltate oggi la voce del Signore',
          testo: 'Venite, cantiamo al Signore...'
        },
        vangelo: {
          riferimento: 'Mc 1,21-28',
          testo: 'Dal Vangelo secondo Marco...'
        },
        santiDelGiorno: [santi[0].id], // San Francesco
      },
    ]).returning();

    console.log(`✅ Inserita liturgia`);

    console.log('✨ Seeding completato con successo!');
    
  } catch (error) {
    console.error('❌ Errore durante il seeding:', error);
    throw error;
  } finally {
    await client.end();
  }
}

seed();