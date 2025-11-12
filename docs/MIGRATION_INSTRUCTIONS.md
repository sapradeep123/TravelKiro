# Database Migration Instructions

## Overview
The package management enhancement feature requires database schema updates. Follow these steps to apply the changes.

## Prerequisites
- PostgreSQL database must be running
- Database connection string must be configured in `backend/.env`

## Migration Steps

### 1. Generate Prisma Client
```bash
cd backend
npx prisma generate
```

This will generate the TypeScript types for the updated schema.

### 2. Create and Apply Migration
```bash
npx prisma migrate dev --name package_management_enhancement
```

This will:
- Create a new migration file
- Apply the migration to your database
- Regenerate the Prisma client

### 3. Verify Migration
```bash
npx prisma studio
```

Open Prisma Studio to verify the schema changes:
- Package table should have: `isActive`, `isArchived`, `archivedAt`, `archivedBy`
- PackageCallbackRequest table should have: `status`, `notes`, `rescheduleDate`, `contactedAt`, `contactedBy`
- New CallbackStatusHistory table should exist
- CallbackStatus enum should have all 5 values

## Schema Changes Summary

### Package Model
- Added `isActive Boolean @default(true)` - Controls frontend visibility
- Added `isArchived Boolean @default(false)` - Soft delete flag
- Added `archivedAt DateTime?` - Timestamp when archived
- Added `archivedBy String?` - User who archived the package

### PackageCallbackRequest Model
- Changed `isContacted Boolean` to `status CallbackStatus @default(PENDING)`
- Added `notes String?` - Admin notes
- Added `rescheduleDate DateTime?` - Rescheduled callback date
- Added `contactedAt DateTime?` - When contacted
- Added `contactedBy String?` - Who contacted
- Added relation to `CallbackStatusHistory`

### New CallbackStatusHistory Model
```prisma
model CallbackStatusHistory {
  id                String         @id @default(uuid())
  callbackRequestId String
  status            CallbackStatus
  notes             String?
  changedBy         String
  createdAt         DateTime       @default(now())

  callbackRequest PackageCallbackRequest @relation(...)
  user            User                   @relation(...)
}
```

### Updated CallbackStatus Enum
```prisma
enum CallbackStatus {
  PENDING
  CONTACTED
  RESCHEDULED
  NOT_INTERESTED
  BOOKING_COMPLETED
}
```

## Troubleshooting

### Error: "Can't reach database server"
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env` file
- Verify database credentials

### Error: "Migration failed"
- Check if there's existing data that conflicts
- You may need to manually adjust the migration file
- Consider backing up your database first

### TypeScript Errors Persist
- Run `npx prisma generate` again
- Restart your TypeScript server
- Close and reopen your IDE

## Rollback (if needed)

If you need to rollback the migration:

```bash
# View migration history
npx prisma migrate status

# Rollback last migration
npx prisma migrate resolve --rolled-back <migration_name>
```

## Next Steps

After successful migration:
1. Restart your backend server
2. Test the new package management features
3. Verify all API endpoints work correctly
4. Check that TypeScript errors are resolved
