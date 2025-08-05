import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile card component for displaying content with optional header, footer, title, action, description, and content sections.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SimpleCard: Story = {
  args: {
    className: 'w-full max-w-sm',
    children: (
      <>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>This is the card description.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is the main content of the card.</p>
        </CardContent>
        <CardFooter>
          <Button>Action</Button>
        </CardFooter>
      </>
    ),
  },
};

export const WithAction: Story = {
  args: {
    className: 'w-full max-w-md',
    children: (
      <>
        <CardHeader>
          <CardTitle>Interactive Card</CardTitle>
          <CardAction>
            <Button>More</Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p>Clicking on the action button can trigger further actions or links.</p>
        </CardContent>
      </>
    ),
  },
};

export const FullFeatured: Story = {
  args: {
    className: 'w-full max-w-lg',
    children: (
      <>
        <CardHeader className="border-b">
          <CardTitle className="text-xl">Full Featured Card</CardTitle>
          <CardAction>
            <Button variant="outline">Action</Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p>This card contains a header, content, and footer with actions.</p>
        </CardContent>
        <CardFooter className="border-t">
          <Button variant="destructive">Cancel</Button>
          <Button>Accept</Button>
        </CardFooter>
      </>
    ),
  },
};

