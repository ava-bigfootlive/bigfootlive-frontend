import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage} from '@/components/ui/form';
import { AlertCircle, Bell, CheckCircle2, CreditCard, Key, Loader2, Mail, Monitor, Moon, Palette, Radio, Save, Shield, Smartphone, Sun, User, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

// Form schemas
const profileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  bio: z.string().max(160).optional()});

const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  streamAlerts: z.boolean(),
  viewerEngagement: z.boolean(),
  weeklyReports: z.boolean()});

const streamingFormSchema = z.object({
  streamKey: z.string().min(1, 'Stream key is required'),
  serverUrl: z.string().url('Invalid server URL'),
  bitrate: z.string(),
  resolution: z.string(),
  autoRecord: z.boolean()});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;
type StreamingFormValues = z.infer<typeof streamingFormSchema>;

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [activeTab, setActiveTab] = useState('profile');

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
    tabsList: {
      backgroundColor: '#121212',
      border: '1px solid #262626',
      borderRadius: '8px',
      padding: '4px',
      display: 'inline-flex',
      gap: '4px',
      marginBottom: '24px'},
    tabTrigger: {
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 16px',
      fontSize: '14px',
      color: '#9ca3af',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s'},
    tabTriggerActive: {
      backgroundColor: '#1f1f1f',
      color: '#ffffff'},
    card: {
      backgroundColor: '#121212',
      borderRadius: '12px',
      border: '1px solid #262626',
      marginBottom: '16px'},
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
      minHeight: '80px',
      resize: 'vertical'},
    description: {
      fontSize: '12px',
      color: '#9ca3af',
      marginTop: '4px'},
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
    switch: {
      width: '44px',
      height: '24px',
      backgroundColor: '#374151',
      borderRadius: '12px',
      position: 'relative' as const,
      cursor: 'pointer',
      transition: 'background-color 0.2s'},
    switchActive: {
      backgroundColor: '#a855f7'},
    switchThumb: {
      position: 'absolute' as const,
      top: '2px',
      left: '2px',
      width: '20px',
      height: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '50%',
      transition: 'transform 0.2s'},
    switchThumbActive: {
      transform: 'translateX(20px)'},
    notification: {
      border: '1px solid #262626',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'},
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
    successMessage: {
      color: '#10b981',
      fontSize: '14px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'},
    badge: {
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '500',
      backgroundColor: '#374151',
      color: '#9ca3af'},
    colorButton: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      border: '2px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.2s'},
    separator: {
      height: '1px',
      backgroundColor: '#262626',
      margin: '24px 0'}};

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      bio: ''}});

  // Notification form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: false,
      streamAlerts: true,
      viewerEngagement: true,
      weeklyReports: false}});

  // Streaming form
  const streamingForm = useForm<StreamingFormValues>({
    resolver: zodResolver(streamingFormSchema),
    defaultValues: {
      streamKey: '',
      serverUrl: 'rtmp://live.bigfoot.com/live',
      bitrate: '2500',
      resolution: '1920x1080',
      autoRecord: true}});

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setSaveStatus('saving');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Profile data:', data);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const onNotificationSubmit = async (data: NotificationFormValues) => {
    setSaveStatus('saving');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Notification data:', data);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const onStreamingSubmit = async (data: StreamingFormValues) => {
    setSaveStatus('saving');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Streaming data:', data);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>Settings</h1>
          <p style={styles.subtitle}>Manage your account and streaming preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <button
              style={{ ...styles.tabTrigger, ...(activeTab === 'profile' ? styles.tabTriggerActive : {}) }}
              onClick={() => setActiveTab('profile')}
            >
              <User style={{ width: '16px', height: '16px' }} />
              Profile
            </button>
            <button 
              style={{ ...styles.tabTrigger, ...(activeTab === 'notifications' ? styles.tabTriggerActive : {}) }}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell style={{ width: '16px', height: '16px' }} />
              Notifications
            </button>
            <button 
              style={{ ...styles.tabTrigger, ...(activeTab === 'streaming' ? styles.tabTriggerActive : {}) }}
              onClick={() => setActiveTab('streaming')}
            >
              <Radio style={{ width: '16px', height: '16px' }} />
              Streaming
            </button>
            <button 
              style={{ ...styles.tabTrigger, ...(activeTab === 'appearance' ? styles.tabTriggerActive : {}) }}
              onClick={() => setActiveTab('appearance')}
            >
              <Palette style={{ width: '16px', height: '16px' }} />
              Appearance
            </button>
            <button 
              style={{ ...styles.tabTrigger, ...(activeTab === 'security' ? styles.tabTriggerActive : {}) }}
              onClick={() => setActiveTab('security')}
            >
              <Shield style={{ width: '16px', height: '16px' }} />
              Security
            </button>
            <button 
              style={{ ...styles.tabTrigger, ...(activeTab === 'billing' ? styles.tabTriggerActive : {}) }}
              onClick={() => setActiveTab('billing')}
            >
              <CreditCard style={{ width: '16px', height: '16px' }} />
              Billing
            </button>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Profile Information</h2>
                <p style={styles.cardDescription}>Update your personal details and public profile</p>
              </div>
              <div style={styles.cardContent}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                  <div style={styles.formItem}>
                    <label style={styles.label}>Display Name</label>
                    <input
                      style={styles.input}
                      placeholder="John Doe"
                      {...profileForm.register('name')}
                    />
                    {profileForm.formState.errors.name && (
                      <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                        {profileForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div style={styles.formItem}>
                    <label style={styles.label}>Email Address</label>
                    <input
                      style={styles.input}
                      type="email"
                      placeholder="john@example.com"
                      {...profileForm.register('email')}
                    />
                    <p style={styles.description}>
                      This email will be used for account notifications
                    </p>
                    {profileForm.formState.errors.email && (
                      <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                        {profileForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div style={styles.formItem}>
                    <label style={styles.label}>Phone Number</label>
                    <input
                      style={styles.input}
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      {...profileForm.register('phone')}
                    />
                    {profileForm.formState.errors.phone && (
                      <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                        {profileForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div style={styles.formItem}>
                    <label style={styles.label}>Bio</label>
                    <textarea
                      style={styles.textarea}
                      placeholder="Tell viewers about yourself..."
                      {...profileForm.register('bio')}
                    />
                    <p style={styles.description}>
                      Maximum 160 characters
                    </p>
                    {profileForm.formState.errors.bio && (
                      <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                        {profileForm.formState.errors.bio.message}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      type="submit" 
                      style={{ ...styles.button, ...styles.buttonPrimary, opacity: saveStatus === 'saving' ? 0.7 : 1 }}
                      disabled={saveStatus === 'saving'}
                    >
                      {saveStatus === 'saving' ? (
                        <>
                          <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save style={{ width: '16px', height: '16px' }} />
                          Save Changes
                        </>
                      )}
                    </button>
                    {saveStatus === 'saved' && (
                      <div style={styles.successMessage}>
                        <CheckCircle2 style={{ width: '16px', height: '16px' }} />
                        Saved successfully
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              <Mail className="inline mr-2 h-4 w-4" />
                              Email Notifications
                            </FormLabel>
                            <FormDescription>
                              Receive notifications via email
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
                      control={notificationForm.control}
                      name="pushNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              <Smartphone className="inline mr-2 h-4 w-4" />
                              Push Notifications
                            </FormLabel>
                            <FormDescription>
                              Receive push notifications on your devices
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
                    <Separator />
                    <h3 className="text-lg font-medium">Notification Types</h3>
                    <FormField
                      control={notificationForm.control}
                      name="streamAlerts"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Stream Alerts</FormLabel>
                            <FormDescription>
                              When someone starts or schedules a stream
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
                      control={notificationForm.control}
                      name="viewerEngagement"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Viewer Engagement</FormLabel>
                            <FormDescription>
                              Comments, reactions, and viewer milestones
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
                      control={notificationForm.control}
                      name="weeklyReports"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Weekly Reports</FormLabel>
                            <FormDescription>
                              Performance summaries and analytics reports
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
                  </div>
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Streaming Tab */}
        <TabsContent value="streaming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Streaming Configuration</CardTitle>
              <CardDescription>Configure your streaming settings and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...streamingForm}>
                <form onSubmit={streamingForm.handleSubmit(onStreamingSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <div className="rounded-lg border border-amber-600 bg-amber-50 dark:bg-amber-950 p-4">
                      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm font-medium">Keep your stream key private</p>
                      </div>
                      <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                        Never share your stream key publicly. Anyone with this key can stream to your channel.
                      </p>
                    </div>
                    
                    <FormField
                      control={streamingForm.control}
                      name="streamKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stream Key</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input type="password" placeholder="live_xxxxx_xxxxx" {...field} />
                            </FormControl>
                            <Button type="button" variant="outline">
                              <Key className="mr-2 h-4 w-4" />
                              Generate New
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={streamingForm.control}
                      name="serverUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Server URL</FormLabel>
                          <FormControl>
                            <Input placeholder="rtmp://live.example.com/live" {...field} />
                          </FormControl>
                          <FormDescription>
                            RTMP server URL for your streaming software
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={streamingForm.control}
                        name="bitrate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bitrate (kbps)</FormLabel>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="1000">1000 kbps (Low)</option>
                              <option value="2500">2500 kbps (Medium)</option>
                              <option value="5000">5000 kbps (High)</option>
                              <option value="8000">8000 kbps (Ultra)</option>
                            </select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={streamingForm.control}
                        name="resolution"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resolution</FormLabel>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="1280x720">720p HD</option>
                              <option value="1920x1080">1080p Full HD</option>
                              <option value="2560x1440">1440p 2K</option>
                              <option value="3840x2160">2160p 4K</option>
                            </select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={streamingForm.control}
                      name="autoRecord"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Auto-Record Streams</FormLabel>
                            <FormDescription>
                              Automatically save recordings of your streams
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
                  </div>
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how BigfootLive looks for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Select your preferred theme
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    className="w-full"
                    onClick={() => setTheme('system')}
                  >
                    <Monitor className="mr-2 h-4 w-4" />
                    System
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label>Accent Color</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose your accent color
                </p>
                <div className="flex gap-2">
                  {[
                    'bg-blue-600',
                    'bg-purple-600',
                    'bg-pink-600',
                    'bg-red-600',
                    'bg-orange-600',
                    'bg-green-600',
                  ].map((color) => (
                    <button
                      key={color}
                      className={`h-8 w-8 rounded-full ${color} ring-2 ring-offset-2 ring-offset-background hover:ring-primary`}
                    />
                  ))}
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable smooth animations and transitions
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Reduced Motion</Label>
                  <p className="text-sm text-muted-foreground">
                    Minimize animations for accessibility
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Badge variant="secondary">Disabled</Badge>
                  </div>
                  <Button>
                    <Shield className="mr-2 h-4 w-4" />
                    Enable 2FA
                  </Button>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">Password</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Last changed 45 days ago
                  </p>
                  <Button variant="outline">
                    <Key className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">Active Sessions</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage devices where you're signed in
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Chrome on Windows</p>
                          <p className="text-sm text-muted-foreground">Current session</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Mobile App - iOS</p>
                          <p className="text-sm text-muted-foreground">Last active 2 days ago</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Revoke
                      </Button>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-4">
                    View All Sessions
                  </Button>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-2">API Keys</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage API keys for third-party integrations
                  </p>
                  <Button variant="outline">
                    <Zap className="mr-2 h-4 w-4" />
                    Manage API Keys
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border p-6 bg-muted/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Professional Plan</h3>
                    <p className="text-sm text-muted-foreground">$49/month</p>
                  </div>
                  <Badge>Active</Badge>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Unlimited streaming hours
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Advanced analytics
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Priority support
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Change Plan</Button>
                  <Button variant="outline">Cancel Subscription</Button>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-4">Payment Method</h3>
                <div className="rounded-lg border p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/25</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Update
                  </Button>
                </div>
                <Button variant="outline" className="mt-4">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-4">Billing History</h3>
                <div className="space-y-3">
                  {[
                    { date: '2024-01-01', amount: '$49.00', status: 'Paid' },
                    { date: '2023-12-01', amount: '$49.00', status: 'Paid' },
                    { date: '2023-11-01', amount: '$49.00', status: 'Paid' },
                  ].map((invoice, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium">{invoice.date}</p>
                        <p className="text-sm text-muted-foreground">Monthly subscription</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{invoice.amount}</span>
                        <Badge variant="secondary">{invoice.status}</Badge>
                        <Button variant="ghost" size="sm">
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-4">
                  View All Invoices
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}