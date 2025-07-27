#!/usr/bin/env tsx
/**
 * Android Keystore Setup Script
 * Generates keystore for Android app signing and provides Google Play service account setup
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import crypto from 'crypto';

interface KeystoreConfig {
  alias: string;
  keystore: string;
  storePassword: string;
  keyPassword: string;
  validity: number;
  keysize: number;
  keyalg: string;
  dname: string;
}

interface ServiceAccountInfo {
  type: string;
  project_id: string;
  private_key_id: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
}

class AndroidKeystoreSetup {
  private keystoreDir: string;
  private configDir: string;

  constructor() {
    this.keystoreDir = path.join(process.cwd(), 'android', 'keystores');
    this.configDir = path.join(process.cwd(), 'android', 'config');
    
    // Ensure directories exist
    fs.mkdirSync(this.keystoreDir, { recursive: true });
    fs.mkdirSync(this.configDir, { recursive: true });
  }

  /**
   * Generate a secure password
   */
  private generateSecurePassword(length: number = 32): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  /**
   * Generate keystore configuration
   */
  private generateKeystoreConfig(): KeystoreConfig {
    const appName = 'phonocorrectai';
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    return {
      alias: `${appName}-key-alias`,
      keystore: `${appName}-release-key-${timestamp}.keystore`,
      storePassword: this.generateSecurePassword(),
      keyPassword: this.generateSecurePassword(),
      validity: 10000, // ~27 years
      keysize: 2048,
      keyalg: 'RSA',
      dname: 'CN=PhonoCorrect AI, OU=Development, O=PhonoCorrect AI, L=San Francisco, ST=CA, C=US'
    };
  }

  /**
   * Generate Android keystore
   */
  public generateKeystore(): KeystoreConfig {
    const config = this.generateKeystoreConfig();
    const keystorePath = path.join(this.keystoreDir, config.keystore);

    console.log('🔐 Generating Android keystore...');
    console.log(`📁 Keystore location: ${keystorePath}`);

    // Check if keytool is available
    try {
      execSync('keytool -help', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('keytool not found. Please install Java JDK 8 or higher.');
    }

    // Generate keystore
    const keytoolCommand = [
      'keytool',
      '-genkey',
      '-v',
      `-keystore "${keystorePath}"`,
      `-alias "${config.alias}"`,
      `-keyalg ${config.keyalg}`,
      `-keysize ${config.keysize}`,
      `-validity ${config.validity}`,
      `-storepass "${config.storePassword}"`,
      `-keypass "${config.keyPassword}"`,
      `-dname "${config.dname}"`
    ].join(' ');

    try {
      execSync(keytoolCommand, { stdio: 'pipe' });
      console.log('✅ Keystore generated successfully!');
    } catch (error) {
      throw new Error(`Failed to generate keystore: ${error}`);
    }

    // Save configuration securely
    this.saveKeystoreConfig(config);
    
    return config;
  }

  /**
   * Save keystore configuration
   */
  private saveKeystoreConfig(config: KeystoreConfig): void {
    const configPath = path.join(this.configDir, 'keystore.json');
    
    // Save configuration (without passwords for security)
    const publicConfig = {
      alias: config.alias,
      keystore: config.keystore,
      validity: config.validity,
      keysize: config.keysize,
      keyalg: config.keyalg,
      dname: config.dname,
      created: new Date().toISOString()
    };

    fs.writeFileSync(configPath, JSON.stringify(publicConfig, null, 2));

    // Save environment template
    const envTemplatePath = path.join(this.configDir, 'android-signing.env.template');
    const envTemplate = `# Android Signing Configuration
# Copy to .env and fill in the actual values
# NEVER commit actual passwords to version control!

ANDROID_KEYSTORE_PATH=${config.keystore}
ANDROID_KEY_ALIAS=${config.alias}
ANDROID_STORE_PASSWORD=${config.storePassword}
ANDROID_KEY_PASSWORD=${config.keyPassword}

# Base64 encoded keystore for CI/CD
# Generate with: base64 -i ${config.keystore} | tr -d '\\n'
ANDROID_KEYSTORE_BASE64=

# Upload key fingerprint (get with: keytool -list -v -keystore ${config.keystore})
ANDROID_KEY_FINGERPRINT=
`;

    fs.writeFileSync(envTemplatePath, envTemplate);
    console.log('📝 Configuration saved to:', configPath);
    console.log('📝 Environment template saved to:', envTemplatePath);
  }

  /**
   * Generate Google Play service account setup instructions
   */
  public generatePlayConsoleSetup(): void {
    const setupPath = path.join(this.configDir, 'google-play-setup.md');
    
    const setupInstructions = `# Google Play Console Service Account Setup

## 1. Create Google Play Console Account

1. Visit [Google Play Console](https://play.google.com/console)
2. Pay the $25 one-time registration fee
3. Complete developer profile and verification

## 2. Create Service Account

1. Go to **Setup** → **API Access** in Play Console
2. Click **Create Service Account**
3. Follow the link to Google Cloud Console
4. Create a new service account:
   - Name: \`phonocorrectai-play-publisher\`
   - Description: \`Service account for automated Google Play publishing\`
5. Grant the service account the **Service Account User** role
6. Create and download the JSON key file

## 3. Grant Permissions in Play Console

1. Return to Play Console → **Setup** → **API Access**
2. Find your service account and click **Grant Access**
3. Grant the following permissions:
   - **Release manager**: Upload and release to production, testing tracks
   - **Release manager**: Manage testing tracks and edit store listing

## 4. Configure CI/CD

Add these secrets to your GitHub repository:

\`\`\`bash
# Base64 encode the service account JSON
base64 -i service-account-key.json | tr -d '\\n'
\`\`\`

GitHub Secrets to add:
- \`GOOGLE_PLAY_SERVICE_ACCOUNT_JSON\`: Base64 encoded service account JSON
- \`ANDROID_KEYSTORE_BASE64\`: Base64 encoded keystore file
- \`ANDROID_STORE_PASSWORD\`: Keystore password
- \`ANDROID_KEY_PASSWORD\`: Key password
- \`ANDROID_KEY_ALIAS\`: Key alias

## 5. Upload Key Setup (Recommended)

For enhanced security, use Play App Signing:

1. In Play Console, go to **Setup** → **App Signing**
2. Follow instructions to upload your upload key
3. Google Play will manage the app signing key

## 6. Testing

1. Build a signed APK/AAB
2. Upload to Internal Testing track
3. Verify the upload and signing process

## Security Notes

- Never commit service account JSON or keystore files to version control
- Store all sensitive data in encrypted environment variables
- Regularly rotate service account keys (recommended annually)
- Use upload keys instead of app signing keys when possible
- Enable 2FA on all Google accounts

## Troubleshooting

### Common Issues:

1. **"The Android App Bundle was not signed"**
   - Verify keystore path and passwords are correct
   - Ensure the build process is using the correct signing configuration

2. **"Service account does not have permission"**
   - Check that the service account has the correct permissions in Play Console
   - Verify the service account is linked to the correct Google Cloud project

3. **"Upload key fingerprint mismatch"**
   - Ensure you're using the same keystore that was registered with Play Console
   - If this is a new app, register the upload key fingerprint first

## Next Steps

1. Configure fastlane for automated deployment
2. Set up automated testing pipeline
3. Configure release tracks (internal → alpha → beta → production)
4. Set up crash reporting and analytics
`;

    fs.writeFileSync(setupPath, setupInstructions);
    console.log('📖 Google Play setup instructions saved to:', setupPath);
  }

  /**
   * Generate Gradle signing configuration
   */
  public generateGradleConfig(config: KeystoreConfig): void {
    const gradleConfigPath = path.join(this.configDir, 'signing.gradle');
    
    const gradleConfig = `// Android Signing Configuration
// Add this to your app/build.gradle file

android {
    signingConfigs {
        debug {
            storeFile file("../keystores/debug.keystore")
            storePassword "android"
            keyAlias "androiddebugkey"
            keyPassword "android"
        }
        release {
            storeFile file("../keystores/${config.keystore}")
            storePassword System.getenv("ANDROID_STORE_PASSWORD") ?: project.findProperty("ANDROID_STORE_PASSWORD")
            keyAlias System.getenv("ANDROID_KEY_ALIAS") ?: project.findProperty("ANDROID_KEY_ALIAS")
            keyPassword System.getenv("ANDROID_KEY_PASSWORD") ?: project.findProperty("ANDROID_KEY_PASSWORD")
        }
    }

    buildTypes {
        debug {
            signingConfig signingConfigs.debug
            applicationIdSuffix ".debug"
            versionNameSuffix "-debug"
            debuggable true
        }
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            debuggable false
        }
    }
}
`;

    fs.writeFileSync(gradleConfigPath, gradleConfig);
    console.log('⚙️ Gradle signing configuration saved to:', gradleConfigPath);
  }

  /**
   * Verify keystore
   */
  public verifyKeystore(keystorePath: string, storePassword: string): void {
    console.log('🔍 Verifying keystore...');
    
    try {
      const verifyCommand = `keytool -list -v -keystore "${keystorePath}" -storepass "${storePassword}"`;
      const output = execSync(verifyCommand, { encoding: 'utf8' });
      
      console.log('✅ Keystore verification successful!');
      
      // Extract and display key fingerprint
      const fingerprintMatch = output.match(/SHA256: ([A-F0-9:]+)/);
      if (fingerprintMatch) {
        console.log('🔑 Key fingerprint (SHA256):', fingerprintMatch[1]);
      }
      
    } catch (error) {
      throw new Error(`Keystore verification failed: ${error}`);
    }
  }

  /**
   * Main setup function
   */
  public async setup(): Promise<void> {
    try {
      console.log('🚀 Starting Android keystore setup...\n');
      
      // Generate keystore
      const config = this.generateKeystore();
      
      // Generate additional configuration files
      this.generateGradleConfig(config);
      this.generatePlayConsoleSetup();
      
      // Verify keystore
      const keystorePath = path.join(this.keystoreDir, config.keystore);
      this.verifyKeystore(keystorePath, config.storePassword);
      
      console.log('\n✅ Android keystore setup completed successfully!');
      console.log('\n📋 Next steps:');
      console.log('1. Review the generated configuration files');
      console.log('2. Follow the Google Play Console setup instructions');
      console.log('3. Add the required secrets to your CI/CD environment');
      console.log('4. Test the signing process with a debug build');
      
      console.log('\n⚠️ Security reminders:');
      console.log('- Backup your keystore file securely');
      console.log('- Never commit keystore or passwords to version control');
      console.log('- Store passwords in encrypted environment variables');
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new AndroidKeystoreSetup();
  setup.setup();
}

export default AndroidKeystoreSetup;