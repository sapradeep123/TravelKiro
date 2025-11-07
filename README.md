# Travel Encyclopedia

A comprehensive cross-platform travel application built with React Native (Expo) and Node.js.

## Project Structure

```
├── backend/          # Node.js/Express API server
│   ├── src/         # Source code
│   └── prisma/      # Database schema and migrations
├── frontend/        # React Native (Expo) application
│   ├── app/         # Expo Router pages
│   └── src/         # Components, hooks, services
└── .kiro/           # Kiro specs and documentation
```

## Getting Started

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. Set up database:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start Expo:
   ```bash
   npm start
   ```

   - Press `w` for web
   - Press `a` for Android
   - Press `i` for iOS

## Technology Stack

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL with Prisma ORM
- JWT Authentication
- Socket.io for real-time chat

### Frontend
- React Native with Expo
- Expo Router for navigation
- React Native Paper for UI components
- NativeWind (Tailwind CSS)
- TypeScript

## Features

- Multi-role authentication (Admin, Govt Department, Tourist Guide, User)
- Location management with approval workflows
- Events and packages
- Hotels and accommodations
- Community social features
- Group travel with bidding system
- Travel booking integrations
- Real-time chat

## Development

- Backend runs on `http://localhost:3000`
- Frontend web runs on `http://localhost:8081` (Expo default)

## License

ISC
