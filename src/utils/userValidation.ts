// src/utils/userValidation.ts
import { User } from '@/types';

/**
 * Validates that the user object exists and has required properties
 * @param user The user object to validate
 * @returns True if user is valid, false otherwise
 */
export function isValidUser(user: User | null | undefined): user is User & { id: string } {
  return !!user && typeof user === 'object' && !!user.id;
}

/**
 * Validates user and throws an error if invalid
 * @param user The user object to validate
 * @param errorMessage Custom error message to throw
 * @throws Error if user is invalid
 */
export function validateUser(user: User | null | undefined, errorMessage = "User not authenticated"): asserts user is User & { id: string } {
  if (!isValidUser(user)) {
    throw new Error(errorMessage);
  }
}

/**
 * Validates user for storage operations
 * @param user The user object to validate
 * @returns True if user is valid for storage operations
 */
export function isValidForStorage(user: User | null | undefined): user is User & { id: string } {
  return isValidUser(user);
}

/**
 * Gets user ID safely
 * @param user The user object
 * @returns User ID or null if user is invalid
 */
export function getUserId(user: User | null | undefined): string | null {
  return isValidUser(user) ? user.id : null;
}