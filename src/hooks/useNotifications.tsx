import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';
import { AlertCircle, Bell, CheckCircle2 as CheckCircle, CircleX as XCircle, Gift, Info, Radio, Users } from 'lucide-react';

interface Notification {
  id: string;
  type: 'stream_start' | 'viewer_milestone' | 'donation' | 'system' | 'success' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: Record<string, unknown>;
}

// Mock notification service - in production, this would connect to WebSocket/SSE
class NotificationService {
  private listeners: ((notification: Notification) => void)[] = [];
  private notifications: Notification[] = [];
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.startMockNotifications();
  }

  private startMockNotifications() {
    // Simulate incoming notifications
    this.intervalId = setInterval(() => {
      const mockNotifications = [
        {
          type: 'stream_start' as const,
          title: 'Stream Started',
          message: 'John Doe just went live!',
          data: { streamId: '123', streamerName: 'John Doe' }
        },
        {
          type: 'viewer_milestone' as const,
          title: 'Viewer Milestone',
          message: 'You just reached 1,000 viewers!',
          data: { viewerCount: 1000 }
        },
        {
          type: 'donation' as const,
          title: 'New Donation',
          message: 'Alice donated $10',
          data: { amount: 10, donorName: 'Alice' }
        },
        {
          type: 'system' as const,
          title: 'System Update',
          message: 'Platform maintenance scheduled for tonight',
          data: {}
        }
      ];

      if (Math.random() > 0.8) { // 20% chance of notification
        const randomNotification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];
        this.addNotification({
          id: Date.now().toString(),
          ...randomNotification,
          timestamp: new Date(),
          read: false
        });
      }
    }, 30000); // Check every 30 seconds
  }

  subscribe(listener: (notification: Notification) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  addNotification(notification: Notification) {
    this.notifications.unshift(notification);
    this.listeners.forEach(listener => listener(notification));
  }

  getNotifications(): Notification[] {
    return this.notifications;
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
  }

  clearAll() {
    this.notifications = [];
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

// Singleton instance
const notificationService = new NotificationService();

export function useNotifications() {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = notificationService.subscribe((notification) => {
      // Show toast notification
      const icons = {
        stream_start: <Radio className="h-4 w-4" />,
        viewer_milestone: <Users className="h-4 w-4" />,
        donation: <Gift className="h-4 w-4" />,
        system: <Bell className="h-4 w-4" />,
        success: <CheckCircle className="h-4 w-4" />,
        error: <XCircle className="h-4 w-4" />,
        info: <Info className="h-4 w-4" />
      };

      const toastOptions = {
        description: notification.message,
        icon: icons[notification.type],
        duration: 5000};

      switch (notification.type) {
        case 'error':
          toast.error(notification.title, toastOptions);
          break;
        case 'success':
          toast.success(notification.title, toastOptions);
          break;
        case 'donation':
          toast(notification.title, {
            ...toastOptions,
            className: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
            action: {
              label: 'View',
              onClick: () => console.log('View donation', notification.data)
            }
          });
          break;
        case 'stream_start':
          toast(notification.title, {
            ...toastOptions,
            action: {
              label: 'Watch',
              onClick: () => {
                if (notification.data?.streamId) {
                  window.location.href = `/streams/${notification.data.streamId}`;
                }
              }
            }
          });
          break;
        default:
          toast(notification.title, toastOptions);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const sendNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    data?: Record<string, unknown>
  ) => {
    notificationService.addNotification({
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      data
    });
  }, []);

  const getNotifications = useCallback(() => {
    return notificationService.getNotifications();
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    notificationService.markAsRead(notificationId);
  }, []);

  const markAllAsRead = useCallback(() => {
    notificationService.markAllAsRead();
  }, []);

  const clearAll = useCallback(() => {
    notificationService.clearAll();
  }, []);

  return {
    sendNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    clearAll
  };
}

// Helper functions for common notifications
export const notify = {
  success: (message: string, title = 'Success') => {
    toast.success(title, {
      description: message,
      icon: <CheckCircle className="h-4 w-4" />
    });
  },
  error: (message: string, title = 'Error') => {
    toast.error(title, {
      description: message,
      icon: <XCircle className="h-4 w-4" />
    });
  },
  info: (message: string, title = 'Info') => {
    toast(title, {
      description: message,
      icon: <Info className="h-4 w-4" />
    });
  },
  warning: (message: string, title = 'Warning') => {
    toast(title, {
      description: message,
      icon: <AlertCircle className="h-4 w-4" />,
      className: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800'
    });
  }
};