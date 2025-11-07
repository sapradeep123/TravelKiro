# Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and update the DATABASE_URL with your PostgreSQL credentials:

```
DATABASE_URL="postgresql://username:password@localhost:5432/travel_encyclopedia?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-in-production"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:8081,http://localhost:19006"
```

### 3. Set Up Database

Generate Prisma client:
```bash
npm run prisma:generate
```

Run database migrations:
```bash
npm run prisma:migrate
```

Seed the database with sample data:
```bash
npm run seed
```

### 4. Start Backend Server

```bash
npm run dev
```

The backend will run on `http://localhost:3000`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create a `.env` file in the `frontend` directory:

```bash
cp .env.example .env
```

The default configuration should work:

```
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_WS_URL=http://localhost:3000
```

### 3. Start Frontend

```bash
npm start
```

Then:
- Press `w` to open in web browser
- Press `a` to open in Android emulator (requires Android Studio)
- Press `i` to open in iOS simulator (requires Xcode on macOS)
- Scan QR code with Expo Go app on your phone

## Test Credentials

After seeding the database, you can use these credentials:

- **Admin**: admin@travelencyclopedia.com / admin123
- **Govt Department**: tourism@kerala.gov.in / govt123
- **Tourist Guide**: guide@example.com / guide123
- **User**: user@example.com / user123

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/profile` - Get user profile (requires auth)
- `POST /api/auth/logout` - Logout (requires auth)

## Database Management

View database in Prisma Studio:
```bash
cd backend
npm run prisma:studio
```

This will open a web interface at `http://localhost:5555` where you can view and edit database records.

## Troubleshooting

### Database Connection Issues

If you get database connection errors:
1. Make sure PostgreSQL is running
2. Verify DATABASE_URL in `.env` is correct
3. Check that the database exists

### Port Already in Use

If port 3000 is already in use:
1. Change PORT in backend `.env`
2. Update EXPO_PUBLIC_API_URL in frontend `.env`

### Expo Issues

If Expo won't start:
1. Clear cache: `npx expo start -c`
2. Delete node_modules and reinstall: `rm -rf node_modules && npm install`
