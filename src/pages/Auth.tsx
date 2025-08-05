import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { authService } from '@/lib/auth';
import { notify } from '@/hooks/useNotifications';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, loading, error, clearError } = useAuthStore();
  useAuthRedirect(); // Add auth redirect hook
  const [mode, setMode] = useState<'signin' | 'signup' | 'verify'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');
    clearError();

    try {
      if (mode === 'signin') {
        console.log('Attempting sign in with:', email);
        await signIn(email, password);
        console.log('Sign in successful');
        notify.success('Welcome back!', 'Login Successful');
        // Navigate to the originally requested page or default to tenant dashboard
        const from = location.state?.from?.pathname || '/tenant';
        console.log('Navigating to:', from);
        navigate(from, { replace: true });
      } else if (mode === 'signup') {
        setIsLoading(true);
        await authService.signUp(email, password);
        setSuccessMessage('Account created! Please check your email for the verification code.');
        notify.info('Please check your email for verification code', 'Verification Required');
        setMode('verify');
        setIsLoading(false);
      } else if (mode === 'verify') {
        setIsLoading(true);
        await authService.confirmSignUp(email, verificationCode);
        setSuccessMessage('Email verified successfully! You can now sign in.');
        notify.success('Email verified successfully!', 'Verification Complete');
        setMode('signin');
        setPassword('');
        setVerificationCode('');
        setIsLoading(false);
      }
    } catch (err) { void err;
      setIsLoading(false);
      setLocalError((err as Error).message || `Failed to ${mode === 'signin' ? 'sign in' : mode === 'signup' ? 'sign up' : 'verify'}`);
    }
  };

  const handleResendCode = async () => {
    setLocalError('');
    setSuccessMessage('');
    try {
      setIsLoading(true);
      await authService.resendConfirmationCode(email);
      setSuccessMessage('Verification code resent! Please check your email.');
      notify.info('Verification code resent', 'Check Your Email');
      setIsLoading(false);
    } catch (err) { void err;
      setIsLoading(false);
      setLocalError((err as Error).message || 'Failed to resend code');
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setLocalError('');
    setSuccessMessage('');
    clearError();
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'},
    wrapper: {
      width: '100%',
      maxWidth: '420px'},
    logo: {
      textAlign: 'center' as const,
      marginBottom: '32px'},
    logoText: {
      fontSize: '36px',
      fontWeight: 'bold',
      marginBottom: '8px',
      background: 'linear-gradient(to right, #a855f7, #ec4899)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'},
    subtitle: {
      color: '#9ca3af',
      fontSize: '14px'},
    card: {
      backgroundColor: '#121212',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #262626'},
    header: {
      marginBottom: '24px',
      textAlign: 'center' as const},
    title: {
      fontSize: '24px',
      fontWeight: '600',
      marginBottom: '8px',
      color: '#ffffff'},
    description: {
      fontSize: '14px',
      color: '#9ca3af'},
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px'},
    inputGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px'},
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#e5e7eb'},
    input: {
      backgroundColor: '#1f1f1f',
      border: '1px solid #374151',
      borderRadius: '8px',
      padding: '10px 16px',
      fontSize: '14px',
      color: '#ffffff',
      outline: 'none',
      transition: 'all 0.2s'},
    inputFocus: {
      borderColor: '#a855f7',
      backgroundColor: '#262626'},
    passwordWrapper: {
      position: 'relative' as const},
    passwordToggle: {
      position: 'absolute' as const,
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: '#9ca3af',
      cursor: 'pointer',
      padding: '4px'},
    rememberRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '14px'},
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#e5e7eb'},
    link: {
      color: '#a855f7',
      textDecoration: 'none',
      cursor: 'pointer'},
    errorBox: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '14px',
      color: '#ef4444'},
    successBox: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      border: '1px solid rgba(16, 185, 129, 0.2)',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '14px',
      color: '#10b981'},
    button: {
      background: 'linear-gradient(135deg, #a855f7, #ec4899)',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      padding: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'},
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'},
    divider: {
      position: 'relative' as const,
      margin: '24px 0'},
    dividerLine: {
      position: 'absolute' as const,
      inset: 0,
      display: 'flex',
      alignItems: 'center'},
    dividerBorder: {
      width: '100%',
      borderTop: '1px solid #374151'},
    dividerText: {
      position: 'relative' as const,
      display: 'flex',
      justifyContent: 'center',
      fontSize: '12px',
      textTransform: 'uppercase' as const},
    dividerTextInner: {
      backgroundColor: '#121212',
      padding: '0 8px',
      color: '#9ca3af'},
    socialButtons: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'},
    socialButton: {
      backgroundColor: 'transparent',
      border: '1px solid #374151',
      borderRadius: '8px',
      padding: '10px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s',
      color: '#e5e7eb'},
    socialButtonHover: {
      backgroundColor: '#1f1f1f',
      borderColor: '#4b5563'},
    footer: {
      marginTop: '24px',
      textAlign: 'center' as const,
      fontSize: '14px',
      color: '#9ca3af'}};

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <header style={styles.logo}>
          <h1 style={styles.logoText}>BigfootLive</h1>
          <p style={styles.subtitle}>Professional Streaming Platform</p>
        </header>

        <main style={styles.card} role="main" aria-labelledby="auth-title">
          <div style={styles.header}>
            <h2 style={styles.title}>
              {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Verify email'}
            </h2>
            <p style={styles.description}>
              {mode === 'signin' 
                ? 'Sign in to continue to BigfootLive' 
                : mode === 'signup'
                ? 'Start your streaming journey today'
                : 'Enter the code sent to your email'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {mode === 'verify' ? (
              <>
                <div style={styles.inputGroup}>
                  <label htmlFor="code" style={styles.label}>Verification Code</label>
                  <input
                    id="code"
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                    autoComplete="one-time-code"
                    style={{
                      ...styles.input,
                      textAlign: 'center',
                      fontSize: '24px',
                      letterSpacing: '0.5em',
                      fontFamily: 'monospace'}}
                    maxLength={6}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  style={{
                    ...styles.link,
                    background: 'none',
                    border: 'none',
                    fontSize: '14px',
                    opacity: isLoading ? 0.5 : 1}}
                >
                  Didn't receive a code? Resend
                </button>
              </>
            ) : (
              <>
                <div style={styles.inputGroup}>
                  <label htmlFor="email" style={styles.label}>Email address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    style={styles.input}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#a855f7';
                      e.target.style.backgroundColor = '#262626';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#374151';
                      e.target.style.backgroundColor = '#1f1f1f';
                    }}
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label htmlFor="password" style={styles.label}>Password</label>
                  <div style={styles.passwordWrapper}>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                      style={{...styles.input, paddingRight: '48px'}}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#a855f7';
                        e.target.style.backgroundColor = '#262626';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#374151';
                        e.target.style.backgroundColor = '#1f1f1f';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={styles.passwordToggle}
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                  {mode === 'signup' && (
                    <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                      Must be at least 8 characters with mixed case, numbers, and symbols
                    </p>
                  )}
                </div>

                {mode === 'signin' && (
                  <div style={styles.rememberRow}>
                    <label style={styles.checkboxLabel}>
                      <input type="checkbox" />
                      <span>Remember me</span>
                    </label>
                    <a href="#" style={styles.link}>
                      Forgot password?
                    </a>
                  </div>
                )}
              </>
            )}
            
            {(error || localError) && (
              <div style={styles.errorBox}>
                {error || localError}
              </div>
            )}
            
            {successMessage && (
              <div style={styles.successBox}>
                {successMessage}
              </div>
            )}

            <button 
              type="submit" 
              style={{
                ...styles.button,
                ...(loading || isLoading ? styles.buttonDisabled : {})}}
              disabled={loading || isLoading}
            >
              {(loading || isLoading) ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {mode === 'signin' ? 'Signing in...' : mode === 'signup' ? 'Creating account...' : 'Verifying...'}
                </>
              ) : (
                mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Verify email'
              )}
            </button>

            {mode !== 'verify' && (
              <>
                <div style={styles.divider}>
                  <div style={styles.dividerLine}>
                    <span style={styles.dividerBorder} />
                  </div>
                  <div style={styles.dividerText}>
                    <span style={styles.dividerTextInner}>Or continue with</span>
                  </div>
                </div>

                <div style={styles.socialButtons}>
                  <button 
                    type="button" 
                    style={styles.socialButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1f1f1f';
                      e.currentTarget.style.borderColor = '#4b5563';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = '#374151';
                    }}
                  >
                    Google
                  </button>
                  <button 
                    type="button" 
                    style={styles.socialButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1f1f1f';
                      e.currentTarget.style.borderColor = '#4b5563';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = '#374151';
                    }}
                  >
                    Twitch
                  </button>
                </div>
              </>
            )}
          </form>

          <div style={styles.footer}>
            {mode === 'verify' ? (
              <button
                onClick={() => {
                  setMode('signin');
                  setLocalError('');
                  setSuccessMessage('');
                  setVerificationCode('');
                }}
                style={{ ...styles.link, background: 'none', border: 'none' }}
              >
                Back to sign in
              </button>
            ) : mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={toggleMode}
                  style={{ ...styles.link, background: 'none', border: 'none', fontWeight: '600' }}
                >
                  Sign up for free
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={toggleMode}
                  style={{ ...styles.link, background: 'none', border: 'none', fontWeight: '600' }}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}