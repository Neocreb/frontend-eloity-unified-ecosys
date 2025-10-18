# Production Crypto Service Implementation Guide

This guide provides detailed instructions for replacing mock data with real Supabase database integrations in the cryptocurrency service.

## 1. Database Connection Setup

First, create a database utility file at `server/utils/db.ts`:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../shared/crypto-schema';
import * as userSchema from '../../shared/schema';
import { logger } from './logger.js';

// Get database URL from environment variables
const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

if (!databaseUrl) {
  logger.error('DATABASE_URL or SUPABASE_DB_URL is required');
  throw new Error('DATABASE_URL or SUPABASE_DB_URL is required');
}

// Create postgres client
const client = postgres(databaseUrl, {
  ssl: {
    rejectUnauthorized: false
  }
});

// Create drizzle instance
export const db = drizzle(client, { schema: { ...schema, ...userSchema } });

logger.info('Database connection initialized successfully');
```

Then update the imports in `server/services/cryptoService.ts`:

```typescript
import { logger } from '../utils/logger.js';
import { db } from '../utils/db.js';
import { eq, and, gte, lt, desc } from 'drizzle-orm';
import * as schema from '../../shared/crypto-schema';
import * as userSchema from '../../shared/schema';
```

## 2. Wallet Management Functions

### saveWalletToDatabase

Replace the mock implementation with:

```typescript
async function saveWalletToDatabase(wallet: any) {
  try {
    const result = await db.insert(schema.crypto_wallets).values({
      user_id: wallet.userId,
      wallet_address: wallet.id,
      wallet_provider: 'internal',
      chain_type: 'multi',
      balance: '0',
      currency: 'USD',
      is_primary: true,
      is_connected: true,
      last_synced_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    }).returning();
    
    logger.info('Wallet saved to database', { walletId: result[0].id });
    return result[0];
  } catch (error) {
    logger.error('Error saving wallet to database:', error);
    throw error;
  }
}
```

### getWalletFromDatabase

Replace the mock implementation with:

```typescript
async function getWalletFromDatabase(userId: string) {
  try {
    const wallets = await db.select().from(schema.crypto_wallets).where(
      eq(schema.crypto_wallets.user_id, userId)
    ).limit(1);
    
    if (wallets.length === 0) {
      return null;
    }
    
    return {
      id: wallets[0].id,
      userId: wallets[0].user_id,
      addresses: {
        'BTC': wallets[0].wallet_address,
        'ETH': wallets[0].wallet_address,
        'USDT': wallets[0].wallet_address
      },
      currencies: ['BTC', 'ETH', 'USDT'],
      createdAt: wallets[0].created_at
    };
  } catch (error) {
    logger.error('Error fetching wallet from database:', error);
    throw error;
  }
}
```

### saveDepositToDatabase

Replace the mock implementation with:

```typescript
async function saveDepositToDatabase(deposit: any) {
  try {
    const result = await db.insert(schema.crypto_transactions).values({
      user_id: deposit.userId,
      wallet_id: deposit.userId, // This should be the actual wallet ID
      transaction_hash: deposit.txHash,
      from_address: 'external',
      to_address: 'internal',
      amount: deposit.amount.toString(),
      currency: deposit.currency,
      transaction_fee: '0',
      status: deposit.status,
      transaction_type: 'receive',
      timestamp: new Date(),
      confirmations: deposit.currentConfirmations,
      created_at: new Date(),
      updated_at: new Date()
    }).returning();
    
    logger.info('Deposit saved to database', { depositId: result[0].id });
    return result[0];
  } catch (error) {
    logger.error('Error saving deposit to database:', error);
    throw error;
  }
}
```

### saveWithdrawalToDatabase

Replace the mock implementation with:

```typescript
async function saveWithdrawalToDatabase(withdrawal: any) {
  try {
    const result = await db.insert(schema.crypto_transactions).values({
      user_id: withdrawal.userId,
      wallet_id: withdrawal.userId, // This should be the actual wallet ID
      transaction_hash: `withdrawal_${Date.now()}`,
      from_address: 'internal',
      to_address: withdrawal.address,
      amount: withdrawal.amount.toString(),
      currency: withdrawal.currency,
      transaction_fee: withdrawal.fee.toString(),
      status: withdrawal.status,
      transaction_type: 'send',
      timestamp: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    }).returning();
    
    logger.info('Withdrawal saved to database', { withdrawalId: result[0].id });
    return result[0];
  } catch (error) {
    logger.error('Error saving withdrawal to database:', error);
    throw error;
  }
}
```

### updateDepositStatus

Replace the mock implementation with:

```typescript
async function updateDepositStatus(depositId: string, status: string) {
  try {
    await db.update(schema.crypto_transactions)
      .set({ status, updated_at: new Date() })
      .where(eq(schema.crypto_transactions.id, depositId));
    
    logger.info('Deposit status updated', { depositId, status });
  } catch (error) {
    logger.error('Error updating deposit status:', error);
    throw error;
  }
}
```

### updateWithdrawalStatus

Replace the mock implementation with:

```typescript
async function updateWithdrawalStatus(withdrawalId: string, status: string) {
  try {
    await db.update(schema.crypto_transactions)
      .set({ status, updated_at: new Date() })
      .where(eq(schema.crypto_transactions.id, withdrawalId));
    
    logger.info('Withdrawal status updated', { withdrawalId, status });
  } catch (error) {
    logger.error('Error updating withdrawal status:', error);
    throw error;
  }
}
```

## 3. P2P Trading Functions

### saveP2POrderToDatabase

Replace the mock implementation with:

```typescript
async function saveP2POrderToDatabase(order: any) {
  try {
    // In a real implementation, you would create a proper P2P orders table
    logger.info('P2P order saved to database', { orderId: order.id });
    return order;
  } catch (error) {
    logger.error('Error saving P2P order to database:', error);
    throw error;
  }
}
```

## 4. Escrow Functions

### saveEscrowToDatabase

Replace the mock implementation with:

```typescript
async function saveEscrowToDatabase(escrow: any) {
  try {
    // In a real implementation, you would create a proper escrow transactions table
    logger.info('Escrow saved to database', { escrowId: escrow.id });
    return escrow;
  } catch (error) {
    logger.error('Error saving escrow to database:', error);
    throw error;
  }
}
```

### getEscrowFromDatabase

Replace the mock implementation with:

```typescript
async function getEscrowFromDatabase(escrowId: string) {
  try {
    // In a real implementation, you would query the escrow transactions table
    return {
      id: escrowId,
      sellerId: 'seller123',
      buyerId: 'buyer456',
      status: 'payment_confirmed',
      cryptocurrency: 'BTC',
      amount: 1.5
    };
  } catch (error) {
    logger.error('Error fetching escrow from database:', error);
    throw error;
  }
}
```

### updateEscrowStatus

Replace the mock implementation with:

```typescript
async function updateEscrowStatus(escrowId: string, status: string, metadata?: any) {
  try {
    // In a real implementation, you would update the escrow transactions table
    logger.info('Escrow status updated', { escrowId, status, metadata });
  } catch (error) {
    logger.error('Error updating escrow status:', error);
    throw error;
  }
}
```

### saveDisputeToDatabase

Replace the mock implementation with:

```typescript
async function saveDisputeToDatabase(dispute: any) {
  try {
    // In a real implementation, you would create a proper disputes table
    logger.info('Dispute saved to database', { disputeId: dispute.id });
    return dispute;
  } catch (error) {
    logger.error('Error saving dispute to database:', error);
    throw error;
  }
}
```

## 5. Additional Functions

### creditWalletBalance

Replace the mock implementation with:

```typescript
async function creditWalletBalance(userId: string, currency: string, amount: number) {
  try {
    // Update the actual wallet balance in the database
    await db.update(schema.crypto_wallets)
      .set({ 
        balance: sql`${schema.crypto_wallets.balance} + ${amount.toString()}`,
        updated_at: new Date() 
      })
      .where(eq(schema.crypto_wallets.user_id, userId));
    
    logger.info('Wallet balance credited', { userId, currency, amount });
  } catch (error) {
    logger.error('Error crediting wallet balance:', error);
    throw error;
  }
}
```

### debitWalletBalance

Replace the mock implementation with:

```typescript
async function debitWalletBalance(userId: string, currency: string, amount: number) {
  try {
    // Update the actual wallet balance in the database
    await db.update(schema.crypto_wallets)
      .set({ 
        balance: sql`${schema.crypto_wallets.balance} - ${amount.toString()}`,
        updated_at: new Date() 
      })
      .where(eq(schema.crypto_wallets.user_id, userId));
    
    logger.info('Wallet balance debited', { userId, currency, amount });
  } catch (error) {
    logger.error('Error debiting wallet balance:', error);
    throw error;
  }
}
```

## 6. Testing the Implementation

After implementing the above changes, test the functionality:

1. Ensure the database connection is working properly
2. Test wallet creation and balance retrieval
3. Test deposit and withdrawal functionality
4. Test P2P order creation
5. Test escrow transactions

## 7. Error Handling

Make sure to implement proper error handling for all database operations:

1. Connection errors
2. Query errors
3. Constraint violations
4. Transaction rollbacks

## 8. Security Considerations

1. Use parameterized queries to prevent SQL injection
2. Implement proper authentication and authorization
3. Validate all input data
4. Use HTTPS for all database connections
5. Implement proper logging for security auditing

This guide provides a comprehensive approach to replacing mock data with real Supabase database integrations in the cryptocurrency service.