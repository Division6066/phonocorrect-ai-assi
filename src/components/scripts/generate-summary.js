#!/usr/bin/env node

/**
 * Test Summary Generator
 * Creates markdown summaries for PR comments and documentation
 */

const fs = require('fs');

class TestSummaryGenerator {
  constructor(options) {
    this.inputPath = options.input;
    this.outputPath = options.output;
  }

  async generateSummary() {
    const reportData = JSON.parse(fs.readFileSync(this.inputPath, 'utf8'));
    
    const summary = this.createMarkdownSummary(reportData);
    
    fs.writeFileSync(this.outputPath, summary);
    console.log(`✅ Test summary generated: ${this.outputPath}`);
    
    return summary;
  }

  createMarkdownSummary(report) {
    const platforms = Object.values(report.platforms);
    const overall = report.overall;
    
    let markdown = `## 🧪 Test Results Summary

**Overall Status:** ${overall.status === 'passed' ? '✅ PASSED' : '❌ FAILED'}
**Health Score:** ${overall.healthScore}/100
**Generated:** ${new Date(report.metadata.aggregatedAt).toLocaleString()}

### 📊 Quick Stats
- **Total Tests:** ${overall.totalTests}
- **Success Rate:** ${overall.successRate}%
- **Coverage:** ${overall.averageCoverage}%
- **Duration:** ${overall.averageDuration}s

### 📱 Platform Results

| Platform | Tests | Success Rate | Coverage | Status |
|----------|-------|--------------|----------|--------|
`;

    platforms.forEach(platform => {
      const status = platform.summary.failedTests === 0 ? '✅' : '❌';
      markdown += `| ${platform.platform} | ${platform.summary.totalTests} | ${platform.summary.successRate}% | ${platform.summary.avgCoverage}% | ${status} |\n`;
    });

    // Add trend information
    markdown += `\n### 📈 Trends
${report.trends.message}`;

    if (report.trends.improvement !== 0) {
      const emoji = report.trends.improvement > 0 ? '📈' : '📉';
      markdown += ` ${emoji} ${report.trends.improvement > 0 ? '+' : ''}${report.trends.improvement}% from previous runs`;
    }

    // Add quality issues if any
    if (report.quality.issues.length > 0) {
      markdown += `\n\n### ⚠️ Issues to Address
`;
      report.quality.issues.forEach(issue => {
        markdown += `- ${issue}\n`;
      });
    }

    // Add warnings if any
    if (report.quality.warnings.length > 0) {
      markdown += `\n\n### ⚡ Warnings
`;
      report.quality.warnings.forEach(warning => {
        markdown += `- ${warning}\n`;
      });
    }

    // Add top recommendations
    if (report.recommendations.length > 0) {
      markdown += `\n\n### 💡 Top Recommendations
`;
      report.recommendations.slice(0, 3).forEach(rec => {
        const emoji = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🔵';
        markdown += `- ${emoji} **${rec.category.toUpperCase()}** (${rec.platform}): ${rec.message}\n`;
      });
    }

    // Add detailed breakdown for failures
    const failedPlatforms = platforms.filter(p => p.summary.failedTests > 0);
    if (failedPlatforms.length > 0) {
      markdown += `\n\n### 🔍 Failure Details
`;
      failedPlatforms.forEach(platform => {
        markdown += `\n#### ${platform.platform}
- **Failed Tests:** ${platform.summary.failedTests}/${platform.summary.totalTests}
- **Test Types:** ${platform.testTypes.join(', ')}
`;
        // Add specific failure information if available
        platform.reports.forEach(report => {
          if (report.summary.failedTests > 0) {
            markdown += `- ${report.metadata.testType}: ${report.summary.failedTests} failures\n`;
          }
        });
      });
    }

    // Add coverage details
    markdown += `\n\n### 🛡️ Coverage Details
`;
    platforms.forEach(platform => {
      const coverageEmoji = platform.summary.avgCoverage >= 80 ? '✅' : platform.summary.avgCoverage >= 60 ? '⚠️' : '❌';
      markdown += `- **${platform.platform}:** ${coverageEmoji} ${platform.summary.avgCoverage}%\n`;
    });

    // Add footer with links
    markdown += `\n\n---
📊 [View Full Dashboard](./test-dashboard.html) | 📋 [Download Report](./aggregated-report.json)

<details>
<summary>🔧 Test Configuration</summary>

**Platforms Tested:**
`;

    platforms.forEach(platform => {
      markdown += `- **${platform.platform}:** ${platform.testTypes.join(', ')}\n`;
    });

    markdown += `
**Test Matrix:**
- iOS: Simulators (iPhone 14 Pro iOS 17, iPhone 12 iOS 16)
- Android: Emulators (API 34, API 26)
- Web: Chromium, Firefox, WebKit
- Extension: Chrome MV3
- Desktop: Windows, macOS, Linux

**Test Types:**
- Unit tests (Jest)
- Integration tests (Jest)
- E2E tests (Detox for mobile, Playwright for web)
- Performance tests
- Accessibility tests (WCAG AA compliance)

</details>`;

    return markdown;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    options[key] = args[i + 1];
  }

  if (!options.input || !options.output) {
    console.error('Usage: node generate-summary.js --input=<file> --output=<file>');
    process.exit(1);
  }

  const generator = new TestSummaryGenerator(options);
  generator.generateSummary()
    .then(() => {
      console.log('Summary generated successfully');
    })
    .catch(error => {
      console.error('Failed to generate summary:', error);
      process.exit(1);
    });
}

module.exports = TestSummaryGenerator;