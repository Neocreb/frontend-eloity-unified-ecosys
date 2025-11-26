import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = '/api/cryptoapis';

export interface AddressLatestActivityResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface AddressHistoryResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface BlockDataResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface TransactionDataResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface ExchangeRatesResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface FeesResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface AssetsResponse {
  success: boolean;
  data?: any;
  error?: string;
}

class CryptoapisClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(method: string, endpoint: string, data?: any): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);

      // Check if response is OK
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`CryptoAPIs HTTP error! status: ${response.status}`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response received from CryptoAPIs:', text.substring(0, 200));
        throw new Error('Received non-JSON response from CryptoAPIs');
      }

      return await response.json();
    } catch (error) {
      console.error(`CryptoAPIs request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async getAddressLatestActivity(
    blockchain: string,
    network: string,
    address: string
  ): Promise<AddressLatestActivityResponse> {
    return this.request('GET', `/address/latest/${blockchain}/${network}/${address}`);
  }

  async getAddressHistory(
    blockchain: string,
    network: string,
    address: string
  ): Promise<AddressHistoryResponse> {
    return this.request('GET', `/address/history/${blockchain}/${network}/${address}`);
  }

  async getBlockData(
    blockchain: string,
    network: string,
    blockId: string | number
  ): Promise<BlockDataResponse> {
    return this.request('GET', `/block/${blockchain}/${network}/${blockId}`);
  }

  async getTransactionData(
    blockchain: string,
    network: string,
    transactionId: string
  ): Promise<TransactionDataResponse> {
    return this.request('GET', `/transaction/${blockchain}/${network}/${transactionId}`);
  }

  async simulateTransaction(
    blockchain: string,
    network: string,
    transactionData: any
  ): Promise<any> {
    return this.request('POST', `/simulate-transaction`, {
      blockchain,
      network,
      ...transactionData,
    });
  }

  async broadcastTransaction(
    blockchain: string,
    network: string,
    signedTransaction: string
  ): Promise<any> {
    return this.request('POST', `/broadcast`, {
      blockchain,
      network,
      signedTransaction,
    });
  }

  async estimateTransactionFees(
    blockchain: string,
    network: string
  ): Promise<FeesResponse> {
    return this.request('GET', `/fees/${blockchain}/${network}`);
  }

  async getExchangeRates(
    baseAssetId: string,
    quoteAssetId: string
  ): Promise<ExchangeRatesResponse> {
    return this.request('GET', `/exchange-rates/${baseAssetId}/${quoteAssetId}`);
  }

  async getSupportedAssets(): Promise<AssetsResponse> {
    return this.request('GET', `/assets`);
  }

  async getTokenMetadata(
    blockchain: string,
    network: string,
    contractAddress: string
  ): Promise<any> {
    return this.request('GET', `/token/${blockchain}/${network}/${contractAddress}`);
  }

  async manageHDWallet(
    blockchain: string,
    network: string,
    walletData: any
  ): Promise<any> {
    return this.request('POST', `/hd-wallet`, {
      blockchain,
      network,
      ...walletData,
    });
  }

  async getWalletAddresses(
    blockchain: string,
    network: string,
    walletId: string,
    count: number = 10
  ): Promise<any> {
    return this.request('GET', `/hd-wallet/${walletId}/addresses?count=${count}`);
  }

  async createWebhook(webhookData: any): Promise<any> {
    return this.request('POST', `/webhook`, webhookData);
  }
}

export const cryptoapisClient = new CryptoapisClient();

export default cryptoapisClient;
