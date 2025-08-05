import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Skeleton className="h-8 w-64" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-10 w-56" />
        </div>
      </div>

      {/* Overview Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>

      {/* Tabs Skeleton */}
      <div>
        <div className="flex border-b">
          <Skeleton className="h-10 w-24 mr-4" />
          <Skeleton className="h-10 w-24 mr-4" />
          <Skeleton className="h-10 w-24 mr-4" />
          <Skeleton className="h-10 w-24 mr-4" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
