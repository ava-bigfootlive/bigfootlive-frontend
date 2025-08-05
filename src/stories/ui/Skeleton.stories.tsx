import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from '@/components/ui/skeleton';

const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A skeleton component for loading states that mimics the shape of content.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: 'h-4 w-48',
  },
};

export const Circle: Story = {
  args: {
    className: 'h-12 w-12 rounded-full',
  },
};

export const Rectangle: Story = {
  args: {
    className: 'h-24 w-48',
  },
};

export const TextLine: Story = {
  args: {
    className: 'h-4 w-full max-w-sm',
  },
};

export const StreamCard: Story = {
  render: () => (
    <div className="w-80 p-6 border rounded-lg space-y-4">
      {/* Thumbnail */}
      <Skeleton className="h-48 w-full" />
      
      {/* Stream info */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      
      {/* Streamer info */}
      <div className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  ),
};

export const UserProfile: Story = {
  render: () => (
    <div className="flex items-center space-x-4 p-6">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  ),
};

export const ChatMessages: Story = {
  render: () => (
    <div className="w-80 space-y-3 p-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-start space-x-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const StreamList: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">Text Lines</p>
        <Skeleton className="h-2 w-full max-w-xs" />
        <Skeleton className="h-3 w-full max-w-sm" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-6 w-full max-w-lg" />
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Shapes</p>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-16 w-16 rounded-full" />
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium">Rectangles</p>
        <div className="space-y-2">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-16 w-64" />
          <Skeleton className="h-20 w-80" />
        </div>
      </div>
    </div>
  ),
};
