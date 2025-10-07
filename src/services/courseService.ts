// @ts-nocheck
import {
  BookOpen,
  TrendingUp,
  Target,
  Shield,
  Brain,
  Play,
  FileText,
  CheckCircle2,
  Video,
  Download
} from "lucide-react";
import { getCompleteCoursesWithExtendedData } from "./courseDataExtension";
import { ActivityRewardService } from './activityRewardService';
import { PlatformRewardIntegration } from './platformRewardIntegration';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'text' | 'quiz' | 'interactive';
  duration: number; // in minutes
  content: string;
  videoUrl?: string;
  quizQuestions?: QuizQuestion[];
  completed: boolean;
  order: number;
  rewardPoints?: {
    completion: number;
    bonus?: number;
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  students: number;
  rating: number;
  lessons: Lesson[];
  totalLessons: number;
  icon: any;
  color: string;
  instructor: {
    name: string;
    title: string;
    avatar: string;
    bio: string;
  };
  objectives: string[];
  requirements: string[];
  tags: string[];
  enrolled: boolean;
  progress: number; // 0-100
  completedLessons: number;
  certificate: boolean;
  rewardPoints: {
    enrollment: number;
    completion: number;
    certificate: number;
  };
}

export interface UserProgress {
  courseId: string;
  completedLessons: string[];
  progress: number;
  lastAccessed: Date;
  timeSpent: number; // in minutes
  quizScores: { [lessonId: string]: number };
  rewardsEarned: {
    enrollment: boolean;
    lessonCompletions: string[]; // lesson IDs
    courseCompletion: boolean;
    certificate: boolean;
  };
}

// Mock course data with comprehensive lessons
const mockCourses: Course[] = [
  {
    id: "crypto-basics",
    title: "Cryptocurrency Basics",
    description: "Learn the fundamentals of digital currencies and blockchain technology",
    level: "Beginner",
    duration: "2 hours",
    students: 1250,
    rating: 4.8,
    totalLessons: 8,
    icon: BookOpen,
    color: "from-green-500 to-emerald-600",
    instructor: {
      name: "Sarah Johnson",
      title: "Blockchain Expert",
      avatar: "/api/placeholder/64/64",
      bio: "Former Goldman Sachs analyst with 8+ years in crypto markets"
    },
    objectives: [
      "Understand what cryptocurrency is and how it works",
      "Learn about blockchain technology and its applications",
      "Identify different types of cryptocurrencies",
      "Understand wallet security and best practices"
    ],
    requirements: [
      "Basic computer literacy",
      "Internet connection",
      "Open mind to new technology"
    ],
    tags: ["cryptocurrency", "blockchain", "basics", "beginner"],
    enrolled: false,
    progress: 0,
    completedLessons: 0,
    certificate: true,
    rewardPoints: {
      enrollment: 0.25,
      completion: 3.0,
      certificate: 5.0
    },
    lessons: [
      {
        id: "lesson-1",
        title: "What is Cryptocurrency?",
        description: "Introduction to digital currencies and their purpose",
        type: "video",
        duration: 15,
        content: "Cryptocurrency is a digital or virtual form of currency that uses cryptography for security...",
        videoUrl: "https://example.com/crypto-intro.mp4",
        completed: false,
        order: 1,
        rewardPoints: { completion: 0.25 }
      },
      {
        id: "lesson-2",
        title: "Understanding Blockchain Technology",
        description: "Learn how blockchain works as the foundation of crypto",
        type: "video",
        duration: 20,
        content: "Blockchain is a distributed ledger technology that maintains a continuously growing list of records...",
        videoUrl: "https://example.com/blockchain-intro.mp4",
        completed: false,
        order: 2,
        rewardPoints: { completion: 0.5 }
      },
      {
        id: "lesson-3",
        title: "Bitcoin: The First Cryptocurrency",
        description: "Deep dive into Bitcoin and its significance",
        type: "text",
        duration: 12,
        content: "Bitcoin was created in 2009 by an anonymous person or group known as Satoshi Nakamoto...",
        completed: false,
        order: 3,
        rewardPoints: { completion: 0.25 }
      },
      {
        id: "lesson-4",
        title: "Types of Cryptocurrencies",
        description: "Explore different categories of digital assets",
        type: "interactive",
        duration: 18,
        content: "Learn about various cryptocurrency categories including coins, tokens, stablecoins, and NFTs...",
        completed: false,
        order: 4,
        rewardPoints: { completion: 0.5 }
      },
      {
        id: "lesson-5",
        title: "Quiz: Crypto Fundamentals",
        description: "Test your knowledge of cryptocurrency basics",
        type: "quiz",
        duration: 10,
        content: "Assessment quiz covering the fundamentals of cryptocurrency",
        quizQuestions: [
          {
            id: "q1",
            question: "What technology underlies most cryptocurrencies?",
            options: ["Internet", "Blockchain", "Cloud Computing", "Artificial Intelligence"],
            correctAnswer: 1,
            explanation: "Blockchain technology is the distributed ledger system that underlies most cryptocurrencies."
          },
          {
            id: "q2",
            question: "Who created Bitcoin?",
            options: ["Vitalik Buterin", "Satoshi Nakamoto", "Charlie Lee", "Roger Ver"],
            correctAnswer: 1,
            explanation: "Satoshi Nakamoto is the pseudonymous creator of Bitcoin."
          }
        ],
        completed: false,
        order: 5,
        rewardPoints: { completion: 0.75, bonus: 0.5 }
      },
      {
        id: "lesson-6",
        title: "Crypto Wallets and Security",
        description: "Learn how to safely store your cryptocurrencies",
        type: "video",
        duration: 25,
        content: "A cryptocurrency wallet is a software program or physical device that stores your private keys...",
        videoUrl: "https://example.com/crypto-wallets.mp4",
        completed: false,
        order: 6,
        rewardPoints: { completion: 0.5 }
      },
      {
        id: "lesson-7",
        title: "Making Your First Transaction",
        description: "Step-by-step guide to sending and receiving crypto",
        type: "interactive",
        duration: 20,
        content: "Learn how to safely send and receive cryptocurrency transactions...",
        completed: false,
        order: 7,
        rewardPoints: { completion: 0.5 }
      },
      {
        id: "lesson-8",
        title: "Security Best Practices",
        description: "Protect your investments with proper security measures",
        type: "text",
        duration: 15,
        content: `
# Cryptocurrency Security Best Practices: Protecting Your Digital Assets

## Introduction

In the world of cryptocurrency, you are your own bank. This brings unprecedented freedom and control over your finances, but it also means you bear the full responsibility for keeping your assets secure. Unlike traditional banking, there's no customer service to call if something goes wrong, no central authority to reverse transactions, and no deposit insurance to protect you.

This comprehensive guide will teach you the essential security practices that every cryptocurrency holder must know to protect their digital assets from theft, loss, and other security threats.

## Understanding the Security Landscape

### The Stakes Are High
- **Irreversible Transactions**: Once a crypto transaction is confirmed, it cannot be reversed
- **No Central Authority**: No bank or government can recover lost or stolen funds
- **Anonymous Theft**: Cryptocurrency transactions can be difficult to trace
- **Growing Attack Surface**: New attack vectors emerge as the space evolves

### Common Threats
1. **Exchange Hacks**: Centralized platforms can be compromised
2. **Wallet Exploits**: Malicious software targeting crypto wallets
3. **Phishing Attacks**: Fake websites and emails stealing credentials
4. **Social Engineering**: Manipulating people to reveal sensitive information
5. **Physical Theft**: Device theft or coercion for private keys
6. **SIM Swapping**: Taking control of phone numbers for 2FA bypass

## Fundamental Security Principles

### 1. Defense in Depth
Never rely on a single security measure. Layer multiple protections:
- **Hardware Security**: Secure devices and storage
- **Software Security**: Updated and legitimate applications
- **Operational Security**: Safe practices and procedures
- **Information Security**: Protecting sensitive data

### 2. Principle of Least Privilege
Only keep the minimum amount of cryptocurrency in "hot" (internet-connected) storage needed for immediate use. Store the majority in secure, offline storage.

### 3. Trust But Verify
Always verify addresses, transaction details, and software authenticity. Double-check everything before confirming transactions.

## Wallet Security Hierarchy

### Hot Wallets (Internet-Connected)

#### Mobile Wallets
**Security Level**: Moderate
**Best For**: Small amounts for daily transactions
**Security Measures**:
- Use device lock screens with strong PINs/biometrics
- Enable app-level security features
- Keep operating system updated
- Avoid public Wi-Fi for transactions

#### Desktop Wallets
**Security Level**: Moderate to High
**Best For**: Regular trading and medium amounts
**Security Measures**:
- Use dedicated computer for crypto activities
- Install reputable antivirus software
- Enable full-disk encryption
- Regular system updates and security patches

#### Browser/Web Wallets
**Security Level**: Lower
**Best For**: Very small amounts only
**Security Measures**:
- Use only reputable, well-audited services
- Enable all available security features
- Use dedicated browser for crypto activities
- Clear cache and cookies regularly

### Cold Wallets (Offline Storage)

#### Hardware Wallets
**Security Level**: Highest
**Best For**: Long-term storage of significant amounts
**Security Measures**:
- Purchase directly from manufacturer
- Verify device authenticity and firmware
- Use strong PIN and passphrase
- Store recovery seed securely offline

#### Paper Wallets
**Security Level**: High (when properly created and stored)
**Best For**: Long-term storage with minimal access
**Security Measures**:
- Generate on air-gapped computer
- Use multiple physical copies
- Store in secure, climate-controlled locations
- Protect from physical damage and discovery

## Essential Security Practices

### 1. Strong Authentication

#### Passwords
- **Minimum 12 characters** with mix of types
- **Unique passwords** for every account
- **Password manager** to generate and store
- **Regular updates** every 3-6 months

#### Two-Factor Authentication (2FA)
- **Authenticator apps** preferred over SMS
- **Multiple backup methods** in case of device loss
- **Backup codes** stored securely offline
- **Avoid SMS 2FA** due to SIM swapping risk

### 2. Private Key Management

#### The Golden Rules
- **Never share** your private keys with anyone
- **Never store** private keys digitally unencrypted
- **Multiple backups** in separate secure locations
- **Test recovery** process with small amounts

#### Seed Phrase Security
- **Physical storage** only (no digital copies)
- **Metal backup** for fire/water resistance
- **Multiple locations** for redundancy
- **Split storage** for very large amounts
- **Regular verification** of backup integrity

### 3. Transaction Security

#### Before Every Transaction
1. **Verify recipient address** character by character
2. **Check transaction amount** and fees
3. **Confirm network/blockchain** is correct
4. **Review all details** before signing

#### During Transactions
1. **Use secure networks** (avoid public Wi-Fi)
2. **Monitor for suspicious activity**
3. **Keep transactions private**
4. **Save transaction records**

### 4. Software Security

#### Wallet Software
- **Download only** from official sources
- **Verify checksums** and signatures
- **Keep software updated** with latest security patches
- **Use open-source** wallets when possible

#### Operating System
- **Regular security updates**
- **Antivirus protection** (for Windows users)
- **Firewall configuration**
- **Minimal software installation**

## Advanced Security Measures

### Multi-Signature Wallets
Require multiple private keys to authorize transactions:

#### 2-of-3 Setup
- You control 2 keys
- Trusted third party holds 1 key
- Any 2 keys can authorize transactions
- Provides redundancy if one key is lost

#### Benefits
- **Shared control** for business accounts
- **Inheritance planning** for family access
- **Reduced single points of failure**
- **Enhanced security** for large amounts

### Hardware Security Modules (HSMs)
For institutional or very high-value storage:
- **FIPS 140-2 certified** devices
- **Tamper-resistant** hardware
- **Professional-grade** security
- **Compliance requirements** for businesses

### Air-Gapped Systems
Complete isolation from internet-connected devices:
- **Dedicated offline computer** for sensitive operations
- **QR code or USB** for transaction transfer
- **Maximum security** for large holdings
- **Complex setup** requiring technical knowledge

## Operational Security (OpSec)

### Information Protection
- **Avoid discussing** crypto holdings publicly
- **Use pseudonyms** in crypto communities
- **Limit social media** sharing about crypto activities
- **Be aware of** data breaches affecting exchanges

### Physical Security
- **Secure storage** for hardware wallets and backups
- **Home security** measures to prevent theft
- **Travel precautions** when carrying devices
- **Emergency procedures** for device loss

### Social Engineering Defense
- **Verify identities** of anyone requesting information
- **Be skeptical** of unsolicited contact
- **Never share** sensitive information over phone/email
- **Use official channels** for support requests

## Common Scams and How to Avoid Them

### Phishing Attacks
**Warning Signs**:
- Urgent messages requesting immediate action
- Suspicious URLs (check carefully for typos)
- Requests for private keys or seed phrases
- Too-good-to-be-true offers

**Protection**:
- Bookmark legitimate sites
- Check URLs carefully
- Never enter sensitive info from email links
- Use official apps instead of browsers when possible

### Fake Wallets and Apps
**Warning Signs**:
- Apps not from official app stores
- Suspicious permissions requests
- Poor reviews or new developer accounts
- Promises of enhanced features

**Protection**:
- Only download from official sources
- Verify developer credentials
- Check reviews and ratings
- Research before trying new wallets

### Investment Scams
**Warning Signs**:
- Guaranteed high returns
- Pressure to invest quickly
- Celebrity endorsements
- Pyramid or Ponzi structure

**Protection**:
- Research thoroughly before investing
- Be skeptical of guaranteed returns
- Never invest more than you can afford to lose
- Verify all claims independently

## Emergency Procedures

### If Your Wallet is Compromised
1. **Immediately** transfer funds to a new, secure wallet
2. **Change all passwords** associated with crypto accounts
3. **Review transaction history** for unauthorized activity
4. **Report** to relevant authorities if significant loss
5. **Learn from the incident** to prevent future occurrences

### Recovery Planning
- **Document your assets** and storage methods
- **Create recovery instructions** for trusted family members
- **Test recovery procedures** regularly with small amounts
- **Update inheritance plans** to include crypto assets

### If You Lose Access
1. **Don't panic** - rushed decisions often make things worse
2. **Systematically check** all possible recovery methods
3. **Contact support** for services you were using
4. **Consider professional recovery** services for large amounts
5. **Learn from the experience** to improve future security

## Security Checklist

### Daily Practices
- [ ] Check account balances for unauthorized activity
- [ ] Use secure networks for crypto activities
- [ ] Verify all transaction details before confirming
- [ ] Keep devices locked when not in use

### Weekly Practices
- [ ] Review transaction history
- [ ] Check for software updates
- [ ] Verify backup integrity
- [ ] Monitor news for security threats

### Monthly Practices
- [ ] Review and update passwords
- [ ] Test 2FA backup methods
- [ ] Audit security settings
- [ ] Review portfolio allocation between hot/cold storage

### Quarterly Practices
- [ ] Full security audit of all accounts
- [ ] Update recovery documentation
- [ ] Review and test emergency procedures
- [ ] Evaluate new security tools and practices

## Conclusion

Cryptocurrency security is not a one-time setup but an ongoing practice that requires vigilance, education, and adaptation to new threats. The decentralized nature of cryptocurrencies means that security is primarily your responsibility, but this also gives you complete control over your financial security.

### Key Takeaways
1. **Layer your security** - use multiple protection methods
2. **Keep learning** - security threats constantly evolve
3. **Start small** - practice with small amounts first
4. **Plan for recovery** - have procedures for various scenarios
5. **Stay paranoid** - healthy skepticism prevents costly mistakes

Remember: The goal isn't to eliminate all risk (which is impossible) but to reduce risk to acceptable levels while still being able to benefit from cryptocurrency's advantages. Good security practices become habits over time, and the investment in learning and implementing these practices will pay dividends in protecting your digital wealth.

The cryptocurrency space is still young, and security practices continue to evolve. Stay informed, stay cautious, and always prioritize the security of your assets over convenience. Your future self will thank you for the time and effort you invest in security today.
        `,
        completed: false,
        order: 8,
        rewardPoints: { completion: 0.75 }
      }
    ]
  },
  {
    id: "technical-analysis",
    title: "Technical Analysis Mastery",
    description: "Master chart patterns, indicators, and trading strategies",
    level: "Intermediate",
    duration: "4 hours",
    students: 890,
    rating: 4.9,
    totalLessons: 12,
    icon: TrendingUp,
    color: "from-blue-500 to-cyan-600",
    instructor: {
      name: "Michael Chen",
      title: "Professional Trader",
      avatar: "/api/placeholder/64/64",
      bio: "15+ years trading experience with institutional and retail clients"
    },
    objectives: [
      "Read and analyze crypto price charts",
      "Identify key support and resistance levels",
      "Use technical indicators effectively",
      "Develop profitable trading strategies"
    ],
    requirements: [
      "Basic understanding of cryptocurrency",
      "Familiarity with trading platforms",
      "Mathematical aptitude"
    ],
    tags: ["trading", "technical analysis", "charts", "indicators"],
    enrolled: false,
    progress: 0,
    completedLessons: 0,
    certificate: true,
    rewardPoints: {
      enrollment: 15,
      completion: 0.50,
      certificate: 200
    },
    lessons: [
      {
        id: "ta-lesson-1",
        title: "Introduction to Technical Analysis",
        description: "Understanding price action and market psychology",
        type: "video",
        duration: 20,
        content: "Technical analysis is the study of price movements to predict future market behavior...",
        videoUrl: "https://example.com/ta-intro.mp4",
        completed: false,
        order: 1,
        rewardPoints: { completion: 12 }
      },
      {
        id: "ta-lesson-2",
        title: "Reading Candlestick Charts",
        description: "Master the art of candlestick pattern recognition",
        type: "interactive",
        duration: 25,
        content: "Candlestick charts provide crucial information about market sentiment...",
        completed: false,
        order: 2,
        rewardPoints: { completion: 0.5 }
      },
      {
        id: "ta-lesson-3",
        title: "Support and Resistance Levels",
        description: "Identify key price levels that matter",
        type: "video",
        duration: 18,
        content: "Support and resistance levels are fundamental concepts in technical analysis...",
        videoUrl: "https://example.com/support-resistance.mp4",
        completed: false,
        order: 3,
        rewardPoints: { completion: 12 }
      },
      {
        id: "ta-lesson-4",
        title: "Moving Averages",
        description: "Learn to use moving averages for trend analysis",
        type: "text",
        duration: 15,
        content: `
# Moving Averages: The Foundation of Trend Analysis

## Introduction

Moving averages are one of the most fundamental and widely used technical indicators in financial markets. They smooth out price data by creating a constantly updated average price over a specific time period. This smoothing helps traders identify trend direction and potential reversal points while filtering out the "noise" of day-to-day price fluctuations.

## What are Moving Averages?

A moving average is calculated by taking the arithmetic mean of a security's price over a set number of periods. As new data becomes available, the oldest data point is dropped, and the newest is added, causing the average to "move" along the price chart.

**Key Characteristics:**
- **Trend Following**: Moving averages are lagging indicators that follow price trends
- **Smoothing Effect**: They reduce the impact of random price fluctuations
- **Support/Resistance**: Can act as dynamic support and resistance levels
- **Signal Generation**: Crossovers and slopes provide trading signals

## Types of Moving Averages

### Simple Moving Average (SMA)

The most basic type, calculated by adding closing prices over a period and dividing by the number of periods.

**Formula**: SMA = (P1 + P2 + ... + Pn) / n

**Characteristics:**
- Gives equal weight to all prices in the period
- Slower to react to recent price changes
- More stable, less prone to false signals

### Exponential Moving Average (EMA)

Gives more weight to recent prices, making it more responsive to new information.

**Characteristics:**
- Reacts faster to price changes
- Follows trends more closely
- More prone to false signals but catches trends earlier

### Weighted Moving Average (WMA)

Assigns different weights to different periods, typically giving more weight to recent data.

**Characteristics:**
- Customizable weighting scheme
- Faster response than SMA
- Less common in practice

## Popular Moving Average Periods

### Short-term Moving Averages (5-20 periods)
- **5-day**: Very responsive, good for scalping
- **10-day**: Popular for short-term trend identification
- **20-day**: Commonly used monthly reference

### Medium-term Moving Averages (21-100 periods)
- **50-day**: Industry standard for medium-term trends
- **100-day**: Quarterly trend reference

### Long-term Moving Averages (100+ periods)
- **200-day**: Most watched long-term trend indicator
- **365-day**: Annual trend reference

## Trading Strategies with Moving Averages

### 1. Trend Identification

**Uptrend Signals:**
- Price consistently above the moving average
- Moving average has a positive slope
- Higher moving average highs and lows

**Downtrend Signals:**
- Price consistently below the moving average
- Moving average has a negative slope
- Lower moving average highs and lows

### 2. Moving Average Crossovers

**Golden Cross:**
- Short-term MA crosses above long-term MA
- Bullish signal, often indicating trend reversal
- Most famous: 50-day crossing above 200-day

**Death Cross:**
- Short-term MA crosses below long-term MA
- Bearish signal, often indicating trend reversal
- 50-day crossing below 200-day is widely watched

### 3. Multiple Moving Average Systems

Using 3 or more moving averages to confirm trends:
- **Fast MA** (e.g., 10-day): Entry signals
- **Medium MA** (e.g., 50-day): Trend confirmation
- **Slow MA** (e.g., 200-day): Overall trend direction

### 4. Moving Average as Support/Resistance

- In uptrends, MA often acts as support
- In downtrends, MA often acts as resistance
- Bounces off MA can provide entry opportunities
- Breaks through MA can signal trend changes

## Advantages of Moving Averages

1. **Simplicity**: Easy to understand and calculate
2. **Versatility**: Work across all timeframes and markets
3. **Trend Clarity**: Clear visual representation of trend direction
4. **Objective**: Removes emotion from trend analysis
5. **Risk Management**: Can be used for stop-loss placement

## Limitations of Moving Averages

1. **Lagging Nature**: Always behind price action
2. **Whipsaws**: Can generate false signals in sideways markets
3. **No Predictive Power**: Only show what has happened, not what will happen
4. **Period Sensitivity**: Performance varies greatly with different periods

## Advanced Moving Average Concepts

### Moving Average Convergence Divergence (MACD)

Uses the relationship between two EMAs to generate signals:
- **MACD Line**: 12-day EMA minus 26-day EMA
- **Signal Line**: 9-day EMA of MACD line
- **Histogram**: Difference between MACD and signal line

### Bollinger Bands

Combines a simple moving average with standard deviation bands:
- **Middle Band**: 20-period SMA
- **Upper Band**: SMA + (2 × standard deviation)
- **Lower Band**: SMA - (2 × standard deviation)

### Adaptive Moving Averages

Automatically adjust their sensitivity based on market volatility:
- **KAMA (Kaufman's Adaptive MA)**: Adjusts based on price direction and volatility
- **ALMA (Arnaud Legoux MA)**: Reduces lag while maintaining smoothness

## Cryptocurrency-Specific Considerations

### Market Hours
- Crypto markets trade 24/7, affecting MA calculations
- No gaps like traditional markets
- Continuous price action can create different patterns

### Volatility
- Higher volatility may require longer MA periods
- More false signals in highly volatile conditions
- Consider using EMAs for faster response

### Volume
- Combine MAs with volume analysis
- Volume-weighted moving averages (VWMA) can be more relevant

## Practical Implementation Tips

### Choosing the Right Period
1. **Match your trading timeframe**: Day traders use shorter periods
2. **Consider market volatility**: Higher volatility = longer periods
3. **Test different combinations**: Backtest various periods
4. **Use market standards**: 50 and 200-day are widely watched

### Combining with Other Indicators
- **RSI**: Confirm overbought/oversold conditions
- **Volume**: Validate MA signals with volume confirmation
- **Support/Resistance**: Combine with horizontal levels
- **Candlestick Patterns**: Use for precise entry timing

### Risk Management
- Use MA for initial stop-loss placement
- Trail stops along moving averages
- Consider MA slope for position sizing
- Exit when MA structure breaks down

## Common Mistakes to Avoid

1. **Over-reliance**: MAs are just one tool among many
2. **Wrong Period Selection**: Not matching period to trading style
3. **Ignoring Market Context**: MAs work poorly in choppy markets
4. **Chasing Signals**: Acting on every crossover without confirmation
5. **Neglecting Risk Management**: Using MAs without proper stops

## Conclusion

Moving averages are foundational tools in technical analysis, providing clear visual representation of trends and generating actionable trading signals. While they have limitations as lagging indicators, their simplicity and effectiveness have made them enduring favorites among traders and investors.

Success with moving averages comes from:
- Understanding their strengths and limitations
- Choosing appropriate periods for your trading style
- Combining them with other technical tools
- Maintaining proper risk management
- Practicing patience and discipline in execution

Remember that no single indicator is perfect, and moving averages work best as part of a comprehensive trading strategy that includes multiple forms of analysis and sound risk management principles.
        `,
        completed: false,
        order: 4,
        rewardPoints: { completion: 18 }
      },
      {
        id: "ta-lesson-5",
        title: "RSI and Momentum Indicators",
        description: "Master oscillators for market timing",
        type: "video",
        duration: 22,
        content: "RSI and other momentum indicators help identify overbought and oversold conditions...",
        videoUrl: "https://example.com/rsi-indicators.mp4",
        completed: false,
        order: 5,
        rewardPoints: { completion: 0.5 }
      },
      {
        id: "ta-lesson-6",
        title: "Quiz: Technical Indicators",
        description: "Test your understanding of technical analysis tools",
        type: "quiz",
        duration: 12,
        content: "Assessment covering technical indicators and their applications",
        quizQuestions: [
          {
            id: "ta-q1",
            question: "What does RSI measure?",
            options: ["Price momentum", "Volume", "Volatility", "Market cap"],
            correctAnswer: 0,
            explanation: "RSI (Relative Strength Index) measures price momentum to identify overbought/oversold conditions."
          }
        ],
        completed: false,
        order: 6,
        rewardPoints: { completion: 0.75, bonus: 0.75 }
      },
      {
        id: "ta-lesson-7",
        title: "Chart Patterns",
        description: "Recognize profitable trading patterns",
        type: "interactive",
        duration: 30,
        content: "Chart patterns reveal market psychology and potential price movements...",
        completed: false,
        order: 7,
        rewardPoints: { completion: 18 }
      },
      {
        id: "ta-lesson-8",
        title: "Volume Analysis",
        description: "Use volume to confirm price movements",
        type: "video",
        duration: 16,
        content: "Volume analysis helps confirm the strength of price movements...",
        videoUrl: "https://example.com/volume-analysis.mp4",
        completed: false,
        order: 8,
        rewardPoints: { completion: 12 }
      },
      {
        id: "ta-lesson-9",
        title: "Risk Management in Trading",
        description: "Protect your capital with proper risk management",
        type: "text",
        duration: 20,
        content: "Risk management is the most important aspect of successful trading...",
        completed: false,
        order: 9,
        rewardPoints: { completion: 0.5 }
      },
      {
        id: "ta-lesson-10",
        title: "Building Trading Strategies",
        description: "Combine indicators into profitable strategies",
        type: "interactive",
        duration: 28,
        content: "Learn to combine multiple technical analysis tools into coherent trading strategies...",
        completed: false,
        order: 10,
        rewardPoints: { completion: 0.75 }
      },
      {
        id: "ta-lesson-11",
        title: "Backtesting Your Strategy",
        description: "Test strategies on historical data",
        type: "video",
        duration: 24,
        content: "Backtesting helps validate trading strategies before risking real money...",
        videoUrl: "https://example.com/backtesting.mp4",
        completed: false,
        order: 11,
        rewardPoints: { completion: 0.5 }
      },
      {
        id: "ta-lesson-12",
        title: "Final Assessment",
        description: "Comprehensive test of technical analysis skills",
        type: "quiz",
        duration: 15,
        content: "Final assessment covering all technical analysis concepts",
        quizQuestions: [
          {
            id: "ta-final-q1",
            question: "What is the most important aspect of trading?",
            options: ["Profit maximization", "Risk management", "Chart patterns", "Indicators"],
            correctAnswer: 1,
            explanation: "Risk management is crucial for long-term trading success."
          }
        ],
        completed: false,
        order: 12,
        rewardPoints: { completion: 1.0, bonus: 1.0 }
      }
    ]
  },
  // Add more courses with similar structure...
  {
    id: "defi-fundamentals",
    title: "DeFi Fundamentals",
    description: "Understand decentralized finance protocols and yield farming",
    level: "Advanced",
    duration: "3 hours",
    students: 567,
    rating: 4.7,
    totalLessons: 10,
    icon: Target,
    color: "from-purple-500 to-violet-600",
    instructor: {
      name: "Alex Rodriguez",
      title: "DeFi Protocol Developer",
      avatar: "/api/placeholder/64/64",
      bio: "Core developer at major DeFi protocols with deep smart contract expertise"
    },
    objectives: [
      "Understand DeFi protocols and their mechanisms",
      "Learn about liquidity mining and yield farming",
      "Navigate DeFi platforms safely",
      "Identify opportunities and risks in DeFi"
    ],
    requirements: [
      "Solid understanding of cryptocurrency",
      "Experience with crypto wallets",
      "Basic knowledge of Ethereum"
    ],
    tags: ["defi", "yield farming", "liquidity", "protocols"],
    enrolled: false,
    progress: 0,
    completedLessons: 0,
    certificate: true,
    rewardPoints: {
      enrollment: 20,
      completion: 0.750,
      certificate: 300
    },
    lessons: [
      {
        id: "defi-lesson-1",
        title: "Introduction to DeFi",
        description: "What is decentralized finance and why it matters",
        type: "video",
        duration: 18,
        content: "DeFi represents a paradigm shift from traditional finance to decentralized protocols...",
        videoUrl: "https://example.com/defi-intro.mp4",
        completed: false,
        order: 1,
        rewardPoints: { completion: 0.5 }
      },
      {
        id: "defi-lesson-2",
        title: "AMMs and Liquidity Pools",
        description: "Understanding automated market makers",
        type: "interactive",
        duration: 22,
        content: "Automated Market Makers revolutionize how trading works in DeFi...",
        completed: false,
        order: 2,
        rewardPoints: { completion: 0.75 }
      },
      // Add more DeFi lessons...
      {
        id: "defi-lesson-10",
        title: "DeFi Security and Risks",
        description: "Navigate DeFi safely and understand the risks",
        type: "text",
        duration: 20,
        content: "DeFi offers great opportunities but comes with unique risks that must be understood...",
        completed: false,
        order: 10,
        rewardPoints: { completion: 25 }
      }
    ]
  },
  // Skeleton courses that will be extended with full data
  {
    id: "risk-management",
    title: "Risk Management",
    description: "Learn how to protect your investments and minimize losses",
    level: "Intermediate",
    duration: "2.5 hours",
    students: 750,
    rating: 4.8,
    totalLessons: 9,
    icon: Shield,
    color: "from-orange-500 to-red-600",
    instructor: {
      name: "Jennifer Davis",
      title: "Risk Management Specialist",
      avatar: "/api/placeholder/64/64",
      bio: "Former hedge fund risk manager with 12+ years experience"
    },
    objectives: [],
    requirements: [],
    tags: ["risk management", "trading", "portfolio"],
    enrolled: false,
    progress: 0,
    completedLessons: 0,
    certificate: true,
    rewardPoints: {
      enrollment: 0.5,
      completion: 4.0,
      certificate: 6.0
    },
    lessons: []
  },
  {
    id: "crypto-security",
    title: "Crypto Security Best Practices",
    description: "Secure your digital assets with proper wallet and key management",
    level: "Beginner",
    duration: "1.5 hours",
    students: 980,
    rating: 4.9,
    totalLessons: 6,
    icon: Shield,
    color: "from-red-500 to-pink-600",
    instructor: {
      name: "David Kim",
      title: "Cybersecurity Expert",
      avatar: "/api/placeholder/64/64",
      bio: "Cybersecurity specialist focused on blockchain security"
    },
    objectives: [],
    requirements: [],
    tags: ["security", "wallets", "safety"],
    enrolled: false,
    progress: 0,
    completedLessons: 0,
    certificate: true,
    rewardPoints: {
      enrollment: 0.25,
      completion: 2.5,
      certificate: 4.0
    },
    lessons: []
  },
  {
    id: "trading-psychology",
    title: "Advanced Trading Psychology",
    description: "Master the mental aspects of trading and emotional control",
    level: "Advanced",
    duration: "3.5 hours",
    students: 445,
    rating: 4.6,
    totalLessons: 11,
    icon: Brain,
    color: "from-indigo-500 to-purple-600",
    instructor: {
      name: "Dr. Maria Rodriguez",
      title: "Trading Psychologist",
      avatar: "/api/placeholder/64/64",
      bio: "PhD in Psychology specializing in trader behavior"
    },
    objectives: [],
    requirements: [],
    tags: ["psychology", "emotions", "discipline"],
    enrolled: false,
    progress: 0,
    completedLessons: 0,
    certificate: true,
    rewardPoints: {
      enrollment: 0.75,
      completion: 6.0,
      certificate: 10.0
    },
    lessons: []
  }
];

// Mock user progress data
let userProgressData: { [userId: string]: UserProgress[] } = {};

class CourseService {
  // Get all courses with complete lesson data
  getAllCourses(): Course[] {
    return getCompleteCoursesWithExtendedData(mockCourses);
  }

  // Get course by ID
  getCourseById(courseId: string): Course | null {
    return mockCourses.find(course => course.id === courseId) || null;
  }

  // Get courses by level
  getCoursesByLevel(level: string): Course[] {
    return mockCourses.filter(course => course.level === level);
  }

  // Get user's enrolled courses
  getEnrolledCourses(userId: string): Course[] {
    const userProgress = this.getUserProgress(userId);
    const enrolledCourseIds = userProgress.map(p => p.courseId);
    return mockCourses.filter(course => enrolledCourseIds.includes(course.id));
  }

  // Enroll user in course with reward
  async enrollInCourse(userId: string, courseId: string): Promise<boolean> {
    try {
      const course = this.getCourseById(courseId);
      if (!course) return false;

      // Initialize user progress if not exists
      if (!userProgressData[userId]) {
        userProgressData[userId] = [];
      }

      // Check if already enrolled
      const existingProgress = userProgressData[userId].find(p => p.courseId === courseId);
      if (existingProgress) return true;

      // Create new progress entry
      const newProgress: UserProgress = {
        courseId,
        completedLessons: [],
        progress: 0,
        lastAccessed: new Date(),
        timeSpent: 0,
        quizScores: {},
        rewardsEarned: {
          enrollment: false,
          lessonCompletions: [],
          courseCompletion: false,
          certificate: false
        }
      };

      userProgressData[userId].push(newProgress);
      
      // Update course enrollment status
      course.enrolled = true;

      // Award enrollment reward
      await this.awardEnrollmentReward(userId, courseId, course.rewardPoints.enrollment);
      newProgress.rewardsEarned.enrollment = true;
      
      return true;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      return false;
    }
  }

  // Mark lesson as completed with reward
  async markLessonCompleted(userId: string, courseId: string, lessonId: string): Promise<boolean> {
    try {
      const userProgress = this.getUserProgressForCourse(userId, courseId);
      if (!userProgress) return false;

      const course = this.getCourseById(courseId);
      if (!course) return false;

      const lesson = course.lessons.find(l => l.id === lessonId);
      if (!lesson) return false;

      // Add lesson to completed if not already there
      if (!userProgress.completedLessons.includes(lessonId)) {
        userProgress.completedLessons.push(lessonId);
      }

      // Update progress percentage
      userProgress.progress = (userProgress.completedLessons.length / course.totalLessons) * 100;
      course.progress = userProgress.progress;
      course.completedLessons = userProgress.completedLessons.length;
      
      // Mark lesson as completed in course data
      lesson.completed = true;
      userProgress.lastAccessed = new Date();

      // Award lesson completion reward if not already earned
      if (!userProgress.rewardsEarned.lessonCompletions.includes(lessonId)) {
        await this.awardLessonCompletionReward(userId, courseId, lessonId, lesson.rewardPoints?.completion || 10);
        userProgress.rewardsEarned.lessonCompletions.push(lessonId);
      }

      // Check if course is completed (all lessons done)
      if (userProgress.progress === 100 && !userProgress.rewardsEarned.courseCompletion) {
        await this.awardCourseCompletionReward(userId, courseId, course.rewardPoints.completion);
        userProgress.rewardsEarned.courseCompletion = true;

        // Award certificate if applicable
        if (course.certificate && !userProgress.rewardsEarned.certificate) {
          await this.awardCertificateReward(userId, courseId, course.rewardPoints.certificate);
          userProgress.rewardsEarned.certificate = true;
        }
      }

      return true;
    } catch (error) {
      console.error('Error marking lesson completed:', error);
      return false;
    }
  }

  // Save quiz score with reward
  async saveQuizScore(userId: string, courseId: string, lessonId: string, score: number): Promise<boolean> {
    try {
      const userProgress = this.getUserProgressForCourse(userId, courseId);
      if (!userProgress) return false;

      const course = this.getCourseById(courseId);
      if (!course) return false;

      const lesson = course.lessons.find(l => l.id === lessonId);
      if (!lesson) return false;

      userProgress.quizScores[lessonId] = score;
      userProgress.lastAccessed = new Date();
      
      // If quiz passed (score >= 70), mark lesson as completed
      if (score >= 70) {
        await this.markLessonCompleted(userId, courseId, lessonId);

        // Award perfect score bonus if applicable
        if (score === 100 && lesson.rewardPoints?.bonus) {
          await this.awardPerfectScoreReward(userId, courseId, lessonId, lesson.rewardPoints.bonus);
        }
      }

      return true;
    } catch (error) {
      console.error('Error saving quiz score:', error);
      return false;
    }
  }

  // Reward functions
  private async awardEnrollmentReward(userId: string, courseId: string, points: number) {
    try {
      const course = this.getCourseById(courseId);
      await PlatformRewardIntegration.trackCourseEnrollment({
        userId,
        courseId,
        courseName: course?.title || '',
        difficulty: course?.level || 'Beginner'
      });

      await ActivityRewardService.logActivity({
        userId,
        actionType: "enroll_course",
        targetId: courseId,
        targetType: "course",
        value: points,
        metadata: {
          rewardType: "enrollment",
          courseName: course?.title,
          difficulty: course?.level,
          points
        }
      });

      console.log(`📚 Enrollment reward earned! +${points} points for enrolling in: ${course?.title}`);
    } catch (error) {
      console.error('Error awarding enrollment reward:', error);
    }
  }

  private async awardLessonCompletionReward(userId: string, courseId: string, lessonId: string, points: number) {
    try {
      const course = this.getCourseById(courseId);
      const lesson = course?.lessons.find(l => l.id === lessonId);
      
      await PlatformRewardIntegration.trackLessonProgress({
        userId,
        courseId,
        lessonId,
        lessonType: lesson?.type || 'text',
        timeSpent: lesson?.duration || 0,
        completed: true,
        pointsEarned: points
      });

      await ActivityRewardService.logActivity({
        userId,
        actionType: "complete_lesson",
        targetId: lessonId,
        targetType: "lesson",
        value: points,
        metadata: {
          rewardType: "lesson_completion",
          courseId,
          courseName: course?.title,
          lessonTitle: lesson?.title,
          lessonType: lesson?.type,
          points
        }
      });

      console.log(`📖 Lesson completion reward earned! +${points} points for completing: ${lesson?.title}`);
    } catch (error) {
      console.error('Error awarding lesson completion reward:', error);
    }
  }

  private async awardCourseCompletionReward(userId: string, courseId: string, points: number) {
    try {
      const course = this.getCourseById(courseId);
      
      await ActivityRewardService.logActivity({
        userId,
        actionType: "complete_course",
        targetId: courseId,
        targetType: "course",
        value: points,
        metadata: {
          rewardType: "course_completion",
          courseName: course?.title,
          difficulty: course?.level,
          points
        }
      });

      console.log(`🎓 Course completion reward earned! +${points} points for completing: ${course?.title}`);
    } catch (error) {
      console.error('Error awarding course completion reward:', error);
    }
  }

  private async awardCertificateReward(userId: string, courseId: string, points: number) {
    try {
      const course = this.getCourseById(courseId);
      
      await PlatformRewardIntegration.trackCertificateEarned({
        userId,
        courseId,
        courseName: course?.title || '',
        difficulty: course?.level || 'Beginner'
      });

      await ActivityRewardService.logActivity({
        userId,
        actionType: "achieve_milestone",
        targetId: courseId,
        targetType: "course_certificate",
        value: points,
        metadata: {
          rewardType: "certificate",
          milestone: "course_certificate",
          courseName: course?.title,
          difficulty: course?.level,
          points
        }
      });

      console.log(`🏆 Certificate reward earned! +${points} points for certificate: ${course?.title}`);
    } catch (error) {
      console.error('Error awarding certificate reward:', error);
    }
  }

  private async awardPerfectScoreReward(userId: string, courseId: string, lessonId: string, points: number) {
    try {
      const course = this.getCourseById(courseId);
      const lesson = course?.lessons.find(l => l.id === lessonId);
      
      await ActivityRewardService.logActivity({
        userId,
        actionType: "achieve_milestone",
        targetId: lessonId,
        targetType: "lesson_quiz",
        value: points,
        metadata: {
          rewardType: "perfect_score",
          milestone: "perfect_quiz_score",
          courseId,
          courseName: course?.title,
          lessonTitle: lesson?.title,
          points
        }
      });

      console.log(`⭐ Perfect score bonus earned! +${points} points for 100% on: ${lesson?.title}`);
    } catch (error) {
      console.error('Error awarding perfect score reward:', error);
    }
  }

  // Get user progress for all courses
  getUserProgress(userId: string): UserProgress[] {
    return userProgressData[userId] || [];
  }

  // Get user progress for specific course
  getUserProgressForCourse(userId: string, courseId: string): UserProgress | null {
    const userProgress = this.getUserProgress(userId);
    return userProgress.find(p => p.courseId === courseId) || null;
  }

  // Update time spent on course
  updateTimeSpent(userId: string, courseId: string, additionalMinutes: number): void {
    const userProgress = this.getUserProgressForCourse(userId, courseId);
    if (userProgress) {
      userProgress.timeSpent += additionalMinutes;
      userProgress.lastAccessed = new Date();
    }
  }

  // Get course completion statistics with rewards
  getCourseStats(userId: string): {
    totalCourses: number;
    enrolledCourses: number;
    completedCourses: number;
    totalTimeSpent: number;
    averageProgress: number;
    totalPointsEarned: number;
    certificatesEarned: number;
  } {
    const userProgress = this.getUserProgress(userId);
    const enrolledCourses = userProgress.length;
    const completedCourses = userProgress.filter(p => p.progress === 100).length;
    const totalTimeSpent = userProgress.reduce((total, p) => total + p.timeSpent, 0);
    const averageProgress = enrolledCourses > 0 
      ? userProgress.reduce((total, p) => total + p.progress, 0) / enrolledCourses 
      : 0;

    // Calculate total points earned
    let totalPointsEarned = 0;
    let certificatesEarned = 0;

    userProgress.forEach(progress => {
      const course = this.getCourseById(progress.courseId);
      if (course) {
        if (progress.rewardsEarned.enrollment) totalPointsEarned += course.rewardPoints.enrollment;
        if (progress.rewardsEarned.courseCompletion) totalPointsEarned += course.rewardPoints.completion;
        if (progress.rewardsEarned.certificate) {
          totalPointsEarned += course.rewardPoints.certificate;
          certificatesEarned++;
        }

        // Add lesson completion points
        progress.rewardsEarned.lessonCompletions.forEach(lessonId => {
          const lesson = course.lessons.find(l => l.id === lessonId);
          if (lesson?.rewardPoints?.completion) {
            totalPointsEarned += lesson.rewardPoints.completion;
          }
        });
      }
    });

    return {
      totalCourses: mockCourses.length,
      enrolledCourses,
      completedCourses,
      totalTimeSpent,
      averageProgress,
      totalPointsEarned,
      certificatesEarned
    };
  }

  // Search courses
  searchCourses(query: string): Course[] {
    const lowercaseQuery = query.toLowerCase();
    return mockCourses.filter(course => 
      course.title.toLowerCase().includes(lowercaseQuery) ||
      course.description.toLowerCase().includes(lowercaseQuery) ||
      course.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Get recommended courses based on user's current courses
  getRecommendedCourses(userId: string): Course[] {
    const userProgress = this.getUserProgress(userId);
    const enrolledCourseIds = userProgress.map(p => p.courseId);
    
    // Simple recommendation: suggest courses not enrolled in
    return mockCourses.filter(course => !enrolledCourseIds.includes(course.id));
  }

  // Get learning leaderboard for gamification
  getLearningLeaderboard(timeframe: 'week' | 'month' | 'all' = 'month'): Array<{
    userId: string;
    points: number;
    coursesCompleted: number;
    certificatesEarned: number;
  }> {
    const leaderboard: { [userId: string]: { points: number; coursesCompleted: number; certificatesEarned: number } } = {};

    Object.entries(userProgressData).forEach(([userId, progressArray]) => {
      const stats = this.getCourseStats(userId);
      leaderboard[userId] = {
        points: stats.totalPointsEarned,
        coursesCompleted: stats.completedCourses,
        certificatesEarned: stats.certificatesEarned
      };
    });

    return Object.entries(leaderboard)
      .map(([userId, stats]) => ({ userId, ...stats }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 10); // Top 10
  }
}

export const courseService = new CourseService();
