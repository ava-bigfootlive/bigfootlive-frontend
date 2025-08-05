import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface AnalyticsErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const AnalyticsError: React.FC<AnalyticsErrorProps> = ({
  title = "Something went wrong",
  message,
  onRetry,
  showRetry = true
}) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <CardTitle className="text-lg font-semibold text-red-600">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          {message}
        </p>
        {showRetry && onRetry && (
          <Button onClick={onRetry} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
