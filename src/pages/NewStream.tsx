import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage} from '@/components/ui/form';
import { AlertCircle, Calendar, ChevronLeft, Copy, Eye, FileText, Globe, ImageIcon, Lock, Radio } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { streamingService } from '@/services/streaming';

const streamFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['immediate', 'scheduled']),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  privacy: z.enum(['public', 'private', 'unlisted']),
  category: z.string(),
  tags: z.string().optional(),
  recordStream: z.boolean(),
  enableChat: z.boolean(),
  enableDonations: z.boolean(),
  maxViewers: z.string().optional(),
  thumbnail: z.any().optional()});

type StreamFormValues = z.infer<typeof streamFormSchema>;

export default function NewStreamPage() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [streamKey] = useState('live_xxxx_xxxx_xxxx');
  const [serverUrl] = useState('rtmp://live.bigfoot.com/live');

  const styles = {
    container: {
      backgroundColor: '#0a0a0a',
      minHeight: '100vh',
      padding: '32px'},
    wrapper: {
      maxWidth: '896px',
      margin: '0 auto'},
    header: {
      marginBottom: '32px'},
    title: {
      fontSize: '30px',
      fontWeight: 'bold',
      color: '#ffffff',
      letterSpacing: '-0.025em',
      marginBottom: '4px'},
    subtitle: {
      color: '#9ca3af'},
    card: {
      backgroundColor: '#121212',
      borderRadius: '12px',
      border: '1px solid #262626',
      marginBottom: '24px'},
    cardHeader: {
      padding: '24px',
      borderBottom: '1px solid #262626'},
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: '4px'},
    cardDescription: {
      fontSize: '14px',
      color: '#9ca3af'},
    cardContent: {
      padding: '24px'},
    formItem: {
      marginBottom: '24px'},
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#e5e7eb',
      marginBottom: '8px',
      display: 'block'},
    input: {
      backgroundColor: '#1f1f1f',
      border: '1px solid #374151',
      borderRadius: '8px',
      padding: '10px 16px',
      fontSize: '14px',
      color: '#ffffff',
      outline: 'none',
      transition: 'all 0.2s',
      width: '100%'},
    textarea: {
      backgroundColor: '#1f1f1f',
      border: '1px solid #374151',
      borderRadius: '8px',
      padding: '10px 16px',
      fontSize: '14px',
      color: '#ffffff',
      outline: 'none',
      transition: 'all 0.2s',
      width: '100%',
      minHeight: '100px',
      resize: 'vertical'},
    select: {
      backgroundColor: '#1f1f1f',
      border: '1px solid #374151',
      borderRadius: '8px',
      padding: '10px 16px',
      fontSize: '14px',
      color: '#ffffff',
      outline: 'none',
      width: '100%',
      cursor: 'pointer'},
    button: {
      backgroundColor: '#1f1f1f',
      border: '1px solid #374151',
      borderRadius: '8px',
      padding: '10px 20px',
      fontSize: '14px',
      color: '#ffffff',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'},
    buttonPrimary: {
      background: 'linear-gradient(to right, #a855f7, #ec4899)',
      border: 'none'},
    radioGroup: {
      display: 'flex',
      gap: '16px',
      marginTop: '8px'},
    radioOption: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer'},
    switch: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px',
      backgroundColor: '#1f1f1f',
      borderRadius: '8px',
      marginBottom: '16px'},
    description: {
      fontSize: '12px',
      color: '#9ca3af',
      marginTop: '4px'},
    alert: {
      backgroundColor: '#7c2d12',
      border: '1px solid #c2410c',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px'},
    alertText: {
      color: '#fed7aa',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'},
    separator: {
      height: '1px',
      backgroundColor: '#262626',
      margin: '24px 0'},
    streamInfo: {
      backgroundColor: '#1f1f1f',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px'},
    code: {
      fontFamily: 'monospace',
      backgroundColor: '#0a0a0a',
      padding: '8px 12px',
      borderRadius: '4px',
      fontSize: '14px',
      color: '#a855f7',
      display: 'inline-block',
      marginTop: '8px'}};

  const form = useForm<StreamFormValues>({
    resolver: zodResolver(streamFormSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'immediate',
      privacy: 'public',
      category: 'general',
      tags: '',
      recordStream: true,
      enableChat: true,
      enableDonations: false}});

  const streamType = form.watch('type');
  const privacy = form.watch('privacy');

  const onSubmit = async (data: StreamFormValues) => {
    setIsCreating(true);
    try {
      // Create stream configuration for the streaming service
      const streamConfig = {
        expected_viewers: 100, // Default value, could be form field
        audience_regions: ['us-east-1'], // Default region
        recording_enabled: data.recordStream,
        quality_settings: {
          resolution: '1080p',
          bitrate: 4500,
          fps: 30
        }
      };

      // Launch the container using streaming service
      const result = await streamingService.launchContainer(
        `stream-${Date.now()}`, // Generate unique event ID
        streamConfig
      );

      console.log('Stream created:', result);
      
      if (data.type === 'immediate') {
        // For immediate streams, show success with RTMP endpoints
        alert(`Stream is now live! Container ID: ${result.container_id}`);
      } else {
        // For scheduled streams, just show scheduled message
        alert('Your stream has been scheduled');
      }
      
      // Navigate to the stream page with the container ID
      navigate(`/streams/${result.container_id}`);
    } catch (error) {
      console.error('Stream creation failed:', error);
      alert('Failed to create stream. Please try again.');
      setIsCreating(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button
            style={{ ...styles.button, padding: '8px' }}
            onClick={() => navigate('/streams')}
          >
            <ChevronLeft style={{ width: '20px', height: '20px' }} />
          </button>
          <div>
            <h1 style={styles.title}>Create New Stream</h1>
            <p style={styles.subtitle}>Set up your live stream in just a few steps</p>
          </div>
        </div>

        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Basic Information */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Stream Details</h2>
              <p style={styles.cardDescription}>Basic information about your stream</p>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.formItem}>
                <label style={styles.label}>Stream Title</label>
                <input
                  style={styles.input}
                  placeholder="Enter a compelling title for your stream"
                  {...form.register('title')}
                />
                <p style={styles.description}>
                  This will be displayed to viewers browsing streams
                </p>
                {form.formState.errors.title && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div style={styles.formItem}>
                <label style={styles.label}>Description</label>
                <textarea
                  style={styles.textarea}
                  placeholder="Tell viewers what your stream is about..."
                  rows={4}
                  {...form.register('description')}
                />
                <p style={styles.description}>
                  Optional description to provide more context
                </p>
                {form.formState.errors.description && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                <div style={styles.formItem}>
                  <label style={styles.label}>Category</label>
                  <select
                    style={styles.select}
                    {...form.register('category')}
                  >
                    <option value="general">General</option>
                    <option value="gaming">Gaming</option>
                    <option value="education">Education</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="business">Business</option>
                    <option value="technology">Technology</option>
                    <option value="music">Music</option>
                    <option value="sports">Sports</option>
                  </select>
                  {form.formState.errors.category && (
                    <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {form.formState.errors.category.message}
                    </p>
                  )}
                </div>

                <div style={styles.formItem}>
                  <label style={styles.label}>Tags</label>
                  <input
                    style={styles.input}
                    placeholder="gaming, tutorial, live"
                    {...form.register('tags')}
                  />
                  <p style={styles.description}>
                    Comma-separated tags
                  </p>
                  {form.formState.errors.tags && (
                    <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                      {form.formState.errors.tags.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label style={styles.label}>Thumbnail</label>
                <div style={{
                  marginTop: '8px',
                  border: '2px dashed #374151',
                  borderRadius: '8px',
                  padding: '24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'}}>
                  <ImageIcon style={{ width: '48px', height: '48px', color: '#9ca3af', margin: '0 auto' }} />
                  <p style={{ marginTop: '8px', fontSize: '14px', color: '#9ca3af' }}>
                    Click to upload or drag and drop
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>
                    PNG, JPG up to 10MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>When do you want to go live?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stream Type</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-4">
                        <label
                          className={`relative flex cursor-pointer rounded-lg border p-4 hover:bg-accent ${
                            field.value === 'immediate' ? 'border-primary bg-accent' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            value="immediate"
                            checked={field.value === 'immediate'}
                            onChange={field.onChange}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3">
                            <Radio className="h-5 w-5" />
                            <div>
                              <p className="font-medium">Go Live Now</p>
                              <p className="text-sm text-muted-foreground">
                                Start streaming immediately
                              </p>
                            </div>
                          </div>
                        </label>
                        <label
                          className={`relative flex cursor-pointer rounded-lg border p-4 hover:bg-accent ${
                            field.value === 'scheduled' ? 'border-primary bg-accent' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            value="scheduled"
                            checked={field.value === 'scheduled'}
                            onChange={field.onChange}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5" />
                            <div>
                              <p className="font-medium">Schedule</p>
                              <p className="text-sm text-muted-foreground">
                                Plan your stream for later
                              </p>
                            </div>
                          </div>
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {streamType === 'scheduled' && (
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="scheduledDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="scheduledTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Privacy & Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Permissions</CardTitle>
              <CardDescription>Control who can view your stream</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="privacy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privacy Setting</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-3 gap-4">
                        <label
                          className={`relative flex cursor-pointer rounded-lg border p-4 hover:bg-accent ${
                            field.value === 'public' ? 'border-primary bg-accent' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            value="public"
                            checked={field.value === 'public'}
                            onChange={field.onChange}
                            className="sr-only"
                          />
                          <div className="flex flex-col items-center gap-2 w-full">
                            <Globe className="h-5 w-5" />
                            <p className="font-medium">Public</p>
                            <p className="text-xs text-muted-foreground text-center">
                              Anyone can watch
                            </p>
                          </div>
                        </label>
                        <label
                          className={`relative flex cursor-pointer rounded-lg border p-4 hover:bg-accent ${
                            field.value === 'unlisted' ? 'border-primary bg-accent' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            value="unlisted"
                            checked={field.value === 'unlisted'}
                            onChange={field.onChange}
                            className="sr-only"
                          />
                          <div className="flex flex-col items-center gap-2 w-full">
                            <Eye className="h-5 w-5" />
                            <p className="font-medium">Unlisted</p>
                            <p className="text-xs text-muted-foreground text-center">
                              Only with link
                            </p>
                          </div>
                        </label>
                        <label
                          className={`relative flex cursor-pointer rounded-lg border p-4 hover:bg-accent ${
                            field.value === 'private' ? 'border-primary bg-accent' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            value="private"
                            checked={field.value === 'private'}
                            onChange={field.onChange}
                            className="sr-only"
                          />
                          <div className="flex flex-col items-center gap-2 w-full">
                            <Lock className="h-5 w-5" />
                            <p className="font-medium">Private</p>
                            <p className="text-xs text-muted-foreground text-center">
                              Invite only
                            </p>
                          </div>
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {privacy === 'private' && (
                <FormField
                  control={form.control}
                  name="maxViewers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Viewers</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="No limit" {...field} />
                      </FormControl>
                      <FormDescription>
                        Leave empty for no viewer limit
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Stream Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Stream Settings</CardTitle>
              <CardDescription>Configure your stream preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="recordStream"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Record Stream</FormLabel>
                      <FormDescription>
                        Save a recording of this stream for later viewing
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enableChat"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Live Chat</FormLabel>
                      <FormDescription>
                        Allow viewers to interact during the stream
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enableDonations"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Donations</FormLabel>
                      <FormDescription>
                        Allow viewers to send donations during the stream
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Streaming Info */}
          {streamType === 'immediate' && (
            <Card>
              <CardHeader>
                <CardTitle>Streaming Configuration</CardTitle>
                <CardDescription>Use these settings in your streaming software</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-amber-600 bg-amber-50 dark:bg-amber-950 p-4">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-sm font-medium">Keep your stream key private</p>
                  </div>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                    Never share your stream key publicly
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Server URL</Label>
                    <div className="mt-2 flex gap-2">
                      <Input value={serverUrl} readOnly />
                      <Button variant="outline" size="icon">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Stream Key</Label>
                    <div className="mt-2 flex gap-2">
                      <Input type="password" value={streamKey} readOnly />
                      <Button variant="outline" size="icon">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Recommended Settings</p>
                    <div className="grid gap-2 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Video Bitrate:</span>
                        <span className="font-mono">2500-5000 kbps</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Audio Bitrate:</span>
                        <span className="font-mono">128-256 kbps</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Resolution:</span>
                        <span className="font-mono">1920x1080</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frame Rate:</span>
                        <span className="font-mono">30 or 60 fps</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/streams')}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Save as Draft
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    {streamType === 'immediate' ? (
                      <>
                        <Radio className="mr-2 h-4 w-4" />
                        Go Live
                      </>
                    ) : (
                      <>
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Stream
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
        </Form>
      </div>
    </div>
  );
}