import { cn } from '@/lib/utils';

interface LiveIndicatorProps {
  isLive: boolean;
  viewers?: number;
  className?: string;
}

export function LiveIndicator({ isLive, viewers, className }: LiveIndicatorProps) {
  if (!isLive) return null;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-1.5 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
        LIVE
      </div>
      {viewers !== undefined && (
        <div className="bg-black/60 text-white px-2 py-1 rounded text-xs">
          {viewers.toLocaleString()} watching
        </div>
      )}
    </div>
  );
}