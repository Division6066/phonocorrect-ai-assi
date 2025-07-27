# 🚀 PhonoCorrect AI - Deployment Guide

This guide covers the complete deployment and distribution pipeline for PhonoCorrect AI across all platforms.

## 📋 Prerequisites

### Development Environment
- **Node.js**: 18.0.0+ (LTS recommended)
- **pnpm**: 9.0.0+ (package manager)
- **Git**: For version control and CI/CD

### Platform-Specific Tools
- **Desktop**: Electron Builder (auto-installed)
- **Mobile**: EAS CLI, Expo account
- **iOS**: Xcode (macOS only), Apple Developer Account
- **Android**: Android SDK, Java 17+

### Accounts & Certificates
- [ ] **GitHub**: Repository with Actions enabled
- [ ] **Expo**: Account for EAS builds
- [ ] **Apple Developer**: For iOS/macOS code signing
- [ ] **Microsoft**: Code signing certificate (Windows)
- [ ] **Google Play**: Developer account (future)
- [ ] **Chrome Web Store**: Developer account (future)

## ⚙️ GitHub Secrets Configuration

Add these secrets to your GitHub repository:

```bash
# Required for mobile builds
EXPO_TOKEN=your_expo_access_token

# Optional: For notifications
SLACK_WEBHOOK_URL=your_slack_webhook
DISCORD_WEBHOOK_URL=your_discord_webhook

# Future: Code signing
APPLE_ID=your_apple_id
APPLE_PASSWORD=your_app_specific_password
APPLE_TEAM_ID=your_team_id
WINDOWS_CERT_PASSWORD=your_cert_password
```

## 🏗️ Build Pipeline Overview

### Automated Triggers
- **Push to `main`**: Full release build
- **Push to `develop`**: Development build
- **Pull Request**: Test builds only
- **Manual**: Via GitHub Actions UI

### Build Matrix
| Platform | OS | Output | CI/CD |
|----------|-------|---------|--------|
| **Web** | Ubuntu | Static files | ✅ |
| **Desktop macOS** | macOS | DMG, ZIP | ✅ |
| **Desktop Windows** | Windows | EXE, Portable | ✅ |
| **Desktop Linux** | Ubuntu | AppImage, DEB | ✅ |
| **Android** | Ubuntu | APK via EAS | ✅ |
| **iOS** | macOS | IPA via EAS | ✅ |
| **Chrome Ext** | Ubuntu | ZIP | ✅ |

## 📱 Mobile App Distribution

### EAS Build Setup

1. **Install EAS CLI**:
   ```bash
   npm install -g @expo/cli eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure project**:
   ```bash
   cd mobile
   eas build:configure
   ```

4. **Test build**:
   ```bash
   # Android APK for testing
   eas build --platform android --profile preview
   
   # iOS for TestFlight
   eas build --platform ios --profile preview
   ```

### Distribution Profiles

#### Development Profile
- **Purpose**: Dev builds with Expo Dev Client
- **Distribution**: Internal only
- **Signing**: Development certificates

#### Preview Profile  
- **Purpose**: Testing builds for QA/beta users
- **Distribution**: Internal distribution (APK/TestFlight)
- **Signing**: Ad-hoc (iOS) / Debug (Android)

#### Production Profile
- **Purpose**: Store releases
- **Distribution**: App Store / Play Store
- **Signing**: Distribution certificates

### Android APK Sideloading

The CI/CD pipeline generates QR codes for easy APK distribution:

1. **QR Distribution Page**: `releases/latest/download/qr.html`
2. **Direct APK Download**: `releases/latest/download/PhonoCorrectAI-v1.0.0.apk`
3. **Installation**: Enable "Unknown Sources" → Install APK

#### Security Considerations
- APKs are signed with debug certificates
- Users see "Unknown developer" warnings
- Recommend TestFlight for iOS (no sideloading)

## 🖥️ Desktop Distribution

### Electron Builder Configuration

The desktop app builds for all major platforms:

#### macOS
- **Formats**: DMG (installer), ZIP (portable)
- **Architectures**: x64, arm64 (Universal Binary)
- **Signing**: Self-signed (TODO: Apple Developer cert)
- **Installation**: Mount DMG → Drag to Applications

#### Windows  
- **Formats**: NSIS installer, Portable EXE
- **Architectures**: x64
- **Signing**: Self-signed (TODO: Code signing cert)
- **Installation**: Run installer, allow SmartScreen

#### Linux
- **Formats**: AppImage (portable), DEB (Debian)
- **Architectures**: x64, arm64
- **Signing**: Not required
- **Installation**: `chmod +x *.AppImage && ./app.AppImage`

### Code Signing Status

| Platform | Status | Security Warning | Production Ready |
|----------|---------|------------------|------------------|
| **macOS** | ⚠️ Self-signed | "Unidentified developer" | ❌ Need Apple cert |
| **Windows** | ⚠️ Self-signed | SmartScreen warning | ❌ Need code cert |
| **Linux** | ✅ No signing | None | ✅ Ready |

## 🌐 Browser Extension

### Chrome Extension Packaging

1. **Build**: `pnpm --filter chrome-ext build`
2. **Package**: ZIP the `dist` folder
3. **Upload**: To GitHub releases

### Chrome Web Store (TODO)

Steps for Chrome Web Store submission:
1. [ ] Create developer account ($5 fee)
2. [ ] Prepare store listing (icons, descriptions)
3. [ ] Privacy policy and terms of service
4. [ ] Submit for review (1-3 business days)

## 🔄 Release Workflow

### Automatic Releases

1. **Trigger**: Push to `main` branch
2. **Version**: Auto-increment from package.json
3. **Build**: All platforms in parallel
4. **Test**: Automated test suite
5. **Package**: Create distributables
6. **Upload**: GitHub release with assets
7. **Notify**: Slack/Discord notifications

### Manual Release

```bash
# Create a release manually
git tag v1.0.0
git push origin v1.0.0
```

### Release Artifacts

Each release includes:
- **Desktop apps**: DMG, EXE, AppImage
- **Mobile apps**: APK download link, TestFlight link  
- **Browser extension**: ZIP file
- **QR distribution page**: HTML file with download links
- **Release notes**: Auto-generated from commits

## 📊 Post-Release

### Distribution Tracking
- **GitHub Analytics**: Download counts per release
- **Expo Analytics**: Mobile app usage (TODO)
- **Extension Analytics**: Chrome Web Store stats (TODO)

### Update Notifications
- **Desktop**: Electron auto-updater (TODO)
- **Mobile**: Expo Updates over-the-air (TODO)
- **Extension**: Chrome auto-update

### Monitoring
- **Crash Reporting**: Sentry integration (TODO)
- **Performance**: Real user monitoring (TODO)
- **Security**: Vulnerability scanning (Dependabot ✅)

## 🔧 Troubleshooting

### Common Issues

#### "App cannot be opened" (macOS)
**Solution**: Right-click → "Open" → "Open anyway"  
**Root Cause**: Unsigned app from unidentified developer

#### "Windows protected your PC" (Windows)
**Solution**: "More info" → "Run anyway"  
**Root Cause**: Unsigned executable from unknown publisher  

#### EAS build fails
**Solutions**:
- Check Expo account limits
- Verify eas.json configuration
- Check build logs for specific errors

#### Missing dependencies
**Solution**: Run `pnpm install --frozen-lockfile`

### Debug Commands

```bash
# Test packaging locally
./scripts/test-packaging.sh

# Build specific platform
pnpm release:desktop
pnpm release:android
pnpm release:ios

# Check EAS build status
eas build:list

# Validate configurations
pnpm lint
pnpm type-check
```

## 🎯 Future Improvements

### Code Signing
- [ ] Apple Developer Account → macOS/iOS signing
- [ ] Windows Code Signing Certificate
- [ ] Automated certificate management

### Store Distribution  
- [ ] Google Play Store listing
- [ ] Apple App Store submission
- [ ] Chrome Web Store publication
- [ ] Microsoft Store (future)

### Advanced Features
- [ ] Over-the-air updates
- [ ] A/B testing framework
- [ ] Advanced analytics
- [ ] Crash reporting
- [ ] Performance monitoring

---

**Need help?** Check the [GitHub Issues](https://github.com/yourusername/phonocorrect-ai/issues) or [Discussions](https://github.com/yourusername/phonocorrect-ai/discussions) for community support.