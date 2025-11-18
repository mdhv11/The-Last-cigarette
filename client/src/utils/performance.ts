/**
 * Performance monitoring utilities
 * Tracks app performance metrics and provides insights
 */

import React from 'react';

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 100; // Keep last 100 metrics

  /**
   * Start timing an operation
   */
  startTiming(name: string): () => void {
    const startTime = Date.now();

    return () => {
      const duration = Date.now() - startTime;
      this.recordMetric(name, duration);
    };
  }

  /**
   * Record a performance metric
   */
  private recordMetric(name: string, duration: number): void {
    this.metrics.push({
      name,
      duration,
      timestamp: Date.now(),
    });

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log slow operations (> 1 second)
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration}ms`);
    }
  }

  /**
   * Get average duration for a specific metric
   */
  getAverageDuration(name: string): number {
    const filtered = this.metrics.filter(m => m.name === name);
    if (filtered.length === 0) return 0;

    const sum = filtered.reduce((acc, m) => acc + m.duration, 0);
    return sum / filtered.length;
  }

  /**
   * Get all metrics for analysis
   */
  getAllMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, { count: number; avgDuration: number; maxDuration: number }> {
    const summary: Record<string, { count: number; avgDuration: number; maxDuration: number }> = {};

    this.metrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          avgDuration: 0,
          maxDuration: 0,
        };
      }

      summary[metric.name].count++;
      summary[metric.name].maxDuration = Math.max(
        summary[metric.name].maxDuration,
        metric.duration
      );
    });

    // Calculate averages
    Object.keys(summary).forEach(name => {
      const filtered = this.metrics.filter(m => m.name === name);
      const sum = filtered.reduce((acc, m) => acc + m.duration, 0);
      summary[name].avgDuration = sum / filtered.length;
    });

    return summary;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * HOC to measure component render time
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> {
  return (props: P) => {
    const endTiming = performanceMonitor.startTiming(`render:${componentName}`);

    React.useEffect(() => {
      endTiming();
    });

    return React.createElement(Component, props);
  };
}

/**
 * Hook to measure async operation performance
 */
export function usePerformanceTracking(operationName: string) {
  return React.useCallback(() => {
    return performanceMonitor.startTiming(operationName);
  }, [operationName]);
}
