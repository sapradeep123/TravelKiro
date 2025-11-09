# Getting Started with Butterfliy Travel Encyclopedia

## Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Butterfliy_Kiro
   ```

2. **Setup Database**
   ```bash
   # Create PostgreSQL database
   psql -U postgres
   CREATE DATABASE travel_encyclopedia;
   \q
   
   # Run migrations
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

3. **Configure Environment**
   ```bash
   # Backend (.env in backend folder)
   DATABASE_URL="postgresql://postgres:password@localhost:5433/travel_encyclopedia"
   JWT_SECRET="your-secret-key"
   JWT_REFRESH_SECRET="your-refresh-secret"
   PORT=3000
   ```

4. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

5. **Start the Application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:8081
   - Backend API: http://localhost:3000

## Default Login Credentials

**Site Admin:**
- Email: admin@butterfliy.com
- Password: Admin@123

**Government Department:**
- Email: govt@butterfliy.com
- Password: Govt@123

**Tourist Guide:**
- Email: guide@butterfliy.com
- Password: Guide@123

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running on port 5433
- Check DATABASE_URL in backend/.env
- Verify database exists: `psql -U postgres -l`

### Frontend Not Loading
- Check if running on correct port (8081)
- Clear browser cache
- Restart the development server

### Prisma Client Errors
```bash
cd backend
npx prisma generate
npx prisma db push
```

## Next Steps
- See [API Documentation](./API_REFERENCE.md) for API details
- See [Features Guide](./FEATURES.md) for feature documentation
