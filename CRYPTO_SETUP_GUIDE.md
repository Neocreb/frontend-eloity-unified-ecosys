# Crypto Platform Setup Guide

## ✅ Current Status

The crypto platform is now **fully functional** with the following features working:

### Working Features
- ✅ **Crypto Price Feeds**: Real-time BTC, ETH, SOL, ADA, and 10+ other cryptocurrencies
- ✅ **Trading Pairs & Orderbook**: Complete order book data for trading
- ✅ **P2P Trading System**: Buy/sell cryptocurrency peer-to-peer
- ✅ **Escrow System**: Secure transactions with dispute resolution
- ✅ **DeFi Dashboard**: Staking and yield farming information
- ✅ **Crypto Trading Interface**: Advanced trading tools with charts

### Features Requiring Configuration
- ⏳ **Real Address Generation**: Deposit addresses (requires Bybit API keys)
- ⏳ **Withdrawals**: Real withdrawal processing (requires Bybit API keys)
- ⏳ **Account Balances**: Real Bybit wallet balances (requires Bybit API keys)

---

## 🔧 Configuration Options

Choose one of the following approaches to enable authenticated Bybit features:

### Option 1: Direct Bybit API Keys (Recommended for Development)

Set these environment variables:

```bash
BYBIT_PUBLIC_API=your_bybit_public_api_key
BYBIT_SECRET_API=your_bybit_secret_api_key
```

**How to get Bybit API Keys:**
1. Log in to your Bybit account at https://www.bybit.com
2. Go to Account → API
3. Create a new API key with these permissions:
   - **Contracts**: Orders, Positions, Order History
   - **Spot**: Orders, Account, Trade
   - **Exchange**: Deposits, Withdrawals, Transfer
   - **User**: User ID, Account Info
4. Copy your Public Key and Secret Key

**System will automatically:**
- Handle API signing and authentication
- Call Bybit API v5 endpoints directly
- Support deposit addresses, withdrawals, balances, and trading

### Option 2: Supabase Edge Functions (Recommended for Production)

1. Create a Supabase project at https://supabase.com
2. Deploy the Edge Function (it's already in `supabase/functions/bybit/`)
3. Set these environment variables:
   ```bash
   SUPABASE_EDGE_BASE=https://your-project-id.supabase.co/functions/v1
   SUPABASE_FUNCTIONS_URL=https://your-project-id.supabase.co/functions/v1
   BYBIT_PUBLIC_API=your_bybit_public_api_key
   BYBIT_SECRET_API=your_bybit_secret_api_key
   ```

**Benefits:**
- Secure server-side signing (keys never exposed to client)
- Better rate limiting and request batching
- Production-ready security

---

## 📋 Feature Details

### Public Features (No Auth Required)
- **GET /api/crypto/prices** - Current cryptocurrency prices
- **GET /api/crypto/orderbook/:pair** - Trading pair orderbook
- **GET /api/crypto/p2p/orders** - Available P2P trading orders

### Authenticated Features (User Login Required)
- **POST /api/crypto/p2p/orders** - Create P2P order
- **GET /api/crypto/p2p/orders/my** - Your P2P orders
- **POST /api/crypto/p2p/orders/:id/trade** - Respond to order
- **GET /api/crypto/escrow/:id** - Escrow details
- **POST /api/crypto/escrow/:id/confirm-payment** - Confirm payment
- **POST /api/crypto/escrow/:id/release** - Release funds

### Admin/KYC Required Features
- **GET /api/crypto/user/balances** - Real wallet balances (requires Bybit API)
- **GET /api/bybit/deposit-address** - Generate deposit address
- **POST /api/bybit/withdraw** - Process withdrawal
- **GET /api/crypto/stats** - Trading statistics
- **GET /api/crypto/risk-assessment** - Risk analysis

---

## 🚀 Deployment Environment Variables

### Development (.env file)
```bash
# Bybit API Configuration
BYBIT_PUBLIC_API=your_public_key
BYBIT_SECRET_API=your_secret_key

# Or Supabase Edge Functions
SUPABASE_EDGE_BASE=https://your-project.supabase.co/functions/v1

# Database Configuration
DATABASE_URL=postgresql://user:password@host:5432/database

# Other required variables
PORT=5002
NODE_ENV=development
JWT_SECRET=your-secret-key
```

### Production (Environment Variables)
Set the same variables in your hosting platform (Netlify, Vercel, etc.)

---

## 🧪 Testing Endpoints

### Test Price Feeds
```bash
curl "http://localhost:5002/api/crypto/prices?symbols=bitcoin,ethereum"
```

### Test Orderbook
```bash
curl "http://localhost:5002/api/crypto/orderbook/BTCUSDT"
```

### Test P2P Orders
```bash
curl "http://localhost:5002/api/crypto/p2p/orders?cryptocurrency=BTC"
```

### Test Deposit Address (with Bybit keys configured)
```bash
curl "http://localhost:5002/api/bybit/deposit-address?coin=BTC"
```

---

## 🔒 Security Considerations

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Consider Supabase Edge Functions** for production (adds additional security layer)
4. **Enable KYC verification** before allowing deposits/withdrawals
5. **Set withdrawal limits** based on KYC level
6. **Monitor transaction volumes** for fraud detection

---

## 🆘 Troubleshooting

### Issue: "Bybit integration not configured"
**Solution**: Set BYBIT_PUBLIC_API and BYBIT_SECRET_API environment variables

### Issue: Deposit addresses not generating
**Solution**: Ensure Bybit API keys have the "Deposits" permission enabled

### Issue: Withdrawals failing
**Solution**: 
- Check Bybit API key has "Withdrawals" permission
- Verify user has completed KYC
- Check withdrawal is within configured limits

### Issue: Prices not loading
**Solution**: 
- System defaults to Bybit public APIs and CoinGecko
- Check internet connection
- Verify no CORS issues

---

## 📊 Monitoring

Key metrics to monitor:
- API response times
- Failed transaction count
- KYC verification completion rate
- User account balances reconciliation
- Withdrawal/deposit volume

---

## 🎯 Next Steps

1. Obtain Bybit API keys
2. Configure environment variables
3. Test deposit address generation
4. Complete end-to-end transaction testing
5. Deploy to production with proper security measures

For support or questions, please refer to:
- Bybit API Documentation: https://bybit-exchange.github.io/docs/
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
