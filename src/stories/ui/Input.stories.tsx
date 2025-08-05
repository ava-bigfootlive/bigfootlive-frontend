import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A customizable input component with support for different sizes, variants, and validation states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg'],
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'success'],
    },
    error: {
      control: 'boolean',
    },
    success: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label htmlFor="input-with-label">Username</Label>
      <Input id="input-with-label" {...args} />
    </div>
  ),
  args: {
    placeholder: 'Enter your username',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    placeholder: 'Small input',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    placeholder: 'Large input',
  },
};

export const Error: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label htmlFor="error-input">Email</Label>
      <Input id="error-input" {...args} />
      <p className="text-sm text-destructive">Please enter a valid email address</p>
    </div>
  ),
  args: {
    error: true,
    placeholder: 'Enter email',
    value: 'invalid-email',
  },
};

export const Success: Story = {
  render: (args) => (
    <div className="space-y-2">
      <Label htmlFor="success-input">Email</Label>
      <Input id="success-input" {...args} />
      <p className="text-sm text-success">Email is valid!</p>
    </div>
  ),
  args: {
    success: true,
    placeholder: 'Enter email',
    value: 'user@example.com',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input',
    value: 'Cannot edit this',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter email address',
  },
};

export const File: Story = {
  args: {
    type: 'file',
    accept: '.jpg,.jpeg,.png,.gif',
  },
};

export const StreamingForm: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="stream-title">Stream Title</Label>
        <Input 
          id="stream-title" 
          placeholder="What are you streaming today?"
          defaultValue="Epic Gaming Session"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="stream-key">Stream Key</Label>
        <Input 
          id="stream-key" 
          type="password"
          placeholder="Your stream key"
          defaultValue="sk_live_123456789"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="viewer-limit">Max Viewers</Label>
        <Input 
          id="viewer-limit" 
          type="number"
          placeholder="1000"
          defaultValue="1000"
        />
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <Label>Small</Label>
        <Input size="sm" placeholder="Small input" />
      </div>
      <div className="space-y-2">
        <Label>Default</Label>
        <Input placeholder="Default input" />
      </div>
      <div className="space-y-2">
        <Label>Large</Label>
        <Input size="lg" placeholder="Large input" />
      </div>
    </div>
  ),
};
