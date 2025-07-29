#!/usr/bin/env node

/**
 * Performance dashboard updater
 * 
 * Updates GitHub Pages performance dashboard with latest metrics
 */

const fs = require('fs').promises;
const path = require('path');

class PerformanceDashboardUpdater {
  constructor() {
    this.dashboardDir = path.join(__dirname, '..', 'docs', 'performance');
    this.dataFile = path.join(this.dashboardDir, 'performance-data.json');
    this.indexFile = path.join(this.dashboardDir, 'index.html');
  }

  async updateDashboard(inputFile, branch) {
    console.log('📊 Updating performance dashboard...');
    
    const newData = await this.loadPerformanceData(inputFile);
    const historicalData = await this.loadHistoricalData();
    
    // Add new data point
    const updatedData = this.mergeData(historicalData, newData, branch);
    
    // Save updated data
    await this.savePerformanceData(updatedData);
    
    // Generate dashboard HTML
    await this.generateDashboardHTML(updatedData);
    
    console.log('✅ Performance dashboard updated');
    return updatedData;
  }

  async loadPerformanceData(inputFile) {
    try {
      const content = await fs.readFile(inputFile, 'utf8');
      const regression = JSON.parse(content);
      
      return {
        timestamp: new Date().toISOString(),
        commit: process.env.GITHUB_SHA || 'unknown',
        branch: process.env.GITHUB_REF_NAME || 'unknown',
        platforms: {
          android: this.extractPlatformMetrics(regression.platforms.android),
          ios: this.extractPlatformMetrics(regression.platforms.ios)
        },
        summary: regression.summary
      };
    } catch (error) {
      throw new Error(`Failed to load performance data: ${error.message}`);
    }
  }

  extractPlatformMetrics(platformData) {
    if (!platformData || !platformData.comparisons) {
      return null;
    }

    const metrics = {};
    Object.entries(platformData.comparisons).forEach(([key, comparison]) => {
      metrics[key] = {
        current: comparison.current,
        baseline: comparison.baseline,
        change: comparison.percentChange,
        isRegression: comparison.isRegression,
        isImprovement: comparison.isImprovement
      };
    });

    return {
      status: platformData.status,
      regressionCount: platformData.regressionCount || 0,
      metrics
    };
  }

  async loadHistoricalData() {
    try {
      await fs.mkdir(this.dashboardDir, { recursive: true });
      const content = await fs.readFile(this.dataFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      // Return empty historical data if file doesn't exist
      return {
        lastUpdated: new Date().toISOString(),
        dataPoints: [],
        trends: {
          android: { startupTime: [], performanceScore: [] },
          ios: { startupTime: [], performanceScore: [] }
        }
      };
    }
  }

  mergeData(historical, newData, branch) {
    // Add new data point
    historical.dataPoints.push(newData);
    
    // Keep only last 100 data points
    if (historical.dataPoints.length > 100) {
      historical.dataPoints = historical.dataPoints.slice(-100);
    }
    
    // Update trends
    this.updateTrends(historical, newData);
    
    // Update metadata
    historical.lastUpdated = new Date().toISOString();
    historical.latestCommit = newData.commit;
    historical.latestBranch = branch;
    
    return historical;
  }

  updateTrends(historical, newData) {
    const platforms = ['android', 'ios'];
    const metrics = ['startupTime', 'performanceScore'];
    
    platforms.forEach(platform => {
      if (newData.platforms[platform]) {
        metrics.forEach(metric => {
          if (newData.platforms[platform].metrics[metric]) {
            const trendData = {
              timestamp: newData.timestamp,
              value: newData.platforms[platform].metrics[metric].current,
              commit: newData.commit.substring(0, 7)
            };
            
            historical.trends[platform][metric].push(trendData);
            
            // Keep only last 50 trend points
            if (historical.trends[platform][metric].length > 50) {
              historical.trends[platform][metric] = historical.trends[platform][metric].slice(-50);
            }
          }
        });
      }
    });
  }

  async savePerformanceData(data) {
    await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2));
    console.log(`📄 Performance data saved: ${this.dataFile}`);
  }

  async generateDashboardHTML(data) {
    const html = this.generateHTML(data);
    await fs.writeFile(this.indexFile, html);
    console.log(`🌐 Dashboard HTML generated: ${this.indexFile}`);
  }

  generateHTML(data) {
    const latestData = data.dataPoints[data.dataPoints.length - 1];
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PhonoCorrect AI - Performance Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0;
            padding: 20px;
            background: #f8f9fa;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .platform-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            color: #007AFF;
        }
        .metric-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .metric-row:last-child {
            border-bottom: none;
        }
        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
        }
        .status-stable {
            background: #d4edda;
            color: #155724;
        }
        .status-regression {
            background: #f8d7da;
            color: #721c24;
        }
        .status-critical {
            background: #721c24;
            color: white;
        }
        .chart-container {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .chart-container canvas {
            max-height: 400px;
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 40px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧠 PhonoCorrect AI Performance Dashboard</h1>
            <p>Real-time performance monitoring across iOS and Android platforms</p>
            <div>
                <strong>Last Updated:</strong> ${new Date(data.lastUpdated).toLocaleString()}<br>
                <strong>Latest Commit:</strong> ${latestData ? latestData.commit.substring(0, 7) : 'N/A'}<br>
                <strong>Branch:</strong> ${data.latestBranch || 'unknown'}
            </div>
        </div>

        <div class="metrics-grid">
            ${this.generatePlatformCard('Android', latestData?.platforms?.android)}
            ${this.generatePlatformCard('iOS', latestData?.platforms?.ios)}
        </div>

        <div class="chart-container">
            <h2>📈 Startup Time Trends</h2>
            <canvas id="startupChart"></canvas>
        </div>

        <div class="chart-container">
            <h2>🏆 Performance Score Trends</h2>
            <canvas id="scoreChart"></canvas>
        </div>

        <div class="footer">
            <p>Generated automatically by GitHub Actions • Updated every commit to main</p>
        </div>
    </div>

    <script>
        const performanceData = ${JSON.stringify(data, null, 2)};
        
        // Startup Time Chart
        const startupCtx = document.getElementById('startupChart').getContext('2d');
        new Chart(startupCtx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Android Startup Time (ms)',
                        data: performanceData.trends.android.startupTime.map(point => ({
                            x: point.timestamp,
                            y: point.value
                        })),
                        borderColor: '#34C759',
                        backgroundColor: 'rgba(52, 199, 89, 0.1)',
                        tension: 0.3
                    },
                    {
                        label: 'iOS Startup Time (ms)',
                        data: performanceData.trends.ios.startupTime.map(point => ({
                            x: point.timestamp,
                            y: point.value
                        })),
                        borderColor: '#007AFF',
                        backgroundColor: 'rgba(0, 122, 255, 0.1)',
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Startup Time (ms)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true
                    }
                }
            }
        });

        // Performance Score Chart
        const scoreCtx = document.getElementById('scoreChart').getContext('2d');
        new Chart(scoreCtx, {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Android Performance Score',
                        data: performanceData.trends.android.performanceScore.map(point => ({
                            x: point.timestamp,
                            y: point.value
                        })),
                        borderColor: '#34C759',
                        backgroundColor: 'rgba(52, 199, 89, 0.1)',
                        tension: 0.3
                    },
                    {
                        label: 'iOS Performance Score',
                        data: performanceData.trends.ios.performanceScore.map(point => ({
                            x: point.timestamp,
                            y: point.value
                        })),
                        borderColor: '#007AFF',
                        backgroundColor: 'rgba(0, 122, 255, 0.1)',
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Performance Score'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true
                    }
                }
            }
        });
    </script>
</body>
</html>`;
  }

  generatePlatformCard(platformName, platformData) {
    if (!platformData) {
      return `
        <div class="metric-card">
            <div class="platform-title">${platformName}</div>
            <p>No data available</p>
        </div>
      `;
    }

    const statusClass = platformData.status === 'stable' ? 'status-stable' : 
                       platformData.status === 'regression' ? 'status-regression' : 'status-critical';

    return `
      <div class="metric-card">
          <div class="platform-title">${platformName}</div>
          <div class="metric-row">
              <span>Status:</span>
              <span class="status-badge ${statusClass}">${platformData.status.toUpperCase()}</span>
          </div>
          <div class="metric-row">
              <span>Regressions:</span>
              <span>${platformData.regressionCount}</span>
          </div>
          ${Object.entries(platformData.metrics || {}).map(([metric, data]) => `
              <div class="metric-row">
                  <span>${metric}:</span>
                  <span>${data.current} ${data.change > 0 ? '↗' : '↘'} ${Math.abs(data.change).toFixed(1)}%</span>
              </div>
          `).join('')}
      </div>
    `;
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);
  const inputIndex = args.indexOf('--input');
  const branchIndex = args.indexOf('--branch');
  
  if (inputIndex === -1) {
    console.error('Usage: node update-performance-dashboard.js --input <regression-analysis-file> [--branch <branch-name>]');
    process.exit(1);
  }
  
  const inputFile = args[inputIndex + 1];
  const branch = branchIndex !== -1 ? args[branchIndex + 1] : 'main';
  
  try {
    const updater = new PerformanceDashboardUpdater();
    await updater.updateDashboard(inputFile, branch);
    console.log('✅ Performance dashboard updated successfully');
  } catch (error) {
    console.error('❌ Dashboard update failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = PerformanceDashboardUpdater;