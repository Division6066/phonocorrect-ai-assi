#!/usr/bin/env node

/**
 * Generate QR distribution page for mobile app sideloading
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

interface BuildConfig {
  version: string;
  buildNumber: string;
  androidUrl: string;
  iosUrl: string;
  desktopUrls: {
    mac: string;
    windows: string;
    linux: string;
  };
  chromeExtUrl: string;
}

function generateQRPage(config: BuildConfig): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PhonoCorrect AI - Download v${config.version}</title>
    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
        }
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        .card { 
            background: white; 
            border-radius: 16px; 
            padding: 32px; 
            margin: 24px 0; 
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 32px;
        }
        .qr-container { 
            text-align: center; 
            margin: 24px 0; 
        }
        .qr-container canvas {
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        .download-btn {
            display: inline-block;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 16px 32px;
            border-radius: 12px;
            text-decoration: none;
            margin: 12px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
        }
        .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
        }
        .download-btn.secondary {
            background: linear-gradient(45deg, #f093fb, #f5576c);
            box-shadow: 0 4px 16px rgba(240, 147, 251, 0.3);
        }
        .download-btn.secondary:hover {
            box-shadow: 0 8px 24px rgba(240, 147, 251, 0.4);
        }
        .version-info {
            background: linear-gradient(45deg, #e8f4fd, #f0f9ff);
            border: 1px solid #b3d9ff;
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
            text-align: center;
        }
        .platform-section {
            margin: 32px 0;
        }
        .platform-section h3 {
            color: #333;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .instructions {
            background: #f8fafc;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
            border-left: 4px solid #667eea;
        }
        .instructions h4 {
            color: #333;
            margin-bottom: 8px;
        }
        .instructions ol {
            margin-left: 20px;
        }
        .instructions li {
            margin: 4px 0;
        }
        .warning {
            background: #fef3cd;
            border: 1px solid #facc15;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
        }
        .warning strong {
            color: #92400e;
        }
        @media (max-width: 768px) {
            .grid {
                grid-template-columns: 1fr;
            }
            .header h1 {
                font-size: 2rem;
            }
            .card {
                padding: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧠 PhonoCorrect AI</h1>
            <p>Phonetic spelling assistant for dyslexic and ADHD users</p>
        </div>
        
        <div class="card">
            <div class="version-info">
                <h2>📦 Version ${config.version} Build ${config.buildNumber}</h2>
                <p>Released: ${new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short'
                })}</p>
            </div>
        </div>

        <div class="grid">
            <!-- Mobile Apps -->
            <div class="card">
                <div class="platform-section">
                    <h3>📱 Mobile Apps</h3>
                    
                    <div class="qr-container">
                        <canvas id="android-qr" width="200" height="200"></canvas>
                        <h4>Android APK</h4>
                        <p>Direct install for testing</p>
                        <a href="${config.androidUrl}" class="download-btn">Download APK</a>
                    </div>
                    
                    <div class="qr-container">
                        <canvas id="ios-qr" width="200" height="200"></canvas>
                        <h4>iOS TestFlight</h4>
                        <p>Beta testing via Apple</p>
                        <a href="${config.iosUrl}" class="download-btn">Join TestFlight</a>
                    </div>
                </div>
                
                <div class="instructions">
                    <h4>📋 Android Installation</h4>
                    <ol>
                        <li>Enable "Unknown Sources" in Settings → Security</li>
                        <li>Download APK and tap to install</li>
                        <li>Grant necessary permissions when prompted</li>
                        <li>Allow microphone access for speech features</li>
                    </ol>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Security Notice:</strong> This is a test build. Only install if you trust the source.
                </div>
            </div>

            <!-- Desktop Apps -->
            <div class="card">
                <div class="platform-section">
                    <h3>🖥️ Desktop Apps</h3>
                    
                    <div style="text-align: center;">
                        <a href="${config.desktopUrls.mac}" class="download-btn">📦 macOS (DMG)</a>
                        <a href="${config.desktopUrls.windows}" class="download-btn">🪟 Windows (EXE)</a>
                        <a href="${config.desktopUrls.linux}" class="download-btn">🐧 Linux (AppImage)</a>
                    </div>
                </div>
                
                <div class="instructions">
                    <h4>📋 Desktop Installation</h4>
                    <strong>macOS:</strong>
                    <ol>
                        <li>Download and mount the DMG file</li>
                        <li>Drag PhonoCorrect AI to Applications folder</li>
                        <li>Right-click and "Open" for first launch (security)</li>
                    </ol>
                    
                    <strong>Windows:</strong>
                    <ol>
                        <li>Download and run the installer EXE</li>
                        <li>Allow installation when Windows SmartScreen appears</li>
                        <li>Follow installation wizard</li>
                    </ol>
                    
                    <strong>Linux:</strong>
                    <ol>
                        <li>Download AppImage file</li>
                        <li>Make executable: <code>chmod +x *.AppImage</code></li>
                        <li>Run: <code>./PhonoCorrect*.AppImage</code></li>
                    </ol>
                </div>
            </div>
        </div>

        <!-- Browser Extension -->
        <div class="card">
            <div class="platform-section">
                <h3>🌐 Browser Extension</h3>
                <div style="text-align: center;">
                    <a href="${config.chromeExtUrl}" class="download-btn secondary">📂 Chrome Extension (ZIP)</a>
                </div>
                
                <div class="instructions">
                    <h4>📋 Extension Installation</h4>
                    <ol>
                        <li>Download and unzip the extension file</li>
                        <li>Open Chrome and go to <code>chrome://extensions/</code></li>
                        <li>Enable "Developer mode" in the top right</li>
                        <li>Click "Load unpacked" and select the unzipped folder</li>
                        <li>Pin the extension to your toolbar for easy access</li>
                    </ol>
                </div>
            </div>
        </div>

        <!-- Technical Requirements -->
        <div class="card">
            <h3>🔧 System Requirements</h3>
            <div class="grid" style="gap: 16px;">
                <div>
                    <strong>📱 Mobile:</strong>
                    <ul style="margin-left: 20px; margin-top: 8px;">
                        <li>Android 8.0+ (API 26)</li>
                        <li>iOS 14.0+</li>
                        <li>2GB+ RAM recommended</li>
                        <li>100MB+ storage</li>
                    </ul>
                </div>
                <div>
                    <strong>🖥️ Desktop:</strong>
                    <ul style="margin-left: 20px; margin-top: 8px;">
                        <li>macOS 10.15+ (Catalina)</li>
                        <li>Windows 10+ (64-bit)</li>
                        <li>Ubuntu 18.04+ / similar Linux</li>
                        <li>4GB+ RAM recommended</li>
                    </ul>
                </div>
            </div>
            
            <div class="instructions" style="margin-top: 24px;">
                <h4>🌐 Internet Requirements</h4>
                <p>Initial launch requires internet to download ML models (~100MB). After setup, most features work offline.</p>
            </div>
        </div>
    </div>

    <script>
        // Generate QR codes for mobile apps
        function generateQRCodes() {
            try {
                if (typeof QRCode !== 'undefined') {
                    QRCode.toCanvas(
                        document.getElementById('android-qr'), 
                        "${config.androidUrl}", 
                        { 
                            width: 200, 
                            margin: 2,
                            color: {
                                dark: '#333333',
                                light: '#ffffff'
                            }
                        }
                    );
                    
                    QRCode.toCanvas(
                        document.getElementById('ios-qr'), 
                        "${config.iosUrl}", 
                        { 
                            width: 200, 
                            margin: 2,
                            color: {
                                dark: '#333333',
                                light: '#ffffff'
                            }
                        }
                    );
                } else {
                    console.warn('QRCode library not loaded');
                }
            } catch (error) {
                console.error('Error generating QR codes:', error);
            }
        }
        
        // Generate QR codes when page loads
        window.addEventListener('load', generateQRCodes);
        
        // Fallback if library loads after page load
        setTimeout(generateQRCodes, 1000);
    </script>
</body>
</html>`;
}

function main() {
  // Get version from package.json
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  const version = packageJson.version;
  const buildNumber = process.env.GITHUB_RUN_NUMBER || '1';
  const releaseTag = `v${version}-${buildNumber}`;
  
  // TODO: Replace with your actual GitHub repository
  const repoUrl = 'https://github.com/yourusername/phonocorrect-ai';
  
  const config: BuildConfig = {
    version,
    buildNumber,
    androidUrl: `${repoUrl}/releases/download/${releaseTag}/PhonoCorrectAI-${releaseTag}.apk`,
    iosUrl: 'https://testflight.apple.com/join/YOUR_TESTFLIGHT_CODE', // TODO: Replace with actual TestFlight URL
    desktopUrls: {
      mac: `${repoUrl}/releases/download/${releaseTag}/PhonoCorrectAI-${releaseTag}.dmg`,
      windows: `${repoUrl}/releases/download/${releaseTag}/PhonoCorrectAI-${releaseTag}.exe`,
      linux: `${repoUrl}/releases/download/${releaseTag}/PhonoCorrectAI-${releaseTag}.AppImage`
    },
    chromeExtUrl: `${repoUrl}/releases/download/${releaseTag}/phonocorrect-chrome-extension.zip`
  };
  
  const htmlContent = generateQRPage(config);
  
  // Ensure dist directory exists
  const distDir = path.join(rootDir, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // Write QR page
  const outputPath = path.join(distDir, 'qr.html');
  fs.writeFileSync(outputPath, htmlContent, 'utf8');
  
  console.log(`✅ QR distribution page generated: ${outputPath}`);
  console.log(`📱 Version: ${releaseTag}`);
  console.log(`🔗 Preview locally: file://${outputPath}`);
}

main();