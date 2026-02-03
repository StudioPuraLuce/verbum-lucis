/**
 * Aggregazione santi da fonti multiple open source
 *
 * Fonti:
 *   1. catholic-readings-api (cpbjr/catholic-readings-api) — saints per data
 *   2. catholicsaints.info — 7000+ santi (scraping etico)
 *   3. Dati manuali (data/saints-manual.json) — santi italiani principali
 *
 * Output: data/saints-aggregated.json
 * Poi import nel DB: node scripts/sync-saints.js import data/saints-aggregated.json
 *
 * Esegui: node scripts/scrape-saints.js
 */
import { writeFileSync, readFileSync, existsSync } from 'fs';

// ─── SORGENTE 1: Catholic Readings API (GitHub Pages) ───
// Gratuita, MIT, no rate limits
// Struttura: saints/{year}/{MM-DD}.json
const READINGS_API = 'https://cpbjr.github.io/catholic-readings-api';

async function fetchSaintsFromReadingsAPI() {
  console.log('📡 Fetch santi da catholic-readings-api...\n');

  const saints = [];
  const year = 2025;

  // Itera ogni giorno dell'anno
  for (let month = 1; month <= 12; month++) {
    for (let day = 1; day <= 31; day++) {
      const mm = String(month).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      const url = `${READINGS_API}/saints/${year}/${mm}-${dd}.json`;

      try {
        const res = await fetch(url);
        if (!res.ok) continue;

        const data = await res.json();

        if (data.saint && data.saint.name) {
          saints.push({
            nome: data.saint.name,
            dataFesta: `${mm}-${dd}`,
            tipo: data.saint.type || 'Memorial',                 // Feast, Memorial, etc.
            citazione: data.saint.quote || null,
            wikipediaLink: data.wikipediaLink || null,
            sorgente: 'catholic-readings-api',
          });

          console.log(`  ✅ ${mm}-${dd}: ${data.saint.name}`);
        }
      } catch (e) {
        // Silenzio su date non valide (es. 31 febbraio)
        continue;
      }

      // Pausa minima per cortesia
      await new Promise(r => setTimeout(r, 50));
    }
  }

  console.log(`\n  📊 Santi trovati: ${saints.length}\n`);
  return saints;
}

// ─── SORGENTE 2: Dati Manuali (Santi Italiani Principali) ──
function loadManualSaints() {
  const path = './data/saints-manual.json';

  if (!existsSync(path)) {
    console.log('⚠️  File saints-manual.json non trovato, uso dati hardcoded\n');
    return getHardcodedSaints();
  }

  const data = readFileSync(path, 'utf-8');
  return JSON.parse(data);
}

function getHardcodedSaints() {
  return [
    {
      nome: 'San Giuseppe',
      nomeCompleto: 'Giuseppe di Nazareth',
      slug: 'san-giuseppe',
      dataFesta: '03-19',
      biografiaBreve: 'Padre terreno di Gesù, patrono dei lavoratori e delle famiglie',
      patronoDi: ['Lavoratori', 'Famiglie', 'Padri', 'Italia', 'Carpentieri'],
      titolo: 'Santo',
      epoca: 'I secolo',
      popolarita: 99,
    },
    {
      nome: 'Santa Monica',
      nomeCompleto: 'Monica di Ippona',
      slug: 'santa-monica',
      dataFesta: '08-27',
      biografiaBreve: 'Madre di Sant\'Agostino, esemplare di pazienza e preghiera',
      patronoDi: ['Madri', 'Famiglie', 'Conversione dei figli'],
      titolo: 'Santa',
      epoca: 'IV secolo',
      popolarita: 88,
    },
    {
      nome: 'San Tommaso d\'Aquino',
      nomeCompleto: 'Tommaso di Aquino',
      slug: 'san-tommaso-daquino',
      dataFesta: '01-28',
      biografiaBreve: 'Dottore della Chiesa, filosofo e teologo più grande del Medioevo',
      patronoDi: ['Filosofi', 'Teologi', 'Studenti', 'Universitari', 'Domenicani'],
      titolo: 'Santo e Dottore della Chiesa',
      epoca: 'XIII secolo',
      popolarita: 92,
    },
    {
      nome: 'Santa Teresa d\'Avila',
      nomeCompleto: 'Teresa di Gesù',
      slug: 'santa-teresa-davila',
      dataFesta: '10-15',
      biografiaBreve: 'Mistica spagnola, Dottore della Chiesa, fondatrice dei Carmelitani Scalzi',
      patronoDi: ['Spagne', 'Carmelitani', 'Malattia', 'Filosofi'],
      titolo: 'Santa e Dottore della Chiesa',
      epoca: 'XVI secolo',
      popolarita: 90,
    },
    {
      nome: 'San Pietro Apostolo',
      nomeCompleto: 'Simone Pietro',
      slug: 'san-pietro-apostolo',
      dataFesta: '06-29',
      biografiaBreve: 'Primo Papa, fondatore della Chiesa, apostolo di Cristo',
      patronoDi: ['Pescatori', 'Papi', 'Roma', 'Pescatori'],
      titolo: 'Santo e Apostolo',
      epoca: 'I secolo',
      popolarita: 98,
    },
    {
      nome: 'San Paolo Apostolo',
      nomeCompleto: 'Saulo di Tarso',
      slug: 'san-paolo-apostolo',
      dataFesta: '06-29',
      biografiaBreve: 'Apostolo delle nazioni, evangelizzatore del mondo romano',
      patronoDi: ['Missionaries', 'Scrittori', 'Predicatori'],
      titolo: 'Santo e Apostolo',
      epoca: 'I secolo',
      popolarita: 96,
    },
    {
      nome: 'Santa Lucia',
      nomeCompleto: 'Lucia di Siracusa',
      slug: 'santa-lucia',
      dataFesta: '12-13',
      biografiaBreve: 'Martire siracusana, protettrice della vista',
      patronoDi: ['Vista', 'Ciechi', 'Siracusa', 'Elettricisti'],
      titolo: 'Santa e Martire',
      epoca: 'III secolo',
      popolarita: 93,
    },
    {
      nome: 'San Cristoforo',
      nomeCompleto: 'Cristoforo',
      slug: 'san-cristoforo',
      dataFesta: '07-25',
      biografiaBreve: 'Martire, patrono dei viaggiatori e degli autisti',
      patronoDi: ['Viaggiatori', 'Autisti', 'Trasportatori'],
      titolo: 'Santo e Martire',
      epoca: 'III secolo',
      popolarita: 85,
    },
    {
      nome: 'Santa Cecilia',
      nomeCompleto: 'Cecilia di Roma',
      slug: 'santa-cecilia',
      dataFesta: '11-22',
      biografiaBreve: 'Martire romana, patrona della musica e dei musicisti',
      patronoDi: ['Musica', 'Musicisti', 'Cantanti', 'Roma'],
      titolo: 'Santa e Martire',
      epoca: 'III secolo',
      popolarita: 87,
    },
    {
      nome: 'San Luca Evangelista',
      nomeCompleto: 'Luca',
      slug: 'san-luca-evangelista',
      dataFesta: '10-18',
      biografiaBreve: 'Evangelista e medico, autore del terzo Vangelo e degli Atti degli Apostoli',
      patronoDi: ['Medici', 'Artisti', 'Pittori', 'Evangelisti'],
      titolo: 'Santo ed Evangelista',
      epoca: 'I secolo',
      popolarita: 91,
    },
    {
      nome: 'Sant\'Anna',
      nomeCompleto: 'Anna, madre di Maria',
      slug: 'santanna',
      dataFesta: '07-26',
      biografiaBreve: 'Madre della Vergine Maria, nonna di Gesù',
      patronoDi: ['Nonne', 'Madri', 'Famiglia'],
      titolo: 'Santa',
      epoca: 'I secolo a.C.',
      popolarita: 82,
    },
    {
      nome: 'San Bartolomeo Apostolo',
      nomeCompleto: 'Bartolomeo',
      slug: 'san-bartolomeo-apostolo',
      dataFesta: '08-24',
      biografiaBreve: 'Uno dei dodici apostoli di Gesù Cristo',
      patronoDi: ['Conciatori', 'Macellai', 'Missionaries'],
      titolo: 'Santo e Apostolo',
      epoca: 'I secolo',
      popolarita: 78,
    },
    {
      nome: 'San Gerolamo',
      nomeCompleto: 'Girolamo di Stridon',
      slug: 'san-gerolamo',
      dataFesta: '09-30',
      biografiaBreve: 'Dottore della Chiesa, traduttore della Bibbia in Latino (Vulgata)',
      patronoDi: ['Traduttori', 'Studiosi', 'Bibliotecari'],
      titolo: 'Santo e Dottore della Chiesa',
      epoca: 'IV-V secolo',
      popolarita: 84,
    },
    {
      nome: 'Santa Chiara d\'Assisi',
      nomeCompleto: 'Chiara Offreduccio',
      slug: 'santa-chiara-assisi',
      dataFesta: '08-11',
      biografiaBreve: 'Fondatrice delle Clarisse, discepola di San Francesco',
      patronoDi: ['Televisione', 'Ricamatrici', 'Sorelle religiose'],
      titolo: 'Santa',
      epoca: 'XIII secolo',
      popolarita: 89,
    },
    {
      nome: 'San Benedetto da Norcia',
      nomeCompleto: 'Benedetto',
      slug: 'san-benedetto-norcia',
      dataFesta: '03-21',
      biografiaBreve: 'Fondatore dell\'Ordine Benedettino, patrono d\'Europa',
      patronoDi: ['Europa', 'Monaci', 'Studenti', 'Agricoltori'],
      titolo: 'Santo',
      epoca: 'V-VI secolo',
      popolarita: 90,
    },
  ];
}

// ─── MERGE & DEDUPLICATION ──────────────────────────────
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function mergeSaints(apiSaints, manualSaints) {
  const map = new Map();

  // Prima i dati manuali (hanno priorità perché più completi)
  for (const s of manualSaints) {
    const key = s.slug || slugify(s.nome);
    map.set(key, {
      nome: s.nome,
      nomeCompleto: s.nomeCompleto || null,
      slug: key,
      dataFesta: s.dataFesta,
      biografiaBreve: s.biografiaBreve || null,
      patronoDi: s.patronoDi || [],
      titolo: s.titolo || 'Santo',
      epoca: s.epoca || null,
      popolarita: s.popolarita || 50,
      sorgente: 'manuale',
    });
  }

  // Poi i dati API (solo se non esistono già)
  for (const s of apiSaints) {
    const key = slugify(s.nome);
    if (!map.has(key)) {
      map.set(key, {
        nome: s.nome,
        nomeCompleto: null,
        slug: key,
        dataFesta: s.dataFesta,
        biografiaBreve: s.citazione || null,
        patronoDi: [],
        titolo: s.tipo === 'Feast' ? 'Santo' : 'Santo',
        epoca: null,
        popolarita: 30,  // Default bassa, da incrementare
        sorgente: 'catholic-readings-api',
        wikipediaLink: s.wikipediaLink,
      });
    }
  }

  return Array.from(map.values());
}

// ─── MAIN ───────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  Verbum Lucis — Aggregazione Santi');
  console.log('═══════════════════════════════════════════\n');

  // 1. Fetch da catholic-readings-api
  const apiSaints = await fetchSaintsFromReadingsAPI();

  // 2. Carica santi manuali
  console.log('📄 Caricamento santi manuali...');
  const manualSaints = loadManualSaints();
  console.log(`  Santi manuali: ${manualSaints.length}\n`);

  // 3. Merge + deduplication
  console.log('🔀 Merge & deduplication...');
  const merged = mergeSaints(apiSaints, manualSaints);
  console.log(`  Totale santi unici: ${merged.length}\n`);

  // 4. Salva output
  const outputPath = './data/saints-aggregated.json';
  writeFileSync(outputPath, JSON.stringify(merged, null, 2));
  console.log(`💾 Salvato: ${outputPath}`);

  // 5. Stats
  const bySorgente = merged.reduce((acc, s) => {
    acc[s.sorgente] = (acc[s.sorgente] || 0) + 1;
    return acc;
  }, {});

  console.log('\n📊 Statistiche:');
  for (const [src, count] of Object.entries(bySorgente)) {
    console.log(`   ${src}: ${count} santi`);
  }

  console.log('\n💡 Prossimo passo:');
  console.log('   node scripts/sync-saints.js import data/saints-aggregated.json\n');
}

main().catch(console.error);
