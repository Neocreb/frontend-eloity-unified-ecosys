# Universal Currency System Implementation

## Overview
This document describes the comprehensive universal currency system implementation for the Eloity platform that allows users to select their preferred currency with automatic geolocation detection, daily exchange rate updates, and live crypto pricing.

## Features

### 1. **Multi-Currency Support**
- **100+ Supported Currencies**: Full support for fiat currencies worldwide, with special emphasis on African currencies
- **African Currencies Featured**: NGN (Nigeria), ZAR (South Africa), KES (Kenya), GHS (Ghana), EGP (Egypt), UGX (Uganda), TZS (Tanzania), and more
- **Major Global Currencies**: USD, EUR, GBP, JPY, CNY, INR, and others
- **Crypto Assets**: BTC, ETH, USDT, USDC, BNB, ADA, SOL, XRP, DOGE, MATIC (with live pricing)

### 2. **Auto-Detection**
- **Geolocation-Based**: Automatic detection using free IP geolocation API (ipapi.co)
- **User Override**: Users can disable auto-detection and manually select their currency
- **Location Persistence**: System remembers user's preferred currency and location preferences

### 3. **Exchange Rates**
- **Daily Updates**: Exchange rates update automatically every 24 hours at 00:00 UTC
- **Fiat Pairs**: Real-time conversion between major fiat currency pairs
- **Crypto Pricing**: Live crypto prices via CRYPTOAPI (Bitcoin, Ethereum, and major altcoins)
- **Caching**: In-memory cache for high-performance conversion operations

### 4. **Platform Integration**
All currency displays updated across platform:
- ✅ Wallet balances (Airtime, Data, Utilities, Gift Cards)
- ✅ Transaction history (shows in current preference)
- ✅ Pricing displays (instant recalculation on currency switch)
- ✅ Earning amounts and rewards
- ✅ All fee displays

## Architecture

### Frontend Components

#### 1. **CurrencyContext** (`src/contexts/CurrencyContext.tsx`)
Global React Context for currency management:
```typescript
useCurrency() → {
  selectedCurrency,        // Current selected currency object
  isLoading,              // Loading state during initialization
  error,                  // Any errors during currency operations
  exchangeRates,          // Map of exchange rates (cached)
  autoDetectEnabled,      // Whether auto-detection is enabled
  detectedCountry,        // Detected user location
  detectedCurrency,       // Currency auto-detected for user
  setCurrency(),          // Function to change currency
  toggleAutoDetect(),     // Toggle auto-detection
  convertAmount(),        // Convert amount between currencies
  formatCurrency(),       // Format amount with proper currency display
  getExchangeRate(),      // Get specific exchange rate
  refreshExchangeRates()  // Manual refresh (admin)
}
```

#### 2. **CurrencySettings Page** (`src/pages/settings/CurrencySettings.tsx`)
User-facing settings page with:
- Current currency display with flag and symbol
- Auto-detection toggle and location display
- Searchable currency selector with tabs (Popular, African, All)
- Real-time currency switching with balance updates
- User preferences persistence

#### 3. **Utility Functions** (`src/utils/currencyUtils.ts`)
Helper functions for currency operations:
- `formatCurrencyAmount()` - Format with currency symbol
- `convertAmount()` - Convert between currencies
- `formatCurrencyRange()` - Display price ranges
- `isCryptoCurrency()` - Check if currency is crypto
- `roundToCurrencyPrecision()` - Proper decimal handling
- `formatCompactCurrency()` - Compact display (K, M, B)

### Backend Services

#### 1. **Currency Service** (`server/services/currencyService.ts`)
Core service handling all currency operations:
- Exchange rate management and caching
- Scheduled daily rate updates at 00:00 UTC
- Fiat currency pair conversion (USD base)
- Crypto price fetching via CRYPTOAPI
- Rate reversal (USD→EUR and EUR→USD automatically)
- Same-currency rates (always 1.0)

Key methods:
```typescript
initializeCurrencyService()      // Start service with daily scheduler
refreshExchangeRates()           // Update all rates
getExchangeRates()               // Return all cached rates
getExchangeRate(from, to)        // Get specific rate
convertAmount(amount, from, to)  // Perform conversion
getLastUpdateTime()              // Check when rates were updated
isCacheValid()                   // Verify cache freshness
```

#### 2. **Currency API Routes** (`server/routes/currency.ts`)
RESTful endpoints for frontend:
```
GET  /api/currency/rates              → Get all cached rates
GET  /api/currency/rate/:from/:to     → Get specific rate
POST /api/currency/convert            → Convert amount
POST /api/currency/refresh            → Force refresh (admin)
GET  /api/currency/status             → Service health check
```

#### 3. **Database Schema**
New columns added to `profiles` table:
```sql
preferred_currency     VARCHAR(10)   -- User selected currency code
auto_detect_currency   BOOLEAN       -- Auto-detection toggle
currency_updated_at    TIMESTAMP     -- Last update timestamp
```

## Integration with Existing Features

### Wallet Pages Updated
- **Airtime** (`src/pages/wallet/Airtime.tsx`)
- **Data** (`src/pages/wallet/Data.tsx`)
- **Electricity** (`src/pages/wallet/Electricity.tsx`)
- **GiftCards** (`src/pages/wallet/GiftCards.tsx`)
- **BuyGiftCards** (`src/pages/wallet/BuyGiftCards.tsx`)

All now display amounts in selected currency with instant recalculation.

### Provider Integration
The system uses:
- **Geolocation**: ipapi.co (free, no API key required)
- **Crypto Prices**: CRYPTOAPIS (existing `CRYPTOAPIS_API_KEY` environment variable)
- **Exchange Rates**: Static configuration with daily updates from crypto APIs

## Usage Examples

### For Users
1. **Automatic Setup**: On first visit, system automatically detects user's location and sets currency
2. **Manual Selection**: Go to `/app/settings/currency` to manually select preferred currency
3. **Search**: Search by currency code (USD), country (Nigeria), or name (Dollar)
4. **Instant Updates**: When currency is changed, all prices update instantly across the platform

### For Developers
```tsx
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrencyAmount } from "@/utils/currencyUtils";

function MyComponent() {
  const { selectedCurrency, formatCurrency, convertAmount } = useCurrency();
  
  // Format amount in user's selected currency
  const displayAmount = formatCurrency(1000);
  
  // Convert between currencies
  const converted = convertAmount(1000, 'USD', 'NGN');
  
  // Display formatted
  return <div>{formatCurrencyAmount(converted, 'NGN')}</div>;
}
```

## Exchange Rate Timing

### Daily Refresh Schedule
- **Time**: 00:00 UTC (midnight UTC)
- **Frequency**: Every 24 hours
- **Process**: Automatic, no manual intervention required
- **Fallback**: Rates cached in memory if API unavailable

### Rate Update Sources
1. **Fiat Pairs**: USD as base currency with static rates to major currencies
2. **Crypto Pairs**: Live rates from CRYPTOAPIS API
3. **Cross Rates**: Derived from USD base rate (USD→EUR rate × USD→NGN rate = EUR→NGN)

## Configuration

### Environment Variables
```
CRYPTOAPIS_API_KEY=<your-key>  # Required for crypto pricing
```

### Supported African Countries
```
Nigeria (NGN), Kenya (KES), Ghana (GHS), South Africa (ZAR)
Egypt (EGP), Uganda (UGX), Tanzania (TZS), Senegal (XOF)
Ivory Coast (XOF), Morocco (MAD), Cameroon (XAF), Ethiopia (ETB)
```

## Database Migration

Migration file: `migrations/add_currency_settings_to_profiles.sql`

Run this migration to add currency fields to the profiles table:
```sql
-- Adds preferred_currency, auto_detect_currency, and currency_updated_at columns
-- Creates index for fast lookups
-- Sets up automatic timestamp update trigger
```

## Performance Considerations

1. **Caching**: Exchange rates cached in memory for O(1) lookup
2. **Lazy Loading**: Rates loaded once on server startup
3. **Scheduled Updates**: Background job runs at midnight UTC, not during user requests
4. **No N+1 Queries**: All rates loaded in single batch, not per-request

## Security & Privacy

1. **Geolocation**: Uses IP-based detection (no GPS/location permissions required)
2. **Data**: User currency preference stored in secure database
3. **API Keys**: CRYPTOAPIS key stored in environment variables
4. **Rate Limiting**: Standard API rate limiting applies to currency endpoints

## Testing

### Manual Testing Checklist
- [ ] Currency settings page loads and displays current currency
- [ ] Auto-detection works on first visit
- [ ] Can toggle auto-detection on/off
- [ ] Can search and select different currencies
- [ ] Wallet pages show amounts in selected currency
- [ ] Switching currency updates all displays instantly
- [ ] Commission displays don't show but are applied in total
- [ ] Crypto prices update with live rates
- [ ] African currencies work correctly
- [ ] Exchange rates update at 00:00 UTC

### API Testing
```bash
# Get all rates
curl http://localhost:3001/api/currency/rates

# Get specific rate
curl http://localhost:3001/api/currency/rate/USD/NGN

# Convert amount
curl -X POST http://localhost:3001/api/currency/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "from": "USD", "to": "NGN"}'

# Check status
curl http://localhost:3001/api/currency/status
```

## Future Enhancements

1. **Real-Time Rates**: Use live exchange rate APIs instead of daily updates
2. **User History**: Track currency conversion history
3. **Favorites**: Allow users to favorite currencies
4. **Rate Notifications**: Alert users when rates change significantly
5. **Offline Support**: Persist rates locally for offline viewing
6. **Multiple Wallets**: Support multi-currency wallet wallets

## Troubleshooting

### Rates Not Updating
- Check `CRYPTOAPIS_API_KEY` is set
- Verify geolocation API (ipapi.co) is accessible
- Check server logs for errors at 00:00 UTC

### Wrong Currency Detected
- Manual override available in settings
- Auto-detection can be disabled
- Check geolocation service accuracy

### Conversion Errors
- Ensure both currency codes exist in `SUPPORTED_CURRENCIES`
- Check exchange rate cache has been populated
- Verify API connectivity for crypto rates

## Support & Documentation

- **Route**: `/app/settings/currency`
- **Context**: `useCurrency()` hook
- **Utils**: `src/utils/currencyUtils.ts`
- **Backend**: `/api/currency/*` endpoints
- **Migration**: `migrations/add_currency_settings_to_profiles.sql`
