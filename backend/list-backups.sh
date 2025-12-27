#!/bin/bash

# List Database Backups Script
# Shows all available database backups

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BACKUP_DIR="${HOME}/travel-backups"

echo -e "${BLUE}📦 Available Database Backups${NC}"
echo "Backup directory: ${BACKUP_DIR}"
echo ""

if [ ! -d "${BACKUP_DIR}" ]; then
    echo -e "${YELLOW}⚠️  Backup directory does not exist.${NC}"
    echo "Run backup-database.sh to create your first backup."
    exit 0
fi

BACKUP_COUNT=$(ls -1 "${BACKUP_DIR}"/*.sql.gz 2>/dev/null | wc -l)

if [ "${BACKUP_COUNT}" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No backups found.${NC}"
    echo "Run backup-database.sh to create your first backup."
    exit 0
fi

echo -e "${GREEN}Found ${BACKUP_COUNT} backup(s):${NC}"
echo ""
printf "%-50s %15s %20s\n" "Filename" "Size" "Date"
echo "----------------------------------------------------------------------------------------"

ls -lh "${BACKUP_DIR}"/*.sql.gz 2>/dev/null | while read -r line; do
    SIZE=$(echo "$line" | awk '{print $5}')
    FILENAME=$(echo "$line" | awk '{print $9}' | xargs basename)
    DATE=$(echo "$line" | awk '{print $6, $7, $8}')
    printf "%-50s %15s %20s\n" "$FILENAME" "$SIZE" "$DATE"
done

echo ""
echo -e "${BLUE}To restore a backup, use:${NC}"
echo "  ./restore-database.sh <backup-filename>"
echo ""
echo "Example:"
echo "  ./restore-database.sh travelkiro_db_backup_20241227_120000.sql.gz"

