// Fetch utilities with proper abort handling
export interface FetchOptions extends RequestInit {
  timeout?: number;
}

export class AbortError extends Error {
  constructor(message = "Request was aborted") {
    super(message);
    this.name = "AbortError";
  }
}

// Enhanced fetch wrapper with timeout and abort support
export async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {},
): Promise<Response> {
  const { timeout = 10000, ...fetchOptions } = options;

  // Create abort controller for this request
  const controller = new AbortController();

  // Handle existing signal
  if (fetchOptions.signal) {
    // If the provided signal is already aborted, abort immediately
    if (fetchOptions.signal.aborted) {
      throw new AbortError();
    }

    // Listen for abort on the provided signal
    fetchOptions.signal.addEventListener("abort", () => {
      controller.abort();
    });
  }

  // Set up timeout
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new AbortError("Request was aborted");
    }

    throw error;
  }
}

import React, { useRef, useEffect, useCallback } from "react";

// Hook for creating abort controller that cleans up on unmount
export function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Create controller on mount
    controllerRef.current = new AbortController();

    // Cleanup on unmount
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  const getSignal = useCallback(() => {
    return controllerRef.current?.signal;
  }, []);

  const abort = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = new AbortController();
    }
  }, []);

  return { getSignal, abort };
}

// Delay function with abort support
export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new AbortError());
      return;
    }

    const timeout = setTimeout(() => {
      resolve();
    }, ms);

    signal?.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new AbortError());
    });
  });
}

// Safe JSON parsing with error handling
export async function safeJsonParse<T>(response: Response): Promise<T> {
  try {
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${error}`);
  }
}

// Authentication-aware fetch wrapper
export async function fetchWithAuth(
  url: string,
  options: FetchOptions = {},
): Promise<Response> {
  // Get auth token from localStorage (with safe access)
  let token: string | null = null;
  try {
    token =
      typeof window !== "undefined" && window.localStorage
        ? localStorage.getItem("token")
        : null;
  } catch (error) {
    // Handle cases where localStorage is not available
    console.warn("localStorage not available:", error);
  }

  // Merge headers with auth token
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  return fetchWithTimeout(url, {
    ...options,
    headers,
  });
}
