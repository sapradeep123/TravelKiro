# Database Backup and Recovery Guide

This document explains how to backup and restore the TravelKiro database.

## 📦 Backup Scripts

Three scripts are available for database management:

1. **`backup-database.sh`** - Creates a backup of the database
2. **`restore-database.sh`** - Restores database from a backup
3. **`list-backups.sh`** - Lists all available backups

## 🔄 Creating a Backup

### Manual Backup

```bash
cd backend
./backup-database.sh
```

The script will:
- Create a compressed SQL backup file
- Save it to `~/travel-backups/`
- Automatically keep only the last 7 backups
- Show backup file location and size

### Automated Backups (Recommended)

To set up automatic daily backups, add a cron job:

```bash
# Edit crontab
crontab -e

# Add this line to backup daily at 2 AM
0 2 * * * cd /root/travel/TravelKiro/backend && ./backup-database.sh >> /var/log/travelkiro-backup.log 2>&1
```

Or for hourly backups during business hours:

```bash
# Backup every 6 hours
0 */6 * * * cd /root/travel/TravelKiro/backend && ./backup-database.sh >> /var/log/travelkiro-backup.log 2>&1
```

## 📋 Listing Backups

To see all available backups:

```bash
cd backend
./list-backups.sh
```

This will show:
- Backup filename
- File size
- Creation date/time

## 🔧 Restoring from Backup

### Step 1: List Available Backups

```bash
cd backend
./list-backups.sh
```

### Step 2: Restore the Database

```bash
./restore-database.sh travelkiro_db_backup_20241227_120000.sql.gz
```

Or with full path:

```bash
./restore-database.sh ~/travel-backups/travelkiro_db_backup_20241227_120000.sql.gz
```

**⚠️ WARNING**: This will **DELETE** all existing data and replace it with the backup data!

### Step 3: After Restore

After restoring, you should:

1. Run Prisma migrations (if schema changed):
   ```bash
   npx prisma migrate deploy
   ```

2. Regenerate Prisma client:
   ```bash
   npx prisma generate
   ```

3. Verify the data:
   ```bash
   npx prisma studio
   ```

## 📁 Backup Storage

- **Location**: `~/travel-backups/`
- **Format**: Compressed SQL files (`.sql.gz`)
- **Naming**: `travelkiro_db_backup_YYYYMMDD_HHMMSS.sql.gz`
- **Retention**: Last 7 backups are kept automatically

## 🔒 Backup Configuration

The backup script uses the following settings (defined in `backup-database.sh`):

- **Database**: `travelkiro_db`
- **User**: `travelapp`
- **Host**: `localhost`
- **Port**: `5433`
- **Retention**: 7 backups

To change these settings, edit the configuration variables at the top of `backup-database.sh`.

## 📊 Backup Contents

The backup includes:
- All database tables and data
- Table structure (schema)
- Indexes and constraints
- Does NOT include:
  - Database owner information (for portability)
  - Privileges/permissions (for security)

## 🚨 Emergency Recovery

### Scenario: Database Corruption or Data Loss

1. **Stop the application**:
   ```bash
   pm2 stop travel-backend
   # or
   pkill -f "tsx watch src/index.ts"
   ```

2. **List available backups**:
   ```bash
   cd backend
   ./list-backups.sh
   ```

3. **Restore from most recent backup**:
   ```bash
   ./restore-database.sh <latest-backup-file>
   ```

4. **Run migrations and regenerate Prisma client**:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

5. **Restart the application**:
   ```bash
   pm2 start travel-backend
   # or
   cd backend && npm run dev
   ```

## 🔍 Verifying Backups

To verify a backup file is valid:

```bash
# Decompress and check structure
gunzip -c ~/travel-backups/travelkiro_db_backup_*.sql.gz | head -50

# Or test restore to a test database
createdb test_restore_db
gunzip -c ~/travel-backups/travelkiro_db_backup_*.sql.gz | psql test_restore_db
dropdb test_restore_db
```

## 📝 Best Practices

1. **Regular Backups**: Set up automated daily backups
2. **Test Restores**: Periodically test restore process on a test database
3. **Off-Site Storage**: Consider copying backups to remote storage (AWS S3, etc.)
4. **Monitor Disk Space**: Ensure backup directory has sufficient space
5. **Document**: Keep track of when backups are taken and tested
6. **Version Control**: Backup before major schema changes

## 🔄 Backup Before Major Changes

Always create a backup before:
- Running migrations
- Major data updates
- Schema changes
- System updates

```bash
cd backend
./backup-database.sh
# Proceed with your changes
```

## 📞 Troubleshooting

### Backup Fails

- Check database connection: `psql -h localhost -p 5433 -U travelapp -d travelkiro_db`
- Verify disk space: `df -h ~/travel-backups`
- Check permissions: `ls -la ~/travel-backups`

### Restore Fails

- Verify backup file is not corrupted: `gunzip -t <backup-file>`
- Check database connection
- Ensure sufficient disk space
- Check PostgreSQL logs: `/var/log/postgresql/` (location may vary)

### No Backups Available

If no backups exist:
1. Create an immediate backup: `./backup-database.sh`
2. Review your cron jobs: `crontab -l`
3. Check backup logs: `/var/log/travelkiro-backup.log`

## 🔗 Related Files

- `backend/backup-database.sh` - Backup script
- `backend/restore-database.sh` - Restore script
- `backend/list-backups.sh` - List backups script
- `backend/src/utils/seed.ts` - Seed script (for initial data)
- `backend/prisma/migrations/` - Database migrations

