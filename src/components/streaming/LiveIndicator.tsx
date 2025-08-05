import { Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveIndicatorProps {
  isLive: boolean;
  viewerCount?: number;
  className?: string;
}

export function LiveIndicator({ isLive, viewerCount, className }: LiveIndicatorProps) {
  if (!isLive) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="live-indicator">
        <Radio className="h-3 w-3 mr-1" />
        LIVE
      </div>
      {viewerCount && (
        <div className="viewer-count">
          {viewerCount.toLocaleString()} viewers
        </div>
      )}
    </div>
  );
}
