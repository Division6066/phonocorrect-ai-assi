import { useEffect, useRef, useCallback } from 'react';
import PerformanceProfiler from '../performance/PerformanceProfiler';

export interface PerformanceMetrics {
  appStartTime?: number;
  keyboardReadyTime?: number;
  totalStartupTime?: number;
}

export interface PerformanceHookReturn {
  profiler: typeof PerformanceProfiler;
  mark: (name: string) => void;
  measure: (name: string, startMark: string, endMark?: string) => number | null;
  getMetrics: () => PerformanceMetrics;
  exportData: () => Promise<any>;
  validateThresholds: () => { passed: boolean; violations: string[] };
}

/**
 * React hook for performance profiling in mobile app
 * 
 * Provides convenient access to performance marking and measurement
 * while maintaining React lifecycle compatibility
 */
export function usePerformanceProfiling(): PerformanceHookReturn {
  const isProfilingEnabled = useRef(__DEV__ || process.env.NODE_ENV === 'profiling');

  const mark = useCallback((name: string) => {
    if (isProfilingEnabled.current) {
      PerformanceProfiler.mark(name);
    }
  }, []);

  const measure = useCallback((name: string, startMark: string, endMark?: string) => {
    if (isProfilingEnabled.current) {
      return PerformanceProfiler.measure(name, startMark, endMark);
    }
    return null;
  }, []);

  const getMetrics = useCallback((): PerformanceMetrics => {
    if (isProfilingEnabled.current) {
      return PerformanceProfiler.getCriticalMetrics();
    }
    return {};
  }, []);

  const exportData = useCallback(async () => {
    if (isProfilingEnabled.current) {
      return await PerformanceProfiler.exportPerformanceData();
    }
    return null;
  }, []);

  const validateThresholds = useCallback(() => {
    if (isProfilingEnabled.current) {
      return PerformanceProfiler.validatePerformanceThresholds();
    }
    return { passed: true, violations: [] };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isProfilingEnabled.current) {
        // Save performance report when component unmounts
        PerformanceProfiler.savePerformanceReport().catch(console.warn);
      }
    };
  }, []);

  return {
    profiler: PerformanceProfiler,
    mark,
    measure,
    getMetrics,
    exportData,
    validateThresholds
  };
}

/**
 * Hook for component-level performance tracking
 * Automatically tracks component mount/unmount times
 */
export function useComponentPerformance(componentName: string) {
  const { mark, measure } = usePerformanceProfiling();
  const mountTime = useRef<number>();

  useEffect(() => {
    const mountMark = `${componentName}_mount`;
    mark(mountMark);
    mountTime.current = Date.now();

    return () => {
      const unmountMark = `${componentName}_unmount`;
      mark(unmountMark);
      
      if (mountTime.current) {
        const renderTime = measure(`${componentName}_lifecycle`, mountMark, unmountMark);
        console.log(`📊 ${componentName} lifecycle: ${renderTime?.toFixed(2)}ms`);
      }
    };
  }, [componentName, mark, measure]);
}

/**
 * Hook for tracking user interaction performance
 */
export function useInteractionPerformance() {
  const { mark, measure } = usePerformanceProfiling();

  const trackInteraction = useCallback((interactionName: string, startCallback?: () => void, endCallback?: () => void) => {
    const startMark = `interaction_${interactionName}_start`;
    const endMark = `interaction_${interactionName}_end`;

    // Mark start of interaction
    mark(startMark);
    if (startCallback) startCallback();

    // Return function to mark end of interaction
    return () => {
      mark(endMark);
      if (endCallback) endCallback();
      
      const duration = measure(`interaction_${interactionName}`, startMark, endMark);
      console.log(`👆 Interaction ${interactionName}: ${duration?.toFixed(2)}ms`);
      
      return duration;
    };
  }, [mark, measure]);

  return { trackInteraction };
}