import { useState, useCallback } from 'react';
import { parseApiError, isNetworkError, isAuthError, AppError } from '../utils/errorHandling';

export interface UseApiErrorReturn {
  error: AppError | null;
  setError: (error: any) => void;
  clearError: () => void;
  isNetworkError: boolean;
  isAuthError: boolean;
  errorMessage: string | null;
}

/**
 * Hook for managing API errors with automatic parsing and categorization
 */
export const useApiError = (): UseApiErrorReturn => {
  const [error, setErrorState] = useState<AppError | null>(null);

  const setError = useCallback((err: any) => {
    if (err) {
      const parsedError = parseApiError(err);
      setErrorState(parsedError);
    } else {
      setErrorState(null);
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  return {
    error,
    setError,
    clearError,
    isNetworkError: error ? isNetworkError(error) : false,
    isAuthError: error ? isAuthError(error) : false,
    errorMessage: error?.message || null,
  };
};
