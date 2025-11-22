# Wallet Features Reorganization

## Overview
The wallet quick action buttons have been reorganized to match industry-standard fintech platforms (like Paystack, Flutterwave, Wise, etc.) for better user clarity and less confusion.

## Updated Features Structure

### 1. **Send Money** → P2P Transfers (Peer-to-Peer)
**Path:** `/app/wallet/send-money`
- **Purpose:** Transfer money to other Eloity platform users
- **Features:**
  - Search recipients by name/username
  - Recent recipients quick access
  - Add custom transfer notes
  - Instant transfers (fee-free)
- **Flow:** Recipient → Amount → Review → Success
- **Use Case:** Sending money to friends on Eloity

### 2. **Deposit** → Add Funds (Multiple Payment Methods)
**Path:** `/app/wallet/deposit`
- **Purpose:** Add funds to your wallet from external sources
- **Features:**
  - **Payment Methods:**
    - Credit/Debit Cards (Visa, Mastercard)
    - Bank Transfers (Direct bank account)
    - Cryptocurrency (Bitcoin, Ethereum, etc.)
    - Mobile Money (MTN, Airtel, Globacom)
    - E-Wallets (PayPal, Skrill, etc.)
  - Country selection for region-specific methods
  - Multiple destination wallets (E-commerce, Crypto, Rewards, Freelance)
  - Automatic fee calculation
- **Flow:** Country → Method → Destination → Amount → Review → Success
- **Use Case:** Funding your Eloity wallet from external payment sources

### 3. **Withdraw** → Cash Out (Personal Accounts)
**Path:** `/app/wallet/withdraw`
- **Purpose:** Withdraw funds to your personal accounts or services
- **Features:**
  - **Withdrawal Methods:**
    - Bank Account transfers (all supported banks)
    - Mobile Money Wallets (MTN, Airtel, Globacom, 9Mobile)
    - Email Wallet transfers
    - Eloity User transfer (if you have another account)
  - Processing time varies by method
  - Automatic fee calculation based on method and amount
  - Multiple country support with localized payment methods
- **Flow:** Method → Recipient Details → Amount → Review → Success
- **Use Case:** Cashing out your Eloity wallet to personal bank accounts or mobile wallets

### 4. **Top Up** → Local Services (NEW REDESIGN)
**Path:** `/app/wallet/top-up`
- **Purpose:** Purchase local utility services and subscriptions
- **Features:**
  - **Service Categories:**
    1. **Airtime** - Mobile credit (MTN, Airtel, Globacom, 9Mobile)
    2. **Data Bundles** - Internet packages (1GB, 2GB, 5GB, 10GB)
    3. **Bills** - Utilities (Electricity, Water, Internet, Cable TV)
    4. **Other Services** - School fees, Transport vouchers, Insurance, Betting
  - Provider selection per service type
  - Multiple plan options per provider
  - Instant activation/delivery
  - Phone number or reference number input
- **Flow:** Category → Provider → Phone Number → Plan → Review → Success
- **Use Case:** Buying airtime, data bundles, and paying utility bills

## Dashboard Layout Changes

### Upper Section (Floating Action Buttons)
1. **+ Deposit** - Add funds to wallet
2. **→ Send** - Send money to other users
3. **↑ Withdraw** - Cash out to personal accounts
4. **⋯ More** - Additional options (Top Up, Analytics, Transactions, Cards, Gifts)

### Middle Sections
1. **Send & Receive**
   - Send Money (to Eloity users)
   - Deposit (add funds)

2. **Cash Out** (New section name)
   - Withdraw (to personal accounts, bank, mobile money, etc.)

3. **Local Services** (New section)
   - Top Up Services (data, airtime, bills, utilities)

4. **Gifts & Rewards**
   - Send Gifts
   - Buy Gift Cards
   - Sell Gift Cards

## Why This Change?

### Clarity
- **Send Money** = P2P (to other people on platform)
- **Deposit** = Funding (to your Eloity wallet)
- **Withdraw** = Cashing out (to your personal accounts)
- **Top Up** = Services (bills, airtime, data)

### Industry Standard
This structure follows best practices from global fintech leaders:
- Paystack, Flutterwave, Wise, Square, PayPal
- Clear separation between different transaction types
- Reduces user confusion about where funds go

### Better UX
- Users now understand each button's purpose instantly
- Logical flow matches user mental models
- Local services grouped separately from money transfers
- Descriptions added under each button for extra clarity

## Migration Guide

| Old Label | New Purpose | Path |
|-----------|-------------|------|
| Send Money | P2P transfers to users | `/app/wallet/send-money` |
| Withdraw | Had P2P features | Converted to personal accounts |
| Deposit | Added funds | `/app/wallet/deposit` |
| Top Up | Generic payment methods | Converted to local services |

## Features Matrix

| Feature | SendMoney | Deposit | Withdraw | TopUp |
|---------|-----------|---------|----------|-------|
| P2P transfers | ✅ | ❌ | ❌ | ❌ |
| Add funds | ❌ | ✅ | ❌ | ❌ |
| Cash out | ❌ | ❌ | ✅ | ❌ |
| Airtime/Data | ❌ | ❌ | ❌ | ✅ |
| Pay bills | ❌ | ��� | ❌ | ✅ |
| Multiple methods | ❌ | ✅ | ✅ | ✅ |
| Fee-free | ✅ | ❌ | ❌ | ❌ |
| Instant | ✅ | ❌ | ❌ | ✅ |

## Notes
- All flows maintain consistent UI/UX patterns
- Color coding: Blue (receive), Green (add), Purple (withdraw), Orange (services)
- Each feature includes proper error handling and validation
- Processing times vary by method (clearly displayed to users)
