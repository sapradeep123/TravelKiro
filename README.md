# Butterfliy Travel Encyclopedia

A comprehensive travel platform connecting tourists with destinations, events, packages, and local guides.

## Overview

Butterfliy is a full-stack travel encyclopedia application that enables:
- **Tourists**: Discover destinations, events, and packages
- **Government Departments**: Manage and promote regional tourism
- **Tourist Guides**: Create packages and offer services
- **Site Admins**: Oversee platform operations and approvals

## Tech Stack

**Frontend:**
- React Native (Expo)
- React Native Paper (UI)
- TypeScript

**Backend:**
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT Authentication

## Quick Start

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Setup database
cd backend
npx prisma migrate dev
npx prisma generate

# Start servers
cd backend && npm run dev    # Port 3000
cd frontend && npm start     # Port 8081
```

**Access:** http://localhost:8081

**Default Login:**
- Admin: admin@butterfliy.com / Admin@123
- Govt: govt@butterfliy.com / Govt@123
- Guide: guide@butterfliy.com / Guide@123

## Documentation

- [Getting Started Guide](./docs/GETTING_STARTED.md)
- [Features Documentation](./docs/FEATURES.md)
- [API Reference](./docs/API_REFERENCE.md)

## Project Structure

```
├── backend/              # Express API server
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API routes
│   │   └── middleware/   # Auth, error handling
│   └── prisma/           # Database schema
│
├── frontend/             # React Native app
│   ├── app/              # Expo Router pages
│   │   ├── (tabs)/       # Main navigation tabs
│   │   ├── (admin)/      # Admin pages
│   │   └── (auth)/       # Login/Register
│   ├── src/
│   │   ├── services/     # API clients
│   │   ├── contexts/     # React contexts
│   │   └── types/        # TypeScript types
│   └── components/       # Reusable components
│
└── docs/                 # Documentation
```

## Key Features

- 🗺️ **Locations**: Browse and manage travel destinations
- 🎉 **Events**: Discover festivals and local events
- 📦 **Packages**: Curated travel packages with itineraries
- 👥 **Community**: Share experiences and connect
- 🏨 **Accommodations**: Hotels, restaurants, resorts
- 📞 **Callback System**: Request information from hosts
- 🚌 **Group Travel**: Collaborative trip planning
- ✅ **Approval System**: Content moderation workflow

## Development

### Backend
```bash
cd backend
npm run dev          # Start dev server
npx prisma studio    # Open database GUI
npx prisma generate  # Regenerate Prisma client
```

### Frontend
```bash
cd frontend
npm start            # Start Expo dev server
npm run web          # Open in browser
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open a GitHub issue.
