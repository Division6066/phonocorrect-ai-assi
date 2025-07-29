#!/usr/bin/env node

/**
 * Performance threshold checker
 * 
 * Validates performance metrics against defined thresholds
 * Fails CI if performance regressions are detected
 */

const fs = require('fs').promises;
const path = require('path');

class PerformanceThresholdChecker {
  constructor() {
    // Define performance thresholds
    this.thresholds = {
      startup: {
        totalTime: 2000, // 2 seconds max
        keyboardReady: 1000, // 1 second max
        appStart: 500 // 500ms max for app initialization
      },
      energy: {
        cpuUsage: 80, // 80% max CPU usage
        batteryDrain: 5, // 5% max battery drain during profiling
        memoryUsage: 200 // 200MB max memory usage
      },
      scores: {
        minimum: 70, // Minimum performance score
        target: 85 // Target performance score
      }
    };
    
    this.violations = [];
    this.warnings = [];
  }

  async checkThresholds(inputFile) {
    console.log('🔍 Checking performance thresholds...');
    
    const analysis = await this.loadAnalysis(inputFile);
    
    // Check startup thresholds
    this.checkStartupThresholds(analysis);
    
    // Check energy thresholds
    this.checkEnergyThresholds(analysis);
    
    // Check overall performance score
    this.checkPerformanceScore(analysis);
    
    // Generate report
    const report = this.generateReport(analysis);
    await this.saveReport(report, inputFile);
    
    return {
      passed: this.violations.length === 0,
      violations: this.violations,
      warnings: this.warnings,
      report
    };
  }

  async loadAnalysis(inputFile) {
    try {
      const content = await fs.readFile(inputFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load analysis file: ${error.message}`);
    }
  }

  checkStartupThresholds(analysis) {
    const metrics = analysis.summary?.criticalMetrics;
    if (!metrics) {
      this.warnings.push('No startup metrics available for threshold checking');
      return;
    }

    // Check total startup time
    if (metrics.startupTime > this.thresholds.startup.totalTime) {
      this.violations.push({
        category: 'startup',
        metric: 'totalTime',
        actual: metrics.startupTime,
        threshold: this.thresholds.startup.totalTime,
        severity: 'high',
        message: `Startup time ${metrics.startupTime.toFixed(0)}ms exceeds threshold ${this.thresholds.startup.totalTime}ms`
      });
    }

    // Check keyboard ready time
    if (metrics.keyboardReadyTime > this.thresholds.startup.keyboardReady) {
      this.violations.push({
        category: 'startup',
        metric: 'keyboardReady',
        actual: metrics.keyboardReadyTime,
        threshold: this.thresholds.startup.keyboardReady,
        severity: 'medium',
        message: `Keyboard ready time ${metrics.keyboardReadyTime.toFixed(0)}ms exceeds threshold ${this.thresholds.startup.keyboardReady}ms`
      });
    }

    // Check app start time
    if (metrics.appStartTime > this.thresholds.startup.appStart) {
      this.violations.push({
        category: 'startup',
        metric: 'appStart',
        actual: metrics.appStartTime,
        threshold: this.thresholds.startup.appStart,
        severity: 'medium',
        message: `App start time ${metrics.appStartTime.toFixed(0)}ms exceeds threshold ${this.thresholds.startup.appStart}ms`
      });
    }
  }

  checkEnergyThresholds(analysis) {
    const energy = analysis.energyAnalysis;
    if (!energy) {
      this.warnings.push('No energy analysis available for threshold checking');
      return;
    }

    // These would be actual values from the energy profiler
    // For now, we'll check the qualitative assessments
    if (energy.cpuImpact === 'high') {
      this.violations.push({
        category: 'energy',
        metric: 'cpuUsage',
        actual: 'high',
        threshold: 'medium or low',
        severity: 'high',
        message: 'High CPU usage detected during profiling'
      });
    }

    if (energy.batteryImpact === 'high') {
      this.violations.push({
        category: 'energy',
        metric: 'batteryDrain',
        actual: 'high',
        threshold: 'medium or low',
        severity: 'high',
        message: 'High battery drain detected during profiling'
      });
    }
  }

  checkPerformanceScore(analysis) {
    const score = analysis.summary?.performanceScore;
    if (score === undefined) {
      this.warnings.push('No performance score available for threshold checking');
      return;
    }

    if (score < this.thresholds.scores.minimum) {
      this.violations.push({
        category: 'performance',
        metric: 'overallScore',
        actual: score,
        threshold: this.thresholds.scores.minimum,
        severity: 'high',
        message: `Performance score ${score} is below minimum threshold ${this.thresholds.scores.minimum}`
      });
    } else if (score < this.thresholds.scores.target) {
      this.warnings.push(`Performance score ${score} is below target ${this.thresholds.scores.target}`);
    }
  }

  generateReport(analysis) {
    const report = {
      timestamp: new Date().toISOString(),
      platform: analysis.platform,
      thresholds: this.thresholds,
      results: {
        passed: this.violations.length === 0,
        violationCount: this.violations.length,
        warningCount: this.warnings.length,
        violations: this.violations,
        warnings: this.warnings
      },
      summary: {
        performanceScore: analysis.summary?.performanceScore,
        criticalMetrics: analysis.summary?.criticalMetrics,
        worstViolations: this.violations
          .filter(v => v.severity === 'high')
          .slice(0, 3)
      }
    };

    return report;
  }

  async saveReport(report, inputFile) {
    const dir = path.dirname(inputFile);
    const reportFile = path.join(dir, `threshold-check-${report.timestamp.replace(/[:.]/g, '-')}.json`);
    
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    console.log(`📄 Threshold check report saved: ${reportFile}`);
    
    return reportFile;
  }

  printResults() {
    console.log('\n📊 Performance Threshold Check Results\n');
    
    if (this.violations.length === 0) {
      console.log('✅ All performance thresholds passed!');
    } else {
      console.log(`❌ ${this.violations.length} threshold violation(s) found:`);
      
      this.violations.forEach((violation, index) => {
        const icon = violation.severity === 'high' ? '🚨' : '⚠️';
        console.log(`${icon} ${index + 1}. ${violation.message}`);
        console.log(`   Category: ${violation.category}, Metric: ${violation.metric}`);
        console.log(`   Actual: ${violation.actual}, Threshold: ${violation.threshold}\n`);
      });
    }
    
    if (this.warnings.length > 0) {
      console.log(`⚠️  ${this.warnings.length} warning(s):`);
      this.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);
  const inputIndex = args.indexOf('--input');
  const failOnRegression = args.includes('--fail-on-regression');
  
  if (inputIndex === -1) {
    console.error('Usage: node check-performance-thresholds.js --input <analysis-file> [--fail-on-regression]');
    process.exit(1);
  }
  
  const inputFile = args[inputIndex + 1];
  
  try {
    const checker = new PerformanceThresholdChecker();
    const results = await checker.checkThresholds(inputFile);
    
    checker.printResults();
    
    if (!results.passed) {
      console.log('\n🔧 Recommendations:');
      
      const highSeverityViolations = results.violations.filter(v => v.severity === 'high');
      if (highSeverityViolations.length > 0) {
        console.log('High priority fixes needed:');
        highSeverityViolations.forEach(violation => {
          console.log(`- Optimize ${violation.category} performance (${violation.metric})`);
        });
      }
      
      if (failOnRegression) {
        console.error('\n💥 CI failure: Performance thresholds violated');
        process.exit(1);
      } else {
        console.warn('\n⚠️  Performance thresholds violated (not failing CI)');
      }
    }
    
    console.log('\n✅ Threshold check completed');
    
  } catch (error) {
    console.error('❌ Threshold check failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = PerformanceThresholdChecker;