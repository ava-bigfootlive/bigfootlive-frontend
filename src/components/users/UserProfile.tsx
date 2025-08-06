import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  Shield, 
  Edit3,
  Camera,
  Save,
  X,
  Badge as BadgeIcon,
  Building,
  UserCheck,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { User as UserType, UserPreferences, UpdateUserRequest } from '@/types/user';
import { apiService } from '@/services/api';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

interface UserProfileProps {
  userId?: string;
  user?: UserType;
  isOwnProfile?: boolean;
  onUserUpdate?: (user: UserType) => void;
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  userId,
  user: initialUser,
  isOwnProfile = false,
  onUserUpdate,
  className = ""
}) => {
  const [user, setUser] = useState<UserType | null>(initialUser || null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialUser);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<UpdateUserRequest>({});
  const [activeTab, setActiveTab] = useState('profile');
  
  const { isFeatureEnabled } = useFeatureFlags();

  useEffect(() => {
    if (!initialUser && userId) {
      loadUser(userId);
    }
  }, [userId, initialUser]);

  const loadUser = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.getUser(id);
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStart = () => {
    if (!user) return;
    
    setEditForm({
      displayName: user.displayName,
      firstName: user.firstName,
      lastName: user.lastName,
      title: user.title,
      department: user.department,
      bio: user.bio,
      location: user.location,
      phone: user.phone,
    });
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setEditForm({});
    setIsEditing(false);
  };

  const handleEditSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const response = await apiService.updateUser(user.id, editForm);
      if (response.success) {
        setUser(response.data);
        onUserUpdate?.(response.data);
        setIsEditing(false);
        setEditForm({});
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    
    // TODO: Implement avatar upload
    console.log('Upload avatar:', file);
  };

  const handlePreferencesUpdate = async (preferences: Partial<UserPreferences>) => {
    if (!user) return;
    
    try {
      const response = await apiService.updateUser(user.id, { preferences });
      if (response.success) {
        setUser(response.data);
        onUserUpdate?.(response.data);
      }
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const getInitials = (user: UserType) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.displayName.slice(0, 2).toUpperCase();
  };

  const getStatusColor = (status: UserType['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'suspended': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-500';
      case 'admin': return 'bg-blue-500';
      case 'moderator': return 'bg-purple-500';
      case 'streamer': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">User not found</h3>
        <p className="text-muted-foreground">The user you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{getInitials(user)}</AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                        variant="secondary"
                      >
                        <Camera size={12} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Profile Picture</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                <div 
                  className={`absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${getStatusColor(user.status)}`}
                  title={user.status}
                />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold">{user.displayName}</h2>
                <p className="text-muted-foreground">@{user.username}</p>
                {user.title && (
                  <p className="text-sm text-muted-foreground">{user.title}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="capitalize">
                {user.status}
              </Badge>
              {isOwnProfile && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={isEditing ? handleEditCancel : handleEditStart}
                  disabled={isSaving}
                >
                  {isEditing ? <X size={16} /> : <Edit3 size={16} />}
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              )}
              {isEditing && (
                <Button 
                  size="sm"
                  onClick={handleEditSave}
                  disabled={isSaving}
                >
                  <Save size={16} className="mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          {isOwnProfile && <TabsTrigger value="preferences">Preferences</TabsTrigger>}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User size={20} />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.firstName || ''}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm">{user.firstName || 'Not set'}</p>
                    )}
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.lastName || ''}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm">{user.lastName || 'Not set'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Display Name</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.displayName || ''}
                      onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm">{user.displayName}</p>
                  )}
                </div>

                <div>
                  <Label>Bio</Label>
                  {isEditing ? (
                    <Textarea
                      value={editForm.bio || ''}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm">{user.bio || 'No bio yet'}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building size={20} />
                  <span>Work Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Job Title</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm">{user.title || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <Label>Department</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.department || ''}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm">{user.department || 'Not set'}</p>
                  )}
                </div>

                {user.employeeId && (
                  <div>
                    <Label>Employee ID</Label>
                    <p className="text-sm">{user.employeeId}</p>
                  </div>
                )}

                {user.manager && (
                  <div>
                    <Label>Manager</Label>
                    <p className="text-sm">{user.manager}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail size={20} />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm">{user.email}</p>
                    {user.emailVerified ? (
                      <Badge className="h-5">
                        <UserCheck size={12} className="mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="h-5">
                        Not verified
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Phone</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm">{user.phone || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <Label>Location</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.location || ''}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm">{user.location || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <Label>Timezone</Label>
                  <p className="text-sm">{user.timezone || 'Not set'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar size={20} />
                  <span>Account Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Member Since</Label>
                  <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>

                <div>
                  <Label>Last Login</Label>
                  <p className="text-sm">
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleString()
                      : 'Never'
                    }
                  </p>
                </div>

                <div>
                  <Label>Last Updated</Label>
                  <p className="text-sm">{new Date(user.updatedAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Roles & Permissions Tab */}
        <TabsContent value="roles">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield size={20} />
                  <span>Roles</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {user.roles.map((role) => (
                    <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Badge className={getRoleBadgeColor(role.name)}>
                          {role.displayName}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {role.description}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {user.roles.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No roles assigned
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BadgeIcon size={20} />
                  <span>Groups</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {user.groups.map((group) => (
                    <div key={group.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" style={{ backgroundColor: group.color }}>
                          {group.displayName}
                        </Badge>
                        <span className="text-sm text-muted-foreground capitalize">
                          {group.type}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {user.groups.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No groups assigned
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock size={20} />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <Clock size={48} className="mx-auto mb-4 opacity-50" />
                <p>Activity tracking coming soon</p>
                <p className="text-xs">User activities and audit logs will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab (only for own profile) */}
        {isOwnProfile && (
          <TabsContent value="preferences">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings size={20} />
                    <span>General Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Theme</Label>
                    <Select 
                      value={user.preferences.theme}
                      onValueChange={(value) => handlePreferencesUpdate({ 
                        theme: value as 'light' | 'dark' | 'system' 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Language</Label>
                    <Select value={user.preferences.language}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Time Format</Label>
                    <Select 
                      value={user.preferences.timeFormat}
                      onValueChange={(value) => handlePreferencesUpdate({ 
                        timeFormat: value as '12h' | '24h' 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12 Hour</SelectItem>
                        <SelectItem value="24h">24 Hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye size={20} />
                    <span>Privacy Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Online Status</Label>
                      <p className="text-xs text-muted-foreground">
                        Let others see when you're online
                      </p>
                    </div>
                    <Switch 
                      checked={user.preferences.privacy.showOnlineStatus}
                      onCheckedChange={(checked) => handlePreferencesUpdate({
                        privacy: { ...user.preferences.privacy, showOnlineStatus: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Direct Messages</Label>
                      <p className="text-xs text-muted-foreground">
                        Allow others to send you direct messages
                      </p>
                    </div>
                    <Switch 
                      checked={user.preferences.privacy.allowDirectMessages}
                      onCheckedChange={(checked) => handlePreferencesUpdate({
                        privacy: { ...user.preferences.privacy, allowDirectMessages: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Mentions</Label>
                      <p className="text-xs text-muted-foreground">
                        Allow others to mention you in chat
                      </p>
                    </div>
                    <Switch 
                      checked={user.preferences.privacy.allowMentions}
                      onCheckedChange={(checked) => handlePreferencesUpdate({
                        privacy: { ...user.preferences.privacy, allowMentions: checked }
                      })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
