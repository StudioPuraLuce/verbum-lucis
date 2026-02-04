/**
 * Migration: Populate catechism table with theme tags
 *
 * Maps CCC paragraph ranges to the 25+ catechism themes
 * Thematic groupings based on CCC structure and content
 *
 * Usage: npm run migrate:theme-tags
 */

import { db } from '../src/db.ts';
import { catechism } from '../db/schema.ts';
import { sql } from 'drizzle-orm';

// Theme mappings: theme slug → array of CCC paragraph numbers or ranges
// These 25 themes match exactly with temi.astro
const THEME_MAPPINGS = {
  // PART I: The Creed (1-1065)
  'trinita': [
    [198, 231],    // God and the Trinity
  ],

  'incarnazione': [
    [456, 570],    // Why the Word Became Flesh + Incarnation
  ],

  'redenzione': [
    [571, 637],    // Jesus Christ's Mysteries + Ascension
    [683, 708],    // Easter and Session at Right Hand
  ],

  'peccato-originale': [
    [385, 421],    // Original Sin
  ],

  'resurrezione': [
    [638, 658],    // Jesus' Resurrection
    [988, 1019],   // The General Resurrection of the Dead
  ],

  // PART II: The Sacraments (1066-1690)
  'battesimo': [
    [1213, 1284],  // Baptism
  ],

  'confessione': [
    [1420, 1498],  // The Sacrament of Penance and Reconciliation
  ],

  'matrimonio': [
    [1601, 1666],  // The Sacrament of Matrimony
  ],

  'ordinamento': [
    [1533, 1600],  // The Sacrament of Holy Orders
  ],

  'grazia-giustificazione': [
    [1691, 1758],  // Human Dignity (includes grace and justification)
    [1987, 2051],  // Section: Life in the Spirit (Grace)
  ],

  'eucarestia': [
    [1322, 1419],  // The Sacrament of the Eucharist
  ],

  // PART III: Life in Christ (1691-2557)
  'carità': [
    [1822, 1829],  // Charity
  ],

  'speranza': [
    [1817, 1821],  // Hope
  ],

  'fede': [
    [1814, 1829],  // Faith
  ],

  'comandamenti': [
    [2052, 2082],  // The Decalogue (The Ten Commandments)
  ],

  'peccato': [
    [1850, 1948],  // Sin and Temptation
  ],

  'virtù-cristiane': [
    [1803, 1948],  // The Virtues (Cardinal and Theological)
  ],

  // PART IV: Christian Prayer (2558-2865)
  'preghiera': [
    [2558, 2649],  // Prayer in the Christian Life
  ],

  'padre-nostro': [
    [2773, 2854],  // The Lord's Prayer (Our Father)
  ],

  'ave-maria': [
    [2676, 2701],  // The Hail Mary
  ],

  'rosario': [
    [2678, 2687],  // The Rosary
  ],

  'maria-santissima': [
    [490, 511],    // Part I: Mary in Christ's Mystery
    [2617, 2679],  // Part IV: Mary, Mother of Jesus
  ],

  'chiesa-cattolica': [
    [748, 870],    // The Church (her nature, constitution, and local/universal)
  ],

  'inferno-paradiso-purgatorio': [
    [1020, 1065],  // Heaven, Purgatory, Hell
  ],

  'angeli': [
    [325, 336],    // Part I: Angels
    [1034, 1051],  // Part IV: Particular Judgment
  ],

  'comunione-santi': [
    [946, 962],    // The Communion of Saints
  ],
};

// Helper: Expand ranges into individual numbers
function expandRanges(ranges) {
  const numbers = [];
  for (const range of ranges) {
    if (Array.isArray(range)) {
      const [start, end] = range;
      for (let i = start; i <= end; i++) {
        numbers.push(i);
      }
    } else {
      numbers.push(range);
    }
  }
  return numbers;
}

async function migrateThemeTags() {
  console.log('🔄 Starting theme tag migration...\n');

  let successCount = 0;
  let errorCount = 0;

  try {
    // Process each theme
    for (const [themeSlug, ranges] of Object.entries(THEME_MAPPINGS)) {
      const cccNumbers = expandRanges(ranges);
      console.log(`📌 Theme: ${themeSlug} (${cccNumbers.length} paragraphs)`);

      for (const numero of cccNumbers) {
        try {
          // Check if paragraph exists
          const existing = await db
            .select()
            .from(catechism)
            .where((t) => t.numero === numero);

          if (existing.length === 0) {
            console.log(`   ⚠️  CCC ${numero} not found in database (skipped)`);
            continue;
          }

          // Get current tags
          const paragraph = existing[0];
          const currentTags = paragraph.tags || [];

          // Add theme tag if not already present
          if (!currentTags.includes(themeSlug)) {
            const updatedTags = [...currentTags, themeSlug];

            await db
              .updateTable(catechism)
              .set({ tags: updatedTags })
              .where((t) => t.numero === numero)
              .execute();

            successCount++;
          }
        } catch (err) {
          console.error(`   ❌ Error updating CCC ${numero}: ${err.message}`);
          errorCount++;
        }
      }

      console.log(`   ✅ ${themeSlug}: completed\n`);
    }

    console.log('━'.repeat(60));
    console.log(`✨ Migration complete!`);
    console.log(`   ✅ Successfully updated: ${successCount} paragraphs`);
    console.log(`   ⚠️  Errors: ${errorCount}`);
    console.log('━'.repeat(60));

  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

// Run migration
migrateThemeTags().then(() => {
  process.exit(0);
});
