import React, { memo } from 'react';
import { ResponsiveContainer } from 'recharts';

interface ChartWrapperProps {
  children: React.ReactNode;
  width?: string | number;
  height?: number;
  className?: string;
}

export const ChartWrapper = memo<ChartWrapperProps>(({ 
  children, 
  width = "100%", 
  height = 300,
  className = ""
}) => {
  return (
    <div className={`chart-container ${className}`}>
      <ResponsiveContainer width={width} height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
});

ChartWrapper.displayName = 'ChartWrapper';
