// API client for server communication
const BASE_URL = "/api";

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const token = getAuthToken();
    
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    // Read body once and reuse the parsed result to avoid "body stream already read" errors
    const text = await response.text();
    let parsed: any;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch (e) {
      parsed = text;
    }

    if (!response.ok) {
      const errorMessage = (parsed && parsed.error) || parsed?.message || `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    return parsed as T;
  }

  // Auth methods
  async signUp(email: string, password: string, name: string) {
    return this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async signIn(email: string, password: string) {
    return this.request("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  // Profile methods
  async getProfile(userId: string) {
    return this.request(`/profiles/${userId}`);
  }

  async getProfileByUsername(username: string) {
    return this.request(`/profiles/${username}`);
  }

  async updateProfile(userId: string, updates: any) {
    return this.request(`/profiles/${userId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  // Posts methods
  async getPosts(limit = 50, offset = 0) {
    return this.request(`/posts?limit=${limit}&offset=${offset}`);
  }

  async getPost(id: string) {
    return this.request(`/posts/${id}`);
  }

  async getUserPosts(userId: string) {
    return this.request(`/posts/user/${userId}`);
  }

  async createPost(post: any) {
    return this.request("/posts", {
      method: "POST",
      body: JSON.stringify(post),
    });
  }

  async updatePost(id: string, updates: any) {
    return this.request(`/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deletePost(id: string) {
    return this.request(`/posts/${id}`, {
      method: "DELETE",
    });
  }

  // Products methods
  async getProducts(limit = 50, offset = 0) {
    return this.request(`/products?limit=${limit}&offset=${offset}`);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  async getSellerProducts(sellerId: string) {
    return this.request(`/products/seller/${sellerId}`);
  }

  async createProduct(product: any) {
    return this.request("/products", {
      method: "POST",
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, updates: any) {
    return this.request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: "DELETE",
    });
  }

  // Follow methods
  async followUser(followerId: string, followingId: string) {
    return this.request("/follow", {
      method: "POST",
      body: JSON.stringify({ followerId, followingId }),
    });
  }

  async unfollowUser(followerId: string, followingId: string) {
    return this.request("/follow", {
      method: "DELETE",
      body: JSON.stringify({ followerId, followingId }),
    });
  }

  async getFollowers(userId: string) {
    return this.request(`/follow/followers/${userId}`);
  }

  async getFollowing(userId: string) {
    return this.request(`/follow/following/${userId}`);
  }

  async checkFollowStatus(followerId: string, followingId: string) {
    return this.request(`/follow/check/${followerId}/${followingId}`);
  }

  // Explore/Discovery methods
  async getTrendingTopics(limit = 10) {
    return this.request(`/explore/trending?limit=${limit}`);
  }

  async getSuggestedUsers(limit = 10) {
    return this.request(`/explore/users?limit=${limit}`);
  }

  async getPopularHashtags(limit = 10) {
    return this.request(`/explore/hashtags?limit=${limit}`);
  }

  async getGroups(limit = 20, offset = 0) {
    return this.request(`/groups?limit=${limit}&offset=${offset}`);
  }

  async getPages(limit = 20, offset = 0) {
    return this.request(`/pages?limit=${limit}&offset=${offset}`);
  }

  // Video methods
  async getVideos(limit = 20, offset = 0, type = 'all') {
    return this.request(`/videos?limit=${limit}&offset=${offset}&type=${type}`);
  }

  async getVideo(id: string) {
    return this.request(`/videos/${id}`);
  }

  async getUserVideos(userId: string) {
    return this.request(`/videos/user/${userId}`);
  }

  async createVideo(video: any) {
    return this.request("/videos", {
      method: "POST",
      body: JSON.stringify(video),
    });
  }

  async likeVideo(videoId: string) {
    return this.request(`/videos/${videoId}/like`, {
      method: "POST",
    });
  }

  async unlikeVideo(videoId: string) {
    return this.request(`/videos/${videoId}/like`, {
      method: "DELETE",
    });
  }

  // Search methods
  async search(query: string, type?: string, filters?: any) {
    const params = new URLSearchParams({ q: query });
    if (type) params.append('type', type);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return this.request(`/explore/search?${params.toString()}`);
  }

  // Marketplace methods
  async getMarketplaceProducts(filters?: any) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return this.request(`/marketplace/products?${params.toString()}`);
  }

  // Freelance methods
  async getFreelanceJobs(filters?: any) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return this.request(`/freelance/jobs?${params.toString()}`);
  }

  // Crypto methods - now using Bybit API
  async getCryptoPrices() {
    try {
      // Use Bybit API directly instead of CoinGecko
      const response = await fetch('https://api.bybit.com/v5/market/tickers?category=spot', {
        headers: {
          'X-BAPI-API-KEY': import.meta.env?.VITE_BYBIT_API_KEY || ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`Bybit API error: ${response.status}`);
      }
      
      const data = await response.json();
      const prices: Record<string, any> = {};
      
      data.result.list.forEach((ticker: any) => {
        const symbol = ticker.symbol.toLowerCase().replace('usdt', '');
        prices[symbol] = {
          usd: parseFloat(ticker.lastPrice),
          usd_market_cap: 0, // Bybit doesn't provide market cap
          usd_24h_change: parseFloat(ticker.price24hPcnt) * 100,
          usd_24h_vol: parseFloat(ticker.volume24h)
        };
      });
      
      return { prices, timestamp: Date.now() };
    } catch (error) {
      console.error('Error fetching crypto prices from Bybit:', error);
      throw error; // No fallback to mock data
    }
  }

  async getCryptoTrades() {
    try {
      // Use Bybit API to get recent trades
      const response = await fetch('https://api.bybit.com/v5/market/recent-trade?category=spot&symbol=BTCUSDT&limit=50', {
        headers: {
          'X-BAPI-API-KEY': import.meta.env?.VITE_BYBIT_API_KEY || ''
        }
      });
      
      if (!response.ok) {
        throw new Error(`Bybit API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.result.list.map((trade: any) => ({
        id: trade.execId,
        symbol: 'BTCUSDT',
        price: parseFloat(trade.price),
        quantity: parseFloat(trade.size),
        time: trade.time,
        isBuyerMaker: trade.side === 'Sell'
      }));
    } catch (error) {
      console.error('Error fetching crypto trades from Bybit:', error);
      throw error; // No fallback to mock data
    }
  }
}

export const apiClient = new ApiClient();

// Helper function for simple API calls
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = endpoint.startsWith("/api")
    ? endpoint
    : endpoint.startsWith("/")
      ? `/api${endpoint}`
      : `/api/${endpoint}`;
  
  const token = getAuthToken();
  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Export token helper for other modules
export { getAuthToken };