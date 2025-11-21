import express, { Request, Response } from 'express';
import { walletDatabaseService, BankAccountData } from '../../src/services/walletDatabaseService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Middleware to verify user is authenticated
const requireAuth = (req: Request, res: Response, next: Function) => {
  const userId = req.userId || req.query.userId as string;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

/**
 * POST /api/wallet/bank-accounts
 * Create a new bank account
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId || req.query.userId as string;
    const { accountName, accountNumber, bankName, accountHolderName, accountHolderPhone, countryCode, currency } = req.body;

    // Validation
    if (!accountName || !accountNumber || !bankName || !accountHolderName || !countryCode || !currency) {
      return res.status(400).json({
        error: 'Missing required fields: accountName, accountNumber, bankName, accountHolderName, countryCode, currency',
      });
    }

    if (accountNumber.length < 10) {
      return res.status(400).json({
        error: 'Account number must be at least 10 digits',
      });
    }

    const account = await walletDatabaseService.createBankAccount(userId, {
      accountName,
      accountNumber,
      bankName,
      accountHolderName,
      accountHolderPhone,
      countryCode,
      currency,
    });

    logger.info(`Bank account created for user ${userId}: ${account.id}`);

    res.status(201).json({
      success: true,
      message: 'Bank account created successfully',
      account,
    });
  } catch (error: any) {
    logger.error('Error creating bank account:', error);
    res.status(500).json({
      error: 'Failed to create bank account',
      details: error.message,
    });
  }
});

/**
 * GET /api/wallet/bank-accounts
 * Get all bank accounts for the user
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId || req.query.userId as string;
    const countryCode = req.query.countryCode as string | undefined;

    const accounts = await walletDatabaseService.getBankAccounts(userId, countryCode);

    res.json({
      success: true,
      accounts,
      total: accounts.length,
    });
  } catch (error: any) {
    logger.error('Error fetching bank accounts:', error);
    res.status(500).json({
      error: 'Failed to fetch bank accounts',
      details: error.message,
    });
  }
});

/**
 * GET /api/wallet/bank-accounts/:id
 * Get a specific bank account
 */
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId || req.query.userId as string;
    const { id } = req.params;

    const account = await walletDatabaseService.getBankAccount(id, userId);

    if (!account) {
      return res.status(404).json({
        error: 'Bank account not found',
      });
    }

    res.json({
      success: true,
      account,
    });
  } catch (error: any) {
    logger.error('Error fetching bank account:', error);
    res.status(500).json({
      error: 'Failed to fetch bank account',
      details: error.message,
    });
  }
});

/**
 * PATCH /api/wallet/bank-accounts/:id
 * Update a bank account
 */
router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId || req.query.userId as string;
    const { id } = req.params;
    const { accountName, accountHolderPhone, isDefault, isVerified } = req.body;

    // Validate: only allow updating certain fields
    const updateData: any = {};
    if (accountName) updateData.accountName = accountName;
    if (accountHolderPhone) updateData.accountHolderPhone = accountHolderPhone;
    if (isDefault !== undefined) updateData.isDefault = isDefault;
    if (isVerified !== undefined) updateData.isVerified = isVerified;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'No valid fields to update',
      });
    }

    const account = await walletDatabaseService.updateBankAccount(id, userId, updateData);

    if (!account) {
      return res.status(404).json({
        error: 'Bank account not found',
      });
    }

    logger.info(`Bank account updated for user ${userId}: ${id}`);

    res.json({
      success: true,
      message: 'Bank account updated successfully',
      account,
    });
  } catch (error: any) {
    logger.error('Error updating bank account:', error);
    res.status(500).json({
      error: 'Failed to update bank account',
      details: error.message,
    });
  }
});

/**
 * DELETE /api/wallet/bank-accounts/:id
 * Delete a bank account
 */
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId || req.query.userId as string;
    const { id } = req.params;

    const success = await walletDatabaseService.deleteBankAccount(id, userId);

    if (!success) {
      return res.status(404).json({
        error: 'Bank account not found',
      });
    }

    logger.info(`Bank account deleted for user ${userId}: ${id}`);

    res.json({
      success: true,
      message: 'Bank account deleted successfully',
    });
  } catch (error: any) {
    logger.error('Error deleting bank account:', error);
    res.status(500).json({
      error: 'Failed to delete bank account',
      details: error.message,
    });
  }
});

/**
 * POST /api/wallet/bank-accounts/:id/default
 * Set a bank account as default
 */
router.post('/:id/default', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId || req.query.userId as string;
    const { id } = req.params;

    const success = await walletDatabaseService.setDefaultBankAccount(id, userId);

    if (!success) {
      return res.status(404).json({
        error: 'Bank account not found',
      });
    }

    logger.info(`Default bank account set for user ${userId}: ${id}`);

    res.json({
      success: true,
      message: 'Bank account set as default',
    });
  } catch (error: any) {
    logger.error('Error setting default bank account:', error);
    res.status(500).json({
      error: 'Failed to set default bank account',
      details: error.message,
    });
  }
});

/**
 * POST /api/wallet/bank-accounts/:id/verify
 * Initiate bank account verification
 */
router.post('/:id/verify', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId || req.query.userId as string;
    const { id } = req.params;
    const { method } = req.body;

    // Validate verification method
    const validMethods = ['microdeposit', 'document', 'banklink'];
    if (!method || !validMethods.includes(method)) {
      return res.status(400).json({
        error: `Invalid verification method. Valid methods: ${validMethods.join(', ')}`,
      });
    }

    const account = await walletDatabaseService.getBankAccount(id, userId);
    if (!account) {
      return res.status(404).json({
        error: 'Bank account not found',
      });
    }

    // For now, return verification initiation info
    // In a real implementation, this would trigger micro-deposits or external verification
    const verificationData = {
      accountId: id,
      method,
      status: 'pending',
      nextSteps: {
        microdeposit: 'Two small deposits (0.01-0.99) will be sent to your account. Please provide the amounts to verify.',
        document: 'Please upload a bank statement or account verification document.',
        banklink: 'Use your bank credentials to instantly verify your account.',
      },
    };

    logger.info(`Bank account verification initiated for user ${userId}: ${id} using method ${method}`);

    res.json({
      success: true,
      message: 'Bank account verification initiated',
      verification: verificationData,
    });
  } catch (error: any) {
    logger.error('Error verifying bank account:', error);
    res.status(500).json({
      error: 'Failed to verify bank account',
      details: error.message,
    });
  }
});

export default router;
