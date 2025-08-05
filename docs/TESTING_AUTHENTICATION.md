# Authentication Testing Setup

This guide explains how to run authenticated tests in the BigfootLive frontend project.

## Quick Start

### Using NPM Scripts (Recommended)

```bash
# Run all tests with authentication
npm run test:auth

# Run only authentication setup
npm run test:auth:setup

# Run complete platform tests with auth
npm run test:auth:complete

# Run authenticated feature tests
npm run test:auth:features
```

### Using the Shell Script

```bash
# Run all tests with authentication
./scripts/test-with-auth.sh

# Run specific test suites
./scripts/test-with-auth.sh setup-only
./scripts/test-with-auth.sh complete-platform
./scripts/test-with-auth.sh cross-browser
./scripts/test-with-auth.sh authenticated-only
```

### Manual Environment Variables

```bash
TEST_EMAIL=apvantaio@gmail.com TEST_PASSWORD=DisneyDemo2025# npx playwright test
```

## Authentication System

### Mock Authentication (Development)
The project uses a mock authentication system for development and testing:

- **Email**: `apvantaio@gmail.com`
- **Password**: `DisneyDemo2025#`
- **User**: Demo User with admin privileges

### How It Works

1. **Authentication Setup** (`e2e/auth.setup.ts`)
   - Runs before authenticated tests
   - Uses mock credentials to log in
   - Saves authentication state to `playwright/.auth/user.json`

2. **Test Configuration**
   - Tests marked with `storageState: 'playwright/.auth/user.json'` use saved auth
   - Mock authentication service simulates real Cognito behavior
   - Tokens are stored in localStorage for session persistence

3. **Environment Configuration**
   - `.env.test.local` contains test-specific settings
   - `VITE_FORCE_MOCK_AUTH=true` ensures mock auth is used
   - Environment variables can be overridden for different test scenarios

## Test Categories

### Authenticated Tests
Tests that require user login:
- `e2e/authenticated-features.spec.ts` - Feature-specific tests
- `e2e/complete-platform.spec.ts` - Full platform functionality
- Tests in other files marked with authentication requirements

### Public Tests
Tests that work without authentication:
- `e2e/auth.spec.ts` - Login/logout flows
- `e2e/tests/cross-browser-quality.spec.ts` - Public page testing
- Landing page and marketing page tests

## Switching to Real Cognito

When ready to use real AWS Cognito authentication:

1. **Update Environment Variables**:
   ```bash
   # Remove or set to false
   VITE_FORCE_MOCK_AUTH=false
   
   # Configure real Cognito
   VITE_COGNITO_USER_POOL_ID=your-pool-id
   VITE_COGNITO_CLIENT_ID=your-client-id
   VITE_COGNITO_REGION=your-region
   
   # Set real test credentials
   TEST_EMAIL=your-test-user@example.com
   TEST_PASSWORD=YourTestPassword123!
   ```

2. **Create Test User**:
   - Create a test user in your Cognito User Pool
   - Confirm the user (verify email if required)
   - Ensure the user has appropriate permissions

3. **Update Test Configuration**:
   - The authentication flow will automatically switch to real Cognito
   - Tests will use the same authentication patterns
   - May need to adjust timeouts for real network calls

## Troubleshooting

### Authentication Fails
- Check that mock credentials match those in `src/lib/auth.ts`
- Verify `.env.test.local` is properly configured
- Ensure authentication setup runs before tests

### Tests Skip Authentication
- Check that `TEST_EMAIL` and `TEST_PASSWORD` environment variables are set
- Verify the auth setup script completes successfully
- Look for "Authentication successful" message in test output

### Timeout Issues
- Authentication setup includes reasonable timeouts
- Mock authentication includes simulated delays
- Real Cognito may require longer timeouts

## File Structure

```
├── e2e/
│   ├── auth.setup.ts              # Authentication setup
│   ├── authenticated-features.spec.ts
│   └── complete-platform.spec.ts
├── playwright/.auth/
│   └── user.json                  # Saved authentication state
├── scripts/
│   └── test-with-auth.sh         # Authentication test script
├── .env.test.local               # Test environment configuration
└── docs/
    └── TESTING_AUTHENTICATION.md # This file
```

## Next Steps

1. **Implement Missing Features**: Many tests currently skip gracefully when features aren't implemented
2. **Add More Test Users**: Create different user roles for comprehensive testing
3. **CI/CD Integration**: Configure authentication for automated testing pipelines
4. **Real Cognito Migration**: Switch to production authentication when ready
