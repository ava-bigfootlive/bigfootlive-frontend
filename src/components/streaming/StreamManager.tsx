import { useState } from 'react';
import { StreamSetup } from './StreamSetup';
import { StreamControlCenter } from './StreamControlCenter';
import { type LaunchResponse } from '@/services/streaming';

interface StreamManagerProps {
  eventId: string;
  streamKey: string;
}

export function StreamManager({ eventId, streamKey }: StreamManagerProps) {
  const [launchResponse, setLaunchResponse] = useState<LaunchResponse | null>(null);

  const handleLaunchSuccess = (response: LaunchResponse) => {
    setLaunchResponse(response);
  };

  const handleStreamEnd = () => {
    setLaunchResponse(null);
  };

  if (launchResponse) {
    return (
      <StreamControlCenter
        launchResponse={launchResponse}
        onStreamEnd={handleStreamEnd}
      />
    );
  }

  return (
    <StreamSetup
      eventId={eventId}
      streamKey={streamKey}
      onLaunchSuccess={handleLaunchSuccess}
      onLaunchError={(error) => console.error('Launch failed:', error)}
    />
  );
}

