import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An avatar component for displaying user profile pictures with automatic fallback to initials.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face" alt="User" />
        <AvatarFallback>JD</AvatarFallback>
      </>
    ),
  },
};

export const WithFallback: Story = {
  args: {
    children: (
      <>
        <AvatarImage src="/broken-image.jpg" alt="User" />
        <AvatarFallback>AB</AvatarFallback>
      </>
    ),
  },
};

export const FallbackOnly: Story = {
  args: {
    children: <AvatarFallback>SM</AvatarFallback>,
  },
};

export const Large: Story = {
  args: {
    className: 'w-16 h-16',
    children: (
      <>
        <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" alt="User" />
        <AvatarFallback className="text-lg">GM</AvatarFallback>
      </>
    ),
  },
};

export const Small: Story = {
  args: {
    className: 'w-6 h-6',
    children: (
      <>
        <AvatarImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" alt="User" />
        <AvatarFallback className="text-xs">LP</AvatarFallback>
      </>
    ),
  },
};

export const StreamerAvatars: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face" alt="GamerPro" />
          <AvatarFallback>GP</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">GamerPro2024</p>
          <p className="text-xs text-muted-foreground">Live now</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" alt="StreamMaster" />
          <AvatarFallback>SM</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">StreamMaster</p>
          <p className="text-xs text-muted-foreground">Offline</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src="/broken-image.jpg" alt="ChillStreamer" />
          <AvatarFallback>CS</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">ChillStreamer</p>
          <p className="text-xs text-muted-foreground">42 viewers</p>
        </div>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Avatar className="w-6 h-6">
        <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face" alt="Small" />
        <AvatarFallback className="text-xs">S</AvatarFallback>
      </Avatar>
      
      <Avatar className="w-8 h-8">
        <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" alt="Default" />
        <AvatarFallback>D</AvatarFallback>
      </Avatar>
      
      <Avatar className="w-12 h-12">
        <AvatarImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" alt="Medium" />
        <AvatarFallback>M</AvatarFallback>
      </Avatar>
      
      <Avatar className="w-16 h-16">
        <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612e2a8?w=100&h=100&fit=crop&crop=face" alt="Large" />
        <AvatarFallback className="text-lg">L</AvatarFallback>
      </Avatar>
      
      <Avatar className="w-20 h-20">
        <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="Extra Large" />
        <AvatarFallback className="text-xl">XL</AvatarFallback>
      </Avatar>
    </div>
  ),
};
