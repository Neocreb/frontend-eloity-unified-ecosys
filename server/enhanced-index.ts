import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import multer from 'multer';
import dotenv from 'dotenv';
import winston from 'winston';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and, or, desc, asc, like, sql, count, ilike } from 'drizzle-orm';
import { randomUUID } from 'crypto'; // Import crypto module

// Load environment variables
dotenv.config();

// Import schemas
import { 
  users, 
  posts, 
  followers, 
  post_likes, 
  post_comments, 
  user_sessions,
  user_preferences 
} from '../shared/schema.js';

import { 
  profiles,
  marketplace_profiles,
  freelance_profiles,
  crypto_profiles,
  products,
  orders,
  order_items,
  product_reviews,
  shopping_cart,
  product_categories,
  wishlist,
  store_profiles,
  referral_links,
  referral_events,
  reward_sharing_transactions,
  pioneer_badges,
  user_activity_sessions,
  freelance_jobs
} from '../shared/enhanced-schema.js';

import { 
  freelance_proposals
} from '../shared/freelance-schema.js';

// Import route handlers
import paymentsRouter from './routes/payments.js';
import videoRouter from './routes/video.js';
import cryptoRouter from './routes/crypto.js';
import kycRouter from './routes/kyc.js';
import notificationsRouter from './routes/notifications.js';
import postsRouter from './routes/posts.js';
import profilesRouter from './routes/profiles.js';
import productsRouter from './routes/products.js';
import freelanceRouter from './routes/freelance.js';
import followRouter from './routes/follow.js';
import referralRouter from './routes/referral.js';
import rewardSharingRouter from './routes/rewardSharing.js';
import pioneerBadgeRouter from './routes/pioneerBadge.js';
import adminRouter from './routes/admin.js';
import exploreRouter from './routes/explore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize database connection
const databaseUrl = process.env.DATABASE_URL || 'postgresql://mock:mock@localhost:5432/mock';
if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL not set. Using development fallback.');
  console.warn('⚠️  For production use, please set up a proper database.');
  console.warn('⚠️  Consider connecting to Neon database for persistent storage.');
}

let client, db;
let useMockData = false;

try {
  // Use postgres-js for Supabase connection with additional connection options
  client = postgres(databaseUrl, { 
    ssl: {
      rejectUnauthorized: false
    },
    connect_timeout: 20,
    idle_timeout: 30,
    max_lifetime: 60 * 60
  });
  db = drizzle(client);
  
  // Test the connection
  console.log('🔄 Testing database connection...');
  await client`SELECT 1`;
  console.log('✅ Database connection initialized');
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  console.warn('⚠️  Running in mock mode. Some features may not work.');
  useMockData = true;

  // Create a mock database object for development
  db = {
    select: () => ({ from: () => ({ where: () => ({ execute: async () => [] }) }) }),
    insert: () => ({ values: () => ({ returning: () => ({ execute: async () => [] }) }) }),
    update: () => ({ set: () => ({ where: () => ({ execute: async () => [] }) }) }),
    delete: () => ({ where: () => ({ execute: async () => [] }) })
  };
}

// Make mock mode status available globally
global.useMockData = useMockData;

// Export the database connection for use in routes
export { db };

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'eloity-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const app = express();
const PORT = process.env.PORT || 5002;

// Create HTTP server and WebSocket server
const server = createServer(app);
const wss = new WebSocketServer({ server });

console.log('🚀 Starting Eloity Backend Server...');
console.log('📁 Current directory:', process.cwd());
console.log('🔧 Node version:', process.version);
console.log('🗄️ Database URL configured:', !!databaseUrl);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https:", "wss:"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "same-origin" }
}));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// General middleware
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting with enhanced security
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // requests per window
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      path: req.path
    });
    res.status(429).json({
      error: 'Too many requests, please try again later.',
      retryAfter: Math.round(15 * 60) // seconds
    });
  }
});
app.use('/api/', limiter);

// Session configuration with enhanced security
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  name: 'sessionId', // Change default session name
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' // CSRF protection
  },
  genid: () => {
    // Generate cryptographically secure session IDs using crypto module
    return randomUUID();
  }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Configure file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10, // Maximum 10 files at once
    fieldSize: 100 * 1024, // 100KB field size limit
  },
  fileFilter: (req, file, cb) => {
    // Enhanced security: check both extension and MIME type
    const allowedMimeTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'video/mp4', 'video/avi', 'video/mov',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const allowedExtensions = /\.(jpeg|jpg|png|gif|mp4|avi|mov|pdf|doc|docx)$/i;
    
    // Check MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error(`Invalid file type: ${file.mimetype}`));
    }
    
    // Check file extension
    if (!allowedExtensions.test(file.originalname)) {
      return cb(new Error(`Invalid file extension: ${file.originalname}`));
    }
    
    // Additional security: prevent malicious filenames
    const filename = file.originalname.toLowerCase();
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return cb(new Error('Invalid filename'));
    }
    
    cb(null, true);
  }
});

// JWT utilities
const generateTokens = (userId: string) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' }, 
    process.env.JWT_SECRET || 'your-jwt-secret',
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' }, 
    process.env.JWT_SECRET || 'your-jwt-secret',
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Authentication middleware
const authenticateToken = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret') as any;
    
    if (decoded.type !== 'access') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    // Type guard for userId
    if (typeof decoded.userId !== 'string') {
      return res.status(401).json({ error: 'Invalid user ID in token' });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Admin authentication middleware
const authenticateAdmin = async (req: any, res: any, next: any) => {
  try {
    await authenticateToken(req, res, async () => {
      // Check admin permissions from database
      // For now, allow all authenticated users admin access
      req.adminRole = 'admin';
      req.adminPermissions = ['all'];
      next();
    });
  } catch (error) {
    logger.error('Admin authentication error:', error);
    return res.status(403).json({ error: 'Admin access denied' });
  }
};

// Make middleware available to routes
app.locals.authenticateToken = authenticateToken;
app.locals.authenticateAdmin = authenticateAdmin;

// Serve static files from the frontend build (only in production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../dist')));
}

// =============================================================================
// HEALTH AND STATUS ENDPOINTS
// =============================================================================

app.get('/api/health', async (req, res) => {
  try {
    // Test database connection only if not in mock mode
    if (!global.useMockData) {
      await db.select().from(users).limit(1);
    }
    
    res.json({
      status: 'OK',
      message: 'Eloity Backend Server is running',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      environment: process.env.NODE_ENV,
      database: global.useMockData ? 'mock' : 'connected',
      features: {
        payments: 'enabled',
        video: 'enabled',
        crypto: 'enabled',
        kyc: 'enabled',
        notifications: 'enabled',
        chat: 'enabled'
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/status', authenticateToken, async (req, res) => {
  try {
    const user = await db.select().from(users)
      .where(eq(users.id, req.userId))
      .limit(1);

    if (!user.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user[0].id,
        username: user[0].username,
        full_name: user[0].full_name,
        email: user[0].email,
        avatar_url: user[0].avatar_url,
        is_verified: user[0].is_verified,
        role: user[0].role,
        points: user[0].points,
        level: user[0].level
      },
      authenticated: true,
      server: {
        version: '2.0.0',
        uptime: process.uptime(),
        features: ['payments', 'video', 'crypto', 'kyc', 'notifications']
      }
    });
  } catch (error) {
    logger.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to fetch user status' });
  }
});

// =============================================================================
// API ROUTE HANDLERS
// =============================================================================

// Mount route handlers
app.use('/api/payments', paymentsRouter);
app.use('/api/video', videoRouter);
app.use('/api/crypto', cryptoRouter);
app.use('/api/kyc', kycRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/posts', postsRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/products', productsRouter);
app.use('/api/freelance', freelanceRouter);
app.use('/api/follow', followRouter);
app.use('/api/referral', referralRouter);
app.use('/api/rewards', rewardSharingRouter);
app.use('/api/pioneer', pioneerBadgeRouter);
app.use('/api/admin', adminRouter);
app.use('/api/explore', exploreRouter);

// =============================================================================
// CORE AUTHENTICATION ENDPOINTS
// =============================================================================

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, full_name, username } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    // Check if user already exists
    const existingUser = await db.select().from(users)
      .where(or(eq(users.email, email), eq(users.username, username || '')))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await db.insert(users).values({
      email,
      username: username || email.split('@')[0],
      full_name,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(full_name)}`,
      role: 'user',
      points: 100, // Welcome bonus
      level: 'bronze'
    }).returning();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(newUser[0].id);

    // Create session
    await db.insert(user_sessions).values({
      user_id: newUser[0].id,
      session_token: accessToken,
      refresh_token: refreshToken,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // Create default preferences
    await db.insert(user_preferences).values({
      user_id: newUser[0].id,
      theme: 'light',
      language: 'en',
      notifications: {
        email_notifications: true,
        push_notifications: true,
        marketing_emails: false
      },
      privacy: {
        profile_visibility: 'public',
        show_online_status: true,
        allow_direct_messages: 'everyone'
      }
    });

    logger.info('User registered successfully:', { userId: newUser[0].id, email });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser[0].id,
        username: newUser[0].username,
        full_name: newUser[0].full_name,
        email: newUser[0].email,
        avatar_url: newUser[0].avatar_url,
        points: newUser[0].points,
        level: newUser[0].level
      },
      tokens: { accessToken, refreshToken }
    });
  } catch (error) {
    logger.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await db.select().from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user[0].id);

    // Update or create session
    await db.insert(user_sessions).values({
      user_id: user[0].id,
      session_token: accessToken,
      refresh_token: refreshToken,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Update last active
    await db.update(users)
      .set({ 
        last_active: new Date(),
        is_online: true
      })
      .where(eq(users.id, user[0].id));

    logger.info('User signed in successfully:', { userId: user[0].id, email });

    res.json({
      message: 'Signed in successfully',
      user: {
        id: user[0].id,
        username: user[0].username,
        full_name: user[0].full_name,
        email: user[0].email,
        avatar_url: user[0].avatar_url,
        is_verified: user[0].is_verified,
        role: user[0].role,
        points: user[0].points,
        level: user[0].level
      },
      tokens: { accessToken, refreshToken }
    });
  } catch (error) {
    logger.error('Signin error:', error);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

app.post('/api/auth/signout', authenticateToken, async (req, res) => {
  try {
    // Type guard for userId
    if (typeof req.userId !== 'string') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Deactivate user sessions
    await db.update(user_sessions)
      .set({ is_active: false })
      .where(eq(user_sessions.user_id, req.userId));

    // Update user status
    await db.update(users)
      .set({ is_online: false })
      .where(eq(users.id, req.userId));

    logger.info('User signed out successfully:', { userId: req.userId });

    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    logger.error('Signout error:', error);
    res.status(500).json({ error: 'Failed to sign out' });
  }
});

// =============================================================================
// FILE UPLOAD ENDPOINTS
// =============================================================================

app.post('/api/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: 'File uploaded successfully',
      fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    logger.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// =============================================================================
// WEBSOCKET FOR REAL-TIME FEATURES
// =============================================================================

// Create a map to store active connections
const activeConnections = new Map<string, WebSocket>();

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');

  // Handle incoming messages
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      switch (data.type) {
        case 'authenticate':
          try {
            const decoded = jwt.verify(data.token, process.env.JWT_SECRET || 'your-jwt-secret') as any;
            if (typeof decoded.userId === 'string') {
              (ws as any).userId = decoded.userId;
              activeConnections.set(decoded.userId, ws);
              ws.send(JSON.stringify({ type: 'authenticated', success: true }));
            } else {
              ws.send(JSON.stringify({ type: 'authenticated', success: false, error: 'Invalid user ID' }));
            }
          } catch (error) {
            ws.send(JSON.stringify({ type: 'authenticated', success: false, error: 'Invalid token' }));
          }
          break;

        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;

        case 'chat_message':
          if ((ws as any).userId) {
            // Broadcast to conversation participants
            // Implementation would involve checking conversation participants
            // and sending to their active connections
          }
          break;

        case 'live_stream_join':
          if ((ws as any).userId && data.streamId) {
            // Join live stream room
            (ws as any).streamId = data.streamId;
            ws.send(JSON.stringify({ 
              type: 'stream_joined', 
              streamId: data.streamId,
              viewerCount: getStreamViewerCount(data.streamId)
            }));
          }
          break;

        case 'trading_subscribe':
          if ((ws as any).userId && data.symbols) {
            // Subscribe to trading pairs
            (ws as any).tradingSymbols = data.symbols;
            ws.send(JSON.stringify({ 
              type: 'trading_subscribed', 
              symbols: data.symbols 
            }));
          }
          break;

        default:
          ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  });

  // Handle connection close
  ws.on('close', () => {
    console.log('WebSocket connection closed');
    if ((ws as any).userId) {
      activeConnections.delete((ws as any).userId);
    }
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Helper function for WebSocket
function getStreamViewerCount(streamId: string): number {
  let count = 0;
  activeConnections.forEach((ws) => {
    if ((ws as any).streamId === streamId) {
      count++;
    }
  });
  return count;
}

// =============================================================================
// ERROR HANDLING MIDDLEWARE
// =============================================================================

app.use((err: any, req: any, res: any, next: any) => {
  logger.error('Unhandled error:', err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large' });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Unexpected field' });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Catch-all handler: send back the frontend's index.html file (only in production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../dist/index.html'));
  });
} else {
  // In development, just return a simple message for non-API routes
  app.get('*', (req, res) => {
    res.json({
      message: 'Eloity Backend API server running in development mode',
      version: '2.0.0',
      frontend: 'Served by Vite on port 8080',
      api: 'Available at /api/*',
      websocket: 'Available for real-time features',
      features: {
        payments: 'African payment processors (Flutterwave, Paystack, MTN MoMo, Orange Money)',
        video: 'Video upload, livestreaming, watch2earn',
        crypto: 'P2P trading, escrow, wallets, price feeds',
        kyc: 'Identity verification (Smile Identity, Veriff, Youverify)',
        notifications: 'SMS, Email, Push, WhatsApp, Voice calls',
        admin: 'Content moderation, analytics, user management'
      }
    });
  });
}

// =============================================================================
// SERVER STARTUP
// =============================================================================

console.log(`🔄 Attempting to start server on port ${PORT}...`);

server.listen(PORT, () => {
  console.log(`✅ Eloity Backend server successfully started!`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌐 WebSocket server running on ws://localhost:${PORT}`);

  if (process.env.NODE_ENV === 'production') {
    console.log(`📁 Serving static files from: ${join(__dirname, '../dist')}`);
  } else {
    console.log(`🔧 Development mode: Static files served by Vite (port 8080)`);
  }

  console.log(` Geli API endpoints available at: http://localhost:${PORT}/api`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Comprehensive Features:`);
  console.log(`   💳 Payments: African processors (Flutterwave, Paystack, MTN MoMo)`);
  console.log(`   🎥 Video: Upload, livestreaming, watch2earn rewards`);
  console.log(`   💰 Crypto: P2P trading, escrow, wallets, price feeds`);
  console.log(`   🆔 KYC: Identity verification (Smile Identity, Veriff)`);
  console.log(`   📱 Notifications: SMS, Email, Push, WhatsApp, Voice`);
  console.log(`   🛡️  Security: JWT auth, rate limiting, input validation`);
  console.log(`   🌍 Global: Multi-currency, multi-language support`);
  
  logger.info('Server started successfully', { 
    port: PORT, 
    environment: process.env.NODE_ENV,
    database: !!databaseUrl,
    version: '2.0.0',
    features: ['payments', 'video', 'crypto', 'kyc', 'notifications', 'admin', 'chat', 'social']
  });
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  console.error('🔍 Error details:', err.message);
  logger.error('Server startup failed:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
