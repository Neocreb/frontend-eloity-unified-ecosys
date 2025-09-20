# Eloity Backend Implementation Guide

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Authentication & Authorization](#authentication--authorization)
6. [Real-time Features](#real-time-features)
7. [Service Layer](#service-layer)
8. [Development Setup](#development-setup)
9. [Production Deployment](#production-deployment)
10. [Missing Backend Features](#missing-backend-features)

## Architecture Overview

Eloity is a comprehensive social media and marketplace platform built with a modern **Express.js + TypeScript** backend architecture. The platform integrates multiple features including:

- **Social Media Feed** - Posts, comments, likes, follows
- **Marketplace** - Product listings, orders, payments
- **Cryptocurrency Trading** - P2P trading, portfolio management
- **Freelance Platform** - Job postings, proposals, project management
- **Real-time Chat** - Messaging and notifications
- **Wallet System** - Multi-source earnings and payments
- **Content Management** - Video creation, blog integration

### Current Backend Structure

```
server/
├── index.ts          # Main server entry point
├── routes.ts         # API route definitions (1985 lines)
├── db.ts            # Database configuration
├── storage.ts       # Data access layer
├── vite.ts          # Development server setup
└── ...

shared/
└── schema.ts        # Database schema definitions

src/services/        # Business logic layer
├── authService.ts
├── freelanceService.ts
├── cryptoService.ts
├── walletService.ts
├── marketplaceService.ts
├── chatService.ts
└── ... (25+ services)
```

## Technology Stack

### Core Technologies

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 4.21.2
- **Database**: PostgreSQL via Neon (Serverless)
- **ORM**: Drizzle ORM 0.39.1
- **Authentication**: Passport.js with local strategy
- **Session Management**: express-session with MemoryStore
- **Real-time**: WebSockets (ws library)
- **Validation**: Zod with drizzle-zod integration

### Development Dependencies

- **Build Tool**: Vite + esbuild
- **Type Checking**: TypeScript 5.6.3
- **Database Migrations**: drizzle-kit
- **Process Manager**: tsx (for development)

### Production Considerations

- **Deployment**: Vercel (configured via vercel.json)
- **Environment**: NODE_ENV-based configuration
- **Database**: Neon Postgres (serverless)
- **File Storage**: Needs implementation (see Missing Features)

## Database Schema

### Core Tables

#### Users & Profiles

```sql
-- Users table (authentication)
users (
  id: uuid PRIMARY KEY,
  email: text UNIQUE NOT NULL,
  password: text NOT NULL,
  email_confirmed: boolean DEFAULT false,
  created_at: timestamp DEFAULT now(),
  updated_at: timestamp DEFAULT now()
)

-- Profiles table (user information)
profiles (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  username: text UNIQUE,
  full_name: text,
  bio: text,
  avatar_url: text,
  is_verified: boolean DEFAULT false,
  level: text DEFAULT 'bronze',
  points: integer DEFAULT 0,
  role: text DEFAULT 'user',
  bank_account_name: text,
  bank_account_number: text,
  bank_name: text,
  preferences: jsonb
)
```

#### Social Media

```sql
-- Posts table
posts (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  content: text NOT NULL,
  image_url: text,
  video_url: text,
  type: text DEFAULT 'post',
  tags: text[],
  eloits: integer,
  created_at: timestamp DEFAULT now()
)

-- Post interactions
post_likes (
  id: uuid PRIMARY KEY,
  post_id: uuid REFERENCES posts(id),
  user_id: uuid REFERENCES users(id),
  created_at: timestamp DEFAULT now()
)

post_comments (
  id: uuid PRIMARY KEY,
  post_id: uuid REFERENCES posts(id),
  user_id: uuid REFERENCES users(id),
  content: text NOT NULL,
  created_at: timestamp DEFAULT now()
)

-- User relationships
followers (
  id: uuid PRIMARY KEY,
  follower_id: uuid REFERENCES users(id),
  following_id: uuid REFERENCES users(id),
  created_at: timestamp DEFAULT now()
)
```

#### Marketplace

```sql
products (
  id: uuid PRIMARY KEY,
  seller_id: uuid REFERENCES users(id),
  name: text NOT NULL,
  description: text NOT NULL,
  price: decimal(10,2) NOT NULL,
  discount_price: decimal(10,2),
  category: text,
  image_url: text,
  in_stock: boolean DEFAULT true,
  is_featured: boolean DEFAULT false,
  is_sponsored: boolean DEFAULT false,
  boost_until: timestamp,
  rating: decimal(3,2),
  review_count: integer DEFAULT 0
)
```

#### Freelance Platform

```sql
-- Job postings
freelance_jobs (
  id: uuid PRIMARY KEY,
  client_id: uuid REFERENCES users(id),
  title: text NOT NULL,
  description: text NOT NULL,
  category: text NOT NULL,
  budget_type: text NOT NULL, -- 'fixed' or 'hourly'
  budget_amount: decimal(10,2),
  deadline: timestamp,
  experience_level: text NOT NULL,
  skills: text[] NOT NULL,
  status: text DEFAULT 'open'
)

-- Freelancer proposals
freelance_proposals (
  id: uuid PRIMARY KEY,
  job_id: uuid REFERENCES freelance_jobs(id),
  freelancer_id: uuid REFERENCES users(id),
  cover_letter: text NOT NULL,
  proposed_rate_type: text NOT NULL,
  proposed_amount: decimal(10,2) NOT NULL,
  delivery_time: text NOT NULL,
  status: text DEFAULT 'pending'
)

-- Active projects
freelance_projects (
  id: uuid PRIMARY KEY,
  job_id: uuid REFERENCES freelance_jobs(id),
  proposal_id: uuid REFERENCES freelance_proposals(id),
  freelancer_id: uuid REFERENCES users(id),
  client_id: uuid REFERENCES users(id),
  status: text DEFAULT 'active',
  agreed_budget: decimal(10,2) NOT NULL,
  paid_amount: decimal(10,2) DEFAULT 0,
  escrow_id: uuid
)

-- Project milestones
project_milestones (
  id: uuid PRIMARY KEY,
  project_id: uuid REFERENCES freelance_projects(id),
  title: text NOT NULL,
  description: text NOT NULL,
  amount: decimal(10,2) NOT NULL,
  due_date: timestamp NOT NULL,
  status: text DEFAULT 'pending'
)

-- Escrow system
freelance_escrow (
  id: uuid PRIMARY KEY,
  project_id: uuid REFERENCES freelance_projects(id),
  amount: decimal(15,8) NOT NULL,
  crypto_type: text NOT NULL,
  contract_address: text,
  transaction_hash: text,
  status: text DEFAULT 'pending'
)
```

#### Cryptocurrency & Trading

```sql
-- P2P trading offers
p2p_offers (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  offer_type: text NOT NULL, -- 'buy' or 'sell'
  crypto_type: text NOT NULL,
  amount: decimal(15,8) NOT NULL,
  price_per_unit: decimal(10,2) NOT NULL,
  payment_method: text NOT NULL,
  status: text DEFAULT 'active',
  expires_at: timestamp NOT NULL
)

-- Completed trades
trades (
  id: uuid PRIMARY KEY,
  offer_id: uuid REFERENCES p2p_offers(id),
  buyer_id: uuid REFERENCES users(id),
  seller_id: uuid REFERENCES users(id),
  amount: decimal(15,8) NOT NULL,
  total_amount: decimal(15,2) NOT NULL,
  payment_method: text NOT NULL,
  status: text DEFAULT 'pending',
  escrow_id: uuid
)
```

#### Communication

```sql
-- Chat system
chat_conversations (
  id: uuid PRIMARY KEY,
  participants: text[] NOT NULL,
  created_at: timestamp DEFAULT now()
)

chat_messages (
  id: uuid PRIMARY KEY,
  conversation_id: uuid REFERENCES chat_conversations(id),
  sender_id: uuid REFERENCES users(id),
  content: text NOT NULL,
  read: boolean DEFAULT false,
  created_at: timestamp DEFAULT now()
)

-- Notifications
notifications (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  title: text NOT NULL,
  content: text NOT NULL,
  type: text NOT NULL,
  read: boolean DEFAULT false,
  related_user_id: uuid REFERENCES users(id),
  related_post_id: uuid REFERENCES posts(id),
  created_at: timestamp DEFAULT now()
)
```

## API Endpoints

### Authentication

```
POST /api/auth/signup
POST /api/auth/signin
POST /api/auth/signout
GET  /api/auth/user
```

### User Profiles

```
GET  /api/profiles/:userId
GET  /api/profiles/username/:username
PUT  /api/profiles/:userId
```

### Social Feed

```
GET  /api/posts              # Get feed posts
POST /api/posts              # Create new post
GET  /api/posts/:id          # Get specific post
PUT  /api/posts/:id          # Update post
DELETE /api/posts/:id        # Delete post
POST /api/posts/:id/like     # Like/unlike post
POST /api/posts/:id/comment  # Add comment
GET  /api/posts/:id/comments # Get comments
```

### Marketplace

```
GET  /api/products           # Get products
POST /api/products           # Create product
GET  /api/products/:id       # Get product details
PUT  /api/products/:id       # Update product
DELETE /api/products/:id     # Delete product
GET  /api/products/seller/:sellerId # Get seller's products
```

### Freelance Platform

```
GET  /api/freelance/jobs     # Get job listings
POST /api/freelance/jobs     # Post new job
GET  /api/freelance/jobs/:id # Get job details
GET  /api/freelance/proposals # Get proposals
POST /api/freelance/proposals # Submit proposal
GET  /api/freelance/projects  # Get active projects
GET  /api/talents            # Get freelancer profiles
GET  /api/talents/:id        # Get talent details
```

### Cryptocurrency

```
GET  /api/crypto/currencies  # Get crypto data
GET  /api/crypto/market      # Get market overview
GET  /api/crypto/portfolio   # Get user portfolio
GET  /api/crypto/p2p/offers  # Get P2P offers
POST /api/crypto/p2p/offers  # Create P2P offer
GET  /api/crypto/trades      # Get trading history
```

### Wallet & Payments

```
GET  /api/wallet             # Get wallet balance
GET  /api/wallet/transactions # Get transaction history
POST /api/wallet/withdraw    # Process withdrawal
POST /api/wallet/deposit     # Process deposit
GET  /api/wallet/bank-accounts # Get bank accounts
POST /api/wallet/bank-accounts # Add bank account
```

### Blog & Content

```
GET  /api/blog/rss          # RSS feed
GET  /api/blog/posts        # Get blog posts
GET  /api/blog/posts/:slug  # Get specific post
```

### Real-time (WebSocket)

```
WS   /ws                    # WebSocket connection
- chat:message              # Chat messages
- notification:new          # New notifications
- trading:update            # Trading updates
- feed:update               # Feed updates
```

## Authentication & Authorization

### Current Implementation

- **Strategy**: Passport.js with local authentication
- **Session**: Express-session with MemoryStore
- **Password**: Plain text storage (SECURITY ISSUE - needs hashing)

### Security Improvements Needed

```typescript
// Implement password hashing
import bcrypt from "bcryptjs";

// Hash password before storage
const hashedPassword = await bcrypt.hash(password, 12);

// Verify password during login
const isValid = await bcrypt.compare(password, user.hashedPassword);
```

### JWT Implementation (Recommended)

```typescript
import jwt from "jsonwebtoken";

// Generate token
const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: "24h" },
);

// Verify middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid token" });
  }
};
```

### Role-Based Access Control

```typescript
// Middleware for role checking
const requireRole = (roles: string[]) => {
  return async (req, res, next) => {
    const user = await storage.getUserById(req.user.userId);
    const profile = await storage.getProfileByUserId(user.id);

    if (!roles.includes(profile.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Usage
app.delete('/api/users/:id', authenticateToken, requireRole(['admin']), ...);
```

## Real-time Features

### WebSocket Implementation

```typescript
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (ws, req) => {
  const userId = extractUserFromToken(req);

  ws.on("message", async (data) => {
    const message = JSON.parse(data.toString());

    switch (message.type) {
      case "chat:send":
        await handleChatMessage(message, userId);
        break;
      case "trading:subscribe":
        await subscribeToTradingUpdates(ws, message.pairs);
        break;
      case "feed:subscribe":
        await subscribeToFeedUpdates(ws, userId);
        break;
    }
  });
});
```

### Real-time Events

- **Chat Messages**: Instant delivery
- **Trading Updates**: Price changes, order book updates
- **Notifications**: Likes, comments, follows
- **Feed Updates**: New posts from followed users
- **Freelance Updates**: New proposals, project status

## Service Layer

### Architecture Pattern

The application uses a service-oriented architecture with 25+ specialized services:

#### Core Services

```typescript
// Authentication Service
export const authService = {
  signIn(email: string, password: string),
  signUp(name: string, email: string, password: string),
  getCurrentSession(),
  enhanceUserWithProfile(user: User)
};

// Freelance Service
export const freelanceService = {
  searchJobs(filters: SearchFilters),
  createJobPosting(job: JobData),
  submitProposal(proposal: ProposalData),
  getProjects(userId: string, userType: 'freelancer' | 'client'),
  updateProjectStatus(id: string, status: ProjectStatus)
};

// Crypto Service
export class CryptoService {
  getCryptocurrencies(limit?: number),
  getMarketData(),
  getPortfolio(),
  getP2POffers(filters?: OfferFilters),
  createP2POffer(offerData: OfferData)
}

// Wallet Service
export const walletService = {
  getWalletBalance(),
  getTransactions(source?: string, limit?: number),
  processWithdrawal(request: WithdrawalRequest),
  processDeposit(request: DepositRequest)
};
```

### Service Integration

Services are integrated into the API routes and provide:

- **Data Validation**: Zod schemas
- **Business Logic**: Complex operations
- **Error Handling**: Consistent error responses
- **Mock Data**: Development fallbacks
- **API Integration**: External service calls

## Development Setup

### Prerequisites

```bash
# Node.js 18+
node --version

# Package manager (npm/yarn/pnpm)
npm --version
```

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Authentication
JWT_SECRET="your-secret-key"
SESSION_SECRET="session-secret"

# External APIs
CRYPTO_API_KEY="your-crypto-api-key"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# File Storage
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_S3_BUCKET="your-bucket-name"
```

### Installation & Startup

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:push

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Database Setup

```bash
# Initialize Drizzle
npx drizzle-kit generate

# Push schema to database
npx drizzle-kit push

# View database in Drizzle Studio
npx drizzle-kit studio
```

## Production Deployment

### Build Process

```bash
# Frontend build
vite build

# Backend build
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Combined output
dist/
├── index.js        # Backend bundle
├── assets/         # Frontend assets
└── index.html      # Frontend entry
```

### Vercel Configuration

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/dist/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Production Considerations

1. **Database**: Use connection pooling for Neon
2. **Sessions**: Implement Redis for session storage
3. **File Storage**: Configure AWS S3 or similar
4. **Monitoring**: Add logging and error tracking
5. **Security**: HTTPS, CORS, rate limiting
6. **Caching**: Redis for frequently accessed data

## Missing Backend Features

### Critical Security Issues

1. **Password Hashing**: Currently storing plain text passwords
2. **JWT Implementation**: No token-based authentication
3. **Input Validation**: Limited validation on API endpoints
4. **Rate Limiting**: No protection against abuse
5. **CORS Configuration**: Basic CORS setup only

### File Upload System

```typescript
// Implement file upload with multer + AWS S3
import multer from "multer";
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `uploads/${Date.now()}-${req.file.originalname}`,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };

  const result = await s3.upload(params).promise();
  res.json({ url: result.Location });
});
```

### Payment Integration

```typescript
// Stripe integration for marketplace
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post("/api/payments/create-intent", async (req, res) => {
  const { amount, currency = "usd" } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency,
    metadata: { userId: req.user.id },
  });

  res.json({ clientSecret: paymentIntent.client_secret });
});
```

### Email Service

```typescript
// Email service with SendGrid/Nodemailer
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransporter({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const emailService = {
  async sendWelcomeEmail(user: User) {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Welcome to Eloity!",
      html: generateWelcomeEmailHTML(user),
    });
  },
};
```

### Advanced Features Needed

1. **Search Engine**: Elasticsearch for content search
2. **Caching Layer**: Redis for performance
3. **Background Jobs**: Bull queue for async processing
4. **API Documentation**: Swagger/OpenAPI
5. **Testing Suite**: Jest with supertest
6. **Monitoring**: APM and health checks
7. **Backup System**: Automated database backups

### Integration Services

1. **Push Notifications**: Firebase or OneSignal
2. **Video Streaming**: AWS S3 + CloudFront
3. **Image Processing**: Sharp for resizing/optimization
4. **Analytics**: Custom analytics or Google Analytics
5. **Logging**: Winston or structured logging

This comprehensive guide provides everything needed to understand, extend, and deploy the Eloity backend. The platform has a solid foundation but requires security improvements and additional integrations for production readiness.
