#!/bin/bash

# BigfootLive - Run Tests with Authentication
# This script sets up the environment and runs authenticated tests

set -e

echo "🔐 Setting up authenticated test environment..."

# Load test environment variables
if [ -f .env.test.local ]; then
  echo "📁 Loading test environment from .env.test.local"
  export $(cat .env.test.local | grep -v '^#' | xargs)
else
  echo "⚠️  .env.test.local not found, using fallback credentials"
  export TEST_EMAIL="apvantaio@gmail.com"
  export TEST_PASSWORD="DisneyDemo2025#"
fi

echo "✅ Test credentials configured:"
echo "   Email: $TEST_EMAIL"
echo "   Password: [HIDDEN]"

# Ensure the auth directory exists
mkdir -p playwright/.auth

echo ""
echo "🧪 Running Playwright tests with authentication..."

# Run tests with different options based on arguments
if [ "$1" = "setup-only" ]; then
  echo "🔧 Running authentication setup only..."
  npx playwright test --project=setup
elif [ "$1" = "authenticated-only" ]; then
  echo "🔒 Running authenticated tests only..."
  npx playwright test --grep "@authenticated"
elif [ "$1" = "complete-platform" ]; then
  echo "🌟 Running complete platform tests..."
  npx playwright test e2e/complete-platform.spec.ts
elif [ "$1" = "cross-browser" ]; then
  echo "🌐 Running cross-browser tests..."
  npx playwright test e2e/tests/cross-browser-quality.spec.ts
else
  echo "🔄 Running all tests with authentication..."
  npx playwright test
fi

echo ""
echo "✨ Tests completed!"
