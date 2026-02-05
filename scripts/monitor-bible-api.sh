#!/bin/bash

# Bible API Hourly Monitoring Script
# Checks BibleGet.io status every hour and auto-starts import when ready
# Usage: ./scripts/monitor-bible-api.sh &
# To stop: pkill -f monitor-bible-api.sh

LOG_FILE="/tmp/bible-api-monitor.log"
CHECK_INTERVAL=3600  # 1 hour in seconds
MAX_CHECKS=48        # Monitor for max 48 hours (2 days)
CHECK_COUNT=0

echo "================================" > "$LOG_FILE"
echo "🔍 Bible API Monitor Started" >> "$LOG_FILE"
echo "📅 $(date)" >> "$LOG_FILE"
echo "Check interval: Every 60 minutes (max 48 hours)" >> "$LOG_FILE"
echo "================================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

while [ $CHECK_COUNT -lt $MAX_CHECKS ]; do
  CHECK_COUNT=$((CHECK_COUNT + 1))
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

  echo "[$CHECK_COUNT/$MAX_CHECKS] $TIMESTAMP - Checking BibleGet.io API..." >> "$LOG_FILE"

  # Run the check
  if npm run check:bible-api >> "$LOG_FILE" 2>&1; then
    echo "" >> "$LOG_FILE"
    echo "✅ SUCCESS! BibleGet.io API is ready!" >> "$LOG_FILE"
    echo "📅 Recovery time: $TIMESTAMP" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    echo "🚀 Starting full Bible import now..." >> "$LOG_FILE"
    echo "   Command: npm run import:bible-verses" >> "$LOG_FILE"
    echo "   Estimated time: 45-60 minutes" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"

    # Start the import in background
    npm run import:bible-verses >> "$LOG_FILE" 2>&1
    IMPORT_STATUS=$?

    if [ $IMPORT_STATUS -eq 0 ]; then
      echo "✨ Import completed successfully!" >> "$LOG_FILE"
      echo "📊 Status: All 31,000+ verses imported" >> "$LOG_FILE"
      echo "📅 Completion time: $(date)" >> "$LOG_FILE"
    else
      echo "❌ Import failed with error code: $IMPORT_STATUS" >> "$LOG_FILE"
      echo "   Check the log for details" >> "$LOG_FILE"
    fi

    break
  else
    echo "⏸️  Still rate-limited. Will check again in 60 minutes..." >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
  fi

  # Wait before next check (except on last iteration)
  if [ $CHECK_COUNT -lt $MAX_CHECKS ]; then
    sleep $CHECK_INTERVAL
  fi
done

if [ $CHECK_COUNT -ge $MAX_CHECKS ]; then
  echo "" >> "$LOG_FILE"
  echo "⛔ Monitoring timeout reached (48 hours)" >> "$LOG_FILE"
  echo "   The API did not recover within the monitoring window" >> "$LOG_FILE"
  echo "   You may need to check manually or use an alternative approach" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
echo "================================" >> "$LOG_FILE"
echo "Monitor finished at $(date)" >> "$LOG_FILE"
echo "================================" >> "$LOG_FILE"
