# Chrome Web Store Metadata

## Extension Information

**Name:** PhonoCorrect AI
**Short Description:** AI-powered phonetic spelling assistant for dyslexic and ADHD users
**Category:** Productivity
**Language:** English (with multilingual support)

## Detailed Description

Transform your web writing experience with PhonoCorrect AI - the intelligent browser extension designed specifically for users with dyslexia and ADHD.

**🧠 Smart Phonetic Understanding**
Unlike traditional spell checkers, PhonoCorrect AI understands how you naturally think and spell. When you write "fone" instead of "phone" or "seperate" instead of "separate," our AI recognizes these phonetic patterns and offers intelligent corrections.

**🌐 Works Everywhere Online**
Seamlessly integrates with all websites - social media, email, forms, documents, and more. Type confidently knowing intelligent assistance is always available.

**🔒 Privacy-First Design**
All processing happens locally in your browser. Your writing never leaves your device, ensuring complete privacy and security.

**✨ Key Features:**
• Real-time phonetic spell checking across all websites
• Confidence-scored suggestions with explanations
• Supports 7 languages with native phonetic patterns
• Custom phonetic rule creation and management
• Visual highlight system for easy error identification
• Keyboard shortcuts for quick corrections
• Dark mode and accessibility-focused design
• Works offline after initial setup

**🎯 Built for Neurodiversity**
Every feature is designed with neurodiversity in mind. Clear visual indicators, customizable feedback, and patient assistance make web browsing and writing more accessible.

**⚡ Lightweight & Fast**
Optimized for performance with minimal impact on browsing speed or memory usage.

**🔧 Easy Setup**
Install and start using immediately - no account required, no complex configuration.

Perfect for students, professionals, and anyone who wants to communicate more effectively online despite spelling challenges.

## Store Listing Details

### Screenshots (1280x800 or 640x400)
1. **Gmail Integration** - "Smart corrections in your email as you type"
2. **Social Media** - "Confident posting on Twitter, Facebook, and more"  
3. **Form Filling** - "Error-free form completion with AI assistance"
4. **Settings Panel** - "Customize your experience with multiple languages"
5. **Suggestion Interface** - "Clear, confidence-scored correction suggestions"

### Promotional Images
- **Small Promo Tile:** 440x280 pixels
- **Large Promo Tile:** 920x680 pixels  
- **Marquee Promo Tile:** 1400x560 pixels

### Icon Requirements
- **128x128 Icon:** Main extension icon
- **48x48 Icon:** Toolbar icon
- **16x16 Icon:** Favicon

## Technical Information

### Manifest V3 Permissions
```json
{
  "permissions": [
    "activeTab",
    "storage",
    "scripting"
  ],
  "optional_permissions": [
    "notifications"
  ],
  "host_permissions": [
    "<all_urls>"
  ]
}
```

### Permission Justifications

**activeTab**
Required to inject the phonetic correction interface into web pages where the user is actively typing.

**storage**
Used to save user preferences, custom phonetic rules, and language settings locally in the browser.

**scripting**
Necessary to run the AI correction engine and inject correction suggestions into text fields across websites.

**notifications (optional)**
Allows users to receive helpful tips and correction statistics if they choose to enable notifications.

**host_permissions: <all_urls>**
Enables the extension to provide spelling assistance across all websites. The extension only activates when users are typing in text fields and does not collect or transmit any personal data.

### Privacy Practices

**Data Collection:** None
- No personal information collected
- No typing data transmitted  
- No usage analytics sent to external servers
- All processing happens locally

**Data Usage:** Local only
- User preferences stored locally in browser
- Custom correction rules saved in local storage
- No data shared with third parties

**Data Storage:** Browser local storage only
- Settings and preferences: Local storage
- Custom rules: Local storage
- AI models: Extension package

## Marketing Information

### Target Audience
- Students with dyslexia or ADHD
- Professionals who struggle with spelling
- ESL learners
- Anyone seeking better writing confidence online
- Accessibility advocates
- Neurodiversity community

### Keywords/Tags
dyslexia, ADHD, spelling, accessibility, assistive technology, phonetic, autocorrect, writing assistance, neurodiversity, grammar, education, productivity

### Competitive Advantages
- Specifically designed for phonetic spelling patterns
- Complete privacy with local processing
- Works across all websites seamlessly
- Multi-language phonetic understanding
- No subscription or account required
- Accessibility-first design approach

## Publisher Information

**Publisher:** PhonoCorrect AI Team
**Website:** https://phonocorrect.ai
**Support Email:** support@phonocorrect.ai  
**Privacy Policy:** https://phonocorrect.ai/privacy-extension

## Version Information

### Current Version Features
- Phonetic correction engine
- Multi-language support (7 languages)
- Custom rule creation
- Dark/light theme support
- Keyboard shortcuts
- Accessibility features

### Upcoming Features (Roadmap)
- Voice-to-text integration
- Advanced grammar suggestions
- Team collaboration features
- Additional language support
- Integration with popular writing tools

## Review Guidelines Compliance

### Content Policy Compliance
- No prohibited content
- Appropriate for all audiences
- Educational and assistive purpose
- No deceptive practices
- Clear functionality description

### Technical Requirements Met
- Manifest V3 compliant
- Single purpose functionality
- Minimal permissions requested
- Clear permission justifications
- No obfuscated code
- Performance optimized

### User Experience Standards
- Clear value proposition
- Intuitive interface design
- Consistent with Chrome's design principles
- Accessible to users with disabilities
- Responsive design for all screen sizes