import { useCallback } from "react";

interface ErrorHandlerOptions {
  onError?: (error: Error, errorInfo?: any) => void;
  fallbackMessage?: string;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const handleError = useCallback(
    (error: Error, errorInfo?: any) => {
      // Log error in development
      if (process.env.NODE_ENV === "development") {
        console.error("Error caught by useErrorHandler:", error, errorInfo);
      }

      // Call custom error handler if provided
      if (options.onError) {
        options.onError(error, errorInfo);
      }

      // You can add additional error reporting logic here
      // Example: send to error reporting service
    },
    [options.onError]
  );

  const wrapAsync = useCallback(
    <T extends any[], R>(asyncFn: (...args: T) => Promise<R>) => {
      return async (...args: T): Promise<R> => {
        try {
          return await asyncFn(...args);
        } catch (error) {
          handleError(error as Error);
          throw error; // Re-throw to allow calling code to handle if needed
        }
      };
    },
    [handleError]
  );

  return {
    handleError,
    wrapAsync,
  };
};

export default useErrorHandler;
