# 🌍 Unified Currency System

A comprehensive, centralized currency conversion and management system for the entire Eloity platform.

## 🎯 Overview

This system provides:
- **Centralized Exchange Rates**: Single source of truth for all currency conversions
- **Real-time Conversion**: Instant currency conversion with caching
- **Multi-currency Support**: Fiat currencies, cryptocurrencies, and stablecoins
- **React Integration**: Context, hooks, and components for easy usage
- **Extensible Design**: Easy to upgrade from static to real-time API rates

## 📁 File Structure

```
src/
├── config/
│   └── currencies.ts              # Currency definitions and static rates
├── services/
│   └── currencyService.ts         # Core conversion logic and API
├── contexts/
│   └── CurrencyContext.tsx        # React context for currency state
├── hooks/
│   └── useCurrencyConverter.ts    # Custom hooks for conversions
├── components/
│   ├── ui/
│   │   ├── currency-selector.tsx  # Currency selection component
│   │   └── currency-display.tsx   # Currency display components
│   └── currency/
│       └── CurrencyDemo.tsx       # Demo and examples
```

## 🚀 Quick Start

### 1. Basic Setup (Already Done)

The `CurrencyProvider` is already integrated into the app in `App.tsx`:

```tsx
<CurrencyProvider>
  <AuthProvider>
    {/* Rest of your app */}
  </AuthProvider>
</CurrencyProvider>
```

### 2. Using the Currency Context

```tsx
import { useCurrency } from '@/contexts/CurrencyContext';

function MyComponent() {
  const { userCurrency, formatPrice, convertToUserCurrency } = useCurrency();
  
  return (
    <div>
      <p>Your currency: {userCurrency.code}</p>
      <p>Price: {formatPrice(99.99, 'USD')}</p>
    </div>
  );
}
```

### 3. Currency Display Components

```tsx
import { Price, Balance, InlinePrice, ConvertedPrice } from '@/components/ui/currency-display';

// Simple price display
<Price amount={99.99} currency="USD" size="lg" />

// Balance with trend
<Balance 
  amount={1234.56} 
  showTrend={true} 
  trend="up" 
  trendValue={5.2} 
/>

// Inline price in text
<p>This product costs <InlinePrice amount={99.99} /> with free shipping.</p>

// Converted price with tooltip
<ConvertedPrice 
  amount={99.99} 
  fromCurrency="USD" 
  showConversion={true} 
/>
```

### 4. Currency Converter Hook

```tsx
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';

function CurrencyConverter() {
  const converter = useCurrencyConverter('USD', 'EUR');
  
  return (
    <div>
      <input 
        type="number"
        value={converter.fromAmount}
        onChange={(e) => converter.setFromAmount(parseFloat(e.target.value))}
      />
      <p>Converts to: {converter.formattedToAmount}</p>
      <p>Rate: {converter.rate}</p>
    </div>
  );
}
```

### 5. Currency Selector

```tsx
import CurrencySelector from '@/components/ui/currency-selector';

function Settings() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  
  return (
    <CurrencySelector
      value={selectedCurrency}
      onValueChange={setSelectedCurrency}
      variant="full"
      showFlag={true}
      showCategory={true}
    />
  );
}
```

## 💰 Supported Currencies

### Fiat Currencies
- **Major**: USD, EUR, GBP, JPY
- **African**: NGN, ZAR, KES, GHS, EGP, MAD, TND, BWP

### Cryptocurrencies
- **Major**: BTC, ETH, BNB, ADA, SOL
- **Stablecoins**: USDT, USDC
- **Platform**: ELOIT (Eloity Token)

## 🔧 Configuration

### Adding New Currencies

Edit `src/config/currencies.ts`:

```tsx
export const SUPPORTED_CURRENCIES: Currency[] = [
  // Add new currency
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    country: 'Canada',
    flag: '🇨🇦',
    decimals: 2,
    category: 'fiat'
  },
  // ... existing currencies
];

export const STATIC_EXCHANGE_RATES: ExchangeRate[] = [
  // Add exchange rate
  { from: 'USD', to: 'CAD', rate: 1.35, lastUpdated: new Date(), source: 'static' },
  // ... existing rates
];
```

### Updating Exchange Rates

Currently using static rates. To enable real-time rates:

```tsx
import { currencyService } from '@/services/currencyService';

// Enable real-time rates (when API is available)
currencyService.enableRealTimeRates('your-api-key');

// Manual refresh
await currencyService.updateExchangeRates();
```

## 🎨 Component API Reference

### Currency Display Components

#### `<Price>`
```tsx
interface PriceProps {
  amount: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
  showSymbol?: boolean;
  showCode?: boolean;
  className?: string;
}
```

#### `<Balance>`
```tsx
interface BalanceProps extends PriceProps {
  showTrend?: boolean;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  animate?: boolean;
}
```

#### `<CurrencySelector>`
```tsx
interface CurrencySelectorProps {
  value?: string;
  onValueChange?: (currencyCode: string) => void;
  variant?: 'default' | 'compact' | 'full';
  showFlag?: boolean;
  showCategory?: boolean;
  categories?: Currency['category'][];
}
```

### Hooks

#### `useCurrency()`
Returns the main currency context with user preferences and formatting functions.

#### `useCurrencyConverter()`
Returns a full currency converter with state management.

#### `usePriceConverter(price, fromCurrency, toCurrency?)`
Simple hook for converting a single price.

## 🌟 Real-World Usage Examples

### E-commerce Product Pricing

```tsx
function ProductCard({ product }) {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <Price amount={product.price} currency="USD" size="lg" />
      {product.salePrice && (
        <Price 
          amount={product.originalPrice} 
          currency="USD" 
          className="line-through text-gray-500" 
        />
      )}
    </div>
  );
}
```

### Freelance Payment Display

```tsx
function PaymentSummary({ payment }) {
  return (
    <div className="payment-summary">
      <h3>Payment Received</h3>
      <ConvertedPrice 
        amount={payment.amount}
        fromCurrency={payment.currency}
        showConversion={true}
      />
      <p className="text-sm text-gray-500">
        Received {format(payment.date, 'PPP')}
      </p>
    </div>
  );
}
```

### Wallet Balance

```tsx
function WalletCard({ balance, currency }) {
  const trend = balance.change24h > 0 ? 'up' : 'down';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <Balance 
          amount={balance.amount}
          currency={currency}
          showTrend={true}
          trend={trend}
          trendValue={Math.abs(balance.change24h)}
          animate={true}
        />
      </CardContent>
    </Card>
  );
}
```

### Currency Settings

```tsx
function CurrencySettings() {
  const { userCurrency, setUserCurrency } = useCurrency();
  
  return (
    <div className="settings-section">
      <h3>Currency Preferences</h3>
      <CurrencySelector
        value={userCurrency.code}
        onValueChange={setUserCurrency}
        variant="full"
        showFlag={true}
        showCategory={true}
      />
    </div>
  );
}
```

## 🔮 Future Enhancements

### Real-time API Integration
- Connect to services like CurrencyAPI, ExchangeRate-API
- WebSocket connections for live crypto rates
- Automatic rate refresh intervals

### Advanced Features
- Historical rate charts
- Rate alerts and notifications
- Currency hedging tools
- Multi-currency portfolio tracking

### Regional Optimization
- Automatic currency detection by location
- Regional payment method integration
- Local tax calculations

## 🧪 Testing

Access the live demo at: `/app/currency-demo`

This demo shows:
- Live currency conversion
- All display components
- User preference management
- Real-world usage examples

## 🤝 Contributing

When adding new currency features:

1. **Add currencies** to `currencies.ts`
2. **Update rates** in the static rates array
3. **Test conversion** accuracy
4. **Update documentation** with examples
5. **Consider edge cases** (zero amounts, invalid currencies)

## 📊 Performance

- **Caching**: Conversion results cached for 5 minutes
- **Debouncing**: User input debounced by 300ms
- **Lazy Loading**: Components load only when needed
- **Memoization**: Expensive calculations memoized

The system is designed to handle thousands of conversions per second with minimal performance impact.
