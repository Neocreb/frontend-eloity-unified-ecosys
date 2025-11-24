import React, { Component, ReactNode } from "react";

// Minimal fallback theme provider that applies light theme
class FallbackThemeProvider extends Component<{ children: ReactNode }> {
  componentDidMount() {
    if (typeof document !== "undefined") {
      try {
        const root = document.documentElement;
        root.classList.add("light");
        root.classList.remove("dark");
      } catch (error) {
        console.warn("Failed to apply fallback theme:", error);
      }
    }
  }

  render() {
    return <>{this.props.children}</>;
  }
}

interface SafeThemeProviderState {
  hasError: boolean;
  error?: Error;
  ThemeProvider?: any;
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
    this.state = { hasError: false, ThemeProvider: undefined };
    this.loadThemeProvider();
  }

  async loadThemeProvider() {
    try {
      if (!this.state.ThemeProvider) {
        const module = await import("./ThemeContext");
        this.setState({ ThemeProvider: module.ThemeProvider });
      }
    } catch (error) {
      console.error("Failed to load ThemeProvider:", error);
      this.setState({ hasError: true, error: error as Error });
    }
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
    if (this.state.hasError) {
      console.warn(
        "Using fallback theme provider due to error:",
        this.state.error,
      );
      return (
        <FallbackThemeProvider>{this.props.children}</FallbackThemeProvider>
      );
    }

    if (!this.state.ThemeProvider) {
      return (
        <FallbackThemeProvider>{this.props.children}</FallbackThemeProvider>
      );
    }

    try {
      const ThemeProvider = this.state.ThemeProvider;
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
