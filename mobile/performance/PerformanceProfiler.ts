/**
 * Performance profiler using @shopify/react-native-performance
 * Tracks app startup, keyboard readiness, and exports marks for CI profiling
 */

import { Performance } from '@shopify/react-native-performance';
import { EnergyProfiler } from 'react-native-energy';

export interface PerformanceMark {
  name: string;
  startTime: number;
  duration?: number;
  timestamp: number;
}

export interface EnergyReport {
  cpuUsage: number;
  memoryUsage: number;
  batteryLevel: number;
  networkUsage: number;
  duration: number;
  marks: PerformanceMark[];
}

class PerformanceProfiler {
  private marks: Map<string, PerformanceMark> = new Map();
  private isProfilingEnabled = __DEV__ || process.env.NODE_ENV === 'profiling';
  private energyProfiler: EnergyProfiler | null = null;

  constructor() {
    if (this.isProfilingEnabled) {
      this.initializeEnergyProfiling();
    }
  }

  private initializeEnergyProfiling() {
    try {
      this.energyProfiler = new EnergyProfiler();
      this.energyProfiler.startProfiling();
    } catch (error) {
      console.warn('Energy profiling not available:', error);
    }
  }

  /**
   * Mark a performance milestone
   */
  mark(name: string): void {
    if (!this.isProfilingEnabled) return;

    const startTime = Performance.now();
    const mark: PerformanceMark = {
      name,
      startTime,
      timestamp: Date.now(),
    };

    this.marks.set(name, mark);
    
    // Also use native performance API
    try {
      Performance.mark(name);
    } catch (error) {
      console.warn('Performance.mark failed:', error);
    }

    console.log(`🚀 Performance Mark: ${name} at ${startTime.toFixed(2)}ms`);
  }

  /**
   * Measure duration between two marks
   */
  measure(name: string, startMark: string, endMark?: string): number | null {
    if (!this.isProfilingEnabled) return null;

    const start = this.marks.get(startMark);
    if (!start) {
      console.warn(`Start mark "${startMark}" not found`);
      return null;
    }

    const endTime = endMark 
      ? this.marks.get(endMark)?.startTime ?? Performance.now()
      : Performance.now();

    const duration = endTime - start.startTime;

    // Update the mark with duration
    this.marks.set(startMark, { ...start, duration });

    try {
      Performance.measure(name, startMark, endMark);
    } catch (error) {
      console.warn('Performance.measure failed:', error);
    }

    console.log(`📊 Performance Measure: ${name} = ${duration.toFixed(2)}ms`);
    return duration;
  }

  /**
   * Get all performance marks as JSON
   */
  getMarks(): PerformanceMark[] {
    return Array.from(this.marks.values());
  }

  /**
   * Export performance data for CI artifacts
   */
  async exportPerformanceData(): Promise<{ marks: PerformanceMark[], energy?: EnergyReport }> {
    const marks = this.getMarks();
    
    let energyData: EnergyReport | undefined;
    if (this.energyProfiler) {
      try {
        const energyStats = await this.energyProfiler.getStats();
        energyData = {
          cpuUsage: energyStats.cpu,
          memoryUsage: energyStats.memory,
          batteryLevel: energyStats.battery,
          networkUsage: energyStats.network,
          duration: energyStats.duration,
          marks,
        };
      } catch (error) {
        console.warn('Failed to get energy stats:', error);
      }
    }

    return { marks, energy: energyData };
  }

  /**
   * Save performance data to filesystem for CI collection
   */
  async savePerformanceReport(): Promise<string | null> {
    if (!this.isProfilingEnabled) return null;

    try {
      const data = await this.exportPerformanceData();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `perf-marks-${timestamp}.json`;
      
      // In a real implementation, this would save to a file accessible by CI
      // For now, we'll log the data structure
      console.log('Performance Report Data:', JSON.stringify(data, null, 2));
      
      return filename;
    } catch (error) {
      console.error('Failed to save performance report:', error);
      return null;
    }
  }

  /**
   * Clear all performance data
   */
  clear(): void {
    this.marks.clear();
    
    try {
      Performance.clearMarks();
      Performance.clearMeasures();
    } catch (error) {
      console.warn('Failed to clear native performance data:', error);
    }
  }

  /**
   * Get critical performance metrics
   */
  getCriticalMetrics(): { appStartTime?: number; keyboardReadyTime?: number; totalStartupTime?: number } {
    const appStart = this.marks.get('app_start');
    const keyboardReady = this.marks.get('keyboard_ready');

    const metrics: any = {};

    if (appStart) {
      metrics.appStartTime = appStart.startTime;
    }

    if (keyboardReady) {
      metrics.keyboardReadyTime = keyboardReady.startTime;
      
      if (appStart) {
        metrics.totalStartupTime = keyboardReady.startTime - appStart.startTime;
      }
    }

    return metrics;
  }

  /**
   * Check if performance meets thresholds
   */
  validatePerformanceThresholds(): { passed: boolean; violations: string[] } {
    const metrics = this.getCriticalMetrics();
    const violations: string[] = [];

    // Performance thresholds (configurable)
    const thresholds = {
      totalStartupTime: 2000, // 2 seconds
      keyboardReadyTime: 1000, // 1 second from app start
    };

    if (metrics.totalStartupTime && metrics.totalStartupTime > thresholds.totalStartupTime) {
      violations.push(`Startup time ${metrics.totalStartupTime.toFixed(0)}ms exceeds ${thresholds.totalStartupTime}ms`);
    }

    if (metrics.keyboardReadyTime && metrics.keyboardReadyTime > thresholds.keyboardReadyTime) {
      violations.push(`Keyboard ready time ${metrics.keyboardReadyTime.toFixed(0)}ms exceeds ${thresholds.keyboardReadyTime}ms`);
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }
}

// Export singleton instance
export default new PerformanceProfiler();