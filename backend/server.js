#!/usr/bin/env node

/**
 * BigFoot Live Authentication Server
 * Enterprise-grade authentication and SSO management
 */

const App = require('./src/app');

// Create and start the application
const app = new App();

app.start().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
