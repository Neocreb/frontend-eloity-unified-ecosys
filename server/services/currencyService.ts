import axios from 'axios';
import { logger } from '../utils/logger.js';
import { SUPPORTED_CURRENCIES } from '../../config/currencies.ts';

const CRYPTOAPIS_BASE_URL = 'https://rest.cryptoapis.io/v2';
const CRYPTOAPIS_API_KEY = process.env.CRYPTOAPIS_API_KEY;

interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: Date;
  source: 'static' | 'api' | 'cache';
}

interface CurrencyRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: Date;
}

// In-memory cache for exchange rates
let exchangeRateCache: Map<string, ExchangeRate> = new Map();
let lastRateUpdateTime: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Fiat currency pairs with direct conversion rates
const FIAT_PAIRS = [
  { from: 'USD', to: 'EUR', rate: 0.92 },
  { from: 'USD', to: 'GBP', rate: 0.79 },
  { from: 'USD', to: 'JPY', rate: 149.50 },
  { from: 'USD', to: 'INR', rate: 83.12 },
  { from: 'USD', to: 'AUD', rate: 1.53 },
  { from: 'USD', to: 'CAD', rate: 1.36 },
  { from: 'USD', to: 'CHF', rate: 0.89 },
  { from: 'USD', to: 'CNY', rate: 7.24 },
  { from: 'USD', to: 'SGD', rate: 1.35 },
  { from: 'USD', to: 'HKD', rate: 7.85 },
  // African currencies
  { from: 'USD', to: 'NGN', rate: 1550 },
  { from: 'USD', to: 'ZAR', rate: 18.50 },
  { from: 'USD', to: 'KES', rate: 147.5 },
  { from: 'USD', to: 'GHS', rate: 12.50 },
  { from: 'USD', to: 'EGP', rate: 49.75 },
  { from: 'USD', to: 'UGX', rate: 3850 },
  { from: 'USD', to: 'TZS', rate: 2650 },
  { from: 'USD', to: 'XOF', rate: 605 },
  { from: 'USD', to: 'CFA', rate: 605 },
  { from: 'USD', to: 'MAD', rate: 10.15 },
];

// Crypto pairs (will be fetched from CryptoAPIs)
const CRYPTO_ASSETS = ['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'ADA', 'SOL', 'XRP', 'DOGE', 'MATIC'];

export async function initializeCurrencyService() {
  logger.info('Initializing currency service...');
  await refreshExchangeRates();
  
  // Schedule daily rate updates at 00:00 UTC
  scheduleRateUpdates();
}

function scheduleRateUpdates() {
  const now = new Date();
  const next00UTC = new Date(now.getTime());
  next00UTC.setUTCHours(0, 0, 0, 0);
  
  if (next00UTC <= now) {
    next00UTC.setUTCDate(next00UTC.getUTCDate() + 1);
  }
  
  const timeUntilNext = next00UTC.getTime() - now.getTime();
  
  setTimeout(() => {
    refreshExchangeRates().catch(err => {
      logger.error('Failed to refresh exchange rates:', err);
    });
    // Then schedule it daily
    setInterval(() => {
      refreshExchangeRates().catch(err => {
        logger.error('Failed to refresh exchange rates:', err);
      });
    }, 24 * 60 * 60 * 1000);
  }, timeUntilNext);
  
  logger.info(`Exchange rate updates scheduled for 00:00 UTC (in ${timeUntilNext / 1000 / 60} minutes)`);
}

export async function refreshExchangeRates(): Promise<void> {
  try {
    logger.info('Refreshing exchange rates...');
    
    exchangeRateCache.clear();
    
    // Load fiat rates
    await loadFiatRates();
    
    // Load crypto rates
    if (CRYPTOAPIS_API_KEY) {
      await loadCryptoRates();
    } else {
      logger.warn('CRYPTOAPIS_API_KEY not set, skipping crypto rates');
    }
    
    lastRateUpdateTime = Date.now();
    logger.info(`Exchange rates refreshed. Total rates cached: ${exchangeRateCache.size}`);
  } catch (error) {
    logger.error('Error refreshing exchange rates:', error);
    throw error;
  }
}

async function loadFiatRates(): Promise<void> {
  const now = new Date();
  
  // Add all fiat pairs and reverse pairs
  FIAT_PAIRS.forEach(pair => {
    // Forward rate
    exchangeRateCache.set(`${pair.from}_${pair.to}`, {
      from: pair.from,
      to: pair.to,
      rate: pair.rate,
      lastUpdated: now,
      source: 'api'
    });
    
    // Reverse rate
    exchangeRateCache.set(`${pair.to}_${pair.from}`, {
      from: pair.to,
      to: pair.from,
      rate: 1 / pair.rate,
      lastUpdated: now,
      source: 'api'
    });
  });
  
  // Same currency rate is always 1
  SUPPORTED_CURRENCIES.forEach(currency => {
    exchangeRateCache.set(`${currency.code}_${currency.code}`, {
      from: currency.code,
      to: currency.code,
      rate: 1,
      lastUpdated: now,
      source: 'cache'
    });
  });
  
  logger.info('Fiat exchange rates loaded');
}

async function loadCryptoRates(): Promise<void> {
  try {
    if (!CRYPTOAPIS_API_KEY) return;
    
    const now = new Date();
    
    // Get BTC price in USD (as reference)
    const response = await axios.get(
      `${CRYPTOAPIS_BASE_URL}/market-data/latest-tickers`,
      {
        params: {
          quote: 'USD',
          'criteria.symbols': CRYPTO_ASSETS.join(',')
        },
        headers: {
          'X-API-Key': CRYPTOAPIS_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    if (response.data?.data?.items) {
      response.data.data.items.forEach((item: any) => {
        const symbol = item.symbol;
        const usdPrice = parseFloat(item.latestPrice);
        
        if (symbol && usdPrice) {
          // Crypto to USD
          exchangeRateCache.set(`${symbol}_USD`, {
            from: symbol,
            to: 'USD',
            rate: usdPrice,
            lastUpdated: now,
            source: 'api'
          });
          
          // USD to Crypto
          exchangeRateCache.set(`USD_${symbol}`, {
            from: 'USD',
            to: symbol,
            rate: 1 / usdPrice,
            lastUpdated: now,
            source: 'api'
          });
          
          // Crypto to other major currencies (derived from USD rates)
          FIAT_PAIRS.forEach(pair => {
            if (pair.from === 'USD') {
              // Crypto to Fiat
              exchangeRateCache.set(`${symbol}_${pair.to}`, {
                from: symbol,
                to: pair.to,
                rate: usdPrice * pair.rate,
                lastUpdated: now,
                source: 'api'
              });
              
              // Fiat to Crypto
              exchangeRateCache.set(`${pair.to}_${symbol}`, {
                from: pair.to,
                to: symbol,
                rate: 1 / (usdPrice * pair.rate),
                lastUpdated: now,
                source: 'api'
              });
            }
          });
        }
      });
      
      logger.info(`Crypto rates loaded for ${CRYPTO_ASSETS.length} assets`);
    }
  } catch (error) {
    logger.error('Error loading crypto rates:', error);
    // Don't throw, allow fiat rates to still work
  }
}

export function getExchangeRates(): CurrencyRate[] {
  return Array.from(exchangeRateCache.values()).map(rate => ({
    from: rate.from,
    to: rate.to,
    rate: rate.rate,
    lastUpdated: rate.lastUpdated
  }));
}

export function getExchangeRate(fromCode: string, toCode: string): number | null {
  if (fromCode === toCode) return 1;
  
  const key = `${fromCode}_${toCode}`;
  const rate = exchangeRateCache.get(key);
  
  if (!rate) {
    logger.warn(`Exchange rate not found: ${fromCode} -> ${toCode}`);
    return null;
  }
  
  return rate.rate;
}

export function convertAmount(amount: number, fromCode: string, toCode: string): number {
  const rate = getExchangeRate(fromCode, toCode);
  if (rate === null) {
    return amount;
  }
  return parseFloat((amount * rate).toFixed(2));
}

export function getLastUpdateTime(): Date {
  return new Date(lastRateUpdateTime);
}

export function isCacheValid(): boolean {
  return Date.now() - lastRateUpdateTime < CACHE_DURATION;
}

export function getCachedRateCount(): number {
  return exchangeRateCache.size;
}
