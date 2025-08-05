import React, { useState } from 'react';
import { Activity, Award, BarChart3, Cloud, Copy, CreditCard, Download, ExternalLink, Eye, EyeOff, HardDrive, Info, Key, Lock, Monitor, RefreshCw, Save, Share2, Shield, Smartphone, Upload, Video, Wifi, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger} from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/components/ui/use-toast';

// Types
interface StreamSettings {
  defaultQuality: string;
  autoRecord: boolean;
  chatEnabled: boolean;
  moderationLevel: string;
  latencyMode: string;
  adaptiveBitrate: boolean;
  maxBitrate: number;
  keyframeInterval: number;
}

interface BrandingSettings {
  primaryColor: string;
  logo: string;
  favicon: string;
  playerSkin: string;
  watermark: boolean;
  watermarkPosition: string;
  customCSS: string;
}

interface NotificationSettings {
  email: {
    streamStart: boolean;
    streamEnd: boolean;
    viewerMilestone: boolean;
    systemAlerts: boolean;
  };
  webhook: {
    enabled: boolean;
    url: string;
    events: string[];
  };
}

interface BillingInfo {
  plan: string;
  status: string;
  nextBilling: Date;
  usage: {
    storage: { used: number; total: number };
    bandwidth: { used: number; total: number };
    streams: { used: number; total: number };
  };
}

// Color Preset Component
const ColorPreset: React.FC<{ color: string; selected: boolean; onClick: () => void }> = ({ 
  color, 
  selected, 
  onClick 
}) => (
  <button
    className={cn(
      "w-10 h-10 rounded-md transition-all",
      selected && "ring-2 ring-offset-2 ring-primary"
    )}
    style={{ backgroundColor: color }}
    onClick={onClick}
  />
);

// Webhook Event Component
const WebhookEvent: React.FC<{ 
  event: string; 
  description: string; 
  enabled: boolean; 
  onToggle: () => void 
}> = ({ event, description, enabled, onToggle }) => (
  <div className="flex items-center justify-between py-3">
    <div className="space-y-0.5">
      <Label htmlFor={event} className="text-sm font-medium">
        {event}
      </Label>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <Switch
      id={event}
      checked={enabled}
      onCheckedChange={onToggle}
    />
  </div>
);

// Main Settings Component
export default function Settings() {
  const [activeTab, setActiveTab] = useState('stream');
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Settings state
  const [streamSettings, setStreamSettings] = useState<StreamSettings>({
    defaultQuality: '1080p',
    autoRecord: true,
    chatEnabled: true,
    moderationLevel: 'medium',
    latencyMode: 'normal',
    adaptiveBitrate: true,
    maxBitrate: 6000,
    keyframeInterval: 2
  });

  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>({
    primaryColor: '#8b5cf6',
    logo: '',
    favicon: '',
    playerSkin: 'default',
    watermark: false,
    watermarkPosition: 'bottom-right',
    customCSS: ''
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: {
      streamStart: true,
      streamEnd: true,
      viewerMilestone: false,
      systemAlerts: true
    },
    webhook: {
      enabled: false,
      url: '',
      events: ['stream.started', 'stream.ended']
    }
  });

  const [billingInfo] = useState<BillingInfo>({
    plan: 'Professional',
    status: 'active',
    nextBilling: new Date('2024-02-15'),
    usage: {
      storage: { used: 234, total: 500 },
      bandwidth: { used: 1240, total: 5000 },
      streams: { used: 45, total: 100 }
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully"});
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard"});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your streaming platform configuration</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="stream">Stream</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Stream Settings */}
        <TabsContent value="stream" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stream Configuration</CardTitle>
              <CardDescription>
                Default settings for your live streams
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="default-quality">Default Stream Quality</Label>
                  <Select 
                    value={streamSettings.defaultQuality} 
                    onValueChange={(value) => setStreamSettings({ ...streamSettings, defaultQuality: value })}
                  >
                    <SelectTrigger id="default-quality">
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="480p">480p (SD)</SelectItem>
                      <SelectItem value="720p">720p (HD)</SelectItem>
                      <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                      <SelectItem value="4k">4K (Ultra HD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="latency-mode">Latency Mode</Label>
                  <Select 
                    value={streamSettings.latencyMode} 
                    onValueChange={(value) => setStreamSettings({ ...streamSettings, latencyMode: value })}
                  >
                    <SelectTrigger id="latency-mode">
                      <SelectValue placeholder="Select latency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ultra-low">Ultra Low (~1-2s)</SelectItem>
                      <SelectItem value="low">Low (~3-5s)</SelectItem>
                      <SelectItem value="normal">Normal (~10-15s)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-record">Auto-Record Streams</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically save recordings of all live streams
                    </p>
                  </div>
                  <Switch
                    id="auto-record"
                    checked={streamSettings.autoRecord}
                    onCheckedChange={(checked) => setStreamSettings({ ...streamSettings, autoRecord: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="chat-enabled">Enable Live Chat</Label>
                    <p className="text-xs text-muted-foreground">
                      Allow viewers to chat during live streams
                    </p>
                  </div>
                  <Switch
                    id="chat-enabled"
                    checked={streamSettings.chatEnabled}
                    onCheckedChange={(checked) => setStreamSettings({ ...streamSettings, chatEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="adaptive-bitrate">Adaptive Bitrate Streaming</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically adjust quality based on viewer connection
                    </p>
                  </div>
                  <Switch
                    id="adaptive-bitrate"
                    checked={streamSettings.adaptiveBitrate}
                    onCheckedChange={(checked) => setStreamSettings({ ...streamSettings, adaptiveBitrate: checked })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="max-bitrate">Maximum Bitrate (kbps)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="max-bitrate"
                      min={1000}
                      max={10000}
                      step={500}
                      value={[streamSettings.maxBitrate]}
                      onValueChange={([value]) => setStreamSettings({ ...streamSettings, maxBitrate: value })}
                      className="flex-1"
                    />
                    <span className="w-20 text-right font-mono text-sm">
                      {streamSettings.maxBitrate} kbps
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keyframe-interval">Keyframe Interval (seconds)</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="keyframe-interval"
                      min={1}
                      max={10}
                      step={1}
                      value={[streamSettings.keyframeInterval]}
                      onValueChange={([value]) => setStreamSettings({ ...streamSettings, keyframeInterval: value })}
                      className="flex-1"
                    />
                    <span className="w-20 text-right font-mono text-sm">
                      {streamSettings.keyframeInterval}s
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stream Moderation</CardTitle>
              <CardDescription>
                Configure content moderation settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={streamSettings.moderationLevel} 
                onValueChange={(value) => setStreamSettings({ ...streamSettings, moderationLevel: value })}
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="off" id="mod-off" />
                    <Label htmlFor="mod-off" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-medium">Off</p>
                        <p className="text-xs text-muted-foreground">
                          No automated moderation
                        </p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="low" id="mod-low" />
                    <Label htmlFor="mod-low" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-medium">Low</p>
                        <p className="text-xs text-muted-foreground">
                          Filter obvious spam and explicit content
                        </p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="medium" id="mod-medium" />
                    <Label htmlFor="mod-medium" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-medium">Medium</p>
                        <p className="text-xs text-muted-foreground">
                          Standard moderation for most use cases
                        </p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="high" id="mod-high" />
                    <Label htmlFor="mod-high" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-medium">High</p>
                        <p className="text-xs text-muted-foreground">
                          Strict moderation for professional environments
                        </p>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Settings */}
        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brand Identity</CardTitle>
              <CardDescription>
                Customize the look and feel of your streaming platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Brand Color</Label>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6b7280'].map(color => (
                      <ColorPreset
                        key={color}
                        color={color}
                        selected={brandingSettings.primaryColor === color}
                        onClick={() => setBrandingSettings({ ...brandingSettings, primaryColor: color })}
                      />
                    ))}
                  </div>
                  <Input
                    type="color"
                    value={brandingSettings.primaryColor}
                    onChange={(e) => setBrandingSettings({ ...brandingSettings, primaryColor: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={brandingSettings.primaryColor}
                    onChange={(e) => setBrandingSettings({ ...brandingSettings, primaryColor: e.target.value })}
                    className="w-32 font-mono"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="logo"
                      type="text"
                      placeholder="Logo URL"
                      value={brandingSettings.logo}
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, logo: e.target.value })}
                    />
                    <Button variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="favicon">Favicon</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="favicon"
                      type="text"
                      placeholder="Favicon URL"
                      value={brandingSettings.favicon}
                      onChange={(e) => setBrandingSettings({ ...brandingSettings, favicon: e.target.value })}
                    />
                    <Button variant="outline" size="icon">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="watermark">Enable Watermark</Label>
                    <p className="text-xs text-muted-foreground">
                      Display your logo on streams
                    </p>
                  </div>
                  <Switch
                    id="watermark"
                    checked={brandingSettings.watermark}
                    onCheckedChange={(checked) => setBrandingSettings({ ...brandingSettings, watermark: checked })}
                  />
                </div>

                {brandingSettings.watermark && (
                  <div className="space-y-2">
                    <Label htmlFor="watermark-position">Watermark Position</Label>
                    <Select 
                      value={brandingSettings.watermarkPosition} 
                      onValueChange={(value) => setBrandingSettings({ ...brandingSettings, watermarkPosition: value })}
                    >
                      <SelectTrigger id="watermark-position">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top-left">Top Left</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Styling</CardTitle>
              <CardDescription>
                Advanced customization with CSS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="custom-css">Custom CSS</Label>
                <Textarea
                  id="custom-css"
                  placeholder="/* Add your custom CSS here */"
                  value={brandingSettings.customCSS}
                  onChange={(e) => setBrandingSettings({ ...brandingSettings, customCSS: e.target.value })}
                  className="font-mono text-sm h-40"
                />
                <p className="text-xs text-muted-foreground">
                  Override default styles with custom CSS. Use with caution.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Manage API keys and access tokens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value="pk_live_abc123def456ghi789jkl012mno345"
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard("pk_live_abc123def456ghi789jkl012mno345")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>API Documentation</AlertTitle>
                <AlertDescription>
                  View our comprehensive API documentation to integrate with your applications.
                  <Button variant="link" className="px-0 h-auto" asChild>
                    <a href="/api/docs" target="_blank" rel="noopener noreferrer">
                      View Documentation <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Integrations</CardTitle>
              <CardDescription>
                Connect with external services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="analytics">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Analytics Platforms
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                          <BarChart3 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Google Analytics</p>
                          <p className="text-sm text-muted-foreground">Track viewer behavior and engagement</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                          <Activity className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Mixpanel</p>
                          <p className="text-sm text-muted-foreground">Advanced product analytics</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="storage">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Cloud className="h-4 w-4" />
                      Storage Providers
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                          <Cloud className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Amazon S3</p>
                          <p className="text-sm text-muted-foreground">Store recordings and assets</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">Connected</Badge>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="social">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      Social Media
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                          <Video className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">YouTube</p>
                          <p className="text-sm text-muted-foreground">Auto-publish recordings</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Connect</Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure when you receive email alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-stream-start">Stream Started</Label>
                  <p className="text-xs text-muted-foreground">
                    Notify when a stream goes live
                  </p>
                </div>
                <Switch
                  id="email-stream-start"
                  checked={notificationSettings.email.streamStart}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ 
                      ...notificationSettings, 
                      email: { ...notificationSettings.email, streamStart: checked }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-stream-end">Stream Ended</Label>
                  <p className="text-xs text-muted-foreground">
                    Notify when a stream ends
                  </p>
                </div>
                <Switch
                  id="email-stream-end"
                  checked={notificationSettings.email.streamEnd}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ 
                      ...notificationSettings, 
                      email: { ...notificationSettings.email, streamEnd: checked }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-milestone">Viewer Milestones</Label>
                  <p className="text-xs text-muted-foreground">
                    Notify when reaching viewer milestones
                  </p>
                </div>
                <Switch
                  id="email-milestone"
                  checked={notificationSettings.email.viewerMilestone}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ 
                      ...notificationSettings, 
                      email: { ...notificationSettings.email, viewerMilestone: checked }
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-system">System Alerts</Label>
                  <p className="text-xs text-muted-foreground">
                    Important system notifications and warnings
                  </p>
                </div>
                <Switch
                  id="email-system"
                  checked={notificationSettings.email.systemAlerts}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ 
                      ...notificationSettings, 
                      email: { ...notificationSettings.email, systemAlerts: checked }
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Send real-time events to your servers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="webhook-enabled">Enable Webhooks</Label>
                <Switch
                  id="webhook-enabled"
                  checked={notificationSettings.webhook.enabled}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ 
                      ...notificationSettings, 
                      webhook: { ...notificationSettings.webhook, enabled: checked }
                    })
                  }
                />
              </div>

              {notificationSettings.webhook.enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <Input
                      id="webhook-url"
                      type="url"
                      placeholder="https://your-server.com/webhook"
                      value={notificationSettings.webhook.url}
                      onChange={(e) => 
                        setNotificationSettings({ 
                          ...notificationSettings, 
                          webhook: { ...notificationSettings.webhook, url: e.target.value }
                        })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="space-y-1">
                    <Label>Webhook Events</Label>
                    <div className="space-y-1">
                      <WebhookEvent
                        event="stream.started"
                        description="When a stream goes live"
                        enabled={notificationSettings.webhook.events.includes('stream.started')}
                        onToggle={() => {}}
                      />
                      <WebhookEvent
                        event="stream.ended"
                        description="When a stream ends"
                        enabled={notificationSettings.webhook.events.includes('stream.ended')}
                        onToggle={() => {}}
                      />
                      <WebhookEvent
                        event="viewer.joined"
                        description="When a viewer joins"
                        enabled={false}
                        onToggle={() => {}}
                      />
                      <WebhookEvent
                        event="recording.ready"
                        description="When a recording is processed"
                        enabled={false}
                        onToggle={() => {}}
                      />
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Test Webhook
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Protect your account and content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                      <Key className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">Enabled</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">IP Whitelist</p>
                      <p className="text-sm text-muted-foreground">
                        Restrict access by IP address
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">SSO Integration</p>
                      <p className="text-sm text-muted-foreground">
                        Single Sign-On with SAML/OAuth
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Setup</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Content Protection</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="domain-lock" className="text-sm font-normal">
                      Domain Lock
                    </Label>
                    <Switch id="domain-lock" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="geo-restrict" className="text-sm font-normal">
                      Geographic Restrictions
                    </Label>
                    <Switch id="geo-restrict" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="token-auth" className="text-sm font-normal">
                      Token Authentication
                    </Label>
                    <Switch id="token-auth" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>
                Active sessions and devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">MacBook Pro</p>
                      <p className="text-xs text-muted-foreground">
                        San Francisco, CA • Current session
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">iPhone 13</p>
                      <p className="text-xs text-muted-foreground">
                        New York, NY • 2 hours ago
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Revoke
                  </Button>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">
                Revoke All Sessions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Overview</CardTitle>
              <CardDescription>
                Current plan and usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded flex items-center justify-center">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{billingInfo.plan} Plan</p>
                    <p className="text-sm text-muted-foreground">
                      Next billing: {billingInfo.nextBilling.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">$299</p>
                  <p className="text-xs text-muted-foreground">/month</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Usage This Month</h4>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <HardDrive className="h-3 w-3" />
                        Storage
                      </span>
                      <span className="text-muted-foreground">
                        {billingInfo.usage.storage.used} / {billingInfo.usage.storage.total} GB
                      </span>
                    </div>
                    <Progress 
                      value={(billingInfo.usage.storage.used / billingInfo.usage.storage.total) * 100} 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Wifi className="h-3 w-3" />
                        Bandwidth
                      </span>
                      <span className="text-muted-foreground">
                        {billingInfo.usage.bandwidth.used} / {billingInfo.usage.bandwidth.total} GB
                      </span>
                    </div>
                    <Progress 
                      value={(billingInfo.usage.bandwidth.used / billingInfo.usage.bandwidth.total) * 100} 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Video className="h-3 w-3" />
                        Live Streams
                      </span>
                      <span className="text-muted-foreground">
                        {billingInfo.usage.streams.used} / {billingInfo.usage.streams.total}
                      </span>
                    </div>
                    <Progress 
                      value={(billingInfo.usage.streams.used / billingInfo.usage.streams.total) * 100} 
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <Button variant="outline" className="flex-1">
                  Change Plan
                </Button>
                <Button variant="outline" className="flex-1">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Update Payment
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                Recent invoices and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { date: '2024-01-15', amount: 299, status: 'paid' },
                  { date: '2023-12-15', amount: 299, status: 'paid' },
                  { date: '2023-11-15', amount: 299, status: 'paid' },
                ].map((invoice, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(invoice.date).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Professional Plan
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {invoice.status}
                      </Badge>
                      <span className="font-medium">${invoice.amount}</span>
                      <Button variant="ghost" size="sm">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Invoices
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}