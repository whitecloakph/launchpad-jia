"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    localStorage.removeItem("activeOrg");
    localStorage.removeItem("orgList");
    window.location.href = "/";
  };

  clearLogSession = () => {
    localStorage.removeItem("activeOrg");
    localStorage.removeItem("orgList");
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">
              <i className="las la-exclamation-triangle"></i>
            </div>
            <h2>Something went wrong</h2>
            <p>
              We're sorry, but something unexpected happened. Please try again.
            </p>

            <div className="error-actions">
              <button onClick={this.handleRetry} className="retry-button">
                <i className="las la-redo"></i>
                Try Again
              </button>

              <button onClick={this.clearLogSession} className="home-button">
                <i className="las la-home"></i>
                Back to Homepage
              </button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <pre>{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre>{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}
          </div>

          <style jsx>{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                sans-serif;
            }

            .error-container {
              background: white;
              border-radius: 12px;
              padding: 3rem;
              text-align: center;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
              max-width: 500px;
              width: 90%;
            }

            .error-icon {
              font-size: 4rem;
              color: #e74c3c;
              margin-bottom: 1rem;
            }

            .error-container h2 {
              color: #2c3e50;
              margin-bottom: 1rem;
              font-size: 1.8rem;
            }

            .error-container p {
              color: #7f8c8d;
              margin-bottom: 2rem;
              line-height: 1.6;
            }

            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
              flex-wrap: wrap;
            }

            .retry-button,
            .home-button {
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 8px;
              font-size: 1rem;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }

            .retry-button {
              background: #3498db;
              color: white;
            }

            .retry-button:hover {
              background: #2980b9;
              transform: translateY(-2px);
            }

            .home-button {
              background: #ecf0f1;
              color: #2c3e50;
            }

            .home-button:hover {
              background: #bdc3c7;
              transform: translateY(-2px);
            }

            .error-details {
              margin-top: 2rem;
              text-align: left;
              background: #f8f9fa;
              border-radius: 8px;
              padding: 1rem;
            }

            .error-details summary {
              cursor: pointer;
              font-weight: 600;
              color: #2c3e50;
              margin-bottom: 1rem;
            }

            .error-details pre {
              background: #2c3e50;
              color: #ecf0f1;
              padding: 1rem;
              border-radius: 4px;
              overflow-x: auto;
              font-size: 0.875rem;
              line-height: 1.4;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
