#!/bin/bash

# DocFlow Setup Script
# This script helps set up the development environment

set -e

echo "🚀 DocFlow Setup Script"
echo "========================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env file exists
if [ ! -f "app/.env" ]; then
    echo "📝 Creating .env file from .env.example..."
    cp app/.env.example app/.env
    echo "✅ Created app/.env"
    echo "⚠️  Please edit app/.env with your configuration before continuing"
    echo ""
    read -p "Press Enter after you've edited app/.env..."
else
    echo "✅ app/.env already exists"
    echo ""
fi

# Start services
echo "🐳 Starting Docker services..."
docker compose up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker compose ps | grep -q "Up"; then
    echo "✅ Services are running!"
    echo ""
    echo "📋 Service URLs:"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:8000"
    echo "   API Docs:  http://localhost:8000/docs"
    echo "   MinIO:     http://localhost:9001 (minioadmin/minioadmin)"
    echo ""
    
    # Ask if user wants to seed data
    read -p "Would you like to create test data? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🌱 Creating test data..."
        docker compose exec -T api python scripts/seed_data.py || echo "⚠️  Seed script failed, but services are running"
        echo ""
        echo "✅ Test users created!"
        echo "   Email: admin@docflow.com"
        echo "   Password: admin123"
    fi
    
    echo ""
    echo "🎉 Setup complete! Visit http://localhost:3000 to get started"
else
    echo "❌ Some services failed to start. Check logs with:"
    echo "   docker compose logs"
fi

