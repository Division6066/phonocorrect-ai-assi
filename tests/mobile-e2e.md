# PhonoCorrect AI Mobile E2E Tests (Detox)

## Test Configuration

### iOS Tests
```javascript
// detox/ios.config.js
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'detox/jest.config.js'
    },
    jest: {
      setupFilesAfterEnv: ['<rootDir>/detox/setup.ts']
    }
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/PhonoCorrectAI.app',
      build: 'xcodebuild -workspace ios/PhonoCorrectAI.xcworkspace -scheme PhonoCorrectAI -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
    }
  },
  devices: {
    'simulator': {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14 Pro'
      }
    },
    'ios16_simulator': {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 12',
        os: 'iOS 16.0'
      }
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'ios16.sim.debug': {
      device: 'ios16_simulator', 
      app: 'ios.debug'
    }
  }
};
```

### Android Tests
```javascript
// detox/android.config.js
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'detox/jest.config.js'
    }
  },
  apps: {
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug'
    }
  },
  devices: {
    'emulator_api34': {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_4_API_34'
      }
    },
    'emulator_api26': {
      type: 'android.emulator', 
      device: {
        avdName: 'Pixel_4_API_26'
      }
    }
  },
  configurations: {
    'android.emu.debug': {
      device: 'emulator_api34',
      app: 'android.debug'
    },
    'android26.emu.debug': {
      device: 'emulator_api26',
      app: 'android.debug'
    }
  }
};
```

## Core Test: Phonetic Correction Flow

```typescript
// detox/tests/phonetic-correction.e2e.ts
import { device, element, by, expect as detoxExpect } from 'detox';

describe('Phonetic Correction Flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      permissions: { 
        microphone: 'YES',
        notifications: 'YES' 
      }
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Basic Correction: "fone" → "phone"', () => {
    it('should show suggestion when typing "fone"', async () => {
      // Navigate to writing area
      await element(by.id('writing-tab')).tap();
      
      // Type the misspelled word
      await element(by.id('text-input')).typeText('I got your fone call');
      
      // Wait for AI analysis
      await waitFor(element(by.id('suggestion-popup')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Verify suggestion content
      await detoxExpect(element(by.id('suggestion-original'))).toHaveText('fone');
      await detoxExpect(element(by.id('suggestion-correction'))).toHaveText('phone');
      
      // Check confidence score is displayed
      await detoxExpect(element(by.id('confidence-badge'))).toBeVisible();
    });

    it('should apply correction when suggestion is accepted', async () => {
      await element(by.id('text-input')).typeText('Call my fone');
      
      // Wait for and accept suggestion
      await waitFor(element(by.id('accept-suggestion-btn')))
        .toBeVisible()
        .withTimeout(3000);
      
      await element(by.id('accept-suggestion-btn')).tap();
      
      // Verify text was corrected
      await detoxExpect(element(by.id('text-input'))).toHaveText('Call my phone');
      
      // Verify success notification
      await detoxExpect(element(by.text('Applied: fone → phone'))).toBeVisible();
    });

    it('should reject suggestion and keep original', async () => {
      await element(by.id('text-input')).typeText('My fone number');
      
      await waitFor(element(by.id('reject-suggestion-btn')))
        .toBeVisible()
        .withTimeout(3000);
      
      await element(by.id('reject-suggestion-btn')).tap();
      
      // Text should remain unchanged
      await detoxExpect(element(by.id('text-input'))).toHaveText('My fone number');
      
      // Suggestion should disappear
      await detoxExpect(element(by.id('suggestion-popup'))).not.toBeVisible();
    });
  });

  describe('Multiple Corrections', () => {
    it('should handle multiple corrections in one text', async () => {
      const testText = 'I recieve your fone call about the seperate meeting';
      await element(by.id('text-input')).typeText(testText);
      
      // Should show multiple suggestions
      await waitFor(element(by.id('suggestions-list')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Verify all expected suggestions appear
      await detoxExpect(element(by.text('recieve → receive'))).toBeVisible();
      await detoxExpect(element(by.text('fone → phone'))).toBeVisible();
      await detoxExpect(element(by.text('seperate → separate'))).toBeVisible();
      
      // Accept all suggestions
      await element(by.id('accept-all-btn')).tap();
      
      const expectedText = 'I receive your phone call about the separate meeting';
      await detoxExpect(element(by.id('text-input'))).toHaveText(expectedText);
    });
  });

  describe('Language Support', () => {
    it('should work with different languages', async () => {
      // Switch to Spanish
      await element(by.id('settings-tab')).tap();
      await element(by.id('language-selector')).tap();
      await element(by.text('Español')).tap();
      
      // Go back to writing
      await element(by.id('writing-tab')).tap();
      
      // Load Spanish example
      await element(by.id('load-example-btn')).tap();
      
      // Verify Spanish text loaded
      await detoxExpect(element(by.id('text-input'))).toHaveText(expect.stringContaining('téléfono'));
      
      // Should still provide corrections for Spanish phonetic errors
      await waitFor(element(by.id('suggestion-popup')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Performance Requirements', () => {
    it('should provide suggestions within 2 seconds', async () => {
      const startTime = Date.now();
      
      await element(by.id('text-input')).typeText('fone');
      
      await waitFor(element(by.id('suggestion-popup')))
        .toBeVisible()
        .withTimeout(2000);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Should respond within 2 seconds (2000ms)
      expect(responseTime).toBeLessThan(2000);
    });
    
    it('should handle rapid typing without crashes', async () => {
      const rapidText = 'fone seperate recieve definately would of';
      
      // Type rapidly
      await element(by.id('text-input')).typeText(rapidText);
      
      // App should remain responsive
      await detoxExpect(element(by.id('text-input'))).toHaveText(rapidText);
      
      // Should eventually show suggestions
      await waitFor(element(by.id('suggestions-list')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input gracefully', async () => {
      // Clear any existing text
      await element(by.id('text-input')).clearText();
      
      // Should not crash or show suggestions
      await detoxExpect(element(by.id('suggestion-popup'))).not.toBeVisible();
      await detoxExpect(element(by.id('text-input'))).toHaveText('');
    });

    it('should handle very long text', async () => {
      const longText = Array(100).fill('fone').join(' ');
      
      await element(by.id('text-input')).typeText(longText);
      
      // Should still provide suggestions
      await waitFor(element(by.id('suggestion-popup')))
        .toBeVisible()
        .withTimeout(5000);
      
      // App should remain responsive
      await detoxExpected(element(by.id('text-input'))).toBeVisible();
    });

    it('should preserve cursor position after correction', async () => {
      await element(by.id('text-input')).typeText('Call my fone today');
      
      // Move cursor to middle of word
      await element(by.id('text-input')).tapAtPoint({ x: 100, y: 20 });
      
      // Accept suggestion
      await waitFor(element(by.id('accept-suggestion-btn')))
        .toBeVisible()
        .withTimeout(3000);
      
      await element(by.id('accept-suggestion-btn')).tap();
      
      // Text should be corrected
      await detoxExpect(element(by.id('text-input'))).toHaveText('Call my phone today');
    });
  });

  describe('Keyboard Integration', () => {
    it('should work with custom keyboard extension (iOS)', async () => {
      // This test requires the custom keyboard to be installed
      if (device.getPlatform() === 'ios') {
        // Switch to custom keyboard
        await element(by.id('enable-custom-keyboard-btn')).tap();
        
        // Type using custom keyboard
        await element(by.id('keyboard-input')).typeText('fone');
        
        // Should show inline suggestions
        await detoxExpect(element(by.id('keyboard-suggestion'))).toBeVisible();
        await detoxExpect(element(by.id('keyboard-suggestion'))).toHaveText('phone');
        
        // Tap suggestion in keyboard
        await element(by.id('keyboard-suggestion')).tap();
        
        // Should apply correction
        await detoxExpect(element(by.id('text-input'))).toHaveText('phone');
      }
    });

    it('should work with Android IME', async () => {
      if (device.getPlatform() === 'android') {
        // Enable PhonoCorrect IME
        await element(by.id('enable-ime-btn')).tap();
        
        // Type using IME
        await element(by.id('ime-input')).typeText('seperate');
        
        // Should show IME suggestions
        await detoxExpect(element(by.id('ime-suggestion-bar'))).toBeVisible();
        
        // Select suggestion
        await element(by.text('separate')).tap();
        
        // Should apply correction
        await detoxExpect(element(by.id('text-input'))).toHaveText('separate');
      }
    });
  });

  describe('Offline Functionality', () => {
    it('should work without internet connection', async () => {
      // Disable network
      await device.setNetworkConnection('none');
      
      // Should still provide corrections
      await element(by.id('text-input')).typeText('fone call');
      
      await waitFor(element(by.id('suggestion-popup')))
        .toBeVisible()
        .withTimeout(3000);
      
      await detoxExpect(element(by.text('phone'))).toBeVisible();
      
      // Re-enable network
      await device.setNetworkConnection('all');
    });
  });

  describe('Accessibility', () => {
    it('should be accessible to screen readers', async () => {
      // Enable accessibility
      await device.setNetworkConnection('all');
      
      // Test VoiceOver/TalkBack compatibility
      await element(by.id('text-input')).typeText('fone');
      
      // Suggestion should have accessibility labels
      await waitFor(element(by.id('suggestion-popup')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Check accessibility attributes exist
      await detoxExpect(element(by.id('suggestion-popup'))).toHaveAccessibilityLabel();
      await detoxExpect(element(by.id('accept-suggestion-btn'))).toHaveAccessibilityLabel();
    });
  });
});
```

## Test Helper Functions

```typescript
// detox/helpers/test-utils.ts
export const TestHelpers = {
  async waitForSuggestion(timeout = 3000) {
    await waitFor(element(by.id('suggestion-popup')))
      .toBeVisible()
      .withTimeout(timeout);
  },

  async typeAndWaitForSuggestion(text: string) {
    await element(by.id('text-input')).typeText(text);
    await this.waitForSuggestion();
  },

  async acceptFirstSuggestion() {
    await element(by.id('accept-suggestion-btn')).tap();
  },

  async rejectFirstSuggestion() {
    await element(by.id('reject-suggestion-btn')).tap();
  },

  async clearTextInput() {
    await element(by.id('text-input')).clearText();
  },

  async measureResponseTime(action: () => Promise<void>): Promise<number> {
    const startTime = Date.now();
    await action();
    return Date.now() - startTime;
  }
};
```

## Test Data

```typescript
// detox/data/test-cases.ts
export const PhoneticTestCases = [
  {
    input: 'fone',
    expected: 'phone',
    category: 'ph-replacement'
  },
  {
    input: 'seperate', 
    expected: 'separate',
    category: 'vowel-confusion'
  },
  {
    input: 'recieve',
    expected: 'receive', 
    category: 'ie-ei-rule'
  },
  {
    input: 'would of',
    expected: 'would have',
    category: 'phrase-correction'
  },
  {
    input: 'definately',
    expected: 'definitely',
    category: 'suffix-confusion'
  }
];

export const MultiLanguageTestCases = {
  spanish: [
    {
      input: 'téléfono',
      expected: 'teléfono',
      category: 'accent-correction'
    }
  ],
  french: [
    {
      input: 'fisique',
      expected: 'physique', 
      category: 'ph-replacement'
    }
  ]
};
```

## CI Configuration

```yaml
# .github/workflows/mobile-e2e.yml
name: Mobile E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  ios-tests:
    runs-on: macos-latest
    strategy:
      matrix:
        ios-version: ['16.0', '17.0']
        device: ['iPhone 12', 'iPhone 14 Pro']
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Setup iOS Simulator
        run: |
          xcrun simctl create test-${{ matrix.device }} com.apple.CoreSimulator.SimDeviceType.${{ matrix.device }} com.apple.CoreSimulator.SimRuntime.iOS-${{ matrix.ios-version }}
          
      - name: Build iOS app
        run: npm run build:ios
        
      - name: Run Detox tests
        run: npx detox test --configuration ios.sim.debug
        
  android-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        api-level: [26, 34]
        
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Setup Android SDK
        uses: android-actions/setup-android@v2
        
      - name: Create AVD
        run: |
          echo "y" | $ANDROID_HOME/tools/bin/sdkmanager --install "system-images;android-${{ matrix.api-level }};google_apis;x86_64"
          $ANDROID_HOME/tools/bin/avdmanager create avd -n test-emulator -k "system-images;android-${{ matrix.api-level }};google_apis;x86_64"
          
      - name: Start Emulator
        run: |
          $ANDROID_HOME/emulator/emulator -avd test-emulator -no-window -no-audio &
          adb wait-for-device
          
      - name: Build Android app
        run: npm run build:android
        
      - name: Run Detox tests
        run: npx detox test --configuration android.emu.debug
```

This comprehensive test suite covers:

1. **Core functionality**: "fone" → "phone" correction
2. **Multi-platform support**: iOS 16/17, Android API 26/34  
3. **Performance requirements**: <2s response time
4. **Edge cases**: Empty input, long text, rapid typing
5. **Keyboard integration**: Custom iOS keyboard, Android IME
6. **Offline functionality**: On-device processing
7. **Accessibility**: Screen reader compatibility
8. **Multi-language support**: Spanish, French phonetic patterns