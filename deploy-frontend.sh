#!/bin/bash

echo "🚀 Deploying TravelKiro Frontend to Production..."
echo "Server: 38.242.248.213"
echo "Port: 3200"
echo ""

# Navigate to frontend directory
cd frontend || exit 1

# Backup existing .env
if [ -f .env ]; then
    echo "📦 Backing up existing .env..."
    cp .env .env.backup
fi

# Create production environment file
echo "📝 Creating production environment..."
cat > .env << EOF
EXPO_PUBLIC_API_URL=http://38.242.248.213:5500
EXPO_PUBLIC_WS_URL=http://38.242.248.213:5500
EOF

echo "✅ Environment configured"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Build for web
echo "🔨 Building for production..."
npx expo export:web
echo "✅ Build complete"
echo ""

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Stop existing process if running
echo "🛑 Stopping existing process..."
pm2 delete travelkiro-frontend 2>/dev/null || echo "No existing process found"

# Install serve if not installed
if ! command -v serve &> /dev/null; then
    echo "📦 Installing serve..."
    npm install -g serve
fi

# Start frontend with PM2
echo "▶️ Starting frontend on port 3200..."
pm2 serve dist 3200 --name "travelkiro-frontend" --spa

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://38.242.248.213:3200"
echo "   Backend:  http://38.242.248.213:5500"
echo ""
echo "🔑 Login Credentials:"
echo "   Admin: admin@travelencyclopedia.com / admin123"
echo "   User:  user@travelencyclopedia.com / password123"
echo "   Guide: guide@example.com / guide123"
echo ""
echo "📊 PM2 Commands:"
echo "   View logs:    pm2 logs travelkiro-frontend"
echo "   Restart:      pm2 restart travelkiro-frontend"
echo "   Stop:         pm2 stop travelkiro-frontend"
echo "   Monitor:      pm2 monit"
echo ""
