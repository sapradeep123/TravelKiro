#!/bin/bash

# Database Restore Script for TravelKiro
# This script restores a PostgreSQL database from a backup file

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="travelkiro_db"
DB_USER="travelapp"
DB_HOST="localhost"
DB_PORT="5433"
BACKUP_DIR="${HOME}/travel-backups"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: No backup file specified!${NC}"
    echo ""
    echo "Usage: $0 <backup-file>"
    echo ""
    echo "Available backups:"
    if [ -d "${BACKUP_DIR}" ]; then
        ls -lh "${BACKUP_DIR}"/*.sql.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
    else
        echo "  No backup directory found at ${BACKUP_DIR}"
    fi
    echo ""
    echo "Example:"
    echo "  $0 ${BACKUP_DIR}/travelkiro_db_backup_20241227_120000.sql.gz"
    echo "  $0 travelkiro_db_backup_20241227_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

# If relative path, prepend backup directory
if [[ ! "$BACKUP_FILE" = /* ]]; then
    BACKUP_FILE="${BACKUP_DIR}/${BACKUP_FILE}"
fi

# Check if backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
    echo -e "${RED}❌ Error: Backup file not found: ${BACKUP_FILE}${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: This will REPLACE all data in the database!${NC}"
echo "Database: ${DB_NAME}"
echo "Backup file: ${BACKUP_FILE}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Restore cancelled.${NC}"
    exit 0
fi

echo -e "${BLUE}🔄 Starting database restore...${NC}"

# Create temporary file for SQL
TEMP_SQL="/tmp/travelkiro_restore_$(date +%s).sql"

# Decompress if needed
if [[ "${BACKUP_FILE}" == *.gz ]]; then
    echo "Decompressing backup file..."
    gunzip -c "${BACKUP_FILE}" > "${TEMP_SQL}"
else
    cp "${BACKUP_FILE}" "${TEMP_SQL}"
fi

# Drop existing database and recreate
echo "Dropping existing database (if exists)..."
PGPASSWORD="TravelKiro2024!" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres \
    -c "DROP DATABASE IF EXISTS ${DB_NAME};" 2>/dev/null || true

echo "Creating new database..."
PGPASSWORD="TravelKiro2024!" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres \
    -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"

# Restore from backup
echo "Restoring database from backup..."
PGPASSWORD="TravelKiro2024!" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" \
    -f "${TEMP_SQL}" > /dev/null

# Clean up temporary file
rm -f "${TEMP_SQL}"

echo -e "${GREEN}✅ Database restored successfully!${NC}"
echo ""
echo "Next steps:"
echo "  1. Run Prisma migrations if schema changed: npx prisma migrate deploy"
echo "  2. Regenerate Prisma client: npx prisma generate"
echo "  3. Verify data: Check the database using psql or Prisma Studio"

