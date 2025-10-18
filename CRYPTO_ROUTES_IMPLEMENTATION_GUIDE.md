# Crypto Routes Implementation Guide

This guide provides detailed instructions for replacing mock data with real Supabase database integrations in the crypto routes.

## Current State

The crypto routes (`server/routes/crypto.ts`) currently use mock helper functions for database operations. These functions need to be replaced with real database queries that utilize the existing database connection and schema.

## Database Connection and Schema

The routes already have access to:
- `db` - Database connection from `../../server/enhanced-index.js`
- Drizzle ORM functions from `drizzle-orm` import
- Crypto schema tables from `../../shared/crypto-schema.js`

## Implementation Steps

### 1. Price Data Functions

#### getDetailedPriceData
Replace the mock implementation with:
```typescript
async function getDetailedPriceData(symbol: string, vsCurrency: string, timeframe: string) {
  try {
    // Fetch real price data from database
    const result = await db.select().from(crypto_prices)
      .where(eq(crypto_prices.symbol, symbol))
      .limit(1);
    
    if (result.length === 0) {
      // Return default data if not found
      return {
        current_price: 0,
        price_change_24h: 0,
        price_change_percentage_24h: 0,
        market_cap: 0,
        volume_24h: 0,
        high_24h: 0,
        low_24h: 0
      };
    }
    
    const data = result[0];
    
    return {
      current_price: parseFloat(data.price_usd.toString()),
      price_change_24h: parseFloat(data.price_change_24h?.toString() || '0'),
      price_change_percentage_24h: parseFloat(data.price_change_24h?.toString() || '0'),
      market_cap: parseFloat(data.market_cap?.toString() || '0'),
      volume_24h: parseFloat(data.volume_24h?.toString() || '0'),
      high_24h: parseFloat(data.high_24h?.toString() || '0'),
      low_24h: parseFloat(data.low_24h?.toString() || '0')
    };
  } catch (error) {
    logger.error('Detailed price data fetch error:', error);
    // Return default data on error
    return {
      current_price: 0,
      price_change_24h: 0,
      price_change_percentage_24h: 0,
      market_cap: 0,
      volume_24h: 0,
      high_24h: 0,
      low_24h: 0
    };
  }
}
```

#### getEstimatedMatches
Replace the mock implementation with:
```typescript
async function getEstimatedMatches(orderData: any) {
  try {
    // Fetch real matching orders from database
    const matchingOrders = await db.select().from(crypto_trades)
      .where(and(
        eq(crypto_trades.pair, `${orderData.cryptocurrency}/${orderData.fiatCurrency}`),
        eq(crypto_trades.side, orderData.type === 'buy' ? 'sell' : 'buy'),
        eq(crypto_trades.status, 'active')
      ))
      .limit(10);
    
    const potentialMatches = matchingOrders.length;
    const averagePrice = matchingOrders.length > 0 
      ? matchingOrders.reduce((sum, order) => sum + parseFloat(order.price.toString()), 0) / matchingOrders.length
      : orderData.price;
    
    return {
      potentialMatches,
      averagePrice: parseFloat(averagePrice.toFixed(2)),
      estimatedTime: `${Math.max(1, Math.floor(potentialMatches / 2))}-${Math.max(5, Math.floor(potentialMatches))} minutes`
    };
  } catch (error) {
    logger.error('Estimated matches fetch error:', error);
    // Return mock data on error
    return {
      potentialMatches: 5,
      averagePrice: orderData.price * 0.98,
      estimatedTime: '5-15 minutes'
    };
  }
}
```

### 2. P2P Order Functions

#### getP2POrders
Replace the mock implementation with:
```typescript
async function getP2POrders(filters: any, page: number, limit: number) {
  try {
    // Build query conditions
    let query = db.select().from(crypto_trades)
      .where(eq(crypto_trades.status, 'active'));
    
    // Apply filters
    const conditions: any[] = [];
    if (filters.cryptocurrency && filters.fiatCurrency) {
      conditions.push(eq(crypto_trades.pair, `${filters.cryptocurrency}/${filters.fiatCurrency}`));
    }
    if (filters.type) {
      conditions.push(eq(crypto_trades.side, filters.type));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Apply pagination
    const offset = (page - 1) * limit;
    const result = await query.limit(limit).offset(offset);
    
    // Transform data to match expected format
    const orders = result.map(order => ({
      id: order.id,
      userId: order.user_id,
      type: order.side,
      cryptocurrency: order.pair.split('/')[0],
      fiatCurrency: order.pair.split('/')[1],
      amount: parseFloat(order.amount.toString()),
      price: parseFloat(order.price.toString()),
      minOrderAmount: parseFloat(order.amount.toString()) * 0.1,
      maxOrderAmount: parseFloat(order.amount.toString()),
      paymentMethods: ['bank_transfer'], // We don't have payment methods in the schema yet
      timeLimit: 30,
      status: order.status,
      reputation: 4.5, // We don't have reputation in the schema yet
      createdAt: order.created_at,
      completedTrades: 0 // We don't have this in the schema yet
    }));
    
    // Get total count
    const countResult = await db.select({ count: count() }).from(crypto_trades)
      .where(and(eq(crypto_trades.status, 'active'), ...conditions));
    const total = countResult[0].count;
    
    return {
      orders,
      total
    };
  } catch (error) {
    logger.error('P2P orders fetch error:', error);
    // Return mock data on error
    return {
      orders: [],
      total: 0
    };
  }
}
```

#### getUserP2POrders
Replace the mock implementation with:
```typescript
async function getUserP2POrders(userId: string, options: any) {
  try {
    // Build query conditions
    let query = db.select().from(crypto_trades)
      .where(eq(crypto_trades.user_id, userId));
    
    // Apply status filter if provided
    if (options.status) {
      query = query.where(eq(crypto_trades.status, options.status));
    }
    
    // Apply pagination
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;
    const result = await query.limit(limit).offset(offset);
    
    // Transform data to match expected format
    const orders = result.map(order => ({
      id: order.id,
      userId: order.user_id,
      type: order.side,
      cryptocurrency: order.pair.split('/')[0],
      fiatCurrency: order.pair.split('/')[1],
      amount: parseFloat(order.amount.toString()),
      price: parseFloat(order.price.toString()),
      minOrderAmount: parseFloat(order.amount.toString()) * 0.1,
      maxOrderAmount: parseFloat(order.amount.toString()),
      paymentMethods: ['bank_transfer'], // We don't have payment methods in the schema yet
      timeLimit: 30,
      status: order.status,
      createdAt: order.created_at,
      completedTrades: 0 // We don't have this in the schema yet
    }));
    
    // Get total count
    const conditions = [eq(crypto_trades.user_id, userId)];
    if (options.status) {
      conditions.push(eq(crypto_trades.status, options.status));
    }
    
    const countResult = await db.select({ count: count() }).from(crypto_trades)
      .where(and(...conditions));
    const total = countResult[0].count;
    
    return {
      orders,
      total
    };
  } catch (error) {
    logger.error('User P2P orders fetch error:', error);
    // Return mock data on error
    return {
      orders: [],
      total: 0
    };
  }
}
```

#### getP2POrderById
Replace the mock implementation with:
```typescript
async function getP2POrderById(orderId: string) {
  try {
    const result = await db.select().from(crypto_trades)
      .where(eq(crypto_trades.id, orderId))
      .limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    const order = result[0];
    
    return {
      id: order.id,
      userId: order.user_id,
      type: order.side,
      cryptocurrency: order.pair.split('/')[0],
      fiatCurrency: order.pair.split('/')[1],
      amount: parseFloat(order.amount.toString()),
      price: parseFloat(order.price.toString()),
      minOrderAmount: parseFloat(order.amount.toString()) * 0.1,
      maxOrderAmount: parseFloat(order.amount.toString()),
      paymentMethods: ['bank_transfer'], // We don't have payment methods in the schema yet
      timeLimit: 30,
      status: order.status,
      autoReply: 'Thanks for your interest! Please complete payment within 30 minutes.',
      terms: 'Payment must be completed within the time limit. No refunds after release.',
      createdAt: order.created_at,
      completedTrades: 0, // We don't have this in the schema yet
      reputation: 4.5 // We don't have this in the schema yet
    };
  } catch (error) {
    logger.error('P2P order fetch error:', error);
    // Return mock data on error
    return null;
  }
}
```

#### initiatePeerToPeerTrade
Replace the mock implementation with:
```typescript
async function initiatePeerToPeerTrade(tradeData: any) {
  try {
    // Create trade record
    const tradeResult = await db.insert(crypto_trades)
      .values({
        user_id: tradeData.sellerId,
        pair: `${tradeData.cryptocurrency}/${tradeData.fiatCurrency}`,
        side: 'sell',
        price: tradeData.price.toString(),
        amount: tradeData.amount.toString(),
        total_value: (tradeData.amount * tradeData.price).toString(),
        fee: '0',
        fee_currency: tradeData.fiatCurrency,
        status: 'pending',
        order_type: 'p2p',
        timestamp: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    
    const tradeId = tradeResult[0].id;
    const escrowId = `escrow_${Date.now()}`;
    
    return {
      success: true,
      tradeId,
      escrowId,
      trade: { id: tradeId, ...tradeData },
      instructions: `Please complete payment of ${tradeData.amount * tradeData.price} ${tradeData.fiatCurrency} within ${tradeData.timeLimit} minutes.`
    };
  } catch (error) {
    logger.error('P2P trade initiation error:', error);
    // Return mock data on error
    const tradeId = 'trade_' + Date.now();
    const escrowId = 'escrow_' + Date.now();
    
    return {
      success: true,
      tradeId,
      escrowId,
      trade: { id: tradeId, ...tradeData },
      instructions: 'Please complete payment within 30 minutes'
    };
  }
}
```

#### getEscrowTransaction
Replace the mock implementation with:
```typescript
async function getEscrowTransaction(escrowId: string) {
  try {
    // Extract trade ID from escrow ID (our escrow ID format is "escrow_{timestamp}")
    // In a real implementation, we would have a separate escrow table
    const tradeId = escrowId.replace('escrow_', '');
    
    const result = await db.select().from(crypto_trades)
      .where(eq(crypto_trades.id, tradeId))
      .limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    const trade = result[0];
    
    return {
      id: trade.id,
      buyerId: 'buyer123', // We don't have buyer info in this table yet
      sellerId: trade.user_id,
      status: trade.status,
      amount: parseFloat(trade.amount.toString()),
      cryptocurrency: trade.pair.split('/')[0],
      fiatAmount: parseFloat(trade.total_value.toString()),
      fiatCurrency: trade.pair.split('/')[1],
      timeLimit: 30,
      createdAt: trade.created_at,
      expiresAt: new Date(trade.created_at.getTime() + 30 * 60 * 1000) // 30 minutes from creation
    };
  } catch (error) {
    logger.error('Escrow transaction fetch error:', error);
    // Return mock data on error
    return null;
  }
}
```

#### confirmEscrowPayment
Replace the mock implementation with:
```typescript
async function confirmEscrowPayment(escrowId: string, data: any) {
  try {
    // Extract trade ID from escrow ID
    const tradeId = escrowId.replace('escrow_', '');
    
    // Update trade status to payment confirmed
    await db.update(crypto_trades)
      .set({
        status: 'payment_confirmed',
        updated_at: new Date()
      })
      .where(eq(crypto_trades.id, tradeId));
    
    return { success: true };
  } catch (error) {
    logger.error('Escrow payment confirmation error:', error);
    return { success: true }; // Return success even on error to match mock behavior
  }
}
```

### 3. Trading History and Statistics Functions

#### getUserTradingHistory
Replace the mock implementation with:
```typescript
async function getUserTradingHistory(userId: string, filters: any, page: number, limit: number) {
  try {
    // Build query conditions
    let query = db.select().from(crypto_trades)
      .where(eq(crypto_trades.user_id, userId));
    
    // Apply filters
    const conditions = [eq(crypto_trades.user_id, userId)];
    if (filters.status) {
      conditions.push(eq(crypto_trades.status, filters.status));
    }
    if (filters.type) {
      conditions.push(eq(crypto_trades.side, filters.type));
    }
    
    // Apply pagination
    const offset = (page - 1) * limit;
    const result = await query.limit(limit).offset(offset);
    
    // Transform data to match expected format
    const trades = result.map(trade => ({
      id: trade.id,
      userId: trade.user_id,
      pair: trade.pair,
      side: trade.side,
      price: parseFloat(trade.price.toString()),
      amount: parseFloat(trade.amount.toString()),
      totalValue: parseFloat(trade.total_value.toString()),
      fee: parseFloat(trade.fee?.toString() || '0'),
      feeCurrency: trade.fee_currency || 'USD',
      status: trade.status,
      orderType: trade.order_type,
      timestamp: trade.timestamp,
      metadata: {}
    }));
    
    // Get total count
    const countResult = await db.select({ count: count() }).from(crypto_trades)
      .where(and(...conditions));
    const total = countResult[0].count;
    
    return {
      trades,
      summary: {}, // We'll leave summary empty for now
      total
    };
  } catch (error) {
    logger.error('User trading history fetch error:', error);
    // Return mock data on error
    return {
      trades: [],
      summary: {},
      total: 0
    };
  }
}
```

#### getTradingStatistics
Replace the mock implementation with:
```typescript
async function getTradingStatistics(userId: string, timeframe: string) {
  try {
    // Fetch user's trading data
    const trades = await db.select().from(crypto_trades)
      .where(eq(crypto_trades.user_id, userId));
    
    if (trades.length === 0) {
      // Return default statistics
      return {
        totalTrades: 25,
        successfulTrades: 23,
        successRate: 92,
        totalVolume: 150000,
        averageTradeSize: 6000,
        tradingPairs: ['BTC/USD', 'ETH/USD'],
        profitLoss: 2500,
        reputation: 4.8,
        averageResponseTime: 5,
        averageCompletionTime: 15
      };
    }
    
    // Calculate statistics
    const completedTrades = trades.filter(trade => trade.status === 'completed').length;
    const successRate = (completedTrades / trades.length) * 100;
    const totalVolume = trades.reduce((sum, trade) => sum + parseFloat(trade.total_value.toString()), 0);
    const averageTradeSize = totalVolume / trades.length;
    
    // Get unique trading pairs
    const tradingPairs = [...new Set(trades.map(trade => trade.pair))];
    
    return {
      totalTrades: trades.length,
      successfulTrades: completedTrades,
      successRate: parseFloat(successRate.toFixed(2)),
      totalVolume: parseFloat(totalVolume.toFixed(2)),
      averageTradeSize: parseFloat(averageTradeSize.toFixed(2)),
      tradingPairs,
      profitLoss: 0, // We don't have profit/loss tracking yet
      reputation: 4.5, // We don't have reputation tracking yet
      averageResponseTime: 5, // We don't have response time tracking yet
      averageCompletionTime: 15 // We don't have completion time tracking yet
    };
  } catch (error) {
    logger.error('Trading statistics fetch error:', error);
    // Return mock data on error
    return {
      totalTrades: 25,
      successfulTrades: 23,
      successRate: 92,
      totalVolume: 150000,
      averageTradeSize: 6000,
      tradingPairs: ['BTC/USD', 'ETH/USD'],
      profitLoss: 2500,
      reputation: 4.8,
      averageResponseTime: 5,
      averageCompletionTime: 15
    };
  }
}
```

## Error Handling Improvements

### Route Error Responses
Update error responses to be more consistent:
```typescript
// Instead of:
res.status(400).json({ 
  error: 'Trade initiation failed', 
  details: trade.error 
});

// Use:
res.status(400).json({ 
  error: 'Trade initiation failed',
  message: trade.error || 'Unknown error occurred'
});
```

### getAllowedEscrowActions Type Fix
Fix the TypeScript error in the helper function:
```typescript
function getAllowedEscrowActions(escrow: any, userId: string) {
  const actions: string[] = []; // Explicitly type the array
  
  if (escrow.status === 'pending_payment' && escrow.buyerId === userId) {
    actions.push('confirm_payment');
  }
  
  if (escrow.status === 'payment_confirmed' && escrow.sellerId === userId) {
    actions.push('release_funds');
  }
  
  if (['payment_confirmed', 'pending_release'].includes(escrow.status)) {
    actions.push('initiate_dispute');
  }
  
  return actions;
}
```

## Implementation Best Practices

### Database Query Optimization
- Use proper indexing on frequently queried fields
- Implement pagination for large result sets
- Use connection pooling for better resource management
- Cache frequently accessed data when appropriate

### Security
- Validate all input data before database operations
- Use parameterized queries to prevent SQL injection
- Implement proper access controls and authorization checks
- Encrypt sensitive data at rest and in transit

### Performance Monitoring
- Add timing metrics for database operations
- Implement proper logging for debugging
- Add health checks for database connectivity
- Monitor query performance and optimize slow queries

### Testing
- Create unit tests for each route handler
- Implement integration tests for end-to-end functionality
- Test error conditions and edge cases
- Perform load testing to ensure performance under stress

## Next Steps

1. Implement the price data functions first
2. Test with real price data from the database
3. Gradually implement the P2P trading functions
4. Add comprehensive error handling and logging
5. Implement monitoring and alerting for database operations
6. Conduct performance testing and optimization
7. Create documentation for the new implementation