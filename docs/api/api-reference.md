# 🔌 API Reference

Complete API documentation for the Eloity platform.

## 🌐 API Overview

### Base URL
```
Development: http://localhost:5000/api
Production: https://api.eloity.com/api
```

### Authentication
All protected endpoints require authentication via JWT Bearer token:

```http
Authorization: Bearer <your-jwt-token>
```

### Response Format
All API responses follow this consistent format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Success response
{
  "success": true,
  "data": { /* response data */ }
}

// Error response
{
  "success": false,
  "error": "Error message",
  "message": "Additional context"
}
```

## 🔐 Authentication Endpoints

### Register User
Create a new user account.

```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "token": "jwt-token-here",
    "refreshToken": "refresh-token-here"
  }
}
```

### Login User
Authenticate existing user.

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "jwt-token-here",
    "refreshToken": "refresh-token-here"
  }
}
```

### Refresh Token
Get new access token using refresh token.

```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "refresh-token-here"
}
```

### Logout
Invalidate current session.

```http
POST /auth/logout
Authorization: Bearer <token>
```

## 👤 User Management

### Get Current User
Retrieve authenticated user's profile.

```http
GET /users/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "User bio",
    "role": "user",
    "premiumStatus": "free",
    "eloitsBalance": 1500,
    "followersCount": 42,
    "followingCount": 33,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update User Profile
Update user profile information.

```http
PUT /users/me
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "bio": "Updated bio",
  "avatar": "new-avatar-url"
}
```

### Get User Profile
Get public profile of any user.

```http
GET /users/:userId
```

### Follow/Unfollow User
```http
POST /users/:userId/follow
DELETE /users/:userId/follow
Authorization: Bearer <token>
```

## 📱 Social Media Posts

### Get Feed
Retrieve personalized user feed.

```http
GET /posts/feed
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Posts per page (default: 20)
- `type` (string): Filter by post type

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "post-123",
        "content": "Post content here",
        "media": [
          {
            "type": "image",
            "url": "https://example.com/image.jpg",
            "thumbnail": "https://example.com/thumb.jpg"
          }
        ],
        "author": {
          "id": "user-456",
          "name": "Jane Doe",
          "avatar": "https://example.com/avatar.jpg",
          "verified": true
        },
        "stats": {
          "likes": 42,
          "comments": 12,
          "shares": 3,
          "views": 156
        },
        "userInteraction": {
          "liked": false,
          "bookmarked": false,
          "following": true
        },
        "createdAt": "2024-01-01T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "hasNext": true
    }
  }
}
```

### Create Post
Create a new social media post.

```http
POST /posts
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "Post content here",
  "media": [
    {
      "type": "image",
      "url": "https://example.com/image.jpg"
    }
  ],
  "hashtags": ["#eloity", "#social"],
  "privacy": "public"
}
```

### Like/Unlike Post
```http
POST /posts/:postId/like
DELETE /posts/:postId/like
Authorization: Bearer <token>
```

### Get Post Comments
```http
GET /posts/:postId/comments
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Comments per page

### Add Comment
```http
POST /posts/:postId/comments
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "Comment content",
  "parentId": "comment-123" // Optional for replies
}
```

## 🛒 Marketplace

### Get Products
Retrieve marketplace products.

```http
GET /marketplace/products
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Products per page
- `category` (string): Filter by category
- `search` (string): Search query
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `sortBy` (string): Sort by field (price, rating, date)
- `sortOrder` (string): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "product-123",
        "title": "Amazing Product",
        "description": "Product description",
        "price": 29.99,
        "currency": "USD",
        "images": [
          "https://example.com/product1.jpg"
        ],
        "category": {
          "id": "cat-1",
          "name": "Electronics"
        },
        "seller": {
          "id": "seller-123",
          "name": "Store Name",
          "rating": 4.8
        },
        "stats": {
          "rating": 4.5,
          "reviewCount": 42,
          "soldCount": 156
        },
        "inStock": true,
        "variants": [
          {
            "id": "variant-1",
            "name": "Color",
            "options": ["Red", "Blue", "Green"]
          }
        ]
      }
    ],
    "pagination": { /* pagination info */ },
    "filters": {
      "categories": [ /* available categories */ ],
      "priceRange": { "min": 0, "max": 500 }
    }
  }
}
```

### Get Product Details
```http
GET /marketplace/products/:productId
```

### Add to Cart
```http
POST /marketplace/cart/items
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": "product-123",
  "variantId": "variant-1",
  "quantity": 2
}
```

### Get Cart
```http
GET /marketplace/cart
Authorization: Bearer <token>
```

### Checkout
```http
POST /marketplace/checkout
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": "product-123",
      "variantId": "variant-1",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "City Name",
    "state": "State",
    "postalCode": "12345",
    "country": "US"
  },
  "paymentMethod": "stripe_card_xxx"
}
```

## 💰 Cryptocurrency

### Get Crypto Prices
```http
GET /crypto/prices
```

**Query Parameters:**
- `symbols` (string): Comma-separated crypto symbols (BTC,ETH,ADA)

**Response:**
```json
{
  "success": true,
  "data": {
    "BTC": {
      "symbol": "BTC",
      "name": "Bitcoin",
      "price": 45000.50,
      "change24h": 2.5,
      "volume24h": 25000000000,
      "marketCap": 850000000000
    },
    "ETH": {
      "symbol": "ETH",
      "name": "Ethereum",
      "price": 3200.75,
      "change24h": -1.2,
      "volume24h": 15000000000,
      "marketCap": 380000000000
    }
  }
}
```

### Get User Portfolio
```http
GET /crypto/portfolio
Authorization: Bearer <token>
```

### Create Trade Order
```http
POST /crypto/orders
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "buy", // or "sell"
  "orderType": "market", // "market", "limit", "stop"
  "symbol": "BTC",
  "amount": 0.1,
  "price": 45000.50, // For limit orders
  "stopPrice": 44000.00 // For stop orders
}
```

### Get Trade History
```http
GET /crypto/trades
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Trades per page
- `symbol` (string): Filter by crypto symbol

## 💼 Freelance Platform

### Get Projects
```http
GET /freelance/projects
```

**Query Parameters:**
- `category` (string): Project category
- `budget_min` (number): Minimum budget
- `budget_max` (number): Maximum budget
- `skills` (string): Required skills (comma-separated)
- `status` (string): Project status

**Response:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "project-123",
        "title": "Website Development",
        "description": "Build a modern website",
        "budget": {
          "type": "fixed", // "fixed" or "hourly"
          "amount": 2500,
          "currency": "USD"
        },
        "deadline": "2024-02-01T00:00:00Z",
        "skills": ["React", "Node.js", "TypeScript"],
        "client": {
          "id": "client-123",
          "name": "Company Name",
          "rating": 4.8,
          "projectsPosted": 15
        },
        "status": "open",
        "proposalsCount": 12,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": { /* pagination info */ }
  }
}
```

### Submit Proposal
```http
POST /freelance/projects/:projectId/proposals
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "coverLetter": "Proposal cover letter",
  "budget": {
    "amount": 2000,
    "currency": "USD"
  },
  "timeline": "2 weeks",
  "milestones": [
    {
      "title": "Design Phase",
      "amount": 500,
      "deadline": "2024-01-15T00:00:00Z"
    }
  ]
}
```

## 💬 Chat & Messaging

### Get Conversations
```http
GET /chat/conversations
Authorization: Bearer <token>
```

### Send Message
```http
POST /chat/conversations/:conversationId/messages
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "Message content",
  "type": "text", // "text", "image", "file", "voice"
  "media": {
    "url": "https://example.com/file.jpg",
    "filename": "image.jpg",
    "size": 1024000
  }
}
```

### Get Messages
```http
GET /chat/conversations/:conversationId/messages
Authorization: Bearer <token>
```

## 🤖 AI Assistant

### Chat with AI
```http
POST /ai/chat
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "message": "Hello, can you help me with trading?",
  "context": {
    "page": "crypto-trading",
    "previousMessages": 5
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Hello! I'd be happy to help you with crypto trading...",
    "confidence": 95,
    "suggestedActions": [
      {
        "label": "View Trading Guide",
        "action": "navigate",
        "url": "/crypto/guide"
      }
    ],
    "followUpQuestions": [
      "What cryptocurrency are you interested in?",
      "Are you a beginner or experienced trader?"
    ]
  }
}
```

## 📊 Analytics & Stats

### Get User Stats
```http
GET /analytics/user/stats
Authorization: Bearer <token>
```

### Get Platform Stats
```http
GET /analytics/platform/stats
Authorization: Bearer <token>
```

## 🔔 Notifications

### Get Notifications
```http
GET /notifications
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Notifications per page
- `type` (string): Filter by notification type
- `unread` (boolean): Filter unread notifications

### Mark as Read
```http
PUT /notifications/:notificationId/read
Authorization: Bearer <token>
```

### Get Notification Settings
```http
GET /notifications/settings
Authorization: Bearer <token>
```

### Update Notification Settings
```http
PUT /notifications/settings
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email": {
    "newFollower": true,
    "newMessage": false,
    "marketingEmails": false
  },
  "push": {
    "newLike": true,
    "newComment": true,
    "priceAlerts": true
  }
}
```

## 🎁 Rewards System

### Get Eloits Balance
```http
GET /rewards/balance
Authorization: Bearer <token>
```

### Get Earnings History
```http
GET /rewards/earnings
Authorization: Bearer <token>
```

### Redeem Eloits
```http
POST /rewards/redeem
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "cash", // "cash", "premium", "merchandise"
  "amount": 1000,
  "details": {
    "paymentMethod": "paypal_email@example.com"
  }
}
```

## ⚠️ Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 422 | Validation Error - Input validation failed |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

## 📡 WebSocket Events

### Connection
```javascript
const ws = new WebSocket('ws://localhost:5000');
```

### Authentication
```json
{
  "type": "authenticate",
  "token": "jwt-token-here"
}
```

### Real-time Events

#### New Message
```json
{
  "type": "new_message",
  "data": {
    "conversationId": "conv-123",
    "message": { /* message object */ }
  }
}
```

#### Live Notifications
```json
{
  "type": "notification",
  "data": {
    "id": "notif-123",
    "type": "new_follower",
    "message": "John Doe started following you",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

#### Price Updates
```json
{
  "type": "price_update",
  "data": {
    "symbol": "BTC",
    "price": 45100.25,
    "change": 0.25
  }
}
```

---

**This API reference provides comprehensive documentation for integrating with the Eloity platform.** 🚀