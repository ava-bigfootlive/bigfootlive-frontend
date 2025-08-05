import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LiveIndicator } from '@/components/video/LiveIndicator';
import { Heart, Share2, Settings, Users, Radio } from 'lucide-react';

const meta = {
  title: 'Overview/Design System',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Complete overview of the BigfootLive design system showcasing all components in both light and dark themes.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DesignSystemOverview: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-foreground">BigfootLive Design System</h1>
        <p className="text-muted-foreground text-lg">
          A comprehensive component library for live streaming applications
        </p>
      </div>

      {/* Colors Showcase */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-20 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-medium">Primary</span>
            </div>
            <p className="text-sm text-center">Brand Purple</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-medium">Accent</span>
            </div>
            <p className="text-sm text-center">Pink/Magenta</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-destructive rounded-lg flex items-center justify-center">
              <span className="text-destructive-foreground font-medium">Danger</span>
            </div>
            <p className="text-sm text-center">Red</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 bg-success rounded-lg flex items-center justify-center">
              <span className="text-success-foreground font-medium">Success</span>
            </div>
            <p className="text-sm text-center">Green</p>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Typography</h2>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Heading 1</h1>
          <h2 className="text-3xl font-semibold">Heading 2</h2>
          <h3 className="text-2xl font-semibold">Heading 3</h3>
          <h4 className="text-xl font-semibold">Heading 4</h4>
          <p className="text-lg">Large body text for important content</p>
          <p className="text-base">Regular body text for general content</p>
          <p className="text-sm text-muted-foreground">Small text for captions and metadata</p>
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
        
        {/* Streaming-specific buttons */}
        <div className="flex flex-wrap gap-4 pt-4 border-t">
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
      </section>

      {/* Badges */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Badges</h2>
        <div className="flex flex-wrap gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          
          {/* Streaming badges */}
          <Badge variant="destructive" className="animate-pulse">
            <Radio className="h-3 w-3 mr-1" />
            LIVE
          </Badge>
          <Badge variant="secondary">
            <Users className="h-3 w-3 mr-1" />
            1,234
          </Badge>
        </div>
      </section>

      {/* Avatars */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Avatars</h2>
        <div className="flex items-center space-x-4">
          <Avatar className="h-6 w-6">
            <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face" />
            <AvatarFallback className="text-xs">S</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
            <AvatarFallback>M</AvatarFallback>
          </Avatar>
          <Avatar className="h-12 w-12">
            <AvatarImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" />
            <AvatarFallback>L</AvatarFallback>
          </Avatar>
          <Avatar className="h-16 w-16">
            <AvatarImage src="/broken-image.jpg" />
            <AvatarFallback className="text-lg">XL</AvatarFallback>
          </Avatar>
        </div>
      </section>

      {/* Live Indicators */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Live Indicators</h2>
        <div className="flex flex-wrap gap-4">
          <LiveIndicator isLive={true} />
          <LiveIndicator isLive={true} viewers={42} />
          <LiveIndicator isLive={true} viewers={1234} />
          <LiveIndicator isLive={true} viewers={25463} />
        </div>
      </section>

      {/* Form Elements */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Form Elements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Default Input</Label>
              <Input placeholder="Enter text..." />
            </div>
            <div className="space-y-2">
              <Label>Success State</Label>
              <Input success placeholder="Valid input" value="user@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Error State</Label>
              <Input error placeholder="Invalid input" value="invalid-email" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Large Input</Label>
              <Input size="lg" placeholder="Large input" />
            </div>
            <div className="space-y-2">
              <Label>Small Input</Label>
              <Input size="sm" placeholder="Small input" />
            </div>
            <div className="space-y-2">
              <Label>Disabled Input</Label>
              <Input disabled placeholder="Disabled input" />
            </div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Simple Card</CardTitle>
              <CardDescription>This is a basic card component</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card content goes here.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stream Card</CardTitle>
              <CardDescription>Live streaming example</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face" />
                  <AvatarFallback>GP</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">GamerPro2024</p>
                  <div className="flex items-center space-x-2">
                    <LiveIndicator isLive={true} viewers={1234} />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Watch Stream</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interactive Card</CardTitle>
              <CardDescription>With actions and interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card has multiple actions.</p>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Like
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Theme Toggle Hint */}
      <section className="text-center py-8 border-t">
        <p className="text-muted-foreground">
          🌙 Toggle between light and dark themes using the theme switcher in the toolbar above
        </p>
      </section>
    </div>
  ),
};

export const ComponentMatrix: Story = {
  render: () => (
    <div className="p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Component Matrix</h1>
        <p className="text-muted-foreground">All components shown in a grid layout</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Button variations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Buttons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button size="sm" className="w-full">Small</Button>
            <Button className="w-full">Default</Button>
            <Button size="lg" className="w-full">Large</Button>
          </CardContent>
        </Card>

        {/* Badge variations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Badges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div><Badge>Default</Badge></div>
            <div><Badge variant="secondary">Secondary</Badge></div>
            <div><Badge variant="outline">Outline</Badge></div>
          </CardContent>
        </Card>

        {/* Avatar variations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Avatars</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 items-center">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">S</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>M</AvatarFallback>
              </Avatar>
              <Avatar className="h-12 w-12">
                <AvatarFallback>L</AvatarFallback>
              </Avatar>
            </div>
          </CardContent>
        </Card>

        {/* Input variations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input size="sm" placeholder="Small" />
            <Input placeholder="Default" />
            <Input size="lg" placeholder="Large" />
          </CardContent>
        </Card>

        {/* Live indicators */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Live Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <LiveIndicator isLive={true} />
            <LiveIndicator isLive={true} viewers={42} />
            <LiveIndicator isLive={true} viewers={1234} />
          </CardContent>
        </Card>

        {/* Streaming elements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Streaming UI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="destructive" size="sm" className="w-full">
              <Radio className="h-3 w-3 mr-1" />
              Go Live
            </Button>
            <div className="flex space-x-1">
              <Button variant="outline" size="sm">
                <Heart className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
};
