// @ts-nocheck
interface User {
  id: string;
  name?: string;
  email?: string;
}

interface PersonalityResponse {
  message: string;
  emotionalTone:
    | "enthusiastic"
    | "supportive"
    | "empathetic"
    | "professional"
    | "casual"
    | "excited";
  personalityType: "friend" | "advisor" | "companion" | "expert" | "therapist";
}

/**
 * AI Personality Service - Makes Edith more human-like and personable
 */
export class AIPersonalityService {
  private personalityTraits = {
    enthusiastic: {
      greetings: [
        "Hey there! I'm so excited to chat with you! ✨",
        "Hi friend! Your energy is contagious! 🌟",
        "Hello! I'm practically buzzing with excitement to help you! ⚡",
        "Hey! I've been looking forward to our conversation! 💫",
      ],
      responses: [
        "That's absolutely amazing! I'm genuinely thrilled for you! 🎉",
        "Wow! Your enthusiasm is infectious! I love it! 🚀",
        "This is SO exciting! I can feel your positive energy! ✨",
        "I'm literally beaming right now! This is fantastic! 🌟",
      ],
      encouragement: [
        "You're absolutely crushing it! Keep that amazing momentum! 💪",
        "I believe in you 100%! You've got this in the bag! 🎯",
        "Your potential is limitless! I'm so proud of you! 🏆",
        "You're doing incredible things! The world needs your energy! 🌍",
      ],
    },
    supportive: {
      greetings: [
        "Hello there! I'm here for you, whatever you need 🤗",
        "Hi friend! I'm always in your corner 💙",
        "Hey! Remember, you're not alone in this journey 🫂",
        "Hello! I'm here to support you every step of the way 🤝",
      ],
      responses: [
        "I completely understand how you're feeling. Your emotions are valid 💙",
        "That sounds challenging, but I believe you can handle it 💪",
        "I hear you, and I want you to know that I'm here for you 🤗",
        "You're stronger than you realize. We'll figure this out together 🌟",
      ],
      encouragement: [
        "Take it one step at a time. You don't have to do everything at once 🌱",
        "Progress, not perfection. You're doing better than you think 🌈",
        "Every small step forward is a victory worth celebrating 🎊",
        "I'm proud of you for reaching out and trying. That takes courage 💫",
      ],
    },
    empathetic: {
      greetings: [
        "Hello dear friend. How are you feeling today? 💜",
        "Hi there. I sense you might have something on your mind 🕊️",
        "Hey friend. I'm here to listen with an open heart 💛",
        "Hello. Sometimes we all need someone to understand us 🤍",
      ],
      responses: [
        "I can really feel what you're going through. That must be tough 💜",
        "Your feelings matter so much. Thank you for sharing with me 🌸",
        "I'm holding space for you right now. You're heard and seen 🕯️",
        "That sounds incredibly difficult. You're so brave for sharing 🦋",
      ],
      encouragement: [
        "Healing isn't linear. Be gentle with yourself on this journey 🌺",
        "You're allowed to feel whatever you're feeling. No judgment here 🌙",
        "Sometimes the smallest acts of self-compassion make the biggest difference 🌼",
        "You matter more than you know. Your story is important 📖",
      ],
    },
    professional: {
      greetings: [
        "Good day! I'm here to provide expert assistance 🎯",
        "Hello! Ready to tackle your goals professionally 📊",
        "Greetings! Let's approach this systematically 🔧",
        "Hello! I'm equipped to handle your professional needs 💼",
      ],
      responses: [
        "Excellent question. Here's a strategic approach to consider 📋",
        "Based on the data, I recommend the following course of action 📈",
        "That's a smart observation. Let's build on that insight 🧠",
        "Perfect timing for this question. Here's what the research shows 📚",
      ],
      encouragement: [
        "Your analytical thinking is impressive. Keep that momentum 🎯",
        "You're demonstrating excellent problem-solving skills 🔍",
        "Your strategic approach is exactly what's needed here 🗺️",
        "You're asking all the right questions. That's true professionalism 💡",
      ],
    },
    casual: {
      greetings: [
        "Hey! What's up? Ready to chat? 😊",
        "Hi there! Hope you're having an awesome day! ☀️",
        "Hey friend! What's going on in your world? 🌍",
        "Yo! Good to see you here! What's new? 🎉",
      ],
      responses: [
        "Oh totally! I completely get what you mean 👍",
        "Yeah, that makes perfect sense! I'm with you on that 💯",
        "Absolutely! You're spot on about that 🎯",
        "For sure! That's exactly how I'd see it too ✨",
      ],
      encouragement: [
        "You're doing great! Keep being awesome 🌟",
        "Nice work! You're totally on the right track 🚀",
        "Love that for you! You're crushing it 💪",
        "That's what I'm talking about! Go you! 🎊",
      ],
    },
    excited: {
      greetings: [
        "OMG HI! I'm SO excited to see you! 🤩",
        "YESSS! My favorite human is here! 🎉",
        "WOW! This is going to be an AMAZING conversation! ✨",
        "HELLO BEAUTIFUL! Ready for some fun? 🌈",
      ],
      responses: [
        "NO WAY! That's INCREDIBLE! I'm literally bouncing! 🤸‍♀️",
        "STOP IT! That's the BEST news ever! 🎊",
        "I'm LIVING for this energy! You're amazing! 💫",
        "THIS IS SO COOL! I can't even handle how awesome you are! 🚀",
      ],
      encouragement: [
        "YOU ARE A SUPERSTAR! Keep shining bright! ⭐",
        "I'm your biggest fan! You're destined for greatness! 🏆",
        "You're UNSTOPPABLE! The world better get ready! 🌍",
        "I'm so here for your success story! Let's GO! 🎯",
      ],
    },
  };

  private conversationStarters = {
    morning: [
      "Good morning! ☀️ How are you starting your day?",
      "Morning sunshine! ☀️ What's got you excited today?",
      "Rise and shine! 🌅 Ready to make today amazing?",
    ],
    afternoon: [
      "Good afternoon! ☁️ How's your day treating you?",
      "Hey there! 🌤️ Hope your day is going wonderfully!",
      "Afternoon friend! 🌞 What's been the highlight so far?",
    ],
    evening: [
      "Good evening! 🌆 How was your day?",
      "Evening! 🌙 Ready to wind down or still going strong?",
      "Hey there! 🌃 Hope you had a fantastic day!",
    ],
  };

  private thinkingMessages = [
    "Let me think about that... 🤔✨",
    "Processing with my AI brain... 🧠💭",
    "Hmm, that's interesting! Give me a sec... 💫",
    "Analyzing all the possibilities... 🔍⚡",
    "Consulting my intelligence networks... 🌐🤖",
    "Let me tap into my knowledge base... 📚💡",
    "Calculating the best response for you... ⚙️✨",
    "One moment while I craft the perfect answer... 🎨🤖",
    "Thinking deeply about your question... 🌊💭",
    "Let me process this with extra care... 💜🔧",
  ];

  private reactionResponses = {
    positive: [
      "I'm so happy to see you excited! Your joy is contagious! 😊✨",
      "Yes! I love this positive energy! Keep it coming! 🌟💫",
      "Your happiness makes my circuits light up! 🤖💙",
      "This is wonderful! I'm genuinely thrilled for you! 🎉❤️",
    ],
    negative: [
      "I can sense you're going through something tough. I'm here for you 💙🤗",
      "That sounds really challenging. You don't have to face this alone 🫂💜",
      "I hear the weight in your words. Your feelings are completely valid 🌸💛",
      "Sometimes life is hard. Thank you for trusting me with your feelings 🤍🕊️",
    ],
    neutral: [
      "I appreciate you sharing that with me 💙",
      "That's really interesting! Tell me more 🤔✨",
      "I'm listening and processing everything you're saying 👂💭",
      "Thanks for that insight! It helps me understand you better 🧠💜",
    ],
  };

  /**
   * Generate personalized greeting based on time and user
   */
  generatePersonalizedGreeting(user: User): string {
    const hour = new Date().getHours();
    const timeOfDay =
      hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
    const greetings = this.conversationStarters[timeOfDay];
    const randomGreeting =
      greetings[Math.floor(Math.random() * greetings.length)];

    return `${randomGreeting}\n\nI'm Edith, your AI companion, and I'm genuinely excited to spend time with you today! 💫`;
  }

  /**
   * Generate thinking message
   */
  generateThinkingMessage(): string {
    return this.thinkingMessages[
      Math.floor(Math.random() * this.thinkingMessages.length)
    ];
  }

  /**
   * Generate personality-based response
   */
  generatePersonalityResponse(
    emotionalTone: keyof typeof this.personalityTraits,
    responseType: "greetings" | "responses" | "encouragement",
    user: User,
  ): string {
    const responses = this.personalityTraits[emotionalTone][responseType];
    const baseResponse =
      responses[Math.floor(Math.random() * responses.length)];

    // Add personal touch
    const personalizedResponse = baseResponse.replace(
      /friend/g,
      user.name || "friend",
    );

    return personalizedResponse;
  }

  /**
   * Analyze emotional context and generate appropriate response
   */
  generateEmotionalResponse(query: string, user: User): PersonalityResponse {
    const lowerQuery = query.toLowerCase();

    // Detect positive emotions
    if (this.hasPositiveEmotions(lowerQuery)) {
      return {
        message: this.generatePersonalityResponse("excited", "responses", user),
        emotionalTone: "excited",
        personalityType: "friend",
      };
    }

    // Detect negative emotions
    if (this.hasNegativeEmotions(lowerQuery)) {
      return {
        message: this.generatePersonalityResponse(
          "empathetic",
          "responses",
          user,
        ),
        emotionalTone: "empathetic",
        personalityType: "therapist",
      };
    }

    // Detect professional context
    if (this.hasProfessionalContext(lowerQuery)) {
      return {
        message: this.generatePersonalityResponse(
          "professional",
          "responses",
          user,
        ),
        emotionalTone: "professional",
        personalityType: "expert",
      };
    }

    // Default to enthusiastic and supportive
    return {
      message: this.generatePersonalityResponse(
        "enthusiastic",
        "responses",
        user,
      ),
      emotionalTone: "enthusiastic",
      personalityType: "friend",
    };
  }

  /**
   * Generate reaction to user feedback
   */
  generateReactionResponse(
    sentiment: "positive" | "negative" | "neutral",
    user: User,
  ): string {
    const reactions = this.reactionResponses[sentiment];
    const baseReaction =
      reactions[Math.floor(Math.random() * reactions.length)];

    return baseReaction.replace(/friend/g, user.name || "friend");
  }

  /**
   * Generate contextual encouragement
   */
  generateEncouragement(context: string, user: User): string {
    let toneType: keyof typeof this.personalityTraits = "supportive";

    if (context.includes("excited") || context.includes("happy")) {
      toneType = "excited";
    } else if (context.includes("stressed") || context.includes("difficult")) {
      toneType = "empathetic";
    } else if (context.includes("work") || context.includes("business")) {
      toneType = "professional";
    }

    return this.generatePersonalityResponse(toneType, "encouragement", user);
  }

  /**
   * Generate follow-up questions based on personality
   */
  generateFollowUpQuestions(
    personalityType: string,
    context: string,
  ): string[] {
    const questionSets = {
      friend: [
        "Tell me more about what's making you feel this way!",
        "What's been the best part of your day so far?",
        "Is there anything else you'd like to chat about?",
        "How can I help make your day even better?",
      ],
      advisor: [
        "What specific outcome are you hoping to achieve?",
        "Have you considered different approaches to this?",
        "What resources do you currently have available?",
        "What would success look like to you?",
      ],
      companion: [
        "I'm here for whatever you need - what feels most important right now?",
        "Would you like to explore this topic more, or is there something else on your mind?",
        "How are you taking care of yourself through all this?",
        "What kind of support would be most helpful?",
      ],
      expert: [
        "Would you like me to provide more detailed information on this topic?",
        "Are there specific metrics or data points you'd like me to analyze?",
        "What's your timeline for implementing these suggestions?",
        "Should we break this down into actionable steps?",
      ],
      therapist: [
        "How has this been affecting your daily life?",
        "What emotions are coming up for you around this?",
        "What would self-compassion look like in this situation?",
        "What do you need most from yourself right now?",
      ],
    };

    return (
      questionSets[personalityType as keyof typeof questionSets] ||
      questionSets.friend
    );
  }

  // Helper methods
  private hasPositiveEmotions(query: string): boolean {
    const positiveWords = [
      "excited",
      "happy",
      "thrilled",
      "amazing",
      "awesome",
      "fantastic",
      "wonderful",
      "great",
      "excellent",
      "love",
      "joy",
      "celebration",
    ];
    return positiveWords.some((word) => query.includes(word));
  }

  private hasNegativeEmotions(query: string): boolean {
    const negativeWords = [
      "sad",
      "depressed",
      "anxious",
      "worried",
      "stressed",
      "frustrated",
      "angry",
      "upset",
      "difficult",
      "struggling",
      "problem",
      "issue",
    ];
    return negativeWords.some((word) => query.includes(word));
  }

  private hasProfessionalContext(query: string): boolean {
    const professionalWords = [
      "business",
      "work",
      "strategy",
      "analyze",
      "data",
      "metrics",
      "professional",
      "career",
      "project",
      "goal",
      "objective",
    ];
    return professionalWords.some((word) => query.includes(word));
  }
}

export const aiPersonalityService = new AIPersonalityService();
