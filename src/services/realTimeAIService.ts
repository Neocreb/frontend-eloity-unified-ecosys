import { IntelligentAIResponse, AIAction } from "./intelligentAIService";
import { eloityKnowledgeService } from "./eloityKnowledgeService";

interface User {
  id: string;
  name?: string;
  email?: string;
}

interface RealTimeData {
  timestamp: number;
  source: string;
  data: any;
}

interface EloityKnowledge {
  features: Record<string, any>;
  howTo: Record<string, string[]>;
  tips: Record<string, string[]>;
  troubleshooting: Record<string, any>;
}

interface ConversationAnalysis {
  sentiment: "positive" | "negative" | "neutral";
  intent: string;
  topics: string[];
  urgency: "low" | "medium" | "high";
  emotionalContext: string;
  previousContext: string[];
}

export class RealTimeAIService {
  private cache: Map<string, RealTimeData> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Comprehensive Eloity platform knowledge
  private eloityKnowledge: EloityKnowledge = {
    features: {
      social: {
        name: "Social Feed & Content",
        description:
          "Your personal timeline where you connect with friends, share posts, stories, and build your community.",
        capabilities: [
          "Create posts",
          "Share stories",
          "Like and comment",
          "Follow friends",
          "Join groups",
          "Live streaming",
          "Video creation",
        ],
      },
      crypto: {
        name: "Cryptocurrency Trading",
        description:
          "Complete crypto ecosystem with real-time trading, P2P exchange, portfolio tracking, and market analysis.",
        capabilities: [
          "Buy/sell crypto",
          "P2P trading",
          "Portfolio tracking",
          "Market analysis",
          "Price alerts",
          "Trading signals",
        ],
      },
      marketplace: {
        name: "Digital Marketplace",
        description:
          "Buy and sell products, both digital and physical, with secure payments and seller protection.",
        capabilities: [
          "List products",
          "Secure payments",
          "Seller dashboard",
          "Product analytics",
          "Customer reviews",
          "Shipping integration",
        ],
      },
      freelance: {
        name: "Freelance Platform",
        description:
          "Connect with clients, showcase your skills, and build your freelance career with project management tools.",
        capabilities: [
          "Create profile",
          "Find projects",
          "Proposal system",
          "Time tracking",
          "Secure payments",
          "Client reviews",
        ],
      },
      wallet: {
        name: "Digital Wallet",
        description:
          "Unified wallet for managing crypto, fiat, earnings from all platform activities.",
        capabilities: [
          "Multi-currency support",
          "Instant transfers",
          "Payment history",
          "Security features",
          "Integration with all platform features",
        ],
      },
      aiAssistant: {
        name: "AI Assistant (Edith)",
        description:
          "Your personal AI companion that helps with platform features, provides real-time information, and offers friendly conversation.",
        capabilities: [
          "Real-time data",
          "Platform guidance",
          "Personal assistance",
          "Friendly chat",
          "24/7 availability",
        ],
      },
      premium: {
        name: "Premium Membership",
        description:
          "Enhanced features, priority support, exclusive content, and advanced tools for power users.",
        capabilities: [
          "Ad-free experience",
          "Priority support",
          "Advanced analytics",
          "Exclusive features",
          "Higher limits",
        ],
      },
      rewards: {
        name: "Eloity Points Rewards",
        description:
          "Earn points for platform activity and redeem for real rewards, gift cards, and platform benefits.",
        capabilities: [
          "Earn through activity",
          "Redeem rewards",
          "Gift cards",
          "Platform benefits",
          "Loyalty bonuses",
        ],
      },
    },
    howTo: {
      "create account": [
        "Click 'Sign Up' in the top right corner",
        "Enter your email and create a strong password",
        "Verify your email address",
        "Complete your profile with a photo and bio",
        "Start exploring and connecting!",
      ],
      "post content": [
        "Go to your Feed page",
        "Click 'Create Post' or the '+' button",
        "Choose your content type (text, image, video)",
        "Write your caption and add hashtags",
        "Set your privacy settings",
        "Click 'Post' to share with your community",
      ],
      "start trading crypto": [
        "Navigate to the Crypto section",
        "Complete KYC verification if needed",
        "Link your payment method",
        "Browse available cryptocurrencies",
        "Click 'Buy' on your chosen crypto",
        "Enter amount and confirm transaction",
      ],
      "sell on marketplace": [
        "Go to Marketplace and click 'Sell'",
        "Upload high-quality product photos",
        "Write detailed product description",
        "Set competitive pricing",
        "Choose shipping options",
        "Publish your listing",
      ],
      "find freelance work": [
        "Visit the Freelance section",
        "Complete your professional profile",
        "Browse available projects",
        "Submit compelling proposals",
        "Highlight relevant experience",
        "Build client relationships",
      ],
      "earn eloits": [
        "Stay active by posting and engaging daily",
        "Complete your profile 100%",
        "Refer friends to join Eloity",
        "Participate in community events",
        "Use different platform features",
        "Maintain positive community standing",
      ],
    },
    tips: {
      "content creation": [
        "Post consistently - aim for 1-3 posts daily",
        "Use trending hashtags relevant to your content",
        "Engage authentically with your community",
        "Share a mix of personal and professional content",
        "Use high-quality images and videos",
        "Post during peak hours (7-9 PM)",
      ],
      "crypto trading": [
        "Start small and learn as you go",
        "Never invest more than you can afford to lose",
        "Do your research before buying any crypto",
        "Use dollar-cost averaging for long-term investing",
        "Keep your crypto secure in the wallet",
        "Stay updated with market news and trends",
      ],
      "marketplace success": [
        "Take professional-quality photos",
        "Write detailed, honest descriptions",
        "Price competitively based on market research",
        "Respond quickly to customer inquiries",
        "Maintain excellent customer service",
        "Build positive reviews and reputation",
      ],
      freelancing: [
        "Showcase your best work in your portfolio",
        "Write personalized proposals for each job",
        "Set realistic timelines and stick to them",
        "Communicate clearly with clients",
        "Deliver high-quality work consistently",
        "Build long-term client relationships",
      ],
    },
    troubleshooting: {
      "login issues": {
        solutions: [
          "Reset your password using 'Forgot Password'",
          "Clear browser cache and cookies",
          "Try a different browser",
          "Check if account is verified",
        ],
        common: "Usually resolved by password reset or browser cache clearing",
      },
      "payment problems": {
        solutions: [
          "Verify payment method is valid",
          "Check account balance",
          "Contact support if persistent",
          "Try alternative payment method",
        ],
        common:
          "Most payment issues are due to expired cards or insufficient funds",
      },
      "slow performance": {
        solutions: [
          "Clear browser cache",
          "Close unnecessary tabs",
          "Check internet connection",
          "Try different browser",
        ],
        common: "Performance usually improves after clearing cache",
      },
    },
  };

  // Enhanced personality traits for intelligent conversation
  private personalityTraits = {
    greeting: [
      "Hey there!",
      "Hi friend!",
      "Hello!",
      "Hey!",
      "Hi there!",
      "Good to see you!",
      "Welcome back!",
    ],
    enthusiasm: [
      "That's awesome!",
      "How exciting!",
      "That sounds great!",
      "Wonderful!",
      "Amazing!",
      "Fantastic!",
      "That's incredible!",
      "Love that energy!",
    ],
    support: [
      "I'm here for you",
      "You've got this!",
      "I believe in you",
      "Don't worry, we'll figure it out",
      "I'm always here to help",
      "We can work through this together",
      "You're stronger than you think",
      "I'm in your corner",
    ],
    casual: [
      "totally",
      "definitely",
      "absolutely",
      "for sure",
      "absolutely right",
      "exactly",
      "spot on",
      "you got it",
    ],
    empathy: [
      "I understand how you feel",
      "That must be tough",
      "I hear you",
      "That makes sense",
      "I can relate to that",
      "Your feelings are valid",
      "That sounds really challenging",
      "I'm here to listen",
    ],
    encouragement: [
      "You're making great progress!",
      "Keep up the amazing work!",
      "You're on the right track!",
      "That's a smart approach!",
      "You're learning so fast!",
      "I'm proud of you!",
    ],
    curiosity: [
      "Tell me more about that!",
      "That sounds fascinating!",
      "I'd love to hear more!",
      "What's that like?",
      "How did that make you feel?",
      "That's really interesting!",
    ],
  };

  // Advanced knowledge base for general topics
  private knowledgeBase = {
    technology: {
      ai: "Artificial Intelligence is transforming how we interact with technology, making systems smarter and more helpful.",
      blockchain:
        "Blockchain technology provides secure, decentralized record-keeping that powers cryptocurrencies and many other applications.",
      programming:
        "Programming is the art of giving instructions to computers to solve problems and create amazing digital experiences.",
    },
    lifestyle: {
      productivity:
        "Productivity is about working smarter, not harder - finding systems and habits that help you achieve your goals efficiently.",
      wellness:
        "Wellness encompasses physical health, mental wellbeing, and finding balance in all aspects of life.",
      learning:
        "Continuous learning keeps your mind sharp and opens new opportunities - every day is a chance to grow!",
    },
    business: {
      entrepreneurship:
        "Entrepreneurship is about identifying problems and creating innovative solutions that provide value to others.",
      marketing:
        "Marketing is the art of connecting with your audience and communicating the value of what you offer.",
      finance:
        "Financial literacy is crucial for making smart money decisions and building long-term wealth.",
    },
  };

  /**
   * Generate intelligent response with real-time data integration
   */
  async generateRealTimeResponse(
    query: string,
    user: User,
    context?: string[],
  ): Promise<IntelligentAIResponse> {
    const normalizedQuery = query.toLowerCase().trim();

    try {
      // Enhanced conversation context understanding
      const conversationAnalysis = this.analyzeConversationContext(
        query,
        context,
      );

      // Check for real-time queries
      if (this.isTimeQuery(normalizedQuery)) {
        return await this.handleTimeQuery(
          normalizedQuery,
          conversationAnalysis,
        );
      }

      if (this.isCryptoQuery(normalizedQuery)) {
        return await this.handleCryptoQuery(
          normalizedQuery,
          conversationAnalysis,
        );
      }

      if (this.isWeatherQuery(normalizedQuery)) {
        return await this.handleWeatherQuery(
          normalizedQuery,
          conversationAnalysis,
        );
      }

      if (this.isNewsQuery(normalizedQuery)) {
        return await this.handleNewsQuery(
          normalizedQuery,
          conversationAnalysis,
        );
      }

      if (this.isMarketQuery(normalizedQuery)) {
        return await this.handleMarketQuery(
          normalizedQuery,
          conversationAnalysis,
        );
      }

      // Handle calculation queries
      if (this.isCalculationQuery(normalizedQuery)) {
        return this.handleCalculationQuery(
          normalizedQuery,
          conversationAnalysis,
        );
      }

      // Enhanced knowledge base queries
      if (this.isKnowledgeQuery(normalizedQuery)) {
        return await this.handleKnowledgeQuery(
          normalizedQuery,
          user,
          conversationAnalysis,
        );
      }

      // Handle Eloity platform queries
      if (this.isEloityQuery(normalizedQuery)) {
        return this.handleEloityQuery(
          normalizedQuery,
          user,
          conversationAnalysis,
        );
      }

      // Handle personal/emotional queries with enhanced empathy
      if (this.isPersonalQuery(normalizedQuery)) {
        return this.handlePersonalQuery(
          normalizedQuery,
          user,
          conversationAnalysis,
        );
      }

      // Handle casual conversation with personality
      if (this.isCasualQuery(normalizedQuery)) {
        return this.handleCasualQuery(
          normalizedQuery,
          user,
          conversationAnalysis,
        );
      }

      // Enhanced problem-solving capabilities
      if (this.isProblemSolvingQuery(normalizedQuery)) {
        return this.handleProblemSolvingQuery(
          normalizedQuery,
          user,
          conversationAnalysis,
        );
      }

      // Fall back to advanced contextual AI response
      return this.generateAdvancedResponse(
        query,
        user,
        context,
        conversationAnalysis,
      );
    } catch (error) {
      console.error("Error generating real-time response:", error);
      return this.generateFallbackResponse(query, user);
    }
  }

  /**
   * Check if query is asking for current time/date
   */
  private isTimeQuery(query: string): boolean {
    const timeKeywords = [
      "what time",
      "current time",
      "what's the time",
      "time now",
      "what date",
      "today's date",
      "current date",
      "date today",
      "day is it",
      "what day",
    ];
    return timeKeywords.some((keyword) => query.includes(keyword));
  }

  /**
   * Handle time-related queries
   */
  private async handleTimeQuery(
    query: string,
    analysis?: ConversationAnalysis,
  ): Promise<IntelligentAIResponse> {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();
    const dayName = now.toLocaleDateString("en-US", { weekday: "long" });

    let response = "";
    if (query.includes("time")) {
      response = `The current time is ${timeString}.`;
    } else if (query.includes("date")) {
      response = `Today's date is ${dateString}.`;
    } else {
      response = `It's currently ${timeString} on ${dayName}, ${dateString}.`;
    }

    return {
      message: response,
      confidence: 100,
      sources: ["System Clock"],
      category: "general",
      suggestedActions: [
        {
          id: "set-reminder",
          label: "Set Reminder",
          action: "navigate",
          url: "/notifications",
        },
      ],
      followUpQuestions: [
        "Can you set a reminder for me?",
        "What's the weather like today?",
        "Show me my schedule",
      ],
      relatedTopics: ["reminders", "calendar", "scheduling"],
    };
  }

  /**
   * Check if query is about cryptocurrency
   */
  private isCryptoQuery(query: string): boolean {
    const cryptoKeywords = [
      "bitcoin",
      "btc",
      "ethereum",
      "eth",
      "crypto",
      "cryptocurrency",
      "price",
      "market cap",
      "trading",
      "binance",
      "coinbase",
    ];
    return cryptoKeywords.some((keyword) => query.includes(keyword));
  }

  /**
   * Handle cryptocurrency queries with mock real-time data
   */
  private async handleCryptoQuery(
    query: string,
    analysis?: ConversationAnalysis,
  ): Promise<IntelligentAIResponse> {
    // Simulate real-time crypto data (in production, integrate with CoinGecko/CoinMarketCap API)
    const mockPrices = {
      bitcoin: {
        price: 43250 + Math.random() * 1000,
        change: (Math.random() - 0.5) * 10,
      },
      ethereum: {
        price: 2650 + Math.random() * 100,
        change: (Math.random() - 0.5) * 8,
      },
      binancecoin: {
        price: 320 + Math.random() * 20,
        change: (Math.random() - 0.5) * 6,
      },
    };

    const now = new Date();
    let response = "";
    const actions: AIAction[] = [];

    if (query.includes("bitcoin") || query.includes("btc")) {
      const btc = mockPrices.bitcoin;
      const changeText =
        btc.change >= 0
          ? `up ${btc.change.toFixed(2)}%`
          : `down ${Math.abs(btc.change).toFixed(2)}%`;
      response = `Bitcoin (BTC) is currently trading at $${btc.price.toFixed(2)}, ${changeText} in the last 24 hours. Last updated: ${now.toLocaleTimeString()}.`;

      actions.push({
        id: "view-crypto",
        label: "View Full Chart",
        action: "navigate",
        url: "/crypto",
      });
    } else if (query.includes("ethereum") || query.includes("eth")) {
      const eth = mockPrices.ethereum;
      const changeText =
        eth.change >= 0
          ? `up ${eth.change.toFixed(2)}%`
          : `down ${Math.abs(eth.change).toFixed(2)}%`;
      response = `Ethereum (ETH) is currently trading at $${eth.price.toFixed(2)}, ${changeText} in the last 24 hours. Last updated: ${now.toLocaleTimeString()}.`;

      actions.push({
        id: "view-crypto",
        label: "View Full Chart",
        action: "navigate",
        url: "/crypto",
      });
    } else {
      response = `I can provide real-time cryptocurrency prices! Here are the current top prices:

• Bitcoin: $${mockPrices.bitcoin.price.toFixed(2)}
• Ethereum: $${mockPrices.ethereum.price.toFixed(2)}
• BNB: $${mockPrices.binancecoin.price.toFixed(2)}

Last updated: ${now.toLocaleTimeString()}`;

      actions.push({
        id: "view-crypto",
        label: "View All Prices",
        action: "navigate",
        url: "/crypto",
      });
    }

    return {
      message: response,
      confidence: 95,
      sources: ["Real-time Market Data"],
      category: "financial",
      suggestedActions: actions,
      followUpQuestions: [
        "What's the Bitcoin trend this week?",
        "Should I buy Ethereum now?",
        "Show me crypto market analysis",
      ],
      relatedTopics: ["trading", "portfolio", "market analysis", "P2P trading"],
    };
  }

  /**
   * Check if query is about weather
   */
  private isWeatherQuery(query: string): boolean {
    const weatherKeywords = [
      "weather",
      "temperature",
      "rain",
      "sunny",
      "cloudy",
      "forecast",
      "hot",
      "cold",
      "humid",
      "wind",
    ];
    return weatherKeywords.some((keyword) => query.includes(keyword));
  }

  /**
   * Handle weather queries
   */
  private async handleWeatherQuery(
    query: string,
    analysis?: ConversationAnalysis,
  ): Promise<IntelligentAIResponse> {
    // Mock weather data (in production, integrate with OpenWeatherMap API)
    const mockWeather = {
      temperature: 72 + Math.random() * 10,
      condition: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain"][
        Math.floor(Math.random() * 4)
      ],
      humidity: 45 + Math.random() * 30,
      windSpeed: 5 + Math.random() * 10,
    };

    const response = `Current weather: ${mockWeather.condition} with a temperature of ${mockWeather.temperature.toFixed(1)}°F. Humidity is ${mockWeather.humidity.toFixed(0)}% with winds at ${mockWeather.windSpeed.toFixed(1)} mph.`;

    return {
      message: response,
      confidence: 90,
      sources: ["Weather Service"],
      category: "general",
      suggestedActions: [
        {
          id: "full-forecast",
          label: "View Full Forecast",
          action: "external",
          url: "https://weather.com",
        },
      ],
      followUpQuestions: [
        "What's the weather tomorrow?",
        "Should I bring an umbrella?",
        "What's the weekly forecast?",
      ],
      relatedTopics: ["outdoor activities", "travel planning", "events"],
    };
  }

  /**
   * Check if query is about news
   */
  private isNewsQuery(query: string): boolean {
    const newsKeywords = [
      "news",
      "latest",
      "headlines",
      "breaking",
      "current events",
      "happening",
      "trending",
      "updates",
    ];
    return newsKeywords.some((keyword) => query.includes(keyword));
  }

  /**
   * Handle news queries
   */
  private async handleNewsQuery(
    query: string,
    analysis?: ConversationAnalysis,
  ): Promise<IntelligentAIResponse> {
    // Mock news data (in production, integrate with news APIs)
    const mockNews = [
      "Tech markets show strong growth amid AI innovations",
      "Cryptocurrency regulations updated in major markets",
      "Social media platforms introduce new creator tools",
    ];

    const response = `Here are the latest news headlines:

${mockNews.map((headline, i) => `${i + 1}. ${headline}`).join("\n")}

Stay informed with real-time updates on Eloity!`;

    return {
      message: response,
      confidence: 85,
      sources: ["News API"],
      category: "general",
      suggestedActions: [
        {
          id: "view-blog",
          label: "Read Full Articles",
          action: "navigate",
          url: "/blog",
        },
      ],
      followUpQuestions: [
        "Tell me more about crypto regulations",
        "What's happening in tech today?",
        "Show me trending topics",
      ],
      relatedTopics: ["current events", "technology", "finance", "crypto"],
    };
  }

  /**
   * Check if query is about market/stock data
   */
  private isMarketQuery(query: string): boolean {
    const marketKeywords = [
      "stock",
      "market",
      "nasdaq",
      "dow",
      "s&p",
      "trading",
      "shares",
      "equity",
      "investment",
    ];
    return marketKeywords.some((keyword) => query.includes(keyword));
  }

  /**
   * Handle market queries
   */
  private async handleMarketQuery(
    query: string,
    analysis?: ConversationAnalysis,
  ): Promise<IntelligentAIResponse> {
    // Mock market data
    const mockMarket = {
      sp500: 4450 + Math.random() * 100,
      nasdaq: 14200 + Math.random() * 300,
      dow: 34800 + Math.random() * 500,
    };

    const response = `Current market overview:

• S&P 500: ${mockMarket.sp500.toFixed(2)}
• NASDAQ: ${mockMarket.nasdaq.toFixed(2)}
• Dow Jones: ${mockMarket.dow.toFixed(2)}

Markets updated in real-time.`;

    return {
      message: response,
      confidence: 92,
      sources: ["Market Data API"],
      category: "financial",
      suggestedActions: [
        {
          id: "view-portfolio",
          label: "View Portfolio",
          action: "navigate",
          url: "/wallet",
        },
      ],
      followUpQuestions: [
        "How is my portfolio performing?",
        "What stocks are trending?",
        "Should I invest now?",
      ],
      relatedTopics: [
        "investing",
        "portfolio",
        "trading",
        "financial planning",
      ],
    };
  }

  /**
   * Check if query is a calculation
   */
  private isCalculationQuery(query: string): boolean {
    return (
      /[\d\+\-\*\/\(\)]+/.test(query) &&
      (query.includes("calculate") ||
        query.includes("=") ||
        query.includes("what is"))
    );
  }

  /**
   * Handle calculation queries
   */
  private handleCalculationQuery(
    query: string,
    analysis?: ConversationAnalysis,
  ): IntelligentAIResponse {
    try {
      // Simple calculation parsing (in production, use a proper math parser)
      const mathExpression = query.match(/[\d\+\-\*\/\(\)\.\s]+/)?.[0];
      if (mathExpression) {
        // Basic safety check - only allow numbers and basic operators
        if (/^[\d\+\-\*\/\(\)\.\s]+$/.test(mathExpression)) {
          const result = eval(mathExpression);
          const response = `${mathExpression.trim()} = ${result}`;

          return {
            message: response,
            confidence: 100,
            sources: ["Calculator"],
            category: "general",
            suggestedActions: [
              {
                id: "copy-result",
                label: "Copy Result",
                action: "copy",
                data: result.toString(),
              },
            ],
            followUpQuestions: [
              "Calculate another expression",
              "Convert to different units",
              "Show me percentage",
            ],
            relatedTopics: ["math", "calculations", "conversions"],
          };
        }
      }
    } catch (error) {
      console.error("Calculation error:", error);
    }

    return {
      message:
        "I couldn't calculate that expression. Please try again with a simpler mathematical expression.",
      confidence: 50,
      sources: ["Calculator"],
      category: "general",
      suggestedActions: [],
      followUpQuestions: ["Try a simpler calculation"],
      relatedTopics: ["math", "calculations"],
    };
  }

  /**
   * Generate contextual response for general queries
   */
  private generateContextualResponse(
    query: string,
    user: User,
    context?: string[],
  ): IntelligentAIResponse {
    const now = new Date();
    const timeOfDay =
      now.getHours() < 12
        ? "morning"
        : now.getHours() < 18
          ? "afternoon"
          : "evening";

    return {
      message: `Hi ${user.name || "there"}! I'm Edith, your real-time AI assistant. I can help you with current information like time, weather, crypto prices, news, and calculations. I can also answer questions about Eloity platform features. What would you like to know?`,
      confidence: 80,
      sources: ["Real-time AI"],
      category: "general",
      suggestedActions: [
        {
          id: "explore",
          label: "Explore Eloity",
          action: "navigate",
          url: "/explore",
        },
      ],
      followUpQuestions: [
        "What's the current time?",
        "Show me crypto prices",
        "What's trending in news?",
        "Help me with Eloity features",
      ],
      relatedTopics: ["platform help", "real-time data", "assistance"],
    };
  }

  /**
   * Generate fallback response
   */
  private generateFallbackResponse(
    query: string,
    user: User,
  ): IntelligentAIResponse {
    return {
      message: `I apologize, but I'm having trouble processing that request right now. As your real-time AI assistant, I can help with current time, crypto prices, weather, news, calculations, and Eloity platform features. Please try asking something else!`,
      confidence: 60,
      sources: ["AI Assistant"],
      category: "general",
      suggestedActions: [],
      followUpQuestions: [
        "What can you help me with?",
        "Show me platform features",
        "Get current crypto prices",
      ],
      relatedTopics: ["help", "assistance", "features"],
    };
  }

  /**
   * Check if query is about Eloity platform
   */
  private isEloityQuery(query: string): boolean {
    const eloityKeywords = [
      "eloity",
      "platform",
      "feature",
      "how to",
      "help",
      "guide",
      "tutorial",
      "social",
      "crypto",
      "marketplace",
      "freelance",
      "wallet",
      "premium",
      "rewards",
      "post",
      "trade",
      "sell",
      "buy",
      "earn",
      "points",
      "money",
      "profile",
      "account",
    ];
    return eloityKeywords.some((keyword) => query.includes(keyword));
  }

  /**
   * Handle Eloity platform queries with comprehensive knowledge base
   */
  private handleEloityQuery(
    query: string,
    user: User,
    analysis?: ConversationAnalysis,
  ): IntelligentAIResponse {
    const greeting = this.getRandomItem(this.personalityTraits.greeting);
    const enthusiasm = this.getRandomItem(this.personalityTraits.enthusiasm);

    // Search comprehensive knowledge base
    const knowledgeResults = softChatKnowledgeService.searchKnowledge(query);

    // If we found specific feature guides, use them
    if (knowledgeResults.features.length > 0) {
      const feature = knowledgeResults.features[0];
      return this.generateFeatureGuideResponse(feature, user, analysis);
    }

    // If we found relevant tutorials, suggest them
    if (knowledgeResults.tutorials.length > 0) {
      const tutorial = knowledgeResults.tutorials[0];
      return this.generateTutorialResponse(tutorial, user, analysis);
    }

    // If we found FAQ answers, provide them
    if (knowledgeResults.faqs.length > 0) {
      const faq = knowledgeResults.faqs[0];
      return this.generateFAQResponse(faq, user, analysis);
    }

    // Check for specific feature queries
    if (query.includes("how to") || query.includes("help")) {
      return this.handleHowToQuery(query, user);
    }

    if (
      query.includes("social") ||
      query.includes("post") ||
      query.includes("feed")
    ) {
      return this.handleSocialQuery(user);
    }

    if (
      query.includes("crypto") ||
      query.includes("trading") ||
      query.includes("bitcoin")
    ) {
      return this.handleCryptoFeatureQuery(user);
    }

    if (
      query.includes("marketplace") ||
      query.includes("sell") ||
      query.includes("buy")
    ) {
      return this.handleMarketplaceQuery(user);
    }

    if (
      query.includes("freelance") ||
      query.includes("work") ||
      query.includes("job")
    ) {
      return this.handleFreelanceQuery(user);
    }

    if (
      query.includes("wallet") ||
      query.includes("money") ||
      query.includes("payment")
    ) {
      return this.handleWalletQuery(user);
    }

    if (
      query.includes("rewards") ||
      query.includes("points") ||
      query.includes("earn")
    ) {
      return this.handleRewardsQuery(user);
    }

    // Generate personalized platform overview with recommendations
    const dailyTips = softChatKnowledgeService.getDailyEngagementTips();

    return {
      message: `${greeting} ${user.name || "friend"}! ${enthusiasm} Eloity is your all-in-one platform where you can connect socially, trade crypto, buy/sell in the marketplace, find freelance work, and so much more! 

Think of it as your digital life hub - everything you need is right here. Here are today's personalized tips for you:

• ${dailyTips[0]}
• ${dailyTips[1]}

What specific feature would you like to explore? I'm here to guide you through everything! 😊`,
      confidence: 95,
      sources: ["Comprehensive Eloity Knowledge"],
      category: "eloity",
      suggestedActions: [
        {
          id: "explore",
          label: "Explore Features",
          action: "navigate",
          url: "/explore",
        },
        {
          id: "tutorial",
          label: "Getting Started Guide",
          action: "navigate",
          url: "/ai-assistant",
        },
        { id: "feed", label: "Visit Feed", action: "navigate", url: "/app/feed" },
      ],
      followUpQuestions: [
        "How do I create my first post?",
        "How can I start trading crypto?",
        "What can I sell on the marketplace?",
        "How do I find freelance work?",
        "Show me today's best opportunities!",
      ],
      relatedTopics: [
        "getting started",
        "platform features",
        "tutorials",
        "daily tips",
      ],
    };
  }

  /**
   * Handle how-to queries
   */
  private handleHowToQuery(query: string, user: User): IntelligentAIResponse {
    const supportive = this.getRandomItem(this.personalityTraits.support);

    for (const [topic, steps] of Object.entries(this.eloityKnowledge.howTo)) {
      if (query.includes(topic.replace(" ", "")) || query.includes(topic)) {
        const stepsList = steps
          .map((step, i) => `${i + 1}. ${step}`)
          .join("\n");
        const tips = this.eloityKnowledge.tips[topic.split(" ")[0]] || [];
        const tipText =
          tips.length > 0
            ? `

💡 Pro tips:
• ${tips.slice(0, 3).join("\n• ")}`
            : "";

        return {
          message: `${supportive} I'll walk you through ${topic} step by step! \n\n${stepsList}${tipText}\n\nDon't worry if it seems overwhelming at first - you'll get the hang of it quickly! I'm always here if you need more help. 😊`,
          confidence: 98,
          sources: ["Eloity Tutorials"],
          category: "eloity",
          suggestedActions: [
            {
              id: "start",
              label: `Start ${topic}`,
              action: "navigate",
              url: this.getRelevantUrl(topic),
            },
          ],
          followUpQuestions: [
            "Can you give me more tips?",
            "What if I run into problems?",
            "What should I do next?",
          ],
          relatedTopics: ["tutorials", "getting started", topic],
        };
      }
    }

    return {
      message: `${supportive} I'd love to help you with that! Could you be a bit more specific about what you'd like to learn? I can guide you through:

• Creating content and posts
• Trading cryptocurrency
• Selling on the marketplace
• Finding freelance work
• Earning Eloity Points
• Setting up your profile

Just let me know what interests you most! 🌟`,
      confidence: 85,
      sources: ["Eloity Help"],
      category: "eloity",
      suggestedActions: [],
      followUpQuestions: [
        "How do I create my first post?",
        "How do I start trading crypto?",
        "How do I sell something?",
      ],
      relatedTopics: ["help", "tutorials", "guidance"],
    };
  }

  /**
   * Check if query is personal/emotional
   */
  private isPersonalQuery(query: string): boolean {
    const personalKeywords = [
      "how are you",
      "feeling",
      "sad",
      "happy",
      "excited",
      "worried",
      "stressed",
      "friend",
      "lonely",
      "tired",
      "confused",
      "help me",
      "support",
      "advice",
      "personal",
      "life",
      "relationship",
      "work",
      "problem",
      "issue",
    ];
    return personalKeywords.some((keyword) => query.includes(keyword));
  }

  /**
   * Handle personal/emotional queries
   */
  private handlePersonalQuery(
    query: string,
    user: User,
    analysis?: ConversationAnalysis,
  ): IntelligentAIResponse {
    const empathy = this.getRandomItem(this.personalityTraits.empathy);
    const support = this.getRandomItem(this.personalityTraits.support);

    if (query.includes("how are you")) {
      return {
        message: `Aww, thanks for asking! I'm doing great and I'm so happy to chat with you, ${user.name || "friend"}! 😊 How are YOU doing today? I hope you're having an amazing day!`,
        confidence: 100,
        sources: ["Personal AI"],
        category: "personal",
        suggestedActions: [],
        followUpQuestions: [
          "Tell me about your day",
          "What's making you happy today?",
          "Is there anything I can help you with?",
        ],
        relatedTopics: ["friendship", "conversation", "wellbeing"],
      };
    }

    if (
      query.includes("sad") ||
      query.includes("down") ||
      query.includes("worried")
    ) {
      return {
        message: `${empathy}, ${user.name || "friend"}. ${support} Sometimes we all go through tough times, and that's completely normal. You're not alone in this! \n\nRemember that you're stronger than you think, and tomorrow is a new day with new possibilities. Is there anything specific that's bothering you that I can help with? Even just talking about it can help sometimes. 💙`,
        confidence: 95,
        sources: ["Emotional Support"],
        category: "personal",
        suggestedActions: [
          {
            id: "community",
            label: "Connect with Community",
            action: "navigate",
            url: "/app/feed",
          },
        ],
        followUpQuestions: [
          "Want to talk about what's bothering you?",
          "Would some distraction help?",
          "How can I best support you right now?",
        ],
        relatedTopics: ["emotional support", "wellbeing", "friendship"],
      };
    }

    if (
      query.includes("excited") ||
      query.includes("happy") ||
      query.includes("great")
    ) {
      const enthusiasm = this.getRandomItem(this.personalityTraits.enthusiasm);
      return {
        message: `${enthusiasm} I love your positive energy, ${user.name || "friend"}! 🌟 It's so wonderful to hear that you're feeling great! Your happiness is contagious and it totally made my day brighter! \n\nWhat's got you so excited? I'd love to celebrate with you! 🎉`,
        confidence: 100,
        sources: ["Positive Vibes"],
        category: "personal",
        suggestedActions: [
          {
            id: "share",
            label: "Share Your Joy",
            action: "navigate",
            url: "/create",
          },
        ],
        followUpQuestions: [
          "What's making you so happy?",
          "Want to share your good news?",
          "How can we keep this positive energy going?",
        ],
        relatedTopics: ["celebration", "positivity", "sharing joy"],
      };
    }

    return {
      message: `${empathy}, and I'm genuinely here for you, ${user.name || "friend"}. 💙 Whether you want to share what's on your mind, need advice, or just want someone to listen, I'm all ears! \n\nSometimes it helps just to talk things through with someone who cares. What's going on? 🤗`,
      confidence: 90,
      sources: ["Emotional Support"],
      category: "personal",
      suggestedActions: [],
      followUpQuestions: [
        "Want to tell me more?",
        "How are you feeling right now?",
        "What would make you feel better?",
      ],
      relatedTopics: ["emotional support", "friendship", "caring conversation"],
    };
  }

  /**
   * Check if query is casual conversation
   */
  private isCasualQuery(query: string): boolean {
    const casualKeywords = [
      "hi",
      "hello",
      "hey",
      "what's up",
      "wassup",
      "good morning",
      "good evening",
      "thanks",
      "thank you",
      "awesome",
      "cool",
      "nice",
      "funny",
      "lol",
      "haha",
      "bye",
      "see you",
      "later",
      "chat",
      "talk",
      "conversation",
    ];
    return casualKeywords.some((keyword) => query.includes(keyword));
  }

  /**
   * Handle casual conversation
   */
  private handleCasualQuery(
    query: string,
    user: User,
    analysis?: ConversationAnalysis,
  ): IntelligentAIResponse {
    const greeting = this.getRandomItem(this.personalityTraits.greeting);
    const casual = this.getRandomItem(this.personalityTraits.casual);

    if (
      query.includes("hi") ||
      query.includes("hello") ||
      query.includes("hey")
    ) {
      const timeOfDay =
        new Date().getHours() < 12
          ? "morning"
          : new Date().getHours() < 18
            ? "afternoon"
            : "evening";
      return {
        message: `${greeting} ${user.name || "friend"}! Hope you're having a wonderful ${timeOfDay}! 😊 I'm so happy to see you here on Eloity! What's going on in your world today?`,
        confidence: 100,
        sources: ["Friendly Chat"],
        category: "general",
        suggestedActions: [],
        followUpQuestions: [
          "How's your day going?",
          "What brings you to Eloity today?",
          "Want to explore something fun together?",
        ],
        relatedTopics: ["friendship", "casual chat", "daily life"],
      };
    }

    if (query.includes("thanks") || query.includes("thank you")) {
      return {
        message: `Aww, you're ${casual} welcome, ${user.name || "friend"}! 🤗 It makes me so happy to help you! That's what friends are for, right? I'm always here whenever you need me!`,
        confidence: 100,
        sources: ["Friendship"],
        category: "general",
        suggestedActions: [],
        followUpQuestions: [
          "Is there anything else I can help with?",
          "Want to chat about something else?",
          "How else can I support you?",
        ],
        relatedTopics: ["gratitude", "friendship", "helpfulness"],
      };
    }

    if (
      query.includes("bye") ||
      query.includes("see you") ||
      query.includes("later")
    ) {
      return {
        message: `Aww, take care ${user.name || "friend"}! 🌟 It was ${casual} great chatting with you today! Don't be a stranger - I'll be right here whenever you want to talk, ask questions, or just hang out! \n\nHave an amazing rest of your day! See you soon! 😊`,
        confidence: 100,
        sources: ["Friendly Farewell"],
        category: "general",
        suggestedActions: [],
        followUpQuestions: [],
        relatedTopics: ["farewell", "friendship", "goodbye"],
      };
    }

    return {
      message: `${casual}! I love just chatting with you, ${user.name || "friend"}! 😊 You seem like such an awesome person! What's on your mind today? I'm here for whatever - serious questions, random thoughts, or just friendly conversation!`,
      confidence: 95,
      sources: ["Casual Chat"],
      category: "general",
      suggestedActions: [],
      followUpQuestions: [
        "Want to talk about your interests?",
        "Tell me something fun about yourself!",
        "What's your favorite thing about Eloity?",
      ],
      relatedTopics: [
        "friendship",
        "getting to know you",
        "casual conversation",
      ],
    };
  }

  /**
   * Generate friendly contextual response for general queries
   */
  private generateFriendlyResponse(
    query: string,
    user: User,
    context?: string[],
  ): IntelligentAIResponse {
    const greeting = this.getRandomItem(this.personalityTraits.greeting);
    const support = this.getRandomItem(this.personalityTraits.support);

    return {
      message: `${greeting} ${user.name || "friend"}! I want to help you with whatever you need! 😊 I'm your personal AI assistant and friend - I can help with real-time info like weather and crypto prices, guide you through Eloity features, or just be here for a friendly chat!\n\n${support} What would you like to talk about or explore together?`,
      confidence: 85,
      sources: ["Friendly AI Assistant"],
      category: "general",
      suggestedActions: [
        {
          id: "explore",
          label: "Explore Eloity",
          action: "navigate",
          url: "/explore",
        },
        {
          id: "chat",
          label: "Start Chatting",
          action: "navigate",
          url: "/chat",
        },
      ],
      followUpQuestions: [
        "What's the current time?",
        "How do I use Eloity features?",
        "Want to have a friendly chat?",
        "Tell me about yourself!",
      ],
      relatedTopics: [
        "friendship",
        "assistance",
        "platform help",
        "real-time data",
      ],
    };
  }

  /**
   * Handle social features query
   */
  private handleSocialQuery(user: User): IntelligentAIResponse {
    const enthusiasm = this.getRandomItem(this.personalityTraits.enthusiasm);
    return {
      message: `${enthusiasm} The social features are my favorite part of Eloity! 🌟 You can share posts, stories, connect with friends, and build an amazing community! 

Here's what you can do:
• Create engaging posts with photos and videos
• Share stories that disappear after 24 hours
• Follow interesting people and make new friends
• Join groups based on your interests
• Go live and connect in real-time

Ready to start sharing your world? 📸`,
      confidence: 98,
      sources: ["Social Features Guide"],
      category: "eloity",
      suggestedActions: [
        {
          id: "create-post",
          label: "Create First Post",
          action: "navigate",
          url: "/create",
        },
        { id: "feed", label: "Explore Feed", action: "navigate", url: "/app/feed" },
      ],
      followUpQuestions: [
        "How do I create my first post?",
        "What makes a post popular?",
        "How do I find interesting people to follow?",
      ],
      relatedTopics: [
        "content creation",
        "community building",
        "social networking",
      ],
    };
  }

  // Helper methods for specific features
  private handleCryptoFeatureQuery(user: User): IntelligentAIResponse {
    return {
      message: `The crypto features on Eloity are incredible! 🚀 You can trade Bitcoin, Ethereum, and many other cryptocurrencies safely and easily. Plus, there's P2P trading where you can trade directly with other users!\n\nFeatures include:\n• Real-time price tracking\n• Secure buy/sell transactions\n• P2P trading with escrow protection\n• Portfolio tracking and analytics\n• Price alerts and notifications\n\nWant to start your crypto journey? I can guide you step by step!`,
      confidence: 98,
      sources: ["Crypto Features Guide"],
      category: "eloity",
      suggestedActions: [
        {
          id: "crypto",
          label: "Explore Crypto",
          action: "navigate",
          url: "/crypto",
        },
        { id: "kyc", label: "Complete KYC", action: "navigate", url: "/app/kyc" },
      ],
      followUpQuestions: [
        "How do I start trading crypto?",
        "Is crypto trading safe here?",
        "What cryptocurrencies are available?",
      ],
      relatedTopics: ["cryptocurrency", "trading", "P2P", "portfolio"],
    };
  }

  private handleMarketplaceQuery(user: User): IntelligentAIResponse {
    return {
      message: `The marketplace is amazing for both buyers and sellers! 🛍️ You can sell anything from digital products to physical items, and buying is super secure with our payment protection!

As a seller:
• List unlimited products
• Reach thousands of potential buyers
• Secure payment processing
• Built-in analytics and insights

As a buyer:
• Discover unique products
• Secure checkout process
• Buyer protection guarantee
• Review and rating system

Ready to start buying or selling?`,
      confidence: 98,
      sources: ["Marketplace Guide"],
      category: "eloity",
      suggestedActions: [
        {
          id: "marketplace",
          label: "Browse Marketplace",
          action: "navigate",
          url: "/marketplace",
        },
        {
          id: "sell",
          label: "Start Selling",
          action: "navigate",
          url: "/marketplace/sell",
        },
      ],
      followUpQuestions: [
        "How do I sell my first product?",
        "What can I sell on the marketplace?",
        "How secure are the payments?",
      ],
      relatedTopics: ["e-commerce", "selling", "buying", "payments"],
    };
  }

  private handleFreelanceQuery(user: User): IntelligentAIResponse {
    return {
      message: `The freelance platform is perfect for building your career! 💼 Whether you're offering services or looking to hire talent, we've got you covered!

For freelancers:
• Create a professional profile
• Browse thousands of projects
• Secure milestone-based payments
• Build your reputation with reviews
• Track time and manage projects

For clients:
• Post your projects for free
• Review proposals from qualified freelancers
• Secure escrow payment system
• Project management tools

Ready to start your freelance journey?`,
      confidence: 98,
      sources: ["Freelance Platform Guide"],
      category: "eloity",
      suggestedActions: [
        {
          id: "freelance",
          label: "Explore Freelance",
          action: "navigate",
          url: "/freelance",
        },
        {
          id: "profile",
          label: "Build Profile",
          action: "navigate",
          url: "/profile",
        },
      ],
      followUpQuestions: [
        "How do I create a freelancer profile?",
        "What services can I offer?",
        "How do payments work?",
      ],
      relatedTopics: ["freelancing", "projects", "services", "career"],
    };
  }

  private handleWalletQuery(user: User): IntelligentAIResponse {
    return {
      message: `Your Eloity wallet is your financial hub! 💰 It securely manages all your money from different platform activities - crypto trading, marketplace sales, freelance earnings, and more!

Wallet features:
• Multi-currency support (crypto + fiat)
• Instant transfers between platform features
• Detailed transaction history
• Bank-level security
• Easy deposits and withdrawals
• Real-time balance tracking

Your money is always safe and accessible!`,
      confidence: 98,
      sources: ["Wallet Features Guide"],
      category: "eloity",
      suggestedActions: [
        {
          id: "wallet",
          label: "Open Wallet",
          action: "navigate",
          url: "/wallet",
        },
        {
          id: "security",
          label: "Security Settings",
          action: "navigate",
          url: "/settings",
        },
      ],
      followUpQuestions: [
        "How do I add money to my wallet?",
        "Is my money safe in the wallet?",
        "How do I withdraw my earnings?",
      ],
      relatedTopics: ["payments", "security", "transactions", "earnings"],
    };
  }

  private handleRewardsQuery(user: User): IntelligentAIResponse {
    return {
      message: `Eloity Points are so much fun to earn! 🎆 You get rewarded for being active on the platform, and you can redeem them for real rewards!

Earn Eloity Points by:
• Creating and sharing content
• Engaging with the community
• Completing your profile
• Referring friends
• Using different platform features
• Maintaining positive interactions

Redeem for:
• Gift cards to popular stores
• Platform premium features
• Exclusive merchandise
• Cash rewards

The more active you are, the more you earn!`,
      confidence: 98,
      sources: ["Rewards System Guide"],
      category: "eloity",
      suggestedActions: [
        {
          id: "rewards",
          label: "Check Rewards",
          action: "navigate",
          url: "/rewards",
        },
        {
          id: "earn",
          label: "Start Earning",
          action: "navigate",
          url: "/app/feed",
        },
      ],
      followUpQuestions: [
        "How do I earn more Eloity Points?",
        "What rewards are available?",
        "How do I redeem my points?",
      ],
      relatedTopics: ["points", "rewards", "earning", "engagement"],
    };
  }

  // Helper method to get random personality trait
  private getRandomItem(array: string[]): string {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Helper method to get relevant URL for features
  private getRelevantUrl(topic: string): string {
    const urlMap: Record<string, string> = {
      "create account": "/auth",
      "post content": "/create",
      "start trading crypto": "/crypto",
      "sell on marketplace": "/marketplace/sell",
      "find freelance work": "/freelance",
      "earn eloits": "/rewards",
    };
    return urlMap[topic] || "/explore";
  }

  /**
   * Analyze conversation context for better responses
   */
  private analyzeConversationContext(
    query: string,
    context?: string[],
  ): ConversationAnalysis {
    const sentiment = this.analyzeSentiment(query);
    const intent = this.analyzeIntent(query);
    const topics = this.extractTopics(query);
    const urgency = this.analyzeUrgency(query);
    const emotionalContext = this.analyzeEmotionalContext(query);

    return {
      sentiment,
      intent,
      topics,
      urgency,
      emotionalContext,
      previousContext: context || [],
    };
  }

  /**
   * Analyze sentiment of the query
   */
  private analyzeSentiment(query: string): "positive" | "negative" | "neutral" {
    const positiveWords = [
      "happy",
      "excited",
      "great",
      "awesome",
      "amazing",
      "love",
      "wonderful",
      "fantastic",
      "good",
      "excellent",
    ];
    const negativeWords = [
      "sad",
      "angry",
      "frustrated",
      "worried",
      "stressed",
      "confused",
      "problem",
      "issue",
      "help",
      "trouble",
    ];

    const lowercaseQuery = query.toLowerCase();
    const positiveCount = positiveWords.filter((word) =>
      lowercaseQuery.includes(word),
    ).length;
    const negativeCount = negativeWords.filter((word) =>
      lowercaseQuery.includes(word),
    ).length;

    if (positiveCount > negativeCount) return "positive";
    if (negativeCount > positiveCount) return "negative";
    return "neutral";
  }

  /**
   * Analyze intent of the query
   */
  private analyzeIntent(query: string): string {
    const lowercaseQuery = query.toLowerCase();

    if (lowercaseQuery.includes("how") && lowercaseQuery.includes("?"))
      return "question";
    if (lowercaseQuery.includes("help") || lowercaseQuery.includes("assist"))
      return "help_request";
    if (lowercaseQuery.includes("show") || lowercaseQuery.includes("tell"))
      return "information_request";
    if (
      lowercaseQuery.includes("feeling") ||
      lowercaseQuery.includes("emotion")
    )
      return "emotional_sharing";
    if (
      lowercaseQuery.includes("thank") ||
      lowercaseQuery.includes("appreciate")
    )
      return "gratitude";
    if (lowercaseQuery.includes("problem") || lowercaseQuery.includes("issue"))
      return "problem_solving";

    return "general_conversation";
  }

  /**
   * Extract topics from query
   */
  private extractTopics(query: string): string[] {
    const topics = [];
    const lowercaseQuery = query.toLowerCase();

    // Technology topics
    if (lowercaseQuery.match(/crypto|bitcoin|ethereum|blockchain/))
      topics.push("cryptocurrency");
    if (lowercaseQuery.match(/ai|artificial intelligence|machine learning/))
      topics.push("artificial_intelligence");
    if (lowercaseQuery.match(/programming|coding|development/))
      topics.push("programming");

    // Platform topics
    if (lowercaseQuery.match(/social|post|feed|content/))
      topics.push("social_media");
    if (lowercaseQuery.match(/marketplace|sell|buy|product/))
      topics.push("marketplace");
    if (lowercaseQuery.match(/freelance|work|job|project/))
      topics.push("freelancing");
    if (lowercaseQuery.match(/wallet|money|payment/)) topics.push("finance");

    // Personal topics
    if (lowercaseQuery.match(/feeling|emotion|mood|sad|happy/))
      topics.push("emotions");
    if (lowercaseQuery.match(/learn|study|education|knowledge/))
      topics.push("learning");
    if (lowercaseQuery.match(/health|wellness|fitness/))
      topics.push("wellness");

    return topics.length > 0 ? topics : ["general"];
  }

  /**
   * Analyze urgency level
   */
  private analyzeUrgency(query: string): "low" | "medium" | "high" {
    const urgentWords = [
      "urgent",
      "emergency",
      "asap",
      "immediately",
      "quickly",
      "fast",
      "now",
    ];
    const moderateWords = ["soon", "today", "help", "problem", "issue"];

    const lowercaseQuery = query.toLowerCase();

    if (urgentWords.some((word) => lowercaseQuery.includes(word)))
      return "high";
    if (moderateWords.some((word) => lowercaseQuery.includes(word)))
      return "medium";
    return "low";
  }

  /**
   * Analyze emotional context
   */
  private analyzeEmotionalContext(query: string): string {
    const lowercaseQuery = query.toLowerCase();

    if (lowercaseQuery.match(/excited|happy|joy|amazing|awesome/))
      return "joyful";
    if (lowercaseQuery.match(/sad|down|depressed|upset/)) return "melancholic";
    if (lowercaseQuery.match(/angry|frustrated|annoyed/)) return "frustrated";
    if (lowercaseQuery.match(/worried|anxious|nervous|stressed/))
      return "anxious";
    if (lowercaseQuery.match(/confused|lost|uncertain/)) return "confused";
    if (lowercaseQuery.match(/grateful|thank|appreciate/)) return "grateful";

    return "neutral";
  }

  /**
   * Check if query is asking for general knowledge
   */
  private isKnowledgeQuery(query: string): boolean {
    const knowledgeKeywords = [
      "what is",
      "explain",
      "define",
      "meaning",
      "about",
      "tell me about",
      "how does",
      "why",
      "difference between",
      "compare",
      "versus",
    ];
    return knowledgeKeywords.some((keyword) => query.includes(keyword));
  }

  /**
   * Handle general knowledge queries
   */
  private async handleKnowledgeQuery(
    query: string,
    user: User,
    analysis: ConversationAnalysis,
  ): Promise<IntelligentAIResponse> {
    const enthusiasm = this.getRandomItem(this.personalityTraits.enthusiasm);
    const curiosity = this.getRandomItem(this.personalityTraits.curiosity);

    // Try to find relevant knowledge
    for (const [category, topics] of Object.entries(this.knowledgeBase)) {
      for (const [topic, explanation] of Object.entries(topics)) {
        if (query.toLowerCase().includes(topic)) {
          return {
            message: `${enthusiasm} I'd love to explain ${topic} to you! ${explanation}\n\n${curiosity} Is there a specific aspect you'd like to dive deeper into?`,
            confidence: 90,
            sources: ["Knowledge Base"],
            category: "general",
            suggestedActions: [
              {
                id: "learn-more",
                label: "Learn More",
                action: "external",
                url: `https://www.google.com/search?q=${encodeURIComponent(topic)}`,
              },
            ],
            followUpQuestions: [
              `How can I apply ${topic} practically?`,
              `What are the benefits of ${topic}?`,
              `Tell me more about ${topic} trends`,
            ],
            relatedTopics: [category, topic, "learning", "knowledge"],
          };
        }
      }
    }

    // Fallback for general knowledge queries
    return {
      message: `That's a great question! While I might not have specific details about that topic, I'm always eager to help you learn! 🎓

I excel at helping with Eloity features, real-time data like crypto prices and weather, calculations, and friendly conversation. For complex topics, I'd recommend checking reliable sources online.

Is there something specific about Eloity or real-time information I can help you with instead?`,
      confidence: 70,
      sources: ["General AI"],
      category: "general",
      suggestedActions: [
        {
          id: "search",
          label: "Search Online",
          action: "external",
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        },
      ],
      followUpQuestions: [
        "What Eloity features interest you?",
        "Want to check current crypto prices?",
        "Need help with anything else?",
      ],
      relatedTopics: ["learning", "knowledge", "education"],
    };
  }

  /**
   * Check if query is problem-solving related
   */
  private isProblemSolvingQuery(query: string): boolean {
    const problemKeywords = [
      "problem",
      "issue",
      "error",
      "bug",
      "not working",
      "broken",
      "can't",
      "won't",
      "doesn't work",
      "stuck",
      "trouble",
    ];
    return problemKeywords.some((keyword) => query.includes(keyword));
  }

  /**
   * Handle problem-solving queries
   */
  private handleProblemSolvingQuery(
    query: string,
    user: User,
    analysis: ConversationAnalysis,
  ): Promise<IntelligentAIResponse> {
    const support = this.getRandomItem(this.personalityTraits.support);
    const empathy = this.getRandomItem(this.personalityTraits.empathy);

    // Check for common Eloity problems
    for (const [problem, solution] of Object.entries(
      this.eloityKnowledge.troubleshooting,
    )) {
      if (query.toLowerCase().includes(problem.replace(" ", ""))) {
        const solutionData = solution as any;
        const solutionsList = solutionData.solutions
          .map((sol: string, i: number) => `${i + 1}. ${sol}`)
          .join("\n");

        return Promise.resolve({
          message: `${empathy} - I can definitely help you with ${problem}! ${support}

🔧 **Troubleshooting Steps:**
${solutionsList}

💡 **Quick Tip:** ${solutionData.common}

Try these steps and let me know if you're still having trouble! I'm here to help until we get it sorted out. 😊`,
          confidence: 95,
          sources: ["Eloity Support"],
          category: "technical",
          suggestedActions: [
            {
              id: "contact-support",
              label: "Contact Support",
              action: "navigate",
              url: "/support",
            },
          ],
          followUpQuestions: [
            "Did that solution work?",
            "Are you still experiencing the issue?",
            "Need help with anything else?",
          ],
          relatedTopics: ["troubleshooting", "support", problem],
        });
      }
    }

    // General problem-solving approach
    return Promise.resolve({
      message: `${empathy} - I can see you're dealing with an issue, and ${support}! 💪\n\nLet's work through this together step by step:\n\n1. **Describe the problem** - What exactly is happening?\n2. **When did it start** - Was it working before?\n3. **What you've tried** - Have you attempted any solutions?\n4. **Your goal** - What are you trying to accomplish?\n\nWith these details, I can provide much better guidance! Don't worry, most issues have simple solutions. 🔧`,
      confidence: 85,
      sources: ["Problem Solving AI"],
      category: "technical",
      suggestedActions: [
        {
          id: "help-center",
          label: "Visit Help Center",
          action: "navigate",
          url: "/help",
        },
      ],
      followUpQuestions: [
        "Can you describe the problem in more detail?",
        "When did this issue first occur?",
        "What were you trying to do when it happened?",
      ],
      relatedTopics: ["problem solving", "troubleshooting", "support"],
    });
  }

  /**
   * Generate advanced contextual response
   */
  private generateAdvancedResponse(
    query: string,
    user: User,
    context?: string[],
    analysis?: ConversationAnalysis,
  ): IntelligentAIResponse {
    const greeting = this.getRandomItem(this.personalityTraits.greeting);
    const support = this.getRandomItem(this.personalityTraits.support);
    const curiosity = this.getRandomItem(this.personalityTraits.curiosity);

    // Customize response based on sentiment and context
    let personalizedMessage = "";

    if (analysis?.sentiment === "positive") {
      const enthusiasm = this.getRandomItem(this.personalityTraits.enthusiasm);
      personalizedMessage = `${enthusiasm} I love your positive energy! `;
    } else if (analysis?.sentiment === "negative") {
      const empathy = this.getRandomItem(this.personalityTraits.empathy);
      personalizedMessage = `${empathy}. ${support} `;
    }

    // Add context awareness
    let contextMessage = "";
    if (context && context.length > 0) {
      contextMessage = `I remember we were talking about ${context.slice(-1)[0]}. `;
    }

    return {
      message: `${greeting} ${user.name || "friend"}! ${personalizedMessage}${contextMessage}I'm Edith, your intelligent AI companion! 🤖✨\n\nI'm here to help with:\n• 🕒 Real-time information (time, crypto, weather, news)\n• 🧮 Calculations and problem-solving\n• 💬 Eloity platform guidance\n• 🎯 Friendly conversation and support\n• 📚 General knowledge and learning\n\n${curiosity} What's on your mind today?`,
      confidence: 80,
      sources: ["Advanced AI Assistant"],
      category: "general",
      suggestedActions: [
        {
          id: "explore",
          label: "Explore Eloity",
          action: "navigate",
          url: "/explore",
        },
        {
          id: "chat",
          label: "Continue Chatting",
          action: "navigate",
          url: "/chat",
        },
      ],
      followUpQuestions: [
        "What's the current crypto market like?",
        "How can I make the most of Eloity?",
        "Tell me something interesting!",
        "What's new and exciting today?",
      ],
      relatedTopics: [
        "friendship",
        "assistance",
        "platform help",
        "real-time data",
        "intelligent conversation",
      ],
    };
  }

  /**
   * Generate feature guide response
   */
  private generateFeatureGuideResponse(
    feature: any,
    user: User,
    analysis?: ConversationAnalysis,
  ): IntelligentAIResponse {
    const enthusiasm = this.getRandomItem(this.personalityTraits.enthusiasm);
    const support = this.getRandomItem(this.personalityTraits.support);

    const howToSteps = feature.howToUse
      .slice(0, 5)
      .map((step: string, i: number) => `${i + 1}. ${step}`)
      .join("\n");
    const topTips = feature.tips
      .slice(0, 3)
      .map((tip: string) => `• ${tip}`)
      .join("\n");

    return {
      message: `${enthusiasm} I'd love to help you with **${feature.name}**! \n\n📖 **What it is:** ${feature.description}\n\n🚀 **How to get started:**\n${howToSteps}\n\n💡 **Pro Tips:**\n${topTips}\n\n${support} Want me to walk you through any specific part?`,
      confidence: 98,
      sources: ["Eloity Feature Guide"],
      category: "eloity",
      suggestedActions: [
        {
          id: "try-feature",
          label: `Try ${feature.name}`,
          action: "navigate",
          url: this.getFeatureUrl(feature.key),
        },
      ],
      followUpQuestions: [
        `What are the benefits of ${feature.name}?`,
        "Can you give me more detailed steps?",
        "What if I run into problems?",
        "Show me advanced tips for this feature",
      ],
      relatedTopics: feature.relatedFeatures || ["platform features"],
    };
  }

  /**
   * Generate tutorial response
   */
  private generateTutorialResponse(
    tutorial: any,
    user: User,
    analysis?: ConversationAnalysis,
  ): IntelligentAIResponse {
    const encouragement = this.getRandomItem(
      this.personalityTraits.encouragement,
    );

    const firstSteps = tutorial.steps
      .slice(0, 3)
      .map(
        (step: any) => `**${step.step}. ${step.title}:** ${step.description}`,
      )
      .join("\n\n");

    return {
      message: `${encouragement} I have the perfect tutorial for you: **${tutorial.title}**!

📚 **Overview:** ${tutorial.description}
⏱️ **Time needed:** ${tutorial.estimatedTime}
🎯 **Difficulty:** ${tutorial.difficulty}

**Here are the first steps:**

${firstSteps}

Ready to dive in? I can guide you through each step!`,
      confidence: 95,
      sources: ["Eloity Tutorials"],
      category: "eloity",
      suggestedActions: [
        {
          id: "start-tutorial",
          label: "Start Tutorial",
          action: "navigate",
          url: "/ai-assistant",
        },
      ],
      followUpQuestions: [
        "Walk me through step 1 in detail",
        "What do I need before starting?",
        "Show me all the steps",
        "What comes after this tutorial?",
      ],
      relatedTopics: ["tutorials", "learning", "step-by-step"],
    };
  }

  /**
   * Generate FAQ response
   */
  private generateFAQResponse(
    faq: any,
    user: User,
    analysis?: ConversationAnalysis,
  ): IntelligentAIResponse {
    const casual = this.getRandomItem(this.personalityTraits.casual);

    return {
      message: `Great question! This is ${casual} something many people ask about.

**Q: ${faq.question}**

**A:** ${faq.answer}

Does this answer your question, or would you like me to go deeper into any part?`,
      confidence: 90,
      sources: ["Eloity FAQ"],
      category: "eloity",
      suggestedActions: [],
      followUpQuestions: [
        "Can you explain this in more detail?",
        "What are some related topics?",
        "How do I get started with this?",
      ],
      relatedTopics: [faq.category, "frequently asked questions"],
    };
  }

  /**
   * Get feature URL from key
   */
  private getFeatureUrl(featureKey: string): string {
    const urlMap: Record<string, string> = {
      "social-feed": "/app/feed",
      "crypto-trading": "/crypto",
      marketplace: "/marketplace",
      "freelance-platform": "/freelance",
      "wallet-system": "/wallet",
      "rewards-system": "/rewards",
      "ai-assistant": "/ai-assistant",
    };

    return urlMap[featureKey] || "/explore";
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const realTimeAIService = new RealTimeAIService();
