# GitHub Actions Certificate Management

This document explains the automated certificate deployment and management workflows for PhonoCorrect AI.

## Overview

The project includes two main GitHub Actions workflows for certificate management:

1. **Certificate Deployment** (`deploy-certificates.yml`) - Deploys and signs apps with certificates
2. **Certificate Setup & Renewal** (`certificate-setup.yml`) - Monitors and manages certificate lifecycle

## 🚀 Certificate Deployment Workflow

### Purpose
Automates the deployment and signing of applications across all platforms using stored certificates.

- **Environm
- **Automated Signing**: Signs apps and uploads to distrib

```bash
gh workflow run deploy-certificates.yml -f environment=staging -f platfor
# Deploy iOS only to production

gh workflow run de


- Validates Apple Developer certificates

- Cleans up keychain automatica
#### Android

- Integrates with Expo EAS for R
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

ANDROID_KEY_PASS
EXP

```
APPLE_DEVELOPER_CERTIFICATE_PASSWORD=<certificate-password>
APPLE_NOTARIZATION_PASSWORD=<app-spe

```
WINDOWS_CERTIFICATE_PASSWORD=<cert


Mon

- **Proactive Notifi
- *
### Schedule
- Can be triggered manually for immediate che
### Manual Trigger
# Check all certificate expiration

gh workflow run certificate-se
# C

### Expiration Thr
- *
- **Windows**: 60 days warning, 30 days urgent
### Generated Documentation
- Certificate generation commands
- GitHub Secrets configuration
- R

### Certificate Stor
- B
- Use environment-specific secrets for staging/production
### Access Control
- T

### Certificate Management

- Backup pr
## 🛠️ Setup Instructions

2. Encode ce
4. Test deployment workflow with staging environment

1. Monitor monthly certificate reports
3. Update certificates before expiration

### Troubles
#### Common Issues
- **Keychain Access**: Verify keychain password 

#### Debug Command
# Check

gh run view <run-id>

```
## 📞 Support

2. Verify all required secrets
4. Review platform-specific documentation


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
When adding new platforms or certificate types:
1. Add platform-specific validation job
2. Include certificate expiration monitoring
3. Update security documentation
4. Add setup instructions
5. Test thoroughly in staging environment

---

This documentation is automatically updated as workflows evolve. For the most current information, refer to the workflow files in `.github/workflows/`.