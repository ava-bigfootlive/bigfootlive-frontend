import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const meta = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile alert component for displaying important messages with optional icons and descriptions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive'],
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: 'max-w-md',
    children: (
      <>
        <AlertTitle>Default Alert</AlertTitle>
        <AlertDescription>
          This is a default alert message with some additional information.
        </AlertDescription>
      </>
    ),
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    className: 'max-w-md',
    children: (
      <>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Something went wrong. Please try again later.
        </AlertDescription>
      </>
    ),
  },
};

export const WithIcon: Story = {
  args: {
    className: 'max-w-md',
    children: (
      <>
        <Info className="h-4 w-4" />
        <AlertTitle>Info Alert</AlertTitle>
        <AlertDescription>
          This alert includes an informational icon for better visual context.
        </AlertDescription>
      </>
    ),
  },
};

export const DestructiveWithIcon: Story = {
  args: {
    variant: 'destructive',
    className: 'max-w-md',
    children: (
      <>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Critical Error</AlertTitle>
        <AlertDescription>
          A critical error has occurred that requires immediate attention.
        </AlertDescription>
      </>
    ),
  },
};

export const StreamingAlerts: Story = {
  render: () => (
    <div className="space-y-4 max-w-lg">
      <Alert>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle>Stream Started</AlertTitle>
        <AlertDescription>
          Your live stream is now broadcasting to viewers.
        </AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Connection Lost</AlertTitle>
        <AlertDescription>
          Lost connection to streaming server. Attempting to reconnect...
        </AlertDescription>
      </Alert>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>New Viewer Milestone</AlertTitle>
        <AlertDescription>
          Congratulations! You've reached 1,000 concurrent viewers.
        </AlertDescription>
      </Alert>
    </div>
  ),
};

export const TitleOnly: Story = {
  args: {
    className: 'max-w-md',
    children: <AlertTitle>Simple Alert Title</AlertTitle>,
  },
};

export const DescriptionOnly: Story = {
  args: {
    className: 'max-w-md',
    children: (
      <AlertDescription>
        This alert only contains a description without a title.
      </AlertDescription>
    ),
  },
};
