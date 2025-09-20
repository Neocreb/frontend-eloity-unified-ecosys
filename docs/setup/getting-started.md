# 🚀 Getting Started with Eloity

This guide will help you set up the Eloity platform for local development.

## 📋 Prerequisites

- **Node.js 18+** and npm 9+
- **PostgreSQL** database
- **Git** for version control
- **Code Editor** (VSCode recommended)

## ⚡ Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/eloity-platform.git
cd eloity-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the environment template:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/eloity

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Session
SESSION_SECRET=your-session-secret

# Frontend URL
FRONTEND_URL=http://localhost:8080

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 4. Database Setup

Generate and apply database migrations:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 5. Admin Setup

Create the default admin user:

```bash
npm run create-admin
```

This creates an admin account with:
- Email: admin@eloity.com
- Password: Eloity2024!
- Access: `/admin/login`

⚠️ **Security:** Change the default password immediately after first login.

### 6. Start Development Server

Run both frontend and backend:

```bash
npm run dev
```

This starts:
- Frontend: http://localhost:8080
- Backend API: http://localhost:5000

## 🎯 What's Included

### Default Accounts

The seed script creates these test accounts:

**Admin Account:**
- Email: admin@eloity.com
- Password: admin123

**Regular User:**
- Email: user@eloity.com
- Password: user123

### Core Features Available

- ✅ Social Media Feed
- ✅ User Authentication
- ✅ Real-time Chat
- ✅ Basic Marketplace
- ✅ Crypto Trading (Demo)
- ✅ Admin Dashboard

## 🛠️ Development Commands

```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend

# Build for production
npm run build

# Database operations
npm run db:generate    # Generate migrations
npm run db:push       # Apply to database
npm run db:studio     # Open database browser

# Code quality
npm run check         # TypeScript checking
npm run lint          # Linting (when configured)
```

## 📂 Project Structure

```
eloity-platform/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── server/                # Backend source code
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── services/          # Business logic
│   └── utils/             # Server utilities
├── shared/                # Shared code (types, schemas)
├── docs/                  # Documentation
└── migrations/            # Database migrations
```

## 🔧 Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/eloity` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `SESSION_SECRET` | Session encryption key | `your-session-secret` |
| `PORT` | Backend server port | `5000` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:8080` |

### Optional Services

For full functionality, configure these services:

- **Stripe** - Payment processing
- **AWS S3** - File storage
- **SendGrid** - Email service
- **Redis** - Caching (recommended for production)

See [External Services Setup](./external-services.md) for detailed configuration.

## 🚀 Next Steps

1. **[Feature Overview](../features/core-features.md)** - Explore platform capabilities
2. **[Development Guide](../development/development-guide.md)** - Learn the codebase
3. **[API Documentation](../api/api-reference.md)** - Understand the API
4. **[Contributing](../development/contributing.md)** - How to contribute

## ❓ Troubleshooting

### Common Issues

**Database Connection Fails:**
```bash
# Check PostgreSQL is running
pg_ctl status

# Verify connection string in .env
DATABASE_URL=postgresql://username:password@localhost:5432/eloity
```

**Port Already in Use:**
```bash
# Check what's using the port
lsof -i :5000

# Change port in .env
PORT=3001
```

**Build Errors:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear TypeScript cache
npx tsc --build --clean
```

**Need Help?**
- Check [Troubleshooting Guide](../development/troubleshooting.md)
- Open an issue on GitHub
- Join our Discord community

---

**Ready to build something amazing? 🚀**