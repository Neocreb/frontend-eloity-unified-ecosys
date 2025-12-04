import { logger } from '../utils/logger.js';
import { db } from '../utils/db.js';

// =============================================================================
// CRYPTOCURRENCY PRICE SERVICE
// =============================================================================

import axios from 'axios';

export async function getCryptoPrices(symbols: string[], vsCurrency: string = 'usd') {
  try {
    const result: any = {};

    // First, try CoinGecko as primary source for cryptocurrency prices
    try {
      logger.info('Attempting to fetch data from CoinGecko as primary source');
      const cgIdMap: Record<string, string> = { 
        bitcoin: 'bitcoin', 
        ethereum: 'ethereum', 
        tether: 'tether', 
        binancecoin: 'binancecoin', 
        solana: 'solana', 
        cardano: 'cardano', 
        chainlink: 'chainlink', 
        polygon: 'matic-network', 
        avalanche: 'avalanche-2', 
        polkadot: 'polkadot', 
        dogecoin: 'dogecoin' 
      };

      // Build query for all symbols at once
      const ids = symbols.map(s => cgIdMap[s.toLowerCase()]).filter(id => id);
      if (ids.length > 0) {
        const cgUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=${vsCurrency}&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;
        logger.info(`Fetching CoinGecko data from ${cgUrl}`);
        const r = await axios.get(cgUrl, { timeout: 10000 });
        
        // Process CoinGecko response
        for (const symbol of symbols) {
          const lower = symbol.toLowerCase();
          const id = cgIdMap[lower];
          if (id && r.data[id]) {
            const payload = r.data[id];
            result[lower] = {
              usd: payload[vsCurrency] || null,
              usd_24h_change: payload[`${vsCurrency}_24h_change`] || 0,
              usd_market_cap: payload[`${vsCurrency}_market_cap`] || null,
              usd_24h_vol: payload[`${vsCurrency}_24h_vol`] || null
            };
            logger.info(`Successfully fetched CoinGecko data for ${id}: $${payload[vsCurrency]}`);
          } else {
            logger.warn(`No CoinGecko data found for ${lower}`);
          }
        }
      }
    } catch (cgErr) {
      logger.error('CoinGecko primary fetch failed:', cgErr?.message || cgErr);
    }

    // If we got data from CoinGecko, return it
    if (Object.keys(result).length > 0) {
      logger.info('Returning data from CoinGecko');
      return result;
    }

    // Fallback to CryptoAPIs if CoinGecko didn't work
    logger.info('Falling back to CryptoAPIs for missing prices');
    const cryptoapisBase = 'https://rest.cryptoapis.io';
    const cryptoapisKey = process.env.CRYPTOAPIS_API_KEY;

    if (!cryptoapisKey) {
      logger.warn('CRYPTOAPIS_API_KEY not configured, using CoinGecko only');
      return result;
    }

    const fetchPromises = symbols.map(async (symbol) => {
      const lower = symbol.toLowerCase();

      // Skip if we already have data for this symbol
      if (result[lower]) {
        return;
      }

      try {
        // Use CryptoAPIs exchange rates endpoint
        // Map symbols to asset IDs used by CryptoAPIs
        const assetMap: Record<string, string> = {
          bitcoin: 'BTC',
          ethereum: 'ETH',
          tether: 'USDT',
          binancecoin: 'BNB',
          solana: 'SOL',
          cardano: 'ADA',
          chainlink: 'LINK',
          polygon: 'MATIC',
          avalanche: 'AVAX',
          polkadot: 'DOT',
          dogecoin: 'DOGE'
        };

        const assetId = assetMap[lower] || lower.toUpperCase();
        const url = `${cryptoapisBase}/market-data/exchange-rates/realtime/${assetId}/USD`;

        logger.info(`Fetching CryptoAPIs data for ${lower} from ${url}`);
        const resp = await axios.get(url, {
          timeout: 10000,
          validateStatus: () => true, // Handle all status codes
          headers: {
            'X-API-Key': cryptoapisKey,
            'Content-Type': 'application/json'
          }
        });

        // Check if response is successful
        if (resp.status !== 200) {
          logger.error(`CryptoAPIs returned status ${resp.status} for ${lower}: ${JSON.stringify(resp.data).substring(0, 200)}`);
          throw new Error(`CryptoAPIs HTTP ${resp.status}`);
        }

        if (resp.data && resp.data.data) {
          const rate = parseFloat(resp.data.data.rate || '0');
          if (rate > 0) {
            result[lower] = {
              usd: rate,
              usd_24h_change: 0, // CryptoAPIs exchange rates don't include 24h change
              usd_market_cap: null,
              usd_24h_vol: null
            };
            logger.info(`Successfully fetched CryptoAPIs data for ${lower}: $${rate}`);
            return;
          }
        }
      } catch (err) {
        logger.error('CryptoAPIs price fetch failed for', symbol, err?.message || err);
      }

      // Final fallback: use last known value or zero
      if (!result[lower]) {
        logger.warn(`Using default data for ${lower}`);
        result[lower] = { usd: 0, usd_24h_change: 0, usd_market_cap: 0, usd_24h_vol: 0 };
      }
    });

    await Promise.all(fetchPromises);
    logger.info('Final crypto prices result:', result);
    return result;
  } catch (error) {
    logger.error('Price fetch error:', error);
    throw error;
  }
}

export async function getOrderBook(pair: string, depth: number = 20) {
  try {
    // Extract base and quote assets from pair (e.g., "BTCUSDT" -> "BTC", "USDT")
    const pairUpper = pair.toUpperCase();

    // Try to get current price from CryptoAPIs
    try {
      const cryptoapisBase = 'https://rest.cryptoapis.io/v2';
      const cryptoapisKey = process.env.CRYPTOAPIS_API_KEY;

      if (cryptoapisKey && pairUpper.includes('USDT')) {
        const baseAsset = pairUpper.replace('USDT', '');
        const url = `${cryptoapisBase}/market-data/exchange-rates/realtime/${baseAsset}/USD`;

        logger.info(`Fetching current price for ${baseAsset} from CryptoAPIs`);
        const resp = await axios.get(url, {
          timeout: 10000,
          headers: {
            'X-API-Key': cryptoapisKey,
            'Content-Type': 'application/json'
          }
        });

        if (resp.data.data && resp.data.data.rate) {
          const basePrice = parseFloat(resp.data.data.rate);
          logger.info(`Using CryptoAPIs price for ${baseAsset}: $${basePrice}`);

          // Generate realistic orderbook from the base price
          const generateOrderbook = (currentPrice: number, levels: number) => {
            const asks = [];
            const bids = [];

            // Generate asks (selling orders) - prices above current
            for (let i = 1; i <= levels; i++) {
              const askPrice = currentPrice * (1 + (i * 0.001));
              asks.push({
                price: parseFloat(askPrice.toFixed(2)),
                quantity: parseFloat((Math.random() * 2 + 0.1).toFixed(8)),
                total: parseFloat((askPrice * (Math.random() * 2 + 0.1)).toFixed(2))
              });
            }

            // Generate bids (buying orders) - prices below current
            for (let i = 1; i <= levels; i++) {
              const bidPrice = currentPrice * (1 - (i * 0.001));
              bids.push({
                price: parseFloat(bidPrice.toFixed(2)),
                quantity: parseFloat((Math.random() * 2 + 0.1).toFixed(8)),
                total: parseFloat((bidPrice * (Math.random() * 2 + 0.1)).toFixed(2))
              });
            }

            return { asks, bids };
          };

          const orderbook = generateOrderbook(basePrice, depth);
          return {
            ...orderbook,
            timestamp: Date.now()
          };
        }
      }
    } catch (err) {
      logger.debug('CryptoAPIs orderbook fetch failed:', err?.message || err);
    }

    // Fallback to mock orderbook for development
    const basePrice = 45000; // Mock BTC price
    const spread = 50; // $50 spread
    
    // Define types for bids and asks
    interface OrderBookEntry {
      price: number;
      quantity: number;
      total: number;
    }
    
    const bids: OrderBookEntry[] = [];
    const asks: OrderBookEntry[] = [];
    
    for (let i = 0; i < depth; i++) {
      const bidPrice = basePrice - spread/2 - (i * 10);
      const askPrice = basePrice + spread/2 + (i * 10);
      const quantity = Math.random() * 2 + 0.1;
      
      bids.push({
        price: bidPrice,
        quantity: quantity,
        total: bidPrice * quantity
      });
      
      asks.push({
        price: askPrice,
        quantity: quantity,
        total: askPrice * quantity
      });
    }
    
    return {
      bids: bids.sort((a, b) => b.price - a.price),
      asks: asks.sort((a, b) => a.price - b.price),
      timestamp: Date.now()
    };
  } catch (error) {
    logger.error('Orderbook fetch error:', error);
    // Return empty orderbook as fallback
    return {
      bids: [],
      asks: [],
      timestamp: Date.now()
    };
  }
}

// =============================================================================
// WALLET MANAGEMENT SERVICE
// =============================================================================

interface WalletCreationData {
  userId: string;
  currencies: string[];
}

interface WalletResult {
  success: boolean;
  walletId?: string;
  addresses?: any;
  wallet?: any;
  error?: string;
}

export async function createWallet(userId: string, currencies: string[]): Promise<WalletResult> {
  try {
    const walletId = `wallet_${userId}_${Date.now()}`;
    const addresses = {};
    
    // Generate addresses for each currency
    for (const currency of currencies) {
      addresses[currency] = await generateCryptoAddress(currency);
    }
    
    // Save wallet to database
    const wallet = await saveWalletToDatabase({
      id: walletId,
      userId,
      addresses,
      currencies,
      createdAt: new Date(),
      isActive: true
    });
    
    logger.info('Crypto wallet created', { userId, walletId, currencies });
    
    return {
      success: true,
      walletId,
      addresses,
      wallet
    };
  } catch (error) {
    logger.error('Wallet creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

interface WalletBalanceResult {
  success: boolean;
  balances?: any;
  totalValueUSD?: number;
  addresses?: any;
  lastUpdated?: string;
  error?: string;
}

export async function getWalletBalance(userId: string): Promise<WalletBalanceResult> {
  try {
    // Get wallet from database
    const wallet = await getWalletFromDatabase(userId);
    
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    
    const balances = {};
    let totalValueUSD = 0;
    
    // Get balance for each currency
    for (const currency of wallet.currencies) {
      const balance = await getCurrencyBalance(wallet.addresses[currency], currency);
      balances[currency] = balance;
      
      // Convert to USD for total value calculation
      if (balance > 0) {
        const price = await getCurrencyPrice(currency, 'usd');
        totalValueUSD += balance * price;
      }
    }
    
    return {
      success: true,
      balances,
      totalValueUSD,
      addresses: wallet.addresses,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Wallet balance fetch error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

interface DepositResult {
  success: boolean;
  depositId?: string;
  status?: string;
  confirmationsRequired?: number;
  currentConfirmations?: number;
  error?: string;
}

export async function processDeposit(userId: string, currency: string, amount: number, txHash: string): Promise<DepositResult> {
  try {
    // Verify transaction on blockchain
    const txVerification = await verifyBlockchainTransaction(currency, txHash);
    
    if (!txVerification.valid) {
      throw new Error('Invalid transaction hash');
    }
    
    const depositId = `deposit_${Date.now()}_${userId}`;
    
    // Save deposit record
    const deposit = await saveDepositToDatabase({
      id: depositId,
      userId,
      currency: currency.toUpperCase(),
      amount: parseFloat(amount.toString()),
      txHash,
      status: 'pending',
      confirmationsRequired: getRequiredConfirmations(currency),
      currentConfirmations: txVerification.confirmations,
      createdAt: new Date()
    });
    
    
    
    // Credit wallet if transaction has enough confirmations
    if (txVerification.confirmations >= getRequiredConfirmations(currency)) {
      await creditWalletBalance(userId, currency, amount);
      await updateDepositStatus(depositId, 'completed');
    }
    
    logger.info('Deposit processed', { 
      userId, 
      depositId, 
      currency, 
      amount, 
      confirmations: txVerification.confirmations 
    });
    
    return {
      success: true,
      depositId,
      status: txVerification.confirmations >= getRequiredConfirmations(currency) ? 'completed' : 'pending',
      confirmationsRequired: getRequiredConfirmations(currency),
      currentConfirmations: txVerification.confirmations
    };
  } catch (error) {
    logger.error('Deposit processing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function processWithdrawal(userId: string, currency: string, amount: number, address: string, memo?: string) {
  try {
    // Verify user has sufficient balance
    const balance = await getWalletBalance(userId);
    const currentBalance = balance.balances ? balance.balances[currency.toUpperCase()] || 0 : 0;
    
    if (currentBalance < amount) {
      throw new Error('Insufficient balance');
    }
    
    // Calculate withdrawal fee
    const fee = await calculateWithdrawalFee(currency, amount);
    const netAmount = amount - fee;
    
    // Validate withdrawal address
    const addressValid = await validateCryptoAddress(address, currency);
    if (!addressValid) {
      throw new Error('Invalid withdrawal address');
    }
    
    const withdrawalId = `withdrawal_${Date.now()}_${userId}`;
    
    // Create withdrawal record
    const withdrawal = await saveWithdrawalToDatabase({
      id: withdrawalId,
      userId,
      currency: currency.toUpperCase(),
      amount,
      fee,
      netAmount,
      address,
      memo,
      status: 'pending',
      createdAt: new Date()
    });
    
    // Debit user's wallet
    await debitWalletBalance(userId, currency, amount);
    
    // Process withdrawal (removed process.env check)
    // In a real implementation, this would interact with actual blockchain
    
    // Update withdrawal status
    await updateWithdrawalStatus(withdrawalId, 'processing');
    
    logger.info('Withdrawal processed', { 
      userId, 
      withdrawalId, 
      currency, 
      amount, 
      fee, 
      address 
    });
    
    return {
      success: true,
      withdrawalId,
      status: 'processing',
      fee,
      netAmount,
      estimatedArrival: getEstimatedArrivalTime(currency)
    };
  } catch (error) {
    logger.error('Withdrawal processing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// =============================================================================
// P2P TRADING SERVICE
// =============================================================================

interface P2POrderData {
  userId: string;
  type: 'buy' | 'sell';
  cryptocurrency: string;
  fiatCurrency: string;
  amount: number;
  price: number;
  paymentMethods: string[];
  timeLimit: number;
  minOrderAmount: number;
  maxOrderAmount: number;
  autoReply: string;
  terms: string;
  status: string;
}

export async function createP2POrder(orderData: P2POrderData) {
  try {
    const orderId = `order_${Date.now()}_${orderData.userId}`;
    
    // For sell orders, lock the cryptocurrency in escrow
    if (orderData.type === 'sell') {
      await lockCryptocurrencyForOrder(orderData.userId, orderData.cryptocurrency, orderData.amount);
    }
    
    // Save order to database
    const order = await saveP2POrderToDatabase({
      id: orderId,
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedTrades: 0,
      reputation: await getUserTradingReputation(orderData.userId)
    });
    
    // Add order to matching engine
    await addOrderToMatchingEngine(order);
    
    logger.info('P2P order created', { 
      orderId, 
      userId: orderData.userId, 
      type: orderData.type, 
      amount: orderData.amount 
    });
    
    return {
      success: true,
      orderId,
      order
    };
  } catch (error) {
    logger.error('P2P order creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

interface MatchResult {
  success: boolean;
  tradeId: string;
  matchedAmount: number;
}

interface MatchingOrder {
  id: string;
  // Add other properties as needed
}

export async function matchP2POrders(newOrder: any) {
  try {
    // Find matching orders
    const matches: MatchingOrder[] = await findMatchingOrders(newOrder);
    
    const results: MatchResult[] = [];
    
    for (const matchingOrder of matches) {
      // Create trade between orders
      const trade = await createTradeBetweenOrders(newOrder, matchingOrder);
      
      if (trade.success) {
        results.push(trade);
        
        // Remove or update matched order quantities
        await updateOrderAfterMatch(matchingOrder.id, trade.matchedAmount);
      }
    }
    
    return {
      success: true,
      matches: results
    };
  } catch (error) {
    logger.error('Order matching error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// =============================================================================
// ESCROW SYSTEM
// =============================================================================

interface EscrowTransactionData {
  tradeId: string;
  buyerId: string;
  sellerId: string;
  cryptocurrency: string;
  amount: number;
  fiatAmount: number;
  fiatCurrency: string;
  timeLimit: number;
}

export async function createEscrowTransaction(data: EscrowTransactionData) {
  try {
    const escrowId = `escrow_${Date.now()}_${data.tradeId}`;
    
    // Lock cryptocurrency from seller's wallet
    await lockCryptocurrencyInEscrow(data.sellerId, data.cryptocurrency, data.amount);
    
    // Create escrow record
    const escrow = await saveEscrowToDatabase({
      id: escrowId,
      ...data,
      status: 'pending_payment',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + (data.timeLimit * 60 * 1000))
    });
    
    // Set automatic release timer
    setTimeout(async () => {
      await handleEscrowTimeout(escrowId);
    }, data.timeLimit * 60 * 1000);
    
    logger.info('Escrow transaction created', { 
      escrowId, 
      tradeId: data.tradeId, 
      amount: data.amount 
    });
    
    return {
      success: true,
      escrowId,
      escrow
    };
  } catch (error) {
    logger.error('Escrow creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function releaseEscrowFunds(escrowId: string, sellerId: string) {
  try {
    const escrow = await getEscrowFromDatabase(escrowId);
    
    if (!escrow) {
      throw new Error('Escrow transaction not found');
    }
    
    if (escrow.sellerId !== sellerId) {
      throw new Error('Only seller can release funds');
    }
    
    if (escrow.status !== 'payment_confirmed') {
      throw new Error('Payment not confirmed');
    }
    
    // Transfer cryptocurrency to buyer
    const txHash = await transferCryptocurrency(
      escrow.cryptocurrency,
      escrow.amount,
      escrow.buyerId
    );
    
    // Update escrow status
    await updateEscrowStatus(escrowId, 'completed', {
      completedAt: new Date(),
      transactionHash: txHash
    });
    
    // Update trading statistics
    await updateTradingStatistics(escrow.sellerId, escrow.buyerId, escrow);
    
    logger.info('Escrow funds released', { 
      escrowId, 
      sellerId, 
      buyerId: escrow.buyerId, 
      txHash 
    });
    
    return {
      success: true,
      transactionHash: txHash,
      completedAt: new Date()
    };
  } catch (error) {
    logger.error('Escrow release error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function disputeEscrowTransaction(disputeData: any) {
  try {
    const disputeId = `dispute_${Date.now()}_${disputeData.escrowId}`;
    
    // Create dispute record
    const dispute = await saveDisputeToDatabase({
      id: disputeId,
      ...disputeData,
      status: 'pending',
      createdAt: new Date()
    });
    
    // Update escrow status
    await updateEscrowStatus(disputeData.escrowId, 'disputed');
    
    // Notify admin team
    await notifyAdminTeam('escrow_dispute', {
      disputeId,
      escrowId: disputeData.escrowId,
      priority: disputeData.priority
    });
    
    logger.info('Escrow dispute created', { 
      disputeId, 
      escrowId: disputeData.escrowId, 
      raisedBy: disputeData.raisedBy 
    });
    
    return {
      success: true,
      disputeId,
      dispute
    };
  } catch (error) {
    logger.error('Escrow dispute error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// =============================================================================
// KYC VERIFICATION
// =============================================================================

export async function verifyKYCLevel(userId: string): Promise<number> {
  try {
    // Get user's KYC information from database
    const kycInfo = await getKYCInfoFromDatabase(userId);
    
    if (!kycInfo) {
      return 0; // No KYC
    }
    
    // Determine KYC level based on verification status
    let level = 0;
    
    if (kycInfo.phoneVerified) level = 1;
    if (kycInfo.emailVerified && kycInfo.idDocumentVerified) level = 2;
    if (kycInfo.addressVerified && kycInfo.biometricVerified) level = 3;
    
    return level;
  } catch (error) {
    logger.error('KYC verification error:', error);
    return 0;
  }
}

// =============================================================================
// TRADING FEES AND RISK ASSESSMENT
// =============================================================================

export async function calculateTradingFees(userId: string, tradeData: any) {
  try {
    const userTier = await getUserTradingTier(userId);
    
    // Base fee percentages by tier
    const feeStructure = {
      'bronze': 0.005,   // 0.5%
      'silver': 0.003,   // 0.3%
      'gold': 0.002,     // 0.2%
      'platinum': 0.001, // 0.1%
      'diamond': 0.0005  // 0.05%
    };
    
    const baseFeePercentage = feeStructure[userTier] || feeStructure['bronze'];
    const tradingFee = tradeData.amount * baseFeePercentage;
    
    // Network fee (varies by cryptocurrency)
    const networkFee = await getNetworkFee(tradeData.cryptocurrency);
    
    const totalFee = tradingFee + networkFee;
    const netAmount = tradeData.amount - totalFee;
    
    return {
      tradingFee,
      networkFee,
      totalFee,
      feePercentage: baseFeePercentage * 100,
      netAmount
    };
  } catch (error) {
    logger.error('Fee calculation error:', error);
    throw error;
  }
}

export async function getRiskAssessment(userId: string) {
  try {
    const userProfile = await getUserProfileFromDatabase(userId);
    const tradingHistory = await getTradingHistoryFromDatabase(userId);
    const kycLevel = await verifyKYCLevel(userId);
    
    // Calculate risk factors
    const factors = {
      kycLevel,
      accountAge: getAccountAgeInDays(userProfile.createdAt),
      tradingVolume: tradingHistory.totalVolume,
      successRate: tradingHistory.successRate,
      disputeRate: tradingHistory.disputeRate,
      averageTradeSize: tradingHistory.averageTradeSize,
      countryRisk: getCountryRiskScore(userProfile.country)
    };
    
    // Calculate overall risk score (0-100, lower is better)
    const riskScore = calculateRiskScore(factors);
    
    // Determine risk level
    let riskLevel = 'low';
    if (riskScore > 70) riskLevel = 'high';
    else if (riskScore > 40) riskLevel = 'medium';
    
    // Set trading limits based on risk
    const limits = calculateTradingLimits(riskLevel, kycLevel);
    
    return {
      riskLevel,
      riskScore,
      factors,
      recommendations: generateRiskRecommendations(riskLevel, factors),
      limits,
      lastAssessed: new Date()
    };
  } catch (error) {
    logger.error('Risk assessment error:', error);
    throw error;
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

async function generateCryptoAddress(currency: string): Promise<string> {
  // In production, generate real crypto addresses using appropriate libraries
  const mockAddresses = {
    'BTC': '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
    'ETH': '0x742c82F23Cfa38a6c69b4Cc85a5C3A5b8Aa8bBBb',
    'USDT': '0x742c82F23Cfa38a6c69b4Cc85a5C3A5b8Aa8bBBb',
    'BNB': 'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2'
  };
  
  return mockAddresses[currency] || `mock_${currency.toLowerCase()}_address_${Date.now()}`;
}

async function getCurrencyBalance(address: string, currency: string): Promise<number> {
  try {
    // First try to interpret address as a userId and read crypto_wallets table
    if (!address) return 0;
    // If address looks like a UUID (simple check) treat as user id
    const isUuid = typeof address === 'string' && /^[0-9a-fA-F\-]{8,36}$/.test(address);

    if (isUuid) {
      // Query DB for crypto_wallets for this user
      try {
        const rows = await db.select('crypto_wallets', (record: any) => record.user_id === address);
        const total = rows.reduce((s: number, r: any) => s + parseFloat(r.balance?.toString() || '0'), 0);
        return total;
      } catch (dbErr) {
        logger.debug('DB crypto_wallets query failed in getCurrencyBalance:', dbErr?.message || dbErr);
      }
    }

    // Otherwise, try to find wallet row by wallet_address
    try {
      const rows = await db.select('crypto_wallets', (record: any) => record.wallet_address === address);
      if (rows && rows.length) return parseFloat(rows[0].balance?.toString() || '0');
    } catch (dbErr2) {
      logger.debug('DB wallet_address lookup failed in getCurrencyBalance:', dbErr2?.message || dbErr2);
    }

    // Final fallback – return 0 to avoid showing misleading random balances
    logger.debug('Using default balance of 0 for currency:', currency);
    return 0;
  } catch (error) {
    logger.error('getCurrencyBalance error:', error);
    return 0;
  }
}

async function getCurrencyPrice(currency: string, vsCurrency: string): Promise<number> {
  const prices = await getCryptoPrices([currency.toLowerCase()], vsCurrency);
  return prices[currency.toLowerCase()]?.[vsCurrency] || 0;
}

async function verifyBlockchainTransaction(currency: string, txHash: string) {
  // In production, verify transaction on actual blockchain
  return {
    valid: true,
    confirmations: Math.floor(Math.random() * 10) + 1,
    amount: Math.random() * 5,
    timestamp: Date.now()
  };
}

function getRequiredConfirmations(currency: string): number {
  const confirmations = {
    'BTC': 6,
    'ETH': 12,
    'USDT': 12,
    'BNB': 20
  };
  
  return confirmations[currency.toUpperCase()] || 6;
}

async function calculateWithdrawalFee(currency: string, amount: number): Promise<number> {
  const feeStructure = {
    'BTC': 0.0005,  // Fixed BTC fee
    'ETH': 0.005,   // Fixed ETH fee
    'USDT': 1.0,    // Fixed USDT fee
    'BNB': 0.001    // Fixed BNB fee
  };
  
  return feeStructure[currency.toUpperCase()] || 0.001;
}

async function validateCryptoAddress(address: string, currency: string): Promise<boolean> {
  // In production, validate address format for specific cryptocurrency
  const patterns = {
    'BTC': /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
    'ETH': /^0x[a-fA-F0-9]{40}$/,
    'USDT': /^0x[a-fA-F0-9]{40}$/,
    'BNB': /^bnb[a-z0-9]{39}$/
  };
  
  const pattern = patterns[currency.toUpperCase()];
  return pattern ? pattern.test(address) : true;
}

function getEstimatedArrivalTime(currency: string): string {
  const times = {
    'BTC': '30-60 minutes',
    'ETH': '5-15 minutes',
    'USDT': '5-15 minutes',
    'BNB': '1-3 minutes'
  };
  
  return times[currency.toUpperCase()] || '10-30 minutes';
}

function calculateRiskScore(factors: any): number {
  let score = 50; // Base score
  
  // KYC level (lower level = higher risk)
  score -= factors.kycLevel * 10;
  
  // Account age (newer accounts = higher risk)
  if (factors.accountAge < 30) score += 20;
  else if (factors.accountAge < 90) score += 10;
  
  // Trading volume (very high or very low = higher risk)
  if (factors.tradingVolume < 1000) score += 15;
  else if (factors.tradingVolume > 1000000) score += 10;
  
  // Success rate (lower = higher risk)
  score += (100 - factors.successRate) * 0.5;
  
  // Dispute rate (higher = higher risk)
  score += factors.disputeRate * 10;
  
  // Country risk
  score += factors.countryRisk;
  
  return Math.max(0, Math.min(100, score));
}

function calculateTradingLimits(riskLevel: string, kycLevel: number) {
  const baseLimits = {
    low: { daily: 50000, monthly: 500000 },
    medium: { daily: 20000, monthly: 200000 },
    high: { daily: 5000, monthly: 50000 }
  };
  
  const kycMultipliers = [0.1, 0.5, 1.0, 2.0]; // By KYC level
  const multiplier = kycMultipliers[kycLevel] || 0.1;
  
  const limits = baseLimits[riskLevel];
  
  return {
    daily: limits.daily * multiplier,
    monthly: limits.monthly * multiplier,
    singleTrade: limits.daily * 0.5 * multiplier
  };
}

function generateRiskRecommendations(riskLevel: string, factors: any): string[] {
  const recommendations: string[] = [];
  
  if (factors.kycLevel < 2) {
    recommendations.push('Complete identity verification to increase trading limits');
  }
  
  if (factors.accountAge < 30) {
    recommendations.push('Account age is low - trading limits may be restricted');
  }
  
  if (factors.successRate < 80) {
    recommendations.push('Improve trading success rate by completing trades on time');
  }
  
  if (factors.disputeRate > 5) {
    recommendations.push('Reduce dispute rate by following trading guidelines');
  }
  
  if (riskLevel === 'high') {
    recommendations.push('High risk profile - consider additional verification steps');
  }
  
  return recommendations;
}

// Mock database functions - replace with actual database implementation
async function saveWalletToDatabase(wallet: any) {
  try {
    const result = await db.insert('crypto_wallets', {
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
    });
    
    logger.info('Wallet saved to database', { walletId: result[0].id });
    return result[0];
  } catch (error) {
    logger.error('Error saving wallet to database:', error);
    throw error;
  }
}

async function getWalletFromDatabase(userId: string) {
  try {
    const wallets = await db.select('crypto_wallets', 
      (record) => record.user_id === userId
    );
    
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

async function saveDepositToDatabase(deposit: any) {
  try {
    const result = await db.insert('crypto_transactions', {
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
    });
    
    logger.info('Deposit saved to database', { depositId: result[0].id });
    return result[0];
  } catch (error) {
    logger.error('Error saving deposit to database:', error);
    throw error;
  }
}

async function saveWithdrawalToDatabase(withdrawal: any) {
  try {
    const result = await db.insert('crypto_transactions', {
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
    });
    
    logger.info('Withdrawal saved to database', { withdrawalId: result[0].id });
    return result[0];
  } catch (error) {
    logger.error('Error saving withdrawal to database:', error);
    throw error;
  }
}

async function creditWalletBalance(userId: string, currency: string, amount: number) {
  try {
    // Update the actual wallet balance in the database
    const wallet = await getWalletFromDatabase(userId);
    if (wallet) {
      await db.update('crypto_wallets',
        (record) => record.user_id === userId,
        { 
          balance: (parseFloat(wallet[currency] || '0') + amount).toString(),
          updated_at: new Date() 
        }
      );
    }
    
    logger.info('Wallet balance credited', { userId, currency, amount });
  } catch (error) {
    logger.error('Error crediting wallet balance:', error);
    throw error;
  }
}

async function debitWalletBalance(userId: string, currency: string, amount: number) {
  try {
    // Update the actual wallet balance in the database
    const wallet = await getWalletFromDatabase(userId);
    if (wallet) {
      await db.update('crypto_wallets',
        (record) => record.user_id === userId,
        { 
          balance: (parseFloat(wallet[currency] || '0') - amount).toString(),
          updated_at: new Date() 
        }
      );
    }
    
    logger.info('Wallet balance debited', { userId, currency, amount });
  } catch (error) {
    logger.error('Error debiting wallet balance:', error);
    throw error;
  }
}

async function updateDepositStatus(depositId: string, status: string) {
  try {
    await db.update('crypto_transactions',
      (record) => record.id === depositId,
      { status, updated_at: new Date() }
    );
    
    logger.info('Deposit status updated', { depositId, status });
  } catch (error) {
    logger.error('Error updating deposit status:', error);
    throw error;
  }
}

async function updateWithdrawalStatus(withdrawalId: string, status: string) {
  try {
    await db.update('crypto_transactions',
      (record) => record.id === withdrawalId,
      { status, updated_at: new Date() }
    );
    
    logger.info('Withdrawal status updated', { withdrawalId, status });
  } catch (error) {
    logger.error('Error updating withdrawal status:', error);
    throw error;
  }
}

async function submitBlockchainTransaction(currency: string, address: string, amount: number, memo?: string) {
  // Mock blockchain transaction
  logger.info('Blockchain transaction submitted', { currency, address, amount, memo });
  return `mock_tx_hash_${Date.now()}`;
}

async function getUserTradingReputation(userId: string): Promise<number> {
  // Mock reputation score
  return 4.5;
}

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

async function lockCryptocurrencyForOrder(userId: string, currency: string, amount: number) {
  try {
    // In a real implementation, you would lock the cryptocurrency in the database
    logger.info('Cryptocurrency locked for order', { userId, currency, amount });
  } catch (error) {
    logger.error('Error locking cryptocurrency for order:', error);
    throw error;
  }
}

async function addOrderToMatchingEngine(order: any) {
  try {
    // In a real implementation, you would add the order to a matching engine
    logger.info('Order added to matching engine', { orderId: order.id });
  } catch (error) {
    logger.error('Error adding order to matching engine:', error);
    throw error;
  }
}

async function findMatchingOrders(order: any) {
  // Mock matching logic
  return [];
}

async function createTradeBetweenOrders(order1: any, order2: any) {
  // Mock trade creation
  return {
    success: true,
    tradeId: `trade_${Date.now()}`,
    matchedAmount: Math.min(order1.amount, order2.amount)
  };
}

async function updateOrderAfterMatch(orderId: string, matchedAmount: number) {
  logger.info('Order updated after match', { orderId, matchedAmount });
}

async function getKYCInfoFromDatabase(userId: string) {
  // Mock KYC info
  return {
    phoneVerified: true,
    emailVerified: true,
    idDocumentVerified: false,
    addressVerified: false,
    biometricVerified: false
  };
}

async function getUserTradingTier(userId: string): Promise<string> {
  // Mock trading tier
  return 'bronze';
}

async function getNetworkFee(currency: string): Promise<number> {
  const fees = {
    'BTC': 0.0001,
    'ETH': 0.002,
    'USDT': 1.0,
    'BNB': 0.0005
  };
  
  return fees[currency.toUpperCase()] || 0.001;
}

async function getUserProfileFromDatabase(userId: string) {
  return {
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    country: 'US'
  };
}

async function getTradingHistoryFromDatabase(userId: string) {
  return {
    totalVolume: 50000,
    successRate: 85,
    disputeRate: 2,
    averageTradeSize: 5000
  };
}

function getAccountAgeInDays(createdAt: Date): number {
  return Math.floor((Date.now() - createdAt.getTime()) / (24 * 60 * 60 * 1000));
}

function getCountryRiskScore(country: string): number {
  // Mock country risk scores
  const riskScores = {
    'US': 5,
    'GB': 5,
    'DE': 5,
    'NG': 15,
    'KE': 10,
    'ZA': 8
  };
  
  return riskScores[country] || 10;
}

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

async function lockCryptocurrencyInEscrow(userId: string, currency: string, amount: number) {
  try {
    // In a real implementation, you would lock the cryptocurrency in escrow
    logger.info('Cryptocurrency locked in escrow', { userId, currency, amount });
  } catch (error) {
    logger.error('Error locking cryptocurrency in escrow:', error);
    throw error;
  }
}

async function updateEscrowStatus(escrowId: string, status: string, metadata?: any) {
  try {
    // In a real implementation, you would update the escrow transactions table
    logger.info('Escrow status updated', { escrowId, status, metadata });
  } catch (error) {
    logger.error('Error updating escrow status:', error);
    throw error;
  }
}

async function transferCryptocurrency(currency: string, amount: number, toUserId: string): Promise<string> {
  try {
    // In a real implementation, you would transfer the cryptocurrency
    logger.info('Cryptocurrency transferred', { currency, amount, toUserId });
    return `tx_hash_${Date.now()}`;
  } catch (error) {
    logger.error('Error transferring cryptocurrency:', error);
    throw error;
  }
}

async function updateTradingStatistics(sellerId: string, buyerId: string, escrow: any) {
  try {
    // In a real implementation, you would update trading statistics
    logger.info('Trading statistics updated', { sellerId, buyerId, escrowId: escrow.id });
  } catch (error) {
    logger.error('Error updating trading statistics:', error);
    throw error;
  }
}

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

async function notifyAdminTeam(type: string, data: any) {
  try {
    // In a real implementation, you would notify the admin team
    logger.info('Admin team notified', { type, data });
  } catch (error) {
    logger.error('Error notifying admin team:', error);
    throw error;
  }
}

async function handleEscrowTimeout(escrowId: string) {
  try {
    // In a real implementation, this would automatically refund the cryptocurrency to seller
    logger.info('Handling escrow timeout', { escrowId });
  } catch (error) {
    logger.error('Error handling escrow timeout:', error);
    throw error;
  }
}

export async function executeTrade(tradeData: any) {
  // Mock trade execution
  return {
    success: true,
    tradeId: `trade_${Date.now()}`,
    executedAt: new Date()
  };
}

// =============================================================================
// ADDITIONAL HELPER FUNCTIONS FOR CRYPTO ROUTES
// =============================================================================

export async function getDetailedPriceData(symbol: string, vsCurrency: string, timeframe: string) {
  try {
    // In production, fetch from a price API
    const mockPriceData = {
      'bitcoin': {
        current_price: 45000,
        price_change_24h: 1250.50,
        price_change_percentage_24h: 2.85,
        market_cap: 850000000000,
        volume_24h: 25000000000,
        high_24h: 46000,
        low_24h: 43500
      },
      'ethereum': {
        current_price: 3200,
        price_change_24h: 95.20,
        price_change_percentage_24h: 3.05,
        market_cap: 380000000000,
        volume_24h: 15000000000,
        high_24h: 3300,
        low_24h: 3100
      },
      'tether': {
        current_price: 1.0,
        price_change_24h: 0.001,
        price_change_percentage_24h: 0.1,
        market_cap: 95000000000,
        volume_24h: 45000000000,
        high_24h: 1.005,
        low_24h: 0.995
      },
      'binancecoin': {
        current_price: 320,
        price_change_24h: -2.5,
        price_change_percentage_24h: -0.78,
        market_cap: 48000000000,
        volume_24h: 2000000000,
        high_24h: 330,
        low_24h: 315
      }
    };

    const data = mockPriceData[symbol] || mockPriceData['bitcoin'];
    
    return {
      ...data,
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Detailed price data fetch error:', error);
    throw error;
  }
}

export async function getEstimatedMatches(orderData: any) {
  // Mock estimated matches based on order data
  const potentialMatches = Math.floor(Math.random() * 10) + 1;
  const averagePrice = orderData.price * (0.95 + Math.random() * 0.1);
  
  return {
    potentialMatches,
    averagePrice: parseFloat(averagePrice.toFixed(2)),
    estimatedTime: `${5 + Math.floor(Math.random() * 25)}-${10 + Math.floor(Math.random() * 30)} minutes`
  };
}

export async function getP2POrders(filters: any, page: number, limit: number) {
  // Mock P2P orders based on filters
  const mockOrders: any[] = [];
  const totalOrders = 50;
  
  // Generate mock orders
  for (let i = 0; i < Math.min(limit, totalOrders - (page - 1) * limit); i++) {
    const orderId = `order_${Date.now()}_${i}`;
    const isBuyOrder = Math.random() > 0.5;
    
    mockOrders.push({
      id: orderId,
      userId: `user_${Math.floor(Math.random() * 1000)}`,
      type: isBuyOrder ? 'buy' : 'sell',
      cryptocurrency: filters.cryptocurrency || 'BTC',
      fiatCurrency: filters.fiatCurrency || 'USD',
      amount: parseFloat((Math.random() * 10).toFixed(4)),
      price: parseFloat((45000 + (Math.random() * 2000 - 1000)).toFixed(2)),
      minOrderAmount: parseFloat((Math.random() * 0.5).toFixed(4)),
      maxOrderAmount: parseFloat((Math.random() * 5 + 0.5).toFixed(4)),
      paymentMethods: ['bank_transfer', 'paypal'],
      timeLimit: 30,
      status: 'active',
      reputation: parseFloat((4 + Math.random() * 1).toFixed(1)),
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      completedTrades: Math.floor(Math.random() * 100)
    });
  }
  
  return {
    orders: mockOrders,
    total: totalOrders
  };
}

export async function getUserP2POrders(userId: string, options: any) {
  // Mock user P2P orders
  const mockOrders: any[] = [];
  const totalOrders = Math.floor(Math.random() * 10) + 1;
  
  for (let i = 0; i < totalOrders; i++) {
    const orderId = `user_order_${userId}_${i}`;
    const isBuyOrder = Math.random() > 0.5;
    
    mockOrders.push({
      id: orderId,
      userId,
      type: isBuyOrder ? 'buy' : 'sell',
      cryptocurrency: 'BTC',
      fiatCurrency: 'USD',
      amount: parseFloat((Math.random() * 5).toFixed(4)),
      price: parseFloat((45000 + (Math.random() * 1000 - 500)).toFixed(2)),
      minOrderAmount: parseFloat((Math.random() * 0.1).toFixed(4)),
      maxOrderAmount: parseFloat((Math.random() * 2 + 0.1).toFixed(4)),
      paymentMethods: ['bank_transfer'],
      timeLimit: Math.floor(Math.random() * 60) + 15,
      status: options.status || (Math.random() > 0.7 ? 'completed' : 'active'),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      completedTrades: Math.floor(Math.random() * 50)
    });
  }
  
  return {
    orders: mockOrders,
    total: totalOrders
  };
}

export async function getP2POrderById(orderId: string) {
  // Mock P2P order by ID
  return {
    id: orderId,
    userId: `user_${Math.floor(Math.random() * 1000)}`,
    type: Math.random() > 0.5 ? 'buy' : 'sell',
    cryptocurrency: 'BTC',
    fiatCurrency: 'USD',
    amount: parseFloat((Math.random() * 5).toFixed(4)),
    price: parseFloat((45000 + (Math.random() * 1000 - 500)).toFixed(2)),
    minOrderAmount: parseFloat((Math.random() * 0.1).toFixed(4)),
    maxOrderAmount: parseFloat((Math.random() * 2 + 0.1).toFixed(4)),
    paymentMethods: ['bank_transfer', 'paypal'],
    timeLimit: 30,
    status: 'active',
    autoReply: 'Thanks for your interest! Please complete payment within 30 minutes.',
    terms: 'Payment must be completed within the time limit. No refunds after release.',
    createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
    completedTrades: Math.floor(Math.random() * 100),
    reputation: parseFloat((4 + Math.random() * 1).toFixed(1))
  };
}

export async function initiatePeerToPeerTrade(tradeData: any) {
  try {
    const tradeId = `trade_${Date.now()}`;
    const escrowId = `escrow_${Date.now()}`;
    
    // In production, this would create actual trade and escrow records
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

export async function getEscrowTransaction(escrowId: string) {
  // Mock escrow transaction
  return {
    id: escrowId,
    buyerId: `buyer_${Math.floor(Math.random() * 1000)}`,
    sellerId: `seller_${Math.floor(Math.random() * 1000)}`,
    status: 'pending_payment',
    amount: parseFloat((Math.random() * 5).toFixed(4)),
    cryptocurrency: 'BTC',
    fiatAmount: parseFloat((Math.random() * 200000).toFixed(2)),
    fiatCurrency: 'USD',
    timeLimit: 30,
    createdAt: new Date(Date.now() - Math.random() * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000)
  };
}

export async function confirmEscrowPayment(escrowId: string, data: any) {
  try {
    // In production, this would verify payment proof and update escrow status
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

export async function getUserTradingHistory(userId: string, filters: any, page: number, limit: number) {
  // Mock trading history
  const mockTrades: any[] = [];
  const totalTrades = 50;
  
  for (let i = 0; i < Math.min(limit, totalTrades - (page - 1) * limit); i++) {
    const tradeId = `trade_${userId}_${Date.now()}_${i}`;
    const isBuy = Math.random() > 0.5;
    
    mockTrades.push({
      id: tradeId,
      userId,
      pair: 'BTC/USD',
      side: isBuy ? 'buy' : 'sell',
      price: parseFloat((45000 + (Math.random() * 2000 - 1000)).toFixed(2)),
      amount: parseFloat((Math.random() * 2).toFixed(4)),
      totalValue: parseFloat((Math.random() * 90000).toFixed(2)),
      fee: parseFloat((Math.random() * 100).toFixed(2)),
      feeCurrency: 'USD',
      status: 'completed',
      orderType: 'market',
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      metadata: {}
    });
  }
  
  // Mock summary
  const summary = {
    totalTrades: totalTrades,
    buyTrades: Math.floor(totalTrades * 0.55),
    sellTrades: Math.floor(totalTrades * 0.45),
    totalVolume: parseFloat((totalTrades * 50000).toFixed(2)),
    totalFees: parseFloat((totalTrades * 50).toFixed(2))
  };
  
  return {
    trades: mockTrades,
    summary,
    total: totalTrades
  };
}

export async function getTradingStatistics(userId: string, timeframe: string) {
  // Mock trading statistics
  return {
    totalTrades: Math.floor(Math.random() * 100) + 20,
    successfulTrades: Math.floor(Math.random() * 90) + 15,
    successRate: parseFloat((85 + Math.random() * 15).toFixed(2)),
    totalVolume: parseFloat((Math.random() * 500000 + 50000).toFixed(2)),
    averageTradeSize: parseFloat((Math.random() * 5000 + 1000).toFixed(2)),
    tradingPairs: ['BTC/USD', 'ETH/USD', 'BTC/EUR'],
    profitLoss: parseFloat((Math.random() * 10000 - 5000).toFixed(2)),
    reputation: parseFloat((4 + Math.random() * 1).toFixed(1)),
    averageResponseTime: Math.floor(Math.random() * 10) + 1, // minutes
    averageCompletionTime: Math.floor(Math.random() * 30) + 10 // minutes
  };
}
