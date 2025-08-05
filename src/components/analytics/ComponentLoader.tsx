import React from 'react';

interface ComponentLoaderProps {
  message?: string;
}

export const ComponentLoader: React.FC<ComponentLoaderProps> = ({ 
  message = "Loading component..." 
}) => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full w-6 h-6 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-muted-foreground">{message}</span>
    </div>
  );
};
