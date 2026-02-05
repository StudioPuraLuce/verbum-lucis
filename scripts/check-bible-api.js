#!/usr/bin/env node

/**
 * Quick BibleGet.io API Health Check
 *
 * Usage:
 *   npm run check:bible-api    # Check if API is ready
 *   chmod +x ./scripts/check-bible-api.js && ./scripts/check-bible-api.js
 *
 * Returns exit code:
 *   0 = API is ready for import
 *   1 = API is rate-limited or unavailable
 */

const API_BASE = 'https://query.bibleget.io/';
const APP_ID = 'verbum-lucis';
const BIBLE_VERSION = 'LUZZI';

async function checkAPI() {
  console.log('\n🔍 Checking BibleGet.io API...\n');

  try {
    const url = `${API_BASE}?query=Gv1,1&return=json&appid=${APP_ID}&version=${BIBLE_VERSION}`;
    const response = await fetch(url);
    const data = await response.json();

    // Check for errors in the errors array (BibleGet.io format)
    if (data.errors && data.errors.length > 0) {
      const errorCode = data.errors[0].errNum;
      const errorMsg = data.errors[0].errMessage;

      if (errorCode === 12) {
        console.log('⛔ API is rate-limited (error 12)');
        console.log(`   Message: ${errorMsg}`);
        console.log('   ⏳ Please wait 30-60 minutes and check again\n');
        process.exit(1);
      }

      console.log(`⛔ API error ${errorCode}: ${errorMsg}\n`);
      process.exit(1);
    }

    if (data.results && data.results.length > 0) {
      console.log('✅ API is healthy and ready for import!\n');
      console.log('   Verse fetched successfully: Giovanni 1:1');
      console.log('   Next step: npm run import:bible-verses\n');
      process.exit(0);
    }

    // Empty results but no errors
    console.log('⚠️  API responded with no data\n');
    process.exit(1);
  } catch (error) {
    console.error('❌ Could not reach BibleGet.io API:', error.message);
    console.error('   Check your internet connection\n');
    process.exit(1);
  }
}

checkAPI();
