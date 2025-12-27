# Production Deployment Guide - TravelKiro

## 🌐 Server Information

**Server IP**: 38.242.248.213  
**Backend Port**: 5500 (already running)  
**Frontend Port**: 3200 (to be deployed)

---

## 📋 Port Allocation

### Available Ports
- ✅ 3100 - Available
- ✅ 3200 - **Selected for Frontend**
- ✅ 3500 - Available
- ✅ 6000 - Available
- ✅ 7000 - Available
- ✅ 7500 - Available
- ✅ 8800 - Available
- ✅ 9100 - Available
- ✅ 2001 - Available
- ✅ 2002 - Available

### Assigned Ports
- **Backend API**: 5500 (already running)
- **Frontend UI**: 3200 (to be deployed)

---

## 🚀 Deployment Steps

### Step 1: Update Frontend Configuration

Update the API URL in frontend to point to production backend:

**File**: `frontend/.env`
```env
EXPO_PUBLIC_API_URL=http://38.242.248.213:5500
EXPO_PUBLIC_WS_URL=http://38.242.248.213:5500
```

### Step 2: Build Frontend for Production

```bash
cd frontend
npm run build:web
```

This will create a production build in `frontend/web-build/`

### Step 3: Serve Frontend on Port 3200

Option A: Using serve (recommended)
```bash
cd frontend
npx serve web-build -l 3200 --host 0.0.0.0
```

Option B: Using http-server
```bash
cd frontend
npx http-server web-build -p 3200 -a 0.0.0.0
```

Option C: Using PM2 (for persistent deployment)
```bash
npm install -g pm2
cd frontend
pm2 serve web-build 3200 --name "travelkiro-frontend" --spa
pm2 save
pm2 startup
```

### Step 4: Configure Firewall

Ensure port 3200 is open:
```bash
# For Ubuntu/Debian
sudo ufw allow 3200/tcp

# For CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3200/tcp
sudo firewall-cmd --reload
```

### Step 5: Update Backend CORS

Update backend to allow frontend origin:

**File**: `backend/.env`
```env
CORS_ORIGIN="http://38.242.248.213:3200,http://localhost:8082"
```

Restart backend:
```bash
cd backend
pm2 restart travel-backend
# or
npm run dev
```

---

## 🌐 Access URLs

### For Users (Production)
**Frontend**: http://38.242.248.213:3200  
**Backend API**: http://38.242.248.213:5500

### For Development (Local)
**Frontend**: http://localhost:8082  
**Backend API**: http://localhost:3000

---

## 🔧 Quick Deployment Script

Create a deployment script:

**File**: `deploy-frontend.sh`
```bash
#!/bin/bash

echo "🚀 Deploying TravelKiro Frontend..."

# Navigate to frontend
cd frontend

# Update environment
echo "📝 Updating environment..."
cat > .env << EOF
EXPO_PUBLIC_API_URL=http://38.242.248.213:5500
EXPO_PUBLIC_WS_URL=http://38.242.248.213:5500
EOF

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for web
echo "🔨 Building for production..."
npm run build:web

# Stop existing PM2 process if running
echo "🛑 Stopping existing process..."
pm2 delete travelkiro-frontend 2>/dev/null || true

# Start with PM2
echo "▶️ Starting frontend on port 3200..."
pm2 serve web-build 3200 --name "travelkiro-frontend" --spa

# Save PM2 configuration
pm2 save

echo "✅ Deployment complete!"
echo "🌐 Access at: http://38.242.248.213:3200"
```

Make it executable:
```bash
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```

---

## 🔑 Login Credentials (Same as Before)

### Site Administrator
```
Email: admin@travelencyclopedia.com
Password: admin123
```

### Regular User
```
Email: user@travelencyclopedia.com
Password: password123
```

### Tourist Guide
```
Email: guide@example.com
Password: guide123
```

---

## 📊 Health Checks

### Backend Health
```bash
curl http://38.242.248.213:5500/health
```
Should return: `{"status":"ok","message":"Travel Encyclopedia API is running"}`

### Frontend Health
```bash
curl -I http://38.242.248.213:3200
```
Should return: `200 OK`

---

## 🔒 Security Considerations

### 1. Use HTTPS (Recommended)
For production, use a reverse proxy (Nginx) with SSL:

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3200;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Environment Variables
Never commit sensitive data. Use environment variables for:
- Database credentials
- JWT secrets
- API keys

### 3. Firewall Rules
Only open necessary ports:
- 3200 (Frontend)
- 5500 (Backend API)
- 443 (HTTPS)
- 22 (SSH - restrict to specific IPs)

---

## 🔄 PM2 Management Commands

### Start
```bash
pm2 start ecosystem.config.js
```

### Stop
```bash
pm2 stop all
```

### Restart
```bash
pm2 restart all
```

### View Logs
```bash
pm2 logs
pm2 logs travelkiro-frontend
pm2 logs travel-backend
```

### Monitor
```bash
pm2 monit
```

### List Processes
```bash
pm2 list
```

---

## 📝 PM2 Ecosystem Configuration

Create `ecosystem.config.js` in project root:

```javascript
module.exports = {
  apps: [
    {
      name: 'travel-backend',
      cwd: './backend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'production',
        PORT: 5500
      }
    },
    {
      name: 'travelkiro-frontend',
      script: 'serve',
      args: '-s web-build -l 3200',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

Start both:
```bash
pm2 start ecosystem.config.js
```

---

## 🧪 Testing Deployment

### 1. Test Backend
```bash
curl http://38.242.248.213:5500/health
```

### 2. Test Frontend
Open in browser: http://38.242.248.213:3200

### 3. Test Login
1. Go to http://38.242.248.213:3200
2. Login with admin credentials
3. Verify all features work

### 4. Test API Connection
Check browser console (F12) for API calls to port 5500

---

## 🐛 Troubleshooting

### Issue: Cannot access frontend
**Check**:
1. Is port 3200 open in firewall?
2. Is the process running? (`pm2 list`)
3. Can you access locally? (`curl localhost:3200`)

### Issue: API calls fail
**Check**:
1. Is backend running on port 5500?
2. Is CORS configured correctly?
3. Check browser console for errors

### Issue: Login fails
**Check**:
1. Backend health: `curl http://38.242.248.213:5500/health`
2. Database connection
3. Check backend logs: `pm2 logs travel-backend`

---

## 📈 Monitoring

### Setup Monitoring
```bash
# Install PM2 monitoring
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### View Metrics
```bash
pm2 monit
```

---

## 🔄 Update Deployment

When you make changes:

```bash
# Pull latest code
git pull origin main

# Update backend
cd backend
npm install
pm2 restart travel-backend

# Update frontend
cd ../frontend
npm install
npm run build:web
pm2 restart travelkiro-frontend
```

---

## 📞 Support

If deployment fails:
1. Check PM2 logs: `pm2 logs`
2. Check firewall: `sudo ufw status`
3. Check port availability: `netstat -tulpn | grep 3200`
4. Check process: `pm2 list`

---

## ✅ Deployment Checklist

- [ ] Update frontend .env with production API URL
- [ ] Build frontend for production
- [ ] Configure firewall to allow port 3200
- [ ] Update backend CORS settings
- [ ] Deploy frontend on port 3200
- [ ] Test backend health endpoint
- [ ] Test frontend access
- [ ] Test login functionality
- [ ] Setup PM2 for auto-restart
- [ ] Configure log rotation
- [ ] Setup monitoring

---

**Production URL**: http://38.242.248.213:3200  
**Status**: Ready to deploy  
**Port**: 3200 (Available)

🚀 Ready for deployment!
