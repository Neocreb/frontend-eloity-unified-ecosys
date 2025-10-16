import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminService } from "@/services/adminService";
import { AdminUser, AdminRole, AdminActivityLog } from "@/types/admin";
import { useNotification } from "@/hooks/use-notification";
import {
  UserPlus,
  Shield,
  Trash2,
  Edit,
  MoreHorizontal,
  Crown,
  UserCheck,
  UserX,
  Clock,
  Activity,
  AlertTriangle,
  Key,
  Settings,
} from "lucide-react";

const AdminManagement = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);

  const notification = useNotification();

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setIsLoading(true);

      // Get current admin
      const adminData = localStorage.getItem("admin_user");
      if (adminData) {
        setCurrentAdmin(JSON.parse(adminData));
      }

      // Fetch admin users and activity
      const [users, activity] = await Promise.all([
        AdminService.getAllAdminUsers(),
        AdminService.getRecentActivity(100),
      ]);

      setAdminUsers(users);
      setActivityLogs(activity);
    } catch (error) {
      console.error("Error loading admin data:", error);
      notification.error("Failed to load admin data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async (formData: {
    email: string;
    roles: AdminRole[];
  }) => {
    try {
      if (!currentAdmin) {
        notification.error("You must be logged in as an admin");
        return;
      }

      const result = await AdminService.createAdminUser(
        formData.email,
        formData.roles,
        currentAdmin.id,
      );

      if (result.success) {
        notification.success("Admin user created successfully");
        setShowCreateDialog(false);
        initializeData();
      } else {
        notification.error(result.error || "Failed to create admin user");
      }
    } catch (error) {
      console.error("Error creating admin:", error);
      notification.error("Failed to create admin user");
    }
  };

  const handleRevokeRole = async (userId: string, role: AdminRole) => {
    try {
      if (!currentAdmin) return;

      await AdminService.revokeAdminRole(userId, role, currentAdmin.id);
      notification.success("Admin role revoked successfully");
      initializeData();
    } catch (error) {
      console.error("Error revoking role:", error);
      notification.error("Failed to revoke admin role");
    }
  };

  const getRoleColor = (role: AdminRole) => {
    const colors: Record<AdminRole, string> = {
      super_admin: "bg-red-500 text-white",
      content_admin: "bg-blue-500 text-white",
      user_admin: "bg-green-500 text-white",
      marketplace_admin: "bg-purple-500 text-white",
      crypto_admin: "bg-yellow-500 text-black",
      freelance_admin: "bg-orange-500 text-white",
      support_admin: "bg-gray-500 text-white",
    };
    return colors[role];
  };

  const getRoleDescription = (role: AdminRole) => {
    const descriptions: Record<AdminRole, string> = {
      super_admin: "Full platform access and control",
      content_admin: "Content moderation and management",
      user_admin: "User account management",
      marketplace_admin: "Marketplace oversight and control",
      crypto_admin: "Cryptocurrency trading oversight",
      freelance_admin: "Freelance platform management",
      support_admin: "Customer support access",
    };
    return descriptions[role];
  };

  const canManageAdmin = (targetAdmin: AdminUser) => {
    if (!currentAdmin) return false;

    // Super admins can manage everyone
    if (currentAdmin.roles.includes("super_admin")) return true;

    // Can't manage other super admins
    if (targetAdmin.roles.includes("super_admin")) return false;

    // Can't manage yourself
    if (targetAdmin.id === currentAdmin.id) return false;

    return true;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading admin management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage administrator accounts and permissions
          </p>
        </div>

        {currentAdmin?.roles.includes("super_admin") && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Create Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Administrator</DialogTitle>
                <DialogDescription>
                  Add a new administrator to the platform with specific roles
                  and permissions.
                </DialogDescription>
              </DialogHeader>
              <CreateAdminForm
                onSubmit={handleCreateAdmin}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="admins" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="admins">Administrator Accounts</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="admins" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Administrator Accounts ({adminUsers.length})
              </CardTitle>
              <CardDescription>
                Manage platform administrators and their access levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Administrator</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminUsers.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                              {admin.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{admin.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {admin.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {admin.roles.map((role) => (
                              <Badge
                                key={role}
                                className={`text-xs ${getRoleColor(role)}`}
                              >
                                {role.replace("_", " ")}
                                {role === "super_admin" && (
                                  <Crown className="w-3 h-3 ml-1" />
                                )}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>
                              {new Date(admin.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-gray-500">
                              {new Date(admin.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={admin.isActive ? "default" : "secondary"}
                          >
                            {admin.isActive ? (
                              <>
                                <UserCheck className="w-3 h-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <UserX className="w-3 h-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {canManageAdmin(admin) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => setSelectedAdmin(admin)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Roles
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {}}>
                                  <Key className="mr-2 h-4 w-4" />
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {}}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Deactivate
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries({
              super_admin: "Super Administrator",
              content_admin: "Content Administrator",
              user_admin: "User Administrator",
              marketplace_admin: "Marketplace Administrator",
              crypto_admin: "Crypto Administrator",
              freelance_admin: "Freelance Administrator",
              support_admin: "Support Administrator",
            }).map(([role, title]) => (
              <Card key={role} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div
                      className={`w-3 h-3 rounded-full ${getRoleColor(role as AdminRole).split(" ")[0]}`}
                    />
                    {title}
                  </CardTitle>
                  <CardDescription>
                    {getRoleDescription(role as AdminRole)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Active Admins
                      </span>
                      <Badge variant="outline">
                        {
                          adminUsers.filter(
                            (admin) =>
                              admin.roles.includes(role as AdminRole) &&
                              admin.isActive,
                          ).length
                        }
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      {adminUsers
                        .filter(
                          (admin) =>
                            admin.roles.includes(role as AdminRole) &&
                            admin.isActive,
                        )
                        .slice(0, 3)
                        .map((admin) => (
                          <div
                            key={admin.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium">
                              {admin.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate">{admin.name}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Administrator Activity Log
              </CardTitle>
              <CardDescription>
                Recent administrative actions and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLogs.slice(0, 20).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-blue-600">
                          {log.adminName}
                        </span>
                        <span className="text-gray-600">performed</span>
                        <Badge variant="outline" className="text-xs">
                          {log.action.replace("_", " ")}
                        </Badge>
                        <span className="text-gray-600">on</span>
                        <Badge variant="secondary" className="text-xs">
                          {log.targetType}
                        </Badge>
                      </div>

                      {log.details && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {JSON.stringify(log.details, null, 2)}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                        {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Create Admin Form Component
const CreateAdminForm = ({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: { email: string; roles: AdminRole[] }) => void;
  onCancel: () => void;
}) => {
  const [email, setEmail] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<AdminRole[]>([]);

  const availableRoles: {
    role: AdminRole;
    title: string;
    description: string;
  }[] = [
    {
      role: "content_admin",
      title: "Content Administrator",
      description: "Content moderation and management",
    },
    {
      role: "user_admin",
      title: "User Administrator",
      description: "User account management",
    },
    {
      role: "marketplace_admin",
      title: "Marketplace Administrator",
      description: "Marketplace oversight",
    },
    {
      role: "crypto_admin",
      title: "Crypto Administrator",
      description: "Cryptocurrency trading oversight",
    },
    {
      role: "freelance_admin",
      title: "Freelance Administrator",
      description: "Freelance platform management",
    },
    {
      role: "support_admin",
      title: "Support Administrator",
      description: "Customer support access",
    },
  ];

  const handleRoleChange = (role: AdminRole, checked: boolean) => {
    if (checked) {
      setSelectedRoles((prev) => [...prev, role]);
    } else {
      setSelectedRoles((prev) => prev.filter((r) => r !== role));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && selectedRoles.length > 0) {
      onSubmit({ email, roles: selectedRoles });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@eloity.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-4">
        <Label>Administrative Roles</Label>
        <div className="space-y-3">
          {availableRoles.map((roleInfo) => (
            <div
              key={roleInfo.role}
              className="flex items-start space-x-3 p-3 border rounded-lg"
            >
              <Checkbox
                id={roleInfo.role}
                checked={selectedRoles.includes(roleInfo.role)}
                onCheckedChange={(checked) =>
                  handleRoleChange(roleInfo.role, !!checked)
                }
              />
              <div className="flex-1">
                <Label
                  htmlFor={roleInfo.role}
                  className="font-medium cursor-pointer"
                >
                  {roleInfo.title}
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {roleInfo.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!email || selectedRoles.length === 0}>
          Create Administrator
        </Button>
      </div>
    </form>
  );
};

export default AdminManagement;
