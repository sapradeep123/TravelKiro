#!/bin/bash

# Database Backup Script for TravelKiro
# This script creates a backup of the PostgreSQL database

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="travelkiro_db"
DB_USER="travelapp"
DB_HOST="localhost"
DB_PORT="5433"
BACKUP_DIR="${HOME}/travel-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/travelkiro_db_backup_${TIMESTAMP}.sql"
KEEP_BACKUPS=7  # Keep last 7 backups

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo -e "${GREEN}🗄️  Starting database backup...${NC}"
echo "Database: ${DB_NAME}"
echo "Backup file: ${BACKUP_FILE}"

# Check if database exists
if ! PGPASSWORD="TravelKiro2024!" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres -c "\l" | grep -q "${DB_NAME}"; then
    echo -e "${RED}❌ Error: Database ${DB_NAME} does not exist!${NC}"
    exit 1
fi

# Create backup
echo "Creating backup..."
PGPASSWORD="TravelKiro2024!" pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    -F p \
    -f "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
    # Compress backup
    echo "Compressing backup..."
    gzip "${BACKUP_FILE}"
    BACKUP_FILE="${BACKUP_FILE}.gz"
    
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo -e "${GREEN}✅ Backup created successfully!${NC}"
    echo "Backup file: ${BACKUP_FILE}"
    echo "Backup size: ${BACKUP_SIZE}"
    
    # Clean up old backups (keep last N backups)
    echo "Cleaning up old backups (keeping last ${KEEP_BACKUPS})..."
    cd "${BACKUP_DIR}"
    ls -t travelkiro_db_backup_*.sql.gz | tail -n +$((KEEP_BACKUPS + 1)) | xargs -r rm -f
    
    echo -e "${GREEN}✅ Backup process completed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Error: Backup failed!${NC}"
    exit 1
fi

