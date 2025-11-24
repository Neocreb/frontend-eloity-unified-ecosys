import React, { Component, ReactNode } from "react";

interface SafeI18nProviderState {
  hasError: boolean;
  error?: Error;
  I18nProvider?: any;
}

interface SafeI18nProviderProps {
  children: ReactNode;
}

// Minimal fallback component when i18n fails
class FallbackI18nProvider extends Component<{ children: ReactNode }> {
  render() {
    return <>{this.props.children}</>;
  }
}

class SafeI18nProvider extends Component<
  SafeI18nProviderProps,
  SafeI18nProviderState
> {
  constructor(props: SafeI18nProviderProps) {
    super(props);
    this.state = { hasError: false, I18nProvider: undefined };
    this.loadI18nProvider();
  }

  async loadI18nProvider() {
    try {
      if (!this.state.I18nProvider) {
        const module = await import("./I18nContext");
        this.setState({ I18nProvider: module.I18nProvider });
      }
    } catch (error) {
      console.error("Failed to load I18nProvider:", error);
      this.setState({ hasError: true, error: error as Error });
    }
  }

  static getDerivedStateFromError(error: Error): SafeI18nProviderState {
    console.error("I18nProvider Error caught:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("I18nProvider Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      console.warn(
        "Using fallback i18n provider due to error:",
        this.state.error,
      );
      return (
        <FallbackI18nProvider>{this.props.children}</FallbackI18nProvider>
      );
    }

    if (!this.state.I18nProvider) {
      return (
        <FallbackI18nProvider>{this.props.children}</FallbackI18nProvider>
      );
    }

    try {
      const I18nProvider = this.state.I18nProvider;
      return <I18nProvider>{this.props.children}</I18nProvider>;
    } catch (error) {
      console.error("Error in I18nProvider render:", error);
      return (
        <FallbackI18nProvider>{this.props.children}</FallbackI18nProvider>
      );
    }
  }
}

export default SafeI18nProvider;
