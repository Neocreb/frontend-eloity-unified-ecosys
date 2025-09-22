import * as React from "react";
import { useLayoutEffect, useEffect, ReactNode } from 'react';
import ThemeProvider from "./ThemeContext";

// Create a safe version of useLayoutEffect that works on both client and server
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Fallback theme context that applies light theme without hooks
const FallbackThemeProvider = ({ children }: { children: ReactNode }) => {
  // Apply fallback theme to DOM immediately on render
  useIsomorphicLayoutEffect(() => {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      try {
        const root = document.documentElement;
        root.classList.add("light");
        root.classList.remove("dark");
      } catch (error) {
        console.warn("Failed to apply fallback theme:", error);
      }
    }
  }, []);

  return <>{children}</>;
};

interface SafeThemeProviderState {
  hasError: boolean;
  error?: Error;
}

interface SafeThemeProviderProps {
  children: ReactNode;
}

class SafeThemeProvider extends (require('react').Component)<
  SafeThemeProviderProps,
  SafeThemeProviderState
> {
  constructor(props: SafeThemeProviderProps) {
    // @ts-ignore - we intentionally require React at runtime for safety
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SafeThemeProviderState {
    console.error("ThemeProvider Error caught:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ThemeProvider Error:", error, errorInfo);

    // Apply fallback light theme immediately
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      try {
        const root = document.documentElement;
        root.classList.add("light");
        root.classList.remove("dark");
      } catch (themeError) {
        console.warn(
          "Failed to apply fallback theme in error handler:",
          themeError,
        );
      }
    }
  }

  render() {
    // If something prevented React hooks from being available, fall back gracefully
    try {
      // @ts-ignore: we're returning the standard provider
      return <ThemeProvider>{this.props.children}</ThemeProvider>;
    } catch (error) {
      console.error("Error in ThemeProvider render:", error);
      return (
        <FallbackThemeProvider>{this.props.children}</FallbackThemeProvider>
      );
    }
  }
}

export default SafeThemeProvider;
