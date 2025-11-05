# Error Boundaries

This directory contains error boundary components and utilities for gracefully handling client-side errors in your Next.js application.

## Components

### 1. ErrorBoundary (`ErrorBoundary.tsx`)

The main error boundary component that wraps the entire application. It provides a full-screen error UI with retry and navigation options.

**Features:**

- Catches all client-side errors in the component tree
- Provides a beautiful, user-friendly error UI
- Includes retry functionality
- Shows detailed error information in development mode
- Supports custom fallback UI

**Usage:**

```tsx
import ErrorBoundary from '@/lib/components/ErrorBoundary';

// In your layout or app root
<ErrorBoundary>
  <YourApp />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={<CustomErrorComponent />}>
  <YourApp />
</ErrorBoundary>
```

### 2. PageErrorBoundary (`PageErrorBoundary.tsx`)

A lighter error boundary for individual pages or components. Provides a more compact error UI.

**Features:**

- Smaller, page-specific error UI
- Custom error handler support
- Retry functionality
- Ideal for wrapping specific sections

**Usage:**

```tsx
import PageErrorBoundary from "@/lib/components/PageErrorBoundary";

<PageErrorBoundary
  onError={(error, errorInfo) => {
    // Custom error handling
    console.log("Page error:", error);
  }}
>
  <YourPageComponent />
</PageErrorBoundary>;
```

## Hooks

### useErrorHandler

A custom hook for handling errors in functional components.

**Usage:**

```tsx
import { useErrorHandler } from "@/lib/hooks/useErrorHandler";

const MyComponent = () => {
  const { handleError, wrapAsync } = useErrorHandler({
    onError: (error) => {
      // Custom error handling
    },
  });

  const fetchData = wrapAsync(async () => {
    const response = await fetch("/api/data");
    return response.json();
  });

  const handleClick = async () => {
    try {
      const data = await fetchData();
      // Handle success
    } catch (error) {
      handleError(error as Error);
    }
  };

  return <button onClick={handleClick}>Fetch Data</button>;
};
```

## Best Practices

1. **Use ErrorBoundary at the app level**: Wrap your entire application with the main ErrorBoundary component.

2. **Use PageErrorBoundary for specific sections**: Wrap individual pages or components that might have specific error handling needs.

3. **Use useErrorHandler for async operations**: Wrap async functions with the useErrorHandler hook to catch and handle errors gracefully.

4. **Provide meaningful error messages**: Customize error messages to help users understand what went wrong.

5. **Log errors appropriately**: Use the built-in logging for development and integrate with error reporting services for production.

## Error Reporting Integration

To integrate with error reporting services (like Sentry, LogRocket, etc.), modify the error handlers:

```tsx
// In ErrorBoundary.tsx or useErrorHandler.ts
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error caught:', error, errorInfo);
  }

  // Send to error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }
}
```

## Customization

You can customize the error UI by:

1. **Providing a custom fallback component**:

```tsx
<ErrorBoundary fallback={<YourCustomErrorComponent />}>
  <App />
</ErrorBoundary>
```

2. **Styling the default error UI**: Modify the CSS in the component files to match your design system.

3. **Adding more actions**: Extend the error UI to include additional buttons or functionality.

## Notes

- Error boundaries only catch errors in the component tree below them
- They don't catch errors in event handlers, async code, or server-side rendering
- Use try-catch blocks for those scenarios
- Error boundaries work best when combined with proper error handling in async operations
