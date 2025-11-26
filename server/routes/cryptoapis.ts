import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import cryptoapisService from '../services/cryptoapisService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// =============================================================================
// BLOCKCHAIN DATA ENDPOINTS
// =============================================================================

/**
 * Get latest address activity
 * GET /api/cryptoapis/address/latest/:blockchain/:network/:address
 */
router.get('/address/latest/:blockchain/:network/:address', authenticateToken, async (req, res) => {
  try {
    const { blockchain, network, address } = req.params;
    
    const result = await cryptoapisService.getAddressLatestActivity(blockchain, network, address);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: unknown) {
    logger.error('Get address latest activity error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

/**
 * Get full address history
 * GET /api/cryptoapis/address/history/:blockchain/:network/:address
 */
router.get('/address/history/:blockchain/:network/:address', authenticateToken, async (req, res) => {
  try {
    const { blockchain, network, address } = req.params;
    
    const result = await cryptoapisService.getAddressHistory(blockchain, network, address);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: unknown) {
    logger.error('Get address history error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

/**
 * Get block data
 * GET /api/cryptoapis/block/:blockchain/:network/:blockId
 */
router.get('/block/:blockchain/:network/:blockId', authenticateToken, async (req, res) => {
  try {
    const { blockchain, network, blockId } = req.params;
    
    const result = await cryptoapisService.getBlockData(blockchain, network, blockId);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: unknown) {
    logger.error('Get block data error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

/**
 * Get transaction data
 * GET /api/cryptoapis/transaction/:blockchain/:network/:transactionId
 */
router.get('/transaction/:blockchain/:network/:transactionId', authenticateToken, async (req, res) => {
  try {
    const { blockchain, network, transactionId } = req.params;
    
    const result = await cryptoapisService.getTransactionData(blockchain, network, transactionId);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: unknown) {
    logger.error('Get transaction data error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// =============================================================================
// BLOCKCHAIN TOOLS ENDPOINTS
// =============================================================================

/**
 * Simulate EVM transaction
 * POST /api/cryptoapis/simulate-transaction
 */
router.post('/simulate-transaction', authenticateToken, async (req, res) => {
  try {
    const { blockchain, network, transactionData } = req.body;
    
    if (!blockchain || !network || !transactionData) {
      return res.status(400).json({
        success: false,
        error: 'blockchain, network, and transactionData are required'
      });
    }
    
    const result = await cryptoapisService.simulateTransaction(blockchain, network, transactionData);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: unknown) {
    logger.error('Simulate transaction error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

/**
 * Blockchain utilities
 * POST /api/cryptoapis/utils/:utility
 */
router.post('/utils/:utility', authenticateToken, async (req, res) => {
  try {
    const { utility } = req.params;
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'data is required'
      });
    }
    
    const result = await cryptoapisService.blockchainUtils(utility, data);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: unknown) {
    logger.error('Blockchain utilities error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// =============================================================================
// TRANSACTIONS ENDPOINTS
// =============================================================================

/**
 * Broadcast transaction
 * POST /api/cryptoapis/broadcast
 */
router.post('/broadcast', authenticateToken, async (req, res) => {
  try {
    const { blockchain, network, signedTransaction } = req.body;
    
    if (!blockchain || !network || !signedTransaction) {
      return res.status(400).json({
        success: false,
        error: 'blockchain, network, and signedTransaction are required'
      });
    }
    
    const result = await cryptoapisService.broadcastTransaction(blockchain, network, signedTransaction);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: unknown) {
    logger.error('Broadcast transaction error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// =============================================================================
// WALLET ENDPOINTS
// =============================================================================

/**
 * Manage HD Wallet
 * POST /api/cryptoapis/hd-wallet
 */
router.post('/hd-wallet', authenticateToken, async (req, res) => {
  try {
    const { blockchain, network, walletData } = req.body;
    
    if (!blockchain || !network || !walletData) {
      return res.status(400).json({
        success: false,
        error: 'blockchain, network, and walletData are required'
      });
    }
    
    const result = await cryptoapisService.manageHDWallet(blockchain, network, walletData);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: unknown) {
    logger.error('HD Wallet management error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

/**
 * Get wallet addresses
 * GET /api/cryptoapis/hd-wallet/:walletId/addresses
 */
router.get('/hd-wallet/:walletId/addresses', authenticateToken, async (req, res) => {
  try {
    const { walletId } = req.params;
    const { blockchain, network, count } = req.query;
    
    if (!blockchain || !network) {
      return res.status(400).json({
        success: false,
        error: 'blockchain and network are required as query parameters'
      });
    }
    
    const result = await cryptoapisService.getWalletAddresses(
      blockchain as string, 
      network as string, 
      walletId, 
      parseInt(count as string) || 10
    );
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: unknown) {
    logger.error('Get wallet addresses error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// =============================================================================
// TOKENS ENDPOINTS
// =============================================================================

/**
 * Get token contract metadata
 * GET /api/cryptoapis/token/:blockchain/:network/:contractAddress
 */
router.get('/token/:blockchain/:network/:contractAddress', authenticateToken, async (req, res) => {
  try {
    const { blockchain, network, contractAddress } = req.params;
    
    const result = await cryptoapisService.getTokenContractMetadata(blockchain, network, contractAddress);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: unknown) {
    logger.error('Get token contract metadata error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// =============================================================================
// FEES ENDPOINTS
// =============================================================================

/**
 * Estimate transaction fees
 * GET /api/cryptoapis/fees/:blockchain/:network
 */
router.get('/fees/:blockchain/:network', authenticateToken, async (req, res) => {
  try {
    const { blockchain, network } = req.params;
    const { options } = req.query;
    
    const result = await cryptoapisService.estimateTransactionFees(
      blockchain, 
      network, 
      options ? JSON.parse(options as string) : {}
    );
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: unknown) {
    logger.error('Estimate transaction fees error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// =============================================================================
// EVENTS ENDPOINTS
// =============================================================================

/**
 * Create webhook
 * POST /api/cryptoapis/webhook
 */
router.post('/webhook', authenticateToken, async (req, res) => {
  try {
    const { webhookData } = req.body;
    
    if (!webhookData) {
      return res.status(400).json({
        success: false,
        error: 'webhookData is required'
      });
    }
    
    const result = await cryptoapisService.createWebhook(webhookData);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: unknown) {
    logger.error('Create webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// =============================================================================
// MARKET DATA ENDPOINTS
// =============================================================================

/**
 * Get exchange rates
 * GET /api/cryptoapis/exchange-rates/:baseAssetId/:quoteAssetId
 */
router.get('/exchange-rates/:baseAssetId/:quoteAssetId', authenticateToken, async (req, res) => {
  try {
    const { baseAssetId, quoteAssetId } = req.params;
    const { context } = req.query;
    
    const result = await cryptoapisService.getExchangeRates(
      baseAssetId, 
      quoteAssetId, 
      (context as string) || 'realtime'
    );
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: unknown) {
    logger.error('Get exchange rates error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

/**
 * Get supported assets
 * GET /api/cryptoapis/assets
 */
router.get('/assets', authenticateToken, async (req, res) => {
  try {
    const result = await cryptoapisService.getSupportedAssets();
    
    if (result.success) {
      res.json({
        success: true,
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: unknown) {
    logger.error('Get supported assets error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

export default router;