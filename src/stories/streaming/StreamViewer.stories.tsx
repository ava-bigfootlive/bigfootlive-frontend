import type { Meta, StoryObj } from '@storybook/react-vite';
import { StreamViewer } from '@/components/streaming/StreamViewer';

const meta = {
  title: 'Streaming/StreamViewer',
  component: StreamViewer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A comprehensive streaming viewer component with video player, chat, and interaction features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isLive: {
      control: 'boolean',
    },
    viewerCount: {
      control: 'number',
    },
    title: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
    streamerName: {
      control: 'text',
    },
    streamerAvatar: {
      control: 'text',
    },
  },
} satisfies Meta<typeof StreamViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LiveStream: Story = {
  args: {
    streamId: 'stream-123',
    hlsUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    title: 'Epic Gaming Session - Exploring New Worlds',
    description: 'Join me as we explore the mystical lands of Azeroth in this epic adventure. Today we\'ll be tackling the latest raid and showcasing some amazing new strategies!',
    streamerName: 'GamerPro2024',
    streamerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
    isLive: true,
    viewerCount: 1234,
  },
};

export const OfflineStream: Story = {
  args: {
    streamId: 'stream-456',
    hlsUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    title: 'Previous Stream: Amazing Gameplay',
    description: 'This is a recorded stream from yesterday\'s gaming session.',
    streamerName: 'StreamMaster',
    streamerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    isLive: false,
    viewerCount: 523,
  },
};

export const HighViewerCount: Story = {
  args: {
    streamId: 'stream-789',
    hlsUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    title: 'TOURNAMENT FINAL - Don\'t Miss This!',
    description: 'The championship match is happening NOW! Two of the best players going head-to-head for the ultimate prize.',
    streamerName: 'TournamentCaster',
    streamerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    isLive: true,
    viewerCount: 25463,
  },
};

export const SimpleStream: Story = {
  args: {
    streamId: 'stream-simple',
    hlsUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    title: 'Chill Stream',
    streamerName: 'ChillStreamer',
    isLive: true,
    viewerCount: 42,
  },
};

export const StreamingPreview: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  args: {
    streamId: 'stream-mobile',
    hlsUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    title: 'Mobile-Optimized Stream',
    description: 'Perfect for viewing on mobile devices with responsive chat and controls.',
    streamerName: 'MobileStreamer',
    streamerAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612e2a8?w=100&h=100&fit=crop&crop=face',
    isLive: true,
    viewerCount: 789,
  },
};
