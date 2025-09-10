import React from 'react';

/**
 * Generic React error boundary to prevent a single panel (e.g. Terminal) from
 * crashing the entire renderer tree. Displays a minimal fallback UI and logs
 * the error to the console for diagnostics.
 */
export class ErrorBoundary extends React.Component<React.PropsWithChildren<{ fallback?: React.ReactNode }>, { hasError: boolean; info?: any }> {
  constructor(props: React.PropsWithChildren<{ fallback?: React.ReactNode }>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: any) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Caught error:', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="panel-error-fallback">
          <h3>Component crashed</h3>
          <p>Check console for details. Panel isolated by ErrorBoundary.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
