import { apiClient } from '@/lib/api';

interface SearchResult {
  id: string;
  type: "user" | "product" | "service" | "post" | "video" | "crypto" | "job";
  title: string;
  description: string;
  image?: string;
  price?: number;
  rating?: number;
  location?: string;
  category?: string;
  tags?: string[];
  timestamp?: Date;
  author?: {
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  stats?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
}

interface SearchFilters {
  category?: string;
  priceMin?: string;
  priceMax?: string;
  rating?: string;
  dateRange?: string;
  location?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface SearchParams {
  query: string;
  type?: string;
  filters?: SearchFilters;
  page?: number;
  limit?: number;
}

interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  suggestions: string[];
  relatedSearches: string[];
  facets: {
    categories: { name: string; count: number }[];
    priceRanges: { range: string; count: number }[];
    ratings: { rating: number; count: number }[];
    locations: { location: string; count: number }[];
  };
}

// Mock data for comprehensive search results
const mockUsers: SearchResult[] = [
  {
    id: "user1",
    type: "user",
    title: "Sarah Johnson",
    description:
      "Full Stack Developer & Tech Entrepreneur with 5+ years experience",
    image: "https://randomuser.me/api/portraits/women/32.jpg",
    location: "San Francisco, CA",
    tags: ["React", "Node.js", "TypeScript", "GraphQL"],
    author: { name: "Sarah Johnson", verified: true },
    stats: { views: 1234 },
  },
  {
    id: "user2",
    type: "user",
    title: "Mike Chen",
    description:
      "UX Designer specialized in mobile applications and user research",
    image: "https://randomuser.me/api/portraits/men/44.jpg",
    location: "New York, NY",
    tags: ["UI/UX", "Figma", "Design", "Research"],
    author: { name: "Mike Chen", verified: true },
    stats: { views: 856 },
  },
  {
    id: "user3",
    type: "user",
    title: "Emma Williams",
    description: "Digital Marketing Expert & Content Creator",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    location: "London, UK",
    tags: ["Marketing", "SEO", "Content", "Social Media"],
    author: { name: "Emma Williams", verified: false },
    stats: { views: 567 },
  },
];

const mockProducts: SearchResult[] = [
  {
    id: "product1",
    type: "product",
    title: "Wireless Bluetooth Headphones",
    description:
      "Premium noise-cancelling headphones with 30-hour battery life and crystal clear sound quality",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
    price: 199.99,
    rating: 4.8,
    category: "Electronics",
    tags: ["Audio", "Wireless", "Premium", "Noise-Cancelling"],
    author: { name: "AudioTech Store", verified: true },
    stats: { views: 5678, likes: 234 },
  },
  {
    id: "product2",
    type: "product",
    title: "Smart Fitness Watch",
    description:
      "Advanced fitness tracker with heart rate monitoring, GPS, and 7-day battery life",
    image:
      "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=500&auto=format&fit=crop&q=60",
    price: 299.99,
    rating: 4.6,
    category: "Electronics",
    tags: ["Fitness", "Smartwatch", "Health", "GPS"],
    author: { name: "FitTech", verified: true },
    stats: { views: 3456, likes: 189 },
  },
  {
    id: "product3",
    type: "product",
    title: "Professional Camera Lens",
    description:
      "High-quality 50mm prime lens for professional photography and videography",
    image:
      "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500&auto=format&fit=crop&q=60",
    price: 899.99,
    rating: 4.9,
    category: "Photography",
    tags: ["Camera", "Lens", "Photography", "Professional"],
    author: { name: "PhotoGear Pro", verified: true },
    stats: { views: 2345, likes: 156 },
  },
];

const mockServices: SearchResult[] = [
  {
    id: "service1",
    type: "service",
    title: "Professional Logo Design",
    description:
      "Custom logo design with unlimited revisions, brand guidelines, and all file formats included",
    image:
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500&auto=format&fit=crop&q=60",
    price: 150,
    rating: 4.9,
    category: "Design",
    tags: ["Logo", "Branding", "Design", "Graphics"],
    author: { name: "Alex Designer", verified: true },
    stats: { views: 1890, likes: 78 },
  },
  {
    id: "service2",
    type: "service",
    title: "Website Development",
    description:
      "Full-stack web development using modern technologies like React, Node.js, and MongoDB",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=60",
    price: 2500,
    rating: 4.8,
    category: "Development",
    tags: ["Web Development", "React", "Full-Stack", "Modern"],
    author: { name: "DevStudio", verified: true },
    stats: { views: 2678, likes: 145 },
  },
];

const mockJobs: SearchResult[] = [
  {
    id: "job1",
    type: "job",
    title: "Senior Frontend Developer",
    description:
      "Remote position for experienced React developer. Join our innovative team building next-gen applications",
    price: 120,
    category: "Development",
    location: "Remote",
    tags: ["React", "Remote", "Senior", "Frontend"],
    author: { name: "TechCorp Inc", verified: true },
    stats: { views: 1234 },
  },
  {
    id: "job2",
    type: "job",
    title: "UX/UI Designer",
    description:
      "Creative designer needed for mobile app projects. Experience with Figma and user research required",
    price: 75,
    category: "Design",
    location: "San Francisco, CA",
    tags: ["UI/UX", "Mobile", "Figma", "Design"],
    author: { name: "Design Agency", verified: true },
    stats: { views: 890 },
  },
];

const mockPosts: SearchResult[] = [
  {
    id: "post1",
    type: "post",
    title: "The Future of Web Development in 2024",
    description:
      "Exploring emerging trends and technologies that will shape web development in the coming year...",
    timestamp: new Date("2024-01-15"),
    category: "Technology",
    tags: ["Web Dev", "Trends", "2024", "Future"],
    author: {
      name: "Tech Insider",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    stats: { views: 2345, likes: 156, comments: 23, shares: 45 },
  },
  {
    id: "post2",
    type: "post",
    title: "Mastering React Hooks: A Complete Guide",
    description:
      "Deep dive into React Hooks with practical examples and best practices for modern React development",
    timestamp: new Date("2024-01-12"),
    category: "Programming",
    tags: ["React", "Hooks", "JavaScript", "Tutorial"],
    author: {
      name: "Code Academy",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    stats: { views: 3456, likes: 234, comments: 67, shares: 89 },
  },
];

const mockVideos: SearchResult[] = [
  {
    id: "video1",
    type: "video",
    title: "How to Build a React App from Scratch",
    description:
      "Complete beginner-friendly tutorial covering React fundamentals and best practices",
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60",
    author: { name: "CodeMaster", verified: true },
    category: "Education",
    tags: ["React", "Tutorial", "Programming", "Beginner"],
    stats: { views: 12450, likes: 890, comments: 123 },
  },
  {
    id: "video2",
    type: "video",
    title: "Advanced CSS Animations",
    description:
      "Learn to create stunning animations using modern CSS techniques and keyframes",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60",
    author: { name: "CSS Wizard", verified: true },
    category: "Design",
    tags: ["CSS", "Animation", "Design", "Advanced"],
    stats: { views: 8765, likes: 567, comments: 89 },
  },
];

const mockCrypto: SearchResult[] = [
  {
    id: "crypto1",
    type: "crypto",
    title: "Bitcoin (BTC)",
    description:
      "Leading cryptocurrency with strong institutional adoption and store of value properties",
    price: 45000,
    category: "Cryptocurrency",
    tags: ["BTC", "Bitcoin", "Crypto", "Store of Value"],
    stats: { views: 15678 },
  },
  {
    id: "crypto2",
    type: "crypto",
    title: "Ethereum (ETH)",
    description:
      "Smart contract platform enabling decentralized applications and DeFi protocols",
    price: 2800,
    category: "Cryptocurrency",
    tags: ["ETH", "Ethereum", "Smart Contracts", "DeFi"],
    stats: { views: 12345 },
  },
];

// Combine all mock data
const allMockData: SearchResult[] = [
  ...mockUsers,
  ...mockProducts,
  ...mockServices,
  ...mockJobs,
  ...mockPosts,
  ...mockVideos,
  ...mockCrypto,
];

class GlobalSearchService {
  private baseUrl = '/api';

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private transformApiResults(apiResults: any[]): SearchResult[] {
    // Transform API response to SearchResult format
    return apiResults.map((item: any) => ({
      id: item.id || '',
      type: item.type || 'post',
      title: item.title || '',
      description: item.description || '',
      image: item.image,
      price: item.price,
      rating: item.rating,
      location: item.location,
      category: item.category,
      tags: item.tags || [],
      timestamp: item.timestamp ? new Date(item.timestamp) : undefined,
      author: item.author,
      stats: item.stats
    }));
  }

  async search(params: SearchParams): Promise<SearchResponse> {
    try {
      // Use only real API calls - no mock data fallback
      return await this.searchRealAPIs(params);
    } catch (error) {
      console.error('Search API failed:', error);
      // Return empty results on error instead of mock data
      return {
        results: [],
        totalCount: 0,
        currentPage: params.page || 1,
        totalPages: 0,
        suggestions: [],
        relatedSearches: [],
        facets: {
          categories: [],
          priceRanges: [],
          ratings: [],
          locations: []
        }
      };
    }
  }

  private async searchRealAPIs(params: SearchParams): Promise<SearchResponse> {
    const { query, type, filters = {}, page = 1, limit = 20 } = params;

    // Use apiClient.search for unified search
    try {
      const response = await apiClient.search(query, type, filters) as any;
      
      // Transform API response to expected format
      const results = this.transformApiResults(response.results || []);
      
      // Apply additional filters and sorting
      const filteredResults = this.applyFiltersAndSort(results, filters, query);
      
      // Pagination
      const startIndex = (page - 1) * limit;
      const paginatedResults = filteredResults.slice(startIndex, startIndex + limit);
      
      return {
        results: paginatedResults,
        totalCount: filteredResults.length,
        currentPage: page,
        totalPages: Math.ceil(filteredResults.length / limit),
        suggestions: await this.getSuggestions(query),
        relatedSearches: this.generateRelatedSearches(query),
        facets: this.generateFacets(filteredResults),
      };
    } catch (error) {
      console.error('Unified search API failed:', error);
      
      // Fallback to individual API searches
      const searchPromises = [];

      if (!type || type === 'all' || type === 'users') {
        searchPromises.push(this.searchUsers(query, filters));
      }
      if (!type || type === 'all' || type === 'products') {
        searchPromises.push(this.searchProducts(query, filters));
      }
      if (!type || type === 'all' || type === 'services' || type === 'jobs') {
        searchPromises.push(this.searchFreelance(query, filters));
      }
      if (!type || type === 'all' || type === 'posts') {
        searchPromises.push(this.searchPosts(query, filters));
      }
      if (!type || type === 'all' || type === 'videos') {
        searchPromises.push(this.searchVideos(query, filters));
      }
      if (!type || type === 'all' || type === 'crypto') {
        searchPromises.push(this.searchCrypto(query, filters));
      }

      const searchResults = await Promise.allSettled(searchPromises);

      // Combine results from all APIs
      let allResults: SearchResult[] = [];
      searchResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          allResults = allResults.concat(result.value);
        }
      });

      // Filter by type if specified
      let results = allResults;
      if (type && type !== 'all') {
        const targetType = type.endsWith('s') ? type.slice(0, -1) : type;
        results = results.filter((item) => item.type === targetType);
      }

      // Apply additional filters and sorting
      results = this.applyFiltersAndSort(results, filters, query);

      // Pagination
      const startIndex = (page - 1) * limit;
      const paginatedResults = results.slice(startIndex, startIndex + limit);

      return {
        results: paginatedResults,
        totalCount: results.length,
        currentPage: page,
        totalPages: Math.ceil(results.length / limit),
        suggestions: await this.getSuggestions(query),
        relatedSearches: this.generateRelatedSearches(query),
        facets: this.generateFacets(results),
      };
    }
  }

  private async searchMockData(params: SearchParams): Promise<SearchResponse> {
    // Simulate API delay
    await this.delay(200);

    const { query, type, filters = {}, page = 1, limit = 20 } = params;

    // Filter by search query
    let results = allMockData.filter((item) => {
      const searchText =
        `${item.title} ${item.description} ${item.tags?.join(" ") || ""}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });

    // Filter by type
    if (type && type !== "all") {
      const targetType = type.endsWith("s") ? type.slice(0, -1) : type; // Remove 's' for plural forms
      results = results.filter((item) => item.type === targetType);
    }

    // Apply filters and sorting
    results = this.applyFiltersAndSort(results, filters, query);



    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedResults = results.slice(startIndex, startIndex + limit);

    // Generate suggestions (simple implementation)
    const suggestions = this.generateSuggestions(query);

    // Generate related searches
    const relatedSearches = this.generateRelatedSearches(query);

    // Generate facets
    const facets = this.generateFacets(results);

    return {
      results: paginatedResults,
      totalCount: results.length,
      currentPage: page,
      totalPages: Math.ceil(results.length / limit),
      suggestions: this.generateSuggestions(query),
      relatedSearches: this.generateRelatedSearches(query),
      facets: this.generateFacets(results),
    };
  }

  // Real API search methods
  private async searchUsers(query: string, filters: SearchFilters): Promise<SearchResult[]> {
    try {
      // Validate input
      if (!query || typeof query !== 'string') {
        console.warn('Invalid search query provided:', query);
        return [];
      }
      
      // Sanitize query to prevent complex parsing issues
      const sanitizedQuery = query.trim().replace(/[^a-zA-Z0-9_\-.\s@]/g, '');
      
      // Use UserService to search for real users with sanitized query
      const { UserService } = await import('@/services/userService');
      const users = await UserService.searchUsers(sanitizedQuery, 20);
      
      if (!Array.isArray(users)) {
        console.warn('UserService.searchUsers returned invalid data:', users);
        return [];
      }
      
      return users.map((user) => ({
        id: user.id || `user-${Date.now()}-${Math.random()}`,
        type: 'user' as const,
        title: user.full_name || user.username || 'Unknown User',
        description: user.bio || (user.username ? `@${user.username}` : 'No bio available'),
        image: user.avatar_url || user.avatar || '/placeholder.svg',
        location: '',
        tags: [],
        author: { name: user.full_name || user.username || 'Unknown', verified: user.is_verified || false },
        stats: { views: 0 },
      })) || [];
    } catch (error) {
      console.error('Users search failed:', error);
      // Return empty array instead of failing completely
      return [];
    }
  }

  private async searchProducts(query: string, filters: SearchFilters): Promise<SearchResult[]> {
    try {
      // Validate input
      if (!query || typeof query !== 'string') {
        console.warn('Invalid search query provided for products:', query);
        return [];
      }
      
      const response = await fetch(`${this.baseUrl}/products/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Products search API failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      // Validate response data
      if (!data || !Array.isArray(data.products)) {
        console.warn('Invalid products data received:', data);
        return [];
      }
      
      return data.products.map((product: any) => ({
        id: product.id || `product-${Date.now()}-${Math.random()}`,
        type: 'product' as const,
        title: product.name || 'Untitled Product',
        description: product.description || 'No description available',
        image: product.images?.[0] || '/placeholder.svg',
        price: product.price || 0,
        rating: product.rating || 0,
        category: product.category || 'Uncategorized',
        tags: Array.isArray(product.tags) ? product.tags : [],
        author: { 
          name: product.seller?.name || 'Unknown Seller', 
          verified: product.seller?.verified || false 
        },
        stats: { 
          views: product.views || 0, 
          likes: product.likes || 0 
        },
      })) || [];
    } catch (error) {
      console.error('Products search failed:', error);
      // Return empty array instead of failing completely
      return [];
    }
  }

  private async searchFreelance(query: string, filters: SearchFilters): Promise<SearchResult[]> {
    try {
      // Validate input
      if (!query || typeof query !== 'string') {
        console.warn('Invalid search query provided for freelance:', query);
        return [];
      }
      
      const response = await fetch(`${this.baseUrl}/freelance/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Freelance search API failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      // Validate response data
      if (!data) {
        console.warn('Invalid freelance data received:', data);
        return [];
      }

      const jobResults = Array.isArray(data.jobs) ? data.jobs.map((job: any) => ({
        id: job.id || `job-${Date.now()}-${Math.random()}`,
        type: 'job' as const,
        title: job.title || 'Untitled Job',
        description: job.description || 'No description available',
        price: job.budget || 0,
        category: job.category || 'Uncategorized',
        location: job.location || 'Remote',
        tags: Array.isArray(job.skills) ? job.skills : [],
        author: { 
          name: job.client?.name || 'Unknown Client', 
          verified: job.client?.verified || false 
        },
        stats: { views: job.views || 0 },
      })) : [];

      const serviceResults = Array.isArray(data.services) ? data.services.map((service: any) => ({
        id: service.id || `service-${Date.now()}-${Math.random()}`,
        type: 'service' as const,
        title: service.title || 'Untitled Service',
        description: service.description || 'No description available',
        image: service.images?.[0] || '/placeholder.svg',
        price: service.price || 0,
        rating: service.rating || 0,
        category: service.category || 'Uncategorized',
        tags: Array.isArray(service.tags) ? service.tags : [],
        author: { 
          name: service.freelancer?.name || 'Unknown Freelancer', 
          verified: service.freelancer?.verified || false 
        },
        stats: { 
          views: service.views || 0, 
          likes: service.likes || 0 
        },
      })) : [];

      return [...jobResults, ...serviceResults];
    } catch (error) {
      console.error('Freelance search failed:', error);
      // Return empty array instead of failing completely
      return [];
    }
  }

  private async searchPosts(query: string, filters: SearchFilters): Promise<SearchResult[]> {
    try {
      // Validate input
      if (!query || typeof query !== 'string') {
        console.warn('Invalid search query provided for posts:', query);
        return [];
      }
      
      const response = await fetch(`${this.baseUrl}/posts/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Posts search API failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      // Validate response data
      if (!data || !Array.isArray(data.posts)) {
        console.warn('Invalid posts data received:', data);
        return [];
      }
      
      return data.posts.map((post: any) => ({
        id: post.id || `post-${Date.now()}-${Math.random()}`,
        type: 'post' as const,
        title: post.title || (post.content ? post.content.substring(0, 50) + '...' : 'Untitled Post'),
        description: post.content || 'No content available',
        timestamp: post.createdAt ? new Date(post.createdAt) : new Date(),
        category: post.category || 'General',
        tags: Array.isArray(post.hashtags) ? post.hashtags : [],
        author: {
          name: post.author?.name || 'Anonymous',
          avatar: post.author?.avatar || '/placeholder.svg',
          verified: post.author?.verified || false
        },
        stats: {
          views: post.views || 0,
          likes: post.likes || 0,
          comments: post.commentsCount || 0,
          shares: post.sharesCount || 0
        },
      })) || [];
    } catch (error) {
      console.error('Posts search failed:', error);
      // Return empty array instead of failing completely
      return [];
    }
  }

  private async searchVideos(query: string, filters: SearchFilters): Promise<SearchResult[]> {
    try {
      // Validate input
      if (!query || typeof query !== 'string') {
        console.warn('Invalid search query provided for videos:', query);
        return [];
      }
      
      const response = await fetch(`${this.baseUrl}/videos/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Videos search API failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      // Validate response data
      if (!data || !Array.isArray(data.videos)) {
        console.warn('Invalid videos data received:', data);
        return [];
      }
      
      return data.videos.map((video: any) => ({
        id: video.id || `video-${Date.now()}-${Math.random()}`,
        type: 'video' as const,
        title: video.title || 'Untitled Video',
        description: video.description || 'No description available',
        image: video.thumbnail || '/placeholder.svg',
        author: { 
          name: video.creator?.name || 'Unknown Creator', 
          verified: video.creator?.verified || false 
        },
        category: video.category || 'General',
        tags: Array.isArray(video.tags) ? video.tags : [],
        stats: { 
          views: video.views || 0, 
          likes: video.likes || 0, 
          comments: video.commentsCount || 0 
        },
      })) || [];
    } catch (error) {
      console.error('Videos search failed:', error);
      // Return empty array instead of failing completely
      return [];
    }
  }

  private async searchCrypto(query: string, filters: SearchFilters): Promise<SearchResult[]> {
    try {
      // Validate input
      if (!query || typeof query !== 'string') {
        console.warn('Invalid search query provided for crypto:', query);
        return [];
      }
      
      const response = await fetch(`${this.baseUrl}/crypto/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Crypto search API failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      // Validate response data
      if (!data || !Array.isArray(data.cryptos)) {
        console.warn('Invalid crypto data received:', data);
        return [];
      }
      
      return data.cryptos.map((crypto: any) => ({
        id: crypto.id || `crypto-${Date.now()}-${Math.random()}`,
        type: 'crypto' as const,
        title: `${crypto.name || 'Unknown'} (${crypto.symbol || 'N/A'})`,
        description: crypto.description || 'No description available',
        price: crypto.price || 0,
        category: 'Cryptocurrency',
        tags: [crypto.symbol || '', crypto.name || '', 'crypto'].filter(tag => tag),
        stats: { views: crypto.views || 0 },
      })) || [];
    } catch (error) {
      console.error('Crypto search failed:', error);
      // Return empty array instead of failing completely
      return [];
    }
  }

  private applyFiltersAndSort(results: SearchResult[], filters: SearchFilters, query: string): SearchResult[] {
    let filteredResults = [...results];

    // Apply filters
    if (filters.category) {
      filteredResults = filteredResults.filter(
        (item) => item.category?.toLowerCase() === filters.category?.toLowerCase(),
      );
    }

    if (filters.priceMin || filters.priceMax) {
      filteredResults = filteredResults.filter((item) => {
        if (!item.price) return false;
        const min = filters.priceMin ? parseFloat(filters.priceMin) : 0;
        const max = filters.priceMax ? parseFloat(filters.priceMax) : Infinity;
        return item.price >= min && item.price <= max;
      });
    }

    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      filteredResults = filteredResults.filter(
        (item) => item.rating && item.rating >= minRating,
      );
    }

    if (filters.location) {
      filteredResults = filteredResults.filter((item) =>
        item.location?.toLowerCase().includes(filters.location?.toLowerCase() || ""),
      );
    }

    // Sort results
    filteredResults.sort((a, b) => {
      const order = filters.sortOrder === "asc" ? 1 : -1;

      switch (filters.sortBy) {
        case "date":
          const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return (dateB - dateA) * order;

        case "rating":
          return ((b.rating || 0) - (a.rating || 0)) * order;

        case "price":
          return ((a.price || 0) - (b.price || 0)) * order;

        case "popularity":
          return ((b.stats?.views || 0) - (a.stats?.views || 0)) * order;

        case "alphabetical":
          return a.title.localeCompare(b.title) * order;

        default: // relevance
          // Enhanced relevance scoring
          const scoreA = this.calculateRelevanceScore(a, query);
          const scoreB = this.calculateRelevanceScore(b, query);
          return (scoreB - scoreA) * order;
      }
    });

    return filteredResults;
  }

  private calculateRelevanceScore(item: SearchResult, query: string): number {
    const lowerQuery = query.toLowerCase();
    const lowerTitle = item.title.toLowerCase();
    const lowerDescription = item.description.toLowerCase();

    let score = 0;

    // Exact title match
    if (lowerTitle === lowerQuery) score += 100;
    // Title starts with query
    else if (lowerTitle.startsWith(lowerQuery)) score += 80;
    // Title contains query
    else if (lowerTitle.includes(lowerQuery)) score += 60;

    // Description contains query
    if (lowerDescription.includes(lowerQuery)) score += 20;

    // Tags match
    if (item.tags) {
      item.tags.forEach(tag => {
        if (tag.toLowerCase().includes(lowerQuery)) score += 30;
      });
    }

    // Category match
    if (item.category && item.category.toLowerCase().includes(lowerQuery)) score += 40;

    // Boost by popularity
    if (item.stats?.views) score += Math.log(item.stats.views) * 0.1;
    if (item.rating) score += item.rating * 5;

    return score;
  }

  private generateSuggestions(query: string): string[] {
    const commonSuggestions = [
      "react development",
      "ui ux design",
      "freelance projects",
      "crypto trading",
      "product photography",
      "web development",
      "digital marketing",
      "mobile app design",
      "content writing",
      "video editing",
    ];

    return commonSuggestions
      .filter(
        (suggestion) =>
          suggestion.toLowerCase().includes(query.toLowerCase()) ||
          query.toLowerCase().includes(suggestion.toLowerCase().split(" ")[0]),
      )
      .slice(0, 5);
  }

  private generateRelatedSearches(query: string): string[] {
    const relatedMap: Record<string, string[]> = {
      react: ["react hooks", "react native", "react tutorial", "react jobs"],
      design: ["ui design", "graphic design", "web design", "logo design"],
      crypto: ["bitcoin", "ethereum", "trading", "blockchain"],
      development: [
        "web development",
        "app development",
        "frontend",
        "backend",
      ],
      freelance: ["freelance jobs", "remote work", "gig economy", "contractor"],
    };

    const lowerQuery = query.toLowerCase();
    for (const [key, related] of Object.entries(relatedMap)) {
      if (lowerQuery.includes(key)) {
        return related.slice(0, 4);
      }
    }

    return [
      "popular searches",
      "trending topics",
      "new listings",
      "featured content",
    ];
  }

  private generateFacets(results: SearchResult[]) {
    const categories = new Map<string, number>();
    const priceRanges = new Map<string, number>();
    const ratings = new Map<number, number>();
    const locations = new Map<string, number>();

    results.forEach((result) => {
      // Categories
      if (result.category) {
        categories.set(
          result.category,
          (categories.get(result.category) || 0) + 1,
        );
      }

      // Price ranges
      if (result.price) {
        let range = "";
        if (result.price < 50) range = "Under $50";
        else if (result.price < 200) range = "$50 - $200";
        else if (result.price < 500) range = "$200 - $500";
        else if (result.price < 1000) range = "$500 - $1000";
        else range = "Over $1000";

        priceRanges.set(range, (priceRanges.get(range) || 0) + 1);
      }

      // Ratings
      if (result.rating) {
        const roundedRating = Math.floor(result.rating);
        ratings.set(roundedRating, (ratings.get(roundedRating) || 0) + 1);
      }

      // Locations
      if (result.location) {
        locations.set(
          result.location,
          (locations.get(result.location) || 0) + 1,
        );
      }
    });

    return {
      categories: Array.from(categories.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),

      priceRanges: Array.from(priceRanges.entries())
        .map(([range, count]) => ({ range, count }))
        .sort((a, b) => b.count - a.count),

      ratings: Array.from(ratings.entries())
        .map(([rating, count]) => ({ rating, count }))
        .sort((a, b) => b.rating - a.rating),

      locations: Array.from(locations.entries())
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count),
    };
  }

  async getPopularSearches(): Promise<string[]> {
    await this.delay(100);
    return [
      "react development",
      "ui ux design",
      "freelance writing",
      "bitcoin trading",
      "logo design",
      "web development",
      "social media marketing",
      "video editing",
      "photography",
      "mobile app development",
    ];
  }

  async getTrendingTopics(): Promise<string[]> {
    await this.delay(100);
    return [
      "AI automation",
      "blockchain development",
      "remote work",
      "cryptocurrency",
      "sustainable design",
      "no-code development",
      "digital nomad",
      "NFT marketplace",
      "web3 development",
      "machine learning",
    ];
  }

  async getSuggestions(query: string): Promise<string[]> {
    await this.delay(100);
    return this.generateSuggestions(query);
  }

  // Analytics methods
  async trackSearch(query: string, resultCount: number): Promise<void> {
    // Track search analytics
    console.log(`Search tracked: "${query}" - ${resultCount} results`);
  }

  async trackResultClick(
    resultId: string,
    resultType: string,
    position: number,
  ): Promise<void> {
    // Track result click analytics
    console.log(
      `Result clicked: ${resultType}:${resultId} at position ${position}`,
    );
  }
}

export const globalSearchService = new GlobalSearchService();
export type { SearchResult, SearchFilters, SearchParams, SearchResponse };
