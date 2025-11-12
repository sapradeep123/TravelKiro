import { AxiosError } from 'axios';

export interface NetworkErrorInfo {
  message: string;
  statusCode?: number;
  isNetworkError: boolean;
  isServerError: boolean;
  isClientError: boolean;
  isAuthError: boolean;
  canRetry: boolean;
  originalError: any;
}

/**
 * Parse and categorize network errors
 */
export function parseNetworkError(error: any): NetworkErrorInfo {
  const axiosError = error as AxiosError;

  // Default error info
  const errorInfo: NetworkErrorInfo = {
    message: 'An unexpected error occurred',
    isNetworkError: false,
    isServerError: false,
    isClientError: false,
    isAuthError: false,
    canRetry: false,
    originalError: error,
  };

  // No response - network error
  if (!axiosError.response) {
    errorInfo.isNetworkError = true;
    errorInfo.canRetry = true;
    errorInfo.message = axiosError.message || 'Network error. Please check your connection.';
    return errorInfo;
  }

  // Has response - HTTP error
  const { status, data } = axiosError.response;
  errorInfo.statusCode = status;

  // Extract error message from response
  if (data && typeof data === 'object') {
    errorInfo.message = (data as any).message || (data as any).error || errorInfo.message;
  }

  // Categorize by status code
  if (status >= 500) {
    // Server errors (5xx)
    errorInfo.isServerError = true;
    errorInfo.canRetry = true;
    errorInfo.message = 'Server error. Please try again later.';
  } else if (status >= 400) {
    // Client errors (4xx)
    errorInfo.isClientError = true;

    if (status === 401) {
      errorInfo.isAuthError = true;
      errorInfo.message = 'Authentication required. Please log in.';
    } else if (status === 403) {
      errorInfo.message = 'You do not have permission to perform this action.';
    } else if (status === 404) {
      errorInfo.message = 'The requested resource was not found.';
    } else if (status === 409) {
      errorInfo.message = data && (data as any).message ? (data as any).message : 'Conflict error.';
    } else if (status === 422) {
      errorInfo.message = data && (data as any).message ? (data as any).message : 'Validation error.';
    } else if (status === 429) {
      errorInfo.canRetry = true;
      errorInfo.message = 'Too many requests. Please try again later.';
    }
  }

  return errorInfo;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: any): string {
  const errorInfo = parseNetworkError(error);
  return errorInfo.message;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  const errorInfo = parseNetworkError(error);
  return errorInfo.canRetry;
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if error is not retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Execute function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 2, initialDelay = 1000, onRetry } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Call retry callback
      if (onRetry) {
        onRetry(attempt + 1, error);
      }

      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
