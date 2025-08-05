import React from 'react';
import { useAuthStore } from '@/store/auth';
import { AnalyticsDashboard } from '@/components/Analytics/AnalyticsDashboard';

export default function AnalyticsDashboardPage() {
  const { user } = useAuthStore();

  // Use the user's channel ID or a default if not available
  const channelId = user?.id || 'default-channel';

  return (
    <div className="container mx-auto py-6">
      <AnalyticsDashboard channelId={channelId} />
    </div>
  );
}
