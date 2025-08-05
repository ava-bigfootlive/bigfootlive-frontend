import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Settings,
  Save,
  ArrowLeft,
  Play,
  Radio,
  Globe,
  Lock,
  Eye,
  Plus,
  X,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface ScheduledStream {
  title: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  timezone: string;
  visibility: 'public' | 'private' | 'unlisted';
  streamType: 'live' | 'simlive' | 'premiere';
  interactiveFeatures: {
    polls: boolean;
    qa: boolean;
    reactions: boolean;
    checkpoints: boolean;
    chat: boolean;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    webhook: boolean;
  };
  tags: string[];
  maxViewers?: number;
  autoRecord: boolean;
}

export default function NewSchedule() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [streamData, setStreamData] = useState<ScheduledStream>({
    title: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    visibility: 'public',
    streamType: 'live',
    interactiveFeatures: {
      polls: true,
      qa: true,
      reactions: true,
      checkpoints: false,
      chat: true,
    },
    notifications: {
      email: true,
      sms: false,
      webhook: false,
    },
    tags: [],
    autoRecord: true,
  });

  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field: keyof ScheduledStream, value: string | boolean) => {
    setStreamData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeatureToggle = (feature: keyof ScheduledStream['interactiveFeatures']) => {
    setStreamData(prev => ({
      ...prev,
      interactiveFeatures: {
        ...prev.interactiveFeatures,
        [feature]: !prev.interactiveFeatures[feature]
      }
    }));
  };

  const handleNotificationToggle = (notification: keyof ScheduledStream['notifications']) => {
    setStreamData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [notification]: !prev.notifications[notification]
      }
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !streamData.tags.includes(newTag.trim())) {
      setStreamData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setStreamData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // TODO: API call to create scheduled stream
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      toast({
        title: "Stream Scheduled Successfully",
        description: `${streamData.title} has been scheduled for ${streamData.scheduledDate} at ${streamData.scheduledTime}`,
      });
      
      navigate('/tenant/live-control');
    } catch {
      toast({
        title: "Error",
        description: "Failed to schedule stream. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Stream Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter your stream title..."
                  value={streamData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your stream content..."
                  value={streamData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Scheduled Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={streamData.scheduledDate}
                    onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Scheduled Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={streamData.scheduledTime}
                    onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={streamData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Stream Type</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'live', label: 'Live Stream', icon: Radio, desc: 'Real-time streaming' },
                    { value: 'simlive', label: 'SimLive', icon: Play, desc: 'Pre-recorded as live' },
                    { value: 'premiere', label: 'Premiere', icon: Calendar, desc: 'Scheduled premiere' }
                  ].map(({ value, label, icon: Icon, desc }) => (
                    <Card
                      key={value}
                      className={cn(
                        "cursor-pointer transition-all",
                        streamData.streamType === value ? "ring-2 ring-primary" : "hover:bg-muted/50"
                      )}
                      onClick={() => handleInputChange('streamType', value)}
                    >
                      <CardContent className="p-4 text-center">
                        <Icon className="h-6 w-6 mx-auto mb-2" />
                        <h4 className="font-medium">{label}</h4>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Visibility</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'public', label: 'Public', icon: Globe, desc: 'Anyone can find and watch' },
                    { value: 'unlisted', label: 'Unlisted', icon: Eye, desc: 'Only with link' },
                    { value: 'private', label: 'Private', icon: Lock, desc: 'Invite only' }
                  ].map(({ value, label, icon: Icon, desc }) => (
                    <Card
                      key={value}
                      className={cn(
                        "cursor-pointer transition-all",
                        streamData.visibility === value ? "ring-2 ring-primary" : "hover:bg-muted/50"
                      )}
                      onClick={() => handleInputChange('visibility', value)}
                    >
                      <CardContent className="p-4 text-center">
                        <Icon className="h-5 w-5 mx-auto mb-2" />
                        <h4 className="font-medium text-sm">{label}</h4>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {streamData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {streamData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Interactive Features</Label>
                <p className="text-sm text-muted-foreground mb-4">Enable features to engage with your audience</p>
                <div className="space-y-3">
                  {[
                    { key: 'chat', label: 'Live Chat', desc: 'Allow viewers to chat during the stream' },
                    { key: 'reactions', label: 'Reactions', desc: 'Enable emoji reactions from viewers' },
                    { key: 'polls', label: 'Live Polls', desc: 'Create interactive polls during stream' },
                    { key: 'qa', label: 'Q&A', desc: 'Let viewers submit questions' },
                    { key: 'checkpoints', label: 'Checkpoints', desc: 'Mark important moments in your stream' }
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{label}</h4>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                      <Switch
                        checked={streamData.interactiveFeatures[key as keyof typeof streamData.interactiveFeatures]}
                        onCheckedChange={() => handleFeatureToggle(key as keyof typeof streamData.interactiveFeatures)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium">Notifications</Label>
                <p className="text-sm text-muted-foreground mb-4">Choose how you want to be notified</p>
                <div className="space-y-3">
                  {[
                    { key: 'email', label: 'Email Notifications', desc: 'Stream start/end notifications via email' },
                    { key: 'sms', label: 'SMS Notifications', desc: 'Text message alerts for important events' },
                    { key: 'webhook', label: 'Webhook Integration', desc: 'Send events to your webhook endpoint' }
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{label}</h4>
                        <p className="text-sm text-muted-foreground">{desc}</p>
                      </div>
                      <Switch
                        checked={streamData.notifications[key as keyof typeof streamData.notifications]}
                        onCheckedChange={() => handleNotificationToggle(key as keyof typeof streamData.notifications)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Auto Recording</h4>
                  <p className="text-sm text-muted-foreground">Automatically record your stream</p>
                </div>
                <Switch
                  checked={streamData.autoRecord}
                  onCheckedChange={(checked) => handleInputChange('autoRecord', checked)}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return streamData.title.trim() && streamData.scheduledDate && streamData.scheduledTime;
      case 2:
        return true; // All step 2 fields have defaults
      case 3:
        return true; // All step 3 fields have defaults
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/tenant/live-control')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Schedule New Stream</h1>
          <p className="text-muted-foreground">Plan your upcoming broadcast</p>
        </div>
      </div>

      {/* Step Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: 'Basic Info', icon: Info },
              { step: 2, title: 'Stream Settings', icon: Settings },
              { step: 3, title: 'Features & Notifications', icon: Users }
            ].map(({ step, title, icon: Icon }, index) => (
              <div key={step} className="flex items-center">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                  currentStep >= step 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "border-muted-foreground/30"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className={cn(
                    "font-medium",
                    currentStep >= step ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {title}
                  </p>
                </div>
                {index < 2 && (
                  <div className={cn(
                    "ml-8 w-16 h-0.5 transition-colors",
                    currentStep > step ? "bg-primary" : "bg-muted-foreground/30"
                  )} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            Step {currentStep}: {
              currentStep === 1 ? 'Basic Information' :
              currentStep === 2 ? 'Stream Configuration' :
              'Features & Settings'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        
        <div className="flex items-center gap-2">
          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!isStepValid()}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Schedule Stream
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
