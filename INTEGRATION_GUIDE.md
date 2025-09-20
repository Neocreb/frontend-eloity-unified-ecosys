# 🚀 Eloity Platform Integration Guide

## 📋 Overview

This guide provides comprehensive instructions for integrating real external services with the Eloity platform. All APIs are currently implemented with mock services that can be easily replaced with actual integrations.

## 🎯 Quick Setup Checklist

### Essential Integrations (Required for Production)
- [ ] Database (Neon PostgreSQL)
- [ ] Authentication system
- [ ] Payment processor (Flutterwave/Paystack)
- [ ] SMS service (Africa's Talking/Termii)
- [ ] Email service (SendGrid/Mailgun)
- [ ] File storage (AWS S3/Cloudflare R2)

### Enhanced Features (Optional)
- [ ] KYC verification (Smile Identity/Veriff)
- [ ] Video streaming (CloudFlare Stream/AWS)
- [ ] Push notifications (Firebase)
- [ ] WhatsApp messaging
- [ ] Voice calls
- [ ] Cryptocurrency APIs

---

## 🔗 Integration Categories

### 🌍 African Payment Processors

#### 1. **Flutterwave** (Pan-African - 34+ Countries)

**Files to Edit:**
- `server/services/paymentService.ts` - Replace mock with real API
- `server/routes/payments.ts` - Update webhook handlers

**Environment Variables:**
```bash
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxxxxxxx
FLUTTERWAVE_SECRET_HASH=your_webhook_secret_hash
```

**Integration Steps:**
```typescript
// In paymentService.ts, replace this mock function:
export async function processFlutterwavePayment(data: FlutterwavePaymentData) {
  // REPLACE THIS SECTION (lines 45-95)
  if (process.env.NODE_ENV === 'production') {
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    // ... rest of implementation
  }
}
```

**Files to Delete:** None (mock implementations are conditional)

**Testing:**
```bash
# Test payment initiation
curl -X POST http://localhost:5000/api/payments/flutterwave/initiate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "currency": "NGN", "purpose": "test_payment"}'
```

#### 2. **Paystack** (Nigeria, Ghana, South Africa)

**Files to Edit:**
- `server/services/paymentService.ts` (lines 97-165)
- `server/routes/payments.ts` (webhook handler lines 45-75)

**Environment Variables:**
```bash
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

**Integration Steps:**
```typescript
// Replace processPaystackPayment function
const response = await fetch('https://api.paystack.co/transaction/initialize', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});
```

#### 3. **MTN Mobile Money** (17+ African Countries)

**Files to Edit:**
- `server/services/paymentService.ts` (lines 167-245)

**Environment Variables:**
```bash
MTN_MOMO_SUBSCRIPTION_KEY=xxxxxxxxxxxxx
MTN_MOMO_API_KEY=xxxxxxxxxxxxx
MTN_MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com
MTN_MOMO_ENVIRONMENT=sandbox
MTN_MOMO_API_USER=xxxxxxxxxxxxx
```

**Integration Steps:**
1. Register at [MTN MoMo Developer Portal](https://momodeveloper.mtn.com/)
2. Create API user and get credentials
3. Replace mock implementation in `processMTNMoMoPayment`

---

### 📱 SMS & Communication Services

#### 1. **Africa's Talking** (21+ African Countries)

**Files to Edit:**
- `server/services/notificationService.ts` (lines 125-180)
- `server/services/kycService.ts` (lines 890-920)

**Environment Variables:**
```bash
AFRICAS_TALKING_API_KEY=xxxxxxxxxxxxx
AFRICAS_TALKING_USERNAME=sandbox
AFRICAS_TALKING_VOICE_NUMBER=+254711082XXX
AFRICAS_TALKING_USSD_CODE=*384*1234#
```

**Integration Steps:**
```typescript
// Replace sendSMSWithAfricasTalking function
const response = await fetch('https://api.africastalking.com/version1/messaging', {
  method: 'POST',
  headers: {
    'ApiKey': process.env.AFRICAS_TALKING_API_KEY,
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    username: process.env.AFRICAS_TALKING_USERNAME,
    to: data.phoneNumber,
    message: data.message,
    from: 'SOFTCHAT'
  })
});
```

**Files to Delete:** None

#### 2. **Termii** (Multi-channel: SMS, Voice, WhatsApp)

**Files to Edit:**
- `server/services/notificationService.ts` (lines 182-235)

**Environment Variables:**
```bash
TERMII_API_KEY=TLxxxxxxxxxxxxx
```

**Integration Steps:**
```typescript
// Replace sendSMSWithTermii function
const response = await fetch('https://api.ng.termii.com/api/sms/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    api_key: process.env.TERMII_API_KEY,
    to: data.phoneNumber,
    from: 'Eloity',
    sms: data.message,
    type: 'plain',
    channel: getTermiiChannel(data.type)
  })
});
```

---

### 🆔 KYC & Identity Verification

#### 1. **Smile Identity** (Pan-African - 200M+ Records)

**Files to Edit:**
- `server/services/kycService.ts` (lines 560-620)

**Environment Variables:**
```bash
SMILE_IDENTITY_PARTNER_ID=xxxxx
SMILE_IDENTITY_API_KEY=xxxxxxxxxxxxx
SMILE_IDENTITY_BASE_URL=https://3eydmgh10d.execute-api.us-west-2.amazonaws.com/test
```

**Integration Steps:**
```typescript
// Replace verifyWithSmileIdentity function
const verification = {
  partner_id: process.env.SMILE_IDENTITY_PARTNER_ID,
  job_id: generateJobId(),
  job_type: 4, // Enhanced KYC
  country: userData.country,
  id_type: userData.idType,
  id_number: userData.idNumber,
  // ... rest of verification data
};

const response = await fetch(`${process.env.SMILE_IDENTITY_BASE_URL}/identity_verification`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(verification)
});
```

#### 2. **Veriff** (Global with African Support)

**Files to Edit:**
- `server/services/kycService.ts` (lines 680-730)
- `server/routes/kyc.ts` (webhook handler lines 780-810)

**Environment Variables:**
```bash
VERIFF_API_KEY=xxxxxxxxxxxxx
VERIFF_WEBHOOK_SECRET=xxxxxxxxxxxxx
```

#### 3. **Youverify** (Nigeria, Ghana, Kenya)

**Files to Edit:**
- `server/services/kycService.ts` (lines 732-825)

**Environment Variables:**
```bash
YOUVERIFY_TOKEN=xxxxxxxxxxxxx
YOUVERIFY_BASE_URL=https://api.youverify.co/v2
```

---

### 🎥 Video & Streaming Services

#### 1. **Video Processing & CDN**

**Files to Edit:**
- `server/services/videoService.ts` (lines 88-140)
- `server/routes/video.ts` (upload handling)

**Environment Variables:**
```bash
# AWS S3 for video storage
AWS_ACCESS_KEY_ID=xxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxx
AWS_S3_BUCKET=eloity-videos
AWS_REGION=us-east-1

# CloudFlare Stream (Alternative)
CLOUDFLARE_STREAM_API_TOKEN=xxxxxxxxxxxxx
CLOUDFLARE_ACCOUNT_ID=xxxxxxxxxxxxx

# CDN
CLOUDFRONT_DOMAIN=dxxxxxxxxxxxxx.cloudfront.net
```

**Integration Steps:**
1. Set up AWS S3 bucket for video storage
2. Configure CloudFront distribution
3. Replace mock video processing in `processVideoAsync`

**Files to Replace:**
- `server/services/videoService.ts` (lines 88-140) - Video processing
- Add FFmpeg processing for thumbnails and transcoding

#### 2. **Live Streaming**

**Files to Edit:**
- `server/services/videoService.ts` (lines 180-250)

**Required Services:**
- **Node Media Server** for RTMP
- **HLS.js** for playback
- **WebRTC** for browser streaming

**Environment Variables:**
```bash
RTMP_SERVER_URL=rtmp://your-server.com/live
HLS_OUTPUT_PATH=/var/www/hls
STREAM_SECRET_KEY=xxxxxxxxxxxxx
```

---

### 💰 Cryptocurrency Services

#### 1. **Price Data APIs**

**Files to Edit:**
- `server/services/cryptoService.ts` (lines 25-85)

**Environment Variables:**
```bash
# CoinGecko (Free tier available)
COINGECKO_API_KEY=xxxxxxxxxxxxx

# CoinMarketCap
COINMARKETCAP_API_KEY=xxxxxxxxxxxxx

# Binance (for trading data)
BINANCE_API_KEY=xxxxxxxxxxxxx
BINANCE_SECRET_KEY=xxxxxxxxxxxxx
```

**Integration Steps:**
```typescript
// Replace getCryptoPrices function
const response = await fetch(
  `https://api.coingecko.com/api/v3/simple/price?ids=${symbolsParam}&vs_currencies=${vsCurrency}&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`,
  {
    headers: {
      'X-CG-Pro-API-Key': process.env.COINGECKO_API_KEY
    }
  }
);
```

#### 2. **Blockchain Integration**

**Files to Edit:**
- `server/services/cryptoService.ts` (wallet functions)

**Required Libraries:**
```bash
npm install bitcoinjs-lib ethers web3 @solana/web3.js
```

**Environment Variables:**
```bash
# Blockchain RPC URLs
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR-PROJECT-ID
BITCOIN_RPC_URL=https://bitcoin-mainnet.example.com
POLYGON_RPC_URL=https://polygon-rpc.com

# Hot wallet for operations (use secure key management)
HOT_WALLET_PRIVATE_KEY=xxxxxxxxxxxxx
```

---

### 📧 Email Services

#### **SendGrid Integration**

**Files to Edit:**
- `server/services/notificationService.ts` (lines 720-770)

**Environment Variables:**
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@eloity.com
SENDGRID_FROM_NAME=Eloity
```

**Integration Steps:**
```bash
npm install @sendgrid/mail
```

```typescript
// Replace sendEmailWithSendGrid function
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: data.to,
  from: {
    email: process.env.SENDGRID_FROM_EMAIL,
    name: process.env.SENDGRID_FROM_NAME
  },
  subject: data.subject,
  html: data.message
};

await sgMail.send(msg);
```

---

### 🔔 Push Notifications

#### **Firebase Cloud Messaging**

**Files to Edit:**
- `server/services/notificationService.ts` (lines 820-880)

**Environment Variables:**
```bash
FCM_SERVER_KEY=xxxxxxxxxxxxx
FIREBASE_PROJECT_ID=eloity-xxxxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nxxxxx\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@eloity-xxxxx.iam.gserviceaccount.com
```

**Integration Steps:**
```bash
npm install firebase-admin
```

```typescript
// Replace sendPushWithFCM function
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL
  })
});

const message = {
  notification: {
    title: data.title,
    body: data.body
  },
  data: data.data,
  tokens: tokens
};

const response = await admin.messaging().sendMulticast(message);
```

---

## 🗄️ Database Schema Deployment

### **Neon PostgreSQL Setup**

**Files to Edit:**
- `drizzle.config.ts` (already configured)
- All schema files in `shared/` directory

**Environment Variables:**
```bash
DATABASE_URL=postgresql://username:password@host:5432/database
```

**Deployment Steps:**
```bash
# 1. Install dependencies
npm install drizzle-orm @neondatabase/serverless

# 2. Generate migrations
npm run db:generate

# 3. Apply migrations
npm run db:push

# 4. Verify schema
npm run db:studio
```

**Required Tables:**
- ✅ Users and authentication
- ✅ Posts and social features  
- ✅ Marketplace and products
- ✅ Freelance projects and contracts
- ✅ Crypto wallets and transactions
- ✅ Chat and messaging
- ✅ KYC and verification records
- ✅ Notifications and preferences
- ✅ Admin and moderation

---

## 🔐 Security & Environment Setup

### **Production Environment Variables**

```bash
# Core Configuration
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://api.your-domain.com

# Database
DATABASE_URL=postgresql://username:password@host:5432/database

# Authentication
JWT_SECRET=your-super-secret-jwt-key-generate-with-openssl-rand-base64-32
SESSION_SECRET=your-session-secret-key
BCRYPT_SALT_ROUNDS=12

# African Payment Processors
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
MTN_MOMO_API_KEY=xxxxxxxxxxxxx
ORANGE_MONEY_CLIENT_SECRET=xxxxxxxxxxxxx

# SMS & Communication
AFRICAS_TALKING_API_KEY=xxxxxxxxxxxxx
TERMII_API_KEY=xxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx

# KYC Services
SMILE_IDENTITY_API_KEY=xxxxxxxxxxxxx
VERIFF_API_KEY=xxxxxxxxxxxxx
YOUVERIFY_TOKEN=xxxxxxxxxxxxx

# Email & Notifications
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
FCM_SERVER_KEY=xxxxxxxxxxxxx

# File Storage
AWS_ACCESS_KEY_ID=xxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxx
AWS_S3_BUCKET=eloity-production

# Cryptocurrency
COINGECKO_API_KEY=xxxxxxxxxxxxx
BINANCE_API_KEY=xxxxxxxxxxxxx

# Security
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
```

### **Security Best Practices**

1. **Use Vault/Secret Management:**
```bash
# Use AWS Secrets Manager, HashiCorp Vault, or similar
# Never store secrets in code or .env files in production
```

2. **API Key Rotation:**
```bash
# Set up automated key rotation for:
# - JWT secrets (monthly)
# - API keys (quarterly)
# - Database passwords (semi-annually)
```

3. **Rate Limiting:**
```typescript
// Already implemented in server/enhanced-index.ts
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // requests per window
  message: { error: 'Too many requests' }
});
```

---

## 🧪 Testing Integration

### **Test Each Service:**

```bash
# 1. Test Payment Integration
curl -X POST https://api.your-domain.com/api/payments/flutterwave/initiate \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "currency": "NGN"}'

# 2. Test SMS Service
curl -X POST https://api.your-domain.com/api/notifications/sms/send \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+234XXXXXXXXX", "message": "Test message"}'

# 3. Test KYC Service
curl -X POST https://api.your-domain.com/api/kyc/initiate \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"country": "NG", "verificationType": "basic"}'

# 4. Test Crypto Prices
curl -X GET https://api.your-domain.com/api/crypto/prices?symbols=bitcoin,ethereum

# 5. Test Email Service
curl -X POST https://api.your-domain.com/api/notifications/email/send \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"to": ["test@example.com"], "subject": "Test", "message": "Test message"}'
```

### **Monitoring & Alerts:**

```typescript
// Add to your monitoring system:
const healthChecks = [
  'database_connection',
  'payment_api_status',
  'sms_service_status', 
  'kyc_service_status',
  'crypto_price_api',
  'email_service_status'
];
```

---

## 📊 Deployment Checklist

### **Pre-Production:**
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] CDN setup for static assets
- [ ] Backup strategy implemented
- [ ] Monitoring and logging configured

### **Go-Live:**
- [ ] Switch NODE_ENV to production
- [ ] Enable all real API integrations
- [ ] Configure webhook URLs
- [ ] Test all payment flows
- [ ] Verify KYC processes
- [ ] Test notifications (SMS, Email, Push)
- [ ] Monitor error rates and performance

### **Post-Deployment:**
- [ ] Monitor API usage and costs
- [ ] Set up automated testing
- [ ] Configure alerts for failures
- [ ] Document operational procedures
- [ ] Train support team on new integrations

---

## 🚨 Emergency Rollback Plan

If any integration fails in production:

1. **Immediate Rollback:**
```bash
# Switch to mock mode temporarily
export NODE_ENV=development
# Restart services
```

2. **Service-Specific Rollback:**
```typescript
// In each service file, you can force mock mode:
if (process.env.NODE_ENV === 'production' && !process.env.FORCE_MOCK_PAYMENTS) {
  // Real API call
} else {
  // Mock implementation
}
```

3. **Gradual Re-enablement:**
```bash
# Re-enable services one by one
export ENABLE_FLUTTERWAVE=true
export ENABLE_SMS_SERVICE=true
# etc.
```

---

## 📞 Support & Resources

### **Integration Support:**
- **Flutterwave:** [developers@flutterwavego.com](mailto:developers@flutterwavego.com)
- **Paystack:** [support@paystack.com](mailto:support@paystack.com)
- **Africa's Talking:** [support@africastalking.com](mailto:support@africastalking.com)
- **Smile Identity:** [support@smileidentity.com](mailto:support@smileidentity.com)
- **Veriff:** [support@veriff.com](mailto:support@veriff.com)

### **Documentation Links:**
- [Flutterwave Docs](https://developer.flutterwave.com/docs)
- [Paystack Docs](https://paystack.com/docs)
- [Africa's Talking Docs](https://developers.africastalking.com)
- [Termii Docs](https://developers.termii.com)
- [Smile Identity Docs](https://docs.smileidentity.com)
- [Veriff Docs](https://developers.veriff.com)

---

## 🎉 Conclusion

Your Eloity platform is now ready for production with comprehensive integrations. All services are implemented with mock data that can be seamlessly replaced with real integrations by following this guide.

**Next Steps:**
1. Choose your integrations based on target markets
2. Set up accounts with service providers
3. Configure environment variables
4. Test integrations in staging
5. Deploy to production
6. Monitor and optimize

**Remember:** Start with essential integrations (payments, SMS, email) and gradually add enhanced features (KYC, video, crypto) as your platform grows.
