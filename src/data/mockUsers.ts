import {
  UserProfile,
  MockUser,
  MarketplaceProfile,
  FreelanceProfile,
  CryptoProfile,
  Achievement,
  Badge,
} from "@/types/user";
import { Product } from "@/types/marketplace";

// Mock users replaced with empty stubs for real-time / API integration.
export const mockUsers: Record<string, MockUser> = {};

export const getRandomMockUser = (): MockUser | null => null;

export const getRandomMockUsers = (_count: number): MockUser[] => [];

export const searchMockUsers = (_query: string): MockUser[] => [];

// Individual exports maintained for compatibility; they are undefined until real data is provided.
export const sarah_tech: MockUser | undefined = undefined;
export const alex_dev: MockUser | undefined = undefined;
export const mike_crypto: MockUser | undefined = undefined;
export const emma_creates: MockUser | undefined = undefined;
