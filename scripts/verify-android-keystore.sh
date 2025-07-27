#!/bin/bash

# Android Keystore Verification Script
# Validates keystore integrity and displays key information

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ANDROID_DIR="$PROJECT_ROOT/android"
KEYSTORES_DIR="$ANDROID_DIR/keystores"
CONFIG_DIR="$ANDROID_DIR/config"

echo -e "${BLUE}🔍 Android Keystore Verification${NC}"
echo "=================================="

# Check if keystores directory exists
if [ ! -d "$KEYSTORES_DIR" ]; then
    echo -e "${RED}❌ Keystores directory not found: $KEYSTORES_DIR${NC}"
    echo -e "${YELLOW}💡 Run setup-android-keystore.ts first${NC}"
    exit 1
fi

# Find keystore files
KEYSTORES=($(find "$KEYSTORES_DIR" -name "*.keystore" -type f))

if [ ${#KEYSTORES[@]} -eq 0 ]; then
    echo -e "${RED}❌ No keystore files found in $KEYSTORES_DIR${NC}"
    echo -e "${YELLOW}💡 Run setup-android-keystore.ts to generate keystores${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found ${#KEYSTORES[@]} keystore file(s)${NC}"
echo

# Function to verify a keystore
verify_keystore() {
    local keystore_path="$1"
    local keystore_name=$(basename "$keystore_path")
    
    echo -e "${BLUE}📋 Verifying: $keystore_name${NC}"
    echo "----------------------------------------"
    
    # Check if environment variables are set
    if [ -z "$ANDROID_STORE_PASSWORD" ]; then
        echo -e "${YELLOW}⚠️  ANDROID_STORE_PASSWORD not set${NC}"
        echo -e "${YELLOW}💡 Set environment variable or enter password manually${NC}"
        read -s -p "Enter keystore password: " STORE_PASSWORD
        echo
    else
        STORE_PASSWORD="$ANDROID_STORE_PASSWORD"
    fi
    
    # Verify keystore integrity
    echo -e "${BLUE}🔐 Checking keystore integrity...${NC}"
    if keytool -list -keystore "$keystore_path" -storepass "$STORE_PASSWORD" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Keystore is valid and accessible${NC}"
    else
        echo -e "${RED}❌ Keystore verification failed${NC}"
        return 1
    fi
    
    # Display keystore information
    echo -e "${BLUE}📊 Keystore Information:${NC}"
    keytool -list -v -keystore "$keystore_path" -storepass "$STORE_PASSWORD" | grep -E "(Alias name|Creation date|Entry type|Certificate fingerprints)" | head -20
    
    # Extract key fingerprint
    echo -e "${BLUE}🔑 Key Fingerprints:${NC}"
    keytool -list -v -keystore "$keystore_path" -storepass "$STORE_PASSWORD" | grep -E "(MD5|SHA1|SHA256):" | head -10
    
    echo
}

# Function to check environment configuration
check_environment() {
    echo -e "${BLUE}🌍 Environment Configuration Check${NC}"
    echo "========================================="
    
    local env_file="$PROJECT_ROOT/.env"
    local env_template="$CONFIG_DIR/android-signing.env.template"
    
    # Check for environment template
    if [ -f "$env_template" ]; then
        echo -e "${GREEN}✅ Environment template found${NC}"
    else
        echo -e "${YELLOW}⚠️  Environment template not found${NC}"
    fi
    
    # Check for .env file
    if [ -f "$env_file" ]; then
        echo -e "${GREEN}✅ .env file found${NC}"
        
        # Check required variables
        local required_vars=("ANDROID_KEYSTORE_PATH" "ANDROID_KEY_ALIAS" "ANDROID_STORE_PASSWORD" "ANDROID_KEY_PASSWORD")
        local missing_vars=()
        
        for var in "${required_vars[@]}"; do
            if grep -q "^$var=" "$env_file" && [ -n "$(grep "^$var=" "$env_file" | cut -d'=' -f2)" ]; then
                echo -e "${GREEN}✅ $var is configured${NC}"
            else
                echo -e "${RED}❌ $var is missing or empty${NC}"
                missing_vars+=("$var")
            fi
        done
        
        if [ ${#missing_vars[@]} -eq 0 ]; then
            echo -e "${GREEN}✅ All required environment variables are configured${NC}"
        else
            echo -e "${YELLOW}⚠️  Missing variables: ${missing_vars[*]}${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  .env file not found${NC}"
        echo -e "${YELLOW}💡 Copy $env_template to .env and configure${NC}"
    fi
    
    echo
}

# Function to generate base64 for CI/CD
generate_base64() {
    echo -e "${BLUE}📦 Generate Base64 for CI/CD${NC}"
    echo "===================================="
    
    for keystore in "${KEYSTORES[@]}"; do
        local keystore_name=$(basename "$keystore")
        echo -e "${BLUE}📋 Processing: $keystore_name${NC}"
        
        # Generate base64
        local base64_output=$(base64 -i "$keystore" | tr -d '\n')
        
        # Save to file for easy copying
        local output_file="$CONFIG_DIR/${keystore_name}.base64"
        echo "$base64_output" > "$output_file"
        
        echo -e "${GREEN}✅ Base64 saved to: $output_file${NC}"
        echo -e "${YELLOW}📝 Add this to your CI/CD secrets as ANDROID_KEYSTORE_BASE64${NC}"
        echo
    done
}

# Function to validate signing configuration
validate_gradle_config() {
    echo -e "${BLUE}⚙️  Gradle Configuration Validation${NC}"
    echo "======================================="
    
    local gradle_config="$CONFIG_DIR/signing.gradle"
    
    if [ -f "$gradle_config" ]; then
        echo -e "${GREEN}✅ Gradle signing configuration found${NC}"
        echo -e "${YELLOW}💡 Add the following to your app/build.gradle:${NC}"
        echo
        cat "$gradle_config"
        echo
    else
        echo -e "${RED}❌ Gradle configuration not found${NC}"
        echo -e "${YELLOW}💡 Run setup-android-keystore.ts to generate configuration${NC}"
    fi
}

# Function to check Google Play setup
check_play_console_setup() {
    echo -e "${BLUE}🏪 Google Play Console Setup Check${NC}"
    echo "===================================="
    
    local setup_guide="$CONFIG_DIR/google-play-setup.md"
    
    if [ -f "$setup_guide" ]; then
        echo -e "${GREEN}✅ Google Play setup guide found${NC}"
        echo -e "${YELLOW}📖 Review the setup instructions at: $setup_guide${NC}"
    else
        echo -e "${RED}❌ Google Play setup guide not found${NC}"
        echo -e "${YELLOW}💡 Run setup-android-keystore.ts to generate setup guide${NC}"
    fi
    
    # Check for service account configuration
    if [ -n "$GOOGLE_PLAY_SERVICE_ACCOUNT_JSON" ]; then
        echo -e "${GREEN}✅ GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is configured${NC}"
    else
        echo -e "${YELLOW}⚠️  GOOGLE_PLAY_SERVICE_ACCOUNT_JSON not configured${NC}"
        echo -e "${YELLOW}💡 Add the base64-encoded service account JSON to environment${NC}"
    fi
    
    echo
}

# Main verification process
echo -e "${BLUE}🚀 Starting comprehensive Android keystore verification...${NC}"
echo

# Check environment first
check_environment

# Verify each keystore
for keystore in "${KEYSTORES[@]}"; do
    verify_keystore "$keystore"
done

# Additional checks
generate_base64
validate_gradle_config
check_play_console_setup

echo -e "${GREEN}✅ Verification completed!${NC}"
echo
echo -e "${BLUE}📋 Summary and Next Steps:${NC}"
echo "1. Ensure all environment variables are properly configured"
echo "2. Add keystore base64 and passwords to CI/CD secrets"
echo "3. Follow the Google Play Console setup guide"
echo "4. Test the signing process with a debug build"
echo "5. Upload to Google Play Console for final verification"
echo
echo -e "${YELLOW}⚠️  Security Reminders:${NC}"
echo "- Never commit keystores or passwords to version control"
echo "- Backup your keystore files securely"
echo "- Use strong, unique passwords"
echo "- Enable 2FA on all developer accounts"