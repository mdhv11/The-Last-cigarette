/**
 * Enhanced API service with retry mechanisms and error handling
 */
import { parseApiError, retryOperation, isNetworkError, logError } from '../utils/errorHandling';
import { buildApiUrl, buildAuthHeaders, REQUEST_TIMEOUT } from '../config/api';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  token?: string;
  timeout?: number;
  retries?: number;
  skipRetryOnClientError?: boolean;
}

/**
 * Make an API request with automatic retry and error handling
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> => {
  const {
    method = 'GET',
    body,
    token,
    timeout = REQUEST_TIMEOUT,
    retries = 3,
    skipRetryOnClientError = true,
  } = options;

  const makeRequest = async (): Promise<T> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(buildApiUrl(endpoint), {
        method,
        headers: buildAuthHeaders(token),
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || 'Request failed');
        (error as any).response = { status: response.status, data };
        throw error;
      }

      return data as T;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        const timeoutError = new Error('Request timeout');
        (timeoutError as any).message = 'timeout';
        throw timeoutError;
      }

      throw error;
    }
  };

  try {
    return await retryOperation(makeRequest, retries);
  } catch (error) {
    const parsedError = parseApiError(error);
    logError(error, endpoint);
    throw parsedError;
  }
};

/**
 * GET request helper
 */
export const apiGet = <T = any>(
  endpoint: string,
  token?: string,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<T> => {
  return apiRequest<T>(endpoint, { ...options, method: 'GET', token });
};

/**
 * POST request helper
 */
export const apiPost = <T = any>(
  endpoint: string,
  body: any,
  token?: string,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<T> => {
  return apiRequest<T>(endpoint, { ...options, method: 'POST', body, token });
};

/**
 * PUT request helper
 */
export const apiPut = <T = any>(
  endpoint: string,
  body: any,
  token?: string,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<T> => {
  return apiRequest<T>(endpoint, { ...options, method: 'PUT', body, token });
};

/**
 * DELETE request helper
 */
export const apiDelete = <T = any>(
  endpoint: string,
  token?: string,
  options?: Omit<ApiRequestOptions, 'method' | 'body'>
): Promise<T> => {
  return apiRequest<T>(endpoint, { ...options, method: 'DELETE', token });
};
