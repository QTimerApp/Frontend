"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { Info } from "@/components/icons";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <Info className="size-8 text-muted" />
              <span className="text-sm text-muted">Something went wrong</span>
              <button type="button"
                onClick={() => this.setState({ hasError: false })}
                className="text-xs text-accent hover:text-accent-light transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
