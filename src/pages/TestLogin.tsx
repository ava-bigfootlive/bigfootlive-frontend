import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { LoginForm } from '../components/auth/LoginForm';

const TestLogin: React.FC = () => {
  const handleLoginSuccess = () => {
    console.log('Login successful!');
    // In a real app, you'd redirect to dashboard or protected route
  };

  const handleLoginError = (error: string) => {
    console.error('Login error:', error);
  };

  return (
    <AuthProvider>
      <div className="test-login-page">
        <LoginForm 
          onSuccess={handleLoginSuccess}
          onError={handleLoginError}
        />
      </div>
    </AuthProvider>
  );
};

export default TestLogin;
