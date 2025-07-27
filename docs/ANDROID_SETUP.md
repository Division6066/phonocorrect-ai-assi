# Android Keystore & Google Play Console Configuration

## Quick Start

```bash
# 1. Generate Android keystore and configuration
npm run setup:android-keystore

# 2. Verify the setup
npm run verify:android-keystore

# 3. Configure CI/CD secrets (see output from step 1)
```

## Overview

This guide configures secure Android app signing and Google Play Console integration for PhonoCorrect AI.

## Prerequisites

- Java JDK 8+ installed (for keytool)
- GitHub CLI (`gh`) installed and authenticated
- Google Play Console developer account
- Google Cloud Console access

## Automated Setup

### 1. Generate Keystore

The setup script generates:
- Release keystore with secure passwords
- Gradle signing configuration
- Environment variable templates
- Google Play Console setup guide

```bash
npm run setup:android-keystore
```

### 2. Verify Configuration

```bash
npm run verify:android-keystore
```

## Manual Configuration

### 1. Google Play Console Setup

1. **Create Developer Account**:
   - Visit [Google Play Console](https://play.google.com/console)
   - Pay $25 registration fee
   - Complete verification

2. **Create Service Account**:
   - Go to Setup → API Access
   - Create service account in Google Cloud Console
   - Grant "Service Account User" role
   - Download JSON key file

3. **Grant Permissions**:
   - Return to Play Console → API Access
   - Grant "Release Manager" permissions to service account

### 2. GitHub Secrets Configuration

```bash
# Set required secrets
gh secret set ANDROID_KEYSTORE_BASE64 < keystore.base64
gh secret set ANDROID_STORE_PASSWORD
gh secret set ANDROID_KEY_PASSWORD
gh secret set ANDROID_KEY_ALIAS
gh secret set GOOGLE_PLAY_SERVICE_ACCOUNT_JSON < service-account.base64
```

### 3. Test Configuration

```bash
# Test keystore setup
gh workflow run android-keystore-setup.yml -f action=verify

# Test build and deployment
gh workflow run android-keystore-setup.yml -f action=deploy -f environment=staging
```

## Security Best Practices

### Keystore Security
- ✅ Generate strong, unique passwords
- ✅ Backup keystore in multiple secure locations
- ✅ Never commit keystore files to version control
- ✅ Use environment variables for passwords
- ✅ Rotate passwords annually

### Service Account Security
- ✅ Principle of least privilege (Release Manager only)
- ✅ Rotate service account keys annually
- ✅ Monitor access logs regularly
- ✅ Use separate accounts for staging/production

### CI/CD Security
- ✅ Store secrets in encrypted GitHub Secrets
- ✅ Clean up temporary files after use
- ✅ Scan for accidentally committed secrets
- ✅ Use separate environments for testing

## Troubleshooting

### Common Issues

**"keytool: command not found"**
```bash
# Install Java JDK
# macOS: brew install openjdk
# Ubuntu: sudo apt install openjdk-11-jdk
# Windows: Download from Oracle or OpenJDK
```

**"Service account does not have permission"**
```bash
# Check in Google Play Console:
# 1. Setup → API Access
# 2. Find your service account
# 3. Ensure "Release Manager" permissions are granted
```

**"Keystore was tampered with"**
```bash
# Verify password is correct
# Check keystore file integrity
# Regenerate if corrupted
```

### Validation Commands

```bash
# Verify keystore integrity
keytool -list -v -keystore your-keystore.keystore

# Test service account authentication
python scripts/upload-to-play-console.py --validate \
  --service-account service-account.json \
  --package-name com.phonocorrectai.app

# Check GitHub secrets
gh secret list
```

## Deployment Workflow

### Internal Testing
```bash
gh workflow run android-keystore-setup.yml \
  -f action=deploy \
  -f environment=staging
```

### Production Release
```bash
gh workflow run android-keystore-setup.yml \
  -f action=deploy \
  -f environment=production
```

## Backup Strategy

### Keystore Backup
```bash
# Encrypt keystore for backup
gpg --symmetric --cipher-algo AES256 phonocorrectai-release-key.keystore

# Store in multiple locations:
# 1. Encrypted cloud storage
# 2. Offline encrypted drive
# 3. Secure password manager
```

### Recovery Process
```bash
# If keystore is lost before first release:
# 1. Generate new keystore
# 2. Update CI/CD secrets
# 3. Continue deployment

# If keystore is lost after release:
# 1. Contact Google Play Support
# 2. Follow app signing key recovery process
# 3. Consider migrating to Play App Signing
```

## Next Steps

1. **Test the Setup**: Run verification scripts
2. **Configure Fastlane**: Add automated deployment
3. **Set up Monitoring**: Configure crash reporting
4. **Plan Releases**: Set up release tracks
5. **Security Review**: Regular security audits

## Support

- **Documentation**: See `docs/ANDROID_SECURITY.md`
- **Scripts**: Check `scripts/` directory
- **Workflows**: See `.github/workflows/android-keystore-setup.yml`
- **Issues**: Create GitHub issue for problems