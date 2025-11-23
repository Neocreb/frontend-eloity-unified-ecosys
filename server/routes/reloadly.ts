import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import reloadlyService from '../services/reloadlyService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get operators by country code
router.get('/operators/:countryCode', authenticateToken, async (req, res) => {
  try {
    const { countryCode } = req.params;
    const operators = await reloadlyService.getOperatorsByCountry(countryCode);
    res.json({ success: true, operators });
  } catch (error: unknown) {
    logger.error('Get operators error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// Get operator by ID
router.get('/operators/id/:operatorId', authenticateToken, async (req, res) => {
  try {
    const { operatorId } = req.params;
    const operator = await reloadlyService.getOperatorById(parseInt(operatorId));
    res.json({ success: true, operator });
  } catch (error: unknown) {
    logger.error('Get operator error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// Send airtime topup
router.post('/airtime/topup', authenticateToken, async (req, res) => {
  try {
    const { operatorId, amount, recipientPhone } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    if (!operatorId || !amount || !recipientPhone) {
      return res.status(400).json({ 
        success: false, 
        error: 'operatorId, amount, and recipientPhone are required' 
      });
    }

    const result = await reloadlyService.sendAirtimeTopup(
      parseInt(operatorId), 
      parseFloat(amount), 
      recipientPhone, 
      userId
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: unknown) {
    logger.error('Airtime topup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// Send data bundle
router.post('/data/bundle', authenticateToken, async (req, res) => {
  try {
    const { operatorId, amount, recipientPhone } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    if (!operatorId || !amount || !recipientPhone) {
      return res.status(400).json({ 
        success: false, 
        error: 'operatorId, amount, and recipientPhone are required' 
      });
    }

    const result = await reloadlyService.sendDataBundle(
      parseInt(operatorId), 
      parseFloat(amount), 
      recipientPhone, 
      userId
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: unknown) {
    logger.error('Data bundle error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// Pay utility bill
router.post('/bills/pay', authenticateToken, async (req, res) => {
  try {
    const { operatorId, amount, recipientPhone } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    if (!operatorId || !amount || !recipientPhone) {
      return res.status(400).json({ 
        success: false, 
        error: 'operatorId, amount, and recipientPhone are required' 
      });
    }

    const result = await reloadlyService.payUtilityBill(
      parseInt(operatorId), 
      parseFloat(amount), 
      recipientPhone, 
      userId
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: unknown) {
    logger.error('Utility bill payment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// Get gift card products
router.get('/gift-cards/products', authenticateToken, async (req, res) => {
  try {
    const products = await reloadlyService.getGiftCardProducts();
    res.json({ success: true, products });
  } catch (error: unknown) {
    logger.error('Get gift card products error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// Get gift card product by ID
router.get('/gift-cards/products/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await reloadlyService.getGiftCardProductById(parseInt(productId));
    res.json({ success: true, product });
  } catch (error: unknown) {
    logger.error('Get gift card product error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// Purchase gift card
router.post('/gift-cards/purchase', authenticateToken, async (req, res) => {
  try {
    const { productId, amount, email } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    if (!productId || !amount || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'productId, amount, and email are required' 
      });
    }

    const result = await reloadlyService.purchaseGiftCard(
      parseInt(productId), 
      parseFloat(amount), 
      email, 
      userId
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: unknown) {
    logger.error('Gift card purchase error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// Get transaction status
router.get('/transactions/:transactionId', authenticateToken, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await reloadlyService.getTransactionStatus(transactionId);
    res.json({ success: true, transaction });
  } catch (error: unknown) {
    logger.error('Get transaction status error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

// Get account balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const balance = await reloadlyService.getBalance();
    res.json({ success: true, balance });
  } catch (error: unknown) {
    logger.error('Get balance error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

export default router;