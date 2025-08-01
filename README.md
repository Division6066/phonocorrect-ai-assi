# 🧠 PhonoCorrect AI - Monorepo

A comprehensive phonetic spelling assistant that helps users write with confidence across all platforms. PhonoCorrect AI provides intelligent suggestions based on how words sound, not just how they're spelled.

## ✨ Features

- **🎯 On-device ML inference** with Gemma-2B and MediaPipe
- **🗣️ Multi-language speech-to-text** with Whisper
- **🌐 Cross-platform support** (Web, Desktop, Mobile, Browser Extension)
- **⚡ Real-time phonetic correction** with sub-120ms latency
- **🔒 Privacy-first** offline operation
- **🎨 Beautiful, accessible UI** with shadcn components

## 📱 Download & Install

### Quick Install (Latest Release)
📲 **[Download QR Page](https://github.com/yourusername/phonocorrect-ai/releases/latest/download/qr.html)** - Scan QR codes for mobile apps

### Platform Downloads
| Platform | Download | Store | Requirements |
|----------|----------|-------|--------------|
| 📱 **Android** | [Download APK](https://github.com/yourusername/phonocorrect-ai/releases/latest) | [Google Play](https://play.google.com/store/apps/details?id=com.phonocorrect.ai) | Android 8.0+ |
| 📱 **iOS** | [TestFlight Beta](https://testflight.apple.com/join/YOUR_CODE) | [App Store](https://apps.apple.com/app/phonocorrect-ai/idXXXXXXXX) | iOS 14.0+ |
| 🖥️ **macOS** | [Download DMG](https://github.com/yourusername/phonocorrect-ai/releases/latest) | [Mac App Store](https://apps.apple.com/app/phonocorrect-ai/idXXXXXXXX) | macOS 10.15+ |
| 🖥️ **Windows** | [Download EXE](https://github.com/yourusername/phonocorrect-ai/releases/latest) | [Microsoft Store](https://www.microsoft.com/store/apps/9NXXXXXXXX) | Windows 10+ |
| 🖥️ **Linux** | [Download AppImage](https://github.com/yourusername/phonocorrect-ai/releases/latest) | [Snap Store](https://snapcraft.io/phonocorrect-ai) | Ubuntu 18.04+ |
| 🌐 **Chrome** | [Extension ZIP](https://github.com/yourusername/phonocorrect-ai/releases/latest) | [Chrome Web Store](https://chrome.google.com/webstore/detail/phonocorrect-ai/XXXXXXXXXXXXXXXXXXXXXXXX) | Chrome 88+ |

### 📋 Installation Instructions

#### 📱 Android APK Sideload
1. **Enable Unknown Sources**: Settings → Security → Install unknown apps
2. **Download APK** from releases page or scan QR code
3. **Install**: Tap the downloaded APK and follow prompts
4. **Grant Permissions**: Allow microphone access for speech features

#### 🖥️ Desktop Apps
- **macOS**: Mount DMG → Drag to Applications → Right-click "Open" (first time)
- **Windows**: Run installer EXE → Allow SmartScreen → Follow wizard
- **Linux**: `chmod +x *.AppImage && ./PhonoCorrect*.AppImage`

#### 🌐 Chrome Extension
1. Download and unzip extension file
2. Open `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" → Select unzipped folder

## 📁 Project Structure

```
phonocorrect-ai/
├── packages/
│   ├── common/              # Shared TypeScript utilities & logic
│   └── ml-core/             # 🆕 On-device ML inference (Gemma-2B + MediaPipe)
├── mobile/                  # React Native app (Expo)
├── desktop/                 # Electron app with React & Vite
├── web/                     # Next.js 15 web application
├── chrome-ext/              # Chrome extension (Manifest V3)
├── keyboard-ios/            # SwiftUI custom keyboard
├── keyboard-android/        # Kotlin Input Method Service
├── scripts/                 # Build and deployment scripts
└── .github/workflows/       # CI/CD pipeline
```

## 🤖 ML Core Integration

PhonoCorrect AI now includes a sophisticated on-device ML engine for enhanced phonetic correction:

### Features
- **MediaPipe LLM Inference API** for real-time text correction
- **Gemma-2B model** with 4-bit quantization (1.2GB)
- **Cross-platform bridges** for React Native, Electron, and Web
- **Fallback engine** for environments without ML support

### Architecture
```
packages/ml-core/
├── src/
│   ├── cpp/                    # Native C++ implementations
│   │   ├── mediapipe_wrapper.cpp  # MediaPipe integration
│   │   ├── gemma_bridge.cpp       # Node.js native addon
│   │   └── gemma_wasm.cpp         # WebAssembly bindings
│   ├── react-native/          # React Native TurboModule
│   ├── electron/               # Electron native addon
│   ├── web/                    # WebAssembly bridge
│   └── types.ts               # TypeScript interfaces
├── scripts/
│   └── fetch-models.ts        # Model download utility
└── tests/
    └── gemma.test.ts          # Unit tests
```

### Usage
```typescript
import { phonoCorrect, GemmaBridge } from '@phonocorrect/ml-core';

// Simple correction
const corrected = await phonoCorrect('I need my fone');
console.log(corrected); // "I need my phone"

// Advanced usage with detailed corrections
const gemma = await GemmaBridge.loadGemma();
const details = await gemma.phonoCorrectWithDetails('recieve the package');
console.log(details);
// [{ original: 'recieve', corrected: 'receive', confidence: 0.95, position: 0 }]
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 9.0+
- For mobile development: Expo CLI
- For iOS: Xcode 15+
- For Android: Android Studio

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd phonocorrect-ai

# Install dependencies for all packages
pnpm install

# Build shared packages
pnpm build:common
pnpm build:ml-core

# Download ML models (optional, for enhanced corrections)
pnpm fetch-models:all
```

### Development

```bash
# Start all development servers
pnpm dev

# Or start specific packages
pnpm dev:web        # Next.js web app
pnpm dev:desktop    # Electron app
pnpm dev:mobile     # React Native app
pnpm dev:chrome     # Chrome extension

# ML Core specific commands
pnpm --filter ml-core build      # Build native modules
pnpm --filter ml-core test       # Run ML tests
pnpm fetch-models gemma-2b-q4 web  # Download specific model
```

## 🔐 Authentication & Premium Features

### Authentication Setup

PhonoCorrect AI uses Firebase Authentication with the following providers:
- 📧 **Email/Password** - Traditional sign-up and sign-in
- 🔐 **Google OAuth** - One-click sign-in with Google

#### Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Configure your Firebase project:
```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### Premium Subscription ($5/month)

PhonoCorrect AI offers a Premium subscription tier through Stripe integration:

#### 🆓 Free Features
- ✅ Local phonetic corrections
- ✅ Basic speech-to-text
- ✅ Text-to-speech
- ✅ Custom rules (local only)
- ✅ Virtual keyboard

#### 👑 Premium Features
- ✅ **Multi-device sync** - Keep your custom rules and learning data synced across all devices
- ✅ **Advanced ML models** - Access to larger, more accurate correction models
- ✅ **Cloud inference fallback** - When device performance is limited, use cloud processing
- ✅ **Advanced analytics** - Detailed learning progress and accuracy metrics
- ✅ **Priority support** - Direct support channel for Premium users

#### Stripe Integration

The Premium subscription is managed through Stripe with the following Cloud Functions:

1. **`createCheckoutSession`** - Creates Stripe checkout session for new subscriptions
2. **`createPortalLink`** - Generates customer portal link for subscription management
3. **`handleStripeEvent`** - Webhook handler that updates user subscription status

#### Subscription Status Sync

User subscription status is automatically synced from Stripe webhooks:

- `active` - Full Premium features available
- `past_due` - Payment failed, features temporarily restricted
- `canceled` - Subscription canceled, reverted to free tier
- `free` - No active subscription

#### Cloud Sync Restrictions

Cloud sync endpoints automatically enforce Premium subscription requirements:

```typescript
// All sync operations check subscription status
const { canSync, syncToCloud } = useCloudSync();

if (canSync) {
  await syncToCloud(userData);
} else {
  // Redirect to upgrade flow
}
```

### Firebase Cloud Functions Setup

Deploy the authentication and billing functions:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set Stripe configuration
firebase functions:config:set stripe.secret_key="sk_test_..." 
firebase functions:config:set stripe.webhook_secret="whsec_..."

# Deploy functions
cd functions
npm install
firebase deploy --only functions
```

### Development with Emulators

For local development, use Firebase emulators:

```bash
# Start all emulators
firebase emulators:start

# Emulators will run on:
# - Auth: http://localhost:9099
# - Firestore: http://localhost:8080  
# - Functions: http://localhost:5001
# - UI: http://localhost:4000
```

Set `REACT_APP_FIREBASE_USE_PRODUCTION=false` to use emulators during development.

## 📦 Packages

### 🤖 packages/ml-core

On-device machine learning inference using MediaPipe and Gemma-2B for enhanced phonetic spelling correction.

**Features:**
- MediaPipe LLM Inference API integration
- Gemma-2B 4-bit quantized model (1.2GB)
- Cross-platform bridges (React Native, Electron, Web)
- Real-time phonetic correction with <120ms latency
- Offline operation with privacy-first design

**Performance Targets:**
| Device Class | Memory Usage | Latency |
|--------------|-------------|---------|
| Low-end (2GB) | ≤ 300 MB | < 120 ms |
| Mid-range (4GB) | ≤ 600 MB | < 60 ms |
| High-end (8GB+) | ≤ 1GB | < 30 ms |

### 🔧 packages/common

Shared TypeScript utilities and business logic used across all platforms.

**Features:**
- Phonetic pattern recognition (fallback engine)
- ML engine interfaces and type definitions
- Speech-to-text and text-to-speech engines
- Reusable React components
- Common utilities and types

**Scripts:**
```bash
cd packages/common
pnpm build          # Build TypeScript
pnpm dev            # Build in watch mode
pnpm test           # Run Jest tests
```

### 📱 mobile/

React Native app built with Expo bare workflow.

**Features:**
- Home screen with text input
- Real-time phonetic suggestions
- Speech-to-text integration
- Voice feedback
- Cross-platform (iOS & Android)

**Scripts:**
```bash
cd mobile
pnpm dev            # Start Expo development server
pnpm android        # Run on Android
pnpm ios            # Run on iOS
pnpm build:android  # Build Android APK
pnpm build:ios      # Build iOS IPA
```

### 🖥️ desktop/

Electron application using React and Vite, sharing UI components from common package.

**Features:**
- Native desktop experience
- File system integration
- System notifications
- Global keyboard shortcuts
- Cross-platform builds (Windows, macOS, Linux)

**Scripts:**
```bash
cd desktop
pnpm dev            # Start development with hot reload
pnpm build          # Build for production
pnpm dist           # Build and package for distribution
```

### 🌐 web/

Next.js 15 web application with the same shared UI components.

**Features:**
- Server-side rendering
- Progressive web app capabilities
- Real-time phonetic analysis
- Speech recognition (where supported)
- Responsive design

**Scripts:**
```bash
cd web
pnpm dev            # Start Next.js development server
pnpm build          # Build for production
pnpm start          # Start production server
```

### 🧩 chrome-ext/

Chrome extension with Manifest V3, built with Vite and React.

**Features:**
- Popup interface for text analysis
- Content script for webpage integration
- Context menu integration
- Real-time suggestions overlay
- Background service worker

**Structure:**
- `src/popup.tsx` - Extension popup interface
- `src/content-script.ts` - Webpage integration
- `src/background.ts` - Service worker
- `public/manifest.json` - Extension manifest

**Scripts:**
```bash
cd chrome-ext
pnpm dev            # Build in watch mode
pnpm build          # Build for production
```

**Installation:**
1. Build the extension: `pnpm build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist` folder

### 📲 keyboard-ios/

SwiftUI custom keyboard extension for iOS.

**Features:**
- Custom keyboard interface
- Real-time phonetic suggestions
- Integration with iOS text input system
- Native iOS design patterns

**Files:**
- `Sources/PhonoCorrectKeyboard/KeyboardViewController.swift` - Main keyboard logic
- `Sources/PhonoCorrectKeyboard/PhonoCorrectKeyboardApp.swift` - Container app

**Setup:**
1. Open in Xcode
2. Build and run on device/simulator
3. Go to Settings > General > Keyboard > Keyboards > Add New Keyboard
4. Select "PhonoCorrect AI"

### 🤖 keyboard-android/

Kotlin Input Method Service for Android.

**Features:**
- Custom Android keyboard
- Jetpack Compose UI
- Real-time suggestions bar
- Integration with Android input system

**Files:**
- `src/main/java/.../PhonoCorrectInputMethodService.kt` - Main IME service
- `src/main/AndroidManifest.xml` - Service registration

**Setup:**
1. Build the module: `./gradlew assembleRelease`
2. Install on Android device
3. Go to Settings > System > Languages & input > Virtual keyboard
4. Enable "PhonoCorrect AI"

## 🛠️ Development Workflow

### Building Everything

```bash
# Build all packages in the correct order
pnpm build

# Clean all build artifacts
pnpm clean

# Run all tests
pnpm test

# Lint all packages
pnpm lint

# Type check all packages
pnpm type-check
```

### Adding Dependencies

```bash
# Add to specific package
pnpm --filter web add react-query

# Add to root (development tools)
pnpm add -D -w eslint-plugin-import

# Add to common package
pnpm --filter common add lodash
```

### Creating New Packages

1. Create new directory under appropriate location
2. Add package.json with proper naming convention (`@phonocorrect-ai/package-name`)
3. Update `pnpm-workspace.yaml` if needed
4. Add build scripts and dependencies

## 🏗️ CI/CD Pipeline

GitHub Actions workflow includes:

### ✅ Testing & Quality
- ESLint linting
- TypeScript type checking
- Jest unit tests
- Cross-platform compatibility checks

### 📦 Building
- **Web Apps**: Next.js build, Chrome extension packaging
- **Desktop**: Electron builds for Windows, macOS, Linux
- **Mobile**: Android APK and iOS IPA generation
- **Keyboards**: Android AAR and iOS framework builds

### 🚀 Deployment
- Automatic releases on main branch
- Artifact uploads for all platforms
- Version tagging and release notes

### Workflow Triggers
- Push to `main` or `develop` branches
- Pull requests to `main`
- Manual workflow dispatch

## 📦 Packaging & Distribution

### 🛠️ Build Commands

#### Release All Platforms
```bash
# Build everything for release
pnpm release:all                # Build all packages + desktop dist

# Platform-specific builds
pnpm release:desktop           # Electron apps (dmg, exe, AppImage)
pnpm release:android           # EAS build for Android
pnpm release:ios              # EAS build for iOS  
pnpm package:chrome           # Package Chrome extension
```

#### Individual Platform Builds
```bash
# Desktop applications
pnpm electron-dist            # Build desktop apps for all platforms
cd desktop && pnpm dist       # Same as above, from desktop directory

# Mobile applications (requires EAS setup)
cd mobile
eas build --platform android --profile preview
eas build --platform ios --profile preview

# Chrome extension
cd chrome-ext
pnpm build
cd dist && zip -r ../phonocorrect-chrome-extension.zip .
```

### 📱 Mobile App Distribution

#### EAS Build Profiles
- **development**: Dev builds with Expo client
- **preview**: Release builds for internal testing (APK/IPA)
- **production**: Store-ready builds (AAB for Play Store)
- **internal**: Internal distribution builds

#### Android APK Sideloading
1. **Enable Developer Options**: Settings → About → Tap Build Number 7 times
2. **Enable USB Debugging**: Developer Options → USB Debugging
3. **Allow Unknown Sources**: Settings → Security → Install unknown apps
4. **Install**: `adb install PhonoCorrectAI.apk` or download QR page

#### iOS TestFlight
1. Join TestFlight beta: [testflight.apple.com/join/YOUR_CODE](https://testflight.apple.com/join/YOUR_CODE)
2. Install TestFlight app from App Store
3. Follow invite link and install beta

### 🖥️ Desktop Distribution

#### Code Signing Status
| Platform | Status | Notes |
|----------|---------|-------|
| **macOS** | ⚠️ Self-signed | Requires right-click "Open" for first launch |
| **Windows** | ⚠️ Self-signed | Windows Defender SmartScreen warning |
| **Linux** | ✅ Ready | No signing required for AppImage |

#### Distribution Formats
- **macOS**: `.dmg` (disk image) + `.zip` (portable)
- **Windows**: `.exe` (NSIS installer) + portable `.exe`
- **Linux**: `.AppImage` (portable) + `.deb` (Debian package)

### 🌐 Browser Extension

#### Chrome Web Store (TODO)
- [ ] Store listing preparation
- [ ] Privacy policy and terms
- [ ] Store review process

#### Manual Installation (Current)
1. Download `phonocorrect-chrome-extension.zip`
2. Unzip to local folder
3. Load unpacked in Chrome Developer Mode

## 🏪 Store Listings & Publication

### 📋 Store Listing Assets TODO

**High Priority Assets Needed:**
- [ ] **App Icons** (1024x1024 master) for all platforms
- [ ] **Feature Graphics** (1024x500 for Google Play)
- [ ] **Screenshots** for all platforms and screen sizes
- [ ] **Privacy Policy** and Terms of Service pages
- [ ] **Demo Videos** (30-60 seconds each platform)

**Platform-Specific Requirements:**

#### 📱 iOS App Store
- [ ] 1024x1024 app icon (no transparency)
- [ ] Screenshots for iPhone 6.7", 6.5", 5.5", iPad Pro 12.9", 11"
- [ ] App Store description (4000 chars max)
- [ ] Keywords (100 chars max)
- [ ] Privacy policy URL
- [ ] Apple Developer Account ($99/year)

#### 🤖 Google Play Store
- [ ] 512x512 app icon
- [ ] Feature graphic (1024x500)
- [ ] Screenshots for phone, 7" tablet, 10" tablet
- [ ] Store description (4000 chars max)
- [ ] Google Play Console account ($25 one-time)

#### 🌐 Chrome Web Store
- [ ] 128x128 extension icon
- [ ] Promotional images (440x280, 920x680, 1400x560)
- [ ] Screenshots (1280x800 or 640x400)
- [ ] Chrome Web Store developer account ($5 one-time)

#### 🖥️ Desktop App Stores
- [ ] **Mac App Store**: macOS app review and submission
- [ ] **Microsoft Store**: Windows app certification
- [ ] **Snap Store**: Linux package submission

### 🚀 Publication Pipeline Status

| Platform | Development | Beta Testing | Store Submission | Public Release |
|----------|-------------|--------------|------------------|----------------|
| **iOS** | ✅ Ready | 🟡 TestFlight setup needed | ❌ App Store Connect | ❌ Pending |
| **Android** | ✅ Ready | 🟡 Internal testing ready | ❌ Play Console | ❌ Pending |
| **Chrome** | ✅ Ready | ✅ Developer mode | ❌ Web Store | ❌ Pending |
| **macOS** | ✅ Ready | ✅ DMG distribution | ❌ Mac App Store | ❌ Pending |
| **Windows** | ✅ Ready | ✅ EXE distribution | ❌ Microsoft Store | ❌ Pending |
| **Linux** | ✅ Ready | ✅ AppImage ready | 🟡 Snap Store prep | ❌ Pending |

### 📝 Store Metadata

Comprehensive store metadata has been prepared in `/assets/store-listings/`:
- **iOS**: App Store Connect metadata and screenshots guide
- **Android**: Google Play Console listing requirements
- **Chrome**: Web Store description and permission justifications
- **Desktop**: Multi-store preparation and assets checklist

### 🔐 Code Signing & Certificates Status

#### Required Certificates (TODO)
- [ ] **Apple Developer Certificate** for iOS/macOS code signing
- [ ] **Windows Code Signing Certificate** for executable signing
- [ ] **Google Play Upload Key** for Android app signing

#### Current Security Status
- **Desktop apps**: Self-signed (security warnings expected)
- **Mobile apps**: Development certificates only
- **Browser extension**: Manifest V3 compliant, unpacked distribution

### 🎯 Publication Roadmap

#### Phase 1: Beta Testing (Current)
- ✅ Direct distribution via GitHub Releases
- ✅ QR code download page for easy mobile installation
- ✅ TestFlight beta preparation
- ✅ Google Play Internal Testing ready

#### Phase 2: Store Preparation
- [ ] Complete asset creation (icons, screenshots, videos)
- [ ] Privacy policy and legal pages deployment
- [ ] Store account setup and verification
- [ ] Code signing certificate acquisition

#### Phase 3: Store Submission
- [ ] iOS App Store submission and review
- [ ] Google Play Store submission and review
- [ ] Chrome Web Store publication
- [ ] Desktop app store submissions

#### Phase 4: Public Launch
- [ ] Marketing website deployment
- [ ] Press kit and announcement materials
- [ ] User documentation and support system
- [ ] Analytics and crash reporting integration

### 📊 Distribution Analytics Setup (TODO)
- [ ] Download tracking with GitHub API integration
- [ ] Crash reporting (Bugsnag/Sentry) for all platforms
- [ ] Update notifications system
- [ ] Privacy-compliant usage analytics
- [ ] Store performance monitoring

See `/assets/store-listings/README.md` for detailed asset requirements and guidelines.

### 📄 Release Artifacts

Each GitHub release includes:

| File | Platform | Description |
|------|----------|-------------|
| `PhonoCorrectAI-v1.0.0-123.dmg` | macOS | Universal binary (Intel + Apple Silicon) |
| `PhonoCorrectAI-v1.0.0-123.exe` | Windows | x64 installer with Smart Screen bypass |
| `PhonoCorrectAI-v1.0.0-123.AppImage` | Linux | Portable application bundle |
| `PhonoCorrectAI-v1.0.0-123.apk` | Android | Direct install APK for sideloading |
| `PhonoCorrectAI-v1.0.0-123.ipa` | iOS | TestFlight distribution package |
| `phonocorrect-chrome-extension.zip` | Chrome | Unpacked extension for developer mode |
| `qr.html` | All | QR code distribution page for mobile |

### 🎯 QR Code Distribution

The QR distribution page (`qr.html`) provides:
- **QR codes** for quick mobile app installation
- **Direct download links** for all platforms
- **Installation instructions** with screenshots
- **System requirements** and compatibility info
- **Security warnings** for sideload installations

Access via: `https://github.com/yourusername/phonocorrect-ai/releases/latest/download/qr.html`

### 🔐 Security Notes

#### Code Signing TODO Items
- [ ] Apple Developer Account for macOS/iOS signing
- [ ] Windows Code Signing Certificate
- [ ] Play Store and App Store publishing setup
- [ ] Chrome Web Store developer account

#### Current Security Status
- **Desktop apps**: Self-signed (security warnings expected)
- **Mobile apps**: Development certificates only
- **Browser extension**: Manifest V3 compliant, unpacked only

### 📊 Distribution Analytics (TODO)
- [ ] Download tracking with GitHub API
- [ ] Crash reporting integration (Bugsnag/Sentry)
- [ ] Update notifications system
- [ ] Usage analytics (privacy-compliant)

## 📋 Architecture

### Shared Logic
The `packages/common` package contains:
- Phonetic pattern definitions
- ML engine interfaces (mock implementations)
- Speech recognition/synthesis engines
- Reusable React components
- Utility functions and types

### Platform-Specific Features
Each platform implements:
- Native UI using platform conventions
- Platform-specific integrations (file system, notifications, etc.)
- Performance optimizations for the target environment
- Platform-specific build and distribution

### Data Flow
1. User input is captured by platform-specific UI
2. Text is analyzed using shared phonetic engine
3. Suggestions are generated and displayed
4. User feedback is recorded for learning
5. Corrections are applied and learning data is updated

## 🧪 Testing Strategy

### Unit Tests
- Common package logic
- Individual component testing
- Mock implementations for platform-specific features

### Integration Tests
- Cross-platform component compatibility
- End-to-end user workflows
- API contract testing

### Platform Tests
- Mobile app testing on simulators/devices
- Desktop app testing across operating systems
- Web app browser compatibility
- Extension testing in Chrome

## 📱 Platform Support

| Platform | Status | Features |
|----------|--------|----------|
| Web | ✅ Complete | Full feature set |
| Desktop | ✅ Complete | Native integration |
| Mobile iOS | ✅ Complete | App + Custom Keyboard |
| Mobile Android | ✅ Complete | App + IME Service |
| Chrome Extension | ✅ Complete | Popup + Content Script |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Run linting: `pnpm lint`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow conventional commit messages
- Ensure cross-platform compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by assistive technology research
- Community-driven development approach

---

**Note**: This is a demonstration project showcasing modern monorepo architecture and cross-platform development practices. The ML models and advanced features would require additional implementation in a production environment.