import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SafeMapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is a map error
    if (error.message.includes('Cannot read properties of undefined (reading \'map\')')) {
      console.error('Map error caught by SafeMapErrorBoundary:', error);
      return { hasError: true, error };
    }
    // Let other errors bubble up
    return { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SafeMapErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">Loading data...</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components that might have map errors
export function withSafeMap<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function SafeMapWrappedComponent(props: P) {
    return (
      <SafeMapErrorBoundary fallback={fallback}>
        <Component {...props} />
      </SafeMapErrorBoundary>
    );
  };
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

