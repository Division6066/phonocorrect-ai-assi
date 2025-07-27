#!/usr/bin/env tsx
 * 
 * Android Keystore Setup Script
 * Generates keystore for Android app signing and provides Google Play service account setup
imp


  alias: string;
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
    
      keysiz
      dname: 'CN=PhonoCorrect AI, OU
  }
  /**
   */
    const config = this.generateKey

    console.log(`📁 
    // Check if keytool is available
      
   

    c
      '-genkey',
     
      `-keyalg ${config.keyalg}`,
      `-validity ${config.validity}`,
      `-keypass "${config.keyPassword}"`,

    try {
      console.log('✅ Keystore generated successfully!');


    this.
    return config;

   * Save keystore configuration
  pri

    const publicConfig =
      keystore: config.keyst
      keysize: c
      dname: con
    };
    fs.writeFileSync(configPath, JSO
    // Save environment template
    const envTemplate = `# Androi
# NEVER commit actual passwords to 
ANDROID_KEYSTORE_PATH=${config.keysto
ANDROID_STORE_PASSWORD=${config.storePassword

# Generate with: base64 -i ${con



    console.log('📝 Configuration saved to:', conf
  }
  /**
   */
    c

## 1. Create Google Play Console A
1. Visit [Google Play Console](https
3. C
## 2. Create Servi
1. 

   - 
5. Grant the service account the


2. Find your service account and click **Grant Access**
   -

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
      
  

  /**
   */
   

     
      // Generate additional configuration
     
      // Verify keystore
      this.verifyKeystore(keystorePath, config.storePassword);
    
      console.log('1. Review the generated configuration f
      console.log('3. Add the required se

      con
      console.log('-
    } catch (er
      process.exit(1);
  }

if (require.main === module) {
  setup.s































































































