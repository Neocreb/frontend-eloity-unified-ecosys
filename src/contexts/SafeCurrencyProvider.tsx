import React, { Component, ReactNode } from "react";
import { CurrencyProvider } from "./CurrencyContext";

interface SafeCurrencyProviderState {
  hasError: boolean;
  error?: Error;
}

interface SafeCurrencyProviderProps {
  children: ReactNode;
  defaultCurrency?: string;
}

// Minimal fallback component when currency provider fails
class FallbackCurrencyProvider extends Component<{ children: ReactNode }> {
  render() {
    return <>{this.props.children}</>;
  }
}

class SafeCurrencyProvider extends Component<
  SafeCurrencyProviderProps,
  SafeCurrencyProviderState
> {
  constructor(props: SafeCurrencyProviderProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SafeCurrencyProviderState {
    console.error("CurrencyProvider Error caught:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("CurrencyProvider Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      console.warn(
        "Using fallback currency provider due to error:",
        this.state.error,
      );
      return (
        <FallbackCurrencyProvider>{this.props.children}</FallbackCurrencyProvider>
      );
    }

    try {
      return (
        <CurrencyProvider defaultCurrency={this.props.defaultCurrency}>
          {this.props.children}
        </CurrencyProvider>
      );
    } catch (error) {
      console.error("Error in CurrencyProvider render:", error);
      return (
        <FallbackCurrencyProvider>{this.props.children}</FallbackCurrencyProvider>
      );
    }
  }
}

export default SafeCurrencyProvider;
