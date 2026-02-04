/**
 * Verification: Check theme tag population in catechism table
 *
 * Displays statistics about theme coverage
 * Usage: npm run verify:theme-tags
 */

import { db } from '../src/db.ts';
import { catechism } from '../db/schema.ts';
import { sql } from 'drizzle-orm';

// Expected themes (matches temi.astro)
const EXPECTED_THEMES = [
  'trinita', 'incarnazione', 'redenzione', 'peccato-originale', 'resurrezione',
  'battesimo', 'confessione', 'matrimonio', 'ordinamento', 'grazia-giustificazione',
  'eucarestia',
  'carità', 'speranza', 'fede', 'comandamenti', 'peccato', 'virtù-cristiane',
  'preghiera', 'padre-nostro', 'ave-maria', 'rosario', 'maria-santissima',
  'chiesa-cattolica', 'inferno-paradiso-purgatorio', 'angeli', 'comunione-santi'
];

async function verifyThemeTags() {
  console.log('🔍 Verifying theme tag population...\n');

  try {
    const allCatechism = await db
      .select()
      .from(catechism)
      .orderBy((t) => t.numero);

    console.log(`📊 Total CCC paragraphs: ${allCatechism.length}`);
    console.log('━'.repeat(60));

    const themeStats = {};
    let paragraphsWithTags = 0;
    let paragraphsWithoutTags = 0;

    // Collect statistics
    for (const paragraph of allCatechism) {
      const tags = paragraph.tags || [];

      if (tags.length > 0) {
        paragraphsWithTags++;
        for (const tag of tags) {
          if (!themeStats[tag]) {
            themeStats[tag] = 0;
          }
          themeStats[tag]++;
        }
      } else {
        paragraphsWithoutTags++;
      }
    }

    // Display by theme
    console.log('\n✅ Themes with coverage:\n');
    for (const theme of EXPECTED_THEMES) {
      if (themeStats[theme]) {
        const count = themeStats[theme];
        const percentage = ((count / allCatechism.length) * 100).toFixed(1);
        console.log(`   ${theme.padEnd(30)} ${String(count).padStart(4)} paragraphs (${percentage}%)`);
      }
    }

    // Missing themes
    const missingThemes = EXPECTED_THEMES.filter(t => !themeStats[t]);
    if (missingThemes.length > 0) {
      console.log('\n⚠️  Missing themes:\n');
      for (const theme of missingThemes) {
        console.log(`   ${theme}`);
      }
    }

    // Summary
    console.log('\n' + '━'.repeat(60));
    console.log(`\n📈 Summary:`);
    console.log(`   Total paragraphs: ${allCatechism.length}`);
    console.log(`   With tags: ${paragraphsWithTags} (${((paragraphsWithTags / allCatechism.length) * 100).toFixed(1)}%)`);
    console.log(`   Without tags: ${paragraphsWithoutTags} (${((paragraphsWithoutTags / allCatechism.length) * 100).toFixed(1)}%)`);
    console.log(`   Unique themes: ${Object.keys(themeStats).length} / ${EXPECTED_THEMES.length}`);

    if (paragraphsWithTags > 0) {
      console.log('\n✅ Theme migration appears successful!');
    } else {
      console.log('\n⚠️  No theme tags found. Run migration with: npm run migrate:theme-tags');
    }

  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  }
}

verifyThemeTags().then(() => {
  process.exit(0);
});
