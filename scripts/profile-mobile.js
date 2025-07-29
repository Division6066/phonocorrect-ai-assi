#!/usr/bin/env node

/**
 * Mobile performance profiling script
 * 
 * This script:
 * 1. Builds release APK/IPA with profiling enabled
 * 2. Starts the app on emulator with energy profiler for 60s
 * 3. Collects performance marks and energy usage data
 * 4. Uploads artifacts for CI analysis
 * 
 * Usage:
 *   npm run profile
 *   npm run profile:ios
 *   npm run profile:android
 */

const { spawn, exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class MobileProfiler {
  constructor() {
    this.platform = process.argv.includes('--platform') 
      ? process.argv[process.argv.indexOf('--platform') + 1]
      : this.detectPlatform();
    
    this.outputDir = path.join(__dirname, '..', 'artifacts', 'profiling');
    this.profilingDuration = 60000; // 60 seconds
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  detectPlatform() {
    if (process.argv.includes('ios')) return 'ios';
    if (process.argv.includes('android')) return 'android';
    return os.platform() === 'darwin' ? 'ios' : 'android';
  }

  async ensureOutputDir() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create output directory:', error);
      throw error;
    }
  }

  async buildProfilingApp() {
    console.log(`🔨 Building ${this.platform} app with profiling enabled...`);
    
    const buildCommand = this.platform === 'ios' 
      ? 'npm run build:ios:profile'
      : 'npm run build:android:profile';

    return this.executeCommand(buildCommand, {
      cwd: path.join(__dirname, '..', 'mobile'),
      env: {
        ...process.env,
        NODE_ENV: 'profiling',
        EXPO_PUBLIC_PROFILING: 'true'
      }
    });
  }

  async startEmulator() {
    console.log(`📱 Starting ${this.platform} emulator...`);
    
    if (this.platform === 'ios') {
      // Start iOS Simulator
      await this.executeCommand('xcrun simctl boot "iPhone 15"');
      await this.sleep(5000);
    } else {
      // Start Android Emulator
      await this.executeCommand('$ANDROID_HOME/emulator/emulator -avd Pixel_4_API_30 -no-snapshot -wipe-data &');
      await this.sleep(10000);
    }
  }

  async installAndLaunchApp() {
    console.log(`🚀 Installing and launching app for profiling...`);
    
    if (this.platform === 'ios') {
      // Install on iOS Simulator
      const buildPath = await this.findLatestBuild('ios');
      await this.executeCommand(`xcrun simctl install booted "${buildPath}"`);
      await this.executeCommand('xcrun simctl launch booted com.phonocorrectai.mobile');
    } else {
      // Install on Android Emulator
      const apkPath = await this.findLatestBuild('android');
      await this.executeCommand(`adb install "${apkPath}"`);
      await this.executeCommand('adb shell am start -n com.phonocorrectai.mobile/.MainActivity');
    }
  }

  async findLatestBuild(platform) {
    // This would be implemented to find the latest built artifact
    // For now, return a placeholder path
    const buildDir = path.join(__dirname, '..', 'mobile', 'dist');
    if (platform === 'ios') {
      return path.join(buildDir, 'PhonoCorrectAI.app');
    } else {
      return path.join(buildDir, 'app-release.apk');
    }
  }

  async profileApp() {
    console.log(`📊 Profiling app for ${this.profilingDuration / 1000} seconds...`);
    
    const profilingPromises = [
      this.capturePerformanceMarks(),
      this.captureEnergyUsage(),
      this.captureSystemMetrics()
    ];

    // Wait for profiling duration
    await this.sleep(this.profilingDuration);

    // Stop profiling and collect data
    const results = await Promise.allSettled(profilingPromises);
    
    return {
      performanceMarks: results[0].status === 'fulfilled' ? results[0].value : null,
      energyUsage: results[1].status === 'fulfilled' ? results[1].value : null,
      systemMetrics: results[2].status === 'fulfilled' ? results[2].value : null,
    };
  }

  async capturePerformanceMarks() {
    console.log('📈 Capturing performance marks...');
    
    const command = this.platform === 'ios'
      ? this.captureIOSPerformanceMarks()
      : this.captureAndroidPerformanceMarks();
    
    return await command;
  }

  async captureIOSPerformanceMarks() {
    // Use iOS instruments or simulator to extract performance data
    const command = `xcrun simctl spawn booted log show --predicate 'subsystem CONTAINS "PhonoCorrectAI"' --style json --last 1m`;
    
    try {
      const result = await this.executeCommand(command);
      return this.parseIOSLogs(result.stdout);
    } catch (error) {
      console.warn('Failed to capture iOS performance marks:', error);
      return null;
    }
  }

  async captureAndroidPerformanceMarks() {
    // Use ADB to extract performance data from logcat
    const command = 'adb logcat -d -s "PhonoCorrectAI:*" | grep "Performance"';
    
    try {
      const result = await this.executeCommand(command);
      return this.parseAndroidLogs(result.stdout);
    } catch (error) {
      console.warn('Failed to capture Android performance marks:', error);
      return null;
    }
  }

  parseIOSLogs(logs) {
    try {
      // Parse iOS logs for performance marks
      const logData = JSON.parse(logs);
      const performanceEntries = logData.filter(entry => 
        entry.eventMessage && entry.eventMessage.includes('Performance Mark')
      );
      
      return performanceEntries.map(entry => ({
        timestamp: entry.timestamp,
        message: entry.eventMessage,
        mark: this.extractMarkFromMessage(entry.eventMessage)
      }));
    } catch (error) {
      console.warn('Failed to parse iOS logs:', error);
      return [];
    }
  }

  parseAndroidLogs(logs) {
    try {
      // Parse Android logcat for performance marks
      const lines = logs.split('\n').filter(line => line.includes('Performance Mark'));
      
      return lines.map(line => {
        const match = line.match(/Performance Mark: (.+) at (.+)ms/);
        if (match) {
          return {
            mark: match[1],
            time: parseFloat(match[2]),
            timestamp: Date.now()
          };
        }
        return null;
      }).filter(Boolean);
    } catch (error) {
      console.warn('Failed to parse Android logs:', error);
      return [];
    }
  }

  extractMarkFromMessage(message) {
    const match = message.match(/Performance Mark: (.+) at (.+)ms/);
    return match ? { name: match[1], time: parseFloat(match[2]) } : null;
  }

  async captureEnergyUsage() {
    console.log('🔋 Capturing energy usage...');
    
    if (this.platform === 'ios') {
      return this.captureIOSEnergyUsage();
    } else {
      return this.captureAndroidEnergyUsage();
    }
  }

  async captureIOSEnergyUsage() {
    // Use iOS Energy Impact profiling
    try {
      const command = `xcrun xctrace record --template "Energy Log" --target "iPhone 15" --time-limit ${this.profilingDuration / 1000}s --output energy-${this.timestamp}.trace`;
      await this.executeCommand(command);
      
      // Export trace data to JSON
      const exportCommand = `xcrun xctrace export --input energy-${this.timestamp}.trace --output energy-${this.timestamp}.json`;
      const result = await this.executeCommand(exportCommand);
      
      return JSON.parse(result.stdout);
    } catch (error) {
      console.warn('Failed to capture iOS energy usage:', error);
      return null;
    }
  }

  async captureAndroidEnergyUsage() {
    // Use Android battery historian or similar tools
    try {
      // Start battery stats collection
      await this.executeCommand('adb shell dumpsys batterystats --reset');
      
      // Wait for profiling duration
      await this.sleep(this.profilingDuration);
      
      // Collect battery stats
      const result = await this.executeCommand('adb shell dumpsys batterystats --charged com.phonocorrectai.mobile');
      
      return this.parseBatteryStats(result.stdout);
    } catch (error) {
      console.warn('Failed to capture Android energy usage:', error);
      return null;
    }
  }

  parseBatteryStats(stats) {
    // Parse Android battery stats into structured data
    try {
      const lines = stats.split('\n');
      const relevantLines = lines.filter(line => 
        line.includes('com.phonocorrectai.mobile') ||
        line.includes('CPU usage') ||
        line.includes('Wake locks')
      );
      
      return {
        appStats: relevantLines,
        timestamp: Date.now(),
        duration: this.profilingDuration
      };
    } catch (error) {
      console.warn('Failed to parse battery stats:', error);
      return null;
    }
  }

  async captureSystemMetrics() {
    console.log('💻 Capturing system metrics...');
    
    const command = this.platform === 'ios'
      ? 'top -l 1 -pid $(pgrep -f Simulator) | head -20'
      : 'adb shell top -n 1 | grep com.phonocorrectai.mobile';
    
    try {
      const result = await this.executeCommand(command);
      return {
        systemInfo: result.stdout,
        timestamp: Date.now(),
        platform: this.platform
      };
    } catch (error) {
      console.warn('Failed to capture system metrics:', error);
      return null;
    }
  }

  async saveArtifacts(profilingData) {
    console.log('💾 Saving profiling artifacts...');
    
    await this.ensureOutputDir();
    
    const artifacts = [];
    
    // Save performance marks
    if (profilingData.performanceMarks) {
      const perfFile = path.join(this.outputDir, `perf-marks-${this.platform}-${this.timestamp}.json`);
      await fs.writeFile(perfFile, JSON.stringify(profilingData.performanceMarks, null, 2));
      artifacts.push(perfFile);
      console.log(`📄 Saved performance marks: ${perfFile}`);
    }
    
    // Save energy report
    if (profilingData.energyUsage) {
      const energyFile = path.join(this.outputDir, `energy-report-${this.platform}-${this.timestamp}.json`);
      await fs.writeFile(energyFile, JSON.stringify(profilingData.energyUsage, null, 2));
      artifacts.push(energyFile);
      console.log(`🔋 Saved energy report: ${energyFile}`);
    }
    
    // Save system metrics
    if (profilingData.systemMetrics) {
      const metricsFile = path.join(this.outputDir, `system-metrics-${this.platform}-${this.timestamp}.json`);
      await fs.writeFile(metricsFile, JSON.stringify(profilingData.systemMetrics, null, 2));
      artifacts.push(metricsFile);
      console.log(`💻 Saved system metrics: ${metricsFile}`);
    }
    
    // Create summary report
    const summaryFile = path.join(this.outputDir, `profiling-summary-${this.platform}-${this.timestamp}.json`);
    const summary = {
      platform: this.platform,
      timestamp: this.timestamp,
      duration: this.profilingDuration,
      artifacts: artifacts.map(f => path.basename(f)),
      ...profilingData
    };
    
    await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2));
    artifacts.push(summaryFile);
    console.log(`📊 Saved profiling summary: ${summaryFile}`);
    
    return artifacts;
  }

  async cleanup() {
    console.log('🧹 Cleaning up...');
    
    try {
      if (this.platform === 'ios') {
        await this.executeCommand('xcrun simctl shutdown all');
      } else {
        await this.executeCommand('adb emu kill');
      }
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  }

  async executeCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      exec(command, options, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async run() {
    try {
      console.log(`🚀 Starting mobile profiling for ${this.platform}...`);
      
      // 1. Build profiling app
      await this.buildProfilingApp();
      
      // 2. Start emulator
      await this.startEmulator();
      
      // 3. Install and launch app
      await this.installAndLaunchApp();
      
      // 4. Profile the app
      const profilingData = await this.profileApp();
      
      // 5. Save artifacts
      const artifacts = await this.saveArtifacts(profilingData);
      
      console.log('✅ Profiling completed successfully!');
      console.log('📁 Artifacts saved:');
      artifacts.forEach(artifact => console.log(`   - ${artifact}`));
      
      return artifacts;
      
    } catch (error) {
      console.error('❌ Profiling failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run profiler if called directly
if (require.main === module) {
  const profiler = new MobileProfiler();
  profiler.run()
    .then(artifacts => {
      console.log(`\n🎉 Profiling completed! ${artifacts.length} artifacts generated.`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Profiling failed:', error.message);
      process.exit(1);
    });
}

module.exports = MobileProfiler;