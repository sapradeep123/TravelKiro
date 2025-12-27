# TravelKiro - Travel Encyclopedia Platform

A comprehensive travel platform connecting tourists, guides, and destinations.

## 🌟 Overview

TravelKiro enables travelers to discover destinations, plan group travels, connect with guides, and share experiences. Built with React Native (Expo) and Node.js.

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

## 🔑 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@travelencyclopedia.com | admin123 |
| **Govt** | tourism@kerala.gov.in | govt123 |
| **Guide** | guide@example.com | guide123 |
| **User** | user@example.com | user123 |

## ✨ Features

- 🗺️ **Locations** - Browse travel destinations
- 🎉 **Events** - Discover festivals and events
- 📦 **Packages** - Curated travel packages
- 🚌 **Group Travel** - Collaborative trip planning with bidding
- 💬 **Messaging** - Real-time chat between users
- 📸 **Photo Albums** - Share travel experiences
- 👥 **Community** - Social features and posts
- ⚙️ **Site Settings** - Admin customization (logo, legal pages)

## 🛠️ Tech Stack

**Frontend**: React Native, Expo, TypeScript, React Native Paper  
**Backend**: Node.js, Express, TypeScript, Prisma ORM  
**Database**: PostgreSQL  
**Authentication**: JWT with refresh tokens

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
└── docs/             # Documentation
```

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
npm run web          # Open in browser
```

## � Producation Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

**Quick Deploy**:
```bash
./deploy-frontend.sh
```

**Production URLs**:
- Frontend: http://38.242.248.213:3200
- Backend: http://38.242.248.213:5500

## 🐛 Troubleshooting

### 401 Error / Can't Login
1. Clear browser local storage (F12 → Application → Local Storage → Clear)
2. Hard refresh (Ctrl+Shift+R)
3. Login again

### No Data Showing
1. Run seed script: `npx tsx src/utils/seed.ts`
2. Check backend is running: http://localhost:3000/health
3. Check browser console for errors

### Logout Not Working
1. Clear browser data
2. Close all tabs
3. Open fresh and login

## 📚 Documentation

- **Complete Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **API Docs**: Backend runs on http://localhost:3000
- **Health Check**: http://localhost:3000/health

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

- **Issues**: https://github.com/sapradeep123/TravelKiro/issues
- **Repository**: https://github.com/sapradeep123/TravelKiro

---

**Version**: 1.0  
**Last Updated**: November 19, 2025  
**Status**: Production Ready ✅
