# 🚀 Deployment Checklist

Use this checklist to ensure successful deployment across all platforms.

## 🔄 Pre-Deployment

### Code Quality
- [ ] All tests passing (`pnpm test`)
- [ ] No linting errors (`pnpm lint`)
- [ ] TypeScript compilation clean (`pnpm type-check`)
- [ ] Version numbers updated in all package.json files
- [ ] CHANGELOG.md updated with release notes

### Assets & Documentation
- [ ] Store listing assets prepared (icons, screenshots, descriptions)
- [ ] Privacy policy and terms of service updated
- [ ] README.md updated with new features
- [ ] Documentation website updated

### Configuration
- [ ] All required GitHub secrets configured
- [ ] Environment variables validated
- [ ] Build configurations tested locally
- [ ] Certificate expiry dates checked

## 📱 Mobile App Deployment

### iOS App Store

#### Pre-Submission
- [ ] Xcode project builds without warnings
- [ ] App Store Connect metadata complete
- [ ] TestFlight beta tested successfully
- [ ] Privacy policy URL accessible
- [ ] Screenshots and app preview videos uploaded

#### Fastlane iOS Beta
```bash
cd mobile
bundle exec fastlane beta_ios
```

**Checklist:**
- [ ] Build number auto-incremented
- [ ] IPA uploaded to TestFlight
- [ ] Beta testers notified
- [ ] TestFlight notes updated

#### Fastlane iOS Production
```bash
cd mobile  
bundle exec fastlane release_ios
```

**Checklist:**
- [ ] Version number incremented
- [ ] Production build uploaded
- [ ] App Store review submitted
- [ ] Release date scheduled

### Android Google Play

#### Pre-Submission
- [ ] Android build generates clean AAB
- [ ] Google Play Console metadata complete
- [ ] Internal testing completed successfully
- [ ] Upload signing key configured
- [ ] Target API level compliance verified

#### Fastlane Android Beta
```bash
cd mobile
bundle exec fastlane beta_android
```

**Checklist:**
- [ ] Version code auto-incremented
- [ ] AAB uploaded to Internal Testing track
- [ ] Internal testers have access
- [ ] Rollout percentage set correctly

#### Fastlane Android Production
```bash
cd mobile
bundle exec fastlane release_android  
```

**Checklist:**
- [ ] Production AAB uploaded
- [ ] Production track selected
- [ ] Staged rollout configured
- [ ] Play Console review passed

## 🖥️ Desktop App Deployment

### macOS Distribution

#### Development Build
- [ ] Build with development certificate
- [ ] Test on multiple macOS versions
- [ ] Verify all features work offline

#### Production Build (with Notarization)
```bash
cd desktop
pnpm run dist:mac
```

**Checklist:**
- [ ] Built with Distribution certificate
- [ ] Successfully notarized by Apple
- [ ] Stapling completed without errors
- [ ] DMG tested on clean macOS system
- [ ] Gatekeeper allows execution

### Windows Distribution

#### Development Build
- [ ] Build without code signing
- [ ] Test on Windows 10 and 11
- [ ] SmartScreen bypass documented

#### Production Build (with Code Signing)
```bash
cd desktop
pnpm run dist:win
```

**Checklist:**
- [ ] Code signed with valid certificate
- [ ] SmartScreen warnings minimized
- [ ] Installer tested on clean Windows system
- [ ] Windows Defender scan passed

### Linux Distribution

```bash
cd desktop
pnpm run dist:linux
```

**Checklist:**
- [ ] AppImage format generated
- [ ] Tested on Ubuntu LTS
- [ ] Desktop integration working
- [ ] Dependencies properly bundled

## 🌐 Web & Extension Deployment

### Chrome Web Store

#### Manual Upload (Development)
1. Build extension: `cd chrome-ext && pnpm build`
2. Create ZIP: `cd dist && zip -r ../extension.zip .`
3. Upload to Chrome Web Store Developer Dashboard
4. Test in unpacked mode first

#### Automated Upload (Production)
```bash
# Triggered by GitHub Actions on tag push
git tag v1.0.0
git push origin v1.0.0
```

**Checklist:**
- [ ] Extension ID configured in secrets
- [ ] Chrome Web Store API enabled
- [ ] OAuth tokens valid and working
- [ ] Manifest V3 compliance verified
- [ ] Permission justifications complete

### Web App (GitHub Pages)

```bash
cd web
pnpm run build
```

**Checklist:**
- [ ] Next.js build successful
- [ ] Static export generated
- [ ] GitHub Pages deployment working
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active

## 📦 GitHub Release Creation

### Automated Release (via GitHub Actions)

#### Beta Release
```bash
git tag v1.0.0-beta.1
git push origin v1.0.0-beta.1
```

#### Production Release  
```bash
git tag v1.0.0
git push origin v1.0.0
```

**Checklist:**
- [ ] All platform artifacts uploaded
- [ ] Release notes generated
- [ ] QR code distribution page created
- [ ] Download links tested
- [ ] Release marked as latest/pre-release correctly

### Manual Release Verification
- [ ] Download each platform's artifact
- [ ] Install and test basic functionality
- [ ] Verify version numbers match
- [ ] Check digital signatures (where applicable)

## 🔔 Post-Deployment

### Monitoring
- [ ] Download statistics tracked
- [ ] Crash reports monitored
- [ ] User feedback channels active
- [ ] Store review responses timely

### Communication
- [ ] Release announcement posted
- [ ] Social media updates published
- [ ] Documentation website updated
- [ ] Support team notified of new features

### Rollback Plan
- [ ] Previous version artifacts saved
- [ ] Rollback procedure documented
- [ ] Emergency contact list updated
- [ ] Store rollback capabilities verified

## 🚨 Emergency Procedures

### Critical Bug Found
1. **Stop distribution**: Remove from stores if possible
2. **Hotfix development**: Create emergency patch
3. **Expedited testing**: Minimal viable testing
4. **Emergency deployment**: Use priority publishing

### Certificate Expiry
1. **Monitor expiry dates**: Set calendar reminders
2. **Renew early**: 30 days before expiration
3. **Update CI/CD**: Upload new certificates to secrets
4. **Test signing**: Verify new certificates work

### Store Rejection
1. **Review feedback**: Understand rejection reasons
2. **Fix issues**: Address all cited problems  
3. **Resubmit quickly**: Don't delay resubmission
4. **Communicate**: Update users on timeline

## 📊 Success Metrics

### Technical Metrics
- [ ] Zero critical deployment failures
- [ ] All platform builds successful
- [ ] Certificate and signing working
- [ ] Download/install success rates >95%

### Business Metrics
- [ ] Store approval times <3 days
- [ ] User ratings >4.0 stars
- [ ] Download growth week-over-week
- [ ] Support ticket volume manageable

### User Experience Metrics
- [ ] App crash rates <1%
- [ ] Feature adoption rates tracked
- [ ] User feedback sentiment positive
- [ ] Accessibility compliance maintained

---

## 📞 Support Contacts

**Platform Issues:**
- Apple Developer Support: developer.apple.com/support
- Google Play Support: support.google.com/googleplay/android-developer  
- Chrome Web Store: support.google.com/chrome_webstore

**Internal Team:**
- Release Manager: [team email]
- QA Lead: [team email]
- DevOps: [team email]

**Emergency Escalation:**
- On-call Engineer: [contact info]
- Release Approval: [contact info]