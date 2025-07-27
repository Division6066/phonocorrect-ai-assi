# 🧠 PhonoCorrect AI - Monorepo

A comprehensive phonetic spelling assistant that helps users write with confidence across all platforms. PhonoCorrect AI provides intelligent suggestions based on how words sound, not just how they're spelled.

## ✨ Features

- **🎯 On-device ML inference** with Gemma-2B and MediaPipe
- **🗣️ Multi-language speech-to-text** with Whisper
- **🌐 Cross-platform support** (Web, Desktop, Mobile, Browser Extension)
- **⚡ Real-time phonetic correction** with sub-120ms latency
- **🔒 Privacy-first** offline operation
- **🎨 Beautiful, accessible UI** with shadcn components

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