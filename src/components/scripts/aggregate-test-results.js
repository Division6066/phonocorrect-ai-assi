#!/usr/bin/env node

/**
 * Test Results Aggregator
 * Combines test reports from multiple platforms and generates unified dashboard
 */

const fs = require('fs');
const path = require('path');

class TestResultsAggregator {
  constructor(options) {
    this.inputDir = options.inputDir;
    this.outputPath = options.output;
    this.htmlOutputPath = options.htmlOutput;
    this.timestamp = new Date().toISOString();
  }

  async aggregate() {
    console.log('Aggregating test results from all platforms...');

    const reportFiles = await this.findReportFiles();
    const reports = await this.loadReports(reportFiles);
    
    const aggregatedReport = {
      metadata: {
        aggregatedAt: this.timestamp,
        totalPlatforms: reports.length,
        reportFiles: reportFiles.map(f => path.basename(f))
      },
      overall: this.calculateOverallMetrics(reports),
      platforms: this.groupByPlatform(reports),
      trends: this.calculateTrends(reports),
      quality: this.assessQuality(reports),
      recommendations: this.generateRecommendations(reports)
    };

    await this.writeReport(aggregatedReport);
    
    if (this.htmlOutputPath) {
      await this.generateHTML(aggregatedReport);
    }

    console.log(`✅ Aggregated report generated: ${this.outputPath}`);
    return aggregatedReport;
  }

  async findReportFiles() {
    const files = [];
    
    if (!fs.existsSync(this.inputDir)) {
      throw new Error(`Input directory not found: ${this.inputDir}`);
    }

    const walkDir = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (item.startsWith('test-report-') && item.endsWith('.json')) {
          files.push(fullPath);
        }
      }
    };

    walkDir(this.inputDir);
    return files;
  }

  async loadReports(reportFiles) {
    const reports = [];
    
    for (const file of reportFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const report = JSON.parse(content);
        reports.push({
          ...report,
          filePath: file
        });
      } catch (error) {
        console.warn(`Failed to load report ${file}:`, error.message);
      }
    }

    return reports;
  }

  calculateOverallMetrics(reports) {
    const totals = reports.reduce((acc, report) => {
      const summary = report.summary || {};
      return {
        totalTests: acc.totalTests + (summary.totalTests || 0),
        passedTests: acc.passedTests + (summary.passedTests || 0),
        failedTests: acc.failedTests + (summary.failedTests || 0),
        skippedTests: acc.skippedTests + (summary.skippedTests || 0),
        totalDuration: acc.totalDuration + (summary.duration || 0)
      };
    }, { totalTests: 0, passedTests: 0, failedTests: 0, skippedTests: 0, totalDuration: 0 });

    const successRate = totals.totalTests > 0 ? (totals.passedTests / totals.totalTests) * 100 : 0;
    const avgDuration = reports.length > 0 ? totals.totalDuration / reports.length : 0;

    // Calculate coverage average
    const coverageReports = reports.filter(r => r.coverage);
    const avgCoverage = coverageReports.length > 0 
      ? coverageReports.reduce((sum, r) => sum + (r.coverage.lines || 0), 0) / coverageReports.length
      : 0;

    return {
      ...totals,
      successRate: parseFloat(successRate.toFixed(2)),
      averageDuration: parseFloat(avgDuration.toFixed(2)),
      averageCoverage: parseFloat(avgCoverage.toFixed(2)),
      status: totals.failedTests === 0 ? 'passed' : 'failed',
      healthScore: this.calculateHealthScore(totals, successRate, avgCoverage)
    };
  }

  calculateHealthScore(totals, successRate, coverage) {
    // Health score based on success rate (50%), coverage (30%), and test count (20%)
    const successScore = Math.min(successRate, 100) * 0.5;
    const coverageScore = Math.min(coverage, 100) * 0.3;
    const testCountScore = Math.min((totals.totalTests / 1000) * 100, 100) * 0.2;
    
    return parseFloat((successScore + coverageScore + testCountScore).toFixed(1));
  }

  groupByPlatform(reports) {
    const platforms = {};
    
    reports.forEach(report => {
      const platform = report.metadata?.platform || 'Unknown';
      
      if (!platforms[platform]) {
        platforms[platform] = {
          platform,
          testTypes: [],
          summary: {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            totalDuration: 0,
            avgCoverage: 0
          },
          reports: []
        };
      }

      const summary = report.summary || {};
      platforms[platform].summary.totalTests += summary.totalTests || 0;
      platforms[platform].summary.passedTests += summary.passedTests || 0;
      platforms[platform].summary.failedTests += summary.failedTests || 0;
      platforms[platform].summary.skippedTests += summary.skippedTests || 0;
      platforms[platform].summary.totalDuration += summary.duration || 0;
      
      if (report.coverage?.lines) {
        platforms[platform].summary.avgCoverage = 
          (platforms[platform].summary.avgCoverage + report.coverage.lines) / 2;
      }

      if (report.metadata?.testType && !platforms[platform].testTypes.includes(report.metadata.testType)) {
        platforms[platform].testTypes.push(report.metadata.testType);
      }

      platforms[platform].reports.push(report);
    });

    // Calculate success rates for each platform
    Object.values(platforms).forEach(platform => {
      const { totalTests, passedTests } = platform.summary;
      platform.summary.successRate = totalTests > 0 ? parseFloat(((passedTests / totalTests) * 100).toFixed(2)) : 0;
      platform.summary.avgCoverage = parseFloat(platform.summary.avgCoverage.toFixed(2));
    });

    return platforms;
  }

  calculateTrends(reports) {
    // Simple trend analysis based on timestamps
    const sortedReports = reports
      .filter(r => r.metadata?.timestamp)
      .sort((a, b) => new Date(a.metadata.timestamp) - new Date(b.metadata.timestamp));

    if (sortedReports.length < 2) {
      return {
        direction: 'stable',
        improvement: 0,
        message: 'Insufficient data for trend analysis'
      };
    }

    const recent = sortedReports.slice(-3);
    const older = sortedReports.slice(0, -3);

    const recentAvg = recent.reduce((sum, r) => sum + (r.summary?.successRate || 0), 0) / recent.length;
    const olderAvg = older.length > 0 
      ? older.reduce((sum, r) => sum + (r.summary?.successRate || 0), 0) / older.length
      : recentAvg;

    const improvement = recentAvg - olderAvg;
    const direction = improvement > 1 ? 'improving' : improvement < -1 ? 'declining' : 'stable';

    return {
      direction,
      improvement: parseFloat(improvement.toFixed(2)),
      recentSuccessRate: parseFloat(recentAvg.toFixed(2)),
      message: this.getTrendMessage(direction, improvement)
    };
  }

  getTrendMessage(direction, improvement) {
    switch (direction) {
      case 'improving':
        return `Test quality is improving (+${improvement.toFixed(1)}% success rate)`;
      case 'declining':
        return `Test quality is declining (${improvement.toFixed(1)}% success rate)`;
      default:
        return 'Test quality is stable';
    }
  }

  assessQuality(reports) {
    const issues = [];
    const warnings = [];
    const recommendations = [];

    reports.forEach(report => {
      const platform = report.metadata?.platform || 'Unknown';
      const summary = report.summary || {};

      // Check for failures
      if (summary.failedTests > 0) {
        issues.push(`${platform}: ${summary.failedTests} test(s) failing`);
      }

      // Check for low coverage
      if (report.coverage?.lines < 80) {
        warnings.push(`${platform}: Low code coverage (${report.coverage.lines}%)`);
      }

      // Check for performance issues
      if (summary.duration > 300) {
        warnings.push(`${platform}: Slow test execution (${summary.duration}s)`);
      }

      // Check for skipped tests
      if (summary.skippedTests > summary.totalTests * 0.1) {
        warnings.push(`${platform}: High number of skipped tests (${summary.skippedTests})`);
      }
    });

    // Generate recommendations
    if (issues.length > 0) {
      recommendations.push('Fix failing tests to improve overall quality');
    }
    if (warnings.some(w => w.includes('coverage'))) {
      recommendations.push('Increase test coverage, especially for critical paths');
    }
    if (warnings.some(w => w.includes('Slow'))) {
      recommendations.push('Optimize test performance or parallelize execution');
    }

    return {
      issues,
      warnings,
      recommendations,
      score: this.calculateQualityScore(issues.length, warnings.length)
    };
  }

  calculateQualityScore(issueCount, warningCount) {
    const baseScore = 100;
    const issueDeduction = issueCount * 20;
    const warningDeduction = warningCount * 5;
    return Math.max(0, baseScore - issueDeduction - warningDeduction);
  }

  generateRecommendations(reports) {
    const recommendations = [];
    const platforms = this.groupByPlatform(reports);

    // Platform-specific recommendations
    Object.values(platforms).forEach(platform => {
      if (platform.summary.successRate < 95) {
        recommendations.push({
          priority: 'high',
          category: 'reliability',
          platform: platform.platform,
          message: `Improve test reliability on ${platform.platform} (${platform.summary.successRate}% success rate)`
        });
      }

      if (platform.summary.avgCoverage < 80) {
        recommendations.push({
          priority: 'medium',
          category: 'coverage',
          platform: platform.platform,
          message: `Increase test coverage for ${platform.platform} (currently ${platform.summary.avgCoverage}%)`
        });
      }
    });

    // General recommendations
    const overall = this.calculateOverallMetrics(reports);
    if (overall.totalTests < 100) {
      recommendations.push({
        priority: 'medium',
        category: 'completeness',
        platform: 'all',
        message: 'Consider adding more comprehensive test coverage'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  async generateHTML(aggregatedReport) {
    const html = this.generateHTMLTemplate(aggregatedReport);
    fs.writeFileSync(this.htmlOutputPath, html);
    console.log(`📊 HTML dashboard generated: ${this.htmlOutputPath}`);
  }

  generateHTMLTemplate(report) {
    const platforms = Object.values(report.platforms);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PhonoCorrect AI - Test Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric { text-align: center; margin: 10px 0; }
        .metric-value { font-size: 2em; font-weight: bold; }
        .metric-label { color: #666; font-size: 0.9em; }
        .status-passed { color: #28a745; }
        .status-failed { color: #dc3545; }
        .status-warning { color: #ffc107; }
        .progress-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; transition: width 0.3s ease; }
        .success-rate { background: linear-gradient(to right, #28a745, #20c997); }
        .coverage { background: linear-gradient(to right, #007bff, #6f42c1); }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #dee2e6; }
        th { background: #f8f9fa; font-weight: 600; }
        .chart-container { position: relative; height: 300px; margin: 20px 0; }
        .recommendation { padding: 10px; margin: 5px 0; border-radius: 4px; border-left: 4px solid; }
        .recommendation.high { background: #f8d7da; border-color: #dc3545; }
        .recommendation.medium { background: #fff3cd; border-color: #ffc107; }
        .recommendation.low { background: #d1ecf1; border-color: #17a2b8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 PhonoCorrect AI - Test Dashboard</h1>
            <p>Generated on ${new Date(report.metadata.aggregatedAt).toLocaleString()}</p>
            <p>Platforms tested: ${report.metadata.totalPlatforms} | Health Score: <strong>${report.overall.healthScore}</strong></p>
        </div>

        <div class="grid">
            <div class="card">
                <h3>Overall Summary</h3>
                <div class="metric">
                    <div class="metric-value ${report.overall.status === 'passed' ? 'status-passed' : 'status-failed'}">
                        ${report.overall.totalTests}
                    </div>
                    <div class="metric-label">Total Tests</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill success-rate" style="width: ${report.overall.successRate}%"></div>
                </div>
                <p>${report.overall.successRate}% Success Rate</p>
                <table>
                    <tr><td>Passed</td><td>${report.overall.passedTests}</td></tr>
                    <tr><td>Failed</td><td>${report.overall.failedTests}</td></tr>
                    <tr><td>Skipped</td><td>${report.overall.skippedTests}</td></tr>
                    <tr><td>Coverage</td><td>${report.overall.averageCoverage}%</td></tr>
                </table>
            </div>

            <div class="card">
                <h3>Platform Breakdown</h3>
                <div class="chart-container">
                    <canvas id="platformChart"></canvas>
                </div>
                ${platforms.map(platform => `
                    <div style="margin: 10px 0; padding: 10px; border: 1px solid #dee2e6; border-radius: 4px;">
                        <strong>${platform.platform}</strong>
                        <div class="progress-bar" style="margin: 5px 0;">
                            <div class="progress-fill success-rate" style="width: ${platform.summary.successRate}%"></div>
                        </div>
                        <small>${platform.summary.passedTests}/${platform.summary.totalTests} tests (${platform.summary.successRate}%)</small>
                    </div>
                `).join('')}
            </div>

            <div class="card">
                <h3>Quality Assessment</h3>
                <div class="metric">
                    <div class="metric-value">${report.quality.score}</div>
                    <div class="metric-label">Quality Score</div>
                </div>
                ${report.quality.issues.length > 0 ? `
                    <h4 style="color: #dc3545;">Issues</h4>
                    ${report.quality.issues.map(issue => `<div class="recommendation high">${issue}</div>`).join('')}
                ` : ''}
                ${report.quality.warnings.length > 0 ? `
                    <h4 style="color: #ffc107;">Warnings</h4>
                    ${report.quality.warnings.map(warning => `<div class="recommendation medium">${warning}</div>`).join('')}
                ` : ''}
            </div>

            <div class="card">
                <h3>Recommendations</h3>
                ${report.recommendations.map(rec => `
                    <div class="recommendation ${rec.priority}">
                        <strong>${rec.category.toUpperCase()}</strong> - ${rec.platform}<br>
                        ${rec.message}
                    </div>
                `).join('')}
            </div>

            <div class="card">
                <h3>Trends</h3>
                <div class="metric">
                    <div class="metric-value ${report.trends.direction === 'improving' ? 'status-passed' : report.trends.direction === 'declining' ? 'status-failed' : 'status-warning'}">
                        ${report.trends.direction.toUpperCase()}
                    </div>
                    <div class="metric-label">${report.trends.message}</div>
                </div>
                ${report.trends.improvement !== 0 ? `
                    <p>Change: ${report.trends.improvement > 0 ? '+' : ''}${report.trends.improvement}%</p>
                ` : ''}
            </div>
        </div>
    </div>

    <script>
        // Platform success rate chart
        const ctx = document.getElementById('platformChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ${JSON.stringify(platforms.map(p => p.platform))},
                datasets: [{
                    data: ${JSON.stringify(platforms.map(p => p.summary.successRate))},
                    backgroundColor: [
                        '#28a745', '#007bff', '#6f42c1', '#fd7e14', '#20c997'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    </script>
</body>
</html>`;
  }

  async writeReport(report) {
    const dir = path.dirname(this.outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(this.outputPath, JSON.stringify(report, null, 2));
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    options[key] = args[i + 1];
  }

  if (!options.inputDir || !options.output) {
    console.error('Usage: node aggregate-test-results.js --input-dir=<dir> --output=<file> [--html-output=<file>]');
    process.exit(1);
  }

  const aggregator = new TestResultsAggregator(options);
  aggregator.aggregate()
    .then(report => {
      console.log(`\n📈 Aggregation Summary:`);
      console.log(`   Platforms: ${report.metadata.totalPlatforms}`);
      console.log(`   Success Rate: ${report.overall.successRate}%`);
      console.log(`   Health Score: ${report.overall.healthScore}`);
      console.log(`   Status: ${report.overall.status}`);
    })
    .catch(error => {
      console.error('❌ Failed to aggregate results:', error);
      process.exit(1);
    });
}

module.exports = TestResultsAggregator;