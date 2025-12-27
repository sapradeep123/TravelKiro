# TravelKiro - Travel Encyclopedia Platform

A comprehensive travel platform connecting tourists, guides, and destinations.

## 🌟 Overview

TravelKiro enables travelers to discover destinations, plan group travels, connect with guides, and share experiences. Built with React Native (Expo) and Node.js.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/sapradeep123/TravelKiro.git
cd TravelKiro

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Setup database
cd backend
npx prisma migrate deploy
npx prisma generate
npx tsx src/utils/seed.ts  # Add sample data
```

### Run Application

```bash
# Start backend (Terminal 1)
cd backend
npm run dev

# Start frontend (Terminal 2)
cd frontend
npx expo start --port 8082
```

**Access**: http://localhost:8082

### Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@travelencyclopedia.com | admin123 |
| **Govt** | tourism@kerala.gov.in | govt123 |
| **Guide** | guide@example.com | guide123 |
| **User** | user@example.com | user123 |

---

## ✨ Features

- 🗺️ **Locations** - Browse travel destinations
- 🎉 **Events** - Discover festivals and events
- 📦 **Packages** - Curated travel packages
- 🚌 **Group Travel** - Collaborative trip planning with bidding
- 💬 **Messaging** - Real-time chat between users
- 📸 **Photo Albums** - Share travel experiences
- 👥 **Community** - Social features and posts
- ⚙️ **Site Settings** - Admin customization (logo, legal pages)

---

## 🛠️ Tech Stack

**Frontend**: React Native, Expo, TypeScript, React Native Paper  
**Backend**: Node.js, Express, TypeScript, Prisma ORM  
**Database**: PostgreSQL  
**Authentication**: JWT with refresh tokens

---

## 📁 Project Structure

```
TravelKiro/
├── backend/          # Node.js API
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   └── middleware/
│   └── prisma/       # Database schema
├── frontend/         # React Native app
│   ├── app/          # Expo Router pages
│   ├── src/
│   │   ├── services/
│   │   ├── contexts/
│   │   └── types/
│   └── components/
└── web-frontend/     # Next.js web app
```

---

## 🔧 Development

### Backend Commands
```bash
npm run dev          # Start dev server
npx prisma studio    # Database GUI
npx prisma generate  # Regenerate client
```

### Frontend Commands
```bash
npx expo start       # Start dev server
npx expo export --platform web  # Build for web
```

---

## 🌐 Production Deployment

### Server Information
- **Server IP**: 38.242.248.213
- **Domain**: https://butterfliy.in
- **Frontend Port**: 8082 (proxied through Nginx)
- **Backend Port**: 5500 (proxied through Nginx)

### Quick Deployment

```bash
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```

### Manual Deployment

#### Step 1: Update Environment

**Backend** (`backend/.env`):
```env
PORT=5500
NODE_ENV=production
CORS_ORIGIN="https://butterfliy.in,https://www.butterfliy.in,http://38.242.248.213:8082,http://localhost:5500,http://localhost:8082"
DATABASE_URL="postgresql://travelapp:TravelKiro2024!@localhost:5433/travelkiro_db?schema=public"
JWT_SECRET="your-secret-key-change-in-production-please-change-this"
```

**Frontend** (`frontend/.env`):
```env
EXPO_PUBLIC_API_URL=https://butterfliy.in
EXPO_PUBLIC_WS_URL=wss://butterfliy.in
```

#### Step 2: Build Frontend
```bash
cd frontend
npm install
npx expo export --platform web
```

#### Step 3: Start Services
```bash
# Backend
cd backend
npm run dev  # Runs on port 5500

# Frontend
cd frontend/dist
python3 -m http.server 8082  # Or use start-frontend.sh
```

#### Step 4: Configure Firewall
```bash
sudo ufw allow 8082/tcp
sudo ufw allow 5500/tcp
sudo ufw reload
```

### Production URLs

- **Frontend**: https://butterfliy.in (or http://38.242.248.213:8082)
- **Backend API**: https://butterfliy.in/api/ (or http://38.242.248.213:5500)
- **Health Check**: https://butterfliy.in/health

---

## 🔐 Domain Setup (butterfliy.in)

The application is configured with HTTPS/SSL using Let's Encrypt.

### Nginx Configuration
- **Config File**: `/etc/nginx/sites-available/butterfliy.in`
- **HTTP**: Port 80 (redirects to HTTPS)
- **HTTPS**: Port 443 (SSL/TLS enabled)

### SSL Certificate
- **Certificate**: `/etc/letsencrypt/live/butterfliy.in/fullchain.pem`
- **Auto-renewal**: Enabled via Certbot

### Manual SSL Renewal
```bash
sudo certbot renew
sudo systemctl reload nginx
```

---

## 👥 Role-Based Features

### USER Role
- Browse locations, events, packages, accommodations
- Create group travel proposals
- Express interest in group travels/events/packages
- Create community posts, like/comment
- Send/receive messages
- View and edit profile

### TOURIST_GUIDE Role (All USER features plus)
- Submit bids for group travels
- Create and manage travel packages
- Create and manage events
- Create and manage accommodations
- Access CRM dashboard for accommodations

### GOVT_DEPARTMENT Role (All USER features plus)
- Upload locations for their state
- Create events, packages, accommodations
- Manage their own content

### SITE_ADMIN Role (All features plus)
- Full admin dashboard
- User management
- Approve/reject all content
- Manage all locations, events, packages, accommodations
- Site settings (logo, legal pages, customization)
- Analytics and reports

**Full Feature Matrix**: See role permissions in the application.

---

## 💾 Database Backup & Recovery

### Backup Scripts
Located in `backend/`:
- `backup-database.sh` - Create backup
- `restore-database.sh` - Restore from backup
- `list-backups.sh` - List available backups
- `setup-automated-backup.sh` - Setup cron jobs

### Create Backup
```bash
cd backend
./backup-database.sh
```

Backups are saved to `~/travel-backups/` (compressed SQL files). Last 7 backups are kept automatically.

### Restore from Backup
```bash
cd backend
./list-backups.sh  # See available backups
./restore-database.sh travelkiro_db_backup_YYYYMMDD_HHMMSS.sql.gz
```

⚠️ **WARNING**: Restore will delete all existing data!

### Automated Backups
```bash
cd backend
./setup-automated-backup.sh  # Interactive setup for cron jobs
```

Or manually add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * cd /root/travel/TravelKiro/backend && ./backup-database.sh >> /var/log/travelkiro-backup.log 2>&1
```

---

## 🐛 Troubleshooting

### 401 Error / Can't Login
1. Clear browser local storage (F12 → Application → Local Storage → Clear)
2. Hard refresh (Ctrl+Shift+R)
3. Login again

### No Data Showing
1. Run seed script: `cd backend && npx tsx src/utils/seed.ts`
2. Check backend is running: `curl http://localhost:5500/health`
3. Check browser console for errors

### Backend Not Accessible
1. Check if running: `ps aux | grep "tsx watch"`
2. Check port: `netstat -tlnp | grep 5500`
3. Check firewall: `sudo ufw status`

### Frontend Not Accessible
1. Check if running: `ps aux | grep "python3.*8082"`
2. Check port: `netstat -tlnp | grep 8082`
3. Restart: `./start-frontend.sh`

### API Calls Fail
1. Verify backend: `curl https://butterfliy.in/health`
2. Check CORS settings in `backend/.env`
3. Verify environment variables

---

## 📊 Monitoring & Management

### PM2 Management (if using PM2)
```bash
pm2 list              # View all processes
pm2 logs              # View logs
pm2 restart all       # Restart all
pm2 monit             # Monitor resources
```

### Service Status
```bash
# Backend
curl http://localhost:5500/health
ps aux | grep "tsx watch"

# Frontend
curl http://localhost:8082
ps aux | grep "python3.*8082"
```

---

## 🔄 Updating Deployment

When making changes:

```bash
# Pull latest code
git pull origin main

# Update backend
cd backend
npm install
# Restart backend service

# Update frontend
cd frontend
npm install
npx expo export --platform web
./start-frontend.sh  # Or restart your frontend server
```

---

## 🔒 Security Checklist

- [ ] Update JWT secrets in production
- [ ] Use strong database password
- [ ] HTTPS enabled (✅ configured)
- [ ] Configure rate limiting
- [ ] Set up automated database backups
- [ ] Restrict SSH access
- [ ] Keep dependencies updated
- [ ] Regular security audits

---

## 📚 API Endpoints

All API routes are under `/api/`:
- `/api/auth` - Authentication
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

**Health Check**: `/health`

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 📞 Support

- **Repository**: https://github.com/sapradeep123/TravelKiro
- **Issues**: https://github.com/sapradeep123/TravelKiro/issues

---

**Version**: 1.0  
**Last Updated**: December 27, 2025  
**Status**: Production Ready ✅
