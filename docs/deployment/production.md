# 🚀 Production Deployment Guide

Complete guide for deploying Eloity to production environments.

## 🏗️ Deployment Architecture

### Recommended Production Setup
```
Internet
    │
    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   CDN       │    │   Load      │    │   App       │
│   (Static)  │    │   Balancer  │    │   Servers   │
└─────────────┘    └─────────────┘    └─────────────┘
                           │                 │
                           ▼                 ▼
                   ┌─────────────┐    ┌─────────────┐
                   │  Database   │    │   Redis     │
                   │ PostgreSQL  │    │   Cache     │
                   └─────────────┘    └─────────────┘
```

## 🐳 Docker Deployment

### Docker Configuration

#### Dockerfile
```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production image
FROM node:18-alpine AS production

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

EXPOSE 5000
CMD ["node", "dist/enhanced-index.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Production Environment Variables
```env
# Application
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://eloity.com

# Security
JWT_SECRET=super-secure-production-secret
JWT_REFRESH_SECRET=super-secure-refresh-secret
SESSION_SECRET=super-secure-session-secret

# Database
DATABASE_URL=postgresql://user:password@postgres:5432/eloity_prod

# Redis
REDIS_URL=redis://redis:6379

# File Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=eloity-production
AWS_REGION=us-east-1

# Email Service
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@eloity.com
SENDGRID_FROM_NAME=Eloity

# Payments
STRIPE_SECRET_KEY=sk_live_your-stripe-secret
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# External Services
CRYPTO_API_KEY=your-crypto-api-key
NEWS_API_KEY=your-news-api-key

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn
```

## ☁️ Cloud Platform Deployment

### Vercel Deployment (Frontend)

#### vercel.json
```json
{
  "version": 2,
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "env": {
    "VITE_API_URL": "@api_url",
    "VITE_STRIPE_PUBLIC_KEY": "@stripe_public_key"
  },
  "functions": {
    "server/enhanced-index.ts": {
      "runtime": "nodejs18.x"
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/enhanced-index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

#### Deployment Commands
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Set environment variables
vercel env add NODE_ENV production
vercel env add DATABASE_URL
```

### Railway Deployment

#### railway.json
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Heroku Deployment

#### Procfile
```
web: node dist/enhanced-index.js
release: npm run db:push
```

#### Heroku Commands
```bash
# Create Heroku app
heroku create eloity-platform

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0

# Add Redis addon
heroku addons:create heroku-redis:premium-0

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main
```

## 🗄️ Database Setup

### PostgreSQL Production Configuration

#### Connection Pooling
```typescript
// Use connection pooling for production
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
```

#### Migration Strategy
```bash
# Production migration workflow
npm run db:generate   # Generate migration files
npm run db:check      # Verify migration safety
npm run db:push       # Apply to production (carefully!)

# Backup before migration
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Redis Configuration
```typescript
// Production Redis setup
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL, {
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
});

export default redis;
```

## 🔒 Security Configuration

### SSL/TLS Setup

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name eloity.com www.eloity.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name eloity.com www.eloity.com;

    ssl_certificate /etc/nginx/ssl/eloity.com.crt;
    ssl_certificate_key /etc/nginx/ssl/eloity.com.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    location / {
        proxy_pass http://app:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Security Headers
```typescript
// Production security configuration
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https:", "wss:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## 📊 Monitoring & Logging

### Application Monitoring

#### Winston Logging Configuration
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'eloity-backend' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;
```

#### Health Check Endpoint
```typescript
// Health check for load balancers
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  });
});
```

### Error Tracking
```typescript
import * as Sentry from '@sentry/node';

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Error handling middleware
app.use(Sentry.Handlers.errorHandler());
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run check
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to production
        run: |
          # Deploy commands here
          curl -X POST ${{ secrets.DEPLOY_WEBHOOK_URL }}
```

## 📈 Performance Optimization

### Caching Strategy
```typescript
// Redis caching implementation
export class CacheService {
  static async get(key: string) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(key: string, data: any, ttl = 3600) {
    try {
      await redis.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async del(key: string) {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }
}
```

### Database Optimization
```sql
-- Production database indexes
CREATE INDEX CONCURRENTLY idx_posts_user_id ON posts(user_id);
CREATE INDEX CONCURRENTLY idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_follows_follower_following ON follows(follower_id, following_id);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20;
```

## 🔧 Maintenance & Backup

### Database Backup Strategy
```bash
#!/bin/bash
# Automated backup script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="eloity_prod"

# Create backup
pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://eloity-backups/

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

### Update Strategy
```bash
#!/bin/bash
# Zero-downtime deployment script

# Pull latest code
git pull origin main

# Install dependencies
npm ci --production

# Build application
npm run build

# Run database migrations
npm run db:push

# Restart application (with graceful shutdown)
pm2 reload ecosystem.config.js --update-env
```

## 📋 Production Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database migrations tested
- [ ] Security headers configured
- [ ] Monitoring tools setup
- [ ] Backup strategy implemented
- [ ] Load testing completed

### Post-deployment
- [ ] Health checks passing
- [ ] SSL/HTTPS working
- [ ] Database connections stable
- [ ] API endpoints responding
- [ ] WebSocket connections working
- [ ] File uploads functioning
- [ ] Payment processing tested
- [ ] Monitoring alerts configured

### Security Verification
- [ ] Security headers present
- [ ] HTTPS enforced
- [ ] Rate limiting active
- [ ] Input validation working
- [ ] Authentication secure
- [ ] Sensitive data encrypted
- [ ] CORS properly configured

---

**Your Eloity platform is now ready for production! 🚀**

For ongoing support:
- Monitor application logs
- Set up alerting for critical errors
- Regularly update dependencies
- Perform security audits
- Backup data regularly