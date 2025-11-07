// @ts-nocheck
import {
  ChatType,
  StartChatRequest,
  ChatThread,
  ChatContextData,
} from "@/types/chat";
import { chatService } from "@/services/chatService";
import { generateThreadId, getContextualGreeting } from "./chatHelpers";

export const startChat = async (
  type: ChatType,
  referenceId: string | null,
  participants: string[],
  contextData?: ChatContextData,
  initialMessage?: string,
): Promise<ChatThread> => {
  const request: StartChatRequest = {
    type,
    referenceId: referenceId || undefined,
    participants,
    contextData,
    initialMessage: initialMessage || getContextualGreeting(type, contextData),
  };

  return await chatService.createChatThread(request);
};

export const startFreelanceChat = async (
  jobId: string,
  clientId: string,
  freelancerId: string,
  jobTitle: string,
  jobBudget?: number,
  initialMessage?: string,
): Promise<ChatThread> => {
  const contextData: ChatContextData = {
    jobTitle,
    jobBudget,
    projectStatus: "negotiation",
  };

  return startChat(
    "freelance",
    jobId,
    [clientId, freelancerId],
    contextData,
    initialMessage,
  );
};

export const startMarketplaceChat = async (
  productId: string,
  buyerId: string,
  sellerId: string,
  productName: string,
  productPrice: number,
  productImage?: string,
  initialMessage?: string,
): Promise<ChatThread> => {
  const contextData: ChatContextData = {
    productName,
    productPrice,
    productImage,
  };

  return startChat(
    "marketplace",
    productId,
    [buyerId, sellerId],
    contextData,
    initialMessage,
  );
};

export const startP2PChat = async (
  tradeId: string,
  buyerId: string,
  sellerId: string,
  tradeAmount: number,
  cryptoType: string,
  initialMessage?: string,
): Promise<ChatThread> => {
  const contextData: ChatContextData = {
    tradeAmount,
    cryptoType,
    tradeStatus: "pending",
  };

  return startChat(
    "p2p",
    tradeId,
    [buyerId, sellerId],
    contextData,
    initialMessage,
  );
};

export const startSocialChat = async (
  userA: string,
  userB: string,
  relationshipType?: "friend" | "follower" | "family",
  initialMessage?: string,
): Promise<ChatThread> => {
  const contextData: ChatContextData = {
    relationshipType,
  };

  return startChat("social", null, [userA, userB], contextData, initialMessage);
};

export const startGroupChat = async (
  type: ChatType,
  groupName: string,
  participants: string[],
  referenceId?: string,
  contextData?: ChatContextData,
  initialMessage?: string,
): Promise<ChatThread> => {
  const request: StartChatRequest = {
    type,
    referenceId: referenceId || undefined,
    participants,
    groupName,
    contextData,
    initialMessage: initialMessage || `Welcome to ${groupName}!`,
  };

  return await chatService.createGroupChatThread(request);
};

export const findExistingChat = async (
  type: ChatType,
  referenceId: string | null,
  participants: string[],
): Promise<ChatThread | null> => {
  try {
    const threads = await chatService.getChatThreads();

    return (
      threads.find(
        (thread) =>
          thread.type === type &&
          thread.referenceId === referenceId &&
          thread.participants.length === participants.length &&
          participants.every((p) => thread.participants.includes(p)),
      ) || null
    );
  } catch (error) {
    console.error("Error finding existing chat:", error);
    return null;
  }
};

export const getOrCreateChat = async (
  type: ChatType,
  referenceId: string | null,
  participants: string[],
  contextData?: ChatContextData,
  initialMessage?: string,
): Promise<ChatThread> => {
  // First, try to find existing chat
  const existingChat = await findExistingChat(type, referenceId, participants);

  if (existingChat) {
    return existingChat;
  }

  // If no existing chat, create new one
  return startChat(
    type,
    referenceId,
    participants,
    contextData,
    initialMessage,
  );
};

// Utility functions for specific use cases
export const quickStartFreelanceChat = async (
  jobId: string,
  jobData: {
    title: string;
    budget?: number;
    clientId: string;
    freelancerId: string;
  },
): Promise<ChatThread> => {
  return startFreelanceChat(
    jobId,
    jobData.clientId,
    jobData.freelancerId,
    jobData.title,
    jobData.budget,
  );
};

export const quickStartMarketplaceChat = async (
  productId: string,
  productData: {
    name: string;
    price: number;
    sellerId: string;
    image?: string;
  },
  buyerId: string,
): Promise<ChatThread> => {
  return startMarketplaceChat(
    productId,
    buyerId,
    productData.sellerId,
    productData.name,
    productData.price,
    productData.image,
  );
};

export const quickStartP2PChat = async (
  tradeId: string,
  tradeData: { amount: number; cryptoType: string; sellerId: string },
  buyerId: string,
): Promise<ChatThread> => {
  return startP2PChat(
    tradeId,
    buyerId,
    tradeData.sellerId,
    tradeData.amount,
    tradeData.cryptoType,
  );
};
