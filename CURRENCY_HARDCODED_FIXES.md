# Hard-Coded Currency Symbols - Comprehensive Fix List

## Overview
This document lists all components and files that contain hard-coded currency symbols (like `$`, hardcoded exchange rates, etc.) that need to be updated to use the centralized currency formatting via `CurrencyDisplay` component or `useCurrency` hook.

## Summary by Category

### 1. WALLET COMPONENTS (High Priority)
- [ ] `src/components/wallet/DepositModal.tsx` - Lines with "$1.00", "$500", "$5,000" limits
- [ ] `src/components/wallet/WithdrawModal.tsx` - Lines with "Minimum: $0.01", "Maximum: ${amount}"
- [ ] `src/pages/wallet/Deposit.tsx` - "$500 daily limit", "$5,000 daily limit"
- [ ] `src/pages/wallet/Airtime.tsx` - Already imports `useCurrency`
- [ ] `src/pages/wallet/Data.tsx` - Already imports `useCurrency`
- [ ] `src/pages/wallet/Electricity.tsx` - Already imports `useCurrency`
- [ ] `src/pages/wallet/GiftCards.tsx` - Already imports `useCurrency`
- [ ] `src/pages/wallet/BuyGiftCards.tsx` - Already imports `useCurrency`

### 2. FREELANCE COMPONENTS (High Priority)
- [ ] `src/components/freelance/CreateJobModal.tsx` - `$${formData.budgetAmount.toLocaleString()}`
- [ ] `src/components/freelance/AdvancedFreelanceFilters.tsx` - "UI/UX Design $50-100/hr"
- [ ] `src/components/freelance/FreelanceGamification.tsx` - "$500 Bonus", "$100,000"
- [ ] `src/components/freelance/EnhancedBadgeSystem.tsx` - "$100,000"
- [ ] `src/components/freelance/FreelanceFAB.tsx` - "$1,240"
- [ ] `src/components/freelance/FreelanceBusinessIntelligence.tsx` - "$1,000", "$50,000"
- [ ] `src/components/freelance/RealTimeNotifications.tsx` - "$1,500 milestone payment"
- [ ] `src/components/freelance/SmartFreelanceNotifications.tsx` - "$25,000", "$2,500"
- [ ] `src/components/freelance/DashboardWidgets.tsx` - "$5,240"

### 3. CRYPTO COMPONENTS (High Priority)
- [ ] `src/pages/EnhancedCrypto.tsx` - Multiple `formatCurrency` calls, hard-coded "$0.00"
- [ ] `src/components/crypto/CryptoDetailModal.tsx` - Hard-coded `"$0.00"` format
- [ ] `src/components/crypto/DeFiDashboard.tsx` - Hard-coded `"$0.00"` format
- [ ] `src/components/crypto/EnhancedTradingDashboard.tsx` - "$1.75T", "$85B"
- [ ] `src/components/crypto/CryptoTradePanel.tsx` - "Available USD: $10,000.00"
- [ ] `src/components/crypto/EloityPointExchange.tsx` - Comments with hardcoded rates (// 1 BTC = $52,800)
- [ ] `src/components/crypto/RealTimeTradingBoard.tsx` - Already imports `formatCurrency`
- [ ] `src/components/crypto/CryptoP2PChatIntegration.tsx` - `.toLocaleString()` with currency

### 4. MARKETPLACE COMPONENTS (Medium Priority)
- [ ] `src/components/marketplace/EnhancedShoppingCart.tsx` - "$12.99", "$24.99"
- [ ] `src/components/marketplace/FunctionalShoppingCart.tsx` - "Free shipping on orders over $50"
- [ ] `src/components/marketplace/MobileProductCard.tsx` - "Free shipping over $50"
- [ ] `src/components/marketplace/EnhancedSearch.tsx` - Filter handling with "$"
- [ ] `src/components/marketplace/ProductQuickView.tsx` - Already imports currency utilities

### 5. PAGE COMPONENTS (Medium Priority)
- [ ] `src/pages/Saved.tsx` - `{item.price.toLocaleString()}` with currency
- [ ] `src/pages/SimpleBlog.tsx` - Multiple `formatCurrency` calls, stats with numbers
- [ ] `src/pages/EnhancedPlatform.tsx` - "$2.1B", "$450M" platform statistics
- [ ] `src/pages/TermsOfService.tsx` - "$500 maximum" liability amount
- [ ] `src/pages/DispatchPartnerTerms.tsx` - "$5", "$500", "$15", "$25" amounts
- [ ] `src/pages/CryptoLearn.tsx` - `.toLocaleString()` for course stats

### 6. DELIVERY COMPONENTS (Medium Priority)
- [ ] `src/components/delivery/DeliveryProviderDashboard.tsx` - Already has `formatCurrency` function
- [ ] `src/components/delivery/DeliveryTracking.tsx` - Already has `formatCurrency` function
- [ ] `src/components/delivery/DeliveryProviderSelection.tsx` - Already has `formatCurrency` function

### 7. SERVICE FILES (Medium Priority)
- [ ] `src/services/walletService.ts` - Hard-coded "$" for USDT, ELO formatting
- [ ] `src/services/analyticsService.ts` - `formatCurrency()` local function with hardcoded "en-US"
- [ ] `src/services/performanceMetricsService.ts` - `formatCurrency()` local function
- [ ] `src/services/enhancedContentService.ts` - `formatCurrency()` local function
- [ ] `src/services/i18nService.ts` - `formatCurrency()` method
- [ ] `src/services/eloitsService.ts` - Hard-coded "$5", "$25", "$100", "$10", "$50" values
- [ ] `src/services/enhancedEloitsService.ts` - Comments with "$1.00", "$100", hardcoded rates
- [ ] `src/services/africanPaymentService.ts` - Comments with "$10", "$25", "$5", "$15"
- [ ] `src/services/cryptoService.ts` - Comments with "$50 spread"
- [ ] `src/services/videoService.ts` - Comments with "$0.01", "$5.00", "$2.50"
- [ ] `src/services/advancedAIService.ts` - "$43,500", "$110" price points

### 8. OTHER COMPONENTS (Low Priority)
- [ ] `src/components/ai/AIPersonalAssistant.tsx` - `${insight.priceTarget.toLocaleString()}`
- [ ] `src/components/ai/AIFeatures.tsx` - `${pred.priceTarget.toLocaleString()}`
- [ ] `src/components/ai/AIAssistantFAB.tsx` - Dashboard stats
- [ ] `src/components/tiers/CreatorTierSystem.tsx` - Badge display
- [ ] `src/components/admin/EnhancedRewardSystemAdmin.tsx` - "1000 ELO = $1.00"
- [ ] `src/components/voting/BattleVoting.tsx` - `{votingPool.totalPool.toLocaleString()} SP`
- [ ] `src/components/gamification/GamificationSystem.tsx` - Points display
- [ ] `src/components/ui/chart.tsx` - `{item.value.toLocaleString()}`
- [ ] `src/components/i18n/LanguageCurrencySelector.tsx` - Limit display
- [ ] `src/chat/utils/chatHelpers.ts` - `Budget: $${jobBudget.toLocaleString()}`
- [ ] `src/pages/rewards/WithdrawRewards.tsx` - Already imports formatCurrency
- [ ] `src/test-freelance-stats-display.tsx` - Test component

### 9. SERVER-SIDE FILES (Low Priority - Documentation/Comments)
- [ ] `server/routes/referral.ts` - Comment: "Default $35 reward"
- [ ] `server/routes/wallet-transactions.ts` - `.toLocaleString()` for dates
- [ ] `server/services/walletNotificationService.ts` - `.toLocaleString()` for dates
- [ ] `server/services/cryptoService.ts` - Comments with pricing info

## Fix Strategies

### Strategy 1: Use CurrencyDisplay Component
For JSX elements displaying amounts:
```tsx
import { CurrencyDisplay, Balance, InlinePrice } from '@/components/ui/currency-display';

// Before
<span>${amount.toFixed(2)}</span>

// After
<CurrencyDisplay amount={amount} showSymbol={true} />
```

### Strategy 2: Use useCurrency Hook
For formatting within logic/services:
```tsx
import { useCurrency } from '@/contexts/CurrencyContext';

const { formatCurrency } = useCurrency();
const formatted = formatCurrency(amount, 'USD');
```

### Strategy 3: Use Utility Functions
For service files without React hooks:
```tsx
import { formatCurrencyAmount } from '@/utils/currencyUtils';

const formatted = formatCurrencyAmount(amount, 'USD');
```

### Strategy 4: Keep Comments but Remove Hard Values
For configuration/comment-only references:
```tsx
// Before
// 1000 ELO = $1.00

// After
// Based on current conversion rate (see CurrencyContext for dynamic values)
```

## Priority Order
1. **High Priority** - Wallet and Freelance components (user-facing critical)
2. **Medium Priority** - Crypto, Marketplace, Delivery, Pages
3. **Low Priority** - Admin, AI, Utilities, Services, Comments
4. **Deferred** - Server-side comments (non-blocking)

## Notes
- All wallet limits should use `useCurrency()` hook for amount formatting
- Services should use utility functions or be refactored to use hooks
- Comments containing hard-coded values should be updated to reference the CurrencyContext
- Locale-aware formatting should always use the user's selected currency from context
