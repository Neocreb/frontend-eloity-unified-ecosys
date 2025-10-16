/**
 * Demo script showcasing Edith's enhanced capabilities
 * Run this in browser console: demoEdithCapabilities()
 */

import { realTimeAIService } from "@/services/realTimeAIService";

const mockUser = {
  id: "demo-user",
  name: "Alex",
  email: "alex@example.com",
};

export const demoEdithCapabilities = async () => {
  console.log("🤖 Edith AI Assistant - Enhanced Capabilities Demo\n");
  console.log("===============================================\n");

  const demoQueries = [
    // Real-time queries
    { query: "What time is it?", category: "⏰ Real-time Data" },
    { query: "Show me Bitcoin price", category: "💰 Crypto Information" },
    { query: "How's the weather?", category: "🌤️ Weather" },
    { query: "Calculate 25 * 47", category: "🧮 Calculations" },

    // Eloity platform queries
    { query: "How do I create a post?", category: "📱 Eloity Features" },
    {
      query: "Tell me about crypto trading",
      category: "💱 Platform Knowledge",
    },
    { query: "How can I earn money on Eloity?", category: "💸 Monetization" },
    { query: "What is the marketplace?", category: "🛒 Marketplace" },

    // Personal/friendly queries
    { query: "Hi Edith! How are you?", category: "👋 Friendly Greeting" },
    { query: "I'm feeling a bit sad today", category: "💙 Emotional Support" },
    { query: "Thanks for helping me!", category: "🙏 Gratitude" },
    { query: "You're awesome!", category: "😊 Compliment" },

    // Casual conversation
    { query: "What can you help me with?", category: "❓ General Help" },
    { query: "Tell me something interesting", category: "🌟 Casual Chat" },
  ];

  for (const demo of demoQueries) {
    console.log(`${demo.category}`);
    console.log(`User: "${demo.query}"`);

    try {
      const response = await realTimeAIService.generateRealTimeResponse(
        demo.query,
        mockUser,
      );
      console.log(`Edith: ${response.message.substring(0, 150)}...`);
      console.log(
        `Confidence: ${response.confidence}% | Sources: ${response.sources.join(", ")}`,
      );

      if (response.suggestedActions.length > 0) {
        console.log(
          `Suggested Actions: ${response.suggestedActions.map((a) => a.label).join(", ")}`,
        );
      }

      if (response.followUpQuestions.length > 0) {
        console.log(
          `Follow-up Questions: ${response.followUpQuestions.slice(0, 2).join(", ")}`,
        );
      }
    } catch (error) {
      console.error(`Error: ${error}`);
    }

    console.log("---\n");
  }

  console.log("✨ Demo Complete! Edith is now:");
  console.log("• 🧠 Knowledgeable about all Eloity features");
  console.log("• 🕐 Providing real-time information");
  console.log("• 💝 Emotionally supportive and friendly");
  console.log("• 💬 Great at casual conversation");
  console.log("• 🎯 Helpful with specific platform guidance");
  console.log("• 🤖 A true AI companion!");
};

// Sample conversation starters for users
export const conversationStarters = [
  // Platform help
  "How do I get started on Eloity?",
  "What's the best way to earn money here?",
  "Can you explain the crypto features?",
  "How does the marketplace work?",

  // Real-time info
  "What's the current Bitcoin price?",
  "What time is it right now?",
  "How's the weather today?",
  "Calculate my crypto gains",

  // Friendly chat
  "Hi Edith! How's your day?",
  "Tell me something fun!",
  "I need some motivation",
  "What makes you happy?",

  // Personal support
  "I'm new here, can you help?",
  "I'm feeling overwhelmed",
  "Thanks for being so helpful!",
  "You're like a real friend",
];

// Export for browser console
if (typeof window !== "undefined") {
  (window as any).demoEdithCapabilities = demoEdithCapabilities;
  (window as any).conversationStarters = conversationStarters;
  console.log("🎯 Try these commands in console:");
  console.log("• demoEdithCapabilities() - Run full demo");
  console.log("• conversationStarters - See example questions");
}
