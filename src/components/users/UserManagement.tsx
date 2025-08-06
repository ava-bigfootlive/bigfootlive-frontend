import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Ban, 
  CheckCircle, 
  XCircle,
  Mail,
  Download,
  Upload,
  UserPlus,
  Shield,
  Eye,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  UserListResponse, 
  CreateUserRequest, 
  UserSearchFilters, 
  SYSTEM_ROLES 
} from '@/types/user';
import { apiService } from '@/services/api';
import { UserProfile } from './UserProfile';

interface UserManagementProps {
  className?: string;
}

export const UserManagement: React.FC<UserManagementProps> = ({ className = "" }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<UserSearchFilters>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false
  });
  
  // Dialog states
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isInviteUsersOpen, setIsInviteUsersOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  
  // Create user form
  const [createForm, setCreateForm] = useState<CreateUserRequest>({
    username: '',
    email: '',
    displayName: '',
    sendInvite: true
  });

  // Bulk invite form
  const [inviteEmails, setInviteEmails] = useState('');

  useEffect(() => {
    loadUsers();
  }, [searchQuery, filters, pagination.page]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getUsers({
        query: searchQuery,
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });

      if (response.success) {
        setUsers(response.data.users);
        setPagination({
          ...pagination,
          total: response.data.total,
          hasMore: response.data.hasMore
        });
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await apiService.createUser(createForm);
      if (response.success) {
        await loadUsers();
        setCreateForm({
          username: '',
          email: '',
          displayName: '',
          sendInvite: true
        });
        setIsCreateUserOpen(false);
      }
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleBulkInvite = async () => {
    const emails = inviteEmails
      .split('\n')
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));

    try {
      const response = await apiService.bulkInviteUsers(emails);
      if (response.success) {
        await loadUsers();
        setInviteEmails('');
        setIsInviteUsersOpen(false);
      }
    } catch (error) {
      console.error('Failed to invite users:', error);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      let response;
      switch (action) {
        case 'activate':
          response = await apiService.updateUser(userId, { status: 'active' });
          break;
        case 'deactivate':
          response = await apiService.updateUser(userId, { status: 'inactive' });
          break;
        case 'suspend':
          response = await apiService.updateUser(userId, { status: 'suspended' });
          break;
        case 'delete':
          response = await apiService.deleteUser(userId);
          break;
        default:
          return;
      }

      if (response.success) {
        await loadUsers();
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    }
  };

  const handleBulkAction = async (action: string) => {
    const userIds = Array.from(selectedUsers);
    if (userIds.length === 0) return;

    try {
      const response = await apiService.bulkUpdateUsers(userIds, { action });
      if (response.success) {
        await loadUsers();
        setSelectedUsers(new Set());
      }
    } catch (error) {
      console.error(`Failed to perform bulk ${action}:`, error);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const toggleAllUsers = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(user => user.id)));
    }
  };

  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.displayName.slice(0, 2).toUpperCase();
  };

  const getStatusColor = (status: User['status']) => {
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
      case 'super_admin': return 'destructive';
      case 'admin': return 'default';
      case 'moderator': return 'secondary';
      case 'streamer': return 'outline';
      default: return 'outline';
    }
  };

  const exportUsers = async () => {
    try {
      const response = await apiService.exportUsers({ ...filters, query: searchQuery });
      if (response.success) {
        // Download CSV file
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export users:', error);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions across your organization
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportUsers}>
            <Download size={16} className="mr-2" />
            Export
          </Button>
          
          <Dialog open={isInviteUsersOpen} onOpenChange={setIsInviteUsersOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Mail size={16} className="mr-2" />
                Bulk Invite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Users</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Email Addresses (one per line)</Label>
                  <textarea
                    className="w-full h-32 p-3 border rounded-md resize-none"
                    placeholder="user1@company.com&#10;user2@company.com&#10;user3@company.com"
                    value={inviteEmails}
                    onChange={(e) => setInviteEmails(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsInviteUsersOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleBulkInvite}>
                    Send Invites
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Username</Label>
                    <Input
                      value={createForm.username}
                      onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                      placeholder="johndoe"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      placeholder="john@company.com"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Display Name</Label>
                  <Input
                    value={createForm.displayName}
                    onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={createForm.firstName || ''}
                      onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={createForm.lastName || ''}
                      onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Job Title</Label>
                    <Input
                      value={createForm.title || ''}
                      onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div>
                    <Label>Department</Label>
                    <Input
                      value={createForm.department || ''}
                      onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                      placeholder="Engineering"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={createForm.sendInvite}
                    onCheckedChange={(checked) => setCreateForm({ ...createForm, sendInvite: !!checked })}
                  />
                  <Label>Send invitation email</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateUser}>
                    Create User
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, email, or username..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Select
              value={filters.status?.[0] || 'all'}
              onValueChange={(value) => 
                setFilters({ 
                  ...filters, 
                  status: value === 'all' ? undefined : [value as User['status']]
                })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.roles?.[0] || 'all'}
              onValueChange={(value) => 
                setFilters({ 
                  ...filters, 
                  roles: value === 'all' ? undefined : [value]
                })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="streamer">Streamer</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedUsers.size === users.length}
                  onCheckedChange={toggleAllUsers}
                />
                <span className="text-sm">
                  {selectedUsers.size} of {users.length} users selected
                </span>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                >
                  <CheckCircle size={16} className="mr-2" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('deactivate')}
                >
                  <XCircle size={16} className="mr-2" />
                  Deactivate
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUsers.size === users.length && users.length > 0}
                      onCheckedChange={toggleAllUsers}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.has(user.id)}
                        onCheckedChange={() => toggleUserSelection(user.id)}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{getInitials(user)}</AvatarFallback>
                          </Avatar>
                          <div 
                            className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(user.status)}`}
                          />
                        </div>
                        <div>
                          <div className="font-medium">{user.displayName}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge 
                        variant={user.status === 'active' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.slice(0, 2).map((role) => (
                          <Badge 
                            key={role.id} 
                            variant={getRoleBadgeColor(role.name)}
                            className="text-xs"
                          >
                            {role.displayName}
                          </Badge>
                        ))}
                        {user.roles.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.roles.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm">
                        {user.department || 'Not set'}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm">
                        {user.lastLogin 
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setIsUserProfileOpen(true);
                            }}
                          >
                            <Eye size={16} className="mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit size={16} className="mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield size={16} className="mr-2" />
                            Manage Roles
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status === 'active' ? (
                            <DropdownMenuItem
                              onClick={() => handleUserAction(user.id, 'deactivate')}
                            >
                              <XCircle size={16} className="mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleUserAction(user.id, 'activate')}
                            >
                              <CheckCircle size={16} className="mr-2" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleUserAction(user.id, 'suspend')}
                          >
                            <Ban size={16} className="mr-2" />
                            Suspend
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleUserAction(user.id, 'delete')}
                          >
                            <Trash2 size={16} className="mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No users found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchQuery || Object.keys(filters).length > 0
                          ? 'Try adjusting your search or filters'
                          : 'Get started by creating your first user'
                        }
                      </p>
                      {!searchQuery && Object.keys(filters).length === 0 && (
                        <Button onClick={() => setIsCreateUserOpen(true)}>
                          <Plus size={16} className="mr-2" />
                          Add User
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          
          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                      className={pagination.page === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {[...Array(Math.ceil(pagination.total / pagination.limit))].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        onClick={() => setPagination({ ...pagination, page: i + 1 })}
                        isActive={pagination.page === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                      className={!pagination.hasMore ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Profile Dialog */}
      <Dialog open={isUserProfileOpen} onOpenChange={setIsUserProfileOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserProfile
              user={selectedUser}
              onUserUpdate={(updatedUser) => {
                setUsers(users.map(user => 
                  user.id === updatedUser.id ? updatedUser : user
                ));
                setSelectedUser(updatedUser);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
