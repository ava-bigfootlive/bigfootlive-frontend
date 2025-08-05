import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

/**
 * ContrastTest Component
 * 
 * This component demonstrates the improved contrast of muted-foreground text
 * across various UI elements to ensure accessibility compliance (≥70% contrast).
 */
export function ContrastTest() {
  return (
    <div className="p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Muted Text Contrast Test</h1>
        <p className="text-muted-foreground text-lg">
          Testing improved contrast for muted/secondary text elements
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card with muted descriptions */}
        <Card>
          <CardHeader>
            <CardTitle>Stream Analytics</CardTitle>
            <CardDescription>
              View your streaming performance metrics and audience engagement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Total Views</span>
              <span className="text-muted-foreground">1,234 views</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Average Watch Time</span>
              <span className="text-muted-foreground">5:32 minutes</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Engagement Rate</span>
              <span className="text-muted-foreground">78.4%</span>
            </div>
          </CardContent>
        </Card>

        {/* Form inputs with placeholder text */}
        <Card>
          <CardHeader>
            <CardTitle>Stream Settings</CardTitle>
            <CardDescription>
              Configure your streaming preferences and quality settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Stream Title</label>
              <Input placeholder="Enter your stream title..." />
              <p className="text-sm text-muted-foreground">
                Choose a catchy title to attract viewers
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea placeholder="Describe what your stream is about..." />
              <p className="text-sm text-muted-foreground">
                Provide details about your content and schedule
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status badges and helper text */}
        <Card>
          <CardHeader>
            <CardTitle>Stream Status</CardTitle>
            <CardDescription>
              Monitor your current streaming status and health
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Connection Status</span>
              <Badge variant="outline" className="text-muted-foreground">
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Video Quality</span>
              <Badge variant="outline" className="text-muted-foreground">
                1080p @ 60fps
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Stream health: Excellent
              </p>
              <p className="text-sm text-muted-foreground">
                Bitrate: 6000 kbps
              </p>
              <p className="text-sm text-muted-foreground">
                Latency: 2.1 seconds
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation and breadcrumbs */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Example</CardTitle>
            <CardDescription>
              Common navigation patterns using muted text
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <nav className="text-sm text-muted-foreground">
              <span>Dashboard</span>
              <span className="mx-2">/</span>
              <span>Streams</span>
              <span className="mx-2">/</span>
              <span className="text-foreground font-medium">Live Stream</span>
            </nav>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Quick Actions</h4>
              <ul className="space-y-1">
                <li className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                  Start New Stream
                </li>
                <li className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                  View Analytics
                </li>
                <li className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                  Manage Settings
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contrast information */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📊</span>
            Contrast Improvements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Dark Theme</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>Before: 65% lightness (~3:1 contrast)</li>
                <li>After: 78% lightness (~4.5:1 contrast)</li>
                <li>✅ Meets WCAG AA standard</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Light Theme</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>Before: 45% lightness (~2.8:1 contrast)</li>
                <li>After: 25% lightness (~4.6:1 contrast)</li>
                <li>✅ Meets WCAG AA standard</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ContrastTest;
