# Frontend Access Information

## ✅ Gradient Purple Frontend is Now Running!

The correct frontend UI (React Native/Expo with gradient purple background) is now accessible.

## Access URLs

### Frontend (Gradient Purple UI)
- **URL**: `http://38.242.248.213:8082`
- **Login Page**: `http://38.242.248.213:8082/login`
- **Status**: ✅ Running

### Backend API
- **URL**: `http://38.242.248.213:5500`
- **Health Check**: `http://38.242.248.213:5500/health`
- **Status**: ✅ Running

## Frontend Features

The frontend includes:
- ✅ Gradient purple/blue background
- ✅ "Welcome Back" login screen
- ✅ "Sign in to explore the world" subtitle
- ✅ Globe icon logo
- ✅ Connected to backend API on port 5500

## Configuration

### Frontend Configuration
- **Location**: `/root/travel/TravelKiro/frontend/.env`
- **API URL**: `http://38.242.248.213:5500`
- **WebSocket URL**: `ws://38.242.248.213:5500`

### Backend Configuration
- **Location**: `/root/travel/TravelKiro/backend/.env`
- **Port**: 5500
- **CORS**: Configured to allow requests from port 8082

## Default Login Credentials

- **Admin**: `admin@butterfliy.com` / `Admin@123`
- **Government**: `govt@butterfliy.com` / `Govt@123`
- **Guide**: `guide@butterfliy.com` / `Guide@123`

## Server Management

### Check Frontend Status
```bash
ps aux | grep "python3 -m http.server 8082"
curl http://38.242.248.213:8082
```

### Check Backend Status
```bash
ps aux | grep "tsx watch"
curl http://38.242.248.213:5500/health
```

### Restart Frontend
```bash
pkill -f "python3 -m http.server 8082"
cd /root/travel/TravelKiro/frontend/dist
nohup python3 -m http.server 8082 > /tmp/frontend-server.log 2>&1 &
```

### Restart Backend
```bash
pkill -f "tsx watch src/index.ts"
cd /root/travel/TravelKiro/backend
npm run dev > /tmp/backend.log 2>&1 &
```

## Ports Summary

- **Port 5500**: Backend API
- **Port 8082**: Frontend (Gradient Purple UI)
- **Port 8080**: Already in use (Docker)
- **Port 3000**: Already in use
- **Port 3001**: Already in use (Next.js)

## Firewall

Ports 5500 and 8082 are open in the firewall:
```bash
sudo ufw status | grep -E "5500|8082"
```

## Next Steps

1. Open `http://38.242.248.213:8082` in your browser
2. You should see the gradient purple login page
3. Login with the credentials above
4. Start using the Travel Encyclopedia application!

---

**Note**: The frontend is served as static files from the `dist` directory. If you make changes to the frontend code, you'll need to rebuild:
```bash
cd /root/travel/TravelKiro/frontend
npx expo export --platform web
# Then restart the HTTP server
```

