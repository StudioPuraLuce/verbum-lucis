/**
 * Scrape Catechismo della Chiesa Cattolica in italiano
 * Fonte: vatican.va/archive/catechism_it/
 *
 * Esegui: npx tsx scripts/scrape-catechism-it.js
 */
import { writeFileSync } from 'fs';

const BASE_URL = 'https://www.vatican.va/archive/catechism_it/';

const PAGES = [
  'prologue_it.htm',
  'p1s1c1_it.htm', 'p1s1c2a1_it.htm', 'p1s1c2a2_it.htm', 'p1s1c2a3_it.htm',
  'p1s1c3a1_it.htm', 'p1s1c3a2_it.htm',
  'p1s2_it.htm', 'p1s2c1p1_it.htm', 'p1s2c1p2_it.htm', 'p1s2c1p3_it.htm',
  'p1s2c1p4_it.htm', 'p1s2c1p5_it.htm', 'p1s2c1p6_it.htm', 'p1s2c1p7_it.htm',
  'p1s2c2_it.htm', 'p1s2c2a2_it.htm',
  'p122a3p1_it.htm', 'p122a3p2_it.htm', 'p122a3p3_it.htm',
  'p122a4p1_it.htm', 'p122a4p2_it.htm', 'p122a4p3_it.htm',
  'p122a5p1_it.htm', 'p122a5p2_it.htm',
  'p1s2c2a6_it.htm', 'p1s2c2a7_it.htm',
  'p1s2c3_it.htm', 'p1s2c3a8_it.htm', 'p1s2c3a9_it.htm',
  'p123a9p1_it.htm', 'p123a9p2_it.htm', 'p123a9p3_it.htm',
  'p123a9p4_it.htm', 'p123a9p5_it.htm', 'p123a9p6_it.htm',
  'p123a10_it.htm', 'p123a11_it.htm', 'p123a12_it.htm',
  'p2_it.htm', 'p2s1_it.htm',
  'p2s1c1a1_it.htm', 'p2s1c1a2_it.htm',
  'p2s1c2_it.htm', 'p2s1c2a1_it.htm', 'p2s1c2a2_it.htm',
  'p2s2_it.htm', 'p2s2c1_it.htm',
  'p2s2c1a1_it.htm', 'p2s2c1a2_it.htm', 'p2s2c1a3_it.htm',
  'p2s2c2_it.htm', 'p2s2c2a4_it.htm', 'p2s2c2a5_it.htm',
  'p2s2c3_it.htm', 'p2s2c3a6_it.htm', 'p2s2c3a7_it.htm',
  'p2s2c4a1_it.htm', 'p2s2c4a2_it.htm',
  'p3_it.htm', 'p3s1_it.htm', 'p3s1c1_it.htm',
  'p3s1c1a1_it.htm', 'p3s1c1a2_it.htm', 'p3s1c1a3_it.htm',
  'p3s1c1a4_it.htm', 'p3s1c1a5_it.htm', 'p3s1c1a6_it.htm',
  'p3s1c1a7_it.htm', 'p3s1c1a8_it.htm',
  'p3s1c2_it.htm', 'p3s1c2a1_it.htm', 'p3s1c2a2_it.htm', 'p3s1c2a3_it.htm',
  'p3s1c3_it.htm', 'p3s1c3a1_it.htm', 'p3s1c3a2_it.htm', 'p3s1c3a3_it.htm',
  'p3s2_it.htm', 'p3s2c1_it.htm',
  'p3s2c1a1_it.htm', 'p3s2c1a2_it.htm', 'p3s2c1a3_it.htm',
  'p3s2c2_it.htm',
  'p3s2c2a4_it.htm', 'p3s2c2a5_it.htm', 'p3s2c2a6_it.htm',
  'p3s2c2a7_it.htm', 'p3s2c2a8_it.htm', 'p3s2c2a9_it.htm', 'p3s2c2a0_it.htm',
  'p4s1_it.htm', 'p4s1c1_it.htm',
  'p4s1c1a1_it.htm', 'p4s1c1a2_it.htm', 'p4s1c1a3_it.htm',
  'p4s1c2_it.htm', 'p4s1c2a1_it.htm', 'p4s1c2a2_it.htm', 'p4s1c2a3_it.htm',
  'p4s1c3_it.htm', 'p4s1c3a1_it.htm', 'p4s1c3a2_it.htm',
  'p4s2_it.htm', 'p4s2a1_it.htm', 'p4s2a2_it.htm', 'p4s2a3_it.htm', 'p4s2a4_it.htm',
];

/**
 * Fetch and parse a single catechism page
 */
async function fetchPage(filename) {
  const url = `${BASE_URL}${filename}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'VerbumLucis/1.0 (Catholic education project)',
        'Accept': 'text/html',
      },
    });
    if (!res.ok) {
      console.error(`  ❌ ${filename}: ${res.status}`);
      return '';
    }
    return await res.text();
  } catch (e) {
    console.error(`  ❌ ${filename}: ${e.message}`);
    return '';
  }
}

/**
 * Extract numbered paragraphs from HTML content
 */
function extractParagraphs(html) {
  const paragraphs = [];

  // Remove HTML tags but keep structure
  let text = html
    // Remove script/style
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // Convert <br> to newline
    .replace(/<br\s*\/?>/gi, '\n')
    // Convert <p> to double newline
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<p[^>]*>/gi, '')
    // Remove all other HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&laquo;/g, '\u00AB')
    .replace(/&raquo;/g, '\u00BB')
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&rdquo;/g, '\u201D')
    .replace(/&egrave;/g, '\u00E8')
    .replace(/&agrave;/g, '\u00E0')
    .replace(/&ograve;/g, '\u00F2')
    .replace(/&ugrave;/g, '\u00F9')
    .replace(/&igrave;/g, '\u00EC')
    .replace(/&eacute;/g, '\u00E9')
    .replace(/&Egrave;/g, '\u00C8')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    // Normalize whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n');

  // Match numbered paragraphs: a number (1-2865) at the start of a line or after double newline
  const regex = /(?:^|\n\n?\s*)(\d{1,4})\s+(.+?)(?=\n\n?\s*\d{1,4}\s|\n\n?\s*$|$)/gs;

  let match;
  while ((match = regex.exec(text)) !== null) {
    const num = parseInt(match[1]);
    if (num >= 1 && num <= 2865) {
      let paraText = match[2].trim()
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (paraText.length > 10) { // Skip very short matches (likely noise)
        paragraphs.push({ id: num, text: paraText });
      }
    }
  }

  return paragraphs;
}

async function main() {
  console.log('📖 Scraping Catechismo della Chiesa Cattolica (italiano)...\n');
  console.log(`📄 Pagine da elaborare: ${PAGES.length}\n`);

  const allParagraphs = new Map();

  for (let i = 0; i < PAGES.length; i++) {
    const page = PAGES[i];
    console.log(`  📥 [${i + 1}/${PAGES.length}] ${page}...`);

    const html = await fetchPage(page);
    if (!html) continue;

    const paragraphs = extractParagraphs(html);
    for (const p of paragraphs) {
      if (!allParagraphs.has(p.id)) {
        allParagraphs.set(p.id, p.text);
      }
    }

    console.log(`     → ${paragraphs.length} paragrafi trovati`);

    // Pausa per non sovraccaricare il server del Vaticano
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Ordina per numero
  const sorted = Array.from(allParagraphs.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([id, text]) => ({ id, text }));

  console.log(`\n📊 Totale paragrafi estratti: ${sorted.length}`);

  // Verifica copertura
  const missing = [];
  for (let i = 1; i <= 2865; i++) {
    if (!allParagraphs.has(i)) missing.push(i);
  }
  if (missing.length > 0) {
    console.log(`⚠️  Paragrafi mancanti: ${missing.length}`);
    console.log(`   Primi mancanti: ${missing.slice(0, 20).join(', ')}...`);
  }

  // Salva JSON
  const outputPath = './data/catechismo-it.json';
  writeFileSync(outputPath, JSON.stringify(sorted, null, 2));
  console.log(`\n💾 Salvato in ${outputPath}`);
  console.log('✨ Scraping completato!\n');
}

main().catch(console.error);
