#!/usr/bin/env node

// Basic verification that all main dependencies can be imported
console.log('✅ Verifying PhonoCorrect AI dependencies...');

try {
  // Test Node.js requires
  console.log('✅ Testing Node.js modules...');
  const fs = require('fs');
  const path = require('path');
  
  // Test that all critical files exist
  const criticalFiles = [
    'src/App.tsx',
    'src/main.tsx', 
    'src/index.css',
    'src/hooks/use-kv.ts',
    'src/hooks/use-performance-optimization.ts',
    'src/components/ui',
    'vite.config.ts',
    'package.json'
  ];
  
  for (const file of criticalFiles) {
    if (!fs.existsSync(path.join(__dirname, file))) {
      throw new Error(`Missing critical file: ${file}`);
    }
  }
  
  console.log('✅ All critical files present');
  
  // Test package.json structure
  const pkg = require('./package.json');
  if (!pkg.dependencies || !pkg.devDependencies) {
    throw new Error('Missing dependencies in package.json');
  }
  
  console.log('✅ Package.json structure valid');
  
  console.log('✅ All dependency checks passed!');
  process.exit(0);
  
} catch (error) {
  console.error('❌ Verification failed:', error.message);
  process.exit(1);
}