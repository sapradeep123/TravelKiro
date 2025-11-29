# DocFlow Deployment Information

## Deployment Date
November 27, 2025

## Server Details
- **Server IP**: 38.242.248.213
- **Deployment Location**: /root/DMSKiro/DocMS

## Application URLs

### Frontend
- **URL**: http://38.242.248.213:3200
- **Status**: ✅ Running
- **Container**: docflow-frontend

### Backend API
- **URL**: http://38.242.248.213:8200
- **API Documentation**: http://38.242.248.213:8200/docs
- **Health Check**: http://38.242.248.213:8200/health
- **Status**: ✅ Running
- **Container**: docflow-api

### MinIO Object Storage
- **API Endpoint**: http://38.242.248.213:9100
- **Console**: http://38.242.248.213:9200
- **Username**: minioadmin
- **Password**: minioadmin123456
- **Status**: ✅ Running
- **Container**: docflow-minio

### PostgreSQL Database
- **Host**: 38.242.248.213
- **Port**: 5600
- **Database**: docflow
- **Username**: postgres
- **Password**: DocFlow_Secure_Pass_2025!
- **Status**: ✅ Running
- **Container**: docflow-postgres

## Port Allocation
All ports were selected to avoid conflicts with existing services:
- **3200**: Frontend (React/Vite)
- **8200**: Backend API (FastAPI)
- **9100**: MinIO API
- **9200**: MinIO Console
- **5600**: PostgreSQL

## Docker Containers
```
docflow-frontend  - Frontend application
docflow-api       - Backend API
docflow-minio     - Object storage
docflow-postgres  - Database
```

## Useful Commands

### View Logs
```bash
cd /root/DMSKiro/DocMS
docker-compose logs -f              # All services
docker-compose logs -f api          # API only
docker-compose logs -f frontend     # Frontend only
```

### Check Status
```bash
docker-compose ps
```

### Restart Services
```bash
docker-compose restart              # All services
docker-compose restart api          # API only
docker-compose restart frontend     # Frontend only
```

### Stop Services
```bash
docker-compose down
```

### Start Services
```bash
docker-compose up -d
```

### Rebuild and Restart
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Security Notes
⚠️ **Important**: Change the default passwords in production:
1. Edit `/root/DMSKiro/DocMS/.env` for database password
2. Edit `/root/DMSKiro/DocMS/app/.env` for JWT secrets and MinIO credentials
3. Restart services after changes: `docker-compose restart`

## Test User Credentials

Two test users have been created for you:

### Admin User
- **Email**: admin@docflow.com
- **Username**: admin
- **Password**: admin123

### Regular User
- **Email**: user@docflow.com
- **Username**: user
- **Password**: user123

## Next Steps
1. Access the frontend at http://38.242.248.213:3200
2. Login with one of the test users above
3. Change passwords after first login
4. Configure email settings in `app/.env` if needed
5. Set up SSL/TLS with nginx for production use
6. Configure firewall rules if needed

## Backup Recommendations
- Database: Regular PostgreSQL backups
- Files: Backup MinIO data volume
- Configuration: Backup `.env` files

## Support
- API Documentation: http://38.242.248.213:8200/docs
- GitHub: https://github.com/sapradeep123/DocMS
