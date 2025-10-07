// @ts-nocheck
import { FileText, TrendingUp, Shield, Target, Zap, Coins } from "lucide-react";
import { ActivityRewardService } from './activityRewardService';
import { PlatformRewardIntegration } from './platformRewardIntegration';

export interface ArticleQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface EducationalArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    title: string;
    avatar: string;
  };
  publishedAt: string;
  updatedAt: string;
  readingTime: number; // in minutes
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: {
    id: string;
    name: string;
    color: string;
  };
  tags: string[];
  featuredImage?: string;
  icon: any;
  quiz: {
    id: string;
    title: string;
    description: string;
    passingScore: number; // percentage
    questions: ArticleQuizQuestion[];
  };
  stats: {
    views: number;
    likes: number;
    bookmarks: number;
    quizAttempts: number;
    averageScore: number;
  };
  rewardPoints: {
    reading: number;
    quizCompletion: number;
    perfectScore: number;
  };
}

export interface UserArticleProgress {
  articleId: string;
  completed: boolean;
  quizScore?: number;
  timeSpent: number; // in minutes
  lastRead: Date;
  bookmarked: boolean;
  liked: boolean;
  rewardsEarned: {
    reading: boolean;
    quizCompletion: boolean;
    perfectScore: boolean;
  };
}

// Mock educational articles data
const mockEducationalArticles: EducationalArticle[] = [
  {
    id: "understanding-blockchain",
    title: "Understanding Blockchain Technology: A Comprehensive Guide",
    excerpt: "Learn the fundamental concepts behind blockchain technology, how it works, and why it's revolutionary for digital transactions and data storage.",
    content: `
# Understanding Blockchain Technology: A Comprehensive Guide

## What is Blockchain?

Blockchain is a distributed ledger technology that maintains a continuously growing list of records, called blocks, which are linked and secured using cryptography. Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data.

## Key Components of Blockchain

### 1. Blocks
Each block in a blockchain contains:
- **Header**: Contains metadata about the block
- **Merkle Root**: A hash of all transactions in the block
- **Previous Block Hash**: Links to the previous block
- **Timestamp**: When the block was created
- **Nonce**: A number used in the proof-of-work consensus

### 2. Hash Functions
Hash functions are mathematical algorithms that convert input data into a fixed-size string of characters. In blockchain:
- They ensure data integrity
- Create unique fingerprints for blocks
- Make tampering easily detectable

### 3. Consensus Mechanisms
Different blockchains use various consensus mechanisms:
- **Proof of Work (PoW)**: Used by Bitcoin
- **Proof of Stake (PoS)**: Used by Ethereum 2.0
- **Delegated Proof of Stake (DPoS)**: Used by some altcoins

## How Blockchain Works

1. **Transaction Initiation**: A user initiates a transaction
2. **Broadcasting**: The transaction is broadcast to the network
3. **Validation**: Network nodes validate the transaction
4. **Block Creation**: Valid transactions are bundled into a block
5. **Consensus**: The network agrees on the new block
6. **Block Addition**: The block is added to the chain
7. **Distribution**: The updated blockchain is distributed across the network

## Benefits of Blockchain

### Decentralization
No single point of control or failure, making the system more robust and censorship-resistant.

### Transparency
All transactions are visible to network participants, promoting trust and accountability.

### Immutability
Once data is recorded in a block and confirmed, it becomes extremely difficult to alter.

### Security
Cryptographic hashing and consensus mechanisms provide strong security guarantees.

## Real-World Applications

### Cryptocurrencies
The most well-known application, enabling peer-to-peer digital transactions without intermediaries.

### Supply Chain Management
Tracking products from manufacturer to consumer, ensuring authenticity and preventing counterfeiting.

### Digital Identity
Secure, verifiable digital identities that users control.

### Smart Contracts
Self-executing contracts with terms directly written into code.

## Challenges and Limitations

### Scalability
Most blockchains can only process a limited number of transactions per second.

### Energy Consumption
Proof-of-work consensus mechanisms require significant computational power.

### Regulatory Uncertainty
Governments worldwide are still developing frameworks for blockchain regulation.

### Technical Complexity
Understanding and implementing blockchain solutions requires specialized knowledge.

## The Future of Blockchain

Blockchain technology continues to evolve with developments in:
- **Layer 2 Solutions**: Improving scalability
- **Interoperability**: Connecting different blockchains
- **Green Consensus**: More energy-efficient mechanisms
- **Mainstream Adoption**: Integration with traditional systems

## Conclusion

Blockchain technology represents a paradigm shift in how we think about data storage, verification, and transfer. While challenges remain, its potential to revolutionize industries from finance to healthcare makes it one of the most significant technological innovations of our time.

Understanding blockchain fundamentals is crucial for anyone looking to participate in the digital economy of the future.
    `,
    author: {
      name: "Dr. Sarah Chen",
      title: "Blockchain Researcher",
      avatar: "/api/placeholder/64/64"
    },
    publishedAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
    readingTime: 12,
    difficulty: "Beginner",
    category: {
      id: "fundamentals",
      name: "Fundamentals",
      color: "from-blue-500 to-cyan-600"
    },
    tags: ["blockchain", "technology", "fundamentals", "beginner"],
    featuredImage: "/api/placeholder/400/200",
    icon: FileText,
    quiz: {
      id: "blockchain-quiz-1",
      title: "Blockchain Fundamentals Quiz",
      description: "Test your understanding of blockchain technology basics",
      passingScore: 70,
      questions: [
        {
          id: "q1",
          question: "What is the primary purpose of a hash function in blockchain?",
          options: [
            "To encrypt user passwords",
            "To create unique fingerprints for data integrity",
            "To mine new cryptocurrencies",
            "To store transaction data"
          ],
          correctAnswer: 1,
          explanation: "Hash functions create unique fingerprints for data, ensuring integrity and making tampering easily detectable."
        },
        {
          id: "q2",
          question: "Which consensus mechanism is used by Bitcoin?",
          options: [
            "Proof of Stake (PoS)",
            "Delegated Proof of Stake (DPoS)",
            "Proof of Work (PoW)",
            "Proof of Authority (PoA)"
          ],
          correctAnswer: 2,
          explanation: "Bitcoin uses Proof of Work (PoW) consensus mechanism, where miners compete to solve computational puzzles."
        },
        {
          id: "q3",
          question: "What makes blockchain data immutable?",
          options: [
            "Government regulation",
            "Cryptographic hashing and consensus mechanisms",
            "Internet protocols",
            "Database encryption"
          ],
          correctAnswer: 1,
          explanation: "The combination of cryptographic hashing and consensus mechanisms makes it extremely difficult to alter data once it's recorded."
        },
        {
          id: "q4",
          question: "What is a key benefit of blockchain decentralization?",
          options: [
            "Faster transaction processing",
            "Lower costs",
            "No single point of failure",
            "Easier government control"
          ],
          correctAnswer: 2,
          explanation: "Decentralization eliminates single points of failure, making the system more robust and censorship-resistant."
        }
      ]
    },
    stats: {
      views: 15420,
      likes: 1890,
      bookmarks: 756,
      quizAttempts: 3420,
      averageScore: 78
    },
    rewardPoints: {
      reading: 0.5,
      quizCompletion: 1.0,
      perfectScore: 2.0
    }
  },
  {
    id: "crypto-wallet-security",
    title: "Cryptocurrency Wallet Security: Protecting Your Digital Assets",
    excerpt: "Learn essential security practices for cryptocurrency wallets, from choosing the right wallet type to implementing multi-layer security measures.",
    content: `
# Cryptocurrency Wallet Security: Protecting Your Digital Assets

## Introduction

Cryptocurrency wallet security is paramount in the digital asset ecosystem. Unlike traditional banks, there's no customer service to call if your crypto is stolen. You are your own bank, which means you're responsible for keeping your assets safe.

## Types of Cryptocurrency Wallets

### Hot Wallets (Connected to Internet)

#### Mobile Wallets
- **Pros**: Convenient for daily transactions, easy to use
- **Cons**: Vulnerable to malware and phone theft
- **Best for**: Small amounts for daily spending

#### Desktop Wallets
- **Pros**: More control than web wallets, can work offline
- **Cons**: Vulnerable to computer viruses and hardware failure
- **Best for**: Regular trading and medium amounts

#### Web Wallets
- **Pros**: Accessible from anywhere, user-friendly
- **Cons**: Least secure, vulnerable to exchange hacks
- **Best for**: Small amounts and beginners (with caution)

### Cold Wallets (Offline Storage)

#### Hardware Wallets
- **Pros**: Highest security, offline storage
- **Cons**: Cost, can be lost or damaged
- **Best for**: Long-term storage of significant amounts

#### Paper Wallets
- **Pros**: Completely offline, free to create
- **Cons**: Easily destroyed, difficult to use
- **Best for**: Long-term storage (with proper backup)

## Essential Security Practices

### 1. Use Strong, Unique Passwords
- Create complex passwords with at least 12 characters
- Use a mix of uppercase, lowercase, numbers, and symbols
- Never reuse passwords across different platforms
- Consider using a reputable password manager

### 2. Enable Two-Factor Authentication (2FA)
- Use authenticator apps like Google Authenticator or Authy
- Avoid SMS-based 2FA when possible (SIM swapping risk)
- Keep backup codes in a secure location

### 3. Secure Your Private Keys
- **Never share your private keys** with anyone
- Store private keys offline when possible
- Use multiple backup locations
- Consider splitting keys across multiple secure locations

### 4. Regular Software Updates
- Keep wallet software updated to the latest version
- Update your operating system regularly
- Keep antivirus software current

### 5. Use Reputable Wallets Only
- Research wallet providers thoroughly
- Check reviews and security audits
- Avoid unknown or suspicious wallet applications

## Advanced Security Measures

### Multi-Signature Wallets
Multi-signature (multisig) wallets require multiple private keys to authorize transactions:
- **2-of-3 setup**: You hold 2 keys, a trusted party holds 1
- **2-of-2 setup**: You and a partner each hold 1 key
- Provides redundancy and shared control

### Hardware Security Modules (HSMs)
For institutional or high-value storage:
- FIPS 140-2 Level 3 or 4 certified devices
- Tamper-resistant hardware
- Suitable for exchanges and large holders

### Air-Gapped Systems
Complete isolation from internet-connected devices:
- Dedicated offline computer for wallet operations
- Transfer transactions via QR codes or USB
- Maximum security for large amounts

## Common Security Threats

### Phishing Attacks
- Fake websites mimicking legitimate services
- Fraudulent emails requesting private keys
- **Protection**: Always verify URLs, never click suspicious links

### Malware and Keyloggers
- Software that steals passwords and private keys
- **Protection**: Use reputable antivirus, avoid suspicious downloads

### SIM Swapping
- Attackers take control of your phone number
- **Protection**: Use authenticator apps instead of SMS 2FA

### Social Engineering
- Manipulating people to reveal sensitive information
- **Protection**: Be skeptical of unsolicited contact, verify identities

### Exchange Hacks
- Centralized exchanges can be compromised
- **Protection**: Don't store large amounts on exchanges

## Best Practices Summary

1. **Use hardware wallets** for long-term storage
2. **Keep only small amounts** in hot wallets
3. **Backup everything** in multiple secure locations
4. **Test your backups** regularly
5. **Stay informed** about security threats
6. **Use unique passwords** and 2FA everywhere
7. **Be paranoid** about security - it's better to be safe

## Emergency Procedures

### If Your Wallet is Compromised
1. **Immediately** move funds to a new, secure wallet
2. Change all passwords and security settings
3. Review all recent transactions
4. Report to relevant authorities if significant loss occurred

### Recovery Planning
- Document your recovery process
- Test recovery procedures with small amounts
- Store recovery information securely
- Update beneficiaries on access procedures

## Conclusion

Cryptocurrency security requires vigilance and proper practices. While the responsibility can seem daunting, following these guidelines will significantly reduce your risk. Remember: in crypto, you are your own bank, so take security seriously.

The cost of proper security measures is minimal compared to the potential loss from a security breach. Invest time in learning and implementing these practices - your future self will thank you.
    `,
    author: {
      name: "Marcus Rodriguez",
      title: "Cybersecurity Expert",
      avatar: "/api/placeholder/64/64"
    },
    publishedAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
    readingTime: 15,
    difficulty: "Intermediate",
    category: {
      id: "security",
      name: "Security",
      color: "from-red-500 to-pink-600"
    },
    tags: ["security", "wallets", "protection", "best-practices"],
    featuredImage: "/api/placeholder/400/200",
    icon: Shield,
    quiz: {
      id: "security-quiz-1",
      title: "Wallet Security Quiz",
      description: "Test your knowledge of cryptocurrency wallet security practices",
      passingScore: 75,
      questions: [
        {
          id: "q1",
          question: "What is the most secure type of cryptocurrency wallet for long-term storage?",
          options: [
            "Web wallet",
            "Mobile wallet",
            "Hardware wallet",
            "Exchange wallet"
          ],
          correctAnswer: 2,
          explanation: "Hardware wallets provide the highest security by keeping private keys offline and away from potential online threats."
        },
        {
          id: "q2",
          question: "What should you never do with your private keys?",
          options: [
            "Store them in multiple locations",
            "Share them with anyone",
            "Write them down",
            "Use them to sign transactions"
          ],
          correctAnswer: 1,
          explanation: "Private keys should never be shared with anyone. They provide complete control over your cryptocurrency funds."
        },
        {
          id: "q3",
          question: "What is the main risk of using SMS-based 2FA?",
          options: [
            "It's too complicated",
            "SIM swapping attacks",
            "It costs money",
            "It's not supported"
          ],
          correctAnswer: 1,
          explanation: "SIM swapping allows attackers to take control of your phone number and receive your 2FA codes."
        },
        {
          id: "q4",
          question: "In a 2-of-3 multisig setup, how many signatures are needed to authorize a transaction?",
          options: [
            "1 signature",
            "2 signatures",
            "3 signatures",
            "All signatures"
          ],
          correctAnswer: 1,
          explanation: "In a 2-of-3 multisig setup, any 2 out of the 3 private keys can authorize a transaction, providing both security and redundancy."
        }
      ]
    },
    stats: {
      views: 12850,
      likes: 1560,
      bookmarks: 890,
      quizAttempts: 2750,
      averageScore: 82
    },
    rewardPoints: {
      reading: 0.75,
      quizCompletion: 1.5,
      perfectScore: 2.5
    }
  },
  {
    id: "defi-yield-farming",
    title: "DeFi Yield Farming: Maximizing Returns in Decentralized Finance",
    excerpt: "Explore the world of yield farming in DeFi, learn about liquidity pools, farming strategies, and how to manage risks while maximizing returns.",
    content: `
# DeFi Yield Farming: Maximizing Returns in Decentralized Finance

## What is Yield Farming?

Yield farming, also known as liquidity mining, is a practice in decentralized finance (DeFi) where users provide liquidity to protocols in exchange for rewards. These rewards can come in the form of transaction fees, governance tokens, or additional cryptocurrency incentives.

## Core Concepts

### Liquidity Pools
Liquidity pools are smart contracts that hold funds for automated market makers (AMMs):
- **Purpose**: Enable trading without traditional order books
- **Function**: Users deposit tokens in pairs (e.g., ETH/USDC)
- **Rewards**: Earn fees from trades that occur in the pool

### Automated Market Makers (AMMs)
AMMs use mathematical formulas to price assets:
- **Constant Product Formula**: x * y = k (used by Uniswap)
- **Stable Curves**: Optimized for stablecoin trading (Curve)
- **Weighted Pools**: Custom weightings for different assets (Balancer)

### Impermanent Loss
A key risk in yield farming where the value of deposited tokens changes relative to holding them:
- **Occurs when**: Token prices diverge from when you deposited
- **Mitigation**: Choose stable pairs, understand the risk/reward ratio
- **Calculation**: Compare LP token value to holding tokens separately

## Popular Yield Farming Strategies

### 1. Liquidity Provision
Providing liquidity to DEX pools:
- **Platforms**: Uniswap, SushiSwap, PancakeSwap
- **Returns**: Trading fees + potential governance tokens
- **Risk**: Impermanent loss, smart contract risk

### 2. Lending and Borrowing
Earn interest by lending crypto or borrowing against collateral:
- **Platforms**: Aave, Compound, MakerDAO
- **Strategy**: Lend stablecoins for steady returns
- **Advanced**: Leverage strategies using borrowed funds

### 3. Staking
Lock tokens to support network security:
- **Proof of Stake**: Ethereum 2.0, Cardano, Solana
- **Governance Staking**: Lock tokens for voting rights + rewards
- **Liquid Staking**: Stake while maintaining liquidity (Lido, Rocket Pool)

### 4. Yield Aggregation
Automated strategies that move funds between protocols:
- **Platforms**: Yearn Finance, Harvest Finance, Beefy
- **Benefits**: Optimized returns, automated rebalancing
- **Considerations**: Additional fees, complexity

## Risk Management

### Smart Contract Risk
- **Audit Status**: Only use audited protocols
- **Bug Bounties**: Look for active bug bounty programs
- **Track Record**: Consider protocol history and reputation

### Impermanent Loss Management
- **Stable Pairs**: Use stablecoin pairs to minimize IL
- **Fee Analysis**: Ensure fees outweigh potential IL
- **Time Horizon**: Longer periods may recover from temporary divergence

### Economic Risks
- **Token Price Risk**: Farming tokens may lose value
- **Regulatory Risk**: Government actions may affect DeFi
- **Market Risk**: Overall crypto market volatility

### Operational Security
- **Wallet Security**: Use hardware wallets for large amounts
- **Transaction Verification**: Always verify contract addresses
- **Slippage Settings**: Set appropriate slippage tolerance

## Advanced Strategies

### Leveraged Yield Farming
Using borrowed funds to increase position size:
- **Platforms**: Alpha Homora, Gearbox
- **Mechanics**: Borrow against collateral to farm larger amounts
- **Risk**: Amplified losses, liquidation risk

### Cross-Chain Farming
Farming across different blockchains:
- **Opportunities**: Ethereum, BSC, Polygon, Avalanche
- **Bridges**: Move assets between chains safely
- **Considerations**: Bridge risks, gas fees

### Algorithmic Stablecoins
Participating in experimental stablecoin mechanisms:
- **Examples**: Terra (before collapse), Frax, OHM
- **High Risk**: Experimental mechanisms, potential total loss
- **Due Diligence**: Understand tokenomics thoroughly

## Tax Considerations

### Record Keeping
- **Transaction Logs**: Keep detailed records of all farming activities
- **Token Valuations**: Record USD values at transaction time
- **Rewards Tracking**: Monitor claimed rewards and their values

### Tax Events
- **Income**: Farming rewards are typically taxable as income
- **Capital Gains**: Selling farmed tokens triggers capital gains/losses
- **Professional Advice**: Consult tax professionals for specific situations

## Tools and Resources

### Analytics Platforms
- **DeFi Pulse**: Protocol rankings and TVL data
- **DeFiLlama**: Comprehensive yield tracking
- **Zapper**: Portfolio tracking and management
- **DeBank**: Multi-chain portfolio analysis

### Yield Aggregators
- **Yearn Finance**: Automated vault strategies
- **Harvest Finance**: Optimized farming strategies
- **Beefy Finance**: Multi-chain yield optimization

### Risk Assessment
- **DeFi Safety**: Protocol safety scores
- **CertiK**: Security audits and monitoring
- **Immunefi**: Bug bounty platform

## Getting Started

### 1. Education First
- Understand the fundamentals before investing
- Start with small amounts to learn
- Read protocol documentation thoroughly

### 2. Choose Your Strategy
- Assess your risk tolerance
- Start with established protocols
- Diversify across different strategies

### 3. Monitor and Adjust
- Track performance regularly
- Rebalance based on market conditions
- Stay informed about protocol changes

## Future of Yield Farming

### Trends to Watch
- **Real Yield**: Focus on revenue-generating protocols
- **Liquid Staking**: Growing adoption of liquid staking derivatives
- **Cross-Chain**: Increased interoperability between blockchains
- **Regulation**: Evolving regulatory frameworks

### Innovation Areas
- **Zero-Knowledge**: Privacy-preserving yield farming
- **AI-Driven**: Algorithmic strategy optimization
- **Social Trading**: Copy successful farmers' strategies

## Conclusion

Yield farming represents a significant innovation in finance, allowing users to earn returns on their cryptocurrency holdings in ways previously impossible. However, it requires careful consideration of risks, ongoing education, and active management.

Success in yield farming comes from understanding the underlying mechanisms, managing risks appropriately, and staying informed about the rapidly evolving DeFi landscape. Start small, learn continuously, and never invest more than you can afford to lose.

The DeFi space moves quickly, so what works today may not work tomorrow. Flexibility, education, and risk management are your best tools for navigating this exciting but volatile space.
    `,
    author: {
      name: "Alex Thompson",
      title: "DeFi Strategist",
      avatar: "/api/placeholder/64/64"
    },
    publishedAt: "2024-01-05T11:30:00Z",
    updatedAt: "2024-01-22T13:15:00Z",
    readingTime: 18,
    difficulty: "Advanced",
    category: {
      id: "defi",
      name: "DeFi",
      color: "from-purple-500 to-violet-600"
    },
    tags: ["defi", "yield-farming", "liquidity", "advanced"],
    featuredImage: "/api/placeholder/400/200",
    icon: Target,
    quiz: {
      id: "defi-quiz-1",
      title: "DeFi Yield Farming Quiz",
      description: "Test your understanding of yield farming concepts and strategies",
      passingScore: 80,
      questions: [
        {
          id: "q1",
          question: "What is impermanent loss?",
          options: [
            "Loss due to smart contract bugs",
            "Loss when token prices diverge from when you deposited",
            "Loss due to transaction fees",
            "Loss from failed transactions"
          ],
          correctAnswer: 1,
          explanation: "Impermanent loss occurs when the price ratio of tokens in a liquidity pool changes from when you deposited them."
        },
        {
          id: "q2",
          question: "What formula does Uniswap use for its AMM?",
          options: [
            "x + y = k",
            "x * y = k",
            "x / y = k",
            "x - y = k"
          ],
          correctAnswer: 1,
          explanation: "Uniswap uses the constant product formula x * y = k, where x and y are the quantities of two tokens in a pool."
        },
        {
          id: "q3",
          question: "What is the main benefit of yield aggregators?",
          options: [
            "Higher security",
            "Lower fees",
            "Automated optimization and rebalancing",
            "Government backing"
          ],
          correctAnswer: 2,
          explanation: "Yield aggregators automatically move funds between protocols to optimize returns and handle rebalancing."
        },
        {
          id: "q4",
          question: "What should you consider before leveraged yield farming?",
          options: [
            "Only the potential returns",
            "Liquidation risk and amplified losses",
            "Government approval",
            "Social media sentiment"
          ],
          correctAnswer: 1,
          explanation: "Leveraged yield farming amplifies both gains and losses, and carries liquidation risk if collateral value drops."
        }
      ]
    },
    stats: {
      views: 8940,
      likes: 1120,
      bookmarks: 567,
      quizAttempts: 1890,
      averageScore: 75
    },
    rewardPoints: {
      reading: 1.0,
      quizCompletion: 2.0,
      perfectScore: 3.0
    }
  }
];

// Mock user progress data
let userArticleProgressData: { [userId: string]: UserArticleProgress[] } = {};

class EducationalArticleService {
  // Get all educational articles
  getAllArticles(): EducationalArticle[] {
    return mockEducationalArticles;
  }

  // Get article by ID
  getArticleById(articleId: string): EducationalArticle | null {
    return mockEducationalArticles.find(article => article.id === articleId) || null;
  }

  // Get articles by difficulty
  getArticlesByDifficulty(difficulty: string): EducationalArticle[] {
    return mockEducationalArticles.filter(article => article.difficulty === difficulty);
  }

  // Get articles by category
  getArticlesByCategory(categoryId: string): EducationalArticle[] {
    return mockEducationalArticles.filter(article => article.category.id === categoryId);
  }

  // Search articles
  searchArticles(query: string): EducationalArticle[] {
    const lowercaseQuery = query.toLowerCase();
    return mockEducationalArticles.filter(article =>
      article.title.toLowerCase().includes(lowercaseQuery) ||
      article.excerpt.toLowerCase().includes(lowercaseQuery) ||
      article.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Get user progress for article
  getUserArticleProgress(userId: string, articleId: string): UserArticleProgress | null {
    const userProgress = userArticleProgressData[userId] || [];
    return userProgress.find(progress => progress.articleId === articleId) || null;
  }

  // Update reading progress with reward tracking
  async updateReadingProgress(userId: string, articleId: string, timeSpent: number): Promise<void> {
    if (!userArticleProgressData[userId]) {
      userArticleProgressData[userId] = [];
    }

    const article = this.getArticleById(articleId);
    if (!article) return;

    let existingProgress = userArticleProgressData[userId].find(p => p.articleId === articleId);
    if (!existingProgress) {
      existingProgress = {
        articleId,
        completed: false,
        timeSpent: 0,
        lastRead: new Date(),
        bookmarked: false,
        liked: false,
        rewardsEarned: {
          reading: false,
          quizCompletion: false,
          perfectScore: false
        }
      };
      userArticleProgressData[userId].push(existingProgress);
    }

    existingProgress.timeSpent += timeSpent;
    existingProgress.lastRead = new Date();

    // Award reading reward if user has spent sufficient time and hasn't earned it yet
    const minimumReadTime = Math.max(article.readingTime * 0.8, 5); // 80% of reading time or 5 minutes minimum
    if (existingProgress.timeSpent >= minimumReadTime && !existingProgress.rewardsEarned.reading) {
      await this.awardReadingReward(userId, articleId, article.rewardPoints.reading);
      existingProgress.rewardsEarned.reading = true;
    }
  }

  // Save quiz score with reward tracking
  async saveQuizScore(userId: string, articleId: string, score: number): Promise<boolean> {
    try {
      if (!userArticleProgressData[userId]) {
        userArticleProgressData[userId] = [];
      }

      const article = this.getArticleById(articleId);
      if (!article) return false;

      let progress = userArticleProgressData[userId].find(p => p.articleId === articleId);
      if (!progress) {
        progress = {
          articleId,
          completed: false,
          timeSpent: 0,
          lastRead: new Date(),
          bookmarked: false,
          liked: false,
          rewardsEarned: {
            reading: false,
            quizCompletion: false,
            perfectScore: false
          }
        };
        userArticleProgressData[userId].push(progress);
      }

      progress.quizScore = score;
      progress.lastRead = new Date();
      
      // Mark as completed if quiz passed
      if (score >= article.quiz.passingScore) {
        progress.completed = true;
        
        // Award completion reward if not already earned
        if (!progress.rewardsEarned.quizCompletion) {
          await this.awardQuizCompletionReward(userId, articleId, article.rewardPoints.quizCompletion);
          progress.rewardsEarned.quizCompletion = true;
        }

        // Award perfect score bonus if applicable
        if (score === 100 && !progress.rewardsEarned.perfectScore) {
          await this.awardPerfectScoreReward(userId, articleId, article.rewardPoints.perfectScore);
          progress.rewardsEarned.perfectScore = true;
        }
      }

      return true;
    } catch (error) {
      console.error('Error saving quiz score:', error);
      return false;
    }
  }

  // Reward functions
  private async awardReadingReward(userId: string, articleId: string, points: number) {
    try {
      const article = this.getArticleById(articleId);
      await ActivityRewardService.logActivity({
        userId,
        actionType: "complete_lesson",
        targetId: articleId,
        targetType: "educational_article",
        value: points,
        metadata: {
          rewardType: "reading_completion",
          articleTitle: article?.title,
          difficulty: article?.difficulty,
          category: article?.category.name,
          points
        }
      });

      // Also log via platform integration
      await PlatformRewardIntegration.trackEducationalProgress({
        userId,
        contentId: articleId,
        contentType: "article",
        actionType: "reading_completion",
        pointsEarned: points,
        metadata: {
          title: article?.title,
          difficulty: article?.difficulty
        }
      });

      console.log(`🎓 Reading reward earned! +${points} points for completing article: ${article?.title}`);
    } catch (error) {
      console.error('Error awarding reading reward:', error);
    }
  }

  private async awardQuizCompletionReward(userId: string, articleId: string, points: number) {
    try {
      const article = this.getArticleById(articleId);
      await ActivityRewardService.logActivity({
        userId,
        actionType: "complete_lesson",
        targetId: articleId,
        targetType: "educational_article_quiz",
        value: points,
        metadata: {
          rewardType: "quiz_completion",
          articleTitle: article?.title,
          difficulty: article?.difficulty,
          category: article?.category.name,
          points
        }
      });

      await PlatformRewardIntegration.trackEducationalProgress({
        userId,
        contentId: articleId,
        contentType: "article_quiz",
        actionType: "quiz_completion",
        pointsEarned: points,
        metadata: {
          title: article?.title,
          difficulty: article?.difficulty
        }
      });

      console.log(`🏆 Quiz completion reward earned! +${points} points for passing quiz: ${article?.title}`);
    } catch (error) {
      console.error('Error awarding quiz completion reward:', error);
    }
  }

  private async awardPerfectScoreReward(userId: string, articleId: string, points: number) {
    try {
      const article = this.getArticleById(articleId);
      await ActivityRewardService.logActivity({
        userId,
        actionType: "achieve_milestone",
        targetId: articleId,
        targetType: "educational_article_quiz",
        value: points,
        metadata: {
          rewardType: "perfect_score",
          articleTitle: article?.title,
          difficulty: article?.difficulty,
          category: article?.category.name,
          points,
          milestone: "perfect_quiz_score"
        }
      });

      await PlatformRewardIntegration.trackEducationalProgress({
        userId,
        contentId: articleId,
        contentType: "article_quiz",
        actionType: "perfect_score",
        pointsEarned: points,
        metadata: {
          title: article?.title,
          difficulty: article?.difficulty,
          milestone: "perfect_score"
        }
      });

      console.log(`⭐ Perfect score bonus earned! +${points} points for 100% on quiz: ${article?.title}`);
    } catch (error) {
      console.error('Error awarding perfect score reward:', error);
    }
  }

  // Toggle bookmark
  toggleBookmark(userId: string, articleId: string): boolean {
    try {
      if (!userArticleProgressData[userId]) {
        userArticleProgressData[userId] = [];
      }

      let progress = userArticleProgressData[userId].find(p => p.articleId === articleId);
      if (!progress) {
        progress = {
          articleId,
          completed: false,
          timeSpent: 0,
          lastRead: new Date(),
          bookmarked: true,
          liked: false,
          rewardsEarned: {
            reading: false,
            quizCompletion: false,
            perfectScore: false
          }
        };
        userArticleProgressData[userId].push(progress);
      } else {
        progress.bookmarked = !progress.bookmarked;
      }

      return progress.bookmarked;
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      return false;
    }
  }

  // Toggle like
  async toggleLike(userId: string, articleId: string): Promise<boolean> {
    try {
      if (!userArticleProgressData[userId]) {
        userArticleProgressData[userId] = [];
      }

      let progress = userArticleProgressData[userId].find(p => p.articleId === articleId);
      if (!progress) {
        progress = {
          articleId,
          completed: false,
          timeSpent: 0,
          lastRead: new Date(),
          bookmarked: false,
          liked: true,
          rewardsEarned: {
            reading: false,
            quizCompletion: false,
            perfectScore: false
          }
        };
        userArticleProgressData[userId].push(progress);
      } else {
        progress.liked = !progress.liked;
      }

      // Award small reward for engagement
      if (progress.liked) {
        await ActivityRewardService.logActivity({
          userId,
          actionType: "like_post",
          targetId: articleId,
          targetType: "educational_article",
          metadata: {
            contentType: "educational_article"
          }
        });
      }

      return progress.liked;
    } catch (error) {
      console.error('Error toggling like:', error);
      return false;
    }
  }

  // Get user statistics
  getUserStats(userId: string): {
    articlesRead: number;
    articlesCompleted: number;
    averageScore: number;
    totalTimeSpent: number;
    bookmarkedArticles: number;
    totalPointsEarned: number;
    perfectScores: number;
  } {
    const userProgress = userArticleProgressData[userId] || [];
    const completedArticles = userProgress.filter(p => p.completed);
    const articlesWithScores = userProgress.filter(p => p.quizScore !== undefined);
    const bookmarkedArticles = userProgress.filter(p => p.bookmarked);
    const perfectScores = userProgress.filter(p => p.quizScore === 100);

    const averageScore = articlesWithScores.length > 0
      ? articlesWithScores.reduce((sum, p) => sum + (p.quizScore || 0), 0) / articlesWithScores.length
      : 0;

    const totalTimeSpent = userProgress.reduce((total, p) => total + p.timeSpent, 0);

    // Calculate total points earned
    let totalPointsEarned = 0;
    userProgress.forEach(progress => {
      const article = this.getArticleById(progress.articleId);
      if (article) {
        if (progress.rewardsEarned.reading) totalPointsEarned += article.rewardPoints.reading;
        if (progress.rewardsEarned.quizCompletion) totalPointsEarned += article.rewardPoints.quizCompletion;
        if (progress.rewardsEarned.perfectScore) totalPointsEarned += article.rewardPoints.perfectScore;
      }
    });

    return {
      articlesRead: userProgress.length,
      articlesCompleted: completedArticles.length,
      averageScore: Math.round(averageScore),
      totalTimeSpent,
      bookmarkedArticles: bookmarkedArticles.length,
      totalPointsEarned,
      perfectScores: perfectScores.length
    };
  }

  // Get recommended articles based on user's reading history
  getRecommendedArticles(userId: string): EducationalArticle[] {
    const userProgress = userArticleProgressData[userId] || [];
    const readArticleIds = userProgress.map(p => p.articleId);
    
    // Return articles not yet read
    return mockEducationalArticles.filter(article => !readArticleIds.includes(article.id));
  }

  // Get educational leaderboard for gamification
  getEducationalLeaderboard(timeframe: 'week' | 'month' | 'all' = 'month'): Array<{
    userId: string;
    points: number;
    articlesCompleted: number;
    perfectScores: number;
  }> {
    const leaderboard: { [userId: string]: { points: number; articlesCompleted: number; perfectScores: number } } = {};

    Object.entries(userArticleProgressData).forEach(([userId, progressArray]) => {
      const stats = this.getUserStats(userId);
      leaderboard[userId] = {
        points: stats.totalPointsEarned,
        articlesCompleted: stats.articlesCompleted,
        perfectScores: stats.perfectScores
      };
    });

    return Object.entries(leaderboard)
      .map(([userId, stats]) => ({ userId, ...stats }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 10); // Top 10
  }
}

export const educationalArticleService = new EducationalArticleService();
