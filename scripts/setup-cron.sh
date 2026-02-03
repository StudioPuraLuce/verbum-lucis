#!/bin/bash

# Script per configurare cron jobs automatici
# Esegui con: bash scripts/setup-cron.sh

echo "🔧 Configurazione Cron Jobs per Liturgia Cattolica"
echo ""

# Path del progetto (modifica se necessario)
PROJECT_PATH="/home/user/liturgia-cattolica"
NODE_PATH="/usr/bin/node"
NPM_PATH="/usr/bin/npm"

# Verifica che il path esista
if [ ! -d "$PROJECT_PATH" ]; then
    echo "❌ Errore: Directory progetto non trovata: $PROJECT_PATH"
    echo "   Modifica PROJECT_PATH nello script"
    exit 1
fi

echo "📁 Path progetto: $PROJECT_PATH"
echo "📦 Node: $NODE_PATH"
echo "📦 NPM: $NPM_PATH"
echo ""

# Crea file temporaneo per crontab
TEMP_CRON=$(mktemp)

# Leggi crontab esistente (se presente)
crontab -l > "$TEMP_CRON" 2>/dev/null || true

# Aggiungi jobs se non esistono già
echo "# Liturgia Cattolica - Auto-update" >> "$TEMP_CRON"

# 1. Aggiorna liturgia ogni giorno alle 00:01
if ! grep -q "update-liturgy" "$TEMP_CRON"; then
    echo "1 0 * * * cd $PROJECT_PATH && $NPM_PATH run update-liturgy >> $PROJECT_PATH/logs/liturgy-update.log 2>&1" >> "$TEMP_CRON"
    echo "✅ Aggiunto: Aggiornamento liturgia quotidiano (00:01)"
fi

# 2. Sincronizza santi ogni mese (1° del mese alle 02:00)
if ! grep -q "sync-saints" "$TEMP_CRON"; then
    echo "0 2 1 * * cd $PROJECT_PATH && $NPM_PATH run sync-saints >> $PROJECT_PATH/logs/saints-sync.log 2>&1" >> "$TEMP_CRON"
    echo "✅ Aggiunto: Sincronizzazione santi mensile (1° alle 02:00)"
fi

# 3. Backup database ogni settimana (domenica alle 03:00)
if ! grep -q "db-backup" "$TEMP_CRON"; then
    echo "0 3 * * 0 cd $PROJECT_PATH && $NPM_PATH run db:backup >> $PROJECT_PATH/logs/backup.log 2>&1" >> "$TEMP_CRON"
    echo "✅ Aggiunto: Backup database settimanale (domenica 03:00)"
fi

# Installa nuovo crontab
crontab "$TEMP_CRON"
rm "$TEMP_CRON"

echo ""
echo "✨ Cron jobs configurati con successo!"
echo ""
echo "📋 Jobs attivi:"
crontab -l | grep -v "^#" | grep -v "^$"
echo ""

# Crea directory logs se non esiste
mkdir -p "$PROJECT_PATH/logs"
echo "📁 Directory logs creata: $PROJECT_PATH/logs"

echo ""
echo "🔍 Verifica cron jobs:"
echo "   crontab -l"
echo ""
echo "📝 Visualizza logs:"
echo "   tail -f $PROJECT_PATH/logs/liturgy-update.log"
echo "   tail -f $PROJECT_PATH/logs/saints-sync.log"
echo ""
echo "✅ Setup completato!"
