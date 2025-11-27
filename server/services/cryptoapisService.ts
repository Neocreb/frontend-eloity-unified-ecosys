import axios from 'axios';
import { logger } from '../utils/logger.js';

// CRYPTO APIs base configuration
const CRYPTOAPIS_BASE_URL = 'https://rest.cryptoapis.io/v2';
const API_KEY = process.env.CRYPTOAPIS_API_KEY;

// Validate API key on startup
if (!API_KEY) {
  logger.warn('⚠️  CRYPTOAPIS_API_KEY is not set. Crypto features will not work.');
  logger.warn('Please set CRYPTOAPIS_API_KEY environment variable to enable crypto functionality.');
}

// Create axios instance with default headers
const cryptoapisClient = axios.create({
  baseURL: CRYPTOAPIS_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY || ''
  },
  timeout: 10000
});

// =============================================================================
// BLOCKCHAIN DATA SERVICES
// =============================================================================

/**
 * Get latest address activity (last 14 days)
 * @param blockchain - Blockchain name (e.g., 'ethereum', 'bitcoin')
 * @param network - Network name (e.g., 'mainnet', 'testnet')
 * @param address - Wallet address
 */
export async function getAddressLatestActivity(blockchain: string, network: string, address: string) {
  if (!API_KEY) {
    return {
      success: false,
      error: 'CryptoAPIs API key is not configured'
    };
  }

  try {
    const response = await cryptoapisClient.get(`/blockchain-data/${blockchain}/${network}/addresses/${address}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    logger.error('CRYPTO APIs - Get address latest activity error:', error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to fetch address activity'
    };
  }
}

/**
 * Get full address history from Genesis block
 * @param blockchain - Blockchain name
 * @param network - Network name
 * @param address - Wallet address
 */
export async function getAddressHistory(blockchain: string, network: string, address: string) {
  if (!API_KEY) {
    return {
      success: false,
      error: 'CryptoAPIs API key is not configured'
    };
  }

  try {
    const response = await cryptoapisClient.get(`/blockchain-data/${blockchain}/${network}/addresses/${address}/transactions`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    logger.error('CRYPTO APIs - Get address history error:', error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to fetch address history'
    };
  }
}

/**
 * Get detailed block data
 * @param blockchain - Blockchain name
 * @param network - Network name
 * @param blockId - Block height or hash
 */
export async function getBlockData(blockchain: string, network: string, blockId: string | number) {
  if (!API_KEY) {
    return {
      success: false,
      error: 'CryptoAPIs API key is not configured'
    };
  }

  try {
    const response = await cryptoapisClient.get(`/blockchain-data/${blockchain}/${network}/blocks/${blockId}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    logger.error('CRYPTO APIs - Get block data error:', error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to fetch block data'
    };
  }
}

/**
 * Get detailed transaction data
 * @param blockchain - Blockchain name
 * @param network - Network name
 * @param transactionId - Transaction hash
 */
export async function getTransactionData(blockchain: string, network: string, transactionId: string) {
  if (!API_KEY) {
    return {
      success: false,
      error: 'CryptoAPIs API key is not configured'
    };
  }

  try {
    const response = await cryptoapisClient.get(`/blockchain-data/${blockchain}/${network}/transactions/${transactionId}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    logger.error('CRYPTO APIs - Get transaction data error:', error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

// =============================================================================
// BLOCKCHAIN TOOLS SERVICES
// =============================================================================

/**
 * Simulate EVM transactions
 * @param blockchain - Blockchain name (ethereum-based)
 * @param network - Network name
 * @param transactionData - Transaction data to simulate
 */
export async function simulateTransaction(blockchain: string, network: string, transactionData: any) {
  try {
    const response = await cryptoapisClient.post(`/blockchain-tools/${blockchain}/${network}/transactions/simulate`, {
      transaction: transactionData
    });
    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    logger.error('CRYPTO APIs - Simulate transaction error:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

/**
 * Blockchain utilities (address validation, encoding)
 * @param utility - Utility function name
 * @param data - Data to process
 */
export async function blockchainUtils(utility: string, data: any) {
  try {
    const response = await cryptoapisClient.post(`/blockchain-tools/utilities/${utility}`, data);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    logger.error('CRYPTO APIs - Blockchain utilities error:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

// =============================================================================
// TRANSACTIONS SERVICES
// =============================================================================

/**
 * Broadcast signed transactions
 * @param blockchain - Blockchain name
 * @param network - Network name
 * @param signedTransaction - Signed transaction hex
 */
export async function broadcastTransaction(blockchain: string, network: string, signedTransaction: string) {
  try {
    const response = await cryptoapisClient.post(`/blockchain-tools/${blockchain}/${network}/transactions/broadcast`, {
      transaction: signedTransaction
    });
    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    logger.error('CRYPTO APIs - Broadcast transaction error:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

// =============================================================================
// WALLET SERVICES
// =============================================================================

/**
 * HD Wallet management
 * @param blockchain - Blockchain name
 * @param network - Network name
 * @param walletData - Wallet configuration data
 */
export async function manageHDWallet(blockchain: string, network: string, walletData: any) {
  try {
    const response = await cryptoapisClient.post(`/blockchain-tools/${blockchain}/${network}/hd-wallets`, walletData);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    logger.error('CRYPTO APIs - HD Wallet management error:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

/**
 * Get wallet addresses
 * @param blockchain - Blockchain name
 * @param network - Network name
 * @param walletId - Wallet ID
 * @param count - Number of addresses to generate
 */
export async function getWalletAddresses(blockchain: string, network: string, walletId: string, count: number = 10) {
  try {
    const response = await cryptoapisClient.get(`/blockchain-tools/${blockchain}/${network}/hd-wallets/${walletId}/addresses?count=${count}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    logger.error('CRYPTO APIs - Get wallet addresses error:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

// =============================================================================
// TOKENS SERVICES
// =============================================================================

/**
 * Get token contract metadata
 * @param blockchain - Blockchain name
 * @param network - Network name
 * @param contractAddress - Token contract address
 */
export async function getTokenContractMetadata(blockchain: string, network: string, contractAddress: string) {
  try {
    const response = await cryptoapisClient.get(`/tokenized-api/${blockchain}/${network}/tokens/${contractAddress}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    logger.error('CRYPTO APIs - Get token contract metadata error:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

// =============================================================================
// FEES SERVICES
// =============================================================================

/**
 * Estimate transaction fees
 * @param blockchain - Blockchain name
 * @param network - Network name
 * @param options - Fee estimation options
 */
export async function estimateTransactionFees(blockchain: string, network: string, options: any = {}) {
  try {
    const response = await cryptoapisClient.get(`/blockchain-data/${blockchain}/${network}/fees`, { params: options });
    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    logger.error('CRYPTO APIs - Estimate transaction fees error:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

// =============================================================================
// EVENTS SERVICES
// =============================================================================

/**
 * Create webhook for blockchain events
 * @param webhookData - Webhook configuration
 */
export async function createWebhook(webhookData: any) {
  try {
    const response = await cryptoapisClient.post('/webhooks', webhookData);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    logger.error('CRYPTO APIs - Create webhook error:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

// =============================================================================
// MARKET DATA SERVICES
// =============================================================================

/**
 * Get cryptocurrency exchange rates
 * @param baseAssetId - Base asset (e.g., 'USD', 'BTC')
 * @param quoteAssetId - Quote asset (e.g., 'BTC', 'ETH')
 * @param context - Context (e.g., 'historical', 'realtime')
 */
export async function getExchangeRates(baseAssetId: string, quoteAssetId: string, context: string = 'realtime') {
  try {
    const response = await cryptoapisClient.get(`/market-data/exchange-rates/${context}/${baseAssetId}/${quoteAssetId}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    logger.error('CRYPTO APIs - Get exchange rates error:', error);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

/**
 * Get supported assets
 */
export async function getSupportedAssets() {
  if (!API_KEY) {
    logger.error('CRYPTOAPIS_API_KEY is not configured');
    return {
      success: false,
      error: 'CryptoAPIs API key is not configured. Please set CRYPTOAPIS_API_KEY environment variable.'
    };
  }

  try {
    const response = await cryptoapisClient.get('/market-data/assets');
    return {
      success: true,
      data: response.data.data
    };
  } catch (error: any) {
    logger.error('CRYPTO APIs - Get supported assets error:', error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to fetch assets from CryptoAPIs'
    };
  }
}

export default {
  getAddressLatestActivity,
  getAddressHistory,
  getBlockData,
  getTransactionData,
  simulateTransaction,
  blockchainUtils,
  broadcastTransaction,
  manageHDWallet,
  getWalletAddresses,
  getTokenContractMetadata,
  estimateTransactionFees,
  createWebhook,
  getExchangeRates,
  getSupportedAssets
};
