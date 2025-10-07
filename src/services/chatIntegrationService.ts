// @ts-nocheck
import { chatService } from "./chatService";
import { UnifiedChatType, UnifiedChatContextData } from "@/types/unified-chat";

export interface ChatIntegrationOptions {
  userId: string;
  chatType: UnifiedChatType;
  referenceId?: string;
  contextData?: UnifiedChatContextData;
  initialMessage?: string;
  redirectToChat?: boolean;
}

export interface FreelanceProjectContext {
  jobId: string;
  jobTitle: string;
  jobBudget?: number;
  projectStatus?: "proposal" | "negotiation" | "active" | "completed";
  clientId: string;
  freelancerId: string;
}

export interface MarketplaceInquiryContext {
  productId: string;
  productName: string;
  productPrice: number;
  productImage?: string;
  sellerId: string;
  buyerId: string;
  inquiryType?: "availability" | "pricing" | "shipping" | "general";
}

export interface CryptoTradeContext {
  tradeId: string;
  tradeAmount: number;
  cryptoType: string;
  tradeType: "buy" | "sell";
  fiatCurrency: string;
  fiatAmount: number;
  traderId: string;
  counterpartyId: string;
  tradeStatus?:
    | "initiated"
    | "payment_pending"
    | "escrow"
    | "completed"
    | "disputed";
}

export interface SocialInteractionContext {
  postId?: string;
  eventId?: string;
  groupId?: string;
  interactionType?:
    | "comment_reply"
    | "post_mention"
    | "event_discussion"
    | "group_chat";
}

class ChatIntegrationService {
  /**
   * Start a freelance project chat
   */
  async startFreelanceChat(
    context: FreelanceProjectContext,
    initialMessage?: string,
  ): Promise<string> {
    const otherUserId =
      context.clientId === this.getCurrentUserId()
        ? context.freelancerId
        : context.clientId;

    const chatContextData: UnifiedChatContextData = {
      jobTitle: context.jobTitle,
      jobBudget: context.jobBudget,
      projectStatus: context.projectStatus || "proposal",
      priority: context.projectStatus === "active" ? "high" : "medium",
      tags: ["freelance", "project"],
      customData: {
        jobId: context.jobId,
        clientId: context.clientId,
        freelancerId: context.freelancerId,
      },
    };

    const thread = await chatService.createChatThread({
      type: "freelance",
      referenceId: context.jobId,
      participants: [this.getCurrentUserId(), otherUserId],
      initialMessage:
        initialMessage ||
        `Hi! I'm interested in discussing the project: ${context.jobTitle}`,
      contextData: chatContextData,
    });

    return thread.id;
  }

  /**
   * Start a marketplace inquiry chat
   */
  async startMarketplaceChat(
    context: MarketplaceInquiryContext,
    initialMessage?: string,
  ): Promise<string> {
    const otherUserId =
      context.sellerId === this.getCurrentUserId()
        ? context.buyerId
        : context.sellerId;

    const chatContextData: UnifiedChatContextData = {
      productName: context.productName,
      productPrice: context.productPrice,
      productImage: context.productImage,
      priority: "medium",
      tags: ["marketplace", "product-inquiry"],
      customData: {
        productId: context.productId,
        sellerId: context.sellerId,
        buyerId: context.buyerId,
        inquiryType: context.inquiryType || "general",
      },
    };

    const defaultMessage =
      context.inquiryType === "availability"
        ? `Hi! Is "${context.productName}" still available?`
        : context.inquiryType === "pricing"
          ? `Hi! I'm interested in "${context.productName}". Is the price negotiable?`
          : `Hi! I'm interested in your product: ${context.productName}`;

    const thread = await chatService.createChatThread({
      type: "marketplace",
      referenceId: context.productId,
      participants: [this.getCurrentUserId(), otherUserId],
      initialMessage: initialMessage || defaultMessage,
      contextData: chatContextData,
    });

    return thread.id;
  }

  /**
   * Start a crypto P2P trade chat
   */
  async startCryptoP2PChat(
    context: CryptoTradeContext,
    initialMessage?: string,
  ): Promise<string> {
    const otherUserId =
      context.traderId === this.getCurrentUserId()
        ? context.counterpartyId
        : context.traderId;

    const chatContextData: UnifiedChatContextData = {
      tradeAmount: context.tradeAmount,
      cryptoType: context.cryptoType,
      tradeStatus: context.tradeStatus || "initiated",
      priority: "high", // Crypto trades are usually urgent
      tags: ["crypto", "p2p", "trade"],
      customData: {
        tradeId: context.tradeId,
        tradeType: context.tradeType,
        fiatCurrency: context.fiatCurrency,
        fiatAmount: context.fiatAmount,
        traderId: context.traderId,
        counterpartyId: context.counterpartyId,
      },
    };

    const defaultMessage =
      context.tradeType === "buy"
        ? `Hi! I'd like to buy ${context.tradeAmount} ${context.cryptoType} for ${context.fiatAmount} ${context.fiatCurrency}`
        : `Hi! I'm selling ${context.tradeAmount} ${context.cryptoType} for ${context.fiatAmount} ${context.fiatCurrency}`;

    const thread = await chatService.createChatThread({
      type: "p2p",
      referenceId: context.tradeId,
      participants: [this.getCurrentUserId(), otherUserId],
      initialMessage: initialMessage || defaultMessage,
      contextData: chatContextData,
    });

    return thread.id;
  }

  /**
   * Start a social chat
   */
  async startSocialChat(
    otherUserId: string,
    context?: SocialInteractionContext,
    initialMessage?: string,
  ): Promise<string> {
    const chatContextData: UnifiedChatContextData = {
      relationshipType: "friend", // Could be enhanced to detect actual relationship
      priority: "low",
      tags: ["social"],
      customData: context || {},
    };

    const thread = await chatService.createChatThread({
      type: "social",
      referenceId:
        context?.postId || context?.eventId || context?.groupId || null,
      participants: [this.getCurrentUserId(), otherUserId],
      initialMessage: initialMessage || "Hi! 👋",
      contextData: chatContextData,
    });

    return thread.id;
  }

  /**
   * Navigate to a specific chat thread
   */
  navigateToChat(threadId: string, chatType: UnifiedChatType) {
    // Update URL to include chat type for proper tab selection
    const url = `/chat?type=${chatType}&thread=${threadId}`;
    window.location.href = url;
  }

  /**
   * Quick chat actions for different contexts
   */
  async quickActions() {
    return {
      // Freelance quick actions
      contactFreelancer: async (
        freelancerId: string,
        jobId: string,
        jobTitle: string,
      ) => {
        const threadId = await this.startFreelanceChat({
          jobId,
          jobTitle,
          clientId: this.getCurrentUserId(),
          freelancerId,
        });
        this.navigateToChat(threadId, "freelance");
      },

      // Marketplace quick actions
      inquireAboutProduct: async (
        productId: string,
        productName: string,
        sellerId: string,
        productPrice: number,
      ) => {
        const threadId = await this.startMarketplaceChat({
          productId,
          productName,
          productPrice,
          sellerId,
          buyerId: this.getCurrentUserId(),
        });
        this.navigateToChat(threadId, "marketplace");
      },

      // Crypto P2P quick actions
      initiateTrade: async (
        tradeId: string,
        counterpartyId: string,
        tradeDetails: Partial<CryptoTradeContext>,
      ) => {
        const threadId = await this.startCryptoP2PChat({
          tradeId,
          counterpartyId,
          traderId: this.getCurrentUserId(),
          ...tradeDetails,
        } as CryptoTradeContext);
        this.navigateToChat(threadId, "p2p");
      },

      // Social quick actions
      sendMessage: async (
        userId: string,
        context?: SocialInteractionContext,
      ) => {
        const threadId = await this.startSocialChat(userId, context);
        this.navigateToChat(threadId, "social");
      },
    };
  }

  /**
   * Create chat from notification
   */
  async createChatFromNotification(notification: {
    type:
      | "freelance_application"
      | "marketplace_inquiry"
      | "trade_request"
      | "social_mention";
    fromUserId: string;
    referenceId?: string;
    metadata?: any;
  }) {
    const { type, fromUserId, referenceId, metadata } = notification;

    switch (type) {
      case "freelance_application":
        return await this.startFreelanceChat({
          jobId: referenceId!,
          jobTitle: metadata.jobTitle,
          jobBudget: metadata.jobBudget,
          clientId: this.getCurrentUserId(),
          freelancerId: fromUserId,
          projectStatus: "proposal",
        });

      case "marketplace_inquiry":
        return await this.startMarketplaceChat({
          productId: referenceId!,
          productName: metadata.productName,
          productPrice: metadata.productPrice,
          sellerId: this.getCurrentUserId(),
          buyerId: fromUserId,
          inquiryType: metadata.inquiryType,
        });

      case "trade_request":
        return await this.startCryptoP2PChat({
          tradeId: referenceId!,
          tradeAmount: metadata.amount,
          cryptoType: metadata.crypto,
          tradeType: metadata.tradeType,
          fiatCurrency: metadata.currency,
          fiatAmount: metadata.fiatAmount,
          traderId: fromUserId,
          counterpartyId: this.getCurrentUserId(),
        });

      case "social_mention":
        return await this.startSocialChat(fromUserId, {
          postId: referenceId,
          interactionType: "post_mention",
        });

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }
  }

  /**
   * Get existing chat thread for a specific context
   */
  async findExistingChat(
    type: UnifiedChatType,
    referenceId: string,
    otherUserId: string,
  ): Promise<string | null> {
    const threads = await chatService.getChatThreads({ type });

    const existingThread = threads.find(
      (thread) =>
        thread.referenceId === referenceId &&
        thread.participants.includes(this.getCurrentUserId()) &&
        thread.participants.includes(otherUserId),
    );

    return existingThread?.id || null;
  }

  /**
   * Bulk create chats for common scenarios
   */
  async bulkCreateChats(
    scenarios: Array<{
      type: UnifiedChatType;
      otherUserId: string;
      context: any;
      message?: string;
    }>,
  ) {
    const results = await Promise.allSettled(
      scenarios.map(async (scenario) => {
        switch (scenario.type) {
          case "freelance":
            return await this.startFreelanceChat(
              scenario.context,
              scenario.message,
            );
          case "marketplace":
            return await this.startMarketplaceChat(
              scenario.context,
              scenario.message,
            );
          case "p2p":
            return await this.startCryptoP2PChat(
              scenario.context,
              scenario.message,
            );
          case "social":
            return await this.startSocialChat(
              scenario.otherUserId,
              scenario.context,
              scenario.message,
            );
          default:
            throw new Error(`Unsupported chat type: ${scenario.type}`);
        }
      }),
    );

    return results.map((result, index) => ({
      scenario: scenarios[index],
      success: result.status === "fulfilled",
      threadId: result.status === "fulfilled" ? result.value : null,
      error: result.status === "rejected" ? result.reason : null,
    }));
  }

  private getCurrentUserId(): string {
    // This should be replaced with actual auth context
    return "user_1"; // Placeholder
  }
}

export const chatIntegrationService = new ChatIntegrationService();
