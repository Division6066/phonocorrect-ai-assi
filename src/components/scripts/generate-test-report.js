#!/usr/bin/env node

/**
 * Test Report Generator Script
 * Generates comprehensive test reports from various test frameworks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestReportGenerator {
  constructor(options) {
    this.platform = options.platform;
    this.testType = options.testType;
    this.resultsDir = options.resultsDir;
    this.outputPath = options.output;
    this.timestamp = new Date().toISOString();
  }

  async generateReport() {
    console.log(`Generating test report for ${this.platform} - ${this.testType}`);

    const report = {
      metadata: {
        platform: this.platform,
        testType: this.testType,
        timestamp: this.timestamp,
        branch: this.getBranch(),
        commit: this.getCommit(),
        environment: process.env.NODE_ENV || 'test'
      },
      summary: await this.generateSummary(),
      details: await this.parseTestResults(),
      coverage: await this.parseCoverage(),
      performance: await this.parsePerformanceMetrics(),
      artifacts: await this.collectArtifacts()
    };

    await this.writeReport(report);
    console.log(`Report generated: ${this.outputPath}`);
    return report;
  }

  getBranch() {
    try {
      return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    } catch {
      return process.env.GITHUB_REF_NAME || 'unknown';
    }
  }

  getCommit() {
    try {
      return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    } catch {
      return process.env.GITHUB_SHA?.substring(0, 7) || 'unknown';
    }
  }

  async generateSummary() {
    const testFiles = await this.findTestResultFiles();
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;
    let totalDuration = 0;

    for (const file of testFiles) {
      const results = await this.parseTestFile(file);
      totalTests += results.total || 0;
      passedTests += results.passed || 0;
      failedTests += results.failed || 0;
      skippedTests += results.skipped || 0;
      totalDuration += results.duration || 0;
    }

    return {
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      successRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
      duration: totalDuration,
      status: failedTests === 0 ? 'passed' : 'failed'
    };
  }

  async findTestResultFiles() {
    const files = [];
    const extensions = ['.xml', '.json', '.tap'];
    
    if (!fs.existsSync(this.resultsDir)) {
      return files;
    }

    const walkDir = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    };

    walkDir(this.resultsDir);
    return files;
  }

  async parseTestFile(filePath) {
    const ext = path.extname(filePath);
    const content = fs.readFileSync(filePath, 'utf8');

    try {
      switch (ext) {
        case '.xml':
          return this.parseJUnitXML(content);
        case '.json':
          return this.parseJSONResults(content);
        case '.tap':
          return this.parseTAPResults(content);
        default:
          return { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 };
      }
    } catch (error) {
      console.warn(`Failed to parse ${filePath}:`, error.message);
      return { total: 0, passed: 0, failed: 0, skipped: 0, duration: 0 };
    }
  }

  parseJUnitXML(content) {
    // Simple regex-based XML parsing for JUnit format
    const testcaseRegex = /<testcase[^>]*>/g;
    const failureRegex = /<failure[^>]*>/g;
    const skippedRegex = /<skipped[^>]*>/g;
    const timeRegex = /time="([^"]+)"/;

    const testcases = content.match(testcaseRegex) || [];
    const failures = content.match(failureRegex) || [];
    const skipped = content.match(skippedRegex) || [];

    let totalDuration = 0;
    const timeMatch = content.match(/time="([^"]+)"/);
    if (timeMatch) {
      totalDuration = parseFloat(timeMatch[1]) || 0;
    }

    return {
      total: testcases.length,
      passed: testcases.length - failures.length - skipped.length,
      failed: failures.length,
      skipped: skipped.length,
      duration: totalDuration
    };
  }

  parseJSONResults(content) {
    const data = JSON.parse(content);
    
    // Handle different JSON formats (Jest, custom, etc.)
    if (data.testResults) {
      // Jest format
      const summary = data.testResults.reduce((acc, result) => {
        acc.total += result.numTotalTests || 0;
        acc.passed += result.numPassingTests || 0;
        acc.failed += result.numFailingTests || 0;
        acc.skipped += result.numTodoTests || 0;
        return acc;
      }, { total: 0, passed: 0, failed: 0, skipped: 0 });

      return {
        ...summary,
        duration: (data.testResults.reduce((acc, r) => acc + (r.perfStats?.end - r.perfStats?.start || 0), 0)) / 1000
      };
    }

    // Generic JSON format
    return {
      total: data.total || data.totalTests || 0,
      passed: data.passed || data.passedTests || 0,
      failed: data.failed || data.failedTests || 0,
      skipped: data.skipped || data.skippedTests || 0,
      duration: data.duration || 0
    };
  }

  parseTAPResults(content) {
    const lines = content.split('\n');
    let total = 0;
    let passed = 0;
    let failed = 0;
    let skipped = 0;

    for (const line of lines) {
      if (line.match(/^ok \d+/)) {
        total++;
        if (line.includes('# SKIP')) {
          skipped++;
        } else {
          passed++;
        }
      } else if (line.match(/^not ok \d+/)) {
        total++;
        failed++;
      }
    }

    return { total, passed, failed, skipped, duration: 0 };
  }

  async parseTestResults() {
    const testFiles = await this.findTestResultFiles();
    const details = [];

    for (const file of testFiles) {
      const relativePath = path.relative(this.resultsDir, file);
      const results = await this.parseTestFile(file);
      
      details.push({
        file: relativePath,
        ...results,
        size: fs.statSync(file).size
      });
    }

    return details;
  }

  async parseCoverage() {
    const coverageFiles = [
      path.join(this.resultsDir, '../coverage/coverage-summary.json'),
      path.join(this.resultsDir, 'coverage.json'),
      path.join(this.resultsDir, '../coverage/lcov-report/index.html')
    ];

    for (const file of coverageFiles) {
      if (fs.existsSync(file)) {
        try {
          if (file.endsWith('.json')) {
            const coverage = JSON.parse(fs.readFileSync(file, 'utf8'));
            if (coverage.total) {
              return {
                lines: coverage.total.lines?.pct || 0,
                functions: coverage.total.functions?.pct || 0,
                branches: coverage.total.branches?.pct || 0,
                statements: coverage.total.statements?.pct || 0
              };
            }
          }
        } catch (error) {
          console.warn(`Failed to parse coverage file ${file}:`, error.message);
        }
      }
    }

    return null;
  }

  async parsePerformanceMetrics() {
    const perfFiles = [
      path.join(this.resultsDir, 'performance.json'),
      path.join(this.resultsDir, 'lighthouse-report.json'),
      path.join(this.resultsDir, 'benchmark-results.json')
    ];

    for (const file of perfFiles) {
      if (fs.existsSync(file)) {
        try {
          const perf = JSON.parse(fs.readFileSync(file, 'utf8'));
          return {
            loadTime: perf.loadTime || perf.firstContentfulPaint || null,
            memoryUsage: perf.memoryUsage || null,
            cpuUsage: perf.cpuUsage || null,
            networkRequests: perf.networkRequests || null,
            scores: perf.scores || null
          };
        } catch (error) {
          console.warn(`Failed to parse performance file ${file}:`, error.message);
        }
      }
    }

    return null;
  }

  async collectArtifacts() {
    const artifacts = [];
    const artifactDirs = [
      path.join(this.resultsDir, 'screenshots'),
      path.join(this.resultsDir, 'videos'),
      path.join(this.resultsDir, 'detox-artifacts'),
      path.join(this.resultsDir, 'playwright-report')
    ];

    for (const dir of artifactDirs) {
      if (fs.existsSync(dir)) {
        const files = this.getAllFiles(dir);
        artifacts.push({
          type: path.basename(dir),
          count: files.length,
          totalSize: files.reduce((sum, file) => sum + fs.statSync(file).size, 0),
          files: files.map(file => path.relative(this.resultsDir, file))
        });
      }
    }

    return artifacts;
  }

  getAllFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
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

  if (!options.platform || !options.testType || !options.resultsDir || !options.output) {
    console.error('Usage: node generate-test-report.js --platform=<platform> --test-type=<type> --results-dir=<dir> --output=<file>');
    process.exit(1);
  }

  const generator = new TestReportGenerator(options);
  generator.generateReport()
    .then(report => {
      console.log(`✅ Test report generated successfully`);
      console.log(`📊 Results: ${report.summary.passedTests}/${report.summary.totalTests} tests passed`);
      console.log(`📈 Success rate: ${report.summary.successRate.toFixed(1)}%`);
      if (report.coverage) {
        console.log(`🛡️  Coverage: ${report.coverage.lines}% lines`);
      }
    })
    .catch(error => {
      console.error('❌ Failed to generate test report:', error);
      process.exit(1);
    });
}

module.exports = TestReportGenerator;