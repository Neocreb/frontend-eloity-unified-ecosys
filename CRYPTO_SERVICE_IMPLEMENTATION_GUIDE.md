# Crypto Service Implementation Guide

This guide provides detailed instructions for replacing mock data with real Supabase database integrations in the crypto service.

## Current State

The crypto service (`server/services/cryptoService.ts`) currently uses mock data implementations for all database operations. The database schema is properly defined in `shared/crypto-schema.ts` but not utilized.

## Database Schema Reference

### crypto_profiles
- User KYC and trading profile information
- Fields: id, user_id, wallet_address, kyc_status, trading_volume, etc.

### crypto_wallets
- User wallet information and balances
- Fields: id, user_id, wallet_address, chain_type, balance, currency, etc.

### crypto_transactions
- Transaction history (deposits, withdrawals, trades)
- Fields: id, user_id, wallet_id, transaction_hash, amount, status, etc.

### crypto_trades
- Trading history and P2P orders
- Fields: id, user_id, pair, side, price, amount, status, etc.

### crypto_prices
- Cryptocurrency price data
- Fields: id, symbol, name, price_usd, market_cap, etc.

## Implementation Steps

### 1. Wallet Management Functions

#### saveWalletToDatabase
Replace the mock implementation with:
```typescript
async function saveWalletToDatabase(wallet: any) {
  try {
    const result = await db.insert(crypto_wallets)
      .values({
        user_id: wallet.userId,
        wallet_address: wallet.addresses.BTC || wallet.addresses.ETH || 'mock_address',
        wallet_provider: 'internal',
        chain_type: 'multi',
        currency: 'USD',
        is_primary: wallet.isActive,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    
    logger.info('Wallet saved to database', { walletId: result[0].id });
    return result[0];
  } catch (error) {
    logger.error('Database wallet save error:', error);
    throw error;
  }
}
```

#### getWalletFromDatabase
Replace the mock implementation with:
```typescript
async function getWalletFromDatabase(userId: string) {
  try {
    const result = await db.select().from(crypto_wallets)
      .where(eq(crypto_wallets.user_id, userId))
      .limit(1);
    
    if (result.length === 0) {
      return null;
    }
    
    return {
      id: result[0].id,
      userId: result[0].user_id,
      addresses: {
        'BTC': result[0].wallet_address,
        'ETH': result[0].wallet_address,
        'USDT': result[0].wallet_address
      },
      currencies: ['BTC', 'ETH', 'USDT'],
      createdAt: result[0].created_at
    };
  } catch (error) {
    logger.error('Database wallet fetch error:', error);
    throw error;
  }
}
```

#### saveDepositToDatabase
Replace the mock implementation with:
```typescript
async function saveDepositToDatabase(deposit: any) {
  try {
    const result = await db.insert(crypto_transactions)
      .values({
        user_id: deposit.userId,
        wallet_id: deposit.walletId,
        transaction_hash: deposit.txHash,
        from_address: 'external',
        to_address: deposit.address,
        amount: deposit.amount,
        currency: deposit.currency,
        transaction_fee: 0,
        status: deposit.status,
        transaction_type: 'receive',
        timestamp: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    
    logger.info('Deposit saved to database', { depositId: result[0].id });
    return result[0];
  } catch (error) {
    logger.error('Database deposit save error:', error);
    throw error;
  }
}
```

#### saveWithdrawalToDatabase
Replace the mock implementation with:
```typescript
async function saveWithdrawalToDatabase(withdrawal: any) {
  try {
    const result = await db.insert(crypto_transactions)
      .values({
        user_id: withdrawal.userId,
        wallet_id: withdrawal.walletId,
        transaction_hash: 'pending',
        from_address: withdrawal.address,
        to_address: 'external',
        amount: withdrawal.amount,
        currency: withdrawal.currency,
        transaction_fee: withdrawal.fee,
        status: withdrawal.status,
        transaction_type: 'send',
        timestamp: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    
    logger.info('Withdrawal saved to database', { withdrawalId: result[0].id });
    return result[0];
  } catch (error) {
    logger.error('Database withdrawal save error:', error);
    throw error;
  }
}
```

#### creditWalletBalance and debitWalletBalance
Replace the mock implementations with:
```typescript
async function creditWalletBalance(userId: string, currency: string, amount: number) {
  try {
    // Update wallet balance in database
    const wallets = await db.select().from(crypto_wallets)
      .where(eq(crypto_wallets.user_id, userId))
      .limit(1);
    
    if (wallets.length > 0) {
      const currentBalance = parseFloat(wallets[0].balance.toString()) || 0;
      const newBalance = currentBalance + amount;
      
      await db.update(crypto_wallets)
        .set({
          balance: newBalance.toString(),
          updated_at: new Date()
        })
        .where(eq(crypto_wallets.id, wallets[0].id));
    }
    
    logger.info('Wallet balance credited', { userId, currency, amount });
  } catch (error) {
    logger.error('Database balance credit error:', error);
    throw error;
  }
}

async function debitWalletBalance(userId: string, currency: string, amount: number) {
  try {
    // Update wallet balance in database
    const wallets = await db.select().from(crypto_wallets)
      .where(eq(crypto_wallets.user_id, userId))
      .limit(1);
    
    if (wallets.length > 0) {
      const currentBalance = parseFloat(wallets[0].balance.toString()) || 0;
      const newBalance = currentBalance - amount;
      
      await db.update(crypto_wallets)
        .set({
          balance: newBalance.toString(),
          updated_at: new Date()
        })
        .where(eq(crypto_wallets.id, wallets[0].id));
    }
    
    logger.info('Wallet balance debited', { userId, currency, amount });
  } catch (error) {
    logger.error('Database balance debit error:', error);
    throw error;
  }
}
```

### 2. P2P Trading Functions

#### saveP2POrderToDatabase
Replace the mock implementation with:
```typescript
async function saveP2POrderToDatabase(order: any) {
  try {
    const result = await db.insert(crypto_trades)
      .values({
        user_id: order.userId,
        pair: `${order.cryptocurrency}/${order.fiatCurrency}`,
        side: order.type,
        price: order.price.toString(),
        amount: order.amount.toString(),
        total_value: (order.amount * order.price).toString(),
        fee: '0',
        fee_currency: order.fiatCurrency,
        status: 'active',
        order_type: 'p2p',
        timestamp: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning();
    
    logger.info('P2P order saved to database', { orderId: result[0].id });
    return result[0];
  } catch (error) {
    logger.error('Database P2P order save error:', error);
    throw error;
  }
}
```

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
    
    logger.info('P2P trade initiated', { tradeId, escrowId, ...tradeData });
    
    return {
      success: true,
      tradeId,
      escrowId,
      trade: { id: tradeId, ...tradeData },
      instructions: `Please complete payment of ${tradeData.amount * tradeData.price} ${tradeData.fiatCurrency} within ${tradeData.timeLimit} minutes.`
    };
  } catch (error) {
    logger.error('P2P trade initiation error:', error);
    return {
      success: false,
      error: error.message
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
    
    logger.info('Escrow payment confirmed', { escrowId, ...data });
    
    return {
      success: true
    };
  } catch (error) {
    logger.error('Escrow payment confirmation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
```

### 3. Trading History and Statistics

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
    
    // Calculate summary statistics
    const completedTrades = result.filter(trade => trade.status === 'completed').length;
    const buyTrades = result.filter(trade => trade.side === 'buy').length;
    const sellTrades = result.filter(trade => trade.side === 'sell').length;
    const totalVolume = result.reduce((sum, trade) => sum + parseFloat(trade.total_value.toString()), 0);
    const totalFees = result.reduce((sum, trade) => sum + parseFloat(trade.fee?.toString() || '0'), 0);
    
    // Get total count
    const countResult = await db.select({ count: count() }).from(crypto_trades)
      .where(and(...conditions));
    const total = countResult[0].count;
    
    return {
      trades,
      summary: {
        totalTrades: total,
        buyTrades,
        sellTrades,
        totalVolume,
        totalFees
      },
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
        totalTrades: 0,
        successfulTrades: 0,
        successRate: 0,
        totalVolume: 0,
        averageTradeSize: 0,
        tradingPairs: [],
        profitLoss: 0,
        reputation: 0,
        averageResponseTime: 0,
        averageCompletionTime: 0
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
      totalTrades: 0,
      successfulTrades: 0,
      successRate: 0,
      totalVolume: 0,
      averageTradeSize: 0,
      tradingPairs: [],
      profitLoss: 0,
      reputation: 0,
      averageResponseTime: 0,
      averageCompletionTime: 0
    };
  }
}
```

## Implementation Best Practices

### Error Handling
- Always wrap database operations in try/catch blocks
- Log errors with sufficient context for debugging
- Return meaningful error messages to the client
- Implement retry logic for transient failures

### Performance Optimization
- Use proper indexing on frequently queried fields
- Implement pagination for large result sets
- Use connection pooling for better resource management
- Cache frequently accessed data when appropriate

### Security
- Validate all input data before database operations
- Use parameterized queries to prevent SQL injection
- Implement proper access controls and authorization checks
- Encrypt sensitive data at rest and in transit

### Testing
- Create unit tests for each database function
- Implement integration tests for end-to-end functionality
- Test error conditions and edge cases
- Perform load testing to ensure performance under stress

## Next Steps

1. Implement the wallet management functions first
2. Test with a small set of users and transactions
3. Gradually implement the P2P trading functions
4. Add comprehensive error handling and logging
5. Implement monitoring and alerting for database operations
6. Conduct performance testing and optimization
7. Create documentation for the new implementation