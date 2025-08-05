import { Button } from '@/components/ui/button';
import { LiveIndicator } from './LiveIndicator';

interface StreamCardProps {
  thumbnailUrl: string;
  title: string;
  isLive: boolean;
  viewerCount?: number;
}

export function StreamCard({ thumbnailUrl, title, isLive, viewerCount }: StreamCardProps) {
  return (
    <div className="stream-card bg-dark p-4 rounded-lg shadow-md">
      <img src={thumbnailUrl} alt={title} className="w-full h-auto rounded-md" />
      <div className="content mt-2">
        <h4 className="text-xl font-semibold text-white">{title}</h4>
        <LiveIndicator isLive={isLive} viewerCount={viewerCount} className="mt-1" />
        <Button className="mt-2 w-full text-white bg-green-600">Watch</Button>
      </div>
    </div>
  );
}
