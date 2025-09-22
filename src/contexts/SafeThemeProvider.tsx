import * as React from "react";
import * as React from 'react';
import { ThemeProvider } from "./ThemeContext";

// Create a safe version of useLayoutEffect that works on both client and server
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

// Fallback theme context that applies light theme without hooks
const FallbackThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Apply fallback theme to DOM immediately on render
  if (useIsomorphicLayoutEffect) {
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
  } else {
    // Direct DOM manipulation if hooks are not available
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      try {
        const root = document.documentElement;
        root.classList.add("light");
        root.classList.remove("dark");
      } catch (error) {
        console.warn("Failed to apply fallback theme:", error);
      }
    }
  }

  return <>{children}</>;
};

interface SafeThemeProviderState {
  hasError: boolean;
  error?: Error;
}

interface SafeThemeProviderProps {
  children: React.ReactNode;
}

class SafeThemeProvider extends React.Component<
  SafeThemeProviderProps,
  SafeThemeProviderState
> {
  constructor(props: SafeThemeProviderProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SafeThemeProviderState {
    console.error("ThemeProvider Error caught:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
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
    // Safety check for React availability
    if (!React) {
      console.warn("React not available, using direct render");
      return <>{this.props.children}</>;
    }

    if (this.state.hasError) {
      console.warn(
        "Using fallback theme provider due to error:",
        this.state.error,
      );
      return (
        <FallbackThemeProvider>{this.props.children}</FallbackThemeProvider>
      );
    }

    try {
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
