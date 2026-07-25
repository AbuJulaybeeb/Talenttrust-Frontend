'use client';

import React, { Component, ReactNode } from 'react';
import { reportError } from '@/lib/errorReporter';

export interface NavigationErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export interface NavigationErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * NavigationErrorBoundary — Error boundary specifically wrapping navigation elements.
 * Catches render errors, logs them via reportError seam, and displays an accessible
 * fallback UI with a retry mechanism.
 */
export default class NavigationErrorBoundary extends Component<
  NavigationErrorBoundaryProps,
  NavigationErrorBoundaryState
> {
  constructor(props: NavigationErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): NavigationErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    reportError(error, 'NavigationErrorBoundary', 'error', {
      componentStack: info.componentStack,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <nav
          aria-label="Primary navigation error"
          className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg bg-red-50 border border-red-200 text-red-700"
        >
          <span role="alert" className="font-medium">
            Navigation failed to load
          </span>
          <button
            type="button"
            onClick={this.handleReset}
            className="px-3 py-1 rounded-md text-xs font-medium bg-red-700 text-white hover:bg-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          >
            Retry
          </button>
        </nav>
      );
    }

    return this.props.children;
  }
}
