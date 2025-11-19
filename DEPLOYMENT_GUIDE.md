# Deployment Guide - Contabo Server

## Prerequisites

Before deploying, ensure you have:
- ✅ Contabo server with SSH access
- ✅ Server IP address
- ✅ SSH credentials (username/password or SSH key)
- ✅ Domain name (optional but recommended)

## Step 1: Prepare Your Server

### 1.1 Connect to Your Server

```bash
ssh root@your-server-ip
# or
ssh username@your-server-ip
```

### 1.2 Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 1.3 Install Required Software

**Install Node.js (v18 or higher):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Verify installation
npm --version
```

**Install PostgreSQL:**
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Install Git:**
```bash
sudo apt install -y git
```

**Install PM2 (Process Manager):**
```bash
sudo npm install -g pm2
```

**Install Nginx (Web Server):**
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 2: Setup PostgreSQL Database

### 2.1 Create Database and User

```bash
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE travel_encyclopedia;
CREATE USER butterfliy WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE travel_encyclopedia TO butterfliy;
\q
```

### 2.2 Configure PostgreSQL for Remote Access (if needed)

```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
# Find and uncomment: listen_addresses = 'localhost'

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add: host all all 0.0.0.0/0 md5

sudo systemctl restart postgresql
```

## Step 3: Clone Your Repository

### 3.1 Create Application Directory

```bash
cd /var/www
sudo mkdir butterfliy
sudo chown $USER:$USER butterfliy
cd butterfliy
```

### 3.2 Clone from GitHub

```bash
git clone https://github.com/sapradeep123/Butterfliy_Kiro.git .
```

## Step 4: Setup Backend

### 4.1 Install Dependencies

```bash
cd /var/www/butterfliy/backend
npm install
```

### 4.2 Configure Environment Variables

```bash
nano .env
```

Add the following (update with your values):

```env
# Database
DATABASE_URL="postgresql://butterfliy:your_secure_password@localhost:5432/travel_encyclopedia?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="production"

# CORS - Update with your domain
CORS_ORIGIN="https://yourdomain.com,https://www.yourdomain.com"

# Media Storage (optional)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION=""
AWS_S3_BUCKET=""
```

### 4.3 Run Database Migrations

```bash
npx prisma migrate deploy
npx prisma generate
```

### 4.4 Initialize Site Settings (Optional)

```bash
npx tsx src/scripts/init-site-settings.ts
```

### 4.5 Build Backend (if using TypeScript build)

```bash
npm run build  # If you have a build script
```

### 4.6 Start Backend with PM2

```bash
pm2 start npm --name "butterfliy-backend" -- run dev
# or if you have a production start script:
pm2 start npm --name "butterfliy-backend" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

## Step 5: Setup Frontend (Web Build)

### 5.1 Install Dependencies

```bash
cd /var/www/butterfliy/frontend
npm install
```

### 5.2 Configure Environment Variables

```bash
nano .env
```

Add:

```env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com
EXPO_PUBLIC_WS_URL=wss://api.yourdomain.com
```

### 5.3 Build for Web

```bash
npx expo export:web
```

This creates a `web-build` directory with static files.

## Step 6: Configure Nginx

### 6.1 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/butterfliy
```

Add the following configuration:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve uploaded files
    location /uploads/ {
        alias /var/www/butterfliy/backend/uploads/;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}

# Frontend Web App
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/butterfliy/frontend/web-build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 6.2 Enable Site and Restart Nginx

```bash
sudo ln -s /etc/nginx/sites-available/butterfliy /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

## Step 7: Setup SSL with Let's Encrypt (Recommended)

### 7.1 Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Obtain SSL Certificates

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

Follow the prompts to complete SSL setup.

### 7.3 Auto-Renewal

Certbot automatically sets up renewal. Test it:

```bash
sudo certbot renew --dry-run
```

## Step 8: Configure Firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

## Step 9: Setup Automatic Deployments (Optional)

### 9.1 Create Deployment Script

```bash
nano /var/www/butterfliy/deploy.sh
```

Add:

```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Navigate to project directory
cd /var/www/butterfliy

# Pull latest changes
echo "📥 Pulling latest code..."
git pull origin main

# Backend deployment
echo "🔧 Updating backend..."
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
pm2 restart butterfliy-backend

# Frontend deployment
echo "🎨 Building frontend..."
cd ../frontend
npm install
npx expo export:web

echo "✅ Deployment complete!"
```

Make it executable:

```bash
chmod +x /var/www/butterfliy/deploy.sh
```

### 9.2 Deploy Updates

Whenever you push changes to GitHub:

```bash
ssh root@your-server-ip
cd /var/www/butterfliy
./deploy.sh
```

## Step 10: Monitoring and Maintenance

### 10.1 View Backend Logs

```bash
pm2 logs butterfliy-backend
pm2 monit  # Real-time monitoring
```

### 10.2 View Nginx Logs

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 10.3 Restart Services

```bash
# Restart backend
pm2 restart butterfliy-backend

# Restart Nginx
sudo systemctl restart nginx

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 10.4 Database Backup

Create a backup script:

```bash
nano /var/www/butterfliy/backup.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/butterfliy"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
pg_dump -U butterfliy travel_encyclopedia > $BACKUP_DIR/db_backup_$DATE.sql
echo "Backup created: $BACKUP_DIR/db_backup_$DATE.sql"
```

Make executable and run:

```bash
chmod +x /var/www/butterfliy/backup.sh
./backup.sh
```

Setup automatic backups with cron:

```bash
crontab -e
# Add: 0 2 * * * /var/www/butterfliy/backup.sh
```

## Quick Deployment Commands

### Initial Deployment

```bash
# On your local machine
git add .
git commit -m "Prepare for deployment"
git push origin main

# On your server
ssh root@your-server-ip
cd /var/www/butterfliy
git clone https://github.com/sapradeep123/Butterfliy_Kiro.git .
cd backend && npm install
npx prisma migrate deploy
npx prisma generate
pm2 start npm --name "butterfliy-backend" -- run dev
cd ../frontend && npm install
npx expo export:web
```

### Update Deployment

```bash
# On your local machine
git add .
git commit -m "Update features"
git push origin main

# On your server
ssh root@your-server-ip
cd /var/www/butterfliy
./deploy.sh
```

## Troubleshooting

### Backend Not Starting

```bash
pm2 logs butterfliy-backend  # Check logs
pm2 restart butterfliy-backend
```

### Database Connection Issues

```bash
# Test connection
psql -U butterfliy -d travel_encyclopedia -h localhost

# Check PostgreSQL status
sudo systemctl status postgresql
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log
```

### Port Already in Use

```bash
# Find process using port 3000
sudo lsof -i :3000
sudo kill -9 <PID>
```

## Security Checklist

- [ ] Change default PostgreSQL password
- [ ] Use strong JWT secrets
- [ ] Enable firewall (UFW)
- [ ] Setup SSL certificates
- [ ] Disable root SSH login
- [ ] Setup fail2ban for SSH protection
- [ ] Regular security updates
- [ ] Database backups
- [ ] Monitor logs regularly

## Performance Optimization

### Enable Gzip Compression

Add to Nginx config:

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### Setup Redis for Caching (Optional)

```bash
sudo apt install -y redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

### Database Optimization

```bash
# Analyze database
sudo -u postgres psql travel_encyclopedia
ANALYZE;
VACUUM;
```

## Support

For issues:
1. Check logs: `pm2 logs butterfliy-backend`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify services: `pm2 status`, `sudo systemctl status nginx`
4. Review this guide

---

**Deployment Guide Complete!** 🚀

Your Butterfliy Travel Encyclopedia is now ready for production deployment on Contabo server.
