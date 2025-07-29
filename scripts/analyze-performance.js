#!/usr/bin/env node

/**
 * Performance analysis script
 * 
 * Analyzes profiling artifacts and generates insights about app performance
 */

const fs = require('fs').promises;
const path = require('path');

class PerformanceAnalyzer {
  constructor(platform, inputDir) {
    this.platform = platform;
    this.inputDir = inputDir;
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  async analyze() {
    console.log(`📊 Analyzing ${this.platform} performance data...`);
    
    const artifacts = await this.loadArtifacts();
    const analysis = {
      platform: this.platform,
      timestamp: this.timestamp,
      summary: await this.generateSummary(artifacts),
      startupMetrics: await this.analyzeStartupMetrics(artifacts),
      energyAnalysis: await this.analyzeEnergyUsage(artifacts),
      recommendations: await this.generateRecommendations(artifacts)
    };

    await this.saveAnalysis(analysis);
    return analysis;
  }

  async loadArtifacts() {
    const artifacts = {};
    
    try {
      const files = await fs.readdir(this.inputDir);
      
      for (const file of files) {
        if (file.includes(this.platform)) {
          const filePath = path.join(this.inputDir, file);
          const content = await fs.readFile(filePath, 'utf8');
          
          if (file.includes('perf-marks')) {
            artifacts.performanceMarks = JSON.parse(content);
          } else if (file.includes('energy-report')) {
            artifacts.energyReport = JSON.parse(content);
          } else if (file.includes('profiling-summary')) {
            artifacts.summary = JSON.parse(content);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load some artifacts:', error);
    }
    
    return artifacts;
  }

  async generateSummary(artifacts) {
    const summary = {
      totalMarks: 0,
      criticalMetrics: {},
      performanceScore: 0
    };

    if (artifacts.performanceMarks) {
      summary.totalMarks = artifacts.performanceMarks.length;
      
      // Find critical metrics
      const appStart = artifacts.performanceMarks.find(m => m.name === 'app_start');
      const keyboardReady = artifacts.performanceMarks.find(m => m.name === 'keyboard_ready');
      
      if (appStart && keyboardReady) {
        summary.criticalMetrics.startupTime = keyboardReady.time - appStart.time;
        summary.criticalMetrics.appStartTime = appStart.time;
        summary.criticalMetrics.keyboardReadyTime = keyboardReady.time;
      }
    }

    // Calculate performance score (0-100)
    summary.performanceScore = this.calculatePerformanceScore(summary.criticalMetrics);

    return summary;
  }

  calculatePerformanceScore(metrics) {
    let score = 100;
    
    // Deduct points for slow startup
    if (metrics.startupTime) {
      if (metrics.startupTime > 3000) score -= 30;
      else if (metrics.startupTime > 2000) score -= 20;
      else if (metrics.startupTime > 1000) score -= 10;
    }
    
    // Deduct points for slow keyboard ready
    if (metrics.keyboardReadyTime) {
      if (metrics.keyboardReadyTime > 1500) score -= 20;
      else if (metrics.keyboardReadyTime > 1000) score -= 10;
    }
    
    return Math.max(0, score);
  }

  async analyzeStartupMetrics(artifacts) {
    const analysis = {
      phases: [],
      bottlenecks: [],
      trends: []
    };

    if (!artifacts.performanceMarks) {
      return analysis;
    }

    // Analyze startup phases
    const marks = artifacts.performanceMarks.sort((a, b) => a.time - b.time);
    
    for (let i = 1; i < marks.length; i++) {
      const phase = {
        name: `${marks[i-1].name} → ${marks[i].name}`,
        duration: marks[i].time - marks[i-1].time,
        startTime: marks[i-1].time,
        endTime: marks[i].time
      };
      
      analysis.phases.push(phase);
      
      // Identify bottlenecks (phases taking >500ms)
      if (phase.duration > 500) {
        analysis.bottlenecks.push({
          phase: phase.name,
          duration: phase.duration,
          severity: phase.duration > 1000 ? 'high' : 'medium'
        });
      }
    }

    return analysis;
  }

  async analyzeEnergyUsage(artifacts) {
    const analysis = {
      cpuImpact: 'unknown',
      batteryImpact: 'unknown',
      recommendations: []
    };

    if (!artifacts.energyReport) {
      return analysis;
    }

    const energy = artifacts.energyReport;
    
    // Analyze CPU usage
    if (energy.cpuUsage !== undefined) {
      if (energy.cpuUsage > 80) {
        analysis.cpuImpact = 'high';
        analysis.recommendations.push('Consider optimizing CPU-intensive operations');
      } else if (energy.cpuUsage > 50) {
        analysis.cpuImpact = 'medium';
        analysis.recommendations.push('Monitor CPU usage during peak operations');
      } else {
        analysis.cpuImpact = 'low';
      }
    }

    // Analyze battery impact
    if (energy.batteryLevel !== undefined) {
      const batteryDrain = Math.abs(energy.batteryLevel);
      if (batteryDrain > 5) {
        analysis.batteryImpact = 'high';
        analysis.recommendations.push('Significant battery drain detected - review background tasks');
      } else if (batteryDrain > 2) {
        analysis.batteryImpact = 'medium';
      } else {
        analysis.batteryImpact = 'low';
      }
    }

    return analysis;
  }

  async generateRecommendations(artifacts) {
    const recommendations = [];
    
    if (artifacts.performanceMarks) {
      const summary = await this.generateSummary(artifacts);
      
      if (summary.criticalMetrics.startupTime > 2000) {
        recommendations.push({
          category: 'startup',
          priority: 'high',
          title: 'Optimize App Startup',
          description: 'App startup time exceeds 2 seconds. Consider lazy loading and code splitting.',
          impact: 'Improves user experience and app store ratings'
        });
      }
      
      if (summary.criticalMetrics.keyboardReadyTime > 1000) {
        recommendations.push({
          category: 'ui',
          priority: 'medium',
          title: 'Optimize Keyboard Initialization',
          description: 'Keyboard takes too long to become ready. Review text input initialization.',
          impact: 'Reduces perceived loading time'
        });
      }
    }

    if (artifacts.energyReport && artifacts.energyReport.cpuUsage > 70) {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        title: 'Reduce CPU Usage',
        description: 'High CPU usage detected. Profile and optimize expensive operations.',
        impact: 'Improves battery life and device temperature'
      });
    }

    // Always include general recommendations
    recommendations.push({
      category: 'monitoring',
      priority: 'low',
      title: 'Continuous Performance Monitoring',
      description: 'Set up automated performance regression detection.',
      impact: 'Prevents performance degradation over time'
    });

    return recommendations;
  }

  async saveAnalysis(analysis) {
    const outputFile = path.join(this.inputDir, `analysis-${this.platform}-${this.timestamp}.json`);
    await fs.writeFile(outputFile, JSON.stringify(analysis, null, 2));
    console.log(`📄 Analysis saved: ${outputFile}`);
    
    // Also save a human-readable report
    const reportFile = path.join(this.inputDir, `report-${this.platform}-${this.timestamp}.md`);
    const report = this.generateMarkdownReport(analysis);
    await fs.writeFile(reportFile, report);
    console.log(`📝 Report saved: ${reportFile}`);
    
    return outputFile;
  }

  generateMarkdownReport(analysis) {
    return `# Performance Analysis Report

**Platform:** ${analysis.platform}  
**Generated:** ${analysis.timestamp}  
**Performance Score:** ${analysis.summary.performanceScore}/100

## 🚀 Startup Metrics

${analysis.summary.criticalMetrics.startupTime ? 
  `- **Total Startup Time:** ${analysis.summary.criticalMetrics.startupTime.toFixed(0)}ms
- **App Start:** ${analysis.summary.criticalMetrics.appStartTime.toFixed(0)}ms
- **Keyboard Ready:** ${analysis.summary.criticalMetrics.keyboardReadyTime.toFixed(0)}ms` : 
  'No startup metrics available'
}

## ⚡ Performance Phases

${analysis.startupMetrics.phases.map(phase => 
  `- **${phase.name}:** ${phase.duration.toFixed(0)}ms`
).join('\n')}

## 🔋 Energy Analysis

- **CPU Impact:** ${analysis.energyAnalysis.cpuImpact}
- **Battery Impact:** ${analysis.energyAnalysis.batteryImpact}

## 🚨 Bottlenecks

${analysis.startupMetrics.bottlenecks.length > 0 ?
  analysis.startupMetrics.bottlenecks.map(bottleneck =>
    `- **${bottleneck.phase}:** ${bottleneck.duration.toFixed(0)}ms (${bottleneck.severity})`
  ).join('\n') :
  'No significant bottlenecks detected'
}

## 💡 Recommendations

${analysis.recommendations.map(rec =>
  `### ${rec.title} (${rec.priority} priority)
${rec.description}

*Impact:* ${rec.impact}`
).join('\n\n')}

## 📊 Raw Data

- **Total Performance Marks:** ${analysis.summary.totalMarks}
- **Analysis Timestamp:** ${analysis.timestamp}
`;
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);
  const platformIndex = args.indexOf('--platform');
  const inputIndex = args.indexOf('--input');
  
  if (platformIndex === -1 || inputIndex === -1) {
    console.error('Usage: node analyze-performance.js --platform <ios|android> --input <artifacts-dir>');
    process.exit(1);
  }
  
  const platform = args[platformIndex + 1];
  const inputDir = args[inputIndex + 1];
  
  try {
    const analyzer = new PerformanceAnalyzer(platform, inputDir);
    const analysis = await analyzer.analyze();
    
    console.log(`✅ Analysis completed for ${platform}`);
    console.log(`Performance Score: ${analysis.summary.performanceScore}/100`);
    
    if (analysis.summary.performanceScore < 70) {
      console.warn('⚠️  Performance score is below recommended threshold');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = PerformanceAnalyzer;