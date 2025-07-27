# PhonoCorrect AI - Multi-Language Phonetic Spelling Assistant

A comprehensive writing assistant with speech-to-text, virtual keyboard, and intelligent phonetic correction capabilities. Available as both a web application and desktop app with multi-language support.

## 🌟 Key Features

### 📝 Phonetic Spelling Correction
- Real-time intelligent suggestions for phonetic spelling patterns
- Learning system that adapts to your preferences
- Confidence indicators for each suggestion

### 🎤 Multi-Language Speech-to-Text
- Support for 25+ languages including English, Spanish, French, German, Russian, Japanese, Arabic, and more
- Real-time transcription with interim and final results
- Auto-stop after periods of silence
- Confidence scoring for speech recognition

### ⌨️ Virtual Keyboard
- Multi-language keyboard layouts (QWERTY, AZERTY, Cyrillic, Arabic, Hiragana, etc.)
- Full keyboard functionality including special keys and navigation
- Touch-friendly design with visual feedback
- Seamless integration with text input

### 🖥️ Desktop Application
- Native Electron app for Windows, macOS, and Linux
- Global keyboard shortcuts for quick access
- File operations (save/open documents)
- System tray integration
- Native menus and OS integration

### 🔊 Text-to-Speech
- Natural voice synthesis for proofreading
- Playback controls (play, pause, stop)
- Accessibility-optimized speech settings

## 🚀 Getting Started

### Web Application
1. Open your browser and navigate to the application
2. Start typing in the main text area
3. Use the toolbar buttons to enable speech-to-text or virtual keyboard
4. Accept or reject suggestions to train the system

### Desktop Application

#### Development
```bash
# Install dependencies
npm install

# Run in development mode (web + Electron)
npm run electron-dev

# Run Electron only (requires built web app)
npm run electron
```

#### Building for Distribution
```bash
# Build for all platforms
npm run electron-dist

# Build and publish
npm run electron-build
```

## 🎯 Usage Guide

### Speech-to-Text
1. Click the microphone button or use the global shortcut
2. Select your preferred language from the dropdown
3. Click "Start Listening" and speak clearly
4. The system will show interim results as you speak
5. Final transcription appears after you stop speaking or pause for 3 seconds

**Supported Languages:**
- English (US/UK)
- Spanish (Spain/Mexico)
- French, German, Italian
- Portuguese (Brazil/Portugal)
- Russian, Japanese, Korean
- Chinese (Simplified/Traditional)
- Arabic, Hindi, Hebrew
- Dutch, Swedish, Danish, Norwegian, Finnish
- Polish, Turkish, Thai, Vietnamese

### Virtual Keyboard
1. Click the keyboard button to show/hide the virtual keyboard
2. Select your desired language layout
3. Use Shift for single uppercase letters
4. Use Caps Lock for continuous uppercase
5. Toggle SYM for symbols and special characters
6. Arrow keys for navigation

**Supported Layouts:**
- QWERTY (English)
- AZERTY (French)
- QWERTZ (German)
- Cyrillic (Russian)
- Arabic script
- Hiragana (Japanese)
- And more...

### Phonetic Correction
The system automatically analyzes your text and suggests corrections for common phonetic patterns:
- "fone" → "phone"
- "seperate" → "separate"
- "recieve" → "receive"
- "would of" → "would have"

Accept suggestions to improve the system's accuracy for your writing style.

### Desktop Features

#### Keyboard Shortcuts
- `Ctrl+Shift+D` (Windows/Linux) / `Cmd+Shift+D` (macOS): Start dictation
- `Ctrl+Shift+K` / `Cmd+Shift+K`: Toggle virtual keyboard
- `Ctrl+S` / `Cmd+S`: Save document
- `Ctrl+O` / `Cmd+O`: Open document
- `Ctrl+N` / `Cmd+N`: New document

#### File Operations
- Save your work as text files
- Open existing documents
- Auto-recovery for unsaved changes

#### System Integration
- System tray for quick access
- Native notifications
- Always-on-top window mode
- Minimize to tray functionality

## 🛠️ Technical Details

### Architecture
- **Frontend**: React 19 with TypeScript
- **Desktop**: Electron with native OS APIs
- **Speech Processing**: Web Speech API
- **Styling**: Tailwind CSS with Shadcn/ui components
- **Build System**: Vite

### Browser Compatibility
- Chrome/Edge 80+
- Firefox 85+
- Safari 14+
- Requires microphone permissions for speech features

### System Requirements
- **Desktop**: Windows 10+, macOS 10.15+, or modern Linux
- **Memory**: 4GB RAM recommended
- **Storage**: 200MB free space

## 🔒 Privacy & Security

- All speech processing happens locally in your browser/desktop app
- No audio data is transmitted to external servers
- User preferences and learning data stored locally
- Optional cloud sync for premium features (future)

## 🤝 Accessibility

- WCAG AA compliant color contrast
- Full keyboard navigation support
- Screen reader compatibility
- Dyslexia-friendly typography (Inter font)
- Large touch targets for motor accessibility
- Multi-modal input options

## 🐛 Troubleshooting

### Speech Recognition Issues
- **No speech detected**: Check microphone permissions and speak closer to the device
- **Language not supported**: Verify the selected language is in the supported list
- **Poor accuracy**: Ensure you're in a quiet environment and speaking clearly

### Virtual Keyboard Issues
- **Keys not responding**: Ensure the target text area is focused
- **Wrong characters**: Verify the correct language layout is selected
- **Layout missing**: Some browsers may not support all keyboard layouts

### Desktop App Issues
- **App won't start**: Run `npm run electron` to see error details
- **Global shortcuts not working**: Check if other applications are using the same shortcuts
- **File operations failing**: Verify file permissions and disk space

## 📈 Future Enhancements

- Offline speech recognition models
- Custom vocabulary and corrections
- Integration with popular writing apps
- Mobile application (React Native)
- Advanced grammar checking
- Team collaboration features

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🙋‍♀️ Support

For issues, feature requests, or questions:
1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with detailed information
4. Include system info, browser version, and steps to reproduce

---

Built with ❤️ for accessibility and inclusive writing support.