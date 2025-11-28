# RELOADLY Commission System Implementation Guide

## Overview

This guide covers the complete implementation of a commission-based pricing system for RELOADLY integrations (Airtime, Data, Utilities, Gift Cards). The system allows you to:

- ✅ Add margins/commissions to RELOADLY prices
- ✅ Support multiple commission types (percentage, fixed amount)
- ✅ Set operator-specific commission rules
- ✅ Track all transactions in your database
- ✅ Generate revenue reports
- ✅ Manage pricing from the admin panel

## Architecture Overview

```
Frontend Request
    ↓
Commission API (/api/commission/calculate) ← Calculates final price
    ↓
Enhanced RELOADLY Service ← Records transaction, applies commission
    ↓
RELOADLY API ← Sends actual topup
    ↓
Platform Database ← Stores transaction history
```

## Database Schema

### 1. Commission Settings Table
```sql
reloadly_commission_settings (
  id: UUID
  service_type: VARCHAR(50) -- 'airtime', 'data', 'utilities', 'gift_cards'
  operator_id: INTEGER (nullable) -- NULL = global, number = operator-specific
  commission_type: VARCHAR(50) -- 'percentage' | 'fixed_amount' | 'none'
  commission_value: DECIMAL -- e.g., 5 for 5% or 50 for ₦50
  min_amount: DECIMAL (optional)
  max_amount: DECIMAL (optional)
  is_active: BOOLEAN
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
```

### 2. Transactions Table
```sql
reloadly_transactions (
  id: UUID
  user_id: UUID
  service_type: VARCHAR(50)
  operator_id: INTEGER
  operator_name: VARCHAR(255)
  recipient: VARCHAR(255) -- phone or email
  amount: DECIMAL -- User pays this
  reloadly_amount: DECIMAL -- Platform sends to RELOADLY
  commission_earned: DECIMAL
  commission_rate: DECIMAL
  commission_type: VARCHAR(50)
  status: VARCHAR(50) -- 'pending', 'processing', 'success', 'failed'
  reloadly_transaction_id: VARCHAR(255)
  reloadly_reference_id: VARCHAR(255)
  metadata: JSONB
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
)
```

### 3. Operator Cache Table
```sql
reloadly_operator_cache (
  operator_id: INTEGER (primary key)
  operator_name: VARCHAR(255)
  country_code: VARCHAR(5)
  supports_bundles: BOOLEAN
  supports_data: BOOLEAN
  supports_pin: BOOLEAN
  default_commission_rate: DECIMAL
  logo_urls: JSONB
  last_synced: TIMESTAMP
)
```

## Setup Instructions

### Step 1: Run Database Migration

```bash
# The migration file is at: migrations/0040_reloadly_commission_system.sql
# Run it in your Supabase dashboard or using psql:

psql $DATABASE_URL < migrations/0040_reloadly_commission_system.sql
```

### Step 2: Initialize Commission Settings

After running the migration, you need to set up default commission rules:

```bash
# Using your API (curl example)
curl -X POST http://localhost:3000/api/commission/settings \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "service_type": "airtime",
    "operator_id": null,
    "commission_type": "percentage",
    "commission_value": 5,
    "is_active": true
  }'
```

Or use the commission service directly:

```typescript
import commissionService from './server/services/commissionService.js';

// Create global 5% commission for airtime
await commissionService.createCommissionSetting({
  service_type: 'airtime',
  operator_id: null,
  commission_type: 'percentage',
  commission_value: 5,
  is_active: true
}, adminUserId);

// Create 3% commission for data
await commissionService.createCommissionSetting({
  service_type: 'data',
  operator_id: null,
  commission_type: 'percentage',
  commission_value: 3,
  is_active: true
}, adminUserId);

// Create fixed ₦50 for utilities
await commissionService.createCommissionSetting({
  service_type: 'utilities',
  operator_id: null,
  commission_type: 'fixed_amount',
  commission_value: 50,
  is_active: true
}, adminUserId);

// Create operator-specific: 2% for MTN airtime
await commissionService.createCommissionSetting({
  service_type: 'airtime',
  operator_id: 1, // MTN operator ID
  commission_type: 'percentage',
  commission_value: 2,
  is_active: true
}, adminUserId);
```

## Usage Guide

### Backend: Recording a Transaction

Use the enhanced service to handle transactions with commission:

```typescript
import reloadlyEnhancedService from './server/services/reloadlyEnhancedService.js';

// In your endpoint handler
const result = await reloadlyEnhancedService.sendAirtimeTopupWithCommission({
  operatorId: 1,
  amount: 1000, // User wants to buy ₦1000
  recipientPhone: '+2348012345678',
  userId: userId,
  serviceType: 'airtime'
});

if (result.success) {
  return res.json({
    success: true,
    transactionId: result.data.transactionId,
    originalAmount: result.data.originalAmount, // ₦1000
    finalAmount: result.data.finalAmount, // ₦1050 (with 5% commission)
    commission: result.data.commission, // ₦50
    commissionRate: result.data.commissionRate // 5
  });
}
```

### Backend: Calculate Commission Before Purchase

```typescript
import commissionService from './server/services/commissionService.js';

// Calculate final price
const calculation = await commissionService.calculateCommission(
  'airtime',
  1000, // User amount
  1 // MTN operator ID (optional)
);

// Returns:
// {
//   original_amount: 1000,
//   commission_value: 20, // 2% for MTN
//   commission_type: 'percentage',
//   commission_rate: 2,
//   final_amount: 1020,
//   reloadly_amount: 1000
// }
```

### Backend: Get Transaction History

```typescript
// Get user's transactions
const { transactions, total } = await commissionService.getUserTransactions(
  userId,
  {
    serviceType: 'airtime',
    status: 'success',
    limit: 10,
    offset: 0
  }
);

// Get commission statistics
const stats = await commissionService.getCommissionStats({
  serviceType: 'airtime',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});

// Returns:
// {
//   total_transactions: 150,
//   total_amount: 150000,
//   total_commission: 7500,
//   average_commission_rate: 5,
//   success_rate: 98.5
// }
```

### Frontend: Fetch Prices with Commission

```typescript
// Calculate final price before showing to user
const fetchFinalPrice = async (serviceType: string, amount: number, operatorId?: number) => {
  const response = await fetch('/api/commission/calculate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      service_type: serviceType,
      amount,
      operator_id: operatorId
    })
  });

  const result = await response.json();
  return result.data; // Contains original_amount, commission_value, final_amount
};

// Usage in component
useEffect(() => {
  const calculation = await fetchFinalPrice('airtime', 1000, operatorId);
  setFinalPrice(calculation.final_amount);
  setCommission(calculation.commission_value);
}, [amount, operatorId]);
```

### Frontend: Get Transaction History

```typescript
// Fetch user's transaction history
const fetchTransactionHistory = async () => {
  const response = await fetch(
    '/api/commission/transactions?serviceType=airtime&limit=10&offset=0',
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  const result = await response.json();
  return result.data;
};

// Display in component
{transactions.map((tx) => (
  <div key={tx.id}>
    <p>{tx.operator_name} - {tx.recipient}</p>
    <p>Amount: ₦{tx.amount} (Commission: ₦{tx.commission_earned})</p>
    <p>Status: {tx.status}</p>
    <p>Date: {new Date(tx.created_at).toLocaleDateString()}</p>
  </div>
))}
```

## API Reference

### Commission Management Endpoints

#### Get All Commission Settings (Admin)
```
GET /api/commission/settings
Query Parameters:
  - serviceType?: string
  - isActive?: boolean

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "service_type": "airtime",
      "operator_id": null,
      "commission_type": "percentage",
      "commission_value": 5,
      "is_active": true,
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

#### Create Commission Setting (Admin)
```
POST /api/commission/settings
Body:
{
  "service_type": "airtime",
  "operator_id": null,
  "commission_type": "percentage",
  "commission_value": 5,
  "min_amount": 100,
  "max_amount": 50000,
  "is_active": true
}

Response: [Created setting object]
```

#### Update Commission Setting (Admin)
```
PUT /api/commission/settings/{settingId}
Body: [Any field to update]

Response: [Updated setting object]
```

#### Delete Commission Setting (Admin)
```
DELETE /api/commission/settings/{settingId}

Response: { "success": true, "message": "..." }
```

#### Get Operator-Specific Commission
```
GET /api/commission/operator/{serviceType}/{operatorId}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "commission_type": "percentage",
    "commission_value": 2,
    "commission_rate": 2
  }
}
```

### Transaction Endpoints

#### Calculate Commission
```
POST /api/commission/calculate
Body:
{
  "service_type": "airtime",
  "amount": 1000,
  "operator_id": 1
}

Response:
{
  "success": true,
  "data": {
    "original_amount": 1000,
    "commission_value": 50,
    "commission_type": "percentage",
    "commission_rate": 5,
    "final_amount": 1050,
    "reloadly_amount": 1000
  }
}
```

#### Get User Transactions
```
GET /api/commission/transactions?serviceType=airtime&status=success&limit=10&offset=0

Response:
{
  "success": true,
  "data": {
    "transactions": [...],
    "pagination": {
      "limit": 10,
      "offset": 0,
      "total": 150
    }
  }
}
```

#### Get Transaction Details
```
GET /api/commission/transactions/{transactionId}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "service_type": "airtime",
    "operator_id": 1,
    "operator_name": "MTN",
    "recipient": "+2348012345678",
    "amount": 1050,
    "reloadly_amount": 1000,
    "commission_earned": 50,
    "commission_rate": 5,
    "status": "success",
    "reloadly_transaction_id": "...",
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

#### Get Commission Statistics (Admin)
```
GET /api/commission/stats?serviceType=airtime&status=success&startDate=2024-01-01&endDate=2024-01-31

Response:
{
  "success": true,
  "data": {
    "total_transactions": 150,
    "total_amount": 150000,
    "total_commission": 7500,
    "average_commission_rate": 5,
    "success_rate": 98.5
  }
}
```

## Commission Type Examples

### Percentage Commission

```typescript
// Configuration
{
  commission_type: 'percentage',
  commission_value: 5 // 5%
}

// Calculation
User amount: ₦1,000
Commission: ₦1,000 × 5% = ₦50
Final price: ₦1,050
Platform receives: ₦1,000 (sent to RELOADLY)
Platform keeps: ₦50
```

### Fixed Amount Commission

```typescript
// Configuration
{
  commission_type: 'fixed_amount',
  commission_value: 50 // ₦50 per transaction
}

// Calculation
User amount: ₦1,000
Commission: ₦50 (fixed)
Final price: ₦1,050
Platform receives: ₦1,000 (sent to RELOADLY)
Platform keeps: ₦50
```

### No Commission

```typescript
// Configuration
{
  commission_type: 'none',
  commission_value: 0
}

// Calculation
User amount: ₦1,000
Commission: ₦0
Final price: ₦1,000
Platform receives: ₦1,000
Platform keeps: ₦0
```

## Frontend Integration Steps

### Step 1: Update Airtime Component

```typescript
// In src/pages/wallet/Airtime.tsx
const handlePurchase = async () => {
  // 1. Calculate final price
  const priceResponse = await fetch('/api/commission/calculate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      service_type: 'airtime',
      amount: selectedAmount,
      operator_id: selectedOperatorId
    })
  });

  const priceData = await priceResponse.json();
  const { final_amount, commission_value } = priceData.data;

  // 2. Show confirmation with breakdown
  // Price: ₦1,000
  // Commission: ₦50
  // Total: ₦1,050

  // 3. Process purchase with final amount
  const result = await fetch('/api/reloadly/airtime/topup', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      operatorId: selectedOperatorId,
      amount: selectedAmount, // Send original amount
      recipientPhone: phoneNumber
    })
  });
};
```

### Step 2: Display Price Breakdown

```typescript
<div className="price-breakdown">
  <div className="flex justify-between">
    <span>Service Amount</span>
    <span>₦{priceData.original_amount}</span>
  </div>
  <div className="flex justify-between text-orange-600">
    <span>Commission ({priceData.commission_rate}%)</span>
    <span>₦{priceData.commission_value}</span>
  </div>
  <div className="flex justify-between font-bold border-t pt-2">
    <span>Total You Pay</span>
    <span>₦{priceData.final_amount}</span>
  </div>
</div>
```

### Step 3: Show Transaction History

```typescript
useEffect(() => {
  const fetchHistory = async () => {
    const response = await fetch('/api/commission/transactions?limit=10', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    setTransactions(result.data.transactions);
  };

  fetchHistory();
}, []);

// Render transaction list
{transactions.map((tx) => (
  <div key={tx.id} className="transaction-item">
    <div className="flex justify-between">
      <span>{tx.operator_name} - {tx.recipient}</span>
      <span className="text-green-600">₦{tx.amount}</span>
    </div>
    <div className="text-sm text-gray-500">
      {new Date(tx.created_at).toLocaleDateString()}
    </div>
  </div>
))}
```

## Admin Dashboard Features

### 1. Commission Settings Management

- View all commission rules
- Create new rules (global or operator-specific)
- Edit existing rules
- Deactivate/delete rules
- Filter by service type

### 2. Transaction Audit

- View all transactions
- Filter by user, service type, date range, status
- Export transaction history
- Verify RELOADLY sync

### 3. Revenue Reports

- Total commission earned
- Commission by service type
- Commission by operator
- Success rate tracking
- Average commission rate

### 4. Operator Management

- Sync operators from RELOADLY
- Set operator-specific commissions
- View operator stats
- Cache management

## Best Practices

### 1. Commission Strategy
- Start with 3-5% for high-volume services (airtime)
- Use 2-3% for data bundles
- Fixed amount (₦50-100) for utilities
- Test different rates to find optimal price point

### 2. Error Handling
- Always verify commission calculation before displaying price
- Handle RELOADLY API failures gracefully
- Log all transaction failures for debugging
- Implement retry mechanism for failed transactions

### 3. Security
- Ensure only admins can modify commission settings
- Audit all commission changes
- Verify user ownership when accessing transaction history
- Implement transaction verification mechanism

### 4. Performance
- Cache operator data locally
- Use database indexes on frequently queried columns
- Implement pagination for transaction history
- Cache commission settings in memory

### 5. Monitoring
- Track transaction success rates
- Monitor commission revenue
- Alert on API failures
- Track unusual patterns (unusually high commission rates)

## Troubleshooting

### Issue: Commission not applied
**Solution**: 
- Check if commission setting is active (is_active = true)
- Verify service_type matches exactly ('airtime', 'data', etc.)
- Check operator_id in settings

### Issue: Transaction not recorded
**Solution**:
- Verify reloadly_transactions table exists
- Check RLS policies allow inserts
- Review server logs for errors

### Issue: Wrong operator commission
**Solution**:
- Check operator_id matches RELOADLY operator ID
- Verify setting is not operator-specific when it should be global
- Clear operator cache and resync

### Issue: Price calculation errors
**Solution**:
- Verify amount is within min_amount and max_amount
- Check commission_value is positive
- For percentage, ensure it doesn't exceed 100

## Monitoring & Alerts

### Key Metrics to Track

1. **Transaction Volume**: Daily successful transactions
2. **Commission Revenue**: Daily/monthly commission earned
3. **Success Rate**: Percentage of successful transactions
4. **Average Commission**: Average commission per transaction
5. **API Health**: RELOADLY API uptime

### Recommended Alerts

- Alert if success rate drops below 95%
- Alert if RELOADLY API is down
- Alert on unusual commission rates
- Alert on large transaction failures

## Migration Path

### Phase 1: Soft Launch
- Set commission to 0% for testing
- Monitor transaction flow
- Validate all data is being recorded

### Phase 2: Low Commission
- Start with 1-2% commission
- Monitor user feedback
- Adjust based on adoption

### Phase 3: Full Rollout
- Implement 3-5% commission
- Launch admin dashboard
- Start revenue tracking

## Support & Maintenance

- Monitor RELOADLY API changes
- Keep commission settings up to date
- Regular reconciliation with RELOADLY
- Monthly revenue reports
- User support for transaction issues

## Next Steps

1. **Immediate**: Run database migration and initialize commission settings
2. **Short-term**: Update frontend components to use commission API
3. **Medium-term**: Build admin dashboard for commission management
4. **Long-term**: Implement advanced features (seasonal pricing, volume discounts, etc.)
