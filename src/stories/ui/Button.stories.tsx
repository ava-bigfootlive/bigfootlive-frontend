import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heart, Share2, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A customizable button component built on top of Radix UI with multiple variants and sizes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
    },
    loading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    asChild: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
};

export const Icon: Story = {
  args: {
    variant: 'outline',
    size: 'icon',
    children: <Heart className="h-4 w-4" />,
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Plus className="h-4 w-4" />
        Add Item
      </>
    ),
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading...',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
};

// Streaming-specific button variants
export const StreamingActions: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2" />
        Go Live
      </Button>
      <Button variant="outline">
        <Heart className="h-4 w-4 mr-2" />
        Like
      </Button>
      <Button variant="outline">
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
      <Button size="icon" variant="ghost">
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 p-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Default</h3>
        <Button>Default</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Secondary</h3>
        <Button variant="secondary">Secondary</Button>
        <Button variant="secondary" size="sm">Small</Button>
        <Button variant="secondary" size="lg">Large</Button>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Outline</h3>
        <Button variant="outline">Outline</Button>
        <Button variant="outline" size="sm">Small</Button>
        <Button variant="outline" size="lg">Large</Button>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Ghost</h3>
        <Button variant="ghost">Ghost</Button>
        <Button variant="ghost" size="sm">Small</Button>
        <Button variant="ghost" size="lg">Large</Button>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Link</h3>
        <Button variant="link">Link</Button>
        <Button variant="link" size="sm">Small</Button>
        <Button variant="link" size="lg">Large</Button>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Destructive</h3>
        <Button variant="destructive">Destructive</Button>
        <Button variant="destructive" size="sm">Small</Button>
        <Button variant="destructive" size="lg">Large</Button>
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>Normal</Button>
      <Button loading>Loading</Button>
      <Button disabled>Disabled</Button>
      <Button loading disabled>Loading Disabled</Button>
    </div>
  ),
};
