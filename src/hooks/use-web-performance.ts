import { useState, useEffect, useCallback } from 'react';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  entries?: PerformanceEntry[];
  id: string;
}

export interface PerformanceProfile {
  timestamp: number;
  duration: number;
  marks: { [key: string]: number };
  measures: { [key: string]: number };
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  energyImpact?: 'low' | 'medium' | 'high';
}

export function useWebPerformance() {
  const [vitals, setVitals] = useState<WebVitalsMetric[]>([]);
  const [profiles, setProfiles] = useState<PerformanceProfile[]>([]);
  const [isProfilerRunning, setIsProfilerRunning] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<PerformanceProfile | null>(null);

  // Initialize Web Vitals monitoring
  useEffect(() => {
    const handleMetric = (metric: any) => {
      setVitals(prev => {
        const existing = prev.findIndex(m => m.name === metric.name);
        const newMetric: WebVitalsMetric = {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          entries: metric.entries,
          id: metric.id
        };
        
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = newMetric;
          return updated;
        } else {
          return [...prev, newMetric];
        }
      });
    };

    // Monitor Core Web Vitals
    getCLS(handleMetric);
    getFID(handleMetric);
    getFCP(handleMetric);
    getLCP(handleMetric);
    getTTFB(handleMetric);

    return () => {
      // Cleanup observers if needed
    };
  }, []);

  // Start performance profiling session
  const startProfiler = useCallback(() => {
    if (isProfilerRunning) return;

    const startTime = performance.now();
    performance.mark('profiler_start');
    
    setIsProfilerRunning(true);
    setCurrentProfile({
      timestamp: Date.now(),
      duration: 0,
      marks: { profiler_start: startTime },
      measures: {}
    });
  }, [isProfilerRunning]);

  // Stop performance profiling session
  const stopProfiler = useCallback(() => {
    if (!isProfilerRunning || !currentProfile) return;

    const endTime = performance.now();
    performance.mark('profiler_end');
    performance.measure('profiler_session', 'profiler_start', 'profiler_end');

    // Get all performance marks and measures
    const marks: { [key: string]: number } = {};
    const measures: { [key: string]: number } = {};

    // Collect marks
    performance.getEntriesByType('mark').forEach(entry => {
      marks[entry.name] = entry.startTime;
    });

    // Collect measures
    performance.getEntriesByType('measure').forEach(entry => {
      measures[entry.name] = entry.duration;
    });

    // Get memory usage if available
    let memoryUsage;
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      memoryUsage = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }

    // Estimate energy impact based on duration and complexity
    const energyImpact = (() => {
      const duration = endTime - currentProfile.marks.profiler_start;
      if (duration < 100) return 'low';
      if (duration < 1000) return 'medium';
      return 'high';
    })();

    const finalProfile: PerformanceProfile = {
      ...currentProfile,
      duration: endTime - currentProfile.marks.profiler_start,
      marks,
      measures,
      memoryUsage,
      energyImpact
    };

    setProfiles(prev => [...prev, finalProfile]);
    setCurrentProfile(null);
    setIsProfilerRunning(false);

    // Clean up performance entries
    performance.clearMarks();
    performance.clearMeasures();
  }, [isProfilerRunning, currentProfile]);

  // Mark a performance point
  const markPerformance = useCallback((name: string) => {
    const time = performance.now();
    performance.mark(name);
    
    if (currentProfile) {
      setCurrentProfile(prev => prev ? {
        ...prev,
        marks: { ...prev.marks, [name]: time }
      } : null);
    }
    
    return time;
  }, [currentProfile]);

  // Measure performance between two marks
  const measurePerformance = useCallback((name: string, startMark: string, endMark?: string) => {
    try {
      if (endMark) {
        performance.measure(name, startMark, endMark);
      } else {
        performance.measure(name, startMark);
      }
      
      const measure = performance.getEntriesByName(name, 'measure')[0];
      if (measure && currentProfile) {
        setCurrentProfile(prev => prev ? {
          ...prev,
          measures: { ...prev.measures, [name]: measure.duration }
        } : null);
      }
      
      return measure?.duration || 0;
    } catch (error) {
      console.warn('Performance measurement failed:', error);
      return 0;
    }
  }, [currentProfile]);

  // Get current performance snapshot
  const getPerformanceSnapshot = useCallback(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    return {
      navigation: {
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
        load: navigation?.loadEventEnd - navigation?.loadEventStart,
        firstByte: navigation?.responseStart - navigation?.requestStart,
        domComplete: navigation?.domComplete - navigation?.fetchStart
      },
      paint: {
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
      },
      memory: 'memory' in performance ? (performance as any).memory : null,
      timestamp: Date.now()
    };
  }, []);

  // Clear all performance data
  const clearProfiles = useCallback(() => {
    setProfiles([]);
    setVitals([]);
    performance.clearMarks();
    performance.clearMeasures();
  }, []);

  // Get performance recommendations
  const getRecommendations = useCallback(() => {
    const recommendations: string[] = [];
    
    vitals.forEach(vital => {
      if (vital.rating === 'poor') {
        switch (vital.name) {
          case 'CLS':
            recommendations.push('Reduce layout shifts by setting image dimensions and avoiding dynamic content insertion');
            break;
          case 'FID':
            recommendations.push('Reduce JavaScript execution time and consider code splitting');
            break;
          case 'LCP':
            recommendations.push('Optimize largest contentful paint by improving server response times and optimizing resources');
            break;
          case 'FCP':
            recommendations.push('Improve first contentful paint by reducing render-blocking resources');
            break;
          case 'TTFB':
            recommendations.push('Improve time to first byte by optimizing server response times');
            break;
        }
      }
    });

    if (profiles.length > 0) {
      const avgDuration = profiles.reduce((sum, p) => sum + p.duration, 0) / profiles.length;
      if (avgDuration > 1000) {
        recommendations.push('Consider optimizing inference time - average duration is over 1 second');
      }
      
      const highMemoryProfiles = profiles.filter(p => 
        p.memoryUsage && p.memoryUsage.usedJSHeapSize > 50 * 1024 * 1024
      );
      if (highMemoryProfiles.length > profiles.length * 0.5) {
        recommendations.push('Memory usage is high - consider implementing model quantization or garbage collection');
      }
    }

    return recommendations;
  }, [vitals, profiles]);

  return {
    vitals,
    profiles,
    isProfilerRunning,
    currentProfile,
    startProfiler,
    stopProfiler,
    markPerformance,
    measurePerformance,
    getPerformanceSnapshot,
    clearProfiles,
    getRecommendations
  };
}