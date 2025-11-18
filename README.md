# Eloity - Unified Social Ecosystem Platform
# 🚀 Eloity Platform

> **AI-powered unified ecosystem** combining social media, marketplace, crypto trading, and freelancing into one comprehensive platform.

A modern, full-stack platform built with React 18, TypeScript, Node.js, and PostgreSQL, featuring real-time capabilities, advanced security, and enterprise-grade architecture.

## ⚡ Quick Start

``bash
# Clone and setup
git clone https://github.com/your-org/eloity-platform.git
cd eloity-platform
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
npm run db:generate
npm run db:push
npm run db:seed

# Start development
npm run dev
```

**🌐 Access the platform:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:5000
- Admin Dashboard: http://localhost:8080/admin

## 📚 Documentation

**🎆 Recently Reorganized!** Our documentation has been completely restructured from 80+ scattered files into a clear, organized system.

### 🚀 **[Getting Started](./docs/setup/getting-started.md)**
Complete setup guide for local development

### ⭐ **[Platform Features](./docs/features/core-features.md)**
Comprehensive overview of all platform capabilities

### 👩‍💻 **[Development Guide](./docs/development/development-guide.md)**
Architecture, coding standards, and best practices

### 🔌 **[API Reference](./docs/api/api-reference.md)**
Complete API documentation with examples

### 🚀 **[Deployment Guide](./docs/deployment/production.md)**
Production deployment and configuration

### 📜 **[Migration Summary](./docs/MIGRATION_SUMMARY.md)**
See how 80+ files were organized into 6 clear sections

### 📚 **[Full Documentation](./docs/README.md)**
Browse all documentation categories
- **React Query DevTools**: Development debugging
- **Performance Monitoring**: Real-time metrics
- **Error Tracking**: Comprehensive error reporting

---

## 🏗️ Modern Architecture

```
Eloity Platform/
├── Frontend (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/              # Base UI components (Radix)
│   │   │   ├── feed/            # Social media components
│   │   │   ├── marketplace/     # E-commerce components
│   │   │   ├── crypto/          # Trading components
│   │   │   ├── freelance/       # Freelancing components
│   │   │   ├── video/           # Video platform components
│   │   │   ├── chat/            # Real-time chat
│   │   │   └── creator-economy/ # Creator tools
│   │   ├── contexts/          # React contexts for state
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API and external services
│   │   ├── pages/             # Page components
│   │   ├── lib/               # Utilities and helpers
│   │   └── types/             # TypeScript type definitions
│   └── public/              # Static assets
│
├── Backend (Node.js + Express + TypeScript)
│   ├── server/
│   │   ├── config/            # Configuration files
│   │   ├── database/          # Database operations
│   │   ├── routes/            # API route handlers
│   │   ├── services/          # Business logic services
│   │   ├── middleware/        # Express middleware
│   │   ├── websocket/         # WebSocket handlers
│   │   └── utils/             # Server utilities
│   └── shared/              # Shared types and schemas
│
├── Database (PostgreSQL + Drizzle ORM)
│   ├── migrations/          # Database migrations
│   └── schema/              # Database schema definitions
│
└── Deployment
    ├── scripts/             # Deployment and setup scripts
    ├── config/              # Environment configurations
    └── docs/                # Documentation and guides
```

---

## 🚀 Quick Start

> **👤 Prerequisites**: Node.js 18+, npm 9+, PostgreSQL 14+

### 1. **Clone & Install**

```bash
git clone <repository-url>
cd frontend-eloity-unified-ecosyst
npm install
```

### 2. **Environment Setup**

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your actual values
nano .env  # or use your preferred editor
```

### Supabase MCP Integration

This platform is configured to work with the Supabase MCP server. For detailed setup instructions, see [Supabase MCP Integration Guide](./SUPABASE_MCP_INTEGRATION.md).

Quick setup:
```bash
# Run the automated setup script for Supabase MCP integration
npm run setup:supabase-mcp

# Test the connection
npm run test:supabase-mcp
```

### 3. **Essential Environment Variables**

```
# Database (Required)
DATABASE_URL=postgresql://user:password@localhost:5432/eloity_db
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key

# Authentication (Required)
JWT_SECRET=your-super-secure-jwt-secret-key
SESSION_SECRET=your-session-secret-key

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-s3-bucket-name
AWS_REGION=us-east-1

# Email Service (Required for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password

# Payment Processing (Stripe)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_public

# Redis Cache (Optional but recommended)
REDIS_URL=redis://localhost:6379

# Development
NODE_ENV=development
PORT=8080
VITE_PORT=8081
```

### 4. **Database Initialization**

```bash
# Generate database schema
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data (optional)
npm run db:seed

# Open database studio (optional)
npm run db:studio
```

### 5. **Start Development Servers**

```bash
# Start both frontend and backend (recommended)
npm run dev

# Or start individually:
npm run dev:frontend  # Frontend only (Vite)
npm run dev:backend   # Backend only (Express)
```

### 6. **Access the Application**

- **Frontend**: http://localhost:8081
- **Backend API**: http://localhost:8080
- **Database Studio**: http://localhost:4983 (when running db:studio)

### 7. **Build for Production**

```bash
# Build both frontend and backend
npm run build

# Start production server
npm start
```

---

## 📊 Enhanced API Endpoints

### **Authentication & User Management**

```
POST /api/auth/register         # User registration with validation
POST /api/auth/login           # Secure login with MFA support
POST /api/auth/logout          # Secure logout and token cleanup
GET  /api/auth/me             # Get current user profile
POST /api/auth/forgot-password # Password recovery
POST /api/auth/reset-password  # Password reset with token
POST /api/auth/verify-email    # Email verification
```

### **Social Media & Content**

```
GET  /api/feed                 # AI-curated personalized feed
POST /api/posts               # Create post with rich media
PUT  /api/posts/:id           # Edit post content
DELETE /api/posts/:id         # Delete post
POST /api/posts/:id/like      # Like/unlike with reaction types
POST /api/posts/:id/share     # Share post with attribution
GET  /api/posts/:id/comments  # Get threaded comments
POST /api/posts/:id/comments  # Add comment with threading
POST /api/stories             # Create 24-hour story
GET  /api/trending            # Get trending topics and hashtags
```

### **E-Commerce**

```
GET  /api/products            # Search products with filters
POST /api/products            # Create product listing
PUT  /api/products/:id        # Edit product details
DELETE /api/products/:id      # Remove product
POST /api/products/:id/purchase # Purchase product with payment
GET  /api/products/:id/reviews # Get product reviews
POST /api/products/:id/reviews # Add product review
```

### **Crypto Trading**

```
GET  /api/trading/charts      # Get real-time market charts
POST /api/trading/orders      # Create trading order
GET  /api/trading/orders      # List user orders
DELETE /api/trading/orders/:id # Cancel order
GET  /api/trading/wallet      # Get user wallet balance
POST /api/trading/deposit     # Deposit funds
POST /api/trading/withdraw    # Withdraw funds
GET  /api/trading/transactions # List transactions
```

### **Freelancing**

```
GET  /api/freelance/jobs      # Search freelance jobs
POST /api/freelance/jobs      # Post new job
GET  /api/freelance/proposals # List job proposals
POST /api/freelance/proposals # Submit proposal
POST /api/freelance/milestones # Complete project milestone
GET  /api/freelance/projects  # List user projects
```

### **Video Creation**

```
POST /api/video/upload        # Upload video file
POST /api/video/effects      # Apply AR effects
POST /api/video/stream       # Start live stream
POST /api/video/stop         # Stop live stream
GET  /api/video/trending      # Get trending videos
```

### **Real-Time Communication**

```
WS   /ws                    # WebSocket connection for real-time updates
POST /api/chat/messages     # Send chat message
GET  /api/chat/messages     # Get chat history
POST /api/chat/call         # Initiate voice/video call
```

### **Rewards & Gamification**

```
GET  /api/rewards/summary   # Get user reward summary
GET  /api/rewards/history   # Get reward history
POST /api/rewards/activity  # Log user activity for rewards
```

### **Creator Economy**

```
GET  /api/creator/analytics # Get analytics dashboard
POST /api/creator/content   # Submit new content
GET  /api/creator/projects  # List ongoing projects
POST /api/creator/earnings  # Withdraw earnings
```

### **AI-Powered Tools**

```
GET  /api/ai/recommendations # Get content recommendations
POST /api/ai/training       # Train AI model
GET  /api/ai/predictions    # Get AI predictions
```

### **File Management**

```
POST /api/files/upload      # Upload file to storage
GET  /api/files/:id         # Get file metadata
DELETE /api/files/:id       # Remove file
```

### **Payment Processing**

```
POST /api/payments/process  # Process payment
GET  /api/payments/status   # Check payment status
POST /api/payments/subscribe # Create subscription
```

### **Monitoring & Analytics**

```
GET  /api/logs              # Get application logs
GET  /api/metrics           # Get performance metrics
POST /api/tracking          # Log user events
```

---

## 📄 Documentation

- **[Backend Implementation Guide](./BACKEND_IMPLEMENTATION_GUIDE.md)** - Complete technical documentation
- **[Enhanced Reward System](./ENHANCED_REWARD_SYSTEM.md)** - Comprehensive reward system documentation
- **[API Documentation](./docs/api.md)** - Detailed API reference
- **[Database Schema](./docs/database.md)** - Schema documentation
- **[Deployment Guide](./docs/deployment.md)** - Production deployment

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the guides in `/docs`
- **Issues**: Report bugs in GitHub Issues
- **Email**: team@eloity.com
- **Discord**: [Join our community](https://discord.gg/eloity)

---

**Built with ❤️ by the Eloity Team**

🌟 **Star this repo if you find it helpful!**
