import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Info } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Data Available",
  message,
  icon = <BarChart3 className="h-12 w-12 text-gray-400" />
}) => {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <div className="mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-muted-foreground max-w-sm">
          {message}
        </p>
      </CardContent>
    </Card>
  );
};
