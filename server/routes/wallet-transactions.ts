import express, { Request, Response } from 'express';
import { walletDatabaseService } from '../services/walletDatabaseService.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

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
 * POST /api/wallet/deposit/initiate
 * Start a deposit transaction
 */
router.post('/deposit/initiate', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId || req.query.userId as string;
    const {
      amount,
      method,
      methodProviderId,
      destination,
      countryCode,
      currency,
      description,
    } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!method || !methodProviderId || !destination || !countryCode || !currency) {
      return res.status(400).json({
        error: 'Missing required fields: amount, method, methodProviderId, destination, countryCode, currency',
      });
    }

    const validDestinations = ['ecommerce', 'crypto', 'rewards', 'freelance'];
    if (!validDestinations.includes(destination)) {
      return res.status(400).json({
        error: `Invalid destination. Valid values: ${validDestinations.join(', ')}`,
      });
    }

    // Generate reference ID
    const referenceId = `DEP-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // Create transaction record
    const transaction = await walletDatabaseService.createTransaction({
      userId,
      transactionType: 'deposit',
      amount,
      currency,
      status: 'pending',
      depositMethod: method,
      description: description || `Deposit via ${methodProviderId}`,
      referenceId,
      metadata: {
        destination,
        methodProviderId,
        countryCode,
        initiatedAt: new Date().toISOString(),
      },
    });

    logger.info(`Deposit initiated for user ${userId}: ${transaction.id} (${amount} ${currency})`);

    res.status(201).json({
      success: true,
      message: 'Deposit initiated successfully',
      deposit: {
        depositId: transaction.id,
        referenceId: transaction.referenceId,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        destination,
        processingTime: '5-30 minutes depending on method',
        nextStep: 'Payment processor integration will be added',
      },
    });
  } catch (error: any) {
    logger.error('Error initiating deposit:', error);
    res.status(500).json({
      error: 'Failed to initiate deposit',
      details: error.message,
    });
  }
});

/**
 * POST /api/wallet/withdraw/initiate
 * Start a withdrawal transaction
 */
router.post('/withdraw/initiate', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId || req.query.userId as string;
    const {
      amount,
      recipientType,
      bankAccountId,
      username,
      email,
      mobilePhone,
      description,
    } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!recipientType) {
      return res.status(400).json({ error: 'Recipient type is required' });
    }

    const validTypes = ['bank_account', 'username', 'email', 'mobile_money'];
    if (!validTypes.includes(recipientType)) {
      return res.status(400).json({
        error: `Invalid recipient type. Valid values: ${validTypes.join(', ')}`,
      });
    }

    // Validate recipient based on type
    if (recipientType === 'bank_account' && !bankAccountId) {
      return res.status(400).json({ error: 'Bank account ID is required for bank account withdrawal' });
    }
    if (recipientType === 'username' && !username) {
      return res.status(400).json({ error: 'Username is required for username withdrawal' });
    }
    if (recipientType === 'email' && !email) {
      return res.status(400).json({ error: 'Email is required for email withdrawal' });
    }
    if (recipientType === 'mobile_money' && !mobilePhone) {
      return res.status(400).json({ error: 'Mobile phone is required for mobile money withdrawal' });
    }

    // Generate reference ID
    const referenceId = `WD-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // Determine fee based on recipient type
    let fee = 0;
    let processingTime = '1-2 business days';

    if (recipientType === 'username') {
      fee = 0;
      processingTime = 'Instant';
    } else if (recipientType === 'email') {
      fee = 0;
      processingTime = '5-10 minutes';
    } else if (recipientType === 'bank_account') {
      // Fee will be calculated based on bank and amount
      fee = amount * 0.01; // 1% for demo
      processingTime = '1-3 business days';
    } else if (recipientType === 'mobile_money') {
      fee = amount * 0.015; // 1.5% for demo
      processingTime = '5-30 minutes';
    }

    const netAmount = amount - fee;

    // Create transaction record
    const transaction = await walletDatabaseService.createTransaction({
      userId,
      transactionType: 'withdrawal',
      amount,
      currency: 'USD',
      status: 'pending',
      withdrawalMethod: recipientType,
      feeAmount: fee,
      netAmount,
      bankAccountId,
      recipientUsername: username,
      recipientEmail: email,
      recipientPhone: mobilePhone,
      description: description || `Withdrawal to ${recipientType}`,
      referenceId,
      metadata: {
        recipientType,
        initiatedAt: new Date().toISOString(),
      },
    });

    logger.info(`Withdrawal initiated for user ${userId}: ${transaction.id} (${amount} USD)`);

    res.status(201).json({
      success: true,
      message: 'Withdrawal initiated successfully',
      withdrawal: {
        withdrawalId: transaction.id,
        referenceId: transaction.referenceId,
        amount: transaction.amount,
        fee: transaction.feeAmount,
        netAmount: transaction.netAmount,
        status: transaction.status,
        recipientType,
        processingTime,
        nextStep: 'Proceed to 2FA verification',
      },
    });
  } catch (error: any) {
    logger.error('Error initiating withdrawal:', error);
    res.status(500).json({
      error: 'Failed to initiate withdrawal',
      details: error.message,
    });
  }
});

/**
 * GET /api/wallet/transactions
 * Get transaction history
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId || req.query.userId as string;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;

    const result = await walletDatabaseService.getTransactions(userId, {
      limit,
      offset,
      status,
      type,
      dateFrom,
      dateTo,
    });

    res.json({
      success: true,
      transactions: result.transactions,
      pagination: {
        limit,
        offset,
        total: result.total,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching transactions:', error);
    res.status(500).json({
      error: 'Failed to fetch transactions',
      details: error.message,
    });
  }
});

/**
 * GET /api/wallet/transactions/:id
 * Get a specific transaction
 */
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId || req.query.userId as string;
    const { id } = req.params;

    const transaction = await walletDatabaseService.getTransaction(id, userId);

    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction not found',
      });
    }

    res.json({
      success: true,
      transaction,
    });
  } catch (error: any) {
    logger.error('Error fetching transaction:', error);
    res.status(500).json({
      error: 'Failed to fetch transaction',
      details: error.message,
    });
  }
});

/**
 * POST /api/wallet/withdraw/confirm
 * Confirm withdrawal with 2FA
 */
router.post('/withdraw/confirm', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId || req.query.userId as string;
    const { withdrawalId, verificationCode } = req.body;

    if (!withdrawalId || !verificationCode) {
      return res.status(400).json({
        error: 'Withdrawal ID and verification code are required',
      });
    }

    const transaction = await walletDatabaseService.getTransaction(withdrawalId, userId);

    if (!transaction) {
      return res.status(404).json({
        error: 'Withdrawal not found',
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        error: 'Withdrawal cannot be confirmed - it is already processing or completed',
      });
    }

    // In a real implementation, verify the 2FA code here
    // For now, we'll just mark it as processing
    const updated = await walletDatabaseService.updateTransactionStatus(withdrawalId, userId, 'processing', {
      verifiedAt: new Date().toISOString(),
      verificationMethod: '2FA',
    });

    logger.info(`Withdrawal confirmed for user ${userId}: ${withdrawalId}`);

    res.json({
      success: true,
      message: 'Withdrawal confirmed and processing',
      withdrawal: {
        withdrawalId: updated?.id,
        status: updated?.status,
        processingTime: '1-3 business days',
      },
    });
  } catch (error: any) {
    logger.error('Error confirming withdrawal:', error);
    res.status(500).json({
      error: 'Failed to confirm withdrawal',
      details: error.message,
    });
  }
});

/**
 * POST /api/wallet/withdraw/cancel/:id
 * Cancel a pending withdrawal
 */
router.post('/withdraw/cancel/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId || req.query.userId as string;
    const { id } = req.params;

    const transaction = await walletDatabaseService.getTransaction(id, userId);

    if (!transaction) {
      return res.status(404).json({
        error: 'Withdrawal not found',
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        error: 'Only pending withdrawals can be cancelled',
      });
    }

    const updated = await walletDatabaseService.updateTransactionStatus(id, userId, 'cancelled', {
      cancelledAt: new Date().toISOString(),
      cancelReason: req.body.reason || 'User requested cancellation',
    });

    logger.info(`Withdrawal cancelled for user ${userId}: ${id}`);

    res.json({
      success: true,
      message: 'Withdrawal cancelled successfully',
      withdrawal: updated,
    });
  } catch (error: any) {
    logger.error('Error cancelling withdrawal:', error);
    res.status(500).json({
      error: 'Failed to cancel withdrawal',
      details: error.message,
    });
  }
});

/**
 * GET /api/wallet/transactions/export
 * Export transactions as CSV
 */
router.get('/export/csv', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId || req.query.userId as string;
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;

    const result = await walletDatabaseService.getTransactions(userId, {
      limit: 1000,
      offset: 0,
      dateFrom,
      dateTo,
    });

    // Convert to CSV
    const headers = [
      'Transaction ID',
      'Reference ID',
      'Type',
      'Amount',
      'Currency',
      'Fee',
      'Net Amount',
      'Status',
      'Method',
      'Recipient',
      'Description',
      'Created At',
    ];

    const rows = result.transactions.map((tx) => [
      tx.id,
      tx.referenceId,
      tx.transactionType,
      tx.amount,
      tx.currency,
      tx.feeAmount || 0,
      tx.netAmount || tx.amount,
      tx.status,
      tx.depositMethod || tx.withdrawalMethod,
      tx.recipientUsername || tx.recipientEmail || tx.recipientPhone || 'N/A',
      tx.description,
      new Date(tx.metadata?.initiatedAt || '').toLocaleString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
    res.send(csv);

    logger.info(`Transactions exported for user ${userId}`);
  } catch (error: any) {
    logger.error('Error exporting transactions:', error);
    res.status(500).json({
      error: 'Failed to export transactions',
      details: error.message,
    });
  }
});

export default router;
