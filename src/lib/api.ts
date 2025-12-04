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

  // Crypto methods - now using CryptoAPIs through backend
  async getCryptoPrices() {
    try {
      // Use backend endpoint that uses CryptoAPIs
      const response = await fetch('/api/crypto/prices?symbols=bitcoin,ethereum,tether', {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const prices = data.prices || {};

      return { prices, timestamp: Date.now() };
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
      throw error;
    }
  }

  async getCryptoTrades() {
    try {
      const token = getAuthToken();
      if (!token) {
        console.warn('No auth token available for crypto trades request');
        return [];
      }

      // Use backend endpoint for transaction history with auth headers
      const response = await fetch('/api/cryptoapis/address/history/ethereum/mainnet/0x0000000000000000000000000000000000000000?limit=50', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const transactions = data.data || [];
      return transactions.slice(0, 50).map((tx: any, index: number) => ({
        id: tx.transactionId || `tx_${index}`,
        symbol: 'BTC',
        price: parseFloat(tx.gasPrice) || 0,
        quantity: parseFloat(tx.amount) || 0,
        time: tx.transactionTimestamp || new Date().toISOString(),
        isBuyerMaker: tx.senderAddress ? false : true
      }));
    } catch (error) {
      console.error('Error fetching crypto trades:', error);
      return [];
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
  let text = "";
  let data: any;

  try {
    text = await response.text();
  } catch (e) {
    // Handle cases where body stream has already been read or is unavailable
    console.error("Error reading response body:", e);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to read response`);
    }
    return null;
  }

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

// Wrapper for fetch with automatic auth header
export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
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

  return fetch(url, config);
}

// Export token helper for other modules
export { getAuthToken };
