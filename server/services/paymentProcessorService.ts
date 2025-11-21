import { logger } from '../utils/logger.js';
import crypto from 'crypto';

export interface ProcessorPayment {
  id: string;
  reference: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  fee: number;
  description: string;
  metadata?: any;
}

export interface PaystackInitRequest {
  email: string;
  amount: number;
  currency: string;
  reference: string;
  callback_url: string;
  metadata?: any;
}

export interface FlutterwaveInitRequest {
  amount: number;
  currency: string;
  reference: string;
  customer_email: string;
  customer_name?: string;
  redirect_url: string;
  metadata?: any;
}

export interface StripePaymentIntentRequest {
  amount: number;
  currency: string;
  description: string;
  metadata?: any;
}

class PaymentProcessorService {
  private paystackSecretKey: string;
  private flutterwaveSecretKey: string;
  private stripeSecretKey: string;

  constructor() {
    this.paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || '';
    this.flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY || '';
    this.stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
  }

  // ========== PAYSTACK ==========

  /**
   * Initialize Paystack payment
   */
  async initializePaystackPayment(data: PaystackInitRequest): Promise<{ authorizationUrl: string; accessCode: string; reference: string } | null> {
    try {
      const payload = {
        email: data.email,
        amount: Math.round(data.amount * 100),
        currency: data.currency,
        reference: data.reference,
        callback_url: data.callback_url,
        metadata: data.metadata,
      };

      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.paystackSecretKey}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.status) {
        logger.error('Paystack initialization failed:', result.message);
        return null;
      }

      return {
        authorizationUrl: result.data.authorization_url,
        accessCode: result.data.access_code,
        reference: result.data.reference,
      };
    } catch (error) {
      logger.error('Error initializing Paystack payment:', error);
      return null;
    }
  }

  /**
   * Verify Paystack payment
   */
  async verifyPaystackPayment(reference: string): Promise<ProcessorPayment | null> {
    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
        },
      });

      const result = await response.json();

      if (!result.status) {
        logger.error('Paystack verification failed:', result.message);
        return null;
      }

      const data = result.data;
      return {
        id: data.id.toString(),
        reference: data.reference,
        status: data.status === 'success' ? 'completed' : (data.status as any),
        amount: data.amount / 100,
        currency: data.currency,
        fee: data.fees / 100,
        description: `Paystack payment - ${data.reference}`,
        metadata: {
          processor: 'paystack',
          paystackId: data.id,
          authorization: data.authorization,
          customer: data.customer,
        },
      };
    } catch (error) {
      logger.error('Error verifying Paystack payment:', error);
      return null;
    }
  }

  /**
   * Verify Paystack webhook signature
   */
  verifyPaystackWebhookSignature(body: string, signature: string): boolean {
    try {
      const hash = crypto.createHmac('sha512', this.paystackSecretKey).update(body).digest('hex');
      return hash === signature;
    } catch (error) {
      logger.error('Error verifying Paystack signature:', error);
      return false;
    }
  }

  /**
   * Refund Paystack payment
   */
  async refundPaystackPayment(reference: string, amount?: number): Promise<boolean> {
    try {
      const payload: any = {
        transaction: reference,
      };

      if (amount) {
        payload.amount = Math.round(amount * 100);
      }

      const response = await fetch('https://api.paystack.co/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.paystackSecretKey}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      return result.status === true;
    } catch (error) {
      logger.error('Error refunding Paystack payment:', error);
      return false;
    }
  }

  // ========== FLUTTERWAVE ==========

  /**
   * Initialize Flutterwave payment
   */
  async initializeFlutterwavePayment(data: FlutterwaveInitRequest): Promise<{ paymentLink: string; flwRef: string } | null> {
    try {
      const payload = {
        tx_ref: data.reference,
        amount: data.amount,
        currency: data.currency,
        redirect_url: data.redirect_url,
        customer: {
          email: data.customer_email,
          name: data.customer_name || 'Customer',
        },
        meta: data.metadata,
      };

      const response = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.flutterwaveSecretKey}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status !== 'success') {
        logger.error('Flutterwave initialization failed:', result.message);
        return null;
      }

      return {
        paymentLink: result.data.link,
        flwRef: result.data.flw_ref,
      };
    } catch (error) {
      logger.error('Error initializing Flutterwave payment:', error);
      return null;
    }
  }

  /**
   * Verify Flutterwave payment
   */
  async verifyFlutterwavePayment(transactionId: string): Promise<ProcessorPayment | null> {
    try {
      // Validate transactionId: allow only digits for Flutterwave transaction IDs
      if (!/^\d+$/.test(transactionId)) {
        logger.error('Invalid transaction ID format in verifyFlutterwavePayment:', transactionId);
        return null;
      }
      const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.flutterwaveSecretKey}`,
        },
      });

      const result = await response.json();

      if (result.status !== 'success') {
        logger.error('Flutterwave verification failed:', result.message);
        return null;
      }

      const data = result.data;
      return {
        id: data.id.toString(),
        reference: data.tx_ref,
        status: data.status === 'successful' ? 'completed' : (data.status as any),
        amount: data.amount,
        currency: data.currency,
        fee: data.app_fee || 0,
        description: `Flutterwave payment - ${data.tx_ref}`,
        metadata: {
          processor: 'flutterwave',
          flutterwaveId: data.id,
          flwRef: data.flw_ref,
          customer: data.customer,
        },
      };
    } catch (error) {
      logger.error('Error verifying Flutterwave payment:', error);
      return null;
    }
  }

  /**
   * Verify Flutterwave webhook signature
   */
  verifyFlutterwaveWebhookSignature(body: string, signature: string): boolean {
    try {
      const hash = crypto.createHmac('sha256', this.flutterwaveSecretKey).update(body).digest('hex');
      return hash === signature;
    } catch (error) {
      logger.error('Error verifying Flutterwave signature:', error);
      return false;
    }
  }

  /**
   * Process bank transfer via Flutterwave
   */
  async createFlutterwavePayout(data: {
    account_number: string;
    account_bank: string;
    amount: number;
    currency: string;
    beneficiary_name: string;
    reference: string;
    narration?: string;
  }): Promise<{ id: string; reference: string; status: string } | null> {
    try {
      const payload = {
        account_number: data.account_number,
        account_bank: data.account_bank,
        amount: data.amount,
        currency: data.currency,
        beneficiary_name: data.beneficiary_name,
        reference: data.reference,
        narration: data.narration || 'Payout from Eloity',
      };

      const response = await fetch('https://api.flutterwave.com/v3/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.flutterwaveSecretKey}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.status !== 'success') {
        logger.error('Flutterwave payout creation failed:', result.message);
        return null;
      }

      return {
        id: result.data.id.toString(),
        reference: result.data.reference,
        status: result.data.status,
      };
    } catch (error) {
      logger.error('Error creating Flutterwave payout:', error);
      return null;
    }
  }

  // ========== STRIPE ==========

  /**
   * Create Stripe payment intent
   */
  async createStripePaymentIntent(data: StripePaymentIntentRequest): Promise<{ clientSecret: string; intentId: string } | null> {
    try {
      const response = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${this.stripeSecretKey}`,
        },
        body: new URLSearchParams({
          amount: Math.round(data.amount * 100).toString(),
          currency: data.currency.toLowerCase(),
          description: data.description,
          metadata: JSON.stringify(data.metadata || {}),
        }),
      });

      const result = await response.json();

      if (result.error) {
        logger.error('Stripe payment intent creation failed:', result.error.message);
        return null;
      }

      return {
        clientSecret: result.client_secret,
        intentId: result.id,
      };
    } catch (error) {
      logger.error('Error creating Stripe payment intent:', error);
      return null;
    }
  }

  /**
   * Retrieve Stripe payment intent
   */
  async retrieveStripePaymentIntent(intentId: string): Promise<ProcessorPayment | null> {
    try {
      const response = await fetch(`https://api.stripe.com/v1/payment_intents/${intentId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.stripeSecretKey}`,
        },
      });

      const result = await response.json();

      if (result.error) {
        logger.error('Stripe payment intent retrieval failed:', result.error.message);
        return null;
      }

      let status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' = 'pending';
      if (result.status === 'succeeded') status = 'completed';
      else if (result.status === 'processing') status = 'processing';
      else if (result.status === 'canceled') status = 'cancelled';
      else if (result.status === 'requires_payment_method') status = 'failed';

      return {
        id: result.id,
        reference: result.id,
        status,
        amount: result.amount / 100,
        currency: result.currency.toUpperCase(),
        fee: 0,
        description: result.description || `Stripe payment - ${result.id}`,
        metadata: {
          processor: 'stripe',
          stripeIntentId: result.id,
          charges: result.charges,
        },
      };
    } catch (error) {
      logger.error('Error retrieving Stripe payment intent:', error);
      return null;
    }
  }

  /**
   * Verify Stripe webhook signature
   */
  verifyStripeWebhookSignature(body: string, signature: string, secret: string): boolean {
    try {
      const hash = crypto.createHmac('sha256', secret).update(body).digest('hex');
      const expectedSignature = `t=${Math.floor(Date.now() / 1000)},v1=${hash}`;
      return signature === expectedSignature || signature.includes(hash);
    } catch (error) {
      logger.error('Error verifying Stripe signature:', error);
      return false;
    }
  }

  // ========== M-PESA ==========

  /**
   * Initiate M-Pesa STK Push
   */
  async initiateMpesaStkPush(data: {
    phoneNumber: string;
    amount: number;
    accountReference: string;
    transactionDescription: string;
  }): Promise<{ checkoutRequestId: string; responseCode: string } | null> {
    try {
      const businessShortCode = process.env.MPESA_BUSINESS_SHORT_CODE || '';
      const passkey = process.env.MPESA_PASSKEY || '';
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);

      const password = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString('base64');

      const response = await fetch('https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MPESA_ACCESS_TOKEN || ''}`,
        },
        body: JSON.stringify({
          BusinessShortCode: businessShortCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: Math.round(data.amount),
          PartyA: data.phoneNumber,
          PartyB: businessShortCode,
          PhoneNumber: data.phoneNumber,
          CallBackURL: `${process.env.API_BASE_URL || 'http://localhost:5000'}/api/wallet/deposit/mpesa-callback`,
          AccountReference: data.accountReference,
          TransactionDesc: data.transactionDescription,
        }),
      });

      const result = await response.json();

      if (result.ResponseCode !== '0') {
        logger.error('M-Pesa STK Push failed:', result.ResponseDescription);
        return null;
      }

      return {
        checkoutRequestId: result.CheckoutRequestID,
        responseCode: result.ResponseCode,
      };
    } catch (error) {
      logger.error('Error initiating M-Pesa STK Push:', error);
      return null;
    }
  }

  /**
   * Query M-Pesa transaction status
   */
  async queryMpesaTransactionStatus(checkoutRequestId: string): Promise<{ status: string; amount?: number } | null> {
    try {
      const businessShortCode = process.env.MPESA_BUSINESS_SHORT_CODE || '';
      const passkey = process.env.MPESA_PASSKEY || '';
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);

      const password = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString('base64');

      const response = await fetch('https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.MPESA_ACCESS_TOKEN || ''}`,
        },
        body: JSON.stringify({
          BusinessShortCode: businessShortCode,
          Password: password,
          Timestamp: timestamp,
          CheckoutRequestID: checkoutRequestId,
        }),
      });

      const result = await response.json();

      return {
        status: result.ResultCode === '0' ? 'completed' : 'pending',
        amount: result.CallbackMetadata?.Item?.find((item: any) => item.Name === 'Amount')?.Value,
      };
    } catch (error) {
      logger.error('Error querying M-Pesa transaction status:', error);
      return null;
    }
  }

  // ========== CRYPTO PAYMENTS ==========

  /**
   * Generate crypto deposit address and monitor for payments
   */
  async generateCryptoDepositAddress(data: {
    userId: string;
    currency: string;
    amount: number;
  }): Promise<{ address: string; qrCode?: string; expiresAt: string } | null> {
    try {
      if (data.currency === 'BTC') {
        return {
          address: `bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh`, // Example address
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh?amount=${data.amount}`,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
      } else if (data.currency === 'ETH') {
        return {
          address: `0x742d35Cc6634C0532925a3b844Bc9e7595f42e51`,
          qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f42e51?amount=${data.amount}`,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
      }

      return null;
    } catch (error) {
      logger.error('Error generating crypto deposit address:', error);
      return null;
    }
  }

  /**
   * Get crypto price conversion
   */
  async getCryptoPriceConversion(fromCrypto: string, toFiat: string): Promise<{ rate: number; amount: number } | null> {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${fromCrypto.toLowerCase()}&vs_currencies=${toFiat.toLowerCase()}&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=false`
      );

      const result = await response.json();
      const rate = result[fromCrypto.toLowerCase()]?.[toFiat.toLowerCase()];

      if (!rate) {
        logger.error(`Price conversion failed for ${fromCrypto} to ${toFiat}`);
        return null;
      }

      return {
        rate,
        amount: 1,
      };
    } catch (error) {
      logger.error('Error fetching crypto price:', error);
      return null;
    }
  }
}

export const paymentProcessorService = new PaymentProcessorService();
