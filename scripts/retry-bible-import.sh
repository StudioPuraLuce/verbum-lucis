#!/bin/bash

# Bible Import Retry Script with Auto-execution
# Waits 60 minutes for API rate limit reset, then retries demo import and full import
# Usage: ./scripts/retry-bible-import.sh &
# Check progress: tail -f /tmp/bible-import.log

LOG_FILE="/tmp/bible-import.log"

echo "================================" > "$LOG_FILE"
echo "🕐 Bible Import Retry Script Started" >> "$LOG_FILE"
echo "📅 $(date)" >> "$LOG_FILE"
echo "================================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

echo "⏳ Waiting 60 minutes for BibleGet.io API rate limit reset..." >> "$LOG_FILE"
echo "   You can close your laptop now. Progress will be logged to: $LOG_FILE" >> "$LOG_FILE"

# Wait 60 minutes (3600 seconds)
sleep 3600

echo "" >> "$LOG_FILE"
echo "⏰ 60 minutes elapsed. Attempting demo import..." >> "$LOG_FILE"
echo "$(date)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Run demo import
npm run import:bible-demo >> "$LOG_FILE" 2>&1
DEMO_STATUS=$?

if [ $DEMO_STATUS -eq 0 ]; then
  echo "" >> "$LOG_FILE"
  echo "✅ Demo import succeeded!" >> "$LOG_FILE"
  echo "🚀 Starting full Bible verse import (31,000+ verses)..." >> "$LOG_FILE"
  echo "   This will take 45-60 minutes..." >> "$LOG_FILE"
  echo "$(date)" >> "$LOG_FILE"
  echo "" >> "$LOG_FILE"

  # Run full import
  npm run import:bible-verses >> "$LOG_FILE" 2>&1
  FULL_STATUS=$?

  echo "" >> "$LOG_FILE"
  if [ $FULL_STATUS -eq 0 ]; then
    echo "✨ SUCCESS! Full Bible import completed!" >> "$LOG_FILE"
    echo "📊 Status: All 31,000+ verses imported successfully" >> "$LOG_FILE"
    echo "$(date)" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    echo "Next steps:" >> "$LOG_FILE"
    echo "  1. Commit the changes: git add . && git commit -m 'Phase 4: Full Bible Import Complete'" >> "$LOG_FILE"
    echo "  2. Start Phase 5: Cross-Reference Integration" >> "$LOG_FILE"
  else
    echo "❌ FAILED! Full Bible import encountered errors." >> "$LOG_FILE"
    echo "   Check the log above for details." >> "$LOG_FILE"
    echo "$(date)" >> "$LOG_FILE"
  fi
else
  echo "❌ FAILED! Demo import encountered errors." >> "$LOG_FILE"
  echo "   API might still be rate-limited. Check log for details:" >> "$LOG_FILE"
  echo "   tail -f $LOG_FILE" >> "$LOG_FILE"
  echo "$(date)" >> "$LOG_FILE"
  exit 1
fi

echo "" >> "$LOG_FILE"
echo "================================" >> "$LOG_FILE"
echo "Script finished at $(date)" >> "$LOG_FILE"
echo "================================" >> "$LOG_FILE"
