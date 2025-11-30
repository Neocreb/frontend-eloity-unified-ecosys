import { logger } from '../utils/logger.js';

// RELOADLY API configuration
const RELOADLY_BASE_URL = 'https://topups.reloadly.com';
const RELOADLY_AUTH_URL = 'https://auth.reloadly.com/oauth/token';

interface ReloadlyAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface ReloadlyOperator {
  id: number;
  name: string;
  bundle: boolean;
  data: boolean;
  pin: boolean;
  supportsLocalAmounts: boolean;
  denominationType: string;
  senderCurrencyCode: string;
  senderCurrencySymbol: string;
  destinationCurrencyCode: string;
  destinationCurrencySymbol: string;
  commission: number;
  fxRate: number;
  logoUrls: string[];
}

interface ReloadlyTopupResponse {
  transactionId: string;
  status: string;
  referenceId: string;
  operatorTransactionId: string;
  operatorId: number;
  recipientPhone: string;
  countryCode: string;
  operatorName: string;
  discount: number;
  usableBalance: number;
  amount: number;
  fee: number;
  total: number;
}

interface ReloadlyGiftCardResponse {
  transactionId: string;
  status: string;
  referenceId: string;
  productId: number;
  productName: string;
  brandName: string;
  amount: number;
  currencyCode: string;
  fee: number;
  total: number;
  email: string;
}

// Get RELOADLY access token
async function getReloadlyAccessToken(): Promise<string> {
  try {
    const response = await fetch(RELOADLY_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.RELOADLY_API_KEY,
        client_secret: process.env.RELOADLY_API_SECRET,
        grant_type: 'client_credentials',
        audience: RELOADLY_BASE_URL
      })
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorDetails = '';

      if (contentType?.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorDetails = JSON.stringify(errorData);
        } catch {
          errorDetails = await response.text();
        }
      } else {
        errorDetails = await response.text();
      }

      logger.error('Reloadly auth failed:', {
        status: response.status,
        statusText: response.statusText,
        details: errorDetails
      });
      throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
    }

    const data: ReloadlyAuthResponse = await response.json();
    return data.access_token;
  } catch (error: unknown) {
    logger.error('RELOADLY authentication error:', error);
    throw error;
  }
}

// Get operators by country code
export async function getOperatorsByCountry(countryCode: string) {
  try {
    const token = await getReloadlyAccessToken();
    
    const response = await fetch(`${RELOADLY_BASE_URL}/operators/countries/${countryCode}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/com.reloadly.topups-v1+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch operators: ${response.status} ${response.statusText}`);
    }

    const operators: ReloadlyOperator[] = await response.json();
    return operators;
  } catch (error: unknown) {
    logger.error('RELOADLY get operators error:', error);
    throw error;
  }
}

// Get operator by ID
export async function getOperatorById(operatorId: number) {
  try {
    const token = await getReloadlyAccessToken();
    
    const response = await fetch(`${RELOADLY_BASE_URL}/operators/${operatorId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/com.reloadly.topups-v1+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch operator: ${response.status} ${response.statusText}`);
    }

    const operator: ReloadlyOperator = await response.json();
    return operator;
  } catch (error: unknown) {
    logger.error('RELOADLY get operator error:', error);
    throw error;
  }
}

// Send airtime topup
export async function sendAirtimeTopup(operatorId: number, amount: number, recipientPhone: string, userId: string) {
  try {
    const token = await getReloadlyAccessToken();
    
    const payload = {
      operatorId,
      amount,
      recipientPhone: recipientPhone.replace('+', ''),
      customIdentifier: `ELOITY_${userId}_${Date.now()}`
    };

    const response = await fetch(`${RELOADLY_BASE_URL}/topups`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/com.reloadly.topups-v1+json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Airtime topup failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result: ReloadlyTopupResponse = await response.json();
    
    // Log transaction
    logger.info('Airtime topup successful', {
      transactionId: result.transactionId,
      userId,
      amount,
      recipientPhone,
      operatorId
    });

    return {
      success: true,
      transactionId: result.transactionId,
      status: result.status,
      referenceId: result.referenceId,
      operatorName: result.operatorName,
      amount: result.amount,
      fee: result.fee,
      total: result.total
    };
  } catch (error: unknown) {
    logger.error('RELOADLY airtime topup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage
    };
  }
}

// Send data bundle
export async function sendDataBundle(operatorId: number, amount: number, recipientPhone: string, userId: string) {
  try {
    const token = await getReloadlyAccessToken();
    
    const payload = {
      operatorId,
      amount,
      recipientPhone: recipientPhone.replace('+', ''),
      customIdentifier: `ELOITY_${userId}_${Date.now()}`
    };

    const response = await fetch(`${RELOADLY_BASE_URL}/topups`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/com.reloadly.topups-v1+json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Data bundle failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result: ReloadlyTopupResponse = await response.json();
    
    // Log transaction
    logger.info('Data bundle successful', {
      transactionId: result.transactionId,
      userId,
      amount,
      recipientPhone,
      operatorId
    });

    return {
      success: true,
      transactionId: result.transactionId,
      status: result.status,
      referenceId: result.referenceId,
      operatorName: result.operatorName,
      amount: result.amount,
      fee: result.fee,
      total: result.total
    };
  } catch (error: unknown) {
    logger.error('RELOADLY data bundle error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage
    };
  }
}

// Pay utility bill
export async function payUtilityBill(operatorId: number, amount: number, recipientPhone: string, userId: string) {
  try {
    const token = await getReloadlyAccessToken();
    
    const payload = {
      operatorId,
      amount,
      recipientPhone: recipientPhone.replace('+', ''),
      customIdentifier: `ELOITY_${userId}_${Date.now()}`
    };

    const response = await fetch(`${RELOADLY_BASE_URL}/topups`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/com.reloadly.topups-v1+json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Utility bill payment failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result: ReloadlyTopupResponse = await response.json();
    
    // Log transaction
    logger.info('Utility bill payment successful', {
      transactionId: result.transactionId,
      userId,
      amount,
      recipientPhone,
      operatorId
    });

    return {
      success: true,
      transactionId: result.transactionId,
      status: result.status,
      referenceId: result.referenceId,
      operatorName: result.operatorName,
      amount: result.amount,
      fee: result.fee,
      total: result.total
    };
  } catch (error: unknown) {
    logger.error('RELOADLY utility bill payment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage
    };
  }
}

// Get gift card products
export async function getGiftCardProducts() {
  try {
    const token = await getReloadlyAccessToken();
    
    const response = await fetch(`${RELOADLY_BASE_URL}/gift-cards/products`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/com.reloadly.giftcards-v1+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch gift card products: ${response.status} ${response.statusText}`);
    }

    const products = await response.json();
    return products;
  } catch (error: unknown) {
    logger.error('RELOADLY get gift card products error:', error);
    throw error;
  }
}

// Get gift card product by ID
export async function getGiftCardProductById(productId: number) {
  try {
    const token = await getReloadlyAccessToken();
    
    const response = await fetch(`${RELOADLY_BASE_URL}/gift-cards/products/${productId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/com.reloadly.giftcards-v1+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch gift card product: ${response.status} ${response.statusText}`);
    }

    const product = await response.json();
    return product;
  } catch (error: unknown) {
    logger.error('RELOADLY get gift card product error:', error);
    throw error;
  }
}

// Purchase gift card
export async function purchaseGiftCard(productId: number, amount: number, email: string, userId: string) {
  try {
    const token = await getReloadlyAccessToken();
    
    const payload = {
      productId,
      amount,
      email,
      customIdentifier: `ELOITY_${userId}_${Date.now()}`
    };

    const response = await fetch(`${RELOADLY_BASE_URL}/gift-cards`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/com.reloadly.giftcards-v1+json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gift card purchase failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result: ReloadlyGiftCardResponse = await response.json();
    
    // Log transaction
    logger.info('Gift card purchase successful', {
      transactionId: result.transactionId,
      userId,
      amount,
      email,
      productId
    });

    return {
      success: true,
      transactionId: result.transactionId,
      status: result.status,
      referenceId: result.referenceId,
      productName: result.productName,
      brandName: result.brandName,
      amount: result.amount,
      currencyCode: result.currencyCode,
      fee: result.fee,
      total: result.total
    };
  } catch (error: unknown) {
    logger.error('RELOADLY gift card purchase error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage
    };
  }
}

// Get transaction status
export async function getTransactionStatus(transactionId: string) {
  try {
    const token = await getReloadlyAccessToken();
    
    const response = await fetch(`${RELOADLY_BASE_URL}/topups/transactions/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/com.reloadly.topups-v1+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch transaction status: ${response.status} ${response.statusText}`);
    }

    const transaction = await response.json();
    return transaction;
  } catch (error: unknown) {
    logger.error('RELOADLY get transaction status error:', error);
    throw error;
  }
}

// Get balance
export async function getBalance() {
  try {
    const token = await getReloadlyAccessToken();
    
    const response = await fetch(`${RELOADLY_BASE_URL}/accounts/balance`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/com.reloadly.topups-v1+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch balance: ${response.status} ${response.statusText}`);
    }

    const balance = await response.json();
    return balance;
  } catch (error: unknown) {
    logger.error('RELOADLY get balance error:', error);
    throw error;
  }
}

export default {
  getOperatorsByCountry,
  getOperatorById,
  sendAirtimeTopup,
  sendDataBundle,
  payUtilityBill,
  getGiftCardProducts,
  getGiftCardProductById,
  purchaseGiftCard,
  getTransactionStatus,
  getBalance
};
