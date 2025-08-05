import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/Auth';
import StreamsPage from '@/pages/StreamsEnhanced';
import StreamView from '@/pages/StreamView';
import AnalyticsPage from '@/pages/AnalyticsEnhanced';
import AnalyticsHub from '@/pages/tenant/AnalyticsHub';
import AnalyticsDashboardPage from '@/pages/AnalyticsDashboardPage';
import AudiencePage from '@/pages/Audience';
import SettingsPage from '@/pages/SettingsEnhanced';
import NewStreamPage from '@/pages/NewStream';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
// Tenant Dashboard Pages
import TenantDashboard from '@/pages/TenantDashboard';
import Dashboard from '@/pages/tenant/Dashboard';
import LiveControlCenter from '@/pages/tenant/LiveControlCenter';
import ContentLibrary from '@/pages/tenant/ContentLibrary';
import TeamAccess from '@/pages/tenant/TeamAccess';
import InteractiveFeatures from '@/pages/tenant/InteractiveFeatures';
import Settings from '@/pages/tenant/Settings';
import DocumentationArchive from '@/pages/tenant/DocumentationArchive';
import NewSchedule from '@/pages/tenant/NewSchedule';
import ColorTest from '@/pages/ColorTest';
import { Toaster } from '@/components/ui/sonner';
import { useNotifications } from '@/hooks/useNotifications';
import { initializeTheme } from '@/lib/themes';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    // Save the attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If user is authenticated, redirect to tenant dashboard
  if (user) {
    return <Navigate to="/tenant" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  const { initialize } = useAuthStore();
  // Initialize notifications hook
  useNotifications();

  useEffect(() => {
    async function initializeApp() {
      await initializeTheme();
      await initialize();
    }
    initializeApp();
  }, [initialize]);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/auth" element={<Navigate to="/login" replace />} />
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="streams" element={<StreamsPage />} />
            <Route path="streams/new" element={<NewStreamPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="analytics-hub" element={<AnalyticsHub />} />
            <Route path="analytics-dashboard" element={<AnalyticsDashboardPage />} />
            <Route path="audience" element={<AudiencePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route
            path="/streams/:streamId"
            element={
              <ProtectedRoute>
                <StreamView />
              </ProtectedRoute>
            }
          />
          {/* Tenant Dashboard Routes */}
          <Route
            path="/tenant"
            element={
              <ProtectedRoute>
                <TenantDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="analytics" element={<AnalyticsHub />} />
            <Route path="live-control/*" element={<LiveControlCenter />} />
            <Route path="live/schedule/new" element={<NewSchedule />} />
            <Route path="content/*" element={<ContentLibrary />} />
            <Route path="team/*" element={<TeamAccess />} />
            <Route path="interactive/*" element={<InteractiveFeatures />} />
            <Route path="settings" element={<Settings />} />
            <Route path="docs" element={<DocumentationArchive />} />
          </Route>
          <Route path="/dashboard" element={<ProtectedRoute><Navigate to="/dashboard/streams" replace /></ProtectedRoute>} />
          <Route path="/color-test" element={<ColorTest />} />
        </Routes>
      </Router>
      <Toaster position="bottom-right" richColors closeButton />
    </>
  );
}