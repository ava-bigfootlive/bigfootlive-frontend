import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AuthRequest, SSOProvider, MFAMethod } from '../../types/auth';

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  redirectUrl?: string;
  className?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  redirectUrl,
  className = ''
}) => {
  const {
    login,
    loginWithSSO,
    verifyMFA,
    ssoProviders,
    requiresMFA,
    mfaMethods,
    mfaChallengeId,
    isLoading,
    error,
    clearError
  } = useAuth();

  // Form state
  const [formData, setFormData] = useState<AuthRequest>({
    email: '',
    password: '',
    rememberMe: false
  });
  
  // MFA state
  const [mfaCode, setMfaCode] = useState('');
  const [selectedMfaMethod, setSelectedMfaMethod] = useState<string>('');
  const [mfaStep, setMfaStep] = useState(false);
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null);

  // Set MFA step when MFA is required
  useEffect(() => {
    setMfaStep(requiresMFA);
    if (requiresMFA && mfaMethods.length > 0) {
      setSelectedMfaMethod(mfaMethods[0].id);
    }
  }, [requiresMFA, mfaMethods]);

  // Handle form input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    clearError();
  }, [validationErrors, clearError]);

  // Validate form data
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Handle traditional login
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      onError?.('Account is temporarily locked. Please try again later.');
      return;
    }
    
    if (!validateForm()) return;
    
    try {
      const response = await login(formData);
      
      if (response.success) {
        setLoginAttempts(0);
        onSuccess?.();
      } else if (response.requiresMFA) {
        // MFA will be handled by the useEffect above
        setMfaStep(true);
      } else {
        setLoginAttempts(prev => prev + 1);
        if (loginAttempts >= 4) {
          setIsLocked(true);
          setLockoutTime(new Date(Date.now() + 15 * 60 * 1000)); // 15 minutes
        }
        onError?.(response.error || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setLoginAttempts(prev => prev + 1);
      onError?.(errorMessage);
    }
  }, [formData, isLocked, loginAttempts, validateForm, login, onSuccess, onError]);

  // Handle MFA verification
  const handleMfaVerification = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mfaCode.trim()) {
      onError?.('Please enter the verification code');
      return;
    }
    
    try {
      const success = await verifyMFA(mfaCode, selectedMfaMethod);
      if (success) {
        setMfaStep(false);
        setMfaCode('');
        onSuccess?.();
      } else {
        onError?.('Invalid verification code. Please try again.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'MFA verification failed';
      onError?.(errorMessage);
    }
  }, [mfaCode, selectedMfaMethod, verifyMFA, onSuccess, onError]);

  // Handle SSO login
  const handleSSOLogin = useCallback(async (providerId: string) => {
    try {
      await loginWithSSO(providerId, redirectUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'SSO login failed';
      onError?.(errorMessage);
    }
  }, [loginWithSSO, redirectUrl, onError]);

  // Lockout timer effect
  useEffect(() => {
    if (isLocked && lockoutTime) {
      const timer = setInterval(() => {
        if (Date.now() >= lockoutTime.getTime()) {
          setIsLocked(false);
          setLockoutTime(null);
          setLoginAttempts(0);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isLocked, lockoutTime]);

  // Get MFA method display name
  const getMfaMethodName = (method: MFAMethod): string => {
    switch (method.type) {
      case 'totp':
        return 'Authenticator App';
      case 'sms':
        return `SMS (${method.phoneNumber})`;
      case 'email':
        return `Email (${method.emailAddress})`;
      case 'hardware_token':
        return `Hardware Token (${method.serialNumber})`;
      case 'backup_codes':
        return 'Backup Code';
      default:
        return method.name || method.type;
    }
  };

  // Calculate remaining lockout time
  const getRemainingLockoutTime = (): string => {
    if (!lockoutTime) return '';
    const remaining = Math.ceil((lockoutTime.getTime() - Date.now()) / 1000);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`login-form ${className}`}>
      <div className="login-form__container">
        <div className="login-form__header">
          <h2 className="login-form__title">
            {mfaStep ? 'Two-Factor Authentication' : 'Sign In'}
          </h2>
          {mfaStep && !requiresMFA && (
            <p className="login-form__subtitle">
              Enter the verification code from your authenticator app
            </p>
          )}
        </div>

        {error && (
          <div className="login-form__error" role="alert">
            <span className="login-form__error-icon">⚠️</span>
            {error}
          </div>
        )}

        {isLocked && (
          <div className="login-form__lockout" role="alert">
            <span className="login-form__lockout-icon">🔒</span>
            Account temporarily locked. Try again in {getRemainingLockoutTime()}
          </div>
        )}

        {!mfaStep ? (
          <>
            {/* Traditional Login Form */}
            <form onSubmit={handleLogin} className="login-form__form">
              <div className="login-form__field">
                <label htmlFor="email" className="login-form__label">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`login-form__input ${validationErrors.email ? 'login-form__input--error' : ''}`}
                  placeholder="Enter your email"
                  disabled={isLoading || isLocked}
                  autoComplete="email"
                  required
                />
                {validationErrors.email && (
                  <span className="login-form__field-error">{validationErrors.email}</span>
                )}
              </div>

              <div className="login-form__field">
                <label htmlFor="password" className="login-form__label">
                  Password
                </label>
                <div className="login-form__password-field">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`login-form__input ${validationErrors.password ? 'login-form__input--error' : ''}`}
                    placeholder="Enter your password"
                    disabled={isLoading || isLocked}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="login-form__password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isLocked}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {validationErrors.password && (
                  <span className="login-form__field-error">{validationErrors.password}</span>
                )}
              </div>

              <div className="login-form__options">
                <label className="login-form__checkbox">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    disabled={isLoading || isLocked}
                  />
                  <span className="login-form__checkbox-text">Remember me</span>
                </label>
                
                <a href="/forgot-password" className="login-form__forgot-link">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="login-form__submit"
                disabled={isLoading || isLocked}
              >
                {isLoading ? (
                  <>
                    <span className="login-form__spinner"></span>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* SSO Options */}
            {ssoProviders.length > 0 && (
              <div className="login-form__sso">
                <div className="login-form__divider">
                  <span>or continue with</span>
                </div>
                
                <div className="login-form__sso-buttons">
                  {ssoProviders
                    .filter(provider => provider.isEnabled)
                    .map(provider => (
                      <button
                        key={provider.id}
                        type="button"
                        className="login-form__sso-button"
                        onClick={() => handleSSOLogin(provider.id)}
                        disabled={isLoading || isLocked}
                      >
                        <span className="login-form__sso-icon">
                          {getSSOProviderIcon(provider)}
                        </span>
                        {provider.displayName}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* MFA Verification Form */}
            <form onSubmit={handleMfaVerification} className="login-form__form">
              {mfaMethods.length > 1 && (
                <div className="login-form__field">
                  <label htmlFor="mfaMethod" className="login-form__label">
                    Verification Method
                  </label>
                  <select
                    id="mfaMethod"
                    value={selectedMfaMethod}
                    onChange={(e) => setSelectedMfaMethod(e.target.value)}
                    className="login-form__select"
                    disabled={isLoading}
                  >
                    {mfaMethods.map(method => (
                      <option key={method.id} value={method.id}>
                        {getMfaMethodName(method)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="login-form__field">
                <label htmlFor="mfaCode" className="login-form__label">
                  Verification Code
                </label>
                <input
                  id="mfaCode"
                  name="mfaCode"
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="login-form__input login-form__input--mfa"
                  placeholder="Enter 6-digit code"
                  disabled={isLoading}
                  autoComplete="one-time-code"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                />
              </div>

              <div className="login-form__mfa-actions">
                <button
                  type="submit"
                  className="login-form__submit"
                  disabled={isLoading || mfaCode.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <span className="login-form__spinner"></span>
                      Verifying...
                    </>
                  ) : (
                    'Verify'
                  )}
                </button>
                
                <button
                  type="button"
                  className="login-form__cancel"
                  onClick={() => {
                    setMfaStep(false);
                    setMfaCode('');
                    clearError();
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}

        {/* Additional Options */}
        <div className="login-form__footer">
          <p>
            Don't have an account?{' '}
            <a href="/signup" className="login-form__signup-link">
              Sign up
            </a>
          </p>
        </div>
      </div>

      {/* Login Form Styles */}
      <style jsx>{`
        .login-form {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .login-form__container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          width: 100%;
          max-width: 400px;
        }

        .login-form__header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-form__title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a202c;
          margin: 0 0 0.5rem 0;
        }

        .login-form__subtitle {
          color: #718096;
          margin: 0;
          font-size: 0.875rem;
        }

        .login-form__error,
        .login-form__lockout {
          background: #fed7d7;
          border: 1px solid #feb2b2;
          color: #c53030;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .login-form__lockout {
          background: #fef5e7;
          border: 1px solid #f6ad55;
          color: #c05621;
        }

        .login-form__form {
          margin-bottom: 1.5rem;
        }

        .login-form__field {
          margin-bottom: 1rem;
        }

        .login-form__label {
          display: block;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .login-form__input,
        .login-form__select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .login-form__input:focus,
        .login-form__select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .login-form__input--error {
          border-color: #e53e3e;
        }

        .login-form__input--mfa {
          text-align: center;
          font-size: 1.25rem;
          letter-spacing: 0.5rem;
          font-family: monospace;
        }

        .login-form__password-field {
          position: relative;
        }

        .login-form__password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          padding: 0.25rem;
        }

        .login-form__field-error {
          color: #e53e3e;
          font-size: 0.75rem;
          margin-top: 0.25rem;
          display: block;
        }

        .login-form__options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .login-form__checkbox {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .login-form__checkbox input {
          width: auto;
        }

        .login-form__forgot-link {
          color: #667eea;
          text-decoration: none;
          font-size: 0.875rem;
        }

        .login-form__forgot-link:hover {
          text-decoration: underline;
        }

        .login-form__submit {
          width: 100%;
          background: #667eea;
          color: white;
          border: none;
          padding: 0.875rem;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .login-form__submit:hover:not(:disabled) {
          background: #5a67d8;
        }

        .login-form__submit:disabled {
          background: #a0aec0;
          cursor: not-allowed;
        }

        .login-form__spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .login-form__sso {
          margin-bottom: 1.5rem;
        }

        .login-form__divider {
          position: relative;
          text-align: center;
          margin: 1.5rem 0;
        }

        .login-form__divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e2e8f0;
        }

        .login-form__divider span {
          background: white;
          padding: 0 1rem;
          color: #718096;
          font-size: 0.875rem;
        }

        .login-form__sso-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .login-form__sso-button {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          transition: border-color 0.2s, background-color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          font-weight: 500;
        }

        .login-form__sso-button:hover:not(:disabled) {
          border-color: #cbd5e0;
          background: #f7fafc;
        }

        .login-form__sso-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-form__sso-icon {
          font-size: 1.25rem;
        }

        .login-form__mfa-actions {
          display: flex;
          gap: 0.75rem;
        }

        .login-form__cancel {
          flex: 1;
          background: #e2e8f0;
          color: #4a5568;
          border: none;
          padding: 0.875rem;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .login-form__cancel:hover:not(:disabled) {
          background: #cbd5e0;
        }

        .login-form__footer {
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
          font-size: 0.875rem;
          color: #718096;
        }

        .login-form__signup-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }

        .login-form__signup-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .login-form__container {
            padding: 1.5rem;
          }
          
          .login-form__mfa-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

// Helper function to get SSO provider icons
function getSSOProviderIcon(provider: SSOProvider): string {
  switch (provider.type) {
    case 'saml':
      return '🔐';
    case 'oidc':
      return '🆔';
    case 'oauth2':
      return '🔑';
    case 'ldap':
    case 'active_directory':
      return '🏢';
    default:
      return '🔓';
  }
}

export default LoginForm;
