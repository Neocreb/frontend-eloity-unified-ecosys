import React, { Component, ReactNode, type ErrorInfo } from "react";
import { ThemeProvider } from "./ThemeContext";

// Fallback theme context that applies light theme without hooks
const FallbackThemeProvider = ({ children }: { children: ReactNode }) => {
  // Apply fallback theme to DOM immediately on render
  React.useLayoutEffect(() => {
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

class SafeThemeProvider extends Component<
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
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
