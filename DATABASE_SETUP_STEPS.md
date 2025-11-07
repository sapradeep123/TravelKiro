# 🗄️ Database Setup Steps

## Step 1: Create Database in PGAdmin

1. Open **PGAdmin**
2. Connect to your PostgreSQL server (username: `postgres`, password: `NewStrongPassword_2025!`)
3. Right-click on **"PostgreSQL 16"** (or your server name)
4. Select **"Query Tool"**
5. Copy and paste this SQL:

```sql
CREATE DATABASE travel_encyclopedia
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1;
```

6. Click **Execute** (or press F5)
7. You should see: `CREATE DATABASE` in the output
8. Refresh the database list - you'll see `travel_encyclopedia` database

---

## Step 2: Run Prisma Migrations

After creating the database, run these commands in your terminal:

```bash
cd backend
npx prisma migrate dev --name init
```

This will create all the database tables (users, locations, events, packages, etc.)

---

## Step 3: Seed the Database with Test Data

```bash
cd backend
npm run seed
```

This will create:
- 4 test user accounts
- 3 sample locations (Munnar, Alleppey, Jaipur)
- 1 event (Kerala Boat Race Festival)
- 1 package (Kerala Backwaters Experience)
- 2 accommodations
- 1 community post
- 1 group travel

---

## Step 4: Restart Backend Server

The backend server needs to be restarted to pick up the new database connection:

1. In the backend terminal, press **Ctrl+C** to stop
2. Run: `npm run dev`
3. You should see: `🚀 Server is running on port 3000`

---

## ✅ Verification

After completing all steps, you can verify in PGAdmin:

1. Expand `travel_encyclopedia` database
2. Expand `Schemas` → `public` → `Tables`
3. You should see tables like:
   - User
   - Profile
   - Location
   - Event
   - Package
   - Accommodation
   - CommunityPost
   - GroupTravel
   - And more...

---

## 🔐 Test Login Credentials

After seeding, you can login with:

- **Admin:** admin@travelencyclopedia.com / admin123
- **Govt Dept:** tourism@kerala.gov.in / govt123
- **Tourist Guide:** guide@example.com / guide123
- **User:** user@example.com / user123

---

## 🐛 Troubleshooting

### If migrations fail:
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### If seed fails:
- Make sure migrations completed successfully first
- Check that backend/.env has the correct DATABASE_URL

### To reset database (WARNING: deletes all data):
```bash
cd backend
npx prisma migrate reset
npm run seed
```
