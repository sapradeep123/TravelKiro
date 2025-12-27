# Domain Setup - butterfliy.in

## Overview
The TravelKiro application has been successfully configured to work with the domain `butterfliy.in` with HTTPS/SSL enabled.

## Domain Configuration
- **Domain**: butterfliy.in
- **IP Address**: 38.242.248.213
- **SSL Certificate**: Let's Encrypt (Auto-renewal enabled)
- **Certificate Expiry**: 2026-02-17 (Auto-renewal configured)

## Nginx Configuration
- **Config File**: `/etc/nginx/sites-available/butterfliy.in`
- **Enabled**: Yes (symlinked to sites-enabled)
- **HTTP**: Port 80 (redirects to HTTPS)
- **HTTPS**: Port 443 (SSL/TLS enabled)

## Service Endpoints

### Frontend
- **URL**: https://butterfliy.in
- **Backend Port**: 8082 (proxied through Nginx)
- **Status**: ✅ Active

### Backend API
- **URL**: https://butterfliy.in/api/
- **Direct Port**: 5500 (proxied through Nginx)
- **Health Check**: https://butterfliy.in/health
- **Status**: ✅ Active

## Environment Variables Updated

### Backend (.env)
```
CORS_ORIGIN="https://butterfliy.in,https://www.butterfliy.in,http://38.242.248.213:8082,http://localhost:5500,http://localhost:8082,http://localhost:8081,http://localhost:19006"
```

### Frontend (.env)
```
EXPO_PUBLIC_API_URL=https://butterfliy.in
EXPO_PUBLIC_WS_URL=wss://butterfliy.in
```

## SSL Certificate Management

### Certificate Location
- **Certificate**: `/etc/letsencrypt/live/butterfliy.in/fullchain.pem`
- **Private Key**: `/etc/letsencrypt/live/butterfliy.in/privkey.pem`

### Auto-Renewal
Certbot has been configured to automatically renew the certificate. The renewal process runs via a scheduled task.

### Manual Renewal (if needed)
```bash
sudo certbot renew
sudo systemctl reload nginx
```

## Testing

### Verify HTTPS
```bash
curl -I https://butterfliy.in
curl -I https://www.butterfliy.in
```

### Verify API
```bash
curl https://butterfliy.in/health
curl https://butterfliy.in/api/locations
```

### Verify Frontend
Open in browser: https://butterfliy.in

## Firewall Configuration
Ensure ports 80 and 443 are open:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## Troubleshooting

### If SSL certificate expires
```bash
sudo certbot renew
sudo systemctl reload nginx
```

### If Nginx configuration has errors
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### If backend is not accessible
1. Check backend is running: `ps aux | grep node`
2. Check port 5500: `netstat -tlnp | grep 5500`
3. Restart backend if needed: `pm2 restart travel-backend`

### If frontend is not accessible
1. Check frontend server: `ps aux | grep python3 | grep 8082`
2. Check port 8082: `netstat -tlnp | grep 8082`
3. Restart frontend if needed

## Notes
- The application is accessible via both `butterfliy.in` and `www.butterfliy.in`
- All HTTP traffic is automatically redirected to HTTPS
- SSL certificate auto-renewal is configured and will run automatically
- The backend CORS settings include both the domain and localhost for development purposes

