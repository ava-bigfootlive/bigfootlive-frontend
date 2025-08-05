import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Test component to verify BigfootLive design tokens work with shadcn/ui components
 */
export function ShadcnBigfootTest() {
  return (
    <div className="p-8 space-y-6 bg-background text-foreground">
      <h1 className="text-3xl font-bold gradient-text">BigfootLive + shadcn/ui Integration Test</h1>
      
      {/* Color Token Tests */}
      <Card>
        <CardHeader>
          <CardTitle>BigfootLive Design Tokens</CardTitle>
          <CardDescription>Testing CSS variables and Tailwind classes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Brand Colors</h3>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded bg-brand" title="Brand Primary" />
                <div className="w-8 h-8 rounded bg-accent" title="Accent" />
                <div className="w-8 h-8 rounded bg-live" title="Live Red" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Semantic Colors</h3>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded bg-success" title="Success" />
                <div className="w-8 h-8 rounded bg-warning" title="Warning" />
                <div className="w-8 h-8 rounded bg-danger" title="Danger" />
                <div className="w-8 h-8 rounded bg-info" title="Info" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Component Integration</CardTitle>
          <CardDescription>shadcn/ui components with BigfootLive styling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button variant="default">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="destructive">Destructive Button</Button>
            <Button variant="ghost">Ghost Button</Button>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Custom Utilities</h4>
            <div className="p-4 glass rounded-lg">
              <p>Glass morphism effect using custom utility</p>
            </div>
            <div className="p-4 rounded-lg neon-glow-primary">
              <p>Neon glow effect using custom utility</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plugin Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Plugin Features</CardTitle>
          <CardDescription>Testing enabled Tailwind plugins</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* @tailwindcss/forms test */}
          <div className="space-y-2">
            <h4 className="font-semibold">Forms Plugin</h4>
            <input 
              type="text" 
              placeholder="Styled with @tailwindcss/forms"
              className="rounded-md border-input bg-background px-3 py-2"
            />
          </div>
          
          {/* tailwind-variant-group test */}
          <div className="space-y-2">
            <h4 className="font-semibold">Variant Groups</h4>
            <div className="(hover:bg-accent hover:text-accent-foreground) p-3 rounded border transition-colors">
              Hover to see variant group in action
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CSS Variables Test */}
      <Card>
        <CardHeader>
          <CardTitle>CSS Variables</CardTitle>
          <CardDescription>Direct CSS variable usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-primary">Primary Color</div>
            <div className="text-accent">Accent Color</div>
            <div className="text-live">Live Color</div>
            <div className="text-success">Success Color</div>
            <div className="text-warning">Warning Color</div>
            <div className="text-danger">Danger Color</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
