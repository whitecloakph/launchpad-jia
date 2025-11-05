"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    if (process.env.NODE_ENV === "development") {
      console.error("PageErrorBoundary caught an error:", error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({ error });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI for pages
      return (
        <div className="page-error">
          <div className="page-error-content">
            <div className="page-error-icon">
              <i className="las la-exclamation-circle"></i>
            </div>
            <h3>Page Error</h3>
            <p>
              This page encountered an error. Please try refreshing or
              navigating back.
            </p>

            <div className="page-error-actions">
              <button onClick={this.handleRetry} className="page-retry-btn">
                <i className="las la-redo"></i>
                Retry
              </button>
            </div>
          </div>

          <style jsx>{`
            .page-error {
              padding: 2rem;
              text-align: center;
              background: #f8f9fa;
              border-radius: 8px;
              margin: 1rem;
            }

            .page-error-content {
              max-width: 400px;
              margin: 0 auto;
            }

            .page-error-icon {
              font-size: 3rem;
              color: #f39c12;
              margin-bottom: 1rem;
            }

            .page-error h3 {
              color: #2c3e50;
              margin-bottom: 0.5rem;
              font-size: 1.4rem;
            }

            .page-error p {
              color: #7f8c8d;
              margin-bottom: 1.5rem;
              line-height: 1.5;
            }

            .page-error-actions {
              display: flex;
              justify-content: center;
            }

            .page-retry-btn {
              padding: 0.5rem 1rem;
              background: #3498db;
              color: white;
              border: none;
              border-radius: 6px;
              font-size: 0.9rem;
              cursor: pointer;
              transition: background 0.2s ease;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }

            .page-retry-btn:hover {
              background: #2980b9;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PageErrorBoundary;
