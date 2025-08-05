import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { DonationAlert } from '@/components/notifications/NotificationDropdown';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { LogOut, User } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export function DashboardLayout() {
  const { signOut } = useAuthStore();

  return (
    <div className="flex h-screen dashboard-layout">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="main-header">
          <div className="header-content">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                BigfootLive
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <DonationAlert />
              <Button variant="ghost" size="icon" className="hover-glow">
                <User className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                title="Sign out"
                className="hover-glow"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>
        {/* Main content */}
        <main className="flex-1 overflow-y-auto main-content">
          <div className="content-wrapper">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}