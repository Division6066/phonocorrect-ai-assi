# 🔐 GitHub Secrets Configuration

This document outlines all the secrets required for the complete CI/CD and publishing pipeline.

## 📱 Mobile App Publishing

### iOS App Store (Required for Fastlane iOS)

```bash
# Apple Developer Account
APPLE_ID="your-apple-id@example.com"
APPLE_ID_PASSWORD="app-specific-password"  # Generate at appleid.apple.com
APPLE_TEAM_ID="ABCD123456"  # Developer Team ID

# Fastlane
FASTLANE_PASSWORD="your-apple-id-password"
MATCH_PASSWORD="password-for-match-encrypted-certs"

# iOS Code Signing
IOS_DIST_CERTIFICATE_BASE64="LS0tLS1CRUdJ..."  # Base64 encoded .p12 file
IOS_DIST_CERTIFICATE_PASSWORD="certificate-password"
IOS_PROVISIONING_PROFILE_BASE64="LS0tLS1CRUdJ..."  # Base64 encoded .mobileprovision

# Expo/EAS
EXPO_TOKEN="your-eas-cli-token"  # From expo.dev account
```

### Android Google Play (Required for Fastlane Android)

```bash
# Google Play Console
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON="LS0tLS1CRUdJ..."  # Base64 encoded service account JSON

# Expo/EAS (same as iOS)
EXPO_TOKEN="your-eas-cli-token"
```

### How to Generate Mobile Secrets

#### iOS Certificates
1. **Apple Developer Account**: Sign up at developer.apple.com ($99/year)
2. **Distribution Certificate**: 
   ```bash
   # Export from Keychain as .p12 file
   base64 -i distribution_cert.p12 | pbcopy
   ```
3. **Provisioning Profile**:
   ```bash
   # Download from Apple Developer Portal
   base64 -i profile.mobileprovision | pbcopy
   ```
4. **App-Specific Password**: Generate at appleid.apple.com > Security

#### Android Service Account
1. **Google Play Console**: Sign up at play.google.com/console ($25 one-time)
2. **Service Account**: Create in Google Cloud Console
3. **JSON Key**: Download and encode:
   ```bash
   base64 -i service-account.json | pbcopy
   ```

## 🖥️ Desktop App Code Signing

### macOS Notarization (Required for Production)

```bash
# Same as iOS (uses same Apple Developer account)
MACOS_CERTIFICATE_BASE64="LS0tLS1CRUdJ..."  # Base64 encoded Developer ID .p12
MACOS_CERTIFICATE_PASSWORD="certificate-password"
APPLE_ID="your-apple-id@example.com"
APPLE_ID_PASSWORD="app-specific-password"
APPLE_TEAM_ID="ABCD123456"
```

### Windows Code Signing (Optional)

```bash
WINDOWS_CERTIFICATE_BASE64="LS0tLS1CRUdJ..."  # Base64 encoded .p12 or .pfx
WINDOWS_CERTIFICATE_PASSWORD="certificate-password"
```

### How to Generate Desktop Secrets

#### macOS Developer ID Certificate
1. **Xcode**: Preferences > Accounts > Download Manual Profiles
2. **Export**: Keychain > Export Developer ID Application > .p12
3. **Encode**: `base64 -i developer_id.p12 | pbcopy`

#### Windows Code Signing Certificate
1. **Purchase**: From DigiCert, Sectigo, or similar CA ($200-400/year)
2. **Export**: From certificate store as .pfx
3. **Encode**: `certutil -encode cert.pfx cert.txt && type cert.txt | clip`

## 🌐 Chrome Web Store Publishing

```bash
# Chrome Web Store Developer Dashboard
CHROME_EXTENSION_ID="abcdefghijklmnopqrstuvwxyz123456"  # Extension ID from store
CHROME_CLIENT_ID="1234567890-abc123.apps.googleusercontent.com"
CHROME_CLIENT_SECRET="GOCSPx-abc123def456ghi789"
CHROME_REFRESH_TOKEN="1//0abc123def456-refresh-token"
```

### How to Generate Chrome Web Store Secrets

1. **Developer Account**: Sign up at chrome.google.com/webstore/devconsole ($5 one-time)
2. **Google Cloud Project**: Create at console.cloud.google.com
3. **OAuth Credentials**: Create OAuth 2.0 client credentials
4. **Chrome Web Store API**: Enable in Google Cloud Console
5. **Refresh Token**: Generate using OAuth flow

## 💬 Notifications (Optional)

### Slack Integration

```bash
SLACK_URL="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
```

### Discord Integration

```bash
DISCORD_WEBHOOK="https://discord.com/api/webhooks/123456789/XXXXXXXXXXXXXXXXXXXXXXXX"
```

## 🔧 Setting Up GitHub Secrets

### Repository Secrets
1. Go to GitHub repo > Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Add each secret name and value
4. Secrets are encrypted and only accessible to workflows

### Environment Secrets (Recommended)
1. Create environments: `development`, `staging`, `production`
2. Add secrets to specific environments for better security
3. Require manual approval for production deployments

### Organization Secrets (For Multiple Repos)
1. Go to GitHub organization > Settings > Secrets and variables > Actions
2. Create organization-level secrets
3. Share with specific repositories

## 🛡️ Security Best Practices

### Certificate Management
- **Rotate certificates** before expiration
- **Use different certificates** for development vs production
- **Store certificate passwords** securely
- **Monitor certificate expiry** dates

### Access Control
- **Limit secret access** to necessary workflows only
- **Use environment protection rules** for production
- **Audit secret usage** regularly
- **Rotate tokens** periodically

### Development vs Production
- **Separate environments** with different secrets
- **Use staging certificates** for testing
- **Test publishing pipeline** with beta channels first

## 📋 Secrets Checklist

### Essential for Beta Testing
- [ ] `EXPO_TOKEN` - Required for mobile builds
- [ ] `GITHUB_TOKEN` - Automatically provided, used for releases

### Required for iOS App Store
- [ ] `APPLE_ID`
- [ ] `APPLE_ID_PASSWORD`
- [ ] `APPLE_TEAM_ID`
- [ ] `FASTLANE_PASSWORD`
- [ ] `IOS_DIST_CERTIFICATE_BASE64`
- [ ] `IOS_DIST_CERTIFICATE_PASSWORD`
- [ ] `IOS_PROVISIONING_PROFILE_BASE64`

### Required for Google Play Store
- [ ] `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`

### Required for macOS Notarization
- [ ] `MACOS_CERTIFICATE_BASE64`
- [ ] `MACOS_CERTIFICATE_PASSWORD`

### Required for Chrome Web Store
- [ ] `CHROME_EXTENSION_ID`
- [ ] `CHROME_CLIENT_ID`
- [ ] `CHROME_CLIENT_SECRET`
- [ ] `CHROME_REFRESH_TOKEN`

### Optional Enhancements
- [ ] `WINDOWS_CERTIFICATE_BASE64`
- [ ] `WINDOWS_CERTIFICATE_PASSWORD`
- [ ] `SLACK_URL`
- [ ] `DISCORD_WEBHOOK`

## 🚨 Troubleshooting

### Common Issues

#### iOS Certificate Problems
```bash
# Check certificate validity
security find-identity -v -p codesigning

# Verify provisioning profile
security cms -D -i profile.mobileprovision
```

#### Android Keystore Issues
```bash
# Verify service account JSON
cat service-account.json | jq .

# Test Google Play API access
fastlane supply init --track internal
```

#### macOS Notarization Failures
```bash
# Check notarization history
xcrun notarytool history --apple-id "your-id@example.com"

# Get detailed submission info
xcrun notarytool info SUBMISSION_ID --apple-id "your-id@example.com"
```

### Secret Validation Scripts

Create validation scripts to test secrets:

```bash
# scripts/validate-secrets.sh
#!/bin/bash

echo "🔍 Validating GitHub Secrets..."

# Check iOS secrets
if [ -n "$IOS_DIST_CERTIFICATE_BASE64" ]; then
  echo "✅ iOS certificate present"
else
  echo "❌ iOS certificate missing"
fi

# Check Android secrets  
if [ -n "$GOOGLE_PLAY_SERVICE_ACCOUNT_JSON" ]; then
  echo "✅ Google Play service account present"
else
  echo "❌ Google Play service account missing"
fi

# Add more validations...
```

## 📞 Support

For issues with:
- **Apple Developer**: developer.apple.com/support
- **Google Play Console**: support.google.com/googleplay/android-developer
- **Chrome Web Store**: support.google.com/chrome_webstore
- **GitHub Actions**: docs.github.com/actions

Remember to never commit secrets to your repository and always use GitHub's encrypted secrets feature.