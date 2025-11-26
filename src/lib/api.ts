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

  // Crypto methods - now using CryptoAPIs instead of Bybit API
  async getCryptoPrices() {
    try {
      // Use our backend CryptoAPIs endpoint instead of calling Bybit directly
      const response = await fetch('/api/cryptoapis/assets');
      
      if (!response.ok) {
        throw new Error(`CryptoAPIs error: ${response.status}`);
      }
      
      const data = await response.json();
      const prices: Record<string, any> = {};
      
      // Process CryptoAPIs data into the format expected by the UI
      if (data.success && data.data) {
        // Extract price information from CryptoAPIs response
        // This is a simplified mapping - you may need to adjust based on actual CryptoAPIs response structure
        data.data.forEach((asset: any) => {
          const symbol = asset.assetId.toLowerCase();
          prices[symbol] = {
            usd: parseFloat(asset.rate || 0),
            usd_market_cap: parseFloat(asset.marketCap || 0),
            usd_24h_change: parseFloat(asset.changePercent24h || 0),
            usd_24h_vol: parseFloat(asset.volume24h || 0)
          };
        });
      }
      
      return { prices, timestamp: Date.now() };
    } catch (error) {
      console.error('Error fetching crypto prices from CryptoAPIs:', error);
      throw error;
    }
  }

  async getCryptoTrades() {
    try {
      // Use our backend CryptoAPIs endpoint for trades
      const response = await fetch('/api/cryptoapis/exchange-rates/BTC/USD');
      
      if (!response.ok) {
        throw new Error(`CryptoAPIs error: ${response.status}`);
      }
      
      const data = await response.json();
      const trades: any[] = [];
      
      // Process CryptoAPIs data into trades format
      if (data.success && data.data) {
        // Extract trade information from CryptoAPIs response
        // This is a simplified mapping - you may need to adjust based on actual CryptoAPIs response structure
        trades.push({
          id: data.data.timestamp,
          symbol: 'BTCUSDT',
          price: parseFloat(data.data.rate || 0),
          quantity: 1, // CryptoAPIs may not provide quantity data
          time: data.data.timestamp,
          isBuyerMaker: true // Default value
        });
      }
      
      return trades;
    } catch (error) {
      console.error('Error fetching crypto trades from CryptoAPIs:', error);
      throw error;
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

  // Read body once to avoid "body stream already read" errors
  const text = await response.text();
  let data: any;

  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = { error: text || "Unknown error" };
  }

  if (!response.ok) {
    const errorMessage = (data && data.error) || `HTTP ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

// Export token helper for other modules
export { getAuthToken };
