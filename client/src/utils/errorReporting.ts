/**
 * Error reporting and crash tracking utilities
 * Provides centralized error handling and logging
 */

interface ErrorReport {
  message: string;
  stack?: string;
  timestamp: number;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class ErrorReporter {
  private errors: ErrorReport[] = [];
  private maxErrors = 50; // Keep last 50 errors

  /**
   * Report an error
   */
  reportError(
    error: Error,
    context?: Record<string, any>,
    severity: ErrorReport['severity'] = 'medium'
  ): void {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      context,
      severity,
    };

    this.errors.push(errorReport);

    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console based on severity
    if (severity === 'critical' || severity === 'high') {
      console.error('Error reported:', errorReport);
    } else {
      console.warn('Error reported:', errorReport);
    }

    // In production, you would send this to a service like Sentry
    // this.sendToErrorService(errorReport);
  }

  /**
   * Report a custom error message
   */
  reportMessage(
    message: string,
    context?: Record<string, any>,
    severity: ErrorReport['severity'] = 'low'
  ): void {
    const errorReport: ErrorReport = {
      message,
      timestamp: Date.now(),
      context,
      severity,
    };

    this.errors.push(errorReport);

    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    console.log('Message reported:', errorReport);
  }

  /**
   * Get all error reports
   */
  getAllErrors(): ErrorReport[] {
    return [...this.errors];
  }

  /**
   * Get errors by severity
   */
  getErrorsBySeverity(severity: ErrorReport['severity']): ErrorReport[] {
    return this.errors.filter(e => e.severity === severity);
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Get error summary
   */
  getSummary(): Record<string, number> {
    const summary: Record<string, number> = {
      total: this.errors.length,
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    this.errors.forEach(error => {
      summary[error.severity]++;
    });

    return summary;
  }

  /**
   * Send error to external service (placeholder)
   * In production, integrate with Sentry, Bugsnag, etc.
   */
  private sendToErrorService(errorReport: ErrorReport): void {
    // Placeholder for external error reporting service
    // Example: Sentry.captureException(errorReport);
  }
}

// Singleton instance
export const errorReporter = new ErrorReporter();

/**
 * Global error handler setup
 * Note: In React Native, global error handling is primarily done through ErrorBoundary components
 * This function sets up additional error tracking for development and debugging
 */
export function setupGlobalErrorHandler(): void {
  // In React Native, we rely on ErrorBoundary components for error handling
  // This is a placeholder for future integration with services like Sentry
  
  // Log that error reporting is initialized
  if (__DEV__) {
    console.log('Error reporting initialized');
  }
  
  // In production, you would initialize your error reporting service here:
  // Example: Sentry.init({ dsn: 'your-dsn' });
}

/**
 * Hook for error reporting in components
 */
export function useErrorReporter() {
  return {
    reportError: (error: Error, context?: Record<string, any>) => {
      errorReporter.reportError(error, context);
    },
    reportMessage: (message: string, context?: Record<string, any>) => {
      errorReporter.reportMessage(message, context);
    },
  };
}
