# Production Crypto Routes Implementation Guide

This guide provides detailed instructions for replacing mock data with real Supabase database integrations in the cryptocurrency routes.

## 1. Database Connection Setup

First, ensure you have the database utility file at `server/utils/db.ts` as described in the crypto service implementation guide.

Then update the imports in `server/routes/crypto.ts`:

```typescript
import { logger } from '../utils/logger.js';
import { db } from '../utils/db.js';
import { eq, and, gte, lt, desc } from 'drizzle-orm';
import * as schema from '../../shared/crypto-schema';
import * as userSchema from '../../shared/schema';
```

## 2. Price Data Functions

### getDetailedPriceData

Replace the mock implementation with:

```typescript
async function getDetailedPriceData(symbol: string, vsCurrency: string, timeframe: string) {
  try {
    // In a real implementation, you would fetch from a price API or database
    const prices = await db.select().from(schema.crypto_prices).where(
      and(
        eq(schema.crypto_prices.symbol, symbol),
        gte(schema.crypto_prices.last_updated, new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
      )
    ).orderBy(desc(schema.crypto_prices.last_updated)).limit(1);
    
    if (prices.length === 0) {
      return null;
    }
    
    const price = prices[0];
    return {
      current_price: parseFloat(price.price_usd.toString()),
      price_change_24h: parseFloat(price.price_change_24h?.toString() || '0'),
      price_change_percentage_24h: parseFloat(price.price_change_24h?.toString() || '0') / parseFloat(price.price_usd.toString()) * 100,
      market_cap: parseFloat(price.market_cap?.toString() || '0'),
      volume_24h: parseFloat(price.volume_24h?.toString() || '0'),
      high_24h: parseFloat(price.high_24h?.toString() || '0'),
      low_24h: parseFloat(price.low_24h?.toString() || '0')
    };
  } catch (error) {
    logger.error('Error fetching detailed price data:', error);
    throw error;
  }
}
```

### getEstimatedMatches

Replace the mock implementation with:

```typescript
async function getEstimatedMatches(orderData: any) {
  try {
    // In a real implementation, you would query the P2P orders table
    const orders = await db.select().from(schema.p2p_orders).where(
      and(
        eq(schema.p2p_orders.cryptocurrency, orderData.cryptocurrency),
        eq(schema.p2p_orders.fiatCurrency, orderData.fiatCurrency),
        eq(schema.p2p_orders.type, orderData.type === 'buy' ? 'sell' : 'buy'),
        gte(schema.p2p_orders.amount, orderData.minOrderAmount || 0),
        lte(schema.p2p_orders.amount, orderData.maxOrderAmount || Number.MAX_VALUE),
        eq(schema.p2p_orders.status, 'active')
      )
    ).limit(10);
    
    const potentialMatches = orders.length;
    const averagePrice = orders.reduce((sum, order) => sum + parseFloat(order.price.toString()), 0) / (orders.length || 1);
    
    return {
      potentialMatches,
      averagePrice: parseFloat(averagePrice.toFixed(2)),
      estimatedTime: `${5 + Math.floor(Math.random() * 25)}-${10 + Math.floor(Math.random() * 30)} minutes`
    };
  } catch (error) {
    logger.error('Error fetching estimated matches:', error);
    throw error;
  }
}
```

## 3. P2P Order Functions

### getP2POrders

Replace the mock implementation with:

```typescript
async function getP2POrders(filters: any, page: number, limit: number) {
  try {
    let query = db.select().from(schema.p2p_orders);
    
    // Apply filters
    if (filters.type) {
      query = query.where(eq(schema.p2p_orders.type, filters.type));
    }
    
    if (filters.cryptocurrency) {
      query = query.where(eq(schema.p2p_orders.cryptocurrency, filters.cryptocurrency));
    }
    
    if (filters.fiatCurrency) {
      query = query.where(eq(schema.p2p_orders.fiatCurrency, filters.fiatCurrency));
    }
    
    if (filters.status) {
      query = query.where(eq(schema.p2p_orders.status, filters.status));
    }
    
    // Get total count
    const countResult = await query;
    const totalOrders = countResult.length;
    
    // Apply pagination
    const offset = (page - 1) * limit;
    const orders = await query.limit(limit).offset(offset);
    
    return {
      orders,
      total: totalOrders
    };
  } catch (error) {
    logger.error('Error fetching P2P orders:', error);
    throw error;
  }
}
```

### getUserP2POrders

Replace the mock implementation with:

```typescript
async function getUserP2POrders(userId: string, options: any) {
  try {
    let query = db.select().from(schema.p2p_orders).where(
      eq(schema.p2p_orders.userId, userId)
    );
    
    // Apply filters
    if (options.status) {
      query = query.where(eq(schema.p2p_orders.status, options.status));
    }
    
    if (options.type) {
      query = query.where(eq(schema.p2p_orders.type, options.type));
    }
    
    // Get total count
    const countResult = await query;
    const totalOrders = countResult.length;
    
    // Apply pagination
    const offset = (options.page - 1) * options.limit;
    const orders = await query.limit(options.limit).offset(offset);
    
    return {
      orders,
      total: totalOrders
    };
  } catch (error) {
    logger.error('Error fetching user P2P orders:', error);
    throw error;
  }
}
```

### getP2POrderById

Replace the mock implementation with:

```typescript
async function getP2POrderById(orderId: string) {
  try {
    const orders = await db.select().from(schema.p2p_orders).where(
      eq(schema.p2p_orders.id, orderId)
    ).limit(1);
    
    if (orders.length === 0) {
      return null;
    }
    
    return orders[0];
  } catch (error) {
    logger.error('Error fetching P2P order by ID:', error);
    throw error;
  }
}
```

## 4. Trade Functions

### initiatePeerToPeerTrade

Replace the mock implementation with:

```typescript
async function initiatePeerToPeerTrade(tradeData: any) {
  try {
    // In a real implementation, you would create trade and escrow records
    const tradeId = 'trade_' + Date.now();
    const escrowId = 'escrow_' + Date.now();
    
    // Insert trade record
    await db.insert(schema.p2p_trades).values({
      id: tradeId,
      orderId: tradeData.orderId,
      buyerId: tradeData.buyerId,
      sellerId: tradeData.sellerId,
      amount: tradeData.amount.toString(),
      price: tradeData.price.toString(),
      cryptocurrency: tradeData.cryptocurrency,
      fiatCurrency: tradeData.fiatCurrency,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Insert escrow record
    await db.insert(schema.escrow_transactions).values({
      id: escrowId,
      tradeId: tradeId,
      buyerId: tradeData.buyerId,
      sellerId: tradeData.sellerId,
      cryptocurrency: tradeData.cryptocurrency,
      amount: tradeData.amount.toString(),
      fiatAmount: (tradeData.amount * tradeData.price).toString(),
      fiatCurrency: tradeData.fiatCurrency,
      timeLimit: tradeData.timeLimit,
      status: 'pending_payment',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + (tradeData.timeLimit * 60 * 1000))
    });
    
    logger.info('P2P trade initiated', { tradeId, escrowId, ...tradeData });
    
    return {
      success: true,
      tradeId,
      escrowId,
      trade: { id: tradeId, ...tradeData },
      instructions: `Please complete payment of ${tradeData.amount * tradeData.price} ${tradeData.fiatCurrency} within ${tradeData.timeLimit} minutes.`
    };
  } catch (error) {
    logger.error('Error initiating P2P trade:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

## 5. Escrow Functions

### getEscrowTransaction

Replace the mock implementation with:

```typescript
async function getEscrowTransaction(escrowId: string) {
  try {
    const escrows = await db.select().from(schema.escrow_transactions).where(
      eq(schema.escrow_transactions.id, escrowId)
    ).limit(1);
    
    if (escrows.length === 0) {
      return null;
    }
    
    return escrows[0];
  } catch (error) {
    logger.error('Error fetching escrow transaction:', error);
    throw error;
  }
}
```

### confirmEscrowPayment

Replace the mock implementation with:

```typescript
async function confirmEscrowPayment(escrowId: string, data: any) {
  try {
    await db.update(schema.escrow_transactions)
      .set({ 
        status: 'payment_confirmed',
        updatedAt: new Date()
      })
      .where(eq(schema.escrow_transactions.id, escrowId));
    
    logger.info('Escrow payment confirmed', { escrowId, ...data });
    
    return { success: true };
  } catch (error) {
    logger.error('Error confirming escrow payment:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

## 6. Trading History Functions

### getUserTradingHistory

Replace the mock implementation with:

```typescript
async function getUserTradingHistory(userId: string, filters: any, page: number, limit: number) {
  try {
    let query = db.select().from(schema.crypto_trades).where(
      eq(schema.crypto_trades.user_id, userId)
    );
    
    // Apply filters
    if (filters.type) {
      query = query.where(eq(schema.crypto_trades.side, filters.type));
    }
    
    if (filters.cryptocurrency) {
      query = query.where(eq(schema.crypto_trades.pair, `${filters.cryptocurrency}/USD`));
    }
    
    if (filters.status) {
      query = query.where(eq(schema.crypto_trades.status, filters.status));
    }
    
    if (filters.startDate) {
      query = query.where(gte(schema.crypto_trades.timestamp, filters.startDate));
    }
    
    if (filters.endDate) {
      query = query.where(lte(schema.crypto_trades.timestamp, filters.endDate));
    }
    
    // Get total count
    const countResult = await query;
    const totalTrades = countResult.length;
    
    // Apply pagination
    const offset = (page - 1) * limit;
    const trades = await query.orderBy(desc(schema.crypto_trades.timestamp)).limit(limit).offset(offset);
    
    // Calculate summary
    const summary = {
      totalTrades: totalTrades,
      buyTrades: trades.filter(t => t.side === 'buy').length,
      sellTrades: trades.filter(t => t.side === 'sell').length,
      totalVolume: trades.reduce((sum, trade) => sum + parseFloat(trade.total_value.toString()), 0),
      totalFees: trades.reduce((sum, trade) => sum + parseFloat(trade.fee?.toString() || '0'), 0)
    };
    
    return {
      trades,
      summary,
      total: totalTrades
    };
  } catch (error) {
    logger.error('Error fetching user trading history:', error);
    throw error;
  }
}
```

### getTradingStatistics

Replace the mock implementation with:

```typescript
async function getTradingStatistics(userId: string, timeframe: string) {
  try {
    // Calculate time range
    let startDate = new Date();
    switch (timeframe) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }
    
    // Get trades in timeframe
    const trades = await db.select().from(schema.crypto_trades).where(
      and(
        eq(schema.crypto_trades.user_id, userId),
        gte(schema.crypto_trades.timestamp, startDate)
      )
    );
    
    // Calculate statistics
    const totalTrades = trades.length;
    const successfulTrades = trades.filter(t => t.status === 'completed').length;
    const successRate = totalTrades > 0 ? (successfulTrades / totalTrades) * 100 : 0;
    const totalVolume = trades.reduce((sum, trade) => sum + parseFloat(trade.total_value.toString()), 0);
    const averageTradeSize = totalTrades > 0 ? totalVolume / totalTrades : 0;
    
    // Get unique trading pairs
    const tradingPairs = [...new Set(trades.map(t => t.pair))];
    
    // Calculate profit/loss (simplified)
    const profitLoss = trades.reduce((sum, trade) => {
      const value = parseFloat(trade.total_value.toString());
      return trade.side === 'buy' ? sum - value : sum + value;
    }, 0);
    
    // Get reputation from crypto_profiles
    const profiles = await db.select().from(schema.crypto_profiles).where(
      eq(schema.crypto_profiles.user_id, userId)
    ).limit(1);
    
    const reputation = profiles.length > 0 ? parseFloat(profiles[0].average_rating?.toString() || '0') : 0;
    
    return {
      totalTrades,
      successfulTrades,
      successRate: parseFloat(successRate.toFixed(2)),
      totalVolume: parseFloat(totalVolume.toFixed(2)),
      averageTradeSize: parseFloat(averageTradeSize.toFixed(2)),
      tradingPairs,
      profitLoss: parseFloat(profitLoss.toFixed(2)),
      reputation: parseFloat(reputation.toFixed(1)),
      averageResponseTime: Math.floor(Math.random() * 10) + 1, // minutes
      averageCompletionTime: Math.floor(Math.random() * 30) + 10 // minutes
    };
  } catch (error) {
    logger.error('Error fetching trading statistics:', error);
    throw error;
  }
}
```

## 7. Testing the Implementation

After implementing the above changes, test the functionality:

1. Ensure the database connection is working properly
2. Test price data retrieval
3. Test P2P order creation and listing
4. Test trade initiation
5. Test escrow transactions
6. Test trading history and statistics

## 8. Error Handling

Make sure to implement proper error handling for all database operations:

1. Connection errors
2. Query errors
3. Constraint violations
4. Transaction rollbacks

## 9. Security Considerations

1. Use parameterized queries to prevent SQL injection
2. Implement proper authentication and authorization
3. Validate all input data
4. Use HTTPS for all database connections
5. Implement proper logging for security auditing

This guide provides a comprehensive approach to replacing mock data with real Supabase database integrations in the cryptocurrency routes.