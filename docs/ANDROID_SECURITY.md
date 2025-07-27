# Android Security Configuration

## Overview
This document outlines the security configuration for Android keystore management and Google Play Console integration for PhonoCorrect AI.

## Keystore Security

### 1. Keystore Generation
```bash
# Generate release keystore with strong parameters
keytool -genkey -v \
  -keystore phonocorrectai-release-key.keystore \
  -alias phonocorrectai-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -dname "CN=PhonoCorrect AI, OU=Development, O=PhonoCorrect AI, L=San Francisco, ST=CA, C=US"
```

### 2. Password Requirements
- **Minimum length**: 16 characters
- **Character requirements**: Upper, lower, numbers, special characters
- **Uniqueness**: Different passwords for store and key
- **Storage**: Encrypted environment variables only

### 3. Keystore Backup Strategy
```bash
# Create encrypted backup
gpg --symmetric --cipher-algo AES256 phonocorrectai-release-key.keystore

# Store in multiple secure locations:
# 1. Encrypted cloud storage (Google Drive, Dropbox with encryption)
# 2. Offline encrypted external drive
# 3. Secure password manager vault
```

## Environment Variables Security

### Required Variables
```bash
# Android Signing
ANDROID_KEYSTORE_BASE64=          # Base64 encoded keystore file
ANDROID_STORE_PASSWORD=           # Keystore password
ANDROID_KEY_PASSWORD=             # Key password
ANDROID_KEY_ALIAS=                # Key alias name

# Google Play Console
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON= # Base64 encoded service account JSON
GOOGLE_PLAY_PACKAGE_NAME=         # com.phonocorrectai.app
```

### CI/CD Secrets Management
```bash
# GitHub Secrets (encrypted at rest)
gh secret set ANDROID_KEYSTORE_BASE64 < keystore.base64
gh secret set ANDROID_STORE_PASSWORD --body "your-secure-password"
gh secret set ANDROID_KEY_PASSWORD --body "your-secure-key-password"
gh secret set GOOGLE_PLAY_SERVICE_ACCOUNT_JSON < service-account.base64

# Repository secrets are encrypted with AES-256-GCM
# Environment secrets are only available during workflow execution
```

## Google Play Console Security

### 1. Service Account Setup
```json
{
  "type": "service_account",
  "project_id": "phonocorrectai-play-console",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "phonocorrectai-publisher@phonocorrectai-play-console.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}
```

### 2. IAM Permissions (Principle of Least Privilege)
- **Release Manager**: Upload APKs/AABs to testing tracks
- **Release Manager**: Promote releases between tracks
- **View Financial Data**: No (not required)
- **Manage Store Listing**: No (unless specifically needed)

### 3. Service Account Security
```bash
# Rotate service account keys annually
gcloud iam service-accounts keys create new-key.json \
  --iam-account=phonocorrectai-publisher@phonocorrectai-play-console.iam.gserviceaccount.com

# Delete old keys
gcloud iam service-accounts keys delete KEY_ID \
  --iam-account=phonocorrectai-publisher@phonocorrectai-play-console.iam.gserviceaccount.com
```

## Security Checklist

### ✅ Pre-Deployment Security
- [ ] Keystore generated with strong passwords
- [ ] Keystore backed up securely in multiple locations
- [ ] Environment variables configured in CI/CD secrets
- [ ] Service account created with minimal permissions
- [ ] Service account JSON file never committed to repository
- [ ] All passwords stored in encrypted format only

### ✅ Runtime Security
- [ ] Keystore files deleted after use in CI/CD
- [ ] Service account credentials deleted after use
- [ ] Build artifacts scanned for sensitive information
- [ ] APK/AAB signature verified before upload
- [ ] Upload limited to appropriate tracks only

### ✅ Ongoing Security
- [ ] Regular rotation of service account keys (annually)
- [ ] Regular audit of CI/CD secrets access
- [ ] Monitor Google Play Console access logs
- [ ] Keep keystore backup encryption up to date
- [ ] Review and update security policies quarterly

## Incident Response

### Compromised Keystore
1. **Immediate Actions**:
   - Rotate all associated passwords
   - Generate new keystore (if possible before first Play Store release)
   - Update CI/CD secrets
   - Review access logs

2. **If App Already Published**:
   - Contact Google Play Support
   - Follow app signing key recovery process
   - Consider migrating to Play App Signing

### Compromised Service Account
1. **Immediate Actions**:
   - Disable compromised service account
   - Create new service account with fresh keys
   - Update CI/CD secrets
   - Review Google Cloud audit logs

2. **Investigation**:
   - Check for unauthorized uploads or changes
   - Review access patterns in Google Cloud Console
   - Assess potential data exposure

## Security Monitoring

### Automated Checks
```yaml
# GitHub Actions security scan
- name: Security scan
  run: |
    # Check for accidentally committed keystores
    find . -name "*.keystore" -o -name "*.jks" | grep -v ".git" && exit 1
    
    # Check for hardcoded passwords
    grep -r "storePassword\|keyPassword" --include="*.gradle" . | grep -v "System.getenv" && exit 1
    
    # Check for service account files
    find . -name "*service-account*.json" | head -1 | grep -v ".git" && exit 1
```

### Manual Reviews
- Monthly review of CI/CD secrets
- Quarterly security assessment
- Annual penetration testing
- Regular backup verification

## Compliance Notes

### GDPR/CCPA
- Service account access logs retained per compliance requirements
- User data handling follows privacy policy
- Right to data deletion implemented

### SOC 2
- Access controls documented and reviewed
- Change management process for security configurations
- Regular security training for development team

### Industry Standards
- OWASP Mobile Security guidelines followed
- NIST Cybersecurity Framework alignment
- Regular security updates and patches applied

## Contact Information

### Security Issues
- **Primary**: security@phonocorrectai.com
- **Secondary**: Lead developer on-call rotation
- **Emergency**: 24/7 incident response team

### External Resources
- [Google Play Console Security Best Practices](https://support.google.com/googleplay/android-developer/answer/9842756)
- [Android App Bundle Security](https://developer.android.com/guide/app-bundle)
- [GitHub Secrets Security](https://docs.github.com/en/actions/security-guides/encrypted-secrets)