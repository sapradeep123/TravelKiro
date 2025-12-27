# 🚀 Deploy TravelKiro NOW - Step by Step

## ✅ Quick Deployment Guide

**Target Server**: 38.242.248.213  
**Frontend Port**: 3200  
**Backend Port**: 5500 (already running)

---

## 📋 Prerequisites Check

Before deploying, ensure:
- [ ] You have SSH access to 38.242.248.213
- [ ] Backend is running on port 5500
- [ ] Node.js is installed on server
- [ ] PM2 is installed (or will be installed by script)

---

## 🎯 Option 1: Automatic Deployment (Recommended)

### Step 1: Make Script Executable
```bash
chmod +x deploy-frontend.sh
```

### Step 2: Run Deployment Script
```bash
./deploy-frontend.sh
```

The script will:
1. ✅ Update environment variables
2. ✅ Install dependencies
3. ✅ Build frontend for production
4. ✅ Deploy on port 3200
5. ✅ Setup PM2 for auto-restart

### Step 3: Access Application
Open in browser: **http://38.242.248.213:3200**

---

## 🔧 Option 2: Manual Deployment

### Step 1: Update Frontend Environment
```bash
cd frontend
cat > .env << EOF
EXPO_PUBLIC_API_URL=http://38.242.248.213:5500
EXPO_PUBLIC_WS_URL=http://38.242.248.213:5500
EOF
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Build for Production
```bash
npx expo export:web
```

### Step 4: Install PM2 (if not installed)
```bash
npm install -g pm2
npm install -g serve
```

### Step 5: Deploy Frontend
```bash
pm2 serve dist 3200 --name "travelkiro-frontend" --spa
pm2 save
```

### Step 6: Setup Auto-Start
```bash
pm2 startup
# Follow the command it gives you
```

---

## 🔒 Firewall Configuration

### Ubuntu/Debian
```bash
sudo ufw allow 3200/tcp
sudo ufw reload
```

### CentOS/RHEL
```bash
sudo firewall-cmd --permanent --add-port=3200/tcp
sudo firewall-cmd --reload
```

### Windows Server
```powershell
New-NetFirewallRule -DisplayName "TravelKiro Frontend" -Direction Inbound -LocalPort 3200 -Protocol TCP -Action Allow
```

---

## 🌐 Access URLs

### Production (For Users)
**Frontend**: http://38.242.248.213:3200  
**Backend API**: http://38.242.248.213:5500

### Development (Local)
**Frontend**: http://localhost:8082  
**Backend API**: http://localhost:3000

---

## 🔑 Login Credentials

Share these with your users:

### Site Administrator
```
URL: http://38.242.248.213:3200
Email: admin@travelencyclopedia.com
Password: admin123
```

### Regular User
```
URL: http://38.242.248.213:3200
Email: user@travelencyclopedia.com
Password: password123
```

### Tourist Guide
```
URL: http://38.242.248.213:3200
Email: guide@example.com
Password: guide123
```

---

## 📊 Verify Deployment

### 1. Check Backend
```bash
curl http://38.242.248.213:5500/health
```
Expected: `{"status":"ok","message":"Travel Encyclopedia API is running"}`

### 2. Check Frontend
```bash
curl -I http://38.242.248.213:3200
```
Expected: `200 OK`

### 3. Check PM2 Status
```bash
pm2 list
```
Should show `travelkiro-frontend` as `online`

### 4. Test in Browser
1. Open: http://38.242.248.213:3200
2. Should see login page
3. Login with admin credentials
4. Verify all features work

---

## 🔄 PM2 Management

### View Logs
```bash
pm2 logs travelkiro-frontend
```

### Restart
```bash
pm2 restart travelkiro-frontend
```

### Stop
```bash
pm2 stop travelkiro-frontend
```

### Monitor
```bash
pm2 monit
```

### View Status
```bash
pm2 status
```

---

## 🐛 Troubleshooting

### Issue: Cannot access http://38.242.248.213:3200

**Solution 1**: Check if port is open
```bash
telnet 38.242.248.213 3200
```

**Solution 2**: Check firewall
```bash
sudo ufw status
# or
sudo firewall-cmd --list-ports
```

**Solution 3**: Check if process is running
```bash
pm2 list
```

### Issue: Login fails or API errors

**Solution 1**: Check backend is running
```bash
curl http://38.242.248.213:5500/health
```

**Solution 2**: Check CORS settings
Verify backend `.env` includes: `http://38.242.248.213:3200`

**Solution 3**: Check browser console
Press F12 and look for errors

### Issue: White screen or blank page

**Solution 1**: Hard refresh
Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

**Solution 2**: Clear browser cache

**Solution 3**: Check PM2 logs
```bash
pm2 logs travelkiro-frontend --lines 50
```

---

## 📝 Post-Deployment Checklist

- [ ] Frontend accessible at http://38.242.248.213:3200
- [ ] Backend accessible at http://38.242.248.213:5500
- [ ] Login works with test credentials
- [ ] All features functional
- [ ] PM2 process running
- [ ] Auto-restart configured
- [ ] Firewall rules set
- [ ] CORS configured correctly
- [ ] Logs are being generated

---

## 🎉 Success Indicators

You'll know deployment is successful when:

1. ✅ You can access http://38.242.248.213:3200
2. ✅ Login page loads with gradient background
3. ✅ Login works with test credentials
4. ✅ Dashboard loads after login
5. ✅ All navigation tabs work
6. ✅ API calls succeed (check browser console)
7. ✅ PM2 shows process as "online"

---

## 📞 Share with Users

Send this to your users:

```
🌐 TravelKiro Application

Access URL: http://38.242.248.213:3200

Test Credentials:
- Admin: admin@travelencyclopedia.com / admin123
- User: user@travelencyclopedia.com / password123
- Guide: guide@example.com / guide123

Features:
✅ Browse travel destinations
✅ Create group travels
✅ Submit bids (as guide)
✅ Messaging system
✅ Photo albums
✅ Community features

Support: [Your contact info]
```

---

## 🔄 Update Deployment

When you make changes:

```bash
cd frontend
npm run build:web
pm2 restart travelkiro-frontend
```

---

## 📈 Monitoring

### Setup Log Rotation
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### View Real-time Logs
```bash
pm2 logs travelkiro-frontend --lines 100
```

### Monitor Resources
```bash
pm2 monit
```

---

## ✅ Quick Commands Reference

```bash
# Deploy
./deploy-frontend.sh

# Check status
pm2 list

# View logs
pm2 logs travelkiro-frontend

# Restart
pm2 restart travelkiro-frontend

# Stop
pm2 stop travelkiro-frontend

# Monitor
pm2 monit

# Test backend
curl http://38.242.248.213:5500/health

# Test frontend
curl -I http://38.242.248.213:3200
```

---

**Ready to deploy!** 🚀

Run: `./deploy-frontend.sh`

Then access: **http://38.242.248.213:3200**
