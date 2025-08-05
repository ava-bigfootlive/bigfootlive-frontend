import React, { useState } from 'react';
import { BarChart3, Copy, Download, Edit, ExternalLink, Eye, EyeOff, FileText, Key, Mail, MoreVertical, Plus, RefreshCw, Search, Send, Shield, Trash2, UserCheck, UserPlus, UserX, Users, Video, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger} from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastActive: Date;
  created: Date;
  avatar?: string;
  department?: string;
  permissions?: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  userCount: number;
  isSystem: boolean;
  color: string;
}

interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
  resource: string;
  actions: string[];
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  created: Date;
  lastUsed: Date | null;
  expiresAt: Date | null;
  permissions: string[];
  status: 'active' | 'expired' | 'revoked';
  usage: {
    calls: number;
    lastCall?: Date;
  };
}

// User Card Component
const UserCard: React.FC<{ user: User; onEdit: () => void }> = ({ user, onEdit }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{user.name}</h4>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getStatusColor(user.status)} className="text-xs">
                  {user.status}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {user.role}
                </Badge>
                {user.department && (
                  <span className="text-xs text-muted-foreground">
                    {user.department}
                  </span>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Key className="h-4 w-4 mr-2" />
                Reset Password
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                {user.status === 'active' ? (
                  <>
                    <UserX className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-danger">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <p>Last active: {user.lastActive.toLocaleDateString()}</p>
          <p>Member since: {user.created.toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Role Card Component
const RoleCard: React.FC<{ role: Role }> = ({ role }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="h-3 w-3 rounded-full" 
              style={{ backgroundColor: role.color }}
            />
            <CardTitle className="text-lg">{role.name}</CardTitle>
            {role.isSystem && (
              <Badge variant="secondary" className="text-xs">
                System
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>{role.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Users with this role</span>
            <span className="font-medium">{role.userCount}</span>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Key Permissions</p>
            <div className="flex flex-wrap gap-1">
              {role.permissions.slice(0, 5).map((perm) => (
                <Badge key={perm.id} variant="outline" className="text-xs">
                  {perm.name}
                </Badge>
              ))}
              {role.permissions.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{role.permissions.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// API Key Row Component
const APIKeyRow: React.FC<{ apiKey: APIKey }> = ({ apiKey }) => {
  const [showKey, setShowKey] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'warning';
      case 'revoked':
        return 'danger';
      default:
        return 'default';
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey.key);
    toast({
      title: "API Key Copied",
      description: "The API key has been copied to your clipboard"});
  };

  return (
    <TableRow>
      <TableCell>
        <div>
          <p className="font-medium">{apiKey.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
              {showKey ? apiKey.key : apiKey.key.replace(/./g, '•').slice(0, 20) + '...'}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={copyToClipboard}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={getStatusColor(apiKey.status)}>
          {apiKey.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <p>{apiKey.usage.calls.toLocaleString()} calls</p>
          {apiKey.lastUsed && (
            <p className="text-xs text-muted-foreground">
              Last used: {apiKey.lastUsed.toLocaleDateString()}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <p>Created: {apiKey.created.toLocaleDateString()}</p>
          {apiKey.expiresAt && (
            <p className="text-xs text-muted-foreground">
              Expires: {apiKey.expiresAt.toLocaleDateString()}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Edit Permissions
            </DropdownMenuItem>
            <DropdownMenuItem>
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate Key
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-danger">
              <Trash2 className="h-4 w-4 mr-2" />
              Revoke Key
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

// Invite User Dialog
const InviteUserDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    name: '',
    role: '',
    sendEmail: true,
    customMessage: ''
  });

  const handleInvite = () => {
    toast({
      title: "Invitation Sent",
      description: `Invitation sent to ${inviteData.email}`});
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
          <DialogDescription>
            Send an invitation to join your team
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email Address</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="user@example.com"
              value={inviteData.email}
              onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-name">Full Name</Label>
            <Input
              id="invite-name"
              placeholder="John Doe"
              value={inviteData.name}
              onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select value={inviteData.role} onValueChange={(v) => setInviteData({ ...inviteData, role: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-message">Custom Message (Optional)</Label>
            <Textarea
              id="invite-message"
              placeholder="Add a personal message to the invitation..."
              value={inviteData.customMessage}
              onChange={(e) => setInviteData({ ...inviteData, customMessage: e.target.value })}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="send-email"
              checked={inviteData.sendEmail}
              onCheckedChange={(checked) => setInviteData({ ...inviteData, sendEmail: checked })}
            />
            <Label htmlFor="send-email" className="text-sm font-normal">
              Send invitation email immediately
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleInvite} disabled={!inviteData.email || !inviteData.role}>
            <Send className="h-4 w-4 mr-2" />
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Team & Access Component
export default function TeamAccess() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  const [users] = useState<User[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john@company.com',
      role: 'Administrator',
      status: 'active',
      lastActive: new Date('2024-01-20'),
      created: new Date('2023-01-15'),
      department: 'Engineering',
      permissions: ['full-access']
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      role: 'Editor',
      status: 'active',
      lastActive: new Date('2024-01-19'),
      created: new Date('2023-03-20'),
      department: 'Marketing',
      permissions: ['content-edit', 'analytics-view']
    },
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike@company.com',
      role: 'Viewer',
      status: 'pending',
      lastActive: new Date('2024-01-15'),
      created: new Date('2024-01-15'),
      department: 'Sales',
      permissions: ['content-view']
    }
  ]);

  const [roles] = useState<Role[]>([
    {
      id: '1',
      name: 'Administrator',
      description: 'Full access to all features and settings',
      permissions: [],
      userCount: 3,
      isSystem: true,
      color: '#8b5cf6'
    },
    {
      id: '2',
      name: 'Editor',
      description: 'Can create and manage content',
      permissions: [],
      userCount: 8,
      isSystem: true,
      color: '#3b82f6'
    },
    {
      id: '3',
      name: 'Moderator',
      description: 'Can moderate live streams and user content',
      permissions: [],
      userCount: 5,
      isSystem: false,
      color: '#10b981'
    },
    {
      id: '4',
      name: 'Viewer',
      description: 'Read-only access to content',
      permissions: [],
      userCount: 24,
      isSystem: true,
      color: '#6b7280'
    }
  ]);

  const [apiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production API',
      key: 'pk_live_abc123def456ghi789',
      created: new Date('2023-06-15'),
      lastUsed: new Date('2024-01-20'),
      expiresAt: null,
      permissions: ['streams:read', 'streams:write', 'analytics:read'],
      status: 'active',
      usage: {
        calls: 128453,
        lastCall: new Date('2024-01-20')
      }
    },
    {
      id: '2',
      name: 'Development API',
      key: 'pk_test_xyz987uvw654rst321',
      created: new Date('2023-12-01'),
      lastUsed: new Date('2024-01-18'),
      expiresAt: new Date('2024-02-01'),
      permissions: ['streams:read', 'analytics:read'],
      status: 'active',
      usage: {
        calls: 5672,
        lastCall: new Date('2024-01-18')
      }
    }
  ]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role.toLowerCase() === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team & Access</h1>
          <p className="text-muted-foreground">Manage users, roles, and API access</p>
        </div>
        <InviteUserDialog />
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => u.status === 'active').length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-xs text-muted-foreground">
              {roles.filter(r => !r.isSystem).length} custom
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiKeys.length}</div>
            <p className="text-xs text-muted-foreground">
              {apiKeys.filter(k => k.status === 'active').length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {apiKeys.reduce((sum, key) => sum + key.usage.calls, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="api">API Access</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="administrator">Administrator</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Users Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map(user => (
              <UserCard key={user.id} user={user} onEdit={() => {}} />
            ))}
          </div>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Define roles and permissions for your team
            </p>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map(role => (
              <RoleCard key={role.id} role={role} />
            ))}
          </div>

          {/* Permissions Reference */}
          <Card>
            <CardHeader>
              <CardTitle>Permission Categories</CardTitle>
              <CardDescription>
                Overview of available permissions by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="content">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Content Management
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between py-1">
                        <span>Create and upload content</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">content:create</code>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span>Edit existing content</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">content:edit</code>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span>Delete content</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">content:delete</code>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="streaming">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Live Streaming
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between py-1">
                        <span>Start live streams</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">streams:start</code>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span>Manage stream settings</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">streams:manage</code>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span>Moderate stream content</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">streams:moderate</code>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="analytics">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Analytics & Reports
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between py-1">
                        <span>View analytics dashboard</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">analytics:view</code>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span>Export reports</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">analytics:export</code>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Manage API keys for programmatic access
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate API Key
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Secure keys for accessing the BigfootLive API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name & Key</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map(apiKey => (
                    <APIKeyRow key={apiKey.id} apiKey={apiKey} />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* API Documentation */}
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>
                Quick reference for API integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Base URL</h4>
                <code className="text-sm bg-muted px-3 py-2 rounded block">
                  https://api.bigfootlive.io/v1
                </code>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Authentication</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Include your API key in the Authorization header:
                </p>
                <code className="text-sm bg-muted px-3 py-2 rounded block">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Example Request</h4>
                <pre className="text-sm bg-muted px-3 py-2 rounded overflow-x-auto">
{`curl -X GET https://api.bigfootlive.io/v1/streams \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                </pre>
              </div>
              <Button variant="outline" className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full API Documentation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}