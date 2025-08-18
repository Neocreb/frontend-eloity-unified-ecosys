import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  processFlutterwavePayment,
  processPaystackPayment,
  processMTNMoMoPayment,
  processOrangeMoneyPayment,
  verifyBankAccount,
  getExchangeRates,
  detectUserLocation
} from '../services/paymentService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// =============================================================================
// AFRICAN PAYMENT PROCESSORS
// =============================================================================

// Flutterwave payment initiation (34+ African countries)
router.post('/flutterwave/initiate', authenticateToken, async (req, res) => {
  try {
    const { amount, currency, purpose, metadata } = req.body;
    const userId = req.userId;

    if (!amount || !currency) {
      return res.status(400).json({ error: 'Amount and currency are required' });
    }

    const paymentData = {
      userId,
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      purpose: purpose || 'platform_payment',
      metadata: {
        user_id: userId,
        ...metadata
      }
    };

    const result = await processFlutterwavePayment(paymentData);

    if (result.success) {
      logger.info('Flutterwave payment initiated', { userId, amount, currency });
      res.json({
        success: true,
        paymentUrl: result.paymentUrl,
        reference: result.reference,
        paymentMethods: result.availablePaymentMethods
      });
    } else {
      res.status(400).json({ 
        error: 'Payment initiation failed', 
        details: result.error 
      });
    }
  } catch (error) {
    logger.error('Flutterwave payment error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Flutterwave webhook handler
router.post('/flutterwave/webhook', async (req, res) => {
  try {
    const event = req.body;
    const signature = req.headers['verif-hash'];

    // Verify webhook signature
    if (signature !== process.env.FLUTTERWAVE_SECRET_HASH) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    switch (event.event) {
      case 'charge.completed':
        await handleFlutterwavePaymentSuccess(event.data);
        break;
      case 'charge.failed':
        await handleFlutterwavePaymentFailure(event.data);
        break;
      default:
        logger.info('Unhandled Flutterwave event:', event.event);
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Flutterwave webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Paystack payment initiation (Nigeria, Ghana, South Africa)
router.post('/paystack/initiate', authenticateToken, async (req, res) => {
  try {
    const { amount, currency, channels, metadata } = req.body;
    const userId = req.userId;

    const paymentData = {
      userId,
      amount: parseFloat(amount) * 100, // Convert to kobo/pesewas
      currency: currency.toUpperCase(),
      channels: channels || ['card', 'bank', 'ussd', 'mobile_money'],
      metadata: {
        user_id: userId,
        ...metadata
      }
    };

    const result = await processPaystackPayment(paymentData);

    if (result.success) {
      logger.info('Paystack payment initiated', { userId, amount, currency });
      res.json({
        success: true,
        authorizationUrl: result.authorizationUrl,
        accessCode: result.accessCode,
        reference: result.reference
      });
    } else {
      res.status(400).json({ 
        error: 'Payment initiation failed', 
        details: result.error 
      });
    }
  } catch (error) {
    logger.error('Paystack payment error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Paystack webhook handler
router.post('/paystack/webhook', async (req, res) => {
  try {
    const event = req.body;
    const signature = req.headers['x-paystack-signature'];

    // Verify webhook signature
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(event))
      .digest('hex');

    if (hash !== signature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    switch (event.event) {
      case 'charge.success':
        await handlePaystackPaymentSuccess(event.data);
        break;
      case 'charge.failed':
        await handlePaystackPaymentFailure(event.data);
        break;
      default:
        logger.info('Unhandled Paystack event:', event.event);
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Paystack webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// MTN Mobile Money payment initiation
router.post('/mtn-momo/initiate', authenticateToken, async (req, res) => {
  try {
    const { amount, currency, phoneNumber, narration } = req.body;
    const userId = req.userId;

    if (!phoneNumber || !amount || !currency) {
      return res.status(400).json({ 
        error: 'Phone number, amount and currency are required' 
      });
    }

    const paymentData = {
      userId,
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      phoneNumber: phoneNumber.replace(/\s+/g, ''),
      narration: narration || 'Softchat platform payment'
    };

    const result = await processMTNMoMoPayment(paymentData);

    if (result.success) {
      logger.info('MTN MoMo payment initiated', { userId, phoneNumber, amount });
      res.json({
        success: true,
        transactionId: result.transactionId,
        status: result.status,
        message: 'Payment request sent to your phone'
      });
    } else {
      res.status(400).json({ 
        error: 'Mobile money payment failed', 
        details: result.error 
      });
    }
  } catch (error) {
    logger.error('MTN MoMo payment error:', error);
    res.status(500).json({ error: 'Mobile money payment failed' });
  }
});

// Orange Money payment initiation
router.post('/orange-money/initiate', authenticateToken, async (req, res) => {
  try {
    const { amount, currency, returnUrl, language } = req.body;
    const userId = req.userId;

    const paymentData = {
      userId,
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      returnUrl: returnUrl || `${process.env.FRONTEND_URL}/payment/success`,
      cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`,
      language: language || 'fr'
    };

    const result = await processOrangeMoneyPayment(paymentData);

    if (result.success) {
      logger.info('Orange Money payment initiated', { userId, amount, currency });
      res.json({
        success: true,
        paymentUrl: result.paymentUrl,
        paymentToken: result.paymentToken,
        orderId: result.orderId
      });
    } else {
      res.status(400).json({ 
        error: 'Orange Money payment failed', 
        details: result.error 
      });
    }
  } catch (error) {
    logger.error('Orange Money payment error:', error);
    res.status(500).json({ error: 'Orange Money payment failed' });
  }
});

// =============================================================================
// BANK ACCOUNT VERIFICATION
// =============================================================================

// Verify bank account (Nigeria, Kenya, South Africa, Ghana)
router.post('/verify-bank-account', authenticateToken, async (req, res) => {
  try {
    const { accountNumber, bankCode, country } = req.body;
    const userId = req.userId;

    if (!accountNumber || !bankCode || !country) {
      return res.status(400).json({ 
        error: 'Account number, bank code, and country are required' 
      });
    }

    const verificationData = {
      userId,
      accountNumber,
      bankCode,
      country: country.toUpperCase()
    };

    const result = await verifyBankAccount(verificationData);

    if (result.success) {
      logger.info('Bank account verified', { userId, accountNumber, country });
      res.json({
        success: true,
        accountName: result.accountName,
        accountType: result.accountType,
        bankName: result.bankName,
        verified: true
      });
    } else {
      res.status(400).json({ 
        error: 'Bank account verification failed', 
        details: result.error 
      });
    }
  } catch (error) {
    logger.error('Bank verification error:', error);
    res.status(500).json({ error: 'Bank verification failed' });
  }
});

// Get bank list by country
router.get('/banks/:country', async (req, res) => {
  try {
    const { country } = req.params;
    
    const bankLists = {
      'NG': await getNigerianBanks(),
      'KE': await getKenyanBanks(),
      'GH': await getGhanaianBanks(),
      'ZA': await getSouthAfricanBanks(),
      'UG': await getUgandanBanks(),
      'TZ': await getTanzanianBanks()
    };

    const banks = bankLists[country.toUpperCase()];
    
    if (!banks) {
      return res.status(404).json({ error: 'Country not supported' });
    }

    res.json({ banks });
  } catch (error) {
    logger.error('Bank list fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch bank list' });
  }
});

// =============================================================================
// CURRENCY AND EXCHANGE RATES
// =============================================================================

// Get current exchange rates for African currencies
router.get('/exchange-rates', async (req, res) => {
  try {
    const { baseCurrency, targetCurrencies } = req.query;
    
    const rates = await getExchangeRates(
      baseCurrency || 'USD',
      targetCurrencies ? targetCurrencies.split(',') : [
        'NGN', 'KES', 'GHS', 'ZAR', 'UGX', 'TZS', 'XOF', 'XAF'
      ]
    );

    res.json({
      baseCurrency: baseCurrency || 'USD',
      rates,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Exchange rates fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
});

// =============================================================================
// PAYMENT METHOD DETECTION
// =============================================================================

// Detect optimal payment methods based on user location
router.get('/payment-methods', authenticateToken, async (req, res) => {
  try {
    const { country, amount, currency } = req.query;
    const userId = req.userId;

    // Detect user location if not provided
    const userCountry = country || await detectUserLocation(req.ip);
    
    const paymentMethods = getAvailablePaymentMethods(
      userCountry,
      parseFloat(amount || 0),
      currency || 'USD'
    );

    res.json({
      country: userCountry,
      paymentMethods,
      recommended: paymentMethods.filter(method => method.recommended)
    });
  } catch (error) {
    logger.error('Payment methods detection error:', error);
    res.status(500).json({ error: 'Failed to detect payment methods' });
  }
});

// =============================================================================
// TRANSACTION HISTORY AND STATUS
// =============================================================================

// Get payment transaction history
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0, status, provider } = req.query;
    const userId = req.userId;

    const transactions = await getPaymentTransactions(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      status,
      provider
    });

    res.json({
      transactions,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: transactions.length
      }
    });
  } catch (error) {
    logger.error('Transaction history error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Check transaction status
router.get('/transactions/:transactionId/status', authenticateToken, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.userId;

    const transaction = await getTransactionStatus(transactionId, userId);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      transactionId,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      provider: transaction.provider,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      metadata: transaction.metadata
    });
  } catch (error) {
    logger.error('Transaction status error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction status' });
  }
});

// =============================================================================
// HELPER FUNCTIONS FOR PAYMENT PROCESSING
// =============================================================================

async function handleFlutterwavePaymentSuccess(data) {
  try {
    const { tx_ref, flw_ref, amount, currency, customer } = data;
    
    // Update transaction status in database
    await updateTransactionStatus(tx_ref, 'completed', {
      flutterwaveRef: flw_ref,
      amount,
      currency,
      customer
    });

    // Credit user wallet
    await creditUserWallet(customer.email, amount, currency);

    // Send success notification
    await sendPaymentNotification(customer.email, 'success', {
      amount,
      currency,
      reference: tx_ref
    });

    logger.info('Flutterwave payment completed', { tx_ref, amount, currency });
  } catch (error) {
    logger.error('Flutterwave success handler error:', error);
  }
}

async function handlePaystackPaymentSuccess(data) {
  try {
    const { reference, amount, currency, customer } = data;
    
    // Update transaction status
    await updateTransactionStatus(reference, 'completed', {
      paystackRef: data.id,
      amount: amount / 100, // Convert from kobo
      currency,
      customer
    });

    // Credit user wallet
    await creditUserWallet(customer.email, amount / 100, currency);

    // Send success notification
    await sendPaymentNotification(customer.email, 'success', {
      amount: amount / 100,
      currency,
      reference
    });

    logger.info('Paystack payment completed', { reference, amount, currency });
  } catch (error) {
    logger.error('Paystack success handler error:', error);
  }
}

function getAvailablePaymentMethods(country, amount, currency) {
  const methods = [];

  switch (country) {
    case 'NG': // Nigeria
      methods.push(
        { id: 'flutterwave', name: 'Flutterwave', types: ['card', 'bank', 'ussd'], recommended: true },
        { id: 'paystack', name: 'Paystack', types: ['card', 'bank', 'transfer'], recommended: true },
        { id: 'bank_transfer', name: 'Bank Transfer', types: ['transfer'], recommended: false }
      );
      break;
    
    case 'KE': // Kenya
      methods.push(
        { id: 'flutterwave', name: 'Flutterwave', types: ['card', 'mpesa'], recommended: true },
        { id: 'mtn_momo', name: 'MTN Mobile Money', types: ['mobile_money'], recommended: false }
      );
      break;
    
    case 'GH': // Ghana
      methods.push(
        { id: 'flutterwave', name: 'Flutterwave', types: ['card', 'mobile_money'], recommended: true },
        { id: 'paystack', name: 'Paystack', types: ['card', 'mobile_money'], recommended: true }
      );
      break;
    
    case 'ZA': // South Africa
      methods.push(
        { id: 'flutterwave', name: 'Flutterwave', types: ['card', 'bank'], recommended: true },
        { id: 'paystack', name: 'Paystack', types: ['card', 'bank'], recommended: true }
      );
      break;
    
    default: // Other countries
      methods.push(
        { id: 'flutterwave', name: 'Flutterwave', types: ['card'], recommended: true },
        { id: 'stripe', name: 'Stripe', types: ['card'], recommended: false }
      );
  }

  return methods;
}

export default router;
