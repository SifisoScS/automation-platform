# Setup Guide for Business Process Automation Platform

This guide provides step-by-step instructions for setting up the Automation Platform without Docker.

## Prerequisites

### System Requirements
- Linux (Ubuntu 20.04+) or macOS
- Python 3.11 or higher
- Node.js 18 or higher
- PostgreSQL 15 or higher
- Redis 6 or higher

### Installation Commands

#### Ubuntu/Debian
```bash
# Update package manager
sudo apt-get update

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Install Redis
sudo apt-get install -y redis-server

# Install Python 3.11
sudo apt-get install -y python3.11 python3.11-venv python3.11-dev

# Install Node.js (using NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install build tools
sudo apt-get install -y build-essential libpq-dev
```

#### macOS
```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@15

# Install Redis
brew install redis

# Install Python 3.11
brew install python@3.11

# Install Node.js
brew install node@18
```

## Backend Setup

### 1. Create Python Virtual Environment

```bash
cd backend
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

Key environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection URL
- `SECRET_KEY`: JWT secret key (change in production)
- `ALLOWED_ORIGINS`: CORS allowed origins

### 4. Set Up PostgreSQL Database

```bash
# Start PostgreSQL service
sudo systemctl start postgresql  # Linux
brew services start postgresql  # macOS

# Create database user
sudo -u postgres psql -c "CREATE USER automation_user WITH PASSWORD 'automation_pass';"

# Create database
sudo -u postgres psql -c "CREATE DATABASE automation_platform OWNER automation_user;"

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE automation_platform TO automation_user;"

# Verify connection
psql -U automation_user -d automation_platform -h localhost
```

### 5. Initialize Database Schema

```bash
# Create tables
python -c "from core.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

### 6. Start Backend Services

**Terminal 1 - FastAPI Server:**
```bash
cd backend
source venv/bin/activate
python main.py
```

**Terminal 2 - Redis (if not running as service):**
```bash
redis-server
```

**Terminal 3 - Celery Worker:**
```bash
cd backend
source venv/bin/activate
celery -A workers.celery_app worker --loglevel=info
```

## Frontend Setup

### 1. Install Node Dependencies

```bash
cd frontend
pnpm install
```

If you don't have pnpm installed:
```bash
npm install -g pnpm
```

### 2. Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your settings
nano .env.local
```

Key environment variables:
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000/api)

### 3. Start Development Server

```bash
cd frontend
pnpm dev
```

The application will be available at `http://localhost:3000`

## Verification

### Check Backend Health

```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{"status": "ok", "message": "Automation Platform API is running"}
```

### Check API Documentation

Visit `http://localhost:8000/docs` in your browser to access the Swagger UI.

### Test User Registration

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "full_name": "Test User"
  }'
```

## Troubleshooting

### PostgreSQL Connection Issues

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS

# Check connection
psql -U automation_user -d automation_platform -h localhost
```

### Redis Connection Issues

```bash
# Check if Redis is running
redis-cli ping  # Should return PONG

# Check Redis connection
redis-cli
> ping
PONG
```

### Port Already in Use

If port 8000 or 3000 is already in use:

```bash
# Find process using port 8000
lsof -i :8000

# Find process using port 3000
lsof -i :3000

# Kill process (replace PID with actual process ID)
kill -9 PID
```

### Module Import Errors

```bash
# Ensure you're in the correct directory
cd backend

# Verify virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

## Production Deployment

### Backend Production Setup

1. **Use a production WSGI server:**
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

2. **Set up systemd service for FastAPI:**

Create `/etc/systemd/system/automation-backend.service`:
```ini
[Unit]
Description=Automation Platform Backend
After=network.target

[Service]
Type=notify
User=www-data
WorkingDirectory=/path/to/automation-platform/backend
Environment="PATH=/path/to/automation-platform/backend/venv/bin"
ExecStart=/path/to/automation-platform/backend/venv/bin/gunicorn -w 4 -b 0.0.0.0:8000 main:app
Restart=always

[Install]
WantedBy=multi-user.target
```

3. **Set up systemd service for Celery worker:**

Create `/etc/systemd/system/automation-celery.service`:
```ini
[Unit]
Description=Automation Platform Celery Worker
After=network.target

[Service]
Type=forking
User=www-data
WorkingDirectory=/path/to/automation-platform/backend
Environment="PATH=/path/to/automation-platform/backend/venv/bin"
ExecStart=/path/to/automation-platform/backend/venv/bin/celery -A workers.celery_app worker --loglevel=info
Restart=always

[Install]
WantedBy=multi-user.target
```

4. **Enable and start services:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable automation-backend
sudo systemctl enable automation-celery
sudo systemctl start automation-backend
sudo systemctl start automation-celery
```

### Frontend Production Setup

1. **Build the application:**
```bash
cd frontend
pnpm build
```

2. **Use a production Node.js server:**
```bash
pnpm start
```

3. **Or use Nginx as reverse proxy:**

Create `/etc/nginx/sites-available/automation-platform`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/automation-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Monitoring

### Check Service Status

```bash
# Backend
curl http://localhost:8000/api/health

# Celery
celery -A workers.celery_app inspect active

# Database
psql -U automation_user -d automation_platform -c "SELECT version();"

# Redis
redis-cli ping
```

### View Logs

```bash
# Backend logs
tail -f logs/automation_platform.log

# Celery logs
journalctl -u automation-celery -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

## Next Steps

1. Create a user account at http://localhost:3000
2. Log in with your credentials
3. Create your first workflow
4. Test workflow execution

For more information, see the main [README.md](README.md)

