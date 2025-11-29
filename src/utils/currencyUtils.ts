import { getCurrencyByCode } from '@/contexts/CurrencyContext';
import type { Currency } from '@/config/currencies';

/**
 * Format amount with currency symbol and proper decimals
 */
export function formatCurrencyAmount(amount: number, currencyCode: string): string {
  const currency = getCurrencyByCode(currencyCode);
  
  if (!currency) {
    return `${amount.toFixed(2)}`;
  }

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  }).format(amount);

  return formatted;
}

/**
 * Format just the currency symbol with amount
 */
export function formatCurrencySymbol(amount: number, currencyCode: string): string {
  const currency = getCurrencyByCode(currencyCode);
  
  if (!currency) {
    return amount.toFixed(2);
  }

  const formattedAmount = amount.toFixed(currency.decimals);
  return `${currency.symbol}${formattedAmount}`;
}

/**
 * Parse currency amount from formatted string
 */
export function parseCurrencyAmount(formatted: string, currencyCode: string): number {
  const currency = getCurrencyByCode(currencyCode);
  
  if (!currency) {
    return parseFloat(formatted);
  }

  // Remove currency symbol and spaces, parse remaining number
  const numericString = formatted
    .replace(currency.symbol, '')
    .replace(/[^\d.-]/g, '')
    .trim();

  return parseFloat(numericString) || 0;
}

/**
 * Get currency display name with code and flag
 */
export function getCurrencyDisplayName(currencyCode: string): string {
  const currency = getCurrencyByCode(currencyCode);
  
  if (!currency) {
    return currencyCode;
  }

  return `${currency.flag} ${currency.code} - ${currency.name}`;
}

/**
 * Format transaction amount in specified currency
 */
export function formatTransactionAmount(
  originalAmount: number,
  originalCurrency: string,
  targetCurrency: string,
  exchangeRate: number | null
): { amount: number; formatted: string; originalFormatted: string } {
  const originalFormatted = formatCurrencyAmount(originalAmount, originalCurrency);
  
  if (originalCurrency === targetCurrency || !exchangeRate) {
    return {
      amount: originalAmount,
      formatted: originalFormatted,
      originalFormatted
    };
  }

  const convertedAmount = parseFloat((originalAmount * exchangeRate).toFixed(2));
  const formatted = formatCurrencyAmount(convertedAmount, targetCurrency);

  return {
    amount: convertedAmount,
    formatted,
    originalFormatted
  };
}

/**
 * Compare prices in different currencies
 */
export function compareCurrencyPrices(
  amount1: number,
  currency1: string,
  amount2: number,
  currency2: string,
  exchangeRate: number | null
): { isCheaper: boolean | null; difference: number | null; percentage: number | null } {
  if (!exchangeRate || currency1 === currency2) {
    return { isCheaper: null, difference: null, percentage: null };
  }

  const amount1InCurrency2 = amount1 * exchangeRate;
  const difference = amount2 - amount1InCurrency2;
  const percentage = (difference / amount1InCurrency2) * 100;

  return {
    isCheaper: difference < 0,
    difference: Math.abs(difference),
    percentage: Math.abs(percentage)
  };
}

/**
 * Format currency range (min - max)
 */
export function formatCurrencyRange(
  minAmount: number,
  maxAmount: number,
  currencyCode: string
): string {
  const currency = getCurrencyByCode(currencyCode);
  
  if (!currency) {
    return `${minAmount.toFixed(2)} - ${maxAmount.toFixed(2)}`;
  }

  const minFormatted = formatCurrencySymbol(minAmount, currencyCode);
  const maxFormatted = formatCurrencySymbol(maxAmount, currencyCode);

  return `${minFormatted} - ${maxFormatted}`;
}

/**
 * Get currency precision (number of decimals)
 */
export function getCurrencyPrecision(currencyCode: string): number {
  const currency = getCurrencyByCode(currencyCode);
  return currency?.decimals || 2;
}

/**
 * Round amount to currency precision
 */
export function roundToCurrencyPrecision(amount: number, currencyCode: string): number {
  const precision = getCurrencyPrecision(currencyCode);
  const factor = Math.pow(10, precision);
  return Math.round(amount * factor) / factor;
}

/**
 * Check if currency is crypto
 */
export function isCryptoCurrency(currencyCode: string): boolean {
  const currency = getCurrencyByCode(currencyCode);
  return currency?.isCrypto === true;
}

/**
 * Get currency category
 */
export function getCurrencyCategory(currencyCode: string): 'fiat' | 'crypto' | 'stablecoin' | null {
  const currency = getCurrencyByCode(currencyCode);
  return currency?.category || null;
}

/**
 * Format large amounts with K, M, B suffix
 */
export function formatCompactCurrency(amount: number, currencyCode: string): string {
  const currency = getCurrencyByCode(currencyCode);
  const decimals = currency?.decimals || 2;

  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B ${currency?.symbol || currencyCode}`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M ${currency?.symbol || currencyCode}`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K ${currency?.symbol || currencyCode}`;
  }
  
  return formatCurrencySymbol(amount, currencyCode);
}
