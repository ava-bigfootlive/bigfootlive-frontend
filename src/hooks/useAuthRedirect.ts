import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

export function useAuthRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (!loading && user && location.pathname === '/login') {
      // User is logged in but still on login page, redirect to dashboard
      const from = location.state?.from?.pathname || '/tenant';
      console.log('Auth redirect: User logged in, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [user, loading, location, navigate]);

  return { user, loading };
}