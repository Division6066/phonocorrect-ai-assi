# PhonoCorrect AI - Web Demo

Build a web-based phonetic spelling correction tool that helps dyslexic and ADHD users write more confidently by providing intelligent, real-time spelling suggestions based on phonetic patterns.

**Experience Qualities**: 
1. **Assistive** - Provides gentle, helpful corrections without judgment or interruption
2. **Intuitive** - Works seamlessly like familiar tools (Grammarly) with minimal learning curve  
3. **Empowering** - Builds confidence through positive reinforcement and learning adaptation

**Complexity Level**: Light Application (multiple features with basic state)
- Demonstrates phonetic correction algorithms, learning patterns, and user preferences in a focused web interface

## Essential Features

### Real-time Phonetic Correction
- **Functionality**: Analyzes text as user types and suggests corrections for phonetically similar misspellings
- **Purpose**: Reduces friction for users who struggle with traditional spelling by understanding their phonetic logic
- **Trigger**: User types in the main text area
- **Progression**: Type text → Algorithm detects potential phonetic misspellings → Suggestions appear below word → Click to accept → Text updates seamlessly
- **Success criteria**: Correctly identifies and suggests fixes for common phonetic patterns (ph→f, tion→shun, etc.)

### Learning Pattern Recognition  
- **Functionality**: Tracks user's accepted/rejected suggestions to improve future recommendations
- **Purpose**: Personalizes the experience and reduces false positives over time
- **Trigger**: User accepts or rejects a suggestion
- **Progression**: Suggestion appears → User accepts/rejects → System records preference → Future similar patterns weighted accordingly
- **Success criteria**: Shows improvement in suggestion accuracy after 10+ interactions

### Word Confidence Scoring
- **Functionality**: Displays visual confidence indicators for suggestions and highlights uncertain spellings
- **Purpose**: Helps users understand when to trust suggestions and when to double-check
- **Trigger**: Text analysis detects potential issues
- **Progression**: Text entered → Confidence analysis → Visual indicators appear → User can hover for details
- **Success criteria**: Confidence scores correlate with actual spelling accuracy >80%

### Text-to-Speech Integration
- **Functionality**: Reads back corrected text to help users verify their intended meaning
- **Purpose**: Provides audio feedback to confirm corrections match user intent
- **Trigger**: User clicks "Read Aloud" button or selects text
- **Progression**: User requests audio → Text processed through speech synthesis → Audio plays with highlighting
- **Success criteria**: Clear, natural-sounding speech that helps users catch meaning errors

## Edge Case Handling

- **Empty Input**: Show helpful placeholder text with example phonetic patterns
- **Very Long Text**: Process in chunks to maintain performance, show progress indicator
- **Ambiguous Corrections**: Present multiple options with confidence scores
- **Network Failure**: Core phonetic algorithms work offline, graceful degradation for advanced features
- **Rapid Typing**: Debounce analysis to avoid overwhelming user with suggestions

## Design Direction

The interface should feel supportive and encouraging, like a helpful writing companion rather than a clinical correction tool. Clean, calming design with gentle animations that celebrate progress without being distracting.

## Color Selection

Complementary (opposite colors) - Using warm and cool tones to create visual distinction between original text and suggestions while maintaining readability.

- **Primary Color**: Soft teal (oklch(0.7 0.12 185)) - Communicates trust, calm, and reliability
- **Secondary Colors**: Warm gray (oklch(0.65 0.02 45)) for UI elements and light backgrounds
- **Accent Color**: Warm orange (oklch(0.75 0.15 45)) for positive feedback, accepted suggestions, and call-to-action elements
- **Foreground/Background Pairings**: 
  - Background (White oklch(1 0 0)): Dark gray text (oklch(0.2 0 0)) - Ratio 16.0:1 ✓
  - Card (Light gray oklch(0.98 0.005 45)): Dark gray text (oklch(0.2 0 0)) - Ratio 15.2:1 ✓  
  - Primary (Soft teal oklch(0.7 0.12 185)): White text (oklch(1 0 0)) - Ratio 4.8:1 ✓
  - Accent (Warm orange oklch(0.75 0.15 45)): White text (oklch(1 0 0)) - Ratio 5.1:1 ✓

## Font Selection

Typography should feel friendly and highly legible, supporting users who may have reading difficulties. Use clear, open letterforms with generous spacing.

- **Typographic Hierarchy**: 
  - H1 (App Title): Inter Bold/32px/tight letter spacing
  - H2 (Section Headers): Inter SemiBold/24px/normal spacing  
  - Body (Main Text): Inter Regular/16px/relaxed line height (1.6)
  - Suggestions: Inter Medium/14px/normal spacing
  - Help Text: Inter Regular/14px/muted color

## Animations

Gentle, purposeful motion that guides attention without causing distraction or anxiety. Focus on micro-interactions that provide feedback and celebrate user success.

- **Purposeful Meaning**: Subtle slide-in animations for suggestions feel helpful rather than jarring; gentle pulse for accepted corrections provides positive reinforcement
- **Hierarchy of Movement**: Text corrections get priority animation focus, secondary animations for UI feedback, minimal motion for decorative elements

## Component Selection

- **Components**: 
  - Textarea (shadcn) for main text input with custom suggestion overlays
  - Card (shadcn) for suggestion panels and help sections
  - Button (shadcn) for suggestion acceptance and controls
  - Badge (shadcn) for confidence indicators and word tags
  - Progress (shadcn) for processing feedback
  - Tooltip (shadcn) for help text and explanations

- **Customizations**: 
  - Custom suggestion overlay component that positions relative to text
  - Text highlighting component for phonetic pattern visualization
  - Confidence meter component with color-coded scoring

- **States**: 
  - Buttons: Default, hover (subtle lift), active (gentle press), disabled (faded)
  - Text areas: Focus (soft teal border), error (warm orange border), success (gentle green tint)
  - Suggestions: Default, hover (slight scale), accepted (fade out with checkmark)

- **Icon Selection**: 
  - Phosphor icons for clean, friendly interface
  - Play/Pause for audio controls
  - Check/X for suggestion acceptance/rejection
  - Lightbulb for tips and help
  - Settings gear for preferences

- **Spacing**: 
  - Consistent 4px grid system (space-1 to space-8)
  - Generous padding on cards (space-6)
  - Comfortable line spacing for text (leading-relaxed)

- **Mobile**: 
  - Stack suggestion cards vertically on mobile
  - Larger touch targets for suggestion buttons (min 44px)
  - Collapsible help sections to save screen space
  - Responsive text sizing for readability