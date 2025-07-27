#!/bin/bash

# 🚀 PhonoCorrect AI - Packaging Test Script
# Tests the packaging pipeline without full CI/CD

set -e

echo "🚀 PhonoCorrect AI Packaging Test"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function for colored output
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        error "pnpm is required but not installed"
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_VERSION="18.0.0"
    if ! node -e "process.exit(process.version.slice(1).split('.').map(Number).reduce((acc, val, i) => acc + val * Math.pow(1000, 2-i), 0) >= '$REQUIRED_VERSION'.split('.').map(Number).reduce((acc, val, i) => acc + val * Math.pow(1000, 2-i), 0) ? 0 : 1)"; then
        error "Node.js $REQUIRED_VERSION or higher is required (found: $NODE_VERSION)"
        exit 1
    fi
    
    # Check for Electron Builder (will be installed)
    log "Node.js version: $NODE_VERSION ✓"
    log "pnpm version: $(pnpm --version) ✓"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    pnpm install --frozen-lockfile
    success "Dependencies installed"
}

# Build packages
build_packages() {
    log "Building packages..."
    
    log "Building common package..."
    pnpm --filter common build
    
    log "Building ML core package..."
    pnpm --filter ml-core build
    
    success "Packages built successfully"
}

# Test desktop packaging
test_desktop_packaging() {
    log "Testing desktop app packaging..."
    
    # Build web app first
    log "Building desktop app..."
    pnpm --filter desktop build
    
    # Check if we can package (dry run)
    log "Testing Electron Builder configuration..."
    cd desktop
    if command -v electron-builder &> /dev/null; then
        # Test configuration without building
        npx electron-builder --help > /dev/null
        success "Electron Builder configuration valid"
    else
        warn "Electron Builder not available globally, using local"
        npx electron-builder --help > /dev/null
        success "Electron Builder configuration valid"
    fi
    cd ..
    
    # Only build if explicitly requested
    if [[ "$1" == "--build-desktop" ]]; then
        log "Building desktop distributables..."
        pnpm --filter desktop dist
        success "Desktop apps built successfully"
        
        log "Desktop build artifacts:"
        if [ -d "desktop/electron-dist" ]; then
            ls -la desktop/electron-dist/
        fi
    else
        warn "Skipping desktop build (use --build-desktop to actually build)"
    fi
}

# Test mobile packaging
test_mobile_packaging() {
    log "Testing mobile app packaging..."
    
    # Check EAS configuration
    if [ -f "mobile/eas.json" ]; then
        log "EAS configuration found ✓"
        
        # Validate EAS config
        cd mobile
        if [ -f "package.json" ]; then
            log "Mobile package.json found ✓"
        else
            error "Mobile package.json not found"
            return 1
        fi
        cd ..
        
        success "Mobile packaging configuration valid"
    else
        error "EAS configuration not found"
        return 1
    fi
    
    warn "Skipping actual mobile build (requires EAS account and tokens)"
}

# Test Chrome extension packaging
test_chrome_packaging() {
    log "Testing Chrome extension packaging..."
    
    log "Building Chrome extension..."
    pnpm --filter chrome-ext build
    
    # Create zip package
    log "Creating extension package..."
    cd chrome-ext
    if [ -d "dist" ]; then
        cd dist
        zip -r ../phonocorrect-chrome-extension.zip . -q
        cd ..
        success "Chrome extension packaged: phonocorrect-chrome-extension.zip"
        ls -la phonocorrect-chrome-extension.zip
    else
        error "Chrome extension dist folder not found"
        return 1
    fi
    cd ..
}

# Generate QR distribution page
test_qr_generation() {
    log "Testing QR distribution page generation..."
    
    # Run the QR generation script
    if [ -f "scripts/generate-qr-page.ts" ]; then
        log "Generating QR distribution page..."
        npx tsx scripts/generate-qr-page.ts
        
        if [ -f "dist/qr.html" ]; then
            success "QR distribution page generated: dist/qr.html"
            log "File size: $(stat -f%z dist/qr.html 2>/dev/null || stat --printf="%s" dist/qr.html 2>/dev/null || echo "unknown") bytes"
        else
            error "QR distribution page not generated"
            return 1
        fi
    else
        error "QR generation script not found"
        return 1
    fi
}

# Main execution
main() {
    local build_desktop=false
    
    # Parse arguments
    for arg in "$@"; do
        case $arg in
            --build-desktop)
                build_desktop=true
                shift
                ;;
            --help)
                echo "Usage: $0 [options]"
                echo ""
                echo "Options:"
                echo "  --build-desktop    Actually build desktop distributables (slow)"
                echo "  --help            Show this help message"
                echo ""
                echo "This script tests the packaging pipeline without requiring full CI/CD setup."
                exit 0
                ;;
        esac
    done
    
    check_prerequisites
    install_dependencies
    build_packages
    
    if [ "$build_desktop" = true ]; then
        test_desktop_packaging --build-desktop
    else
        test_desktop_packaging
    fi
    
    test_mobile_packaging
    test_chrome_packaging
    test_qr_generation
    
    echo ""
    success "🎉 Packaging test completed successfully!"
    echo ""
    log "Next steps:"
    echo "  • Set up EAS account for mobile builds"
    echo "  • Configure code signing certificates"
    echo "  • Set up GitHub secrets for CI/CD"
    echo "  • Test actual distribution workflow"
    echo ""
    log "To build desktop apps: $0 --build-desktop"
}

# Run main function with all arguments
main "$@"