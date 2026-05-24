import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('UI error boundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-fallback">
          <p className="eyebrow">Something softened unexpectedly</p>
          <h1>The page could not finish loading.</h1>
          <button type="button" className="primary-button" onClick={() => window.location.reload()}>
            Try again
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
