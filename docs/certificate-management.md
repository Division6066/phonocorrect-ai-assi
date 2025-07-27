# GitHub Actions Certificate Management

This document explains the automated certificate deployment and management workflows for PhonoCorrect AI.

## Overview

The project includes two main GitHub Actions workflows for certificate management:

1. **Certificate Deployment** (`deploy-certificates.yml`) - Deploys and signs apps with certificates
2. **Certificate Setup & Renewal** (`certificate-setup.yml`) - Monitors and manages certificate lifecycle

## 🚀 Certificate Deployment Workflow

### Purpose
Automates the deployment and signing of applications across all platforms using stored certificates.

### Features
- **Multi-Platform Support**: iOS, Android, macOS, Windows
- **Environment Separation**: Staging and production deployments
- **Security Validation**: Checks for required secrets before deployment
- **Automated Signing**: Signs apps and uploads to distribution platforms
- **Clean Architecture**: Secure handling with automatic cleanup

### Manual Trigger
```bash
# Deploy to staging (all platforms)
gh workflow run deploy-certificates.yml -f environment=staging -f platform=all

# Deploy iOS only to production
gh workflow run deploy-certificates.yml -f environment=production -f platform=ios

# Deploy Android only to staging
gh workflow run deploy-certificates.yml -f environment=staging -f platform=android
```

### Platform-Specific Actions

#### iOS
- Validates Apple Developer certificates
- Creates temporary keychain for signing
- Signs iOS keyboard extension
- Uploads to TestFlight (staging) or App Store Connect (production)
- Cleans up keychain automatically

#### Android
- Validates Android signing keystore
- Signs AAR libraries and APK/AAB files
- Uploads to Google Play Internal Testing (staging) or Play Console (production)
- Integrates with Expo EAS for React Native builds

#### macOS
- Signs desktop applications with Developer ID certificates
- Notarizes apps for distribution outside Mac App Store
- Creates signed DMG packages
- Handles Apple's notarization service

#### Windows
- Signs executables with code signing certificates
- Uses SignTool for certificate application
- Supports both self-signed (development) and CA-issued certificates
- Timestamps signatures for long-term validity

### Required GitHub Secrets

#### iOS Secrets
```
APPLE_CERTIFICATE_P12_BASE64=<base64-encoded-p12-certificate>
APPLE_CERTIFICATE_PASSWORD=<p12-password>
APPLE_PROVISIONING_PROFILE_BASE64=<base64-encoded-mobileprovision>
APPLE_TEAM_ID=<10-character-team-id>
APPLE_CODE_SIGN_IDENTITY=<certificate-name>
APPLE_PROVISIONING_PROFILE_NAME=<profile-name>
APPLE_ID_USERNAME=<apple-id-email>
APPLE_ID_PASSWORD=<app-specific-password>
KEYCHAIN_PASSWORD=<random-keychain-password>
```

#### Android Secrets
```
ANDROID_KEYSTORE_BASE64=<base64-encoded-keystore>
ANDROID_KEYSTORE_PASSWORD=<keystore-password>
ANDROID_KEY_ALIAS=<key-alias>
ANDROID_KEY_PASSWORD=<key-password>
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=<service-account-json>
EXPO_TOKEN=<expo-access-token>
```

#### macOS Secrets
```
APPLE_DEVELOPER_CERTIFICATE_P12_BASE64=<base64-encoded-certificate>
APPLE_DEVELOPER_CERTIFICATE_PASSWORD=<certificate-password>
APPLE_DEVELOPER_IDENTITY=<certificate-identity>
APPLE_NOTARIZATION_PASSWORD=<app-specific-password>
```

#### Windows Secrets
```
WINDOWS_CERTIFICATE_P12_BASE64=<base64-encoded-certificate>
WINDOWS_CERTIFICATE_PASSWORD=<certificate-password>
```

## 📅 Certificate Setup & Renewal Workflow

### Purpose
Monitors certificate expiration and provides automated renewal guidance.

### Features
- **Automated Monitoring**: Monthly checks for certificate expiration
- **Proactive Notifications**: Creates GitHub issues when certificates expire soon
- **Setup Instructions**: Generates detailed platform-specific setup guides
- **Expiration Tracking**: Monitors different expiration windows per platform

### Schedule
- Runs automatically on the 1st of every month
- Can be triggered manually for immediate checks

### Manual Trigger
```bash
# Check all certificate expiration
gh workflow run certificate-setup.yml -f action=check -f platform=all

# Generate setup instructions
gh workflow run certificate-setup.yml -f action=setup -f platform=all

# Check specific platform only
gh workflow run certificate-setup.yml -f action=check -f platform=ios
```

### Expiration Thresholds
- **iOS**: 30 days warning, 7 days urgent
- **Android**: 365 days warning, 90 days urgent
- **macOS**: 30 days warning, 7 days urgent  
- **Windows**: 60 days warning, 30 days urgent

### Generated Documentation
The setup action creates detailed instructions for:
- Certificate generation commands
- Platform-specific setup steps
- GitHub Secrets configuration
- Security best practices
- Renewal procedures

## 🔐 Security Best Practices

### Certificate Storage
- All certificates stored as encrypted GitHub Secrets
- Base64 encoding for binary certificate files
- Never commit certificates or private keys to repository
- Use environment-specific secrets for staging/production

### Access Control
- Workflows run in isolated environments
- Temporary keychains created and destroyed per run
- No certificate data exposed in logs
- Service account permissions limited to necessary scopes

### Certificate Management
- Regular expiration monitoring
- Automated issue creation for renewals
- Documentation of renewal processes
- Backup procedures for critical certificates

## 🛠️ Setup Instructions

### Initial Setup
1. Follow platform-specific certificate generation guides
2. Encode certificates as base64 strings
3. Add all required secrets to GitHub repository settings
4. Test deployment workflow with staging environment
5. Verify certificate validation and signing processes

### Maintenance
1. Monitor monthly certificate reports
2. Respond to expiration notification issues
3. Update certificates before expiration
4. Test updated certificates in staging environment
5. Document any changes to certificate procedures

### Troubleshooting

#### Common Issues
- **Invalid Certificate**: Check base64 encoding and password
- **Keychain Access**: Verify keychain password and permissions
- **Notarization Failure**: Ensure Apple ID has app-specific password
- **Upload Failure**: Check service account permissions and API access

#### Debug Commands
```bash
# Check workflow run logs
gh run list --workflow=deploy-certificates.yml

# View specific run details
gh run view <run-id>

# Download workflow artifacts
gh run download <run-id>
```

## 📞 Support

For certificate-related issues:
1. Check workflow run logs for specific error messages
2. Verify all required secrets are configured
3. Test certificate validity manually
4. Review platform-specific documentation
5. Contact platform support (Apple Developer, Google Play, etc.)

## 📝 Contributing

When adding new platforms or certificate types:
1. Add platform-specific validation job
2. Include certificate expiration monitoring
3. Update security documentation
4. Add setup instructions
5. Test thoroughly in staging environment

---

This documentation is automatically updated as workflows evolve. For the most current information, refer to the workflow files in `.github/workflows/`.