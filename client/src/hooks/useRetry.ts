import { useState, useCallback } from 'react';

export interface UseRetryOptions {
  maxRetries?: number;
  onRetry?: (attempt: number) => void;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export interface UseRetryReturn<T> {
  execute: () => Promise<T | undefined>;
  retry: () => Promise<T | undefined>;
  isRetrying: boolean;
  retryCount: number;
  canRetry: boolean;
  reset: () => void;
}

/**
 * Hook for handling retry logic with exponential backoff
 */
export const useRetry = <T = any>(
  operation: () => Promise<T>,
  options: UseRetryOptions = {}
): UseRetryReturn<T> => {
  const { maxRetries = 3, onRetry, onSuccess, onError } = options;

  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(async (): Promise<T | undefined> => {
    setIsRetrying(true);

    try {
      const result = await operation();
      setRetryCount(0);
      onSuccess?.();
      return result;
    } catch (error) {
      onError?.(error);
      throw error;
    } finally {
      setIsRetrying(false);
    }
  }, [operation, onSuccess, onError]);

  const retry = useCallback(async (): Promise<T | undefined> => {
    if (retryCount >= maxRetries) {
      return undefined;
    }

    setRetryCount((prev) => prev + 1);
    onRetry?.(retryCount + 1);

    return execute();
  }, [retryCount, maxRetries, execute, onRetry]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    execute,
    retry,
    isRetrying,
    retryCount,
    canRetry: retryCount < maxRetries,
    reset,
  };
};
