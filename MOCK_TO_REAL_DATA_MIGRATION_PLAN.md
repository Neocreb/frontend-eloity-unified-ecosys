# Mock to Real Data Migration Plan

## Overview
This document outlines the comprehensive plan to replace all mock data, placeholders, and TODO items with real database integrations and live API calls across the Eloity platform.

## Current Status Analysis

### Critical Priority (User-Facing Core Features)

#### 1. Authentication System
**Files**: `src/contexts/AuthContext.tsx`
**Status**: Returns mock user data
**Action Required**:
- Replace mock responses with real API calls to `/api/auth/*`
- Implement proper session management
- Add token refresh logic
- Connect to Supabase auth or backend Passport system

#### 2. Feed & Social Features
**Files**: 
- `src/services/feedService.ts`
- `src/services/realtimeFeedService.ts`
- `src/hooks/use-feed.ts`
- `src/hooks/useFeedPosts.ts`

**Status**: Partially implemented with Supabase, some fallbacks to mock
**Action Required**:
- Remove all mock fallbacks
- Ensure all queries hit real database
- Verify realtime subscriptions are active
- Test post creation, likes, comments with real data

#### 3. Chat & Messaging
**Files**: `src/services/chatService.ts`, `src/services/messagingService.ts`
**Status**: Extensive mock data (mockThreads, mockMessages, mockUsers)
**Action Required**:
- Complete Supabase realtime integration
- Replace all mock thread/message arrays with database queries
- Implement file upload to S3/storage
- Connect websocket server for real-time updates

#### 4. Marketplace
**Files**: `src/services/marketplaceService.ts`, `src/pages/marketplace/**`
**Status**: Mock products and transactions
**Action Required**:
- Connect to real product database tables
- Implement actual payment processing (Flutterwave, Paystack)
- Add inventory management
- Setup order fulfillment workflow

#### 5. Crypto & Wallet
**Files**: 
- `src/services/cryptoService.ts`
- `src/services/walletService.ts`
- `src/services/realtimeCryptoService.ts`

**Status**: Mock prices, mock portfolio, mock transactions
**Action Required**:
- Integrate CoinGecko API (already has placeholder)
- Connect to real wallet balances from database
- Implement real transaction recording
- Setup blockchain integrations for actual crypto operations

### High Priority (Revenue & Compliance)

#### 6. Payment Processing
**Files**: `server/services/paymentService.ts`, `server/routes/payments.ts`
**Status**: Mock branches when `NODE_ENV !== 'production'`
**Action Required**:
- Remove all mock payment responses
- Implement real Flutterwave integration
- Add Paystack webhook handlers
- Setup MTN MoMo and Orange Money
- Test payment flows end-to-end

#### 7. KYC System
**Files**: `server/services/kycService.ts`, `server/routes/kyc.ts`
**Status**: Mock OTP, mock verification responses
**Action Required**:
- Integrate Smile Identity API
- Setup Youverify webhooks
- Implement Veriff callbacks
- Store verification results in database
- Add compliance reporting

#### 8. Freelance & Escrow
**Files**: `src/services/freelanceService.ts`, `src/services/escrowService.ts`
**Status**: Mock escrow contracts, mock transactions
**Action Required**:
- Create escrow database tables
- Implement milestone-based payments
- Add dispute resolution workflow
- Connect to payment services for releases

### Medium Priority (Enhanced Features)

#### 9. Video & Live Streaming
**Files**: `src/services/videoService.ts`, `src/services/liveStreamingService.ts`
**Status**: Mock streams, placeholder RTMP
**Action Required**:
- Setup S3/storage for video uploads
- Configure RTMP server (Ant Media/nginx-rtmp)
- Implement FFmpeg thumbnail generation
- Add transcoding pipeline

#### 10. Courses & Learning
**Files**: `src/services/courseService.ts`
**Status**: Extensive mock course data
**Action Required**:
- Create course database schema
- Implement progress tracking
- Add quiz/assessment system
- Setup certificate generation

#### 11. Notifications
**Files**: `server/services/notificationService.ts`
**Status**: Partially implemented, needs provider wiring
**Action Required**:
- Configure Termii for SMS
- Setup Africa's Talking
- Add Twilio fallback
- Implement FCM for push notifications
- Create email templates with SendGrid

#### 12. Social Commerce
**Files**: `src/services/socialCommerceService.ts`
**Status**: Mock recommendations, mock endorsements
**Action Required**:
- Implement ML-based recommendation engine
- Connect to real purchase history
- Add influencer endorsement tracking
- Setup social proof calculations

### Lower Priority (Supporting Features)

#### 13. Stories
**Files**: `src/hooks/use-stories.ts`, `src/hooks/useStories.ts`
**Status**: Mock fallback noted in comments
**Action Required**:
- Create stories database table
- Implement 24-hour expiry logic
- Add media upload
- Setup view tracking

#### 14. Event Sync
**Files**: `src/services/eventSyncService.ts`
**Status**: Returns mock events
**Action Required**:
- Integrate calendar APIs
- Connect to user event tables
- Add sync scheduling

#### 15. Global Search
**Files**: `src/services/globalSearchService.ts`
**Status**: Extensive mock data for all entity types
**Action Required**:
- Implement Elasticsearch/Algolia integration
- Index all content types
- Add faceted search
- Setup autocomplete

#### 16. Analytics
**Files**: `src/services/unifiedAnalyticsService.ts`
**Status**: Mock platform metrics
**Action Required**:
- Setup analytics database schema
- Implement event tracking
- Add dashboard queries
- Create PDF report generation

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Replace AuthContext with real authentication
- [ ] Remove all mock data from feedService
- [ ] Connect chatService to database
- [ ] Setup proper session store (Redis)

### Phase 2: Core Revenue (Week 3-4)
- [ ] Implement real payment processing
- [ ] Connect marketplace to database
- [ ] Setup wallet transaction recording
- [ ] Integrate crypto price feeds

### Phase 3: Compliance & Security (Week 5)
- [ ] Complete KYC integrations
- [ ] Add audit logging
- [ ] Implement rate limiting
- [ ] Security testing

### Phase 4: Enhanced Features (Week 6-7)
- [ ] Video upload & streaming
- [ ] Course content delivery
- [ ] Notification providers
- [ ] Social commerce features

### Phase 5: Polish & Optimization (Week 8)
- [ ] Remove remaining mock data
- [ ] Performance optimization
- [ ] Load testing
- [ ] Final QA

## Migration Checklist Template

For each service:
```markdown
### Service: [Service Name]

**Current State**:
- Mock data structures: [list]
- Mock functions: [list]
- Placeholder logic: [describe]

**Migration Steps**:
1. [ ] Create/verify database schema
2. [ ] Implement API endpoints
3. [ ] Replace mock data with DB queries
4. [ ] Add error handling
5. [ ] Test with real data
6. [ ] Remove mock code
7. [ ] Update types/interfaces
8. [ ] Document changes

**Dependencies**:
- Database tables: [list]
- External APIs: [list]
- Environment variables: [list]

**Testing**:
- [ ] Unit tests updated
- [ ] Integration tests pass
- [ ] Manual QA completed
- [ ] Performance acceptable

**Rollback Plan**:
[Describe how to revert if issues occur]
```

## Critical
