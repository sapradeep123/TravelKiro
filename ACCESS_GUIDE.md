# How to Access the Travel Encyclopedia Application

## Current Status

✅ **Backend API is running** on `http://38.242.248.213:5500`

## Access Options

### 1. Backend API (Currently Running)

The backend API is accessible at:
- **Base URL**: `http://38.242.248.213:5500`
- **Root Endpoint**: `http://38.242.248.213:5500/` - Shows API information
- **Health Check**: `http://38.242.248.213:5500/health`
- **API Endpoints**: All routes are under `/api/*`

#### Available API Endpoints:
- `/api/auth` - Authentication (login, register, refresh token)
- `/api/users` - User management
- `/api/locations` - Tourist destinations
- `/api/events` - Events and festivals
- `/api/packages` - Travel packages
- `/api/accommodations` - Hotels, resorts, restaurants
- `/api/community` - Community features
- `/api/group-travel` - Group travel planning
- `/api/albums` - Photo albums
- `/api/messaging` - Messaging system
- `/uploads` - Uploaded media files

#### Test the API:
```bash
# Health check
curl http://38.242.248.213:5500/health

# Get locations
curl http://38.242.248.213:5500/api/locations

# Get API info
curl http://38.242.248.213:5500/
```

---

### 2. Web Frontend (Next.js) - Recommended for Web Access

To run the web frontend:

#### Step 1: Install Dependencies
```bash
cd /root/travel/TravelKiro/web-frontend
npm install
```

#### Step 2: Configure Environment
Create `.env.local` file:
```bash
cd /root/travel/TravelKiro/web-frontend
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://38.242.248.213:5500
EOF
```

#### Step 3: Build and Start
```bash
# Development mode
npm run dev

# Or production mode
npm run build
npm start
```

#### Step 4: Access
- **Development**: `http://38.242.248.213:3001` (or the port shown in terminal)
- **Production**: `http://38.242.248.213:3001`

**Note**: Make sure port 3001 is open in firewall:
```bash
sudo ufw allow 3001/tcp
```

---

### 3. React Native Frontend (Expo) - For Mobile/Web

To run the React Native frontend:

#### Step 1: Install Dependencies
```bash
cd /root/travel/TravelKiro/frontend
npm install
```

#### Step 2: Configure Environment
Create `.env` file:
```bash
cd /root/travel/TravelKiro/frontend
cat > .env << 'EOF'
EXPO_PUBLIC_API_URL=http://38.242.248.213:5500
EXPO_PUBLIC_WS_URL=ws://38.242.248.213:5500
EOF
```

#### Step 3: Start Expo
```bash
npm start
# or for web
npm run web
```

#### Step 4: Access
- **Web**: `http://localhost:8081` (or the port shown)
- **Mobile**: Use Expo Go app to scan QR code

---

## Quick Start Commands

### Start Web Frontend (Next.js)
```bash
cd /root/travel/TravelKiro/web-frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://38.242.248.213:5500" > .env.local
npm run dev
```

### Start React Native Frontend (Expo)
```bash
cd /root/travel/TravelKiro/frontend
npm install
echo "EXPO_PUBLIC_API_URL=http://38.242.248.213:5500" > .env
npm start
```

---

## Default Login Credentials

According to the README, you can use:
- **Admin**: `admin@butterfliy.com` / `Admin@123`
- **Government**: `govt@butterfliy.com` / `Govt@123`
- **Guide**: `guide@butterfliy.com` / `Guide@123`

---

## API Testing Examples

### Using curl:

```bash
# Health check
curl http://38.242.248.213:5500/health

# Get locations
curl http://38.242.248.213:5500/api/locations

# Login
curl -X POST http://38.242.248.213:5500/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@butterfliy.com","password":"Admin@123"}'

# Get locations (with auth token)
curl http://38.242.248.213:5500/api/locations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Browser:
- Open: `http://38.242.248.213:5500/` - See API information
- Open: `http://38.242.248.213:5500/health` - Check server status
- Open: `http://38.242.248.213:5500/api/locations` - View locations (if public)

---

## Troubleshooting

### Backend not accessible?
1. Check if server is running:
   ```bash
   netstat -tlnp | grep 5500
   ```

2. Check firewall:
   ```bash
   sudo ufw status
   sudo ufw allow 5500/tcp
   ```

3. Check server logs:
   ```bash
   # If running with npm
   cd /root/travel/TravelKiro/backend
   npm run dev
   ```

### Frontend can't connect to backend?
1. Verify backend is running: `http://38.242.248.213:5500/health`
2. Check CORS settings in `backend/.env`:
   ```
   CORS_ORIGIN="http://38.242.248.213:5500,http://38.242.248.213:3001,http://localhost:3001"
   ```
3. Restart backend after changing `.env`

---

## Current Setup Summary

✅ Backend API: `http://38.242.248.213:5500` (Running)
⏳ Web Frontend: Not started (needs setup)
⏳ React Native Frontend: Not started (needs setup)

To access the full application with a user interface, you need to start one of the frontends.

