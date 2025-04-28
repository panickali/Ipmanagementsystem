import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserCog, Shield, ShieldCheck, CheckCircle, AlertTriangle, UserPlus } from "lucide-react";

// Component for the AdminDashboard page
export default function AdminDashboard() {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('users');

  // Query to fetch all users
  const {
    data: users,
    isLoading: isLoadingUsers,
    refetch: refetchUsers
  } = useQuery<Omit<User, 'password'>[]>({
    queryKey: ['/api/admin/users'],
    enabled: isAdmin
  });

  // Mutation to update user permissions
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ userId, permissions }: { userId: number; permissions: Partial<User> }) => {
      const res = await apiRequest('PATCH', `/api/admin/users/${userId}/permissions`, permissions);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Permissions updated',
        description: 'User permissions have been successfully updated',
      });
      refetchUsers();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating permissions',
        description: error.message || 'Failed to update user permissions',
        variant: 'destructive',
      });
    },
  });

  // If the user is not admin, this page should not be accessible
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-center text-red-500">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You do not have permission to access this page
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Function to toggle user permissions
  const togglePermission = (userId: number, permission: keyof User, currentValue: boolean) => {
    // Only superadmin can toggle permissions for admin users
    const targetUser = users?.find(u => u.id === userId);
    if (!targetUser) return;

    // Only superadmin can modify admin/superadmin permissions
    if ((targetUser.role === 'admin' || targetUser.role === 'superadmin') && !isSuperAdmin) {
      toast({
        title: 'Permission denied',
        description: 'Only superadmins can modify admin permissions',
        variant: 'destructive',
      });
      return;
    }

    const permissionsToUpdate = {
      [permission]: !currentValue
    };

    updatePermissionsMutation.mutate({ userId, permissions: permissionsToUpdate });
  };

  // Function to render the user role badge
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Badge className="bg-red-500 hover:bg-red-600">Super Admin</Badge>;
      case 'admin':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Admin</Badge>;
      default:
        return <Badge>User</Badge>;
    }
  };

  // Render the users management tab
  const renderUsersTab = () => {
    if (isLoadingUsers) {
      return (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold">User Management</h2>
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add New User
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>High Priority</TableHead>
                  <TableHead>Verify Assets</TableHead>
                  <TableHead>Manage Users</TableHead>
                  <TableHead>Approve Transfers</TableHead>
                  <TableHead>Edit Access Rights</TableHead>
                  <TableHead>GDPR Level</TableHead>
                  <TableHead>Last Login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{renderRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <Switch 
                        checked={user.isHighPriority} 
                        disabled={updatePermissionsMutation.isPending || (user.role !== 'user' && !isSuperAdmin)}
                        onCheckedChange={() => togglePermission(user.id, 'isHighPriority', user.isHighPriority)} 
                      />
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={user.canVerifyAssets} 
                        disabled={updatePermissionsMutation.isPending || (user.role !== 'user' && !isSuperAdmin)}
                        onCheckedChange={() => togglePermission(user.id, 'canVerifyAssets', user.canVerifyAssets)} 
                      />
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={user.canManageUsers} 
                        disabled={updatePermissionsMutation.isPending || (user.role !== 'user' && !isSuperAdmin)}
                        onCheckedChange={() => togglePermission(user.id, 'canManageUsers', user.canManageUsers)} 
                      />
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={user.canApproveTransfers} 
                        disabled={updatePermissionsMutation.isPending || (user.role !== 'user' && !isSuperAdmin)}
                        onCheckedChange={() => togglePermission(user.id, 'canApproveTransfers', user.canApproveTransfers)} 
                      />
                    </TableCell>
                    <TableCell>
                      <Switch 
                        checked={user.canEditAccessRights} 
                        disabled={updatePermissionsMutation.isPending || (user.role !== 'user' && !isSuperAdmin)}
                        onCheckedChange={() => togglePermission(user.id, 'canEditAccessRights', user.canEditAccessRights)} 
                      />
                    </TableCell>
                    <TableCell>{user.gdprAccessLevel}</TableCell>
                    <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render the system stats tab
  const renderStatsTab = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">System Stats</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {users?.filter(u => u.role === 'admin' || u.role === 'superadmin').length || 0} administrators
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">High Priority Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users?.filter(u => u.isHighPriority).length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {((users?.filter(u => u.isHighPriority).length || 0) / (users?.length || 1) * 100).toFixed(1)}% of all users
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Users with Verification Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users?.filter(u => u.canVerifyAssets).length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Can approve or reject IP registrations
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Users with Transfer Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users?.filter(u => u.canApproveTransfers).length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Can approve ownership transfers
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, permissions, and system settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSuperAdmin ? (
            <Badge className="bg-red-500 text-white">Super Admin</Badge>
          ) : (
            <Badge className="bg-blue-500 text-white">Admin</Badge>
          )}
          <span className="text-sm font-medium">{user?.name}</span>
        </div>
      </div>

      <Tabs defaultValue="users" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            System Stats
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4 mt-6">
          {renderUsersTab()}
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-4 mt-6">
          {renderStatsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}