# Chat Feature Integration Guide

## Overview

This guide shows how the unified chat system integrates with all Eloity features to enable real-time user activity and seamless communication across the platform.

## Integration Architecture

```
User Activity → Feature Integration → Chat Creation → Unified Chat Interface
```

### Key Components

1. **Chat Integration Service** - Handles chat creation for different feature contexts
2. **Integration Hooks** - React hooks for easy feature integration
3. **Chat Action Buttons** - Pre-built UI components for different chat types
4. **Feature-Specific Integrations** - Ready-to-use components for each platform feature

## Feature Integrations

### �� Marketplace Integration

#### Product Page Integration

```tsx
import { ProductChatIntegration } from "@/components/marketplace/ProductChatIntegration";

// On any product page
<ProductChatIntegration
  productId="prod_123"
  productName="MacBook Pro 16-inch"
  productPrice={2500}
  sellerId="seller_456"
  sellerName="TechStore"
/>;
```

**Real-time Activities:**

- **Product Inquiry** → Creates marketplace chat
- **Buy Now** → Creates purchase discussion chat
- **Make Offer** → Creates negotiation chat
- **Quick Contact** → Creates general product chat

#### Usage Examples:

```tsx
// Product listing card
<QuickContact
  productId={product.id}
  productName={product.name}
  productPrice={product.price}
  sellerId={product.sellerId}
  compact={true}
/>;

// Search results
{
  products.map((product) => (
    <ProductCard key={product.id}>
      {/* Product details */}
      <QuickContact {...product} />
    </ProductCard>
  ));
}
```

### 💼 Freelance Integration

#### Job Posting Integration

```tsx
import { JobChatIntegration } from "@/components/freelance/JobChatIntegration";

// On job detail pages
<JobChatIntegration
  jobId="job_789"
  jobTitle="E-commerce Website Development"
  jobBudget={5000}
  clientId="client_123"
  clientName="StartupCorp"
  applicationStatus="not_applied"
/>;
```

**Real-time Activities:**

- **Job Application** → Creates freelance project chat
- **Freelancer Contact** → Creates hiring inquiry chat
- **Project Discussion** → Creates active project chat
- **Client-Freelancer Communication** → Ongoing project chat

#### Usage Examples:

```tsx
// Job board
<QuickApply
  jobId={job.id}
  jobTitle={job.title}
  clientId={job.clientId}
  applied={job.hasApplied}
/>

// Freelancer profiles
<FreelancerContact
  freelancerId={freelancer.id}
  freelancerName={freelancer.name}
  skills={freelancer.skills}
  hourlyRate={freelancer.rate}
/>
```

### 🪙 Crypto P2P Integration

#### Trading Interface Integration

```tsx
import { CryptoP2PChatIntegration } from "@/components/crypto/CryptoP2PChatIntegration";

// On P2P trading pages
<CryptoP2PChatIntegration
  offerId="offer_456"
  crypto="BTC"
  amount={0.5}
  price={50000}
  currency="USD"
  traderId="trader_789"
  traderName="CryptoExpert"
  traderRating={4.8}
  totalTrades={150}
  tradeType="sell"
  paymentMethods={["Bank Transfer", "PayPal"]}
/>;
```

**Real-time Activities:**

- **Trade Initiation** → Creates P2P trading chat
- **Payment Discussion** → Creates payment coordination chat
- **Escrow Communication** → Creates secure transaction chat
- **Dispute Resolution** → Creates dispute handling chat

#### Usage Examples:

```tsx
// Trading offers list
<QuickTrade
  offerId={offer.id}
  crypto={offer.crypto}
  amount={offer.amount}
  traderId={offer.traderId}
  tradeType={offer.type}
/>

// Active trades status
<TradingStatus
  tradeId={trade.id}
  status={trade.status}
  counterparty={trade.counterparty}
  amount={trade.amount}
  crypto={trade.crypto}
/>
```

### 👥 Social Integration

#### Social Feed Integration

```tsx
import {
  PostChatIntegration,
  SocialActionBar,
} from "@/components/social/SocialChatIntegration";

// On social posts
<SocialActionBar
  postId={post.id}
  authorId={post.authorId}
  authorName={post.authorName}
  likes={post.likes}
  comments={post.comments}
  shares={post.shares}
  isOwnPost={post.isOwnPost}
/>;
```

**Real-time Activities:**

- **Post Reply** → Creates social conversation
- **Direct Message** → Creates private social chat
- **Comment Reply** → Creates comment-based chat
- **Group Discussion** → Creates group chat thread

#### Usage Examples:

```tsx
// User profiles
<FollowMessage
  userId={user.id}
  userName={user.name}
  isFollowing={user.isFollowing}
/>

// Comments
<CommentReplyIntegration
  commentId={comment.id}
  commenterUid={comment.userId}
  commenterName={comment.userName}
  postId={post.id}
/>
```

## Real-Time Activity Flow

### 1. User Initiates Activity

```typescript
// Example: User clicks "Contact Seller" on a product
const handleContactSeller = async () => {
  // Integration automatically creates appropriate chat
  await contactSeller(sellerId, productId, productName, productPrice);
  // User is redirected to marketplace chat tab with new conversation
};
```

### 2. Chat Creation with Context

```typescript
// Chat is created with full context
const marketplaceChat = {
  type: "marketplace",
  participants: [buyerId, sellerId],
  contextData: {
    productName: "MacBook Pro",
    productPrice: 2500,
    productImage: "/product-image.jpg",
    priority: "medium",
    tags: ["marketplace", "product-inquiry"],
  },
  initialMessage: "Hi! Is this MacBook Pro still available?",
};
```

### 3. Unified Chat Interface

```typescript
// Chat appears in marketplace tab with full context
- Tab: "Marketplace" (with unread badge)
- Context: Shows product name and price
- Messages: Full conversation history
- Actions: Quick actions for marketplace features
```

## Hook-Based Integration

### Core Hooks

```typescript
// Marketplace integration
const { contactSeller, isCreatingChat } = useMarketplaceChat();

// Freelance integration
const { contactFreelancer, startFreelanceChat } = useFreelanceChat();

// Crypto P2P integration
const { initiateTrade, startCryptoP2PChat } = useCryptoChat();

// Social integration
const { startSocialChat, replyToPost } = useSocialChat();
```

### Universal Integration Hook

```typescript
const {
  startFreelanceChat,
  startMarketplaceChat,
  startCryptoP2PChat,
  startSocialChat,
  openChatTab,
  isCreatingChat,
} = useChatIntegration();
```

## Notification Integration

### Automatic Chat Creation from Notifications

```typescript
// When user receives notifications, chats are auto-created
const notifications = [
  {
    type: "freelance_application",
    fromUserId: "freelancer_123",
    referenceId: "job_456",
    metadata: { jobTitle: "Website Design", jobBudget: 3000 },
  },
  {
    type: "marketplace_inquiry",
    fromUserId: "buyer_789",
    referenceId: "product_123",
    metadata: { productName: "iPhone 14", productPrice: 800 },
  },
  {
    type: "trade_request",
    fromUserId: "trader_456",
    referenceId: "trade_789",
    metadata: { crypto: "ETH", amount: 2, tradeType: "buy" },
  },
];

// Each notification automatically creates appropriate chat
notifications.forEach((notification) => {
  chatContext.handleNotificationChat(notification);
});
```

## URL-Based Navigation

### Direct Chat Navigation

```typescript
// Navigate to specific chat types
/chat?type=marketplace&thread=thread_123
/chat?type=freelance&thread=project_456
/chat?type=p2p&thread=trade_789
/chat?type=social&thread=conversation_123
/chat?type=ai_assistant

// Integration service handles navigation
chatIntegrationService.navigateToChat(threadId, chatType);
```

## Context-Aware Features

### Smart Context Display

Each chat type shows relevant context information:

#### Marketplace Chats

- Product name and price
- Product image thumbnail
- Seller/buyer status
- Purchase stage indicator

#### Freelance Chats

- Job title and budget
- Project timeline
- Client/freelancer roles
- Application status

#### Crypto P2P Chats

- Trade amount and crypto type
- Current exchange rate
- Payment methods
- Escrow status

#### Social Chats

- Relationship status
- Mutual connections
- Recent interactions
- Shared interests

## Performance Optimizations

### Lazy Loading

- Chat threads load on demand
- Message history loads incrementally
- Media attachments load progressively

### Efficient State Management

- Context-based state updates
- Optimistic UI updates
- Background sync for reliability

### Real-Time Updates

- WebSocket connections for live messaging
- Push notifications for new messages
- Typing indicators across all chat types

## Implementation Examples

### Adding Chat to New Feature

```typescript
// 1. Create feature-specific hook
export const useNewFeatureChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const startFeatureChat = async (featureId: string, otherUserId: string) => {
    const threadId = await chatIntegrationService.startNewFeatureChat({
      featureId,
      featureType: "new_feature",
      participants: [user.id, otherUserId],
      contextData: { /* feature-specific data */ }
    });

    chatIntegrationService.navigateToChat(threadId, "new_feature");
  };

  return { startFeatureChat };
};

// 2. Create feature-specific chat button
export const NewFeatureChatButton = ({ featureId, otherUserId }) => {
  const { startFeatureChat } = useNewFeatureChat();

  return (
    <Button onClick={() => startFeatureChat(featureId, otherUserId)}>
      <MessageCircle className="w-4 h-4 mr-2" />
      Start Feature Chat
    </Button>
  );
};

// 3. Add to unified chat tabs
const UPDATED_CHAT_TABS = [
  ...DEFAULT_CHAT_TABS,
  {
    id: "new_feature",
    label: "New Feature",
    icon: "Star",
    color: "indigo"
  }
];
```

## Testing Real-Time Integration

### Test Scenarios

1. **Marketplace Flow**: Browse product → Contact seller → Negotiate price → Complete purchase
2. **Freelance Flow**: Post job → Receive applications → Interview freelancer → Hire and manage project
3. **Crypto Flow**: Browse offers → Initiate trade → Coordinate payment → Complete transaction
4. **Social Flow**: View profile → Send message → Reply to post → Join group discussion

### Expected Behaviors

- ✅ Immediate chat creation on user action
- ✅ Proper context preservation across sessions
- ✅ Real-time message delivery and notifications
- ✅ Seamless navigation between features and chat
- ✅ Unread count updates across all tabs
- ✅ AI assistant always available for help

The unified chat system now provides seamless integration across all Eloity features, ensuring that every user interaction can naturally flow into meaningful conversations while maintaining full context and providing the best possible user experience.
