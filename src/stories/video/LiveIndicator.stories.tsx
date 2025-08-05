import type { Meta, StoryObj } from '@storybook/react-vite';
import { LiveIndicator } from '@/components/video/LiveIndicator';

const meta = {
  title: 'Video/LiveIndicator',
  component: LiveIndicator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A component that displays a live streaming indicator with optional viewer count.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isLive: {
      control: 'boolean',
    },
    viewers: {
      control: 'number',
    },
  },
} satisfies Meta<typeof LiveIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isLive: true,
  },
};

export const WithViewers: Story = {
  args: {
    isLive: true,
    viewers: 1234,
  },
};

export const NotLive: Story = {
  args: {
    isLive: false,
    viewers: 0,
  },
};

export const HighViewerCount: Story = {
  args: {
    isLive: true,
    viewers: 25463,
  },
};

export const Examples: Story = {
  render: () => (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Live with low viewers</h3>
        <LiveIndicator isLive={true} viewers={23} />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Live with high viewers</h3>
        <LiveIndicator isLive={true} viewers={15234} />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Live without viewer count</h3>
        <LiveIndicator isLive={true} />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Not live (hidden)</h3>
        <LiveIndicator isLive={false} viewers={0} />
        <p className="text-xs text-muted-foreground mt-1">Component returns null when not live</p>
      </div>
    </div>
  ),
};
