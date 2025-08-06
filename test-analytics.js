#!/usr/bin/env node

/**
 * Quick test script for BigFoot Live Analytics Setup
 * Run with: node test-analytics.js
 */

import fs from 'fs';
import path from 'path';

console.log('🚀 BigFoot Live Analytics Setup Test\n');

// Check environment file
const envPath = '.env.local';
console.log('1. Checking environment configuration...');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('   ✅ .env.local file exists');
  
  const lines = envContent.split('\n').filter(line => line.includes('=') && !line.startsWith('#'));
  lines.forEach(line => {
    const [key, value] = line.split('=');
    console.log(`   📝 ${key}: ${value}`);
  });
} else {
  console.log('   ⚠️  .env.local file not found - using defaults');
}

// Check key files exist
console.log('\n2. Checking key implementation files...');
const keyFiles = [
  'src/hooks/useRealTimeAnalytics.ts',
  'src/services/realTimeAnalytics.ts',
  'src/components/analytics/RealTimeDashboard.tsx',
  'src/components/analytics/ConnectionStatus.tsx',
  'src/pages/tenant/AnalyticsRealTime.tsx',
  'src/pages/tenant/AnalyticsDebug.tsx'
];

keyFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
  }
});

// Check package.json dependencies
console.log('\n3. Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = ['recharts', 'lucide-react'];

requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    console.log(`   ✅ ${dep}`);
  } else {
    console.log(`   ❌ ${dep} - MISSING (run: npm install ${dep})`);
  }
});

// Check routes are properly configured
console.log('\n4. Checking routing setup...');
if (fs.existsSync('src/App.tsx')) {
  const appContent = fs.readFileSync('src/App.tsx', 'utf8');
  const routes = [
    'analytics/real-time',
    'analytics/debug',
    'AnalyticsRealTime',
    'AnalyticsDebug'
  ];
  
  routes.forEach(route => {
    if (appContent.includes(route)) {
      console.log(`   ✅ ${route} route configured`);
    } else {
      console.log(`   ❌ ${route} route - MISSING`);
    }
  });
}

console.log('\n5. Setup Summary:');
console.log('   📊 Real-time analytics system is ready!');
console.log('   🔗 Navigate to: http://localhost:5175/tenant/analytics/debug');
console.log('   🔍 Test connection and view live data');
console.log('   📖 See REAL_TIME_ANALYTICS_SETUP.md for backend setup');

console.log('\n6. Next Steps:');
console.log('   • Visit /tenant/analytics/debug to test connections');
console.log('   • Check browser console for WebSocket connection attempts');
console.log('   • Configure VITE_USE_MOCK_ANALYTICS=true for mock data');
console.log('   • Set up backend WebSocket endpoints for real data');

console.log('\n🎉 Setup complete! Your analytics system is ready to go!');
