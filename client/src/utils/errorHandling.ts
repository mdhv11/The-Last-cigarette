/**
 * Error handling utilities for consistent error management across the app
 */

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

/**
 * Parse API error responses into user-friendly messages
 */
export const parseApiError = (error: any): AppError => {
  // Network error
  if (error.message === 'Network request failed' || !navigator.onLine) {
    return {
      message: 'No internet connection. Please check your network and try again.',
      code: 'NETWORK_ERROR',
      statusCode: 0,
    };
  }

  // Timeout error
  if (error.message?.includes('timeout')) {
    return {
      message: 'Request timed out. Please try again.',
      code: 'TIMEOUT_ERROR',
      statusCode: 408,
    };
  }

  // API error response
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        return {
          message: data?.error || 'Invalid request. Please check your input.',
          code: 'BAD_REQUEST',
          statusCode: 400,
          details: data?.details,
        };
      case 401:
        return {
          message: 'Your session has expired. Please log in again.',
          code: 'UNAUTHORIZED',
          statusCode: 401,
        };
      case 403:
        return {
          message: 'You dont have permission to perform this action.',
          code: 'FORBIDDEN',
          statusCode: 403,
        };
      case 404:
        return {
          message: 'The requested resource was not found.',
          code: 'NOT_FOUND',
          statusCode: 404,
        };
      case 409:
        return {
          message: data?.error || 'This action conflicts with existing data.',
          code: 'CONFLICT',
          statusCode: 409,
        };
      case 429:
        return {
          message: 'Too many requests. Please wait a moment and try again.',
          code: 'RATE_LIMIT',
          statusCode: 429,
        };
      case 500:
      case 502:
      case 503:
        return {
          message: 'Server error. Please try again later.',
          code: 'SERVER_ERROR',
          statusCode: status,
        };
      default:
        return {
          message: data?.error || 'An unexpected error occurred.',
          code: 'UNKNOWN_ERROR',
          statusCode: status,
        };
    }
  }

  // Generic error
  return {
    message: error.message || 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR',
  };
};

/**
 * Retry a failed operation with exponential backoff
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
      const parsedError = parseApiError(error);
      if (
        parsedError.statusCode &&
        parsedError.statusCode >= 400 &&
        parsedError.statusCode < 500 &&
        parsedError.statusCode !== 408 &&
        parsedError.statusCode !== 429
      ) {
        throw error;
      }

      // Don't retry if this was the last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: any): boolean => {
  return (
    error.message === 'Network request failed' ||
    error.code === 'NETWORK_ERROR' ||
    !navigator.onLine
  );
};

/**
 * Check if error requires re-authentication
 */
export const isAuthError = (error: any): boolean => {
  const parsedError = parseApiError(error);
  return parsedError.statusCode === 401 || parsedError.code === 'UNAUTHORIZED';
};

/**
 * Format error message for display
 */
export const formatErrorMessage = (error: any): string => {
  const parsedError = parseApiError(error);
  return parsedError.message;
};

/**
 * Log error for debugging (can be extended to send to error reporting service)
 */
export const logError = (error: any, context?: string) => {
  const parsedError = parseApiError(error);
  
  console.error(`[Error${context ? ` - ${context}` : ''}]:`, {
    message: parsedError.message,
    code: parsedError.code,
    statusCode: parsedError.statusCode,
    details: parsedError.details,
    originalError: error,
  });

  // In production, send to error reporting service
  if (!__DEV__) {
    // TODO: Send to error reporting service (e.g., Sentry)
  }
};
