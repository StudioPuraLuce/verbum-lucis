/**
 * Genera Pagina Sacra per oggi se non esiste già
 * Esegui: node scripts/generate-daily-pagina-sacra.js
 * 
 * Cron: 0 0 * * * (ogni giorno a mezzanotte)
 */

const SITE_URL = process.env.SITE_URL || 'http://localhost:4321';

async function generatePaginaSacra() {
  console.log('═══════════════════════════════════════════');
  console.log('  Verbum Lucis — Generazione Pagina Sacra');
  console.log('═══════════════════════════════════════════\n');

  const oggi = new Date().toISOString().split('T')[0];
  console.log(`📅 Data: ${oggi}\n`);

  try {
    console.log('🔄 Chiamata API per generazione...');
    
    const response = await fetch(`${SITE_URL}/api/generate-pagina-sacra`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: oggi }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API error: ${error.error || response.statusText}`);
    }

    const result = await response.json();

    if (result.cached) {
      console.log('✅ Pagina Sacra già esistente (cached)');
    } else {
      console.log('✅ Pagina Sacra generata con successo!');
      console.log(`   ID: ${result.paginaSacra.id}`);
      console.log(`   Liturgia: ${result.paginaSacra.liturgyId}`);
    }

    console.log('\n═══════════════════════════════════════════');
    console.log('  ✨ Completato');
    console.log('═══════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Errore durante la generazione:');
    console.error(error);
    process.exit(1);
  }
}

generatePaginaSacra(); ##################### da completare ##############
