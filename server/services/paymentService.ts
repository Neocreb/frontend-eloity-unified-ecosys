import crypto from 'crypto';
import { logger } from '../utils/logger.js';

// =============================================================================
// FLUTTERWAVE PAYMENT SERVICE
// =============================================================================

interface FlutterwavePaymentData {
  userId: string;
  amount: number;
  currency: string;
  purpose: string;
  metadata: any;
}

export async function processFlutterwavePayment(data: FlutterwavePaymentData) {
  try {
    const { userId, amount, currency, purpose, metadata } = data;
    
    // Get user details
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const txRef = `FLW_${Date.now()}_${userId}`;
    
    const payload = {
      tx_ref: txRef,
      amount: amount,
      currency: currency,
      redirect_url: `${process.env.FRONTEND_URL}/payment/callback/flutterwave`,
      payment_options: "card,mobilemoney,ussd,banktransfer",
      customer: {
        email: user.email,
        phonenumber: user.phone || '',
        name: user.full_name || user.username
      },
      customizations: {
        title: "Eloity Payment",
        description: purpose,
        logo: `${process.env.FRONTEND_URL}/logo.png`
      },
      meta: {
        user_id: userId,
        ...metadata
      }
    };

    // In production, make actual API call to Flutterwave
    if (process.env.NODE_ENV === 'production') {
      const response = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        // Save transaction to database
        await saveTransaction({
          reference: txRef,
          userId,
          amount,
          currency,
          provider: 'flutterwave',
          status: 'pending',
          metadata: payload
        });

        return {
          success: true,
          paymentUrl: result.data.link,
          reference: txRef,
          availablePaymentMethods: getFlutterwavePaymentMethods(currency)
        };
      } else {
        return {
          success: false,
          error: result.message || 'Payment initiation failed'
        };
      }
    } else {
      // Mock response for development
      await saveTransaction({
        reference: txRef,
        userId,
        amount,
        currency,
        provider: 'flutterwave',
        status: 'pending',
        metadata: payload
      });

      return {
        success: true,
        paymentUrl: `${process.env.FRONTEND_URL}/mock-payment?ref=${txRef}`,
        reference: txRef,
        availablePaymentMethods: getFlutterwavePaymentMethods(currency)
      };
    }
  } catch (error) {
    logger.error('Flutterwave payment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function getFlutterwavePaymentMethods(currency: string) {
  const methods = ['card', 'banktransfer'];
  
  // Add mobile money for African currencies
  if (['NGN', 'KES', 'GHS', 'UGX', 'RWF', 'ZMW'].includes(currency)) {
    methods.push('mobilemoney');
  }
  
  // Add USSD for Nigerian Naira
  if (currency === 'NGN') {
    methods.push('ussd');
  }
  
  return methods;
}

// =============================================================================
// PAYSTACK PAYMENT SERVICE
// =============================================================================

interface PaystackPaymentData {
  userId: string;
  amount: number; // in kobo/pesewas
  currency: string;
  channels: string[];
  metadata: any;
}

export async function processPaystackPayment(data: PaystackPaymentData) {
  try {
    const { userId, amount, currency, channels, metadata } = data;
    
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const reference = `PSK_${Date.now()}_${userId}`;
    
    const payload = {
      email: user.email,
      amount: amount,
      currency: currency,
      reference: reference,
      callback_url: `${process.env.FRONTEND_URL}/payment/callback/paystack`,
      channels: channels,
      metadata: {
        user_id: userId,
        ...metadata
      }
    };

    if (process.env.NODE_ENV === 'production') {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.status) {
        await saveTransaction({
          reference,
          userId,
          amount: amount / 100, // Convert from kobo
          currency,
          provider: 'paystack',
          status: 'pending',
          metadata: payload
        });

        return {
          success: true,
          authorizationUrl: result.data.authorization_url,
          accessCode: result.data.access_code,
          reference: result.data.reference
        };
      } else {
        return {
          success: false,
          error: result.message || 'Payment initiation failed'
        };
      }
    } else {
      // Mock response for development
      await saveTransaction({
        reference,
        userId,
        amount: amount / 100,
        currency,
        provider: 'paystack',
        status: 'pending',
        metadata: payload
      });

      return {
        success: true,
        authorizationUrl: `${process.env.FRONTEND_URL}/mock-payment?ref=${reference}`,
        accessCode: 'mock_access_code',
        reference: reference
      };
    }
  } catch (error) {
    logger.error('Paystack payment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// =============================================================================
// PAYSTACK VIRTUAL ACCOUNT SERVICE
// =============================================================================

interface PaystackCustomerData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface PaystackVirtualAccountData {
  userId: string;
  customerId: string;
  preferredBank?: string;
  bvn?: string;
}

/**
 * Create a customer in Paystack
 */
export async function createPaystackCustomer(data: PaystackCustomerData) {
  try {
    const { userId, email, firstName, lastName, phone } = data;

    if (process.env.NODE_ENV === 'production') {
      // Create customer in Paystack
      const response = await fetch('https://api.paystack.co/customer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          first_name: firstName,
          last_name: lastName,
          phone
        })
      });

      const result = await response.json();
      
      if (result.status) {
        logger.info('Paystack customer created', { userId, customerId: result.data.customer_code });
        
        return {
          success: true,
          customerId: result.data.customer_code,
          customerData: result.data
        };
      } else {
        return {
          success: false,
          error: result.message || 'Failed to create Paystack customer'
        };
      }
    } else {
      // Mock response for development
      const mockCustomerId = `CUS_mock_${Date.now()}_${userId}`;
      
      return {
        success: true,
        customerId: mockCustomerId,
        customerData: {
          customer_code: mockCustomerId,
          email,
          first_name: firstName,
          last_name: lastName,
          phone,
          metadata: { userId }
        }
      };
    }
  } catch (error) {
    logger.error('Paystack customer creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create a dedicated virtual account for a customer
 */
export async function createPaystackVirtualAccount(data: PaystackVirtualAccountData) {
  try {
    const { userId, customerId, preferredBank, bvn } = data;

    if (process.env.NODE_ENV === 'production') {
      // Create dedicated virtual account in Paystack
      const response = await fetch('https://api.paystack.co/dedicated_account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer: customerId,
          preferred_bank: preferredBank,
          bvn: bvn
        })
      });

      const result = await response.json();
      
      if (result.status) {
        logger.info('Paystack virtual account created', { userId, accountId: result.data.id });
        
        // Save virtual account to database
        await saveVirtualAccount({
          userId,
          accountId: result.data.id,
          accountNumber: result.data.account_number,
          bankName: result.data.bank.name,
          customerName: `${result.data.customer.first_name} ${result.data.customer.last_name}`,
          customerId: result.data.customer.customer_code,
          isActive: true,
          createdAt: new Date()
        });

        return {
          success: true,
          account: {
            id: result.data.id,
            accountNumber: result.data.account_number,
            bankName: result.data.bank.name,
            customerName: `${result.data.customer.first_name} ${result.data.customer.last_name}`,
            customerId: result.data.customer.customer_code
          }
        };
      } else {
        return {
          success: false,
          error: result.message || 'Failed to create virtual account'
        };
      }
    } else {
      // Mock response for development
      const mockAccountId = `VAC_mock_${Date.now()}_${userId}`;
      const mockAccountNumber = `00${Math.floor(Math.random() * 1000000000).toString().padStart(8, '0')}`;
      
      // Save virtual account to database
      await saveVirtualAccount({
        userId,
        accountId: mockAccountId,
        accountNumber: mockAccountNumber,
        bankName: preferredBank || 'Paystack Bank',
        customerName: 'Mock Customer',
        customerId: customerId,
        isActive: true,
        createdAt: new Date()
      });

      return {
        success: true,
        account: {
          id: mockAccountId,
          accountNumber: mockAccountNumber,
          bankName: preferredBank || 'Paystack Bank',
          customerName: 'Mock Customer',
          customerId: customerId
        }
      };
    }
  } catch (error) {
    logger.error('Paystack virtual account creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Save virtual account to database
 */
async function saveVirtualAccount(accountData: any) {
  try {
    // This would save to a virtual_accounts table in the database
    // For now, we'll just log it
    logger.info('Virtual account saved to database', accountData);
    return { success: true };
  } catch (error) {
    logger.error('Error saving virtual account to database:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user's virtual accounts
 */
export async function getUserVirtualAccounts(userId: string) {
  try {
    // This would fetch from a virtual_accounts table in the database
    // For now, we'll return an empty array
    logger.info('Fetching virtual accounts for user', { userId });
    return { success: true, accounts: [] };
  } catch (error) {
    logger.error('Error fetching virtual accounts:', error);
    return { success: false, error: error.message, accounts: [] };
  }
}

// =============================================================================
// MTN MOBILE MONEY SERVICE
// =============================================================================

interface MTNMoMoPaymentData {
  userId: string;
  amount: number;
  currency: string;
  phoneNumber: string;
  narration: string;
}

export async function processMTNMoMoPayment(data: MTNMoMoPaymentData) {
  try {
    const { userId, amount, currency, phoneNumber, narration } = data;
    
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const externalId = `MTN_${Date.now()}_${userId}`;
    const referenceId = generateUUID();
    
    const payload = {
      amount: amount.toString(),
      currency: currency,
      externalId: externalId,
      payer: {
        partyIdType: "MSISDN",
        partyId: phoneNumber.replace('+', '')
      },
      payerMessage: narration,
      payeeNote: "Eloity platform payment"
    };

    if (process.env.NODE_ENV === 'production') {
      // Get MTN MoMo access token
      const accessToken = await getMTNAccessToken();
      
      const response = await fetch(`${process.env.MTN_MOMO_BASE_URL}/collection/v1_0/requesttopay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Reference-Id': referenceId,
          'X-Target-Environment': process.env.MTN_MOMO_ENVIRONMENT || 'sandbox',
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_SUBSCRIPTION_KEY || ''
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await saveTransaction({
          reference: externalId,
          userId,
          amount,
          currency,
          provider: 'mtn_momo',
          status: 'pending',
          metadata: { ...payload, referenceId }
        });

        return {
          success: true,
          transactionId: externalId,
          status: 'pending',
          message: 'Payment request sent to your phone'
        };
      } else {
        const error = await response.text();
        return {
          success: false,
          error: `MTN MoMo payment failed: ${error}`
        };
      }
    } else {
      // Mock response for development
      await saveTransaction({
        reference: externalId,
        userId,
        amount,
        currency,
        provider: 'mtn_momo',
        status: 'pending',
        metadata: payload
      });

      return {
        success: true,
        transactionId: externalId,
        status: 'pending',
        message: 'Mock payment request sent'
      };
    }
  } catch (error) {
    logger.error('MTN MoMo payment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function getMTNAccessToken() {
  const credentials = Buffer.from(`${process.env.MTN_MOMO_API_USER}:${process.env.MTN_MOMO_API_KEY}`).toString('base64');
  
  const response = await fetch(`${process.env.MTN_MOMO_BASE_URL}/collection/token/`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_SUBSCRIPTION_KEY || ''
    }
  });

  const data = await response.json();
  return data.access_token;
}

// =============================================================================
// ORANGE MONEY SERVICE
// =============================================================================

interface OrangeMoneyPaymentData {
  userId: string;
  amount: number;
  currency: string;
  returnUrl: string;
  cancelUrl: string;
  language: string;
}

export async function processOrangeMoneyPayment(data: OrangeMoneyPaymentData) {
  try {
    const { userId, amount, currency, returnUrl, cancelUrl, language } = data;
    
    const user = await getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const orderId = `OM_${Date.now()}_${userId}`;
    
    const payload = {
      merchant_key: process.env.ORANGE_MONEY_MERCHANT_KEY,
      currency: currency,
      order_id: orderId,
      amount: amount,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notif_url: `${process.env.BACKEND_URL}/api/payments/orange-money/webhook`,
      lang: language,
      reference: `ELOITY_${Date.now()}`
    };

    if (process.env.NODE_ENV === 'production') {
      const accessToken = await getOrangeAccessToken();
      
      const response = await fetch(`${process.env.ORANGE_MONEY_BASE_URL}/webpayment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        await saveTransaction({
          reference: orderId,
          userId,
          amount,
          currency,
          provider: 'orange_money',
          status: 'pending',
          metadata: payload
        });

        return {
          success: true,
          paymentUrl: result.payment_url,
          paymentToken: result.payment_token,
          orderId: orderId
        };
      } else {
        return {
          success: false,
          error: result.message || 'Orange Money payment failed'
        };
      }
    } else {
      // Mock response for development
      await saveTransaction({
        reference: orderId,
        userId,
        amount,
        currency,
        provider: 'orange_money',
        status: 'pending',
        metadata: payload
      });

      return {
        success: true,
        paymentUrl: `${process.env.FRONTEND_URL}/mock-payment?ref=${orderId}`,
        paymentToken: 'mock_token',
        orderId: orderId
      };
    }
  } catch (error) {
    logger.error('Orange Money payment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function getOrangeAccessToken() {
  const credentials = `${process.env.ORANGE_MONEY_CLIENT_ID}:${process.env.ORANGE_MONEY_CLIENT_SECRET}`;
  const encodedCredentials = Buffer.from(credentials).toString('base64');
  
  const response = await fetch(`${process.env.ORANGE_MONEY_BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${encodedCredentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const data = await response.json();
  return data.access_token;
}

// =============================================================================
// BANK ACCOUNT VERIFICATION
// =============================================================================

interface BankVerificationData {
  userId: string;
  accountNumber: string;
  bankCode: string;
  country: string;
}

export async function verifyBankAccount(data: BankVerificationData) {
  try {
    const { userId, accountNumber, bankCode, country } = data;
    
    // Use different APIs based on country
    switch (country) {
      case 'NG':
        return await verifyNigerianBankAccount(accountNumber, bankCode);
      case 'KE':
        return await verifyKenyanBankAccount(accountNumber, bankCode);
      case 'GH':
        return await verifyGhanaianBankAccount(accountNumber, bankCode);
      case 'ZA':
        return await verifySouthAfricanBankAccount(accountNumber, bankCode);
      default:
        return {
          success: false,
          error: 'Country not supported for bank verification'
        };
    }
  } catch (error) {
    logger.error('Bank verification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function verifyNigerianBankAccount(accountNumber: string, bankCode: string) {
  if (process.env.NODE_ENV === 'production') {
    // Use Paystack bank verification API
    const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    const result = await response.json();
    
    if (result.status) {
      return {
        success: true,
        accountName: result.data.account_name,
        accountNumber: result.data.account_number,
        bankName: result.data.bank_name || 'Unknown Bank'
      };
    } else {
      return {
        success: false,
        error: result.message || 'Account verification failed'
      };
    }
  } else {
    // Mock response for development
    return {
      success: true,
      accountName: 'John Doe',
      accountNumber: accountNumber,
      bankName: 'First Bank of Nigeria'
    };
  }
}

async function verifyKenyanBankAccount(accountNumber: string, bankCode: string) {
  // Mock implementation - replace with actual Kenyan bank verification API
  return {
    success: true,
    accountName: 'Jane Smith',
    accountNumber: accountNumber,
    bankName: 'Kenya Commercial Bank'
  };
}

async function verifyGhanaianBankAccount(accountNumber: string, bankCode: string) {
  // Mock implementation - replace with actual Ghanaian bank verification API
  return {
    success: true,
    accountName: 'Kwame Asante',
    accountNumber: accountNumber,
    bankName: 'Ghana Commercial Bank'
  };
}

async function verifySouthAfricanBankAccount(accountNumber: string, bankCode: string) {
  // Mock implementation - replace with actual South African bank verification API
  return {
    success: true,
    accountName: 'Sipho Mthembu',
    accountNumber: accountNumber,
    bankName: 'Standard Bank'
  };
}

// =============================================================================
// EXCHANGE RATES SERVICE
// =============================================================================

export async function getExchangeRates(baseCurrency: string, targetCurrencies: string[]) {
  try {
    if (process.env.NODE_ENV === 'production') {
      // Use multiple sources for accuracy
      const sources = [
        await getFixerRates(baseCurrency, targetCurrencies),
        await getCurrencyAPIRates(baseCurrency, targetCurrencies),
        await getExchangeRateAPIRates(baseCurrency, targetCurrencies)
      ];

      // Average the rates from different sources
      const rates = {};
      targetCurrencies.forEach(currency => {
        const validRates = sources
          .map(source => source[currency])
          .filter(rate => rate && !isNaN(rate));
        
        if (validRates.length > 0) {
          rates[currency] = validRates.reduce((sum, rate) => sum + rate, 0) / validRates.length;
        }
      });

      return rates;
    } else {
      // Mock rates for development
      const mockRates = {
        'NGN': 1650.50,
        'KES': 155.75,
        'GHS': 15.85,
        'ZAR': 18.45,
        'UGX': 3750.25,
        'TZS': 2580.30,
        'XOF': 620.15,
        'XAF': 620.15
      };

      const rates = {};
      targetCurrencies.forEach(currency => {
        if (mockRates[currency]) {
          rates[currency] = mockRates[currency];
        }
      });

      return rates;
    }
  } catch (error) {
    logger.error('Exchange rates fetch error:', error);
    throw error;
  }
}

async function getFixerRates(base: string, targets: string[]) {
  const response = await fetch(
    `https://api.fixer.io/v1/latest?access_key=${process.env.FIXER_API_KEY}&base=${base}&symbols=${targets.join(',')}`
  );
  const data = await response.json();
  return data.rates || {};
}

async function getCurrencyAPIRates(base: string, targets: string[]) {
  const response = await fetch(
    `https://api.currencyapi.com/v3/latest?apikey=${process.env.CURRENCY_API_KEY}&base_currency=${base}&currencies=${targets.join(',')}`
  );
  const data = await response.json();
  return data.data ? Object.fromEntries(
    Object.entries(data.data).map(([key, value]: [string, any]) => [key, value.value])
  ) : {};
}

async function getExchangeRateAPIRates(base: string, targets: string[]) {
  const response = await fetch(
    `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/${base}`
  );
  const data = await response.json();
  
  if (data.conversion_rates) {
    const rates = {};
    targets.forEach(currency => {
      if (data.conversion_rates[currency]) {
        rates[currency] = data.conversion_rates[currency];
      }
    });
    return rates;
  }
  
  return {};
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export async function detectUserLocation(ipAddress: string): Promise<string> {
  try {
    // Use IP geolocation service to detect user country
    const response = await fetch(`http://ip-api.com/json/${ipAddress}`);
    const data = await response.json();
    return data.countryCode || 'US';
  } catch (error) {
    logger.error('Location detection error:', error);
    return 'US'; // Default to US
  }
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Mock database functions - replace with actual database calls
async function getUserById(userId: string) {
  // Mock user data
  return {
    id: userId,
    email: 'user@example.com',
    full_name: 'John Doe',
    username: 'johndoe',
    phone: '+1234567890'
  };
}

async function saveTransaction(transaction: any) {
  // Mock save to database
  logger.info('Transaction saved:', transaction);
  return transaction;
}

export async function updateTransactionStatus(reference: string, status: string, metadata: any) {
  // Mock update transaction status
  logger.info('Transaction updated:', { reference, status, metadata });
}

export async function creditUserWallet(userEmail: string, amount: number, currency: string) {
  // Mock wallet credit
  logger.info('Wallet credited:', { userEmail, amount, currency });
}

export async function sendPaymentNotification(email: string, type: string, data: any) {
  // Mock notification sending
  logger.info('Payment notification sent:', { email, type, data });
}

export async function getPaymentTransactions(userId: string, options: any) {
  // Mock transaction history
  return [
    {
      id: 'txn_12345',
      status: 'completed',
      amount: 100.00,
      currency: 'USD',
      provider: 'paystack',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {}
    }
  ];
}

export async function getTransactionStatus(transactionId: string, userId: string) {
  // Mock transaction status
  return {
    id: transactionId,
    status: 'completed',
    amount: 100.00,
    currency: 'USD',
    provider: 'paystack',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {}
  };
}

// Bank list functions
export async function getNigerianBanks() {
  // Mock Nigerian banks - replace with actual Paystack API call
  return [
    { name: 'Access Bank', code: '044' },
    { name: 'First Bank of Nigeria', code: '011' },
    { name: 'Guaranty Trust Bank', code: '058' },
    { name: 'United Bank for Africa', code: '033' },
    { name: 'Zenith Bank', code: '057' }
  ];
}

export async function getKenyanBanks() {
  return [
    { name: 'Kenya Commercial Bank', code: 'KCB' },
    { name: 'Equity Bank', code: 'EQUITY' },
    { name: 'Cooperative Bank', code: 'COOP' }
  ];
}

export async function getGhanaianBanks() {
  return [
    { name: 'Ghana Commercial Bank', code: 'GCB' },
    { name: 'Ecobank Ghana', code: 'ECO' },
    { name: 'Standard Chartered Ghana', code: 'SCB' }
  ];
}

export async function getSouthAfricanBanks() {
  return [
    { name: 'Standard Bank', code: 'SB' },
    { name: 'First National Bank', code: 'FNB' },
    { name: 'ABSA Bank', code: 'ABSA' }
  ];
}

export async function getUgandanBanks() {
  return [
    { name: 'Stanbic Bank Uganda', code: 'STANBIC' },
    { name: 'Bank of Uganda', code: 'BOU' }
  ];
}

export async function getTanzanianBanks() {
  return [
    { name: 'CRDB Bank', code: 'CRDB' },
    { name: 'National Bank of Commerce', code: 'NBC' }
  ];
}
