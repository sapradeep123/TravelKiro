#!/bin/bash

# Setup Automated Backup Script
# This script sets up a cron job for automated database backups

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_SCRIPT="${SCRIPT_DIR}/backup-database.sh"
LOG_FILE="/var/log/travelkiro-backup.log"

echo -e "${BLUE}🔧 Setting up automated database backups...${NC}"
echo ""

# Check if backup script exists
if [ ! -f "${BACKUP_SCRIPT}" ]; then
    echo -e "${RED}❌ Error: Backup script not found at ${BACKUP_SCRIPT}${NC}"
    exit 1
fi

# Make sure backup script is executable
chmod +x "${BACKUP_SCRIPT}"

echo "Choose backup frequency:"
echo "1) Daily at 2 AM (recommended)"
echo "2) Every 6 hours"
echo "3) Every 12 hours"
echo "4) Custom (manual cron entry)"
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        CRON_SCHEDULE="0 2 * * *"
        ;;
    2)
        CRON_SCHEDULE="0 */6 * * *"
        ;;
    3)
        CRON_SCHEDULE="0 */12 * * *"
        ;;
    4)
        echo "Please add your custom cron entry manually:"
        echo "  crontab -e"
        echo "  Add: ${CRON_SCHEDULE} cd ${SCRIPT_DIR} && ${BACKUP_SCRIPT} >> ${LOG_FILE} 2>&1"
        exit 0
        ;;
    *)
        echo -e "${YELLOW}Invalid choice. Using daily at 2 AM.${NC}"
        CRON_SCHEDULE="0 2 * * *"
        ;;
esac

CRON_ENTRY="${CRON_SCHEDULE} cd ${SCRIPT_DIR} && ${BACKUP_SCRIPT} >> ${LOG_FILE} 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "backup-database.sh"; then
    echo -e "${YELLOW}⚠️  A backup cron job already exists.${NC}"
    read -p "Do you want to replace it? (yes/no): " REPLACE
    if [ "$REPLACE" = "yes" ]; then
        # Remove existing backup cron job
        crontab -l 2>/dev/null | grep -v "backup-database.sh" | crontab -
        echo -e "${GREEN}✅ Removed existing backup cron job.${NC}"
    else
        echo "Cancelled. Keeping existing cron job."
        exit 0
    fi
fi

# Add new cron job
(crontab -l 2>/dev/null; echo "${CRON_ENTRY}") | crontab -

echo -e "${GREEN}✅ Automated backup configured!${NC}"
echo ""
echo "Backup schedule: ${CRON_SCHEDULE}"
echo "Backup script: ${BACKUP_SCRIPT}"
echo "Log file: ${LOG_FILE}"
echo ""
echo "To view current cron jobs:"
echo "  crontab -l"
echo ""
echo "To remove the backup cron job:"
echo "  crontab -l | grep -v 'backup-database.sh' | crontab -"
echo ""
echo "To test backup manually:"
echo "  cd ${SCRIPT_DIR} && ./backup-database.sh"

