# 🚀 Eloity Comprehensive Platform

A unified multi-module platform combining social networking, freelance marketplace, P2P cryptocurrency trading, e-commerce, and advanced admin management.

## 🏗️ Platform Architecture

### Core Modules

- **🔐 Authentication & User Management** - JWT-based auth with role-based access control
- **💬 Unified Chat System** - Real-time messaging across all modules via WebSockets
- **💼 Freelance Marketplace** - Job posting, proposals, project management with escrow
- **🛒 E-commerce Marketplace** - Product listings, orders, reviews, and seller management
- **🔄 P2P Crypto Trading** - Peer-to-peer trading for USDT, ETH, BTC with dispute resolution
- **💰 Multi-Currency Wallet** - Support for crypto + Eloits with escrow integration
- **🚀 Boost & Premium System** - Content promotion and subscription tiers
- **🛡️ Multi-Admin Dashboard** - Role-based admin system with comprehensive controls

### Technology Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Neon serverless
- **ORM**: Drizzle ORM
- **Real-time**: WebSockets for live features
- **Authentication**: JWT with secure session management
- **File Storage**: AWS S3 integration
- **Payment Processing**: Stripe integration
- **Email**: SMTP with multiple provider support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL database (Neon recommended)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd eloity-platform
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   npm run setup:env
   # Edit .env file with your configuration
   ```

4. **Database setup**

   ```bash
   npm run setup
   ```

5. **Create admin user**

   ```bash
   npm run create-admin:comprehensive
   ```

6. **Start development server**

   ```bash
   npm run dev:comprehensive
   ```

7. **Access the platform**
   - Main App: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin
   - API Health: http://localhost:3000/health
   - WebSocket: ws://localhost:3000/ws

## 📊 Database Schema

### Core Tables

```sql
-- User Management
users, profiles, followers

-- Wallet System
wallets, wallet_transactions, platform_earnings

-- Escrow System
escrow_contracts, escrow_milestones

-- Chat System
chat_threads, chat_messages

-- Freelance Module
freelance_jobs, freelance_proposals, freelance_projects,
freelance_escrow, freelance_disputes, freelance_messages

-- Marketplace Module
products, marketplace_orders, marketplace_reviews

-- P2P Trading
p2p_offers, p2p_trades, p2p_disputes

-- Boost & Premium
boosts, premium_subscriptions, premium_benefits

-- Admin System
admin_users, admin_activity_logs, admin_sessions,
content_reports, user_suspensions

-- Notifications
notifications
```

## 🔧 API Documentation

### Authentication Endpoints

```http
POST /api/v1/auth/register     # User registration
POST /api/v1/auth/login        # User login
GET  /api/v1/users/me          # Get current user
```

### Wallet Endpoints

```http
GET  /api/v1/wallet            # Get wallet balance
POST /api/v1/wallet/send       # Send money
GET  /api/v1/wallet/history    # Transaction history
```

### Freelance Endpoints

```http
GET  /api/v1/jobs              # Get job listings
POST /api/v1/jobs              # Create job
POST /api/v1/jobs/:id/apply    # Apply to job
POST /api/v1/jobs/:id/accept   # Accept proposal
POST /api/v1/jobs/:id/release-escrow # Release payment
```

### Marketplace Endpoints

```http
GET  /api/v1/products          # Get products
POST /api/v1/products          # Create product
POST /api/v1/orders            # Create order
```

### P2P Trading Endpoints

```http
POST /api/v1/p2p/offers        # Create trade offer
POST /api/v1/p2p/trades/:id/start    # Start trade
POST /api/v1/p2p/trades/:id/release  # Release funds
```

### Boost & Premium Endpoints

```http
POST /api/v1/boost/request     # Request boost
POST /api/v1/premium/subscribe # Subscribe to premium
```

### Admin Endpoints

```http
POST /api/admin/login          # Admin login
GET  /api/admin/dashboard      # Dashboard data
GET  /api/admin/users          # User management
POST /api/admin/users/:id/suspend    # Suspend user
GET  /api/admin/reports        # Content reports
POST /api/admin/reports/:id/resolve  # Resolve report
GET  /api/admin/earnings       # Platform earnings
GET  /api/admin/boosts         # Boost management
POST /api/admin/boosts/:id/approve   # Approve boost
```

## 🛡️ Admin System

### Admin Roles & Permissions

#### Super Admin

- Full platform access
- User management
- Financial oversight
- System configuration

#### Finance Admin

- Wallet management
- Escrow operations
- Earnings reports
- Transaction monitoring

#### Content Admin

- Content moderation
- User suspensions
- Report management
- Review oversight

#### Community Moderator

- Chat moderation
- Social interactions
- Content flagging
- User warnings

#### Support Agent

- Ticket management
- User assistance
- Limited reporting
- FAQ management

#### Marketplace Admin

- Product management
- Order oversight
- Seller management
- Marketplace disputes

#### Crypto Admin

- P2P trade management
- Crypto disputes
- Trading oversight
- Wallet monitoring

#### Freelance Admin

- Job management
- Project oversight
- Freelance disputes
- Escrow management

### Admin Features

1. **Dashboard Analytics**
   - User statistics
   - Revenue tracking
   - Platform health
   - Activity monitoring

2. **User Management**
   - User search and filters
   - Suspension management
   - KYC verification
   - Profile administration

3. **Content Moderation**
   - Report queue
   - Content review
   - Automated flagging
   - Bulk actions

4. **Financial Management**
   - Platform earnings
   - Fee configuration
   - Wallet administration
   - Transaction monitoring

5. **Dispute Resolution**
   - P2P trade disputes
   - Freelance disputes
   - Marketplace issues
   - Escalation management

## 💰 Business Model

### Revenue Streams

1. **Platform Fees**
   - Freelance: 10% commission
   - Marketplace: 5% commission
   - P2P Trading: 0.3% fee

2. **Premium Subscriptions**
   - Verified Premium: $9.99/month or $99.99/year (save 2 months!)

3. **Boost System**
   - Featured listings
   - Top placement
   - Premium visibility
   - Highlight options

4. **Transaction Fees**
   - Wallet transfers: 0.1%
   - Currency conversion
   - Withdrawal fees

### Premium Benefits

#### Verified Premium Features

- Blue Verified Badge across entire platform
- Unlimited video uploads
- 100GB storage (vs 5GB free)
- No content auto-deletion (vs 90-day retention)
- HD/4K upload & streaming quality
- Priority support
- Custom thumbnails
- 100 AI credits monthly
- Eloits bonus and cashback
- Scheduled content
- Advanced analytics
- Verified spotlight in feeds
- Verified collaborations
- Co-host & stitched videos

## 🔄 Real-time Features

### WebSocket Events

```javascript
// Connection
{ type: "connection_ack", data: { userId, isAdmin } }

// Chat
{ type: "new_message", data: { message } }
{ type: "typing_start", data: { threadId, userId } }
{ type: "typing_stop", data: { threadId, userId } }
{ type: "messages_read", data: { threadId, messageIds } }

// Notifications
{ type: "notification", data: { title, content, type } }

// Trading
{ type: "trade_update", data: { tradeId, status } }
{ type: "escrow_update", data: { escrowId, status } }

// Admin
{ type: "admin_action", data: { action, targetType } }
{ type: "global_announcement", data: { title, content } }
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev:comprehensive      # Start comprehensive server
npm run dev:enhanced          # Legacy enhanced server
npm run dev                   # Original server

# Database
npm run db:generate:comprehensive  # Generate migrations
npm run db:push:comprehensive     # Push schema changes
npm run db:studio:comprehensive   # Open Drizzle Studio
npm run db:migrate               # Run migrations

# Build & Deploy
npm run build                 # Build for production
npm run start                 # Start production server

# Admin
npm run create-admin:comprehensive  # Create admin user

# Setup
npm run setup                 # Full setup
npm run setup:env            # Copy environment template
```

### Environment Variables

Key environment variables (see `.env.comprehensive.example`):

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_...
AWS_ACCESS_KEY_ID=...
SMTP_HOST=smtp.gmail.com
```

### Database Operations

```typescript
// Import operations
import {
  walletOperations,
  escrowOperations,
  chatOperations,
  p2pOperations,
  marketplaceOperations,
  adminOperations,
} from "./server/database/enhanced-operations";

// Example usage
const wallet = await walletOperations.getByUserId(userId);
const trades = await p2pOperations.getUserTrades(userId);
const reports = await adminOperations.getContentReports();
```

## 🛠️ Deployment

### Production Checklist

1. **Environment Configuration**
   - Set production environment variables
   - Configure database connections
   - Setup SSL certificates
   - Configure CDN for static assets

2. **Database Setup**
   - Run production migrations
   - Setup database backups
   - Configure connection pooling
   - Enable query logging

3. **Security Configuration**
   - Setup rate limiting
   - Configure CORS properly
   - Enable security headers
   - Setup monitoring

4. **Monitoring & Logging**
   - Configure error tracking (Sentry)
   - Setup performance monitoring
   - Enable audit logging
   - Configure alerts

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: eloity-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: eloity
  template:
    metadata:
      labels:
        app: eloity
    spec:
      containers:
        - name: eloity
          image: eloity:latest
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: eloity-secrets
                  key: database-url
```

## 📈 Monitoring & Analytics

### Key Metrics

1. **User Metrics**
   - Daily/Monthly Active Users
   - Registration conversion
   - User retention rates
   - Premium conversion

2. **Financial Metrics**
   - Platform revenue
   - Transaction volume
   - Average transaction value
   - Fee collection

3. **Performance Metrics**
   - API response times
   - Database query performance
   - WebSocket connection health
   - Error rates

4. **Business Metrics**
   - Job completion rates
   - Trade success rates
   - Order fulfillment
   - Dispute resolution times

### Health Checks

```http
GET /health              # Basic health check
GET /status              # Detailed system status
```

## 🔒 Security

### Security Features

1. **Authentication**
   - JWT with refresh tokens
   - Session management
   - Rate limiting
   - CSRF protection

2. **Data Protection**
   - Input validation
   - SQL injection prevention
   - XSS protection
   - Data encryption

3. **Financial Security**
   - Escrow protection
   - Multi-signature wallets
   - Transaction verification
   - Fraud detection

4. **Admin Security**
   - Role-based access control
   - Activity logging
   - IP whitelisting
   - Two-factor authentication

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Code review process
6. Merge to main

### Code Standards

- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Comprehensive testing
- Documentation updates

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

### Getting Help

1. **Documentation**: Check this README and inline docs
2. **Issues**: Open GitHub issue for bugs
3. **Features**: Submit feature requests
4. **Community**: Join our Discord/Slack

### Troubleshooting

Common issues and solutions:

1. **Database Connection Issues**

   ```bash
   # Check connection string
   echo $DATABASE_URL

   # Test connection
   npm run db:studio:comprehensive
   ```

2. **WebSocket Connection Issues**

   ```bash
   # Check server logs
   tail -f logs/combined.log

   # Verify WebSocket endpoint
   curl -H "Upgrade: websocket" http://localhost:3000/ws
   ```

3. **Admin Login Issues**

   ```bash
   # Create new admin
   npm run create-admin:comprehensive

   # Check admin table
   npm run db:studio:comprehensive
   ```

---

## 🎯 Roadmap

### Upcoming Features

- [ ] DeFi features (staking, yield farming, DAO governance) - See [DEFI_ROADMAP.md](./DEFI_ROADMAP.md)
- [ ] Video calling for premium users
- [ ] AI-powered matching algorithms
- [ ] Mobile applications (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] API rate limiting per user tier
- [ ] Advanced fraud detection
- [ ] Automated KYC verification
- [ ] Social media integrations
- [ ] Advanced search with Elasticsearch

### Performance Optimizations

- [ ] Database query optimization
- [ ] Redis caching layer
- [ ] CDN integration
- [ ] Image optimization pipeline
- [ ] Background job processing
- [ ] Database sharding
- [ ] Microservices architecture
- [ ] Load balancing setup

---

**Eloity Platform** - Unifying social interaction, commerce, and cryptocurrency in one comprehensive platform.
