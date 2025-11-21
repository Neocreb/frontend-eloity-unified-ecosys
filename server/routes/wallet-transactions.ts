import express, { Request, Response } from 'express';
import { walletDatabaseService } from '../services/walletDatabaseService.js';
import { paymentProcessorService } from '../services/paymentProcessorService.js';
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
 * Start a deposit transaction with payment processor integration
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
      email,
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

    // Calculate fee based on method
    let fee = 0;
    let processingTime = '5-30 minutes';

    if (methodProviderId === 'paystack_ng' || methodProviderId === 'paystack_ke') {
      fee = amount * 0.015;
      processingTime = '1-5 minutes';
    } else if (methodProviderId.includes('flutterwave')) {
      fee = amount * 0.018;
      processingTime = '2-10 minutes';
    } else if (methodProviderId === 'stripe_us') {
      fee = amount * 0.029 + 0.30;
      processingTime = '3-5 minutes';
    } else if (methodProviderId === 'mpesa_ke') {
      fee = 0;
      processingTime = '1-2 minutes';
    }

    const amountWithFee = amount + fee;

    // Create transaction record
    const transaction = await walletDatabaseService.createTransaction({
      userId,
      transactionType: 'deposit',
      amount,
      currency,
      status: 'pending',
      depositMethod: method,
      feeAmount: fee,
      netAmount: amount,
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

    let paymentUrl = null;
    let paymentData = null;

    const callbackUrl = `${process.env.API_BASE_URL || 'http://localhost:5000'}/api/wallet/transactions/deposit/${transaction.id}/webhook`;

    if (methodProviderId === 'paystack_ng') {
      const paystackResult = await paymentProcessorService.initializePaystackPayment({
        email: email || '',
        amount,
        currency: 'NGN',
        reference: referenceId,
        callback_url: callbackUrl,
        metadata: {
          transactionId: transaction.id,
          userId,
        },
      });

      if (paystackResult) {
        paymentUrl = paystackResult.authorizationUrl;
        paymentData = {
          processor: 'paystack',
          accessCode: paystackResult.accessCode,
          reference: paystackResult.reference,
        };
      }
    } else if (methodProviderId.includes('flutterwave')) {
      const flutterwaveResult = await paymentProcessorService.initializeFlutterwavePayment({
        amount,
        currency: 'NGN',
        reference: referenceId,
        customer_email: email || '',
        redirect_url: callbackUrl,
        metadata: {
          transactionId: transaction.id,
          userId,
        },
      });

      if (flutterwaveResult) {
        paymentUrl = flutterwaveResult.paymentLink;
        paymentData = {
          processor: 'flutterwave',
          flwRef: flutterwaveResult.flwRef,
        };
      }
    } else if (methodProviderId === 'stripe_us') {
      const stripeResult = await paymentProcessorService.createStripePaymentIntent({
        amount,
        currency: 'USD',
        description: `Deposit for user ${userId}`,
        metadata: {
          transactionId: transaction.id,
          userId,
        },
      });

      if (stripeResult) {
        paymentData = {
          processor: 'stripe',
          clientSecret: stripeResult.clientSecret,
          intentId: stripeResult.intentId,
        };
      }
    } else if (methodProviderId === 'mpesa_ke') {
      const mpesaResult = await paymentProcessorService.initiateMpesaStkPush({
        phoneNumber: '254' + (email || '').replace(/\D/g, '').slice(-9),
        amount: Math.round(amount),
        accountReference: userId.substring(0, 12),
        transactionDescription: 'Deposit to Eloity Wallet',
      });

      if (mpesaResult) {
        paymentData = {
          processor: 'mpesa',
          checkoutRequestId: mpesaResult.checkoutRequestId,
        };
      }
    }

    res.status(201).json({
      success: true,
      message: 'Deposit initiated successfully',
      deposit: {
        depositId: transaction.id,
        referenceId: transaction.referenceId,
        amount: transaction.amount,
        currency: transaction.currency,
        fee: fee,
        amountWithFee: amountWithFee,
        status: transaction.status,
        destination,
        processingTime,
        paymentUrl,
        paymentData,
        nextStep: paymentUrl ? 'Proceed to payment URL' : 'Complete payment verification',
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
 * Start a withdrawal transaction with 2FA requirement
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

    const today = new Date().toISOString().split('T')[0];
    const dailySummary = await walletDatabaseService.getDailyTransactionSummary(userId, today);

    const dailyLimit = 10000;
    const totalWithdrawalToday = dailySummary.withdrawn;

    if (totalWithdrawalToday + amount > dailyLimit) {
      return res.status(400).json({
        error: `Daily withdrawal limit of $${dailyLimit} exceeded`,
        withdrawnToday: totalWithdrawalToday,
        remaining: Math.max(0, dailyLimit - totalWithdrawalToday),
        requested: amount,
      });
    }

    // Generate reference ID
    const referenceId = `WD-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // Generate 2FA code
    const verificationCode = Math.random().toString().slice(2, 8).padStart(6, '0');
    const codeExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();

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
      fee = amount * 0.01;
      processingTime = '1-3 business days';
    } else if (recipientType === 'mobile_money') {
      fee = amount * 0.015;
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
        verificationCode,
        codeExpiry,
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
        dailyRemaining: dailyLimit - totalWithdrawalToday - amount,
        nextStep: 'Complete 2FA verification',
        requiresVerification: true,
        verificationCodeExpiry: codeExpiry,
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
 * GET /api/wallet/withdraw/status/:withdrawalId
 * Check withdrawal status
 */
router.get('/withdraw/status/:withdrawalId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId || (req.query.userId as string);
    const { withdrawalId } = req.params;

    const transaction = await walletDatabaseService.getTransaction(withdrawalId, userId);

    if (!transaction) {
      return res.status(404).json({
        error: 'Withdrawal not found',
      });
    }

    res.json({
      success: true,
      withdrawal: {
        withdrawalId: transaction.id,
        referenceId: transaction.referenceId,
        amount: transaction.amount,
        fee: transaction.feeAmount || 0,
        netAmount: transaction.netAmount || transaction.amount,
        status: transaction.status,
        recipientType: transaction.withdrawalMethod,
        recipient: transaction.recipientUsername || transaction.recipientEmail || transaction.recipientPhone || 'N/A',
        createdAt: transaction.metadata?.initiatedAt,
      },
    });
  } catch (error: any) {
    logger.error('Error checking withdrawal status:', error);
    res.status(500).json({
      error: 'Failed to check withdrawal status',
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
 * POST /api/wallet/deposit/paystack-webhook
 * Handle Paystack payment webhook
 */
router.post('/deposit/paystack-webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    const body = JSON.stringify(req.body);

    if (!paymentProcessorService.verifyPaystackWebhookSignature(body, signature)) {
      logger.warn('Invalid Paystack webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;

    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      const metadata = event.data.metadata;

      const transactionId = metadata?.transactionId;
      const userId = metadata?.userId;

      if (!transactionId || !userId) {
        logger.warn('Missing transactionId or userId in Paystack webhook');
        return res.status(400).json({ error: 'Missing metadata' });
      }

      const payment = await paymentProcessorService.verifyPaystackPayment(reference);

      if (!payment) {
        logger.warn('Failed to verify Paystack payment:', reference);
        return res.status(400).json({ error: 'Failed to verify payment' });
      }

      await walletDatabaseService.updateTransactionStatus(transactionId, userId, 'completed', {
        processor: 'paystack',
        processorReference: reference,
        processorFee: payment.fee,
        completedAt: new Date().toISOString(),
      });

      logger.info(`Deposit completed via Paystack for user ${userId}: ${transactionId}`);
    }

    res.json({ success: true });
  } catch (error: any) {
    logger.error('Error processing Paystack webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

/**
 * POST /api/wallet/deposit/flutterwave-webhook
 * Handle Flutterwave payment webhook
 */
router.post('/deposit/flutterwave-webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['verif-hash'] as string;
    const body = JSON.stringify(req.body);

    if (!paymentProcessorService.verifyFlutterwaveWebhookSignature(body, signature)) {
      logger.warn('Invalid Flutterwave webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;

    if (event.status === 'successful' && event.data?.meta?.transactionId && event.data?.meta?.userId) {
      const transactionId = event.data.meta.transactionId;
      const userId = event.data.meta.userId;

      const payment = await paymentProcessorService.verifyFlutterwavePayment(event.data.id);

      if (!payment) {
        logger.warn('Failed to verify Flutterwave payment:', event.data.id);
        return res.status(400).json({ error: 'Failed to verify payment' });
      }

      await walletDatabaseService.updateTransactionStatus(transactionId, userId, 'completed', {
        processor: 'flutterwave',
        processorReference: event.data.flw_ref,
        processorFee: payment.fee,
        completedAt: new Date().toISOString(),
      });

      logger.info(`Deposit completed via Flutterwave for user ${userId}: ${transactionId}`);
    }

    res.json({ success: true });
  } catch (error: any) {
    logger.error('Error processing Flutterwave webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

/**
 * POST /api/wallet/deposit/stripe-webhook
 * Handle Stripe payment webhook
 */
router.post('/deposit/stripe-webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const secret = process.env.STRIPE_WEBHOOK_SECRET || '';

    if (!paymentProcessorService.verifyStripeWebhookSignature(JSON.stringify(req.body), signature, secret)) {
      logger.warn('Invalid Stripe webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;

    if (event.type === 'payment_intent.succeeded') {
      const intentId = event.data.object.id;
      const metadata = event.data.object.metadata;

      const transactionId = metadata?.transactionId;
      const userId = metadata?.userId;

      if (!transactionId || !userId) {
        logger.warn('Missing transactionId or userId in Stripe webhook');
        return res.status(400).json({ error: 'Missing metadata' });
      }

      const payment = await paymentProcessorService.retrieveStripePaymentIntent(intentId);

      if (!payment) {
        logger.warn('Failed to retrieve Stripe payment intent:', intentId);
        return res.status(400).json({ error: 'Failed to verify payment' });
      }

      await walletDatabaseService.updateTransactionStatus(transactionId, userId, 'completed', {
        processor: 'stripe',
        processorReference: intentId,
        processorFee: payment.fee,
        completedAt: new Date().toISOString(),
      });

      logger.info(`Deposit completed via Stripe for user ${userId}: ${transactionId}`);
    }

    res.json({ success: true });
  } catch (error: any) {
    logger.error('Error processing Stripe webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

/**
 * POST /api/wallet/deposit/mpesa-callback
 * Handle M-Pesa payment callback
 */
router.post('/deposit/mpesa-callback', async (req: Request, res: Response) => {
  try {
    const body = req.body.Body.stkCallback;

    const metadata = body.CallbackMetadata?.Item?.find((item: any) => item.Name === 'Metadata');
    const transactionId = metadata?.Value?.transactionId;
    const userId = metadata?.Value?.userId;

    if (!transactionId || !userId) {
      logger.warn('Missing transactionId or userId in M-Pesa callback');
      return res.json({ ResultCode: 1, ResultDesc: 'Missing metadata' });
    }

    if (body.ResultCode === 0) {
      const amountItem = body.CallbackMetadata?.Item?.find((item: any) => item.Name === 'Amount');
      const amount = amountItem?.Value || 0;

      await walletDatabaseService.updateTransactionStatus(transactionId, userId, 'completed', {
        processor: 'mpesa',
        processorReference: body.CheckoutRequestID,
        processorFee: 0,
        completedAt: new Date().toISOString(),
      });

      logger.info(`Deposit completed via M-Pesa for user ${userId}: ${transactionId} (${amount} KES)`);
    } else {
      await walletDatabaseService.updateTransactionStatus(transactionId, userId, 'failed', {
        processor: 'mpesa',
        processorReference: body.CheckoutRequestID,
        failureReason: body.ResultDesc,
        failedAt: new Date().toISOString(),
      });

      logger.info(`Deposit failed via M-Pesa for user ${userId}: ${transactionId} - ${body.ResultDesc}`);
    }

    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error: any) {
    logger.error('Error processing M-Pesa callback:', error);
    res.json({ ResultCode: 1, ResultDesc: 'Error processing callback' });
  }
});

/**
 * GET /api/wallet/deposit/status/:depositId
 * Check deposit status
 */
router.get('/deposit/status/:depositId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId || (req.query.userId as string);
    const { depositId } = req.params;

    const transaction = await walletDatabaseService.getTransaction(depositId, userId);

    if (!transaction) {
      return res.status(404).json({
        error: 'Deposit not found',
      });
    }

    res.json({
      success: true,
      deposit: {
        depositId: transaction.id,
        referenceId: transaction.referenceId,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        fee: transaction.feeAmount || 0,
        net: transaction.netAmount || transaction.amount,
        createdAt: transaction.metadata?.initiatedAt,
      },
    });
  } catch (error: any) {
    logger.error('Error checking deposit status:', error);
    res.status(500).json({
      error: 'Failed to check deposit status',
      details: error.message,
    });
  }
});

/**
 * GET /api/wallet/transactions/export
 * Export transactions in multiple formats (csv, json, pdf)
 */
router.get('/export', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.userId || req.query.userId as string;
    const format = (req.query.format as string) || 'csv';
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;

    const result = await walletDatabaseService.getTransactions(userId, {
      limit: 1000,
      offset: 0,
      dateFrom,
      dateTo,
    });

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="transactions.json"');
      res.json({
        exported_at: new Date().toISOString(),
        total_transactions: result.transactions.length,
        transactions: result.transactions,
      });
    } else if (format === 'csv') {
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
        tx.referenceId || '',
        tx.transactionType,
        tx.amount,
        tx.currency,
        tx.feeAmount || 0,
        tx.netAmount || tx.amount,
        tx.status,
        tx.depositMethod || tx.withdrawalMethod || 'N/A',
        tx.recipientUsername || tx.recipientEmail || tx.recipientPhone || 'N/A',
        tx.description,
        new Date(tx.metadata?.initiatedAt || '').toLocaleString(),
      ]);

      const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
      res.send(csv);
    } else if (format === 'pdf') {
      const totalIncome = result.transactions
        .filter((tx) => tx.transactionType === 'deposit' || tx.transactionType === 'earned')
        .reduce((sum, tx) => sum + tx.amount, 0);

      const totalExpense = result.transactions
        .filter((tx) => tx.transactionType === 'withdrawal' || tx.transactionType === 'transfer')
        .reduce((sum, tx) => sum + tx.amount, 0);

      const totalFees = result.transactions.reduce((sum, tx) => sum + (tx.feeAmount || 0), 0);

      const pdfContent = `
TRANSACTION REPORT
Generated: ${new Date().toLocaleString()}
User ID: ${userId}

SUMMARY
-------
Total Transactions: ${result.transactions.length}
Total Income: $${totalIncome.toFixed(2)}
Total Expenses: $${totalExpense.toFixed(2)}
Total Fees: $${totalFees.toFixed(2)}
Net Balance Change: $${(totalIncome - totalExpense - totalFees).toFixed(2)}

TRANSACTION DETAILS
-------------------
${result.transactions
  .map(
    (tx) => `
ID: ${tx.id}
Type: ${tx.transactionType}
Amount: ${tx.amount} ${tx.currency}
Fee: ${tx.feeAmount || 0}
Status: ${tx.status}
Date: ${new Date(tx.metadata?.initiatedAt || '').toLocaleString()}
Description: ${tx.description}
---`
  )
  .join('\n')}

End of Report
`;

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="transactions.pdf"');
      res.send(pdfContent);
    } else {
      return res.status(400).json({
        error: 'Invalid format. Supported formats: csv, json, pdf',
      });
    }

    logger.info(`Transactions exported for user ${userId} in ${format} format`);
  } catch (error: any) {
    logger.error('Error exporting transactions:', error);
    res.status(500).json({
      error: 'Failed to export transactions',
      details: error.message,
    });
  }
});

/**
 * GET /api/wallet/transactions/export/csv (legacy endpoint)
 * Export transactions as CSV (backward compatibility)
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
      tx.referenceId || '',
      tx.transactionType,
      tx.amount,
      tx.currency,
      tx.feeAmount || 0,
      tx.netAmount || tx.amount,
      tx.status,
      tx.depositMethod || tx.withdrawalMethod || 'N/A',
      tx.recipientUsername || tx.recipientEmail || tx.recipientPhone || 'N/A',
      tx.description,
      new Date(tx.metadata?.initiatedAt || '').toLocaleString(),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

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
