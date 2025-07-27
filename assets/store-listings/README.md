# Store Listing Assets & Metadata

This directory contains all the assets and metadata needed for app store submissions.

## Required Assets by Platform

### 📱 iOS App Store

**Screenshots (Required)**
- iPhone 6.7" (1290x2796): `ios/screenshots/iphone-6.7/`
- iPhone 6.5" (1242x2688): `ios/screenshots/iphone-6.5/`
- iPhone 5.5" (1242x2208): `ios/screenshots/iphone-5.5/`
- iPad Pro 12.9" (2048x2732): `ios/screenshots/ipad-12.9/`
- iPad Pro 11" (1668x2388): `ios/screenshots/ipad-11/`

**App Icons**
- 1024x1024 PNG (no transparency): `ios/icon-1024.png`

**Metadata Files**
- `ios/metadata/` (Fastlane deliver format)

### 🤖 Google Play Store

**Screenshots (Required)**
- Phone: 1080x1920 to 3840x7680: `android/screenshots/phone/`
- 7" Tablet: 1024x1600 to 3840x6144: `android/screenshots/tablet-7/`
- 10" Tablet: 1024x1600 to 3840x6144: `android/screenshots/tablet-10/`

**Feature Graphic**
- 1024x500 JPG/PNG: `android/feature-graphic.png`

**App Icons**
- 512x512 PNG: `android/icon-512.png`

**Metadata Files**
- `android/metadata/` (Fastlane supply format)

### 🌐 Chrome Web Store

**Screenshots**
- 1280x800 or 640x400: `chrome/screenshots/`

**Icons**
- 128x128 PNG: `chrome/icon-128.png`
- 440x280 PNG (Promotional): `chrome/promo-440x280.png`
- 920x680 PNG (Promotional): `chrome/promo-920x680.png`
- 1400x560 PNG (Promotional): `chrome/promo-1400x560.png`

### 🖥️ Desktop Apps

**Icons (All formats)**
- Windows ICO: `desktop/icon.ico`
- macOS ICNS: `desktop/icon.icns`
- Linux PNG: `desktop/icon.png` (512x512)

**Screenshots**
- macOS: `desktop/screenshots/macos/`
- Windows: `desktop/screenshots/windows/`
- Linux: `desktop/screenshots/linux/`

## TODO: Assets to Create

### High Priority
- [ ] Create app icons for all platforms (1024x1024 master)
- [ ] Design feature graphics and promotional materials
- [ ] Capture screenshots for all platforms and screen sizes
- [ ] Write store descriptions and metadata

### Medium Priority  
- [ ] Create demo videos (30-60 seconds for each platform)
- [ ] Design promotional banners and marketing materials
- [ ] Prepare press kit with high-resolution assets

### Low Priority
- [ ] Create platform-specific onboarding screenshots
- [ ] Design seasonal promotional materials
- [ ] Prepare multilingual assets for international markets

## Asset Guidelines

### Design Consistency
- Use consistent branding across all platforms
- Follow platform-specific design guidelines
- Ensure accessibility (contrast, font sizes)
- Test assets on actual devices/screens

### Technical Requirements
- Use lossless formats (PNG) for icons and UI elements
- Use high-quality JPEG for photos/screenshots
- Maintain aspect ratios for responsive design
- Include @2x and @3x variants for high-DPI displays

### Content Guidelines
- Showcase key features in screenshots
- Use real content, not placeholder text
- Include diverse user scenarios
- Follow platform content policies

## Automation

### Screenshot Generation
Consider using automated screenshot tools:
- **iOS**: Fastlane Snapshot
- **Android**: Fastlane Screengrab  
- **Desktop**: Playwright or Puppeteer
- **Chrome**: Extension screenshot APIs

### Asset Optimization
Use build tools to automatically:
- Resize icons for all required dimensions
- Optimize images for file size
- Generate platform-specific formats
- Validate asset requirements

### Metadata Synchronization
Keep metadata in sync across platforms:
- Use shared description templates
- Maintain consistent feature lists
- Coordinate release notes
- Version control all text content

## Store-Specific Notes

### iOS App Store Connect
- Requires annual developer account ($99/year)
- Review process typically 1-3 days
- Supports A/B testing for metadata
- Requires privacy policy URL

### Google Play Console
- One-time registration fee ($25)
- Rolling review process (hours to days)
- Supports staged rollouts
- Requires privacy policy for certain permissions

### Chrome Web Store
- One-time developer fee ($5)
- Review typically within 1-3 days
- Manifest V3 required for new extensions
- Detailed permission justifications required

### Desktop Distribution
- **macOS**: Requires Apple Developer account for notarization
- **Windows**: Optional code signing certificate
- **Linux**: Multiple package formats (AppImage, DEB, RPM)