# 🚀 TravelKiro Deployment Guide

Complete guide for deploying TravelKiro to production.

## 📋 Server Information

**Server IP**: 38.242.248.213  
**Frontend Port**: 3200  
**Backend Port**: 5500  

## 🎯 Quick Deployment

### One-Command Deploy
```bash
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```

This automatically:
1. Updates environment variables
2. Installs dependencies
3. Builds frontend
4. Deploys on port 3200
5. Sets up PM2 auto-restart

## 📝 Manual Deployment

### Step 1: Update Environment

**Backend** (`backend/.env`):
```env
PORT=5500
NODE_ENV=production
CORS_ORIGIN="http://38.242.248.213:3200"
DATABASE_URL="your_database_url"
JWT_SECRET="your_secret"
```

**Frontend** (`frontend/.env.production`):
```env
EXPO_PUBLIC_API_URL=http://38.242.248.213:5500
EXPO_PUBLIC_WS_URL=http://38.242.248.213:5500
```

### Step 2: Build Frontend
```bash
cd frontend
npm install
npx expo export:web
```

### Step 3: Install PM2
```bash
npm install -g pm2
npm install -g serve
```

### Step 4: Deploy Services

**Using PM2 Ecosystem** (Recommended):
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

**Manual Start**:
```bash
# Backend
cd backend
pm2 start npm --name "travel-backend" -- run dev

# Frontend
cd frontend
pm2 serve dist 3200 --name "travelkiro-frontend" --spa
```

### Step 5: Configure Firewall

**Ubuntu/Debian**:
```bash
sudo ufw allow 3200/tcp
sudo ufw allow 5500/tcp
sudo ufw reload
```

**CentOS/RHEL**:
```bash
sudo firewall-cmd --permanent --add-port=3200/tcp
sudo firewall-cmd --permanent --add-port=5500/tcp
sudo firewall-cmd --reload
```

## 🌐 Access URLs

**Production**:
- Frontend: http://38.242.248.213:3200
- Backend: http://38.242.248.213:5500

**Local Development**:
- Frontend: http://localhost:8082
- Backend: http://localhost:3000

## 🔑 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@travelencyclopedia.com | admin123 |
| Govt | tourism@kerala.gov.in | govt123 |
| Guide | guide@example.com | guide123 |
| User | user@example.com | user123 |

## 🔄 PM2 Management

### Common Commands
```bash
pm2 list              # View all processes
pm2 logs              # View logs
pm2 restart all       # Restart all
pm2 stop all          # Stop all
pm2 delete all        # Delete all
pm2 monit             # Monitor resources
```

### Specific Process
```bash
pm2 logs travelkiro-frontend
pm2 restart travelkiro-frontend
pm2 stop travelkiro-frontend
```

## 🧪 Verify Deployment

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

### 3. Test in Browser
1. Open: http://38.242.248.213:3200
2. Login with admin credentials
3. Verify all features work

## 🐛 Troubleshooting

### Issue: Cannot access port 3200
**Solutions**:
1. Check firewall: `sudo ufw status`
2. Check process: `pm2 list`
3. Check port: `netstat -tulpn | grep 3200`

### Issue: 401 Authentication Error
**Solutions**:
1. Clear browser local storage
2. Hard refresh (Ctrl+Shift+R)
3. Login again

### Issue: API calls fail
**Solutions**:
1. Check backend: `curl http://38.242.248.213:5500/health`
2. Verify CORS in backend .env
3. Check PM2 logs: `pm2 logs travel-backend`

### Issue: White screen
**Solutions**:
1. Check PM2 logs: `pm2 logs travelkiro-frontend`
2. Rebuild: `npm run build:web`
3. Restart: `pm2 restart travelkiro-frontend`

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
cd frontend
npm install
npx expo export:web
pm2 restart travelkiro-frontend
```

## 🔒 Security Checklist

- [ ] Update JWT secrets in production
- [ ] Use strong database password
- [ ] Enable HTTPS (recommended)
- [ ] Configure rate limiting
- [ ] Set up database backups
- [ ] Enable PM2 log rotation
- [ ] Restrict SSH access
- [ ] Update CORS for production domain

## 📊 Monitoring

### Setup Log Rotation
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### View Metrics
```bash
pm2 monit                    # Real-time monitoring
pm2 logs --lines 100         # View logs
pm2 status                   # Process status
```

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Sample data seeded (optional)
- [ ] Firewall rules configured
- [ ] PM2 processes running
- [ ] Auto-restart enabled
- [ ] Logs being generated
- [ ] Frontend accessible
- [ ] Backend health check passing
- [ ] Login working
- [ ] All features tested

## 📞 Support

If deployment fails:
1. Check PM2 logs: `pm2 logs`
2. Check firewall: `sudo ufw status`
3. Check ports: `netstat -tulpn | grep -E '3200|5500'`
4. Verify environment variables
5. Check database connection

## 🔗 Quick Links

- **Repository**: https://github.com/sapradeep123/TravelKiro
- **Frontend**: http://38.242.248.213:3200
- **Backend**: http://38.242.248.213:5500
- **Health Check**: http://38.242.248.213:5500/health

---

**Last Updated**: November 19, 2025  
**Version**: 1.0  
**Status**: Production Ready ✅
