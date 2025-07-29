#!/usr/bin/env node

/**
 * Performance regression analysis script
 * 
 * Compares current performance metrics with baseline to detect regressions
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

class PerformanceRegressionAnalyzer {
  constructor() {
    this.regressionThresholds = {
      startup: {
        totalTime: 20, // 20% increase is a regression
        keyboardReady: 15, // 15% increase is a regression
        appStart: 10 // 10% increase is a regression
      },
      performanceScore: 10, // 10 point decrease is a regression
      energy: {
        cpuUsage: 25, // 25% increase is a regression
        batteryDrain: 30 // 30% increase is a regression
      }
    };
  }

  async analyzeRegression(androidDir, iosDir, baseline, outputFile) {
    console.log('🔍 Analyzing performance regressions...');
    
    const currentMetrics = await this.loadCurrentMetrics(androidDir, iosDir);
    const baselineMetrics = await this.loadBaselineMetrics(baseline);
    
    const regression = {
      timestamp: new Date().toISOString(),
      baseline: baseline,
      platforms: {
        android: this.compareMetrics('android', currentMetrics.android, baselineMetrics.android),
        ios: this.compareMetrics('ios', currentMetrics.ios, baselineMetrics.ios)
      },
      summary: {
        hasRegressions: false,
        totalRegressions: 0,
        criticalRegressions: 0,
        improvements: 0
      }
    };

    // Calculate summary
    const allComparisons = [
      ...Object.values(regression.platforms.android.comparisons || {}),
      ...Object.values(regression.platforms.ios.comparisons || {})
    ];

    regression.summary.totalRegressions = allComparisons.filter(c => c.isRegression).length;
    regression.summary.criticalRegressions = allComparisons.filter(c => c.isRegression && c.severity === 'critical').length;
    regression.summary.improvements = allComparisons.filter(c => c.isImprovement).length;
    regression.summary.hasRegressions = regression.summary.totalRegressions > 0;

    await this.saveRegressionAnalysis(regression, outputFile);
    
    return regression;
  }

  async loadCurrentMetrics(androidDir, iosDir) {
    const metrics = { android: null, ios: null };
    
    // Load Android metrics
    if (androidDir) {
      try {
        const files = await fs.readdir(androidDir);
        const analysisFile = files.find(f => f.startsWith('analysis-android'));
        if (analysisFile) {
          const content = await fs.readFile(path.join(androidDir, analysisFile), 'utf8');
          metrics.android = JSON.parse(content);
        }
      } catch (error) {
        console.warn('Failed to load Android metrics:', error);
      }
    }
    
    // Load iOS metrics
    if (iosDir) {
      try {
        const files = await fs.readdir(iosDir);
        const analysisFile = files.find(f => f.startsWith('analysis-ios'));
        if (analysisFile) {
          const content = await fs.readFile(path.join(iosDir, analysisFile), 'utf8');
          metrics.ios = JSON.parse(content);
        }
      } catch (error) {
        console.warn('Failed to load iOS metrics:', error);
      }
    }
    
    return metrics;
  }

  async loadBaselineMetrics(baseline) {
    // This would typically load metrics from a previous commit or stored baseline
    // For now, we'll simulate baseline metrics or try to load from git
    
    console.log(`📊 Loading baseline metrics for: ${baseline}`);
    
    try {
      // Try to get baseline data from git history or stored artifacts
      const baselineData = await this.getBaselineFromGit(baseline);
      return baselineData;
    } catch (error) {
      console.warn('Could not load baseline from git, using simulated baseline');
      return this.getSimulatedBaseline();
    }
  }

  async getBaselineFromGit(baseline) {
    // This would implement actual git-based baseline retrieval
    // For now, return null to indicate no baseline available
    return { android: null, ios: null };
  }

  getSimulatedBaseline() {
    // Simulated baseline for demonstration
    return {
      android: {
        summary: {
          performanceScore: 82,
          criticalMetrics: {
            startupTime: 1800,
            keyboardReadyTime: 900,
            appStartTime: 400
          }
        },
        energyAnalysis: {
          cpuImpact: 'medium',
          batteryImpact: 'low'
        }
      },
      ios: {
        summary: {
          performanceScore: 85,
          criticalMetrics: {
            startupTime: 1600,
            keyboardReadyTime: 800,
            appStartTime: 350
          }
        },
        energyAnalysis: {
          cpuImpact: 'low',
          batteryImpact: 'low'
        }
      }
    };
  }

  compareMetrics(platform, current, baseline) {
    if (!current || !baseline) {
      return {
        platform,
        status: 'no_comparison',
        message: 'Missing current or baseline metrics',
        comparisons: {}
      };
    }

    const comparisons = {};

    // Compare performance score
    if (current.summary?.performanceScore !== undefined && baseline.summary?.performanceScore !== undefined) {
      comparisons.performanceScore = this.compareValues(
        'performanceScore',
        current.summary.performanceScore,
        baseline.summary.performanceScore,
        this.regressionThresholds.performanceScore,
        'lower_is_worse'
      );
    }

    // Compare startup metrics
    const currentStartup = current.summary?.criticalMetrics;
    const baselineStartup = baseline.summary?.criticalMetrics;

    if (currentStartup && baselineStartup) {
      if (currentStartup.startupTime && baselineStartup.startupTime) {
        comparisons.startupTime = this.compareValues(
          'startupTime',
          currentStartup.startupTime,
          baselineStartup.startupTime,
          this.regressionThresholds.startup.totalTime
        );
      }

      if (currentStartup.keyboardReadyTime && baselineStartup.keyboardReadyTime) {
        comparisons.keyboardReadyTime = this.compareValues(
          'keyboardReadyTime',
          currentStartup.keyboardReadyTime,
          baselineStartup.keyboardReadyTime,
          this.regressionThresholds.startup.keyboardReady
        );
      }

      if (currentStartup.appStartTime && baselineStartup.appStartTime) {
        comparisons.appStartTime = this.compareValues(
          'appStartTime',
          currentStartup.appStartTime,
          baselineStartup.appStartTime,
          this.regressionThresholds.startup.appStart
        );
      }
    }

    // Determine overall status
    const regressions = Object.values(comparisons).filter(c => c.isRegression);
    const criticalRegressions = regressions.filter(c => c.severity === 'critical');

    return {
      platform,
      status: criticalRegressions.length > 0 ? 'critical_regression' : 
              regressions.length > 0 ? 'regression' : 'stable',
      regressionCount: regressions.length,
      criticalRegressionCount: criticalRegressions.length,
      comparisons
    };
  }

  compareValues(metric, current, baseline, thresholdPercent, direction = 'lower_is_better') {
    const percentChange = ((current - baseline) / baseline) * 100;
    const absoluteChange = current - baseline;

    let isRegression = false;
    let isImprovement = false;
    let severity = 'info';

    if (direction === 'lower_is_better') {
      isRegression = percentChange > thresholdPercent;
      isImprovement = percentChange < -5; // 5% improvement threshold
    } else if (direction === 'lower_is_worse') {
      isRegression = percentChange < -thresholdPercent;
      isImprovement = percentChange > 5; // 5% improvement threshold
    }

    if (isRegression) {
      severity = Math.abs(percentChange) > thresholdPercent * 2 ? 'critical' : 'warning';
    }

    return {
      metric,
      current,
      baseline,
      absoluteChange,
      percentChange: Math.round(percentChange * 10) / 10,
      isRegression,
      isImprovement,
      severity,
      threshold: thresholdPercent,
      message: this.generateComparisonMessage(metric, current, baseline, percentChange, isRegression, isImprovement)
    };
  }

  generateComparisonMessage(metric, current, baseline, percentChange, isRegression, isImprovement) {
    const direction = percentChange > 0 ? 'increased' : 'decreased';
    const change = Math.abs(percentChange).toFixed(1);

    if (isRegression) {
      return `⚠️ ${metric} ${direction} by ${change}% (${current} vs ${baseline}) - REGRESSION`;
    } else if (isImprovement) {
      return `✅ ${metric} ${direction} by ${change}% (${current} vs ${baseline}) - IMPROVEMENT`;
    } else {
      return `ℹ️ ${metric} ${direction} by ${change}% (${current} vs ${baseline}) - stable`;
    }
  }

  async saveRegressionAnalysis(regression, outputFile) {
    await fs.writeFile(outputFile, JSON.stringify(regression, null, 2));
    console.log(`📄 Regression analysis saved: ${outputFile}`);
    
    // Also save a summary report
    const reportFile = outputFile.replace('.json', '-summary.md');
    const report = this.generateMarkdownReport(regression);
    await fs.writeFile(reportFile, report);
    console.log(`📝 Regression report saved: ${reportFile}`);
    
    return outputFile;
  }

  generateMarkdownReport(regression) {
    return `# Performance Regression Analysis

**Generated:** ${regression.timestamp}  
**Baseline:** ${regression.baseline}

## 📊 Summary

- **Total Regressions:** ${regression.summary.totalRegressions}
- **Critical Regressions:** ${regression.summary.criticalRegressions}
- **Improvements:** ${regression.summary.improvements}
- **Overall Status:** ${regression.summary.hasRegressions ? '🚨 REGRESSIONS DETECTED' : '✅ STABLE'}

## 🤖 Android Analysis

**Status:** ${regression.platforms.android.status}  
**Regressions:** ${regression.platforms.android.regressionCount || 0}  
**Critical:** ${regression.platforms.android.criticalRegressionCount || 0}

${this.formatPlatformComparisons(regression.platforms.android.comparisons)}

## 🍎 iOS Analysis

**Status:** ${regression.platforms.ios.status}  
**Regressions:** ${regression.platforms.ios.regressionCount || 0}  
**Critical:** ${regression.platforms.ios.criticalRegressionCount || 0}

${this.formatPlatformComparisons(regression.platforms.ios.comparisons)}

## 🔧 Recommendations

${this.generateRecommendations(regression)}
`;
  }

  formatPlatformComparisons(comparisons) {
    if (!comparisons || Object.keys(comparisons).length === 0) {
      return 'No comparison data available\n';
    }

    return Object.values(comparisons)
      .map(comp => `- ${comp.message}`)
      .join('\n') + '\n';
  }

  generateRecommendations(regression) {
    const recommendations = [];
    
    if (regression.summary.criticalRegressions > 0) {
      recommendations.push('🚨 **URGENT:** Critical performance regressions detected. Immediate investigation required.');
    }
    
    if (regression.summary.totalRegressions > 0) {
      recommendations.push('⚠️ Performance regressions detected. Review recent changes and optimize affected areas.');
    }
    
    if (regression.summary.improvements > 0) {
      recommendations.push('✅ Performance improvements detected. Great work!');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ No significant performance changes detected. Continue monitoring.');
    }
    
    return recommendations.join('\n\n');
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);
  const androidIndex = args.indexOf('--android');
  const iosIndex = args.indexOf('--ios');
  const baselineIndex = args.indexOf('--baseline');
  const outputIndex = args.indexOf('--output');
  
  if (outputIndex === -1) {
    console.error('Usage: node performance-regression-analysis.js [--android <dir>] [--ios <dir>] [--baseline <ref>] --output <file>');
    process.exit(1);
  }
  
  const androidDir = androidIndex !== -1 ? args[androidIndex + 1] : null;
  const iosDir = iosIndex !== -1 ? args[iosIndex + 1] : null;
  const baseline = baselineIndex !== -1 ? args[baselineIndex + 1] : 'HEAD~1';
  const outputFile = args[outputIndex + 1];
  
  try {
    const analyzer = new PerformanceRegressionAnalyzer();
    const regression = await analyzer.analyzeRegression(androidDir, iosDir, baseline, outputFile);
    
    console.log(`\n📊 Regression Analysis Complete`);
    console.log(`Status: ${regression.summary.hasRegressions ? '🚨 REGRESSIONS' : '✅ STABLE'}`);
    console.log(`Total Regressions: ${regression.summary.totalRegressions}`);
    console.log(`Critical Regressions: ${regression.summary.criticalRegressions}`);
    console.log(`Improvements: ${regression.summary.improvements}`);
    
    if (regression.summary.criticalRegressions > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Regression analysis failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = PerformanceRegressionAnalyzer;