// @ts-nocheck
// @ts-nocheck
/**
 * Real API Integration Service
 * Integrates with actual APIs for live data (when API keys are available)
 * Falls back to intelligent simulation when APIs are not available
 */

interface APIResponse<T> {
  success: boolean;
  data: T;
  source: "real_api" | "simulation";
  timestamp: number;
  error?: string;
}

interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
  marketCap?: number;
  volume24h?: number;
  high24h?: number;
  low24h?: number;
}

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast?: Array<{
    time: string;
    temp: number;
    condition: string;
  }>;
}

interface NewsItem {
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  category: string;
  url?: string;
}

export class RealAPIService {
  private cache = new Map<string, any>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cryptocurrency data from real APIs or intelligent simulation
   */
  async getCryptoPrice(
    symbol: string = "bitcoin",
  ): Promise<APIResponse<CryptoPrice>> {
    const cacheKey = `crypto_${symbol}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Fetch from backend CryptoAPIs integration
      const response = await this.fetchCryptoData(symbol);
      if (response.success) {
        this.setCache(cacheKey, response);
        return response;
      }
    } catch (error) {
      console.log("Real crypto API unavailable, using intelligent simulation");
    }

    // Fallback to intelligent simulation
    const simulatedData = this.simulateIntelligentCryptoData(symbol);
    this.setCache(cacheKey, simulatedData);
    return simulatedData;
  }

  /**
   * Get weather data from real APIs or intelligent simulation
   */
  async getWeatherData(
    location: string = "auto",
  ): Promise<APIResponse<WeatherData>> {
    const cacheKey = `weather_${location}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Try OpenWeatherMap API (requires API key)
      const response = await this.fetchOpenWeatherData(location);
      if (response.success) {
        this.setCache(cacheKey, response);
        return response;
      }
    } catch (error) {
      console.log("Real weather API unavailable, using intelligent simulation");
    }

    // Fallback to intelligent simulation
    const simulatedData = this.simulateIntelligentWeatherData(location);
    this.setCache(cacheKey, simulatedData);
    return simulatedData;
  }

  /**
   * Get news data from real APIs or intelligent simulation
   */
  async getNewsData(
    category: string = "general",
  ): Promise<APIResponse<NewsItem[]>> {
    const cacheKey = `news_${category}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Try NewsAPI (requires API key)
      const response = await this.fetchNewsAPIData(category);
      if (response.success) {
        this.setCache(cacheKey, response);
        return response;
      }
    } catch (error) {
      console.log("Real news API unavailable, using intelligent simulation");
    }

    // Fallback to intelligent simulation
    const simulatedData = this.simulateIntelligentNewsData(category);
    this.setCache(cacheKey, simulatedData);
    return simulatedData;
  }

  /**
   * Get stock market data
   */
  async getStockData(symbol: string = "SPY"): Promise<APIResponse<any>> {
    const cacheKey = `stock_${symbol}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    // Simulate stock data (Alpha Vantage would be the real API)
    const simulatedData = this.simulateStockData(symbol);
    this.setCache(cacheKey, simulatedData);
    return simulatedData;
  }

  // Real API Integration Methods (when API keys are available)

  private async fetchCryptoData(
    symbol: string,
  ): Promise<APIResponse<CryptoPrice>> {
    // Use backend endpoint that uses CryptoAPIs integration
    const symbolMap: Record<string, string> = {
      'bitcoin': 'bitcoin',
      'ethereum': 'ethereum',
      'tether': 'tether',
      'binancecoin': 'binancecoin',
      'solana': 'solana',
      'cardano': 'cardano',
      'polkadot': 'polkadot',
      'avalanche': 'avalanche',
      'chainlink': 'chainlink',
      'polygon': 'polygon',
      'dogecoin': 'dogecoin'
    };

    const coinId = Object.keys(symbolMap).find(key => key.includes(symbol.toLowerCase())) || symbol.toLowerCase();

    try {
      const response = await fetch(`/api/crypto/prices?symbols=${coinId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      const priceData = data.prices?.[coinId];

      if (!priceData) throw new Error("Coin not found");

      return {
        success: true,
        data: {
          symbol: symbol.toUpperCase(),
          price: parseFloat(priceData.usd || '0'),
          change24h: parseFloat(priceData.usd_24h_change || '0'),
          marketCap: parseFloat(priceData.usd_market_cap || '0'),
          volume24h: parseFloat(priceData.usd_24h_vol || '0'),
        },
        source: "real_api",
        timestamp: Date.now(),
      };
    } catch (error) {
      throw error;
    }
  }

  private async fetchOpenWeatherData(
    location: string,
  ): Promise<APIResponse<WeatherData>> {
    // OpenWeatherMap API (requires API key)
    const apiKey = ((typeof process !== 'undefined' && process.env && process.env.OPENWEATHER_API_KEY) || import.meta.env?.VITE_OPENWEATHER_API_KEY || "demo_key");
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=imperial`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Weather API request failed");

      const data = await response.json();

      return {
        success: true,
        data: {
          location: data.name,
          temperature: data.main.temp,
          condition: data.weather[0].description,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
        },
        source: "real_api",
        timestamp: Date.now(),
      };
    } catch (error) {
      throw error;
    }
  }

  private async fetchNewsAPIData(
    category: string,
  ): Promise<APIResponse<NewsItem[]>> {
    // NewsAPI (requires API key)
    const apiKey = ((typeof process !== 'undefined' && process.env && process.env.NEWS_API_KEY) || import.meta.env?.VITE_NEWS_API_KEY || "demo_key");
    const url = `https://newsapi.org/v2/top-headlines?category=${category}&country=us&apiKey=${apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("News API request failed");

      const data = await response.json();

      const newsItems: NewsItem[] = data.articles
        .slice(0, 5)
        .map((article: any) => ({
          title: article.title,
          summary: article.description || article.title,
          source: article.source.name,
          publishedAt: article.publishedAt,
          category: category,
          url: article.url,
        }));

      return {
        success: true,
        data: newsItems,
        source: "real_api",
        timestamp: Date.now(),
      };
    } catch (error) {
      throw error;
    }
  }

  // Intelligent Simulation Methods (fallbacks with realistic data)

  private simulateIntelligentCryptoData(
    symbol: string,
  ): APIResponse<CryptoPrice> {
    const cryptoPrices: Record<string, Partial<CryptoPrice>> = {
      bitcoin: { price: 43500, marketCap: 850000000000 },
      ethereum: { price: 2650, marketCap: 320000000000 },
      cardano: { price: 0.45, marketCap: 15000000000 },
      solana: { price: 65, marketCap: 28000000000 },
    };

    const baseData = cryptoPrices[symbol] || {
      price: 100,
      marketCap: 1000000000,
    };

    // Add realistic variation
    const priceVariation = (Math.random() - 0.5) * 0.1; // ±5%
    const price = baseData.price! * (1 + priceVariation);
    const change24h = (Math.random() - 0.5) * 10; // ±5%

    return {
      success: true,
      data: {
        symbol,
        price: Math.round(price * 100) / 100,
        change24h: Math.round(change24h * 100) / 100,
        marketCap: baseData.marketCap,
        volume24h: (baseData.marketCap || 0) * 0.03, // 3% of market cap
        high24h: price * 1.03,
        low24h: price * 0.97,
      },
      source: "simulation",
      timestamp: Date.now(),
    };
  }

  private simulateIntelligentWeatherData(
    location: string,
  ): APIResponse<WeatherData> {
    const currentHour = new Date().getHours();
    const season = this.getCurrentSeason();

    // Base temperature on season and time
    let baseTemp = 72;
    if (season === "winter") baseTemp = 45;
    else if (season === "summer") baseTemp = 85;
    else if (season === "spring") baseTemp = 68;
    else baseTemp = 60; // fall

    // Add daily variation
    if (currentHour < 6 || currentHour > 20)
      baseTemp -= 8; // cooler at night
    else if (currentHour > 12 && currentHour < 16) baseTemp += 5; // warmer afternoon

    const conditions = [
      "Sunny",
      "Partly Cloudy",
      "Cloudy",
      "Light Rain",
      "Clear",
    ];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];

    return {
      success: true,
      data: {
        location: location === "auto" ? "Your Location" : location,
        temperature: baseTemp + (Math.random() - 0.5) * 10,
        condition,
        humidity: 45 + Math.random() * 30,
        windSpeed: 5 + Math.random() * 10,
        forecast: this.generateForecast(baseTemp),
      },
      source: "simulation",
      timestamp: Date.now(),
    };
  }

  private simulateIntelligentNewsData(
    category: string,
  ): APIResponse<NewsItem[]> {
    const newsTemplates = {
      technology: [
        "AI Breakthrough in Medical Diagnosis Shows 95% Accuracy Rate",
        "New Smartphone Technology Promises 7-Day Battery Life",
        "Quantum Computing Milestone Achieved by Leading Tech Company",
        "Social Media Platform Introduces Revolutionary Privacy Features",
        "Electric Vehicle Sales Surge 300% in Global Markets",
      ],
      business: [
        "Stock Market Reaches New Heights Amid Economic Optimism",
        "Cryptocurrency Adoption Accelerates Among Fortune 500 Companies",
        "Small Business Recovery Shows Strong Momentum Nationwide",
        "Green Energy Investments Surpass Traditional Energy Funding",
        "Remote Work Culture Reshapes Commercial Real Estate Markets",
      ],
      general: [
        "Global Climate Initiative Launches with 50 Country Commitment",
        "Medical Research Breakthrough Offers Hope for Cancer Treatment",
        "International Space Station Welcomes New Scientific Experiments",
        "Educational Technology Transforms Learning in Underserved Communities",
        "Cultural Festival Celebrates Diversity in Major Cities Worldwide",
      ],
    };

    const templates =
      newsTemplates[category as keyof typeof newsTemplates] ||
      newsTemplates.general;
    const selectedNews = templates.slice(0, 3 + Math.floor(Math.random() * 3));

    const newsItems: NewsItem[] = selectedNews.map((title, index) => ({
      title,
      summary: `${title.substring(0, 50)}... Read more for detailed coverage of this developing story.`,
      source: [
        "TechCrunch",
        "Reuters",
        "Associated Press",
        "Bloomberg",
        "BBC News",
      ][index % 5],
      publishedAt: new Date(Date.now() - (index + 1) * 3600000).toISOString(), // Hours ago
      category,
    }));

    return {
      success: true,
      data: newsItems,
      source: "simulation",
      timestamp: Date.now(),
    };
  }

  private simulateStockData(symbol: string): APIResponse<any> {
    const stockPrices: Record<string, number> = {
      SPY: 450,
      QQQ: 380,
      AAPL: 175,
      GOOGL: 140,
      MSFT: 375,
    };

    const basePrice = stockPrices[symbol] || 100;
    const change = (Math.random() - 0.5) * 5; // ±2.5%
    const price = basePrice + change;

    return {
      success: true,
      data: {
        symbol,
        price: Math.round(price * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round((change / basePrice) * 10000) / 100,
        volume: Math.floor(Math.random() * 1000000),
      },
      source: "simulation",
      timestamp: Date.now(),
    };
  }

  // Helper methods

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "spring";
    if (month >= 5 && month <= 7) return "summer";
    if (month >= 8 && month <= 10) return "fall";
    return "winter";
  }

  private generateForecast(
    baseTemp: number,
  ): Array<{ time: string; temp: number; condition: string }> {
    const hours = ["12 PM", "3 PM", "6 PM", "9 PM"];
    const conditions = ["Sunny", "Partly Cloudy", "Cloudy"];

    return hours.map((hour) => ({
      time: hour,
      temp: Math.round(baseTemp + (Math.random() - 0.5) * 6),
      condition: conditions[Math.floor(Math.random() * conditions.length)],
    }));
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { ...data, timestamp: Date.now() });
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const realAPIService = new RealAPIService();
